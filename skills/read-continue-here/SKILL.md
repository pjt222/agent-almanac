---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness and re-confirming what drifted, confirming the plan, and archiving
  and cleaning up after consumption. Optionally configures a SessionStart hook
  and CLAUDE.md instruction. Use at the start of a session when a continuation
  file exists, or when setting up automatic continuation detection.
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

- Starting a session, or bootstrapping after an interrupted one, when a CONTINUE_HERE.md exists or a SessionStart hook injected one
- Setting up automatic continuation detection (one-time), or replacing the 1.x hook, whose JSON shape Claude Code discards (#844)

## Inputs

- **Required**: A project directory (defaults to the current one); optionally, whether to configure the hook and CLAUDE.md instruction

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

It anchors on the repository root, so a subdirectory still finds the handoff; the first candidate wins; a misplaced handoff is reported, never silent; and the `find` is bounded so a hook running it cannot time out. On `no handoff`, exit gracefully. On a path, read the file: its five sections (Objective, Completed, In Progress, Next Steps, Context) and its header's timestamp, branch, `HEAD:` and `Verified:` values.

**Expected:** Exactly one of the three outcomes, and on a hit a clear model of the prior session's state.

**On failure:** Treat a malformed file as a partial signal and tell the user what is missing. A handoff reported *elsewhere* is not acted on silently: ask whether to read it or move it to a resolved path.

### Step 2: Assess Freshness and Re-confirm What Drifts

**Shell state does not survive between steps**: re-run Step 1's resolver in the same shell, or set `CONTINUE_FILE` to the path it printed. Each fence opens with a guard that refuses an unset value rather than falling back to a hardcoded name.

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

The handoff is **Fresh** under 24 hours on the same branch, **Stale** if older or on another branch, and **Superseded** if commits other than the handoff's own landed after it; the fence above lists both kinds.

**Re-confirm before acting** unless `Verified:` records a full-gate round (`verify-handoff round N, 0 blocking, coverage complete`). One verification pass still leaves a blocking defect in about one handoff in three (#1040), and named state moves after writing. Check:
- the branch, and `HEAD:` against `git rev-parse HEAD`. Commits touching only the handoff are not drift, since committing a tracked handoff moves HEAD; `git log --oneline <HEAD>..HEAD -- ':/' ':(exclude,top)<handoff path from the repository root>'` lists the others, from any directory;
- every PR and issue the file names: `gh pr view <n> --json state,headRefOid` and `gh issue view <n> --json state`;
- each line Context lists as repaired by a single pass.

**Expected:** A classification with its evidence, and, short of a full-gate round, which points were re-confirmed and which are stale.

**On failure:** Outside a git repository, rely on the header's timestamp. Without `gh`, say that PR and issue states were not re-confirmed rather than treating them as current.

### Step 3: Summarize and Confirm Resumption

Present the objective, a summary of Completed and In Progress, and Next Steps item 1 as the proposed action. Surface every `**[USER]**` item, and if the handoff is stale or superseded, or Step 2 found a point stale, show the evidence and ask whether to proceed or start fresh.

**Expected:** The user confirms the plan, possibly adjusted, and the next action is clear.

**On failure:** If the user says to start fresh, proceed without the handoff and offer to clean it up.

### Step 4: Act on the Handoff

Begin at Next Steps item 1, or where the user directed. Use In Progress for partial state and Context to avoid retrying failed approaches. Treat Completed items as done, except a point Step 2 found stale.

**Expected:** Work proceeds on the right task, informed by the handoff.

**On failure:** If Next Steps or In Progress are ambiguous, ask rather than guess.

### Step 5: Archive, Then Clean Up

Keep a copy first: the next `write-continue-here` compares its draft against this edition. **The archive rule:** a line `Handoff archive: <dir>` names the archive, read from the project's CLAUDE.md or `.claude/CLAUDE.md`, each parent directory's CLAUDE.md, the user-level `~/.claude/CLAUDE.md`, then the project's README; the first match wins. Without one, an untracked handoff is kept as `CONTINUE_HERE.prev.md` beside it, and a tracked one needs no copy, since git history holds it. Reading copies (`ARCHIVE_STATE=consumed`); `write-continue-here` runs this fence to move an edition it replaces (`superseded`):

```bash
: "${CONTINUE_FILE:?set it to the handoff's path, as the resolver printed it}"
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

Then delete the file you read, in the same shell call: the cleanup refuses unless the archive set `ARCHIVED`. Its branch matches the file's tracked state (`write-continue-here` Step 5 states the trade-off). A handoff carrying `coordinate-peer-sessions` Step 3's scope declaration warns first, because the peer will not look for it in an archive:

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

**Expected:** The edition is in the archive, in `CONTINUE_HERE.prev.md`, or in git history, and the file you read is gone; a tracked deletion is committed with the handoff as its only path. A scope declaration (#857) warns, and the delete still runs.

**On failure:** After `REFUSED` or any non-zero exit, nothing is deleted. Name a directory in place of `<dir>` (or delete that line), or read the uncommitted changes before committing anything, since an unconsumed edit from another session is the case that rule exists for. To keep the file during the session, clean up before it ends.

### Step 6: Configure the SessionStart Hook (Optional)

The hook injects the resolved handoff into each new session. The script, its `settings.json` entry and how to check its output are in [references/session-start-hook.md](references/session-start-hook.md).

**Expected:** The script is installed, executable and registered, and its stdout carries `additionalContext` directly under `hookSpecificOutput`.

**On failure:** Check what the hook prints, not that it ran. A payload nested anywhere else is discarded without an error (#844).

### Step 7: Add CLAUDE.md Instruction (Optional)

Add this to the project's CLAUDE.md, replacing `<dir>` with the archive directory, or deleting that line to keep `CONTINUE_HERE.prev.md` instead:

```markdown
## Session Continuity

At session start, look for a `CONTINUE_HERE.md` at `CONTINUE_HERE.md`, `docs/CONTINUE_HERE.md` or `.claude/CONTINUE_HERE.md`, relative to the repository root, and read the first one that exists. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Acknowledge it, summarize it, and propose resuming from its Next Steps; flag it if it is older than 24 hours. Unless its `Verified:` line records a full-gate round, re-confirm the branch, `HEAD:`, every PR and issue it names, and the lines its Context lists as repaired, before acting on them. Once consumed, copy it into the archive below (or to `CONTINUE_HERE.prev.md` beside it if it is untracked), then `git rm` it if this project tracks it, otherwise `rm`.

Handoff archive: <dir>
```

**Expected:** Future sessions act on the handoff even without the SessionStart hook.

**On failure:** If CLAUDE.md does not exist, create it with this section; if it is long, put the section near the top.

## Validation

- [ ] The resolver reported one of its three outcomes, and freshness was classified
- [ ] Short of a full-gate `Verified:` round, the branch, `HEAD:`, the named PRs and issues, and the repaired lines were re-confirmed
- [ ] The user confirmed the plan, work began at the right Next Steps item, and the consumed edition is archived, in `CONTINUE_HERE.prev.md`, or in git history, and the file read is the file deleted
- [ ] (Optional) The hook's stdout carries `additionalContext` directly under `hookSpecificOutput`, and CLAUDE.md has the snippet with `<dir>` replaced or removed

## Common Pitfalls

- **Acting without confirming**: present the plan even for a fresh file; the user may have changed priorities.
- **Trusting a single pass's state lines**: the prior session's assessment holds for its work, not for what moved since. Re-confirm what Step 2 lists; re-do nothing else unless asked.
- **Ignoring Context, or forgetting to clean up**: Context holds the failed approaches, and an unconsumed handoff is acted on again next session.

## Related Skills

- `write-continue-here` — the complement: writing the continuation file at session end
- `verify-continue-here` — the full verification loop, for a handoff that must meet the gate before install
- `bootstrap-agent-identity` — identity reconstruction that includes continuation detection as one heuristic
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
