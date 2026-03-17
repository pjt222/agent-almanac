---
name: setup-gxp-r-project
description: >
  GxP規制（21 CFR Part 11、EU Annex 11）に準拠したRプロジェクト構造を設定します。
  バリデート済み環境、適格性評価文書、変更管理、電子記録要件を対象とします。
  規制環境（製薬、バイオテク、医療機器）でのRプロジェクト開始時、臨床試験分析用R設定時、
  規制提出用バリデート済みコンピューティング環境構築時、または21 CFR Part 11や
  EU Annex 11要件実装時に使用します。
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
  tags: gxp, validation, regulatory, pharma, 21-cfr-part-11
---

# GxP Rプロジェクトの設定

バリデート済みコンピューティングのGxP規制要件を満たすRプロジェクト構造を作成します。

## 使用タイミング

- 規制環境（製薬、バイオテク、医療機器）でのRプロジェクト開始時
- 臨床試験分析用のR設定時
- 規制提出用のバリデート済みコンピューティング環境構築時
- 21 CFR Part 11またはEU Annex 11要件の実装時

## 入力

- **必須**: プロジェクトスコープと規制フレームワーク（FDA、EMA、または両方）
- **必須**: バリデート対象のRバージョンとパッケージバージョン
- **必須**: バリデーション戦略（リスクベースアプローチ）
- **任意**: コンピューター化システム用の既存SOP
- **任意**: 品質管理システムの統合要件

## 手順

### ステップ1: バリデート済みプロジェクト構造の作成

```
gxp-project/
├── R/                          # 分析スクリプト
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/                 # バリデーション文書
│   ├── validation_plan.md      # VP: スコープ、戦略、役割
│   ├── risk_assessment.md      # リスク分類
│   ├── iq/                     # Installation Qualification
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/                     # Operational Qualification
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/                     # Performance Qualification
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md  # 要件からテストへのマッピング
├── tests/                      # 自動テストスイート
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/                       # 入力データ（管理済み）
│   ├── raw/                    # 変更不可の生データ
│   └── derived/                # 処理済みデータセット
├── output/                     # 分析出力
├── docs/                       # 補助文書
│   ├── sop_references.md       # 関連SOP へのリンク
│   └── change_log.md           # 手動変更記録
├── renv.lock                   # 依存関係のロック
├── DESCRIPTION                 # プロジェクトメタデータ
├── .Rprofile                   # セッション設定
└── CLAUDE.md                   # AIアシスタント指示
```

**期待結果：** `R/`、`validation/`（`iq/`、`oq/`、`pq/` サブディレクトリを含む）、`tests/testthat/`、`data/raw/`、`data/derived/`、`output/`、`docs/` ディレクトリを含む完全なディレクトリ構造が存在すること。

**失敗時：** ディレクトリが欠けている場合は `mkdir -p` で作成します。正しいプロジェクトルートにいることを確認します。既存プロジェクトの場合は、既存構造を上書きせず欠けているディレクトリのみ作成します。

### ステップ2: バリデーション計画の作成

`validation/validation_plan.md` を作成します:

```markdown
# Validation Plan

## 1. Purpose
This plan defines the validation strategy for [Project Name] using R [version].

## 2. Scope
- R version: 4.5.0
- Packages: [list with versions]
- Analysis: [description]
- Regulatory framework: 21 CFR Part 11 / EU Annex 11

## 3. Risk Assessment Approach
Using GAMP 5 risk-based categories:
- Category 3: Non-configured products (R base)
- Category 4: Configured products (R packages with default settings)
- Category 5: Custom applications (custom R scripts)

## 4. Validation Activities
| Activity | Category 3 | Category 4 | Category 5 |
|----------|-----------|-----------|-----------|
| IQ | Required | Required | Required |
| OQ | Reduced | Standard | Enhanced |
| PQ | N/A | Standard | Enhanced |

## 5. Roles and Responsibilities
- Validation Lead: [Name]
- Developer: [Name]
- QA Reviewer: [Name]
- Approver: [Name]

## 6. Acceptance Criteria
All tests must pass with documented evidence.
```

**期待結果：** `validation/validation_plan.md` にスコープ、GAMP 5リスクカテゴリー、バリデーション活動マトリクス、役割と責任、合格基準が記載されていること。計画書には特定のRバージョンと規制フレームワークへの言及が含まれること。

**失敗時：** 規制フレームワークが不明確な場合は、適用SOPについて組織のQA部門に相談します。計画書がレビューおよび承認されるまでバリデーション活動を進めないでください。

### ステップ3: renvによる依存関係のロック

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

`renv.lock` ファイルは管理されたパッケージインベントリとして機能します。

