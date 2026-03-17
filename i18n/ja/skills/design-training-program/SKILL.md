---
name: design-training-program
description: >
  役割別トレーニングニーズ分析、カリキュラム設計（規制意識、システム固有、データ整合性）、
  コンピテンシー評価基準、トレーニング記録の保管、SOP改訂とインシデントに対するリトレーニング
  トリガーを含むGxPトレーニングプログラムを設計します。新しいバリデート済みシステムが
  本番稼働前のユーザートレーニングを必要とする場合、監査所見でトレーニングの不十分さが
  指摘された場合、組織変更で新しい役割が導入された場合、定期的なプログラムレビューが
  予定されている場合、または査察準備でトレーニングの十分さの実証が必要な場合に使用します。
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
  complexity: intermediate
  language: multi
  tags: gxp, training, competency, compliance, quality-management, curriculum
---

# トレーニングプログラムの設計

規制環境向けのカリキュラム、コンピテンシー評価、記録管理を含む役割別GxPトレーニングプログラムを作成します。

## 使用タイミング

- 新しいバリデート済みシステムが本番稼働前のユーザートレーニングを必要とする場合
- 監査所見でトレーニングの不十分さやトレーニング記録の欠如が指摘された場合
- 組織変更で新しい役割や責任が導入された場合
- トレーニングプログラムの定期的なレビューが予定されている場合
- 規制査察準備でトレーニングの十分さの実証が必要な場合

## 入力

- **必須**: トレーニングを受けた人員が必要なシステムとプロセス
- **必須**: 役割の定義（管理者、ユーザー、QA、管理職）
- **必須**: トレーニングに関する適用規制要件（GMP、GLP、GCP）
- **任意**: 既存のトレーニング資料またはカリキュラム
- **任意**: 監査またはパフォーマンスレビューで特定されたコンピテンシーのギャップ
- **任意**: トレーニング管理システムの機能

## 手順

### ステップ1: トレーニングニーズ分析の実施

各役割が知る必要のあることを特定します:

```markdown
# Training Needs Analysis
## Document ID: TNA-[DEPT]-[YYYY]-[NNN]

### Role-Based Training Requirements

| Role | GxP Awareness | System Training | Data Integrity | SOP Training | Assessment Type |
|------|--------------|----------------|----------------|--------------|-----------------|
| System Administrator | Advanced | Advanced | Advanced | Admin SOPs | Written + Practical |
| End User | Basic | Intermediate | Intermediate | Operational SOPs | Written + Practical |
| QA Reviewer | Advanced | Basic (review focus) | Advanced | QA SOPs | Written |
| Management | Basic | Overview only | Intermediate | Governance SOPs | Written |
| IT Support | Basic | Infrastructure only | Basic | IT SOPs | Written |

### Training Gap Analysis
| Role | Current Competency | Required Competency | Gap | Priority |
|------|-------------------|---------------------|-----|----------|
| [Role] | [Current level] | [Required level] | [Gap description] | [H/M/L] |
```

**期待結果：** すべての役割に職務機能とGxP責任にリンクされたトレーニング要件が定義されていること。
**失敗時：** 役割が明確に定義されていない場合は、トレーニングニーズを定義する前にRACIの実施で責任を確立します。

### ステップ2: カリキュラムの設計

トピック別にトレーニングをモジュールに構成します:

```markdown
# Training Curriculum
## Document ID: TC-[DEPT]-[YYYY]-[NNN]

### Module 1: GxP Regulatory Awareness
**Duration:** 2 hours | **Delivery:** Classroom / eLearning | **Audience:** All roles
**Content:**
1. Introduction to GxP regulations (GMP, GLP, GCP overview)
2. 21 CFR Part 11 and EU Annex 11 requirements for electronic records
3. Data integrity principles (ALCOA+)
4. Consequences of non-compliance (warning letters, consent decrees, product recalls)
5. Individual responsibilities and accountability

### Module 2: System-Specific Training — [System Name]
**Duration:** 4 hours | **Delivery:** Instructor-led with hands-on | **Audience:** Users, Admins
**Content:**
1. System purpose and GxP classification
2. Login, navigation, and role-based access
3. Core workflows (step-by-step for each user task)
4. Electronic signature procedures
5. Audit trail: how entries are created and what they mean
6. Error handling and deviation reporting
7. Data entry best practices

### Module 3: Data Integrity in Practice
**Duration:** 1.5 hours | **Delivery:** Workshop | **Audience:** Users, QA, Admins
**Content:**
1. ALCOA+ principles with system-specific examples
2. Common data integrity risks and how to avoid them
3. Recognising and reporting data integrity concerns
4. Audit trail review basics
5. Case studies: real-world data integrity failures and lessons learned

### Module 4: SOP Training — [SOP-ID]
**Duration:** 1 hour per SOP | **Delivery:** Read and sign / walkthrough | **Audience:** Per SOP scope
**Content:**
1. SOP purpose and scope
2. Step-by-step procedure walkthrough
3. Decision points and deviation handling
4. Forms and documentation requirements
5. Q&A and clarification
```

