---
name: forecast-operational-metrics
description: >
  キャパシティプランニング、コスト最適化、プロアクティブなスケーリングのためにProphetまたは
  statsmodelsを使用してインフラおよびアプリケーションメトリクスを予測する。Grafanaで予測を
  可視化し、予測されるリソース枯渇のアラートを設定する。インフラキャパシティ需要（CPU、
  メモリ、ディスク）の予測時、次の四半期のハードウェア調達計画時、コストトレンドの予測に
  よるクラウド支出最適化時、または予測負荷に基づくプロアクティブなスケーリングポリシー
  設定時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: forecasting, prophet, statsmodels, capacity, time-series, grafana
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 運用メトリクスの予測

キャパシティプランニングとコスト最適化のために将来のリソース使用量とシステムメトリクスを予測する。

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

## 使用タイミング

- インフラキャパシティ需要（CPU、メモリ、ディスク、ネットワーク）を予測する必要がある時
- 次の四半期のハードウェア/クラウドリソース調達を計画する時
- コストトレンドを予測してクラウド支出を最適化したい時
- 予測負荷に基づくプロアクティブなスケーリングポリシーを設定する必要がある時
- イベント計画のためのユーザートラフィック予測時
- バックアップ計画のためのデータベースストレージ成長予測時
- レート制限設定のためのAPI使用量推定時

## 入力

- **必須**: 過去の時系列メトリクス（最低3〜12ヶ月）
- **必須**: メトリクスタイプ（CPU、メモリ、リクエスト/秒、コストなど）
- **必須**: 予測期間（日、週、または月先）
- **任意**: 既知の将来イベント（デプロイメント、マーケティングキャンペーン、祝日）
- **任意**: 季節性情報（日次、週次、年次パターン）
- **任意**: 外部リグレッサー（例：マーケティング支出、ユーザー登録数）

## 手順

### ステップ1: 環境セットアップとデータロード

予測ライブラリをインストールし、時系列データを準備する。

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install forecasting libraries
pip install prophet statsmodels pandas numpy
pip install plotly matplotlib seaborn
pip install prometheus-api-client influxdb-client
pip install grafana-api
```

MetricsLoaderでデータをロードし準備する：

```python
# forecasting/data_loader.py (abbreviated)
import pandas as pd
from datetime import datetime, timedelta

class MetricsLoader:
    def load_from_prometheus(self, query: str, lookback_days: int = 90, step: str = "1h"):
        """Load historical metrics from Prometheus."""
        # ... implementation (see EXAMPLES.md for complete code)

    def resample_and_aggregate(self, df: pd.DataFrame, freq: str = "1H"):
        """Resample time series to regular intervals."""
        # ... implementation (see EXAMPLES.md)

# Example usage
loader = MetricsLoader(prometheus_url="http://prometheus:9090")
df = loader.load_from_prometheus(
    query='avg(rate(container_cpu_usage_seconds_total[5m]))',
    lookback_days=90,
)
df_daily = loader.resample_and_aggregate(df, freq="1D")
```

完全なMetricsLoader実装については[EXAMPLES.md ステップ1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class)を参照。

**期待結果:** 定期的な間隔で時系列データがロードされ、欠損値が補完され、予測の準備ができている。

**失敗時:** データギャップがある場合は前方フィルまたは補間を使用、ルックバック期間に十分なデータがあることを確認（90日以上推奨）、タイムスタンプのタイムゾーン一貫性を確認、予測を歪める外れ値（5シグマ超）を確認。

### ステップ2: Prophet予測の実装

Facebook Prophetを使用して自動的な季節性検出と予測を行う。

```python
# forecasting/prophet_forecaster.py (abbreviated)
from prophet import Prophet

class ProphetForecaster:
    def __init__(self, growth: str = "linear", seasonality_mode: str = "multiplicative"):
        self.growth = growth
        self.prophet_params = {
            "growth": growth,
            "seasonality_mode": seasonality_mode,
            # ... additional parameters (see EXAMPLES.md)
        }

    def fit(self, df: pd.DataFrame, regressors=None, holidays=None):
        """Train Prophet model on historical data."""
        # ... implementation (see EXAMPLES.md)

    def forecast(self, periods: int, freq: str = "D"):
        """Generate forecast for future periods."""
        # ... implementation (see EXAMPLES.md)

