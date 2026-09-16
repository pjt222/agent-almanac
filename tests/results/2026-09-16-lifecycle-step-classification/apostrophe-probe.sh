#!/usr/bin/env bash
# An apostrophe inside ${VAR:?message} is a BASH SYNTAX ERROR and valid zsh.
#
# This is the class the 2026-09-15 round found in read-continue-here, and it was
# reintroduced the next day in write-continue-here's lifecycle guard. The `Bash`
# tool in this environment runs zsh, so the broken form looks correct every way an
# author can run it by hand. Only a test that executes the extracted fence under
# `bash -c` distinguishes them — which is why the fence needs an owner, not a
# careful reading.
set -uo pipefail

run() { # $1 = shell, $2 = label, $3 = the line
  local sh="$1" label="$2" line="$3" out rc
  command -v "$sh" >/dev/null 2>&1 || { printf '  %-5s %-16s (not installed)\n' "$sh" "$label"; return; }
  printf '%s\n' "$line" > "$TMP/probe.sh"
  out=$("$sh" "$TMP/probe.sh" 2>&1)
  rc=$?
  printf '  %-5s %-16s exit=%-3s %s\n' "$sh" "$label" "$rc" "$(printf '%s' "$out" | head -1)"
}

TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TMP"' EXIT

WITH=': "${X:?re-run Step 2'"'"'s resolver now that the file exists}"'
WITHOUT=': "${X:?re-run the Step 2 resolver now that the file exists}"'

echo 'WITH an apostrophe in the message (what was first committed):'
run bash 'apostrophe' "$WITH"
run zsh  'apostrophe' "$WITH"
echo
echo 'WITHOUT it (what shipped):'
run bash 'no apostrophe' "$WITHOUT"
run zsh  'no apostrophe' "$WITHOUT"
echo
echo 'Expected: bash exits 2 with a SYNTAX error on the first pair and 1 with the'
echo 'intended message on the second; zsh exits 1 with the intended message on both.'
echo 'The zsh column is identical across both pairs — which is exactly why running it'
echo 'by hand here could not tell them apart.'
