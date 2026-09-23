#!/usr/bin/env python3
"""redact-artifact.py — apply an ordered redaction mapping to one artifact, then assert the result.

WHAT THIS REPLACES
------------------
Three skills specified `tools/enforce-redaction-gate.sh`: one scanner, run over a published tree,
answering "is this clean?". It was never written, and `tools/redaction-lib.py`'s header records
why a deny-list of INTERNAL IDENTIFIERS cannot be shipped publicly — its power is a corpus, and
such a corpus is private by definition. Note the scope of that claim: the CREDENTIAL-SHAPE class
is decidable corpus-free and is `tools/check-redaction.sh`'s job, not this tool's.

This tool is the other shape. It does not audit a tree. It transforms ONE artifact with a mapping
its caller supplies and then refuses to hand back output in which any term survives. The gate is
a post-condition on its own work, which is decidable without a corpus of its own.

THE TWO TIERS, AND EXACTLY WHERE THE SECOND ONE ADDS ANYTHING
-------------------------------------------------------------
  tier 1  substitution   longest-source-first over the whole text (redaction-lib.apply_mapping)
  tier 2  assertion      no term survives — over the whole text, and then over each position
                         as a PARSER DECODES IT

Tier 2's second half only earns its place where decoding can reveal a term the raw bytes do not
contain. An earlier version ran it for all four types and claimed "both tiers earn their place";
a review measured that every position value for `md`, `mermaid` and `text` was a substring of the
text already checked, so the branch could not report anything and five mutants deleting it left
the self-test at a green 17/17. `DECODING_TYPES` below is now the honest list, it is asserted
against behaviour by a self-test arm, and the run line says which tier actually looked.

  html      charrefs decoded, attribute values unescaped, comments read, adjacent text joined
  mermaid   `#NN;` numeric codes decoded (mermaid renders `#95;` as `_`)
  md, text  nothing decodes; the structure tier is a no-op and says so rather than pretending

WHAT IT CANNOT DO, STATED SO NOBODY RELIES ON IT
-----------------------------------------------
It cannot find what its caller did not name — there is no built-in deny-list and there will not
be. It matches by exact substring, so a term in a different case, base64-encoded, Unicode-
normalised differently, carrying a zero-width character, or split by a line break is NOT found;
`redaction-lib.assert_clean`'s docstring lists these and they are measured. `--also-deny` takes
extra terms to assert without substituting, which is how a caller covers encodings it knows.

Usage:
    python3 tools/redact-artifact.py --type md --mapping map.tsv IN.md -o OUT.md
    python3 tools/redact-artifact.py --type html --mapping map.json IN.html --in-place
    python3 tools/redact-artifact.py --type html --assert-only --mapping map.tsv RENDERED.svg
    python3 tools/redact-artifact.py --verify
"""

from __future__ import annotations

import argparse
import re
import sys
from bisect import bisect_right
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

# `redaction-lib.py` carries a hyphen, so it is not importable by name; load it by path.
#
# `dont_write_bytecode` first, because importing by path otherwise creates `tools/__pycache__`,
# and `check:tools-registry` refuses any non-plain-file under `tools/` — so the tool would break
# a gate merely by running. Measured, and the boundary is worth knowing:
#
#   run as a script (`python3 tools/redact-artifact.py …`)   no cache written — normal use is safe
#   IMPORTED by path from another process                    cache IS written, gate then fails
#   same import with PYTHONDONTWRITEBYTECODE=1               no cache
#
# The line below cannot prevent the second case: Python decides whether to cache THIS file before
# this file's body runs. If you import this module rather than running it, set
# PYTHONDONTWRITEBYTECODE=1 in the environment. (`tools/__pycache__` is gitignored, but
# `check-tools-registry` walks the filesystem rather than asking git, so an ignored artefact
# still reddens a required gate — filed separately.)
sys.dont_write_bytecode = True
import importlib.util as _ilu

_spec = _ilu.spec_from_file_location(
    "redaction_lib", Path(__file__).resolve().parent / "redaction-lib.py"
)
_rl = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_rl)

RedactionError = _rl.RedactionError


class UnmeasurableError(Exception):
    """The tool declined to measure — NOT a finding, and never exit 1.

    Every published Expected block in the skills that call this tool defines 1 as "a listed term
    survived", and `redact-wire-capture` Step 4 branches on it with `capture still leaks at $f`.
    So a document the structure tier could not examine, reported as 1, tells an operator their
    capture leaks when nothing of the sort was established. This file already applies that
    reasoning to an unreadable file and an unwritable target; the structure-tier refusal raised
    `RedactionError` and inherited exit 1 with it.
    """
load_mapping = _rl.load_mapping
apply_mapping = _rl.apply_mapping
assert_clean = _rl.assert_clean

