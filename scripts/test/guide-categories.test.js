/**
 * Unit tests for `scripts/lib/guide-categories.js` (#644).
 *
 * The defect these cover: `generate-readmes.js` iterated a hardcoded four-category
 * literal, written twice, over a registry carrying five — so the one `investigation`
 * guide rendered in no generated index while every gate stayed green.
 *
 * The generator itself still cannot be imported (it reads the registries and runs its
 * MANAGED loop at module scope, so an `import()` writes all nine committed files), which
 * is the same constraint that produced `readme-sections.test.js`. Extracting the ordering
 * rule into a pure function is what makes it testable at all.
 *
 * Coverage here is the ordering rule only. That a rendered index actually contains the
 * heading is a different claim about a different artifact, and it belongs to
 * `validate-integrity.sh` check A11 — a unit test over this module cannot catch both call
 * sites being wrong together, which is exactly how #644 shipped.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guideCategoryOrder, guideCategoryLabel, guideCategoryNames } from '../lib/guide-categories.js';

const block = (...ids) => Object.fromEntries(ids.map((id) => [id, { description: id }]));
const guidesIn = (...categories) => categories.map((category, i) => ({ id: `g${i}`, category }));

test('declared categories keep the registry block order', () => {
  const order = guideCategoryOrder(
    block('workflow', 'infrastructure', 'reference', 'design'),
    guidesIn('design', 'workflow', 'workflow')
  );
  assert.deepEqual(order, ['workflow', 'infrastructure', 'reference', 'design']);
});

test('a declared category with no guides is still ordered (the caller skips empties)', () => {
  // generateGuidesSection/generateGuidesReadme do `if (catGuides.length === 0) continue`,
  // so emptiness is the caller's business. Dropping it here would move that decision.
  const order = guideCategoryOrder(block('workflow', 'design'), guidesIn('workflow'));
  assert.deepEqual(order, ['workflow', 'design']);
});

test('#644 regression: the fifth declared category is not truncated away', () => {
  const order = guideCategoryOrder(
    block('workflow', 'infrastructure', 'reference', 'design', 'investigation'),
    guidesIn('investigation')
  );
  assert.ok(
    order.includes('investigation'),
    'investigation must be iterated, or its guide renders in no index'
  );
});

test('a category a guide uses but the block never declares is appended, not dropped', () => {
  // The likelier drift than #644 itself: a typo, or a category added to a guide and
  // forgotten in the block. Deriving order from the block alone loses that guide silently.
  const order = guideCategoryOrder(block('workflow', 'design'), guidesIn('workflow', 'investigatoin'));
  assert.deepEqual(order, ['workflow', 'design', 'investigatoin']);
});

test('undeclared categories are appended after every declared one, in first-use order', () => {
  const order = guideCategoryOrder(block('workflow'), guidesIn('zebra', 'workflow', 'alpha'));
  assert.deepEqual(order, ['workflow', 'zebra', 'alpha']);
});

test('a repeated undeclared category is emitted once', () => {
  const order = guideCategoryOrder(block('workflow'), guidesIn('extra', 'extra', 'extra'));
  assert.deepEqual(order, ['workflow', 'extra']);
  assert.equal(new Set(order).size, order.length);
});

test('a null entry in the guides list does not throw', () => {
  // A YAML `- ` with nothing after it parses to null. Without the `guide &&` guard in
  // guideCategoryOrder this throws and takes the whole generator down. Measured: deleting
  // that guard left all other cases in this file green, so this is the test that kills it.
  assert.deepEqual(guideCategoryOrder(block('workflow'), [null, { id: 'a', category: 'workflow' }]), ['workflow']);
  assert.deepEqual(guideCategoryOrder(block('workflow'), [undefined]), ['workflow']);
});

test('guides with a missing or empty category contribute nothing', () => {
  const order = guideCategoryOrder(block('workflow'), [
    { id: 'a' }, { id: 'b', category: '' }, { id: 'c', category: null }, { id: 'd', category: 'workflow' },
  ]);
  assert.deepEqual(order, ['workflow']);
});

test('absent registry sections do not throw', () => {
  assert.deepEqual(guideCategoryOrder(undefined, undefined), []);
  assert.deepEqual(guideCategoryOrder({}, []), []);
  assert.deepEqual(guideCategoryOrder(undefined, guidesIn('workflow')), ['workflow']);
});

test('label capitalises the first letter and leaves the rest alone', () => {
  assert.equal(guideCategoryLabel('workflow'), 'Workflow');
  assert.equal(guideCategoryLabel('investigation'), 'Investigation');
  // The four labels the replaced `categoryLabels` map held, reproduced by the rule.
  assert.deepEqual(
    ['workflow', 'infrastructure', 'reference', 'design'].map(guideCategoryLabel),
    ['Workflow', 'Infrastructure', 'Reference', 'Design']
  );
});

test('label does not title-case a hyphenated id — documented, not accidental', () => {
  // No category on disk has a hyphen; if one is added, this is the decision to revisit.
  assert.equal(guideCategoryLabel('edge-computing'), 'Edge-computing');
});

// ── guideCategoryNames (#647) ───────────────────────────────────────────────

test('names render as an English list in registry order', () => {
  // The literal it replaces said "workflow, infrastructure, and reference" — correct when
  // there were three categories and quietly wrong from the day a fourth landed.
  assert.equal(
    guideCategoryNames({ workflow: 1, infrastructure: 1, reference: 1, design: 1, investigation: 1 }, []),
    'workflow, infrastructure, reference, design, and investigation'
  );
});

test('an undeclared category reaches the prose too', () => {
  // Same rule as the ordering: a category that exists only on a guide is named rather than
  // silently dropped, so the sentence cannot understate the corpus.
  assert.equal(
    guideCategoryNames({ workflow: 1 }, guidesIn('workflow', 'investigation')),
    'workflow and investigation'
  );
});

test('one and zero categories do not render a dangling conjunction', () => {
  assert.equal(guideCategoryNames({ workflow: 1 }, []), 'the workflow category');
  assert.equal(guideCategoryNames({}, []), 'no categories');
});

test('two categories join with "and" and no comma', () => {
  assert.equal(guideCategoryNames({ workflow: 1, design: 1 }, []), 'workflow and design');
});
