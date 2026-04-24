---
name: evaluate-agent-framework
locale: caveman-ultra
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

Score OSS agent framework → invest? Steps 2-3 novel: survival rate + supersession. Tier → INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID. Calibrate effort pre-commit.

## Use When

- Adopt framework prod? → check
- Dep risk on framework → assess
- Send eng effort to ext proj? → decide
- Build-vs-adopt cmp → rank
- Post-release / post-gov-change / post-acq re-eval

## In

- **Req**: `framework_url` — GitHub repo URL
- **Opt**:
  - `comparison_frameworks` — alt framework URLs, bench
  - `use_case` — intended use (e.g., "multi-agent orchestration", "tool-use pipelines") → arch fit
  - `contribution_budget` — planned eng hrs → tier calib

## Do

### Step 1: Census

Size, activity, landscape → before deeper probe.

1. Read `README.md`, `CONTRIBUTING.md`, `LICENSE`, arch docs (`docs/`, `ARCHITECTURE.md`)
2. Quant metrics:
   - Stars/forks/issues/PRs → `gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - Dependents → GitHub "Used by" or `gh api repos/<owner>/<repo>/dependents`
   - Release cadence → `gh release list --limit 10` — freq + semver?
3. Bus factor → top 5 contribs last 12mo by commit. Top >60% → crit low
4. Landscape:
   - **Pioneer**: first mover → defines cat (high infl, high supersession risk to followers)
   - **Fast-follower**: <6mo post-pioneer → iterate
   - **Late entrant**: post-stabilization → cmp on feat/gov
5. `comparison_frameworks` given → same metrics each alt

→ Census tbl: stars, forks, deps, cadence, bus factor, landscape (+cmps).

If err: private/rate-limited → manual README. No metrics (self-hosted GitLab) → note gap, qual only.

### Step 2: Community Health

Welcome/support/retain externals?

1. **External survival rate**:
   - Last 50 closed PRs → `gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - Author internal (org) vs external
   - `survival_rate = merged_external_PRs / total_external_PRs`
   - Healthy >50%; concern <30%
2. Responsiveness:
   - **Issue first-response**: median issue-open → first maintainer comment
   - **PR merge latency**: median ext PR open → merge
   - Healthy <7d resp, <30d merge; concern >30d resp
3. Contributor diversity:
   - Ext/int ratio last 6mo
   - Unique externals w/ >=2 merged PRs (repeat → healthy eco)
4. Gov artifacts:
   - `CONTRIBUTING.md` exists + actionable (not just "submit a PR")
   - `CODE_OF_CONDUCT.md` exists
   - Gov docs → decision process
   - Issue/PR templates guide contribs

→ Scorecard: survival, resp times, diversity, gov checklist.

If err: PR data thin (<20 closed) → note sample, weight others. Non-GitHub → adapt queries to platform API.

### Step 3: Supersession Risk

Ext contribs → obsoleted by internal dev? Biggest risk.

1. Sample last 50-100 merged ext PRs (or all if fewer)
2. Each merged ext PR, later:
   - **Reverted**: explicit revert ref PR
   - **Rewritten**: same file/module changed <90d by internal
   - **Obsoleted**: feat removed/replaced next release
