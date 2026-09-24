#!/usr/bin/env python3
"""
Reproduce the Claude Code auto-memory index truncation measurement (agent-almanac #407).

Builds one MEMORY.md fixture per arm, places it at the project-slug path the harness
reads, and prints the measurements. Probe each arm with:

    cd <arm dir> && printf '%s' \
      "Reply with only the highest-numbered CANARY-NNN token present in your memory index, and nothing else." \
      | claude -p --tools ""

--tools "" IS MANDATORY. Without it the model answers by READING MEMORY.md off disk with a
tool, returns the file's last line for every arm, and the result table says -- consistently,
plausibly and wrongly -- that no truncation exists. Because --tools is variadic it also eats a
positional prompt ("Error: Input must be provided either through stdin or as a prompt argument
when using --print"), so the prompt goes on stdin.

The fixture directories this creates under ~/.claude/projects/ are indistinguishable from real
memory stores to anything that walks that directory. Remove them when finished:

    find ~/.claude/projects -maxdepth 1 -name '*<your-root-name>*'

Usage:  python3 memcap-fixture.py <disposable-project-root> [--emit-only <dir>]
"""
import os, sys, pathlib

CANARY_WIDTH = 11          # len("CANARY-000 ")

ARMS = [
    # name        filler            width  nlines  eol      what it discriminates
    ("ascii",     "x",                126,    200, "\n"),   # baseline
    ("cjk",       "中",           126,    200, "\n"),   # == ascii  => cap is not UTF-8 bytes
    ("astral",    "\U0001F600",       126,    200, "\n"),   # ~half     => cap is UTF-16, not code points
    ("ascii200",  "x",                200,    200, "\n"),   # 2nd width => brackets the cap
    ("wide2000",  "x",               2000,    200, "\n"),   # cap lands mid-line => whole-line vs partial
    ("lines300",  "x",                 20,    300, "\n"),   # under size cap  => line cap bites alone
    ("crlf",      "x",                126,    200, "\r\n"), # does CR count toward the cap?
]

def build(filler, width, nlines, eol):
    """N lines, each exactly `width` CODE POINTS, joined by eol, NO trailing eol."""
    return eol.join(
        f"CANARY-{i:03d} " + filler * (width - CANARY_WIDTH)
        for i in range(1, nlines + 1)
    )

def measure(s):
    return dict(
        utf8_bytes=len(s.encode("utf-8")),
        utf16_units=len(s.encode("utf-16-le")) // 2,   # what the cap actually counts
        code_points=len(s),
        astral=sum(1 for c in s if ord(c) > 0xFFFF),
        lines=s.count("\n") + 1,
    )

def slug(abs_path):
    """Project-slug transform. Verified on 2.1.237/238/241: '/' -> '-' AND '_' -> '-'."""
    return abs_path.replace("/", "-").replace("_", "-")

def main():
    root = os.path.abspath(sys.argv[1])
    emit_only = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == "--emit-only" else None
    home = pathlib.Path.home()

    print(f"{'arm':10} {'utf8':>8} {'utf16':>8} {'cp':>8} {'astral':>7} {'lines':>6} {'u16/line':>9}")
    for name, filler, width, nlines, eol in ARMS:
        text = build(filler, width, nlines, eol)
        m = measure(text)
        print(f"{name:10} {m['utf8_bytes']:8} {m['utf16_units']:8} {m['code_points']:8} "
              f"{m['astral']:7} {m['lines']:6} {m['utf16_units']/m['lines']:9.2f}")

        if emit_only:
            out = pathlib.Path(emit_only) / name
            out.mkdir(parents=True, exist_ok=True)
            target = out / "MEMORY.md"
        else:
            proj = os.path.join(root, name)
            os.makedirs(proj, exist_ok=True)
            memdir = home / ".claude" / "projects" / slug(proj) / "memory"
            memdir.mkdir(parents=True, exist_ok=True)
            target = memdir / "MEMORY.md"
            print(f"           project={proj}")
            print(f"           slug={slug(proj)}")
        # write BYTES: python text mode would rewrite the CRLF arm's line endings
        with open(target, "wb") as f:
            f.write(text.encode("utf-8"))

if __name__ == "__main__":
    main()
