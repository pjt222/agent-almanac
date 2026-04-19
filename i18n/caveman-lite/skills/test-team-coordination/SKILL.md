---
name: test-team-coordination
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Execute a test scenario against a team, observing coordination pattern
  behaviors, evaluating acceptance criteria, and generating a structured
  RESULT.md. Use when validating that a team's coordination pattern produces
  the expected behaviors during a realistic task, comparing coordination
  patterns on equivalent workloads, or establishing baseline performance
  for a team composition.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: review, testing, teams, coordination, validation
---

# Test Team Coordination

Execute a test scenario from `tests/scenarios/teams/` against the target
team. Observe coordination pattern behaviors, evaluate acceptance criteria,
score the rubric, and produce a `RESULT.md` in `tests/results/`.

## When to Use

- Validating that a team's coordination pattern produces expected behaviors
- Running a structured test after modifying a team definition or agent
- Comparing coordination patterns by running the same scenario with different teams
- Establishing baseline performance metrics for a team composition
- Regression testing after adding new agents or changing team membership

## Inputs

- **Required**: Path to the test scenario file (e.g., `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`)
- **Optional**: Run ID override (default: `YYYY-MM-DD-<target>-NNN` auto-generated)
- **Optional**: Team size override (default: from scenario frontmatter)
- **Optional**: Skip scope change (default: false — inject scope change if defined)

## Procedure

### Step 1: Load and Validate Test Scenario

1.1. Read the test scenario file specified in the input.

1.2. Parse YAML frontmatter and extract:
   - `target` — the team to test
   - `coordination-pattern` — the expected pattern
   - `team-size` — number of members to spawn
   - Acceptance criteria table
   - Scoring rubric (if present)
   - Ground truth data (if present)

1.3. Verify the scenario file has all required sections:
   - Objective
   - Pre-conditions
   - Task (with Primary Task subsection)
   - Expected Behaviors
   - Acceptance Criteria
   - Observation Protocol

**Expected:** Scenario file loads, parses, and contains all required sections.

**On failure:** If the file is missing or unparseable, abort with an error message identifying the missing file or malformed section. If optional sections (Rubric, Ground Truth, Variants) are absent, note their absence and continue.

### Step 2: Verify Pre-conditions

2.1. Walk through each pre-condition checkbox in the scenario.

2.2. For file-existence checks, use Glob to verify.

2.3. For registry count checks, parse the relevant `_registry.yml` and compare `total_*` against actual file counts on disk.

2.4. For branch/git state checks, run `git status --porcelain` and `git branch --show-current`.

**Expected:** All pre-conditions are satisfied.

**On failure:** If any pre-condition fails, record it as BLOCKED in the results. Decide whether to proceed (soft pre-condition) or abort (hard pre-condition like missing target team file). Document the decision.

### Step 3: Load Coordination Pattern Criteria

3.1. Read `tests/_registry.yml` and locate the `coordination_patterns` entry matching the scenario's `coordination-pattern` value.

3.2. Extract the `key_behaviors` list for this pattern.

3.3. These behaviors become the observation checklist — each must be watched for during execution and recorded as observed/not observed.

**Expected:** Pattern key behaviors loaded and ready for observation.

**On failure:** If the coordination pattern is not defined in the registry, use the scenario's Expected Behaviors section as the sole observation source. Log a warning.

### Step 4: Execute the Task

4.1. Create the result directory: `tests/results/YYYY-MM-DD-<target>-NNN/`.

4.2. Record T0 (task start timestamp).

4.3. Read the target team's definition from `teams/<target>.md`, extract the CONFIG block, and activate the team: call `TeamCreate` with the team name, spawn teammates using each member's `subagent_type`, and create tasks from the CONFIG `tasks` list. Use the team-size from the scenario. Pass the Primary Task prompt verbatim from the scenario's Task section.

4.4. Observe the team's execution phases. Record timestamps for:
   - T1: Form assessment / task decomposition complete
   - T2: Role assignments visible

4.5. If the scenario defines a Scope Change Trigger and skip-scope-change is false:
   - Wait until Phase 2 (role assignment) is visible
   - Record T3 (scope change injection timestamp)
   - Send the scope change prompt to the team via SendMessage
   - Record T4 (scope change absorbed — role adjustment visible)

4.6. Continue observing until the team delivers its output.
   - Record T5 (integration begins)
   - Record T6 (final report delivered)

4.7. Capture the team's complete output.

**Expected:** Team executes the task through its coordination pattern phases. Timestamps are recorded for all transitions. Scope change (if applicable) is injected and absorbed.

