#!/usr/bin/env bash
# watch-checks.sh -- wait for the checks on a pull request or a commit to settle, printing each
# context ONCE as it settles, then the full list, then a verdict; exit by verdict.
#
# WHY THIS EXISTS
# ---------------
# The loop was typed by hand five times in the 2026-09-08 session -- four times over PR heads
# (`gh pr checks N --json name,bucket` until nothing was pending) and once over a merge commit
# (`gh api .../commits/SHA/check-runs`), each a slightly different heredoc with its own
# off-by-one -- while CLAUDE.md § Tools says a snippet typed a second time becomes a file here.
# `gh pr checks --watch` is not that file: it prints every result twice (once as it lands, once
# in the summary), it has no commit mode, and its exit code (8 while pending) is not a verdict.
#
# THE TWO SHAPES, ONE VOCABULARY
# ------------------------------
# A PR number reads `gh pr checks --json name,bucket`, whose `bucket` is already one of
# pass | fail | pending | skipping | cancel. A commit sha reads the check-runs API, whose
# (status, conclusion) pair is folded into the same four words:
#
#     status != completed                                   -> pending
#     conclusion success                                    -> pass
#     conclusion skipped | neutral                          -> skipping
#     anything else: failure, cancelled, timed_out,
#       action_required, stale, or a word this script       -> fail
#       has never seen (and `cancel` in the PR shape)
#
# Fail-closed on purpose: a conclusion this script does not know is a failure, not a pass.
# `skipping` is not evidence of a pass either -- the aggregate `CodeQL` context reports neutral
# while its per-language `Analyze (…)` runs may fail (CLAUDE.md § Merging With a Red Check); read
# the Analyze rows, which are printed beside it.
#
# THE SETTLE PREDICATE, AND --min-polls
# -------------------------------------
# Settled means: at least one context exists, none is pending, AND at least --min-polls
# successful polls have been made (default 3). The third clause is the trap the hand-typed loops
# fell into: on a freshly pushed head the check-runs are CREATED over the first minute or two,
# so a poll that finds the first-created runs all completed reports "nothing pending" before the
# rest exist. Two contexts green at poll 1 is not twelve contexts green at poll 3. Pass
# `--min-polls 1` only for a ref whose checks settled long ago. `--verify` demonstrates the trap
# with the guard at 1 and shows the guard at 3 closing it, on the same fixtures.
#
# USAGE
# -----
#     tools/watch-checks.sh <pr-number | commit-sha> [options]
#     tools/watch-checks.sh --pr N | --sha SHA [options]
#     tools/watch-checks.sh --verify
#
#     --interval S    seconds between polls (default 30; GitHub rate limits apply)
#     --timeout S     give up after S seconds (default 1800)
#     --min-polls N   successful polls before "nothing pending" may count as settled (default 3)
#     --repo O/N      repository for the commit mode (default: the checkout's, via gh repo view)
#
# A bare positional made only of digits is a PR number; otherwise it must look like a sha.
#
# EXIT CODES
# ----------
#     0    settled, every context pass or skipping
#     1    settled, at least one context fail
#     2    no verdict: bad arguments, three consecutive fetch failures, or timeout
#
# `--verify` drives the whole loop against canned responses in both API shapes with no network
# and pins: each context printed once; the --min-polls guard (and the trap it closes); every
# fold in the table above; timeout, fetch failure and an empty answer all exiting 2, never 0;
# a transient failure followed by data still reaching a verdict; the argument refusals.

set -u

INTERVAL=30
TIMEOUT=1800
MIN_POLLS=3
REPO=""
REF=""
MODE=""
REPORT_FAILS=0

usage() {
  cat <<'EOF'
usage: tools/watch-checks.sh <pr-number | commit-sha> [--interval S] [--timeout S] [--min-polls N] [--repo OWNER/NAME]
       tools/watch-checks.sh --pr N | --sha SHA [options]
       tools/watch-checks.sh --verify
exit 0: every context pass/skipping   1: a context failed   2: no verdict (arguments, fetch, timeout)
EOF
}

is_uint() { case "$1" in ''|*[!0-9]*) return 1 ;; *) return 0 ;; esac; }
looks_like_sha() { printf '%s' "$1" | grep -Eq '^[0-9a-f]{7,40}$'; }

# count LINES PATTERN -> number of matching lines (0, not an error, when none match)
count() { printf '%s\n' "$1" | grep -c "$2" || true; }

