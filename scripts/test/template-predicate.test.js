/**
 * Unit tests for the template predicate (#672) and the JS/shell pair it creates.
 *
 * #672 counted 54 hand-rolled `_template` exclusions across 14 files, in three spellings, with
 * no shared definition — the count re-derived on this branch under the issue's own ruler was
 * 115 occurrences. The predicate under test replaces the ones that ask "is this scaffolding".
 *
 * Two properties are load-bearing and neither is obvious from reading the function:
 *
 * 1. It is ROOT-ANCHORED. A depth-agnostic test is the version `skills-inventory.js` shipped,
 *    measured wrong against npm, and reverted — `skills/<id>/_template/helper.py` SHIPS, and
 *    `skills-inventory.test.js` pins that with a live fixture. The nested case is asserted
 *    here too so the two files cannot drift apart on it.
 * 2. Its member set is EXACT, and a second copy of that set lives in
 *    `scripts/lib/template-names.sh` because a bash script cannot import an ES module. That
 *    duplication is the very shape #672 is about, one level up, so it is gated below rather
 *    than trusted.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isTemplate,
  isTemplateSegment,
  TEMPLATE_SEGMENTS,
  templateSpellingDrift,
  isExcludedId,
} from '../lib/content-paths.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const trackedPaths = () => execFileSync('git', ['ls-files'], {
  cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28,
}).split('\n').filter(Boolean);

test('every template spelling on disk is recognised', () => {
  for (const path of [
    'agents/_template.md',
    'guides/_template.md',
    'teams/_template.md',
    'tests/_template.md',
    'skills/_template/SKILL.md',
    'workflows/_template.mjs',
  ]) {
    assert.equal(isTemplate(path), true, path);
  }
});

test('a NESTED _template is not a template — it ships', () => {
  // The direction `skills-inventory.js` measured wrong and reverted. npm's `files` negations
  // are root-anchored, so `!skills/_template/` does not exclude this path and the file is in
  // the published tarball. A predicate that matched it here would put the two modules back
  // into disagreement, which is what #672 exists to prevent.
  assert.equal(isTemplate('skills/alpha/_template/helper.py'), false);
  assert.equal(isTemplate('skills/alpha/_template/'), false);
});

test('substring lookalikes are not templates', () => {
  // `includes('_template')` was the spelling at three call sites before #672. Each of these
  // would have been excluded by it, silently, from a gate or a published count.
  assert.equal(isTemplate('guides/my_template_notes.md'), false);
  assert.equal(isTemplate('agents/_templates.md'), false);
  assert.equal(isTemplate('skills/_template_backup/SKILL.md'), false);
});

test('a mirror anchors like its English source', () => {
  // `check-content-style.js` lists `i18n/` among its content globs and excluded mirror
  // templates via `includes('/_template')`. Returning false here would have quietly started
  // scanning them. Zero are tracked today, so no fixture in this repo would have caught it.
  assert.equal(isTemplate('i18n/de/skills/_template/SKILL.md'), true);
  assert.equal(isTemplate('i18n/zh-CN/agents/_template.md'), true);
  assert.equal(isTemplate('i18n/de/skills/create-r-package/SKILL.md'), false);
});

test('a `./`-prefixed path anchors like a bare one', () => {
  // Without normalisation the anchored segment is the TREE name, so this returns false --
  // a silent wrong answer rather than a throw. No caller passes this shape today.
  assert.equal(isTemplate('./agents/_template.md'), true);
  assert.equal(isTemplate('./skills/_template/SKILL.md'), true);
  assert.equal(isTemplate('./i18n/de/agents/_template.md'), true);
  assert.equal(isTemplate('./agents/real-agent.md'), false);
});

test('degenerate inputs do not throw and do not match', () => {
  for (const path of ['', 'i18n', '_template.md', 'skills', '/', 'skills/']) {
    assert.equal(isTemplate(path), false, JSON.stringify(path));
  }
});

test('isTemplate is a STRICT SUBSET of isExcludedId, and the two are not interchangeable', () => {
  // The distinction three modules now depend on. `isExcludedId` also covers `README` and every
  // other `_`-prefixed name; `isTemplate` covers scaffolding alone. Collapsing them would make
  // `_registry.yml` a "template" and `_experimental/` non-content.
  for (const segment of TEMPLATE_SEGMENTS) {
    assert.equal(isExcludedId(segment), true, `${segment} must also be excluded as an id`);
  }
  for (const segment of ['_registry.yml', 'README.md', 'README', '_experimental']) {
    assert.equal(isTemplateSegment(segment), false, `${segment} is not a template`);
    assert.equal(isExcludedId(segment), true, `${segment} is still not content`);
  }
});

test('the drift check reports an UNSEEN spelling', () => {
  const { uncovered, dead } = templateSpellingDrift([
    'agents/_template.md', 'skills/_template/SKILL.md', 'workflows/_template.mjs',
    'guides/_template.yml',
  ]);
  assert.deepEqual(uncovered, ['guides/_template.yml']);
  assert.deepEqual(dead, []);
});

test('the drift check reports a DEAD member', () => {
  // The direction an `observed ⊆ declared` check is blind to. A set that keeps naming a
  // spelling nobody uses is how the list stays green describing a corpus that has moved on,
  // and it is indistinguishable from coverage unless asserted.
  const { uncovered, dead } = templateSpellingDrift(['agents/_template.md']);
  assert.deepEqual(uncovered, []);
  assert.deepEqual(dead, ['_template', '_template.mjs']);
});

test('the drift check ignores a nested _template rather than calling it uncovered', () => {
  // Caught during development: scanning every segment reported the legitimately-nested,
  // legitimately-shipped `skills/alpha/_template/helper.py` as an uncovered spelling, so the
  // check would have gone red demanding the predicate absorb a path it is right to reject.
  const { uncovered } = templateSpellingDrift([
    'agents/_template.md', 'skills/_template/SKILL.md', 'workflows/_template.mjs',
    'skills/alpha/_template/helper.py',
  ]);
  assert.deepEqual(uncovered, []);
});

test('a LOOKALIKE at the anchored position is not reported as an uncovered spelling', () => {
  // Two reviewers found this independently. Discovery was `startsWith('_template')`, which is
  // true of both names below — so tracking either turned THE CORPUS red reporting it
  // `uncovered`, demanding the predicate absorb a path the lookalike test above forbids it to
  // absorb. A deadlock with no waiver: the only exit was renaming the file.
  const { uncovered, dead } = templateSpellingDrift([
    'agents/_template.md', 'skills/_template/SKILL.md', 'workflows/_template.mjs',
    'agents/_templates.md',            // plural
    'skills/_template_backup/SKILL.md', // suffixed
  ]);
  assert.deepEqual(uncovered, []);
  assert.deepEqual(dead, []);
});

test('a genuinely new spelling is STILL reported after that tightening', () => {
  // The other direction, and the reason the ruler is a pattern rather than the exact set: a
  // discovery rule tightened until it only matches known members can never find anything.
  for (const candidate of ['guides/_template.yml', 'guides/_template.json', 'guides/_template.txt']) {
    const { uncovered } = templateSpellingDrift(['agents/_template.md', 'skills/_template/SKILL.md',
      'workflows/_template.mjs', candidate]);
    assert.deepEqual(uncovered, [candidate], candidate);
  }
});

test('THE CORPUS: no template spelling on disk escapes the predicate, and no member is dead', () => {
  // #672 AC4, against the real tree rather than a fixture. Add `guides/_template.yml` and this
  // fails naming it; delete the last `.mjs` template and it fails naming the dead member.
  const { uncovered, dead } = templateSpellingDrift(trackedPaths());
  assert.deepEqual(uncovered, [], 'a _template* spelling the predicate does not cover');
  assert.deepEqual(dead, [], 'a declared spelling no tracked path uses');
});

/**
 * The script both helpers below source, as a LITERAL relative path.
 *
 * Not `resolve(ROOT, …)`. CodeQL flagged the first version — "Shell command built from
 * environment values" — because the path derived from `import.meta.url` reached a `bash -c`
 * invocation. It was already passed as a positional argument rather than interpolated, so it
 * was not injectable, but naming the script literally and pointing `cwd` at the repo removes
 * the pattern rather than arguing with it, and reads better besides.
 */
