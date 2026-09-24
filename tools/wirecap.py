#!/usr/bin/env python3
"""
Capture the request body a Claude Code session actually sends, without asking the model
anything about itself.

WHY THIS EXISTS
---------------
The auto-memory cap work (agent-almanac #407, #717, #722) established that a session's
self-report about its own context is unsound in BOTH directions -- it returned `NONE` for an
index that behavioural probing proved had loaded, and elsewhere volunteered an accurate
"truncated on load". A failure with no consistent sign cannot be corrected for, so any
question of the form "is X present in the context?" must be answered by reading the wire,
never by asking the model.

This is the cheapest channel from `skills/conduct-empirical-wire-capture` Step 1 that
captures a request body: point `ANTHROPIC_BASE_URL` at this server, and it records the
whole POST body to a JSONL file and answers with a canned, well-formed SSE reply so the
client exits cleanly instead of retrying.

The captured body is the ENTIRE context the client assembled -- system prompt, injected
memory index, hook attachments, the lot. Differencing two captures that vary in exactly one
input is therefore a controlled read-out that needs no advance guess at what string to grep
for.

SCOPE AND ETHICS
----------------
Per `skills/conduct-empirical-wire-capture`: this captures YOUR OWN requests, from YOUR OWN
machine, against YOUR OWN account. Credential headers are redacted AT CAPTURE TIME -- they
are never written to disk, not even once. The request is answered locally and is NOT
forwarded anywhere, so nothing leaves the machine at all.

USAGE
-----
    python3 tools/wirecap.py --port 8787 --out capture.jsonl     # run the server
    python3 tools/wirecap.py --verify                            # self-test, exit non-zero on failure

    # in another shell -- the assignment goes on `claude`, NEVER in front of a pipeline
    printf '%s' 'hello' | ANTHROPIC_BASE_URL=http://127.0.0.1:8787 \
      claude -p --tools "" --strict-mcp-config

    # WHY THE ORDER MATTERS. `VARS printf '%s' hi | claude -p ...` applies the assignments to
    # `printf` ONLY -- they never reach `claude`. The capture then stays empty, the real API
    # answers, and any fixture written for the run lands in a LIVE memory store. Measured:
    # `FOO=bar printf x | sh -c 'echo ${FOO:-UNSET}'` prints UNSET. This exact form was
    # published in this docstring until 2026-08-26 and is the cause of a false finding
    # upstream, reported as "a nested session ignores the isolation variables" and retracted
    # the same day (anthropics/claude-code#82056, comment 5424142726). Calling from Python,
    # pass `env=` to subprocess and the shape cannot occur at all.

Then difference two captures:

    python3 tools/wirecap.py --diff over.jsonl under.jsonl
"""
import argparse
import http.server
import json
import os
import socket
import sys
import threading
import time
import urllib.request

# Headers whose values are secrets. Redacted before anything is written to disk.
SECRET_HEADERS = {
    "authorization",
    "x-api-key",
    "anthropic-auth-token",
    "proxy-authorization",
    "cookie",
    "set-cookie",
}
REDACTED = "<redacted-at-capture-time>"

# A minimal well-formed streaming reply. The client only has to be able to parse this and
# exit; the content is irrelevant to the measurement.
SSE_EVENTS = [
    ("message_start", {
        "type": "message_start",
        "message": {
            "id": "msg_wirecap", "type": "message", "role": "assistant",
            "model": "claude-wirecap", "content": [],
            "stop_reason": None, "stop_sequence": None,
            "usage": {"input_tokens": 1, "output_tokens": 1},
        },
    }),
    ("content_block_start", {
        "type": "content_block_start", "index": 0,
        "content_block": {"type": "text", "text": ""},
    }),
    ("content_block_delta", {
        "type": "content_block_delta", "index": 0,
        "delta": {"type": "text_delta", "text": "WIRECAP"},
    }),
    ("content_block_stop", {"type": "content_block_stop", "index": 0}),
    ("message_delta", {
        "type": "message_delta",
        "delta": {"stop_reason": "end_turn", "stop_sequence": None},
        "usage": {"output_tokens": 1},
    }),
    ("message_stop", {"type": "message_stop"}),
]


