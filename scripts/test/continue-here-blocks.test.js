/**
 * Executable coverage for the blocks `read-continue-here` and `write-continue-here` ship (#468, #844).
 *
 * Both skills resolve the handoff through the same candidate list. "The same" is a claim about two
 * hand-maintained copies of a shell block in two markdown files, and nothing in this repository
 * could previously have noticed them diverging — the i18n fence gate compares a mirror against its
 * English source, never two English files against each other. A prose claim needs an owner that
 * fails; this file is it.
 *
 * Three properties are asserted here and nowhere else:
 *
 *   1. DRIFT — the resolver block is byte-identical in both skills, and each carries exactly one
 *      copy. A second copy in one file cannot be kept in sync with anything.
 *   2. BEHAVIOUR — the resolver and the cleanup block are extracted and RUN against fixtures whose
 *      answer is known by construction: each supported layout, an unsupported one, none at all, a
 *      subdirectory cwd, and a tracked versus an untracked handoff.
 *   3. SHAPE — the SessionStart hook is extracted and run, and its stdout is checked to carry
 *      `additionalContext` directly under `hookSpecificOutput`. This is the #844 regression: 1.x
 *      nested it inside a `sessionStartContext` object that Claude Code does not know, so the
 *      payload was discarded with no error anyone would see. The hook ran; the hook did nothing.
 *
 * Two more since #1040: the ARCHIVE fence in read-continue-here Step 5 (which write-continue-here
 * runs too) is run against a parent directory, a user-level HOME and a README, and the `Verified:`
 * values are pinned across the three skills that write or read them.
 *
 * The shape assertion carries its own negative arm — the same checker fed the 1.x object must
 * reject it. Without that, a checker that had quietly stopped looking at anything would pass every
 * positive case forever, which is the exact failure mode this suite exists to prevent.
 *
 * Fixtures are built with `mkdtempSync` and torn down with `rmTree`, never a bare recursive
 * `rmSync` and never a shared fixed path (#493, #791).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const READ = 'skills/read-continue-here/SKILL.md';
const WRITE = 'skills/write-continue-here/SKILL.md';
/** The one-time hook setup moved out of the skill's line budget into references/ (#1040). */
const HOOK_REF = 'skills/read-continue-here/references/session-start-hook.md';

/**
 * Files expected to carry the resolver. A file listed here that does NOT carry it fails: an absent
 * copy has to be as loud as a divergent one, or deleting the block is the way to go green.
 */
const RESOLVER_CARRIERS = [READ, WRITE];

/**
 * A block is identified by a line inside it, never by fence ordinal — an ordinal breaks the moment
 * either skill gains an unrelated fence above it, which is the brittleness the i18n fence gate had
 * to abandon.
 */
const RESOLVER_MARKER =
  'for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do';
/** What the resolver fence opens with — the hook fence contains the marker but opens differently. */
const RESOLVER_OPEN = 'ROOT=$(git rev-parse --show-toplevel';
const CLEANUP_MARKER = 'git rm -q "$CONTINUE_FILE"';
/** write-continue-here's lifecycle detector. Its `else` arm reported UNDECIDED for four states
 *  that were not undecided until an adversarial round measured them, and nothing owned it. */
const LIFECYCLE_MARKER = 'lifecycle: UNDECIDED';

const HOOK_OPEN = "cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'";
const HOOK_CLOSE = 'SCRIPT';

const read = (rel) => readFileSync(join(REPO, rel), 'utf8');

/** Every ```bash fence body in a markdown file, in document order. */
function bashFences(markdown) {
  const out = [];
  const re = /^```bash\r?\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) out.push(m[1]);
  return out;
}

function extractBlock(rel, marker, { startsWith } = {}) {
  let hits = bashFences(read(rel)).filter((body) => body.includes(marker));
  // The SessionStart hook embeds its own copy of the candidate loop — it is a standalone script
  // and cannot source anything — so the resolver marker matched two fences while the hook lived
  // in the skill, and would again if it moved back. Narrow by what the fence OPENS with rather
  // than loosening the marker, and pin the hook's copy separately below, where it belongs.
  if (startsWith) hits = hits.filter((body) => body.startsWith(startsWith));
  assert.ok(
    hits.length > 0,
    `${rel} does not carry the block marked by ${JSON.stringify(marker)}. If it was removed on ` +
      `purpose, remove ${rel} from this test's carrier list in the same commit.`,
  );
  assert.equal(
    hits.length,
    1,
    `${rel} carries ${hits.length} copies of that block; a second copy cannot be kept in sync`,
  );
  return hits[0];
}

/** The SessionStart hook script, taken from between the heredoc delimiters in its reference file. */
function extractHook() {
  const lines = read(HOOK_REF).split('\n');
  const start = lines.indexOf(HOOK_OPEN);
  assert.ok(start >= 0, `${HOOK_REF} no longer opens the hook heredoc with ${JSON.stringify(HOOK_OPEN)}`);
  const end = lines.indexOf(HOOK_CLOSE, start + 1);
  assert.ok(end > start, `${HOOK_REF}'s hook heredoc is never closed`);
  const body = lines.slice(start + 1, end).join('\n');
  assert.ok(body.length > 400, `extracted hook is ${body.length} bytes — refusing to test an empty script`);
  return body;
}

