/**
 * Tests for `auditSkillText()` in `scripts/audit-skill-sections.js`.
 *
 * Two wrong claims were made about this module before the right one, and the sequence is
 * worth keeping because it is entirely about which fixture was used.
 *
 *   1. "A CRLF copy would report every required section missing." **False.** `sectionBody`
 *      compares `line.trim()`, and `\r` is a LineTerminator that `trim()` strips.
 *   2. "So the site was safe all along, and the surviving mutant is correct." **Also false**,
 *      and only looked true because the first fixture here contained no fenced block.
 *
 * The real defect is one function down. `fenceMask` matches an opener with
 * `/^ {0,3}(`{3,}|~{3,})(.*)$/` — the exact shape `lib/fences.js` documents as CRLF-fragile:
 * `.` does not match `\r` and an unanchored `$` asserts end of input, so ```` ```markdown\r ````
 * matches nothing, no fence is ever detected, and the mask stays uniformly `true`. Skills
 * such as `create-skill` embed a ```` ```markdown ```` fence containing a literal
 * `## Common Pitfalls` template, so with a blind mask the audit locks onto the template
 * instead of the real section and counts the wrong bullets — the precise failure
 * `fenceMask`'s own docstring exists to prevent.
 *
 * `FENCED_TEMPLATE_SKILL` below is that fixture. It is what makes the mutant reverting
 * `toLines(raw)` to `raw.split('\n')` die instead of survive.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditSkillText, countPitfalls, REQUIRED_SECTIONS } from '../audit-skill-sections.js';

const SKILL = [
  '---',
  'name: demo-skill',
  'description: A demo',
  'metadata:',
  '  version: "1.2.0"',
  '---',
  '',
  '# Demo Skill',
  '',
  '## When to Use',
  '',
  'When demonstrating.',
  '',
  '## Inputs',
  '',
  '- **Required**: nothing',
  '',
  '## Procedure',
  '',
  '### Step 1: Do it',
  '',
  'Do the thing.',
  '',
  '## Validation',
  '',
  '- [ ] It worked',
  '',
  '## Common Pitfalls',
  '',
  '- **First**: one way it goes wrong',
  '- **Second**: another way',
  '- **Third**: a third way',
  '',
  '## Related Skills',
  '',
  '- `other-skill` — related',
  '',
].join('\n');

/**
 * A skill that documents skill-authoring, so it carries a fenced template containing a
 * literal `## Common Pitfalls` with a different number of bullets than the real section.
 * `create-skill` and `evolve-skill` are both shaped like this.
 */
const FENCED_TEMPLATE_SKILL = SKILL.replace(
  '## Common Pitfalls\n',
  [
    '## Procedure Template',
    '',
    'Copy this into the new skill:',
    '',
    '```markdown',
    '## Common Pitfalls',
    '',
    '- **Template pitfall A**: replace this',
    '- **Template pitfall B**: and this',
    '- **Template pitfall C**: and this',
    '- **Template pitfall D**: and this',
    '- **Template pitfall E**: and this',
    '```',
    '',
    '## Common Pitfalls',
    '',
  ].join('\n'),
);

test('a well-formed skill reports no missing sections', () => {
  const result = auditSkillText(SKILL, 'demo-skill');
  assert.deepEqual(result.missing, []);
  assert.equal(result.pitfalls, 3);
  assert.equal(result.version, '1.2.0');
});

test('a CRLF copy audits identically (#532)', () => {
  // True of both implementations on a fence-free file — see the header. Kept because it pins
  // behaviour rather than mechanism, and because it is the half that reads as obvious.
  const crlf = SKILL.replace(/\n/g, '\r\n');
  const result = auditSkillText(crlf, 'demo-skill');
  assert.deepEqual(result.missing, [], 'a carriage return must not empty the section list');
  assert.deepEqual(result, auditSkillText(SKILL, 'demo-skill'));
});

test('a fenced Common Pitfalls template is not mistaken for the real section', () => {
  // The pre-existing guarantee, restated as a test: fence-blind parsing locks onto the
  // template. Three real bullets follow the real heading; the template has five.
  assert.equal(auditSkillText(FENCED_TEMPLATE_SKILL, 'demo-skill').pitfalls, 3);
});

test('and it is still not mistaken for it under CRLF (#532 — the real defect)', () => {
  // THE test. `fenceMask`'s opener regex is `/^ {0,3}(`{3,}|~{3,})(.*)$/`: `.` does not match
  // `\r` and `$` asserts end of input, so "```markdown\r" matches nothing, no fence is
  // detected, the mask stays all-true, and the audit counts the template's five bullets.
  // Reverting `toLines(raw)` to `raw.split('\n')` fails exactly here.
  const crlf = FENCED_TEMPLATE_SKILL.replace(/\n/g, '\r\n');
  assert.equal(auditSkillText(crlf, 'demo-skill').pitfalls, 3);
  assert.deepEqual(auditSkillText(crlf, 'demo-skill'), auditSkillText(FENCED_TEMPLATE_SKILL, 'demo-skill'));
});

test('a genuinely incomplete skill still reports what is missing', () => {
  // Guards the other direction: the CRLF fix must not make the audit report success for a
  // file that really is missing sections.
  const stripped = SKILL.replace('## Common Pitfalls', '## Something Else');
  const result = auditSkillText(stripped, 'demo-skill');
  assert.deepEqual(result.missing, ['Common Pitfalls']);
  // `null`, not 0 — an absent section is distinguishable from a present but empty one.
  assert.equal(result.pitfalls, null);
  assert.ok(REQUIRED_SECTIONS.includes('Common Pitfalls'));
});

test('pitfalls are counted in both authored list formats, under either line ending', () => {
  // The #382 tail measurement under-counted by 8 skills with a dash-only counter. Exercised
  // through `auditSkillText` because the counter takes `sectionBody`'s structured output,
  // and that is exactly what a stray `\r` would corrupt.
  const numbered = SKILL.replace(
    '- **First**: one way it goes wrong\n- **Second**: another way\n- **Third**: a third way',
    '1. **First**: one way it goes wrong\n2. **Second**: another way',
  );
  assert.equal(auditSkillText(numbered, 'demo-skill').pitfalls, 2);
  assert.equal(auditSkillText(numbered.replace(/\n/g, '\r\n'), 'demo-skill').pitfalls, 2);
  assert.equal(typeof countPitfalls, 'function');
});
