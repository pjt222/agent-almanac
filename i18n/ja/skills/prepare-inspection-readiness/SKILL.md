---
name: prepare-inspection-readiness
description: >
  規制当局査察（FDA、EMA、MHRA）に向けた組織的な準備を行います。機関固有の
  フォーカスエリアに対する準備状況の評価、警告書および483テーマ分析、モック査察
  プロトコル、文書バンドルの準備、査察ロジスティクス、対応テンプレートの作成を
  対象とします。規制査察が通知または予測される場合、定期的な自己評価が予定されている
  場合、前回査察以降に新しいシステムが実装された場合、または規制当局の注意を引く
  可能性のある重大な監査所見の後に使用します。
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
  tags: gxp, inspection, fda, ema, mhra, readiness, compliance, 483
---

# 査察準備の整備

文書、人員準備、ロジスティクス、対応計画を含む規制当局査察に向けた組織的な準備状況を評価・改善します。

## 使用タイミング

- 規制査察が通知または予測される場合
- 査察準備の定期的な自己評価が予定されている場合
- 前回査察以降に新しいシステムまたはプロセスが実装された場合
- 業界トレンド（警告書、483）が新たなフォーカスエリアを示している場合
- 規制当局の注意を引く可能性のある重大な監査所見の後

## 入力

- **必須**: 査察当局（FDA、EMA、MHRA、またはその他）
- **必須**: 予想される査察スコープ（データ整合性、CSV、GMP、GLP、GCP）
- **必須**: コンプライアンスアーキテクチャとシステムインベントリ
- **任意**: 以前の査察報告書と観察事項
- **任意**: 最近の業界警告書と483テーマ
- **任意**: オープンなCAPAと監査所見

## 手順

### ステップ1: 機関固有のフォーカスエリアの分析

査察当局の現在の優先事項を調査します:

```markdown
# Inspection Focus Area Analysis
## Document ID: IFA-[SITE]-[YYYY]-[NNN]

### FDA Current Focus Areas
| Focus Area | Regulatory Basis | Recent 483 Trends | Risk to This Site |
|-----------|-----------------|-------------------|-------------------|
| Data integrity | 21 CFR Part 11, CGMP | #1 cited observation in drug 483s since 2016 | [H/M/L] |
| Audit trail | 21 CFR 11.10(e) | Disabled/incomplete audit trails | [H/M/L] |
| Electronic signatures | 21 CFR 11.50-11.300 | Missing manifestation, shared accounts | [H/M/L] |
| Computer system validation | GAMP 5, FDA guidance | Inadequate validation of Category 4/5 systems | [H/M/L] |
| Change control | ICH Q10 | Undocumented or retrospective changes | [H/M/L] |
| Laboratory controls | 21 CFR 211.160-211.176 | OOS investigation, test repetition | [H/M/L] |

### EMA/MHRA-Specific Considerations
| Area | EU Annex 11 Reference | Focus | Risk to This Site |
|------|----------------------|-------|-------------------|
| Computerized system validation | §4, §5 | Risk-based validation, supplier assessment | [H/M/L] |
| Operational phase | §6-§13 | Security, audit trail, backup, business continuity | [H/M/L] |
| Cloud and outsourced systems | §3.4 | Service level agreements, data sovereignty | [H/M/L] |
| Data governance | MHRA DI guidance | ALCOA+, culture of integrity | [H/M/L] |
```

**期待結果：** 査察当局固有のフォーカスエリアのリスク評価済み分析があること。
**失敗時：** 最近の483/警告書データが入手できない場合は、FDA警告書データベース、EMA査察報告書、または業界誌で最新のトレンドを確認します。

### ステップ2: 準備状況の自己評価の実施

各フォーカスエリアに対してサイトを評価します:

```markdown
# Inspection Readiness Assessment
## Document ID: IRA-[SITE]-[YYYY]-[NNN]

### Readiness Scoring
| Focus Area | Weight | Current State | Score (1-5) | Gap | Remediation Priority |
|-----------|--------|--------------|-------------|-----|---------------------|
| Data integrity controls | High | [Description of current state] | [1-5] | [Gap description] | [Critical/High/Medium/Low] |
| Validation documentation | High | [Description] | [1-5] | [Gap] | [Priority] |
| Audit trail compliance | High | [Description] | [1-5] | [Gap] | [Priority] |
| Electronic signatures | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Change control | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Training records | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| SOPs (current, approved) | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| CAPA management | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Vendor qualification | Low | [Description] | [1-5] | [Gap] | [Priority] |
| Periodic review | Low | [Description] | [1-5] | [Gap] | [Priority] |

Score: 1 = Critical gaps, 5 = Fully compliant
Overall readiness score: [Sum / Max] = [X]%

### Remediation Plan
| Gap ID | Description | Owner | Action | Deadline | Status |
|--------|------------|-------|--------|----------|--------|
| GAP-001 | [Gap] | [Name] | [Remediation action] | [Date] | [Open/In Progress/Closed] |
```

