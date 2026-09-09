#!/usr/bin/env bash
# fact-sheet.sh -- assemble a fact sheet from a spec of labelled commands: for every
# `LABEL :: COMMAND` line in SPEC, run COMMAND with bash from the repository root and record the
# label, the command and its output, so that every number, sha and status line a draft cites
# traces to a line a verifier can re-run.
#
# WHY THIS EXISTS
# ---------------
# Every pull request here since #807 has carried a fact sheet -- one line per claim, naming the
# command that produced it and quoting its output -- and the handoff rule reads "a claim in the
# handoff that traces to no line here is an assertion". The assembler behind those sheets was
# typed three times in the 2026-09-08 session: facts-wc.sh (#809, hand-coded blocks, one per
# fact), facts-mp.sh (#810, the same parametrised by PR number) and facts.sh (#813, the
# spec-driven shape this file promotes). CLAUDE.md § Tools says a snippet typed a second time
# becomes a file here; the day after the third typing a reboot cleared the scratchpad holding all
# three, and they were recovered from the session transcript (issue #816).
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
# CRLF spec would hand every command a trailing CR -- a one-word command is then "not found",
# a longer one fails inside its program with the CR glued to its last argument.
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
# a repository; the branch is `detached` when HEAD is (and, under a git older than 2.22, always,
# since `git branch --show-current` does not exist there). Two things the capture cannot keep:
# trailing newlines of an output are dropped, so `printf 'a\n\n\n'` records one line, and NUL
# bytes are dropped with bash's own warning on the tool's stderr, so `printf 'a\0b\n'` records
# `ab` and an output that is only NUL records `(no output)`. Everything else is verbatim.
#
# TWO PHASES
# ----------
# Phase 1 parses the whole spec and collects every problem -- no separator, a second one, a CRLF
# line ending, an empty label or command, a duplicate id -- then refuses all of them at once with
# exit 2, with nothing run and OUT untouched; a spec with zero facts is refused after that check
# (a sheet of no facts is the vacuous pass). Phase 2 runs the facts in order, builds the whole
# sheet in memory, writes it once to OUT's temporary sibling (so a failed write is the write's
# own exit status, not the status of whatever command came last), renames the sibling into place
# and reads OUT back against the bytes it wrote. An interrupted run leaves no half sheet. Every
# command's exit status is recorded in the sheet and none of them fails the tool: the sheet is
# the measurement, and a failed measurement is a fact about the run.
#
# EXIT CODES
# ----------
#     0    every fact ran; the sheet is at OUT and was read back byte for byte (read the label
#          lines for `(exit N)`); the success line on stdout is best effort -- a closed or dead
#          stdout does not change the exit
#     1    --verify only: a check failed
#     2    usage; an unreadable spec; a refused spec; no facts; no git root and no --root; --root
#          that is empty, missing, not a directory or cannot be entered; an output directory that
#          does not exist or cannot be written; OUT that is a directory, a symbolic link, or the
#          spec itself; a write, rename or
#          read-back failure (a read-back mismatch means OUT holds bytes the tool did not write:
#          treat the sheet as unwritten and run again)
#     130  interrupted (SIGINT) during phase 2; the temporary sibling is removed and OUT is
#          untouched, unless the signal lands after the rename, when the sheet at OUT is complete
#     143  terminated (SIGTERM) during phase 2, the same way
#
# USAGE
# -----
#     bash tools/fact-sheet.sh [--root DIR | --root=DIR] [--] SPEC OUT
#     bash tools/fact-sheet.sh --verify
#     bash tools/fact-sheet.sh --help
#
# --root DIR      run the commands from DIR (default: the git toplevel of the current directory;
#                 refused when there is none). A relative DIR is resolved once, without CDPATH.
#                 `--` ends the options, for a SPEC or OUT whose path begins with a dash.
#
# FAULT HOOK
# ----------
# FACT_SHEET_FAULT=write makes phase 2 write the sheet to /dev/full instead of the temporary
# sibling; FACT_SHEET_FAULT=rename renames the sibling into a directory that does not exist, so
# the sibling is left for the EXIT trap to remove; FACT_SHEET_FAULT=readback appends one byte to
# OUT after the rename, before the read-back. The three exist so that --verify can drive the
# failure paths that need a full disk, a vanished directory or a concurrent writer to reach
# otherwise. The hook is read on every run: a stray known value in the environment of a real run
# makes that run fail the way the fault says, and an unknown value is refused with its own
# message; neither is ever a silent success.
#
# --verify writes specs into a temporary directory holding a throwaway git repository and
# asserts: the happy sheet line by line (single-line, multi-line with a blank line, no output, a
# non-zero exit, `::` inside a command, stderr, the root as cwd, stdin fed to the tool and not
# reaching the command, leading whitespace on a line, trailing whitespace before the separator,
# trailing newlines, nothing at OUT or its sibling while the facts run) with its header stamp in
# UTC; the four header shapes (a commit, an unborn repository, a detached HEAD, no git); the
# default root; every spec refusal (exit 2, the message, OUT absent, and for the combined case
# that no command ran); every argument and path refusal the EXIT CODES list names, OUT absent
# wherever OUT could exist (the unwritable-directory and unreadable-spec arms are skipped when
# run as root, which can read and write anywhere, and the first also where chmod has no effect,
# as on a Windows mount); an un-enterable root; a symbolic-link OUT; a dash-led OUT through
# `--`; a closed stdout after a good sheet; the three fault-hook failures (the rename one proving
# the sibling is removed) and an unknown kind. Every run of the tool inside the self-test is
# under a 20 s timeout (the two signal arms under 1 s), so a hang reads as exit 124 and never as
# a pass, and the happy run is made under a POSIX TZ twelve hours off UTC (`TZ=XXX-12`, which
# needs no tzdata), so a stamp that is not UTC is caught on any host; an interrupted and a terminated run (exit 130
# and 143, OUT absent, no sibling left; the signals are delivered through `timeout`, because a
# background job of a non-interactive shell ignores SIGINT); and that no temporary file survives
# any of it. It exits by its own result
# (0 clean, 1 a check failed, 2 it could not set up). The whole self-test runs with stdin closed
# except for the one run that pipes a line in: a mutant dropping the tool's own `</dev/null`
# first hung the un-piped runs forever (F8's `read` waited on the checker's open stdin) rather
# than failing.
set -u
TAG=fact-sheet

