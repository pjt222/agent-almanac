#!/usr/bin/env python3
"""
Prove a change only ADDED text: every original line survives, in order, as a prefix.

    python3 tools/append-only.py --base origin/main docs/investigations/leadless-coordination-research.md
    python3 tools/append-only.py --from 65b3b2e15 --to 8c597441b docs/investigations/leadless-coordination-research.md
    python3 tools/append-only.py --verify
    python3 tools/append-only.py --selftest-negative

Exit 0 append-only, 1 a violation, 2 a refusal (nothing was measured).

WHY THIS FILE EXISTS
--------------------
A dated record -- an investigation, a probe RESULT.md, a research document -- is corrected by
APPENDING an Addendum and leaving the body untouched, with inline pointers at end of line
(the convention in `tests/results/2026-08-23-memory-cap-truncation-probe/RESULT.md`). Editing
the body destroys what makes it evidence. The property that needs proving is therefore "no
original line was altered anywhere except at its end, and none moved".

The check the repository had for this counts REMOVED WORDS -- published in PR #828's body and
repeated in that day's handoff:

    # every original line intact; text only added. Must print 0.
    git diff --word-diff=porcelain origin/main -- FILE | grep -v '^--- ' | grep -c '^-'

It is blind to a mid-sentence insertion. Git splits word-diff on whitespace, so an insertion
surrounded by spaces removes no token. Measured on the shape a dated record actually has --
two sentences on one line, a pointer appended after the first:

    mid-sentence pointer inserted   word-diff 0 (passes)   this tool: caught
    end-of-line pointer appended    word-diff 0 (passes)   this tool: passes

Inserting a pointer mid-sentence rather than at end of line is an error made three times while
writing #828 -- per that session's transcript and a gitignored handoff, so not checkable from
this repository; the rows below are.

HOW THE TWO RELATE, measured rather than asserted
--------------------------------------------------
The first version of this file claimed the word-diff count was "strictly weaker". That was
false in both directions, and an adversarial review found three cases proving it. They are
`--verify` arms now, not prose:

    frontmatter `---` delimiters deleted    word-diff 2   v1: PASSED (a parser bug)
    lines reordered, each gaining text      word-diff 1   v1: PASSED (unordered matching)
    last token extended, no whitespace      word-diff 1   passes -- see the caveat below

The first two were real defects and are fixed here: hunk parsing no longer discards a removed
line whose text begins with `--`, and matching is now ORDER-PRESERVING, so a reordered line is
a violation. The third is not a defect in either check, but it is not merely an append either
-- see WHAT IT DOES NOT PROVE -- and it is why the relation is a caveat rather than dominance.

So on the changes this tool was built to judge, it catches what the word-diff count catches
and also the whitespace-delimited insertions the count cannot see -- except a line whose last
token was extended without whitespace, which only the count reports. That holds by argument
and not only by measurement: an order-preserving prefix embedding leaves every old token a
subsequence of the new tokens, so a removed token implies either a violation this tool reports
or exactly that last-token extension. The arms below re-derive it on every `--verify` run.

TWO TRAPS REFUSED RATHER THAN DOCUMENTED
-----------------------------------------
* A spec that cannot see the working tree. `origin/main...HEAD` diffs COMMITS, and a control
  experiment that deleted a word from the working tree scored 0 against it and "passed"
  vacuously. The first version of this file claimed such a spec was unconstructible and then
  accepted `--base 'HEAD~1...HEAD'` verbatim -- an asserted refusal is not a refusal. Every
  ref is now resolved with `git rev-parse --verify <ref>^{commit}` and refused if it carries
  `..` or begins with `-`.
* A file the diff never reached scores 0 for the same reason an empty grep does. Each named
  file must produce a diff, and a file NEW at the named path (including the new side of a
  rename) is refused rather than scored -- there is nothing at base to compare against.
  REACHED, never EXISTS, the rule `check-i18n-fence-parity.js` learned in #634.

WHAT IT DOES NOT PROVE
----------------------
That the appended text is correct, or that a file outside the named set is untouched. And the
property accepts several edits that do touch the body, because they are additions at end of
line: appending to a heading changes its anchor slug (which is what an Addendum pointer
targets); appending to a fence opener changes its info-string; two trailing spaces are a
Markdown hard break; appending to `[ref]: url` or to a frontmatter `key: value` changes the
target or the value; and a wholly new line inserted mid-body passes. Read the diff.

Four more, found by review and each a real edit to a real record:

* appending to a fence CLOSER (```` ``` ```` -> ```` ```x ````) stops it closing the fence,
  so everything below renders as code -- the list named the opener only;
* appending to a `---` line turns a closing frontmatter delimiter into YAML content, or
  stops a setext underline being one;
* in a HARD-WRAPPED record -- this docstring, most `RESULT.md` files -- end of line is not
  end of sentence, so a pointer appended at end of line still lands mid-sentence in the
  rendered text. That is the very error this tool was built to catch, and in a wrapped
  document it passes. The fixture's two-sentences-on-one-line shape is what makes the
  mid-sentence arm bite; a wrapped record does not have it;
* appending inside a fenced block that quotes command output rewrites the evidence the
  fence exists to freeze.

The sharpest of these is a line whose LAST TOKEN is extended without whitespace. `x.` ->
`x.[^A5]` is a footnote marker, but `20 of 20` -> `20 of 200`, `5` -> `50` and `not` ->
`nothing` are the same edit to this property, and all four pass. In a record whose lines end
in counts, shas or line numbers that is a value rewrite wearing an append's clothes. It is
the one class the word-diff count reports and this tool does not, so `report()` prints a NOTE
naming it whenever the count is non-zero and this tool finds nothing.
"""

import os
import shutil
import subprocess
import sys
import tempfile

GIT_COMMON = [
    '-c', 'core.autocrlf=false',
    '-c', 'core.quotepath=false',
    # A user's diff.interHunkContext merges hunks closer than N lines, and the gap then
    # appears as context INSIDE the hunk. The order constraint across the gap is lost, so
    # a line moved a few lines away finds its partner and passes. Measured: with
    # interHunkContext=10 the `_moved_line` arm went green. Pinned here, and parse_hunks
    # also splits on a context line so the parser does not depend on winning this race.
    #
    # These two are a REDUNDANT PAIR and neither can be mutation-tested alone -- measured,
    # not assumed: drop the pin -> --verify green; disable the split -> green; drop BOTH
    # -> red. So `npm run mutation-check` reports the split as an uncovered survivor and
    # is right to; the pair is covered only by the two-site mutation recorded here. Before
    # the hostile-config arm existed, dropping both was green too.
    '-c', 'diff.interHunkContext=0',
    # The verdict label is taken from the `diff --git a/X b/Y` header; noprefix and
    # mnemonicPrefix would remove or rename ` b/` and label the verdict with the header.
    '-c', 'diff.noprefix=false',
    '-c', 'diff.mnemonicPrefix=false',
    '--literal-pathspecs',
]


def run_git(args, cwd=None):
    """Run git, returning (exit_code, stdout, stderr).

    Bytes, decoded explicitly: `text=True` decodes with the locale codec, so one invalid
    UTF-8 byte in a changed line raises inside subprocess; and universal-newlines mode
    translates CR to LF, undoing the core.autocrlf override on the Python side.
    """
    proc = subprocess.run(['git', *GIT_COMMON, *args], cwd=cwd, capture_output=True)
    out = proc.stdout.decode('utf-8', errors='surrogateescape')
    err = proc.stderr.decode('utf-8', errors='surrogateescape')
    return proc.returncode, out, err


