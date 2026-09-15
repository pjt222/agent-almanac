---
name: manage-memory
description: >
  Organize, extract, prune, and verify Claude Code persistent memory files.
  Covers MEMORY.md as a concise index, topic extraction to dedicated files,
  staleness detection, accuracy verification against project state, the dual
  200-line / 25KB load cap, and reachability of topic files from the index.
  Use when MEMORY.md is approaching either load cap, after a session produces
  durable insights worth preserving, when a topic section has grown beyond
  10-15 lines and should be extracted, when project state has changed and
  memory entries may be stale, or before and after rewriting the index so that
  no topic file loses its only pointer.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, claude-code, organization, maintenance, auto-memory
---

# Manage Memory

Maintain Claude Code's persistent memory directory so it stays accurate, concise, and useful across sessions. `MEMORY.md` is the only file loaded automatically — topic files are read on demand, when something links to them — so the index must stay both small enough to load whole and complete enough that every topic file is reachable from it.

`MEMORY.md` is truncated on load at **200 lines or 25KB, whichever comes first** (per the Claude Code memory documentation). Measure both and act on the larger fraction: `usage = max(size / 25000, lines / 200)` — warn at `0.80`, rewrite target `0.70`. Above ~125 units per line the **size cap binds first**; at the ~150-character entry this skill targets — a derivation of this skill's own, not a documented recommendation — the real budget is ~166 lines, not 200. Never report a line count alone, and always name which cap binds.

**What the size cap counts (measured, not documented).** The cap is applied to UTF-16 code units — JavaScript `String.length` — rather than UTF-8 bytes or Unicode code points. For any text inside the Basic Multilingual Plane — ASCII, Latin-1 accents, CJK — the character count *is* the unit count, so a character count is exact for most real indexes. It diverges in two places: a byte count over-reports on any non-ASCII content (up to 3x on CJK, which is why a `wc -c` check can demand a prune the loader does not need), and a character count *under*-reports on astral characters such as emoji, where one character costs two units. Measured on Claude Code v2.1.238 (Windows) and 2.1.237 (Linux) and reported in `anthropics/claude-code#82056`, August 2026. Treat as version-volatile: the two documented numbers are the contract, this is how the current implementation counts.

```python
size = sum(2 if ord(c) > 0xFFFF else 1 for c in text)   # UTF-16 code units
```

## When to Use

- MEMORY.md is approaching either load cap — `max(size / 25000, lines / 200)` at or above `0.80`
- A session produced durable insights worth preserving (new patterns, architecture decisions, debugging solutions)
- A topic section in MEMORY.md has grown beyond 10-15 lines and should be extracted
- Project state has changed (renamed files, new domains, updated counts) and memory entries may be stale
- Before and after any rewrite of the index, to confirm no topic file lost its only pointer
- Starting a new area of work and checking whether relevant memory already exists
- Periodic maintenance between sessions to keep the memory directory healthy

## Inputs

- **Required**: Access to the memory directory (typically `~/.claude/projects/<project-path>/memory/`, though `autoMemoryDirectory` in `settings.json` can move it — read the path, do not assume it)
- **Optional**: Specific trigger (e.g., "MEMORY.md is too long," "just finished a major refactor")
- **Optional**: Topic to add, update, or extract

## Procedure

### Step 1: Assess Current State

Read MEMORY.md, measure it against **both** caps, and list all files in the memory directory:

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

Inventory the existing topic files against that budget. A `wc -l` here would be a false measurement, not a rough one: it reports the cap that is usually *not* the binding one.

**Expected:** Both cap fractions recorded as numbers, an explicit statement of which cap binds, and an inventory of topic files and MEMORY.md sections. A line count on its own is not an acceptable answer to "how much room is left."

**On failure:** If the memory directory doesn't exist, create it. If MEMORY.md doesn't exist, create a minimal one with a `# Project Memory` header and a `## Topic Files` section. If the block reports `binds: neither`, the index loads whole and no compaction is due.

### Step 2: Identify Stale Entries

Compare memory claims against current project state. Common staleness patterns:

