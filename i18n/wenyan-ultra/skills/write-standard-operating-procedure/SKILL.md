---
name: write-standard-operating-procedure
locale: wenyan-ultra
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

# 書 SOP

立合 GxP 之 SOP 予管行清可審指。

## 用

- 新驗系須行程→用
- 現非式程須正→用
- 審覓引缺程→用
- 變控觸 SOP 更→用
- 定審覓舊程容→用

## 入

- **必**：SOP 蓋之程或系
- **必**：管境（GMP、GLP、GCP、21 CFR Part 11、EU Annex 11）
- **必**：標讀（從此 SOP 之角）
- **可**：現非式程、工指、訓材
- **可**：與此程接之關 SOP
- **可**：致 SOP 立之審覓或管察

## 行

### 一：派文控元

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

得：每 SOP 有獨 ID 從機構文號規。
敗：無號規→先立：[TYPE]-[DEPT]-[3 位序]。

### 二：書意與範

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

得：意一二句。範清定界。
敗：範與現 SOP 疊→參現 SOP 於疊節，或改二者除疊。

### 三：定詞與縮

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

得：諸用縮與技詞皆定。
敗：詞含混或域特→參機構詞典或關管指得權威定。

### 四：派責

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

得：行節中諸行可溯責角。
敗：步無派角→孤責。SOP 批前派主。

### 五：書行節

此 SOP 核。書步步指：

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

GxP SOP 書則：
- 每步以行詞始（驗、錄、入、批、通）
- 詳足訓員可從而無解
- 含決點附各路標
- 參確切表名、系幕、工識
- 含止點：工須停候批或驗

得：訓而不熟特程之人可從此步行正。
敗：題專謂程含混→加詳或斷步為副步。SOP 含混為復現審覓。

### 六：加參、附件、修史

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

得：諸所參文用可訪、修史始於 1.0。
敗：所參文未存→建之、或移參並錄 SOP 審中之隙。

### 七：路審與批

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

得：SOP 由題專審、由質批方生效。
敗：批流延→效日須推。SOP 無完批不可生效。

## 驗

- [ ] 文 ID 從機構號規
- [ ] 意特且簡（1-2 句）
- [ ] 範清定範內外界
- [ ] 諸縮與技詞皆定
- [ ] 責節各角配步
- [ ] 行步以行詞始且詳足從無解
- [ ] 決點附各路標
- [ ] 偏理已定
- [ ] 諸所參文存可訪
- [ ] 修史完從 1.0
- [ ] 批簽含作者、審者、批者
- [ ] 定審程已定

## 忌

- **過泛**：「確數質」非行步。「驗 Form-001 諸 15 欄填且於 Appendix A 範內」乃行步
- **過詳**：含每誤之排疾使 SOP 不可讀。複排引別工指
- **無偏理**：每 SOP 須定不能從時何為。偏默示無偏可能
- **訓前生效**：諸用未訓而 SOP 生效→即合隙
- **孤 SOP**：永不審之 SOP 舊不靠。設審日跡於文控系

## 參

- `design-compliance-architecture` — 辨何系與程須 SOP
- `manage-change-control` — 程變時觸 SOP 更
- `design-training-program` — 確用於新更 SOP 受訓
- `conduct-gxp-audit` — 審評 SOP 足與從
- `write-validation-documentation` — SOP 與驗文共批流
