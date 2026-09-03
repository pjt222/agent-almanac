/**
 * Tests for `scripts/check-skill-path-refs.js` (#773).
 *
 * The mutant from the issue comes first: `write-continue-here` naming `verify-handofff.mjs`
 * must be a finding, on the real corpus file with the typo applied in memory. Then the token
 * predicate — what is and is not a repository path — because a predicate that admits
 * `tools/list` or `workflows/<name>.mjs` would flood the allowlist, and one that misses
 * `scripts/repo-guard.js:344` would let a real reference through. Then the allowlist as an
 * exact set, in both directions, and the CLI's exit codes including the vacuous-scan refusal.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ALLOWLIST, checkSkill, extractRefs, listSkills, main } from '../check-skill-path-refs.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'check-skill-path-refs.js');
const existsInRepo = (p) => spawnSync('test', ['-e', join(ROOT, p)]).status === 0;

// ── the mutant from the issue ───────────────────────────────────────────────

test('mutant: write-continue-here naming verify-handofff.mjs is a finding', () => {
  const original = readFileSync(join(ROOT, 'skills', 'write-continue-here', 'SKILL.md'), 'utf8');
  assert.ok(original.includes('`workflows/verify-handoff.mjs`'), 'precondition: the reference the issue cites is there');
  assert.deepEqual(checkSkill({ id: 'write-continue-here', text: original, exists: existsInRepo }), []);
  const mutant = original.replace('`workflows/verify-handoff.mjs`', '`workflows/verify-handofff.mjs`');
  const findings = checkSkill({ id: 'write-continue-here', text: mutant, exists: existsInRepo });
  assert.equal(findings.length, 1, findings.join('\n'));
  assert.match(findings[0], /skills\/write-continue-here\/SKILL\.md:\d+ names `workflows\/verify-handofff\.mjs`, which does not exist/);
});

// ── the token predicate ─────────────────────────────────────────────────────

test('what is a repository path: files under the three prefixes, line suffix stripped', () => {
  const text = [
    'see `scripts/repo-guard.js:344` and `tools/review-bundle.sh`',
    'and `workflows/verify-handoff.mjs`.',
  ].join('\n');
  assert.deepEqual(extractRefs(text), [
    { path: 'scripts/repo-guard.js', line: 1 },
    { path: 'tools/review-bundle.sh', line: 1 },
    { path: 'workflows/verify-handoff.mjs', line: 2 },
  ]);
});

test('what is not: MCP methods, directories, placeholders, other prefixes, traversal, unbackticked', () => {
  const text = [
    '`tools/list` `scripts/addons` `workflows/<name>.mjs` `scripts/*.js`',
    '`skills/x/SKILL.md` `scripts/../etc/passwd` scripts/plain.js `tools/a b.sh`',
    '`tools/x.sh:12:3`',
  ].join('\n');
  assert.deepEqual(extractRefs(text), [], 'none of these is a resolvable repository file reference');
});

// ── the allowlist is an exact set ───────────────────────────────────────────

test('a miss on the allowlist is not a finding; a hit on the allowlist IS (stale entry)', () => {
  const key = Object.keys(ALLOWLIST)[0];
  const [id, path] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
  const text = `Run \`${path}\` first.`;
  assert.deepEqual(checkSkill({ id, text, exists: () => false }), []);
  const stale = checkSkill({ id, text, exists: () => true });
  assert.equal(stale.length, 1);
  assert.match(stale[0], /is on the allowlist but now exists — remove the entry/);
});

test('the allowlist waives by skill AND path — another skill naming the same path still fails', () => {
  const key = Object.keys(ALLOWLIST)[0];
  const path = key.slice(key.indexOf(':') + 1);
  const findings = checkSkill({ id: 'some-other-skill', text: `\`${path}\``, exists: () => false });
  assert.equal(findings.length, 1);
});

test('every allowlist entry carries a reason and names a skill that exists', () => {
  for (const [key, reason] of Object.entries(ALLOWLIST)) {
    const id = key.slice(0, key.indexOf(':'));
    assert.ok(reason.length > 20, `${key}: a reason, not a token`);
    assert.ok(existsInRepo(`skills/${id}/SKILL.md`), `${key}: the skill exists`);
  }
});

// ── the corpus and the CLI ──────────────────────────────────────────────────

test('the corpus is clean, and the reference count is not zero', () => {
  const ids = listSkills(join(ROOT, 'skills'));
  assert.ok(ids.length > 300);
  let refs = 0;
  for (const id of ids) {
    const text = readFileSync(join(ROOT, 'skills', id, 'SKILL.md'), 'utf8');
    refs += extractRefs(text).length;
    assert.deepEqual(checkSkill({ id, text, exists: existsInRepo }), [], id);
  }
  assert.ok(refs >= 10, `expected a real population of references, saw ${refs}`);
});

test('the CLI exits 0 on the corpus and 1 on a tree with a dangling reference', (t) => {
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^OK: \d+ repository-path reference\(s\) across \d+ skills resolve/m);

  const dir = mkdtempSync(join(tmpdir(), 'skill-path-refs-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'skills', 'a-skill'), { recursive: true });
  mkdirSync(join(dir, 'tools'), { recursive: true });
  writeFileSync(join(dir, 'tools', 'real.sh'), '');
  writeFileSync(join(dir, 'skills', 'a-skill', 'SKILL.md'), 'Use `tools/real.sh` then `tools/missing.sh`.\n');
  // main() over that root: one hit, one miss; every allowlist entry is unreferenced there and reported.
  const captured = [];
  const orig = console.log;
  console.log = (line) => captured.push(line);
  let rc;
  try { rc = main(dir); } finally { console.log = orig; }
  assert.equal(rc, 1);
  assert.ok(captured.some((l) => /tools\/missing\.sh`, which does not exist/.test(l)), captured.join('\n'));
  assert.equal(captured.filter((l) => /allowlist entry .* matches no reference/.test(l)).length, Object.keys(ALLOWLIST).length);
});

test('a scan that finds zero references is exit 2, not a pass', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'skill-path-refs-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'skills', 'quiet'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'quiet', 'SKILL.md'), 'No paths here.\n');
  const errs = [];
  const orig = console.error;
  console.error = (line) => errs.push(line);
  let rc;
  try { rc = main(dir); } finally { console.error = orig; }
  assert.equal(rc, 2);
  assert.match(errs.join('\n'), /zero repository-path references scanned/);
});
