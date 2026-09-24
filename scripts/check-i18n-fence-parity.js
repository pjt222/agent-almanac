#!/usr/bin/env node
/**
 * check-i18n-fence-parity.js
 *
 * Enforces the keep-code-in-English rule for fenced code blocks in translated
 * content — skills, agents, teams and guides. `CLAUDE.md` § Translation Rules
 * and `i18n/README.md` both declare code blocks keep-in-English, and
 * `skills/translate-content/SKILL.md` step 5.3 even instructs the translator to
 * "diff the fenced blocks" — but nothing mechanical checked it, and the corpus
 * drifted (#472).
 *
 * That the rule was stated four times and still violated is the point: every
 * i18n commit in this repo postdates the commit that introduced step 5.3
 * (77006e7a, 2026-03-13), so every violation was produced under a procedure
 * that told the agent to verify exactly this. Prose does not enforce.
 *
 * ## What counts as a violation
 *
 * A fence body in a translated file is a violation when it appears in NO
 * revision of its English counterpart, ever.
 *
 * That basis is chosen to be immune to the two confounds that make the naive
 * comparison unusable:
 *
 *   - **Staleness.** 2,549 translations are stale repo-wide. A stale
 *     translation's fence legitimately matches an OLDER English source and
 *     diverges from HEAD without anybody having translated anything. Comparing
 *     against HEAD alone would report those as violations.
 *   - **`source_commit` bumps.** `evolve-skill` bumps `source_commit` without
 *     retranslating (#405), so the frontmatter's claimed basis can sit ahead of
 *     the real one. Anchoring to `source_commit` inherits that lie.
 *
 * Searching the whole history of the English file dodges both: staleness can
 * only ever make a fence match an *earlier* English revision, never a revision
 * that does not exist. So anything this reports was written by a human or an
 * agent and never existed in English. Measured false positives on the corpus at
 * introduction: 1 whitespace-only (under a per-line-trim reading) and 2
 * cross-skill artifacts out of 2,115 divergences — 0.14%.
 *
 * Consequence, stated deliberately: a fence matching an OLD English revision
 * passes. That is staleness, which is `check-translation-freshness.js`'s job,
 * not this gate's. The same deliberate choice means a translation that DELETES
 * a frozen fence is not caught here — see #480, and the comment at the end of
 * the compare loop for why the obvious fix reintroduces the confound.
 *
 * ## Why not the CJK discriminator
 *
 * #472 proposed flagging fences containing CJK characters absent from English.
 * That is sound but sees only 457 of 1,307 gated violations (35%) — it is
 * structurally blind to `de` and `es`, which contribute 648 between them, and
 * to reworded-ASCII violations in every locale. German is the largest violator
 * and transliterates umlauts inside fences (`pruefen`, `fuer`, `zaehlen`), so
 * even a Latin-diacritic test misses most of it.
 *
 * Usage:
 *   node scripts/check-i18n-fence-parity.js                    # fail on violation
 *   node scripts/check-i18n-fence-parity.js --warn             # report, exit 0
 *   node scripts/check-i18n-fence-parity.js --all              # include ungated tags
 *   node scripts/check-i18n-fence-parity.js --json             # machine-readable
 *   node scripts/check-i18n-fence-parity.js --limit N          # cap printed findings
 *   node scripts/check-i18n-fence-parity.js --locale de        # one locale
 *   node scripts/check-i18n-fence-parity.js --locale de --id X # one file
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { assertNotShallow } from './lib/git-freshness.js';
import {
  extractFences, buildEnglishFenceHistory, isGated, foldedTagSequence, compareTagSequence,
  isRetagEscape,
} from './lib/fences.js';
import { collectI18nTargets, validateScope, I18N_TREES } from './lib/i18n-targets.js';
import { FENCE_BASIS_FIELD, readFrontmatterField } from './lib/provenance.js';
import { CONTENT_TYPES } from './lib/content-types.js';
import { historicalPathspecs } from './lib/content-paths.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WARN_ONLY = process.argv.includes('--warn');
const SHOW_ALL = process.argv.includes('--all');
const AS_JSON = process.argv.includes('--json');

/**
 * Read `--flag value`, rejecting a following flag as the value. Bare
 * `--limit` with nothing after it used to yield `Number(undefined)` = NaN,
 * which made `slice(0, NaN)` print no findings AND suppressed the "N more"
 * hint, so the run looked clean.
 */
function flagValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) {
    console.error(`ERROR: ${name} requires a value`);
    process.exit(2);
  }
  return v;
}

/**
 * The repo to check. Defaults to this one, which is how every real invocation uses it.
 *
 * It exists as a flag because the gate was otherwise untestable end to end, and that gap was
 * not theoretical: deleting the blocking flag from the tag-sequence finding SURVIVED against the
 * whole suite, meaning every such finding could stop being blocking with 298 tests still green.
 * Three component-level mutation kills had been quoted as coverage for a path nothing executed.
 *
 * The flag is deliberately NOT quoted verbatim here. Spelling it out made this comment a second
 * match site for the very mutation it describes, and `mutation-check` refused the run rather than
 * guessing which site to mutate — the same collision the A10 envelope hit hours earlier, where
 * a comment quoting `find agents teams guides ...` doubled its own case.
 *
 * Third time this exact shape has appeared here — `buildEnglishFenceHistory()` closing over its
 * module root (#559), `gate-envelope.js` before `--root`, and now this. The rule it keeps
 * teaching: a module that hardcodes its own repo root cannot be tested, so it will not be.
 */
const ROOT = resolve(flagValue('--root', resolve(__dirname, '..')));
const I18N_DIR = resolve(ROOT, 'i18n');

const LIMIT = Number(flagValue('--limit', '40'));
if (!Number.isFinite(LIMIT)) { console.error('ERROR: --limit must be a number'); process.exit(2); }
const ONLY_LOCALE = flagValue('--locale', null);
const ONLY_ID = flagValue('--id', null);

/**
 * Translated content trees this gate covers. `skills` is where the corpus and
 * the violations are, but the rule as written in CLAUDE.md and i18n/README.md
 * says "any translated file" — and the mirrors carry 168 gated fences that a
 * skills-only walk never opens. Covering them is what makes the documented rule
 * true.
 *
 * The DIRECTORY LIST is derived from the SSOT (#578), so this gate and the English-history
 * side in `fences.js` cannot disagree about which trees exist. The nesting flag stays local
 * because it is a different fact — the layout of one tree, not the set of trees.
 *
 * `NESTING` is a record with a THROW, not a Set with a default. The first version used
 * `NESTED.has(dir)`, which is a silently-defaulting predicate: an unclassified tree gets
 * `false`, its entries are directories, they fail the `.endsWith('.md')` test in
 * `collectTargets`, and the tree contributes zero targets — so the gate prints OK having
 * scanned nothing. There is no per-tree zero-target guard to catch it. That is the
 * vacuous-pass shape this repo keeps paying for, and the comment claiming the opposite was
 * worse than the code.
 *
 * Throwing at module load means a fifth tree in the SSOT breaks every CI invocation of this
 * gate until someone declares its layout. Loud is the point.
 */
// The layout SSOT moved to `scripts/lib/i18n-targets.js` with the walk that consumes it, and
// keeps its throw-on-undeclared-tree behaviour there. Re-exported: `content-types-propagation`
// asserts this gate agrees with the SSOT about which trees exist, and that assertion is about
// the gate's view, not the lib's.
export const TREES = I18N_TREES;

/**
 * Every translated file to compare, as { relPath, absPath, locale, id, tree }.
 *
 * The walk itself moved to `scripts/lib/i18n-targets.js` (#552) so this gate, the fence
 * normalizer and the backfill cannot disagree about what the corpus IS. The copies had already
 * drifted on two points that decide whether a scoped run reporting zero is a pass or a bug.
 * `--id` stays here: it is this gate's debugging convenience, not a property of the corpus.
 */
