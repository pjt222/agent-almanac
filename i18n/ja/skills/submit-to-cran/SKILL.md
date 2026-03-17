---
name: submit-to-cran
description: >
  RパッケージをCRANに投稿するための完全な手順。事前チェック（ローカル、
  win-builder、R-hub）、cran-comments.mdの準備、URLおよびスペルチェック、
  投稿自体を含む。初回投稿および更新版の投稿に対応。パッケージが初回CRAN
  リリース準備完了時、既存CRANパッケージの更新版投稿時、またはCRANレビュー
  担当者のフィードバック後の再投稿時に使用する。
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
  complexity: advanced
  language: R
  tags: r, cran, submission, release, publishing
---

# CRANへの投稿

事前チェックから投稿まで、CRANへの投稿ワークフロー全体を実行する。

## 使用タイミング

- パッケージが初回CRANリリースの準備完了時
- 既存CRANパッケージの更新版を投稿する時
- CRANレビュー担当者のフィードバックを受けて再投稿する時

## 入力

- **必須**: ローカルの`R CMD check`で0エラー・0警告をパスしたRパッケージ
- **必須**: DESCRIPTIONの更新済みバージョン番号
- **必須**: 今バージョンの変更点を記載した更新済みNEWS.md
- **任意**: 以前のCRANレビュー担当者のコメント（再投稿時）

## 手順

### ステップ1: バージョンとNEWSの確認

DESCRIPTIONに正しいバージョンが記載されていることを確認する：

```r
desc::desc_get_version()
```

NEWS.mdにこのバージョンのエントリがあることを確認する。エントリにはユーザー向けの変更点をまとめること。

**期待結果：** バージョンがセマンティックバージョニングに従っている。NEWS.mdにこのバージョンに対応するエントリがある。

**失敗時：** `usethis::use_version()`でバージョンを更新する（"major"、"minor"、または"patch"を選択）。ユーザー向けの変更点をまとめたNEWS.mdエントリを追加する。

### ステップ2: ローカルR CMD Check

```r
devtools::check()
```

**期待結果：** 0エラー、0警告、0ノート（新規投稿の場合は「New submission」という1つのノートは許容）。

**失敗時：** 進む前にすべてのエラーと警告を修正する。詳細は`<pkg>.Rcheck/00check.log`のチェックログを参照する。ノートはcran-comments.mdで説明すること。

### ステップ3: スペルチェック

```r
devtools::spell_check()
```

正当な単語を`inst/WORDLIST`に追加する（1行1単語、アルファベット順）。

**期待結果：** 予期しないスペルミスがない。フラグが立てられた単語はすべて修正済み、または`inst/WORDLIST`に追加済み。

**失敗時：** 本当のスペルミスを修正する。正当な技術用語は`inst/WORDLIST`に追加する（1行1単語、アルファベット順）。

### ステップ4: URLチェック

```r
urlchecker::url_check()
```

**期待結果：** すべてのURLがHTTP 200を返す。壊れたリンクやリダイレクトされたリンクがない。

**失敗時：** 壊れたURLを置き換える。DOIリンクには生URLの代わりに`\doi{}`を使用する。存在しなくなったリソースへのリンクを削除する。

### ステップ5: Win-Builderチェック

```r
devtools::check_win_devel()
devtools::check_win_release()
```

メールの結果を待つ（通常15〜30分）。

**期待結果：** Win-builderのreleaseとdevel両方で0エラー、0警告。結果は15〜30分以内にメールで届く。

**失敗時：** プラットフォーム固有の問題に対処する。一般的な原因：異なるコンパイラ警告、システム依存関係の欠如、パスセパレータの違い。ローカルで修正してWin-builderに再投稿する。

### ステップ6: R-hubチェック

```r
rhub::rhub_check()
```

複数のプラットフォーム（Ubuntu、Windows、macOS）でチェックする。

**期待結果：** すべてのプラットフォームで0エラー・0警告でパス。

**失敗時：** 特定のプラットフォームが失敗した場合、R-hubのビルドログでプラットフォーム固有のエラーを確認する。プラットフォーム依存の動作には`testthat::skip_on_os()`や条件付きコードを使用する。

### ステップ7: cran-comments.mdの準備