usage() {
  cat <<'USAGE'
usage: bash tools/fact-sheet.sh [--root DIR | --root=DIR] [--] SPEC OUT
       bash tools/fact-sheet.sh --verify
       bash tools/fact-sheet.sh --help

SPEC holds one `LABEL :: COMMAND` line per fact (comments and blank lines skipped). Each COMMAND
runs as `bash -c` from the git toplevel (or --root DIR), stdin /dev/null, stderr merged, and its
output goes into OUT under the label (trailing newlines and NUL bytes excepted); a non-zero exit
is noted on the label line. The whole spec is parsed before anything runs, a bad line refuses the
lot with OUT untouched, and OUT is written once and read back.
USAGE
}

die() { printf '%s: %s\n' "$TAG" "$*" >&2; exit 2; }

# --verify: specs in a temporary directory, the sheet compared line by line, every refusal
# asserted for exit 2 AND an absent OUT wherever OUT could exist. Every case names what it pins.
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
  absent() { [ -e "$1" ] && echo present || echo absent; }
  refused() { # NAME SPEC-FILE EXPECTED-MESSAGE-PATTERN [ARGS...] -- run, expect exit 2, OUT absent, the message
    local name=$1 specf=$2 pat=$3 out="$tmp/refused.md" rc; shift 3
    rm -f "$out"
    timeout 20 bash "$self" "$@" "$specf" "$out" >"$tmp/stdout" 2>"$tmp/stderr"; rc=$?
    ck "$name: exit 2" "$rc" 2
    ck "$name: OUT not written" "$(absent "$out")" absent
    ckgrep "$name: the message" "$tmp/stderr" "$pat"
  }
  argrefused() { # NAME EXPECTED-MESSAGE-PATTERN ARGS... -- an argument refusal: exit 2 and the message
    local name=$1 pat=$2 rc; shift 2
    timeout 20 bash "$self" "$@" >"$tmp/stdout" 2>"$tmp/stderr"; rc=$?   # 20 s: a hang is exit 124, not 2
    ck "$name: exit 2" "$rc" 2
    ckgrep "$name: the message" "$tmp/stderr" "$pat"
  }

  git -c init.defaultBranch=main init -q "$tmp/repo" || { rm -rf "$tmp"; return 2; }
  git -C "$tmp/repo" -c user.name=verify -c user.email=verify@example.invalid commit -q --allow-empty -m init || { rm -rf "$tmp"; return 2; }
  mkdir -p "$tmp/repo/sub" "$tmp/plain"

  # v1: the happy sheet, line by line; OUT inside the root so a fact can look at its own sibling
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
F11 nothing is at OUT, sibling included, while the facts run :: [ -e out.md ] && echo present || echo absent; ls | grep -c 'out\.md'; true
F12 trailing whitespace before the separator is trimmed    :: printf 'y\n'
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

