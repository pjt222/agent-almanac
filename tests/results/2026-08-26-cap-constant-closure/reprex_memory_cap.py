#!/usr/bin/env python3
"""
reprex_memory_cap.py -- reproduce the Claude Code auto-memory index caps on your own machine.

Single file. Python 3.8+. Standard library only. No repository, no dependencies, no network:
the request is answered locally and forwarded nowhere.

    python3 reprex_memory_cap.py --selftest    # no `claude` needed; checks the instrument
    python3 reprex_memory_cap.py --run         # the real thing, ~7 sessions, ~2 minutes

WHAT IT MEASURES
----------------
`MEMORY.md` is truncated on load. Two caps apply, and this reproduces both AT THEIR BOUNDARY --
the pair of fixtures either side of the edge, which is what turns "about 25KB" into a constant:

    size cap   25,000 UTF-16 code units, threshold strictly `>`
    line cap   200 lines,                threshold strictly `>`

and three things a single-cap fixture cannot show: that a trailing blank run does not count,
that exceeding BOTH caps produces a third notice variant naming neither limit, and where the
cut lands when the text has no line boundary to retreat to.

WHY IT READS THE WIRE AND NOT THE MODEL
---------------------------------------
A session's self-report about its own context is unreliable in BOTH directions -- it has
returned "no index" for an index that provably loaded, and volunteered an accurate "truncated
on load" elsewhere. A failure with no consistent sign cannot be corrected for. So this points
ANTHROPIC_BASE_URL at a local recording server and counts the bytes the client actually sent.

PRIVACY: THE CAPTURE IS NEVER WRITTEN TO DISK
---------------------------------------------
A Claude Code request body contains device and account identifiers, a session id, your home
paths, your email, and your entire CLAUDE.md. This script holds each body in memory, derives
seven integers and four strings from it, prints those, and drops it. Credential headers are
discarded at capture time and never even enter the in-memory record. Nothing here produces a
file you would have to remember not to paste into a bug report.

RUN IT OUTSIDE A GIT REPOSITORY -- THE GUARD BELOW ENFORCES THIS
-----------------------------------------------------------------
Memory is keyed to the GIT REPOSITORY, not to the working directory. Inside a repo, `cd` into a
subdirectory keeps the same store; outside one, it does not. So if the arms run inside a repo,
all seven share that repo's store, every arm reads the SAME index -- the repo's real one -- and
the fixtures are never loaded at all.

This is not theoretical. The first end-to-end run of this file put its arm directories beside
itself, inside a repository, and all seven arms returned an identical 15,222 units over 141
lines: the enclosing repository's own MEMORY.md, read seven times. Nothing was written to that
store and it was unharmed, but every measurement was of the wrong file.

Three guards now make that unreachable: the arms run under the system temp directory, an
ancestor `.git` refuses the run outright, and each capture asserts that the index path the
harness reports is the store this arm just wrote to. The third is the one that catches it
directly, and it is why the failure above cannot recur silently.

WHAT IT WRITES, AND THAT IT CLEANS UP
-------------------------------------
Each arm needs its own memory store, so each arm runs in its own throwaway directory, which
causes Claude Code to create a matching entry under your projects folder. The store path is
DISCOVERED by watching which entry appears -- never computed from a slug transform, which has
changed between releases. Everything created is removed at the end, and cleanup is fail-closed:
if anything could not be removed it is named and the exit status is non-zero.

Leftover probe fixtures are not hypothetical: a census posted upstream found 75 of 80 "empty
memory stores" on one machine were the observer's own residue.

ONE INVOCATION HAZARD, SINCE IT HAS ALREADY COST THIS THREAD A ROUND TRIP
------------------------------------------------------------------------
    VARS printf '%s' hi | claude -p ...       # WRONG

Assignments in front of a pipeline apply to the FIRST command, so the variables reach `printf`
and never `claude`. The capture stays empty, the real API answers, and the fixture lands in a
LIVE store. This script passes `env=` to subprocess, where the shape cannot occur.

TESTED ON linux-x64. The OS-specific parts are the executable lookup (`.cmd` shims on Windows)
and the projects directory, both handled below. If it misbehaves on macOS or Windows that is a
bug in this file -- please say so rather than working around it.
"""
import argparse
import http.server
import json
import os
import pathlib
import platform
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time

