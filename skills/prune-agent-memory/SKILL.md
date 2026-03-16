---
name: prune-agent-memory
description: >
  Audit, classify, and selectively forget stored memories. Covers memory
  enumeration and classification by type/age/access frequency, staleness
  detection for outdated references, fidelity checks using external anchors,
  a decision tree for selective deletion, preemptive filtering rules for what
  should never become memories, and an audit trail so forgetting itself is
  reviewable. Use when memory has grown large and uncurated, when project
  state has shifted significantly since memories were written, when retrieval
  quality has degraded, or as periodic maintenance alongside manage-memory.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory
---

# Prune Agent Memory

Audit, classify, and selectively forget stored memories. Memory is infrastructure. Forgetting is policy. This skill defines the policy.

Where `manage-memory` focuses on organizing and growing memory (what to keep, how to structure it), this skill focuses on the inverse: what to discard, how to detect decay, and how to ensure that forgetting is deliberate rather than accidental. The two skills are complementary and should be used together during periodic maintenance.

## When to Use

- Memory files have grown large and no one has audited them for relevance
- Project state has shifted significantly (major refactors, renamed repos, completed milestones) and memories likely reference outdated context
- Retrieval quality has degraded — memories are producing noise instead of signal
- After a burst of activity that generated many memory entries without curation
- As a scheduled maintenance task (e.g., every 10-20 sessions or at project milestones)
- When multiple memory entries cover the same topic with slight variations (duplication drift)
- Before onboarding a new collaborator who will inherit the memory context

## Inputs