export function collectTargets() {
  // `onlyId` narrows the WALK since #635, not only the filter below. The reached-sets are
  // unaffected — see `collectI18nTargets` for how an out-of-scope entry still proves them — so
  // `idsReached` is exact for the one membership question `validateScope` asks, and is simply a
  // singleton or empty rather than the whole corpus.
  const { targets, localesReached, treesReached } = collectI18nTargets({
    root: ROOT, onlyLocale: ONLY_LOCALE, onlyId: ONLY_ID,
  });

  // #634. Without this the gate answered a mistyped id with `OK: every gated code fence matches
  // an English source revision.` and exit 0 — technically true of the empty set, and the command
  // CLAUDE.md tells a contributor to run on the one file they just edited. Edit a fence, mistype
  // the id, see OK, commit.
  //
  // `idsReached` is built from `targets` BEFORE the filter below, so it answers what this run
  // actually reached rather than what exists on disk. That is also what makes a `--locale`/`--id`
  // pair which is individually valid but jointly empty refuse, with no third check: the id is not
  // among what that locale reached.
  //
  // The refusal covers `--locale` too, which this gate never validated at all. That reaches
  // `measure-tag-sequence-parity.js` as well, since it imports this function — see the header
  // above on module-scope flag parsing — and a mistyped locale there produced the same
  // clean-looking zero.
  const scopeErrors = validateScope({
    onlyLocale: ONLY_LOCALE,
    onlyTrees: null,
    onlyId: ONLY_ID,
    localesReached,
    treesReached,
    idsReached: new Set(targets.map((t) => t.id)),
  });
  if (scopeErrors.length) {
    for (const line of scopeErrors) console.error(line);
    // 2, not 1, so a refusal is distinguishable from a finding. Same split as `usageExit`.
    //
    // The converse does NOT hold and must not be scripted on: `assertNotShallow` exits 1 for a
    // refusal too, one call above this in `main()`. That is deliberate and CLAUDE.md argues for
    // it — a warn-only caller that cannot measure at all should not warn less, it should stop.
    // So 2 always means refusal; 1 means findings OR a shallow clone.
    process.exit(2);
  }

  const scoped = targets.filter((t) => !ONLY_ID || t.id === ONLY_ID);

  // Belt-and-braces behind `validateScope`, copied in intent from `backfill-fence-basis.js`.
  // That guard answers "is each flag reachable"; this answers "did this run actually reach
  // anything", and the two come apart the moment a scope flag changes what the WALK collects
  // rather than what the filter keeps.
  //
  // Unreachable today: a reached id implies at least one target, so `validateScope` refuses
  // first. It is here for #635, which narrows the walk itself — after that, any bug in the
  // narrowing that yields zero targets for a legitimate scope fails closed instead of printing
  // `OK: every gated code fence matches an English source revision.` over nothing. A guard added
  // after the flag that needs it is a guard written by the incident.
  if (scoped.length === 0) {
    console.error('ERROR: this scope selected no translated files. Nothing would be compared.');
    console.error(`Reachable locales: ${[...localesReached].sort().join(', ') || '(none)'}`);
    process.exit(2);
  }

  return scoped;
}

// `compareTagSequence` moved to `scripts/lib/fences.js` (#552 backfill). Two reasons, and the
// second is the load-bearing one:
//
//   - the normalizer must consult it before it may stamp `fence_basis_commit`, and two copies
//     of the retag test would be the drift this schema exists to end;
//   - THIS MODULE CANNOT BE IMPORTED AS A LIBRARY. `flagValue('--root'|'--limit'|'--locale'|
//     '--id')` runs at module scope against the IMPORTER's argv, so a consumer whose own
//     command line carries `--locale` (or any of them) has its flags silently reinterpreted,
//     and one carrying a value-less form exits 2 during the import. A predicate every writer
//     needs cannot live behind that.
//
// Re-exported so the gate's own callers and `scripts/test/tag-sequence-parity.test.js` keep
// their import path.
export { compareTagSequence };

/**
 * Every `kind` a finding from this gate can carry, emitted in `--json` so a consumer can validate
 * its own configuration against the producer's vocabulary rather than against a copy of it.
 *
 * The reason it exists is `debt-ratchet.yml` (#591), which names the kinds it ratchets. A typo
 * there — `tag-drfit` — would select zero findings, compare an empty observed set against an
 * empty declared set, and report a clean ratchet forever: the vacuous pass this repo keeps
 * paying for, in the one file whose whole job is to make a silent gate loud. Membership in the
 * producer's own accept-list is the fix; `existsSync`-style proxies are what the rule warns off.
 *
 * It does NOT catch a check being deleted outright — the kind would still be declared here while
 * nothing emits it. That is what the `gate-envelope` case in `scripts/envelopes/` is for: retag a
 * frozen fence in a file no member list names, and the ratchet must go red.
 */
export const FINDING_KINDS = ['diverged', 'tag-sequence', 'tag-drift', 'stale-basis-claim'];

