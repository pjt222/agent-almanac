---
name: review-ux-ui
description: >
  Nielsenの10ヒューリスティクス、WCAG 2.1アクセシビリティガイドライン、キーボードと
  スクリーンリーダーの監査、ユーザーフロー分析、認知負荷評価、フォームユーザビリティ
  評価を用いてユーザーエクスペリエンスとインターフェースデザインをレビューする。
  リリース前のユーザビリティレビュー、WCAG 2.1アクセシビリティ準拠の評価、
  ユーザーフローの効率性評価、フォームデザインのレビュー、または既存インターフェースの
  ヒューリスティック評価に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: ux, ui, accessibility, wcag, heuristics, usability, user-flows, cognitive-load
---

# Review UX/UI

ユーザーエクスペリエンスとインターフェースデザインをユーザビリティ、アクセシビリティ、効果性について評価する。

## 使用タイミング

- リリース前にアプリケーションのユーザビリティレビューを実施する場合
- アクセシビリティ準拠を評価する場合（WCAG 2.1 AAまたはAAA）
- 効率性とエラー防止のためにユーザーフローを評価する場合
- ユーザビリティとコンバージョン最適化のためにフォームデザインをレビューする場合
- 既存インターフェースのヒューリスティック評価を実施する場合
- 認知負荷と情報アーキテクチャを評価する場合

## 入力

- **必須**: レビュー対象のアプリケーション（URL、プロトタイプ、またはソースコード）
- **必須**: ターゲットユーザーの説明（役割、技術的習熟度、使用コンテキスト）
- **任意**: ユーザーリサーチの所見（インタビュー、調査、分析）
- **任意**: WCAG適合ターゲット（A、AA、またはAAA）
- **任意**: 評価する特定のユーザーフローまたはタスク
- **任意**: テストする支援技術（スクリーンリーダー、スイッチアクセス）

## 手順

### ステップ1: ヒューリスティック評価（Nielsenの10ヒューリスティクス）

各ヒューリスティクスに対してインターフェースを評価する：

| # | ヒューリスティクス | 主な問い | 評価 |
|---|-----------|-------------|--------|
| 1 | **システムステータスの可視性** | システムは常にユーザーに何が起きているか知らせているか？ | |
| 2 | **システムと実世界の一致** | システムはなじみのある言語や概念を使用しているか？ | |
| 3 | **ユーザーの自由と制御** | ユーザーは不要な状態を簡単に元に戻したり、やり直したり、終了したりできるか？ | |
| 4 | **一貫性と標準** | 類似した要素は全体で同じ動作をするか？ | |
| 5 | **エラー防止** | デザインがエラーを発生前に防ぐか？ | |
| 6 | **認識であって想起ではない** | オプション、アクション、情報が見えるか、簡単に取り出せるか？ | |
| 7 | **柔軟性と使用効率** | 初心者を混乱させることなく熟練ユーザーへのショートカットがあるか？ | |
| 8 | **審美的でミニマルなデザイン** | すべての要素が目的を持っているか？不要な混雑がないか？ | |
| 9 | **エラーの認識、診断、回復** | エラーメッセージは明確で具体的かつ建設的か？ | |
| 10 | **ヘルプとドキュメント** | ヘルプが利用可能で必要な時に簡単に見つけられるか？ | |

各ヒューリスティクスの違反について重大度を評価する：

| 重大度 | 説明 |
|----------|-------------|
| 0 | ユーザビリティ問題ではない |
| 1 | 美観的 — 時間があれば修正する |
| 2 | 軽微 — 低優先度の修正 |
| 3 | 重大 — 修正が重要、高優先度 |
| 4 | 致命的 — リリース前に必ず修正 |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

**期待結果：** 具体的な所見と重大度評価を添えてすべての10ヒューリスティクスが評価されている。
**失敗時：** 時間が限られている場合は、ヒューリスティクス1、3、5、9（ユーザーエクスペリエンスへの影響が最大）に集中する。

