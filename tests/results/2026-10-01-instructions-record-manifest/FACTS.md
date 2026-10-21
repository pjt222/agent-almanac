# FACTS.md -- measured 2026-10-02T15:26:42Z on 1e7ed10fe (docs/82056-instructions-manifest) from FACTS.spec; 27 fact(s)

F1 the census passes its selftest (incl. plural-field, blind-report and unchanged-file arms): `python3 tests/results/2026-10-01-instructions-record-manifest/instructions-census.py --selftest`
    selftest: census over a synthetic fixture
      [ok] records (cutoff, exclusion, undated all honoured): 15
      [ok] undated or naive excluded under --until: 2
      [ok] unreadable file counted, not fatal: 1
      [ok] by population: {'main': 13, 'subagent': 2}
      [ok] positive control: 7
      [ok] main untagged with User: (9, 10)
      [ok] main tagged with User (reason-only and changed-only tags counted): (1, 3)
      [ok] delta: listed changed: 3
      [ok] delta: listed unchanged: None
      [ok] delta: User omitted, bracketed unchanged: 2
      [ok] delta: Project omitted, copies differ: 1
      [ok] delta: AutoMem omitted, bracketed unchanged: 1
      [ok] untagged omissions (a drops AutoMem, d drops User): [('aaaa0001.jsonl', 'AutoMem'), ('d.jsonl', 'User')]
      [ok] compaction sequence, record after boundary: 1
      [ok] tagged after an auto boundary: 2
      [ok] subagent tagged record: parent's last boundary: 1
      [ok] boundary in a transcript with no record: 1
      [ok] gap verdicts keyed by transcript: {'aaaa0001.jsonl': ('UNEXPLAINED', 'recorded', None, True, True), 'b.jsonl': ('created-after', 'fallback', 30, False, False), 'c.jsonl': ('absent-no-create', 'fallback', None, False, False), 'e.jsonl': ('UNEXPLAINED', 'fallback', None, False, False), 'g.jsonl': ('created-after', 'recorded', 5, False, True)}
      [ok] user CLAUDE.md unchanged through window: True
      [ok] rendered preambles by tag: {('untagged', 'Codebase and user instructions are shown below.'): 1, ('tagged', 'Instruction files were re-read; these differ'): 1}
      [ok] AutoMem paths outside memory/MEMORY.md: 1
      [ok] boundary versions: {('main', 'auto', '2.1.999'): 1}
      [ok] report exit on a sighted corpus: 0
      [ok] headline gaps line: 'gaps: UNEXPLAINED 2; created-after 2; inode-after 0; absent-no-create 1'
      [ok] labelled report names no slug, cwd or root: []
      [ok] unlabelled report does name them (the leak check is not vacuous): True
    selftest: the plural-field trap must go RED
      [ok] plural field sees no records: 0
    selftest: records present but no index delivered -> report must refuse, exit 2
      [ok] report refuses to quote counts when blind: 2
    selftest: an unchanged file in a tagged record must be detected
      [ok] unchanged tagged file reported (main and subagent delta): 2
    selftest: exclusion matches the session only, never the root, project or subagents folder
      [ok] root basename and 'subagents' exclude nothing: [19, 19]
      [ok] a session id excludes its main transcript and its subagent folder: 9
      [ok] a prefix shorter than 8 characters is refused: True
    selftest: PASS

