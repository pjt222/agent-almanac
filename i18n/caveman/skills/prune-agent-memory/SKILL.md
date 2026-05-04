---
name: prune-agent-memory
description: >
  Audit, classify, and selectively forget stored memories. Covers memory
  enumeration and classification by type/age/access frequency, staleness
  detection for outdated references, fidelity checks using external anchors,
  a decision tree for selective deletion, counter-memory inoculation for
  failed strategies that would otherwise be re-derived, preemptive filtering
  rules for what should never become memories, and an audit trail so
  forgetting itself is reviewable. Use when memory has grown large and
  uncurated, when project state has shifted significantly since memories
  were written, when retrieval quality has degraded, or as periodic
  maintenance alongside manage-memory.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory, inoculation
  locale: caveman
  source_locale: en
  source_commit: 480397b5
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Prune Agent Memory

Audit, classify, selectively forget stored memories. Memory is infrastructure. Forgetting is policy. This skill defines policy.

Where `manage-memory` focuses on organizing and growing memory (what to keep, how to structure it), this skill focuses on inverse: what to discard, how to detect decay, how to ensure forgetting is deliberate rather than accidental. The two skills complementary — use together during periodic maintenance.

## When Use

- Memory files grown large. No one has audited them for relevance
- Project state shifted significantly (major refactors, renamed repos, completed milestones). Memories likely reference outdated context
- Retrieval quality degraded — memories produce noise instead of signal
- After burst of activity that generated many memory entries without curation
- As scheduled maintenance task (e.g. every 10-20 sessions or at project milestones)
- Multiple memory entries cover same topic with slight variations (duplication drift)
- Before onboarding new collaborator who will inherit memory context
- After abandoning strategy or pattern whose triggering conditions still exist — to inoculate against re-derivation rather than rely on deletion

## Inputs

