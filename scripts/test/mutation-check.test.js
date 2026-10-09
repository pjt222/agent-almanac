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
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
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

// ── --timeout and the process group (#819) ──────────────────────────────────

/** A directory outside the fixture repository, so a marker written there cannot dirty it. */
function markerDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-marker-'));
  t.after(() => rmTree(dir));
  return join(dir, 'grandchild-survived');
}

/** Wait long enough for a surviving grandchild's `sleep 3` to have finished and written. */
const outlastGrandchild = () => new Promise((settle) => setTimeout(settle, 4_000));

/**
 * Start the grandchild, then record that it exists. An absent marker proves the kill reached it
 * only if it was running: the interrupt test used to signal on `[4/5]`, before the shell had run
 * its `grep`, so no grandchild ever started and the test passed against 1e7ed10fe as well.
 */
const grandchild = (marker) => `(sleep 3 && touch '${marker}') & touch '${marker}.started'`;

test('a mutant whose test hangs is HUNG -- inconclusive, exit 1, never a kill -- and its process group dies', async (t) => {
  // The hang sits one level BELOW the spawned shell: `( ... ) &` forks a subshell, which outlives
  // a kill aimed at the shell alone (measured on #819). A fix that kills only the direct child
  // still prints HUNG; the marker is what tells the two apart.
  const marker = markerDir(t);
  const { dir, git } = makeRepo(t, 'alpha\n');
  const before = readFileSync(join(dir, 'notes.md'));
  const test = `grep -qx alpha notes.md || { ${grandchild(marker)}; wait; }`;
  const r = runTool(dir, ['--file', 'notes.md', '--test', test, '--replace', 'alpha::beta', '--timeout', '1']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^HUNG — /m, r.out);
  assert.match(r.out, /INCONCLUSIVE/, 'HUNG is in the inconclusive family');
  assert.doesNotMatch(r.out, /MUTANT KILLED/, r.out);
  assert.match(r.out, /green\./, 'the baseline itself finished');
  assert.deepEqual(readFileSync(join(dir, 'notes.md')), before, 'restored byte-identical');
  assert.equal(git('status', '--porcelain'), '');
  assert.ok(existsSync(`${marker}.started`), 'the grandchild was running when the kill came');
  await outlastGrandchild();
  assert.equal(existsSync(marker), false, 'the grandchild outlived the timeout kill');
});

