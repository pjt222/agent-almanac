---
name: create-pull-request
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create and manage pull requests using GitHub CLI. Covers branch
  preparation, writing PR titles and descriptions, creating PRs,
  handling review feedback, and merge/cleanup workflows. Use when
  proposing changes from a feature or fix branch for review, merging
  completed work into the main branch, requesting code review from
  collaborators, or documenting the purpose and scope of a set of
  changes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
---

# Create Pull Request

GitHub PR w/ clear title + structured desc + branch setup.

## Use When

- Feature/fix branch → review
- Merge completed → main
- Req code review
- Doc purpose + scope of changes

## In

- **Required**: Feature branch w/ committed changes
- **Required**: Base branch (usually `main`)
- **Optional**: Reviewers
- **Optional**: Labels / milestone
- **Optional**: Draft status

## Do

### Step 1: Branch Ready

Verify up-to-date + all committed:

```bash
# Check for uncommitted changes
git status

# Fetch latest from remote
git fetch origin

# Rebase on latest main (or merge)
git rebase origin/main
```

**Got:** Branch ahead of `origin/main`, no uncommit, no conflicts.

**If err:** Rebase conflicts → resolve (see `resolve-git-conflicts`) → `git rebase --continue`. Diverged → `git merge origin/main`.

### Step 2: Review Changes

Full diff + commit history:

```bash
# See all commits on this branch (not on main)
git log origin/main..HEAD --oneline

# See the full diff against main
git diff origin/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**Got:** All commits PR-relevant. Diff = intended changes only.

**If err:** Unrelated commits → interactive rebase → clean up history pre-PR.

### Step 3: Push Branch

```bash
# Push branch to remote (set upstream tracking)
git push -u origin HEAD
```

**Got:** Branch on GitHub remote.

**If err:** Rejected → `git pull --rebase origin <branch>` + resolve.

### Step 4: Title + Desc

Title <70 chars. Body for details:

```bash
gh pr create --title "Add weighted mean calculation" --body "$(cat <<'EOF'
## Summary
- Implement `weighted_mean()` with NA handling and zero-weight filtering
- Add input validation for mismatched vector lengths
- Include unit tests covering edge cases

## Test plan
- [ ] `devtools::test()` passes with no failures
- [ ] Manual verification with example data
- [ ] Edge cases: empty vectors, all-NA weights, zero-length input

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Draft:

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**Got:** PR on GitHub + URL. Desc = what changed + how to test.

**If err:** `gh` not auth → `gh auth login`. Wrong base → `--base main`.

### Step 5: Review Feedback

Respond + push:

```bash
# View PR comments
gh api repos/{owner}/{repo}/pulls/{number}/comments

# View PR review status
gh pr checks

# After making changes, commit and push
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**Got:** New commits on PR. Comments addressed.

**If err:** CI fail post-push → `gh pr checks` → fix pre-rereq.

### Step 6: Merge + Cleanup

Post-approval:

```bash
# Merge the PR (squash merge keeps history clean)
gh pr merge --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --rebase --delete-branch
```

Update local main:

```bash
git checkout main
git pull origin main
```

**Got:** PR merged, remote branch deleted, local main updated.

**If err:** Blocked by fail checks / missing approvals → address first. No force-merge w/o resolve.

## Check

- [ ] Title <70 chars + descriptive
- [ ] Body: summary + test plan
- [ ] All commits PR-relevant
- [ ] CI passes
- [ ] Branch up-to-date vs base
- [ ] Reviewers assigned (if req)
- [ ] No sensitive data

## Traps

- **PR too large**: Focus 1 feat/fix. Large → hard review + merge conflicts.
- **No test plan**: Always describe verify, even docs.
- **Stale branch**: Base moved ahead → rebase pre-PR → min conflicts.
- **Force-push during review**: Avoid on branch w/ open comments. Push new → incremental visible.
- **Ignoring CI**: Check `gh pr checks` pre-rereq. Fail CI = waste reviewers.
- **Branch not deleted**: Use `--delete-branch` → remote clean.

## →

- `commit-changes` — PR commits
- `manage-git-branches` — branch create + naming
- `resolve-git-conflicts` — rebase/merge conflicts
- `create-github-release` — release post-merge
