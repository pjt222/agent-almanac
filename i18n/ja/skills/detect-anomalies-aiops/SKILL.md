---
name: detect-anomalies-aiops
description: >
  時系列分析（Isolation Forest、Prophet、LSTM）、アラート相関、根本原因分析を使用して
  運用メトリクスのAI駆動異常検知を実装する。システムメトリクス、ログ、トレースの
  真の異常をインテリジェントに特定することでアラート疲労を軽減する。運用チームが
  アラート量に圧倒されている時、静的閾値を超える複雑なマルチメトリクス異常の検知時、
  季節パターンが閾値を無効にする時、ユーザー影響前にプロアクティブに問題を予測する
  必要がある時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: aiops, anomaly-detection, isolation-forest, prophet, alert-correlation, time-series
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# AIOpsのための異常検知

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

機械学習を適用して運用メトリクスの異常を検知し、アラートを相関させ、誤検知を削減する。

## 使用タイミング

- 運用チームがアラート量に圧倒されている時（1日100件以上のアラート）
- 複雑なマルチメトリクス異常の検知が必要な時（単なる閾値超過ではない）
- 季節パターンが静的閾値を無効にする時
- ユーザー影響前にプロアクティブに問題を予測したい時
- 関連アラートを相関させて根本原因を特定する必要がある時
- モニタリングシステムが偽陽性を多く生成する時
- 微妙なパフォーマンス劣化トレンドを検知したい時

## 入力

- **必須**: モニタリングシステムからの時系列メトリクス（CPU、メモリ、レイテンシ、エラー率）
- **必須**: 過去データ（最低30〜90日）
- **任意**: ラベル付きアラート履歴（真陽性/偽陽性）
- **任意**: システムトポロジー（サービス依存関係）
- **任意**: 相関用のログデータ
- **任意**: コンテキスト用のデプロイメント/変更イベント

## 手順

### ステップ1: 環境セットアップとデータロード

依存関係をインストールし、分析用の時系列データを準備する。

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install anomaly detection libraries
pip install prophet scikit-learn pandas numpy
pip install tensorflow keras  # for LSTM models
pip install pyod  # Python Outlier Detection library
pip install statsmodels  # for statistical methods
pip install prometheus-api-client  # if using Prometheus

# Visualization
pip install plotly matplotlib seaborn
```

データのロードと準備:

```python
# aiops/data_loader.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 時系列データが正規の間隔でロードされ、欠損値が処理され、MLモデル用の特徴量が設計されている。

**失敗時:** Prometheus接続が失敗する場合はURLとネットワークアクセスを確認、データギャップがある場合は前方フィルまたは補間を使用、タイムスタンプ列がdatetime型であることを確認、大きな日付範囲でのメモリ問題を確認（チャンクで処理）。

### ステップ2: 多変量異常検知のためのIsolation Forestの実装

教師なしIsolation Forestアルゴリズムを使用して異常を検知する。

```python
# aiops/isolation_forest_detector.py
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
from typing import Dict, List
import joblib

# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 過去データで学習されたモデル、スコア付きで検知された異常、通常データポイントの0.5〜2%がフラグされる。

**失敗時:** 異常が多すぎる場合（>5%）、contaminationパラメータを下げるかクリーンなベースライン期間で再学習、少なすぎる場合（<0.1%）、contaminationを上げるか特徴量スケーリングを確認、特徴量に十分な分散があることを確認。

### ステップ3: 時系列予測と異常検知のためのProphetの実装

Facebook Prophetを使用して季節性をモデル化し偏差を検知する。

```python
# aiops/prophet_detector.py
from prophet import Prophet
import pandas as pd
import numpy as np
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** Prophetモデルが日次/週次の季節性を捕捉し、実際の値が99%信頼区間外に落ちた時に異常が検知され、キャパシティプランニング用の予測が生成される。

**失敗時:** Prophetに時間がかかりすぎる場合（メトリクスごとに5分以上）、過去データを30日に減らすかweekly_seasonalityを無効にする、偽陽性が多すぎる場合はinterval_widthを0.995に増加、季節パターンが欠如する場合はカスタム季節性を追加、タイムスタンプのタイムゾーン一貫性を確認。

### ステップ4: アラート相関と根本原因の特定

関連する異常をグループ化し、潜在的な根本原因を特定する。