TYPES = ("md", "html", "mermaid", "text")
# The types whose structure tier can see something the whole-text tier cannot. Asserted against
# behaviour by a self-test arm, so this cannot quietly become a lie.
DECODING_TYPES = ("html", "mermaid")


class _Positions(HTMLParser):
    """Collect (position-label, decoded-value) for every place an HTML leak would matter.

    WHAT IT CAN DECIDE FROM MARKUP, AND WHAT IT CANNOT. Whether two pieces of text render as one
    word is a CSS question (`display`), and this tool never sees the stylesheet. So it does not
    claim a renderer's rule. It does this:

      - an inline tag does not break a run: `acme_sec<b></b>ret` is one `text[N]` position
      - a COMMENT does not break a run either: `acme_<!-- c -->secret` is one position too. An
        earlier version flushed on it, which re-opened the exact hole that joining runs had just
        closed (measured CLEAN while the tag form raised)
      - a BLOCK-level tag starts a new run, so `text[N]` never spans one. A term split ACROSS a
        block boundary is still reported, under its own label `text-across-block[N]`, and it
        fails the run like any other survivor (#870). `<div style="display:inline">` renders its
        halves as one word, so dropping the join — which an earlier version did, on all 37
        BLOCK tags — was a false CLEAN. The label tells the operator it is the lower-confidence
        kind: two table cells that really do render apart also raise it.

    `<br>` and `<hr>` are in BLOCK, but in SVG they are not rendered elements at all, so
    `<text>acme_<br/>secret</text>` may render as one identifier. That is inferred from SVG
    semantics and NOT measured against a renderer; either way it now raises, under
    `text-across-block`.
    """

    # Block-level elements. Membership decides only WHICH label a split term gets — `text[N]` or
    # `text-across-block[N]` — not whether it is reported, so an omission here costs a label, not
    # a leak.
    BLOCK = frozenset(
        "address article aside blockquote br dd div dl dt fieldset figcaption figure footer "
        "form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table tbody td tfoot th "
        "thead tr ul".split()
    )

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.found: list[tuple[str, str]] = []
        self._n = 0
        self._run: list[str] = []
        self._run_start = 0
        # Every run, whitespace-only ones included, in document order. Consecutive runs are
        # separated by a block boundary and nothing else, which is what `across_block` joins.
        self._runs: list[tuple[int, str]] = []
        # Handler calls, counted apart from `_n`, which numbers positions and skips end tags.
        self._events = 0
        self.dropped = False

    def _flush(self) -> None:
        if self._run:
            joined = "".join(self._run)
            self._runs.append((self._run_start, joined))
            if joined.strip():
                self.found.append((f"text[{self._run_start}]", joined))
            self._run = []

    def handle_data(self, data: str) -> None:
        self._events += 1
        self._n += 1
        if not self._run:
            self._run_start = self._n
        self._run.append(data)

    def handle_comment(self, data: str) -> None:
        # No flush: a comment is invisible to a renderer, so the text around it is one run.
        # `convert_charrefs` does not reach inside a comment, hence the explicit unescape.
        self._events += 1
        self._n += 1
        if data.strip():
            self.found.append((f"comment[{self._n}]", unescape(data)))

    # A declaration or processing instruction is counted — it is an event, and it keeps every
    # later label's ordinal where it was — but yields no position. Neither is ever unescaped, so
    # its value was always a substring of the text the whole-text tier had already checked: it
    # inflated `N decoded position(s)` and could report nothing (#870, low-priority item).
    def handle_decl(self, decl: str) -> None:
        self._events += 1
        self._n += 1

    def handle_pi(self, data: str) -> None:
        self._events += 1
        self._n += 1

    def unknown_decl(self, data: str) -> None:
        # A CDATA section arrives here. Like a decl it is never unescaped, so it yields no
        # position; it is still an event, so `close()` emitting an unclosed one is not read as a
        # drop. Uncounted, `<![CDATA[x` refused at exit 2 while `<![CDATA[x]]>` passed (#870).
        # `_n` is left alone, so no label after a CDATA section moves.
        self._events += 1

    def handle_starttag(self, tag: str, attrs) -> None:
        self._events += 1
        if tag in self.BLOCK:
            self._flush()
        for name, value in attrs:
            self._n += 1
            if value:
                # The ordinal is document-wide. A per-tag counter gave every first attribute
                # `attr:href[0]`, so two leaks shared one label.
                self.found.append((f"attr:{name}[{self._n}]", value))

    def handle_endtag(self, tag: str) -> None:
        self._events += 1
        if tag in self.BLOCK:
            self._flush()

    handle_startendtag = handle_starttag

    def close(self) -> None:  # noqa: D102
        # Whether the parser DROPPED input no handler ever saw. What `feed()` could not tokenise
        # is left in `rawdata`. An unconsumed tail alone proves nothing: `AT&T` leaves one, a
        # charref held back in case more input completes it, and `close()` emits it. What marks
        # content lost is a tail for which `close()` calls none of this class's handlers. An
        # unterminated attribute quote swallows the rest of the document that way, and so does an
        # unterminated start or end tag, while an unclosed comment, decl, PI, CDATA section or
        # script is emitted and examined (measured on 3.12.3, #870). "This class's handlers" is
        # load-bearing: CDATA reads as a drop unless `unknown_decl` is counted. A parser that
        # parsed nothing until `close()` would leave no tail here and pass a stall; the
        # self-test's stall arms are what would say so.
        tail = self.rawdata
        before = self._events
        super().close()
        self.dropped = bool(tail) and self._events == before
        self._flush()

    def across_block(self, terms) -> list[str]:
        """Labels for a term found only by joining runs across a block boundary.

        An occurrence wholly inside one run is `text[N]`'s and is not repeated here. Each label
        names the run the occurrence starts in, and never the text around it.
        """
        joined = "".join(run for _, run in self._runs)
        offsets, at = [], 0
        for _, run in self._runs:
            offsets.append(at)
            at += len(run)
        hits: list[str] = []
        for t in terms:
            if not t:
                continue
            i = joined.find(t)
            while i >= 0:
                k = bisect_right(offsets, i) - 1
                if i + len(t) > offsets[k] + len(self._runs[k][1]):
                    label = f"text-across-block[{self._runs[k][0]}]:{t}"
                    if label not in hits:
                        hits.append(label)
                i = joined.find(t, i + 1)
        return hits


