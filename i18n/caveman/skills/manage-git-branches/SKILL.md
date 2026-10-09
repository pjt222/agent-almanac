---
name: manage-git-branches
locale: caveman
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create, track, switch, sync, and clean up Git branches. Covers
  naming conventions, safe branch switching with stash, upstream
  synchronization, and pruning merged branches. Use when starting work
  on a new feature or bug fix, switching between tasks on different
  branches, keeping a feature branch up to date with main, or cleaning
  up branches after merging pull requests.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
---

# Manage Git Branches

Create, switch, sync, clean up branches following consistent naming conventions.

## When Use

- Starting work on new feature or bug fix
- Switching between tasks on different branches
- Keeping feature branch up to date with main
- Cleaning up branches after merging pull requests
- Listing and inspecting branches

## Inputs

- **Required**: Repository with at least one commit
- **Optional**: Branch naming convention (default: `type/description`)
- **Optional**: Base branch for new branches (default: `main`)
- **Optional**: Remote name (default: `origin`)

## Steps

### Step 1: Create Feature Branch

Use consistent naming convention:

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New functionality | `feature/add-weighted-mean` |
| `fix/` | Bug fix | `fix/null-pointer-in-parser` |
| `docs/` | Documentation | `docs/update-api-reference` |
| `refactor/` | Code restructuring | `refactor/extract-validation` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `test/` | Test additions | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**Got:** New branch created and checked out. `git branch` shows new branch with asterisk.

**If fail:** Base branch doesn't exist locally? Fetch first: `git fetch origin main && git checkout -b feature/name origin/main`.

### Step 2: Track Remote Branches

Set up tracking when pushing new branch for first time:

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

Check out remote branch someone else created:

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**Got:** Local branch tracks corresponding remote branch. `git branch -vv` shows upstream.

**If fail:** Auto-tracking fails? Set manually: `git branch --set-upstream-to=origin/feature/name feature/name`.

### Step 3: Switch Branches Safely

Before switching, ensure working tree clean:

```bash
# Check for uncommitted changes
git status
```

**Changes exist?** Either commit or stash them:

```bash
# Option 1: Commit work in progress
git add <files>
git commit -m "wip: save progress on validation logic"

# Option 2: Stash changes temporarily
git stash push -m "validation work in progress"

# Switch branches
git checkout main

# Later, restore stashed changes
git checkout feature/add-weighted-mean
git stash pop
```

List and manage stashes:

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**Got:** Branch switch succeeds. Working tree reflects target branch's state. Stashed changes recoverable.

**If fail:** Switch blocked by uncommitted changes that would be overwritten? Stash or commit first. `git stash` cannot stash untracked files unless you use `git stash push -u`.

### Step 4: Sync with Upstream

Keep feature branch up to date with base branch:

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**Got:** Branch now includes latest changes from main. No conflicts, or conflicts resolved (see `resolve-git-conflicts`).

**If fail:** Rebase causes conflicts? Resolve each one and `git rebase --continue`. Conflicts too complex? Abort with `git rebase --abort` and try `git merge origin/main` instead.

### Step 5: Clean Up Merged Branches

After pull requests merged, remove stale branches. First confirm each branch's work reached `main` — `git branch -d` does not answer that question (see If fail below). Two things must both hold. Forge must report PR merged into `main`: `gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` shows `MERGED` and `main`. And local branch must hold nothing PR did not: `git merge-base --is-ancestor <branch> <headRefOid>` exits 0. `headRefOid` is PR head forge merged, so this one test works for merge commit, squash merge and rebase merge alike. PR state alone not enough: cannot see local commit PR never had.

