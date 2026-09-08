#!/usr/bin/env python3
"""
patch-literal.py -- apply a set of literal old->new edits to one or more files, with every
edit checked before any byte is written.

WHY THIS EXISTS
---------------
The shape "assert that every `old` occurs the expected number of times, THEN write" was typed
as a scratchpad Python script in every session of the 2026-09 tools sweep: the handoff fillers
(fill-addendum-2.py, fill-addendum-3.py), the PR-body finisher (finish-body.py) and the body
patches of #807, #809 and #810 (issue #812, promoted in PR #813). Each typing carried the same
three guards by hand and some dropped one: the count asserted before writing, a
placeholder-residue check after, and a byte-identical read-back. tools/README.md's rule is
that the second typing becomes a file here. Two incidents on the way argue for a tool rather
than another heredoc: escaping through inline Python bit twice in one PR (a `\\"` needle
needed four backslashes; a template literal's backticks made a needle match nothing), and a
dry run through a symlink would have edited the live registry (#807's handoff). A JSON spec
closes the first class because nothing is re-escaped between the author and the file;
refusing a symlink as the named path closes the second (a symlinked DIRECTORY on the way is
followed, and the real file behind it is what is edited).

TWO PHASES, ALL FILES
---------------------
Phase 1 reads every file, applies every edit IN MEMORY and collects every problem: a path
that is a symlink or not a regular file, a file with more than one hard link (the rename
below would leave the other names holding the old bytes), a file that is binary (carries NUL)
or not UTF-8, an empty `old`, an `old` equal to its `new`, an `old` whose occurrence count is
not the expected one (default 1), a self-overlapping `old` whose overlapping and
non-overlapping counts differ (`aa` in `aaa`: Python counts one, the reader sees two, and the
replacement would silently pick the leftmost), the same file listed twice under two
spellings (decided by device and inode, so `f.txt` and `/abs/f.txt` and a path through a
symlinked directory all fold; a purely lexical duplicate is refused earlier, as a spec
error; a filesystem that reported inode 0 for every file would make any two files look like
one and refuse, the safe direction), and any --forbid literal that survives in the result. A
value of `old`, `new` or a forbid literal that is not encodable as UTF-8 cannot run at all
(exit 2). Counting is SEQUENTIAL in the
running text: edit 2 is counted in what edit 1 produced, so an edit may match what an earlier
edit inserted, and an edit that consumed a needle leaves nothing for a later edit that wanted
it. If phase 1 reports anything, nothing is written and the exit is 1.

Phase 2 handles one file at a time: it writes the intended bytes to a temporary file in the
same directory, copies the mode bits, re-reads the target and refuses to go on if it no
longer holds the bytes phase 1 read, renames the temporary file over the original, reads the
result back and compares it to the intended bytes. The first failure of any of those steps
stops the loop, so a misbehaving mount is not written to again. Once a rename has happened,
no OSError leaves the run except through the INCOMPLETE report: a failure of the output
stream itself (a reader that left the pipe) is exit 3 too, with the report printed on stderr
under the same protection and stdout pointed at /dev/null (stderr too, if the report's own
print fails), so the interpreter's own
shutdown flush of the lost line cannot turn the status into 120 (it did, measured in PR
#813's round-3 probe, until that redirect was added; measured exit 3 afterwards for a plain
pipe, a merged `2>&1` pipe and a two-file run, round-4 probe). Before the first rename a failed
output stream is exit 2 with nothing written. A signal (Ctrl-C) is not an OSError: it ends
the run with a traceback and no report, and the files renamed so far stay renamed. A rename
carries the mode bits this tool copies and nothing else: ownership, ACLs, extended
attributes and the inode number are not preserved. Files are bytes throughout:
CRLF, a missing trailing newline and a BOM survive untouched outside the edited spans, and
`old`/`new` are matched as their UTF-8 encoding. A read-only file in a writable directory is
rewritten (the rename needs directory permission only).

`--verify` runs its fixtures in a temporary directory under $TMPDIR: ext4 here (findmnt, PR
#813's fact sheet) and an ubuntu-latest runner in CI. Pointed at the Windows mount it would
redden on the mode-bit case at least, since that mount reports 777 whatever was copied (a
755 file patched there read 777 before and after; PR #813's probe log, in its fact sheet).
The read-back after every real write is the measurement on that mount (/mnt/d, which findmnt
reports as 9p), where in-place `sed -i` has been seen to no-op; the runs recorded in PR
#813's fact sheet are the evidence.

EXIT CODES
----------
    0  every file applied and read back as intended (or --dry-run with nothing to report)
    1  refused: at least one check failed, NOTHING was written
    2  could not run: bad usage, unreadable or malformed spec, a value not encodable as
       UTF-8, or the output stream failing before any write
    3  incomplete: a write, the pre-rename check or a read-back failed. The report names
       each file's state: `failed` and `unwritten` files were NOT written by this tool;
       `written`, `read-back mismatch` and `unverified` files WERE renamed over. A failed
       pre-rename check means something else changed the file, and it is left as found. A
       failure of the output stream itself after a rename is exit 3 too (see below).
       This is deliberately not 1, because "not 0" read as "nothing written" would re-run
       the patch onto a file that may already carry it; read the report, then decide.
    Under --verify these codes do not apply: 0 is a clean self-test and 1 is failures found;
    a self-test that cannot run (no symlinks or hard links under $TMPDIR) ends in a
    traceback, i.e. exit 1 as well.

USAGE
-----
    python3 tools/patch-literal.py FILE --replace 'OLD::NEW' [--replace 'OLD::NEW' ...]
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
`--count` is the expected occurrence count for every --replace edit and is refused beside
--spec, where each edit carries its own `count`. It is not a way out of the overlap refusal:
it must equal the non-overlapping count to pass the count check, and the overlap check then
fires whenever the overlapping count exceeds it (`---` twice in `------` is refused; name the
whole run). A needle that begins with `-` must be given as `--replace=OLD::NEW`, or argparse
reads it as an option. A spec is either a list of file entries or an
object `{"forbid": [...], "files": [...]}`; a file entry is
`{"path": "...", "edits": [{"old": "...", "new": "...", "count": 1}], "forbid": [...]}`.
Paths are resolved against the current directory. `--forbid` has no default: the
`__PLACEHOLDER__` convention of the typings is passed as `--forbid __` when it applies.
`--dry-run` prints a unified diff per file; a last line without a newline is marked
`\\ No newline at end of file`, as git does, and lines are split on `\\n` alone, so a stray CR
or form feed inside a line never draws the marker.

FAULT HOOK -- LIVE IN EVERY RUN
-------------------------------
PATCH_LITERAL_FAULT=<kind>:<path> is read from the environment on EVERY run, not only under
--verify, and only --verify clears it for its own children. When the named path is the file
being written, `write` makes that file's write fail after the temporary file exists, `touch`
appends a byte to the target between phase 1 and the rename (so the pre-rename check
refuses), `readback` appends a byte after the rename (so the read-back mismatches) and
`readfail` makes the read-back itself raise, `stdout` replaces fd 1 with a pipe nobody reads
just before the success line (so the print fails with a real EPIPE, and the shutdown flush
would too), `stdout-early` does the same before the first line of output, and `stderr` makes
the report's own print fail; several kind:path pairs may be given, comma-separated, so a
path that itself contains a comma cannot be named. Every
firing prints
`patch-literal: FAULT HOOK ACTIVE (...)` on stderr, so an exit 3 caused by the hook can never
be misread as the mount misbehaving. The hook exists so that --verify drives the exit-3 arms
through the real process rather than trusting a comment; an operator who exports the variable
by accident changes a real run on that one file, loudly -- and with `touch` or `readback`
changes the FILE, by one appended byte.
"""

