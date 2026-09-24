/**
 * mutation-verdict.js — reading a mutant test run: how many failed, and does the kill mean
 * anything (#621).
 *
 * Extracted from `scripts/mutation-check.js` for the reason `guide-categories.js` was extracted
 * from `generate-readmes.js` in #644: that file runs its whole pipeline at module scope, so
 * importing it to test one decision executes a mutation. The decision here is pure — text in,
 * verdict out — and it is the decision the tool's central promise rests on.
 *
 * ## The promise, and the two ways it breaks
 *
 * `MUTANT KILLED` is supposed to mean "a test asserts this behaviour". Two kinds of red do not
 * establish that, and both look identical in an exit code:
 *
 *   1. the mutant does not PARSE — caught upstream in mutation-check.js, reported `INVALID`;
 *   2. the mutant parses and then CRASHES the moment the module runs — this file.
 *
 * The second is quieter precisely because the syntax gate passes it. Deleting
 * `const stamped = …` leaves `if (stamped !== null)` referencing an undeclared binding, and
 * under ESM strict mode every test reaching that module throws `ReferenceError`. Measured on
 * `normalize-i18n-fences.js` while covering #552: `MUTANT KILLED by 15 failing test(s)`. The
 * honest instrument for the same line — weakening a condition, which parses AND runs to
 * completion — died to exactly 1 test, the one written for it.
 *
 * Same line, same tool, 15 versus 1, and only the 1 means anything. That inversion is the whole
 * problem: the count is quoted in commit messages as evidence of coverage strength, and a bigger
 * number reads as stronger.
 */

/**
 * Output patterns that mean the module BROKE rather than that a test asserted something.
 *
 * Deliberately narrow. Each entry names an error a normal assertion failure does not produce —
 * `assert.equal` failing prints a diff, not a `ReferenceError`. Broadening this to "any stack
 * trace" would swallow legitimate kills in code that throws by design, which is the false-SUSPECT
 * direction and the one that gets a check switched off.
 */
export const CRASH_SIGNATURES = [
  /\bReferenceError\b/,
  /\bTypeError\b.*\bis not a function\b/,
  /\bCannot access '[^']*' before initialization\b/,
  /\bERR_MODULE_NOT_FOUND\b/,
  /\bCannot find (?:module|package)\b/,
];

// `/\bis not defined\b/` was here and is REMOVED. Node prints an uncaught ReferenceError as
// `ReferenceError: x is not defined`, so it fired on the same output as the pattern above it and
// added no coverage in its primary case. What it did add was the broadest false-positive surface
// in the list: it is a plain-English phrase, far likelier than the identifier `ReferenceError` to
// turn up in a future test NAME or fixture — and node:test prints every test name, passing or
// failing, so one such name poisons every later run against that suite.

