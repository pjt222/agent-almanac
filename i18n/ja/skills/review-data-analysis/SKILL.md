---
name: review-data-analysis
description: >
  データ分析の品質、正確性、再現可能性をレビューする。データ品質評価、前提条件の確認、
  モデル検証、データ漏洩の検出、再現可能性の検証を網羅する。出版前に同僚の分析を
  レビューする場合、本番展開前にMLパイプラインを検証する場合、規制・業務上の意思決定の
  ためにレポートを監査する場合、または規制環境での第二分析者レビューに使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: data-quality, model-validation, leakage, reproducibility, statistics, review
---

# Review Data Analysis

データ分析パイプラインを正確性、堅牢性、再現可能性について評価する。

## 使用タイミング

- 出版前に同僚の分析ノートブックやスクリプトをレビューする場合
- 本番展開前に機械学習パイプラインを検証する場合
- 規制・業務上の意思決定のために分析レポートを監査する場合
- 分析がその結論を支持しているかを評価する場合
- 規制環境での第二分析者レビューを実施する場合

## 入力

- **必須**: 分析コード（スクリプト、ノートブック、またはパイプライン定義）
- **必須**: 分析出力（結果、テーブル、図、モデルメトリクス）
- **任意**: 生データまたはデータ辞書
- **任意**: 分析計画またはプロトコル（事前登録またはアドホック）
- **任意**: 対象読者と意思決定のコンテキスト

## 手順

### ステップ1: データ品質の評価

分析を評価する前に入力データをレビューする：

```markdown
## Data Quality Assessment

### Completeness
- [ ] Missing data quantified (% by column and by row)
- [ ] Missing data mechanism considered (MCAR, MAR, MNAR)
- [ ] Imputation method appropriate (if used) or complete-case analysis justified

### Consistency
- [ ] Data types match expectations (dates are dates, numbers are numbers)
- [ ] Value ranges are plausible (no negative ages, future dates in historical data)
- [ ] Categorical variables have expected levels (no misspellings, consistent coding)
- [ ] Units are consistent across records

### Uniqueness
- [ ] Duplicate records identified and handled
- [ ] Primary keys are unique where expected
- [ ] Join operations produce expected row counts (no fan-out or drop)

### Timeliness
- [ ] Data vintage appropriate for the analysis question
- [ ] Temporal coverage matches the study period
- [ ] No look-ahead bias in time-series data

### Provenance
- [ ] Data source documented
- [ ] Extraction date/version recorded
- [ ] Any transformations between source and analysis input documented
```

**期待結果：** 結果への潜在的影響を添えてデータ品質の問題が文書化されている。
**失敗時：** レビューのためにデータにアクセスできない場合は、コードからデータ品質を評価する（どのような確認と変換が適用されているか）。

### ステップ2: 前提条件の確認

使用されている各統計手法またはモデルについて：

| 手法 | 主要な前提条件 | 確認方法 |
|--------|----------------|-------------|
| 線形回帰 | 線形性、独立性、残差の正規性、等分散性 | 残差プロット、Q-Qプロット、Durbin-Watson、Breusch-Pagan |
| ロジスティック回帰 | 独立性、多重共線性なし、ロジットの線形性 | VIF、Box-Tidwell、残差診断 |
| t検定 | 独立性、正規性（またはn大）、等分散 | Shapiro-Wilk、Leveneの検定、視覚的検査 |
| 分散分析 | 独立性、正規性、分散の均質性 | グループ別Shapiro-Wilk、Leveneの検定 |
| カイ二乗 | 独立性、期待度数≥5 | 期待度数テーブル |
| ランダムフォレスト | 十分な訓練データ、特徴量の関連性 | OOBエラー、特徴量重要度、学習曲線 |
| ニューラルネットワーク | 十分なデータ、適切なアーキテクチャ、データ漏洩なし | 検証曲線、過学習チェック |

```markdown
## Assumption Check Results
| Analysis Step | Method | Assumption | Checked? | Result |
|---------------|--------|------------|----------|--------|
| Primary model | Linear regression | Normality of residuals | Yes | Q-Q plot shows mild deviation — acceptable for n>100 |
| Primary model | Linear regression | Homoscedasticity | No | Not checked — recommend adding Breusch-Pagan test |
```

**期待結果：** 使用されているすべての統計手法の前提条件が明示的に確認または認識されている。
**失敗時：** 前提条件が違反されている場合は、著者が対処しているか確認する（ロバスト手法、変換、感度分析）。

### ステップ3: データ漏洩の検出

データ漏洩は、訓練セット外の情報がモデルに影響を与え、過度に楽観的な性能につながる場合に発生する：

