import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from './_tmp.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'check-banned-invocations.js');

/** Run the checker against a throwaway tree, returning {status, stdout}. */
function run(root, extra = []) {
  try {
    const stdout = execFileSync('node', [SCRIPT, '--root', root, ...extra], { encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (e) {
    return { status: e.status, stdout: String(e.stdout || '') + String(e.stderr || '') };
  }
}

function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'banned-'));
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, 'utf8');
  }
  return root;
}

const CLEAN = '# Render\n\nRun `bash viz/build.sh --only design` to render.\n';

test('a clean tree passes', () => {
  const root = tree({ 'skills/create-glyph/SKILL.md': CLEAN });
  try {
    const r = run(root);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /OK: no banned invocation/);
  } finally { rmTree(root); }
});

// The point of the suite: break the subject, watch the gate go red. A checker that has
// only ever been observed passing is evidence about nothing.
test('a banned invocation in a FENCE is caught', () => {
  const root = tree({
    'skills/create-glyph/SKILL.md': '# Render\n\n```bash\ncd viz && Rscript build-icons.R --only design\n```\n',
  });
  try {
    const r = run(root);
    assert.equal(r.status, 1, 'must exit 1');
    assert.match(r.stdout, /1 banned invocation\(s\) across 1 file\(s\)/);
    assert.match(r.stdout, /use instead: bash viz\/build\.sh/);
  } finally { rmTree(root); }
});

// Half of the real instances (#526) were prose, not fences. A fence-shaped checker would
// have reported this file clean.
test('a banned invocation in PROSE is caught', () => {
  const root = tree({
    'skills/create-glyph/SKILL.md': '# Palettes\n\n3. Run `Rscript generate-palette-colors.R` to regenerate JSON\n',
  });
  try {
    const r = run(root);
    assert.equal(r.status, 1, 'prose must be covered too');
    assert.match(r.stdout, /generate-palette-colors/);
  } finally { rmTree(root); }
});

test('translated mirrors are scanned, not just English', () => {
  const root = tree({
    'skills/create-glyph/SKILL.md': CLEAN,
    'i18n/de/skills/create-glyph/SKILL.md': '# Rendern\n\n```bash\nRscript build-team-icons.R --only x\n```\n',
  });
  try {
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /i18n\/de\/skills\/create-glyph/);
    assert.match(r.stdout, /--type team/);
  } finally { rmTree(root); }
});

// The exemption must reach every locale, or a translation drifts out of its own carve-out
// and the checker fires on text whose whole purpose is to forbid the command.
test('render-icon-pipeline is exempt in English AND in every locale', () => {
  const banned = '- Never run `Rscript build-icons.R` manually. Use `bash build.sh`.\n';
  const root = tree({
    'skills/render-icon-pipeline/SKILL.md': banned,
    'i18n/ja/skills/render-icon-pipeline/SKILL.md': banned,
    'i18n/wenyan/skills/render-icon-pipeline/SKILL.md': banned,
  });
  try {
    const r = run(root);
    assert.equal(r.status, 0, 'the skill that bans the command must not be flagged for naming it');
    assert.match(r.stdout, /3 skipped as exempt/);
  } finally { rmTree(root); }
});

// The exemption is keyed on skill id, so it must NOT leak to a neighbouring skill.
test('the exemption does not leak to other skills', () => {
  const root = tree({
    'skills/render-icon-pipeline/SKILL.md': 'Never run `Rscript build-icons.R`.\n',
    'skills/enhance-glyph/SKILL.md': '```bash\nRscript build-icons.R --only x\n```\n',
  });
  try {
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /enhance-glyph/);
    assert.doesNotMatch(r.stdout, /render-icon-pipeline\n/);
  } finally { rmTree(root); }
});

// A checker whose glob matches nothing exits 0 reporting success — the exact silence that
// left a CI job green having run nothing (#486). Refuse to report a pass on an empty scan.
test('an empty tree exits 2 rather than reporting success', () => {
  const root = tree({ 'README.md': 'nothing here\n' });
  try {
    const r = run(root);
    assert.equal(r.status, 2, 'must not report OK when it found nothing to scan');
    assert.match(r.stdout, /refusing to report success/);
  } finally { rmTree(root); }
});

test('--list prints the rules and exits 0 without scanning', () => {
  const root = tree({ 'skills/x/SKILL.md': '```bash\nRscript build-icons.R\n```\n' });
  try {
    const r = run(root, ['--list']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /Rscript generate-palette-colors\.R/);
    assert.match(r.stdout, /render-icon-pipeline/);
  } finally { rmTree(root); }
});

test('an unknown flag exits 2 rather than being ignored', () => {
  const root = tree({ 'skills/x/SKILL.md': CLEAN });
  try {
    assert.equal(run(root, ['--pretend']).status, 2);
  } finally { rmTree(root); }
});
