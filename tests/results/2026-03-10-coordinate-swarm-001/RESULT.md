## Run: 2026-03-10-coordinate-swarm-001

**Observer**: Claude (automated) | **Duration**: 8m

### Scenario

| Field | Value |
|-------|-------|
| Scenario ID | test-coordinate-swarm-planning |
| Test Level | skill |
| Target | coordinate-swarm |
| Category | E |

### Phase Log

| Phase | Observation |
|-------|-------------|
| Data gathering | Read skills/_registry.yml (full 52-domain inventory), tests/_registry.yml (30 scenarios), and coordinate-swarm SKILL.md |
| Step 1: Classify | Problem classified as "Division of Labor + Foraging (composite)". Failure mode: clustering (all agents test the same popular domain). Current coverage mapped per domain. |
| Step 2: Signals | 5 signals designed: tested-marker, priority-trail, domain-coverage, busy-marker, domain-saturation (scope change integrated) |
| Scope change | Domain diversity constraint integrated as domain-saturation signal with minimum floor (1 test per domain) and proportional cap |
| Step 3: Local rules | 7 prioritized rules using only local information. Rule 1: prefer virgin domains. Rule 7: yield to busy markers. |
| Step 4: Quorum sensing | 3 collective decisions: A (domain saturated, threshold = ceil(domain_size/5)), B (exploration→exploitation, 35 domains covered), C (swarm complete, 95% domain floor) |
| Step 5: Tuning | Parameters proposed: decay rate 0.85/round, saturation divisor 5, floor coverage 1, exploration quorum 35. Pilot: 10-selection dry run. |
| Priority list | Specific 10-skill priority list produced for next round of testing |

### Acceptance Criteria Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Problem classified | PASS | "Division of Labor + Foraging (composite)". Failure mode identified: clustering on popular domains (esoteric 29 skills attracts agents, while crafting 1 skill gets ignored). Current coverage gap mapped per domain with actual percentages. |
| 2 | Signal table produced | PASS | 5 signals with deposit conditions, decay rates, and responses: (1) tested-marker (binary, no decay, agent skips), (2) priority-trail (strength = risk × cross-ref density, decays 0.85/round), (3) domain-coverage (ratio tested/total, triggers saturation check), (4) busy-marker (agent claims target, decays after 1 round), (5) domain-saturation (scope change: floor + proportional cap). |
| 3 | Local rules defined | PASS | 7 rules in priority order using only local information: R1 (check virgin domain beacon — always prefer uncovered domains), R2 (follow priority trail if >0.5), R3 (check domain saturation — skip if above cap), R4 (prefer complex skills — metadata.complexity field), R5 (prefer cross-referenced skills), R6 (check busy marker — yield), R7 (random walk if all signals neutral). |
| 4 | Quorum thresholds set | PASS | 3 collective decisions with hysteresis: Decision A (domain saturated: ceil(domain_size/5), e.g., esoteric saturates at 6 tests), Decision B (exploration→exploitation: triggered when 35/52 domains have floor coverage), Decision C (swarm complete: 95% of domains have floor AND average saturation >60%). |
| 5 | Tuning proposed | PASS | 5 parameters (decay 0.85, divisor 5, floor 1, exploration quorum 35, completion threshold 95%). Pilot proposed: 10-selection dry run with computed signal states. Tuning recommendation: increase divisor if clustering persists, decrease if domains under-explored. |
| 6 | Coverage data used | PASS | References actual counts throughout: 299 skills, 52 domains, 30 tests existing, specific domain sizes (esoteric 29, compliance 17, devops 13, etc.), specific coverage percentages per domain. |
| 7 | Domain diversity signal added | PASS | Domain-saturation signal integrated into signal table: minimum floor of 1 test per domain, proportional cap of ceil(domain_size/5), beacon for uncovered domains. R1 (virgin domain preference) directly implements the floor constraint. |
| 8 | Actionable output | PASS | Specific 10-skill priority list produced with domain, complexity, rationale for each. Includes: deploy-to-kubernetes (containerization, virgin), format-apa-report (citations, virgin), adapt-architecture (morphic, virgin), implement-audit-trail (compliance, complex), plan-hiking-tour (travel, virgin), build-grafana-dashboards (observability, complex), observe-insect-behavior (entomology, cross-ref), prepare-soil (gardening, virgin), formulate-herbal-remedy (hildegard, virgin), apply-semantic-versioning (versioning, virgin). |
| 9 | Risk-based prioritization | PASS | Priority-trail signal uses risk × cross-reference density as strength metric. Complex skills (metadata.complexity = advanced) score higher. Cross-referenced skills (appear in Related Skills sections of other skills) score higher. Specific examples: implement-audit-trail (high complexity, 3 cross-refs) outranks simple virgin domain skills. |

