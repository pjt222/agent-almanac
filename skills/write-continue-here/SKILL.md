---
name: write-continue-here
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers recording
  the facts behind it, structuring the five sections, verifying the draft
  once, and installing it without losing the prior edition. Use when ending a
  session with unfinished work, handing off context between sessions, or
  preserving task state that git alone cannot capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
---

# Write Continue Here

Write a structured continuation file so the next session starts with full context. This is a short stop: one verification pass, then install. A handoff that must meet the full gate goes through `verify-continue-here` between Steps 3 and 4.

## When to Use

- Ending a session, or handing off a task, with work in progress whose intent, failed approaches and next steps git cannot capture

## Inputs

- **Required**: An active session with recent work to summarize; optionally, what to emphasize

## Procedure

### Step 1: Assess Session State and Record the Facts

Run `git log --oneline -5`, `git status` and `git diff --stat`, and review the conversation: the objective, what is done and what is partial, what failed and why, what was decided. Then write a **facts file** (`handoff-facts.md`, outside the repository or ignored by it): one line per fact you will cite, naming the command that produced it and quoting its output verbatim, for the range you actually read. Step 3's verifier drops a draft without one, and a claim that traces to no line is an assertion.

**Expected:** Every number, sha, quoted output and status line you will write has a line in the facts file.

**On failure:** Outside a git repository, skip the git commands; the facts file still records what you measured.

### Step 2: Resolve the Location, Then Draft

The draft belongs beside wherever the installed file goes. This is the **shared resolver**: `read-continue-here` Step 1 carries the same block byte-for-byte, and `scripts/test/continue-here-blocks.test.js` fails if the two ever diverge.

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done
if [ -n "$CONTINUE_FILE" ]; then
  echo "handoff: $CONTINUE_FILE"
else
  ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
    -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
  if [ -n "$ELSEWHERE" ]; then
    echo "no handoff at a resolved path, but one exists elsewhere:"
    echo "$ELSEWHERE"
  else
    echo "no handoff"
  fi
fi
```

Write `CONTINUE_HERE.draft.md` beside a resolved handoff; beside one at an unresolved path, so the next session is not handed two; or, for a first handoff, at the repository root. Fill every section from this session. Tag an unmeasured claim in place as `inferred`, `not re-measured`, `by-construction` or `the operator's call`, with a facts-file line saying why it was not measured, and never tag a sha, count or status line a reader would act on.

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: <branch> | HEAD: <short sha>
> Verified: <one of the three values in Step 3>

## Objective
Why, in one paragraph; git log shows what changed, not why.
## Completed
- [x] Finished items with key paths, and decisions with their rationale
## In Progress
- [ ] Partial work, specific enough to resume: branch, file:line, known issues
## Next Steps
1. The next action first; **[USER]** marks each item needing a user decision
## Context
- Failed approaches and why, constraints, links; each blocking finding Step 3 applied, with the line it changed
```

**Expected:** A draft at the resolved location, all five sections filled, every claim backed by the facts file or tagged.

**On failure:** If Write fails, check permissions on the resolved directory, not on the project root by assumption.

### Step 3: Read Back, Then Verify Once

Read the draft back: the timestamp is current, `Branch:` and `HEAD:` match `git branch --show-current` and `git rev-parse --short HEAD`, no placeholder is left, Next Steps are numbered, and In Progress says enough to resume. Then run `workflows/verify-handoff.mjs` once, from an almanac checkout or plugin install (`<almanac>` is two directories above the `realpath` of this skill's directory): `Workflow({ scriptPath: '<almanac>/workflows/verify-handoff.mjs', args: { drafts: [{ key, draft, facts, sources, context }], round: 1 } })`. `sources` names at least one file: the previous edition, which is the handoff still at the install path if one is there, else the newest archived edition, `CONTINUE_HERE.prev.md`, or for a consumed tracked handoff the file `git show "$(git rev-list -1 HEAD -- <path>)^:<path>" > <file>` writes; or the plan the work follows when there is none. Without a source the completeness lens is skipped, and `coverage.complete` can never be true.

Write the findings to a file beside the facts file, apply every blocking finding, list each in Context with the line it changed, and **do not re-run**. Record exactly one `Verified:` value:

- `single pass, N blocking applied, coverage <complete|incomplete>, findings <file>`
- `verify-handoff round N, 0 blocking, coverage complete` — only when this round returned `blocking` 0 and `coverage.complete` true
- `not run (workflow unavailable)`

One pass still leaves a blocking defect in about one handoff in three (10 of 32 measured, #1040); `read-continue-here` re-confirms what drifts for that reason. When the reader may not run it, or the next session is days away, use `verify-continue-here`.

**Expected:** A findings file, every blocking finding applied and listed in Context, and one honest `Verified:` value.

**On failure:** Answer a finding you disagree with in the draft (tag the claim, cite the fact), never by deleting the finding.

### Step 4: Install Without Losing the Prior Edition

Re-stamp the header. If a handoff still exists at the install path, archive it with the fence in `read-continue-here` Step 5 (`../read-continue-here/SKILL.md`, the one that guards `ARCHIVE_STATE`), with `CONTINUE_FILE` set to the install path and `ARCHIVE_STATE=superseded`, which moves it into the named archive or to `CONTINUE_HERE.prev.md`, or leaves a tracked edition to git history. Then `mv -n` the draft into place and check that the draft is gone, since some `mv` versions skip an existing target with exit 0. Over a tracked edition the fence left in place, use `mv -f`.

**Expected:** `CONTINUE_HERE.md` at the resolved location, no draft beside it, and the prior edition archived, kept as `CONTINUE_HERE.prev.md`, or in git history.

**On failure:** If the archive fence prints `REFUSED` (an unedited `<dir>`, or uncommitted changes to a tracked handoff), resolve that first; never clobber an edition nobody has consumed.

### Step 5: Name the Lifecycle — Do Not Enforce It

A handoff can be **tracked** or **ignored**; both are legitimate, and this skill never edits a project's `.gitignore` (#775). Detect the project's choice, with `CONTINUE_FILE` set to the path Step 4 installed:

```bash
: "${CONTINUE_FILE:?set this to the path Step 4 installed, or re-run the Step 2 resolver now that the file exists}"
HOME_DIR=$(dirname -- "$CONTINUE_FILE")
if ! git -C "$HOME_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "lifecycle: NOT IN A REPOSITORY — an ordinary file; deleting it is final"
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  echo "lifecycle: TRACKED — deletions are recoverable; every edition is in git log"
elif RULE=$(git -C "$HOME_DIR" check-ignore -v -- "$CONTINUE_FILE" 2>/dev/null); then
  echo "lifecycle: IGNORED — deletions are final; archive before consuming"
  echo "  decided by: $(printf '%s' "$RULE" | cut -f1)"
