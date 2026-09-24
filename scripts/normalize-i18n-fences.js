#!/usr/bin/env node
/**
 * normalize-i18n-fences.js
 *
 * Companion repair tool to `check-i18n-fence-parity.js` (#472). Restores the
 * English body of gated code fences in translated content, which the
 * keep-code-in-English rule requires them to carry verbatim.
 *
 * Shares `lib/fences.js` with the checker, so the two can never disagree about
 * where a fence begins or ends.
 *
 * ## Which English revision is restored
 *
 * By default the translation's own `source_commit` — the English revision it
 * was actually translated from — NOT English at HEAD.
 *
 * That is deliberate. 2,549 translations are stale: their prose describes an
 * older English source. Splicing HEAD's code into a file whose prose predates
 * it produces a document that is internally inconsistent — prose describing one
 * command sitting above a different command — and it silently entangles this
 * parity repair with the separate staleness backlog (#278). Restoring the
 * source_commit body leaves each file coherent, satisfies the parity gate
 * (which accepts any historical English revision), and leaves
 * `check-translation-freshness.js` free to keep reporting the file as stale,
 * which it still is.
 *
 * Pass `--basis head` to restore from current English instead. That is the right
 * choice only when refreshing the translation's prose in the same pass.
 *
 * Note that "head" reads the WORKING TREE, not the HEAD commit — and so does the
 * default basis whenever a translation's `source_commit` fails to resolve. An
 * uncommitted English edit is a legitimate parity basis, so this is deliberate,
 * but it means a dirty English tree changes what is spliced into the corpus. Such
 * restores are reported as basis `worktree`; a `--write` run warns when any
 * English content tree is dirty.
 *
 * ## What it refuses to touch
 *
 * A fence is only rewritten when the translated file and its English basis
 * carry the SAME number of fences in the SAME language-tag sequence. Then
 * ordinal mapping is sound: the nth fence corresponds to the nth fence.
 * Otherwise the file is skipped and reported for manual repair — 46 of the 327
 * affected skills at introduction (41 by fence count, 5 by tag sequence),
 * mostly translations that dropped or merged blocks outright, which no
 * positional rule can safely reconstruct. Those 46 carry 206 fences and are
 * tracked as content forks in #478.
 *
 * Those two structural checks are necessary and not sufficient: both can agree
 * coincidentally while the steps no longer correspond. A third check reads the
 * CODE SKELETON of each gated fence pair and refuses the file when it says the
 * nth fence is a different step (#498, `lib/code-tokens.js`). Without it, an
 * unscoped run at `ab46c9dae^` rewrote all 8 fences of
 * `i18n/de/skills/design-shiny-ui`, whose Schritt 5 was English Step 6 — and the
 * parity checker reported the result `OK`, because a scrambled file is a
 * permutation of legitimate English bodies and every fence individually matches
 * some English revision. #534 re-scaffolded that file, so today's corpus holds no
 * known fork; the check guards against the next one.
 *
 * Scope: all four content trees — `skills`, `agents`, `teams`, `guides` — so it
 * covers exactly what `check-i18n-fence-parity.js` flags. It was skills-only
 * until the mirrors became the last mechanically-repairable slice of #477: 87 of
 * the 335 gated violations, 76 of them in `guides/quick-reference.md` across
 * four locales, and every one a translated comment inside a `bash`, `r` or
 * `yaml` fence.
 *
 * `--tree` scopes a run the way `--tag` scopes one, so the mirrors land as their
 * own reviewable batch. Paths differ by tree — `skills/<id>/SKILL.md` against
 * `<tree>/<id>.md` — and which names count as content at all is decided by
 * `contentKey` from `lib/fences.js`, the same function the history index is
 * built with, rather than by a second list here that could drift from it.
 *
 * ## Why preview is the default (#486)
 *
 * It writes only when `--write` is passed. The inverse — write by default,
 * `--dry` to preview — put the destructive mode behind the obvious command, and
 * a read-only probe agent typed it: 281 files / 1,014 fences rewritten during an
 * investigation whose prompt forbade modifying tracked files.
 *
 * The edit was trivially reverted. The expensive part was that every measurement
 * taken afterwards was wrong AND self-consistent — the parity gate read 293
 * instead of 1,307, and 1307 − 1014 = 293 exactly. That arithmetic was read as
 * evidence the published figure had been inflated, and a true finding about a
 * translated 21 CFR Part 11 audit value was publicly retracted before the stray
 * write was found. A silent write turns later measurements into confident lies,
 * which is worse than a crash.
 *
 * Two further guards follow from the same incident: the tool refuses to write
 * into a dirty tree (`git checkout -- i18n/` is the only undo, and it would
 * destroy uncommitted work), and it announces the write on stderr before
 * touching disk, so a stray run is visible even when stdout is redirected.
 *
 * Usage:
 *   node scripts/normalize-i18n-fences.js                # preview (default)
 *   node scripts/normalize-i18n-fences.js --dry          # preview, explicitly
 *   node scripts/normalize-i18n-fences.js --write        # apply
 *   node scripts/normalize-i18n-fences.js --basis head
 *   node scripts/normalize-i18n-fences.js --locale de    # restrict to one locale
 *   node scripts/normalize-i18n-fences.js --tag yaml,json  # restrict to tags (#477 batches)
 *   node scripts/normalize-i18n-fences.js --tree guides,agents  # restrict to trees
 *   node scripts/normalize-i18n-fences.js --fork-threshold 0  # disable the #498 check
 *   node scripts/normalize-i18n-fences.js --root /tmp/fixture   # run against another tree
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  extractFences, toLines, isGated, buildEnglishFenceHistory,
  foldedTagSequence, compareTagSequence, mirrorsBasis,
} from './lib/fences.js';
import { measure, DEFAULT_FORK_THRESHOLD } from './lib/code-tokens.js';
import { assertNotShallow } from './lib/git-freshness.js';
import {
  SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD,
  readFrontmatterField, stampFrontmatterField, clearFrontmatterField,
} from './lib/provenance.js';
import { parseArgs, usageExit } from './lib/parse-args.js';
import { catFileBatch } from './lib/git-batch.js';
import { collectI18nTargets, presentTrees, scannableLocales, validateScope } from './lib/i18n-targets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);

/**
 * Argument table for the shared default-deny parser: an argument it does not
 * name is an error, never a silent no-op.
 *
 * The `indexOf('--locale')` version it replaces failed open in the worst
 * possible direction. `--locale=de` is the ordinary GNU idiom, and `indexOf`
 * does not match it — so `ONLY_LOCALE` stayed null, the locale scoping vanished,
 * and a run the caller had narrowed to one locale silently covered all ten.
 * With `--write` that is 281 files rewritten where 63 were asked for: a stray
 * broad write reached through a natural spelling of a correct command, which is
 * precisely the #486 failure this file exists to prevent.
 *
 * The same silence covered every other unrecognised argument. A mistyped
 * `--wrte` is harmless now that preview is the default, but a mistyped or
 * misspelled `--locale` was not, and neither was a stray positional. Rejecting
 * the whole unknown space costs nothing and removes the class.
 *
 * Also retains the older guard this replaces: `--locale --dry` must not read
 * `"--dry"` as the locale value.
 */
