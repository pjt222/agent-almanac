/**
 * _tmp.js — remove a fixture directory, retrying the WHOLE removal on ENOTEMPTY (#791).
 *
 * `rmSync(dir, { recursive: true, force: true })` was the teardown every suite here used, and it
 * reddened a required CI context on 2026-09-04 (#788's `scripts-test` run) with 818 of 819 tests
 * passing: something was still creating entries under the fixture while the recursive unlink
 * walked it, and `force` suppresses ENOENT, not ENOTEMPTY. The failure names the test whose
 * fixture it was, which did not itself fail, and it clears on a bare re-run — a defect in the
 * check, not in the diff (CLAUDE.md § Merging With a Red Check).
 *
 * `node:fs`'s own `maxRetries` knob is NOT the fix, and that is measured rather than assumed
 * (`tests/results/2026-09-07-rmsync-enotempty-probe/RESULT.md`): under a child that keeps
 * creating files for 60 ms, Node 24 and 25 clear the error with `maxRetries: 3`, but Node 22.16
 * — the floor of `engines.node` — fails every one of 20 trials with it and merely takes longer,
 * because its retry re-attempts only the final `rmdir` and never re-removes the entries that
 * appeared in the meantime. Re-invoking `rmSync` re-walks the tree on every version, so that is
 * what this does.
 *
 * Only the codes that mean "not removable yet" are retried — ENOTEMPTY, EBUSY, EPERM — and
 * anything else is rethrown on the first occurrence, so a real permission or path defect stays
 * loud. Linear backoff, `attempts` tries in total. `rm` and `sleep` are injectable so the retry
 * logic is tested deterministically in `tmp-helper.test.js` without staging the race; the race
 * itself is the probe's job.
 *
 * Deliberately named with a leading underscore: `*.test.js` must not collect it, and the guard
 * test in `tmp-helper.test.js` scans only `*.test.js`, so this file's own `recursive: true` is
 * not an offender.
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
 * @param {(dir: string, opts: object) => void} [options.rm] the removal, injectable for tests
 * @param {(ms: number) => void} [options.sleep] the wait, injectable for tests
 * @returns {number}
 */
export function rmTree(dir, { attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS, rm = rmSync, sleep = sleepSync } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      rm(dir, { recursive: true, force: true });
      return attempt;
    } catch (error) {
      if (attempt >= attempts || !RETRYABLE.has(error?.code)) throw error;
      sleep(attempt * delayMs);
    }
  }
}
