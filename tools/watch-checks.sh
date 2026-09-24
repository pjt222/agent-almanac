#!/usr/bin/env bash
# watch-checks.sh -- wait for the checks on a pull request or a commit to settle, printing each
# context ONCE per settled state, then the full list, then a verdict; exit by verdict.
#
# WHY THIS EXISTS
# ---------------
# The loop was typed by hand repeatedly in the 2026-09-08 session -- over PR heads
# (`gh pr checks N --json name,bucket` until nothing was pending) and over the #807 merge commit
# (`gh api .../commits/SHA/check-runs`), each a slightly different heredoc with its own
# off-by-one -- while CLAUDE.md § Tools says a snippet typed a second time becomes a file here.
# `gh pr checks --watch` is not that file: it prints every result twice (once as it lands, once
# in the summary), it has no commit mode, and its exit code is no verdict: gh documents 8 for
# pending checks, and with `--json` it exited 0 with eleven of eleven contexts pending (#809's
# fact sheet, F15, measured on a push of this very file).
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
# "Once" means once per settled STATE, never once per poll: a context that changes state after
# settling is printed again with its new state. Measured on this tool's own PR (#809): the
# aggregate `CodeQL` context printed `skipping` at +34s (neutral while its analyses ran) and
# `pass` at +129s. The final list and the verdict count each name once, at its last state.
# Names are not unique on GitHub (four workflows here were all `validate` until #641): two
# contexts sharing a name AND a state are listed once, so the count can read low; a pending or
# failing twin has a different state and survives the collapse, so the verdict cannot lose a
# red or a pending to it.
#
# THE SETTLE PREDICATE, AND --min-polls
# -------------------------------------
# Settled means: at least one context exists, none is pending, AND at least --min-polls polls
# that SAW a context have been made (default 3). A poll answered with zero contexts -- no runs
# created yet, or in PR mode an empty body -- does not count toward the guard: counting it let
# three empty polls spend the guard before any run existed, so the first created-and-completed
# subset would have settled the watch (#809 round-1 B1). The third clause is the trap the
# hand-typed loops fell into: on a freshly pushed head the check-runs are CREATED over the first
# minute or two, so a poll that finds the first-created runs complete reports "nothing pending"
# before the rest exist. Two contexts green at poll 1 is not twelve contexts green at poll 3.
#
# The guard NARROWS that trap; it does not close it. Its coverage at the defaults is
# interval x (min-polls - 1) = 60s after the first context appears, and a subset that is created
# AND completed before the rest are created is invisible to any counter of polls, because every
# one of those polls saw contexts. In the runs measured on #809 (the fact sheet's F10c, the
# watch started before the push) the pending clause held the loop at every poll after the push
# -- 11 contexts with 8 pending at +34s, 23s after the push; all 12 by +65s -- and the guard bound once, at
# poll 1, where it stopped a verdict on the pre-push head. The created-and-completed-before-the-
# rest-exist case remains unobserved, so the default of 3 is a cheap belt, not a measured
# requirement. Pass `--min-polls 1` only for a ref whose checks settled long ago; raise it for a
# repository whose runs are created slowly. Each poll prints its counts on stderr -- contexts,
# pending, polls that saw a context so far -- so a reader of the log can tell which clause held
# the loop, and an empty body in PR mode is reported there with gh's exit (an unknown PR or an
# expired token look like "no checks yet" without it).
#
# PR mode follows the PR, not a commit: a push during the watch changes the subject mid-run, and
# both heads' contexts appear in one log (F10c: twelve green lines at +2s for the pre-push head,
# five of the same names again from +65s as the new head settled). The poll counter carries
# across the boundary, so polls of the old head count toward the guard for the new one (one in
# each of F10c and F10d: the new head settled on three observations, not four), and with
# `--min-polls 1` the verdict can describe a head that is no longer the head. Use `--sha` when
# the verdict must be pinned to a commit.
#
# USAGE
# -----
#     tools/watch-checks.sh <pr-number | commit-sha> [options]
#     tools/watch-checks.sh --pr N | --sha SHA [options]
#     tools/watch-checks.sh --verify
#
#     --interval S    seconds between polls (default 30; GitHub rate limits apply)
#     --timeout S     give up after S seconds (default 1800)
#     --min-polls N   polls that saw a context before "nothing pending" may count as settled (default 3)
#     --repo O/N      repository for the commit mode (default: the checkout's, via gh repo view)
#
# A bare positional made only of digits is a PR number; otherwise it must look like a sha.
#
# EXIT CODES
# ----------
#     0    settled, every context that REPORTED is pass or skipping
#     1    settled, at least one context fail
#     2    no verdict: bad arguments, three consecutive fetch failures, or timeout
#
# 0 is not a merge-readiness verdict: a required context that has never reported ("Expected")
# is invisible to both shapes, and commit mode reads check runs, not legacy commit statuses, so
# a status-only red is not seen either. Ask `gh pr view --json mergeStateStatus` for
# mergeability. `--help` exits 0 and `--verify` exits by its own result (0 clean, 1 a case
# failed, 2 it could not run), neither a verdict about a ref.
#
# `--verify` drives the whole loop against canned responses in both API shapes with no network
# and pins: each context printed once per settled state, including one that settles and then
# changes; the --min-polls guard (the trap open at 1 and narrowed at 3 on the same fixtures, and
# empty polls not spending it); every fold in the table above; timeout, fetch failure and an
# empty answer all exiting 2, never 0; a transient failure followed by data still reaching a
# verdict; the argument refusals. What it cannot reach: the two live `gh` invocations inside
# fetch_raw -- the fixtures short-circuit above them, so a mutant there survives by
# construction. Those lines are measured live instead (the fact sheet of #809, F7 and F10).

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
exit 0: every reported context pass/skipping   1: a context failed   2: no verdict (arguments, fetch, timeout)
EOF
}

