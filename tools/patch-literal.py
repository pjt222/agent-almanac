#!/usr/bin/env python3
"""
patch-literal.py -- apply a set of literal old->new edits to one or more files, with every
edit checked before any byte is written.

WHY THIS EXISTS
---------------
The shape "assert that every `old` matches exactly once, THEN write" was typed as a scratchpad
Python script in every session of the 2026-09 tools sweep: the handoff fillers
(fill-addendum-2.py, fill-addendum-3.py), the PR-body finisher (finish-body.py) and the body
patches of #807, #809 and #810 (issue #812). Each typing carried the same three guards by hand
and some dropped one: the count asserted before writing, a placeholder-residue check after,
and a byte-identical read-back. tools/README.md's rule is that the second typing becomes a
file here. Two incidents on the way argue for a tool rather than a fourth heredoc: escaping
through inline Python bit twice in one PR (a `\\"` needle needed four backslashes; a template
literal's backticks made a needle match nothing), and a dry run through a symlink would have
edited the live registry (#807's handoff). A JSON spec closes the first class because nothing
is re-escaped between the author and the file; refusing a symlink closes the second.

TWO PHASES, ALL FILES
---------------------
Phase 1 reads every file, applies every edit IN MEMORY and collects every problem: a path
that is a symlink or not a regular file, a file that is binary (carries NUL) or not UTF-8, an
empty `old`, an `old` equal to its `new`, an `old` whose occurrence count is not the expected
one (default 1), and any --forbid literal that survives in the result. Counting is SEQUENTIAL
in the running text: edit 2 is counted in what edit 1 produced, so an edit may match what an
earlier edit inserted, and an edit that consumed a needle leaves nothing for a later edit that
wanted it. If phase 1 reports anything, nothing is written and the exit is 1. Phase 2 writes
each planned file to a temporary file in the same directory, copies the mode bits, renames it
over the original, reads the result back and compares it to the intended bytes. Files are
bytes throughout: CRLF, a missing trailing newline and a BOM survive untouched outside the
edited spans, and `old`/`new` are matched as their UTF-8 encoding.

`--verify` runs its fixtures in a temporary directory, which is ext4 here and in CI. The
read-back after every real write is the measurement on the NTFS mount, where in-place `sed`
has been seen to no-op; the first such run is in the fact sheet of the pull request that
promoted this file (#812).

EXIT CODES
----------
    0  every file applied and read back as intended (or --dry-run with nothing to report)
    1  refused: at least one check failed, NOTHING was written
    2  could not run: bad usage, unreadable or malformed spec
    3  incomplete: some file was written and a later write failed, or a read-back did not
       match -- the report names each file's state; this is deliberately not 1, because
       "not 0" read as "nothing written" would re-run the patch onto an already-patched file

USAGE
-----
    python3 tools/patch-literal.py FILE --replace OLD::NEW [--replace OLD::NEW ...]
                                        [--count N] [--forbid LITERAL ...] [--dry-run]
    python3 tools/patch-literal.py --spec SPEC.json [--forbid LITERAL ...] [--dry-run]
    python3 tools/patch-literal.py --verify

`--replace` takes exactly one `::`. scripts/mutation-check.js splits the same argument at its
FIRST `::` and applies whatever results; this tool splits there too and then refuses (exit 2)
the two shapes that split has been measured to mangle. An OLD that itself ends in a colon --
every Python `if`, `def` or `for` line -- loses that colon to the separator, so NEW begins with
the stray one: ten of this file's own first twenty mutants came back INVALID (they did not
parse) until rewritten without the trailing colon. And an OLD that itself contains `::` is
split inside itself, so NEW contains a further `::`: measured on this PR's fact-sheet spec,
where a needle carrying the facts file's ` :: ` label separator was split at its first `::`
and the edit, valid to the two-phase check, mangled the line. Both are refused naming the way
out: --spec, where nothing is split, or a needle that stops before the colon.
`--count` is the expected occurrence count for every --replace edit. A spec is
either a list of file entries or an object `{"forbid": [...], "files": [...]}`; a file entry
is `{"path": "...", "edits": [{"old": "...", "new": "...", "count": 1}], "forbid": [...]}`.
Paths are resolved against the current directory. `--forbid` has no default: the
`__PLACEHOLDER__` convention of the typings is passed as `--forbid __` when it applies.

SELF-TEST FAULT HOOK
--------------------
PATCH_LITERAL_FAULT=write:<path> makes the write of that file fail after the temporary file
exists; PATCH_LITERAL_FAULT=readback:<path> appends a byte to that file between the rename and
the read-back. Both exist so that --verify can drive the exit-3 arms through the real process
rather than trusting a comment; --verify clears the variable for every other run.
"""

