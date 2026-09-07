#!/usr/bin/env bash
# review-bundle.sh — build a self-contained bundle for an adversarial reviewer that must NOT read
# the working tree.
#
# WHY
# ---
# The standing reviewer here (advocatus-diaboli) has no Bash and reads files. Its worktree is
# whatever the repository happens to be checked out at while it runs — in a session that keeps
# working, that is usually a different branch, so anything it Reads from the tree is pre-change
# or unrelated (memory: feedback_worktree_isolation_is_not_your_branch). The remedy that worked
# on 2026-09-02, twice, was a bundle in the scratchpad: the diff, full copies of every new or
# changed source file, the PR body, and a README telling the reviewer to read nothing else.
# Building that by hand each time is the calculation this tool replaces.
#
# A bundle is cut at a named commit and says so. `BUNDLE_SHA` carries HEAD's full sha and
# `BUNDLE_STATUS` the tracked-file status of the tree at that moment (`(no output)` when clean),
# so the reviewer can report a mismatch instead of grading, and a bundle cut over uncommitted
# edits says so rather than shipping copies that match no commit. Both were asked for by the
# reviewers of #797 and #798 (2026-09-07) and cut by hand for six rounds before landing here.
# `--since REF` adds the latest round's fixes on their own (`diff-since.md`), and `--include`
# carries the earlier findings, the fact sheet and a mutant log the reviewer grades against.
#
# A mirror-heavy change (165 one-line i18n hunks) drowns the review in noise, so paths matching
# a --summarise pathspec are reported as a stat plus a small sample instead of expanded hunks.
# ONE matcher decides what is summarised — git's own pathspec — for the diff and for the copies
# alike; the first draft re-implemented it with a bash `case` and the two disagreed on a bare
# directory name.
#
# Copies come from HEAD (`git show HEAD:path`), never from the working tree, and the bundle
# refuses (exit 2) rather than shipping a silent zero-byte stand-in when a copy fails. Deleted
# files appear in the diff and are not copied. Paths are read with core.quotePath off, so a
# non-ASCII filename is a filename, not a C-quoted string.
#
# USAGE
#     tools/review-bundle.sh [--base REF] [--out DIR] [--summarise PATHSPEC]... [--body FILE] [--sample N]
#                            [--since REF] [--include FILE]...
#     tools/review-bundle.sh --verify        self-test in a throwaway repo; exit non-zero if the bundle
#                                            would omit a changed file or expand a summarised one
#
#   --base REF          diff base (default origin/main). The diff is REF...HEAD (merge-base form).
#   --out DIR           bundle directory (default: a fresh mktemp -d). Must not already contain a bundle.
#   --summarise SPEC    git pathspec whose hunks are summarised, not expanded (repeatable; `i18n/*`, `i18n`).
#                       Resolved from the repository root, not from your cwd.
#   --body FILE         PR body to include as pr-body.md.
#   --sample N          how many summarised files get their diff shown as a sample (default 3; 0 = none).
#   --since REF         also write diff-since.md: REF...HEAD, the latest round's fixes on their own.
#                       REF must be a strict ancestor of HEAD (exit 2 otherwise — a since off the
#                       branch, or at HEAD, would diff against something the reviewer never saw).
#   --include FILE      copy FILE into the bundle root under its basename (repeatable): earlier
#                       findings, the fact sheet, a mutant log. Two includes with one basename, a
#                       basename the bundle itself writes, or an unreadable file exit 2.
#
# Runs from anywhere inside the repository; the bundle is always repo-wide.
#
# EXIT: 0 bundle written; 1 --verify failed; 2 could not run (not a git repo, base or since
# unknown, since not a strict ancestor of HEAD, bad arguments, no changes, a copy failed, an
# include unreadable or colliding, --out already holds a bundle). 2 is never a pass.
set -uo pipefail

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
# Names the bundle writes itself; an --include may not take one of them.
RESERVED='README.md diff.md diff-since.md pr-body.md BUNDLE_SHA BUNDLE_STATUS files'