def redact_headers(raw_items):
    """Drop secret header VALUES before they can reach disk. Names are kept -- knowing that
    an `authorization` header was present is useful and is not itself a secret."""
    out = {}
    for name, value in raw_items:
        out[name.lower()] = REDACTED if name.lower() in SECRET_HEADERS else value
    return out


def make_handler(out_path, counter):
    class Handler(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *_args):
            pass  # the JSONL file is the log

        def _record(self, body_bytes):
            counter["n"] += 1
            try:
                body = json.loads(body_bytes.decode("utf-8"))
                parsed = True
            except Exception:
                body = body_bytes.decode("utf-8", "replace")
                parsed = False
            record = {
                "seq": counter["n"],
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "method": self.command,
                "path": self.path,
                "headers": redact_headers(self.headers.items()),
                "body_bytes": len(body_bytes),
                "body_parsed": parsed,
                "body": body,
            }
            with open(out_path, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(record, ensure_ascii=False) + "\n")

        def _read_body(self):
            length = int(self.headers.get("content-length") or 0)
            return self.rfile.read(length) if length else b""

        def do_POST(self):
            body_bytes = self._read_body()
            self._record(body_bytes)

            if self.path.rstrip("/").endswith("count_tokens"):
                payload = json.dumps({"input_tokens": 1}).encode()
                self.send_response(200)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            chunks = []
            for name, data in SSE_EVENTS:
                chunks.append(
                    f"event: {name}\ndata: {json.dumps(data)}\n\n".encode("utf-8")
                )
            payload = b"".join(chunks)
            self.send_response(200)
            self.send_header("content-type", "text/event-stream")
            self.send_header("cache-control", "no-cache")
            self.send_header("content-length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def do_GET(self):
            self._record(b"")
            payload = b"{}"
            self.send_response(200)
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    return Handler


def serve(port, out_path, ready=None):
    counter = {"n": 0}
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", port), make_handler(out_path, counter)
    )
    if ready is not None:
        ready(server)
    server.serve_forever()


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def load(path):
    with open(path, encoding="utf-8") as fh:
        return [json.loads(line) for line in fh if line.strip()]


def texts_of(record):
    """Every string the client put in this request, flattened, with a path label.

    A truncation notice could arrive as a system block, a user block, a hook attachment or a
    bare string, and the point of a differential capture is not to know in advance. So walk
    the whole body rather than the fields we happen to expect."""
    found = []

    def walk(node, path):
        if isinstance(node, str):
            found.append((path, node))
        elif isinstance(node, dict):
            for key, value in node.items():
                walk(value, f"{path}.{key}")
        elif isinstance(node, list):
            for index, value in enumerate(node):
                walk(value, f"{path}[{index}]")

    walk(record.get("body"), "body")
    return found


def diff(path_a, path_b):
    """Strings present in A and absent from B, and vice versa.

    Compared as whole strings AND as lines, because a notice injected into an existing block
    changes that block's text wholesale while adding only one line."""
    recs_a, recs_b = load(path_a), load(path_b)

    def lines_of(recs):
        out = set()
        for rec in recs:
            for _path, text in texts_of(rec):
                for line in text.splitlines():
                    if line.strip():
                        out.add(line.rstrip())
        return out

    lines_a, lines_b = lines_of(recs_a), lines_of(recs_b)
    only_a = sorted(lines_a - lines_b)
    only_b = sorted(lines_b - lines_a)

    print(f"A = {path_a}  ({len(recs_a)} request(s), {len(lines_a)} distinct lines)")
    print(f"B = {path_b}  ({len(recs_b)} request(s), {len(lines_b)} distinct lines)")
    print(f"\n--- lines only in A ({len(only_a)}) ---")
    for line in only_a:
        print(f"  A| {line[:400]}")
    print(f"\n--- lines only in B ({len(only_b)}) ---")
    for line in only_b:
        print(f"  B| {line[:400]}")
    return only_a, only_b