def split_lines(text):
    """Split on LF only. A lone CR is content, not a terminator."""
    return text.split('\n')


# ── the property ──────────────────────────────────────────────────────────────

def parse_hunks(diff_text):
    """Split a -U0 unified diff into hunks: {old_start, minus, plus}.

    `---`/`+++` are file headers only BEFORE the first `@@` of a file. Inside a hunk, a line
    reading `----` is a removed line whose content is `---` -- a horizontal rule, a YAML
    frontmatter delimiter, a setext underline. The first version skipped those
    unconditionally, so deleting a frontmatter delimiter scored 0 violations while the
    word-diff count scored 2. `_frontmatter_deleted` is the arm, `_v1_parse` the mutant.
    """
    hunks = []
    current = None
    for line in split_lines(diff_text):
        if line.startswith('diff --git '):
            current = None
        elif line.startswith('@@'):
            try:
                old_start = int(line.split(' ')[1][1:].split(',')[0])
            except (IndexError, ValueError):
                old_start = 0
            current = {'old_start': old_start, 'minus': [], 'plus': []}
            hunks.append(current)
        elif current is None:
            continue
        elif line.startswith(' '):
            # A context line can only appear inside a hunk when two hunks were merged.
            # Treat it as a boundary: the lines on either side are separated in the file,
            # so an embedding must not cross it.
            #
            # The new hunk starts after the removed lines already consumed AND this
            # context line; counting the context line alone reported line 5 for a removed
            # line at 7. Dead while the `-c diff.interHunkContext=0` pin holds, but this
            # is the fallback that exists so the parser does not depend on that pin.
            current = {
                'old_start': current['old_start'] + len(current['minus']) + 1,
                'minus': [], 'plus': [],
            }
            hunks.append(current)
        elif line.startswith('-'):
            current['minus'].append(line[1:])
        elif line.startswith('+'):
            current['plus'].append(line[1:])
    return hunks


def fits(old, new):
    """May `new` be `old` with text appended at the end?

    A whitespace-only removed line is not a wildcard. `''` is a prefix of every string, so
    without this an added line of any content would absorb a deleted paragraph separator,
    and `'  '` would absorb any line indented by two spaces.

    An addition made only of CR is a line-terminator change, not an append. Lines are split
    on LF, so a whole-file CRLF save appends `\r` to EVERY line -- measured to report
    `append-only ... violations 0; removed words 0` with no NOTE, a rewrite of every line in
    the file passing in silence. This repository bans committed CRLF outright, so the
    honest verdict is a violation.
    """
    if not new.startswith(old):
        return False
    suffix = new[len(old):]
    if suffix and not suffix.strip('\r'):
        return False
    if old.strip() == '':
        return new.strip() == ''
    return True


def embed(minus, added):
    """Indices of `minus` NOT in a MAXIMUM order-preserving embedding into `added`.

    Order-preserving: matched indices strictly increase on both sides. Greedy-leftmost
    decides the yes/no question exactly -- if an embedding exists greedy finds one, since
    inductively its i-th pick is at or before any valid assignment's i-th index, so a valid
    j_i is always still admissible when greedy reaches step i. `_optimality_holds` checks
    THIS function, the DP, against exhaustive search rather than checking greedy; the two
    agree on the verdict by that argument, and the DP is what runs, so the DP is what is
    verified.

    Greedy is exact for the VERDICT and wrong for the ATTRIBUTION, which is what a human
    acts on. `A B C` -> `B x  C y  A z` lets greedy match A at index 2 and then fail B and
    C, naming two lines that did not move while the one that did goes unnamed. This is the
    standard LCS recurrence instead, so the complement is minimal: it names A.
    """
    rows, cols = len(minus), len(added)
    table = [[0] * (cols + 1) for _ in range(rows + 1)]
    for i in range(rows - 1, -1, -1):
        for j in range(cols - 1, -1, -1):
            best = max(table[i + 1][j], table[i][j + 1])
            if fits(minus[i], added[j]):
                best = max(best, 1 + table[i + 1][j + 1])
            table[i][j] = best

    unmatched, i, j = [], 0, 0
    while i < rows:
        if j >= cols:
            unmatched.append(i)
            i += 1
        elif fits(minus[i], added[j]) and table[i][j] == 1 + table[i + 1][j + 1]:
            i += 1
            j += 1
        elif table[i][j] == table[i + 1][j]:
            unmatched.append(i)
            i += 1
        else:
            j += 1
    return unmatched


def prefix_violations(hunks):
    """Every removed line must survive, in order, as a prefix of a later added line.

    Per hunk, never a global pool: a line moved from one hunk to another is a violation,
    and a global pool would match it. `_moved_line` is the arm, `_global_pool` the mutant.
    """
    violations = []
    for hunk in hunks:
        added = hunk['plus']
        for offset in embed(hunk['minus'], added):
            violations.append({
                'line': hunk['old_start'] + offset,
                'old': hunk['minus'][offset],
                'candidates': added,
            })
    return violations


# Bound at import so a mutant that replaces the global name can still reach the real
# implementation. Without this, _line_zero calls itself and --verify dies with a
# RecursionError -- which the top-level handler reports as exit 2 (measured nothing),
# not exit 1 (a violation), which is the distinction that handler exists to keep.
_REAL_PREFIX_VIOLATIONS = prefix_violations


def word_removals(diff_text):
    """The other signal: removed words in a --word-diff=porcelain diff.

    Reproduces `grep -v '^--- ' | grep -c '^-'` exactly, including its blindness, because
    this number is what a reader of #828 will be holding.
    """
    return sum(
        1 for line in split_lines(diff_text)
        if line.startswith('-') and not line.startswith('--- ')
    )


# ── one file ──────────────────────────────────────────────────────────────────

class Refused(Exception):
    pass


def resolve_ref(ref, cwd=None):
    """Refuse anything that is not a single commit this repository can name."""
    if ref.startswith('-'):
        raise Refused(f'{ref!r}: not a ref — an option cannot be a comparison point.')
    if '..' in ref:
        raise Refused(
            f'{ref!r}: a range, not a commit. A two-dot range hides the working tree and a '
            f'three-dot range diffs commits only — either can make an edited tree look '
            f'append-only. Name a commit with --base, or two with --from/--to.'
        )
    code, out, _ = run_git(['rev-parse', '--verify', '--quiet', f'{ref}^{{commit}}'], cwd=cwd)
    if code != 0 or not out.strip():
        raise Refused(f'{ref!r}: this repository cannot resolve it to a commit.')
    return out.strip()


def header_region(diff_text):
    """The part of a diff before its first hunk, where file-level modes are declared."""
    lines = split_lines(diff_text)
    for index, line in enumerate(lines):
        if line.startswith('@@'):
            return '\n'.join(lines[:index])
    return diff_text


