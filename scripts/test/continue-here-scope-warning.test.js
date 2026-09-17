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
  const grepMatch = block.match(/grep\s+-m\s*1\s+-F\s+'([^']+)'/);
  assert.ok(grepMatch, `${READ}'s cleanup block no longer greps for a fixed -F literal — re-derive this test's extraction`);
  const checkedLiteral = grepMatch[1];

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

test('NEGATIVE ARM: a many-match handoff does not misfire the SIGPIPE this repo already measured once (#858)', () => {
  // `grep -m 1` must never be `| head -1` here: piping into head can take a SIGPIPE on a handoff
  // with many matching lines and, on the scanner #858 fixed, that misread as "not found". Build a
  // handoff with many hits and confirm the warning still fires and the delete still runs.
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