Exit 1? Branch carries such commit (one made after last push, or one remote branch lost to force-push): keep branch. Exit 128? PR head not present locally, for example because someone else pushed to PR before branch deleted: fetch it with `git fetch origin refs/pull/<n>/head` (GitHub keeps it after branch deleted), run test again. For merge commit, ancestry against merge commit (`mergeCommit.oid` in same `gh` output, after `git fetch origin main`) answers same question. Squash merge, and rebase merge that rewrote commits, fail that merge-commit test by construction — their commits new, do not contain branch's commits; they still pass `headRefOid` test. Only `MERGED` together with exit 0 licenses delete. Fence below lists delete forms for reference. After check passes, `git branch -D` safe; refusal from its `-d` line is If fail case.

```bash
# Delete a local branch that has been merged
git branch -d feature/add-weighted-mean

# Delete a local branch (force, even if not merged)
git branch -D feature/abandoned-experiment

# Delete a remote branch
git push origin --delete feature/add-weighted-mean

# Prune remote-tracking references for deleted remote branches
git fetch --prune
```

**Got:** Merged branches removed locally and remotely. `git branch` shows only active branches.

**If fail:** `git branch -d` not a merge check (#865, #900). Per `git help branch`, branch must be fully merged into its upstream, or into HEAD if no upstream set; measured (git 2.43), upstream shown as `gone` counts as none, so HEAD checked. Branch pushed with `-u` (Step 2) and fully pushed therefore passes whether or not it ever reached `main`: `-d` deletes it, exits 0, prints only warning on stderr (`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`). Running fence above in order then deletes remote branch too — no ref left containing work. Branch with no upstream checked against HEAD of worktree command runs in, so when HEAD is stacked branch containing it, `-d` deletes it with nothing at all on stderr. Other direction: `-d` refuses branch that *was* merged whenever reference it checks lacks tip — HEAD (for example local `main` not yet updated) once upstream gone after remote branch deleted, or upstream lagging behind tip because tip pushed from another clone and not yet fetched. Tip ahead of upstream because commit never pushed? Not that case: that commit in no PR, refusal correct. Squash-merged branch refused only when reference checked lacks tip, for example HEAD once upstream gone; while its own pushed upstream live, `-d` deletes it. Answer same either way: run check from start of this step, delete with `git branch -D` only when it passes.

### Step 6: List and Inspect Branches

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List branches with last commit info
git branch -v

# List branches merged into main
git branch --merged main

# List branches NOT yet merged
git branch --no-merged main

# See which remote branch each local branch tracks
git branch -vv
```

**Got:** Clear view of all branches, status, tracking relationships.

**If fail:** Remote branches appear stale? Run `git fetch --prune` to clean up references to deleted remote branches.

## Checks

- [ ] Branch names follow agreed naming convention
- [ ] Feature branches created from correct base branch
- [ ] Local branches track their remote counterparts
- [ ] Merged branches cleaned up (local and remote)
- [ ] Working tree clean before branch switches
- [ ] Stashed changes not left orphaned

## Pitfalls

- **Working on main directly**: Always create feature branch. Committing directly to main makes it difficult to create PRs and collaborate.
- **Forgetting to fetch before branching**: Creating branch from stale local main means starting behind. Always `git fetch origin` first.
- **Long-lived branches**: Feature branches living for weeks accumulate merge conflicts. Sync frequently, keep branches short-lived.
- **Orphaned stashes**: `git stash` is temporary storage. Don't rely on it for long-term work. Commit or branch instead.
- **Deleting unmerged work**: Neither delete flag safe on its own. `git branch -D` deletes regardless of merge state; `git branch -d` deletes unmerged branch fully pushed to its own upstream, or, with no upstream, one current HEAD contains even if `main` does not (no warning). Before either, run check at start of Step 5: PR `MERGED` into `main`, and `git merge-base --is-ancestor <branch> <headRefOid>` exits 0.
- **Not pruning**: Remote branches deleted on GitHub still appear locally until you `git fetch --prune`.

## See Also

- `commit-changes` - committing work on branches
- `create-pull-request` - opening PRs from feature branches
- `resolve-git-conflicts` - handling conflicts during sync
- `configure-git-repository` - repository setup and branch strategy
