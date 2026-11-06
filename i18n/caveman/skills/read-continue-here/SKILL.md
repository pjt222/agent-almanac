---
name: read-continue-here
locale: caveman
source_locale: en
source_commit: 82c77053
fence_basis_commit: 194e01240c4a3f3b436802558dd22844e6735b0f
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Read CONTINUE_HERE.md handoff file at session start. Resume work from
  where prior session stopped. Cover file detection, freshness check,
  parse structured handoff, confirm plan with user, clean up after.
  Optional: configure SessionStart hook and CLAUDE.md instruction for
  auto pickup. Use at session start when handoff file exists, when
  bootstrap after interrupted session, when set up auto continuation.
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

Read structured handoff file. Resume work from where prior session stopped.

## When Use

- Start new session. CONTINUE_HERE.md sits in project root
- After SessionStart hook injects handoff context
- Bootstrap identity. Detect prior session artifacts
- Set up auto continuation detection for project (one-time infra)

## Inputs

- **Required**: Project directory (default: cwd)
- **Optional**: Configure infra (SessionStart hook + CLAUDE.md instruction)
- **Optional**: Delete file after consume (default: yes)

## Steps

### Step 1: Detect and Read Handoff File

Check for `CONTINUE_HERE.md` in project root.

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

Absent? Exit gracefully — nothing to continue from.

Present? Read contents. Parse 5 sections: Objective, Completed, In Progress, Next Steps, Context. Pull timestamp and branch from header line.

**Got:** File read. Sections parsed into clear mental model of prior session state.

**If fail:** File exists but malformed (missing sections, empty)? Treat as partial signal — pull what is there. Note gaps to user.

### Step 2: Check Freshness

Compare file timestamp against current time.

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Classify freshness:
- **Fresh** (< 24 hours, same branch): safe to act on direct
- **Stale** (> 24 hours or different branch): flag to user before proceed
- **Superseded** (new commits exist after handoff timestamp): someone worked on project since handoff

Check branch alignment.

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**Got:** Freshness verdict (fresh, stale, superseded) with evidence.

**If fail:** Not in git repo? Skip branch and commit checks. Use timestamp in file header alone.

### Step 3: Summarize and Confirm Resume

Show handoff state to user concise:
- "Prior session objective: [Objective]"
- "Completed: [summary]"
- "In progress: [summary]"
- "Proposed next action: [Next Steps item 1]"

Stale or superseded? Show evidence. Ask whether proceed with handoff or start fresh.

Next Steps items tagged `**[USER]**`? Surface them explicit — they need user decision before work proceed.

**Got:** User confirms resume plan, maybe with tweaks. Agent has clear mandate for next action.

**If fail:** User says "start fresh" or "ignore that file"? Acknowledge. Proceed without handoff context. Offer delete file to prevent future confusion.

### Step 4: Act on Handoff

Start work from Next Steps item 1 (or where user pointed):
- Reference In Progress items to grasp partial state
- Use Context section to avoid retry of failed approaches
- Treat Completed items as done — no re-verify unless user asks

**Got:** Agent productive on right task, informed by handoff file.

**If fail:** Next Steps ambiguous or In Progress unclear? Ask user for clarity. No guess.

### Step 5: Clean Up

Keep copy first: next `write-continue-here` compare draft against this edition. Line `Handoff archive: <dir>` in project CLAUDE.md, parent CLAUDE.md, user `~/.claude/CLAUDE.md` or README (nearest first) name archive. No line: untracked handoff kept as `CONTINUE_HERE.prev.md`, tracked need no copy. Set `ARCHIVE_STATE=consumed`:

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

Handoff consumed and work underway? Delete CONTINUE_HERE.md.

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

Stale handoff files cause confusion in future sessions.

**Got:** File removed. Project root clean.

**If fail:** User wants keep file (e.g., as reference during session)? Leave it but note: must delete before session end. Else next session re-consumes.

### Step 6: Configure SessionStart Hook (Optional)

Hook inject resolved handoff into each new session. Script, `settings.json` entry, how check output: [references/session-start-hook.md](references/session-start-hook.md).

**Got:** Hook script exists, executable, registered in settings.json. Next session start: if CONTINUE_HERE.md exists, content injects into session context.

**If fail:** Verify settings.json valid JSON after edit. Test hook manual: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. Script falls back to `awk` if `jq` not installed — `jq` recommended, not required.

### Step 7: Add CLAUDE.md Instruction (Optional)

Add brief instruction to project CLAUDE.md so Claude knows file purpose.

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**Got:** CLAUDE.md has instruction. Future sessions read and act on CONTINUE_HERE.md even when SessionStart hook not configured.

**If fail:** CLAUDE.md absent? Create with this section only. File too long? Add instruction near top where it not get truncated.

## Checks

- [ ] CONTINUE_HERE.md detected (or absence handled gracefully)
- [ ] Freshness checked (timestamp, branch, post-handoff commits)
- [ ] Resume plan shown to user, confirmed
- [ ] Work began from correct Next Steps item
- [ ] File cleaned up after consume
- [ ] (Optional) SessionStart hook script exists, executable
- [ ] (Optional) CLAUDE.md has session continuity instruction

## Pitfalls

- **Act without confirm**: Always show resume plan to user. They may have changed mind on what to work on, even when file fresh.
- **Trust stale files blind**: Handoff file older than 24 hours or from different branch = suggestion, not mandate. Always check freshness.
- **Ignore Context section**: Most valuable part = failed approaches. Skip it = retry dead ends.
- **Forget cleanup**: Leave CONTINUE_HERE.md after consume = next session re-acts on it = confusion.
- **Treat Completed as unverified**: Unless user asks specific, no re-do completed work. Trust prior session.

## See Also

- `write-continue-here` — complement: write handoff file at session end
- `bootstrap-agent-identity` — full identity reconstruction; uses handoff detect as one heuristic
- `manage-memory` — durable cross-session knowledge (complement to this ephemeral handoff)
- `write-claude-md` — project instructions where optional continuity guidance lives
