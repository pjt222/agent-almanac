#!/usr/bin/env bash
# fact-sheet.sh -- assemble a fact sheet from a spec of labelled commands: for every
# `LABEL :: COMMAND` line in SPEC, run COMMAND with bash from the repository root and record the
# label, the command and its output verbatim, so that every number, sha and status line a draft
# cites traces to a line a verifier can re-run.
#
# WHY THIS EXISTS
# ---------------
# Every pull request here since #807 has carried a fact sheet -- one line per claim, naming the
# command that produced it and quoting its output -- and the handoff rule reads "a claim in the
# handoff that traces to no line here is an assertion". The assembler behind those sheets was
# typed three times in one session: facts-wc.sh (#809, hand-coded blocks, one per fact),
# facts-mp.sh (#810, the same parametrised by PR number) and facts.sh (#813, the spec-driven
# shape this file promotes). CLAUDE.md § Tools says a snippet typed a second time becomes a file
# here; the third typing was written the same day the scratchpad holding all three was cleared by
# a reboot, and they were recovered from the session transcript (issue #816).
#
# The recovered copy had defects a tool must not carry, each pinned by --verify below: a spec
# line with no separator ran its own label as a command; a second separator after the split --
# the `::` trap measured three times on #813 -- ran the remainder as a command; commands ran
# inside the `while read` loop over the spec, so a command that read stdin ate the facts after
# it; a non-zero exit was dropped, so a failed `gh` call read like a measured fact; the sheet
# streamed straight into OUT, so a killed run left a half sheet that looked whole; and the count
# line re-grepped the output with a ruler blind to `F-D0`-style ids.
#
# THE SPEC
# --------
#     # a comment line and a blank line are skipped
#     F1 the head, from git :: git rev-parse HEAD
#     F2 the checks on it :: gh pr checks 813 --json name,bucket
#     F-D3 two commands, one fact :: git status --porcelain | wc -l; git branch --show-current
#
# LABEL is a fact id (the first word, unique within the spec) followed by a free description;
# it may not be empty and may not contain ` :: `. COMMAND is one line of bash, run as
# `bash -c COMMAND` from the root with stdin from /dev/null and stdout and stderr merged. Only
# the EXPORTED environment reaches it: a `$S` set in the calling shell is empty in the child, so
# write absolute paths into the spec. The split is at the FIRST ` :: `; a line without one, or
# with a second ` :: ` after the split, is refused (if the second one belongs to the command, put
# the command in a script file and name the file). So is a line ending in a carriage return: a
# CRLF spec would hand every command a trailing CR and bash would report each one not found.
#
# THE SHEET
# ---------
#     # OUT -- measured 2026-09-09T08:00:00Z on b609fec59 (feat/fact-sheet) from SPEC; 3 fact(s)
#
#     F1 the head, from git: `git rev-parse HEAD`
#         b609fec59e14f9cdf5b74119e17973b92ab60e8a
#
#     F2 the checks on it: `gh pr checks 813 --json name,bucket` (exit 1)
#         no pull requests found for branch "feat/fact-sheet"
#
# Output is indented four spaces, `(no output)` stands for an empty output, one blank line ends
# each fact, and a non-zero exit is recorded on the LABEL line -- never as an indented line, so a
# consumer that parses `^LABEL .*\n` followed by indented lines sees the same block shape it
# always did (the fill scripts of #813's PR body and handoff addenda parse exactly that). The
# header's sha is `unborn` in a repository with no commit and `no git` under a --root that is not
# a repository; the branch is `detached` when HEAD is. Trailing newlines of an output are not kept
# (the capture strips them), so `printf 'a\n\n\n'` records one line; everything before them is
# verbatim.
#
# TWO PHASES
# ----------
# Phase 1 parses the whole spec and collects every problem -- no separator, a second one, a CRLF
# line ending, an empty label or command, a duplicate id -- then refuses all of them at once with exit 2, with
# nothing run and OUT untouched; a spec with zero facts is refused too (a sheet of no facts is
# the vacuous pass). Phase 2 runs the facts in order into OUT's temporary sibling and renames it
# into place at the end, so an interrupted run leaves no half sheet. Every command's exit status
# is recorded in the sheet and none of them fails the tool: the sheet is the measurement, and a
# failed measurement is a fact about the run.
#
# EXIT CODES
# ----------
#     0   every fact ran; the sheet is at OUT (read the label lines for `(exit N)`)
#     2   usage; an unreadable spec; a refused spec; no facts; no git root and no --root; an
#         output directory that does not exist or cannot be written; OUT being the spec itself;
#         a write or rename failure
#
# USAGE
# -----
#     bash tools/fact-sheet.sh [--root DIR] SPEC OUT
#     bash tools/fact-sheet.sh --verify
#     bash tools/fact-sheet.sh --help
#
# --root DIR      run the commands from DIR (default: the git toplevel of the current directory;
#                 refused when there is none)
#
# `--verify` writes specs into a temporary directory holding a throwaway git repository and
# asserts the sheet line by line (single-line, multi-line with a blank line, no output, a
# non-zero exit, `::` inside a command, stderr, the root as cwd, stdin fed to the tool and not
# reaching the command, leading whitespace, trailing newlines, the temporary sibling while the
# facts run), the three header shapes, the default root, and every refusal -- exit 2, OUT absent, the
# message, and for the combined case that no command ran. It exits by its own result (0 clean,
# 1 a check failed, 2 it could not set up).
set -u
TAG=fact-sheet