else
  echo "lifecycle: UNDECIDED — untracked and not ignored, the state most likely to be swept into an unrelated commit"
fi
```

It asks from the handoff's own directory, because `git` asked about another repository's path exits 128 for both checks; with no repository it says so rather than reporting UNDECIDED blind; `-v` names the deciding file, since a user-level `core.excludesFile` gives the same verdict for another reason; and `--` keeps a leading-dash path from being read as an option.

| | Tracked | Ignored |
|---|---|---|
| Consuming it | `git rm` plus a commit; `git log -p -- <path>` recovers every edition | `rm`; the content is gone unless it was archived first |
| A stray `git add -A` | harmless, it belongs in the repository | sweeps nothing, the ignore rule covers it |
| Cost | handoffs and their churn live in the project's history forever | no history, so an unconsumed edition can be destroyed by the next session |
| Suits | a repository whose handoffs are part of its record | a repository where the handoff is scratch between two sessions |

**UNDECIDED is the one state worth acting on:** the handoff, its draft and `CONTINUE_HERE.prev.md` are visible to `git add -A`, as they are under a bare-name ignore rule; only a glob (`CONTINUE_HERE*.md`) covers all three. Say so, and let the project choose.

**Expected:** The lifecycle is named, and whoever consumes the handoff knows whether deleting it is recoverable.

**On failure:** With no stated preference, report `UNDECIDED` and leave it; a `.gitignore` edited by a tool nobody asked is not obviously recoverable.

## Validation

- [ ] One `CONTINUE_HERE.md` at the resolved location, no draft beside it, no second handoff elsewhere
- [ ] Five real sections, and a header with an accurate timestamp, branch, `HEAD:` and `Verified:` value
- [ ] Every number, sha, quoted output and status claim traces to a facts-file line naming its command, or carries a tag the facts file explains
- [ ] `verify-handoff` ran once with a source, every blocking finding is applied and listed in Context, and the prior edition is archived, kept as `CONTINUE_HERE.prev.md`, or in git history, and the lifecycle is named, not changed

## Common Pitfalls

- **Placeholders, or duplicated git state**: record intent, partial state, next steps and failed approaches; git already has the diff.
- **Extrapolating a measurement, or pinning the absence of a bad value**: "every run since the 20th" needs the command that read those days, and "not X" passes when the value drifts to Y.
- **Re-running until green**: the quick path stops after one round; a loop belongs in `verify-continue-here`, which has a stop rule.

## Related Skills

- `read-continue-here` — the complement: reading, re-confirming, archiving and consuming the file
- `verify-continue-here` — the full verification loop, stopping at the first passing round
- `coordinate-peer-sessions` — a peer sharing this worktree may consume the same handoff
