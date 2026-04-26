---
name: read-continue-here
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
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
ls -la CONTINUE_HERE.md 2>/dev/null
```

Absent → exit graceful, nothing to continue.

Present → read. Parse 5 sections: Objective, Completed, In Progress, Next Steps, Context. Extract timestamp + branch from header.

→ File read, sections parsed → clear mental model of prev session state.

If err: malformed (missing sections, empty) → partial signal, extract what's there, note gaps to user.

### Step 2: Freshness

Compare file timestamp vs now:

```bash
# File modification time
stat -c '%Y' CONTINUE_HERE.md 2>/dev/null || stat -f '%m' CONTINUE_HERE.md
# Current time
date +%s
```

Classify:
- **Fresh** (< 24h, same branch) → act direct
- **Stale** (> 24h or diff branch) → flag user
- **Superseded** (new commits after handoff) → someone worked since handoff

Branch check:

```bash
git branch --show-current
git log --oneline --since="$(stat -c '%Y' CONTINUE_HERE.md | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
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

After handoff consumed + work underway → delete CONTINUE_HERE.md:

```bash
rm CONTINUE_HERE.md
```

Stale files → confusion future sessions.

→ File gone. Root clean.

If err: user wants keep (e.g. ref during session) → leave but note delete before session end → prevent re-consume.

### Step 6: SessionStart Hook (Optional)

Set up auto-read CONTINUE_HERE.md at session start.

Create hook:

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

Add to `~/.claude/settings.json` SessionStart hooks array:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

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
