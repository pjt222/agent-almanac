/**
 * content-paths.js — repo-relative English content path -> stable `<tree>/<id>` key.
 *
 * Split out of `fences.js` so the shared history walker (#559) can key its blobs without
 * importing `fences.js`, which imports the walker. The cycle would in fact have *worked* —
 * both bindings are hoisted `export function`s used only at call time — but it would have been
 * load-bearing on that fact, and the first top-level `const` either module later needed from
 * the other would have turned it into a `ReferenceError` a long way from the edit that caused
 * it. `fences.js` re-exports `contentKey`, so every existing importer is unchanged.
 */

import { CONTENT_TYPES } from './content-types.js';

/**
 * The exact names a template goes by, one per spelling that exists on disk (#672).
 *
 * ## Why an exact set and not a prefix test
 *
 * `startsWith('_template')` would be shorter and would auto-cover a future `_template.yml`.
 * That is precisely the objection: a predicate that silently absorbs a new spelling cannot be
 * checked, so `templateSpellingDrift` below could never fail, and the fourth acceptance
 * criterion of #672 — "a check fails when a new `_template*` spelling appears that the
 * predicate does not cover" — would be unsatisfiable by construction. An exact set plus a
 * discovery check is the trade the debt ratchet already makes here: enumerate the members,
 * and let the arrival of a new one be an event rather than a silent absorption.
 *
 * Measured on this tree — six paths, three spellings, and note the SIXTH tree:
 *
 *   agents/_template.md          teams/_template.md
 *   guides/_template.md          tests/_template.md      <- not a CONTENT_TYPE
 *   skills/_template/SKILL.md    workflows/_template.mjs
 *
 * Hence tree-agnostic below. Hard-coding `CONTENT_TYPES` would have missed `tests/` and
 * `workflows/`, which is the drift-pair shape this module already carries two warnings about.
 */
export const TEMPLATE_SEGMENTS = Object.freeze(['_template', '_template.md', '_template.mjs']);

/**
 * What a template's name could plausibly be spelled as — the DISCOVERY ruler for
 * `templateSpellingDrift`, never the membership test.
 *
 * Looser than `TEMPLATE_SEGMENTS` on purpose: finding a spelling the exact set has never seen
 * is the whole job. Tighter than `startsWith('_template')`, because that also matches
 * `_templates.md` and `_template_backup` — see `templateSpellingDrift`'s docblock for the
 * deadlock that produced.
 */
const TEMPLATE_SPELLING = /^_template(\.[a-z0-9]+)?$/;

/**
 * Is this single path SEGMENT a template's name?
 *
 * For callers that already hold a bare name — a `readdirSync` entry, a `basename`. Callers
 * holding a path want `isTemplate`, which anchors.
 *
 * @param {string} segment one path segment
 * @returns {boolean}
 */
export function isTemplateSegment(segment) {
  return TEMPLATE_SEGMENTS.includes(segment);
}

