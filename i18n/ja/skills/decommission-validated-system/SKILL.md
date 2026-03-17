---
name: decommission-validated-system
description: >
  使用期間の終了したバリデートされたコンピューター化システムを廃止します。規制ごとのデータ
  保管評価、データ移行バリデーション（マッピング、変換、照合）、アーカイブ戦略、
  アクセス取り消し、文書アーカイブ、ステークホルダーへの通知を対象とします。バリデート済み
  システムが新しいシステムに置き換えられる場合、代替なしで使用期間の終了を迎える場合、
  ベンダーのサポートが終了した場合、複数のシステムが統合される場合、または規制変更に
  よってシステムが陳腐化した場合に使用します。
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
  complexity: intermediate
  language: multi
  tags: gxp, decommission, data-retention, migration, archival, compliance
---

# バリデートされたシステムの廃止

データ整合性を保護し、規制上の保管要件を満たしながら、バリデートされたコンピューター化システムの管理された退役を計画・実行します。

## 使用タイミング

- バリデート済みシステムが新しいシステムに置き換えられる場合
- 代替なしでシステムが使用期間の終了を迎える場合（ビジネスプロセスの廃止）
- ベンダーがバリデート済み製品のサポートを終了する場合
- 複数のシステムを単一プラットフォームに統合する場合
- 規制またはビジネスの変更によってシステムが陳腐化した場合

## 入力

- **必須**: 廃止するシステム（名称、バージョン、バリデーションステータス）
- **必須**: 規制ごとのデータ保管要件（21 CFR Part 11、GLP、GCP）
- **必須**: 代替システム（該当する場合）と移行スコープ
- **任意**: 現在のバリデーション文書パッケージ
- **任意**: データ量とフォーマットのインベントリ
- **任意**: ビジネスオーナーとステークホルダーのリスト

## 手順

### ステップ1: データ保管要件の評価

データをどのくらいの期間、どのような形式で保管しなければならないかを決定します:

```markdown
# Data Retention Assessment
## Document ID: DRA-[SYS]-[YYYY]-[NNN]

### Regulatory Retention Requirements
| Regulation | Data Type | Retention Period | Format Requirements |
|-----------|-----------|-----------------|-------------------|
| 21 CFR 211 (GMP) | Batch records, test results | 1 year past product expiry or 3 years after distribution | Readable, retrievable |
| 21 CFR 58 (GLP) | Study data and records | Duration of study + retention agreement | Original or certified copy |
| ICH E6 (GCP) | Clinical trial records | 2 years after last marketing approval or formal discontinuation | Accessible for inspection |
| 21 CFR Part 11 | Electronic records | Per predicate rule | Original format or validated migration |
| EU Annex 11 | Computerized system records | Per applicable GxP | Readable and available |
| Tax/financial | Financial records | 7-10 years (jurisdiction-dependent) | Readable |

### System Data Inventory
| Data Category | Volume | Format | Retention Required Until | Disposition |
|---------------|--------|--------|------------------------|-------------|
| [e.g., Batch records] | [e.g., 50,000 records] | [e.g., Database + PDF reports] | [Date] | Migrate / Archive / Destroy |
| [e.g., Audit trail] | [e.g., 2M entries] | [e.g., Database] | [Same as parent records] | Archive |
| [e.g., User data] | [e.g., 200 profiles] | [e.g., LDAP/Database] | [Employment + 2 years] | Anonymise and archive |
```

**期待結果：** すべてのデータカテゴリーに定義された保管期間、フォーマット要件、計画された処理があること。
**失敗時：** 保管要件が不明確な場合は、規制部門と法務に相談します。最長の適用保管期間をデフォルトとします。

### ステップ2: データ移行の計画（該当する場合）

データが代替システムに移行する場合:

```markdown
# Data Migration Plan
## Document ID: DMP-[SYS]-[YYYY]-[NNN]

### Migration Scope
| Source | Target | Data Category | Records | Migration Method |
|--------|--------|---------------|---------|-----------------|
| [Old system] | [New system] | [Category] | [Count] | ETL / Manual / API |

### Data Mapping
| Source Field | Source Format | Target Field | Target Format | Transformation |
|-------------|-------------|-------------|---------------|---------------|
| [e.g., test_result] | FLOAT(8,2) | [e.g., result_value] | DECIMAL(10,3) | Precision conversion |
| [e.g., operator_id] | VARCHAR(20) | [e.g., user_id] | UUID | Lookup table mapping |

### Validation Approach
| Check | Method | Acceptance Criteria |
|-------|--------|-------------------|
| Record count reconciliation | Source count vs target count | 100% match |
| Field-level comparison | Sample 5% of records, all fields | 100% match after transformation |
| Checksum verification | Hash source vs target for key fields | Checksums match |
| Business rule validation | Verify key calculations in target | Results match source |
| Audit trail continuity | Verify historical audit trail migrated | All entries present with original timestamps |
```

**期待結果：** 移行計画にマッピング、変換ルール、データ整合性が維持されたことを証明する検証チェックが含まれていること。
**失敗時：** 移行バリデーションが失敗した場合は、廃止を進めないでください。移行の問題を修正して再バリデーションします。

### ステップ3: アーカイブ戦略の定義

移行ではなくアーカイブされるデータの場合:

