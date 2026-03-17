---
name: review-software-architecture
description: >
  ソフトウェアアーキテクチャを結合度、凝集度、SOLIDの原則、APIデザイン、スケーラビリティ、
  技術的負債の観点でレビューする。システムレベルの評価、アーキテクチャ決定記録のレビュー、
  改善推奨事項を網羅する。実装前の提案アーキテクチャ評価、既存システムのスケーラビリティや
  セキュリティの評価、ADRレビュー、技術的負債の評価、または大規模な拡張に向けた
  準備状況の評価に使用する。
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
  complexity: advanced
  language: multi
  tags: architecture, solid, coupling, cohesion, api-design, scalability, tech-debt, adr
---

# Review Software Architecture

システムレベルでソフトウェアアーキテクチャを品質属性、設計原則の遵守、長期的な保守性について評価する。

## 使用タイミング

- 実装開始前に提案されたアーキテクチャを評価する場合
- スケーラビリティ、保守性、セキュリティについて既存システムを評価する場合
- プロジェクトのアーキテクチャ決定記録（ADR）をレビューする場合
- 技術的負債の評価を実施する場合
- システムが大規模な拡張や機能追加に対応できるか評価する場合
- 行レベルのコードレビュー（PRレベルの変更に焦点を当てるもの）との区別

## 入力

- **必須**: システムコードベースまたはアーキテクチャドキュメント（図、ADR、README）
- **必須**: システムの目的、規模、制約に関するコンテキスト
- **任意**: 非機能要件（レイテンシ、スループット、可用性目標）
- **任意**: チームサイズとスキル構成
- **任意**: 技術的な制約または優先事項
- **任意**: 既知の問題点または懸念領域

## 手順

### ステップ1: システムコンテキストの理解

システムの境界とインターフェースをマッピングする：

```markdown
## System Context
- **Name**: [System name]
- **Purpose**: [One-line description]
- **Users**: [Who uses it and how]
- **Scale**: [Requests/sec, data volume, user count]
- **Age**: [Years in production, major versions]
- **Team**: [Size, composition]

## External Dependencies
| Dependency | Type | Criticality | Notes |
|-----------|------|-------------|-------|
| PostgreSQL | Database | Critical | Primary data store |
| Redis | Cache | High | Session store + caching |
| Stripe | External API | Critical | Payment processing |
| S3 | Object storage | High | File uploads |
```

**期待結果：** システムが何をしているか、何に依存しているかが明確に把握できている。
**失敗時：** アーキテクチャドキュメントが存在しない場合は、コード構造、設定ファイル、デプロイメントファイルからコンテキストを導き出す。

### ステップ2: 構造的品質の評価

#### 結合度の評価
モジュールがどれだけ密接に依存しているかを検査する：

- [ ] **依存関係の方向性**: 依存関係は一方向（レイヤード）か、それとも循環しているか？
- [ ] **インターフェース境界**: モジュールは定義されたインターフェース/契約を通じて接続されているか、それとも直接実装参照か？
- [ ] **共有状態**: モジュール間で可変状態が共有されているか？
- [ ] **データベース結合**: 複数のサービスが同じテーブルに直接読み書きしているか？
- [ ] **時間的結合**: 明示的なオーケストレーションなしに操作が特定の順序で実行される必要があるか？

