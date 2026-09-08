#!/usr/bin/env bash
# merge-pr.sh -- merge a reviewed, green pull request from a throwaway seat branch, read the
# verdict from the API, then detach this checkout onto the merged base and delete the branches.
#
# WHY THIS EXISTS
# ---------------
# In this repository `main` is checked out in a linked worktree (.claude/worktrees/...), so
# `gh pr merge --delete-branch` merges the PR on GitHub and THEN fails its local housekeeping --
# `fatal: 'main' is already used by worktree at ...` -- exit 1, neither branch deleted (#792,
# hit on the #788 merge). Detaching first only swaps the message (`could not determine current
# branch`, measured on #793): gh has to determine the current branch before it can decide
# whether to touch the tree. Merging from a DIFFERENT NAMED BRANCH -- a throwaway seat cut from
# origin/<base> -- was measured on #805: exit 0, stdout and stderr empty, checkout untouched,
# because gh only cleans up locally when the current branch IS the PR's head. The steps around
# that (read the verdict from the API, detach onto the merged base, `git branch -d`, delete the
# remote branch) were typed by hand for #805, as merge-807.sh for #807 and again as merge-pr.sh
# for #809. The second typing is where CLAUDE.md § Tools says a file begins.
#
# THE VERDICT IS THE API'S, NEVER gh's EXIT
# -----------------------------------------
# On #788 and #793 `gh pr merge` exited 1 after the merge had happened; on #805, #807 and #809 it
# exited 0 having printed nothing. Its exit code describes its local step, not the merge. This
# tool prints that exit as information and decides on `gh pr view --json state,mergeCommit`:
# MERGED with a merge commit is a merge, anything else is not, whatever gh said.
#
# WHAT IT REFUSES BEFORE TOUCHING ANYTHING (exit 1)
# -------------------------------------------------
#   - the PR is not OPEN (already MERGED, or CLOSED)
#   - the PR head is not --head, the sha that was reviewed and whose checks were watched
#   - a check context that is not pass or skipping, or NO context at all: an empty answer is
#     what an unknown PR, an expired token and "no checks reported yet" look like, and none of
#     them is green (fail-closed, as tools/watch-checks.sh)
# The check read is instantaneous -- wait with tools/watch-checks.sh first -- and the merge
# passes `--match-head-commit`, so GitHub itself refuses a head that moved after the read.
#
# What this tool cannot see is whether the PR was REVIEWED: adversarial reports here are PR
# comments, not GitHub reviews. `--head` is the caller's assertion that the named sha is the
# reviewed one; exit 0 means "merged at the sha you named", and the standing allowance's
# reviewed clause (CLAUDE.md § Merging With a Red Check) stays the caller's to honour.
#
# ORDER OF OPERATIONS
# -------------------
#   1  read the PR: state, head sha, head branch, base branch, cross-repository or not
#   2  read every check context; count pass / skipping / other
#   3  record where this checkout is (branch name, or the detached sha), for the restore path
#   4  fetch origin/<base>; create the seat branch from it (refused if the name already exists)
#   5  gh pr merge --merge --match-head-commit <head>
#   6  verdict: gh pr view --json state,mergeCommit; not MERGED -> restore step 3, drop the seat, exit 1
#   7  fetch origin/<base> until it CONTAINS the merge commit (the README healer may already
#      have pushed on top of it, so equality is the wrong test); five tries
#   8  detach onto origin/<base>; git branch -d the seat and the local head branch
#   9  git push origin --delete <head branch>, then confirm by ls-remote
# Steps 8-9 skip the head branch, local and remote, when the PR comes from a fork: the branch
# name belongs to the fork, and a same-named branch here would be the wrong thing to delete.
# `--keep-remote` skips step 9 on purpose.
#
# ON ITS OWN PULL REQUEST
# -----------------------
# Step 4 checks out an origin/<base> that predates this file, removing tools/merge-pr.sh from
# the working tree while bash is executing it; step 8 brings it back. Measured 2026-09-08 before
# this file was written: a 2.6 MB script with its tail after a `sleep`, removed mid-run by `rm`
# and by `git checkout` on the NTFS mount and by `rm` on ext4 -- the tail ran and the exit was 0
# in all three arms, because bash keeps the open descriptor. So the removal is harmless; an
# in-place rewrite of the file would not be, and no checkout does one. The shape here --
# everything in functions, `main "$@"` the last line, every exit inside main -- is kept as
# hygiene: no line of this file is read after the seat checkout begins. `--verify` runs a copy
# of this file from inside its throwaway checkout so that case is pinned offline too.
#
# THE REPO GUARD IS NOT THIS TOOL'S JOB
# -------------------------------------
# A merge moves HEAD, so an armed `npm run guard:verify` goes red afterwards by design. Run
# guard:verify before this tool and `guard:rebaseline -- --accept=<sha>` after it; this tool
# prints no paste-ready override, for the reason CLAUDE.md § Guarding a Multi-Agent Run gives.
#
# USAGE
# -----
#     tools/merge-pr.sh <pr-number> --head <40-hex sha> [options]
#     tools/merge-pr.sh --verify
#
#     --head SHA       the reviewed head; refused unless it is the PR's head (required)
#     --repo O/N       repository (default: the checkout's, via gh repo view)
#     --seat NAME      the throwaway branch (default merge-seat-<pr>)
#     --keep-remote    do not delete the remote head branch
#     --interval S     seconds between the fetches of step 7 (default 2)
#     --dry-run        run steps 1-2 and print the plan; create nothing, merge nothing; exit 0
#     GH=<cmd>         the gh executable (default gh); --verify puts a fake gh on PATH instead
#
# EXIT CODES
# ----------
#     0    MERGED at --head; this checkout detached on the merged origin/<base>; branches deleted
#     1    refused before merging (nothing changed), or gh merged nothing (checkout restored)
#     2    could not run: arguments, not a git checkout, gh missing or unauthenticated, repo or
#          PR unreadable, an unparsable answer, the seat branch name already taken
#     3    MERGED on GitHub, but the cleanup did not complete -- read the lines above the verdict
#
# 3 is a separate code because a caller who reads "not 0" as "not merged" would retry the merge,
# skip guard:rebaseline and then trust a red guard:verify; the PR IS merged when 3 is returned.
# `--verify` exits by its own result (0 clean, 1 a case failed, 2 it could not run).
#
# `--verify` builds a throwaway origin (bare), a clone as the checkout with a feature branch,
# and a linked worktree holding main -- the constraint above, asserted present -- then runs this
# file as a fresh process against a fake gh on PATH that answers from the fixture, logs every
# call, and performs the merge for real into the bare origin (clone, --no-ff merge, push), so the
# fetch, the ancestor test, `branch -d` and `push --delete` run against real refs. What it
# cannot reach: the lines that invoke the real gh, which the fake stands in for. Those are
# measured on the dogfood merge of this tool's own PR.