def check_file(path, spec, cwd=None):
    """Return a result dict for one file, or raise Refused when nothing was measured."""
    # --src-prefix/--dst-prefix are FLAGS, so they beat diff.noprefix,
    # diff.mnemonicPrefix and diff.dstPrefix alike; the `reached` label is parsed out of
    # `diff --git a/X b/Y` and every one of those settings would reshape that header.
    # The `-c` pins in GIT_COMMON remain as a second line of defence.
    #
    # These are a REDUNDANT PAIR, measured: drop the flags -> --verify green; drop the
    # pins -> green; drop BOTH -> red. mutation-check reports either alone as an
    # uncovered survivor and is right to. That measurement only became true once the
    # hostile-config arm stopped asserting `'record.md' in stdout` — under diff.noprefix
    # the label becomes `diff --git record.md record.md`, which contains the filename, so
    # the arm passed while the guard it named was gone.
    base_args = ['diff', '--no-ext-diff', '--no-color', '--no-renames',
                 '--src-prefix=a/', '--dst-prefix=b/']

    code, unified, err = run_git([*base_args, '-U0', *spec, '--', path], cwd=cwd)
    if code != 0:
        raise Refused(f'{path}: git diff failed: {err.strip() or "no message"}')
    if not unified.strip():
        raise Refused(
            f'{path}: the diff is EMPTY — unchanged, untracked, or outside this spec. '
            f'A file the diff never reached cannot be shown to be append-only. '
            f'(Pathspecs are literal here: a glob matches a file named with those characters.)'
        )

    headers = [line for line in split_lines(unified) if line.startswith('diff --git ')]
    if len(headers) > 1:
        raise Refused(
            f'{path}: this pathspec reached {len(headers)} files. Name one file per verdict — '
            f'an aggregate says nothing about which of them moved.'
        )
    # Report the file the diff actually reached, not the pathspec. `.` or a glob that matches
    # one changed file gives a correct verdict under a label that names no file.
    reached = headers[0].split(' b/', 1)[-1] if headers else path

    head = header_region(unified)
    if 'new file mode' in head:
        raise Refused(
            f'{path}: NEW at this path in this range — nothing at base to compare against. '
            f'(Under --no-renames this is also the new side of a rename: name the old path, '
            f'or judge the rename separately.)'
        )
    if 'deleted file mode' in head:
        return {'path': reached, 'deleted': True, 'violations': [], 'words': None}
    # Anchored: git prints the Binary line where hunks would be, so it is in the header
    # region. A bare substring test over the whole diff refuses a TEXT file whose changed
    # line quotes the phrase — a guide about git, or this file.
    if any(line.startswith('Binary files ') for line in split_lines(head)):
        raise Refused(f'{path}: binary — this tool compares text lines.')

    code, worddiff, err = run_git(
        [*base_args, '--word-diff=porcelain', *spec, '--', path], cwd=cwd,
    )
    if code != 0:
        raise Refused(f'{path}: git word-diff failed: {err.strip() or "no message"}')

    return {
        'path': reached,
        'deleted': False,
        'violations': prefix_violations(parse_hunks(unified)),
        'words': word_removals(worddiff),
    }


def report(results):
    """Print a verdict per file. Returns the process exit code."""
    bad = 0
    for item in results:
        if item['deleted']:
            print(f"VIOLATION  {item['path']}: the file is DELETED by this diff.")
            bad += 1
            continue
        count = len(item['violations'])
        if count == 0:
            print(
                f"append-only  {item['path']}  "
                f"(violations 0; removed words {item['words']} — the other signal)"
            )
            if item['words']:
                # The one place the word-diff count does work this tool cannot. An
                # order-preserving prefix embedding makes every old token a subsequence of
                # the new ones EXCEPT where a line's last token was extended without
                # whitespace -- which is an append for `x.` -> `x.[^1]` and a value
                # rewrite for `20 of 20` -> `20 of 200` or `not` -> `nothing`.
                print(
                    "    NOTE: a line's last token was extended without whitespace "
                    f"({item['words']} such token(s)). Check each is a marker, not a "
                    "rewritten value — that distinction is outside this property."
                )
            continue
        bad += 1
        print(f"VIOLATION  {item['path']}: {count} original line(s) altered, moved, or removed.")
        for hit in item['violations']:
            print(f"    line {hit['line']} was:")
            print(f"      {hit['old']!r}")
            if hit['candidates']:
                print("    the added line(s) in this hunk:")
                for cand in hit['candidates'][:3]:
                    print(f"      {cand!r}")
            else:
                print("    nothing was added in its place — removed, or moved earlier.")
        if item['words'] == 0:
            print(
                "    NOTE: the --word-diff form published in #828 scores 0 here. "
                "It cannot see a change that removes no whitespace-delimited token."
            )
    return 1 if bad else 0


# ── self-test ─────────────────────────────────────────────────────────────────

SELFTEST_GIT = [
    '-c', 'user.name=append-only-verify',
    '-c', 'user.email=append-only-verify@localhost',
    '-c', 'init.defaultBranch=main',
]


SCRUBBED_GIT_VARS = (
    'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
    'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_CEILING_DIRECTORIES',
)


def scrub_environ():
    """Apply the scrub to os.environ for the duration of the self-test.

    Scrubbing only the env passed to subprocess.run was NOT enough, and the `expect=`
    assertion on the refusal arms is what caught it: `check_file` and `resolve_ref` run
    IN-PROCESS through `run_git`, which reads os.environ, so under a caller's GIT_DIR the
    arms were still pointed at the caller's repository and the new-file arm refused with
    'the diff is EMPTY' instead of 'NEW at this path'. One scrub, at the one place the
    self-test begins, covers in-process calls and subprocesses alike.

    Returns the original mapping so the caller can restore it.
    """
    original = dict(os.environ)
    for name in SCRUBBED_GIT_VARS:
        os.environ.pop(name, None)
    os.environ['GIT_CONFIG_GLOBAL'] = os.devnull
    os.environ['GIT_CONFIG_SYSTEM'] = os.devnull
    return original


def selftest_env():
    """An environment in which the self-test cannot reach the caller's repository.

    MEASURED, not hypothetical: with `GIT_DIR` set — the state every git hook exports —
    `cwd=repo` is not enough. Git honours an absolute GIT_DIR over cwd, so `git init` on
    the temp fixture reinitialised the caller's repository and `add`/`commit` wrote the
    fixture into its history: a throwaway repo went from 1 commit to 6, and `--verify`
    exited 0 while doing it. A tool a maintainer runs by hand must not be able to do that.

    The config vars are scrubbed for a second reason: a global `commit.gpgsign`,
    `core.hooksPath` or `init.templateDir` would otherwise redden the self-test from
    outside it, and arm 6 injects `GIT_CONFIG_*` deliberately — this makes that injection
    the only config in play rather than one voice among several.
    """
    env = dict(os.environ)
    for name in SCRUBBED_GIT_VARS:
        env.pop(name, None)
    env['GIT_CONFIG_GLOBAL'] = os.devnull
    env['GIT_CONFIG_SYSTEM'] = os.devnull
    return env

# Frontmatter delimiters and a bare rule are load-bearing: they are the lines the v1 parser
# discarded. Line 5 is blank on purpose. Line 4 carries two sentences, the shape that makes
# the word-diff form blind. Lines: 1 ---, 2 title, 3 ---, 4 prose, 5 blank, 6 evidence,
# 7 ---, 8 closing. EXPECTED_LINES below is keyed to exactly that.
FIXTURE = (
    "---\n"
    "title: leadless coordination\n"
    "---\n"
    "The falsification protocol is runnable today with zero catalogue changes (#283). "
    "For #282, the recommended fix is to evolve shapeshifter.\n"
    "\n"
    "Key repo evidence: teams/opaque-team.md:22,85 and guides/agent-best-practices.md:256-288\n"
    "---\n"
    "A closing line.\n"
) + 'A line with a lone \r carriage return and an accented byte \xe9\n'

