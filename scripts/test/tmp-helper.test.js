/**
 * Pins `rmTree` (#791): the retry re-invokes the whole recursive removal, gives up after the
 * configured attempts, and never retries an error that does not mean "not removable yet".
 *
 * The race that produced the CI failure cannot be staged deterministically — it needs another
 * process to create an entry between the walk and the final `rmdir`, and no hook exists at that
 * point — so the retry LOGIC is pinned here through the injectable `rm` and `sleep`, and the race
 * is measured separately (`tests/results/2026-09-07-rmsync-enotempty-probe/`). A test that only
 * sometimes reproduces the flake would be the flake in a new coat.
 *
 * The last test is the guard: no suite in this directory may tear down with a bare recursive
 * `rmSync` again. It scans the whole file text, not line by line, so a call whose options sit on
 * the next line is still an offender. Proven able to fail with `npm run mutation-check` — revert
 * any one site from `rmTree(dir)` to the bare recursive call and this test names it. (This
 * comment cannot spell that call out: the guard scans this file too, and its first draft named
 * itself as the offender.)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree, sleepSync, RETRYABLE, DEFAULT_ATTEMPTS, DEFAULT_DELAY_MS } from './_tmp.js';

const TEST_DIR = resolve(dirname(fileURLToPath(import.meta.url)));

/** An `rm` stub that throws `codes[i]` on call i and succeeds once the list is exhausted. */
function removalThatFails(codes) {
  const calls = [];
  const rm = (dir, opts) => {
    calls.push({ dir, opts });
    const code = codes[calls.length - 1];
    if (code) {
      const error = new Error(`stub: ${code}`);
      error.code = code;
      throw error;
    }
  };
  return { rm, calls };
}

const noSleep = () => {};
const mustNotSleep = () => { throw new Error('rmTree slept when it should not have'); };

test('a removal that works first time returns 1 and neither sleeps nor retries', () => {
  const { rm, calls } = removalThatFails([]);
  assert.equal(rmTree('/fixture', { rm, sleep: mustNotSleep }), 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].dir, '/fixture');
});

test('ENOTEMPTY re-invokes the WHOLE recursive removal with linear backoff, and reports the attempt that succeeded', () => {
  const { rm, calls } = removalThatFails(['ENOTEMPTY', 'ENOTEMPTY']);
  const slept = [];
  const attempt = rmTree('/fixture', { rm, sleep: (ms) => slept.push(ms), delayMs: 10 });
  assert.equal(attempt, 3);
  assert.equal(calls.length, 3);
  assert.deepEqual(slept, [10, 20]);
  // Every retry is a full recursive removal — the property Node 22's `maxRetries` lacks.
  for (const call of calls) assert.deepEqual(call.opts, { recursive: true, force: true });
});

test('gives up after `attempts` tries and rethrows the last error', () => {
  const { rm, calls } = removalThatFails(Array(10).fill('ENOTEMPTY'));
  assert.throws(() => rmTree('/fixture', { rm, sleep: noSleep, attempts: 4 }), { code: 'ENOTEMPTY' });
  assert.equal(calls.length, 4);
});

test('the defaults retry, and the attempt count is the default', () => {
  const { rm, calls } = removalThatFails(Array(DEFAULT_ATTEMPTS + 3).fill('EBUSY'));
  const slept = [];
  assert.throws(() => rmTree('/fixture', { rm, sleep: (ms) => slept.push(ms) }), { code: 'EBUSY' });
  assert.equal(calls.length, DEFAULT_ATTEMPTS);
  assert.deepEqual(slept, Array.from({ length: DEFAULT_ATTEMPTS - 1 }, (_, i) => (i + 1) * DEFAULT_DELAY_MS));
});

test('an error outside the retryable set is thrown on the first attempt, with no sleep', () => {
  const { rm, calls } = removalThatFails(['EACCES']);
  assert.throws(() => rmTree('/fixture', { rm, sleep: mustNotSleep }), { code: 'EACCES' });
  assert.equal(calls.length, 1);
});

test('an error with no code is not retried either', () => {
  const rm = () => { throw new TypeError('not an fs error'); };
  assert.throws(() => rmTree('/fixture', { rm, sleep: mustNotSleep }), TypeError);
});

test('the retryable set is exactly the three "not removable yet" codes, and each of them retries', () => {
  assert.deepEqual([...RETRYABLE].sort(), ['EBUSY', 'ENOTEMPTY', 'EPERM']);
  for (const code of RETRYABLE) {
    const { rm, calls } = removalThatFails([code]);
    assert.equal(rmTree('/fixture', { rm, sleep: noSleep }), 2, code);
    assert.equal(calls.length, 2, code);
  }
});

test('sleepSync blocks the thread for at least the requested time', () => {
  const started = process.hrtime.bigint();
  sleepSync(20);
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  assert.ok(elapsedMs >= 19, `slept ${elapsedMs.toFixed(1)} ms, expected >= 20`);
});

test('no suite tears down with a bare recursive rmSync — the guard behind #791', () => {
  const offenders = [];
  const pattern = /\brmSync\s*\([^)]*recursive\s*:\s*true/g;
  for (const name of readdirSync(TEST_DIR).filter((n) => n.endsWith('.test.js')).sort()) {
    const text = readFileSync(join(TEST_DIR, name), 'utf8');
    for (const match of text.matchAll(pattern)) {
      const line = text.slice(0, match.index).split('\n').length;
      offenders.push(`${name}:${line}: ${match[0]}`);
    }
  }
  assert.deepEqual(offenders, [], `recursive rmSync in a test: use rmTree() from ./_tmp.js instead\n${offenders.join('\n')}`);
});
