---
name: implement-electronic-signatures
description: >
  21 CFR Part 11 サブパートCおよびEU Annex 11に準拠した電子署名を実装します。
  署名の表示（署名者、日時、意味）、署名とレコードのバインディング、バイオメトリクス対
  非バイオメトリクス管理、ポリシー作成、ユーザー認証要件を対象とします。コンピューター化
  システムがGxP記録に法的拘束力のある電子署名を必要とする場合、規制されたワークフローで
  手書き署名を電子署名に置き換える場合、バッチリリースや文書承認ワークフローの実装時、
  または規制ギャップで署名管理の欠如が明らかになった場合に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 電子署名の実装

規制された電子記録に対する21 CFR Part 11 サブパートCおよびEU Annex 11要件を満たす電子署名管理を設計・実装します。

## 使用タイミング

- コンピューター化システムがGxP記録に法的拘束力のある電子署名を必要とする場合
- 規制されたワークフローで手書き署名を電子署名に置き換える場合
- バッチリリース、文書承認、またはデータサインオフの承認ワークフローを実装する場合
- 規制ギャップ評価で署名管理の欠如が明らかになった場合
- 21 CFR 11.50～11.300に準拠する必要があるシステムを構築または設定する場合

## 入力

- **必須**: システムの説明と署名ユースケース（署名される記録）
- **必須**: 適用規制（21 CFR Part 11、EU Annex 11、特定のGxPコンテキスト）
- **必須**: 必要な署名タイプ（承認、レビュー、確認、著作権）
- **任意**: 現在の認証インフラ（Active Directory、LDAP、SSO）
- **任意**: 既存の電子署名ポリシーまたはSOP
- **任意**: 署名機能に関するシステムベンダー文書

## 手順

### ステップ1: 電子署名要件の適用可能性評価

適用される21 CFR Part 11 サブパートC条項を決定します:

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

**期待結果：** すべての署名ユースケースに規制上の根拠と定義された意味があること。
**失敗時：** ユースケースが21 CFR 11コンプライアンスを必要としない場合（例：非GxP記録）は、除外の根拠を文書化し、適切な管理を適用します。

### ステップ2: 署名の表示設計

21 CFR 11.50に従って署名が表示しなければならない情報を定義します:

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

**期待結果：** 署名の表示が明確で曖昧さがなく、署名された記録を見た誰でも、誰が署名したか、いつ署名したか、なぜ署名したかを識別できること。
**失敗時：** システムがレコードビューでの3つの要素をすべて表示できない場合は、署名された記録からアクセス可能な署名詳細ページを実装します。

### ステップ3: 署名とレコードのバインディングの実装

署名が記録間で削除、コピー、または転送できないことを確保します（21 CFR 11.70）:

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

**期待結果：** 署名されたレコードとその署名が分離不可能であること — どちらかを変更するとバインディングが無効になること。
**失敗時：** システムが技術レベルでバインディングを実施できない場合は、手続き的管理（二重管理、定期的な照合）を実装し、補完管理を文書化します。

### ステップ4: 認証管理の設定

21 CFR 11.100および11.200に従ったID検証要件を実装します:

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

**期待結果：** 認証が、識別された個人のみが自分の署名を適用できることを確保していること。
**失敗時：** システムがセッションを考慮した署名管理をサポートしない場合は、すべての署名イベントで完全な再認証（ユーザー名 + パスワード）を要求します。

### ステップ5: 電子署名ポリシーの作成

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

**期待結果：** ポリシー文書が電子署名のライブ前に品質、IT、法務/規制部門によって承認されていること。
**失敗時：** 法律顧問がポリシーをレビューしていない場合は、これをコンプライアンスリスクとしてフラグし、電子署名の初回使用前に法務レビューを取得します。

### ステップ6: 実装の検証

すべての署名管理の検証テストを実行します:

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

**期待結果：** すべてのテストケースがパスし、署名管理が規制要件を満たしていることが実証されること。
**失敗時：** 失敗したテストケースはシステムのライブ前に修正が必要です。失敗を逸脱として文書化し、変更管理を通じて解決を追跡します。

## バリデーション

- [ ] 適用可能性評価でどの21 CFR 11 サブパートC条項が適用されるかが文書化されている
- [ ] すべてのユースケースで署名の表示に名前、日時、意味が含まれている
- [ ] 署名バインディングが署名の削除、コピー、転送を防止する
- [ ] 認証が最初の署名時に2つの異なる識別要素を要求する
- [ ] パスワードポリシーが最低限のセキュリティ要件を満たしている
- [ ] 電子署名ポリシーが品質、IT、法務によって承認されている
- [ ] すべての署名者のユーザー認証フォームが収集されている
- [ ] FDA認証が提出されている（11.300の要件がある場合）
- [ ] すべての署名管理の検証テストがパスしている

## よくある落とし穴

- **認証と電子署名の混同**: ログインは認証であり、記録に署名することは電子署名です。それぞれ異なる規制要件があります
- **共有アカウント**: 共有アカウントを持つシステムは準拠した電子署名を持てない。e署名を実装する前に共有アカウントを解決すること
- **意味の欠如**: 名前と日付を示すが意味（「承認」、「レビュー済み」）を示さない署名は21 CFR 11.50を満たさない
- **セッション処理**: 再認証なしに連続セッション署名を許可すると、署名のID保証が損なわれる
- **11.300認証の忘れ**: FDA規制環境で電子署名を使用する組織はFDAにe署名を法的拘束力があるとして認証しなければならない

## 関連スキル

- `design-compliance-architecture` — システム間でe署名要件をマッピングする
- `implement-audit-trail` — 監査証跡が署名イベントをキャプチャする
- `write-validation-documentation` — 検証テストはOQ文書の一部
- `write-standard-operating-procedure` — 電子署名使用のSOP
- `manage-change-control` — 署名設定の変更は変更管理を経由する
