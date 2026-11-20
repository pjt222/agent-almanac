/**
 * Unit tests for `scripts/lib/mutation-verdict.js` (#621).
 *
 * The end-to-end proof is in the PR: the exact deletion from the issue now reports SUSPECT where
 * it used to report `MUTANT KILLED by 15 failing test(s)`. These cover the decision itself, and
 * in particular the two properties that make the signal trustworthy rather than merely present:
 * a crash signature is never waived, and an ordinary assertion failure is never flagged.
 *
 * A false SUSPECT is the direction that gets a check switched off, so the negative cases here
 * matter as much as the positive ones.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmTree } from './_tmp.js';
import {
  crashSuspicion,
  parseFailCount,
  parsePassCount,
  parseFailingLeafTests,
  addedFailingTests,
  BROAD_KILL_SHARE,
  MIN_BASELINE_FOR_SHARE,
  CRASH_SIGNATURES,
} from '../lib/mutation-verdict.js';

// A normal node:test failure: a diff, no runtime error.
const ASSERTION_FAILURE = `
✖ label capitalises the first letter (1.2ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
  + 'workflow'
  - 'Workflow'
ℹ tests 15
ℹ pass 13
ℹ fail 2
`;

// The #621 shape: the module throws before any assertion runs.
const REFERENCE_ERROR = `
✖ normalize writes the repaired text (2.0ms)
  ReferenceError: stamped is not defined
      at repairFile (file:///repo/scripts/normalize-i18n-fences.js:585:9)
ℹ tests 490
ℹ pass 475
ℹ fail 15
`;

test('an ordinary assertion failure is NOT suspect', () => {
  // The case that must stay silent. Flagging this would make every honest kill noisy, and a
  // noisy check gets ignored — which costs more than the blind spot it was added to close.
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 2, 15), []);
});

// NAME CAREFULLY. node:test prints every test name, passing or failing, so a name containing
// crash text lands in the transcript of every future `mutation-check --test 'npm run
// test:scripts'` run and trips the signature scan on kills that have nothing to do with it.
// This one was called 'a ReferenceError is suspect …' and would have done exactly that.
test('a runtime crash is suspect however few tests failed', () => {
  const reasons = crashSuspicion(REFERENCE_ERROR, 15, 490);
  assert.equal(reasons.length, 1, 'the share signal must not also fire at 15/490');
  assert.match(reasons[0], /runtime error/);
});

test('a broad failure is suspect without any runtime error', () => {
  // Measured shape: returning `[]` from `guideCategoryOrder` fails 13 of 15 and prints no
  // runtime error at all. The two signals are independent, and each must be able to fire alone —
  // otherwise one of them is decoration.
  // Counts are parameters, not parsed from the fixture — an earlier `.replace('fail 2', …)` here
  // was doing nothing and reading as though it set up the case.
  const reasons = crashSuspicion(ASSERTION_FAILURE, 13, 15);
  assert.equal(reasons.length, 1);
  assert.match(reasons[0], /13 test\(s\) failed against a baseline of 15 passing \(87%\)/);
});

test('--allow-broad waives the share signal', () => {
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 13, 15, true), []);
});

test('the share threshold is a boundary, not a range', () => {
  const output = ASSERTION_FAILURE;
  const justUnder = Math.floor(BROAD_KILL_SHARE * 100) - 1;
  assert.deepEqual(crashSuspicion(output, justUnder, 100), [], `${justUnder}/100 must not fire`);
  assert.equal(crashSuspicion(output, Math.ceil(BROAD_KILL_SHARE * 100), 100).length, 1);
});

test('an unparseable count disables the share signal rather than guessing', () => {
  // `null` means "the output format was not recognised". Treating that as 0, or as the whole
  // suite, would invent a verdict out of a parse failure — the vacuous-pass shape this repo
  // keeps finding. Silence is the honest answer; the crash signature still applies.
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, null, 15), []);
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 13, null), []);
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 13, 0), []);
  assert.equal(crashSuspicion(REFERENCE_ERROR, null, null).length, 1, 'crashes still flagged');
});

test('every crash signature is reachable from a realistic message', () => {
  // Guards against a pattern that can never match — an entry in a deny list that fires on
  // nothing is indistinguishable from an absent one, and reads as coverage it does not provide.
  const samples = [
    'ReferenceError: x is not defined',
    "TypeError: fn is not a function",
    "ReferenceError: Cannot access 'x' before initialization",
    'Error [ERR_MODULE_NOT_FOUND]: Cannot find module',
    'Cannot find package \'js-yaml\'',
    'ReferenceError: helper is not defined',
  ];
  for (const pattern of CRASH_SIGNATURES) {
    assert.ok(
      samples.some((sample) => pattern.test(sample)),
      `no sample matches ${pattern} — is it reachable?`
    );
  }
});

test('parseFailCount and parsePassCount read node:test summaries', () => {
  assert.equal(parseFailCount(ASSERTION_FAILURE), 2);
  assert.equal(parsePassCount(ASSERTION_FAILURE), 13);
  assert.equal(parseFailCount('no summary here'), null);
  assert.equal(parsePassCount('no summary here'), null);
  assert.equal(parseFailCount(undefined), null);
});

// ── COLOUR: the dimension the #666 reporter measurement did not vary (#729) ──

// #666 measured TAP against spec and pinned both, from PIPED transcripts. Colour was never
// varied, and with colour both parsers returned null.
//
// The trigger is `FORCE_COLOR`, NOT a TTY: mutation-check captures through a pipe, node does
// not colour a pipe, and `FORCE_COLOR` forces it in regardless. Measured on v25.9.0 — piped,
// FORCE_COLOR=3 gives `"\x1b[34mℹ fail 0\x1b[39m"`; piped with it removed gives `"ℹ fail 0"`.
// That distinction inverts the risk: a CI exporting FORCE_COLOR for readable logs hits this,
// a plain local pipe does not.
//
// The escapes are written `\x1b`, NOT pasted. Typing the real bytes into a source file embeds
// 0x1B directly, invisible in an editor and in review; that happened while fixing this and is
// why the constant carries the same warning.
const COLOURED_SPEC_FAIL = '\x1b[34mℹ fail 3\x1b[39m';
const COLOURED_SPEC_PASS = '\x1b[34mℹ pass 20\x1b[39m';

// Real bytes from `node --test` under FORCE_COLOR=3 on v25.9.0, reduced to the shape that
// matters: what precedes the error name. The worry was that `\x1b[31mReferenceError` would put
// a word character (`m`) before `R` and defeat `/\bReferenceError\b/`. It does not — the reset
// is followed by a newline and indentation, so the preceding character is a space.
const COLOURED_REFERENCE_ERROR = [
  '\x1b[31m\x1b[39m',
  '  ReferenceError: notDeclaredAnywhere is not defined',
  '      at TestContext.<anonymous> (file:///tmp/boom.test.js:3:48)',
  '\x1b[34mℹ tests 2\x1b[39m',
  '\x1b[34mℹ pass 1\x1b[39m',
  '\x1b[34mℹ fail 1\x1b[39m',
].join('\n');

test('coloured node:test output parses — the TTY case (#729)', () => {
  assert.equal(parseFailCount(COLOURED_SPEC_FAIL), 3);
  assert.equal(parsePassCount(COLOURED_SPEC_PASS), 20);
});

test('the trailing reset is what used to break it, not the leading colour', () => {
  // Diagnosis pinned, because "strip ANSI" is a fix whose REASON is easy to misremember. The
  // opening `\x1b[34m` is absorbed by `\S*` and never mattered; the closing `\x1b[39m` sits
  // after the digits, where `\s*$` cannot pass it.
  assert.equal(parseFailCount('\x1b[34mℹ fail 3'), 3, 'a leading colour alone always parsed');
  assert.equal(
    /^\s*\S*\s*fail\s+(\d+)\s*$/m.exec('ℹ fail 3\x1b[39m'),
    null,
    'and a trailing reset alone is what the old pattern could not pass',
  );
  assert.equal(parseFailCount('ℹ fail 3\x1b[39m'), 3, 'which the strip now handles');
});

test('the ESC byte is part of the sequence, not decoration around it', () => {
  // The trap on the way to this fix, kept because it is easy to repeat: a pattern of
  // `/\[[0-9;]*m/g` looks like it strips ANSI and does not — it removes `[39m` and leaves 0x1B
  // behind, and ESC is not whitespace, so `\s*$` is blocked exactly as before.
  const halfStripped = COLOURED_SPEC_FAIL.replace(/\[[0-9;]*m/g, '');
  assert.ok(halfStripped.includes('\x1b'), 'the half-strip leaves the control byte');
  assert.equal(
    /^\s*\S*\s*fail\s+(\d+)\s*$/m.exec(halfStripped),
    null,
    'so the summary is still unreadable after it',
  );

  // And the parser does not paper over that either: an orphan ESC with no `[…m` after it is
  // not an SGR sequence, so it is deliberately NOT stripped, and the parser reports null as its
  // contract says ("null if the format is not recognised").
  //
  // Asserted so nobody "fixes" this by stripping bare ESC. The cost of that is not eating
  // content — the strip works on a throwaway copy — it is FABRICATING a parse from mangled
  // input, which is the invent-a-verdict direction this suite rejects everywhere else. A
  // legitimate widening to full CSI (`\x1b\[[0-9;]*[A-Za-z]`) still satisfies this assertion.
  assert.equal(parseFailCount(halfStripped), null);

  // What works is stripping the WHOLE sequence, ESC included — from the original bytes.
  assert.equal(parseFailCount(COLOURED_SPEC_FAIL), 3);
});

test('colour does not make an unparseable line parseable', () => {
  assert.equal(parseFailCount('\x1b[34mℹ nothing here\x1b[39m'), null);
});

test('the CRASH half of the guard is not defeated by colour (#729)', () => {
  // A review inferred that `\x1b[31m` abutting the error name would put a word character before
  // `R` and defeat `\b`. Measured against real FORCE_COLOR=3 output: it does not, because node
  // emits the reset, a newline and indentation first. Pinned so it stays true — the crash signal
  // scans RAW output and would otherwise have no colour coverage at all.
  assert.equal(/\bReferenceError\b/.test(COLOURED_REFERENCE_ERROR), true);
  const reasons = crashSuspicion(COLOURED_REFERENCE_ERROR, 1, 1);
  assert.equal(reasons.length, 1, 'the crash signature must still fire under colour');
  assert.match(reasons[0], /runtime error/);
});

test('the SHARE half works on a coloured tail, end to end (#729)', () => {
  // The share signal's only colour-sensitive step is the two parsers, and everything downstream
  // is arithmetic — but that argument is exactly the kind #666 made about reporters, so drive it
  // from coloured input rather than asserting the reasoning.
  const failed = parseFailCount(COLOURED_SPEC_FAIL);       // 3
  const passed = parsePassCount(COLOURED_SPEC_PASS);       // 20
  assert.equal(failed, 3);
  assert.equal(passed, 20);
  // 3/20 = 15%, under the threshold and over the minimum baseline: no doubt raised.
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, failed, passed), []);
  // And it still fires when the share is broad, from the same coloured parse.
  assert.equal(crashSuspicion(ASSERTION_FAILURE, 15, passed).length, 1);
});

// ── the false SUSPECT that self-review caught (#621) ────────────────────────

// A LEGITIMATE behavioural kill whose assertion message embeds crash text. Real output,
// captured from `scripts/test/dependency-free.test.js` after adding a package import to
// `readme-sections.js` — one failing test, the exact one written for that property.
const ASSERTION_EMBEDDING_CRASH_TEXT = `
✖ failing tests:

test at scripts/test/dependency-free.test.js:86:1
✖ readme-sections.js keeps the zero-import property it claims (358.098293ms)
  AssertionError [ERR_ASSERTION]: readme-sections.js acquired a package dependency:
  node:internal/modules/package_json_reader:301
    throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);

  Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'js-yaml' imported from /tmp/x/readme-sections.js
      at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
ℹ tests 8
ℹ pass 7
ℹ fail 1
`;

test('a kill whose assertion message embeds crash text IS flagged, and is waivable', () => {
  // THE MEASURED LIMIT, and why this is a heuristic rather than a verdict. This is a perfect
  // behavioural kill — one failing test, the one written for that property — and it is
  // INDISTINGUISHABLE from #621's crash: both are an `AssertionError` whose message embeds a
  // subprocess crash. An error-TYPE discriminator was written, shipped, and removed, because it
  // separates neither; what divides them is whether the crash IS the asserted property, which no
  // transcript records.
  //
  // So the doubt is raised and the human answers it.
  assert.equal(crashSuspicion(ASSERTION_EMBEDDING_CRASH_TEXT, 1, 8).length, 1);
  assert.deepEqual(crashSuspicion(ASSERTION_EMBEDDING_CRASH_TEXT, 1, 8, false, true), []);
});

test('--allow-crash-text waives the signature signal', () => {
  assert.deepEqual(crashSuspicion(REFERENCE_ERROR, 15, 490, false, true), []);
});

test('each flag answers one doubt, not both', () => {
  // One flag clearing both signals would let a reader waive a question they never considered.
  const broadOnly = crashSuspicion(ASSERTION_FAILURE, 13, 15, false, true);
  assert.equal(broadOnly.length, 1);
  assert.match(broadOnly[0], /broad for one line/);

  const crashOnly = crashSuspicion(REFERENCE_ERROR, 400, 490, true, false);
  assert.equal(crashOnly.length, 1);
  assert.match(crashOnly[0], /runtime error/);
});

test('crash text anywhere in the transcript raises the doubt', () => {
  // The scan is deliberately whole-transcript: a mutant that crashes one module while assertions
  // fail elsewhere is still worth a second look.
  const mixed = ASSERTION_EMBEDDING_CRASH_TEXT.replace(
    '  AssertionError [ERR_ASSERTION]: readme-sections.js',
    '  ReferenceError: stamped is not defined\n  AssertionError [ERR_ASSERTION]: readme-sections.js'
  );
  // Asserted on the REASON, not the count: 2 of 8 is also 25%, so the share signal fires too.
  // Pinning `length === 1` here failed for a reason that had nothing to do with the property
  // under test — a test can be red about the wrong thing just as a gate can.
  // 8 is below MIN_BASELINE_FOR_SHARE, so only the crash signal can speak here — which is the
  // point: the crash signal must not need the share signal's help.
  const reasons = crashSuspicion(mixed, 2, 8);
  assert.ok(reasons.some((reason) => /runtime error/.test(reason)), JSON.stringify(reasons));
});

test('an unrecognised output format falls back to the signature scan', () => {
  // No parseable error-type line means the discriminator cannot speak. It must not then CLEAR
  // the crash signal — that would turn a parse failure into an all-clear, which is the vacuous
  // pass shape this repo keeps finding.
  const noErrorTypes = 'something broke: ReferenceError: x is not defined';
  assert.equal(crashSuspicion(noErrorTypes, 1, 8).length, 1);
});

test('a small baseline does not let one honest failure look broad', () => {
  // 1 of 4 is 25% and tripped the signal. The cost is not the noisy run — it is that
  // `--allow-broad` becomes routine on targeted single-file runs, and a reflex waiver is not a
  // decision. Below MIN_BASELINE_FOR_SHARE only the crash signature speaks.
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 1, 4), []);
  assert.deepEqual(crashSuspicion(ASSERTION_FAILURE, 3, MIN_BASELINE_FOR_SHARE - 1), []);
  assert.equal(crashSuspicion(ASSERTION_FAILURE, 3, MIN_BASELINE_FOR_SHARE).length, 1);
});

// ── both node:test reporters, pinned from measured transcripts (#666) ────────
//
// Until #1012, `package.json` permitted `node >= 22.12.0` and CI ran 24 (both are 26 now). The
// piped DEFAULT reporter differs across that range — Node 22 emits TAP, Node 23+ emits spec — and these parsers were
// designed against spec alone. A parse failure disables the share signal by design and
// says nothing, so a Node-22 user could have been getting one of the two SUSPECT signals
// without ever being told which.
//
// Measured on 22.16.0 and 25.9.0: both parse, because `\S*` matches `#` as readily as `ℹ`.
// These are transcript tails from those runs with ONE harmonisation — the `duration_ms` value
// is shared, which two different binaries would never produce. Said plainly rather than
// called "literal", on a PR whose thesis is measured-not-inferred; the harmonisation is also
// the point, since it leaves the prefix glyph as the only difference between them.

const TAP_TAIL = [
  '# tests 3',
  '# suites 0',
  '# pass 2',
  '# fail 1',
  '# cancelled 0',
  '# skipped 0',
  '# todo 0',
  '# duration_ms 91.861266',
].join('\n');

const SPEC_TAIL = [
  'ℹ tests 3',
  'ℹ suites 0',
  'ℹ pass 2',
  'ℹ fail 1',
  'ℹ cancelled 0',
  'ℹ skipped 0',
  'ℹ todo 0',
  'ℹ duration_ms 91.861266',
].join('\n');

test('the counts parse on Node 22 TAP and on Node 23+ spec alike', () => {
  for (const [label, tail] of [['TAP (node 22)', TAP_TAIL], ['spec (node 23+)', SPEC_TAIL]]) {
    assert.equal(parseFailCount(tail), 1, `fail count under ${label}`);
    assert.equal(parsePassCount(tail), 2, `pass count under ${label}`);
  }
});

test('an unrecognised format still returns null rather than inventing a count', () => {
  // The property that makes the above safe to rely on: when the reporter changes again,
  // the share signal disables itself instead of guessing. A parse that returned 0 here
  // would read as "zero failures", which is the opposite of what it knows.
  assert.equal(parseFailCount('RESULTS: 1 failure of 3'), null);
  assert.equal(parsePassCount('RESULTS: 2 successes of 3'), null);
  assert.equal(parseFailCount(''), null);
});

test('the crash signature is reporter-independent, on both transcript shapes', () => {
  // Measured end to end on Node 22 rather than argued from format-independence: an
  // undeclared-binding mutant reported `SUSPECT KILL — 18 failing test(s)`, and a
  // behavioural mutant on the same file reported `MUTANT KILLED by 1` with no SUSPECT.
  // `crashSuspicion` returns an ARRAY of reasons, and `[]` is truthy — so assert on its
  // length. A bare `assert.ok(crashSuspicion(...))` passes for every input, which is a
  // vacuous test dressed as a real one, and it is how this test first failed.
  const crash = 'ReferenceError: preHook is not defined\n    at inspectPublishGate';
  assert.equal(crashSuspicion(`${TAP_TAIL}\n${crash}`, 1, 600).length, 1,
    'TAP transcript carrying a crash');
  assert.equal(crashSuspicion(`${SPEC_TAIL}\n${crash}`, 1, 600).length, 1,
    'spec transcript carrying a crash');
  assert.deepEqual(crashSuspicion(TAP_TAIL, 1, 600), [], 'a clean TAP transcript is not suspect');
  assert.deepEqual(crashSuspicion(SPEC_TAIL, 1, 600), [], 'a clean spec transcript is not suspect');
});

test('the share signal is reporter-independent because its inputs are — shown, not asserted', () => {
  // The end-to-end Node 22 run did NOT exercise this: 18 failures against a 628 baseline is
  // 2.9%, far below BROAD_KILL_SHARE, so that SUSPECT verdict came from the crash signature
  // alone. Rather than manufacture a ~157-failure mutant to trip it, this drives the signal
  // from counts parsed out of each reporter's own transcript — which is the only place the
  // format can matter. Everything after the parse is arithmetic.
  const broad = (tail) => {
    const fail = parseFailCount(tail);
    const pass = parsePassCount(tail);
    return crashSuspicion(tail, fail * 100, pass * 100);
  };
  for (const [label, tail] of [['TAP', TAP_TAIL], ['spec', SPEC_TAIL]]) {
    // 100 failures against a 200 baseline is 50%, over the threshold, from parsed counts.
    const reasons = broad(tail);
    assert.equal(reasons.length, 1, `share signal under ${label}: ${JSON.stringify(reasons)}`);
    assert.match(reasons[0], /which is broad for one line/);
  }
});

// ── failing leaf tests, by name (S1) ─────────────────────────────────────────────────────────
//
// Cut from transcripts measured on node v26.11.1, piped, over a fixture holding a failing
// top-level test, a failing test two `describe`s deep, a test whose subtest fails, a skipped test,
// a failing TODO, and one name failing in two files. Shortened in two ways only: error bodies to
// a line or two, and absolute paths to `/w/`. The column structure, which is all the parser reads,
// is the transcript's.

const SPEC_FAILING = [
  '✔ top passes (2.296201ms)',
  '✖ top fails | with a pipe (3.5011ms)',
  '▶ suite one',
  '  ✔ nested passes (0.360805ms)',
  '  ✖ nested fails (0.50559ms)',
  '  ▶ inner',
  '    ✖ deep fails (0.236128ms)',
  '  ✖ inner (0.647269ms)',
  '✖ suite one (2.261275ms)',
  '▶ parent with subtests',
  '  ✔ sub passes (0.285612ms)',
  '  ✖ sub fails (11.64609ms)',
  '✖ parent with subtests (12.940608ms)',
  '﹣ skipped one (0.274943ms) # SKIP',
  '⚠ todo one (0.691684ms) # TODO',
  '✖ same name in two files (20.718722ms)',
  '✖ same name in two files (18.134213ms)',
  'ℹ tests 12',
  'ℹ suites 2',
  'ℹ pass 3',
  'ℹ fail 7',
  'ℹ cancelled 0',
  'ℹ skipped 1',
  'ℹ todo 1',
  'ℹ duration_ms 157.698366',
  '',
  '✖ failing tests:',
  '',
  'test at a.test.js:4:1',
  '✖ top fails | with a pipe (3.5011ms)',
  '  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:',
  '  ',
  '  1 !== 2',
  '',
  'test at a.test.js:7:3',
  '✖ nested fails (0.50559ms)',
  "  'a' !== 'b'",
  '',
  'test at a.test.js:8:29',
  '✖ deep fails (0.236128ms)',
  '  Error: boom',
  '',
  'test at a.test.js:12:11',
  '✖ sub fails (11.64609ms)',
  '    assert.ok(false)',
  '',
  'test at a.test.js:15:1',
  '⚠ todo one (0.691684ms) # TODO',
  '    assert.ok(false)',
  '',
  'test at b.test.js:3:1',
  '✖ same name in two files (20.718722ms)',
  '    assert.ok(false)',
  '',
  'test at c.test.js:3:1',
  '✖ same name in two files (18.134213ms)',
  '    assert.ok(false)',
].join('\n');

// The same fixture under `--test-reporter=tap`, over a.test.js and b.test.js only.
const TAP_FAILING = [
  'TAP version 13',
  '# Subtest: top passes',
  'ok 1 - top passes',
  '  ---',
  "  type: 'test'",
  '  ...',
  '# Subtest: top fails | with a pipe',
  'not ok 2 - top fails | with a pipe',
  '  ---',
  "  type: 'test'",
  "  location: '/w/a.test.js:4:1'",
  "  failureType: 'testCodeFailure'",
  '  error: |-',
  '    Expected values to be strictly equal:',
  '  ...',
  '# Subtest: suite one',
  '    # Subtest: nested passes',
  '    ok 1 - nested passes',
  '      ---',
  "      type: 'test'",
  '      ...',
  '    # Subtest: nested fails',
  '    not ok 2 - nested fails',
  '      ---',
  "      type: 'test'",
  "      location: '/w/a.test.js:7:3'",
  "      failureType: 'testCodeFailure'",
  '      ...',
  '    # Subtest: inner',
  '        # Subtest: deep fails',
  '        not ok 1 - deep fails',
  '          ---',
  "          type: 'test'",
  "          location: '/w/a.test.js:8:29'",
  "          failureType: 'testCodeFailure'",
  '          ...',
  '        1..1',
  '    not ok 3 - inner',
  '      ---',
  "      type: 'suite'",
  "      location: '/w/a.test.js:8:3'",
  "      failureType: 'subtestsFailed'",
  '      ...',
  '    1..3',
  'not ok 3 - suite one',
  '  ---',
  "  type: 'suite'",
  "  location: '/w/a.test.js:5:1'",
  "  failureType: 'subtestsFailed'",
  '  ...',
  '# Subtest: parent with subtests',
  '    # Subtest: sub passes',
  '    ok 1 - sub passes',
  '      ---',
  "      type: 'test'",
  '      ...',
  '    # Subtest: sub fails',
  '    not ok 2 - sub fails',
  '      ---',
  "      type: 'test'",
  "      location: '/w/a.test.js:12:11'",
  "      failureType: 'testCodeFailure'",
  '      ...',
  '    1..2',
  'not ok 4 - parent with subtests',
  '  ---',
  "  type: 'test'",
  "  location: '/w/a.test.js:10:1'",
  "  failureType: 'subtestsFailed'",
  '  ...',
  '# Subtest: skipped one',
  'ok 5 - skipped one # SKIP',
  '  ---',
  "  type: 'test'",
  '  ...',
  '# Subtest: todo one',
  'not ok 6 - todo one # TODO',
  '  ---',
  "  type: 'test'",
  "  location: '/w/a.test.js:15:1'",
  "  failureType: 'testCodeFailure'",
  '  ...',
  '# Subtest: same name in two files',
  'not ok 7 - same name in two files',
  '  ---',
  "  type: 'test'",
  "  location: '/w/b.test.js:3:1'",
  "  failureType: 'testCodeFailure'",
  '  ...',
  '1..7',
  '# tests 11',
  '# suites 2',
  '# pass 3',
  '# fail 6',
  '# cancelled 0',
  '# skipped 1',
  '# todo 1',
  '# duration_ms 144.657037',
].join('\n');

const names = (leaves) => leaves.map((leaf) => `${leaf.file} :: ${leaf.name}`);

test('spec: the failing-tests section yields the leaves, without their parents or the failing TODO', () => {
  assert.deepEqual(names(parseFailingLeafTests(SPEC_FAILING)), [
    'a.test.js :: top fails | with a pipe',
    'a.test.js :: nested fails',
    'a.test.js :: deep fails',
    'a.test.js :: sub fails',
    'b.test.js :: same name in two files',
    'c.test.js :: same name in two files',
  ]);
});

test('the leaf count is not the fail count, and nothing equates them', () => {
  // `fail 7` counts `parent with subtests`, which the section leaves out; six leaves are listed.
  assert.equal(parseFailCount(SPEC_FAILING), 7);
  assert.equal(parseFailingLeafTests(SPEC_FAILING).length, 6);
});

test('TAP: the same run yields the same leaves, parents dropped by their failureType', () => {
  assert.deepEqual(names(parseFailingLeafTests(TAP_FAILING)), [
    '/w/a.test.js :: top fails | with a pipe',
    '/w/a.test.js :: nested fails',
    '/w/a.test.js :: deep fails',
    '/w/a.test.js :: sub fails',
    '/w/b.test.js :: same name in two files',
  ]);
});

test('a timed-out test and a file that throws on load are leaves, and cancelled counts as a failure', () => {
  // Measured: the timeout is counted under `cancelled`, not `fail`, so a rule reading `fail`
  // alone would call this transcript contradictory.
  const spec = [
    '✖ times out (53.13136ms)',
    '✖ e.test.js (64.704231ms)',
    'ℹ tests 4',
    'ℹ pass 2',
    'ℹ fail 1',
    'ℹ cancelled 1',
    '',
    '✖ failing tests:',
    '',
    'test at d.test.js:2:1',
    '✖ times out (53.13136ms)',
    "  'test timed out after 50ms'",
    '',
    'test at e.test.js:1:1',
    '✖ e.test.js (64.704231ms)',
    "  'test failed'",
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(spec)), ['d.test.js :: times out', 'e.test.js :: e.test.js']);
  // A timeout alone: `fail 0`, `cancelled 1`, one leaf. Reading `fail` alone refuses this one.
  const timeoutOnly = [
    'ℹ fail 0',
    'ℹ cancelled 1',
    '✖ failing tests:',
    'test at d.test.js:2:1',
    '✖ times out (53.13136ms)',
    "  'test timed out after 50ms'",
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(timeoutOnly)), ['d.test.js :: times out']);
});

test('a failing hook and a timed-out parent: cancelled children print no duration, and both reporters list the same five', () => {
  // Measured on node v26.11.1 (#1100 review, S2): a describe whose before() throws, and a parent
  // that times out with a child still running. `fail 0`, `cancelled 4`. Until the cancelled shape
  // was read, the duration-less entries made the whole transcript unreadable.
  const spec = [
    'ℹ tests 4',
    'ℹ pass 0',
    'ℹ fail 0',
    'ℹ cancelled 4',
    '',
    '✖ failing tests:',
    '',
    'test at hook.test.mjs:4:3',
    '✖ child one',
    "  'test did not finish before its parent and was cancelled'",
    '',
    'test at hook.test.mjs:5:3',
    '✖ child two',
    "  'test did not finish before its parent and was cancelled'",
    '',
    'test at hook.test.mjs:2:1',
    '✖ suite with failing before (1.537871ms)',
    '  Error: hook boom',
    '',
    'test at hook.test.mjs:8:11',
    '✖ slow child (53.585143ms)',
    "  'test did not finish before its parent and was cancelled'",
    '',
    'test at hook.test.mjs:7:1',
    '✖ parent that times out (54.196835ms)',
    "  'test timed out after 50ms'",
  ].join('\n');
  const tap = [
    '    not ok 1 - child one',
    '      ---',
    "      location: '/w/hook.test.mjs:4:3'",
    "      failureType: 'cancelledByParent'",
    '      ...',
    '    not ok 2 - child two',
    '      ---',
    "      location: '/w/hook.test.mjs:5:3'",
    "      failureType: 'cancelledByParent'",
    '      ...',
    'not ok 1 - suite with failing before',
    '  ---',
    "  location: '/w/hook.test.mjs:2:1'",
    "  failureType: 'hookFailed'",
    '  ...',
    '    not ok 1 - slow child',
    '      ---',
    "      location: '/w/hook.test.mjs:8:11'",
    "      failureType: 'cancelledByParent'",
    '      ...',
    'not ok 2 - parent that times out',
    '  ---',
    "  location: '/w/hook.test.mjs:7:1'",
    "  failureType: 'testTimeoutFailure'",
    '  ...',
    '# fail 0',
    '# cancelled 4',
  ].join('\n');
  const five = ['child one', 'child two', 'suite with failing before', 'slow child', 'parent that times out'];
  assert.deepEqual(parseFailingLeafTests(spec).map((leaf) => leaf.name), five);
  assert.deepEqual(parseFailingLeafTests(tap).map((leaf) => leaf.name), five);
  // A cancelled name holding ` # ` is not cut at it, and a timed name holding one is not either.
  const hashes = ['ℹ fail 1', 'ℹ cancelled 1', '✖ failing tests:', 'test at h.test.mjs:1:1', '✖ cancelled # with a hash',
    'test at h.test.mjs:2:1', '✖ timed # with a hash (2ms)'].join('\n');
  assert.deepEqual(parseFailingLeafTests(hashes).map((leaf) => leaf.name), ['cancelled # with a hash', 'timed # with a hash']);
});

test('a TAP-shaped line a test prints into a spec transcript is not read as a leaf', () => {
  // Measured (#1100 review, checker N2): a passing test that console.logs `not ok 3 - phantom`
  // puts it at column 0 of the spec output, where the TAP reader used to find a leaf.
  const green = ['not ok 3 - phantom printed by a passing test', '✔ prints a line (1ms)', 'ℹ tests 1', 'ℹ pass 1', 'ℹ fail 0', 'ℹ cancelled 0'].join('\n');
  assert.deepEqual(parseFailingLeafTests(green), [], 'a green spec run with a printed TAP line fails nothing');
  const red = ['not ok 3 - phantom', 'ℹ fail 1', 'ℹ cancelled 0', '✖ failing tests:', 'test at r.test.mjs:1:1', '✖ the real one (1ms)'].join('\n');
  assert.deepEqual(parseFailingLeafTests(red).map((leaf) => leaf.name), ['the real one']);
});

test('a TODO child cancelled by its parent is read and skipped; a name split by a newline is refused, not cut', () => {
  // Measured on node v26.11.1 (#1100 review round 2): a describe whose before() throws, holding a
  // plain child and a TODO child, and a timed test whose name holds a newline.
  const shapes = [
    'ℹ fail 1',
    'ℹ cancelled 1',
    'ℹ todo 1',
    '✖ failing tests:',
    'test at shapes.test.mjs:4:3',
    '✖ plain child',
    "  'test did not finish before its parent and was cancelled'",
    'test at shapes.test.mjs:5:3',
    '⚠ todo child # TODO',
    "  'test did not finish before its parent and was cancelled'",
    'test at shapes.test.mjs:2:1',
    '✖ suite whose hook fails (15.659313ms)',
    '  Error: hook boom',
  ];
  assert.deepEqual(parseFailingLeafTests(shapes.join('\n')).map((leaf) => leaf.name), ['plain child', 'suite whose hook fails']);
  const split = [...shapes, 'test at shapes.test.mjs:7:1', '✖ failing name with', 'newline (0.37929ms)', '  Error: x'];
  assert.equal(parseFailingLeafTests(split.join('\n')), null, 'a name cut at its newline would be a wrong name, read as a cancelled child');
});

test('a green run returns an empty list, not null', () => {
  assert.deepEqual(parseFailingLeafTests(SPEC_TAIL.replace('ℹ fail 1', 'ℹ fail 0')), []);
  assert.deepEqual(parseFailingLeafTests(TAP_TAIL.replace('# fail 1', '# fail 0')), []);
});

test('an unreadable transcript is null, never an empty list', () => {
  // No summary at all: a pretest hook that failed before node:test ran, say.
  assert.equal(parseFailingLeafTests('npm error code 1\nnpm error path /w'), null);
  assert.equal(parseFailingLeafTests(''), null);
  // A failure counted and no section to name it.
  assert.equal(parseFailingLeafTests(SPEC_TAIL), null);
  assert.equal(parseFailingLeafTests(TAP_TAIL), null);
  // A section entry in a shape the parser does not know. The `test at` prefix pins the edit to the
  // section: the same text without it occurs first in the tree, where a bare replace landed.
  const entry = 'test at a.test.js:8:29\n✖ deep fails (0.236128ms)';
  assert.equal(SPEC_FAILING.split(entry).length, 2, 'the edited entry must exist exactly once');
  const malformed = SPEC_FAILING.replace(entry, 'test at a.test.js:8:29\n  Error: an error line where the test line belongs');
  assert.equal(parseFailingLeafTests(malformed), null);
  // Leaves listed while the summary counts no failure and no cancellation.
  const contradicts = SPEC_FAILING.replace('ℹ fail 7', 'ℹ fail 0');
  assert.equal(parseFailingLeafTests(contradicts), null);
});

test('a name keeps its parentheses, pipes, # and backslashes; a TODO with a reason is still a TODO', () => {
  // Measured: `{ todo: 'later' }` prints `# later` with no TODO in it, and TAP escapes `#` and `\`.
  const spec = [
    'ℹ fail 2',
    'ℹ cancelled 0',
    '✖ failing tests:',
    'test at f.test.js:2:1',
    '✖ hash # inside and back\\slash (1.986984ms)',
    'test at f.test.js:3:1',
    '⚠ todo with reason (0.320709ms) # later',
    'test at f.test.js:4:1',
    '✖ calls f(x) (twice) (2.5ms)',
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(spec)), [
    'f.test.js :: hash # inside and back\\slash',
    'f.test.js :: calls f(x) (twice)',
  ]);
  const tap = [
    'not ok 1 - hash \\# inside and back\\\\slash',
    '  ---',
    "  location: '/w/f.test.js:2:1'",
    "  failureType: 'testCodeFailure'",
    '  ...',
    'not ok 2 - todo with reason # TODO later',
    '  ---',
    "  location: '/w/f.test.js:3:1'",
    "  failureType: 'testCodeFailure'",
    '  ...',
    '# fail 1',
    '# cancelled 0',
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(tap)), ['/w/f.test.js :: hash # inside and back\\slash']);
});

test('colour forced into the pipe does not hide the section', () => {
  // Measured with FORCE_COLOR=1: the header and the entry are wrapped in SGR sequences.
  const coloured = [
    '\x1b[34mℹ fail 1\x1b[39m',
    '\x1b[34mℹ cancelled 0\x1b[39m',
    '',
    '\x1b[31m✖ failing tests:\x1b[39m',
    '',
    'test at b.test.js:3:1',
    '\x1b[31m✖ same name in two files \x1b[90m(15.641273ms)\x1b[39m\x1b[39m',
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(coloured)), ['b.test.js :: same name in two files']);
});

test('a transcript quoted inside a failing test adds no leaf and no count, in either reporter', () => {
  // node indents an error's text, so a fixture printed inside an assertion diff sits off column 0.
  // These quote a whole failing transcript, summary included, in exactly that position.
  const spec = [
    'ℹ fail 1',
    'ℹ cancelled 0',
    '✖ failing tests:',
    'test at real.test.js:9:1',
    '✖ the real leaf (1ms)',
    '  AssertionError: unexpected',
    '  ℹ fail 9',
    '  ✖ failing tests:',
    '  test at quoted.test.js:1:1',
    '  ✖ a quoted leaf (1ms)',
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(spec)), ['real.test.js :: the real leaf']);
  const tap = [
    'ok 1 - passes, with quoted text in its block',
    '  ---',
    '  note: |-',
    '    not ok 7 - quoted in a passing block',
    '  ...',
    'not ok 2 - the real leaf',
    '  ---',
    "  location: '/w/real.test.js:9:1'",
    "  failureType: 'testCodeFailure'",
    '  error: |-',
    '    not ok 8 - quoted in a failing block',
    // A field read at any indent would take this one and drop the real leaf as a parent.
    "    failureType: 'subtestsFailed'",
    '    # fail 9',
    '  ...',
    '# fail 1',
    '# cancelled 0',
  ].join('\n');
  assert.deepEqual(names(parseFailingLeafTests(tap)), ['/w/real.test.js :: the real leaf']);
});

test('a real failing node:test run whose error message is a transcript yields only its own leaf', (t) => {
  // The case the column-0 anchor exists for, run rather than described. The shape matters and was
  // measured (node v26.11.1): an `assert.equal` diff prints a multi-line string ESCAPED on one
  // line (`+ 'ℹ fail 3\n✖ failing tests:\n…'`), which no line-anchored reader can misread, while a
  // thrown Error prints each line of its message on its own line, indented two columns. That is
  // the shape a parser without the anchor misreads, so it is the one run here.
  const dir = mkdtempSync(join(tmpdir(), 'leaf-names-'));
  t.after(() => rmTree(dir));
  const quoted = ['ℹ fail 3', '✖ failing tests:', 'test at quoted.test.js:1:1', '✖ a quoted leaf (1ms)'].join('\n');
  writeFileSync(join(dir, 'quotes.test.mjs'), [
    "import { test } from 'node:test';",
    `test('throws a transcript as its message', () => { throw new Error(${JSON.stringify(quoted)}); });`,
    '',
  ].join('\n'));
  // NODE_TEST_CONTEXT goes: node:test exports it to this file's process, and a nested `node --test`
  // that inherits it reports to a parent that is not listening, exiting 0 with no summary
  // (measured on node v26.11.1: `child-v8`, exit 0, 184 bytes, against exit 1 with the summary).
  const env = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, ['--test', 'quotes.test.mjs'], { cwd: dir, encoding: 'utf8', env });
  const output = `${run.stdout}${run.stderr}`;
  assert.notEqual(run.status, 0, 'the fixture test must fail');
  assert.match(output, /^ {2}test at quoted\.test\.js:1:1$/m, 'the quoted lines must arrive on lines of their own, or this proves nothing');
  assert.deepEqual(names(parseFailingLeafTests(output)), ['quotes.test.mjs :: throws a transcript as its message']);
});

test('addedFailingTests subtracts the baseline by file and name, as a multiset, and keeps null', () => {
  const leaf = (file, name) => ({ file, name });
  const baseline = [leaf('a.js', 'shared'), leaf('a.js', 'twice')];
  const mutant = [leaf('a.js', 'shared'), leaf('a.js', 'twice'), leaf('a.js', 'twice'), leaf('b.js', 'shared'), leaf('a.js', 'new')];
  assert.deepEqual(names(addedFailingTests(baseline, mutant)), ['a.js :: twice', 'b.js :: shared', 'a.js :: new']);
  assert.deepEqual(addedFailingTests([], []), []);
  assert.equal(addedFailingTests(null, mutant), null);
  assert.equal(addedFailingTests(baseline, null), null);
});
