---
name: escalate-issues
description: >
  メンテナンス問題を重大度でトリアージし、コンテキスト付きで発見事項を文書化し、
  適切な専門エージェントまたは人間にルーティングし、実行可能な課題レポートを作成する。
  メンテナンスタスクが自動クリーンアップを超える問題に遭遇した時に使用する：
  削除が安全でないコード、ドメイン専門知識を必要とする設定変更、クリーンアップ中に
  検出された破壊的変更、必要な複雑リファクタリング、またはハードコードされた秘密情報や
  脆弱性などのセキュリティに敏感な発見事項。
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: basic
  language: multi
  tags: maintenance, triage, escalation, routing, issue-reporting
  locale: ja
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# escalate-issues

## 使用タイミング

メンテナンスタスクが自動クリーンアップを超える問題に遭遇した時にこのスキルを使用する：

- コードの削除が安全かどうか不確実な時
- 設定変更がドメイン専門知識を必要とする時（セキュリティ、パフォーマンス、アーキテクチャ）
- クリーンアップ中に破壊的変更が検出された時
- 複雑なリファクタリングが必要な時（単なるクリーンアップではなく）
- セキュリティに敏感な発見事項（ハードコードされた秘密情報、脆弱性）

明確な修正がある単純な問題には**使用しない**。自動クリーンアップがリスクがあるか不十分な場合にのみエスカレーションする。

## 入力

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|----------|-------------|
| `issue_description` | string | はい | 問題の明確な説明 |
| `severity` | enum | はい | `critical`, `high`, `medium`, `low` |
| `context_files` | array | いいえ | 関連ファイルのパス |
| `specialist` | string | いいえ | ターゲットエージェント（未指定の場合は自動ルーティング） |
| `blocking` | boolean | いいえ | 課題がさらなるクリーンアップをブロックするか（デフォルト: false） |

## 手順

### ステップ1: 重大度の評価

標準的な重大度レベルを使用して課題を分類する。

**CRITICAL** — 本番機能をブロック：
- 活発に使用されているコードの壊れたインポート
- セキュリティ脆弱性（露出した秘密情報、SQLインジェクション）
- クリーンアップ操作によるデータ損失リスク
- 本番サービスの停止

**HIGH** — 保守性または開発者の生産性に影響：
- 重大なデッドコードの肥大化（1000行以上）
- 壊れたCI/CDパイプライン
- 環境間の主要な設定ドリフト
- 動的にロードされる可能性のある参照されていないモジュール

**MEDIUM** — 軽微な衛生上の問題：
- 未使用のヘルパー関数（100行未満）
- 更新が必要な古いドキュメント
- 非推奨の設定ファイル（使用されなくなったが存在する）
- 重要でないパスのリント警告

**LOW** — スタイルの不一致：
- 混在するインデント（動作するが一貫しない）
- 末尾の空白
- 一貫しない命名（camelCase vs snake_case）
- 軽微なフォーマットの違い

**重大度判断ツリー**：
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

**期待結果:** 明確な重大度ラベルで分類された課題

**失敗時:** 不確実な場合はHIGHをデフォルトとし、再トリアージのために人間にエスカレーションする

### ステップ2: 発見事項の文書化

専門家がレビューするためのすべての関連コンテキストを記録する。

**課題レポートテンプレート**：
```markdown
# Issue: [Brief Title]

**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Discovered During**: [Skill name, e.g., clean-codebase]
**Date**: YYYY-MM-DD
**Blocking**: Yes | No

## Description

Clear description of the problem in 2-3 sentences.

## Context

- **File(s)**: [List of affected files with line numbers]
- **Related**: [Related issues, commits, or previous attempts to fix]
- **Impact**: [What breaks if this isn't fixed, or what's wasted if not cleaned]

## Evidence

```language
# Code snippet or log excerpt showing the problem
```

## Attempted Fixes

- Tried X but failed because Y
- Considered Z but uncertain due to W

## Recommendation

- **Option 1**: [Safe conservative approach]
- **Option 2**: [More aggressive fix with risks]
- **Preferred**: [Which option to pursue and why]

## Specialist Routing

**Suggested Agent**: [agent-name]
**Reason**: [Why this specialist is appropriate]

## References

- [Link to related documentation]
- [Link to similar past issues]
```

**期待結果:** 完全なコンテキスト付きで`ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md`に文書化された課題

**失敗時:** （該当なし — 不完全でも常に文書化する）

### ステップ3: ルーティングの決定

課題タイプを適切な専門エージェントまたは人間レビュアーにマッチングする。

**ルーティングテーブル**：

| 課題タイプ | 専門家 | 理由 |
|------------|-----------|---------|
| セキュリティ脆弱性 | security-analyst | セキュリティ専門知識が必要 |
| GxPコンプライアンスの懸念 | gxp-validator | 規制知識が必要 |
| アーキテクチャの決定 | senior-software-developer | 設計パターンの専門知識 |
| 設定管理 | devops-engineer | インフラ知識 |
| 依存関係の競合 | devops-engineer | パッケージ管理の専門知識 |
| パフォーマンスのボトルネック | senior-data-scientist | 最適化知識 |
| コードスタイルの論争 | code-reviewer | スタイルガイドの権限 |
| デッドコードの不確実性 | r-developer（または言語固有） | 言語固有の知識 |
| 壊れたテストが不明確 | code-reviewer | テスト設計の専門知識 |
| ドキュメントの正確性 | senior-researcher | ドメイン知識が必要 |
| ライセンス互換性 | auditor | 法律/コンプライアンスの専門知識 |