**期待結果：** 各モジュールに定義された所要時間、提供方法、対象者、特定の内容アウトラインがあること。
**失敗時：** 割り当てられた時間に対してコンテンツが多すぎる場合は、サブモジュールに分割するか前提条件チェーンを作成します。

### ステップ3: コンピテンシー評価の作成

各モジュールのコンピテンシーを測定する方法を定義します:

```markdown
# Competency Assessment Design

### Assessment Types
| Type | When to Use | Passing Score | Records |
|------|------------|---------------|---------|
| **Written test** | Knowledge assessment (regulations, principles) | 80% | Score sheet retained |
| **Practical demonstration** | Skill assessment (system operation) | All critical steps correct | Signed observation form |
| **Observed task** | On-the-job competency | Supervisor sign-off | Competency form |

### Sample Written Assessment — GxP Awareness (Module 1)
1. List the five ALCOA principles for data integrity. (5 points)
2. Under 21 CFR 11.50, what three elements must an electronic signature display? (3 points)
3. You discover that a colleague's data entry contains an error. Describe the correct procedure to correct it. (5 points)
4. True/False: A shared login account can be used if all users sign a logbook. (2 points — answer: False)
5. Describe one consequence of a data integrity failure for a pharmaceutical company. (5 points)

**Passing score:** 16/20 (80%)
**On failure:** Retraining required before re-assessment. Maximum 2 re-attempts.

### Practical Assessment Template
| Step | Task | Observed? | Performed Correctly? | Comments |
|------|------|-----------|---------------------|----------|
| 1 | Log in with personal credentials | Yes/No | Yes/No | |
| 2 | Navigate to [specific function] | Yes/No | Yes/No | |
| 3 | Enter test data correctly | Yes/No | Yes/No | |
| 4 | Apply electronic signature | Yes/No | Yes/No | |
| 5 | Locate and interpret audit trail | Yes/No | Yes/No | |

**Assessor:** _______ **Date:** _______ **Result:** Pass / Fail
```

**期待結果：** 評価が知識（なぜを理解する）とスキル（どうやるかを実演する）の両方をテストすること。
**失敗時：** 合格率が70%を下回る場合は、学習者を責める前にトレーニング資料の明確さをレビューします。

### ステップ4: トレーニング記録と保管の定義

```markdown
# Training Record Management

### Required Training Records
| Record | Format | Retention Period | Storage |
|--------|--------|-----------------|---------|
| Training matrix (who needs what) | Electronic | Current + 2 years superseded | Training management system |
| Individual training transcript | Electronic | Employment + 2 years | Training management system |
| Assessment results | Electronic or paper | Same as transcript | Training management system |
| Training materials (version used) | Electronic | Life of system + 1 year | Document management system |
| Trainer qualification records | Electronic | Employment + 2 years | HR system |

### Training Matrix Template
| Employee | Role | Module 1 | Module 2 | Module 3 | SOP-001 | SOP-002 | Status |
|----------|------|----------|----------|----------|---------|---------|--------|
| J. Smith | User | 2026-01-15 ✓ | 2026-01-16 ✓ | Due 2026-03-01 | 2026-01-20 ✓ | N/A | Partially trained |
| K. Jones | Admin | 2026-01-15 ✓ | 2026-01-17 ✓ | 2026-01-18 ✓ | 2026-01-20 ✓ | 2026-01-20 ✓ | Fully trained |
```

**期待結果：** トレーニング記録が、GxP活動を実施するすべての人員がその活動を実施する前にトレーニングを受け、評価されたことを実証していること。
**失敗時：** トレーニング記録が不完全な場合は、遡及的なトレーニングギャップ評価を実施し、即時の是正トレーニングを実施します。

