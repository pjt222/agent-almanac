#!/usr/bin/env python3
"""
agent-almanac #722 -- does the harness inject a truncation notice when the auto-memory index
is over cap, at READ time, in a session that ran no Edit?

THE READ-OUT IS THE WIRE, NOT THE MODEL
---------------------------------------
#717 established that a session's self-report about its own context is unsound in BOTH
directions, so "ask the model whether it saw a notice" cannot answer this. Instead the
outbound request body is captured with `tools/wirecap.py` and two arms are DIFFERENCED:

    over   150 lines x 200 chars = 30,149 UTF-16 units  -> over the ~25,000 cap
    under  100 lines x 200 chars = 20,099 UTF-16 units  -> under it

(N*201 - 1, not N*201: the generator joins with "\n" and writes NO trailing newline. An earlier
draft of this docstring counted one that is never written, disagreeing with the registry 30 lines
below -- the doc-vs-code drift this corpus exists to police.)

`under` is a strict line-prefix of `over`, so every line of `under` also occurs in `over`.
Lines appearing only in the `over` capture are therefore exactly: the canary lines that
`under` does not have, plus anything the harness added because the index was cut. The
canary lines are trivially recognisable, so whatever else is in that set IS the notice --
and no advance guess at its wording is needed, which is the whole point of differencing
rather than grepping.

STORE PATH IS DISCOVERED, NOT COMPUTED
--------------------------------------
Both existing generators hand-roll the project-slug transform, whose history this repo
records as having CHANGED (#720). This script does not guess it: it runs a throwaway session
in the arm directory first and observes which `~/.claude/projects/` entry appears. If none
appears, it fails closed rather than writing a fixture somewhere nothing will read it.

USAGE
-----
    python3 notice-probe.py --build   ROOT --port PORT
    python3 notice-probe.py --cleanup ROOT
"""
import argparse
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time

CANARY_WIDTH = 11           # len("CANARY-000 ")

# arm      -> (lines, chars per line)
#   over   over the SIZE cap    (30,149 units)  -- and a strict line-superset of `under`
#   under  under both caps      (20,099 units)  -- the control
#   lines  over the LINE cap only (6,299 units, 300 lines) -- does that path announce itself?
ARMS = {
    "over":  (150, 200),
    "under": (100, 200),
    "lines": (300,  20),
}


def build_index(nlines, line_chars):
    """`nlines` lines of exactly `line_chars` code points, no trailing newline.

    `under` must be a strict line-prefix of `over`, so the line text may depend only on the
    line's own index and the width -- never on nlines."""
    return "\n".join(
        f"CANARY-{i:03d} " + "x" * (line_chars - CANARY_WIDTH)
        for i in range(1, nlines + 1)
    )


def utf16_units(text):
    return len(text.encode("utf-16-le")) // 2


def projects_dir():
    return pathlib.Path.home() / ".claude" / "projects"


def snapshot_projects():
    root = projects_dir()
    return {p.name for p in root.iterdir()} if root.exists() else set()


def discover_store(arm_dir, port, timeout=180):
    """Run a throwaway session inside `arm_dir` and observe which projects entry appears.

    Returns the discovered directory name, or None. Never computes a slug."""
    before = snapshot_projects()
    env = dict(os.environ)
    env["ANTHROPIC_BASE_URL"] = f"http://127.0.0.1:{port}"
    try:
        subprocess.run(
            ["claude", "-p", "--tools", "", "--strict-mcp-config"],
            cwd=str(arm_dir), input="hi", text=True, env=env,
            capture_output=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        pass
    for _ in range(20):
        new = snapshot_projects() - before
        if new:
            return sorted(new)[0]
        time.sleep(0.25)
    return None


def build(root, port):
    root = pathlib.Path(root).resolve()
    manifest = {}
    only = os.environ.get("NOTICE_PROBE_ONLY")
    print(f"{'arm':6} {'lines':>6} {'u16':>8} {'store':>6}  path")
    for name, (nlines, line_chars) in ARMS.items():
        if only and name != only:
            continue
        arm_dir = root / name
        arm_dir.mkdir(parents=True, exist_ok=True)

        store = discover_store(arm_dir, port)
        if store is None:
            print(f"FAIL: no ~/.claude/projects entry appeared for {arm_dir}.", file=sys.stderr)
            print("      Refusing to guess the slug transform (#720).", file=sys.stderr)
            return 1

        text = build_index(nlines, line_chars)
        memdir = projects_dir() / store / "memory"
        memdir.mkdir(parents=True, exist_ok=True)
        target = memdir / "MEMORY.md"
        with open(target, "wb") as fh:            # bytes: never let text mode touch line endings
            fh.write(text.encode("utf-8"))

        manifest[name] = {
            "arm_dir": str(arm_dir), "store": store, "memory": str(target),
            "lines": nlines, "utf16_units": utf16_units(text),
        }
        print(f"{name:6} {nlines:6} {utf16_units(text):8} {'ok':>6}  {target}")

    # MERGE, never overwrite: a single-arm run must not drop the other arms' stores from the
    # manifest, because cleanup refuses to delete what the manifest does not name.
    manifest_path = root / "manifest.json"
    if manifest_path.exists():
        existing = json.loads(manifest_path.read_text())
        existing.update(manifest)
        manifest = existing
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"\nmanifest: {manifest_path} ({len(manifest)} arm(s))")
    return 0


def cleanup(root):
    """Remove arm dirs and their discovered stores. FAIL-CLOSED: anything that could not be
    removed is reported and the exit code is non-zero, because a probe fixture is
    indistinguishable from a real memory store to anything that walks that directory."""
    root = pathlib.Path(root).resolve()
    manifest_path = root / "manifest.json"
    if not manifest_path.exists():
        print(f"FAIL: no manifest at {manifest_path}; refusing to guess what to delete.",
              file=sys.stderr)
        return 1

    manifest = json.loads(manifest_path.read_text())
    kept = []
    for name, info in manifest.items():
        store_dir = projects_dir() / info["store"]
        for path in (store_dir, pathlib.Path(info["arm_dir"])):
            if not path.exists():
                print(f"  {name}: already gone: {path}")
                continue
            try:
                shutil.rmtree(path)
                print(f"  {name}: removed {path}")
            except OSError as exc:
                kept.append(f"{path}: {exc}")

    if root.exists():
        try:
            shutil.rmtree(root)
            print(f"  removed root {root}")
        except OSError as exc:
            kept.append(f"{root}: {exc}")

    leftovers = [p.name for p in projects_dir().iterdir()
                 if any(info["store"] == p.name for info in manifest.values())]
    if leftovers:
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
    parser.add_argument("--cleanup", metavar="ROOT")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()

    if args.build:
        return build(args.build, args.port)
    if args.cleanup:
        return cleanup(args.cleanup)
    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