set -u

GH="${GH:-gh}"

PR=""
HEAD_WANT=""
REPO=""
SEAT=""
KEEP_REMOTE=0
INTERVAL=2
DRY_RUN=0

usage() {
  cat <<'EOF'
usage: tools/merge-pr.sh <pr-number> --head <40-hex sha> [--repo OWNER/NAME] [--seat NAME] [--keep-remote] [--interval S] [--dry-run]
       tools/merge-pr.sh --verify
exit 0: merged at --head, checkout detached on the merged base, branches deleted   1: refused, or nothing merged
     2: could not run   3: MERGED but the cleanup did not complete (the PR is merged)
EOF
}

say() { printf 'merge-pr: %s\n' "$*"; }
die() { printf 'merge-pr: %s\n' "$*" >&2; exit 2; }
refuse() { printf 'merge-pr: REFUSED: %s\n' "$*"; exit 1; }
is_uint() { case "$1" in ''|*[!0-9]*) return 1 ;; *) return 0 ;; esac; }
is_full_sha() { printf '%s' "$1" | grep -Eq '^[0-9a-f]{40}$'; }

# read_pr -> sets PR_STATE PR_HEAD PR_HEAD_BRANCH PR_BASE PR_CROSS from one gh call.
read_pr() {
  local json line
  json=$("$GH" pr view "$PR" -R "$REPO" --json state,headRefOid,headRefName,baseRefName,isCrossRepository 2>/dev/null) \
    || die "cannot read PR $PR in $REPO (does it exist, and is gh authenticated?)"
  line=$(printf '%s\n' "$json" | jq -r '[.state, .headRefOid, .headRefName, .baseRefName, (.isCrossRepository | tostring)] | @tsv' 2>/dev/null) \
    || die "unparsable answer for PR $PR: $(printf '%s' "$json" | head -c 200)"
  IFS=$'\t' read -r PR_STATE PR_HEAD PR_HEAD_BRANCH PR_BASE PR_CROSS <<< "$line"
  [ -n "$PR_STATE" ] && [ -n "$PR_HEAD" ] && [ -n "$PR_HEAD_BRANCH" ] && [ -n "$PR_BASE" ] \
    || die "PR $PR answered with an empty field: state '$PR_STATE', head '$PR_HEAD', branch '$PR_HEAD_BRANCH', base '$PR_BASE'"
}

# read_checks -> sets CHECKS to "name<TAB>bucket" lines (possibly none); exit 2 on an unparsable
# body. Sets a variable rather than printing, because a `die` inside a caller's $( ) would exit
# the subshell only and hand the caller an empty, green-looking answer. gh's exit is not read:
# with --json it exited 0 with every context pending (#809, F15), and an empty body is a
# zero-context answer, which the caller refuses.
read_checks() {
  local json
  json=$("$GH" pr checks "$PR" -R "$REPO" --json name,bucket 2>/dev/null)
  [ -n "$json" ] || json='[]'
  CHECKS=$(printf '%s\n' "$json" | jq -r 'if type != "array" then error("not a checks array") else .[] | "\(.name)\t\(.bucket)" end' 2>/dev/null) \
    || die "unparsable checks answer for PR $PR: $(printf '%s' "$json" | head -c 200)"
}

# read_verdict -> "STATE OID" ("-" for no merge commit); one retry; exit 1 (not 2) if both fail,
# because at this point the merge may have happened and only the caller can say what to do.
read_verdict() {
  local json
  json=$("$GH" pr view "$PR" -R "$REPO" --json state,mergeCommit 2>/dev/null) \
    || json=$("$GH" pr view "$PR" -R "$REPO" --json state,mergeCommit 2>/dev/null) \
    || return 1
  printf '%s\n' "$json" | jq -r '"\(.state) \(.mergeCommit.oid // "-")"' 2>/dev/null || return 1
}