/**
 * Report fields that answer "how much corpus did this run actually walk?", published for the same
 * reason as `FINDING_KINDS`.
 *
 * A consumer needs one of these to tell a clean corpus from a walk that saw nothing, and every
 * OTHER numeric field in the report is a finding count — which is near zero when things are
 * healthy, so naming one as the scanned field turns an anti-vacuity floor into a floor that any
 * healthy run fails and any vacuous run passes. Validating "is it a number" cannot separate the
 * two: that is the proxy-predicate shape, where the guard tests something adjacent to the rule
 * the consumer needs.
 */
export const SCANNED_FIELDS = ['filesCompared', 'fencesCompared'];

function main() {
  assertNotShallow(ROOT);

  // Scope BEFORE the history walk (#634). `collectTargets` refuses an empty scope, and making a
  // contributor wait out a full-corpus `git log` to be told they mistyped an id is a worse
  // version of the same message. The walk is still corpus-wide — `--id` scopes the comparison,
  // not the history, which is #635.
  const targets = collectTargets();

  // #635, second half: the pathspec is THREADED from the targets just collected, never
  // re-derived. A second answer to "which English files are in scope" is the drift this repo
  // keeps paying for, and the reorder #634 made — scope before walk — is what makes threading
  // possible at all.
  //
  // NOT sound because "`git log -- <file>` lists every commit touching that file" — that
  // sentence stood here, is false, and is why `collectSpecs` passes `--full-history` on the
  // narrowed walk (#682). Read that function's docblock for the two divergence classes and for
  // what the resulting pool actually guarantees. The failure this could have introduced is
  // the opposite of a missed finding: a truncated pool turns a legitimately STALE mirror into a
  // violation, since staleness immunity is "matches SOME English revision". That is what the
  // fixture in `scripts/test/fence-parity-scope-guard.test.js` pins, on a stale-but-valid mirror
  // rather than a clean one — a clean file passes under a broken pool too.
  // `historicalPathspecs`, not `t.englishRel` alone: `contentKey` maps the pre-flatten
  // `skills/<domain>/<id>/SKILL.md` onto today's key, and a file-level pathspec that names only
  // the current path drops that whole era from the pool (#682). See the function's docblock for
  // why the alias list lives beside `contentKey` rather than here.
  const historyPaths = ONLY_ID
    ? [...new Set(targets.flatMap((t) => historicalPathspecs(t.englishRel)))]
    : null;
  const history = buildEnglishFenceHistory(ROOT, { paths: historyPaths });
  const findings = [];
  let filesCompared = 0;
  let fencesCompared = 0;
  let ungatedDivergences = 0;
  let tagSequenceUnalignable = 0;
  let tagSequenceDrift = 0;
  let staleBasisClaims = 0;

  for (const t of targets) {
    const englishFences = history.get(`${t.tree}/${t.id}`);
    if (!englishFences) continue; // orphan: check-i18n-frontmatter-parity.js owns that

    filesCompared++;
    const text = readFileSync(t.absPath, 'utf8');
    const translatedFences = extractFences(text);

    // #552: `fence_basis_commit` is READ here and never consulted before a comparison. The byte
    // check below stays unconditional — a field that could suppress it would be a bypass, and
    // the mutation guarding this design (hand-edit a fence body, leave the field alone) has to
    // stay red. What the field adds is the one thing bytes alone cannot say: whether the file
    // CLAIMS to have been verified against a named English revision. A claim plus a divergence
    // is a false claim, and it is strictly worse than no claim, because the next tool to read
    // the frontmatter believes it.
    const claimedBasis = readFrontmatterField(text, FENCE_BASIS_FIELD);
    let divergedHere = 0;

    // #481: the retag escape. `isGated` reads the info string off the TRANSLATION, so retagging
    // a frozen ```yaml fence to ```text removes it from the loop below entirely — the set of
    // fences under the gate is chosen by the file being gated. Default-deny narrowed that escape
    // to {text, markdown, md} without closing it, and #583 records that the status detector's
    // accidental tripwire for the same escape was removed in #582, leaving this the only cover.
    //
    // Staleness-immune by the same construction as the body check: the sequence must match SOME
    // English revision, never HEAD. A stale translation legitimately carries an older sequence.
    //
    // Count-mismatched pairs are NOT violations. With a different number of fences there is no
    // positional correspondence to claim anything about, and a translation predating a fence
    // English later gained lands here — calling that a violation reintroduces exactly the
    // staleness confound this gate exists to avoid.
    const seqVerdict = compareTagSequence(
      foldedTagSequence(translatedFences), history.sequences.get(`${t.tree}/${t.id}`),
    );
    if (seqVerdict?.unalignable) {
      tagSequenceUnalignable++;
    } else if (seqVerdict) {
      // #598: the nine findings this check shipped with were two populations wearing one label,
      // and the label is what made them unratchetable. `isRetagEscape` splits them — see its
      // comment in `lib/fences.js` for why the test is asymmetric rather than `a !== b`.
      //
      // Only the escape blocks. Drift is reported as its own non-blocking class, the way
      // `unalignable` already is, and the reasoning is recorded on #598. Its DETECTION is
      // structural and lives only here — the body check is set membership over every body the
      // English file has ever carried, so a fence at the wrong ordinal still passes it. Its
      // REMEDY does not live here and varies by member: 4 of the 6 are stale and want
      // retranslation, which `check-translation-freshness.js` owns and already reports on them;
      // 2 are fresh files needing a section moved (#626). Blocking on a class this gate can
      // neither fix nor route would be failing a build over someone else's work.
      //
      // Non-blocking is not unwatched: both kinds are members of the debt ratchet
      // (`debt-ratchet.yml`, #591), which fails on any file entering EITHER class. That is what
      // keeps "not this gate's business" from meaning "free to grow".
      const escape = isRetagEscape(seqVerdict.positions);
      if (!escape) tagSequenceDrift++;
      findings.push({
        file: t.relPath,
        line: translatedFences[seqVerdict.positions[0].index - 1]?.line ?? 1,
        locale: t.locale,
        skill: t.id,
        tag: seqVerdict.positions.map((p) => `#${p.index} ${p.english}->${p.translated}`).join(', '),
        gated: escape,
        kind: escape ? 'tag-sequence' : 'tag-drift',
        firstDivergentLine: escape
          ? `fence tag sequence appears in no English revision — a frozen tag became localisable (${seqVerdict.positions.length} position(s) differ)`
          : `fence tag sequence appears in no English revision; every position stays frozen (${seqVerdict.positions.length} position(s) differ)`,
      });
    }

    for (const fence of translatedFences) {
      fencesCompared++;
      if (englishFences.has(fence.body)) continue;
      const gated = isGated(fence);
      if (gated) divergedHere++;
      if (!gated) { ungatedDivergences++; if (!SHOW_ALL) continue; }
      findings.push({
        file: t.relPath,
        line: fence.line,
        locale: t.locale,
        skill: t.id,
        tag: fence.lang || '(untagged)',
        gated,
        kind: 'diverged',
        firstDivergentLine: (fence.body.split('\n').find((l) => l.trim() !== '') || '').trim().slice(0, 100),
      });
    }

    // A translation that DELETES a frozen fence outright contributes nothing to
    // the loop above, so it reports clean. That gap is real and tracked in #480
    // — but it is NOT fixable by comparing against current English, which is
    // what a first attempt did here. A stale translation legitimately lacks
    // fences English gained after it was written, so that comparison
    // reintroduces exactly the staleness confound this gate exists to avoid:
    // measured, it produced 1,518 findings across 402 files, topped by four
    // `quick-reference.md` mirrors that `check-translation-freshness.js`
    // independently reports as stale. Any fix must be staleness-immune the way
    // the divergence check is.

    // The false claim (#552). Reported as its own kind rather than folded into the divergence
    // count, because it accuses the FRONTMATTER, not the body: the bytes are already flagged
    // above, and what this adds is that the file also asserts they were checked. Not gated —
    // it cannot make a run fail that the underlying divergence did not already fail — so it
    // can never be the reason a corpus goes red, only the reason someone stops trusting a
    // field. Absence of the field is silent by design: absent means unverified, which is the
    // honest state for every file predating this schema.
    // A claim is contradicted by a divergent BODY or by a divergent STRUCTURE. Counting only
    // bodies left the retag escape (#481) invisible to this detector: retag a frozen `yaml`
    // fence to `text` and localise it, and the body check sees only an UNGATED divergence — so
    // `divergedHere` stays 0 — while the tag-sequence check files a gated finding. The run
    // still fails on that finding, so the "cannot fail a run the divergence did not already
    // fail" invariant holds either way; what the narrower predicate lost was the ability to say
    // the frontmatter is lying, in precisely the case the escape was invented to hide.
    //
    // `unalignable` contradicts a CLAIM even though it is not a violation, and the two questions
    // are genuinely different. As a violation it is rightly silent: without a count-matched
    // revision there is no positional correspondence, and a stale translation predating a fence
    // English later gained lands here. But run the claim question contrapositively — a true
    // claim means these fences were verified against revision X, so the file's fence count
    // equals X's count, so SOME revision has that count, so the file is alignable. Therefore
    // `claimedBasis && unalignable` is a false claim, and unlike the violation question it
    // carries no staleness confound: the claim is supposed to be current by construction.
    // It is also the only place this schema can see the #480 deletion gap on a claimed file,
    // since deleting a frozen fence usually changes the count.
    // Deliberately `Boolean(seqVerdict)`, NOT `seqVerdict && f.gated`. The #598 split changed
    // which structural mismatches BLOCK; it must not change which ones falsify a claim, and the
    // two questions have different answers. `mirrorsBasis` requires the exact folded sequence, so
    // a drift mismatch means the file cannot mirror the revision it names — the claim is false
    // whether or not the mismatch freed a fence from the gate. Narrowing this to escapes would
    // silently un-flag the very files #598 catalogued as partial updates.
    const structureContradicts = Boolean(seqVerdict);
    if (claimedBasis && (divergedHere > 0 || structureContradicts)) {
      staleBasisClaims++;
      const because = divergedHere > 0
        ? `${divergedHere} gated fence(s) match no English revision`
        : seqVerdict.unalignable
          ? 'no English revision has its fence count, so the fences cannot be the claimed ones'
          : 'its fence tag sequence appears in no English revision';
      findings.push({
        file: t.relPath,
        line: 1,
        locale: t.locale,
        skill: t.id,
        tag: FENCE_BASIS_FIELD,
        gated: false,
        kind: 'stale-basis-claim',
        firstDivergentLine: `frontmatter claims ${FENCE_BASIS_FIELD}: ${claimedBasis}, but ${because}`,
      });
    }
  }

  const blocking = findings.filter((f) => f.gated);

  if (AS_JSON) {
    // process.exit() discards writes still queued on an async pipe, which
    // truncated this payload to 65,536 bytes whenever stdout was piped rather
    // than redirected — the exact consumer this mode exists for.
    console.log(JSON.stringify({
      filesCompared, fencesCompared,
      kinds: FINDING_KINDS,
      scannedFields: SCANNED_FIELDS,
      violations: blocking.length,
      ungatedDivergences,
      // `tagSequenceFindings` keeps its meaning — the BLOCKING structural findings — because the
      // #598 split moved drift out of that population rather than renaming it. Drift gets its own
      // field so the two are never re-added into one number by a consumer.
      tagSequenceFindings: findings.filter((f) => f.kind === 'tag-sequence').length,
      tagSequenceDrift,
      tagSequenceUnalignable,
      staleBasisClaims,
      findings,
    }, null, 2));
    process.exitCode = blocking.length > 0 && !WARN_ONLY ? 1 : 0;
    return;
  }

  const label = WARN_ONLY ? 'WARN' : 'FAIL';
  for (const f of findings.slice(0, LIMIT)) {
    const kind = f.gated ? label : 'INFO';
    console.log(`${kind} ${f.file}:${f.line} [${f.tag}] ${f.firstDivergentLine}`);
  }
  if (findings.length > LIMIT) {
    console.log(`... ${findings.length - LIMIT} more (use --limit ${findings.length} to see all, or --json)`);
  }

  const tagSeq = blocking.filter((f) => f.kind === 'tag-sequence');
  const byTag = new Map();
  for (const f of blocking.filter((f) => f.kind !== 'tag-sequence')) byTag.set(f.tag, (byTag.get(f.tag) || 0) + 1);
  const byLocale = new Map();
  for (const f of blocking) byLocale.set(f.locale, (byLocale.get(f.locale) || 0) + 1);

  console.log(`\ni18n fence parity: ${fencesCompared} fences in ${filesCompared} translated skills`);
  console.log(`compared against every historical revision of their English source.`);

  if (blocking.length === 0) {
    console.log('OK: every gated code fence matches an English source revision.');
  } else {
    const files = new Set(blocking.map((f) => f.file)).size;
    console.log(`\n${blocking.length} gated-fence violation(s) across ${files} file(s).`);
    console.log(`by tag:    ${[...byTag.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ')}`);
    console.log(`by locale: ${[...byLocale.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ')}`);
    console.log('\nFix: restore the English fence body verbatim. Code blocks are keep-in-English');
    console.log('(CLAUDE.md § Translation Rules, i18n/README.md). Translate the surrounding prose only.');
  }
  if (tagSeq.length) {
    // Reported apart from body divergences because the remedy differs: a body divergence is
    // repaired by restoring the English text, a tag-sequence finding by restoring the fence
    // STRUCTURE — and the two most common causes need different judgement. Measured at
    // introduction across 3,584 count-matched pairs: 9 findings, of which 3 were a frozen tag
    // becoming localisable (the #481 escape proper, and in `escalate-issues` caused by a
    // 4-backtick opener degraded to 3, which swallows the next fence whole) and 6 were not.
    // Read the file before repairing it — the 6 were catalogued as partial-update drift and
    // 2 of them turned out to be fresh files with a misplaced section instead (#626). #598
    // turned that hand triage into the mechanical split below, so this block now lists the
    // 3-class only; the 6-class prints under "tag-DRIFT" and does not block.
    console.log(`\n${tagSeq.length} fence tag-sequence finding(s) — a structure appearing in NO English revision.`);
    console.log('These are the retag escape (#481): a frozen tag changed to text/markdown/md leaves');
    console.log('the body check entirely, because gating is read off the translated file.');
    for (const f of tagSeq.slice(0, LIMIT)) console.log(`  ${f.file}  ${f.tag}`);
    if (tagSeq.length > LIMIT) console.log(`  ... ${tagSeq.length - LIMIT} more`);
  }
  const drift = findings.filter((f) => f.kind === 'tag-drift');
  if (drift.length) {
    // Reported apart from the escapes above and NOT counted as violations (#598). Every position
    // stays frozen, so no fence left the body check and nothing here is invisible to it. The
    // CAUSE varies — a partial update on a stale file, or a section placed at the wrong ordinal
    // in a fresh one — which is why the message names both rather than prescribing one remedy.
    // Listed rather than merely counted because a ratcheted class whose members nobody can read
    // is the failure mode #591 warns about.
    console.log(`\n${drift.length} fence tag-DRIFT finding(s) — structure diverges, but every tag stays frozen.`);
    console.log('Not violations: no fence left the gate, so the body check still covers all of them.');
    console.log('Read each one: a stale file wants retranslation, a fresh one wants its structure fixed.');
    for (const f of drift.slice(0, LIMIT)) console.log(`  ${f.file}  ${f.tag}`);
    if (drift.length > LIMIT) console.log(`  ... ${drift.length - LIMIT} more`);
  }
  if (tagSequenceUnalignable) {
    // Deliberately not a finding. No English revision has that fence COUNT, so there is no
    // positional correspondence to make a claim about; a stale translation predating a fence
    // English later gained lands here. Counting them keeps the omission visible rather than
    // silent — the population is unmeasured otherwise.
    console.log(`\n${tagSequenceUnalignable} file(s) unjudged for tag sequence — no English revision has their fence count.`);
    console.log('Not violations: without a count match there is no position to compare (staleness, #481).');
  }
  if (ungatedDivergences) {
    // Deliberately does NOT say "untagged": untagged fences are frozen under
    // default-deny, so an untagged divergence prints FAIL and is counted above.
    console.log(`\n${ungatedDivergences} divergence(s) in localisable tags (text/markdown/md) — localising those is allowed.`);
    if (!SHOW_ALL) console.log('Use --all to list them.');
  }
  if (staleBasisClaims) {
    // Ungated on purpose: the divergence underneath each of these is already counted above, so
    // gating them would double-count the same file and could not change any verdict. The value
    // is that the frontmatter is now known to be lying — a `fence_basis_commit` present on a
    // file whose fences diverge. Repairing the body clears it automatically; if the body is
    // legitimately divergent, the field should be removed instead.
    console.log(`\n${staleBasisClaims} file(s) claim a ${FENCE_BASIS_FIELD} their fences contradict (#552).`);
    console.log('Absence of the field is not a finding — absent means unverified, which is honest.');
  }

  process.exit(blocking.length > 0 && !WARN_ONLY ? 1 : 0);
}

// Guarded so the module can be IMPORTED by a test without running the gate. Without this,
// importing to check anything executes the whole walk — which is why the fifth-tree check
// was a regex over source text, asserting token presence rather than behaviour. The pattern
// matches check-readme-translation-parity.js, and it is what dependency-free.test.js relies on.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