#### 一般的な漏洩パターン：
- [ ] **目標変数の漏洩**: 目標変数を直接エンコードする特徴量（例：「treatment_success」を予測するための「treatment_outcome」）
- [ ] **時間的漏洩**: 予測時点で利用できなかったデータから計算された特徴量
- [ ] **訓練・テストデータの汚染**: 分割前の全データセットで前処理（スケーリング、補完、特徴量選択）が実施されている
- [ ] **グループ漏洩**: 関連する観測値（同一患者、同一デバイス）が訓練・テストセットに分割されている
- [ ] **特徴量エンジニアリングの漏洩**: 訓練フォールド内ではなく、全データセットで計算された集計値

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

**期待結果：** 明確/懸念のステータスを添えてすべての一般的な漏洩パターンが確認されている。
**失敗時：** 漏洩が発見された場合は、漏洩した特徴量なしで再実行するか（可能な場合）、分析者に調査を求める。

### ステップ4: モデル性能の検証

#### 予測モデルの場合：
- [ ] 問題に適したメトリクス（精度だけでなく — 適合率、再現率、F1、AUC、RMSE、MAEも考慮）
- [ ] 交差検証またはホールドアウト戦略が説明されており適切である
- [ ] 訓練セットとテスト/検証セットの性能比較（過学習チェック）
- [ ] ベースライン比較が提供されている（ナイーブモデル、ランダム確率、以前のアプローチ）
- [ ] 性能メトリクスの信頼区間または標準誤差
- [ ] 関連するサブグループでの性能評価（公平性、エッジケース）

#### 推論/説明モデルの場合：
- [ ] モデル適合統計量の報告（R²、AIC、BIC、逸脱度）
- [ ] 係数の正しい解釈（方向性、大きさ、有意性）
- [ ] 多重共線性の評価（VIF < 5〜10）
- [ ] 影響力のある観測値の特定（Cookの距離、レバレッジ）
- [ ] 複数の仕様がテストされた場合のモデル比較

**期待結果：** 使用ケース（予測対推論）に適したモデル検証が行われている。
**失敗時：** テストセットの性能が訓練性能に疑わしいほど近い場合は、潜在的な漏洩を指摘する。

### ステップ5: 再現可能性の評価

```markdown
## Reproducibility Checklist
| Item | Status | Notes |
|------|--------|-------|
| Code runs without errors | [Yes/No] | Tested on [environment description] |
| Random seeds set | [Yes/No] | Line [N] in [file] |
| Dependencies documented | [Yes/No] | requirements.txt / renv.lock present |
| Data loading reproducible | [Yes/No] | Path is [relative/absolute/URL] |
| Results match reported values | [Yes/No] | Verified: Table 1 ✓, Figure 2 ✗ (minor discrepancy) |
| Environment documented | [Yes/No] | Python 3.11 / R 4.5.0 specified |
```

**期待結果：** 分析を再実行して再現可能性が検証されている（データが利用できない場合はコードから評価）。
**失敗時：** 結果が完全に再現しない場合は、差異が浮動小数点の許容範囲内か、それとも問題を示しているかを判断する。

### ステップ6: レビューの執筆

```markdown
## Data Analysis Review

### Overall Assessment
[1-2 sentences: Is the analysis sound? Does it support the conclusions?]

### Data Quality
[Summary of data quality findings, impact on results]

### Methodological Concerns
1. **[Title]**: [Description, location in code/report, suggestion]
2. ...

### Strengths
1. [What was done well]
2. ...

### Reproducibility
[Tier assessment: Gold/Silver/Bronze/Opaque with justification]

### Recommendations
- [ ] [Specific action items for the analyst]
```

**期待結果：** レビューがコードの位置への具体的な参照を含む実行可能なフィードバックを提供している。
**失敗時：** 時間が限られている場合は、スタイルの問題よりもデータ品質と漏洩の確認を優先する。

## バリデーション

- [ ] データ品質が完全性、一致性、一意性、適時性、出所について評価されている
- [ ] 使用された各手法の統計的前提条件が確認されている
- [ ] データ漏洩が体系的に評価されている
- [ ] モデル性能が適切なメトリクスとベースラインで検証されている
- [ ] 再現可能性が評価されている（コードが動作し、結果が一致する）
- [ ] フィードバックがコード行やレポートのセクションを参照した具体的なものである
- [ ] トーンが建設的で協力的なものである

## よくある落とし穴

- **コードのみをレビューする**: 分析計画と結論は実装と同様に重要である。
- **データ品質を無視する**: 質の悪いデータ上の洗練されたモデルは、自信を持って誤った答えを生成する。
- **複雑さから正確性を推測する**: 95%精度のランダムフォレストにはデータ漏洩がある可能性があり、単純なt検定が正しいアプローチである場合もある。
- **コードを実行しない**: 可能な限り、コードを実行して再現可能性を検証すること。コードを読むだけでは不十分である。
- **細部に迷って全体を見失う**: 根本的な分析エラーを見落としながらコードスタイルの問題に迷い込まないこと。

## 関連スキル

- `review-research` — より広い研究手法と論文レビュー
- `validate-statistical-output` — 二重プログラミング検証手法
- `generate-statistical-tables` — 出版対応の統計テーブル
- `review-software-architecture` — コード構造とデザインのレビュー
