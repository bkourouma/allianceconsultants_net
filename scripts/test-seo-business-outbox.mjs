import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBusinessOutbox, submissionDevice, submissionDimensions } from '../src/lib/seo-business-outbox.mjs';

const token = 't'.repeat(43);
const at = new Date('2026-11-20T12:00:00Z');
async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), 'seo-outbox-'));
  try { await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}
test('preparation alone never creates a conversion; failed primary sinks can abandon safely', () => fixture(async directory => {
  let calls = 0;
  const outbox = createBusinessOutbox({ directory, sourceId: 'source-123', token, now: () => at, fetch: async () => { calls++; return Response.json({ accepted: 1, duplicates: 0 }); } });
  const ticket = await outbox.prepare({ pagePath: '/demo', language: 'fr' });
  await outbox.flush(); assert.equal(calls, 0); assert.equal((await outbox.status()).unconfirmed, 1);
  await outbox.abandon(ticket); assert.equal((await outbox.status()).unconfirmed, 0);
}));
test('confirmed events survive a failed delivery and restart; duplicate acknowledgement is accepted', () => fixture(async directory => {
  const outbox = createBusinessOutbox({ directory, sourceId: 'source-123', token, now: () => at, fetch: async () => { throw new Error('private token secret upstream'); } });
  const ticket = await outbox.prepare({ pagePath: '/demo', language: 'fr', device: 'MOBILE', email: 'never-store@example.test' });
  assert.equal(await outbox.confirm(ticket, 'durable-lead-reference'), true);
  await outbox.flush(); assert.equal((await outbox.status()).pending, 1);
  const data = await Promise.all((await readdir(directory)).filter(p => p.endsWith('.json')).map(p => readFile(join(directory, p), 'utf8')));
  assert.ok(data.every(s => !s.includes('never-store') && !s.includes('durable-lead-reference') && !s.includes('secret upstream') && !s.includes(token)));
  let received;
  const restarted = createBusinessOutbox({ directory, sourceId: 'source-123', token, now: () => at, fetch: async (url, options) => {
    assert.equal(url, 'https://dashboard.allianceconsultants.net/api/ingest/seo-business/source-123'); assert.equal(options.redirect, 'error');
    received = JSON.parse(options.body); assert.equal(received.coverage, undefined);
    return Response.json({ accepted: 0, duplicates: 1 });
  } });
  assert.equal((await restarted.flush()).sent, 1); assert.equal((await restarted.status()).pending, 0);
  assert.deepEqual(Object.keys(received.events[0]).sort(), ['at', 'device', 'eventId', 'language', 'pagePath']);
  assert.equal((await restarted.status()).coverage, 'NOT_ASSERTED');
}));
test('partial or false HTTP200 acknowledgement never deletes persisted events', () => fixture(async directory => {
  const outbox = createBusinessOutbox({ directory, sourceId: 'source-123', token, now: () => at, fetch: async () => Response.json({ ok: true }) });
  await outbox.confirm(await outbox.prepare(), 'id'); await outbox.flush();
  assert.equal((await outbox.status()).pending, 1); assert.equal((await outbox.status()).state, 'DELIVERY_FAILED');
}));
test('request fields never become stored PII, invented location or query parameters', () => {
  assert.deepEqual(submissionDimensions({ pagePath: '/?email=person', language: 'fr', device: 'MOBILE', country: 'ci', email: 'person' }), { language: 'fr', device: 'MOBILE' });
  assert.equal(submissionDevice('Mozilla/5.0 iPhone Mobile'), 'MOBILE'); assert.equal(submissionDevice('unknown'), undefined);
});
test('rotating to a different source never replays the old scoped outbox', () => fixture(async directory => {
  const original = createBusinessOutbox({ directory, sourceId: 'source-123', token, now: () => at });
  await original.confirm(await original.prepare(), 'one');
  let calls = 0;
  const replacement = createBusinessOutbox({ directory, sourceId: 'source-456', token, now: () => at, fetch: async () => { calls++; return Response.json({ accepted: 1, duplicates: 0 }); } });
  await replacement.flush(); assert.equal(calls, 0); assert.equal((await replacement.status()).quarantined, 1);
}));
test('two processes share an exclusive delivery lease', () => fixture(async directory => {
  let calls = 0;
  const options = { directory, sourceId: 'source-123', token, now: () => at, fetch: async () => { calls++; await new Promise(resolve => setTimeout(resolve, 30)); return Response.json({ accepted: 1, duplicates: 0 }); } };
  const first = createBusinessOutbox(options); const second = createBusinessOutbox(options);
  await first.confirm(await first.prepare(), 'one');
  await Promise.all([first.flush(), second.flush()]); assert.equal(calls, 1); assert.equal((await first.status()).pending, 0);
}));
