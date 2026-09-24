/**
 * Pins `rmTree` (#791): the retry re-invokes the whole recursive removal, gives up after the
 * configured attempts, never retries an error that does not mean "not removable yet", passes
 * `force` through, and its defaults are the literals the probe measured (5 tries, 50 ms unit —
 * pinned as literals, because a test that derives its expectation from the same symbol it checks
 * cannot see the symbol change).
 *
 * The race that produced the CI failure cannot be staged deterministically — it needs another
 * process to create an entry between the walk and the final `rmdir`, and no hook exists at that
 * point — so the retry LOGIC is pinned here through the injectable `rm` and `sleep`, and the race
 * is measured separately (`tests/results/2026-09-07-rmsync-enotempty-probe/`). A test that only
 * sometimes reproduces the flake would be the flake in a new coat.
 *
 * The last two tests are the guard: no suite under this directory may tear down with a bare
 * recursive `rmSync` again. The scanner (`bareRecursiveRmSyncCalls` in `_tmp.js`) counts
 * parentheses, so `join(tmpdir(), 'x')` or any deeper nesting inside the call is walked through
 * — the review of this file's first two versions found a nesting limit in each regex they used
 * — and a call whose parens never balance is reported under its own name rather than blamed for
 * a `recursive: true` anywhere below it. It is unit-tested on strings here, then run over every
 * `.test.js`, `.test.mjs` and `.test.cjs` file found by a recursive walk, with a floor on the
 * suite count and a named member so a walk that returned one file could not pass. Proven able
 * to fail with `npm run mutation-check` at a `join(...)` site: revert one of those from
 * `rmTree(...)` to the bare recursive call and the guard names it. (This comment cannot spell
 * that call out: the guard scans this file too, and its first draft named itself.)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree, sleepSync, bareRecursiveRmSyncCalls, guardFindings, suiteFiles, RETRYABLE, DEFAULT_ATTEMPTS, DEFAULT_DELAY_MS } from './_tmp.js';

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

test('the defaults are five tries and a 50 ms unit, so a permanent failure sleeps 50, 100, 150, 200 and then throws', () => {
  assert.equal(DEFAULT_ATTEMPTS, 5);
  assert.equal(DEFAULT_DELAY_MS, 50);
  const { rm, calls } = removalThatFails(Array(8).fill('EBUSY'));
  const slept = [];
  assert.throws(() => rmTree('/fixture', { rm, sleep: (ms) => slept.push(ms) }), { code: 'EBUSY' });
  assert.equal(calls.length, 5);
  assert.deepEqual(slept, [50, 100, 150, 200]);
});

test('`force` is passed through on every attempt: true by default, false when a missing target must throw', () => {
  const byDefault = removalThatFails(['ENOTEMPTY']);
  rmTree('/fixture', { rm: byDefault.rm, sleep: noSleep });
  assert.equal(byDefault.calls.length, 2);
  for (const call of byDefault.calls) assert.deepEqual(call.opts, { recursive: true, force: true });

  const explicit = removalThatFails(['ENOTEMPTY']);
  rmTree('/fixture', { rm: explicit.rm, sleep: noSleep, force: false });
  assert.equal(explicit.calls.length, 2);
  for (const call of explicit.calls) assert.deepEqual(call.opts, { recursive: true, force: false });
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
  assert.ok(elapsedMs >= 19, `slept ${elapsedMs.toFixed(1)} ms, expected 20 (1 ms tolerance)`);
});

test('the scanner walks any nesting inside the call, ignores single-file calls, and reports an unclosed call on its own rather than blaming it', () => {
  // The offending shapes are assembled from pieces so that this file's own text does not carry them.
  const bare = 'rm' + 'Sync';
  const cases = [
    [`${bare}(dir, { recursive: true, force: true });`, 1, 0, 'the plain form'],
    [`${bare}(join(dir, 'x'), { recursive: true });`, 1, 0, 'one nesting level, no force'],
    [`${bare}(join(tmpdir(), 'x'), { recursive: true, force: true });`, 1, 0, 'two nesting levels — the fixture-path shape'],
    [`${bare}(join(a(b(c())), 'x'),\n  { recursive: true });`, 1, 0, 'options on the next line, three levels'],
    [`  ${bare}(\n    dir,\n    { recursive: true }\n  );`, 1, 0, 'call spread over lines'],
    [`${bare}(join(dir, 'x'), { recursive: true`, 0, 1, 'an unclosed call is reported as unclosed, not as an offender'],
    [`${bare}(join(out, 'a(b'));\nlater({ recursive: true });`, 0, 1, 'an unbalanced ( in a string never closes the call; the option below is NOT blamed on it'],
    [`${bare}(join(out, 'notes.md'));\nconst later = { recursive: true };`, 0, 0, 'a single-file call followed by an unrelated option'],
    [`${bare}(join(out, 'a'), { force: true }); ${bare}(join(out, 'b'), { recursive: true });`, 1, 0, 'two calls on one line, only the second offends'],
    [`fs.${bare}(dir, { recursive: true });`, 1, 0, 'namespaced call'],
    [`const x = my${bare}(dir, { recursive: true });`, 0, 0, 'a different identifier that ends in the name'],
  ];
  for (const [text, offenders, unclosed, why] of cases) {
    const r = bareRecursiveRmSyncCalls(text);
    assert.equal(r.offenders.length, offenders, `${why}: ${JSON.stringify(text)} → ${JSON.stringify(r)}`);
    assert.equal(r.unclosed.length, unclosed, `${why} (unclosed): ${JSON.stringify(text)} → ${JSON.stringify(r)}`);
  }
  const twoLines = `first line\nsecond ${bare}(dir, { recursive: true });`;
  assert.equal(bareRecursiveRmSyncCalls(twoLines).offenders[0].line, 2, 'the line number is where the call starts');
  assert.equal(bareRecursiveRmSyncCalls(`x\ny\n${bare}(join(out, 'a(b'));`).unclosed[0].line, 3, 'so is an unclosed call\'s');
});

test('the guard report names an offender by file, line and first row, and an unclosed call by file and line — on synthetic files, since the corpus has neither', () => {
  const bare = 'rm' + 'Sync';
  const files = [
    { name: 'clean.test.js', text: `t.after(() => rmTree(dir));\n${bare}(join(out, 'notes.md'));\n` },
    { name: 'bad.test.js', text: `// setup\nt.after(() => ${bare}(join(tmpdir(), 'x'),\n  { recursive: true, force: true }));\n` },
    { name: 'sub/open.test.mjs', text: `x\n${bare}(join(out, 'a(b'));\nlater({ recursive: true });\n` },
  ];
  const r = guardFindings(files);
  // The call text starts at the identifier, so the first row is what follows `t.after(() => `.
  assert.deepEqual(r.offenders, [`bad.test.js:2: ${bare}(join(tmpdir(), 'x'),`]);
  assert.deepEqual(r.unclosed, ['sub/open.test.mjs:2']);
  assert.deepEqual(guardFindings([]), { offenders: [], unclosed: [] });
});

test('the walk is recursive, takes all three extensions, skips directories and returns relative paths — on a temp tree, since this directory is flat and .js-only', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'suite-walk-'));
  t.after(() => rmTree(root));
  mkdirSync(join(root, 'sub', 'deeper'), { recursive: true });
  mkdirSync(join(root, 'looks.test.js'));                       // a directory named like a suite
  // Created in descending name order, so a walk that dropped its `.sort()` has to rely on the
  // filesystem's own order to pass — which it must not.
  for (const rel of ['sub/f.js', 'sub/deeper/e.test.mjs', 'sub/d.test.js', 'notes.test.txt', 'helper.js', 'c.test.cjs', 'b.test.mjs', 'a.test.js', '_tmp.js']) {
    writeFileSync(join(root, rel), '', 'utf8');
  }
  assert.deepEqual(suiteFiles(root), ['a.test.js', 'b.test.mjs', 'c.test.cjs', 'sub/d.test.js', 'sub/deeper/e.test.mjs']);
});

test('no suite tears down with a bare recursive rmSync, and no suite carries an rmSync call whose parens never close — the guard behind #791', () => {
  const suites = suiteFiles(TEST_DIR);
  // Not vacuous: the walk must return the corpus, not one file, and as relative path strings.
  // 30 is slack under the count at the time of writing (49, by this same filter over this
  // directory), so a suite can be deleted without touching this line; a walk that returned one
  // file, or absolute paths, still fails.
  assert.ok(suites.length >= 30, `the walk found ${suites.length} suite(s); the directory holds dozens`);
  assert.ok(suites.includes('normalize-i18n-fences.test.js'), 'the suite whose teardown failed in CI is in the walk');
  const { offenders, unclosed } = guardFindings(suites.map((name) => ({ name, text: readFileSync(join(TEST_DIR, name), 'utf8') })));
  assert.deepEqual(unclosed, [], `an rmSync call whose parentheses never close (an unfinished edit, or a "(" inside a string or comment within the call):\n${unclosed.join('\n')}`);
  assert.deepEqual(offenders, [], `recursive rmSync in a test: use rmTree() from ./_tmp.js instead\n${offenders.join('\n')}`);
});
