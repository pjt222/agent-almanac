/**
 * Tests for `scripts/check-skill-byte-ceiling.js` (#1128).
 *
 * Boundary semantics are pinned against `agy 1.5.18` (`agy plugin validate --strict --json`):
 * leading BOM, blank lines, and YAML frontmatter (including `---` delimiters with trailing
 * spaces/tabs) are stripped, outer whitespace is trimmed, and the body is measured in UTF-8
 * bytes against a 24,000-byte ceiling.
 *
 * Synthetic fixtures prove the red/green boundary, CLI scoping, non-vacuous refusal on empty
 * or missing directories, and symlinked invocation. The final test checks the live English
 * corpus informationally so any future overrun surfaces directly in `npm run test:scripts`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  readdirSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  CEILING,
  extractBody,
  countBodyBytes,
  checkSkillText,
  checkSkill,
} from '../check-skill-byte-ceiling.js';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILLS_DIR = resolve(REPO, 'skills');
const SCRIPT = resolve(REPO, 'scripts', 'check-skill-byte-ceiling.js');

const SAMPLE_FM = '---\nname: synthetic-skill\ndescription: synthetic test fixture\n---\n';

test('CEILING matches Antigravity CLI per-skill body cap (24,000 bytes)', () => {
  assert.equal(CEILING, 24000);
});

test('extractBody strips LF/CRLF frontmatter, trailing delimiter spaces, leading blank lines, and BOM', () => {
  assert.equal(extractBody(`${SAMPLE_FM}\n# Title\n\nBody\n`), '# Title\n\nBody');
  assert.equal(
    extractBody('---\r\nname: crlf-skill\r\n---\r\n\r\n# CRLF\r\n'),
    '# CRLF',
  );
  assert.equal(extractBody('---\n---\nBody after empty fm\n'), 'Body after empty fm');
  assert.equal(
    extractBody('---   \nname: spaced-delimiters\ndescription: test\n---\t \n# Spaced\n'),
    '# Spaced',
  );
  assert.equal(
    extractBody('\n\n---\nname: leading-blank\n---\n# After blank\n'),
    '# After blank',
  );
  assert.equal(
    extractBody(`${SAMPLE_FM}Section 1\n---\nSection 2\n`),
    'Section 1\n---\nSection 2',
  );
  assert.equal(extractBody('\uFEFF---\nname: bom\n---\nAfter BOM\n'), 'After BOM');
  assert.equal(extractBody('  No frontmatter body  \n'), 'No frontmatter body');
});

test('countBodyBytes measures UTF-8 bytes, excludes frontmatter, and trims outer newlines', () => {
  const hugeFrontmatter = `---\nname: fm-heavy\ndescription: ${'x'.repeat(5000)}\n---\n`;
  assert.equal(countBodyBytes(hugeFrontmatter + 'a'.repeat(100)), 100);
  assert.equal(countBodyBytes(`${SAMPLE_FM}\n${'a'.repeat(CEILING)}\n`), CEILING);

  // 3-byte UTF-8 characters (CJK and em-dash) and 4-byte emoji
  assert.equal(countBodyBytes(`${SAMPLE_FM}${'中'.repeat(8000)}`), 24000);
  assert.equal(countBodyBytes(`${SAMPLE_FM}—${'a'.repeat(23999)}`), 24002);
  assert.equal(countBodyBytes(`${SAMPLE_FM}🔥`), 4);
});

test('checkSkillText: at 24,000 UTF-8 body bytes passes; 24,001 or multibyte overrun fails', () => {
  const atCeiling = checkSkillText(`${SAMPLE_FM}\n${'a'.repeat(CEILING)}\n`, 'at-ceiling');
  assert.equal(atCeiling.bytes, CEILING);
  assert.equal(atCeiling.ceiling, CEILING);
  assert.equal(atCeiling.over, false);

  const overByOne = checkSkillText(`${SAMPLE_FM}${'a'.repeat(CEILING + 1)}`, 'over-by-one');
  assert.equal(overByOne.bytes, CEILING + 1);
  assert.equal(overByOne.over, true);

  // 24,000 characters, but 24,002 UTF-8 bytes — must fail (proves byte counting, not .length)
  const overMultibyte = checkSkillText(`${SAMPLE_FM}—${'a'.repeat(CEILING - 1)}`, 'over-multibyte');
  assert.equal(overMultibyte.bytes, CEILING + 2);
  assert.equal(overMultibyte.over, true);
});

test('checkSkill: a missing SKILL.md reports an error, not a false pass', () => {
  const result = checkSkill('this-skill-id-does-not-exist-1128');
  assert.equal(result.error, 'SKILL.md not found');
  assert.equal(result.over, undefined);
});

test('CLI: checks corpus, scopes explicit IDs, ignores scaffolding/non-skills, and fails on overruns', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aa-byte-ceiling-'));
  try {
    mkdirSync(join(dir, 'ok-skill'), { recursive: true });
    writeFileSync(join(dir, 'ok-skill', 'SKILL.md'), `${SAMPLE_FM}\n${'a'.repeat(CEILING)}\n`);

    // Scaffolding dir, non-directory files, and subdirectories without SKILL.md must be ignored
    mkdirSync(join(dir, '_template'), { recursive: true });
    writeFileSync(join(dir, '_template', 'SKILL.md'), `${SAMPLE_FM}${'a'.repeat(CEILING + 5000)}\n`);
    writeFileSync(join(dir, '_registry.yml'), 'total_skills: 1\n');
    writeFileSync(join(dir, 'README.md'), '# Skills\n');
    mkdirSync(join(dir, 'dir-without-skill'), { recursive: true });

    const passRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', dir], { encoding: 'utf8' });
    assert.equal(passRun.status, 0, `expected exit 0, got ${passRun.status}:\n${passRun.stdout}\n${passRun.stderr}`);
    assert.match(passRun.stdout, /checked 1 skill\(s\), ceiling 24000 UTF-8 body bytes \(max: ok-skill at 24000 bytes\)/);

    // `--skills-dir=<dir>` form works identically
    const eqRun = spawnSync(process.execPath, [SCRIPT, `--skills-dir=${dir}`], { encoding: 'utf8' });
    assert.equal(eqRun.status, 0);
    assert.match(eqRun.stdout, /checked 1 skill\(s\)/);

    // Add a 24,001-byte skill — full scan must go red
    mkdirSync(join(dir, 'over-skill'), { recursive: true });
    writeFileSync(join(dir, 'over-skill', 'SKILL.md'), `${SAMPLE_FM}${'a'.repeat(CEILING + 1)}\n`);

    const failRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', dir], { encoding: 'utf8' });
    assert.equal(failRun.status, 1, `expected exit 1, got ${failRun.status}:\n${failRun.stdout}`);
    assert.match(failRun.stdout, /OVER: over-skill \(24001 bytes > 24000\)/);

    // Explicit passing skill ID scopes the run even while `over-skill` exists in the same dir
    const scopedPass = spawnSync(process.execPath, [SCRIPT, '--skills-dir', dir, 'ok-skill'], { encoding: 'utf8' });
    assert.equal(scopedPass.status, 0, `expected scoped exit 0, got ${scopedPass.status}:\n${scopedPass.stdout}`);
    assert.match(scopedPass.stdout, /checked 1 skill\(s\).*max: ok-skill at 24000 bytes/);

    // Explicit missing skill ID must fail loudly
    const missingRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', dir, 'no-such-skill'], { encoding: 'utf8' });
    assert.equal(missingRun.status, 1);
    assert.match(missingRun.stdout, /ERROR: no-such-skill: SKILL\.md not found/);
  } finally {
    rmTree(dir);
  }
});

test('CLI: refuses empty/missing/non-directory --skills-dir and bad flags with exit 2 (non-vacuous)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aa-byte-ceiling-refuse-'));
  try {
    const emptyDir = join(dir, 'empty-skills');
    mkdirSync(emptyDir, { recursive: true });
    const filePath = join(dir, 'not-a-dir.txt');
    writeFileSync(filePath, 'hello\n');

    // Empty skills directory must refuse loudly rather than passing vacuously on 0 skills
    const emptyRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', emptyDir], { encoding: 'utf8' });
    assert.equal(emptyRun.status, 2);
    assert.match(emptyRun.stderr, /ERROR: no skills found in/);

    // Nonexistent directory must exit 2 cleanly (no uncaught ENOENT stack trace)
    const absentRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', join(dir, 'missing')], { encoding: 'utf8' });
    assert.equal(absentRun.status, 2);
    assert.match(absentRun.stderr, /ERROR: skills directory not readable:/);

    // Regular file passed as --skills-dir must exit 2
    const fileRun = spawnSync(process.execPath, [SCRIPT, '--skills-dir', filePath], { encoding: 'utf8' });
    assert.equal(fileRun.status, 2);
    assert.match(fileRun.stderr, /ERROR: skills path is not a directory:/);

    // Missing --skills-dir values and unknown flags (single- or double-dash) must exit 2
    for (const badArgs of [
      ['--skills-dir'],
      ['--skills-dir', '--other'],
      ['--skills-dir='],
      ['--not-a-flag'],
      ['-h'],
    ]) {
      const res = spawnSync(process.execPath, [SCRIPT, ...badArgs], { encoding: 'utf8' });
      assert.equal(res.status, 2, `expected exit 2 for ${JSON.stringify(badArgs)}, got ${res.status}`);
      assert.match(res.stderr, /^ERROR:/);
    }
  } finally {
    rmTree(dir);
  }
});

test('CLI: invoked through a symlinked path still executes the gate rather than silently exiting 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aa-byte-ceiling-sym-'));
  try {
    const linkRepo = join(dir, 'repo-link');
    symlinkSync(REPO, linkRepo);
    const linkedScript = join(linkRepo, 'scripts', 'check-skill-byte-ceiling.js');

    const badFlag = spawnSync(process.execPath, [linkedScript, '--not-a-flag'], { encoding: 'utf8' });
    assert.equal(badFlag.status, 2, 'symlinked invocation silently skipped CLI entry guard');
    assert.match(badFlag.stderr, /ERROR: unknown option: --not-a-flag/);
  } finally {
    rmTree(dir);
  }
});

test('INFORMATIONAL: every real English skill in the corpus is at or under 24,000 UTF-8 body bytes', () => {
  const ids = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => e.name)
    .filter((name) => existsSync(resolve(SKILLS_DIR, name, 'SKILL.md')));
  assert.ok(ids.length > 300, `expected hundreds of skills, found ${ids.length} — is SKILLS_DIR resolved correctly?`);

  const over = ids
    .map((id) => checkSkillText(readFileSync(resolve(SKILLS_DIR, id, 'SKILL.md'), 'utf8'), id))
    .filter((r) => r.over);
  assert.deepEqual(
    over.map((r) => `${r.skill} (${r.bytes} > ${r.ceiling})`),
    [],
    'one or more English skills exceed 24,000 UTF-8 body bytes — extract reference material to references/',
  );
});
