---
name: perform-csv-assessment
description: >
  GAMP 5方法論に従ったコンピューター化システムバリデーション（CSV）評価を実施します。
  ユーザー要件、リスク評価、IQ/OQ/PQ計画、トレーサビリティマトリクス作成、
  バリデーション概要報告書の作成を対象とします。新しいコンピューター化システムを
  GxP環境に導入する際、既存のバリデート済みシステムに重大な変更が加えられる際、
  定期的な再バリデーションが必要な際、または規制査察でバリデーションのギャップ分析が
  求められる際に使用します。
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
  domain: compliance
  complexity: advanced
  language: multi
  tags: csv, gamp-5, validation, risk-assessment, iq-oq-pq, traceability
---

# CSV評価の実施

規制環境でのGAMP 5リスクベース方法論を使用したコンピューター化システムバリデーション評価を実施します。

## 使用タイミング

- GxP環境に新しいコンピューター化システムを導入する場合
- 既存のバリデート済みシステムに重大な変更が加えられる場合
- 定期的な再バリデーションが必要な場合
- 規制査察の準備でバリデーションのギャップ分析が求められる場合

## 入力

- **必須**: システムの説明（名称、目的、ベンダー、バージョン）
- **必須**: 意図された用途の記述と規制コンテキスト（GxPスコープ）
- **必須**: GAMP 5ソフトウェアカテゴリー（1～5）
- **任意**: 既存のユーザー要件仕様書（URS）
- **任意**: ベンダー文書（設計仕様書、リリースノート、SOP）
- **任意**: 以前のバリデーション文書

## 手順

### ステップ1: GAMP 5ソフトウェアカテゴリーの決定

システムを分類します:

| カテゴリー | 種類 | 例 | バリデーション工数 |
|----------|------|---------|-------------------|
| 1 | インフラストラクチャーソフトウェア | OS、ファームウェア | 低 — インストールの検証 |
| 3 | 設定なし製品 | COTSそのまま | 低中 — 機能の検証 |
| 4 | 設定済み製品 | 設定付きLIMS | 中高 — 設定の検証 |
| 5 | カスタムアプリケーション | 独自R/Shinyアプリ | 高 — 完全なライフサイクルバリデーション |

**期待結果：** カテゴリーが根拠とともに明確に割り当てられていること。
**失敗時：** カテゴリーが曖昧な場合は、上位カテゴリーをデフォルトとし、根拠を文書化します。

### ステップ2: ユーザー要件仕様書（URS）の作成

番号付き要件でURS文書を作成します:

```markdown
# User Requirements Specification
## System: [System Name] v[Version]
## Document ID: URS-[SYS]-[NNN]

### 1. Purpose
[Intended use statement]

### 2. Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-001 | System shall calculate BMI from height and weight inputs | Must | Regulatory SOP-xxx |
| URS-002 | System shall generate audit trail entries for all data changes | Must | 21 CFR 11.10(e) |
| URS-003 | System shall export results in PDF format | Should | User request |

### 3. Non-Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-010 | System shall respond within 3 seconds for standard queries | Should | Usability |
| URS-011 | System shall restrict access via role-based authentication | Must | 21 CFR 11.10(d) |

### 4. Data Integrity Requirements
[ALCOA+ requirements: Attributable, Legible, Contemporaneous, Original, Accurate]

### 5. Regulatory Requirements
[Specific 21 CFR Part 11, EU Annex 11, or other applicable requirements]
```

**期待結果：** すべての要件に一意のID、優先度、ソースへのトレーサビリティがあること。
**失敗時：** 明確なソースや優先度のない要件をステークホルダーのレビュー対象としてフラグします。

### ステップ3: リスク評価の実施

故障モードと影響分析（FMEA）を使用したGAMP 5リスクベースアプローチを適用します:

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

リスク優先度数（RPN）= 重大度 × 確率 × 検出可能性

| RPN範囲 | リスクレベル | テスト要件 |
|-----------|------------|---------------------|
| 1–12 | 低 | 基本的な検証 |
| 13–36 | 中 | 文書化されたテストケース |
| 37以上 | 高 | 完全なIQ/OQ/PQと再テスト |

**期待結果：** すべてのURS要件に対応するリスク評価行があること。
**失敗時：** 評価されていない要件は、進める前にバリデーション責任者にエスカレートします。

### ステップ4: バリデーション戦略の定義（バリデーション計画）

```markdown
# Validation Plan
## Document ID: VP-[SYS]-[NNN]

### Scope
- System: [Name] v[Version]
- GAMP Category: [N]
- Validation approach: [Prospective / Retrospective / Concurrent]

### Qualification Stages
| Stage | Scope | Applies? | Rationale |
|-------|-------|----------|-----------|
| IQ | Installation correctness | Yes | Verify installation, dependencies, configuration |
| OQ | Operational requirements | Yes | Verify functional requirements from URS |
| PQ | Performance under real conditions | [Yes/No] | [Rationale] |

### Roles and Responsibilities
| Role | Name | Responsibility |
|------|------|---------------|
| Validation Lead | [Name] | Plan, coordinate, approve |
| Tester | [Name] | Execute test scripts |
| System Owner | [Name] | Approve for production use |
| QA | [Name] | Review and sign-off |

### Acceptance Criteria
- All critical test cases pass
- No unresolved critical or major deviations
- Traceability matrix complete
```

