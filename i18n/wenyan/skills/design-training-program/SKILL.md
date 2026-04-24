---
name: design-training-program
locale: wenyan
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

# 訓練課程之設

為監管之境立基於角色之 GxP 訓練課程，含課綱、能力評估與記錄管理。

## 用時

- 新驗證系統上線前用者須受訓
- 審計發現訓練不足或缺訓練記錄
- 組織變更引入新角色或職責
- 訓練課程周期性復核屆期
- 監管檢查之備須證訓練之足

## 入

- **必要**：須訓練人員之系統與流程
- **必要**：角色定義（管理員、用者、QA、管理層）
- **必要**：適用之訓練監管要求（GMP、GLP、GCP）
- **可選**：既有訓練資料或課綱
- **可選**：審計或績效評估所識之能力缺口
- **可選**：訓練管理系統之能

## 法

### 第一步：行訓練需求分析

識每角色須知之事：

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

**得：** 每角色皆有定之訓練要求，繫於其職與 GxP 之責。
**敗則：** 角色未明則先行 RACI 以定責，再定訓練之需。

### 第二步：設課綱

將訓練按題分為模塊：

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

**得：** 每模塊有定之時長、交付法、受眾與具體內容綱要。
**敗則：** 內容過廣於所配時長則分子模塊或立前置鏈。

### 第三步：立能力評估

為每模塊定能力之量：

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

**得：** 評估測知識（知何故）與技能（示何法）。
**敗則：** 通過率低於 70% 則先察訓練材料是否明晰，勿先責學者。

### 第四步：定訓練記錄與留存

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

**得：** 訓練記錄證每行 GxP 活動之人皆於其先受訓並受評。
**敗則：** 訓練記錄不全則行回顧性缺口評估，並施即刻補訓。

### 第五步：定再訓練觸發

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

**得：** 再訓練觸發具體、可量、繫於定時限。
**敗則：** 觸發期限前再訓練未畢則該人勿行所及之 GxP 活動，訓練畢後方可。

### 第六步：編訓練課程文檔

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

**得：** 完整訓練課程於系統上線或合規期前已批准生效。
**敗則：** 批准遲延則施臨時訓練措施，並書正式化之謀。

## 驗

- [ ] 諸與 GxP 系統相交之角色皆行訓練需求分析
- [ ] 課綱模塊已定時長、交付法、內容綱要
- [ ] 每模塊有能力評估且定通過之標
- [ ] 訓練矩陣追諸人於諸所需訓練之狀
- [ ] 訓練記錄留存合監管之要
- [ ] 再訓練觸發已定時限與評估之要
- [ ] 訓練課程已由 QA 與管理層批准

## 陷

- **訓練 = 讀 SOP**：讀簽宜於小修，非於初訓。新用者須講師帶領含實操
- **無能力評估**：訓而不評不能證已學。監管者期競力之證，非僅出席
- **訓者不合格**：訓者須可證於該題有能。檢查時常索「訓訓者」記錄
- **陳舊訓練矩陣**：人員進離轉時不更矩陣致合規缺口。宜與 HR 流程整合
- **一樣合一切**：管理員之訓深於用者。基於角色之課綱避免一困一輕

## 參

- `write-standard-operating-procedure` — SOP 驅動訓練內容與再訓練觸發
- `design-compliance-architecture` — 識哪些系統與角色須訓練
- `conduct-gxp-audit` — 審計常評估訓練之足
- `manage-change-control` — 系統變更觸發再訓練之要
- `prepare-inspection-readiness` — 訓練記錄為檢查之首要對象