POINTER = ' -> *anchors re-checked, Addendum A5*'
# A lone CR mid-line, and a byte that is not valid UTF-8 under a strict codec. Both are
# claims the docstring makes about run_git and split_lines; without them, a `text=True`
# mutant and a `splitlines()` mutant both survive.
ODDITIES = 'A line with a lone \r carriage return and an accented byte \xe9\n'
EVIDENCE = 'Key repo evidence: teams/opaque-team.md:22,85 and guides/agent-best-practices.md:256-288'


def _end_of_line(text):
    return text.replace('to evolve shapeshifter.', f'to evolve shapeshifter.{POINTER}')


def _mid_sentence(text):
    return text.replace('changes (#283). For #282,', f'changes (#283).{POINTER} For #282,')


def _append_block(text):
    return text + '\n## Addendum A1, 2026-09-15\n\nNew material only.\n'


def _crlf_saved(text):
    """The whole file re-saved with CRLF endings.

    Every line gains `\\r`, which is a rewrite of every line. Measured before the fix:
    `append-only ... violations 0; removed words 0`, no NOTE -- silent.
    """
    return text.replace('\n', '\r\n')


def _oddities_appended(text):
    """Append to the line carrying a lone CR and a non-UTF-8 byte.

    `splitlines()` would split that line at the CR and judge two half-lines; `text=True`
    would translate the CR away, so removing it would read as append-only. A strict decode
    would raise on the accented byte and exit 1, which the contract reserves for a
    violation.
    """
    return text.replace(ODDITIES, ODDITIES.rstrip('\n') + ' appended\n')


def _cr_removed(text):
    """The lone CR deleted while text is appended — a real alteration of the line."""
    return text.replace(ODDITIES, ODDITIES.replace('\r', '').rstrip('\n') + ' appended\n')


def _append_no_space(text):
    """Not a violation: an append that changes the last token. word-diff flags it; we do not."""
    return text.replace('to evolve shapeshifter.', 'to evolve shapeshifter.[^A5]')


def _delete_word(text):
    return text.replace('runnable today with zero', 'runnable with zero')


def _delete_line(text):
    return text.replace('A closing line.\n', '')


def _frontmatter_deleted(text):
    """The v1 parser bug: removed lines whose text begins with `--`."""
    return text.replace('---\ntitle: leadless coordination\n---\n',
                        'title: leadless coordination\n')


def _bare_rule_deleted(text):
    return text.replace(f'{EVIDENCE}\n---\n', f'{EVIDENCE}\n')


def _reorder(text):
    """Two adjacent prose lines swap places, each gaining text — v1 matching reported 0.

    Deliberately NOT swapping with the `---` line: that would also exercise the parser and
    entangle two arms, so a parser regression and a matcher regression would be
    indistinguishable here.
    """
    return text.replace(
        f'{EVIDENCE}\n---\nA closing line.\n',
        f'A closing line. x\n{EVIDENCE} x\n---\n',
    )


def _moved_line(text):
    """A line moved from the middle to EOF, gaining text.

    Two SEPARATE hunks — a deletion at line 2 and an addition after line 8. Moving the last
    line instead would put both sides in one hunk at line 8, where it is an ordinary
    end-of-line append and correctly passes.
    """
    return text.replace('title: leadless coordination\n', '') + 'title: leadless coordination moved\n'


def _rewrite_prefix(text):
    return text.replace('Key repo evidence:', 'Evidence:')


def _rotate_three(text):
    """Three lines rotate, each gaining text. Only the FIRST actually moved.

    Greedy-leftmost matches it at the last added index and then fails the other two,
    naming two lines that did not move. The maximum embedding names one line: the prose
    line at 4. This arm exists for the line NUMBERS, not the exit code.
    """
    return text.replace(
        f'{EVIDENCE}\n---\nA closing line.\n',
        f'--- x\nA closing line. x\n{EVIDENCE} x\n',
    )


def _last_token_extended(text):
    """A value rewrite that this property cannot distinguish from an append."""
    return text.replace('A closing line.', 'A closing line.[^A5]')


def _blank_line_deleted(text):
    return _end_of_line(text).replace(f'{POINTER}\n\n', f'{POINTER}\n')


def _blank_becomes_pointer(text):
    """A blank line overwritten with text, beside another change in the same hunk."""
    return _end_of_line(text).replace(f'{POINTER}\n\n', f'{POINTER}\n-> see A5\n')


# label, mutate, expected exit, expected word-diff removals (None = do not assert)
ARMS = [
    ('end-of-line pointer (the correct move)', _end_of_line, 0, 0),
    ('appended block at EOF', _append_block, 0, 0),
    ('append with no space before it (word-diff flags, we do not)', _append_no_space, 0, 1),
    ('MID-SENTENCE pointer (the error made 3x in #828)', _mid_sentence, 1, 0),
    ('frontmatter --- delimiters deleted (v1 parser passed this)', _frontmatter_deleted, 1, None),
    ('a bare --- rule deleted', _bare_rule_deleted, 1, None),
    ('adjacent lines reordered, each gaining text (v1 passed this)', _reorder, 1, None),
    ('a line moved to EOF, gaining text (two hunks)', _moved_line, 1, None),
    ('a word deleted mid-line', _delete_word, 1, None),
    ('a whole line deleted', _delete_line, 1, None),
    ('a line rewritten at its start', _rewrite_prefix, 1, None),
    ('a blank line deleted', _blank_line_deleted, 1, None),
    ('a blank line overwritten with text', _blank_becomes_pointer, 1, None),
    ('three lines rotate; only the first moved', _rotate_three, 1, None),
    ('last token extended without whitespace (we pass, count flags)',
     _last_token_extended, 0, 1),
    ('append to a line carrying a lone CR and a non-UTF-8 byte', _oddities_appended, 0, 0),
    ('the lone CR removed while text is appended', _cr_removed, 1, None),
    ('the whole file re-saved with CRLF endings', _crlf_saved, 1, None),
]

# arm label -> the old-file line numbers every violation must be reported at.
# A mutant that mis-parses `@@ -a,b` survives an exit-code-only suite; the line number is
# what a human acts on.
EXPECTED_LINES = {
    'MID-SENTENCE pointer (the error made 3x in #828)': [4],
    'a bare --- rule deleted': [7],
    'a line rewritten at its start': [6],
    'a blank line deleted': [5],
    'a whole line deleted': [8],
    # Attribution, not just the verdict. The maximum embedding keeps `---` and the
    # closing line in place and names line 6, the one that moved to the end.
    # Greedy-leftmost matches line 6 at the last added index and then names 7 and 8,
    # which did not move — that is the `_greedy_attribution` mutant.
    'three lines rotate; only the first moved': [6],
}

# A label typo would silently drop its line assertion — the assertion would simply never
# be consulted. Keys are checked against the arm list instead.
assert set(EXPECTED_LINES) <= {label for label, *_ in ARMS}, (
    f'EXPECTED_LINES names no such arm: {set(EXPECTED_LINES) - {l for l, *_ in ARMS}}'
)


