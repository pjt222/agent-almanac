---
name: forecast-operational-metrics
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# Forecast Operational Metrics

Predict future resource usage and system metrics for capacity planning and cost optimization.

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

## When to Use

- Need to forecast infrastructure capacity needs (CPU, memory, disk, network)
- Planning hardware/cloud resource procurement for next quarter
- Want to predict cost trends and optimize cloud spending
- Need to set up proactive scaling policies based on predicted load
- Forecasting user traffic for event planning
- Predicting database storage growth for backup planning
- Estimating API usage for rate limiting configuration

## Inputs

- **Required**: Historical time series metrics (3-12 months minimum)
- **Required**: Metric type (CPU, memory, requests/sec, costs, etc.)
- **Required**: Forecast horizon (days, weeks, or months ahead)
- **Optional**: Known future events (deployments, marketing campaigns, holidays)
- **Optional**: Seasonality information (daily, weekly, yearly patterns)
- **Optional**: External regressors (e.g., marketing spend, user signups)

## Procedure

### Step 1: Set Up Environment and Load Data

Install forecasting libraries and prepare time series data.

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

Load and prepare data with MetricsLoader:

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

See [EXAMPLES.md Step 1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class) for the complete MetricsLoader implementation.

**Expected:** Time series data loaded with regular intervals, missing values filled, ready for forecasting.

**On failure:** If data gaps exist, use forward-fill or interpolation, ensure lookback period has sufficient data (90+ days recommended), verify timestamp timezone consistency, check for outliers (>5 sigma) that may skew forecasts.

### Step 2: Implement Prophet Forecasting

Use Facebook Prophet for automatic seasonality detection and forecasting.

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

See [EXAMPLES.md Step 2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class) for the complete ProphetForecaster implementation.

**Expected:** Forecast generated for 30+ days ahead with confidence intervals, seasonal patterns captured in components plot, cross-validation MAPE < 15%.

**On failure:** If forecast looks unrealistic, try different growth model (linear vs logistic), if seasonality missing adjust seasonality_mode, if accuracy poor (<70% MAPE) add more historical data or external regressors, check for data quality issues.

### Step 3: Implement ARIMA/SARIMAX Forecasting (Alternative)

Use statsmodels for traditional time series forecasting.

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

See [EXAMPLES.md Step 3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class) for the complete ARIMAForecaster implementation and auto_arima function.

**Expected:** ARIMA model fitted with optimal parameters, forecast generated with confidence intervals, diagnostic plots show white noise residuals.

**On failure:** If model doesn't converge, simplify parameters (reduce p, q, P, Q), if forecast has wrong trend check differencing order (d, D), if residuals not white noise add more AR/MA terms, ensure series length >2x seasonal period.

### Step 4: Identify Capacity Thresholds and Alerts

Analyze forecast to predict when resources will be exhausted.

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

See [EXAMPLES.md Step 4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class) for the complete CapacityPlanner implementation.

**Expected:** Report shows when capacity limits will be reached, recommendations provided with urgency levels, growth rates calculated.

**On failure:** If exhaustion date unrealistic, verify capacity_limit is correct, if growth rate too high check for outliers in historical data, consider non-linear growth models for mature systems.

### Step 5: Visualize Forecasts in Grafana

Push forecast data to Grafana for real-time monitoring.

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

See [EXAMPLES.md Step 5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class) for the complete GrafanaForecaster implementation.

**Expected:** Forecast annotations appear in Grafana dashboards, capacity warnings visible as vertical markers, forecast data accessible via CSV datasource.

**On failure:** Verify Grafana API key has correct permissions, check dashboard UID is correct, ensure timestamps in milliseconds for annotations, test API with curl before integrating.

### Step 6: Automate Forecast Generation

Set up scheduled jobs to generate forecasts regularly.

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

See [EXAMPLES.md Step 6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation) for the complete scheduler implementation.

**Expected:** Forecasts generated daily for all metrics, capacity reports logged, CSV files exported for Grafana, alerts sent for critical capacity warnings.

**On failure:** Verify scheduler process runs continuously (use systemd/supervisor), check Prometheus connectivity, ensure sufficient disk space for forecast exports, implement retry logic for transient failures, set up monitoring for scheduler itself.

## Validation

- [ ] Historical data loaded with 90+ days of continuous metrics
- [ ] Prophet forecast captures daily/weekly seasonality in components plot
- [ ] Forecast confidence intervals contain 85-95% of actual values in validation
- [ ] Capacity exhaustion dates calculated correctly for known scenarios
- [ ] ARIMA model residuals appear as white noise in diagnostic plots
- [ ] Grafana annotations appear at predicted warning/exhaustion dates
- [ ] Automated forecasting runs daily without manual intervention
- [ ] Forecast accuracy (MAPE) < 15% on validation set

## Common Pitfalls

- **Insufficient historical data**: Need 3-12 months for reliable seasonality detection; avoid forecasting with <60 days
- **Ignoring known events**: Holidays, deployments, marketing campaigns skew forecasts; add as external regressors or holidays
- **Overconfidence in long-term forecasts**: Accuracy degrades beyond 30-90 days; use as directional guidance, not exact predictions
- **Static capacity limits**: Infrastructure changes over time; update capacity_limit when adding resources
- **Forecasting anomalies**: Outliers in training data propagate to forecast; clean data or use robust methods
- **Not updating models**: Forecasts stale after system changes; retrain weekly or after significant architecture changes
- **Ignoring confidence intervals**: Point forecasts misleading; always use lower/upper bounds for planning
- **Wrong seasonality period**: Daily for hourly data, weekly for daily data; mismatch causes poor forecasts

## Related Skills

- `detect-anomalies-aiops` - Anomaly detection complements forecasting for proactive monitoring
- `plan-capacity` - Infrastructure capacity planning workflows
- `build-grafana-dashboards` - Visualize forecasts and capacity trends
