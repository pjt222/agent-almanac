---
title: "クイックリファレンス"
description: "エージェント、スキル、チーム、Git、R、シェル操作のコマンドチートシート"
category: reference
agents: []
teams: []
skills: []
locale: ja
source_locale: en
source_commit: 33b561c9
fence_basis_commit: 33b561c9
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# クイックリファレンス

Claude Codeを通じたエージェント、スキル、チームの呼び出しに加え、Git、R、シェル、WSLの必須コマンドのチートシート。

## エージェント、スキル、チーム

### スキルの呼び出し（スラッシュコマンド）

スキルは `.claude/skills/` にシンボリックリンクを作成すると、Claude Codeのスラッシュコマンドとして利用できる:

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

会話の中でスキルを参照することもできる: 「create-r-packageスキルを使ってスキャフォールドしてください」

### エージェントの起動

エージェントはClaude CodeのTaskツールを通じてサブエージェントとして起動される。Claude Codeに直接依頼する:

```text
"r-developerエージェントを使ってRcpp連携を追加してください"
"security-analystを起動してこのコードベースを監査してください"
"code-reviewerにこのPRをチェックさせてください"
```

エージェントは `.claude/agents/`（このプロジェクトでは `agents/` へのシンボリックリンク）から検出される。

### チームの有効化

チームはTeamCreateで作成され、タスクリストで管理される:

```text
"r-package-reviewチームを作成してこのパッケージをレビューしてください"
"このスプリントのためにscrum-teamを立ち上げてください"
"瞑想セッションのためにtendingチームを開始してください"
```

利用可能なチーム: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology

### レジストリ検索

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

### README自動生成

```bash
# Regenerate all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (CI dry-run)
npm run check-readmes
```

## WSL-Windows連携

### パス変換

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

## Rパッケージ開発

### 開発サイクル

```r
devtools::load_all()        # Load package for development
devtools::document()        # Update documentation
devtools::test()            # Run tests
devtools::check()           # Full package check
devtools::install()         # Install package
```

### クイックチェック

```r
devtools::test_file("tests/testthat/test-feature.R")
devtools::run_examples()
devtools::spell_check()
urlchecker::url_check()
```

### CRAN提出

```r
devtools::check_win_devel()     # Windows builder
devtools::check_win_release()   # Windows builder
rhub::rhub_check()              # R-hub multi-platform
devtools::release()             # Interactive CRAN submission
```

### スキャフォールディング

```r
usethis::use_r("function_name")           # New R file
usethis::use_test("function_name")        # New test file
usethis::use_vignette("guide_name")       # New vignette
usethis::use_mit_license()                # Add MIT license
usethis::use_github_action_check_standard() # CI/CD
```

## Gitコマンド

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

### リモート操作

```bash
git remote -v              # List remotes
git fetch origin           # Fetch changes
git pull origin main       # Pull and merge
git push origin main       # Push to remote
git push -u origin branch  # Push new branch
```

### 便利なエイリアス

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
```

## Claude CodeとMCP

### セッション管理

```bash
claude                     # Start Claude Code
claude mcp list            # List configured MCP servers
claude mcp get r-mcptools  # Get server details
```

### 設定ファイル

```text
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCPサーバー

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

## シェルコマンド

### ナビゲーションと検索

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

### ファイル操作

```bash
mkdir -p path/to/dir       # Create nested directories
cp -r source/ dest/        # Copy directory recursively
tar -czf archive.tar.gz dir/  # Create compressed tar
tar -xzf archive.tar.gz      # Extract tar.gz
du -sh directory           # Directory size
df -h                      # Disk space usage
```

### プロセス管理

```bash
htop                       # Interactive process viewer
ps aux | grep process      # Find specific process
kill PID                   # Kill process by ID
```

## キーボードショートカット

### ターミナル（Bash）

```text
Ctrl+A    行頭へ移動              Ctrl+E    行末へ移動
Ctrl+K    行末まで削除            Ctrl+U    行頭まで削除
Ctrl+W    直前の単語を削除        Ctrl+R    履歴検索
Ctrl+L    画面クリア              Ctrl+C    コマンドキャンセル
```

### tmux

```text
Ctrl+A |       縦分割              Ctrl+A -      横分割
Ctrl+A arrows  ペイン間移動        Ctrl+A d      セッションデタッチ
```

### VS Code

```text
Ctrl+`         ターミナルを開く    Ctrl+P        クイックオープン
Ctrl+Shift+P   コマンドパレット    F1            コマンドパレット
```

## 環境変数

```bash
printenv              # All environment variables
echo $PATH            # PATH variable
export VAR=value      # Set for current session

# Set permanently
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## パッケージマネージャー

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

## トラブルシューティング

### Rパッケージの問題

```bash
which R                               # R location
R --version                           # R version
Rscript -e ".libPaths()"             # Library paths
echo $RSTUDIO_PANDOC                  # Check pandoc path
```

### WSLの問題

```bash
wsl --list --verbose   # List WSL distributions
wsl --status           # WSL status
ip addr                # IP addresses
```

### Gitの問題

```bash
git config --list          # Show all config
git remote show origin     # Show remote details
git status --porcelain     # Machine-readable status
```

## 関連リソース

- [環境構築](setting-up-your-environment.md) -- 完全なセットアップガイド
- [Rパッケージ開発](r-package-development.md) -- Rパッケージの完全なワークフロー
- [システムの理解](understanding-the-system.md) -- エージェント、スキル、チームの仕組み
- [スキルライブラリ](../skills/) -- 全278スキル
- [エージェントライブラリ](../agents/) -- 全59エージェント
- [チームライブラリ](../teams/) -- 全10チーム
