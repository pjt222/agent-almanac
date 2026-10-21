#!/usr/bin/env python3
"""
census-mutants.py -- prove instructions-census.py --selftest can fail.

Each mutant is one literal replacement in a COPY of the census, written to a temporary directory;
the original is never touched. A mutant is KILLED when --selftest exits non-zero. Refuses to run
unless the unmutated copy passes first (a red baseline kills everything and proves nothing), and
refuses any needle that does not occur exactly once (a no-op mutant survives vacuously).

    python3 census-mutants.py        # exit 0 iff every mutant is killed
"""
import os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "instructions-census.py")).read()
mutants = {
 "plural field": ('ATTACHMENT_FIELD = "attachment"', 'ATTACHMENT_FIELD = "attachments"'),
 "drop User check in gaps": ('if not r["tagged"] and "User" in r["types"] and "AutoMem" not in r["types"]', 'if not r["tagged"] and "AutoMem" not in r["types"]'),
 "tagged gaps allowed": ('(r for r in rs if not r["tagged"] and "User" in r["types"]', '(r for r in rs if "User" in r["types"]'),
 "invert birth": ('if born > record_epoch:', 'if born < record_epoch:'),
 "tag by changed only": ('"tagged": "reason" in attachment or "changed" in attachment', '"tagged": "changed" in attachment'),
 "tag by reason only": ('"tagged": "reason" in attachment or "changed" in attachment', '"tagged": "reason" in attachment'),
 "ignore until": ('if until_epoch is not None and stamp is not None and stamp > until_epoch:', 'if False:'),
 "undated kept": ('if until_epoch is not None and stamp is None:', 'if False:'),
 "skip subagents": ('(("main", main_paths), ("subagent", subagent_paths))', '(("main", main_paths),)'),
 "ignore exclusion": ('if excluded(transcript_path, root, excluded_sessions):', 'if False:'),
 "exclusion sees the project folder": ('session = os.path.splitext(parts[1])[0] if len(parts) >= 2 else ""', 'session = os.path.splitext(parts[0])[0] if parts else ""'),
 "short exclusion allowed": ('MIN_EXCLUSION = 8', 'MIN_EXCLUSION = 0'),
 "parent boundary lookup off": ('parent = transcripts.get(os.path.join(root, parts[0], parts[1] + ".jsonl"))', 'parent = None'),
 "headline unexplained forced to 0": ('unexplained = sum(1 for g in gaps if g["verdict"].startswith("UNEXPLAINED"))', 'unexplained = 0'),
 "rendered preamble ignored": ('                    preamble = body[1].split("\\n", 1)[0][:60] if len(body) == 2 else ""', '                    preamble = ""'),
 "AutoMem path check off": ('if t == "AutoMem" and not p.endswith(', 'if False and not p.endswith('),
 "boundary versions dropped": ('            boundary_versions[(population, boundary["trigger"], version)] += 1', '            pass'),
 "positive control off": ('if result["automem_deliveries"] == 0:', 'if False:'),
 "creates ignored": ('    if after:\n', '    if False:\n'),
 "creates before ignored": ('    if before:\n        return "UNEXPLAINED (index created before this record)", None', '    if False:\n        return "UNEXPLAINED (index created before this record)", None'),
 "absence treated as unexplained": ('return "absent-no-create (no index now; no Write-tool create in surviving transcripts)", None', 'return "UNEXPLAINED absent", None'),
 "create offset sign": ('round((min(after) - record_epoch) / 60)', 'round((record_epoch - min(after)) / 60)'),
 "untagged omission off": ('                        omissions.append((tp, r, key))', '                        pass'),
 "bracketing off": ('elif later == earlier[key]:', 'elif False:'),
 "unchanged miscounted": ('elif earlier[key] == content:', 'elif False:'),
 "boundary next off": ('nxt = next((r for r in rs if r["line"] > boundary["line"]), None)', 'nxt = None'),
 "recordless boundaries dropped": ('corpus["recordless_boundaries"] += [(population, b["trigger"]) for b in boundaries]', 'pass'),
 "fallback always": ('if recorded:\n                candidates, source = recorded, "recorded"', 'if False:\n                candidates, source = recorded, "recorded"'),
 "index earlier/later swapped": ('for x in rs if x["line"] < r["line"]),', 'for x in rs if x["line"] > r["line"]),'),
 "disk side inverted": ('st_mtime < result["earliest_epoch"]', 'st_mtime > result["earliest_epoch"]'),
 "naive timestamps accepted": ('return parsed.timestamp() if parsed.tzinfo is not None else None', 'return parsed.timestamp()'),
 "files non-list crash guard off": ('for entry in (raw_files if isinstance(raw_files, list) else []):', 'for entry in (raw_files or []):'),
 "unreadable file fatal": ('            except OSError:\n                counts["unreadable files"] += 1\n                continue\n            with handle:', '            except KeyError:\n                counts["unreadable files"] += 1\n                continue\n            with handle:'),
 "labeller disabled": ('        if not self.enabled:\n            return raw', '        if True:\n            return raw'),
 "gap line prints raw store": ('source={g[\'source\']} {labeller.store(g[\'transcript\'])}")', 'source={g[\'source\']} {g[\'transcript\']}")'),
 "gap group prints raw cwd": ('groups = Counter((labeller.cwd(g["cwd"]), ', 'groups = Counter((g["cwd"], '),
 "omission line prints raw store": ('print(f"    {labeller.store(tp)}:{line} omits {kind}")', 'print(f"    {tp}:{line} omits {kind}")'),
}
survived = []
with tempfile.TemporaryDirectory() as work:
    def selftest(text):
        path = os.path.join(work, "m.py")
        open(path, "w").write(text)
        return subprocess.run([sys.executable, path, "--selftest"], capture_output=True, text=True,
                              env={**os.environ, "TMPDIR": work}).returncode
    if selftest(src) != 0:
        sys.exit("baseline: the unmutated census fails its own selftest -- no verdict possible")
    for name, (needle, replacement) in mutants.items():
        if src.count(needle) != 1:
            sys.exit(f"mutant {name!r}: needle occurs {src.count(needle)} times, not once -- refusing")
        rc = selftest(src.replace(needle, replacement))
        print(f"{'KILLED  ' if rc != 0 else 'SURVIVED'} {name}")
        if rc == 0:
            survived.append(name)
print(f"{len(mutants) - len(survived)} of {len(mutants)} killed; survivors: {survived}")
sys.exit(1 if survived else 0)
