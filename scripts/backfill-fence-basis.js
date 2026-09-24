#!/usr/bin/env node
/**
 * backfill-fence-basis.js — write `fence_basis_commit` onto every translation that can prove it
 * (#552, the second half).
 *
 * ## What it writes, and why to so few files
 *
 * The field means: *the English revision this file's frozen fence bodies were verified against.*
 * A backfill that wrote it everywhere would write a false claim into every file that cannot
 * prove one — the disagreement-between-files failure the schema exists to end. So this verifies
 * before it writes, file by file, and leaves the field ABSENT wherever it cannot.
 *
 * The candidate value is the file's own `source_commit`, the only revision the file itself
 * names. A file earns the stamp when, against the blob at that commit:
 *
 *   1. English history exists for the id at all (not an orphan);
 *   2. `<source_commit>:<englishRel>` resolves to a real object;
 *   3. `mirrorsBasis` — same fence count, same folded tag sequence, every GATED body byte-equal
 *      at its ordinal. Shared with `normalize-i18n-fences.js`, which consults the same predicate
 *      before it may stamp, so the two writers cannot disagree about what "verified" means;
 *   4. every gated BODY is in the walked English pool;
 *   5. the folded SEQUENCE is in the walked pool too.
 *
 * (4) and (5) look redundant against (3) and are not. The pool comes from `git log --name-only`
 * over path-limited, history-simplified history that lists no paths for merges, while the basis
 * blob is resolved with `git cat-file --batch`, which answers for any object in the store. They
 * are also two separate holes: a conflict-resolved merge can assemble bodies that each exist in
 * a parent into an order no revision ever had. Stamping either would sign a claim the parity
 * gate contradicts on its next run.
 *
 * ## Add-only, and never a second value
 *
 * This tool never clears and never overwrites. Clearing is the normalizer's job, because only
 * the normalizer knows it just changed the bytes. A file already carrying the field is skipped
 * whatever its value — the scaffolders write it at birth, and silently rewriting their claim
 * would make this tool a second, invisible author of a fact it did not establish.
 *
 * ## Why the vacuous case IS stamped
 *
 * A file with no gated fences passes (3) trivially, and that is deliberate. The scaffolders
 * already stamp unconditionally, so withholding here would make two byte-identical zero-gated
 * files disagree on the field purely by age. Nor is the claim empty: fence count and folded tag
 * sequence are verified, so a later retag or fence deletion contradicts it and the gate's
 * `stale-basis-claim` says so.
 *
 * ## What it deliberately does NOT do
 *
 * It does not search history for a revision a file *does* mirror. Measured at introduction, 198
 * files are clean — every gated body pooled — yet fail to mirror the commit they name, which is
 * the `evolve-*` `source_commit` bump (#616) visible in the data. Deferred, not abandoned: when
 * #616 stops the bump and repairs the values, a re-run stamps them. The field accretes from
 * three writers, so nothing here is one-shot, and this tool is idempotent by construction.
 *
 * Usage:
 *   node scripts/backfill-fence-basis.js                        # PREVIEW, writes nothing
 *   node scripts/backfill-fence-basis.js --write
 *   node scripts/backfill-fence-basis.js --locale de
 *   node scripts/backfill-fence-basis.js --tree skills,guides
 *   node scripts/backfill-fence-basis.js --json
 *   node scripts/backfill-fence-basis.js --verify --base <sha> [--head <sha>]  # audit a diff
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

import {
  extractFences, buildEnglishFenceHistory, isGated, foldedTagSequence,
  compareTagSequence, mirrorsBasis,
} from './lib/fences.js';
import { collectI18nTargets, validateScope } from './lib/i18n-targets.js';
import { assertNotShallow } from './lib/git-freshness.js';
import { auditYaml } from './lib/frontmatter-audit.js';
import {
  SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD,
  readFrontmatterField, stampFrontmatterField,
} from './lib/provenance.js';
import { parseArgs as sharedParseArgs, usageExit } from './lib/parse-args.js';
import { catFileBatch, GIT_BUFFER } from './lib/git-batch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// GIT_BUFFER comes from `./lib/git-batch.js` (#587). It is used here for a plain `git` call
// rather than the batch parse, but two ceilings under one name in one repo is the state #559
// set out to end and did not reach.

// ---- flags ----------------------------------------------------------------
//
// Strict, and value-taking flags are excused BY POSITION rather than by shape. Excusing
// "anything not starting with --" would also swallow a typo like `wirte`, which is the
// silent-misparse class `generate-translation-status.js` records paying for.

const ARG_SPEC = {
  bool: ['--write', '--json', '--verify'],
  value: ['--locale', '--tree', '--root', '--base', '--head'],
};

// Shared parser (#619). The local one matched whole tokens only, so `--locale=de` exited 2 as
// `unknown argument: --locale=de` while `Known flags:` listed `--locale` on the next line --
// the same shape #619 fixed in generate-translation-status.js, surviving here because the
// inventory that was supposed to name the stragglers had missed this file.
function parseArgs(argv) {
  const parsed = sharedParseArgs(argv, ARG_SPEC, usageExit(ARG_SPEC));
  // `--tree` is a comma list here, unlike the plain string it is elsewhere, so the split stays
  // at the call site rather than becoming a special case inside a parser shared by six scripts.
  const opts = { ...parsed, trees: parsed.tree === null ? null : new Set(parsed.tree.split(',').map((s) => s.trim()).filter(Boolean)) };
  delete opts.tree;
  if (opts.trees !== null && opts.trees.size === 0) {
    console.error('ERROR: --tree requires at least one tree name');
    process.exit(2);
  }
  if (opts.verify && !opts.base) {
    console.error('ERROR: --verify requires --base <ref> to reconstruct against');
    process.exit(2);
  }
  if (opts.verify && opts.write) {
    console.error('ERROR: --verify audits a landed diff; it cannot be combined with --write');
    process.exit(2);
  }
  return opts;
}

const OPTS = parseArgs(process.argv.slice(2));
const ROOT = resolve(OPTS.root ?? resolve(__dirname, '..'));
const PREVIEW = !OPTS.write;

function git(args, { input } = {}) {
  const r = spawnSync('git', args, {
    cwd: ROOT, encoding: input ? undefined : 'utf8', input, maxBuffer: GIT_BUFFER,
  });
  return r;
}

// `auditYaml` lives in `lib/frontmatter-audit.js` — it is a fact about where the provenance field
// sits, and putting it here would have made this script a library nobody can import: its
// whole body runs at module load (measured: 91 seconds and a full corpus walk), which is the
// exact un-importability this PR criticised in `check-i18n-fence-parity.js`.

// ---- --verify: reconstruct the diff rather than read it -------------------
//
// The total check that replaces reading 3,415 files. For every path the commit range touched,
// take the file as it was at <base>, apply the SAME stamp this tool would apply, and require
// byte equality with the file at HEAD. One equality proves the whole diff shape at once: only
// the field was added, its value is that file's own `source_commit`, nothing else moved.
//
// Reads git BLOBS at two named refs, never the working tree, so a dirty checkout cannot make a
// bad diff look good.

if (OPTS.verify) {
  // `--head` defaults to HEAD but must be settable, because the commit being audited is rarely
  // the branch tip by the time anyone audits it. Hardcoding HEAD made the documented audit
  // command fail the moment a docs commit landed on top: the range then contains paths outside
  // `i18n/`, which this loop correctly rejects, and the failure reads as corpus corruption
  // rather than as the wrong range. An audit that only works for one commit-shaped moment is
  // the "verification nobody can run" this mode already had to be rescued from once.
  const HEAD_REF = OPTS.head ?? 'HEAD';
  const names = git(['diff', '--name-only', `${OPTS.base}..${HEAD_REF}`]);
  if (names.status !== 0) {
    console.error(`ERROR: git diff ${OPTS.base}..${HEAD_REF} failed:\n${names.stderr}`);
    process.exit(2);
  }
  const changed = names.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  const problems = [];
  let checked = 0;

  // Two batched `cat-file` reads, not two `git show` per file. The naive form spawns 2N git
  // processes — at corpus scale that is ~6,800 spawns and the audit does not finish, which
  // makes it a verification nobody runs. `readBlobs` is a hoisted function declaration, so
  // calling it above its definition is deliberate rather than accidental.
  const beforeBlobs = readBlobs(changed.map((rel) => `${OPTS.base}:${rel}`));
  const afterBlobs = readBlobs(changed.map((rel) => `${HEAD_REF}:${rel}`));

  for (const rel of changed) {
    if (!rel.startsWith('i18n/')) { problems.push(`${rel}: outside i18n/`); continue; }
    const before = beforeBlobs.get(`${OPTS.base}:${rel}`);
    const after = afterBlobs.get(`${HEAD_REF}:${rel}`);
    if (before === undefined || after === undefined) { problems.push(`${rel}: added or deleted, not modified`); continue; }
    const sc = readFrontmatterField(before, SOURCE_COMMIT_FIELD);
    if (!sc) { problems.push(`${rel}: no source_commit at base, so no value was derivable`); continue; }
    const expected = stampFrontmatterField(before, FENCE_BASIS_FIELD, sc);
    if (expected === null) { problems.push(`${rel}: not stampable at base`); continue; }
    if (expected !== after) { problems.push(`${rel}: ${HEAD_REF} is not base+stamp — something else changed`); continue; }

    // Second, INDEPENDENT instrument. The reconstruction above shares `stampFrontmatterField`
    // with the writer, so a deterministic defect in that transform corrupts both sides
    // identically and verifies green — the `$'`-splice class it has already had once. Every
    // other reader in this chain is a regex, so nothing asserted that 3,415 frontmatters still
    // PARSE, or that the field landed in the same mapping as its anchor rather than in a
    // different block that happens to be valid YAML. A real parser answers both.
    const yamlProblem = auditYaml(after);
    if (yamlProblem) { problems.push(`${rel}: ${yamlProblem}`); continue; }
    checked++;
  }

  console.log(`reconstructed ${checked} of ${changed.length} changed path(s) from ${OPTS.base}`);
  if (problems.length) {
    console.error(`\n${problems.length} path(s) are NOT base+stamp:`);
    for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
    if (problems.length > 20) console.error(`  ... ${problems.length - 20} more`);
    process.exit(1);
  }
  console.log('OK: every changed file is exactly its base content plus one fence_basis_commit line.');
  process.exit(0);
}

// ---- refuse to write into a dirty scope -----------------------------------
//
// Same rule the fence normalizer adopted after a read-only probe agent rewrote 281 files
// (#486): a mechanical corpus edit must not mix with hand edits, because the resulting diff
// cannot be reviewed as either one.

const WRITE_SCOPE = OPTS.locale ? `i18n/${OPTS.locale}` : 'i18n';

if (OPTS.write) {
  const st = git(['status', '--porcelain', '--', WRITE_SCOPE]);
  if (st.status !== 0) {
    console.error('ERROR: git status failed; refusing to write blind.');
    process.exit(2);
  }
  const dirty = st.stdout.split('\n').filter((l) => l.trim() !== '');
  if (dirty.length) {
    console.error(`ERROR: ${WRITE_SCOPE}/ has ${dirty.length} uncommitted change(s). Refusing to write.`);
    console.error('A mechanical backfill mixed with hand edits produces a diff nobody can review.');
    for (const line of dirty.slice(0, 10)) console.error(`  ${line}`);
    if (dirty.length > 10) console.error(`  ... ${dirty.length - 10} more`);
    process.exit(2);
  }
}

// A shallow clone silently truncates the pool, which would reclassify files (#279/#362).
assertNotShallow(ROOT);

// ---- gather ---------------------------------------------------------------

const { targets, localesReached, treesReached } = collectI18nTargets({
  root: ROOT, onlyLocale: OPTS.locale, onlyTrees: OPTS.trees, withText: true,
});

const scopeErrors = validateScope({
  onlyLocale: OPTS.locale, onlyTrees: OPTS.trees, localesReached, treesReached,
});
if (scopeErrors.length) {
  for (const line of scopeErrors) console.error(line);
  process.exit(2);
}

// Belt-and-braces behind `validateScope`. That function answers "is each flag reachable"; this
// answers "did this run actually reach anything", which is the property that matters and the one
// a future scope flag could break without touching the guard above. A run that scans nothing
// must never report success — a clean-looking zero is the failure mode every scope guard in this
// repo exists to prevent.
if (targets.length === 0) {
  console.error('ERROR: this scope selected no translated files. Nothing would be examined.');
  console.error(`Reachable locales: ${[...localesReached].sort().join(', ') || '(none)'}`);
  console.error(`Reachable trees:   ${[...treesReached].sort().join(', ') || '(none)'}`);
  process.exit(2);
}

for (const t of targets) t.sourceCommit = readFrontmatterField(t.text, SOURCE_COMMIT_FIELD);

// ---- resolve each target's claimed basis in one git process ---------------

const specs = [...new Set(
  targets.filter((t) => t.sourceCommit).map((t) => `${t.sourceCommit}:${t.englishRel}`),
)];

/**
 * Batch-resolve the basis blobs.
 *
 * The parse moved to `scripts/lib/git-batch.js` (#587). This was the FOURTH copy — #559 unified
 * two and declared the buffer shared, then a third turned up in the normalizer and this one
 * behind it, still at the older 512 MiB.
 *
 * The one behavioural difference from the normalizer's caller is kept here rather than pushed
 * into the library: an absent object is DROPPED, not recorded. Downstream reads treat a missing
 * key as "no basis available" and withhold the stamp, so recording a null would have to be
 * unlearned at every read site.
 */