import argparse
import difflib
import json
import os
import subprocess
import sys
import tempfile

EXIT_APPLIED = 0
EXIT_REFUSED = 1
EXIT_CANNOT_RUN = 2
EXIT_INCOMPLETE = 3
SEP = '::'
FAULT_ENV = 'PATCH_LITERAL_FAULT'
TAG = 'patch-literal'


class SpecError(Exception):
    """A malformed spec or usage: the run cannot start (exit 2)."""


# --- spec -----------------------------------------------------------------------------------

def _as_literal_list(value, where):
    if value is None:
        return []
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise SpecError(f'{where}: forbid must be a list of strings')
    return [v.encode('utf-8') for v in value]


def normalise_spec(raw, count_default=1):
    """Turn the parsed JSON (a list, or an object with files/forbid) into file plans."""
    forbid_global = []
    if isinstance(raw, dict):
        forbid_global = _as_literal_list(raw.get('forbid'), 'spec')
        files = raw.get('files')
    else:
        files = raw
    if not isinstance(files, list) or not files:
        raise SpecError('spec names no files (a non-empty "files" list is required)')
    entries = []
    seen = set()
    for i, entry in enumerate(files, 1):
        where = f'files[{i}]'
        if not isinstance(entry, dict) or not isinstance(entry.get('path'), str) or not entry['path']:
            raise SpecError(f'{where}: needs a non-empty "path" string')
        path = entry['path']
        key = os.path.normpath(path)
        if key in seen:
            raise SpecError(f'{where}: {path} is listed twice; list a file once with all its edits')
        seen.add(key)
        edits_raw = entry.get('edits')
        if not isinstance(edits_raw, list) or not edits_raw:
            raise SpecError(f'{where} ({path}): needs a non-empty "edits" list')
        edits = []
        for j, e in enumerate(edits_raw, 1):
            if not isinstance(e, dict) or not isinstance(e.get('old'), str) or not isinstance(e.get('new'), str):
                raise SpecError(f'{where} ({path}) edit {j}: needs "old" and "new" strings')
            count = e.get('count', count_default)
            if not isinstance(count, int) or isinstance(count, bool) or count < 1:
                raise SpecError(f'{where} ({path}) edit {j}: "count" must be an integer >= 1')
            edits.append({'old': e['old'].encode('utf-8'), 'new': e['new'].encode('utf-8'), 'count': count})
        entries.append({'path': path,
                        'edits': edits,
                        'forbid': forbid_global + _as_literal_list(entry.get('forbid'), f'{where} ({path})')})
    return entries


def spec_from_replaces(path, replaces, count):
    """The one-liner form: FILE --replace OLD::NEW ..., every edit with the same expected count."""
    if count < 1:
        raise SpecError('--count must be >= 1')
    edits = []
    for r in replaces:
        sep = r.find(SEP)
        if sep < 0:
            raise SpecError(f'--replace needs OLD{SEP}NEW (no {SEP} in {r!r})')
        if r[sep + len(SEP):].startswith(':'):
            raise SpecError(f'--replace {r!r}: NEW begins with a colon, so OLD probably ended in one and '
                            f'the first {SEP} took it; use --spec, or a needle that stops before the colon')
        if SEP in r[sep + len(SEP):]:
            raise SpecError(f'--replace {r!r}: NEW contains {SEP}, so OLD probably carried the separator and '
                            f'was split at its first {SEP}; use --spec')
        edits.append({'old': r[:sep], 'new': r[sep + len(SEP):], 'count': count})
    return normalise_spec([{'path': path, 'edits': edits}], count)


