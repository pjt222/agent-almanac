---
title: "クイックリファレンス"
description: "エージェント、スキル、チーム、Git、R、シェル操作のコマンドチートシート"
category: reference
agents: []
teams: []
skills: []
locale: ja
source_locale: en
source_commit: befb7ac1
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# クイックリファレンス

Claude Codeを通じたエージェント、スキル、チームの呼び出しに加え、Git、R、シェル、WSLの必須コマンドのチートシート。

## エージェント、スキル、チーム

### スキルの呼び出し（スラッシュコマンド）

スキルは `.claude/skills/` にシンボリックリンクを作成すると、Claude Codeのスラッシュコマンドとして利用できる:

```bash
# スキルをスラッシュコマンドとして利用可能にする
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# Claude Code内での呼び出し:
/submit-to-cran

# その他の例
/commit-changes
/security-audit-codebase
/review-skill-format
```

会話の中でスキルを参照することもできる: 「create-r-packageスキルを使ってスキャフォールドしてください」

### エージェントの起動

エージェントはClaude CodeのTaskツールを通じてサブエージェントとして起動される。Claude Codeに直接依頼する:

```
"r-developerエージェントを使ってRcpp連携を追加してください"
"security-analystを起動してこのコードベースを監査してください"
"code-reviewerにこのPRをチェックさせてください"
```

エージェントは `.claude/agents/`（このプロジェクトでは `agents/` へのシンボリックリンク）から検出される。

### チームの有効化

チームはTeamCreateで作成され、タスクリストで管理される:

```
"r-package-reviewチームを作成してこのパッケージをレビューしてください"
"このスプリントのためにscrum-teamを立ち上げてください"
"瞑想セッションのためにtendingチームを開始してください"
```

利用可能なチーム: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology

### レジストリ検索

```bash
# スキル、エージェント、チームの数を確認
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# 全ドメインを一覧表示
grep "^  [a-z]" skills/_registry.yml | head -50

# 全エージェントを一覧表示
grep "^  - id:" agents/_registry.yml

# 全チームを一覧表示
grep "^  - id:" teams/_registry.yml
```

### README自動生成

```bash
# レジストリから全READMEを再生成
npm run update-readmes

# READMEが最新かチェック（CIドライラン）
npm run check-readmes
```

## WSL-Windows連携

### パス変換

```bash
# WindowsからWSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# WSLからWindows版Rにアクセス（バージョンに合わせて調整）
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# 現在のディレクトリをWindowsエクスプローラーで開く
explorer.exe .
```

## Rパッケージ開発

### 開発サイクル

```r
devtools::load_all()        # 開発用にパッケージをロード
devtools::document()        # ドキュメントを更新
devtools::test()            # テストを実行
devtools::check()           # パッケージの完全チェック
devtools::install()         # パッケージをインストール
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
devtools::check_win_devel()     # Windowsビルダー
devtools::check_win_release()   # Windowsビルダー
rhub::rhub_check()              # R-hubマルチプラットフォーム
devtools::release()             # 対話的なCRAN提出
```

### スキャフォールディング

```r
usethis::use_r("function_name")           # 新しいRファイル
usethis::use_test("function_name")        # 新しいテストファイル
usethis::use_vignette("guide_name")       # 新しいビネット
usethis::use_mit_license()                # MITライセンスを追加
usethis::use_github_action_check_standard() # CI/CD
```

## Gitコマンド

### 日常操作

```bash
git status                 # ワーキングツリーの状態を表示
git diff                   # ステージされていない変更を表示
git diff --staged          # ステージされた変更を表示
git log --oneline -10      # 最近のコミット

git add filename           # 特定のファイルをステージ
git commit -m "message"    # メッセージ付きコミット
git commit --amend         # 直前のコミットを修正

git checkout -b new-branch # ブランチを作成して切り替え
git merge feature-branch   # ブランチをマージ
```

### リモート操作

```bash
git remote -v              # リモートを一覧表示
git fetch origin           # 変更を取得
git pull origin main       # プルしてマージ
git push origin main       # リモートにプッシュ
git push -u origin branch  # 新しいブランチをプッシュ
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
claude                     # Claude Codeを起動
claude mcp list            # 設定済みMCPサーバーを一覧表示
claude mcp get r-mcptools  # サーバー詳細を取得
```

### 設定ファイル

```
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCPサーバー

```bash
# R連携
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
pwd                        # カレントディレクトリを表示
ls -la                     # 詳細なファイル一覧
tree                       # ディレクトリツリーを表示
z project-name             # よく使うディレクトリにジャンプ

rg "pattern"               # Ripgrep検索
rg -t r "pattern"          # Rファイルのみ検索
fd "pattern"               # ユーザーフレンドリーなfind
fd -e R                    # 拡張子で検索
```

### ファイル操作

```bash
mkdir -p path/to/dir       # ネストしたディレクトリを作成
cp -r source/ dest/        # ディレクトリを再帰的にコピー
tar -czf archive.tar.gz dir/  # 圧縮tarを作成
tar -xzf archive.tar.gz      # tar.gzを展開
du -sh directory           # ディレクトリサイズ
df -h                      # ディスク使用量
```

### プロセス管理

```bash
htop                       # 対話的プロセスビューア
ps aux | grep process      # 特定のプロセスを検索
kill PID                   # プロセスIDで終了
```

## キーボードショートカット

### ターミナル（Bash）

```
Ctrl+A    行頭へ移動              Ctrl+E    行末へ移動
Ctrl+K    行末まで削除            Ctrl+U    行頭まで削除
Ctrl+W    直前の単語を削除        Ctrl+R    履歴検索
Ctrl+L    画面クリア              Ctrl+C    コマンドキャンセル
```

### tmux

```
Ctrl+A |       縦分割              Ctrl+A -      横分割
Ctrl+A arrows  ペイン間移動        Ctrl+A d      セッションデタッチ
```

### VS Code

```
Ctrl+`         ターミナルを開く    Ctrl+P        クイックオープン
Ctrl+Shift+P   コマンドパレット    F1            コマンドパレット
```

## 環境変数

```bash
printenv              # 全環境変数
echo $PATH            # PATH変数
export VAR=value      # 現在のセッションに設定

# 永続的に設定
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## パッケージマネージャー

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # グローバルインストール
npm list -g --depth=0        # グローバルパッケージを一覧表示

# R (renv)
renv::init()                 # renvを初期化
renv::install("package")     # パッケージをインストール
renv::snapshot()             # ロックファイルを保存
renv::restore()              # ロックファイルから復元
```

## トラブルシューティング

### Rパッケージの問題

```bash
which R                               # Rの場所
R --version                           # Rのバージョン
Rscript -e ".libPaths()"             # ライブラリパス
echo $RSTUDIO_PANDOC                  # pandocパスの確認
```

### WSLの問題

```bash
wsl --list --verbose   # WSLディストリビューションを一覧表示
wsl --status           # WSLステータス
ip addr                # IPアドレス
```

### Gitの問題

```bash
git config --list          # 全設定を表示
git remote show origin     # リモート詳細を表示
git status --porcelain     # 機械可読ステータス
```

## 関連リソース

- [環境構築](setting-up-your-environment.md) -- 完全なセットアップガイド
- [Rパッケージ開発](r-package-development.md) -- Rパッケージの完全なワークフロー
- [システムの理解](understanding-the-system.md) -- エージェント、スキル、チームの仕組み
- [スキルライブラリ](../skills/) -- 全278スキル
- [エージェントライブラリ](../agents/) -- 全59エージェント
- [チームライブラリ](../teams/) -- 全10チーム