/**
 * An environment git cannot escape. Neither `cwd` nor `-C` is isolation: git honours an absolute
 * `GIT_DIR` over both, and `GIT_DIR` is exported into every hook, so a suite that runs
 * `git init` / `git commit` inherits the caller's repository and writes its fixture into that
 * history — silently, at exit 0. Drop **every** `GIT_*` key rather than the ones anyone thought
 * of; a denylist has already missed `GIT_CONFIG_PARAMETERS` and `GIT_TEMPLATE_DIR` here. `HOME`
 * and `XDG_CONFIG_HOME` move too, because `$XDG_CONFIG_HOME/git/ignore` is read through no
 * variable at all and `GIT_CONFIG_GLOBAL` does not reach it.
 */
function cleanEnv(home, extra = {}) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('GIT_')) env[key] = value;
  }
  env.HOME = home;
  env.XDG_CONFIG_HOME = join(home, '.config');
  env.GIT_CONFIG_NOSYSTEM = '1';
  return { ...env, ...extra };
}

/** A throwaway git repository. `files` maps repo-relative paths to contents. */
function fixture(files, { commit = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'continuehere-'));
  const git = (...args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: cleanEnv(dir) });
  git('init', '-q', '.');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
  if (commit.length) {
    git('add', '-f', ...commit);
    git('commit', '-qm', 'fixture');
  }
  return dir;
}

function runBash(script, { cwd, env = {}, timeout } = {}) {
  // Same reason as `cleanEnv`'s docblock: the cleanup block runs `git rm` and `git commit`, so an
  // inherited GIT_DIR would land them in whatever repository the suite was started from.
  return spawnSync('bash', ['-c', script], { cwd, encoding: 'utf8', env: cleanEnv(cwd, env), timeout });
}

/**
 * What Claude Code would make of a hook's stdout. Returns the injected string, or null when the
 * hook stayed silent. Throws with the observed keys when the payload is not where it is read from —
 * which is what 1.x's output did.
 */
function injectedContext(stdout) {
  if (stdout.trim() === '') return null;
  const parsed = JSON.parse(stdout);
  const hso = parsed.hookSpecificOutput;
  assert.ok(hso && typeof hso === 'object', 'no hookSpecificOutput in the hook payload');
  assert.equal(
    typeof hso.additionalContext,
    'string',
    `additionalContext is not a string directly under hookSpecificOutput; keys were ` +
      `${JSON.stringify(Object.keys(hso))}. Nesting it one level deeper is #844: Claude Code ` +
      `discards the object and reports nothing the user will see.`,
  );
  return hso.additionalContext;
}

test('bash is available — this suite may not pass by skipping', () => {
  const res = spawnSync('bash', ['-c', 'echo ok'], { encoding: 'utf8' });
  assert.equal(res.status, 0, 'bash missing: the published blocks cannot be executed');
});

test('both skills carry the resolver, byte-for-byte identical', () => {
  // Pin the list itself. Reducing it to one entry makes the comparison below compare a file to
  // nothing and pass vacuously — the drift this whole test exists to catch would then be
  // undetectable, and the mutant that proves it is a one-word edit.
  assert.equal(RESOLVER_CARRIERS.length, 2, 'the carrier list lost an entry; the comparison is vacuous with fewer than two');
  const canonical = extractBlock(READ, RESOLVER_MARKER, { startsWith: RESOLVER_OPEN });
  for (const rel of RESOLVER_CARRIERS) {
    if (rel === READ) continue;
    assert.equal(
      extractBlock(rel, RESOLVER_MARKER, { startsWith: RESOLVER_OPEN }),
      canonical,
      `${rel}'s resolver has drifted from ${READ}. Copy it back byte-for-byte rather than ` +
        `reconciling the two by hand — "the same block" is the claim both skills make in prose.`,
    );
  }
});

test('resolver: each supported layout resolves, first hit wins, unsupported layouts are reported', () => {
  const block = extractBlock(READ, RESOLVER_MARKER, { startsWith: RESOLVER_OPEN });
  const cases = [
    { name: 'root', files: { 'CONTINUE_HERE.md': 'x' }, expect: /handoff: .*\/CONTINUE_HERE\.md$/m },
    { name: 'docs', files: { 'docs/CONTINUE_HERE.md': 'x' }, expect: /handoff: .*\/docs\/CONTINUE_HERE\.md$/m },
    { name: 'dotclaude', files: { '.claude/CONTINUE_HERE.md': 'x' }, expect: /handoff: .*\/\.claude\/CONTINUE_HERE\.md$/m },
    { name: 'none', files: {}, expect: /^no handoff$/m },
    { name: 'elsewhere', files: { 'notes/CONTINUE_HERE.md': 'x' }, expect: /exists elsewhere:[\s\S]*notes\/CONTINUE_HERE\.md/ },
    {
      name: 'root wins over docs',
      files: { 'CONTINUE_HERE.md': 'root', 'docs/CONTINUE_HERE.md': 'docs' },
      expect: /handoff: [^\n]*\/CONTINUE_HERE\.md$/m,
      reject: /docs\/CONTINUE_HERE\.md/,
    },
  ];
  for (const c of cases) {
    const dir = fixture(c.files);
    try {
      const res = runBash(block, { cwd: dir });
      assert.equal(res.status, 0, `${c.name}: resolver exited ${res.status}\n${res.stderr}`);
      assert.match(res.stdout, c.expect, `${c.name}: unexpected resolver output`);
      if (c.reject) assert.doesNotMatch(res.stdout, c.reject, `${c.name}: resolver picked the wrong candidate`);
    } finally {
      rmTree(dir);
    }
  }
});

