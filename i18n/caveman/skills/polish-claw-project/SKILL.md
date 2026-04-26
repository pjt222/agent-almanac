---
name: polish-claw-project
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Contribute to OpenClaw ecosystem projects (OpenClaw, NemoClaw, NanoClaw)
  through a structured 9-step workflow: target verification, codebase
  exploration, parallel audit, finding cross-reference, and pull request
  creation. Emphasizes false positive prevention and project convention
  adherence.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
---

# Polish Claw Project

Structured workflow for contributing to OpenClaw ecosystem projects. Novel value in Steps 5-7: parallel audit, false positive prevention, cross-referencing findings against open issues to select high-impact contributions. Mechanical steps (fork, PR creation) delegate to existing skills.

## When Use

- Contributing to NVIDIA/OpenClaw, NVIDIA/NemoClaw, NVIDIA/NanoClaw, or similar Claw ecosystem repos
- First-time contributions to unfamiliar open-source project with security-sensitive architecture
- Want repeatable, auditable contribution workflow rather than ad-hoc fixes
- After identifying Claw project that accepts external contributions (check CONTRIBUTING.md)

## Inputs

- **Required**: `repo_url` — GitHub URL of target Claw project (e.g. `https://github.com/NVIDIA/NemoClaw`)
- **Optional**:
  - `contribution_count` — Number of contributions to aim for (default: 1-3)
  - `focus` — Preferred contribution type: `security`, `tests`, `docs`, `bugs`, `any` (default: `any`)
  - `fork_org` — GitHub org/user to fork into (default: authenticated user)

## Steps

### Step 1: Identify and Verify Target

Confirm project accepts external contributions and is actively maintained.

1. Open repository URL. Read `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`
2. Check recent commit activity (last 30 days) and open PR merge rate
3. Verify project uses permissive or contribution-friendly license
4. Read `SECURITY.md` or security policy if present — note responsible disclosure rules
5. Identify primary language, test framework, CI system

**Got:** CONTRIBUTING.md exists. Commits within last 30 days. Clear contribution guidelines.

**If fail:** No CONTRIBUTING.md or no recent activity? Document why and stop. Stale projects rarely merge external PRs.

### Step 2: Fork and Clone

Build working copy of repository.

1. Fork: `gh repo fork <repo_url> --clone`
2. Set upstream remote: `git remote add upstream <repo_url>`
3. Verify: `git remote -v` shows both `origin` (fork) and `upstream`
4. Sync: `git fetch upstream && git checkout main && git merge upstream/main`

**Got:** Local clone with both remotes configured and up to date.

**If fail:** Fork fails? Check GitHub authentication (`gh auth status`). Clone slow? Try `--depth=1` for initial exploration.

### Step 3: Explore Codebase

Build mental model of project architecture.

1. Read `README.md` for architecture overview and project goals
2. Identify entry points, core modules, public API surface
3. Map test structure: where tests live, what framework, coverage level
4. Note code style conventions: linter config, naming patterns, import style
5. Check for Docker/container setup, CI configuration, deployment patterns

**Got:** Clear understanding of project structure, conventions, where contributions would fit.

**If fail:** Architecture unclear? Focus on specific subsystem rather than whole project.

### Step 4: Read Open Issues

Survey existing issues to understand project needs and avoid duplicate work.

1. List open issues: `gh issue list --state open --limit 50`
2. Categorize by type: bugs, features, docs, security, good-first-issue
3. Note issues labeled `help wanted`, `good first issue`, `hacktoberfest`
4. Check for stale issues (>90 days open, no recent comments) — may be abandoned
5. Read any linked PRs to understand attempted solutions

**Got:** Categorized list of unclaimed issues with type labels.

**If fail:** No open issues exist? Proceed to Step 5 — audit may uncover unlisted improvements.

### Step 5: Parallel Audit

Run security and code quality audits in parallel. This is where novel findings emerge.

1. Run `security-audit-codebase` skill against project root
2. Simultaneously run `review-codebase` skill with scope `quality`
3. **Critical: verify each finding against project's threat model and architecture**
   - "Hardcoded secret" in sandbox bootstrap script is not a vulnerability
   - Missing input validation on internal-only function is low severity
   - Dependency flagged as vulnerable may already be mitigated by project's architecture
