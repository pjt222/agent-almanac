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
#   - a REQUIRED context of the base branch that is missing or not pass. The set is read from
#     `gh api repos/O/N/rules/branches/<base>`, never listed here. Every context green is not
#     every required one green -- a required workflow that never started leaves nothing red --
#     and the maintainer merges as a ruleset bypass actor, so GitHub does not refuse it (#896)
#   - a mergeStateStatus other than CLEAN or HAS_HOOKS (DIRTY, BLOCKED, BEHIND, DRAFT,
#     UNSTABLE, ...), named; UNKNOWN is polled first, with a bound, because GitHub computes it
#     lazily (UNKNOWN on a first read, CLEAN about 10 s later, measured on #889-#891)
# The check read is instantaneous -- wait with tools/watch-checks.sh first -- and the merge
# passes `--match-head-commit`, which GitHub honours. Measured 2026-09-08 on #810 (the fact
# sheet posted there, F15): `gh pr merge <n> --merge --match-head-commit <a sha that is not
# the head>` printed `GraphQL: Head branch was modified. Review and try the merge again.`, exit
# 1, and the PR stayed OPEN with origin/main unchanged -- that text is the guard's own message,
# which is what makes a refusal evidence of the flag rather than of some other block. Re-derive
# it on a throwaway PR whose base is not main. The positive arm -- the true head merges under
# the flag -- is #807 and #809, both merged by scripts that passed it. A head pushed between
# the read and the merge is therefore refused by GitHub, not by this tool, and the refusal
# lands in the NOT MERGED path below with the checkout restored.
#
# What this tool cannot see is whether the PR was REVIEWED: adversarial reports here are PR
# comments, not GitHub reviews. `--head` is the caller's assertion that the named sha is the
# reviewed one; exit 0 means "merged at the sha you named", and the standing allowance's
# reviewed clause (CLAUDE.md § Merging With a Red Check) stays the caller's to honour.
#
# ORDER OF OPERATIONS
# -------------------
#   1  read the PR: state, head sha, head branch, base branch, cross-repository or not
#   2  read every check context; count pass / skipping / other; then the base branch's required
#      contexts, each present and pass; then mergeStateStatus, polled past UNKNOWN
#   3  record where this checkout is (branch name, or the detached sha), for the restore path
#   4  fetch origin/<base>; create the seat branch from it (refused if the name already exists)
#   5  gh pr merge --merge --match-head-commit <head>
#   6  verdict: gh pr view --json state,mergeCommit; not MERGED -> restore step 3, drop the seat, exit 1
#   7  fetch origin/<base> until it CONTAINS the merge commit (the README healer may already
#      have pushed on top of it, so equality is the wrong test); five tries
#   8  detach onto origin/<base>; git branch -d the seat; delete the local head branch only when
#      its tip is an ancestor of the merge commit, then with -D -- never on -d's own say, which
#      trusts the branch's upstream and a stale one deletes an unmerged tip (#896, #865)
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
# of this file from inside its throwaway checkout, which pins that the run completes and that
# the file is back after the detach -- not the descriptor claim: everything here is parsed
# before main runs, so that case would pass even if bash re-read the file. The descriptor
# claim rests on the probe above alone, which is why the probe has 30,000 lines after its sleep.
#
# THE REPO GUARD IS NOT THIS TOOL'S JOB
# -------------------------------------
# A merge moves HEAD, so an armed `npm run guard:verify` goes red afterwards by design. Run
# guard:verify before this tool and `guard:rebaseline -- --accept=<sha>` after it; this tool
# prints no paste-ready override, for the reason CLAUDE.md § Guarding a Multi-Agent Run gives.
#
# USAGE
# -----
#     bash tools/merge-pr.sh <pr-number> --head <40-hex sha> [options]
#     bash tools/merge-pr.sh --verify
#
#     --head SHA       the reviewed head; refused unless it is the PR's head (required)
#     --repo O/N       repository for the gh calls (default: the checkout's, via gh repo view).
#                      The git steps act on THIS checkout's origin, so a --repo that is not
#                      origin's ends at step 7 with exit 3 and nothing deleted
#     --seat NAME      the throwaway branch (default merge-seat-<pr>)
#     --keep-remote    do not delete the remote head branch
#     --interval S     seconds between the mergeStateStatus reads of step 2 and the fetches of
#                      step 7 (default 2)
#     --dry-run        the reads and the refusals (steps 1-3), then the plan; create nothing,
#                      merge nothing; exit 0 when it would proceed, 1 or 2 when it would not
#     GH=<cmd>         the gh executable (default gh); --verify puts a fake gh on PATH instead
#
# EXIT CODES
# ----------
#     0    MERGED at --head; this checkout detached on the merged origin/<base>; branches deleted
#     1    refused before merging (nothing changed), or gh merged nothing (checkout restored)
#     2    could not run: arguments, not a git checkout, gh missing or unauthenticated, repo or
#          PR unreadable, the base branch's rules or the mergeStateStatus unreadable, an
#          unparsable answer, the seat branch name already taken, an
#          operation in progress (a merge, rebase, am, cherry-pick, revert or bisect), HEAD
#          unreadable, origin/<base> unfetchable, or the seat checkout refused by git (a
#          modification it would overwrite) -- and one case after the merge attempt: the
#          verdict could not be read, or carried no state the API can mean, twice, so whether
#          the PR merged is unknown; the checkout is left on the seat and nothing is deleted
#     3    MERGED on GitHub, but the cleanup did not complete -- read the lines above the verdict
#
# 3 is a separate code because a caller who reads "not 0" as "not merged" would retry the merge,
# skip guard:rebaseline and then trust a red guard:verify; the PR IS merged when 3 is returned.
# The last line is always the verdict: MERGED #N as <sha>, MERGED #N ... cleanup incomplete,
# NOT MERGED #N, REFUSED: ..., or NO VERDICT #N. `--verify` exits by its own result (0 clean,
# 1 a case failed, 2 it could not run).
#
# No merge queue is assumed. On a repository with one, `gh pr merge` enqueues the PR and its
# state stays OPEN until the queue merges it, which this tool reports as NOT MERGED (exit 1):
# nothing is deleted, the checkout is restored, and a later run refuses at step 1 once the
# queue has merged. A tracked modification is neither checked for nor lost: one git can carry
# rides along to the seat and then to the detached merged base, one it cannot carry makes the
# seat checkout refuse (exit 2, nothing merged); an in-progress operation is refused before the
# seat is cut, because a checkout would walk away from it.
#
# `--verify` builds a throwaway origin (bare), a clone as the checkout with a feature branch,
# and a linked worktree holding main -- the constraint above, asserted present -- then runs this
# file as a fresh process against a fake gh on PATH that answers from the fixture, logs every
# call, and performs the merge for real into the bare origin (clone, --no-ff merge, push), so the
# fetch, the ancestor test, `branch -d` and `push --delete` run against real refs. The fake
# honours `--match-head-commit` the way GitHub was measured to (F15) and refuses a merge
# without it, which is stricter than gh and pins that the tool always passes it. What it
# cannot reach: the lines that invoke the real gh, which the fake stands in for -- measured on
# the dogfood merge of this tool's own PR -- and the operator's git configuration, which the
# fixture neutralises (GIT_CONFIG_GLOBAL and GIT_CONFIG_SYSTEM point at /dev/null); a pre-push
# hook or core.hooksPath that rejects the delete lands in the ls-remote confirmation as exit 3.
# And the self-test now ENCODES the property F15 measured: were GitHub to stop honouring the
# flag, --verify would stay green; only a live probe can see that, which is why the command
# above is stated so it can be re-run.

