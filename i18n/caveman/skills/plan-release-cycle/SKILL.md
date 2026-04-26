---
name: plan-release-cycle
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a software release cycle with milestones, feature freezes,
  release candidates, and go/no-go criteria. Covers calendar-based
  and feature-based release strategies. Use when starting planning for a
  major or minor version release, transitioning from ad-hoc to structured
  release cadence, coordinating a release across multiple teams or components,
  defining quality gates for a regulated project, or planning the first
  public release (v1.0.0) of a project.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, release-planning, milestones, release-cycle
---

# Plan Release Cycle

Plan structured software release cycle. Define strategy (calendar-based or feature-based). Set milestones with target dates. Establish feature freeze criteria. Manage release candidates. Define go/no-go checklists. Document rollback plans. Produces `RELEASE-PLAN.md` artifact guiding team from development through release.

## When Use

- Starting planning for major or minor version release
- Transitioning from ad-hoc releases to structured release cadence
- Coordinating release across multiple teams or components
- Defining quality gates and release criteria for regulated project
- Planning first public release (v1.0.0) of a project

## Inputs

- **Required**: Target version number (e.g. v2.0.0)
- **Required**: Desired release date or release window
- **Required**: List of planned features or scope (backlog, roadmap, description)
- **Optional**: Team size and availability
- **Optional**: Release strategy preference (calendar-based or feature-based)
- **Optional**: Regulatory or compliance requirements affecting release
- **Optional**: Previous release velocity or cycle duration data

## Steps

### Step 1: Determine Release Strategy

Pick between two main strategies:

**Calendar-based** (time-boxed):
- Release on fixed schedule (e.g. every 4 weeks, quarterly)
- Features not ready get deferred to next release
- Predictable for users and downstream projects
- Best for: libraries, frameworks, tools with external consumers

**Feature-based** (scope-driven):
- Release when defined set of features complete
- Date adjusts to fit scope
- Risk of scope creep and indefinite delays
- Best for: internal tools, first releases, major rewrites

For most projects, hybrid works well: set target date with defined scope. Allow 1-2 week buffer. Scope not met by buffer deadline? Defer remaining features.

Document strategy choice with reason.

**Got:** Release strategy documented with reason matching project context.

**If fail:** Team can't agree on strategy? Default to calendar-based with feature-priority list. Time-boxing forces prioritization decisions.

### Step 2: Define Milestones

Break release cycle into phases with target dates:

```markdown
## Release Plan: v2.0.0

### Timeline

| Phase | Start | End | Duration | Description |
|---|---|---|---|---|
| Development | 2026-02-17 | 2026-03-14 | 4 weeks | Active feature development |
| Feature Freeze | 2026-03-15 | 2026-03-15 | 1 day | No new features merged after this date |
| Stabilization | 2026-03-15 | 2026-03-21 | 1 week | Bug fixes, documentation, testing only |
| RC1 | 2026-03-22 | 2026-03-22 | 1 day | First release candidate tagged |
| RC Testing | 2026-03-22 | 2026-03-28 | 1 week | Community/team testing of RC |
| RC2 (if needed) | 2026-03-29 | 2026-03-29 | 1 day | Second RC if critical issues found |
| Go/No-Go | 2026-03-31 | 2026-03-31 | 1 day | Final decision meeting |
| Release | 2026-04-01 | 2026-04-01 | 1 day | Tag, publish, announce |
```

Typical phase durations:
- **Development**: 50-70% of total cycle
- **Stabilization**: 15-25% of total cycle
- **RC testing**: 10-20% of total cycle

**Got:** Milestone table with dates, durations, descriptions per phase.

**If fail:** Timeline too compressed (stabilization < 1 week)? Extend release date or reduce scope. NEVER skip stabilization.

### Step 3: Set Feature Freeze Criteria

Define what "feature freeze" means for this release:

```markdown
### Feature Freeze Criteria

After feature freeze (2026-03-15):
- **Allowed**: Bug fixes, test additions, documentation updates, dependency security patches
- **Not allowed**: New features, API changes, refactoring, dependency upgrades (non-security)
- **Exception process**: Feature freeze exceptions require written justification and approval from [release owner]

### Feature Priority List
| Priority | Feature | Status | Owner | Notes |
|---|---|---|---|---|
| P0 (must) | New export format | In progress | [Name] | Blocks release |
| P0 (must) | Security audit fixes | Not started | [Name] | Compliance requirement |
| P1 (should) | Performance optimization | In progress | [Name] | Defer if not ready |
| P2 (nice) | Dark mode support | Not started | [Name] | Defer to v2.1.0 if needed |
```

P0 features block release. P1 features included if ready. P2 features deferred without delay.

**Got:** Feature freeze rules documented with exception process and prioritized feature list.

**If fail:** P0 features at risk of missing freeze date? Escalate immediately. Options: extend development phase, split feature into smaller deliverable, defer to point release (v2.0.1).

### Step 4: Plan Release Candidate Process

Define how release candidates produced and tested:

