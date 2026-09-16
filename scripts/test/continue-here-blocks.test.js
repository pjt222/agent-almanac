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
 * The shape assertion carries its own negative arm — the same checker fed the 1.x object must
 * reject it. Without that, a checker that had quietly stopped looking at anything would pass every
 * positive case forever, which is the exact failure mode this suite exists to prevent.
 *
 * Fixtures are built with `mkdtempSync` and torn down with `rmTree`, never a bare recursive
 * `rmSync` and never a shared fixed path (#493, #791).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const READ = 'skills/read-continue-here/SKILL.md';
const WRITE = 'skills/write-continue-here/SKILL.md';

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
  // and cannot source anything — so the resolver marker legitimately matches two fences in
  // read-continue-here. Narrow by what the fence OPENS with rather than loosening the marker,
  // and pin the hook's copy separately below, where it belongs.
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

/** The SessionStart hook script, taken from between the heredoc delimiters in read-continue-here. */
function extractHook() {
  const lines = read(READ).split('\n');
  const start = lines.indexOf(HOOK_OPEN);
  assert.ok(start >= 0, `${READ} no longer opens the hook heredoc with ${JSON.stringify(HOOK_OPEN)}`);
  const end = lines.indexOf(HOOK_CLOSE, start + 1);
  assert.ok(end > start, `${READ}'s hook heredoc is never closed`);
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

function runBash(script, { cwd, env = {} } = {}) {
  // Same reason as `cleanEnv`'s docblock: the cleanup block runs `git rm` and `git commit`, so an
  // inherited GIT_DIR would land them in whatever repository the suite was started from.
  return spawnSync('bash', ['-c', script], { cwd, encoding: 'utf8', env: cleanEnv(cwd, env) });
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

    const res = runBash(block, { cwd: tracked, env: { CONTINUE_FILE: path } });
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
    const res = runBash(block, { cwd: untracked, env: { CONTINUE_FILE: path } });
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
      env: { CONTINUE_FILE: join(tracked, 'CONTINUE_HERE.md') },
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
