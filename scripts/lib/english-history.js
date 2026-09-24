/**
 * english-history.js — one walk over every revision of every English content file (#559).
 *
 * `buildEnglishFenceHistory` (fences.js) and `buildEnglishProseHistory` (translation-status.js)
 * each carried a verbatim copy of this: the `git log --name-only` spec walk, the `commit:path`
 * dedup, the `git cat-file --batch` positional parse, the `missing|ambiguous` skip, the
 * `offset += size + 1` advance, and the working-tree pass. They differed only in variable
 * names, the per-blob callback, and the failure policy.
 *
 * ## Why the duplication was worse than it looked
 *
 * The two copies had asymmetric COVERAGE, and the untested one is the strict-direction
 * consumer. Measured: deleting the `missing|ambiguous` skip from the translation-status copy
 * kills a test; deleting the identical line from the fences copy left the suite green.
 *
 * The asymmetry is not that the branch was unreachable in principle. It was already covered on
 * the prose side — `translation-status.test.js`'s `'a missing blob does not shift the batch
 * parser onto the wrong key'` builds a repo that deletes a skill, which is what makes
 * `git cat-file --batch` emit a `missing` header at all (it does so only for a spec naming a
 * path absent from its commit). The asymmetry is that NO fixture could drive the fences copy,
 * covered branch or not, because `buildEnglishFenceHistory()` took no `root` (below). Sharing
 * one walk is what gives the strict consumer the coverage the lenient one already had.
 *
 * That matters because of which way each consumer's errors point. In translation-status.js a
 * misparse shrinks a pool, so a scaffold shows novel lines and reads as translated — lenient.
 * In fences.js the same pool is a VIOLATION basis, so a misparse manufactures false fence
 * violations against real translations — strict. The copy that could do the more expensive
 * damage was the one no test could reach.
 *
 * ## Why it was untestable, which #559 does not name
 *
 * `buildEnglishFenceHistory()` took no `root` argument — it closed over module-level `ROOT`.
 * No test could point it at a fixture repo, so no test did. Taking `root` is the change that
 * makes the coverage possible; the extraction is what makes it shared.
 *
 * Zero package imports, deliberately: `fences.js` sits in the import closure of tooling that
 * runs in jobs without `npm ci`, and a walker is exactly the kind of module someone would
 * later reach for a YAML parser inside.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { CONTENT_TYPES } from './content-types.js';
import { contentKey, isExcludedId } from './content-paths.js';
import { catFileBatch, GIT_BUFFER } from './git-batch.js';

/**
 * Bounds `git cat-file --batch` stdout, which is the same bytes for every caller — the two
 * copies disagreed (2 GiB vs 512 MiB) for no reason either could state. Unified upward so
 * neither caller regresses. A truncation here silently produces a short pool, which is why
 * the ENOBUFS case below is surfaced by name rather than left to a status check.
 */
// Imported from `./git-batch.js` (#587) so the `git log` call below and the `cat-file`
// batch cannot drift to different ceilings again — which is precisely what happened between
// the walker and the normalizer after #559 declared the value unified.