/**
 * Is this repo-relative path a template — author scaffolding rather than real content?
 *
 * ROOT-ANCHORED: the template must be the second segment, `<tree>/_template*`. Not a stylistic
 * choice; it is the one direction that was MEASURED wrong. `skills-inventory.js`'s first
 * version skipped any entry named `_template` at any depth, which #672 itself counts as its
 * own 55th hand-rolled site, and it disagreed with npm: the `files` negations are
 * root-anchored gitignore-style patterns, so `skills/<id>/_template/helper.py` WOULD ship.
 * `skills-inventory.test.js` pins that with a fixture built at test time. Note the tense: no
 * nested `_template/` exists on this tree, so this is a fact about npm's matching rules rather
 * than about the corpus, and an earlier wording ("SHIPS", "a live fixture") read as the latter
 * on both counts. A depth-agnostic test here would re-introduce that bug one directory over.
 *
 * Equally not `includes('_template')`, the spelling three call sites used before this: that
 * also matches `guides/my_template_notes.md` and `agents/_templates.md`, neither of which is
 * a template.
 *
 * ## What it deliberately does NOT answer
 *
 * - **Does this ship to npm?** No. That is `isExcludedFromPackage` in `skills-inventory.js`,
 *   derived from `package.json`'s own negations. Its JSDoc records that BOTH hand-rolled
 *   rules — a name test and `isExcludedId` — are wrong against npm, in opposite directions.
 * - **Is this non-content?** No. That is `isExcludedId`, which is `_`-prefix-or-README and so
 *   also covers `_registry.yml` and `README.md`. A template is a strict subset.
 * - **Is this a mirror's template?** YES — `i18n/<locale>/` is stripped first, so
 *   `i18n/de/skills/_template/SKILL.md` is a template. An earlier draft of this returned false
 *   and wrote the limitation up as a principle ("mirrors are not scaffolding"), which is
 *   backwards: the German mirror of a template is a template. It also silently changed
 *   `check-content-style.js`, whose `isContentFile` lists `i18n/` among its globs and has
 *   always excluded mirror templates via `includes('/_template')`. Zero mirror templates are
 *   tracked today, so nothing on this corpus would have caught it.
 *
 * @param {string} relPath repo-relative path, as the tracked-file list prints it
 * @returns {boolean}
 */
export function isTemplate(relPath) {
  return isTemplateSegment(anchoredSegment(relPath));
}

/**
 * The segment a template would occupy in this path, or `undefined`.
 *
 * `<tree>/HERE/...`, with a leading `i18n/<locale>/` stripped so a mirror anchors like its
 * English source. Factored out because `isTemplate` and `templateSpellingDrift` must agree on
 * WHERE to look while disagreeing on WHAT counts — exact set versus prefix. Two copies of
 * "where" is how the pair would come to disagree, which is the whole subject of #672.
 *
 * The locale is matched structurally (any single segment under `i18n/`) rather than against
 * the configured locale list. Importing that list would give this module a dependency, and
 * `content-types.js`'s header records why the modules on the B13 path must reach nothing but
 * node builtins.
 */
function anchoredSegment(relPath) {
  let parts = String(relPath).split('/');
  // A leading `./` would shift every index by one and return a SILENT wrong answer -- the
  // anchored segment would be the tree name, so `./agents/_template.md` reads as not a
  // template. No caller passes that shape today; all four feed it `git ls-files` output or a
  // `readdirSync` entry. It is handled anyway because `fences.js` already carries the lesson
  // in its own margin: "a 'cannot happen' margin is exactly how this module keeps getting
  // bypassed". Repeated `./` is not handled and does not occur.
  if (parts[0] === '.') parts = parts.slice(1);
  if (parts[0] === 'i18n' && parts.length > 2) parts = parts.slice(2);
  return parts.length >= 2 ? parts[1] : undefined;
}

