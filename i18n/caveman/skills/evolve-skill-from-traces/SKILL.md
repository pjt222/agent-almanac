---
name: evolve-skill-from-traces
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve SKILL.md files from agent execution traces using a three-stage pipeline:
  trajectory collection from observed runs, parallel multi-agent patch proposal
  for error and success analysis, and conflict-free consolidation of overlapping
  edits via prevalence-weighting. Based on the Trace2Skill methodology.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
---

# Evolve a Skill from Execution Traces

Turn raw agent execution traces into checked SKILL.md through three-stage pipeline: trajectory grab, parallel multi-agent patch propose, and conflict-free consolidate. This skill bridges gap between watched agent behavior and logged procedures, turning success runs into repeatable skills.

## When Use

- Execution traces show repeat patterns not caught in existing skills
- Watched agent behavior beats logged procedure
- Building skills from scratch by recording expert demos
- Many agents propose clashing fixes to same skill

## Inputs

- **Required**: `traces` -- set of agent session logs or session transcripts (min 10 success runs advised)
- **Required**: `target_skill` -- path to existing SKILL.md to evolve, or `"new"` for skill pull from scratch
- **Optional**: `analyst_count` -- count of parallel analyst agents to spawn (default: 4)
- **Optional**: `held_out_ratio` -- share of traces held for check, not used in draft (default: 0.2)

## Steps

### Step 1: Collect Execution Traces

Grab agent session logs, tool-call sequences, or conversation transcripts that show target behavior. Filter for runs tagged success. Normalize into standard trace format: sequence of (state, action, outcome) triples with timestamps.

1. Spot trace source: session logs, tool-call history, or conversation exports
2. Filter traces by success criteria (exit code 0, task done flag, user confirm)
3. Normalize each trace into list of structured triples:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. Split traces: hold `held_out_ratio` (default 20%) for check in Step 7, use rest for Steps 2-6

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**Got:** Normalized trace set split into drafting (80%) and held-out (20%) subsets. Each trace entry has state, action, outcome, timestamp fields.

**If fail:** Fewer than 10 success traces? Grab more before go on. Small trace sets make overfit skills that fail on new inputs. Traces lack timestamps? Give ordinal sequence numbers instead.

### Step 2: Cluster Trajectories

Group normalized traces by outcome pattern. Spot invariant core (steps in all success trajectories) vs variant branches (steps that differ across runs). Invariant core becomes skeleton for skill proc.

1. Align traces by action type -- map each trace to sequence of action labels
2. Find longest common subsequence across all traces to spot invariant core
3. Sort other actions as variant branches, note which traces have them and under what cond
4. Record branch frequency: what percent of success traces have each variant step

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

**Got:** Clear split between invariant core actions (in all success traces) and variant branches (cond, in subset). Each variant branch has frequency count and trigger cond.

**If fail:** No invariant core shows up (traces too different)? Target behavior maybe many distinct skills. Split traces into coherent subgroups by outcome type and handle each group apart.

### Step 3: Draft Skill Skeleton

From invariant core, make first SKILL.md with frontmatter, When to Use (from entry conds across traces), Inputs (params that varied across runs), and Procedure section with one step per invariant action.

1. Pull entry conds from first state of each trace to fill When to Use
2. Spot params that varied across runs (file paths, thresholds, options) to fill Inputs
3. Make one proc step per invariant core action, using most common phrasing across traces
4. Add placeholder Expected/On failure blocks based on watched outcomes

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

**Got:** Syntactically valid SKILL.md skeleton with frontmatter, When to Use, Inputs, Procedure section having one step per invariant core action. Expected blocks show watched outcomes; On failure blocks are placeholders.

**If fail:** Skeleton over 500 lines before adding variant branches? Invariant core too fine. Merge adjacent actions that always occur together into one step. Target 5-10 proc steps.

### Step 4: Parallel Multi-Agent Patch Proposal

Spawn N analyst agents (advise 4-6), each reviewing full trace set vs draft skeleton from different analytical lens. Each agent makes structured patch: section, old text, new text, reason.

Give one lens per analyst:

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | Does the skeleton capture all success paths? Are any invariant steps missing? |
| 2 | Efficiency | Are there redundant steps? Can any steps be merged or parallelized? |
| 3 | Robustness | Which failure modes are unhandled? What should On failure blocks contain? |
| 4 | Edge Cases | Which variant branches should become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Is each step unambiguous? Can an agent follow it mechanically? |
| 6 (optional) | Generalizability | Are there trace-specific artifacts that should be abstracted? |

Each analyst agent gets:
- Draft skeleton from Step 3
- Full drafting trace set (not held-out)
- Their lens and focus questions

Each analyst returns list of structured patches:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**Got:** Each analyst returns 3-10 structured patches with section refs, old/new text, reason, support trace IDs. All patches collected into single patch set.

**If fail:** Analyst returns no patches? Their lens maybe not apply to this skill. This is OK -- not every lens shows issues. Analyst returns vague patches with no trace refs? Reject and re-prompt with rule for concrete supporting_traces.

### Step 5: Detect and Classify Conflicts

