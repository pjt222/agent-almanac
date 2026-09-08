/**
 * Envelope for integrity check B14 (#806, #807) — the tools registry against disk, and the
 * wiring that runs it.
 *
 * `scripts/test/tools-registry.test.js` proves the reader, the schema and the three parity
 * directions against throwaway fixtures. This proves the WIRING: the gate here is
 * `bash scripts/validate-integrity.sh`, the exact command `validate-integrity.yml` runs, so a
 * defect the checker reports but the shell block swallows cannot pass unnoticed. Every case
 * mutates the real registry or the real integrity script, against the real `tools/`.
 *
 * It replaces a scratchpad proof (three arms driven by hand on 2026-09-08, before #807's first
 * commit) whose log the round-1 reviewer could not tie to any sha: this harness restores from an
 * in-memory buffer, refuses a stale backup, and requires each case to name the FAIL substring it
 * must produce, so a run that goes red for an unrelated reason is not a kill.
 *
 * Each gate run takes a few minutes on a WSL/NTFS checkout (the integrity script walks the whole
 * corpus); the envelope is four runs plus the baseline. On a native filesystem each is well
 * under a minute.
 *
 * Result at introduction, 2026-09-08, on 7f8f974ce (WSL/NTFS, about 22 minutes end to end):
 *
 *     gate-envelope: 4 killed of 4 case(s).
 *
 * The third parity direction — something under tools/ that is not a plain file — needs a
 * directory or symlink to exist, which a find/replace cannot create; `tools-registry.test.js`
 * pins it with a fixture, and the CLI's FAIL line for it is asserted there.
 *
 * A second limit, recorded rather than papered over (round-2 N4): the B14 shell guard is a
 * redundant pair — it fails on a non-zero exit OR a missing `OK:` line — and every case here
 * trips both at once, because a checker that exits 1 suppresses its `OK:` line by construction.
 * Deleting either half of the guard alone leaves this envelope at 4 of 4. The mutant that would
 * separate them (exit non-zero while still printing `OK:`) produces no FAIL substring for this
 * harness to require, so the pair is covered as a pair, per the repository's own rule for
 * redundant guards; `tools-registry.test.js` pins the checker's side of the contract instead.
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/b14-tools-registry.mjs
 */
export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

const REGISTRY = 'tools/_registry.yml';

// The last row of the registry, verbatim; both parity cases anchor on it. A change to that row
// makes the harness refuse (zero sites) rather than mutate the wrong thing.
const HERMES_ROW = [
  '  - id: validate-hermes-distribution',
  '    path: tools/validate-hermes-distribution.py',
  '    language: python',
  '    status: active',
  '    superseded_by: null',
  '    description: "Installs a Hermes profile distribution with Hermes\'s own profile_distribution.py into a temporary root and checks it against the companion\'s done-criteria"',
  '    need: "Validating a built Hermes profile distribution against Hermes\'s own installer before it is published."',
  '    not_for: null',
  '    tag: null',
  '    invoke: "python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py --dist /tmp/almanac-dist --almanac ."',
  '    verify: "python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py --verify"',
  '    verify_in_ci: false',
  '    verify_skip_reason: "needs Hermes\'s profile_distribution.py fetched from the upstream repository and PyYAML — a live third-party fetch, which no CI job of this repository should depend on"',
  '    deps: "PyYAML; hermes_cli/profile_distribution.py fetched by the caller"',
  '    promoted_from: "commit fedbd9fcc (#777), the Hermes profile distribution"',
  '    issue: "777"',
  '',
].join('\n');

const PHANTOM_ROW = [
  '  - id: phantom-probe',
  '    path: tools/phantom-probe.sh',
  '    language: bash',
  '    status: active',
  '    superseded_by: null',
  '    description: "A row the envelope adds for a file that does not exist"',
  '    need: "Proving the row-without-file direction goes red."',
  '    not_for: null',
  '    tag: null',
  '    invoke: "bash tools/phantom-probe.sh"',
  '    verify: "bash tools/phantom-probe.sh --verify"',
  '    verify_in_ci: true',
  '    deps: null',
  '    promoted_from: null',
  '    issue: null',
  '',
].join('\n');

export const cases = [
  {
    label: 'ROW WITHOUT FILE: a valid row for a path that is not on disk',
    // `total_tools` is left at 10, so the total check fires as well; the expectation names the
    // parity line, which is the direction under test, and the total line is a second FAIL beside it.
    file: REGISTRY,
    find: HERMES_ROW,
    replace: HERMES_ROW + PHANTOM_ROW,
    expect: 'FAIL: row without file: tools/phantom-probe.sh',
  },
  {
    label: 'FILE WITHOUT ROW: the Hermes validator loses its row, the file stays on disk',
    file: REGISTRY,
    find: HERMES_ROW,
    replace: '',
    expect: 'FAIL: file without row: tools/validate-hermes-distribution.py',
  },
  {
    label: 'TOTAL DRIFT: total_tools bumped without a row',
    file: REGISTRY,
    find: 'total_tools: 10\n',
    replace: 'total_tools: 11\n',
    expect: 'FAIL: schema: registry: `total_tools` is 11 but the list carries 10 row(s)',
  },
  {
    label: 'WIRING: the B14 block runs nothing and exits 0',
    // The shell block requires the OK: line as well as exit 0 (the A7b argument). A checker
    // reached through a path its entry guard stopped matching exits 0 having printed nothing;
    // this is that shape, and the block must go red on it.
    file: 'scripts/validate-integrity.sh',
    find: '  b14_out=$(node scripts/check-tools-registry.js 2>&1) || b14_rc=$?\n',
    replace: '  b14_out=$(true) || b14_rc=$?\n',
    expect: 'FAIL: B14 exited 0 without printing its OK: line, so it did not run',
  },
];
