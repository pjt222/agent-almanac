---
name: evaluate-agent-framework
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Structured assessment of an open-source agent framework's investment readiness. The novel value is in Steps 2-3: quantifying community health through contribution survival rates and measuring supersession risk — the most common reason external engineering effort is wasted. The final classification (INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID) calibrates resource allocation before committing development cycles.

## When to Use

- Evaluating whether to adopt an agent framework for production use
- Assessing dependency risk on a framework your project relies on
- Deciding whether to contribute engineering effort to an external project
- Comparing competing frameworks for a build-vs-adopt decision
- Re-evaluating a framework after a major release, governance change, or acquisition

## Inputs

- **Required**: `framework_url` — GitHub URL of the framework repository
- **Optional**:
  - `comparison_frameworks` — list of alternative framework URLs to benchmark against
  - `use_case` — intended use case for architecture alignment assessment (e.g., "multi-agent orchestration", "tool-use pipelines")
  - `contribution_budget` — planned engineering hours, for calibrating the investment tier

## Procedure

### Step 1: Gather Framework Census

Collect foundational data about the project's size, activity, and landscape position before deeper analysis.

1. Fetch and read `README.md`, `CONTRIBUTING.md`, `LICENSE`, and any architecture docs (`docs/`, `ARCHITECTURE.md`)
2. Collect quantitative metrics:
   - Stars, forks, open issues, open PRs: `gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - Dependent repositories: check GitHub's "Used by" count or `gh api repos/<owner>/<repo>/dependents`
   - Release cadence: `gh release list --limit 10` — note frequency and whether releases follow semver
3. Calculate bus factor: identify top 5 contributors by commit count over the last 12 months. If the top contributor accounts for >60% of commits, bus factor is critically low
4. Map landscape position:
   - **Pioneer**: first mover, defines the category (high influence, high supersession risk to followers)
   - **Fast-follower**: launched within 6 months of pioneer, iterating on the concept
   - **Late entrant**: arrived after the category stabilized, competing on features or governance
5. If `comparison_frameworks` is provided, gather the same metrics for each alternative

**Expected:** Census table with stars, forks, dependents, release cadence, bus factor, and landscape position for the target (and comparisons if provided).

**On failure:** If the repository is private or API-rate-limited, fall back to manual README analysis. If metrics are unavailable (e.g., self-hosted GitLab), note the gap and proceed with qualitative assessment.

### Step 2: Assess Community Health

Quantify whether the project welcomes, supports, and retains external contributors.

1. Calculate the **external contribution survival rate**:
   - Pull the last 50 closed PRs: `gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - Classify each PR author as internal (org member) or external
   - Compute: `survival_rate = merged_external_PRs / total_external_PRs`
   - Healthy threshold: >50% survival rate; concerning: <30%
2. Measure responsiveness:
   - **Issue first-response time**: median time from issue creation to first maintainer comment
   - **PR merge latency**: median time from PR open to merge for external PRs
   - Healthy: <7 days first-response, <30 days merge; concerning: >30 days first-response
3. Assess contributor diversity:
   - External/internal contributor ratio over last 6 months
   - Number of unique external contributors with >=2 merged PRs (repeat contributors signal a healthy ecosystem)
4. Check governance artifacts:
   - `CONTRIBUTING.md` exists and is actionable (not just "submit a PR")
   - `CODE_OF_CONDUCT.md` exists
   - Governance docs describe decision-making process
   - Issue/PR templates guide contributors

**Expected:** Community health scorecard with survival rate, response times, diversity ratio, and governance artifact checklist.

**On failure:** If PR data is insufficient (new project with <20 closed PRs), note the sample size limitation and weight other signals more heavily. If the project uses a non-GitHub platform, adapt the queries to that platform's API.

### Step 3: Calculate Supersession Risk

Determine how likely it is that external contributions will be rendered obsolete by internal development — the single biggest risk for framework adopters and contributors.

1. Sample the last 50-100 merged external PRs (or all if fewer exist)
2. For each merged external PR, check whether the contributed code was later:
   - **Reverted**: explicit revert commit referencing the PR
   - **Rewritten**: same file/module substantially changed within 90 days by an internal contributor
   - **Obsoleted**: feature removed or replaced in a subsequent release