Compare all patches from Step 4 for overlap edits. Sort each pair of overlap patches into one of three categories.

1. Index patches by target section
2. For patches on same section, compare old_text and new_text
3. Sort each overlap:

| Conflict Type | Definition | Resolution |
|---------------|-----------|------------|
| Compatible | Different sections, no overlap | Merge directly |
| Complementary | Same section, additive (both add content, no contradiction) | Combine text |
| Contradictory | Same section, mutually exclusive (one adds X, other removes X or adds Y instead) | Needs resolution in Step 6 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

**Got:** Conflict report listing all patch pairs, their sort, and for contradictions, support trace counts for each side.

**If fail:** Sort vague (patch both adds and changes text in same section)? Split into two patches: one additive, one modifying. Re-sort smaller patches.

### Step 6: Consolidate Patches

Merge all patches into one consolidated SKILL.md with three-tier resolve strategy.

1. **Compatible patches**: Apply direct -- these touch different sections and cannot clash
2. **Complementary patches**: Combine new_text from both patches into one coherent block, keeping both contributions
3. **Contradictory patches**: Resolve with prevalence-weighting:
   - Count how many traces back each variant
   - Prefer patch matched with more traces
   - Tied (or within 10% of each other)? Use `argumentation` skill to check which patch better serves skill's stated purpose
   - Log rejected alternative as Common Pitfall or note in right On failure block

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

After consolidate, check the SKILL.md:
- All sections present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- Every proc step has Expected and On failure
- No dup or clashing instructions left
- Line count within 500-line limit

**Got:** Single consolidated SKILL.md holding patches from all analysts. Clashes resolved with logged reason. Rejected alternative for each clash shows as pitfall or note.

**If fail:** Consolidate gives internally clashing doc (e.g., Step 3 assumes file exists but Step 2 was removed by efficiency patch)? Revert clashing edit and keep original skeleton text for that section. Flag clash for manual review.

### Step 7: Validate and Register

Run consolidated skill mentally vs held-out traces (20% held in Step 1). Check Expected/On failure blocks match watched outcomes in traces skill never seen.

1. For each held-out trace, walk through skill proc step by step
2. At each step, compare skill Expected outcome vs trace real outcome
3. Record matches and mismatches:

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. Mismatch rate over 20%? Go back to Step 4 with mismatched traces added to drafting set
5. If skill is new, follow `create-skill` for directory make, registry entry, and symlink setup
6. If evolving existing skill, follow `evolve-skill` for version bump and translation sync

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**Got:** At least 80% of held-out traces match skill proc end-to-end. Skill registered in `skills/_registry.yml` with right meta.

**If fail:** Check fails (>20% mismatch)? Skill overfit to drafting traces. Add mismatched traces to drafting set and re-run from Step 2. Check keeps fail after two rounds? Behavior maybe too variable for single skill -- think split into many skills by outcome type.

## Validation

- [ ] At least 10 success traces grabbed before draft
- [ ] Traces split into drafting (80%) and held-out (20%) subsets
- [ ] Invariant core and variant branches logged clear
- [ ] At least 4 analyst agents reviewed skeleton from distinct lenses
- [ ] All patch clashes sorted (compatible, complementary, contradictory)
- [ ] Contradictory patches resolved with logged reason
- [ ] Consolidated SKILL.md has all required sections with Expected/On failure pairs
- [ ] Held-out check hits at least 80% match rate
- [ ] Line count within 500-line limit
- [ ] Skill registered (new) or version-bumped (existing) per standard procs

## Pitfalls

- **Too few traces**: With fewer than 10 success runs, pattern pull unreliable. Invariant core may hold slip steps, and variant branches will lack enough frequency data. Grab more traces before start.
- **Overfit to trace artifacts**: Tool-specific behaviors (e.g., particular API client retry pattern) may not generalize. During Step 3, abstract tool-specific actions into tool-agnostic desc. Skill should say *what* to do, not *which tool* to use.
- **Ignore failure traces**: Failure traces show what skill should warn about in On failure blocks. During Step 1, also grab failed runs and tag them. Use them in Step 4 when robustness analyst checks unhandled failure modes.
- **Single-lens analysis**: Using only 1-2 analysts misses key views. Efficiency analyst alone will strip away safety checks that robustness analyst would keep. Use at least 4 distinct lenses for balance.
- **Merge clashing patches without resolve**: Applying both sides of clash gives internally clashing skill (e.g., "do X" in one step and "skip X" in other). Always sort and resolve clashes clear in Step 6.
- **Not checking vs held-out traces**: With no held-out check, consolidated skill may fit drafting traces perfect but fail on new runs. Always hold 20% of traces and test final skill vs them.

## See Also

- `evolve-skill` -- simpler human-led evolution (complement: use when traces not open)
- `create-skill` -- for fresh-pulled skills not yet exist; used in Step 7 for register
- `review-skill-format` -- check after consolidate to ensure agentskills.io compliance
- `argumentation` -- used in Step 6 for resolving clashing patches when prevalence tied
- `verify-agent-output` -- evidence trails for patch proposals; checks analyst outputs in Step 4
