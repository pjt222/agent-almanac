#!/usr/bin/env bash
# mutation-envelope.sh — run a LIST of mutants under one test command and print a verdict table.
#
# WHY
# ---
# `scripts/mutation-check.js` proves one line at a time, and that is the right unit for it. What
# a review round actually needs is a set: one mutant per claim, all under the command CI runs, in
# a table a PR body can quote. In the #874 session that loop was typed four times as a throwaway
# heredoc — mutants-r2, -r3, -r4, -final — and each rewrite lost something the previous one had
# learned. The fourth one is this file.
#
# What it adds over calling the checker in a `for` loop by hand:
#
#   - ONE test command for every row, named once at the top. A count taken under a single test
#     file and a count taken under `npm run test:scripts` are different numbers, and #874 shipped
#     a table mixing them: two rows were wrong, and a `--allow-broad` waiver in the prose turned
#     out to be an artefact of the narrow command rather than a property of the mutant.
#   - A verdict per row, and a FAILING exit when any row is not a clean kill. A survivor is the
#     finding — in #874 one survived and exposed a test arm asserting the right answer for the
#     wrong reason — and a survivor scrolling past in a wall of output is a finding nobody reads.
#   - The separator trap, refused up front: `mutation-check --replace` splits on the FIRST `::`.
#     When `::` occurs exactly once in a row's `<old>::<new>` field, that split is the only one.
#     When it occurs more than once, the split the checker takes may not be the one the plan
#     meant. Since #950 the checker itself refuses a run of three colons and an empty <old>, but
#     two `::` apart (`a::b::c`) it still splits at the first without a warning, so this envelope
#     refuses every row holding `::` more than once by name, the run of three included (an empty
#     <old> it passes to the checker, which refuses it; #947). Single colons are not the
#     separator: an OLD such as `write(dir, { 'a.md': '# a\n', 'b.md': '# b\n' });` is measured
#     like any other.
#     Until #903 this guard cut the field at the first `::` and then looked for `::` in what was
#     left, which the cut had already removed, so it never fired on the case it was written for,
#     and it refused any OLD holding two single colons. Rows are read from the plan as TAB-separated
#     fields rather than as shell words, so no quoting reaches the needle.
#   - Every row is checked before any mutant is measured. One refused row stops the run before
#     the first checker cycle, every refused row is named in the same run, and no measuring time
#     is spent on a table that could not be finished (#903). The plan is read once, into memory,
#     and the check and the run both read that copy: a plan given as a pipe (`--plan <(...)`,
#     `--plan /dev/stdin`) is measured like a file, and an edit to the plan file during a run is
#     not seen by that run. A last row with no trailing newline is read like any other; `read`
#     alone drops it, and a one-row plan then reported `0 row(s), 0 not a clean kill` and exited 0.
#
# It is NOT a gate. It mutates a tree and restores it, it takes minutes, and it needs a green
# baseline — `scripts/mutation-check.js` refuses without one. By default the tree is a fresh
# detached worktree of a commit, not your checkout, which subagents and peer sessions share; run
# it from the directory your plan's paths are relative to (the repository root, usually), by hand
# or from a session, when a table of claims needs measuring.
#
# USAGE
#     bash tools/mutation-envelope.sh --test '<command>' --plan <plan-file> [--out <dir>]
#                                     [--tree worktree|archive|in-place] [--at <rev>]
#     bash tools/mutation-envelope.sh --verify    # self-test in a throwaway repo
#
#   --test CMD    the command every mutant is measured under; name the one CI runs
#   --plan FILE   the mutants, in one of two forms, read once, so a pipe works and an edit made
#                 during the run is not seen:
#                 TAB   one per line: <id><TAB><file><TAB><old>::<new>, passed as --replace;
#                       blank lines and lines starting with `#` are ignored; `::` must occur
#                       exactly once in the last field, so an OLD ending in `:` or holding `::`,
#                       a NEW starting with `:` or holding `::`, and any needle spanning lines
#                       cannot be planned in this form: use JSON
#                 JSON  when the first non-blank character is `[`: an array of rows
#                       {"id": …, "file": …, "from": …, "to": …}, each passed as
#                       --from <from> --to <to>, so either may hold newlines and any colons;
#                       `to` may be empty (a deletion), `from` may not; a row holds exactly
#                       those four string keys, and ids are unique and hold no `/`, tab or
#                       newline. A TAB plan whose first id begins with `[` is read as JSON, and
#                       refused when it does not parse.
#   --tree MODE   which tree is mutated (S1):
#                 worktree  (default) a detached worktree of <rev> in a fresh mktemp -d, with
#                           node_modules, viz/node_modules and viz/renv/library linked from your
#                           checkout when it has them; unlinked and removed at the end, its own
#                           registration only (the repository's worktrees are never pruned)
#                 archive   `git archive <rev>` extracted into a fresh mktemp -d and committed as
#                           a one-commit repository of its own, the same links made after that
#                           commit; removed at the end. A process standing in it cannot reach
#                           your repository's .git at all. It has no history, refs or remotes:
#                           a --test that reads git history (a merge-base, an English-history
#                           walk) measures something else there than in a worktree
#                 in-place  your working tree, uncommitted edits included, mutated and restored
#                           row by row, each row running its own baseline, as before S1;
#                           --at is refused beside it
#                 In worktree and archive mode the run is refused while your checkout has
#                 tracked changes or untracked, non-ignored files (the three link paths above
#                 excepted when they are symlinks): the fresh tree would not hold them, and a
#                 mutant that an uncommitted test would kill would read as SURVIVED. Commit
#                 them, or use --tree in-place. The run moves to the same subdirectory of the
#                 fresh tree that it was started in, so a plan's relative paths mean the same
#                 in every mode. The measured commit is printed and heads names.tsv.
#   --at REV      the commit a fresh tree is made from (default: HEAD)
#   --out DIR     where the per-row logs land (default: a fresh mktemp -d, printed at the end);
#                 refused when it is inside the measured tree, where each log would change the
#                 tree a reused baseline was recorded over
#
# ONE BASELINE. In worktree and archive mode the baseline runs once per table, not once per row
# (in place, every row runs its own, as before S1): the checker records it
# (--write-baseline) and every row reuses the record (--baseline), which the checker refuses
# unless HEAD, the directory, the tree's status and the --test string all still match it. N rows cost N + 1
# suite runs, not 2N. After each row the row's file must be byte-identical (git hash-object
# --no-filters) and
# the tree's status unchanged, or the table stops at that row.
#
# NAMES. Under each row the table prints the failing leaf tests that row's mutant added over the
# baseline, as `+ <name>` lines, read by the checker from what the --test command already prints
# (node:test, either reporter; no reporter flag is added, so the command measured is the command
# named). "names: none added over the baseline" (a red run that failed no node:test test) and
# "names: could not be read (<run>)" (no node:test summary to read) are different findings. The
# same names land in <out>/names.tsv, one row per mutant: id, verdict, added count (or
# `unreadable:<run>`, or `-` for a row with no mutant verdict), names joined by ` | `. A name
# that itself holds ` | ` makes that column ambiguous; <out>/<id>.names.json is exact.
#
# Exit 0 when every row is `MUTANT KILLED`. Exit 1 when any row survives, is SUSPECT, INVALID,
# HUNG or INCONCLUSIVE, or printed no verdict line at column 0 — read that row's log before
# quoting anything. Names never change the exit code. Exit 2 when the envelope itself
# could not run: no plan, an unreadable plan, a plan with no rows, any row the plan check
# refuses (a missing field, no `::`, or `::` more than once; for JSON, the refusals listed under
# --plan), not a git repository, an --out inside the measured tree, or a baseline that is red,
# hangs or cannot be recorded. Each of those is reached before the first mutant is measured.
# Two exits 2 come after measuring has begun: a row that did not leave the tree as it found it
# (the table stops at that row), and a run that measured a different number of rows than the
# plan check counted: the run did not read the plan the check read (a checker that reads its
# stdin drains the rows after its own). Do not quote the table after either.
set -uo pipefail

# Resolved once, absolutely, and used for both the self-test's fixture and the checker call: an
# `npm run mutation-check` would depend on the CALLER's package.json, which the self-test's
# throwaway repository does not have — the first version did exactly that and reported two rows
# with no verdict at all.
SELF=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")
REPO=$(cd "$(dirname "$SELF")/.." && pwd)
CHECKER="$REPO/scripts/mutation-check.js"

# The separator, held in a variable so that no line of the plan check spells it out. A mutant of
# that check measured through this envelope is a `--replace <old>::<new>` row, and a needle
# holding `::` is exactly the ambiguity the check refuses: spelling it inline would make the
# guard impossible to mutate through the envelope (#783, one level down). A JSON plan row, whose
# from and to are passed as --from/--to (#950), carries such a needle.
SEP='::'

