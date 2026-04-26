---
name: resolve-git-conflicts
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Resolve merge + rebase conflicts w/ safe recovery. ID conflict sources, read
  markers, choose resolution strategies, continue or abort safely. Use → git
  merge/rebase/cherry-pick/stash pop reports conflicts, git pull conflicts,
  safely abort + restart failed merge/rebase.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
---

# Resolve Git Conflicts

ID, resolve, recover from merge + rebase conflicts.

## Use When

- `git merge` or `git rebase` reports conflicts
- `git cherry-pick` can't apply cleanly
- `git pull` → conflicts
- `git stash pop` conflicts w/ working tree

## In

- **Required**: Repo w/ active conflicts
- **Optional**: Preferred strategy (ours, theirs, manual)
- **Optional**: Ctx about which changes priority

## Do

### Step 1: ID Source

Determine what op caused conflict:

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

Status output tells which files have conflicts + active op.

→ `git status` shows files under "Unmerged paths" + indicates active op.

If err: `git status` clean tree but expected conflicts → op may have completed/aborted. Check `git log` recent activity.

### Step 2: Read Markers

Open each conflicting file + locate markers:

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` to `=======`: Your current branch (or rebasing onto)
- `=======` to `>>>>>>>`: Incoming changes (merging branch or applying commit)

→ Each conflicting file has 1+ blocks w/ `<<<<<<<`, `=======`, `>>>>>>>` markers.

If err: no markers found but files conflicting → may be binary or deleted-vs-modified. Check `git diff --name-only --diff-filter=U` for full list.

### Step 3: Choose Strategy

**Manual merge** (most common): Edit file to combine both changes logically, remove all markers.

**Accept ours** (keep current branch):

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**Accept theirs** (keep incoming):

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

→ After resolution, file has correct merged content w/ no remaining markers.

If err: chose wrong side → re-read conflicting ver from merge base. During merge, `git checkout -m path/to/file` re-creates markers so you can try again.

### Step 4: Mark Resolved

After editing each file:

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

Repeat for every file under "Unmerged paths".

→ All files move "Unmerged paths" → "Changes to be committed". No markers remain.

If err: `git add` fails or markers remain → re-open file + ensure all `<<<<<<<`, `=======`, `>>>>>>>` lines removed.

### Step 5: Continue Op

Once all resolved:

**For merge**:

```bash
git commit
# Git auto-populates the merge commit message
```

**For rebase**:

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**For cherry-pick**:

```bash
git cherry-pick --continue
```

**For stash pop**:

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

→ Op completes. `git status` shows clean tree (or moves to next commit during rebase).

If err: continue cmd fails → check `git status` for remaining unresolved. All conflicts must resolve before continuing.

### Step 6: Abort if Needed

Resolution too complex or wrong approach → abort safely:

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

→ Repo returns to state before op started. No data loss.

If err: abort fails (rare) → check `git reflog` to find commit before op + `git reset --hard <commit>` to restore. Use w/ caution — discards uncommitted.

### Step 7: Verify

After op completes:

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

→ Clean tree, correct merge history, tests pass.

If err: tests fail after resolution → merge may have introduced logical errs even though syntax conflicts resolved. Review diff carefully + fix.

## Check

- [ ] No markers (`<<<<<<<`, `=======`, `>>>>>>>`) remain
- [ ] `git status` shows clean tree
- [ ] Merge/rebase history correct in `git log`
- [ ] Tests pass after resolution
- [ ] No unintended changes introduced

## Traps

- **Blindly accept one side**: `--ours`/`--theirs` discards other side entirely. Only use when certain one ver completely correct.
- **Leave markers in code**: Always search entire file for remaining markers after edit. Partial resolution breaks code.
- **Amend during rebase**: Interactive rebase → don't `--amend` unless step specifically calls for it. Use `git rebase --continue` instead.
- **Lose work on abort**: `git rebase --abort` + `git merge --abort` discard all resolution work. Only abort to start over.
- **Not testing after resolution**: Syntactically clean merge can still be logically wrong. Always run tests.
- **Force-push after rebase**: After rebasing shared branch, coord w/ collaborators before force-push, rewrites history.

## →

- `commit-changes` — committing after resolution
- `manage-git-branches` — branch workflows leading to conflicts
- `configure-git-repository` — repo setup + merge strategies
