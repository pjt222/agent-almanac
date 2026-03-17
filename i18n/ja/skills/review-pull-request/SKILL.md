---
name: review-pull-request
description: >
  GitHub CLIを使用してプルリクエストをエンドツーエンドでレビューする。差分分析、
  コミット履歴のレビュー、CI/CDチェックの検証、重大度付きフィードバック
  （blocking/suggestion/nit/praise）、およびgh pr reviewの提出を網羅する。
  レビューに割り当てられたプルリクエスト、他者のレビューを依頼する前の
  セルフレビュー、フィードバック対応後の再レビュー、またはマージ済みPRの
  事後品質評価に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, pull-request, github, code-review, gh-cli, feedback, pr
---

# Review Pull Request

GitHubプルリクエストを変更の理解から構造化されたフィードバックの提出まで、エンドツーエンドでレビューする。すべてのGitHubとのやり取りに `gh` CLIを使用し、重大度付きのレビューコメントを生成する。

## 使用タイミング

- プルリクエストがレビュー準備完了で自分に割り当てられている場合
- 著者がフィードバックに対応した後の再レビューを実施する場合
- 他者のレビューを依頼する前に自分のPRを確認する（セルフレビュー）
- マージ済みPRの事後品質評価を監査する場合
- アドホックなスキャンではなく構造化されたレビュープロセスが必要な場合

## 入力

- **必須**: PR識別子（番号、URL、または `owner/repo#number`）
- **任意**: レビューの焦点（セキュリティ、パフォーマンス、正確性、スタイル）
- **任意**: コードベースへの習熟度（習熟、ある程度、不慣れ）
- **任意**: レビューの時間予算（クイックスキャン、標準、徹底的）

## 手順

### ステップ1: コンテキストの理解

PRの説明を読み、変更が何を達成しようとしているかを理解する。

1. PRのメタデータを取得する：
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. PRのタイトルと説明を読む：
   - このPRはどの問題を解決しているか？
   - 著者はどのようなアプローチを取ったか？
   - 著者が特にレビューを求めている領域はあるか？
3. PRのサイズを確認し、必要な時間を評価する：

```
PR Size Guide:
+--------+-----------+---------+-------------------------------------+
| Size   | Files     | Lines   | Review Approach                     |
+--------+-----------+---------+-------------------------------------+
| Small  | 1-5       | <100    | Read every line, quick review       |
| Medium | 5-15      | 100-500 | Focus on logic changes, skim config |
| Large  | 15-30     | 500-    | Review by commit, focus on critical  |
|        |           | 1000    | files, flag if should be split       |
| XL     | 30+       | 1000+   | Flag for splitting. Review only the  |
|        |           |         | most critical files.                 |
+--------+-----------+---------+-------------------------------------+
```

4. コミット履歴をレビューする：
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - コミットは論理的で整理されているか？
   - 履歴はストーリーを語っているか（各コミットが一貫したステップ）？
5. CI/CDステータスを確認する：
   ```bash
   gh pr checks <number>
   ```
   - すべてのチェックが通過しているか？
   - チェックが失敗している場合は、どのチェックかを記録する — これがレビューに影響する

**期待結果：** PRが何をするか、なぜ存在するか、どれくらい大きいか、CIがグリーンかどうかについて明確に理解できている。このコンテキストがレビューのアプローチを形成する。

**失敗時：** PRの説明が空または不明確な場合は、これを最初のフィードバックとして記録する。コンテキストのないPRはレビューのアンチパターンである。`gh` コマンドが失敗する場合は、認証を確認する（`gh auth status`）とリポジトリへのアクセスを確認する。

### ステップ2: 差分の分析

実際のコード変更を体系的に読む。

1. 完全な差分を取得する：
   ```bash
   gh pr diff <number>
   ```
2. **小/中規模PR**の場合は、差分全体を順番に読む
3. **大規模PR**の場合は、コミットごとにレビューする：
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. 各変更ファイルについて評価する：
   - **正確性**: コードはPRが言っていることを実行しているか？
   - **エッジケース**: 境界条件が処理されているか？
   - **エラーハンドリング**: エラーが適切にキャッチ・処理されているか？
   - **セキュリティ**: インジェクション、認証、データ公開のリスクはあるか？
   - **パフォーマンス**: 明らかなO(n²)ループ、欠落インデックス、メモリ問題はあるか？
   - **命名**: 新しい変数/関数/クラスが明確に命名されているか？
   - **テスト**: 新しい動作がテストでカバーされているか？
5. 読みながらメモを取り、各観察を重大度で分類する

**期待結果：** 差分のすべての意味のある変更について正確性、セキュリティ、パフォーマンス、品質をカバーする観察のセットが得られる。各観察には重大度レベルがある。

**失敗時：** 差分が大きすぎて効果的にレビューできない場合は、指摘する：「このPRは{N}ファイルと{M}行を変更しています。より効果的なレビューのために小さなPRに分割することをお勧めします。」それでも最もリスクの高いファイルをレビューする。

### ステップ3: フィードバックの分類

観察を重大度レベルに整理する。

1. 各観察を分類する：

```
Feedback Severity Levels:
+-----------+------+----------------------------------------------------+
| Level     | Icon | Description                                        |
+-----------+------+----------------------------------------------------+
| Blocking  | [B]  | Must fix before merge. Bugs, security issues,      |
|           |      | data loss risks, broken functionality.             |
| Suggest   | [S]  | Should fix, but won't block merge. Better           |
|           |      | approaches, missing edge cases, style issues that   |
|           |      | affect maintainability.                            |
| Nit       | [N]  | Optional improvement. Style preferences, minor      |
|           |      | naming suggestions, formatting.                    |
| Praise    | [P]  | Good work worth calling out. Clever solutions,      |
|           |      | thorough testing, clean abstractions.              |
+-----------+------+----------------------------------------------------+
```

