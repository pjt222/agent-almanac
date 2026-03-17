---
name: configure-git-repository
description: >
  为 Git 仓库配置适当的 .gitignore、分支策略、提交规范、钩子及远程仓库设置。
  涵盖初始化配置以及 R、Node.js 和 Python 项目的常见模式。适用于为新项目
  初始化版本控制、为特定语言或框架添加 .gitignore、设置分支保护与规范，
  或配置提交钩子。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
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

# 配置 Git 仓库

为项目类型设置具有适当配置的 Git 仓库。

## 适用场景

- 为新项目初始化版本控制
- 为特定语言/框架添加 `.gitignore`
- 设置分支保护与规范
- 配置提交钩子

## 输入

- **必需**：项目目录
- **必需**：项目类型（R 包、Node.js、Python、通用）
- **可选**：远程仓库 URL
- **可选**：分支策略（主干开发、Git Flow）
- **可选**：提交消息规范

## 步骤

### 第 1 步：初始化仓库

```bash
cd /path/to/project
git init
git branch -M main
```

**预期结果：** 创建 `.git/` 目录，默认分支命名为 `main`。

**失败处理：** 若 `git init` 失败，请确认 Git 已安装（`git --version`）。若目录中已存在 `.git/`，则仓库已初始化，跳过此步骤。

### 第 2 步：创建 .gitignore

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

**预期结果：** 创建包含适合项目类型条目的 `.gitignore` 文件，敏感文件（`.Renviron`、`.env`）和生成产物被排除在外。

**失败处理：** 若不确定应包含哪些条目，可使用 `gitignore.io` 或 GitHub 的 `.gitignore` 模板作为起点，再根据项目进行定制。

### 第 3 步：创建初始提交

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**预期结果：** 创建包含 `.gitignore` 和初始项目文件的第一个提交，`git log` 显示一条提交记录。

**失败处理：** 若 `git commit` 提示"nothing to commit"，请确认已通过 `git add` 暂存文件。若提示作者身份错误，请设置 `git config user.name` 和 `git config user.email`。

### 第 4 步：连接远程仓库

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**预期结果：** 远程 `origin` 配置完成，`git remote -v` 显示 fetch 和 push 的 URL，初始提交已推送到远程。

**失败处理：** 若推送失败并提示"Permission denied (publickey)"，请配置 SSH 密钥（参见 `setup-wsl-dev-environment`）。若远程已存在，使用 `git remote set-url origin <url>` 更新。

### 第 5 步：设置分支规范

**主干开发（适合小团队，推荐）**：

- `main`：生产就绪代码
- 功能分支：`feature/description`
- 问题修复：`fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**预期结果：** 分支命名规范已建立并有文档记录，团队成员清楚各类工作使用哪种前缀。

**失败处理：** 若分支命名已不一致，使用 `git branch -m old-name new-name` 重命名，并更新所有开放中的 PR。

### 第 6 步：配置提交规范

约定式提交（Conventional Commits）格式：

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**预期结果：** 提交消息规范已有文档记录并获团队认可，后续提交遵循 `type: description` 格式。

**失败处理：** 若团队成员未遵守规范，可通过 commit-msg 钩子强制验证格式（参见第 7 步）。

### 第 7 步：设置预提交钩子（可选）

创建 `.githooks/pre-commit`：

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

**预期结果：** 预提交钩子在每次 `git commit` 时自动运行，代码规范错误会阻止提交直至修复。

**失败处理：** 若钩子未运行，请验证 `core.hooksPath` 是否已设置（`git config core.hooksPath`），并确认钩子文件有可执行权限（`chmod +x`）。

### 第 8 步：创建 README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**预期结果：** `README.md` 已提交到仓库，项目在 GitHub 上有一个简洁但有参考价值的首页。

**失败处理：** 若 `README.md` 已存在，请更新而非覆盖。在 R 项目中可使用 `usethis::use_readme_md()` 生成带有徽章的模板。

## 验证清单

- [ ] `.gitignore` 排除了敏感文件和生成产物
- [ ] 跟踪的文件中不含敏感数据（令牌、密码）
- [ ] 远程仓库已连接且可访问
- [ ] 分支命名规范已有文档记录
- [ ] 初始提交已干净创建

## 常见问题

- **在 .gitignore 之前提交**：请先添加 `.gitignore`。已跟踪的文件不受后续 `.gitignore` 条目影响。
- **历史记录中含敏感数据**：若密钥已提交，即使删除后仍保留在历史中，需使用 `git filter-repo` 或 BFG 清理。
- **大型二进制文件**：不要提交大型二进制文件，超过 1MB 的文件应使用 Git LFS。
- **换行符问题**：在 Windows/WSL 上设置 `core.autocrlf=input`，以防止 CRLF/LF 问题。

## 相关技能

- `commit-changes` — 暂存与提交工作流
- `manage-git-branches` — 分支创建与规范
- `create-r-package` — 作为 R 包创建流程的一部分进行 Git 配置
- `setup-wsl-dev-environment` — Git 安装与 SSH 密钥
- `create-github-release` — 从仓库创建发布版本
- `security-audit-codebase` — 检查已提交的密钥
