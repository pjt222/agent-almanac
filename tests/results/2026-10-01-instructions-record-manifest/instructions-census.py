#!/usr/bin/env python3
"""
instructions-census.py -- is a transcript `instructions` record a manifest of what loaded?

Read-only census of every `attachment.type == "instructions"` record in Claude Code transcripts.
Single file, Python 3.8+ (3.11+ for fractional seconds of any width), standard library only, no
network. Reads `~/.claude/projects/*/*.jsonl` and `~/.claude/projects/*/*/subagents/**/*.jsonl`,
and stats the user CLAUDE.md and the memory index files. Writes nothing except a temporary
fixture under --selftest.

    python3 instructions-census.py --selftest
    python3 instructions-census.py --exclude-session ID --until 2026-10-01T20:30:00Z --label-stores

WHY
---
anthropics/claude-code#82056. On recent builds (on the machine this was written on, from its
oldest surviving transcript, 2.1.258) the transcript records which instruction files the harness
delivered: `attachment.files[] = {type, path, content}`, type in {User, Project, Local, AutoMem}.
A record listing `User` but not `AutoMem` reads as a missed index delivery only if the record
lists everything that loaded. The read-outs:

  1. tag x User, per population  -- untagged {type, files} vs tagged {type, files, changed, reason};
                                    plus the first line of the reminder each record rendered
  2. delta test                  -- is every file a tagged record lists changed since its previous
                                    copy? For files it omits, are the copies before and after it
                                    identical (bracketed unchanged)?
  3. untagged omissions          -- does any untagged record drop a file an earlier record in the
                                    same transcript listed?
  4. compaction sequence         -- per population: what record follows each compact_boundary
                                    (including boundaries in transcripts with no record), and
                                    what boundary precedes each tagged record?
  5. gaps                        -- untagged records with User and no AutoMem, graded by evidence
  6. disk side                   -- was the user CLAUDE.md modified inside the window?

EVIDENCE GRADES FOR A GAP (strongest first)
-------------------------------------------
  created-after     a transcript holds a Write-tool result of type "create" for the index path,
                    stamped after the record, and none at or before it
  inode-after       the index's CURRENT inode was born after the record. A lower bound only:
                    Write and Edit can replace a file, which resets its birth time
  absent-no-create  no index on disk now, and no Write-tool create for it in the surviving,
                    non-excluded transcripts. Bash redirects, mv and lost transcripts are not
                    seen, so this grade needs a hand check before it is quoted
  UNEXPLAINED (...) anything else, including an undated record

TRAPS THIS GUARDS AGAINST (all hit by someone upstream)
-------------------------------------------------------
- The field is `record["attachment"]`, SINGULAR. Reading `attachments` returns a confident zero.
  The positive control refuses to print any count unless the same channel is seen delivering the
  index; --selftest proves it on a fixture that HAS records but no index.
- Records are absent before a point that differs between machines (a build or a date); an empty
  result means "no rail", not "loaded whole".
- Store paths: the AutoMem path the harness recorded is used where the transcript has one;
  otherwise the transcript's project folder (the slug fallback), which keys to the cwd while the
  store keys to the git toplevel (anthropics/claude-code#90046). Source counts are printed.
- Record counts include subagent transcripts, which mostly receive the same payloads as their
  session. Distinct (sessionId, payload) pairs are printed beside the raw counts.
- `instructions` is not the only channel: nested CLAUDE.md files arrive as `nested_memory`
  attachments. Their count is printed so "all instruction files" is never read into section 1.
- --label-stores replaces every project slug and cwd with an opaque label. --selftest asserts the
  labelled report contains no fixture slug, cwd or root path (and that the unlabelled one does).
  Errors under --label-stores print the exception type only, never a path.
"""
import argparse
import contextlib
import glob
import hashlib
import io
import json
import os
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from datetime import datetime

ATTACHMENT_FIELD = "attachment"  # singular. The selftest proves the plural is blind.


def to_epoch(timestamp):
    """ISO-8601 with an explicit offset or Z -> epoch seconds. Anything else -> None."""
    if not isinstance(timestamp, str):
        return None
    try:
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.timestamp() if parsed.tzinfo is not None else None


def birth_epoch(path):
    try:
        out = subprocess.run(["stat", "-c", "%W", "--", path], capture_output=True, text=True, check=True).stdout.strip()
        value = int(out)
        return value if value > 0 else None
    except Exception:
        return None


def digest(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]


def text_or_none(value):
    return value if isinstance(value, str) else None


MIN_EXCLUSION = 8


def excluded(transcript_path, root, excluded_sessions):
    """Match an exclusion against the SESSION only: a main transcript's file stem, or a subagent
    transcript's session folder. Never the root, the project folder or the 'subagents' folder."""
    parts = os.path.relpath(transcript_path, root).split(os.sep)
    session = os.path.splitext(parts[1])[0] if len(parts) >= 2 else ""
    return any(session.startswith(prefix) for prefix in excluded_sessions)


