---
name: test-team-coordination
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Execute test scenario from `tests/scenarios/teams/` against target
team. Observe coordination pattern behaviors, evaluate acceptance criteria,
score rubric, produce `RESULT.md` in `tests/results/`.

## When Use

- Validate team's coordination pattern produces expected behaviors
- Run structured test after modifying team definition or agent
- Compare coordination patterns by running same scenario with different teams
- Establish baseline performance metrics for team composition
- Regression testing after adding new agents or changing team membership

## Inputs

- **Required**: Path to test scenario file (e.g., `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`)
- **Optional**: Run ID override (default: `YYYY-MM-DD-<target>-NNN` auto-generated)
- **Optional**: Team size override (default: from scenario frontmatter)
- **Optional**: Skip scope change (default: false — inject scope change if defined)

## Steps

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

**Got:** Scenario file loads, parses, contains all required sections.

**If fail:** File missing or unparseable? Abort with error message identifying missing file or malformed section. Optional sections (Rubric, Ground Truth, Variants) absent? Note absence, continue.

### Step 2: Verify Pre-conditions

2.1. Walk through each pre-condition checkbox in the scenario.

2.2. For file-existence checks, use Glob to verify.

2.3. For registry count checks, parse the relevant `_registry.yml` and compare `total_*` against actual file counts on disk.

2.4. For branch/git state checks, run `git status --porcelain` and `git branch --show-current`.

**Got:** All pre-conditions satisfied.

**If fail:** Any pre-condition fails? Record as BLOCKED in results. Decide whether to proceed (soft pre-condition) or abort (hard pre-condition like missing target team file). Document decision.

### Step 3: Load Coordination Pattern Criteria

3.1. Read `tests/_registry.yml` and locate the `coordination_patterns` entry matching the scenario's `coordination-pattern` value.

3.2. Extract the `key_behaviors` list for this pattern.

3.3. These behaviors become the observation checklist — each must be watched for during execution and recorded as observed/not observed.

**Got:** Pattern key behaviors loaded, ready for observation.

**If fail:** Coordination pattern not defined in registry? Use scenario's Expected Behaviors section as sole observation source. Log warning.

### Step 4: Execute Task

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

**Got:** Team executes task through coordination pattern phases. Timestamps recorded for all transitions. Scope change (if applicable) injected and absorbed.

**If fail:** Team fails produce output? Record failure point and any error messages. Team stalls? Note last observed phase and timeout. Proceed to evaluation with partial results.

### Step 5: Evaluate Pattern Behaviors

5.1. For each key behavior from Step 3, determine whether it was observed during execution:
   - **Observed**: Clear evidence in the team's output or coordination
   - **Partial**: Some evidence but incomplete or ambiguous
   - **Not observed**: No evidence

5.2. For each task-specific behavior from the scenario's Expected Behaviors section, apply the same evaluation.

5.3. Record findings in the observation log.

**Got:** All or most pattern-specific and task-specific behaviors observed.

**If fail:** Unobserved behaviors are findings, not failures of test procedure. Record accurately — they indicate coordination pattern did not fully manifest.

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

**Got:** All acceptance criteria have determination. Summary metrics calculated.

**If fail:** Fewer than half criteria can be evaluated (too many BLOCKED)? Test run inconclusive. Document why, recommend re-running after fixing pre-conditions.

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

**Got:** Complete RESULT.md with all sections populated and clear verdict.

**If fail:** Result file cannot be written? Output results to stdout as fallback. Evaluation data should never be lost.

## Checks

- [ ] Test scenario file loaded, all required sections present
- [ ] Pre-conditions verified (or documented as BLOCKED)
- [ ] Coordination pattern key behaviors loaded from registry
- [ ] Team spawned, task delivered
- [ ] Scope change injected at right time (if applicable)
- [ ] All pattern-specific behaviors evaluated (observed/partial/not observed)
- [ ] All acceptance criteria have determination (PASS/PARTIAL/FAIL/BLOCKED)
- [ ] Ground truth verification completed (if applicable)
- [ ] RESULT.md generated with all sections populated
- [ ] Summary verdict calculated and recorded

## Pitfalls

- **Evaluate output quality instead of coordination**: This skill tests *how team coordinates*, not whether task output is perfect. Team that coordinates well but finds only 7/9 broken refs still demonstrates pattern.
- **Inject scope change too early**: Wait until role assignment clear visible before injecting scope change. Too early means team hasn't differentiated yet, so nothing to adapt.
- **Conflate team member output with team output**: Opaque team should present unified output. See individual member reports? That's finding about opacity, not test infrastructure problem.
- **Exact ground truth matching**: Ground truth counts approximate. Evaluate whether findings in right ballpark, not whether they match exact.
- **Forget to record timestamps**: Timestamps essential for measuring phase durations and adaptation speed. Set as events happen, not retroactive.

## See Also

- `review-codebase` — deep codebase review complements team-level testing
- `review-skill-format` — validates individual skill format (this skill validates team coordination)
- `create-team` — creates team definitions that this skill tests
- `evolve-team` — evolves team definitions based on test findings
- `test-a2a-interop` — similar testing pattern for A2A protocol conformance
- `assess-form` — morphic assessment that opaque team lead uses internal
