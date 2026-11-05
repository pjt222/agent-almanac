---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, re-confirming what may have drifted, confirming the resumption
  plan with the user, and archiving and cleaning up after consumption.
  Optionally configures a SessionStart hook and CLAUDE.md instruction for
  automatic pickup. Use at the start of a session when a continuation file
  exists, when bootstrapping after an interrupted session, or when setting up
  automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "3.0"
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

It anchors on the repository root, not `$PWD`, so a subdirectory finds the handoff. The first candidate that exists wins, so a root copy beats a `docs/` copy deterministically. "Not at any candidate" is reported apart from "not present at all", so a misplaced handoff is never silent, and the `find` is bounded so a hook running it cannot time out.

If the resolver prints `no handoff`, exit gracefully — there is nothing to continue from. If it names a path, read that file and parse the 5 sections: Objective, Completed, In Progress, Next Steps, Context. Extract the timestamp, branch, `HEAD:` and `Verified:` values from the header.

**Expected:** The resolver prints exactly one of the three outcomes, and on a hit the file is read and its sections are parsed into a clear mental model of the prior session's state.

**On failure:** If the file exists but is malformed (missing sections, empty), treat it as a partial signal — extract whatever is present and note what is missing to the user. If the resolver reports a handoff *elsewhere*, do not act on it silently: tell the user where it is and ask whether to read it or to move it to a resolved path.

### Step 2: Assess Freshness and Re-confirm What Drifts

Every step below needs the resolved path, and **shell state does not survive between steps**. Re-run Step 1's resolver in the same shell, or set `CONTINUE_FILE` to the path it printed. Each fence opens with a guard that refuses an unset or empty value rather than falling back to a hardcoded name.

Compare the file's timestamp against the current time:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Classify freshness:
- **Fresh** (< 24 hours, same branch)
- **Stale** (> 24 hours or different branch): flag to user before proceeding
- **Superseded** (new commits exist after the handoff timestamp): someone worked on the project since the handoff

