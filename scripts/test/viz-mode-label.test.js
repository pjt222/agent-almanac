/**
 * The `bind_modes` annotation must name as many modes as `app.js` actually binds (#639).
 *
 * A PUT annotation is a comment, so nothing derives it and nothing regenerates it — putior
 * reads the comment and copies its label verbatim into `viz/public/data/workflow.mmd`,
 * which the published workflow page fetches at runtime. A stale label is therefore a wrong
 * statement on a published page, produced faithfully by the pipeline.
 *
 * `npm run check:diagram-nodes` is green on exactly this defect **by construction**, and
 * its own header says so with this example: it compares node IDS in both directions and
 * nothing else. `bind_modes` exists on both sides; only its label was wrong. Labels,
 * `node_type`, edges and source-side staleness are all outside what it can see. So the
 * gate that catches this has to be a different gate, and this is it.
 *
 * ## What it asserts, and the limit
 *
 * Two things. The COUNT of modes named in the label against the count bound — that is the
 * defect class that occurred, a mode added to `modes` without extending the label, which
 * is how Campfire went missing from the moment it was added.
 *
 * And CONTAINMENT: every label entry, lowercased, must be a substring of some bound key.
 * The first version asserted only the count, on the argument that a name check needs a
 * mapping table nobody maintains. That argument was wrong for this corpus and a reviewer
 * showed it: `2d`, `3d`, `hive`, `chord` match exactly, and `flow` is a substring of
 * `workflow`. No table required. What the count alone missed is a mode REPLACEMENT —
 * rename `hive` to `sunburst` in both maps and leave the label, and 6 = 6 stays green
 * while the published page names a mode that no longer exists AND omits one that does.
 * That is the full defect class, not the "smaller and quieter" drift the first version
 * claimed it was.
 *
 * Containment runs BOTH ways, and the second direction closes two residuals a forward
 * check alone leaves — both raised in review, both typo-shaped rather than
 * refactor-shaped, and both green under count-plus-forward-containment:
 *
 *   (2D/3D/Hive/Chord/Flow/Flow)      a duplicated entry. Six entries, "flow" is a
 *                                     substring of `workflow` twice, and Campfire is
 *                                     omitted — the founding defect, re-entering as a
 *                                     copy-paste artifact.
 *   (2D/3D/Hive/Chord/Fire/Campfire)  "fire" and "campfire" both match `campfire`, and
 *                                     Flow is omitted. Not fiction: the repo uses both
 *                                     "Fire" and "Campfire" in sibling comments, for
 *                                     different referents.
 *
 * Reverse containment kills both, and would independently have caught the original
 * omission. The three assertions catch disjoint classes: the #639 defect (five entries,
 * six keys) fails count alone; a swap fails forward containment alone; a padded label
 * fails count alone; the two above fail reverse containment alone.
 *
 * Containment is still a heuristic, not a proof — "Flow" would also match a hypothetical
 * `flowchart` key. Its failure direction on a divergently-named future mode is loud red,
 * which is the recoverable one.
 *
 * `ci-scripts.yml` carries no `paths:` filter (#641), so this test runs on a `viz/`-only
 * PR — which is the whole reason it can live in `scripts/test/` at all.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP_JS = resolve(REPO_ROOT, 'viz', 'js', 'app.js');

/** Modes bound at runtime, from the `modes` map `switchMode`/`loadMode` consult. */
export function boundModes(source) {
  const match = source.match(/^const modes = \{(.*?)\};$/m);
  if (!match) return null;
  return match[1]
    .split(',')
    .map((pair) => pair.split(':')[0].trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/** Modes named in the `bind_modes` PUT label, from its parenthesised slash-list. */
export function labelledModes(source) {
  const annotation = source.match(/put id:"bind_modes",\s*label:"([^"]*)"/);
  if (!annotation) return null;
  const list = annotation[1].match(/\(([^)]*)\)/);
  if (!list) return null;
  return list[1].split('/').map((name) => name.trim()).filter(Boolean);
}

test('the bind_modes label names as many modes as app.js binds', () => {
  const source = readFileSync(APP_JS, 'utf8');

  const bound = boundModes(source);
  const labelled = labelledModes(source);

  assert.ok(bound, 'the `const modes = { … }` map must be findable — this test is its only reader');
  assert.ok(labelled, 'the bind_modes annotation must carry a parenthesised mode list');
  for (const name of labelled) {
    assert.ok(
      bound.some((key) => key.toLowerCase().includes(name.toLowerCase())),
      `the label names "${name}", which is not a substring of any bound mode key `
      + `(${bound.join(', ')}). A mode replacement keeps the COUNT equal while the published `
      + `page names a mode that no longer exists (#639).`,
    );
  }
  for (const key of bound) {
    assert.ok(
      labelled.some((name) => key.toLowerCase().includes(name.toLowerCase())),
      `mode "${key}" is bound but nothing in the label (${labelled.join('/')}) names it.`,
    );
  }
  assert.equal(
    labelled.length,
    bound.length,
    `the label names ${labelled.length} modes (${labelled.join('/')}) but ${bound.length} are `
    + `bound (${bound.join(', ')}). The label is copied verbatim into workflow.mmd and served `
    + `to readers, so this is a wrong statement on a published page — and check:diagram-nodes `
    + `cannot see it, because the node IDs agree and only the label differs (#639).`,
  );
});

test('a mode REPLACEMENT is caught, though the counts still agree', () => {
  // The case count-alone misses, and the reason containment was added. Six for six, and
  // the label names a mode that does not exist while omitting one that does.
  const swapped = readFileSync(APP_JS, 'utf8')
    .replace('hive: null', 'sunburst: null');

  const bound = boundModes(swapped);
  const labelled = labelledModes(swapped);

  assert.equal(labelled.length, bound.length, 'precondition: the counts still agree');
  assert.ok(
    !labelled.every((name) => bound.some((key) => key.toLowerCase().includes(name.toLowerCase()))),
    'containment must reject a label entry naming a mode that is no longer bound',
  );
});

test('the parsers fail loudly rather than returning a passing shape', () => {
  // Both helpers return null when they cannot find their subject, so a refactor that moves
  // the modes map or the annotation makes the test go RED rather than silently comparing
  // two empty lists — the vacuous green this repo keeps paying for elsewhere (#486).
  assert.equal(boundModes('nothing here'), null);
  assert.equal(labelledModes('nothing here'), null);
  assert.equal(labelledModes('// put id:"bind_modes", label:"No list here"'), null,
    'a label with no parenthesised list is unparseable, not empty');
  assert.deepEqual(boundModes("const modes = { '2d': a, hive: null };"), ['2d', 'hive']);
  assert.deepEqual(labelledModes('// put id:"bind_modes", label:"Bind mode switching (A/B/C)"'),
    ['A', 'B', 'C']);
});
