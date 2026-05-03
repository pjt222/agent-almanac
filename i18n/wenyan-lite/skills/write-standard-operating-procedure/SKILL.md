---
name: write-standard-operating-procedure
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write a GxP-compliant Standard Operating Procedure (SOP). Covers regulatory
  SOP template structure (purpose, scope, definitions, responsibilities,
  procedure, references, revision history), approval workflow design,
  periodic review scheduling, and operational procedures for system use. Use
  when a new validated system requires operational procedures, when existing
  informal procedures need formalisation, when an audit finding cites missing
  procedures, when a change control triggers SOP updates, or when periodic
  review identifies outdated procedural content.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, sop, procedure, documentation, compliance, quality-management
---

# 撰寫標準作業程序

建立符合 GxP 之標準作業程序（SOP）,為受規管之活動提供清晰、可稽核之指示。

## 適用時機

- 新已驗證之系統需作業程序
- 既有非正式程序需正式化為 SOP 格式
- 稽核發現指出程序缺失或不足
- 變更控制觸發 SOP 更新
- 定期審查辨識出過時之程序內容

## 輸入

- **必要**：SOP 涵蓋之過程或系統
- **必要**：法規背景（GMP、GLP、GCP、21 CFR Part 11、EU Annex 11）
- **必要**：目標對象（將遵循此 SOP 之角色）
- **選擇性**：既有非正式程序、工作指示或訓練材料
- **選擇性**：與此程序介接之相關 SOP
- **選擇性**：驅動 SOP 建立之稽核發現或法規觀察

## 步驟

### 步驟一：指派文檔控制元資料

```markdown
# Standard Operating Procedure
## Document ID: SOP-[DEPT]-[NNN]
## Title: [Descriptive Title of the Procedure]

| Field | Value |
|-------|-------|
| Document ID | SOP-[DEPT]-[NNN] |
| Version | 1.0 |
| Effective Date | [YYYY-MM-DD] |
| Review Date | [YYYY-MM-DD + review period] |
| Department | [Department name] |
| Author | [Name, Title] |
| Reviewer | [Name, Title] |
| Approver | [Name, Title] |
| Classification | [GxP-Critical / GxP-Supporting] |
| Supersedes | [Previous SOP ID or "N/A — New"] |
```

**預期：** 每 SOP 皆有依組織文檔編號慣例之獨特 ID。
**失敗時：** 若無編號慣例,進行前先建立：[TYPE]-[DEPT]-[3 位連號]。

### 步驟二：撰寫目的與範圍

```markdown
### 1. Purpose
This SOP defines the procedure for [specific activity] to ensure [regulatory objective].

### 2. Scope
**In scope:**
- [System, process, or activity covered]
- [Applicable departments or roles]
- [Specific regulatory requirements addressed]

**Out of scope:**
- [Related activities covered by other SOPs — reference them]
- [Systems or departments not covered]
```

**預期：** 目的為一兩句。範圍清晰定義邊界。
**失敗時：** 若範圍與既有 SOP 重疊,或於重疊段引用既有 SOP,或修訂兩 SOP 以消除重疊。

### 步驟三：定義術語與縮寫

```markdown
### 3. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available |
| CCB | Change Control Board |
| GxP | Good [Manufacturing/Laboratory/Clinical] Practice — umbrella for all regulated quality standards |
| SOP | Standard Operating Procedure |
| [Add terms specific to this SOP] | [Definition] |
```

**預期：** SOP 中所用之每縮寫與技術術語皆已定義。
**失敗時：** 若術語含糊或領域特定,參組織之詞彙表或相關法規指引以獲權威定義。

### 步驟四：指派責任

```markdown
### 4. Responsibilities

| Role | Responsibilities |
|------|-----------------|
| System Owner | Ensure SOP compliance, approve changes, conduct periodic review |
| System Administrator | Execute daily operations per this SOP, report deviations |
| Quality Assurance | Review SOP for regulatory compliance, approve new versions |
| End Users | Follow procedures as written, report issues to system administrator |
| Training Coordinator | Ensure all affected personnel are trained before SOP effective date |
```

**預期：** 程序段中之每行動皆可追溯至負責角色。
**失敗時：** 若某程序步驟無指派角色,即為孤立責任。SOP 核准前指派所有者。

### 步驟五：撰寫程序段

此為 SOP 之核心。撰寫逐步指示：