/**
 * Both directions of drift between `TEMPLATE_SEGMENTS` and what is on disk (#672 AC4).
 *
 * Returns `{ uncovered, dead }`. `uncovered` is a `_template*` path the predicate does not
 * match — a new spelling every exclusion site would silently stop excluding. `dead` is a
 * declared member no path uses, which is how a set stays green while describing a corpus that
 * has moved on. Exact-set, never "observed is a subset of declared": a subset check is green
 * when one member is removed and another appears, which is the shape that keeps deletions
 * green forever.
 *
 * Takes the path list rather than reading the filesystem, so the caller supplies the tracked
 * ruler rather than a walk that would descend into `node_modules` and `i18n/`.
 *
 * ## The discovery ruler, and the deadlock it used to create
 *
 * Discovery is `TEMPLATE_SPELLING`, deliberately LOOSER than membership but not merely a
 * prefix. `startsWith('_template')` was the first version and two reviewers independently
 * found the same defect in it: it is also true of `_templates.md` and `_template_backup`.
 * Neither is a template, and the unit tests say so — so the day one was tracked, this check
 * would go red reporting it `uncovered`, i.e. demanding the predicate absorb a path a sibling
 * test forbids it to absorb. No waiver existed; the only exit was renaming the file.
 *
 * `^_template(\.[a-z0-9]+)?$` is the whole of it: the bare name, or the bare name plus one
 * extension. A genuinely new spelling (`_template.yml`) still lands as `uncovered`, which is
 * the entire job; a lookalike is simply not a candidate.
 *
 * ## What it still cannot see, stated rather than left to be found
 *
 * A path with fewer than two segments after normalisation has no anchored position, so a
 * repo-root `_template.md` and a locale-root `i18n/de/_template.md` are invisible here —
 * neither covered nor uncovered. Both are outside every content tree, so neither is scaffolding
 * in the sense any consumer means, and treating them as findings would report drift against
 * files no exclusion site would ever consult. The boundary is recorded because "the check did
 * not fire" and "the check cannot see it" read identically in a green run.
 *
 * @param {string[]} paths every repo-relative tracked path
 * @returns {{uncovered: string[], dead: string[]}}
 */
export function templateSpellingDrift(paths) {
  // Discovery is deliberately LOOSER than membership, and only at the anchored position.
  //
  // Loose, because a prefix is what finds a spelling the exact set has never seen — that is
  // the whole job. Anchored, because a nested `skills/<id>/_template/helper.py` is a
  // deliberate non-match rather than an uncovered one: npm ships it, and
  // `skills-inventory.test.js` pins that it must be counted. Scanning every segment reported
  // it as `uncovered`, so this check would have gone red demanding the predicate absorb a path
  // the predicate is right to reject. Caught by its own test before it ever ran in CI.
  const anchored = paths.filter((p) => TEMPLATE_SPELLING.test(anchoredSegment(p) ?? ''));
  const uncovered = anchored.filter((p) => !isTemplate(p)).sort();
  const used = new Set(anchored.filter((p) => isTemplate(p)).map((p) => anchoredSegment(p)));
  const dead = TEMPLATE_SEGMENTS.filter((s) => !used.has(s));
  return { uncovered, dead };
}

/**
 * Repo-relative English content path -> stable `<tree>/<id>` key, or null when
 * the path is not translatable content.
 *
 * Uses the second-to-last segment for `SKILL.md` so that pre-flatten historical
 * paths (`skills/<domain>/<id>/SKILL.md`, ~42% of the blobs in history) key to
 * the same id as today's `skills/<id>/SKILL.md`.
 *
 * `skills/<id>/SKILL.md` IS A PUBLIC PATH SHAPE. At least one consumer outside this repository
 * globs on it — the `memex` extractor, which also infers projects by walking parent directories.
 * A wholesale layout change strands it loudly, which is fine; a PARTIAL one (some skills moved,
 * others not) reads as a partial extraction rather than a broken glob, which is not. This
 * function has already survived one such migration by keying on the second-to-last segment, and
 * that tolerance is the reason to say so here rather than assume the next one is equally kind.
 */
export function contentKey(relPath) {
  const parts = relPath.split('/');
  if (parts.length < 2 || !CONTENT_TYPES.includes(parts[0])) return null;
  // Both branches below must agree on what an id is, and on which ids are not content.
  // They did not: the exclusion lived only in the flat branch, so
  // `contentKey('skills/_template/SKILL.md')` returned `skills/_template` — a key the
  // English history index then carried, which would have made a translated `_template`
  // a rewrite target (#519). skills/ holds most of the corpus, so the general claim that
  // deriving both the path and the key from this function removes the need for a second
  // exclusion list was false exactly where it mattered most.
  if (parts[parts.length - 1] === 'SKILL.md') {
    if (parts.length < 3) return null;
    // Second-to-last, never parts[1]: pre-flatten paths are
    // `skills/<domain>/<id>/SKILL.md`, and keying off parts[1] would silently key a whole
    // domain — ~42% of the blobs in history — to the wrong id.
    const id = parts[parts.length - 2];
    if (isExcludedId(id)) return null;
    return `${parts[0]}/${id}`;
  }
  if (parts.length === 2 && parts[1].endsWith('.md')) {
    const id = parts[1].slice(0, -3);
    if (isExcludedId(id)) return null;
    return `${parts[0]}/${id}`;
  }
  return null;
}