F2 the census at the cutoff, drafting session excluded, stores labelled: `python3 tests/results/2026-10-01-instructions-record-manifest/instructions-census.py --exclude-session baeb8d5c --until 2026-10-01T20:30:00Z --gap-detail 40 --label-stores`
    records: 1053 {'main': 146, 'subagent': 907} in 999 transcripts; distinct (sessionId, payload) pairs: 141 (main alone: 137; subagent records matching a main pair of their session: 902)
    input: {'nested_memory attachments': 38, 'transcript files in window': 1363}
    builds: 2.1.258 .. 2.1.287 (19 distinct)
    earliest record: 2026-09-02T07:19:33.779Z on 2.1.258; latest: 2026-10-01T20:29:18.439Z
    files[].type: {'User': 1029, 'Project': 1928, 'AutoMem': 1012, 'Local': 2}; User: 1 distinct path(s), 1 distinct content(s)
    
    === POSITIVE CONTROL: the detector must see the index delivered through this channel
      AutoMem deliveries: 1012; AutoMem paths not ending memory/MEMORY.md: 0
      control passed
    
    === 1. tag x User (records carrying User / records)
      main untagged        127 /   127
      main tagged            0 /    19
      subagent untagged    902 /   902
      subagent tagged        0 /     5
      tagged by reason:  {'compaction': 22, 'session_start': 2}
      tagged by version: {'2.1.258': 1, '2.1.260': 2, '2.1.263': 8, '2.1.266': 4, '2.1.270': 2, '2.1.271': 2, '2.1.272': 1, '2.1.278': 2, '2.1.280': 2}
      first line of the rendered reminder, by tag (60 chars):
           21  tagged   Instruction files were re-read after the conversation was co
            2  tagged   Instruction files were re-read when this session started; th
            1  tagged   (no rendered field)
          941  untagged Codebase and user instructions are shown below. Be sure to a
           88  untagged (no rendered field)
    
    === 2. delta test: tagged-record files vs their other copies in the same transcript (per record)
         43  listed: changed
          1  omitted AutoMem: bracketed unchanged
         11  omitted Project: bracketed unchanged
         15  omitted Project: no later copy (unbracketed)
         10  omitted User: bracketed unchanged
         14  omitted User: no later copy (unbracketed)
    
    === 3. untagged records dropping a file an earlier record in the transcript listed
      0
    
    === 4. compaction sequence
         18  main: after auto boundary, next record untagged
         12  main: after manual boundary, next record untagged
         17  main: tagged compaction, last boundary before it auto
          2  main: tagged session_start, last boundary before it auto
          1  subagent: after auto boundary, in a transcript with no record
          4  subagent: tagged compaction with no own boundary, parent session's last boundary before it auto
          1  subagent: tagged compaction with no own boundary, parent session's last boundary before it manual
          5  subagent: tagged compaction, last boundary before it none
      boundaries by (population, trigger, build of the record before them):
            1  main auto 2.1.258
            1  main auto 2.1.260
            8  main auto 2.1.263
            3  main auto 2.1.266
            2  main auto 2.1.270
            1  main auto 2.1.271
            1  main auto 2.1.278
            1  main auto 2.1.280
            5  main manual 2.1.258
            3  main manual 2.1.272
            2  main manual 2.1.278
            2  main manual 2.1.281
    
    === 5. gaps: untagged records with User and no AutoMem
      total: 40; index delivered earlier in the transcript: 0, later: 1, both (between deliveries): 0; store path source: {'fallback': 39, 'recorded': 1}
         38  absent-no-create (no index now; no Write-tool create in surviving transcripts)
          2  created-after (a Write-tool create of the index came later)
               3  absent-no-create   source=fallback cwd=tmpcwd-04
               3  absent-no-create   source=fallback cwd=tmpcwd-18
               3  absent-no-create   source=fallback cwd=tmpcwd-20
               3  absent-no-create   source=fallback cwd=tmpcwd-24
               2  absent-no-create   source=fallback cwd=cwd-02
               1  created-after      source=fallback cwd=cwd-01
               1  created-after      source=recorded cwd=cwd-03
               1  absent-no-create   source=fallback cwd=tmpcwd-01
               1  absent-no-create   source=fallback cwd=tmpcwd-02
               1  absent-no-create   source=fallback cwd=tmpcwd-03
               1  absent-no-create   source=fallback cwd=tmpcwd-05
               1  absent-no-create   source=fallback cwd=tmpcwd-06
               1  absent-no-create   source=fallback cwd=tmpcwd-07
               1  absent-no-create   source=fallback cwd=tmpcwd-08
               1  absent-no-create   source=fallback cwd=tmpcwd-09
               1  absent-no-create   source=fallback cwd=tmpcwd-10
               1  absent-no-create   source=fallback cwd=tmpcwd-11
               1  absent-no-create   source=fallback cwd=tmpcwd-12
               1  absent-no-create   source=fallback cwd=tmpcwd-13
               1  absent-no-create   source=fallback cwd=tmpcwd-14
               1  absent-no-create   source=fallback cwd=tmpcwd-15
               1  absent-no-create   source=fallback cwd=tmpcwd-16
               1  absent-no-create   source=fallback cwd=tmpcwd-17
               1  absent-no-create   source=fallback cwd=tmpcwd-19
               1  absent-no-create   source=fallback cwd=tmpcwd-21
               1  absent-no-create   source=fallback cwd=tmpcwd-22
               1  absent-no-create   source=fallback cwd=tmpcwd-23
               1  absent-no-create   source=fallback cwd=tmpcwd-25
               1  absent-no-create   source=fallback cwd=tmpcwd-26
               1  absent-no-create   source=fallback cwd=tmpcwd-27
               1  absent-no-create   source=fallback cwd=tmpcwd-28
        2026-09-11 v2.1.268 created-after (Write create +125 min) earlier=False later=False source=fallback store-01
        2026-09-02 v2.1.258 created-after (Write create +47 min) earlier=False later=True source=recorded store-02
    
    === 6. disk side: user CLAUDE.md unchanged through the window = True
    
    gaps: UNEXPLAINED 0; created-after 2; inode-after 0; absent-no-create 38  (of 1029 untagged records)

