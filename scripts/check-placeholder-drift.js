#!/usr/bin/env node
/**
 * check-placeholder-drift.js
 *
 * Advisory detector for the review hazard #477 names as "prose can reference
 * in-fence identifiers" (#497). Run it on every fence-restore batch.
 *
 * ## What it is for
 *
 * Restoring a frozen fence to its English body is correct by the #472 rule, but
 * the fence does not stand alone: the prose around it, and the exempt
 * `text`/`markdown` fences beside it, may name the same placeholder. Restore one
 * and not the other and the file names one thing two ways.
 *
 * #496 did exactly that. Two `bash` fences in
 * `i18n/de/skills/release-package-version/SKILL.md` went `paketname` ->
 * `packagename`, while the prose explaining those commands and the exempt
 * ```markdown NEWS.md example kept saying `paketname`. Fixed in `8ed584a4`.
 *
 * Three things were pointed at that batch and only one caught it:
 *
 *   | check                                        | result          |
 *   |----------------------------------------------|-----------------|
 *   | ad-hoc detector keyed on code-shaped tokens   | 0 — missed it   |
 *   | 6 locale-sharded review agents + refuters     | 0 — missed it   |
 *   | Copilot                                       | found it        |
 *
 * ## Why shape does not work, and structure does
 *
 * The detector that missed it keyed on token SHAPE — snake_case, CONSTANT_CASE,
 * kebab-case, dotted.path, camelCase. `paketname` is a plain lowercase word and
 * matched none of them. That is the most likely form of this defect, because a
 * translator renames `packagename` to a plain word in their own language, not to
 * a camelCase one. Worse, that filter had been tuned from 216 false positives
 * down to 0 with no confirmed true positive to test against, so the tuning
 * deleted the target class and the resulting zero read as success.
 *
 * The predicate here is structural instead. A **substitution pair**: within a
 * frozen fence, an old and a new line differ by exactly ONE DISTINCT
 * substitution, and the removed form is still cited in a localisable register —
 * prose inline-code, or the body of an exempt `text`/`markdown`/`md` fence.
 *
 * That narrowness is what carries it. The same commit rewrote
 * `git commit -m "Entwicklung fuer naechste Version beginnen"` to
 * `git commit -m "Begin development for next version"` — five distinct
 * substitutions, an ordinary translation restore, not a placeholder rename.
 * One-distinct-substitution separates a rename from a retranslation without
 * knowing anything about what the token looks like.
 *
 * Distinct substitutions, NOT differing positions. Counting positions inverted
 * the detector on the commonest shape a placeholder takes: a rename applied
 * completely to a line was invisible and only a rename occurring exactly once
 * per line could be seen. `docker tag X:latest ghcr.io/USERNAME/X:latest` is two
 * positions carrying one rename, and 5,783 gated-fence lines across 1,571 files
 * in this corpus repeat a token.
 *
 * ## It stays advisory
 *
 * Not every hit is a defect. `de/prune-agent-memory` changes `Eintraege` ->
 * `entries` inside an echoed shell string, which is a frozen fence carrying an
 * English output string: exactly what the rule requires. A reviewer should see
 * it and dismiss it. A gate that must be overridden routinely trains the reflex
 * #472 exists to prevent, so this reports and exits 0 on findings.
 *
 * ## What it cannot see
 *
 * It compares two revisions, so it sees only drift a change INTRODUCES.
 * Pre-existing drift in the corpus is invisible to it and needs a separate
 * one-shot scan.
 *
 * Within a compared line, three shapes are out of reach, all measured rather
 * than assumed:
 *
 * - **Two different placeholders renamed on one line** — two distinct
 *   substitutions, rejected with the retranslations. `cp datei.txt ziel/` ->
 *   `cp file.txt target/` is invisible.
 * - **A rename that changes the token COUNT.** `-`, `_` and `.` are inside the
 *   token class, so `paket-name` -> `package-name` is 1 -> 1 and is caught; but
 *   `paket-name` -> `package name` is 1 -> 2 and is dropped by the length guard.
 *   This needs the English form to contain a space, which a code identifier in a
 *   frozen fence generally cannot, so it is largely theoretical for de/es.
 * - **CJK.** `\p{L}` covers Han and kana, and those scripts do not delimit words
 *   with spaces, so a whole phrase collapses to one token and a Latin run
 *   adjacent to kana MERGES with it. `# 標準的な評価チャンク` is one token against
 *   three for `# Standard evaluation chunk`. Latent rather than live: no
 *   instance of a placeholder riding such a line inside a gated fence was found.
 *
 * Coverage is reported, not assumed. Every unexamined path increments a counter
 * — `skippedFiles` for a fence-count change, a tag-sequence divergence, or a
 * file added/deleted/renamed in the range, and `unalignedFences` for an
 * oversized LCS table — and a run that compared nothing says so instead of
 * printing a clean line. Across the seven merged batches plus the #476
 * re-mirror the tool made 976 fence comparisons and skipped 44 files, all of
 * them in the re-mirror, whose fence structure changed wholesale.
 *
 * Usage:
 *   node scripts/check-placeholder-drift.js                      # HEAD~1..HEAD
 *   node scripts/check-placeholder-drift.js --base <ref>
 *   node scripts/check-placeholder-drift.js --base <ref> --head <ref>
 *   node scripts/check-placeholder-drift.js --json
 *   node scripts/check-placeholder-drift.js --compare            # rejected predicates too
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { extractFences, toLines, isGated, foldedTagSequence } from './lib/fences.js';
import { parseArgs, usageExit } from './lib/parse-args.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GIT_BUFFER = 512 * 1024 * 1024;

// ---- arguments: default-deny, shared parser (#619) ----
//
// This was a line-identical COPY of the loop in normalize-i18n-fences.js, which is the third
// copy the extraction exists to prevent. Its defaults were seeded inside the opts literal --
// the pattern the shared parser cannot carry, since a default living in a parser used by six
// scripts is invisible from the call site -- so they are applied here with `??`.
const ARG_SPEC = { bool: ['--json', '--compare'], value: ['--base', '--head'] };
const parsed = parseArgs(process.argv.slice(2), ARG_SPEC, usageExit(ARG_SPEC));
const opts = {
  ...parsed,
  base: parsed.base ?? 'HEAD~1',
  head: parsed.head ?? 'HEAD',
};

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: GIT_BUFFER });
  return r.status === 0 ? r.stdout : null;
}

function resolveRef(ref) {
  const out = git(['rev-parse', '--verify', `${ref}^{commit}`]);
  if (out === null) {
    console.error(`ERROR: --base/--head ref does not resolve to a commit: '${ref}'`);
    process.exit(2);
  }
  return out.trim();
}

const BASE = resolveRef(opts.base);
const HEAD = resolveRef(opts.head);

/**
 * A token, for the purpose of "identical except one token".
 *
 * Unicode letters, because the removed side is by definition the translated one
 * — `Eintraege`, `Duesendurchmesser`, and in other locales tokens outside ASCII
 * entirely. An ASCII-only class would drop the very side being measured.
 *
 * A trailing `.`/`-` is kept inside the token so `v0.2.0` and `--dry-run` read
 * as one, which is what makes `"Release paketname v0.2.0"` a single-token change
 * rather than a four-token one.
 */
