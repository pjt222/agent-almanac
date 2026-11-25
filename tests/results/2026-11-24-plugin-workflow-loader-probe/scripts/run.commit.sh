#!/usr/bin/env bash
# Sanitized copy of run.sh for commit. Usage: bash run.commit.sh <outdir> <repo-checkout>
# <outdir> must be outside any git repository. Changes from the script that was run: the outdir equality
# check (which hardcoded a scratch path) became a refuse-inside-a-repo check; REPO is an argument;
# the two capture lines marked "ADDED" were not in the original run (HEAD sha and user-scope listing).
set -u
OUT="${1:?outdir}"
REPO="${2:?repo checkout (the plugin source)}"
mkdir -p "$OUT"
if git -C "$OUT" rev-parse --show-toplevel >/dev/null 2>&1; then echo "refusing: outdir is inside a git repository"; exit 2; fi
git -C "$REPO" rev-parse HEAD > "$OUT/repo-head.txt"            # ADDED, not in the original run
ls -la "$HOME/.claude/workflows" > "$OUT/user-scope-listing.txt" 2>&1   # ADDED, not in the original run
env_unset=()
while IFS= read -r n; do
  case "$n" in CLAUDE_CODE_OAUTH_TOKEN|CLAUDE_CODE_USE_*|CLAUDE_CODE_API_KEY_HELPER*) continue;; esac
  env_unset+=(-u "$n")
done < <(env | cut -d= -f1 | rg '^(CLAUDECODE$|CLAUDE_CODE_|CLAUDE_PID$|CLAUDE_EFFORT$)')
echo "scrubbed: ${env_unset[*]}" > "$OUT/env-scrub.txt"
claude --version > "$OUT/version.txt"

mkproj() { mkdir -p "$1" && git -C "$1" init -q; }
wf() { cat > "$1" <<EOT
export const meta = { name: '$2', description: 'plugin loader probe, no agents' }
log('$3')
return { marker: '$3' }
EOT
}
# plugin A: default workflows/ dir, no manifest workflows field
PLUG="$OUT/probeplug"
mkdir -p "$PLUG/.claude-plugin" "$PLUG/workflows"
cat > "$PLUG/.claude-plugin/plugin.json" <<EOT
{ "name": "probeplug", "description": "loader probe plugin", "version": "0.0.1" }
EOT
wf "$PLUG/workflows/probe-a.js" probe-a-name PROBE_BODY_PLUGIN_A_71c3

# repo plugin copy (small)
RP="$OUT/repoplug"; mkdir -p "$RP"
git -C "$REPO" archive HEAD .claude-plugin workflows | tar -x -C "$RP"

# control project
mkproj "$OUT/arm-C"; mkdir -p "$OUT/arm-C/.claude/workflows"
wf "$OUT/arm-C/.claude/workflows/control.js" control-name PROBE_BODY_CONTROL_52aa
mkproj "$OUT/arm-A"; mkproj "$OUT/arm-B"; mkproj "$OUT/arm-D"; mkproj "$OUT/arm-E"

run_arm() { # arm plugdir name
  local arm="$1" pd="$2" nm="$3"
  local prompt="Run the saved workflow named $nm using the Workflow tool: pass only the name parameter, no script and no scriptPath. If the tool returns an error, show it verbatim and stop. If it succeeds, wait for it to complete, report its exact return value verbatim, then stop."
  local cmd=(env "${env_unset[@]}" claude -p "$prompt" --output-format stream-json --verbose --model sonnet --effort low --permission-mode dontAsk --strict-mcp-config --max-budget-usd 0.50 --allowedTools Workflow)
  [ -n "$pd" ] && cmd+=(--plugin-dir "$pd")
  printf '%q ' "${cmd[@]}" > "$OUT/arm-$arm.cmdline.txt"; echo >> "$OUT/arm-$arm.cmdline.txt"
  ( cd "$OUT/arm-$arm" && timeout 240 "${cmd[@]}" < /dev/null > "$OUT/arm-$arm.stream.jsonl" 2> "$OUT/arm-$arm.stderr.txt" )
  echo $? > "$OUT/arm-$arm.exitcode.txt"
  echo "arm $arm exit $(cat "$OUT/arm-$arm.exitcode.txt")"
}
run_arm C "" control-name
run_arm A "$PLUG" probeplug:probe-a-name
run_arm B "$PLUG" probe-a-name
run_arm D "$RP" agent-almanac:verify-handoff
run_arm E "$RP" verify-handoff
