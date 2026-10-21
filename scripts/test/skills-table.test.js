/**
 * skills-table.test.js — the skills-by-domain table links nothing that does not exist (#796).
 *
 * The generated table in `skills/README.md` linked every domain cell to `<domain>/`, a directory
 * that has not existed since the skills tree went flat (`skills/<id>/SKILL.md`). One 404 per
 * domain, and `check-readmes` stayed green throughout, because it compares the generator's
 * output with itself.
 *
 * The decision recorded on #796 is plain text, no link: the domain is a registry grouping, not a
 * place, so nothing on disk could be its target. Link resolution over the generated READMEs is
 * deliberately out of scope here (#796 AC4) — this suite pins the cell shape, which is what a
 * restored directory link breaks.
 *
 * The generator is imported inside each arm, so a missing export is that arm's own message.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as yaml from 'js-yaml';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GENERATOR = join(REPO_ROOT, 'scripts', 'generate-readmes.js');

async function tableRenderer() {
  const mod = await import(pathToFileURL(GENERATOR).href);
  assert.equal(
    typeof mod.generateSkillsTable,
    'function',
    'scripts/generate-readmes.js exports no generateSkillsTable, so the domain cell cannot be driven against a fixture (#796)',
  );
  return mod.generateSkillsTable;
}

// Two domains, one of them hyphenated, so the display-name rule is exercised on both shapes.
const DOMAINS = {
  general: { description: 'General things', skills: [{ id: 'a' }, { id: 'b' }] },
  'r-packages': { description: 'R package work', skills: [{ id: 'c' }] },
};

test('a domain cell is its display name in plain text, never a link', async () => {
  const generateSkillsTable = await tableRenderer();
  assert.equal(
    generateSkillsTable(DOMAINS),
    [
      '| Domain | Skills | Description |',
      '|---|---|---|',
      '| General | 2 | General things |',
      '| R Packages | 1 | R package work |',
    ].join('\n'),
  );
});

test('no row of the rendered table carries a markdown link', async () => {
  // The exact-table arm above already fails on any change; this one names the defect class in
  // its message, so a restored link reads as #796 rather than as an opaque string diff.
  const generateSkillsTable = await tableRenderer();
  const linked = generateSkillsTable(DOMAINS).split('\n').filter((row) => /\]\([^)]*\)/.test(row));
  assert.deepEqual(linked, [], 'a domain cell links somewhere; the skills tree is flat, so <domain>/ is a 404 (#796)');
});

test('LIVE: the committed skills/README.md table links no domain to a directory', () => {
  // The published surface, read from the committed file. `check-readmes` keeps it equal to the
  // generator's output, so this arm is the defect as a reader of GitHub sees it.
  const readme = readFileSync(join(REPO_ROOT, 'skills', 'README.md'), 'utf8');
  const block = readme.match(/<!-- AUTO:START:skills-table -->([\s\S]*?)<!-- AUTO:END:skills-table -->/);
  assert.ok(block, 'skills/README.md has no skills-table AUTO block for this arm to read');
  const registry = yaml.load(readFileSync(join(REPO_ROOT, 'skills', '_registry.yml'), 'utf8'));
  const domainIds = Object.keys(registry.domains);
  assert.ok(domainIds.length > 0, 'control: the registry carries domains');
  const dead = domainIds.filter((id) => block[1].includes(`](${id}/)`));
  assert.deepEqual(
    dead,
    [],
    `skills/README.md links ${dead.length} domain cell(s) to a directory that does not exist (#796)`,
  );
});
