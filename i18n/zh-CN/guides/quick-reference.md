---
title: "快速参考"
description: "智能体、技能、团队、Git、R 和 shell 操作的命令速查表"
category: reference
agents: []
teams: []
skills: []
locale: zh-CN
source_locale: en
source_commit: befb7ac1
translator: Claude Opus 4.6
translation_date: "2026-03-13"
---

# 快速参考

通过 Claude Code 调用智能体、技能和团队的命令速查表，以及常用的 Git、R、shell 和 WSL 命令。

## 智能体、技能和团队

### 调用技能（斜杠命令）

技能在符号链接到 `.claude/skills/` 后可作为 Claude Code 的斜杠命令使用：

```bash
# 将技能设为斜杠命令
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# 在 Claude Code 中调用：
/submit-to-cran

# 其他示例
/commit-changes
/security-audit-codebase
/review-skill-format
```

也可以在对话中直接引用技能："使用 create-r-package 技能来搭建这个包。"

### 生成智能体

智能体通过 Claude Code 的 Task 工具作为子智能体生成。直接向 Claude Code 发出请求：

```
"使用 r-developer 智能体添加 Rcpp 集成"
"生成 security-analyst 来审计这个代码库"
"让 code-reviewer 检查这个 PR"
```

智能体从 `.claude/agents/`（在本项目中符号链接到 `agents/`）中发现。

### 创建团队

团队通过 TeamCreate 创建并通过任务列表管理：

```
"创建 r-package-review 团队来审查这个包"
"启动 scrum-team 进行这个冲刺"
"启动 tending 团队进行冥想会话"
```

可用团队：r-package-review、gxp-compliance-validation、fullstack-web-dev、ml-data-science-review、devops-platform-engineering、tending、scrum-team、opaque-team、agentskills-alignment、entomology。

### 注册表查询

```bash
# 统计技能、智能体、团队数量
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# 列出所有领域
grep "^  [a-z]" skills/_registry.yml | head -50

# 列出所有智能体
grep "^  - id:" agents/_registry.yml

# 列出所有团队
grep "^  - id:" teams/_registry.yml
```

### README 自动化

```bash
# 从注册表重新生成所有 README
npm run update-readmes

# 检查 README 是否最新（CI 预检）
npm run check-readmes
```

## WSL-Windows 集成

### 路径转换

```bash
# Windows 到 WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# 从 WSL 访问 Windows R（调整版本号）
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# 在 Windows 资源管理器中打开当前目录
explorer.exe .
```

## R 包开发

### 开发循环

```r
devtools::load_all()        # 加载包用于开发
devtools::document()        # 更新文档
devtools::test()            # 运行测试
devtools::check()           # 完整包检查
devtools::install()         # 安装包
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
devtools::check_win_devel()     # Windows 构建器
devtools::check_win_release()   # Windows 构建器
rhub::rhub_check()              # R-hub 多平台
devtools::release()             # 交互式 CRAN 提交
```

### 脚手架

```r
usethis::use_r("function_name")           # 新 R 文件
usethis::use_test("function_name")        # 新测试文件
usethis::use_vignette("guide_name")       # 新 vignette
usethis::use_mit_license()                # 添加 MIT 许可证
usethis::use_github_action_check_standard() # CI/CD
```

## Git 命令

### 日常操作

```bash
git status                 # 显示工作树状态
git diff                   # 显示未暂存的变更
git diff --staged          # 显示已暂存的变更
git log --oneline -10      # 最近的提交

git add filename           # 暂存特定文件
git commit -m "message"    # 带消息提交
git commit --amend         # 修改上一次提交

git checkout -b new-branch # 创建并切换到分支
git merge feature-branch   # 合并分支
```

### 远程操作

```bash
git remote -v              # 列出远程仓库
git fetch origin           # 获取变更
git pull origin main       # 拉取并合并
git push origin main       # 推送到远程
git push -u origin branch  # 推送新分支
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
claude                     # 启动 Claude Code
claude mcp list            # 列出已配置的 MCP 服务器
claude mcp get r-mcptools  # 获取服务器详情
```

### 配置文件

```
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCP 服务器

```bash
# R 集成
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
pwd                        # 显示当前工作目录
ls -la                     # 列出文件详情
tree                       # 显示目录树
z project-name             # 跳转到常用目录

rg "pattern"               # Ripgrep 搜索
rg -t r "pattern"          # 仅搜索 R 文件
fd "pattern"               # 友好的 find 替代
fd -e R                    # 按扩展名查找
```

### 文件操作

```bash
mkdir -p path/to/dir       # 创建嵌套目录
cp -r source/ dest/        # 递归复制目录
tar -czf archive.tar.gz dir/  # 创建压缩包
tar -xzf archive.tar.gz      # 解压压缩包
du -sh directory           # 目录大小
df -h                      # 磁盘使用情况
```

### 进程管理

```bash
htop                       # 交互式进程查看器
ps aux | grep process      # 查找特定进程
kill PID                   # 按 ID 终止进程
```

## 键盘快捷键

### 终端 (Bash)

```
Ctrl+A    跳到行首              Ctrl+E    跳到行尾
Ctrl+K    删除到行尾            Ctrl+U    删除到行首
Ctrl+W    删除前一个词          Ctrl+R    搜索历史
Ctrl+L    清屏                  Ctrl+C    取消命令
```

### tmux

```
Ctrl+A |       垂直分割         Ctrl+A -      水平分割
Ctrl+A arrows  导航窗格         Ctrl+A d      分离会话
```

### VS Code

```
Ctrl+`         打开终端          Ctrl+P        快速打开文件
Ctrl+Shift+P   命令面板          F1            命令面板
```

## 环境变量

```bash
printenv              # 所有环境变量
echo $PATH            # PATH 变量
export VAR=value      # 设置当前会话变量

# 永久设置
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## 包管理器

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # 全局安装
npm list -g --depth=0        # 列出全局包

# R (renv)
renv::init()                 # 初始化 renv
renv::install("package")     # 安装包
renv::snapshot()             # 保存锁文件
renv::restore()              # 从锁文件恢复
```

## 故障排除

### R 包问题

```bash
which R                               # R 所在位置
R --version                           # R 版本
Rscript -e ".libPaths()"             # 库路径
echo $RSTUDIO_PANDOC                  # 检查 pandoc 路径
```

### WSL 问题

```bash
wsl --list --verbose   # 列出 WSL 发行版
wsl --status           # WSL 状态
ip addr                # IP 地址
```

### Git 问题

```bash
git config --list          # 显示所有配置
git remote show origin     # 显示远程详情
git status --porcelain     # 机器可读状态
```

## 相关资源

- [环境搭建](setting-up-your-environment.md) -- 完整的环境搭建指南
- [R 包开发](r-package-development.md) -- 完整的 R 包工作流
- [理解系统](understanding-the-system.md) -- 智能体、技能、团队的工作原理
- [技能库](../skills/) -- 全部 278 个技能
- [智能体库](../agents/) -- 全部 59 个智能体
- [团队库](../teams/) -- 全部 10 个团队