# current_ref -> the branch name, or "" when detached
current_ref() { git symbolic-ref -q --short HEAD 2>/dev/null || true; }

# restore ORIG_BRANCH ORIG_SHA -> put the checkout back where step 3 found it, drop the seat
restore() {
  if [ -n "$1" ]; then git checkout -q "$1" || return 1
  else git checkout -q --detach "$2" || return 1; fi
  git branch -d "$SEAT" >/dev/null 2>&1 || git branch -D "$SEAT" >/dev/null 2>&1 || return 1
  return 0
}

run_merge() {
  local top
  top=$(git rev-parse --show-toplevel 2>/dev/null) || die "not inside a git checkout"
  cd "$top" || die "cannot cd to $top"
  command -v "$GH" >/dev/null 2>&1 || die "$GH not installed"
  command -v jq >/dev/null 2>&1 || die "jq not installed"
  "$GH" auth status >/dev/null 2>&1 || die "$GH not authenticated"
  if [ -z "$REPO" ]; then
    REPO=$("$GH" repo view --json nameWithOwner 2>/dev/null | jq -r '.nameWithOwner // empty' 2>/dev/null) || REPO=""
    [ -n "$REPO" ] || die "cannot determine the repository; pass --repo OWNER/NAME"
  fi
  [ -n "$SEAT" ] || SEAT="merge-seat-$PR"

  # 1. the PR
  read_pr
  local same_repo=1
  [ "$PR_CROSS" = "false" ] || same_repo=0
  say "PR $PR on $REPO: $PR_STATE, head ${PR_HEAD:0:9} ($PR_HEAD_BRANCH -> $PR_BASE), $([ "$same_repo" -eq 1 ] && echo 'same repository' || echo 'from a fork')"
  [ "$PR_STATE" = "OPEN" ] || refuse "PR $PR is $PR_STATE, not OPEN; nothing to merge"
  [ "$PR_HEAD" = "$HEAD_WANT" ] || refuse "PR $PR head is $PR_HEAD, not the reviewed $HEAD_WANT"

  # 2. the checks, fail-closed
  local checks total green other
  read_checks; checks=$CHECKS
  total=$(printf '%s\n' "$checks" | grep -c . || true)
  green=$(printf '%s\n' "$checks" | grep -Ec $'\t(pass|skipping)$' || true)
  other=$((total - green))
  say "checks on ${PR_HEAD:0:9}: $total context(s), $green pass or skipping, $other other"
  [ "$total" -gt 0 ] || refuse "no check context reported on PR $PR (unknown PR, expired token, or no checks yet) -- run tools/watch-checks.sh $PR"
  if [ "$other" -gt 0 ]; then
    printf '%s\n' "$checks" | grep -Ev $'\t(pass|skipping)$' | awk -F'\t' '{ print "merge-pr:   " $1 ": " $2 }'
    refuse "$other context(s) not pass or skipping on PR $PR -- run tools/watch-checks.sh $PR and fix or re-run what is red"
  fi

  # 3. where this checkout is
  local orig_branch orig_sha
  orig_branch=$(current_ref)
  orig_sha=$(git rev-parse HEAD 2>/dev/null) || die "cannot read HEAD"
  git show-ref --verify -q "refs/heads/$SEAT" && die "a branch named $SEAT already exists (a previous run left it?); delete it or pass --seat"

  if [ "$DRY_RUN" -eq 1 ]; then
    say "dry run: would cut $SEAT from origin/$PR_BASE, merge #$PR with --match-head-commit ${PR_HEAD:0:9}, detach on origin/$PR_BASE, delete $SEAT$([ "$same_repo" -eq 1 ] && printf ', %s locally%s' "$PR_HEAD_BRANCH" "$([ "$KEEP_REMOTE" -eq 1 ] || echo ' and on origin')" || echo " (fork: $PR_HEAD_BRANCH left alone)")"
    exit 0
  fi

  # 4. the seat
  git fetch -q origin "$PR_BASE" || die "cannot fetch origin/$PR_BASE"
  git checkout -q -b "$SEAT" "origin/$PR_BASE" || die "cannot create $SEAT from origin/$PR_BASE (a dirty tree git would overwrite?)"
  say "seat $SEAT at $(git rev-parse --short HEAD) (origin/$PR_BASE); was $([ -n "$orig_branch" ] && echo "on $orig_branch" || echo "detached") at ${orig_sha:0:9}"

  # 5. the merge, 6. the verdict
  local merge_out merge_rc verdict state oid
  merge_out=$("$GH" pr merge "$PR" -R "$REPO" --merge --match-head-commit "$PR_HEAD" 2>&1); merge_rc=$?
  say "gh pr merge exit $merge_rc (information, not the verdict)$([ -n "$merge_out" ] && printf ': %s' "$(printf '%s' "$merge_out" | head -n 1)")"
  if verdict=$(read_verdict); then
    read -r state oid <<< "$verdict"
  else
    state=UNREADABLE; oid=-
  fi
  say "verdict from the API: $state $oid"
  if [ "$state" != MERGED ] || [ "$oid" = - ]; then
    if restore "$orig_branch" "$orig_sha"; then
      say "checkout restored to $([ -n "$orig_branch" ] && echo "$orig_branch" || echo "detached ${orig_sha:0:9}"); $SEAT deleted"
    else
      say "could not restore the checkout; it is on $(current_ref || echo detached) at $(git rev-parse --short HEAD)"
    fi
    [ "$state" = UNREADABLE ] && say "the verdict could not be read twice; ask gh pr view $PR --json state,mergeCommit before doing anything else"
    say "NOT MERGED #$PR"
    exit 1
  fi

  # 7. origin/<base> must contain the merge commit
  local try=0 contains=0
  while [ "$try" -lt 5 ]; do
    try=$((try + 1))
    git fetch -q origin "$PR_BASE" 2>/dev/null || true
    if git merge-base --is-ancestor "$oid" "origin/$PR_BASE" 2>/dev/null; then contains=1; break; fi
    [ "$try" -lt 5 ] && sleep "$INTERVAL"
  done
  if [ "$contains" -eq 0 ]; then
    say "origin/$PR_BASE ($(git rev-parse --short "origin/$PR_BASE")) does not contain the merge commit $oid after $try fetch(es); checkout left on $SEAT, branches kept"
    say "MERGED #$PR as $oid, cleanup incomplete"
    exit 3
  fi
  say "origin/$PR_BASE contains the merge after $try fetch(es)"

  # 8. detach, delete local branches
  local incomplete=0
  if git checkout -q --detach "origin/$PR_BASE"; then
    say "HEAD detached at $(git rev-parse --short HEAD) (origin/$PR_BASE)"
  else
    say "could not detach onto origin/$PR_BASE; checkout still on $(current_ref || echo detached)"; incomplete=1
  fi
  if git branch -d "$SEAT" >/dev/null 2>&1; then say "deleted local branch $SEAT"
  else say "could not delete local branch $SEAT"; incomplete=1; fi
  if [ "$same_repo" -eq 1 ]; then
    if git show-ref --verify -q "refs/heads/$PR_HEAD_BRANCH"; then
      if git branch -d "$PR_HEAD_BRANCH" >/dev/null 2>&1; then say "deleted local branch $PR_HEAD_BRANCH"
      else say "could not delete local branch $PR_HEAD_BRANCH (git branch -d refused it)"; incomplete=1; fi
    else
      say "no local branch $PR_HEAD_BRANCH to delete"
    fi
    # 9. the remote branch
    if [ "$KEEP_REMOTE" -eq 1 ]; then
      say "remote branch $PR_HEAD_BRANCH kept (--keep-remote)"
    else
      git push -q origin --delete "$PR_HEAD_BRANCH" >/dev/null 2>&1 || true
      if [ -z "$(git ls-remote --heads origin "$PR_HEAD_BRANCH" 2>/dev/null)" ]; then
        say "deleted remote branch $PR_HEAD_BRANCH (ls-remote: absent)"
      else
        say "remote branch $PR_HEAD_BRANCH still present after push --delete"; incomplete=1
      fi
    fi
  else
    say "head branch $PR_HEAD_BRANCH belongs to a fork: left alone locally and remotely"
  fi

  if [ "$incomplete" -eq 1 ]; then
    say "MERGED #$PR as $oid, cleanup incomplete"
    exit 3
  fi
  say "MERGED #$PR as $oid; checkout detached on origin/$PR_BASE at $(git rev-parse --short HEAD)"
  exit 0
}