# Prints why a plan row is refused, or nothing when it may be measured.
row_problem() {
  local file=$1 mutation=$2
  if [ -z "$file" ] || [ -z "$mutation" ]; then
    printf 'malformed row (want <id><TAB><file><TAB><old>%s<new>)' "$SEP"
    return
  fi
  case "$mutation" in *"$SEP"*) : ;; *)
    printf "no '%s' separator in its <old>%s<new> field" "$SEP" "$SEP"
    return ;;
  esac
  # `mutation-check --replace` splits at the FIRST separator. With one occurrence that is the
  # only split there is. With two apart, it may not be the split the plan meant, and the
  # checker applies it without a warning; a run of three colons the checker refuses itself since
  # #950. This check refuses both before anything is measured. The test reads the WHOLE field:
  # until #903 it cut the field at the first separator and then looked for one in what was
  # left, which the cut had already removed, so it could never fire, and its pattern (any two
  # single colons) refused OLD text that held no separator at all.
  case "$mutation" in *"$SEP"*"$SEP"*|*"$SEP":*)
    printf "'%s' occurs more than once in its <old>%s<new> field (a run of three colons counts); mutation-check --replace refuses a run of three, and splits a value with two '%s' apart at the first one, which may not be the split the plan meant; plan this mutant as a row of a JSON plan instead, whose from and to are passed as --from/--to" "$SEP" "$SEP" "$SEP"
    return ;;
  esac
}

TEST_CMD=""
PLAN=""
OUT=""
TREE_MODE=worktree
AT=""
VERIFY=0

while [ $# -gt 0 ]; do
  # A value flag given last has no value, and `shift 2` then fails without shifting: the loop
  # spun forever on a trailing --tree, and on a trailing --test, --plan or --out before S1.
  case "$1" in
    --test|--plan|--out|--tree|--at) [ $# -ge 2 ] || { echo "mutation-envelope: $1 needs a value" >&2; exit 2; } ;;
  esac
  case "$1" in
    --test) TEST_CMD=${2:-}; shift 2 ;;
    --plan) PLAN=${2:-}; shift 2 ;;
    --out) OUT=${2:-}; shift 2 ;;
    --tree) TREE_MODE=${2:-}; shift 2 ;;
    --at) AT=${2:-}; [ -n "$AT" ] || { echo "mutation-envelope: --at needs a revision" >&2; exit 2; }; shift 2 ;;
    --verify) VERIFY=1; shift ;;
    -h|--help) awk '/^set -uo pipefail$/ { exit } { print }' "$0"; exit 0 ;;
    *) echo "mutation-envelope: unknown argument: $1" >&2; exit 2 ;;
  esac
done

# ── the self-test ────────────────────────────────────────────────────────────────────────────
# A throwaway repository with one covered line and one uncovered line, so BOTH verdicts are
# exercised: a table that can only report kills would pass this file's own contract while being
# unable to report the finding it exists for.
if [ "$VERIFY" -eq 1 ]; then
  # $SELF and $REPO are resolved at the top of this file, BEFORE any cd: the first version took
  # `BASH_SOURCE` relative, changed directory into the fixture, and could not find a single file
  # it needed — every `cp` failed and the run reported exit 127 rather than a verdict.
  DIR=$(mktemp -d)
  trap 'rm -rf "${DIR:?}"' EXIT
  cd "${DIR:?}" || exit 2
  # A caller's GIT_* reaches every git below. With GIT_DIR and GIT_WORK_TREE exported by the
  # caller, the fixture's `git init` and `git config user.*` wrote into the CALLER's repository
  # (#930 round 2), so the line after the decoy unsets every GIT_*. The decoy, exported first, is
  # all a CI run gives the check after the fixture commit to see: GIT_DIR, GIT_WORK_TREE,
  # GIT_CONFIG_COUNT/KEY_0/VALUE_0, and GIT_INDEX_FILE, which names the decoy path so a leaked one
  # writes the fixture's index there. Of those, GIT_DIR, GIT_WORK_TREE, GIT_CONFIG_COUNT and
  # GIT_INDEX_FILE are pinned one by one; KEY_0/VALUE_0 are inert without GIT_CONFIG_COUNT, so a
  # scrub that leaves only them set passes too. A scrub that lists those four names passes the
  # check as well as this one does (#930 round 3).
  export GIT_DIR="${DIR:?}/decoy.git" GIT_WORK_TREE="${DIR:?}/decoy" GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=user.name GIT_CONFIG_VALUE_0=decoy GIT_INDEX_FILE="${DIR:?}/decoy.git"
  unset "${!GIT_@}"
  export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"

  # ── the plan check, against a stub checker ──
  # Seconds, not minutes. The stub records the --replace value it is handed and reports a kill,
  # so these arms see only what the envelope decides before a checker runs: which rows it
  # refuses, what it says, and whether one refusal anywhere stops every checker call. They run
  # first, so a mutant of the plan check dies here instead of after the full cycle below.
  STUB="${DIR:?}/stub"
  mkdir -p "${STUB:?}/tools" "${STUB:?}/scripts" "${STUB:?}/plans" || exit 2
  cp "$SELF" "${STUB:?}/tools/mutation-envelope.sh" || exit 2
  printf '{ "type": "commonjs" }\n' > "${STUB:?}/package.json"
  cat > "${STUB:?}/scripts/mutation-check.js" <<'JS'