**On failure:** If the team fails to produce output, record the failure point and any error messages. If the team stalls, note the last observed phase and timeout. Proceed to evaluation with partial results.

### Step 5: Evaluate Pattern Behaviors

5.1. For each key behavior from Step 3, determine whether it was observed during execution:
   - **Observed**: Clear evidence in the team's output or coordination
   - **Partial**: Some evidence but incomplete or ambiguous
   - **Not observed**: No evidence

5.2. For each task-specific behavior from the scenario's Expected Behaviors section, apply the same evaluation.

5.3. Record findings in the observation log.

**Expected:** All or most pattern-specific and task-specific behaviors are observed.

**On failure:** Unobserved behaviors are findings, not failures of the test procedure. Record them accurately — they indicate the coordination pattern did not fully manifest.

### Step 6: Evaluate Acceptance Criteria

6.1. Walk through each acceptance criterion from the scenario.

6.2. For each criterion, assign a determination:
   - **PASS**: Criterion clearly met with observable evidence
   - **PARTIAL**: Criterion partially met (counts toward threshold at 0.5 weight)
   - **FAIL**: Criterion not met despite opportunity
   - **BLOCKED**: Could not evaluate (pre-condition failure, team timeout, etc.)

6.3. If the scenario includes Ground Truth data, verify reported findings against it:
   - Calculate accuracy percentages per category
   - Flag false positives and false negatives

6.4. If the scenario includes a Scoring Rubric, score each dimension 1-5 with brief justification.

6.5. Calculate summary metrics:
   - Acceptance: X/N criteria passed (PARTIAL counts as 0.5)
   - Threshold: PASS if >= threshold defined in scenario
   - Rubric total: X/Y points (if applicable)

**Expected:** All acceptance criteria have a determination. Summary metrics are calculated.

**On failure:** If fewer than half the criteria can be evaluated (too many BLOCKED), the test run is inconclusive. Document why and recommend re-running after fixing pre-conditions.

### Step 7: Generate RESULT.md

7.1. Create `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md` using the Recording Template from the scenario's Observation Protocol.

7.2. Populate all sections:
   - Run metadata (observer, timestamps, duration)
   - Phase log with all recorded timestamps
   - Role emergence log (for adaptive/team tests)
   - Acceptance criteria results table
   - Rubric scores table (if applicable)
   - Ground truth verification table (if applicable)
   - Key observations (narrative)
   - Lessons learned

7.3. Include the team's raw output as an appendix or in a separate file (`team-output.md`) in the same result directory.

7.4. Add a summary verdict at the top:
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

**Expected:** Complete RESULT.md with all sections populated and a clear verdict.

**On failure:** If result file cannot be written, output the results to stdout as a fallback. The evaluation data should never be lost.

## Validation

- [ ] Test scenario file loaded and all required sections present
- [ ] Pre-conditions verified (or documented as BLOCKED)
- [ ] Coordination pattern key behaviors loaded from registry
- [ ] Team spawned and task delivered
- [ ] Scope change injected at the right time (if applicable)
- [ ] All pattern-specific behaviors evaluated (observed/partial/not observed)
- [ ] All acceptance criteria have a determination (PASS/PARTIAL/FAIL/BLOCKED)
- [ ] Ground truth verification completed (if applicable)
- [ ] RESULT.md generated with all sections populated
- [ ] Summary verdict calculated and recorded

## Common Pitfalls

- **Evaluating output quality instead of coordination**: This skill tests *how the team coordinates*, not whether the task output is perfect. A team that coordinates well but finds only 7/9 broken refs still demonstrates the pattern.
- **Injecting scope change too early**: Wait until role assignment is clearly visible before injecting the scope change. Too early means the team hasn't differentiated yet, so there's nothing to adapt.
- **Conflating team member output with team output**: The opaque team should present a unified output. If you see individual member reports, that's a finding about opacity, not a test infrastructure problem.
- **Exact ground truth matching**: Ground truth counts are approximate. Evaluate whether findings are in the right ballpark, not whether they match exactly.
- **Forgetting to record timestamps**: Timestamps are essential for measuring phase durations and adaptation speed. Set them as events happen, not retroactively.

## Related Skills

- `review-codebase` — deep codebase review that complements team-level testing
- `review-skill-format` — validates individual skill format (this skill validates team coordination)
- `create-team` — creates team definitions that this skill tests
- `evolve-team` — evolves team definitions based on test findings
- `test-a2a-interop` — similar testing pattern for A2A protocol conformance
- `assess-form` — the morphic assessment that the opaque team lead uses internally
