---
name: devops-platform-engineering
description: Platform engineering team combining infrastructure, ML infrastructure, security, and architecture for production systems
lead: devops-engineer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [devops, kubernetes, ci-cd, security, infrastructure, platform]
coordination: parallel
members:
  - id: devops-engineer
    role: Lead
    responsibilities: Defines platform scope, manages CI/CD and Kubernetes infrastructure, coordinates parallel workstreams, integrates final platform design
  - id: mlops-engineer
    role: ML Platform Engineer
    responsibilities: Designs ML-specific infrastructure including model serving, experiment tracking, feature stores, and GPU scheduling
  - id: security-analyst
    role: Platform Security Engineer
    responsibilities: Implements security controls, network policies, secrets management, RBAC, and compliance scanning
  - id: senior-software-developer
    role: Platform Architect
    responsibilities: Reviews platform API design, service abstractions, developer experience, and technical debt
---

# DevOps Platform Engineering Team

A four-agent team that designs and implements production platform infrastructure. The lead (devops-engineer) defines the platform scope and coordinates parallel workstreams across core infrastructure, ML platform, security, and architecture, then integrates everything into a unified platform design.

## Purpose

Modern platform engineering requires expertise across multiple infrastructure domains:

- **Core Infrastructure**: Kubernetes clusters, CI/CD pipelines, GitOps workflows, service mesh, observability
- **ML Infrastructure**: Model serving, experiment tracking, feature stores, GPU scheduling, drift monitoring
- **Security**: Network policies, RBAC, secrets management, policy-as-code, compliance scanning
- **Architecture**: Platform APIs, service abstractions, developer experience, internal developer platform (IDP)

By working in parallel, the team builds a cohesive platform that addresses all these concerns simultaneously rather than bolting security and ML support onto an afterthought.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `devops-engineer` | Lead | Kubernetes, CI/CD, GitOps, observability, integration |
| ML Platform | `mlops-engineer` | ML Platform Engineer | Model serving, tracking, feature stores, GPU scheduling |
| Security | `security-analyst` | Platform Security Engineer | Network policies, RBAC, secrets, compliance |
| Architecture | `senior-software-developer` | Platform Architect | APIs, abstractions, developer experience, tech debt |

## Coordination Pattern

Parallel: the devops-engineer lead defines the platform scope, all members work simultaneously on their domains, and the lead merges results into a unified platform design.

```
           devops-engineer (Lead)
          /        |        \
         /         |         \
mlops-engineer     |    senior-software-developer
                   |
          security-analyst
```

**Flow:**

1. Lead defines platform requirements, constraints, and target architecture
2. All four members work in parallel on their platform domain
3. Lead identifies integration points and conflicts between domains
4. Lead produces unified platform design with implementation roadmap

## Task Decomposition

### Phase 1: Setup (Lead)
The devops-engineer lead defines the platform scope:

- Assess current infrastructure state and gaps
- Define target platform capabilities and constraints
- Identify integration points between domains (e.g., ML serving needs security policies)
- Create parallel workstream tasks for each domain

### Phase 2: Parallel Streams

**devops-engineer** tasks:
- Design Kubernetes cluster architecture (namespaces, resource quotas, node pools)
- Configure CI/CD pipelines with GitOps workflow (Argo CD or Flux)
- Set up observability stack (Prometheus, Grafana, Loki, OpenTelemetry)
- Define service mesh configuration (Istio or Linkerd)

**mlops-engineer** tasks:
- Design model serving infrastructure (KServe, Seldon, or custom)
- Configure experiment tracking and model registry (MLflow)
- Set up feature store integration (Feast or custom)
- Plan GPU scheduling and resource allocation

**security-analyst** tasks:
- Define network policies and microsegmentation
- Configure RBAC and service accounts
- Set up secrets management (Sealed Secrets or Vault)
- Implement policy-as-code with OPA Gatekeeper

**senior-software-developer** tasks:
- Design platform API surface and service abstractions
- Evaluate developer experience and self-service capabilities
- Assess platform extensibility and plugin architecture
- Review infrastructure-as-code patterns and technical debt

### Phase 3: Integration (Lead)
The devops-engineer lead:
- Merges all domain designs into a unified platform architecture
- Resolves conflicts between domain requirements
- Defines implementation phases and dependencies
- Produces a platform design document with deployment roadmap

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: devops-platform-engineering
  lead: devops-engineer
  coordination: parallel
  members:
    - agent: devops-engineer
      role: Lead
      subagent_type: devops-engineer
    - agent: mlops-engineer
      role: ML Platform Engineer
      subagent_type: mlops-engineer
    - agent: security-analyst
      role: Platform Security Engineer
      subagent_type: security-analyst
    - agent: senior-software-developer
      role: Platform Architect
      subagent_type: senior-software-developer
  tasks:
    - name: design-core-infrastructure
      assignee: devops-engineer
      description: Design Kubernetes clusters, CI/CD pipelines, GitOps, observability, service mesh
    - name: design-ml-platform
      assignee: mlops-engineer
      description: Design model serving, experiment tracking, feature store, GPU scheduling
    - name: design-platform-security
      assignee: security-analyst
      description: Define network policies, RBAC, secrets management, policy-as-code
    - name: design-platform-architecture
      assignee: senior-software-developer
      description: Design platform APIs, service abstractions, developer experience
    - name: integrate-platform-design
      assignee: devops-engineer
      description: Merge domain designs, resolve conflicts, produce unified architecture and roadmap
      blocked_by: [design-core-infrastructure, design-ml-platform, design-platform-security, design-platform-architecture]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Greenfield Platform Build
Building a new internal developer platform from scratch:

```
User: Design our internal developer platform — we need Kubernetes, CI/CD, ML serving, and security from day one
```

The team designs all four platform domains in parallel and delivers an integrated architecture with implementation roadmap.

### Scenario 2: Platform Migration
Migrating from legacy infrastructure to a modern platform:

```
User: Migrate our VM-based infrastructure to Kubernetes — we also need to support our ML workloads and meet SOC2 requirements
```

The team designs the migration path across all domains, ensuring ML workloads and security requirements are addressed from the start.

### Scenario 3: Platform Audit
Reviewing an existing platform for gaps and improvements:

```
User: Audit our Kubernetes platform — check the infrastructure, ML support, security posture, and developer experience
```

The team reviews the existing platform across all four domains and produces a prioritized improvement plan.

## Limitations

- Best suited for Kubernetes-based platform engineering; adaptable to other container orchestrators
- Requires all four agent types to be available as subagents
- Does not provision or modify live infrastructure — produces designs, configurations, and recommendations
- Complex multi-cluster or multi-cloud setups may need phased approach
- Cost optimization requires actual metrics data; initial designs are based on best practices

## See Also

- [devops-engineer](../agents/devops-engineer.md) — Lead agent with infrastructure expertise
- [mlops-engineer](../agents/mlops-engineer.md) — ML infrastructure agent
- [security-analyst](../agents/security-analyst.md) — Security engineering agent
- [senior-software-developer](../agents/senior-software-developer.md) — Architecture review agent
- [setup-local-kubernetes](../skills/setup-local-kubernetes/SKILL.md) — Kubernetes setup skill
- [build-ci-cd-pipeline](../skills/build-ci-cd-pipeline/SKILL.md) — CI/CD pipeline skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