test('resolver: anchors on the repository root, not the working directory', () => {
  // 1.0 looked beside `$PWD`. Run from a subdirectory it found nothing and said nothing,
  // which is the same silent no-op #468 reported for the docs/ layout.
  const block = extractBlock(READ, RESOLVER_MARKER, { startsWith: RESOLVER_OPEN });
  const dir = fixture({ 'docs/CONTINUE_HERE.md': 'x', 'sub/deep/.keep': '' });
  try {
    const res = runBash(block, { cwd: join(dir, 'sub', 'deep') });
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /handoff: .*\/docs\/CONTINUE_HERE\.md$/m);
  } finally {
    rmTree(dir);
  }
});

test('cleanup: a tracked handoff is removed through git, an untracked one is not', () => {
  const block = extractBlock(READ, CLEANUP_MARKER);

  const tracked = fixture(
    { 'docs/CONTINUE_HERE.md': 'x', 'src.txt': 'before' },
    { commit: ['docs/CONTINUE_HERE.md', 'src.txt'] },
  );
  try {
    const path = join(tracked, 'docs', 'CONTINUE_HERE.md');
    // Stage unrelated work first. This block runs at SESSION START, which is exactly when a prior
    // session or a peer sharing the worktree may have left something in the index — and
    // `git commit -m` with no pathspec commits the whole index, silently, at exit 0.
    writeFileSync(join(tracked, 'src.txt'), 'staged by somebody else');
    spawnSync('git', ['-C', tracked, 'add', 'src.txt'], { encoding: 'utf8' });

    const res = runBash(block, { cwd: tracked, env: { CONTINUE_FILE: path, ARCHIVED: 'fixture' } });
    assert.equal(res.status, 0, `tracked arm exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'tracked handoff was not deleted');
    const log = spawnSync('git', ['-C', tracked, 'log', '--oneline'], { encoding: 'utf8' }).stdout;
    assert.equal(log.trim().split('\n').length, 2, 'the tracked deletion was not committed');

    // A commit COUNT cannot see the defect: sweeping two extra files in still produces exactly
    // one commit. Assert what the commit contains, and that the unrelated work is still staged.
    const named = spawnSync('git', ['-C', tracked, 'show', '--name-only', '--format=', 'HEAD'], {
      encoding: 'utf8',
    }).stdout;
    assert.deepEqual(
      named.trim().split('\n').filter(Boolean),
      ['docs/CONTINUE_HERE.md'],
      'the handoff commit swept in files nobody asked it to commit — `git commit -m` with no pathspec commits the entire index',
    );
    const stillStaged = spawnSync('git', ['-C', tracked, 'diff', '--cached', '--name-only'], {
      encoding: 'utf8',
    }).stdout;
    assert.match(stillStaged, /src\.txt/, "a peer session's staged change was consumed by the handoff commit");
  } finally {
    rmTree(tracked);
  }

  const untracked = fixture({ 'CONTINUE_HERE.md': 'x' });
  try {
    const path = join(untracked, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: untracked, env: { CONTINUE_FILE: path, ARCHIVED: 'fixture' } });
    assert.equal(res.status, 0, `untracked arm exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'untracked handoff was not deleted');
    const log = spawnSync('git', ['-C', untracked, 'log', '--oneline'], { encoding: 'utf8' });
    assert.notEqual(log.status, 0, 'the untracked arm created a commit; it must not touch history');
  } finally {
    rmTree(untracked);
  }
});

test('cleanup: refuses rather than falling back to a hardcoded name when the path is unset', () => {
  // The refusal has to sit in the arm an unset value falls into. A block that defaulted to
  // `CONTINUE_HERE.md` here would delete the wrong file in exactly the layouts #468 is about.
  const block = extractBlock(READ, CLEANUP_MARKER);
  const dir = fixture({ 'CONTINUE_HERE.md': 'must survive' });
  try {
    const res = runBash(block, { cwd: dir, env: { CONTINUE_FILE: '' } });
    assert.notEqual(res.status, 0, 'cleanup ran with no resolved path');
    assert.equal(existsSync(join(dir, 'CONTINUE_HERE.md')), true, 'cleanup deleted a file it never resolved');
    // Assert the guard's own message, not merely a non-zero exit. With the `:?` line deleted the
    // block still exits non-zero and still deletes nothing — `git ls-files --error-unmatch ""`
    // exits 128 and `rm -- ""` then fails on its own — so status alone is satisfied by an accident
    // of `rm` and the guard could be removed with the suite green.
    assert.match(
      res.stderr,
      /resolve it with the Step 1 block/,
      'the refusal did not come from the guard; a non-zero exit here can come from `rm ""` instead',
    );
  } finally {
    rmTree(dir);
  }
});

