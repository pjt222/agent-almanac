# Cross-Scenario Analysis and Framework Retrospective

**Date**: 2026-03-09
**Scope**: All 6 test scenarios executed under Issue #96
**Observer**: Claude Opus 4.6

## Summary Table

| # | Scenario | Level | Pattern | AC Score | Rubric | Duration |
|---|----------|-------|---------|----------|--------|----------|
| 1 | Cartographer's Audit | team | adaptive | 10/12 (83%) | 22/30 (73%) | ~85m |
| 2 | Alignment Format Audit | team | hub-and-spoke | 10/10 (100%) | 22/25 (88%) | ~4m |
| 3 | Metal Self-Extraction | skill | — | 11/11 (100%) | 25/25 (100%) | ~4m |
| 4 | Dyad Contemplative Review | team | reciprocal | 9/9 (100%) | 25/25 (100%) | ~2m |
| 5 | Tending Sequential Session | team | sequential | 10/10 (100%) | 25/25 (100%) | ~3.5m |
| 6 | Alchemist Chrysopoeia | agent | — | 10/10 (100%) | 24/25 (96%) | ~3m |

**Overall**: 6/6 PASS. 60/62 acceptance criteria met (97%). Combined rubric: 143/155 (92%).

---

## Cross-Scenario Analysis

### By Coordination Pattern

| Pattern | Scenario | AC % | Rubric % | Key Strength | Key Weakness |
|---------|----------|------|----------|--------------|--------------|
| Adaptive | Cartographer's Audit | 83% | 73% | Role emergence was genuine; roles were non-overlapping | Lead shutdown before integration; ground truth estimates were poor |
| Hub-and-spoke | Alignment Format Audit | 100% | 88% | Clean separation of concerns; parallel member work with unified synthesis | Slight overlap between senior-researcher and senior-software-developer on frontmatter |
| Sequential | Tending Sequential Session | 100% | 100% | Cumulative insight progression; convergent findings from independent perspectives | Depends on handoff quality — a weak early phase would propagate |
| Reciprocal | Dyad Contemplative Review | 100% | 100% | Witness feedback demonstrably influenced next round; emergent findings neither alone would produce | Only 2 rounds tested; pattern benefits from more iterations |

**Finding**: Structured patterns (sequential, reciprocal, hub-and-spoke) outperformed the adaptive pattern. The adaptive pattern's score was dragged down by operational issues (lead shutdown, poor ground truth) rather than pattern failure per se, but the pattern's self-organizing nature makes it more fragile — there's no predefined structure to fall back on when things go wrong.

**Finding**: The reciprocal pattern produced the deepest analysis relative to team size. Two agents alternating roles generated findings ("epistemically incomplete") that neither agent's perspective alone would produce. The witness role — observing reasoning patterns rather than reviewing content — is a genuinely novel coordination mechanism.

**Finding**: The sequential pattern's strength is convergent validity. The dissolve-form gap was identified independently by 3 of 4 members (mystic flagged it, alchemist confirmed structurally, gardener confirmed ecologically). This convergence from independent perspectives is stronger evidence than any single expert's finding.

### By Test Level

| Level | Scenarios | Avg AC % | Avg Rubric % | What It Tests | What It Reveals |
|-------|-----------|----------|--------------|---------------|-----------------|
| Team (4) | #1, #2, #4, #5 | 96% | 90% | Coordination, role separation, synthesis quality | Whether agents can work together, hand off cleanly, and produce unified output |
| Agent (1) | #6 | 100% | 96% | Persona fidelity, skill usage, domain expertise | Whether an agent internalizes its persona and follows skill procedures without prompting |
| Skill (1) | #3 | 100% | 100% | Procedure fidelity, artifact quality, output correctness | Whether a skill's step-by-step procedure produces the expected artifacts at each stage |

**Finding**: Skill-level tests are the most precise. Metal self-extraction had 7 discrete procedure steps, each producing verifiable artifacts. The test could confirm fidelity at every stage. Team tests, by contrast, evaluate emergent behavior that's harder to attribute to specific components.

**Finding**: Agent-level tests bridge the gap. The alchemist test validated both persona (alchemical vocabulary, material respect) and skill usage (chrysopoeia procedure). The unprompted meditate checkpoint was the strongest signal — it showed the agent had internalized the alchemy methodology beyond what the test explicitly required.

**Finding**: Team tests reveal coordination overhead. The Cartographer's Audit (adaptive, 4 agents, 85 minutes) took 20x longer than the Dyad review (reciprocal, 2 agents, 2 minutes). Smaller, well-structured teams outperform larger, self-organizing ones on bounded tasks.

### Emergent Findings Across Scenarios

Several findings appeared in multiple scenarios, reinforcing their validity:

1. **Self-referential targets produce the richest tests**: Scenarios #2 (auditing this repo's skills), #3 (extracting this repo's essence), and #6 (classifying this repo's test infrastructure) all used the agent-almanac repository itself as the target. This creates strong ground truth — we know exactly what the project contains and can verify every claim. Scenario #1 (knowledge graph audit) also used self-reference and found real issues.