const NAMES_SH = 'scripts/lib/template-names.sh';

/** The shell's TEMPLATE_NAMES as bash itself sees it — sourced, never parsed. */
function shellArray() {
  const out = execFileSync('bash', [
    '-c', `set -euo pipefail; source ${NAMES_SH}; printf '%s\\n' "\${TEMPLATE_NAMES[@]}"`,
  ], { cwd: ROOT, encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

/** What the shell's own `is_template` says about one name. */
function shellSaysTemplate(name) {
  const out = execFileSync('bash', [
    '-c', `source ${NAMES_SH}; if is_template "$1"; then echo yes; else echo no; fi`, '_', name,
  ], { cwd: ROOT, encoding: 'utf8' }).trim();
  if (out !== 'yes' && out !== 'no') throw new Error(`unreadable shell verdict: ${JSON.stringify(out)}`);
  return out === 'yes';
}

test('THE PAIR: the shell list matches TEMPLATE_SEGMENTS exactly', () => {
  // `scripts/lib/template-names.sh` cannot import this module, so the set exists twice. Gated
  // in BOTH directions: a name added to either side alone fails here naming the other.
  //
  // The array is read by SOURCING the file, not by parsing it. A regex over
  // `TEMPLATE_NAMES=( ... )` was the first version and it had the bug this whole PR is about:
  // it matched the FIRST assignment only, so appending
  //
  //     TEMPLATE_NAMES+=('_template.yml')
  //
  // on any later line left the shell excluding a name the JS did not, with all twelve tests
  // green. Measured, not imagined -- the append was planted and the suite passed. Sourcing is
  // immune to that and to reformatting, quote style, and conditional assignment, because it
  // observes exactly what `validate-integrity.sh` observes.
  const names = shellArray();
  assert.ok(names.length > 0, 'sourced an empty TEMPLATE_NAMES — the read, not the corpus, is broken');
  assert.deepEqual([...names].sort(), [...TEMPLATE_SEGMENTS].sort());
});

test('the shell helper agrees with the JS predicate over the UNION of both sets', () => {
  // Reading the array proves the LISTS match. This proves the shell FUNCTION reads them, which
  // a typo in `is_template` itself would otherwise leave green.
  //
  // Probing the UNION rather than `TEMPLATE_SEGMENTS` matters: a name present only on the
  // shell side would never be probed by a JS-side list, so the divergence it represents would
  // go unmeasured by the very test meant to catch it.
  const probe = [
    ...new Set([...TEMPLATE_SEGMENTS, ...shellArray()]),
    '_templates.md', 'README.md', '_registry.yml', 'my_template_notes.md', '_template.yml', '',
  ];
  for (const name of probe) {
    assert.equal(
      shellSaysTemplate(name),
      isTemplateSegment(name),
      `is_template(${JSON.stringify(name)}) disagrees with isTemplateSegment`,
    );
  }
});
