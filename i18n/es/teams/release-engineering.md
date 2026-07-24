---
name: release-engineering
description: Sequential release-train team that carries a change from version planning through the prepublish test gate, CI/CD build, GitHub release, and final review signoff
lead: version-manager
version: "1.0.0"
author: Philipp Thoss
created: 2026-07-24
updated: 2026-07-24
tags: [release, versioning, ci-cd, changelog, cli, review]
coordination: sequential
members:
  - id: version-manager
    role: Lead / Release Coordinator
    responsibilities: Plans the release cycle, audits dependency versions, determines the SemVer bump, updates the changelog, and gates progression between stages
  - id: cli-developer
    role: Prepublish Test Gate
    responsibilities: Runs the CLI integration test suite as the prepublish gate that must pass before any build or publish step
  - id: devops-engineer
    role: Build & Publish Engineer
    responsibilities: Builds and validates the CI/CD pipeline, then tags and publishes the GitHub release with notes and artifacts
  - id: code-reviewer
    role: Release Reviewer
    responsibilities: Reviews the full release diff (version bump, changelog, pipeline changes) and provides the final signoff before merge
locale: es
source_locale: en
source_commit: 7de503a4
translator: "Claude + human review"
translation_date: "2026-07-24"
---

# Release Engineering Team

A four-agent team that ships a software release as a staged gate pipeline. Each stage hands off to the next only when its own exit criteria pass, and any failure returns to the owning stage for rework before the pipeline can advance. The version-manager leads: it owns the planning and versioning stages and enforces the go/no-go gate at every handoff.

## Purpose

Shipping a release is not a single action — it is a sequence of role-specific gates with hard handoffs. The version-manager agent itself makes this structural: its Limitations state that it "plans and documents releases but does not trigger CI/CD pipelines or publish to registries." That boundary is exactly why a team is needed. Planning, testing, building/publishing, and reviewing are distinct responsibilities that must occur in order, each blocking the next.

This team generalizes the existing R-specific single-agent `release-package-version` procedure into a language-agnostic, multi-role release train:

- **Plan & Version** (version-manager): plan the release cycle, audit dependency staleness and vulnerabilities, classify changes, determine the correct SemVer bump, and update the changelog.
- **Prepublish Test Gate** (cli-developer): run the CLI integration suite via subprocess execution; a red suite blocks the release.
- **Build & Publish** (devops-engineer): build/validate the CI/CD pipeline, then create the tagged GitHub release with notes and artifacts.
- **Review Signoff** (code-reviewer): review the release diff end to end and give the final approval.

Running these as an explicit sequence — rather than folding them into one agent — keeps each gate auditable and makes a failed gate an isolated, recoverable event rather than a whole-release restart.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `version-manager` | Release Coordinator | Release-cycle planning, dependency audit, SemVer bump, changelog, gate enforcement |
| Test Gate | `cli-developer` | Prepublish Test Gate | CLI integration tests (`node:test` via `execSync`) as the prepublish gate |
| Build/Publish | `devops-engineer` | Build & Publish Engineer | CI/CD pipeline, GitHub release tagging and publication |
| Reviewer | `code-reviewer` | Release Reviewer | End-to-end review of the release diff, final signoff |

## Coordination Pattern

Sequential gate pipeline: stages execute in a fixed order, and each stage is a gate that must pass before the next begins. The version-manager lead owns the first two stages and holds the go/no-go decision at every boundary. On a gate failure, control returns to the stage that owns the failing criterion; the pipeline resumes forward only once that stage passes again.

```text
version-manager ──▶ version-manager ──▶ cli-developer ──▶ devops-engineer ──▶ code-reviewer
  (plan +            (bump +              (prepublish       (CI/CD build +       (review diff +
   dep audit)         changelog)           test gate)        GitHub release)      signoff)
      ▲                   ▲                    │                   │                  │
      └───────────────────┴────────────────────┴───────────────────┴──────────────────┘
                        any gate failure returns to the owning stage
```

**Flow:**

