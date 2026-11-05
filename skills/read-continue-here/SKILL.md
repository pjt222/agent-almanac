---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, parsing the structured handoff, confirming the resumption plan
  with the user, and cleaning up after consumption. Optionally configures a
  SessionStart hook and CLAUDE.md instruction for automatic pickup. Use at the
  start of a session when a continuation file exists, when bootstrapping after
  an interrupted session, or when setting up automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.2"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
---

# Read Continue Here

Read a structured continuation file and resume work from where the prior session left off.

## When to Use

- Starting a new session and a CONTINUE_HERE.md exists anywhere this skill resolves
- After a SessionStart hook injects continuation context
- Bootstrapping identity and detecting prior session artifacts
- Setting up automatic continuation detection for a project (one-time infrastructure)
- Re-running Step 6 after upgrading from 1.x — the hook 1.x installed emits a JSON
  shape Claude Code discards, so it never injected anything and must be replaced (#844)

## Inputs

- **Required**: A project directory (defaults to current working directory)
- **Optional**: Whether to configure infrastructure (SessionStart hook + CLAUDE.md instruction)
- **Optional**: Whether to delete the file after consumption (default: yes)

## Procedure

### Step 1: Resolve and Read the Continuation File

Projects do not all keep the handoff in the same place, so resolve it rather than assuming. This is the **shared resolver**: `write-continue-here` carries the same block byte-for-byte, and `scripts/test/continue-here-blocks.test.js` fails if the two ever diverge.

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

Three properties of that block are load-bearing, and each fixes a way version 1.0 failed silently:

- **It anchors on the repository root, not on `$PWD`.** Run from a subdirectory, 1.0 looked for the handoff beside wherever the session happened to be standing and reported nothing.
- **The candidate list is ordered and the first hit wins**, so a project that keeps both a root and a `docs/` copy gets the root one deterministically rather than by directory-listing order.
- **"Not at any candidate" is reported differently from "not present at all."** A bare `exit 0` makes a misplaced handoff indistinguishable from a project that has none, which is the failure this skill existed to prevent and was itself committing.

`ELSEWHERE` is bounded — depth 3, `.git` and `node_modules` pruned, five hits shown. An unbounded walk of a large checkout is how this becomes a hook that times out instead of a hook that reports.

If the resolver prints `no handoff`, exit gracefully — there is nothing to continue from. If it names a path, read that file and parse the 5 sections: Objective, Completed, In Progress, Next Steps, Context. Extract the timestamp and branch from the header line.

**Expected:** The resolver prints exactly one of the three outcomes, and on a hit the file is read and its sections are parsed into a clear mental model of the prior session's state.

**On failure:** If the file exists but is malformed (missing sections, empty), treat it as a partial signal — extract whatever is present and note what is missing to the user. If the resolver reports a handoff *elsewhere*, do not act on it silently: tell the user where it is and ask whether to read it or to move it to a resolved path.

### Step 2: Assess Freshness

Every step below needs the resolved path, and **shell state does not survive between steps** — a variable set in Step 1 is gone by the time you run Step 2. Re-run Step 1's resolver in the same shell, or set `CONTINUE_FILE` to the path it printed. Each fence opens with a guard that refuses rather than falling back to a hardcoded name: the refusal sits in the arm an unset or empty value falls into, so a missed resolve stops the step instead of silently operating on the wrong file.

Compare the file's timestamp against the current time:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Classify freshness:
- **Fresh** (< 24 hours, same branch): safe to act on directly
- **Stale** (> 24 hours or different branch): flag to user before proceeding
- **Superseded** (new commits exist after the handoff timestamp): someone worked on the project since the handoff

Check branch alignment:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**Expected:** A freshness assessment with classification (fresh, stale, or superseded) and supporting evidence.

**On failure:** If not in a git repo, skip branch and commit checks. Rely on the timestamp in the file header alone.

### Step 3: Summarize and Confirm Resumption

Present the continuation state to the user concisely:
- "Prior session objective: [Objective]"
- "Completed: [summary]"
- "In progress: [summary]"
- "Proposed next action: [Next Steps item 1]"

If freshness is "stale" or "superseded", present the evidence and ask whether to proceed with the handoff or start fresh.

If any Next Steps items are tagged `**[USER]**`, surface those explicitly — they require user decisions before work can proceed.

**Expected:** The user confirms the resumption plan, possibly with adjustments. The agent has a clear mandate for what to do next.

**On failure:** If the user says "start fresh" or "ignore that file", acknowledge and proceed without the continuation context. Offer to delete the file to prevent future confusion.

### Step 4: Act on the Handoff

Begin working from Next Steps item 1 (or wherever the user directed):
- Reference In Progress items to understand partial state
- Use the Context section to avoid retrying failed approaches
- Treat Completed items as done — do not re-verify unless the user asks

**Expected:** The agent is productively working on the right task, informed by the continuation file.

**On failure:** If the Next Steps are ambiguous or the In Progress state is unclear, ask the user for clarification rather than guessing.

### Step 5: Clean Up

After the handoff is consumed and work is underway, delete the file **you actually read** — not a hardcoded root path, which in a `docs/` layout either fails or deletes an unrelated file that happens to sit at the root.

Whether the project tracks its handoff decides how it is deleted, and both lifecycles are legitimate (`write-continue-here` Step 4 states the trade-off; this step only has to honour whichever one the project chose):

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# A handoff that carries `coordinate-peer-sessions` Step 3's scope declaration is about to lose
# its only durable copy — this is the one point in the lifecycle where anyone could still act on
# it. A shell loop, not `grep`/`rg`: a session may run this in an environment that has neither on
# PATH, or that blocks a bare `grep` outright (this repository's own Bash hook does exactly that,
# which would otherwise make this warning never fire where it matters most). Anchored on the
# LINE START, not `*Nobody runs:*`: a handoff can quote or discuss the mechanism in prose (as this
# skill's own commit history has), and an unanchored match warns on that too — a real declaration
# always starts the line, by construction of the fence that emits it.
SCOPE_LINE=$(while IFS= read -r l; do
  case "$l" in "Nobody runs:"*) printf '%s' "$l"; break ;; esac
done < "$CONTINUE_FILE")
if [ -n "$SCOPE_LINE" ]; then
  echo "WARNING: $CONTINUE_FILE carries a peer-session scope declaration about to be lost:" >&2
  echo "  $SCOPE_LINE" >&2
  echo "Copy it somewhere durable (an issue comment, a message to the peer) before it is gone." >&2
