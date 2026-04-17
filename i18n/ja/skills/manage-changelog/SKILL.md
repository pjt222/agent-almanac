---
name: manage-changelog
description: >
  Keep a Changelog形式に従ったチェンジログの維持管理。エントリの分類（Added、
  Changed、Deprecated、Removed、Fixed、Security）、バージョンセクションの管理、
  未リリースの追跡を網羅する。チェンジログが必要な新しいプロジェクトを開始する時、
  機能やフィックスの完了後にエントリを追加する時、未リリースエントリをバージョン
  付きセクションに昇格させてリリースを準備する時、またはフリーフォームのチェンジ
  ログをKeep a Changelog形式に変換する時に使用する。
license: MIT
allowed-tools: Read Write Edit Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: basic
  language: multi
  tags: versioning, changelog, documentation, keep-a-changelog
  locale: ja
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# チェンジログの管理

[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)形式に従ってプロジェクトのチェンジログを維持管理する。このスキルは新しいチェンジログの作成、エントリの分類、`[Unreleased]`セクションの管理、リリース時のバージョン付きセクションへのエントリ昇格を網羅する。検出された場合はR規約（`NEWS.md`）に適応する。

## 使用タイミング

- チェンジログが必要な新しいプロジェクトを開始する時
- 機能、フィックス、その他の変更の完了後にエントリを追加する時
- 未リリースエントリをバージョン付きセクションに移動してリリースを準備する時
- 公開前にチェンジログの完全性を確認する時
- フリーフォームのチェンジログをKeep a Changelog形式に変換する時

## 入力

- **必須**: プロジェクトルートディレクトリ
- **必須**: 文書化する変更の説明（またはgitログからの抽出元）
- **任意**: 対象バージョン番号（リリース昇格用）
- **任意**: リリース日（デフォルトは今日）
- **任意**: チェンジログ形式の好み（Keep a ChangelogまたはR NEWS.md）

## 手順

### ステップ1: チェンジログの検索または作成

プロジェクトルートで既存のチェンジログを検索する。

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

チェンジログが存在しない場合、標準ヘッダーで作成する:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

Rパッケージの場合、R規約のフォーマットで`NEWS.md`を使用する:

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

**期待結果:** チェンジログファイルが適切なヘッダーとUnreleasedセクションで検索または作成されること。

**失敗時:** 非標準形式のチェンジログが存在する場合、上書きしない。代わりに形式の違いを注記し、既存のスタイルに合わせてエントリを適応する。

### ステップ2: 既存エントリの解析

チェンジログを読み、その構造を特定する:

1. ヘッダー/プリアンブル（プロジェクト名、形式の説明）
2. 保留中の変更を含む`[Unreleased]`セクション
3. 逆時系列順のバージョン付きセクション（`[1.2.0]`が`[1.1.0]`の前）
4. 末尾の比較リンク（任意）

各セクションについて、存在するカテゴリを特定する:
- **Added** -- 新機能
- **Changed** -- 既存機能の変更
- **Deprecated** -- 近く削除される機能
- **Removed** -- 削除された機能
- **Fixed** -- バグ修正
- **Security** -- 脆弱性の修正

**期待結果:** チェンジログの構造が理解され、既存のエントリが棚卸しされること。

**失敗時:** チェンジログが不正な形式（セクション欠落、順序の誤り）の場合、問題を注記するが確認なしに再構成しない。新しいエントリを正しく追加し、構造的な問題を手動レビュー用にフラグする。

### ステップ3: 新しい変更の分類

文書化する各変更を6つのカテゴリの1つに分類する:

| Category | When to Use | Example Entry |
|---|---|---|
| Added | New feature or capability | `- Add CSV export for summary reports` |
| Changed | Modification to existing feature | `- Change default timeout from 30s to 60s` |
| Deprecated | Feature marked for future removal | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | Feature or capability removed | `- Remove legacy XML parser` |
| Fixed | Bug fix | `- Fix off-by-one error in pagination` |
| Security | Vulnerability fix | `- Fix SQL injection in user search (CVE-2026-1234)` |

エントリの記述ガイドライン:
- 各エントリを命令法の動詞で始める（Add、Change、Fix、Remove）
- コードを読まなくてもユーザーが影響を理解できるほど具体的にする
- 該当する場合はイシュー番号やCVEを参照する
- エントリは1行に収める; 複雑な変更にのみサブ箇条書きを使用する

**期待結果:** 各変更が適切に記述されたエントリとともに正確に1つのカテゴリに割り当てられること。

**失敗時:** 変更が複数のカテゴリにまたがる場合（例えば機能の追加とバグの修正の両方）、関連する各カテゴリに別々のエントリを作成する。カテゴリが不明な場合、デフォルトで「Changed」を使用する。

### ステップ4: Unreleasedセクションへのエントリ追加