F3 the user CLAUDE.md, birth and mtime: `stat -c 'birth=%w mtime=%y' -- "$HOME/.claude/CLAUDE.md"`
    birth=2026-08-16 19:00:31.240432192 +0200 mtime=2026-08-16 19:00:31.253411557 +0200

F4 the /tmp probe arms: record hour, file types, build: `cat "$HOME"/.claude/projects/-tmp-tmp-*/*.jsonl | jq -c 'select(.attachment.type=="instructions") | [.timestamp[0:13], .version, [.attachment.files[].type]]' | sort | uniq -c`
         36 ["2026-09-15T17","2.1.272",["User"]]

F5 the /tmp probe arms: residue stores, and files under any of their memory/ dirs: `ls -d "$HOME"/.claude/projects/-tmp-tmp-* | wc -l; ls -d "$HOME"/.claude/projects/-tmp-tmp-*/memory | wc -l; find "$HOME"/.claude/projects/-tmp-tmp-*/memory -type f | wc -l`
    28
    28
    0

F6 the 2026-09-15 hook-shape probe never mentions a memory index: `rg -i -c 'memory' tests/results/2026-09-15-sessionstart-hook-shape/; echo "rg_exit=$? (1 = no match)"`
    rg_exit=1 (1 = no match)

F7 the oldest surviving transcript line on this machine (retention bounds what the floor can say): `python3 -c "import glob,json,os; ts=[json.loads(l).get('timestamp') for f in glob.glob(os.path.expanduser('~/.claude/projects/**/*.jsonl'),recursive=True) for l in open(f,'rb') if b'\"timestamp\"' in l]; print(min(t for t in ts if isinstance(t,str)))"`
    2026-09-02T07:17:28.913Z

F8 wirecap's last commit, and that it is on origin/main: `git log -1 --format='%H %cs' -- tools/wirecap.py; git merge-base --is-ancestor "$(git log -1 --format=%H -- tools/wirecap.py)" origin/main && echo on-origin-main`
    eb153491192aa2bcb5632a24eb18d245db431c1a 2026-08-26
    on-origin-main

F9 Claude Code build used for the draft: `claude --version`
    2.1.287 (Claude Code)

