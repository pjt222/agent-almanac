---
name: implement-electronic-signatures
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement electronic signatures compliant with 21 CFR Part 11 Subpart C
  and EU Annex 11. Covers signature manifestation (signer, date/time, meaning),
  signature-to-record binding, biometric vs non-biometric controls, policy
  creation, and user certification requirements. Use when a computerized system
  requires legally binding electronic signatures for GxP records, when replacing
  wet-ink signatures in regulated workflows, when implementing batch release or
  document approval workflows, or when a regulatory gap reveals missing
  signature controls.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, electronic-signatures, 21-cfr-11, eu-annex-11, compliance, authentication
---

# 電子簽名之實

設並實合 21 CFR Part 11 Subpart C 與 EU Annex 11 之電子簽名控制，為受管電子記錄。

## 用時

- 電算系統需 GxP 記錄之法律有效電子簽名
- 於受管工作流以電子代濕墨簽
- 實批放行、文檔核、資料簽之核工作流
- 法規間隙評現缺簽名控
- 建或配須合 21 CFR 11.50–11.300 之系統

## 入

- **必要**：系統述與簽名用例（所簽何記）
- **必要**：適法（21 CFR Part 11、EU Annex 11、特 GxP 語境）
- **必要**：所需簽名類（核、審、承、著）
- **可選**：當前認證架構（Active Directory、LDAP、SSO）
- **可選**：現電子簽名策或 SOP
- **可選**：系統廠對簽名能之文檔

## 法

### 第一步：評電子簽名需之適用

定何 21 CFR Part 11 Subpart C 條適用：

```markdown
# Electronic Signature Applicability Assessment
## Document ID: ESA-[SYS]-[YYYY]-[NNN]

### Regulatory Scope
| Provision | Section | Requirement | Applies? | Rationale |
|-----------|---------|-------------|----------|-----------|
| General requirements | 11.50 | Signed records contain name, date/time, meaning | Yes/No | [Rationale] |
| Signing by another | 11.50 | Signatures not shared or transferred | Yes/No | [Rationale] |
| Signature linking | 11.70 | Signatures linked to records so they cannot be falsified | Yes/No | [Rationale] |
| General e-sig requirements | 11.100 | Unique to one individual, verified before use | Yes/No | [Rationale] |
| Non-biometric controls | 11.200 | Two distinct identification components at first signing | Yes/No | [Rationale] |
| Biometric controls | 11.200 | Designed to prevent use by anyone other than genuine owner | Yes/No | [Rationale] |
| Certification to FDA | 11.300 | Organisation certifies e-sigs are intended to be legally binding | Yes/No | [Rationale] |

### Signature Use Cases
| Use Case | Record Type | Meaning | Frequency | Current Method |
|----------|-------------|---------|-----------|----------------|
| Batch release | Batch record | "Approved for release" | Daily | Wet-ink |
| Document approval | SOP | "Approved" | Weekly | Wet-ink |
| Data review | Lab results | "Reviewed and verified" | Daily | Wet-ink |
| Deviation closure | Deviation report | "Closed — CAPA effective" | As needed | Wet-ink |
```

**得：** 每簽名用例皆有法規據記與定義之意。

**敗則：** 若用例不需 21 CFR 11 合規（如非 GxP 記錄），記排除理由並施相稱控。

### 第二步：設簽名呈現

依 21 CFR 11.50 定簽名必顯資訊：

```markdown
# Signature Manifestation Specification

### Required Manifestation Elements (21 CFR 11.50)
Every electronic signature must display:
1. **Printed name** of the signer
2. **Date and time** the signature was applied (ISO 8601 format)
3. **Meaning** of the signature (e.g., "Approved," "Reviewed," "Authored")

### Manifestation Format
| Element | Source | Format | Example |
|---------|--------|--------|---------|
| Name | User directory (AD/LDAP) | "First Last" | "Jane Smith" |
| Date/Time | System clock (NTP-synced) | YYYY-MM-DDTHH:MM:SS±TZ | 2026-02-09T14:30:00+01:00 |
| Meaning | Signature type definition | Predefined list | "Approved for release" |

### Signature Meanings Registry
| Code | Meaning | Used For | Authority Level |
|------|---------|----------|----------------|
| APPROVE | "Approved" | Final approval of documents and records | Manager and above |
| REVIEW | "Reviewed and verified" | Technical review of data | Qualified reviewer |
| AUTHOR | "Authored" | Document creation | Author |
| CLOSE | "Closed — corrective action verified" | CAPA and deviation closure | QA |
```

