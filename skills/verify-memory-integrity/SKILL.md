---
name: verify-memory-integrity
description: >
  Verify agent memory reachability and budget without modifying anything — orphan detection,
  broken links, dual-cap usage against the 200-line / 25KB truncation limits, and catalog
  conformance. Use at the start of a session before trusting memory contents, before and after
  any index compaction, after a rename or repository move, when a memory directory has grown
  past a few dozen topic files, or as a periodic health check.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, claude-code, verification, reachability, read-only, maintenance
---

# Verify Memory Integrity

Read a Claude Code memory store and report whether it is reachable and within budget — without
changing a byte of it. A store-identity resolution and eight checks cover the two truncation caps,
orphaned topic files, dangling and degraded references, cross-reference resolution, catalog
conformance, topic-file size, and recoverability.

`manage-memory` and `prune-agent-memory` both mutate the store. This skill is the instrument they
are measured with: run it before either one for a baseline, and again afterward to prove the
mutation stranded nothing. An instrument that edits its subject cannot measure a change.

## When to Use

- At the start of a session, before trusting anything the memory index claims
- Before and after an index compaction — to record what was reachable while it still was, then to
  prove nothing was stranded. Compaction is the operation the caps make mandatory, and it is also
  the operation that breaks reachability
- After a repository rename or move, which invalidates paths inside memory entries
- When a memory directory has grown past a few dozen topic files and nobody has audited the links
- As a periodic health check, on the same cadence as `prune-agent-memory`

**Do NOT use** to fix anything. This skill never writes to the store. Hand its report to
`manage-memory` (to relink or extract) or `prune-agent-memory` (to delete) and re-run it afterward.

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `memory_dir` | path | Yes | The store to verify, typically `~/.claude/projects/<project>/memory/`. Never hardcode it: `autoMemoryDirectory` in any settings scope and `CLAUDE_CODE_PROJECT_DIR_NAME` both relocate it |
| `report_path` | path | No | Where the report is written (default: a path under `$TMPDIR`). Must be outside `memory_dir` |
| `topic_max_bytes` | number | No | Per-project topic-file size threshold for check 7. No default — see that step |
| `name_prefixes` | list | No | Filename prefixes that check 5 may strip when resolving (default: `feedback-`, `project-`, `reference-` — hyphen form, because the block normalizes `_` to `-` before it strips) |

## Read-Only Contract

**No `Write`, no `Edit`, no `rm`, no `mv`, no redirect into the store.** `allowed-tools` omits the
mutating tools deliberately and no step below writes inside `memory_dir`, which is what makes the
skill safe every session and its output usable as a before/after baseline.

Each check appends verdict lines to one report file **outside** the store, and the run exits
non-zero if any line begins `FAIL`. Steps run as separate tool calls, so shell state does not
persist: re-export the report path and the store path in each call rather than relying on a trap or
an earlier assignment. The report skeleton, its exit-code rules and the fail-closed guard on a
missing report are in [references/EXAMPLES.md](references/EXAMPLES.md).

## Procedure

### Step 0: Resolve the store before measuring it

Every number below reads whichever directory this step names, so name it first. The
project-directory slug transformation changed between 2026-03-22 and 2026-04-16: an underscore in a
project path used to be preserved and is now converted to a hyphen. So memory written before the
change lives under a slug the harness will never open again, and two project paths differing only by
`_` versus `-` now collide onto one store.

```bash
# Report the RESOLVED path, plus any sibling store differing only in _ vs -.
DIR=<memory-dir>                                    # .../projects/<slug>/memory
STORE=$(cd "$DIR" && pwd -P) && echo "STORE $STORE"
SLUG=$(basename "$(dirname "$STORE")"); ROOT=$(dirname "$(dirname "$STORE")")
KEY=$(printf '%s' "$SLUG" | tr '_' '-')          # both spellings collapse to one key
for d in "$ROOT"/*/; do
  alt=$(basename "$d")
  [ "$alt" = "$SLUG" ] || [ "$(printf '%s' "$alt" | tr '_' '-')" != "$KEY" ] \
    || [ ! -d "$ROOT/$alt/memory" ] \
    || echo "SIBLING $ROOT/$alt/memory — a second store differing only in _ vs -"
done
```