```markdown
### 5. Procedure

#### 5.1 [First Major Activity]
1. [Action verb] [specific instruction]. Reference: [form, system screen, tool].
2. [Action verb] [specific instruction].
   - If [condition], then [action].
   - If [alternative condition], then [alternative action].
3. [Action verb] [specific instruction].
4. Record the result in [form/system/log].

#### 5.2 [Second Major Activity]
1. [Action verb] [specific instruction].
2. Verify [specific criterion].
3. If verification fails, initiate [deviation procedure — reference SOP-XXX].

#### 5.3 Deviation Handling
1. If any step cannot be performed as written, STOP and document the deviation.
2. Notify [role] within [timeframe].
3. Complete Deviation Form [form reference].
4. Do not proceed until [role] provides disposition.
```

GxP SOP 之撰寫規則：
- 每步以動作動詞開始（驗證、記錄、輸入、核准、通知）
- 具體至受訓操作員無需解釋即可遵循
- 含決策點,各路徑有清晰準則
- 引用確切之表單名、系統畫面或工具識別符
- 含工作須暫停以待核准或驗證之保留點

**預期：** 受訓但對特定過程不熟之人可正確遵循這些步驟。
**失敗時：** 若主題專家謂程序含糊,加細節或將該步分為子步驟。SOP 中之含糊為反覆出現之稽核發現。

### 步驟六：加參考、附件與修訂歷史

```markdown
### 6. References
| Document ID | Title |
|-------------|-------|
| SOP-QA-001 | Document Control |
| SOP-IT-015 | User Access Management |
| [Regulation reference] | [e.g., 21 CFR Part 11] |

### 7. Attachments
| Attachment | Description |
|-----------|-------------|
| Form-001 | [Form name and purpose] |
| Template-001 | [Template name and purpose] |

### 8. Revision History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | [Date] | [Name] | Initial release |
```

**預期：** 所有引用文檔對用戶可存取,修訂歷史自版本 1.0 始。
**失敗時：** 若引用文檔尚不存在,或建立之,或移除引用並於 SOP 審查中註明缺口。

### 步驟七：路由審查與核准

```markdown
### Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | [Name] | | |
| Technical Reviewer | [Name] | | |
| QA Reviewer | [Name] | | |
| Approver (Department Head) | [Name] | | |

### Training Requirement
All personnel listed in Section 4 must complete training on this SOP before the effective date. Training must be documented in the training management system.

### Periodic Review
This SOP must be reviewed at least every [2 years / annually] or when triggered by:
- Change control affecting the covered process or system
- Audit finding related to the covered process
- Regulatory guidance update affecting the covered requirements
```

**預期：** SOP 由主題專家審查,並於生效前由品保核准。
**失敗時：** 若核准工作流延宕,生效日期須延後。SOP 不得於核准未完成時生效。

## 驗證

- [ ] 文檔 ID 遵循組織編號慣例
- [ ] 目的具體簡潔（1-2 句）
- [ ] 範圍清晰定義範圍內外之邊界
- [ ] 所有縮寫與技術術語皆已定義
- [ ] 責任段中之每角色皆對應至程序步驟
- [ ] 程序步驟以動作動詞開始,具體至無需解釋即可遵循
- [ ] 決策點有各路徑之清晰準則
- [ ] 偏差處理已定義
- [ ] 所有引用文檔存在且可存取
- [ ] 修訂歷史自版本 1.0 完整
- [ ] 核准簽名含作者、審查者與核准者
- [ ] 定期審查時程已定義

## 常見陷阱

- **過於模糊**：「確保資料品質」非程序步驟。「驗證 Form-001 之 15 欄位皆填寫,且符合附錄 A 之範圍」方為
- **過於細節**：含每可能錯誤之疑難排解使 SOP 不可讀。對複雜疑難排解引用獨立工作指示
- **無偏差處理**：每 SOP 須定義程序無法依寫法執行時應為何。對偏差緘默暗示無偏差可能
- **訓練前生效**：所有用戶受訓前 SOP 生效造成立即合規缺口
- **孤立 SOP**：從未審查之 SOP 變過時且不可靠。設審查日期並於文檔控制系統追蹤之

## 相關技能

- `design-compliance-architecture` — 辨識需 SOP 之系統與過程
- `manage-change-control` — 過程變化時觸發 SOP 更新
- `design-training-program` — 確保用戶受訓於新與更新之 SOP
- `conduct-gxp-audit` — 稽核評估 SOP 之充分性與遵循
- `write-validation-documentation` — SOP 與驗證文檔共享核准工作流
