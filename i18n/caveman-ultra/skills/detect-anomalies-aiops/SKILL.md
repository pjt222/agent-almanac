---
name: detect-anomalies-aiops
locale: caveman-ultra
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

ML → anomalies in ops metrics + alert correlation + cut false positives.

## Use When

- Ops team drowns in alerts (>100/day)
- Multi-metric anomalies (not just threshold)
- Seasonal patterns → static thresholds fail
- Predict issues before user impact
- Correlate alerts → root cause
- Monitoring → too many false positives
- Subtle perf degradation trends

## In

- **Required**: Time series metrics (CPU, mem, latency, err rate)
- **Required**: Historical data (30-90 days min)
- **Optional**: Alert history w/ labels (TP/FP)
- **Optional**: Sys topology (svc deps)
- **Optional**: Logs → correlation
- **Optional**: Deploy/change events → context

## Do

### Step 1: Env + Load Data

Install deps + prep time series.

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

Load + prep:

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

→ Time series loaded w/ regular intervals, missing vals handled, features engineered.

If err: Prometheus conn fails → verify URL + net. Data gaps → forward-fill or interpolate. Ensure ts col is datetime. Mem issues on large ranges → chunks.

### Step 2: Isolation Forest (Multivariate)

Unsupervised Isolation Forest.

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

→ Model trained on history, anomalies scored, typically 0.5-2% flagged.

If err: too many (>5%) → reduce contamination or retrain on cleaner baseline. Too few (<0.1%) → increase contamination or check scaling. Verify features have variance.

### Step 3: Prophet (Forecast + Anomaly)

Facebook Prophet → seasonality + deviations.

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

→ Prophet captures daily/weekly seasonality, anomalies when actuals fall outside 99% CI, forecasts for capacity planning.

If err: too slow (>5 min/metric) → reduce history to 30 days or disable weekly_seasonality. Too many FP → interval_width to 0.995. Missing seasonal → custom seasonalities. TZ consistency in ts.

### Step 4: Correlate Alerts + Root Cause

Group related anomalies, find causes.

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

→ Related anomalies → incidents, root causes via dep graph, incident summaries.

If err: all anomalies as separate → increase time_window_minutes. Root cause unclear → define metric_relationships per architecture. Verify ts sort.

### Step 5: Integrate w/ Alerting

Smart alerts + noise suppress.

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

→ High sev → PagerDuty, med → Slack, low → log only, dupes suppressed in 15-min window.

If err: test webhook w/ curl first. Verify severity (0.5-0.9 range). Check rate limit doesn't suppress all. TZ handling for last_alerts.

### Step 6: Deploy as Continuous Svc

Auto pipeline on interval.

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

→ Svc runs continuous, detects every 5 min, alerts on incidents, logs all.

If err: scheduler process alive (systemd/supervisor in prod). Verify Prometheus conn. Models loaded OK. Dead man's switch if svc stops. Monitor mem (reload models periodically if grows).

## Check

- [ ] History loaded w/ no missing ts
- [ ] Isolation Forest → known anomalies from test set
- [ ] Prophet captures daily/weekly seasonality
- [ ] Alert correlation groups time-related anomalies
- [ ] Root cause → upstream issues correct
- [ ] Smart alerting suppresses dupes
- [ ] Severity scores (0.5-0.9)
- [ ] Svc runs 7+ days no crash
- [ ] FP rate <10% (labeled data)
- [ ] TP rate >80% (critical incidents)

## Traps

- **Train on anomaly data**: Baseline must be clean (no incidents). Manual review or labeled data.
- **Ignore seasonality**: Static models fail on daily/weekly. Prophet or time features.
- **Too sensitive**: 99% CI flags normal peaks. Start 99.5% + tune on FP.
- **Skip missing data**: Gaps → model errors. Robust preprocess + interpolate.
- **Alert fatigue from low sev**: Filter below threshold. High-conf only.
- **Ignore topology**: Treating metrics solo misses cascades. Define deps.
- **Model drift**: Old data → stale. Retrain monthly or on sys changes.
- **Resource contention**: Detecting every metric costly. Prioritize critical svcs or sample.

## →

- `monitor-model-drift` — detect when detection models degrade
- `monitor-data-integrity` — data quality before detection
- `setup-prometheus-monitoring` — collect ops metrics
- `forecast-operational-metrics` — capacity planning w/ Prophet
