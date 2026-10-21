#!/usr/bin/env python3
"""Part B, stage 1: arm 0 (bootstrap + fixtures) and arm 1 (fresh start). Prints raw facts only.

Run from anywhere outside a repository; arms go under $PARTB_ROOT or the system temp directory.

Request bodies stay in memory; only derived facts are printed. Cleanup is fail-closed unless --keep.
"""
import http.server, json, os, pathlib, re, shutil, subprocess, sys, tempfile, threading, time, uuid
from urllib.parse import urlsplit

SCRATCH = pathlib.Path(os.environ.get("PARTB_ROOT") or tempfile.gettempdir())   # arms go here; never inside a repository
SESSIONS = []   # every session id an arm creates, so cleanup can remove its session-env entry
PROJECTS = pathlib.Path.home() / ".claude" / "projects"
SSE = [
    ("message_start", {"type": "message_start", "message": {"id": "msg_partb", "type": "message", "role": "assistant",
     "model": "partb", "content": [], "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1}}}),
    ("content_block_start", {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}),
    ("content_block_delta", {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "OK"}}),
    ("content_block_stop", {"type": "content_block_stop", "index": 0}),
    ("message_delta", {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None}, "usage": {"output_tokens": 1}}),
    ("message_stop", {"type": "message_stop"}),
]


class Recorder:
    def __init__(self):
        self.requests = []

    def __enter__(self):
        sink = self.requests

        class Handler(http.server.BaseHTTPRequestHandler):
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
                length = int(self.headers.get("content-length") or 0)
                raw = self.rfile.read(length) if length else b""
                try:
                    body = json.loads(raw.decode("utf-8"))
                except Exception:
                    body = None
                sink.append(("POST", self.path, body))           # headers dropped: they carry the credential
                if urlsplit(self.path).path.rstrip("/").endswith("count_tokens"):
                    return self._send(json.dumps({"input_tokens": 1}).encode(), "application/json")
                self._send(b"".join(f"event: {k}\ndata: {json.dumps(v)}\n\n".encode() for k, v in SSE), "text/event-stream")

            def do_GET(self):
                sink.append(("GET", self.path, None))
                self._send(b"{}", "application/json")

        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        return self

    def __exit__(self, *_e):
        self.server.shutdown()
        self.server.server_close()


def run_claude(cwd, port, prompt, extra):
    if "--session-id" not in extra and "--resume" not in extra:
        extra = extra + ["--session-id", str(uuid.uuid4())]      # pin bootstraps too, so cleanup can find them
    if "--session-id" in extra:
        SESSIONS.append(extra[extra.index("--session-id") + 1])
    env = dict(os.environ, ANTHROPIC_BASE_URL=f"http://127.0.0.1:{port}")
    argv = ["claude", "-p", "--strict-mcp-config", "--tools", ""] + extra
    started = time.time()
    proc = subprocess.run(argv, cwd=str(cwd), input=prompt, text=True, env=env, capture_output=True, timeout=180)
    return proc.returncode, round(time.time() - started, 1), proc.stdout.strip()[:40]


def remove_session_residue():
    """Remove the empty ~/.claude/session-env/<id> dirs the arm sessions left. Never a non-empty one."""
    left = []
    for session in SESSIONS:
        path = pathlib.Path.home() / ".claude" / "session-env" / session
        if path.is_dir():
            try:
                path.rmdir()
            except OSError:
                left.append(str(path))
    return left


def instruction_records(transcript):
    out = []
    if not transcript.exists():
        return out
    for line_number, raw in enumerate(open(transcript, "rb"), 1):
        try:
            record = json.loads(raw)
        except Exception:
            continue
        attachment = record.get("attachment")
        if isinstance(attachment, dict) and attachment.get("type") == "instructions":
            out.append({"line": line_number, "tagged": "reason" in attachment, "reason": attachment.get("reason"),
                        "files": [(f["type"], f["path"]) for f in attachment["files"]],
                        "rendered": (record.get("rendered") or [{}])[0].get("content")})
    return out


def texts(body):
    for message in (body or {}).get("messages", []):
        content = message.get("content")
        if isinstance(content, str):
            yield message.get("role"), content
        elif isinstance(content, list):
            for part in content:
                if isinstance(part, dict) and part.get("type") == "text":
                    yield message.get("role"), part["text"]


def main(keep):
    SCRATCH.mkdir(parents=True, exist_ok=True)
    root = pathlib.Path(tempfile.mkdtemp(prefix="arms_", dir=SCRATCH))
    for parent in [root] + list(root.parents):
        for name in (".git", "CLAUDE.md", "CLAUDE.local.md"):
            if (parent / name).exists() and parent != root:
                sys.exit(f"REFUSE: ancestor {parent / name} exists")
    created = []
    try:
        arm = root / "arm"
        arm.mkdir()
        before = {p.name for p in PROJECTS.iterdir()}
        with Recorder() as rec:
            print("arm0 bootstrap:", run_claude(arm, rec.port, "hi", []))
            new = sorted({p.name for p in PROJECTS.iterdir()} - before)
            print("arm0 new store(s):", len(new))
            if len(new) != 1:
                sys.exit("REFUSE: expected exactly one new store")
            store = PROJECTS / new[0]
            created.append(store)
            print("arm0 bootstrap requests:", [(m, p) for m, p, _ in rec.requests])
            boot = sorted(store.glob("*.jsonl"))
            print("arm0 bootstrap transcripts:", len(boot), [len(instruction_records(t)) for t in boot])
            (store / "memory").mkdir(exist_ok=True)
            (store / "memory" / "MEMORY.md").write_bytes(b"- IDX-A canary index line")
            (arm / "CLAUDE.md").write_bytes(b"PRJ-A canary project rules")
            rec.requests.clear()

            session = str(uuid.uuid4())
            print("arm1 run:", run_claude(arm, rec.port, "arm1-prompt", ["--session-id", session]))
            transcript = store / f"{session}.jsonl"
            print("arm1 transcript exists:", transcript.exists())
            records = instruction_records(transcript)
            print("arm1 records:", [(r["line"], r["tagged"], r["reason"], [t for t, _ in r["files"]], r["rendered"] is not None) for r in records])
            print("arm1 requests:", [(m, p, bool(b and b.get("messages")), bool(b and b.get("stream"))) for m, p, b in rec.requests])
            for method, path, body in rec.requests:
                if method != "POST" or urlsplit(path).path != "/v1/messages" or not body:
                    continue
                last_user = [t for role, t in texts(body) if role == "user"]
                has_prompt = any(t == "arm1-prompt" for t in last_user)
                rendered_hits = [r["line"] for r in records if r["rendered"] and any(r["rendered"] == t for _, t in texts(body))]
                headers = [(m.group(2), m.group(1)) for _, t in texts(body) for m in re.finditer(r"(?m)^Contents of (/[^\n]*?)(?: \(([^)\n]*)\))?:\n\n", t)]
                in_system = any("Contents of /" in (s.get("text", "") if isinstance(s, dict) else str(s)) for s in (body.get("system") or []))
                print(f"  POST {path}: messages={len(body['messages'])} prompt_present={has_prompt} rendered_match_lines={rendered_hits} "
                      f"headers={[(lab, os.path.basename(pth)) for lab, pth in headers]} contents_in_system={in_system}")
                print("    store path on wire matches:", any(str(store) in pth for _, pth in headers))
                print("    canaries:", {c: any(c in t for _, t in texts(body)) for c in ("IDX-A", "PRJ-A")})
    finally:
        if keep:
            print("KEPT:", created, root)
        else:
            leftovers = []
            for path in created + [root]:
                try:
                    shutil.rmtree(path)
                except FileNotFoundError:
                    pass
                except OSError as error:
                    leftovers.append(f"{path}: {error}")
            leftovers += remove_session_residue()
            print("cleanup:", "complete" if not leftovers else f"INCOMPLETE {leftovers}")


if __name__ == "__main__":
    main("--keep" in sys.argv)