```python
# aiops/alert_correlation.py
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from typing import List, Dict
from datetime import timedelta
import networkx as nx

# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 関連する異常がインシデントにグループ化され、依存関係グラフに基づいて根本原因が特定され、調査用のインシデントサマリーが生成される。

**失敗時:** すべての異常が別々のインシデントになる場合、time_window_minutesを増加する、根本原因の検知が不明確な場合、アーキテクチャに基づいてmetric_relationshipsを明示的に定義する、タイムスタンプのソートが正しいことを確認。

### ステップ5: アラートシステムとの統合

コンテキスト付きのインテリジェントアラートとノイズ抑制を送信する。

```python
# aiops/intelligent_alerting.py
import requests
import logging
from typing import Dict, List
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 高重大度インシデントがPagerDutyページをトリガーし、中重大度はSlackに送信され、低重大度はログのみ、15分ウィンドウ内で重複アラートが抑制される。

**失敗時:** まずcurlでWebhook URLをテスト、重大度計算が妥当な値を生成するか確認（0.5〜0.9の範囲）、レート制限がすべてのアラートを抑制していないか確認、last_alerts追跡のタイムゾーン処理が正しいことを確認。

### ステップ6: 継続的モニタリングサービスとしてのデプロイ

定期的に実行される自動化パイプラインをセットアップする。

```python
# aiops/monitoring_service.py
import schedule
import time
import logging
from datetime import datetime, timedelta
from data_loader import MetricsDataLoader
from isolation_forest_detector import IsolationForestDetector
from prophet_detector import ProphetAnomalyDetector
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** サービスが継続的に実行され、5分ごとに異常を検知し、インシデントに対してアラートが送信され、すべてのアクティビティがログされる。

**失敗時:** スケジューラプロセスが生き続けることを確認（本番ではsystemd/supervisorを使用）、Prometheus接続性を確認、モデルが正常にロードされることを確認、サービスが停止した場合のデッドマンスイッチアラートを実装、メモリ使用量を監視（メモリが増加する場合はモデルを定期的にリロード）。

## バリデーション

- [ ] 過去データがタイムスタンプの欠落なく正しくロードされている
- [ ] Isolation Forestがテストセットの既知の異常を検知する
- [ ] Prophetモデルが可視化で日次/週次の季節性を捕捉する
- [ ] アラート相関が時間的に関連する異常をグループ化する
- [ ] 根本原因検知が上流の問題を正しく特定する
- [ ] インテリジェントアラートが重複アラートを抑制する
- [ ] 重大度計算が妥当なスコアを生成する（0.5〜0.9）
- [ ] モニタリングサービスが7日以上クラッシュなく継続的に実行される
- [ ] 偽陽性率が10%未満（ラベル付きデータで検証）
- [ ] 重大インシデントの真陽性率が80%以上

## よくある落とし穴

- **異常データでの学習**: 学習に使用するベースライン期間がクリーン（インシデントなし）であることを確認する。手動でレビューするかラベル付きデータを使用する
- **季節性の無視**: 静的モデルは日次/週次パターンで失敗する。Prophetを使用するか時間特徴量を追加する
- **閾値が敏感すぎる**: 99%信頼区間が通常のピークをフラグする可能性がある。99.5%から始めて偽陽性に基づいて調整する
- **欠損データの未処理**: メトリクスのギャップがモデルエラーを引き起こす。補間を含む堅牢な前処理を実装する
- **低重大度のアラート疲労**: 重大度閾値以下のアラートをフィルタリングする。高信頼度の異常に焦点を当てる
- **システムトポロジーの無視**: すべてのメトリクスを独立に扱うとカスケード障害を見逃す。依存関係を定義する
- **モデルドリフト**: 古いデータで学習されたモデルは陳腐化する。月次またはシステム変更時に再学習する
- **リソース競合**: すべてのメトリクスで検知を実行するのは高コスト。重要なサービスを優先するかメトリクスをサンプリングする

## 関連スキル

- `monitor-model-drift` -- 異常検知モデルの劣化を検知する
- `monitor-data-integrity` -- 異常検知前のデータ品質チェック
- `setup-prometheus-monitoring` -- 運用メトリクスを収集する
- `forecast-operational-metrics` -- Prophet予測によるキャパシティプランニング
