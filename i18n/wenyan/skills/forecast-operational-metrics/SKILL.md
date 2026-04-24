---
name: forecast-operational-metrics
locale: wenyan
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

# 預運指

用 Prophet 或 statsmodels 預基設與應指以謀容、優費、主擴。

> 詳見 [Extended Examples](references/EXAMPLES.md) 全配置與模板。

## 用時

- 須預基設容需（CPU、記憶、盤、網）
- 為下季謀硬/雲資購
- 欲預費勢以優雲支
- 須按預載設主擴策
- 為事預用戶流
- 為備謀預庫儲長
- 為速限配估 API 用

## 入

- **必要**：歷時序指（最少三至十二月）
- **必要**：指類（CPU、記、請/秒、費等）
- **必要**：預程（日、週、或月前）
- **可選**：知未來事（部署、市宣、假）
- **可選**：季信（日、週、年模）
- **可選**：外回歸（如市支、用戶註）

## 法

### 第一步：設環並載數

裝預庫並備時序數。

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

以 MetricsLoader 載並備數：

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

見 [EXAMPLES.md Step 1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class) 全 MetricsLoader。

**得：** 時序數以正隔載，缺值填，可預。

**敗則：** 若數有隙，用前填或插值；確回看期有足數（薦 90+ 日）；驗時戳時區一致；察可歪預之異（>5 sigma）。

### 第二步：施 Prophet 預

用 Facebook Prophet 作自動季察與預。

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

見 [EXAMPLES.md Step 2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class) 全 ProphetForecaster。

**得：** 三十日以上預附可信區，季模於部圖捕，交叉驗證 MAPE < 15%。

**敗則：** 若預不實，試異長模（線對邏）；若缺季，調 seasonality_mode；若準差（<70% MAPE），加更多史數或外回歸；察數質。

### 第三步：施 ARIMA/SARIMAX 預（替）

用 statsmodels 作傳時序預。

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

見 [EXAMPLES.md Step 3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class) 全 ARIMAForecaster 與 auto_arima。

**得：** ARIMA 模以最佳參擬，預生附可信區，診圖示殘為白噪。

**敗則：** 若模不收斂，簡參（減 p、q、P、Q）；若預勢誤，察差分階（d、D）；若殘非白噪，加更多 AR/MA 項；確序長 >2x 季期。

### 第四步：識容閾與警

析預以測資何時竭。

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

見 [EXAMPLES.md Step 4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class) 全 CapacityPlanner。

**得：** 報示容限何時達，薦附急級，長率算。

**敗則：** 若竭日不實，驗 capacity_limit 正；若長率過高，察史數異；於熟系考非線長模。

### 第五步：於 Grafana 視預

推預數至 Grafana 供實時監。

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

見 [EXAMPLES.md Step 5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class) 全 GrafanaForecaster。

**得：** 預注現於 Grafana 面板，容警為豎標，預數可經 CSV 源達。

**敗則：** 驗 Grafana API 鑰有正權；察面板 UID 正；確時戳於注為毫秒；接前以 curl 試 API。

### 第六步：自動預生

設定時業常規生預。

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

見 [EXAMPLES.md Step 6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation) 全調度。

**得：** 諸指預日生，容報記，CSV 出供 Grafana，重容警發。

**敗則：** 驗調度程續運（用 systemd/supervisor）；察 Prometheus 通；確預出盤空足；於暫敗施重試邏；於調度本設監。

## 驗

- [ ] 史數載附 90+ 日連指
- [ ] Prophet 預於部圖捕日/週季
- [ ] 預可信區驗時含 85-95% 實值
- [ ] 於知景容竭日算正
- [ ] ARIMA 殘於診圖現如白噪
- [ ] Grafana 注現於預警/竭日
- [ ] 自動預日運無手涉
- [ ] 驗集預準（MAPE）< 15%

## 陷

- **史數不足**：可靠季察需三至十二月；勿以 <60 日預
- **略知事**：假、部署、市宣歪預；加為外回歸或假
- **長程預過信**：30-90 日後準衰；為向導，非確預
- **靜容限**：基設隨時易；加資時更 capacity_limit
- **異值預**：訓數之異傳入預；清數或用穩法
- **不更模**：系改後預陳；週訓或於大架改後重訓
- **略可信區**：點預誤導；恆用下/上界供謀
- **誤季期**：時數用日、日數用週；失配致差預

## 參

- `detect-anomalies-aiops` - 異察補預以主監
- `plan-capacity` - 基設容謀流
- `build-grafana-dashboards` - 視預與容勢