```markdown
### Release Candidate Process

1. **RC1 Tag**: Tag from the stabilization branch after all P0 features merged and CI green
   ```bash
   git tag -a v2.0.0-rc.1 -m "Release candidate 1 for v2.0.0"
   ```

2. **RC Distribution**: Publish RC to staging/testing channel
   - R: `install.packages("pkg", repos = "https://staging.r-universe.dev/user")`
   - Node.js: `npm install pkg@next`
   - Internal: Deploy to staging environment

3. **RC Testing Period**: 5-7 business days
   - Run full test suite including integration tests
   - Verify all P0 features work as documented
   - Test upgrade path from previous version
   - Check for regressions in existing functionality

4. **RC Evaluation**:
   - **No critical/high bugs**: Proceed to release
   - **Critical bugs found**: Fix, tag RC2, restart testing period
   - **More than 2 RCs needed**: Revisit scope and timeline

5. **RC2+ Tags**: Only if critical issues found in previous RC
   ```bash
   git tag -a v2.0.0-rc.2 -m "Release candidate 2 for v2.0.0"
   ```
```

**Got:** RC process documented with tagging convention, distribution method, testing checklist, escalation criteria.

**If fail:** RC process skipped (pressure to release)? Document the risk. Untested releases have higher rollback probability.

### Step 5: Define Go/No-Go Checklist

Create criteria that must be met before release approval:

```markdown
### Go/No-Go Checklist

#### Must Pass (release blocked if any fail)
- [ ] All CI checks passing on release branch
- [ ] Zero critical bugs open against this version
- [ ] Zero high-severity security vulnerabilities
- [ ] All P0 features verified and documented
- [ ] Changelog complete and reviewed
- [ ] Upgrade path tested from previous version (v1.x -> v2.0.0)
- [ ] License and attribution files up to date

#### Should Pass (release proceeds with documented risk)
- [ ] Zero high bugs open (non-critical)
- [ ] All P1 features included
- [ ] Performance benchmarks within acceptable range
- [ ] Documentation reviewed and spell-checked
- [ ] External dependencies at latest stable versions

#### Decision
- **Go**: All "Must Pass" items checked, majority of "Should Pass" items checked
- **No-Go**: Any "Must Pass" item unchecked
- **Conditional Go**: All "Must Pass" checked, significant "Should Pass" items unchecked — document accepted risks
```

**Got:** Go/no-go checklist with clear pass/fail criteria and decision rules.

**If fail:** Go/no-go meeting results in no-go? Identify blocking items, assign owners, set new target date (usually 1-2 weeks later), update release plan.

### Step 6: Document Rollback Plan

Define how to roll back if release causes critical issues in production:

```markdown
### Rollback Plan

#### Rollback Triggers
- Critical bug affecting >10% of users
- Data corruption or loss
- Security vulnerability introduced by the release
- Breaking change not documented in changelog

#### Rollback Procedure
1. **Revert package registry**: Unpublish or yank the release
   - R/CRAN: Contact CRAN maintainers (cannot self-unpublish)
   - npm: `npm unpublish pkg@2.0.0` (within 72 hours)
   - GitHub: Mark release as pre-release, publish point fix

2. **Communicate**: Notify users via GitHub issue, mailing list, or social channels
   - Template: "v2.0.0 has been rolled back due to [issue]. Please use v1.x.y until a fix is released."

3. **Fix forward**: Prefer a v2.0.1 patch release over a full rollback when possible

4. **Post-mortem**: Conduct a post-mortem within 48 hours of rollback to identify process gaps

#### Point Release Policy
- v2.0.1 for critical bug fixes within 1 week of release
- v2.0.2 for additional fixes within 2 weeks
- Patch releases do not require full RC cycle but must pass CI and critical test suite
```

Write complete release plan to `RELEASE-PLAN.md` or `RELEASE-PLAN-v2.0.0.md`.

**Got:** Rollback plan documented with triggers, procedure, communication template, point release policy. Complete RELEASE-PLAN.md written.

**If fail:** Rollback not feasible (e.g. database migration already applied)? Document forward-fix procedure instead. Every release should have recovery path.

## Checks

- [ ] Release strategy (calendar/feature/hybrid) documented with reason
- [ ] Milestone table includes all phases with dates: development, freeze, stabilization, RC, release
- [ ] Feature freeze criteria defined with allowed/disallowed change types
- [ ] Feature priority list categorized (P0 must / P1 should / P2 nice)
- [ ] RC process documented: tagging convention, distribution, testing period, escalation
- [ ] Go/no-go checklist has clear "must pass" and "should pass" sections
- [ ] Rollback plan includes triggers, procedure, communication template
- [ ] RELEASE-PLAN.md (or equivalent) file created and saved
- [ ] Timeline realistic (stabilization at least 15% of total cycle)

## Pitfalls

- **No stabilization phase**: Going direct from development to release. Even 3-day stabilization catches issues active development masks.
- **Scope creep after freeze**: Allowing "just one more feature" after feature freeze. Every post-freeze addition resets testing and introduces regression risk.
- **Ignore P0 risks**: Not escalating early when P0 feature at risk. Earlier scope adjusted, less disruption to timeline.
- **Skip RC for "small" releases**: Even minor releases benefit from at least one RC. Day of RC testing cheaper than post-release hotfix.
- **No rollback plan**: Assuming release will succeed. Every release plan should answer "what if this goes wrong?" before publishing.
- **Calendar pressure overriding quality**: Releasing on date because promised, despite failing go/no-go criteria. Delayed release is minor inconvenience. Broken release is trust violation.

## See Also

- `apply-semantic-versioning` -- Determine version number for planned release
- `manage-changelog` -- Maintain changelog that feeds into release notes
- `plan-sprint` -- Sprint planning within development phase of release cycle
- `draft-project-charter` -- Project charter may define release roadmap and success criteria
- `generate-status-report` -- Track progress against release milestones
