/**
 * End-to-end tests for how `scripts/mutation-check.js` runs the test command (#819).
 *
 * `mutation-check.js` runs its pipeline at import, so these drive the real file as a subprocess
 * against a throwaway repository. Git is isolated for this process at module scope
 * (`isolateGitEnv`): the tool spawns its own git with the inherited environment, and an
 * inherited `GIT_DIR` would point it at the caller's repository.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';
import { initRepo, isolateGitEnv } from './_git-fixture.js';

isolateGitEnv();

const TOOL = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'mutation-check.js');

/** A throwaway repository holding one committed `notes.md` (syntax-free: no interpreter needed). */
function makeRepo(t, content = 'alpha\n') {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-run-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'notes.md'), content, 'utf8');
  const git = initRepo(dir);
  return { dir, git };
}

/** Run the tool; `timeout` bounds the whole run, so a regression hangs this test, not the suite. */
function runTool(cwd, args, timeout = 60_000) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd, encoding: 'utf8', timeout });
  return { status: r.status, signal: r.signal, out: `${r.stdout}\n${r.stderr}` };
}

// ── --replace and --from/--to (#783) ────────────────────────────────────────

test('--replace refuses a value carrying ::: or ::::, naming the ambiguity, before any baseline', (t) => {
  // `'def f():::def f()'` was split at its first `::` and applied `:def f():` — a prepended
  // colon where a removed one was asked for, silently.
  const { dir, git } = makeRepo(t, 'def build(filler, width):\n    return filler * width\n');
  for (const value of ['def build(filler, width):::def build(filler, width)',
    'def build(filler, width)::::def build(filler, width):']) {
    const r = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', value]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /contains ':::'.*ambiguous/s, r.out);
    assert.match(r.out, /--from <old> --to <new>/, 'the refusal names the way out');
    assert.doesNotMatch(r.out, /\[1\/5\]/, 'refused before a baseline is spent');
  }
  assert.equal(git('status', '--porcelain'), '');
});

test('--replace still splits at the first :: for a value without :::', (t) => {
  const { dir } = makeRepo(t, 'alpha\n');
  // Green on the original line and on exactly `beta::gamma`; any other split goes red.
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'grep -qx -e alpha -e "beta::gamma" notes.md',
    '--replace', 'alpha::beta::gamma']);
  assert.match(r.out, /mutation: replace "alpha" with "beta::gamma"/, r.out);
  assert.match(r.out, /MUTANT SURVIVED/, `the mutant held beta::gamma, so the grep stayed green\n${r.out}`);
});

test('--from/--to expresses an <old> ending in a colon: #758\'s mutant reports INVALID MUTANT', (t) => {
  // #758's acceptance criterion, re-expressed: remove the `def` line's colon.
  const { dir, git } = makeRepo(t);
  writeFileSync(join(dir, 'gen.py'), 'def build(filler, width, nlines, eol):\n    return filler * width\n', 'utf8');
  git('add', 'gen.py');
  git('commit', '-qm', 'py');
  const r = runTool(dir, ['--file', 'gen.py', '--test', 'python3 gen.py',
    '--from', 'def build(filler, width, nlines, eol):', '--to', 'def build(filler, width, nlines, eol)']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /mutation: replace "def build\(filler, width, nlines, eol\):" with "def build\(filler, width, nlines, eol\)"/);
  assert.match(r.out, /INVALID MUTANT/);
  assert.doesNotMatch(r.out, /:def build/, 'no stray colon was prepended');
  assert.equal(git('status', '--porcelain'), '', 'restored');
});

test('--to may be empty: the check is presence, not truthiness', (t) => {
  const { dir } = makeRepo(t, 'alpha\nomega\n');
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'grep -q alpha notes.md', '--from', 'alpha', '--to', '']);
  assert.match(r.out, /mutation: replace "alpha" with ""/, r.out);
  assert.match(r.out, /MUTANT KILLED/, 'deleting alpha fails the grep');
});

test('--from/--to are refused half-given, beside another mutation flag, or with an empty <old>', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const cases = [
    [['--from', 'alpha'], /--from and --to must be given together/],
    [['--to', 'beta'], /--from and --to must be given together/],
    [['--from', 'alpha', '--to', 'beta', '--replace', 'alpha::beta'], /mutually exclusive/],
    [['--from', 'alpha', '--to', 'beta', '--delete-matching', 'alpha'], /mutually exclusive/],
    [['--from', '', '--to', 'beta'], /empty <old>/],
    // The same split, reached through --replace: an empty <old> matched every character gap
    // and the tool printed `0 site(s) mutated` over a rewritten file.
    [['--replace', '::x'], /empty <old>/],
  ];
  for (const [flags, expected] of cases) {
    const r = runTool(dir, ['--file', 'notes.md', '--test', 'true', ...flags]);
    assert.equal(r.status, 1, `${flags.join(' ')}\n${r.out}`);
    assert.match(r.out, expected, `${flags.join(' ')}\n${r.out}`);
    assert.doesNotMatch(r.out, /\[1\/5\]/, `${flags.join(' ')}: refused before a baseline`);
  }
  assert.equal(git('status', '--porcelain'), '');
});

// ── stdin (#819 AC2) ────────────────────────────────────────────────────────

test('the test command gets no stdin: a command that reads it sees EOF instead of waiting', (t) => {
  // The #816 hang: the child inherited an open pipe that nothing ever wrote to or closed, so a
  // test that read stdin waited forever. `timeout 3` bounds the old behaviour, which then reads
  // as a red BASELINE (exit 124); with stdin closed, `cat` sees EOF at once, the baseline is
  // green, and the unasserted mutant survives. Both end in exit 1, so the text discriminates.
  const { dir, git } = makeRepo(t);
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'timeout 3 cat', '--replace', 'alpha::beta']);
  assert.doesNotMatch(r.out, /Baseline is already failing/, r.out);
  assert.match(r.out, /MUTANT SURVIVED/, r.out);
  assert.equal(git('status', '--porcelain'), '', 'restored');
});
