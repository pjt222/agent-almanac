---
name: release-package-version
description: >
  RパッケージのリリースサイクルをすべてとおしてI実行する。バージョンバンプ、
  NEWS.mdの更新、gitタグ付け、GitHubリリースの作成、リリース後の開発バージョン設定を含む。
  パッケージが新しいパッチ、マイナー、またはメジャーリリースの準備完了時、
  CRANへの承認後に対応するGitHubリリースを作成する時、またはリリース直後に
  開発バージョンバンプを設定する時に使用する。
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
  tags: r, versioning, release, git-tags, changelog
---

# パッケージバージョンのリリース

Rパッケージの完全なバージョンリリースサイクルを実行する。

## 使用タイミング

- 新しいバージョンをリリースする準備ができた時（バグ修正、機能追加、または破壊的変更）
- CRANへの承認後に対応するGitHubリリースを作成する時
- リリース後の開発バージョンを設定する時

## 入力

- **必須**: リリース準備が完了した変更を持つパッケージ
- **必須**: リリースタイプ：patch（0.1.0 -> 0.1.1）、minor（0.1.0 -> 0.2.0）、またはmajor（0.1.0 -> 1.0.0）
- **任意**: CRANに投稿するかどうか（デフォルト：いいえ、別途`submit-to-cran`スキルを使用）

## 手順

### ステップ1: バージョンバンプの決定

セマンティックバージョニングに従う：

| 変更タイプ | バージョンバンプ | 例 |
|-------------|-------------|---------|
| バグ修正のみ | Patch | 0.1.0 -> 0.1.1 |
| 新機能（後方互換） | Minor | 0.1.0 -> 0.2.0 |
| 破壊的変更 | Major | 0.1.0 -> 1.0.0 |

**期待結果：** 最後のリリース以降の変更の性質に基づいて正しいバンプタイプ（patch、minor、またはmajor）が決定される。

**失敗時：** 不明な場合は最後のタグ以降の`git log`を確認して各変更を分類する。API破壊的変更はメジャーバンプが必要。

### ステップ2: バージョンの更新

```r
usethis::use_version("minor")  # または"patch"または"major"
```

これによりDESCRIPTIONの`Version`フィールドが更新され、NEWS.mdに見出しが追加される。

**期待結果：** DESCRIPTIONのバージョンが更新される。NEWS.mdにリリースバージョンの新しいセクション見出しが追加される。

**失敗時：** `usethis::use_version()`が利用できない場合、DESCRIPTIONの`Version`フィールドを手動で更新し、NEWS.mdに`# packagename x.y.z`見出しを追加する。

### ステップ3: NEWS.mdの更新

新しいバージョン見出しの下にリリースノートを記入する：

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

トレーサビリティのためにイシュー/PR番号を使用する。

**期待結果：** NEWS.mdにカテゴリ別に整理されたユーザー向けの変更の完全なまとめが含まれ、トレーサビリティのためにイシュー/PR番号が付いている。

**失敗時：** 変更の再構築が困難な場合は`git log --oneline v<previous>..HEAD`を使用して最後のリリース以降のすべてのコミットをリストアップして分類する。

### ステップ4: 最終チェック

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**期待結果：** `devtools::check()`が0エラー、0警告、0ノートを返す。スペルチェックとURLチェックで問題が見つからない。

**失敗時：** リリース前にすべてのエラーと警告を修正する。スペルチェッカーの誤検知には`inst/WORDLIST`に単語を追加する。壊れたURLを置き換える。

### ステップ5: リリースのコミット

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**期待結果：** DESCRIPTIONのバージョンバンプと更新されたNEWS.mdを含む単一のコミット。

**失敗時：** 他のコミットされていない変更が存在する場合は、DESCRIPTIONとNEWS.mdのみをステージングする。リリースコミットにはバージョン関連の変更のみを含めること。

### ステップ6: リリースのタグ付け

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**期待結果：** アノテーション付きタグ`v0.2.0`が作成されてリモートにプッシュされる。`git tag -l`でローカルにタグが表示され、`git ls-remote --tags origin`でリモートに確認できる。

**失敗時：** プッシュが失敗する場合は書き込みアクセスがあることを確認する。タグが既に存在する場合は`git show v0.2.0`で正しいコミットを指しているか確認する。

### ステップ7: GitHubリリースの作成

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

または以下を使用する：

```r
usethis::use_github_release()
```

**期待結果：** リポジトリのReleasesページにリリースノートが表示されたGitHubリリースが作成される。

**失敗時：** `gh release create`が失敗する場合は`gh auth status`でghCLIが認証されているか確認する。`usethis::use_github_release()`が失敗する場合はGitHubで手動でリリースを作成する。

### ステップ8: 開発バージョンの設定

リリース後、開発バージョンにバンプする：

```r
usethis::use_dev_version()
```

これにより開発中を示す`0.2.0.9000`にバージョンが変更される。

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**期待結果：** DESCRIPTIONのバージョンが`0.2.0.9000`（開発バージョン）になる。NEWS.mdに開発バージョンの新しい見出しが追加される。変更がリモートにプッシュされる。

**失敗時：** `usethis::use_dev_version()`が利用できない場合、DESCRIPTIONのバージョンを手動で`x.y.z.9000`に変更し、NEWS.mdに`# packagename (development version)`見出しを追加する。

## バリデーション

- [ ] DESCRIPTIONのバージョンが意図したリリースと一致する
- [ ] NEWS.mdに完全で正確なリリースノートがある
- [ ] `R CMD check`がパスする
- [ ] gitタグがバージョンと一致する（例：`v0.2.0`）
- [ ] GitHubリリースがリリースノートとともに存在する
- [ ] リリース後の開発バージョンが設定されている（x.y.z.9000）

## よくある落とし穴

- **タグのプッシュ忘れ**: `git push`だけではタグはプッシュされない。`--tags`を使用するか`git push origin v0.2.0`を使用する
- **NEWS.md形式**: pkgdown/CRANが期待するMarkdown見出し形式を使用する
- **間違ったコミットへのタグ付け**: 常にバージョンバンプコミットの後にタグを付ける
- **CRANに既に存在するバージョン**: CRANは既に公開されているバージョンを受け付けない。常にインクリメントする
- **リリースに開発バージョンを含める**: CRANに`.9000`バージョンを決して投稿しないこと

## 関連スキル

- `submit-to-cran` - バージョンリリース後のCRAN投稿
- `create-github-release` - 一般的なGitHubリリースの作成
- `setup-github-actions-ci` - リリース時にpkgdownの再ビルドをトリガーする
- `build-pkgdown-site` - ドキュメントサイトが新しいバージョンを反映する
