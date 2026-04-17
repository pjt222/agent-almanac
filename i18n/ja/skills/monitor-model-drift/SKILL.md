---
name: monitor-model-drift
description: >
  Evidently AI、統計テスト（PSI、KS）、カスタムメトリクスを使用した包括的なモデル
  ドリフトモニタリングの実装。本番MLシステムのデータドリフトとコンセプトドリフトを
  検出する。ビジネスメトリクスに影響する前に劣化を検出するための自動アラートと
  レポートワークフローを設定する。本番モデルが原因不明のパフォーマンス劣化を示す
  時、新しいデータ分布がトレーニングデータと異なる時、季節的シフトが入力特徴に
  影響する時、または規制要件がモデルモニタリングを義務付ける時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: model-drift, evidently, psi, ks-test, concept-drift, data-drift, monitoring
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# モデルドリフトのモニタリング


> 完全な設定ファイルとテンプレートについては[Extended Examples](references/EXAMPLES.md)を参照。

統計テストと自動化されたモニタリングを使用して、本番MLモデルのデータドリフトとコンセプトドリフトを検出し、アラートを発報する。

## 使用タイミング

- 本番MLモデルが原因不明のパフォーマンス劣化を経験している時
- 新しいデータ分布がトレーニングデータと異なる時
- 入力特徴に季節的または時間的なシフトがある時
- ビジネスメトリクスに影響する前にプロアクティブなアラートが必要な時
- モデルモニタリングの規制要件がある時（例: SR 11-7、EU AI Act）
- ドリフト比較が必要な複数のモデルバージョンがデプロイされている時

## 入力

- **必須**: 本番モデルの予測と特徴（直近30-90日分）
- **必須**: リファレンスデータセット（トレーニングまたはバリデーションデータ）
- **必須**: グランドトゥルースラベル（遅延がある場合がある）
- **任意**: 特徴重要度スコアまたはSHAP値
- **任意**: アラート用のビジネスメトリクス閾値
- **任意**: トレンド分析用の過去のドリフトレポート

## 手順

### ステップ1: Evidently AIのインストールと設定

適切な依存関係を持つモニタリングフレームワークを設定する。

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

設定ファイルを作成する:

```python
# monitoring/config/drift_config.py
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset
from evidently.metrics import (
    DatasetDriftMetric,
    DatasetMissingValuesMetric,
    ColumnDriftMetric,
)

# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** モデルの許容度に一致する閾値を持つ設定ファイルが作成されていること。

**失敗時:** 保守的な閾値（PSI > 0.2、KS p値 < 0.01）から始め、偽陽性率に基づいてチューニングする。

### ステップ2: データドリフト検出の実装

複数の統計テストを使用したドリフト検出パイプラインを作成する。

```python
# monitoring/drift_detector.py
import pandas as pd
import numpy as np
from scipy.stats import ks_2samp, chi2_contingency
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
from evidently.metrics import ColumnDriftMetric, DatasetDriftMetric
from datetime import datetime, timedelta
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** ドリフト検出が正常に実行され、特徴ごとの統計を含むJSONレポートを生成し、ドリフトした特徴を特定すること。

**失敗時:** 欠損値を確認する（補完または除去）、リファレンスと現在のデータが同じカラムを持つことを確認する、データセット間でデータ型が一致することを検証する。

### ステップ3: Evidentlyレポートの生成

人間のレビューとデバッグのための視覚的なHTMLレポートを作成する。

```python
# monitoring/generate_reports.py
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset
from evidently.metrics import (
    ColumnDriftMetric,
    DatasetDriftMetric,
    DatasetMissingValuesMetric,
)
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** `monitoring/reports/`にHTMLレポートが生成され、分布比較を示すインタラクティブなチャートと共にブラウザで閲覧可能であること。

**失敗時:** 出力ディレクトリへの書き込み権限を確認し、Evidentlyバージョンが >= 0.4.0であることを確認し、データフレームに十分な行（100以上を推奨）があることを確認する。

### ステップ4: コンセプトドリフト検出の実装

コンセプトドリフト（特徴とターゲット間の関係の変化）を検出するための予測パフォーマンスのモニタリング。

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** モデルの精度/AUCが閾値を下回った時にパフォーマンスモニタリングが検出し、潜在的なコンセプトドリフトを通知すること。

**失敗時:** グランドトゥルースラベルが利用可能であることを確認する（遅延検証バッチジョブが必要な場合がある）、予測スコアが適切にキャリブレーションされていることを検証する（分類の場合0-1の範囲）、特徴のラベルリーケージを確認する。

### ステップ5: 自動アラートの設定

ドリフト検出をアラートシステム（Slack、PagerDuty、メール）と統合する。

```python
# monitoring/alerting.py
import requests
import json
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** ドリフトが検出された時にSlack/PagerDutyにアラートが送信され、ドリフトシェアとクリティカル特徴の関与に基づく重大度が設定されること。

