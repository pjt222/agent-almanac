import { readFileSync } from 'node:fs';

/**
 * Envelope for `scripts/check-bare-substitutions.js` itself (#647).
 *
 * The gate above it (`a6a-abort-capable-substitutions.mjs`) measures what
 * `validate-integrity.sh` reports. This one measures whether the lint that guards it can go
 * red at all, and for the right reason:
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/bare-substitution-lint.mjs
 *
 * Worth stating why this file exists separately rather than as three more cases over there.
 * The a6a envelope's third case is `expect: null` — an unguarded extraction is only fatal when
 * a corpus file ALSO lacks the field, and one mutation cannot produce both. So the dynamic
 * gate structurally cannot demonstrate the defect, and a static check is the only thing that
 * can. A static check nobody has broken on purpose is a claim, not a control.
 */

export const gate = { command: ['node', 'scripts/check-bare-substitutions.js'] };

/**
 * Line number of a unique substring in a repo file, resolved AT LOAD TIME.
 *
 * The three killing cases assert `<file>:<line> can abort the script`, because the checker's one
 * FAIL template makes a bare tail substring tautologically true of any FAIL it can emit -- the
 * `file:line` half is what makes [WRONG-RED] reachable at all. Line numbers are therefore load
 * bearing and, hand-written, permanently stale: #648 inserted a function into
 * `validate-integrity.sh` and moved the site TWICE in one session, each time turning a working
 * lint into a [WRONG-RED] accusation.
 *
 * So the number is derived from the same anchor the mutation uses, and this throws rather than
 * guessing when the anchor is missing or ambiguous -- an expect built from a wrong line silently
 * un-asserts the half it exists to assert.
 */
function lineOf(file, needle) {
  const lines = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8').split(/\r?\n/);
  const hits = lines.flatMap((line, index) => (line.includes(needle) ? [index + 1] : []));
  if (hits.length !== 1) {
    throw new Error(`lineOf: ${hits.length} match(es) for ${JSON.stringify(needle)} in ${file}; need exactly 1`);
  }
  return hits[0];
}

const REGISTRY_TOTAL_ANCHOR = "reg_count=$(grep 'total_agents:'";

export const cases = [
  {
    // The regression the lint exists to stop: someone "tidies away" a guard.
    label: 'a guard is removed from a registry-total extraction',
    file: 'scripts/validate-integrity.sh',
    find: "reg_count=$(grep 'total_agents:' agents/_registry.yml | tr -d '\\r' | awk '{print $2}' || true)",
    replace: "reg_count=$(grep 'total_agents:' agents/_registry.yml | tr -d '\\r' | awk '{print $2}')",
    // The expect names the SITE, not just the message. The checker has one FAIL template
    // (`FAIL: <file>:<line> can abort the script`), so a bare tail substring is tautologically
    // true of any FAIL it can emit -- the `file:line` half went unasserted and gate-envelope's
    // [WRONG-RED] branch was dead for all three killing cases. Demonstrated, not theorised:
    // case 3 kills at bulk-scaffold-caveman.sh:14, and deleting the annotation on the line
    // directly ABOVE it also killed, same expect, adjacent site.
    //
    // The line number is DERIVED, not written down. Hand-maintained it went stale twice in one
    // session as #648 grew the file above it, each time reporting [WRONG-RED] against a lint
    // that had fired correctly -- a false accusation is the one thing an envelope must not
    // produce, since its whole purpose is to be believed about whether a check works.
    expect: `scripts/validate-integrity.sh:${lineOf('scripts/validate-integrity.sh', REGISTRY_TOTAL_ANCHOR)} can abort the script`,
  },
  {
    // The other way to defeat it: keep the code, drop the annotation that justified it. An
    // `# abort-ok:` is a claim about the pipeline, so deleting it must reopen the finding
    // rather than leave a site silently exempt.
    label: 'an abort-ok annotation is deleted',
    file: 'scripts/translate-content.sh',
    find: ' # abort-ok: awk exits 0 when no line matches; the -z check on the next line is the reader',
    replace: '',
    expect: `scripts/translate-content.sh:${lineOf('scripts/translate-content.sh', 'CLOSE_LINE=$(awk')} can abort the script`,
  },
  {
    // DEFAULT-DENY, measured. The tempting design is a list of dangerous commands; this one
    // enumerates the SAFE commands instead, so a pipeline built from something nobody
    // anticipated is flagged rather than waved through. `jq` is on no list in this repo.
    label: 'a substitution piping through an unknown tool is not silently exempt',
    file: 'scripts/bulk-scaffold-caveman.sh',
    find: "TODAY=$(date +%Y-%m-%d)",
    replace: "TODAY=$(date +%Y-%m-%d | jq -R .)",
    expect: `scripts/bulk-scaffold-caveman.sh:${lineOf('scripts/bulk-scaffold-caveman.sh', 'TODAY=$(date')} can abort the script`,
    // `date` alone is on the safe list, so the unmutated line is reported `safe`. Adding one
    // unknown command to the pipeline is what has to flip it — which is the property that
    // separates an enumerated-safe list from an enumerated-dangerous one.
  },
  {
    // A MEASURED NON-GUARANTEE. `local x=$(…)` does not abort — the status becomes `local`'s,
    // which is always 0 — so it is deliberately out of scope, and the scanner skips it. That
    // makes it the obvious hole to walk through, and the obvious "bug report" to file against
    // this lint. It is neither: the inverse hazard (a silently empty value where the author
    // expected an abort) is real but is a different check, and folding it in here would make
    // every finding mean two incompatible things.
    label: 'a `local` assignment is NOT reported (documented scope limit)',
    file: 'scripts/validate-integrity.sh',
    find: '  local file="$1" ev="$2" block entries',
    replace: '  local file="$1" ev="$2" block entries\n  local probe=$(grep -c nonexistent-pattern "$1")',
    expect: null,
    why: '`local x=$(…)` cannot abort under set -e — the status is `local`\'s, always 0 — so it is out of this check\'s scope by construction, not by oversight.',
  },
];