usage() {
  cat <<'USAGE'
usage: bash tools/fact-sheet.sh [--root DIR] SPEC OUT
       bash tools/fact-sheet.sh --verify
       bash tools/fact-sheet.sh --help

SPEC holds one `LABEL :: COMMAND` line per fact (comments and blank lines skipped). Each COMMAND
runs as `bash -c` from the git toplevel (or --root DIR), stdin /dev/null, stderr merged, and its
output goes into OUT verbatim under the label; a non-zero exit is noted on the label line. The
whole spec is parsed before anything runs, and a bad line refuses the lot with OUT untouched.
USAGE
}

die() { printf '%s: %s\n' "$TAG" "$*" >&2; exit 2; }

# --verify: specs in a temporary directory, the sheet compared line by line, every refusal
# asserted for exit 2 AND an absent OUT. Every case names what it pins.
verify() {
  local self tmp fails=0 checks=0
  self=$(cd "$(dirname -- "$0")" && pwd)/$(basename -- "$0")
  tmp=$(mktemp -d "${TMPDIR:-/tmp}/fact-sheet-verify.XXXXXX") || return 2
  ck() { # NAME GOT EXPECTED
    checks=$((checks + 1))
    if [ "$2" = "$3" ]; then printf 'ok: %s\n' "$1"
    else fails=$((fails + 1)); printf 'FAIL: %s\n    expected: %s\n    got:      %s\n' "$1" "$3" "$2"; fi
  }
  ckgrep() { # NAME FILE PATTERN (extended regex, must match)
    checks=$((checks + 1))
    if grep -Eq -- "$3" "$2" 2>/dev/null; then printf 'ok: %s\n' "$1"
    else fails=$((fails + 1)); printf 'FAIL: %s\n    pattern: %s\n    file:    %s\n' "$1" "$3" "$(head -c 400 "$2" 2>/dev/null | tr '\n' '|')"; fi
  }
  refused() { # NAME SPEC-FILE EXPECTED-MESSAGE-PATTERN [ARGS...] -- run, expect exit 2, OUT absent, the message
    local name=$1 specf=$2 pat=$3 out="$tmp/refused.md" rc; shift 3
    rm -f "$out"
    bash "$self" "$@" "$specf" "$out" >"$tmp/stdout" 2>"$tmp/stderr"; rc=$?
    ck "$name: exit 2" "$rc" 2
    ck "$name: OUT not written" "$([ -e "$out" ] && echo present || echo absent)" absent
    ckgrep "$name: the message" "$tmp/stderr" "$pat"
  }

  git -c init.defaultBranch=main init -q "$tmp/repo" || { rm -rf "$tmp"; return 2; }
  git -C "$tmp/repo" -c user.name=verify -c user.email=verify@example.invalid commit -q --allow-empty -m init || { rm -rf "$tmp"; return 2; }
  mkdir -p "$tmp/repo/sub" "$tmp/plain"

  # v1: the happy sheet, line by line
  cat > "$tmp/happy.spec" <<'SPEC'
# a comment line and a blank line are skipped

F1 one line :: printf 'hello\n'
F2 three lines, the middle one blank :: printf 'a\n\nc\n'
F3 no output :: true
F4 non-zero with output :: printf 'partial\n'; exit 3
F-D5 a double colon inside the command :: printf 'a::b\n'
F6 stderr is captured :: echo oops >&2
F7 the root is the cwd :: basename "$PWD"
F8 stdin is /dev/null, not what the tool was given :: read -r x; printf '%s\n' "${x:-eof}"
   F9 leading whitespace on the line is fine :: printf 'x\n'
F10 trailing newlines are not kept :: printf 'a\n\n\n'
F11 the sheet is not in place while the facts run :: [ -e out.md ] && echo present || echo absent; ls | grep -c 'out\.md\.tmp'
SPEC
  cat > "$tmp/expected.md" <<'EXPECTED'

F1 one line: `printf 'hello\n'`
    hello

F2 three lines, the middle one blank: `printf 'a\n\nc\n'`
    a
    
    c

F3 no output: `true`
    (no output)

F4 non-zero with output: `printf 'partial\n'; exit 3` (exit 3)
    partial

F-D5 a double colon inside the command: `printf 'a::b\n'`
    a::b

F6 stderr is captured: `echo oops >&2`
    oops

F7 the root is the cwd: `basename "$PWD"`
    repo

F8 stdin is /dev/null, not what the tool was given: `read -r x; printf '%s\n' "${x:-eof}"`
    eof

F9 leading whitespace on the line is fine: `printf 'x\n'`
    x

F10 trailing newlines are not kept: `printf 'a\n\n\n'`
    a

F11 the sheet is not in place while the facts run: `[ -e out.md ] && echo present || echo absent; ls | grep -c 'out\.md\.tmp'`
    absent
    1

EXPECTED
  local rc stdout
  stdout=$(printf 'not-the-spec\n' | bash "$self" --root "$tmp/repo" "$tmp/happy.spec" "$tmp/repo/out.md" 2>"$tmp/stderr"); rc=$?
  ck "v1 happy: exit 0" "$rc" 0
  ck "v1 happy: the count line comes from the parse (11 facts, 1 non-zero)" "$stdout" "$TAG: 11 fact(s), 1 with a non-zero exit -> $tmp/repo/out.md"
  ck "v1 happy: nothing on stderr" "$(cat "$tmp/stderr")" ""
  ckgrep "v1 happy: the header names OUT, a UTC stamp, the short sha, the branch, SPEC and the count" "$tmp/repo/out.md" \
    '^# out\.md -- measured [0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z on [0-9a-f]{7,} \(main\) from happy\.spec; 11 fact\(s\)$'
  tail -n +2 "$tmp/repo/out.md" > "$tmp/body.md"
  checks=$((checks + 1))
  if cmp -s "$tmp/body.md" "$tmp/expected.md"; then printf 'ok: v1 happy: the body is byte-identical to the expected sheet\n'
  else fails=$((fails + 1)); printf 'FAIL: v1 happy: the body differs from the expected sheet\n'; diff "$tmp/expected.md" "$tmp/body.md" | sed 's/^/    /'; fi

  # v2: header shapes -- an unborn repository, and a --root that is not a repository
  git -c init.defaultBranch=main init -q "$tmp/unborn"
  printf 'F1 x :: true\n' > "$tmp/one.spec"
  bash "$self" --root "$tmp/unborn" "$tmp/one.spec" "$tmp/unborn.md" >/dev/null 2>&1; rc=$?
  ck "v2 unborn repo: exit 0" "$rc" 0
  ckgrep "v2 unborn repo: header says unborn (main)" "$tmp/unborn.md" ' on unborn \(main\) from one\.spec; 1 fact\(s\)$'
  bash "$self" --root "$tmp/plain" "$tmp/one.spec" "$tmp/plain.md" >/dev/null 2>&1; rc=$?
  ck "v2 no-git root: exit 0" "$rc" 0
  ckgrep "v2 no-git root: header says no git (-)" "$tmp/plain.md" ' on no git \(-\) from one\.spec; 1 fact\(s\)$'

  # v3: the default root is the git toplevel of the cwd, not the cwd
  (cd "$tmp/repo/sub" && bash "$self" "$tmp/happy.spec" "$tmp/out2.md" >/dev/null 2>&1); rc=$?
  ck "v3 default root: exit 0 from a subdirectory" "$rc" 0
  ck "v3 default root: F7 ran at the toplevel" "$(grep -A1 '^F7 ' "$tmp/out2.md" | tail -1)" "    repo"
  (cd "$tmp/plain" && bash "$self" "$tmp/one.spec" "$tmp/out3.md" >/dev/null 2>"$tmp/stderr"); rc=$?
  ck "v3 no repository and no --root: exit 2" "$rc" 2
  ck "v3 no repository and no --root: OUT not written" "$([ -e "$tmp/out3.md" ] && echo present || echo absent)" absent
  ckgrep "v3 no repository and no --root: the message" "$tmp/stderr" 'not inside a git repository'

  # v4: refusals, each with exit 2, OUT absent and the message
  printf 'F1 the separator is missing\n' > "$tmp/r1.spec"
  refused "v4 no separator" "$tmp/r1.spec" "line 1: no ' :: ' separator" --root "$tmp/repo"
  printf 'F1 label :: echo a :: echo b\n' > "$tmp/r2.spec"
  refused "v4 a second separator after the split" "$tmp/r2.spec" "line 1: a second ' :: ' after the split" --root "$tmp/repo"
  printf 'F1 a :: true\nF1 b :: true\n' > "$tmp/r3.spec"
  refused "v4 duplicate id" "$tmp/r3.spec" 'line 2: fact id F1 already used' --root "$tmp/repo"
  printf 'F1 a :: \n' > "$tmp/r4.spec"
  refused "v4 empty command" "$tmp/r4.spec" 'line 1: empty COMMAND' --root "$tmp/repo"
  printf ' :: true\n' > "$tmp/r5.spec"
  refused "v4 empty label" "$tmp/r5.spec" 'line 1: empty LABEL' --root "$tmp/repo"
  printf '# only a comment\n\n' > "$tmp/r6.spec"
  refused "v4 zero facts" "$tmp/r6.spec" 'no facts in' --root "$tmp/repo"
  refused "v4 unreadable spec" "$tmp/does-not-exist.spec" 'cannot read spec' --root "$tmp/repo"
  printf 'F1 crlf :: true\r\n' > "$tmp/r8.spec"
  refused "v4 a CRLF line" "$tmp/r8.spec" 'line 1: carriage return at the end' --root "$tmp/repo"
  bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/one.spec" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 OUT is the spec: exit 2" "$rc" 2
  ckgrep "v4 OUT is the spec: the message" "$tmp/stderr" 'SPEC and OUT are the same file'
  ck "v4 OUT is the spec: the spec is intact" "$(cat "$tmp/one.spec")" 'F1 x :: true'
  rm -f "$tmp/nodir.md"
  bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/no-such-dir/out.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 missing output directory: exit 2" "$rc" 2
  ckgrep "v4 missing output directory: the message" "$tmp/stderr" 'output directory .* does not exist'
  bash "$self" --root "$tmp/not-a-dir" "$tmp/one.spec" "$tmp/nodir.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 --root not a directory: exit 2" "$rc" 2
  ckgrep "v4 --root not a directory: the message" "$tmp/stderr" 'is not a directory'
  # v5: every problem reported at once, and NO command has run when a spec is refused
  printf 'F1 runs a side effect :: touch %s/ran\nF2 the separator is missing\nF1 duplicate :: true\n' "$tmp" > "$tmp/r7.spec"
  refused "v5 combined" "$tmp/r7.spec" 'refused: 2 problem\(s\)' --root "$tmp/repo"
  ckgrep "v5 combined: the first problem is named" "$tmp/stderr" "line 2: no ' :: ' separator"
  ckgrep "v5 combined: the second problem is named" "$tmp/stderr" 'line 3: fact id F1 already used'
  ck "v5 combined: the side-effect command did not run" "$([ -e "$tmp/ran" ] && echo ran || echo 'did not run')" 'did not run'

  # v6: usage and --help; no temporary file left behind by any run above
  bash "$self" >/dev/null 2>&1; rc=$?
  ck "v6 no arguments: exit 2" "$rc" 2
  bash "$self" --help >"$tmp/help" 2>&1; rc=$?
  ck "v6 --help: exit 0" "$rc" 0
  ckgrep "v6 --help: prints the usage with bash in front of the path" "$tmp/help" '^usage: bash tools/fact-sheet\.sh'
  ck "v6 no temporary sheet left in any output directory" "$(find "$tmp" -maxdepth 2 -name '*.tmp.*' | wc -l | tr -d ' ')" 0

  rm -rf "$tmp"
  printf '%s --verify: %d check(s), %d failed\n' "$TAG" "$checks" "$fails"
  [ "$fails" -eq 0 ]
}

