#!/usr/bin/env python3
"""
agent-almanac #721 -- is a block-level HTML comment inside a fenced code block stripped from
MEMORY.md before the load caps apply, and does the fence's INFO STRING change the answer?

Eight arms, identical canary bodies, differing only in what precedes them:

    ctrl      no comment at all                       -- anchors the fixture on this build
    bare      <!-- ... -->            (no fence)
    midbare   CANARY-001 then <!-- ... -->            -- the POSITION control: same bytes as
                                                        `bare`, comment no longer at file start
    text      ```text  <!-- ... -->  ```              -- the only tag ever measured
    yaml      ```yaml  <!-- ... -->  ```
    bash      ```bash  <!-- ... -->  ```
    json      ```json  <!-- ... -->  ```
    untagged  ```      <!-- ... -->  ```              -- the case the repo's default-deny
                                                        fence rule turns on; never run

WHY THIS DOES NOT USE THE BEHAVIOURAL PROTOCOL #721 SPECIFIES
-------------------------------------------------------------
#721 prescribes invented-token needles at lines 108/109/110 and 123/124/125, three trials each,
classified on presence of the exact planted value. That whole apparatus exists to defend against
a read-out that goes through the MODEL: an absent needle returns no `UNKNOWN` token in two of
three observed modes, fabricates a plausible value in ~2% of trials, and a tool-stub failure can
score a present needle as absent.

#722 established a strictly better instrument. `tools/wirecap.py` captures the request body the
client actually sends, so the loaded prefix can be READ rather than inferred. Every hazard above
is a property of asking the model and none of them survive the change. Three trials collapse to
one observation, and the classification rule collapses to "which lines are in the bytes".

It is also strictly MORE informative. The behavioural protocol can only see where the canaries
stop, so `stripped` and `counted` are its only hypotheses. Reading the wire shows the comment's
presence and the cut INDEPENDENTLY, which separates two cases the needles cannot:

    comment absent  + cut at 124   -> stripped, and not counted        (the documented behaviour)
    comment present + cut at 109   -> preserved, and counted
    comment absent  + cut at 109   -> stripped from the TEXT but still counted against the budget
    comment present + cut at 124   -> preserved but not counted

The #721 acceptance criteria are about which verdict each tag returns, not about the needles, so
they are satisfied -- by a method that cannot return the failure modes they were written to
absorb. The deviation is deliberate and is recorded in RESULT.md.

GEOMETRY (all arms; 150 canaries so the 200-line cap can never bind)
    canary line     200 code points + LF = 201 units
    comment body    15 lines x 200 code points, same width as a canary
    comment block   3,024 units bare; 3,032 untagged-fenced; 3,036 tagged-fenced
    stripped  -> last canary 124   = floor(25000 / 201)
    counted   -> last canary 109   = floor((25000 - block) / 201), for every block size above

USAGE
    python3 fence-strip-probe.py --build   ROOT --port PORT
    python3 fence-strip-probe.py --measure ROOT --port PORT --capture FILE
    python3 fence-strip-probe.py --cleanup ROOT
"""
import argparse
import re
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time

CANARY_W = 200
N_CANARY = 150
N_COMMENT_LINES = 15
DOCUMENTED_CAP = 25000
UNITS_PER_CANARY = CANARY_W + 1


def canaries():
    return [f"CANARY-{i:03d} " + "x" * (CANARY_W - 11) for i in range(1, N_CANARY + 1)]


def comment_lines():
    """Body lines are the same WIDTH as a canary, so the geometry matches the 2026-08-23
    generator exactly. They carry a token rather than filler `m`s only so the wire capture can
    report WHICH comment lines survived, not merely whether any did."""
    body = [f"COMMENT-{i:03d} " + "m" * (CANARY_W - 12) for i in range(1, N_COMMENT_LINES + 1)]
    return ["<!--"] + body + ["-->"]


ARMS = {
    "ctrl":     lambda: canaries(),
    "bare":     lambda: comment_lines() + canaries(),
    # THE POSITION CONTROL (#725 review). In every other arm the bare comment is at the FILE
    # START and every fenced comment is at line 2, so "the fence prevents the strip" is
    # confounded with "only a top-of-file comment is stripped" -- a frontmatter-like rule
    # predicts all seven original observations. This arm is byte-identical to `bare` except that
    # one canary precedes the comment, which breaks the tie: a position rule keeps the comment
    # (109), a fence rule strips it (124). The block shifts everything by a constant wherever it
    # sits, so the same predictions() arithmetic applies unchanged.
    "midbare":  lambda: canaries()[:1] + comment_lines() + canaries()[1:],
    "text":     lambda: ["```text"] + comment_lines() + ["```"] + canaries(),
    "yaml":     lambda: ["```yaml"] + comment_lines() + ["```"] + canaries(),
    "bash":     lambda: ["```bash"] + comment_lines() + ["```"] + canaries(),
    "json":     lambda: ["```json"] + comment_lines() + ["```"] + canaries(),
    "untagged": lambda: ["```"] + comment_lines() + ["```"] + canaries(),
}


