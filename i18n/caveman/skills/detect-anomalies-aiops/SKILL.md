---
name: detect-anomalies-aiops
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement AI-powered anomaly detection for operational metrics using time series analysis
  (Isolation Forest, Prophet, LSTM), alert correlation, and root cause analysis. Reduce
  alert fatigue by intelligently identifying true anomalies in system metrics, logs, and traces.
  Use when operations teams are overwhelmed by alert volume, when detecting complex multi-metric
  anomalies beyond static thresholds, when seasonal patterns make thresholds ineffective, or
  when needing to predict issues proactively before they impact users.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: aiops, anomaly-detection, isolation-forest, prophet, alert-correlation, time-series
---

# Detect Anomalies for AIOps


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Apply ML to find anomalies in operational metrics. Correlate alerts, cut false positives.

## When Use

- Ops team drowning in alerts (>100/day)
- Need to detect complex multi-metric anomalies (not just threshold breaches)
- Seasonal patterns make static thresholds useless
- Want to predict issues before they hit users (proactive detection)
- Need to correlate related alerts → root cause
- Monitoring creates too many false positives
- Want to spot subtle perf degradation trends

## Inputs

- **Required**: Time series metrics from monitoring (CPU, memory, latency, error rate)
- **Required**: Historical data (30-90 days min)
- **Optional**: Alert history with labels (true positive / false positive)
- **Optional**: System topology (service deps)
- **Optional**: Log data for correlation
- **Optional**: Deploy/change events for context

## Steps

### Step 1: Set Up Environment + Load Data

Install deps. Prep time series data.

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

Load + prep data:

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

**Got:** Time series loaded, regular intervals, missing values handled, features engineered for ML.

**If fail:** Prometheus connection fails? Check URL + network. Data gaps? Forward-fill or interpolate. Timestamp column must be datetime. Memory issues with big date ranges? Process in chunks.

### Step 2: Impl Isolation Forest for Multivariate Anomaly Detection

Unsupervised Isolation Forest finds anomalies.

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

**Got:** Model trained on historical data. Anomalies detected with scores. Usually 0.5-2% of points flagged.

**If fail:** Too many anomalies (>5%)? Reduce contamination or retrain on cleaner baseline. Too few (<0.1%)? Increase contamination or check feature scaling. Features need variance.

### Step 3: Impl Prophet for Time Series Forecasting + Anomaly Detection

Facebook Prophet models seasonality, finds deviations.

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

**Got:** Prophet models capture daily/weekly seasonality. Anomalies flagged when actual outside 99% CI. Forecasts for capacity planning.

**If fail:** Prophet too slow (>5 min per metric)? Cut history to 30 days or disable weekly_seasonality. Too many false positives? Raise interval_width to 0.995. Missing seasonal patterns? Add custom seasonalities. Check timezone consistency.

### Step 4: Correlate Alerts + Find Root Cause

Group related anomalies. Identify root causes.

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

**Got:** Related anomalies grouped into incidents. Root causes from dependency graph. Incident summaries for investigation.

**If fail:** All anomalies separate incidents? Raise time_window_minutes. Root cause unclear? Define metric_relationships explicit from architecture. Check timestamp sort.

### Step 5: Integrate with Alerting System

Send intelligent alerts with context. Suppress noise.

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

**Got:** High-severity → PagerDuty. Medium → Slack. Low → logged only. Duplicate alerts suppressed in 15-min window.

**If fail:** Test webhook URLs with curl first. Severity calc should give 0.5-0.9 range. Rate limiting must not suppress all alerts. Check timezone for last_alerts tracking.

### Step 6: Deploy as Continuous Monitoring Service

Auto-pipeline runs periodically.

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

**Got:** Service runs continuously. Detects anomalies every 5 min. Alerts sent for incidents. Logs all activity.

**If fail:** Scheduler process must stay alive (use systemd/supervisor for prod). Check Prometheus connection. Models must load OK. Add dead man's switch alert if service stops. Monitor memory (reload models periodically if growing).

## Checks

- [ ] Historical data loaded, no missing timestamps
- [ ] Isolation Forest finds known anomalies in test set
- [ ] Prophet models capture daily/weekly seasonality
- [ ] Alert correlation groups temporally-related anomalies
- [ ] Root cause detection finds upstream issues
- [ ] Intelligent alerting suppresses duplicates
- [ ] Severity calc gives reasonable scores (0.5-0.9)
- [ ] Monitoring service runs continuously 7+ days, no crash
- [ ] False positive rate < 10% (vs labeled data)
- [ ] True positive rate > 80% for critical incidents

## Pitfalls

- **Training on anomalous data**: Baseline period for training must be clean (no incidents). Manually review or use labeled data.
- **Ignoring seasonality**: Static models fail on daily/weekly patterns. Use Prophet or add time features.
- **Too sensitive thresholds**: 99% CI may flag normal peaks. Start 99.5%, tune by false positives.
- **Not handling missing data**: Gaps cause model errors. Robust preprocessing with interpolation.
- **Alert fatigue from low severity**: Filter below threshold. Focus on high-confidence.
- **Ignoring system topology**: Treating metrics independent misses cascading failures. Define deps.
- **Model drift**: Old-data models go stale. Retrain monthly or on system change.
- **Resource contention**: Running detection on every metric = expensive. Prioritize critical services or sample.

## See Also

- `monitor-model-drift` - Find when anomaly models degrade
- `monitor-data-integrity` - Data quality checks before anomaly detection
- `setup-prometheus-monitoring` - Collect operational metrics
- `forecast-operational-metrics` - Capacity planning with Prophet forecasts