- **Required**: Path to the memory directory (typically `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Retention policy overrides (e.g., "keep everything about deployment," "aggressively prune debug notes")
- **Optional**: Known project state changes since last audit (e.g., "repo was renamed," "migrated from Jest to Vitest")
- **Optional**: Previous pruning audit trail for trend analysis

## Procedure

### Step 1: Enumerate and Classify Memories

Read all memory files and classify each entry by four dimensions.

```bash
# Inventory the memory directory
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Count total entries (approximate by counting top-level bullets and headers)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

Classify each memory entry into one of these types:

| Type | Description | Example | Default retention |
|------|-------------|---------|-------------------|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

For each entry, also note:
- **Age**: When was it written or last updated?
- **Access frequency**: Has this entry been useful in recent sessions? (Estimate based on topic relevance to recent work)

**Expected:** A complete inventory with every memory entry classified by type, with age and access frequency estimates. Ephemeral entries are already flagged for immediate removal.

**On failure:** If memory files are too large or unstructured to classify entry-by-entry, work at the section level. Classify entire sections rather than individual bullets. The goal is coverage, not granularity.

### Step 2: Detect Staleness

Compare memory claims against current project state. Staleness is the most common form of memory decay.

Check for these staleness patterns:

1. **Count drift**: Counts of files, skills, agents, domains, team members that have changed
2. **Path drift**: Files, directories, or URLs that were moved, renamed, or deleted
3. **State drift**: Statuses (resolved issues, completed milestones, closed PRs) still described as open or in-progress
4. **Decision reversal**: Decisions that were later overridden but the original rationale remains in memory
5. **Tool/version drift**: Version numbers, API signatures, or tool names that changed (e.g., package renames)

```bash
# Spot-check counts against source of truth
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

Mark each stale entry with the type of staleness and the current correct value.

**Expected:** A list of stale entries with specific evidence of what changed. Each stale entry has a recommended action: update (if the correct value is known), verify (if uncertain), or prune (if the entire entry is obsolete).

**On failure:** If you cannot verify a claim because it references external state (APIs, third-party docs, deployment status), mark it as `unverifiable` rather than assuming it is correct. Unverifiable entries are candidates for pruning if they are not actively useful.

### Step 3: Run Fidelity Checks

Test whether memories still produce useful context when retrieved. This is the hardest step because an agent cannot verify whether its own compressed memories are faithful — you need external anchors.

Fidelity check methods:

1. **Round-trip verification**: Read a memory entry, then check the actual project state it describes. Does the memory lead you to the right file, the right pattern, the right conclusion?

2. **Compression loss detection**: Compare memory summaries against the original source material. When a 50-line discussion was compressed to a 2-line memory, did the compression preserve the actionable insight or just the topic label?

   ```bash
   # Find the source that a memory entry was derived from
   # (git log, old PRs, original files)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **Contradiction scan**: Search for memories that contradict each other or contradict CLAUDE.md / project documentation.

   ```bash
   # Look for potential contradictions in counts
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Compare the values — they should agree
   ```

4. **Utility test**: For each memory entry, ask: "If this entry were deleted, would anything go wrong in the next 5 sessions?" If the answer is "probably not," the entry has low fidelity value regardless of accuracy.

**Expected:** Each memory entry now has a fidelity assessment: **high** (verified accurate and useful), **medium** (probably accurate, occasionally useful), **low** (unverified or rarely useful), or **failed** (verified inaccurate or contradictory).

**On failure:** If fidelity checks are inconclusive for many entries, focus on the entries with the highest potential impact. A wrong memory about project architecture is more dangerous than a wrong memory about a debugging trick. Prioritize checking skeleton-level facts over flesh-level details.

### Step 4: Apply Selective Deletion

Use this decision tree to determine what to prune, in priority order:

```
Pruning Decision Tree (apply in order):

1. EPHEMERAL entries (Step 1 classification)
   → Delete immediately. These should never have been persisted.

2. FAILED fidelity entries (Step 3)
   → Delete immediately. Inaccurate memories are worse than no memories.

3. DUPLICATES
   → Keep the most complete/accurate version, delete others.
   → If duplicates span MEMORY.md and a topic file, keep the topic file version.

4. STALE entries with known corrections (Step 2)
   → UPDATE if the entry is otherwise useful (change the stale value to current).
   → DELETE if the entire entry is obsolete (the topic no longer matters).

5. LOW fidelity, low access frequency entries
   → Delete. These are taking space without providing value.

6. MEDIUM fidelity entries about completed/closed work
   → Archive or delete. Past sprint details, resolved incidents, merged PRs.
   → Exception: keep if the resolution contains a reusable pattern.

7. REFERENCE entries with freely available sources
   → Delete if the reference is a Google search away.
   → Keep if the reference is hard to find or has project-specific context.
```

For each deletion, record the entry, its classification, and the reason for deletion (used in Step 6).

**Expected:** A clear list of entries to delete, entries to update, and entries to keep — each with a documented reason. The keep/delete ratio depends on memory health; a well-maintained memory might prune 5-10%, a neglected one might prune 30-50%.

**On failure:** If the decision tree produces ambiguous results for many entries, apply a tighter filter: "Would I write this entry today, knowing what I know now?" If not, it is a deletion candidate. Err toward pruning — it is easier to re-learn a fact than to work around a wrong memory.

### Step 5: Apply Preemptive Filters

Define "what NOT to save" rules to prevent future memory pollution. Review existing memories for patterns that should have been filtered at write time.

Patterns that should **never** become persistent memories:

| Pattern | Why | Example |
|---------|-----|---------|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

If any of these patterns are found in existing memory, add them to the deletion list from Step 4.

Document the filter rules in MEMORY.md or a `retention-policy.md` topic file so future sessions can reference them before writing new memories.

**Expected:** A set of preemptive filter rules documented in the memory directory. Any existing entries matching these patterns are flagged for deletion.

**On failure:** If documenting filter rules feels premature (memory is small, pollution is minimal), skip the documentation but still apply the filters to catch any existing violations. The rules can be formalized later when the memory directory is more mature.

### Step 6: Write Audit Trail

Log every deletion so the forgetting itself is reviewable. Create or update a pruning log.

```markdown
<!-- In <memory-dir>/pruning-log.md or appended to MEMORY.md -->

## Pruning Log

### YYYY-MM-DD Audit
- **Entries audited**: N
- **Entries pruned**: M (X%)
- **Entries updated**: K
- **Staleness found**: [list of stale patterns detected]
- **Fidelity failures**: [list of entries that failed verification]

#### Deletions
| Entry (summary) | Type | Reason |
|-----------------|------|--------|
| "Currently working on issue #42" | Ephemeral | Session-specific, stale |
| "skills/ has 280 SKILL.md files" | Project | Count drift: actual is 310 |
| "Use acquaint::mcp_session()" | Pattern | Package renamed to mcptools |
```

Keep the pruning log concise. It exists for accountability, not archaeology. If the log itself grows large, summarize older entries: "2025: 3 audits, 47 total entries pruned (mostly count drift and ephemeral leakage)."

**Expected:** A timestamped pruning log entry documenting what was deleted and why. The log is stored in the memory directory alongside the memories themselves.

**On failure:** If creating a separate log file feels excessive (only 1-2 entries pruned), add a brief note to MEMORY.md instead: `<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`. Any record is better than silent deletion.

### Step 7: Designate Protected Memories

Certain memory entries should be immune from pruning regardless of age, access frequency, or fidelity score. These represent irreplaceable context that, if lost, would require significant effort to reconstruct.

**Protected memory criteria:**

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**Designation method:** Mark protected entries with `<!-- PROTECTED -->` inline or maintain a `protected` list in the pruning log. The decision tree in Step 4 must check for protected status before applying any deletion rule.

**Unprotecting:** To prune a protected entry, explicitly remove the designation first and document the reason in the pruning log. This two-step process prevents accidental deletion of high-value memories.

**Expected:** Protected entries survive all prune passes. The pruning log records any protection additions or removals.

**On failure:** If the protected set grows too large (>30% of total entries), review the criteria — protection is for irreplaceable context, not for "important" entries. Important but reconstructible facts should remain subject to normal pruning.

### Step 8: Re-Synthesize After Pruning

After deletion, remaining memories may be fragmented — cross-references point to deleted entries, topic files lose coherence, and MEMORY.md may have gaps. Re-synthesis restores structural integrity.

**Re-synthesis checklist:**

1. **Resolve broken references**: Scan remaining entries for links to deleted content. Remove or redirect the reference.
2. **Merge related fragments**: If pruning left two entries covering overlapping aspects of the same topic, merge them into one coherent entry.
3. **Update topic file structure**: If a topic file lost >50% of its content, consider folding the remainder back into MEMORY.md and deleting the topic file.
4. **Classify cold memories**: Review entries that survived pruning but have not been accessed recently:
   - **Cold-from-disuse**: Topic aligns with active project goals but the specific phase that generated it has passed. Retain — it may become relevant again when that phase resumes (e.g., CRAN submission notes during active development).
   - **Cold-from-irrelevance**: Topic was always marginal — a one-off experiment, a tangential investigation, or a superseded approach. Flag for deletion in the next pruning cycle.
5. **Verify MEMORY.md coherence**: Read MEMORY.md top-to-bottom. It should tell a coherent story about the project, not read as a random collection of facts.

**Expected:** Post-pruning memory is structurally sound — no orphan references, no redundant fragments, no incoherent topic files. Cold entries are classified for future pruning decisions.

**On failure:** If re-synthesis reveals that pruning was too aggressive (critical context was lost), check the pruning log and reconstruct from the audit trail. This is why the audit trail exists.

### Step 9: Recover from Memory Drift

Memory drift occurs when stored facts become silently wrong — not because they were always wrong, but because the underlying reality changed and the memory was not updated. Drift recovery attempts to fix memories in-place rather than pruning them.

**Drift detection triggers:**

- A memory claim contradicts current tool output or file contents
- A count or version number in memory does not match the registry or lockfile
- A path in memory returns "file not found"
- A memory about a dependency references a renamed or deprecated package

**Recovery procedure:**

1. **Identify the drift**: Compare the memory claim against the current ground truth (git log, registry, actual files)
2. **Assess recoverability**: Can the correct value be determined from current project state?
   - Yes → Update the memory entry in-place with the current value and a `[corrected YYYY-MM-DD]` annotation
   - No → Mark the entry as `unverifiable` and flag for pruning
3. **Trace the cause**: Was this a gradual drift (count slowly diverged) or a discrete event (rename, migration)? Discrete events often affect multiple entries — scan for siblings.
4. **Prevent recurrence**: If the drift affects a frequently-changing value (counts, versions), consider whether the memory should track the value at all or instead reference the source of truth: "See skills/_registry.yml for current count" rather than "317 skills."

**Expected:** Drifted memories are corrected in-place where possible, preserving context. Entries that cannot be corrected are flagged for pruning. Prevention rules reduce future drift.

**On failure:** If drift is widespread (>20% of entries), the memory may need a full rebuild rather than incremental correction. In that case, archive the current memory directory, start fresh, and selectively re-import entries that pass verification.

## Validation

- [ ] All memory files were inventoried and entries classified by type
- [ ] Staleness checks were run against current project state
- [ ] At least one fidelity check method was applied (round-trip, compression loss, contradiction scan, or utility test)
- [ ] Deletion decisions follow the priority order in the decision tree
- [ ] No entries were deleted without a documented reason
- [ ] Preemptive filter rules are documented or applied
- [ ] Pruning log records what was deleted, when, and why
- [ ] MEMORY.md remains under 200 lines after pruning
- [ ] Remaining memories are accurate (spot-checked against project state)
- [ ] No orphan topic files were created by pruning references from MEMORY.md
- [ ] Protected entries are designated and survive all prune passes
- [ ] Post-pruning re-synthesis resolves broken cross-references and merges fragments
- [ ] Cold entries are classified as disuse vs irrelevance for future pruning decisions
- [ ] Drifted entries are corrected in-place where possible, not just deleted

## Common Pitfalls

- **Pruning without verification**: Deleting entries because they "look old" without checking whether they are still accurate and useful. Age alone is not a deletion criterion — some of the most valuable memories are old architectural decisions that remain true.
- **Self-verifying fidelity**: An agent reading its own compressed memory and concluding "yes, this seems right" is not a fidelity check. Fidelity requires external anchors: project files, git history, registry counts, actual tool output. Without anchors, you are checking consistency, not accuracy.
- **Aggressive pruning without audit trail**: Deleting entries without recording what was deleted. When a future session needs a fact that was pruned, the audit trail explains what happened and may contain enough context to reconstruct the memory.
- **Pruning decisions as memories**: Do not write "I decided to prune X because Y" as a regular memory entry. That goes in the pruning log only. Memory entries about memory management are meta-pollution.
- **Ignoring the preemptive filters**: Pruning existing entries but not establishing rules to prevent the same patterns from recurring. Without filters, the next 10 sessions will recreate the same ephemeral entries you just deleted.
- **Treating all types equally**: Decision memories and feedback memories should almost never be pruned — they represent user intent and rationale. Project and reference memories are the primary pruning targets because they track state that changes.
- **Confusing compression with corruption**: A memory that summarizes a complex topic in one line is compressed, not corrupted. Only flag it as a fidelity failure if the compression lost the actionable insight, not merely the detail.
- **Over-pinning**: Marking too many entries as protected defeats the purpose of pruning. If >30% of entries are protected, the criteria are too loose. Protect irreplaceable context, not merely important facts.
- **Re-synthesis loops**: Merging fragments during re-synthesis can create new entries that themselves need pruning next cycle. Keep merges minimal — combine only entries that clearly cover the same topic. Do not synthesize new insights during a pruning pass.

## Related Skills

- `manage-memory` — the complementary skill for organizing and growing memory; use together for complete memory maintenance
- `meditate` — clearing and grounding that may reveal which memories are creating noise
- `rest` — sometimes the best memory maintenance is not doing memory maintenance
- `assess-context` — evaluating reasoning context health, which memory quality directly affects