# Example usage
forecaster = ProphetForecaster(growth="linear", seasonality_mode="multiplicative")
forecaster.fit(df_daily)
forecast = forecaster.forecast(periods=30, freq="D")
forecaster.plot_forecast(forecast, save_path="results/cpu_forecast.png")
```

完全なProphetForecaster実装については[EXAMPLES.md ステップ2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class)を参照。

**期待結果:** 信頼区間付きの30日以上先の予測が生成され、コンポーネントプロットで季節パターンが捕捉され、交差検証MAPE < 15%。

**失敗時:** 予測が非現実的に見える場合は異なる成長モデル（linear vs logistic）を試す、季節性が欠如する場合はseasonality_modeを調整、精度が低い場合（MAPE 70%超）はより多くの過去データまたは外部リグレッサーを追加、データ品質の問題を確認。

### ステップ3: ARIMA/SARIMAX予測の実装（代替）

statsmodelsを使用した伝統的な時系列予測。

```python
# forecasting/arima_forecaster.py (abbreviated)
from statsmodels.tsa.statespace.sarimax import SARIMAX

class ARIMAForecaster:
    def __init__(self, order: tuple = (1, 1, 1), seasonal_order: tuple = (1, 1, 1, 7)):
        self.order = order
        self.seasonal_order = seasonal_order

    def fit(self, df: pd.DataFrame, exog=None):
        """Train SARIMAX model."""
        series = df.set_index("timestamp")["value"]
        self.model = SARIMAX(series, exog=exog, order=self.order, seasonal_order=self.seasonal_order)
        self.fitted_model = self.model.fit(disp=False)
        # ... implementation (see EXAMPLES.md)

    def forecast(self, steps: int, exog_future=None):
        """Generate forecast for future periods."""
        # ... implementation (see EXAMPLES.md)

# Auto-select parameters
best_order, best_seasonal = auto_arima(series, seasonal=True)
forecaster = ARIMAForecaster(order=best_order, seasonal_order=best_seasonal)
forecaster.fit(df_hourly)
forecast = forecaster.forecast(steps=168)  # 7 days
```

完全なARIMAForecaster実装とauto_arima関数については[EXAMPLES.md ステップ3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class)を参照。

**期待結果:** 最適パラメータで適合したARIMAモデル、信頼区間付き予測が生成、診断プロットがホワイトノイズ残差を示す。

**失敗時:** モデルが収束しない場合はパラメータを簡約化（p, q, P, Qを減らす）、予測のトレンドが誤っている場合は差分次数（d, D）を確認、残差がホワイトノイズでない場合はAR/MA項を追加、系列長が季節周期の2倍以上であることを確認。

### ステップ4: キャパシティ閾値とアラートの特定

リソース枯渇時期を予測するために予測を分析する。

```python
# forecasting/capacity_planning.py (abbreviated)
from datetime import datetime

class CapacityPlanner:
    def __init__(self, capacity_limit: float, warning_threshold: float = 0.8):
        self.capacity_limit = capacity_limit
        self.warning_threshold = warning_threshold

    def find_exhaustion_date(self, forecast: pd.DataFrame):
        """Find when forecast exceeds capacity limit."""
        exceeded = forecast[forecast["yhat"] >= self.capacity_limit]
        # ... implementation (see EXAMPLES.md)

    def generate_capacity_report(self, forecast: pd.DataFrame):
        """Generate comprehensive capacity planning report."""
        # ... implementation (see EXAMPLES.md)

# Example usage
planner = CapacityPlanner(capacity_limit=1000, warning_threshold=0.8)
report = planner.generate_capacity_report(forecast)
print(f"Warning Date: {report['warning_date']}")
print(f"Exhaustion Date: {report['exhaustion_date']}")
recommendation = planner.recommend_scaling_action(report)
```

完全なCapacityPlanner実装については[EXAMPLES.md ステップ4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class)を参照。

**期待結果:** キャパシティ制限に達する時期を示すレポート、緊急度レベル付きの推奨事項、成長率が計算されている。

**失敗時:** 枯渇日が非現実的な場合はcapacity_limitが正しいことを確認、成長率が高すぎる場合は過去データの外れ値を確認、成熟システムには非線形成長モデルを検討。

### ステップ5: Grafanaでの予測可視化

リアルタイムモニタリングのために予測データをGrafanaにプッシュする。

```python
# forecasting/grafana_integration.py (abbreviated)
import requests

class GrafanaForecaster:
    def __init__(self, grafana_url: str, api_key: str, dashboard_uid: str = None):
        self.grafana_url = grafana_url.rstrip("/")
        self.api_key = api_key
        self.dashboard_uid = dashboard_uid

    def create_annotation(self, text: str, tags: list, time: datetime = None):
        """Create annotation in Grafana for forecast events."""
        # ... implementation (see EXAMPLES.md)

    def create_capacity_alert_annotation(self, capacity_report: dict):
        """Create Grafana annotation for capacity warnings."""
        # ... implementation (see EXAMPLES.md)

# Export to CSV for Grafana datasource
def export_forecast_to_csv(forecast: pd.DataFrame, output_path: str):
    """Export forecast in format compatible with Grafana CSV datasource."""
    # ... implementation (see EXAMPLES.md)