1. **Count drift**: File counts, skill counts, domain counts that changed after additions/removals
2. **Renamed paths**: Files or directories that were moved or renamed
3. **Superseded patterns**: Workarounds that are no longer needed after fixes
4. **Contradictions**: Two entries that say different things about the same topic

Use Grep to spot-check key claims:

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

**Expected:** A list of entries that are stale, with the correct current values.

**On failure:** If you can't verify a claim (e.g., it references external state you can't check), leave it but add a `(unverified)` note rather than silently preserving potentially wrong information.

### Step 3: Decide What to Add

For new entries, apply these filters before writing:

1. **Durability**: Will this be true next session? Avoid session-specific context (current task, in-progress work, temporary state).
2. **Non-duplication**: Does CLAUDE.md or project documentation already cover this? Don't duplicate — memory is for things NOT captured elsewhere.
3. **Verified**: Has this been confirmed across multiple interactions, or is it a single observation? For single observations, verify against project docs before writing.
4. **Actionable**: Does knowing this change behavior? "The sky is blue" isn't useful. "Exit code 5 means quoting error — use temp files" changes how you work.

Exception: If the user explicitly asks to remember something, save it immediately — no need to wait for multiple confirmations.

**Expected:** A filtered list of entries worth adding, each meeting durability + non-duplication + verification + actionability criteria.

**On failure:** If unsure whether an entry is worth keeping, err toward keeping it briefly in MEMORY.md — it's easier to prune later than to rediscover.

### Step 4: Extract Oversize Topics

When a section in MEMORY.md exceeds ~10-15 lines, extract it to a dedicated topic file:

1. Create `<memory-dir>/<topic-name>.md` with a descriptive header
2. Move the detailed content from MEMORY.md to the topic file
3. Replace the section in MEMORY.md with a 1-2 line summary and a link:

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

The `~10-15 line` trigger and the 5-line floor below it are **section-size heuristics, not cap fractions** — they say when a section has outgrown an index entry, and they say nothing about how much of the 200-line or 25KB budget remains. Step 1 answers that.

Naming conventions for topic files:
- Use lowercase kebab-case: `viz-architecture.md`, not `VizArchitecture.md`
- Name by topic, not chronology: `patterns.md`, not `session-2024-12.md` — retrieval is by subject, and a date-named file is never the one a reader thinks to open
- Group related items: combine "R debugging" and "WSL quirks" into `patterns.md` rather than creating one file per fact

**Expected:** MEMORY.md moves down on the binding cap — re-measure with Step 1's block rather than assuming, because moving 15 long lines out buys more size than the line count suggests. Each topic file is self-contained and readable without MEMORY.md context, and the link replacing it is a real link target.

**On failure:** If a topic file would be fewer than 5 lines, it's probably not worth extracting — leave it inline in MEMORY.md. Extracting a 3-line section costs a link line and buys almost nothing on either cap.

### Step 5: Update MEMORY.md

Apply all changes: remove stale entries, add new entries, update counts, and ensure the Topic Files section lists all dedicated files.

MEMORY.md structure should follow this pattern:

```markdown
# Project Memory

## Section 1 — High-level context
- Bullet points, concise

## Section 2 — Another topic
- Key facts only

## Topic Files
- [file.md](file.md) — What it covers
```

Guidelines:
- Aim for ~150 units per entry — one or two lines. That target sits *above* the ~125-units-per-line crossover, so an index written to it is size-bound by design: the real budget is ~166 lines, not 200. Plan for that number rather than counting toward 200
- Watch the units as well as the lines: two dense lines can cost more budget than three short ones, so tightening wording buys headroom that deleting a bullet does not
- Use inline formatting (`code`, **bold**) for scanability
- Put the most frequently needed context first
- The Topic Files section should always be last

**Expected:** MEMORY.md sits inside both caps (`max(size / 25000, lines / 200) < 0.80`), reported as both numbers, is accurate, and has working links to all topic files.

**On failure:** If you can't get under `0.80` on the binding cap after extraction, identify the least-frequently-used section and extract it. Every section is a candidate — even the project structure overview can go to a topic file if needed, leaving just a 1-line summary. If the binding cap is `size`, prefer shortening long lines over deleting whole ones; if it is `lines`, the opposite.

