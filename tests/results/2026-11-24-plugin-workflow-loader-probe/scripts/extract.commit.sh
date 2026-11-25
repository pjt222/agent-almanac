#!/usr/bin/env bash
# Reduce one arm's stream-json log to the fields the RESULT.md table reads. Not the script that produced the
# original arm-*.extracted.json (that one was not captured); this re-derives the table's inputs and drops
# what is not for commit: the full init plugin list (user-installed plugins), every result line after the first (a launch result carries transcript and script paths).
# task_updated carries its status inside the patch object (no top-level field); task_notification has a top-level status.
# Usage: bash extract.commit.sh <arm-label> <path/to/arm-X.stream.jsonl> [workflow-name-regex]
set -eu
ARM="${1:?arm label}"; STREAM="${2:?stream file}"
WF_RE="${3:-^(agent-almanac:|probeplug:|control-name$|deep-research$)}"
jq -s --arg arm "$ARM" --arg re "$WF_RE" '
  def init: map(select(.type=="system" and .subtype=="init"));
  {arm: $arm,
   calls: [ .[] | select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and .name=="Workflow") | .input ],
   results: [ .[] | select(.type=="user") | .message.content[]? | select(.type=="tool_result")
              | {is_error: (.is_error // false),
                 text: ((.content | if type=="array" then map(.text // "") | join("") else (. // "") end)
                        | split("\n") | .[0])} ],
   init_events: (init | length),
   slash_count_per_init: (init | map(.slash_commands | length)),
   slash_workflow_entries: (init | map(.slash_commands | map(select(test($re))))),
   inline_plugins: (init | first | .plugins | map(select(.source | endswith("@inline"))) | map({name, source, version})),
   task_started: [ .[] | select(.type=="system" and .subtype=="task_started") | {workflow_name, task_id} ],
   task_status: [ .[] | select(.type=="system" and (.subtype=="task_updated" or .subtype=="task_notification")) | {subtype, status: (.status // .patch.status)} ],
   total_cost_usd_per_result_event: [ .[] | select(.type=="result") | .total_cost_usd ]}
' "$STREAM"