import argparse
import contextlib
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
NO_NEWLINE = '\\ No newline at end of file\n'


class SpecError(Exception):
    """A malformed spec or usage: the run cannot start (exit 2)."""


class ChangedUnderfoot(Exception):
    """The target no longer holds the bytes phase 1 read; it is not renamed over."""


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
    """Distinct line numbers of the first occurrences of needle, at most limit, then '...'."""
    lines = []
    start = 0
    while True:
        idx = data.find(needle, start)
        if idx < 0:
            break
        line = data.count(b'\n', 0, idx) + 1
        if line not in lines:
            if len(lines) == limit:
                lines.append('...')
                break
            lines.append(line)
        start = idx + max(len(needle), 1)
    return [str(x) for x in lines]


def _count_overlapping(data, needle):
    n = 0
    start = 0
    while True:
        idx = data.find(needle, start)
        if idx < 0:
            return n
        n += 1
        start = idx + 1


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
        st = os.stat(path)
        with open(path, 'rb') as fh:
            before = fh.read()
    except OSError as exc:
        refusals.append(f'{path}: cannot read: {exc.strerror}')
        return None, refusals
    if st.st_nlink > 1:
        refusals.append(f'{path}: has {st.st_nlink} hard links; the rename would leave the other '
                        f'name(s) with the old bytes, so this tool refuses it')
        return None, refusals
    if b'\x00' in before:
        refusals.append(f'{path}: binary (carries NUL); this tool edits text files only')
        return None, refusals
    try:
        before.decode('utf-8')
    except UnicodeDecodeError as exc:
        refusals.append(f'{path}: not UTF-8 (byte {exc.start}); this tool edits UTF-8 text only')
        return None, refusals
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
        shown = e['old'].decode('utf-8', 'backslashreplace')
        if len(shown) > 60:
            shown = shown[:57] + '...'
        if n != e['count']:
            refusals.append(f'{path}: edit {i} matches {n} (expected {e["count"]}): {shown!r}{suffix}')
            failed_earlier = True
            continue
        n_over = _count_overlapping(text, e['old'])
        if n_over != n:
            refusals.append(f'{path}: edit {i} is a self-overlapping needle: {n} non-overlapping but '
                            f'{n_over} overlapping occurrence(s) of {shown!r}; use a needle that includes '
                            f'its own boundary{suffix}')
            failed_earlier = True
            continue
        text = text.replace(e['old'], e['new'])
    for lit in entry['forbid']:
        if lit in text:
            lines = _line_numbers(text, lit)
            shown = lit.decode('utf-8', 'backslashreplace')
            refusals.append(f'{path}: forbidden literal {shown!r} survives at line(s) {", ".join(lines)}')
    if refusals:
        return None, refusals
    return {'path': path, 'before': before, 'after': text, 'mode': st.st_mode,
            'ident': (st.st_dev, st.st_ino), 'edits': len(entry['edits'])}, []


