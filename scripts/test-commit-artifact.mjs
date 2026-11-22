// Check the compiled artifact, including a runtime attempt to relabel it.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const expected = process.env.APP_COMMIT_SHA;
assert.match(expected ?? '', /^[0-9a-f]{40}$/, 'APP_COMMIT_SHA must identify the build');
const manifest = JSON.parse(await readFile('.next/routes-manifest.json', 'utf8'));
const shaHeaders = manifest.headers.flatMap((rule) => rule.headers)
  .filter((header) => header.key.toLowerCase() === 'x-commit-sha');
assert.deepEqual(shaHeaders, [{ key: 'x-commit-sha', value: expected }]);

const portServer = createServer();
await new Promise((resolve, reject) => portServer.once('error', reject).listen(0, '127.0.0.1', resolve));
const port = portServer.address().port;
await new Promise((resolve) => portServer.close(resolve));
const runtimeSha = expected === 'b'.repeat(40) ? 'c'.repeat(40) : 'b'.repeat(40);
const child = spawn(process.execPath, ['.next/standalone/server.js'], {
  env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', APP_COMMIT_SHA: runtimeSha },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => { output = (output + data).slice(-8192); });
try {
  let response;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error(`Standalone server exited: ${output}`);
    try {
      response = await fetch(`http://127.0.0.1:${port}/robots.txt`, { redirect: 'error', signal: AbortSignal.timeout(2000) });
      if (response.ok) break;
    } catch { /* Server startup is bounded below. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.equal(response?.status, 200, output);
  assert.equal(response.headers.get('x-commit-sha'), expected, 'Runtime must not rewrite the build SHA');
  console.log(`Compiled artifact and standalone HTTP attest ${expected}; runtime override ignored.`);
} finally {
  if (child.exitCode === null) {
    child.kill();
    await new Promise((resolve) => child.once('exit', resolve));
  }
}
