---
name: read-continue-here
locale: caveman-lite
source_locale: en
source_commit: 82c77053
fence_basis_commit: 194e01240c4a3f3b436802558dd22844e6735b0f
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
---

# Read Continue Here

Read a structured continuation file and resume work from where the prior session left off.

## When to Use

- Starting a new session and CONTINUE_HERE.md exists in the project root
- After a SessionStart hook injects continuation context
- Bootstrapping identity and detecting prior session artifacts
- Setting up automatic continuation detection for a project (one-time infrastructure)

## Inputs

- **Required**: A project directory (defaults to current working directory)
- **Optional**: Whether to configure infrastructure (SessionStart hook + CLAUDE.md instruction)
- **Optional**: Whether to delete the file after consumption (default: yes)

## Procedure

### Step 1: Detect and Read the Continuation File

Check for `CONTINUE_HERE.md` in the project root:

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

If absent, exit gracefully — there is nothing to continue from.

If present, read the file contents. Parse the 5 sections: Objective, Completed, In Progress, Next Steps, Context. Extract the timestamp and branch from the header line.

**Got:** The file is read and its sections are parsed into a clear mental model of the prior session's state.

**If fail:** If the file exists but is malformed (missing sections, empty), treat it as a partial signal — extract whatever is present and note what is missing to the user.

### Step 2: Assess Freshness

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

**Got:** A freshness assessment with classification (fresh, stale, or superseded) and supporting evidence.

**If fail:** If not in a git repo, skip branch and commit checks. Rely on the timestamp in the file header alone.

### Step 3: Summarize and Confirm Resumption

Present the continuation state to the user concisely:
- "Prior session objective: [Objective]"
- "Completed: [summary]"
- "In progress: [summary]"
- "Proposed next action: [Next Steps item 1]"

If freshness is "stale" or "superseded", present the evidence and ask whether to proceed with the handoff or start fresh.

If any Next Steps items are tagged `**[USER]**`, surface those explicitly — they require user decisions before work can proceed.

**Got:** The user confirms the resumption plan, possibly with adjustments. The agent has a clear mandate for what to do next.

**If fail:** If the user says "start fresh" or "ignore that file", acknowledge and proceed without the continuation context. Offer to delete the file to prevent future confusion.

### Step 4: Act on the Handoff

Begin working from Next Steps item 1 (or wherever the user directed):
- Reference In Progress items to understand partial state
- Use the Context section to avoid retrying failed approaches
- Treat Completed items as done — do not re-verify unless the user asks

**Got:** The agent is productively working on the right task, informed by the continuation file.

**If fail:** If the Next Steps are ambiguous or the In Progress state is unclear, ask the user for clarification rather than guessing.

### Step 5: Clean Up

Keep a copy first: the next `write-continue-here` compares its draft against this edition. A `Handoff archive: <dir>` line in the project CLAUDE.md, a parent CLAUDE.md, the user-level `~/.claude/CLAUDE.md` or the README (nearest first) names the archive. Without one, an untracked handoff is kept as `CONTINUE_HERE.prev.md`; a tracked one needs no copy. Set `ARCHIVE_STATE=consumed`:

