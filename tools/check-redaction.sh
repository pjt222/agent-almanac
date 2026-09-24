#!/usr/bin/env bash
# check-redaction.sh -- a shape-tier deny-list scanner for outbound disclosure drafts.
#
# WHY THIS EXISTS
# ---------------
# `skills/redact-for-public-disclosure` specifies this tool in its Step 3 and
# `skills/enforce-redaction-gate` specifies its exit-code contract. Neither shipped an
# implementation: before 2026-08-26 every script those skills named was prose in a markdown
# file, so the "gate" could not fail anything. This is the implementation, written when the
# skills were first exercised for real -- an outbound comment on anthropics/claude-code#82056
# carrying findings about a closed-source CLI harness.
#
# WHAT IT GUARDS, AND WHY IT IS NOT THE OTHER SCANNER
# ---------------------------------------------------
# `scripts/scan-skill-content.js` (`npm run validate:security`) guards THIS repository's own
# committed content against leaking OUR credentials and PII outward to people who install our
# skills. It is a merge gate over our trees.
#
# This scans a DRAFT -- a file about to leave the machine -- for THIRD-PARTY internals that
# `redact-for-public-disclosure` classifies as `live internal`, publishable "Never -- until
# vendor-documented":
#
#     minified identifier names, byte offsets, current-version gate logic, internal codenames
#
# The two are complementary and neither substitutes for the other. This one is deliberately
# NOT wired into CI: it scans drafts, and a draft is not a tracked file.
#
# THE EXIT-CODE CONTRACT
# ----------------------
#     0    clean
#     1    findings -- the COUNT is in the printed output, never in the status
#     2    the scanner could not run -- FAIL CLOSED, never read as a pass
#
# `enforce-redaction-gate` names the trap the third state exists for: a wrapper of the shape
# `scanner && ok || echo CLEAN` reads a TOOL ERROR as a pass. Hence exit 2 and hence --verify.
#
# This DEVIATES from the skills, which both specify "exit code = leak count". That
# specification is unsound and was implemented literally here before being measured: an exit
# status is a byte, so 256 findings exited 0 and printed "clean" -- a redaction gate certifying
# a maximally-leaky draft -- and 2 findings collided with the reserved could-not-run code and
# were swallowed unprinted. `--verify` pins all three cases.
#
# LABELS ONLY, NEVER THE PATTERN
# ------------------------------
# Findings print the label and the location, never the regex that matched. A deny-list of
# internal shapes is itself a description of internals.
#
# USAGE
#     tools/check-redaction.sh FILE...      scan
#     tools/check-redaction.sh --verify     self-test; exit non-zero if the gate cannot fail
#     tools/check-redaction.sh --labels     list what is checked, without the patterns
set -uo pipefail

SELF="$(basename "${BASH_SOURCE[0]}")"

# label|regex  -- ERE. Keep each pattern narrow; `redact-for-public-disclosure` Step 8 says
# narrow a false positive, never suppress it.
PATTERNS=(
  # A minified declaration run: a 1-3 char identifier assigned a string or number, twice or
  # more in sequence. This is the shape of a bundler's `var a="x",b=1,c=2` output.
  'minified-declaration-run|[A-Za-z_$][A-Za-z0-9_$]{0,2}=("[^"]*"|[0-9]+),[A-Za-z_$][A-Za-z0-9_$]{0,2}=("[^"]*"|[0-9]+)'

  # A minified function definition: `function xy(e,t)` / `function xy(e)`. Real source uses
  # descriptive names; 1-3 chars plus single-letter params is bundler output.
  'minified-function-def|function [A-Za-z_$][A-Za-z0-9_$]{0,2}\([a-z](,[a-z](=[^)]*)?)*\)'

  # Provenance the vendor never licensed: "at offset N", `skip=N`, `bs=1 skip=`.
  'binary-byte-offset|(offset[ =:]+[0-9]{5,}|skip=[0-9]{5,}|dd if=[^ ]*(claude|versions)[^ ]*)'

  # An operator home path or a discovered project-store slug (the #722 precedent: commit
  # 9048cd7b3 redacted exactly these two shapes from a published RESULT.md).
  'operator-home-path|/home/[a-z][a-z0-9_.-]*/'
  'project-store-slug|(\.claude/projects/-|projects/-[a-z][a-z0-9-]*-scratchpad)'

  # Credential shapes, belt and braces -- a draft is the last place these can be caught.
  'credential-shape|(gh[pousr]_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)'

  # A minified identifier NAMED IN PROSE rather than used as code. Added 2026-08-26 after a
  # review found `_n` and `R` described in comments in a probe script this scanner had just
  # reported clean -- the shapes above are all built around code SYNTAX (`x=1,y=2`,
  # `function ab(e)`), so a true internal name merely discussed in English slips every one.
  #
  # This is a gap in `enforce-redaction-gate` Step 3 as specified, not only in this
  # implementation: its structure-aware tier checks identifiers "in identifier position only,
  # so a word in a comment does not trip the gate" -- written to suppress coincidental English
  # words, which is exactly the position a prose-named internal occupies. Neither of the
  # skill's two tiers is aimed there.
  #
  # Narrow deliberately, to shapes prose does not otherwise produce: a leading `_` or `$`, a
  # lone capital, or an embedded `_`/`$`. Two-letter backticked tokens without those are
  # excluded because this repository's prose is full of legitimate ones -- locale codes (`de`,
  # `es`, `ja`), file types (`md`, `js`, `sh`, `py`). Widen only with a case that motivated it.
  'minified-ident-in-prose|(`[_$][A-Za-z0-9_$]{0,2}`|`[A-Z]`|`[A-Za-z0-9]{1,2}[_$][A-Za-z0-9]{0,1}`)'

  # A template-literal interpolation of a short identifier -- `${r}`, `${at(o)}`. Added
  # 2026-08-26 (second pass) after a reviewer found `${r} lines and ${at(o)}` quoted verbatim
  # from the bundle in a probe docstring, which the prose-identifier shape above does not match
  # because the name sits inside `${...}` rather than between backticks. Two review rounds, two
  # distinct escapes from the same class: an internal name is not one shape, and a deny-list
  # reaches it only one spelling at a time.
  'minified-template-fragment|\$\{[A-Za-z_$][A-Za-z0-9_$]{0,2}(\([A-Za-z0-9_$, ]{0,12}\))?\}'
)