def load_spec_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            return json.load(fh)
    except OSError as exc:
        raise SpecError(f'cannot read spec {path}: {exc.strerror}') from exc
    except ValueError as exc:
        raise SpecError(f'spec {path} is not valid JSON: {exc}') from exc


# --- phase 1: check everything, write nothing ---------------------------------------------

def _line_numbers(data, needle, limit=5):
    lines = []
    start = 0
    while len(lines) < limit:
        idx = data.find(needle, start)
        if idx < 0:
            break
        lines.append(data.count(b'\n', 0, idx) + 1)
        start = idx + max(len(needle), 1)
    return lines


def check_file(entry):
    """Return (plan, refusals). plan is None when any refusal applies to this file."""
    path = entry['path']
    refusals = []
    if os.path.islink(path):
        refusals.append(f'{path}: is a symlink; name the target if that is what you mean')
        return None, refusals
    if not os.path.isfile(path):
        refusals.append(f'{path}: not a regular file (missing, or a directory)')
        return None, refusals
    try:
        with open(path, 'rb') as fh:
            before = fh.read()
    except OSError as exc:
        refusals.append(f'{path}: cannot read: {exc.strerror}')
        return None, refusals
    if b'\x00' in before:
        refusals.append(f'{path}: binary (carries NUL); this tool edits text files only')
        return None, refusals
    try:
        before.decode('utf-8')
    except UnicodeDecodeError as exc:
        refusals.append(f'{path}: not UTF-8 (byte {exc.start}); this tool edits UTF-8 text only')
        return None, refusals
    mode = os.stat(path).st_mode
    text = before
    failed_earlier = False
    for i, e in enumerate(entry['edits'], 1):
        suffix = ' (after a failed edit; counts may shift once it is fixed)' if failed_earlier else ''
        if not e['old']:
            refusals.append(f'{path}: edit {i} has an empty old')
            failed_earlier = True
            continue
        if e['old'] == e['new']:
            refusals.append(f'{path}: edit {i} old equals new (a no-op edit is refused, not applied)')
            failed_earlier = True
            continue
        n = text.count(e['old'])
        if n != e['count']:
            shown = e['old'].decode('utf-8', 'backslashreplace')
            if len(shown) > 60:
                shown = shown[:57] + '...'
            refusals.append(f'{path}: edit {i} matches {n} (expected {e["count"]}): {shown!r}{suffix}')
            failed_earlier = True
            continue
        text = text.replace(e['old'], e['new'])
    for lit in entry['forbid']:
        if lit in text:
            lines = _line_numbers(text, lit)
            shown = lit.decode('utf-8', 'backslashreplace')
            refusals.append(f'{path}: forbidden literal {shown!r} survives at line(s) {", ".join(map(str, lines))}')
    if refusals:
        return None, refusals
    return {'path': path, 'before': before, 'after': text, 'mode': mode, 'edits': len(entry['edits'])}, []


def unified_diff(plan):
    a = plan['before'].decode('utf-8').splitlines(keepends=True)
    b = plan['after'].decode('utf-8').splitlines(keepends=True)
    return ''.join(difflib.unified_diff(a, b, fromfile=plan['path'], tofile=plan['path']))


# --- phase 2: write, then read back --------------------------------------------------------

def _fault(kind, path):
    spec = os.environ.get(FAULT_ENV, '')
    if not spec or ':' not in spec:
        return False
    want_kind, _, want_path = spec.partition(':')
    return want_kind == kind and os.path.abspath(want_path) == os.path.abspath(path)


