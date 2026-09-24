/**
 * guide-categories.js — the display order and labels for guide categories (#644).
 *
 * `generate-readmes.js` rendered its guide indexes from a hardcoded
 * `['workflow', 'infrastructure', 'reference', 'design']`, written twice, while
 * `guides/_registry.yml` and `CLAUDE.md` both carry five categories. Each literal was
 * followed by `for (const catId of categoryOrder)`, so a guide in the fifth category
 * — `investigation` — was iterated over by nothing and appeared in no generated index.
 *
 * The failure is silent in the way this repo keeps rediscovering. `check-readmes`
 * cannot see it *by construction*: it regenerates with the same literal and compares
 * the result to itself, so the generator and its check agree perfectly about a guide
 * neither of them renders. `validate-integrity.sh` passed. The guide was reachable
 * only by knowing its filename.
 *
 * ## Order is a union, not a lookup
 *
 * `categoryOrder` takes the declared block's key order first — that is the intended
 * display order, and YAML preserves it — then appends any category a guide actually
 * uses that the block never declared. Deriving from the block alone would fix the
 * `investigation` case and leave the more likely one open: a typo in a guide's
 * `category:` field, or a category someone adds to a guide but forgets to declare,
 * drops that guide from every index with every gate still green. Appending is
 * deliberately not de-duplicating the *declared* side — an empty declared category
 * renders nothing because the caller skips empty groups, which is correct.
 *
 * ## What this module does not carry
 *
 * The gate. A shared helper means the two indexes can no longer disagree with each
 * other, but nothing here compares the rendered output to the registry — both call
 * sites could still be wrong together, which is exactly the shape that shipped. That
 * assertion lives in `scripts/validate-integrity.sh` check A11, which reads the
 * guides' own `category:` fields and requires each to appear as a heading in
 * `guides/README.md`.
 */

/**
 * Display order for guide categories: declared order first, then any undeclared
 * category some guide actually uses.
 *
 * @param {Object} categoriesBlock - the registry's `categories:` mapping (may be undefined)
 * @param {Array<{category?: string}>} guides - the registry's `guides:` list (may be undefined)
 * @returns {string[]} category ids in display order, no duplicates
 */
export function guideCategoryOrder(categoriesBlock, guides) {
  const declared = Object.keys(categoriesBlock || {});
  const seen = new Set(declared);
  const undeclared = [];
  for (const guide of guides || []) {
    const category = guide && guide.category;
    if (!category || seen.has(category)) continue;
    seen.add(category);
    undeclared.push(category);
  }
  return [...declared, ...undeclared];
}

/**
 * Heading label for a category id.
 *
 * Capitalises the first letter only, which is what `generateGuidesReadme` already did
 * inline; the replaced `categoryLabels` map in `generateGuidesSection` held the same
 * four strings that rule produces. A hyphenated id would render as `Edge-computing`
 * rather than `Edge Computing` — no category on disk has a hyphen, so this changes no
 * current output, and title-casing is left for whoever first adds one.
 *
 * @param {string} catId
 * @returns {string}
 */
/**
 * Render the category names as an English list: "a, b, c, d and e".
 *
 * Exists so prose can name the categories without hardcoding them. The line it replaces said
 * "workflow, infrastructure, and reference" — true when there were three of them, and quietly
 * false from the day `design` was added (#647).
 *
 * Order and membership come from `guideCategoryOrder`, so an undeclared category appearing
 * only on a guide is named here too rather than silently dropped.
 */
export function guideCategoryNames(categoriesBlock, guides) {
  const order = guideCategoryOrder(categoriesBlock, guides);
  if (order.length === 0) return 'no categories';
  if (order.length === 1) return `the ${order[0]} category`;
  if (order.length === 2) return `${order[0]} and ${order[1]}`;
  // Oxford comma, matching the line this replaced ("workflow, infrastructure, and reference")
  // and the rest of the generated prose. Dropped at two items, where it would be wrong.
  return `${order.slice(0, -1).join(', ')}, and ${order[order.length - 1]}`;
}

export function guideCategoryLabel(catId) {
  return catId[0].toUpperCase() + catId.slice(1);
}