分類されたエントリを`[Unreleased]`セクションに挿入する。カテゴリの順序を維持する: Added、Changed、Deprecated、Removed、Fixed、Security。

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

エントリのあるカテゴリのみを追加する; 空のカテゴリ見出しは含めない。

**期待結果:** 新しいエントリが正しいカテゴリで`[Unreleased]`に追加され、一貫したフォーマットが維持されること。

**失敗時:** Unreleasedセクションが存在しない場合、ヘッダー/プリアンブルの直下、最初のバージョン付きセクションの上に作成する。

### ステップ5: リリース時のバージョン付きセクションへの昇格

リリースを作成する際、すべてのUnreleasedエントリを新しいバージョン付きセクションに移動する:

1. 新しいセクション見出しを作成する: `## [1.3.0] - 2026-02-17`
2. `[Unreleased]`のすべてのエントリを新しいセクションに移動する
3. `[Unreleased]`を空にする（ただし見出しは残す）
4. ファイル末尾の比較リンクを更新する

```markdown
## [Unreleased]

## [1.3.0] - 2026-02-17

### Added

- Add batch processing mode for large datasets

### Fixed

- Fix memory leak when processing files over 1GB

## [1.2.0] - 2026-01-15

### Added

- Add CSV export for summary reports
```

比較リンクを更新する（末尾にある場合）:

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

R `NEWS.md`の場合、R規約を使用する:

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

**期待結果:** Unreleasedエントリが日付付きバージョンセクションに移動され、Unreleasedセクションがクリアされ、比較リンクが更新されること。

**失敗時:** バージョン番号が既存のセクションと競合する場合、そのバージョンはすでにリリースされている。正しいバージョンを決定するために`apply-semantic-versioning`で確認する。

### ステップ6: チェンジログ形式の検証

チェンジログが形式要件を満たしていることを検証する:

1. バージョンが逆時系列順である（最新が最初）
2. 日付がISO 8601形式（YYYY-MM-DD）に従っている
3. 各バージョンセクションに少なくとも1つの分類されたエントリがある
4. バージョンセクションの重複がない
5. 比較リンク（存在する場合）がバージョンセクションと一致する

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

**期待結果:** チェンジログがすべての形式チェックに警告なしで合格すること。

**失敗時:** 発見された形式の問題を修正する: セクションの並べ替え、日付形式の修正、重複の除去。人間の判断が必要な問題（例えば既知の変更に対する欠落エントリ）を報告する。

## バリデーション

- [ ] Keep a ChangelogとSemVerを参照する適切なヘッダーのチェンジログファイルが存在する
- [ ] `[Unreleased]`セクションが上部（ヘッダーの下）に存在する
- [ ] すべての新しいエントリがAdded/Changed/Deprecated/Removed/Fixed/Securityに分類された
- [ ] エントリが命令法の動詞で始まりユーザーへの影響を説明する
- [ ] バージョン付きセクションが逆時系列順である
- [ ] 日付がISO 8601形式（YYYY-MM-DD）を使用する
- [ ] バージョンセクションの重複がない
- [ ] 比較リンク（使用する場合）が正確で最新である
- [ ] 空のカテゴリが含まれていない（エントリのない見出しがない）

## よくある落とし穴

- **内部のみのエントリ**: 「データベースモジュールをリファクタリング」はユーザーに有用ではない。ユーザーに面する変更に焦点を当てる。内部のリファクタリングはコミットメッセージに入れ、チェンジログには入れない。
- **曖昧なエントリ**: 「様々なバグ修正」はユーザーに何も伝えない。各修正は具体的で説明的なエントリであるべきである。
- **Unreleasedの忘却**: バージョン付きセクションに直接エントリを追加すると、変更がまだリリースされていないのにリリース済みとして文書化される。
- **誤ったカテゴリ**: 実際には新機能を追加する「修正」。修正は期待される動作を復元するもの; バグレポートとして要求されたものでも新しい機能は「Added」である。
- **Securityエントリの欠落**: セキュリティ修正は利用可能な場合、常にCVE識別子とともに文書化すべきである。ユーザーは緊急アップグレードが必要かどうかを知る必要がある。
- **チェンジログのドリフト**: 変更時にチェンジログを更新しないこと。リリース前にエントリを一括で書くと、見逃されたり不十分に記述された変更につながる。コード変更とともにエントリを書く。

## 関連スキル

- `apply-semantic-versioning` -- チェンジログエントリと対になるバージョン番号の決定
- `plan-release-cycle` -- チェンジログエントリがバージョン付きセクションに昇格されるタイミングの定義
- `commit-changes` -- 適切なメッセージでのチェンジログ更新のコミット
- `release-package-version` -- NEWS.mdの更新を含むR固有のリリースワークフロー
- `create-github-release` -- チェンジログの内容をGitHubリリースノートとして使用
