---
name: write-standard-operating-procedure
locale: wenyan
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

# 書標準作業程序

立合 GxP 之標準作業程序（SOP），予監管活動以明、可審之囑。

## 用時

- 新已驗系需作業程
- 現非式之程需化為 SOP
- 審發現引缺或不足之程
- 變控觸 SOP 更
- 周期察識陳之程內

## 入

- **必要**：SOP 涵之過或系
- **必要**：監管脈絡（GMP、GLP、GCP、21 CFR Part 11、EU Annex 11）
- **必要**：目用者（將從此 SOP 之角）
- **可選**：現非式程、工囑、或訓材
- **可選**：與此程界之相關 SOP
- **可選**：致 SOP 立之審發現或監管察

## 法

### 第一步：授文控元

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

得：每 SOP 有唯 ID 從組之文號約。
敗則：無號約者，前進前立之：[TYPE]-[DEPT]-[3 位序]。

### 第二步：書其用與其範

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

得：用為一二句。範明定界。
敗則：範與現 SOP 重者，或為重段引現 SOP，或修兩 SOP 以除重。

### 第三步：定詞與略

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

得：SOP 中每略與技詞皆已定。
敗則：詞歧或域特者，查組之詞表或相關監管囑為權威定。

### 第四步：授責

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

得：程段每行皆可溯至責角。
敗則：程步無授角者，為孤責。SOP 批前授屬。

### 第五步：書程段

此為 SOP 核。書逐步囑：

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

GxP SOP 之書則：
- 每步以行動詞始（驗、錄、入、批、通）
- 具足以使訓員無解而從
- 含決點附每路明準
- 引精表名、系幕、或具識
- 含止點，工須止待批或驗

得：訓人不熟此特過者可從之而正。
敗則：家謂程歧者，加詳或分步為子步。SOP 之歧為常審發現。

### 第六步：加參、附、修史

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

得：諸引文於用者可達，修史自版 1.0 始。
敗則：引文未存者，立之或去其引並注 SOP 察之缺。

### 第七步：路察與批

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

得：SOP 為家察，質前批方生效。
敗則：批流延者，效日須推。SOP 無完批不能生效。

## 驗

- [ ] 文 ID 從組之號約
- [ ] 用具且簡（1-2 句）
- [ ] 範明定內外界
- [ ] 諸略與技詞皆定
- [ ] 責段中每角映程步
- [ ] 程步以行動詞始且具足以無解而從
- [ ] 決點各路有明準
- [ ] 偏差處已定
- [ ] 諸引文存且可達
- [ ] 修史自版 1.0 完
- [ ] 批簽含作、察、批者
- [ ] 周期察程已定

## 陷

- **過糊**：「確數質」非程步。「驗 Form-001 之 15 域皆充且依 Appendix A 於範」乃。
- **過詳**：含每訛之排診使 SOP 不可讀。複排診引別工囑
- **無偏差處**：每 SOP 必定程不可從時何為。偏差默謂無偏差可
- **訓前生效**：SOP 諸用者訓前生效立致合差
- **孤 SOP**：未察之 SOP 陳不可信。設察日且於文控系追之

## 參

- `design-compliance-architecture` — 識何系與過需 SOP
- `manage-change-control` — 過變時觸 SOP 更
- `design-training-program` — 確用者於新與更 SOP 已訓
- `conduct-gxp-audit` — 審評 SOP 之足與從
- `write-validation-documentation` — SOP 與驗文共批流