def load(root, excluded_sessions, attachment_field=ATTACHMENT_FIELD, until=None):
    short = [prefix for prefix in excluded_sessions if len(prefix) < MIN_EXCLUSION]
    if short:
        raise SystemExit(f"--exclude-session {short}: give at least {MIN_EXCLUSION} characters of a session id")
    until_epoch = to_epoch(until) if until else None
    if until and until_epoch is None:
        raise SystemExit(f"--until {until!r}: give an ISO time with Z or an offset")
    main_paths = sorted(glob.glob(os.path.join(root, "*", "*.jsonl")))
    subagent_paths = sorted(glob.glob(os.path.join(root, "*", "*", "subagents", "**", "*.jsonl"), recursive=True))
    corpus = {"transcripts": {}, "population": {}, "creates": defaultdict(list), "recordless_boundaries": [],
              "counts": Counter()}
    counts = corpus["counts"]
    for population, paths in (("main", main_paths), ("subagent", subagent_paths)):
        for transcript_path in paths:
            if excluded(transcript_path, root, excluded_sessions):
                continue
            records, boundaries, last_cwd, session_id, in_window = [], [], None, None, False
            try:
                handle = open(transcript_path, "rb")
            except OSError:
                counts["unreadable files"] += 1
                continue
            with handle:
                try:
                    lines = list(handle)
                except OSError:
                    counts["unreadable files"] += 1
                    continue
            for line_number, raw_line in enumerate(lines, 1):
                try:
                    record = json.loads(raw_line)
                except Exception:
                    counts["unparseable lines"] += 1
                    continue
                if not isinstance(record, dict):
                    counts["non-object lines"] += 1
                    continue
                stamp = to_epoch(record.get("timestamp"))
                if until_epoch is not None and stamp is not None and stamp > until_epoch:
                    continue
                in_window = in_window or stamp is not None
                last_cwd = text_or_none(record.get("cwd")) or last_cwd
                session_id = text_or_none(record.get("sessionId")) or session_id
                result = record.get("toolUseResult")
                if isinstance(result, dict) and result.get("type") == "create" and isinstance(result.get("filePath"), str) and stamp is not None:
                    corpus["creates"][result["filePath"]].append(stamp)
                if record.get("subtype") == "compact_boundary":
                    metadata = record.get("compactMetadata")
                    trigger = text_or_none(metadata.get("trigger")) if isinstance(metadata, dict) else None
                    boundaries.append({"line": line_number, "epoch": stamp, "trigger": trigger})
                attachment = record.get(attachment_field)
                if not isinstance(attachment, dict):
                    continue
                if attachment.get("type") == "nested_memory":
                    counts["nested_memory attachments"] += 1
                if attachment.get("type") != "instructions":
                    continue
                if until_epoch is not None and stamp is None:
                    counts["undated records excluded"] += 1
                    continue
                raw_files = attachment.get("files")
                files = {}
                for entry in (raw_files if isinstance(raw_files, list) else []):
                    if isinstance(entry, dict) and isinstance(entry.get("type"), str) and isinstance(entry.get("path"), str):
                        content = entry.get("content")
                        files[(entry["type"], entry["path"])] = content if isinstance(content, str) else json.dumps(content)
                    else:
                        counts["malformed file entries"] += 1
                rendered = record.get("rendered")
                preamble = None
                if isinstance(rendered, list) and rendered and isinstance(rendered[0], dict) and isinstance(rendered[0].get("content"), str):
                    body = rendered[0]["content"].split("<system-reminder>\n", 1)
                    preamble = body[1].split("\n", 1)[0][:60] if len(body) == 2 else ""
                records.append({
                    "preamble": preamble,
                    "line": line_number, "timestamp": text_or_none(record.get("timestamp")), "epoch": stamp,
                    "version": text_or_none(record.get("version")), "cwd": last_cwd, "session": session_id,
                    "tagged": "reason" in attachment or "changed" in attachment,
                    "reason": text_or_none(attachment.get("reason")),
                    "types": [key[0] for key in files], "files": files,
                })
            counts["transcript files in window"] += 1 if in_window else 0
            if records:
                corpus["transcripts"][transcript_path] = {"records": records, "boundaries": boundaries}
                corpus["population"][transcript_path] = population
            else:
                corpus["recordless_boundaries"] += [(population, b["trigger"]) for b in boundaries]
    return corpus


def version_key(version):
    try:
        return tuple(int(part) for part in version.split("."))
    except Exception:
        return (0,)