const ARG_SPEC = {
  bool: ['--write', '--dry'],
  value: ['--basis', '--locale', '--tag', '--tree', '--root', '--fork-threshold'],
};
// The parser this file grew is now `scripts/lib/parse-args.js` (#619), because
// `generate-translation-status.js` had a hand-rolled one that disagreed with it — a third copy
// was the alternative, and a second copy that already disagreed is what made the case.
const opts = parseArgs(argv, ARG_SPEC, usageExit(ARG_SPEC));

// Writing is opt-in. `--dry` predates the inversion and is kept as an explicit
// no-op so documented commands and muscle memory keep working; it is the
// default, not a mode. Passing both is a contradiction rather than a preference
// — guessing which one the caller meant is how a "preview" becomes a write.
if (opts.write && opts.dry) {
  console.error('ERROR: --write and --dry contradict each other. Pass one.');
  process.exit(2);
}
const WRITE = opts.write;
const PREVIEW = !WRITE;

/**
 * `--root` exists so the splice gate can be driven against a fixture (#674).
 *
 * #674 could only be demonstrated at component level for exactly this reason: there was no way
 * to run the real normalizer over a corpus you constructed. Every other fixture in this tool's
 * test file COPIES `scripts/` into a temp repo to work around it.
 *
 * ## How common the retrofit is, counted rather than asserted
 *
 * An earlier draft called this "the FOURTH appearance … `buildEnglishFenceHistory` (#559),
 * `gate-envelope`, `check-i18n-fence-parity`, and this". The number survives and the membership
 * does not, which is the failure `english-history.js` warns about in as many words: "an
 * unqualified 'three' is a count the obvious grep refutes". Measured over the 13 scripts here
 * that take `--root`, comparing each file's creating commit against the commit that introduced
 * the flag:
 *
 *   RETROFITTED (4)  check-i18n-fence-parity.js, generate-translation-status.js,
 *                    measure-tag-sequence-parity.js, and this file
 *   BORN WITH IT (9) including `gate-envelope.js`, which the draft named as a retrofit
 *
 * So four is right by coincidence. `gate-envelope` was born with the flag — its own comment
 * explains why, which is presumably how it got into the list. `buildEnglishFenceHistory` (#559)
 * belongs to the lineage as the FUNCTION-level precedent, not as one of these four.
 *
 * The rule it keeps teaching, in `check-i18n-fence-parity.js`'s words: a module that hardcodes
 * its own repo root cannot be tested, so it will not be.
 */
const ROOT = resolve(opts.root ?? resolve(__dirname, '..'));

// Default applied HERE rather than seeded into the parse, because `parseArgs` initialises every
// value flag to null and a default living inside the parser would be invisible from the call site.
const BASIS = opts.basis ?? 'source-commit';
const ONLY_LOCALE = opts.locale;

if (!['source-commit', 'head'].includes(BASIS)) {
  console.error(`ERROR: --basis must be 'source-commit' or 'head' (got '${BASIS}')`);
  process.exit(2);
}

/**
 * Containment below which ordinal mapping is treated as untrustworthy (#498).
 * See `lib/code-tokens.js` for the measured basis of the default.
 *
 * `--fork-threshold 0` disables the check, and is the escape hatch for a
 * reviewer who has read a flagged file and confirmed it is faithful. There is
 * deliberately no `--no-fork-check`: naming the number forces the caller to say
 * what standard they are dropping to, and the value is printed in the report
 * summary on EVERY run, so a run made with the guard off cannot be mistaken for
 * a guarded one.
 *
 * That last clause was false when written. The threshold was printed only
 * inside the refusal block, which `--fork-threshold 0` makes unreachable by
 * construction — containment is in [0, 1], so `containment < 0` never holds and
 * `forks` is always empty. A disabled run therefore emitted a report
 * byte-identical to a guarded one, on the exact file the feature exists to
 * protect, while `check-i18n-fence-parity.js` reported the result OK afterwards
 * by design. The same silence covered every guarded run that happened to refuse
 * nothing. Printing it unconditionally is what makes the sentence true.
 *
 * Parsed with an explicit numeric pattern rather than `Number()` alone: JS
 * coerces whitespace to 0, so `--fork-threshold ' '` passed the `[0, 1]` range
 * check and silently turned the guard off — the disabling value arriving
 * through what looks like a typo.
 */
