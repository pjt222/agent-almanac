---
name: polish-claw-project
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Contribute to OpenClaw ecosystem (OpenClaw, NemoClaw, NanoClaw) via 9-step
  workflow: target verify, codebase explore, parallel audit, finding cross-ref,
  PR create. Emphasizes false positive prevention + project convention.
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

Structured workflow for OpenClaw ecosystem contributions. Novel value: Steps 5-7 — parallel audit, false positive prevention, cross-ref findings vs open issues → high-impact picks. Mechanical steps (fork, PR) → existing skills.

## Use When

- Contribute to NVIDIA/OpenClaw, NVIDIA/NemoClaw, NVIDIA/NanoClaw, similar Claw repos
- First-time contributions to unfamiliar OSS w/ security-sensitive arch
- Want repeatable auditable workflow vs ad-hoc fixes
- Found Claw project accepting external contributions (check CONTRIBUTING.md)

## In

- **Required**: `repo_url` — GitHub URL of target Claw project (e.g., `https://github.com/NVIDIA/NemoClaw`)
- **Optional**:
  - `contribution_count` — n contributions (default: 1-3)
  - `focus` — `security`, `tests`, `docs`, `bugs`, `any` (default: `any`)
  - `fork_org` — fork target org/user (default: authenticated user)

## Do

### Step 1: Identify + Verify Target

Confirm project accepts external + actively maintained.

1. Read `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`
2. Check recent commit activity (last 30 days) + open PR merge rate
3. Verify permissive or contribution-friendly license
4. Read `SECURITY.md` if present → note disclosure rules
5. Identify primary language, test framework, CI

→ CONTRIBUTING.md exists, commits w/in 30 days, clear contribution guidelines.

If err: no CONTRIBUTING.md or no recent activity → doc why + stop. Stale projects rarely merge external PRs.

### Step 2: Fork + Clone

Working copy of repo.

1. Fork: `gh repo fork <repo_url> --clone`
2. Upstream remote: `git remote add upstream <repo_url>`
3. Verify: `git remote -v` shows `origin` (fork) + `upstream`
4. Sync: `git fetch upstream && git checkout main && git merge upstream/main`

→ Local clone w/ both remotes configured + up to date.

If err: fork fails → check `gh auth status`. Slow clone → `--depth=1` for initial explore.

### Step 3: Explore Codebase

Build mental model of arch.

1. Read `README.md` for arch overview + goals
2. ID entry points, core modules, public API surface
3. Map test structure: where tests, framework, coverage
4. Note style conventions: linter config, naming, import style
5. Check Docker/container, CI config, deployment patterns

→ Clear understanding of structure, conventions, where contributions fit.

If err: arch unclear → focus on subsystem not whole project.

### Step 4: Read Open Issues

Survey issues → understand needs + avoid duplicate work.

1. List: `gh issue list --state open --limit 50`
2. Categorize: bugs, features, docs, security, good-first-issue
3. Note `help wanted`, `good first issue`, `hacktoberfest` labels
4. Stale issues (>90 days, no recent comments) → may be abandoned
5. Read linked PRs → understand attempted solutions

→ Categorized unclaimed issues w/ type labels.

If err: no open issues → Step 5, audit may uncover unlisted improvements.

### Step 5: Parallel Audit

Run security + quality audits in parallel. Where novel findings emerge.

1. Run `security-audit-codebase` against project root
2. Simultaneously run `review-codebase` w/ scope `quality`
3. **Critical: verify each finding vs project's threat model + arch**
   - "Hardcoded secret" in sandbox bootstrap = not vuln
   - Missing input validation on internal-only fn = low severity
   - Dep flagged vulnerable may already be mitigated by arch
4. Rate verified: CRITICAL, HIGH, MEDIUM, LOW
5. Doc false positives w/ reasoning → informs Pitfalls for future runs

→ Verified findings list w/ severity + false positive annotations.

If err: no findings → shift to test coverage gaps, docs, dev experience.

### Step 6: Cross-Reference Findings

Map verified findings → open issues. Core judgment step.

1. Per finding, search open issues for related discussions
2. Categorize:
   - **Matches open issue** — link finding to issue
   - **New finding** — no existing issue
   - **Already fixed in PR** — check open PRs for in-progress fixes
3. Prioritize matching issues (highest merge prob)
4. New findings → assess if maintainers welcome based on priorities

→ Prioritized list w/ finding-to-issue map + merge prob assessment.

If err: all findings already addressed → return Step 4, look for docs, tests, dev experience.

### Step 7: Select Contributions

Pick 1-3 by impact, effort, expertise.

1. Score each:
   - **Impact**: Improvement? (security > bugs > tests > docs)
   - **Effort**: Done well in focused session? (prefer small complete PRs)
   - **Expertise**: Domain knowledge?
   - **Merge prob**: Matches stated priorities?
2. Pick top (default 1-3)
3. Per: branch name, scope boundary, acceptance criteria, test plan

→ 1-3 selected contributions w/ clear scope + acceptance criteria.

If err: nothing scores well → file well-written issues instead of PRs.

### Step 8: Implement

Branch per contribution + implement fix.

1. Per contribution: `git checkout -b fix/<description>`
2. Follow conventions exactly (linter, naming, imports)
3. Add/update tests covering change
4. Run test suite → verify all pass
5. Run linter → verify no new warnings
6. Keep PR focused — one logical change per branch

→ Clean impl w/ passing tests + no linter warnings.

If err: tests fail on pre-existing issues → doc them, ensure PR doesn't introduce new failures.

### Step 9: Create PRs

Submit per CONTRIBUTING.md.

1. Push: `git push origin fix/<description>`
2. PR via `create-pull-request` skill
3. Ref related issue in body ("Fixes #123")
4. Follow PR template if exists
5. Responsive to reviewer feedback → iterate quickly

→ PRs created, linked to issues, following conventions.

If err: PR create fails → check branch protection + CLA.

## Check

1. All selected contributions impl + submitted as PRs
2. Each PR refs related issue (if exists)
3. All project tests pass on each PR branch
4. No false positives submitted as real issues
5. PR descriptions follow CONTRIBUTING.md template

## Traps

- **False positive overclaim**: Claw uses sandbox arch — "vuln" inside sandbox may be by design. Verify vs threat model before reporting.
- **Digest/signature chain disruption**: Claw uses verification chains for model integrity. Changes must preserve or PR rejected.
- **Convention mismatch**: Claw enforces strict style. Run project's own linter, not generic. Match imports, docstrings, test patterns exactly.
- **Scope creep**: 3 focused PRs merge faster than 1 sprawling. Keep atomic.
- **Stale fork**: Always sync upstream before work (`git fetch upstream && git merge upstream/main`).

## →

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — used in Step 5 for security findings
- [review-codebase](../review-codebase/SKILL.md) — used in Step 5 for quality review
- [create-pull-request](../create-pull-request/SKILL.md) — used in Step 9 for PR create
- [create-github-issues](../create-github-issues/SKILL.md) — file issues from findings not addressed as PRs
- [manage-git-branches](../manage-git-branches/SKILL.md) — branch mgmt during impl
- [commit-changes](../commit-changes/SKILL.md) — commit workflow
