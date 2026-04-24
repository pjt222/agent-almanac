---
name: evolve-skill-from-traces
locale: caveman-ultra
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

Raw traces → validated SKILL.md via 3-stage pipeline: trajectory collect, parallel multi-agent patch proposal, conflict-free consolidation. Bridges observed behavior + documented procedures. Successful runs → reproducible skills.

## Use When

- Traces reveal recurring patterns not in skills
- Observed behavior outperforms documented
- Build skills from scratch via expert demos
- Multiple agents propose conflicting improvements

## In

- **Required**: `traces` — agent logs/transcripts (min 10 successful recommended)
- **Required**: `target_skill` — path to existing SKILL.md or `"new"` for from-scratch
- **Optional**: `analyst_count` — parallel analysts (default: 4)
- **Optional**: `held_out_ratio` — fraction reserved for validation (default: 0.2)

## Do

### Step 1: Collect Traces

Gather logs/tool-call sequences/transcripts. Filter successful. Normalize → (state, action, outcome) triples w/ timestamps.

1. Identify source: session logs, tool-call history, conversation exports
2. Filter by success (exit 0, completion flag, user confirm)
3. Normalize each → structured triples:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. Partition: reserve `held_out_ratio` (default 20%) for Step 7 validation, rest for Steps 2-6

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

→ Normalized traces partitioned drafting (80%) + held-out (20%). Each entry has state, action, outcome, timestamp.

If err: <10 successful → collect more. Small sets → overfit → fail on novel. No timestamps → ordinal sequence.

### Step 2: Cluster

Group by outcome pattern. Identify invariant core (all successful) vs variant branches (diff across runs). Invariant core = skeleton.

1. Align by action type → sequence labels
2. Longest common subsequence → invariant core
3. Classify rest → variants, note which traces + conditions
4. Branch frequency: % of successful including each variant

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

→ Clear separation invariant (all) vs variant (subset). Each variant has frequency + condition.

If err: no invariant emerges (heterogeneous) → target may be multiple distinct skills. Split by outcome type, process each.

### Step 3: Draft Skeleton

Invariant core → initial SKILL.md w/ frontmatter, When to Use (entry conditions), Inputs (varied params), Procedure (1 step per invariant action).

1. Extract entry conditions from first state → When to Use
2. Params varied (paths, thresholds, options) → Inputs
3. 1 procedure step per invariant action, most common phrasing
4. Placeholder Expected/On failure based on observed outcomes

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

→ Valid SKILL.md skeleton w/ frontmatter, When to Use, Inputs, Procedure (1 step per invariant). Expected = observed, On failure = placeholder.

If err: skeleton >500 lines pre-variants → invariant too granular. Merge adjacent actions always together. Target 5-10 steps.

### Step 4: Parallel Multi-Agent Patches

Spawn N analysts (4-6), each reviews traces vs skeleton from diff lens. Each → structured patch: section, old, new, rationale.

Lens per analyst:

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | All success paths captured? Any invariant missing? |
| 2 | Efficiency | Redundant steps? Merge/parallelize? |
| 3 | Robustness | Failure modes unhandled? On failure content? |
| 4 | Edge Cases | Variants become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Each step unambiguous? Mechanically followable? |
| 6 (optional) | Generalizability | Trace-specific artifacts should abstract? |

Each analyst gets:
- Skeleton from Step 3
- Full drafting set (not held-out)
- Assigned lens + focus questions

Each → structured patches:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

→ Each analyst returns 3-10 patches w/ section, old/new, rationale, trace IDs. All collected into single set.

If err: analyst returns no patches → lens may not apply. OK — not every lens surfaces issues. Vague patches no trace refs → reject + re-prompt w/ supporting_traces req.

### Step 5: Detect + Classify Conflicts

Compare all patches for overlapping edits. Classify each pair.

1. Index by target section
2. Same section → compare old_text + new_text
3. Classify:

| Conflict | Def | Resolution |
|---------------|-----------|------------|
| Compatible | Diff sections, no overlap | Merge directly |
| Complementary | Same section, additive (both add, no contradiction) | Combine text |
| Contradictory | Same section, mutually exclusive (add X, remove X or add Y instead) | Step 6 resolution |

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

→ Conflict report: all pairs classified, contradictions have supporting trace counts.

If err: ambiguous (patch adds + modifies same section) → split into 2 (additive + modifying). Re-classify.

### Step 6: Consolidate

Merge all → single SKILL.md via 3-tier resolution.

1. **Compatible**: Apply directly — diff sections no conflict
2. **Complementary**: Combine new_text from both → coherent block, both contributions preserved
3. **Contradictory**: Prevalence-weighting:
   - Count traces supporting each
   - Prefer more traces
   - Tied (or within 10%) → `argumentation` skill to eval which better serves purpose
   - Document rejected as Pitfall or On failure note

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

Post-consolidation verify:
- All sections present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- Every step has Expected + On failure
- No duplicate/contradictory instructions
- Line count ≤ 500

→ Single consolidated SKILL.md incorporating all analysts. Contradictions resolved w/ rationale. Rejected alts → pitfall/note.

If err: internally inconsistent (Step 3 assumes file exists but Step 2 removed by efficiency) → revert conflicting edit, keep original skeleton for section. Flag for manual review.

### Step 7: Validate + Register

Run consolidated against held-out (20% Step 1). Verify Expected/On failure match observed in unseen traces.

1. Each held-out → walk through procedure step-by-step
2. Each step → compare Expected vs actual
3. Record matches/mismatches:

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

4. Mismatch >20% → return Step 4 w/ mismatched added to drafting
5. New skill → `create-skill` for dir, registry, symlinks
6. Evolving existing → `evolve-skill` for version + translation sync

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

→ ≥80% held-out match end-to-end. Registered in `skills/_registry.yml` w/ correct metadata.

If err: >20% mismatch → overfit to drafting. Add mismatched to drafting, re-run Step 2. Still fail after 2 iterations → too variable for single skill → split by outcome type.

## Check

- [ ] ≥10 successful traces before drafting
- [ ] Partitioned drafting (80%) + held-out (20%)
- [ ] Invariant + variants documented
- [ ] ≥4 analysts distinct lenses
- [ ] All conflicts classified (compatible, complementary, contradictory)
- [ ] Contradictions resolved w/ rationale
- [ ] SKILL.md all sections w/ Expected/On failure
- [ ] Held-out ≥80% match
- [ ] Line ≤500
- [ ] Registered (new) or version-bumped (existing)

## Traps

- **Too few traces**: <10 → unreliable. Invariant may include accidental, variants lack frequency data. Collect more.
- **Overfit to artifacts**: Tool-specific (particular API client retry) may not generalize. Step 3 abstract → tool-agnostic. Describe *what*, not *which tool*.
- **Ignore failure traces**: Failures reveal On failure content. Step 1 collect failed + tag. Step 4 robustness analyst evaluates unhandled.
- **Single-lens**: 1-2 analysts miss perspectives. Efficiency alone strips safety checks robustness would preserve. ≥4 distinct lenses.
- **Merge contradictions w/o resolution**: Both sides → inconsistent skill ("do X" + "skip X"). Always classify + resolve Step 6.
- **No held-out validation**: Consolidated may fit drafting perfect, fail novel runs. Reserve 20% + test.

## →

- `evolve-skill` — simpler human-directed (complementary: no traces)
- `create-skill` — newly extracted from scratch; Step 7 registration
- `review-skill-format` — validation post-consolidation → agentskills.io
- `argumentation` — Step 6 resolve contradictions when prevalence tied
- `verify-agent-output` — evidence trails for patches; validates analyst outputs Step 4
