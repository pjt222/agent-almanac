#!/usr/bin/env python3
"""
F2: is a block-level HTML comment INSIDE a fenced code block stripped from MEMORY.md before the
load caps are applied?

Documented: "Only the content that loads counts toward the limits. YAML frontmatter and block-level
HTML comments are stripped before the index is loaded, so they're excluded from the measurement."
Not documented: whether a comment inside a fence survives that strip. The nearest documented
behaviour — for CLAUDE.md, not MEMORY.md — says comments inside code blocks ARE preserved.

Three arms, identical canary bodies, differing only in whether a ~3.0k-unit comment is present and
whether it sits inside a fence.

Line geometry is chosen so the LINE cap can never bind in any arm (167 lines max, cap is 200), so
the only thing that can move the cut is the size cap. That matters: a taller fixture would let the
line cap fire in the comment-counted case and produce the same shift for the wrong reason.

  canary line   = 200 code points -> 201 UTF-16 units incl. newline
  150 canaries  = 30,150 units    -> over the 25,000 cap in every arm
  cut, stripped -> first dropped line 125  (last visible CANARY-124)
  cut, counted  -> 3,024 units of comment eaten first (17 lines x 201 minus the short
                   delimiters; 3,036 with the fence), so 15 lines earlier -> canary 109
"""
import os
import pathlib
import subprocess
import sys

CANARY_W = 200
N_CANARY = 150
N_COMMENT_LINES = 15
HOME = pathlib.Path.home()

u16 = lambda s: sum(2 if ord(c) > 0xFFFF else 1 for c in s)


def canaries():
    return [f"CANARY-{i:03d} " + "x" * (CANARY_W - 11) for i in range(1, N_CANARY + 1)]


def comment_lines():
    body = ["m" * CANARY_W for _ in range(N_COMMENT_LINES)]
    return ["<!--"] + body + ["-->"]


ARMS = {
    # anchor: no comment at all
    "ctrl": lambda: canaries(),
    # a block comment at the top, not inside any fence
    "bare": lambda: comment_lines() + canaries(),
    # byte-identical comment, wrapped in a fence
    "fenced": lambda: ["```text"] + comment_lines() + ["```"] + canaries(),
}

slug = lambda p: p.replace("/", "-").replace("_", "-")
Q = ("Reply with only the highest-numbered CANARY-NNN token present in your memory index, "
     "and nothing else.")


def main():
    root = os.path.abspath(sys.argv[1])
    runs = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    made = []

    for name, build in ARMS.items():
        text = "\n".join(build())          # no trailing EOL, matching the committed generator
        proj = os.path.join(root, name)
        os.makedirs(proj, exist_ok=True)
        memdir = HOME / ".claude" / "projects" / slug(proj) / "memory"
        memdir.mkdir(parents=True, exist_ok=True)
        (memdir / "MEMORY.md").write_bytes(text.encode("utf-8"))
        made.append(memdir.parent)
        print(f"{name:8} lines={text.count(chr(10)) + 1:4d}  units={u16(text):6d}  "
              f"bytes={len(text.encode('utf-8')):6d}  slug={slug(proj)}", flush=True)

    print("\n--- probing (serial, tools disabled) ---", flush=True)
    for name in ARMS:
        for r in range(1, runs + 1):
            proc = subprocess.run(
                ["claude", "-p", "--tools", ""],
                cwd=os.path.join(root, name), input=Q,
                capture_output=True, text=True, timeout=300,
            )
            answer = " ".join(proc.stdout.split())[:120] or f"<empty, rc={proc.returncode}>"
            print(f"{name:8} run{r}  {answer}", flush=True)

    print("\n--- cleanup ---", flush=True)
    # Report what the slug directory still holds before removing it. Whether `claude -p` leaves
    # a session transcript beside `memory/` decides whether `d.rmdir()` can succeed at all, and
    # the 2026-08-23 run did not preserve the answer -- so the record could not settle it when
    # asked. Print the residue instead of assuming an empty directory.
    for d in made:
        for f in (d / "memory").glob("*"):
            f.unlink()
        (d / "memory").rmdir()
        residue = sorted(p.name for p in d.iterdir())
        if residue:
            print(f"KEPT    {d} -- not empty after removing memory/: {residue}", flush=True)
            continue
        d.rmdir()
        print(f"removed {d}", flush=True)
    # Derive the pattern from the root actually used. Globbing a hardcoded token while the root
    # comes from argv means any other root prints `0` having examined nothing -- a check that
    # cannot see its target, which is the same shape as the thing it is checking for.
    # Through `slug`, not raw. The directories were created as slug(proj), and that transform
    # maps `_` -> `-` -- so globbing the raw basename of a root like /tmp/cap_test searches for
    # *cap_test* over directories named -tmp-cap-test-*, finds nothing, and reports 0 remaining.
    # That is the very defect this check was repaired for, reproduced for the one input family
    # this probe's own RESULT.md is about (#717 review).
    token = slug(os.path.basename(root))
    left = list((HOME / ".claude" / "projects").glob(f"*{token}*"))
    print(f"fixture dirs remaining: {len(left)}  (pattern: *{token}*)")
    if left:
        for d in left:
            print(f"  LEFT BEHIND: {d}")


if __name__ == "__main__":
    main()