F11 nothing is at OUT, sibling included, while the facts run: `[ -e out.md ] && echo present || echo absent; ls | grep -c 'out\.md'; true`
    absent
    0

F12 trailing whitespace before the separator is trimmed: `printf 'y\n'`
    y

EXPECTED
  local rc stdout hour_before hour_after stamp
  hour_before=$(date -u +%Y-%m-%dT%H)
  stdout=$(printf 'not-the-spec\n' | TZ=XXX-12 timeout 20 bash "$self" --root "$tmp/repo" "$tmp/happy.spec" "$tmp/repo/out.md" 2>"$tmp/stderr"); rc=$?
  hour_after=$(date -u +%Y-%m-%dT%H)
  ck "v1 happy: exit 0" "$rc" 0
  ck "v1 happy: the count line comes from the parse (12 facts, 1 non-zero)" "$stdout" "$TAG: 12 fact(s), 1 with a non-zero exit -> $tmp/repo/out.md"
  ck "v1 happy: nothing on stderr" "$(cat "$tmp/stderr")" ""
  ckgrep "v1 happy: the header names OUT, a UTC stamp, the short sha, the branch, SPEC and the count" "$tmp/repo/out.md" \
    '^# out\.md -- measured [0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z on [0-9a-f]{7,} \(main\) from happy\.spec; 12 fact\(s\)$'
  stamp=$(sed -n '1s/.*measured \([0-9-]*T[0-9][0-9]\).*/\1/p' "$tmp/repo/out.md")
  checks=$((checks + 1))
  if [ "$stamp" = "$hour_before" ] || [ "$stamp" = "$hour_after" ]; then printf 'ok: v1 happy: the stamp is the UTC hour of the run\n'
  else fails=$((fails + 1)); printf 'FAIL: v1 happy: the stamp is the UTC hour of the run\n    expected: %s or %s\n    got:      %s\n' "$hour_before" "$hour_after" "$stamp"; fi
  tail -n +2 "$tmp/repo/out.md" > "$tmp/body.md"
  checks=$((checks + 1))
  if cmp -s "$tmp/body.md" "$tmp/expected.md"; then printf 'ok: v1 happy: the body is byte-identical to the expected sheet\n'
  else fails=$((fails + 1)); printf 'FAIL: v1 happy: the body differs from the expected sheet\n'; diff "$tmp/expected.md" "$tmp/body.md" | sed 's/^/    /'; fi

  # v2: header shapes -- an unborn repository, a detached HEAD, and a --root that is not a repository
  git -c init.defaultBranch=main init -q "$tmp/unborn"
  printf 'F1 x :: true\n' > "$tmp/one.spec"
  timeout 20 bash "$self" --root "$tmp/unborn" "$tmp/one.spec" "$tmp/unborn.md" >/dev/null 2>&1; rc=$?
  ck "v2 unborn repo: exit 0" "$rc" 0
  ckgrep "v2 unborn repo: header says unborn (main)" "$tmp/unborn.md" ' on unborn \(main\) from one\.spec; 1 fact\(s\)$'
  git -C "$tmp/repo" checkout -q --detach
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/detached.md" >/dev/null 2>&1; rc=$?
  git -C "$tmp/repo" checkout -q main
  ck "v2 detached HEAD: exit 0" "$rc" 0
  ckgrep "v2 detached HEAD: header says the sha and (detached)" "$tmp/detached.md" ' on [0-9a-f]{7,} \(detached\) from one\.spec; 1 fact\(s\)$'
  timeout 20 bash "$self" --root "$tmp/plain" "$tmp/one.spec" "$tmp/plain.md" >/dev/null 2>&1; rc=$?
  ck "v2 no-git root: exit 0" "$rc" 0
  ckgrep "v2 no-git root: header says no git (-)" "$tmp/plain.md" ' on no git \(-\) from one\.spec; 1 fact\(s\)$'

  # v3: the default root is the git toplevel of the cwd, not the cwd; no repository and no --root is refused
  (cd "$tmp/repo/sub" && timeout 20 bash "$self" "$tmp/happy.spec" "$tmp/out2.md" >/dev/null 2>&1); rc=$?
  ck "v3 default root: exit 0 from a subdirectory" "$rc" 0
  ck "v3 default root: F7 ran at the toplevel" "$(grep -A1 '^F7 ' "$tmp/out2.md" | tail -1)" "    repo"
  (cd "$tmp/plain" && timeout 20 bash "$self" "$tmp/one.spec" "$tmp/out3.md" >/dev/null 2>"$tmp/stderr"); rc=$?
  ck "v3 no repository and no --root: exit 2" "$rc" 2
  ck "v3 no repository and no --root: OUT not written" "$(absent "$tmp/out3.md")" absent
  ckgrep "v3 no repository and no --root: the message" "$tmp/stderr" 'not inside a git repository'

  # v4: spec refusals, each with exit 2, OUT absent and the message
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
  printf 'F1 crlf :: true\r\n' > "$tmp/r8.spec"
  refused "v4 a CRLF line" "$tmp/r8.spec" 'line 1: carriage return at the end' --root "$tmp/repo"
  # v4: path refusals -- the spec, the root, the output directory, OUT itself
  refused "v4 unreadable spec" "$tmp/does-not-exist.spec" 'cannot read spec' --root "$tmp/repo"
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/no-such-dir/out.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 missing output directory: exit 2" "$rc" 2
  ckgrep "v4 missing output directory: the message" "$tmp/stderr" 'output directory .* does not exist'
  timeout 20 bash "$self" --root "$tmp/not-a-dir" "$tmp/one.spec" "$tmp/nodir.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 --root does not exist: exit 2" "$rc" 2
  ck "v4 --root does not exist: OUT not written" "$(absent "$tmp/nodir.md")" absent
  ckgrep "v4 --root does not exist: the message" "$tmp/stderr" 'is not a directory'
  timeout 20 bash "$self" --root "$tmp/one.spec" "$tmp/one.spec" "$tmp/rootfile.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 --root is a file: exit 2" "$rc" 2
  ck "v4 --root is a file: OUT not written" "$(absent "$tmp/rootfile.md")" absent
  ckgrep "v4 --root is a file: the message" "$tmp/stderr" 'is not a directory'
  if [ "$(id -u)" -ne 0 ]; then
    mkdir -p "$tmp/nox" && chmod 600 "$tmp/nox"
    timeout 20 bash "$self" --root "$tmp/nox" "$tmp/one.spec" "$tmp/nox.md" >/dev/null 2>"$tmp/stderr"; rc=$?
    ck "v4 --root cannot be entered: exit 2" "$rc" 2
    ck "v4 --root cannot be entered: OUT not written" "$(absent "$tmp/nox.md")" absent
    ckgrep "v4 --root cannot be entered: the message" "$tmp/stderr" 'cannot be entered'
    chmod 700 "$tmp/nox"
    cp "$tmp/one.spec" "$tmp/unreadable.spec" && chmod 000 "$tmp/unreadable.spec"
    refused "v4 unreadable spec (mode 000)" "$tmp/unreadable.spec" 'cannot read spec' --root "$tmp/repo"
    chmod 600 "$tmp/unreadable.spec"
  else
    printf 'skip: v4 --root cannot be entered and v4 unreadable spec (mode 000): running as root, which can enter and read anything\n'
  fi
  ln -s "$tmp/one.spec" "$tmp/link.md"
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/link.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 OUT is a symbolic link: exit 2" "$rc" 2
  ckgrep "v4 OUT is a symbolic link: the message" "$tmp/stderr" 'is a symbolic link'
  ck "v4 OUT is a symbolic link: the link and its target are intact" "$([ -L "$tmp/link.md" ] && cat "$tmp/one.spec")" 'F1 x :: true'
  (cd "$tmp/repo" && timeout 20 bash "$self" --root "$tmp/repo" -- "$tmp/one.spec" -out.md >/dev/null 2>"$tmp/stderr"); rc=$?
  ck "v3 a dash-led OUT through --: exit 0" "$rc" 0
  ckgrep "v3 a dash-led OUT through --: the sheet is at -out.md and was read back" "$tmp/repo/-out.md" '^# -out\.md -- measured .* from one\.spec; 1 fact\(s\)$'
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/closed.md" >&- 2>"$tmp/stderr"; rc=$?
  ck "v3 stdout closed after a good sheet: exit 0" "$rc" 0
  ck "v3 stdout closed after a good sheet: the sheet is present" "$(absent "$tmp/closed.md")" present
  cp "$tmp/one.spec" "$tmp/same.spec"
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/same.spec" "$tmp/same.spec" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 OUT is the spec: exit 2" "$rc" 2
  ckgrep "v4 OUT is the spec: the message" "$tmp/stderr" 'SPEC and OUT are the same file'
  ck "v4 OUT is the spec: the spec is intact" "$(cat "$tmp/same.spec")" 'F1 x :: true'
  mkdir -p "$tmp/outdir"
  timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/outdir" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 OUT is a directory: exit 2" "$rc" 2
  ckgrep "v4 OUT is a directory: the message" "$tmp/stderr" 'is a directory'
  ck "v4 OUT is a directory: still a directory, nothing inside" "$([ -d "$tmp/outdir" ] && echo "dir with $(ls -A "$tmp/outdir" | wc -l | tr -d ' ') entries")" 'dir with 0 entries'
  if [ "$(id -u)" -ne 0 ] && { mkdir -p "$tmp/ro" && chmod 500 "$tmp/ro" && [ ! -w "$tmp/ro" ]; }; then
    timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/ro/out.md" >/dev/null 2>"$tmp/stderr"; rc=$?
    ck "v4 unwritable output directory: exit 2" "$rc" 2
    ck "v4 unwritable output directory: OUT not written" "$(absent "$tmp/ro/out.md")" absent
    ckgrep "v4 unwritable output directory: the message" "$tmp/stderr" 'is not writable'
    chmod 700 "$tmp/ro"
  else
    printf 'skip: v4 unwritable output directory (running as root, or chmod has no effect on this filesystem)\n'
  fi
  # v4: the three failure paths behind the fault hook -- a failed write, a failed rename, a
  # read-back mismatch -- and an unknown kind
  FACT_SHEET_FAULT=write timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/full.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 write failure (fault hook): exit 2" "$rc" 2
  ck "v4 write failure (fault hook): OUT not written" "$(absent "$tmp/full.md")" absent
  ckgrep "v4 write failure (fault hook): the message" "$tmp/stderr" 'could not write'
  FACT_SHEET_FAULT=readback timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/rb.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 read-back mismatch (fault hook): exit 2" "$rc" 2
  ckgrep "v4 read-back mismatch (fault hook): the message" "$tmp/stderr" 'read-back mismatch'
  FACT_SHEET_FAULT=rename timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/ren.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 rename failure (fault hook): exit 2" "$rc" 2
  ck "v4 rename failure (fault hook): OUT not written" "$(absent "$tmp/ren.md")" absent
  ckgrep "v4 rename failure (fault hook): the message" "$tmp/stderr" 'could not rename'
  ck "v4 rename failure (fault hook): the temporary sibling was removed" "$(find "$tmp" -name 'ren.md.tmp.*' | wc -l | tr -d ' ')" 0
  FACT_SHEET_FAULT=bogus timeout 20 bash "$self" --root "$tmp/repo" "$tmp/one.spec" "$tmp/bogus.md" >/dev/null 2>"$tmp/stderr"; rc=$?
  ck "v4 unknown fault kind: exit 2" "$rc" 2
  ck "v4 unknown fault kind: OUT not written" "$(absent "$tmp/bogus.md")" absent
  ckgrep "v4 unknown fault kind: the message" "$tmp/stderr" 'FACT_SHEET_FAULT'
  # v4: argument refusals
  argrefused "v4 unknown option" 'unknown option' --bogus "$tmp/one.spec" "$tmp/arg.md"
  argrefused "v4 bare --root" '--root needs a directory' "$tmp/one.spec" "$tmp/arg.md" --root
  argrefused "v4 empty --root" '--root needs a directory' --root '' "$tmp/one.spec" "$tmp/arg.md"
  argrefused "v4 empty --root=" '--root needs a directory' --root= "$tmp/one.spec" "$tmp/arg.md"
  argrefused "v4 too many arguments" 'too many arguments' --root "$tmp/repo" "$tmp/one.spec" "$tmp/arg.md" extra
  ck "v4 argument refusals: OUT never written" "$(absent "$tmp/arg.md")" absent
  # v5: every problem reported at once, and NO command has run when a spec is refused
  printf "F1 runs a side effect :: touch '%s/ran'\nF2 the separator is missing\nF1 duplicate :: true\n" "$tmp" > "$tmp/r7.spec"
  refused "v5 combined" "$tmp/r7.spec" 'refused: 2 problem\(s\)' --root "$tmp/repo"
  ckgrep "v5 combined: the first problem is named" "$tmp/stderr" "line 2: no ' :: ' separator"
  ckgrep "v5 combined: the second problem is named" "$tmp/stderr" 'line 3: fact id F1 already used'
  ck "v5 combined: the side-effect command did not run" "$([ -e "$tmp/ran" ] && echo ran || echo 'did not run')" 'did not run'

  # v6: usage and --help; an interrupted run; no temporary file left behind by any run above
  timeout 20 bash "$self" >/dev/null 2>&1; rc=$?
  ck "v6 no arguments: exit 2" "$rc" 2
  timeout 20 bash "$self" --help >"$tmp/help" 2>&1; rc=$?
  ck "v6 --help: exit 0" "$rc" 0
  ckgrep "v6 --help: prints the usage with bash in front of the path" "$tmp/help" '^usage: bash tools/fact-sheet\.sh'
  printf 'F1 slow :: sleep 3\n' > "$tmp/slow.spec"
  timeout --preserve-status -s INT 1 bash "$self" --root "$tmp/repo" "$tmp/slow.spec" "$tmp/slow.md" >/dev/null 2>&1; rc=$?
  ck "v6 interrupted run (SIGINT after 1 s): exit 130" "$rc" 130
  ck "v6 interrupted run (SIGINT): OUT not written" "$(absent "$tmp/slow.md")" absent
  timeout --preserve-status -s TERM 1 bash "$self" --root "$tmp/repo" "$tmp/slow.spec" "$tmp/slow2.md" >/dev/null 2>&1; rc=$?
  ck "v6 terminated run (SIGTERM after 1 s): exit 143" "$rc" 143
  ck "v6 terminated run (SIGTERM): OUT not written" "$(absent "$tmp/slow2.md")" absent
  ck "v6 no temporary sheet left in any output directory" "$(find "$tmp" -name '*.tmp.*' | wc -l | tr -d ' ')" 0

  rm -rf "$tmp"
  printf '%s --verify: %d check(s), %d failed\n' "$TAG" "$checks" "$fails"
  [ "$fails" -eq 0 ]
} </dev/null   # every un-piped run gets a closed stdin: a mutant that drops the tool's own
               # </dev/null then dies to the piped happy run instead of hanging the others on `read`