test('lifecycle: names each state, and refuses to classify one it cannot see', () => {
  // The four verdicts are claims, and a claim needs an owner that fails. Every row below was a
  // WRONG answer from the first shipped version of this block: it asked `git` about a path in a
  // repository it was not standing in, so both discriminators exited 128, and the `else` reported
  // "untracked and not ignored" — a confident classification produced by a command that could not
  // see. Outside a repository there is nothing to track and nothing to sweep.
  const block = extractBlock(WRITE, LIFECYCLE_MARKER);

  // tracked wins over an ignore rule that also matches it — branch ordering, not luck
  const tracked = fixture(
    { 'CONTINUE_HERE.md': 'x', '.gitignore': 'CONTINUE_HERE*.md\n' },
    { commit: ['CONTINUE_HERE.md', '.gitignore'] },
  );
  const ignored = fixture({ 'CONTINUE_HERE.md': 'x', '.gitignore': 'CONTINUE_HERE*.md\n' });
  const undecided = fixture({ 'CONTINUE_HERE.md': 'x' });
  const norepo = mkdtempSync(join(tmpdir(), 'continuehere-norepo-'));
  writeFileSync(join(norepo, 'CONTINUE_HERE.md'), 'x');

  try {
    const verdict = (dir, cwd = dir) =>
      runBash(block, { cwd, env: { CONTINUE_FILE: join(dir, 'CONTINUE_HERE.md') } });

    const t = verdict(tracked);
    assert.equal(t.status, 0, t.stderr);
    assert.match(t.stdout, /lifecycle: TRACKED/, 'a tracked handoff that also matches an ignore rule must read TRACKED');

    const i = verdict(ignored);
    assert.match(i.stdout, /lifecycle: IGNORED/);
    assert.match(i.stdout, /decided by: .*\.gitignore/, 'IGNORED must name the file that decided — a user-level core.excludesFile gives the same verdict for a different reason');

    assert.match(verdict(undecided).stdout, /lifecycle: UNDECIDED/);

    // The two that were wrong. Same handoff, asked from outside its repository, and from a
    // directory that is not in any repository at all.
    assert.match(
      verdict(norepo).stdout,
      /lifecycle: NOT IN A REPOSITORY/,
      'with no repository the block must say it cannot classify, not report UNDECIDED',
    );
    assert.match(
      verdict(ignored, norepo).stdout,
      /lifecycle: IGNORED/,
      "asked from outside the handoff's repository, the block must still read that repository's rule",
    );
  } finally {
    rmTree(tracked);
    rmTree(ignored);
    rmTree(undecided);
    rmTree(norepo);
  }
});

test('hook: parses, and injects the resolved handoff for every supported layout', () => {
  const hook = extractHook();
  assert.equal(
    spawnSync('bash', ['-n', '-c', hook], { encoding: 'utf8' }).status,
    0,
    'the published hook does not parse',
  );

  for (const rel of ['CONTINUE_HERE.md', 'docs/CONTINUE_HERE.md', '.claude/CONTINUE_HERE.md']) {
    const dir = fixture({ [rel]: `# Continue Here\nfrom ${rel}\n` });
    try {
      const res = runBash(hook, { cwd: dir });
      assert.equal(res.status, 0, `${rel}: hook exited ${res.status}\n${res.stderr}`);
      assert.equal(injectedContext(res.stdout), `# Continue Here\nfrom ${rel}`, `${rel}: wrong content injected`);
    } finally {
      rmTree(dir);
    }
  }
});

test('hook: silent when there is no handoff, and reports one at an unresolved path', () => {
  const hook = extractHook();

  const empty = fixture({});
  try {
    const res = runBash(hook, { cwd: empty });
    assert.equal(res.status, 0, res.stderr);
    assert.equal(injectedContext(res.stdout), null, 'the hook spoke when there was no handoff');
  } finally {
    rmTree(empty);
  }

  const stray = fixture({ 'notes/CONTINUE_HERE.md': 'x' });
  try {
    const res = runBash(hook, { cwd: stray });
    assert.equal(res.status, 0, res.stderr);
    const ctx = injectedContext(res.stdout);
    assert.ok(ctx, 'a handoff at an unresolved path produced no report — that is the #468 silent no-op');
    assert.match(ctx, /notes\/CONTINUE_HERE\.md/, 'the report does not name where the handoff is');
  } finally {
    rmTree(stray);
  }
});