def _write(target, text):
    # Bytes, and surrogateescape, so a lone CR and a non-UTF-8 byte reach the file intact:
    # text mode with newline='\n' still writes what it is given, but encoding must not
    # refuse the byte the oddities line carries.
    with open(target, 'wb') as handle:
        handle.write(text.encode('utf-8', errors='surrogateescape'))


def _commit(repo, message):
    env = selftest_env()
    subprocess.run(['git', *SELFTEST_GIT, 'add', '-A'], cwd=repo, check=True,
                   capture_output=True, env=env)
    subprocess.run(['git', *SELFTEST_GIT, 'commit', '-q', '-m', message],
                   cwd=repo, check=True, capture_output=True, env=env)


def _selftest_repo():
    path = tempfile.mkdtemp(prefix='append-only-verify-')
    subprocess.run(['git', *SELFTEST_GIT, 'init', '-q', path], check=True,
                   capture_output=True, env=selftest_env())
    target = os.path.join(path, 'record.md')
    _write(target, FIXTURE)
    _commit(path, 'the record as written')
    return path, target


def _optimality_holds():
    """Greedy-leftmost decides the embedding question exactly; the DP agrees with it.

    Exhaustive over a dense prefix alphabet. The docstring on `embed` argues this by an
    exchange argument; an argument in a comment is not a check. Returns (cases, mismatches,
    control) — the control is an order-IGNORING matcher, which must disagree, or the
    comparison could not detect a wrong algorithm at all.
    """
    from itertools import combinations, product

    alphabet = ['', 'a', 'ab', 'abc', 'b', 'ba']

    def exhaustive(minus, added):
        if not minus:
            return True
        return any(
            all(fits(o, added[j]) for o, j in zip(minus, combo))
            for combo in combinations(range(len(added)), len(minus))
        )

    def unordered(minus, added):
        used = set()
        for old in minus:
            hit = next((j for j in range(len(added)) if j not in used and fits(old, added[j])),
                       None)
            if hit is None:
                return False
            used.add(hit)
        return True

    # 67081 = 259**2 = (1 + 6 + 36 + 216)**2. Narrowing the sweep to range(3) still
    # reports 0 mismatches with a non-zero control -- green, smaller, and nobody would
    # notice. The caller asserts this closed form.
    cases = mismatches = control = 0
    for rows in range(4):
        for cols in range(4):
            for minus in product(alphabet, repeat=rows):
                for added in product(alphabet, repeat=cols):
                    minus, added = list(minus), list(added)
                    cases += 1
                    truth = exhaustive(minus, added)
                    if (not embed(minus, added)) != truth:
                        mismatches += 1
                    if unordered(minus, added) != truth:
                        control += 1
    return cases, mismatches, control


COMPARISON = [
    ('mid-sentence pointer', _mid_sentence, (0, 1)),
    ('end-of-line pointer', _end_of_line, (0, 0)),
    ('frontmatter --- deleted', _frontmatter_deleted, (2, 2)),
    ('adjacent lines reordered', _reorder, (1, 1)),
    ('append with no space', _append_no_space, (1, 0)),
]


