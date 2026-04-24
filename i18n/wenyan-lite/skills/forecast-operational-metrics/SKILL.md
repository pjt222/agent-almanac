---
name: forecast-operational-metrics
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Forecast infrastructure and application metrics using Prophet or statsmodels for capacity
  planning, cost optimization, and proactive scaling. Visualize predictions in Grafana and
  set up alerts for projected resource exhaustion. Use when forecasting infrastructure
  capacity needs for CPU, memory, or disk, planning hardware procurement for next quarter,
  predicting cost trends to optimize cloud spending, or setting up proactive scaling policies
  based on predicted load.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: forecasting, prophet, statsmodels, capacity, time-series, grafana
---

# 預運營指標

以 Prophet 或 statsmodels 預基礎設施與應用之指標，供容量規劃、成本優化與主動擴展。於 Grafana 示預測並設告警於所預之資源耗盡。

> 見 [擴展範例](references/EXAMPLES.md) 查完整配置文件與模板。

## 適用時機

- 需預基礎設施容量之需（CPU、記憶體、盤、網）
- 為下季規劃硬體/雲資源採購
- 欲預成本趨並優化雲支出
- 需基於所預負載設主動擴展策
- 為活動規劃預使用者流量
- 為備份規劃預資料庫存儲增長
- 為速限配置估 API 使用

## 輸入

- **必要**：歷史時序指標（至少 3-12 月）
- **必要**：指標類（CPU、記憶體、req/秒、成本等）
- **必要**：預範圍（日、週或月後）
- **選擇性**：已知之未來事件（部署、營銷活動、假日）
- **選擇性**：季節性信息（日、週、年模式）
- **選擇性**：外部回歸（如營銷支出、使用者註冊）

## 步驟

### 步驟一：設環境並載數據

裝預函式庫並備時序數據。

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

以 MetricsLoader 載並備數據：

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

見 [EXAMPLES.md Step 1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class) 查完整之 MetricsLoader 實作。

**預期：** 時序數據已載於規則間隔，缺值已填，備以預。

**失敗時：** 若數據缺，用 forward-fill 或插值；確回溯期足（建議 90+ 日）；驗時戳時區一致；察或偏預之離群（>5 sigma）。

### 步驟二：行 Prophet 預

用 Facebook Prophet 以自動偵季節性並預。

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

見 [EXAMPLES.md Step 2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class) 查完整之 ProphetForecaster 實作。

**預期：** 為 30+ 日生含信區間之預測，於組件圖捕季節模式，交叉驗證 MAPE < 15%。

**失敗時：** 若預測似不實，試異生長模型（線性 vs 邏輯）；若缺季節性調 seasonality_mode；若準度差（<70% MAPE）加更多歷史數據或外部回歸；察數據品質問題。

### 步驟三：行 ARIMA/SARIMAX 預（替）

用 statsmodels 行傳統時序預。

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

見 [EXAMPLES.md Step 3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class) 查完整之 ARIMAForecaster 實作與 auto_arima 函數。

**預期：** ARIMA 模型以最優參擬，生含信區間之預，診圖示白噪殘差。

**失敗時：** 若模型不收，簡參（減 p、q、P、Q）；若預有誤趨察差分階（d、D）；若殘差非白噪加更多 AR/MA 項；確序長 >2x 季節期。

### 步驟四：識容量閾與告警

析預以預資源何時耗盡。

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

見 [EXAMPLES.md Step 4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class) 查完整之 CapacityPlanner 實作。

**預期：** 報告示容量限將達之時、予帶急度之建議、算增長率。

**失敗時：** 若耗盡日不實，驗 capacity_limit 正；若增長率過高察歷史數據之離群；於成熟系統考非線性增長模型。

### 步驟五：於 Grafana 示預

推預數據至 Grafana 以供實時監。

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

見 [EXAMPLES.md Step 5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class) 查完整之 GrafanaForecaster 實作。

**預期：** 預註見於 Grafana 儀表板，容量警以直標示可見，預數據藉 CSV datasource 可得。

**失敗時：** 驗 Grafana API key 有正權限；察 dashboard UID 正；確註之時戳為毫秒；整合前以 curl 測 API。

### 步驟六：自動化預生

設定期工以規律生預。

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

見 [EXAMPLES.md Step 6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation) 查完整之 scheduler 實作。

**預期：** 預每日生於所有指標，容量報告已記，CSV 檔已匯出供 Grafana，關鍵容量警告已送。

**失敗時：** 驗 scheduler 進程續行（用 systemd/supervisor）；察 Prometheus 連通；確盤空足以匯預；為瞬時敗行重試；為 scheduler 自身設監。

## 驗證

- [ ] 歷史數據已載，有 90+ 日連續指標
- [ ] Prophet 預於組件圖捕日/週季節性
- [ ] 於驗證中預信區間含 85-95% 之實值
- [ ] 於已知情境容量耗盡日正算
- [ ] 於診圖 ARIMA 模型殘差顯為白噪
- [ ] Grafana 註於所預之警/耗盡日顯
- [ ] 自動預每日無手介入而行
- [ ] 於驗證集預準（MAPE）< 15%

## 常見陷阱

- **歷史數據不足**：需 3-12 月以可靠偵季節性；勿以 <60 日預
- **忽已知事件**：假日、部署、營銷活動偏預；加為外部回歸或假日
- **長期預之過信**：準度於 30-90 日後降；以為方向導，非準預
- **靜容量限**：基礎設施隨時變；加資源時更 capacity_limit
- **預異常**：訓數據中離群傳於預；清數據或用穩健法
- **不更模型**：系統變後預陳；每週或重大架構變後重訓
- **忽信區間**：點預誤導；恒用下/上界供規劃
- **誤季節期**：時數據用日、日數據用週；不配致差預

## 相關技能

- `detect-anomalies-aiops` - 異常偵輔預以主動監
- `plan-capacity` - 基礎設施容量規劃工作流
- `build-grafana-dashboards` - 示預與容量趨
