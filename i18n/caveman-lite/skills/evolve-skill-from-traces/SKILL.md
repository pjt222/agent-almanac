---
name: evolve-skill-from-traces
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Transform raw agent execution traces into a validated SKILL.md through a three-stage pipeline: trajectory collection, parallel multi-agent patch proposal, and conflict-free consolidation. This skill bridges the gap between observed agent behavior and documented procedures, turning successful runs into reproducible skills.

## When to Use

- Execution traces reveal recurring patterns not captured in existing skills
- Observed agent behavior outperforms the documented procedure
- Building skills from scratch by recording expert demonstrations
- Multiple agents propose conflicting improvements to the same skill

## Inputs

- **Required**: `traces` -- set of agent execution logs or session transcripts (minimum 10 successful runs recommended)
- **Required**: `target_skill` -- path to an existing SKILL.md to evolve, or `"new"` for skill extraction from scratch
- **Optional**: `analyst_count` -- number of parallel analyst agents to spawn (default: 4)
- **Optional**: `held_out_ratio` -- fraction of traces reserved for validation, not used in drafting (default: 0.2)

## Procedure

### Step 1: Collect Execution Traces

Gather agent session logs, tool-call sequences, or conversation transcripts that demonstrate the target behavior. Filter for runs tagged as successful. Normalize into a standard trace format: a sequence of (state, action, outcome) triples with timestamps.

1. Identify the trace source: session logs, tool-call history, or conversation exports
2. Filter traces by success criteria (exit code 0, task completion flag, user confirmation)
3. Normalize each trace into a list of structured triples:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. Partition traces: reserve `held_out_ratio` (default 20%) for validation in Step 7, use the remainder for Steps 2-6

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**Expected:** A normalized trace set partitioned into drafting (80%) and held-out (20%) subsets. Each trace entry contains state, action, outcome, and timestamp fields.

**On failure:** If fewer than 10 successful traces are available, collect more before proceeding. Small trace sets produce overfitted skills that fail on novel inputs. If traces lack timestamps, assign ordinal sequence numbers instead.

### Step 2: Cluster Trajectories

Group normalized traces by outcome pattern. Identify the invariant core (steps present in all successful trajectories) versus variant branches (steps that differ across runs). The invariant core becomes the skeleton for the skill procedure.

1. Align traces by action type -- map each trace to a sequence of action labels
2. Find the longest common subsequence across all traces to identify the invariant core
3. Classify remaining actions as variant branches, noting which traces include them and under what conditions
4. Record branch frequency: what percentage of successful traces include each variant step

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

**Expected:** A clear separation between invariant core actions (present in all successful traces) and variant branches (conditional, present in a subset). Each variant branch has a frequency count and triggering condition.

**On failure:** If no invariant core emerges (traces are too heterogeneous), the target behavior may actually be multiple distinct skills. Split traces into coherent subgroups by outcome type and process each group separately.

### Step 3: Draft Skill Skeleton

From the invariant core, generate an initial SKILL.md with frontmatter, When to Use (derived from entry conditions across traces), Inputs (parameters that varied across runs), and a Procedure section with one step per invariant action.

1. Extract entry conditions from the first state of each trace to populate When to Use
2. Identify parameters that varied across runs (file paths, thresholds, options) to populate Inputs
3. Create one procedure step per invariant core action, using the most common phrasing across traces
4. Add placeholder Expected/On failure blocks based on observed outcomes

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

**Expected:** A syntactically valid SKILL.md skeleton with frontmatter, When to Use, Inputs, and a Procedure section containing one step per invariant core action. Expected blocks reflect observed outcomes; On failure blocks are placeholders.

**On failure:** If the skeleton exceeds 500 lines before adding variant branches, the invariant core is too granular. Merge adjacent actions that always occur together into single steps. Target 5-10 procedure steps.

### Step 4: Parallel Multi-Agent Patch Proposal

Spawn N analyst agents (recommend 4-6), each reviewing the full trace set against the draft skeleton from a different analytical lens. Each agent produces a structured patch: section, old text, new text, rationale.

Assign one lens per analyst:

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | Does the skeleton capture all success paths? Are any invariant steps missing? |
| 2 | Efficiency | Are there redundant steps? Can any steps be merged or parallelized? |
| 3 | Robustness | Which failure modes are unhandled? What should On failure blocks contain? |
| 4 | Edge Cases | Which variant branches should become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Is each step unambiguous? Can an agent follow it mechanically? |
| 6 (optional) | Generalizability | Are there trace-specific artifacts that should be abstracted? |

Each analyst agent receives:
- The draft skeleton from Step 3
- The full drafting trace set (not held-out)
- Their assigned lens and focus questions

Each analyst returns a list of structured patches:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**Expected:** Each analyst returns 3-10 structured patches with section references, old/new text, rationale, and supporting trace IDs. All patches are collected into a single patch set.

**On failure:** If an analyst returns no patches, their lens may not apply to this skill. This is acceptable -- not every lens surfaces issues. If an analyst returns vague patches without trace references, reject and re-prompt with the requirement for concrete supporting_traces.

### Step 5: Detect and Classify Conflicts

