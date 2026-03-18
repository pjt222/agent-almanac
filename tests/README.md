# Tests

30 test scenarios for validating team coordination, agent behavior, and skill execution. The framework covers 7 categories: static validation (CI-automated), structural integrity (CI-automated), coordination patterns, agent behavior, skill execution, negative/edge cases, and integration/composition. Each scenario is evaluated on a 5-dimension rubric (max 25 points) covering accuracy, completeness, coordination fidelity, persona adherence, and actionability.

CI workflows (`validate-skills.yml`, `validate-tests.yml`, `validate-integrity.yml`) automate the static checks. The remaining scenarios are executed manually via Claude Code and produce structured results in `tests/results/`.

## Test Scenarios

| Scenario | Level | Target | Pattern | Description |
|----------|-------|--------|---------|-------------|
| [test-opaque-team-cartographers-audit](scenarios/teams/test-opaque-team-cartographers-audit.md) | team | opaque-team | adaptive | Opaque team audits the knowledge graph integrity of the agent-almanac repository |
| [test-agentskills-alignment-format-audit](scenarios/teams/test-agentskills-alignment-format-audit.md) | team | agentskills-alignment | hub-and-spoke | Agentskills-alignment team audits 10 recent skills for format compliance via hub-and-spoke coordination |
| [test-metal-self-extraction](scenarios/skills/test-metal-self-extraction.md) | skill | metal | - | Metal skill extracts conceptual essence of the agent-almanac repository itself |
| [test-dyad-contemplative-review](scenarios/teams/test-dyad-contemplative-review.md) | team | dyad | reciprocal | Dyad team performs reciprocal review of the metal skill with alternating practitioner/witness roles |
| [test-tending-sequential-session](scenarios/teams/test-tending-sequential-session.md) | team | tending | sequential | Tending team assesses alchemy domain health through sequential handoff chain |
| [test-alchemist-chrysopoeia-optimization](scenarios/agents/test-alchemist-chrysopoeia-optimization.md) | agent | alchemist | - | Alchemist agent performs chrysopoeia value extraction on the test infrastructure |
| [test-devops-platform-parallel-review](scenarios/teams/test-devops-platform-parallel-review.md) | team | devops-platform-engineering | parallel | DevOps platform team reviews CI/CD infrastructure via parallel coordination |
| [test-scrum-team-sprint-planning](scenarios/teams/test-scrum-team-sprint-planning.md) | team | scrum-team | timeboxed | Scrum team runs a compressed sprint simulation for test framework improvements |
| [test-r-package-review-wave-parallel](scenarios/teams/test-r-package-review-wave-parallel.md) | team | r-package-review | wave-parallel | R package review team uses wave-parallel overlay to review infrastructure in dependency waves |
| [test-r-developer-package-audit](scenarios/agents/test-r-developer-package-audit.md) | agent | r-developer | - | R developer agent audits the tests/results/ Quarto+renv setup for R package best practices |
| [test-security-analyst-repo-scan](scenarios/agents/test-security-analyst-repo-scan.md) | agent | security-analyst | - | Security analyst audits agent-almanac for secrets, vulnerabilities, and CI permission issues |
| [test-devops-engineer-ci-review](scenarios/agents/test-devops-engineer-ci-review.md) | agent | devops-engineer | - | DevOps engineer reviews 5 CI workflows for best practices and improvement opportunities |
| [test-janitor-repo-cleanup](scenarios/agents/test-janitor-repo-cleanup.md) | agent | janitor | - | Janitor agent performs tidy-project-structure audit with verifiable discovery of untracked files |
| [test-hildegard-herbal-consult](scenarios/agents/test-hildegard-herbal-consult.md) | agent | hildegard | - | Hildegard agent describes project as natural history using viriditas lens for persona fidelity testing |
| [test-advocatus-diaboli-challenge](scenarios/agents/test-advocatus-diaboli-challenge.md) | agent | advocatus-diaboli | - | Devil's advocate critically reviews the test framework itself for weaknesses and logical fallacies |
| [test-security-audit-codebase-self](scenarios/skills/test-security-audit-codebase-self.md) | skill | security-audit-codebase | - | Security audit skill executed on agent-almanac for procedure verification against known-clean baseline |
| [test-review-skill-format-batch](scenarios/skills/test-review-skill-format-batch.md) | skill | review-skill-format | - | Skill format review executed on 5 skills across different domains for consistency validation |
| [test-commit-changes-dryrun](scenarios/skills/test-commit-changes-dryrun.md) | skill | commit-changes | - | Commit changes skill in dry-run mode identifies untracked files and drafts message without committing |
| [test-investigate-capa-root-cause](scenarios/skills/test-investigate-capa-root-cause.md) | skill | investigate-capa-root-cause | - | CAPA root cause investigation on adaptive pattern underperformance finding from cross-scenario analysis |
| [test-negative-malformed-scenario](scenarios/negative/test-negative-malformed-scenario.md) | negative | test-team-coordination | - | Malformed scenario file missing required sections tests the test framework's own error handling |
| [test-negative-out-of-scope-task](scenarios/negative/test-negative-out-of-scope-task.md) | negative | r-developer | - | R developer given a Kubernetes task tests graceful boundary-setting and scope refusal |
| [test-negative-conflicting-findings](scenarios/negative/test-negative-conflicting-findings.md) | negative | r-package-review | - | Team members produce contradictory findings to test lead conflict resolution |
| [test-negative-empty-target](scenarios/negative/test-negative-empty-target.md) | negative | metal | - | Metal skill on empty directory tests graceful degradation without hallucinated content |
| [test-negative-stale-registry](scenarios/negative/test-negative-stale-registry.md) | negative | validate-tests | - | Documents and verifies CI catches registry count mismatches with actual files on disk |
| [test-coordinate-swarm-planning](scenarios/skills/test-coordinate-swarm-planning.md) | skill | coordinate-swarm | - | Swarm skill plans a foraging strategy for testing coverage across 299 skills |
| [test-meditate-self-assessment](scenarios/skills/test-meditate-self-assessment.md) | skill | meditate | - | Meta-cognitive meditation skill applied to technical test infrastructure as cross-domain stress test |
| [test-assess-form-skill-review](scenarios/skills/test-assess-form-skill-review.md) | skill | assess-form | - | Morphic form assessment on the test-team-coordination skill for structural health analysis |
| [test-integration-skill-in-agent](scenarios/integration/test-integration-skill-in-agent.md) | integration | gardener | - | Gardener agent naturally invokes default skills (meditate, heal) during ecosystem assessment |
| [test-integration-agent-in-team](scenarios/integration/test-integration-agent-in-team.md) | integration | entomology | - | Entomology team members use their specific skills during coordinated ecosystem survey |
| [test-integration-multi-skill-chain](scenarios/integration/test-integration-multi-skill-chain.md) | integration | alchemist | - | Alchemist chains metal, chrysopoeia, and transmute skills sequentially with output feeding forward |

## Running Tests

Use the `test-team-coordination` skill to execute a scenario:

```
/test-team-coordination
```

Results are stored in `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md`.

## Registry

The `_registry.yml` file catalogs all test scenarios and defines coordination pattern key behaviors used during evaluation.

## See Also

- [Understanding the System](../guides/understanding-the-system.md) -- how skills, agents, and teams compose
- [test-team-coordination](../skills/test-team-coordination/SKILL.md) -- skill for executing test scenarios
- [Root README](../README.md) -- project overview