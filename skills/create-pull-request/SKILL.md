---
name: create-pull-request
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

Create a GitHub pull request with a clear title, structured description, and proper branch setup.

## When to Use

- Proposing changes from a feature or fix branch for review
- Merging completed work into the main branch
- Requesting code review from collaborators
- Documenting the purpose and scope of a set of changes

## Inputs

- **Required**: Feature branch with committed changes
- **Required**: Base branch to merge into (usually `main`)
- **Optional**: Reviewers to request
- **Optional**: Labels or milestone
- **Optional**: Draft status

## Procedure

### Step 1 — Identify remotes and upstream

1. Determine `<REMOTE_NAME>` from the current branch's remote-tracking configuration, not by assuming "origin":
   `git config --get branch.$(git branch --show-current).remote`
   Confirm with `git remote -v`. A remote named "upstream" may or may not exist.

2. Get the upstream repository:
   `gh repo view "$(git remote get-url <REMOTE_NAME> | sed -E 's#^[^:]*:##; s#^//[^/]*/##; s#\.git$##')" --json isFork,parent --jq '.parent.nameWithOwner'`
   If null while isFork is true, the parent is deleted, private, or detached. Try:
   `gh api "repos/<FORK_OWNER>/<FORK_REPO>" --jq '{parent: .parent.full_name, source: .source.full_name}'`

3. Determine `<UPSTREAM>`, the name of the remote that refers to the upstream repository. Check `git remote -v` first: if a remote's URL already contains `<UPSTREAM_OWNER>/<UPSTREAM_REPO>`, that remote's name is `<UPSTREAM>` — do not add another. Otherwise add the upstream repository as a remote named `upstream` (this new remote is `<UPSTREAM>` for the remaining steps) and fetch it:
   `git remote add upstream "https://github.com/<UPSTREAM_OWNER>/<UPSTREAM_REPO>.git"`
   `git fetch upstream`

Report `<REMOTE_NAME>`, `<UPSTREAM>`, and `<UPSTREAM_OWNER>`/`<UPSTREAM_REPO>`

### Step 2: Ensure Branch Is Ready

Verify the branch is up to date with the base branch and all changes are committed:

```bash
# Check for uncommitted changes
git status

# Fetch latest from the branch's remote and the upstream repository
git fetch <REMOTE_NAME>
git fetch <UPSTREAM>

# Rebase on the latest base branch of the upstream repo (or merge)
git rebase <UPSTREAM>/main
```

**Expected:** Branch is ahead of `<UPSTREAM>/main` with no uncommitted changes and no conflicts.

**On failure:** If rebase conflicts occur, resolve them (see `resolve-git-conflicts` skill), then `git rebase --continue`. If the branch has diverged significantly, consider `git merge <UPSTREAM>/main` instead.

### Step 3: Review All Changes on the Branch

Examine the full diff and commit history that will be included in the PR:

```bash
# See all commits on this branch (not on the upstream base branch)
git log <UPSTREAM>/main..HEAD --oneline

# See the full diff against the upstream base branch
git diff <UPSTREAM>/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**Expected:** All commits are relevant to the PR. The diff shows only intended changes.

**On failure:** If unrelated commits are present, consider interactive rebase to clean up history before creating the PR.

### Step 4: Push the Branch

```bash
# Push branch to the branch's remote (set upstream tracking)
git push -u <REMOTE_NAME> HEAD
```

**Expected:** Branch appears on the `<REMOTE_NAME>` remote — on GitHub, in the fork when working from one.

**On failure:** If push is rejected, pull first with `git pull --rebase <REMOTE_NAME> <branch>` and resolve any conflicts.

### Step 5: Write PR Title and Description

Keep the title under 70 characters. Use the body for details. Target the upstream repository from Step 1; when the branch was pushed to a fork, pass the fork as the head — `<FORK_OWNER>` is the owner of the `<REMOTE_NAME>` repository and `<BRANCH_NAME>` the current branch:

```bash
gh pr create \
  --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>" \
  --head "<FORK_OWNER>:<BRANCH_NAME>" \
  --base main \
  --title "Add weighted mean calculation" \
  --body "$(cat <<'EOF'
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

When `<REMOTE_NAME>` IS the upstream repository (not a fork), omit `--repo` and `--head` — a plain `gh pr create --title "..." --body "..."` targets the current repository.

For draft PRs:

```bash
gh pr create --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>" --head "<FORK_OWNER>:<BRANCH_NAME>" --title "WIP: Add authentication" --body "..." --draft
```

**Expected:** PR created on GitHub with a URL returned. Description clearly communicates what changed and how to test.

**On failure:** If `gh` is not authenticated, run `gh auth login`. If the PR lands on the wrong repository, check `--repo` and `--head` against Step 1.

### Step 6: Handle Review Feedback

Respond to review comments and push updates:

```bash
# View PR comments on the upstream repository
gh api "repos/<UPSTREAM_OWNER>/<UPSTREAM_REPO>/pulls/<PR_NUMBER>/comments"

# View PR review status
gh pr checks --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>"

# After making changes, commit and push
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**Expected:** New commits appear on the PR. Review comments are addressed.

**On failure:** If CI checks fail after pushing, read the check output with `gh pr checks` and fix the issues before requesting re-review.

### Step 7: Merge and Clean Up

After approval:

```bash
# Merge the PR in the upstream repository (squash merge keeps history clean)
gh pr merge --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>" --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>" --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --repo "<UPSTREAM_OWNER>/<UPSTREAM_REPO>" --rebase --delete-branch
```

After merge, update local main from the upstream repository:

```bash
git checkout main
git pull <UPSTREAM> main
```

**Expected:** PR is merged, remote branch is deleted, local main is updated.

**On failure:** If merge is blocked by failing checks or missing approvals, address those first. Do not force-merge without resolving blockers.

## Validation

- [ ] PR title is concise (under 70 characters) and descriptive
- [ ] PR body includes summary of changes and test plan
- [ ] All commits on the branch are relevant to the PR
- [ ] CI checks pass
- [ ] Branch is up to date with the upstream base branch
- [ ] PR targets the upstream repository (`<UPSTREAM_OWNER>/<UPSTREAM_REPO>`) with the correct base branch
- [ ] Reviewers are assigned (if required by repository settings)
- [ ] No sensitive data in the diff

## Common Pitfalls

- **PR too large**: Keep PRs focused on a single feature or fix. Large PRs are harder to review and more likely to have merge conflicts.
- **Missing test plan**: Always describe how the changes can be verified, even for documentation PRs.
- **Stale branch**: If the base branch has moved ahead significantly, rebase before creating the PR to minimize merge conflicts.
- **Force-pushing during review**: Avoid force-pushing to a branch with open review comments. Push new commits so reviewers can see incremental changes.
- **Not reading CI output**: Check `gh pr checks` before asking for re-review. Failing CI wastes reviewers' time.
- **Forgetting to delete branch**: Use `--delete-branch` with merge to keep the remote clean.
- **PR opened against the fork**: When working from a fork, the PR must target the upstream repository (`--repo <UPSTREAM_OWNER>/<UPSTREAM_REPO>`, `--head <FORK_OWNER>:<branch>`). A PR against the fork itself cannot be merged upstream.

## Related Skills

- `commit-changes` - creating commits for the PR
- `manage-git-branches` - branch creation and naming conventions
- `resolve-git-conflicts` - handling conflicts during rebase/merge
- `create-github-release` - releasing after merge
