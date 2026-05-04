---
name: prune-agent-memory
description: >
  Audit, classify, selectively forget stored memories. Memory enumeration +
  classification by type/age/access freq, staleness detection, fidelity checks
  via external anchors, decision tree for selective deletion, counter-memory
  inoculation for failed strategies that'd otherwise be re-derived, preemptive
  filtering rules, audit trail. Use → memory grown large + uncurated, project
  state shifted, retrieval quality degraded, periodic maintenance alongside
  manage-memory.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory, inoculation
  locale: caveman-ultra
  source_locale: en
  source_commit: 480397b5
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Prune Agent Memory

Audit, classify, selectively forget stored memories. Memory = infrastructure. Forgetting = policy. This skill defines policy.

`manage-memory` focuses on organizing + growing memory (what to keep, how to structure). This skill = inverse: what to discard, how to detect decay, ensure forgetting is deliberate not accidental. Complementary; use together for periodic maintenance.

## Use When

- Memory files large, no audit for relevance
- Project state shifted (major refactors, renamed repos, completed milestones) → memories likely reference outdated context
- Retrieval quality degraded → memories produce noise not signal
- Burst of activity generated many entries w/o curation
- Scheduled maintenance (every 10-20 sessions or project milestones)
- Multiple entries cover same topic w/ slight variations (duplication drift)
- Onboarding new collaborator who'll inherit memory context
- Strategy/pattern abandoned but triggering conditions persist → inoculate vs delete-only

## In

