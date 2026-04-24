---
name: forecast-operational-metrics
locale: wenyan-ultra
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

# 預營指

預來資用與系指以謀容與優費。

> 見 [Extended Examples](references/EXAMPLES.md) 備全設與模。

## 用

- 預基容求（CPU、記、碟、網）
- 為下季謀硬/雲資購
- 欲預費軌以優雲費
- 須依預載設先動擴策
- 預用者流以謀事
- 預庫存長以備份
- 估 API 用以設速限

## 入

- **必**：歷時序指（最少 3-12 月）
- **必**：指類（CPU、記、請求/秒、費等）
- **必**：預域（前 N 日、週、或月）
- **可**：已知來事（布、廣、假）
- **可**：季信（日、週、年模）
- **可**：外回歸（如廣費、用註冊）

## 行

### 一：設環境並載數

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

以 MetricsLoader 載並備：

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

全 MetricsLoader 實現見 [EXAMPLES.md Step 1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class)。

得：時序數以規隔載、缺值已填、備供預。

敗：數有隙→用前填或插值；確回期有足數（建 90+ 日）；驗時戳時區一致；察偏歪預之離群（>5 sigma）。

### 二：施 Prophet 預

用 Facebook Prophet 自動察季並預。

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

全 ProphetForecaster 實現見 [EXAMPLES.md Step 2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class)。

得：前 30+ 日預含信區已生、季模於件圖捕、交驗 MAPE < 15%。

敗：預不實→試異長模（線對邏）；季缺→調 seasonality_mode；準劣（<70% MAPE）→加歷數或外回歸，察數質議。

### 三：施 ARIMA/SARIMAX 預（替）

用 statsmodels 傳時序預。

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

全 ARIMAForecaster 實現與 auto_arima 函見 [EXAMPLES.md Step 3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class)。

得：ARIMA 模以最優參擬、預含信區生、診圖示白噪殘。

敗：模不收→簡參（減 p、q、P、Q）；預軌誤→察差階（d、D）；殘非白噪→加 AR/MA 項；確序長 >2x 季週。

### 四：識容門與警

析預以知資何時竭。

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

全 CapacityPlanner 實現見 [EXAMPLES.md Step 4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class)。

得：報示容限達時、建含急度、長率已算。

敗：竭日不實→驗 capacity_limit 正；長率過高→察歷數離群；熟系考非線長模。

### 五：於 Grafana 視預

推預數於 Grafana 以實時監。

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

全 GrafanaForecaster 實現見 [EXAMPLES.md Step 5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class)。

得：預注現於 Grafana 儀表、容警見為直標、預數經 CSV 源可取。

敗：驗 Grafana API 鑰權正；察儀 UID 正；確注時戳為毫秒；與管合前以 curl 試 API。

### 六：自動生預

設表作常生預。

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

全表作實現見 [EXAMPLES.md Step 6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation)。

得：諸指預日生、容報已記、CSV 為 Grafana 出、要容警已發。

敗：驗表作續運（用 systemd/supervisor）；察 Prometheus 連；確碟足空為預出；施暫敗重試；設監於表作本身。

## 驗

- [ ] 歷數含 90+ 日續指已載
- [ ] Prophet 預於件圖捕日/週季
- [ ] 預信區於驗含 85-95% 實值
- [ ] 已知景之容竭日算正
- [ ] ARIMA 模殘於診圖似白噪
- [ ] Grafana 注現於預警/竭日
- [ ] 自動預日運無須人干
- [ ] 預準（MAPE）於驗集 <15%

## 忌

- **歷數不足**：3-12 月方可信季察；<60 日勿預
- **忽已知事**：假、布、廣歪預；加為外回歸或假
- **長期預過信**：>30-90 日準降；為向導非精預
- **容限靜**：基設隨時變；加資源時更 capacity_limit
- **異常預**：訓數離群傳於預；清數或用穩法
- **不更模**：系變後預舊；週重訓或大架變後重訓
- **忽信區**：點預誤導；謀恒用上下界
- **錯季週**：時數用日、日數用週；錯致預劣

## 參

- `detect-anomalies-aiops` - 異察補預供先動監
- `plan-capacity` - 基容謀流
- `build-grafana-dashboards` - 視預與容軌
