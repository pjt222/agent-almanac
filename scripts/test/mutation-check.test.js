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
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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

// ── failing test names (S1) ─────────────────────────────────────────────────

/**
 * A repository whose committed `notes.md` holds `alpha`, with an untracked node:test file that
 * asserts it (and a second test that always passes). Untracked on purpose: only the mutated file
 * must be tracked, and a test file the fixture never commits keeps `git status` honest about it.
 */
function makeNodeTestRepo(t) {
  const { dir, git } = makeRepo(t, 'alpha\n');
  writeFileSync(join(dir, 'check.test.mjs'), [
    "import { test } from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { readFileSync } from 'node:fs';",
    "test('notes hold alpha', () => { assert.match(readFileSync('notes.md', 'utf8'), /alpha/); });",
    "test('an unrelated test passes', () => {});",
    '',
  ].join('\n'));
  writeFileSync(join(dir, 'ok.test.mjs'), "import { test } from 'node:test';\ntest('always passes', () => {});\n");
  return { dir, git };
}

/** A path outside the fixture repository, so the record cannot dirty it. */
function namesPath(t) {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-names-'));
  t.after(() => rmTree(dir));
  return join(dir, 'names.json');
}

test('a node --test command run from inside node:test still reports its failures', (t) => {
  // This suite runs under node:test, which exports NODE_TEST_CONTEXT, and runTool passes it on.
  // A `node --test` that inherits it exits 0 with no summary, so without the checker removing it
  // the baseline reads green and this mutant SURVIVES with no names.
  assert.ok(process.env.NODE_TEST_CONTEXT, 'precondition: the variable reaches the checker, or this proves nothing');
  const { dir, git } = makeNodeTestRepo(t);
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'node --test check.test.mjs', '--replace', 'alpha::beta']);
  assert.match(r.out, /MUTANT KILLED by 1 failing test\(s\)/, r.out);
  assert.match(r.out, /green \(2 passing\)/, 'the baseline summary was read');
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'restored');
});

test('the leaves a mutant adds are printed, indented, and written to --names-out', (t) => {
  const { dir } = makeNodeTestRepo(t);
  const out = namesPath(t);
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'node --test check.test.mjs', '--replace', 'alpha::beta', '--names-out', out]);
  assert.match(r.out, /^ {6}failing tests added over the baseline: 1$/m, r.out);
  assert.match(r.out, /^ {8}✖ notes hold alpha {2}\(check\.test\.mjs\)$/m, r.out);
  assert.doesNotMatch(r.out, /an unrelated test passes {2}\(/, 'a passing test is not a name');
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), {
    readable: true, added: [{ file: 'check.test.mjs', name: 'notes hold alpha' }], unreadable: null,
  });
});

test('a red run that fails no test says none were added; an output with no summary says it could not be read', (t) => {
  const NONE = 'failing tests added over the baseline: 0';
  const UNREAD = 'failing test names: could not be read';
  const { dir } = makeNodeTestRepo(t);
  // node:test passes (fail 0), then the grep goes red under the mutant: a kill that names no test.
  const none = namesPath(t);
  const r1 = runTool(dir, ['--file', 'notes.md', '--test', 'node --test ok.test.mjs && grep -q alpha notes.md', '--replace', 'alpha::beta', '--names-out', none]);
  assert.match(r1.out, /MUTANT KILLED/, r1.out);
  assert.ok(r1.out.includes(NONE) && !r1.out.includes(UNREAD), r1.out);
  assert.deepEqual(JSON.parse(readFileSync(none, 'utf8')), { readable: true, added: [], unreadable: null });
  // No node:test at all: nothing to read in either run.
  const unread = namesPath(t);
  const r2 = runTool(dir, ['--file', 'notes.md', '--test', 'grep -q alpha notes.md', '--replace', 'alpha::beta', '--names-out', unread]);
  assert.match(r2.out, /MUTANT KILLED/, r2.out);
  assert.ok(r2.out.includes(`${UNREAD} from the baseline run's output`) && !r2.out.includes(NONE), r2.out);
  assert.deepEqual(JSON.parse(readFileSync(unread, 'utf8')), { readable: false, added: null, unreadable: 'baseline' });
  // A survivor still writes its record: the mutant ran and added nothing.
  const survived = namesPath(t);
  const r3 = runTool(dir, ['--file', 'notes.md', '--test', 'node --test ok.test.mjs', '--replace', 'alpha::beta', '--names-out', survived]);
  assert.match(r3.out, /MUTANT SURVIVED/, r3.out);
  assert.deepEqual(JSON.parse(readFileSync(survived, 'utf8')), { readable: true, added: [], unreadable: null });
});