_MERMAID_NUMERIC = re.compile(r"#(\d{1,6});")


def _mermaid_decode(s: str) -> str:
    """Mermaid renders `#95;` as `_`, so a diagram can carry an identifier the bytes do not."""
    return _MERMAID_NUMERIC.sub(lambda m: chr(int(m.group(1))), s)


def _parse_html(text: str) -> _Positions:
    """One feed, then close. `_Positions.close` reads the tail `feed` left, so feed only once."""
    p = _Positions()
    p.feed(text)
    p.close()
    return p


def positions(text: str, kind: str) -> list[tuple[str, str]]:
    """Meaningful positions for `kind`, with each value DECODED as a renderer would see it.

    For a type in `DECODING_TYPES` this can reveal a term the raw text does not contain. For any
    other type it returns `[]` — deliberately, because yielding substrings of text the whole-text
    tier already checked is a branch that cannot report anything, which is what made an earlier
    version's structure tier dead for three of four types.
    """
    if kind == "html":
        return _parse_html(text).found
    if kind == "mermaid":
        out: list[tuple[str, str]] = []
        # Whole lines rather than a bracket regex: an earlier version matched only `[Label]`-style
        # node text, so ids, `-->|edge labels|`, `subgraph Title`, `%%` comments and any label
        # spanning a line break yielded nothing. A line is the unit a reader can locate, and
        # decoding is what makes the tier additive at all.
        for i, line in enumerate(text.splitlines(), 1):
            decoded = _mermaid_decode(line)
            if decoded.strip():
                out.append((f"line[{i}]", decoded))
        # The whole decoded document as one more position. NOT for soft-wrapped identifiers — a
        # term containing a newline is not found by any position including this one, which the
        # exact-substring arm asserts. What it is for: a DENY TERM that itself spans lines, and a
        # term straddling two lines' decoded boundary that no single line contains.
        out.append(("document", _mermaid_decode(text)))
        return out
    return []


def structure_survivors(text: str, terms, kind: str) -> list[str]:
    """Position labels at which some term survives. Never returns the term's surroundings."""
    hits = []
    for label, value in positions(text, kind):
        # EVERY term at this position, not the first — `redaction-lib` documents that promise and
        # an earlier `break` here quietly broke it.
        for t in terms:
            if t and t in value:
                hits.append(f"{label}:{t}")
    if kind == "html":
        hits.extend(_parse_html(text).across_block(terms))
    return hits


