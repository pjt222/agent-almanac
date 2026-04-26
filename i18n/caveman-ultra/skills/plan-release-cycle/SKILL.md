---
name: plan-release-cycle
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan software release cycle: milestones, feature freezes, RCs, go/no-go.
  Calendar-based + feature-based strategies. Use → start major/minor release
  planning, ad-hoc → structured cadence, multi-team release coord, regulated
  quality gates, first public v1.0.0.
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

Plan structured release cycle: pick strategy (calendar or feature), set milestones, freeze criteria, RCs, go/no-go, rollback. Output: `RELEASE-PLAN.md` artifact guiding team dev → release.

## Use When

- Major/minor release planning starts
- Ad-hoc → structured release cadence
- Multi-team or multi-component release coord
- Quality gates + criteria for regulated project
- First public release (v1.0.0)

## In

- **Required**: Target version (e.g., v2.0.0)
- **Required**: Release date or window
- **Required**: Planned features/scope (backlog, roadmap, desc)
- **Optional**: Team size + availability
- **Optional**: Strategy pref (calendar or feature)
- **Optional**: Regulatory/compliance reqs
- **Optional**: Past release velocity or cycle data

## Do

### Step 1: Determine Strategy

Two primary strategies:

**Calendar-based** (time-boxed):
- Fixed schedule (e.g., 4 wks, quarterly)
- Not-ready features → next release
- Predictable for users + downstream
- Best for: libraries, frameworks, tools w/ external consumers

**Feature-based** (scope-driven):
- Release when defined scope done
- Date adjusts to scope
- Risk: scope creep, indefinite delays
- Best for: internal tools, first releases, major rewrites

Most projects → hybrid: target date + defined scope, 1-2 week buffer. Scope not met by buffer → defer remaining.

Doc strategy choice w/ rationale.

→ Strategy doc'd w/ rationale matching project context.

If err: team can't agree → default calendar-based w/ feature-priority list. Time-box forces prioritization.

### Step 2: Define Milestones

Phases w/ target dates:

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

Typical durations:
- **Development**: 50-70% of cycle
- **Stabilization**: 15-25% of cycle
- **RC testing**: 10-20% of cycle

→ Milestone table: dates, durations, descriptions per phase.

If err: timeline too compressed (stabilization < 1 wk) → extend release date or reduce scope. Never skip stabilization.

### Step 3: Set Feature Freeze Criteria

Define "feature freeze" for this release:

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

P0 → blocks release. P1 → in if ready. P2 → deferred w/o delay.

→ Freeze rules doc'd w/ exception process + prioritized list.

If err: P0 at risk of missing freeze → escalate immediately. Options: extend dev phase, split feature smaller, defer to point release (v2.0.1).

### Step 4: Plan RC Process

How RCs are produced + tested:

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

→ RC process doc'd: tagging convention, distribution, testing checklist, escalation.

If err: RC skipped (release pressure) → doc the risk. Untested releases → higher rollback prob.

### Step 5: Define Go/No-Go Checklist

Criteria before release approval:

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

→ Go/no-go checklist w/ clear pass/fail + decision rules.

If err: meeting → no-go → ID blockers, assign owners, new target (typically 1-2 wks later), update plan.

### Step 6: Document Rollback Plan

Roll back if release causes critical prod issues:

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

Write complete plan → `RELEASE-PLAN.md` or `RELEASE-PLAN-v2.0.0.md`.

→ Rollback plan doc'd: triggers, procedure, comm template, point release policy. Complete RELEASE-PLAN.md written.

If err: rollback not feasible (DB migration applied) → doc forward-fix instead. Every release needs recovery path.

## Check

- [ ] Strategy (calendar/feature/hybrid) doc'd w/ rationale
- [ ] Milestone table all phases: dev, freeze, stabilization, RC, release
- [ ] Freeze criteria w/ allowed/disallowed change types
- [ ] Feature priority list (P0 / P1 / P2)
- [ ] RC process doc'd: tagging, distribution, testing, escalation
- [ ] Go/no-go has "must pass" + "should pass" sections
- [ ] Rollback plan: triggers, procedure, comm template
- [ ] RELEASE-PLAN.md created + saved
- [ ] Timeline realistic (stabilization ≥ 15% of cycle)

## Traps

- **No stabilization phase**: Direct dev → release. Even 3-day stabilization catches issues active dev masks.
- **Scope creep after freeze**: "Just one more feature" → resets testing, regression risk.
- **Ignore P0 risks**: Not escalating early. Earlier scope adjust = less timeline disruption.
- **Skip RC for "small" releases**: Even minor → benefit from 1 RC. Day of RC < post-release hotfix.
- **No rollback plan**: Assume success. Every plan answers "what if this goes wrong?" before publish.
- **Calendar pressure > quality**: Release on promised date despite failing go/no-go. Delayed release = minor inconvenience; broken release = trust violation.

## →

- `apply-semantic-versioning` — determine version for planned release
- `manage-changelog` — maintain changelog feeding release notes
- `plan-sprint` — sprint planning within dev phase
- `draft-project-charter` — may define release roadmap + success criteria
- `generate-status-report` — track progress vs milestones
