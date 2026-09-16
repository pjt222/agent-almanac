---
name: write-continue-here
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.3"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
---

# Write Continue Here

Write a structured continuation file so the next session starts with full context.

## When to Use

- Ending a session with work still in progress
- Handing off a complex task between sessions
- Preserving intent, failed approaches, and next steps that git cannot capture
- Before closing Claude Code when mid-task

## Inputs

- **Required**: An active session with recent work to summarize
- **Optional**: Specific instructions about what to emphasize in the handoff

## Procedure

### Step 1: Assess Session State

Gather facts about recent work:

```bash
git log --oneline -5
git status
git diff --stat
```

Review the conversation context: what was the objective, what was completed, what is partially done, what was tried and failed, what decisions were made.

Record every measurement you will cite in a **facts file** (`handoff-facts.md`, outside the repository or ignored by it): one line per fact, each naming the command that produced it and quoting its output verbatim — the range you actually read, not the range you meant. A claim in the handoff that traces to no line here is an assertion; an output paraphrased here is an extrapolation the verifier cannot see.

**Expected:** Clear understanding of current task state — completed items, in-progress items, and planned next steps — and a facts file behind every number, sha, quoted output and status line you intend to write.

**On failure:** If not in a git repository, skip git commands. The continuation file can still capture conversational context and task state.

### Step 2: Resolve the Location, Then Write the Draft

A project does not necessarily keep its handoff at the repository root, and the draft belongs beside wherever the installed file goes. Resolve that first. This is the **shared resolver**: `read-continue-here` Step 1 carries the same block byte-for-byte, and `scripts/test/continue-here-blocks.test.js` fails if the two ever diverge.

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

Write the draft according to what it reports:

- **A resolved path** — the project already keeps its handoff there. Put the draft beside it, as `<dir>/CONTINUE_HERE.draft.md`; Step 3 installs over the existing file and refuses to clobber an unconsumed one.
- **A handoff at an unresolved path** — the project keeps it somewhere this skill does not look for it. Put the draft beside *that* file rather than at the root, so the next session is not handed two handoffs in two places.
- **No handoff at all** — this is the first one. Put the draft at the repository root, which the resolver checks first and which the SessionStart hook finds with no configuration.

Then write it — it becomes `CONTINUE_HERE.md` only after Step 3 — using the structure below. Every section must contain actionable content, not placeholders. Where a claim is not measured, tag it in place as `inferred`, `not re-measured`, `by-construction`, or `the operator's call`; a tag is allowed only where the facts file records why the measurement was not taken, and never on a sha, count, or status line a reader would act on.

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name
> Verified: verify-handoff round N, 0 blocking, coverage complete — or "not run (workflow unavailable)"

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

Guidelines:
- **Objective**: Capture the WHY — git log shows what changed, not why
- **Completed**: Mark items clearly done to prevent re-work
- **In Progress**: This is the highest-value section — partial state is hardest to reconstruct
- **Next Steps**: Number by priority. Prefix user-dependent items with `**[USER]**`
- **Context**: Record negative space — what was tried and rejected, and why

**Expected:** A `CONTINUE_HERE.draft.md` at the location Step 2 resolved, with all 5 sections populated with real content from the current session, every claim backed by the facts file or tagged. The timestamp and branch are accurate.

**On failure:** If Write fails, check file permissions. The draft belongs beside the installed handoff, at whichever of the three resolved locations Step 2 reported — not at the project root by assumption.

### Step 3: Verify the Draft, Then Install It

Read back `CONTINUE_HERE.draft.md` and confirm:
- Timestamp is current (within the last few minutes)
- Branch name matches `git branch --show-current`
- All 5 sections contain real content (no template placeholders)
- Next Steps are numbered and actionable
- In Progress items describe current state specifically enough to resume

Then verify it adversarially. Copy `workflows/verify-handoff.mjs` from agent-almanac into `.claude/workflows/` (workflows are not auto-installed) and run:

```js
Workflow({ name: 'verify-handoff', args: { drafts: [{
  key: 'this-repo',
  draft: '/abs/path/CONTINUE_HERE.draft.md',
  facts: '/abs/path/handoff-facts.md',
  sources: ['/abs/path/previous-edition.md'],   // the previous CONTINUE_HERE.md if one survives, else the plan the work follows
  context: 'what the file is, who consumes it, which repositories the agents must not read (the draft and facts file are the exception)',
}], round: 1 } })
```

Write the run's findings to a file beside the facts file (e.g. `handoff-findings-r1.md`), apply them, pass that file among `sources`, and re-run with the next `round`. The gate is the run's return value, not its log: **`blocking` is 0 and `coverage.complete` is true** — no dead or unusable lens, no dropped draft, and the completeness lens actually ran. Re-stamp the header immediately before installing, then install without clobbering an unconsumed prior handoff, in the directory Step 2 resolved: `mv -n <dir>/CONTINUE_HERE.draft.md <dir>/CONTINUE_HERE.md` (if a prior file still exists, read and archive it first). If the workflow is not available, record `Verified: not run (workflow unavailable)` in the header rather than skipping the step silently.

**Expected:** The installed file reads as a clear, actionable handoff that a fresh session could use to immediately resume work, and every claim in it survived a verifier that could see the facts file.

**On failure:** Edit sections that contain placeholder text or are too vague. Each section should pass the test: "Could a fresh session act on this without asking clarifying questions?" A verifier finding you disagree with is answered in the file (tag the claim, cite the fact), never by deleting the finding.

