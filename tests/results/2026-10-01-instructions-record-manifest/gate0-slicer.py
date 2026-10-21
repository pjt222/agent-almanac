#!/usr/bin/env python3
"""
gate0-slicer.py -- REPLICATION.md Part B, GATE 0: validate the declared block slicer on the corpus.

For every `instructions` record that carries a top-level `rendered` array, slice the rendered
reminder exactly as Part B declares (three instructions preambles; anchored header regex ending
in ':\\n\\n'; blocks separated by '\\n\\n'; label -> type map) and require the sliced (type, path)
set and contents to equal the record's files[] byte for byte. Read-only, stdlib only.

    python3 gate0-slicer.py --exclude-session ID --until 2026-10-01T20:30:00Z
"""
import argparse, glob, json, os, re, sys
from collections import Counter

PREAMBLES = ("Codebase and user instructions are shown below",
             "Instruction files were re-read after the conversation was compacted",
             "Instruction files were re-read when this session started")
LABEL_TO_TYPE = {"user's private global instructions for all projects": "User",
                 "project instructions, checked into the codebase": "Project",
                 "user's private project instructions, not checked in": "Local",
                 "user's auto-memory, persists across conversations": "AutoMem"}
HEADER = re.compile(r"(?m)^Contents of (?P<path>/[^\n]*?)(?: \((?P<label>[^)\n]*)\))?:\n\n")


def slice_reminders(content):
    """Return ({(type, path): block}, ok). ok=False on any fail-closed condition."""
    sliced, ok = {}, True
    for reminder in re.findall(r"<system-reminder>\n(.*?)\n</system-reminder>", content, re.S):
        first = reminder.split("\n", 1)[0]
        if first.startswith("Contents of /"):
            continue                                   # nested_memory shape
        if not first.startswith(PREAMBLES):
            if re.search(r"(?m)^Contents of /", reminder):
                ok = False                             # unknown preamble carrying file blocks
            continue
        headers = list(HEADER.finditer(reminder))
        for index, header in enumerate(headers):
            end = headers[index + 1].start() if index + 1 < len(headers) else len(reminder)
            block = reminder[header.end():end]
            if index + 1 < len(headers):
                if not block.endswith("\n\n"):
                    ok = False
                block = block[:-2]
            kind = LABEL_TO_TYPE.get(header.group("label"))
            if kind is None:
                ok = False
            sliced[(kind, header.group("path"))] = block
    return sliced, ok


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=os.path.expanduser("~/.claude/projects"))
    parser.add_argument("--exclude-session", action="append", default=[])
    parser.add_argument("--until")
    args = parser.parse_args()
    paths = glob.glob(os.path.join(args.root, "*", "*.jsonl")) + glob.glob(os.path.join(args.root, "*", "*", "subagents", "**", "*.jsonl"), recursive=True)
    outcome = Counter()
    for path in paths:
        if any(session in os.path.relpath(path, args.root).split(os.sep)[1] for session in args.exclude_session):
            continue
        for raw in open(path, "rb"):
            if b'"rendered"' not in raw or b'"instructions"' not in raw:
                continue
            record = json.loads(raw)
            attachment = record.get("attachment")
            if not (isinstance(attachment, dict) and attachment.get("type") == "instructions" and isinstance(record.get("rendered"), list)):
                continue
            if args.until and (record.get("timestamp") or "") > args.until:
                continue
            sliced, ok = slice_reminders(record["rendered"][0]["content"])
            wanted = {(f["type"], f["path"]): f.get("content") for f in attachment["files"]}
            outcome["pass" if ok and sliced == wanted else "FAIL"] += 1
    print(f"GATE 0: {outcome['pass']} of {outcome['pass'] + outcome['FAIL']} records pass")
    return 0 if outcome["FAIL"] == 0 and outcome["pass"] > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
