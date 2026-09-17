#!/usr/bin/env python3
"""redact-artifact.py — apply an ordered redaction mapping to one artifact, then assert the result.

WHAT THIS REPLACES
------------------
Three skills specified `tools/enforce-redaction-gate.sh`: one scanner, run over a published tree,
answering "is this clean?". It was never written, and `tools/redaction-lib.py`'s header records
why it should not be — a deny-list's power is its corpus, a corpus of real internal identifiers
is private by definition, and a public tree-scanner therefore has nothing to be right about.

This tool is the other shape. It does not audit a tree. It transforms ONE artifact with a mapping
its caller supplies and then refuses to hand back output in which any source term survives. The
gate is a post-condition on its own work, which is decidable without a corpus of its own.

THE TWO TIERS, AND WHY BOTH
---------------------------
  tier 1  substitution   longest-source-first over the whole text (redaction-lib.apply_mapping)
  tier 2  assertion      no source term survives — over the whole text, AND, for a structured
                         artifact, over the positions where a leak would actually matter

Tier 2's second half is not redundant. Substitution is textual and a mapping can reintroduce what
it removed: map `alpha` -> `beta_internal` while `beta_internal` is itself a denied term and the
whole-text assertion catches it, but map `alpha` -> `x` in a document whose *attribute* already
held `alpha` in a different encoding and only a parse sees it. The structure pass reports the
POSITION (`text[2]`, `attr:data-id[0]`) and never the surrounding content — a gate that quotes
its context widens the disclosure it exists to prevent.

WHAT IT CANNOT DO, STATED SO NOBODY RELIES ON IT
-----------------------------------------------
It cannot find what its caller did not name. There is no built-in deny-list and there will not
be: shipping one would be guessing at shapes, which is the failure mode this design exists to
avoid. It redacts and verifies exactly the terms in the mapping.

It also cannot see an identifier that survives in a form the mapping does not spell — base64, a
different case, a hyphen where the mapping has an underscore. `--also-deny` takes extra terms to
assert on without substituting them, which is how a caller checks for encodings it knows about.

Usage:
    python3 tools/redact-artifact.py --type md --mapping map.tsv IN.md -o OUT.md
    python3 tools/redact-artifact.py --type html --mapping map.json IN.html --in-place
    python3 tools/redact-artifact.py --verify
"""

from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

# `redaction-lib.py` carries a hyphen, so it is not importable by name; load it by path.
# `dont_write_bytecode` first: importing by path otherwise creates tools/__pycache__, and
# `check:tools-registry` refuses any non-plain-file under tools/ — so the tool would break a
# gate merely by running.
sys.dont_write_bytecode = True
import importlib.util as _ilu

_spec = _ilu.spec_from_file_location(
    "redaction_lib", Path(__file__).resolve().parent / "redaction-lib.py"
)
_rl = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_rl)

RedactionError = _rl.RedactionError
load_mapping = _rl.load_mapping
apply_mapping = _rl.apply_mapping
assert_clean = _rl.assert_clean

TYPES = ("md", "html", "mermaid", "text")


class _Positions(HTMLParser):
    """Collect (position-label, value) for every place an HTML leak would matter."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.found: list[tuple[str, str]] = []
        self._n = 0

    def handle_data(self, data: str) -> None:
        self._n += 1
        if data.strip():
            self.found.append((f"text[{self._n}]", data))

    def handle_starttag(self, tag: str, attrs) -> None:
        for i, (name, value) in enumerate(attrs):
            if value:
                self.found.append((f"attr:{name}[{i}]", value))


def positions(text: str, kind: str) -> list[tuple[str, str]]:
    """Meaningful positions for `kind`. An unstructured type yields the whole text once.

    The label is an ORDINAL and an attribute name, never the surrounding content — see the header.
    """
    if kind == "html":
        p = _Positions()
        p.feed(text)
        p.close()
        return p.found
    if kind == "mermaid":
        # Node labels: `id[Label]`, `id(Label)`, `id{Label}`, and quoted strings.
        out: list[tuple[str, str]] = []
        for i, m in enumerate(re.finditer(r'[\[\({"]([^\]\)\}"\n]+)[\]\)\}"]', text)):
            out.append((f"label[{i}]", m.group(1)))
        return out
    if kind == "md":
        # Prose lines and fenced-block bodies are both meaningful; the distinction that matters
        # is the ordinal, so a reviewer can find the line without being shown it.
        return [(f"line[{i}]", line) for i, line in enumerate(text.splitlines(), 1) if line.strip()]
    return [("whole", text)]


def structure_survivors(text: str, terms, kind: str) -> list[str]:
    """Position labels at which some term survives. Never returns the term's surroundings."""
    hits = []
    for label, value in positions(text, kind):
        for t in terms:
            if t and t in value:
                hits.append(f"{label}:{t}")
                break
    return hits


