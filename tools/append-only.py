#!/usr/bin/env python3
"""
Prove a change only ADDED text: every original line survives as a prefix of a new line.

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
the body destroys what makes it evidence. So the property a reviewer needs is not "no line was
deleted" but the stronger "no original line was altered anywhere except at its end".

Those are different properties, and the repository published the WEAKER one as if it were the
stronger. PR #828's body states:

    # every original line intact; text only added. Must print 0.
    git diff --word-diff=porcelain origin/main -- FILE | grep -v '^--- ' | grep -c '^-'

That command counts REMOVED WORDS. Measured in a throwaway repository on the shape the
leadless record actually has -- two sentences on one line, a pointer appended after the first:

    mid-sentence pointer inserted   word-diff form: 0 (passes)   prefix check: 1 (caught)
    end-of-line pointer appended    word-diff form: 0 (passes)   prefix check: 0 (passes)

The word-diff form is BLIND to a mid-sentence insertion, because git splits word-diff on
whitespace and an insertion surrounded by spaces removes no token. Inserting a pointer
mid-sentence instead of at end of line is the error that was made three times while writing
#828, and the handoff credits this command with catching it. It did not. What caught it each
time was an ad-hoc `git diff -U0` prefix comparison that was never written down -- this file.

The word-diff count is still reported below, labelled, because it is what a reader of #828 and
of the 2026-09-14 handoff will try to reconcile against. It is a strictly weaker signal: every
removal it can see breaks the prefix property too, and it sees nothing else.

TWO TRAPS THIS TOOL REFUSES RATHER THAN DOCUMENTS
-------------------------------------------------
* A three-dot range (`origin/main...HEAD`) diffs COMMITS, so it cannot see the working tree.
  A control experiment that deleted a word from the working tree scored 0 against a three-dot
  spec and the check "passed" vacuously. There is no argument here from which a three-dot spec
  can be built: `--base` compares against the working tree, `--from/--to` compares two commits.
* A file the diff never reached scores 0 for the same reason an empty grep does. Each named
  file must produce a diff or the run is refused per file -- REACHED, never EXISTS, the rule
  `check-i18n-fence-parity.js` learned in #634.

WHAT IT DOES NOT PROVE
----------------------
That the appended text is correct, that the pointer points at a section that exists, or that a
file outside the named set is untouched. It is a property of the named files' diff, nothing more.
"""

import os
import shutil
import subprocess
import sys
import tempfile

GIT_ENV_OVERRIDES = [
    '-c', 'core.autocrlf=false',
    '-c', 'core.quotepath=false',
]


def run_git(args, cwd=None):
    """Run git, returning (exit_code, stdout). Never raises on a non-zero git."""
    proc = subprocess.run(
        ['git', *GIT_ENV_OVERRIDES, *args],
        cwd=cwd, capture_output=True, text=True,
    )
    return proc.returncode, proc.stdout, proc.stderr


# ── the property ──────────────────────────────────────────────────────────────

def parse_hunks(diff_text):
    """Split a -U0 unified diff into hunks: (old_start, [removed], [added])."""
    hunks = []
    current = None
    for line in diff_text.split('\n'):
        if line.startswith('@@'):
            # @@ -a,b +c,d @@
            try:
                old_field = line.split(' ')[1]          # -a,b
                old_start = int(old_field[1:].split(',')[0])
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


def prefix_violations(hunks):
    """Every removed line must be a prefix of some added line in the same hunk.

    Longest first, because an empty removed line is a prefix of EVERYTHING. Matching in
    file order would let it consume a real line's partner, and the real line would then
    find no match and be reported. That is a SPURIOUS violation, never a missed one:
    consuming shrinks the pool, so a wrong early match can only make later matching
    harder. The two orders are not distinguishable on any `-U0` diff this tool could
    find -- git emits minimal hunks and split every constructed case into two
    single-sided hunks -- so this order is the safer greedy rule rather than a fix for
    a measured defect, and `--selftest-negative` deliberately carries no mutant for it.
    """
    violations = []
    for hunk in hunks:
        pool = list(hunk['plus'])
        ordered = sorted(
            enumerate(hunk['minus']), key=lambda pair: len(pair[1]), reverse=True,
        )
        for offset, old in ordered:
            match = next((new for new in pool if new.startswith(old)), None)
            if match is None:
                violations.append({
                    'line': hunk['old_start'] + offset,
                    'old': old,
                    'candidates': list(pool),
                })
            else:
                pool.remove(match)
    return sorted(violations, key=lambda item: item['line'])