**期待結果：** 優先順位付けされた是正措置を含む定量的な準備状況評価があること。
**失敗時：** 全体的な準備状況が70%を下回る場合は、査察の延期要請（許可される場合）と緊急是正の実施を検討します。

### ステップ3: 文書バンドルの準備

文書を査察準備済みパッケージに整理します:

```markdown
# Inspection Document Bundles

### Bundle 1: Validation Pack (per system)
- [ ] Current validation status summary (one-page per system)
- [ ] User Requirements Specification (URS)
- [ ] Risk Assessment
- [ ] Validation Plan
- [ ] IQ Protocol and Report
- [ ] OQ Protocol and Report
- [ ] PQ Protocol and Report (if applicable)
- [ ] Traceability Matrix
- [ ] Validation Summary Report
- [ ] Periodic review records
- [ ] Change control history since last validation

### Bundle 2: Data Integrity Evidence
- [ ] Data integrity policy and programme
- [ ] ALCOA+ assessment results
- [ ] Audit trail review records (last 12 months)
- [ ] Data integrity monitoring metrics and trends
- [ ] Data integrity training records

### Bundle 3: Operational Evidence
- [ ] Current SOPs (master list with effective dates)
- [ ] Training matrix (all GxP personnel)
- [ ] Change control log (last 24 months)
- [ ] Deviation/incident log (last 24 months)
- [ ] CAPA log with closure status
- [ ] Internal audit reports and CAPA follow-up

### Bundle 4: System Configuration Evidence
- [ ] User access list (current active users with roles)
- [ ] System configuration documentation
- [ ] Backup and recovery test records
- [ ] Security patch log
- [ ] Business continuity/disaster recovery plan
```

**期待結果：** すべてのバンドルが整理・索引付けされ、査察官の要求から30分以内にアクセス可能であること。
**失敗時：** 文書が欠落または不完全な場合は、ギャップリストを作成し、是正を優先し、計画を文書化します。査察官は無秩序さを見抜きます。

### ステップ4: モック査察プロトコルの設計

```markdown
# Mock Inspection Protocol
## Document ID: MIP-[SITE]-[YYYY]-[NNN]

### Scope
- **Focus areas:** [Top 3-5 risk areas from readiness assessment]
- **Systems in scope:** [Systems likely to be inspected]
- **Duration:** [1-2 days]

### Participants
| Role | Name | Mock Inspection Role |
|------|------|---------------------|
| Mock inspector | [Experienced QA or external consultant] | Ask questions, request documents |
| System owner(s) | [Names] | Respond to questions, demonstrate systems |
| QA | [Name] | Observe, note findings |
| Back room coordinator | [Name] | Locate and provide documents |

### Mock Inspection Scenarios
| Scenario | Focus | Inspector Might Ask |
|----------|-------|-------------------|
| 1: Show me the audit trail | Data integrity | "Show me the audit trail for batch record BR-2025-1234" |
| 2: Walk me through a change | Change control | "Show me the change control for the last system upgrade" |
| 3: Show training records | Training | "Show me the training records for user [Name] on system [X]" |
| 4: Explain your validation | CSV | "Walk me through how you validated this system" |
| 5: Show a deviation | CAPA | "Show me your last critical deviation and its CAPA" |
| 6: User access review | Access control | "Show me how you manage user access when people leave" |

### Post-Mock Assessment
| Scenario | Outcome | Findings | Actions |
|----------|---------|----------|---------|
| [#] | [Satisfactory/Needs Work] | [Description] | [Remediation if needed] |
```

**期待結果：** モック査察が本番査察の前に問題を明らかにすること。
**失敗時：** モック査察で重大なギャップが明らかになった場合は、実際の査察観察事項と同じ緊急度で重大な所見として扱います。

### ステップ5: 査察ロジスティクスの計画

