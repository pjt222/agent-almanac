---
name: design-training-program
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design a GxP training programme covering training needs analysis by role,
  curriculum design (regulatory awareness, system-specific, data integrity),
  competency assessment criteria, training record retention, and retraining
  triggers for SOP revisions and incidents. Use when a new validated system
  requires user training before go-live, an audit finding cites inadequate
  training, organisational changes introduce new roles, a periodic programme
  review is due, or inspection preparation requires demonstrating training
  adequacy.
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

# 設計培訓計劃

為受管制環境建以角色為本之 GxP 培訓計劃，含課程、能力評估、記錄管理。

## 適用時機

- 新驗證系統上線前，使用者須受訓
- 審計發現稱培訓不足或記錄缺失
- 組織變革引入新角色或職責
- 培訓計劃之定期審查到期
- 法規檢查準備須證培訓之足

## 輸入

- **必要**：需受訓人員之系統與流程
- **必要**：角色定義（管理員、使用者、QA、管理層）
- **必要**：培訓所適用之法規要求（GMP、GLP、GCP）
- **選擇**：既有之培訓材料或課程
- **選擇**：審計或績效審查中辨出之能力缺口
- **選擇**：培訓管理系統之能力

## 步驟

### 步驟一：行培訓需求分析

辨每角色所需知之事：

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

**預期：** 每角色皆有定義之培訓要求，繫於其職能與 GxP 責任。
**失敗時：** 角色未明時，先行 RACI 演練以立職責，後定培訓需求。

### 步驟二：設計課程

按主題將培訓結構為模組：

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

**預期：** 每模組定有時長、傳授方式、受眾、具體內容綱要。
**失敗時：** 內容太廣不符所分之時長時，分為子模組或建前置鏈。

### 步驟三：建能力評估

定每模組之能力如何衡量：

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

**預期：** 評估測知識（明其所以然）與技能（演其所當為）兩者。
**失敗時：** 通過率低於 70% 時，先審培訓材料之清晰度，莫即責學員。

### 步驟四：定培訓記錄與保存

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

**預期：** 培訓記錄可證每位行 GxP 活動之人員於前已受訓並評。
**失敗時：** 培訓記錄不全時，行回溯培訓缺口評估，即施補救培訓。

### 步驟五：定再培訓之觸發

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

**預期：** 再培訓觸發具體、可量、繫於定時限。
**失敗時：** 再培訓未於觸發期限前完成時，其人不得行所影響之 GxP 活動，直至培訓畢。

### 步驟六：編培訓計劃文件

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

**預期：** 培訓計劃齊備並已核准，於系統上線或合規截止前生效。
**失敗時：** 核准遲時，施臨時培訓措施，並錄正式化之計劃。

## 驗證

- [ ] 與 GxP 系統互動之所有角色皆完成培訓需求分析
- [ ] 課程模組皆定時長、傳授方式、內容綱要
- [ ] 每模組皆有能力評估，定通過標準
- [ ] 培訓矩陣追蹤所有人員對所有必要培訓之狀態
- [ ] 培訓記錄保存達法規要求
- [ ] 再培訓觸發皆定時限與評估要求
- [ ] 培訓計劃由 QA 與管理層核准

## 常見陷阱

- **培訓即讀 SOP**：讀簽適於小更新，非初次培訓。新使用者需導師引領之培訓並動手演練。
- **無能力評估**：培訓而無評估，不能證學有所成。監管機構期待能力之證，非僅出席之憑。
- **講師無資格**：講師須可證明其主題之能。「培訓講師之培訓」記錄於檢查時常被索。
- **培訓矩陣陳舊**：人員入、出、變角色而矩陣不更，合規生缺。須與 HR 流程整合。
- **一刀切**：管理員需較深之培訓，使用者則不然。以角色為本之課程免既淹沒一些、又培訓不足他者之弊。

## 相關技能

- `write-standard-operating-procedure` — SOP 驅動培訓內容與再培訓觸發
- `design-compliance-architecture` — 辨需培訓之系統與角色
- `conduct-gxp-audit` — 審計常評培訓之足
- `manage-change-control` — 系統之變觸發再培訓之需
- `prepare-inspection-readiness` — 培訓記錄為檢查之要標
