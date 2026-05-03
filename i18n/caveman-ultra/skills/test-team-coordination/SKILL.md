---
name: test-team-coordination
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Exec test scenario vs team, observe coordination pattern behaviors,
  eval acceptance criteria, gen structured RESULT.md. Use → validate
  team's coordination pattern produces expected behaviors during realistic
  task, compare patterns on equivalent workloads, establish baseline perf.
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

Exec test scenario from `tests/scenarios/teams/` vs target team. Observe coordination pattern behaviors, eval acceptance criteria, score rubric, produce `RESULT.md` in `tests/results/`.

## Use When

- Validate team's coordination produces expected behaviors
- Run structured test after modifying team def | agent
- Compare patterns by running same scenario w/ diff teams
- Establish baseline perf metrics for team composition
- Regression tests after adding agents | changing membership

## In

- **Required**: Path to test scenario file (e.g. `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`)
- **Optional**: Run ID override (default: `YYYY-MM-DD-<target>-NNN` auto)
- **Optional**: Team size override (default: from scenario frontmatter)
- **Optional**: Skip scope change (default: false — inject if defined)

## Do

### Step 1: Load + Validate Scenario

1.1. Read scenario file specified in input.

1.2. Parse YAML frontmatter + extract:
   - `target` — team to test
   - `coordination-pattern` — expected pattern
   - `team-size` — # members to spawn
   - Acceptance criteria table
   - Scoring rubric (if present)
   - Ground truth data (if present)

1.3. Verify file has all req sections:
   - Objective
   - Pre-conditions
   - Task (w/ Primary Task subsection)
   - Expected Behaviors
   - Acceptance Criteria
   - Observation Protocol

**Got:** Scenario loads, parses, has all req sections.

**If err:** Missing | unparseable → abort w/ err msg ID'ing missing/malformed. Optional sections (Rubric, Ground Truth, Variants) absent → note + continue.

### Step 2: Verify Pre-conditions

2.1. Walk through each pre-condition checkbox.

2.2. File-existence → use Glob.

2.3. Registry count → parse `_registry.yml` + cmp `total_*` vs actual file counts.

2.4. Branch/git → `git status --porcelain` + `git branch --show-current`.

**Got:** All pre-conditions satisfied.

**If err:** Pre-condition fails → record BLOCKED. Decide: proceed (soft) | abort (hard like missing target team file). Doc decision.

### Step 3: Load Coordination Pattern Criteria

3.1. Read `tests/_registry.yml` + locate `coordination_patterns` matching scenario's `coordination-pattern`.

3.2. Extract `key_behaviors` list.

3.3. Behaviors = observation checklist — each watched during exec + recorded observed/not.

**Got:** Pattern key behaviors loaded for observation.

**If err:** Pattern not in registry → use scenario's Expected Behaviors as sole source. Log warning.

### Step 4: Execute Task

4.1. Create result dir: `tests/results/YYYY-MM-DD-<target>-NNN/`.

4.2. Record T0 (task start).

4.3. Read target team def from `teams/<target>.md`, extract CONFIG block, activate: call `TeamCreate` w/ team name, spawn teammates per `subagent_type`, create tasks from CONFIG `tasks` list. Use team-size from scenario. Pass Primary Task verbatim from scenario's Task section.

4.4. Observe team's exec phases. Record:
   - T1: Form assessment / decomposition complete
   - T2: Role assignments visible

4.5. Scenario defines Scope Change Trigger + skip-scope-change false:
   - Wait until Phase 2 (role assignment) visible
   - T3 (scope change injection)
   - Send scope change prompt via SendMessage
   - T4 (scope change absorbed — role adjustment visible)

4.6. Continue observing until output:
   - T5 (integration begins)
   - T6 (final report delivered)

4.7. Capture team's complete output.

**Got:** Team executes through coordination phases. Timestamps for all transitions. Scope change (if applicable) injected + absorbed.