### ステップ2: アクセシビリティ監査（WCAG 2.1）

#### 知覚可能
- [ ] **1.1.1 非テキストコンテンツ**: すべての画像にaltテキストがある（装飾画像は `alt=""`）
- [ ] **1.3.1 情報と関係**: セマンティックHTMLが使用されている（見出し、リスト、テーブル、ランドマーク）
- [ ] **1.3.2 意味のある順序**: DOM順序がビジュアル順序と一致している
- [ ] **1.4.1 カラーの使用**: カラーが情報を伝える唯一の手段ではない
- [ ] **1.4.3 コントラスト**: テキストのコントラスト比 ≥ 4.5:1（通常）、≥ 3:1（大きいテキスト）
- [ ] **1.4.4 テキストのリサイズ**: 機能を失うことなくテキストを200%にリサイズできる
- [ ] **1.4.11 非テキストのコントラスト**: UIコンポーネントとグラフィックスは ≥ 3:1のコントラスト
- [ ] **1.4.12 テキストの間隔**: コンテンツが増加したテキスト間隔で機能する（行の高さ1.5倍、字間0.12em、単語間隔0.16em）

#### 操作可能
- [ ] **2.1.1 キーボード**: すべての機能がキーボードで操作可能
- [ ] **2.1.2 キーボードトラップなし**: フォーカスがコンポーネント内でトラップされない
- [ ] **2.4.1 スキップリンク**: キーボードユーザーへのナビゲーションスキップリンクがある
- [ ] **2.4.3 フォーカス順序**: タブ順序が論理的で予測可能な順序に従っている
- [ ] **2.4.7 フォーカスの可視性**: キーボードフォーカスインジケーターが明確に見える
- [ ] **2.4.11 フォーカスが隠れていない**: フォーカスされた要素が固定ヘッダー/オーバーレイの背後に隠れていない
- [ ] **2.5.5 ターゲットサイズ**: インタラクティブターゲットは少なくとも24x24px（タッチでは44x44pxを推奨）

#### 理解可能
- [ ] **3.1.1 ページの言語**: `<html>` に `lang` 属性が設定されている
- [ ] **3.2.1 フォーカス時**: フォーカスが予期しない変更を引き起こさない
- [ ] **3.2.2 入力時**: 入力が警告なしに予期しない変更を引き起こさない
- [ ] **3.3.1 エラーの識別**: エラーがテキストで明確に説明されている
- [ ] **3.3.2 ラベルまたは説明**: フォーム入力に可視ラベルがある
- [ ] **3.3.3 エラーの提案**: エラーメッセージが問題の修正方法を提案している

#### 堅牢
- [ ] **4.1.1 構文解析**: HTMLが有効（重複IDなし、適切なネスト）
- [ ] **4.1.2 名前、役割、値**: カスタムコンポーネントにARIAロールとプロパティがある
- [ ] **4.1.3 ステータスメッセージ**: 動的なコンテンツ変更がスクリーンリーダーに通知される

**期待結果：** WCAG 2.1 AAの基準が各基準のpass/failを添えて体系的に確認されている。
**失敗時：** 初期スキャンには自動ツール（axe-core、Lighthouse）を使用し、人間の判断が必要な基準については手動テストを行う。

### ステップ3: キーボードとスクリーンリーダーの監査

#### キーボードナビゲーションテスト
TabキーのみでShift+Tab、Enter、Space、矢印キー、Escapeを使用して：

```markdown
## Keyboard Navigation Audit
| Task | Completable? | Issues |
|------|-------------|--------|
| Navigate to main content | Yes — skip link works | None |
| Open dropdown menu | Yes | Arrow keys don't work within menu |
| Submit a form | Yes | Tab order skips the submit button |
| Close a modal | No | Escape doesn't close, no visible close button in tab order |
| Use date picker | No | Custom date picker not keyboard accessible |
```

