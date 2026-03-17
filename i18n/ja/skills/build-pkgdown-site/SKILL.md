---
name: build-pkgdown-site
description: >
  RパッケージのpkgdownドキュメントサイトをGitHub Pagesにビルドしてデプロイする。
  _pkgdown.ymlの設定、テーマ、記事の構成、リファレンスインデックスのカスタマイズ、
  デプロイ方法を網羅。新規または既存パッケージのドキュメントサイト作成、
  レイアウトやナビゲーションのカスタマイズ、デプロイ済みサイトの404エラー修正、
  またはデプロイ方法の移行時に使用する。
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
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, pkgdown, documentation, github-pages, website
---

# pkgdownサイトのビルド

Rパッケージのpkgdownドキュメントウェブサイトを設定してデプロイする。

## 使用タイミング

- RパッケージのドキュメントサイトをGitHub Pagesに作成する時
- pkgdownのレイアウト、テーマ、またはナビゲーションをカスタマイズする時
- デプロイ済みpkgdownサイトの404エラーを修正する時
- デプロイ方法を移行する時

## 入力

- **必須**: roxygen2ドキュメントを持つRパッケージ
- **必須**: GitHubリポジトリ
- **任意**: カスタムテーマまたはブランディング
- **任意**: 記事として含めるビネット

## 手順

### ステップ1: pkgdownの初期化

```r
usethis::use_pkgdown()
```

これにより`_pkgdown.yml`が作成され、pkgdownが`.Rbuildignore`に追加される。

**期待結果：** `_pkgdown.yml`がプロジェクトルートに存在する。`.Rbuildignore`にpkgdown関連のエントリが含まれる。

**失敗時：** `install.packages("pkgdown")`でpkgdownをインストールする。`_pkgdown.yml`が既に存在する場合、関数は設定を上書きせずに`.Rbuildignore`を更新する。

### ステップ2: `_pkgdown.yml`の設定

```yaml
url: https://username.github.io/packagename/

development:
  mode: release

template:
  bootstrap: 5
  bootswatch: flatly

navbar:
  structure:
    left: [intro, reference, articles, news]
    right: [search, github]
  components:
    github:
      icon: fa-github
      href: https://github.com/username/packagename

reference:
  - title: Core Functions
    desc: Primary package functionality
    contents:
      - main_function
      - helper_function
  - title: Utilities
    desc: Helper and utility functions
    contents:
      - starts_with("util_")

articles:
  - title: Getting Started
    contents:
      - getting-started
  - title: Advanced Usage
    contents:
      - advanced-features
      - customization
```

**重要**: `development: mode: release`を設定すること。デフォルトの`mode: auto`はGitHub PagesでURLに`/dev/`が付加されて404エラーを引き起こす。

**期待結果：** `_pkgdown.yml`がパッケージに適した`url`、`template`、`navbar`、`reference`、`articles`セクションを含む有効なYAMLを持つ。

**失敗時：** オンラインYAMLリンターでYAML構文を検証する。`reference.contents`のすべての関数名が実際にエクスポートされた関数と一致しているか確認する。

### ステップ3: ローカルでのビルド

```r
pkgdown::build_site()
```

**期待結果：** `docs/`ディレクトリが`index.html`、関数リファレンスページ、記事を含む完全なサイトで作成される。

**失敗時：** 一般的な問題：pandocの欠如（`.Renviron`で`RSTUDIO_PANDOC`を設定）、ビネット依存関係の欠如（推奨パッケージをインストール）、または壊れた例（修正するか`\dontrun{}`で囲む）。

### ステップ4: サイトのプレビュー

```r
pkgdown::preview_site()
```

ナビゲーション、関数リファレンス、記事、検索が正しく機能しているか確認する。

**期待結果：** サイトがlocalhostのブラウザで開く。すべてのナビゲーションリンクが機能し、関数リファレンスページがレンダリングされ、検索が結果を返す。

**失敗時：** プレビューが開かない場合、ブラウザで`docs/index.html`を手動で開く。ページが欠如している場合、サイトをビルドする前に`devtools::document()`が実行されたか確認する。

### ステップ5: GitHub Pagesへのデプロイ

**方法A: GitHub Actions（推奨）**

pkgdownワークフローについては`setup-github-actions-ci`スキルを参照する。

**方法B: 手動ブランチデプロイ**

```bash
# サイトをビルド
Rscript -e "pkgdown::build_site()"

# gh-pagesブランチが存在しない場合は作成
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# mainに戻る
git checkout main
```

**期待結果：** `gh-pages`ブランチがリモートにルートレベルのサイトファイルとともに存在する。

**失敗時：** プッシュが拒否される場合、リポジトリへの書き込みアクセスがあることを確認する。GitHub Actionsデプロイを使用する場合は、このステップをスキップして`setup-github-actions-ci`スキルに従う。

### ステップ6: GitHub Pagesの設定

1. リポジトリの設定 > Pagesに移動する
2. ソースを「Deploy from a branch」に設定する
3. `gh-pages`ブランチ、`/ (root)`フォルダを選択する
4. 保存する

**期待結果：** 数分以内に`https://username.github.io/packagename/`でサイトが利用可能になる。

**失敗時：** サイトが404を返す場合、PagesのソースがデプロイメソッドにマッチしていることRを確認する（ブランチデプロイには「Deploy from a branch」が必要）。`_pkgdown.yml`に`development: mode: release`が設定されているか確認する。

### ステップ7: DESCRIPTIONへのURLの追加

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**期待結果：** DESCRIPTIONの`URL`フィールドにpkgdownサイトURLとGitHubリポジトリURLの両方がカンマで区切られて含まれる。

**失敗時：** `R CMD check`が無効なURLを警告する場合、URLを追加する前にpkgdownサイトが実際にデプロイされてアクセス可能であることを確認する。

## バリデーション

- [ ] サイトがエラーなくローカルでビルドされる
- [ ] すべての関数リファレンスページが正しくレンダリングされる
- [ ] 記事/ビネットがアクセス可能で正しくレンダリングされる
- [ ] 検索機能が動作する
- [ ] ナビゲーションリンクが正しい
- [ ] サイトがGitHub Pagesに正常にデプロイされる
- [ ] デプロイ済みサイトに404エラーがない
- [ ] `_pkgdown.yml`に`development: mode: release`が設定されている

## よくある落とし穴

- **デプロイ後の404エラー**: ほぼ常に`development: mode: auto`（デフォルト）が原因。`mode: release`に変更する
- **リファレンスページの欠如**: 関数はエクスポートされてドキュメント化されていなければならない。最初に`devtools::document()`を実行する
- **壊れたビネットリンク**: 相互参照にはファイルパスではなく`vignette("name")`構文を使用する
- **ロゴが表示されない**: ロゴを`man/figures/logo.png`に配置して`_pkgdown.yml`で参照する
- **検索が機能しない**: `_pkgdown.yml`の`url`フィールドが正しく設定されていることが必要

## 関連スキル

- `setup-github-actions-ci` - 自動pkgdownデプロイワークフロー
- `write-roxygen-docs` - サイトに表示される関数ドキュメント
- `write-vignette` - サイトナビゲーションに表示される記事
- `release-package-version` - リリース時にサイトの再ビルドをトリガーする
