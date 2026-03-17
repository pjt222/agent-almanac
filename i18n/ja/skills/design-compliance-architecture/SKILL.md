---
name: design-compliance-architecture
description: >
  適用規制をコンピューター化システムにマッピングするコンプライアンスアーキテクチャを設計します。
  システムインベントリ、重要度分類（GxP重要、GxP補助、非GxP）、GAMP 5カテゴリー割り当て、
  規制要件のトレーサビリティ、ガバナンス構造の定義を対象とします。新しい規制施設の設立時、
  複数システムにわたるコンプライアンスの正式化時、規制ギャップ分析への対応時、
  合併・再編後のコンプライアンスの調和時、またはコンピューター化システムを参照する
  サイトマスターファイルの準備時に使用します。
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
  tags: gxp, compliance, architecture, regulatory, gamp-5, governance
---

# コンプライアンスアーキテクチャの設計

規制をシステムにマッピングし、重要度を分類し、規制環境のガバナンスを定義する最上位のコンプライアンスフレームワークを確立します。

## 使用タイミング

- 新しい規制施設、部門、またはプログラムを設立する場合
- 既存の組織が複数のシステムにわたるコンプライアンス態勢を正式化する必要がある場合
- 規制ギャップ分析でシステム分類やバリデーション戦略の欠如が明らかになった場合
- 合併、買収、または再編によりエンティティ間でコンプライアンスを調和させる必要がある場合
- コンピューター化システムを参照するサイトマスターファイルまたは品質マニュアルを準備する場合

## 入力

- **必須**: スコープ内のコンピューター化システムのリスト（名称、目的、ベンダー/カスタム）
- **必須**: 適用規制フレームワーク（21 CFR Part 11、EU Annex 11、GMP、GLP、GCP、ICH Q7、ICH Q10）
- **必須**: 組織コンテキスト（部門、サイト、製品タイプ）
- **任意**: 既存のバリデーションマスタープランまたは品質マニュアル
- **任意**: 以前の監査所見や規制査察の観察事項
- **任意**: 品質とITの報告ラインを示した組織図

## 手順

### ステップ1: システムインベントリの構築

すべてのコンピューター化システムの包括的なインベントリを作成します:

```markdown
# System Inventory
## Document ID: SI-[SITE]-[YYYY]-[NNN]

| ID | System Name | Version | Vendor | Purpose | Department | Data Types | Users |
|----|-------------|---------|--------|---------|------------|------------|-------|
| SYS-001 | LabWare LIMS | 8.1 | LabWare Inc. | Sample management and testing | QC | Test results, COA | 45 |
| SYS-002 | SAP ERP | S/4HANA | SAP SE | Batch release and inventory | Production | Batch records, BOM | 120 |
| SYS-003 | Custom R/Shiny | 2.1.0 | Internal | Statistical analysis | Biostatistics | Clinical data | 8 |
| SYS-004 | Windows Server | 2022 | Microsoft | File server | IT | Documents | 200 |
```

**期待結果：** GxP関連データを作成、変更、保存、取得、または送信するすべてのシステムがリストされていること。
**失敗時：** システムオーナーが完全な情報を提供できない場合は、ギャップを文書化し、ディスカバリーワークショップをスケジュールします。欠落したシステムは重大なコンプライアンスリスクです。

### ステップ2: システム重要度の分類

各システムに重要度階層を割り当てます:

```markdown
# System Criticality Classification
## Document ID: SCC-[SITE]-[YYYY]-[NNN]

### Classification Criteria

| Tier | Definition | Validation Required | Examples |
|------|-----------|-------------------|----------|
| **GxP-Critical** | Directly impacts product quality, patient safety, or data integrity. Generates or processes GxP records. | Full CSV per GAMP 5 | LIMS, ERP (batch), CDMS, MES |
| **GxP-Supporting** | Supports GxP processes but does not directly generate GxP records. Failure has indirect impact. | Risk-based qualification | Email, document management, scheduling |
| **Non-GxP** | No impact on product quality, safety, or data integrity. | IT standard controls only | HR systems, cafeteria, general web |

### System Classification Matrix

| System ID | System | Tier | Rationale |
|-----------|--------|------|-----------|
| SYS-001 | LabWare LIMS | GxP-Critical | Generates test results used for batch release |
| SYS-002 | SAP ERP | GxP-Critical | Manages batch records and material traceability |
| SYS-003 | R/Shiny App | GxP-Critical | Performs statistical analysis for regulatory submissions |
| SYS-004 | Windows Server | GxP-Supporting | Stores controlled documents but does not generate GxP data |
```