// Every handler kills the group; with only SIGINT driven, the SIGTERM one went unasserted. A
// terminal hangup reaches only the checker's group now, so SIGHUP needs the handler too.
for (const [signal, expectedExit] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) {
  test(`an interrupt (${signal}) during the mutant run kills the test's process group and restores the file`, async (t) => {
    // The test now runs in a group of its own, so a terminal's Ctrl-C no longer reaches it; the
    // handler has to. Signalled once the grandchild exists, so the mutation is on disk and the
    // shell is past its `grep`.
    const marker = markerDir(t);
    const { dir, git } = makeRepo(t, 'alpha\n');
    const test = `grep -qx alpha notes.md || { ${grandchild(marker)}; wait; }`;
    const child = spawn(process.execPath, [TOOL, '--file', 'notes.md', '--test', test, '--replace', 'alpha::beta'],
      { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { out += chunk; });
    const poll = setInterval(() => {
      if (existsSync(`${marker}.started`)) { clearInterval(poll); child.kill(signal); }
    }, 20);
    const [code] = await once(child, 'close');
    clearInterval(poll);
    assert.equal(code, expectedExit, out);
    assert.equal(readFileSync(join(dir, 'notes.md'), 'utf8'), 'alpha\n', 'restored');
    assert.equal(git('status', '--porcelain'), '');
    await outlastGrandchild();
    assert.equal(existsSync(marker), false, 'the grandchild outlived the interrupt');
  });
}

test('a shell still running at --timeout is HUNG, and the run does not wait for a process that left its group', (t) => {
  // `setsid` puts the sleep in a session of its own, out of reach of the group kill, still
  // holding stdout. The shell is still in its `wait` when the timer fires, so this is the
  // kill-first ordering. Settling on 'close' would wait the full 10 s for the sleep; the
  // shell's exit is enough once the run was killed. The escaped sleep finishes on its own.
  const { dir } = makeRepo(t, 'alpha\n');
  const test = 'grep -qx alpha notes.md || { setsid sleep 10 & wait; }';
  const started = Date.now();
  const r = runTool(dir, ['--file', 'notes.md', '--test', test, '--replace', 'alpha::beta', '--timeout', '1']);
  const elapsed = Date.now() - started;
  assert.match(r.out, /^HUNG — /m, r.out);
  assert.ok(elapsed < 7_000, `the run waited ${elapsed} ms for a process outside the group`);
});

test('a shell that exits before --timeout keeps its own verdict, and a process that left its group does not hold the run', (t) => {
  // The exit-first ordering. The shell has already exited when the timer fires, and a `setsid`
  // process it started still holds its pipes, so 'close' does not come. The run used to wait for
  // that process however long it ran, then report the shell's real exit 1 as HUNG (#819, round
  // 1). The shell's result is the verdict; the limit only ends the wait for the straggler.
  const { dir, git } = makeRepo(t, 'alpha\n');

  // Green on the original line, so the baseline settles on 'close'. Red on the mutant, which
  // leaves the straggler behind.
  let started = Date.now();
  const killed = runTool(dir, ['--file', 'notes.md', '--test', 'grep -qx alpha notes.md || { setsid sleep 10 & exit 1; }',
    '--replace', 'alpha::beta', '--timeout', '1']);
  let elapsed = Date.now() - started;
  assert.equal(killed.status, 0, killed.out);
  assert.match(killed.out, /^MUTANT KILLED/m, killed.out);
  assert.doesNotMatch(killed.out, /HUNG/, killed.out);
  assert.match(killed.out, /the shell ended \(exit 1\) after [\d.]+ s, but a process it started still held its output/,
    'the run says what it did not wait for');
  assert.ok(elapsed < 7_000, `the mutant run waited ${elapsed} ms for a process outside the group`);
  assert.equal(git('status', '--porcelain'), '', 'restored');

  // The same ordering on the baseline: the shell exits 0 and leaves a straggler, in both runs.
  started = Date.now();
  const green = runTool(dir, ['--file', 'notes.md', '--test', 'setsid sleep 10 & exit 0',
    '--replace', 'alpha::beta', '--timeout', '1']);
  elapsed = Date.now() - started;
  assert.doesNotMatch(green.out, /Baseline HUNG/, green.out);
  assert.match(green.out, /green\./, green.out);
  assert.match(green.out, /\[2\/5\]/, 'the mutation was applied, so the baseline was judged green');
  assert.ok(elapsed < 9_000, `the two runs waited ${elapsed} ms for processes outside the group`);
  assert.equal(git('status', '--porcelain'), '', 'restored');
});

test('a baseline that hangs is refused as HUNG before any mutation is applied', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'sleep 30', '--replace', 'alpha::beta', '--timeout', '1']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /Baseline HUNG/, r.out);
  assert.doesNotMatch(r.out, /\[2\/5\]/, 'nothing was mutated');
  assert.equal(git('status', '--porcelain'), '');
});

test('--timeout takes a whole number of seconds and documents its default', (t) => {
  const { dir } = makeRepo(t, 'alpha\n');
  for (const value of ['0', '-1', '1.5', 'abc', '', '9999999']) {
    const r = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--timeout', value]);
    assert.equal(r.status, 1, `--timeout ${JSON.stringify(value)}\n${r.out}`);
    assert.match(r.out, /--timeout needs a whole number of seconds/, `--timeout ${JSON.stringify(value)}`);
  }
  const bare = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--timeout']);
  assert.match(bare.out, /--timeout needs a whole number of seconds/, 'a missing value is refused, not defaulted');
  const help = runTool(dir, ['--help']);
  assert.match(help.out, /--timeout <seconds>[\s\S]*default 900\b/, help.out);
});

test('an output overflow kills the whole process group, not only the shell', async (t) => {
  // The overflow guard already killed with SIGKILL, aimed at the shell alone (#819 comment):
  // the run was cut short while the test underneath kept going.
  const marker = markerDir(t);
  const { dir } = makeRepo(t, 'alpha\n');
  const test = `grep -qx alpha notes.md || { ${grandchild(marker)}; head -c 70000000 /dev/zero; wait; }`;
  const r = runTool(dir, ['--file', 'notes.md', '--test', test, '--replace', 'alpha::beta']);
  assert.equal(r.status, 1, r.out.slice(0, 2000));
  assert.match(r.out, /did not complete \(ENOBUFS\)/);
  assert.doesNotMatch(r.out, /MUTANT KILLED/);
  assert.ok(existsSync(`${marker}.started`), 'the grandchild was running when the kill came');
  await outlastGrandchild();
  assert.equal(existsSync(marker), false, 'the grandchild outlived the overflow kill');
});
