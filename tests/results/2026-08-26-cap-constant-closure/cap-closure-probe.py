#!/usr/bin/env python3
"""
agent-almanac #407/#722 follow-up -- close the two INFERRED steps in the binary reading of the
auto-memory cap, on the same artifact that was dumped.

FIVE PREDICTIONS, EACH WITH AN ARM THAT WOULD FALSIFY IT
--------------------------------------------------------
Prior work in anthropics/claude-code#82056 bracketed the size cap behaviourally and, on two
platforms, measured it at 25,000 UTF-16 code units. This run states the remaining open
questions as predictions and tests each one, on linux-x64, from the wire:

    P1  the SIZE cap is exactly 25,000 UTF-16 code units, and the notice threshold is
        strictly greater-than -- so 25,000 loads whole and silent, 25,001 does not
    P2  the LINE cap is exactly 200, on the same strict comparison
    P3  the cut keeps WHOLE LINES -- it retreats to the last newline at or before the cap --
        and falls back to exactly the cap only when the text contains no newline at all
    P4  both counts are taken AFTER trimming, so trailing whitespace is free
    P5  when BOTH caps are exceeded the notice takes a third form, naming the line count and
        the size together, with no "(limit: ...)" clause at all

P1 and P2 are what the two-platform result cannot settle for THIS build: a different platform
is a different compilation. P3, P4 and P5 have never been tested by anyone.

Each prediction is falsifiable by exactly one arm below, and `--analyze` compares the observed
notice against `EXPECTED` rather than against a human reading of the output.

THE FIXTURES, AND WHY THEY ARE SHAPED THIS WAY
----------------------------------------------
Under P3, a fixture built out of lines reads the cap THROUGH a line width and can never
resolve it better than one line -- which is why a week of line-based fixtures upstream landed
on a 24-unit bracket rather than a constant. The size arms below therefore contain no newline
whatsoever, so the whole-line retreat has nothing to retreat to and the cut lands on the
constant itself. If P3 is wrong, `size_over7` says so: its cut would fall on a marker
boundary instead of three characters inside one.

    arm          fixture                        units  lines  expect
    size_exact   5-char markers x 5,000         25,000     1  silent, whole
    size_over1   size_exact + one "z"           25,001     1  cut to 25,000 + notice
    size_over7   7-char markers x 4,000         28,000     1  cut mid-marker 3,572
    line_exact   200 lines x 20 chars            4,199   200  silent, whole
    line_over1   201 lines x 20 chars            4,220   201  cut to 200 + notice
    both         300 lines x 100 chars          30,299   300  BOTH caps -> third variant
    trim         size_exact + a blank run   25,000/25,003  1/4 silent IFF trimmed first

`size_over7` replicates DanceNitra's win32 arm on linux: 25,000/7 = 3,571.43, so the cut
lands THREE characters into marker 3,572. A cut landing on a marker edge would indict the
fixture rather than measure the constant.

`both` produces a THIRD notice variant -- one naming the line count and the size together,
with no `(limit: ...)` clause at all -- which nobody in anthropics/claude-code#82056 has
produced. After line-truncation to
200 lines the text is 20,199 units, under the size cap, so no second cut occurs.

`trim` is the discriminator for P4: counted after trimming it is 25,000 units and silent;
counted raw it is 25,003 and cuts. Nothing else in the corpus separates those.

THE READ-OUT IS THE WIRE
------------------------
#717 established that a session's self-report about its own context is unsound in BOTH
directions, so nothing here asks the model anything. Every figure is counted out of the
captured POST body by `--analyze`.

STORE PATH IS DISCOVERED, NEVER COMPUTED
----------------------------------------
The project-slug transform has changed before (#720). Each arm runs a throwaway session in
its own directory and observes which `~/.claude/projects/` entry appears. If none appears the
run fails closed rather than writing a fixture somewhere nothing will read it.

INVOCATION HAZARD THIS SCRIPT AVOIDS BY CONSTRUCTION
----------------------------------------------------
`VARS printf '%s' hi | claude -p ...` applies the assignments to `printf` ONLY, so
ANTHROPIC_BASE_URL never reaches `claude`: the capture is empty, the real API answers, and
the fixture lands in a LIVE store. That is a published false-finding cause in #82056
(yacb2, retracted in comment 5424142726) and it is the form written in this repository's own
`tools/wirecap.py` docstring. Every subprocess here passes `env=` explicitly and pipes input
via stdin, so the form cannot occur.

USAGE
-----
    python3 cap-closure-probe.py --build   ROOT [--port P]
    python3 cap-closure-probe.py --capture ROOT
    python3 cap-closure-probe.py --analyze ROOT
    python3 cap-closure-probe.py --cleanup ROOT
"""
import argparse
import json
import os
import pathlib
import re
import shutil
import socket
import subprocess
import sys
import threading
import time

