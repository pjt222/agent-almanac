#!/usr/bin/env python3
"""
Geometry and reconstruction arithmetic for auto-memory index cap probes.

    python3 capgeom.py --verify      # re-derive every published figure, assert, print counts
    python3 capgeom.py --arms        # the arm registry as a table
    python3 capgeom.py --span 170 147            # where does line 170 sit at 147 units/line?
    python3 capgeom.py --span 163 153 --header 34

WHY THIS FILE EXISTS
--------------------
Every party measuring this cap -- including this repository -- has re-derived the same two
primitives by hand and got them wrong at least once:

  * a probe reporting `size-bound` for every file exceeding both caps, because the line test
    sat after a `break`;
  * a probe counting a trailing empty split element as a 201st line;
  * a published boundary column computed as `ceil(cap/units-per-line)` where whole-line
    truncation gives the floor -- wrong in the unsafe direction, on three rows;
  * a needle placed at the START of its line, so the arm proved a bound 94 units weaker than
    claimed while looking exactly like a result;
  * this repository attributing both ends of a bracket to one arm when the floor came from a
    different party's fixture on a different build;
  * this repository publishing "fourteen of fifteen" against fourteen rows, having counted a
    markdown table by eye -- in a document whose own argument is that a figure quoted without
    naming its denominator is unfalsifiable.

The last two are why the ARMS registry below is the single source of truth and every count is
computed from it. A number nobody can re-derive is a number nobody can check.

CONVENTIONS
-----------
Lines are 1-indexed. `units_per_line` INCLUDES the line terminator, so 146 content characters
plus LF is 147, and a CRLF fixture at the same visible width is 148. `header` is any fixed
prefix before line 1 of the numbered body.

Units are UTF-16 code units throughout -- measured, not assumed; see RESULT.md verdict 1 and
its 2026-08-25 addendum for what that verdict does and does not now rest on.
"""

import sys

LINE_CAP = 200          # documented, and measured to bite independently of the size cap
DOCUMENTED_CAP = 25000  # documented and ROUND -- never treat it as measured


# ── primitives ────────────────────────────────────────────────────────────────

def line_span(n, units_per_line, header=0):
    """Unit positions of line `n`. Returns (content_start, content_end, lf_unit), 1-indexed.

    The whole point of returning three numbers rather than one: a content needle proves a bound
    at `content_end` (or earlier, if it is not flush), while `lf_unit` is only reachable by
    assuming whole-line truncation. Conflating them is how a bound drifts by two units.
    """
    if n < 1:
        raise ValueError('lines are 1-indexed')
    if units_per_line != int(units_per_line):
        # A fractional width is a fixture AVERAGE (total units / line count), fine for the
        # ruler's floor division but meaningless for locating a specific line. Refuse rather
        # than return a position that is off by a fraction of a character.
        raise ValueError(f'line_span needs an exact units_per_line, got {units_per_line}')
    units_per_line = int(units_per_line)
    header = int(header)
    width = units_per_line - 1
    start = header + (n - 1) * units_per_line + 1
    return start, start + width - 1, header + n * units_per_line


