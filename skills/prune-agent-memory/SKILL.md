---
name: prune-agent-memory
description: >
  Audit, classify, and selectively forget stored memories. Covers memory
  enumeration and classification by type/age/access frequency, staleness
  detection for outdated references, fidelity checks using external anchors,
  a decision tree for selective withdrawal, tombstoned deaccession so removed
  content stays recoverable, counter-memory inoculation for failed strategies
  that would otherwise be re-derived, preemptive filtering rules for what
  should never become memories, and an audit trail so forgetting itself is
  reviewable. Use when memory has grown large and
  uncurated, when project state has shifted significantly since memories
  were written, when retrieval quality has degraded, or as periodic
  maintenance alongside manage-memory.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.4"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory, inoculation, deaccession
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
- After abandoning a strategy or pattern whose triggering conditions still exist — to inoculate against re-derivation rather than rely on withdrawal alone

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
|---|---|---|---|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

The `wc -l` above is inventory, not a cap check. The index has a *dual* load cap and a line count alone never answers it — see the Validation checklist for the form to report.

For each entry, also note:
- **Age**: When was it written or last updated? File `mtime` records the last *write*.
- **Access frequency (estimate)**: Does this topic align with recent work? A guess, and it must be labeled one.

**No read counter exists anywhere in this system.** Nothing records that a memory was retrieved — not the harness, not the filesystem, not this skill. `mtime` measures writes, so an unread file rewritten yesterday looks fresh and a file read every session looks untouched. The "access frequency" above is the agent estimating its own retrieval history from topic similarity, which is not evidence: never call it circulation data, and never let it carry a withdrawal on its own — pair it with staleness (Step 2) or fidelity (Step 3) evidence. Until a real retrieval counter exists, usage-driven weeding is unavailable here, and the honest move is to say so rather than dress an estimate up as a measurement.

**Expected:** A complete inventory with every memory entry classified by type, with ages and explicitly labeled access-frequency estimates. Ephemeral entries are already flagged for immediate removal.

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

### Step 4: Apply Selective Withdrawal

**Gate — snapshot before the first withdrawal.** A memory directory is almost never under version control, so an overwrite or a delete has no `git checkout` behind it and is simply unrecoverable. Content-hash every file to a store *outside* the memory directory before touching anything, and record the manifest path in the pruning log (Step 7). If this gate has not run, no withdrawal in this pass is legitimate.

```bash
# Pre-prune snapshot. <snapshot-dir> must be outside <memory-dir>, so that a
# later prune of the memory directory cannot reach the only copy of the content.
mkdir -p <snapshot-dir> && cp -a <memory-dir>/. <snapshot-dir>/
( cd <snapshot-dir> && find . -name '*.md' -type f -print0 | sort -z \
    | xargs -0 sha256sum > MANIFEST.sha256 )
wc -l < <snapshot-dir>/MANIFEST.sha256    # verify later: sha256sum -c MANIFEST.sha256
```

Use this decision tree to determine what to withdraw, in priority order:

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

**Withdraw, not delete.** Every removal above is a *withdrawal*: the entry leaves the index, the content stays in the store.

```text
Withdraw (not Delete):
  1. Move content to <memory-dir>/deaccessioned/<original-name>.md preserving the full
     original body, plus a header recording deaccessioned_at, reason, superseded_by (if any),
     and register_id
  2. Remove the pointer from the index
  3. Append one row to the accession/deaccession register
```

The `register_id` in the tombstone header and the `register_id` column of the Step 7 register are the same identifier — that pairing is what lets the register find the body, and a tombstone written without it is an orphan with a date on it. Tombstone header fields and a worked register row: [references/EXAMPLES.md](references/EXAMPLES.md).