2. **Scope changes aligned with member roles integrate smoothly**: In #2, the symlink audit was naturally absorbed by the librarian. In #5, the cross-domain comparison was naturally absorbed by the gardener's ecological lens and the shaman's integrative synthesis. In #6, the growth readiness assessment fit the alchemist's forward-looking orientation. Scope changes that match existing roles create no friction.

3. **Format audits surface systemic issues**: In #2, the CRLF finding (257/298 files) transcended the 10-skill audit scope. In #6, the README drift finding applied to the entire test framework. Auditing a subset can reveal patterns that affect the whole.

4. **Contemplative practices add measurable value**: The unprompted meditate checkpoint in #6, the mystic's intention-setting in #5, and the contemplative's "refusal to accept the frame" in #4 all produced findings that structural analysis alone would miss. These aren't decorative — they catch assumption biases and frame acceptance that technical reviewers skip.

---

## Framework Retrospective

### What Worked

1. **The template produced consistent, comparable results**: All 6 RESULT.md files follow the same structure (verdict, score, phase log, acceptance criteria, rubric, ground truth, observations, lessons). This makes cross-scenario comparison tractable.

2. **Acceptance criteria with clear thresholds are binary-evaluable**: "Found >= 5 broken references" or "Compression ratio calculated" — these leave no room for interpretation. The 97% pass rate across 62 criteria means the criteria are achievable but not trivial.

3. **The rubric dimensions map well to test levels**: Team tests use decomposition, specialization, synthesis, accuracy, and adaptation. Skill tests use procedure fidelity, abstraction, rigor, understanding, and output quality. Agent tests use skill fidelity, persona consistency, classification accuracy, expertise, and recommendation quality. These dimensions measure what matters at each level.

4. **Ground truth tables anchor verification**: Every scenario included expected values that could be checked against disk. This prevented the results from being purely subjective assessments.

5. **Scope change triggers tested adaptation in context**: 5 of 6 scenarios included a mid-task scope change. All 5 were absorbed gracefully. The one scenario without a scope change (#4) deliberately omitted it to isolate the coordination pattern from adaptation, which was the right call.

### What Needs Improvement

1. **Ground truth estimation is the weakest link**: The Cartographer's Audit (#1) estimated ~36 orphan nodes but found only 8. The estimate was based on an assumption ("most skills are probably not referenced") that turned out to be wrong. Future scenarios should verify ground truth estimates against disk before writing them into the scenario file.

2. **Duration variance is extreme**: Scenario #1 took 85 minutes; #4 took 2 minutes. This 40x spread makes "run all scenarios" impractical as a regression suite. Short scenarios (#2-#6) should be the norm; long scenarios (#1) should be flagged as "extended" in the registry.

3. **Single-execution results can't distinguish signal from noise**: Each scenario was run exactly once. A score of 25/25 might mean the scenario is too easy, or it might mean the agent performed exceptionally. Without repeat runs, we can't measure variance. The framework should support `runs: N` for statistical confidence.

4. **The adaptive pattern needs operational guardrails**: The Cartographer's Audit failed 2 criteria (orphan threshold, integration) due to lead shutdown — an operational issue, not a pattern failure. Future adaptive-pattern scenarios should specify maximum wallclock time and define what happens if the lead is unavailable.

5. **Agent simulation vs actual multi-agent execution**: Team scenarios were executed by a single agent simulating all member roles. This tests whether the coordination pattern produces good output, but not whether actual independent agents can coordinate. True multi-agent tests would require launching separate Claude Code sessions — feasible but not yet implemented.

6. **No negative test cases**: All 6 scenarios tested well-formed inputs and expected cooperation. The framework lacks scenarios for: malformed input, uncooperative agents, conflicting member findings, or tasks outside the team's competency. These would reveal failure modes.

### Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| 1 | Verify ground truth estimates against disk before committing scenario files | Low — add a verification step to the scenario creation workflow |
| 2 | Tag scenarios with expected duration in registry (`duration: short/medium/long`) | Low — registry schema change |
| 3 | Add at least one negative test scenario (e.g., conflicting findings, out-of-scope task) | Medium — new scenario type |
| 4 | Implement `runs: N` support with variance reporting | Medium — framework change |
| 5 | Test actual multi-agent execution for at least 1 team scenario | High — requires session orchestration |
| 6 | Cover remaining 3 patterns (parallel, timeboxed, wave-parallel) | Medium — 3 new scenarios |

### Coverage After This Execution

| Dimension | Before #96 | After #96 | Gap |
|-----------|-----------|-----------|-----|
| Coordination patterns | 0/7 | 4/7 | parallel, timeboxed, wave-parallel |
| Test levels | 0/3 | 3/3 | — |
| Teams tested | 0/12 | 4/12 | 8 teams |
| Agents tested | 0/62 | 1/62 | 61 agents |
| Skills tested | 0/298 | 1/298 | 297 skills |
| Total scenarios | 6 | 6 | — |
| Total executions | 0 | 6 | — |

The framework is validated across all 3 test levels and the 4 most common coordination patterns. The remaining 3 patterns (parallel, timeboxed, wave-parallel) are lower-priority because they're used by fewer teams. The larger gap is breadth — 61 untested agents and 297 untested skills — but the framework is now proven and ready to scale.