const FORK_THRESHOLD_RAW = opts['fork-threshold'] ?? String(DEFAULT_FORK_THRESHOLD);
if (!/^(?:[01](?:\.[0-9]+)?|\.[0-9]+)$/.test(FORK_THRESHOLD_RAW)) {
  console.error(`ERROR: --fork-threshold must be a decimal in [0, 1] (got '${FORK_THRESHOLD_RAW}')`);
  process.exit(2);
}
const FORK_THRESHOLD = Number(FORK_THRESHOLD_RAW);
if (!Number.isFinite(FORK_THRESHOLD) || FORK_THRESHOLD < 0 || FORK_THRESHOLD > 1) {
  console.error(`ERROR: --fork-threshold must be a decimal in [0, 1] (got '${FORK_THRESHOLD_RAW}')`);
  process.exit(2);
}

/**
 * Restrict the run to fences carrying these tags — the tag-scoped batches #477
 * calls for, so a 1,307-fence backlog lands as reviewable, individually
 * revertable slices instead of one 300-file diff.
 *
 * Scoping is applied to the DIVERGENT set only, never to the soundness checks:
 * fence-count and tag-sequence alignment still consider every fence in the file,
 * because whether ordinal mapping is trustworthy is a property of the whole
 * file, not of the slice being repaired. Narrowing those would let a batch
 * rewrite fences in a file the unscoped run correctly refuses to touch.
 */
const ONLY_TAGS = opts.tag === null ? null : new Set(
  opts.tag.split(',').map((t) => t.trim().toLowerCase()).filter((t) => t !== ''),
);
if (ONLY_TAGS !== null && ONLY_TAGS.size === 0) {
  console.error("ERROR: --tag was given no usable value (got '" + opts.tag + "').");
  process.exit(2);
}
// `untagged` names the empty info string, which is gated under default-deny and
// would otherwise be unaddressable from the command line.
const tagOf = (fence) => (fence.lang === '' ? 'untagged' : fence.lang);

/**
 * The locales this tool can actually scan: a directory under `i18n/` carrying a
 * content tree. Derived once and used BOTH to validate `--locale` and to drive
 * the scan below, so the two cannot disagree about what a locale is.
 *
 * Validating instead by `existsSync` on the constructed `i18n/<value>` path —
 * the first version of this guard — accepted every input that named some
 * existing path, which is not the same question. `--locale de/skills`,
 * `--locale ..` and `--locale glossaries` (a real directory with no `skills/`)
 * all passed a guard whose entire job is to reject a run that scans nothing,
 * and all three then reported the clean-looking zero it exists to prevent.
 * Membership in the scan's own list is the only formulation that cannot drift
 * from the scan.
 */
// `hasTree`, `PRESENT_TREES` and `SCANNABLE_LOCALES` come from `./lib/i18n-targets.js` (#623),
// so this file performs no `readdirSync` over `i18n/` at all and the pre-scan guards cannot drift
// from the walk they gate.

/**
 * Scoped to content trees, so the mirrors can be repaired as their own batch —
 * 87 of the 335 gated violations live in `agents`/`teams`/`guides`, and 76 of
 * those in one guide across four locales.
 *
 * Validated against the trees this repository actually carries rather than
 * against `TREES`, for the same reason `--locale` is validated against the
 * scan's own list: a value that names a real tree the corpus has no
 * translations for would otherwise report the clean-looking zero both guards
 * exist to reject.
 */
const PRESENT_TREES = presentTrees(ROOT);

const ONLY_TREES = opts.tree === null ? null : new Set(
  opts.tree.split(',').map((t) => t.trim().toLowerCase()).filter((t) => t !== ''),
);
if (ONLY_TREES !== null && ONLY_TREES.size === 0) {
  console.error(`ERROR: --tree was given no usable value (got '${opts.tree}').`);
  process.exit(2);
}
// The membership check is deliberately NOT here. Validating against
// `PRESENT_TREES` — a corpus-wide union — passes for any tree some locale
// carries, which stops being "the scan's own list" the moment `--locale`
// narrows the scan: `--locale wenyan --tree guides` cleared both guards
// independently and reported `files to change: 0`, the exact clean-looking zero
// they exist to reject, because six of the ten locales carry `skills/` alone.
// It is checked after the scan instead, against the trees the SCOPED run
// actually visited — the same shape as `--tag`, and for the same reason.

const SCANNABLE_LOCALES = scannableLocales(ROOT);

// A missing `i18n/` used to crash here on `readdirSync`. The lib returns `[]` instead — correct
// for a library, and a silent `files to change: 0` at exit 0 for a tool that writes. Refused
// explicitly, because "there is nothing to repair" and "I am not looking at the corpus" must not
// print the same thing.
if (SCANNABLE_LOCALES.length === 0) {
  console.error('ERROR: no translated locales found under i18n/.');
  console.error('Nothing would be scanned, and the run would report a clean-looking zero.');
  process.exit(2);
}

if (ONLY_LOCALE && !SCANNABLE_LOCALES.includes(ONLY_LOCALE)) {
  console.error(`ERROR: --locale '${ONLY_LOCALE}' is not a translated locale under i18n/.`);
  console.error('Nothing would be scanned, and the run would report a clean-looking zero.');
  console.error(`Available: ${SCANNABLE_LOCALES.join(', ') || '(none)'}`);
  process.exit(2);
}

/**
 * Every path this run may rewrite, and the pathspec the dirty check uses.
 * Safe to interpolate only because `ONLY_LOCALE` is now a validated direct child
 * name — as a bare `--locale` value, `..` made this `i18n/..`, silently widening
 * the dirty check to the whole repository.
 */
const WRITE_SCOPE = ONLY_LOCALE ? `i18n/${ONLY_LOCALE}` : 'i18n';

// Refuse to write into a dirty tree. `git checkout -- i18n/` is the only undo
// for this tool, and it discards uncommitted work along with the repair — so a
// stray run over unstaged edits is unrecoverable in exactly the case where
// recovery matters most. Checked before the ~90s history build so it fails fast.
function gitStatus(...pathspecs) {
  const status = spawnSync('git', ['status', '--porcelain', '--', ...pathspecs], {
    cwd: ROOT, encoding: 'utf8',
  });
  // `status.error` is set and stdout/stderr are null when the spawn itself
  // fails (git missing, ENOENT). Reading `.stderr` alone printed "undefined"
  // as the reason a destructive run was refused.
  if (status.error) return { ok: false, reason: status.error.message };
  if (status.status !== 0) {
    return { ok: false, reason: (status.stderr || '').trim() || `git exited ${status.status}` };
  }
  return { ok: true, dirty: status.stdout.trim() };
}