/**
 * ANSI SGR sequences, stripped before matching (#729).
 *
 * The reporter measurement below is real and still holds — and it missed COLOUR. When colour
 * reaches the capture, the spec summary arrives as `"\x1b[34mℹ fail 0\x1b[39m"`: the trailing
 * reset sits after the digits, so `\s*$` cannot match and BOTH parsers return null.
 *
 * ## What actually triggers it — measured, after a review corrected the first answer
 *
 * NOT a TTY. `mutation-check.js` captures through `spawn(..., {shell: true})` with piped stdio,
 * so the child's stdout is a pipe whatever the operator's terminal is, and node does not colour
 * a pipe. The trigger is **`FORCE_COLOR` in the environment**, which forces colour INTO the pipe.
 * Measured on node v25.9.0, all runs piped:
 *
 *     FORCE_COLOR inherited (=3)   coloured  "\x1b[34mℹ fail 0\x1b[39m"
 *     FORCE_COLOR removed          plain     "ℹ fail 0"
 *     FORCE_COLOR=1                coloured  "\x1b[34mℹ fail 0\x1b[39m"
 *
 * The first draft of this comment said "on a TTY … it worked in CI and never locally". That is
 * wrong in a way worth keeping written down, because it inverts the risk: `FORCE_COLOR` is
 * orthogonal to TTY-ness, some CI configurations export it for readable logs, and such a CI
 * would hit this bug while a plain local pipe would not.
 *
 * The consequence was not a wrong number, it was a missing one, which is worse than it sounds.
 * `--expect-killed-by` refuses rather than passing silently — correct — so the flag that
 * separates a targeted kill from a crash kill (#621, where the same line reported 15 versus 1)
 * could not be used at all wherever colour is forced.
 *
 * `parsePassCount` feeds `BROAD_KILL_SHARE`, so the share half of the SUSPECT guard was degraded
 * in the same place and by the same cause. The CRASH half was NOT: `crashSuspicion` scans raw
 * output, and the worry that `\x1b[31m` abutting `ReferenceError` would defeat `\b` does not
 * materialise — node emits the reset, a newline and indentation before the error name, so the
 * character preceding it is a space. Measured, not assumed, and pinned by a test.
 *
 * Deliberately narrow: SGR (`ESC [ … m`) only, which is what colour uses. Cursor-control
 * sequences are left alone — not because such output would deserve refusal, which was a bad
 * argument in an earlier draft, but simply because node:test does not emit them in summary
 * lines. If that changes, widen to full CSI rather than to bare ESC.
 *
 * Known and unclosed: `.match(/…/m)` takes the FIRST match, while the true summary is at the
 * end of the transcript. A coloured earlier line that only becomes matchable after stripping
 * therefore wins — turning a refusal into a wrong number. The uncoloured form of this predates
 * the strip (see the name-poisoning note under CRASH_SIGNATURES); anchoring on the last match
 * would close both.
 *
 * Written `\x1b`, never a literal escape byte. Typing the examples above inserted three real
 * 0x1B bytes into this file — invisible in an editor, in a diff, and in review, and caught only
 * with `cat -A`. No gate in this repo would have found them: the line-endings check looks for
 * CRLF, and ESC does not trip git's binary heuristic the way NUL does.
 */
