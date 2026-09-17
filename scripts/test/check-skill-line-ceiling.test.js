/**
 * Tests for `scripts/check-skill-line-ceiling.js` (#855).
 *
 * The claim under test is narrow: the English line ceiling is DERIVED from
 * `PROVENANCE_FIELDS.length`, not a hand-typed `494`, so a change to the field list moves the
 * ceiling without anyone editing a number. `CEILING` is asserted against `500 -
 * PROVENANCE_FIELDS.length` computed at test time — never against the literal `494` — so this
 * suite does not itself become the second place a 7th field would need to be taught about.
 *
 * `checkSkillText` is exercised directly on synthetic text (never the checked-in corpus): the
 * corpus already sits well under the ceiling (checked separately below, informationally, not as
 * a red/green gate), so a fixture crafted at exactly `ceiling + 1` lines is what proves the
 * boundary rather than hoping a real file happens to sit there.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CEILING, countLines, checkSkillText, checkSkill } from '../check-skill-line-ceiling.js';
import { PROVENANCE_FIELDS } from '../lib/provenance.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILLS_DIR = resolve(REPO, 'skills');

/** `n` newline-joined lines, each distinct so a wrong count can't hide behind repeated content. */
function linesOfText(n) {
  return Array.from({ length: n }, (_, i) => `line ${i + 1}`).join('\n') + '\n';
}

test('CEILING is derived from PROVENANCE_FIELDS.length, not a hand-typed 494', () => {
  assert.ok(PROVENANCE_FIELDS.length > 0, 'PROVENANCE_FIELDS is empty — nothing to derive a ceiling from');
  assert.equal(
    CEILING,
    500 - PROVENANCE_FIELDS.length,
    'CEILING has drifted from the formula this check claims to compute',
  );
});

test('countLines matches `wc -l` semantics: a trailing newline ends the last line, not a new empty one', () => {
  assert.equal(countLines(''), 0);
  assert.equal(countLines('one line, no trailing newline'), 1);
  assert.equal(countLines('one line\n'), 1);
  assert.equal(countLines('two\nlines\n'), 2);
  assert.equal(countLines(linesOfText(CEILING)), CEILING);
});

test('checkSkillText: at the ceiling is fine, one line over is not', () => {
  const atCeiling = checkSkillText(linesOfText(CEILING), 'synthetic-at-ceiling');
  assert.equal(atCeiling.lines, CEILING);
  assert.equal(atCeiling.over, false, `a file at exactly the ceiling (${CEILING}) must not be OVER`);

  const overCeiling = checkSkillText(linesOfText(CEILING + 1), 'synthetic-over-ceiling');
  assert.equal(overCeiling.lines, CEILING + 1);
  assert.equal(overCeiling.over, true, `a file one line past the ceiling (${CEILING + 1}) must be OVER`);
});

test('checkSkill: a skill with no SKILL.md reports an error, not a false pass', () => {
  const result = checkSkill('this-skill-id-does-not-exist-855');
  assert.equal(result.error, 'SKILL.md not found');
  assert.equal(result.over, undefined, 'a missing file must not report a length verdict at all');
});

test('NEW-SKILL CASE (#855 finding 3): the check fires on a fresh English file with zero mirrors', () => {
  // The defect #855 exists to close: a skill that has never been scaffolded has no mirror for
  // ANY prior gate to catch an overrun on, so the only protection available is exactly this
  // check running on the English file alone, before a single mirror is created. Simulated here
  // rather than creating a real skills/ directory, which would pollute the corpus this suite
  // must not mutate.
  const freshSkillOverCeiling = checkSkillText(linesOfText(CEILING + 1), 'brand-new-skill-no-mirrors-yet');
  assert.equal(
    freshSkillOverCeiling.over,
    true,
    'a brand-new skill with no mirrors must still be caught before mirrors are ever scaffolded',
  );
});

test('INFORMATIONAL: every real skill in the corpus is at or under the derived ceiling today', () => {
  // Not the mutant-provable arm (the two tests above are) -- this one describes the corpus's
  // current state so a future violation is loud in this suite's own output, not just in CI.
  const ids = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => e.name)
    .filter((name) => existsSync(resolve(SKILLS_DIR, name, 'SKILL.md')));
  assert.ok(ids.length > 300, `expected hundreds of skills, found ${ids.length} — is SKILLS_DIR resolved correctly?`);

  const over = ids
    .map((id) => checkSkillText(readFileSync(resolve(SKILLS_DIR, id, 'SKILL.md'), 'utf8'), id))
    .filter((r) => r.over);
  assert.deepEqual(
    over.map((r) => `${r.skill} (${r.lines} > ${r.ceiling})`),
    [],
    'one or more English skills already exceed the derived ceiling — extract to references/EXAMPLES.md, do not allowlist',
  );
});
