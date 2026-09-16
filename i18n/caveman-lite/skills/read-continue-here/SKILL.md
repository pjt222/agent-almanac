---
name: read-continue-here
locale: caveman-lite
source_locale: en
source_commit: 82c77053
fence_basis_commit: c248c5f0c
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

After the handoff is consumed and work is underway, delete CONTINUE_HERE.md:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
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

Stale continuation files cause confusion in future sessions.

**Got:** The file is removed. The project root is clean.

**If fail:** If the user wants to keep the file (e.g., as a reference during the session), leave it but note that it should be deleted before session end to prevent the next session from re-consuming it.

### Step 6: Configure SessionStart Hook (Optional)

If not already configured, set up automatic reading of CONTINUE_HERE.md on session start.

Create the hook script:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/usr/bin/env bash
# SessionStart hook: inject the resolved CONTINUE_HERE.md into session context.
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS).
set -uo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done

emit() {
  # additionalContext sits DIRECTLY under hookSpecificOutput. Nesting it inside a
  # "sessionStartContext" object — the shape this hook shipped until 2.0 — names a
  # key Claude Code does not know, so the whole object is discarded and the failure
  # is reported nowhere the user will look (#844). stdout carries the JSON and
  # nothing else.
  if command -v jq >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$1" | jq -Rsa .)
  else
    ESCAPED=$(printf '%s' "$1" | awk '
      BEGIN {
        ORS = ""
        # JSON forbids every raw byte below 0x20 inside a string, not only the
        # three with short escapes. Handling \\ " and tab alone left CR, ESC and
        # the rest to pass through raw, which made the object unparseable — and
        # an unparseable object is discarded in exactly the silent way #844 was.
        # A handoff quoting terminal output carries ESC; one written on NTFS
        # carries CR. Both are ordinary here.
        for (i = 1; i < 32; i++) esc[sprintf("%c", i)] = sprintf("\\u%04x", i)
        esc["\t"] = "\\t"
        print "\""
      }
      {
        line = $0
        gsub(/\\/, "\\\\", line)
        gsub(/"/, "\\\"", line)
        if (line ~ /[\001-\037]/) {
          out = ""
          n = length(line)
          for (i = 1; i <= n; i++) {
            ch = substr(line, i, 1)
            out = out (ch in esc ? esc[ch] : ch)
          }
          line = out
        }
        if (NR > 1) print "\\n"
        print line
      }
      END { print "\"" }
    ')
  fi
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}' "$ESCAPED"
}

if [ -n "$CONTINUE_FILE" ]; then
  # Strip CRLF (files on NTFS often have Windows line endings)
  emit "$(sed 's/\r$//' "$CONTINUE_FILE")"
  exit 0
fi

# No handoff at a resolved path. Exiting silently here is what made a misplaced
# handoff indistinguishable from a project that has none, so look once more, cheaply,
# and say what was found.
ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
  -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
if [ -n "$ELSEWHERE" ]; then
  emit "A CONTINUE_HERE.md exists in this project but not where the continuation hook resolves it. The hook looks for CONTINUE_HERE.md, docs/CONTINUE_HERE.md and .claude/CONTINUE_HERE.md, relative to the repository root. Found instead:
$ELSEWHERE
Read it if it is a handoff for this session, or move it to one of the resolved paths."
fi
exit 0
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

Add to `~/.claude/settings.json` in the SessionStart hooks array:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

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