function readBlobs(list) {
  const out = new Map();
  catFileBatch(ROOT, list, (spec, text) => {
    if (text !== null) out.set(spec, text);
  });
  return out;
}

const blobs = readBlobs(specs);
const history = buildEnglishFenceHistory(ROOT);

// ---- decide ---------------------------------------------------------------

const R = {
  ORPHAN: 'no English history for this id',
  NO_SOURCE_COMMIT: 'no source_commit to verify against',
  UNRESOLVABLE: 'source_commit resolves to no blob for this path',
  // `mirrorsBasis` is one predicate deliberately, but three DIFFERENT stories about a file, and
  // absence is meaningful in this schema — so the report decomposes what the decision bundles.
  // A reader asking "why does this file have no claim?" gets an answer specific enough to act
  // on: a count mismatch is usually a fence English gained or lost since, a sequence mismatch is
  // usually a retag, and a body mismatch is usually a translated code block.
  NOT_MIRROR_COUNT: 'fence count differs from its source_commit',
  NOT_MIRROR_SEQ: 'fence tag sequence differs from its source_commit',
  NOT_MIRROR_BODY: 'a gated fence body differs from its source_commit',
  BODY_OFF_POOL: 'mirrors its source_commit, but a gated body is in no walked revision',
  SEQ_OFF_POOL: 'mirrors its source_commit, but its fence sequence is in no walked revision',
  NO_ANCHOR: 'no source_commit line to anchor the field beside',
  PRESENT: 'already carries the field (never overwritten by this tool)',
};