- **Required**: Memory directory path (typically `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Retention policy overrides ("keep everything about deployment", "aggressively prune debug notes")
- **Optional**: Known project state changes since last audit ("repo renamed", "migrated Jest → Vitest")
- **Optional**: Prior pruning audit trail for trend analysis

## Do

### Step 1: Enumerate + Classify Memories

Read all memory files, classify each entry by 4 dimensions.

```bash
# Inventory the memory directory
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Count total entries (approximate by counting top-level bullets and headers)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

Classify each into types:

| Type | Description | Example | Default retention |
|------|-------------|---------|-------------------|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

Per entry, also note:
- **Age**: When written or last updated?
- **Access freq**: Useful in recent sessions? (Estimate based on topic relevance to recent work)

→ Complete inventory, every entry classified by type, age + access freq estimates. Ephemeral flagged for immediate removal.

If err: files too large/unstructured to classify entry-by-entry → work at section level. Classify entire sections vs individual bullets. Goal = coverage, not granularity.

### Step 2: Detect Staleness

Compare memory claims vs current project state. Staleness = most common decay form.

Patterns:

1. **Count drift**: Counts of files, skills, agents, domains, members changed
2. **Path drift**: Files, dirs, URLs moved, renamed, deleted
3. **State drift**: Statuses (resolved issues, completed milestones, closed PRs) still described as open/in-progress
4. **Decision reversal**: Decisions later overridden but original rationale remains
5. **Tool/version drift**: Version numbers, API signatures, tool names changed (package renames)

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

Mark each stale entry w/ staleness type + current correct value.

→ Stale entries list w/ specific evidence of what changed. Each has recommended action: update (if correct value known), verify (if uncertain), prune (if entry obsolete).

If err: can't verify claim referencing external state (APIs, third-party docs, deployment status) → mark `unverifiable` not assuming correct. Unverifiable entries → candidates for pruning if not actively useful.

### Step 3: Run Fidelity Checks

Test if memories produce useful context when retrieved. Hardest step — agent can't verify own compressed memories are faithful, need external anchors.

Methods:

1. **Round-trip verification**: Read entry, check actual project state. Does memory lead to right file, pattern, conclusion?

2. **Compression loss detection**: Compare summaries vs original source. 50-line discussion compressed to 2-line — preserved actionable insight or just topic label?

   ```bash
   # Find the source that a memory entry was derived from
   # (git log, old PRs, original files)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **Contradiction scan**: Memories contradicting each other or CLAUDE.md / project docs.

   ```bash
   # Look for potential contradictions in counts
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Compare the values — they should agree
   ```

4. **Utility test**: Per entry: "If deleted, would anything go wrong in next 5 sessions?" "Probably not" → low fidelity value regardless of accuracy.

→ Each entry has fidelity assessment: **high** (verified accurate + useful), **medium** (probably accurate, occasionally useful), **low** (unverified or rarely useful), **failed** (verified inaccurate or contradictory).

If err: fidelity checks inconclusive for many → focus on highest potential impact. Wrong memory about architecture > wrong about debug trick. Prioritize skeleton-level over flesh-level.

### Step 4: Apply Selective Deletion

Decision tree, priority order:

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

Per deletion, record entry, classification, reason (used in Step 7).

Before any DELETE → check inoculation warrant (Step 5). Failed strategies, abandoned approaches, dangerous patterns = candidates for delete + inoculate vs delete-only.

→ Clear list of deletions, updates, keeps — each w/ documented reason. Keep/delete ratio depends on health: well-maintained 5-10%, neglected 30-50%.

If err: decision tree ambiguous for many → tighter filter: "Would I write this today, knowing what I know now?" If not → deletion candidate. Err toward pruning — easier re-learn fact than work around wrong memory.

### Step 5: Inoculate Against Pattern Re-Derivation

Some abandoned conclusions can't be safely deleted. Deletion alone fails when memory-generating conditions persist — system rebuilds deleted memory from same inputs along same reasoning path. For these, write counter-memory blocking re-derivation alongside (or instead of) deletion.

**Decision rule — delete-only vs delete + inoculate vs inoculate-only:**

| Memory category | Action | Why |
|---|---|---|
| Stale fact, outdated pointer, expired context | **Delete-only** | Retrieval cleanup; no behavioral risk if regenerated |
| Failed strategy, dangerous pattern, abandoned approach w/ persistent triggers | **Delete + inoculate** | Reasoning path regenerates conclusion otherwise |
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

Place SUPERSEDED records as own files in memory dir (e.g., `superseded_strategy_X.md`) → appear in retrieval alongside active memories. Counter-memory = enacted change mechanism: similar signal arrives → SUPERSEDED record surfaces + blocks regeneration path.

**When NOT to inoculate:**

- Trivial stale facts (no behavioral risk if regenerated)
- Memories where original triggering conditions no longer exist (rename completed, dependency removed, team disbanded)
- Decisions where re-derivation under new evidence actively desirable (strategy may work in future state, should be re-evaluated)

**Inoculation hygiene:**

- Keep `Pattern` + `Do not re-derive from` specific. Vague counter-memories ("don't try complicated solutions") = noise.
- Date the SUPERSEDED entry. Old inoculations may themselves go stale if underlying conditions change → enter next pruning cycle as review candidates.
- One SUPERSEDED per abandoned pattern. Don't chain multiple abandonments into single counter-memory; retrieval suffers.
- Add SUPERSEDED file path to pruning log alongside deletion record → audit trail captures both halves.

→ Per Step 4 deletion candidate involving abandoned strategies/dangerous patterns, corresponding SUPERSEDED counter-memory file created before original entry deleted. Pruning log records both deletion + inoculation. Active memory stays lean; regeneration paths blocked.

If err: unsure whether entry warrants inoculation → default inoculate. Redundant SUPERSEDED costs little; regenerated bad pattern costs much more. SUPERSEDED list grows large enough to be noise itself → signal to investigate upstream conditions producing repeated abandonments. Fix at input layer, not memory layer.

### Step 6: Apply Preemptive Filters

"What NOT to save" rules → prevent future pollution. Review existing for patterns that should've been filtered at write time.

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

Patterns in existing memory → add to deletion list from Step 4.

Document filter rules in MEMORY.md or `retention-policy.md` topic file → future sessions reference before writing new.

→ Preemptive filter rules doc'd. Existing entries matching → flagged for deletion.

If err: doc rules feels premature (memory small, pollution minimal) → skip docs but apply filters to catch existing violations. Formalize later when more mature.

### Step 7: Write Audit Trail

Log every deletion → forgetting reviewable. Create or update pruning log.

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

Keep concise. Exists for accountability not archaeology. Log itself grows large → summarize older: "2025: 3 audits, 47 entries pruned (mostly count drift + ephemeral leakage)."

→ Timestamped log entry doc'ing what deleted + why. Stored in memory directory alongside memories.

If err: separate log file feels excessive (only 1-2 entries pruned) → brief note in MEMORY.md: `<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`. Any record > silent deletion.

### Step 8: Designate Protected Memories

Certain entries immune from pruning regardless of age, access, fidelity. Represent irreplaceable context — if lost, significant effort to reconstruct.

**Protected criteria:**

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**Designation:** Mark protected w/ `<!-- PROTECTED -->` inline or maintain `protected` list in pruning log. Decision tree Step 4 must check protected status before applying deletion rule.

**Unprotecting:** To prune protected → explicitly remove designation first + doc reason in pruning log. 2-step process prevents accidental deletion of high-value memories.

→ Protected entries survive all prune passes. Pruning log records protection additions/removals.

If err: protected set too large (>30% of entries) → review criteria. Protection for irreplaceable context, not "important". Important but reconstructible facts subject to normal pruning.

### Step 9: Re-Synthesize After Pruning

After deletion, remaining memories may be fragmented — cross-refs to deleted entries, topic files lose coherence, MEMORY.md may have gaps. Re-synthesis restores structural integrity.

**Re-synthesis checklist:**

1. **Resolve broken refs**: Scan remaining for links to deleted. Remove or redirect.
2. **Merge related fragments**: 2 entries covering overlapping aspects → merge into one coherent.
3. **Update topic file structure**: Topic file lost >50% content → fold remainder back into MEMORY.md, delete topic file.
4. **Classify cold memories**: Survived pruning but not accessed recently:
   - **Cold-from-disuse**: Topic aligns w/ active goals but specific phase passed. Retain — may become relevant when phase resumes (CRAN submission notes during active dev).
   - **Cold-from-irrelevance**: Topic always marginal — one-off experiment, tangential investigation, superseded approach. Flag for deletion in next cycle.
5. **Verify MEMORY.md coherence**: Read top-to-bottom. Coherent project story, not random facts.

→ Post-pruning memory structurally sound — no orphan refs, redundant fragments, incoherent topic files. Cold entries classified for future decisions.

If err: re-synthesis reveals pruning too aggressive (critical context lost) → check pruning log + reconstruct from audit trail. Why audit trail exists.

### Step 10: Recover from Memory Drift

Drift = stored facts silently wrong — not always wrong, but underlying reality changed + memory not updated. Drift recovery fixes in-place vs pruning.

**Drift detection triggers:**

- Memory claim contradicts current tool output or file contents
- Count or version in memory ≠ registry or lockfile
- Path returns "file not found"
- Memory about dependency references renamed or deprecated package

**Recovery procedure:**

1. **Identify drift**: Compare claim vs current ground truth (git log, registry, actual files)
2. **Assess recoverability**: Correct value determinable from current state?
   - Yes → Update entry in-place w/ current value + `[corrected YYYY-MM-DD]` annotation
   - No → Mark `unverifiable` + flag for pruning
3. **Trace cause**: Gradual drift (count slowly diverged) or discrete event (rename, migration)? Discrete events often affect multiple entries — scan for siblings.
4. **Prevent recurrence**: Drift affects frequently-changing value (counts, versions) → consider whether memory should track at all or instead reference source of truth: "See skills/_registry.yml for current count" vs "317 skills."

→ Drifted memories corrected in-place where possible, preserving context. Uncorrectable → flagged for pruning. Prevention rules reduce future drift.

If err: drift widespread (>20% of entries) → memory may need full rebuild vs incremental correction. Archive current memory directory, start fresh, selectively re-import passing verification.

## Check

- [ ] All memory files inventoried + entries classified by type
- [ ] Staleness checks run vs current project state
- [ ] ≥1 fidelity check method applied (round-trip, compression loss, contradiction scan, utility)
- [ ] Deletion decisions follow priority order in decision tree
- [ ] No entries deleted w/o documented reason
- [ ] Inoculation criterion checked per deletion candidate; SUPERSEDED counter-memories created where re-derivation risk exists
- [ ] Preemptive filter rules doc'd or applied
- [ ] Pruning log records what deleted, when, why — including paired SUPERSEDED file paths for inoculated entries
- [ ] MEMORY.md remains under 200 lines after pruning
- [ ] Remaining memories accurate (spot-checked vs project state)
- [ ] No orphan topic files created by pruning refs from MEMORY.md
- [ ] Protected entries designated + survive all prune passes
- [ ] Post-pruning re-synthesis resolves broken cross-refs + merges fragments
- [ ] Cold entries classified disuse vs irrelevance for future decisions
- [ ] Drifted entries corrected in-place where possible, not just deleted

## Traps

- **Delete failed strategies w/o inoculation**: Delete memory about abandoned approach when conditions producing it persist. System regenerates same conclusion from same inputs along same reasoning path. Deletion = placebo. Use Step 5 inoculation when triggers persist.
- **Prune w/o verification**: Delete because "look old" w/o checking accurate + useful. Age alone ≠ deletion criterion. Some most valuable memories = old architectural decisions still true.
- **Self-verify fidelity**: Agent reading own compressed memory + concluding "yes seems right" ≠ fidelity check. Fidelity needs external anchors: project files, git history, registry counts, actual tool output. W/o anchors, checking consistency not accuracy.
- **Aggressive pruning w/o audit trail**: Delete w/o recording. Future session needs pruned fact → audit trail explains + may contain context to reconstruct.
- **Pruning decisions as memories**: Don't write "I decided to prune X because Y" as regular entry. Goes in pruning log only. Memory entries about memory mgmt = meta-pollution.
- **Ignore preemptive filters**: Prune existing but no rules to prevent recurrence. W/o filters, next 10 sessions recreate same ephemeral entries deleted.
- **Treat all types equal**: Decision + feedback memories almost never pruned — represent user intent + rationale. Project + reference = primary targets, track changing state.
- **Confuse compression w/ corruption**: Memory summarizing complex topic in one line = compressed not corrupted. Flag as fidelity failure only if compression lost actionable insight, not merely detail.
- **Over-pinning**: Too many protected defeats pruning. >30% protected → criteria too loose. Protect irreplaceable context, not merely important facts.
- **Re-synthesis loops**: Merging fragments during re-synthesis can create new entries needing pruning next cycle. Keep merges minimal — combine only entries clearly same topic. Don't synthesize new insights during pruning pass.

## →

- `manage-memory` — complementary skill for organizing + growing memory; use together for complete maintenance
- `meditate` — clearing + grounding may reveal which memories create noise
- `rest` — sometimes best memory maintenance = not doing memory maintenance
- `assess-context` — eval reasoning context health, memory quality directly affects
