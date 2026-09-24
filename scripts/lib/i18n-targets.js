/**
 * i18n-targets.js — the one walk over translated content (#552).
 *
 * Three tools need "every translated file, optionally scoped to a locale or a set of trees":
 * the parity gate, the fence normalizer, and the backfill. Each had grown its own copy, and the
 * copies were not interchangeable — one recorded which trees it reached before applying the
 * `--tree` filter, one after; one checked `isFile`, one only `existsSync`. Those differences are
 * not stylistic. They decide whether a scoped run that reaches nothing reports a clean-looking
 * zero or exits 2, which is the guard-proxy failure `--tree` was added to prevent.
 *
 * ## The accept-lists are returned, not computed by the caller
 *
 * Both are collected DURING the walk and after the existence checks, so "reached" means "carries
 * translated content" rather than "has a directory of that name". But they are collected at
 * different points relative to the scope filters, and that asymmetry is the guard:
 *
 *   - `localesReached` before any filter — `--locale` asks whether a locale carries content at
 *     all, which no tree filter should narrow;
 *   - `treesReached` after the LOCALE filter and before the tree filter — `--tree` asks whether
 *     a tree would be reached *by this run*, and collecting it corpus-wide makes the check
 *     circular for combined scopes. Collecting it before filtering (as the first version of
 *     this module did) let `--locale wenyan --tree guides` satisfy each guard independently and
 *     scan nothing at exit 0: six of the ten locales carry `skills/` alone.
 *
 * Validating a scope flag against a static list rather than against these has the same failure,
 * one level up.
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

import { contentKey } from './content-paths.js';
import { CONTENT_TYPES } from './content-types.js';

/**
 * How each content tree is MIRRORED under `i18n/<locale>/`.
 *
 * A record with a THROW, not a Set with a default. The first version of this used
 * `NESTED.has(dir)`, which is a silently-defaulting predicate: an unclassified tree gets
 * `false`, its entries are directories, they fail the `.endsWith('.md')` test downstream, and
 * the tree contributes zero targets — so a gate prints OK having scanned nothing. There is no
 * per-tree zero-target guard to catch it.
 *
 * Throwing at module load means a fifth tree in the SSOT breaks every consumer until someone
 * declares its layout. Loud is the point. Moved here from `check-i18n-fence-parity.js` so the
 * gate, the normalizer and the backfill cannot disagree about the corpus layout.
 */
const NESTING = { skills: true, agents: false, teams: false, guides: false };

/** @type {{dir: string, nested: boolean}[]} */
export const I18N_TREES = CONTENT_TYPES.map((dir) => {
  if (!(dir in NESTING)) {
    throw new Error(
      `i18n-targets: content type '${dir}' has no declared i18n layout. `
      + 'Add it to NESTING (true if mirrored as <dir>/<id>/FILE.md, false if <dir>/<id>.md).',
    );
  }
  return { dir, nested: NESTING[dir] };
});

/**
 * The locale directories under `i18n/`, and the ONLY definition of that set.
 *
 * `_config.yml`, `README.md` and `glossaries/` are not locales. Directory-ness is the test, plus
 * the underscore convention the rest of the repo already uses.
 *
 * Extracted because the pre-scan guards below and the walk had DIFFERENT answers (#623 review):
 * `scannableLocales` listed `i18n/` raw while the walk filtered `_`-prefixed entries and
 * `glossaries`. That is the guard-proxy shape — validating a flag against something adjacent to
 * the consumer's accept-list rather than against the list itself — and it is the specific defect
 * `--locale wenyan --tree guides` was fixed for. With an `i18n/_wip/skills/` present,
 * `--locale _wip` would have passed the guard, scanned nothing, and reported
 * `files to change: 0` at exit 0, on a tool that writes.
 */
export function localeDirs(root) {
  const i18nDir = resolve(root, 'i18n');
  if (!existsSync(i18nDir)) return [];
  return readdirSync(i18nDir).filter((entry) => {
    if (entry.startsWith('_') || entry === 'glossaries') return false;
    return statSync(join(i18nDir, entry)).isDirectory();
  });
}

/**
 * Does `<i18n>/<locale>/<tree>` exist as a directory?
 *
 * Directory-ness, not mere existence — the same test the walk applies one level down, so a file
 * named like a tree cannot make a locale look scannable.
 */
