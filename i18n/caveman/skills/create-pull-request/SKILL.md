---
name: create-pull-request
locale: caveman
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

Create GitHub pull request with clear title, structured description, proper branch setup.

## When Use

- Proposing changes from feature or fix branch for review
- Merging completed work into main branch
- Asking for code review from collaborators
- Documenting purpose and scope of set of changes

## Inputs

- **Required**: Feature branch with committed changes
- **Required**: Base branch to merge into (usually `main`)
- **Optional**: Reviewers to request
- **Optional**: Labels or milestone
- **Optional**: Draft status

## Steps

### Step 1: Ensure Branch Is Ready

Verify branch is up to date with base and all changes committed:

```bash
# Check for uncommitted changes
git status

# Fetch latest from remote
git fetch origin

# Rebase on latest main (or merge)
git rebase origin/main
```

**Got:** Branch ahead of `origin/main` with no uncommitted changes, no conflicts.

**If fail:** Rebase conflicts? Resolve them (see `resolve-git-conflicts` skill), then `git rebase --continue`. Branch diverged far? Consider `git merge origin/main` instead.

### Step 2: Review All Changes on the Branch

Examine full diff and commit history going into PR:

```bash
# See all commits on this branch (not on main)
git log origin/main..HEAD --oneline

# See the full diff against main
git diff origin/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**Got:** All commits relevant to PR. Diff shows only intended changes.

**If fail:** Unrelated commits present? Consider interactive rebase to clean history before creating PR.

### Step 3: Push the Branch

```bash
# Push branch to remote (set upstream tracking)
git push -u origin HEAD
```

**Got:** Branch shows on GitHub remote.

**If fail:** Push rejected? Pull first with `git pull --rebase origin <branch>` and resolve conflicts.

### Step 4: Write PR Title and Description

Keep title under 70 characters. Use body for details:

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

For draft PRs:

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**Got:** PR created on GitHub with URL returned. Description clearly tells what changed and how to test.

**If fail:** `gh` not authenticated? Run `gh auth login`. Wrong base branch? Specify with `--base main`.

### Step 5: Handle Review Feedback

Respond to review comments. Push updates:

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

**Got:** New commits show on PR. Review comments addressed.

**If fail:** CI checks fail after pushing? Read check output with `gh pr checks`. Fix issues before asking for re-review.

### Step 6: Merge and Clean Up

After approval:

```bash
# Merge the PR (squash merge keeps history clean)
gh pr merge --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --rebase --delete-branch
```

After merge, update local main:

```bash
git checkout main
git pull origin main
```

**Got:** PR merged, remote branch deleted, local main updated.

**If fail:** Merge blocked by failing checks or missing approvals? Fix those first. Do not force-merge without clearing blockers.

## Checks

- [ ] PR title concise (under 70 chars) and descriptive
- [ ] PR body has summary of changes and test plan
- [ ] All commits on branch relevant to PR
- [ ] CI checks pass
- [ ] Branch up to date with base branch
- [ ] Reviewers assigned (if required by repo settings)
- [ ] No sensitive data in diff

## Pitfalls

- **PR too large**: Keep PRs focused on single feature or fix. Big PRs harder to review, more merge conflicts.
- **Missing test plan**: Always describe how changes can be verified, even for docs PRs.
- **Stale branch**: Base branch moved far ahead? Rebase before creating PR to cut merge conflicts.
- **Force-pushing during review**: Dodge force-pushing to branch with open review comments. Push new commits so reviewers see incremental changes.
- **Not reading CI output**: Check `gh pr checks` before asking for re-review. Failing CI wastes reviewers' time.
- **Forgetting to delete branch**: Use `--delete-branch` with merge to keep remote clean.

## See Also

- `commit-changes` - creating commits for PR
- `manage-git-branches` - branch creation and naming conventions
- `resolve-git-conflicts` - handling conflicts during rebase/merge
- `create-github-release` - releasing after merge