def word_removals(diff_text):
    """The weaker signal: removed words in a --word-diff=porcelain diff.

    Reproduces `grep -v '^--- ' | grep -c '^-'` exactly, including its blindness, because
    this number is what a reader of #828 will be holding.
    """
    return sum(
        1 for line in diff_text.split('\n')
        if line.startswith('-') and not line.startswith('--- ')
    )


# ── one file ──────────────────────────────────────────────────────────────────

class Refused(Exception):
    pass


def check_file(path, spec, cwd=None):
    """Return a result dict for one file, or raise Refused when nothing was measured."""
    base_args = ['diff', '--no-ext-diff', '--no-color', '--no-renames']

    code, unified, err = run_git(
        [*base_args, '-U0', *spec, '--', path], cwd=cwd,
    )
    if code != 0:
        raise Refused(f'git diff failed for {path}: {err.strip() or "no message"}')

    if not unified.strip():
        raise Refused(
            f'{path}: the diff is EMPTY — unchanged, untracked, or outside this spec. '
            f'A file the diff never reached cannot be shown to be append-only.'
        )
    if 'deleted file mode' in unified:
        return {'path': path, 'deleted': True, 'violations': [], 'words': None}
    if '\nBinary files' in unified or unified.startswith('Binary files'):
        raise Refused(f'{path}: binary — this tool compares text lines.')

    code, worddiff, err = run_git(
        [*base_args, '--word-diff=porcelain', *spec, '--', path], cwd=cwd,
    )
    if code != 0:
        raise Refused(f'git word-diff failed for {path}: {err.strip() or "no message"}')

    return {
        'path': path,
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
                f"(prefix violations 0; removed words {item['words']} — the weaker signal)"
            )
            continue
        bad += 1
        print(f"VIOLATION  {item['path']}: {count} original line(s) altered other than at the end.")
        for hit in item['violations']:
            print(f"    line {hit['line']} was:")
            print(f"      {hit['old']!r}")
            if hit['candidates']:
                print("    the added line(s) at that position:")
                for cand in hit['candidates'][:3]:
                    print(f"      {cand!r}")
            else:
                print("    nothing was added in its place — the line was removed outright.")
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

# Two sentences on one line, as the leadless record has — the shape that makes the
# word-diff form blind. Line 2 is blank on purpose (the empty-prefix ordering arm).
FIXTURE = (
    "The falsification protocol is runnable today with zero catalogue changes (#283). "
    "For #282, the recommended fix is to evolve shapeshifter.\n"
    "\n"
    "Key repo evidence: teams/opaque-team.md:22,85 and guides/agent-best-practices.md:256-288\n"
    "A line carrying a --- token, to check the header exclusion is not fooled.\n"
)

POINTER = ' -> *anchors re-checked, Addendum A5*'


def _mid_sentence(text):
    return text.replace('changes (#283). For #282,', f'changes (#283).{POINTER} For #282,')


def _end_of_line(text):
    return text.replace(
        'the recommended fix is to evolve shapeshifter.',
        f'the recommended fix is to evolve shapeshifter.{POINTER}',
    )


def _append_block(text):
    return text + '\n## Addendum A1, 2026-09-15\n\nNew material only.\n'


def _delete_word(text):
    return text.replace('runnable today with zero', 'runnable with zero')


def _delete_line(text):
    return text.replace(
        'A line carrying a --- token, to check the header exclusion is not fooled.\n', '',
    )


def _delete_dashes(text):
    return text.replace('a --- token', 'a token')


def _rewrite_prefix(text):
    return text.replace('Key repo evidence:', 'Evidence:')


def _blank_line_shuffle(text):
    """Delete the blank line AND append to another line, in one diff.

    Matching removed lines in file order would let the empty line consume the appended
    line's partner and report 0. Longest-first is what makes this arm fail correctly.
    """
    return _end_of_line(text).replace(
        'shapeshifter.' + POINTER + '\n\n', 'shapeshifter.' + POINTER + '\n',
    )


# label, mutate, expected exit, expected word-diff removals (None = do not assert)
ARMS = [
    ('end-of-line pointer (the correct move)', _end_of_line, 0, 0),
    ('appended block at EOF', _append_block, 0, 0),
    ('MID-SENTENCE pointer (the error made 3x in #828)', _mid_sentence, 1, 0),
    ('a word deleted mid-line', _delete_word, 1, None),
    ('a whole line deleted', _delete_line, 1, None),
    ('the literal --- token deleted', _delete_dashes, 1, None),
    ('a line rewritten at its start', _rewrite_prefix, 1, None),
    ('blank line dropped while another line gains text', _blank_line_shuffle, 1, None),
]