#### スクリーンリーダーテスト
NVDA（Windows）、VoiceOver（macOS/iOS）、またはTalkBack（Android）でテストする：

```markdown
## Screen Reader Audit
| Element | Announced As | Expected | Issue |
|---------|-------------|----------|-------|
| Logo link | "link, image" | "Home, link" | Missing alt text on logo |
| Search input | "edit, search" | "Search products, edit" | Missing label association |
| Nav menu | "navigation, main" | Correct | None |
| Error message | (not announced) | "Error: email is required" | Missing live region |
| Loading spinner | (not announced) | "Loading, please wait" | Missing aria-live or role="status" |
```

**期待結果：** キーボードのみとスクリーンリーダーで完全なタスクフローがテストされている。
**失敗時：** スクリーンリーダーが利用できない場合は、ARIAアトリビュートとセマンティックHTMLを代替として検査する。

### ステップ4: ユーザーフローの分析

主要なユーザーフローをマッピングして評価する：

```markdown
## User Flow: Complete a Purchase

### Steps
1. Browse products → 2. View product → 3. Add to cart → 4. View cart →
5. Enter shipping → 6. Enter payment → 7. Review order → 8. Confirm

### Assessment
| Step | Friction | Severity | Notes |
|------|---------|----------|-------|
| 1→2 | Low | - | Clear product cards |
| 2→3 | Medium | 2 | "Add to cart" button below the fold on mobile |
| 3→4 | Low | - | Cart icon updates with count |
| 4→5 | High | 3 | Must create account — no guest checkout |
| 5→6 | Low | - | Address autocomplete works well |
| 6→7 | Medium | 2 | Card number field doesn't auto-format |
| 7→8 | Low | - | Clear order summary |

### Flow Efficiency
- **Steps**: 8 (acceptable for e-commerce)
- **Required fields**: 14 (could reduce with address autocomplete + saved payment)
- **Decision points**: 2 (size selection, shipping method)
- **Potential drop-off points**: Step 4→5 (forced account creation)
```

**期待結果：** 重要なユーザーフローがマッピングされ、摩擦点が特定・評価されている。
**失敗時：** ユーザー分析が利用できない場合は、タスクの複雑さとステップ数に基づいてフローを評価する。

### ステップ5: 認知負荷の評価

- [ ] **情報密度**: 画面あたりの情報量が適切か？
- [ ] **プログレッシブディスクロージャー**: 複雑な情報が徐々に明らかにされているか？
- [ ] **チャンキング**: 関連項目が視覚的にグループ化されているか（ゲシュタルト原則）？
- [ ] **認識であって想起ではない**: ユーザーは覚えるのではなくオプションを見られるか？
- [ ] **一貫したパターン**: 類似したタスクは類似したインタラクションパターンを使用しているか？
- [ ] **決定疲労**: ユーザーは一度に多すぎる選択肢を提示されていないか？（Hickの法則）
- [ ] **ワーキングメモリ**: ユーザーはステップをまたいで情報を覚えておく必要があるか？

**期待結果：** 過負荷または過小負荷の具体的な領域を特定して認知負荷が評価されている。
**失敗時：** 認知負荷を客観的に評価するのが難しい場合は「目を細めるテスト」を使用する — 画面を目を細めて見て、構造と階層がまだ明確かどうか確認する。

### ステップ6: フォームユーザビリティのレビュー

アプリケーション内の各フォームについて：