const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
const value = (flag) => argv[argv.indexOf(flag) + 1];
const here = (name) => path.join(__dirname, '..', name);
// A baseline call is counted apart from row calls, in baselines.log, so every arm's row count
// means what it meant before the baseline moved out of the rows (S1).
if (argv.includes('--write-baseline')) {
  fs.appendFileSync(here('baselines.log'), 'baseline\n');
  // As the real checker: a baseline is recorded only over a tree with no tracked change.
  if (require('child_process').execSync('git status --porcelain --untracked-files=no', { encoding: 'utf8' }).trim()) {
    console.log('ERROR: a baseline is recorded only over a clean tree');
    process.exit(1);
  }
  if (process.env.STUB_RED_BASELINE) {
    console.log('ERROR: Baseline is already failing (exit 1). Fix that first');
    process.exit(1);
  }
  fs.writeFileSync(value('--write-baseline'), '{}\n');
  console.log('      green (5 passing).');
  process.exit(0);
}
if (!argv.includes('--baseline') || value('--baseline') !== process.env.STUB_WANT_BASELINE) {
  fs.appendFileSync(here('unbaselined.log'), `${value('--baseline')}\n`);
}
const calls = here('calls.log');
const first = !fs.existsSync(calls);
// One line per call: a --replace value as handed over, or a --from/--to pair JSON-encoded, so a
// needle holding a newline stays on its line and an empty `to` stays visible.
fs.appendFileSync(calls, (argv.includes('--replace') ? value('--replace') : `FROM ${JSON.stringify(value('--from'))} TO ${JSON.stringify(value('--to'))}`) + '\n');
// On its first call, append a row the plan check refuses to the plan file it is told about.
if (first && process.env.STUB_APPEND_TO) fs.appendFileSync(process.env.STUB_APPEND_TO, 'late\tsrc.js\ta::b::c\n');
// On its first call, read stdin to the end, as a checker that prompted for input would.
if (first && process.env.STUB_READ_STDIN) fs.readFileSync(0);
// The names record the envelope asked for, when the arm supplies one.
const namesOut = argv.includes('--names-out') ? argv[argv.indexOf('--names-out') + 1] : null;
if (namesOut && process.env.STUB_NAMES) fs.writeFileSync(namesOut, process.env.STUB_NAMES);
// A tree `worktree remove --force` cannot remove: locked. With STUB_FOREIGN_ADMIN its admin
// directory's gitdir is also pointed elsewhere, as when a peer's worktree reused the name.
if (process.env.STUB_LOCK && first) {
  const cp = require('child_process');
  cp.execFileSync('git', ['worktree', 'lock', process.cwd()]);
  if (process.env.STUB_FOREIGN_ADMIN) {
    const admin = cp.execFileSync('git', ['rev-parse', '--absolute-git-dir'], { encoding: 'utf8' }).trim();
    fs.writeFileSync(path.join(admin, 'gitdir'), `${process.env.STUB_FOREIGN_ADMIN}\n`);
  }
}
// What a row sees from where it runs: the lent node_modules, and its working directory.
if (process.env.STUB_SEE_LINK) fs.appendFileSync(here('seen.log'), fs.existsSync('node_modules/marker') ? 'LINK-VISIBLE\n' : 'LINK-ABSENT\n');
if (process.env.STUB_PWD) fs.appendFileSync(here('pwd.log'), `${process.cwd()}\n`);
// A checker that does not put the tree back: the row's file changed, or a stray file left.
if (process.env.STUB_DIRTY) fs.appendFileSync(value('--file'), 'dirty\n');
if (process.env.STUB_CRLF) fs.writeFileSync(value('--file'), fs.readFileSync(value('--file'), 'utf8').replace(/\n/g, '\r\n'));
// An edit git status cannot see: the file is flagged assume-unchanged first.
if (process.env.STUB_HIDDEN) {
  require('child_process').execFileSync('git', ['update-index', '--assume-unchanged', '--', value('--file')]);
  fs.appendFileSync(value('--file'), 'hidden\n');
}
if (process.env.STUB_STRAY) fs.writeFileSync('stray.txt', 'stray\n');
// A checker that dies after printing a name holding a verdict word, before any verdict line.
if (process.env.STUB_NO_VERDICT) {
  console.log('        ✖ reports MUTANT KILLED in its name  (x.test.js)');
  process.exit(1);
}
console.log('MUTANT KILLED by 1 failing test(s)');
JS
  # The arms run inside a repository of their own: the envelope measures a git tree. Its logs,
  # plans and the stub's counters all sit outside it, in ${STUB}.
  REPO_ARMS="${STUB:?}/repo"
  mkdir -p "${REPO_ARMS:?}" || exit 2
  printf 'x\ny\n' > "${REPO_ARMS:?}/src.js"
  printf '* text=auto eol=lf\n' > "${REPO_ARMS:?}/.gitattributes" # as this repository declares
  { git -C "${REPO_ARMS:?}" init -q -b main && git -C "${REPO_ARMS:?}" config user.email t@example.invalid \
    && git -C "${REPO_ARMS:?}" config user.name fixture && git -C "${REPO_ARMS:?}" add src.js .gitattributes \
    && git -C "${REPO_ARMS:?}" commit -qm arms; } >/dev/null 2>&1 || { echo "mutation-envelope --verify: FAILED — could not build the arms' repository" >&2; exit 1; }
  export STUB_WANT_BASELINE="${STUB:?}/logs/baseline.json"
  ARMS_FAILED=0
  ARM_ARGS=() # extra flags for the next arms, such as --tree in-place
  # arm <name> <plan> <wanted exit> <wanted checker calls> <text stderr must carry, or ''>
  arm() {
    rm -f "${STUB:?}/calls.log" "${STUB:?}/baselines.log" "${STUB:?}/unbaselined.log" "${STUB:?}/seen.log" "${STUB:?}/pwd.log"
    (cd "${REPO_ARMS:?}" && bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$2" --out "${STUB:?}/logs" "${ARM_ARGS[@]}") \
      > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
    local rc=$? calls=0
    [ -f "${STUB:?}/calls.log" ] && calls=$(wc -l < "${STUB:?}/calls.log")
    if [ "$rc" -eq "$3" ] && [ "$calls" -eq "$4" ] && { [ -z "$5" ] || grep -qF -- "$5" "${STUB:?}/err.log"; }; then
      echo "  ok    $1"
    else
      echo "  FAIL  $1: want exit $3 and $4 checker call(s)${5:+ and stderr carrying: $5}; got exit $rc and $calls call(s)" >&2
      sed 's/^/        /' "${STUB:?}/err.log" >&2
      ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  }
  row() { printf '%s\t%s\t%s' "$1" "$2" "$3"; }
  P="${STUB:?}/plans"

  # The #886 needle: two single colons in OLD, one separator. Refused until #903.
  F886="write(dir, { 'a.md': '# a\\n', 'b.md': '# b\\n' });::write(dir, { 'a.md': '# a\\n' });"
  { row single-colons src.js "$F886"; echo; } > "$P/single-colons.tsv"
  arm accept-single-colons "$P/single-colons.tsv" 0 1 ''
  if [ "$(cat "${STUB:?}/calls.log" 2>/dev/null)" = "$F886" ]; then
    echo "  ok    accept-single-colons-verbatim"
  else
    echo "  FAIL  accept-single-colons-verbatim: the checker was not handed the field unchanged" >&2
    ARMS_FAILED=$((ARMS_FAILED + 1))
  fi

  { row two-apart src.js 'a::b::c'; echo; } > "$P/two-apart.tsv"
  arm refuse-two-separators "$P/two-apart.tsv" 2 0 "row 'two-apart': '::' occurs more than once"

  { row three-colons src.py 'def f():::def f()'; echo; } > "$P/three-colons.tsv"
  arm refuse-three-colons "$P/three-colons.tsv" 2 0 "row 'three-colons': '::' occurs more than once"

  { row no-separator src.js 'a:b'; echo; } > "$P/no-separator.tsv"
  arm refuse-no-separator "$P/no-separator.tsv" 2 0 "row 'no-separator': no '::' separator"

  printf 'short-row\tsrc.js\n' > "$P/malformed.tsv"
  arm refuse-malformed "$P/malformed.tsv" 2 0 "row 'short-row': malformed row"

  # A good row first and a refused row last: nothing may be measured, not even the good row.
  { row good src.js 'x::y'; echo; row bad-last src.js 'a::b::c'; echo; } > "$P/good-then-bad.tsv"
  arm refuse-before-any-measurement "$P/good-then-bad.tsv" 2 0 "1 of 2 row(s) refused"

  # Two refused rows: both named in one run.
  { row bad-one src.js 'a::b::c'; echo; row bad-two src.js 'a:b'; echo; } > "$P/two-bad.tsv"
  arm name-every-refused-row "$P/two-bad.tsv" 2 0 "row 'bad-two'"

  # No trailing newline on the last row, in the run loop and in the plan check.
  row last-good src.js 'x::y' > "$P/no-newline.tsv"
  arm read-last-row-without-newline "$P/no-newline.tsv" 0 1 ''
  { row good src.js 'x::y'; echo; row last-bad src.js 'a::b::c'; } > "$P/no-newline-bad.tsv"
  arm check-last-row-without-newline "$P/no-newline-bad.tsv" 2 0 "row 'last-bad'"

  { row ../escapes src.js 'x::y'; echo; } > "$P/slash-id.tsv"
  arm refuse-slash-in-id "$P/slash-id.tsv" 2 0 "row '../escapes': its id holds '/'"

  printf '# a comment\n\n' > "$P/empty.tsv"
  arm refuse-empty-plan "$P/empty.tsv" 2 0 "the plan holds no rows"

  # The plan is read once. A pipe can be read only once, so a second read of it, by the run
  # after the check, finds nothing: both rows must be measured, not `0 row(s)` with exit 0.
  { row pipe-one src.js 'x::y'; echo; row pipe-two src.js 'p::q'; echo; } > "$P/two-good.tsv"
  arm read-plan-from-fifo <(cat "$P/two-good.tsv") 0 2 ''
  arm read-plan-from-stdin /dev/stdin 0 2 '' < <(cat "$P/two-good.tsv")
  # A row appended to the plan file during the run is not measured: the stub appends one the
  # plan check would refuse, on its first call.
  { row before-edit src.js 'x::y'; echo; } > "$P/edited-mid-run.tsv"
  export STUB_APPEND_TO="$P/edited-mid-run.tsv"
  arm ignore-plan-edited-mid-run "$P/edited-mid-run.tsv" 0 1 ''
  unset STUB_APPEND_TO
  # A plan path that passes `-r` but cannot be read as a file.
  arm refuse-unreadable-plan "$P" 2 0 "cannot read plan"
  # The run loop's here-string is the checker's stdin. A checker that reads stdin drains the rows
  # not yet measured, and the run then reported `1 row(s), 0 not a clean kill` with exit 0 for a
  # three-row plan. The row-count check after the run turns that into exit 2.
  { row drain-one src.js 'x::y'; echo; row drain-two src.js 'p::q'; echo; row drain-three src.js 'm::n'; echo; } > "$P/three-good.tsv"
  export STUB_READ_STDIN=1
  arm refuse-plan-drained-by-checker "$P/three-good.tsv" 2 1 "measured 1 of 3 planned row(s)"
  unset STUB_READ_STDIN

  # stdout must carry <text>, after the last arm: for what the table prints rather than refuses.
  printed() {
    if grep -qF -- "$2" "${STUB:?}/$3"; then
      echo "  ok    $1"
    else
      echo "  FAIL  $1: ${3} does not carry: $2" >&2
      sed 's/^/        /' "${STUB:?}/$3" >&2
      ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  }
  { row named src.js 'x::y'; echo; } > "$P/one-good.tsv"
  # A name holding a verdict word, printed by a checker that then died with no verdict line, is
  # not a verdict: the row is not a clean kill, and it is counted once.
  export STUB_NO_VERDICT=1
  arm verdict-line-is-anchored "$P/one-good.tsv" 1 1 ''
  printed verdict-line-is-anchored-row "named                    <no verdict line" out.log
  printed verdict-line-counted-once "1 row(s), 1 not a clean kill" out.log
  unset STUB_NO_VERDICT
  # The names a row added are printed under it and recorded in names.tsv; an unreadable record
  # says so instead.
  export STUB_NAMES='{"readable":true,"added":[{"file":"s.test.js","name":"a named leaf"},{"file":"s.test.js","name":"a second leaf"}],"unreadable":null}'
  arm names-under-row "$P/one-good.tsv" 0 1 ''
  printed names-under-row-printed "   + a second leaf" out.log
  printed names-in-names-tsv "$(printf 'named\tMUTANT KILLED by 1 failing test(s)\t2\ta named leaf | a second leaf')" logs/names.tsv
  export STUB_NAMES='{"readable":false,"added":null,"unreadable":"mutant"}'
  arm names-unreadable "$P/one-good.tsv" 0 1 ''
  printed names-unreadable-printed "names: could not be read (mutant)" out.log
  export STUB_NAMES='{"readable":true,"added":[],"unreadable":null}'
  arm names-none-added "$P/one-good.tsv" 0 1 ''
  printed names-none-added-printed "names: none added over the baseline" out.log
  unset STUB_NAMES

  # ── JSON plans (S1) ──
  # Handed over verbatim as --from/--to: a needle holding `::`, ending in `:`, ending in a
  # newline, and an empty `to`, which `$(...)` and a TAB-split `read` would each have mangled.
  # The leading blank line is part of the arm: the `[` test skips leading whitespace.
  cat > "$P/verbatim.json" <<'JSON'

  [
    { "id": "colons-and-newline", "file": "src.js", "from": "a::b\nc:", "to": "" },
    { "id": "trailing-newline", "file": "src.js", "from": "line one\n", "to": ":new::" }
  ]
JSON
  arm json-accept "$P/verbatim.json" 0 2 ''
  if [ "$(cat "${STUB:?}/calls.log" 2>/dev/null)" = "$(printf '%s\n%s' 'FROM "a::b\nc:" TO ""' 'FROM "line one\n" TO ":new::"')" ]; then
    echo "  ok    json-verbatim"
  else
    echo "  FAIL  json-verbatim: the checker was not handed --from/--to unchanged:" >&2
    sed 's/^/        /' "${STUB:?}/calls.log" >&2
    ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  # Every refused row is named in one run, a good row among them is not measured either.
  cat > "$P/refused.json" <<'JSON'
[
  { "id": "good", "file": "src.js", "from": "x", "to": "y" },
  "a string",
  { "id": "typo", "file": "src.js", "form": "x", "to": "y" },
  { "id": "no-to", "file": "src.js", "from": "x" },
  { "id": "empty-from", "file": "src.js", "from": "", "to": "y" },
  { "id": "good", "file": "src.js", "from": "p", "to": "q" },
  { "id": "a/b", "file": "src.js", "from": "x", "to": "y" },
  { "id": "nul", "file": "src.js", "from": "x\u0000", "to": "y" }
]
JSON
  arm json-refuse-before-any-measurement "$P/refused.json" 2 0 "7 of 8 row(s) refused"
  for expected in "row '#2': not an object" "row 'typo': unknown key(s) form" "row 'no-to': \"to\" is missing" \
    "row 'empty-from': \"from\" is empty" "row 'good': \"id\" repeats" "row 'a/b': \"id\" must be non-empty" "row 'nul': \"from\" holds a NUL"; do
    printed "json-names-refused-row ($expected)" "$expected" err.log
  done
  printf '[ { "id": "x", ' > "$P/broken.json"
  arm json-refuse-unparseable "$P/broken.json" 2 0 'read as JSON, which does not parse'
  printf '[]\n' > "$P/empty.json"
  arm json-refuse-empty "$P/empty.json" 2 0 'a non-empty array of rows'

  # ── one baseline per run (S1) ──
  # counted <name> <file under STUB> <wanted lines>: a stub counter after the last arm.
  counted() {
    local lines=0
    [ -f "${STUB:?}/$2" ] && lines=$(wc -l < "${STUB:?}/$2")
    if [ "$lines" -eq "$3" ]; then echo "  ok    $1"; else
      echo "  FAIL  $1: want $3 line(s) in $2, got $lines" >&2
      ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  }
  arm baseline-two-rows "$P/two-good.tsv" 0 2 ''
  counted one-baseline-for-two-rows baselines.log 1
  counted every-row-reuses-the-record unbaselined.log 0
  arm baseline-json-rows "$P/verbatim.json" 0 2 ''
  counted one-baseline-for-json-rows baselines.log 1
  counted every-json-row-reuses-the-record unbaselined.log 0
  arm baseline-not-spent-on-a-refused-plan "$P/two-apart.tsv" 2 0 ''
  counted no-baseline-for-a-refused-plan baselines.log 0
  export STUB_RED_BASELINE=1
  arm red-baseline-stops-the-run "$P/two-good.tsv" 2 0 'Baseline is already failing'
  printed red-baseline-says-why "the baseline could not be recorded, so no mutant was measured" err.log
  unset STUB_RED_BASELINE
  # A row that does not put the tree back stops the table at that row.
  export STUB_DIRTY=1
  arm dirty-row-stops-the-run "$P/two-good.tsv" 2 1 "row 'pipe-one' did not leave the tree as it found it"
  unset STUB_DIRTY
  # A rewrite that changes only line endings under eol=lf: git status shows it, a hash after eol
  # normalisation would not (measured with that mutant).
  export STUB_CRLF=1
  arm crlf-rewrite-stops-the-run "$P/two-good.tsv" 2 1 "row 'pipe-one' did not leave the tree as it found it"
  unset STUB_CRLF
  # An edit hidden from git status by assume-unchanged: only the raw-byte hash sees it.
  export STUB_HIDDEN=1
  arm hidden-edit-stops-the-run "$P/two-good.tsv" 2 1 "row 'pipe-one' did not leave the tree as it found it"
  unset STUB_HIDDEN
  export STUB_STRAY=1
  arm stray-file-stops-the-run "$P/two-good.tsv" 2 1 "row 'pipe-one' did not leave the tree as it found it"
  unset STUB_STRAY
  # The logs may not land in the tree they measure, and the tree must be a repository.
  rm -f "${STUB:?}/calls.log" "${STUB:?}/baselines.log"
  (cd "${REPO_ARMS:?}" && bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${REPO_ARMS:?}/logs" --tree in-place) \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 2 ] && [ ! -f "${STUB:?}/baselines.log" ] && grep -qF 'is inside the measured tree' "${STUB:?}/err.log"; then
    echo "  ok    out-inside-the-tree-refused"
  else
    echo "  FAIL  out-inside-the-tree-refused" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  rm -rf "${REPO_ARMS:?}/logs"
  # The ceiling stops git's search at the throwaway directory, so a TMPDIR inside some repository
  # cannot lend this arm a tree.
  (cd "${STUB:?}" && GIT_CEILING_DIRECTORIES="${DIR:?}" bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${STUB:?}/logs") \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 2 ] && grep -qF 'run it inside a git repository' "${STUB:?}/err.log"; then
    echo "  ok    outside-a-repository-refused"
  else
    echo "  FAIL  outside-a-repository-refused" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi

  # A value flag given last is refused at once, not looped on (bounded, so a regression fails
  # this arm instead of hanging the self-test).
  for flag in --tree --test --plan --out --at; do
    (cd "${REPO_ARMS:?}" && timeout 20 bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" "$flag") \
      > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
    if [ $? -eq 2 ] && grep -qF -- "$flag needs a value" "${STUB:?}/err.log"; then echo "  ok    trailing-$flag-refused"; else
      echo "  FAIL  trailing-$flag-refused" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  done

  # ── the measured tree (S1) ──
  ARMS_HEAD=$(git -C "${REPO_ARMS:?}" rev-parse HEAD)
  # gone <name>: the tree out.log names no longer exists, and the arms' repository registers only
  # its own worktree again.
  gone() {
    local tree registered
    tree=$(sed -n 's/^mutation-envelope: measuring .*, \(.*\) (removed at the end)$/\1/p' "${STUB:?}/out.log" | head -1)
    registered=$(git -C "${REPO_ARMS:?}" worktree list --porcelain | grep -c -x -F "worktree $tree")
    if [ -n "$tree" ] && [ ! -e "$tree" ] && [ "$registered" -eq 0 ]; then echo "  ok    $1"; else
      echo "  FAIL  $1: tree '${tree:-<not named>}' exists, was not named, or is still registered" >&2
      ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  }
  arm worktree-by-default "$P/two-good.tsv" 0 2 ''
  printed worktree-names-the-commit "measuring $ARMS_HEAD in a detached worktree" out.log
  printed worktree-heads-names-tsv "# measured: $ARMS_HEAD in a detached worktree" logs/names.tsv
  gone worktree-removed
  ARM_ARGS=(--tree archive)
  arm archive-two-rows "$P/two-good.tsv" 0 2 ''
  printed archive-names-the-commit "measuring $ARMS_HEAD as a one-commit repository" out.log
  gone archive-removed
  ARM_ARGS=(--tree in-place)
  arm in-place-two-rows "$P/two-good.tsv" 0 2 ''
  printed in-place-names-the-tree "measuring the working tree of" out.log
  counted in-place-records-no-baseline baselines.log 0
  counted in-place-runs-a-baseline-per-row unbaselined.log 2
  ARM_ARGS=(--tree in-place --at HEAD)
  arm in-place-refuses-at "$P/two-good.tsv" 2 0 '--at names a commit'
  ARM_ARGS=(--tree bogus)
  arm unknown-tree-refused "$P/two-good.tsv" 2 0 '--tree takes worktree, archive or in-place'
  ARM_ARGS=(--at no-such-rev)
  arm unknown-rev-refused "$P/two-good.tsv" 2 0 'does not name a commit'
  ARM_ARGS=()
  # What a fresh tree would not hold is refused in both fresh modes, before any baseline;
  # in place, it is what gets measured.
  printf 'edited\n' >> "${REPO_ARMS:?}/src.js"
  arm tracked-change-refused "$P/two-good.tsv" 2 0 ' M src.js'
  counted tracked-change-spends-no-baseline baselines.log 0
  ARM_ARGS=(--tree archive)
  arm tracked-change-refused-archive "$P/two-good.tsv" 2 0 ' M src.js'
  ARM_ARGS=(--tree in-place)
  arm tracked-change-measured-in-place "$P/two-good.tsv" 0 2 ''
  counted tracked-change-in-place-records-no-baseline baselines.log 0
  ARM_ARGS=()
  git -C "${REPO_ARMS:?}" checkout -q -- src.js
  printf 'new\n' > "${REPO_ARMS:?}/new.test.js"
  arm untracked-file-refused "$P/two-good.tsv" 2 0 '?? new.test.js'
  rm -f "${REPO_ARMS:?}/new.test.js"
  # A regular untracked FILE named node_modules is not exempt either: only a symlink is.
  printf 'not a link\n' > "${REPO_ARMS:?}/node_modules"
  arm untracked-file-named-node-modules-refused "$P/two-good.tsv" 2 0 '?? node_modules'
  rm -f -- "${REPO_ARMS:?}/node_modules"
  # A real, untracked node_modules directory is not one of the exempt symlinks.
  mkdir -p "${REPO_ARMS:?}/node_modules" && printf 'x\n' > "${REPO_ARMS:?}/node_modules/marker"
  arm untracked-directory-refused "$P/two-good.tsv" 2 0 '?? node_modules/marker'
  rm -rf "${REPO_ARMS:?}/node_modules"
  # A symlinked one is exempt, lent to the fresh tree, visible to every row, and unlinked before
  # the tree is removed: its target survives the cleanup.
  mkdir -p "${STUB:?}/lent/node_modules" && printf 'x\n' > "${STUB:?}/lent/node_modules/marker"
  ln -s "${STUB:?}/lent/node_modules" "${REPO_ARMS:?}/node_modules"
  export STUB_SEE_LINK=1
  arm lent-node-modules "$P/two-good.tsv" 0 2 ''
  unset STUB_SEE_LINK
  counted every-row-sees-the-lent-link seen.log 2
  printed the-lent-link-is-visible LINK-VISIBLE seen.log
  if ! grep -q LINK-ABSENT "${STUB:?}/seen.log" && [ -f "${STUB:?}/lent/node_modules/marker" ]; then
    echo "  ok    the-lent-target-survives-the-cleanup"
  else
    echo "  FAIL  the-lent-target-survives-the-cleanup" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  gone lent-tree-removed
  rm -f "${REPO_ARMS:?}/node_modules"
  # --at measures an older commit.
  printf 'y\n' > "${REPO_ARMS:?}/second.js"
  git -C "${REPO_ARMS:?}" add second.js && git -C "${REPO_ARMS:?}" commit -qm second
  ARM_ARGS=(--at HEAD~1)
  arm at-an-older-commit "$P/two-good.tsv" 0 2 ''
  printed at-names-the-older-commit "measuring $ARMS_HEAD in a detached worktree" out.log
  ARM_ARGS=()
  # Started in a subdirectory, the rows run in the same subdirectory of the fresh tree.
  mkdir -p "${REPO_ARMS:?}/sub" && printf 'z\n' > "${REPO_ARMS:?}/sub/x.js"
  git -C "${REPO_ARMS:?}" add sub && git -C "${REPO_ARMS:?}" commit -qm sub
  rm -f "${STUB:?}/pwd.log"
  (cd "${REPO_ARMS:?}/sub" && STUB_PWD=1 bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${STUB:?}/logs") \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 0 ] && [ "$(grep -c '/tree/sub$' "${STUB:?}/pwd.log" 2>/dev/null)" = 2 ]; then
    echo "  ok    rows-run-in-the-same-subdirectory"
  else
    echo "  FAIL  rows-run-in-the-same-subdirectory" >&2; sed 's/^/        /' "${STUB:?}/err.log" "${STUB:?}/pwd.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  # Below a ceiling, a repository above it is not this run's: the scrub keeps the ceiling. The
  # repository above has no commit, so finding it would end in a different refusal.
  mkdir -p "${STUB:?}/outer/inner" && git -C "${STUB:?}/outer" init -q -b main >/dev/null 2>&1
  (cd "${STUB:?}/outer/inner" && GIT_CEILING_DIRECTORIES="${STUB:?}/outer" bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${STUB:?}/logs") \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 2 ] && grep -qF 'run it inside a git repository' "${STUB:?}/err.log"; then
    echo "  ok    the-ceiling-survives-the-scrub"
  else
    echo "  FAIL  the-ceiling-survives-the-scrub" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi

  # The caller's post-checkout hook does not run in the fresh worktree.
  mkdir -p "${STUB:?}/hooks"
  printf '#!/bin/sh\ntouch "%s"\n' "${STUB:?}/hook-ran" > "${STUB:?}/hooks/post-checkout"
  chmod +x "${STUB:?}/hooks/post-checkout"
  git -C "${REPO_ARMS:?}" config core.hooksPath "${STUB:?}/hooks"
  arm caller-hooks-not-run "$P/two-good.tsv" 0 2 ''
  if [ ! -e "${STUB:?}/hook-ran" ]; then echo "  ok    post-checkout-hook-not-run"; else
    echo "  FAIL  post-checkout-hook-not-run: the caller's hook ran for the fresh worktree" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  git -C "${REPO_ARMS:?}" config --unset core.hooksPath

  # A relative TMPDIR: the fresh tree is still found after the run changes directory, and removed.
  mkdir -p "${REPO_ARMS:?}/reltmp"
  (cd "${REPO_ARMS:?}" && TMPDIR=reltmp bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${STUB:?}/logs") \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 0 ] && [ -z "$(ls -A "${REPO_ARMS:?}/reltmp")" ]; then echo "  ok    relative-tmpdir"; else
    echo "  FAIL  relative-tmpdir" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  rm -rf -- "${REPO_ARMS:?}/reltmp"

  # A peer's registration that reads prunable (its directory moved away) survives a default run:
  # the run removes its own worktree, and never prunes the repository's (#1100 review, B1).
  git -C "${REPO_ARMS:?}" worktree add -q --detach "${STUB:?}/peer" HEAD >/dev/null 2>&1 && mv "${STUB:?}/peer" "${STUB:?}/peer-moved"
  arm peer-registration-kept "$P/two-good.tsv" 0 2 ''
  if git -C "${REPO_ARMS:?}" worktree list --porcelain | grep -q -x -F "worktree ${STUB:?}/peer"; then
    echo "  ok    a-prunable-peer-registration-survives"
  else
    echo "  FAIL  a-prunable-peer-registration-survives: the run pruned a registration it did not make" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  gone peer-arm-tree-removed
  mv "${STUB:?}/peer-moved" "${STUB:?}/peer" && git -C "${REPO_ARMS:?}" worktree remove --force "${STUB:?}/peer"
  # A locked tree survives `worktree remove --force`: the fallback removes its own admin directory,
  # so no registration is left. And when that admin directory's gitdir names another tree (a peer
  # reused the name), the fallback leaves it alone.
  export STUB_LOCK=1
  arm locked-tree "$P/two-good.tsv" 0 2 ''
  gone locked-tree-deregistered-by-the-fallback
  export STUB_FOREIGN_ADMIN="${STUB:?}/someone-else/.git"
  arm locked-tree-foreign-admin "$P/two-good.tsv" 0 2 ''
  if git -C "${REPO_ARMS:?}" worktree list --porcelain | grep -q -x -F "worktree ${STUB:?}/someone-else"; then
    echo "  ok    a-foreign-admin-dir-is-left-alone"
  else
    echo "  FAIL  a-foreign-admin-dir-is-left-alone: the fallback removed an admin dir whose gitdir named another tree" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi
  unset STUB_LOCK STUB_FOREIGN_ADMIN
  git -C "${REPO_ARMS:?}" worktree prune # the arms' own repository: clear the registration the arm left on purpose

  # An inherited GIT_DIR names some other repository; the run ignores it and writes nothing there.
  (cd "${REPO_ARMS:?}" && GIT_DIR="${STUB:?}/decoy.git" GIT_WORK_TREE="${STUB:?}/decoy" bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$P/two-good.tsv" --out "${STUB:?}/logs") \
    > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
  if [ $? -eq 0 ] && [ ! -e "${STUB:?}/decoy.git" ] && [ ! -e "${STUB:?}/decoy" ]; then
    echo "  ok    inherited-git-dir-ignored"
  else
    echo "  FAIL  inherited-git-dir-ignored" >&2; sed 's/^/        /' "${STUB:?}/err.log" >&2; ARMS_FAILED=$((ARMS_FAILED + 1))
  fi

  if [ "$ARMS_FAILED" -ne 0 ]; then
    echo "mutation-envelope --verify: FAILED — $ARMS_FAILED plan-check arm(s) above" >&2
    exit 1
  fi
  rm -rf "${STUB:?}"

  # The fixture is a subdirectory, so the plans, logs and run transcripts below sit outside the
  # tree being measured: the envelope refuses an --out inside it.
  FIXTURE="${DIR:?}/fixture"
  mkdir -p "${FIXTURE:?}" && cd "${FIXTURE:?}" || exit 2
  git init -q -b main . >/dev/null 2>&1
  git config user.email t@example.invalid
  git config user.name fixture

  mkdir -p scripts/lib scripts/test tools
  cp "$SELF" tools/mutation-envelope.sh || exit 2
  cp "$REPO/scripts/mutation-check.js" scripts/ || exit 2
  cp "$REPO/scripts/lib/mutation-parse.js" scripts/lib/ || exit 2
  cp "$REPO/scripts/lib/mutation-verdict.js" scripts/lib/ || exit 2
  ln -s "$REPO/node_modules" "${FIXTURE:?}/node_modules"
  cat > scripts/lib/subject.js <<'JS'
export function covered(n) { return n > 10; }
export function uncovered(n) { return n > 10; }
JS
  cat > scripts/test/subject.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { covered } from '../lib/subject.js';
test('covered is asserted', () => { assert.equal(covered(11), true); assert.equal(covered(10), false); assert.equal(covered(5), false); });
JS
  cat > package.json <<'JSON'
{ "name": "envelope-fixture", "private": true, "type": "module",
  "scripts": { "t": "node --test scripts/test/subject.test.js" } }
JSON
  git add -A >/dev/null 2>&1
  git commit -qm fixture >/dev/null 2>&1
  # The fixture's git acted on the fixture alone: its own .git, no decoy, the author it was given.
  if [ "$(git rev-parse --absolute-git-dir 2>/dev/null)" != "$(pwd -P)/.git" ] || [ -e "${DIR:?}/decoy.git" ] \
     || [ "$(git log -1 --format=%an 2>/dev/null)" != fixture ]; then
    echo "mutation-envelope --verify: FAILED — the fixture repository is not its own .git with a last commit by 'fixture' and no decoy path; a GIT_* variable past the scrub, or a fixture git init or commit that failed (their output is discarded), each does this" >&2
    exit 1
  fi

  printf 'kill\tscripts/lib/subject.js\texport function covered(n) { return n > 10; }::export function covered(n) { return n >= 10; }\n' > "${DIR:?}/plan.txt"
  printf 'survive\tscripts/lib/subject.js\texport function uncovered(n) { return n > 10; }::export function uncovered(n) { return n >= 10; }\n' >> "${DIR:?}/plan.txt"

  # A JSON row through the real checker: one needle spanning both lines, so only --from/--to can
  # carry it. It weakens `covered`, which the fixture test asserts.
  cat > "${DIR:?}/plan.json" <<'JSON'
[ { "id": "multi-line", "file": "scripts/lib/subject.js",
    "from": "export function covered(n) { return n > 10; }\nexport function uncovered(n)",
    "to": "export function covered(n) { return n >= 10; }\nexport function uncovered(n)" } ]
JSON
  bash tools/mutation-envelope.sh --test 'npm run t' --plan "${DIR:?}/plan.json" --out "${DIR:?}/logs-json" --tree archive > "${DIR:?}/run-json.log" 2>&1
  JSON_STATUS=$?
  JSON_NAMED=$(grep -c -x -F "$(printf 'multi-line\tMUTANT KILLED by 1 failing test(s) — the check can fail.\t1\tcovered is asserted')" "${DIR:?}/logs-json/names.tsv" 2>/dev/null || true)
  if [ "$JSON_STATUS" -ne 0 ] || [ "$JSON_NAMED" -ne 1 ]; then
    echo "mutation-envelope --verify: FAILED — want the multi-line JSON row killed naming 'covered is asserted', exit 0; got exit $JSON_STATUS" >&2
    sed -n '1,30p' "${DIR:?}/run-json.log" >&2
    exit 1
  fi
  echo "  ok    json-real-checker-multi-line (--tree archive)"

  # The kill row again, in place, over an uncommitted edit to another tracked file: the real
  # checker mutating and restoring the fixture itself, each row with its own baseline.
  printf '// an uncommitted edit\n' >> scripts/lib/mutation-parse.js
  head -1 "${DIR:?}/plan.txt" > "${DIR:?}/plan-in-place.txt"
  bash tools/mutation-envelope.sh --test 'npm run t' --plan "${DIR:?}/plan-in-place.txt" --out "${DIR:?}/logs-in-place" --tree in-place > "${DIR:?}/run-in-place.log" 2>&1
  IN_PLACE_STATUS=$?
  if [ "$IN_PLACE_STATUS" -ne 0 ] || ! grep -q -x -F "$(printf 'kill\tMUTANT KILLED by 1 failing test(s) — the check can fail.\t1\tcovered is asserted')" "${DIR:?}/logs-in-place/names.tsv" \
     || [ "$(git status --porcelain --untracked-files=no)" != ' M scripts/lib/mutation-parse.js' ]; then
    echo "mutation-envelope --verify: FAILED — want the in-place kill row killed naming 'covered is asserted', exit 0, the fixture clean; got exit $IN_PLACE_STATUS" >&2
    sed -n '1,30p' "${DIR:?}/run-in-place.log" >&2
    exit 1
  fi
  git checkout -q -- scripts/lib/mutation-parse.js
  echo "  ok    real-checker-in-place-over-an-uncommitted-edit"

  bash tools/mutation-envelope.sh --test 'npm run t' --plan "${DIR:?}/plan.txt" --out "${DIR:?}/logs" > "${DIR:?}/run.log" 2>&1
  STATUS=$?
  # One baseline through the real checker: recorded once, and both rows reused it.
  REUSED=$(grep -l -F 'baseline: reusing the record in' "${DIR:?}/logs/kill.log" "${DIR:?}/logs/survive.log" 2>/dev/null | wc -l)
  RECORDED=$(grep -c -F 'baseline recorded in' "${DIR:?}/logs/baseline.log" 2>/dev/null || true)
  # Counted on each row's own line. An unanchored `grep -c KILLED` also counted the footer
  # ("Read every row above that is not 'MUTANT KILLED' ..."), so it reported one kill while both
  # rows survived: `covered(11)` and `covered(5)` cannot tell `n > 10` from `n >= 10`, which is
  # why the fixture test now asserts `covered(10)`.
  KILLED=$(grep -c '^kill .*MUTANT KILLED' "${DIR:?}/run.log" || true)
  SURVIVED=$(grep -c '^survive .*MUTANT SURVIVED' "${DIR:?}/run.log" || true)
  # Through the real checker: the kill row names the one test that killed it, read from what the
  # --test command printed, and the survivor added none.
  NAMED=$(grep -c -x -F "$(printf 'kill\tMUTANT KILLED by 1 failing test(s) — the check can fail.\t1\tcovered is asserted')" "${DIR:?}/logs/names.tsv" || true)
  UNNAMED=$(grep -c -x -F "$(printf 'survive\tMUTANT SURVIVED — this line is not covered.\t0\t')" "${DIR:?}/logs/names.tsv" || true)

  printf 'exit=%s killed-rows=%s survived-rows=%s named-kill=%s unnamed-survivor=%s baseline-recorded=%s rows-reusing-it=%s\n' "$STATUS" "$KILLED" "$SURVIVED" "$NAMED" "$UNNAMED" "$RECORDED" "$REUSED"
  if [ "$STATUS" -eq 1 ] && [ "$KILLED" -eq 1 ] && [ "$SURVIVED" -eq 1 ] && [ "$NAMED" -eq 1 ] && [ "$UNNAMED" -eq 1 ] \
     && [ "$RECORDED" -eq 1 ] && [ "$REUSED" -eq 2 ]; then
    echo "mutation-envelope --verify: OK (every plan-check arm holds; under the --test command, one baseline is recorded and reused by both rows, the covered row is reported killed and names its test, the uncovered row survives naming none, and the survivor fails the run)"
    exit 0
  fi
  echo "mutation-envelope --verify: FAILED — want exit 1, the kill row killed naming 'covered is asserted', and the survive row survived naming none" >&2
  sed -n '1,20p' "${DIR:?}/logs/names.tsv" >&2
  sed -n '1,40p' "${DIR:?}/run.log" >&2
  exit 1
fi

# ── the run ──────────────────────────────────────────────────────────────────────────────────
# The repository is found from the current directory and nothing else. An inherited GIT_DIR or
# GIT_WORK_TREE names the caller's repository, which is the wrong one for every git the checker
# runs inside a fresh tree, and the fixture scrub (#930) showed a denylist of names misses some.
# GIT_CEILING_DIRECTORIES stays: it only narrows that search, and dropping it let a run started
# below a ceiling find a repository above it (#1100 review, bash-safety S1).
for git_var in "${!GIT_@}"; do
  [ "$git_var" = GIT_CEILING_DIRECTORIES ] || unset "$git_var"
done
[ -n "$TEST_CMD" ] || { echo "mutation-envelope: --test is required" >&2; exit 2; }
[ -n "$PLAN" ] || { echo "mutation-envelope: --plan is required" >&2; exit 2; }
[ -r "$PLAN" ] || { echo "mutation-envelope: cannot read plan: $PLAN" >&2; exit 2; }

# The plan is read ONCE, here, and both loops below read this copy. Reading the file once per
# loop let the plan check and the run see different plans: a pipe (`--plan <(...)`,
# `--plan /dev/stdin`) was drained by the check, so the run measured nothing and exited 0 with
# `0 row(s)`, and a row appended to the file during a run was measured without being checked.
# `$(...)` drops trailing newlines and `<<<` adds exactly one, so every row the loops read ends
# in a newline, including a last row the file saved without one; a bare `read` drops such a row
# when it reads the file directly, and a one-row plan was then reported as `0 row(s), 0 not a
# clean kill` with exit 0.
PLAN_TEXT=$(cat -- "$PLAN") || { echo "mutation-envelope: cannot read plan: $PLAN" >&2; exit 2; }

# A plan whose first non-blank character is `[` is a JSON plan (S1); anything else is a TAB plan.
case "${PLAN_TEXT#"${PLAN_TEXT%%[![:space:]]*}"}" in '['*) PLAN_FORMAT=json ;; *) PLAN_FORMAT=tsv ;; esac

# Checks (`check`) or emits (`rows`) a JSON plan read from stdin. `check` names every refused row
# on stderr and prints the row count, exiting 2 on any refusal and 3 on a plan that is not a
# non-empty array. `rows` prints each row as four NUL-terminated fields, id, file, from, to: a
# needle may hold any other byte, a trailing newline included, and `$(...)` would strip that
# newline while a TAB-split `read` would collapse an empty `to`. The check refuses a NUL in any
# field, so the stream cannot be misread.
PLAN_JS='
const mode = process.argv[1];
let plan;
try { plan = JSON.parse(require("fs").readFileSync(0, "utf8")); }
catch (error) { console.error(`mutation-envelope: the plan starts with "[" and is read as JSON, which does not parse: ${error.message}`); process.exit(3); }
if (!Array.isArray(plan) || plan.length === 0) { console.error("mutation-envelope: a JSON plan must be a non-empty array of rows"); process.exit(3); }
if (mode === "rows") {
  process.stdout.write(plan.map((row) => [row.id, row.file, row.from, row.to].map((field) => `${field}\0`).join("")).join(""));
  process.exit(0);
}
const KEYS = ["id", "file", "from", "to"];
const seen = new Set();
let refused = 0;
plan.forEach((row, index) => {
  const label = row !== null && typeof row === "object" && typeof row.id === "string" && row.id !== "" ? row.id : `#${index + 1}`;
  const problem = (() => {
    if (row === null || typeof row !== "object" || Array.isArray(row)) return "not an object";
    const unknown = Object.keys(row).filter((key) => !KEYS.includes(key));
    if (unknown.length > 0) return `unknown key(s) ${unknown.join(", ")}; a row holds exactly id, file, from, to`;
    for (const key of KEYS) if (typeof row[key] !== "string") return `"${key}" is missing or not a string`;
    for (const key of KEYS) if (row[key].includes("\0")) return `"${key}" holds a NUL character`;
    if (row.id === "" || /[\/\t\r\n]/.test(row.id)) return `"id" must be non-empty and hold no "/", tab or newline: it names the log file of the row`;
    if (seen.has(row.id)) return `"id" repeats an earlier row`;
    seen.add(row.id);
    if (row.file === "") return `"file" is empty`;
    if (row.from === "") return `"from" is empty, which matches between every character`;
    return null;
  })();
  if (problem) { console.error(`REFUSED: row '"'"'${label}'"'"': ${problem}`); refused++; }
});
if (refused > 0) { console.error(`mutation-envelope: ${refused} of ${plan.length} row(s) refused by the plan check; no mutant was measured`); process.exit(2); }
console.log(String(plan.length));
'

# The plan check: every row, before any checker cycle. A refusal used to be discovered only when
# the loop below reached the row, after every earlier row had spent its baseline and its mutant
# run, and the exit 2 then suppressed the summary those rows had paid for. Every refused row is
# named, not just the first, so a plan is repaired in one pass.
PLANNED=0
REFUSED=0
if [ "$PLAN_FORMAT" = json ]; then
  PLANNED=$(node -e "$PLAN_JS" check <<< "$PLAN_TEXT") || exit 2
else
  while IFS=$'\t' read -r id file mutation; do
    case "${id:-}" in ''|'#'*) continue ;; esac
    PLANNED=$((PLANNED + 1))
    problem=$(row_problem "${file:-}" "${mutation:-}")
    # The id names the row's log and names files under --out, so a `/` in it reaches outside
    # (a JSON id is refused for the same reason in PLAN_JS).
    case "$id" in */*) problem="its id holds '/', and the id names the row's log file under --out" ;; esac
    if [ -n "$problem" ]; then
      echo "REFUSED: row '$id': $problem" >&2
      REFUSED=$((REFUSED + 1))
    fi
  done <<< "$PLAN_TEXT"
fi
if [ "$REFUSED" -gt 0 ]; then
  echo "mutation-envelope: $REFUSED of $PLANNED row(s) refused by the plan check; no mutant was measured" >&2
  exit 2
fi
[ "$PLANNED" -gt 0 ] || { echo "mutation-envelope: the plan holds no rows, only blank lines and comments: $PLAN" >&2; exit 2; }

[ -n "$OUT" ] || OUT=$(mktemp -d)
mkdir -p "${OUT:?}" || exit 2
OUT=$(cd "${OUT:?}" && pwd -P) || exit 2 # absolute, before the run changes directory

# ── the measured tree (S1) ──
# The checkout the envelope is run in is CALLER; TREE is the tree that gets mutated.
CALLER=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "mutation-envelope: run it inside a git repository" >&2; exit 2; }
PREFIX=$(git rev-parse --show-prefix) # the subdirectory of CALLER the run was started in
# Linked from CALLER into a fresh tree when CALLER has them and the tree does not: the same three
# a worktree of this repository needs to run its suites. Exempt from the untracked refusal only
# as symlinks, which is what they are in a worktree; in the main checkout they are ignored.
LINKS=(node_modules viz/node_modules viz/renv/library)
MADE_LINKS=()
PARENT=""
ADMIN="" # the fresh worktree's own admin directory, recorded when it is made
COMMON_DIR=$(git rev-parse --path-format=absolute --git-common-dir)
cleanup() {
  cd / || return
  local made
  # Unlinked one by one with a plain rm after an -L test, before anything removes the tree, so no
  # removal is ever handed a link. Neither `git worktree remove --force` nor `rm -rf` follows one
  # (measured: with this loop deleted, the lent target survives and every arm passes, #1100
  # review), so the loop guards a future removal command, not today's two; no arm can tell.
  for made in "${MADE_LINKS[@]}"; do [ -L "$made" ] && rm -- "$made"; done
  if [ -n "$PARENT" ]; then
    # Its own registration only, never `git worktree prune`: prune drops EVERY registration whose
    # directory reads as missing, and a peer's worktree registered from Windows (`D:/...`) always
    # reads so from WSL. `worktree remove` deregisters the tree it is given. When the admin
    # directory recorded at creation still exists afterwards (the remove failed, on a locked tree
    # say), it is removed only if it sits where git keeps worktree admin directories AND its
    # gitdir file still points at this run's tree: git reuses a freed name (tree, tree1, ...), so
    # a peer's worktree made in between can hold the same name (#1100 review round 2).
    if [ "$TREE_MODE" = worktree ]; then
      git -C "$CALLER" worktree remove --force "$TREE" >/dev/null 2>&1
      if [ -n "$ADMIN" ] && [ -d "$ADMIN" ] && [ "$(cat "$ADMIN/gitdir" 2>/dev/null)" = "$TREE/.git" ]; then
        case "$ADMIN" in "$COMMON_DIR/worktrees/"?*) rm -rf -- "${ADMIN:?}" ;; esac
      fi
    fi
    rm -rf -- "${PARENT:?}"
  fi
  return 0
}
case "$TREE_MODE" in
  in-place)
    [ -z "$AT" ] || { echo "mutation-envelope: --at names a commit, and --tree in-place measures the working tree; drop one" >&2; exit 2; }
    TREE=$CALLER
    MEASURED="the working tree of $CALLER in place, HEAD $(git -C "$CALLER" rev-parse HEAD)"
    ;;
  worktree|archive)
    SHA=$(git -C "$CALLER" rev-parse --verify --quiet "${AT:-HEAD}^{commit}") \
      || { echo "mutation-envelope: --at ${AT:-HEAD} does not name a commit" >&2; exit 2; }
    UNSEEN=$(git -C "$CALLER" status --porcelain=v1 --untracked-files=all | while IFS= read -r line; do
      case "$line" in
        '?? node_modules'|'?? viz/node_modules'|'?? viz/renv/library') [ -L "$CALLER/${line#?? }" ] && continue ;;
      esac
      printf '%s\n' "$line"
    done)
    if [ -n "$UNSEEN" ]; then
      echo "mutation-envelope: --tree $TREE_MODE measures commit ${SHA:0:12}, and your checkout holds changes that tree would not, so a mutant they would catch could read as SURVIVED:" >&2
      printf '%s\n' "$UNSEEN" | head -20 | sed 's/^/  /' >&2
      echo "Commit them, or measure them where they are with --tree in-place." >&2
      exit 2
    fi
    # Absolute: mktemp honours a relative TMPDIR, and the run changes directory before cleanup.
    PARENT=$(mktemp -d) && PARENT=$(cd "$PARENT" && pwd -P) || exit 2
    TREE="$PARENT/tree"
    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    trap 'exit 129' HUP
    if [ "$TREE_MODE" = worktree ]; then
      # No hooks: a caller's post-checkout hook would run in the fresh tree, unasked, and
      # anything it wrote there would be measured as part of the commit.
      git -C "$CALLER" -c core.hooksPath=/dev/null worktree add -q --detach "$TREE" "$SHA" >/dev/null 2>&1 \
        || { echo "mutation-envelope: git worktree add failed for ${SHA:0:12} at $TREE" >&2; exit 2; }
      ADMIN=$(git -C "$TREE" rev-parse --absolute-git-dir)
      MEASURED="$SHA in a detached worktree, $TREE (removed at the end)"
    else
      mkdir -p "$TREE" "$PARENT/home" || exit 2
      git -C "$CALLER" archive "$SHA" | tar -x -C "$TREE" \
        || { echo "mutation-envelope: git archive of ${SHA:0:12} could not be extracted" >&2; exit 2; }
      # Its own repository, so the checker's git guards hold. Committed under a throwaway HOME
      # and no system config: nothing of the caller's git setup (hooks, signing, identity) may
      # reach it. GIT_* is already scrubbed. Links come after the commit, so they stay untracked.
      ( cd "$TREE" && export HOME="$PARENT/home" XDG_CONFIG_HOME="$PARENT/home/.config" GIT_CONFIG_NOSYSTEM=1 \
        && git init -q -b main . && git add -A \
        && git -c user.email=archive@example.invalid -c user.name=mutation-envelope commit -q --no-verify -m "archive of $SHA" ) >/dev/null 2>&1 \
        || { echo "mutation-envelope: the archive of ${SHA:0:12} could not be committed as a repository" >&2; exit 2; }
      [ "$(git -C "$TREE" rev-parse --absolute-git-dir 2>/dev/null)" = "$(cd "$TREE" && pwd -P)/.git" ] \
        || { echo "mutation-envelope: the archive at $TREE is not its own repository" >&2; exit 2; }
      MEASURED="$SHA as a one-commit repository, $TREE (removed at the end)"
    fi
    for link in "${LINKS[@]}"; do
      [ -e "$CALLER/$link" ] || continue
      { [ -e "$TREE/$link" ] || [ -L "$TREE/$link" ]; } && continue # the tree carries its own
      [ -d "$(dirname "$TREE/$link")" ] || continue
      ln -s "$(readlink -f "$CALLER/$link")" "$TREE/$link" && MADE_LINKS+=("$TREE/$link")
    done
    cd "$TREE/$PREFIX" || { echo "mutation-envelope: $PREFIX does not exist at ${SHA:0:12}" >&2; exit 2; }
    ;;
  *) echo "mutation-envelope: --tree takes worktree, archive or in-place, not: $TREE_MODE" >&2; exit 2 ;;
esac

# The logs never land in the tree they measure: each would be a new untracked file, the tree
# would differ after every row, and a reused baseline would be refused from the second row on.
# Reachable in in-place mode; a fresh tree is made under its own mktemp -d.
case "$OUT/" in
  "$(cd "$TREE" && pwd -P)/"*) echo "mutation-envelope: --out $OUT is inside the measured tree $TREE; name a directory outside it" >&2; exit 2 ;;
esac

# ONE baseline for the whole table (S1). Every row used to run its own over the same tree, so N
# rows cost 2N suite runs. The checker records it once (--write-baseline) and every row reuses
# the record (--baseline), which the checker refuses unless HEAD, the directory, the tree's status and the --test
# string still match. A baseline that is red, hangs or cannot be read stops the run here, before
# any mutant: exit 2, because nothing was measured.
#
# Not in place. A record is made only over a clean tree, and in place the tree is the caller's,
# uncommitted edits included, which is what that mode exists to measure; each row runs its own
# baseline there, as before S1 (#1100 review, B2). That also gives in-place what a record cannot:
# a fresh look at the suite before each row, while the caller's untracked tests are live.
TREE_STATUS=$(git -C "$TREE" status --porcelain=v1 --untracked-files=all)
BASELINE_ARGS=()
if [ "$TREE_MODE" = in-place ]; then
  BASELINE_LINE="in place: every row runs its own baseline, as before S1"
else
  BASELINE="${OUT:?}/baseline.json"
  if ! node "$CHECKER" --test "$TEST_CMD" --write-baseline "$BASELINE" > "${OUT:?}/baseline.log" 2>&1 < /dev/null; then
    echo "mutation-envelope: the baseline could not be recorded, so no mutant was measured:" >&2
    grep -E '^ERROR' "${OUT:?}/baseline.log" | head -5 >&2
    echo "  (the whole log: ${OUT:?}/baseline.log)" >&2
    exit 2
  fi
  BASELINE_ARGS=(--baseline "$BASELINE")
  BASELINE_LINE="one baseline, $(grep -E '^ {6}green' "${OUT:?}/baseline.log" | sed -e 's/^ *//' -e 's/\.$//'), reused by every row"
fi

echo "mutation-envelope: measuring $MEASURED"
echo "mutation-envelope: every row measured under: $TEST_CMD"
echo "mutation-envelope: $BASELINE_LINE"
echo

# The checker prints its verdict at column 0 and indents every other line, test names included
# (S1). The match is anchored, so a name holding a verdict word cannot become a row's verdict:
# unanchored, `tail -1` took the last matching line anywhere in the log, and a checker that died
# after printing a name such as "reports MUTANT KILLED" left that name as the row's verdict.
VERDICT_LINE='^(MUTANT KILLED|MUTANT SURVIVED|SUSPECT KILL|INVALID MUTANT|INCONCLUSIVE|HUNG|ERROR:)'

# The checker writes each row's names record as JSON (--names-out). This reads one back: the
# added count (or `unreadable:<run>`, or `-` when the row produced no mutant verdict), the names
# joined by ` | `, then one name per line. stdin is closed: inside the run loop it would be the
# plan's here-string, and a reader of stdin drains the rows not yet measured.
NAMES_JS='
const fs = require("fs");
const file = process.argv[1];
if (!fs.existsSync(file)) { console.log("-"); process.exit(0); }
let record;
try { record = JSON.parse(fs.readFileSync(file, "utf8")); } catch { console.log("unreadable:record"); process.exit(0); }
if (!record.readable) { console.log(`unreadable:${record.unreadable}`); process.exit(0); }
const names = record.added.map((leaf) => String(leaf.name).replace(/[\t\r\n]+/g, " "));
console.log(String(names.length));
console.log(names.join(" | "));
for (const name of names) console.log(name);
'
NAMES_TSV="${OUT:?}/names.tsv"
{ printf '# measured: %s\n' "$MEASURED"
  printf '# id\tverdict\tadded\tnames: the failing leaf tests each mutant added over the baseline, under: %s\n' "$TEST_CMD"; } > "$NAMES_TSV"

ROWS=0
BAD=0
# One row, either form: <id> <file> <the checker's mutation flags…>. It runs in the loop's shell,
# so ROWS and BAD count, and its stdin is the loop's, as the checker's always was.
run_row() {
  local id=$1 file=$2 names_json verdict summary added before after
  shift 2
  ROWS=$((ROWS + 1))
  names_json="${OUT:?}/$id.names.json"
  rm -f -- "$names_json"
  before=$(git hash-object --no-filters -- "$file" 2>/dev/null)
  node "$CHECKER" --file "$file" "$@" --test "$TEST_CMD" "${BASELINE_ARGS[@]}" --names-out "$names_json" > "${OUT:?}/$id.log" 2>&1
  # The row leaves the tree as it found it: the file byte-identical, and the status unchanged.
  # --no-filters, or the hash is taken after eol normalisation and a CRLF rewrite under
  # `text=auto eol=lf` hashes the same (status does show that one; measured). The hash is the
  # only one of the two that sees an edit to a file flagged assume-unchanged.
  # The next row's baseline check would refuse a leftover too, but only from the next row on;
  # this catches it at the row that made it, the last row included, and stops the table there.
  after=$(git hash-object --no-filters -- "$file" 2>/dev/null)
  if [ "$before" != "$after" ] || [ "$(git -C "$TREE" status --porcelain=v1 --untracked-files=all)" != "$TREE_STATUS" ]; then
    echo "mutation-envelope: row '$id' did not leave the tree as it found it (${file}: ${before:-absent} before, ${after:-absent} after; or the status changed); no further row is measured. Read ${OUT:?}/$id.log and git status in $TREE." >&2
    exit 2
  fi
  verdict=$(grep -E "$VERDICT_LINE" "${OUT:?}/$id.log" | tail -1)
  # Counted once per row. A row with no verdict line used to be counted twice, here and again by
  # a second check below the printf, so one such row read "1 row(s), 2 not a clean kill".
  case "$verdict" in
    'MUTANT KILLED'*) : ;;
    *) BAD=$((BAD + 1)) ;;
  esac
  printf '%-24s %s\n' "$id" "${verdict:-<no verdict line — read ${OUT:?}/$id.log>}"
  summary=$(node -e "$NAMES_JS" "$names_json" < /dev/null)
  added=$(sed -n 1p <<< "$summary")
  case "$added" in
    -|0) [ "$added" = 0 ] && [ "${verdict#MUTANT SURVIVED}" = "$verdict" ] && printf '%-24s   names: none added over the baseline\n' '' ;;
    unreadable:*) printf '%-24s   names: could not be read (%s)\n' '' "${added#unreadable:}" ;;
    *) sed -n '3,$p' <<< "$summary" | while IFS= read -r name; do printf '%-24s   + %s\n' '' "$name"; done ;;
  esac
  printf '%s\t%s\t%s\t%s\n' "$id" "${verdict:-<no verdict line>}" "$added" "$(sed -n 2p <<< "$summary")" >> "$NAMES_TSV"
}