# ---------------------------------------------------------------------------------------------
# --verify: a throwaway origin, checkout and worktree, a fake gh on PATH, this file as a process.
# ---------------------------------------------------------------------------------------------
V_FAILS=0
V_CASES=0
v_fail() { echo "verify FAIL: $*" >&2; V_FAILS=$((V_FAILS + 1)); }
v_rc() { [ "$2" -eq "$3" ] || v_fail "$1: exit $3, expected $2"; }                          # NAME WANT GOT
v_has() { printf '%s\n' "$2" | grep -Eq -- "$3" || v_fail "$1: output lacks /$3/"; }         # NAME OUT PATTERN
v_lacks() { printf '%s\n' "$2" | grep -Eq -- "$3" && v_fail "$1: output must not carry /$3/"; return 0; }
v_true() { eval "$2" || v_fail "$1: $2"; }                                                    # NAME CONDITION
v_false() { eval "$2" && v_fail "$1: NOT $2"; return 0; }

# The fake gh, written to a file so the tool can run as a fresh process with it first on PATH.
# It answers from FAKE_* variables, appends every call to FAKEGH_LOG, and on `pr merge`
# performs a real --no-ff merge of the head branch into the base inside the bare origin.
write_fake_gh() {
  cat > "$1" <<'FAKE'
#!/usr/bin/env bash
[ -n "${FAKEGH_LOG:-}" ] && printf '%s\n' "$*" >> "$FAKEGH_LOG"
merge_for_real() {
  local w; w=$(mktemp -d) || exit 1
  git clone -q "$FAKE_ORIGIN" "$w" \
    && git -C "$w" checkout -q "$FAKE_BASE" \
    && git -C "$w" -c user.name=fake -c user.email=fake@example merge -q --no-ff -m "Merge pull request #$1" "origin/$FAKE_HEAD_BRANCH" \
    && git -C "$w" push -q origin "$FAKE_BASE" \
    && git -C "$w" rev-parse HEAD > "$FAKE_MERGED_FILE"
  local rc=$?; rm -rf "$w"; return $rc
}
case "$1 $2" in
  "auth status") exit 0 ;;
  "repo view") printf '{"nameWithOwner":"o/r"}\n' ;;
  "pr view")
    case "$*" in
      *headRefOid*) printf '{"state":"%s","headRefOid":"%s","headRefName":"%s","baseRefName":"%s","isCrossRepository":%s}\n' "$FAKE_PR_STATE" "$FAKE_HEAD_SHA" "$FAKE_HEAD_BRANCH" "$FAKE_BASE" "$FAKE_CROSS" ;;
      *mergeCommit*)
        if [ -s "$FAKE_MERGED_FILE" ]; then printf '{"state":"MERGED","mergeCommit":{"oid":"%s"}}\n' "$(cat "$FAKE_MERGED_FILE")"
        else printf '{"state":"%s","mergeCommit":null}\n' "$FAKE_PR_STATE"; fi ;;
      *) exit 1 ;;
    esac ;;
  "pr checks") printf '%s\n' "$FAKE_CHECKS" ;;
  "pr merge")
    case "${FAKE_MERGE:-do}" in
      do) merge_for_real "$3"; exit $? ;;
      noisy) merge_for_real "$3" || exit 1; printf "failed to run git: fatal: 'main' is already used by worktree at '/x/.claude/worktrees/probe'\n" >&2; exit 1 ;;
      noop) exit 0 ;;
      bogus) printf '%s\n' 0000000000000000000000000000000000000001 > "$FAKE_MERGED_FILE"; exit 0 ;;
      *) exit 1 ;;
    esac ;;
  *) exit 1 ;;
