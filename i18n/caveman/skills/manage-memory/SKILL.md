---
name: manage-memory
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Organize, extract, prune, and verify Claude Code persistent memory files.
  Covers MEMORY.md as a concise index, topic extraction to dedicated files,
  staleness detection, accuracy verification against project state, and
  the 200-line truncation constraint. Use when MEMORY.md is approaching the
  200-line limit, after a session produces durable insights worth preserving,
  when a topic section has grown beyond 10-15 lines and should be extracted,
  or when project state has changed and memory entries may be stale.
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

Maintain Claude Code's persistent memory directory so it stays accurate, concise, useful across sessions. MEMORY.md loaded into system prompt on every conversation — lines after 200 are truncated. File must be lean index pointing to topic files for detail.

## When Use

- MEMORY.md approaching 200-line truncation threshold
- Session produced durable insights worth preserving (new patterns, architecture decisions, debugging solutions)
- Topic section in MEMORY.md grown beyond 10-15 lines. Should be extracted
- Project state changed (renamed files, new domains, updated counts). Memory entries may be stale
- Starting new area of work. Check whether relevant memory already exists
- Periodic maintenance between sessions to keep memory directory healthy

## Inputs

- **Required**: Access to memory directory (typically `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Specific trigger (e.g., "MEMORY.md is too long," "just finished major refactor")
- **Optional**: Topic to add, update, or extract

## Steps

### Step 1: Assess Current State

Read MEMORY.md and list all files in memory directory:

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

Check line count against 200-line limit. Inventory existing topic files.

**Got:** Clear picture of total lines, number of topic files, which sections exist in MEMORY.md.

**If fail:** Memory directory doesn't exist? Create it. MEMORY.md doesn't exist? Create minimal one with `# Project Memory` header and `## Topic Files` section.

### Step 2: Identify Stale Entries

Compare memory claims against current project state. Common staleness patterns:

1. **Count drift**: File counts, skill counts, domain counts changed after additions/removals
2. **Renamed paths**: Files or directories moved or renamed
3. **Superseded patterns**: Workarounds no longer needed after fixes
4. **Contradictions**: Two entries saying different things about same topic

Use Grep to spot-check key claims:

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

**Got:** List of entries stale, with correct current values.

**If fail:** Can't verify claim (e.g., it references external state you can't check)? Leave it but add `(unverified)` note rather than silently preserving potentially wrong information.

### Step 3: Decide What to Add

For new entries, apply these filters before writing:

1. **Durability**: Will this be true next session? Avoid session-specific context (current task, in-progress work, temporary state).
2. **Non-duplication**: Does CLAUDE.md or project documentation already cover this? Don't duplicate — memory is for things NOT captured elsewhere.
3. **Verified**: Has this been confirmed across multiple interactions, or is it single observation? For single observations, verify against project docs before writing.
4. **Actionable**: Does knowing this change behavior? "The sky is blue" isn't useful. "Exit code 5 means quoting error — use temp files" changes how you work.

Exception: User explicitly asks to remember something? Save immediately — no need to wait for multiple confirmations.

**Got:** Filtered list of entries worth adding, each meeting durability + non-duplication + verification + actionability criteria.

**If fail:** Unsure whether entry is worth keeping? Err toward keeping briefly in MEMORY.md — easier to prune later than to rediscover.

### Step 4: Extract Oversize Topics

When section in MEMORY.md exceeds ~10-15 lines, extract to dedicated topic file:

1. Create `<memory-dir>/<topic-name>.md` with descriptive header
2. Move detailed content from MEMORY.md to topic file
3. Replace section in MEMORY.md with 1-2 line summary and link:

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

Naming conventions for topic files:
- Use lowercase kebab-case: `viz-architecture.md`, not `VizArchitecture.md`
- Name by topic, not chronology: `patterns.md`, not `session-2024-12.md`
- Group related items: combine "R debugging" and "WSL quirks" into `patterns.md` rather than creating one file per fact

**Got:** MEMORY.md stays under 200 lines. Each topic file self-contained and readable without MEMORY.md context.

**If fail:** Topic file would be fewer than 5 lines? Probably not worth extracting — leave inline in MEMORY.md.

### Step 5: Update MEMORY.md

Apply all changes: remove stale entries, add new entries, update counts, ensure Topic Files section lists all dedicated files.

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
- Keep each bullet to 1-2 lines maximum
- Use inline formatting (`code`, **bold**) for scanability
- Put most frequently needed context first
- Topic Files section should always be last

**Got:** MEMORY.md under 200 lines, accurate, has working links to all topic files.

**If fail:** Can't get under 200 lines after extraction? Identify least-frequently-used section, extract it. Every section is candidate — even project structure overview can go to topic file if needed, leaving just 1-line summary.

### Step 6: Verify Integrity

Run final check:

1. **Line count**: Confirm MEMORY.md under 200 lines
2. **Links**: Verify every topic file referenced in MEMORY.md exists
3. **Orphans**: Check for topic files not referenced in MEMORY.md
4. **Accuracy**: Spot-check 2-3 factual claims against project state

```bash
wc -l <memory-dir>/MEMORY.md
# Check for broken links
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Check for orphan files
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**Got:** Line count under 200, no broken links, no orphan files, spot-checked claims accurate.

**If fail:** Fix broken links (update or remove). Orphan files? Either add reference in MEMORY.md or delete if no longer relevant.

## Checks

- [ ] MEMORY.md under 200 lines
- [ ] All topic files referenced in MEMORY.md exist on disk
- [ ] No orphan `.md` files in memory directory (every file linked from MEMORY.md)
- [ ] No stale counts or renamed paths in any memory file
- [ ] New entries meet durability/non-duplication/verified/actionable criteria
- [ ] Topic files have descriptive headers and are self-contained
- [ ] MEMORY.md reads as useful quick-reference, not changelog

## Pitfalls

- **Memory file pollution**: Writing every session observation to memory. Most findings session-specific, don't need persisting. Apply four filters (Step 3) before writing.
- **Stale counts**: Updating code but not memory. Counts (skills, agents, domains, files) drift silently. Always verify counts against source of truth before trusting memory.
- **Chronological organization**: Organizing by "when I learned it" instead of "what it's about." Topic-based organization (`patterns.md`, `viz-architecture.md`) far more useful for retrieval than date-based files.
- **Duplicating CLAUDE.md**: CLAUDE.md is authoritative project instruction file. Memory should capture things NOT in CLAUDE.md — debugging insights, architecture decisions, workflow preferences, cross-project patterns.
- **Over-extraction**: Creating topic file for every 3-line section. Only extract when section exceeds ~10-15 lines. Small sections work fine inline.
- **Forgetting 200-line limit**: MEMORY.md loaded into every system prompt. Lines after 200 silently truncated. File grows past this? Bottom content effectively invisible.

## See Also

- `write-claude-md` — CLAUDE.md captures project instructions. Memory captures cross-session learning
- `prune-agent-memory` — inverse of manage-memory: auditing, classifying, selectively forgetting stored memories
- `write-continue-here` — write structured continuation file for session handoff. Complements memory as short-term context bridge
- `read-continue-here` — read and act on continuation file at session start. Consumption side of handoff
- `create-skill` — new skills may produce memory-worthy patterns
- `heal` — self-healing may update memory as part of integration step
- `meditate` — meditation sessions may surface insights worth persisting
