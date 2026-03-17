---
name: write-validation-documentation
description: >
  規制環境のコンピューター化システム向けIQ/OQ/PQバリデーション文書を作成します。
  プロトコル、報告書、テストスクリプト、逸脱処理、承認ワークフローを対象とします。
  規制用途向けRまたは他のソフトウェアのバリデーション時、規制監査の準備時、
  コンピューティング環境の適格性評価の文書化時、または新規・再適格性評価システムの
  バリデーションプロトコルと報告書の作成・更新時に使用します。
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
  language: R
  tags: validation, iq-oq-pq, documentation, gxp, qualification
---

# バリデーション文書の作成

コンピューター化システムの完全なIQ/OQ/PQバリデーション文書を作成します。

## 使用タイミング

- 規制用途向けRまたは他のソフトウェアのバリデーション時
- 規制監査の準備時
- コンピューティング環境の適格性評価の文書化時
- バリデーションプロトコルと報告書の作成または更新時

## 入力

- **必須**: バリデートするシステム/ソフトウェア（名称、バージョン、目的）
- **必須**: スコープと戦略を定義したバリデーション計画
- **必須**: ユーザー要件仕様書
- **任意**: 既存のSOPテンプレート
- **任意**: 以前のバリデーション文書（再適格性評価の場合）

## 手順

### ステップ1: Installation Qualification（IQ）プロトコルの作成

```markdown
# Installation Qualification Protocol
**System**: R Statistical Computing Environment
**Version**: 4.5.0
**Document ID**: IQ-PROJ-001
**Prepared by**: [Name] | **Date**: [Date]
**Reviewed by**: [Name] | **Date**: [Date]
**Approved by**: [Name] | **Date**: [Date]

## 1. Objective
Verify that R and required packages are correctly installed per specifications.

## 2. Prerequisites
- [ ] Server/workstation meets hardware requirements
- [ ] Operating system qualified
- [ ] Network access available (for package downloads)

## 3. Test Cases

### IQ-001: R Installation
| Field | Value |
|-------|-------|
| Requirement | R version 4.5.0 correctly installed |
| Procedure | Open R console, execute `R.version.string` |
| Expected Result | "R version 4.5.0 (2025-04-11)" |
| Actual Result | ______________________ |
| Pass/Fail | [ ] |
| Executed by | ____________ Date: ________ |

### IQ-002: Package Inventory
| Package | Required Version | Installed Version | Pass/Fail |
|---------|-----------------|-------------------|-----------|
| dplyr | 1.1.4 | | [ ] |
| ggplot2 | 3.5.0 | | [ ] |
| survival | 3.7-0 | | [ ] |

## 4. Deviations
[Document any deviations from expected results and their resolution]

## 5. Conclusion
[ ] All IQ tests PASSED - system installation verified
[ ] IQ tests FAILED - see deviation section
```

**期待結果：** `validation/iq/iq_protocol.md` が一意の文書ID、目的、前提条件チェックリスト、Rインストールおよびすべてのパッケージのテストケースのほか、逸脱セクションおよび承認フィールドを含む完成した状態にあること。

**失敗時：** 組織が異なる文書フォーマットを要求する場合は、既存のSOPに合わせてテンプレートを適応します。フォーマットに関わらず、主要フィールド（要件、手順、期待結果、実際の結果、合否）は保持する必要があります。

### ステップ2: Operational Qualification（OQ）プロトコルの作成

```markdown
# Operational Qualification Protocol
**Document ID**: OQ-PROJ-001

## 1. Objective
Verify that the system operates correctly under normal conditions.

## 2. Test Cases

### OQ-001: Data Import Functionality
| Field | Value |
|-------|-------|
| Requirement | System correctly imports CSV files |
| Test Data | validation/test_data/import_test.csv (MD5: abc123) |
| Procedure | Execute `read.csv("import_test.csv")` |
| Expected | Data frame with 100 rows, 5 columns |
| Actual Result | ______________________ |
| Evidence | Screenshot/log file reference |

### OQ-002: Statistical Calculations
| Field | Value |
|-------|-------|
| Requirement | t-test produces correct results |
| Test Data | Known dataset: x = c(2.1, 2.5, 2.3), y = c(3.1, 3.5, 3.3) |
| Procedure | Execute `t.test(x, y)` |
| Expected | t = -5.000, df = 4, p = 0.00753 |
| Actual Result | ______________________ |
| Tolerance | ±0.001 |

### OQ-003: Error Handling
| Field | Value |
|-------|-------|
| Requirement | System handles invalid input gracefully |
| Procedure | Execute `analysis_function(invalid_input)` |
| Expected | Informative error message, no crash |
| Actual Result | ______________________ |
```

**期待結果：** `validation/oq/oq_protocol.md` にデータインポート、統計計算、エラー処理のテストケースが含まれ、それぞれに特定のテストデータ、期待結果（該当する場合は許容誤差付き）、証拠要件があること。

**失敗時：** テストデータがまだ利用できない場合は、既知の特性を持つ合成テストデータセットを作成します。結果を独立して検証できるようにデータ生成方法を記録します。