**期待結果：** テスト実行前にすべてのステークホルダーがバリデーション計画を承認していること。
**失敗時：** 承認されたバリデーション計画なしにテスト実行を進めないこと。

### ステップ5: テストプロトコルの作成（IQ/OQ/PQ）

各適格性評価段階のテストスクリプトを作成します:

```markdown
# Operational Qualification Protocol
## Test Case: TC-OQ-001
## Traces to: URS-001

**Objective:** Verify BMI calculation accuracy

**Prerequisites:**
- System installed per IQ protocol
- Test data set prepared

**Test Steps:**
| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Enter height=180cm, weight=75kg | BMI displayed as 23.15 | | |
| 2 | Enter height=160cm, weight=90kg | BMI displayed as 35.16 | | |
| 3 | Enter height=0, weight=75kg | Error message displayed | | |

**Tester:** _________ Date: _________
**Reviewer:** _________ Date: _________
```

**期待結果：** すべての中程度および高リスク要件に少なくとも1つのテストケースがあること。
**失敗時：** 実行開始前に欠けているテストケースを追加します。

### ステップ6: トレーサビリティマトリクスの構築

すべての要件をリスク評価からテストケースにリンクする要件トレーサビリティマトリクス（RTM）を作成します:

```markdown
# Traceability Matrix
## Document ID: TM-[SYS]-[NNN]

| URS ID | Requirement | Risk Level | Test Case(s) | Test Result | Status |
|--------|-------------|------------|--------------|-------------|--------|
| URS-001 | BMI calculation | Low | TC-OQ-001 | Pass | Verified |
| URS-002 | Audit trail | High | TC-IQ-003, TC-OQ-005 | Pass | Verified |
| URS-003 | PDF export | Low | TC-OQ-008 | Pass | Verified |
| URS-011 | Role-based access | Medium | TC-OQ-010, TC-OQ-011 | Pass | Verified |
```

**期待結果：** URS要件の100%がテスト結果にリンクされたトレーサビリティマトリクスに記載されていること。
**失敗時：** テスト結果にリンクされていない要件はバリデーションのギャップとしてフラグされます。

### ステップ7: バリデーション概要報告書の作成

```markdown
# Validation Summary Report
## Document ID: VSR-[SYS]-[NNN]

### 1. Executive Summary
[System name] v[version] has been validated in accordance with [VP document ID].

### 2. Validation Activities Performed
| Activity | Document ID | Status |
|----------|-------------|--------|
| User Requirements | URS-SYS-001 | Approved |
| Risk Assessment | RA-SYS-001 | Approved |
| Validation Plan | VP-SYS-001 | Approved |
| IQ Protocol/Report | IQ-SYS-001 | Executed — Pass |
| OQ Protocol/Report | OQ-SYS-001 | Executed — Pass |
| Traceability Matrix | TM-SYS-001 | Complete |

### 3. Deviations
| Dev ID | Description | Impact | Resolution |
|--------|-------------|--------|------------|
| DEV-001 | [Description] | [Impact assessment] | [Resolution and rationale] |

### 4. Conclusion
The system meets all user requirements as documented in [URS ID]. The validation is considered [Successful / Successful with conditions].

### 5. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Validation Lead | | | |
| System Owner | | | |
| Quality Assurance | | | |
```

**期待結果：** 報告書がすべてのバリデーション成果物を明確な合否の結論とともに参照していること。
**失敗時：** 逸脱が未解決の場合、報告書はCAPA参照付きの「条件付き」ステータスを記載しなければなりません。

## バリデーション

- [ ] GAMP 5カテゴリーが文書化された根拠とともに割り当てられている
- [ ] URSに優先度とソースへのトレーサビリティを持つ番号付き要件がある
- [ ] リスク評価がすべてのURS要件を対象としている
- [ ] テスト実行前にバリデーション計画が承認されている
- [ ] テストプロトコルに前提条件、ステップ、期待結果、署名フィールドがある
- [ ] トレーサビリティマトリクスがすべての要件をリスクとテスト結果にリンクしている
- [ ] バリデーション概要報告書がすべての活動、逸脱、結論を文書化している
- [ ] すべての文書に一意の文書IDとバージョン管理がある

## よくある落とし穴

- **過剰なバリデーション**: カテゴリー3のソフトウェアにカテゴリー5の工数を適用するとリソースの無駄になる。工数をリスクに合わせること
- **トレーサビリティの欠如**: テストケースにトレースされない要件は見えないギャップとなる
- **計画なしのテスト**: バリデーション計画が承認される前にテストを実行すると結果が無効になる
- **非機能要件の無視**: セキュリティ、パフォーマンス、データ整合性の要件が見落とされることが多い
- **静的なバリデーション**: バリデーションを一度限りのイベントとして扱う。変更は再評価が必要

## 関連スキル

- `setup-gxp-r-project` — バリデートされたR環境のプロジェクト構造
- `write-validation-documentation` — IQ/OQ/PQプロトコルと報告書の作成
- `implement-audit-trail` — 電子記録の監査証跡実装
- `validate-statistical-output` — 統計出力検証方法論
- `conduct-gxp-audit` — バリデートされたシステムの監査
