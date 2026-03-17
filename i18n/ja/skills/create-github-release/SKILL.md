---
name: create-github-release
description: >
  適切なタグ付け、リリースノート、オプションのビルド成果物を含む
  GitHubリリースを作成します。セマンティックバージョニング、
  チェンジログ生成、GitHub CLIの使用方法を網羅。安定バージョンを
  配布用にマーク、ライブラリやアプリケーションの新バージョン公開、
  ステークホルダー向けリリースノート作成、ビルド成果物の配布時に使用。
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
  tags: github, release, git-tags, changelog, versioning
---

# GitHubリリースの作成

タグ付きGitHubリリースをリリースノートとオプションの成果物とともに作成する。

## 使用タイミング

- ソフトウェアの安定バージョンを配布用にマークするとき
- ライブラリやアプリケーションの新バージョンを公開するとき
- ステークホルダー向けのリリースノートを作成するとき
- ビルド成果物（バイナリ、tarball）を配布するとき

## 入力

- **必須**: バージョン番号（セマンティックバージョニング）
- **必須**: 前回リリースからの変更点の概要
- **任意**: 添付するビルド成果物
- **任意**: プレリリースかどうか

## 手順

### ステップ1: バージョン番号の決定

セマンティックバージョニング（`MAJOR.MINOR.PATCH`）に従う:

| 変更の種類 | 例 | タイミング |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 破壊的変更 |
| MINOR | 1.0.0 -> 1.1.0 | 後方互換性のある新機能 |
| PATCH | 1.0.0 -> 1.0.1 | バグ修正のみ |

**期待結果：** 前回リリースからの変更の範囲を正確に反映するバージョン番号が選択される。

**失敗時：** 変更が破壊的かどうか不明な場合、公開APIの差分をレビューする。エクスポートされた関数の削除またはシグネチャ変更はすべて、MAJORのバンプが必要な破壊的変更である。

### ステップ2: プロジェクトファイルのバージョン更新

- `DESCRIPTION`（Rパッケージ）
- `package.json`（Node.js）
- `Cargo.toml`（Rust）
- `pyproject.toml`（Python）

**期待結果：** バージョン番号が適切なプロジェクトファイルで更新され、バージョン管理にコミットされる。

**失敗時：** 前の手順（例: Rの `usethis::use_version()`）でバージョンがすでに更新されている場合、意図したリリースバージョンと一致しているか確認する。

### ステップ3: リリースノートの作成

チェンジログを作成または更新する。カテゴリ別に整理する:

```markdown
## What's Changed

### New Features
- Added user authentication (#42)
- Support for custom themes (#45)

### Bug Fixes
- Fixed crash on empty input (#38)
- Corrected date parsing in UTC (#41)

### Improvements
- Improved error messages
- Updated dependencies

### Breaking Changes
- `old_function()` renamed to `new_function()` (#50)

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

**期待結果：** リリースノートがカテゴリ別（機能、修正、破壊的変更）に整理され、トレーサビリティのためにIssue/PRの参照が含まれている。

**失敗時：** 変更の分類が難しい場合、`git log v1.0.0..HEAD --oneline` で前回リリース以降の変更リストを再構成する。

### ステップ4: Gitタグの作成

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**期待結果：** アノテーション付きタグ `v1.1.0` がローカルとリモートに存在する。`git tag -l` にタグが表示される。

**失敗時：** タグがすでに存在する場合、`git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` で削除してから再作成する。プッシュが拒否される場合、リモートへの書き込みアクセス権があるか確認する。

### ステップ5: GitHubリリースの作成

**GitHub CLI使用（推奨）**:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

成果物を添付する場合:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

プレリリースの場合:

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**期待結果：** GitHubにリリースがタグ、ノート、添付成果物（ある場合）とともに表示される。

**失敗時：** `gh` が認証されていない場合、`gh auth login` を実行する。タグがリモートに存在しない場合、先に `git push origin v1.1.0` でプッシュする。

### ステップ6: リリースノートの自動生成

GitHubはマージされたPRからノートを自動生成できる:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

`.github/release.yml` でカテゴリを設定する:

```yaml
changelog:
  categories:
    - title: New Features
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
    - title: Documentation
      labels:
        - documentation
    - title: Other Changes
      labels:
        - "*"
```

**期待結果：** リリースノートがマージされたPRのタイトルからラベル別にカテゴリ化されて自動生成される。`.github/release.yml` でカテゴリが制御される。

**失敗時：** 自動生成ノートが空の場合、PRがクローズではなくマージされていること、ラベルが割り当てられていることを確認する。代替手段としてノートを手動で記述する。

### ステップ7: リリースの確認

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**期待結果：** `gh release list` に新しいリリースが表示される。`gh release view` に正しいタイトル、タグ、ノート、アセットが表示される。

**失敗時：** リリースが見つからない場合、Actionsタブで失敗したリリースワークフローを確認する。`git tag -l` でタグが存在するか確認する。

## バリデーション

- [ ] バージョンタグがセマンティックバージョニングに従っている
- [ ] Gitタグが正しいコミットを指している
- [ ] リリースノートが変更を正確に説明している
- [ ] 成果物（ある場合）が添付されダウンロード可能である
- [ ] GitHubリポジトリページにリリースが表示されている
- [ ] プレリリースフラグが正しく設定されている

## よくある落とし穴

- **誤ったコミットへのタグ付け**: タグ付け前に必ず `git log` を確認する。バージョンバンプのコミット後にタグ付けする。
- **タグのプッシュ忘れ**: `git push` はタグをプッシュしない。`git push --tags` または `git push origin v1.1.0` を使用する。
- **バージョン形式の不統一**: `v1.0.0` と `1.0.0` のどちらかに決めて統一する。
- **空のリリースノート**: 常に意味のあるノートを提供する。ユーザーは何が変わったかを知る必要がある。
- **タグの削除と再作成**: プッシュ後のタグ変更は避ける。必要であれば新しいバージョンを作成する。

## 関連スキル

- `commit-changes` - ステージングとコミットのワークフロー
- `manage-git-branches` - リリース準備のためのブランチ管理
- `release-package-version` - R固有のリリースワークフロー
- `configure-git-repository` - Gitセットアップの前提条件
- `setup-github-actions-ci` - CIを通じたリリースの自動化