REPO = pathlib.Path(__file__).resolve().parents[3]
WIRECAP = REPO / "tools" / "wirecap.py"

# arm -> (kind, params). Built by build_index(); see the docstring table.
ARMS = {
    "size_exact": ("markers", {"width": 5, "count": 5000, "tail": ""}),
    "size_over1": ("markers", {"width": 5, "count": 5000, "tail": "z"}),
    "size_over7": ("markers", {"width": 7, "count": 4000, "tail": ""}),
    "line_exact": ("lines", {"nlines": 200, "chars": 20}),
    "line_over1": ("lines", {"nlines": 201, "chars": 20}),
    "both": ("lines", {"nlines": 300, "chars": 100}),
    "trim": ("markers", {"width": 5, "count": 5000, "tail": "\n\n\n"}),
}

NOTICE_TAIL = (" Only part of it was loaded. Keep index entries to one line under ~200 chars;"
               " move detail into topic files.")

# arm -> what the run must produce. EVERY field here is asserted by --analyze.
#
# `disk_units` is the RAW file on disk; `disk_lines` is the count of the TRIMMED text. The two
# deliberately measure different texts, and for every arm but `trim` those texts are identical,
# so the distinction is invisible. `trim` is the one arm that separates them, which is its
# entire purpose: 25,003 units on disk, 25,000 after trimming, and therefore SILENT if and only
# if the trim really happens before the comparison.
#
# `notice` is the FULL expected string, not a boolean. An earlier version of this file stored a
# boolean and asserted only that, so --analyze would have passed the `both` arm carrying
# `300 lines (limit: 200)` -- precisely the outcome P5 predicts against. An independent reviewer
# killed that version with a mutant: every wire body corrupted to 5 units and the `both` notice
# replaced with `999.9KB ... TOTALLY DIFFERENT NOTICE`, and it still printed `OK`, exit 0.
# Assert the payload, never its presence.
EXPECTED = {
    "size_exact": dict(disk_units=25000, disk_lines=1, wire_units=25000, wire_lines=1,
                       notice=None),
    "size_over1": dict(disk_units=25001, disk_lines=1, wire_units=25000, wire_lines=1,
                       notice="MEMORY.md is 24.4KB (limit: 24.4KB) — index entries are"
                              " too long." + NOTICE_TAIL),
    "size_over7": dict(disk_units=28000, disk_lines=1, wire_units=25000, wire_lines=1,
                       notice="MEMORY.md is 27.3KB (limit: 24.4KB) — index entries are"
                              " too long." + NOTICE_TAIL),
    "line_exact": dict(disk_units=4199, disk_lines=200, wire_units=4199, wire_lines=200,
                       notice=None),
    "line_over1": dict(disk_units=4220, disk_lines=201, wire_units=4199, wire_lines=200,
                       notice="MEMORY.md is 201 lines (limit: 200)." + NOTICE_TAIL),
    "both": dict(disk_units=30299, disk_lines=300, wire_units=20199, wire_lines=200,
                 notice="MEMORY.md is 300 lines and 29.6KB." + NOTICE_TAIL),
    "trim": dict(disk_units=25003, disk_lines=1, wire_units=25000, wire_lines=1,
                 notice=None),
}


def build_index(kind, params):
    """Return the fixture text. No trailing newline unless a `tail` asks for one."""
    if kind == "markers":
        width, count, tail = params["width"], params["count"], params["tail"]
        # Fixed-width unique markers, zero-padded so every marker is exactly `width` units
        # and the marker index is recoverable from the wire by position alone.
        body = "".join(f"M{i:0{width - 1}d}" for i in range(1, count + 1))
        return body + tail
    if kind == "lines":
        nlines, chars = params["nlines"], params["chars"]
        return "\n".join(
            f"L{i:05d}" + "x" * (chars - 6) for i in range(1, nlines + 1)
        )
    raise ValueError(kind)


def utf16_units(text):
    return len(text.encode("utf-16-le")) // 2


def line_count(text):
    """The line count as P2/P4 predict it is taken: newlines plus one, on the TRIMMED text.

    This is a PREDICTION the run tests, not a description of anything read. `line_over1` is
    what would falsify the newlines-plus-one part, and `trim` the trimmed part."""
    t = text.strip()
    return t.count("\n") + 1