3. Calculate: `supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. Map the published roadmap (if available) against areas where external contributors are active:
   - High overlap = high supersession risk (internals will build over external work)
   - Low overlap = lower supersession risk (externals fill gaps internals won't)
5. Check for "contribution traps": areas that look contribution-friendly but are scheduled for internal rewrite
6. Reference benchmark: NemoClaw analysis showed 71% external PRs superseded within 6 months — use as a calibration point

**Expected:** Supersession rate as a percentage, with breakdown by type (reverted/rewritten/obsoleted). Roadmap overlap assessment.

**On failure:** If commit history is shallow or squash-merged (losing attribution), estimate supersession by comparing external PR file paths against files changed in subsequent releases. Note reduced confidence in the estimate.

### Step 4: Evaluate Architecture Alignment

Assess whether the framework's architecture supports your use case without excessive lock-in.

1. Map extension points:
   - Plugin/extension API: does the framework expose a documented plugin interface?
   - Configuration surface: can behavior be customized without forking?
   - Hook/callback system: can you intercept and modify framework behavior at key points?
2. Assess lock-in risk:
   - **Rewrite cost**: estimate engineering effort to migrate away (days/weeks/months)
   - **Data portability**: can data/state be exported in standard formats?
   - **Standard compliance**: does the framework use open standards (agentskills.io, MCP, A2A) or proprietary protocols?
3. Evaluate API stability:
   - Count breaking changes per major release (CHANGELOG, migration guides)
   - Check for deprecation policy (advance warning before removal)
   - Assess semver compliance (breaking changes only in major versions)
4. Check alignment with your specific use case:
   - If `use_case` is provided, evaluate whether the framework's architecture naturally supports it
   - Identify any architectural mismatches that would require workarounds
5. Evaluate interoperability:
   - agentskills.io compatibility (skill model alignment)
   - MCP support (tool integration)
   - A2A protocol support (agent-to-agent communication)

**Expected:** Architecture alignment report with extension point inventory, lock-in risk assessment (low/medium/high), API stability score, and use-case fit evaluation.

**On failure:** If architecture documentation is sparse, derive the assessment from code structure and public API surface. If the framework is too young for stability history, note this and weight governance signals more heavily.

### Step 5: Assess Governance and Sustainability

Evaluate whether the project's governance model supports long-term viability and fair treatment of external contributors.

1. Classify governance model:
   - **BDFL** (Benevolent Dictator for Life): single decision-maker — fast decisions, bus factor risk
   - **Committee/Core team**: distributed decision-making — slower but more resilient
   - **Foundation-backed**: formal governance (Apache, Linux Foundation, CNCF) — most sustainable
   - **Corporate-controlled**: single company drives development — watch for rug-pull risk
2. Assess funding and sustainability:
   - Funding sources: VC-backed, corporate-sponsored, grants, community-funded, unfunded
   - Full-time maintainer count: >=2 is healthy; 0 is a red flag
   - Revenue model (if any): how does the project sustain itself?
3. Evaluate contributor protections:
   - License type: permissive (MIT, Apache-2.0) vs copyleft (GPL) vs custom
   - CLA requirements: does signing a CLA transfer rights that disadvantage contributors?
   - Contributor recognition: are external contributors credited in releases, changelogs, docs?
4. Check security posture:
   - Security disclosure policy (`SECURITY.md` or equivalent)
   - Median time from CVE disclosure to patch release
   - Dependency update practices (Dependabot, Renovate, manual)
5. Assess trajectory:
   - Is the governance model evolving (e.g., moving toward a foundation)?
   - Has there been a recent leadership change, acquisition, or relicensing?
   - Are there public conflicts between maintainers and contributors?

**Expected:** Governance assessment with model classification, sustainability rating (sustainable/at-risk/critical), contributor protection evaluation, and security posture summary.

**On failure:** If governance information is undocumented, treat the absence itself as a yellow flag. Check for implicit governance by examining who merges PRs, who closes issues, and who makes release decisions.

### Step 6: Classify Investment Readiness

Synthesize all findings into a four-tier classification with specific justifications and actionable recommendations.

1. Score each dimension (1-5 scale):
   - **Community health**: survival rate, responsiveness, diversity
   - **Supersession risk**: rate, roadmap overlap, contribution traps (invert: lower is better)
   - **Architecture alignment**: extension points, lock-in, stability, use-case fit
   - **Governance sustainability**: model, funding, protections, security
2. Apply classification thresholds:
   - **INVEST** (all dimensions >=4): Healthy community, low supersession (<20%), aligned architecture, sustainable governance. Safe to adopt and contribute engineering effort.
   - **EVALUATE-FURTHER** (mixed, no dimension <2): Mixed signals requiring specific follow-ups. Document what needs clarification and set a re-evaluation date.
   - **CONTRIBUTE-CAUTIOUSLY** (any dimension 2, none <2): High supersession (>40%) or governance concerns. Limit contributions to explicitly requested work, maintainer-approved scope, or plugin/extension development that is decoupled from core.
   - **AVOID** (any dimension 1): Critical red flags — abandoned project, hostile to externals (survival rate <15%), incompatible license, or imminent rug-pull indicators. Do not invest engineering effort.
3. Write the classification report:
   - Lead with the tier classification and one-sentence rationale
   - Summarize each dimension score with key evidence
   - If `contribution_budget` was provided, recommend how to allocate those hours given the tier
   - For EVALUATE-FURTHER, list specific questions that need answers and propose a timeline
   - For CONTRIBUTE-CAUTIOUSLY, specify which contribution types are safe (plugins, docs, tests) vs risky (core features)
4. If `comparison_frameworks` were evaluated, produce a comparison matrix ranking all frameworks

**Expected:** Classification report with tier, dimension scores, evidence summary, and actionable recommendations tailored to the investment context.

**On failure:** If data gaps prevent confident classification, default to EVALUATE-FURTHER with explicit documentation of what data is missing and how to obtain it. Never default to INVEST when uncertain.

## Validation

- [ ] Census data collected: stars, forks, dependents, release cadence, bus factor, landscape position
- [ ] Community health quantified: survival rate, response times, contributor diversity, governance artifacts
- [ ] Supersession risk calculated with breakdown by type (reverted/rewritten/obsoleted)
- [ ] Architecture alignment assessed: extension points, lock-in risk, API stability, use-case fit
- [ ] Governance evaluated: model, funding, contributor protections, security posture
- [ ] Classification produced: one of INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID
- [ ] Each dimension score justified with specific evidence from the analysis
- [ ] Recommendations are actionable and calibrated to the contribution budget (if provided)
- [ ] Data gaps and confidence limitations explicitly documented

## Common Pitfalls

- **Confusing popularity with health**: High stars but low contributor diversity means a single point of failure. A 50k-star project with one maintainer is less healthy than a 2k-star project with 15 active contributors.
- **Ignoring supersession risk**: The most common reason external contributions fail. A welcoming community means nothing if internal development routinely overwrites external work.
- **Over-weighting architecture without checking governance**: A beautifully designed framework can still fail if the governance model is unsustainable or hostile to externals.
- **Treating EVALUATE-FURTHER as AVOID**: Mixed signals require investigation, not rejection. Set a concrete re-evaluation date and list the specific questions to answer.
- **Snapshot bias**: All metrics are point-in-time. A declining project with great current metrics is worse than an improving project with mediocre current metrics. Always check the trend direction over 6-12 months.
- **CLA complacency**: Some CLAs transfer copyright to the project owner, meaning your contributions become their proprietary asset. Read the CLA text, not just the checkbox.
- **Anchoring on a single framework**: Without comparison frameworks, any project looks either great or terrible. Always benchmark against at least one alternative, even informally.

## Related Skills

- [polish-claw-project](../polish-claw-project/SKILL.md) — contribution workflow this assessment informs
- [review-software-architecture](../review-software-architecture/SKILL.md) — used in Step 4 for architecture evaluation
- [forage-solutions](../forage-solutions/SKILL.md) — alternative framework discovery for comparison
- [search-prior-art](../search-prior-art/SKILL.md) — landscape mapping and prior work analysis
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — security posture assessment referenced in Step 5
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — license and IP risk analysis