const ANSI_SGR = /\x1b\[[0-9;]*m/g;

const stripAnsi = (output) => String(output ?? '').replace(ANSI_SGR, '');

/**
 * Pull `fail N` out of node:test output; null if the format is not recognised.
 *
 * ## Both reporters, MEASURED (#666)
 *
 * `package.json` permits `node >= 22.12.0` while CI runs 24, and the piped default reporter
 * differs across that range: Node 22 emits **TAP** (`# fail 1`), Node 23+ emits **spec**
 * (`ℹ fail 1`). These patterns were designed against spec alone, so whether a Node-22 user
 * silently got one of the two SUSPECT signals instead of both was an open question — a
 * parse failure disables the share signal by design, correctly, but without telling anyone.
 *
 * Measured on Node 22.16.0 and 25.9.0, and the answer is that both parse: `\S*` matches `#`
 * exactly as it matches `ℹ`. Pinned by `scripts/test/mutation-verdict.test.js` against
 * literal transcripts of both, so the patterns cannot be tightened without noticing.
 *
 * The crash signal was measured end to end on 22 as well, rather than reasoned about from
 * its format-independence: an undeclared-binding mutant reported `SUSPECT KILL — 18 failing
 * test(s), but the mutant looks BROKEN rather than caught`, and a behavioural mutant on the
 * same file reported `MUTANT KILLED by 1` with no SUSPECT.
 *
 * Be exact about what that second run did and did not exercise, because the obvious summary
 * ("both signals work on both reporters") claims more than it showed. 18 failures against a
 * 628 baseline is 2.9%, far below `BROAD_KILL_SHARE` — so the SHARE signal did not fire, and
 * the SUSPECT verdict came from the crash signature alone. Arranging an end-to-end share trip
 * on Node 22 would need a mutant killing ~157 tests, which is not a shape worth manufacturing.
 *
 * What that leaves is honest and sufficient: the share signal's ONLY format dependency is the
 * two parsers above, and those are measured on TAP directly. Everything downstream of them is
 * arithmetic. So the reporter question is settled for both signals; only one of the two was
 * settled by an end-to-end run, and this is which.
 */
export function parseFailCount(output) {
  const match = stripAnsi(output).match(/^\s*\S*\s*fail\s+(\d+)\s*$/m);
  return match ? Number(match[1]) : null;
}

/** Pull `pass N` out of node:test output; null if the format is not recognised. */
export function parsePassCount(output) {
  const match = stripAnsi(output).match(/^\s*\S*\s*pass\s+(\d+)\s*$/m);
  return match ? Number(match[1]) : null;
}

/** Share of the baseline suite at or above which a kill is called broad. */
export const BROAD_KILL_SHARE = 0.25;

/**
 * Smallest baseline for which a SHARE means anything.
 *
 * On a four-test baseline a single honest failure is 25% and trips the signal — which is not a
 * hypothetical: writing the tests for this file, a 2-of-8 case fired it and the surprise went
 * into a commit message. The cost is not the one noisy run; it is that `--allow-broad` becomes
 * routine on targeted single-file runs, and a waiver used by reflex stops being a decision.
 *
 * Below this, only the crash signature speaks.
 */
export const MIN_BASELINE_FOR_SHARE = 10;

/**
 * Reasons to doubt that a red run is a behavioural kill. Empty means no doubt.
 *
 * Two independent signals, because neither is decidable from an exit code alone:
 *
 *   - a runtime-error signature, which an assertion failure does not produce;
 *   - a failure count taking a large share of the suite, since a behavioural mutation usually
 *     kills the handful of tests written for that behaviour.
 *
 * BOTH ARE HEURISTICS AND BOTH ARE WAIVABLE, and arriving there took a wrong turn worth
 * recording. The first design said a crash signature is never legitimate and so never waivable —
 * "a crash cannot establish that a test asserts anything". True of the crash; false of the
 * SIGNATURE, which matches text rather than crashes. Two shapes in this repo render identically,
 * and both are an `AssertionError` whose message embeds a subprocess crash:
 *
 *   dependency-free.test.js    asserts a module acquires no package dependency. The mutation adds
 *                              one, the module fails to load, the test reports it — a perfect
 *                              behavioural kill, one failing test, the one written for it.
 *   fence-basis-stamp.test.js  asserts the normalizer works. The mutation deletes a binding, the
 *                              module throws, 15 tests report it — the #621 crash exactly.
 *
 * Separating them by the failures' error TYPE was tried and does not work: in both, every failure
 * is an `AssertionError` and the crash text sits inside its message. What actually distinguishes
 * them is whether the crash IS the asserted property — semantic, not syntactic, and not decidable
 * from a transcript. So SUSPECT names a doubt for a human to resolve, and the human answers with
 * `--allow-crash-text`, rather than the tool asserting a certainty it does not have.
 *
 * The share signal has the same character: mutating a genuinely load-bearing line honestly fails
 * most of the suite. Returning `[]` from `guideCategoryOrder` fails 13 of 15 with no runtime
 * error at all, and that is a real kill.
 *
 * @param {string} output - combined stdout/stderr of the mutant run
 * @param {number|null} failCount - failing tests in the mutant run
 * @param {number|null} baselinePassCount - passing tests in the green baseline
 * @param {boolean} [allowBroad] - accept a broad failure as a legitimate kill
 * @param {boolean} [allowCrashText] - accept crash text as belonging to the asserted property
 * @returns {string[]} human-readable reasons; empty if the kill looks behavioural
 */
export function crashSuspicion(output, failCount, baselinePassCount, allowBroad = false, allowCrashText = false) {
  const reasons = [];
  const text = String(output ?? '');
  const matched = allowCrashText ? [] : CRASH_SIGNATURES.filter((pattern) => pattern.test(text));
  if (matched.length > 0) {
    const names = matched.map((pattern) => pattern.source.replace(/\\b/g, '')).join(', ');
    reasons.push(
      `the output contains ${matched.length === 1 ? 'a runtime error' : 'runtime errors'} (${names})`
    );
  }
  if (!allowBroad && failCount !== null && baselinePassCount !== null
      && baselinePassCount >= MIN_BASELINE_FOR_SHARE) {
    const share = failCount / baselinePassCount;
    if (share >= BROAD_KILL_SHARE) {
      reasons.push(
        `${failCount} test(s) failed against a baseline of ${baselinePassCount} passing ` +
        `(${Math.round(share * 100)}%), which is broad for one line — pass --allow-broad if ` +
        'that is genuinely expected'
      );
    }
  }
  return reasons;
}