Scan and normalize; do not substitute. Building the candidate with `${SLUG//-/_}` looks equivalent
and silently kills the direction that matters — measured on two real sibling pairs, and explained in
[references/EXAMPLES.md](references/EXAMPLES.md).

**Expected:** One `STORE` line naming the absolute path actually measured, and no `SIBLING` line.

**On failure:** Append `FAIL store identity` and stop before check 1. Unreachable is
indistinguishable from empty, so a budget and an orphan count are both perfectly accurate readings
of the wrong store. Determine which store the session reads, then re-run from here.

### Step 1: Measure the dual-cap budget

`MEMORY.md` is truncated on load at **200 lines or 25KB, whichever comes first** (per the Claude
Code memory documentation). Measure both and act on the larger fraction:
`usage = max(size / 25000, lines / 200)` — warn at `0.80`, rewrite target `0.70`.
Above ~124 characters of content per line the **size cap binds first** — 125 units once the line
separator is counted, since 200 lines carry 199 separators. At the ~150-character entry this skill
targets — a derivation here, not a documented recommendation — the real budget is ~166 lines, not
200. Never report a line count alone, and always name which cap binds.

**Before quoting the paragraph above**, read what in it is documented and what is derived: [references/EXAMPLES.md](references/EXAMPLES.md#what-is-documented-and-what-is-derived).

**What the size cap counts (measured, not documented).** The cap is applied to UTF-16 code units —
JavaScript `String.length` — rather than UTF-8 bytes or Unicode code points. For any text inside
the Basic Multilingual Plane — ASCII, Latin-1 accents, CJK — the character count *is* the unit
count, so a character count is exact for most real indexes. It diverges in two places: a byte
count over-reports on any non-ASCII content (up to 3x on CJK, which is why a `wc -c` check can
demand a prune the loader does not need), and a character count *under*-reports on astral
characters such as emoji, where one character costs two units. Measured on Claude Code v2.1.238
(Windows) and 2.1.237 (Linux) and reported in `anthropics/claude-code#82056`, August 2026. Treat
as version-volatile: the two documented numbers are the contract, this is how the current
implementation counts.

```python
size = sum(2 if ord(c) > 0xFFFF else 1 for c in text)   # UTF-16 code units
```

**Three further measured properties** (Claude Code 2.1.237–2.1.241, linux-x64/WSL2, tool use
disabled; derivation in [references/EXAMPLES.md](references/EXAMPLES.md)): truncation is whole-line,
so `first line dropped` names a line dropped entirely rather than cut mid-way; carriage returns
count, so a CRLF index has a smaller line budget than the same content with LF; and being past the
crossover says only which cap will bite first, not that anything is being truncated yet. State the
boundary as measured across that range, never as a constant.

```bash
# Dual-cap budget. Reads bytes and decodes ONCE: Python's text mode deletes CR
# characters, which silently changes the string the loader actually measures.
IDX=<memory-dir>/MEMORY.md
python3 - "$IDX" <<'PY'
import re, sys

raw  = open(sys.argv[1], 'rb').read()
full = raw.decode('utf-8', 'replace')

# Only the content that LOADS counts toward either limit. YAML frontmatter and
# block-level HTML comments are stripped before the index is loaded and are
# excluded from the measurement; a comment INSIDE a fenced code block is not —
# it is preserved and counted (measured, see the skill text). Stripping it too
# under-reports, which hides a truncation that is already happening.
text = re.sub(r'\A---\r?\n.*?\r?\n---[ \t]*\r?\n', '', full, flags=re.S)
kept, fence, cmt = [], False, False
for ln in text.split('\n'):
    # An OPEN comment wins over the fence rule: ``` inside a comment is comment
    # content, not a delimiter. Testing the fence first let a commented-out code
    # block toggle `fence`, carry `cmt` across it, and then strip ordinary index
    # lines until the next `-->` — under-reporting, the dangerous direction (#734).
    if cmt:
        cmt = '-->' not in ln
        continue
    if ln.lstrip().startswith('```'):
        fence = not fence
    elif not fence and ln.lstrip().startswith('<!--'):
        cmt = '-->' not in ln
        continue
    kept.append(ln)
text = '\n'.join(kept)

units = lambda s: sum(2 if ord(c) > 0xFFFF else 1 for c in s)   # UTF-16 code units

lines = text.count('\n') + (0 if text.endswith('\n') else 1)
size  = units(text)
lf, sf = lines / 200, size / 25000

# Track BOTH caps and take the minimum. A loop that tests only the size cap and
# checks the line cap in its else-branch reports every large file as size-bound.
acc = cut_size = 0
for i, line in enumerate(text.split('\n'), 1):
    acc += units(line) + 1
    if acc > 25000:
        cut_size = i
        break
cut_line = 201 if lines > 200 else 0
cuts  = [c for c in (cut_size, cut_line) if c]
binds = 'size' if cut_size and (not cut_line or cut_size <= cut_line) else 'lines' if cut_line else 'neither'

print(f"lines {lines}/200 = {lf:.1%}    size {size}/25000 = {sf:.1%}")
print(f"USAGE {max(lf, sf):.1%} -> " + ("OVER CAP - the tail is dropped on load" if max(lf, sf) >= 1.0
      else "COMPACT NOW (target 70%)" if max(lf, sf) >= 0.80 else "OK"))
print(f"binds: {binds}" + (f"; first line dropped: {min(cuts)}" if cuts else ""))
print(f"mean {size / lines:.0f} units/line — the size cap binds first above 125")
print(f"utf-8 bytes {len(raw)}; not loaded, so not counted: {units(full) - size} unit(s)")
print(f"astral chars {sum(1 for c in text if ord(c) > 0xFFFF)}")
PY
```

**Measurement-basis note.** The block measures what LOADS: frontmatter and block-level HTML
comments are stripped, because the loader strips them before applying the limits. A comment inside
a fenced code block is **not** stripped — measured, and it counts against the cap like any other
content ([how](references/EXAMPLES.md#what-the-strip-does-and-does-not-remove)). Getting either
half wrong is a silent misread in a different direction: measuring raw over-reports, and one store
of four measured here read 70.4% of cap raw against 68.7% loaded; stripping fenced comments
under-reports, and hides a truncation already happening.

**What the fence/comment state machine does not model, and which way each one errs.** The loader's
own behaviour here is **unmeasured** — these are divergences between this estimator and CommonMark,
recorded with their risk direction rather than claimed as harness behaviour (#734):

| Case | This block | CommonMark | Risk if they differ |
|---|---|---|---|
| A ``` run indented four or more spaces | toggles the fence | an indented code block, not a fence | either direction, depending on what follows |
| An info string (```` ```yaml ````) *inside* an open fence | toggles the fence closed | fence content | **under-reports** the remainder |
| A ``` run shorter than the opener (` ``` ` inside a ````` ```` ````` block) | closes the fence | not a close | **under-reports** the remainder |
| `~~~` fences, a tag with attributes, an unclosed fence | not handled | fences | unmeasured |

The collision the open-comment branch above fixes was the one case measured to drop **real index
lines**, which is why it is repaired rather than documented. The rest are documented because the
correct target is the loader's behaviour, and nobody has captured it: the arm that would settle it
is `tools/wirecap.py` plus the generator in `tests/results/2026-08-25-fence-strip-replication/`.

**Expected:** Both fractions with both denominators, a `binds:` verdict naming which cap would cut
first (`neither` while both still have headroom), the mean units per line against the crossover,
and `USAGE` under 80%.

**On failure:** At `USAGE >= 0.80` append `FAIL dual-cap` and hand the store to `manage-memory` with
a rewrite target of 70% of the *binding* cap. At `USAGE >= 1.0` the tail is already invisible on
load — record `first line dropped` before anyone edits the file, because the next write moves it.

### Step 2: Detect orphaned topic files

Only the index is loaded automatically, so a topic file nothing links to is unreachable — and
nothing about its own contents will ever reveal that.

```bash
# Reachability: the index is the only file loaded automatically, so a topic file
# that nothing links to is not deprioritized — it is invisible.
DIR=<memory-dir>
python3 - "$DIR" <<'PY'
import os, re, sys

d    = sys.argv[1]
text = open(os.path.join(d, 'MEMORY.md'), 'rb').read().decode('utf-8', 'replace')
# HTML comments are stripped before the index reaches the model, and the
# stripped content is excluded from the load limits: a note left in one is
# invisible to the reader, and buys nothing by being cheap.
text = re.sub(r'<!--.*?-->', '', text, flags=re.S)

EXAMPLES = {'file.md', 'example.md', 'topic-name.md'}      # format-documentation targets
linked   = {os.path.basename(m) for m in re.findall(r'\]\(([^)#\s]+\.md)', text)} - EXAMPLES
on_disk  = {f for f in os.listdir(d) if f.endswith('.md') and f != 'MEMORY.md'}

orphans, dangling = sorted(on_disk - linked), sorted(linked - on_disk)
size = lambda names: sum(os.path.getsize(os.path.join(d, n)) for n in names)
tot  = size(on_disk) or 1

print(f"topic files {len(on_disk)}; linked {len(linked & on_disk)}")
print(f"ORPHANS  {len(orphans)} = {len(orphans)/max(len(on_disk),1):.1%} of files, {size(orphans)/tot:.1%} of bytes")
print(f"DANGLING {len(dangling)} (linked, absent on disk)")
for n in orphans:  print(f"  orphan   {n}")
for n in dangling: print(f"  dangling {n}")
PY
```

Five rules this block honors, each learned from a real miss. They govern how its output is read as
much as how it is written, and steps 3, 4 and 6 each pick one up:

1. **Exclude template/example link targets** — a format-documentation line such as
   `- [Title](file.md) — hook` otherwise reports as dangling forever, and a check that cries wolf
   trains its operator to ignore it.
2. **A prose mention is not reachability.** Require an exact filename match on a real link target.
   Report near-matches separately as *degraded references*; never count them as reachable.
3. **HTML comments in the index are not a mitigation.** They are stripped before the index reaches
   the model, so a curator note in one is written into a void. Being stripped, it is also excluded
   from both load limits — it is free, and unread, which is the worst combination for a note whose
   whole purpose is to be seen. A note that must survive has to be a plain markdown line. (Before
   v2.1.211 the raw file was measured, so such a note did also consume budget.)
4. **Parse frontmatter, do not grep it.** A `^type:` regex misses a field nested under `metadata:`
   and reports a conformance failure that does not exist.
5. **Report both denominators, labeled.** File share and byte share are different numbers, never
   interchangeable — a store can be 40% orphaned by file count and 5% by bytes.

**Expected:** `ORPHANS 0`, with both denominators printed and labeled. `topic files` equals `linked`.

**On failure:** Append `FAIL orphans` with the file list and both percentages. Do not delete — an
orphan is as likely to be a valuable file whose index line a compaction dropped. `manage-memory`
relinks; `prune-agent-memory` decides deletion.

### Step 3: Resolve dangling links

Step 2's `DANGLING` list is the sole verdict source for broken links — never add a second extractor
that can disagree with it. This step adds the reading: every entry is either a real break or a
format-documentation target belonging in the `EXAMPLES` set (rule 1).

```bash
# DIAGNOSTIC ONLY — Step 2 holds the verdict. Lists in-scope suspects: every
# target that is not a flat `*.md`. Full link-form census in EXAMPLES.md.
grep -oE '\]\([^)]+\)' <memory-dir>/MEMORY.md | tr -d ']()' \
  | grep -vE '^[^/]+\.md$|^#|://' \
  || echo "LINK FORMS all flat *.md — no sub-path, anchor or URL targets"
```

Anchor-only and URL targets are out of scope. A sub-path target is in scope and a likely break: the
store is flat, so a link carrying a directory component usually survived a move.

**Expected:** `DANGLING 0` after every format-documentation target has been accounted for by the
`EXAMPLES` set, and no `sub-path` targets.

**On failure:** Append `FAIL dangling` with the list. For a documentation example, extend `EXAMPLES`
in the Step 2 block rather than suppressing the check: an exclusion list is auditable, a disabled
check is not.

### Step 4: Report degraded references

A filename that appears in the index only as prose or inline code is not a weak link, it is not a
link (rule 2). It reads as reachable to a human scanning the index and is invisible to the mechanism
that makes files reachable. Counted separately, never as reachable — the files are already in Step
2's orphan list, and this step explains why they looked fine.

```bash
# Degraded references: named in the index, never as a link target.
python3 - <memory-dir> <<'PY'
import os, re, sys
d = sys.argv[1]
text = open(os.path.join(d, 'MEMORY.md'), encoding='utf-8', errors='replace').read()
text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
linked = {os.path.basename(m) for m in re.findall(r'\]\(([^)#\s]+\.md)', text)}
prose  = set(re.findall(r'[\w.\-]+\.md', re.sub(r'\]\([^)]*\)', '', text)))
on_disk = {f for f in os.listdir(d) if f.endswith('.md') and f != 'MEMORY.md'}
degraded = sorted((prose - linked) & on_disk)
print(f"DEGRADED {len(degraded)} (named in the index, not a link target; NOT reachable)")
for n in degraded: print(f"  degraded {n}")
PY
```

**Expected:** `DEGRADED 0`, and the count never added to `linked` anywhere in the report.

**On failure:** Append `FAIL degraded` with the list. The repair is one character class — turn the
mention into a markdown link — but it is `manage-memory`'s repair, not this skill's.

### Step 5: Resolve cross-references across naming conventions

Two naming conventions coexisting in one store — hyphen versus underscore, prefix retained versus
stripped — produced a measured 13% of link targets that no exact match resolved
(pjt222/agent-almanac#407). That is a convention
split, not a typo rate, and the two need different responses. Normalization tells you which you have;
it never makes an unresolved target reachable.

```bash
# Normalization is diagnosis, not repair. A target that resolves only after
# normalizing is still a broken link at load time.
python3 - <memory-dir> <<'PY'
import os, re, sys
d, PREFIXES = sys.argv[1], ('feedback-', 'project-', 'reference-')   # see name_prefixes input
def norm(name):
    n = re.sub(r'\.md$', '', name.lower()).replace('_', '-')
    for p in PREFIXES:
        if n.startswith(p): n = n[len(p):]
    return n
text = re.sub(r'<!--.*?-->', '', open(os.path.join(d, 'MEMORY.md'),
              encoding='utf-8', errors='replace').read(), flags=re.S)
linked  = {os.path.basename(m) for m in re.findall(r'\]\(([^)#\s]+\.md)', text)}
on_disk = {f for f in os.listdir(d) if f.endswith('.md') and f != 'MEMORY.md'}
index, unresolved = {}, []
for f in on_disk: index.setdefault(norm(f), []).append(f)
for t in sorted(linked - on_disk):
    hits = index.get(norm(t), [])
    print(f"  {'NORMALIZES' if hits else 'UNRESOLVED'} {t}" + (f" -> {', '.join(sorted(hits))}" if hits else ""))
    if not hits: unresolved.append(t)
print(f"CONVENTIONS {len({'underscore' if '_' in f else 'hyphen' for f in on_disk})} in use")
print(f"UNRESOLVED {len(unresolved)}/{len(linked)} = {len(unresolved)/max(len(linked),1):.1%} of link targets")
PY
```

**Expected:** `UNRESOLVED 0`. `NORMALIZES` entries are still failures — they name the fix, they are
not the fix.

**On failure:** Append `FAIL unresolved` with the count and rate. A store at `CONVENTIONS 2` with a
non-zero rate needs normalizing to one convention before individual links are chased — fixing them
one at a time re-creates the split on the next write.

### Step 6: Check catalog conformance

Parse the frontmatter, do not grep it (rule 4): a `^type:` regex misses a field nested under
`metadata:` and invents a conformance failure that does not exist. An absent frontmatter block is
**not** a failure — files predating the field are legitimate and are reported as `no-frontmatter`.
An unparsable one is. And a check that cannot run reports `SKIPPED`, never `PASS`.

```bash
# Frontmatter is PARSED. Inability to measure is not a passing verdict.
python3 - <memory-dir> <<'PY'
import os, re, sys
try:
    import yaml
except ImportError:
    print("SKIPPED catalog conformance: PyYAML unavailable. Install it or check by hand.")
    sys.exit(0)
d, TYPES = sys.argv[1], {'user', 'feedback', 'project', 'reference'}
read = lambda n: open(os.path.join(d, n), encoding='utf-8', errors='replace').read()
for f in sorted(x for x in os.listdir(d) if x.endswith('.md') and x != 'MEMORY.md'):
    m = re.match(r'---\r?\n(.*?)\r?\n---\r?\n', read(f), flags=re.S)
    if not m:
        print(f"  no-frontmatter {f}"); continue          # legitimate: predates the field
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as exc:
        print(f"  FAIL unparsable {f}: {exc}"); continue
    kind = fm.get('type') or (fm.get('metadata') or {}).get('type')   # nested, not ^type:
    if kind is not None and kind not in TYPES:
        print(f"  FAIL unknown type {f}: {kind!r}")

entry, matched = re.compile(r'^\s*[-*]\s+\[[^\]]+\]\(([^)#\s]+\.md)\)\s*(.*)$'), 0
for hit in filter(None, map(entry.match, read('MEMORY.md').splitlines())):
    matched += 1
    desc = hit.group(2).lstrip('—-: ').strip()
    if not 10 <= len(desc) <= 300:
        print(f"  FAIL description {hit.group(1)}: {len(desc)} chars")
print(f"CATALOG ENTRIES CHECKED {matched}")   # 0 here is a broken check, not a clean index
PY
```

The catalog-entry regex matches only single-link lines; a compound line is skipped rather than
guessed at, which under-reports and never invents a failure. That is why the block prints how many
entries it checked — a regex matching nothing prints no failures, and a check that discovered
nothing is not a check that passed.

**Expected:** No `FAIL` lines, and `CATALOG ENTRIES CHECKED` well above zero. `no-frontmatter`
entries are listed but are not failures.

**On failure:** Append `FAIL catalog` with the list. A `SKIPPED` line is itself a reportable
result — record it so a later reader does not read the absence of failures as a pass.

### Step 7: Check topic-file size hygiene

The threshold is **project-configured**. Do not substitute an internal Claude Code read budget here:
undocumented internals move between releases and go stale silently — the number keeps printing, it
just stops being true. Only Step 1's two caps are documented, and they do not cover topic files,
which are read on demand and in full.

```bash
# No default. A per-project number an operator chose beats an internal one
# copied from a release note.
TOPIC_MAX_BYTES=${TOPIC_MAX_BYTES:?set a per-project threshold; there is no documented default}
find <memory-dir> -maxdepth 1 -name '*.md' ! -name 'MEMORY.md' -printf '%s\t%f\n' \
  | awk -F'\t' -v cap="$TOPIC_MAX_BYTES" \
      '$1 > cap { printf "  oversize %s (%d bytes)\n", $2, $1; n++ }
       END { printf "OVERSIZE %d of %d topic files over %d bytes\n", n, NR, cap }'
```

**Expected:** `OVERSIZE 0`, or a short list an operator recognizes as deliberate.

**On failure:** Append `WARN oversize`, not `FAIL`. An oversize topic file costs read time on the
one session that opens it; an oversize index costs every session — not the same defect, so not the
same verdict.

### Step 8: Check recoverability

Memory files do not expire: Claude Code excludes `projects/<project>/memory/` from the
`cleanupPeriodDays` retention sweep (default 30 days, minimum 1), so the index and its topic files
stay until someone edits or deletes them. That is why this check exists rather than a reason to skip
it: no retention copy exists to fall back on, so a bad overwrite is unrecoverable unless the store
is under version control or has a tombstone path. Most have neither.

```bash
DIR=<memory-dir>
git -C "$DIR" rev-parse --show-toplevel >/dev/null 2>&1 \
  && echo "VCS yes ($(git -C "$DIR" rev-parse --show-toplevel))" \
  || echo "VCS no — an overwrite in this store is unrecoverable"
ls -d "$DIR"/.archive "$DIR"/../memory-archive 2>/dev/null \
  || echo "ARCHIVE none — no tombstone path for deleted topic files"
```

**Expected:** At least one of version control or an archive path, recorded in the report either way.

**On failure:** Append `WARN unrecoverable`. Do not create either one here — that is a write. Report
it, and require a copy of the store before any mutating run against it.

## Validation

- [ ] Nothing inside `memory_dir` was created, modified, or deleted; `report_path` is outside it
- [ ] Step 0 printed the resolved `STORE` path and reported any `_`-versus-`-` sibling store
- [ ] Index budget is within both caps (`max(size / 25000, lines / 200) < 0.80`), reported as both numbers, with the `binds:` verdict and the mean units per line
- [ ] Step 1's provenance and measurement-basis notes were read before any figure was quoted
- [ ] Step 2 reported orphan share as file share **and** byte share, each labeled
- [ ] Every dangling entry is either a real break or an accounted-for `EXAMPLES` target
- [ ] Degraded references were counted separately and never added to `linked`
- [ ] Unresolved cross-references were counted; `NORMALIZES` entries were not treated as resolved
- [ ] Frontmatter was parsed, not grepped; `CATALOG ENTRIES CHECKED` > 0; `SKIPPED` is a non-verdict
- [ ] Check 7 ran against a project-configured threshold, not a hardcoded internal constant
- [ ] Recoverability was recorded before any mutating skill was pointed at the store
- [ ] The run exited non-zero if and only if the report contains a `FAIL` line

## Common Pitfalls

- **Reporting a line count alone**: the size cap binds first above ~125 units per line, so a comfortable `129/200` can sit at 74.6% of the real budget. Print both, name which binds.
- **Using `max(len(raw), chars)` as a fail-safe hedge**: fail-safe in direction, and measured over-reporting **2.44x** on a CJK index — a checker acting on it demands a prune of 117 lines that actually load (pjt222/agent-almanac#407, comment). Reasonable while the unit was unknown; it is now known.
- **Counting a prose mention as reachable**: only an exact filename match on a real link target makes a topic file loadable; a near-match is a degraded reference and belongs in its own column.
- **Suppressing a noisy check instead of extending its exclusion list**: a check that cries wolf gets ignored, but a disabled check is not auditable. Extend `EXAMPLES`; never delete the check.
- **Writing the report into the memory directory**: it breaks the read-only contract, and the next run reports the report as an orphan.
- **Reading `SKIPPED` as a pass**: a check that could not run produced no evidence about its subject — the same distinction as a red CI check that found something versus one that could not execute.
- **Treating a `NORMALIZES` hit as a fix**: normalization diagnoses a convention split; the link is still broken at load time until someone edits the index.
- **Pinning an undocumented internal number**: only the 200-line and 25KB caps are documented; anything else copied from a release note goes stale silently — it keeps printing.

## Examples

Worked runs, the full report template, the link-form census, and the before/after compaction pairing are in [references/EXAMPLES.md](references/EXAMPLES.md).

## What Verification Does Not Buy

- **A write succeeding tells you nothing about whether the memory will ever be read again.** Verify reachability, not write success — every session, because the operation that breaks reachability (compaction) is the one the caps make mandatory.
- **Nothing here is enforced at write time** — every guarantee is *verified when the skill last ran*, not an invariant ([why](references/EXAMPLES.md#nothing-here-is-enforced-at-write-time)).

## Related Skills

- [manage-memory](../manage-memory/SKILL.md) — the repair side: relinks orphans, extracts oversize sections, compacts the index this skill measures
- [prune-agent-memory](../prune-agent-memory/SKILL.md) — the deletion side; bracket a prune pass with this skill so its collateral is measured, not assumed
- [repair-broken-references](../repair-broken-references/SKILL.md) — general broken-link repair for the dangling and unresolved targets reported here
- [catalog-collection](../catalog-collection/SKILL.md) — the cataloging discipline behind check 6: every item described, every description conforming
- [preserve-materials](../preserve-materials/SKILL.md) — preservation framing for check 8; no version control and no tombstone path means no preservation copy
- [write-claude-md](../write-claude-md/SKILL.md) — CLAUDE.md is loaded in full and is not subject to these caps; content that keeps overflowing the index often belongs there