def redact_text(text: str, table: dict[str, str], kind: str, also_deny=(), assert_only=False):
    """Tier 1 (unless `assert_only`) then tier 2. Raises rather than returning unverified output.

    Returns `(output, stats)`. `assert_only` skips substitution and asserts the mapping's KEYS,
    which is what a caller wants for an artifact some other tool produced — a rendered image, say.
    Passing `--mapping` without it substitutes first, so a term the renderer reintroduced is
    rewritten before the assertion looks and the check cannot fail for its own case.
    """
    out = text if assert_only else apply_mapping(text, table)
    terms = list(table.keys()) + [t for t in also_deny if t]
    assert_clean(out, terms, "whole-text")
    if kind == "html" and _parse_html(out).dropped:
        # Malformed markup (an unterminated attribute quote) makes HTMLParser drop the rest of the
        # document unexamined, and a clean result over the part it did see would read as a pass.
        # Keyed on the drop itself, not on an empty position list: `<div></div>` yields no
        # positions and is well-formed, while text AHEAD of a drop yields some and hid it (#870).
        # Only html can reach this: mermaid is read line by line and drops nothing.
        raise UnmeasurableError(
            "--type html: the parser dropped input it could not tokenise (an unterminated "
            "attribute quote or tag, say), so the structure tier did not examine all of it. "
            "This is COULD-NOT-MEASURE (exit 2), not a finding (exit 1)."
        )
    survivors = structure_survivors(out, terms, kind)
    if survivors:
        raise RedactionError(f"structure: term(s) survive at {', '.join(survivors)}")
    matched = sum(1 for src in table if src in text)
    return out, {
        "mappings": len(table),
        "matched": matched,
        "changed": len(text) != len(out) or text != out,
        "positions": len(positions(out, kind)),
        "structure_tier": kind in DECODING_TYPES,
    }


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0], add_help=True)
    ap.add_argument("input", nargs="?", help="artifact to redact")
    ap.add_argument("-o", "--output", help="write here (default: stdout)")
    ap.add_argument("--in-place", action="store_true", help="overwrite the input")
    ap.add_argument("--type", choices=TYPES, help="artifact type (required unless --verify)")
    ap.add_argument("--mapping", help="ordered mapping file (.json or TSV)")
    ap.add_argument(
        "--assert-only",
        action="store_true",
        help="do not substitute; assert the mapping's keys are absent (for an artifact another "
        "tool produced, such as a rendered image)",
    )
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

    missing = [
        n for n, v in (("input", args.input), ("--type", args.type), ("--mapping", args.mapping)) if not v
    ]
    if missing:
        print(f"REFUSED: missing {', '.join(missing)}", file=sys.stderr)
        return 2
    if args.output and args.in_place:
        print("REFUSED: --output and --in-place are mutually exclusive", file=sys.stderr)
        return 2
    if args.assert_only and (args.output or args.in_place):
        # A flag documented as "do not substitute" writing a byte-verbatim copy of its input
        # invites `--assert-only -o publish/x` as a publishing step. The exit code is the result.
        print("REFUSED: --assert-only writes nothing; drop --output/--in-place", file=sys.stderr)
        return 2
    if any(t == "" for t in args.also_deny):
        # `--also-deny "$VAR"` with VAR unset expands to an empty argument. Dropping it silently
        # meant the highest-value secret in a published recipe went unasserted while the run
        # reported success — measured, and the most common shell error there is.
        print(
            "REFUSED: an empty --also-deny value (an unset shell variable?) — "
            "it would be asserted against nothing",
            file=sys.stderr,
        )
        return 2

    src = Path(args.input)
    try:
        # `newline=""` keeps CRLF intact: read_text/write_text otherwise normalise line endings
        # across the whole file and the summary attributes that byte change to the mapping.
        # `Path.read_text(newline=)` is 3.13+, so use open() — this must work on older Pythons.
        # The READ side is pinned by an arm. The WRITE side cannot be: dropping `newline=""` there
        # is a no-op on Linux (`os.linesep` is "\n") and corrupts `\r\n` into `\r\r\n` only on
        # Windows, so a mutant survives here for platform reasons rather than missing coverage.
        with open(src, encoding="utf-8", newline="") as fh:
            text = fh.read()
    except (OSError, UnicodeDecodeError) as exc:
        # Exit 2, not 1. Callers branch on 1 meaning "a term survived"; a permission error or a
        # non-UTF-8 file reported as 1 tells an operator their capture leaks when it does not.
        print(f"REFUSED: cannot read {src}: {exc}", file=sys.stderr)
        return 2

    try:
        table = load_mapping(args.mapping)
    except (OSError, RedactionError, ValueError) as exc:
        print(f"REFUSED: mapping: {exc}", file=sys.stderr)
        return 2
    if not table and not args.also_deny:
        print("REFUSED: the mapping is empty and no --also-deny term was given", file=sys.stderr)
        return 2

    try:
        out, stats = redact_text(text, table, args.type, args.also_deny, args.assert_only)
    except UnmeasurableError as exc:
        # Ordered before RedactionError deliberately: if UnmeasurableError ever subclasses it,
        # this arm must still win. 2 is could-not-run, which is what the caller must branch on.
        print(f"REFUSED: {exc}", file=sys.stderr)
        return 2
    except RedactionError as exc:
        print(f"FAILED: {exc}", file=sys.stderr)
        return 1

    try:
        if args.in_place:
            with open(src, "w", encoding="utf-8", newline="") as fh:
                fh.write(out)
            dest = str(src)
        elif args.output:
            with open(args.output, "w", encoding="utf-8", newline="") as fh:
                fh.write(out)
            dest = args.output
        elif args.assert_only:
            # Nothing is written at all — in CI, dumping the artifact to stdout puts it in the log.
            dest = "(nothing written; --assert-only)"
        else:
            sys.stdout.write(out)
            dest = "-"
    except OSError as exc:
        print(f"REFUSED: cannot write: {exc}", file=sys.stderr)
        return 2

    if args.assert_only:
        print(
            f"redact-artifact: {src} — assert-only: "
            f"{stats['mappings']} mapping key(s) + {len(args.also_deny)} --also-deny term(s) "
            f"asserted, none present",
            file=sys.stderr,
        )
        return 0
    tier = (
        f"{stats['positions']} decoded position(s)"
        if stats["structure_tier"]
        else f"no structure tier for --type {args.type} (nothing decodes)"
    )
    # The matched count is the difference between "redacted" and "did nothing". A mistyped mapping
    # key produces a clean exit over byte-identical output, and only this line shows it.
    print(
        f"redact-artifact: {src} -> {dest} — "
        f"{stats['matched']} of {stats['mappings']} mapping(s) matched, "
        f"{'output changed' if stats['changed'] else 'OUTPUT UNCHANGED'}, {tier}, 0 survivor(s)",
        file=sys.stderr,
    )
    return 0