2. 各Blockingアイテムについて説明する：
   - 何が問題か（特定の問題）
   - なぜ重要か（影響）
   - 修正方法（具体的な提案）
3. 各Suggestアイテムについて、代替案とその理由を説明する
4. Nitは簡潔に — 1文で十分
5. 何かポジティブなものがあれば少なくとも1つのPraiseを含める

**期待結果：** 明確な重大度レベルを持つフィードバックのソートされたリスト。Blockingアイテムには修正提案がある。比率は一般的に：Blockingが少数、Suggestがいくつか、Nitが最小限、Praiseが少なくとも1つ。

**失敗時：** すべてがBlockingに見える場合は、PRをパッチ適用よりも作り直す必要があるかもしれない。行ごとのコメントではなくPRレベルで変更を要求することを検討する。何も問題がないように見える場合は、そのように伝える — コードが良好な場合は「LGTM」は有効なフィードバックである。

### ステップ4: レビューコメントの執筆

構造化された実行可能なフィードバックでレビューを作成する。

1. **レビューサマリー**（トップレベルのコメント）を執筆する：
   - 1文：PRが何をするか（理解の確認）
   - 全体的な評価：承認、変更要求、またはコメント
   - 主要なアイテム：Blockingの問題（ある場合）と主要なSuggestアイテムをリスト
   - Praise：良い仕事を称える
2. 特定のコードの場所への**インラインコメント**を執筆する：
   ```bash
   # Post inline comments via gh API
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] This SQL query is vulnerable to injection. Use parameterized queries instead.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. フィードバックを一貫してフォーマットする：
   - 各コメントを重大度タグで始める：`[B]`、`[S]`、`[N]`、または `[P]`
   - 具体的な修正にはGitHubのsuggestionブロックを使用する
   - スタイル/パターンの提案にはドキュメントへのリンクを貼る
4. レビューを提出する：
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

**期待結果：** 明確で実行可能なフィードバックを含む提出済みのレビュー。著者は何を修正すべきか（Blocking）、何を検討すべきか（Suggest）、何が良かったか（Praise）を正確に把握している。

**失敗時：** `gh pr review` が失敗する場合は権限を確認する。リポジトリへの書き込みアクセスまたは要請されたレビュアーであることが必要。インラインコメントが失敗する場合は、file:line参照を含むレビュー本文にすべてのフィードバックを記載する。

### ステップ5: フォローアップ

レビューの解決を追跡する。

1. 著者が返答したり更新をプッシュした後：
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. フィードバックに対応した変更のみを再レビューする：
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. 承認前にBlockingアイテムが解決されているか確認する
4. 問題が対応されたらコメントスレッドを解決する
5. すべてのBlockingアイテムが修正されたら承認する：
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

**期待結果：** Blockingの問題が修正済みとして検証されている。レビューの会話が解決されている。PRが承認されているか、残りの具体的な項目を含む追加変更が要求されている。

**失敗時：** 著者がフィードバックに同意しない場合は、PRスレッドで議論する。権威ではなく影響（なぜ重要か）に焦点を当てる。Blockingでない項目について意見の相違が続く場合は、潔く譲る — 著者がコードを所有している。

## バリデーション

- [ ] PRのコンテキストを理解している（目的、サイズ、CIステータス）
- [ ] すべての変更ファイルをレビューした（XL PRの場合は最もリスクの高いファイル）
- [ ] フィードバックを重大度で分類した（Blocking/Suggest/Nit/Praise）
- [ ] Blockingアイテムに具体的な修正提案がある
- [ ] ポジティブな側面に対して少なくとも1つのPraiseが含まれている
- [ ] レビュー決定がフィードバックと一致している（Blockingアイテムがない場合のみ承認）
- [ ] インラインコメントが重大度タグを含む特定の行を参照している
- [ ] CI/CDチェックが検証されている（承認前にグリーン）
- [ ] 著者の改訂後にフォローアップが完了している

## よくある落とし穴

- **形式的な承認**: 実際に差分を読まずに承認すること。すべての承認は品質の主張である
- **Nitの洪水**: スタイルの好みで著者を溺れさせる。メンタリングの状況のためにNitを残す；時間が重要なレビューではスキップする
- **全体像を見失う**: 全体的なデザインを理解せずに行ごとにレビューする。まずPRの説明とコミット履歴を読む
- **スタイルでBlockingにする**: フォーマットと命名はほぼ決してBlockingではない。バグ、セキュリティ、データの整合性のためにBlockingを使用する
- **Praiseなし**: 問題のみを指摘するのは士気を下げる。良いコードには認識が値する
- **レビュースコープの拡大**: PRで変更されていないコードにコメントする。既存の問題が気になる場合は別のIssueを作成する

## 関連スキル

- `review-software-architecture` — システムレベルのアーキテクチャレビュー（PRレベルのレビューを補完）
- `security-audit-codebase` — セキュリティ重要な変更を含むPRの深いセキュリティ分析
- `create-pull-request` — プロセスの反対側：レビューしやすいPRの作成
- `commit-changes` — クリーンなコミット履歴はPRレビューを大幅に容易にする