**期待結果：** すべてのシステムに文書化された根拠を含む階層割り当てがあること。
**失敗時：** システムの重要度が争われた場合は、品質委員会にエスカレートします。疑わしい場合は1段上の階層に分類し、正式なリスク評価後に再評価します。

### ステップ3: GAMP 5ソフトウェアカテゴリーの割り当て

GxP重要およびGxP補助の各システムにGAMP 5カテゴリーを割り当てます:

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

カテゴリー参照:
- **カテゴリー1**: インフラストラクチャー（OS、ファームウェア）— インストールの検証
- **カテゴリー3**: 設定なしCOTS — そのままの機能検証
- **カテゴリー4**: 設定済み製品 — すべての設定の検証
- **カテゴリー5**: カスタムアプリケーション — 完全なライフサイクルバリデーション

**期待結果：** カテゴリー割り当てがシステムが何であるかではなく、どのように使用されるかに基づいていること。
**失敗時：** システムが複数のカテゴリーにまたがる場合（例：カスタムアドオン付きCOTS）、カスタム部分をカテゴリー5として、ベースをカテゴリー4として分類します。

### ステップ4: 規制要件とシステムのマッピング

規制要件トレーサビリティマトリクスを作成します:

```markdown
# Regulatory Requirements Traceability Matrix
## Document ID: RRTM-[SITE]-[YYYY]-[NNN]

| Regulation | Clause | Requirement | Applicable Systems | Control Type |
|-----------|--------|-------------|-------------------|--------------|
| 21 CFR 11 | 11.10(a) | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| 21 CFR 11 | 11.10(d) | Access controls | SYS-001, SYS-002, SYS-003, SYS-004 | Technical |
| 21 CFR 11 | 11.10(e) | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| 21 CFR 11 | 11.50 | Signature manifestation | SYS-001, SYS-002 | Technical |
| EU Annex 11 | §4 | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| EU Annex 11 | §7 | Data storage and backup | All | Technical |
| EU Annex 11 | §9 | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| EU Annex 11 | §12 | Security and access | All | Technical |
| ICH Q10 | §3.2 | Change management | All GxP-Critical | Procedural |
| ICH Q10 | §1.8 | Knowledge management | SYS-001, SYS-003 | Procedural |
```

**期待結果：** すべての適用規制条項が少なくとも1つのシステムにマッピングされ、すべてのGxP重要システムが関連する規制条項にマッピングされていること。
**失敗時：** マッピングされていない条項はコンプライアンスのギャップを表します。各ギャップについてタイムライン付きの是正計画を作成します。

### ステップ5: システムごとのバリデーション戦略の定義

重要度、カテゴリー、規制マッピングに基づいて:

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

略語: URS（ユーザー要件）、RA（リスク評価）、VP（バリデーション計画）、IQ/OQ/PQ（インストール/運用/パフォーマンス適格性評価）、TM（トレーサビリティマトリクス）、VSR（バリデーション概要報告書）

**期待結果：** バリデーション工数がリスクに比例していること — カテゴリー5のGxP重要システムは完全なライフサイクル、カテゴリー1のインフラは簡略化されたIQを受けること。
**失敗時：** ステークホルダーが重要システムのバリデーション削減を要求する場合は、QAの署名入りでリスク受諾を文書化します。

### ステップ6: ガバナンス構造の設計

コンプライアンスを維持するための組織フレームワークを定義します:

```markdown
# Compliance Governance Structure

## Roles and Responsibilities
| Role | Responsibility | Authority |
|------|---------------|-----------|
| Quality Director | Overall compliance accountability | Approve validation strategies, accept risks |
| System Owner | Day-to-day system compliance | Approve changes, ensure validated state |
| Validation Lead | Plan and coordinate validation activities | Define validation scope and approach |
| IT Operations | Technical infrastructure and security | Implement technical controls |
| QA Reviewer | Independent review of validation deliverables | Accept or reject validation evidence |

## Governance Committees
| Committee | Frequency | Purpose | Members |
|-----------|-----------|---------|---------|
| Change Control Board | Weekly | Review and approve system changes | System owners, QA, IT, validation |
| Periodic Review Committee | Quarterly | Review system compliance status | Quality director, system owners, QA |
| Audit Programme Committee | Annual | Plan internal audit schedule | Quality director, lead auditor, QA |

## Escalation Matrix
| Issue | First Escalation | Second Escalation | Timeline |
|-------|-----------------|-------------------|----------|
| Critical audit finding | System Owner → QA Director | QA Director → Site Director | 24 hours |
| Validated state breach | Validation Lead → System Owner | System Owner → Quality Director | 48 hours |
| Data integrity incident | System Owner → QA Director | QA Director → Regulatory Affairs | 24 hours |
```