def verify():
    """Self-test: does this tool capture a body verbatim, and does it refuse to write a
    credential to disk? Both are properties the measurement depends on."""
    failures = []
    port = free_port()
    out_path = os.path.join(
        os.environ.get("TMPDIR", "/tmp"), f"wirecap-verify-{port}.jsonl"
    )
    if os.path.exists(out_path):
        os.remove(out_path)

    holder = {}
    thread = threading.Thread(
        target=serve, args=(port, out_path, lambda srv: holder.setdefault("srv", srv)),
        daemon=True,
    )
    thread.start()
    for _ in range(100):
        if "srv" in holder:
            break
        time.sleep(0.02)
    if "srv" not in holder:
        print("FAIL: server did not start")
        return 1

    secret = "sk-ant-THIS-MUST-NOT-REACH-DISK"
    needle = "PINEAPPLE-QUASAR-7731"
    payload = json.dumps({
        "model": "m", "stream": True,
        "system": [{"type": "text", "text": f"marker {needle}"}],
        "messages": [{"role": "user", "content": "hi"}],
    }).encode()
    request = urllib.request.Request(
        f"http://127.0.0.1:{port}/v1/messages",
        data=payload,
        headers={
            "content-type": "application/json",
            "authorization": f"Bearer {secret}",
            "x-api-key": secret,
            "user-agent": "wirecap-verify",
        },
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode()
    holder["srv"].shutdown()

    if "message_stop" not in body:
        failures.append("canned SSE reply did not contain message_stop")

    raw = open(out_path, encoding="utf-8").read()

    # 1. The body must be captured verbatim.
    if needle not in raw:
        failures.append("captured file does not contain the planted body needle")

    # 2. A credential must never be written, not once, in any header.
    if secret in raw:
        failures.append("SECRET LEAKED TO DISK -- redaction failed")

    records = load(out_path)
    if len(records) != 1:
        failures.append(f"expected 1 captured record, got {len(records)}")
    else:
        rec = records[0]
        if rec["headers"].get("authorization") != REDACTED:
            failures.append("authorization header was not redacted")
        if rec["headers"].get("x-api-key") != REDACTED:
            failures.append("x-api-key header was not redacted")
        if rec["headers"].get("user-agent") != "wirecap-verify":
            failures.append("a non-secret header was lost")
        if not rec["body_parsed"]:
            failures.append("JSON body was not parsed")
        flat = dict(texts_of(rec))
        if not any(needle in text for text in flat.values()):
            failures.append("texts_of() did not surface the planted needle")

    # 3. diff() must report an added line and must not invent one.
    other = out_path + ".other"
    with open(other, "w", encoding="utf-8") as fh:
        rec = json.loads(raw.splitlines()[0])
        rec["body"]["system"][0]["text"] = "marker"
        fh.write(json.dumps(rec) + "\n")
    only_a, only_b = diff(out_path, other)
    if not any(needle in line for line in only_a):
        failures.append("diff() failed to report a line present only in A")
    if only_b != ["marker"]:
        failures.append(f"diff() B-side wrong: {only_b}")

    os.remove(out_path)
    os.remove(other)

    print()
    if failures:
        for item in failures:
            print(f"FAIL: {item}")
        return 1
    print("wirecap --verify: OK (capture verbatim, credentials redacted, diff reports both sides)")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--out", default="capture.jsonl")
    parser.add_argument("--verify", action="store_true")
    parser.add_argument("--diff", nargs=2, metavar=("A", "B"))
    args = parser.parse_args()

    if args.verify:
        return verify()
    if args.diff:
        diff(*args.diff)
        return 0

    print(f"wirecap listening on http://127.0.0.1:{args.port} -> {args.out}", flush=True)
    serve(args.port, args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
