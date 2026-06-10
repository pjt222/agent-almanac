---
name: implement-electronic-signatures
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

Design and implement electronic signature controls that meet 21 CFR Part 11 Subpart C and EU Annex 11 requirements for regulated electronic records.

## When to Use

- A computerized system requires legally binding electronic signatures for GxP records
- Replacing wet-ink signatures with electronic equivalents in a regulated workflow
- Implementing approval workflows for batch release, document approval, or data sign-off
- Regulatory gap assessment reveals missing signature controls
- Building or configuring a system that must comply with 21 CFR 11.50–11.300

## Inputs

- **Required**: System description and signature use cases (what records are being signed)
- **Required**: Applicable regulations (21 CFR Part 11, EU Annex 11, specific GxP context)
- **Required**: Signature types needed (approval, review, acknowledgement, authorship)
- **Optional**: Current authentication infrastructure (Active Directory, LDAP, SSO)
- **Optional**: Existing electronic signature policy or SOPs
- **Optional**: System vendor documentation on signature capabilities

## Procedure

### Step 1: Assess Applicability of Electronic Signature Requirements

Determine which 21 CFR Part 11 Subpart C provisions apply:

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

**Expected:** Every signature use case has a documented regulatory basis and defined meaning.
**On failure:** If a use case does not require 21 CFR 11 compliance (e.g., non-GxP records), document the exclusion rationale and apply proportionate controls.

### Step 2: Design Signature Manifestation

Define what information the signature must display per 21 CFR 11.50:

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

**Expected:** Signature manifestation is unambiguous — anyone viewing the signed record can identify who signed, when, and why.
**On failure:** If the system cannot display all three elements in the record view, implement a signature detail page accessible from the signed record.

### Step 3: Implement Signature-to-Record Binding

Ensure signatures cannot be removed, copied, or transferred between records (21 CFR 11.70):

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

**Expected:** A signed record and its signature are inseparable — modifying either invalidates the binding.
**On failure:** If the system cannot enforce binding at the technical level, implement procedural controls (dual custody, periodic reconciliation) and document the compensating control.

### Step 4: Configure Authentication Controls

Implement the identity verification requirements per 21 CFR 11.100 and 11.200:

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

**Expected:** Authentication enforces that only the identified individual can apply their signature.
**On failure:** If the system does not support session-aware signature controls, require full re-authentication (username + password) for every signature event.

### Step 5: Create Electronic Signature Policy

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

**Expected:** Policy document is approved by quality, IT, and legal/regulatory affairs before electronic signatures go live.
**On failure:** If legal counsel has not reviewed the policy, flag this as a compliance risk and obtain legal review before first use of electronic signatures.

### Step 6: Verify Implementation

Execute verification tests for all signature controls:

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

**Expected:** All test cases pass, demonstrating that signature controls meet regulatory requirements.
**On failure:** Failed test cases require remediation before the system goes live. Document failures as deviations and track resolution through change control.

## Validation

- [ ] Applicability assessment documents which 21 CFR 11 Subpart C provisions apply
- [ ] Signature manifestation includes name, date/time, and meaning for every use case
- [ ] Signature binding prevents removal, copying, or transfer of signatures
- [ ] Authentication requires two distinct identification components at first signing
- [ ] Password policy meets minimum security requirements
- [ ] Electronic signature policy approved by quality, IT, and legal
- [ ] User certification forms collected for all signers
- [ ] FDA certification submitted (if required under 11.300)
- [ ] Verification tests pass for all signature controls

## Common Pitfalls

- **Confusing authentication with electronic signature**: Logging in is authentication; signing a record is an electronic signature. They have different regulatory requirements.
- **Shared accounts**: Any system with shared accounts cannot have compliant electronic signatures. Resolve shared accounts before implementing e-signatures.
- **Missing meaning**: Signatures that show name and date but not the meaning ("Approved," "Reviewed") do not meet 21 CFR 11.50.
- **Session handling**: Allowing continuous session signing without re-authentication undermines the identity assurance of the signature.
- **Forgetting 11.300 certification**: Organisations using electronic signatures in FDA-regulated contexts must certify to the FDA that they intend e-signatures to be legally binding.

## Related Skills

- `design-compliance-architecture` — maps e-signature requirements across systems
- `implement-audit-trail` — audit trail captures signature events
- `write-validation-documentation` — verification tests are part of OQ documentation
- `write-standard-operating-procedure` — SOP for electronic signature use
- `manage-change-control` — changes to signature configuration go through change control
