---
name: setup-github-actions-ci
description: >
  RパッケージのGitHub Actions CI/CDを設定する。複数プラットフォームでのR CMD check、
  テストカバレッジレポート、pkgdownサイトのデプロイを含む。標準ワークフローに
  r-lib/actionsを使用。新規RパッケージのCI/CD設定、既存パッケージへのマルチ
  プラットフォームテスト追加、pkgdownサイトの自動デプロイ設定、またはリポジトリへの
  コードカバレッジレポート追加時に使用する。
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
  tags: r, github-actions, ci-cd, testing, automation
---

# RパッケージのGitHub Actions CI設定

GitHub Actionsを介した自動R CMD check、テストカバレッジ、ドキュメントデプロイを設定する。

## 使用タイミング

- GitHubのRパッケージにCI/CDを設定する時
- 既存パッケージにマルチプラットフォームテストを追加する時
- pkgdownサイトの自動デプロイを設定する時
- コードカバレッジレポートを追加する時

## 入力

- **必須**: 有効なDESCRIPTIONとテストを持つRパッケージ
- **必須**: GitHubリポジトリ（パブリックまたはプライベート）
- **任意**: pkgdownデプロイを含めるかどうか（デフォルト：いいえ）
- **任意**: カバレッジレポートを含めるかどうか（デフォルト：いいえ）

## 手順

### ステップ1: R CMD Checkワークフローの作成

`.github/workflows/R-CMD-check.yaml`を作成する：

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: R-CMD-check

permissions: read-all

jobs:
  R-CMD-check:
    runs-on: ${{ matrix.config.os }}

    name: ${{ matrix.config.os }} (${{ matrix.config.r }})

    strategy:
      fail-fast: false
      matrix:
        config:
          - {os: macos-latest, r: 'release'}
          - {os: windows-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'devel', http-user-agent: 'release'}
          - {os: ubuntu-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'oldrel-1'}

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}
      R_KEEP_PKG_SOURCE: yes

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: ${{ matrix.config.r }}
          http-user-agent: ${{ matrix.config.http-user-agent }}
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::rcmdcheck
          needs: check

      - uses: r-lib/actions/check-r-package@v2
        with:
          upload-snapshots: true
          build_args: 'c("--no-manual", "--compact-vignettes=gs+qpdf")'
```

**期待結果：** ワークフローファイル`.github/workflows/R-CMD-check.yaml`が、release、devel、oldrelをカバーするマルチプラットフォームマトリクス（macOS、Windows、Ubuntu）で作成される。

**失敗時：** `.github/workflows/`ディレクトリが存在しない場合は`mkdir -p .github/workflows`で作成する。YAML構文をYAMLリンターで確認する。

### ステップ2: テストカバレッジワークフローの作成（任意）

`.github/workflows/test-coverage.yaml`を作成する：

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: test-coverage

permissions: read-all

jobs:
  test-coverage:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::covr, any::xml2
          needs: coverage

      - name: Test coverage
        run: |
          cov <- covr::package_coverage(
            quiet = FALSE,
            clean = FALSE,
            install_path = file.path(normalizePath(Sys.getenv("RUNNER_TEMP"), winslash = "/"), "package")
          )
          covr::to_cobertura(cov)
        shell: Rscript {0}

      - uses: codecov/codecov-action@v4
        with:
          fail_ci_if_error: ${{ github.event_name != 'pull_request' && true || false }}
          file: ./cobertura.xml
          plugin: noop
          token: ${{ secrets.CODECOV_TOKEN }}
```

**期待結果：** ワークフローファイル`.github/workflows/test-coverage.yaml`が作成される。カバレッジレポートが各プッシュとPRでCodecovにアップロードされる。

**失敗時：** Codecovのアップロードが失敗する場合、リポジトリ設定で`CODECOV_TOKEN`シークレットが設定されているか確認する。パブリックリポジトリの場合、トークンは任意の場合がある。

### ステップ3: pkgdownデプロイワークフローの作成（任意）

`.github/workflows/pkgdown.yaml`を作成する：

