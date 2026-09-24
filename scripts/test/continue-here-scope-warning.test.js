/**
 * Executable coverage for the peer-session scope-declaration warning `read-continue-here` Step 5
 * emits before it deletes a handoff (#857).
 *
 * #660 established that a scope declaration stored in `CONTINUE_HERE.md` is destroyed by the
 * first session that reads it — the reader consumes and deletes the handoff before the peer that
 * still needs the declaration can see it. #856 answered the general case with advice
 * (`coordinate-peer-sessions` no longer recommends the handoff as a declaration channel), because
 * a gate cannot recognise a scope declaration in free prose. But `coordinate-peer-sessions` Step 3
 * emits a FIXED literal — `Nobody runs:` — so a handoff carrying that exact prefix carries a scope
 * declaration by construction, no prose understanding required. This suite asserts two things:
 *
 *   1. NO DOUBLE HARDCODE — the literal Step 5's cleanup block searches for is derived from
 *      `coordinate-peer-sessions` Step 3's own emitted example, not typed twice by hand. If Step 3
 *      ever changes the fence, this test fails naming the drift rather than the two silently
 *      disagreeing forever.
 *   2. BEHAVIOUR — the cleanup block, extracted and run against fixtures, warns to stderr and
 *      names the found line when the handoff carries the declaration, stays silent when it does
 *      not, and in both cases still deletes the file (a warning, never a refusal or a skip).
 *
 * The check is a pure shell loop (`while read` + `case`), not `grep`/`rg`, for a reason specific
 * to this repository: its own Bash hook blocks a bare `grep` invocation outright, so a `grep`-based
 * check here would never fire in the one environment this suite runs in. It is also anchored on
 * the LINE START (`case "$l" in "Nobody runs:"*)`), not an unanchored substring match — an earlier
 * version fired on prose *about* the mechanism (this file's own commit history discussing the
 * literal, for instance), which is a false positive the fixture below reproduces and pins closed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const READ = 'skills/read-continue-here/SKILL.md';
const COORD = 'skills/coordinate-peer-sessions/SKILL.md';

/** Identifies the cleanup fence without depending on fence ordinal (siblings could gain fences). */
const CLEANUP_MARKER = 'git rm -q "$CONTINUE_FILE"';

const read = (rel) => readFileSync(join(REPO, rel), 'utf8');

