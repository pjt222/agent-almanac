/**
 * content-types.js — the single source of truth for the four content trees (#568).
 *
 * The list `['skills', 'agents', 'teams', 'guides']` was a hardcoded literal in three places
 * that must agree: `TREES` in `lib/fences.js` (which drives the git pathspec and every
 * `coverage.*` section), `contentTypes` in `generate-readmes.js` (the README table's columns),
 * and `CONTENT_TYPES` in `check-readme-translation-parity.js` (integrity check B13's per-type
 * comparison).
 *
 * The drift is quiet rather than loud. Add a fifth tree and `coverage.total` starts including
 * it while the table gains no column and B13 compares only the four it knows — totals still
 * add up, so nothing *lies* and nothing goes red. A gate that stays green while ignoring a
 * whole content tree is the failure this repo keeps rediscovering.
 *
 * ## Not every content type — the four with i18n mirrors
 *
 * The repo has FIVE content types; `workflows` is the fifth and is deliberately absent here,
 * because it has no `i18n/` mirror and no column in the README translation table. Every
 * consumer of this module is translation-adjacent, but NOT all of it is translation machinery:
 * `check-banned-invocations.js` is a content-integrity gate that happens to walk the mirrors
 * too. That matters in the REMOVAL direction — drop a tree here because its i18n mirror goes
 * away, and that gate silently stops scanning the tree's ENGLISH markdown as well, with
 * nothing red anywhere. Adding is safe; removing must audit the non-translation consumers.
 * Anyone arriving by the name looking for "all content types" wants the registries, not this.
 *
 * ## Still not the source of EVERY per-type surface
 *
 * A fifth entry added here does not flow through to the positional row schema in
 * `check-readme-translation-parity.js` — the nine-cell width check, the destructure, and the
 * `cells = { skills, agents, teams, guides }` literal are hand-written and would not gain a
 * column. Traced end to end, each of those fails CLOSED (a missing `coverage.<new>` key
 * throws, exit 2; the width check throws, exit 2), so the drift is loud rather than silent —
 * which is the property that matters. But this module is the source of the LIST, not of the
 * table's shape, and saying otherwise would be the overstatement this repo keeps paying for.
 *
 * ## ZERO IMPORTS, BY CONSTRUCTION — do not add one
 *
 * `check-readme-translation-parity.js` is RUN by integrity check B13 as a child process
 * (`validate-integrity.sh`: `node scripts/check-readme-translation-parity.js`), and
 * `.github/workflows/validate-integrity.yml` runs that job with `setup-node` but deliberately
 * NO `npm ci` (the constraint A8 documents). So it must reach nothing outside node builtins,
 * *transitively*. A single `import` added here would break B13 in CI only — green on every
 * developer machine, where `node_modules` exists — which is the worst shape a break can have.
 *
 * `lib/fences.js` is itself dependency-free today and was the obvious host, but it is a
 * 293-line module with six consumers and git/spawn helpers; making B13's CI-only constraint
 * depend on it means the day someone adds a YAML import there, B13 dies at module resolution
 * and nothing local notices. A leaf module cannot acquire that liability.
 *
 * `scripts/test/dependency-free.test.js` enforces this, so the property is checkable rather
 * than merely asserted here.
 */

/**
 * Frozen, because consolidating turned four private copies into one SHARED array: `TREES` in
 * fences.js is this very object by identity, not a copy of it. Before, a consumer calling
 * `.sort()` or `.push()` corrupted only itself; now it would corrupt the git pathspec, the
 * README columns and B13's comparison at once, from anywhere in the process. ESM is strict
 * mode, so an in-place mutation now throws at its call site instead of silently reordering
 * someone else's output.
 */
export const CONTENT_TYPES = Object.freeze(['skills', 'agents', 'teams', 'guides']);