def _verify() -> int:
    import tempfile

    failures: list[str] = []
    ran: list[str] = []

    def check(name: str, cond: bool, detail: str = "") -> None:
        # Derived, never a literal: an earlier version printed `total = 17` while 16 arms ran, and
        # deleting arms left the output byte-identical.
        ran.append(name)
        if not cond:
            failures.append(f"{name}{': ' + detail if detail else ''}")

    tbl = {"acme_secret": "[redacted]"}

    for kind, sample in (
        ("text", "plain acme_secret here"),
        ("md", "# t\n\nprose acme_secret\n"),
        ("html", "<p>acme_secret</p>"),
        ("mermaid", "graph TD\n  a[acme_secret]\n"),
    ):
        try:
            out, _ = redact_text(sample, tbl, kind)
            check(f"{kind}: redacts and passes its own assertion", "acme_secret" not in out, out)
        except (RedactionError, UnmeasurableError) as exc:
            # Both, because UnmeasurableError is not a RedactionError: a refusal here used to
            # escape as a traceback, which a mutation run scores as a kill with no arm named (#870).
            check(f"{kind}: redacts and passes its own assertion", False, str(exc))

    # --- the structure tier must be ADDITIVE exactly where DECODING_TYPES says ----------------
    # An earlier version of this arm computed `additive`, asserted `yields` instead, and then
    # `del additive`d it — the trace of an assertion that was written and never wired. It passed
    # a mutant that declared `md` additive while giving it round-1's substring-only positions,
    # which is precisely the defect DECODING_TYPES exists to make impossible. Non-emptiness is
    # what the DEAD tier already had; ADDITIVITY is the property.
    #
    # The fixtures must therefore contain something that decodes. `<p>x</p>` does not, which is
    # why the old arm could not have demonstrated the property whatever it asserted.
    DECODING_FIXTURES = {
        "html": "<p>&#95;</p>",
        "mermaid": "graph TD\n  a[#95;]\n",
        "md": "# &#95;\n",
        "text": "&#95;",
    }
    for kind in TYPES:
        sample = DECODING_FIXTURES[kind]
        pos = positions(sample, kind)
        # Additive = at least one position value is NOT a substring of the input. That is the only
        # thing a structure tier can contribute that the whole-text tier has not already done.
        additive = any(v not in sample for _, v in pos)
        if kind in DECODING_TYPES:
            check(
                f"{kind}: in DECODING_TYPES, so positions() is ADDITIVE — some value is not a "
                f"substring of the input",
                additive,
                f"positions={pos!r} over {sample!r}",
            )
        else:
            check(
                f"{kind}: not in DECODING_TYPES, so positions() yields nothing rather than "
                f"substrings the whole-text tier already checked",
                not pos,
                f"yielded {pos!r}",
            )

    # --- each decoding case, measured as a false CLEAN before it was fixed ---------------------
    for name, doc, kind in (
        ("an entity-encoded term in a text node", "<p>acme&#95;secret</p>", "html"),
        ("a term inside an HTML COMMENT", "<!-- acme&#95;secret --><p>hi</p>", "html"),
        ("a term split by an empty tag", "<p>acme&#95;sec<b></b>ret</p>", "html"),
        ("a term in an ATTRIBUTE value", '<div data-id="acme&#95;secret">x</div>', "html"),
        ("a mermaid #NN; numeric code", 'graph TD\n  a["acme#95;secret"]\n', "mermaid"),
        ("a mermaid EDGE label", "graph TD\n  a -->|acme_secret| b\n", "mermaid"),
    ):
        try:
            redact_text(doc, {"never-present": "x"}, kind, also_deny=["acme_secret"])
            got = "no raise"
            ok = False
        except (RedactionError, UnmeasurableError) as exc:
            got = str(exc)
            ok = "structure:" in got or "whole-text" in got
        check(f"caught: {name}", ok, got)

    split = 'graph TD\n  a["acme_\n  secret"]\n'
    try:
        redact_text(split, {"never-present": "x"}, "mermaid", also_deny=["acme_secret"])
        check(
            "a term SPLIT BY A LINE BREAK is not found — the documented exact-substring limit",
            True,
        )
    except RedactionError as exc:
        check(
            "a term SPLIT BY A LINE BREAK is not found — the documented exact-substring limit",
            False,
            f"it now detects it, so the header's disclosure is stale: {exc}",
        )

    # --- a comment does NOT break a text run; a BLOCK boundary starts a new one ---------------
    # The first is a regression arm: an earlier fix flushed the run on a comment, which re-opened
    # the split-text hole it had just closed. A renderer drops the comment and shows one word.
    def survivors_of(doc: str) -> str:
        try:
            redact_text(doc, {"never": "x"}, "html", also_deny=["acme_secret"])
            return ""
        except (RedactionError, UnmeasurableError) as exc:
            return str(exc)

    for doc, want, why in (
        ("<p>acme_<!-- c -->secret</p>", "text[", "a COMMENT does not interrupt rendered text"),
        ("<p>acme_<?php ?>secret</p>", "text[", "a processing instruction does not either"),
        ("<p>acme_<b></b>secret</p>", "text[", "nor does an inline tag"),
        ("<span>acme_</span><span>secret</span>", "text[", "two SPANs are one run (control)"),
        # Until #870 the four below were a silent CLEAN: the run was flushed on the BLOCK tag and
        # the join dropped, while an inline display renders the halves as one word. The table
        # cell arm asserted the opposite, calling the join an unactionable false positive; it is
        # now reported, under a label that says which kind of hit it is.
        ('<div style="display:inline">acme_</div><div style="display:inline">secret</div>',
         "text-across-block[", "inline-styled DIVs are joined, under their own label"),
        ('<div style="display:inline">acme&#95;</div><div style="display:inline">secret</div>',
         "text-across-block[", "...and in the entity-encoded form only tier 2 can see"),
        ('<p class="inline">acme_</p><p class="inline">secret</p>',
         "text-across-block[", "class-driven inline Ps (the CSS is in a stylesheet)"),
        ("<table><tr><td>acme_</td><td>secret</td></tr></table>",
         "text-across-block[", "table cells, which a renderer separates, still raise: fail-closed"),
    ):
        got = survivors_of(doc)
        check(f"text runs: {why}", got.startswith("structure:") and want in got,
              f"wanted a {want}…] survivor, got {got or 'no raise'!r}")

    # Across-block is only for what no single run holds, so one leak gets one label.
    one_run = survivors_of("<div>acme&#95;secret</div><div>x</div>")
    check("a term inside ONE run is text[N] only, not also text-across-block",
          "text[" in one_run and "text-across-block" not in one_run, one_run or "no raise")

    # The join keeps whitespace-only runs. Between two blocks, whitespace renders as a space or
    # a line break, never as nothing, so dropping it would join what no renderer joins.
    spaced = survivors_of("<div>acme_</div>\n<div>secret</div>")
    check("whitespace between two blocks stays in the join, so it does not raise", spaced == "", spaced)

    # The label names the run the occurrence STARTS in (the docstring's promise), and one run
    # gets one label however many occurrences start there.
    hits = structure_survivors("<div>x</div><div>acme_</div><div>secret</div>", ["acme_secret"], "html")
    check("a text-across-block label names the run the term starts in",
          hits == ["text-across-block[2]:acme_secret"], str(hits))
    hits = structure_survivors("<div>xaba</div><div>bab</div>", ["abab"], "html")
    check("two occurrences starting in one run give one label", hits == ["text-across-block[1]:abab"],
          str(hits))

    # --- malformed markup cannot report a pass, and well-formed markup is not refused ---------
    # The refusal used to key on an EMPTY position list, which is true of valid markup with no
    # text (9 of 12 such documents refused, #870) and false once any text precedes the stall
    # (those passed at exit 0 with the stalled tail unexamined). It now keys on input the parser
    # DROPPED.
    def refused(doc: str) -> bool:
        try:
            redact_text(doc, {"never": "x"}, "html")
            return False
        except UnmeasurableError:
            return True
        except RedactionError:
            return False

    for name, doc in (
        ("an empty div", "<div></div>"),
        ("a lone br", "<br/>"),
        ("a lone hr", "<hr>"),
        ("an img with no attributes", "<img>"),
        ("an empty paragraph", "<p></p>"),
        ("an SVG of shape elements with no attributes", "<svg><rect/><circle/></svg>"),
        ("an empty table", "<table></table>"),
        ("an empty list", "<ul></ul>"),
        ("empty nested elements", "<div><span><b></b></span></div>"),
        ("empty input", ""),
        ("whitespace-only input", "  \n\t "),
        ("text whose tail is a held-back charref, AT&T", "AT&T"),
        ("text ending in a lone <", "x <"),
        ("an unclosed comment, which close() emits", "<p>x</p><!-- never closed"),
        ("an unclosed CDATA section, which close() emits to unknown_decl", "<svg><text><![CDATA[x"),
    ):
        check(f"well-formed or examined markup is NOT refused: {name}", not refused(doc), repr(doc))

    stall = '<text data-id="acme&#95;secret>x</text>'
    for name, prefix in (
        ("nothing before it", ""),
        ("a paragraph of text", "<p>ok</p>"),
        ("bare text", "x"),
        ("an element with an attribute", '<a href="y"></a>'),
        ("a comment", "<!-- c -->"),
        ("a doctype", "<!DOCTYPE html>"),
    ):
        check(f"a dropped tail REFUSES whatever precedes it: {name}", refused(prefix + stall),
              repr(prefix + stall))
    try:
        redact_text('<text data-id="acme&#95;secret>x</text>', {"never": "x"}, "html")
        check("markup the tier cannot examine REFUSES rather than reporting 0 positions as clean",
              False, "no raise")
    except UnmeasurableError as exc:
        check(
            "markup the tier cannot examine raises UnmeasurableError, NOT RedactionError — the "
            "two map to different exit codes and callers branch on the difference",
            "COULD-NOT-MEASURE" in str(exc),
            str(exc),
        )
    except RedactionError as exc:
        check(
            "markup the tier cannot examine raises UnmeasurableError, NOT RedactionError — the "
            "two map to different exit codes and callers branch on the difference",
            False,
            f"raised RedactionError, which main() maps to exit 1: {exc}",
        )

    # The mermaid `document` position, pinned. Round 2 refuted its first justification; the
    # rewritten one is true and was unpinned — a mutant removing the position survived at 45/45.
    # A deny term that itself spans lines is found by no `line[]` position and by no raw-text
    # search, because the term only exists once `#95;` has been decoded.
    spanning = "graph TD\n  a[#95;end]\n  b[start#95;]\n"
    deny = "_end]\n  b[start_"
    in_lines = any(deny in v for lab, v in positions(spanning, "mermaid") if lab.startswith("line["))
    in_doc = any(deny in v for lab, v in positions(spanning, "mermaid") if lab == "document")
    check("the mermaid `document` position finds a deny term no line[] position can",
          in_doc and not in_lines and deny not in spanning,
          f"in_doc={in_doc} in_lines={in_lines} in_raw={deny in spanning}")

    # --- the structure tier reports EVERY term at a position, not the first --------------------
    # `redaction-lib` documents that promise; a `break` here silently broke it and nothing caught
    # the restoration.
    hits = structure_survivors("<p>alpha beta</p>", ["alpha", "beta"], "html")
    check("structure_survivors reports every term at a position, not the first", len(hits) == 2, str(hits))

    # --- messages never carry the surrounding content ------------------------------------------
    try:
        redact_text("<p>acme_secret</p>", {"nothing": "x"}, "html", also_deny=["acme_secret"])
        check("a whole-text survivor raises", False, "no raise")
    except (RedactionError, UnmeasurableError) as exc:
        check(
            "the whole-text tier names the term and never the surrounding markup",
            "<p>" not in str(exc) and "acme_secret" in str(exc),
            str(exc),
        )

    try:
        redact_text(
            "<p>LEFTWORD acme&#95;secret RIGHTWORD</p>", {"nothing": "x"}, "html",
            also_deny=["acme_secret"],
        )
        check("a structure-only survivor raises", False, "no raise")
    except (RedactionError, UnmeasurableError) as exc:
        msg = str(exc)
        check(
            "the structure tier names a POSITION and never the surrounding content",
            "text[" in msg and "<p>" not in msg and "LEFTWORD" not in msg and "RIGHTWORD" not in msg,
            msg,
        )

    # --- attribute ordinals are per-DOCUMENT, so two leaks get two labels ----------------------
    labels = [lab for lab, _ in positions('<a href="one"></a><a href="two"></a>', "html") if lab.startswith("attr:")]
    check("attribute ordinals are document-wide, not per-tag", len(set(labels)) == 2, str(labels))

    # --- --assert-only does not substitute ------------------------------------------------------
    try:
        redact_text("a rendered acme_secret", tbl, "text", assert_only=True)
        check("--assert-only does NOT substitute its way to a pass", False, "no raise")
    except RedactionError as exc:
        check("--assert-only does NOT substitute its way to a pass", "acme_secret" in str(exc), str(exc))
    out, _ = redact_text("a rendered acme_secret", tbl, "text")
    check("...while the substituting form legitimately passes on the same input", "acme_secret" not in out)

    try:
        redact_text("alpha", {"alpha": "beta_internal"}, "text", also_deny=["beta_internal"])
        check("a mapping that reintroduces a denied term is caught", False, "no raise")
    except RedactionError as exc:
        check("a mapping that reintroduces a denied term is caught", "whole-text" in str(exc), str(exc))

    two = {"acme_widget_": "[ns]", "acme_widget_auto": "[specific]"}
    out, _ = redact_text("acme_widget_auto", two, "text")
    check("longest-first holds through redact_text", out == "[specific]", out)

    # --- CLI refusals and reporting -------------------------------------------------------------
    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        (d / "in.md").write_text("acme_secret\n", encoding="utf-8")
        (d / "m.tsv").write_text("acme_secret\t[redacted]\n", encoding="utf-8")
        (d / "empty.tsv").write_text("# nothing\n", encoding="utf-8")
        (d / "typo.tsv").write_text("acme_secert\t[redacted]\n", encoding="utf-8")
        (d / "bin.md").write_bytes(b"\xff\xfe\x00bad")

        check("refuses a missing --type", main([str(d / "in.md"), "--mapping", str(d / "m.tsv")]) == 2)
        check("refuses a nonexistent input with 2, not 1",
              main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "nope.md")]) == 2)
        check("refuses a NON-UTF-8 input with 2, not a traceback at 1",
              main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "bin.md")]) == 2)
        check("refuses an EMPTY mapping rather than reporting a clean run over nothing",
              main(["--type", "md", "--mapping", str(d / "empty.tsv"), str(d / "in.md")]) == 2)
        check("refuses --output together with --in-place",
              main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"),
                    "-o", str(d / "o.md"), "--in-place"]) == 2)
        check("refuses an EMPTY --also-deny (an unset shell variable)",
              main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"),
                    "--also-deny", "", "-o", str(d / "o2.md")]) == 2)
        check("refuses a write it cannot perform with 2, not a traceback",
              main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"), "-o", str(d)]) == 2)

        rc = main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "in.md"), "-o", str(d / "out.md")])
        check("a good run exits 0", rc == 0, f"rc={rc}")
        check("and writes redacted output", "acme_secret" not in (d / "out.md").read_text(encoding="utf-8"))

        # A mistyped mapping key: legal, but the summary must not read as a successful redaction.
        _, stats = redact_text("the real secret is acme_secret", load_mapping(d / "typo.tsv"), "md",
                               also_deny=[])
        check("a mistyped mapping key reports 0 matched, so the run cannot read as a redaction",
              stats["matched"] == 0 and not stats["changed"], str(stats))
        # The positive half: without it, `matched` hardwired to 0 passes the arm above.
        _, hit_stats = redact_text("the real secret is acme_secret", load_mapping(d / "m.tsv"), "md")
        check("a mapping key that MATCHES reports 1 matched and a changed output",
              hit_stats["matched"] == 1 and hit_stats["changed"], str(hit_stats))

        check("--assert-only refuses --output (it writes nothing by design)",
              main(["--type", "md", "--assert-only", "--mapping", str(d / "m.tsv"),
                    str(d / "in.md"), "-o", str(d / "ao.md")]) == 2)
        check("--assert-only refuses --in-place",
              main(["--type", "md", "--assert-only", "--mapping", str(d / "m.tsv"),
                    str(d / "in.md"), "--in-place"]) == 2)
        check("--assert-only writes no file at all",
              not (d / "ao.md").exists())

        crlf = d / "crlf.md"
        crlf.write_bytes(b"line one\r\nacme_secret\r\n")
        main(["--type", "md", "--mapping", str(d / "m.tsv"), str(crlf), "--in-place"])
        check("--in-place preserves CRLF rather than silently normalising the whole file",
              crlf.read_bytes() == b"line one\r\n[redacted]\r\n", repr(crlf.read_bytes()))

        (d / "leak.md").write_text("acme_secret and other_secret\n", encoding="utf-8")
        rc = main(["--type", "md", "--mapping", str(d / "m.tsv"), str(d / "leak.md"),
                   "--also-deny", "other_secret", "-o", str(d / "l.md")])
        check("a term the mapping misses exits 1, not 0", rc == 1, f"rc={rc}")
        check("and on a FAILED run nothing is written", not (d / "l.md").exists())

    total = len(ran)
    if len(set(ran)) != total:
        dupes = sorted({n for n in ran if ran.count(n) > 1})
        print(f"redact-artifact --verify: REFUSED, duplicate arm name(s): {dupes}", file=sys.stderr)
        return 1
    print(f"redact-artifact --verify: {total - len(failures)}/{total} arm(s) passed")
    for f in failures:
        print(f"  FAILED: {f}", file=sys.stderr)
    if failures:
        print(f"redact-artifact --verify: {len(failures)} arm(s) FAILED", file=sys.stderr)
        return 1
    print("  proved, by name — this list is the arms that RAN, not prose about them:")
    for name in ran:
        print(f"    - {name}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
