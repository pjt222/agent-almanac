---
name: evaluate-agent-framework
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Assess an open-source agent framework for investment readiness by evaluating
  community health, supersession risk, architecture alignment, and governance
  sustainability. Produces a four-tier classification (INVEST / EVALUATE-FURTHER /
  CONTRIBUTE-CAUTIOUSLY / AVOID) to guide resource allocation decisions before
  committing engineering effort.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, framework-evaluation, risk-assessment, community-health, supersession, investment
---

# Evaluate Agent Framework

Structured check of open-source agent framework invest-readiness. New value sits in Steps 2-3: count community health by contribution survival rate; measure supersession risk — biggest reason external engineering effort wastes. Final tier (INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID) sets resource spend before commit dev cycles.

## When Use

- Picking whether to adopt agent framework for prod
- Measuring dep risk on framework project leans on
- Deciding whether to give engineering effort to external project
- Compare competing frameworks for build-vs-adopt pick
- Re-check framework after big release, governance shift, or buyout

## Inputs

- **Required**: `framework_url` — GitHub URL of framework repo
- **Optional**:
  - `comparison_frameworks` — list of other framework URLs to benchmark
  - `use_case` — planned use case for arch alignment check (e.g., "multi-agent orchestration", "tool-use pipelines")
  - `contribution_budget` — planned engineering hours, for tier calibration

## Steps

### Step 1: Gather Framework Census

Grab base data on project size, activity, landscape place before deep dig.

1. Fetch and read `README.md`, `CONTRIBUTING.md`, `LICENSE`, and any arch docs (`docs/`, `ARCHITECTURE.md`)
2. Grab counts:
   - Stars, forks, open issues, open PRs: `gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - Dependent repos: check GitHub's "Used by" count or `gh api repos/<owner>/<repo>/dependents`
   - Release cadence: `gh release list --limit 10` — note how often and if releases follow semver
3. Count bus factor: find top 5 contributors by commit count over last 12 months. Top contributor do >60% of commits? Bus factor critically low
4. Map landscape place:
   - **Pioneer**: first mover, defines category (high sway, high supersession risk to followers)
   - **Fast-follower**: launched within 6 months of pioneer, iterating on concept
   - **Late entrant**: arrived after category stable, competing on features or governance
5. If `comparison_frameworks` given, grab same counts for each

**Got:** Census table with stars, forks, dependents, release cadence, bus factor, landscape place for target (and compares if given).

**If fail:** Repo private or API-rate-limited? Fall back to manual README read. Counts not there (e.g., self-hosted GitLab)? Note gap and go with qualitative check.

### Step 2: Assess Community Health

Count whether project welcomes, supports, keeps external contributors.

1. Count **external contribution survival rate**:
   - Pull last 50 closed PRs: `gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - Sort each PR author as internal (org member) or external
   - Compute: `survival_rate = merged_external_PRs / total_external_PRs`
   - Healthy threshold: >50% survival rate; concerning: <30%
2. Measure response:
   - **Issue first-response time**: median from issue open to first maintainer comment
   - **PR merge lag**: median from PR open to merge for external PRs
   - Healthy: <7 days first-response, <30 days merge; concerning: >30 days first-response
3. Check contributor spread:
   - External/internal contributor ratio over last 6 months
   - Count unique external contributors with >=2 merged PRs (repeat contributors signal healthy ecosystem)
4. Check governance artifacts:
   - `CONTRIBUTING.md` exists and is actionable (not just "submit a PR")
   - `CODE_OF_CONDUCT.md` exists
   - Governance docs describe decision process
   - Issue/PR templates guide contributors

**Got:** Community health scorecard with survival rate, response times, spread ratio, governance artifact checklist.

**If fail:** PR data thin (new project with <20 closed PRs)? Note sample-size limit and weight other signals more. Project uses non-GitHub platform? Adapt queries to that platform API.

### Step 3: Calculate Supersession Risk