1. Stage 1 and 2 are led by version-manager (planning, then versioning) — the pipeline cannot start building against an un-audited or mis-versioned base.
2. Stage 3 (cli-developer) is the prepublish gate — nothing is built or published until the test suite is green.
3. Stage 4 (devops-engineer) builds the pipeline and only then publishes the release.
4. Stage 5 (code-reviewer) signs off on the assembled diff.
5. Any red gate returns to its owning stage; the lead re-issues the handoff once the criterion clears.

## Task Decomposition

### Stage 1: Plan & Audit (version-manager, Lead)
- `plan-release-cycle` — set the release strategy (calendar- or feature-based), milestones, feature freeze, RC process, and the go/no-go checklist.
- `audit-dependency-versions` — inventory pinned dependencies, classify staleness (current / minor-behind / major-behind / EOL), and surface known vulnerabilities, security fixes first.
- **Gate:** no unresolved critical vulnerability and a defined release scope before proceeding.

### Stage 2: Version & Changelog (version-manager, Lead)
- `apply-semantic-versioning` — analyze changes since the last tag, classify them, and determine the correct major/minor/patch bump per SemVer 2.0.0; update the version file (DESCRIPTION / package.json / Cargo.toml / pyproject.toml).
- `manage-changelog` — move Unreleased entries into a dated release section using Keep a Changelog categories (Added, Changed, Deprecated, Removed, Fixed, Security).
- **Gate:** changelog written *before* the version is finalized; version file and changelog agree on the target version.

### Stage 3: Prepublish Test Gate (cli-developer)
- `test-cli-application` — run the CLI integration tests via subprocess (`execSync('node cli/index.js ...')`) so argument parsing and real binary behavior are exercised, not just imported functions.
- **Gate (hard):** the suite must be fully green. A failure returns to the owning implementation stage; the pipeline does not advance to build or publish while red. This mirrors the prepublish test gate that release tooling runs before an artifact is produced.

### Stage 4: Build & Publish (devops-engineer)
- `build-ci-cd-pipeline` — build/validate the GitHub Actions multi-stage pipeline (matrix builds, caching, secrets) that produces the release artifacts.
- `create-github-release` — tag and publish the GitHub release with notes, semantic-version tag, and build artifacts via the `gh` CLI — the publication step that follows the pipeline. (This skill is assigned to devops-engineer, which lists it under its Release skills.)
- **Gate:** pipeline green and artifacts produced before the release is published; the tag matches the Stage 2 version.

### Stage 5: Review Signoff (code-reviewer)
- `review-pull-request` — review the assembled release diff end to end (version bump, changelog, pipeline/config changes) with severity-leveled feedback and a final approve/request-changes verdict.
- **Gate:** blocking findings return to the owning stage; the release merges only on approval.

## Configuration

Machine-readable configuration block Claude reads when activating this team. In ordinary interactive sessions, activation spawns each listed member as a subagent via the Agent tool (`subagent_type`), coordinated with SendMessage under the session's single implicit team. (`TeamCreate` is a gated FleetView/cloud-only fallback.)