4. Rate verified findings: CRITICAL, HIGH, MEDIUM, LOW
5. Document false positives with reasoning — informs Pitfalls for future runs

**Got:** List of verified findings with severity ratings and false positive annotations.

**If fail:** No findings emerge? Shift focus to test coverage gaps, documentation improvements, developer experience enhancements.

### Step 6: Cross-Reference Findings

Map verified audit findings to open issues — core judgment step.

1. For each verified finding, search open issues for related discussions
2. Categorize each finding as:
   - **Matches open issue** — link finding to issue
   - **New finding** — no existing issue covers this
   - **Already fixed in PR** — check open PRs for in-progress fixes
3. Prioritize findings matching existing issues (highest merge probability)
4. For new findings, assess if maintainers would welcome fix based on project priorities

**Got:** Prioritized list with finding-to-issue mapping and merge probability assessment.

**If fail:** All findings already addressed? Return to Step 4. Look for documentation, test, or developer experience contributions.

### Step 7: Select Contributions

Pick 1-3 contributions based on impact, effort, expertise.

1. Score each candidate on:
   - **Impact**: How much does this improve project? (security > bugs > tests > docs)
   - **Effort**: Can this be done well in focused session? (prefer small, complete PRs)
   - **Expertise**: Does contributor have domain knowledge for this fix?
   - **Merge probability**: Does this match stated project priorities?
2. Select top candidates (default: 1-3)
3. For each, define: branch name, scope boundary, acceptance criteria, test plan

**Got:** 1-3 selected contributions with clear scope and acceptance criteria.

**If fail:** No contributions score well? Consider filing well-written issues instead of PRs.

### Step 8: Implement

Create branch per contribution. Implement fix.

1. For each contribution: `git checkout -b fix/<description>`
2. Follow project conventions exactly (linter, naming, import style)
3. Add or update tests covering change
4. Run project's test suite. Verify all tests pass
5. Run project's linter. Verify no new warnings
6. Keep each PR focused — one logical change per branch

**Got:** Clean implementation with passing tests and no linter warnings.

**If fail:** Tests fail on pre-existing issues? Document them. Ensure PR doesn't introduce new failures.

### Step 9: Create Pull Requests

Submit contributions following project's CONTRIBUTING.md.

1. Push branch: `git push origin fix/<description>`
2. Create PR using `create-pull-request` skill
3. Reference related issue in PR body (e.g. "Fixes #123")
4. Follow project's PR template if one exists
5. Be responsive to reviewer feedback — iterate quickly

**Got:** PRs created, linked to issues, following project conventions.

**If fail:** PR creation fails? Check branch protection rules and contributor license agreements.

## Checks

1. All selected contributions implemented and submitted as PRs
2. Each PR references related issue (if one exists)
3. All project tests pass on each PR branch
4. No false positive findings submitted as real issues
5. PR descriptions follow project's CONTRIBUTING.md template

## Pitfalls

- **False positive overclaim**: Claw projects use sandbox architectures — "vulnerability" inside sandboxed environment may be by design. Always verify against project's threat model before reporting.
- **Digest/signature chain disruption**: Claw projects often use verification chains for model integrity. Changes must preserve these chains or PR will be rejected.
- **Convention mismatch**: Claw projects enforce strict style. Run project's own linter, not generic one. Match import ordering, docstring format, test patterns exactly.
- **Scope creep**: 3 focused PRs merge faster than 1 sprawling PR. Keep each contribution atomic.
- **Stale fork**: Always sync with upstream before starting work (`git fetch upstream && git merge upstream/main`).

## See Also

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — used in Step 5 for security findings
- [review-codebase](../review-codebase/SKILL.md) — used in Step 5 for code quality review
- [create-pull-request](../create-pull-request/SKILL.md) — used in Step 9 for PR creation
- [create-github-issues](../create-github-issues/SKILL.md) — for filing issues from findings not addressed as PRs
- [manage-git-branches](../manage-git-branches/SKILL.md) — branch management during implementation
- [commit-changes](../commit-changes/SKILL.md) — commit workflow