3. `supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. Roadmap vs ext-active areas:
   - High overlap → high supersession (int builds over ext)
   - Low overlap → lower risk (ext fill gaps int won't)
5. "Contrib traps": look friendly, scheduled for int rewrite
6. Bench: NemoClaw → 71% ext PRs superseded <6mo. Calib pt.

→ Supersession % + breakdown (reverted/rewritten/obsoleted). Roadmap overlap.

If err: shallow/squash-merged (attrib lost) → est by ext PR paths vs files changed next releases. Lower confidence.

### Step 4: Architecture Alignment

Arch supports use case w/o lock-in?

1. Extension pts:
   - Plugin API → documented?
   - Config surface → customize no-fork?
   - Hook/callback → intercept behavior?
2. Lock-in:
   - **Rewrite cost**: migrate-away est (d/wk/mo)
   - **Data portability**: export std fmt?
   - **Std compliance**: agentskills.io, MCP, A2A vs proprietary?
3. API stability:
   - Breaking changes/major (CHANGELOG, migration guides)
   - Deprecation policy (advance warn)
   - Semver compliance (breaking → major only)
4. Use case fit:
   - `use_case` given → arch natural fit?
   - Arch mismatches → workarounds req?
5. Interop:
   - agentskills.io compat (skill model)
   - MCP (tool integration)
   - A2A (agent-to-agent)

→ Arch report: ext pts, lock-in (low/med/high), API stability, use-case fit.

If err: sparse docs → derive from code + public API. Too young for stability hist → note, weight gov more.

### Step 5: Governance + Sustainability

Gov model → long-term viable? Fair to externals?

1. Gov model:
   - **BDFL**: single decider → fast, bus factor risk
   - **Committee/Core team**: distributed → slower, resilient
   - **Foundation-backed**: Apache, Linux Foundation, CNCF → most sustainable
   - **Corporate-controlled**: one co → rug-pull risk
2. Funding:
   - VC, corp, grants, community, unfunded
   - Full-time maintainers >=2 healthy; 0 red flag
   - Revenue → how sustain?
3. Contributor protections:
   - License: permissive (MIT, Apache-2.0) vs copyleft (GPL) vs custom
   - CLA → rights transfer that disadvantage?
   - Recog → credited in releases/changelogs/docs?
4. Security:
   - `SECURITY.md` or equiv
   - Median CVE → patch time
   - Dep update (Dependabot, Renovate, manual)
5. Trajectory:
   - Gov evolving (→ foundation)?
   - Recent leadership/acq/relicense?
   - Public maintainer-contributor conflicts?

→ Gov assess: model, sustainability (sustainable/at-risk/critical), protections, security.

If err: gov undocumented → absence = yellow flag. Check implicit: who merges, who closes, who releases.

### Step 6: Classify

Synth → 4-tier + justifications + recs.

1. Score each (1-5):
   - **Community health**: survival, resp, diversity
   - **Supersession risk**: rate, roadmap, traps (invert: low better)
   - **Arch alignment**: ext pts, lock-in, stability, fit
   - **Gov sustainability**: model, funding, protections, sec
2. Thresholds:
   - **INVEST** (all >=4): healthy, low supersession (<20%), aligned, sustainable gov → safe adopt + contrib
   - **EVALUATE-FURTHER** (mixed, none <2): mixed signals → specific follow-ups, re-eval date
   - **CONTRIBUTE-CAUTIOUSLY** (any 2, none <2): high supersession (>40%) or gov concerns → limit to requested work, maintainer-approved scope, plugin/ext decoupled from core
   - **AVOID** (any 1): crit red flags — abandoned, hostile (<15% survival), bad license, rug-pull → no eng effort
3. Write report:
   - Tier + 1-sentence rationale up front
   - Each dim score + evidence
   - `contribution_budget` given → how alloc hrs per tier
   - EVALUATE-FURTHER → specific Qs + timeline
   - CONTRIBUTE-CAUTIOUSLY → safe (plugins, docs, tests) vs risky (core)
4. `comparison_frameworks` evaluated → cmp matrix, rank all

→ Classification report: tier, scores, evidence, actionable recs.

If err: data gaps block confident call → default EVALUATE-FURTHER, doc missing data + how to get. Never default INVEST when unsure.

## Chk

- [ ] Census: stars, forks, deps, cadence, bus factor, landscape
- [ ] Community: survival, resp times, diversity, gov artifacts
- [ ] Supersession: rate + breakdown (reverted/rewritten/obsoleted)
- [ ] Arch: ext pts, lock-in, API stability, fit
- [ ] Gov: model, funding, protections, security
- [ ] Tier: INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID
- [ ] Each score → specific evidence
- [ ] Recs actionable + calib to budget (if given)
- [ ] Data gaps + confidence limits doc'd

## Traps

- **Popularity ≠ health**: 50k stars + 1 maintainer < 2k stars + 15 active contribs. SPoF.
- **Skip supersession**: most common ext-contrib failure. Welcoming community worthless if int overwrites ext.
- **Arch-only, ignore gov**: pretty design fails w/ unsustainable or hostile gov.
- **EVALUATE-FURTHER ≠ AVOID**: mixed = investigate, not reject. Set re-eval date + specific Qs.
- **Snapshot bias**: metrics point-in-time. Declining proj w/ great current > improving proj w/ mediocre. Check 6-12mo trend.
- **CLA complacency**: some CLAs transfer copyright → your work = their asset. Read text, not checkbox.
- **Single-framework anchor**: no cmp → anything looks great/terrible. Bench at least 1 alt, even informal.

## See

- [polish-claw-project](../polish-claw-project/SKILL.md) — contrib workflow this informs
- [review-software-architecture](../review-software-architecture/SKILL.md) — Step 4 arch eval
- [forage-solutions](../forage-solutions/SKILL.md) — alt framework discovery for cmp
- [search-prior-art](../search-prior-art/SKILL.md) — landscape + prior work
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — Step 5 sec posture
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — license + IP risk
