---
name: commit-changes
description: >
  Stage, commit, amend w/ conventional msgs. Covers review, selective staging,
  HEREDOC msgs, history verify. Use → save logical unit, conventional commit,
  amend last, or review staged before commit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: caveman-ultra
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# Commit Changes

Stage selective → clear msg → verify history.

## Use When

- Save logical unit → version control
- Write conventional msg
- Amend last commit (msg or content)
- Review before commit

## In

- **Required**: Changed files
- **Optional**: Commit msg (drafted if none)
- **Optional**: Amend prev?
- **Optional**: Co-author

## Do

### Step 1: Review

Check tree + diffs:

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

→ Clear view all modified, staged, untracked.

If err: `git status` fails → verify inside repo (`git rev-parse --is-inside-work-tree`).

### Step 2: Stage Selective

Stage specific files, not `git add .` or `-A` → avoids secrets + unrelated changes:

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

Review staged before commit:

```bash
git diff --staged
```

→ Only intended files. No `.env`, creds, big binaries.

If err: accidental stage → `git reset HEAD <file>`. Secret staged → unstage immediately before commit.

### Step 3: Write Msg

Conventional format. Always HEREDOC → proper formatting:

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

Conventional types:

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Docs only |
| `test` | Add/update tests |
| `refactor` | No behavior change |
| `chore` | Build, CI, deps |
| `style` | Formatting, whitespace |

→ Commit created w/ msg explaining *why*, not *what*.

If err: pre-commit hook fails → fix, re-stage, create **new** commit (no `--amend` → failed commit never existed).

### Step 4: Amend Last (Optional)

Amend only if **not** pushed:

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

→ Prev commit updated in-place. `git log -1` shows amended.

If err: already pushed → no amend. New commit instead. Force-push → history divergence.

### Step 5: Verify

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

→ Commit in history w/ correct msg, author, files.

If err: wrong files → `git reset --soft HEAD~1` (undo, keep staged), re-commit.

## Check

- [ ] Only intended files committed
- [ ] No secrets (tokens, passwords, `.env`)
- [ ] Msg conventional
- [ ] Body explains *why*
- [ ] `git log` shows correct metadata
- [ ] Pre-commit hooks passed

## Traps

- **Too much at once**: One commit = one logical change. Split unrelated.
- **`git add .` blind**: Always `git status` first. Stage by name.
- **Amend pushed**: Never amend pushed commits → rewrites history, breaks collaborators.
- **Vague msgs**: "fix bug" tells nothing. Say what + why.
- **Forget `--no-edit`**: Content amend → use `--no-edit` → keeps msg.
- **Hook fail → `--amend`**: Hook fail = no commit. `--amend` hits *prev* commit. Always new commit after hook fix.

## →

- `manage-git-branches` — branch workflow before commit
- `create-pull-request` — next step after commit
- `resolve-git-conflicts` — merge/rebase conflicts
- `configure-git-repository` — repo setup + conventions