Check branch alignment:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**Re-confirm before acting** unless `Verified:` records a full-gate round (`verify-handoff round N, 0 blocking, coverage complete`). A handoff verified in a single pass still carries a blocking defect about one time in three (#1040), and the state it names keeps moving after it is written. Check:
- the branch, and `HEAD:` against `git rev-parse HEAD`. Commits that touch only the handoff are not drift, since committing a tracked handoff moves HEAD: `git log --oneline <HEAD>..HEAD -- . ':(exclude)<handoff path>'` lists the others;
- the state of every PR and issue the file names: `gh pr view <n> --json state,headRefOid` and `gh issue view <n> --json state`;
- each line that Context lists as repaired by the single pass.

A mismatch marks that point stale, and Step 3's summary says so.

**Expected:** A classification (fresh, stale, or superseded) with its evidence, and, short of a full-gate round, a list of the points re-confirmed and the points found stale.

**On failure:** If not in a git repo, skip branch and commit checks and rely on the header's timestamp. If `gh` is unavailable, say that PR and issue states were not re-confirmed rather than treating them as current.

### Step 3: Summarize and Confirm Resumption

Present the continuation state to the user concisely:
- "Prior session objective: [Objective]"
- "Completed: [summary]"
- "In progress: [summary]"
- "Proposed next action: [Next Steps item 1]"

If freshness is "stale" or "superseded", or Step 2 found a point stale, present the evidence and ask whether to proceed with the handoff or start fresh.

If any Next Steps items are tagged `**[USER]**`, surface those explicitly — they require user decisions before work can proceed.

**Expected:** The user confirms the resumption plan, possibly with adjustments. The agent has a clear mandate for what to do next.

**On failure:** If the user says "start fresh" or "ignore that file", acknowledge and proceed without the continuation context. Offer to delete the file to prevent future confusion.

### Step 4: Act on the Handoff

Begin working from Next Steps item 1 (or wherever the user directed):
- Reference In Progress items to understand partial state
- Use the Context section to avoid retrying failed approaches
- Treat Completed items as done, except a point Step 2 found stale; re-check one only if the user asks

**Expected:** The agent is productively working on the right task, informed by the continuation file.

**On failure:** If the Next Steps are ambiguous or the In Progress state is unclear, ask the user for clarification rather than guessing.

### Step 5: Archive, Then Clean Up

Once the handoff is consumed and work is underway, keep a copy first, because the next `write-continue-here` compares its draft against this edition. **The archive rule:** a line `Handoff archive: <dir>` names the archive. It is read from the project's CLAUDE.md, then each parent directory's CLAUDE.md, then the user-level `~/.claude/CLAUDE.md`, then the project's README, and the first match wins. Without the line, an untracked handoff is kept beside itself as `CONTINUE_HERE.prev.md`, and a tracked one needs no copy, since git history holds it. Reading copies (`ARCHIVE_STATE=consumed`); `write-continue-here` runs this same fence to move an edition it replaces (`superseded`):

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
HOME_DIR=${CONTINUE_FILE%/*}
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
SEARCH=()
dir=$ROOT
while [ -n "$dir" ]; do SEARCH+=("$dir/CLAUDE.md"); dir=${dir%/*}; done
SEARCH+=("$HOME/.claude/CLAUDE.md" "$ROOT/README.md")
ARCHIVE=
for f in "${SEARCH[@]}"; do # nearest first; builtins only, like the scope check below
  [ -f "$f" ] || continue
  while IFS= read -r l || [ -n "$l" ]; do
    l=${l%$'\r'}
    case "$l" in "Handoff archive: "*) ARCHIVE=${l#Handoff archive: }; break 2 ;; esac
  done < "$f"
done
case "$ARCHIVE" in
  '~/'*) ARCHIVE=$HOME/${ARCHIVE#'~/'} ;;
  ''|/*|'<dir>') ;;
  *) ARCHIVE=${f%/*}/$ARCHIVE ;;
esac
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ)
if [ "$ARCHIVE_STATE" = superseded ]; then KEEP=mv; else KEEP=cp; fi
if [ "$ARCHIVE" = '<dir>' ]; then
  echo "REFUSED: $f carries the unedited 'Handoff archive: <dir>'; name a directory there" >&2; false
elif [ -n "$ARCHIVE" ]; then
  DEST=$ARCHIVE/${STAMP%%T*}/${ROOT##*/}-CONTINUE_HERE.$STAMP.$ARCHIVE_STATE.md
  mkdir -p -- "${DEST%/*}" && "$KEEP" -- "$CONTINUE_FILE" "$DEST" && echo "archive: $DEST"
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  if git -C "$HOME_DIR" diff --quiet HEAD -- "$CONTINUE_FILE"; then echo "archive: git history keeps this edition"
  else echo "REFUSED: $CONTINUE_FILE has uncommitted changes; commit them first" >&2; false; fi
else
  "$KEEP" -- "$CONTINUE_FILE" "$HOME_DIR/CONTINUE_HERE.prev.md" && echo "archive: $HOME_DIR/CONTINUE_HERE.prev.md"
fi
```

Then delete the file you read, not a hardcoded root path. Whether the project tracks its handoff decides how (`write-continue-here` Step 5 states the trade-off). A handoff that carries `coordinate-peer-sessions` Step 3's scope declaration warns first, because the peer will not look for it in an archive:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# A shell loop, not grep/rg: a session may have neither, or a hook that blocks grep. Anchored on
# the line start, so prose that merely discusses the literal does not warn.
SCOPE_LINE=$(while IFS= read -r l; do
  case "$l" in "Nobody runs:"*) printf '%s' "$l"; break ;; esac
done < "$CONTINUE_FILE")
if [ -n "$SCOPE_LINE" ]; then
  echo "WARNING: $CONTINUE_FILE carries a peer-session scope declaration the peer will no longer find:" >&2
  echo "  $SCOPE_LINE" >&2
  echo "Copy it where the peer will see it (an issue comment, a message to the peer)." >&2
fi
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # The pathspec is load-bearing: without it, the commit also takes a peer's staged work.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  rm -- "$CONTINUE_FILE" # untracked, ignored, or no repository: an ordinary delete
fi
```

**Expected:** The edition is in the archive, in `CONTINUE_HERE.prev.md`, or in git history, and the file you read is gone. A tracked deletion is committed with the handoff as its only path. A scope declaration (#857) prints a warning naming the line, and the delete still runs.

**On failure:** If the archive fence prints `REFUSED`, do not run the cleanup. For `<dir>`, a CLAUDE.md carries Step 7's snippet unedited: name a directory there or delete the line. For uncommitted changes, read them before committing anything; an unconsumed edit from another session is the case that rule exists for. If the user wants to keep the file during the session, leave it and clean up before the session ends.

### Step 6: Configure the SessionStart Hook (Optional)

The hook injects the resolved handoff into each new session. The script, its `settings.json` entry and how to check its output are in [references/session-start-hook.md](references/session-start-hook.md).

**Expected:** the script is installed, executable and registered, and its stdout carries `additionalContext` directly under `hookSpecificOutput`.

**On failure:** check what the hook prints, not that it ran. A payload nested anywhere else is discarded without an error (#844).

### Step 7: Add CLAUDE.md Instruction (Optional)

Add a brief instruction to the project's CLAUDE.md so Claude understands the file's purpose. Replace `<dir>` with the archive directory, or delete that line to keep `CONTINUE_HERE.prev.md` instead:

```markdown
## Session Continuity

At session start, look for a `CONTINUE_HERE.md` at `CONTINUE_HERE.md`, `docs/CONTINUE_HERE.md` or `.claude/CONTINUE_HERE.md`, relative to the repository root, and read the first one that exists. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Acknowledge it, summarize it, and propose resuming from its Next Steps; flag it if it is older than 24 hours. Unless its `Verified:` line records a full-gate round, re-confirm the branch, `HEAD:`, every PR and issue it names, and the lines its Context lists as repaired, before acting on them. Once consumed, copy it into the archive below (or to `CONTINUE_HERE.prev.md` beside it if it is untracked), then `git rm` it if this project tracks it, otherwise `rm`.

Handoff archive: <dir>
```

**Expected:** CLAUDE.md contains the instruction. Future sessions will read and act on CONTINUE_HERE.md even if the SessionStart hook is not configured.

**On failure:** If CLAUDE.md does not exist, create it with just this section. If the file is too long, add the instruction near the top where it will not be truncated.

## Validation

- [ ] The resolver ran and reported one of its three outcomes — a resolved path, a handoff at an unresolved path, or none at all
- [ ] Freshness was assessed, and short of a full-gate `Verified:` round, the branch, `HEAD:`, the named PRs and issues, and the repaired lines were re-confirmed
- [ ] Resumption plan was presented to and confirmed by the user
- [ ] Work began from the correct Next Steps item
- [ ] The consumed edition is in the archive, in `CONTINUE_HERE.prev.md`, or in git history
- [ ] The file that was **read** is the file that was deleted, by the branch matching its tracked state
- [ ] (Optional) The hook's stdout was checked to carry `additionalContext` directly under `hookSpecificOutput`
- [ ] (Optional) CLAUDE.md contains the session continuity instruction, with `<dir>` replaced or removed

## Common Pitfalls

- **Acting without confirming**: Always present the resumption plan to the user. They may have changed their mind about what to work on, even if the file is fresh.
- **Trusting stale files blindly**: A continuation file older than 24 hours or from a different branch is a suggestion, not a mandate. Always check freshness.
- **Ignoring the Context section**: The most valuable part of the file is often the failed approaches. Skipping this section leads to retrying dead ends.
- **Forgetting to clean up**: Leaving the handoff after consumption causes confusion in the next session, which will try to act on it again.
- **Trusting a single-pass handoff's state lines**: the prior session's assessment holds for what it did, not for what moved since. Re-confirm what Step 2 lists, then do not re-do completed work unless the user asks.
- **Reading "the hook ran" as "the hook worked"**: a hook that exits 0 having printed a payload Claude Code discards looks, from outside, like one that worked. Check what it prints.

## Related Skills

- `write-continue-here` — the complement: writing the continuation file at session end
- `verify-continue-here` — the full verification loop, for a handoff that must meet the gate before install
- `bootstrap-agent-identity` — full identity reconstruction that includes continuation detection as one heuristic
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `write-claude-md` — project instructions where the optional continuity guidance lives
