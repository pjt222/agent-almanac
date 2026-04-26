---
name: manage-git-branches
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create, track, switch, sync, clean up Git branches. Naming conventions, safe
  switching w/ stash, upstream sync, pruning merged. Use when starting new
  feature / bug fix, switching tasks, keeping feature branch current w/ main,
  or cleaning up after merging PRs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
---

# Manage Git Branches

Create, switch, sync, clean up branches per consistent naming.

## Use When

- Start new feature / bug fix
- Switching tasks on diff branches
- Keep feature branch up-to-date w/ main
- Clean up after merging PRs
- List + inspect branches

## In

- **Req**: Repo w/ ≥1 commit
- **Opt**: Naming convention (default: `type/description`)
- **Opt**: Base branch (default: `main`)
- **Opt**: Remote name (default: `origin`)

## Do

### Step 1: Create Feature Branch

Consistent naming:

| Prefix | Purpose | Example |
|--------|---------|---------|
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

→ New branch created + checked out. `git branch` shows branch w/ asterisk.

**If err:** Base branch doesn't exist locally → fetch first: `git fetch origin main && git checkout -b feature/name origin/main`.

### Step 2: Track Remote Branches

Setup tracking when pushing new branch first time:

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

→ Local tracks remote. `git branch -vv` shows upstream.

**If err:** Auto-tracking fails → manually: `git branch --set-upstream-to=origin/feature/name feature/name`.

### Step 3: Switch Branches Safely

Before switch → working tree clean:

```bash
# Check for uncommitted changes
git status
```

**Changes exist** → commit or stash:

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

List + manage stashes:

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

→ Switch succeeds. Working tree reflects target. Stashed changes recoverable.

**If err:** Switch blocked by uncommitted changes → stash or commit first. `git stash` can't stash untracked files unless `git stash push -u`.

### Step 4: Sync w/ Upstream

Keep feature branch up-to-date w/ base:

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

→ Branch has latest from main. No conflicts, or resolved (see `resolve-git-conflicts`).

**If err:** Rebase conflicts → resolve each + `git rebase --continue`. Too complex → abort w/ `git rebase --abort` + try `git merge origin/main`.

### Step 5: Clean Up Merged Branches

After PRs merged → remove stale:

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

→ Merged branches removed locally + remotely. `git branch` shows only active.

**If err:** `git branch -d` refuses unmerged. If merged via squash merge on GitHub → Git may not recognize as merged. Use `git branch -D` if certain work preserved.

### Step 6: List + Inspect

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

→ Clear view of all branches, status, tracking.

**If err:** Remote branches appear stale → `git fetch --prune` → clean up refs to deleted remotes.

## Check

- [ ] Branch names follow agreed convention
- [ ] Feature branches from correct base
- [ ] Local branches track remotes
- [ ] Merged cleaned up (local + remote)
- [ ] Working tree clean before switches
- [ ] Stashes not left orphaned

## Traps

- **Work on main directly**: Always create feature branch. Committing directly to main → hard to create PRs + collaborate.
- **Forget fetch before branching**: Creating from stale local main → start behind. Always `git fetch origin` first.
- **Long-lived branches**: Weeks-long → accumulate conflicts. Sync freq + keep short-lived.
- **Orphaned stashes**: `git stash` = temporary storage. Don't rely for long-term. Commit / branch instead.
- **Delete unmerged work**: `git branch -D` destructive. Double-check w/ `git log branch-name` before force-delete.
- **Not pruning**: Remote branches deleted on GitHub still appear locally until `git fetch --prune`.

## →

- `commit-changes` — committing work on branches
- `create-pull-request` — opening PRs from feature branches
- `resolve-git-conflicts` — handling conflicts during sync
- `configure-git-repository` — repo setup + branch strategy