/**
 * Every path shape a `git log` pathspec must carry to see one key's whole history (#682).
 *
 * `contentKey` is deliberately many-to-one: `skills/<domain>/<id>/SKILL.md` and
 * `skills/<id>/SKILL.md` key to the same `skills/<id>`. That is what makes the pre-flatten era
 * — 863 path occurrences in this repository's history — reachable under today's ids.
 *
 * It also means a pathspec built from the CURRENT path alone is not the same walk. A tree-level
 * pathspec (`-- skills agents teams guides`) matches both shapes and never had to know; a
 * file-level one matches only what it names. Scoping the walk (#635) is what turned an invariant
 * of `contentKey` into a requirement on its callers, and the failure it produced was silent and
 * in the strict direction: a mirror whose fence body existed only in pre-flatten English is
 * clean under the corpus-wide walk and a VIOLATION under `--id`. A false accusation against a
 * translation nobody touched, on the command CLAUDE.md tells a contributor to run.
 *
 * So the alias list lives here, beside the function whose many-to-one mapping creates it, rather
 * than in the caller that happens to need it first. A second caller deriving its own answer is
 * the drift this directory keeps closing.
 *
 * ## Which shapes this covers, MEASURED rather than reasoned
 *
 * `contentKey` accepts two families, and the first reaches every tree, not only `skills`:
 *
 *   branch 1  `<tree>/<...any depth...>/<id>/SKILL.md`   keys on the second-to-last segment
 *   branch 2  `<tree>/<id>.md`                            requires exactly two segments
 *
 * So three shapes other than today's could key to a live id. This function covers one of them by
 * construction and two only because history does not contain them:
 *
 *   skills/<...>/<id>/SKILL.md                COVERED — see the line comments below
 *   skills/<id>.md                            not covered
 *   agents|teams|guides/<...>/<id>/SKILL.md   not covered
 *
 * Measured against CI's own ruler — `git log --format= --name-only -- skills agents teams guides`,
 * default simplification from HEAD, because the superset claim is relative to the walk CI runs:
 * the only hit is `skills/README.md`, for which `contentKey` returns null. **Zero occurrences.**
 *
 * That is a fact about this history, not a property of `contentKey`. An earlier draft argued the
 * flat trees structurally cannot need an alias "because `contentKey`'s flat branch requires
 * `parts.length === 2`" — true of the flat branch, silent about the `SKILL.md` branch, which
 * keys `agents/x/foo/SKILL.md` to `agents/foo` perfectly well. That is the same shape as the
 * sentence this whole fix exists to correct: an argument true of its neighbour. If either
 * uncovered shape ever appears, this function must gain it in the same commit.
 *
 * The glob's semantics, and why the comment it replaces was wrong twice, are in the line
 * comments below — a star followed by a slash cannot appear inside a block comment, and writing
 * the pathspec with spaces around the star to smuggle it in here would have been a third
 * inaccuracy about the very literal under discussion.
 *
 * @param {string} englishRel repo-relative path to an English source, as `contentKey` takes it
 * @returns {string[]} pathspecs covering every historical shape of that key, current one first
 */