/**
 * Every `<commit>:<path>` spec the walk will resolve: one per revision of each English content
 * file, deduplicated, with non-content paths dropped by `contentKey`.
 *
 * Exported so a test can assert what the walk ACTUALLY looks at. Without that, a test can only
 * rebuild the spec list itself and assert against its own copy — which proves the fixture emits
 * a `missing` header, not that the walker's stream contains one. Those come apart the moment
 * spec-building changes: filter deleted paths here and the `missing` branch goes dead while
 * every test stays green, because a deleted file's earlier revisions still arrive by their own
 * specs.
 *
 * `paths`, when given, replaces the tree-level pathspec with an explicit file list (#635). It is
 * threaded from the caller's already-collected targets rather than re-derived here, because a
 * second derivation of "which files are in scope" is the drift this module keeps closing.
 *
 * A narrowed pathspec is EQUAL OR STRICTER against the unscoped walk, never simply "equivalent".
 * That wording was in this docblock and was wrong twice (#682); both divergences erred in the
 * strict direction, which is the dangerous one — a false violation against a translation nobody
 * touched, on the command CLAUDE.md tells a contributor to run.
 *
 *   1. THE FLATTEN. `contentKey` maps `skills/<domain>/<id>/SKILL.md` onto today's `skills/<id>`
 *      on purpose, so a tree-level pathspec pooled the pre-flatten era — 863 path occurrences in
 *      this history — under the current key, and a file-level pathspec naming only the current
 *      path did not. Closed by `historicalPathspecs`, which supplies both shapes.
 *   2. MERGE SIMPLIFICATION. `git log -- <file>` does NOT list every commit touching that file:
 *      without `--full-history` a merge parent TREESAME for the pathspec is pruned, and one file
 *      is TREESAME far more often than four trees. Closed by passing `--full-history` on the
 *      narrowed walk only.
 *
 * With both closed the narrowed pool is a SUPERSET of what the tree walk yields for the covered
 * path shapes — see `historicalPathspecs`, whose coverage is a measured fact about this history
 * rather than a property of `contentKey`.
 *
 * "Superset therefore lenient" holds for the BODY pool and only for it. That pool is a Set and
 * the violation test is membership, so growth can only remove findings. `buildEnglishFenceHistory`
 * builds two more things from this same walk, and `compareTagSequence` is NOT monotone under
 * growth: a sequence absent from the pool with no count-matched revision is `unalignable` and
 * silent, while the same sequence with a count-matched revision present is a positional finding.
 * A revision that only `--full-history` reaches can therefore turn unjudged into a finding on a
 * file CI holds green.
 *
 * That is not #682's false accusation — the mirror genuinely matches no revision, so the scoped
 * finding is defensible and CI is the one under-reporting — but it is a real scoped-vs-unscoped
 * divergence in the finding direction, and the blanket "a scoped run can only ever be more
 * permissive" that stood here was false. Two paragraphs below, this same docblock documents the
 * collector's non-monotonicity under SHRINKAGE; asserting monotonicity under growth above it was
 * the contradiction a second review round caught.
 *
 * Renames remain, and are genuinely equivalent rather than merely tolerable: without `--follow`
 * the pre-rename revisions are absent here, and they are absent from the unscoped pool for this
 * key too, since they were keyed to the OLD path. That argument holds for an id rename and is
 * exactly what fails for the flatten, where the old path keys to the CURRENT id — which is how
 * divergence 1 hid behind a sentence that was true of its neighbour.
 *
 * @param {string} root repository root
 * @param {string[]|null} [paths] explicit English paths; null walks all four content trees
 * @returns {string[]} specs in `git log` order, newest commit first
 */
export function collectSpecs(root, paths = null) {
  // `[]` is not "no scope", and left alone it splits the walk in two directions at once: `[] ??
  // CONTENT_TYPES` keeps `[]`, so `git log` runs UNPATHED and pools all content history, while
  // the working-tree feed below iterates zero paths and feeds nothing. Unreachable from the gate
  // — its backstop guarantees at least one target — but this module's whole subject is two
  // answers to one question, so it refuses rather than picking one (#682).
  if (paths !== null && paths.length === 0) {
    throw new Error('collectSpecs: paths is empty. Pass null to walk every content tree; '
      + 'an empty list would pool all history and feed no working tree.');
  }
  const log = execFileSync(
    'git',
    [
      'log', '--format=%x00%H', '--name-only',
      // `--full-history` ONLY on the narrowed walk, and it is a correctness fix rather than a
      // completeness nicety (#682). Default history simplification prunes a merge parent that is
      // TREESAME *for the pathspec*, and TREESAME is far easier to satisfy for one file than for
      // four trees: a side branch that edits a fence and then reverts it, while changing anything
      // else, is TREESAME for that one file and is pruned entirely. Measured on a fixture — the
      // file pathspec pooled `{a=1}` where the tree pathspec pooled `{a=1, a=2}`.
      //
      // Direction matters. Without this the scoped pool is a strict SUBSET, so a mirror stale to
      // the pruned revision is clean corpus-wide and a violation under `--id` — a false
      // accusation. With it the scoped pool is every distinct blob of that path, hence a superset
      // of what the tree walk can produce, and for the BODY pool that makes the divergence
      // lenient. It does not for the tag-sequence pool, which is not monotone under growth — see
      // the module docblock. And CI is unchanged rather than all-seeing: it runs the same
      // corpus-wide walk it always did.
      //
      // Not applied to the unscoped walk, which would change the corpus verdict this PR pins as
      // byte-identical. That the two walks simplify differently is now a stated property, not an
      // assumed equivalence — see the docblock above.
      ...(paths === null ? [] : ['--full-history']),
      '--', ...(paths ?? CONTENT_TYPES),
    ],
    { cwd: root, encoding: 'utf8', maxBuffer: GIT_BUFFER },
  );

  const specs = [];
  const seen = new Set();
  let commit = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('\x00')) { commit = line.slice(1).trim(); continue; }
    if (!line || !commit || contentKey(line) === null) continue;
    const spec = `${commit}:${line}`;
    if (seen.has(spec)) continue;
    seen.add(spec);
    specs.push(spec);
  }
  return specs;
}

