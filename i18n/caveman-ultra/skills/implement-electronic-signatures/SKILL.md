---
name: implement-electronic-signatures
locale: caveman-ultra
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

# Implement Electronic Signatures

E-sig controls per 21 CFR Part 11 Subpart C + EU Annex 11 for regulated records.

## Use When

- System needs legally binding e-sigs for GxP records
- Replace wet-ink w/ e-sig equivalents
- Approval workflows (batch release, doc approval, data sign-off)
- Gap assessment reveals missing controls
- System must comply 21 CFR 11.50-11.300

## In

- **Required**: system desc + use cases (what records signed)
- **Required**: applicable regs (21 CFR Part 11, EU Annex 11)
- **Required**: signature types (approval, review, ack, authorship)
- **Optional**: existing auth infra (AD, LDAP, SSO)
- **Optional**: existing e-sig policy / SOPs
- **Optional**: vendor docs on sig capabilities

## Do

### Step 1: Applicability assessment

Which 21 CFR 11 Subpart C applies:

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

→ Every use case → regulatory basis + defined meaning.

**If err:** non-GxP → doc exclusion rationale + proportionate controls.

### Step 2: Sig manifestation

21 CFR 11.50:

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

→ Manifestation unambiguous: who, when, why.

**If err:** system can't display all 3 → sig detail page accessible from record.

### Step 3: Sig-to-record binding

21 CFR 11.70 — no remove/copy/transfer:

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

→ Signed record + sig inseparable. Modifying either invalidates.

**If err:** no tech-level enforcement → procedural controls (dual custody, periodic reconciliation) + doc compensating control.

### Step 4: Auth controls

21 CFR 11.100 + 11.200:

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

→ Auth enforces only ID'd individual applies their sig.

**If err:** no session-aware sig controls → full re-auth (username + password) every sig event.

### Step 5: E-sig policy

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

→ Policy approved by quality + IT + legal/reg affairs before go-live.

**If err:** no legal counsel review → flag compliance risk. Obtain legal review before first use.

### Step 6: Verify impl

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

→ All pass → controls meet regs.

**If err:** failed tests → remediate before go-live. Doc as deviations + track via change control.

## Check

- [ ] Applicability → which 21 CFR 11 Subpart C provisions apply
- [ ] Manifestation: name + date/time + meaning per use case
- [ ] Binding prevents remove/copy/transfer
- [ ] Auth: 2 distinct ID components at first signing
- [ ] Password policy meets min security
- [ ] Policy approved by quality + IT + legal
- [ ] User cert forms collected
- [ ] FDA cert submitted (if 11.300)
- [ ] Verification tests pass

## Traps

- **Auth vs e-sig confusion**: login = auth; signing record = e-sig. Diff regulatory reqs.
- **Shared accounts**: no compliant e-sigs possible. Resolve first.
- **Missing meaning**: name + date only (no "Approved"/"Reviewed") → fails 11.50.
- **Session handling**: continuous signing w/o re-auth → undermines identity assurance.
- **Forget 11.300 cert**: FDA-regulated orgs must certify.

## →

- `design-compliance-architecture` — maps e-sig reqs across systems
- `implement-audit-trail` — audit captures sig events
- `write-validation-documentation` — verification tests = OQ
- `write-standard-operating-procedure` — SOP for e-sig use
- `manage-change-control` — sig config changes via change control
