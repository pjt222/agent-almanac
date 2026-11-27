# Policy Reference — prune-agent-memory

Reference tables, templates, and rationale extracted from `SKILL.md` for progressive disclosure.

## Memory Type Classification Table (Step 1)

| Type | Description | Example | Default retention |
|---|---|---|---|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

## Pruning Decision Tree & Tombstone Rationale (Step 4)

Apply withdrawal rules in priority order:

```text
Pruning Decision Tree (apply in order):

1. EPHEMERAL entries (Step 1 classification)
   → Withdraw immediately. These should never have been persisted.

2. FAILED fidelity entries (Step 3)
   → Withdraw immediately. Inaccurate memories are worse than no memories.

3. DUPLICATES
   → Keep the most complete/accurate version, withdraw the others.
   → If duplicates span MEMORY.md and a topic file, keep the topic file version.

4. STALE entries with known corrections (Step 2)
   → UPDATE if the entry is otherwise useful (change the stale value to current).
   → WITHDRAW if the entire entry is obsolete (the topic no longer matters).

5. LOW fidelity entries (Step 3)
   → Withdraw. These take space without providing value.
   → A low access-frequency estimate never carries this on its own: it is a
     guess (Step 1). Require the Step 3 fidelity finding.

6. MEDIUM fidelity entries about completed/closed work
   → Withdraw. Past sprint details, resolved incidents, merged PRs.
   → Exception: keep if the resolution contains a reusable pattern.

7. REFERENCE entries with freely available sources
   → Withdraw if the reference is a Google search away.
   → Keep if the reference is hard to find or has project-specific context.
```

### Why Tombstones Are Required

Step 9's **On failure** clause tells you to reconstruct from the audit trail when re-synthesis shows a pass was too aggressive. A one-line prose summary in the log (`"skills/ has 280 SKILL.md files" | Project | Count drift`) cannot reconstruct the removed body; a tombstone under `<memory-dir>/deaccessioned/<original-name>.md` linked by `register_id` keeps the body on disk.

This borrows the existing `janitor` `backup_before_delete` pattern (`archive/` under the rule "Orphaned files archived (not deleted)"). Withdrawal runs alongside inoculation (Step 5): a SUPERSEDED counter-memory keeps the *lesson* in retrieval, while a tombstone keeps the *content* out of retrieval. Because Step 9's reachability scan reads only the top level of `<memory-dir>`, `deaccessioned/` tombstones never report as orphans.

## Counter-Memory Inoculation Rules & SUPERSEDED Template (Step 5)

| Memory category | Action | Why |
|---|---|---|
| Stale fact, outdated pointer, expired context | **Withdraw-only** | Retrieval cleanup; no behavioral risk if regenerated |
| Failed strategy, dangerous pattern, abandoned approach with persistent triggers | **Withdraw + inoculate** | The reasoning path will regenerate the conclusion otherwise |
| Decision later overridden but original rationale matters | **Inoculate-only** | Preserve original entry; add SUPERSEDED counter-memory pointing to it |

```markdown
---
name: superseded-<short-id>
description: Counter-memory preventing re-derivation of <pattern>
type: superseded
---

SUPERSEDED <YYYY-MM-DD>
Pattern: <what was tried — describe the conclusion or strategy>
Period: <start> to <end>
Evidence: <what happened — concrete data, not narrative>
Abandonment reason: <specific cause; not "did not work">
Do not re-derive from: <signal types or input patterns that previously led here>
Supersedes: <tombstone path if withdraw + inoculate, or N/A>
```

**When NOT to inoculate:**
- Trivial stale facts (no behavioral risk if regenerated)
- Memories where the original triggering conditions no longer exist (rename completed, dependency removed, team disbanded)
- Decisions where re-derivation under new evidence is actively desirable

**Inoculation hygiene:**
- Keep `Pattern` and `Do not re-derive from` specific — vague counter-memories are noise.
- Date the SUPERSEDED entry so old inoculations can be reviewed in future cycles.
- One SUPERSEDED per abandoned pattern; never chain multiple abandonments into one file.
- Record the SUPERSEDED file path on the register row alongside the tombstone path.

## Preemptive Filter Patterns (Step 6)

| Pattern | Why | Example |
|---|---|---|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

## Protected Memory Criteria (Step 8)

| Category | Examples | Why protected |
|---|---|---|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

## Staleness & Fidelity Spot-Check Commands (Steps 2–3)

```bash
# Step 2: Spot-check counts against source of truth
grep -oP '\d+ skills' <memory-dir>/MEMORY.md
grep -c "^      - id:" skills/_registry.yml

# Check for references to files that no longer exist
grep -oP '`[^`]+\.(md|yml|R|js|ts)`' <memory-dir>/MEMORY.md | sort -u | while read f; do
  path="${f//\`/}"
  [ ! -f "$path" ] && echo "STALE: $path referenced but not found"
done

# Check for references to old names/paths
grep -i "old-name\|previous-name\|renamed-from" <memory-dir>/*.md
```

```bash
# Step 3: Compression loss detection — find source commits/PRs for a memory entry
git log --oneline --all --grep="<keyword from memory entry>" | head -5

# Contradiction scan — compare counts against CLAUDE.md
grep -n "total" <memory-dir>/MEMORY.md
grep -n "total" CLAUDE.md
```

## Reachability Rules & Drift Recovery Details (Steps 9–10)

### Rules the Step 9 Reachability Scan Honors

- **Exclude template/example link targets:** format-documentation targets like `- [Title](file.md) — hook` otherwise report as dangling forever.
- **A prose mention is not reachability:** require an exact filename match on a real link target; near-matches are *degraded references*, never reachable.
- **HTML comments in the index are not a mitigation:** they are stripped before the index reaches the model, so any surviving curator note must be plain markdown.
- **Report both denominators, labeled:** file share and byte share are distinct numbers and never interchangeable.
- `deaccessioned/` tombstones live in a subdirectory, so the top-level reachability scan never flags them as orphans.

### Step 10 Drift Detection Triggers & Recovery Procedure

**Triggers:** memory claim contradicts current tool output/file contents; count or version disagrees with registry/lockfile; referenced path returns "file not found"; dependency memory names a renamed/deprecated package.

1. **Identify the drift:** compare the claim against ground truth (`git log`, registry, files on disk).
2. **Assess recoverability:** if current ground truth is determinable, update in-place with `[corrected YYYY-MM-DD]`; otherwise mark `unverifiable` and flag for withdrawal.
3. **Trace the cause:** distinguish gradual count drift from discrete events (renames, migrations) and scan for affected sibling entries.
4. **Prevent recurrence:** replace fast-moving counts/versions with pointers to the authoritative source (`skills/_registry.yml`).

### Cold Memory Classification (Step 9)

Review entries that survived pruning but whose topics have not come up recently (labeled as an estimate — no read counter exists):

- **Cold-from-disuse:** Topic aligns with active project goals, but the phase that generated it has passed (e.g., CRAN submission notes during active development). Retain for when that phase resumes.
- **Cold-from-irrelevance:** Topic was always marginal — a one-off experiment, tangential investigation, or superseded approach. Flag for withdrawal in the next pruning cycle.