Compare all patches from Step 4 for overlapping edits. Classify each pair of overlapping patches into one of three categories.

1. Index patches by target section
2. For patches targeting the same section, compare old_text and new_text
3. Classify each overlap:

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

**Expected:** A conflict report listing all patch pairs, their classification, and for contradictions, the supporting trace counts for each side.

**On failure:** If the classification is ambiguous (a patch both adds and modifies text in the same section), split it into two patches: one additive, one modifying. Re-classify the smaller patches.

### Step 6: Consolidate Patches

Merge all patches into a single consolidated SKILL.md using a three-tier resolution strategy.

1. **Compatible patches**: Apply directly -- these touch different sections and cannot conflict
2. **Complementary patches**: Combine the new_text from both patches into a single coherent block, preserving both contributions
3. **Contradictory patches**: Resolve using prevalence-weighting:
   - Count how many traces support each variant
   - Prefer the patch aligned with more traces
   - If tied (or within 10% of each other), use the `argumentation` skill to evaluate which patch better serves the skill's stated purpose
   - Document the rejected alternative as a Common Pitfall or a note in the relevant On failure block

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

After consolidation, verify the resulting SKILL.md:
- All sections are present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- Every procedure step has Expected and On failure
- No duplicate or contradictory instructions remain
- Line count is within the 500-line limit

**Expected:** A single consolidated SKILL.md incorporating patches from all analysts. Contradictions are resolved with documented rationale. The rejected alternative for each contradiction appears as a pitfall or note.

**On failure:** If consolidation produces an internally inconsistent document (e.g., Step 3 assumes a file exists but Step 2 was removed by an efficiency patch), revert the conflicting edit and keep the original skeleton text for that section. Flag the inconsistency for manual review.

### Step 7: Validate and Register

Run the consolidated skill mentally against held-out traces (the 20% reserved in Step 1). Verify that Expected/On failure blocks match observed outcomes in traces the skill has never seen.

1. For each held-out trace, walk through the skill procedure step by step
2. At each step, compare the skill's Expected outcome against the trace's actual outcome
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

4. If mismatch rate exceeds 20%, return to Step 4 with the mismatched traces added to the drafting set
5. If the skill is new, follow `create-skill` for directory creation, registry entry, and symlink setup
6. If evolving an existing skill, follow `evolve-skill` for version bumping and translation sync

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**Expected:** At least 80% of held-out traces match the skill procedure end-to-end. The skill is registered in `skills/_registry.yml` with correct metadata.

**On failure:** If validation fails (>20% mismatch), the skill has overfit to the drafting traces. Add the mismatched traces to the drafting set and re-run from Step 2. If validation continues to fail after two iterations, the behavior may be too variable for a single skill -- consider splitting into multiple skills by outcome type.

## Validation

- [ ] At least 10 successful traces were collected before drafting
- [ ] Traces are partitioned into drafting (80%) and held-out (20%) subsets
- [ ] Invariant core and variant branches are explicitly documented
- [ ] At least 4 analyst agents reviewed the skeleton from distinct lenses
- [ ] All patch conflicts are classified (compatible, complementary, contradictory)
- [ ] Contradictory patches are resolved with documented rationale
- [ ] Consolidated SKILL.md has all required sections with Expected/On failure pairs
- [ ] Held-out validation achieves at least 80% match rate
- [ ] Line count is within the 500-line limit
- [ ] Skill is registered (new) or version-bumped (existing) per standard procedures

## Common Pitfalls

- **Too few traces**: With fewer than 10 successful runs, pattern extraction is unreliable. The invariant core may include accidental steps, and variant branches will lack sufficient frequency data. Collect more traces before starting.
- **Overfitting to trace artifacts**: Tool-specific behaviors (e.g., a particular API client's retry pattern) may not generalize. During Step 3, abstract tool-specific actions into tool-agnostic descriptions. The skill should describe *what* to do, not *which tool* to use.
- **Ignoring failure traces**: Failure traces reveal what the skill should warn about in On failure blocks. During Step 1, also collect failed runs and tag them. Use them in Step 4 when the robustness analyst evaluates unhandled failure modes.
- **Single-lens analysis**: Using only 1-2 analysts misses important perspectives. An efficiency analyst alone will strip away safety checks that a robustness analyst would preserve. Use at least 4 distinct lenses for balanced coverage.
- **Merging contradictory patches without resolution**: Applying both sides of a contradiction produces an internally inconsistent skill (e.g., "do X" in one step and "skip X" in another). Always classify and resolve contradictions explicitly in Step 6.
- **Not validating against held-out traces**: Without held-out validation, the consolidated skill may fit the drafting traces perfectly but fail on novel runs. Always reserve 20% of traces and test the final skill against them.

## Related Skills

- `evolve-skill` -- simpler human-directed evolution (complementary: use when traces are unavailable)
- `create-skill` -- for newly extracted skills that do not exist yet; used in Step 7 for registration
- `review-skill-format` -- validation after consolidation to ensure agentskills.io compliance
- `argumentation` -- used in Step 6 for resolving contradictory patches when prevalence is tied
- `verify-agent-output` -- evidence trails for patch proposals; validates analyst outputs in Step 4
