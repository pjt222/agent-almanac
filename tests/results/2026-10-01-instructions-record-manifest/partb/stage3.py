#!/usr/bin/env python3
"""Part B, stage 3: arm 5, concurrent bursts. Per session: does the record agree with the wire about the index?

5a: N sessions created sequentially, index edited, then all N resumed at once.
5c: N fresh starts launched at once.
Outcomes per session: record-lacks/wire-has (unfaithful record), both-lack (delivery miss),
record-has/wire-lacks (unfaithful the other way), both-have, NO_RECORD (with what the wire added).
"""
import os, pathlib, shutil, sys, tempfile, uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stage1 import Recorder, run_claude, SCRATCH, PROJECTS, remove_session_residue  # noqa: E402
from stage2 import select_bn, new_records, transcript_lines, message_texts, slice_blocks  # noqa: E402

N = 6


def outcome(records, body, previous_count):
    messages = body["messages"]
    added = messages if previous_count is None else messages[previous_count:]
    added_types = set()
    for message in added:
        for text in message_texts(message):
            added_types |= {k[0] for k in slice_blocks(text)[0]}
    if not records:
        return f"NO_RECORD (wire added: {','.join(sorted(added_types)) or 'nothing'})"
    record = records[-1]
    record_has = any(k[0] == "AutoMem" for k in record["files"])
    wire_has = "AutoMem" in added_types
    shape = ("tagged:" + str(record["reason"])) if record["tagged"] else "untagged"
    label = {(False, True): "record-lacks/wire-has", (False, False): "both-lack",
             (True, False): "record-has/wire-lacks", (True, True): "both-have"}[(record_has, wire_has)]
    return f"{label} [{shape}{'' if len(records) == 1 else f', {len(records)} records'}]"


def main():
    root = pathlib.Path(tempfile.mkdtemp(prefix="arms_", dir=SCRATCH))
    for parent in list(root.parents):
        for name in (".git", "CLAUDE.md", "CLAUDE.local.md"):
            if (parent / name).exists():
                sys.exit(f"REFUSE: ancestor {parent / name} exists")
    created, tally = [], {"5a": Counter(), "5c": Counter()}
    try:
        arm_dir = root / "arm"
        arm_dir.mkdir()
        before = {p.name for p in PROJECTS.iterdir()}
        with Recorder() as rec:
            run_claude(arm_dir, rec.port, "hi", [])
            new = sorted({p.name for p in PROJECTS.iterdir()} - before)
            if len(new) != 1:
                sys.exit("REFUSE: expected exactly one new store")
            store = PROJECTS / new[0]
            created.append(store)
            index = store / "memory" / "MEMORY.md"
            index.parent.mkdir(exist_ok=True)
            index.write_bytes(b"- IDX-A canary index line")
            (arm_dir / "CLAUDE.md").write_bytes(b"PRJ-A canary project rules")

            # 5a: create N sessions sequentially, remember each first request's message count
            sessions, counts = [str(uuid.uuid4()) for _ in range(N)], {}
            for n, session in enumerate(sessions):
                rec.requests.clear()
                run_claude(arm_dir, rec.port, f"start-{n}", ["--session-id", session])
                bns = select_bn(rec.requests, f"start-{n}")
                counts[session] = len(bns[0]["messages"]) if len(bns) == 1 else None
            index.write_bytes(b"- IDX-B canary index line")
            lines = {s: transcript_lines(store / f"{s}.jsonl") for s in sessions}
            rec.requests.clear()
            with ThreadPoolExecutor(max_workers=N) as pool:
                list(pool.map(lambda pair: run_claude(arm_dir, rec.port, f"burst-{pair[0]}", ["--resume", pair[1]]), enumerate(sessions)))
            requests = list(rec.requests)
            for n, session in enumerate(sessions):
                bns = select_bn(requests, f"burst-{n}")
                if len(bns) != 1 or counts[session] is None:
                    tally["5a"][f"FAIL_CLOSED (Bn {len(bns)})"] += 1
                    continue
                records, _ = new_records(store / f"{session}.jsonl", lines[session])
                tally["5a"][outcome(records, bns[0], counts[session])] += 1

            # 5c: N fresh starts at once
            fresh = [str(uuid.uuid4()) for _ in range(N)]
            rec.requests.clear()
            with ThreadPoolExecutor(max_workers=N) as pool:
                list(pool.map(lambda pair: run_claude(arm_dir, rec.port, f"fresh-{pair[0]}", ["--session-id", pair[1]]), enumerate(fresh)))
            requests = list(rec.requests)
            for n, session in enumerate(fresh):
                bns = select_bn(requests, f"fresh-{n}")
                if len(bns) != 1:
                    tally["5c"][f"FAIL_CLOSED (Bn {len(bns)})"] += 1
                    continue
                records, _ = new_records(store / f"{session}.jsonl", 0)
                tally["5c"][outcome(records, bns[0], None)] += 1
    finally:
        for arm, counter in tally.items():
            print(arm, dict(counter))
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
    main()