Figure how likely external contributions get wiped by internal dev — single biggest risk for framework adopters and contributors.

1. Sample last 50-100 merged external PRs (or all if fewer)
2. For each merged external PR, check if contributed code was later:
   - **Reverted**: explicit revert commit ref-ing PR
   - **Rewritten**: same file/module big change within 90 days by internal contributor
   - **Obsoleted**: feature removed or replaced in later release
3. Count: `supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. Map published roadmap (if out) against areas where external contributors active:
   - High overlap = high supersession risk (internals will build over external work)
   - Low overlap = lower supersession risk (externals fill gaps internals won't)
5. Check for "contribution traps": areas look contribution-friendly but scheduled for internal rewrite
6. Benchmark: NemoClaw study showed 71% external PRs superseded within 6 months — use as calibration point

**Got:** Supersession rate as percent, with breakdown by type (reverted/rewritten/obsoleted). Roadmap overlap check.

**If fail:** Commit history shallow or squash-merged (losing author info)? Estimate supersession by compare external PR file paths vs files changed in later releases. Note lower confidence.

### Step 4: Evaluate Architecture Alignment

Check whether framework arch supports your use case with no heavy lock-in.

1. Map extension points:
   - Plugin/extension API: does framework expose documented plugin interface?
   - Config surface: can behavior be tuned without fork?
   - Hook/callback system: can intercept and change framework behavior at key points?
2. Check lock-in risk:
   - **Rewrite cost**: estimate engineering effort to move away (days/weeks/months)
   - **Data portability**: can data/state export in standard formats?
   - **Standard compliance**: does framework use open standards (agentskills.io, MCP, A2A) or custom protocols?
3. Check API stability:
   - Count breaking changes per major release (CHANGELOG, migration guides)
   - Check deprecation policy (heads-up before removal)
   - Check semver (breaking changes only in major versions)
4. Check fit with your specific use case:
   - If `use_case` given, check whether framework arch naturally supports it
   - Spot any arch mismatch that would need workarounds
5. Check interop:
   - agentskills.io compat (skill model fit)
   - MCP support (tool integration)
   - A2A protocol support (agent-to-agent talk)

**Got:** Architecture fit report with extension point list, lock-in risk rate (low/medium/high), API stability score, use-case fit check.

**If fail:** Arch docs thin? Derive check from code shape and public API surface. Framework too young for stability history? Note this and weight governance signals more.

### Step 5: Assess Governance and Sustainability

Check whether project governance model supports long-term life and fair treat of external contributors.

1. Sort governance model:
   - **BDFL** (Benevolent Dictator for Life): one decider — fast calls, bus factor risk
   - **Committee/Core team**: spread decision — slower but tougher
   - **Foundation-backed**: formal governance (Apache, Linux Foundation, CNCF) — most durable
   - **Corporate-controlled**: one company drives dev — watch for rug-pull risk
2. Check funding and sustainability:
   - Funding sources: VC-backed, corporate-sponsored, grants, community-funded, unfunded
   - Full-time maintainer count: >=2 is healthy; 0 is red flag
   - Revenue model (if any): how does project keep going?
3. Check contributor protections:
   - License type: permissive (MIT, Apache-2.0) vs copyleft (GPL) vs custom
   - CLA rules: does signing CLA shift rights in way that hurt contributors?
   - Contributor credit: external contributors credited in releases, changelogs, docs?
4. Check security stance:
   - Security disclosure policy (`SECURITY.md` or same)
   - Median time from CVE disclose to patch release
   - Dep update patterns (Dependabot, Renovate, manual)
5. Check trajectory:
   - Governance model shifting (e.g., moving toward foundation)?
   - Recent leadership change, buyout, or relicense?
   - Public conflicts between maintainers and contributors?

**Got:** Governance check with model class, durability rate (durable/at-risk/critical), contributor protection check, security stance summary.

**If fail:** Governance info not logged? Take the absence itself as yellow flag. Check for hidden governance by who merges PRs, who closes issues, who makes release picks.

### Step 6: Classify Investment Readiness

Fold all finds into four-tier sort with specific reasons and actionable advice.

1. Score each dimension (1-5 scale):
   - **Community health**: survival rate, response, spread
   - **Supersession risk**: rate, roadmap overlap, contribution traps (invert: lower is better)
   - **Architecture fit**: extension points, lock-in, stability, use-case fit
   - **Governance durability**: model, funding, protections, security
2. Apply tier thresholds:
   - **INVEST** (all dimensions >=4): Healthy community, low supersession (<20%), fit arch, durable governance. Safe to adopt and give engineering effort.
   - **EVALUATE-FURTHER** (mixed, no dimension <2): Mixed signals need specific follow-ups. Log what needs clarify and set re-eval date.
   - **CONTRIBUTE-CAUTIOUSLY** (any dimension 2, none <2): High supersession (>40%) or governance worries. Limit contributions to explicit-requested work, maintainer-approved scope, or plugin/extension dev decoupled from core.
   - **AVOID** (any dimension 1): Critical red flags — abandoned project, hostile to externals (survival rate <15%), incompatible license, or soon rug-pull signs. Do not give engineering effort.
3. Write tier report:
   - Lead with tier and one-line reason
   - Sum each dimension score with key evidence
   - If `contribution_budget` given, advise how to split those hours given tier
   - For EVALUATE-FURTHER, list specific questions that need answers and set timeline
   - For CONTRIBUTE-CAUTIOUSLY, say which contribution types safe (plugins, docs, tests) vs risky (core features)
4. If `comparison_frameworks` checked, make compare matrix ranking all frameworks

**Got:** Tier report with label, dimension scores, evidence sum, actionable advice tuned to invest context.

**If fail:** Data gaps block confident sort? Default to EVALUATE-FURTHER with clear log of what data missing and how to get it. Never default to INVEST when unsure.

## Validation

- [ ] Census data grabbed: stars, forks, dependents, release cadence, bus factor, landscape place
- [ ] Community health counted: survival rate, response times, contributor spread, governance artifacts
- [ ] Supersession risk counted with breakdown by type (reverted/rewritten/obsoleted)
- [ ] Architecture fit checked: extension points, lock-in risk, API stability, use-case fit
- [ ] Governance checked: model, funding, contributor protections, security stance
- [ ] Tier made: one of INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID
- [ ] Each dimension score backed with specific evidence from analysis
- [ ] Advice actionable and tuned to contribution budget (if given)
- [ ] Data gaps and confidence limits clearly logged

## Pitfalls

- **Mix popularity with health**: High stars but low contributor spread mean single fail point. 50k-star project with one maintainer is less healthy than 2k-star project with 15 active contributors.
- **Ignore supersession risk**: Most common reason external contributions fail. Welcoming community means nothing if internal dev keep overwriting external work.
- **Over-weight arch, skip governance**: Pretty-designed framework can still fail if governance model is not durable or hostile to externals.
- **Treat EVALUATE-FURTHER as AVOID**: Mixed signals need dig, not reject. Set concrete re-eval date and list specific questions to answer.
- **Snapshot bias**: All counts are point-in-time. Declining project with great current counts is worse than improving project with meh current counts. Always check trend over 6-12 months.
- **CLA complacency**: Some CLAs shift copyright to project owner, meaning your contributions become their property. Read CLA text, not just checkbox.
- **Anchor on single framework**: With no compare frameworks, any project looks either great or awful. Always benchmark vs at least one alternative, even informal.

## See Also

- [polish-claw-project](../polish-claw-project/SKILL.md) — contribution flow this check feeds
- [review-software-architecture](../review-software-architecture/SKILL.md) — used in Step 4 for arch check
- [forage-solutions](../forage-solutions/SKILL.md) — other framework find for compare
- [search-prior-art](../search-prior-art/SKILL.md) — landscape map and prior work check
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — security stance check from Step 5
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — license and IP risk check
