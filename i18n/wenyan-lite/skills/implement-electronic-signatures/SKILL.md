---
name: implement-electronic-signatures
locale: wenyan-lite
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

# 實電子簽章

設計並實電子簽章控制，合 21 CFR Part 11 Subpart C 與 EU Annex 11 之管制電子記錄要求。

## 適用時機

- 電腦化系統需為 GxP 記錄具法律約束力之電子簽章
- 於管制工作流程中以電子等效代濕墨簽章
- 實批次放行、文件核准或資料簽核之核准工作流程
- 監管差距評估顯缺簽章控制
- 建或配必合 21 CFR 11.50-11.300 之系統

## 輸入

- **必要**：系統描述與簽章用例（何記錄受簽）
- **必要**：所適法規（21 CFR Part 11、EU Annex 11、特定 GxP 情境）
- **必要**：所需之簽章類型（核准、審閱、認可、作者）
- **選擇性**：現有驗證基礎設施（Active Directory、LDAP、SSO）
- **選擇性**：現有電子簽章政策或 SOP
- **選擇性**：系統供應商之簽章能力文件

## 步驟

### 步驟一：評電子簽章要求之適用性

定哪些 21 CFR Part 11 Subpart C 條款適用：

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

**預期：** 每簽章用例有記錄之監管基礎與定之意義。
**失敗時：** 若用例不需 21 CFR 11 合規（如非 GxP 記錄），記排除理由並施相稱控制。

### 步驟二：設計簽章表現

依 21 CFR 11.50 定簽章須顯示何資訊：

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

**預期：** 簽章表現明確——任何察已簽記錄者可識誰簽、何時、何故。
**失敗時：** 若系統不能於記錄檢視中顯示三要素，實可自已簽記錄存取之簽章詳情頁。

### 步驟三：實簽章與記錄之綁定

確簽章不可於記錄間移、複或轉（21 CFR 11.70）：

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

**預期：** 已簽記錄與其簽章不可分——改其一即破綁定。
**失敗時：** 若系統不能技術層強制綁定，實程序控制（雙保管、定期對帳）並記補償控制。

### 步驟四：配驗證控制

依 21 CFR 11.100 與 11.200 實身分驗證要求：

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

**預期：** 驗證強制僅所識個人可施其簽章。
**失敗時：** 若系統不支援會話感知之簽章控制，要求每簽章事件皆完整重驗（用戶名 + 密碼）。

### 步驟五：建電子簽章政策

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

**預期：** 政策文件於電子簽章上線前經品質、IT 與法務/監管事務核准。
**失敗時：** 若法律顧問未審政策，標此為合規風險並於電子簽章首用前取法律審核。

### 步驟六：驗實作

為所有簽章控制執行驗證測試：

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

**預期：** 所有測試案通過，示簽章控制合監管要求。
**失敗時：** 失敗測試案需於系統上線前整改。記失敗為偏差並經變更控制追蹤解決。

## 驗證

- [ ] 適用性評估記哪些 21 CFR 11 Subpart C 條款適用
- [ ] 簽章表現於每用例含名、日/時、意義
- [ ] 簽章綁定防簽章之移、複或轉
- [ ] 驗證於首簽時需二明身分元件
- [ ] 密碼政策合最低安全要求
- [ ] 電子簽章政策經品質、IT 與法務核准
- [ ] 所有簽者之用戶認證表已收
- [ ] FDA 認證已提交（若 11.300 下需）
- [ ] 所有簽章控制驗證測試通過

## 常見陷阱

- **混驗證於電子簽章**：登入為驗證；簽記錄為電子簽章。兩者有不同監管要求。
- **共用帳號**：任何有共用帳號之系統皆不能有合規電子簽章。實電子簽章前解決共用帳號。
- **缺意義**：顯名與日期而不顯意義（「核准」、「審閱」）之簽章不合 21 CFR 11.50。
- **會話處理**：允許連續會話簽章而無重驗證破壞簽章之身分保證。
- **忘 11.300 認證**：於 FDA 管制情境用電子簽章之組織須認證 FDA 其意電子簽章為法律約束。

## 相關技能

- `design-compliance-architecture` — 跨系統映射電子簽章要求
- `implement-audit-trail` — 稽核軌跡捕簽章事件
- `write-validation-documentation` — 驗證測試為 OQ 文件之一部
- `write-standard-operating-procedure` — 電子簽章用之 SOP
- `manage-change-control` — 簽章配置之變更經變更控制