**得：** 簽名呈現不含糊——閱已簽記者皆能識誰簽、何時、何因。

**敗則：** 若系統不能於記錄視中顯三元素，實可自已簽記存取之簽名細節頁。

### 第三步：實簽名對記綁定

確簽名不可除、複、或於記間移（21 CFR 11.70）：

```markdown
# Signature Binding Specification

### Binding Method
| Method | Mechanism | Strength | Use When |
|--------|-----------|----------|----------|
| **Cryptographic** | Digital signature with PKI certificate | Strongest — tamper-evident | Custom applications, high-risk records |
| **Database referential** | Foreign key constraint linking signature table to record table | Strong — database-enforced | Configured COTS with relational DB |
| **Application-enforced** | Application logic prevents signature modification | Moderate — depends on app security | Vendor systems with signature modules |

### Selected Approach: [Cryptographic / Database referential / Application-enforced]

### Binding Requirements
- [ ] Signature cannot be removed from the record without detection
- [ ] Signature cannot be copied to a different record
- [ ] Signed record cannot be modified after signing without invalidating the signature
- [ ] Signature audit trail records all signature events (apply, invalidate, re-sign)
- [ ] Binding survives record export (PDF, print includes signature metadata)
```

**得：** 已簽記與簽名不可分——改其一則綁定無效。

**敗則：** 若系統不能於技術級強執綁定，實程序控（雙監管、週期核對）並記補償控。

### 第四步：配認證控

依 21 CFR 11.100 與 11.200 實身份驗：

```markdown
# Authentication Configuration

### Identity Verification (11.100)
- [ ] Each signer has a unique user identity (no shared accounts)
- [ ] Identity verified by at least two of: something you know, have, are
- [ ] Identity assignment documented and approved by security officer
- [ ] Periodic identity re-verification (at least annually)

### Non-Biometric Controls (11.200(a))
For non-biometric signatures (username + password):

**First Signing in a Session:**
- Require both identification (username) AND authentication (password)
- Two distinct identification components at first use

**Subsequent Signings (Same Session):**
- At least one identification component (e.g., password re-entry)
- Session timeout: [Define maximum idle time, e.g., 15 minutes]

**Continuous Session Signing:**
- If multiple signatures in one uninterrupted session, password re-entry for each signature
- System detects session continuity (no logout, no timeout, no workstation lock)

### Password Policy (Supporting 11.200)
| Parameter | Requirement |
|-----------|------------|
| Minimum length | 12 characters |
| Complexity | Upper + lower + number + special |
| Expiry | 90 days (or per organisational policy) |
| History | Cannot reuse last 12 passwords |
| Lockout | After 5 failed attempts, lock for 30 minutes |
| Initial password | Must be changed on first use |
```

**得：** 認證強執唯所識個體可施其簽名。

**敗則：** 若系統不支會話察之簽名控，每簽名事件皆需全重認證（用戶名+密碼）。

### 第五步：創電子簽名策