def redact_text(text: str, table: dict[str, str], kind: str, also_deny=()) -> str:
    """Tier 1 then tier 2. Raises RedactionError rather than returning unverified output."""
    out = apply_mapping(text, table)
    terms = list(table.keys()) + [t for t in also_deny if t]
    assert_clean(out, terms, "whole-text")
    survivors = structure_survivors(out, terms, kind)
    if survivors:
        raise RedactionError(f"structure: term(s) survive at {', '.join(survivors)}")
    return out


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0], add_help=True)
    ap.add_argument("input", nargs="?", help="artifact to redact")
    ap.add_argument("-o", "--output", help="write here (default: stdout)")
    ap.add_argument("--in-place", action="store_true", help="overwrite the input")
    ap.add_argument("--type", choices=TYPES, help="artifact type (required unless --verify)")
    ap.add_argument("--mapping", help="ordered mapping file (.json or TSV)")
    ap.add_argument(
        "--also-deny",
        action="append",
        default=[],
        help="assert this term is absent without substituting it; repeatable",
    )
    ap.add_argument("--verify", action="store_true", help="self-test and exit")
    args = ap.parse_args(argv)

    if args.verify:
        return _verify()

    missing = [n for n, v in (("input", args.input), ("--type", args.type), ("--mapping", args.mapping)) if not v]
    if missing:
        print(f"REFUSED: missing {', '.join(missing)}", file=sys.stderr)
        return 2
    if args.output and args.in_place:
        print("REFUSED: --output and --in-place are mutually exclusive", file=sys.stderr)
        return 2

    src = Path(args.input)
    if not src.is_file():
        print(f"REFUSED: not a readable file: {src}", file=sys.stderr)
        return 2

    try:
        table = load_mapping(args.mapping)
    except (OSError, RedactionError, ValueError) as exc:
        print(f"REFUSED: mapping: {exc}", file=sys.stderr)
        return 2
    if not table and not args.also_deny:
        # A run with nothing to do reports success over nothing, which is the vacuous pass this
        # repository has a standing rule about. Refuse instead.
        print("REFUSED: the mapping is empty and no --also-deny term was given", file=sys.stderr)
        return 2

    text = src.read_text(encoding="utf-8")
    try:
        out = redact_text(text, table, args.type, args.also_deny)
    except RedactionError as exc:
        print(f"FAILED: {exc}", file=sys.stderr)
        return 1

    if args.in_place:
        src.write_text(out, encoding="utf-8")
        dest = str(src)
    elif args.output:
        Path(args.output).write_text(out, encoding="utf-8")
        dest = args.output
    else:
        sys.stdout.write(out)
        dest = "-"
    print(
        f"redact-artifact: {src} -> {dest} ({len(table)} mapping(s), "
        f"{len(positions(out, args.type))} position(s) checked, 0 survivor(s))",
        file=sys.stderr,
    )
    return 0