# fetch_raw POLL_INDEX -> raw JSON on stdout; non-zero when nothing usable was fetched.
# Under --verify the answer is FIX[POLL_INDEX] (the last entry repeats) and the literal
# __ERROR__ simulates a failed request.
fetch_raw() {
  local i=$1
  if [ -n "${WATCH_FIXTURES+x}" ]; then
    local n=${#FIX[@]}
    [ "$i" -ge "$n" ] && i=$((n - 1))
    [ "${FIX[$i]}" = "__ERROR__" ] && return 1
    printf '%s\n' "${FIX[$i]}"
    return 0
  fi
  case "$MODE" in
    pr)
      # gh exits 8 while checks are pending and 1 when one failed, with the JSON still on
      # stdout; its exit code is not the failure signal here -- an unparsable body is (normalize).
      if [ -n "$REPO" ]; then gh pr checks "$REF" --json name,bucket --repo "$REPO" 2>/dev/null
      else gh pr checks "$REF" --json name,bucket 2>/dev/null; fi
      return 0 ;;
    sha)
      gh api --paginate "repos/$REPO/commits/$REF/check-runs?per_page=100" 2>/dev/null ;;
  esac
}

# normalize: raw JSON on stdin -> "name<TAB>bucket" lines, sorted, unique; non-zero when the
# body is not the shape the mode expects (an HTML error page, an empty answer, a wrong object).
normalize() {
  local lines
  case "$MODE" in
    pr)
      lines=$(jq -r 'if type != "array" then error("not a checks array") else .[] | "\(.name)\t\(if .bucket == "pass" then "pass" elif .bucket == "skipping" then "skipping" elif .bucket == "pending" then "pending" else "fail" end)" end') || return 1 ;;
    sha)
      # --paginate concatenates one object per page; -s slurps them into one array.
      lines=$(jq -r -s 'if (length > 0 and all(.[]; type == "object" and has("check_runs"))) then [.[].check_runs[]] | .[] | "\(.name)\t\(if .status != "completed" then "pending" elif .conclusion == "success" then "pass" elif (.conclusion == "skipped" or .conclusion == "neutral") then "skipping" else "fail" end)" else error("not a check-runs response") end') || return 1 ;;
  esac
  printf '%s\n' "$lines" | grep . | sort -u
  return 0
}

# report NORM VERDICT ELAPSED POLLS -> the full list and the verdict line; sets REPORT_FAILS.
report() {
  local norm=$1 n p f s pend
  n=$(count "$norm" .); p=$(count "$norm" $'\tpass$'); f=$(count "$norm" $'\tfail$')
  s=$(count "$norm" $'\tskipping$'); pend=$(count "$norm" $'\tpending$')
  echo "--- all $n context(s) on $REF after $4 poll(s), ${3}s ---"
  printf '%s\n' "$norm" | grep . | awk -F'\t' '{ print "  " $1 ": " $2 }'
  echo "watch-checks: $2 on $REF: $p pass, $f fail, $s skipping, $pend pending"
  REPORT_FAILS=$f
}

run_watch() {
  local start now elapsed attempt=0 good=0 errors=0 prev="" cur raw norm total pending
  start=$(date +%s)
  while :; do
    if raw=$(fetch_raw "$attempt") && norm=$(printf '%s\n' "$raw" | normalize); then
      errors=0
    else
      errors=$((errors + 1))
      echo "watch-checks: fetch failed ($errors of 3) on $REF" >&2
      if [ "$errors" -ge 3 ]; then
        echo "watch-checks: NO VERDICT on $REF: three consecutive fetch failures"
        return 2
      fi
      attempt=$((attempt + 1))
      sleep "$INTERVAL"
      continue
    fi
    attempt=$((attempt + 1)); good=$((good + 1))
    now=$(date +%s); elapsed=$((now - start))
    cur=$(printf '%s\n' "$norm" | grep -v $'\tpending$' || true)
    # newly settled since the previous poll, each exactly once
    comm -13 <(printf '%s\n' "$prev") <(printf '%s\n' "$cur") | grep . | awk -F'\t' -v e="$elapsed" '{ print "[+" e "s] " $1 ": " $2 }'
    prev=$cur
    total=$(count "$norm" .)
    pending=$(count "$norm" $'\tpending$')
    if [ "$total" -gt 0 ] && [ "$pending" -eq 0 ] && [ "$good" -ge "$MIN_POLLS" ]; then
      report "$norm" settled "$elapsed" "$good"
      [ "$REPORT_FAILS" -eq 0 ] && return 0
      return 1
    fi
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      report "$norm" TIMEOUT "$elapsed" "$good"
      return 2
    fi
    sleep "$INTERVAL"
  done
}