T1 tonydzi 5858279003: 408 records, 407 User, 390 untagged, 18 tagged, floor, build window: `gh api repos/anthropics/claude-code/issues/comments/5858279003 --jq .body | rg -n "408 records|'User': 407|390 carry|2026-09-08T17:47:08Z|2\.1\.260.2\.1\.266|existed throughout|own transcript contains"`
    7:Scan: 3,391 transcripts under `~/.claude/projects/*/*.jsonl`; 367 carry an `instructions` attachment; 408 records total. Inside a record the index is its own `files[]` entry, keyed by `type`, not by filename:
    10:files[].type values: {'User': 407, 'AutoMem': 357}
    33:The same index, same length, same project, same build, delivered on both sides of each gap. Unless the file was deleted and identically recreated inside thirteen seconds, it existed throughout and simply was not delivered.
    35:All seven are resumes, and each one's own transcript contains an earlier record where the index **was** delivered — six from the previous evening at 10290 chars, the 20:01 one from 18:10 the same day at 10580. So per transcript the sequence is present, then absent, with nothing about the file changing in between.
    52:2 of 41 repeated, not 29 of 35. Your revised reading is right and the original is dead. The part worth having: my window is **2.1.260–2.1.266**, earlier than your 2.1.271–2.1.282, so this is not a regression the .27x line introduced.
    54:**The tag is not unreliable here, it is absent.** Of 408 records, 390 carry exactly `{type, files}`; only 18 carry `{type, files, changed, reason}`. On 96% there is nothing to trust in the first place, so "compare content" is not a workaround for a lying field — it is the only method available.
    58:I wrote that we tried to read the injection out of the transcript JSONL and "it is not written there." True for the build I tested, false now, and I can date the change instead of hand-waving: transcripts on this machine go back to **2026-07-06**, and the earliest `instructions` record in any of them is **2026-09-08T17:47:08Z on 2.1.260**. Everything before that date carries none.
    64:Not one of the 408 records carries the loader's warning line, and that corroborates nothing. Across 357 `AutoMem` deliveries this index ran **9,489–11,669 UTF-16 units** (13,318–16,525 bytes) — never within 13k units of 25,000.

T2 tonydzi 5874997905: 7 gaps, queued resumes, build, APFS: `gh api repos/anthropics/claude-code/issues/comments/5874997905 --jq .body | rg -n "automated queued resumes|all on 2\.1\.266|local APFS|425 of 426"`
    20:All 7 gaps are automated queued resumes, and all 7 land inside a burst of near-simultaneous resumes. I clustered every `instructions` record in that project by a 120-second window:
    36:Two things I can rule out for you, since they are the usual suspects. The index and the transcripts sit on local APFS, not on the cloud-synced path that project's *working directory* uses — so this is not a network filesystem losing a read. And the same build ran the successful bursts on 09-13 and 09-16.
    40:You are right that a record is not proof of a manifest, and I cannot refute it from here. The only datum I have that bears on it: 425 of 426 records on these builds carry the `User` entry, so on this side the list does look like a full list — which makes the missing `AutoMem` readable as a miss **here**, and says nothing about whether your builds write the same list. That is a difference between our builds, not an answer to your point.
    44:The seven, if you ever want to compare shapes rather than trigger them: `2026-09-14` at `11:06:18`, `11:06:29`, `11:07:05`, `11:07:06`, `11:07:22`, `11:07:26`, and `20:01:01`Z, sessions `717771a7`, `70679620`, `e218763f`, `75b6d330`, `dce5d7fa`, `cbe04d9b`, `af13f5eb`, all on 2.1.266.

T3 tonydzi platform: `gh api repos/anthropics/claude-code/issues/comments/5402745712 --jq .body | rg -n -o "darwin-arm64" | head -1`
    62:darwin-arm64

