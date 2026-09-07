/**
 * Tests for `scripts/gate-envelope.js`.
 *
 * A verification tool with no tests of its own is worse than most untested code: it is trusted
 * exactly when it is wrong, and everything measured through it inherits the error silently. The
 * three failures below are the ones that make an envelope LOOK thorough while proving nothing —
 * a case whose `find` matches no site, a survivor reported as a pass, and a mutated file left
 * behind so every later measurement is a self-consistent lie.
 *
 * Each test builds a throwaway tree and points the tool at it with `--root`, so the real repo is
 * never mutated by the suite.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { rmTree } from './_tmp.js';

const TOOL = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'gate-envelope.js');

/**
 * A tree with a trivial gate: `check.sh` exits 1 and prints a FAIL line when `subject.sh` no
 * longer contains the token `GUARDED`.
 */
function makeTree(cases) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-envelope-'));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(join(dir, 'subject.sh'), '#!/usr/bin/env bash\n# GUARDED marker\necho hello\n');
  writeFileSync(join(dir, 'check.sh'),
    '#!/usr/bin/env bash\n'
    + 'if grep -q GUARDED subject.sh; then echo "OK: marker present"; exit 0; fi\n'
    + 'echo "FAIL: the GUARDED marker is gone"\nexit 1\n');
  writeFileSync(join(dir, 'spec.mjs'),
    "export const gate = { command: ['bash', 'check.sh'] };\n"
    + `export const cases = ${JSON.stringify(cases, null, 2)};\n`);
  return dir;
}

function runTool(dir, extra = []) {
  const r = spawnSync(process.execPath, [TOOL, '--root', dir, '--spec', 'spec.mjs', ...extra],
    { encoding: 'utf8', cwd: dir });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

const KILLABLE = {
  label: 'the marker is removed',
  file: 'subject.sh',
  find: '# GUARDED marker',
  replace: '# nothing here',
  expect: 'the GUARDED marker is gone',
};

test('a mutation the gate catches is reported KILLED, and exits 0', () => {
  const dir = makeTree([KILLABLE]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[KILLED\]/);
    assert.equal(status, 0);
    // The subject is back exactly as it was — the property everything else depends on.
    assert.match(readFileSync(join(dir, 'subject.sh'), 'utf8'), /# GUARDED marker/);
    assert.equal(existsSync(join(dir, 'subject.sh.gate-envelope.bak')), false);
  } finally {
    rmTree(dir);
  }
});

test('a mutation the gate MISSES is reported SURVIVED, and exits non-zero', () => {
  // The whole point of an envelope. A tool that reported this as a pass would certify an
  // unenforced property as enforced.
  const dir = makeTree([{
    label: 'an unguarded line is changed',
    file: 'subject.sh',
    find: 'echo hello',
    replace: 'echo goodbye',
    expect: 'the GUARDED marker is gone',
  }]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[SURVIVED\]/);
    assert.equal(status, 1);
  } finally {
    rmTree(dir);
  }
});

test('a `find` matching no site is INCONCLUSIVE, never a pass', () => {
  // The silent-vacuity case: the mutation changes nothing, the gate stays green, and a naive
  // runner records a pass. Two of this session's hand-written cases were mis-specified this way.
  const dir = makeTree([{
    label: 'a typo in the find string',
    file: 'subject.sh',
    find: '# GUARDED marekr',
    replace: 'x',
    expect: 'the GUARDED marker is gone',
  }]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[INCONCLUSIVE\].*0 match site/s);
    assert.equal(status, 1);
  } finally {
    rmTree(dir);
  }
});

test('a red run that does not carry the expected message is WRONG-RED, not a kill', () => {
  // The distinction that separated real defects from fixture errors: a gate can go red for a
  // reason unrelated to the property under test, and counting that as a kill overstates coverage.
  const dir = makeTree([{
    label: 'right break, wrong expectation',
    file: 'subject.sh',
    find: '# GUARDED marker',
    replace: '# nothing here',
    expect: 'some message this gate never prints',
  }]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[WRONG-RED\]/);
    assert.equal(status, 1);
  } finally {
    rmTree(dir);
  }
});

test('an expected-survivor case passes when it survives and flags an unexpected kill', () => {
  const dir = makeTree([{
    label: 'a documented non-guarantee',
    file: 'subject.sh',
    find: 'echo hello',
    replace: 'echo goodbye',
    expect: null,
    why: 'this gate deliberately does not look at that line',
  }]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[SURVIVED as documented\]/);
    assert.equal(status, 0, 'a documented limit that holds is not a failure');
  } finally {
    rmTree(dir);
  }

  const dir2 = makeTree([{
    label: 'a limit that is no longer real',
    file: 'subject.sh',
    find: '# GUARDED marker',
    replace: '# nothing here',
    expect: null,
  }]);
  try {
    const { status, out } = runTool(dir2);
    assert.match(out, /\[UNEXPECTED KILL\]/);
    assert.equal(status, 1, 'a documented limit that stopped being real must be re-read');
  } finally {
    rmTree(dir2);
  }
});