### Step 4: Decide the Handoff's Lifecycle — Once Per Project, and Do Not Enforce It

A handoff can be **tracked** or **ignored**, and both are legitimate. This step states the trade-off so the project can choose; it prescribes nothing, and this skill must not change a project's `.gitignore` to make the choice for it (#775). Earlier editions did: Step 2's On-failure told you to add `CONTINUE_HERE*.md` to `.gitignore` "if not", and Validation listed it as a box to tick. That silently ruled out half the design space, and it contradicted this skill's own complement — `read-continue-here` Step 5 branches on tracked-vs-untracked and treats both as normal.

Find out which one the project has already chosen, rather than assuming:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 2 block in this shell first}"
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  echo "lifecycle: TRACKED — deletions are recoverable; every edition is in git log"
elif git check-ignore -q "$CONTINUE_FILE" 2>/dev/null; then
  echo "lifecycle: IGNORED — deletions are final; archive before consuming"
else
  echo "lifecycle: UNDECIDED — untracked and not ignored, the state most likely to be swept into an unrelated commit"
fi
```

| | Tracked | Ignored |
|---|---|---|
| Consuming it | `git rm` plus a commit; `git log -p -- <path>` recovers every edition | `rm`; the content is gone unless it was archived first |
| A stray `git add -A` | harmless, it belongs in the repository | sweeps nothing, the ignore rule covers it |
| Cost | handoffs and their churn live in the project's history forever | no history, so an unconsumed edition can be destroyed by the next session |
| Suits | a repository whose handoffs are part of its record | a repository where the handoff is scratch between two sessions |

**UNDECIDED is the one state worth acting on.** An untracked, un-ignored handoff is visible to `git add -A` and belongs to neither lifecycle. Say so and let the project choose; do not choose for it.

Where the project has chosen *ignored*, the pattern must be a glob, not the bare name — Step 2 writes `CONTINUE_HERE.draft.md` first and renames only after verification, so `CONTINUE_HERE.md` alone leaves every draft untracked-but-visible, which is the edition most likely to be swept up. That is a note about what a correct ignore rule looks like, not an instruction to add one.

**Expected:** the lifecycle is named, and whoever consumes the handoff knows whether deleting it is recoverable.

**On failure:** outside a git repository the question does not arise — the handoff is an ordinary file and deleting it is final. If the project has no stated preference, report `UNDECIDED` and leave it; a handoff written under the wrong lifecycle is recoverable, a `.gitignore` edited by a tool nobody asked is not obviously so.

## Validation

- [ ] The installed CONTINUE_HERE.md is at the location Step 2 resolved, and there is not a second one elsewhere
- [ ] File contains all 5 sections with real content (not placeholders)
- [ ] Timestamp and branch are accurate
- [ ] The handoff's lifecycle is named — TRACKED, IGNORED, or UNDECIDED — and not changed by this skill
- [ ] Next Steps are numbered and actionable
- [ ] In Progress items specify enough detail to resume without questions
- [ ] Every number, sha, quoted output and status claim traces to a line of the facts file from Step 1 that names the command which produced it, or is tagged in place as `inferred`, `not re-measured`, `by-construction`, or `the operator's call` where the facts file records why the measurement was not taken — and no sha, count, or status line a reader would act on carries a tag
- [ ] The draft was verified adversarially in Step 3 (`verify-handoff`, traceability + completeness + actionability, against the facts file and the previous edition if one survives, else the plan) and the last run returned `blocking: 0` with `coverage.complete: true` before the draft was renamed to `CONTINUE_HERE.md` — or, if the workflow is not installed, the header records `Verified: not run (workflow unavailable)`

## Common Pitfalls

- **Writing placeholders instead of content**: "TODO: fill in later" defeats the purpose. Every section must contain real information from the current session.
- **Duplicating git state**: Do not list every file changed — git already tracks that. Focus on intent, partial state, and next steps.
- **Forgetting the Context section**: Failed approaches are the most valuable thing to record. Without them, the next session will retry the same dead ends.
- **Overwriting without reading**: If CONTINUE_HERE.md already exists from a prior session, read it first — it may contain unfinished work from an earlier handoff.
- **Leaving stale files**: CONTINUE_HERE.md is ephemeral. After the next session consumes it, delete it. Stale files cause confusion — and so does a leftover `CONTINUE_HERE.draft.md`, which the next session may mistake for the installed one.
- **Extrapolating a measurement**: "every run since the 20th" written from a `tail -6` that showed three days is an assertion, not a measurement. Quote the command that ran, and if the claim needs more days, read them. The verification workflow flags this only when the facts file records the command that actually ran — paste real output, never a paraphrased range.
- **Claiming a section is unchanged when part of it was regenerated**: a section can be byte-identical through its last paragraph and still contain a subsection rewritten today. Scope the claim to what you compared.
- **Pinning the absence of the last bad value**: a status line that says "not X" passes when the value drifts to Y. State the value.

## Related Skills

- `read-continue-here` — the complement: reading and acting on the continuation file at session start
- `bootstrap-agent-identity` — cold-start identity reconstruction that consumes the continuation file this skill produces
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `commit-changes` — save work to git before writing the continuation file
- `write-claude-md` — project instructions where optional continuity guidance lives
- `coordinate-peer-sessions` — a peer sharing this worktree may consume the same `CONTINUE_HERE.md`; that skill is where a path-scope declaration belongs so the two sessions do not both act on it
