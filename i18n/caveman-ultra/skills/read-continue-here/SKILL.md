---
name: read-continue-here
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
fence_basis_commit: 9616c3db25dbf24f7586e87fafa15229c28ef8de
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Read CONTINUE_HERE.md at session start → resume prev work. Detect, freshness,
  parse handoff, confirm plan, clean up. Optional: SessionStart hook +
  CLAUDE.md instr → auto pickup. Use → session start w/ continuation file,
  bootstrap after interrupt, set up auto-detect.
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

Read structured continuation file → resume work from prev session.

## Use When

- New session + CONTINUE_HERE.md in project root
- SessionStart hook injects continuation ctx
- Bootstrap identity → detect prior session artifacts
- Set up auto-continuation detect (one-time infra)

## In

- **Required**: Project dir (default cwd)
- **Optional**: Configure infra? (hook + CLAUDE.md instr)
- **Optional**: Delete after consume? (default yes)

## Do

### Step 1: Detect + Read

Check for `CONTINUE_HERE.md` in project root:

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

Absent → exit graceful, nothing to continue.

Present → read. Parse 5 sections: Objective, Completed, In Progress, Next Steps, Context. Extract timestamp + branch from header.

→ File read, sections parsed → clear mental model of prev session state.

If err: malformed (missing sections, empty) → partial signal, extract what's there, note gaps to user.

### Step 2: Freshness

Compare file timestamp vs now:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Classify:
- **Fresh** (< 24h, same branch) → act direct
- **Stale** (> 24h or diff branch) → flag user
- **Superseded** (new commits after handoff) → someone worked since handoff

Branch check:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

→ Freshness classification + evidence.

If err: no git repo → skip branch/commit checks. Use timestamp from file header.

### Step 3: Summarize + Confirm

Present state concise:
- "Prev objective: [Objective]"
- "Done: [summary]"
- "In progress: [summary]"
- "Proposed next: [Next Steps 1]"

Stale/superseded → present evidence, ask proceed or fresh.

Next Steps tagged `**[USER]**` → surface explicit, need user decisions first.

→ User confirms plan, maybe adjust. Clear mandate next.

If err: user says "fresh" or "ignore file" → ack, proceed w/o ctx. Offer delete file → no future confusion.

### Step 4: Act

Begin Next Steps 1 (or where user directed):
- Reference In Progress → partial state
- Use Context → avoid retry failed approaches
- Trust Completed = done, no re-verify unless asked

→ Agent productive on right task, informed by file.

If err: ambiguous Next Steps or unclear In Progress → ask user, no guess.

### Step 5: Clean Up

Copy first. Next write compares vs this. `Handoff archive: <dir>` line (project CLAUDE.md → parent → `~/.claude/CLAUDE.md` → README) = archive. None: untracked → `CONTINUE_HERE.prev.md`, tracked → no copy. `ARCHIVE_STATE=consumed`:

```bash
: "${CONTINUE_FILE:?set it to the path of the handoff, as the resolver printed it}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
case "$CONTINUE_FILE" in /*) ;; *) CONTINUE_FILE=$PWD/$CONTINUE_FILE ;; esac
HOME_DIR=${CONTINUE_FILE%/*} ARCHIVED=
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
PROJECT=$(git -C "$HOME_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || PROJECT=$ROOT
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

After handoff consumed + work underway → delete CONTINUE_HERE.md:

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

Stale files → confusion future sessions.

→ File gone. Root clean.

If err: user wants keep (e.g. ref during session) → leave but note delete before session end → prevent re-consume.

### Step 6: SessionStart Hook (Optional)

Hook → inject handoff each session. Script + `settings.json` + output check: [references/session-start-hook.md](references/session-start-hook.md).

→ Hook script exists, executable, registered. Next session start → CONTINUE_HERE.md content injected into ctx.

If err: invalid JSON after edit → check settings.json. Test hook: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. Falls back to `awk` if no `jq` → `jq` rec but optional.

### Step 7: CLAUDE.md Instr (Optional)

Add brief instr to project CLAUDE.md → Claude understands file purpose:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

→ CLAUDE.md has instr. Future sessions read + act on CONTINUE_HERE.md even if no hook.

If err: no CLAUDE.md → create w/ just this section. Too long → add near top, not truncated.

## Check

- [ ] CONTINUE_HERE.md detected (or absence handled)
- [ ] Freshness assessed (timestamp, branch, commits)
- [ ] Plan presented + confirmed by user
- [ ] Work began from correct Next Steps
- [ ] File cleaned up after consume
- [ ] (Optional) Hook script exists + executable
- [ ] (Optional) CLAUDE.md has continuity instr

## Traps

- **Act w/o confirm**: Always present plan. User may have changed mind, even if fresh.
- **Trust stale blind**: > 24h or diff branch = suggestion not mandate. Check freshness.
- **Skip Context**: Most valuable = failed approaches. Skip → retry dead ends.
- **Forget clean up**: Leftover file → next session re-acts on it.
- **Re-verify Completed**: Don't redo done work unless asked. Trust prev assessment.

## →

- `write-continue-here` — complement: write file at session end
- `bootstrap-agent-identity` — full identity reconstruct, includes continuation detect
- `manage-memory` — durable cross-session knowledge
- `write-claude-md` — project instr where continuity guidance lives
