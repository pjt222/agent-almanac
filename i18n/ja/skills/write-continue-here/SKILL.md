---
name: write-continue-here
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
  locale: ja
  source_locale: en
  source_commit: 025eea68
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Write Continue Here

次のセッションが完全な文脈で始まるように、構造化された継続ファイルを書く。

## 使用タイミング

- 進行中の作業を残してセッションを終える
- セッション間で複雑なタスクを引き渡す
- git が捕えられない意図、失敗したアプローチ、次ステップを保存
- タスクの途中で Claude Code を閉じる前

## 入力

- **必須**: 要約する最近の作業を持つアクティブセッション
- **任意**: 引き渡しで何を強調するかについての具体的指示

## 手順

### ステップ1: セッション状態を評価する

最近の作業に関する事実を集める:

```bash
git log --oneline -5
git status
git diff --stat
```

会話文脈をレビュー: 目的は何だったか、何が完了したか、何が部分的に行われたか、何が試され失敗したか、何の決定がなされたか。

**期待結果：** 現タスク状態の明確な理解 — 完了アイテム、進行中アイテム、計画次ステップ。

**失敗時：** git リポジトリでなければ、git コマンドをスキップする。継続ファイルはなお会話文脈とタスク状態を捕えられる。

### ステップ2: CONTINUE_HERE.md を書く

下の構造を使ってプロジェクトルートにファイルを書く。すべてのセクションは実行可能なコンテンツを含まねばならず、プレースホルダではない。

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

ガイドライン:
- **Objective**: WHY を捕える — git log は何が変わったかを示し、なぜかは示さない
- **Completed**: 再作業を防ぐためアイテムを明確に done とマーク
- **In Progress**: これが最高価値セクション — 部分状態が再構築するに最も難しい
- **Next Steps**: 優先順位で番号付け。ユーザー依存アイテムを `**[USER]**` でプレフィックス
- **Context**: 負空間を記録 — 何が試され拒否されたか、なぜか

**期待結果：** 現セッションからの実コンテンツが入った全 5 セクションを持つプロジェクトルートの CONTINUE_HERE.md ファイル。タイムスタンプとブランチが正確。

**失敗時：** Write が失敗したら、ファイル権限を確認する。ファイルはプロジェクトルート（`.git/` と同じディレクトリ）に作成されるべき。`.gitignore` が `CONTINUE_HERE.md` を含むことを検証 — でなければ加える。

### ステップ3: ファイルを検証する

CONTINUE_HERE.md を読み返して確認:
- タイムスタンプが現在（過去数分以内）
- ブランチ名が `git branch --show-current` と一致
- 全 5 セクションが実コンテンツを含む（テンプレートプレースホルダなし）
- Next Steps が番号付けされ実行可能
- In Progress アイテムが再開するに十分具体的に現状態を記述

**期待結果：** ファイルが新鮮なセッションが即座に作業を再開するに使えるような明確で実行可能な引き渡しとして読める。

**失敗時：** プレースホルダテキストを含むまたは曖昧すぎるセクションを編集する。各セクションはテストをパスすべき: 「新鮮なセッションが明確化質問なしにこれに行動できるか？」

## バリデーション

- [ ] CONTINUE_HERE.md がプロジェクトルートに存在
- [ ] ファイルが実コンテンツ（プレースホルダではなく）を持つ全 5 セクションを含む
- [ ] タイムスタンプとブランチが正確
- [ ] `.gitignore` が `CONTINUE_HERE.md` を含む
- [ ] Next Steps が番号付けされ実行可能
- [ ] In Progress アイテムが質問なしに再開するに十分な詳細を指定

## よくある落とし穴

- **コンテンツの代わりにプレースホルダを書く**: 「TODO: 後で埋める」は目的を破る。すべてのセクションは現セッションからの実情報を含まねばならない。
- **git 状態を複製**: 変更されたすべてのファイルを列挙しない — git が既にそれを追跡する。意図、部分状態、次ステップに焦点。
- **Context セクションを忘れる**: 失敗したアプローチが記録するに最も価値あること。それなしには、次セッションが同じ死路をリトライする。
- **読まずに上書き**: CONTINUE_HERE.md が前セッションから既に存在するなら、まずそれを読む — 早い引き渡しからの未完了作業を含むかもしれない。
- **古いファイルを残す**: CONTINUE_HERE.md はエフェメラル。次セッションがそれを消費した後、削除する。古いファイルは混乱を引き起こす。

## 関連スキル

- `read-continue-here` — 補完: セッション開始時に継続ファイルを読み行動する
- `bootstrap-agent-identity` — 本スキルが生む継続ファイルを消費するコールドスタートアイデンティティ再構築
- `manage-memory` — 持続的なクロスセッション知識（このエフェメラルな引き渡しを補完）
- `commit-changes` — 継続ファイルを書く前に作業を git に保存
- `write-claude-md` — 任意の継続性ガイダンスが住むプロジェクト指示