```bash
: "${CONTINUE_FILE:?set it to the path of the handoff, as the resolver printed it}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
case "$CONTINUE_FILE" in /*) ;; *) CONTINUE_FILE=$PWD/$CONTINUE_FILE ;; esac
HOME_DIR=${CONTINUE_FILE%/*} ARCHIVED=
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
PROJECT=$(git -C "$HOME_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || PROJECT=$ROOT
case "$PROJECT" in --path-format=*) PROJECT=${PROJECT#*$'\n'}; case "$PROJECT" in /*) ;; *) PROJECT=$ROOT ;; esac ;; esac # git < 2.31 echoes it
PROJECT=${PROJECT%/.git}; PROJECT=${PROJECT##*/} # a linked worktree names its project, not itself
SEARCH=("$ROOT/CLAUDE.md" "$ROOT/.claude/CLAUDE.md") dir=${ROOT%/*} ARCHIVE=
while [ -n "$dir" ]; do SEARCH+=("$dir/CLAUDE.md"); dir=${dir%/*}; done
for f in "${SEARCH[@]}" "$HOME/.claude/CLAUDE.md" "$ROOT/README.md"; do # nearest first, builtins only
  [ -f "$f" ] && while IFS= read -r l || [ -n "$l" ]; do
    l=${l%$'\r'}; case "$l" in "Handoff archive: "*) ARCHIVE=${l#Handoff archive: }; break 2 ;; esac
  done < "$f"
done
case "$ARCHIVE" in '~/'*) ARCHIVE=$HOME/${ARCHIVE#'~/'} ;; ''|/*|'<dir>') ;; *) ARCHIVE=${f%/*}/$ARCHIVE ;; esac
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ) KEEP=cp
[ "$ARCHIVE_STATE" = superseded ] && KEEP=mv
if [ "$ARCHIVE" = '<dir>' ]; then
  echo "REFUSED: $f carries the unedited 'Handoff archive: <dir>'; name a directory there" >&2; false
elif [ -n "$ARCHIVE" ]; then
  DEST=$ARCHIVE/${STAMP%%T*}/$PROJECT-CONTINUE_HERE.$STAMP.$ARCHIVE_STATE.md
  mkdir -p -- "${DEST%/*}" && "$KEEP" -- "$CONTINUE_FILE" "$DEST" && ARCHIVED=$DEST
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  if git -C "$HOME_DIR" diff --quiet HEAD -- "$CONTINUE_FILE"; then ARCHIVED="git history, tracked"
  else echo "REFUSED: $CONTINUE_FILE has uncommitted changes; read them before committing anything" >&2; false; fi
else
  "$KEEP" -- "$CONTINUE_FILE" "$HOME_DIR/CONTINUE_HERE.prev.md" && ARCHIVED=$HOME_DIR/CONTINUE_HERE.prev.md
fi
if [ -n "$ARCHIVED" ]; then echo "archive: $ARCHIVED"
else echo "REFUSED: $CONTINUE_FILE was not archived, so the cleanup will not delete it" >&2; false; fi
```

After the handoff is consumed and work is underway, delete CONTINUE_HERE.md:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
: "${ARCHIVED:?run the archive fence first in this shell call, or set ARCHIVED to the path it printed}"
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

Stale continuation files cause confusion in future sessions.

**Got:** The file is removed. The project root is clean.

**If fail:** If the user wants to keep the file (e.g., as a reference during the session), leave it but note that it should be deleted before session end to prevent the next session from re-consuming it.

### Step 6: Configure SessionStart Hook (Optional)

The hook injects the resolved handoff into each new session. The script, its `settings.json` entry and how to check its output are in [references/session-start-hook.md](references/session-start-hook.md).

**Got:** The hook script exists, is executable, and is registered in settings.json. On next session start, if CONTINUE_HERE.md exists, its content is injected into the session context.

**If fail:** Check that settings.json is valid JSON after editing. Test the hook manually: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. The script falls back to `awk` if `jq` is not installed, so `jq` is recommended but not required.

### Step 7: Add CLAUDE.md Instruction (Optional)

Add a brief instruction to the project's CLAUDE.md so Claude understands the file's purpose:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**Got:** CLAUDE.md contains the instruction. Future sessions will read and act on CONTINUE_HERE.md even if the SessionStart hook is not configured.

**If fail:** If CLAUDE.md does not exist, create it with just this section. If the file is too long, add the instruction near the top where it will not be truncated.

## Validation

- [ ] CONTINUE_HERE.md was detected (or absence was handled gracefully)
- [ ] Freshness was assessed (timestamp, branch, post-handoff commits)
- [ ] Resumption plan was presented to and confirmed by the user
- [ ] Work began from the correct Next Steps item
- [ ] The file was cleaned up after consumption
- [ ] (Optional) SessionStart hook script exists and is executable
- [ ] (Optional) CLAUDE.md contains the session continuity instruction

## Pitfalls

- **Acting without confirming**: Always present the resumption plan to the user. They may have changed their mind about what to work on, even if the file is fresh.
- **Trusting stale files blindly**: A continuation file older than 24 hours or from a different branch is a suggestion, not a mandate. Always check freshness.
- **Ignoring the Context section**: The most valuable part of the file is often the failed approaches. Skipping this section leads to retrying dead ends.
- **Forgetting to clean up**: Leaving CONTINUE_HERE.md after consumption causes confusion in the next session, which will try to act on it again.
- **Treating Completed items as unverified**: Unless the user specifically asks, do not re-do completed work. Trust the prior session's assessment.

## Related Skills

- `write-continue-here` — the complement: writing the continuation file at session end
- `bootstrap-agent-identity` — full identity reconstruction that includes continuation detection as one heuristic
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `write-claude-md` — project instructions where the optional continuity guidance lives