def identity_collisions(plans):
    """Two plans on one file (by device and inode) would silently drop the first one's edits."""
    seen = {}
    refusals = []
    for plan in plans:
        other = seen.get(plan['ident'])
        if other is not None:
            refusals.append(f'{plan["path"]}: is the same file as {other} (listed twice under two '
                            f'spellings); list a file once with all its edits')
        else:
            seen[plan['ident']] = plan['path']
    return refusals


def _lines(data):
    """Split on newline alone, keeping it: str.splitlines would also break on CR, FF and friends."""
    parts = data.decode('utf-8').split('\n')
    lines = [p + '\n' for p in parts[:-1]]
    if parts[-1]:
        lines.append(parts[-1])
    return lines


def unified_diff(plan):
    a = _lines(plan['before'])
    b = _lines(plan['after'])
    out = []
    for line in difflib.unified_diff(a, b, fromfile=plan['path'], tofile=plan['path']):
        if line.endswith('\n'):
            out.append(line)
        else:
            out.append(line + '\n' + NO_NEWLINE)
    return ''.join(out)


# --- phase 2: write, then read back --------------------------------------------------------

def _fault(kind, path):
    """True when PATCH_LITERAL_FAULT names this kind for this path; several kind:path pairs may be comma-separated."""
    spec = os.environ.get(FAULT_ENV, '')
    for item in spec.split(','):
        if ':' not in item:
            continue
        want_kind, _, want_path = item.partition(':')
        if want_kind == kind and os.path.abspath(want_path) == os.path.abspath(path):
            with contextlib.suppress(OSError):
                print(f'{TAG}: FAULT HOOK ACTIVE ({FAULT_ENV}={item})', file=sys.stderr)
            return True
    return False


def _discard(stream):
    """Point the stream's fd at /dev/null so the interpreter's shutdown flush of a dead pipe cannot fail."""
    with contextlib.suppress(OSError, ValueError, AttributeError):
        os.dup2(os.open(os.devnull, os.O_WRONLY), stream.fileno())