Why this skill in particular needs it: Step 9's **On failure** clause tells you to "reconstruct from the audit trail" when re-synthesis shows the pass was too aggressive. The audit trail as Step 7 defines it stores a one-line prose summary per removal — `"skills/ has 280 SKILL.md files" | Project | Count drift` — from which nothing can be reconstructed. That instruction is unsatisfiable as written. A tombstone makes it satisfiable, because the body is still on disk.

The mechanism already exists in this repo and should be borrowed, not reinvented: the `janitor` agent's `backup_before_delete` creates an `archive/` directory before removal, under the standing rule "Orphaned files archived (not deleted)". `deaccessioned/` is that `archive/` under a library name, and the register is its index.

Withdrawal does **not** replace inoculation (Step 5); it runs alongside it. They preserve different things: a SUPERSEDED counter-memory keeps the *lesson* ("do not re-derive this") and stays in retrieval, while a tombstone keeps the *content* and stays out of it. A withdraw + inoculate outcome therefore produces three artifacts — the SUPERSEDED file in the memory directory, the original body under `deaccessioned/`, and one register row linking them. Tombstones are invisible to the Step 9 reachability scan, which reads only the top level of the memory directory, so a `deaccessioned/` file never reports as an orphan.

For each withdrawal, record the entry, its classification, and the reason (used in Step 7). Before applying any WITHDRAW action from this tree, check whether the entry warrants inoculation (Step 5) — failed strategies, abandoned approaches, and dangerous patterns are candidates for withdraw + inoculate rather than withdraw-only.

**Expected:** A clear list of entries to withdraw, entries to update, and entries to keep — each with a documented reason, each withdrawal carrying a tombstone and a register row. The keep/withdraw ratio depends on memory health; a well-maintained memory might prune 5-10%, a neglected one might prune 30-50%.

**On failure:** If the decision tree produces ambiguous results for many entries, apply a tighter filter: "Would I write this entry today, knowing what I know now?" If not, it is a withdrawal candidate. Err toward pruning — it is easier to re-learn a fact than to work around a wrong memory, and with tombstones a wrong withdrawal costs one lookup in the register.

### Step 5: Inoculate Against Pattern Re-Derivation

Some abandoned conclusions cannot be safely withdrawn. Withdrawal alone fails when the memory-generating conditions persist — the system rebuilds the withdrawn memory from the same inputs along the same reasoning path, and a tombstone does not stop that, because a tombstone is deliberately outside retrieval. For these cases, write a counter-memory that prevents re-derivation alongside (or instead of) withdrawal.

**Decision rule — withdraw-only vs. withdraw + inoculate vs. inoculate-only:**