if (WRITE) {
  const scope = gitStatus(WRITE_SCOPE);
  if (!scope.ok) {
    console.error(`ERROR: could not read git status for ${WRITE_SCOPE}/ — refusing to write.`);
    console.error(`  ${scope.reason.slice(0, 500)}`);
    process.exit(2);
  }
  if (scope.dirty) {
    const lines = scope.dirty.split('\n');
    const hasUntracked = lines.some((line) => line.startsWith('??'));
    console.error(`ERROR: ${WRITE_SCOPE}/ has uncommitted changes:`);
    for (const line of lines.slice(0, 10)) console.error(`  ${line}`);
    if (lines.length > 10) console.error(`  ... and ${lines.length - 10} more`);
    console.error('');
    console.error(`This tool rewrites files in place, and \`git checkout -- ${WRITE_SCOPE}\` is the`);
    console.error('only undo — it would discard the changes above too. Commit them first,');
    // `git stash` without -u leaves untracked files in the tree, so the stock
    // advice would hand back a tree this guard still refuses — or worse, one it
    // accepts while the untracked file remains overwritable with no copy in git.
    console.error(hasUntracked
      ? 'or stash them with `git stash -u` (plain `git stash` leaves the `??` entries behind).'
      : 'or stash them.');
    process.exit(2);
  }

  // English is read from the WORKING TREE when a translation's `source_commit`
  // does not resolve, and always under `--basis head`. That is legitimate — an
  // uncommitted English edit is a valid parity basis — but it means a dirty
  // `skills/` changes what gets spliced into the corpus, and the run would
  // report it as basis `head`. Warn rather than refuse: refusing would block
  // the ordinary edit-English-then-repair pass this tool is for.
  // Every tree that can be spliced FROM, not just skills. The English basis is
  // read off disk whenever a `source_commit` fails to resolve and always under
  // `--basis head`, and `t.english` is now `guides/quick-reference.md` as
  // readily as `skills/<id>/SKILL.md` — so a warning scoped to `skills` was
  // silently half the surface it claimed to cover.
  const english = gitStatus(...PRESENT_TREES);
  if (english.ok && english.dirty) {
    console.error(`NOTE: English content (${PRESENT_TREES.join(', ')}) has ${english.dirty.split('\n').length} uncommitted change(s).`);
    console.error('      Fences restored from the working tree are labelled `worktree`, not a commit.');
  }
}

// The frontmatter reader that used to live here moved to `scripts/lib/provenance.js` (#552),
// which owns both provenance fields and the only reader anchored to the frontmatter block.
// Three hand-rolled readers existed across this repo and they disagreed — the one in
// `generate-translation-status.js` is unanchored and reads a `source_commit:` written inside a
// body fence as metadata.

/**
 * Batch-resolve `<commit>:<englishRel>` blobs in one git process.
 *
 * The parse moved to `scripts/lib/git-batch.js` (#587). The copy that was here carried the
 * older 512 MiB buffer, its own `process.exit(1)`, and no `batch.error` branch — so a maxBuffer
 * overflow would have blamed git for failing rather than naming the truncation, and a truncated
 * pool is the failure that silently supplies the wrong RESTORE BASIS to a tool that writes.
 *
 * The `null` for a missing object is kept: callers here distinguish "resolved to nothing" from
 * "never asked", which is why `catFileBatch` reports absences rather than skipping them.
 */