def write_file(plan):
    """Write plan['after'] over plan['path'] via a same-directory temp file and a rename."""
    path = plan['path']
    directory = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(prefix='.patch-literal.', dir=directory)
    try:
        with os.fdopen(fd, 'wb') as fh:
            fh.write(plan['after'])
            fh.flush()
            os.fsync(fh.fileno())
        if _fault('write', path):
            raise OSError('injected write fault (PATCH_LITERAL_FAULT)')
        os.chmod(tmp, plan['mode'] & 0o7777)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise
    if _fault('readback', path):
        with open(path, 'ab') as fh:
            fh.write(b'\n')


def read_back(plan):
    with open(plan['path'], 'rb') as fh:
        return fh.read() == plan['after']


# --- the run --------------------------------------------------------------------------------

def run(entries, dry_run):
    plans = []
    refusals = []
    for entry in entries:
        plan, problems = check_file(entry)
        refusals.extend(problems)
        if plan is not None:
            plans.append(plan)
    for r in refusals:
        print(f'{TAG}: REFUSED {r}', file=sys.stderr)
    if refusals:
        print(f'{TAG}: REFUSED, nothing written ({len(refusals)} problem(s))', file=sys.stderr)
        return EXIT_REFUSED
    for plan in plans:
        print(f'{TAG}: {plan["path"]}: {plan["edits"]} edit(s) match, '
              f'{len(plan["before"])} -> {len(plan["after"])} bytes')
    if dry_run:
        for plan in plans:
            sys.stdout.write(unified_diff(plan))
        print(f'{TAG}: dry-run, nothing written ({len(plans)} file(s) would change)')
        return EXIT_APPLIED
    written = []
    mismatched = []
    failed = None
    for plan in plans:
        try:
            write_file(plan)
        except OSError as exc:
            failed = (plan['path'], str(exc))
            break
        if read_back(plan):
            written.append(plan['path'])
            print(f'{TAG}: {plan["path"]}: written, read-back OK ({len(plan["after"])} bytes)')
        else:
            mismatched.append(plan['path'])
            print(f'{TAG}: {plan["path"]}: written, read-back MISMATCH', file=sys.stderr)
    if failed is None and not mismatched:
        print(f'{TAG}: applied {len(plans)} file(s), {sum(p["edits"] for p in plans)} edit(s)')
        return EXIT_APPLIED
    done = set(written) | set(mismatched)
    if failed is not None:
        done.add(failed[0])
    unwritten = [p['path'] for p in plans if p['path'] not in done]
    parts = []
    if written:
        parts.append('written ' + ', '.join(written))
    if mismatched:
        parts.append('read-back mismatch ' + ', '.join(mismatched))
    if failed is not None:
        parts.append(f'failed {failed[0]} ({failed[1]})')
    if unwritten:
        parts.append('unwritten ' + ', '.join(unwritten))
    print(f'{TAG}: INCOMPLETE: ' + '; '.join(parts), file=sys.stderr)
    return EXIT_INCOMPLETE


# --- self-test ------------------------------------------------------------------------------

