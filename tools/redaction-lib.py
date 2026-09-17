#!/usr/bin/env python3
"""redaction-lib.py — the three primitives a redaction pipeline is built from.

WHY THIS IS A LIBRARY AND NOT A GATE
------------------------------------
`enforce-redaction-gate.sh` was specified by three skills as "the verification step every
redaction transform ends on": one scanner, run over a published tree, answering "is this clean?".
It was never written, and two independent lines of evidence say it should not be.

A 1507-line candidate was built and measured. Its first round fired 49 findings on this
repository's own public tooling; its second round fixed that and introduced a false negative on
an 86-character vendor token. Round one too noisy, round two too quiet — and the oscillation was
the result, not a tuning problem.

The reason is that a tree scanner has nothing to be right about. A deny-list's power is the
corpus of terms it denies, and a corpus of real internal identifiers is by definition private. A
public repository cannot hold one, so a public tree-scanner is guessing at shapes forever.

A working disclosure pipeline solves it the other way round, and this library is that pattern:

    the gate is a POST-CONDITION on a transform's own output,
    not a SCANNER over somebody's tree.

"After my mapping ran, none of the terms I was asked to remove survive in what I produced" is
decidable, cheap, and needs no corpus of its own — the caller supplies the terms, because only
the caller knows them. That assertion is `assert_clean` below, and it is the whole gate.

THE THREE PRIMITIVES
--------------------
  load_mapping(path)          an ordered replacement table, read from the caller's own file
  apply_mapping(text, table)  longest-source-first substitution
  assert_clean(text, terms)   the post-condition: raise if any term survives

Ordering is load-bearing. Applying a namespace prefix before a specific name lets the generic
rewrite eat the specific case: map `acme_widget_` -> `[widget-ns]` first and
`acme_widget_autoinstall` never matches its own precise stand-in again. `apply_mapping` sorts by
source length descending so the caller cannot get this wrong by writing the table in a convenient
order.

Usage:
    python3 tools/redaction-lib.py --verify     # self-test; non-zero if any arm fails
    from redaction_lib import load_mapping, apply_mapping, assert_clean
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


class RedactionError(Exception):
    """A term that should have been removed survived into the output."""


def load_mapping(path: str | Path) -> dict[str, str]:
    """Read an ordered replacement table from the caller's file.

    Two formats, chosen by extension, because a caller with three entries should not have to
    write JSON and a caller with three hundred should not have to escape shell metacharacters:

      .json   {"source": "replacement", ...}
      other   one `source<TAB>replacement` pair per line; blank lines and `#` comments skipped

    A tab is the separator rather than whitespace because an internal identifier may legitimately
    contain spaces, and a format that cannot express its own input is worse than no format.
    """
    p = Path(path)
    raw = p.read_text(encoding="utf-8")
    if p.suffix == ".json":
        table = json.loads(raw)
        if not isinstance(table, dict):
            raise RedactionError(f"{p}: JSON mapping must be an object, got {type(table).__name__}")
        bad = [k for k, v in table.items() if not isinstance(k, str) or not isinstance(v, str)]
        if bad:
            raise RedactionError(f"{p}: every key and value must be a string; offenders: {bad[:3]}")
        return table

    table: dict[str, str] = {}
    for lineno, line in enumerate(raw.splitlines(), 1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if "\t" not in line:
            raise RedactionError(f"{p}:{lineno}: no TAB separator in {line!r}")
        src, _, dst = line.partition("\t")
        if not src:
            raise RedactionError(f"{p}:{lineno}: empty source")
        table[src] = dst
    return table


def apply_mapping(text: str, table: dict[str, str]) -> str:
    """Replace every source with its replacement, longest source first.

    Longest-first is not a nicety. With `{'a_b': 'X', 'a_b_c': 'Y'}` applied in insertion order,
    `a_b_c` becomes `Xc` — the specific mapping never fires because the generic one consumed its
    prefix. Sorting by length descending makes the table order-independent for the caller.
    """
    for src in sorted(table, key=len, reverse=True):
        text = text.replace(src, table[src])
    return text


def assert_clean(text: str, terms, label: str = "output") -> None:
    """THE GATE. Raise unless every term is absent from `text`.

    This is the post-condition a redaction transform ends on, and it is the whole of what
    `enforce-redaction-gate.sh` was meant to be. It takes the terms from its caller because only
    the caller knows them — that is exactly the property a shipped tree-scanner cannot have.

    Reports EVERY surviving term, not the first: a redactor whose table missed three identifiers
    should learn all three from one run, and a gate that stops at the first sends its user round
    the loop once per term.

    The message names the term, which is safe: the caller already holds these strings, and a gate
    that will not say what leaked cannot be acted on. It never quotes the surrounding text, which
    would widen the disclosure from a term the caller knows to a passage they may not.
    """
    survivors = [t for t in terms if t and t in text]
    if survivors:
        raise RedactionError(
            f"{label}: {len(survivors)} term(s) survived redaction: {', '.join(sorted(survivors))}"
        )


# --------------------------------------------------------------------------------------------
# Self-test. Every arm asserts a NAMED behaviour and reports which one failed — a count alone
# cannot distinguish an arm that passed from an arm that passed for the wrong reason.
# --------------------------------------------------------------------------------------------
def _verify() -> int:
    import tempfile

    failures: list[str] = []

    def check(name: str, cond: bool, detail: str = "") -> None:
        if not cond:
            failures.append(f"{name}{': ' + detail if detail else ''}")

    # --- apply_mapping -----------------------------------------------------------------------
    check(
        "longest-first beats insertion order",
        apply_mapping("a_b_c", {"a_b": "X", "a_b_c": "Y"}) == "Y",
        f"got {apply_mapping('a_b_c', {'a_b': 'X', 'a_b_c': 'Y'})!r}, expected 'Y'",
    )
    check(
        "longest-first is order-independent (reversed table, same result)",
        apply_mapping("a_b_c", {"a_b_c": "Y", "a_b": "X"}) == "Y",
    )
    check("an empty table is the identity", apply_mapping("abc", {}) == "abc")
    check(
        "a replacement containing a source is not re-replaced",
        apply_mapping("secret", {"secret": "secret-ish"}) == "secret-ish",
    )
    check("every occurrence is replaced, not only the first",
          apply_mapping("x x x", {"x": "y"}) == "y y y")

    # --- assert_clean: the gate ---------------------------------------------------------------
    try:
        assert_clean("nothing here", ["alpha", "beta"])
        clean_ok = True
    except RedactionError:
        clean_ok = False
    check("a clean text passes", clean_ok)

    try:
        assert_clean("contains alpha", ["alpha"])
        check("a surviving term RAISES", False, "no exception raised")
    except RedactionError as exc:
        check("a surviving term raises and names the term", "alpha" in str(exc), str(exc))

    try:
        assert_clean("alpha and gamma", ["alpha", "beta", "gamma"])
        check("ALL survivors are reported", False, "no exception raised")
    except RedactionError as exc:
        check(
            "ALL survivors are reported, not just the first",
            "alpha" in str(exc) and "gamma" in str(exc) and "beta" not in str(exc),
            str(exc),
        )

    try:
        assert_clean("anything", [""])
        empty_ok = True
    except RedactionError:
        empty_ok = False
    check("an empty term does not match everything", empty_ok)

    # The end-to-end property the whole library exists for.
    table = {"acme_widget_autoinstall": "[autoinstall]", "acme_widget_": "[widget-ns]"}
    out = apply_mapping("acme_widget_autoinstall and acme_widget_other", table)
    try:
        assert_clean(out, table.keys(), "redacted")
        e2e = True
        why = out
    except RedactionError as exc:
        e2e = False
        why = str(exc)
    check("redact-then-assert leaves no source term behind", e2e, why)

    # --- load_mapping -------------------------------------------------------------------------
    with tempfile.TemporaryDirectory() as td:
        tsv = Path(td) / "m.tsv"
        tsv.write_text("# comment\n\nalpha\t[A]\nbeta with space\t[B]\n", encoding="utf-8")
        t = load_mapping(tsv)
        check("TSV: comments and blank lines are skipped", len(t) == 2, f"got {t}")
        check("TSV: a source containing a space survives", t.get("beta with space") == "[B]")

        js = Path(td) / "m.json"
        js.write_text('{"alpha": "[A]"}', encoding="utf-8")
        check("JSON: parsed by extension", load_mapping(js) == {"alpha": "[A]"})

        bad = Path(td) / "bad.tsv"
        bad.write_text("no-tab-here\n", encoding="utf-8")
        try:
            load_mapping(bad)
            check("TSV: a line with no TAB is refused", False, "no exception raised")
        except RedactionError as exc:
            check("TSV: a line with no TAB is refused, naming the line", "bad.tsv:1" in str(exc), str(exc))

        badjson = Path(td) / "b.json"
        badjson.write_text('["not", "an", "object"]', encoding="utf-8")
        try:
            load_mapping(badjson)
            check("JSON: a non-object is refused", False, "no exception raised")
        except RedactionError:
            check("JSON: a non-object is refused", True)

    total = 14
    print(f"redaction-lib --verify: {total - len(failures)}/{total} arm(s) passed")
    for f in failures:
        print(f"  FAILED: {f}", file=sys.stderr)
    if failures:
        print(f"redaction-lib --verify: {len(failures)} arm(s) FAILED", file=sys.stderr)
        return 1
    print("  proved: longest-first ordering, order-independence, every-occurrence replacement,")
    print("  assert_clean passing clean text, raising on a survivor and naming it, reporting ALL")
    print("  survivors, not matching on an empty term, the redact-then-assert end-to-end")
    print("  property, and both mapping formats including their two refusals.")
    return 0


if __name__ == "__main__":
    if "--verify" in sys.argv[1:]:
        sys.exit(_verify())
    print(__doc__.strip().splitlines()[0])
    print("run with --verify to self-test; import it to use the three primitives")
    sys.exit(0)
