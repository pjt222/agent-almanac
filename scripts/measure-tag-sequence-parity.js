#!/usr/bin/env node
/**
 * measure-tag-sequence-parity.js — what would tag-sequence parity cost, before building it?
 *
 * #481 proposes closing the retag escape (a frozen ```yaml fence retagged ```text leaves the
 * parity gate entirely) by comparing the ordered info-string sequence between a translation and
 * its English basis. #583 records that the status detector carried an accidental tripwire for
 * the same escape and lost it in #582, leaving #481 the only thing standing between a retag and
 * both gates.
 *
 * #583's acceptance criteria require the false-positive cost to be measured on the corpus
 * BEFORE shipping, "because the last check in this area cost 62 files, and that was only
 * discovered by measuring the corpus rather than reasoning about it". This is that measurement.
 * It writes nothing and enforces nothing.
 *
 * ## The design being measured
 *
 * Staleness is the confound that kills the naive version. 2,549 translations are stale, so
 * comparing a translation's tags against HEAD's tags reports drift that nobody introduced. The
 * gate's existing answer is to accept a match against ANY English revision, and the same answer
 * applies here: a translation is clean when its folded tag sequence equals that of SOME revision
 * of its English source.
 *
 * Two foldings are load-bearing, and both now come from `lib/fences.js` (`foldedTagSequence`),
 * which is the definition production enforces against. They were originally lifted from
 * `normalize-i18n-fences.js`, and that attribution is deliberately NOT kept. When #612 moved this
 * script to the shared fold, that module still carried its own `alignmentTag` — so citing it as
 * the authority for the brace arm would have named the module making the opposite judgement.
 * #674 has since given it `foldedTagSequence` too, and the three copies are now one; the
 * attribution stays with `lib/fences.js`, which is where the definition lives.
 *
 *   - An untagged fence folds to `text`. `normalize-content-style.js --mode fences` retro-tagged
 *     untagged blocks as `text` on the newer side only, so that pairing is an artifact of a
 *     known repo tool rather than a translator action. A BRACE-INFO fence (```{r}) folds to `{`
 *     instead, because `lang` is `''` for it too and collapsing both to `text` would let an
 *     English ```{r} be swapped for a localisable ```text unseen — the escape this measures.
 *   - Alignment must NOT be expressed as `isGated(a) !== isGated(b)`. Under default-deny an
 *     untagged fence is gated while `text` is not, so that formulation makes every one of those
 *     benign pairings a misalignment — it stranded 169 repairable fences across 73 files when it
 *     was tried.
 *
 * ## What the buckets mean
 *
 *   clean       the folded sequence appears in some English revision — no finding
 *   unalignable no English revision has the same fence COUNT, so no positional claim can be
 *               made at all. These must report as unjudged, never as violations: a translation
 *               that legitimately predates a fence English later gained lands here, and calling
 *               that a violation reintroduces the staleness confound the gate exists to avoid.
 *   retag       some revision has a matching count, but a tag differs at a position. This is the
 *               signal #481 wants and the FALSE-POSITIVE RISK at once — the report lists every
 *               one so they can be read rather than counted.
 *
 * Usage:
 *   node scripts/measure-tag-sequence-parity.js
 *   node scripts/measure-tag-sequence-parity.js --locale de
 *   node scripts/measure-tag-sequence-parity.js --json
 *   node scripts/measure-tag-sequence-parity.js --list-retags   # every retag position, verbatim
 *   node scripts/measure-tag-sequence-parity.js --root /tmp/fixture   # measure another tree
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
// `foldedTagSequence` and not a local fold (#612). The copy this replaces was
// `fence.lang === '' ? 'text' : fence.lang`, which collapses a brace-info fence (```{r} — `lang`
// empty, `info` non-empty) to `text` where production folds it to `{`. That placeholder exists
// precisely so an English ```{r} cannot be swapped for a localisable ```text with neither the
// sequence check nor the body check seeing it, so the reproducer had reintroduced the escape it
// was written to reproduce. Latent: measured with this repair, 0 of the 3,648 translated files
// walked, and no English source either, carries a TOP-LEVEL brace-info fence. Top-level is the
// qualifier that matters — the corpus carries plenty NESTED inside ````markdown wrappers, where
// they are body text rather than fences. Both sides are stated because the fold applies to the
// English pool as well, so zero carriers on the translation side alone would not have implied the
// two folds agree. The evidence that they did is the finding set being byte-identical across this
// change; the counts are why that was expected. What makes it worth fixing anyway is that this
// script is the instrument used to judge the gate's finding set, and it disagreed with the thing
// it measures.
import { foldedTagSequence, compareTagSequence, isRetagEscape } from './lib/fences.js';
import { walkEnglishHistory } from './lib/english-history.js';
import { collectTargets } from './check-i18n-fence-parity.js';

// `--root` exists so this script can be run against a fixture, and it is NOT a convenience.
// `collectTargets` is imported from `check-i18n-fence-parity.js`, whose own `--root` is parsed at
// module scope against the IMPORTER's argv — that module's header says so in capitals. So before
// this line, `--root /tmp/x` on THIS command line already redirected the translation side to the
// fixture while the English history side stayed on the repo, and the two halves of the comparison
// silently addressed different trees. Parsing the same flag here is what makes them agree.
const ROOT = resolve(flagValue('--root', resolve(dirname(fileURLToPath(import.meta.url)), '..')));

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

const AS_JSON = process.argv.includes('--json');
const LIST_RETAGS = process.argv.includes('--list-retags');
const ONLY_LOCALE = flagValue('--locale', null);

// Pool every folded tag sequence each English source has ever carried, keyed by `<tree>/<id>`.
//
// The per-count index this used to build alongside is GONE (#676). It existed to classify a
// mismatch as unalignable rather than a retag — which is exactly what `compareTagSequence`
// already decides, and did decide, forty lines below in a hand copy of the same triage:
// same clean/unalignable/retag split, same fewest-differing-positions choice of nearest basis,
// same `{index, english, translated}` position shape.
//
// #612 gave this script production's FOLD and left its CLASSIFICATION a copy. That is half a
// fix: `fences.js` cites this file as the reproducer for the tag-sequence finding set, and
// `debt-ratchet.yml` ratchets that set, so an instrument agreeing with production on how tags
// fold and disagreeing on what a fold means is the same defect one layer up.
const english = new Map();
walkEnglishHistory(ROOT, (key, text) => {
  if (!english.has(key)) english.set(key, new Set());
  english.get(key).add(foldedTagSequence(text).join(','));
});

const totals = { clean: 0, unalignable: 0, retag: 0, orphan: 0 };
const byLocale = new Map();
const retags = [];

for (const target of collectTargets()) {
  if (ONLY_LOCALE && target.locale !== ONLY_LOCALE) continue;
  const entry = english.get(`${target.tree}/${target.id}`);
  if (!entry) { totals.orphan += 1; continue; }

  // The gate's own predicate, not a copy of it. `null` is clean, `{unalignable: true}` is
  // unjudged, `{positions}` is the finding — and `positions` already carries the nearest-basis
  // choice and the 1-based index this report prints.
  const seq = foldedTagSequence(readFileSync(target.absPath, 'utf8'));
  const verdict = compareTagSequence(seq, entry);
  let bucket;
  if (verdict === null) {
    bucket = 'clean';
  } else if (verdict.unalignable) {
    bucket = 'unalignable';
  } else {
    bucket = 'retag';
    retags.push({
      file: target.relPath,
      locale: target.locale,
      tree: target.tree,
      id: target.id,
      positions: verdict.positions,
    });
  }
  totals[bucket] += 1;
  if (!byLocale.has(target.locale)) byLocale.set(target.locale, { clean: 0, unalignable: 0, retag: 0 });
  byLocale.get(target.locale)[bucket] += 1;
}

if (AS_JSON) {
  console.log(JSON.stringify({ totals, byLocale: Object.fromEntries(byLocale), retags }, null, 2));
  process.exit(0);
}

const judged = totals.clean + totals.retag;
console.log('tag-sequence parity, measured (writes nothing, enforces nothing)\n');
console.log(`  clean        ${totals.clean}\t folded tag sequence appears in some English revision`);
console.log(`  retag        ${totals.retag}\t count-matched revision exists but a tag differs — the proposed finding`);
console.log(`  unalignable  ${totals.unalignable}\t no English revision has that fence count — must report unjudged, not violation`);
console.log(`  orphan       ${totals.orphan}\t no English source at all (check-i18n-frontmatter-parity.js owns these)`);
console.log(`\n  judged (clean + retag): ${judged}`);
if (judged > 0) {
  console.log(`  finding rate on judged pairs: ${((totals.retag / judged) * 100).toFixed(2)}%`);
}

console.log('\nby locale (clean / retag / unalignable):');
for (const [locale, counts] of [...byLocale.entries()].sort((a, b) => b[1].retag - a[1].retag)) {
  console.log(`  ${locale.padEnd(14)} ${String(counts.clean).padStart(4)} / ${String(counts.retag).padStart(4)} / ${String(counts.unalignable).padStart(4)}`);
}

if (retags.length) {
  console.log(`\n${retags.length} file(s) would be newly flagged. Read them before believing the count:`);
  const shown = LIST_RETAGS ? retags : retags.slice(0, 25);
  for (const r of shown) {
    const where = r.positions.map((p) => `#${p.index} ${p.english}->${p.translated}`).join(', ');
    console.log(`  ${r.file}\n      ${where}`);
  }
  if (!LIST_RETAGS && retags.length > shown.length) {
    console.log(`  ... ${retags.length - shown.length} more (--list-retags for all, or --json)`);
  }

  // The distribution that decides whether this is a gate or a backlog: a retag TO a localisable
  // tag is the #481 escape; anything else is ordinary tag drift and a likely false positive.
  //
  // `isRetagEscape`, and NOT a hand copy of it — which is the same sentence the rest of this
  // change is about, one predicate over. This filter was a literal `['text','markdown','md']`
  // pair until the review of #694 read the file the fix had just landed in and found it: the
  // fourth literal copy that `isRetagEscape`'s own docstring names and forbids. `LOCALISABLE_TAGS`
  // is a designed extension point (`fences.js` states the procedure for adding a tag), so the
  // copy was not merely redundant — adding a tag would have moved the gate's blocking boundary
  // and left this instrument's escape/drift split silently behind, which is #676 exactly.
  const escapes = retags.filter((r) => isRetagEscape(r.positions));
  console.log(`\nof those, ${escapes.length} involve a frozen tag becoming localisable — the #481 escape proper.`);
  console.log(`the remaining ${retags.length - escapes.length} are other tag drift, and are the false-positive risk.`);
}