def verify():
    tool = os.path.abspath(__file__)
    runs = 0
    failures = []

    def check(name, cond, detail=''):
        if not cond:
            failures.append(f'{name}: {detail}'.rstrip(': '))

    def go(args, cwd, fault=None):
        nonlocal runs
        runs += 1
        env = dict(os.environ)
        env.pop(FAULT_ENV, None)
        if fault:
            env[FAULT_ENV] = fault
        p = subprocess.run([sys.executable, tool, *args], cwd=cwd, env=env,
                           capture_output=True, text=True, errors='backslashreplace')
        return p.returncode, p.stdout, p.stderr

    def put(d, name, data, mode=None):
        p = os.path.join(d, name)
        with open(p, 'wb') as fh:
            fh.write(data)
        if mode is not None:
            os.chmod(p, mode)
        return p

    def get(d, name):
        with open(os.path.join(d, name), 'rb') as fh:
            return fh.read()

    def spec(d, name, obj):
        p = os.path.join(d, name)
        with open(p, 'w', encoding='utf-8') as fh:
            json.dump(obj, fh)
        return name

    with tempfile.TemporaryDirectory(prefix='patch-literal-verify.') as d:
        # v1: the plain case applies, reads back, reports
        put(d, 'a.txt', b'alpha beta\n')
        rc, out, err = go(['a.txt', '--replace', 'beta::gamma'], d)
        check('v1 exit', rc == 0, f'rc={rc} err={err}')
        check('v1 content', get(d, 'a.txt') == b'alpha gamma\n')
        check('v1 read-back line', 'read-back OK' in out, out)
        check('v1 applied line', 'applied 1 file(s), 1 edit(s)' in out, out)

        # v2: zero matches is refused, nothing written, exit 1
        put(d, 'b.txt', b'alpha\n')
        rc, out, err = go(['b.txt', '--replace', 'zeta::eta'], d)
        check('v2 exit', rc == 1, f'rc={rc}')
        check('v2 unchanged', get(d, 'b.txt') == b'alpha\n')
        check('v2 message', 'matches 0 (expected 1)' in err, err)
        check('v2 nothing written line', 'nothing written' in err, err)

        # v3: two matches refused at the default, applied with --count 2
        put(d, 'c.txt', b'x x\n')
        rc, out, err = go(['c.txt', '--replace', 'x::y'], d)
        check('v3 exit', rc == 1, f'rc={rc}')
        check('v3 unchanged', get(d, 'c.txt') == b'x x\n')
        check('v3 message', 'matches 2 (expected 1)' in err, err)
        rc, out, err = go(['c.txt', '--replace', 'x::y', '--count', '2'], d)
        check('v3 count-2 exit', rc == 0, f'rc={rc} err={err}')
        check('v3 count-2 content', get(d, 'c.txt') == b'y y\n')

        # v4: two-phase ACROSS files -- A passes, B's second edit fails, A is untouched
        put(d, 'A.txt', b'one\n')
        put(d, 'B.txt', b'two\n')
        s = spec(d, 'v4.json', [
            {'path': 'A.txt', 'edits': [{'old': 'one', 'new': 'uno'}]},
            {'path': 'B.txt', 'edits': [{'old': 'two', 'new': 'dos'}, {'old': 'three', 'new': 'tres'}]},
        ])
        rc, out, err = go(['--spec', s], d)
        check('v4 exit', rc == 1, f'rc={rc}')
        check('v4 A untouched', get(d, 'A.txt') == b'one\n', get(d, 'A.txt'))
        check('v4 B untouched', get(d, 'B.txt') == b'two\n')
        check('v4 names B edit 2', 'B.txt: edit 2 matches 0' in err, err)
        check('v4 no A line on stdout', 'A.txt' not in out, out)

        # v5: a surviving --forbid literal refuses; consumed by the edit it passes
        put(d, 'd.txt', b'__X__ ok\n')
        rc, out, err = go(['d.txt', '--replace', 'ok::fine', '--forbid', '__'], d)
        check('v5 exit', rc == 1, f'rc={rc}')
        check('v5 unchanged', get(d, 'd.txt') == b'__X__ ok\n')
        check('v5 message', "forbidden literal '__' survives at line(s) 1" in err, err)
        rc, out, err = go(['d.txt', '--replace', '__X__ ok::fine', '--forbid', '__'], d)
        check('v5 consumed exit', rc == 0, f'rc={rc} err={err}')
        check('v5 consumed content', get(d, 'd.txt') == b'fine\n')

        # v6: bytes -- BOM, CRLF and a missing trailing newline survive outside the edit
        put(d, 'e.txt', b'\xef\xbb\xbfline1\r\nkey=old\r\nline3')
        rc, out, err = go(['e.txt', '--replace', 'key=old::key=new'], d)
        check('v6 exit', rc == 0, f'rc={rc} err={err}')
        check('v6 bytes', get(d, 'e.txt') == b'\xef\xbb\xbfline1\r\nkey=new\r\nline3', get(d, 'e.txt'))

        # v7: a symlink is refused and its target untouched
        put(d, 'target.txt', b'target\n')
        os.symlink('target.txt', os.path.join(d, 'link.txt'))
        rc, out, err = go(['link.txt', '--replace', 'target::x'], d)
        check('v7 exit', rc == 1, f'rc={rc}')
        check('v7 target untouched', get(d, 'target.txt') == b'target\n')
        check('v7 message', 'is a symlink' in err, err)

        # v8: old == new and an empty old are refused before any write
        put(d, 'f.txt', b'same\n')
        rc, out, err = go(['f.txt', '--replace', 'same::same'], d)
        check('v8 old==new exit', rc == 1, f'rc={rc}')
        check('v8 old==new message', 'old equals new' in err, err)
        rc, out, err = go(['f.txt', '--replace', '::new'], d)
        check('v8 empty exit', rc == 1, f'rc={rc}')
        check('v8 empty message', 'empty old' in err, err)
        check('v8 unchanged', get(d, 'f.txt') == b'same\n')

        # v9: --dry-run prints the diff and writes nothing
        put(d, 'g.txt', b'hello\n')
        rc, out, err = go(['g.txt', '--replace', 'hello::bye', '--dry-run'], d)
        check('v9 exit', rc == 0, f'rc={rc} err={err}')
        check('v9 unchanged', get(d, 'g.txt') == b'hello\n')
        check('v9 diff', '-hello\n' in out and '+bye\n' in out and '--- g.txt' in out, out)
        check('v9 says nothing written', 'dry-run, nothing written' in out, out)

        # v10: counting is sequential in the running text, both directions
        put(d, 'h.txt', b'ab\n')
        s = spec(d, 'v10a.json', [{'path': 'h.txt', 'edits': [
            {'old': 'ab', 'new': 'ab ab'}, {'old': 'ab', 'new': 'cd', 'count': 2}]}])
        rc, out, err = go(['--spec', s], d)
        check('v10 grows exit', rc == 0, f'rc={rc} err={err}')
        check('v10 grows content', get(d, 'h.txt') == b'cd cd\n', get(d, 'h.txt'))
        put(d, 'i.txt', b'x\n')
        s = spec(d, 'v10b.json', [{'path': 'i.txt', 'edits': [
            {'old': 'x', 'new': 'y'}, {'old': 'x', 'new': 'z'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v10 consumed exit', rc == 1, f'rc={rc}')
        check('v10 consumed message', 'edit 2 matches 0 (expected 1)' in err, err)
        check('v10 consumed unchanged', get(d, 'i.txt') == b'x\n')

        # v11: mode bits survive the temp-file-and-rename write
        put(d, 'j.sh', b'#!/bin/sh\necho old\n', mode=0o755)
        rc, out, err = go(['j.sh', '--replace', 'old::new'], d)
        check('v11 exit', rc == 0, f'rc={rc} err={err}')
        got = os.stat(os.path.join(d, 'j.sh')).st_mode & 0o777
        check('v11 mode', got == 0o755, oct(got))

        # v12: a missing, binary or non-UTF-8 file is refused (exit 1, not a crash)
        rc, out, err = go(['nope.txt', '--replace', 'a::b'], d)
        check('v12 missing exit', rc == 1, f'rc={rc} err={err}')
        check('v12 missing message', 'not a regular file' in err, err)
        put(d, 'bin.dat', b'a\x00b')
        rc, out, err = go(['bin.dat', '--replace', 'a::b'], d)
        check('v12 binary exit', rc == 1, f'rc={rc}')
        check('v12 binary message', 'binary' in err, err)
        check('v12 binary unchanged', get(d, 'bin.dat') == b'a\x00b')
        put(d, 'latin.txt', b'caf\xe9\n')
        rc, out, err = go(['latin.txt', '--replace', 'caf::bar'], d)
        check('v12 non-utf8 exit', rc == 1, f'rc={rc}')
        check('v12 non-utf8 message', 'not UTF-8' in err, err)
        check('v12 non-utf8 unchanged', get(d, 'latin.txt') == b'caf\xe9\n')

        # v13: --replace takes exactly one ::; none, a stray colon at the start of NEW, or a
        # second :: (a needle that carried the separator) are refused before any write
        put(d, 'k.txt', b'a :: b\n')
        rc, out, err = go(['k.txt', '--replace', 'nosep'], d)
        check('v13 no-sep exit', rc == 2 and 'needs OLD::NEW' in err, f'rc={rc} err={err}')
        rc, out, err = go(['k.txt', '--replace', 'if x:::if y:'], d)
        check('v13 colon-trap exit', rc == 2 and 'NEW begins with a colon' in err, f'rc={rc} err={err}')
        rc, out, err = go(['k.txt', '--replace', 'a :: b::a :: c'], d)
        check('v13 separator-in-needle exit', rc == 2 and 'NEW contains ::' in err, f'rc={rc} err={err}')
        check('v13 unchanged', get(d, 'k.txt') == b'a :: b\n', get(d, 'k.txt'))
        s = spec(d, 'v13.json', [{'path': 'k.txt', 'edits': [{'old': 'a :: b', 'new': 'a :: c'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v13 spec form exit', rc == 0, f'rc={rc} err={err}')
        check('v13 spec form content', get(d, 'k.txt') == b'a :: c\n', get(d, 'k.txt'))

        # v14: usage and malformed specs cannot run (exit 2), and touch nothing
        put(d, 'l.txt', b'l\n')
        rc, out, err = go([], d)
        check('v14 no args', rc == 2, f'rc={rc}')
        rc, out, err = go(['l.txt'], d)
        check('v14 file without --replace', rc == 2, f'rc={rc}')
        rc, out, err = go(['l.txt', '--spec', 'x.json', '--replace', 'a::b'], d)
        check('v14 both forms', rc == 2, f'rc={rc}')
        put(d, 'bad.json', b'{not json')
        rc, out, err = go(['--spec', 'bad.json'], d)
        check('v14 bad json', rc == 2 and 'not valid JSON' in err, f'rc={rc} err={err}')
        rc, out, err = go(['--spec', 'absent.json'], d)
        check('v14 absent spec', rc == 2, f'rc={rc}')
        s = spec(d, 'v14a.json', [])
        rc, out, err = go(['--spec', s], d)
        check('v14 zero files', rc == 2 and 'names no files' in err, f'rc={rc} err={err}')
        s = spec(d, 'v14b.json', [{'path': 'l.txt', 'edits': []}])
        rc, out, err = go(['--spec', s], d)
        check('v14 zero edits', rc == 2 and 'non-empty "edits"' in err, f'rc={rc} err={err}')
        s = spec(d, 'v14c.json', [{'path': 'l.txt', 'edits': [{'old': 'l', 'new': 'm'}]},
                                  {'path': './l.txt', 'edits': [{'old': 'l', 'new': 'n'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v14 duplicate path', rc == 2 and 'listed twice' in err, f'rc={rc} err={err}')
        s = spec(d, 'v14d.json', [{'path': 'l.txt', 'edits': [{'old': 'l', 'new': 'm', 'count': 0}]}])
        rc, out, err = go(['--spec', s], d)
        check('v14 count 0', rc == 2 and 'count' in err, f'rc={rc} err={err}')
        rc, out, err = go(['l.txt', '--replace', 'l::m', '--count', '0'], d)
        check('v14 --count 0', rc == 2 and '--count' in err, f'rc={rc} err={err}')
        check('v14 untouched', get(d, 'l.txt') == b'l\n')

        # v15: the exit-3 arms through the fault hook -- a later write failing after an
        # earlier one succeeded, and a read-back that does not match
        put(d, 'm.txt', b'm\n')
        put(d, 'n.txt', b'n\n')
        s = spec(d, 'v15.json', [{'path': 'm.txt', 'edits': [{'old': 'm', 'new': 'M'}]},
                                 {'path': 'n.txt', 'edits': [{'old': 'n', 'new': 'N'}]}])
        rc, out, err = go(['--spec', s], d, fault='write:' + os.path.join(d, 'n.txt'))
        check('v15 partial exit', rc == 3, f'rc={rc} err={err}')
        check('v15 partial m written', get(d, 'm.txt') == b'M\n')
        check('v15 partial n untouched', get(d, 'n.txt') == b'n\n', get(d, 'n.txt'))
        check('v15 partial report', 'INCOMPLETE: written m.txt; failed n.txt' in err, err)
        check('v15 no temp left', not [f for f in os.listdir(d) if f.startswith('.patch-literal.')], os.listdir(d))
        put(d, 'o.txt', b'o\n')
        rc, out, err = go(['o.txt', '--replace', 'o::O'], d, fault='readback:' + os.path.join(d, 'o.txt'))
        check('v15 mismatch exit', rc == 3, f'rc={rc} err={err}')
        check('v15 mismatch report', 'read-back MISMATCH' in err and 'read-back mismatch o.txt' in err, err)

        # v16: a multi-line, quote- and backslash-laden needle through the spec, unescaped
        body = 'const re = /\\"(.*?)\\"/g; // `tick`\nline two\n'
        put(d, 'p.js', body.encode('utf-8'))
        s = spec(d, 'v16.json', [{'path': 'p.js', 'edits': [
            {'old': '/\\"(.*?)\\"/g; // `tick`\nline two', 'new': '/\\"(.+?)\\"/g; // `tock`\nline 2'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v16 exit', rc == 0, f'rc={rc} err={err}')
        check('v16 content', get(d, 'p.js') == 'const re = /\\"(.+?)\\"/g; // `tock`\nline 2\n'.encode('utf-8'),
              get(d, 'p.js'))

    for f in failures:
        print(f'verify: FAIL {f}')
    print(f'verify: {runs} run(s), {len(failures)} failure(s)')
    return EXIT_APPLIED if not failures else EXIT_REFUSED


# --- entry ----------------------------------------------------------------------------------

def build_parser():
    p = argparse.ArgumentParser(prog='patch-literal.py', add_help=True,
                                description='literal old->new edits, every one checked before any write')
    p.add_argument('file', nargs='?', help='the file to edit (with --replace)')
    p.add_argument('--replace', action='append', default=[], metavar='OLD::NEW',
                   help='an edit; repeatable; split at the first ::')
    p.add_argument('--count', type=int, default=1, help='expected occurrences for every --replace (default 1)')
    p.add_argument('--spec', metavar='SPEC.json', help='a JSON spec of files and edits')
    p.add_argument('--forbid', action='append', default=[], metavar='LITERAL',
                   help='refuse a result in which this literal survives; repeatable')
    p.add_argument('--dry-run', action='store_true', help='check and print the diff, write nothing')
    p.add_argument('--verify', action='store_true', help='run the self-test and exit non-zero on failure')
    return p


def main(argv):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors='backslashreplace')
        except (AttributeError, ValueError):
            pass
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.verify:
        return verify()
    try:
        if args.spec and (args.file or args.replace):
            raise SpecError('give either --spec or FILE --replace, not both')
        if args.spec:
            entries = normalise_spec(load_spec_file(args.spec), args.count)
        elif args.file and args.replace:
            entries = spec_from_replaces(args.file, args.replace, args.count)
        else:
            raise SpecError('usage: FILE --replace OLD::NEW [...] | --spec SPEC.json | --verify')
        extra = [f.encode('utf-8') for f in args.forbid]
        for entry in entries:
            entry['forbid'] = entry['forbid'] + extra
    except SpecError as exc:
        print(f'{TAG}: cannot run: {exc}', file=sys.stderr)
        return EXIT_CANNOT_RUN
    return run(entries, args.dry_run)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
