---
name: qualify-vendor
description: >
  GxP関連ソフトウェアまたはサービスのベンダーまたはサプライヤーを認定します。
  ベンダーリスク分類、評価アンケートの設計、デスクおよびオンサイト監査アプローチ、
  品質合意評価、SLAレビュー、継続的モニタリングの頻度定義を対象とします。GxP重要
  システムの新しいベンダー選定時、規制対象データのクラウドプロバイダーのオンボーディング時、
  定期的な再認定の実施時、ベンダー監査所見による再評価時、またはEU Annex 11や
  ICH Q10によるサプライヤー認定が必要な場合に使用します。
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
  tags: gxp, vendor, qualification, supplier, quality-agreement, compliance
---

# ベンダーの認定

GxP関連ソフトウェア、インフラストラクチャ、またはサービスを提供するベンダーが規制品質基準を満たすことを確保するために評価・認定します。

## 使用タイミング

- GxP重要コンピューター化システムの新しいベンダーを選定する場合
- 規制対象データのクラウドサービスプロバイダーをオンボーディングする場合
- 既存ベンダーの定期的な再認定が予定されている場合
- ベンダー監査所見により再評価が必要な場合
- サプライヤー認定の規制要件がある場合（EU Annex 11 §3.4、ICH Q10）

## 入力

- **必須**: ベンダー名、製品/サービス、意図するGxP用途
- **必須**: ベンダーリスク分類基準
- **必須**: 適用規制要件
- **任意**: ベンダー提供の品質文書（ISO認証、SOCレポート）
- **任意**: 以前のベンダー監査報告書または認定記録
- **任意**: 参照顧客の経験

## 手順

### ステップ1: ベンダーリスクの分類

GxPへの影響に基づいてベンダーのリスクレベルを決定します:

```markdown
# Vendor Risk Classification
## Document ID: VRC-[VENDOR]-[YYYY]-[NNN]

### Risk Classification Criteria
| Factor | Weight | Critical | Major | Minor |
|--------|--------|----------|-------|-------|
| GxP impact | 40% | Directly processes GxP data or affects product quality | Supports GxP processes indirectly | No GxP impact |
| Data access | 20% | Accesses or stores GxP-regulated data | Accesses supporting data only | No data access |
| Substitutability | 15% | Sole source, no alternative | Limited alternatives | Multiple alternatives |
| Regulatory exposure | 15% | Subject to regulatory inspection | May be referenced in submissions | No regulatory exposure |
| Business criticality | 10% | System downtime stops operations | Downtime causes delays | Minimal operational impact |

### Vendor Classification
| Vendor | Product/Service | Risk Score | Classification | Qualification Approach |
|--------|----------------|------------|---------------|----------------------|
| [Vendor name] | [Product] | [Score] | Critical / Major / Minor | On-site audit / Desk audit / Questionnaire only |

### Qualification Approach by Risk
| Risk Level | Qualification Activities | Re-qualification Frequency |
|------------|------------------------|---------------------------|
| **Critical** | Questionnaire + desk audit + on-site audit | Annual |
| **Major** | Questionnaire + desk audit | Every 2 years |
| **Minor** | Questionnaire only | Every 3 years |
```

**期待結果：** ベンダーリスク分類が比例した認定作業を促進すること。
**失敗時：** リスク分類が争われる場合は、より高いレベルをデフォルトとします。重要なベンダーを過小評価することは規制上のリスクです。

### ステップ2: 評価アンケートの設計と送付

```markdown
# Vendor Assessment Questionnaire
## Document ID: VAQ-[VENDOR]-[YYYY]-[NNN]

### Section 1: Company Information
1. Legal name, address, and parent company (if applicable)
2. Number of employees (total and in quality/development)
3. Products and services relevant to this qualification
4. Key customers in the pharmaceutical/life sciences industry

### Section 2: Quality Management System
5. Do you maintain a certified QMS? (ISO 9001, ISO 13485, ISO 27001 — provide certificates)
6. Describe your document control system
7. Describe your change management process
8. Describe your CAPA process
9. How do you handle customer complaints?
10. When was your last external audit? Provide the summary report.

### Section 3: Software Development (if applicable)
11. Describe your software development lifecycle (SDLC)
12. Do you follow GAMP 5, IEC 62304, or other development standards?
13. Describe your testing methodology (unit, integration, system, regression)
14. How do you manage source code (version control, branching, code review)?
15. Describe your release management process
16. How do you handle bug reports and patches?

### Section 4: Data Integrity and Security
17. How do you ensure data integrity (ALCOA+ principles)?
18. Describe your audit trail capabilities
19. Describe your access control model (role-based, attribute-based)
20. Describe your data backup and recovery procedures
21. Have you had any data breaches in the last 3 years? If yes, describe.
22. Provide your most recent SOC 2 Type II report (if available)

### Section 5: Regulatory Compliance
23. Are your products used in FDA-regulated or EU-regulated environments?
24. Can you provide a 21 CFR Part 11 compliance statement?
25. Can you provide an EU Annex 11 compliance statement?
26. Do you provide validation support documentation (IQ/OQ/PQ packs)?
27. How do you notify customers of changes that may affect their validated state?

### Section 6: Support and Service Level
28. Describe your support tiers and response times
29. What is your system availability target (uptime SLA)?
30. Describe your disaster recovery and business continuity plan
31. What is your customer notification process for planned and unplanned downtime?
32. What is your end-of-life/end-of-support policy?
```