class Labeller:
    """Opaque labels for store names and cwds, so output can be published without naming projects."""

    def __init__(self, enabled, root):
        self.enabled, self.root, self.labels, self.kinds = enabled, root, {}, Counter()

    def store(self, transcript_path):
        slug = os.path.relpath(transcript_path, self.root).split(os.sep)[0]
        return self._label("store:" + slug, "tmpstore" if slug.startswith("-tmp-") else "store", slug)

    def cwd(self, cwd):
        if not cwd:
            return "?"
        return self._label("cwd:" + cwd, "tmpcwd" if cwd.startswith("/tmp/") else "cwd", cwd)

    def _label(self, key, kind, raw):
        if not self.enabled:
            return raw
        if key not in self.labels:
            self.kinds[kind] += 1
            self.labels[key] = f"{kind}-{self.kinds[kind]:02d}"
        return self.labels[key]


def analyse(corpus, root, user_claude_md):
    transcripts, population_of = corpus["transcripts"], corpus["population"]
    result = {"counts": dict(corpus["counts"])}
    all_records = [(tp, r) for tp, t in transcripts.items() for r in t["records"]]
    result["records"] = len(all_records)
    result["transcripts"] = len(transcripts)
    result["by_population"] = dict(Counter(population_of[tp] for tp, _ in all_records))
    pair = lambda r: (r["session"], digest(sorted(map(list, r["files"].items()))))
    main_pairs = {pair(r) for tp, r in all_records if population_of[tp] == "main"}
    result["distinct_pairs"] = len({pair(r) for _, r in all_records})
    result["distinct_main_pairs"] = len(main_pairs)
    result["subagent_matching_main"] = sum(1 for tp, r in all_records if population_of[tp] == "subagent" and pair(r) in main_pairs)
    versions = sorted({r["version"] for _, r in all_records if r["version"]}, key=version_key)
    dated = sorted((r["epoch"], r["timestamp"], r["version"] or "?") for _, r in all_records if r["epoch"] is not None)
    result["builds"] = (versions[0], versions[-1], len(versions)) if versions else None
    result["earliest"] = dated[0][1:] if dated else None
    result["latest"] = dated[-1][1:] if dated else None
    result["earliest_epoch"] = dated[0][0] if dated else None
    result["type_counts"] = dict(Counter(t for _, r in all_records for t in r["types"]))
    result["automem_deliveries"] = sum(1 for _, r in all_records if "AutoMem" in r["types"])
    result["user_distinct_contents"] = len({c for _, r in all_records for (t, _p), c in r["files"].items() if t == "User"})
    result["user_distinct_paths"] = len({p for _, r in all_records for (t, p) in r["files"] if t == "User"})

    # 1. tag x User, per population
    crosstab = Counter((population_of[tp], "tagged" if r["tagged"] else "untagged", "User" in r["types"]) for tp, r in all_records)
    result["crosstab"] = {f"{p} {k}": (crosstab[(p, k, True)], crosstab[(p, k, True)] + crosstab[(p, k, False)])
                          for p in ("main", "subagent") for k in ("untagged", "tagged")}
    result["untagged_total"] = sum(1 for _, r in all_records if not r["tagged"])
    result["tagged_by_reason"] = dict(Counter(r["reason"] or "-" for _, r in all_records if r["tagged"]))
    result["tagged_by_version"] = dict(Counter(r["version"] or "?" for _, r in all_records if r["tagged"]))
    result["preambles"] = dict(Counter(("tagged" if r["tagged"] else "untagged", r["preamble"] if r["preamble"] is not None else "(no rendered field)")
                                       for _, r in all_records))
    result["automem_paths_not_memory_index"] = sum(1 for _, r in all_records for (t, p) in r["files"]
                                                   if t == "AutoMem" and not p.endswith(os.sep + os.path.join("memory", "MEMORY.md")))

    # 2. delta test, with bracketing for omitted files; 3. untagged omissions
    delta, omissions = Counter(), []
    for tp, t in transcripts.items():
        rs = t["records"]
        for index, r in enumerate(rs):
            earlier = {}
            for previous in rs[:index]:
                earlier.update(previous["files"])
            if not r["tagged"]:
                for key in earlier:
                    if key not in r["files"]:
                        omissions.append((tp, r, key))
                continue
            if not earlier:
                delta["tagged with no earlier record in its transcript"] += 1
            for key, content in r["files"].items():
                if key not in earlier:
                    delta["listed: new"] += 1
                elif earlier[key] == content:
                    delta["listed: UNCHANGED"] += 1
                else:
                    delta["listed: changed"] += 1
            for key in earlier:
                if key in r["files"]:
                    continue
                later = next((nxt["files"][key] for nxt in rs[index + 1:] if key in nxt["files"]), None)
                if later is None:
                    delta[f"omitted {key[0]}: no later copy (unbracketed)"] += 1
                elif later == earlier[key]:
                    delta[f"omitted {key[0]}: bracketed unchanged"] += 1
                else:
                    delta[f"omitted {key[0]}: bracketed, copies differ (ambiguous)"] += 1
    result["delta"] = dict(delta)
    result["untagged_omissions"] = [(tp, r["line"], key[0]) for tp, r, key in omissions]

    # 4. compaction sequence, per population
    sequence, boundary_versions = Counter(), Counter()
    for tp, t in transcripts.items():
        population, rs = population_of[tp], t["records"]
        for boundary in t["boundaries"]:
            version = next((r["version"] for r in reversed(rs) if r["line"] < boundary["line"]), None) or "?"
            boundary_versions[(population, boundary["trigger"], version)] += 1
            nxt = next((r for r in rs if r["line"] > boundary["line"]), None)
            shape = "none" if nxt is None else ("tagged" if nxt["tagged"] else "untagged")
            sequence[f"{population}: after {boundary['trigger']} boundary, next record {shape}"] += 1
        for r in (r for r in rs if r["tagged"]):
            last = max((b for b in t["boundaries"] if b["line"] < r["line"]), key=lambda b: b["line"], default=None)
            sequence[f"{population}: tagged {r['reason']}, last boundary before it {last['trigger'] if last else 'none'}"] += 1
            if population == "subagent" and last is None:
                parts = os.path.relpath(tp, root).split(os.sep)
                parent = transcripts.get(os.path.join(root, parts[0], parts[1] + ".jsonl"))
                earlier = [b for b in (parent["boundaries"] if parent else []) if b["epoch"] is not None and r["epoch"] is not None and b["epoch"] < r["epoch"]]
                trigger = max(earlier, key=lambda b: b["epoch"])["trigger"] if earlier else ("none" if parent else "no parent transcript")
                sequence[f"subagent: tagged {r['reason']} with no own boundary, parent session's last boundary before it {trigger}"] += 1
    for population, trigger in corpus["recordless_boundaries"]:
        sequence[f"{population}: after {trigger} boundary, in a transcript with no record"] += 1
    result["sequence"] = dict(sequence)
    result["boundary_versions"] = dict(boundary_versions)

    # 5. gaps
    gaps = []
    for tp, t in transcripts.items():
        rs = t["records"]
        recorded = sorted({key[1] for r in rs for key in r["files"] if key[0] == "AutoMem"})
        for r in (r for r in rs if not r["tagged"] and "User" in r["types"] and "AutoMem" not in r["types"]):
            if recorded:
                candidates, source = recorded, "recorded"
            else:
                candidates = [os.path.join(root, os.path.relpath(tp, root).split(os.sep)[0], "memory", "MEMORY.md")]
                source = "fallback"
            graded = [grade(path, r["epoch"], corpus["creates"].get(path, [])) for path in candidates]
            verdict, offset = next((g for g in graded if g[0].startswith("UNEXPLAINED")), graded[0])
            gaps.append({"transcript": tp, "line": r["line"], "timestamp": r["timestamp"], "version": r["version"],
                         "cwd": r["cwd"], "source": source, "verdict": verdict, "offset_minutes": offset,
                         "index_earlier": any("AutoMem" in x["types"] for x in rs if x["line"] < r["line"]),
                         "index_later": any("AutoMem" in x["types"] for x in rs if x["line"] > r["line"])})
    result["gaps"] = gaps

    # 6. disk side
    if user_claude_md and os.path.exists(user_claude_md) and result["earliest_epoch"] is not None:
        result["user_claude_md_unchanged"] = os.stat(user_claude_md).st_mtime < result["earliest_epoch"]
    return result