# Example usage
grafana = GrafanaForecaster(
    grafana_url="http://grafana:3000",
    api_key="YOUR_API_KEY",
    dashboard_uid="your-dashboard-uid",
)
grafana.create_capacity_alert_annotation(report)
export_forecast_to_csv(forecast, "grafana/forecasts/cpu_forecast.csv")
```

完全なGrafanaForecaster実装については[EXAMPLES.md ステップ5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class)を参照。

**期待結果:** Grafanaダッシュボードに予測アノテーションが表示され、キャパシティ警告が垂直マーカーとして可視、CSVデータソース経由で予測データにアクセス可能。

**失敗時:** Grafana APIキーに正しい権限があることを確認、ダッシュボードUIDが正しいことを確認、アノテーションのタイムスタンプがミリ秒であることを確認、統合前にcurlでAPIをテスト。

### ステップ6: 予測生成の自動化

定期的に予測を生成するスケジュールジョブを設定する。

```python
# forecasting/scheduler.py (abbreviated)
import schedule
import time

def generate_daily_forecast():
    """Generate forecast for all monitored metrics."""
    logger.info("Starting daily forecast generation")

    metrics_config = [
        {"name": "cpu_usage", "query": "...", "capacity_limit": 0.8, "forecast_days": 30},
        {"name": "memory_usage", "query": "...", "capacity_limit": 32, "forecast_days": 30},
        {"name": "disk_usage", "query": "...", "capacity_limit": 500, "forecast_days": 90},
    ]

    loader = MetricsLoader(prometheus_url="http://prometheus:9090")

    for metric_config in metrics_config:
        df = loader.load_from_prometheus(query=metric_config["query"], lookback_days=90)
        forecaster = ProphetForecaster()
        forecaster.fit(df)
        forecast = forecaster.forecast(periods=metric_config["forecast_days"])

        planner = CapacityPlanner(capacity_limit=metric_config["capacity_limit"])
        report = planner.generate_capacity_report(forecast)

        export_forecast_to_csv(forecast, f"grafana/forecasts/{metric_config['name']}_forecast.csv")
        # ... (see EXAMPLES.md for complete implementation)

# Schedule daily at 2 AM
schedule.every().day.at("02:00").do(generate_daily_forecast)

while True:
    schedule.run_pending()
    time.sleep(60)
```

完全なスケジューラ実装については[EXAMPLES.md ステップ6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation)を参照。

**期待結果:** すべてのメトリクスについて予測が毎日生成され、キャパシティレポートがログされ、CSVファイルがGrafana用にエクスポートされ、重大なキャパシティ警告にアラートが送信される。

**失敗時:** スケジューラプロセスが継続的に実行されることを確認（systemd/supervisorを使用）、Prometheus接続性を確認、予測エクスポートの十分なディスク容量を確認、一時的障害のリトライロジックを実装、スケジューラ自体のモニタリングを設定。

## バリデーション

- [ ] 90日以上の連続メトリクスで過去データがロードされている
- [ ] Prophet予測がコンポーネントプロットで日次/週次の季節性を捕捉
- [ ] 予測の信頼区間がバリデーションで実測値の85-95%を含む
- [ ] 既知のシナリオでキャパシティ枯渇日が正しく計算されている
- [ ] ARIMAモデルの残差が診断プロットでホワイトノイズとして表示される
- [ ] 予測された警告/枯渇日にGrafanaアノテーションが表示される
- [ ] 自動予測が手動介入なしで毎日実行される
- [ ] バリデーションセットでの予測精度（MAPE）< 15%

## よくある落とし穴

- **過去データの不足**: 信頼できる季節性検出には3〜12ヶ月が必要；60日未満での予測を避ける
- **既知イベントの無視**: 祝日、デプロイメント、マーケティングキャンペーンが予測を歪める；外部リグレッサーまたはholidaysとして追加する
- **長期予測への過信**: 30〜90日を超えると精度が低下する；正確な予測ではなく方向性のガイダンスとして使用する
- **静的なキャパシティ制限**: インフラは時間とともに変化する；リソース追加時にcapacity_limitを更新する
- **異常値の予測**: 学習データの外れ値が予測に伝播する；データをクリーニングするかロバストな方法を使用する
- **モデルの未更新**: システム変更後に予測が陳腐化する；週次または重大なアーキテクチャ変更後に再学習する
- **信頼区間の無視**: ポイント予測は誤解を招く；計画には常に下限/上限を使用する
- **間違った季節性周期**: 時間データには日次、日次データには週次；不一致は予測不良を引き起こす

## 関連スキル

- `detect-anomalies-aiops` - 異常検知がプロアクティブなモニタリングのために予測を補完する
- `plan-capacity` - インフラキャパシティプランニングのワークフロー
- `build-grafana-dashboards` - 予測とキャパシティトレンドの可視化
