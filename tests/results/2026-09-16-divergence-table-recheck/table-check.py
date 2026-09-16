#!/usr/bin/env python3
"""Re-derive the three F3 corrections to the divergence table in EXAMPLES.md.

The stripper is lifted verbatim from the estimator block extracted out of
skills/verify-memory-integrity/SKILL.md, so what is measured here is the shipped
code, not a retyping of it.
"""
import re


def strip_new(full):
    """The repaired loop: an OPEN comment wins over the fence rule (#734)."""
    text = re.sub(r'\A---\r?\n.*?\r?\n---[ \t]*\r?\n', '', full, flags=re.S)
    kept, fence, cmt = [], False, False
    for ln in text.split('\n'):
        if cmt:
            cmt = '-->' not in ln
            continue
        if ln.lstrip().startswith('```'):
            fence = not fence
        elif not fence and ln.lstrip().startswith('<!--'):
            cmt = '-->' not in ln
            continue
        kept.append(ln)
    return '\n'.join(kept)


def strip_old(full):
    """The pre-#734 loop: the fence branch ran FIRST."""
    text = re.sub(r'\A---\r?\n.*?\r?\n---[ \t]*\r?\n', '', full, flags=re.S)
    kept, fence, cmt = [], False, False
    for ln in text.split('\n'):
        if ln.lstrip().startswith('```'):
            fence = not fence
        elif not fence and (cmt or ln.lstrip().startswith('<!--')):
            cmt = '-->' not in ln
            continue
        kept.append(ln)
    return '\n'.join(kept)


def n(s):
    return len([l for l in s.split('\n') if l.strip()])


FIXTURES = {
    # F3.1 — `~~~` fence wrapping a comment. CommonMark: ~~~ opens a fence, so the
    # comment inside it is CODE and every line is kept.
    'tilde fence around a comment': (
        '- [alpha](a.md)\n~~~text\n<!--\nnote\n-->\n~~~\n- [beta](b.md)\n- [gamma](c.md)\n- [delta](d.md)\n',
        9,
    ),
    # F3.2 — an unclosed fence. CommonMark: the rest of the document is code.
    'unclosed fence': (
        '- [alpha](a.md)\n```text\n- [beta](b.md)\n- [gamma](c.md)\n- [delta](d.md)\n',
        5,
    ),
    'unclosed fence then a comment': (
        '- [alpha](a.md)\n```text\n<!--\nnote\n-->\n- [beta](b.md)\n- [gamma](c.md)\n- [delta](d.md)\n',
        8,
    ),
    # F3.3 — an unclosed COMMENT containing a fence delimiter. CommonMark: an HTML
    # block opened by <!-- runs to EOF when no --> arrives, so only line 1 survives.
    'unclosed comment containing a fence': (
        '- [alpha](a.md)\n<!--\n```\n- [beta](b.md)\n- [gamma](c.md)\n- [delta](d.md)\n',
        1,
    ),
    'unclosed comment, no fence': (
        '- [alpha](a.md)\n<!--\n- [beta](b.md)\n- [gamma](c.md)\n',
        1,
    ),
}

print(f"{'fixture':<40} {'raw':>4} {'commonmark':>11} {'new':>4} {'old':>4}  verdict")
for name, (src, correct) in FIXTURES.items():
    raw, new, old = n(src), n(strip_new(src)), n(strip_old(src))
    if new == correct:
        verdict = 'matches CommonMark'
    elif new < correct:
        verdict = f'UNDER-reports by {correct - new}'
    else:
        verdict = f'over-reports by {new - correct}'
    changed = '' if new == old else f'  [PR changed it: {old} -> {new}]'
    print(f'{name:<40} {raw:>4} {correct:>11} {new:>4} {old:>4}  {verdict}{changed}')
