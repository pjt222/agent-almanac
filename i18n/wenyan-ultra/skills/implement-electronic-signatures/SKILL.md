---
name: implement-electronic-signatures
locale: wenyan-ultra
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

# 實電子簽名

設並實電子簽名控以合 21 CFR Part 11 C 部與 EU Annex 11 對受規電子記錄之要。

## 用

- 電腦系統需供 GxP 記錄之法定束電子簽
- 於受規工作流以電子簽替濕墨簽
- 實批放、文批、數據簽收工作流
- 法規差評揭缺簽控
- 建或配須合 21 CFR 11.50–11.300 之系統

## 入

- **必**：系統描與簽用例（所簽記錄）
- **必**：適法規（21 CFR Part 11、EU Annex 11、特 GxP 脈絡）
- **必**：所需簽型（批、審、認、著）
- **可**：現認證基建（Active Directory、LDAP、SSO）
- **可**：既電子簽策或 SOP
- **可**：系統供應商之簽能文

## 行

### 一：評電子簽要之適用性

定哪 21 CFR Part 11 C 部諸款適：

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

得：各簽用例皆有書法規基與明義。
敗：某用例不需 21 CFR 11 合規（如非 GxP 記錄）→書排除由並施比例控。

### 二：設簽呈現

依 21 CFR 11.50 定簽必顯之訊：

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

得：簽呈現無歧——任者觀已簽記錄可辨誰、何時、為何而簽。
敗：系統不能於記錄視下顯三元素→施可由記錄視訪之簽詳頁。

### 三：實簽-記綁

確簽不可除、複或轉於記錄間（21 CFR 11.70）：

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

得：已簽記錄與其簽不可分——改任一即廢綁。
敗：系統不能於技層強綁→實程控（雙保、定期對帳）並書補償控。

### 四：配認證控

依 21 CFR 11.100 與 11.200 實身驗要：

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

得：認證強唯所辨人方可施其簽。
敗：系統不支會話感知簽控→每簽必全重認（用戶名+密）。

### 五：造電子簽策

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

得：策文於電子簽上線前經質、IT、法/規之批。
敗：法律顧未審策→標為合規險並於首用前求法律審。

### 六：驗施

行諸簽控之驗試：

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

得：諸試皆通，示簽控合法規要。
敗：試敗需修然後系統上線。書敗為偏並經變控追解。

## 驗

- [ ] 適用性評書哪 21 CFR 11 C 部款適用
- [ ] 諸用例之簽呈現含名、日時、義
- [ ] 簽綁防除、複、轉
- [ ] 首簽需二異身元
- [ ] 密策符最低安全要
- [ ] 電子簽策經質、IT、法批
- [ ] 諸簽者之用者證書已收
- [ ] FDA 證已提（若 11.300 需）
- [ ] 諸簽控之驗試通

## 忌

- **混認證與電子簽**：登乃認證；簽記錄乃電子簽。規要異
- **共帳戶**：任系統有共帳戶→不能有合規電子簽。先解共帳戶
- **缺義**：示名日而無義（「批」、「審」）之簽→不合 21 CFR 11.50
- **會話處**：續會話簽無重認→削身分保證
- **忘 11.300 證**：用電子簽於 FDA 規境者須向 FDA 證意為法束

## 參

- `design-compliance-architecture`
- `implement-audit-trail`
- `write-validation-documentation`
- `write-standard-operating-procedure`
- `manage-change-control`
