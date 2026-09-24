#!/usr/bin/env bash
# hook-shape-probe.sh — does a SessionStart hook's JSON shape reach the model?
#
# Three arms, one sentinel each. The sentinel value is random hex generated at
# run time and never appears in the prompt, so a model that reports it must have
# READ it rather than reconstructed it.
#
#   A  documented shape   {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"SENTINEL=..."}}
#   B  skill shape        {"hookSpecificOutput":{"sessionStartContext":{"additionalContext":"SENTINEL=..."}}}
#   C  plain-text stdout  SENTINEL=...            (control: proves the harness can carry a sentinel at all)
#
# Arm C is the control. If C fails, the probe measured nothing and A/B say nothing
# about the shapes.
set -uo pipefail

WORK=$(mktemp -d) || exit 1
trap 'rm -rf "$WORK"' EXIT
cd "$WORK" || exit 1
git init -q . 2>/dev/null

PROMPT='Your context may contain a line that begins with SENTINEL= followed by a value. Reply with that value and nothing else. If there is no such line, reply with the single word NONE.'

run_arm() {
  arm=$1; body=$2
  token="zqx$(od -An -N6 -tx1 /dev/urandom | tr -d ' \n')"
  mkdir -p "$WORK/$arm"
  # The hook script. printf, not echo -n, and no trailing newline issues: the
  # docs require stdout to contain ONLY the JSON object.
  {
    printf '#!/usr/bin/env bash\n'
    printf 'printf %%s %s\n' "'$(printf "$body" "SENTINEL=$token")'"
  } > "$WORK/$arm/hook.sh"
  chmod +x "$WORK/$arm/hook.sh"

  cat > "$WORK/$arm/settings.json" <<JSON
{"hooks":{"SessionStart":[{"matcher":"","hooks":[{"type":"command","command":"$WORK/$arm/hook.sh","timeout":10}]}]}}
JSON

  echo "--- arm $arm ---"
  echo "hook stdout as emitted:"
  bash "$WORK/$arm/hook.sh"; echo
  echo "expected token: $token"
  answer=$(cd "$WORK" && claude -p --settings "$WORK/$arm/settings.json" "$PROMPT" 2>&1)
  echo "model answered: $answer"
  case "$answer" in
    *"$token"*) echo "VERDICT $arm: CONTEXT REACHED THE MODEL" ;;
    *NONE*)     echo "VERDICT $arm: NOT INJECTED (model saw no sentinel)" ;;
    *)          echo "VERDICT $arm: INCONCLUSIVE — answer matched neither the token nor NONE" ;;
  esac
  echo
}

run_arm C '%s'
run_arm A '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}'
run_arm B '{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":"%s"}}}'