- **Required**: Path to memory directory (usually `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Retention policy overrides (e.g. "keep everything about deployment," "aggressively prune debug notes")
- **Optional**: Known project state changes since last audit (e.g. "repo was renamed," "migrated from Jest to Vitest")
- **Optional**: Previous pruning audit trail for trend analysis

## Steps

### Step 1: Enumerate and Classify Memories

Read all memory files. Classify each entry by four dimensions.

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

**Got:** Complete inventory with every memory entry classified by type. Age and access frequency estimates. Ephemeral entries already flagged for immediate removal.

**If fail:** Memory files too large or unstructured to classify entry-by-entry? Work at section level. Classify entire sections rather than individual bullets. Goal is coverage, not granularity.

### Step 2: Detect Staleness

Compare memory claims against current project state. Staleness is most common form of memory decay.

Check for these staleness patterns:

1. **Count drift**: Counts of files, skills, agents, domains, team members that have changed
2. **Path drift**: Files, directories, URLs that were moved, renamed, deleted
3. **State drift**: Statuses (resolved issues, completed milestones, closed PRs) still described as open or in-progress
4. **Decision reversal**: Decisions that were later overridden but original rationale remains in memory
5. **Tool/version drift**: Version numbers, API signatures, tool names that changed (e.g. package renames)

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

Mark each stale entry with type of staleness and current correct value.

**Got:** List of stale entries with specific evidence of what changed. Each stale entry has recommended action: update (if correct value known), verify (if uncertain), prune (if entire entry obsolete).

**If fail:** Can't verify claim because it references external state (APIs, third-party docs, deployment status)? Mark as `unverifiable` rather than assuming correct. Unverifiable entries are candidates for pruning if not actively useful.

### Step 3: Run Fidelity Checks

Test if memories still produce useful context when retrieved. Hardest step — agent can't verify if its own compressed memories are faithful. Need external anchors.

Fidelity check methods:

1. **Round-trip verification**: Read memory entry, then check actual project state it describes. Does memory lead you to right file, right pattern, right conclusion?

2. **Compression loss detection**: Compare memory summaries against original source material. When 50-line discussion was compressed to 2-line memory, did compression preserve actionable insight or just topic label?

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

4. **Utility test**: For each memory entry, ask: "If this entry were deleted, would anything go wrong in the next 5 sessions?" Answer is "probably not"? Entry has low fidelity value regardless of accuracy.

**Got:** Each memory entry has fidelity assessment: **high** (verified accurate and useful), **medium** (probably accurate, occasionally useful), **low** (unverified or rarely useful), **failed** (verified inaccurate or contradictory).

**If fail:** Fidelity checks inconclusive for many entries? Focus on entries with highest potential impact. Wrong memory about project architecture more dangerous than wrong memory about debugging trick. Prioritize checking skeleton-level facts over flesh-level details.

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

For each deletion, record entry, its classification, reason for deletion (used in Step 7).

Before applying any DELETE action from this tree, check if entry warrants inoculation (Step 5). Failed strategies, abandoned approaches, dangerous patterns are candidates for delete + inoculate rather than delete-only.

**Got:** Clear list of entries to delete, entries to update, entries to keep — each with documented reason. Keep/delete ratio depends on memory health. Well-maintained memory might prune 5-10%. Neglected one might prune 30-50%.

**If fail:** Decision tree produces ambiguous results for many entries? Apply tighter filter: "Would I write this entry today, knowing what I know now?" If not, deletion candidate. Err toward pruning — easier to re-learn fact than work around wrong memory.

### Step 5: Inoculate Against Pattern Re-Derivation

Some abandoned conclusions can't be safely deleted. Deletion alone fails when memory-generating conditions persist — system rebuilds deleted memory from same inputs along same reasoning path. For these cases, write counter-memory that prevents re-derivation alongside (or instead of) deletion.

**Decision rule — delete-only vs. delete + inoculate vs. inoculate-only:**

| Memory category | Action | Why |
|---|---|---|
| Stale fact, outdated pointer, expired context | **Delete-only** | Retrieval cleanup; no behavioral risk if regenerated |
| Failed strategy, dangerous pattern, abandoned approach with persistent triggers | **Delete + inoculate** | Reasoning path will regenerate conclusion otherwise |
| Decision later overridden but original rationale matters | **Inoculate-only** | Preserve original entry; add SUPERSEDED counter-memory pointing to it |

**SUPERSEDED record format** (frontmatter for auto-memory; structure adapts to other memory systems):

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
Supersedes: <path to original memory if delete + inoculate, or N/A>
```

Place SUPERSEDED records as own files in memory directory (e.g. `superseded_strategy_X.md`) so they appear in retrieval alongside active memories. Counter-memory becomes enacted change mechanism: when similar signal arrives, SUPERSEDED record surfaces and blocks regeneration path.

**When NOT to inoculate:**

- Trivial stale facts (no behavioral risk if regenerated)
- Memories where original triggering conditions no longer exist (rename completed, dependency removed, team disbanded)
- Decisions where re-derivation under new evidence is actively desirable (strategy may work in future state and should be re-evaluated)

**Inoculation hygiene:**

- Keep `Pattern` and `Do not re-derive from` specific. Vague counter-memories ("don't try complicated solutions") are noise.
- Date the SUPERSEDED entry. Old inoculations may themselves become stale if underlying conditions change — they enter next pruning cycle as candidates for review.
- One SUPERSEDED per abandoned pattern. Don't chain multiple abandonments into single counter-memory; retrieval suffers.
- Add SUPERSEDED file path to pruning log alongside deletion record so audit trail captures both halves of operation.

**Got:** For every Step 4 deletion candidate involving abandoned strategies or dangerous patterns, corresponding SUPERSEDED counter-memory file is created before original entry is deleted. Pruning log records both deletion and inoculation. Active memory remains lean while regeneration paths blocked.

**If fail:** Unsure if entry warrants inoculation? Default to inoculate. Redundant SUPERSEDED record costs little; regenerated bad pattern costs much more. SUPERSEDED list grows large enough to be noise itself? Signal to investigate upstream conditions producing repeated abandonments — fix is at input layer, not memory layer.

### Step 6: Apply Preemptive Filters

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

Any of these patterns found in existing memory? Add to deletion list from Step 4.

Document filter rules in MEMORY.md or `retention-policy.md` topic file so future sessions can reference them before writing new memories.

**Got:** Set of preemptive filter rules documented in memory directory. Any existing entries matching these patterns flagged for deletion.

**If fail:** Documenting filter rules feels premature (memory small, pollution minimal)? Skip documentation but still apply filters to catch any existing violations. Rules can be formalized later when memory directory is more mature.

### Step 7: Write Audit Trail

Log every deletion so forgetting itself is reviewable. Create or update pruning log.

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

Keep pruning log concise. Exists for accountability, not archaeology. Log itself grows large? Summarize older entries: "2025: 3 audits, 47 total entries pruned (mostly count drift and ephemeral leakage)."

**Got:** Timestamped pruning log entry documenting what was deleted and why. Log stored in memory directory alongside the memories themselves.

**If fail:** Creating separate log file feels excessive (only 1-2 entries pruned)? Add brief note to MEMORY.md instead: `<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`. Any record better than silent deletion.

### Step 8: Designate Protected Memories

Certain memory entries should be immune from pruning regardless of age, access frequency, fidelity score. These represent irreplaceable context that, if lost, would require significant effort to reconstruct.

**Protected memory criteria:**

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**Designation method:** Mark protected entries with `<!-- PROTECTED -->` inline or maintain `protected` list in pruning log. Decision tree in Step 4 must check for protected status before applying any deletion rule.

**Unprotecting:** To prune protected entry, explicitly remove designation first. Document reason in pruning log. Two-step process prevents accidental deletion of high-value memories.

**Got:** Protected entries survive all prune passes. Pruning log records any protection additions or removals.

**If fail:** Protected set grows too large (>30% of total entries)? Review criteria — protection is for irreplaceable context, not for "important" entries. Important but reconstructible facts should remain subject to normal pruning.

### Step 9: Re-Synthesize After Pruning

After deletion, remaining memories may be fragmented — cross-references point to deleted entries, topic files lose coherence, MEMORY.md may have gaps. Re-synthesis restores structural integrity.

**Re-synthesis checklist:**

1. **Resolve broken references**: Scan remaining entries for links to deleted content. Remove or redirect reference.
2. **Merge related fragments**: Pruning left two entries covering overlapping aspects of same topic? Merge them into one coherent entry.
3. **Update topic file structure**: Topic file lost >50% of its content? Consider folding remainder back into MEMORY.md and deleting topic file.
4. **Classify cold memories**: Review entries that survived pruning but haven't been accessed recently:
   - **Cold-from-disuse**: Topic aligns with active project goals but specific phase that generated it has passed. Retain — may become relevant again when that phase resumes (e.g. CRAN submission notes during active development).
   - **Cold-from-irrelevance**: Topic was always marginal — one-off experiment, tangential investigation, superseded approach. Flag for deletion in next pruning cycle.
5. **Verify MEMORY.md coherence**: Read MEMORY.md top-to-bottom. Should tell coherent story about project, not read as random collection of facts.

**Got:** Post-pruning memory structurally sound — no orphan references, no redundant fragments, no incoherent topic files. Cold entries classified for future pruning decisions.

**If fail:** Re-synthesis reveals pruning was too aggressive (critical context was lost)? Check pruning log and reconstruct from audit trail. This is why audit trail exists.

### Step 10: Recover from Memory Drift

Memory drift occurs when stored facts become silently wrong — not because they were always wrong, but because underlying reality changed and memory wasn't updated. Drift recovery attempts to fix memories in-place rather than pruning them.

**Drift detection triggers:**

- Memory claim contradicts current tool output or file contents
- Count or version number in memory doesn't match registry or lockfile
- Path in memory returns "file not found"
- Memory about dependency references renamed or deprecated package

**Recovery procedure:**

1. **Identify drift**: Compare memory claim against current ground truth (git log, registry, actual files)
2. **Assess recoverability**: Can correct value be determined from current project state?
   - Yes → Update memory entry in-place with current value and `[corrected YYYY-MM-DD]` annotation
   - No → Mark entry as `unverifiable` and flag for pruning
3. **Trace cause**: Was this gradual drift (count slowly diverged) or discrete event (rename, migration)? Discrete events often affect multiple entries — scan for siblings.
4. **Prevent recurrence**: Drift affects frequently-changing value (counts, versions)? Consider if memory should track value at all or instead reference source of truth: "See skills/_registry.yml for current count" rather than "317 skills."

**Got:** Drifted memories corrected in-place where possible, preserving context. Entries that can't be corrected flagged for pruning. Prevention rules reduce future drift.

**If fail:** Drift widespread (>20% of entries)? Memory may need full rebuild rather than incremental correction. In that case, archive current memory directory, start fresh, selectively re-import entries that pass verification.

## Checks

- [ ] All memory files inventoried and entries classified by type
- [ ] Staleness checks run against current project state
- [ ] At least one fidelity check method applied (round-trip, compression loss, contradiction scan, utility test)
- [ ] Deletion decisions follow priority order in decision tree
- [ ] No entries deleted without documented reason
- [ ] Inoculation criterion checked for every deletion candidate; SUPERSEDED counter-memories created where re-derivation risk exists
- [ ] Preemptive filter rules documented or applied
- [ ] Pruning log records what was deleted, when, why — including paired SUPERSEDED file paths for inoculated entries
- [ ] MEMORY.md remains under 200 lines after pruning
- [ ] Remaining memories accurate (spot-checked against project state)
- [ ] No orphan topic files created by pruning references from MEMORY.md
- [ ] Protected entries designated and survive all prune passes
- [ ] Post-pruning re-synthesis resolves broken cross-references and merges fragments
- [ ] Cold entries classified as disuse vs irrelevance for future pruning decisions
- [ ] Drifted entries corrected in-place where possible, not just deleted

## Pitfalls

- **Delete failed strategies without inoculation**: Deleting memory about abandoned approach when conditions that produced it still exist. System regenerates same conclusion from same inputs along same reasoning path. Deletion was placebo. Use Step 5 inoculation when triggers persist.
- **Prune without verification**: Deleting entries because they "look old" without checking if still accurate and useful. Age alone is not deletion criterion — some of most valuable memories are old architectural decisions that remain true.
- **Self-verifying fidelity**: Agent reading its own compressed memory and concluding "yes, this seems right" is not fidelity check. Fidelity needs external anchors: project files, git history, registry counts, actual tool output. Without anchors, you are checking consistency, not accuracy.
- **Aggressive pruning without audit trail**: Deleting entries without recording what was deleted. When future session needs fact that was pruned, audit trail explains what happened and may contain enough context to reconstruct memory.
- **Pruning decisions as memories**: Don't write "I decided to prune X because Y" as regular memory entry. That goes in pruning log only. Memory entries about memory management are meta-pollution.
- **Ignore preemptive filters**: Pruning existing entries but not establishing rules to prevent same patterns from recurring. Without filters, next 10 sessions will recreate same ephemeral entries you just deleted.
- **Treat all types equally**: Decision memories and feedback memories should almost never be pruned — they represent user intent and rationale. Project and reference memories are primary pruning targets because they track state that changes.
- **Confuse compression with corruption**: Memory that summarizes complex topic in one line is compressed, not corrupted. Only flag as fidelity failure if compression lost actionable insight, not merely detail.
- **Over-pinning**: Marking too many entries as protected defeats purpose of pruning. >30% of entries protected? Criteria are too loose. Protect irreplaceable context, not merely important facts.
- **Re-synthesis loops**: Merging fragments during re-synthesis can create new entries that themselves need pruning next cycle. Keep merges minimal — combine only entries that clearly cover same topic. Don't synthesize new insights during pruning pass.

## See Also

- `manage-memory` — complementary skill for organizing and growing memory. Use together for complete memory maintenance
- `meditate` — clearing and grounding that may reveal which memories are creating noise
- `rest` — sometimes best memory maintenance is not doing memory maintenance
- `assess-context` — evaluating reasoning context health, which memory quality directly affects