die() { printf 'review-bundle: %s\n' "$*" >&2; exit 2; }
abspath() { case "$1" in /*) printf '%s' "$1" ;; *) printf '%s/%s' "$PWD" "$1" ;; esac; }

build() {
  local base="origin/main" out="" body="" sample=3 since=""
  local -a summarise=() includes=()
  while [ $# -gt 0 ]; do
    case "$1" in
      --base) [ $# -ge 2 ] || die "--base needs a value"; base="$2"; shift 2 ;;
      --out) [ $# -ge 2 ] || die "--out needs a value"; out="$(abspath "$2")"; shift 2 ;;
      --summarise) [ $# -ge 2 ] || die "--summarise needs a value"; summarise+=("$2"); shift 2 ;;
      --body) [ $# -ge 2 ] || die "--body needs a value"; body="$(abspath "$2")"; shift 2 ;;
      --sample) [ $# -ge 2 ] || die "--sample needs a value"; sample="$2"; shift 2 ;;
      --since) [ $# -ge 2 ] || die "--since needs a value"; since="$2"; shift 2 ;;
      --include) [ $# -ge 2 ] || die "--include needs a value"; includes+=("$(abspath "$2")"); shift 2 ;;
      *) die "unknown argument: $1" ;;
    esac
  done
  [[ "$sample" =~ ^[0-9]+$ ]] || die "--sample must be a non-negative integer"
  local top
  top="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
  cd "$top" || die "cannot cd to $top"
  git rev-parse --verify --quiet "$base^{commit}" >/dev/null || die "base ref not found: $base"
  local head_sha
  head_sha="$(git rev-parse HEAD)" || die "cannot resolve HEAD"
  if [ -n "$since" ]; then
    git rev-parse --verify --quiet "$since^{commit}" >/dev/null || die "since ref not found: $since"
    [ "$(git rev-parse "$since^{commit}")" != "$head_sha" ] || die "--since is HEAD itself; nothing since it"
    git merge-base --is-ancestor "$since" HEAD || die "--since $since is not an ancestor of HEAD"
  fi
  [ -n "$body" ] && { [ -r "$body" ] || die "body not readable: $body"; }
  local inc name seen=" "
  for inc in "${includes[@]+"${includes[@]}"}"; do
    [ -r "$inc" ] && [ -f "$inc" ] || die "include not readable: $inc"
    name="$(basename "$inc")"
    case " $RESERVED " in *" $name "*) die "include $inc would overwrite the bundle's own $name" ;; esac
    case "$seen" in *" $name "*) die "two includes share the basename $name" ;; esac
    seen="$seen$name "
  done
  if [ -z "$out" ]; then out="$(mktemp -d)"; else
    mkdir -p "$out" || die "cannot create $out"
    [ -e "$out/diff.md" ] || [ -e "$out/files" ] || [ -e "$out/BUNDLE_SHA" ] && die "$out already holds a bundle (or a failed one); pass a fresh --out"
  fi

  local -a excl=()
  local g
  for g in "${summarise[@]+"${summarise[@]}"}"; do excl+=(":(exclude)$g"); done
  local -a Q=(-c core.quotePath=false)

  local range="$base...HEAD"
  local changed expanded stat summarised_list
  changed="$(git "${Q[@]}" diff --name-status "$range" -- .)" || die "git diff failed"
  [ -n "$changed" ] || die "no changes between $base and HEAD"
  expanded="$(git "${Q[@]}" diff "$range" -- . "${excl[@]+"${excl[@]}"}")" || die "git diff (expanded) failed"
  summarised_list=""
  if [ ${#summarise[@]} -gt 0 ]; then
    summarised_list="$(git "${Q[@]}" diff --name-only "$range" -- "${summarise[@]}")" || die "git diff (summarised) failed"
    stat="$(git "${Q[@]}" diff --stat "$range" -- "${summarise[@]}")" || die "git diff --stat failed"
  fi

  # The stamp first: a reviewer checks these two before anything else, and a bundle that fails
  # later is removed with them.
  printf '%s\n' "$head_sha" > "$out/BUNDLE_SHA"
  local tracked
  tracked="$(git "${Q[@]}" status --porcelain --untracked-files=no)" || die "git status failed"
  {
    printf '# git status --porcelain --untracked-files=no at %s: %s\n' "$head_sha" "${tracked:+see below}${tracked:-(no output)}"
    [ -n "$tracked" ] && printf '%s\n' "$tracked"
  } > "$out/BUNDLE_STATUS"

  {
    printf '# Review bundle — diff %s\n\n' "$range"
    printf 'Generated by tools/review-bundle.sh at %s. Source files in full; summarised paths as stat + sample.\n\n' "$head_sha"
    printf '## Changed files (name-status)\n\n```\n%s\n```\n\n' "$changed"
    printf '## Diff of expanded paths\n\n```diff\n%s\n```\n' "$expanded"
    if [ ${#summarise[@]} -gt 0 ]; then
      printf '\n## Summarised paths (%s)\n\n' "${summarise[*]}"
      printf '### stat\n\n```\n%s\n```\n\n' "$stat"
      printf '### sample of %s file(s)\n\n```diff\n' "$sample"
      if [ "$sample" -gt 0 ]; then
        printf '%s\n' "$summarised_list" | head -n "$sample" | while IFS= read -r f; do
          [ -n "$f" ] && git "${Q[@]}" diff "$range" -- "$f"
        done
      fi
      printf '```\n'
    fi
  } > "$out/diff.md"

  if [ -n "$since" ]; then
    local since_range="$since...HEAD" since_changed since_expanded
    since_changed="$(git "${Q[@]}" diff --name-status "$since_range" -- .)" || die "git diff (since) failed"
    since_expanded="$(git "${Q[@]}" diff "$since_range" -- . "${excl[@]+"${excl[@]}"}")" || die "git diff (since, expanded) failed"
    {
      printf '# Since the last round — diff %s\n\n' "$since_range"
      printf 'The commits after %s only; the whole change is in diff.md.\n\n' "$(git rev-parse --short "$since")"
      printf '## Changed files (name-status)\n\n```\n%s\n```\n\n' "${since_changed:-(none)}"
      printf '## Diff of expanded paths\n\n```diff\n%s\n```\n' "$since_expanded"
      if [ ${#summarise[@]} -gt 0 ]; then
        printf '\n## Summarised paths (%s): stat\n\n```\n%s\n```\n' "${summarise[*]}" "$(git "${Q[@]}" diff --stat "$since_range" -- "${summarise[@]}")"
      fi
    } > "$out/diff-since.md"
  fi

  # Full copies from HEAD of every added, modified, renamed, copied or type-changed file that is
  # NOT summarised. Deletions have nothing to copy. The summarised set is what git said it was,
  # never a re-implementation. A failed copy removes the partial bundle so the same --out can be
  # retried after the cause is fixed.
  local status path
  mkdir -p "$out/files"
  while IFS=$'\t' read -r status path; do
    [ -n "$path" ] || continue
    case "$status" in A*|M*|R*|C*|T*) ;; *) continue ;; esac
    if [ -n "$summarised_list" ] && printf '%s\n' "$summarised_list" | grep -qxF -- "$path"; then continue; fi
    mkdir -p "$out/files/$(dirname "$path")"
    git show "HEAD:$path" > "$out/files/$path" 2>/dev/null || { rm -rf "$out/files" "$out/diff.md" "$out/diff-since.md" "$out/BUNDLE_SHA" "$out/BUNDLE_STATUS"; die "cannot copy HEAD:$path"; }
  done <<< "$(printf '%s\n' "$changed" | awk -F'\t' '{print $1 "\t" $NF}')"

  [ -n "$body" ] && { cp "$body" "$out/pr-body.md" || die "cannot copy $body"; }
  for inc in "${includes[@]+"${includes[@]}"}"; do
    cp "$inc" "$out/$(basename "$inc")" || die "cannot copy $inc"
  done

  {
    printf '# Review bundle\n\n'
    printf 'Everything the reviewer needs is under this directory. **Do NOT read the repository working tree**'
    printf ' — it may be checked out on another branch while you work; anything read there can be pre-change or unrelated.\n\n'
    printf 'Before grading, read `BUNDLE_SHA` and `BUNDLE_STATUS`. If the sha is not the commit you were told to review,'
    printf ' or the status line does not say `(no output)`, report that mismatch instead of a verdict.\n\n'
    printf -- '- `BUNDLE_SHA` — the commit every copy and diff was cut at (%s)\n' "$head_sha"
    printf -- '- `BUNDLE_STATUS` — tracked-file status of the tree at that moment; `(no output)` means the copies match the commit\n'
    printf -- '- `diff.md` — the change (`%s`), expanded except for summarised paths; deleted files appear here only\n' "$range"
    [ -n "$since" ] && printf -- '- `diff-since.md` — the latest round'"'"'s fixes alone (`%s...HEAD`)\n' "$(git rev-parse --short "$since")"
    printf -- '- `files/<path>` — full post-change content (from HEAD) of every added or modified source file\n'
    [ -n "$body" ] && printf -- '- `pr-body.md` — the PR body and its evidence claims\n'
    for inc in "${includes[@]+"${includes[@]}"}"; do printf -- '- `%s` — included by the lead\n' "$(basename "$inc")"; done
    printf -- '- write your findings to `findings.md` in this directory (the file is the deliverable)\n\n'
    printf '## Files in this bundle\n\n```\n'
    (cd "$out" && find . -type f | sort)
    printf '```\n'
  } > "$out/README.md"

  printf 'bundle: %s at %s\n' "$out" "$head_sha"
  (cd "$out" && find . -type f | sort | sed 's/^/  /')
  printf '%s\n' "$out"
}

verify() {
  local tmp; tmp="$(mktemp -d)"
  local repo="$tmp/repo" out="$tmp/bundle" rc=0 rc2
  # Isolate from the ambient git config AND from a hook/rebase environment that would point
  # `git init`/`git add` at the outer repository.
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
  unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
  mkdir -p "$repo/i18n/de" "$repo/i18n/fr" "$repo/src" "$repo/docs" "$tmp/other"
  printf 'sentinel-facts-9c1\n' > "$tmp/facts.md"; printf 'other facts\n' > "$tmp/other/facts.md"
  printf 'sentinel-findings-2b4\n' > "$tmp/findings-r1.md"; printf 'not a bundle readme\n' > "$tmp/README.md"
  (
    cd "$repo" || exit 2
    git init -q && git config user.email t@t && git config user.name t
    printf 'one\ntwo\n' > src/a.txt; printf 'mirror\n' > i18n/de/x.md; printf 'miroir\n' > i18n/fr/y.md
    printf 'to be renamed\n' > src/old.txt; printf 'grün\n' > "docs/grün ä.md"
    printf 'gone\n' > src/gone.txt; printf 'regular\n' > src/link.txt
    git add -A && git commit -qm base
    git branch -q base
    printf 'one\nTWO\n' > src/a.txt; printf 'new\n' > src/b.txt
    printf 'mirror-changed\n' > i18n/de/x.md; printf 'miroir-changé\n' > i18n/fr/y.md
    git mv src/old.txt src/renamed.txt; printf 'grün changed\n' > "docs/grün ä.md"
    git rm -q src/gone.txt; rm src/link.txt && ln -s a.txt src/link.txt
    printf 'sentinel-body-7f3\n' > "$tmp/body.md"
    git add -A && git commit -qm change
    git branch -q mid
    # A later round's fix on its own commit: --since mid must show this hunk and not TWO.
    printf 'later-content\n' > src/c.txt
    git add -A && git commit -qm later
    # A commit that is NOT an ancestor of HEAD, for the --since refusal.
    git commit-tree "$(git rev-parse 'base^{tree}')" -m side > "$tmp/side.sha"
    # The working tree now DIFFERS from HEAD: copies must come from HEAD, not from here, and
    # BUNDLE_STATUS must say so.
    printf 'WORKTREE-ONLY\n' > src/a.txt
    # Run from a subdirectory: the bundle must still be repo-wide.
    cd src && bash "$SELF" --base base --out "$out" --summarise 'i18n' --sample 1 --body "$tmp/body.md" --since mid --include "$tmp/facts.md" --include "$tmp/findings-r1.md" >/dev/null \
      && bash "$SELF" --base base --out "$tmp/s0" --summarise 'i18n' --sample 0 >/dev/null \
      && bash "$SELF" --base base --out relout --summarise 'i18n' >/dev/null \
      && git checkout -q -- a.txt && bash "$SELF" --base base --out "$tmp/clean" >/dev/null
  ) || rc=$?
  [ "$rc" -eq 0 ] || { printf 'verify: build exited %s\n' "$rc"; rm -rf "$tmp"; exit 1; }

  check() { if eval "$2"; then printf '  ok   %s\n' "$1"; else printf '  FAIL %s\n' "$1"; rc=1; fi; }
  check "added file copied in full"                  "[ \"\$(cat '$out/files/src/b.txt')\" = new ]"
  check "modified file copied from HEAD, not tree"   "grep -q TWO '$out/files/src/a.txt' && ! grep -q WORKTREE-ONLY '$out/files/src/a.txt'"
  check "renamed file copied under its new name"     "[ -f '$out/files/src/renamed.txt' ]"
  check "deleted file not copied, build succeeded"   "[ ! -e '$out/files/src/gone.txt' ] && grep -q '^D.*src/gone.txt' '$out/diff.md'"
  check "type-changed file (T) copied, non-empty"    "[ -s '$out/files/src/link.txt' ]"
  check "non-ASCII path with a space copied"         "grep -q 'grün changed' '$out/files/docs/grün ä.md'"
  check "bare-directory summarise: nothing copied"   "[ ! -e '$out/files/i18n' ]"
  check "copy set == expanded changed set - deletions" "diff <(cd '$repo' && git -c core.quotePath=false diff --name-only --diff-filter=d base...HEAD -- . ':(exclude)i18n' | sort) <(cd '$out/files' && find . -type f -o -type l | sed 's|^\./||' | sort) >/dev/null"
  check "expanded hunk present in diff.md"           "grep -q '^+TWO' '$out/diff.md'"
  check "summarised paths in the STAT section"       "grep -qE '^ i18n/de/x\.md +\|' '$out/diff.md' && grep -qE '^ i18n/fr/y\.md +\|' '$out/diff.md'"
  check "--sample 1: exactly one summarised hunk"    "[ \"\$(grep -c '^diff --git a/i18n' '$out/diff.md')\" = 1 ]"
  check "--sample 0: no summarised hunk"             "[ \"\$(grep -c '^diff --git a/i18n' '$tmp/s0/diff.md')\" = 0 ]"
  check "relative --out resolves against the cwd"    "[ -d '$repo/src/relout/files' ]"
  check "body copied as pr-body.md and listed"       "grep -q sentinel-body-7f3 '$out/pr-body.md' && grep -q './pr-body.md' '$out/README.md'"
  check "README forbids reading the tree"            "grep -q 'Do NOT read the repository working tree' '$out/README.md'"
  check "every copied file is non-empty"             "! find '$out/files' -type f -empty | grep -q ."
  check "BUNDLE_SHA is HEAD's full sha"              "[ \"\$(cat '$out/BUNDLE_SHA')\" = \"\$(git -C '$repo' rev-parse HEAD)\" ] && [ \"\$(tr -d '\\n' < '$out/BUNDLE_SHA' | wc -c)\" -eq 40 ]"
  check "dirty tracked file named in BUNDLE_STATUS"  "grep -q ' M src/a.txt' '$out/BUNDLE_STATUS' && ! grep -q '(no output)' '$out/BUNDLE_STATUS'"
  check "clean tree: BUNDLE_STATUS says (no output)" "grep -q '(no output)' '$tmp/clean/BUNDLE_STATUS' && [ \"\$(wc -l < '$tmp/clean/BUNDLE_STATUS')\" = 1 ]"
  check "README tells the reviewer to check the stamp" "grep -q 'BUNDLE_SHA' '$out/README.md' && grep -q 'report that mismatch' '$out/README.md'"
  check "diff-since carries the later hunk only"     "grep -q '^+later-content' '$out/diff-since.md' && ! grep -q '^+TWO' '$out/diff-since.md'"
  check "no --since: no diff-since.md"               "[ ! -e '$tmp/s0/diff-since.md' ]"
  check "includes copied under their basenames"      "grep -q sentinel-facts-9c1 '$out/facts.md' && grep -q sentinel-findings-2b4 '$out/findings-r1.md'"
  check "includes listed in the README"              "grep -q '\`facts.md\`' '$out/README.md' && grep -q './findings-r1.md' '$out/README.md'"
  # negative controls: the tool must refuse, with exit 2, rather than ship a partial bundle
  (cd "$repo" && bash "$SELF" --base does-not-exist --out "$tmp/e1" >/dev/null 2>&1); rc2=$?
  check "unknown base → exit 2"                      "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e2" --body "$tmp/missing.md" >/dev/null 2>&1); rc2=$?
  check "unreadable --body → exit 2"                 "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base >/dev/null 2>&1); rc2=$?
  check "missing option value → exit 2"              "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base base --out "$out" >/dev/null 2>&1); rc2=$?
  check "--out already holds a bundle → exit 2"      "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e5" --since does-not-exist >/dev/null 2>&1); rc2=$?
  check "unknown --since → exit 2"                   "[ $rc2 -eq 2 ] && [ ! -e '$tmp/e5/BUNDLE_SHA' ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e6" --since HEAD >/dev/null 2>&1); rc2=$?
  check "--since HEAD → exit 2"                      "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e7" --since "$(cat "$tmp/side.sha")" >/dev/null 2>&1); rc2=$?
  check "--since not an ancestor → exit 2"           "[ $rc2 -eq 2 ] && [ ! -e '$tmp/e7/BUNDLE_SHA' ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e8" --include "$tmp/nope.md" >/dev/null 2>&1); rc2=$?
  check "unreadable --include → exit 2"              "[ $rc2 -eq 2 ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e9" --include "$tmp/facts.md" --include "$tmp/other/facts.md" >/dev/null 2>&1); rc2=$?
  check "two includes, one basename → exit 2"        "[ $rc2 -eq 2 ] && [ ! -e '$tmp/e9/BUNDLE_SHA' ]"
  (cd "$repo" && bash "$SELF" --base base --out "$tmp/e10" --include "$tmp/README.md" >/dev/null 2>&1); rc2=$?
  check "include named like the bundle's own file → exit 2" "[ $rc2 -eq 2 ]"
  (cd "$repo" && git checkout -q -f base && bash "$SELF" --base base --out "$tmp/e3" >/dev/null 2>&1); rc2=$?
  check "no changes → exit 2, never a pass"          "[ $rc2 -eq 2 ]"
  (cd "$tmp" && bash "$SELF" --base base --out "$tmp/e4" >/dev/null 2>&1); rc2=$?
  check "outside a repo → exit 2"                    "[ $rc2 -eq 2 ]"
  rm -rf "$tmp"
  [ "$rc" -eq 0 ] && printf 'verify: all checks passed\n'
  exit "$rc"
}

case "${1:-}" in
  --verify) verify ;;
  -h|--help) awk 'NR >= 2 && /^set -uo pipefail/ { exit } NR >= 2 { print }' "$SELF"; exit 0 ;;
  *) build "$@" ;;
esac