if [ "$PLAN_FORMAT" = json ]; then
  while IFS= read -r -d '' id && IFS= read -r -d '' file && IFS= read -r -d '' from && IFS= read -r -d '' to; do
    run_row "$id" "$file" --from "$from" --to "$to"
  done < <(node -e "$PLAN_JS" rows <<< "$PLAN_TEXT")
else
  while IFS=$'\t' read -r id file mutation; do
    case "${id:-}" in ''|'#'*) continue ;; esac
    run_row "$id" "$file" --replace "$mutation"
  done <<< "$PLAN_TEXT"
fi

echo
echo "mutation-envelope: $ROWS row(s), $BAD not a clean kill; logs and names.tsv in ${OUT:?}"
# Both loops read one string, but the run loop's here-string is also the checker's stdin, so a
# checker that reads stdin ends the run early, and a short table would otherwise exit 0. This
# detects a run that read a different plan after the fact; it does not save the time spent.
[ "$ROWS" -eq "$PLANNED" ] || { echo "mutation-envelope: measured $ROWS of $PLANNED planned row(s); the run did not read the plan the check counted, so do not quote this table" >&2; exit 2; }
[ "$BAD" -eq 0 ] || { echo "Read every row above that is not 'MUTANT KILLED' before quoting this table." >&2; exit 1; }
exit 0
