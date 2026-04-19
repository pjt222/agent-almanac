---
name: polish-claw-project
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Structured workflow for contributing to OpenClaw ecosystem projects. The novel value is in Steps 5-7: parallel audit, false positive prevention, and cross-referencing findings against open issues to select high-impact contributions. Mechanical steps (fork, PR creation) delegate to existing skills.

## When to Use

- Contributing to NVIDIA/OpenClaw, NVIDIA/NemoClaw, NVIDIA/NanoClaw, or similar Claw ecosystem repos
- First-time contributions to an unfamiliar open-source project with security-sensitive architecture
- When you want a repeatable, auditable contribution workflow rather than ad-hoc fixes
- After identifying a Claw project that accepts external contributions (check CONTRIBUTING.md)

## Inputs

- **Required**: `repo_url` — GitHub URL of the target Claw project (e.g., `https://github.com/NVIDIA/NemoClaw`)
- **Optional**:
  - `contribution_count` — Number of contributions to aim for (default: 1-3)
  - `focus` — Preferred contribution type: `security`, `tests`, `docs`, `bugs`, `any` (default: `any`)
  - `fork_org` — GitHub org/user to fork into (default: authenticated user)

## Procedure

### Step 1: Identify and Verify Target

Confirm the project accepts external contributions and is actively maintained.