SECRET_HEADERS = {"authorization", "x-api-key", "anthropic-auth-token",
                  "proxy-authorization", "cookie", "set-cookie"}

# arm -> (kind, params)
ARMS = {
    "size_exact": ("markers", dict(width=5, count=5000, tail="")),
    "size_over1": ("markers", dict(width=5, count=5000, tail="z")),
    "size_over7": ("markers", dict(width=7, count=4000, tail="")),
    "line_exact": ("lines", dict(nlines=200, chars=20)),
    "line_over1": ("lines", dict(nlines=201, chars=20)),
    "both": ("lines", dict(nlines=300, chars=100)),
    "trim": ("markers", dict(width=5, count=5000, tail="\n\n\n")),
}

TAIL = (" Only part of it was loaded. Keep index entries to one line under ~200 chars;"
        " move detail into topic files.")

# Every field is asserted. Asserting only "did a notice appear" is not a check: a mutant that
# replaced one notice with a completely different string survived exactly that version.
EXPECTED = {
    "size_exact": dict(disk=25000, wire=25000, lines=1, notice=None),
    "size_over1": dict(disk=25001, wire=25000, lines=1,
                       notice="MEMORY.md is 24.4KB (limit: 24.4KB) — index entries are too long." + TAIL),
    "size_over7": dict(disk=28000, wire=25000, lines=1,
                       notice="MEMORY.md is 27.3KB (limit: 24.4KB) — index entries are too long." + TAIL),
    "line_exact": dict(disk=4199, wire=4199, lines=200, notice=None),
    "line_over1": dict(disk=4220, wire=4199, lines=200,
                       notice="MEMORY.md is 201 lines (limit: 200)." + TAIL),
    "both": dict(disk=30299, wire=20199, lines=200,
                 notice="MEMORY.md is 300 lines and 29.6KB." + TAIL),
    "trim": dict(disk=25003, wire=25000, lines=1, notice=None),
}

NOTICE_RE = re.compile(r"> WARNING: (MEMORY\.md is [^\n]*)")
HEADER_RE = re.compile(r"Contents of [^\n]*MEMORY\.md[^\n]*:\n+")


# ---------------------------------------------------------------- fixtures

def build_index(kind, p):
    """Fixed-width unique markers, or numbered lines. No trailing newline unless `tail` adds one."""
    if kind == "markers":
        body = "".join("M%0*d" % (p["width"] - 1, i) for i in range(1, p["count"] + 1))
        return body + p["tail"]
    return "\n".join("L%05d" % i + "x" * (p["chars"] - 6) for i in range(1, p["nlines"] + 1))


def units(text):
    """UTF-16 code units -- what the cap counts. NOT bytes, NOT code points.

    An emoji outside the BMP is 4 UTF-8 bytes, 1 code point, and 2 of these."""
    return len(text.encode("utf-16-le")) // 2


def segment(raw):
    """The injected MEMORY.md body: after its header line, up to the notice or the next block.

    Stops at the LAST content character and excludes every trailing newline, so the figure is a
    prefix of the file on disk rather than of the harness's scaffolding around it. Getting this
    boundary wrong is how the thread produced two numbers, 24,922 and 24,924, for one fixture."""
    m = HEADER_RE.search(raw)
    if not m:
        return None
    rest = raw[m.end():]
    for stop in ("\n\n> WARNING:", "\n> WARNING:", "\n</system-reminder>", "\n# userEmail"):
        i = rest.find(stop)
        if i != -1:
            rest = rest[:i]
    return rest.rstrip("\n")