fi
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # Tracked: the deletion is recoverable, which is what makes it safe.
  # The pathspec is load-bearing: `git commit -m` with none commits the WHOLE
  # index, so a peer session's staged work is swept into a commit titled for the
  # handoff. This runs at session start, which is exactly when that is likely.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  # Untracked, ignored, or no repository at all — all three land here, and for
  # all three an ordinary delete is the right and only option.
  rm -- "$CONTINUE_FILE"
fi
```

`git ls-files --error-unmatch` answers "is this path in the index", and measured on git 2.43 it exits `0` tracked, `1` untracked, `1` ignored, `1` missing, and `128` outside a repository. Only the first is a tracked file, so the `else` arm covers the other four without needing to tell them apart. The redirect suppresses its `error: pathspec …` line, which is the expected case here rather than a fault.

Stale continuation files cause confusion in future sessions.

**Expected:** The resolved file is gone. If it was tracked, `git log -p -- <path>` still recovers every version ever written; if it was not, the deletion is final. If the handoff carried a peer-session scope declaration (#857), a warning naming the line prints to stderr before the delete — the delete still runs either way.

**On failure:** If the user wants to keep the file (e.g., as a reference during the session), leave it but note that it should be deleted before session end to prevent the next session from re-consuming it. If `git rm` fails because the file has staged changes, read them before forcing anything — an unconsumed edit from another session is the case that rule exists for.

### Step 6: Configure the SessionStart Hook (Optional)

The hook injects the resolved handoff into each new session. The script, its `settings.json` entry and how to check its output are in [references/session-start-hook.md](references/session-start-hook.md).

**Expected:** the script is installed, executable and registered, and its stdout carries `additionalContext` directly under `hookSpecificOutput`.

**On failure:** check what the hook prints, not that it ran. A payload nested anywhere else is discarded without an error (#844).

### Step 7: Add CLAUDE.md Instruction (Optional)

Add a brief instruction to the project's CLAUDE.md so Claude understands the file's purpose:

```markdown
## Session Continuity

At session start, look for a `CONTINUE_HERE.md` at `CONTINUE_HERE.md`, `docs/CONTINUE_HERE.md` or `.claude/CONTINUE_HERE.md`, relative to the repository root, and read the first one that exists. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, delete the file you read: `git rm` it if this project tracks it, otherwise `rm`.
```

**Expected:** CLAUDE.md contains the instruction. Future sessions will read and act on CONTINUE_HERE.md even if the SessionStart hook is not configured.

**On failure:** If CLAUDE.md does not exist, create it with just this section. If the file is too long, add the instruction near the top where it will not be truncated.

## Validation

- [ ] The resolver ran and reported one of its three outcomes — a resolved path, a handoff at an unresolved path, or none at all
- [ ] Freshness was assessed (timestamp, branch, post-handoff commits)
- [ ] Resumption plan was presented to and confirmed by the user
- [ ] Work began from the correct Next Steps item
- [ ] The file that was **read** is the file that was deleted, by the branch matching its tracked state
- [ ] (Optional) SessionStart hook script exists and is executable
- [ ] (Optional) The hook's stdout was checked to carry `additionalContext` directly under `hookSpecificOutput` — running is not working, and a wrong shape is discarded without an error anyone sees
- [ ] (Optional) CLAUDE.md contains the session continuity instruction

## Common Pitfalls

- **Acting without confirming**: Always present the resumption plan to the user. They may have changed their mind about what to work on, even if the file is fresh.
- **Trusting stale files blindly**: A continuation file older than 24 hours or from a different branch is a suggestion, not a mandate. Always check freshness.
- **Ignoring the Context section**: The most valuable part of the file is often the failed approaches. Skipping this section leads to retrying dead ends.
- **Forgetting to clean up**: Leaving the handoff after consumption causes confusion in the next session, which will try to act on it again.
- **Treating Completed items as unverified**: Unless the user specifically asks, do not re-do completed work. Trust the prior session's assessment.
- **Reading "the hook ran" as "the hook worked"**: a SessionStart hook that exits 0 having printed a payload Claude Code discards is indistinguishable, from the outside, from one that worked. Nothing in the transcript says the context was dropped, and the symptom reaches the user as "the agent didn't seem to know what I was working on". Check what the hook prints, not that it printed.

## Related Skills

- `write-continue-here` — the complement: writing the continuation file at session end
- `bootstrap-agent-identity` — full identity reconstruction that includes continuation detection as one heuristic
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `write-claude-md` — project instructions where the optional continuity guidance lives