**Passed**: 9/9 | **Threshold**: 6/9 | **Verdict**: **PASS**

### Rubric Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Procedure Fidelity | 5/5 | All 5 steps fully executed with all required artifacts: classification with failure mode, signal table with 5 signals, 7 prioritized local rules, 3 quorum decisions with hysteresis, tuning parameters with pilot proposal. |
| Signal Quality | 5/5 | Composable signals with well-calibrated decay (0.85/round for trails, binary for markers, ratio for coverage). Each signal has clear deposit condition, decay behavior, and agent response. Domain-saturation signal integrates floor + cap elegantly. |
| Rule Clarity | 5/5 | Simple, local, stateless rules with clear priority ordering. R1 (virgin domain) takes absolute priority over trail-following (R2). R6 (busy marker) prevents duplication. R7 (random walk) is the fallback. Each rule uses only locally visible signals. |
| Problem Fit | 4/5 | Deeply specific to test coverage with domain-aware foraging. Coverage state map, domain-specific saturation thresholds, and exploration/exploitation transition are all testing-specific. Deducted 1: the pilot proposal could have been more concrete (e.g., actually simulating the first 3 rounds with computed signal states). |
| Actionability | 5/5 | Specific priority list derivable and explicitly produced: 10 skills named with domains, complexity levels, and selection rationale. Coverage state projection after 10 selections (17/52 domains covered, 33%). Three implementation artifacts described (COVERAGE_STATE.md, signal table comment, local rules embedding). |

**Total**: 24/25

### Key Observations

- **The swarm plan is genuinely executable**: The 10-skill priority list is specific enough to guide actual test creation. Each selection is justified by signal state (virgin domain, high complexity, cross-reference density). A human or agent could follow this plan directly.
- **Domain-saturation signal is the key design contribution**: The proportional cap (ceil(domain_size/5)) means esoteric (29 skills) saturates at 6 tests while crafting (1 skill) saturates at 1 test. This prevents the clustering failure mode while respecting domain size.
- **Exploration→exploitation transition at 35/52 domains is well-calibrated**: 67% domain coverage as the trigger for mode switch balances breadth (exploration) against depth (exploitation). Before 35 domains, agents prioritize virgin domains; after 35, agents follow priority trails within domains.
- **15,157 chars of pure swarm coordination output**: Demonstrates that the coordinate-swarm skill produces substantial, structured output when applied to a real coverage problem rather than a hypothetical.
- **Self-referential meta-testing**: The swarm is planning how to test the skills library that contains the coordinate-swarm skill itself. This meta-level is acknowledged in the problem classification.

### Lessons Learned

- The coordinate-swarm skill transfers well from abstract coordination theory to concrete planning problems — the 5-step procedure structures thinking about distributed coverage
- Stigmergic signals work for test prioritization: the environment (registry state) carries the coordination information, not agent-to-agent communication
- The virgin-domain-first rule (R1) is the most impactful local rule — it guarantees floor coverage before depth coverage
- Swarm coordination produces better coverage strategies than centralized planning because it handles the "what if we add agents later?" question naturally — new agents follow the same local rules