esac
FAKE
  chmod +x "$1"
}

# fixture DIR -> a bare origin with main, a checkout cloned from it on branch feat/x carrying a
# copy of this file at tools/merge-pr.sh and a marker, pushed, and a linked worktree holding
# main. Sets FX_HEAD (feat/x's sha) and FX_BASE_SHA (main's). Asserts the constraint is present.
fixture() {
  local d=$1
  rm -rf "$d"; mkdir -p "$d/bin" || return 1
  git init -q -b main "$d/seed" && (cd "$d/seed" && echo base > README && git add README && git commit -q -m base) || return 1
  git clone -q --bare "$d/seed" "$d/origin.git" || return 1
  git clone -q "$d/origin.git" "$d/checkout" || return 1
  (cd "$d/checkout" && git checkout -q -b feat/x && mkdir -p tools && cp "$SELF" tools/merge-pr.sh && echo feature > FEATURE \
    && git add tools/merge-pr.sh FEATURE && git commit -q -m feature && git push -q -u origin feat/x) || return 1
  git -C "$d/checkout" worktree add -q "$d/wt-main" main || return 1
  FX_HEAD=$(git -C "$d/checkout" rev-parse HEAD)
  FX_BASE_SHA=$(git -C "$d/checkout" rev-parse origin/main)
  export FAKE_HEAD_SHA="$FX_HEAD"   # every fixture's commits carry their own timestamps, so its sha
  # the constraint this tool exists for: main cannot be checked out here
  if git -C "$d/checkout" checkout -q main 2>/dev/null; then v_fail "fixture: main could be checked out; the worktree constraint is absent"; return 1; fi
  write_fake_gh "$d/bin/gh"
  : > "$d/gh.log"; : > "$d/merged"
  return 0
}

# v_run DIR ARGS... -> runs $SELF (or V_TOOL when set) as a process inside DIR/checkout with the
# fake gh first on PATH; sets V_OUT and V_RC. FAKE_* come from the caller's environment.
v_run() {
  local d=$1; shift
  V_CASES=$((V_CASES + 1))
  V_OUT=$(cd "$d/checkout" && PATH="$d/bin:$PATH" GH=gh FAKEGH_LOG="$d/gh.log" FAKE_ORIGIN="$d/origin.git" FAKE_MERGED_FILE="$d/merged" \
    bash "${V_TOOL:-$SELF}" "$@" 2>&1); V_RC=$?
}

# v_state DIR -> "ref sha" for the checkout: the branch name or 'detached', then the short sha
v_state() { printf '%s %s' "$(git -C "$1/checkout" symbolic-ref -q --short HEAD 2>/dev/null || echo detached)" "$(git -C "$1/checkout" rev-parse --short HEAD)"; }
v_has_branch() { git -C "$1/checkout" show-ref --verify -q "refs/heads/$2"; }
v_remote_has() { [ -n "$(git -C "$1/checkout" ls-remote --heads origin "$2")" ]; }