def grade(index_path, record_epoch, create_epochs):
    """Return (verdict, minutes from the record to the creating Write, or None)."""
    if record_epoch is None:
        return "UNEXPLAINED (undated record)", None
    before = [e for e in create_epochs if e <= record_epoch]
    after = [e for e in create_epochs if e > record_epoch]
    if before and not os.path.exists(index_path):
        return "UNEXPLAINED (index created before the record, absent now)", None
    if before:
        return "UNEXPLAINED (index created before this record)", None
    if after:
        return "created-after (a Write-tool create of the index came later)", round((min(after) - record_epoch) / 60)
    if not os.path.exists(index_path):
        return "absent-no-create (no index now; no Write-tool create in surviving transcripts)", None
    born = birth_epoch(index_path)
    if born is None:
        return "UNEXPLAINED (index exists, no creation event, birth unavailable)", None
    if born > record_epoch:
        return "inode-after (current inode born later; lower bound only)", None
    return "UNEXPLAINED (index existed before this record)", None


def report(result, labeller, gap_detail_limit):
    counts = result["counts"]
    print(f"records: {result['records']} {result['by_population']} in {result['transcripts']} transcripts; "
          f"distinct (sessionId, payload) pairs: {result['distinct_pairs']} (main alone: {result['distinct_main_pairs']}; "
          f"subagent records matching a main pair of their session: {result['subagent_matching_main']})")
    print(f"input: {dict(sorted(counts.items()))}")
    if result["builds"]:
        print(f"builds: {result['builds'][0]} .. {result['builds'][1]} ({result['builds'][2]} distinct)")
    if result["earliest"]:
        print(f"earliest record: {result['earliest'][0]} on {result['earliest'][1]}; latest: {result['latest'][0]}")
    print(f"files[].type: {result['type_counts']}; User: {result['user_distinct_paths']} distinct path(s), "
          f"{result['user_distinct_contents']} distinct content(s)")
    print()
    print("=== POSITIVE CONTROL: the detector must see the index delivered through this channel")
    print(f"  AutoMem deliveries: {result['automem_deliveries']}; AutoMem paths not ending memory/MEMORY.md: "
          f"{result['automem_paths_not_memory_index']}")
    if result["automem_deliveries"] == 0:
        print("  BLIND -- no index delivery seen. No count below would mean anything. Stopping.")
        return 2
    print("  control passed")
    print()
    print("=== 1. tag x User (records carrying User / records)")
    for label, (with_user, total) in result["crosstab"].items():
        print(f"  {label:18s} {with_user:5d} / {total:5d}")
    print(f"  tagged by reason:  {result['tagged_by_reason']}")
    print(f"  tagged by version: {dict(sorted(result['tagged_by_version'].items(), key=lambda kv: version_key(kv[0])))}")
    print("  first line of the rendered reminder, by tag (60 chars):")
    for (tag, preamble), count in sorted(result["preambles"].items(), key=lambda kv: (kv[0][0], -kv[1])):
        print(f"    {count:5d}  {tag:8s} {preamble}")
    print()
    print("=== 2. delta test: tagged-record files vs their other copies in the same transcript (per record)")
    for label, count in sorted(result["delta"].items()):
        print(f"  {count:5d}  {label}")
    print()
    print("=== 3. untagged records dropping a file an earlier record in the transcript listed")
    print(f"  {len(result['untagged_omissions'])}")
    for tp, line, kind in result["untagged_omissions"][:gap_detail_limit]:
        print(f"    {labeller.store(tp)}:{line} omits {kind}")
    print()
    print("=== 4. compaction sequence")
    for label, count in sorted(result["sequence"].items()):
        print(f"  {count:5d}  {label}")
    print("  boundaries by (population, trigger, build of the record before them):")
    for (population, trigger, version), count in sorted(result["boundary_versions"].items(), key=lambda kv: (kv[0][0], kv[0][1], version_key(kv[0][2]))):
        print(f"    {count:5d}  {population} {trigger} {version}")
    print()
    print("=== 5. gaps: untagged records with User and no AutoMem")
    gaps = result["gaps"]
    print(f"  total: {len(gaps)}; index delivered earlier in the transcript: {sum(g['index_earlier'] for g in gaps)}, "
          f"later: {sum(g['index_later'] for g in gaps)}, both (between deliveries): "
          f"{sum(g['index_earlier'] and g['index_later'] for g in gaps)}; "
          f"store path source: {dict(Counter(g['source'] for g in gaps))}")
    for verdict, count in Counter(g["verdict"] for g in gaps).most_common():
        print(f"  {count:5d}  {verdict}")
    groups = Counter((labeller.cwd(g["cwd"]), g["verdict"].split(" ")[0], g["source"]) for g in gaps)
    for (cwd, verdict, source), count in sorted(groups.items(), key=lambda kv: (-kv[1], kv[0]))[:gap_detail_limit]:
        print(f"         {count:3d}  {verdict:18s} source={source:8s} cwd={cwd}")
    if len(groups) > gap_detail_limit:
        print(f"         ... {len(groups) - gap_detail_limit} more groups not shown; raise --gap-detail")
    for g in gaps:
        if g["index_earlier"] or g["index_later"] or g["offset_minutes"] is not None or g["verdict"].startswith("UNEXPLAINED"):
            offset = f" (Write create +{g['offset_minutes']} min)" if g["offset_minutes"] is not None else ""
            print(f"    {(g['timestamp'] or '?')[:10]} v{g['version']} {g['verdict'].split(' ')[0]}{offset} "
                  f"earlier={g['index_earlier']} later={g['index_later']} source={g['source']} {labeller.store(g['transcript'])}")
    print()
    print("=== 6. disk side: user CLAUDE.md unchanged through the window = "
          f"{result.get('user_claude_md_unchanged', 'not checked')}")
    grades = Counter(g["verdict"].split(" ")[0] for g in gaps)
    unexplained = sum(1 for g in gaps if g["verdict"].startswith("UNEXPLAINED"))
    print()
    print(f"gaps: UNEXPLAINED {unexplained}; created-after {grades['created-after']}; inode-after {grades['inode-after']}; "
          f"absent-no-create {grades['absent-no-create']}  (of {result['untagged_total']} untagged records)")
    return 0