const plan = [];
const withheld = new Map();
const examples = new Map();
const record = (reason, relPath) => {
  withheld.set(reason, (withheld.get(reason) || 0) + 1);
  if (!examples.has(reason)) examples.set(reason, []);
  examples.get(reason).push(relPath);
};

for (const t of targets) {
  const pool = history.get(t.key);
  if (!pool) { record(R.ORPHAN, t.relPath); continue; }
  if (readFrontmatterField(t.text, FENCE_BASIS_FIELD) !== null) { record(R.PRESENT, t.relPath); continue; }
  if (!t.sourceCommit) { record(R.NO_SOURCE_COMMIT, t.relPath); continue; }

  const basisText = blobs.get(`${t.sourceCommit}:${t.englishRel}`);
  if (basisText === undefined) { record(R.UNRESOLVABLE, t.relPath); continue; }

  const mine = extractFences(t.text);
  const basis = extractFences(basisText);
  if (!mirrorsBasis(mine, basis)) {
    // Re-derive WHICH conjunct failed, for the report only. The decision above is
    // `mirrorsBasis` and nothing else, so this cannot disagree with it — it can only be less
    // specific, never differently specific.
    if (mine.length !== basis.length) record(R.NOT_MIRROR_COUNT, t.relPath);
    else if (foldedTagSequence(mine).join(',') !== foldedTagSequence(basis).join(',')) record(R.NOT_MIRROR_SEQ, t.relPath);
    else record(R.NOT_MIRROR_BODY, t.relPath);
    continue;
  }
  if (!mine.filter(isGated).every((f) => pool.has(f.body))) { record(R.BODY_OFF_POOL, t.relPath); continue; }
  if (compareTagSequence(foldedTagSequence(mine), history.sequences.get(t.key)) !== null) {
    record(R.SEQ_OFF_POOL, t.relPath); continue;
  }

  const stamped = stampFrontmatterField(t.text, FENCE_BASIS_FIELD, t.sourceCommit);
  if (stamped === null) { record(R.NO_ANCHOR, t.relPath); continue; }

  plan.push({ path: t.absPath, relPath: t.relPath, locale: t.locale, value: t.sourceCommit, text: stamped });
}