is_uint() { case "$1" in ''|*[!0-9]*) return 1 ;; *) return 0 ;; esac; }
looks_like_sha() { printf '%s' "$1" | grep -Eq '^[0-9a-f]{7,40}$'; }

# count LINES PATTERN -> number of matching lines (0, not an error, when none match)
count() { printf '%s\n' "$1" | grep -c "$2" || true; }

# fetch_raw POLL_INDEX -> raw JSON on stdout; non-zero when nothing usable was fetched.
# Under --verify the answer is FIX[POLL_INDEX] (the last entry repeats) and the literal
# __ERROR__ simulates a failed request. --verify never reaches the two gh lines below.
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
      # gh's exit is no signal here: it documents 8 for pending checks, but with --json it
      # exited 0 with every context pending (F15), and the JSON is on stdout either way. Only an
      # unparsable body is a failure (normalize). An EMPTY body (no checks reported
      # yet, but also an unknown PR or an expired token) is a successful poll with zero contexts,
      # never a fetch failure -- waiting through "no checks yet" is the primary use -- and gh's
      # exit is reported for it HERE, on stderr, which passes through the caller's $( ) where a
      # variable assigned in this subshell would be lost (#809 round-2 B1: a global set here
      # printed nothing in five live polls).
      local out rc
      if [ -n "$REPO" ]; then out=$(gh pr checks "$REF" --json name,bucket --repo "$REPO" 2>/dev/null); rc=$?
      else out=$(gh pr checks "$REF" --json name,bucket 2>/dev/null); rc=$?; fi
      [ -n "$out" ] || echo "watch-checks: gh pr checks exit $rc, empty body on $REF (no checks reported yet, an unknown PR, or gh auth)" >&2
      printf '%s\n' "$out"
      return 0 ;;
    sha)
      gh api --paginate "repos/$REPO/commits/$REF/check-runs?per_page=100" 2>/dev/null ;;
  esac
}

# normalize: raw JSON on stdin -> "name<TAB>bucket" lines, sorted, unique; non-zero when the
# body is not the shape the mode expects (an HTML error page, a wrong object; in commit mode
# also an empty answer, which the slurp turns into `[]`). In PR mode an empty body yields zero
# lines and returns 0: a zero-context poll, reported as such by the loop.
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