/** Every ```bash fence body in a markdown file, in document order. */
function bashFences(markdown) {
  const out = [];
  const re = /^```bash\r?\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) out.push(m[1]);
  return out;
}

/** Every ```text fence body in a markdown file, in document order. */
function textFences(markdown) {
  const out = [];
  const re = /^```text\r?\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) out.push(m[1]);
  return out;
}

function extractCleanupBlock() {
  const hits = bashFences(read(READ)).filter((body) => body.includes(CLEANUP_MARKER));
  assert.ok(hits.length > 0, `${READ} does not carry the cleanup block marked by ${JSON.stringify(CLEANUP_MARKER)}`);
  assert.equal(hits.length, 1, `${READ} carries ${hits.length} copies of the cleanup block`);
  return hits[0];
}

/** `coordinate-peer-sessions` Step 3's emitted `Nobody runs:` line, as a fact independent of Step 5. */
function coordinatorScopeLine() {
  const fences = textFences(read(COORD)).filter((body) => /^Nobody runs:/m.test(body));
  assert.ok(fences.length > 0, `${COORD} no longer emits a line starting "Nobody runs:" in a text fence — Step 3 may have changed shape`);
  assert.equal(fences.length, 1, `${COORD} emits ${fences.length} example fences carrying "Nobody runs:"; expected exactly one source of truth`);
  const match = fences[0].match(/^Nobody runs:.*$/m);
  assert.ok(match, 'fence matched the filter but the line regex did not — should be unreachable');
  return match[0];
}

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

function fixture(files, { commit = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'scopewarn-'));
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
  return spawnSync('bash', ['-c', script], { cwd, encoding: 'utf8', env: cleanEnv(cwd, env) });
}

/** A PATH directory carrying only bash, git and rm — explicitly no grep, no rg. */
function noSearchToolPath() {
  const dir = mkdtempSync(join(tmpdir(), 'noSearchTool-'));
  for (const tool of ['bash', 'git', 'rm']) {
    const target = execFileSync('bash', ['-c', `command -v ${tool}`], { encoding: 'utf8' }).trim();
    symlinkSync(target, join(dir, tool));
  }
  return dir;
}

test('bash is available — this suite may not pass by skipping', () => {
  const res = spawnSync('bash', ['-c', 'echo ok'], { encoding: 'utf8' });
  assert.equal(res.status, 0, 'bash missing: the published block cannot be executed');
});

test('DRIFT: the prefix Step 5 checks for is derived from coordinate-peer-sessions Step 3, not hand-typed twice', () => {
  const sourceLine = coordinatorScopeLine();
  const colonIndex = sourceLine.indexOf(':');
  assert.ok(colonIndex > 0, `"${sourceLine}" has no colon to derive a prefix from`);
  const derivedPrefix = sourceLine.slice(0, colonIndex + 1); // "Nobody runs:"

  const block = extractCleanupBlock();
  const caseMatch = block.match(/case\s+"\$\w+"\s+in\s+"([^"]+)"\*\)/);
  assert.ok(caseMatch, `${READ}'s cleanup block no longer matches a fixed line-start literal via a case pattern — re-derive this test's extraction`);
  const checkedLiteral = caseMatch[1];

  assert.equal(
    checkedLiteral,
    derivedPrefix,
    `Step 5 checks for ${JSON.stringify(checkedLiteral)} but coordinate-peer-sessions Step 3 emits ` +
      `${JSON.stringify(sourceLine)} (prefix ${JSON.stringify(derivedPrefix)}) — the two have drifted`,
  );
});

test('cleanup: warns and names the line when the handoff carries a scope declaration, still deletes it', () => {
  const block = extractCleanupBlock();
  const content = '# Continue Here\nBranch: feat/x\nNobody runs: git stash, git checkout -- <path>, git reset --hard\n';

  const untracked = fixture({ 'CONTINUE_HERE.md': content });
  try {
    const path = join(untracked, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: untracked, env: { CONTINUE_FILE: path } });
    assert.equal(res.status, 0, `cleanup exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'the handoff was not deleted despite carrying a scope declaration — the warning must not become a refusal');
    assert.match(res.stderr, /WARNING/, 'no warning printed for a handoff that carries the scope declaration');
    assert.match(res.stderr, /Nobody runs: git stash/, 'the warning did not name the line that was found');
  } finally {
    rmTree(untracked);
  }

  const tracked = fixture({ 'CONTINUE_HERE.md': content }, { commit: ['CONTINUE_HERE.md'] });
  try {
    const path = join(tracked, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: tracked, env: { CONTINUE_FILE: path } });
    assert.equal(res.status, 0, `cleanup exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'tracked handoff carrying a scope declaration was not deleted');
    assert.match(res.stderr, /WARNING/, 'no warning printed on the tracked arm');
  } finally {
    rmTree(tracked);
  }
});

test('cleanup: stays silent and still deletes when the handoff carries no scope declaration', () => {
  const block = extractCleanupBlock();
  const dir = fixture({ 'CONTINUE_HERE.md': '# Continue Here\nno scope declaration in this one\n' });
  try {
    const path = join(dir, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: dir, env: { CONTINUE_FILE: path } });
    assert.equal(res.status, 0, `cleanup exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'an ordinary handoff was not deleted');
    assert.equal(res.stderr, '', `an ordinary handoff produced stderr output: ${JSON.stringify(res.stderr)}`);
  } finally {
    rmTree(dir);
  }
});

