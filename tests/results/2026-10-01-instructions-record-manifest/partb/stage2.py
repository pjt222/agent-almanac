#!/usr/bin/env python3
"""Part B, stage 2: arms 1-4 in one session, scored against the declared P1/P2/P3.

Imports the recorder and helpers from stage1.py. Request bodies stay in memory; only derived facts
are printed. Cleanup is fail-closed unless --keep.
"""
import json, os, pathlib, re, shutil, sys, tempfile, uuid
from urllib.parse import urlsplit

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stage1 import Recorder, run_claude, SCRATCH, PROJECTS, remove_session_residue  # noqa: E402

PREAMBLES = ("Codebase and user instructions are shown below",
             "Instruction files were re-read after the conversation was compacted",
             "Instruction files were re-read when this session started")
LABEL_TO_TYPE = {"user's private global instructions for all projects": "User",
                 "project instructions, checked into the codebase": "Project",
                 "user's private project instructions, not checked in": "Local",
                 "user's auto-memory, persists across conversations": "AutoMem"}
HEADER = re.compile(r"(?m)^Contents of (?P<path>/[^\n]*?)(?: \((?P<label>[^)\n]*)\))?:\n\n")


def message_texts(message):
    content = message.get("content")
    if isinstance(content, str):
        return [content]
    return [p["text"] for p in (content or []) if isinstance(p, dict) and p.get("type") == "text"]


def slice_blocks(text):
    """Instruction blocks in one text part: {(type, path): content}, plus a fail-closed flag and preambles seen."""
    blocks, ok, preambles = {}, True, []
    for reminder in re.findall(r"<system-reminder>\n(.*?)\n</system-reminder>", text, re.S):
        first = reminder.split("\n", 1)[0]
        if first.startswith("Contents of /"):
            continue
        if not first.startswith(PREAMBLES):
            if re.search(r"(?m)^Contents of /", reminder):
                ok = False
            continue
        preambles.append(first[:60])
        headers = list(HEADER.finditer(reminder))
        for index, header in enumerate(headers):
            end = headers[index + 1].start() if index + 1 < len(headers) else len(reminder)
            block = reminder[header.end():end]
            if index + 1 < len(headers):
                if not block.endswith("\n\n"):
                    ok = False
                block = block[:-2]
            kind = LABEL_TO_TYPE.get(header.group("label"))
            ok = ok and kind is not None
            blocks[(kind, header.group("path"))] = block
    return blocks, ok, preambles


def transcript_lines(transcript):
    return sum(1 for _ in open(transcript, "rb")) if transcript.exists() else 0


def new_records(transcript, after_line):
    out, boundaries = [], []
    for line_number, raw in enumerate(open(transcript, "rb"), 1):
        if line_number <= after_line:
            continue
        record = json.loads(raw)
        if record.get("subtype") == "compact_boundary":
            boundaries.append((record.get("compactMetadata") or {}).get("trigger"))
        attachment = record.get("attachment")
        if isinstance(attachment, dict) and attachment.get("type") == "instructions":
            out.append({"tagged": "reason" in attachment or "changed" in attachment, "reason": attachment.get("reason"),
                        "files": {(f["type"], f["path"]): f.get("content") for f in attachment["files"]},
                        "rendered": (record.get("rendered") or [{}])[0].get("content")})
    return out, boundaries


def select_bn(requests, prompt):
    hits = []
    for method, path, body in requests:
        if method != "POST" or urlsplit(path).path != "/v1/messages" or not body or not body.get("messages"):
            continue
        users = [m for m in body["messages"] if m.get("role") == "user"]
        if users and any(t == prompt for t in message_texts(users[-1])):
            hits.append(body)
    return hits


def score(arm, records, bn, previous_count, after_compaction, delivered_before=frozenset()):
    """Return a dict of facts for one arm turn."""
    messages = bn["messages"]
    added = messages if (previous_count is None or after_compaction) else messages[previous_count:]
    added_blocks, ok, preambles = {}, True, []
    for message in added:
        for text in message_texts(message):
            blocks, part_ok, seen = slice_blocks(text)
            added_blocks.update(blocks)
            ok = ok and part_ok
            preambles += seen
    whole_blocks = {}
    for message in messages:
        for text in message_texts(message):
            whole_blocks.update(slice_blocks(text)[0])
    system_parts = bn.get("system") or []
    system_text = " ".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in system_parts) if isinstance(system_parts, list) else str(system_parts)
    facts = {"arm": arm, "contents_in_system": "Contents of /" in system_text, "messages": len(messages), "added_messages": len(added), "slicer_ok": ok,
             "added_types": sorted(k[0] for k in added_blocks), "added_preambles": preambles,
             "records": [("tagged:" + str(r["reason"])) if r["tagged"] else "untagged" for r in records]}
    if not records:
        facts["verdict"] = "NO_RECORD" + (" (unrecorded delivery: " + ",".join(sorted(k[0] for k in added_blocks)) + ")" if added_blocks else "")
        return facts
    if len(records) > 1:
        facts["verdict"] = f"MULTIPLE_RECORDS ({len(records)})"
        return facts
    record = records[0]
    record_keys = set(record["files"])
    p1_or_p2 = record_keys == set(added_blocks)
    p3 = all(added_blocks.get(k) == v for k, v in record["files"].items())
    wire_texts = [t for m in messages for t in message_texts(m)]
    if record["rendered"] is None:
        rendered_on_wire = "no rendered field"
    elif any(record["rendered"] == t for t in wire_texts):
        rendered_on_wire = "exact"
    elif any(record["rendered"] + "\n" == t for t in wire_texts):
        rendered_on_wire = "exact up to one trailing newline"
    else:
        rendered_on_wire = "ABSENT"
    facts.update({"record_types": sorted(k[0] for k in record_keys), "P1" if not record["tagged"] else "P2": p1_or_p2,
                  "P3": p3, "rendered_on_wire": rendered_on_wire})
    if record["tagged"]:
        # files delivered earlier in this session (by any earlier record) that this record leaves out:
        # each must still be present somewhere in the request, or the model has lost it
        omitted = sorted(k for k in delivered_before if k not in record_keys)
        facts["P2_omitted"] = [k[0] for k in omitted]
        facts["P2_omitted_still_live"] = all(k in whole_blocks for k in omitted) if omitted else "nothing omitted"
        facts["P2_second_half_trivial"] = not after_compaction
    return facts