test('a mutant that does not parse is INVALID, not a kill', () => {
  // Breaking the file so it cannot load makes the gate red for a reason that says nothing about
  // what the gate understands. mutation-check.js documents this trap; the same one applies here,
  // and for shell it needs `bash -n` rather than `node --check`.
  const dir = makeTree([{
    label: 'the mutant is not valid shell',
    file: 'subject.sh',
    find: 'echo hello',
    replace: 'if [ ; then',
    expect: 'the GUARDED marker is gone',
  }]);
  try {
    const { status, out } = runTool(dir);
    assert.match(out, /\[INVALID\]/);
    assert.equal(status, 1);
    assert.match(readFileSync(join(dir, 'subject.sh'), 'utf8'), /echo hello/,
      'an INVALID mutant must never be left on disk');
  } finally {
    rmTree(dir);
  }
});

test('a case may declare N sites, and a drift from N is still refused', () => {
  // `sites` is a count, not an `allowMultiple` boolean. A boolean says "however many there are
  // is fine", which is the same silence as no check — a find string that starts matching a third
  // site after an unrelated edit would still pass. Naming the number turns that into a failure.
  const dir = makeTree([{
    label: 'both markers removed',
    file: 'subject.sh',
    find: 'GUARDED',
    replace: 'gone',
    sites: 1,
  }]);
  try {
    // The fixture has one GUARDED; declaring 1 is right, so this must run and kill.
    const { out } = runTool(dir);
    assert.match(out, /\[KILLED\]|\[WRONG-RED\]/, 'a correct site count must not be refused');
  } finally {
    rmTree(dir);
  }

  const dir2 = makeTree([{
    label: 'declares two sites but there is one',
    file: 'subject.sh',
    find: 'GUARDED',
    replace: 'gone',
    expect: 'the GUARDED marker is gone',
    sites: 2,
  }]);
  try {
    const { status, out } = runTool(dir2);
    assert.match(out, /\[INCONCLUSIVE\].*1 match site\(s\).*expected exactly 2/s);
    assert.equal(status, 1);
  } finally {
    rmTree(dir2);
  }
});

test('every site is mutated when a case declares more than one', () => {
  // `String.replace` with a string pattern replaces only the FIRST occurrence — a trap that
  // would leave a `sites: 2` case half-mutated, and the gate might well stay green on the
  // survivor, scoring the property as unenforced when it is merely half-broken.
  const dir = mkdtempSync(join(tmpdir(), 'aa-envelope-multi-'));
  try {
    writeFileSync(join(dir, 'subject.sh'), '#!/usr/bin/env bash\n# GUARDED a\n# GUARDED b\necho hi\n');
    writeFileSync(join(dir, 'check.sh'),
      '#!/usr/bin/env bash\n'
      + 'n=$(grep -c GUARDED subject.sh)\n'
      + 'if [ "$n" = "2" ]; then echo "OK: both markers present"; exit 0; fi\n'
      + 'echo "FAIL: expected 2 markers, found $n"\nexit 1\n');
    writeFileSync(join(dir, 'spec.mjs'),
      "export const gate = { command: ['bash', 'check.sh'] };\n"
      + 'export const cases = [{ label: "both", file: "subject.sh", find: "# GUARDED",'
      + ' replace: "# gone", expect: "expected 2 markers, found 0", sites: 2 }];\n');
    const { status, out } = runTool(dir);
    assert.match(out, /\[KILLED\]/);
    assert.match(out, /found 0/, 'both sites must be mutated, not just the first');
    assert.equal(status, 0);
  } finally {
    rmTree(dir);
  }
});

test('a non-green baseline refuses to measure anything', () => {
  const dir = makeTree([KILLABLE]);
  try {
    // Break the subject up front: the gate is already red, so every "kill" below would be one.
    writeFileSync(join(dir, 'subject.sh'), '#!/usr/bin/env bash\necho hello\n');
    const { status, out } = runTool(dir);
    assert.match(out, /baseline is not green/);
    assert.equal(status, 2, 'refusal must be distinguishable from a measured failure');
  } finally {
    rmTree(dir);
  }
});

test('a stale backup halts the run rather than overwriting it', () => {
  // A previous run died hard, so the file on disk may already be a mutant. Restoring from THIS
  // run's buffer would bake that mutation in permanently while reporting success.
  const dir = makeTree([KILLABLE]);
  try {
    writeFileSync(join(dir, 'subject.sh.gate-envelope.bak'), 'whatever');
    const { status, out } = runTool(dir);
    assert.match(out, /stale backup present/);
    assert.equal(status, 2);
  } finally {
    rmTree(dir);
  }
});

test('the a10 envelope spec is well formed and every case is distinct', async () => {
  // Guards the committed artifact itself: a duplicated label makes `--only` ambiguous, and a
  // missing field would surface only as an INCONCLUSIVE mid-run.
  const spec = await import('../envelopes/a10-content-type-literals.mjs');
  assert.ok(Array.isArray(spec.gate.command) && spec.gate.command.length > 0);
  assert.ok(spec.cases.length >= 10, 'the A10 envelope should stay comprehensive');
  const labels = spec.cases.map((c) => c.label);
  assert.equal(new Set(labels).size, labels.length, 'labels must be unique');
  for (const c of spec.cases) {
    assert.ok(c.file && c.find && c.replace !== undefined, `case '${c.label}' is missing a field`);
    assert.notEqual(c.find, c.replace, `case '${c.label}' mutates nothing`);
    assert.ok(c.expect === null || typeof c.expect === 'string');
    if (c.expect === null) assert.ok(c.why, `expected-survivor '${c.label}' must say why`);
  }
});
