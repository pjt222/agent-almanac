---
name: configure-git-repository
locale: caveman-ultra
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

Set up Git repo w/ appropriate config for project type.

## Use When

- Init version control for new project
- Add `.gitignore` for specific language/framework
- Set up branch protection + conventions
- Configure commit hooks

## In

- **Required**: Project dir
- **Required**: Project type (R pkg, Node.js, Python, general)
- **Optional**: Remote repo URL
- **Optional**: Branch strategy (trunk-based, Git Flow)
- **Optional**: Commit msg convention

## Do

### Step 1: Initialize Repo

```bash
cd /path/to/project
git init
git branch -M main
```

**→** `.git/` dir created. Default branch = `main`.

**If err:** `git init` fails → ensure Git installed (`git --version`). Dir already has `.git/` → repo already init'd → skip step.

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

**→** `.gitignore` created w/ entries for project type. Sensitive files (`.Renviron`, `.env`) + generated artifacts excluded.

**If err:** Unsure which entries → use `gitignore.io` or GitHub's `.gitignore` templates as starting point, customize.

### Step 3: Create Initial Commit

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**→** First commit w/ `.gitignore` + initial project files. `git log` shows one commit.

**If err:** "Nothing to commit" → ensure files staged w/ `git add`. Author identity err → set `git config user.name` + `git config user.email`.

### Step 4: Connect Remote

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**→** Remote `origin` config'd. `git remote -v` shows fetch + push URLs. Initial commit pushed.

**If err:** Push fails "Permission denied (publickey)" → configure SSH keys (see `setup-wsl-dev-environment`). Remote already exists → update w/ `git remote set-url origin <url>`.

### Step 5: Set Up Branch Conventions

**Trunk-based (rec'd for small teams)**:

- `main`: prod-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**→** Branch naming convention established + doc'd. Team knows which prefix to use for each work type.

**If err:** Branches already named inconsistent → rename w/ `git branch -m old-name new-name` + update any open PRs.

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

**→** Commit msg convention doc'd + agreed. Future commits follow `type: description` format.

**If err:** Team not following → enforce w/ commit-msg hook validating format (see Step 7).

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

**→** Pre-commit hook runs auto on each `git commit`. Lint errs block commit until fixed.

**If err:** Hook doesn't run → valid. `core.hooksPath` set (`git config core.hooksPath`) + hook file executable (`chmod +x`).

### Step 8: Create README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**→** `README.md` committed. Project has minimal but informative landing page on GitHub.

**If err:** `README.md` already exists → update vs. overwrite. R projects → use `usethis::use_readme_md()` for template w/ badges.

## Check

- [ ] `.gitignore` excludes sensitive + generated files
- [ ] No sensitive data (tokens, passwords) in tracked files
- [ ] Remote repo connected + accessible
- [ ] Branch naming conventions doc'd
- [ ] Initial commit clean

## Traps

- **Commit before .gitignore**: Add `.gitignore` first. Files already tracked unaffected by later `.gitignore` entries.
- **Sensitive data in history**: Secrets committed → remain in history even after deletion. Use `git filter-repo` or BFG to clean.
- **Large binary files**: Don't commit large binaries. Use Git LFS for files > 1MB.
- **Line endings**: Set `core.autocrlf=input` on Windows/WSL → prevent CRLF/LF issues.

## →

- `commit-changes` - staging + committing workflow
- `manage-git-branches` - branch creation + conventions
- `create-r-package` - Git setup as part of R pkg creation
- `setup-wsl-dev-environment` - Git install + SSH keys
- `create-github-release` - creating releases from repo
- `security-audit-codebase` - check for committed secrets