function readBlobs(specs) {
  const out = new Map();
  try {
    catFileBatch(ROOT, specs, (spec, text) => out.set(spec, text));
  } catch (error) {
    // The library throws; this is a CLI, so it says what happened and exits the way its other
    // failures do rather than surfacing a stack trace.
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
  return out;
}

assertNotShallow(ROOT);

// ---- gather targets ----
//
// The walk moved to `scripts/lib/i18n-targets.js` (#623). #622 extracted it because the gate and
// this tool had each grown a copy and the copies had ALREADY DRIFTED on the two points that
// decide whether a scoped run reaching nothing reports a clean zero or exits 2 — one recorded
// its reached-trees before the `--tree` filter and one after (validating a filter against the
// post-filter set is circular and always passes), and one checked `isFile` where the other
// checked only `existsSync`. This file was left on its own copy there to keep a 3,415-file diff
// auditable, which made the count 2 → 2 rather than 2 → 3.
//
// `SCANNABLE_LOCALES` and `PRESENT_TREES` stay: the `--locale` guard above fires BEFORE the scan
// and needs them, and `gitStatus(...PRESENT_TREES)` and `WRITE_SCOPE` read them too.
//
// They are NOT the same predicate as the walk's, and the first version of this comment claimed
// they were. They are directory-based and answer "could this locale be scanned at all"; the walk's
// `localesReached` is content-based and answers "did anything survive every check". A locale whose
// `skills/` is empty is in the first and never in the second. Both now enumerate `i18n/` through
// the lib's single `localeDirs`, so they cannot disagree about what a locale IS — which is the part
// that was a live divergence, not a documentation nicety.
const collected = collectI18nTargets({
  root: ROOT,
  onlyLocale: ONLY_LOCALE,
  onlyTrees: ONLY_TREES,
  withText: true,
});

const targets = collected.targets.map((t) => ({
  locale: t.locale,
  tree: t.tree,
  key: t.key,
  // The lib calls it `absPath`; everything downstream here reads `path`. Renamed at the seam
  // rather than in the lib, whose other two callers already use `absPath`.
  path: t.absPath,
  english: t.english,
  englishRel: t.englishRel,
  relPath: t.relPath,
  text: t.text,
  // Not the lib's job: it returns content, and provenance has its own reader. `readFrontmatterField`
  // is the anchored one from #552 — the same call the old inline walk made.
  sourceCommit: readFrontmatterField(t.text, SOURCE_COMMIT_FIELD),
}));

/** Trees the locale-scoped scan found translated content in, before `--tree`. */
const treesInScope = collected.treesReached;

/**
 * Validate the scope against what the SCOPED scan actually reached, not against a corpus-wide
 * union. Checked here rather than at parse time because the accept-list is the scan's own output
 * — the only formulation that cannot drift from the scan — and before any write, so a mistyped
 * or unreachable batch cannot touch the corpus.
 *
 * The pre-scan version passed `--locale wenyan --tree guides` and reported `files to change: 0`:
 * each guard was satisfied on its own and neither saw the composition, while six of the ten
 * locales carry `skills/` alone.
 *
 * Since #677 this covers `--locale` too, content-based, on top of the directory-based pre-scan
 * check above — which stays, because it is what licenses the `i18n/${ONLY_LOCALE}` interpolation
 * in `WRITE_SCOPE` and runs before the dirty-tree check. Then the backstop, for the case no flag
 * was given at all.
 */
const scopeErrors = validateScope({
  onlyLocale: ONLY_LOCALE,
  onlyTrees: ONLY_TREES,
  localesReached: collected.localesReached,
  treesReached: treesInScope,
});
if (scopeErrors.length) {
  for (const line of scopeErrors) console.error(line);
  process.exit(2);
}

// Belt-and-braces behind both guards, copied in intent from `backfill-fence-basis.js`: they
// answer "is each flag reachable", this answers "did this run reach anything at all", and the
// two come apart the moment a scope flag changes what the WALK collects rather than what a
// filter keeps.
if (targets.length === 0) {
  console.error('ERROR: this scope selected no translated files. Nothing would be repaired.');
  console.error(`Reachable locales: ${[...collected.localesReached].sort().join(', ') || '(none)'}`);
  console.error(`Reachable trees:   ${[...treesInScope].sort().join(', ') || '(none)'}`);
  process.exit(2);
}

// The history walk runs AFTER the scope is validated (#677), not before, so a mistyped `--tree`
// is refused before it rather than after. Same reorder #634 made in the parity gate.
//
// The magnitude is NOT measured for this tool, and an earlier draft of this comment called it
// "the ~90 s step" on inherited lore. What is measured, on the parity gate and on this mount
// (#635): of an 87 s unscoped run, 53 s was the TARGET walk's `existsSync`/`statSync` pass, not
// the history build. This tool never passes `onlyId`, so its target walk still pays that in
// full and necessarily runs before `validateScope` can say anything. The reorder is free and in
// the right direction; how much it saves here is unknown, and saying so is cheaper than
// repeating a number nobody took.
// `ROOT`, explicitly. `buildEnglishFenceHistory` defaults to `fences.js`'s OWN module root, so
// the argument-less call was correct only while this tool could not be pointed anywhere else.
// Adding `--root` (#674) turned that default into a split-brain — targets from the fixture,
// history from the real repository — and the first fixture written against the new flag reported
// `no English history for this id` for a file whose English source it had just committed.
//
// Latent before the flag existed, and the precedent is #559 — `buildEnglishFenceHistory`
// closing over its own module root — not #634, which is a vacuous-scope guard and shares only
// "latent until first exercised". A module-scope root is invisible until something tries to move
// it, and the thing that tries is always the first test.
//
// Corroborated by timing rather than proven by it: the fixture went from 15 s to 0.35 s once the
// walk stopped scanning the real corpus. The load-bearing evidence is functional — the run
// reported `no English history for this id` for a file it had just committed — and a fixture
// pins that, so the delta is colour and not a measurement to quote elsewhere.
const history = buildEnglishFenceHistory(ROOT);

// ---- resolve each target's English basis ----
const specs = BASIS === 'source-commit'
  ? [...new Set(targets.filter((t) => t.sourceCommit)
      .map((t) => `${t.sourceCommit}:${t.englishRel}`))]
  : [];
const blobs = readBlobs(specs);

let filesChanged = 0;
let fencesRestored = 0;
const skipped = [];
/** Files refused because their code skeleton says the steps do not correspond. */
const forks = [];
/** Fences the containment measure could not read — reported, never scored (#498). */
const unmeasured = [];
const changedByLocale = new Map();
// Every edit is planned first and applied afterwards, so preview and write walk
// identical code and the preview cannot describe a run the write does not make.
const plan = [];
/** tag -> divergent-fence count, for validating --tag against reality. */
const seenTags = new Map();

for (const t of targets) {
  let basisText = null;
  // `worktree`, not `head`: the fallback below reads `skills/<id>/SKILL.md` off
  // disk, which is HEAD's content only when that file is clean. Labelling it
  // `head` made the report claim a provenance the bytes did not have.
  let basisLabel = 'worktree';
  if (BASIS === 'source-commit' && t.sourceCommit) {
    basisText = blobs.get(`${t.sourceCommit}:${t.englishRel}`) ?? null;
    basisLabel = t.sourceCommit;
  }
  if (basisText === null) { basisText = readFileSync(t.english, 'utf8'); basisLabel = 'worktree'; }

  const translatedFences = extractFences(t.text);
  const basisFences = extractFences(basisText);
  // Keys are `<tree>/<id>`, produced by the same `contentKey` the history is
  // built with, so the two cannot disagree about what an id is. A bare `t.skill`
  // lookup returned undefined for every file, which the `everEnglish &&` guard
  // below silently turned into "nothing to repair" — a clean-looking zero.
  const everEnglish = history.get(t.key);
  if (!everEnglish) {
    skipped.push({ file: t.relPath, reason: 'no English history for this id', n: 0 });
    continue;
  }

  // Restore exactly what the gate flags: a gated fence whose body appears in no
  // English revision. Using the same predicate as the checker is what keeps the
  // two tools from disagreeing — an ordinal-only test would rewrite fences the
  // gate considers legitimately stale.
  const allDivergent = translatedFences.filter((f) => isGated(f) && !everEnglish.has(f.body));
  // Every divergent tag anywhere in the corpus, INCLUDING in files this run will
  // skip as unrepairable — the set `--tag` is validated against. Collecting only
  // from repairable files would reject a real tag as a typo.
  for (const f of allDivergent) seenTags.set(tagOf(f), (seenTags.get(tagOf(f)) || 0) + 1);
  const divergent = ONLY_TAGS === null ? allDivergent : allDivergent.filter((f) => ONLY_TAGS.has(tagOf(f)));
  if (divergent.length === 0) continue;

  if (translatedFences.length !== basisFences.length) {
    skipped.push({ file: t.relPath, reason: `fence count ${translatedFences.length} vs basis ${basisFences.length}`, n: divergent.length });
    continue;
  }

  // Ordinal mapping is sound when the tag at every position corresponds.
  //
  // A `text` fence facing an untagged one is NOT a divergence:
  // `normalize-content-style.js --mode fences` retro-tagged untagged blocks as
  // `text`, so that pairing is an artifact of a known repo tool acting on the
  // newer side only. `foldedTagSequence` folds the two together.
  //
  // This must NOT be expressed as `isGated(a) !== isGated(b)`. Under default-deny
  // an untagged fence is gated while `text` is not, so that formulation makes
  // every one of those benign pairings a misalignment — it stranded 169
  // mechanically-repairable fences across 73 files between the two commits of
  // this PR, while the comment above it still described the pre-inversion
  // behaviour. Alignment is a question about ordinal correspondence, not about
  // what the gate covers.
  //
  // `foldedTagSequence`, not a local copy (#674). The copy that stood here folded a brace-info
  // fence to `text` exactly like an untagged one, so an English ```text facing a translated
  // ```{r} at the same ordinal read as ALIGNED — and the brace fence is gated, so a divergent
  // body at that position became eligible for a splice from a localisable block. The tool whose
  // job is to restore frozen fences would have written translated prose into one.
  //
  // Its sibling copy in `check-placeholder-drift.js` went the same way in this commit; #612
  // removed the third from the measurement script. The stamp guard below already used the
  // shared fold, and the comment beside it said so — "STRICTER than the pre-splice guards" —
  // which is how a known asymmetry sat in the file for two issues without being read as a bug.
  //
  // Note what `{` does NOT distinguish: every brace fence folds to the same token, so ```{r}
  // facing ```{python} still aligns, under this fold and under the old one alike. Inherited
  // from `foldedTagSequence` by design and shared with the gate and `mirrorsBasis`, so it is
  // not a regression — but it is the next thing to look at if brace fences ever land in the
  // corpus, because a splice would then place an `{r}` body under a `{python}` tag.
  const translatedSeq = foldedTagSequence(translatedFences);
  const basisSeq = foldedTagSequence(basisFences);
  const misaligned = translatedSeq.findIndex((tag, i) => tag !== basisSeq[i]);
  if (misaligned >= 0) {
    // The FOLDED tokens, not `lang || 'untagged'`. That label predates #674 and was accurate
    // while the only way to reach this branch was a genuine tag difference; the brace case this
    // fix opens would print "(untagged vs text)" for a ```{r} fence, sending whoever does the
    // manual repair hunting for an untagged fence that is not in the file. `{` is what the
    // comparison actually used, so `{` is what the message owes the reader.
    const a = translatedSeq[misaligned];
    const b = basisSeq[misaligned];
    skipped.push({ file: t.relPath, reason: `tag sequence diverges at fence ${misaligned + 1} (${a} vs ${b})`, n: divergent.length });
    continue;
  }

  /**
   * Fence count and tag sequence can both agree while the translation is a fork
   * whose steps no longer correspond (#498). `de/design-shiny-ui` carried 8 `r`
   * fences in the same sequence as English until #534 re-scaffolded it, but its
   * Schritt 5 was English's Step 6 — so ordinal restore gave every fence the body
   * of a different step, and
   * the parity checker cannot see it: a scrambled file is a permutation of
   * legitimate English bodies, so every fence individually matches SOME English
   * revision and passes.
   *
   * The tell is the code skeleton. A faithful translation localises comments and
   * string literals and leaves the code alone, so an old and new body of the
   * same fence share nearly all of it; a different step shares almost none.
   *
   * Scoped like the two checks above and for the same reason: whether ordinal
   * mapping is trustworthy is a property of the WHOLE file, so every GATED fence
   * pair is measured, not just the divergent ones `--tag` selected. That is
   * strictly more sensitive here than restricting to divergences — in a forked
   * file a non-divergent gated fence still carries some OTHER step's English
   * body, which is exactly the permutation this measure reads. Localisable
   * fences are excluded because differing wholesale is what they are for.
   */
  const below = [];
  let measured = 0;
  for (let i = 0; i < translatedFences.length; i++) {
    const f = translatedFences[i];
    if (!isGated(f) || basisFences[i].body === f.body) continue;
    const m = measure(f.body, basisFences[i].body, tagOf(f));
    if (!m.measurable) {
      unmeasured.push({ file: t.relPath, fence: i + 1, tag: tagOf(f), reason: m.reason });
      continue;
    }
    measured += 1;
    if (m.containment < FORK_THRESHOLD) {
      below.push({ containment: m.containment, tokens: m.tokens, fence: i + 1, tag: tagOf(f) });
    }
  }
  if (below.length) {
    // File-scoped, not fence-scoped. Two of design-shiny-ui's eight fences score
    // 0.83 and 0.86 — above any threshold that separates the populations — so
    // refusing only the fences that scored low would restore two fences of a
    // file known to be scrambled and hand a reviewer a partly-rewritten file
    // with nothing going red.
    //
    // The fence quoted is the one carrying the most disagreeing tokens, NOT the
    // lowest score. Those differ, and the lowest score is the weaker evidence:
    // design-shiny-ui's minimum is a 3-token fence at 0.00, which reads as noise
    // a reviewer would dismiss, while `(1 - containment) * tokens` surfaces a
    // 28-token fence at 0.04 — the same verdict with the argument attached.
    const evidence = below.reduce((a, b) =>
      (1 - b.containment) * b.tokens > (1 - a.containment) * a.tokens ? b : a);
    forks.push({
      file: t.relPath,
      n: divergent.length,
      reason: `${below.length} of ${measured} measured gated fence(s) below threshold; `
        + `worst evidence fence ${evidence.fence} [${evidence.tag}] at containment `
        + `${evidence.containment.toFixed(2)} over ${evidence.tokens} code token(s)`,
    });
    continue;
  }

  // Splice from the bottom so earlier indices stay valid.
  const lines = toLines(t.text);
  let restoredHere = 0;
  for (let i = translatedFences.length - 1; i >= 0; i--) {
    const f = translatedFences[i];
    if (!divergent.includes(f)) continue;
    const basisBody = basisFences[i].body;
    if (basisBody === f.body) continue;
    lines.splice(f.bodyStart, f.bodyEnd - f.bodyStart, ...basisBody.split('\n'));
    restoredHere++;
  }
  if (!restoredHere) continue;

  let repairedText = lines.join('\n');

  // #552: record which English revision these fences were verified against — but only when the
  // claim is true, on both counts that can make it false.
  //
  //   1. The repaired file must MIRROR THE BASIS at every gated fence. An earlier version of
  //      this tested "nothing gated is still divergent", which is a strictly weaker statement
  //      and the gap is reachable. `everEnglish` is the union of every revision, so that test
  //      proves each fence matches SOME revision while the stamp names ONE. The splice repairs
  //      only the divergent fences, so an untouched fence keeps whatever revision it came from:
  //      given English W=[A1,B1] and X=[A2,B2] and a mirror [localized, B1] whose source_commit
  //      was bumped to X without retranslation (the #405 shape), the repair yields [A2,B1] —
  //      X at one ordinal, W at the other — and the weaker test stamped X. That is a false
  //      claim at the moment of writing, invisible to the parity checker because every body
  //      does match some revision, and inherited by whatever reads the field next. Pinned by
  //      `scripts/test/fence-basis-stamp.test.js`, which fails against the weaker test.
  //   2. The basis must be a real revision. `basisLabel` is `worktree` whenever the fallback
  //      read English off disk, and the working tree is not a commit — the same distinction the
  //      report already refuses to blur ("labelled `worktree`, not a commit").
  //
  // Otherwise CLEAR the field. A file that still diverges must not keep a claim from an earlier,
  // then-complete verification: a stale claim reads as verified and is worse than no claim.
  // Clearing cannot destroy a TRUE claim here, because a file only reaches this point with a
  // gated fence that matched no revision at all, and English history only grows — so any
  // pre-existing stamp on it was already stale.
  const repairedFences = extractFences(repairedText);
  const stillDivergent = repairedFences.filter((f) => isGated(f) && !everEnglish.has(f.body)).length;
  // `mirrorsBasis` lives in `lib/fences.js` so this writer and `backfill-fence-basis.js` cannot
  // drift about what "verified" means. It used to be STRICTER than the pre-splice guards,
  // because those folded through a local `alignmentTag` that could not tell ```{r} from an
  // untagged fence; #674 gave the splice gate the same `foldedTagSequence`, so the asymmetry is
  // gone.
  //
  // Worth keeping the history: that asymmetry was WRITTEN DOWN here, accurately, and read as a
  // design note rather than as a bug for two issues. "Stricter than the pre-splice guards" is a
  // true sentence about a guard that writes being looser than the one that only stamps.
  //
  // The stamp needs the basis to be one the GATE can see, on both axes the gate checks:
  //
  //   - `stillDivergent === 0` — every gated BODY is in the walked pool;
  //   - `sequencePooled` — the folded SEQUENCE appears in some walked revision.
  //
  // Neither is implied by `mirrorsBasis`, because the pool comes from `git log --name-only` over
  // path-limited, history-simplified history that lists no paths for merges, while the basis
  // blob is resolved with `git cat-file --batch`, which answers for any object in the store.
  // Bodies and sequence are genuinely separate holes: a conflict-resolved merge can assemble
  // fences whose bodies each already exist in a parent into an ORDER or COUNT no single revision
  // ever had. Closing only the body axis left that case stamping a basis the gate immediately
  // reports as a false claim — measured, and pinned by the merge-reorder fixture in
  // `scripts/test/fence-basis-stamp.test.js`.
  const sequencePooled = compareTagSequence(
    foldedTagSequence(repairedFences), history.sequences.get(t.key),
  ) === null;
  let basisStamp = null;
  if (stillDivergent === 0 && sequencePooled && mirrorsBasis(repairedFences, basisFences)
      && basisLabel !== 'worktree') {
    const stamped = stampFrontmatterField(repairedText, FENCE_BASIS_FIELD, basisLabel);
    // `stamped` is null when the file has no `source_commit` to anchor beside. Repair the body
    // anyway and leave the field off, rather than guessing a nesting depth.
    if (stamped !== null) { repairedText = stamped; basisStamp = basisLabel; }
  } else {
    repairedText = clearFrontmatterField(repairedText, FENCE_BASIS_FIELD);
  }

  filesChanged++;
  fencesRestored += restoredHere;
  changedByLocale.set(t.locale, (changedByLocale.get(t.locale) || 0) + restoredHere);
  plan.push({
    path: t.path, relPath: t.relPath, text: repairedText, n: restoredHere,
    basisLabel, basisStamp, stillDivergent,
  });
}

// Validate `--tag` against what the scan actually saw, not against a hand-kept
// list of language names. A tag matching nothing would otherwise report
// "files to change: 0" — the clean-looking zero `--locale` already exists to
// prevent, arriving by typo. Checked after the scan because the accept-list is
// the scan's own output; checked before any write, so a mistyped batch cannot
// touch the corpus.
if (ONLY_TAGS !== null) {
  const unknown = [...ONLY_TAGS].filter((t) => !seenTags.has(t));
  if (unknown.length) {
    console.error(`ERROR: --tag matched no divergent fence: ${unknown.join(', ')}`);
    console.error('Nothing would be restored, and the run would report a clean-looking zero.');
    const available = [...seenTags.entries()].sort((a, b) => b[1] - a[1]);
    console.error(`Divergent tags present: ${available.map(([t, n]) => `${t}=${n}`).join('  ')}`);
    process.exit(2);
  }
}

if (!PREVIEW && plan.length) {
  // stderr, deliberately: every other line here goes to stdout, so `--write >
  // log.txt` would hide them all. A run that rewrites hundreds of corpus files
  // must leave a mark in the transcript no redirection can swallow.
  console.error(`WRITING ${plan.length} file(s) / ${fencesRestored} fence(s) under ${WRITE_SCOPE}/ ...`);
}

for (const p of plan) {
  // The provenance suffix says which of the three outcomes this file got, because they are not
  // distinguishable from the fence count: stamped (fully verified against a named revision),
  // still-divergent (claim withheld or cleared), or a worktree basis (repaired, but from bytes
  // that are not a commit, so there is nothing honest to record).
  // `stillDivergent` is tested BEFORE `basisStamp`, not after. A stamp and a non-zero divergence
  // count are mutually exclusive by the condition above, so reporting the stamp first would only
  // ever matter if that invariant broke — which is exactly when the operator needs to be told
  // the file still diverges rather than reassured it was signed.
  const provenance = p.stillDivergent
    ? `, no ${FENCE_BASIS_FIELD} (${p.stillDivergent} still divergent)`
    : p.basisStamp
      ? `, ${FENCE_BASIS_FIELD}=${p.basisStamp}`
      : p.basisLabel === 'worktree'
        ? `, no ${FENCE_BASIS_FIELD} (basis is not a commit)`
        : `, no ${FENCE_BASIS_FIELD} (mirrors more than one revision)`;
  console.log(`${PREVIEW ? 'would restore' : '   restoring'} ${String(p.n).padStart(2)} fence(s) in ${p.relPath}  (basis ${p.basisLabel}${provenance})`);
}

if (!PREVIEW) {
  for (const p of plan) writeFileSync(p.path, p.text, 'utf8');
}

console.log(`\n${PREVIEW ? 'PREVIEW — nothing written (pass --write to apply)' : 'Wrote changes'}`);
console.log(`basis: ${BASIS}`);
// Unconditional, and next to `basis`, because it describes the standard the run
// was made at rather than an event that happened during it. Inside the refusal
// block it was invisible exactly when it mattered most.
console.log(`fork threshold: ${FORK_THRESHOLD}${FORK_THRESHOLD === 0 ? '   *** DISABLED — step correspondence was NOT checked ***' : ''}`);
console.log(`files ${PREVIEW ? 'to change' : 'changed'}: ${filesChanged}`);
console.log(`fences ${PREVIEW ? 'to restore' : 'restored'}: ${fencesRestored}`);
if (changedByLocale.size) {
  console.log(`by locale: ${[...changedByLocale.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ')}`);
}
if (skipped.length) {
  console.log(`\n${skipped.length} file(s) skipped — ordinal mapping is not sound, repair by hand:`);
  for (const s of skipped) console.log(`  ${s.file}  (${s.n} divergent gated fence(s); ${s.reason})`);
}
if (forks.length) {
  console.log(`\n${forks.length} file(s) refused — the steps may not correspond (#498), repair by hand:`);
  for (const f of forks) console.log(`  ${f.file}  (${f.n} divergent gated fence(s); ${f.reason})`);
  console.log(`  threshold: containment < ${FORK_THRESHOLD} (--fork-threshold 0 disables)`);
}

// Never folded into a pass. Containment over an empty token set is vacuously 1,
// and reporting these as OK is how #503 hid 8 of its 86 fences behind an
// apparent "0 suspects". Most are fences that are entirely `#` comments — the
// separately-tracked #502 population — and unknown tags name a gap in
// `lib/code-tokens.js`, not a clean fence.
if (unmeasured.length) {
  const byReason = new Map();
  for (const u of unmeasured) byReason.set(u.reason, (byReason.get(u.reason) || 0) + 1);
  console.log(`\n${unmeasured.length} gated fence(s) could not be measured for step correspondence:`);
  console.log(`  ${[...byReason.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ')}`);
  // Splitting on the file's actual disposition rather than asserting one. The
  // flat claim "they are still restored" was false twice over: a fence in a
  // refused file is not restored at all, and a fence outside `--tag` scope was
  // never a candidate. A report that overstates what was written is the same
  // class of defect as the empty-token pass it sits next to.
  //
  // Both counts are FENCES, and the first version labelled them "in file(s)",
  // which reads as a file count. It also said "restored" unconditionally, four
  // lines under `PREVIEW — nothing written` — the same overstatement in a
  // narrower spelling, and the test asserted the wrong wording so it held.
  const forkedFiles = new Set(forks.map((f) => f.file));
  const inRefused = unmeasured.filter((u) => forkedFiles.has(u.file)).length;
  const inRepaired = unmeasured.length - inRefused;
  const restored = PREVIEW ? 'would be restored' : 'restored';
  console.log(`  ${inRepaired} fence(s) in file(s) this run repairs — unchecked for the #498 shape, and ${restored}`);
  console.log(`  ${inRefused} fence(s) in file(s) refused above — unchecked, and not restored`);
  console.log('  (a fence outside --tag scope is counted here but was never a restore candidate)');
}
