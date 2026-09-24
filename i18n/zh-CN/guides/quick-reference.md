---
title: "快速参考"
description: "智能体、技能、团队、Git、R 和 shell 操作的命令速查表"
category: reference
agents: []
teams: []
skills: []
locale: zh-CN
source_locale: en
source_commit: 33b561c9
fence_basis_commit: 33b561c9
translator: Claude Opus 4.6
translation_date: "2026-03-13"
---

# 快速参考

通过 Claude Code 调用智能体、技能和团队的命令速查表，以及常用的 Git、R、shell 和 WSL 命令。

## 智能体、技能和团队

### 调用技能（斜杠命令）

技能在符号链接到 `.claude/skills/` 后可作为 Claude Code 的斜杠命令使用：

```bash
# Make a skill available as a slash command
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# In Claude Code, invoke with:
/submit-to-cran

# Other examples
/commit-changes
/security-audit-codebase
/review-skill-format
```

也可以在对话中直接引用技能："使用 create-r-package 技能来搭建这个包。"

### 生成智能体

智能体通过 Claude Code 的 Task 工具作为子智能体生成。直接向 Claude Code 发出请求：

```text
"使用 r-developer 智能体添加 Rcpp 集成"
"生成 security-analyst 来审计这个代码库"
"让 code-reviewer 检查这个 PR"
```

智能体从 `.claude/agents/`（在本项目中符号链接到 `agents/`）中发现。

### 创建团队

团队通过 TeamCreate 创建并通过任务列表管理：

```text
"创建 r-package-review 团队来审查这个包"
"启动 scrum-team 进行这个冲刺"
"启动 tending 团队进行冥想会话"
```

可用团队：r-package-review、gxp-compliance-validation、fullstack-web-dev、ml-data-science-review、devops-platform-engineering、tending、scrum-team、opaque-team、agentskills-alignment、entomology。

### 注册表查询

```bash
# Count skills, agents, teams
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# List all domains
grep "^  [a-z]" skills/_registry.yml | head -50

# List all agents
grep "^  - id:" agents/_registry.yml

# List all teams
grep "^  - id:" teams/_registry.yml
```

### README 自动化

```bash
# Regenerate all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (CI dry-run)
npm run check-readmes
```

## WSL-Windows 集成

### 路径转换

```bash
# Windows to WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# Access Windows R from WSL (adjust version)
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# Open current directory in Windows Explorer
explorer.exe .
```

## R 包开发

### 开发循环

```r
devtools::load_all()        # Load package for development
devtools::document()        # Update documentation
devtools::test()            # Run tests
devtools::check()           # Full package check
devtools::install()         # Install package
```

### 快速检查

```r
devtools::test_file("tests/testthat/test-feature.R")
devtools::run_examples()
devtools::spell_check()
urlchecker::url_check()
```

### CRAN 提交

```r
devtools::check_win_devel()     # Windows builder
devtools::check_win_release()   # Windows builder
rhub::rhub_check()              # R-hub multi-platform
devtools::release()             # Interactive CRAN submission
```

### 脚手架

```r
usethis::use_r("function_name")           # New R file
usethis::use_test("function_name")        # New test file
usethis::use_vignette("guide_name")       # New vignette
usethis::use_mit_license()                # Add MIT license
usethis::use_github_action_check_standard() # CI/CD
```

## Git 命令

### 日常操作

```bash
git status                 # Show working tree status
git diff                   # Show unstaged changes
git diff --staged          # Show staged changes
git log --oneline -10      # Recent commits

git add filename           # Stage specific file
git commit -m "message"    # Commit with message
git commit --amend         # Amend last commit

git checkout -b new-branch # Create and switch to branch
git merge feature-branch   # Merge branch
```

### 远程操作

```bash
git remote -v              # List remotes
git fetch origin           # Fetch changes
git pull origin main       # Pull and merge
git push origin main       # Push to remote
git push -u origin branch  # Push new branch
```

### 常用别名

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
```

## Claude Code 和 MCP

### 会话管理

```bash
claude                     # Start Claude Code
claude mcp list            # List configured MCP servers
claude mcp get r-mcptools  # Get server details
```

### 配置文件

```text
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCP 服务器

```bash
# R integration
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -e "mcptools::mcp_server()"

# Hugging Face
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

## Shell 命令

### 导航和搜索

```bash
pwd                        # Print working directory
ls -la                     # List files with details
tree                       # Show directory tree
z project-name             # Jump to frequent directory

rg "pattern"               # Ripgrep search
rg -t r "pattern"          # Search only R files
fd "pattern"               # User-friendly find
fd -e R                    # Find by extension
```

### 文件操作

```bash
mkdir -p path/to/dir       # Create nested directories
cp -r source/ dest/        # Copy directory recursively
tar -czf archive.tar.gz dir/  # Create compressed tar
tar -xzf archive.tar.gz      # Extract tar.gz
du -sh directory           # Directory size
df -h                      # Disk space usage
```

### 进程管理

```bash
htop                       # Interactive process viewer
ps aux | grep process      # Find specific process
kill PID                   # Kill process by ID
```

## 键盘快捷键

### 终端 (Bash)

```text
Ctrl+A    跳到行首              Ctrl+E    跳到行尾
Ctrl+K    删除到行尾            Ctrl+U    删除到行首
Ctrl+W    删除前一个词          Ctrl+R    搜索历史
Ctrl+L    清屏                  Ctrl+C    取消命令
```

### tmux

```text
Ctrl+A |       垂直分割         Ctrl+A -      水平分割
Ctrl+A arrows  导航窗格         Ctrl+A d      分离会话
```

### VS Code

```text
Ctrl+`         打开终端          Ctrl+P        快速打开文件
Ctrl+Shift+P   命令面板          F1            命令面板
```

## 环境变量

```bash
printenv              # All environment variables
echo $PATH            # PATH variable
export VAR=value      # Set for current session

# Set permanently
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## 包管理器

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # Install globally
npm list -g --depth=0        # List global packages

# R (renv)
renv::init()                 # Initialize renv
renv::install("package")     # Install package
renv::snapshot()             # Save lockfile
renv::restore()              # Restore from lockfile
```

## 故障排除

### R 包问题

```bash
which R                               # R location
R --version                           # R version
Rscript -e ".libPaths()"             # Library paths
echo $RSTUDIO_PANDOC                  # Check pandoc path
```

### WSL 问题

```bash
wsl --list --verbose   # List WSL distributions
wsl --status           # WSL status
ip addr                # IP addresses
```

### Git 问题

```bash
git config --list          # Show all config
git remote show origin     # Show remote details
git status --porcelain     # Machine-readable status
```

## 相关资源

- [环境搭建](setting-up-your-environment.md) -- 完整的环境搭建指南
- [R 包开发](r-package-development.md) -- 完整的 R 包工作流
- [理解系统](understanding-the-system.md) -- 智能体、技能、团队的工作原理
- [技能库](../skills/) -- 全部 278 个技能
- [智能体库](../agents/) -- 全部 59 个智能体
- [团队库](../teams/) -- 全部 10 个团队
