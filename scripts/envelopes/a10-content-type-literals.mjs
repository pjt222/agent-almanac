/**
 * Envelope for integrity check A10 — content-type literals outside JavaScript (#585).
 *
 * A10 asserts eight non-JavaScript content-type lists against `scripts/lib/content-types.js`.
 * This is the committed record of which of those assertions actually fire, produced by breaking
 * each one and watching the gate. Run it after touching A10, `content-types.js`, `NESTING`, or
 * any of the sites A10 reads:
 *
 *   npm run gate-envelope -- --spec scripts/envelopes/a10-content-type-literals.mjs
 *
 * Every `find` string below must match exactly the number of sites the case declares (`sites`,
 * default 1); the runner refuses otherwise, because a mutation that silently matches nothing
 * makes the whole envelope pass while proving nothing. Two cases here needed re-anchoring after
 * A10's own comments began quoting the commands they guard, creating a second match site — the
 * runner caught that rather than mutating an arbitrary one.
 *
 * Note the `expect: null` case at the end. It is not a failure — it is A10's one documented
 * non-guarantee, measured rather than asserted in prose.
 */

export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

export const cases = [
  {
    label: 'a fifth tree added to the SSOT',
    file: 'scripts/lib/content-types.js',
    find: "Object.freeze(['skills', 'agents', 'teams', 'guides'])",
    replace: "Object.freeze(['skills', 'agents', 'teams', 'guides', 'workflows'])",
    expect: 'but CONTENT_TYPES is',
  },
  {
    // The parse dying must FAIL, never pass quietly with an empty list — every site downstream
    // would otherwise go unchecked while the run stayed green.
    label: 'the SSOT parse breaks (const renamed)',
    file: 'scripts/lib/content-types.js',
    find: 'export const CONTENT_TYPES = Object.freeze',
    replace: 'export const CONTENT_TYPES_RENAMED = Object.freeze',
    expect: 'could not parse CONTENT_TYPES',
  },
  {
    // NESTING parsing to something non-empty that the SSOT does not contain. `skills: 1` would
    // instead yield an EMPTY list, caught one guard earlier by a different message — which is
    // how this case was mis-specified on its first writing.
    label: 'NESTING names a tree the SSOT does not have',
    // File corrected 2026-08-18: `NESTING` moved to scripts/lib/i18n-targets.js in #552
    // (9ad1b4019), and this case kept naming its old home. It has been silently INCONCLUSIVE
    // ever since — pre-existing rot, found only by running the envelope while working on #641.
    // The envelope is deliberately not in CI, which is exactly how a fixture rots unnoticed;
    // the count guard is what turns that rot into a visible refusal rather than a false pass.
    file: 'scripts/lib/i18n-targets.js',
    find: 'const NESTING = { skills: true, agents: false, teams: false, guides: false };',
    replace: 'const NESTING = { workflows: true, agents: false, teams: false, guides: false };',
    expect: 'derived no nested trees',
  },
  {
    label: 'a tree dropped from the full loop in validate-integrity.sh',
    file: 'scripts/validate-integrity.sh',
    find: 'for content_type in skills agents teams guides; do',
    replace: 'for content_type in skills agents teams; do',
    expect: 'must be full',
  },
  {
    label: 'a tree dropped from the full loop in the CI workflow',
    file: '.github/workflows/validate-translations.yml',
    find: 'for content_type in skills agents teams guides; do',
    replace: 'for content_type in skills agents teams; do',
    expect: 'must be full',
  },
  {
    // The case an "at least one full loop" rule let through: one loop degrades to the EXACT flat
    // form while another full loop survives, so a >=1 counter stays satisfied. This is why the
    // per-site rule exists.
    label: 'one full loop degrades to the exact flat form',
    file: '.github/workflows/validate-translations.yml',
    find: 'for content_type in skills agents teams guides; do',
    replace: 'for content_type in agents teams guides; do',
    expect: 'must be full',
  },
  {
    // The reverse direction, so the rule is two-sided rather than a rubber stamp that only ever
    // demands more trees.
    label: 'a loop keeps the full list after losing its nested branch',
    file: '.github/workflows/validate-translations.yml',
    find: 'if [ "$content_type" = "skills" ]; then',
    replace: 'if [ "$content_type" = "nothing" ]; then',
    expect: 'must be flat',
  },
  {
    label: "a case arm removed from the scaffolder's accept-rule",
    file: 'scripts/translate-content.sh',
    find: '  guides)\n    SOURCE_FILE="$ROOT/guides/$ID.md"',
    replace: '  guidez)\n    SOURCE_FILE="$ROOT/guides/$ID.md"',
    expect: 'case arms (the accept-rule)',
  },
  {
    label: 'the unknown-type message drifts from the accept-rule',
    file: 'scripts/translate-content.sh',
    find: 'Use: skills, agents, teams, guides',
    replace: 'Use: skills, agents, teams',
    expect: 'unknown-type message',
  },
  {
    // Per-FILE, not global: a pattern still matching the other file would otherwise satisfy a
    // global guard while this file went entirely unread.
    label: 'the loop pattern drifts in one file so that file is unread',
    file: 'scripts/validate-integrity.sh',
    find: 'for content_type in skills agents teams guides; do',
    replace: 'for ctype in skills agents teams guides; do',
    expect: "no 'for content_type in' loop in scripts/validate-integrity.sh",
  },
  {
    // B5's reference corpus: the same flat/nested split in a different shape, missed by #585's
    // inventory and by A10's first version.
    label: "B5's flat find drops a tree",
    file: 'scripts/validate-integrity.sh',
    // `-not` is in the command and not in A10's comment quoting it, which is what makes this
    // unique — the comment created a second match site and the runner refused to guess.
    find: "find agents teams guides -name '*.md' -not",
    replace: "find agents teams -name '*.md' -not",
    expect: "B5's flat find walks",
  },
  {
    label: "B5's SKILL.md find loses the nested tree",
    file: 'scripts/validate-integrity.sh',
    find: "find skills -name 'SKILL.md' -exec",
    replace: "find guides -name 'SKILL.md' -exec",
    expect: "B5's SKILL.md find walks",
  },
  // REMOVED 2026-08-18 (#641): 'the trigger path for a file A10 reads is removed'.
  // The property it measured no longer exists — validate-integrity.yml lost its paths filter so
  // the job could become a required status check, leaving no per-input path entry to delete.
  // Its branch is NOT gone, though, and an adversarial review caught that this comment first
  // claimed otherwise: `a10_covered` still runs whenever a filter is present, and re-adding a
  // scoped filter is the realistic regression once everyone notices every PR runs everything.
  // The last of the four A10d cases at the end of this file restores that coverage by
  // reintroducing a filter that misses one input. The other three cover the states the helper
  // must not read as universal: empty paths (rc=2), no event block (rc=1), paths-ignore (rc=3).
  // Recorded as a removal rather than deleted quietly: a case that vanishes looks identical in
  // the tally to one that never existed, and this file's whole job is to be read as a record.
  {
    // THE DOCUMENTED LIMIT, measured rather than asserted. Co-deletion removes the loop's nested
    // branch AND its list entry in one edit, leaving a well-formed flat loop with no signal in
    // the file that it ever handled the nested tree. The per-site rule cannot see it by
    // construction; the loop-only counter catches only TOTAL degradation, and here
    // validate-integrity.sh's full loop survives. Distinguishing "deliberately stopped handling
    // skills" from "accidentally stopped" needs a human-declared expectation.
    label: 'PARTIAL co-deletion of a loop branch and its tree',
    file: '.github/workflows/validate-translations.yml',
    find: [
      '          for content_type in skills agents teams guides; do',
      '            for locale_dir in i18n/*/"$content_type"/; do',
      '              [ ! -d "$locale_dir" ] && continue',
      '              locale=$(basename "$(dirname "$locale_dir")")',
      '              if [ "$content_type" = "skills" ]; then',
    ].join('\n'),
    replace: [
      '          for content_type in agents teams guides; do',
      '            for locale_dir in i18n/*/"$content_type"/; do',
      '              [ ! -d "$locale_dir" ] && continue',
      '              locale=$(basename "$(dirname "$locale_dir")")',
      '              if [ "$content_type" = "nope" ]; then',
    ].join('\n'),
    expect: null,
    why: "A10's one non-guarantee: co-deletion erases the signal the per-site rule keys on, and one full loop still remains so the counter is satisfied.",
  },
  {
    // A10d's THREE-state reader (#641). #641 removed this workflow's paths filter so the job
    // could become a required status check, and taught A10d that an absent filter means
    // universal coverage. The danger in that teaching is folding a BROKEN parse into the same
    // "universal" verdict — a drifted pattern would then report the strongest possible coverage
    // while having read nothing, which is the vacuous pass this whole file exists to measure.
    //
    // Here the `paths:` key is present and yields zero entries. That is state 2, and it must
    // FAIL rather than be mistaken for state "no filter at all".
    label: 'A10d: a paths: key that yields no entries is NOT universal coverage',
    file: '.github/workflows/validate-integrity.yml',
    find: '  pull_request:\n  workflow_dispatch:',
    replace: '  pull_request:\n    paths:\n  workflow_dispatch:',
    // The rc is IN the expect on purpose. Sharing one substring across the states would let a
    // helper that collapsed them all to a single rc kill every case and tell nobody.
    expect: '(rc=2) -- trigger coverage UNCHECKED',
  },
  {
    // The other failure state: no pull_request block at all. Distinct from an empty filter and
    // from no filter, and equally must not read as universal.
    label: 'A10d: a missing pull_request block is NOT universal coverage',
    file: '.github/workflows/validate-integrity.yml',
    find: '  pull_request:\n  workflow_dispatch:',
    replace: '  workflow_dispatch:',
    expect: '(rc=1) -- trigger coverage UNCHECKED',
  },
  {
    // `paths-ignore:` is a real filter, and the `-` defeats a `^    paths:` test. The first
    // version of wf_event_paths decided UNIVERSAL by the ABSENCE of that pattern, so this shape
    // returned "runs on everything" with rc 0 — measured, not theorised. It reproduces both
    // halves of #641 at once: a required check silently stops reporting on the excluded PRs and
    // hangs them on "Expected", while A10d reports full coverage. No workflow uses it today,
    // which is exactly why it needs a case rather than a reader's vigilance.
    label: 'A10d: a paths-ignore filter is NOT universal coverage',
    file: '.github/workflows/validate-integrity.yml',
    find: '  pull_request:\n  workflow_dispatch:',
    replace: "  pull_request:\n    paths-ignore:\n      - 'dreams/**'\n  workflow_dispatch:",
    expect: '(rc=3) -- trigger coverage UNCHECKED',
  },
  {
    // A10d's THIRD live branch: a present, non-empty list that fails to cover an A10 input.
    // #641 removed the filter, and the case that used to cover this branch went with it — but
    // the branch is still live code, and it is the realistic regression: someone re-adds a
    // scoped filter after noticing every PR now runs everything. `scripts/**` covers four of
    // the five A10 inputs through a10_covered's `*/**` arm and misses the fifth, which also
    // pins that glob semantics rather than leaving it as unexercised code.
    label: 'A10d: a reintroduced paths filter that misses an A10 input goes red',
    file: '.github/workflows/validate-integrity.yml',
    find: '  pull_request:\n  workflow_dispatch:',
    replace: "  pull_request:\n    paths:\n      - 'scripts/**'\n  workflow_dispatch:",
    expect: 'does not run on changes to it',
  },
];