/**
 * Call `onBlob(key, text, meta)` for every revision of every English content file, then once
 * more per file for the working tree.
 *
 * The working-tree pass is last and deliberate: an uncommitted English edit is a legal basis
 * too, so a translation matching work-in-progress English is not a violation.
 *
 * ## Two known gaps, and why they cannot be "fixed" from one call site
 *
 * `git log` lists no paths for a merge commit and applies default history simplification, so a
 * body existing only as conflict-resolution output never enters the pool; and `--name-only`
 * without `--follow` loses pre-rename paths (harmless for the skills flatten, which
 * `contentKey` normalises, but not for an id rename).
 *
 * Both gaps SHRINK the pool. What a shrunk pool does then depends entirely on which collector
 * is reading it. Only five of the six sort into buckets — two tighten, two loosen, one is
 * untouched. The sixth goes BOTH ways, depending on which revision went missing:
 *
 *   - **fence bodies** (`buildEnglishFenceHistory`): the pool is a *violation* basis, so a
 *     missing revision manufactures a false violation against a real translation — strict.
 *   - **working-tree fences** (`history.current`): unaffected; that map is built from the
 *     working-tree pass, which no history gap can reach.
 *   - **prose lines** (`buildEnglishProseHistory.lines`): a scaffold shows novel lines and
 *     reads as translated — lenient.
 *   - **fence shapes** (`.fenceShapes`, #561): a legitimate shape goes missing, so a genuine
 *     translation drops out of the count into `unjudged` — strict, and this one silently
 *     removes real coverage rather than raising a flag someone reads.
 *   - **frozen-fence lines** (`.fenceLines`, #561 R2): frozen lines go missing, so content the
 *     mask later exposes reads as novel — lenient, the opposite of its neighbour.
 *   - **tag sequences** (`.sequences`, #481): BOTH, and which one depends on which revision went
 *     missing. `compareTagSequence` (`check-i18n-fence-parity.js`) first asks whether the
 *     translation's folded sequence appears in the pool at all; when it does not, the verdict
 *     turns on whether any SURVIVING revision carries the same fence count. So losing the
 *     revision that matched reads as a retag *whenever a same-count revision survives* — a false
 *     violation against a legitimate translation, strict. Losing the last count-matched revision
 *     instead yields `unalignable`, which is expressly not a finding, so a real retag is demoted
 *     to unjudged — lenient. A legitimate translation reaching that same path is demoted too,
 *     which is the silent coverage loss the `fenceShapes` row above describes rather than either
 *     direction. Three outcomes, two directions, one collector — which is why the list above is
 *     a list and not a tally: no count of "how many tighten" survives this member.
 *
 * Recorded measurement (`translation-status.js`, pre-extraction): adding `--diff-merges=separate`
 * changed the pool by 0 lines and the verdict set by 0 files. That was measured for the prose
 * side only — re-measure all six before changing the walk.
 *
 * ## Three PRODUCTION call sites reach this walk, not two
 *
 * Say production, and mean it: `rg walkEnglishHistory` returns a fourth,
 * `scripts/test/english-history.test.js`, which is deliberately excluded here because this
 * section is a re-measurement obligation and a test owes nothing to it. An unqualified "three"
 * is a count the obvious grep refutes — the same shape as the clause above this one.
 *
 * `buildEnglishProseHistory` (`translation-status.js`) and `buildEnglishFenceHistory`
 * (`fences.js`) are the production pair that own the six collectors above. The third is
 * `scripts/measure-tag-sequence-parity.js`, and it is deliberately NOT scoped out of this table
 * for being a measurement script: `fences.js` cites it as the reproducer for the tag-sequence
 * finding set, so a change to this walk that moves its numbers moves the evidence the gate was
 * tuned against. Since #612 it folds through `foldedTagSequence` and since #676 it classifies
 * through `compareTagSequence`, so both the fold and the triage are production's, and a walk
 * change moves the gate and the reproducer the same way.
 *
 * It still pools INLINE rather than calling `buildEnglishFenceHistory` — it needs the sequence
 * pool alone, and that builder also collects fence bodies and a HEAD snapshot it would discard.
 * So a change to THAT builder's own logic, as opposed to this walk's, still does not reach it,
 * and re-running this script alone cannot detect such a change: by that same sentence it
 * measures the unchanged pipeline. For that kind, run the gate and this script and diff their
 * finding sets — the agreement is what is being re-measured, and the gate must be run UNSCOPED
 * for it (#682).
 *
 * The per-count index this paragraph used to cite as the reason for pooling inline is gone.
 * `compareTagSequence` derives counts itself, which is what made the copy removable.
 *
 * Which leaves the inline pool carrying a load the efficiency argument above understates, and it
 * belongs on the record rather than in silence. Sharing the fold (#612) and then the triage
 * (#676) each retired a leg of a differential oracle, and the triage leg had a confirmed kill:
 * the hand copy is the "independent measurement of the same property [that] disagreed by exactly
 * 3" which caught `compareTagSequence` treating `''.split(',')` as a one-fence revision — a bug
 * no test saw. After #676 a fault in that classifier moves the gate and the reproducer
 * identically, so their finding-set diff can never surface one again; the regression tests in
 * `scripts/test/tag-sequence-parity.test.js` are now the only cover for that class, and they
 * cover the known bug rather than the next one. Pooling inline is what preserves the one
 * remaining channel — call `buildEnglishFenceHistory` here and the diff detects nothing at all.
 *
 * Run the gate UNSCOPED for that diff (#682). Since #635 a `--id` on the gate's command line
 * narrows its pathspec while `measure-tag-sequence-parity.js` keeps its own tree-level walk, so
 * a scoped diff can disagree for walk reasons rather than regression reasons — and the two
 * divergence classes named in `collectSpecs` are exactly where it would.
 *
 * There is deliberately no `trees` option. An earlier draft had one, defaulting to
 * `CONTENT_TYPES` and used by nobody — and it could not have worked, because `contentKey`
 * decides membership against `CONTENT_TYPES` regardless of what the option says. Passing
 * `{trees: ['docs']}` would have narrowed the `git log` pathspec and then filtered every
 * resulting path back out, walking nothing and reporting success. That is the guard-proxy shape
 * CLAUDE.md's `--tree` lesson already names: scope validated against a static list rather than
 * against what the run actually reached. An unused parameter that cannot be used correctly is
 * worse than no parameter.
 *
 * @param {string} root repository root
 * @param {(key: string, text: string, meta: {fromWorkingTree: boolean, path: string}) => void} onBlob
 * @param {object} [opts]
 * @param {string[]|null} [opts.paths] explicit English paths to walk; null walks all four trees
 */
