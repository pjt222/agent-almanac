---
name: ml-data-science-review
description: Comprehensive ML and data science review covering statistical rigor, research methodology, MLOps readiness, and code architecture
lead: senior-data-scientist
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [data-science, machine-learning, statistics, review, mlops]
coordination: hub-and-spoke
members:
  - id: senior-data-scientist
    role: Lead
    responsibilities: Scopes the analysis, reviews statistical methods and model validation, synthesizes findings into prioritized report
  - id: senior-researcher
    role: Methodology Reviewer
    responsibilities: Reviews experimental design, hypothesis formulation, sampling strategy, and scientific writing quality
  - id: mlops-engineer
    role: MLOps Reviewer
    responsibilities: Evaluates model registry, experiment tracking, feature stores, serving infrastructure, and drift monitoring readiness
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: Reviews code structure, API design, data pipeline patterns, dependency management, and technical debt
---

# ML/Data Science Review Team

A four-agent team that performs comprehensive review of machine learning and data science projects. The lead (senior-data-scientist) orchestrates parallel reviews across statistics, methodology, MLOps, and architecture, then synthesizes findings into a prioritized report.

## Purpose

ML and data science projects span multiple disciplines that benefit from specialized review perspectives:

- **Statistics**: Model selection, validation strategy, metric choice, bias-variance tradeoff, confidence intervals
- **Methodology**: Experimental design, hypothesis testing, sampling strategy, reproducibility, scientific rigor
- **MLOps**: Experiment tracking, model registry, feature stores, serving infrastructure, monitoring
- **Architecture**: Code quality, pipeline design, API surface, dependency management, scalability

By running these reviews in parallel, the team identifies issues that cross domain boundaries — such as a statistically sound model with poor production readiness.

## Team Composition

| Member | Agent | Role | Focus Areas |
|--------|-------|------|-------------|
| Lead | `senior-data-scientist` | Lead | Statistics, model validation, final synthesis |
| Methodology | `senior-researcher` | Methodology Reviewer | Experimental design, hypothesis testing, reproducibility |
| MLOps | `mlops-engineer` | MLOps Reviewer | Tracking, registry, serving, drift monitoring |
| Architecture | `senior-software-developer` | Architecture Reviewer | Code structure, pipelines, APIs, tech debt |

## Coordination Pattern

Hub-and-spoke: the senior-data-scientist lead scopes the project, distributes review tasks, each reviewer works independently, and the lead synthesizes all findings.

```
       senior-data-scientist (Lead)
          /       |        \
         /        |         \
senior-researcher  |  senior-software-developer
                  |
          mlops-engineer
```

**Flow:**

1. Lead identifies the project scope, key models, and data pipelines
2. Three reviewers work in parallel on their specialties
3. Lead collects all findings and identifies cross-domain issues
4. Lead produces a prioritized report with actionable recommendations

## Task Decomposition

### Phase 1: Setup (Lead)
The senior-data-scientist lead examines the project and creates targeted review tasks:

- Identify key models, datasets, and evaluation metrics
- Map the data pipeline from ingestion to serving
- Create review tasks scoped to each reviewer's specialty
- Note project-specific concerns (e.g., real-time inference, regulatory constraints)

### Phase 2: Parallel Review

**senior-researcher** tasks:
- Evaluate experimental design and hypothesis formulation
- Review sampling strategy and data splitting methodology
- Assess reproducibility (random seeds, environment pinning, data versioning)
- Check scientific writing quality in notebooks and documentation

**mlops-engineer** tasks:
- Evaluate experiment tracking setup (MLflow, W&B, or similar)
- Review model registry and versioning practices
- Assess feature store usage and feature engineering pipeline
- Check serving infrastructure and drift monitoring readiness

**senior-software-developer** tasks:
- Review code structure and modularity
- Evaluate data pipeline design patterns
- Assess API design for model serving endpoints
- Check dependency management and technical debt

### Phase 3: Synthesis (Lead)
The senior-data-scientist lead:
- Collects all reviewer findings
- Reviews statistical methods and model validation in detail
- Identifies cross-domain issues (e.g., sound statistics but undeployable model)
- Produces a prioritized report: critical > high > medium > low
- Recommends specific improvements for each finding

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: ml-data-science-review
  lead: senior-data-scientist
  coordination: hub-and-spoke
  members:
    - agent: senior-data-scientist
      role: Lead
      subagent_type: senior-data-scientist
    - agent: senior-researcher
      role: Methodology Reviewer
      subagent_type: senior-researcher
    - agent: mlops-engineer
      role: MLOps Reviewer
      subagent_type: mlops-engineer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
  tasks:
    - name: review-statistics
      assignee: senior-data-scientist
      description: Review statistical methods, model validation, metrics, and bias-variance tradeoff
    - name: review-methodology
      assignee: senior-researcher
      description: Evaluate experimental design, sampling, reproducibility, and documentation
    - name: review-mlops
      assignee: mlops-engineer
      description: Assess experiment tracking, model registry, feature store, and serving readiness
    - name: review-architecture
      assignee: senior-software-developer
      description: Review code structure, pipeline design, API surface, and dependency management
    - name: synthesize-report
      assignee: senior-data-scientist
      description: Collect findings, identify cross-domain issues, produce prioritized report
      blocked_by: [review-statistics, review-methodology, review-mlops, review-architecture]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Model Review Before Production
Reviewing an ML model before deploying to production:

```
User: Review our churn prediction model before we deploy — check the statistics, methodology, and production readiness
```

The team validates statistical soundness, experimental rigor, MLOps readiness, and code quality before deployment.

### Scenario 2: Data Science Project Audit
Auditing an existing data science project for quality:

```
User: Audit our recommendation engine project — we need to know if the methodology is sound and the code is maintainable
```

The team provides comprehensive assessment across all four dimensions with prioritized improvement recommendations.

### Scenario 3: Notebook-to-Production Migration
Reviewing a project transitioning from notebooks to production:

```
User: We're moving our fraud detection model from Jupyter notebooks to a production pipeline — review the migration plan
```

The team evaluates the statistical integrity during migration, methodology preservation, MLOps infrastructure, and production architecture.

## Limitations

- Best suited for ML/data science projects; not designed for general software review
- Requires all four agent types to be available as subagents
- Does not execute model training or run experiments — focuses on code and design review
- Deep domain expertise (e.g., NLP-specific or computer vision-specific) depends on model documentation
- Large projects with many models may need scoped reviews per model

## See Also

- [senior-data-scientist](../agents/senior-data-scientist.md) — Lead agent with statistics and ML expertise
- [senior-researcher](../agents/senior-researcher.md) — Research methodology reviewer
- [mlops-engineer](../agents/mlops-engineer.md) — MLOps infrastructure agent
- [senior-software-developer](../agents/senior-software-developer.md) — Architecture review agent
- [review-data-analysis](../skills/review-data-analysis/SKILL.md) — Data analysis review skill
- [track-ml-experiments](../skills/track-ml-experiments/SKILL.md) — Experiment tracking skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