```markdown
# Electronic Signature Policy
## Document ID: ESP-[ORG]-[YYYY]-[NNN]

### 1. Purpose
This policy establishes requirements for the use of electronic signatures as legally binding equivalents of handwritten signatures for GxP electronic records.

### 2. Scope
Applies to all computerized systems listed in the Compliance Architecture (CA-[SITE]-[YYYY]-[NNN]) that require signatures for GxP records.

### 3. Definitions
- **Electronic signature**: A computer data compilation of any symbol or series of symbols executed, adopted, or authorized by an individual to be the legally binding equivalent of the individual's handwritten signature.
- **Biometric**: A method of verifying an individual's identity based on measurement of a physical feature (fingerprint, retina, voice pattern).
- **Non-biometric**: A method using a combination of identification codes (username) and passwords.

### 4. Requirements
4.1 All electronic signatures shall include the printed name, date/time, and meaning.
4.2 Each individual shall have a unique electronic signature that is not shared.
4.3 Signatures shall be linked to their respective records such that they cannot be falsified.
4.4 Before an individual uses their electronic signature, the organisation shall verify their identity.
4.5 Individuals must certify that their electronic signature is intended to be the legally binding equivalent of their handwritten signature.

### 5. User Certification
Each user must sign the Electronic Signature Certification Form before first use:

"I, [Full Name], certify that my electronic signature, as used within [System Name], is the legally binding equivalent of my handwritten signature. I understand that I am solely responsible for all actions performed under my electronic signature."

Signature: _____________ Date: _____________

### 6. FDA Certification (11.300)
The organisation shall submit a certification to the FDA that electronic signatures used within its systems are intended to be the legally binding equivalent of handwritten signatures.
```

**得：** 策文檔於電子簽名上線前已得質量、IT、法律/法規事務之核。

**敗則：** 若法律顧問未審策，標此為合規險並於首用電子簽名前得法律審。

### 第六步：驗實現

為所有簽名控執驗測：

```markdown
# E-Signature Verification Protocol

| Test ID | Test Case | Expected Result | Actual | Pass/Fail |
|---------|-----------|-----------------|--------|-----------|
| ES-001 | Apply signature to record | Name, date/time, meaning displayed | | |
| ES-002 | Attempt to modify signed record | System prevents modification or invalidates signature | | |
| ES-003 | Attempt to copy signature to different record | System prevents or signature is invalid | | |
| ES-004 | Sign with incorrect password | Signature rejected, failed attempt logged | | |
| ES-005 | Sign after session timeout | Full re-authentication required | | |
| ES-006 | Sign within continuous session | Password re-entry required | | |
| ES-007 | View signed record as different user | Signature details visible but not editable | | |
| ES-008 | Export signed record to PDF | PDF includes signature metadata | | |
| ES-009 | Attempt to use another user's credentials | System detects and rejects | | |
| ES-010 | Verify audit trail captures signature event | Timestamp, user, meaning, record ID logged | | |
```

**得：** 所有測用例皆過，示簽名控合法規需。

**敗則：** 敗測用例須整改於系統上線前。以變更控記敗為偏差並跟解。

## 驗

- [ ] 適用評記何 21 CFR 11 Subpart C 條適用
- [ ] 每用例之簽名呈現含名、日時、意
- [ ] 簽名綁定防簽名除、複、移
- [ ] 認證於首簽要求二獨立識組分
- [ ] 密碼策合最低安全需
- [ ] 電子簽名策已得質量、IT、法律核
- [ ] 所有簽者已收用戶認證書
- [ ] FDA 認證已提（若 11.300 要求）
- [ ] 驗測於所有簽名控皆過

## 陷

- **認證與電子簽名混**：登入為認證；簽記為電子簽名。法規需異
- **共享帳**：有共享帳之系統不能有合規電子簽名。於實 e-sig 前解共享帳
- **缺意**：顯名日而不顯意（「核」、「審」）之簽名不合 21 CFR 11.50
- **會話處理**：允續會話簽不重認證弱化簽名之身份保
- **忘 11.300 認證**：於 FDA 受管語境用電子簽名之組織必向 FDA 認證其意 e-sig 為法律有效

## 參

- `design-compliance-architecture` — 跨系統映電子簽名需
- `implement-audit-trail` — 審計軌捕簽名事件
- `write-validation-documentation` — 驗測為 OQ 文檔之部
- `write-standard-operating-procedure` — 電子簽名用之 SOP
- `manage-change-control` — 簽名配置變經變更控
