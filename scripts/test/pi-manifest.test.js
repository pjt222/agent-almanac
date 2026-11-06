// pi-manifest.test.js — the `pi` key in package.json lists real, shipped skills (#1008).
//
// pi installs a package (`pi install npm:agent-almanac`) and loads the skills its
// `package.json` names under `pi.skills`. The maintainer chose a curated set over every
// skill (2026-10-22): every skill would put about 65,000 tokens of names, descriptions and paths
// into each pi request (the 373 registered skills plus a probe in the no-manifest npm-pack row of
// tests/results/2026-10-22-pi-package-manifest/RESULT.md, pi 1.4.0's formatSkillsForPrompt).
//
// The list is the curation, so it is pinned here against the tree, not against a copy of
// itself. Each entry must be an explicit `skills/<id>/SKILL.md`: a directory entry such as
// `./skills` makes pi scan the root of `skills/` in its "pi" mode, where a root Markdown file
// is a candidate skill, and a glob such as `skills/*` hands pi `_registry.yml` as well (both
// read from pi 1.4.0's dist/core/package-manager.js). Renaming or removing a curated skill
// fails here; adding a skill to the set stays a deliberate edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { isExcludedFromPackage, shippedEntries } from '../lib/skills-inventory.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
const entries = pkg.pi?.skills ?? [];

const registry = yaml.load(readFileSync(join(REPO_ROOT, 'skills', '_registry.yml'), 'utf8'));
const registeredIds = new Set(
  Object.values(registry.domains).flatMap((domain) => (domain.skills ?? []).map((skill) => skill.id)),
);

/** Whether npm ships `relPath`, by the `files` list and its negations. */
function ships(relPath) {
  const { included, negations } = shippedEntries(REPO_ROOT);
  const inIncluded = included.some((entry) => (entry.endsWith('/') ? relPath.startsWith(entry) : relPath === entry));
  return inIncluded && !isExcludedFromPackage(relPath, negations);
}

test('package.json declares a non-empty pi.skills list and the pi-package keyword', () => {
  assert.ok(Array.isArray(pkg.pi?.skills), 'package.json has no pi.skills array');
  assert.ok(entries.length > 0, 'pi.skills is empty');
  assert.ok(pkg.keywords?.includes('pi-package'), 'the pi-package keyword is missing');
});

test('every pi.skills entry is an explicit skills/<id>/SKILL.md, not a directory or a glob', () => {
  const malformed = entries.filter((entry) => !/^skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(entry));
  assert.deepEqual(malformed, [], `entries that are not skills/<id>/SKILL.md: ${malformed.join(', ')}`);
});

test('every pi.skills entry names a registered skill whose SKILL.md exists and ships', () => {
  const problems = [];
  for (const entry of entries) {
    const id = entry.split('/')[1];
    if (!registeredIds.has(id)) problems.push(`${entry}: ${id} is not in skills/_registry.yml`);
    if (!existsSync(join(REPO_ROOT, entry))) problems.push(`${entry}: no such file`);
    if (!ships(entry)) problems.push(`${entry}: not shipped by package.json files`);
  }
  assert.deepEqual(problems, []);
});

test('pi.skills has no duplicates and no template', () => {
  const duplicates = entries.filter((entry, index) => entries.indexOf(entry) !== index);
  assert.deepEqual(duplicates, [], `duplicated: ${duplicates.join(', ')}`);
  assert.deepEqual(entries.filter((entry) => entry.includes('_template')), []);
});
