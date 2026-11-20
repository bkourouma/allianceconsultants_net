import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const SITE_KIND = 'alliance';
const ROOT_SOURCE = 'src/app/api/lead/route.ts';
function scenario({ failure = false, noWebhook = false } = {}) {
  const calls = { prepared: [], confirmed: [] };
  const env = { N8N_WEBHOOK_URL: noWebhook ? '' : 'https://upstream.invalid', LEADS_TO_EMAIL: 'test@example.test', LEADS_FROM_EMAIL: 'test@example.test' };
  const helper = { prepareBusinessSubmission: async input => { calls.prepared.push(input); return 'ticket'; }, confirmBusinessSubmission: async (...args) => { calls.confirmed.push(args); return true; }, submissionDevice: () => 'MOBILE' };
  class NextResponse extends Response { static json(body, options) { return Response.json(body, options); } }
  class DispatchError extends Error {}
  const exportsByPath = new Map();
  const load = path => {
    if (exportsByPath.has(path)) return exportsByPath.get(path);
    const module = { exports: {} }; exportsByPath.set(path, module.exports);
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const require = name => {
      if (name.endsWith('/seo-business-outbox.mjs')) return helper;
      if (name === 'next/server') return { NextResponse };
      if (name === 'bcryptjs') return { hash: async () => 'test-hash' };
      if (name === '@/lib/validators/lead') return { LeadInputSchema: { safeParse: data => ({ success: true, data: { intent: 'demo', ...data } }) } };
      if (name === '@/lib/prisma') return { prisma: { lead: { create: async () => { if (failure) throw new Error('isolated persistence failure'); return { id: 'durable-test-lead' }; } } } };
      if (name === '@/lib/mailer') return { sendLeadNotification: async () => undefined };
      if (name === '@/lib/public-request') return { redirectToPath: () => new Response(null, { status: 303 }) };
      if (name === '@/lib/site') return { contact: { email: 'test@example.test' } };
      if (name === '@/lib/leads/lead.schema') return { LeadSubmissionSchema: { parse: data => data } };
      if (name === '@/lib/leads/handler') return load('lib/leads/handler.ts');
      if (name === '@/lib/leads/rate-limit') return { checkRateLimit: () => ({ allowed: true }), getClientIp: () => 'isolated' };
      if (name === '@/lib/leads/sinks') return { LeadDispatchError: DispatchError };
      if (name.endsWith('/resend.sink')) return { ResendLeadSink: class { critical = true; async handle() { if (failure) throw new Error('isolated sink failure'); } } };
      if (name.endsWith('/log.sink')) return { LogLeadSink: class { critical = false; async handle() {} } };
      if (name === 'zod') return { ZodError: class extends Error {} };
      throw new Error(`Unexpected import in isolated handler test: ${name}`);
    };
    vm.runInNewContext(compiled, { module, exports: module.exports, require, Request, Response, Headers, AbortSignal, Buffer, process: { env }, console: { warn() {}, error() {} }, fetch: async () => new Response(null, { status: failure ? 502 : 200 }) });
    return module.exports;
  };
  return { calls, handler: load(ROOT_SOURCE) };
}
const body = { structure: 'test', volume: 'test', need: 'test', role: 'test', name: 'Test', company: 'Test', email: 'test@example.test', phone: '0102030405', sourcePage: '/demonstration', locale: 'en', consent: true };
const request = input => new Request('https://site.example.test/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json', 'user-agent': 'isolated mobile' }, body: JSON.stringify(input) });
test('a real successful sink confirms exactly one non-personal submission measurement', async () => {
  const { calls, handler } = scenario(); const response = await handler.POST(request(body));
  assert.equal(response.status, 200); assert.equal(calls.confirmed.length, 1); assert.equal(calls.prepared.length, 1);
  assert.ok(!JSON.stringify(calls.prepared).includes('test@example.test')); assert.ok(!JSON.stringify(calls.prepared).includes('0102030405'));
});
test('a honeypot success response creates no measurement', async () => {
  const { calls, handler } = scenario(); const response = await handler.POST(request({ ...body, website: 'bot', honeypot: 'bot' }));
  assert.ok([200, 204].includes(response.status)); assert.equal(calls.confirmed.length, 0); assert.equal(calls.prepared.length, 0);
});
test('a failed persistence or critical sink never confirms a conversion', async () => {
  const { calls, handler } = scenario({ failure: true }); const response = await handler.POST(request(body));
  assert.ok(response.status >= 500); assert.equal(calls.confirmed.length, 0);
});
if (SITE_KIND === 'immo') test('forwarded:false is not a transmitted submission', async () => {
  const { calls, handler } = scenario({ noWebhook: true }); const response = await handler.POST(request(body));
  assert.equal((await response.json()).forwarded, false); assert.equal(calls.prepared.length, 0); assert.equal(calls.confirmed.length, 0);
});