// ---- containment assertion ------------------------------------------------
//
// Every file the parity gate flags must land outside the plan. This follows from the predicate
// — a gated finding means a body or a sequence in no revision, which fails (4) or (5) — but it
// is ASSERTED rather than argued, because its violation is the one outcome that matters: the
// tool stamping a file the gate already knows is broken. `stale-basis-claim` is emitted
// ungated, and CI runs the gate with `--warn`, so such a file would merge green twice over.

const planned = new Set(plan.map((p) => p.relPath));
// Two populations, because conflating them misstates whose authority is being invoked.
//
// `gateFlagged` is what `check-i18n-fence-parity.js` actually REPORTS: a divergent gated body,
// or a tag-sequence verdict that is not `unalignable`. `unalignable` is expressly not a finding
// there — with no count-matched revision there is no positional claim to make — so counting it
// as "flagged by gate" would claim the gate says something it does not.
//
// `unverifiable` is the wider set this tool refuses to stamp, which includes the unalignable
// files. Refusing more than the gate flags is correct and deliberate: the gate decides what is
// a violation, this tool decides what it is willing to CLAIM, and the second is stricter.
const gateFlagged = [];
const unverifiable = [];
for (const t of targets) {
  const pool = history.get(t.key);
  if (!pool) continue;
  const fences = extractFences(t.text);
  const bodyBad = fences.some((f) => isGated(f) && !pool.has(f.body));
  const seq = compareTagSequence(foldedTagSequence(fences), history.sequences.get(t.key));
  if (bodyBad || (seq !== null && !seq.unalignable)) gateFlagged.push(t.relPath);
  if (bodyBad || seq !== null) unverifiable.push(t.relPath);
}
const flagged = gateFlagged;