# ---------------------------------------------------------------------------------------------
# --verify: the loop against canned answers, no network. Every case names what it pins.
# ---------------------------------------------------------------------------------------------
V_FAILS=0
V_CASES=0
v_fail() { echo "verify FAIL: $*" >&2; V_FAILS=$((V_FAILS + 1)); }
v_rc() { [ "$2" -eq "$3" ] || v_fail "$1: exit $3, expected $2"; }               # NAME WANT GOT
v_has() { printf '%s\n' "$2" | grep -Eq -- "$3" || v_fail "$1: output lacks /$3/"; }   # NAME OUT PATTERN
v_lacks() { printf '%s\n' "$2" | grep -Eq -- "$3" && v_fail "$1: output must not carry /$3/"; return 0; }
v_count() {  # NAME OUT PATTERN WANT
  local got; got=$(printf '%s\n' "$2" | grep -Ec -- "$3" || true)
  [ "$got" -eq "$4" ] || v_fail "$1: /$3/ appears $got time(s), expected $4"
}
# v_case NAME MODE REF MIN_POLLS TIMEOUT -> runs the loop over FIX; sets V_OUT and V_RC
v_case() {
  V_CASES=$((V_CASES + 1))
  MODE=$2; REF=$3; MIN_POLLS=$4; TIMEOUT=$5
  V_OUT=$(run_watch 2>&1); V_RC=$?
}