def verify():
    """Re-derive every claim in this file's docstring. Non-zero when one stops holding."""
    saved_environ = scrub_environ()
    repo, target = _selftest_repo()
    failures = []
    refusals = []
    # Captured, never HEAD~N: an arm below adds commits, and a relative ref would then
    # point somewhere else while still resolving. That is the shape of a vacuous arm.
    #
    # Read with run_git, NOT resolve_ref: the harness must not route through a function
    # --selftest-negative mutates. It did, and the resolve_ref mutant corrupted the
    # fixture instead of being caught by it — the harness returned the literal 'HEAD',
    # the comparison then compared the tree against a moved HEAD, and --verify died on an
    # uncaught refusal. A mutant must break the SUBJECT, never the instrument.
    base_commit = run_git(['rev-parse', 'HEAD'], cwd=repo)[1].strip()
    try:
        print('=== arms: each mutation of the fixture, against --base HEAD ===\n')
        for label, mutate, expected, expected_words in ARMS:
            _write(target, mutate(FIXTURE))
            try:
                result = check_file('record.md', ['HEAD'], cwd=repo)
                actual = report([result])
                words = result['words']
                lines = [item['line'] for item in result['violations']]
            except Refused as exc:
                actual, words, lines = 2, None, []
                print(f'REFUSED  {exc}')
            ok = actual == expected
            if expected_words is not None and words != expected_words:
                ok = False
                print(f'    word-diff removals {words}, expected {expected_words}')
            if label in EXPECTED_LINES and lines != EXPECTED_LINES[label]:
                ok = False
                print(f'    reported at lines {lines}, expected {EXPECTED_LINES[label]}')
            print(f"  [{'ok' if ok else '**FAIL**'}] exit {actual} (expected {expected})  {label}\n")
            if not ok:
                failures.append(label)
            _write(target, FIXTURE)

        print('=== refusals: a run that measured nothing must not report success ===\n')

        def refuses(label, call, expect):
            # `expect` is required. An arm that accepts ANY Refused passes on whichever
            # refusal fires first: one CLI arm did exactly that, passing on the empty-diff
            # refusal while the ref refusal it named was deleted. Changing the fixture
            # fixed that instance; asserting the reason is what closes the class.
            refusals.append(label)
            try:
                call()
                print(f'  [**FAIL**] {label}: accepted, not refused')
                failures.append(label)
            except Refused as exc:
                if expect in str(exc):
                    print(f'  [ok] {label}: {str(exc)[:58]}...')
                else:
                    print(f'  [**FAIL**] {label}: refused for the WRONG reason — '
                          f'wanted {expect!r}, got {str(exc)[:70]!r}')
                    failures.append(label)

        refuses('an unchanged file', lambda: check_file('record.md', ['HEAD'], cwd=repo), expect='the diff is EMPTY')
        refuses('an unknown path', lambda: check_file('no-such-file.md', ['HEAD'], cwd=repo), expect='the diff is EMPTY')
        refuses('a three-dot range', lambda: resolve_ref('HEAD~1...HEAD', cwd=repo), expect='a range, not a commit')
        refuses('a two-dot range', lambda: resolve_ref('HEAD~1..HEAD', cwd=repo), expect='a range, not a commit')
        refuses('an option where a ref belongs', lambda: resolve_ref('--cached', cwd=repo), expect='not a ref')
        refuses('an unresolvable ref', lambda: resolve_ref('no-such-ref', cwd=repo), expect='cannot resolve it to a commit')
        refuses('no file named', lambda: parse_args(['--base', 'HEAD']), expect='name at least one file')
        refuses('no comparison named', lambda: parse_args(['record.md']), expect='name a comparison')
        refuses('both --base and --from', lambda: parse_args(
            ['--base', 'HEAD', '--from', 'HEAD', '--to', 'HEAD', 'record.md']),
            expect='Pick one')
        refuses('--base as the last token', lambda: parse_args(['record.md', '--base']), expect='needs a commit after it')

        _write(target, _end_of_line(FIXTURE))
        _commit(repo, 'append a pointer at end of line')
        _write(os.path.join(repo, 'fresh.md'), 'brand new file\n')
        _write(os.path.join(repo, 'untouched.md'), 'never edited after this\n')
        _commit(repo, 'add a new file')
        refuses('a file NEW at the named path',
                lambda: check_file('fresh.md', [base_commit, 'HEAD'], cwd=repo),
                expect='NEW at this path')

        print('\n=== a violation that is not a refusal ===\n')
        os.remove(target)
        result = check_file('record.md', ['HEAD'], cwd=repo)
        if result['deleted'] and report([result]) == 1:
            print('  [ok] a deleted file is a violation, not a refusal')
        else:
            print('  [**FAIL**] a deleted file was not caught')
            failures.append('deleted file')
        run_git(['checkout', '--', 'record.md'], cwd=repo)

        print('\n=== the CLI end to end: main(), its refusals, and the exit contract ===\n')
        # Deleting one line of main() -- the resolve_ref call -- restored the round-1
        # blocking bug while every arm above and every mutant below stayed green. A guard
        # on the component is not a guard on the wiring, so these run the real CLI in a
        # subprocess and read its exit code.
        # HEAD already carries the end-of-line pointer by this point, so these mutate the
        # HEAD content: writing FIXTURE's own variants back would produce an empty diff and
        # be refused, which would test the refusal rather than the wiring.
        head_text = _end_of_line(FIXTURE)
        # The three-dot arm must be NON-VACUOUS: HEAD~2..HEAD changed record.md
        # append-only, while the working tree holds a real violation. Without the ref
        # refusal the range answers 0 and the tree's violation is invisible — which is the
        # bug. Pointing it at a range where record.md did not change would make the arm
        # pass on the EMPTY-diff refusal instead, testing nothing. Measured: with
        # `spec = [resolve_ref(...)]` deleted from main(), this arm returns 0 and fails.
        cli_arms = [
            ('a three-dot spec is refused by the CLI', _rewrite_prefix,
             ['--base', f'{base_commit}...HEAD', 'record.md'], 2),
            ('an unknown option is refused by the CLI', _append_block,
             ['--nope', 'record.md'], 2),
            ('a violation exits 1 through the CLI', _rewrite_prefix,
             ['--base', 'HEAD', 'record.md'], 1),
            ('an append exits 0 through the CLI', _append_block,
             ['--base', 'HEAD', 'record.md'], 0),
        ]
        for label, mutate, argv, expected in cli_arms:
            _write(target, mutate(head_text))
            proc = subprocess.run(
                [sys.executable, os.path.abspath(__file__), *argv],
                cwd=repo, capture_output=True, env=selftest_env(),
            )
            ok = proc.returncode == expected
            print(f"  [{'ok' if ok else '**FAIL**'}] exit {proc.returncode} "
                  f'(expected {expected})  {label}')
            if not ok:
                failures.append(label)
            _write(target, head_text)

        print('\n=== the input git hands us, and the paths we are asked about ===\n')
        # Every arm here guards a fix that a call-site audit found DELETABLE with the
        # suite green: each was a repair made in response to review and then left
        # unguarded. The audit is the reason this section exists.
        input_arms = []

        def records(label, ok, detail=''):
            input_arms.append(label)
            print(f"  [{'ok' if ok else '**FAIL**'}] {label}{detail}")
            if not ok:
                failures.append(label)

        # 1. A pathspec reaching more than one file must be refused, not aggregated.
        _write(target, _rewrite_prefix(head_text))
        _write(os.path.join(repo, 'second.md'), 'a second changed file\n')
        run_git(['add', '-A'], cwd=repo)
        try:
            check_file('.', ['HEAD'], cwd=repo)
            records('a pathspec reaching two files is refused', False)
        except Refused as exc:
            records('a pathspec reaching two files is refused',
                    'reached 2 files' in str(exc), f' — {str(exc)[:58]}...')
        run_git(['rm', '-q', '--cached', 'second.md'], cwd=repo)
        os.remove(os.path.join(repo, 'second.md'))

        # 2. The verdict is labelled with the file the diff REACHED, not the pathspec.
        result = check_file('.', ['HEAD'], cwd=repo)
        records('a directory pathspec is labelled with the file it reached',
                result['path'] == 'record.md', f" — {result['path']}")
        _write(target, head_text)

        # 3. `deleted file mode` must be read from the header region. A text file whose
        #    CHANGED line quotes the phrase is not a deletion.
        quoting = os.path.join(repo, 'quoting.md')
        _write(quoting, 'A guide about git output.\ndeleted file mode 100644 is a header line\n')
        _commit(repo, 'a file that quotes diff header phrases')
        _write(quoting, 'A guide about git output.\n'
                        'deleted file mode 100644 is a header line -> ptr\n')
        result = check_file('quoting.md', ['HEAD'], cwd=repo)
        records('a text line quoting "deleted file mode" is not a deletion',
                not result['deleted'] and not result['violations'])
        _write(quoting, 'A guide about git output.\n'
                        'deleted file mode 100644 is a header line\n')

        # 4. Every named path is checked, not only the first.
        _write(quoting, 'A guide about git output.\nrewritten entirely\n')
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD',
             'record.md', 'quoting.md'],
            cwd=repo, capture_output=True,
        )
        _write(target, _append_block(head_text))
        proc_both = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD',
             'record.md', 'quoting.md'],
            cwd=repo, capture_output=True,
        )
        records('a violation in the SECOND named path is reported',
                proc_both.returncode == 1, f' — exit {proc_both.returncode}')
        _write(quoting, 'A guide about git output.\n'
                        'deleted file mode 100644 is a header line\n')
        _write(target, head_text)

        # 5. A pathspec is literal: a name carrying glob characters is that name.
        bracket = os.path.join(repo, 'a[1].md')
        _write(bracket, 'the literal bracket file\n')
        _write(os.path.join(repo, 'a1.md'), 'the glob-expansion decoy\n')
        _commit(repo, 'a file whose name carries glob characters')
        _write(os.path.join(repo, 'a1.md'), 'the glob-expansion decoy, rewritten\n')
        try:
            check_file('a[1].md', ['HEAD'], cwd=repo)
            records('a glob-shaped path is literal, not expanded', False)
        except Refused:
            records('a glob-shaped path is literal, not expanded', True)
        _write(os.path.join(repo, 'a1.md'), 'the glob-expansion decoy\n')

        # 6. Hunks must not merge under a hostile diff.interHunkContext. Measured: with
        #    interHunkContext=10 the moved-line arm went green, so move detection was
        #    defeated by a setting in the caller's own git config.
        _write(target, _moved_line(head_text))
        hostile = dict(os.environ, GIT_CONFIG_COUNT='1',
                       GIT_CONFIG_KEY_0='diff.interHunkContext',
                       GIT_CONFIG_VALUE_0='10')
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD', 'record.md'],
            cwd=repo, capture_output=True, env=hostile,
        )
        records('a moved line is caught under a hostile diff.interHunkContext',
                proc.returncode == 1, f' — exit {proc.returncode}')
        _write(target, head_text)

        # 7. A binary file is refused, and a TEXT file quoting a diff header phrase is
        #    not. The round-2 regression was exactly this anchor, and nothing guarded it.
        blob = os.path.join(repo, 'blob.bin')
        with open(blob, 'wb') as handle:
            handle.write(b'\x00\x01\x02binary\x00payload\n')
        _commit(repo, 'a binary file')
        with open(blob, 'wb') as handle:
            handle.write(b'\x00\x01\x02binary\x00payload changed\n')
        try:
            check_file('blob.bin', ['HEAD'], cwd=repo)
            records('a binary file is refused', False)
        except Refused as exc:
            records('a binary file is refused', 'binary' in str(exc))

        phrases = os.path.join(repo, 'phrases.md')
        _write(phrases, 'Binary files a/x and b/x differ\nnew file mode 100644\n')
        _commit(repo, 'a file quoting two more header phrases')
        _write(phrases, 'Binary files a/x and b/x differ -> ptr\n'
                        'new file mode 100644 -> ptr\n')
        try:
            result = check_file('phrases.md', ['HEAD'], cwd=repo)
            records('text lines quoting "Binary files" and "new file mode" are judged, '
                    'not refused', not result['deleted'] and not result['violations'])
        except Refused as exc:
            records('text lines quoting "Binary files" and "new file mode" are judged, '
                    'not refused', False, f' — {str(exc)[:56]}...')
        _write(phrases, 'Binary files a/x and b/x differ\nnew file mode 100644\n')

        # 8. core.quotepath defaults to TRUE, so a non-ASCII path is escaped in the
        #    `diff --git` header and the verdict would be labelled with the whole header.
        #    No hostile environment needed — this is the default everywhere.
        accented = os.path.join(repo, 'résumé.md')
        _write(accented, 'a line in a file with an accented name\n')
        _commit(repo, 'a file with a non-ASCII name')
        _write(accented, 'a line in a file with an accented name -> ptr\n')
        result = check_file('résumé.md', ['HEAD'], cwd=repo)
        records('a non-ASCII path is labelled with its real name',
                result['path'] == 'résumé.md', f" — {result['path']}")
        _write(accented, 'a line in a file with an accented name\n')

        # 9. Hostile git config, one row per pin or flag that shapes what we parse.
        #    Flags beat config, which is why the prefixes moved to --src-prefix/--dst-prefix.
        _write(target, _rewrite_prefix(head_text))
        for key, value in [('diff.noprefix', 'true'), ('diff.mnemonicPrefix', 'true'),
                           ('color.ui', 'always'), ('diff.external', '/bin/false'),
                           ('core.quotepath', 'true')]:
            env = dict(selftest_env(), GIT_CONFIG_COUNT='1',
                       GIT_CONFIG_KEY_0=key, GIT_CONFIG_VALUE_0=value)
            proc = subprocess.run(
                [sys.executable, os.path.abspath(__file__), '--base', 'HEAD', 'record.md'],
                cwd=repo, capture_output=True, env=env, text=True,
            )
            # `'record.md' in stdout` was NOT enough: under diff.noprefix the label
            # becomes the whole `diff --git record.md record.md` header, which contains
            # the filename, so the arm passed while the guard it named was deleted.
            # Measured as a vacuous arm; the verdict line is asserted exactly.
            records(f'a violation survives hostile {key}={value}',
                    proc.returncode == 1 and 'VIOLATION  record.md:' in proc.stdout,
                    f' — exit {proc.returncode}')
        _write(target, head_text)

        # 10. A refusal on one named path must not discard another's violation, and the
        #     NOTE strings report() prints are asserted rather than merely produced —
        #     no arm read stdout, so deleting either NOTE parsed and survived.
        _write(target, _rewrite_prefix(head_text))
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD',
             'record.md', 'untouched.md'],
            cwd=repo, capture_output=True, text=True, env=selftest_env(),
        )
        records('a violation is reported even when a later path is refused',
                proc.returncode == 1 and 'VIOLATION' in proc.stdout
                and 'REFUSED' in proc.stdout, f' — exit {proc.returncode}')
        _write(target, head_text)

        _write(target, _mid_sentence(head_text))
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD', 'record.md'],
            cwd=repo, capture_output=True, text=True, env=selftest_env(),
        )
        records('the word-diff NOTE is printed on a violation it cannot see',
                'published in #828 scores 0 here' in proc.stdout)
        _write(target, _last_token_extended(head_text))
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD', 'record.md'],
            cwd=repo, capture_output=True, text=True, env=selftest_env(),
        )
        records('the last-token NOTE is printed on a clean pass with a non-zero count',
                proc.returncode == 0 and 'extended without whitespace' in proc.stdout)
        _write(target, head_text)

        # 11. An unexpected failure measured nothing, so it is exit 2, never exit 1 —
        #    which the contract reserves for a violation. git absent is the cheap instance.
        proc = subprocess.run(
            [sys.executable, os.path.abspath(__file__), '--base', 'HEAD', 'record.md'],
            cwd=repo, capture_output=True, env={'PATH': '/nonexistent-for-this-arm'},
        )
        records('an unexpected failure exits 2, not 1', proc.returncode == 2,
                f' — exit {proc.returncode}')

        print('\n=== the embedding is exact: exhaustive, with a control ===\n')
        cases, mismatches, control = _optimality_holds()
        print(f'  {cases} cases   mismatches vs exhaustive search: {mismatches}   '
              f'order-ignoring control disagrees on {control}')
        expected_cases = sum(len(['', 'a', 'ab', 'abc', 'b', 'ba']) ** n for n in range(4)) ** 2
        if cases != expected_cases:
            print(f'  [**FAIL**] the sweep covered {cases} cases, not {expected_cases} — '
                  f'a narrowed sweep is still green and still reports 0 mismatches')
            failures.append('exactness sweep size')
        if mismatches:
            print('  [**FAIL**] the embedding is not exact')
            failures.append('embedding exactness')
        elif control == 0:
            print('  [**FAIL**] the control agrees too — this comparison proves nothing')
            failures.append('exactness control is vacuous')
        else:
            print('  [ok] exact, and the comparison can tell a wrong matcher apart')

        print('\n=== the comparison with the published word-diff form, restated ===\n')
        base = base_commit
        for label, mutate, expected_pair in COMPARISON:
            _write(target, mutate(FIXTURE))
            item = check_file('record.md', [base], cwd=repo)
            pair = (item['words'], len(item['violations']))
            flag = 'ok' if pair == expected_pair else '**FAIL**'
            print(f"  [{flag}] {label:26} word-diff {pair[0]}   this tool {pair[1]}")
            if pair != expected_pair:
                failures.append(f'comparison row: {label} gave {pair}, expected {expected_pair}')
        _write(target, FIXTURE)
    finally:
        shutil.rmtree(repo, ignore_errors=True)
        os.environ.clear()
        os.environ.update(saved_environ)

    if failures:
        print(f'\nFAILED: {len(failures)} claim(s) no longer hold')
        for item in failures:
            print(f'  {item}')
        return 1
    print(f'\nOK: {len(ARMS)} arms, {len(refusals)} refusals, 1 deletion verdict, '
          f'{len(cli_arms)} CLI arms, {len(input_arms)} input arms, exactness exhaustive, '
          f'{len(COMPARISON)} comparison rows')
    return 0


