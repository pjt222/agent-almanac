---
name: monitor-model-drift
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Implement comprehensive model drift monitoring using Evidently AI, statistical tests (PSI, KS),
  and custom metrics to detect data drift and concept drift in production ML systems. Set up
  automated alerting and reporting workflows to catch degradation before it impacts business
  metrics. Use when production models show unexplained performance degradation, when new data
  distributions differ from training data, when seasonal shifts affect input features, or when
  regulatory requirements mandate model monitoring.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: model-drift, evidently, psi, ks-test, concept-drift, data-drift, monitoring
---

# Monitor Model Drift


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Detect + alert on data drift + concept drift in prod ML models via statistical tests + automated monitoring.

## Use When

- Prod ML models w/ unexplained perf degradation
- New data distributions differ from training
- Seasonal/temporal shifts in input features
- Need proactive alerts before business metrics impacted
- Regulatory: SR 11-7, EU AI Act
- Multi model versions deployed → drift comparison

## In

- **Required**: Prod predictions + features (last 30-90 days)
- **Required**: Reference dataset (training or validation)
- **Required**: Ground truth labels (may be delayed)
- **Optional**: Feature importance / SHAP values
- **Optional**: Business metric thresholds for alerting
- **Optional**: Historical drift reports for trend

## Do

### Step 1: Install + Config Evidently AI

Set up monitoring framework + deps.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

Config file:

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

→ Config created w/ thresholds matching model tolerance.

If err: start conservative (PSI > 0.2, KS p-value < 0.01) + tune by false positive rate.

### Step 2: Data Drift Detection

Drift detection pipeline w/ multiple statistical tests.

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

→ Drift detection runs, JSON report w/ per-feature stats, drifted features identified.

If err: check missing values (impute/drop), reference + current data same cols, data types match.

### Step 3: Generate Evidently Reports

Visual HTML reports for human review + debugging.

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

→ HTML reports in `monitoring/reports/`, browser-viewable w/ interactive charts showing distribution comparisons.

If err: write perms to output dir, Evidently version ≥ 0.4.0, data frames have ≥100 rows recommended.

### Step 4: Concept Drift Detection

Monitor pred perf → detect concept drift (relationship features-target changes).

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

→ Perf monitoring detects when accuracy/AUC drops below threshold → potential concept drift.

If err: ground truth labels available (may need delayed validation batch), prediction scores calibrated (0-1 range classification), no label leakage in features.

### Step 5: Automated Alerting

Integrate w/ Slack, PagerDuty, email.

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

→ Alerts sent on drift, severity by drift share + critical feature involvement.

If err: test webhook URLs w/ curl, PagerDuty integration key has perms, firewall outbound HTTPS, retry logic for transient failures.

### Step 6: Schedule Monitoring Jobs

Automate drift detection on schedule (daily/weekly).

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

Cron alternative:

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * cd /path/to/monitoring && /path/to/venv/bin/python scheduler.py >> logs/cron.log 2>&1
```

Or Airflow DAG:

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

→ Monitoring runs auto on schedule, reports generated, alerts only when drift exceeds thresholds, all activity logged.

If err: scheduler process running (`ps aux | grep scheduler`), cron service active, data sources accessible, review logs for exceptions, dead man's switch alert if job doesn't run.

## Check

- [ ] PSI + KS test calculations match expected values for known drift scenarios
- [ ] Evidently HTML reports render correctly + show distribution overlays
- [ ] Critical feature drift → immediate alerts
- [ ] Concept drift detector identifies perf degradation within 3 days
- [ ] Alerts delivered all configured channels (Slack, email, PagerDuty)
- [ ] Scheduled job runs w/o manual intervention 7+ days
- [ ] False positive rate < 5% (tune thresholds if higher)
- [ ] Drift detection completes < 5min for 1M rows

## Traps

- **Stale reference data**: Update quarterly or after retraining to reflect natural data evolution
- **Sample size mismatch**: Current + reference datasets similar sizes (>1000 rows each) for reliable stats
- **Missing ground truth**: Concept drift needs labels; implement delayed labeling if real-time unavailable
- **Seasonality confusion**: Weekly/monthly patterns → false positives; time-aligned reference windows or deseasonalize features
- **Alert fatigue**: Start high thresholds, lower based on actual retraining cadence
- **Ignore data quality drift**: Monitor missing values, outliers, encoding errors separately from distribution drift
- **Over-reliance on aggregate**: Per-feature analysis crucial; aggregate drift may mask individual feature shifts
- **Neglect prediction distribution**: Even w/o ground truth, sudden prediction shifts signal issues

## →

- `detect-anomalies-aiops` — time series anomaly detection for operational metrics
- `deploy-ml-model-serving` — model deployment patterns + versioning
- `setup-prometheus-monitoring` — infrastructure metrics collection
- `review-data-analysis` — statistical analysis validation + peer review