```bash
# Detect circular dependencies (JavaScript/TypeScript)
npx madge --circular src/

# Detect import patterns (Python)
# Look for deep cross-package imports
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### 凝集度の評価
各モジュールが単一で明確な責任を持っているかを評価する：

- [ ] **モジュールの命名**: 名前はモジュールが何をするかを正確に説明しているか？
- [ ] **ファイルサイズ**: ファイルやクラスが過度に大きくないか（>500行は複数の責任を示唆）？
- [ ] **変更頻度**: 無関係な機能が同じモジュールへの変更を要求するか？
- [ ] **God オブジェクト**: すべてのものが依存するクラス/モジュールが存在するか？

| 結合レベル | 説明 | 例 |
|---------------|-------------|---------|
| 低（良好） | モジュールはインターフェースを通じて通信する | サービスAがサービスBのAPIを呼び出す |
| 中 | モジュールはデータ構造を共有する | 共有DTO/モデルライブラリ |
| 高（懸念） | モジュールが互いの内部を参照する | モジュール間での直接データベースアクセス |
| 病的 | モジュールが互いの内部状態を変更する | グローバル可変状態 |

**期待結果：** コードベースからの具体例を添えて結合度と凝集度が評価されている。
**失敗時：** コードベースが大きすぎて手動でレビューできない場合は、3〜5個の主要モジュールと最も変更頻度が高いファイルをサンプリングする。

### ステップ3: SOLID原則の評価

| 原則 | 問い | 危険信号 |
|-----------|----------|-----------|
| **S**ingle Responsibility（単一責任） | 各クラス/モジュールは変更する理由が一つだけか？ | 無関係な懸念事項に関する5つ以上の公開メソッドを持つクラス |
| **O**pen/Closed（開放/閉鎖） | 既存コードを変更せずに動作を拡張できるか？ | 新機能のたびにコアクラスへの頻繁な変更 |
| **L**iskov Substitution（リスコフ置換） | サブタイプは動作を壊さずに基底型を置き換えられるか？ | コンシューマーコードに散在する型チェック（`instanceof`） |
| **I**nterface Segregation（インターフェース分離） | インターフェースは焦点を絞り最小限か？ | コンシューマーが使用しないメソッドを実装する「太った」インターフェース |
| **D**ependency Inversion（依存関係逆転） | 高レベルモジュールは詳細ではなく抽象に依存しているか？ | ビジネスロジック内でのインフラクラスの直接インスタンス化 |

```markdown
## SOLID Assessment
| Principle | Status | Evidence | Impact |
|-----------|--------|----------|--------|
| SRP | Concern | UserService handles auth, profile, notifications, and billing | High — changes to billing risk breaking auth |
| OCP | Good | Plugin system for payment providers | Low |
| LSP | Good | No type-checking anti-patterns found | Low |
| ISP | Concern | IRepository has 15 methods, most implementors use 3-4 | Medium |
| DIP | Concern | Controllers directly instantiate database repositories | Medium |
```

**期待結果：** 少なくとも1つの具体例を添えて各原則が評価されている。
**失敗時：** すべての原則がすべてのアーキテクチャスタイルに同様に適用されるわけではない。ある原則があまり関連しない場合（例：関数型コードベースでのISP）は注記する。

### ステップ4: APIデザインのレビュー

APIを公開するシステム（REST、GraphQL、gRPC）の場合：

- [ ] **一貫性**: 命名規則、エラーフォーマット、ページネーションパターンが統一されているか
- [ ] **バージョニング**: 戦略が存在し適用されているか（URL、ヘッダー、コンテントネゴシエーション）
- [ ] **エラーハンドリング**: エラーレスポンスが構造化されており、一貫していて、内部情報を漏洩しないか
- [ ] **認証/認可**: APIレイヤーで適切に強制されているか
- [ ] **レート制限**: 乱用からの保護
- [ ] **ドキュメント**: OpenAPI/Swagger、GraphQLスキーマ、またはprotobuf定義が維持されているか
- [ ] **冪等性**: 変更操作（POST/PUT）が安全にリトライを処理するか

```markdown
## API Design Review
| Aspect | Status | Notes |
|--------|--------|-------|
| Naming consistency | Good | RESTful resource naming throughout |
| Versioning | Concern | No versioning strategy — breaking changes affect all clients |
| Error format | Good | RFC 7807 Problem Details used consistently |
| Auth | Good | JWT with role-based scopes |
| Rate limiting | Missing | No rate limiting on any endpoint |
| Documentation | Concern | OpenAPI spec exists but 6 months out of date |
```

**期待結果：** 具体的な所見を添えて共通標準に対してAPIデザインがレビューされている。
**失敗時：** APIが公開されていない場合はこのステップをスキップし、内部モジュールインターフェースに焦点を当てる。

### ステップ5: スケーラビリティと信頼性の評価

- [ ] **ステートレス性**: アプリケーションは水平スケールできるか（ローカル状態なし）？
- [ ] **データベースのスケーラビリティ**: クエリにインデックスが張られているか？スキーマはデータ量に適しているか？
- [ ] **キャッシュ戦略**: 適切なレイヤー（データベース、アプリケーション、CDN）でキャッシュが適用されているか？
- [ ] **障害処理**: 依存関係が利用できない場合何が起こるか（サーキットブレーカー、リトライ、フォールバック）？
- [ ] **観察可能性**: ログ、メトリクス、トレースが実装されているか？
- [ ] **データ一貫性**: 結果整合性で許容できるか、強整合性が必要か？

**期待結果：** 述べられた非機能要件に対してスケーラビリティと信頼性が評価されている。
**失敗時：** 非機能要件が文書化されていない場合は、最初のステップとしてそれらを定義することを推奨する。

### ステップ6: 技術的負債の評価

```markdown
## Technical Debt Inventory
| Item | Severity | Impact | Estimated Effort | Recommendation |
|------|----------|--------|-----------------|----------------|
| No database migrations | High | Schema changes are manual and error-prone | 1 sprint | Adopt Alembic/Flyway |
| Monolithic test suite | Medium | Tests take 45 min, developers skip them | 2 sprints | Split into unit/integration/e2e |
| Hardcoded config values | Medium | Environment-specific values in source code | 1 sprint | Extract to env vars/config service |
| No CI/CD pipeline | High | Manual deployment prone to errors | 1 sprint | Set up GitHub Actions |
```

**期待結果：** 深刻度、影響、作業見積もりを添えて技術的負債が目録化されている。
**失敗時：** 負債の目録が圧倒的な量になる場合は、影響/工数比率で上位5項目を優先する。

### ステップ7: アーキテクチャ決定記録（ADR）のレビュー

ADRが存在する場合、評価する：
- [ ] 決定に明確なコンテキストがある（何の問題を解決しようとしていたか）
- [ ] 代替案が検討・文書化されている
- [ ] トレードオフが明示されている
- [ ] 決定がまだ現在のものである（文書化なしに置き換えられていない）
- [ ] 新しい重要な決定にADRがある

ADRが存在しない場合は、主要な決定のためにADRを確立することを推奨する。

### ステップ8: アーキテクチャレビューの執筆

```markdown
## Architecture Review Report

