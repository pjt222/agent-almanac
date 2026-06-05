---
name: create-r-package
description: >
  DESCRIPTION、NAMESPACE、testthat、roxygen2、renv、Git、GitHub Actions CI、
  開発設定ファイル（.Rprofile、.Renviron.example、CLAUDE.md）を含む完全な構造で
  新しいRパッケージをスキャフォールドする。usethisの規約とtidyverseスタイルに
  準拠する。新しいRパッケージをゼロから始める時、散在するRスクリプトを構造化された
  パッケージに変換する時、共同開発用のパッケージスケルトンを準備する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
  locale: ja
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Rパッケージの作成

モダンなツールとベストプラクティスに基づく、完全に設定されたRパッケージをスキャフォールドする。

## 使用タイミング

- 新しいRパッケージをゼロから始める時
- 散在するRスクリプトをパッケージに変換する時
- 共同開発用のパッケージスケルトンを準備する時

## 入力

- **必須**: パッケージ名（小文字、`.` 以外の特殊文字不可）
- **必須**: パッケージの目的を示す一行の説明
- **任意**: ライセンスの種類（デフォルト: MIT）
- **任意**: 著者情報（名前、メール、ORCID）
- **任意**: renvを初期化するかどうか（デフォルト: はい）

## 手順

### ステップ1: パッケージスケルトンを作成する

```r
usethis::create_package("packagename")
setwd("packagename")
```

**期待結果:** `DESCRIPTION`、`NAMESPACE`、`R/`、`man/` サブディレクトリを含むディレクトリが作成される。

**失敗時:** usethisがインストールされていることを確認する（`install.packages("usethis")`）。ディレクトリが既に存在しないことを確認する。

### ステップ2: DESCRIPTIONを設定する

`DESCRIPTION` に正確なメタデータを記述する:

```text
Package: packagename
Title: What the Package Does (Title Case)
Version: 0.1.0
Authors@R:
    person("First", "Last", , "email@example.com", role = c("aut", "cre"),
           comment = c(ORCID = "0000-0000-0000-0000"))
Description: One paragraph describing what the package does. Must be more
    than one sentence. Avoid starting with "This package".
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.2
URL: https://github.com/username/packagename
BugReports: https://github.com/username/packagename/issues
```

**期待結果:** `R CMD check` でメタデータの警告が出ない有効なDESCRIPTION。

**失敗時:** `R CMD check` がDESCRIPTIONフィールドについて警告する場合、`Title` がタイトルケースであること、`Description` が1文以上であること、`Authors@R` が有効な `person()` 構文を使用していることを確認する。

### ステップ3: インフラを構築する

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**期待結果:** LICENSE、README.md、NEWS.md、`tests/` ディレクトリ、`.git/` 初期化、`.github/workflows/` が作成される。

**失敗時:** `usethis::use_*()` 関数が失敗した場合、不足している依存関係をインストールして再実行する。`.git/` が既に存在する場合、`use_git()` は初期化をスキップする。

### ステップ4: 開発設定を作成する

`.Rprofile` を作成する:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

`.Renviron.example` を作成する:

```text
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

`.Rbuildignore` エントリを作成する:

```text
^\.Rprofile$
^\.Renviron$
^\.Renviron\.example$
^renv$
^renv\.lock$
^CLAUDE\.md$
^\.github$
^.*\.Rproj$
```

**期待結果:** `.Rprofile`、`.Renviron.example`、`.Rbuildignore` が作成される。開発用ファイルがビルドされたパッケージから除外される。

**失敗時:** `.Rprofile` が起動時にエラーを起こす場合、構文の問題を確認する。オプションパッケージが存在しない場合の失敗を防ぐため、`requireNamespace()` ガードが正しいことを確認する。

### ステップ5: renvを初期化する

```r
renv::init()
```

**期待結果:** `renv/` ディレクトリと `renv.lock` が作成される。プロジェクトローカルのライブラリが有効になる。

**失敗時:** `install.packages("renv")` でrenvをインストールする。renvが初期化中にハングする場合、ネットワーク接続を確認するか `options(timeout = 600)` を設定する。

### ステップ6: パッケージドキュメントファイルを作成する

`R/packagename-package.R` を作成する:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**期待結果:** `"_PACKAGE"` センチネルを含む `R/packagename-package.R` が存在する。`devtools::document()` を実行するとパッケージレベルのヘルプが生成される。

**失敗時:** ファイル名が `R/<packagename>-package.R` のパターンに一致していることを確認する。`"_PACKAGE"` 文字列は関数内ではなく、独立した式として記述する必要がある。

### ステップ7: CLAUDE.mdを作成する

プロジェクトルートにAIアシスタント向けのプロジェクト固有の指示を含む `CLAUDE.md` を作成する。

**期待結果:** プロジェクト固有の編集規約、ビルドコマンド、アーキテクチャのメモを含む `CLAUDE.md` がプロジェクトルートに存在する。

**失敗時:** 何を含めるか分からない場合は、パッケージ名、一行の説明、一般的な開発コマンド（`devtools::check()`、`devtools::test()`）、自明でない規約から始める。

## バリデーション

- [ ] `devtools::check()` がエラー0、警告0を返す
- [ ] パッケージ構造が期待されるレイアウトと一致する
- [ ] `.Rprofile` がエラーなく読み込まれる
- [ ] `renv::status()` で問題がない
- [ ] 適切な `.gitignore` を持つGitリポジトリが初期化されている
- [ ] GitHub Actionsワークフローファイルが存在する

## よくある落とし穴

- **パッケージ名の重複**: 名前を確定する前に `available::available("packagename")` でCRANを確認する
- **`.Rbuildignore` エントリの不足**: 開発用ファイル（`.Rprofile`、`.Renviron`、`renv/`）はビルドされたパッケージから除外する必要がある
- **Encodingの記述忘れ**: DESCRIPTIONに必ず `Encoding: UTF-8` を含める
- **RoxygenNoteの不一致**: DESCRIPTIONのバージョンはインストール済みのroxygen2と一致する必要がある

## 使用例

```r
# 最小構成での作成
usethis::create_package("myanalysis")

# 1セッションでのフルセットアップ
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## 関連スキル

- `write-roxygen-docs` - 作成した関数のドキュメント作成
- `write-testthat-tests` - パッケージのテスト追加
- `setup-github-actions-ci` - CI/CDの詳細設定
- `manage-renv-dependencies` - パッケージ依存関係の管理
- `write-claude-md` - 効果的なAIアシスタント指示の作成