**期待結果：** 必要なすべてのパッケージに正確なバージョン番号が含まれた `renv.lock` が存在すること。`renv::status()` が問題なしと報告すること。すべてのパッケージバージョンが（例：`dplyr@1.1.4`のように）固定され、浮動バージョンでないこと。

**失敗時：** `renv::install()` が特定バージョンで失敗した場合、そのバージョンがCRANアーカイブに存在するか確認します。アーカイブバージョンには `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` を使用します。

### ステップ4: バージョン管理の実装

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**期待結果：** プロジェクトが署名済みコミットを有効にしたgitバージョン管理下にあること。初期コミットにバリデート済みプロジェクト構造と `renv.lock` が含まれること。

**失敗時：** GPG署名が失敗した場合は `gpg --list-secret-keys` でGPGキーが設定されていることを確認します。GPGなしの環境では、逸脱を記録し、`docs/change_log.md` に手動監査証跡エントリを使用して署名なしコミットを使用します。

### ステップ5: IQプロトコルの作成

`validation/iq/iq_protocol.md`:

```markdown
# Installation Qualification Protocol

## Objective
Verify that R and required packages are correctly installed.

## Test Cases

### IQ-001: R Version Verification
- **Requirement**: R 4.5.0 installed
- **Procedure**: Execute `R.version.string`
- **Expected:** "R version 4.5.0 (date)"
- **Result**: [ PASS / FAIL ]

### IQ-002: Package Installation Verification
- **Requirement**: All packages in renv.lock installed
- **Procedure**: Execute `renv::status()`
- **Expected:** "No issues found"
- **Result**: [ PASS / FAIL ]

### IQ-003: Package Version Verification
- **Procedure**: Execute `installed.packages()[, c("Package", "Version")]`
- **Expected:** Versions match renv.lock exactly
- **Result**: [ PASS / FAIL ]
```

**期待結果：** `validation/iq/iq_protocol.md` にRバージョン確認、パッケージインストール確認、パッケージバージョン確認のテストケースが含まれ、それぞれに明確な期待結果と合否フィールドがあること。

**失敗時：** IQプロトコルテンプレートが組織のSOP要件に合わない場合は、必須フィールド（要件、手順、期待結果、実際の結果、合否）を保持しながらフォーマットを適応します。承認されたテンプレートについてQAに相談します。

### ステップ6: 自動化されたOQ/PQテストの作成

```r
# tests/testthat/test-analysis.R
test_that("primary analysis produces validated results", {
  # Known input -> known output (double programming validation)
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  # Compare against independently calculated expected values
  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

**期待結果：** `tests/testthat/` に自動テストファイルが存在し、OQ（各関数の動作確認）とPQ（独立して計算された参照値との端から端までのバリデーション）を対象としていること。テストに明示的な数値許容誤差が使用されていること。

**失敗時：** 独立計算（例：SAS）からの参照値がまだ利用できない場合は、`skip("Awaiting independent reference values")` でプレースホルダーテストを作成し、トレーサビリティマトリクスに記録します。

### ステップ7: トレーサビリティマトリクスの作成

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**期待結果：** `validation/traceability_matrix.md` がすべての要件を少なくとも1つのテストケースにリンクし、すべてのテストケースが要件にリンクされていること。孤立した要件やテストがないこと。

**失敗時：** テストされていない要件がある場合は、テストケースを作成するか、除外のリスクベースの正当性を文書化します。要件にリンクされていないテストがある場合は、既存の要件にリンクするか、スコープ外として削除します。

## バリデーション

- [ ] プロジェクト構造が文書化されたテンプレートに従っている
- [ ] renv.lock にすべての依存関係が正確なバージョンで含まれている
- [ ] バリデーション計画が完成し、承認されている
- [ ] IQプロトコルが正常に実行される
- [ ] OQテストケースがすべての設定機能を対象としている
- [ ] PQテストが独立して計算された結果に対してバリデートされている
- [ ] トレーサビリティマトリクスが要件をテストにリンクしている
- [ ] 変更管理プロセスが文書化されている

## よくある落とし穴

- **バージョン固定なしの `install.packages()` 使用**: ロックされたバージョンを含むrenvを常に使用すること
- **監査証跡の欠如**: すべての変更を文書化する必要があります。署名済みgitコミットを使用すること
- **過剰なバリデーション**: リスクベースアプローチを適用すること。すべてのCRANパッケージにカテゴリー5のバリデーションが必要なわけではない
- **システムレベルの適格性評価の忘れ**: OSとRのインストールもIQが必要
- **独立した検証なし**: PQは独立して計算された結果（SAS、手動計算）と比較すること

## 関連スキル

- `write-validation-documentation` - 詳細なバリデーション文書作成
- `implement-audit-trail` - 電子記録と監査証跡
- `validate-statistical-output` - ダブルプログラミングと出力バリデーション
- `manage-renv-dependencies` - バリデート済み環境の依存関係ロック