test('a test already failing in a baseline that exits 0 is not credited to the mutant', (t) => {
  // "Green" is the exit status. `node --test …; grep …` exits with the grep's status, so a failing
  // node:test leaf can sit in a green baseline; the mutant must be credited only with what it adds.
  const { dir } = makeNodeTestRepo(t);
  writeFileSync(join(dir, 'red.test.mjs'), "import { test } from 'node:test';\ntest('fails before any mutation', () => { throw new Error('already red'); });\n");
  const out = namesPath(t);
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'node --test red.test.mjs; grep -q alpha notes.md', '--replace', 'alpha::beta', '--names-out', out]);
  assert.match(r.out, /MUTANT KILLED/, r.out);
  assert.match(r.out, /failing tests added over the baseline: 0/, r.out);
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), { readable: true, added: [], unreadable: null });
});

test('--names-out with no path is refused before any baseline, and no record is written for a run with no verdict', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--names-out']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--names-out needs a file path/, r.out);
  assert.doesNotMatch(r.out, /\[1\/5\]/, 'refused before a baseline');
  // A mutation that matches nothing ends before any mutant run: there is nothing to record.
  const out = namesPath(t);
  const r2 = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'absent::beta', '--names-out', out]);
  assert.equal(r2.status, 1, r2.out);
  assert.equal(existsSync(out), false, 'no record without a mutant verdict');
  // A mutant that does not parse reaches the verdict block with no names: it must still print its
  // own verdict, not die on the absent record after the restore.
  writeFileSync(join(dir, 'gen.js'), 'module.exports.width = 4;\n', 'utf8'); // no package.json: CommonJS
  git('add', 'gen.js');
  git('commit', '-qm', 'js');
  const r3 = runTool(dir, ['--file', 'gen.js', '--test', 'true', '--replace', 'width = 4;::width = ;', '--names-out', out]);
  assert.equal(r3.status, 1, r3.out);
  assert.match(r3.out, /INVALID MUTANT/, r3.out);
  assert.equal(existsSync(out), false, 'no record for a mutant that never ran');
  assert.equal(git('status', '--porcelain'), '');
});

// ── one baseline per run: --write-baseline and --baseline (S1) ──────────────

/** A directory outside the fixture repository for records and counters. */
function outsideDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-baseline-'));
  t.after(() => rmTree(dir));
  return dir;
}

test('a baseline recorded once is reused, and the row runs its test command once instead of twice', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const out = outsideDir(t);
  const record = join(out, 'baseline.json');
  const counter = join(out, 'runs');
  const testCmd = `echo run >> '${counter}'; grep -q alpha notes.md`;
  const r1 = runTool(dir, ['--test', testCmd, '--write-baseline', record]);
  assert.equal(r1.status, 0, r1.out);
  const written = JSON.parse(readFileSync(record, 'utf8'));
  assert.equal(written.format, 'mutation-check-baseline/1');
  assert.equal(written.head, git('rev-parse', 'HEAD').trim());
  assert.equal(written.test, testCmd);
  assert.deepEqual(written.state, { tracked: [], untracked: [], flagged: [] });
  assert.equal(readFileSync(counter, 'utf8'), 'run\n', 'recording ran the command once');
  const r2 = runTool(dir, ['--file', 'notes.md', '--test', testCmd, '--replace', 'alpha::beta', '--baseline', record]);
  assert.match(r2.out, /\[1\/5\] baseline: reusing the record in /, r2.out);
  assert.match(r2.out, /MUTANT KILLED/, r2.out);
  assert.equal(readFileSync(counter, 'utf8'), 'run\nrun\n', 'the row ran only the mutant, not a second baseline');
  assert.equal(git('status', '--porcelain'), '');
});