**自動ルーティングロジック**：
```python
def route_issue(severity, issue_type):
    if severity == "CRITICAL":
        # Always escalate to human for critical issues
        return "human"

    if "security" in issue_type or "secret" in issue_type:
        return "security-analyst"

    if "gxp" in issue_type or "compliance" in issue_type:
        return "gxp-validator"

    if "architecture" in issue_type or "design" in issue_type:
        return "senior-software-developer"

    if "config" in issue_type or "deployment" in issue_type:
        return "devops-engineer"

    # Default: code-reviewer for general code issues
    return "code-reviewer"
```

**期待結果:** 正当性を伴い適切な専門家にルーティングされた課題

**失敗時:** 明確な専門家がいない場合、手動ルーティングのために人間にエスカレーションする

### ステップ4: 実行可能な課題レポートの作成

ターゲットオーディエンス（エージェントまたは人間）に適したフォーマットのレポートを生成する。

**専門エージェント向け**（MCPツール用の構造化フォーマット）：
```yaml
---
type: escalation
severity: high
from_agent: janitor
to_agent: security-analyst
blocking: false
---

# Security Concern: Hardcoded API Key in Config

**File**: config/production.yml:45
**Pattern**: API_KEY="sk_live_abc123..."

**Request**: Please review if this is a valid secret or a placeholder.
If valid, recommend secure credential management strategy.

**Context**: Discovered during config cleanup sweep.
```

**人間レビュアー向け**（詳細なmarkdown）：
```markdown
# Escalation Report: Uncertain Dead Code Removal

**From**: Janitor Agent
**Date**: 2026-02-16
**Severity**: HIGH

## Problem

File `src/legacy_payments.js` (450 lines) appears unused but contains
complex payment processing logic. Static analysis shows zero references,
but name suggests business-critical functionality.

## Why Escalated

- Uncertain if payment code is dynamically loaded at runtime
- Potential data loss risk if deleted incorrectly
- Requires domain knowledge to assess business impact

## Evidence

- No direct imports found
- Last modified 8 months ago
- Git history shows it was part of payment refactor

## Recommendation

Request human review before deletion. If confirmed dead:
1. Archive to archive/legacy/ directory
2. Document in ARCHIVE_LOG.md
3. Create ticket to verify payment flows still work

## Next Steps

Awaiting human confirmation before proceeding with cleanup.
```

**期待結果:** ターゲットオーディエンスに適切にフォーマットされたレポート

**失敗時:** （該当なし — 不確実な場合は汎用markdownでレポートを生成する）

### ステップ5: エスカレーション状態の追跡

重複レポートを防ぐため、すべてのエスカレーションのログを維持する。

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

**期待結果:** 新しいエントリで`ESCALATION_LOG.md`が更新される

**失敗時:** ログが存在しない場合、作成する

### ステップ6: 通知とブロック（必要な場合）

課題がさらなるメンテナンスをブロックする場合、通知してクリーンアップを一時停止する。

**ブロッキングロジック**：
- CRITICAL課題は常にブロックする
- HIGH課題はクリティカルパスにある場合ブロックする
- MEDIUM/LOW課題はブロックしない

**通知**：
```markdown
⚠️ MAINTENANCE BLOCKED ⚠️

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

**期待結果:** メンテナンスが一時停止され、明確な通知が生成される

**失敗時:** 通知メカニズムが利用できない場合、レポートに文書化する

## バリデーションチェックリスト

エスカレーション後：

- [ ] 課題の重大度が正しく評価された
- [ ] 完全なコンテキストが文書化された（ファイル、証拠、試行）
- [ ] 適切な専門家が特定された
- [ ] ESCALATION_REPORTS/にエスカレーションレポートが作成された
- [ ] ESCALATION_LOG.mdが更新された
- [ ] 該当する場合ブロッキング状態が通知された
- [ ] レポートにセンシティブな情報が露出していない

## よくある落とし穴

1. **過剰エスカレーション**: 単純な課題のエスカレーションは専門家の時間を浪費する。本当に不確実またはリスクがある場合にのみエスカレーションする。

2. **過少エスカレーション**: エスカレーションなしに「テストが通るか見てみよう」とコードを削除すると、本番停止を引き起こす可能性がある。

3. **コンテキスト不足**: 証拠なしにエスカレーションすると、専門家が再調査を強いられる。ファイルパス、行番号、エラーメッセージを含める。

4. **曖昧な説明**: 「設定に何かおかしい」は実行可能でない。具体的に：「設定ドリフト：devはAPI v1を使用、prodはv2を使用」。

5. **状態の未追跡**: すでにレビューされた課題を再エスカレーションする。まずESCALATION_LOG.mdを確認する。

6. **秘密情報の露出**: エスカレーションレポートに実際のAPIキーやパスワードを含める。センシティブな値はマスクする。

## 関連スキル

- `clean-codebase` — 不確実な場合にエスカレーションをトリガーすることが多い
- `tidy-project-structure` — 複雑な組織上の問題を発見する可能性がある
- `repair-broken-references` — 参照を修正すべきか削除すべきか不明な場合にエスカレーション
- `security-audit-codebase` — セキュリティの発見事項をエスカレーション