### Step 6: Verify Integrity

Run a final check on the budget, on reachability, and on accuracy:

1. **Budget**: re-run Step 1's dual-cap block and record both fractions and which cap binds
2. **Links**: verify every topic file referenced in MEMORY.md exists on disk
3. **Reachability**: verify every topic file on disk is referenced from MEMORY.md
4. **Accuracy**: spot-check 2-3 factual claims against project state

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

Five rules the check honors, each of them a real miss someone has already made — do not quietly drop one when adapting the block:

1. **Exclude template/example link targets.** A format-documentation line such as `- [Title](file.md) — hook` otherwise reports as a dangling link forever, and a check that cries wolf trains its operator to ignore it. That is what the `EXAMPLES` set is for.
2. **A prose mention is not reachability.** Require an exact filename match on a real link target. Report near-matches separately as *degraded references*; never count them as reachable. A file the index only talks about is a file nothing will open.
3. **HTML comments in the index are not a mitigation.** They are stripped before the index reaches the model, so a curator note left in one is written into a void. Since Claude Code v2.1.211 the caps exclude stripped comments as well, so it does not even register as budget pressure; before that release it consumed budget too. If a note must survive, it has to be a plain markdown line.
4. **Parse frontmatter, do not grep it.** A `^type:` regex misses a field nested under `metadata:` and reports a conformance failure that does not exist.
5. **Report both denominators, labeled.** File share and byte share are different numbers and must never be printed interchangeably — five orphans out of 70 files is 7% of files and can still be half the bytes.

**Expected:** Both cap fractions under `0.80` with the binding cap named, `DANGLING 0`, `ORPHANS 0`, and spot-checked claims accurate.

**On failure:** Fix dangling links (update the target or remove the line). For each orphan, either add a real link in MEMORY.md or delete the file — but read it first: an orphan is usually content that *was* linked and lost its pointer in a rewrite, which is Step 7's subject.

### Step 7: Gate the Rewrite on Reachability

Steps 4 and 5 rewrite the index, and a rewrite is the only operation that can silently strip a topic file of its last pointer. Snapshot the set of linked filenames **before** the rewrite and again **after**; any name that disappears without a replacement pointer is a reachability regression, and this step fails until there is an explicit, recorded decision about that file.

```bash
# Exactly Step 6's reachability semantics: comments stripped first, basenames,
# format-documentation targets excluded. Stripping matters — a link commented
# out during the rewrite is textually still there and reachable to nothing.
links() { python3 -c '
import os, re, sys
t = re.sub(r"<!--.*?-->", "", open(sys.argv[1], "rb").read().decode("utf-8", "replace"), flags=re.S)
E = {"file.md", "example.md", "topic-name.md"}
for n in sorted({os.path.basename(m) for m in re.findall(r"\]\(([^)#\s]+\.md)", t)} - E): print(n)
' "$1"; }

links <memory-dir>/MEMORY.md > /tmp/linked.before
#   ... run Step 4 and Step 5 here ...
links <memory-dir>/MEMORY.md > /tmp/linked.after

comm -23 /tmp/linked.before /tmp/linked.after   # lost their only pointer — STOP
comm -13 /tmp/linked.before /tmp/linked.after   # newly reachable — expected after extraction
```

The gate belongs at the moment of rewrite rather than at the next audit, because that is the only moment the context needed to recover the entry still exists. During the rewrite you know why a line went away — it was folded into a neighbor, its topic was retired, it was a duplicate. A week later the orphan file is on disk with no record of which index line used to point at it, and the only honest options left are to read the whole file and re-derive a summary, or to delete content nobody can any longer judge.

Two facts that make this step load-bearing rather than ceremonial:

- **A write succeeding tells you nothing about whether the memory will ever be read again.** Verify reachability, not write success — and verify it every session, because the operation that breaks reachability (compaction) is the same operation the caps make mandatory. Nothing deletes these files: Claude Code's retention sweep excludes the memory directory, so a topic file survives indefinitely. Survival is not the risk; unreachability is.
- **Nothing here is enforced at write time.** These skills run as out-of-band maintenance in an ordinary session; the path that actually writes memory is not the path that runs skills. Every guarantee in this file is *verified when the skill last ran*, not an invariant.