1. Open the repository URL and read `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `LICENSE`
2. Check recent commit activity (last 30 days) and open PR merge rate
3. Verify the project uses a permissive or contribution-friendly license
4. Read `SECURITY.md` or security policy if present — note responsible disclosure rules
5. Identify the primary language, test framework, and CI system

**Expected:** CONTRIBUTING.md exists, commits within last 30 days, clear contribution guidelines.

**On failure:** If no CONTRIBUTING.md or no recent activity, document why and stop — stale projects rarely merge external PRs.

### Step 2: Fork and Clone

Create a working copy of the repository.

1. Fork: `gh repo fork <repo_url> --clone`
2. Set upstream remote: `git remote add upstream <repo_url>`
3. Verify: `git remote -v` shows both `origin` (fork) and `upstream`
4. Sync: `git fetch upstream && git checkout main && git merge upstream/main`

**Expected:** Local clone with both remotes configured and up to date.

**On failure:** If fork fails, check GitHub authentication (`gh auth status`). If clone is slow, try `--depth=1` for initial exploration.

### Step 3: Explore Codebase

Build a mental model of the project architecture.

1. Read `README.md` for architecture overview and project goals
2. Identify entry points, core modules, and public API surface
3. Map the test structure: where tests live, what framework, coverage level
4. Note code style conventions: linter config, naming patterns, import style
5. Check for Docker/container setup, CI configuration, and deployment patterns

**Expected:** Clear understanding of project structure, conventions, and where contributions would fit.

**On failure:** If architecture is unclear, focus on a specific subsystem rather than the whole project.

### Step 4: Read Open Issues

Survey existing issues to understand project needs and avoid duplicate work.

1. List open issues: `gh issue list --state open --limit 50`
2. Categorize by type: bugs, features, docs, security, good-first-issue
3. Note issues labeled `help wanted`, `good first issue`, or `hacktoberfest`
4. Check for stale issues (>90 days open, no recent comments) — these may be abandoned
5. Read any linked PRs to understand attempted solutions

**Expected:** Categorized list of unclaimed issues with type labels.

**On failure:** If no open issues exist, proceed to Step 5 — audit may uncover unlisted improvements.

### Step 5: Parallel Audit

Run security and code quality audits in parallel. This is where novel findings emerge.

1. Run `security-audit-codebase` skill against the project root
2. Simultaneously run `review-codebase` skill with scope `quality`
3. **Critical: verify each finding against the project's threat model and architecture**
   - A "hardcoded secret" in a sandbox bootstrap script is not a vulnerability
   - A missing input validation on an internal-only function is low severity
   - A dependency flagged as vulnerable may already be mitigated by the project's architecture
4. Rate verified findings: CRITICAL, HIGH, MEDIUM, LOW
5. Document false positives with reasoning — they inform Common Pitfalls for future runs

**Expected:** List of verified findings with severity ratings and false positive annotations.

**On failure:** If no findings emerge, shift focus to test coverage gaps, documentation improvements, or developer experience enhancements.

### Step 6: Cross-Reference Findings

Map verified audit findings to open issues — the core judgment step.

1. For each verified finding, search open issues for related discussions
2. Categorize each finding as:
   - **Matches open issue** — link the finding to the issue
   - **New finding** — no existing issue covers this
   - **Already fixed in PR** — check open PRs for in-progress fixes
3. Prioritize findings that match existing issues (highest merge probability)
4. For new findings, assess whether the maintainers would welcome the fix based on project priorities

**Expected:** Prioritized list with finding-to-issue mapping and merge probability assessment.

**On failure:** If all findings are already addressed, return to Step 4 and look for documentation, test, or developer experience contributions.

### Step 7: Select Contributions

Pick 1-3 contributions based on impact, effort, and expertise.

1. Score each candidate on:
   - **Impact**: How much does this improve the project? (security > bugs > tests > docs)
   - **Effort**: Can this be done well in a focused session? (prefer small, complete PRs)
   - **Expertise**: Does the contributor have domain knowledge for this fix?
   - **Merge probability**: Does this match stated project priorities?
2. Select the top candidates (default: 1-3)
3. For each, define: branch name, scope boundary, acceptance criteria, test plan

**Expected:** 1-3 selected contributions with clear scope and acceptance criteria.

**On failure:** If no contributions score well, consider filing well-written issues instead of PRs.

### Step 8: Implement

Create a branch per contribution and implement the fix.

1. For each contribution: `git checkout -b fix/<description>`
2. Follow project conventions exactly (linter, naming, import style)
3. Add or update tests covering the change
4. Run the project's test suite: verify all tests pass
5. Run the project's linter: verify no new warnings
6. Keep each PR focused — one logical change per branch

**Expected:** Clean implementation with passing tests and no linter warnings.

**On failure:** If tests fail on pre-existing issues, document them and ensure the PR doesn't introduce new failures.

### Step 9: Create Pull Requests

Submit contributions following the project's CONTRIBUTING.md.

1. Push branch: `git push origin fix/<description>`
2. Create PR using the `create-pull-request` skill
3. Reference the related issue in the PR body (e.g., "Fixes #123")
4. Follow the project's PR template if one exists
5. Be responsive to reviewer feedback — iterate quickly

**Expected:** PRs created, linked to issues, following project conventions.

**On failure:** If PR creation fails, check branch protection rules and contributor license agreements.

## Validation

1. All selected contributions have been implemented and submitted as PRs
2. Each PR references the related issue (if one exists)
3. All project tests pass on each PR branch
4. No false positive findings were submitted as real issues
5. PR descriptions follow the project's CONTRIBUTING.md template

## Common Pitfalls

- **False positive overclaim**: Claw projects use sandbox architectures — a "vulnerability" inside a sandboxed environment may be by design. Always verify against the project's threat model before reporting.
- **Digest/signature chain disruption**: Claw projects often use verification chains for model integrity. Changes must preserve these chains or the PR will be rejected.
- **Convention mismatch**: Claw projects enforce strict style. Run the project's own linter, not a generic one. Match import ordering, docstring format, and test patterns exactly.
- **Scope creep**: 3 focused PRs merge faster than 1 sprawling PR. Keep each contribution atomic.
- **Stale fork**: Always sync with upstream before starting work (`git fetch upstream && git merge upstream/main`).

## Related Skills

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — used in Step 5 for security findings
- [review-codebase](../review-codebase/SKILL.md) — used in Step 5 for code quality review
- [create-pull-request](../create-pull-request/SKILL.md) — used in Step 9 for PR creation
- [create-github-issues](../create-github-issues/SKILL.md) — for filing issues from findings not addressed as PRs
- [manage-git-branches](../manage-git-branches/SKILL.md) — branch management during implementation
- [commit-changes](../commit-changes/SKILL.md) — commit workflow
