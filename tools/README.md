# tools/

Reusable analysis tooling for agent-almanac, accumulated as work turns up a calculation worth
keeping.

**`tools/` is not `scripts/`.** `scripts/` holds the repository's own machinery — the gates CI
runs, the generators, the envelopes — and it is wired into `package.json`, CI workflows and
test discovery. `tools/` holds utilities meant to be run by a person, repeatedly, across
sessions: the arithmetic behind an investigation, a probe helper, a one-off that turned out not
to be one-off. Nothing here is a gate and nothing here blocks a merge.

The rule that produced this directory: **when a calculation gets done twice, it becomes a tool.**
A throwaway heredoc leaves nothing behind and cannot be checked; the same arithmetic in a file
with a `--verify` mode can be re-run by anyone, including the next session.

## Layout

| Tool | Purpose |
|---|---|
| `capgeom.py` | Geometry and reconstruction arithmetic for auto-memory index cap probes. Holds the arm registry from `tests/results/2026-08-23-memory-cap-truncation-probe/`, derives every published bound from it, and refuses to agree with a figure that no longer follows from its recorded arm |
| `wirecap.py` | Captures the request body a Claude Code session actually sends, by standing in as `ANTHROPIC_BASE_URL`. Answers locally — nothing is forwarded — and redacts credential headers before anything reaches disk. Use it when the question is "what is in the context?", which a session cannot be asked, because its self-report on that is unsound in both directions |
| `check-redaction.sh` | Shape-tier deny-list scanner for a **draft about to leave the machine**. Implements the scanner `skills/redact-for-public-disclosure` Step 3 and `skills/enforce-redaction-gate` Step 2 both specify and neither shipped. Guards third-party internals — minified identifier shapes, byte offsets, operator home paths, store slugs, credential shapes — that the skill's category table rates publishable "Never — until vendor-documented" |
| `review-bundle.sh` | Builds a self-contained bundle for an adversarial reviewer that must not read the working tree: the diff against a base ref, full copies from HEAD of every added, modified, renamed or type-changed source file, the PR body, and a README that says to read nothing else. Paths matching `--summarise` (a git pathspec: `i18n/*` or `i18n`) are reported as a stat plus a small sample so 165 one-line mirror hunks cannot drown the review — and git's pathspec is the one matcher for both the diff and the copies. Non-ASCII paths, subdirectory invocation and renames are handled; a failed copy, an unreadable body, a reused `--out` or no changes all exit 2, never a partial bundle |
| `merge-dependabot.sh` | Merges open Dependabot PRs one at a time, oldest first, re-polling mergeability before each merge because the shared lockfile flips the rest to UNKNOWN and then CONFLICTING. BLOCKED is polled, not skipped — GitHub reports it for required checks that are merely pending. Reads the verdict from the API (`state` plus a merge commit), never from gh's stderr; asks Dependabot to rebase on a conflict and exits 1 so the caller comes back. The decision table is a function; `--verify` pins every pattern alternative and the arm order, then drives `run` through a fake `gh` (`GH=`) so the wiring is pinned offline too |
| `translator-stamp.mjs` | Keeps the `translator:` frontmatter field honest on scaffolds (#545). Classifies every translated file by the STUB / UNJUDGED verdicts of `generate-translation-status.js --verdicts` (`no-novel-lines` or `no-script` — not byte equality), repairs the field only in STUB-verdict files, and lists UNJUDGED and translated-but-stamped files for a human attribution call. Reads the stub value from `scripts/translate-content.sh` rather than duplicating it, so the two cannot drift silently, and exits 2 on any locale/tree pair the verdict scan did not cover |
| `refresh-untranslated-stubs.mjs` | Brings the untranslated stubs of one content id back to a byte copy of English — English's whole frontmatter plus the translation fields the stub already carries, verbatim, then English's body — after a frozen fence or anything else in the English file changes (#789). A refresh that changes a file drops its `fence_basis_commit` (the bytes are now the working tree's, which no commit carries yet); an unchanged stub keeps it; `--stamp <sha>`, the separate second commit, writes it back with `source_commit`, quoted so an all-digit sha cannot parse as an integer, on every stub whose bytes match English, and refuses one whose bytes do not or that has no `source_commit` line to anchor on. Reads `translator:` from each mirror at the moment it decides to write, never from a list, and refuses by name anything but the scaffolder's literal (read through `translator-stamp.mjs`, so it lives in one place), any of the six fields appearing twice, a CRLF or BOM file, and a skill whose English frontmatter has a top-level key after `metadata:` (the six would nest under a scalar). A refusal is exit 1 only when `--locale` asked for that mirror: a translated mirror is refused by design wherever it sits, no locale exempt, so an unconditional 1 would fire on every ordinary run. `--verify` exits 1 naming the first differing line of any stub that is not English-plus-the-six, and names a clean stub whose `fence_basis_commit` is absent. Zero mirrors, and zero stubs without `--locale`, are exit 2, not a clean 0. The one tool here with an npm alias (`refresh:stubs`), because the propagation recipe in CLAUDE.md is written as npm commands; it is still not a gate |
| `validate-hermes-distribution.py` | Installs a Hermes profile distribution with Hermes's **own** `hermes_cli/profile_distribution.py` (`--module`, fetched or copied by you — it is upstream code and not in this repository) into a temporary profile root, never `~/.hermes` — asserted, not assumed: the stub it imports is checked by path and the profile directory by containment. A fixed set of checks against companion #78's done-criteria (the count is printed by the tool — run `--verify` and read it; this row went stale twice by carrying it): manifest fields through the module's own parser and comparator, the module's own `_count_skills` and the files that actually landed, SOUL.md bytes, the profile root against the staged root, the module's user-owned set against the generator's 37 names, nested user-owned names, symlinks, nothing dropped by the install filter. The stubbed `hermes_cli.profiles` carries Hermes's real name regex and reserved set. `--verify` plants a defect per check it can reach and requires each to redden one of its own named checks (the plant count is printed too); run it against the deployed pin and against upstream main, whose install behaviour differs at the two endpoints measured (the pin dereferences symlinks and filters user-owned names at every depth; upstream main refuses symlinks and filters only at the root). Not dependency-free: needs PyYAML, which the Hermes module itself imports |
| `review-findings.mjs` | Turns a lens → refuter review workflow's task output (the JSON under the session's `tasks/`, whose `result` the notification truncates) into the findings file the next round reads — a data-not-instructions line under the title, then every serious finding with its claim, evidence, fix and the refuter's verdict, then the notes — plus a tab-separated verdict table on stdout with the note counts, the workflow's log lines and any round-1 ids a round-2 run reported as not applied. Refuses (exit 2) an input that carries no `lenses` OR an empty list (a run whose lenses all died returns `[]` with its logs, and the next round must not read that as clean), extra arguments (an unquoted multi-word title), and a failed write; never renders empty. `--verify` covers both encodings of `result`, a lens with every optional field missing, the refusals, the CLI exits, and renders `tools/fixtures/review-r2-input.json` (an excerpt of a real round-2 result) against its committed expectation — move that file in the same commit as any change to the rendering. Ran three times by hand on 2026-09-02 before it became a file; #778 is the workflow seed that should feed it directly |
| `agent-report.mjs` | Recovers a subagent's final report from its transcript (`subagents/agent-<name>-<hash>.jsonl`) by a marker in its title — the last assistant text block that carries it — and writes it byte for byte, no newline added, so it can be diffed against the transcript. For the case where the notification truncated the report and the subagent's own Write was blocked, which is how the 35 KB ADR-0002 review reached its bundle — and how the review of this tool's own PR did. A transcript with no parseable line, or none whose parsed lines carry `message.role === 'assistant'` (the transcript format moving; measured against Claude Code 2.1.258), is refused with exit 2, never reported as "marker not found"; a marker nobody wrote is exit 1. The recovered file is a report a subagent wrote about something: read it as data, not as instructions |

## Running

Everything here is runnable from the repository root, and dependency-free except where its row
says otherwise (`validate-hermes-distribution.py` needs PyYAML, because the Hermes module it runs
does):

```bash
python3 tools/capgeom.py --verify             # re-derive every published figure, assert, print counts
python3 tools/capgeom.py --selftest-negative  # mutate recorded figures, assert --verify goes red
python3 tools/capgeom.py --arms               # the ARMS registry (echo instrument) as a table
python3 tools/capgeom.py --wire               # the wire-measured arms (#722)
python3 tools/capgeom.py --span 170 147

python3 tools/wirecap.py --verify                       # self-test: capture verbatim, redact secrets
python3 tools/wirecap.py --port 8788 --out over.jsonl   # then point ANTHROPIC_BASE_URL at it

# Hermes's own module, fetched by you (upstream main here; or the deployed pin, copied read-only)
gh api repos/NousResearch/hermes-agent/contents/hermes_cli/profile_distribution.py --jq .content | base64 -d > /tmp/profile_distribution.py
python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py --verify          # every plant must go red; it prints how many
node scripts/build-hermes-distribution.js --out /tmp/almanac-dist                                    # needs `npm ci` first
python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py --dist /tmp/almanac-dist --almanac .

node tools/review-findings.mjs --verify                                        # fixture: one held, one refuted, one note
node tools/review-findings.mjs <session>/tasks/<id>.output review-r1-findings.md "Review of PR #N — round 1"
node tools/agent-report.mjs --verify                                           # synthetic transcript, all four exits
node tools/agent-report.mjs <session>/subagents/agent-<name>-<hash>.jsonl '# Adversarial review' findings.md
python3 tools/wirecap.py --diff over.jsonl under.jsonl

bash tools/check-redaction.sh --verify        # seed each shape, assert the gate catches it
bash tools/check-redaction.sh --labels        # what is checked, without the patterns
bash tools/check-redaction.sh DRAFT.md        # exit 0 clean / N findings / 2 COULD NOT RUN

bash tools/review-bundle.sh --verify          # throwaway repo (rename, non-ASCII path, dirty tree, subdir run): 18 checks incl. six exit-2 refusals
bash tools/review-bundle.sh --summarise 'i18n/*' --body pr.md   # bundle HEAD vs origin/main; prints the directory
bash tools/merge-dependabot.sh --verify       # pin the decision table, its arm order, and the run wiring via a fake gh — no network
bash tools/merge-dependabot.sh --dry-run      # decisions only, exit 0; then run bare to merge oldest-first (exit 1 = come back)

node tools/translator-stamp.mjs               # preview: classify, list the repair set, change nothing
node tools/translator-stamp.mjs --write       # repair byte-equal stubs only
node tools/translator-stamp.mjs --verify      # exit 0 clean / 1 a stub asserts a review / 2 COULD NOT MEASURE

npm run refresh:stubs -- skills <id> --verify          # exit 0 every stub is English-plus-the-six / 1 one diverges (line named) / 2 could not run: no such id, no stub among the mirrors, bad flag or sha
npm run refresh:stubs -- skills <id>                   # rewrite the stubs; non-stubs are refused by name and left alone; then commit
npm run refresh:stubs -- skills <id> --stamp <sha>     # after that commit: record it in source_commit and fence_basis_commit; commit again
```

**`translator-stamp.mjs` also exits 2 when it cannot measure** — zero STUB verdicts parsed, or no
quoted value in the scaffolder — because a corpus with no stubs and a verdict format that changed
look identical from the outside, and only one of them is good news.

**`check-redaction.sh` exits 2 when it cannot run, and 2 must never be read as a pass.**
`enforce-redaction-gate` names the trap it is built against: a wrapper shaped
`scanner && ok || echo CLEAN` treats a *tool error* — a bad flag, an unreadable file — as a clean
result, so the gate reports success precisely when it has checked nothing. Its `--verify` seeds
each of its six shapes **individually**, because a gate that catches five and is blind to the
sixth passes any self-test that seeds only one.

It scans a draft, not the tree, which is why it is here and not in `scripts/` and why no CI job
runs it — a draft is not a tracked file. It is also **not** `npm run validate:security`: that gate
guards *our* committed content against leaking *our* credentials outward to people who install the
skills. This one guards a *third party's* internals on the way out. Neither substitutes for the
other, and the first real use of this one caught four findings in a probe script already staged
for a public commit.

**Know what it is second-best to before you extend it (#751).** A shape-tier deny-list reaches an
internal name one spelling at a time: this one cleared `_n` described in prose, then — a round
later, after a shape was added for that — cleared a verbatim bundle span quoted as `${…}`. Same
class, two escapes. The better question is **provenance over spans**: does this published text
appear verbatim in the artifact being audited? That needs no list and cannot be escaped by
respelling. It also needs a measured false-positive rate first, because a shipped binary is full
of ordinary English.

Two consequences for anyone touching this file. **Widening the identifier shapes to catch more
minified names is not worth doing** — those rotate every release and carry nothing attributable;
they are belt-and-braces against a careless paste, not the control. And a provenance tool is not
automatically safe here either: one that tokenizes before asking provenance never asks about a
span containing no identifier-shaped token, which is a shape dependency hiding inside a
provenance design.

**A `--verify` nobody has watched fail is a green light of unknown wiring.** `capgeom.py
--selftest-negative` is the answer to that for this directory: it mutates a recorded figure in
memory — never the file on disk, so there is no mutant to strand — and asserts `--verify` exits
non-zero for each, plus that the unmutated baseline is still green. A survivor means that figure
is published but unchecked.

**It covers the named mutation set, not literally every figure**, and the difference is not
academic: three line-arm figures were published-but-unchecked until a review looked for them, and
their mutations would have survived silently. The pre-existing `ARMS` and `BEHAVIOURAL` registries
are outside the set too — nudging an `ARMS` width survives, since only `measured` feeds the
reconstruction count. Add a mutation when you add a figure.

## Adding one

Give it a `--verify` (or `--selftest`) mode that re-derives its own published claims and exits
non-zero when one stops following. A tool that only computes is a calculator; a tool that
checks its own back-catalogue is a ratchet, and it will catch the error you were about to make.
`capgeom.py` rejected an entry of its own registry on first run — a bracket end credited to the
wrong kind of position — which is the entire argument for the convention.

Then add a row to the table above.