def _break_stdout():
    """Self-test only: make fd 1 the write end of a pipe nobody reads, so the next print gets EPIPE."""
    r, w = os.pipe()
    os.close(r)
    os.dup2(w, sys.stdout.fileno())
    os.close(w)


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
        if _fault('touch', path):
            with open(path, 'ab') as fh:
                fh.write(b'!')
        with open(path, 'rb') as fh:
            current = fh.read()
        if current != plan['before']:
            raise ChangedUnderfoot('changed since it was read; not renamed over')
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
    if _fault('readfail', plan['path']):
        raise OSError('injected read-back fault (PATCH_LITERAL_FAULT)')
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
    refusals.extend(identity_collisions(plans))
    for r in refusals:
        print(f'{TAG}: REFUSED {r}', file=sys.stderr)
    if refusals:
        print(f'{TAG}: REFUSED, nothing written ({len(refusals)} problem(s))', file=sys.stderr)
        return EXIT_REFUSED
    written = []
    mismatched = []
    unverified = []
    failed = None
    stream_failed = None
    renamed = False
    try:
        for plan in plans:
            if _fault('stdout-early', plan['path']):
                _break_stdout()
            print(f'{TAG}: {plan["path"]}: {plan["edits"]} edit(s) match, '
                  f'{len(plan["before"])} -> {len(plan["after"])} bytes')
        if dry_run:
            for plan in plans:
                sys.stdout.write(unified_diff(plan))
            print(f'{TAG}: dry-run, nothing written ({len(plans)} file(s) would change)')
            return EXIT_APPLIED
        for plan in plans:
            try:
                write_file(plan)
            except (OSError, ChangedUnderfoot) as exc:
                failed = (plan['path'], str(exc))
                break
            renamed = True
            try:
                ok = read_back(plan)
            except OSError as exc:
                unverified.append((plan['path'], str(exc)))
                print(f'{TAG}: {plan["path"]}: written, read-back FAILED ({exc})', file=sys.stderr)
                break
            if ok:
                written.append(plan['path'])
                if _fault('stdout', plan['path']):
                    _break_stdout()
                print(f'{TAG}: {plan["path"]}: written, read-back OK ({len(plan["after"])} bytes)')
            else:
                mismatched.append(plan['path'])
                print(f'{TAG}: {plan["path"]}: written, read-back MISMATCH', file=sys.stderr)
                break
        if failed is None and not mismatched and not unverified:
            print(f'{TAG}: applied {len(plans)} file(s), {sum(p["edits"] for p in plans)} edit(s)')
            return EXIT_APPLIED
    except OSError as exc:
        if not renamed:
            raise
        stream_failed = str(exc)
        _discard(sys.stdout)
    done = set(written) | set(mismatched) | {u[0] for u in unverified}
    if failed is not None:
        done.add(failed[0])
    unwritten = [p['path'] for p in plans if p['path'] not in done]
    parts = []
    if written:
        parts.append('written ' + ', '.join(written))
    if mismatched:
        parts.append('read-back mismatch ' + ', '.join(mismatched))
    if unverified:
        parts.append('unverified ' + ', '.join(f'{p} ({why})' for p, why in unverified))
    if failed is not None:
        parts.append(f'failed {failed[0]} ({failed[1]}), NOT written')
    if unwritten:
        parts.append('unwritten ' + ', '.join(unwritten))
    if stream_failed is not None:
        parts.append(f'output stream failed ({stream_failed}); the states before it are what was done')
    try:
        if _fault('stderr', plans[0]['path']):
            raise BrokenPipeError('injected stderr fault (PATCH_LITERAL_FAULT)')
        print(f'{TAG}: INCOMPLETE: ' + '; '.join(parts), file=sys.stderr)
    except OSError:
        _discard(sys.stderr)
    return EXIT_INCOMPLETE


# --- self-test ------------------------------------------------------------------------------