- [ ] **ラベル**: すべての入力に可視の関連ラベルがある
- [ ] **プレースホルダーテキスト**: 例としてのみ使用されており、ラベルとしては使用されていない
- [ ] **入力タイプ**: モバイルキーボードに対して正しいHTML入力タイプ（email、tel、number、date）
- [ ] **バリデーションのタイミング**: エラーはblur時またはsubmit時に表示される（キー入力ごとではない）
- [ ] **エラーメッセージ**: 具体的（「メールには@が必要です」）であり、汎用的ではない（「無効な入力」）
- [ ] **必須フィールド**: 明確にマークされている（ほとんどが必須の場合は任意フィールドもマークされている）
- [ ] **フィールドのグループ化**: 関連フィールドが視覚的にグループ化されている（名前、住所、支払いセクション）
- [ ] **オートコンプリート**: 標準フィールドに `autocomplete` 属性が設定されている（name、email、address、cc-number）
- [ ] **タブ順序**: ビジュアルレイアウトと一致した論理的なフロー
- [ ] **マルチステップフォーム**: 進行状況インジケーターが現在のステップと合計ステップを表示している
- [ ] **永続性**: ユーザーが離れて戻った場合にフォームデータが保持される

**期待結果：** チェックリストに対して各フォームが評価され、具体的な問題が文書化されている。
**失敗時：** 多数のフォームがある場合は、最もトラフィックの多いフォーム（登録、チェックアウト、お問い合わせ）を優先する。

### ステップ7: UX/UIレビューの執筆

```markdown
## UX/UI Review Report

### Executive Summary
[2-3 sentences: overall usability, most critical issues, strongest aspects]

### Heuristic Evaluation Summary
| Heuristic | Severity | Key Finding |
|-----------|----------|-------------|
[Summary table from Step 1]

### Accessibility Compliance
- **Target**: WCAG 2.1 AA
- **Status**: [X of Y criteria pass]
- **Critical failures**: [List]

### User Flow Analysis
[Key friction points with severity and recommendations]

### Top 5 Improvements (Prioritised)
1. **[Issue]** — Severity: [N] — [Specific recommendation]
2. ...

### What Works Well
1. [Specific positive observation]
2. ...
```

**期待結果：** レビューが重大度評価を含む優先順位付けされた実行可能な推奨事項を提供している。
**失敗時：** レビューで問題が多すぎる場合は、「必ず修正」（重大度3〜4）と「修正すべき」（重大度1〜2）に分類する。

## バリデーション

- [ ] 重大度評価を添えてすべての10 Nielsenヒューリスティクスが評価されている
- [ ] WCAG 2.1基準が確認されている（最低限：1.1.1、1.4.3、2.1.1、2.4.7、3.3.1、4.1.2）
- [ ] 主要なユーザーフローについてキーボードナビゲーションがテストされている
- [ ] スクリーンリーダーがテストされている（またはARIA/セマンティックHTMLが代替として確認されている）
- [ ] 少なくとも1つの重要なユーザーフローが摩擦について分析されている
- [ ] 認知負荷が評価されている
- [ ] フォームユーザビリティが評価されている
- [ ] 実行可能な推奨事項を含んで所見が重大度によって優先順位付けされている

## よくある落とし穴

- **UXをビジュアルデザインと混同する**: UXはどのように動作するかについてであり、ビジュアルデザインはどのように見えるかについてである。美しいインターフェースが恐ろしいUXを持つ可能性がある。両方を評価するが区別すること。
- **ハッピーパスのみをテストする**: エラー状態、空の状態、ローディング状態、エッジケースはUXの問題が隠れている場所である。
- **実機を無視する**: ブラウザ開発者ツールのレスポンシブモードは代替手段である。実機テストはタッチ、パフォーマンス、ビューポートの問題を捕捉する。
- **アクセシビリティを後回しにする**: 後で発見されたアクセシビリティ問題は修正に費用がかかる。早期かつ継続的に評価すること。
- **個人的な好みをUXフィードバックとする**: 「私はこれを好む...」はUXフィードバックではない。ヒューリスティクス、リサーチ、または確立されたパターンを引用すること。

## 関連スキル

- `review-web-design` — ビジュアルデザインレビュー（レイアウト、タイポグラフィ、カラー — UXを補完）
- `scaffold-nextjs-app` — Next.jsアプリケーションのスキャフォールディング
- `setup-tailwind-typescript` — デザインシステム実装のためのTailwind CSS