verify() {
  command -v jq >/dev/null 2>&1 || { echo "verify: needs jq on PATH" >&2; return 2; }
  command -v git >/dev/null 2>&1 || { echo "verify: needs git on PATH" >&2; return 2; }
  V_ROOT=$(mktemp -d) || { echo "verify: mktemp failed" >&2; return 2; }
  local root=$V_ROOT
  trap 'rm -rf "$V_ROOT"' EXIT
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
  export GIT_AUTHOR_NAME=verify GIT_AUTHOR_EMAIL=verify@example GIT_COMMITTER_NAME=verify GIT_COMMITTER_EMAIL=verify@example
  export FAKE_PR_STATE=OPEN FAKE_HEAD_BRANCH=feat/x FAKE_BASE=main FAKE_CROSS=false FAKE_MERGE=do
  export FAKE_CHECKS='[{"name":"integrity","bucket":"pass"},{"name":"CodeQL","bucket":"skipping"}]'
  local d merged

  # 1. happy path from the head branch: merged, verdict from the API, detached on the merged
  #    main, seat and head branch gone locally, head branch gone on origin, the worktree untouched.
  d="$root/c1"; fixture "$d" || return 2
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'happy/from-head-branch' 0 "$V_RC"
  merged=$(cat "$d/merged")
  v_has 'happy verdict line' "$V_OUT" "^merge-pr: MERGED #42 as $merged; checkout detached on origin/main"
  v_has 'happy gh exit is information' "$V_OUT" '^merge-pr: gh pr merge exit 0 \(information, not the verdict\)'
  v_true 'happy HEAD detached at origin/main == merge commit' "[ \"\$(v_state '$d')\" = \"detached \$(git -C '$d/checkout' rev-parse --short origin/main)\" ] && [ \"\$(git -C '$d/checkout' rev-parse HEAD)\" = '$merged' ]"
  v_false 'happy seat gone' "v_has_branch '$d' merge-seat-42"
  v_false 'happy local head branch gone' "v_has_branch '$d' feat/x"
  v_false 'happy remote head branch gone' "v_remote_has '$d' feat/x"
  v_true 'happy worktree still holds main' "[ \"\$(git -C '$d/wt-main' symbolic-ref -q --short HEAD)\" = main ]"
  v_true 'happy --match-head-commit passed exactly once, with the head sha' "[ \"\$(grep -c '^pr merge 42 -R o/r --merge --match-head-commit $FX_HEAD\$' '$d/gh.log')\" = 1 ]"
  v_true 'happy the merged main carries the feature' "git -C '$d/checkout' cat-file -e origin/main:FEATURE"

  # 2. the same from a detached HEAD (the state this repository's main checkout usually sits in).
  d="$root/c2"; fixture "$d" || return 2
  git -C "$d/checkout" checkout -q --detach
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'happy/from-detached' 0 "$V_RC"
  v_has 'detached: seat line names the origin state' "$V_OUT" '^merge-pr: seat merge-seat-42 at [0-9a-f]+ \(origin/main\); was detached at '
  v_false 'detached: seat gone' "v_has_branch '$d' merge-seat-42"
  v_false 'detached: head branch gone' "v_has_branch '$d' feat/x"

  # 3. run as the COPY inside the checkout, so the seat checkout removes the running file (the
  #    own-PR case): the tail still runs and the verdict is printed.
  d="$root/c3"; fixture "$d" || return 2
  v_true 'own-pr: origin/main lacks the tool before the merge' "! git -C '$d/checkout' cat-file -e origin/main:tools/merge-pr.sh 2>/dev/null"
  V_TOOL="$d/checkout/tools/merge-pr.sh" v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'own-pr/run-from-the-checkout' 0 "$V_RC"
  v_has 'own-pr: tail ran' "$V_OUT" '^merge-pr: MERGED #42 as [0-9a-f]{40}; checkout detached'
  v_true 'own-pr: the file is back after the detach' "[ -f '$d/checkout/tools/merge-pr.sh' ]"

  # 4. gh exits 1 with the #788 message AFTER merging: the API says MERGED, so exit 0.
  d="$root/c4"; fixture "$d" || return 2
  FAKE_MERGE=noisy v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'gh-exit-1-but-merged' 0 "$V_RC"
  v_has 'noisy: gh exit reported with its first line' "$V_OUT" "^merge-pr: gh pr merge exit 1 \(information, not the verdict\): failed to run git: fatal: 'main' is already used by worktree"
  v_has 'noisy: verdict MERGED' "$V_OUT" '^merge-pr: verdict from the API: MERGED [0-9a-f]{40}$'
  v_false 'noisy: remote branch gone' "v_remote_has '$d' feat/x"

  # 5. gh exits 0 having merged nothing: verdict OPEN, exit 1, checkout restored to feat/x,
  #    seat deleted, nothing deleted on origin.
  d="$root/c5"; fixture "$d" || return 2
  FAKE_MERGE=noop v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'gh-exit-0-but-open' 1 "$V_RC"
  v_has 'open: verdict' "$V_OUT" '^merge-pr: verdict from the API: OPEN -$'
  v_has 'open: not merged line' "$V_OUT" '^merge-pr: NOT MERGED #42$'
  v_has 'open: restored' "$V_OUT" '^merge-pr: checkout restored to feat/x; merge-seat-42 deleted$'
  v_true 'open: back on feat/x at its sha' "[ \"\$(v_state '$d')\" = \"feat/x \$(git -C '$d/checkout' rev-parse --short '$FX_HEAD')\" ]"
  v_false 'open: seat gone' "v_has_branch '$d' merge-seat-42"
  v_true 'open: remote branch untouched' "v_remote_has '$d' feat/x"
  v_true 'open: origin/main untouched' "[ \"\$(git -C '$d/checkout' rev-parse origin/main)\" = '$FX_BASE_SHA' ]"

  # 5b. the same from a detached HEAD restores the detached sha.
  d="$root/c5b"; fixture "$d" || return 2
  git -C "$d/checkout" checkout -q --detach
  FAKE_MERGE=noop v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'gh-exit-0-but-open/detached' 1 "$V_RC"
  v_true 'open/detached: back at the sha' "[ \"\$(v_state '$d')\" = \"detached \$(git -C '$d/checkout' rev-parse --short '$FX_HEAD')\" ]"

  # 6. refusals before anything is touched: head mismatch, a red check, a pending check, zero
  #    checks, a PR that is not OPEN. No `pr merge` in the log, no seat, HEAD where it was.
  d="$root/c6"; fixture "$d" || return 2
  local before; before=$(v_state "$d")
  v_run "$d" 42 --head "$FX_BASE_SHA"
  v_rc 'refuse/head-mismatch' 1 "$V_RC"
  v_has 'head-mismatch message' "$V_OUT" "^merge-pr: REFUSED: PR 42 head is $FX_HEAD, not the reviewed $FX_BASE_SHA$"
  FAKE_CHECKS='[{"name":"integrity","bucket":"pass"},{"name":"skills","bucket":"fail"}]' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/red-check' 1 "$V_RC"
  v_has 'red-check names the context' "$V_OUT" '^merge-pr:   skills: fail$'
  v_has 'red-check refusal' "$V_OUT" '^merge-pr: REFUSED: 1 context\(s\) not pass or skipping on PR 42'
  FAKE_CHECKS='[{"name":"integrity","bucket":"pending"}]' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/pending-check' 1 "$V_RC"
  v_has 'pending refusal points at watch-checks' "$V_OUT" 'run tools/watch-checks.sh 42'
  FAKE_CHECKS='[]' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/zero-checks' 1 "$V_RC"
  v_has 'zero-checks refusal' "$V_OUT" '^merge-pr: REFUSED: no check context reported on PR 42'
  FAKE_CHECKS='' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/empty-checks-body' 1 "$V_RC"
  v_has 'empty body is zero contexts' "$V_OUT" '^merge-pr: checks on [0-9a-f]+: 0 context\(s\)'
  FAKE_PR_STATE=MERGED v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/already-merged' 1 "$V_RC"
  v_has 'already-merged message' "$V_OUT" '^merge-pr: REFUSED: PR 42 is MERGED, not OPEN'
  v_false 'refusals: no merge attempted' "grep -q '^pr merge' '$d/gh.log'"
  v_false 'refusals: no seat' "v_has_branch '$d' merge-seat-42"
  v_true 'refusals: HEAD where it was' "[ \"\$(v_state '$d')\" = '$before' ]"
  v_true 'refusals: origin/main untouched' "[ \"\$(git -C '$d/checkout' rev-parse origin/main)\" = '$FX_BASE_SHA' ]"

  # 7. unparsable answers and an unreadable PR are exit 2, before anything is touched.
  FAKE_CHECKS='<html>503</html>' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'unparsable-checks' 2 "$V_RC"
  FAKE_PR_STATE='' FAKE_HEAD_SHA='' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'empty-pr-fields' 2 "$V_RC"
  v_true 'exit-2 cases: HEAD where it was' "[ \"\$(v_state '$d')\" = '$before' ]"

  # 8. a fork PR: merged, but the head branch is left alone locally and on origin.
  d="$root/c8"; fixture "$d" || return 2
  FAKE_CROSS=true v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'fork' 0 "$V_RC"
  v_has 'fork: reason printed' "$V_OUT" '^merge-pr: head branch feat/x belongs to a fork: left alone locally and remotely$'
  v_true 'fork: local branch kept' "v_has_branch '$d' feat/x"
  v_true 'fork: remote branch kept' "v_remote_has '$d' feat/x"
  v_false 'fork: seat gone' "v_has_branch '$d' merge-seat-42"
  v_has 'fork: still detached on the merged main' "$V_OUT" '^merge-pr: MERGED #42 as [0-9a-f]{40}; checkout detached on origin/main'

  # 9. --keep-remote keeps the remote branch and deletes the local one; --seat names the seat.
  d="$root/c9"; fixture "$d" || return 2
  v_run "$d" 42 --head "$FX_HEAD" --interval 0 --keep-remote --seat landing
  v_rc 'keep-remote' 0 "$V_RC"
  v_has 'keep-remote line' "$V_OUT" '^merge-pr: remote branch feat/x kept \(--keep-remote\)$'
  v_true 'keep-remote: remote kept' "v_remote_has '$d' feat/x"
  v_false 'keep-remote: local gone' "v_has_branch '$d' feat/x"
  v_has 'seat named' "$V_OUT" '^merge-pr: seat landing at '
  v_false 'named seat gone' "v_has_branch '$d' landing"

  # 10. the seat name is taken: exit 2 before the merge.
  d="$root/c10"; fixture "$d" || return 2
  git -C "$d/checkout" branch -q merge-seat-42 origin/main
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'seat-exists' 2 "$V_RC"
  v_has 'seat-exists message' "$V_OUT" '^merge-pr: a branch named merge-seat-42 already exists'
  v_false 'seat-exists: no merge' "grep -q '^pr merge' '$d/gh.log'"
  v_true 'seat-exists: still on feat/x' "[ \"\$(v_state '$d')\" = \"feat/x \$(git -C '$d/checkout' rev-parse --short '$FX_HEAD')\" ]"

  # 11. MERGED per the API but origin/main never receives that commit: exit 3, nothing deleted.
  d="$root/c11"; fixture "$d" || return 2
  FAKE_MERGE=bogus v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'merged-but-oid-missing' 3 "$V_RC"
  v_has 'oid-missing: says so' "$V_OUT" 'does not contain the merge commit 0000000000000000000000000000000000000001 after 5 fetch\(es\)'
  v_has 'oid-missing: verdict names the merge' "$V_OUT" '^merge-pr: MERGED #42 as 0000000000000000000000000000000000000001, cleanup incomplete$'
  v_true 'oid-missing: local head branch kept' "v_has_branch '$d' feat/x"
  v_true 'oid-missing: remote head branch kept' "v_remote_has '$d' feat/x"
  v_true 'oid-missing: left on the seat' "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = merge-seat-42 ]"

  # 12. --dry-run: the reads happen, nothing is created or merged, exit 0.
  d="$root/c12"; fixture "$d" || return 2
  v_run "$d" 42 --head "$FX_HEAD" --dry-run
  v_rc 'dry-run' 0 "$V_RC"
  v_has 'dry-run plan' "$V_OUT" '^merge-pr: dry run: would cut merge-seat-42 from origin/main, merge #42 with --match-head-commit [0-9a-f]{9}, detach on origin/main, delete merge-seat-42, feat/x locally and on origin$'
  v_false 'dry-run: no merge' "grep -q '^pr merge' '$d/gh.log'"
  v_false 'dry-run: no seat' "v_has_branch '$d' merge-seat-42"
  v_true 'dry-run: reads happened' "grep -q '^pr checks 42 ' '$d/gh.log'"

  # 13. argument refusals and a run outside a git checkout: exit 2, and nothing is read.
  d="$root/c13"; fixture "$d" || return 2
  v_run "$d";                               v_rc 'args/no pr' 2 "$V_RC"
  v_run "$d" 42;                            v_rc 'args/no --head' 2 "$V_RC"
  v_run "$d" 42 --head abc1234;             v_rc 'args/--head not 40 hex' 2 "$V_RC"
  v_run "$d" 42 --head;                     v_rc 'args/missing value' 2 "$V_RC"
  v_run "$d" 42 --head "$FX_HEAD" --bogus;  v_rc 'args/unknown option' 2 "$V_RC"
  v_run "$d" 42 43 --head "$FX_HEAD";       v_rc 'args/two prs' 2 "$V_RC"
  v_run "$d" x1 --head "$FX_HEAD";          v_rc 'args/pr not a number' 2 "$V_RC"
  v_run "$d" 42 --head "$FX_HEAD" --interval x; v_rc 'args/interval not a number' 2 "$V_RC"
  v_false 'args: nothing read from gh' "[ -s '$d/gh.log' ]"
  V_CASES=$((V_CASES + 1))
  V_OUT=$(cd "$root" && PATH="$d/bin:$PATH" GH=gh bash "$SELF" 42 --head "$FX_HEAD" 2>&1); V_RC=$?
  v_rc 'not-a-checkout' 2 "$V_RC"
  v_has 'not-a-checkout message' "$V_OUT" '^merge-pr: not inside a git checkout$'

  if [ "$V_FAILS" -eq 0 ]; then
    echo "verify: $V_CASES run(s), 0 failure(s) -- the seat-branch merge against a real bare origin under the worktree constraint: verdict from the API over gh's exit (1 after a merge, 0 without one), restore on no merge, the refusals before anything is touched, fork and --keep-remote, exit 3 when the merge never reaches origin, the own-PR run from a file the seat checkout removes, the argument refusals"
    return 0
  fi
  echo "verify: $V_CASES run(s), $V_FAILS failure(s)" >&2
  return 1
}

