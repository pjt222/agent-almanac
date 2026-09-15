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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
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

/** A throwaway git repository. `files` maps repo-relative paths to contents. */
function fixture(files, { commit = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'continuehere-'));
  const git = (...args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
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
  return spawnSync('bash', ['-c', script], { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
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

  const tracked = fixture({ 'docs/CONTINUE_HERE.md': 'x' }, { commit: ['docs/CONTINUE_HERE.md'] });
  try {
    const path = join(tracked, 'docs', 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: tracked, env: { CONTINUE_FILE: path } });
    assert.equal(res.status, 0, `tracked arm exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'tracked handoff was not deleted');
    const log = spawnSync('git', ['-C', tracked, 'log', '--oneline'], { encoding: 'utf8' }).stdout;
    assert.equal(log.trim().split('\n').length, 2, 'the tracked deletion was not committed');
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
  const nasty = '# Continue Here\nquote " backslash \\ tab\there\r\ndone';
  for (const withJq of [true, false]) {
    const dir = fixture({ 'CONTINUE_HERE.md': nasty });
    try {
      // Hiding jq exercises the awk fallback, which is the branch a machine without jq takes and
      // the one most likely to emit invalid JSON.
      const script = withJq ? hook : `jq() { return 127; }\ncommand() { return 1; }\n${hook}`;
      const res = runBash(script, { cwd: dir });
      assert.equal(res.status, 0, `jq=${withJq}: hook exited ${res.status}\n${res.stderr}`);
      const ctx = injectedContext(res.stdout);
      assert.match(ctx, /quote " backslash \\ tab\there/, `jq=${withJq}: escaping mangled the content`);
      assert.doesNotMatch(ctx, /\r/, `jq=${withJq}: CR survived the strip`);
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