verify() {
  command -v jq >/dev/null || { echo "verify: needs jq on PATH" >&2; return 2; }
  WATCH_FIXTURES=1; INTERVAL=0; REPO=owner/name
  local settled_at_1 settled_at_3

  # 1. PR shape, once-each, and the created-over-time trap: poll 1 shows two green contexts
  #    and nothing pending; the third context only appears at poll 2 and settles at poll 3.
  FIX=(
    '[{"name":"integrity","bucket":"pass"},{"name":"skills","bucket":"pass"}]'
    '[{"name":"integrity","bucket":"pass"},{"name":"skills","bucket":"pass"},{"name":"CodeQL","bucket":"pending"}]'
    '[{"name":"integrity","bucket":"pass"},{"name":"skills","bucket":"pass"},{"name":"CodeQL","bucket":"skipping"}]'
  )
  v_case 'pr/guard-at-1 (the trap)' pr 807 1 600
  settled_at_1=$V_OUT
  v_rc 'pr/guard-at-1' 0 "$V_RC"
  v_has 'pr/guard-at-1' "$settled_at_1" '^--- all 2 context\(s\) on 807 after 1 poll\(s\)'
  v_has 'pr/guard-at-1' "$settled_at_1" '^watch-checks: settled on 807: 2 pass, 0 fail, 0 skipping, 0 pending$'

  v_case 'pr/guard-at-3' pr 807 3 600
  settled_at_3=$V_OUT
  v_rc 'pr/guard-at-3' 0 "$V_RC"
  v_has 'pr/guard-at-3' "$settled_at_3" '^--- all 3 context\(s\) on 807 after 3 poll\(s\)'
  v_has 'pr/guard-at-3' "$settled_at_3" '^watch-checks: settled on 807: 2 pass, 0 fail, 1 skipping, 0 pending$'
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] integrity: pass$' 1
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] skills: pass$' 1
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] CodeQL: skipping$' 1
  v_lacks 'pr/guard-at-3 pending never printed' "$settled_at_3" 'CodeQL: pending'
  [ "$settled_at_1" != "$settled_at_3" ] || v_fail 'the guard changed nothing: --min-polls 1 and 3 gave identical output on the trap fixtures'

  # 2. PR shape: fail and cancel both count as fail; exit 1.
  FIX=('[{"name":"a","bucket":"pass"},{"name":"b","bucket":"fail"},{"name":"c","bucket":"cancel"}]')
  v_case 'pr/fail' pr 12 1 600
  v_rc 'pr/fail' 1 "$V_RC"
  v_has 'pr/fail' "$V_OUT" '^watch-checks: settled on 12: 1 pass, 2 fail, 0 skipping, 0 pending$'
  v_has 'pr/fail cancel folds to fail' "$V_OUT" '^\[\+[0-9]+s\] c: fail$'

  # 3. Commit shape: every fold in the header's table, one row each, and a run that is still
  #    in progress at poll 1 and completes at poll 2 (printed once, and never as pending).
  FIX=(
    '{"total_count":6,"check_runs":[{"name":"build","status":"in_progress","conclusion":null},{"name":"ok","status":"completed","conclusion":"success"},{"name":"skip","status":"completed","conclusion":"skipped"},{"name":"neu","status":"completed","conclusion":"neutral"},{"name":"bad","status":"completed","conclusion":"failure"},{"name":"late","status":"completed","conclusion":"timed_out"}]}'
    '{"total_count":6,"check_runs":[{"name":"build","status":"completed","conclusion":"success"},{"name":"ok","status":"completed","conclusion":"success"},{"name":"skip","status":"completed","conclusion":"skipped"},{"name":"neu","status":"completed","conclusion":"neutral"},{"name":"bad","status":"completed","conclusion":"failure"},{"name":"late","status":"completed","conclusion":"timed_out"}]}'
  )
  v_case 'sha/folds' sha 1ef51218c 2 600
  v_rc 'sha/folds' 1 "$V_RC"
  v_has 'sha/folds' "$V_OUT" '^watch-checks: settled on 1ef51218c: 2 pass, 2 fail, 2 skipping, 0 pending$'
  v_count 'sha/folds build once' "$V_OUT" '^\[\+[0-9]+s\] build: pass$' 1
  v_lacks 'sha/folds pending never printed' "$V_OUT" 'build: pending'
  v_has 'sha/folds skipped' "$V_OUT" '^  skip: skipping$'
  v_has 'sha/folds neutral' "$V_OUT" '^  neu: skipping$'
  v_has 'sha/folds failure' "$V_OUT" '^  bad: fail$'
  v_has 'sha/folds timed_out' "$V_OUT" '^  late: fail$'

  # 4. Commit shape, paginated: two page objects concatenated (what --paginate prints).
  FIX=('{"total_count":2,"check_runs":[{"name":"p1","status":"completed","conclusion":"success"}]}
{"total_count":2,"check_runs":[{"name":"p2","status":"completed","conclusion":"success"}]}')
  v_case 'sha/paginated' sha abcdef0 1 600
  v_rc 'sha/paginated' 0 "$V_RC"
  v_has 'sha/paginated' "$V_OUT" '^--- all 2 context\(s\) on abcdef0'

  # 5. Timeout with a context still pending: exit 2, the pending count in the verdict.
  FIX=('[{"name":"a","bucket":"pass"},{"name":"b","bucket":"pending"}]')
  v_case 'pr/timeout' pr 12 1 0
  v_rc 'pr/timeout' 2 "$V_RC"
  v_has 'pr/timeout' "$V_OUT" '^watch-checks: TIMEOUT on 12: 1 pass, 0 fail, 0 skipping, 1 pending$'

  # 6. Three consecutive failed requests: exit 2, and no settled verdict anywhere.
  FIX=('__ERROR__')
  v_case 'pr/fetch-failure' pr 12 1 600
  v_rc 'pr/fetch-failure' 2 "$V_RC"
  v_has 'pr/fetch-failure' "$V_OUT" 'three consecutive fetch failures'
  v_lacks 'pr/fetch-failure' "$V_OUT" 'settled'

  # 7. A body that is not the expected shape (an HTML error page, a bare object) is a fetch
  #    failure too, in both modes.
  FIX=('<html>503 Service Unavailable</html>')
  v_case 'pr/unparsable' pr 12 1 600
  v_rc 'pr/unparsable' 2 "$V_RC"
  FIX=('{"message":"Not Found"}')
  v_case 'sha/wrong-object' sha abcdef0 1 600
  v_rc 'sha/wrong-object' 2 "$V_RC"

  # 8. An empty answer is not a pass: zero contexts never settle, so with the timeout at zero
  #    the exit is 2 and the report says 0 context(s). Both shapes.
  FIX=('[]')
  v_case 'pr/empty' pr 12 1 0
  v_rc 'pr/empty' 2 "$V_RC"
  v_has 'pr/empty' "$V_OUT" '^--- all 0 context\(s\) on 12'
  v_lacks 'pr/empty' "$V_OUT" 'settled'
  FIX=('{"total_count":0,"check_runs":[]}')
  v_case 'sha/empty' sha abcdef0 1 0
  v_rc 'sha/empty' 2 "$V_RC"
  v_lacks 'sha/empty' "$V_OUT" 'settled'

  # 9. A transient failure followed by data still reaches a verdict (the error count resets).
  FIX=('__ERROR__' '[{"name":"a","bucket":"pass"}]')
  v_case 'pr/transient' pr 12 1 600
  v_rc 'pr/transient' 0 "$V_RC"
  v_has 'pr/transient' "$V_OUT" '^watch-checks: settled on 12: 1 pass, 0 fail, 0 skipping, 0 pending$'

  # 10. Argument refusals, through a fresh process so the parser itself is exercised.
  local rc
  bash "$0" >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/no ref' 2 "$rc"
  bash "$0" --bogus 12 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/unknown option' 2 "$rc"
  bash "$0" notaref >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/neither number nor sha' 2 "$rc"
  bash "$0" 12 --min-polls 0 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/min-polls 0' 2 "$rc"
  bash "$0" --pr >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/missing value' 2 "$rc"
  bash "$0" 12 34 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/two refs' 2 "$rc"
  bash "$0" --sha 12 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/--sha with a non-sha' 2 "$rc"

  if [ "$V_FAILS" -eq 0 ]; then
    echo "verify: $V_CASES case(s), 0 failure(s) -- both API shapes, the --min-polls guard, every fold, timeout, fetch failure, empty answer, transient recovery, argument refusals"
    return 0
  fi
  echo "verify: $V_CASES case(s), $V_FAILS failure(s)" >&2
  return 1
}

main() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --verify) verify; exit $? ;;
      -h|--help) usage; exit 0 ;;
      --pr|--sha|--interval|--timeout|--min-polls|--repo)
        [ $# -ge 2 ] || { echo "watch-checks: $1 needs a value" >&2; usage >&2; exit 2; }
        case "$1" in
          --pr) MODE=pr; REF=$2 ;;
          --sha) MODE=sha; REF=$2 ;;
          --interval) INTERVAL=$2 ;;
          --timeout) TIMEOUT=$2 ;;
          --min-polls) MIN_POLLS=$2 ;;
          --repo) REPO=$2 ;;
        esac
        shift 2 ;;
      -*) echo "watch-checks: unknown option $1" >&2; usage >&2; exit 2 ;;
      *)
        [ -z "$REF" ] || { echo "watch-checks: one ref only (got '$REF' and '$1')" >&2; exit 2; }
        REF=$1; shift ;;
    esac
  done
  [ -n "$REF" ] || { usage >&2; exit 2; }
  if [ -z "$MODE" ]; then
    if is_uint "$REF"; then MODE=pr
    elif looks_like_sha "$REF"; then MODE=sha
    else echo "watch-checks: '$REF' is neither a PR number nor a sha (use --pr / --sha)" >&2; exit 2; fi
  fi
  case "$MODE" in
    pr) is_uint "$REF" || { echo "watch-checks: --pr needs a number, got '$REF'" >&2; exit 2; } ;;
    sha) looks_like_sha "$REF" || { echo "watch-checks: --sha needs 7-40 hex digits, got '$REF'" >&2; exit 2; } ;;
  esac
  if ! { is_uint "$INTERVAL" && is_uint "$TIMEOUT" && is_uint "$MIN_POLLS" && [ "$MIN_POLLS" -ge 1 ]; }; then
    echo "watch-checks: --interval and --timeout take a non-negative integer, --min-polls a positive one" >&2
    exit 2
  fi
  if ! command -v gh >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
    echo "watch-checks: needs gh and jq on PATH" >&2
    exit 2
  fi
  if [ "$MODE" = sha ] && [ -z "$REPO" ]; then
    REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null) || REPO=""
    [ -n "$REPO" ] || { echo "watch-checks: cannot determine the repository; pass --repo OWNER/NAME" >&2; exit 2; }
  fi
  echo "watch-checks: $MODE $REF (every ${INTERVAL}s, up to ${TIMEOUT}s, settled after >= $MIN_POLLS poll(s) with nothing pending)"
  run_watch
}

main "$@"