const leaked = unverifiable.filter((f) => planned.has(f));
if (leaked.length) {
  console.error(`ERROR: ${leaked.length} unverifiable file(s) would be stamped. The predicate is wrong.`);
  for (const f of leaked.slice(0, 10)) console.error(`  ${f}`);
  process.exit(2);
}

// ---- report ---------------------------------------------------------------

const byLocale = new Map();
for (const p of plan) byLocale.set(p.locale, (byLocale.get(p.locale) || 0) + 1);

if (OPTS.json) {
  console.log(JSON.stringify({
    preview: PREVIEW,
    scanned: targets.length,
    stamp: plan.length,
    withheld: Object.fromEntries(withheld),
    flaggedByGate: gateFlagged.length,
    unverifiable: unverifiable.length,
    leaked: leaked.length,
    byLocale: Object.fromEntries([...byLocale.entries()].sort()),
  }, null, 2));
} else {
  for (const [reason, files] of examples) {
    console.log(`\nWITHHELD ${String(withheld.get(reason)).padStart(4)} — ${reason}`);
    for (const f of files.slice(0, 4)) console.log(`     ${f}`);
    if (files.length > 4) console.log(`     ... ${files.length - 4} more`);
  }
  console.log(`\nscanned:         ${targets.length}`);
  console.log(`${PREVIEW ? 'would stamp:    ' : 'stamped:        '} ${plan.length}`);
  console.log(`withheld:        ${targets.length - plan.length}`);
  console.log(`flagged by gate: ${gateFlagged.length}  (what check-i18n-fence-parity reports)`);
  console.log(`unverifiable:    ${unverifiable.length}  (wider: adds unalignable; 0 leaked into the plan — asserted)`);
  if (byLocale.size) {
    console.log(`by locale:       ${[...byLocale.entries()].sort().map(([k, v]) => `${k}=${v}`).join('  ')}`);
  }
}

if (!PREVIEW && plan.length) {
  // stderr, deliberately: a run that rewrites thousands of corpus files must leave a mark in the
  // transcript that `> log.txt` cannot swallow.
  console.error(`WRITING ${plan.length} file(s) under ${WRITE_SCOPE}/ ...`);
  for (const p of plan) writeFileSync(p.path, p.text, 'utf8');
}

// NOT in `--json` mode. This line used to print unconditionally, which appended prose after the
// JSON document and made the machine-readable output unparseable — `JSON.parse` on it throws
// `Unexpected non-whitespace character after JSON`. A `--json` mode whose output is not JSON is
// the same class of defect as a verification nobody can run: the feature exists and does not
// work, and only a consumer discovers it.
if (!OPTS.json) {
  console.log(`\n${PREVIEW ? 'PREVIEW — nothing written (pass --write to apply)' : 'Wrote changes'}`);
}
