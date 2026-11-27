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
  version: "1.5"
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

Classify each memory entry into one of six types — **Project**, **Decision**, **Pattern**, **Reference**, **Feedback**, or **Ephemeral** (default retention rules and examples in [policy-reference.md](references/policy-reference.md#memory-type-classification-table-step-1)). The `wc -l` above is inventory, not a cap check: the index has a *dual* load cap (see Validation).

Also note **age** (`mtime` records last *write*) and an explicitly labeled **access-frequency estimate**. **No read counter exists anywhere in this system** — never call an estimate circulation data and never let it carry a withdrawal alone without staleness (Step 2) or fidelity (Step 3) evidence.

**Expected:** A complete inventory with every memory entry classified by type, with ages and explicitly labeled access-frequency estimates. Ephemeral entries are already flagged for immediate removal.

**On failure:** If memory files are too large or unstructured to classify entry-by-entry, work at the section level. Classify entire sections rather than individual bullets. The goal is coverage, not granularity.

### Step 2: Detect Staleness

Compare memory claims against current project state across five patterns: **1. Count drift**, **2. Path drift**, **3. State drift** (closed issues/merged PRs still marked open), **4. Decision reversal**, and **5. Tool/version drift**. Run the spot-check grep commands in [policy-reference.md](references/policy-reference.md#staleness--fidelity-spot-check-commands-steps-23) and mark each stale entry with its pattern and current correct value.

**Expected:** A list of stale entries with specific evidence of what changed. Each stale entry has a recommended action: update (if the correct value is known), verify (if uncertain), or prune (if the entire entry is obsolete).

**On failure:** If you cannot verify a claim because it references external state (APIs, third-party docs, deployment status), mark it as `unverifiable` rather than assuming it is correct. Unverifiable entries are candidates for pruning if they are not actively useful.

### Step 3: Run Fidelity Checks

Test whether memories still produce accurate, actionable context using external anchors (an agent cannot self-verify its own compressed summaries):

1. **Round-trip verification:** check whether the entry leads to the right file, pattern, and conclusion.
2. **Compression loss detection:** compare compressed summaries against source commits/files to confirm actionable insight survived.
3. **Contradiction scan:** check for conflicts across memory files and against `CLAUDE.md` / registries.
4. **Utility test:** ask whether deleting the entry would break anything in the next 5 sessions.

Spot-check commands live in [policy-reference.md](references/policy-reference.md#staleness--fidelity-spot-check-commands-steps-23).

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

Apply the 7-tier pruning decision tree in order (**1. Ephemeral** → **2. Failed fidelity** → **3. Duplicates** → **4. Stale** update-or-withdraw → **5. Low fidelity**, requiring Step 3 evidence → **6. Medium-fidelity closed work** → **7. Freely searchable references** — full tree and tombstone rationale in [policy-reference.md](references/policy-reference.md#pruning-decision-tree--tombstone-rationale-step-4)).

**Withdraw, not delete:**
1. Move the original body to `<memory-dir>/deaccessioned/<original-name>.md` with a tombstone header (`deaccessioned_at`, `reason`, `superseded_by`, `register_id`) — worked template in [references/EXAMPLES.md](references/EXAMPLES.md).
2. Remove the pointer from `MEMORY.md`.
3. Append one row to the Step 7 register carrying the matching `register_id`.

Before applying any withdrawal, check whether the entry warrants counter-memory inoculation (Step 5); a withdraw + inoculate outcome produces a SUPERSEDED file in `<memory-dir>`, a tombstone under `deaccessioned/` (excluded from Step 9's top-level orphan scan), and one linked register row.

**Expected:** A clear list of entries to withdraw, entries to update, and entries to keep — each with a documented reason, each withdrawal carrying a tombstone and a register row. The keep/withdraw ratio depends on memory health; a well-maintained memory might prune 5-10%, a neglected one might prune 30-50%.

**On failure:** If the decision tree produces ambiguous results for many entries, apply a tighter filter: "Would I write this entry today, knowing what I know now?" If not, it is a withdrawal candidate. Err toward pruning — it is easier to re-learn a fact than to work around a wrong memory, and with tombstones a wrong withdrawal costs one lookup in the register.

### Step 5: Inoculate Against Pattern Re-Derivation

Withdrawal alone fails when the conditions that generated an abandoned strategy persist — the system re-derives the same conclusion, and a tombstone outside retrieval does not block it.

- **Withdraw-only:** stale facts, outdated pointers, expired context.
- **Withdraw + inoculate:** failed strategies, dangerous patterns, or abandoned approaches with persistent triggers.
- **Inoculate-only:** overridden decisions whose original rationale matters (add a SUPERSEDED counter-memory pointing to it).

Place each SUPERSEDED record as its own file in `<memory-dir>` (e.g., `superseded_strategy_X.md`) and **add an index line in `MEMORY.md` in the same edit** — an unlinked counter-memory is never retrieved and blocks nothing. Record its path alongside the tombstone path in the Step 7 register. Full SUPERSEDED template, when-NOT-to-inoculate rules, and hygiene guidelines: [policy-reference.md](references/policy-reference.md#counter-memory-inoculation-rules--superseded-template-step-5).

**Expected:** For every Step 4 withdrawal candidate involving abandoned strategies or dangerous patterns, a corresponding SUPERSEDED counter-memory file is created before the original entry is withdrawn. One register row records the withdrawal, its tombstone, and its inoculation. Active memory remains lean while the regeneration paths are blocked.

**On failure:** If unsure whether an entry warrants inoculation, default to inoculate. A redundant SUPERSEDED record costs little; a regenerated bad pattern costs much more. If the SUPERSEDED list grows large enough to be noise itself, that is a signal to investigate the upstream conditions producing repeated abandonments — the fix is at the input layer, not the memory layer.

### Step 6: Apply Preemptive Filters

Define "what NOT to save" rules and flag any existing entries matching prohibited patterns: session-specific task state, intermediate reasoning, debug output/stack traces, brittle exact command sequences, emotional/tonal notes, duplicates of `CLAUDE.md`, and unverified single observations (full table in [policy-reference.md](references/policy-reference.md#preemptive-filter-patterns-step-6)).

Document these rules in `MEMORY.md` or `retention-policy.md`. Note that **nothing here is enforced at write time** — this skill runs out-of-band, so every guarantee in this file is *verified when the skill last ran*, not an invariant.

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

Make irreplaceable entries immune from pruning (architecture decisions, user identity preferences, timestamped security audit results, rename/migration records — criteria table in [policy-reference.md](references/policy-reference.md#protected-memory-criteria-step-8)).

- **Designation:** Maintain a `protected` list in `pruning-log.md` and check it before Step 4 withdrawals. Never rely on `<!-- PROTECTED -->` HTML comments in `MEMORY.md` (comments are stripped before load).
- **Unprotecting:** Explicitly remove the designation and log the reason before withdrawing.

**Expected:** Protected entries survive all prune passes. The pruning log records any protection additions or removals.

**On failure:** If the protected set grows too large (>30% of total entries), review the criteria — protection is for irreplaceable context, not for "important" entries. Important but reconstructible facts should remain subject to normal pruning.

### Step 9: Re-Synthesize After Pruning

After withdrawal, remaining memories may be fragmented — cross-references point to withdrawn entries, topic files lose coherence, and MEMORY.md may have gaps. Re-synthesis restores structural integrity. A write succeeding tells you nothing about whether the memory will ever be read again: verify reachability, not write success — and verify it every session, because the operation that breaks reachability (compaction) is the same operation the caps make mandatory.

**Re-synthesis checklist:**

1. **Resolve broken references in both directions:** fix *dangling* links and *orphaned* files using the scan below.
2. **Merge related fragments:** combine entries covering overlapping aspects of the same topic.
3. **Update topic file structure:** if a topic file lost >50% of its content, fold the remainder into `MEMORY.md` and withdraw the topic file.
4. **Classify cold memories (estimate):** separate *cold-from-disuse* (retain) from *cold-from-irrelevance* (flag for next cycle) — criteria in [policy-reference.md](references/policy-reference.md#cold-memory-classification-step-9).
5. **Verify `MEMORY.md` coherence:** read top-to-bottom to confirm it tells a coherent project story.

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

Redirect or remove every dangling link; re-link or withdraw every orphan (the scan honors four standing rules — example-target exclusion, exact-link reachability, HTML-comment stripping, and dual file/byte denominators — detailed in [policy-reference.md](references/policy-reference.md#rules-the-step-9-reachability-scan-honors)). `deaccessioned/` tombstones live in a subdirectory and never report as orphans.

**Expected:** Post-pruning memory is structurally sound — zero dangling links, zero unintended orphans, no redundant fragments, no incoherent topic files. Cold entries are classified for future pruning decisions.

**On failure:** If re-synthesis reveals that pruning was too aggressive (critical context was lost), find the register row in the pruning log and restore the body from its tombstone under `deaccessioned/`. This is why the audit trail carries content and not just a summary. If a register row has no tombstone behind it, fall back to the Step 4 snapshot manifest — and treat the missing tombstone as the finding, because it means a withdrawal in this pass was really a deletion.

### Step 10: Recover from Memory Drift

When stored facts become silently wrong because reality changed (counts, paths, versions, or tool output contradictions), repair in-place where ground truth is determinable: **1. Identify drift** against current ground truth → **2. Update in-place** with `[corrected YYYY-MM-DD]` (or flag `unverifiable` for withdrawal) → **3. Trace gradual vs. discrete causes** (scanning sibling entries after renames/migrations) → **4. Prevent recurrence** by referencing authoritative sources instead of fast-moving numbers. Full triggers and steps in [policy-reference.md](references/policy-reference.md#step-10-drift-detection-triggers--recovery-procedure).

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
