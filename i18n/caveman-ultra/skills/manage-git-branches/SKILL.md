---
name: manage-git-branches
locale: caveman-ultra
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
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
  version: "1.1"
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

After PRs merged → remove stale. First confirm each branch's work reached `main` — `git branch -d` doesn't answer that (see If err below). Both must hold. Forge reports PR merged into `main`: `gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` shows `MERGED` + `main`. And local branch holds nothing PR didn't: `git merge-base --is-ancestor <branch> <headRefOid>` exits 0. `headRefOid` = PR head forge merged → one test works for merge commit, squash merge, rebase merge alike. PR state alone not enough: can't see local commit PR never had.

Exit 1 = branch carries such commit (made after last push, or lost from remote branch to force-push): keep branch. Exit 128 = PR head not present locally (e.g. someone else pushed to PR before branch deleted): fetch w/ `git fetch origin refs/pull/<n>/head` (GitHub keeps it after branch deleted), rerun test. Merge commit: ancestry vs merge commit (`mergeCommit.oid` in same `gh` output, after `git fetch origin main`) answers same question. Squash merge + rebase merge that rewrote commits fail that merge-commit test by construction (commits new, don't contain branch's commits); still pass `headRefOid` test. Only `MERGED` + exit 0 licenses delete. Fence below lists delete forms for reference. Check passes → `git branch -D` safe; refusal from its `-d` line = If err case.

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

**If err:** `git branch -d` ≠ merge check (#865, #900). Per `git help branch`: branch must be fully merged into its upstream, or into HEAD if no upstream set; measured (git 2.43), upstream shown as `gone` counts as none → HEAD checked. Branch pushed w/ `-u` (Step 2) + fully pushed → passes whether or not it ever reached `main`: `-d` deletes it, exits 0, prints only warn on stderr (`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`). Running fence above in order then deletes remote branch too → no ref left containing work. Branch w/ no upstream checked vs HEAD of worktree cmd runs in; when HEAD = stacked branch containing it, `-d` deletes it w/ nothing at all on stderr. Other direction: `-d` refuses branch that *was* merged whenever ref it checks lacks tip: HEAD (e.g. local `main` not yet updated) once upstream gone after remote branch deleted, or upstream lagging behind tip b/c tip pushed from another clone + not yet fetched. Tip ahead of upstream b/c commit never pushed ≠ that case: commit in no PR → refusal correct. Squash-merged branch refused only when ref checked lacks tip, e.g. HEAD once upstream gone; while its own pushed upstream live, `-d` deletes it. Answer same either way: run check from start of this step; delete w/ `git branch -D` only when it passes.

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
- **Delete unmerged work**: Neither delete flag safe alone. `git branch -D` deletes regardless of merge state; `git branch -d` deletes unmerged branch fully pushed to own upstream, or, w/ no upstream, one current HEAD contains even if `main` doesn't (no warn). Before either → check at start of Step 5: PR `MERGED` into `main` + `git merge-base --is-ancestor <branch> <headRefOid>` exits 0.
- **Not pruning**: Remote branches deleted on GitHub still appear locally until `git fetch --prune`.

## →

- `commit-changes` — committing work on branches
- `create-pull-request` — opening PRs from feature branches
- `resolve-git-conflicts` — handling conflicts during sync
- `configure-git-repository` — repo setup + branch strategy
