#!/usr/bin/env node
/**
 * check-fence-propagation.js
 *
 * Answers ONE question, for one content id: do the translated mirrors carry the
 * frozen fence bodies English has *now*?
 *
 * ## Why this is not `check-i18n-fence-parity.js`
 *
 * The parity gate is deliberately **staleness-immune**: it accepts a gated fence
 * body that appears in *any* revision of the paired English file, because most of
 * the corpus is stale and `evolve-*` bumps `source_commit` without retranslating
 * (#405/#616). Quote the stale count from `check-translation-freshness.js`, never
 * from a comment — two point-in-time figures already drift between this file's
 * neighbours. That property is correct for a gate, and it has an exact
 * consequence, measured on 2026-08-17 while fixing #551:
 *
 *   Editing a frozen fence in English and propagating to ZERO mirrors leaves the
 *   parity gate reporting 0 violations — before and after the commit. The old
 *   body is in history, so it is in the pool, forever.
 *
 * `check-translation-freshness.js` carries no information here either: those ten
 * mirrors were already STALE before the edit, so the edit moved nothing.
 *
 * So an eleven-file propagation cannot be verified by watching either check pass.
 * It has to be verified by BYTES, and this is the instrument that does it. It is
 * the same blind spot `feedback_historical_match_gates_miss_deletions` names — a
 * historical-match rule can never see the source move on — reached from the edit
 * side rather than the deletion side.
 *
 * ## What it is NOT
 *
 * **Not a gate, and deliberately not wired into CI.** Run corpus-wide it would
 * report an unread population of unknown size — every stale mirror whose fence
 * English later edited — and this repository's rule is that a count nobody has
 * read must not be given authority (see § Ratcheting a Warn-Only Gate in
 * CLAUDE.md). Turning it into a gate is tracked separately; it needs its members
 * read first.
 *
 * It is therefore **id-scoped and required to be so**: `--id` has no default. A
 * tool that answers a question about a corpus nobody triaged should not be one
 * keystroke away.
 *
 * ## What it compares
 *
 * Fence bodies at their ORDINAL, English against each mirror, restricted to
 * fences that are frozen (`isGated`) in English. Ordinal mapping is only sound
 * when both sides carry the same folded tag sequence, so a mirror whose sequence
 * differs is reported `unalignable` and NOT compared — the same refusal
 * `normalize-i18n-fences.js` makes, for the same reason.
 *
 * That precondition is the ALL-fence sequence, which is stricter than comparing
 * gated ordinals strictly requires, and the cost is real: a mirror that added or
 * dropped one legitimately-localisable `text` fence can never verify clean here,
 * and it shares exit 1 with a genuine lag. The strictness is kept because a
 * partial sequence match is not evidence that the nth gated fence is the nth
 * gated fence — but an operator who sees `unalignable` must diff by hand rather
 * than assume a lag.
 *
 * Whole bodies, never the inserted lines. Proving that the line you added arrived
 * is not proving the fence matches: the mirrors may each have matched a
 * *different* historical revision beforehand, so a fence can carry your insertion
 * and still differ elsewhere.
 *
 * Exit 0 = every frozen fence agrees. Exit 1 = a divergence or an unalignable
 * mirror. Exit 2 = the question could not be answered (bad id, no mirrors).
 *
 * Usage:
 *   node scripts/check-fence-propagation.js --id write-helm-chart
 *   node scripts/check-fence-propagation.js --id write-helm-chart --tree skills
 *   node scripts/check-fence-propagation.js --id quick-reference --tree guides --json
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { extractFences, isGated, foldedTagSequence, TREES } from './lib/fences.js';
import { collectI18nTargets, I18N_TREES } from './lib/i18n-targets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, '..');

const BOOL_FLAGS = new Set(['--json']);
const VALUE_FLAGS = new Set(['--id', '--tree', '--root']);

function usageError(message) {
  console.error(`ERROR: ${message}`);
  console.error('Usage: node scripts/check-fence-propagation.js --id <content-id> [--tree <tree>] [--root <dir>] [--json]');
  process.exit(2);
}

// Parsed the same way as the normalizer's flags, and for the same reason: an
// `indexOf` scan accepts `--id=x` as a bare positional and silently widens scope.
const opts = { id: null, tree: null, root: null, json: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  const eq = arg.indexOf('=');
  const name = eq >= 0 ? arg.slice(0, eq) : arg;
  if (BOOL_FLAGS.has(name)) {
    if (eq >= 0) usageError(`${name} takes no value`);
    opts[name.slice(2)] = true;
  } else if (VALUE_FLAGS.has(name)) {
    const value = eq >= 0 ? arg.slice(eq + 1) : argv[++i];
    // The empty string is rejected explicitly, not left to a falsy test downstream.
    // `--root=$FIXTURE` with `FIXTURE` unset arrives here as `--root=`, and a
    // `opts.root ? … : DEFAULT_ROOT` fallback would silently read the REAL repo and
    // report OK about a subject nobody asked about.
    if (value === undefined || value === '' || value.startsWith('--')) usageError(`${name} needs a value`);
    opts[name.slice(2)] = value;
  } else {
    usageError(`unrecognised argument '${arg}'`);
  }
}

if (!opts.id) usageError('--id is required (this tool is deliberately id-scoped; see the header)');

// `--root` exists for the fixture tests. An earlier comment here claimed it "can
// only narrow what is read", which is FALSE — a root swap substitutes the whole
// subject. The property that actually makes it safe is subject COHERENCE: English
// and mirrors are both resolved under the same root, so the split-brain state
// `check-debt-ratchet.js` guards against (a gate from one repo judging another)
// cannot arise. A wrong root gives a wrong-but-self-consistent answer, and the
// empty-value rejection above is what stops one arriving by accident.
const ROOT = resolve(opts.root ?? DEFAULT_ROOT);

// `I18N_TREES` carries the nested/flat shape per tree, so this does not restate
// "skills nests, the other three do not" — a second copy of that fact is how the
// mirror path and the walk drift apart.
const NESTING = new Map(I18N_TREES.map(({ dir, nested }) => [dir, nested]));
const englishPath = (tree, id) => (NESTING.get(tree)
  ? join(ROOT, tree, id, 'SKILL.md')
  : join(ROOT, tree, `${id}.md`));

// Resolve the tree by finding the id, rather than defaulting to `skills`: a
// guide and a skill may share a name, and guessing would compare the wrong pair.
let tree = opts.tree;
if (tree === null) {
  const found = TREES.filter((t) => existsSync(englishPath(t, opts.id)));
  if (found.length === 0) usageError(`no English source for id '${opts.id}' in any of: ${TREES.join(', ')}`);
  if (found.length > 1) usageError(`id '${opts.id}' exists in ${found.join(' and ')} — pass --tree`);
  [tree] = found;
} else if (!TREES.includes(tree)) {
  usageError(`--tree '${tree}' is not a content tree (${TREES.join(', ')})`);
} else if (!existsSync(englishPath(tree, opts.id))) {
  usageError(`no English source at ${englishPath(tree, opts.id)}`);
}

const english = readFileSync(englishPath(tree, opts.id), 'utf8');
const englishFences = extractFences(english);
const englishSeq = foldedTagSequence(englishFences).join(',');

// Mirrors come from the SSOT walk, NOT from a local `readdirSync(i18n).filter(isDirectory)`.
// That local predicate is a proxy for "is a locale" and it already disagreed: `i18n/glossaries`
// is a directory and is not a locale, so it entered the candidate set and was dropped only by
// a downstream `existsSync` on the mirror path. Harmless for every id today and exactly the
// drift that stops being harmless the day `i18n/glossaries/skills/<id>/` or an `i18n/_archive/`
// exists — at which point this tool and the parity corpus would silently disagree about what
// "the mirrors" are. Membership in the consumer's own accept-list, never a proxy for it.
// Filtered on BOTH id and tree, deliberately redundantly. `onlyTrees` narrows the
// walk and the predicate states what is being compared; either alone is sufficient,
// which is the point — with `--tree guides` on an id that also exists under
// `skills/`, dropping `onlyTrees` silently pulled in the skill's mirrors and no
// fixture noticed.
//
// Coverage note, so the redundancy is not "tidied away" later: mutating either
// guard alone SURVIVES, because the other still holds. Mutating both together is
// killed by `compares only the named tree when an id exists in two of them`. The
// pair is covered; neither member is, and that is the correct reading rather than
// two uncovered lines.
const mirrors = collectI18nTargets({ root: ROOT, onlyTrees: new Set([tree]) })
  .targets.filter((t) => t.id === opts.id && t.tree === tree)
  .map((t) => ({ locale: t.locale, path: t.absPath, relPath: t.relPath }));

if (mirrors.length === 0) {
  // Vacuity refusal: "0 divergences" over 0 files is the answer this tool exists
  // to never give. A typo'd id must not read as a clean propagation.
  console.error(`ERROR: id '${opts.id}' (tree '${tree}') has no translated mirrors — nothing to compare`);
  process.exit(2);
}

const gatedOrdinals = englishFences
  .map((f, index) => (isGated(f) ? index : -1))
  .filter((index) => index >= 0);

if (gatedOrdinals.length === 0) {
  // The second vacuity refusal, and it is the same shape as the first: "every frozen
  // fence agrees" over ZERO frozen fences is a clean-looking answer to a question that
  // was never asked. A skill whose fences are all `text`/`markdown` has nothing to
  // propagate, so reaching this is a wrong id far more often than a real query.
  console.error(`ERROR: id '${opts.id}' (tree '${tree}') has no frozen fences in English `
    + `(${englishFences.length} fence(s), all localisable) — there is nothing to verify`);
  process.exit(2);
}

const findings = [];
let mirrorsAligned = 0;
for (const mirror of mirrors) {
  const fences = extractFences(readFileSync(mirror.path, 'utf8'));
  if (foldedTagSequence(fences).join(',') !== englishSeq) {
    findings.push({
      locale: mirror.locale,
      path: mirror.relPath,
      kind: 'unalignable',
      detail: 'folded tag sequence differs from English — ordinal mapping is not sound, not compared',
    });
    continue;
  }
  mirrorsAligned++;
  for (const index of gatedOrdinals) {
    if (fences[index].body !== englishFences[index].body) {
      findings.push({
        locale: mirror.locale,
        path: mirror.relPath,
        kind: 'lags-english',
        ordinal: index,
        tag: englishFences[index].lang || 'untagged',
        detail: 'frozen fence body differs from English at HEAD of the working tree',
      });
    }
  }
}

// `mirrorsFound` and `mirrorsAligned` are separate because conflating them overstates
// coverage: an earlier single `mirrorsCompared` counted mirrors the tool had explicitly
// REFUSED to compare, so a run that examined nothing could report ten.
const summary = {
  id: opts.id,
  tree,
  mirrorsFound: mirrors.length,
  mirrorsAligned,
  englishFences: englishFences.length,
  frozenFences: gatedOrdinals.length,
  findings,
};

if (opts.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`${opts.id} (${tree}): ${mirrorsAligned} of ${mirrors.length} mirror(s) alignable, `
    + `${gatedOrdinals.length} frozen of ${englishFences.length} fence(s)`);
  for (const f of findings) {
    console.log(f.kind === 'unalignable'
      ? `  UNALIGNABLE ${f.path} — ${f.detail}`
      : `  LAGS        ${f.path} fence #${f.ordinal} (\`${f.tag}\`)`);
  }
  console.log(findings.length === 0
    ? `  OK — ${gatedOrdinals.length} frozen fence(s) byte-identical across ${mirrorsAligned} mirror(s)`
    : `  ${findings.length} finding(s)`);
}

process.exitCode = findings.length === 0 ? 0 : 1;
