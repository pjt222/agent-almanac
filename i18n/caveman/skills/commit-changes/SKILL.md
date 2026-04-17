---
name: commit-changes
description: >
  Stage, commit, amend changes with conventional commit messages.
  Cover review changes, selective staging, write descriptive commit
  messages with HEREDOC format, verify commit history. Use when save
  logical unit of work to version control, create commit with conventional
  message, amend most recent commit, review staged changes before commit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: caveman
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# Commit Changes

Stage files selective. Write clear commit messages. Verify commit history.

## When Use

- Save logical unit of work to version control
- Create commit with descriptive, conventional message
- Amend most recent commit (message or content)
- Review what commit before commit

## Inputs

- **Required**: One or more changed files to commit
- **Optional**: Commit message (drafted if not given)
- **Optional**: Whether amend previous commit
- **Optional**: Co-author attribution

## Steps

### Step 1: Review Current Changes

Check working tree status. Inspect diffs.

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

**Got:** Clear picture of all modified, staged, untracked files.

**If fail:** `git status` fail? Verify inside git repo (`git rev-parse --is-inside-work-tree`).

### Step 2: Stage Files Selective

Stage specific files. Avoid `git add .` or `git add -A` — may grab sensitive files or unrelated changes.

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

Review staged before commit.

```bash
git diff --staged
```

**Got:** Only intended files and changes staged. No `.env`, credentials, large binaries.

**If fail:** Unstage accidental files with `git reset HEAD <file>`. Sensitive data staged? Unstage now, before commit.

### Step 3: Write Commit Message

Use conventional commits format. Always pass message via HEREDOC for proper formatting.

```bash
git commit -m "$(cat <<'EOF'
feat: add weighted mean calculation

Implements weighted_mean() with support for NA handling and
zero-weight filtering. Includes input validation for mismatched
vector lengths.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Conventional commit types:

| Type | When use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Add or update tests |
| `refactor` | Code change — no fix, no new feature |
| `chore` | Build, CI, dependency updates |
| `style` | Formatting, whitespace (no logic change) |

**Got:** Commit created with descriptive message. Explains *why*, not just *what*.

**If fail:** Pre-commit hook fail? Fix issue, re-stage with `git add`, create **new** commit. No `--amend` — failed commit never created.

### Step 4: Amend Last Commit (Optional)

Only amend if commit **not** pushed to shared remote.

```bash
# Amend message only
git commit --amend -m "$(cat <<'EOF'
fix: correct weighted mean edge case for empty vectors

EOF
)"

# Amend with additional staged changes
git add forgotten-file.R
git commit --amend --no-edit
```

**Got:** Previous commit updated in-place. `git log -1` shows amended content.

**If fail:** Commit already pushed? No amend. Create new commit. Force-push amended commits to shared branches breaks history.

### Step 5: Verify Commit

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

**Got:** Commit appears in history with correct message, author, file changes.

**If fail:** Commit has wrong files? Use `git reset --soft HEAD~1` to undo commit, keep changes staged. Re-commit correct.

## Checks

- [ ] Only intended files in commit
- [ ] No sensitive data (tokens, passwords, `.env` files) committed
- [ ] Commit message follows conventional commits format
- [ ] Message body explains *why* change made
- [ ] `git log` shows commit with correct metadata
- [ ] Pre-commit hooks (if any) passed

## Pitfalls

- **Commit too much at once**: Each commit = one logical change. Split unrelated changes into separate commits.
- **Using `git add .` blind**: Always review `git status` first. Prefer stage specific files by name.
- **Amend pushed commits**: Never amend commits pushed to shared branch. Rewrites history. Breaks collaborators.
- **Vague commit messages**: "fix bug" or "update" tells nothing. Describe what changed and why.
- **Forget `--no-edit` on content amends**: Adding forgotten files to last commit? Use `--no-edit` — keeps existing message.
- **Hook fail leading to `--amend`**: Pre-commit hook fail → commit never created. `--amend` would modify *previous* commit. Always create new commit after fix hook issues.

## See Also

- `manage-git-branches` - branch workflow before commit
- `create-pull-request` - next step after commit
- `resolve-git-conflicts` - handle conflicts during merge/rebase
- `configure-git-repository` - repo setup and conventions