root=''; rootgiven=0; spec=''; out=''
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --verify) verify; exit $? ;;
    --root) [ $# -ge 2 ] || die "--root needs a directory"; root=$2; rootgiven=1; shift 2 ;;
    --root=*) root=${1#--root=}; rootgiven=1; shift ;;
    --) shift; break ;;
    -*) die "unknown option $1 (see --help)" ;;
    *) if [ -z "$spec" ]; then spec=$1; elif [ -z "$out" ]; then out=$1; else die "too many arguments: $1"; fi; shift ;;
  esac
done
while [ $# -gt 0 ]; do
  if [ -z "$spec" ]; then spec=$1; elif [ -z "$out" ]; then out=$1; else die "too many arguments: $1"; fi; shift
done
[ -n "$spec" ] && [ -n "$out" ] || { usage >&2; exit 2; }
fault=${FACT_SHEET_FAULT:-}
case "$fault" in ''|write|rename|readback) ;; *) die "FACT_SHEET_FAULT=$fault is not a fault this tool knows (write, rename, readback)" ;; esac
[ -f "$spec" ] && [ -r "$spec" ] || die "cannot read spec $spec"
if [ "$rootgiven" -eq 1 ]; then
  [ -n "$root" ] || die "--root needs a directory"
  [ -d "$root" ] || die "--root $root is not a directory"