const TOKEN = /[\p{L}_][\p{L}\p{N}_.-]*/gu;
const tokensOf = (line) => line.match(TOKEN) ?? [];

/** Shapes the detector that MISSED the defect keyed on. Kept only for --compare. */
const CODE_SHAPED = /^(?:[a-z0-9]+_[a-z0-9_]+|[A-Z0-9]+_[A-Z0-9_]+|[a-z0-9]+-[a-z0-9-]+|\w+\.\w+|[a-z]+[A-Z]\w*)$/;

/**
 * Every token cited in a register a translation is ALLOWED to localise, in one
 * revision of one file: prose inline-code spans, and exempt fence bodies.
 *
 * Bare prose — a token appearing in un-backticked prose — is deliberately
 * excluded, and NOTHING here measures it; `--compare` reports two other
 * predicates, `codeShaped` and `anyExemptFence`. Over #496's 3,242 removed
 * tokens those read 15 and 223 against this predicate's 4. (#497 quotes 0 and
 * 143 for its own versions; the prototype behind those figures no longer
 * exists, so the definitions are unrecoverable and the numbers here are this
 * file's own. What reproduces is the shape of the comparison, not the digits.)
 *
 * The register is recorded rather than filtered on. Across the seven merged
 * batches plus the #476 re-mirror the two registers split 4 / 5 — inline-code
 * 4, all in #496, two of them the real `paketname` defect; exempt-fence 5,
 * every one an ordinary German word (`von` ×4, `Datei`).
 *
 * **That split is not evidence the register discriminates, and the sort is a
 * hunch rather than a finding.** The one confirmed true positive is cited in
 * BOTH registers — `paketname` appears in prose inline-code at lines 69 and 167
 * of the #496 revision AND in the exempt ```markdown example at line 75 — so it
 * lands in the strong bucket by the tie-break in `note()`, not by
 * discrimination. Had that batch repaired the backticks and left only the
 * markdown example stale, the identical defect would have sorted last. Register
 * is also perfectly confounded with batch here: all four inline-code hits are in
 * #496 and all five exempt-fence hits are elsewhere, so "register predicts
 * truth" is not separable from "#496 was the batch with the bug", and n = one
 * independent rename.
 *
 * It is kept because it costs nothing and the mechanism is plausible — someone
 * who writes a placeholder in backticks is naming it — and because filtering on
 * it, on this evidence, is exactly the move that tuned the previous detector to
 * zero. It would be falsified by a real defect whose only citation is in an
 * exempt fence, or by a backticked ordinary locale word producing an
 * inline-code false positive.
 */