def main(keep):
    SCRATCH.mkdir(parents=True, exist_ok=True)
    root = pathlib.Path(tempfile.mkdtemp(prefix="arms_", dir=SCRATCH))
    for parent in list(root.parents):
        for name in (".git", "CLAUDE.md", "CLAUDE.local.md"):
            if (parent / name).exists():
                sys.exit(f"REFUSE: ancestor {parent / name} exists")
    created, results = [], []
    try:
        arm_dir = root / "arm"
        arm_dir.mkdir()
        before = {p.name for p in PROJECTS.iterdir()}
        with Recorder() as rec:
            run_claude(arm_dir, rec.port, "hi", [])                               # arm 0: bootstrap
            new = sorted({p.name for p in PROJECTS.iterdir()} - before)
            if len(new) != 1:
                sys.exit("REFUSE: expected exactly one new store")
            store = PROJECTS / new[0]
            created.append(store)
            index = store / "memory" / "MEMORY.md"
            index.parent.mkdir(exist_ok=True)
            index.write_bytes(b"- IDX-A canary index line")
            (arm_dir / "CLAUDE.md").write_bytes(b"PRJ-A canary project rules")
            session = str(uuid.uuid4())
            transcript = store / f"{session}.jsonl"
            previous_count = None

            plan = [
                ("1 fresh start", "p-arm1", ["--session-id", session], None),
                ("2 resume, nothing changed", "p-arm2", ["--resume", session], None),
                ("3 index -> IDX-B, resume", "p-arm3", ["--resume", session], lambda: index.write_bytes(b"- IDX-B canary index line")),
                ("4a /compact", "/compact", ["--resume", session], None),
                ("4b resume after compaction", "p-arm4b", ["--resume", session], None),
                ("4c index -> IDX-C, resume", "p-arm4c", ["--resume", session], lambda: index.write_bytes(b"- IDX-C canary index line")),
                ("4d project -> PRJ-B, resume", "p-arm4d", ["--resume", session], lambda: (arm_dir / "CLAUDE.md").write_bytes(b"PRJ-B canary project rules")),
            ]
            after_compaction = False
            delivered = set()
            for arm, prompt, extra, mutate in plan:
                if mutate:
                    mutate()
                lines_before = transcript_lines(transcript)
                rec.requests.clear()
                code, seconds, out = run_claude(arm_dir, rec.port, prompt, extra)
                records, boundaries = new_records(transcript, lines_before)
                paths = [(m, p) for m, p, _ in rec.requests]
                if arm.startswith("4a"):
                    results.append({"arm": arm, "exit": code, "requests": paths, "boundaries": boundaries,
                                    "records": [("tagged:" + str(r["reason"])) if r["tagged"] else "untagged" for r in records],
                                    "verdict": "GATE 2 " + ("PASS" if boundaries else "FAIL (no compact_boundary)")})
                    after_compaction = bool(boundaries)
                    previous_count = None
                    continue
                bns = select_bn(rec.requests, prompt)
                if len(bns) != 1:
                    results.append({"arm": arm, "exit": code, "requests": paths, "verdict": f"FAIL_CLOSED (Bn count {len(bns)})"})
                    continue
                facts = score(arm, records, bns[0], previous_count, after_compaction, frozenset(delivered))
                for r in records:
                    delivered |= set(r["files"])
                facts.update({"exit": code, "requests": len(paths), "canaries": {c: any(c in t for m in bns[0]["messages"] for t in message_texts(m))
                              for c in ("IDX-A", "IDX-B", "IDX-C", "PRJ-A", "PRJ-B")}})
                results.append(facts)
                previous_count = len(bns[0]["messages"])
                after_compaction = False
    finally:
        for facts in results:
            print(json.dumps(facts))
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