RUNS_EXPECTED = 62  # process runs below; a fixture added or removed must move this with it


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

    def no_temp(d):
        return not [f for f in os.listdir(d) if f.startswith('.patch-literal.')]

    with tempfile.TemporaryDirectory(prefix='patch-literal-verify.') as d:
        # v1: the plain case applies, reads back, reports
        put(d, 'a.txt', b'alpha beta\n')
        rc, out, err = go(['a.txt', '--replace', 'beta::gamma'], d)
        check('v1 exit', rc == 0, f'rc={rc} err={err}')
        check('v1 content', get(d, 'a.txt') == b'alpha gamma\n')
        check('v1 read-back line', 'read-back OK' in out, out)
        check('v1 applied line', 'applied 1 file(s), 1 edit(s)' in out, out)
        check('v1 no hook line', 'FAULT HOOK' not in err, err)

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

        # v5: a surviving --forbid literal refuses; consumed by the edit it passes; two hits on
        # one line are one line number
        put(d, 'd.txt', b'__X__ ok\n')
        rc, out, err = go(['d.txt', '--replace', 'ok::fine', '--forbid', '__'], d)
        check('v5 exit', rc == 1, f'rc={rc}')
        check('v5 unchanged', get(d, 'd.txt') == b'__X__ ok\n')
        check('v5 message', "forbidden literal '__' survives at line(s) 1\n" in err, err)
        rc, out, err = go(['d.txt', '--replace', '__X__ ok::fine', '--forbid', '__'], d)
        check('v5 consumed exit', rc == 0, f'rc={rc} err={err}')
        check('v5 consumed content', get(d, 'd.txt') == b'fine\n')

        # v6: bytes -- BOM, CRLF and a missing trailing newline survive outside the edit; the
        # dry-run diff marks the unterminated last line and keeps the summary on its own line
        put(d, 'e.txt', b'\xef\xbb\xbfline1\r\nkey=old\r\nline3')
        rc, out, err = go(['e.txt', '--replace', 'key=old::key=new'], d)
        check('v6 exit', rc == 0, f'rc={rc} err={err}')
        check('v6 bytes', get(d, 'e.txt') == b'\xef\xbb\xbfline1\r\nkey=new\r\nline3', get(d, 'e.txt'))
        put(d, 'e2.txt', b'hello')
        rc, out, err = go(['e2.txt', '--replace', 'hello::bye', '--dry-run'], d)
        check('v6 dry-run exit', rc == 0, f'rc={rc} err={err}')
        check('v6 dry-run marker', '-hello\n' + NO_NEWLINE + '+bye\n' + NO_NEWLINE + f'{TAG}: dry-run' in out, out)
        check('v6 dry-run unchanged', get(d, 'e2.txt') == b'hello')

        # v7: a symlink is refused, its target untouched and the link itself survives
        put(d, 'target.txt', b'target\n')
        os.symlink('target.txt', os.path.join(d, 'link.txt'))
        rc, out, err = go(['link.txt', '--replace', 'target::x'], d)
        check('v7 exit', rc == 1, f'rc={rc}')
        check('v7 target untouched', get(d, 'target.txt') == b'target\n')
        check('v7 link survives', os.path.islink(os.path.join(d, 'link.txt')))
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
        s = spec(d, 'v14e.json', [{'path': 'l.txt', 'edits': [{'old': 'l', 'new': 'm'}]}])
        rc, out, err = go(['--spec', s, '--count', '2'], d)
        check('v14 --count with --spec', rc == 2 and '--count' in err and '--spec' in err, f'rc={rc} err={err}')
        check('v14 untouched', get(d, 'l.txt') == b'l\n')

        # v15: the exit-3 arms through the fault hook -- a later write failing after an earlier
        # one succeeded (the earlier stays written), a read-back that does not match
        put(d, 'm.txt', b'm\n')
        put(d, 'n.txt', b'n\n')
        s = spec(d, 'v15.json', [{'path': 'm.txt', 'edits': [{'old': 'm', 'new': 'M'}]},
                                 {'path': 'n.txt', 'edits': [{'old': 'n', 'new': 'N'}]}])
        rc, out, err = go(['--spec', s], d, fault='write:' + os.path.join(d, 'n.txt'))
        check('v15 partial exit', rc == 3, f'rc={rc} err={err}')
        check('v15 partial m written', get(d, 'm.txt') == b'M\n')
        check('v15 partial n untouched', get(d, 'n.txt') == b'n\n', get(d, 'n.txt'))
        check('v15 partial report', 'INCOMPLETE: written m.txt; failed n.txt' in err and 'NOT written' in err, err)
        check('v15 hook named', 'FAULT HOOK ACTIVE' in err, err)
        check('v15 no temp left', no_temp(d), os.listdir(d))
        put(d, 'o.txt', b'o\n')
        rc, out, err = go(['o.txt', '--replace', 'o::O'], d, fault='readback:' + os.path.join(d, 'o.txt'))
        check('v15 mismatch exit', rc == 3, f'rc={rc} err={err}')
        check('v15 mismatch report', 'read-back MISMATCH' in err and 'read-back mismatch o.txt' in err, err)
        check('v15 mismatch renamed over', get(d, 'o.txt') == b'O\n\n', get(d, 'o.txt'))

        # v16: a multi-line, quote- and backslash-laden needle through the spec, unescaped
        body = 'const re = /\\"(.*?)\\"/g; // `tick`\nline two\n'
        put(d, 'p.js', body.encode('utf-8'))
        s = spec(d, 'v16.json', [{'path': 'p.js', 'edits': [
            {'old': '/\\"(.*?)\\"/g; // `tick`\nline two', 'new': '/\\"(.+?)\\"/g; // `tock`\nline 2'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v16 exit', rc == 0, f'rc={rc} err={err}')
        check('v16 content', get(d, 'p.js') == 'const re = /\\"(.+?)\\"/g; // `tock`\nline 2\n'.encode('utf-8'),
              get(d, 'p.js'))

        # v17: one file under two spellings the lexical check cannot fold -- relative and
        # absolute, and through a symlinked directory -- is refused by identity, nothing written
        put(d, 'q.txt', b'alpha beta\n')
        s = spec(d, 'v17a.json', [{'path': 'q.txt', 'edits': [{'old': 'alpha', 'new': 'ALPHA'}]},
                                  {'path': os.path.join(d, 'q.txt'), 'edits': [{'old': 'beta', 'new': 'BETA'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v17 abs/rel exit', rc == 1, f'rc={rc} err={err}')
        check('v17 abs/rel message', 'is the same file as q.txt' in err, err)
        check('v17 abs/rel untouched', get(d, 'q.txt') == b'alpha beta\n', get(d, 'q.txt'))
        os.mkdir(os.path.join(d, 'real'))
        os.symlink('real', os.path.join(d, 'viadir'))
        put(d, 'real/r.txt', b'alpha beta\n')
        s = spec(d, 'v17b.json', [{'path': 'real/r.txt', 'edits': [{'old': 'alpha', 'new': 'ALPHA'}]},
                                  {'path': 'viadir/r.txt', 'edits': [{'old': 'beta', 'new': 'BETA'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v17 symlinked-dir exit', rc == 1, f'rc={rc} err={err}')
        check('v17 symlinked-dir untouched', get(d, 'real/r.txt') == b'alpha beta\n')
        rc, out, err = go(['viadir/r.txt', '--replace', 'beta::BETA'], d)
        check('v17 symlinked-dir alone applies', rc == 0 and get(d, 'real/r.txt') == b'alpha BETA\n', f'rc={rc} err={err}')

        # v18: a file with a second hard link is refused; both names keep the old bytes
        put(d, 'hl1.txt', b'one\n')
        os.link(os.path.join(d, 'hl1.txt'), os.path.join(d, 'hl2.txt'))
        rc, out, err = go(['hl1.txt', '--replace', 'one::uno'], d)
        check('v18 exit', rc == 1, f'rc={rc} err={err}')
        check('v18 message', 'has 2 hard links' in err, err)
        check('v18 both untouched', get(d, 'hl1.txt') == b'one\n' and get(d, 'hl2.txt') == b'one\n')

        # v19: the FIRST (and only) write failing is exit 3 with nothing written, and the
        # report says so
        put(d, 'w.txt', b'w\n')
        rc, out, err = go(['w.txt', '--replace', 'w::W'], d, fault='write:' + os.path.join(d, 'w.txt'))
        check('v19 exit', rc == 3, f'rc={rc} err={err}')
        check('v19 untouched', get(d, 'w.txt') == b'w\n')
        tail = err.split('INCOMPLETE: ', 1)[1] if 'INCOMPLETE: ' in err else ''
        check('v19 report', tail.startswith('failed w.txt (injected write fault (PATCH_LITERAL_FAULT)), NOT written'), err)
        check('v19 no written part', 'written w.txt' not in tail and 'unverified' not in tail, tail)
        check('v19 no temp left', no_temp(d), os.listdir(d))

        # v20: a read-back that RAISES after the rename is exit 3 (unverified), not a traceback
        put(d, 'rf.txt', b'rf\n')
        rc, out, err = go(['rf.txt', '--replace', 'rf::RF'], d, fault='readfail:' + os.path.join(d, 'rf.txt'))
        check('v20 exit', rc == 3, f'rc={rc} err={err}')
        check('v20 written', get(d, 'rf.txt') == b'RF\n')
        check('v20 report', 'read-back FAILED' in err and 'unverified rf.txt (injected read-back fault' in err, err)
        check('v20 no traceback', 'Traceback' not in err, err)

        # v21: a self-overlapping needle is refused, not applied leftmost
        put(d, 'ov.txt', b'aaa\n')
        rc, out, err = go(['ov.txt', '--replace', 'aa::b'], d)
        check('v21 exit', rc == 1, f'rc={rc} err={err}')
        check('v21 message', 'self-overlapping needle: 1 non-overlapping but 2 overlapping' in err, err)
        check('v21 untouched', get(d, 'ov.txt') == b'aaa\n')
        rc, out, err = go(['ov.txt', '--replace', 'aaa::b'], d)
        check('v21 boundary needle applies', rc == 0 and get(d, 'ov.txt') == b'b\n', f'rc={rc} err={err}')

        # v22: the target changed between phase 1 and the rename is not renamed over
        put(d, 'ch.txt', b'ch\n')
        rc, out, err = go(['ch.txt', '--replace', 'ch::CH'], d, fault='touch:' + os.path.join(d, 'ch.txt'))
        check('v22 exit', rc == 3, f'rc={rc} err={err}')
        check('v22 not patched', get(d, 'ch.txt') == b'ch\n!', get(d, 'ch.txt'))
        check('v22 report', 'changed since it was read' in err and 'NOT written' in err, err)
        check('v22 no temp left', no_temp(d), os.listdir(d))

        # v23: a mismatch stops the loop -- the second file is left unwritten and reported so
        put(d, 's1.txt', b's1\n')
        put(d, 's2.txt', b's2\n')
        s = spec(d, 'v23.json', [{'path': 's1.txt', 'edits': [{'old': 's1', 'new': 'S1'}]},
                                 {'path': 's2.txt', 'edits': [{'old': 's2', 'new': 'S2'}]}])
        rc, out, err = go(['--spec', s], d, fault='readback:' + os.path.join(d, 's1.txt'))
        check('v23 exit', rc == 3, f'rc={rc} err={err}')
        check('v23 s2 unwritten', get(d, 's2.txt') == b's2\n')
        check('v23 report', 'read-back mismatch s1.txt; unwritten s2.txt' in err, err)
        check('v23 s1 renamed over', get(d, 's1.txt').startswith(b'S1\n'), get(d, 's1.txt'))

        # v24: two failing edits in one file carry the after-a-failed-edit suffix
        put(d, 'tf.txt', b'tf\n')
        s = spec(d, 'v24.json', [{'path': 'tf.txt', 'edits': [{'old': 'zz', 'new': 'y'}, {'old': 'qq', 'new': 'r'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v24 exit', rc == 1, f'rc={rc}')
        check('v24 both reported', 'edit 1 matches 0' in err and 'edit 2 matches 0' in err, err)
        check('v24 suffix once', err.count('after a failed edit') == 1, err)

        # v25: forbid line numbers -- distinct, in order, capped at five with an ellipsis
        put(d, 'ln.txt', b'a\n__\nb\n__ __\nc\n')
        rc, out, err = go(['ln.txt', '--replace', 'a::A', '--forbid', '__'], d)
        check('v25 lines', "survives at line(s) 2, 4\n" in err, err)
        put(d, 'ln6.txt', b'__\n__\n__\n__\n__\n__\n__\nz\n')
        rc, out, err = go(['ln6.txt', '--replace', 'z::Z', '--forbid', '__'], d)
        check('v25 cap', "survives at line(s) 1, 2, 3, 4, 5, ...\n" in err, err)

        # v26: the object-shaped spec with a global forbid
        put(d, 'ob.txt', b'__P__ text\n')
        s = spec(d, 'v26.json', {'forbid': ['__'], 'files': [{'path': 'ob.txt', 'edits': [{'old': 'text', 'new': 'TEXT'}]}]})
        rc, out, err = go(['--spec', s], d)
        check('v26 global forbid refuses', rc == 1 and "forbidden literal '__'" in err, f'rc={rc} err={err}')
        s = spec(d, 'v26b.json', {'forbid': ['__'], 'files': [{'path': 'ob.txt', 'edits': [{'old': '__P__ text', 'new': 'TEXT'}]}]})
        rc, out, err = go(['--spec', s], d)
        check('v26 global forbid consumed', rc == 0 and get(d, 'ob.txt') == b'TEXT\n', f'rc={rc} err={err}')

        # v27/v28: a read-back that raises, and a write that fails, on the FIRST of two files stop
        # the loop -- the second file is left unwritten and reported so
        put(d, 'g1.txt', b'g1\n')
        put(d, 'g2.txt', b'g2\n')
        s = spec(d, 'v27.json', [{'path': 'g1.txt', 'edits': [{'old': 'g1', 'new': 'G1'}]},
                                 {'path': 'g2.txt', 'edits': [{'old': 'g2', 'new': 'G2'}]}])
        rc, out, err = go(['--spec', s], d, fault='readfail:' + os.path.join(d, 'g1.txt'))
        check('v27 exit', rc == 3, f'rc={rc} err={err}')
        check('v27 g1 written', get(d, 'g1.txt') == b'G1\n')
        check('v27 g2 unwritten', get(d, 'g2.txt') == b'g2\n')
        check('v27 report', 'INCOMPLETE: unverified g1.txt (injected read-back fault (PATCH_LITERAL_FAULT)); unwritten g2.txt' in err, err)
        put(d, 'g1.txt', b'g1\n')
        rc, out, err = go(['--spec', s], d, fault='write:' + os.path.join(d, 'g1.txt'))
        check('v28 exit', rc == 3, f'rc={rc} err={err}')
        check('v28 both untouched', get(d, 'g1.txt') == b'g1\n' and get(d, 'g2.txt') == b'g2\n')
        check('v28 report', 'INCOMPLETE: failed g1.txt (injected write fault (PATCH_LITERAL_FAULT)), NOT written; unwritten g2.txt' in err, err)

        # v29: --count is not a way out of the overlap refusal; a needle beginning with - goes
        # through --replace=
        put(d, 'dash.txt', b'------\n')
        rc, out, err = go(['dash.txt', '--replace=---::+++', '--count', '2'], d)
        check('v29 exit', rc == 1, f'rc={rc} err={err}')
        check('v29 message', 'self-overlapping needle: 2 non-overlapping but 4 overlapping' in err, err)
        check('v29 untouched', get(d, 'dash.txt') == b'------\n')
        rc, out, err = go(['dash.txt', '--replace=------::++++++'], d)
        check('v29 whole run applies', rc == 0 and get(d, 'dash.txt') == b'++++++\n', f'rc={rc} err={err}')

        # v30: the output stream failing after a rename is exit 3 with the report on stderr
        put(d, 'so.txt', b'so\n')
        rc, out, err = go(['so.txt', '--replace', 'so::SO'], d, fault='stdout:' + os.path.join(d, 'so.txt'))
        check('v30 exit', rc == 3, f'rc={rc} err={err}')
        check('v30 written', get(d, 'so.txt') == b'SO\n')
        check('v30 report', 'INCOMPLETE: written so.txt; output stream failed ([Errno 32] Broken pipe)' in err, err)
        check('v30 no traceback', 'Traceback' not in err, err)
        check('v30 no unraisable', 'Exception ignored' not in err, err)

        # v34: the report's own stderr print failing (after a mismatch) is still exit 3, silently
        put(d, 'se.txt', b'se\n')
        p = os.path.join(d, 'se.txt')
        rc, out, err = go(['se.txt', '--replace', 'se::SE'], d, fault=f'readback:{p},stderr:{p}')
        check('v34 exit', rc == 3, f'rc={rc} err={err}')
        check('v34 written', get(d, 'se.txt') == b'SE\n\n', get(d, 'se.txt'))
        check('v34 no report', 'INCOMPLETE' not in err and 'Traceback' not in err and 'FAULT HOOK ACTIVE' in err, err)

        # v35: the output stream failing BEFORE any rename is exit 2 with nothing written
        put(d, 'ea.txt', b'ea\n')
        rc, out, err = go(['ea.txt', '--replace', 'ea::EA'], d, fault='stdout-early:' + os.path.join(d, 'ea.txt'))
        check('v35 exit', rc == 2, f'rc={rc} err={err}')
        check('v35 untouched', get(d, 'ea.txt') == b'ea\n')
        check('v35 message', 'output stream failed before any write' in err and 'Traceback' not in err and 'Exception ignored' not in err, err)

        # v31: a lone CR inside a line does not draw the no-newline marker in the dry-run diff
        put(d, 'cr.txt', b'a\rb\nc\n')
        rc, out, err = go(['cr.txt', '--replace', 'c::C', '--dry-run'], d)
        check('v31 exit', rc == 0, f'rc={rc} err={err}')
        check('v31 no false marker', NO_NEWLINE not in out and '-c\n' in out and '+C\n' in out, out)
        check('v31 unchanged', get(d, 'cr.txt') == b'a\rb\nc\n')

        # v32: a needle that is not encodable as UTF-8 (a lone surrogate) cannot run, not a traceback
        put(d, 'sur.txt', b'cafe\n')
        s = spec(d, 'v32.json', [{'path': 'sur.txt', 'edits': [{'old': '\ud800', 'new': 'x'}]}])
        rc, out, err = go(['--spec', s], d)
        check('v32 exit', rc == 2, f'rc={rc} err={err}')
        check('v32 message', 'not encodable as UTF-8' in err and 'Traceback' not in err, err)
        check('v32 untouched', get(d, 'sur.txt') == b'cafe\n')

        # v33: a read-only file in a writable directory is rewritten and keeps its mode
        put(d, 'ro.txt', b'ro\n', mode=0o444)
        rc, out, err = go(['ro.txt', '--replace', 'ro::RW'], d)
        check('v33 exit', rc == 0, f'rc={rc} err={err}')
        check('v33 content', get(d, 'ro.txt') == b'RW\n')
        check('v33 mode', os.stat(os.path.join(d, 'ro.txt')).st_mode & 0o777 == 0o444)

    check('run count', runs == RUNS_EXPECTED, f'{runs} run(s), RUNS_EXPECTED is {RUNS_EXPECTED}')
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
                   help='an edit; repeatable; exactly one :: in the argument')
    p.add_argument('--count', type=int, default=None,
                   help='expected occurrences for every --replace (default 1); refused beside --spec; not a way out of the overlap refusal')
    p.add_argument('--spec', metavar='SPEC.json', help='a JSON spec of files and edits')
    p.add_argument('--forbid', action='append', default=[], metavar='LITERAL',
                   help='refuse a result in which this literal survives; repeatable')
    p.add_argument('--dry-run', action='store_true', help='check and print the diff, write nothing')
    p.add_argument('--verify', action='store_true', help='run the self-test and exit non-zero on failure')
    return p


def main(argv):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors='backslashreplace', line_buffering=True)
        except (AttributeError, ValueError):
            pass
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.verify:
        return verify()
    try:
        if args.spec and (args.file or args.replace):
            raise SpecError('give either --spec or FILE --replace, not both')
        if args.spec and args.count is not None:
            raise SpecError('--count applies to --replace only; with --spec, give each edit its own "count"')
        if args.spec:
            entries = normalise_spec(load_spec_file(args.spec))
        elif args.file and args.replace:
            entries = spec_from_replaces(args.file, args.replace, 1 if args.count is None else args.count)
        else:
            raise SpecError('usage: FILE --replace OLD::NEW [...] | --spec SPEC.json | --verify')
        extra = [f.encode('utf-8') for f in args.forbid]
        for entry in entries:
            entry['forbid'] = entry['forbid'] + extra
    except SpecError as exc:
        print(f'{TAG}: cannot run: {exc}', file=sys.stderr)
        return EXIT_CANNOT_RUN
    except UnicodeEncodeError as exc:
        print(f'{TAG}: cannot run: an old, new or forbid value is not encodable as UTF-8 ({exc}); '
              f'this tool edits UTF-8 text only', file=sys.stderr)
        return EXIT_CANNOT_RUN
    try:
        return run(entries, args.dry_run)
    except OSError as exc:
        _discard(sys.stdout)
        try:
            print(f'{TAG}: cannot run: output stream failed before any write ({exc}); nothing written', file=sys.stderr)
        except OSError:
            _discard(sys.stderr)
        return EXIT_CANNOT_RUN


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
