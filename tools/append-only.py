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
writing #828, which the word-diff form would not have caught.

HOW THE TWO RELATE, measured rather than asserted
--------------------------------------------------
The first version of this file claimed the word-diff count was "strictly weaker". That was
false in both directions, and an adversarial review found three cases proving it. They are
`--verify` arms now, not prose:

    frontmatter `---` delimiters deleted    word-diff 2   v1: PASSED (a parser bug)
    lines reordered, each gaining text      word-diff 1   v1: PASSED (unordered matching)
    append with no space ("x." -> "x.[^1]") word-diff 1   v1 and v2: pass, correctly

The first two were real defects and are fixed here: hunk parsing no longer discards a removed
line whose text begins with `--`, and matching is now ORDER-PRESERVING, so a reordered line is
a violation. The third is a defect in neither check -- it is an append -- but it is why the
relation is stated as a caveat rather than as dominance: the word-diff count flags an append
that changes the last token, and this tool does not.

So on the changes this tool was built to judge, it catches what the word-diff count catches
and also the whitespace-delimited insertions the count cannot see -- except an append that
alters the final token, which only the count reports. That is a measurement over the arms
below, restated by `--verify` on every run, not a proof about all possible inputs.

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
"""

import os
import shutil
import subprocess
import sys
import tempfile

GIT_COMMON = [
    '-c', 'core.autocrlf=false',
    '-c', 'core.quotepath=false',
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
        elif line.startswith('-'):
            current['minus'].append(line[1:])
        elif line.startswith('+'):
            current['plus'].append(line[1:])
    return hunks


def prefix_violations(hunks):
    """Every removed line must be a prefix of a later added line, in order, per hunk.

    ORDER-PRESERVING: removed[i] matches added[j_i] with j strictly increasing. Without that,
    `A\\nB` becoming `B x\\nA x` reports 0 -- each removed line finds *a* partner and the
    reorder is invisible, though the body plainly moved. Greedy-leftmost is optimal here by
    the standard subsequence exchange argument: taking the earliest admissible j never
    forecloses a match a later choice would allow.

    An empty removed line matches only an empty added line. `''` is a prefix of everything,
    so it would otherwise absorb any added line and let a deleted paragraph separator pass.

    Per hunk, never a global pool: a line moved from one hunk to another is a violation, and
    a global pool would match it. `_moved_line` is the arm, `_global_pool` the mutant.
    """
    violations = []
    for hunk in hunks:
        added = hunk['plus']
        cursor = 0
        for offset, old in enumerate(hunk['minus']):
            index = cursor
            while index < len(added):
                candidate = added[index]
                fits = (candidate == '') if old == '' else candidate.startswith(old)
                if fits:
                    break
                index += 1
            if index < len(added):
                cursor = index + 1
            else:
                violations.append({
                    'line': hunk['old_start'] + offset,
                    'old': old,
                    'candidates': added[cursor:],
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
    base_args = ['diff', '--no-ext-diff', '--no-color', '--no-renames']

    code, unified, err = run_git([*base_args, '-U0', *spec, '--', path], cwd=cwd)
    if code != 0:
        raise Refused(f'{path}: git diff failed: {err.strip() or "no message"}')
    if not unified.strip():
        raise Refused(
            f'{path}: the diff is EMPTY — unchanged, untracked, or outside this spec. '
            f'A file the diff never reached cannot be shown to be append-only.'
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
    if 'Binary files' in unified:
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
            continue
        bad += 1
        print(f"VIOLATION  {item['path']}: {count} original line(s) altered, moved, or removed.")
        for hit in item['violations']:
            print(f"    line {hit['line']} was:")
            print(f"      {hit['old']!r}")
            if hit['candidates']:
                print("    the added line(s) still available at that point:")
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
)

POINTER = ' -> *anchors re-checked, Addendum A5*'
EVIDENCE = 'Key repo evidence: teams/opaque-team.md:22,85 and guides/agent-best-practices.md:256-288'


def _end_of_line(text):
    return text.replace('to evolve shapeshifter.', f'to evolve shapeshifter.{POINTER}')


def _mid_sentence(text):
    return text.replace('changes (#283). For #282,', f'changes (#283).{POINTER} For #282,')


def _append_block(text):
    return text + '\n## Addendum A1, 2026-09-15\n\nNew material only.\n'


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
    """Two adjacent lines swap places, each gaining text — v1 matching reported 0."""
    return text.replace(f'{EVIDENCE}\n---\n', f'--- x\n{EVIDENCE} x\n')


def _moved_line(text):
    """A line moved from the middle to EOF, gaining text.

    Two SEPARATE hunks — a deletion at line 2 and an addition after line 8. Moving the last
    line instead would put both sides in one hunk at line 8, where it is an ordinary
    end-of-line append and correctly passes.
    """
    return text.replace('title: leadless coordination\n', '') + 'title: leadless coordination moved\n'


def _rewrite_prefix(text):
    return text.replace('Key repo evidence:', 'Evidence:')


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
}


def _write(target, text):
    with open(target, 'w', encoding='utf-8', newline='\n') as handle:
        handle.write(text)


def _commit(repo, message):
    subprocess.run(['git', *SELFTEST_GIT, 'add', '-A'], cwd=repo, check=True, capture_output=True)
    subprocess.run(['git', *SELFTEST_GIT, 'commit', '-q', '-m', message],
                   cwd=repo, check=True, capture_output=True)


def _selftest_repo():
    path = tempfile.mkdtemp(prefix='append-only-verify-')
    subprocess.run(['git', *SELFTEST_GIT, 'init', '-q', path], check=True, capture_output=True)
    target = os.path.join(path, 'record.md')
    _write(target, FIXTURE)
    _commit(path, 'the record as written')
    return path, target


COMPARISON = [
    ('mid-sentence pointer', _mid_sentence, (0, 1)),
    ('end-of-line pointer', _end_of_line, (0, 0)),
    ('frontmatter --- deleted', _frontmatter_deleted, (2, 2)),
    ('adjacent lines reordered', _reorder, (1, 1)),
    ('append with no space', _append_no_space, (1, 0)),
]


def verify():
    """Re-derive every claim in this file's docstring. Non-zero when one stops holding."""
    repo, target = _selftest_repo()
    failures = []
    refusals = []
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

        def refuses(label, call):
            refusals.append(label)
            try:
                call()
                print(f'  [**FAIL**] {label}: accepted, not refused')
                failures.append(label)
            except Refused as exc:
                print(f'  [ok] {label}: {str(exc)[:64]}...')

        refuses('an unchanged file', lambda: check_file('record.md', ['HEAD'], cwd=repo))
        refuses('an unknown path', lambda: check_file('no-such-file.md', ['HEAD'], cwd=repo))
        refuses('a three-dot range', lambda: resolve_ref('HEAD~1...HEAD', cwd=repo))
        refuses('a two-dot range', lambda: resolve_ref('HEAD~1..HEAD', cwd=repo))
        refuses('an option where a ref belongs', lambda: resolve_ref('--cached', cwd=repo))
        refuses('an unresolvable ref', lambda: resolve_ref('no-such-ref', cwd=repo))
        refuses('no file named', lambda: parse_args(['--base', 'HEAD']))
        refuses('no comparison named', lambda: parse_args(['record.md']))
        refuses('both --base and --from', lambda: parse_args(
            ['--base', 'HEAD', '--from', 'HEAD', '--to', 'HEAD', 'record.md']))
        refuses('--base as the last token', lambda: parse_args(['record.md', '--base']))

        _write(target, _end_of_line(FIXTURE))
        _commit(repo, 'append a pointer at end of line')
        _write(os.path.join(repo, 'fresh.md'), 'brand new file\n')
        _commit(repo, 'add a new file')
        refuses('a file NEW at the named path',
                lambda: check_file('fresh.md', ['HEAD~1', 'HEAD'], cwd=repo))

        print('\n=== a violation that is not a refusal ===\n')
        os.remove(target)
        result = check_file('record.md', ['HEAD'], cwd=repo)
        if result['deleted'] and report([result]) == 1:
            print('  [ok] a deleted file is a violation, not a refusal')
        else:
            print('  [**FAIL**] a deleted file was not caught')
            failures.append('deleted file')
        run_git(['checkout', '--', 'record.md'], cwd=repo)

        print('\n=== the comparison with the published word-diff form, restated ===\n')
        base = resolve_ref('HEAD~2', cwd=repo)
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

    if failures:
        print(f'\nFAILED: {len(failures)} claim(s) no longer hold')
        for item in failures:
            print(f'  {item}')
        return 1
    print(f'\nOK: {len(ARMS)} arms, {len(refusals)} refusals, 1 deletion verdict, '
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
        results = [check_file(path, spec) for path in paths]
    except Refused as exc:
        print(f'REFUSED  {exc}')
        return 2
    return report(results)


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception as exc:                                    # noqa: BLE001
        # Exit 1 means "a violation". An unexpected failure measured nothing, so it is 2.
        print(f'REFUSED  append-only failed unexpectedly: {type(exc).__name__}: {exc}')
        sys.exit(2)
