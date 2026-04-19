---
name: configure-git-repository
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure a Git repository with proper .gitignore, branch strategy,
  commit conventions, hooks, and remote setup. Covers initial setup
  and common patterns for R, Node.js, and Python projects. Use when
  initializing version control for a new project, adding a .gitignore
  for a specific language or framework, setting up branch protection and
  conventions, or configuring commit hooks.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, version-control, gitignore, hooks, branching
---

# Configure Git Repository

Set up Git repo with appropriate config for project type.

## When Use

- Initialize version control for new project
- Add `.gitignore` for specific language/framework
- Set up branch protection, conventions
- Configure commit hooks

## Inputs

- **Required**: Project directory
- **Required**: Project type (R package, Node.js, Python, general)
- **Optional**: Remote repo URL
- **Optional**: Branch strategy (trunk-based, Git Flow)
- **Optional**: Commit message convention

## Steps

### Step 1: Initialize Repository

```bash
cd /path/to/project
git init
git branch -M main
```

**Got:** `.git/` directory created. Default branch named `main`.

**If fail:** `git init` fails? Ensure Git installed (`git --version`). Directory already has `.git/`? Repo already initialized — skip.

### Step 2: Create .gitignore

**R Package**:

```gitignore
# R artifacts
.Rhistory
.RData
.Rproj.user/
*.Rproj

# Environment (sensitive)
.Renviron

# renv library (machine-specific)
renv/library/
renv/staging/
renv/cache/

# Build artifacts
*.tar.gz
src/*.o
src/*.so
src/*.dll

# Documentation build
docs/
inst/doc/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

**Node.js/TypeScript**:

```gitignore
node_modules/
dist/
build/
.next/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
coverage/
```

**Python**:

```gitignore
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.eggs/
.venv/
venv/
.env
*.log
.mypy_cache/
.pytest_cache/
htmlcov/
.coverage
.DS_Store
.idea/
.vscode/
```

**Got:** `.gitignore` created with entries appropriate for project type. Sensitive files (`.Renviron`, `.env`) and generated artifacts excluded.

**If fail:** Unsure which entries to include? Use `gitignore.io` or GitHub `.gitignore` templates as starting point, customize for project.

### Step 3: Create Initial Commit

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**Got:** First commit created containing `.gitignore` and initial project files. `git log` shows one commit.

**If fail:** `git commit` fails with "nothing to commit"? Ensure files staged with `git add`. Fails with author identity error? Set `git config user.name` and `git config user.email`.

### Step 4: Connect Remote

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**Got:** Remote `origin` configured. `git remote -v` shows fetch and push URLs. Initial commit pushed to remote.

**If fail:** Push fails with "Permission denied (publickey)"? Configure SSH keys (see `setup-wsl-dev-environment`). Remote already exists? Update with `git remote set-url origin <url>`.

### Step 5: Set Up Branch Conventions

**Trunk-based (recommended for small teams)**:

- `main`: production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**Got:** Branch naming convention established, documented. Team members know which prefix to use for each type of work.

**If fail:** Branches already named inconsistently? Rename with `git branch -m old-name new-name`, update any open PRs.

### Step 6: Configure Commit Conventions

Conventional Commits format:

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**Got:** Commit message convention documented, agreed by team. Future commits follow `type: description` format.

**If fail:** Team members not following convention? Enforce with commit-msg hook that validates format (see Step 7).

### Step 7: Set Up Pre-Commit Hooks (Optional)

Create `.githooks/pre-commit`:

```bash
#!/bin/bash
# Run linter before commit

# For R packages
if [ -f "DESCRIPTION" ]; then
  Rscript -e "lintr::lint_package()" || exit 1
fi

# For Node.js
if [ -f "package.json" ]; then
  npm run lint || exit 1
fi
```

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

**Got:** Pre-commit hook runs automatically on each `git commit`. Linting errors block commit until fixed.

**If fail:** Hook does not run? Verify `core.hooksPath` set (`git config core.hooksPath`), hook file executable (`chmod +x`).

### Step 8: Create README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**Got:** `README.md` committed to repo. Project has minimal but informative landing page on GitHub.

**If fail:** `README.md` already exists? Update rather than overwrite. Use `usethis::use_readme_md()` in R projects for template with badges.

## Checks

- [ ] `.gitignore` excludes sensitive and generated files
- [ ] No sensitive data (tokens, passwords) in tracked files
- [ ] Remote repo connected, accessible
- [ ] Branch naming conventions documented
- [ ] Initial commit created cleanly

## Pitfalls

- **Committing before .gitignore**: Add `.gitignore` first. Files already tracked aren't affected by later `.gitignore` entries.
- **Sensitive data in history**: Secrets committed remain in history even after deletion. Use `git filter-repo` or BFG to clean.
- **Large binary files**: Don't commit large binaries. Use Git LFS for files > 1MB.
- **Line endings**: Set `core.autocrlf=input` on Windows/WSL to prevent CRLF/LF issues.

## See Also

- `commit-changes` - staging and committing workflow
- `manage-git-branches` - branch creation and conventions
- `create-r-package` - Git setup as part of R package creation
- `setup-wsl-dev-environment` - Git installation and SSH keys
- `create-github-release` - creating releases from repo
- `security-audit-codebase` - check for committed secrets