```markdown
# Inspection Logistics Plan

### Room Setup
| Room | Purpose | Equipment | Assigned To |
|------|---------|-----------|-------------|
| Front room | Inspector workspace | Table, chairs, network access, printer | Facility manager |
| Back room | Document retrieval and strategy | Copier, network access, phone | QA team |
| Demo room | System demonstrations | Workstation with system access | IT support |

### Roles During Inspection
| Role | Person | Responsibilities |
|------|--------|-----------------|
| Inspection coordinator | [Name] | Single point of contact with inspector, schedule management |
| Subject matter experts | [Names] | Answer technical questions in their domain |
| Back room lead | [Name] | Coordinate document retrieval, track requests |
| Scribe | [Name] | Document all questions, requests, and responses |
| Executive sponsor | [Name] | Available for escalation, opening/closing meetings |

### Communication Protocol
- All document requests flow through the back room lead
- No documents provided without QA review
- Questions requiring research get a "we will get back to you" response (track and follow up)
- Daily debrief with inspection team after each day
```

**期待結果：** ロジスティクス計画が査察に対するプロフェッショナルで整然とした対応を確保すること。
**失敗時：** 主要な人員が査察日に不在の場合は、代替要員を特定してブリーフィングします。

### ステップ6: 対応テンプレートの作成

```markdown
# Inspection Response Templates

### Template 1: 483 Observation Response
[Date]
[FDA District Office Address]

Re: FDA Form 483 Observations — [Inspection Dates] — [Facility Name]

Dear [Inspector Name],

We appreciate the opportunity to address the observations identified during the inspection of [facility] on [dates].

**Observation [N]:** [Quote the exact observation text]

**Response:**
- **Root Cause:** [Brief root cause description]
- **Immediate Corrective Action:** [What was done immediately]
  - Completed: [Date]
- **Long-term Corrective Action:** [Systemic fix]
  - Target completion: [Date]
- **Preventive Action:** [How recurrence will be prevented]
  - Target completion: [Date]
- **Effectiveness Verification:** [How effectiveness will be measured]
  - Target verification date: [Date]

### Template 2: Immediate Correction During Inspection
When an inspector identifies an issue that can be corrected immediately:
1. Acknowledge the observation
2. Implement the correction (if feasible)
3. Document the correction with before/after evidence
4. Inform the inspector that the correction has been made
5. Include in the formal response as "corrected during inspection"
```

**期待結果：** 対応テンプレートが査察観察事項への迅速で構造化された返答を可能にすること。
**失敗時：** 対応テンプレートが汎用的で特定の観察事項に対応していない場合は、具体的な証拠とタイムラインで各対応をカスタマイズします。

## バリデーション

- [ ] 機関固有のフォーカスエリアがリスク評価とともに分析されている
- [ ] 準備状況自己評価が定量的スコアとともに完了している
- [ ] すべてのギャップについてオーナーと期限を含む是正計画が作成されている
- [ ] すべてのスコープ内システムの文書バンドルが組み立てられ索引付けされている
- [ ] モック査察が文書化された所見とフォローアップとともに実施されている
- [ ] 査察ロジスティクス計画が部屋、役割、コミュニケーションプロトコルを定義している
- [ ] 一般的な観察事項タイプに対する対応テンプレートが準備されている
- [ ] すべての重大な是正項目が査察日前に完了している

## よくある落とし穴

- **土壇場の準備**: 査察準備は継続的なプログラムであり、一夜漬けではない。慌てて準備した組織は無秩序で不完全な対応をする
- **問題の隠蔽**: 査察官は経験豊富なプロフェッショナルであり、隠蔽を見抜く。明確な是正計画を伴う透明性は隠蔽の試みよりも常に優れている
- **過剰な情報提供**: 聞かれた質問に答えること。求められていない情報を提供すると新たな調査の糸口になる可能性がある
- **訓練されていない人員**: 査察官の質問に答える練習をしたことのない専門家は成果が悪い。モック査察は不可欠な練習である
- **バックルームの軽視**: バックルーム（文書検索と戦略調整）はフロントルームと同様に重要。文書検索が遅いと無秩序の印象を与える

## 関連スキル

- `design-compliance-architecture` — 査察官が確認したい基盤文書
- `conduct-gxp-audit` — 内部監査は査察手法を模倣するべき
- `monitor-data-integrity` — データ整合性はFDA査察の最重要フォーカスエリア
- `investigate-capa-root-cause` — CAPAは査察前に徹底的に調査されていなければならない
- `qualify-vendor` — ベンダー認定は査察中に頻繁に要求される