else
  root=$(git rev-parse --show-toplevel 2>/dev/null) || die "not inside a git repository (pass --root DIR)"
fi
root=$(CDPATH= cd -P -- "$root" 2>/dev/null && pwd) || die "--root $root cannot be entered"
outdir=$(dirname -- "$out")
[ -d "$outdir" ] || die "output directory $outdir does not exist"
[ -w "$outdir" ] || die "output directory $outdir is not writable"
[ -L "$out" ] && die "OUT $out is a symbolic link"
[ -d "$out" ] && die "OUT $out is a directory"
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

# Phase 2: run every fact, build the sheet, write it once to OUT's temporary sibling, rename it
# into place, read it back.
tmp="$out.tmp.$$"
trap 'rm -f -- "$tmp"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if git -C "$root" rev-parse --show-toplevel >/dev/null 2>&1; then
  sha=$(git -C "$root" rev-parse --short HEAD 2>/dev/null) || sha=unborn
  branch=$(git -C "$root" branch --show-current 2>/dev/null); [ -n "$branch" ] || branch=detached
else
  sha='no git'; branch='-'
fi
nonzero=0
sheet=$(printf '# %s -- measured %s on %s (%s) from %s; %d fact(s)\n' "$(basename -- "$out")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$sha" "$branch" "$(basename -- "$spec")" "$n")
sheet="$sheet"$'\n\n'
i=0
while [ "$i" -lt "$n" ]; do
  label=${labels[$i]}; cmd=${cmds[$i]}
  output=$(cd "$root" && bash -c "$cmd" </dev/null 2>&1); rc=$?
  status=''
  if [ "$rc" -ne 0 ]; then status=" (exit $rc)"; nonzero=$((nonzero + 1)); fi
  if [ -z "$output" ]; then block='    (no output)'; else block="    ${output//$'\n'/$'\n'    }"; fi
  sheet="$sheet$label: \`$cmd\`$status"$'\n'"$block"$'\n\n'
  i=$((i + 1))
done
target=$tmp
[ "$fault" = write ] && target=/dev/full
printf '%s' "$sheet" > "$target" || die "could not write $tmp"
dest=$out
[ "$fault" = rename ] && dest="$tmp.nowhere/$(basename -- "$out")"
mv -f -- "$tmp" "$dest" || die "could not rename $tmp to $out"
[ "$fault" = readback ] && printf 'x' >> "$out"
printf '%s' "$sheet" | cmp -s -- - "$out" || die "read-back mismatch: $out does not hold the bytes written; treat it as unwritten and run again"
trap - EXIT
printf '%s: %d fact(s), %d with a non-zero exit -> %s\n' "$TAG" "$n" "$nonzero" "$out" 2>/dev/null || true
