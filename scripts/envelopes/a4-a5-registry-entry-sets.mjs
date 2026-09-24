/**
 * Envelope for integrity checks A4 and A5 — registry entry set vs disk (#648).
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/a4-a5-registry-entry-sets.mjs
 *
 * A4 and A5 compared `total_agents` / `total_teams` against a `find` count and nothing else. A
 * count is blind in two directions the READMEs are not: they render from the entry LIST, so a
 * file added with valid frontmatter and the total bumped — but with no `- id:` entry — kept both
 * numbers equal while appearing in no generated index. And a swap (one file added, one removed
 * in the same commit) leaves the number identical while both sides changed.
 *
 * ## Why every mutation here is an id RENAME
 *
 * The harness mutates file content; it cannot add or delete a file. A rename is the shape that
 * proves the point anyway, and proves it better than an addition would: renaming one `- id:`
 * leaves the entry COUNT untouched, so the count check stays green and only the set check can
 * fire. That is exactly #648's scenario — everything green, the item in no index — reproduced
 * without touching the totals at all.
 *
 * Every `expect` names a string that appears ON a `FAIL:` line, not on an indented detail line
 * beneath one. `gate-envelope.js` kills a case only when a SINGLE line contains both `FAIL` and
 * the expected substring, so the first version of this check -- one header FAIL plus indented
 * per-id detail -- reported [WRONG-RED] against a check that was naming the ids correctly. The
 * check now emits one `FAIL:` per discrepancy, which is better output and observable evidence.
 *
 * Cases 1 and 2 apply the same mutation and assert different halves of the output, because
 * "reports which side each discrepancy is on" is two claims, not one: a check that printed only
 * `only on disk` would satisfy a single-expect case while leaving the orphaned entry unnamed.
 */

export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

export const cases = [
  {
    label: 'A4: an agent id is renamed — the orphaned ENTRY is named',
    file: 'agents/_registry.yml',
    find: '  - id: r-developer\n',
    replace: '  - id: r-developer-typo\n',
    expect: 'only in registry (no file): r-developer-typo',
  },
  {
    // Same mutation, other half. The disk file is now unreferenced by any entry, which is the
    // literal #648 finding: it satisfies A1 and the count, and renders in no index.
    label: 'A4: an agent id is renamed — the unreferenced FILE is named',
    file: 'agents/_registry.yml',
    find: '  - id: r-developer\n',
    replace: '  - id: r-developer-typo\n',
    expect: 'only on disk (no registry entry): r-developer',
  },
  {
    label: 'A5: a team id is renamed — the set comparison fires for teams too',
    file: 'teams/_registry.yml',
    find: '  - id: r-package-review\n',
    replace: '  - id: r-package-review-typo\n',
    expect: 'teams: only on disk (no registry entry): r-package-review',
  },
  {
    // A DUPLICATE must be caught before `sort -u` collapses it. Two entries pointing at one
    // file would otherwise be forgiven by the very check meant to pair them one-to-one: the
    // uniqued set still equals disk, and nothing reports the second entry. A12 learned this
    // for guides; the same trap is reachable here.
    //
    // The mutation makes `code-reviewer` appear twice by renaming a DIFFERENT entry onto it,
    // which keeps the entry count at 75 — so again only the set logic can fire.
    label: 'A4: two entries sharing one id are caught before sort -u collapses them',
    file: 'agents/_registry.yml',
    find: '  - id: security-analyst\n',
    replace: '  - id: code-reviewer\n',
    // Names the duplicated ID, not just the fact of duplication. The check emitted a header
    // plus indented detail until an adversarial review pointed out that the offending id then
    // sits on a line the harness cannot assert -- so a case could pass while the check named the
    // wrong id, or no id at all.
    expect: 'has two entries sharing one id: code-reviewer',
  },
  {
    // FAIL-CLOSED. Renaming the section key makes the `sed` range match nothing, so the
    // extraction returns empty. Comparing an empty set against disk would report all 75 files
    // as missing — loud, but for the wrong reason, and the next reader "fixes" the registry.
    // The check names pattern drift instead.
    label: 'A4: a drifted section key reports pattern drift, not 75 missing files',
    file: 'agents/_registry.yml',
    find: '\nagents:\n',
    replace: '\nagentz:\n',
    expect: 'pattern drift, not a clean tree',
  },
];
