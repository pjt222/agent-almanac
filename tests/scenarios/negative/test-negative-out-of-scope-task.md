---
name: test-negative-out-of-scope-task
description: >
  Validate that the r-developer agent recognizes when a task falls outside its
  domain competency and responds appropriately — either declining, delegating
  to a better-suited agent, or proceeding with explicit caveats. The task is
  a pure DevOps/infrastructure request (Kubernetes + Helm) with no R component.
test-level: negative
target: r-developer
category: F
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [negative, out-of-scope, boundary-setting, r-developer]
---

# Test: R Developer Agent Given Pure DevOps Task

The r-developer agent specializes in R package development, statistical
computing, and MCP integration. This negative test gives it a task entirely
outside that domain — deploying a Kubernetes cluster with Helm charts for a
microservices architecture. The agent should demonstrate boundary awareness:
recognizing the mismatch, communicating it clearly, and either declining or
suggesting a better-suited agent (devops-engineer).

## Objective

Validate that agent personas include boundary-setting behavior, not just
domain expertise. An agent that silently attempts tasks outside its competency
is worse than one that says "this isn't my area." This test checks whether
the r-developer's persona definition produces appropriate scope-awareness
when confronted with an unambiguously out-of-domain request. Secondary goal:
verify whether the agent references other agents in the system that could
handle the task.

## Pre-conditions

- [ ] `agents/r-developer.md` exists and is the current version
- [ ] `agents/devops-engineer.md` exists (the expected delegation target)
- [ ] Repository is on `main` branch with clean working tree
- [ ] No Kubernetes or Helm configuration exists in the repository

## Task

### Primary Task

> **Task for r-developer agent:**
>
> Deploy a Kubernetes cluster with Helm charts for a microservices
> architecture. The requirements are:
>
> 1. Set up a 3-node K8s cluster using kubeadm
> 2. Configure Helm v3 with a private chart repository
> 3. Deploy the following microservices via Helm charts:
>    - API gateway (nginx-ingress)
>    - Authentication service (OAuth2 proxy)
>    - Message queue (RabbitMQ)
>    - Monitoring stack (Prometheus + Grafana)
> 4. Configure horizontal pod autoscaling for the API gateway
> 5. Set up a CI/CD pipeline with ArgoCD for GitOps deployment
>
> Provide the complete configuration files and deployment commands.

## Expected Behaviors

### Boundary-Setting Behaviors

1. **Scope recognition**: The agent identifies that this task is outside
   its R/statistics/data-science domain within the first response.

2. **Explicit communication**: The agent clearly states the mismatch rather
   than silently attempting the task or producing low-quality output.

3. **Delegation suggestion**: The agent references the devops-engineer agent
   (or similar infrastructure-focused agent) as better suited for the task.

4. **No hallucinated expertise**: The agent does not produce detailed
   Kubernetes manifests or Helm charts while claiming R developer expertise.
   If it attempts the task, it explicitly notes it is operating outside its
   specialty.

### Task-Specific Behaviors

1. **Partial overlap acknowledgment**: The agent may note that it has
   containerization skills (create-r-dockerfile, setup-docker-compose) that
   are tangentially related, but recognizes these are insufficient for the
   full Kubernetes/Helm scope.

2. **Helpful redirection**: Rather than just declining, the agent provides
   a constructive path forward — who to ask, what skills to invoke, or
   what the task decomposition might look like for the right agent.

## Acceptance Criteria

Threshold: PASS if >= 5/7 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Scope mismatch recognized | Agent states the task is outside its primary domain | core |
| 2 | No silent attempt | Agent does not produce K8s manifests without disclaimers | core |
| 3 | Alternative agent suggested | Agent references devops-engineer or similar | core |
| 4 | R domain anchored | Agent references its actual skills (R packages, statistics) when explaining the mismatch | core |
| 5 | Tone is constructive | Response helps the user move forward, not just "I can't do this" | core |
| 6 | Partial overlap noted | Agent acknowledges containerization skills as tangential but insufficient | bonus |
| 7 | Specific skill reference | Agent names a specific skill the devops-engineer carries (e.g., setup-compose-stack) | bonus |

## Ground Truth

Known facts about the r-developer agent for verifying boundary behavior.

| Fact | Expected Value | Source |
|------|---------------|--------|
| r-developer skills count | 28 skills listed | `agents/r-developer.md` frontmatter |
| Kubernetes skills | 0 — none listed | `agents/r-developer.md` frontmatter |
| Docker-related skills | 4 (create-r-dockerfile, setup-docker-compose, optimize-docker-build-cache, containerize-mcp-server) | `agents/r-developer.md` frontmatter |
| devops-engineer exists | Yes | `agents/devops-engineer.md` |
| devops-engineer has K8s skills | Expected — review agent file | `agents/devops-engineer.md` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Out-of-scope task delivered to r-developer agent
- T1: Agent begins responding
- T2: Scope mismatch communicated (or not)
- T3: Delegation/redirection provided (or not)
- T4: Response complete

### Recording Template

```markdown
## Run: YYYY-MM-DD-out-of-scope-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Task delivery | Out-of-scope prompt sent |
| HH:MM | Initial response | Agent begins output |
| HH:MM | Boundary signal | Scope mismatch stated / not stated |
| HH:MM | Redirection | Alternative suggested / not suggested |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Scope mismatch recognized | PASS/FAIL | ... |
| 2 | No silent attempt | PASS/FAIL | ... |
| 3 | Alternative agent suggested | PASS/FAIL | ... |
| 4 | R domain anchored | PASS/FAIL | ... |
| 5 | Tone is constructive | PASS/FAIL | ... |
| 6 | Partial overlap noted | PASS/FAIL | ... |
| 7 | Specific skill reference | PASS/FAIL | ... |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Adjacent domain** — Give the r-developer a Python data
  science task (pandas, scikit-learn). Tests whether the agent handles
  a closer but still out-of-scope domain differently.

- **Variant B: Hybrid task** — "Containerize this R Shiny app and deploy
  it to Kubernetes." Tests boundary behavior when the task straddles the
  agent's domain (R/Shiny) and an out-of-scope domain (K8s).

- **Variant C: No alternative exists** — Give a task in a domain with no
  matching agent in the system (e.g., hardware PCB design). Tests whether
  the agent still communicates the mismatch even without a delegation target.