### ステップ3: Performance Qualification（PQ）プロトコルの作成

```markdown
# Performance Qualification Protocol
**Document ID**: PQ-PROJ-001

## 1. Objective
Verify the system performs as intended with real-world data and workflows.

## 2. Test Cases

### PQ-001: End-to-End Primary Analysis
| Field | Value |
|-------|-------|
| Requirement | Primary endpoint analysis matches reference |
| Test Data | Blinded test dataset (hash: sha256:abc...) |
| Reference | Independent SAS calculation (report ref: SAS-001) |
| Procedure | Execute full analysis pipeline |
| Expected | Estimate within ±0.001 of reference |
| Actual Result | ______________________ |

### PQ-002: Report Generation
| Field | Value |
|-------|-------|
| Requirement | Generated report contains all required sections |
| Procedure | Execute report generation script |
| Checklist | |
| | [ ] Title page with study information |
| | [ ] Table of contents |
| | [ ] Demographic summary table |
| | [ ] Primary analysis results |
| | [ ] Appendix with session info |
```

**期待結果：** `validation/pq/pq_protocol.md` に実世界（または代表的な）データを使用した端から端までのテストケースが含まれ、独立した参照計算（例：SAS出力）と結果を比較していること。許容誤差が明示的に定義されていること。

**失敗時：** 独立した参照結果が利用できない場合は、ギャップを文書化し、代替検証方法としてデュアルプログラミング（2つの独立したR実装）を使用します。独立した検証が完了するまでPQを暫定としてフラグします。

### ステップ4: 適格性評価報告書の作成

プロトコル実行後、結果を文書化します:

```markdown
# Installation Qualification Report
**Document ID**: IQ-RPT-001
**Protocol Reference**: IQ-PROJ-001

## 1. Summary
All IQ test cases were executed on [date] by [name].

## 2. Results Summary
| Test ID | Description | Result |
|---------|-------------|--------|
| IQ-001 | R Installation | PASS |
| IQ-002 | Package Inventory | PASS |

## 3. Deviations
None observed.

## 4. Conclusion
The installation of R 4.5.0 and associated packages has been verified
and meets all specified requirements.

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Executor | | | |
| Reviewer | | | |
| Approver | | | |
```

**期待結果：** 適格性評価報告書（IQ、OQ、PQ）がすべてのテスト結果を記入した状態で完成し、逸脱が文書化（または「なし」と記載）され、結論が述べられ、承認署名フィールドが署名待ちの状態にあること。

**失敗時：** 実行中にテスト失敗が発生した場合は、各失敗を根本原因分析と解決策を含む逸脱として文書化します。失敗が観察された場合は逸脱セクションを空白のままにしないでください。

### ステップ5: 自動化できる部分の自動化

証拠を生成する自動テストスクリプトを作成します:

```r
# validation/scripts/run_iq.R
sink("validation/iq/iq_evidence.txt")
cat("IQ Execution Date:", format(Sys.time()), "\n\n")

cat("IQ-001: R Version\n")
cat("Result:", R.version.string, "\n")
cat("Status:", ifelse(R.version$major == "4" && R.version$minor == "5.0",
                      "PASS", "FAIL"), "\n\n")

cat("IQ-002: Package Versions\n")
required <- renv::dependencies()
installed <- installed.packages()
# ... comparison logic
sink()
```

**期待結果：** `validation/scripts/` に自動スクリプトが存在し、各テストケースのタイムスタンプ付き結果を含む証拠ファイル（例：`iq_evidence.txt`）を生成することで、手動データ入力を削減し再現性を確保していること。

**失敗時：** 環境の違いにより自動スクリプトが失敗する場合は、手動で実行し `sink()` で出力をキャプチャします。自動実行と手動実行の差異を適格性評価報告書に記録します。

## バリデーション

- [ ] すべてのプロトコルに一意の文書IDがある
- [ ] プロトコルがバリデーション計画を参照している
- [ ] テストケースに明確な合否基準がある
- [ ] 報告書に実行されたすべてのテスト結果が含まれている
- [ ] 逸脱が解決策とともに文書化されている
- [ ] 承認署名が取得されている
- [ ] 文書が組織のSOPテンプレートに従っている

## よくある落とし穴

- **曖昧な合格基準**: 「システムが正しく動作する」はテスト可能ではありません。正確な期待値を指定すること
- **証拠の欠如**: すべてのテスト結果に補助証拠（スクリーンショット、ログ、出力ファイル）が必要
- **不完全な逸脱処理**: すべての失敗は文書化、調査、解決されなければならない
- **文書のバージョン管理なし**: バリデーション文書もコードと同様に変更管理が必要
- **再適格性評価のスキップ**: システムの更新（Rバージョン、パッケージ更新）は再適格性評価の評価が必要

## 関連スキル

- `setup-gxp-r-project` - バリデート済み環境のプロジェクト構造
- `implement-audit-trail` - 電子記録の追跡
- `validate-statistical-output` - 出力バリデーション方法論
