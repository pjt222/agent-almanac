---
name: create-github-issues
description: >
  レビュー結果やタスク分解からGitHub Issueを構造的に作成します。
  関連する調査結果を論理的なIssueにグループ化し、ラベルを適用し、
  概要・調査結果・受け入れ条件を含む標準テンプレートでIssueを作成します。
  review-codebaseや類似のレビュースキルの出力を取り込むことを想定して設計。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
---

# GitHub Issueの作成

レビュー結果やタスク分解から構造的にGitHub Issueを作成する。`review-codebase`、`security-audit-codebase`、または手動分析による調査結果のリストを、ラベル・受け入れ条件・相互参照を持つ適切に整形されたGitHub Issueに変換する。

## 使用タイミング

- コードベースレビューが追跡が必要な調査結果テーブルを生成した後
- 計画セッションでIssueにすべき作業項目が特定された後
- TODOリストやバックログをGitHubの追跡可能なIssueに変換するとき
- 一貫したフォーマットとラベル付けが必要な関連Issueをまとめて作成するとき

## 入力

- **必須**: `findings` — 各アイテムに最低限タイトルと説明を含む項目のリスト。理想的には深刻度、影響を受けるファイル、提案ラベルも含む
- **任意**:
  - `group_by` — 調査結果をIssueにまとめる方法: `severity`（深刻度）、`file`（ファイル）、`theme`（テーマ）（デフォルト: `theme`）
  - `label_prefix` — 自動作成ラベルのプレフィックス（デフォルト: なし）
  - `create_labels` — 存在しないラベルを作成するか（デフォルト: `true`）
  - `dry_run` — Issueを作成せずにプレビューする（デフォルト: `false`）

## 手順

### ステップ1: ラベルの準備

リポジトリに必要なラベルがすべて存在することを確認する。

1. 既存ラベルを一覧表示: `gh label list --limit 100`
2. 調査結果が必要とするラベルを特定（深刻度、フェーズ、または明示的なラベルフィールドから）
3. 深刻度をラベルにマッピング（未マッピングの場合）: `critical`、`high-priority`、`medium-priority`、`low-priority`
4. フェーズ/テーマをラベルにマッピング: `security`、`architecture`、`code-quality`、`accessibility`、`testing`、`performance`
5. `create_labels` がtrueの場合、不足ラベルを作成: `gh label create "name" --color "hex" --description "desc"`
6. 一貫した色を使用: critical/securityは赤、highはオレンジ、mediumは黄、architectureは青、testingは緑

**期待結果：** 調査結果が参照するすべてのラベルがリポジトリに存在する。重複したラベルが作成されていない。

**失敗時：** `gh` CLIが認証されていない場合、ユーザーに `gh auth login` の実行を指示する。ラベル作成が拒否された場合（権限不足）、ラベルなしで続行し、不足しているラベルを記録する。

### ステップ2: 調査結果のグループ化

関連する調査結果を論理的なIssueにまとめてIssueの増殖を防ぐ。

1. `group_by` が `theme` の場合: フェーズまたはカテゴリ別にグループ化（すべてのセキュリティ調査結果 → 1〜2件のIssue、すべてのa11y → 1件のIssue）
2. `group_by` が `severity` の場合: 深刻度レベル別にグループ化（すべてのCRITICAL → 1件のIssue、すべてのHIGH → 1件のIssue）
3. `group_by` が `file` の場合: 主に影響を受けるファイルでグループ化
4. 各グループ内で調査結果を深刻度順に並べる（CRITICAL優先）
5. グループに8件を超える調査結果がある場合、サブテーマ別にサブグループに分割する
6. 各グループが1件のGitHub Issueになる

**期待結果：** 関連する1〜8件の調査結果を含むIssueグループのセットが作成される。Issueの総数が管理可能な範囲（コードベースの完全レビューで通常5〜15件）になる。

**失敗時：** 調査結果にグループ化メタデータがない場合、調査結果1件につき1件のIssueにフォールバックする。これは少数の調査結果（10件未満）では許容されるが、多数の場合はIssueが多くなりすぎる。

### ステップ3: Issueの構成

標準テンプレートを使用して各Issueを作成する。

1. **タイトル**: `[深刻度] テーマ: 簡単な説明` — 例: `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **本文**の構造:
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. ラベルを適用: 深刻度ラベル + テーマラベル + カスタムラベル
4. 調査結果が特定のファイルを参照する場合、本文に記載する（アサインとしてではなく）

**期待結果：** 各Issueに明確なタイトル、深刻度バッジ付きの番号付き調査結果、チェックボックス形式の受け入れ条件、適切なラベルが含まれている。

**失敗時：** 本文がGitHubのIssueサイズ制限（65536文字）を超える場合、Issueを複数のパートに分割して相互参照する。

### ステップ4: Issueの作成

`gh` CLIを使用してIssueを作成し、結果を報告する。

1. `dry_run` がtrueの場合、各Issueのタイトルと本文を作成せずに出力して停止する
2. 各構成済みIssueを作成する:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. 作成された各IssueのURLを記録する
4. すべてのIssueを作成した後、概要テーブルを出力する: `#番号 | タイトル | ラベル | 調査結果の件数`
5. Issueの順序付けが必要な場合、相互参照を追加する: 最初のIssueを編集して「Blocked by #X」または「See also #Y」を記載する

**期待結果：** すべてのIssueが正常に作成される。Issue番号とURLを含む概要テーブルが出力される。

**失敗時：** 個別のIssue作成が失敗した場合、エラーをログに記録して残りのIssueの処理を続ける。最後に失敗を報告する。一般的な失敗原因: 認証の期限切れ、ラベルが見つからない（`create_labels` がfalseの場合）、ネットワークタイムアウト。

## バリデーション

- [ ] すべての調査結果が少なくとも1件のIssueに含まれている
- [ ] 各Issueに少なくとも1つのラベルがある
- [ ] 各Issueにチェックボックス形式の受け入れ条件がある
- [ ] 重複したIssueが作成されていない（タイトルを既存のオープンIssueと照合）
- [ ] 調査結果の件数に対してIssue数が適切である（大規模なセットで1:1になっていない）
- [ ] すべてのIssueのURLを含む概要テーブルが出力された

## よくある落とし穴

- **Issueの増殖**: 調査結果1件につき1件のIssueを作成すると20件以上のIssueが生まれ管理が困難になる。積極的にグループ化すること — 完全なレビューからは5〜10件のIssueが理想的
- **受け入れ条件の欠如**: チェックボックスのないIssueは完了を検証できない。すべての調査結果は少なくとも1つのチェックボックスに対応させる
- **ラベルの混乱**: ラベルを多く作りすぎるとフィルタリングが意味をなさなくなる。深刻度とテーマのみに絞り、調査結果ごとのラベルは避ける
- **古い参照**: 古いレビューからIssueを作成する場合、Issue作成前に調査結果が依然として該当するか確認する。コードが変更されている可能性がある
- **dry run忘れ**: 大量の調査結果の場合、必ず先に `dry_run: true` でプレビューする。計画の編集は15件の誤ったIssueをクローズするよりはるかに簡単

## 関連スキル

- `review-codebase` — このスキルが取り込む調査結果テーブルを生成する
- `review-pull-request` — IssueにもなりえるPRスコープの調査結果を生成する
- `manage-backlog` — 作成後のIssueをスプリントと優先度に整理する
- `create-pull-request` — Issueを参照してクローズするPRを作成する
- `commit-changes` — Issueを解決する修正をコミットする