# show PREFIX -> stdin "name<TAB>state" lines as "PREFIXname: state"; the state is the LAST
# field, so a tab inside a name cannot swallow it.
show() { awk -F'\t' -v p="$1" '{ st = $NF; name = $0; sub("\t" st "$", "", name); print p name ": " st }'; }

# report NORM VERDICT ELAPSED ATTEMPTS SEEN -> the full list and the verdict line; sets REPORT_FAILS.
report() {
  local norm=$1 n p f s pend
  n=$(count "$norm" .); p=$(count "$norm" $'\tpass$'); f=$(count "$norm" $'\tfail$')
  s=$(count "$norm" $'\tskipping$'); pend=$(count "$norm" $'\tpending$')
  echo "--- all $n context(s) on $REF after $4 attempt(s), $5 of them seeing a context, ${3}s ---"
  printf '%s\n' "$norm" | grep . | show '  '
  echo "watch-checks: $2 on $REF: $p pass, $f fail, $s skipping, $pend pending"
  REPORT_FAILS=$f
}

run_watch() {
  local start now elapsed attempt=0 seen=0 errors=0 prev="" cur raw norm total pending
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
    attempt=$((attempt + 1))
    now=$(date +%s); elapsed=$((now - start))
    total=$(count "$norm" .)
    pending=$(count "$norm" $'\tpending$')
    # the guard counts polls that SAW a context; an empty answer must not spend it (round-1 B1)
    [ "$total" -gt 0 ] && seen=$((seen + 1))
    echo "watch-checks: poll $attempt at +${elapsed}s: $total context(s), $pending pending; polls seeing a context: $seen of $MIN_POLLS" >&2
    cur=$(printf '%s\n' "$norm" | grep -v $'\tpending$' || true)
    # newly settled since the previous poll -- each (name, state) exactly once. A zero-context
    # poll leaves prev alone: overwriting it with nothing re-printed every settled context at
    # the next answer (#809 round-2 S1). A context that vanishes with all the others therefore
    # stays in the memo; one that vanishes alone is diffed away as usual.
    comm -13 <(printf '%s\n' "$prev") <(printf '%s\n' "$cur") | grep . | show "[+${elapsed}s] "
    [ "$total" -gt 0 ] && prev=$cur
    if [ "$total" -gt 0 ] && [ "$pending" -eq 0 ] && [ "$seen" -ge "$MIN_POLLS" ]; then
      report "$norm" settled "$elapsed" "$attempt" "$seen"
      [ "$REPORT_FAILS" -eq 0 ] && return 0
      return 1
    fi
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      report "$norm" TIMEOUT "$elapsed" "$attempt" "$seen"
      [ "$seen" -gt 0 ] || echo "watch-checks: no context was ever reported on $REF -- check the ref and \`gh auth status\`"
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
  v_has 'pr/guard-at-1' "$settled_at_1" '^--- all 2 context\(s\) on 807 after 1 attempt\(s\), 1 of them seeing a context'
  v_has 'pr/guard-at-1' "$settled_at_1" '^watch-checks: settled on 807: 2 pass, 0 fail, 0 skipping, 0 pending$'

  v_case 'pr/guard-at-3' pr 807 3 600
  settled_at_3=$V_OUT
  v_rc 'pr/guard-at-3' 0 "$V_RC"
  v_has 'pr/guard-at-3' "$settled_at_3" '^--- all 3 context\(s\) on 807 after 3 attempt\(s\), 3 of them seeing a context'
  v_has 'pr/guard-at-3' "$settled_at_3" '^watch-checks: settled on 807: 2 pass, 0 fail, 1 skipping, 0 pending$'
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] integrity: pass$' 1
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] skills: pass$' 1
  v_count 'pr/guard-at-3 once-each' "$settled_at_3" '^\[\+[0-9]+s\] CodeQL: skipping$' 1
  v_lacks 'pr/guard-at-3 pending never printed' "$settled_at_3" 'CodeQL: pending'
  v_has 'pr/guard-at-3 per-poll counts on stderr' "$settled_at_3" '^watch-checks: poll 2 at \+[0-9]+s: 3 context\(s\), 1 pending; polls seeing a context: 2 of 3$'
  [ "$settled_at_1" != "$settled_at_3" ] || v_fail 'the guard changed nothing: --min-polls 1 and 3 gave identical output on the trap fixtures'

  # 1b. Empty polls must not spend the guard (round-1 B1): three answers with no contexts, then
  #     data. Counting polls settles at attempt 4 over whatever exists; counting polls that saw a
  #     context settles at attempt 6, after three observations.
  FIX=('[]' '[]' '[]' '[{"name":"a","bucket":"pass"}]')
  v_case 'pr/empty-polls-do-not-spend-the-guard' pr 12 3 600
  v_rc 'pr/empty-polls' 0 "$V_RC"
  v_has 'pr/empty-polls' "$V_OUT" '^--- all 1 context\(s\) on 12 after 6 attempt\(s\), 3 of them seeing a context'
  v_has 'pr/empty-polls zero-context poll reported' "$V_OUT" '^watch-checks: poll 1 at \+[0-9]+s: 0 context\(s\), 0 pending; polls seeing a context: 0 of 3$'

  # 1c. A zero-context poll between two answers must not re-print what already settled (round-2
  #     S1): overwriting prev with nothing made the next answer diff against nothing.
  FIX=('[{"name":"a","bucket":"pass"}]' '[]' '[{"name":"a","bucket":"pass"}]')
  v_case 'pr/zero-context-poll-does-not-reprint' pr 12 2 600
  v_rc 'pr/zero-context-poll' 0 "$V_RC"
  v_count 'pr/zero-context-poll re-print' "$V_OUT" '^\[\+[0-9]+s\] a: pass$' 1
  v_has 'pr/zero-context-poll settled after the third answer' "$V_OUT" '^--- all 1 context\(s\) on 12 after 3 attempt\(s\), 2 of them seeing a context'

  # 2. PR shape: fail and cancel both count as fail; exit 1.
  FIX=('[{"name":"a","bucket":"pass"},{"name":"b","bucket":"fail"},{"name":"c","bucket":"cancel"}]')
  v_case 'pr/fail' pr 12 1 600
  v_rc 'pr/fail' 1 "$V_RC"
  v_has 'pr/fail' "$V_OUT" '^watch-checks: settled on 12: 1 pass, 2 fail, 0 skipping, 0 pending$'
  v_has 'pr/fail cancel folds to fail' "$V_OUT" '^\[\+[0-9]+s\] c: fail$'

  # 2b. A context that settles and then changes state is printed again with its new state, and
  #     counted once, at its last state (once per settled STATE, never per poll).
  FIX=('[{"name":"a","bucket":"pass"}]' '[{"name":"a","bucket":"fail"}]')
  v_case 'pr/state-change' pr 12 2 600
  v_rc 'pr/state-change' 1 "$V_RC"
  v_count 'pr/state-change first state' "$V_OUT" '^\[\+[0-9]+s\] a: pass$' 1
  v_count 'pr/state-change second state' "$V_OUT" '^\[\+[0-9]+s\] a: fail$' 1
  v_has 'pr/state-change counted once' "$V_OUT" '^--- all 1 context\(s\) on 12'
  v_has 'pr/state-change verdict at the last state' "$V_OUT" '^watch-checks: settled on 12: 0 pass, 1 fail, 0 skipping, 0 pending$'

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
  #    the exit is 2, the report says 0 context(s), and the poll was reported as seeing none.
  #    In PR mode the empty body and `[]` are the same zero-context poll; in commit mode an
  #    empty body is a fetch failure (the slurp makes it `[]`) and `check_runs: []` the poll.
  FIX=('[]')
  v_case 'pr/empty' pr 12 1 0
  v_rc 'pr/empty' 2 "$V_RC"
  v_has 'pr/empty' "$V_OUT" '^--- all 0 context\(s\) on 12 after 1 attempt\(s\), 0 of them seeing a context'
  v_has 'pr/empty reported' "$V_OUT" '0 context\(s\), 0 pending; polls seeing a context: 0 of 1'
  v_has 'pr/empty diagnosis at timeout' "$V_OUT" '^watch-checks: no context was ever reported on 12 -- check the ref and `gh auth status`$'
  v_lacks 'pr/empty' "$V_OUT" 'settled'
  FIX=('')
  v_case 'pr/empty-body' pr 12 1 0
  v_rc 'pr/empty-body' 2 "$V_RC"
  v_has 'pr/empty-body is a zero-context poll, not a fetch failure' "$V_OUT" '^--- all 0 context\(s\) on 12 after 1 attempt\(s\)'
  v_lacks 'pr/empty-body' "$V_OUT" 'fetch failed'
  FIX=('{"total_count":0,"check_runs":[]}')
  v_case 'sha/empty' sha abcdef0 1 0
  v_rc 'sha/empty' 2 "$V_RC"
  v_lacks 'sha/empty' "$V_OUT" 'settled'
  FIX=('')
  v_case 'sha/empty-body' sha abcdef0 1 600
  v_rc 'sha/empty-body is a fetch failure' 2 "$V_RC"
  v_has 'sha/empty-body' "$V_OUT" 'three consecutive fetch failures'

  # 9. Transient failures around data still reach a verdict, because a good poll RESETS the
  #    failure count: failure, data, failure, failure, data counts 1, 0, 1, 2, 0 and settles;
  #    without the reset it counts 1, 1, 2, 3 and gives up. (A fixture of one failure then data
  #    cannot tell the two apart -- a mutant making the reset a no-op survived it.)
  FIX=('__ERROR__' '[{"name":"a","bucket":"pending"}]' '__ERROR__' '__ERROR__' '[{"name":"a","bucket":"pass"}]')
  v_case 'pr/transient' pr 12 1 600
  v_rc 'pr/transient' 0 "$V_RC"
  v_has 'pr/transient' "$V_OUT" '^watch-checks: settled on 12: 1 pass, 0 fail, 0 skipping, 0 pending$'
  v_has 'pr/transient count reached 2' "$V_OUT" 'fetch failed \(2 of 3\)'
  v_lacks 'pr/transient never gave up' "$V_OUT" 'three consecutive fetch failures'

  # 10. Argument refusals, through a fresh process so the parser itself is exercised. $0 must
  #     be this file: under `... | bash` it is `bash`, and the cases would test bash's own
  #     option handling (which also exits 2) -- a vacuous pass, made loud here.
  local rc
  [ -f "$0" ] || v_fail "args: \$0 is '$0', not this script; the argument cases would test bash itself"
  bash "$0" >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/no ref' 2 "$rc"
  bash "$0" --bogus 12 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/unknown option' 2 "$rc"
  bash "$0" notaref >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/neither number nor sha' 2 "$rc"
  bash "$0" 12 --min-polls 0 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/min-polls 0' 2 "$rc"
  bash "$0" --pr >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/missing value' 2 "$rc"
  bash "$0" 12 34 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/two refs' 2 "$rc"
  bash "$0" --sha 12 >/dev/null 2>&1; rc=$?; V_CASES=$((V_CASES + 1)); v_rc 'args/--sha with a non-sha' 2 "$rc"

  if [ "$V_FAILS" -eq 0 ]; then
    echo "verify: $V_CASES case(s), 0 failure(s) -- both API shapes, once per settled state, the --min-polls guard (empty polls do not spend it), every fold, timeout, fetch failure, empty answer, transient recovery, argument refusals"
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
  echo "watch-checks: $MODE $REF (every ${INTERVAL}s, up to ${TIMEOUT}s, settled after >= $MIN_POLLS poll(s) seeing a context with nothing pending)"
  run_watch
}

main "$@"