def _selftest_repo():
    path = tempfile.mkdtemp(prefix='append-only-verify-')
    subprocess.run(['git', *SELFTEST_GIT, 'init', '-q', path], check=True, capture_output=True)
    target = os.path.join(path, 'record.md')
    with open(target, 'w', encoding='utf-8', newline='\n') as handle:
        handle.write(FIXTURE)
    subprocess.run(['git', *SELFTEST_GIT, 'add', '-A'], cwd=path, check=True, capture_output=True)
    subprocess.run(
        ['git', *SELFTEST_GIT, 'commit', '-q', '-m', 'the record as written'],
        cwd=path, check=True, capture_output=True,
    )
    return path, target


def _write(target, text):
    with open(target, 'w', encoding='utf-8', newline='\n') as handle:
        handle.write(text)


def verify():
    """Re-derive every claim in this file's docstring. Non-zero when one stops holding."""
    repo, target = _selftest_repo()
    failures = []
    try:
        print('=== arms: each mutation of the fixture, against --base HEAD ===\n')
        for label, mutate, expected, expected_words in ARMS:
            _write(target, mutate(FIXTURE))
            try:
                result = check_file('record.md', ['HEAD'], cwd=repo)
                actual = report([result])
                words = result['words']
            except Refused as exc:
                actual, words = 2, None
                print(f'REFUSED  {exc}')
            ok = actual == expected
            if expected_words is not None and words != expected_words:
                ok = False
                print(
                    f'    word-diff removals {words}, expected {expected_words} — '
                    f'the docstring measurement no longer holds'
                )
            print(f"  [{'ok' if ok else '**FAIL**'}] exit {actual} (expected {expected})  {label}\n")
            if not ok:
                failures.append(label)
            _write(target, FIXTURE)

        print('=== refusals: a run that measured nothing must not report success ===\n')

        # an untouched file
        try:
            check_file('record.md', ['HEAD'], cwd=repo)
            print('  [**FAIL**] an unchanged file was accepted, not refused')
            failures.append('unchanged file not refused')
        except Refused as exc:
            print(f'  [ok] unchanged file refused: {str(exc)[:72]}...')

        # a path the diff never reaches
        try:
            check_file('no-such-file.md', ['HEAD'], cwd=repo)
            print('  [**FAIL**] an unknown path was accepted, not refused')
            failures.append('unknown path not refused')
        except Refused:
            print('  [ok] unknown path refused')

        # a deleted file is a violation, not a refusal
        _write(target, _end_of_line(FIXTURE))
        subprocess.run(['git', *SELFTEST_GIT, 'add', '-A'], cwd=repo, check=True, capture_output=True)
        subprocess.run(
            ['git', *SELFTEST_GIT, 'commit', '-q', '-m', 'append a pointer at end of line'],
            cwd=repo, check=True, capture_output=True,
        )
        os.remove(target)
        result = check_file('record.md', ['HEAD'], cwd=repo)
        if result['deleted'] and report([result]) == 1:
            print('  [ok] a deleted file is reported as a violation')
        else:
            print('  [**FAIL**] a deleted file was not caught')
            failures.append('deleted file not caught')
        subprocess.run(
            ['git', *SELFTEST_GIT, 'checkout', '--', 'record.md'],
            cwd=repo, check=True, capture_output=True,
        )

        print('\n=== commit-range form: --from/--to, no working tree involved ===\n')
        code, head, _ = run_git(['rev-parse', 'HEAD'], cwd=repo)
        code, base, _ = run_git(['rev-parse', 'HEAD~1'], cwd=repo)
        result = check_file('record.md', [base.strip(), head.strip()], cwd=repo)
        actual = report([result])
        if actual == 0:
            print('  [ok] the append-only commit passes in commit-range form')
        else:
            print('  [**FAIL**] the append-only commit failed in commit-range form')
            failures.append('commit-range form')

        print('\n=== the docstring measurement, restated from this run ===\n')
        # against the ORIGINAL base commit: HEAD has advanced by one append-only commit
        # above, and comparing the fixture against itself is refused, not measured.
        origin = [base.strip()]
        _write(target, _mid_sentence(FIXTURE))
        mid = check_file('record.md', origin, cwd=repo)
        _write(target, _end_of_line(FIXTURE))
        end = check_file('record.md', origin, cwd=repo)
        _write(target, FIXTURE)
        print(f"  mid-sentence pointer   word-diff {mid['words']}   prefix {len(mid['violations'])}")
        print(f"  end-of-line pointer    word-diff {end['words']}   prefix {len(end['violations'])}")
        if not (mid['words'] == 0 and len(mid['violations']) == 1):
            print('  [**FAIL**] the word-diff blindness claim no longer reproduces')
            failures.append('word-diff blindness claim')
        else:
            print('  [ok] the published word-diff form is blind where this tool is not')
    finally:
        shutil.rmtree(repo, ignore_errors=True)

    if failures:
        print(f'\nFAILED: {len(failures)} claim(s) no longer hold')
        for item in failures:
            print(f'  {item}')
        return 1
    print(f'\nOK: {len(ARMS)} arms, 3 refusals, the commit-range form and the '
          f'word-diff comparison all hold')
    return 0