list_labels() {
  printf 'checked shapes (patterns deliberately not shown):\n'
  local entry
  for entry in "${PATTERNS[@]}"; do
    printf '  %s\n' "${entry%%|*}"
  done
}

# scan_file FILE -> prints findings, echoes the count on the last line
scan_file() {
  local file="$1" count=0 entry label pat hits
  for entry in "${PATTERNS[@]}"; do
    label="${entry%%|*}"
    pat="${entry#*|}"
    # -a: a draft may contain odd bytes and must still be scanned, not skipped as binary.
    hits="$(grep -aEn -- "$pat" "$file" 2>/dev/null | cut -d: -f1)" || true
    if [ -n "$hits" ]; then
      local line
      while IFS= read -r line; do
        [ -z "$line" ] && continue
        printf '  %-26s %s:%s\n' "$label" "$file" "$line"
        count=$((count + 1))
      done <<< "$hits"
    fi
  done
  echo "$count"
}

verify() {
  local tmp rc out
  tmp="$(mktemp -d)" || { echo "verify: mktemp failed" >&2; return 2; }
  # shellcheck disable=SC2064
  trap "rm -rf '$tmp'" RETURN

  # 1. A clean draft must exit 0.
  printf 'The cap is 25,000 UTF-16 code units and the line cap is 200.\n' > "$tmp/clean.md"
  out="$(scan_all "$tmp/clean.md")"; rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "verify FAIL: clean draft reported $rc finding(s)" >&2
    echo "$out" >&2
    return 1
  fi

  # 2. A seeded canary of EACH shape must be caught. A gate that catches one shape and
  #    silently misses another is the blind class `enforce-redaction-gate` Step 6 warns of.
  local seeded=0 missed=0 label
  for label in minified-declaration-run minified-function-def binary-byte-offset \
               operator-home-path project-store-slug credential-shape \
               minified-ident-in-prose minified-template-fragment; do
    case "$label" in
      minified-declaration-run) printf 'var Q="LABEL.md",zz=200,qq=25000\n' ;;
      minified-function-def)    printf 'function qz(e,t="index"){return e}\n' ;;
      binary-byte-offset)       printf 'found at offset 204053570 in the build\n' ;;
      operator-home-path)       printf 'path was /home/someone/.local/share\n' ;;
      project-store-slug)       printf 'store .claude/projects/-tmp-probe-arm\n' ;;
      credential-shape)         printf 'token ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ01\n' ;;
      # The 2026-08-26 case, verbatim in shape: a real internal name described in English.
      minified-ident-in-prose)  printf 'lineCount is what `_n` computes, and `R` counts them\n' ;;
      # The 2026-08-26 second-pass case, verbatim in shape.
      minified-template-fragment) printf 'the variant is `${r} lines and ${at(o)}` with no limit\n' ;;
    esac > "$tmp/canary.md"
    seeded=$((seeded + 1))
    out="$(scan_all "$tmp/canary.md")"; rc=$?
    if [ "$rc" -ne 1 ]; then
      echo "verify FAIL: seeded '$label' gave exit $rc, expected 1 (findings found)" >&2
      missed=$((missed + 1))
      continue
    fi
    if ! printf '%s' "$out" | grep -q "$label"; then
      echo "verify FAIL: '$label' fired but did not report its own label" >&2
      missed=$((missed + 1))
    fi
    # 3. The pattern itself must never be printed.
    if printf '%s' "$out" | grep -qF '[A-Za-z_$]'; then
      echo "verify FAIL: the output leaked a regex; labels only" >&2
      missed=$((missed + 1))
    fi
  done

  # 4. An unreadable target must FAIL CLOSED, not report clean.
  scan_all "$tmp/does-not-exist.md" >/dev/null 2>&1; rc=$?
  if [ "$rc" -ne 2 ]; then
    echo "verify FAIL: a missing file exited $rc, expected 2 (fail closed)" >&2
    missed=$((missed + 1))
  fi

  # 5. The finding COUNT must not reach the exit status. Regression for the 2026-08-26 defect:
  #    while the count was the exit code, 2 findings rendered as COULD NOT RUN with both
  #    swallowed, and 256 findings exited 0 and printed "clean" -- a gate certifying a
  #    maximally-leaky draft. 255 and 256 straddle the byte wrap; 2 is the reserved collision.
  local n
  for n in 2 255 256; do
    : > "$tmp/many.md"
    local i=0
    while [ "$i" -lt "$n" ]; do
      printf 'lineCount is what `_n` computes\n' >> "$tmp/many.md"
      i=$((i + 1))
    done
    out="$(scan_all "$tmp/many.md")"; rc=$?
    if [ "$rc" -ne 1 ]; then
      echo "verify FAIL: $n findings exited $rc, expected 1 -- the count is reaching the exit status" >&2
      missed=$((missed + 1))
      continue
    fi
    if [ "$(printf '%s\n' "$out" | grep -c '[^[:space:]]')" -ne "$n" ]; then
      echo "verify FAIL: $n findings seeded but a different number was reported" >&2
      missed=$((missed + 1))
    fi
  done

  if [ "$missed" -ne 0 ]; then
    echo "check-redaction --verify: FAILED ($missed of $((seeded + 1)) checks)" >&2
    return 1
  fi
  echo "check-redaction --verify: OK ($seeded shapes each seeded and caught; clean exits 0; missing file exits 2; labels only)"
  return 0
}

