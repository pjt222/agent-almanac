# SessionStart Hook for read-continue-here

The one-time setup behind `read-continue-here` Step 6. `scripts/test/continue-here-blocks.test.js` extracts the script below from this file and runs it, so the heredoc delimiters and the `additionalContext` shape are pinned by a test, not by this prose.

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

Three things about that script decide whether it works at all, and the first is why version 1.x did not:

- **`additionalContext` is a direct child of `hookSpecificOutput`.** Claude Code's hook reference gives the shape as `hookSpecificOutput.additionalContext` and never mentions a `sessionStartContext` wrapper. An object that starts with `{` and then fails schema validation is reported as a *non-blocking* error — the session continues, the context is dropped, and the symptom reaching the user is "the agent didn't seem to know what I was working on" (#844).
- **The `find` is bounded** — depth 3, `.git` and `node_modules` pruned, five hits. A SessionStart hook runs under a timeout; an unbounded walk turns a reporting hook into a timing-out one.
- **The platform-detection block is gone.** It computed `PLATFORM` and nothing read it. A variable nobody consumes is not portability, and its presence implied a portability check that was never performed.

Long handoffs are not a problem to solve here: hook output over 10,000 characters is written to a file by Claude Code and passed to the model as a path plus a preview.

Add to `~/.claude/settings.json` in the SessionStart hooks array:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**Expected:** The hook script exists, is executable, and is registered in settings.json. On next session start, the resolved handoff is injected into the session context — or, if one exists at an unresolved path, a line saying where.

**On failure:** Check that settings.json is valid JSON after editing. Then check the hook's own output, because "the hook ran" and "the hook worked" are different claims and only the second one matters: run the script by hand from inside a project that has a handoff, and pipe its stdout through `python3 -m json.tool`. What you want to see is `additionalContext` as a direct child of `hookSpecificOutput`. Nested one level deeper — inside a `sessionStartContext` object, say — the payload is discarded and nothing anywhere reports it, which is precisely how the 1.x shape failed (#844). Empty output where a handoff exists means the resolver did not find it; run Step 1's block in the same directory to see which of the three outcomes it reports. The script falls back to `awk` if `jq` is not installed, so `jq` is recommended but not required.