```yaml
on:
  push:
    branches: [main, master]
  release:
    types: [published]
  workflow_dispatch:

name: pkgdown

permissions:
  contents: write
  pages: write

jobs:
  pkgdown:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::pkgdown, local::.
          needs: website

      - name: Build site
        run: pkgdown::build_site_github_pages(new_process = FALSE, install = FALSE)
        shell: Rscript {0}

      - name: Deploy to GitHub pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          clean: false
          branch: gh-pages
          folder: docs
```

**期待結果：** ワークフローファイル`.github/workflows/pkgdown.yaml`が作成される。mainへのプッシュまたはリリース時にサイトがビルドされて`gh-pages`ブランチにデプロイされる。

**失敗時：** デプロイが失敗する場合、リポジトリに`contents: write`権限が有効になっているか確認する。`_pkgdown.yml`に`development: mode: release`が設定されているか確認する。

### ステップ4: READMEへのステータスバッジの追加

`README.md`に追加する：

```markdown
[![R-CMD-check](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml)
```

**期待結果：** READMEに各ワークフロー実行後に自動更新されるライブCIステータスバッジが表示される。

**失敗時：** バッジが「ステータスなし」を表示する場合、バッジURLのワークフローファイル名が実際のファイルと一致しているか確認する。最初のワークフロー実行をトリガーするためにコミットをプッシュする。

### ステップ5: GitHubリポジトリ設定の構成

1. pkgdownを使用する場合はGitHub Pagesを有効化する（設定 > Pages）で`gh-pages`ブランチを指定
2. カバレッジレポートを使用する場合は`CODECOV_TOKEN`シークレットを追加する
3. `GITHUB_TOKEN`に適切な権限があることを確認する

**期待結果：** pkgdownデプロイ用にGitHub Pagesが設定される。必要なシークレットが設定される。トークンの権限がワークフローに対して十分である。

**失敗時：** Pagesデプロイが失敗する場合、設定 > Pagesでソースが`gh-pages`ブランチに設定されているか確認する。シークレットが欠如している場合は設定 > シークレットと変数 > Actionsで追加する。

### ステップ6: プッシュと確認

```bash
git add .github/
git commit -m "Add GitHub Actions CI workflows"
git push
```

GitHubのActionsタブでワークフローが正常に実行されることを確認する。

**期待結果：** GitHubのActionsタブですべてのジョブに緑のチェックマークが表示される。ワークフローがプッシュとPRイベントの両方でトリガーされる。

**失敗時：** Actionsタブのワークフローログを確認する。一般的な問題：システム依存関係の欠如（`extra-packages`に追加）、ビネットのビルド失敗（pandocセットアップステップが存在するか確認）、YAMLの構文エラー。

## バリデーション

- [ ] R CMD checkがすべてのマトリクスプラットフォームでパスする
- [ ] カバレッジレポートが生成される（設定した場合）
- [ ] pkgdownサイトがデプロイされる（設定した場合）
- [ ] READMEにステータスバッジが表示される
- [ ] ワークフローがプッシュとPRの両方でトリガーされる

## よくある落とし穴

- **`permissions`の欠如**: GitHub Actionsは明示的な権限を要求するようになった。最低限`permissions: read-all`を追加する
- **システム依存関係**: 一部のRパッケージはシステムライブラリを必要とする。ほとんどのケースを処理する`r-lib/actions/setup-r-dependencies`を使用する
- **pandocなしのビネット**: 常に`r-lib/actions/setup-pandoc@v2`を含める
- **pkgdownの開発モード**: GitHub Pages用に`_pkgdown.yml`の`development: mode: release`を確認する
- **キャッシュの問題**: `r-lib/actions/setup-r-dependencies`がキャッシュを自動的に処理する

## 関連スキル

- `create-r-package` - CIワークフローを含む初期パッケージセットアップ
- `build-pkgdown-site` - 詳細なpkgdown設定
- `submit-to-cran` - CIチェックはCRANの期待値を反映すべき
- `release-package-version` - リリース時にデプロイをトリガーする