**期待結果：** アンケートが回答期限（重要ベンダーでは通常4〜6週間）とともにベンダーに送付されていること。
**失敗時：** ベンダーがアンケートを完了できないまたは完了しない場合、これ自体がリスク指標です。拒否を文書化し、調達とQAにエスカレートします。

### ステップ3: ベンダー回答の評価

アンケートの回答をレビューおよびスコアリングします:

```markdown
# Vendor Evaluation
## Document ID: VE-[VENDOR]-[YYYY]-[NNN]

### Response Evaluation Matrix
| Section | Score (1-5) | Key Findings | Acceptable? |
|---------|-------------|-------------|-------------|
| Quality Management System | [Score] | [Summary of findings] | [Yes/No/Conditional] |
| Software Development | [Score] | [Summary] | [Yes/No/Conditional] |
| Data Integrity and Security | [Score] | [Summary] | [Yes/No/Conditional] |
| Regulatory Compliance | [Score] | [Summary] | [Yes/No/Conditional] |
| Support and Service Level | [Score] | [Summary] | [Yes/No/Conditional] |

Score: 1 = Unacceptable, 2 = Significant gaps, 3 = Adequate with conditions, 4 = Good, 5 = Excellent

### Red Flags (automatic escalation)
- [ ] No QMS or expired certification
- [ ] No change notification process to customers
- [ ] No audit trail capability
- [ ] Data breach with no corrective action
- [ ] Cannot provide 21 CFR 11 or EU Annex 11 compliance statement
- [ ] No validation support documentation
```

**期待結果：** 各セクションが明確な所見と全体的な受け入れ可否の判断とともに評価されていること。
**失敗時：** 回答が不完全または回避的な場合は、明確化を要求します。持続的な無回答は認定失敗基準です。

### ステップ4: 監査の実施（必要な場合）

重要および主要ベンダーについては、デスクまたはオンサイト監査を実施します:

```markdown
# Vendor Audit Plan
## Document ID: VAP-[VENDOR]-[YYYY]-[NNN]

### Desk Audit (Remote)
| Document Requested | Received? | Assessment |
|-------------------|-----------|------------|
| QMS manual or overview | [Y/N] | [Finding] |
| SDLC documentation | [Y/N] | [Finding] |
| Most recent internal audit report | [Y/N] | [Finding] |
| SOC 2 Type II report | [Y/N] | [Finding] |
| 21 CFR 11 / EU Annex 11 compliance statement | [Y/N] | [Finding] |
| Sample release notes (last 3 releases) | [Y/N] | [Finding] |
| Customer notification examples | [Y/N] | [Finding] |

### On-Site Audit (if critical vendor)
| Area | Activities | Duration |
|------|-----------|----------|
| Quality system | Review QMS documentation, CAPA records, complaint handling | 2 hours |
| Development | Walk through SDLC, code review process, testing evidence | 2 hours |
| Operations | Observe data centre (if applicable), review security controls | 1 hour |
| Support | Review support ticket resolution, SLA compliance metrics | 1 hour |

### Audit Findings
| Finding ID | Area | Observation | Severity | Vendor Response Required? |
|-----------|------|-------------|----------|--------------------------|
| VF-001 | [Area] | [Observation] | [Major/Minor/Obs] | [Yes/No] |
```

**期待結果：** 監査所見が重大度分類とともに客観的に文書化されていること。
**失敗時：** オンサイト監査を手配できない場合は、ビデオ会議インタビューを補完した徹底的なデスク監査を実施します。

### ステップ5: 品質合意とSLAの評価