root=''; spec=''; out=''
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --verify) verify; exit $? ;;
    --root) [ $# -ge 2 ] || die "--root needs a directory"; root=$2; shift 2 ;;
    --root=*) root=${1#--root=}; shift ;;
    --) shift; break ;;
    -*) die "unknown option $1 (see --help)" ;;
    *) if [ -z "$spec" ]; then spec=$1; elif [ -z "$out" ]; then out=$1; else die "too many arguments: $1"; fi; shift ;;
  esac
done
while [ $# -gt 0 ]; do
  if [ -z "$spec" ]; then spec=$1; elif [ -z "$out" ]; then out=$1; else die "too many arguments: $1"; fi; shift
done
[ -n "$spec" ] && [ -n "$out" ] || { usage >&2; exit 2; }
[ -f "$spec" ] && [ -r "$spec" ] || die "cannot read spec $spec"
if [ -n "$root" ]; then
  [ -d "$root" ] || die "--root $root is not a directory"
else
  root=$(git rev-parse --show-toplevel 2>/dev/null) || die "not inside a git repository (pass --root DIR)"
fi
outdir=$(dirname -- "$out")
[ -d "$outdir" ] || die "output directory $outdir does not exist"
[ -w "$outdir" ] || die "output directory $outdir is not writable"
[ "$spec" -ef "$out" ] && die "SPEC and OUT are the same file"

# Phase 1: parse the whole spec; collect every problem; refuse all of them before anything runs.
ids=' '; n=0; ln=0; nproblems=0
labels=(); cmds=(); problems=()
while IFS= read -r line || [ -n "$line" ]; do
  ln=$((ln + 1))
  trimmed=${line#"${line%%[![:space:]]*}"}
  case "$trimmed" in ''|'#'*) continue ;; esac
  case "$line" in *$'\r') problems[nproblems]="line $ln: carriage return at the end of the line (a CRLF spec); save it with LF"; nproblems=$((nproblems + 1)); continue ;; esac
  case "$line" in
    *' :: '*) ;;
    *) problems[nproblems]="line $ln: no ' :: ' separator between LABEL and COMMAND"; nproblems=$((nproblems + 1)); continue ;;
  esac
  label=${line%% :: *}; cmd=${line#* :: }
  label=${label#"${label%%[![:space:]]*}"}; label=${label%"${label##*[![:space:]]}"}
  case "$cmd" in
    *' :: '*) problems[nproblems]="line $ln: a second ' :: ' after the split (if it belongs to the command, put the command in a script file and name the file)"; nproblems=$((nproblems + 1)); continue ;;
  esac
  cmdtrim=${cmd#"${cmd%%[![:space:]]*}"}
  if [ -z "$cmdtrim" ]; then problems[nproblems]="line $ln: empty COMMAND"; nproblems=$((nproblems + 1)); continue; fi
  if [ -z "$label" ]; then problems[nproblems]="line $ln: empty LABEL"; nproblems=$((nproblems + 1)); continue; fi
  id=${label%% *}
  case "$ids" in
    *" $id "*) problems[nproblems]="line $ln: fact id $id already used"; nproblems=$((nproblems + 1)); continue ;;
  esac
  ids="$ids$id "
  labels[n]=$label; cmds[n]=$cmd; n=$((n + 1))
done < "$spec"
if [ "$nproblems" -gt 0 ]; then
  i=0
  while [ "$i" -lt "$nproblems" ]; do printf '%s: %s: %s\n' "$TAG" "$spec" "${problems[$i]}" >&2; i=$((i + 1)); done
  printf '%s: refused: %d problem(s) in %s; nothing was run and %s was not written\n' "$TAG" "$nproblems" "$spec" "$out" >&2
  exit 2
fi
[ "$n" -gt 0 ] || die "no facts in $spec (a sheet of zero facts is the vacuous pass); nothing written"

# Phase 2: run every fact into OUT's temporary sibling, then rename it into place.
tmp="$out.tmp.$$"
trap 'rm -f -- "$tmp"' EXIT
trap 'exit 130' INT TERM
if git -C "$root" rev-parse --show-toplevel >/dev/null 2>&1; then
  sha=$(git -C "$root" rev-parse --short HEAD 2>/dev/null) || sha=unborn
  branch=$(git -C "$root" branch --show-current 2>/dev/null); [ -n "$branch" ] || branch=detached
else
  sha='no git'; branch='-'
fi
nonzero=0
{
  printf '# %s -- measured %s on %s (%s) from %s; %d fact(s)\n\n' "$(basename -- "$out")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$sha" "$branch" "$(basename -- "$spec")" "$n"
  i=0
  while [ "$i" -lt "$n" ]; do
    label=${labels[$i]}; cmd=${cmds[$i]}
    output=$(cd "$root" && bash -c "$cmd" </dev/null 2>&1); rc=$?
    status=''
    if [ "$rc" -ne 0 ]; then status=" (exit $rc)"; nonzero=$((nonzero + 1)); fi
    printf '%s: `%s`%s\n' "$label" "$cmd" "$status"
    if [ -z "$output" ]; then printf '    (no output)\n'; else printf '%s\n' "$output" | sed 's/^/    /'; fi
    printf '\n'
    i=$((i + 1))
  done
} > "$tmp" || die "could not write $tmp"
mv -f -- "$tmp" "$out" || die "could not rename $tmp to $out"
trap - EXIT
printf '%s: %d fact(s), %d with a non-zero exit -> %s\n' "$TAG" "$n" "$nonzero" "$out"
