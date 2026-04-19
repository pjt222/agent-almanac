---
name: configure-git-repository
locale: wenyan-ultra
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

# 配 Git 庫

依項類設 Git 庫之宜配。

## 用

- 新項初控
- 加 `.gitignore` 於某言/框
- 設支護與例
- 配 commit hook

## 入

- **必**：項目錄
- **必**：項類（R 包、Node.js、Python、通）
- **可**：遠庫 URL
- **可**：支策（trunk-based、Git Flow）
- **可**：提交訊息例

## 行

### 一：初庫

```bash
cd /path/to/project
git init
git branch -M main
```

**得：** `.git/` 已建。默支名 `main`。

**敗：** `git init` 敗→確 Git 已裝（`git --version`）。若已有 `.git/`→庫已初，略步。

### 二：建 .gitignore

**R 包**：

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

**Node.js/TypeScript**：

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

**Python**：

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

**得：** `.gitignore` 依項類建。敏檔（`.Renviron`、`.env`）與生物排。

**敗：** 不確入何→以 `gitignore.io` 或 GitHub 模起並改。

### 三：建初提交

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**得：** 首提交含 `.gitignore` 與初項檔。`git log` 示一提交。

**敗：** 「nothing to commit」→確已 `git add`。身份錯→設 `git config user.name` 與 `user.email`。

### 四：連遠

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**得：** 遠 `origin` 已配。`git remote -v` 示取推 URL。初提交已推。

**敗：** 「Permission denied (publickey)」→配 SSH（見 `setup-wsl-dev-environment`）。遠已在→`git remote set-url origin <url>` 更。

### 五：設支例

**Trunk-based**（小組宜）：

- `main`：生產就緒
- 功能支：`feature/description`
- 修錯：`fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**得：** 支名例已立且記。組員知各類工之前綴。

**敗：** 支名已異→`git branch -m old-name new-name` 更，更開 PR。

### 六：配提交例

Conventional Commits 格式：

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**得：** 提交訊息例已記且組同意。後提交守 `type: description`。

**敗：** 組員不守→以 commit-msg hook 執（見步七）。

### 七：設 pre-commit hook（選）

建 `.githooks/pre-commit`：

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

**得：** hook 於每 `git commit` 自行。lint 錯阻提交至修。

**敗：** hook 未行→驗 `core.hooksPath` 已設（`git config core.hooksPath`）且 hook 可行（`chmod +x`）。

### 八：建 README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**得：** `README.md` 已提。項於 GitHub 有簡有資之頁。

**敗：** `README.md` 已在→更勿覆。R 項用 `usethis::use_readme_md()` 取含 badge 之模。

## 驗

- [ ] `.gitignore` 排敏檔與生物
- [ ] 無敏數據（token、密）於追檔
- [ ] 遠庫已連可達
- [ ] 支名例已記
- [ ] 初提交淨建

## 忌

- **`.gitignore` 前提交**：先加 `.gitignore`。已追檔不受後 `.gitignore` 影響。
- **史中敏數據**：秘已提→即後刪仍留於史。`git filter-repo` 或 BFG 清。
- **大二進檔**：勿提大二進。>1MB 用 Git LFS。
- **行末**：Win/WSL 設 `core.autocrlf=input` 防 CRLF/LF 問。

## 參

- `commit-changes` - 暫存與提交流
- `manage-git-branches` - 支建與例
- `create-r-package` - R 包建中之 Git 設
- `setup-wsl-dev-environment` - Git 裝與 SSH
- `create-github-release` - 從庫建發布
- `security-audit-codebase` - 察所提之秘