# ── mutants: each must make verify() go red ───────────────────────────────────

def _always_clean(hunks):
    return []


def _unordered(hunks):
    """The v1 matching: any partner in the hunk, longest first."""
    violations = []
    for hunk in hunks:
        pool = list(hunk['plus'])
        order = sorted(enumerate(hunk['minus']), key=lambda pair: len(pair[1]), reverse=True)
        for offset, old in order:
            match = next((new for new in pool if new.startswith(old)), None)
            if match is None:
                violations.append({'line': hunk['old_start'] + offset, 'old': old,
                                   'candidates': list(pool)})
            else:
                pool.remove(match)
    return violations


def _global_pool(hunks):
    """Pool added lines across all hunks, so a moved line finds a partner."""
    added = [line for hunk in hunks for line in hunk['plus']]
    violations = []
    for hunk in hunks:
        for offset, old in enumerate(hunk['minus']):
            match = next((new for new in added if new.startswith(old)), None)
            if match is None:
                violations.append({'line': hunk['old_start'] + offset, 'old': old,
                                   'candidates': []})
            else:
                added.remove(match)
    return violations


def _empty_matches_anything(hunks):
    """Let an empty removed line absorb any added line."""
    violations = []
    for hunk in hunks:
        added, cursor = hunk['plus'], 0
        for offset, old in enumerate(hunk['minus']):
            index = cursor
            while index < len(added) and not added[index].startswith(old):
                index += 1
            if index < len(added):
                cursor = index + 1
            else:
                violations.append({'line': hunk['old_start'] + offset, 'old': old,
                                   'candidates': added[cursor:]})
    return violations


