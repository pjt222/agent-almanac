---
name: manage-backlog
description: >
  優先順位付きアイテム、受け入れ基準、見積もりを含むプロダクトまたはプロジェクトの
  バックログを作成・管理します。ユーザーストーリーの作成、MoSCoW優先順位付け、
  バックロググルーミング、アイテムの分割、ステータス追跡を網羅します。
  新しいプロジェクトを開始してスコープを実行可能なアイテムに変換する際、
  スプリント計画前の継続的なグルーミング時、ステークホルダーのフィードバックや
  スコープ変更後の再優先順位付け時、または大きすぎるアイテムを実装可能な
  部分に分割する際に使用します。
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
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
---

# プロダクトバックログの管理

アジャイルとクラシックのプロジェクト手法の両方に適用可能な、実施すべき作業の単一の信頼できる情報源として機能するバックログを作成し、優先順位付けし、維持します。

## 使用タイミング

- 新しいプロジェクトを開始してスコープを実行可能なアイテムに変換する場合
- スプリント計画前の継続的なバックロググルーミング
- ステークホルダーのフィードバックやスコープ変更後の作業の再優先順位付け
- 大きすぎるアイテムを実装可能な部分に分割する場合
- 完了またはキャンセルされたアイテムのレビューとアーカイブ

## 入力

- **必須**: プロジェクトスコープ（憲章、WBS、またはステークホルダーの入力から）
- **任意**: 更新する既存のバックログファイル（BACKLOG.md）
- **任意**: 優先順位付けフレームワークの好み（MoSCoW、価値/工数、WSJF）
- **任意**: 見積もりスケール（ストーリーポイント、Tシャツサイズ、人日）
- **任意**: バックログ更新が必要なスプリントまたはイテレーションのフィードバック

## 手順

### ステップ1: バックログ構造の作成または読み込み

バックログが存在しない場合、標準的な列を含むBACKLOG.mdを作成します。存在する場合は、読み取って構造を検証します。

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

**期待結果：** BACKLOG.mdが有効な構造とサマリー統計とともに存在している。

**失敗時：** ファイルが不正形式の場合、既存のアイテムデータを保持しながら構造を再構成します。

### ステップ2: アイテムを作成または改善する

各新規アイテムについて、ユーザーストーリーまたは要件として書きます:

- **ユーザーストーリー形式**: 「[役割]として、[利益]のために[機能]が欲しい」
- **要件形式**: 「[システム/コンポーネント]は[条件]の時に[動作]するものとする」

各アイテムには以下が必要です:
- ユニークなID（B-NNN、増分）
- 明確なタイトル（命令形の動詞形式）
- タイプ分類
- 少なくとも2つの受け入れ基準（テスト可能、合格/不合格の二値判定）

例:
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

**期待結果：** すべてのアイテムにタイトル、タイプ、受け入れ基準がある。

**失敗時：** 受け入れ基準のないアイテムはStatus: New（Readyではない）とマークされます。これらはスプリントに入れません。

### ステップ3: MoSCoWまたは価値/工数で優先順位付けする

選択した優先順位付けフレームワークを適用します:

**MoSCoW**（デフォルト）:
- **Must**: これがなければプロジェクトは失敗します。交渉の余地なし。
- **Should**: 重要だがこれなしでもプロジェクトは成功できます。キャパシティが許す場合に含めます。
- **Could**: あれば良いもの。Must/Shouldアイテムに影響がない場合のみ含めます。
- **Won't**: 現在のスコープから明示的に除外されます。将来の考慮のために文書化されます。

**価値/工数マトリクス**（代替案）:

| | 低工数 | 高工数 |
|---|-----------|-------------|
| **高価値** | 最初に実施（クイックウィン） | 次に実施（大きな賭け） |
| **低価値** | 3番目に実施（穴埋め） | 実施しない（無駄） |

バックログテーブルをソートします：Mustアイテムを最初に（Must内で価値順）、次にShould、次にCould。

**期待結果：** すべてのアイテムに優先順位がある。バックログが優先順位でソートされている。

**失敗時：** ステークホルダーが優先順位について意見が合わない場合、MustとShouldの決定をプロジェクトスポンサーにエスカレーションします。

### ステップ4: グルーミング — 分割、見積もり、改善

スプリント準備状況についてアイテムをレビューします。各アイテムについて:
1. **分割**: 見積もりが8ポイントを超える場合（または1週間以上の工数）、2〜4つの小さなアイテムに分解します
2. **見積もり**: プロジェクトで選択したスケールを使用します
3. **改善**: 曖昧な受け入れ基準をテスト可能な条件に改善します
4. **準備完了のマーク**: タイトル、受け入れ基準、見積もりがあり、ブロッカーがない場合にReadyとマークします

分割を文書化します:
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

**期待結果：** すべてのMustおよびShouldアイテムがReady状態になっている。

**失敗時：** 見積もれないアイテムには、バックログにスパイク（タイムボックス化されたリサーチタスク）を追加する必要があります。

### ステップ5: サマリーの更新とアーカイブ

サマリー統計を更新します。DoneおよびCancelledアイテムをアーカイブセクションに移動します:

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

各ステータスのアイテム数を数えてサマリーを更新します:
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**期待結果：** サマリー統計が実際のアイテム数と一致している。アーカイブセクションにすべてのクローズされたアイテムが含まれている。

**失敗時：** 数が一致しない場合、ステータス値をgrepして数え直し、サマリーを手動で更新します。

## バリデーション

- [ ] BACKLOG.mdが標準的な構造で存在している
- [ ] すべてのアイテムにユニークなID、タイトル、タイプ、優先順位、ステータスがある
- [ ] すべてのMustおよびShouldアイテムに受け入れ基準がある
- [ ] アイテムが優先順位でソートされている（Must最初、次にShould、次にCould）
- [ ] 分割なしに8ポイントを超えるアイテムがない
- [ ] サマリー統計が正確である
- [ ] Done/Cancelledアイテムがアーカイブされている

## よくある落とし穴

- **受け入れ基準なし**: 基準のないアイテムは完了として確認できません。すべてのアイテムには少なくとも2つのテスト可能な基準が必要です。
- **すべてがMust優先度**: アイテムの50%超がMustの場合、優先順位は機能していません。Must内で強制ランク付けします。
- **ゾンビアイテム**: 進捗なしに数ヶ月間バックログに滞留しているアイテムは再評価またはキャンセルするべきです。
- **コンテキストなしの見積もり**: ストーリーポイントは相対的です — チームには参照アイテムが必要です（例：「B-001が3ポイントの基準」）。
- **断片を作る分割**: 分割する際、各子アイテムが独立して提供可能で価値があることを確認します。
- **捨て場としてのバックログ**: バックログはウィッシュリストではありません。プロジェクト目標に整合しなくなったアイテムを定期的に整理します。
- **欠落した依存関係**: Notesフィールドにブロッキングアイテムを記録します。ブロックされたアイテムはReadyとマークするべきではありません。

## 関連スキル

- `draft-project-charter` — 憲章のスコープが初期バックログ作成に供給される
- `create-work-breakdown-structure` — WBSワークパッケージがバックログアイテムになる
- `plan-sprint` — スプリント計画がバックログの上位から選択する
- `generate-status-report` — バックログのバーンダウンがステータスレポートに供給される
- `conduct-retrospective` — 振り返りの改善アイテムがバックログにフィードバックされる
