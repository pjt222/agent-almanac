---
name: read-continue-here
locale: caveman
source_locale: en
source_commit: 82c77053
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
ls -la CONTINUE_HERE.md 2>/dev/null
```

Absent? Exit gracefully — nothing to continue from.

Present? Read contents. Parse 5 sections: Objective, Completed, In Progress, Next Steps, Context. Pull timestamp and branch from header line.

**Got:** File read. Sections parsed into clear mental model of prior session state.

**If fail:** File exists but malformed (missing sections, empty)? Treat as partial signal — pull what is there. Note gaps to user.

### Step 2: Check Freshness

Compare file timestamp against current time.

```bash
# File modification time
stat -c '%Y' CONTINUE_HERE.md 2>/dev/null || stat -f '%m' CONTINUE_HERE.md
# Current time
date +%s
```

Classify freshness:
- **Fresh** (< 24 hours, same branch): safe to act on direct
- **Stale** (> 24 hours or different branch): flag to user before proceed
- **Superseded** (new commits exist after handoff timestamp): someone worked on project since handoff

Check branch alignment.

```bash
git branch --show-current
git log --oneline --since="$(stat -c '%Y' CONTINUE_HERE.md | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
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

Handoff consumed and work underway? Delete CONTINUE_HERE.md.

```bash
rm CONTINUE_HERE.md
```

Stale handoff files cause confusion in future sessions.

**Got:** File removed. Project root clean.

**If fail:** User wants keep file (e.g., as reference during session)? Leave it but note: must delete before session end. Else next session re-consumes.

### Step 6: Configure SessionStart Hook (Optional)

Not yet configured? Set up auto reading of CONTINUE_HERE.md on session start.

Create hook script:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/bin/bash
# SessionStart hook: inject CONTINUE_HERE.md into session context
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS)
set -uo pipefail

# --- Platform detection ---
detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}
PLATFORM=${PLATFORM:-$(detect_platform)}

CONTINUE_FILE="$PWD/CONTINUE_HERE.md"

if [ ! -f "$CONTINUE_FILE" ]; then
  exit 0
fi

# Strip CRLF (files on NTFS often have Windows line endings)
CONTENT=$(sed 's/\r$//' "$CONTINUE_FILE")

# JSON-escape: prefer jq, fall back to portable awk
if command -v jq >/dev/null 2>&1; then
  ESCAPED=$(printf '%s' "$CONTENT" | jq -Rsa .)
else
  ESCAPED=$(printf '%s' "$CONTENT" | awk '
    BEGIN { ORS=""; print "\"" }
    {
      gsub(/\\/, "\\\\")
      gsub(/"/, "\\\"")
      gsub(/\t/, "\\t")
      if (NR > 1) print "\\n"
      print
    }
    END { print "\"" }
  ')
fi

cat << EOF
{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":$ESCAPED}}}
EOF
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

Add to `~/.claude/settings.json` in SessionStart hooks array.

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

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