function localisableCitations(text) {
  const lines = toLines(text);
  const fences = extractFences(text);
  const inFence = new Array(lines.length).fill(false);
  /** token -> 'inline-code' | 'exempt-fence'; inline-code wins when both. */
  const cited = new Map();
  const note = (t, register) => {
    if (register === 'inline-code' || !cited.has(t)) cited.set(t, register);
  };

  for (const f of fences) {
    // Blank the delimiters too, so a fence opener never reads as prose.
    for (let i = Math.max(0, f.line - 1); i <= Math.min(lines.length - 1, f.bodyEnd); i++) {
      inFence[i] = true;
    }
    if (isGated(f)) continue;
    for (const t of tokensOf(f.body)) note(t, 'exempt-fence');
    for (const m of f.body.matchAll(/`([^`\n]+)`/g)) {
      for (const t of tokensOf(m[1])) note(t, 'inline-code');
    }
  }

  const prose = lines.filter((_, i) => !inFence[i]).join('\n');
  for (const m of prose.matchAll(/`([^`\n]+)`/g)) {
    for (const t of tokensOf(m[1])) note(t, 'inline-code');
  }
  return cited;
}

/**
 * Pair the changed lines of two fence bodies by LCS.
 *
 * Index pairing, which this replaces, could only examine a fence whose two
 * bodies had the SAME line count — 67 of batch 1's 172 changed fences failed
 * that and went unexamined. A fence that gained or lost a line can still carry
 * a substitution pair in the lines around it.
 *
 * Returns `null` rather than a partial answer when the table would be
 * pathologically large, so the caller counts it as unexamined instead of
 * quietly clearing it.
 */
function changeBlocks(before, after) {
  const n = before.length;
  const m = after.length;
  if (n * m > 400000) return null;

  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = before[i] === after[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const blocks = [];
  let pendingBefore = [];
  let pendingAfter = [];
  const flush = () => {
    if (pendingBefore.length || pendingAfter.length) {
      blocks.push({ before: pendingBefore, after: pendingAfter });
    }
    pendingBefore = [];
    pendingAfter = [];
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) { flush(); i++; j++; continue; }
    if (dp[i + 1][j] >= dp[i][j + 1]) pendingBefore.push({ text: before[i], index: i++ });
    else pendingAfter.push({ text: after[j], index: j++ });
  }
  while (i < n) pendingBefore.push({ text: before[i], index: i++ });
  while (j < m) pendingAfter.push({ text: after[j], index: j++ });
  flush();
  return blocks;
}

/**
 * The removed/added token when two lines are identical except for exactly one
 * token, else null.
 *
 * "Exactly one" is what carries the whole detector. #496 rewrote
 * `git commit -m "Entwicklung fuer naechste Version beginnen"` to
 * `git commit -m "Begin development for next version"` in the same batch as the
 * `paketname` rename — five tokens, an ordinary retranslation. Requiring a
 * single differing token separates a rename from a retranslation without knowing
 * anything about what the token looks like.
 */
function substitution(beforeLine, afterLine) {
  const from = tokensOf(beforeLine);
  const to = tokensOf(afterLine);
  if (from.length !== to.length) return null;

  // One distinct SUBSTITUTION, not one differing position. The first version
  // counted positions, which inverted the detector on the commonest shape a
  // placeholder takes: a rename applied COMPLETELY to a line was invisible,
  // and only a rename occurring exactly once per line could be seen.
  //
  //   docker tag meineapp:latest ghcr.io/USERNAME/meineapp:latest
  //   docker tag myapp:latest    ghcr.io/USERNAME/myapp:latest
  //
  // is two differing positions carrying one rename, and it was dropped. 5,783
  // gated-fence lines across 1,571 files in this corpus repeat a token, so the
  // shape is pervasive rather than incidental.
  //
  // Collapsing to distinct pairs keeps the property that does the work. The
  // retranslation this predicate exists to reject —
  // `"Entwicklung fuer naechste Version beginnen"` ->
  // `"Begin development for next version"` — is five DISTINCT pairs and is
  // still rejected. Two different placeholders renamed on one line is two
  // distinct pairs and is still rejected too: that is one line carrying two
  // renames, which this predicate does not claim to read.
  const seen = new Map();
  for (let k = 0; k < to.length; k++) {
    if (from[k] === to[k]) continue;
    seen.set(`${from[k]} ${to[k]}`, { removed: from[k], added: to[k] });
    if (seen.size > 1) return null;
  }
  return seen.size === 1 ? [...seen.values()][0] : null;
}

/** Every token appearing in ANY exempt fence — the other rejected predicate. */
function exemptFenceTokens(text) {
  const cited = new Set();
  for (const f of extractFences(text)) {
    if (!isGated(f)) for (const t of tokensOf(f.body)) cited.add(t);
  }
  return cited;
}

// ---- scan ----
const changed = (git(['diff', '--name-only', BASE, HEAD, '--', 'i18n/']) || '')
  .split('\n')
  .filter((p) => p.endsWith('.md'));

const findings = [];
/**
 * The two predicates #497 rejected, measured over the SAME candidate universe
 * they were originally run against: every token removed from a frozen fence
 * line, NOT only the ones that survive the substitution-pair filter. Scoping
 * them to substitution pairs would flatter both — the pair filter is most of
 * what makes this detector quiet, so crediting it to them hides the comparison
 * the issue exists to record.
 */
const alternatives = { candidates: 0, codeShaped: 0, anyExemptFence: 0 };
let fencesCompared = 0;
let unalignedFences = 0;
const skippedFiles = [];

for (const path of changed) {
  const baseText = git(['show', `${BASE}:${path}`]);
  const headText = git(['show', `${HEAD}:${path}`]);
  if (baseText === null || headText === null) {
    // Counted, not dropped. `git diff --name-only` reports a RENAME as its
    // destination path alone, so a batch that moved a skill while restoring a
    // fence inside it resolved no base blob and vanished here with no counter —
    // the one unexamined path of three that left no trace.
    skippedFiles.push({ path, reason: 'added, deleted or renamed in this range' });
    continue;
  }

  const baseFences = extractFences(baseText);
  const headFences = extractFences(headText);
  if (baseFences.length !== headFences.length) {
    skippedFiles.push({ path, reason: `fence count ${baseFences.length} -> ${headFences.length}` });
    continue;
  }

  // Equal fence counts do not make ordinal mapping trustworthy on their own —
  // a `text` -> `yaml` retag keeps the count and makes a translated table the
  // "before body" of a frozen fence. The sibling normalizer validates the tag
  // sequence before trusting the ordinal; so does this.
  //
  // Through `foldedTagSequence` since #674, and the comment above is the reason the local copy
  // survived this long: "so does this" was true of the check and false of the FOLD. The copy
  // here collapsed a brace-info fence to `text` exactly like an untagged one, so a base->head
  // retag between those two shapes was not reported as a divergence and the comparison went on
  // to trust an ordinal it had not established.
  const headSeq = foldedTagSequence(headFences);
  const baseSeq = foldedTagSequence(baseFences);
  const misaligned = headSeq.findIndex((tag, i) => tag !== baseSeq[i]);
  if (misaligned >= 0) {
    skippedFiles.push({
      path,
      // Folded tokens, for the reason the sibling normalizer's label carries (#674): a brace
      // fence would otherwise be reported as `untagged`, which is not a thing the reader can
      // find in the file.
      reason: `tag sequence diverges at fence ${misaligned + 1} `
        + `(${baseSeq[misaligned]} -> ${headSeq[misaligned]})`,
    });
    continue;
  }

  const cited = localisableCitations(headText);
  const exemptOnly = opts.compare ? exemptFenceTokens(headText) : null;

  for (let i = 0; i < headFences.length; i++) {
    const before = baseFences[i];
    const after = headFences[i];
    if (!isGated(after) || before.body === after.body) continue;

    const blocks = changeBlocks(before.body.split('\n'), after.body.split('\n'));
    if (blocks === null) {
      // Reported, never silently dropped: an unexamined fence is not a cleared
      // one, and a detector that conflates the two is how a zero stops meaning
      // anything.
      unalignedFences++;
      continue;
    }
    fencesCompared++;

    for (const block of blocks) {
      if (opts.compare) {
        // Per block, not per line pair: which tokens the block removed is a
        // property of the block, and counting them per candidate pairing would
        // multiply them by the cross product below.
        const kept = new Set(block.after.flatMap((l) => tokensOf(l.text)));
        for (const t of block.before.flatMap((l) => tokensOf(l.text))) {
          if (kept.has(t)) continue;
          alternatives.candidates++;
          if (CODE_SHAPED.test(t)) alternatives.codeShaped++;
          if (exemptOnly.has(t)) alternatives.anyExemptFence++;
        }
      }

      // Every before x after combination within the block, rather than a guessed
      // pairing. Positional pairing — the first version — mispairs the moment a
      // block holds an insertion before the rename: a fence that gained a line
      // paired the renamed line against the INSERTED one, found many differing
      // tokens, and cleared the fence.
      //
      // The cross product is safe precisely because the predicate is so narrow.
      // Two unrelated lines matching "identical except exactly one token"
      // requires every other token to agree in order, which does not happen by
      // accident; blocks are also small. At most one hit per new line, so an
      // insertion cannot inflate the count.
      const claimed = new Set();
      for (const afterLine of block.after) {
        for (const beforeLine of block.before) {
          if (claimed.has(afterLine.index)) break;
          const sub = substitution(beforeLine.text, afterLine.text);
          if (sub === null) continue;
          const register = cited.get(sub.removed);
          if (register === undefined) continue;
          claimed.add(afterLine.index);
          findings.push({
            path,
            fence: i + 1,
            tag: after.lang || 'untagged',
            line: after.line + 1 + afterLine.index,
            removed: sub.removed,
            added: sub.added,
            register,
            context: afterLine.text.trim().slice(0, 120),
          });
        }
      }
    }
  }
}

// A run that compared nothing is not a clean run. Without this the natural
// mistake — pointing it at a merge commit, or a ref pair with no i18n/ change —
// reports "0 findings" and reads as a pass.
if (changed.length === 0) {
  console.error(`ERROR: no i18n/*.md changed between ${BASE.slice(0, 9)} and ${HEAD.slice(0, 9)}.`);
  console.error('Nothing would be compared, and the run would report a clean-looking zero.');
  process.exit(2);
}

if (opts.json) {
  console.log(JSON.stringify({
    base: BASE, head: HEAD, filesChanged: changed.length, fencesCompared, unalignedFences,
    findings, skippedFiles,
    ...(opts.compare ? { alternatives } : {}),
  }, null, 2));
  process.exit(0);
}

console.log(`placeholder drift: ${BASE.slice(0, 9)} -> ${HEAD.slice(0, 9)}`);
console.log(`  ${changed.length} changed i18n file(s); ${fencesCompared} frozen fence(s) compared`);
if (unalignedFences) console.log(`  ${unalignedFences} fence(s) not examined (line counts differ)`);
if (skippedFiles.length) console.log(`  ${skippedFiles.length} file(s) skipped (fence count changed)`);
console.log('');

if (findings.length === 0) {
  // Qualified by what was actually examined. An unqualified "no findings" over
  // zero comparisons is the clean-looking zero this file's other guards exist
  // to reject, and every drop path above now carries a counter so the two
  // numbers can be reconciled.
  console.log(fencesCompared === 0
    ? 'NOTHING WAS EXAMINED — no frozen fence in this range could be compared.'
    : `No substitution pair leaves a translated placeholder cited nearby (${fencesCompared} fence(s) examined).`);
} else {
  // Strongest register first. An author who writes a placeholder in backticks
  // is NAMING it; a token that merely occurs as a word inside an exempt block is
  // usually an ordinary word of the locale. Batch 1's four `von` -> `from` hits
  // are the whole of that second class, and they are dismissed in one glance
  // once the register is on the line.
  //
  // Sorted, not filtered. There is exactly one confirmed true positive on
  // record, and dropping the weaker register on that evidence is how the
  // previous detector tuned 216 false positives down to 0 and deleted the target
  // class with them.
  const strong = findings.filter((f) => f.register === 'inline-code');
  const weak = findings.filter((f) => f.register !== 'inline-code');
  console.log(`${findings.length} substitution pair(s) whose removed form is still cited nearby`);
  console.log(`  ${strong.length} cited in inline-code · ${weak.length} cited only as a word in an exempt fence`);
  console.log('');
  for (const f of [...strong, ...weak]) {
    console.log(`  ${f.path}:${f.line}  [${f.tag}] fence ${f.fence}  (cited in ${f.register})`);
    console.log(`    ${f.removed}  ->  ${f.added}`);
    console.log(`    ${f.context}`);
  }
  console.log('');
  console.log('ADVISORY. Each needs a human call: an English output string inside a frozen');
  console.log('fence is what the rule requires, and reads the same as a placeholder rename.');
}

if (opts.compare) {
  console.log('');
  console.log(`rejected predicates over the same ${alternatives.candidates} removed token(s):`);
  console.log(`  code-shaped removed token          : ${alternatives.codeShaped}`);
  console.log(`  removed token in any exempt fence  : ${alternatives.anyExemptFence}`);
  console.log(`  substitution pair + cited (shipped): ${findings.length}`);
}

// Advisory by design — see the header. Findings do not fail the run.
process.exit(0);