// ## The glob, measured
//
// `skills/*/<id>/SKILL.md` is a DEFAULT pathspec, and in one `*` DOES cross `/`:
//
//   git ls-files -- 'skills/*/foo/SKILL.md'          -> skills/dom/foo, skills/a/b/foo
//   git ls-files -- ':(glob)skills/*/foo/SKILL.md'   -> skills/dom/foo
//
// So the alias covers EVERY nesting depth, not the single pre-flatten segment. The comment this
// replaces asserted the opposite — "`*` does not cross `/` in a git pathspec's fnmatch, so this
// matches exactly one intervening domain segment" — and justified the gap it believed it was
// leaving with "deeper nestings … `contentKey` would key to a different id anyway", which is also
// false: `contentKey` keys on the SECOND-TO-LAST segment, so `skills/a/b/foo/SKILL.md` keys to
// `skills/foo` too. Two wrong claims whose errors cancelled, leaving code more correct than its
// own comment.
//
// DO NOT "tighten" this to `:(glob)`. That is the edit the wrong comment invited, and it would
// reopen the hole for any nesting deeper than one segment.
export function historicalPathspecs(englishRel) {
  const parts = englishRel.split('/');
  if (parts[0] === 'skills' && parts[parts.length - 1] === 'SKILL.md') {
    const id = parts[parts.length - 2];
    // Default pathspec: `*` crosses `/`, so this covers every nesting depth rather than only
    // the one-segment pre-flatten shape. Deliberate — see the docblock, and do not use `:(glob)`.
    return [englishRel, `skills/*/${id}/SKILL.md`];
  }
  return [englishRel];
}

/**
 * Names that live inside a content tree without being content.
 *
 * Takes a RAW path segment and strips a `.md` suffix itself, so both branches of `contentKey`
 * can hand it the same kind of thing. They could not before: the flat branch stripped the
 * extension before testing while the nested branch passed a bare directory segment, which
 * made `contentKey('skills/README.md/SKILL.md')` return `skills/README.md` instead of null
 * while `contentKey('skills/README.md')` correctly returned null. Unreachable today only
 * because every caller happens to `statSync(...).isFile()` afterwards — which is the
 * "unreachable because of ambient state" framing #519 exists to reject.
 *
 * (This docblock spent several revisions stranded ~80 lines above the function, immediately
 * followed by a second `/**`, so every reader and every JSDoc tool attached it to
 * `historicalPathspecs` instead. Restored here in #546.)
 *
 * EXPORTED for #546, so the `_`-prefix guards that shadow it cannot narrow independently.
 * Two callers — `check-yaml-fences.js` and the working-tree arm of `walkEnglishHistory` —
 * short-circuit on the prefix before `contentKey` is ever consulted. Those guards are
 * deliberate defence in depth and are KEPT: `check-yaml-fences.js` never had the #519 bug
 * precisely because it skips `_template` before the flat/nested asymmetry can reach it.
 *
 * The redundancy is only safe in one direction. This predicate is a strict superset of
 * `startsWith('_')`, so WIDENING it propagates to the shadowing guards correctly. NARROWING
 * it would not, and the failure is nastier than #519's: if `_`-prefixed content were ever
 * declared to be content, the working-tree arm would still skip it while the git-log arm
 * included it — a PARTIAL basis, which yields false-positive violations only for fences added
 * since the last commit. Intermittent, content-dependent, and it reads as a translation
 * defect rather than a tooling one. Routing both guards through this function is what makes
 * that unrepresentable.
 *
 * NOT the package's exclusion rule, and not a template test. `skills-inventory.js` measured
 * both differences: this rule would skip `skills/_experimental/tool.py`, which SHIPS, and it
 * says nothing about `_template` specifically. Use `isTemplate` for the scaffolding question
 * and `isExcludedFromPackage` for the npm one.
 *
 * @param {string} id a raw path segment, with or without a `.md` suffix
 * @returns {boolean} true when the segment names something that is not content
 */
export function isExcludedId(id) {
  const stem = id.endsWith('.md') ? id.slice(0, -3) : id;
  return stem.startsWith('_') || stem === 'README';
}