def u16(text):
    return len(text.encode("utf-16-le")) // 2


def block_units(name):
    """UTF-16 units consumed before canary 1 begins: the comment, any fence delimiters, AND the
    newline separating the block from the first canary.

    That separator is why this is 3,024 for `bare` and not 3,023. #721's published figures
    include it, and so must this, or the two disagree by one unit for no reason. It does not
    change any verdict -- floor((25000-3023)/201) and floor((25000-3024)/201) are both 109 --
    which is exactly why an off-by-one here would have survived unnoticed."""
    if name == "ctrl":
        return 0
    full = "\n".join(ARMS[name]())
    plain = "\n".join(canaries())
    return u16(full) - u16(plain)


def predictions(name):
    blk = block_units(name)
    return {
        "stripped": DOCUMENTED_CAP // UNITS_PER_CANARY,
        "counted": (DOCUMENTED_CAP - blk) // UNITS_PER_CANARY,
        "block_units": blk,
    }


def projects_dir():
    return pathlib.Path.home() / ".claude" / "projects"


def snapshot_projects():
    root = projects_dir()
    return {p.name for p in root.iterdir()} if root.exists() else set()


def run_claude(arm_dir, port, prompt="Reply with the single word OK.", timeout=300):
    env = dict(os.environ)
    env["ANTHROPIC_BASE_URL"] = f"http://127.0.0.1:{port}"
    try:
        return subprocess.run(
            ["claude", "-p", "--tools", "", "--strict-mcp-config"],
            cwd=str(arm_dir), input=prompt, text=True, env=env,
            capture_output=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return None


def discover_store(arm_dir, port):
    """Observe which projects entry appears. Never computes the slug -- #720, and the #722 run
    measured that a computed slug would be WRONG (`.` maps to `-`, which the older generator
    does not implement)."""
    before = snapshot_projects()
    run_claude(arm_dir, port, prompt="hi")
    for _ in range(20):
        new = snapshot_projects() - before
        if new:
            return sorted(new)[0]
        time.sleep(0.25)
    return None


def build(root, port):
    root = pathlib.Path(root).resolve()
    manifest = {}
    only = os.environ.get("FENCE_PROBE_ONLY")
    print(f"{'arm':9} {'lines':>6} {'units':>7} {'block':>6} {'stripped':>9} {'counted':>8}")
    for name in ARMS:
        if only and name != only:
            continue
        arm_dir = root / name
        arm_dir.mkdir(parents=True, exist_ok=True)
        store = discover_store(arm_dir, port)
        if store is None:
            print(f"FAIL: no projects entry appeared for {arm_dir}; refusing to guess the slug.",
                  file=sys.stderr)
            return 1

        text = "\n".join(ARMS[name]())
        memdir = projects_dir() / store / "memory"
        memdir.mkdir(parents=True, exist_ok=True)
        (memdir / "MEMORY.md").write_bytes(text.encode("utf-8"))

        pred = predictions(name)
        manifest[name] = {
            "arm_dir": str(arm_dir), "store": store,
            "lines": text.count("\n") + 1, "units": u16(text), **pred,
        }
        print(f"{name:9} {text.count(chr(10)) + 1:6d} {u16(text):7d} {pred['block_units']:6d} "
              f"{pred['stripped']:9d} {pred['counted']:8d}")

    path = root / "manifest.json"
    if path.exists():
        existing = json.loads(path.read_text())
        existing.update(manifest)
        manifest = existing
    path.write_text(json.dumps(manifest, indent=2))
    print(f"\nmanifest: {path} ({len(manifest)} arm(s))")
    return 0


def _capture_lines(capture):
    return sum(1 for _ in open(capture, encoding="utf-8")) if os.path.exists(capture) else 0


def _records_after(capture, start):
    with open(capture, encoding="utf-8") as fh:
        return [json.loads(l) for i, l in enumerate(fh) if i >= start and l.strip()]


def _index_text(record):
    """The one request string that contains the memory index, or ''. """
    best = ""

    def walk(node):
        nonlocal best
        if isinstance(node, str):
            if "CANARY-001" in node and len(node) > len(best):
                best = node
        elif isinstance(node, dict):
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(record.get("body"))
    return best


def measure(root, port, capture):
    root = pathlib.Path(root).resolve()
    manifest = json.loads((root / "manifest.json").read_text())
    results = {}

    only = os.environ.get("FENCE_PROBE_ONLY")
    print(f"{'arm':9} {'last canary':>12} {'comment lines':>14} {'notice KB':>10} "
          f"{'stripped':>9} {'counted':>8}  verdict")
    for name in ARMS:
        if name not in manifest or (only and name != only):
            continue
        start = _capture_lines(capture)
        run_claude(root / name, port)
        for _ in range(20):
            if _capture_lines(capture) > start:
                break
            time.sleep(0.25)
        recs = _records_after(capture, start)
        text = next((t for t in (_index_text(r) for r in recs) if t), "")
        if not text:
            print(f"{name:9} {'VOID -- no index reached the wire':>12}")
            results[name] = {"void": True}
            continue

        seen = sorted(int(l[7:10]) for l in text.split("\n") if l.startswith("CANARY-"))
        last = seen[-1] if seen else 0
        ncomment = sum(1 for l in text.split("\n") if l.startswith("COMMENT-"))
        notice = "Only part of it was loaded" in text
        # The notice's own KB figure, PARSED rather than hand-read off a capture (#725 review).
        # It is the second, independent read-out -- a stripped arm reports its POST-strip size --
        # and the first version of this probe recorded only a boolean, so the published table
        # could not be regenerated by running the published commands.
        kb_match = re.search(r"MEMORY\.md is ([\d.]+)KB \(limit: ([\d.]+)KB\)", text)
        notice_kb = float(kb_match.group(1)) if kb_match else None
        notice_limit_kb = float(kb_match.group(2)) if kb_match else None

        pred = manifest[name]
        contiguous = seen == list(range(1, last + 1))
        if name == "ctrl":
            verdict = "anchor" if last == pred["stripped"] else "*** ANCHOR FAILED ***"
        elif last == pred["stripped"]:
            verdict = "STRIPPED (not counted)"
        elif last == pred["counted"]:
            verdict = "COUNTED"
        else:
            verdict = f"*** neither: {last} ***"
        # A gappy capture with the right LAST canary would otherwise print a clean verdict.
        if not contiguous:
            verdict += "  *** NOT CONTIGUOUS ***"

        print(f"{name:9} {last:12d} {ncomment:14d} "
              f"{('-' if notice_kb is None else f'{notice_kb:.1f}'):>10} "
              f"{pred['stripped']:9d} {pred['counted']:8d}  {verdict}")
        results[name] = {
            "last_canary": last, "comment_lines_present": ncomment,
            "notice": notice, "notice_kb": notice_kb, "notice_limit_kb": notice_limit_kb,
            "verdict": verdict, "contiguous": contiguous,
        }

    (root / "results.json").write_text(json.dumps(results, indent=2))
    print(f"\nresults: {root / 'results.json'}")
    return 0


def cleanup(root):
    root = pathlib.Path(root).resolve()
    path = root / "manifest.json"
    if not path.exists():
        print(f"FAIL: no manifest at {path}; refusing to guess what to delete.", file=sys.stderr)
        return 1
    manifest = json.loads(path.read_text())
    kept = []
    for name, info in manifest.items():
        for target in (projects_dir() / info["store"], pathlib.Path(info["arm_dir"])):
            if not target.exists():
                continue
            try:
                shutil.rmtree(target)
                print(f"  {name}: removed {target}")
            except OSError as exc:
                kept.append(f"{target}: {exc}")
    if root.exists():
        try:
            shutil.rmtree(root)
            print(f"  removed root {root}")
        except OSError as exc:
            kept.append(f"{root}: {exc}")
    leftovers = [p.name for p in projects_dir().iterdir()
                 if any(i["store"] == p.name for i in manifest.values())]
    kept.extend(f"store still present: {n}" for n in leftovers)
    if kept:
        print("\nKEPT (cleanup incomplete):", file=sys.stderr)
        for item in kept:
            print(f"  {item}", file=sys.stderr)
        return 1
    print("\ncleanup: complete, nothing kept")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build", metavar="ROOT")
    parser.add_argument("--measure", metavar="ROOT")
    parser.add_argument("--cleanup", metavar="ROOT")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--capture", default="capture.jsonl")
    parser.add_argument("--predict", action="store_true")
    args = parser.parse_args()

    if args.predict:
        for name in ARMS:
            pred = predictions(name)
            print(f"{name:9} block={pred['block_units']:5d}  "
                  f"stripped={pred['stripped']:4d}  counted={pred['counted']:4d}")
        return 0
    if args.build:
        return build(args.build, args.port)
    if args.measure:
        return measure(args.measure, args.port, args.capture)
    if args.cleanup:
        return cleanup(args.cleanup)
    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