```markdown
# Quality Agreement Evaluation
## Document ID: QAE-[VENDOR]-[YYYY]-[NNN]

### Quality Agreement Checklist
| Clause | Present? | Adequate? | Comments |
|--------|----------|-----------|----------|
| Roles and responsibilities (vendor vs customer) | [Y/N] | [Y/N] | |
| Change notification (advance notice of changes) | [Y/N] | [Y/N] | [Minimum notice period?] |
| Audit rights (right to audit vendor) | [Y/N] | [Y/N] | [Frequency, scope?] |
| Data ownership and portability | [Y/N] | [Y/N] | [Data return on termination?] |
| Security and confidentiality obligations | [Y/N] | [Y/N] | |
| Regulatory inspection cooperation | [Y/N] | [Y/N] | [Vendor supports regulatory inspections?] |
| CAPA process for quality issues | [Y/N] | [Y/N] | |
| Validation support obligations | [Y/N] | [Y/N] | [IQ/OQ/PQ support?] |
| Subcontractor management | [Y/N] | [Y/N] | [Vendor's subcontractor quality?] |
| Termination and transition support | [Y/N] | [Y/N] | [Data migration support?] |

### SLA Evaluation
| Metric | Vendor Commitment | Industry Benchmark | Acceptable? |
|--------|------------------|-------------------|-------------|
| Availability (uptime) | [e.g., 99.9%] | 99.5% - 99.99% | [Y/N] |
| Response time (critical issues) | [e.g., 1 hour] | 1-4 hours | [Y/N] |
| Resolution time (critical issues) | [e.g., 4 hours] | 4-24 hours | [Y/N] |
| Planned maintenance notification | [e.g., 5 days] | 5-14 days | [Y/N] |
| Data backup frequency | [e.g., Daily] | Daily minimum | [Y/N] |
| Disaster recovery RTO | [e.g., 4 hours] | 4-24 hours | [Y/N] |
```

**期待結果：** 品質合意とSLA条件が契約署名前に適切性についてレビューされていること。
**失敗時：** 重要な品質合意条項が欠如している場合は、その組み込みを交渉します。適切な監査権と変更通知なしにベンダーを認定しないでください。

### ステップ6: 認定決定の発行

```markdown
# Vendor Qualification Report
## Document ID: VENDOR-QUALIFICATION-[VENDOR]

### Qualification Summary
| Criterion | Result |
|-----------|--------|
| Vendor risk classification | [Critical / Major / Minor] |
| Questionnaire assessment | [Score/5] |
| Audit results (if applicable) | [Satisfactory / Satisfactory with conditions / Unsatisfactory] |
| Quality agreement | [Adequate / Needs revision] |
| SLA | [Adequate / Needs revision] |

### Qualification Decision
| Decision | Meaning |
|----------|---------|
| **Qualified** | Vendor meets all requirements; proceed with procurement |
| **Conditionally qualified** | Vendor meets most requirements; specific conditions must be met within defined timeline |
| **Not qualified** | Vendor does not meet requirements; do not proceed |

**Decision:** [Qualified / Conditionally Qualified / Not Qualified]
**Conditions (if applicable):** [List specific conditions with deadlines]

### Ongoing Monitoring
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Performance metrics review | Quarterly | System owner |
| Quality agreement compliance | Annual | QA |
| Re-qualification audit/assessment | [Per risk level] | QA |
| Regulatory update review | As needed | Regulatory affairs |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Assurance | | | |
| System Owner | | | |
| Procurement | | | |
```

**期待結果：** 文書化された根拠と継続的モニタリング計画を含む明確な認定決定があること。
**失敗時：** 決定が「非認定」の場合は、特定の欠陥を文書化し、調達に通知します。代替ベンダーを特定します。

## バリデーション

- [ ] ベンダーリスクが根拠を文書化して分類されている
- [ ] 評価アンケートがQMS、開発、セキュリティ、コンプライアンス、サポートを網羅している
- [ ] スコアリングされた所見とともにベンダー回答が評価されている
- [ ] 重要および主要ベンダーの監査が実施されている
- [ ] 品質合意がすべての必須条項についてレビューされている
- [ ] SLAが規制およびビジネス要件に対して評価されている
- [ ] 認定決定が承認署名とともに文書化されている
- [ ] 継続的モニタリング計画が頻度と責任とともに定義されている

## よくある落とし穴

- **認定前の調達**: 認定完了前に契約を締結すると品質合意交渉のレバレッジが失われ、コンプライアンスギャップが生じる
- **検証なしのアンケート**: ベンダーの自己評価を額面通りに受け入れることは不十分。監査、参照確認、または文書レビューを通じて主要な主張を検証すること
- **変更通知条項なし**: 変更通知の契約がなければ、ベンダーはあなたのバリデート済み状態に影響する方法で製品またはサービスを変更できる
- **一回限りの認定**: ベンダー認定は継続的なプロセス。定期的なモニタリング、再認定、パフォーマンスレビューは継続的なコンプライアンスに不可欠
- **サブコントラクターの無視**: ベンダーが重要なサービス（例：ホスティング、開発）をサブコントラクトする場合、サブコントラクターの品質も評価しなければならない

## 関連スキル

- `design-compliance-architecture` — 認定が必要なベンダーを特定する
- `conduct-gxp-audit` — ベンダー監査は内部監査と同じ手法に従う
- `prepare-inspection-readiness` — ベンダー認定は査察中に頻繁に要求される
- `manage-change-control` — ベンダー主導の変更は変更管理評価を必要とする
- `perform-csv-assessment` — ベンダー認定はベンダー製品のバリデーションアプローチに影響する