set -u

GH="${GH:-gh}"

PR=""
HEAD_WANT=""
REPO=""
SEAT=""
KEEP_REMOTE=0
INTERVAL=2
DRY_RUN=0
MSS_READS=10   # mergeStateStatus reads before an UNKNOWN is refused; at --interval 2, about 20 s

usage() {
  cat <<'EOF'
usage: bash tools/merge-pr.sh <pr-number> --head <40-hex sha> [--repo OWNER/NAME] [--seat NAME] [--keep-remote] [--interval S] [--dry-run]
       bash tools/merge-pr.sh --verify
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

# read_verdict -> "STATE OID" ("-" for no merge commit); one retry on a failed command; returns
# 1 when both fail OR when the body carries no state the API can mean (empty, `null`, a bare
# object: jq prints nothing on an empty body and exits 0, so without this guard the caller
# would read "" as "not MERGED" and announce NOT MERGED from an answer it never had -- round-1
# B2). The caller turns 1 into NO VERDICT, exit 2, because the merge may have happened.
read_verdict() {
  local json state
  json=$("$GH" pr view "$PR" -R "$REPO" --json state,mergeCommit 2>/dev/null) \
    || json=$("$GH" pr view "$PR" -R "$REPO" --json state,mergeCommit 2>/dev/null) \
    || return 1
  state=$(printf '%s\n' "$json" | jq -r '.state // empty' 2>/dev/null) || return 1
  case "$state" in OPEN|CLOSED|MERGED) ;; *) return 1 ;; esac
  printf '%s\n' "$json" | jq -r '"\(.state) \(.mergeCommit.oid // "-")"' 2>/dev/null || return 1
}