### Executive Summary
[2-3 sentences: overall health, key concerns, recommended actions]

### Strengths
1. [Specific architectural strength with evidence]
2. ...

### Concerns (by severity)

#### Critical
1. **[Title]**: [Description, impact, recommendation]

#### Major
1. **[Title]**: [Description, impact, recommendation]

#### Minor
1. **[Title]**: [Description, recommendation]

### Technical Debt Summary
[Top 5 debt items with prioritized recommendations]

### Recommended Next Steps
1. [Actionable recommendation with clear scope]
2. ...
```

**期待結果：** レビューレポートが優先順位付けされた推奨事項を含み実行可能なものである。
**失敗時：** レビューが時間制限されている場合は、何がカバーされ何が未評価のままか明示する。

## バリデーション

- [ ] システムコンテキストが文書化されている（目的、規模、依存関係、チーム）
- [ ] 具体的なコード例を添えて結合度と凝集度が評価されている
- [ ] 適用可能な場合にSOLID原則が評価されている
- [ ] APIデザインがレビューされている（該当する場合）
- [ ] スケーラビリティと信頼性が要件に対して評価されている
- [ ] 技術的負債が目録化・優先順位付けされている
- [ ] ADRがレビューされているか、その不在が記録されている
- [ ] 推奨事項が具体的、優先順位付けされ、実行可能なものである

## よくある落とし穴

- **アーキテクチャではなくコードをレビューする**: このスキルはシステムレベルの設計に関するものであり、行レベルのコード品質ではない。PRレベルのフィードバックには `code-reviewer` を使用すること。
- **特定の技術を規定する**: アーキテクチャレビューは問題を特定すべきであり、明確な技術的理由がない限り特定のツールを義務化すべきではない。
- **チームコンテキストを無視する**: 3人チームに「最適な」アーキテクチャは30人チームとは異なる。組織上の制約を考慮すること。
- **完璧主義**: すべてのシステムに技術的負債がある。積極的に問題を引き起こすか、将来の作業をブロックしている負債に焦点を当てること。
- **規模の仮定**: 100ユーザーにサービスを提供するアプリに分散システムを推奨しないこと。アーキテクチャを実際の要件に合わせること。

## 関連スキル

- `security-audit-codebase` — セキュリティ重視のコードと設定レビュー
- `configure-git-repository` — リポジトリ構造と規則
- `design-serialization-schema` — データスキーマの設計と進化
- `review-data-analysis` — 分析的正確性のレビュー（補完的な視点）