export function hasTree(root, locale, tree) {
  const path = join(resolve(root, 'i18n'), locale, tree);
  return existsSync(path) && statSync(path).isDirectory();
}

/**
 * Trees this repository actually carries translations for.
 *
 * A corpus-wide union, and that is its limit: it answers "does any locale have this tree", which
 * stops being the scan's own list the moment `--locale` narrows the scan. `--tree` must NOT be
 * validated against it — that is `validateScope`'s job, against `treesReached`. Kept because the
 * dirty-check pathspec and the write scope need a tree list BEFORE the scan runs.
 */
export function presentTrees(root) {
  const locales = localeDirs(root);
  return I18N_TREES.map(({ dir }) => dir).filter((tree) => locales.some((l) => hasTree(root, l, tree)));
}

/**
 * Locales carrying at least one present tree.
 *
 * The `--locale` accept-list, and it has to be computable BEFORE the scan: rejecting an
 * unreachable locale after a ~90s history build is a worse tool. `localesReached` from the walk
 * is the stricter, content-based answer and is what `validateScope` uses; this is the cheap
 * pre-scan one.
 */
export function scannableLocales(root) {
  const trees = presentTrees(root);
  return localeDirs(root).filter((entry) => trees.some((tree) => hasTree(root, entry, tree)));
}

/**
 * Every translated file, richly described.
 *
 * @param {object} opts
 * @param {string} opts.root repository root
 * @param {string|null} [opts.onlyLocale] restrict to one locale
 * @param {Set<string>|null} [opts.onlyTrees] restrict to these content trees
 * @param {boolean} [opts.withText] read each file (the callers that classify always do)
 * @returns {{
 *   targets: Array<{locale: string, tree: string, id: string, key: string, absPath: string,
 *                   english: string, englishRel: string, relPath: string, text?: string}>,
 *   localesReached: Set<string>, treesReached: Set<string>, localesPresent: string[],
 * }}
 */