# current_ref -> the branch name (exit 0), or nothing with a non-zero exit when detached, so a
# caller's `|| echo detached` is live (round-1 S1: an `|| true` here made it dead code)
current_ref() { git symbolic-ref -q --short HEAD 2>/dev/null; }

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

  # 2b. the REQUIRED contexts, from the rules in effect on the base branch (#896). "Every context
  #     green" is not "every required context green": a required workflow that never started (a
  #     path filter, a workflow that fails to load, an Actions outage while server-side CodeQL
  #     still runs) leaves nothing red to see. GitHub would refuse that merge for anyone else, but
  #     in this repository the maintainer is a ruleset bypass actor, so for the usual caller this
  #     is the only check. Read from the API rather than listed here, so the set cannot drift from
  #     the ruleset; an unreadable answer refuses to run rather than proceeding without it.
  local rules_json required req bucket req_total=0 req_bad=0
  # --paginate: the endpoint pages at 30 rules; the pages print back to back, so jq -s reads them
  # as one list of arrays rather than counting a context once per page.
  rules_json=$("$GH" api "repos/$REPO/rules/branches/$PR_BASE" --paginate 2>/dev/null) || rules_json=""
  [ -n "$rules_json" ] || die "cannot read the rules in effect on $PR_BASE (gh api repos/$REPO/rules/branches/$PR_BASE); not merging without the required contexts"
  required=$(printf '%s\n' "$rules_json" | jq -rs 'if any(.[]; type != "array") then error("not a rules array") else [.[][] | select(.type == "required_status_checks") | .parameters.required_status_checks[]?.context] | unique | .[] end' 2>/dev/null) \
    || die "cannot read the rules in effect on $PR_BASE: unparsable answer $(printf '%s' "$rules_json" | head -c 200)"
  if [ -z "$required" ]; then
    say "required contexts on $PR_BASE: none (no required_status_checks rule; classic branch protection is not read)"
  else
    say "required contexts on $PR_BASE: $(printf '%s\n' "$required" | paste -sd, - | sed 's/,/, /g')"
    while IFS= read -r req; do
      req_total=$((req_total + 1))
      bucket=$(printf '%s\n' "$checks" | awk -F'\t' -v n="$req" '$1 == n { print $2; exit }')
      if [ -z "$bucket" ]; then say "  required context missing: $req"; req_bad=$((req_bad + 1))
      elif [ "$bucket" != pass ]; then say "  required context not pass: $req ($bucket)"; req_bad=$((req_bad + 1)); fi
    done <<< "$required"
    [ "$req_bad" -eq 0 ] || refuse "$req_bad of $req_total required context(s) on $PR_BASE not pass on PR $PR -- a bypass merge would not be stopped by GitHub; wait with tools/watch-checks.sh $PR, or find out why the required workflow did not run"
  fi

  # 2c. mergeStateStatus, the state GitHub computes for the merge itself. It reads UNKNOWN until
  #     GitHub has computed it -- measured on #889-#891: UNKNOWN on a first read, CLEAN about 10 s
  #     later -- so UNKNOWN is polled, with a bound. CLEAN and HAS_HOOKS merge; every other state
  #     is named and refused. The ruleset here is non-strict and has no review rule (read on
  #     2026-09-23), so BEHIND and a review BLOCKED are not expected -- refused if they appear,
  #     because either would mean the rules changed under this tool.
  local mss="" mss_reads=0
  while [ "$mss_reads" -lt "$MSS_READS" ]; do
    mss_reads=$((mss_reads + 1))
    mss=$("$GH" pr view "$PR" -R "$REPO" --json mergeStateStatus 2>/dev/null | jq -r '.mergeStateStatus // empty' 2>/dev/null)
    [ -n "$mss" ] || die "cannot read mergeStateStatus for PR $PR"
    [ "$mss" = UNKNOWN ] || break
    [ "$mss_reads" -lt "$MSS_READS" ] && sleep "$INTERVAL"
  done
  case "$mss" in
    CLEAN|HAS_HOOKS) say "mergeStateStatus $mss after $mss_reads read(s)" ;;
    UNKNOWN) refuse "mergeStateStatus is still UNKNOWN after $mss_reads read(s) on PR $PR -- GitHub has not computed mergeability yet; run again shortly" ;;
    DIRTY)    refuse "mergeStateStatus is DIRTY on PR $PR -- it conflicts with $PR_BASE, and no pull_request workflow runs until it does not" ;;
    BLOCKED)  refuse "mergeStateStatus is BLOCKED on PR $PR -- a rule on $PR_BASE is not satisfied; a bypass merge would override it" ;;
    BEHIND)   refuse "mergeStateStatus is BEHIND on PR $PR -- the head is behind $PR_BASE under a strict rule" ;;
    DRAFT)    refuse "mergeStateStatus is DRAFT on PR $PR -- mark it ready first" ;;
    UNSTABLE) refuse "mergeStateStatus is UNSTABLE on PR $PR -- a status the checks list did not show is not passing" ;;
    *)        refuse "mergeStateStatus is $mss on PR $PR -- not a state this tool knows to be mergeable" ;;
  esac

  # 3. where this checkout is, and that nothing is in progress (a checkout would walk away
  #    from a paused merge, rebase, am, cherry-pick, revert, bisect or sequencer run, and the
  #    carry-along is not benign)
  local orig_branch orig_sha op
  orig_branch=$(current_ref) || orig_branch=""
  orig_sha=$(git rev-parse HEAD 2>/dev/null) || die "cannot read HEAD"
  for op in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply BISECT_START sequencer; do
    [ -e "$(git rev-parse --git-path "$op")" ] && die "an operation is in progress ($op); finish or abort it first"
  done
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
  if [ "$state" = UNREADABLE ]; then
    # the merge may or may not have happened: touch nothing, say so, and hand the question back
    say "the verdict could not be read twice after the merge attempt; checkout left on $SEAT, nothing deleted -- ask gh pr view $PR --json state,mergeCommit before doing anything else"
    say "NO VERDICT #$PR"
    exit 2
  fi
  if [ "$state" != MERGED ]; then
    if restore "$orig_branch" "$orig_sha"; then
      say "checkout restored to $([ -n "$orig_branch" ] && echo "$orig_branch" || echo "detached ${orig_sha:0:9}"); $SEAT deleted"
    else
      say "could not restore the checkout; it is on $(current_ref || echo detached) at $(git rev-parse --short HEAD)"
    fi
    say "NOT MERGED #$PR"
    exit 1
  fi
  if [ "$oid" = - ]; then
    # MERGED without a merge commit: the PR is merged, but step 7 has nothing to look for
    say "MERGED, but the API reports no merge commit; checkout left on $SEAT, branches kept -- ask gh pr view $PR --json state,mergeCommit again and finish by hand"
    say "MERGED #$PR, merge commit unknown, cleanup incomplete"
    exit 3
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
    # The local head branch is deleted only when its tip is IN the merge commit. `git branch -d`
    # is not that check: it compares against the branch's upstream when one resolves (git 2.43
    # `git help branch`), and this tool fetches only the base, so a stale origin/<head> -- a
    # local branch someone force-pushed over -- made -d delete an unmerged tip at exit 0, its
    # warning discarded with stderr (#896, measured by the #865 challenge). Ancestry against the
    # merge is the accept-rule itself; once it holds, -D is REQUIRED, not a shortcut (#865): when
    # origin/<head> resolves but lags BEHIND a tip the merge contains (pushed from another
    # clone), -d refuses -- "not yet merged to origin/<head>, even though it is merged to HEAD",
    # exit 1, measured on git 2.43.0 (#898 round 1). Case 11g pins that -D is what deletes it.
    if git show-ref --verify -q "refs/heads/$PR_HEAD_BRANCH"; then
      local tip; tip=$(git rev-parse "refs/heads/$PR_HEAD_BRANCH")
      if ! git merge-base --is-ancestor "$tip" "$oid" 2>/dev/null; then
        say "kept local branch $PR_HEAD_BRANCH: its tip ${tip:0:9} is not in the merge ${oid:0:9} (a commit never pushed, or a branch force-pushed over); inspect it, then git branch -D $PR_HEAD_BRANCH"; incomplete=1
      elif git branch -D "$PR_HEAD_BRANCH" >/dev/null 2>&1; then say "deleted local branch $PR_HEAD_BRANCH"
      else say "could not delete local branch $PR_HEAD_BRANCH (git branch -D failed; checked out in another worktree?)"; incomplete=1; fi
    else
      say "no local branch $PR_HEAD_BRANCH to delete"
    fi
    # 9. the remote branch
    if [ "$KEEP_REMOTE" -eq 1 ]; then
      say "remote branch $PR_HEAD_BRANCH kept (--keep-remote)"
    else
      git push -q origin --delete "$PR_HEAD_BRANCH" >/dev/null 2>&1 || true
      # confirmed by a successful ls-remote that lists nothing; a FAILED ls-remote also prints
      # nothing, and reading that as "absent" would report a deletion nobody confirmed
      local remote_heads
      if remote_heads=$(git ls-remote --heads origin "$PR_HEAD_BRANCH" 2>/dev/null); then
        if [ -z "$remote_heads" ]; then say "deleted remote branch $PR_HEAD_BRANCH (ls-remote: absent)"
        else say "remote branch $PR_HEAD_BRANCH still present after push --delete"; incomplete=1; fi
      else
        say "could not confirm whether remote branch $PR_HEAD_BRANCH is gone (ls-remote failed); check it by hand"; incomplete=1
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
  # The rules in effect on the base branch, in the shape `gh api repos/O/N/rules/branches/B`
  # returned for this repository on 2026-09-23: an array of rules, the required contexts under
  # required_status_checks[].parameters.required_status_checks[].context. A branch with no rules
  # answers [].
  "api repos/o/r/rules/branches/main")
    case "${FAKE_RULES:-default}" in
      unreadable) exit 1 ;;
      emptybody) exit 0 ;;
      default) printf '%s\n' '[{"type":"deletion","parameters":null},{"type":"non_fast_forward","parameters":null},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":false,"required_status_checks":[{"context":"line-endings"},{"context":"integrity"},{"context":"skills"},{"context":"scripts-test"},{"context":"cli-test"}]}}]' ;;
      # A multi-page answer ("][" between pages) is printed whole only under --paginate; without
      # it gh returns the first page, which is what an unpaginated call would read.
      *) if [[ "$*" == *--paginate* || "$FAKE_RULES" != *']['* ]]; then printf '%s\n' "$FAKE_RULES"
         else printf '%s]\n' "${FAKE_RULES%%\]\[*}"; fi ;;
    esac ;;
  "pr view")
    case "$*" in
      *headRefOid*) printf '{"state":"%s","headRefOid":"%s","headRefName":"%s","baseRefName":"%s","isCrossRepository":%s}\n' "$FAKE_PR_STATE" "$FAKE_HEAD_SHA" "$FAKE_HEAD_BRANCH" "$FAKE_BASE" "$FAKE_CROSS" ;;
      # FAKE_MSS is a comma list answered one element per read, the last repeating, so a case
      # can script UNKNOWN before the state settles. The read count comes from the call log,
      # which already holds this call.
      *mergeStateStatus*)
        [ "${FAKE_MSS:-CLEAN}" = unreadable ] && exit 1
        n=$(grep -c 'mergeStateStatus' "$FAKEGH_LOG")
        IFS=, read -r -a mss <<< "${FAKE_MSS:-CLEAN}"
        [ "$n" -gt "${#mss[@]}" ] && n=${#mss[@]}
        printf '{"mergeStateStatus":"%s"}\n' "${mss[$((n - 1))]}" ;;
      *mergeCommit*)
        case "${FAKE_VERDICT:-}" in
          unreadable) exit 1 ;;
          empty) exit 0 ;;
          null) printf 'null\n'; exit 0 ;;
          nooid) printf '{"state":"MERGED","mergeCommit":null}\n'; exit 0 ;;
        esac
        if [ -s "$FAKE_MERGED_FILE" ]; then printf '{"state":"MERGED","mergeCommit":{"oid":"%s"}}\n' "$(cat "$FAKE_MERGED_FILE")"
        else printf '{"state":"%s","mergeCommit":null}\n' "$FAKE_PR_STATE"; fi ;;
      *) exit 1 ;;
    esac ;;
  "pr checks") printf '%s\n' "$FAKE_CHECKS" ;;
  "pr merge")
    # GitHub's guard, as measured on #810 (F15): a --match-head-commit that is not the head is
    # refused with this text and nothing merges. The fixture's truth is FAKE_TRUE_HEAD (default
    # FAKE_HEAD_SHA), so a case can move the head between the tool's read and its merge. A
    # missing flag is refused too -- stricter than gh, which merges without it -- to pin that
    # the tool always passes it.
    want=""; prev=""
    for a in "$@"; do [ "$prev" = --match-head-commit ] && want=$a; prev=$a; done
    [ -n "$want" ] || { printf 'fake gh: pr merge without --match-head-commit\n' >&2; exit 1; }
    [ "$want" = "${FAKE_TRUE_HEAD:-$FAKE_HEAD_SHA}" ] || { printf 'GraphQL: Head branch was modified. Review and try the merge again. (mergePullRequest)\n' >&2; exit 1; }
    case "${FAKE_MERGE:-do}" in
      do) merge_for_real "$3"; exit $? ;;
      noisy) merge_for_real "$3" || exit 1; printf "failed to run git: fatal: 'main' is already used by worktree at '/x/.claude/worktrees/probe'\n" >&2; exit 1 ;;
      noop) exit 0 ;;
      refuse) printf 'GraphQL: Pull request #%s is not mergeable (mergePullRequest)\n' "$3" >&2; exit 1 ;;   # text illustrative; the tool reads none of it
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
  # The five contexts the default FAKE_RULES requires, all pass, plus a non-required skip.
  local all_required='{"name":"line-endings","bucket":"pass"},{"name":"integrity","bucket":"pass"},{"name":"skills","bucket":"pass"},{"name":"scripts-test","bucket":"pass"},{"name":"cli-test","bucket":"pass"}'
  export FAKE_CHECKS="[$all_required,{\"name\":\"CodeQL\",\"bucket\":\"skipping\"}]"
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
  #    own-PR case): the run completes, the verdict is printed and the file is back after the
  #    detach. This pins completion, not why: every line is parsed before main runs, so the case
  #    would pass even if bash re-read the file (the header's probe is the descriptor evidence).
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

  # 5a. gh refuses and merges nothing (a branch policy, a conflict): the quadrant "gh exit
  #     non-zero, nothing merged" -- exit 1, restored, origin untouched (round-1 S2).
  d="$root/c5a"; fixture "$d" || return 2
  FAKE_MERGE=refuse v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'gh-refuses' 1 "$V_RC"
  v_has 'refused: gh exit shown with its line' "$V_OUT" '^merge-pr: gh pr merge exit 1 \(information, not the verdict\): GraphQL: Pull request #42 is not mergeable'
  v_has 'refused: not merged' "$V_OUT" '^merge-pr: NOT MERGED #42$'
  v_true 'refused: back on feat/x' "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = feat/x ]"
  v_true 'refused: remote branch untouched' "v_remote_has '$d' feat/x"
  v_true 'refused: origin/main untouched' "[ \"\$(git -C '$d/checkout' rev-parse origin/main)\" = '$FX_BASE_SHA' ]"

  # 5b. the same from a detached HEAD restores the detached sha.
  d="$root/c5b"; fixture "$d" || return 2
  git -C "$d/checkout" checkout -q --detach
  FAKE_MERGE=noop v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'gh-exit-0-but-open/detached' 1 "$V_RC"
  v_true 'open/detached: back at the sha' "[ \"\$(v_state '$d')\" = \"detached \$(git -C '$d/checkout' rev-parse --short '$FX_HEAD')\" ]"

  # 5c. the head moves between the tool's read and its merge: the fake's truth differs from the
  #     sha the tool read, so --match-head-commit is refused the way GitHub refused it on #810
  #     (F15) -- exit 1, restored, nothing deleted, the merge attempted exactly once.
  d="$root/c5c"; fixture "$d" || return 2
  FAKE_TRUE_HEAD="$FX_BASE_SHA" v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'head-moved-between-read-and-merge' 1 "$V_RC"
  v_has 'head-moved: the refusal text' "$V_OUT" 'GraphQL: Head branch was modified\. Review and try the merge again\.'
  v_has 'head-moved: not merged' "$V_OUT" '^merge-pr: NOT MERGED #42$'
  v_true 'head-moved: merge attempted once, with the sha the tool read' "[ \"\$(grep -c '^pr merge 42 -R o/r --merge --match-head-commit $FX_HEAD\$' '$d/gh.log')\" = 1 ]"
  v_true 'head-moved: remote branch untouched' "v_remote_has '$d' feat/x"
  v_false 'head-moved: seat gone' "v_has_branch '$d' merge-seat-42"

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
  # 6b. the REQUIRED contexts, read from the base branch's rules (#896). Every other context
  #     green is not enough: the maintainer merges as a ruleset bypass actor, so GitHub does not
  #     refuse a merge whose required contexts never reported, and this tool is the only check.
  #     The issue's own experiment first: four CodeQL contexts, all pass, no required context.
  FAKE_CHECKS='[{"name":"CodeQL","bucket":"pass"},{"name":"Analyze (actions)","bucket":"pass"},{"name":"Analyze (javascript-typescript)","bucket":"pass"},{"name":"Analyze (python)","bucket":"pass"}]' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/only-non-required-green' 1 "$V_RC"
  v_has 'only-non-required: names what is missing' "$V_OUT" '^merge-pr:   required context missing: line-endings$'
  v_has 'only-non-required: refusal' "$V_OUT" '^merge-pr: REFUSED: 5 of 5 required context\(s\) on main not pass on PR 42'
  FAKE_CHECKS="[$(printf '%s' "$all_required" | sed 's/{"name":"cli-test","bucket":"pass"}/{"name":"cli-test","bucket":"skipping"}/')]" v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/required-skipping' 1 "$V_RC"
  v_has 'required-skipping: named with its bucket' "$V_OUT" '^merge-pr:   required context not pass: cli-test \(skipping\)$'
  FAKE_CHECKS="[$(printf '%s' "$all_required" | sed 's/,{"name":"skills","bucket":"pass"}//')]" v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/one-required-missing' 1 "$V_RC"
  v_has 'one-required-missing: named' "$V_OUT" '^merge-pr:   required context missing: skills$'
  v_has 'one-required-missing: refusal' "$V_OUT" '^merge-pr: REFUSED: 1 of 5 required context\(s\) on main not pass on PR 42'
  # X2. a superstring is not the context: validate-skills present, skills absent, refused.
  FAKE_CHECKS="[$(printf '%s' "$all_required" | sed 's/{"name":"skills","bucket":"pass"}/{"name":"validate-skills","bucket":"pass"},{"name":"skills (pull_request)","bucket":"pass"}/')]" v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/required-superstring-only' 1 "$V_RC"
  v_has 'required-superstring: skills still missing' "$V_OUT" '^merge-pr:   required context missing: skills$'
  # The rules answer pages at 30, and --paginate prints the pages back to back. A required rule
  # on the SECOND page is read: one context missing there is refused by name.
  FAKE_RULES='[{"type":"deletion","parameters":null}][{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":false,"required_status_checks":[{"context":"line-endings"},{"context":"integrity"},{"context":"skills"},{"context":"scripts-test"},{"context":"cli-test"}]}}]' \
    FAKE_CHECKS="[$(printf '%s' "$all_required" | sed 's/,{"name":"cli-test","bucket":"pass"}//')]" v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'refuse/required-rule-on-page-2' 1 "$V_RC"
  v_has 'page-2: the missing context named' "$V_OUT" '^merge-pr:   required context missing: cli-test$'
  FAKE_RULES=unreadable v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'rules-unreadable' 2 "$V_RC"
  v_has 'rules-unreadable: says so' "$V_OUT" '^merge-pr: cannot read the rules in effect on main'
  FAKE_RULES='{"message":"Not Found"}' v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'rules-not-an-array' 2 "$V_RC"
  # jq prints nothing on an empty body and exits 0, which would read as "no required rule".
  FAKE_RULES=emptybody v_run "$d" 42 --head "$FX_HEAD"
  v_rc 'rules-empty-body' 2 "$V_RC"
  # 6c. mergeStateStatus, polled past UNKNOWN (measured on #889-#891: UNKNOWN on a first read,
  #     CLEAN about 10 s later), accepted only as CLEAN or HAS_HOOKS. The UNKNOWN list ends in
  #     CLEAN on purpose: a poll with no bound would reach it and merge, so this arm fails on an
  #     unbounded loop rather than hanging the self-test.
  FAKE_MSS='UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,CLEAN' v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'refuse/mss-unknown-forever' 1 "$V_RC"
  v_has 'mss-unknown-forever: refusal' "$V_OUT" '^merge-pr: REFUSED: mergeStateStatus is still UNKNOWN after 10 read\(s\) on PR 42'
  for mss in DIRTY BLOCKED BEHIND DRAFT UNSTABLE; do
    FAKE_MSS=$mss v_run "$d" 42 --head "$FX_HEAD" --interval 0
    v_rc "refuse/mss-$mss" 1 "$V_RC"
    v_has "mss-$mss: named" "$V_OUT" "^merge-pr: REFUSED: mergeStateStatus is $mss on PR 42"
  done
  FAKE_MSS=unreadable v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'mss-unreadable' 2 "$V_RC"
  # X1. a state this tool has never heard of is refused by the default case, and named.
  FAKE_MSS=MERGEABLE_SOON v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'refuse/mss-unknown-state' 1 "$V_RC"
  v_has 'mss-unknown-state: named by the default case' "$V_OUT" '^merge-pr: REFUSED: mergeStateStatus is MERGEABLE_SOON on PR 42 -- not a state this tool knows to be mergeable'
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

  # 7b. mergeStateStatus UNKNOWN then CLEAN merges, and read exactly as often as it took.
  d="$root/c6d"; fixture "$d" || return 2
  FAKE_MSS='UNKNOWN,UNKNOWN,CLEAN' v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'mss-unknown-then-clean' 0 "$V_RC"
  v_true 'mss-unknown-then-clean: read three times' "[ \"\$(grep -c 'mergeStateStatus' '$d/gh.log')\" = 3 ]"
  v_has 'mss-unknown-then-clean: the settled state is printed' "$V_OUT" '^merge-pr: mergeStateStatus CLEAN after 3 read\(s\)$'
  # HAS_HOOKS is CLEAN with a pre-receive hook in the way; it merges.
  d="$root/c6d-hooks"; fixture "$d" || return 2
  FAKE_MSS=HAS_HOOKS v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'mss-has-hooks' 0 "$V_RC"
  # A base with no required-status-checks rule (another repository, or none configured): the
  # required set is empty and says so, and the ordinary gate still applies.
  d="$root/c6d-norules"; fixture "$d" || return 2
  FAKE_RULES='[]' FAKE_CHECKS='[{"name":"CodeQL","bucket":"pass"}]' v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'no-required-rule' 0 "$V_RC"
  v_has 'no-required-rule: says so' "$V_OUT" '^merge-pr: required contexts on main: none \(no required_status_checks rule; classic branch protection is not read\)$'

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

  # 9b. an operation in progress is refused before the seat is cut -- one run per marker, so
  #     every literal in the tool's list is pinned (round-3 N1: a typo in one would silently
  #     disable that refusal). Each marker is created inside the checkout under
  #     `git rev-parse --git-path`, which answers relative to the cwd (the first cut resolved it
  #     from the caller's cwd and created the directory in the caller's repository).
  local marker
  for marker in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply BISECT_START sequencer; do
    d="$root/c9b-$marker"; fixture "$d" || return 2
    case "$marker" in
      rebase-merge|rebase-apply|sequencer) (cd "$d/checkout" && mkdir "$(git rev-parse --git-path "$marker")") || return 2 ;;
      *) (cd "$d/checkout" && : > "$(git rev-parse --git-path "$marker")") || return 2 ;;
    esac
    v_run "$d" 42 --head "$FX_HEAD" --interval 0
    v_rc "in-progress-operation/$marker" 2 "$V_RC"
    v_has "in-progress/$marker: named" "$V_OUT" "^merge-pr: an operation is in progress \\($marker\\); finish or abort it first\$"
    v_false "in-progress/$marker: no merge" "grep -q '^pr merge' '$d/gh.log'"
    v_false "in-progress/$marker: no seat" "v_has_branch '$d' merge-seat-42"
  done

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

  # 11b. MERGED per the API with no merge commit: the PR is merged, so exit 3, not 1; the seat
  #      stays, nothing is deleted.
  d="$root/c11b"; fixture "$d" || return 2
  FAKE_VERDICT=nooid v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'merged-without-oid' 3 "$V_RC"
  v_has 'no-oid: verdict line' "$V_OUT" '^merge-pr: MERGED #42, merge commit unknown, cleanup incomplete$'
  v_true 'no-oid: left on the seat' "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = merge-seat-42 ]"
  v_true 'no-oid: remote branch kept' "v_remote_has '$d' feat/x"

  # 11c. The verdict cannot be read at all, twice: the merge may or may not have happened, so
  #      nothing is touched or restored, and the exit is 2 with the question handed back.
  d="$root/c11c"; fixture "$d" || return 2
  FAKE_VERDICT=unreadable v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'verdict-unreadable' 2 "$V_RC"
  v_has 'unreadable: says so' "$V_OUT" '^merge-pr: the verdict could not be read twice after the merge attempt; checkout left on merge-seat-42, nothing deleted'
  v_has 'unreadable: no verdict line' "$V_OUT" '^merge-pr: NO VERDICT #42$'
  v_true 'unreadable: read twice' "[ \"\$(grep -c '^pr view 42 -R o/r --json state,mergeCommit$' '$d/gh.log')\" = 2 ]"
  v_true 'unreadable: left on the seat' "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = merge-seat-42 ]"
  v_true 'unreadable: remote branch kept' "v_remote_has '$d' feat/x"

  # 11c'. A verdict body that parses but carries no state -- empty, then `null` -- is no verdict
  #       either (round-1 B2): exit 2, NO VERDICT, nothing restored, nothing deleted.
  for fv in empty null; do
    d="$root/c11c-$fv"; fixture "$d" || return 2
    FAKE_VERDICT=$fv v_run "$d" 42 --head "$FX_HEAD" --interval 0
    v_rc "verdict-$fv-body" 2 "$V_RC"
    v_has "verdict-$fv: no verdict line" "$V_OUT" '^merge-pr: NO VERDICT #42$'
    v_lacks "verdict-$fv: never says not merged" "$V_OUT" 'NOT MERGED'
    v_true "verdict-$fv: left on the seat" "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = merge-seat-42 ]"
    v_true "verdict-$fv: remote branch kept" "v_remote_has '$d' feat/x"
  done

  # 11d. A cleanup step is refused after the merge: the local head branch carries a commit that
  #      was never pushed, so its tip is not in the merge. The merge stands, the remote branch
  #      still goes, and the exit is 3 with the reason named, never 1.
  d="$root/c11d"; fixture "$d" || return 2
  (cd "$d/checkout" && echo local > LOCAL && git add LOCAL && git commit -q -m unpushed) || return 2
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'cleanup-refused' 3 "$V_RC"
  v_has 'cleanup-refused: names the step' "$V_OUT" '^merge-pr: kept local branch feat/x: its tip [0-9a-f]{9} is not in the merge [0-9a-f]{9}'
  v_has 'cleanup-refused: verdict still names the merge' "$V_OUT" '^merge-pr: MERGED #42 as [0-9a-f]{40}, cleanup incomplete$'
  v_true 'cleanup-refused: local branch kept' "v_has_branch '$d' feat/x"
  v_false 'cleanup-refused: remote branch gone' "v_remote_has '$d' feat/x"
  v_true 'cleanup-refused: detached on the merged main' "[ \"\$(v_state '$d' | cut -d' ' -f1)\" = detached ]"

  # 11f. The local head branch's tip is NOT in the merge, but its remote-tracking ref says it
  #      is merged: the tool fetches only the base, so origin/feat/x can be stale -- a local
  #      branch someone force-pushed over, as on a Dependabot rebase. `git branch -d` checks the
  #      upstream when one resolves (git 2.43 `git help branch`), so it deleted this branch at
  #      exit 0 and the redirect threw its warning away (#896, measured by the #865 challenge).
  #      The ancestry check against the merge commit keeps it.
  d="$root/c11f"; fixture "$d" || return 2
  (cd "$d/checkout" && echo stale > STALE && git add STALE && git commit -q -m 'force-pushed over' \
    && git update-ref refs/remotes/origin/feat/x HEAD) || return 2
  local stale_tip; stale_tip=$(git -C "$d/checkout" rev-parse feat/x)
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'stale-tracking-ref' 3 "$V_RC"
  v_has 'stale-tracking: kept, with the reason' "$V_OUT" "^merge-pr: kept local branch feat/x: its tip ${stale_tip:0:9} is not in the merge"
  v_true 'stale-tracking: the unmerged tip survives' "[ \"\$(git -C '$d/checkout' rev-parse feat/x 2>/dev/null)\" = '$stale_tip' ]"
  v_has 'stale-tracking: verdict still names the merge' "$V_OUT" '^merge-pr: MERGED #42 as [0-9a-f]{40}, cleanup incomplete$'

  # 11g. The local tip IS in the merge, but origin/feat/x is stale BEHIND it (the push came
  #      from another clone): `git branch -d` compares against the upstream and refuses even
  #      though HEAD contains the tip; the ancestry check holds and -D deletes. Exit 0.
  d="$root/c11g"; fixture "$d" || return 2
  git -C "$d/checkout" update-ref refs/remotes/origin/feat/x "$FX_BASE_SHA" || return 2
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'stale-behind-tracking-ref' 0 "$V_RC"
  v_has 'stale-behind: deleted' "$V_OUT" '^merge-pr: deleted local branch feat/x$'
  v_false 'stale-behind: local branch gone' "v_has_branch '$d' feat/x"

  # 11e. ls-remote fails after the push --delete (a git wrapper on PATH that refuses only that
  #      subcommand): an empty answer from a failed command is not "absent", so exit 3, not 0.
  d="$root/c11e"; fixture "$d" || return 2
  printf '#!/usr/bin/env bash\n[ "$1" = ls-remote ] && exit 128\nexec %s "$@"\n' "$(command -v git)" > "$d/bin/git"; chmod +x "$d/bin/git"
  v_run "$d" 42 --head "$FX_HEAD" --interval 0
  v_rc 'ls-remote-fails' 3 "$V_RC"
  v_has 'ls-remote-fails: says so' "$V_OUT" '^merge-pr: could not confirm whether remote branch feat/x is gone \(ls-remote failed\); check it by hand$'
  v_lacks 'ls-remote-fails: no deletion claimed' "$V_OUT" 'deleted remote branch'
  v_has 'ls-remote-fails: verdict still names the merge' "$V_OUT" '^merge-pr: MERGED #42 as [0-9a-f]{40}, cleanup incomplete$'

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
    echo "verify: $V_CASES run(s), 0 failure(s) -- the seat-branch merge against a real bare origin under the worktree constraint: verdict from the API over gh's exit (1 after a merge, 0 without one, 1 with nothing merged), a head moved between read and merge refused, restore on no merge, the refusals before anything is touched (an operation in progress, a required context missing or not pass, a mergeStateStatus other than CLEAN/HAS_HOOKS, an UNKNOWN that never settles included), fork and --keep-remote, a local head tip not in the merge kept whatever its upstream says, exit 3 when the merge never reaches origin or reports no commit or a cleanup step fails, exit 2 when the verdict is unreadable or carries no state, the own-PR run from a file the seat checkout removes, the argument refusals"
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
