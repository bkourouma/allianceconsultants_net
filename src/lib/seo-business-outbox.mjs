import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { link, mkdir, open, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

const INGEST_ORIGIN = 'https://dashboard.allianceconsultants.net';
const MAX_FILES = 10_000;
const BATCH = 25;
const digest = (value) => createHash('sha256').update(value).digest('hex');

/** Only allowlisted, non-personal measurement fields enter the durable outbox. */
export function submissionDimensions({ pagePath, language, device } = {}) {
  const result = {};
  if (typeof pagePath === 'string' && pagePath.startsWith('/') && !pagePath.startsWith('//') && pagePath.length <= 1000 && !/[?#\\\u0000-\u0020]/.test(pagePath)) result.pagePath = pagePath;
  if (typeof language === 'string' && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(language)) result.language = language.toLowerCase();
  if (['MOBILE', 'DESKTOP', 'TABLET'].includes(device)) result.device = device;
  return result;
}

/** Device class is derived transiently; the user-agent itself is never retained. */
export function submissionDevice(userAgent) {
  if (typeof userAgent !== 'string' || !userAgent) return undefined;
  if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent)) return 'TABLET';
  if (/mobile|iphone|ipod/i.test(userAgent)) return 'MOBILE';
  return /mozilla|chrome|safari|firefox|edge/i.test(userAgent) ? 'DESKTOP' : undefined;
}

export function createBusinessOutbox({ directory, sourceId, token, fetch: send = fetch, now = () => new Date() }) {
  if (!isAbsolute(directory) || !/^[a-zA-Z0-9_-]{8,100}$/.test(sourceId) || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Invalid server-side business measurement configuration');
  let busy = false;
  const safeLog = () => console.error('[seo-business] Durable measurement delivery unavailable; inspect the protected outbox status.');
  async function ensure() { await mkdir(directory, { recursive: true, mode: 0o700 }); }
  async function state(patch) {
    const file = join(directory, 'status.json');
    let previous = {}; try { previous = JSON.parse(await readFile(file, 'utf8')); } catch { /* first use */ }
    const temporary = join(directory, `status-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ ...previous, ...patch }), { mode: 0o600 }); await rename(temporary, file);
  }
  async function prepare(dimensions = {}) {
    try {
      await ensure();
      const files = await readdir(directory);
      if (files.filter(f => /^(?:pending-)?[a-f0-9]{64}\.json(?:\.quarantined)?$/.test(f)).length >= MAX_FILES) throw new Error('Outbox full');
      const ticket = digest(randomUUID());
      const event = { sourceId, eventId: randomUUID(), at: now().toISOString(), ...submissionDimensions(dimensions) };
      const handle = await open(join(directory, `pending-${ticket}.json`), 'wx', 0o600);
      try { await handle.writeFile(JSON.stringify(event)); await handle.sync(); } finally { await handle.close(); }
      return ticket;
    } catch { safeLog(); return null; }
  }
  async function confirm(ticket, durableEventId) {
    if (!ticket || !/^[a-f0-9]{64}$/.test(ticket)) return false;
    try {
      const pending = join(directory, `pending-${ticket}.json`);
      const prepared = JSON.parse(await readFile(pending, 'utf8'));
      if (prepared.sourceId !== sourceId) throw new Error('Outbox belongs to another source');
      const id = typeof durableEventId === 'string' && durableEventId.length > 0 && durableEventId.length <= 200 ? durableEventId : prepared.eventId;
      // Hash the site's identifier too: no customer-facing reference leaves the site.
      const event = { sourceId, eventId: digest(id), at: prepared.at, ...submissionDimensions(prepared) };
      const target = join(directory, `${digest(event.eventId)}.json`);
      const temporary = join(directory, `event-${randomUUID()}.tmp`);
      const handle = await open(temporary, 'wx', 0o600);
      try { await handle.writeFile(JSON.stringify(event)); await handle.sync(); } finally { await handle.close(); }
      try {
        await link(temporary, target);
      } catch (error) { if (error.code !== 'EEXIST') throw error; }
      finally { await unlink(temporary).catch(() => undefined); }
      await unlink(pending);
      return true;
    } catch { safeLog(); return false; }
  }
  async function abandon(ticket) {
    if (!ticket || !/^[a-f0-9]{64}$/.test(ticket)) return;
    await unlink(join(directory, `pending-${ticket}.json`)).catch(() => undefined);
  }
  async function flush() {
    if (busy) return { sent: 0 };
    busy = true;
    let owner; const lock = join(directory, 'delivery.lock');
    try {
      await ensure(); owner = randomUUID();
      try {
        const existing = await stat(lock);
        if (now().getTime() - existing.mtimeMs > 30_000) await unlink(lock);
      } catch { /* absent lock */ }
      try { await writeFile(lock, owner, { flag: 'wx', mode: 0o600 }); } catch { owner = undefined; return { sent: 0 }; }
      const paths = (await readdir(directory)).filter(f => /^[a-f0-9]{64}\.json$/.test(f)).sort().slice(0, BATCH);
      if (!paths.length) { await state({ lastCheckedAt: now().toISOString(), state: 'IDLE' }); return { sent: 0 }; }
      const events = []; const acknowledgedPaths = [];
      for (const path of paths) {
        try {
          const raw = JSON.parse(await readFile(join(directory, path), 'utf8'));
          const age = now().getTime() - Date.parse(raw.at);
          if (raw.sourceId !== sourceId || !/^[a-f0-9]{64}$/.test(raw.eventId) || !Number.isFinite(age) || age < -60_000 || age > 90 * 86400_000) throw new Error('Event requires reconciliation');
          events.push({ eventId: raw.eventId, at: raw.at, ...submissionDimensions(raw) }); acknowledgedPaths.push(path);
        } catch { await rename(join(directory, path), join(directory, `${path}.quarantined`)); }
      }
      if (!events.length) { await state({ state: 'RECONCILIATION_REQUIRED', lastError: 'Expired, invalid or differently scoped events quarantined; no replay.' }); return { sent: 0 }; }
      await state({ lastAttemptAt: now().toISOString(), state: 'DELIVERING' });
      const response = await send(`${INGEST_ORIGIN}/api/ingest/seo-business/${sourceId}`, { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ events }), signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('No acknowledgement');
      const receipt = await response.json();
      if (!Number.isSafeInteger(receipt.accepted) || !Number.isSafeInteger(receipt.duplicates) || receipt.accepted < 0 || receipt.duplicates < 0 || receipt.accepted + receipt.duplicates !== events.length) throw new Error('Incomplete acknowledgement');
      for (const path of acknowledgedPaths) await unlink(join(directory, path));
      await state({ lastAcknowledgedAt: now().toISOString(), state: 'ACKNOWLEDGED', lastError: null });
      return { sent: events.length };
    } catch {
      await state({ state: 'DELIVERY_FAILED', lastError: 'Remote acknowledgement unavailable; persisted events retained.' }).catch(() => undefined);
      safeLog(); return { sent: 0 };
    } finally {
      if (owner && await readFile(lock, 'utf8').catch(() => null) === owner) await unlink(lock).catch(() => undefined);
      busy = false;
    }
  }
  async function status() {
    try {
      await ensure(); const files = await readdir(directory);
      const saved = JSON.parse(await readFile(join(directory, 'status.json'), 'utf8').catch(() => '{}'));
      return { configured: true, pending: files.filter(f => /^[a-f0-9]{64}\.json$/.test(f)).length, unconfirmed: files.filter(f => /^pending-[a-f0-9]{64}\.json$/.test(f)).length, quarantined: files.filter(f => /^[a-f0-9]{64}\.json\.quarantined$/.test(f)).length, ...saved, coverage: 'NOT_ASSERTED' };
    } catch { return { configured: true, state: 'STORAGE_UNAVAILABLE', coverage: 'NOT_ASSERTED' }; }
  }
  return { prepare, confirm, abandon, flush, status };
}

const runtimeKey = Symbol.for('mission-control.business-outbox');
function runtimeClient() {
  if (globalThis[runtimeKey]?.client) return globalThis[runtimeKey].client;
  const directory = process.env.MC_SEO_BUSINESS_OUTBOX_DIR;
  const sourceId = process.env.MC_SEO_BUSINESS_SOURCE_ID;
  const token = process.env.MC_SEO_BUSINESS_TOKEN;
  if (!directory || !sourceId || !token) return null;
  try { const client = createBusinessOutbox({ directory, sourceId, token }); globalThis[runtimeKey] = { client }; return client; } catch { return null; }
}
export function startBusinessOutbox() {
  const client = runtimeClient(); if (!client || globalThis[runtimeKey].timer) return;
  globalThis[runtimeKey].timer = setInterval(() => void client.flush(), 60_000);
  globalThis[runtimeKey].timer.unref(); void client.flush();
}
export async function prepareBusinessSubmission(dimensions) { return runtimeClient()?.prepare(dimensions) ?? null; }
export async function confirmBusinessSubmission(ticket, eventId) { return runtimeClient()?.confirm(ticket, eventId) ?? false; }
export async function abandonBusinessSubmission(ticket) { await runtimeClient()?.abandon(ticket); }
export async function businessOutboxStatus(authorization) {
  const token = process.env.MC_SEO_BUSINESS_TOKEN;
  if (!token || typeof authorization !== 'string') return null;
  const expected = Buffer.from(`Bearer ${token}`); const supplied = Buffer.from(authorization);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  return runtimeClient()?.status() ?? { configured: false, state: 'NOT_CONFIGURED' };
}
