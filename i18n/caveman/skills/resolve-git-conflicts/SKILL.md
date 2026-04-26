---
name: resolve-git-conflicts
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Resolve merge and rebase conflicts with safe recovery strategies.
  Cover identifying conflict sources, reading conflict markers, choosing
  resolution strategies, continuing or aborting operations safely. Use
  when git merge, rebase, cherry-pick, or stash pop reports conflicts;
  when git pull results in conflicting changes; or when need to safely
  abort and restart failed merge or rebase operation.
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

Identify, resolve, recover from merge and rebase conflicts.

## When Use

- `git merge` or `git rebase` reports conflicts
- `git cherry-pick` cannot apply cleanly
- `git pull` results in conflicting changes
- `git stash pop` conflicts with current working tree

## Inputs

- **Required**: Repository with active conflicts
- **Optional**: Preferred resolution strategy (ours, theirs, manual)
- **Optional**: Context about which changes should take priority

## Steps

### Step 1: Identify Conflict Source

Determine what operation caused conflict:

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

Status output tells you which files have conflicts and what operation in progress.

**Got:** `git status` shows files listed under "Unmerged paths" and indicates active operation.

**If fail:** `git status` shows clean tree but you expected conflicts? Operation may have already been completed or aborted. Check `git log` for recent activity.

### Step 2: Read Conflict Markers

Open each conflicting file. Locate conflict markers:

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` to `=======`: Your current branch (or branch you are rebasing onto)
- `=======` to `>>>>>>>`: Incoming changes (branch being merged or commit being applied)

**Got:** Each conflicting file contains one or more blocks with `<<<<<<<`, `=======`, `>>>>>>>` markers.

**If fail:** No markers found but files show as conflicting? Conflict may be binary file or deleted-vs-modified conflict. Check `git diff --name-only --diff-filter=U` for full list.

### Step 3: Choose Resolution Strategy

**Manual merge** (most common): Edit file to combine both changes logically. Then remove all conflict markers.

**Accept ours** (keep current branch version):

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**Accept theirs** (keep incoming branch version):

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**Got:** After resolution, file contains correct merged content with no remaining conflict markers.

**If fail:** Chose wrong side? Re-read conflicting version from merge base. During merge, `git checkout -m path/to/file` re-creates conflict markers so you can try again.

### Step 4: Mark Files as Resolved

After editing each conflicting file:

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

Repeat for every file listed under "Unmerged paths".

**Got:** All files move from "Unmerged paths" to "Changes to be committed". No conflict markers remain in any file.

**If fail:** `git add` fails or markers remain? Re-open file and ensure all `<<<<<<<`, `=======`, `>>>>>>>` lines removed.

### Step 5: Continue the Operation

Once all conflicts resolved:

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

**Got:** Operation completes. `git status` shows clean working tree (or moves to next commit during rebase).

**If fail:** Continue command fails? Check `git status` for remaining unresolved files. All conflicts must be resolved before continue.

### Step 6: Abort if Needed

Resolution too complex or chose wrong approach? Abort safely:

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**Got:** Repository returns to state before operation started. No data loss.

**If fail:** Abort fails (rare)? Check `git reflog` to find commit before operation. Then `git reset --hard <commit>` to restore it. Use with caution — discards uncommitted changes.

### Step 7: Verify Resolution

After operation completes:

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**Got:** Clean working tree, correct merge history, tests pass.

**If fail:** Tests fail after resolution? Merge may have introduced logical errors even though syntax conflicts resolved. Review diff careful and fix.

## Checks

- [ ] No conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) remain in any file
- [ ] `git status` shows clean working tree
- [ ] Merge/rebase history correct in `git log`
- [ ] Tests pass after conflict resolution
- [ ] No unintended changes introduced

## Pitfalls

- **Blindly accept one side**: `--ours` or `--theirs` discards other side entirely. Only use when certain one version completely correct.
- **Leave conflict markers in code**: Always search entire file for remaining markers after editing. Partial resolution breaks the code.
- **Amend during rebase**: During interactive rebase, do not `--amend` unless rebase step specifically calls for it. Use `git rebase --continue` instead.
- **Lose work on abort**: `git rebase --abort` and `git merge --abort` discard all resolution work. Only abort if want to start over.
- **No test after resolution**: Syntactically clean merge can still be logically wrong. Always run tests.
- **Force-push after rebase**: After rebasing shared branch, coordinate with collaborators before force-pushing — it rewrites history.

## See Also

- `commit-changes` - committing after conflict resolution
- `manage-git-branches` - branch workflows that lead to conflicts
- `configure-git-repository` - repository setup and merge strategies