**期待結果：** すべてのコンプライアンス活動に明確な説明責任があり、孤立した責任がないこと。
**失敗時：** 役割が重複または未割り当ての場合は、RACI ワークショップを招集して解決します。曖昧なオーナーシップは繰り返しの規制引用となります。

### ステップ7: コンプライアンスアーキテクチャ文書の作成

すべてのコンポーネントをマスター文書にまとめます:

```markdown
# Compliance Architecture
## Document ID: CA-[SITE]-[YYYY]-[NNN]
## Version: 1.0

### 1. Purpose and Scope
[Organisation, site, product scope, regulatory scope]

### 2. System Inventory
[From Step 1]

### 3. Criticality Classification
[From Step 2]

### 4. GAMP 5 Category Assignments
[From Step 3]

### 5. Regulatory Requirements Traceability
[From Step 4]

### 6. Validation Strategy
[From Step 5]

### 7. Governance Structure
[From Step 6]

### 8. Periodic Review Schedule
- System inventory refresh: Annual
- Criticality re-assessment: When new systems added or regulations change
- Regulatory mapping update: When new guidance issued
- Governance review: Annual or after organisational change

### 9. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Director | | | |
| IT Director | | | |
| Regulatory Affairs | | | |
```

**期待結果：** 規制環境全体のコンプライアンスの青写真として機能する単一の文書。
**失敗時：** 文書が実用的なサイズを超える場合は、システムまたはドメインごとに補助文書を参照するマスター文書を作成します。

## バリデーション

- [ ] システムインベントリにGxPデータを扱うすべてのシステムが含まれている
- [ ] すべてのシステムに文書化された根拠を含む重要度階層がある
- [ ] すべてのGxP重要およびGxP補助システムにGAMP 5カテゴリーが割り当てられている
- [ ] 規制要件トレーサビリティマトリクスがすべての適用条項を対象としている
- [ ] すべてのGxP重要システムに定義されたバリデーション戦略がある
- [ ] ガバナンス構造が役割、委員会、エスカレーションパスを定義している
- [ ] すべての文書に一意のIDとバージョン管理がある
- [ ] コンプライアンスアーキテクチャ文書が品質とITリーダーシップに承認されている

## よくある落とし穴

- **不完全なインベントリ**: 欠落したシステムはコンプライアンスから見えない。ITに聞くだけでなく、ネットワークスキャン、ソフトウェア資産管理ツール、部門インタビューを使用すること
- **二項対立的な思考**: システムは単純に「GxP」または「非GxP」ではない。3階層モデル（重要、補助、非GxP）により過剰・過少バリデーションの両方を回避できる
- **カテゴリーの混同**: GAMP 5カテゴリーはソフトウェアが何であるかを説明するが、バリデーション工数はどのように使用されるかを反映すべき。バッチリリースに使用されるカテゴリー4システムは、スケジュール管理に使用されるカテゴリー4システムよりも多くのテストが必要
- **静的なアーキテクチャ**: コンプライアンスアーキテクチャは生きた文書。新しいシステム、規制変更、監査所見はすべて更新が必要
- **形骸化したガバナンス**: 書類上存在するが実際に開催されない委員会はコンプライアンス価値を提供しない。会議頻度と定足数要件を定義すること

## 関連スキル

- `perform-csv-assessment` — 個々のシステムに対してここで定義されたバリデーション戦略を実行する
- `manage-change-control` — ガバナンスで定義された変更管理プロセスを運用する
- `implement-electronic-signatures` — 規制マトリクスにマッピングされたe署名管理を実装する
- `prepare-inspection-readiness` — 査察準備の基盤としてこのアーキテクチャを使用する
- `conduct-gxp-audit` — ベースラインとしてコンプライアンスアーキテクチャを参照して監査する