test('a many-line handoff is handled correctly — no pipe, so no SIGPIPE class to begin with (#858)', () => {
  // The earlier `grep -m 1 -F ... | ` shape (before this file moved to a pure shell loop) piped
  // into a construct that could take a SIGPIPE on a handoff with many matching lines, misread as
  // "not found" — the class #858 fixed on a different scanner. A shell `while read` loop has no
  // pipe to break, so this is a regression guard rather than a live risk, but the many-line shape
  // is still worth proving directly: warning still fires, delete still runs, 3 reps.
  const block = extractCleanupBlock();
  const manyLines = Array.from({ length: 500 }, () => 'Nobody runs: git stash, git checkout -- <path>, git reset --hard').join('\n');
  const dir = fixture({ 'CONTINUE_HERE.md': `# Continue Here\n${manyLines}\n` });
  try {
    const path = join(dir, 'CONTINUE_HERE.md');
    for (let i = 0; i < 3; i++) {
      writeFileSync(path, `# Continue Here\n${manyLines}\n`);
      const res = runBash(block, { cwd: dir, env: { CONTINUE_FILE: path } });
      assert.equal(res.status, 0, `run ${i + 1}: cleanup exited ${res.status}\n${res.stderr}`);
      assert.equal(existsSync(path), false, `run ${i + 1}: many-match handoff was not deleted`);
      assert.match(res.stderr, /WARNING/, `run ${i + 1}: no warning on a many-match handoff`);
    }
  } finally {
    rmTree(dir);
  }
});

test('FALSE POSITIVE FIX: prose discussing the mechanism does not trigger the warning, only a genuine line-start declaration does', () => {
  // An unanchored substring match (an earlier version of this check) fires on prose ABOUT the
  // "Nobody runs:" literal, not just a genuine declaration emitted by coordinate-peer-sessions
  // Step 3 — reproduced here with the exact shape found in this repository's own live
  // CONTINUE_HERE.md (a discussion of this very mechanism, not a scope declaration).
  const block = extractCleanupBlock();
  const prose =
    '# Continue Here\n' +
    'emits a fixed `Nobody runs:` literal, so a handoff containing it carries a scope declaration by\n' +
    'construction.\n';
  const dir = fixture({ 'CONTINUE_HERE.md': prose });
  try {
    const path = join(dir, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: dir, env: { CONTINUE_FILE: path } });
    assert.equal(res.status, 0, `cleanup exited ${res.status}\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'the handoff discussing the mechanism was not deleted');
    assert.equal(res.stderr, '', `prose merely mentioning "Nobody runs:" produced a warning: ${JSON.stringify(res.stderr)}`);
  } finally {
    rmTree(dir);
  }
});

test('NO EXTERNAL TOOL: the check still fires with neither grep nor rg on PATH', () => {
  // This repository's own Bash-tool hook blocks a bare `grep` invocation outright, which is
  // exactly the environment the warning most needs to work in (an agent session inside this
  // repo, running Step 5 at session start). Confirm the check has no such dependency by running
  // it under a PATH carrying only bash, git and rm — no grep, no rg, nothing else.
  const block = extractCleanupBlock();
  const content = '# Continue Here\nNobody runs: git stash, git checkout -- <path>, git reset --hard\n';
  const dir = fixture({ 'CONTINUE_HERE.md': content });
  const toolDir = noSearchToolPath();
  try {
    const path = join(dir, 'CONTINUE_HERE.md');
    const res = runBash(block, { cwd: dir, env: { CONTINUE_FILE: path, PATH: toolDir } });
    assert.equal(res.status, 0, `cleanup exited ${res.status} with grep/rg absent from PATH\n${res.stderr}`);
    assert.equal(existsSync(path), false, 'handoff was not deleted with grep/rg absent from PATH');
    assert.match(res.stderr, /WARNING/, 'no warning fired with grep/rg absent from PATH — the check depends on an external tool after all');
  } finally {
    rmTree(dir);
    rmTree(toolDir);
  }
});
