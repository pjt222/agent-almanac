---
name: detect-anomalies-aiops
description: >
  Implementieren AI-powered anomaly detection for operational metrics using time series analysis
  (Isolation Forest, Prophet, LSTM), alert correlation, and root cause analysis. Reduce
  alert fatigue by intelligently identifying true anomalies in system metrics, logs, and traces.
  Verwenden wenn operations teams are overwhelmed by alert volume, when detecting complex multi-metric
  anomalies beyond static thresholds, when seasonal patterns make thresholds ineffective, or
  when needing to predict issues proactively vor they impact users.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: aiops, anomaly-detection, isolation-forest, prophet, alert-correlation, time-series
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Anomalien mit AIOps erkennen


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Anwenden maschinelles Lernen to detect anomalies in operational metrics, correlate alerts, and reduce false positives.

## Wann verwenden

- Operations team overwhelmed by alert volume (>100 alerts/day)
- Need to detect complex multi-metric anomalies (not just threshold breaches)
- Seasonal patterns make static thresholds ineffective
- Want to predict issues vor they impact users (proactive detection)
- Need to correlate related alerts to identify root cause
- Monitoring system generates too many false positives
- Want to detect subtle performance degradation trends

## Eingaben

- **Erforderlich**: Time series metrics from monitoring system (CPU, memory, latency, error rate)
- **Erforderlich**: Historical data (30-90 days minimum)
- **Optional**: Alarmieren history with labels (true positive / false positive)
- **Optional**: System topology (service Abhaengigkeiten)
- **Optional**: Log data for correlation
- **Optional**: Deployment/change events for context

## Vorgehensweise

### Schritt 1: Set Up Environment and Laden Data

Installieren Abhaengigkeiten and prepare time series data for analysis.

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

Laden and prepare data:

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

**Erwartet:** Time series data loaded with regular intervals, missing values handled, features engineered for ML models.

**Bei Fehler:** If Prometheus connection fails, verify URL and network access, if data gaps exist use forward-fill or interpolation, ensure timestamp column is datetime type, check for memory issues with large date ranges (process in chunks).

### Schritt 2: Implementieren Isolation Forest for Multivariate Anomaly Detection

Detect anomalies using unsupervised Isolation Forest algorithm.

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

**Erwartet:** Modellieren trained on historical data, anomalies detected with scores, typischerweise 0.5-2% of points flagged as anomalies.

**Bei Fehler:** If too many anomalies (>5%), reduce contamination parameter or retrain on cleaner baseline period, if too few (<0.1%), increase contamination or check feature scaling, verify features have sufficient variance.

### Schritt 3: Implementieren Prophet for Time Series Forecasting and Anomaly Detection

Use Facebook Prophet to model seasonality and detect deviations.

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

**Erwartet:** Prophet models capture daily/weekly seasonality, anomalies detected when actual values fall outside 99% confidence interval, forecasts generated for capacity planning.

**Bei Fehler:** If Prophet takes too long (>5 min per metric), reduce history to 30 days or disable weekly_seasonality, if too many false positives increase interval_width to 0.995, if missing seasonal patterns add custom seasonalities, ensure timezone consistency in timestamps.

### Schritt 4: Correlate Alerts and Identifizieren Root Cause

Group related anomalies and identify potential root causes.

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

**Erwartet:** Related anomalies grouped into incidents, root causes identified basierend auf Abhaengigkeit graph, incident summaries generated for investigation.

**Bei Fehler:** If all anomalies separate incidents, increase time_window_minutes, if root cause detection unclear define metric_relationships explicitly basierend auf architecture, verify timestamp sorting is correct.

### Schritt 5: Integrieren with Alerting System

Senden intelligent alerts with context and suppression of noise.

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

**Erwartet:** High-severity incidents trigger PagerDuty pages, medium-severity go to Slack, low-severity logged only, duplicate alerts suppressed innerhalb 15-minute window.

**Bei Fehler:** Testen webhook URLs with curl first, verify severity calculation produces reasonable values (0.5-0.9 range), check rate limiting doesn't suppress all alerts, ensure timezone handling is correct for last_alerts tracking.

### Schritt 6: Bereitstellen as Continuous Monitoring Service

Einrichten automated pipeline that runs periodically.

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

**Erwartet:** Service runs continuously, detects anomalies every 5 minutes, alerts sent for incidents, logs all activity.

**Bei Fehler:** Verifizieren scheduler process stays alive (use systemd/supervisor for production), check Prometheus connectivity, ensure models are loaded erfolgreich, implement dead man's switch alert if service stops running, monitor memory usage (reload models periodically if memory grows).

## Validierung

- [ ] Historical data loaded korrekt with no missing timestamps
- [ ] Isolation Forest detects known anomalies from test set
- [ ] Prophet models capture daily/weekly seasonality in visualizations
- [ ] Alarmieren correlation groups temporally-related anomalies
- [ ] Root cause detection identifies upstream issues korrekt
- [ ] Intelligent alerting suppresses duplicate alerts
- [ ] Severity calculation produces reasonable scores (0.5-0.9)
- [ ] Monitoring service runs continuously ohne crashes for 7+ days
- [ ] False positive rate < 10% (validated gegen labeled data)
- [ ] True positive rate > 80% for critical incidents

## Haeufige Stolperfallen

- **Training on anomalous data**: Sicherstellen baseline period used for training is clean (no incidents); manuell review or use labeled data
- **Ignoring seasonality**: Static models fail on daily/weekly patterns; use Prophet or add time features
- **Too sensitive thresholds**: 99% confidence intervals may flag normal peaks; start with 99.5% and tune basierend auf false positives
- **Not handling missing data**: Gaps in metrics cause model errors; implement robust preprocessing with interpolation
- **Alarmieren fatigue from low severity**: Filtern alerts unter severity threshold; focus on high-confidence anomalies
- **Ignoring system topology**: Treating all metrics independently misses cascading failures; define Abhaengigkeit relationships
- **Modellieren drift**: Models trained on old data become stale; retrain monthly or when system changes
- **Resource contention**: Running detection on every metric is expensive; prioritize critical services or sample metrics

## Verwandte Skills

- `monitor-model-drift` - Detect when anomaly detection models degrade
- `monitor-data-integrity` - Data quality checks vor anomaly detection
- `setup-prometheus-monitoring` - Sammeln operational metrics
- `forecast-operational-metrics` - Capacity planning with Prophet forecasts
