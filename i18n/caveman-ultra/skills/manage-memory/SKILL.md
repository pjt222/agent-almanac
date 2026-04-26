---
name: manage-memory
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Organize, extract, prune, verify Claude Code persistent memory files.
  MEMORY.md as concise index, topic extraction to dedicated files, staleness
  detection, accuracy verification vs project state, 200-line truncation.
  Use when MEMORY.md nearing 200-line limit, after session produces durable
  insights, when topic section > 10-15 lines should extract, or when project
  state changed + memory entries may be stale.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, claude-code, organization, maintenance, auto-memory
---

# Manage Memory

Maintain Claude Code's persistent memory dir → accurate, concise, useful across sessions. MEMORY.md loaded into system prompt every conv — lines after 200 truncated → file must be lean index pointing to topic files for detail.

## Use When

- MEMORY.md nearing 200-line limit
- Session produced durable insights worth preserving (new patterns, arch decisions, debugging solutions)
- Topic section in MEMORY.md > 10-15 lines → extract
- Project state changed (renamed files, new domains, updated counts) → entries may be stale
- Starting new work area → check if relevant memory exists
- Periodic maintenance between sessions

## In

- **Req**: Access to memory dir (typically `~/.claude/projects/<project-path>/memory/`)
- **Opt**: Specific trigger ("MEMORY.md too long", "just finished major refactor")
- **Opt**: Topic to add / update / extract

## Do

### Step 1: Assess Current State

Read MEMORY.md + list all files in memory dir:

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

Check line count vs 200-line limit. Inventory existing topic files.

→ Clear picture of total lines, # topic files, which sections exist in MEMORY.md.

**If err:** Memory dir doesn't exist → create. MEMORY.md doesn't exist → minimal one w/ `# Project Memory` header + `## Topic Files` section.

### Step 2: ID Stale Entries

Compare memory claims vs current project state. Common staleness:

1. **Count drift**: File counts, skill counts, domain counts changed after additions/removals
2. **Renamed paths**: Files / dirs moved / renamed
3. **Superseded patterns**: Workarounds no longer needed after fixes
4. **Contradictions**: Two entries saying diff things about same topic

Use Grep to spot-check:

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

→ List of stale entries w/ correct current vals.

**If err:** Can't verify claim (refs external state) → leave but add `(unverified)` note rather than silently preserve potentially wrong info.

### Step 3: Decide What to Add

For new entries, apply filters before writing:

1. **Durability**: Will this be true next session? Avoid session-specific (current task, in-progress, temporary).
2. **Non-duplication**: CLAUDE.md / project docs already cover? Don't duplicate — memory for things NOT captured elsewhere.
3. **Verified**: Confirmed across multi interactions, or single obs? Single → verify vs project docs before writing.
4. **Actionable**: Does knowing change behavior? "Sky blue" ≠ useful. "Exit code 5 = quoting err → use temp files" changes how you work.

Exception: User explicitly asks to remember → save immediately, no multi confirmations needed.

→ Filtered list worth adding, each meeting durability + non-dup + verified + actionable.

**If err:** Unsure if worth keeping → err toward keeping briefly in MEMORY.md — easier to prune later than rediscover.

### Step 4: Extract Oversize Topics

Section > ~10-15 lines → extract to dedicated topic file:

1. Create `<memory-dir>/<topic-name>.md` w/ descriptive header
2. Move detailed content from MEMORY.md → topic file
3. Replace section in MEMORY.md w/ 1-2 line summary + link:

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

Naming conventions:
- Lowercase kebab-case: `viz-architecture.md`, not `VizArchitecture.md`
- Name by topic, not chronology: `patterns.md`, not `session-2024-12.md`
- Group related: combine "R debugging" + "WSL quirks" → `patterns.md` vs one file per fact

→ MEMORY.md stays < 200 lines. Each topic file self-contained + readable w/o MEMORY.md ctx.

**If err:** Topic file < 5 lines → probably not worth extracting → leave inline.

### Step 5: Update MEMORY.md

Apply changes: remove stale, add new, update counts, ensure Topic Files section lists all dedicated files.

MEMORY.md structure:

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
- Each bullet 1-2 lines max
- Inline formatting (`code`, **bold**) for scanability
- Most frequently needed ctx first
- Topic Files section always last

→ MEMORY.md < 200 lines, accurate, working links to all topic files.

**If err:** Can't get < 200 after extraction → ID least-freq-used section + extract. Every section candidate — even project structure overview can go to topic file if needed, leaving 1-line summary.

### Step 6: Verify Integrity

Final check:

1. **Line count**: MEMORY.md < 200
2. **Links**: Every topic file referenced exists
3. **Orphans**: Topic files not referenced in MEMORY.md
4. **Accuracy**: Spot-check 2-3 factual claims vs project state

```bash
wc -l <memory-dir>/MEMORY.md
# Check for broken links
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Check for orphan files
ls <memory-dir>/*.md | grep -v MEMORY.md
```

→ Line count < 200, no broken links, no orphans, spot-checked claims accurate.

**If err:** Fix broken links (update / remove). Orphans → add ref in MEMORY.md / delete if no longer relevant.

## Check

- [ ] MEMORY.md < 200 lines
- [ ] All referenced topic files exist on disk
- [ ] No orphan `.md` in memory dir (every file linked from MEMORY.md)
- [ ] No stale counts / renamed paths
- [ ] New entries meet durability / non-dup / verified / actionable
- [ ] Topic files have descriptive headers + self-contained
- [ ] MEMORY.md reads as quick-ref, not changelog

## Traps

- **Memory file pollution**: Writing every session obs to memory. Most findings session-specific + don't need persisting. Apply 4 filters (Step 3) before writing.
- **Stale counts**: Updating code but not memory. Counts (skills, agents, domains, files) drift silently. Always verify vs source of truth before trusting memory.
- **Chronological organization**: "When I learned" vs "what it's about". Topic-based (`patterns.md`, `viz-architecture.md`) > date-based files.
- **Duplicate CLAUDE.md**: CLAUDE.md = authoritative project instructions. Memory captures things NOT in CLAUDE.md — debugging insights, arch decisions, workflow prefs, cross-project patterns.
- **Over-extraction**: Topic file for every 3-line section. Only extract when > ~10-15 lines. Small sections inline.
- **Forget 200-line limit**: MEMORY.md loaded every system prompt. Lines after 200 silently truncated. Grows past → bottom content effectively invisible.

## →

- `write-claude-md` — CLAUDE.md captures project instructions; memory captures cross-session learning
- `prune-agent-memory` — inverse of manage-memory: auditing, classifying, selectively forgetting stored
- `write-continue-here` — structured continuation file for session handoff; complements memory as short-term bridge
- `read-continue-here` — read + act on continuation at session start; consumption side of handoff
- `create-skill` — new skills may produce memory-worthy patterns
- `heal` — self-healing may update memory as part of integration step
- `meditate` — meditation sessions may surface insights worth persisting