def _line_zero(hunks):
    """Report every violation at line 0 — the number a human acts on."""
    found = _REAL_PREFIX_VIOLATIONS(hunks)
    for item in found:
        item['line'] = 0
    return found


def _v1_parse(diff_text):
    """The v1 parser, which discarded removed lines beginning with `--`."""
    hunks, current = [], None
    for line in split_lines(diff_text):
        if line.startswith('@@'):
            try:
                old_start = int(line.split(' ')[1][1:].split(',')[0])
            except (IndexError, ValueError):
                old_start = 0
            current = {'old_start': old_start, 'minus': [], 'plus': []}
            hunks.append(current)
        elif current is None:
            continue
        elif line.startswith('---') or line.startswith('+++'):
            continue
        elif line.startswith('-'):
            current['minus'].append(line[1:])
        elif line.startswith('+'):
            current['plus'].append(line[1:])
    return hunks


def _counts_header(diff_text):
    return sum(1 for line in split_lines(diff_text) if line.startswith('-'))


def _fits_wildcard_blank(old, new):
    """Let a whitespace-only removed line absorb any added line."""
    return new.startswith(old)


def _splitlines(text):
    """Split on every line terminator, so a lone CR splits a line in two."""
    return text.splitlines()


def _greedy_attribution(hunks):
    """Greedy-leftmost: the right verdict, the wrong lines named."""
    violations = []
    for hunk in hunks:
        added, cursor = hunk['plus'], 0
        for offset, old in enumerate(hunk['minus']):
            index = cursor
            while index < len(added) and not fits(old, added[index]):
                index += 1
            if index < len(added):
                cursor = index + 1
            else:
                violations.append({'line': hunk['old_start'] + offset, 'old': old,
                                   'candidates': added})
    return violations


def _accept_any_ref(ref, cwd=None):
    """The v1 behaviour: hand any string to git unvalidated."""
    return ref


MUTANTS = {
    'prefix_violations: always reports zero': ('prefix_violations', _always_clean),
    'prefix_violations: unordered match (the v1 bug)': ('prefix_violations', _unordered),
    'prefix_violations: pools added lines across hunks': ('prefix_violations', _global_pool),
    'prefix_violations: an empty line matches anything': ('prefix_violations',
                                                          _empty_matches_anything),
    'prefix_violations: every violation at line 0': ('prefix_violations', _line_zero),
    'parse_hunks: discards removed lines beginning -- (v1)': ('parse_hunks', _v1_parse),
    'word_removals: counts the --- a/FILE diff header': ('word_removals', _counts_header),
    'resolve_ref: accepts any string (the asserted refusal)': ('resolve_ref', _accept_any_ref),
    'fits: a whitespace-only line matches anything': ('fits', _fits_wildcard_blank),
    'split_lines: splits on a lone CR too': ('split_lines', _splitlines),
    'prefix_violations: greedy attribution (wrong lines named)': ('prefix_violations',
                                                                  _greedy_attribution),
}


def selftest_negative():
    """Break the checker itself and confirm --verify goes red for each break."""
    import contextlib
    import io

    globals_ = globals()
    survivors = []
    print('=== negative evidence: each mutant of the checker, against --verify ===\n')
    for label, (target, mutant) in MUTANTS.items():
        original = globals_[target]
        globals_[target] = mutant
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                code = verify()
        finally:
            globals_[target] = original
        killed = code != 0
        print(f"  {label:54} -> {'KILLED' if killed else '*** SURVIVED ***'}")
        if not killed:
            survivors.append(label)

    with contextlib.redirect_stdout(io.StringIO()):
        baseline = verify()
    print(f"\n  baseline (unmutated) -> {'green' if baseline == 0 else '*** RED ***'}")
    if baseline != 0:
        survivors.append('baseline is not green — the kills above prove nothing')

    if survivors:
        print(f'\nFAILED: {len(survivors)} mutant(s) survived')
        for item in survivors:
            print(f'  {item}')
        return 1
    print(f'\nOK: {len(MUTANTS)} of {len(MUTANTS)} mutants killed, baseline green')
    return 0


# ── entry point ───────────────────────────────────────────────────────────────

def parse_args(args):
    """Return (spec, paths), or raise Refused."""
    base, frm, to, paths = None, None, None, []
    index = 0
    while index < len(args):
        token = args[index]
        if token in ('--base', '--from', '--to'):
            if index + 1 >= len(args):
                raise Refused(f'{token} needs a commit after it.')
            value = args[index + 1]
            if token == '--base':
                base = value
            elif token == '--from':
                frm = value
            else:
                to = value
            index += 2
        elif token == '--':
            paths.extend(args[index + 1:])
            break
        elif token.startswith('--'):
            raise Refused(f'unknown option {token}')
        else:
            paths.append(token)
            index += 1

    if base and (frm or to):
        raise Refused('--base compares against the working tree; --from/--to compares two '
                      'commits. Pick one.')
    if (frm and not to) or (to and not frm):
        raise Refused('--from and --to are used together.')
    if not base and not frm:
        raise Refused('name a comparison — --base <commit>, or --from <a> --to <b>.')
    if not paths:
        raise Refused('name at least one file. A run over no file measures nothing.')
    return ([base] if base else [frm, to]), paths


def main(argv):
    args = list(argv)
    if not args:
        print(__doc__)
        return 2
    if args[0] == '--verify':
        return verify()
    if args[0] == '--selftest-negative':
        return selftest_negative()

    try:
        spec, paths = parse_args(args)
        spec = [resolve_ref(ref) for ref in spec]
    except Refused as exc:
        print(f'REFUSED  {exc}')
        return 2

    # Per path, never all-or-nothing. A refusal on a later path used to discard an
    # earlier path's measured violation and exit 2 -- "nothing was measured", which was
    # false: something was measured and it was bad. Measured, then fixed.
    results, refused = [], []
    for path in paths:
        try:
            results.append(check_file(path, spec))
        except Refused as exc:
            refused.append(str(exc))

    code = report(results) if results else 0
    for message in refused:
        print(f'REFUSED  {message}')
    if code:
        return code
    return 2 if refused else 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception as exc:                                    # noqa: BLE001
        # Exit 1 means "a violation". An unexpected failure measured nothing, so it is 2.
        print(f'REFUSED  append-only failed unexpectedly: {type(exc).__name__}: {exc}')
        sys.exit(2)