test('a recorded baseline is refused when the --test string, HEAD, an untracked entry, an index flag or a tracked file differs', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  writeFileSync(join(dir, 'other.md'), 'other\n');
  git('add', 'other.md');
  git('commit', '-qm', 'other');
  const out = outsideDir(t);
  const record = join(out, 'baseline.json');
  const row = (testCmd = 'grep -q alpha notes.md') => runTool(dir, ['--file', 'notes.md', '--test', testCmd, '--replace', 'alpha::beta', '--baseline', record]);
  const refused = (r, why, label) => {
    assert.equal(r.status, 1, `${label}\n${r.out}`);
    assert.match(r.out, /the recorded baseline does not apply to this run/, `${label}\n${r.out}`);
    assert.match(r.out, why, `${label}\n${r.out}`);
    assert.doesNotMatch(r.out, /\[2\/5\]/, `${label}: refused before any mutation`);
    assert.equal(readFileSync(join(dir, 'notes.md'), 'utf8'), 'alpha\n', label);
  };
  assert.equal(runTool(dir, ['--test', 'grep -q alpha notes.md', '--write-baseline', record]).status, 0);
  refused(row('grep -q alpha notes.md && true'), /recorded under --test "grep -q alpha notes\.md"/, 'another --test');
  writeFileSync(join(dir, 'stray.txt'), 'x\n');
  refused(row(), /the tree's untracked entries differ: now \["stray\.txt"\], recorded \[\]/, 'an untracked file');
  rmTree(join(dir, 'stray.txt'));
  git('update-index', '--assume-unchanged', 'other.md');
  refused(row(), /the tree's flagged entries differ/, 'an index flag');
  git('update-index', '--no-assume-unchanged', 'other.md');
  writeFileSync(join(dir, 'other.md'), 'changed\n');
  refused(row(), /the tree's tracked entries differ/, 'a tracked change elsewhere');
  git('checkout', '--', 'other.md');
  git('commit', '-q', '--allow-empty', '-m', 'moves HEAD');
  refused(row(), /it was recorded at [0-9a-f]{40}, and HEAD is [0-9a-f]{40}/, 'HEAD moved');
});

test('a recorded baseline is refused from another directory, where a relative --test would score a kill it did not earn', (t) => {
  // #1100 review, S1: recorded at the root, reused from sub/, `grep -q alpha notes.md` cannot find
  // its file, goes red under the mutant for that reason alone, and read as MUTANT KILLED (exit 0).
  const { dir, git } = makeRepo(t, 'alpha\n');
  mkdirSync(join(dir, 'sub'));
  writeFileSync(join(dir, 'sub', 'keep.md'), 'x\n');
  git('add', 'sub/keep.md');
  git('commit', '-qm', 'sub');
  const record = join(outsideDir(t), 'baseline.json');
  assert.equal(runTool(dir, ['--test', 'grep -q alpha notes.md', '--write-baseline', record]).status, 0);
  assert.equal(JSON.parse(readFileSync(record, 'utf8')).cwd, '.');
  const r = runTool(join(dir, 'sub'), ['--file', '../notes.md', '--test', 'grep -q alpha notes.md', '--replace', 'alpha::beta', '--baseline', record]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /it was recorded from "\.", and this run starts in "sub"/, r.out);
  assert.doesNotMatch(r.out, /\[2\/5\]|MUTANT KILLED/, 'refused before any mutation');
  assert.equal(git('status', '--porcelain'), '');
});

test('a baseline is not recorded over a dirty tree, over a red run, or when the run writes into the tree', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const record = join(outsideDir(t), 'baseline.json');
  writeFileSync(join(dir, 'notes.md'), 'alpha, edited\n');
  const dirty = runTool(dir, ['--test', 'true', '--write-baseline', record]);
  assert.equal(dirty.status, 1, dirty.out);
  assert.match(dirty.out, /recorded only over a clean tree/, dirty.out);
  assert.doesNotMatch(dirty.out, /\[1\/1\]/, 'refused before the run');
  git('checkout', '--', 'notes.md');
  const red = runTool(dir, ['--test', 'exit 1', '--write-baseline', record]);
  assert.equal(red.status, 1, red.out);
  assert.match(red.out, /Baseline is already failing/, red.out);
  const writes = runTool(dir, ['--test', 'touch made-by-the-test.txt', '--write-baseline', record]);
  assert.equal(writes.status, 1, writes.out);
  assert.match(writes.out, /the baseline run changed the tree it ran in/, writes.out);
  assert.equal(existsSync(record), false, 'no record from any of the three');
});

test('a file that is not a baseline record is refused, and the record flags refuse what they cannot honour', (t) => {
  const { dir, git } = makeRepo(t, 'alpha\n');
  const out = outsideDir(t);
  const cases = [
    ['not json', /cannot be read as a baseline record/],
    [JSON.stringify({ format: 'something-else/1' }), /is not a mutation-check-baseline\/1 record/],
    [JSON.stringify({ format: 'mutation-check-baseline/1', passCount: 1, leaves: 'x', state: {} }), /is not a mutation-check-baseline\/1 record/],
  ];
  cases.forEach(([content, expected], index) => {
    const record = join(out, `bad-${index}.json`);
    writeFileSync(record, content);
    const r = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--baseline', record]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, expected, r.out);
    assert.doesNotMatch(r.out, /\[2\/5\]/, 'refused before any mutation');
  });
  const flagCases = [
    [['--test', 'true', '--write-baseline', join(out, 'b.json'), '--file', 'notes.md'], /records a baseline only.*refusing file/],
    [['--test', 'true', '--write-baseline', join(out, 'b.json'), '--replace', 'alpha::beta'], /refusing replace/],
    [['--test', 'true', '--write-baseline', join(out, 'b.json'), '--baseline', join(out, 'b.json')], /mutually exclusive/],
    [['--test', 'true', '--write-baseline'], /--write-baseline needs a file path/],
    [['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--baseline'], /--baseline needs a file path/],
    [['--write-baseline', join(out, 'b.json')], /--test is required/],
  ];
  for (const [flags, expected] of flagCases) {
    const r = runTool(dir, flags);
    assert.equal(r.status, 1, `${flags.join(' ')}\n${r.out}`);
    assert.match(r.out, expected, `${flags.join(' ')}\n${r.out}`);
  }
  assert.equal(existsSync(join(out, 'b.json')), false);
  assert.equal(git('status', '--porcelain'), '');
});

test('a reused baseline carries its failing leaves, and the mutant is credited only with what it adds', (t) => {
  // The masked failure of the earlier names test, through a record: the leaf failing in the green
  // baseline must come from the record, or it is credited to the mutant.
  const { dir } = makeNodeTestRepo(t);
  writeFileSync(join(dir, 'red.test.mjs'), "import { test } from 'node:test';\ntest('fails before any mutation', () => { throw new Error('already red'); });\n");
  const out = outsideDir(t);
  const record = join(out, 'baseline.json');
  const testCmd = 'node --test red.test.mjs; grep -q alpha notes.md';
  assert.equal(runTool(dir, ['--test', testCmd, '--write-baseline', record]).status, 0);
  assert.deepEqual(JSON.parse(readFileSync(record, 'utf8')).leaves, [{ file: 'red.test.mjs', name: 'fails before any mutation' }]);
  const names = join(out, 'names.json');
  const r = runTool(dir, ['--file', 'notes.md', '--test', testCmd, '--replace', 'alpha::beta', '--baseline', record, '--names-out', names]);
  assert.match(r.out, /MUTANT KILLED/, r.out);
  assert.deepEqual(JSON.parse(readFileSync(names, 'utf8')), { readable: true, added: [], unreadable: null });
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
  // A monotonic clock: the wall clock steps on WSL, and a mutant that waited 10.2 s by node:test's
  // own timer read as 8196 ms by Date.now(). A further step back of 1.2 s would have passed it.
  const started = performance.now();
  const r = runTool(dir, ['--file', 'notes.md', '--test', test, '--replace', 'alpha::beta', '--timeout', '1']);
  const elapsed = Math.round(performance.now() - started);
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
  let started = performance.now();
  const killed = runTool(dir, ['--file', 'notes.md', '--test', 'grep -qx alpha notes.md || { setsid sleep 10 & exit 1; }',
    '--replace', 'alpha::beta', '--timeout', '1']);
  let elapsed = Math.round(performance.now() - started);
  assert.equal(killed.status, 0, killed.out);
  assert.match(killed.out, /^MUTANT KILLED/m, killed.out);
  assert.doesNotMatch(killed.out, /HUNG/, killed.out);
  assert.match(killed.out, /the shell ended \(exit 1\) after [\d.]+ s, but a process it started still held its output/,
    'the run says what it did not wait for');
  assert.ok(elapsed < 7_000, `the mutant run waited ${elapsed} ms for a process outside the group`);
  assert.equal(git('status', '--porcelain'), '', 'restored');

  // The same ordering on the baseline: the shell exits 0 and leaves a straggler, in both runs.
  started = performance.now();
  const green = runTool(dir, ['--file', 'notes.md', '--test', 'setsid sleep 10 & exit 0',
    '--replace', 'alpha::beta', '--timeout', '1']);
  elapsed = Math.round(performance.now() - started);
  assert.doesNotMatch(green.out, /Baseline HUNG/, green.out);
  assert.match(green.out, /green\./, green.out);
  assert.match(green.out, /\[2\/5\]/, 'the mutation was applied, so the baseline was judged green');
  assert.ok(elapsed < 9_000, `the two runs waited ${elapsed} ms for processes outside the group`);
  assert.equal(git('status', '--porcelain'), '', 'restored');
});

test('a straggler still in the group dies at --timeout when the shell exited first, and the shell keeps its verdict', async (t) => {
  // The exit-first ordering with a holder that did NOT leave the group: it is reachable, so the
  // limit kills it rather than leaving it to run after the tool has gone.
  const marker = markerDir(t);
  const { dir, git } = makeRepo(t, 'alpha\n');
  const test = `grep -qx alpha notes.md || { ${grandchild(marker)}; exit 1; }`;
  const r = runTool(dir, ['--file', 'notes.md', '--test', test, '--replace', 'alpha::beta', '--timeout', '1']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^MUTANT KILLED/m, r.out);
  assert.equal(git('status', '--porcelain'), '', 'restored');
  assert.ok(existsSync(`${marker}.started`), 'the grandchild was running when the limit came');
  await outlastGrandchild();
  assert.equal(existsSync(marker), false, 'the in-group straggler outlived the limit');
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

test('a run without --timeout uses the documented default of 900 s, and prints the limit in effect', (t) => {
  // The --help text above pins the constant, not the value a run uses: a default decoupled from
  // the constant (even an unbounded one, which is #819 again) kept every other test green.
  const { dir } = makeRepo(t, 'alpha\n');
  const bare = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta']);
  assert.match(bare.out, /^ {2}timeout: {2}900 s$/m, bare.out);
  const given = runTool(dir, ['--file', 'notes.md', '--test', 'true', '--replace', 'alpha::beta', '--timeout', '7']);
  assert.match(given.out, /^ {2}timeout: {2}7 s$/m, 'the header prints the parsed value, not the constant');
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