def selftest_negative():
    """Break the checker itself and confirm --verify goes red.

    A --verify that has never been seen to fail is a green light of unknown wiring.
    """
    import contextlib
    import io

    globals_ = globals()
    mutants = {
        'prefix_violations: always reports zero': (
            'prefix_violations', lambda: (lambda hunks: [])),
        'prefix_violations: requires equality, not a prefix': (
            'prefix_violations', lambda: _equality_only),
        'word_removals: counts the --- a/FILE diff header': (
            'word_removals', lambda: _counts_header),
        'check_file: accepts an empty diff instead of refusing': (
            'check_file', lambda: _accepts_empty),
    }
    survivors = []
    print('=== negative evidence: each mutant of the checker, against --verify ===\n')
    for label, (target, make) in mutants.items():
        original = globals_[target]
        globals_[target] = make()
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                code = verify()
        finally:
            globals_[target] = original
        killed = code != 0
        print(f"  {label:44} -> {'KILLED' if killed else '*** SURVIVED ***'}")
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
    print(f'\nOK: {len(mutants)} of {len(mutants)} mutants killed, baseline green')
    return 0


def _equality_only(hunks):
    """Mutant: demand an exact match, so every legitimate append reads as a violation."""
    violations = []
    for hunk in hunks:
        pool = list(hunk['plus'])
        for offset, old in enumerate(hunk['minus']):
            match = next((new for new in pool if new == old), None)
            if match is None:
                violations.append({'line': hunk['old_start'] + offset, 'old': old,
                                   'candidates': list(pool)})
            else:
                pool.remove(match)
    return violations


def _counts_header(diff_text):
    """Mutant: drop the `--- ` exclusion, the trap measured on #828's clean diff."""
    return sum(1 for line in diff_text.split('\n') if line.startswith('-'))


def _accepts_empty(path, spec, cwd=None):
    """Mutant: report a vacuous pass where the real checker refuses."""
    return {'path': path, 'deleted': False, 'violations': [], 'words': 0}


# ── entry point ───────────────────────────────────────────────────────────────

def main(argv):
    args = list(argv)
    if not args:
        print(__doc__)
        return 2
    if args[0] == '--verify':
        return verify()
    if args[0] == '--selftest-negative':
        return selftest_negative()

    base, frm, to, paths = None, None, None, []
    index = 0
    while index < len(args):
        token = args[index]
        if token == '--base' and index + 1 < len(args):
            base, index = args[index + 1], index + 2
        elif token == '--from' and index + 1 < len(args):
            frm, index = args[index + 1], index + 2
        elif token == '--to' and index + 1 < len(args):
            to, index = args[index + 1], index + 2
        elif token == '--':
            paths.extend(args[index + 1:])
            break
        elif token.startswith('--'):
            print(f'append-only: unknown option {token}')
            return 2
        else:
            paths.append(token)
            index += 1

    if base and (frm or to):
        print('append-only: --base compares against the working tree; '
              '--from/--to compares two commits. Pick one.')
        return 2
    if (frm and not to) or (to and not frm):
        print('append-only: --from and --to are used together.')
        return 2
    if not base and not frm:
        print('append-only: name a comparison — --base <ref>, or --from <a> --to <b>.')
        return 2
    if not paths:
        print('append-only: name at least one file. A run over no file measures nothing.')
        return 2

    spec = [base] if base else [frm, to]
    results = []
    for path in paths:
        try:
            results.append(check_file(path, spec))
        except Refused as exc:
            print(f'REFUSED  {exc}')
            return 2
    return report(results)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