def projects_dir():
    return pathlib.Path.home() / ".claude" / "projects"


def snapshot_projects():
    root = projects_dir()
    return {p.name for p in root.iterdir()} if root.exists() else set()


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def run_claude(arm_dir, port, timeout=180):
    """Run one throwaway `claude -p` inside `arm_dir` against the local capture server.

    The environment is passed via `env=`, NEVER as a shell assignment prefix -- see the
    INVOCATION HAZARD note in the module docstring."""
    env = dict(os.environ)
    env["ANTHROPIC_BASE_URL"] = f"http://127.0.0.1:{port}"
    try:
        return subprocess.run(
            ["claude", "-p", "--tools", "", "--strict-mcp-config"],
            cwd=str(arm_dir), input="hi", text=True, env=env,
            capture_output=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return None


class Server:
    """wirecap.py as a context manager, one capture file per arm."""

    def __init__(self, out_path, port):
        self.out_path, self.port, self.proc = out_path, port, None

    def __enter__(self):
        self.proc = subprocess.Popen(
            [sys.executable, str(WIRECAP), "--port", str(self.port),
             "--out", str(self.out_path)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        for _ in range(80):                      # wait for the port to accept
            try:
                with socket.create_connection(("127.0.0.1", self.port), timeout=0.25):
                    return self
            except OSError:
                time.sleep(0.25)
        raise RuntimeError(f"wirecap did not come up on port {self.port}")

    def __exit__(self, *_exc):
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()


def build(root, port):
    root = pathlib.Path(root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    manifest = {}
    only = os.environ.get("CAP_PROBE_ONLY")

    print(f"{'arm':11} {'units':>7} {'lines':>6} {'store':>7}  path")
    with Server(root / "_discovery.jsonl", port):
        for name, (kind, params) in ARMS.items():
            if only and name != only:
                continue
            arm_dir = root / name
            arm_dir.mkdir(parents=True, exist_ok=True)

            before = snapshot_projects()
            run_claude(arm_dir, port)
            store = None
            for _ in range(20):
                new = snapshot_projects() - before
                if new:
                    store = sorted(new)[0]
                    break
                time.sleep(0.25)
            if store is None:
                print(f"FAIL: no ~/.claude/projects entry appeared for {arm_dir}.",
                      file=sys.stderr)
                print("      Refusing to guess the slug transform (#720).", file=sys.stderr)
                return 1

            text = build_index(kind, params)
            memdir = projects_dir() / store / "memory"
            memdir.mkdir(parents=True, exist_ok=True)
            target = memdir / "MEMORY.md"
            with open(target, "wb") as fh:       # bytes: never let text mode touch line endings
                fh.write(text.encode("utf-8"))

            units, lines = utf16_units(text), line_count(text)
            exp = EXPECTED[name]
            if units != exp["disk_units"] or lines != exp["disk_lines"]:
                print(f"FAIL: {name} built {units}u/{lines}L, expected "
                      f"{exp['disk_units']}u/{exp['disk_lines']}L", file=sys.stderr)
                return 1

            manifest[name] = {
                "arm_dir": str(arm_dir), "store": store, "memory": str(target),
                "kind": kind, "params": params,
                "utf16_units": units, "line_count": lines,
            }
            print(f"{name:11} {units:7} {lines:6} {'ok':>7}  {target}")

    path = root / "manifest.json"
    if path.exists():                            # MERGE: a single-arm run must not drop others
        existing = json.loads(path.read_text())
        existing.update(manifest)
        manifest = existing
    path.write_text(json.dumps(manifest, indent=2))
    print(f"\nmanifest: {path} ({len(manifest)} arm(s))")
    return 0


def capture(root):
    root = pathlib.Path(root).resolve()
    path = root / "manifest.json"
    if not path.exists():
        print(f"FAIL: no manifest at {path}; run --build first.", file=sys.stderr)
        return 1
    manifest = json.loads(path.read_text())
    only = os.environ.get("CAP_PROBE_ONLY")

    for name, info in manifest.items():
        if only and name != only:
            continue
        out = root / f"{name}.jsonl"
        port = free_port()
        with Server(out, port):
            run_claude(pathlib.Path(info["arm_dir"]), port)
        n = sum(1 for _ in out.open()) if out.exists() else 0
        print(f"  {name:11} -> {out.name} ({n} record(s), port {port})")
        if n == 0:
            print(f"FAIL: {name} captured nothing. The request did not reach the local "
                  f"server, so it went somewhere else.", file=sys.stderr)
            return 1
    return 0


NOTICE_RE = re.compile(r"> WARNING: (MEMORY\.md is [^\n]*)")


def analyze(root):
    root = pathlib.Path(root).resolve()
    manifest = json.loads((root / "manifest.json").read_text())
    ok = True

    print(f"{'arm':11} {'disk u':>7} {'wire u':>7} {'wire L':>7} {'tools':>6}  verdict")
    print("-" * 100)
    for name, info in sorted(manifest.items()):
        cap_path = root / f"{name}.jsonl"
        if not cap_path.exists():
            print(f"{name:11}  NO CAPTURE")
            ok = False
            continue
        rec = json.loads(cap_path.open().readline())
        body = rec.get("body", rec)
        raw = _first_text(body)

        seg = _memory_segment(raw)
        match = NOTICE_RE.search(raw)
        got_notice = match.group(1) if match else None
        ntools = len(body.get("tools", []) or [])
        exp = EXPECTED[name]

        wire_u = utf16_units(seg) if seg is not None else -1
        wire_l = seg.count("\n") + 1 if seg else -1

        # EVERY field is asserted. Presence-only checking is what a mutant survived.
        fails = []
        if info["utf16_units"] != exp["disk_units"]:
            fails.append(f"disk {info['utf16_units']}!={exp['disk_units']}")
        if wire_u != exp["wire_units"]:
            fails.append(f"wire {wire_u}!={exp['wire_units']}")
        if wire_l != exp["wire_lines"]:
            fails.append(f"lines {wire_l}!={exp['wire_lines']}")
        if got_notice != exp["notice"]:
            fails.append("notice text differs")

        print(f"{name:11} {info['utf16_units']:7} {wire_u:7} {wire_l:7} {ntools:6}  "
              f"{'ok' if not fails else 'FAIL: ' + '; '.join(fails)}")
        if fails:
            ok = False
            print(f"{'':11}   expected notice: {exp['notice']!r}")
            print(f"{'':11}   observed notice: {got_notice!r}")

    print("OK" if ok else "MISMATCH -- read the captures, do not adjust the expectations")
    return 0 if ok else 1


def _first_text(body):
    """The first assistant-visible text block of the request, where the index is injected."""
    try:
        msgs = body["messages"]
        for m in msgs:
            content = m.get("content")
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                for c in content:
                    if isinstance(c, dict) and c.get("type") == "text":
                        return c["text"]
    except (KeyError, TypeError, IndexError):
        pass
    return json.dumps(body)


def _memory_segment(raw):
    """The injected MEMORY.md body: between the 'Contents of ...MEMORY.md' header and either
    the WARNING line or the end of the system-reminder. Returns None if not present."""
    m = re.search(r"Contents of [^\n]*MEMORY\.md[^\n]*:\n+", raw)
    if not m:
        return None
    rest = raw[m.end():]
    for stop in ("\n\n> WARNING:", "\n> WARNING:", "\n</system-reminder>", "\n# userEmail"):
        i = rest.find(stop)
        if i != -1:
            rest = rest[:i]
    return rest


def cleanup(root):
    """FAIL-CLOSED: anything not removed is reported and the exit is non-zero. A probe fixture
    is indistinguishable from a real memory store to anything that walks that directory."""
    root = pathlib.Path(root).resolve()
    path = root / "manifest.json"
    if not path.exists():
        print(f"FAIL: no manifest at {path}; refusing to guess what to delete.",
              file=sys.stderr)
        return 1
    manifest = json.loads(path.read_text())
    kept = []
    for name, info in manifest.items():
        for target in (projects_dir() / info["store"], pathlib.Path(info["arm_dir"])):
            if not target.exists():
                print(f"  {name}: already gone: {target}")
                continue
            try:
                shutil.rmtree(target)
                print(f"  {name}: removed {target}")
            except OSError as exc:
                kept.append(f"{target}: {exc}")

    leftovers = [p.name for p in projects_dir().iterdir()
                 if any(info["store"] == p.name for info in manifest.values())]
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
    parser.add_argument("--capture", metavar="ROOT")
    parser.add_argument("--analyze", metavar="ROOT")
    parser.add_argument("--cleanup", metavar="ROOT")
    parser.add_argument("--port", type=int, default=0)
    args = parser.parse_args()

    if args.build:
        return build(args.build, args.port or free_port())
    if args.capture:
        return capture(args.capture)
    if args.analyze:
        return analyze(args.analyze)
    if args.cleanup:
        return cleanup(args.cleanup)
    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
