---
name: configure-git-repository
description: >
  Gitリポジトリを適切な.gitignore、ブランチ戦略、コミット規約、
  フック、リモート設定で構成します。新規プロジェクトの初期設定、
  特定言語・フレームワーク向けの.gitignore追加、ブランチ保護と
  規約の設定、コミットフックの構成に対応。R、Node.js、Pythonプロジェクトの
  一般的なパターンも網羅。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
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

# Gitリポジトリの設定

プロジェクトの種類に応じた適切な設定でGitリポジトリをセットアップする。

## 使用タイミング

- 新規プロジェクトのバージョン管理を初期化するとき
- 特定言語・フレームワーク向けの`.gitignore`を追加するとき
- ブランチ保護と規約を設定するとき
- コミットフックを構成するとき

## 入力

- **必須**: プロジェクトディレクトリ
- **必須**: プロジェクトの種類（Rパッケージ、Node.js、Python、汎用）
- **任意**: リモートリポジトリのURL
- **任意**: ブランチ戦略（トランクベース、Git Flow）
- **任意**: コミットメッセージ規約

## 手順

### ステップ1: リポジトリの初期化

```bash
cd /path/to/project
git init
git branch -M main
```

**期待結果：** `.git/` ディレクトリが作成される。デフォルトブランチが `main` という名前になる。

**失敗時：** `git init` が失敗する場合、Gitがインストールされているか確認する（`git --version`）。すでに `.git/` が存在する場合、リポジトリはすでに初期化済みのため、このステップをスキップする。

### ステップ2: .gitignoreの作成

**Rパッケージ**:

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

**期待結果：** プロジェクトの種類に適したエントリを含む `.gitignore` ファイルが作成される。機密ファイル（`.Renviron`、`.env`）と生成物が除外されている。

**失敗時：** どのエントリを含めるか不明な場合、`gitignore.io` またはGitHubの `.gitignore` テンプレートを出発点として利用し、プロジェクトに合わせてカスタマイズする。

### ステップ3: 初期コミットの作成

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**期待結果：** `.gitignore` と初期プロジェクトファイルを含む最初のコミットが作成される。`git log` に1件のコミットが表示される。

**失敗時：** `git commit` が「nothing to commit」で失敗する場合、`git add` でファイルがステージングされているか確認する。作成者情報エラーで失敗する場合、`git config user.name` と `git config user.email` を設定する。

### ステップ4: リモートの接続

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**期待結果：** リモート `origin` が設定される。`git remote -v` にフェッチとプッシュのURLが表示される。初期コミットがリモートにプッシュされる。

**失敗時：** 「Permission denied (publickey)」でプッシュが失敗する場合、SSHキーを設定する（`setup-wsl-dev-environment` を参照）。リモートがすでに存在する場合、`git remote set-url origin <url>` で更新する。

### ステップ5: ブランチ規約の設定

**トランクベース（小規模チームに推奨）**:

- `main`: 本番環境対応コード
- フィーチャーブランチ: `feature/description`
- バグ修正: `fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**期待結果：** ブランチ命名規約が確立され、文書化される。チームメンバーが各作業種別に使うプレフィックスを把握している。

**失敗時：** ブランチがすでに一貫性なく命名されている場合、`git branch -m old-name new-name` でリネームし、オープン中のPRも更新する。

### ステップ6: コミット規約の設定

Conventional Commits形式:

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**期待結果：** コミットメッセージ規約がチームで合意・文書化される。今後のコミットが `type: description` 形式に従う。

**失敗時：** チームメンバーが規約に従っていない場合、フォーマットを検証するcommit-msgフックで強制する（ステップ7を参照）。

### ステップ7: プリコミットフックの設定（任意）

`.githooks/pre-commit` を作成:

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

**期待結果：** プリコミットフックが `git commit` のたびに自動で実行される。リントエラーがあるとコミットがブロックされ、修正が必要になる。

**失敗時：** フックが実行されない場合、`core.hooksPath` が設定されているか（`git config core.hooksPath`）およびフックファイルが実行可能か（`chmod +x`）を確認する。

### ステップ8: READMEの作成

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**期待結果：** `README.md` がリポジトリにコミットされる。GitHubに最小限の情報を持つランディングページが作成される。

**失敗時：** `README.md` がすでに存在する場合、上書きせず更新する。Rプロジェクトではバッジつきのテンプレートとして `usethis::use_readme_md()` を使用する。

## バリデーション

- [ ] `.gitignore` が機密ファイルと生成物を除外している
- [ ] 追跡ファイルに機密データ（トークン、パスワード）が含まれていない
- [ ] リモートリポジトリが接続・アクセス可能である
- [ ] ブランチ命名規約が文書化されている
- [ ] 初期コミットがクリーンに作成されている

## よくある落とし穴

- **.gitignore前のコミット**: 先に `.gitignore` を追加すること。すでに追跡されているファイルは後から `.gitignore` に追加しても影響を受けない。
- **履歴への機密データのコミット**: シークレットをコミットした場合、削除後も履歴に残る。クリーンアップには `git filter-repo` またはBFGを使用する。
- **大きなバイナリファイル**: 大きなバイナリはコミットしない。1MBを超えるファイルにはGit LFSを使用する。
- **改行コード**: Windows/WSLでは `core.autocrlf=input` を設定してCRLF/LFの問題を防ぐ。

## 関連スキル

- `commit-changes` - ステージングとコミットのワークフロー
- `manage-git-branches` - ブランチの作成と規約
- `create-r-package` - Rパッケージ作成の一環としてのGitセットアップ
- `setup-wsl-dev-environment` - GitのインストールとSSHキー
- `create-github-release` - リポジトリからのリリース作成
- `security-audit-codebase` - コミットされたシークレットのチェック