パッケージルートに`cran-comments.md`を作成または更新する：

```markdown
## R CMD check results
0 errors | 0 warnings | 1 note

* This is a new release.

## Test environments
* local: Windows 11, R 4.5.0
* win-builder: R-release, R-devel
* R-hub: ubuntu-latest (R-release), windows-latest (R-release), macos-latest (R-release)

## Downstream dependencies
There are currently no downstream dependencies for this package.
```

更新版の場合は以下を含める：
- 変更点（簡潔に）
- 以前のレビュー担当者のフィードバックへの回答
- 該当する場合はリバースディペンデンシーチェックの結果

**期待結果：** `cran-comments.md`がすべてのテスト環境にわたるチェック結果を正確にまとめ、ノートを説明している。

**失敗時：** プラットフォーム間でチェック結果が異なる場合はすべてのバリエーションを文書化する。CRANレビュー担当者は独自のテストと照合してこれらの主張を確認する。

### ステップ8: 最終事前チェック

```r
# 最後のチェック
devtools::check()

# ビルドされたtarballを確認
devtools::build()
```

**期待結果：** 最終的な`devtools::check()`がクリーンにパスする。`.tar.gz`のtarballが親ディレクトリに作成される。

**失敗時：** 土壇場で問題が発生した場合は修正してステップ2からすべてのチェックを再実行する。既知の失敗がある状態で投稿しないこと。

### ステップ9: 投稿

```r
devtools::release()
```

対話式チェックを実行して投稿する。すべての質問に正直に答えること。

または、tarballをアップロードして https://cran.r-project.org/submit.html から手動で投稿することもできる。

**期待結果：** CRANからの確認メールが数分以内に届く。確認リンクをクリックして投稿を確定する。

**失敗時：** 却下理由のメールを確認する。一般的な問題：例の実行時間が長すぎる、`\value`タグの欠如、移植性のないコード。問題を修正して再投稿し、cran-comments.mdに変更点を記載する。

### ステップ10: 投稿後の処理

承認後：

```r
# リリースをタグ付け
usethis::use_github_release()

# 開発バージョンにバンプ
usethis::use_dev_version()
```

**期待結果：** 承認済みバージョンタグでGitHubリリースが作成される。DESCRIPTIONが開発バージョン（`x.y.z.9000`）にバンプされる。

**失敗時：** GitHubリリースが失敗した場合は`gh release create`で手動作成する。CRAN承認が遅延している場合は確認メールを受け取ってからタグ付けする。

## バリデーション

- [ ] `R CMD check`がローカルマシンで0エラー・0警告を返す
- [ ] Win-builderでパス（releaseとdevel）
- [ ] R-hubがテストしたすべてのプラットフォームでパス
- [ ] `cran-comments.md`がチェック結果を正確に説明している
- [ ] すべてのURLが有効
- [ ] スペルミスがない
- [ ] バージョン番号が正しく、インクリメントされている
- [ ] NEWS.mdが最新
- [ ] DESCRIPTIONのメタデータが完全で正確

## よくある落とし穴

- **例の実行時間が長すぎる**: コストのかかる例は`\donttest{}`で囲む。CRANは時間制限を設けている
- **非標準のファイル・ディレクトリ名**: CRANのノートを引き起こすファイルを避ける（`.Rbuildignore`を確認）
- **ドキュメントの`\value`が欠如**: エクスポートされるすべての関数には`@return`タグが必要
- **ビネットのビルド失敗**: `.Renviron`なしのクリーンな環境でビネットがビルドされることを確認する
- **DESCRIPTIONのタイトル形式**: タイトルケース、末尾にピリオドなし、"A Package for..."は不可
- **リバースディペンデンシーチェックを忘れる**: 更新版の場合は`revdepcheck::revdep_check()`を実行する

## 例

```r
# 投稿前の完全なワークフロー
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# 結果を待つ...
devtools::release()
```

## 関連スキル

- `release-package-version` - バージョンバンプとgitタグ付け
- `write-roxygen-docs` - CRANの標準を満たすドキュメントの確保
- `setup-github-actions-ci` - CRANの期待値を反映したCIチェック
- `build-pkgdown-site` - 承認済みパッケージのドキュメントサイト