export function collectI18nTargets({ root, onlyLocale = null, onlyTrees = null, onlyId = null, withText = false }) {
  const i18nDir = resolve(root, 'i18n');
  const targets = [];
  const localesReached = new Set();
  const treesReached = new Set();

  // One definition, shared with the pre-scan guards above — see `localeDirs`.
  const localesPresent = localeDirs(root);

  for (const locale of localesPresent) {
    for (const { dir: tree, nested } of I18N_TREES) {
      const base = join(i18nDir, locale, tree);
      if (!existsSync(base) || !statSync(base).isDirectory()) continue;

      for (const entry of readdirSync(base)) {
        // `contentKey` decides what counts as content at all, so `_template.md`, `README.md`
        // and `_registry.yml` fall out here rather than needing a second list that could drift
        // from the gate's.
        const englishRel = nested ? `${tree}/${entry}/SKILL.md` : `${tree}/${entry}`;
        const key = contentKey(englishRel);
        if (key === null) continue;

        // #635. Four `existsSync`/`statSync` calls per entry, over 3,648 entries, is the bulk of
        // a scoped run's cost on a 9p mount — 53 s of the 87 s, measured, and the reason a
        // per-file check is a check people stop running.
        //
        // An out-of-scope entry is skipped, but ONLY once it can no longer prove anything. The
        // two reached-sets are the reason it might: `localesReached` is corpus-wide and answers
        // "does this locale carry translated content at all", and `treesReached` is
        // locale-scoped. Both need a real entry to prove, and neither may be narrowed by `--id`
        // without changing what `validateScope` means — a `--locale de --id beta` where `de` has
        // content but not `beta` must name the ID, not the locale, or the reader is sent after
        // the wrong fault. `scripts/test/fence-parity-scope-guard.test.js` pins exactly that.
        //
        // So the skip is "already proven", not "not asked for": the first real entry in each
        // locale, and in each in-scope tree, is walked in full and everything after it is free.
        // With `onlyId` null nothing here fires and the walk is the old walk.
        const id = nested ? entry : entry.replace(/\.md$/, '');
        if (onlyId !== null && id !== onlyId) {
          const provesLocale = !localesReached.has(locale);
          const provesTree = (!onlyLocale || locale === onlyLocale) && !treesReached.has(tree);
          if (!provesLocale && !provesTree) continue;
        }

        const absPath = join(i18nDir, locale, englishRel);
        const english = join(root, englishRel);
        // `isFile`, not merely `existsSync`. For skills the entry is a directory and the file is
        // `SKILL.md`, so existence alone was safe by construction; on the mirror branch the
        // ENTRY is the file, and a directory named `foo.md` would reach readFileSync and kill
        // the run with EISDIR where the gate skips it.
        if (!existsSync(absPath) || !statSync(absPath).isFile()) continue;
        // The ENGLISH-side existence test is a real narrowing, and it is recorded rather than
        // silent. The fence gate's previous walk did not have it, so a translation whose English
        // source was DELETED but still has walked history was compared; here it drops out of the
        // walk entirely. Measured neutral today — the gate reports the same 3,644 pairs / 87
        // gated / 40 files before and after delegating to this module — because no such file
        // currently exists.
        //
        // It is kept because the normalizer needs the English path to exist before it reads it,
        // and a walk that returns targets one caller cannot use is worse. But it puts deleted
        // English in the same blind spot #480 already describes for deleted FENCES: a
        // historical-match gate cannot see a deletion, so the next one will vanish from this
        // gate unexamined. If #480 is ever addressed, this filter is part of its surface.
        if (!existsSync(english) || !statSync(english).isFile()) continue;

        // The two accept-lists are collected at DIFFERENT points, and the difference is the
        // whole guard rather than a detail.
        //
        // `localesReached` is corpus-wide: the question `--locale` asks is "does this locale
        // carry translated content at all", which no tree filter should narrow.
        //
        // `treesReached` is LOCALE-SCOPED — collected after the locale filter — because the
        // question `--tree` asks is "would this tree be reached BY THIS RUN". Collecting it
        // corpus-wide made each guard pass on its own while their composition scanned nothing:
        // `--locale wenyan --tree guides` found `wenyan` reachable (it has skills) and `guides`
        // reachable (de/es/ja/zh-CN have it), and reported `scanned: 0` at exit 0. Six of the
        // ten locales carry `skills/` alone, so that composition is not exotic. This is the
        // exact bug `normalize-i18n-fences.js` was fixed for and names in its own comment, and
        // the first version of this lib reintroduced it while claiming to prevent it.
        localesReached.add(locale);
        if (onlyLocale && locale !== onlyLocale) continue;
        treesReached.add(tree);
        if (onlyTrees && !onlyTrees.has(tree)) continue;
        // Reached here only to prove one of the sets above; it is not a target of this run.
        if (onlyId !== null && id !== onlyId) continue;

        const target = {
          locale,
          tree,
          id,
          key,
          absPath,
          english,
          englishRel,
          relPath: `i18n/${locale}/${englishRel}`,
        };
        if (withText) target.text = readFileSync(absPath, 'utf8');
        targets.push(target);
      }
    }
  }

  return { targets, localesReached, treesReached, localesPresent };
}

