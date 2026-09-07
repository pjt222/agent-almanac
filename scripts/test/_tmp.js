/**
 * _tmp.js — remove a fixture directory, retrying the WHOLE removal on ENOTEMPTY (#791).
 *
 * `rmSync(dir, { recursive: true, force: true })` was the teardown every suite here used, and it
 * reddened a required CI context with 818 of 819 tests passing (#788's `scripts-test` run
 * 33860068133 on 2026-09-04, recorded in #791): something was still creating entries under the
 * fixture while the recursive unlink walked it, and `force` suppresses ENOENT, not ENOTEMPTY.
 * The failure names the test whose fixture it was, which did not itself fail, and it clears on
 * a bare re-run — a defect in the check, not in the diff (CLAUDE.md § Merging With a Red Check).
 *
 * `node:fs`'s own `maxRetries` knob is NOT the fix, and that is measured rather than assumed
 * (`tests/results/2026-09-07-rmsync-enotempty-probe/RESULT.md`): under a child that keeps
 * creating files for 60 ms, Node 24 and 25 clear the error with `maxRetries: 3`, but Node 22.16
 * — the oldest version installed here inside `engines.node`'s `>=22.12.0`; the floor itself was
 * not measured — fails every one of 20 trials with it and merely takes longer, ten retries
 * spending over a second. What differs is therefore WHAT is re-attempted, not for how long:
 * re-invoking `rmSync` re-walks the tree, and did remove the directory in every trial on all
 * three versions. Why Node 22's `maxRetries` re-attempts less was not read from Node's source;
 * the inference is that it retries the final `rmdir` without re-removing what appeared meanwhile.
 *
 * The retry set is ENOTEMPTY, EBUSY, EPERM. EPERM is there for Windows, where it means "in use";
 * on Linux permission denial is EACCES, which is outside the set and rethrown on the first
 * occurrence, so a real permission or path defect stays loud. A retried code is still rethrown
 * once the attempts are spent, so retrying EPERM on Linux costs at most the bounded backoff —
 * 500 ms across the defaults — and never hides the error. Linear backoff, `attempts` tries in
 * total. `rm` and `sleep` are injectable so the retry logic is tested deterministically in
 * `tmp-helper.test.js` without staging the race; the race itself is the probe's job.
 *
 * `force` defaults to true, as every teardown always had it. The four sites in
 * `build-hermes-distribution.test.js` that deliberately remove something they expect to exist
 * pass `force: false`, so a target that was never created still throws ENOENT there instead of
 * satisfying a "does not exist" assertion by accident.
 *
 * `bareRecursiveRmSyncCalls` is the guard's scanner, kept beside the helper so its own unit test
 * can feed it strings: it finds every `rmSync(` call, walks to the call's closing paren counting
 * depth — so `join(tmpdir(), 'x')` and deeper nesting are inside the call, not the end of it —
 * and reports the call when its argument text carries `recursive: true`. The first two versions
 * were regexes; both had a nesting limit the review found, and a scanner has none.
 *
 * Named with a leading underscore by the convention `_assert-suite-nonempty.js` set. What keeps
 * it out of the suite is the absent `.test.js` suffix — `test:scripts` runs
 * `node --test scripts/test/*.test.js` — and what keeps its own text out of the guard in
 * `tmp-helper.test.js` is that guard's `/\.test\.[cm]?js$/` filter, by construction, not the name.
 */
import { rmSync } from 'node:fs';

/** Errors that mean "try again", never "give up". */
export const RETRYABLE = new Set(['ENOTEMPTY', 'EBUSY', 'EPERM']);
export const DEFAULT_ATTEMPTS = 5;
export const DEFAULT_DELAY_MS = 50;

/** Block the thread for `ms` milliseconds — teardown is synchronous, so the wait must be too. */
export function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Remove `dir` and everything under it. Returns the attempt number that succeeded (1 when the
 * first removal worked), so a caller or test can see whether a retry was needed.
 *
 * @param {string} dir directory to remove
 * @param {object} [options]
 * @param {number} [options.attempts] total tries before the last error is rethrown
 * @param {number} [options.delayMs] backoff unit: attempt n sleeps n × delayMs before retrying
 * @param {boolean} [options.force] passed through to the removal; false makes a missing target throw ENOENT
 * @param {(dir: string, opts: object) => void} [options.rm] the removal, injectable for tests
 * @param {(ms: number) => void} [options.sleep] the wait, injectable for tests
 * @returns {number}
 */
export function rmTree(dir, { attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS, force = true, rm = rmSync, sleep = sleepSync } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      rm(dir, { recursive: true, force });
      return attempt;
    } catch (error) {
      if (attempt >= attempts || !RETRYABLE.has(error?.code)) throw error;
      sleep(attempt * delayMs);
    }
  }
}

/**
 * Every `rmSync(...)` call in `text` whose argument text carries `recursive: true`, as
 * `{ line, call }` — `line` 1-based, `call` the text from `rmSync` to the matching `)`.
 *
 * Parentheses are counted, so any nesting inside the arguments is walked through; an unclosed
 * call runs to the end of the text and is reported if it carries the option (an unfinished
 * edit is still an offender). Parens inside string literals are not special-cased: a `)` in a
 * string would end the call early and hide a later `recursive: true` — no call in this
 * directory has one, and a scanner that tokenised strings would be a parser.
 *
 * @param {string} text
 * @returns {Array<{line: number, call: string}>}
 */
export function bareRecursiveRmSyncCalls(text) {
  const found = [];
  const re = /\brmSync\s*\(/g;
  for (const m of text.matchAll(re)) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < text.length && depth > 0) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
      i++;
    }
    const call = text.slice(m.index, i);
    if (/recursive\s*:\s*true/.test(call)) {
      found.push({ line: text.slice(0, m.index).split('\n').length, call });
    }
  }
  return found;
}