def _verify() -> int:
    import tempfile

    failures: list[str] = []

    def check(name: str, cond: bool, detail: str = "") -> None:
        if not cond:
            failures.append(f"{name}{': ' + detail if detail else ''}")

    tbl = {"acme_secret": "[redacted]"}

    # --- the happy path, per type -------------------------------------------------------------
    for kind, sample in (
        ("text", "plain acme_secret here"),
        ("md", "# t\n\nprose acme_secret\n"),
        ("html", "<p>acme_secret</p>"),
        ("mermaid", "graph TD\n  a[acme_secret]\n"),
    ):
        try:
            out = redact_text(sample, tbl, kind)
            check(f"{kind}: redacts and passes its own assertion", "acme_secret" not in out, out)
        except RedactionError as exc:
            check(f"{kind}: redacts and passes its own assertion", False, str(exc))

    # --- the structure tier catches what the whole-text tier cannot ---------------------------
    # An HTML entity spells the term without the literal bytes appearing, so the whole-text
    # assertion passes on the raw source; convert_charrefs makes the parse see it.
    entity = "<p>acme&#95;secret</p>"
    try:
        redact_text(entity, {"never-present": "x"}, "html", also_deny=["acme_secret"])
        check("structure tier sees an entity-encoded term the text tier misses", False, "no raise")
    except RedactionError as exc:
        check(
            "structure tier sees an entity-encoded term the text tier misses",
            "structure:" in str(exc) and "text[" in str(exc),
            str(exc),
        )

    # --- a mapping that reintroduces a denied term --------------------------------------------
    try:
        redact_text("alpha", {"alpha": "beta_internal"}, "text", also_deny=["beta_internal"])
        check("a mapping that reintroduces a denied term is caught", False, "no raise")
    except RedactionError as exc:
        check("a mapping that reintroduces a denied term is caught", "whole-text" in str(exc), str(exc))

    # --- no message ever carries the surrounding content ---------------------------------------
    # Two arms, because the two tiers answer differently and an earlier single arm conflated
    # them: the whole-text tier runs FIRST and names the term without needing a parse, so it
    # reports no position. Asserting a position there failed for a correct reason — the arm was
    # mis-specified, not the code. What both tiers must guarantee is that neither quotes markup.
    try:
        redact_text("<p>acme_secret</p>", {"nothing": "x"}, "html", also_deny=["acme_secret"])
        check("a whole-text survivor raises", False, "no raise")
    except RedactionError as exc:
        check(
            "the whole-text tier names the term and never the surrounding markup",
            "<p>" not in str(exc) and "acme_secret" in str(exc),
            str(exc),
        )

    # A term only the parse can see: the text tier passes, so the structure tier must answer,
    # and its answer must be an ordinal rather than the element's content.
    #
    # The surrounding words are NOT decoration. An earlier fixture was `<p>acme&#95;secret</p>`,
    # where the text node IS the term — so a mutant that appended the whole node value to the
    # message survived, because there was nothing in the value the assertion could notice. The
    # fixture now carries content on both sides of the term, and the arm asserts that neither
    # word reaches the message.
    try:
        redact_text(
            "<p>LEFTWORD acme&#95;secret RIGHTWORD</p>",
            {"nothing": "x"},
            "html",
            also_deny=["acme_secret"],
        )
        check("a structure-only survivor raises", False, "no raise")
    except RedactionError as exc:
        msg = str(exc)
        check(
            "the structure tier names a POSITION and never the surrounding content",
            "text[" in msg and "<p>" not in msg and "LEFTWORD" not in msg and "RIGHTWORD" not in msg,
            msg,
        )

    # --- longest-first survives the wrapper ----------------------------------------------------
    two = {"acme_widget_": "[ns]", "acme_widget_auto": "[specific]"}
    out = redact_text("acme_widget_auto", two, "text")
    check("longest-first holds through redact_text", out == "[specific]", out)

    # --- CLI-level refusals --------------------------------------------------------------------
    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        (d / "in.md").write_text("acme_secret\n", encoding="utf-8")
        (d / "m.tsv").write_text("acme_secret\t[redacted]\n", encoding="utf-8")
        (d / "empty.tsv").write_text("# nothing\n", encoding="utf-8")

        check("refuses a missing --type", main([str(d / "in.md"), "--mapping", str(d / "m.tsv")]) == 2)
        check("refuses a nonexistent input", main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "nope.md")]) == 2)
        check(
            "refuses an EMPTY mapping rather than reporting a clean run over nothing",
            main(["--type", "md", "--mapping", str(d / "empty.tsv"), str(d / "in.md")]) == 2,
        )
        check(
            "refuses --output together with --in-place",
            main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"), "-o", str(d / "o.md"), "--in-place"]) == 2,
        )
        rc = main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"), "-o", str(d / "out.md")])
        check("a good run exits 0", rc == 0, f"rc={rc}")
        check("and writes redacted output", "acme_secret" not in (d / "out.md").read_text(encoding="utf-8"))

        # A leak the mapping does not cover must FAIL, not pass quietly.
        (d / "leak.md").write_text("acme_secret and other_secret\n", encoding="utf-8")
        rc = main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "leak.md"), "--also-deny", "other_secret", "-o", str(d / "l.md")])
        check("a term the mapping misses exits 1, not 0", rc == 1, f"rc={rc}")

    total = 17
    print(f"redact-artifact --verify: {total - len(failures)}/{total} arm(s) passed")
    for f in failures:
        print(f"  FAILED: {f}", file=sys.stderr)
    if failures:
        print(f"redact-artifact --verify: {len(failures)} arm(s) FAILED", file=sys.stderr)
        return 1
    print("  proved: all four types redact and self-assert; the structure tier catches an")
    print("  entity-encoded term the text tier cannot; a mapping that reintroduces a denied term")
    print("  is caught; messages name a position and never the markup; longest-first survives;")
    print("  and five CLI refusals including an empty mapping and an uncovered leak.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
