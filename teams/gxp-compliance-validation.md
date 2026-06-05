---
name: gxp-compliance-validation
description: End-to-end GxP compliance team covering CSV assessment, audit execution, security review, and research methodology validation
lead: gxp-validator
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [compliance, gxp, validation, audit, security, pharma]
coordination: hub-and-spoke
members:
  - id: gxp-validator
    role: Lead
    responsibilities: Scopes the system under validation, performs CSV assessment, coordinates parallel reviews, synthesizes unified compliance report
  - id: auditor
    role: Audit Specialist
    responsibilities: Executes GxP audit plan, classifies findings, assesses CAPA root causes, evaluates inspection readiness
  - id: security-analyst
    role: Security Reviewer
    responsibilities: Audits data integrity controls, access management, electronic signatures, and 21 CFR Part 11 technical compliance
  - id: senior-researcher
    role: Methodology Reviewer
    responsibilities: Reviews validation protocols, statistical methods, test design rigor, and scientific documentation quality
---

# GxP Compliance Validation Team

A four-agent team that performs end-to-end GxP compliance validation for computerized systems. The lead (gxp-validator) orchestrates parallel reviews across validation, audit, security, and methodology, then synthesizes findings into a unified compliance report.

## Purpose

GxP compliance validation requires expertise across multiple domains that rarely coexist in a single reviewer. This team decomposes the validation lifecycle into four complementary specialties:

- **Validation**: CSV assessment (GAMP 5 category), IQ/OQ/PQ protocols, traceability matrices, change control
- **Audit**: Finding classification (critical/major/minor), CAPA root cause analysis, inspection readiness assessment
- **Security**: Data integrity (ALCOA+), access controls, electronic signatures, audit trail completeness
- **Methodology**: Protocol design rigor, statistical test selection, acceptance criteria validity, documentation quality

By running these reviews in parallel and synthesizing results, the team delivers comprehensive compliance assessment faster than sequential review.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `gxp-validator` | Lead | CSV assessment, IQ/OQ/PQ, change control, final synthesis |
| Audit | `auditor` | Audit Specialist | Finding classification, CAPA, inspection readiness |
| Security | `security-analyst` | Security Reviewer | Data integrity, access controls, Part 11 compliance |
| Methodology | `senior-researcher` | Methodology Reviewer | Protocol rigor, statistics, documentation quality |

## Coordination Pattern

Hub-and-spoke: the gxp-validator lead scopes the system, distributes review tasks, each specialist works independently, and the lead collects and synthesizes all findings into a unified compliance report.

```
          gxp-validator (Lead)
         /       |        \
        /        |         \
   auditor       |    security-analyst
                 |
        senior-researcher
```

**Flow:**

1. Lead performs initial CSV assessment and scopes the system
2. Three specialists work in parallel on their review areas
3. Lead collects all findings and maps them to regulatory requirements
4. Lead produces a unified compliance report with prioritized remediation

## Task Decomposition

### Phase 1: Setup (Lead)
The gxp-validator lead examines the system and creates targeted review tasks:

- Determine GAMP 5 category and applicable regulations (21 CFR Part 11, EU Annex 11)
- Identify system boundaries, data flows, and critical quality attributes
- Create review tasks scoped to each specialist's domain
- Establish the regulatory context and acceptance criteria

### Phase 2: Parallel Review

**auditor** tasks:
- Execute audit plan against system documentation and processes
- Classify findings by severity (critical, major, minor, observation)
- Assess CAPA history and root cause analysis quality
- Evaluate inspection readiness posture

**security-analyst** tasks:
- Audit data integrity controls against ALCOA+ principles
- Review access management and role-based permissions
- Assess electronic signature implementation (Part 11 Subpart C)
- Verify audit trail completeness and tamper-evidence

**senior-researcher** tasks:
- Review validation protocol design and scientific rigor
- Assess statistical methods and sample size justification
- Evaluate acceptance criteria validity and traceability
- Check documentation completeness and cross-referencing

### Phase 3: Synthesis (Lead)
The gxp-validator lead:
- Collects all specialist findings
- Maps findings to specific regulatory requirements
- Resolves overlapping or conflicting observations
- Produces a prioritized compliance report: critical > major > minor > observation
- Recommends remediation timeline and effort

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: gxp-compliance-validation
  lead: gxp-validator
  coordination: hub-and-spoke
  members:
    - agent: gxp-validator
      role: Lead
      subagent_type: gxp-validator
    - agent: auditor
      role: Audit Specialist
      subagent_type: auditor
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
    - agent: senior-researcher
      role: Methodology Reviewer
      subagent_type: senior-researcher
  tasks:
    - name: csv-assessment
      assignee: gxp-validator
      description: Perform CSV assessment, determine GAMP 5 category, scope validation
    - name: audit-execution
      assignee: auditor
      description: Execute audit plan, classify findings, assess CAPA and inspection readiness
    - name: security-review
      assignee: security-analyst
      description: Audit data integrity, access controls, electronic signatures, audit trails
    - name: methodology-review
      assignee: senior-researcher
      description: Review protocol rigor, statistical methods, acceptance criteria, documentation
    - name: synthesize-compliance-report
      assignee: gxp-validator
      description: Collect findings, map to regulations, produce prioritized compliance report
      blocked_by: [csv-assessment, audit-execution, security-review, methodology-review]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: New System Validation
Before deploying a new computerized system in a GxP environment:

```
User: Validate our new LIMS system for GxP compliance — it handles sample tracking and results reporting
```

The team performs full CSV assessment, audits the system against applicable regulations, reviews security controls, and validates the test methodology.

### Scenario 2: Periodic Compliance Review
For scheduled revalidation of existing validated systems:

```
User: Conduct annual compliance review of our clinical data management system
```

The team reviews changes since last validation, audits current compliance state, and identifies drift from validated state.

### Scenario 3: Pre-Inspection Readiness
Preparing for a regulatory inspection (FDA, EMA, MHRA):

```
User: Assess our inspection readiness for the upcoming FDA audit of our manufacturing execution system
```

The team performs a mock inspection across all four domains and identifies gaps that need remediation before the actual inspection.

## Limitations

- Best suited for computerized systems in pharma/biotech/medical device contexts
- Requires all four agent types to be available as subagents
- Does not replace formal regulatory consultation or qualified person sign-off
- Findings are based on documentation and code review, not live system testing
- Complex multi-system validation landscapes may need multiple team passes

## See Also

- [gxp-validator](../agents/gxp-validator.md) — Lead agent with CSV and compliance expertise
- [auditor](../agents/auditor.md) — GxP audit specialist agent
- [security-analyst](../agents/security-analyst.md) — Security review agent
- [senior-researcher](../agents/senior-researcher.md) — Research methodology reviewer
- [perform-csv-assessment](../skills/perform-csv-assessment/SKILL.md) — CSV assessment skill
- [conduct-gxp-audit](../skills/conduct-gxp-audit/SKILL.md) — GxP audit skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