test('hook: content needing JSON escaping survives, with and without jq', () => {
  const hook = extractHook();
  // Every C0 control byte matters, not only the three with short JSON escapes. A handoff that
  // quotes terminal output carries ESC (FORCE_COLOR is set on this machine, so piped output is
  // coloured); one written on NTFS carries CR. Both are ordinary, both are below 0x20, and JSON
  // forbids every raw byte in that range inside a string — so an escaper handling backslash,
  // quote and tab alone emits an object that does not parse, which Claude Code discards in
  // exactly the silent way #844 was about. The trailing \r on line 2 exercises the CRLF strip;
  // the one mid-line on the "progress" line must SURVIVE it and be escaped instead.
  const nasty =
    '# Continue Here\nquote " backslash \\ tab\there\r\ndone\n' +
    'progress: 50%\rprogress: 100%\n' +
    '\x1b[32mPASS\x1b[0m 16/16 contexts\n' +
    'bell \x07 backspace \x08 vtab \x0b formfeed \x0c';
  for (const withJq of [true, false]) {
    const dir = fixture({ 'CONTINUE_HERE.md': nasty });
    try {
      // Hiding jq exercises the awk fallback, which is the branch a machine without jq takes and
      // the one most likely to emit invalid JSON.
      const script = withJq ? hook : `jq() { return 127; }\ncommand() { return 1; }\n${hook}`;
      const res = runBash(script, { cwd: dir });
      assert.equal(res.status, 0, `jq=${withJq}: hook exited ${res.status}\n${res.stderr}`);
      // injectedContext JSON.parses stdout, so an unescaped control byte fails here rather than
      // reaching an assertion — which is the point: invalid JSON is the defect, not a detail of it.
      const ctx = injectedContext(res.stdout);
      assert.match(ctx, /quote " backslash \\ tab\there/, `jq=${withJq}: escaping mangled the content`);
      assert.doesNotMatch(ctx, /\r\n/, `jq=${withJq}: a line-ending CR survived the strip`);
      assert.match(ctx, /progress: 50%\rprogress: 100%/, `jq=${withJq}: a mid-line CR was lost; only a trailing one should be stripped`);
      assert.match(ctx, /\x1b\[32mPASS\x1b\[0m/, `jq=${withJq}: an ESC byte did not survive escaping`);
      assert.match(ctx, /bell \x07 backspace \x08 vtab \x0b formfeed \x0c/, `jq=${withJq}: a C0 control byte did not survive escaping`);
    } finally {
      rmTree(dir);
    }
  }
});

test('the hook embeds the same candidate list as the resolver', () => {
  // A third copy, unavoidable: the hook is a standalone script and cannot source the fence. What
  // is avoidable is the candidate list drifting between them, which would make the hook resolve a
  // different set of paths from the skill whose Step 1 documents them.
  const canonical = extractBlock(READ, RESOLVER_MARKER, { startsWith: RESOLVER_OPEN });
  const core = canonical.split('\n').slice(0, 5).join('\n');
  assert.ok(
    core.includes('for candidate in') && core.includes('done'),
    `the resolver's first five lines are no longer the candidate loop; re-derive "core" here`,
  );
  assert.ok(
    extractHook().includes(core),
    `the hook's candidate loop has drifted from Step 1's resolver. Both must look in the same ` +
      `places, or the hook and the documented procedure disagree about where a handoff lives.`,
  );
});

// ── the archive rule (#1040 decision 4) ─────────────────────────────────────────────────────

/** read-continue-here Step 5's archive fence; write-continue-here runs the same fence. */
const ARCHIVE_MARKER = ': "${ARCHIVE_STATE:?';

/** Step 7's snippet line, the one source of the literal and its placeholder. */
function snippetArchiveLine() {
  const fences = [...read(READ).matchAll(/^```markdown\r?\n([\s\S]*?)^```/gm)].map((m) => m[1]);
  const hits = fences.map((body) => body.match(/^Handoff archive: .*$/m)).filter(Boolean);
  assert.equal(hits.length, 1, `${READ} must carry exactly one "Handoff archive:" line in its Step 7 snippet`);
  return hits[0][0];
}

/**
 * A project inside a parent directory, with a user-level HOME beside it. `levels` maps
 * project | parent | user | readme to the text of the file that level reads.
 */
function archiveTree(levels, { tracked = false } = {}) {
  const base = mkdtempSync(join(tmpdir(), 'archive-'));
  const proj = join(base, 'proj');
  const home = join(base, 'home');
  mkdirSync(join(home, '.claude'), { recursive: true });
  mkdirSync(proj);
  const git = (...args) => spawnSync('git', ['-C', proj, ...args], { encoding: 'utf8', env: cleanEnv(home) });
  git('init', '-q', '.');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  writeFileSync(join(proj, 'CONTINUE_HERE.md'), '# Continue Here\nedition one\n');
  const where = {
    project: join(proj, 'CLAUDE.md'),
    parent: join(base, 'CLAUDE.md'),
    user: join(home, '.claude', 'CLAUDE.md'),
    readme: join(proj, 'README.md'),
  };
  for (const [level, text] of Object.entries(levels)) writeFileSync(where[level], text);
  if (tracked) {
    git('add', '-f', 'CONTINUE_HERE.md');
    git('commit', '-qm', 'fixture');
  }
  // The walk continues above `base`. A CLAUDE.md up there carrying the line would decide the
  // "no line" cases below, so refuse to run rather than report a result it chose.
  for (let dir = dirname(base); dir !== dirname(dir); dir = dirname(dir)) {
    const above = join(dir, 'CLAUDE.md');
    if (existsSync(above)) {
      assert.doesNotMatch(readFileSync(above, 'utf8'), /^Handoff archive: /m, `${above} declares an archive; this suite cannot isolate from it`);
    }
  }
  return { base, proj, home, file: join(proj, 'CONTINUE_HERE.md') };
}

function runArchive(tree, state, extraEnv = {}) {
  const block = extractBlock(READ, ARCHIVE_MARKER);
  return runBash(block, {
    cwd: tree.proj,
    env: { CONTINUE_FILE: tree.file, ARCHIVE_STATE: state, HOME: tree.home, ...extraEnv },
  });
}

/** The archived name: <dir>/<UTC date>/<project>-CONTINUE_HERE.<UTC stamp>.<state>.md */
function archivedName(dir, state) {
  const esc = dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^archive: ${esc}/(\\d{4}-\\d\\d-\\d\\d)/proj-CONTINUE_HERE\\.(\\1)T\\d{6}Z\\.${state}\\.md$`, 'm');
}

test('archive: any failure refuses, and the cleanup run after it in the same call deletes nothing', () => {
  // A file where the archive's parent should be makes mkdir fail without any named REFUSED arm
  // firing; the placeholder is the named arm. Both run archive then cleanup in one call, as the
  // skill says, and the handoff must survive both. Round 1 of #1042 measured the opposite.
  const pair = `${extractBlock(READ, ARCHIVE_MARKER)}\n${extractBlock(READ, CLEANUP_MARKER)}`;
  for (const line of ['blocker', snippetArchiveLine()]) {
    const tree = archiveTree({});
    try {
      writeFileSync(join(tree.base, 'blocker'), 'a file, not a directory');
      const declared = line === 'blocker' ? `Handoff archive: ${join(tree.base, 'blocker', 'arch')}` : line;
      writeFileSync(join(tree.proj, 'CLAUDE.md'), `${declared}\n`);
      const res = runBash(pair, { cwd: tree.proj, env: { CONTINUE_FILE: tree.file, ARCHIVE_STATE: 'consumed', HOME: tree.home } });
      assert.notEqual(res.status, 0, `${line}: the archive failed and the pair still exited 0`);
      assert.match(res.stderr, /REFUSED: .*was not archived/, `${line}: no REFUSED line for the failure`);
      assert.ok(existsSync(tree.file), `${line}: the cleanup deleted a handoff the archive never kept`);
    } finally {
      rmTree(tree.base);
    }
  }
  const alone = archiveTree({});
  try {
    const res = runBash(extractBlock(READ, CLEANUP_MARKER), { cwd: alone.proj, env: { CONTINUE_FILE: alone.file } });
    assert.notEqual(res.status, 0);
    assert.match(res.stderr, /run the archive fence first/);
    assert.ok(existsSync(alone.file), 'the cleanup ran with no archive in its shell');
  } finally {
    rmTree(alone.base);
  }
});

test('archive: a relative CONTINUE_FILE is made absolute, not walked forever', () => {
  // `${dir%/*}` leaves a slash-free path unchanged, so a relative path never shortens to nothing
  // and the parent walk never ends (#1042 round 1 measured rc 124 under bash and zsh).
  for (const tracked of [false, true]) {
    const tree = archiveTree({}, { tracked });
    try {
      const res = runBash(extractBlock(READ, ARCHIVE_MARKER), {
        cwd: tree.proj,
        timeout: 20000,
        env: { CONTINUE_FILE: 'CONTINUE_HERE.md', ARCHIVE_STATE: 'consumed', HOME: tree.home },
      });
      assert.equal(res.signal, null, `tracked=${tracked}: the fence never finished`);
      assert.equal(res.status, 0, `tracked=${tracked}: ${res.stderr}`);
      assert.match(res.stdout, /^archive: /m);
    } finally {
      rmTree(tree.base);
    }
  }
});

test('archive: in a linked worktree, the archived name carries the project, not the worktree', () => {
  // Archives are shared across projects, and this repository works in .claude/worktrees/<name>.
  const tree = archiveTree({ parent: 'Handoff archive: shared\n' }, { tracked: true });
  try {
    const add = spawnSync('git', ['-C', tree.proj, 'worktree', 'add', '-q', join(tree.base, 'feat-x')], {
      encoding: 'utf8',
      env: cleanEnv(tree.home),
    });
    assert.equal(add.status, 0, add.stderr);
    const wt = join(tree.base, 'feat-x');
    const res = runBash(extractBlock(READ, ARCHIVE_MARKER), {
      cwd: wt,
      env: { CONTINUE_FILE: join(wt, 'CONTINUE_HERE.md'), ARCHIVE_STATE: 'consumed', HOME: tree.home },
    });
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, archivedName(join(tree.base, 'shared'), 'consumed'), `named after the worktree: ${res.stdout}`);
  } finally {
    rmTree(tree.base);
  }
});

test('archive: a project that keeps its CLAUDE.md under .claude/ is read at the project level', () => {
  const tree = archiveTree({ parent: 'Handoff archive: /must/not/win\n' });
  try {
    mkdirSync(join(tree.proj, '.claude'));
    writeFileSync(join(tree.proj, '.claude', 'CLAUDE.md'), `Handoff archive: ${join(tree.base, 'dotclaude')}\n`);
    const res = runArchive(tree, 'consumed');
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, archivedName(join(tree.base, 'dotclaude'), 'consumed'));
  } finally {
    rmTree(tree.base);
  }
});

test('archive DRIFT: the fence reads the literal and refuses the placeholder that Step 7 emits', () => {
  const line = snippetArchiveLine();
  const block = extractBlock(READ, ARCHIVE_MARKER);
  const literal = block.match(/case "\$l" in "([^"]+)"\*\)/);
  assert.ok(literal, 'the archive fence no longer matches its literal with a line-start case pattern');
  assert.ok(line.startsWith(literal[1]), `Step 7 emits ${JSON.stringify(line)} but the fence reads ${JSON.stringify(literal[1])}`);
  const placeholder = line.slice(literal[1].length);
  assert.ok(
    block.includes(`[ "$ARCHIVE" = '${placeholder}' ]`),
    `the fence does not refuse Step 7's placeholder ${JSON.stringify(placeholder)}`,
  );
});

test('archive: nearest first — project CLAUDE.md, parent CLAUDE.md, user-level CLAUDE.md, README', () => {
  const dirs = {};
  const levels = {};
  const order = ['project', 'parent', 'user', 'readme'];
  const tree = archiveTree({});
  try {
    for (const level of order) dirs[level] = join(tree.base, `arch-${level}`);
    // CRLF on the project line: a CLAUDE.md saved on NTFS must not name "<dir>\r".
    levels.project = `# x\n\`Handoff archive:\` in prose does not count\nHandoff archive: ${dirs.project}\r\n`;
    for (const level of order.slice(1)) levels[level] = `Handoff archive: ${dirs[level]}\n`;
    for (const [index, winner] of order.entries()) {
      const fresh = archiveTree(Object.fromEntries(order.slice(index).map((l) => [l, levels[l]])));
      try {
        const res = runArchive(fresh, 'consumed');
        assert.equal(res.status, 0, `${winner}: archive fence exited ${res.status}\n${res.stderr}`);
        assert.match(res.stdout, archivedName(dirs[winner], 'consumed'), `${winner} should have won; stdout was ${res.stdout}`);
        assert.ok(existsSync(fresh.file), `${winner}: reading must COPY; the handoff is the cleanup fence's to delete`);
      } finally {
        rmTree(fresh.base);
      }
    }
  } finally {
    rmTree(tree.base);
  }
});

test('archive: superseded moves, a relative path is the declaring file\'s, and ~/ is $HOME', () => {
  const rel = archiveTree({ parent: 'Handoff archive: kept\n' });
  try {
    const res = runArchive(rel, 'superseded');
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, archivedName(join(rel.base, 'kept'), 'superseded'));
    assert.equal(existsSync(rel.file), false, 'superseded must MOVE the edition it replaces');
  } finally {
    rmTree(rel.base);
  }
  const tilde = archiveTree({ project: 'Handoff archive: ~/arch\n' });
  try {
    const res = runArchive(tilde, 'consumed');
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, archivedName(join(tilde.home, 'arch'), 'consumed'));
  } finally {
    rmTree(tilde.base);
  }
});

test('archive: the unedited <dir> placeholder is refused and nothing is written', () => {
  const tree = archiveTree({ project: `${snippetArchiveLine()}\n`, parent: 'Handoff archive: /must/not/win\n' });
  try {
    const res = runArchive(tree, 'superseded');
    assert.notEqual(res.status, 0, 'the placeholder was accepted');
    assert.match(res.stderr, /REFUSED: .*CLAUDE\.md carries the unedited/);
    assert.ok(existsSync(tree.file), 'a refused archive moved the handoff anyway');
    assert.equal(existsSync(join(tree.proj, 'CONTINUE_HERE.prev.md')), false);
    assert.deepEqual(readdirSync(tree.proj).filter((n) => n.startsWith('<')), [], 'a "<dir>" directory was created');
  } finally {
    rmTree(tree.base);
  }
});

test('archive: without the line, untracked keeps CONTINUE_HERE.prev.md and tracked keeps nothing', () => {
  for (const [state, survives] of [['consumed', true], ['superseded', false]]) {
    const tree = archiveTree({ project: '# no archive line here\n' });
    try {
      const res = runArchive(tree, state);
      assert.equal(res.status, 0, res.stderr);
      const prev = join(tree.proj, 'CONTINUE_HERE.prev.md');
      assert.equal(readFileSync(prev, 'utf8'), '# Continue Here\nedition one\n', `${state}: .prev.md is not the edition`);
      assert.equal(existsSync(tree.file), survives, `${state}: ${survives ? 'copy' : 'move'} expected`);
    } finally {
      rmTree(tree.base);
    }
  }

  const tracked = archiveTree({}, { tracked: true });
  try {
    const res = runArchive(tracked, 'consumed');
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /archive: git history, tracked/);
    assert.equal(existsSync(join(tracked.proj, 'CONTINUE_HERE.prev.md')), false, 'a tracked handoff got a copy it does not need');
    writeFileSync(tracked.file, '# Continue Here\nedited after the commit\n');
    const dirty = runArchive(tracked, 'superseded');
    assert.notEqual(dirty.status, 0, 'uncommitted changes to a tracked handoff were not refused');
    assert.match(dirty.stderr, /REFUSED: .*uncommitted changes/);
  } finally {
    rmTree(tracked.base);
  }
});

test('archive: refuses to run without ARCHIVE_STATE, and needs no grep, rg, sed or awk', () => {
  const tree = archiveTree({ project: 'Handoff archive: arch\n' });
  const toolDir = mkdtempSync(join(tmpdir(), 'archiveTools-'));
  try {
    const unset = runArchive(tree, '');
    assert.notEqual(unset.status, 0);
    assert.match(unset.stderr, /set it to consumed when reading/);
    for (const tool of ['bash', 'git', 'cp', 'mv', 'mkdir', 'date']) {
      const target = spawnSync('bash', ['-c', `command -v ${tool}`], { encoding: 'utf8' }).stdout.trim();
      symlinkSync(target, join(toolDir, tool));
    }
    const res = runArchive(tree, 'consumed', { PATH: toolDir });
    assert.equal(res.status, 0, `with only bash, git, cp, mv, mkdir and date on PATH\n${res.stderr}`);
    assert.match(res.stdout, archivedName(join(tree.proj, 'arch'), 'consumed'));
  } finally {
    rmTree(tree.base);
    rmTree(toolDir);
  }
});

// ── the Verified: values (#1040 decisions 1 to 3) ───────────────────────────────────────────

const VERIFY = 'skills/verify-continue-here/SKILL.md';

test('Verified: write lists exactly three values, and read and verify spell the full-gate one the same', () => {
  // read-continue-here decides whether to re-confirm by matching this value, and
  // verify-continue-here writes it. A respelling in either leaves a handoff that passed the gate
  // re-confirmed for nothing, or one that did not pass trusted.
  const values = [...read(WRITE).matchAll(/^- `((?:single pass|verify-handoff round|not run)[^`]*)`/gm)].map((m) => m[1]);
  assert.deepEqual(values, [
    'single pass, N blocking applied, coverage <complete|incomplete>, findings <file>',
    'verify-handoff round N, 0 blocking, coverage complete',
    'not run (workflow unavailable)',
  ]);
  for (const rel of [READ, VERIFY]) {
    assert.ok(read(rel).includes(`\`${values[1]}\``) || read(rel).includes(`Verified: ${values[1]}`),
      `${rel} does not spell the full-gate value as write-continue-here does: ${values[1]}`);
  }
});

test('HOSTILE ENVIRONMENT: a GIT_DIR pointing at another repository cannot reach it', () => {
  // Not a note, an arm. `cwd` and `-C` are not isolation, and the failure is silent — the suite
  // passes while writing its fixture into the caller's history. A commit count would miss objects
  // written into the store, so the whole victim tree is hashed, `.git` included.
  const victim = fixture({ 'keep.txt': 'original' }, { commit: ['keep.txt'] });
  // The victim's identity must DIFFER from the one `fixture` writes. With both set to the same
  // value a leaked `git config` rewrites the same bytes, the digest does not move, and the arm
  // passes whether or not the environment is scrubbed — measured: that version of this test
  // survived the mutant that removes `cleanEnv` from `fixture`.
  spawnSync('git', ['-C', victim, 'config', 'user.email', 'victim@example.invalid'], {
    encoding: 'utf8',
    env: cleanEnv(victim),
  });
  const digest = () => {
    const hash = createHash('sha256');
    for (const entry of readdirSync(victim, { recursive: true }).sort()) {
      const full = join(victim, entry);
      if (!statSync(full).isFile()) continue;
      hash.update(entry).update('\0').update(readFileSync(full)).update('\0');
    }
    return hash.digest('hex');
  };
  const before = digest();

  const saved = { GIT_DIR: process.env.GIT_DIR, GIT_WORK_TREE: process.env.GIT_WORK_TREE };
  process.env.GIT_DIR = join(victim, '.git');
  process.env.GIT_WORK_TREE = victim;
  let tracked;
  try {
    // The most dangerous path in this suite: it commits.
    tracked = fixture({ 'CONTINUE_HERE.md': 'x' }, { commit: ['CONTINUE_HERE.md'] });
    const res = runBash(extractBlock(READ, CLEANUP_MARKER), {
      cwd: tracked,
      env: { CONTINUE_FILE: join(tracked, 'CONTINUE_HERE.md'), ARCHIVED: 'fixture' },
    });
    assert.equal(res.status, 0, `cleanup failed under a hostile environment\n${res.stderr}`);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (tracked) rmTree(tracked);
  }

  try {
    assert.equal(
      digest(),
      before,
      'the suite wrote into a repository named only by GIT_DIR — cwd and -C are not isolation',
    );
  } finally {
    rmTree(victim);
  }
});

test('NEGATIVE ARM: the shape checker rejects the 1.x payload', () => {
  // Every assertion above is worthless if `injectedContext` stopped looking. Feed it the object
  // 1.x emitted: it must fail, naming the key it found instead.
  const oneX = '{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":"x"}}}';
  assert.throws(
    () => injectedContext(oneX),
    /sessionStartContext/,
    'the shape checker accepts the payload Claude Code discards — it is not checking anything',
  );
});