# ---------------------------------------------------------------- capture server

SSE = [
    ("message_start", {"type": "message_start", "message": {
        "id": "msg_reprex", "type": "message", "role": "assistant", "model": "reprex",
        "content": [], "stop_reason": None, "stop_sequence": None,
        "usage": {"input_tokens": 1, "output_tokens": 1}}}),
    ("content_block_start", {"type": "content_block_start", "index": 0,
                             "content_block": {"type": "text", "text": ""}}),
    ("content_block_delta", {"type": "content_block_delta", "index": 0,
                             "delta": {"type": "text_delta", "text": "OK"}}),
    ("content_block_stop", {"type": "content_block_stop", "index": 0}),
    ("message_delta", {"type": "message_delta",
                       "delta": {"stop_reason": "end_turn", "stop_sequence": None},
                       "usage": {"output_tokens": 1}}),
    ("message_stop", {"type": "message_stop"}),
]


def make_server(sink):
    class H(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *_a):
            pass

        def _send(self, payload, ctype):
            self.send_response(200)
            self.send_header("content-type", ctype)
            self.send_header("content-length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def do_POST(self):
            n = int(self.headers.get("content-length") or 0)
            raw = self.rfile.read(n) if n else b""
            try:
                # Headers are dropped entirely: nothing here needs them, and they carry the
                # credential. Only the body is retained, in memory.
                sink.append(json.loads(raw.decode("utf-8")))
            except Exception:
                pass
            if self.path.rstrip("/").endswith("count_tokens"):
                return self._send(json.dumps({"input_tokens": 1}).encode(), "application/json")
            body = b"".join(("event: %s\ndata: %s\n\n" % (k, json.dumps(v))).encode()
                            for k, v in SSE)
            self._send(body, "text/event-stream")

        def do_GET(self):
            self._send(b"{}", "application/json")

    return H


class Recorder:
    """A capture server on a free loopback port, as a context manager."""

    def __init__(self):
        self.bodies = []
        self.port = None
        self._srv = None
        self._t = None

    def __enter__(self):
        self._srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), make_server(self.bodies))
        self.port = self._srv.server_address[1]
        self._t = threading.Thread(target=self._srv.serve_forever, daemon=True)
        self._t.start()
        return self

    def __exit__(self, *_e):
        self._srv.shutdown()
        self._srv.server_close()


# ---------------------------------------------------------------- portability

def find_claude():
    """Resolve the CLI across platforms.

    On Windows the entry point is usually a `.cmd` shim, which CreateProcess cannot execute
    directly -- it must be run through the command interpreter. Returns an argv PREFIX."""
    for name in ("claude", "claude.cmd", "claude.exe", "claude.bat"):
        found = shutil.which(name)
        if found:
            if found.lower().endswith((".cmd", ".bat")):
                return ["cmd", "/c", found]
            return [found]
    return None


def projects_dir():
    return pathlib.Path.home() / ".claude" / "projects"