export function walkEnglishHistory(root, onBlob, { paths = null } = {}) {
  const specs = collectSpecs(root, paths);

  // The parse moved to `scripts/lib/git-batch.js` (#587), because a third copy of it lived in
  // `normalize-i18n-fences.js` with a different buffer and a different failure policy — the
  // situation #559 believed it had ended. Absences are ignored here: this walker builds a pool
  // keyed by content, and a deleted path simply has no blob to contribute.
  catFileBatch(root, specs, (spec, text) => {
    if (text === null) return;
    const path = spec.slice(spec.indexOf(':') + 1);
    const key = contentKey(path);
    if (key !== null) onBlob(key, text, { fromWorkingTree: false, path });
  });

  // The working-tree feed is narrowed by the SAME set as the pathspec, so the pool is not
  // split-brained: HEAD's body for every file, history for a few.
  //
  // Honest scope of that claim, corrected after review (#682): it is behaviourally NEUTRAL
  // today. `current` — the map this feed populates in `buildEnglishFenceHistory` — has no
  // production consumer; the deleted-fence check that would read it is the acknowledged #480
  // gap, and the gate's own comment says so. Under `--id` the gate reads only scoped keys, which
  // get the working-tree feed either way. So this is the right invariant for a future #480 and
  // for any caller that reads `current`, not a fix for a live defect. The first version of this
  // comment justified it by a consumer that does not exist.
  if (paths !== null) {
    for (const rel of paths) {
      const key = contentKey(rel);
      if (key === null) continue;
      const path = join(root, rel);
      if (!existsSync(path) || !statSync(path).isFile()) continue;
      onBlob(key, readFileSync(path, 'utf8'), { fromWorkingTree: true, path: rel });
    }
    return;
  }

  for (const tree of CONTENT_TYPES) {
    const base = join(root, tree);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      // Through the predicate, never an inline `startsWith('_')` (#546). This guard shadows
      // the `contentKey` call eight lines below, and a shadow that can narrow independently
      // is how the two arms of this walk would come to disagree: git-log revisions carrying a
      // key the working tree omits is a PARTIAL basis, and a partial basis accuses only the
      // fences added since the last commit.
      if (isExcludedId(entry)) continue;
      const path = tree === 'skills' ? join(base, entry, 'SKILL.md') : join(base, entry);
      if (!existsSync(path) || !statSync(path).isFile()) continue;
      const rel = tree === 'skills' ? `${tree}/${entry}/SKILL.md` : `${tree}/${entry}`;
      const key = contentKey(rel);
      if (key === null) continue;
      onBlob(key, readFileSync(path, 'utf8'), { fromWorkingTree: true, path: rel });
    }
  }
}