def reconstructed_cut(units_per_line, cap=DOCUMENTED_CAP, header=0, line_cap=LINE_CAP):
    """The last kept line a pure-arithmetic RECONSTRUCTION predicts, having read nothing.

    This is the ruler. If an arm's measured answer equals this, the arm cannot distinguish a
    subject that reported where the index was cut from one that computed the same number by
    arithmetic -- whatever else it appears to show.

    Note what the reconstruction still requires: the line width in UTF-16 units, which nothing
    but the index carries. So the claim is never "a subject that read nothing produces this"; it
    is "a subject that read the index and never attended to the cut produces this". Enough to
    void the arm, and the stronger phrasing was an overclaim (#717 review).

    The `line_cap` clamp is load-bearing for short-line arms: `lines300` at 21 units/line has a
    raw size cut of 1,190 and is bound by the documented 200-line rule instead. Such a row is
    reconstructible in a WEAKER sense -- its prediction is width-insensitive, so it cannot fail
    this test under any harness behaviour. It says nothing about UTF-16 units or 25,000, and
    should be read as a different claim shape from the size-bound rows.
    """
    return int(min((cap - header) // units_per_line, line_cap))


def bound_from_needle(n, units_per_line, header=0, trailing=0):
    """Bounds provable from a needle on line `n`, by how much you are willing to assume.

    `trailing` is the number of characters after the needle's last informative character (a
    trailing period is 1). Returns a dict keyed by the assumption each bound requires.
    """
    _, content_end, lf = line_span(n, units_per_line, header)
    return {
        'read':       content_end - trailing,  # needle was read: no model assumed
        'flush':      content_end,             # as above with a flush needle
        'whole_line': lf,                      # assumes whole-line truncation
    }


def intersect(*brackets):
    """Intersect half-open [lo, hi) brackets. Returns None if empty."""
    lo = max(b[0] for b in brackets)
    hi = min(b[1] for b in brackets)
    return (lo, hi) if lo < hi else None


def relation(a, b):
    """How two half-open brackets relate. Guards the trap that 'overlapping' reads as 'nested'."""
    if a[0] <= b[0] and a[1] >= b[1]:
        return 'a contains b'
    if b[0] <= a[0] and b[1] >= a[1]:
        return 'b contains a'
    return 'overlap' if intersect(a, b) else 'disjoint'


# ── the arm registry: single source of truth ──────────────────────────────────
# (source, label, units_per_line, header, measured_last_kept, build, instrument)
#   instrument: 'echo'       -- subject reports a canary/line number it can also COMPUTE
#               'behavioural'-- subject acts on an invented token it cannot compute or fake

ARMS = [
    ('pjt222',     'ascii 200x126',        25399 / 200,  0, 196, '2.1.237-241', 'echo'),
    ('pjt222',     'cjk 200x126',          25399 / 200,  0, 196, '2.1.241',     'echo'),
    ('pjt222',     'crlf 200x126',         25598 / 200,  0, 195, '2.1.237-241', 'echo'),
    ('pjt222',     'astral 200x126',       48399 / 200,  0, 103, '2.1.237-241', 'echo'),
    ('pjt222',     'ascii200 200x200',     40199 / 200,  0, 124, '2.1.241',     'echo'),
    ('pjt222',     'wide2000 200x2000',   400199 / 200,  0,  12, '2.1.237-241', 'echo'),
    ('pjt222',     'ctrl 150x200',              201.0,   0, 124, '2.1.241',     'echo'),
    ('pjt222',     'bare 150x200',              201.0,   0, 124, '2.1.241',     'echo'),
    ('pjt222',     'lines300 300x20',            21.0,   0, 200, '2.1.241',     'echo'),
    ('pjt222',     'fenced 150x200',            201.0,   0, 109, '2.1.241',     'echo'),
    ('DanceNitra', 'ASCII 200x125',             126.0,   0, 198, '2.1.241',     'echo'),
    ('DanceNitra', 'CJK 200x125',               126.0,   0, 198, '2.1.241',     'echo'),
    ('DanceNitra', 'CJK 200x60',                 61.0,   0, 200, '2.1.241',     'echo'),
    ('DanceNitra', 'emoji 200x125',             217.0,   0, 115, '2.1.241',     'echo'),
    ('DanceNitra', '147-char x180',             148.0,   0, 168, '2.1.241',     'echo'),
    ('tonydzi',    '153 b/line x?',             153.0,  34, 163, '2.1.201',     'echo'),
]

# Behavioural arms. Each records the boundary needle and whether its exact planted value came
# back, which is the ONLY safe classifier: an absent needle returns no `UNKNOWN` token in two
# of three observed modes, and fabricates a plausible value in ~2% of trials (1 of 51).
# (label, units_per_line, boundary_line, trailing, value_returned, build)
BEHAVIOURAL = [
    ('147 u/l x180',  147, 170, 1, True,  '2.1.245'),
    ('200 u/l x140',  200, 125, 0, True,  '2.1.245'),
    ('200 u/l x140',  200, 126, 0, False, '2.1.245'),
    ('251 u/l x110',  251, 100, 0, False, '2.1.245'),
    ('167 u/l x160',  167, 150, 0, False, '2.1.245'),
    ('136 u/l x195',  136, 184, 0, False, '2.1.245'),
]

# Published brackets and where each END actually comes from. Recorded as provenance because
# getting this wrong is not hypothetical: an earlier draft credited both ends to one arm.
# NOTE, found by this file's own --verify: BOTH ends are `whole_line`, i.e. both additionally
# assume whole-line truncation on top of being echo-derived. tonydzi's "canary 163 ends at
# 24973" is 34 + 163*153, the LF position; its CONTENT ends at 24972. An earlier draft recorded
# that end as `read` and derived 24972, one short of the published floor. The echo bracket is
# therefore weaker than it looks: reconstructible AND model-dependent at each end.
BRACKET_PROVENANCE = {
    'floor 24973':   ('tonydzi',    '153 b/line x?',  163, 'whole_line'),
    'ceiling 25012': ('DanceNitra', '147-char x180',  169, 'whole_line'),
}


# ── #722: the harness states the cap in the prompt ────────────────────────────
# A third instrument, added 2026-08-25. `echo` and `behavioural` both read the MODEL; `wire`
# reads the request body the client actually sent, captured with tools/wirecap.py. The
# reconstruction ruler does not apply to it -- bytes that were sent cannot be confused with
# bytes that were computed -- so these arms need no `informative` accounting.
#
# (label, units_per_line, fixture_lines, highest_line_on_the_wire, build)
WIRE = [
    ('under 100x200', 201.0, 100, 100, '2.1.245'),   # complete: no cut, no notice
    ('over 150x200',  201.0, 150, 124, '2.1.245'),   # size cut  + size notice
    ('lines 300x20',   21.0, 300, 200, '2.1.245'),   # line cut  + line notice
]

# The notice the harness appends inside the memory <system-reminder> when it truncates. Recorded
# because its NUMBERS are the finding: it states the cap, so a model never needs documentation.
NOTICE_SIZE = ('over 150x200', 29.4, 24.4)   # (arm, "MEMORY.md is X KB", "(limit: Y KB)")
NOTICE_LINES = ('lines 300x20', 300, 200)    # (arm, "MEMORY.md is N lines", "(limit: M)")

# #721: is a block-level HTML comment stripped before the caps apply, and does the fence's info
# string change the answer? All arms are 150 canary lines at 201 units; `block` is the units
# consumed before canary 1, INCLUDING the newline separating block from canaries (which is why
# `bare` is 3024, not 3023 -- #721's published spec includes it and the two must not disagree).
#
# `comments` is the number of comment body lines that reached the wire, out of 15. It is the
# column the behavioural protocol could not produce, and it is what separates "preserved and
# counted" from "stripped but still charged".
#
# (arm, block_units, last_canary_on_wire, comments_on_wire, notice_kb, build)
FENCE = [
    ('ctrl',        0, 124,  0, 29.4, '2.1.245'),   # anchor
    ('bare',     3024, 124,  0, 29.4, '2.1.245'),   # stripped, and not counted
    ('text',     3036, 109, 15, 32.4, '2.1.245'),
    ('yaml',     3036, 109, 15, 32.4, '2.1.245'),
    ('bash',     3036, 109, 15, 32.4, '2.1.245'),
    ('json',     3036, 109, 15, 32.4, '2.1.245'),
    ('untagged', 3032, 109, 15, 32.4, '2.1.245'),   # the case the default-deny rule turns on
]
FENCE_CANARIES = 150
FENCE_UNITS_PER_LINE = 201


def fence_file_units(block):
    """Total units of a #721 fixture, before any strip."""
    return FENCE_CANARIES * FENCE_UNITS_PER_LINE - 1 + block


def notice_kb(units):
    """The KB figure the notice displays for an index of `units` UTF-16 units.

    Divisor is 1024, not 1000: the 30,149-unit fixture displayed 29.4, and 30149/1000 = 30.1."""
    return round(units / 1024, 1)


def kb_bracket(displayed):
    """The unit range consistent with a one-decimal KB figure, ASSUMING round-half.

    This is what the notice's rounding permits, and the reason the notice CANNOT sharpen the cap
    estimate even though it names it.

    The mode is ASSUMED, not measured. If the harness TRUNCATES to one decimal the range is
    [24985.6, 25088) instead, and the single calibration point available (29.4423 -> 29.4) reads
    the same under both. No conclusion moves: both variants contain 25,000, and both sit inside
    [24924, 25125), the preimage of 124 under floor(./201) -- which is the only property the
    reconstruction argument needs."""
    return ((displayed - 0.05) * 1024, (displayed + 0.05) * 1024)


def cut_from_notice(displayed_limit_kb, units_per_line):
    """What a model computes from the notice alone: it is TOLD the cap and can SEE the width."""
    return int(displayed_limit_kb * 1024 // units_per_line)


# ── verification ──────────────────────────────────────────────────────────────

def verify():
    ok = True
    print('=== ruler: does each echo arm return floor(cap/units-per-line)? ===\n')
    print(f"{'source':11} {'arm':22} {'u/line':>9} {'floor':>6} {'measured':>9}  verdict")
    recon = 0
    for src, label, upl, hdr, measured, _build, _inst in ARMS:
        pred = reconstructed_cut(upl, header=hdr)
        hit = pred == measured
        recon += hit
        print(f'{src:11} {label:22} {upl:9.3f} {pred:6d} {measured:9d}  '
              f"{'reconstructible' if hit else '*** NOT reconstructible ***'}")
    total = len(ARMS)
    print(f'\n  {recon} of {total} reconstructible '
          f'({total - recon} informative) -- counted, not eyeballed')
    size_bound = [a for a in ARMS if reconstructed_cut(a[2], header=a[3]) < LINE_CAP]
    sb_recon = sum(reconstructed_cut(a[2], header=a[3]) == a[4] for a in size_bound)
    print(f'  of which size-bound (the rows that say anything about 25000 or UTF-16): '
          f'{sb_recon} of {len(size_bound)}')
    if recon != total - 1:
        print('  UNEXPECTED: exactly one arm (fenced) should resist width-only reconstruction')
        ok = False

    print('\n=== bracket provenance: which arm sources which END? ===\n')
    for name, (src, label, line, kind) in BRACKET_PROVENANCE.items():
        arm = next(a for a in ARMS if a[0] == src and a[1] == label)
        bounds = bound_from_needle(line, arm[2], header=arm[3])
        claimed = int(name.split()[1])
        got = bounds[kind]
        flag = 'OK' if got == claimed else f'*** MISMATCH: derives {got} ***'
        print(f'  {name:15} <- {src} {label}, line {line} ({kind}) = {got}  {flag}')
        if got != claimed:
            ok = False

    print('\n=== behavioural bounds (no truncation model assumed) ===\n')
    lo, hi = 0, 10 ** 9
    for label, upl, n, trailing, returned, build in BEHAVIOURAL:
        b = bound_from_needle(n, upl, trailing=trailing)
        if returned:
            lo = max(lo, b['read'])
            print(f"  {label:14} line {n:3d}  READ    -> cap >= {b['read']:6d}  [{build}]")
        else:
            hi = min(hi, b['read'])
            print(f"  {label:14} line {n:3d}  UNREAD  -> cap <  {b['read']:6d}  [{build}]")

    sound = (lo, hi)
    echo = (24973, 25012)
    print(f'\n  sound behavioural bracket  [{sound[0]}, {sound[1]})   {sound[1]-sound[0]} units')
    print(f'  echo-derived bracket       [{echo[0]}, {echo[1]})   {echo[1]-echo[0]} units')
    print(f'  relation: {relation(sound, echo)}   intersection: {intersect(sound, echo)}')
    print(f'  is {DOCUMENTED_CAP} inside the sound bracket? '
          f'{sound[0] <= DOCUMENTED_CAP < sound[1]}')
    if relation(sound, echo) != 'overlap':
        print('  UNEXPECTED: these overlap; neither contains the other')
        ok = False

    print('\n=== wire arms: the cut read from the request body, not from an answer ===\n')
    for label, upl, fixture_lines, on_wire, build in WIRE:
        pred = reconstructed_cut(upl)
        cut = on_wire < fixture_lines
        expected = pred if cut else fixture_lines
        flag = 'OK' if on_wire == expected else f'*** MISMATCH: expected {expected} ***'
        print(f"  {label:16} {fixture_lines:3d} lines -> {on_wire:3d} on the wire  "
              f"({'cut' if cut else 'complete'})  {flag}  [{build}]")
        if on_wire != expected:
            ok = False

    print('\n=== the notice states the cap, so reconstruction needs no documentation ===\n')
    arm, shown_kb, limit_kb = NOTICE_SIZE
    upl = next(w[1] for w in WIRE if w[0] == arm)
    fixture_units = int(next(w[2] for w in WIRE if w[0] == arm) * upl) - 1
    measured_cut = next(w[3] for w in WIRE if w[0] == arm)

    if notice_kb(fixture_units) != shown_kb:
        print(f'  *** notice_kb({fixture_units}) = {notice_kb(fixture_units)}, '
              f'notice showed {shown_kb} ***')
        ok = False
    else:
        print(f'  notice_kb({fixture_units} units) = {shown_kb}  '
              f'-- matches the captured string, so the divisor is 1024')

    if notice_kb(DOCUMENTED_CAP) != limit_kb:
        print(f'  *** notice_kb({DOCUMENTED_CAP}) = {notice_kb(DOCUMENTED_CAP)}, '
              f'notice showed limit {limit_kb} ***')
        ok = False
    else:
        print(f'  notice_kb({DOCUMENTED_CAP}) = {limit_kb}  '
              f'-- the stated limit is consistent with the documented cap')

    told = cut_from_notice(limit_kb, upl)
    flag = 'OK' if told == measured_cut else f'*** derives {told}, measured {measured_cut} ***'
    print(f'  a model TOLD "limit: {limit_kb}KB" and SEEING {upl:.0f}-unit lines computes '
          f'floor({limit_kb}*1024/{upl:.0f}) = {told}   {flag}')
    if told != measured_cut:
        ok = False

    nb = kb_bracket(limit_kb)
    print(f'\n  the notice brackets the cap to [{nb[0]:.1f}, {nb[1]:.1f})  '
          f'{nb[1]-nb[0]:.1f} units wide')
    print(f'  sound behavioural bracket      [{sound[0]}, {sound[1]})  '
          f'{sound[1]-sound[0]} units wide')
    print(f'  contains {DOCUMENTED_CAP}? {nb[0] <= DOCUMENTED_CAP < nb[1]}   '
          f'contains the behavioural bracket? {nb[0] <= sound[0] and sound[1] <= nb[1]}')
    # The notice names the cap but rounds it, so it must NOT be quoted as sharpening the
    # estimate. Pin that as an assertion, because "the harness told us the cap" is exactly the
    # sentence that invites treating it as a measurement.
    if (nb[1] - nb[0]) <= (sound[1] - sound[0]):
        print('  UNEXPECTED: the notice bracket should be WIDER -- it names the cap but '
              'rounds it, and is not an independent behavioural measurement')
        ok = False

    arm_l, shown_lines, limit_lines = NOTICE_LINES
    wire_l = next(w for w in WIRE if w[0] == arm_l)
    on_wire_l = wire_l[3]
    print(f'\n  line variant states "is {shown_lines} lines (limit: {limit_lines})"; '
          f'wire cut = {on_wire_l}')
    if limit_lines != on_wire_l or limit_lines != LINE_CAP:
        print('  *** the line notice should state the line cap verbatim ***')
        ok = False
    else:
        print(f'  the answer {limit_lines} was a LITERAL in that arm\'s own prompt '
              '-- nothing to reconstruct')

    # Three figures on the line arm were PRINTED and never asserted, so mutating them survived
    # (#724 review). A published-but-unchecked figure is the thing this file exists to prevent.
    #
    #   - the notice's stated line count must equal the fixture's line count;
    #   - the fixture must be UNDER the size cap, or the arm does not isolate the line cap and
    #     its registry comment ("over the LINE cap only") is false;
    #   - and its width must therefore be small enough for the clamp to bind.
    if shown_lines != wire_l[2]:
        print(f'  *** notice says {shown_lines} lines, fixture has {wire_l[2]} ***')
        ok = False
    size_of_line_arm = int(wire_l[2] * wire_l[1]) - 1
    print(f'  fixture size {size_of_line_arm} units vs cap {DOCUMENTED_CAP}: '
          f'{"under -- line cap isolated" if size_of_line_arm < DOCUMENTED_CAP else "OVER"}')
    if size_of_line_arm >= DOCUMENTED_CAP:
        print('  *** the line arm must be UNDER the size cap, or it isolates nothing ***')
        ok = False

    print('\n=== #721 fence arms: does the info string change the strip? ===\n')
    print(f"  {'arm':9} {'block':>5} {'cut':>4} {'cmt':>4} {'kb':>6}  verdict")
    verdicts = {}
    for arm, block, cut, comments, kb, build in FENCE:
        stripped = DOCUMENTED_CAP // FENCE_UNITS_PER_LINE
        counted = (DOCUMENTED_CAP - block) // FENCE_UNITS_PER_LINE
        if cut == stripped and comments == 0:
            verdict = 'stripped, not counted'
        elif cut == counted and comments == 15:
            verdict = 'preserved, counted'
        else:
            verdict = f'*** incoherent: cut {cut}, {comments} comment line(s) ***'
            ok = False
        verdicts[arm] = verdict

        # The notice's own size figure must agree with the verdict, independently of the cut:
        # a stripped arm reports the POST-strip size, a counted arm the whole file.
        expect_units = (fence_file_units(block) - block if verdict.startswith('stripped')
                        else fence_file_units(block))
        if notice_kb(expect_units) != kb:
            verdict += f'  *** notice says {kb}KB, verdict implies ' \
                       f'{notice_kb(expect_units)}KB ***'
            ok = False
        print(f"  {arm:9} {block:5d} {cut:4d} {comments:4d} {kb:6.1f}  {verdict}  [{build}]")

    fenced = [a for a, *_ in FENCE if a not in ('ctrl', 'bare')]
    distinct = {verdicts[a] for a in fenced}
    print(f'\n  {len(fenced)} fenced arms ({", ".join(fenced)}) -> '
          f'{len(distinct)} distinct verdict(s)')

    # Untagged-vs-text FIRST, then distinctness across all five. The other order made the
    # untagged check unreachable by construction (#725 review): if the five share one verdict,
    # untagged and text necessarily agree, so the `elif` could never fire -- a guard that can
    # never fail, which reads as coverage it does not provide.
    if verdicts['untagged'] != verdicts['text']:
        print('  UNEXPECTED: untagged must match text -- it is the default-deny case')
        ok = False
    elif len(distinct) != 1:
        print('  UNEXPECTED: the info string should not change the verdict')
        ok = False
    else:
        print('  untagged is indistinguishable from every tagged arm, so an untagged fence '
              'is a fence')

    print('\nOK' if ok else '\nFAILED')
    return 0 if ok else 1


# ── negative evidence ─────────────────────────────────────────────────────────
# A --verify that has never been seen to FAIL is a green light of unknown wiring. This repo's
# standing rule (CLAUDE.md, "Proving a Gate Can Fail") is to break the subject and watch the
# check go red before trusting it. These mutations are applied to the module's own registries
# in memory -- the file on disk is never touched, so there is no mutant to strand and no backup
# to lose.
#
# Each entry names a recorded figure and a wrong value for it. Every one MUST make verify()
# exit non-zero; a survivor means that figure is published but unchecked.
MUTATIONS = [
    ('WIRE over cut 124->125',        'WIRE',         lambda: _swap_wire('over 150x200', 125)),
    ('WIRE lines cut 200->199',       'WIRE',         lambda: _swap_wire('lines 300x20', 199)),
    ('WIRE under 100->99 (a cut)',    'WIRE',         lambda: _swap_wire('under 100x200', 99)),
    ('notice size 29.4->29.5',        'NOTICE_SIZE',  lambda: ('over 150x200', 29.5, 24.4)),
    ('notice limit 24.4->24.5',       'NOTICE_SIZE',  lambda: ('over 150x200', 29.4, 24.5)),
    ('notice line limit 200->150',    'NOTICE_LINES', lambda: ('lines 300x20', 300, 150)),
    # The three that SURVIVED before the #724 review, now covered.
    ('notice shown lines 300->301',   'NOTICE_LINES', lambda: ('lines 300x20', 301, 200)),
    ('WIRE lines fixture 300->301',   'WIRE',         lambda: _swap_wire_field('lines 300x20', 2, 301)),
    ('WIRE lines u/l 21->200 (over)', 'WIRE',         lambda: _swap_wire_field('lines 300x20', 1, 200.0)),
    ('fence untagged cut 109->124',   'FENCE',        lambda: _swap_fence('untagged', cut=124)),
    ('fence untagged comments 15->0', 'FENCE',        lambda: _swap_fence('untagged', comments=0)),
    ('fence bare cut 124->109',       'FENCE',        lambda: _swap_fence('bare', cut=109)),
    ('fence text notice 32.4->29.4',  'FENCE',        lambda: _swap_fence('text', kb=29.4)),
    ('fence bare notice 29.4->32.4',  'FENCE',        lambda: _swap_fence('bare', kb=32.4)),
    # CROSS-ARM. Every mutation above trips a PER-ARM check first, so neither cross-arm branch
    # had any negative evidence (#725 review). This one is coherent as a single arm -- cut 124
    # with 0 comment lines is a valid 'stripped' row, and 30,149 units displays as 29.4KB -- so
    # it passes every per-arm test and can only be caught by `untagged != text`.
    ('fence text made COHERENTLY stripped', 'FENCE',
     lambda: _swap_fence('text', cut=124, comments=0, kb=29.4)),
]


def _swap_wire(label, on_wire):
    return _swap_wire_field(label, 3, on_wire)


def _swap_wire_field(label, index, value):
    """Replace one field of one WIRE row. `index` is a position in
    (label, units_per_line, fixture_lines, on_wire, build)."""
    out = []
    for row in WIRE:
        if row[0] == label:
            row = tuple(value if i == index else v for i, v in enumerate(row))
        out.append(row)
    return out


def _swap_fence(arm, cut=None, comments=None, kb=None):
    out = []
    for row in FENCE:
        if row[0] == arm:
            row = (row[0], row[1],
                   row[2] if cut is None else cut,
                   row[3] if comments is None else comments,
                   row[4] if kb is None else kb,
                   row[5])
        out.append(row)
    return out


def selftest_negative():
    """Mutate each recorded figure and assert verify() goes red."""
    import contextlib
    import io

    globals_ = globals()
    survivors = []
    print('=== negative evidence: each recorded figure, mutated ===\n')
    for name, target, make in MUTATIONS:
        original = globals_[target]
        globals_[target] = make()
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                code = verify()
        finally:
            globals_[target] = original
        killed = code != 0
        print(f"  {name:32} -> {'KILLED (verify went red)' if killed else '*** SURVIVED ***'}")
        if not killed:
            survivors.append(name)

    # And the baseline must still be green, or every kill above is meaningless.
    with contextlib.redirect_stdout(io.StringIO()):
        baseline = verify()
    print(f"\n  baseline (unmutated) -> {'green' if baseline == 0 else '*** RED ***'}")
    if baseline != 0:
        survivors.append('baseline is not green -- kills above prove nothing')

    if survivors:
        print(f'\nFAILED: {len(survivors)} unchecked figure(s)')
        for item in survivors:
            print(f'  {item}')
        return 1
    print(f'\nOK -- {len(MUTATIONS)} of {len(MUTATIONS)} mutations killed')
    return 0


def main():
    a = sys.argv[1:]
    if not a or a[0] == '--verify':
        return verify()
    if a[0] == '--selftest-negative':
        return selftest_negative()
    if a[0] == '--arms':
        for row in ARMS:
            print('\t'.join(str(x) for x in row))
        return 0
    if a[0] == '--wire':
        for row in WIRE:
            print('\t'.join(str(x) for x in row))
        return 0
    if a[0] == '--span':
        n, upl = int(a[1]), float(a[2])
        hdr = int(a[a.index('--header') + 1]) if '--header' in a else 0
        s, e, lf = line_span(n, upl, hdr)
        print(f'line {n} at {upl} units/line (header {hdr}):')
        print(f'  content {s}..{e}   LF {lf}')
        print(f'  reconstruction predicts last kept line: {reconstructed_cut(upl, header=hdr)}')
        return 0
    print(__doc__)
    return 2


if __name__ == '__main__':
    sys.exit(main())