### ステップ5: リトレーニングトリガーの定義

```markdown
# Retraining Triggers

| Trigger | Scope | Timeline | Assessment Required? |
|---------|-------|----------|---------------------|
| SOP revision (minor) | Affected users — read and sign | Before new version effective | No — read and acknowledge |
| SOP revision (major) | Affected users — formal retraining | Before new version effective | Yes — written or practical |
| System upgrade | All users of affected functionality | Before production go-live | Yes — practical demonstration |
| Data integrity incident | Involved personnel + department | Within 30 days of investigation closure | Yes — written |
| Audit finding (training-related) | Per CAPA scope | Per CAPA timeline | Per CAPA requirements |
| Annual refresher | All GxP personnel | Annual from initial training date | No — refresher acknowledgement |
| Role change | Individual | Before assuming new responsibilities | Yes — per new role requirements |
| Extended absence (>6 months) | Returning individual | Before resuming GxP activities | Yes — practical assessment |
```

**期待結果：** リトレーニングトリガーが具体的で測定可能で、定義されたタイムラインにリンクされていること。
**失敗時：** トレーニングがトリガー期限前に完了しない場合は、トレーニングが完了するまでその個人はGxP活動を実施してはなりません。

### ステップ6: トレーニングプログラム文書の作成

```markdown
# Training Programme
## Document ID: TRAINING-PROGRAM-[DEPT]-[YYYY]-[NNN]

### 1. Purpose and Scope
### 2. Training Needs Analysis [Step 1]
### 3. Curriculum [Step 2]
### 4. Competency Assessments [Step 3]
### 5. Training Records and Retention [Step 4]
### 6. Retraining Triggers [Step 5]
### 7. Programme Review
- Annual review of training effectiveness (pass rates, audit findings, incidents)
- Curriculum update when systems, SOPs, or regulations change
- Trainer qualification verification

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Training Manager | | | |
| QA Director | | | |
| Department Head | | | |
```

**期待結果：** 本番稼働またはコンプライアンス期限前に完全なトレーニングプログラムが承認・発効していること。
**失敗時：** 承認が遅延する場合は、暫定的なトレーニング措置を実施し、正式化の計画を文書化します。

## バリデーション

- [ ] GxPシステムと対話するすべての役割についてトレーニングニーズ分析が完了している
- [ ] カリキュラムモジュールが所要時間、提供方法、内容アウトラインとともに定義されている
- [ ] 各モジュールに定義された合格基準を含むコンピテンシー評価がある
- [ ] トレーニングマトリクスがすべての必要なトレーニングに対してすべての人員を追跡している
- [ ] トレーニング記録の保管が規制要件を満たしている
- [ ] リトレーニングトリガーがタイムラインと評価要件とともに定義されている
- [ ] トレーニングプログラムがQAと管理職に承認されている

## よくある落とし穴

- **トレーニング = SOPの読み上げ**: 読んでサインはマイナーな更新には適切だが、初期トレーニングには適さない。新しいユーザーには実習付きのインストラクター主導のトレーニングが必要
- **コンピテンシー評価なし**: 評価なしのトレーニングは学習が行われたことを実証できない。規制当局は出席の記録ではなくコンピテンシーの証拠を期待する
- **トレーナーが適格でない**: トレーナーは対象において実証可能なコンピテンシーを持たなければならない。「トレーナーのトレーニング」記録は査察中に頻繁に要求される
- **古いトレーニングマトリクス**: 人々が入社、退社、または役割を変更したときに更新されないトレーニングマトリクスはコンプライアンスギャップを生じさせる。HRプロセスと統合すること
- **全員同じ内容**: 管理者はエンドユーザーよりも深いトレーニングが必要。役割別カリキュラムにより一部のユーザーを圧倒し他のユーザーのトレーニングが不足するのを回避できる

## 関連スキル

- `write-standard-operating-procedure` — SOPがトレーニング内容とリトレーニングトリガーを決定する
- `design-compliance-architecture` — どのシステムと役割がトレーニングを必要とするかを特定する
- `conduct-gxp-audit` — 監査でトレーニングの十分さを頻繁に評価する
- `manage-change-control` — システム変更がリトレーニング要件をトリガーする
- `prepare-inspection-readiness` — トレーニング記録は主要な査察対象