| Memory category | Action | Why |
|---|---|---|
| Stale fact, outdated pointer, expired context | **Withdraw-only** | Retrieval cleanup; no behavioral risk if regenerated |
| Failed strategy, dangerous pattern, abandoned approach with persistent triggers | **Withdraw + inoculate** | The reasoning path will regenerate the conclusion otherwise |
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
Supersedes: <tombstone path if withdraw + inoculate, or N/A>
```

Place SUPERSEDED records as their own files in the memory directory (e.g., `superseded_strategy_X.md`) so they appear in retrieval alongside active memories. The counter-memory becomes the enacted change mechanism: when a similar signal arrives, the SUPERSEDED record surfaces and blocks the regeneration path.

Add an index line pointing at each SUPERSEDED file in the same edit that creates it. The index is the only file loaded automatically, so an unlinked counter-memory is not merely deprioritized — it is never retrieved, blocks nothing, and the Step 9 scan will correctly report it as an orphan. This is the one place in the skill where reachability is the whole mechanism rather than a hygiene property.

**When NOT to inoculate:**

- Trivial stale facts (no behavioral risk if regenerated)
- Memories where the original triggering conditions no longer exist (the rename completed, the dependency was removed, the team disbanded)
- Decisions where re-derivation under new evidence is actively desirable (the strategy may work in a future state and should be re-evaluated)

**Inoculation hygiene:**

- Keep `Pattern` and `Do not re-derive from` specific. Vague counter-memories ("don't try complicated solutions") are noise.
- Date the SUPERSEDED entry. Old inoculations may themselves become stale if the underlying conditions change — they enter the next pruning cycle as candidates for review.
- One SUPERSEDED per abandoned pattern. Do not chain multiple abandonments into a single counter-memory; retrieval suffers.
- Add the SUPERSEDED file path to the register row alongside the tombstone path so the audit trail captures both halves of the operation.

**Expected:** For every Step 4 withdrawal candidate involving abandoned strategies or dangerous patterns, a corresponding SUPERSEDED counter-memory file is created before the original entry is withdrawn. One register row records the withdrawal, its tombstone, and its inoculation. Active memory remains lean while the regeneration paths are blocked.

**On failure:** If unsure whether an entry warrants inoculation, default to inoculate. A redundant SUPERSEDED record costs little; a regenerated bad pattern costs much more. If the SUPERSEDED list grows large enough to be noise itself, that is a signal to investigate the upstream conditions producing repeated abandonments — the fix is at the input layer, not the memory layer.

### Step 6: Apply Preemptive Filters

Define "what NOT to save" rules to prevent future memory pollution — pruning alone does not stop recurrence; without filters, future sessions recreate the same ephemeral entries just withdrawn. Review existing memories for patterns that should have been filtered at write time.

Patterns that should **never** become persistent memories:

| Pattern | Why | Example |
|---|---|---|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

If any of these patterns are found in existing memory, add them to the withdrawal list from Step 4.

Document the filter rules in MEMORY.md or a `retention-policy.md` topic file so future sessions can reference them before writing new memories. Understand what that buys: **nothing here is enforced at write time.** This skill runs as out-of-band maintenance in an ordinary session, and the path that actually writes memory is not the path that runs skills. The filters are documentation a future session may or may not consult — every guarantee in this file is *verified when the skill last ran*, not an invariant.

**Expected:** A set of preemptive filter rules documented in the memory directory. Any existing entries matching these patterns are flagged for withdrawal.

**On failure:** If documenting filter rules feels premature (memory is small, pollution is minimal), skip the documentation but still apply the filters to catch any existing violations. The rules can be formalized later when the memory directory is more mature.

### Step 7: Write Audit Trail

Log every withdrawal so the forgetting itself is reviewable. Create or update `<memory-dir>/pruning-log.md` (or append to MEMORY.md). Each audit records the entries audited, withdrawn and updated, the Step 4 snapshot manifest path, the staleness patterns found and the fidelity failures — then the accession/deaccession register, one row per withdrawal:

```markdown
| register_id | Entry (summary) | Type | Reason | Tombstone | superseded_by |
```

Full log template and a worked register: [references/EXAMPLES.md](references/EXAMPLES.md).

Keep the prose parts of the pruning log concise — they exist for accountability, not archaeology, and can be summarized once old ("2025: 3 audits, 47 total entries withdrawn, mostly count drift and ephemeral leakage"). Never summarize away a register row: the row is the only path from the log to the tombstone, and collapsing it strands the body it points at.

**Expected:** A timestamped pruning log entry documenting what was withdrawn and why, with one register row per withdrawal resolving to a tombstone that exists on disk. The log is stored in the memory directory alongside the memories themselves.

**On failure:** If creating a separate log file feels excessive (only 1-2 entries withdrawn), append the register rows to MEMORY.md instead — as plain markdown, not an HTML comment, which is stripped before the index reaches the reader. Any record is better than silent deletion.

### Step 8: Designate Protected Memories

Certain memory entries should be immune from pruning regardless of age, access frequency, or fidelity score. These represent irreplaceable context that, if lost, would require significant effort to reconstruct.

**Protected memory criteria:**

| Category | Examples | Why protected |
|---|---|---|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**Designation method:** Maintain a `protected` list in the pruning log. The decision tree in Step 4 must check for protected status before applying any withdrawal rule. Do not rely on an inline `<!-- PROTECTED -->` marker in the index: block-level HTML comments are stripped before the index reaches the model, so the marker is invisible to the reader who would act on it.

**Unprotecting:** To withdraw a protected entry, explicitly remove the designation first and document the reason in the pruning log. This two-step process prevents accidental removal of high-value memories.

**Expected:** Protected entries survive all prune passes. The pruning log records any protection additions or removals.

**On failure:** If the protected set grows too large (>30% of total entries), review the criteria — protection is for irreplaceable context, not for "important" entries. Important but reconstructible facts should remain subject to normal pruning.

### Step 9: Re-Synthesize After Pruning

After withdrawal, remaining memories may be fragmented — cross-references point to withdrawn entries, topic files lose coherence, and MEMORY.md may have gaps. Re-synthesis restores structural integrity. A write succeeding tells you nothing about whether the memory will ever be read again: verify reachability, not write success — and verify it every session, because the operation that breaks reachability (compaction) is the same operation the caps make mandatory.

**Re-synthesis checklist:**

1. **Resolve broken references — in both directions**: *dangling* links (the index points at a file that is no longer there) and *orphaned* files (a file still on disk that nothing in the index points at). Withdrawal breaks reachability both ways, and only the dangling direction is visible from the index, so a scan that reads the index alone reports half the damage. Run the scan below.
2. **Merge related fragments**: If pruning left two entries covering overlapping aspects of the same topic, merge them into one coherent entry.
3. **Update topic file structure**: If a topic file lost >50% of its content, consider folding the remainder back into MEMORY.md and withdrawing the topic file.
4. **Classify cold memories**: Review entries that survived pruning but whose topics have not come up recently (a cold *estimate*, per Step 1 — there is no read counter):
   - **Cold-from-disuse**: Topic aligns with active project goals but the specific phase that generated it has passed. Retain — it may become relevant again when that phase resumes (e.g., CRAN submission notes during active development).
   - **Cold-from-irrelevance**: Topic was always marginal — a one-off experiment, a tangential investigation, or a superseded approach. Flag for withdrawal in the next pruning cycle.
5. **Verify MEMORY.md coherence**: Read MEMORY.md top-to-bottom. It should tell a coherent story about the project, not read as a random collection of facts.

**Reachability scan — run after every withdrawal pass, before declaring the pass finished:**

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

Rules the scan honors, each learned from a real miss:

- **Exclude template/example link targets.** A format-documentation line such as `- [Title](file.md) — hook` otherwise reports as a dangling link forever, and a check that cries wolf trains its operator to ignore it.
- **A prose mention is not reachability.** Require an exact filename match on a real link target. Report near-matches separately as *degraded references*; never count them as reachable.
- **HTML comments in the index are not a mitigation.** They are stripped before the index reaches the model, so a curator note left in one is written into a void. If a note must survive, it has to be a plain markdown line.
- **Report both denominators, labeled.** File share and byte share are different numbers and must never be printed interchangeably.

Redirect or remove every dangling link; re-link or withdraw every orphan. The scan reads only the top level, so `deaccessioned/` tombstones never report as orphans — a tombstone is *supposed* to be unreachable from the index.

**Expected:** Post-pruning memory is structurally sound — zero dangling links, zero unintended orphans, no redundant fragments, no incoherent topic files. Cold entries are classified for future pruning decisions.

**On failure:** If re-synthesis reveals that pruning was too aggressive (critical context was lost), find the register row in the pruning log and restore the body from its tombstone under `deaccessioned/`. This is why the audit trail carries content and not just a summary. If a register row has no tombstone behind it, fall back to the Step 4 snapshot manifest — and treat the missing tombstone as the finding, because it means a withdrawal in this pass was really a deletion.

### Step 10: Recover from Memory Drift

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

**On failure:** If drift is widespread (>20% of entries), the memory may need a full rebuild rather than incremental correction. In that case, snapshot the current memory directory with Step 4's gate, start fresh, and selectively re-import entries that pass verification — the snapshot is what makes "start fresh" reversible.

## Validation

- [ ] All memory files were inventoried and entries classified by type
- [ ] Staleness checks were run against current project state
- [ ] At least one fidelity check method was applied (round-trip, compression loss, contradiction scan, or utility test)
- [ ] A content-hashed snapshot was taken outside the memory directory before the first withdrawal, and its manifest path is in the pruning log
- [ ] Withdrawal decisions follow the priority order in the decision tree
- [ ] No entries were withdrawn without a documented reason
- [ ] Every withdrawal produced a tombstone under `deaccessioned/` carrying the full original body, and every tombstone resolves from a register row by `register_id`
- [ ] No access-frequency estimate carried a withdrawal on its own — each is paired with staleness or fidelity evidence, and is labeled an estimate
- [ ] Inoculation criterion was checked for every withdrawal candidate; SUPERSEDED counter-memories were created where re-derivation risk exists
- [ ] Preemptive filter rules are documented or applied
- [ ] Pruning log records what was withdrawn, when, and why — including paired tombstone and SUPERSEDED file paths
- [ ] MEMORY.md is within both caps (`max(size / 25000, lines / 200) < 0.80`), reported as both numbers
- [ ] Remaining memories are accurate (spot-checked against project state)
- [ ] The reachability scan ran after the last withdrawal and reports zero dangling links and zero unintended orphans
- [ ] Protected entries are designated and survive all prune passes
- [ ] Post-pruning re-synthesis resolves broken cross-references and merges fragments
- [ ] Cold entries are classified as disuse vs irrelevance for future pruning decisions
- [ ] Drifted entries are corrected in-place where possible, not just withdrawn

## Common Pitfalls

- **Pruning without verification**: Withdrawing entries because they "look old" without checking whether they are still accurate and useful. Age alone is not a withdrawal criterion — some of the most valuable memories are old architectural decisions that remain true. Neither is a low access-frequency estimate: no read counter exists (Step 1), so "rarely used" is the agent's guess about its own retrieval history, and `mtime` will not settle it because it records writes.
- **Deleting instead of withdrawing**: Removing content with no tombstone behind it. The write is irreversible in a directory with no version control, and it makes Step 9's "reconstruct from the audit trail" a promise the skill cannot keep — a one-line reason is not a body.
- **Self-verifying fidelity**: An agent reading its own compressed memory and concluding "yes, this seems right" is not a fidelity check. Fidelity requires external anchors: project files, git history, registry counts, actual tool output. Without anchors, you are checking consistency, not accuracy.
- **Pruning decisions as memories**: Do not write "I decided to prune X because Y" as a regular memory entry. That goes in the pruning log only. Memory entries about memory management are meta-pollution.
- **Treating all types equally**: Decision memories and feedback memories should almost never be pruned — they represent user intent and rationale. Project and reference memories are the primary pruning targets because they track state that changes.
- **Confusing compression with corruption**: A memory that summarizes a complex topic in one line is compressed, not corrupted. Only flag it as a fidelity failure if the compression lost the actionable insight, not merely the detail.
- **Re-synthesis loops**: Merging fragments during re-synthesis can create new entries that themselves need pruning next cycle. Keep merges minimal — combine only entries that clearly cover the same topic. Do not synthesize new insights during a pruning pass.

## Related Skills

- `manage-memory` — the complementary skill for organizing and growing memory; use together for complete memory maintenance
- `verify-memory-integrity` — the non-mutating pass that measures both caps and reachability without changing anything; run it before this skill so the withdrawal decisions rest on numbers rather than impressions, and again after, to confirm the pass left the store reachable
- `meditate` — clearing and grounding that may reveal which memories are creating noise
- `rest` — sometimes the best memory maintenance is not doing memory maintenance
- `assess-context` — evaluating reasoning context health, which memory quality directly affects