**失敗時:** まずcurlでWebhook URLをテストし、PagerDuty統合キーに正しい権限があることを検証し、送信HTTPSのファイアウォールルールを確認し、一時的なネットワーク障害のためのリトライロジックを実装する。

### ステップ6: モニタリングジョブのスケジューリング

ドリフト検出をスケジュール（毎日または毎週）で自動実行する。

```python
# monitoring/scheduler.py
import schedule
import time
import logging
from datetime import datetime, timedelta
import pandas as pd

logging.basicConfig(
# ... (see EXAMPLES.md for complete implementation)
```

代替として、cronを使用:

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * cd /path/to/monitoring && /path/to/venv/bin/python scheduler.py >> logs/cron.log 2>&1
```

またはAirflow DAGを使用:

```python
# airflow/dags/drift_monitoring_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'ml-team',
    'depends_on_past': False,
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** モニタリングがスケジュール通りに自動実行され、レポートを生成し、ドリフトが閾値を超えた場合のみアラートを送信し、すべてのアクティビティをログに記録すること。

**失敗時:** スケジューラープロセスが実行中であることを確認する（`ps aux | grep scheduler`）、cronサービスがアクティブであることを検証する、データソースがアクセス可能であることを確認する、例外についてログを確認する、ジョブが実行されない場合のデッドマンズスイッチアラートを設定する。

## バリデーション

- [ ] PSIとKSテストの計算が既知のドリフトシナリオに対して期待値を生成する
- [ ] Evidently HTMLレポートが正しくレンダリングされ、分布のオーバーレイを表示する
- [ ] クリティカル特徴のドリフトが即座にアラートをトリガーする
- [ ] コンセプトドリフト検出器が3日以内にパフォーマンス劣化を識別する
- [ ] すべての設定チャネル（Slack、メール、PagerDuty）にアラートが配信される
- [ ] スケジュールされたジョブが手動介入なしで7日以上実行される
- [ ] 偽陽性率が < 5%（高い場合は閾値をチューニングする）
- [ ] 100万行に対してドリフト検出が5分以内に完了する

## よくある落とし穴

- **古いリファレンスデータ**: リファレンスデータセットを四半期ごとまたはモデル再トレーニング後に更新し、自然なデータの進化を反映する
- **サンプルサイズの不一致**: 信頼性の高い統計のために、現在とリファレンスのデータセットが同様のサイズ（各1000行以上）であることを確認する
- **グランドトゥルースの欠如**: コンセプトドリフトにはラベルが必要; リアルタイムラベルが利用できない場合は遅延ラベリングパイプラインを実装する
- **季節性の混同**: 週次/月次パターンが偽陽性をトリガーする可能性がある; 時間整列されたリファレンスウィンドウを使用するか、特徴の季節性を除去する
- **アラート疲労**: 高い閾値から始めて、実際のモデル再トレーニング頻度に基づいて徐々に下げる
- **データ品質ドリフトの無視**: 欠損値、外れ値、エンコーディングエラーを分布ドリフトとは別にモニタリングする
- **集約メトリクスへの過度の依存**: 特徴ごとの分析が重要; 集約ドリフトは個別の重要な特徴のシフトを隠す可能性がある
- **予測分布の無視**: グランドトゥルースなしでも、突然の予測分布のシフトは問題を示す

## 関連スキル

- `detect-anomalies-aiops` - 運用メトリクスの時系列異常検出
- `deploy-ml-model-serving` - モデルデプロイメントパターンとバージョニング
- `setup-prometheus-monitoring` - インフラストラクチャメトリクスの収集
- `review-data-analysis` - 統計分析の検証とピアレビュー