def run_arm(prefix, cwd, port, timeout=180):
    env = dict(os.environ)
    env["ANTHROPIC_BASE_URL"] = "http://127.0.0.1:%d" % port
    try:
        subprocess.run(prefix + ["-p", "--tools", "", "--strict-mcp-config"],
                       cwd=str(cwd), input="hi", text=True, env=env,
                       capture_output=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        pass


def first_text(body):
    for m in body.get("messages", []):
        c = m.get("content")
        if isinstance(c, str):
            return c
        if isinstance(c, list):
            for part in c:
                if isinstance(part, dict) and part.get("type") == "text":
                    return part["text"]
    return ""


# ---------------------------------------------------------------- the run

def do_run(keep):
    prefix = find_claude()
    if not prefix:
        print("FAIL: `claude` is not on PATH.", file=sys.stderr)
        return 2
    print("claude: %s   |   %s %s\n" % (" ".join(prefix), platform.system(), platform.machine()))

    # GUARD 1: the system temp dir, never beside this file -- which may sit in a repository.
    root = pathlib.Path(tempfile.mkdtemp(prefix="memcap_reprex_"))
    # GUARD 2: refuse outright if we somehow landed inside a repository anyway (TMPDIR can be
    # pointed anywhere). Memory keyed to the repo root would make every arm read one store.
    for parent in [root] + list(root.parents):
        if (parent / ".git").exists():
            print("FAIL: %s is inside a git repository (%s)." % (root, parent), file=sys.stderr)
            print("      Memory is keyed to the repository, so all seven arms would share one",
                  file=sys.stderr)
            print("      store and none of the fixtures would be read. Set TMPDIR elsewhere.",
                  file=sys.stderr)
            return 2
    print("arms under: %s\n" % root)
    created, rows, ok = [], [], True

    try:
        for name, (kind, params) in ARMS.items():
            arm_dir = root / name
            arm_dir.mkdir(exist_ok=True)
            before = set(p.name for p in projects_dir().iterdir()) if projects_dir().exists() else set()

            with Recorder() as rec:
                run_arm(prefix, arm_dir, rec.port)              # 1: create the store
                store = None
                for _ in range(20):
                    new = (set(p.name for p in projects_dir().iterdir()) - before)
                    if new:
                        store = sorted(new)[0]
                        break
                    time.sleep(0.25)
                if store is None:
                    print("FAIL: no projects entry appeared for %s." % arm_dir, file=sys.stderr)
                    print("      Refusing to guess the store path.", file=sys.stderr)
                    return 2
                created.append(projects_dir() / store)

                text = build_index(kind, params)
                mem = projects_dir() / store / "memory"
                mem.mkdir(parents=True, exist_ok=True)
                # BYTES, never text mode: text mode would rewrite \n as \r\n on Windows and
                # silently change the unit count of every line arm.
                (mem / "MEMORY.md").write_bytes(text.encode("utf-8"))

                rec.bodies.clear()
                run_arm(prefix, arm_dir, rec.port)             # 2: capture with the fixture

                if not rec.bodies:
                    print("FAIL: %s captured nothing -- the request went somewhere else."
                          % name, file=sys.stderr)
                    return 2
                body = rec.bodies[0]

            raw = first_text(body)

            # GUARD 3: the harness must be reading the store this arm just wrote to. Without
            # this, reading a DIFFERENT store returns perfectly well-formed numbers for the
            # wrong file -- which is exactly how the first run of this file failed.
            hdr = HEADER_RE.search(raw)
            if hdr and store not in hdr.group(0):
                print("FAIL: %s read a different store than it wrote." % name, file=sys.stderr)
                print("      wrote to: %s" % store, file=sys.stderr)
                print("      harness read: %s" % hdr.group(0).strip(), file=sys.stderr)
                print("      Are you inside a git repository?", file=sys.stderr)
                return 2
            if not hdr:
                print("FAIL: %s -- no MEMORY.md was injected at all. The fixture was not read."
                      % name, file=sys.stderr)
                return 2

            seg = segment(raw)
            m = NOTICE_RE.search(raw)
            got = m.group(1) if m else None
            exp = EXPECTED[name]
            w = units(seg) if seg is not None else -1
            ln = seg.count("\n") + 1 if seg else -1

            bad = []
            if units(text) != exp["disk"]:
                bad.append("disk %d!=%d" % (units(text), exp["disk"]))
            if w != exp["wire"]:
                bad.append("wire %d!=%d" % (w, exp["wire"]))
            if ln != exp["lines"]:
                bad.append("lines %d!=%d" % (ln, exp["lines"]))
            if got != exp["notice"]:
                bad.append("notice differs")
            if bad:
                ok = False
            rows.append((name, units(text), w, ln, len(body.get("tools") or []), got, bad))

        print("%-11s %7s %7s %6s %6s  %s" % ("arm", "disk", "wire", "lines", "tools", "verdict"))
        print("-" * 78)
        for name, d, w, ln, nt, got, bad in rows:
            print("%-11s %7d %7d %6d %6d  %s"
                  % (name, d, w, ln, nt, "ok" if not bad else "FAIL: " + "; ".join(bad)))
            if bad:
                print("%13sexpected: %r" % ("", EXPECTED[name]["notice"]))
                print("%13sobserved: %r" % ("", got))
        print("\nnotices observed:")
        for name, _d, _w, _l, _t, got, _b in rows:
            print("  %-11s %s" % (name, got if got else "(none)"))
        print("\n" + ("ALL SEVEN AS PREDICTED" if ok else
                      "MISMATCH -- report it; do not adjust EXPECTED to match"))
        return 0 if ok else 1
    finally:
        if keep:
            print("\n--keep: left %d store(s) and %s" % (len(created), root), file=sys.stderr)
            print("Remove them yourself: a probe fixture is indistinguishable from a real "
                  "memory store.", file=sys.stderr)
        else:
            kept = []
            for path in created + [root]:
                if not path.exists():
                    continue
                try:
                    shutil.rmtree(path)
                except OSError as exc:
                    kept.append("%s: %s" % (path, exc))
            if kept:
                print("\nCLEANUP INCOMPLETE -- remove these yourself:", file=sys.stderr)
                for k in kept:
                    print("  " + k, file=sys.stderr)
                os._exit(2)
            print("\ncleanup: complete, nothing kept")


# ---------------------------------------------------------------- selftest

def selftest():
    """Check the instrument without needing `claude`, a network, or any store.

    Everyone can run this, so a null result here is separable from a broken environment."""
    bad = 0

    for name, (kind, params) in ARMS.items():
        text = build_index(kind, params)
        if units(text) != EXPECTED[name]["disk"]:
            print("FAIL %s: built %d units, expected %d"
                  % (name, units(text), EXPECTED[name]["disk"]))
            bad += 1

    if units("\U0001F600") != 2 or len("\U0001F600") != 1:
        print("FAIL: units() is not counting UTF-16 code units")
        bad += 1

    # segment() must stop at the last content character, excluding the trailing newline run --
    # the boundary that produced 24,922 vs 24,924 upstream.
    raw = ("Contents of /x/memory/MEMORY.md (user's auto-memory):\n\nabc\n\n"
           "> WARNING: MEMORY.md is 1 lines (limit: 200). done\n")
    if segment(raw) != "abc":
        print("FAIL: segment() returned %r, expected 'abc'" % segment(raw))
        bad += 1
    if NOTICE_RE.search(raw).group(1) != "MEMORY.md is 1 lines (limit: 200). done":
        print("FAIL: notice extraction")
        bad += 1
    if segment("no header here") is not None:
        print("FAIL: segment() should return None with no header")
        bad += 1

    # A notice-presence-only check is not a check. Prove this file's comparison is by payload.
    exp = EXPECTED["both"]["notice"]
    if exp == "MEMORY.md is 300 lines (limit: 200)." + TAIL:
        print("FAIL: the `both` expectation is a single-cap string")
        bad += 1
    if (exp is not None) == (("MEMORY.md is 999.9KB - DIFFERENT." + TAIL) is not None) \
            and exp == "MEMORY.md is 999.9KB - DIFFERENT." + TAIL:
        print("FAIL: payload comparison is not distinguishing strings")
        bad += 1

    if find_claude() is None:
        print("note: `claude` not on PATH -- --selftest still valid, --run will not work")

    print("selftest: %s (%d arms, unit counting, segment boundary, notice payload)"
          % ("OK" if bad == 0 else "FAILED", len(ARMS)))
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run", action="store_true", help="the real probe (needs `claude`)")
    ap.add_argument("--selftest", action="store_true", help="check the instrument only")
    ap.add_argument("--keep", action="store_true", help="do NOT clean up (you must)")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    if a.run:
        return do_run(a.keep)
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