main() {
  SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
  while [ $# -gt 0 ]; do
    case "$1" in
      --verify) verify; exit $? ;;
      -h|--help) usage; exit 0 ;;
      --head|--repo|--seat|--interval)
        [ $# -ge 2 ] || { echo "merge-pr: $1 needs a value" >&2; usage >&2; exit 2; }
        case "$1" in
          --head) HEAD_WANT=$2 ;;
          --repo) REPO=$2 ;;
          --seat) SEAT=$2 ;;
          --interval) INTERVAL=$2 ;;
        esac
        shift 2 ;;
      --keep-remote) KEEP_REMOTE=1; shift ;;
      --dry-run) DRY_RUN=1; shift ;;
      -*) echo "merge-pr: unknown option $1" >&2; usage >&2; exit 2 ;;
      *)
        [ -z "$PR" ] || { echo "merge-pr: one PR only (got '$PR' and '$1')" >&2; exit 2; }
        PR=$1; shift ;;
    esac
  done
  [ -n "$PR" ] || { usage >&2; exit 2; }
  is_uint "$PR" || { echo "merge-pr: '$PR' is not a PR number" >&2; exit 2; }
  [ -n "$HEAD_WANT" ] || { echo "merge-pr: --head <sha> is required: the reviewed head, refused unless it is the PR's" >&2; usage >&2; exit 2; }
  is_full_sha "$HEAD_WANT" || { echo "merge-pr: --head needs the full 40-hex sha (what gh pr view --json headRefOid prints), got '$HEAD_WANT'" >&2; exit 2; }
  is_uint "$INTERVAL" || { echo "merge-pr: --interval takes a non-negative integer" >&2; exit 2; }
  run_merge
}

main "$@"
