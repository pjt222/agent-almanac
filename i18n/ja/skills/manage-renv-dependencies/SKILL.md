---
name: manage-renv-dependencies
description: >
  renvを使用してRパッケージの依存関係を再現可能な環境で管理する。
  初期化、スナップショット/リストアワークフロー、一般的な問題のトラブルシューティング、
  CI/CD統合を網羅。新規Rプロジェクトへの依存関係管理の初期化、パッケージの
  追加・更新、新しいマシンへの環境復元、リストア失敗のトラブルシューティング、
  またはCI/CDパイプラインとのrenv統合時に使用する。
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
  tags: r, renv, dependencies, reproducibility, lockfile
---

# renv依存関係の管理

renvを使用して再現可能なRパッケージ環境をセットアップして保守する。

## 使用タイミング

- 新規RプロジェクトへのIの依存関係管理の初期化
- パッケージの依存関係の追加または更新
- 新しいマシンへのプロジェクト環境の復元
- renvのリストア失敗のトラブルシューティング
- CI/CDパイプラインとのrenv統合

## 入力

- **必須**: Rプロジェクトディレクトリ
- **任意**: 既存の`renv.lock`ファイル（リストア用）
- **任意**: プライベートパッケージ用のGitHub PAT

## 手順

### ステップ1: renvの初期化

```r
renv::init()
```

これにより以下が作成される：
- `renv/`ディレクトリ（ライブラリ、設定、アクティベーションスクリプト）
- `renv.lock`（依存関係のスナップショット）
- `.Rprofile`がrenvを読み込み時にアクティベートするよう更新される

**期待結果：** プロジェクトローカルライブラリが作成される。`renv/`ディレクトリと`renv.lock`が存在する。`.Rprofile`がアクティベーションスクリプトで更新される。

**失敗時：** ハングする場合はネットワーク接続を確認する。特定のパッケージで失敗する場合は、そのパッケージを`install.packages()`で手動インストールしてから`renv::init()`を再実行する。

### ステップ2: 依存関係の追加

通常通りパッケージをインストールする：

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

状態を記録するためにスナップショットを作成する：

```r
renv::snapshot()
```

**期待結果：** `renv.lock`が新しいパッケージとそのバージョンで更新される。`renv::status()`が同期外れのパッケージがないことを示す。

**失敗時：** `renv::snapshot()`がバリデーションエラーを報告する場合は`renv::dependencies()`を実行して実際に使用されているパッケージを確認し、次に`renv::snapshot(force = TRUE)`でバリデーションをバイパスする。

### ステップ3: 別のマシンへの復元

```r
renv::restore()
```

**期待結果：** `renv.lock`の正確なバージョンですべてのパッケージがインストールされる。

**失敗時：** 一般的な問題：GitHubパッケージの失敗（`.Renviron`で`GITHUB_PAT`を設定）、システム依存関係の欠如（Linuxで`apt-get`を使用してインストール）、大きなパッケージのタイムアウト（リストア前に`options(timeout = 600)`を設定）、またはバイナリが利用不可（renvがソースからコンパイル；ビルドツールがインストールされているか確認）。

### ステップ4: 依存関係の更新

```r
# 特定のパッケージを更新
renv::update("dplyr")

# すべてのパッケージを更新
renv::update()

# 更新後にスナップショットを作成
renv::snapshot()
```

**期待結果：** 対象パッケージが最新の互換バージョンに更新される。`renv.lock`がスナップショット後に新しいバージョンを反映する。

**失敗時：** `renv::update()`が特定のパッケージで失敗する場合は`renv::install("package@version")`で直接インストールしてからスナップショットを作成する。

### ステップ5: ステータスの確認

```r
renv::status()
```

**期待結果：** 「問題なし」または同期外れのパッケージの明確なリストとアクション可能なガイダンス。

**失敗時：** ステータスが使用されているが記録されていないパッケージを報告する場合は`renv::snapshot()`を実行する。記録されているがインストールされていないパッケージがある場合は`renv::restore()`を実行する。

### ステップ6: 条件付きアクティベーション用の`.Rprofile`設定

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

これによりrenvがインストールされていない場合（CI環境、共同作業者）でもプロジェクトが動作する。

**期待結果：** プロジェクトディレクトリで開始するとRセッションが自動的にrenvをアクティベートする。renvがインストールされていないセッションもエラーなく起動する。

**失敗時：** `.Rprofile`がエラーを引き起こす場合、`file.exists()`ガードが存在することを確認する。`source("renv/activate.R")`を条件なしで呼び出してはならない。

### ステップ7: Git設定

これらのファイルをトラックする：

```
renv.lock           # 常にコミット
renv/activate.R     # 常にコミット
renv/settings.json  # 常にコミット
.Rprofile           # コミット（renvアクティベーションを含む）
```

これらは無視する（renvの`.gitignore`に既に含まれる）：

```
renv/library/       # マシン固有
renv/staging/       # 一時的
renv/cache/         # マシン固有のキャッシュ
```

**期待結果：** `renv.lock`、`renv/activate.R`、`renv/settings.json`がGitでトラックされる。マシン固有のディレクトリ（`renv/library/`、`renv/cache/`）が無視される。

**失敗時：** `renv/library/`が誤ってコミットされた場合は`git rm -r --cached renv/library/`で削除し、`.gitignore`に追加する。

### ステップ8: CI/CD統合

GitHub Actionsではrenvキャッシュアクションを使用する：

```yaml
- uses: r-lib/actions/setup-renv@v2
```

これにより`renv.lock`からキャッシュを使用して自動的に復元される。

**期待結果：** CIパイプラインがキャッシュを有効にして`renv.lock`からパッケージを復元する。キャッシュされたパッケージにより後続の実行が高速化される。

**失敗時：** CIの復元が失敗する場合、`renv.lock`がコミットされて最新であるか確認する。プライベートGitHubパッケージには、`GITHUB_PAT`がリポジトリシークレットとして設定されているか確認する。

## バリデーション

- [ ] `renv::status()`が問題なしを報告する
- [ ] `renv.lock`がバージョン管理にコミットされている
- [ ] `renv::restore()`がクリーンなチェックアウトで動作する
- [ ] `.Rprofile`が条件付きでrenvをアクティベートする
- [ ] CI/CDが依存関係解決に`renv.lock`を使用する

## よくある落とし穴

- **間違ったディレクトリで`renv::init()`を実行**: 最初に`getwd()`を確認する
- **renvとシステムライブラリの混在**: `renv::init()`後はプロジェクトライブラリのみを使用する
- **スナップショットを忘れる**: パッケージのインストール後は常に`renv::snapshot()`を実行する
- **`--vanilla`フラグ**: `Rscript --vanilla`は`.Rprofile`をスキップするため、renvはアクティベートされない
- **差分の大きなロックファイル**: 正常 — `renv.lock`は差分可能なJSONとして設計されている
- **Bioconductorパッケージ**: `renv::install("bioc::PackageName")`を使用してBiocManagerが設定されていることを確認する

## 関連スキル

- `create-r-package` - renv初期化を含む
- `setup-github-actions-ci` - renvとのCI統合
- `submit-to-cran` - CRANパッケージの依存関係管理