# ---------------------------------------------------------------- selftest

def instructions(timestamp, files, tag=None, field=ATTACHMENT_FIELD, tag_keys=("changed", "reason"), preamble=None):
    attachment = {"type": "instructions", "files": [{"type": t, "path": p, "content": c} for t, p, c in files]}
    if tag:
        if "changed" in tag_keys:
            attachment["changed"] = True
        if "reason" in tag_keys:
            attachment["reason"] = tag
    line = {"type": "attachment", "timestamp": timestamp, "version": "2.1.999", "cwd": "/fixture", "sessionId": "s", field: attachment}
    if preamble:
        line["rendered"] = [{"content": f"<system-reminder>\n{preamble}\n\nContents of x:\n\ny\n</system-reminder>"}]
    return line


def write_transcript(path, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        for line in lines:
            handle.write((line if isinstance(line, str) else json.dumps(line)) + "\n")


def quiet(function, *args):
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        value = function(*args)
    return value, buffer.getvalue()


def selftest():
    failures = []

    def expect(label, actual, wanted):
        ok = actual == wanted
        print(f"  [{'ok' if ok else 'FAIL'}] {label}: {actual!r}" + ("" if ok else f" (wanted {wanted!r})"))
        if not ok:
            failures.append(label)

    with tempfile.TemporaryDirectory() as root:
        store_a = os.path.join(root, "-proj-a", "memory", "MEMORY.md")
        store_b = os.path.join(root, "-proj-b", "memory", "MEMORY.md")
        os.makedirs(os.path.dirname(store_a))
        open(store_a, "w").write("- index\n")
        user = ("User", "/fixture/user-home/.claude/CLAUDE.md", "user rules")
        project, project_v2 = ("Project", "/fixture/CLAUDE.md", "rules v1"), ("Project", "/fixture/CLAUDE.md", "rules v2")
        index_v1, index_v2 = ("AutoMem", store_a, "- index v1"), ("AutoMem", store_a, "- index v2")
        created = {"type": "user", "timestamp": "2000-01-01T00:30:00Z", "toolUseResult": {"type": "create", "filePath": store_b}}
        boundary = {"type": "system", "subtype": "compact_boundary", "timestamp": "2099-01-01T00:00:30Z", "compactMetadata": {"trigger": "auto"}}
        write_transcript(os.path.join(root, "-proj-a", "aaaa0001.jsonl"), [
            "not json", "[1, 2]",
            instructions("2099-01-01T00:00:00Z", [user, project, index_v1], preamble="Codebase and user instructions are shown below."),
            boundary,
            instructions("2099-01-01T00:01:00Z", [user, project, index_v1]),                    # full list after boundary
            instructions("2099-01-01T00:02:00Z", [index_v2], tag="compaction", preamble="Instruction files were re-read; these differ"),  # delta
            instructions("2099-01-01T00:03:00Z", [project_v2], tag="compaction", tag_keys=("reason",)),  # reason-only tag
            instructions("2099-01-01T00:04:00Z", [user, project_v2]),                            # gap between deliveries
            instructions("2099-01-01T00:05:00Z", [user, project_v2, index_v2, ("AutoMem", "/fixture/elsewhere/INDEX.md", "x")]),
            instructions("2100-01-01T00:00:00Z", [user]),                                         # after the cutoff
            {"type": "attachment", "timestamp": None, ATTACHMENT_FIELD: {"type": "instructions", "files": 5}},  # undated, bad files
        ])
        write_transcript(os.path.join(root, "-proj-b", "b.jsonl"), [
            instructions("2000-01-01T00:00:00Z", [user]),                                         # gap; index created +30 min
            created,
        ])
        write_transcript(os.path.join(root, "-proj-c", "c.jsonl"), [
            instructions("2000-01-01T00:00:00Z", [user]),                                         # gap; never any index
        ])
        write_transcript(os.path.join(root, "-proj-d", "d.jsonl"), [
            instructions("2099-01-01T00:07:00Z", [user], tag="session_start", tag_keys=("changed",)),  # changed-only tag, carries User
            instructions("2099-01-01T00:08:00Z", [project]),                                     # no User: never a gap
            instructions("2099-01-01T00:09:00", [user]),                                          # naive time: undated under --until
        ])
        store_e = os.path.join(root, "-proj-e", "memory", "MEMORY.md")
        os.makedirs(os.path.dirname(store_e))
        open(store_e, "w").write("- index\n")
        write_transcript(os.path.join(root, "-proj-e", "e.jsonl"), [
            {"type": "user", "timestamp": "1999-12-31T00:00:00Z", "toolUseResult": {"type": "create", "filePath": store_e}},
            instructions("2000-01-01T00:00:00Z", [user]),                                         # gap; index created BEFORE it
        ])
        store_g = os.path.join(root, "-proj-g", "memory", "MEMORY.md")
        write_transcript(os.path.join(root, "-proj-g", "g.jsonl"), [
            instructions("2099-01-01T00:10:00Z", [user]),                                         # gap; index delivered only LATER
            {"type": "user", "timestamp": "2099-01-01T00:15:00Z", "toolUseResult": {"type": "create", "filePath": store_g}},
            instructions("2099-01-01T00:20:00Z", [user, ("AutoMem", store_g, "- g")]),
        ])
        write_transcript(os.path.join(root, "-proj-a", "aaaa0001", "subagents", "x.jsonl"), [
            instructions("2099-01-01T00:00:10Z", [user, project, index_v1]),
            instructions("2099-01-01T00:02:30Z", [index_v2], tag="compaction"),                  # subagent delta; parent boundary auto
        ])
        write_transcript(os.path.join(root, "-proj-a", "s2", "subagents", "y.jsonl"), [
            {"type": "system", "subtype": "compact_boundary", "timestamp": "2099-01-01T00:00:40Z", "compactMetadata": {"trigger": "auto"}},
        ])
        write_transcript(os.path.join(root, "-proj-a", "excluded-session.jsonl"), [
            instructions("2099-01-01T00:06:00Z", [user]),
        ])
        os.symlink(os.path.join(root, "nowhere.jsonl"), os.path.join(root, "-proj-a", "dangling.jsonl"))
        user_file = os.path.join(root, "CLAUDE.md")
        open(user_file, "w").write("user rules")
        os.utime(user_file, (946684800 - 10, 946684800 - 10))  # before 2000-01-01, the earliest record

        print("selftest: census over a synthetic fixture")
        corpus = load(root, ["excluded-session"], until="2099-12-31T00:00:00Z")
        result = analyse(corpus, root, user_file)
        expect("records (cutoff, exclusion, undated all honoured)", result["records"], 15)
        expect("undated or naive excluded under --until", result["counts"].get("undated records excluded"), 2)
        expect("unreadable file counted, not fatal", result["counts"].get("unreadable files"), 1)
        expect("by population", result["by_population"], {"main": 13, "subagent": 2})
        expect("positive control", result["automem_deliveries"], 7)
        expect("main untagged with User", result["crosstab"]["main untagged"], (9, 10))
        expect("main tagged with User (reason-only and changed-only tags counted)", result["crosstab"]["main tagged"], (1, 3))
        expect("delta: listed changed", result["delta"].get("listed: changed"), 3)
        expect("delta: listed unchanged", result["delta"].get("listed: UNCHANGED"), None)
        expect("delta: User omitted, bracketed unchanged", result["delta"].get("omitted User: bracketed unchanged"), 2)
        expect("delta: Project omitted, copies differ", result["delta"].get("omitted Project: bracketed, copies differ (ambiguous)"), 1)
        expect("delta: AutoMem omitted, bracketed unchanged", result["delta"].get("omitted AutoMem: bracketed unchanged"), 1)
        expect("untagged omissions (a drops AutoMem, d drops User)",
               sorted((os.path.basename(t), k) for t, _, k in result["untagged_omissions"]), [("aaaa0001.jsonl", "AutoMem"), ("d.jsonl", "User")])
        expect("compaction sequence, record after boundary", result["sequence"].get("main: after auto boundary, next record untagged"), 1)
        expect("tagged after an auto boundary", result["sequence"].get("main: tagged compaction, last boundary before it auto"), 2)
        expect("subagent tagged record: parent's last boundary",
               result["sequence"].get("subagent: tagged compaction with no own boundary, parent session's last boundary before it auto"), 1)
        expect("boundary in a transcript with no record", result["sequence"].get("subagent: after auto boundary, in a transcript with no record"), 1)
        keyed = {os.path.basename(g["transcript"]): (g["verdict"].split(" ")[0], g["source"], g["offset_minutes"],
                                                     g["index_earlier"], g["index_later"]) for g in result["gaps"]}
        expect("gap verdicts keyed by transcript", keyed, {
            "aaaa0001.jsonl": ("UNEXPLAINED", "recorded", None, True, True),
            "b.jsonl": ("created-after", "fallback", 30, False, False),
            "c.jsonl": ("absent-no-create", "fallback", None, False, False),
            "e.jsonl": ("UNEXPLAINED", "fallback", None, False, False),
            "g.jsonl": ("created-after", "recorded", 5, False, True),
        })
        expect("user CLAUDE.md unchanged through window", result["user_claude_md_unchanged"], True)
        expect("rendered preambles by tag", {k: v for k, v in result["preambles"].items() if not k[1].startswith("(no")}, {
            ("untagged", "Codebase and user instructions are shown below."): 1,
            ("tagged", "Instruction files were re-read; these differ"): 1})
        expect("AutoMem paths outside memory/MEMORY.md", result["automem_paths_not_memory_index"], 1)
        expect("boundary versions", result["boundary_versions"], {("main", "auto", "2.1.999"): 1})
        code, labelled = quiet(report, result, Labeller(True, root), 50)
        expect("report exit on a sighted corpus", code, 0)
        expect("headline gaps line", labelled.strip().splitlines()[-1].split("  (of")[0],
               "gaps: UNEXPLAINED 2; created-after 2; inode-after 0; absent-no-create 1")
        leaks = [needle for needle in ("-proj-", "/fixture", root) if needle in labelled]
        expect("labelled report names no slug, cwd or root", leaks, [])
        _, unlabelled = quiet(report, result, Labeller(False, root), 50)
        expect("unlabelled report does name them (the leak check is not vacuous)", all(n in unlabelled for n in ("-proj-", "/fixture")), True)

        print("selftest: the plural-field trap must go RED")
        blind = analyse(load(root, ["excluded-session"], attachment_field="attachments"), root, None)
        expect("plural field sees no records", blind["records"], 0)

        print("selftest: records present but no index delivered -> report must refuse, exit 2")
        corpus = load(root, ["excluded-session"], until="2099-12-31T00:00:00Z")
        for t in corpus["transcripts"].values():
            for r in t["records"]:
                r["files"] = {k: v for k, v in r["files"].items() if k[0] != "AutoMem"}
                r["types"] = [x for x in r["types"] if x != "AutoMem"]
        expect("report refuses to quote counts when blind", quiet(report, analyse(corpus, root, None), Labeller(True, root), 0)[0], 2)

        print("selftest: an unchanged file in a tagged record must be detected")
        corpus = load(root, ["excluded-session"], until="2099-12-31T00:00:00Z")
        for t in corpus["transcripts"].values():
            for r in t["records"]:
                if r["tagged"] and r["reason"] == "compaction" and ("AutoMem", store_a) in r["files"]:
                    r["files"][("AutoMem", store_a)] = "- index v1"
        expect("unchanged tagged file reported (main and subagent delta)", analyse(corpus, root, None)["delta"].get("listed: UNCHANGED"), 2)

        print("selftest: exclusion matches the session only, never the root, project or subagents folder")
        expect("root basename and 'subagents' exclude nothing",
               [analyse(load(root, [prefix]), root, None)["records"] for prefix in (os.path.basename(root), "subagents")], [19, 19])
        expect("a session id excludes its main transcript and its subagent folder", analyse(load(root, ["aaaa0001"]), root, None)["records"], 9)
        try:
            load(root, ["-proj"])
            refused = False
        except SystemExit:
            refused = True
        expect("a prefix shorter than 8 characters is refused", refused, True)

    print(f"selftest: {'PASS' if not failures else 'FAIL: ' + ', '.join(failures)}")
    return 0 if not failures else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--root", default=os.path.expanduser("~/.claude/projects"))
    parser.add_argument("--user-claude-md", default=os.path.expanduser("~/.claude/CLAUDE.md"))
    parser.add_argument("--exclude-session", action="append", default=[], metavar="ID")
    parser.add_argument("--until", metavar="ISO", help="ignore lines stamped after this time, e.g. 2026-10-01T20:30:00Z")
    parser.add_argument("--label-stores", action="store_true", help="print opaque labels instead of project names and cwds")
    parser.add_argument("--gap-detail", type=int, default=10, metavar="N")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    try:
        corpus = load(args.root, args.exclude_session, until=args.until)
        if not corpus["transcripts"]:
            home = os.path.expanduser("~")
            shown = "~/" + os.path.relpath(args.root, home) if args.root.startswith(home + os.sep) else args.root
            print(f"no instructions records matched: root={shown} exclusions={args.exclude_session} until={args.until} "
                  f"input={dict(corpus['counts'])}. Older builds write none, so an empty result can mean 'no rail' "
                  "as well as a wrong root, cutoff or exclusion.")
            return 2
        return report(analyse(corpus, args.root, args.user_claude_md), Labeller(args.label_stores, args.root), args.gap_detail)
    except Exception as error:
        if args.label_stores:
            print(f"census failed: {type(error).__name__} (details suppressed under --label-stores)", file=sys.stderr)
            return 2
        raise


if __name__ == "__main__":
    sys.exit(main())