**If err:** Team fails to produce output → record fail point + err msgs. Stalls → note last phase + timeout. Proceed to eval w/ partial.

### Step 5: Evaluate Pattern Behaviors

5.1. Per key behavior from Step 3, determine observed during exec:
   - **Observed**: Clear evidence in output | coordination
   - **Partial**: Some evidence but incomplete | ambiguous
   - **Not observed**: No evidence

5.2. Per task-specific behavior from scenario's Expected Behaviors, same eval.

5.3. Record findings in observation log.

**Got:** All/most pattern + task behaviors observed.

**If err:** Unobserved = findings, not test fails. Record accurate — pattern didn't fully manifest.

### Step 6: Evaluate Acceptance Criteria

6.1. Walk each acceptance criterion.

6.2. Per criterion, determination:
   - **PASS**: Clearly met w/ observable evidence
   - **PARTIAL**: Partially met (counts toward threshold at 0.5 weight)
   - **FAIL**: Not met despite opportunity
   - **BLOCKED**: Couldn't eval (pre-condition fail, timeout)

6.3. Scenario has Ground Truth → verify findings vs:
   - Calc accuracy % per category
   - Flag false +/false -

6.4. Scenario has Scoring Rubric → score each dim 1-5 w/ brief justification.

6.5. Calc summary metrics:
   - Acceptance: X/N criteria passed (PARTIAL = 0.5)
   - Threshold: PASS if ≥ scenario threshold
   - Rubric total: X/Y points (if applicable)

**Got:** All criteria have determination. Summary metrics calc'd.

**If err:** < half criteria evaluable (too many BLOCKED) → inconclusive. Doc why + recommend re-run after fixing pre-conditions.

### Step 7: Generate RESULT.md

7.1. Create `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md` using Recording Template from scenario's Observation Protocol.

7.2. Populate all sections:
   - Run metadata (observer, timestamps, duration)
   - Phase log w/ all timestamps
   - Role emergence log (adaptive/team tests)
   - Acceptance criteria results table
   - Rubric scores table (if applicable)
   - Ground truth verification table (if applicable)
   - Key observations (narrative)
   - Lessons learned

7.3. Include team's raw output as appendix | separate file (`team-output.md`) in same dir.

7.4. Add summary verdict at top:
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

**Got:** Complete RESULT.md w/ all sections + clear verdict.

**If err:** Result file can't be written → output to stdout fallback. Eval data never lost.

## Check

- [ ] Scenario loaded + all req sections present
- [ ] Pre-conditions verified (or BLOCKED)
- [ ] Pattern key behaviors loaded from registry
- [ ] Team spawned + task delivered
- [ ] Scope change injected at right time (if applicable)
- [ ] All pattern behaviors evaluated (observed/partial/not)
- [ ] All criteria have determination (PASS/PARTIAL/FAIL/BLOCKED)
- [ ] Ground truth verified (if applicable)
- [ ] RESULT.md generated w/ all sections
- [ ] Summary verdict calc'd + recorded

## Traps

- **Eval output quality vs coordination**: Tests *how team coordinates*, not whether output perfect. Team coordinating well but finding 7/9 broken refs still demonstrates pattern.
- **Inject scope change too early**: Wait until role assignment clearly visible. Too early → team hasn't differentiated, nothing to adapt.
- **Conflate member output w/ team output**: Opaque team should present unified output. Individual member reports = finding about opacity, not test infra problem.
- **Exact ground truth matching**: Ground truth counts approximate. Eval right ballpark, not exact match.
- **Forget timestamps**: Essential for phase durations + adaptation speed. Set as events happen, not retroactively.

## →

- `review-codebase` — deep codebase review complementing team-level testing
- `review-skill-format` — validates individual skill format (this validates team coordination)
- `create-team` — creates defs this tests
- `evolve-team` — evolves defs based on test findings
- `test-a2a-interop` — similar testing pattern for A2A protocol conformance
- `assess-form` — morphic assessment opaque team lead uses internally