# Returns 0 clean / 1 findings found / 2 could not run. The COUNT is carried in the printed
# findings, one per line, NOT in the exit status.
#
# The skills specify "exit code = leak count" and that specification is unsound, because a
# process exit status is a byte. Measured on this implementation before the contract was
# changed: a draft with exactly TWO findings exited 2 and rendered as "COULD NOT RUN" with both
# findings swallowed, and a draft with 256 findings exited 0 and printed "clean". The second is
# the worst outcome a redaction gate has: it certifies a maximally-leaky draft. Reserving 2 for
# could-not-run and 1 for any-findings is the only assignment that keeps both signals readable.
scan_all() {
  local file last
  [ "$#" -eq 0 ] && { echo "no files given" >&2; return 2; }
  local total=0
  for file in "$@"; do
    if [ ! -r "$file" ]; then
      echo "cannot read: $file" >&2
      return 2                                   # FAIL CLOSED
    fi
    # Never scan this script: it necessarily contains every shape it looks for.
    [ "$(basename "$file")" = "$SELF" ] && continue
    last="$(scan_file "$file")"
    # scan_file prints findings then the count; the count is the last line.
    printf '%s' "$last" | sed '$d'
    total=$((total + $(printf '%s' "$last" | tail -1)))
  done
  [ "$total" -gt 0 ] && return 1
  return 0
}

main() {
  case "${1:-}" in
    --verify) verify; exit $? ;;
    --labels) list_labels; exit 0 ;;
    -h|--help|"") sed -n '2,50p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
  esac
  local out rc count
  out="$(scan_all "$@")"; rc=$?
  if [ "$rc" -eq 2 ]; then
    echo "check-redaction: COULD NOT RUN -- this is not a pass" >&2
    exit 2
  fi
  if [ "$rc" -eq 0 ]; then
    echo "check-redaction: clean ($# file(s))"
    exit 0
  fi
  # The count is derived from the printed findings, never from the exit status.
  count="$(printf '%s\n' "$out" | grep -c '[^[:space:]]')"
  echo "check-redaction: $count finding(s) -- classify each with skills/redact-for-public-disclosure Step 1"
  printf '%s\n' "$out"
  exit 1
}

main "$@"