**Expected:** `comm -23` prints nothing, or every name it prints has a recorded decision — re-linked, deliberately deleted, or deliberately merged into a named surviving entry.

**On failure:** Do not proceed and do not "fix" it by deleting the newly-orphaned file. Restore the missing link, or write the decision down in the index entry that absorbed it (`— absorbed <name>.md`) so the next audit finds a reason rather than a mystery.

## Validation

- [ ] MEMORY.md is within both caps (`max(size / 25000, lines / 200) < 0.80`), reported as both numbers
- [ ] The report names which cap binds — a line count alone is not a measurement of the budget
- [ ] All topic files referenced in MEMORY.md exist on disk (`DANGLING 0`)
- [ ] No orphan `.md` files in the memory directory — every file is reachable from an exact link target in MEMORY.md, not merely mentioned in its prose (`ORPHANS 0`)
- [ ] The linked-filename set after a rewrite is a superset of the set before it, or every removal carries a recorded decision
- [ ] No stale counts or renamed paths in any memory file
- [ ] New entries meet the durability/non-duplication/verified/actionable criteria
- [ ] Topic files have descriptive headers and are self-contained
- [ ] MEMORY.md reads as a useful quick-reference, not a changelog

## Common Pitfalls

- **Memory file pollution**: Writing every session observation to memory. Most findings are session-specific and don't need persisting. Apply the four filters (Step 3) before writing.
- **Stale counts**: Updating code but not memory. Counts (skills, agents, domains, files) drift silently. Always verify counts against the source of truth before trusting memory.
- **Duplicating CLAUDE.md**: CLAUDE.md is the authoritative project instruction file. Memory should capture things NOT in CLAUDE.md — debugging insights, architecture decisions, workflow preferences, cross-project patterns.
- **Measuring lines instead of size**: A line-only check reports false headroom, because the two caps do not bind at the same place. Above ~125 units per line the size cap binds first, so an index at 129 of 200 lines can already be at 75% of its real budget and a `wc -l` reading of "65%" is wrong in the dangerous direction. Measure both, act on `max(size / 25000, lines / 200)`, and name which cap binds.
- **Trusting a byte count**: `wc -c` is not the cap either. The cap counts UTF-16 code units, and bytes over-report against it — by up to 3x on CJK content — so a byte-only checker demands prunes the loader does not need. Count units (`sum(2 if ord(c) > 0xFFFF else 1 for c in text)`), and do not paper over the ambiguity with `max(bytes, chars)`: that hedge was measured over-reporting 2.44x on a CJK index (pjt222/agent-almanac#407, comment).
- **Assuming a skill's guarantees hold at write time**: Nothing in this file is enforced on write. The path that writes memory is not the path that runs skills, so every checkbox above describes the state when this skill last ran — not an invariant the harness maintains. A memory written after the last audit is unaudited, however green the last report was.

## Related Skills

- `verify-memory-integrity` — the non-mutating verification pass; Step 6 and Step 7 delegate their checks to it, so the caps, dangling links, orphans, and the before/after link sets can all be confirmed without writing a byte of memory
- `write-claude-md` — CLAUDE.md captures project instructions; memory captures cross-session learning
- `prune-agent-memory` — the inverse of manage-memory: auditing, classifying, and selectively forgetting stored memories
- `write-continue-here` — write a structured continuation file for session handoff; complements memory as a short-term context bridge
- `read-continue-here` — read and act on a continuation file at session start; the consumption side of the handoff
- `create-skill` — new skills may produce memory-worthy patterns
- `heal` — self-healing may update memory as part of integration step
- `meditate` — meditation sessions may surface insights worth persisting
- `catalog-collection` — the index/stacks split is a cataloging problem: `MEMORY.md` is the catalog and the topic files are the collection, and an entry that is not an access point is not findable
- `preserve-materials` — an unreferenced topic file is not archived, it is lost; preservation practice draws the same line between what is stored and what is retrievable