T4 DanceNitra 5870005304: 21 without index, 14 sandwiched, 21 omitting the user file, ask for a capture: `gh api repos/anthropics/claude-code/issues/comments/5870005304 --jq .body | rg -n "14 of those|21 records written|request body on a resume"`
    3:Of 850 `instructions` records here, the earliest is 2026-09-08T19:00Z, so the same floor you date. 21 name no MEMORY.md in a project that has one, and 14 of those sit between records in the same transcript that did deliver it: 5 on 2.1.271 and 9 on 2.1.275, 11 at session start and 3 at compaction. So the shape is not one day or one build.
    5:One thing stops me from reading those 14 as misses. Here the record is not a full manifest. The user-level CLAUDE.md always loads once it exists, yet 21 records written after its creation time name the index and leave the user file out. If a record can omit a file that was certainly loaded, a record without `AutoMem` does not show that the index was missing from the prompt. Your 407 of 408 records carrying `User` may mean your builds write the full list and ours do not, which is worth knowing on its own.
    7:What would settle it is the request body on a resume, the same read we used for the cap. If you can make the gap happen on demand, I will run the capture here on the same build.

T5 DanceNitra 5711174716: the compaction tag, win32, the 2.1.263 edge: `gh api repos/anthropics/claude-code/issues/comments/5711174716 --jq .body | rg -n "on win32|reason: \"compaction\"|2\.1\.263 on"`
    1:@Linxiushen the `instructions` record reproduces here on win32, read with a stdlib reader of my own rather than precedent, with two properties worth knowing before anyone audits over it.
    3:Nineteen transcripts in one project directory, builds 2.1.234 through 2.1.273. The attachment with `files[].content` is present in all six sessions from 2.1.263 on and absent from all thirteen up to 2.1.260. Build and date are confounded on one machine, so I am calling it an edge here rather than a release boundary. It fits the August negative: @JhouCode found the injection in 3 of 647 transcripts on 2026-08-24, all subagent files, when the newest build was 2.1.237. Before the edge, `unknown` is the only verdict.
    5:The record is per prompt build, not per session. Six sessions hold 21 records with 12 distinct deliveries. Every compaction re-reads the file and writes a record tagged `changed: true, reason: "compaction"`; every resume writes an untagged record that repeats the previous delivery byte for byte. One session holds eleven: three different cuts as the file grew (the loader's notices say 201 lines and 24.6KB, then 205 and 25.2KB, then 211 and 26KB), then three whole loads after I trimmed the index. A per-session card reports whichever record it read.

T6 DanceNitra 5853014223: an untagged record right after a manual /compact: `gh api repos/anthropics/claude-code/issues/comments/5853014223 --jq .body | rg -n "manual /compact"`
    6:One thing from my 17 September comment does not hold on later builds. I wrote that every resume writes an untagged record that repeats the previous delivery byte for byte. Of 35 untagged records after the first in a transcript, 6 carry a different delivery, on builds 2.1.271 to 2.1.282, and one of them is the record right after a manual /compact. So compare the content of consecutive records rather than trusting the tag. The probe's own control now fails on this, and I left it failing:

T7 JhouCode 5922245389: 76 of 76, only MEMORY.md, since Sep 3: `gh api repos/anthropics/claude-code/issues/comments/5922245389 --jq .body | rg -n "Sep 3|76 of 76"`
    1:I ran the control you asked for, through the same channel. Since Sep 3 the runtime records the index delivery in the transcript: it arrived in every session with at least one model reply, 76 of 76, and every time the only file was `MEMORY.md`. Before Sep 3 there's no such record, so for those sessions the zero rests on the attachment census alone.

F10 the named mutant set in census-mutants.py, each of which the selftest must kill (green baseline required): `python3 tests/results/2026-10-01-instructions-record-manifest/census-mutants.py | tail -1`
    37 of 37 killed; survivors: []

F11 the platform this census ran on: `uname -sm`
    Linux x86_64

F12 the reprex (in-memory capture base for Part B): last commit, and that it is on origin/main: `git log -1 --format='%H %cs' -- tests/results/2026-08-26-cap-constant-closure/reprex_memory_cap.py; git merge-base --is-ancestor "$(git log -1 --format=%H -- tests/results/2026-08-26-cap-constant-closure/reprex_memory_cap.py)" origin/main && echo on-origin-main`
    dd75182a962b261130893112ce8abf404789b543 2026-08-26
    on-origin-main

T8 JhouCode platform: `gh api repos/anthropics/claude-code/issues/comments/5401304202 --jq .body | rg -n -o "linux-x64" | head -1`
    62:linux-x64

T9 DanceNitra's published result for the 14 sandwiched records: how DanceNitra's probe buckets them, and the buckets: `gh api repos/DanceNitra/agora/contents/probes/instructions_records_without_the_index.py --jq .content | base64 -d | rg -n 'or "untagged"'; gh api repos/DanceNitra/agora/contents/probes/instructions_records_without_the_index.result.json --jq .content | base64 -d | jq -c '{absent_and_bracketed, bracketed_reasons, bracketed_builds, records_after_it_with_index_but_no_user_file}'`
    69:                    reasons[r["reason"] or "untagged"] += 1
    {"absent_and_bracketed":14,"bracketed_reasons":{"compaction":3,"session_start":11},"bracketed_builds":{"2.1.271":5,"2.1.275":9},"records_after_it_with_index_but_no_user_file":21}

F13 the full first line of the reminder every TAGGED record rendered, with counts (drafting session excluded, cutoff applied): `python3 -c "import glob,json,os,collections; c=collections.Counter(); h=os.path.expanduser('~/.claude/projects'); fs=glob.glob(h+'/*/*.jsonl')+glob.glob(h+'/*/*/subagents/**/*.jsonl',recursive=True); [c.update([r['rendered'][0]['content'].split(chr(10))[1]]) for f in fs if 'baeb8d5c' not in f for l in open(f,'rb') if b'changed' in l and b'instructions' in l for r in [json.loads(l)] if isinstance(r.get('attachment'),dict) and r['attachment'].get('type')=='instructions' and 'reason' in r['attachment'] and (r.get('timestamp') or '')<='2026-10-01T20:30:00Z' and isinstance(r.get('rendered'),list)]; [print(n, t) for t,n in c.items()]"`
    21 Instruction files were re-read after the conversation was compacted; these differ from their earlier copies — each replaces its earlier copy, and the instructions preamble above still applies:
    2 Instruction files were re-read when this session started; these differ from their earlier copies — each replaces its earlier copy, and the instructions preamble above still applies:

F14 GATE 0: the declared Part B slicer reproduces files[] byte-exactly from each record's rendered text: `python3 tests/results/2026-10-01-instructions-record-manifest/gate0-slicer.py --exclude-session baeb8d5c --until 2026-10-01T20:30:00Z`
    GATE 0: 964 of 964 records pass

F15 Part B arms 1-4 in one session on the canned-reply server, scored against P1/P2/P3 (set PARTB_ROOT outside any repository): `cd tests/results/2026-10-01-instructions-record-manifest/partb && python3 stage2.py`
    {"arm": "1 fresh start", "contents_in_system": false, "messages": 2, "added_messages": 2, "slicer_ok": true, "added_types": ["AutoMem", "Project", "User"], "added_preambles": ["Codebase and user instructions are shown below. Be sure to a"], "records": ["untagged"], "record_types": ["AutoMem", "Project", "User"], "P1": true, "P3": true, "rendered_on_wire": "exact", "exit": 0, "requests": 1, "canaries": {"IDX-A": true, "IDX-B": false, "IDX-C": false, "PRJ-A": true, "PRJ-B": false}}
    {"arm": "2 resume, nothing changed", "contents_in_system": false, "messages": 5, "added_messages": 3, "slicer_ok": true, "added_types": [], "added_preambles": [], "records": [], "verdict": "NO_RECORD", "exit": 0, "requests": 1, "canaries": {"IDX-A": true, "IDX-B": false, "IDX-C": false, "PRJ-A": true, "PRJ-B": false}}
    {"arm": "3 index -> IDX-B, resume", "contents_in_system": false, "messages": 8, "added_messages": 3, "slicer_ok": true, "added_types": ["AutoMem"], "added_preambles": ["Instruction files were re-read when this session started; th"], "records": ["tagged:session_start"], "record_types": ["AutoMem"], "P2": true, "P3": true, "rendered_on_wire": "exact up to one trailing newline", "P2_omitted": ["Project", "User"], "P2_omitted_still_live": true, "P2_second_half_trivial": true, "exit": 0, "requests": 1, "canaries": {"IDX-A": true, "IDX-B": true, "IDX-C": false, "PRJ-A": true, "PRJ-B": false}}
    {"arm": "4a /compact", "exit": 0, "requests": [["POST", "/v1/messages?beta=true"]], "boundaries": ["manual"], "records": [], "verdict": "GATE 2 PASS"}
    {"arm": "4b resume after compaction", "contents_in_system": false, "messages": 2, "added_messages": 2, "slicer_ok": true, "added_types": ["AutoMem", "Project", "User"], "added_preambles": ["Codebase and user instructions are shown below. Be sure to a"], "records": ["untagged"], "record_types": ["AutoMem", "Project", "User"], "P1": true, "P3": true, "rendered_on_wire": "exact", "exit": 0, "requests": 1, "canaries": {"IDX-A": false, "IDX-B": true, "IDX-C": false, "PRJ-A": true, "PRJ-B": false}}
    {"arm": "4c index -> IDX-C, resume", "contents_in_system": false, "messages": 5, "added_messages": 3, "slicer_ok": true, "added_types": ["AutoMem"], "added_preambles": ["Instruction files were re-read when this session started; th"], "records": ["tagged:session_start"], "record_types": ["AutoMem"], "P2": true, "P3": true, "rendered_on_wire": "exact up to one trailing newline", "P2_omitted": ["Project", "User"], "P2_omitted_still_live": true, "P2_second_half_trivial": true, "exit": 0, "requests": 1, "canaries": {"IDX-A": false, "IDX-B": true, "IDX-C": true, "PRJ-A": true, "PRJ-B": false}}
    {"arm": "4d project -> PRJ-B, resume", "contents_in_system": false, "messages": 8, "added_messages": 3, "slicer_ok": true, "added_types": ["Project"], "added_preambles": ["Instruction files were re-read when this session started; th"], "records": ["tagged:session_start"], "record_types": ["Project"], "P2": true, "P3": true, "rendered_on_wire": "exact up to one trailing newline", "P2_omitted": ["AutoMem", "User"], "P2_omitted_still_live": true, "P2_second_half_trivial": true, "exit": 0, "requests": 1, "canaries": {"IDX-A": false, "IDX-B": true, "IDX-C": true, "PRJ-A": true, "PRJ-B": true}}
    cleanup: complete

F16 Part B arm 5, concurrent bursts: 6 resumes after an index edit (5a) and 6 fresh starts (5c): `cd tests/results/2026-10-01-instructions-record-manifest/partb && python3 stage3.py`
    5a {'both-have [tagged:session_start]': 6}
    5c {'both-have [untagged]': 6}
    cleanup: complete

F17 negative control: stage2's P2 omitted-still-live check goes red on a request missing earlier-delivered files: `cd tests/results/2026-10-01-instructions-record-manifest/partb && python3 p2-negative-control.py`
    P2_omitted: ['Project', 'User'] P2_omitted_still_live: False

F18 concentration of the main-session tagged records: records, distinct sessions, distinct projects, records per session (drafting session excluded, cutoff applied): `python3 -c "import glob,json,os,collections; h=os.path.expanduser('~/.claude/projects'); c=collections.Counter(); [c.update([(f.split(os.sep)[-2], os.path.basename(f))]) for f in glob.glob(h+'/*/*.jsonl') if 'baeb8d5c' not in f for l in open(f,'rb') if b'instructions' in l and b'reason' in l for r in [json.loads(l)] if isinstance(r.get('attachment'),dict) and r['attachment'].get('type')=='instructions' and 'reason' in r['attachment'] and (r.get('timestamp') or '')<='2026-10-01T20:30:00Z']; print('records', sum(c.values()), 'sessions', len(c), 'projects', len({p for p,_ in c}), 'per session', sorted(c.values(), reverse=True))"`
    records 19 sessions 9 projects 4 per session [8, 3, 2, 1, 1, 1, 1, 1, 1]