```markdown
# Archival Strategy

### Archive Format
| Consideration | Decision | Rationale |
|--------------|----------|-----------|
| Format | [PDF/A, CSV, XML, database backup] | [Why this format survives the retention period] |
| Medium | [Network storage, cloud archive, tape, optical] | [Durability and accessibility] |
| Encryption | [Yes/No — method if yes] | [Security vs long-term accessibility trade-off] |
| Integrity verification | [SHA-256 checksums, periodic verification schedule] | [Prove archive is uncorrupted] |

### Archive Verification
- [ ] Archived data is readable without the source system
- [ ] All required data categories are included in the archive
- [ ] Checksums recorded at time of archival
- [ ] Archive can be searched and retrieved within [defined SLA, e.g., 5 business days]
- [ ] Periodic integrity checks scheduled (annually)

### Archive Access
| Role | Access Level | Authorisation |
|------|-------------|--------------|
| QA Director | Read access to all archived data | Standing authorisation |
| Regulatory Affairs | Read access for inspection support | Standing authorisation |
| System Owner (former) | Read access for business queries | Request-based |
| External auditors | Read access, supervised | Per audit plan |
```

**期待結果：** アーカイブされたデータが元のシステムなしに読み取り可能で、検索可能で、検証可能であること。
**失敗時：** ソースシステムなしにデータを読み取れない場合、アーカイブは準拠していません。廃止前にオープンな標準フォーマット（PDF/A、CSV）にエクスポートすることを検討します。

### ステップ4: 廃止の実行

```markdown
# Decommission Checklist
## Document ID: DC-[SYS]-[YYYY]-[NNN]

### Pre-Decommission
- [ ] All stakeholders notified of decommission date and data disposition
- [ ] Data migration completed and validated (if applicable)
- [ ] Data archive created and verified (if applicable)
- [ ] Final backup of complete system taken and stored separately
- [ ] All open change requests resolved or transferred
- [ ] All open CAPAs resolved or transferred to successor system
- [ ] All active users informed and redirected to replacement system (if applicable)

### Decommission Execution
- [ ] User access revoked for all accounts
- [ ] System removed from production environment
- [ ] Network connections disconnected
- [ ] Licenses returned or terminated
- [ ] System entry removed from active system inventory
- [ ] System moved to "Decommissioned" status in compliance architecture

### Post-Decommission
- [ ] Validation documentation archived (URS, VP, IQ/OQ/PQ, TM, VSR)
- [ ] SOPs retired or updated to remove references to decommissioned system
- [ ] Training records archived
- [ ] Change control records archived
- [ ] Audit trail archived
- [ ] Decommission report completed and approved

### Decommission Report
| Section | Content |
|---------|---------|
| System description | Name, version, purpose, GxP classification |
| Decommission rationale | Why the system is being retired |
| Data disposition summary | What data went where (migrated, archived, destroyed) |
| Validation evidence | Migration validation results, archive verification |
| Residual risk | Any ongoing data retention obligations |
| Approval | System owner, QA, IT signatures |
```

**期待結果：** 廃止が管理され、文書化され、承認されていること — 単に「電源を切る」だけではないこと。
**失敗時：** チェックリストのいずれかの項目を完了できない場合は、例外を文書化して進める前にQAの承認を取得します。

## バリデーション

- [ ] すべてのデータカテゴリーのデータ保管要件が評価されている
- [ ] データ移行がレコード数、サンプリング、チェックサムで検証されている（該当する場合）
- [ ] アーカイブがソースシステムなしに読み取り可能なフォーマットで作成されている
- [ ] アーカイブの整合性がチェックサムで検証されている
- [ ] すべてのユーザーアクセスが取り消されている
- [ ] バリデーション文書が定義された保管期間でアーカイブされている
- [ ] SOPが廃止されたシステムへの参照を削除するために更新されている
- [ ] 廃止報告書がシステムオーナー、QA、ITに承認されている

## よくある落とし穴

- **早まった廃止**: データ移行がバリデートされる前にシステムをオフにすると永久的なデータ損失のリスクがある。電源を切る前にすべてのバリデーションを完了すること
- **読み取れないアーカイブ**: 元のシステムが必要な独自フォーマットでデータを保存することはアーカイブの目的を果たさない。オープンフォーマットを使用すること
- **監査証跡の忘れ**: データをアーカイブするが監査証跡をアーカイブしないと、データの来歴を実証できなくなる。常に監査証跡を親レコードとともにアーカイブすること
- **放置されたSOP**: 廃止されたシステムを参照するSOPはユーザーを混乱させ、コンプライアンスギャップを生じさせる。影響を受けるすべてのSOPを更新または退役させること
- **定期的なアーカイブ検証なし**: アーカイブは劣化する。定期的な整合性チェックなしに、データが必要になるまでデータ損失が検出されない可能性がある

## 関連スキル

- `design-compliance-architecture` — 廃止後にシステムインベントリとコンプライアンスアーキテクチャを更新する
- `manage-change-control` — 廃止は変更管理を必要とする重大な変更
- `write-validation-documentation` — 移行バリデーションは同じIQ/OQ方法論に従う
- `write-standard-operating-procedure` — 廃止されたシステムを参照するSOPを退役または更新する
- `prepare-inspection-readiness` — アーカイブされたデータは規制査察のためにアクセス可能でなければならない