<!-- CONFIG:START -->
```yaml
team:
  name: release-engineering
  lead: version-manager
  coordination: sequential
  members:
    - agent: version-manager
      role: Lead / Release Coordinator
      subagent_type: version-manager
    - agent: cli-developer
      role: Prepublish Test Gate
      subagent_type: cli-developer
    - agent: devops-engineer
      role: Build & Publish Engineer
      subagent_type: devops-engineer
    - agent: code-reviewer
      role: Release Reviewer
      subagent_type: code-reviewer
  tasks:
    - name: plan-and-audit
      assignee: version-manager
      description: Plan the release cycle and audit dependency versions for staleness and vulnerabilities
    - name: version-and-changelog
      assignee: version-manager
      description: Determine the SemVer bump and update the changelog before finalizing the version
      blocked_by: [plan-and-audit]
    - name: prepublish-test-gate
      assignee: cli-developer
      description: Run the CLI integration test suite as the hard prepublish gate
      blocked_by: [version-and-changelog]
    - name: build-pipeline
      assignee: devops-engineer
      description: Build and validate the CI/CD pipeline that produces release artifacts
      blocked_by: [prepublish-test-gate]
    - name: publish-release
      assignee: devops-engineer
      description: Tag and publish the GitHub release with notes and artifacts via the gh CLI
      blocked_by: [build-pipeline]
    - name: review-signoff
      assignee: code-reviewer
      description: Review the full release diff and provide the final approval before merge
      blocked_by: [publish-release]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Cut a Minor Release
Ship a release that adds a feature and fixes bugs since the last tag.

```text
User: We've added an export format and fixed two bugs since v1.3.0. Cut the release.
```

The lead audits dependencies, classifies the changes as a minor bump to v1.4.0, updates the changelog, and hands off. The cli-developer runs the prepublish test gate; on green, the devops-engineer builds the pipeline and publishes the v1.4.0 GitHub release; the code-reviewer signs off on the diff.

### Scenario 2: Release Candidate Cycle
Run a structured RC process toward a major release.

```text
User: We want to release v2.0.0 in six weeks with an RC process.
```

The lead plans the cycle (development → feature freeze → RC1/RC2 → final), and the pipeline runs once per candidate: each RC passes the test gate, is built and published as a pre-release tag (`-rc.1`), and reviewed before the next candidate — with any failed gate returning to its owning stage.

### Scenario 3: Blocked Release (Gate Failure)
Demonstrates the return-to-owner recovery path.

```text
User: Release v0.9.1 — it's just a patch.
```

If the prepublish test gate fails, the pipeline halts at Stage 3 and returns to the implementation/versioning owner; nothing is built or published until the suite is green again. Only then does the release advance to build, publish, and signoff.

## Limitations

- **Not a process framework.** This team runs a release train, not sprint planning or backlog ceremony — for iterative delivery process use `scrum-team` instead.
- **Not infrastructure provisioning.** It publishes releases; it does not stand up clusters, meshes, or observability stacks — that is `devops-platform-engineering`. The devops-engineer here is scoped to the pipeline and the GitHub release.
- **CLI-oriented test gate.** The prepublish gate uses the cli-developer's `node:test`/`execSync` integration testing; projects whose test gate is non-CLI (e.g., pure library unit suites) should substitute the appropriate testing agent while keeping the same gate position.
- **Node/JS release tooling bias.** `create-github-release` and the CI/CD pipeline assume GitHub + `gh` CLI. For R-package registry submission (CRAN), pair with the r-developer `release-package-version` / `submit-to-cran` path.
- **Requires all four agents available as subagents**, and the sequential shape means a stalled early stage blocks the whole pipeline — a single-agent `release-package-version` run is more appropriate for a small, low-risk R-only patch.

## See Also

- [version-manager](../agents/version-manager.md) — Lead; SemVer, changelog, release-cycle planning, dependency audit
- [cli-developer](../agents/cli-developer.md) — Prepublish test gate via CLI integration testing
- [devops-engineer](../agents/devops-engineer.md) — CI/CD pipeline and GitHub release publication
- [code-reviewer](../agents/code-reviewer.md) — Final release-diff review and signoff
- [release-package-version](../skills/release-package-version/SKILL.md) — The existing R-specific single-agent release procedure (used by [r-developer](../agents/r-developer.md)) that this team generalizes into a multi-role train
- [scrum-team](scrum-team.md) — Iterative delivery *process* framework (distinct from this release train)
- [devops-platform-engineering](devops-platform-engineering.md) — Infrastructure/platform engineering (distinct from release publication)
- [plan-release-cycle](../skills/plan-release-cycle/SKILL.md) · [apply-semantic-versioning](../skills/apply-semantic-versioning/SKILL.md) · [manage-changelog](../skills/manage-changelog/SKILL.md) · [test-cli-application](../skills/test-cli-application/SKILL.md) · [build-ci-cd-pipeline](../skills/build-ci-cd-pipeline/SKILL.md) · [create-github-release](../skills/create-github-release/SKILL.md) · [review-pull-request](../skills/review-pull-request/SKILL.md)

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-07-24