/**
 * Reject a scope flag that reached nothing, naming what WAS reachable.
 *
 * Returns an array of error lines; empty means the scope is good. The caller exits 2 — this
 * module does not call `process.exit`, because a library that kills the process cannot be tested.
 *
 * ## Who actually calls this
 *
 * The docblock here said "shared so the three callers cannot disagree". It had one (#634), then
 * two, and since #677 it has three: `backfill-fence-basis.js`, `check-i18n-fence-parity.js` and
 * `normalize-i18n-fences.js`. The sentence is an inventory rather than a number because a number
 * nobody can check is how the claim got wrong in the first place — and this paragraph has now
 * been falsified twice by the very PRs that changed the membership it describes. Update it in the
 * commit that moves a caller, not after.
 *
 * `normalize-i18n-fences.js` carried a HAND COPY of the `--tree` arm until #677, and converting
 * it changed behaviour rather than spelling. Two deltas, both now live and both tested there:
 *
 *   locale   `scannableLocales` is pre-scan and DIRECTORY-based; `localesReached` here is
 *            post-scan and CONTENT-based. An `i18n/xx/skills/` directory carrying no translated
 *            file passed the normalizer's own guard and refuses here. Its pre-scan guard is kept
 *            rather than replaced: it is load-bearing for the `i18n/${ONLY_LOCALE}` write-scope
 *            interpolation and runs before the dirty-tree check, so this function cannot stand in
 *            for it even in principle.
 *   tree     an unknown tree NAME. It is a subset of unreached, so the hand copy already exited
 *            2 on it and only the message differs — but "matched no translated content" reads as
 *            "right name, empty corpus" for what is actually a typo.
 *
 * ## `onlyId` asks REACHED, never EXISTS
 *
 * `idsReached` must be built from the targets the scan actually collected, AFTER any locale
 * scoping and BEFORE the id filter. That is what makes a `--locale`/`--id` pair which is
 * individually valid but jointly empty refuse without a third check: the id is simply not among
 * what that locale reached.
 *
 * Guarding with `existsSync('skills/' + id)` instead would pass for a real skill nobody has
 * translated and still compare nothing — the proxy-predicate mistake this function exists to
 * avoid. There are deliberately no reachable ids in the message: the corpus carries hundreds, a
 * wall of them is not a diagnostic, and since #635 the caller may pass a walk narrowed to the
 * requested id, in which case `idsReached` is a singleton or empty and has no size worth
 * quoting. Membership is the only thing this arm reads, and membership is exact either way.
 *
 * @param {object} opts
 * @param {string|null} opts.onlyLocale
 * @param {Set<string>|null} opts.onlyTrees
 * @param {string|null} [opts.onlyId]
 * @param {Set<string>} opts.localesReached
 * @param {Set<string>} opts.treesReached
 * @param {Set<string>} [opts.idsReached] - required when `onlyId` is given
 * @returns {string[]}
 */
export function validateScope({ onlyLocale, onlyTrees, onlyId = null, localesReached, treesReached, idsReached = null }) {
  const errors = [];
  if (onlyLocale && !localesReached.has(onlyLocale)) {
    errors.push(`ERROR: --locale '${onlyLocale}' matched no translated content.`);
    errors.push('Nothing would be scanned, and the run would report a clean-looking zero.');
    errors.push(`Reachable here: ${[...localesReached].sort().join(', ') || '(none)'}`);
    return errors;
  }
  if (onlyTrees) {
    const known = new Set(I18N_TREES.map((t) => t.dir));
    const unknown = [...onlyTrees].filter((t) => !known.has(t));
    if (unknown.length) {
      errors.push(`ERROR: --tree names no such content tree: ${unknown.join(', ')}`);
      errors.push(`Known trees: ${[...known].sort().join(', ')}`);
      // NOT a `return`. `--tree recipes,guides` — one typo and one real-but-unreached tree —
      // used to report only the typo, so the caller fixed it, reran, and learned about the
      // second on the next round trip. The hand copy this replaced named both in one message,
      // and losing that was a regression the #690 review caught.
    }
    const unreached = [...onlyTrees].filter((t) => known.has(t) && !treesReached.has(t));
    if (unreached.length) {
      errors.push(`ERROR: --tree matched no translated content${onlyLocale ? ` in locale '${onlyLocale}'` : ''}: ${unreached.join(', ')}`);
      errors.push('Nothing would be scanned, and the run would report a clean-looking zero.');
      errors.push(`Reachable here: ${[...treesReached].sort().join(', ') || '(none)'}`);
      return errors;
    }
  }
  if (onlyId) {
    // A caller that passes `onlyId` without `idsReached` would otherwise get a permanent refusal
    // or a permanent pass depending on the default, and both are worse than saying so.
    if (idsReached === null) {
      errors.push('ERROR: validateScope was given --id with no idsReached set. This is a caller bug:');
      errors.push('the accept-list must be what the scan reached, so it cannot be defaulted.');
      return errors;
    }
    if (!idsReached.has(onlyId)) {
      errors.push(`ERROR: --id '${onlyId}' matched no translated content${onlyLocale ? ` in locale '${onlyLocale}'` : ''}.`);
      errors.push('Nothing would be compared, and the run would report a clean-looking zero.');
      errors.push('A typo and a real but untranslated id land here alike; both mean this run');
      errors.push('examines nothing.');
    }
  }
  return errors;
}
