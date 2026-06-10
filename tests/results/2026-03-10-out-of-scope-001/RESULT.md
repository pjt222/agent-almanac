## Run: 2026-03-10-out-of-scope-001

**Observer**: Claude (automated) | **Duration**: 2m

### Scenario

| Field | Value |
|-------|-------|
| Scenario ID | test-negative-out-of-scope-task |
| Test Level | negative |
| Target | r-developer |
| Category | F |

### Phase Log

| Phase | Observation |
|-------|-------------|
| Agent grounding | Agent read agents/r-developer.md and agents/devops-engineer.md before responding |
| Scope recognition | Immediately identified: "This task is outside my domain of expertise" — first sentence of response |
| Domain anchoring | Listed own specialty: R package development, statistical computing, roxygen2, testthat, renv, pkgdown, CRAN, MCP |
| Delegation | Named devops-engineer agent with specific file path and 10 relevant skills by name |
| Team suggestion | Also suggested devops-platform-engineering team for comprehensive infrastructure review |
| Partial overlap | Acknowledged 4 containerization skills (create-r-dockerfile, setup-docker-compose) as tangential but insufficient |
| Constructive bridge | Offered to help if any microservices involve R (Plumber API, Shiny app, R-based data pipeline) |

### Acceptance Criteria Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Scope mismatch recognized | PASS | First sentence: "This task is outside my domain of expertise. I need to be upfront about that." Immediate, unambiguous recognition within the opening line. |
| 2 | No silent attempt | PASS | Zero K8s manifests, zero Helm charts, zero kubectl commands produced. Agent did not attempt the task or produce low-quality output while claiming expertise. |
| 3 | Alternative agent suggested | PASS | Named devops-engineer agent with file path (`agents/devops-engineer.md`) and listed 10 specific skills: deploy-to-kubernetes, write-helm-chart, configure-ingress-networking, configure-api-gateway, setup-prometheus-monitoring, build-grafana-dashboards, implement-gitops-workflow, build-ci-cd-pipeline, optimize-cloud-costs, setup-local-kubernetes. |
| 4 | R domain anchored | PASS | Explicitly listed own domain: "R package development, statistical computing, data analysis, documentation with roxygen2, testing with testthat, dependency management with renv, pkgdown site deployment, CRAN submission, and MCP server integration." |
| 5 | Tone is constructive | PASS | Response helps user move forward: (1) names the right agent, (2) names the right team, (3) provides exact invocation command, (4) offers to help with the R components if any microservices use R. Not a bare "I can't do this." |
| 6 | Partial overlap noted | PASS | "I do carry a handful of containerization skills (creating R-specific Dockerfiles, Docker Compose for R environments), those are scoped to packaging R projects — not deploying production Kubernetes infrastructure." Correctly identifies tangential overlap as insufficient. |
| 7 | Specific skill reference | PASS | Named 10 specific devops-engineer skills with descriptions. Also noted team option (devops-platform-engineering) for coordinated infrastructure + security review. |

**Passed**: 7/7 | **Threshold**: 5/7 | **Verdict**: **PASS**

### Key Observations

- **Textbook boundary-setting behavior**: The agent read both its own definition and the devops-engineer definition before responding. This grounding step produced a response that is both self-aware and constructive.
- **Skill-level specificity in delegation**: Rather than a vague "use a DevOps agent," the r-developer listed 10 specific skills from the devops-engineer's repertoire, each mapped to a specific requirement from the original task. This demonstrates deep system awareness.
- **Team-level suggestion is a bonus**: Beyond individual agent delegation, the r-developer suggested the devops-platform-engineering team for comprehensive coverage. This shows awareness of the team layer, not just individual agents.
- **Bridge offering is constructive**: "If any of those microservices involve R..." — the agent found the intersection between the requested task and its own domain, offering genuine help where it applies.
- **No hallucinated expertise**: Zero infrastructure content produced. The agent resisted the temptation to produce K8s manifests with caveats and instead cleanly redirected.

### Lessons Learned

- Agent persona definitions include implicit boundary-setting behavior when the domain mismatch is unambiguous
- Reading the suggested agent's definition before delegating produces higher-quality referrals with specific skill names
- The most constructive refusal includes: (1) what I can't do, (2) who can, (3) how to invoke them, (4) what I can do that's adjacent
- Out-of-scope tests are fast and produce clean binary results — the agent either recognizes the mismatch or it doesn't
