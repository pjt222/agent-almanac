---
name: monitor-model-drift
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
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Monitor Model Drift


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Detect and alert on data drift and concept drift in production ML models using statistical tests and automated monitoring.

## Cuándo Usar

- Production ML models experiencing unexplained performance degradation
- New data distributions differ from training data
- Seasonal or temporal shifts in input features
- Need proactive alerts before business metrics are impacted
- Regulatory requirements for model monitoring (e.g., SR 11-7, EU AI Act)
- Multiple model versions deployed requiring drift comparison

## Entradas

- **Requerido**: Production model predictions and features (last 30-90 days)
- **Requerido**: Reference dataset (training or validation data)
- **Requerido**: Ground truth labels (may be delayed)
- **Opcional**: Feature importance scores or SHAP values
- **Opcional**: Business metric thresholds for alerting
- **Opcional**: Historical drift reports for trend analysis

## Procedimiento

### Paso 1: Install and Configure Evidently AI

Set up the monitoring framework with appropriate dependencies.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

Create configuration file:

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

**Esperado:** Configuration file created with thresholds matching your model's tolerance.

**En caso de fallo:** Start with conservative thresholds (PSI > 0.2, KS p-value < 0.01) and tune based on false positive rate.

### Paso 2: Implement Data Drift Detection

Create drift detection pipeline with multiple statistical tests.

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

**Esperado:** Drift detection runs successfully, produces JSON report with per-feature statistics, and identifies drifted features.

**En caso de fallo:** Check for missing values (impute or drop), ensure reference and current data have same columns, verify data types match between datasets.

### Paso 3: Generate Evidently Reports

Create visual HTML reports for human review and debugging.

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

**Esperado:** HTML reports generated in `monitoring/reports/`, viewable in browser with interactive charts showing distribution comparisons.

**En caso de fallo:** Verify write permissions to output directory, check that Evidently version is >= 0.4.0, ensure data frames have sufficient rows (>100 recommended).

### Paso 4: Implement Concept Drift Detection

Monitor prediction performance to detect concept drift (relationship between features and target changes).

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**Esperado:** Performance monitoring detects when model accuracy/AUC drops below threshold, signaling potential concept drift.

**En caso de fallo:** Ensure ground truth labels are available (may require delayed validation batch job), verify prediction scores are properly calibrated (0-1 range for classification), check for label leakage in features.

### Paso 5: Set Up Automated Alerting

Integrate drift detection with alerting systems (Slack, PagerDuty, email).

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

**Esperado:** Alerts sent to Slack/PagerDuty when drift detected, with severity based on drift share and critical feature involvement.

**En caso de fallo:** Test webhook URLs with curl first, verify PagerDuty integration key has correct permissions, check firewall rules for outbound HTTPS, implement retry logic for transient network failures.

### Paso 6: Schedule Monitoring Jobs

Automate drift detection to run on schedule (daily or weekly).

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

Alternatively, use cron:

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * cd /path/to/monitoring && /path/to/venv/bin/python scheduler.py >> logs/cron.log 2>&1
```

Or use Airflow DAG:

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

**Esperado:** Monitoring runs automatically on schedule, generates reports, sends alerts only when drift exceeds thresholds, logs all activity.

**En caso de fallo:** Check scheduler process is running (`ps aux | grep scheduler`), verify cron service is active, ensure data sources are accessible, review logs for exceptions, set up dead man's switch alert if job doesn't run.

## Validación

- [ ] PSI and KS test calculations produce expected values for known drift scenarios
- [ ] Evidently HTML reports render correctly and show distribution overlays
- [ ] Critical feature drift triggers alerts immediately
- [ ] Concept drift detector identifies performance degradation within 3 days
- [ ] Alerts delivered to all configured channels (Slack, email, PagerDuty)
- [ ] Scheduled job runs without manual intervention for 7+ days
- [ ] False positive rate < 5% (tune thresholds if higher)
- [ ] Drift detection completes in < 5 minutes for 1M rows

## Errores Comunes

- **Stale reference data**: Update reference dataset quarterly or after model retraining to reflect natural data evolution
- **Sample size mismatch**: Ensure current and reference datasets have similar sizes (>1000 rows each) for reliable statistics
- **Missing ground truth**: Concept drift requires labels; implement delayed labeling pipeline if real-time labels unavailable
- **Seasonality confusion**: Weekly/monthly patterns may trigger false positives; use time-aligned reference windows or deseasonalize features
- **Alert fatigue**: Start with high thresholds and gradually lower based on actual model retraining cadence
- **Ignoring data quality drift**: Monitor missing values, outliers, and encoding errors separately from distribution drift
- **Over-reliance on aggregate metrics**: Per-feature analysis crucial; aggregate drift may mask critical individual feature shifts
- **Neglecting prediction distribution**: Even without ground truth, sudden prediction distribution shifts signal issues

## Habilidades Relacionadas

- `detect-anomalies-aiops` - Time series anomaly detection for operational metrics
- `deploy-ml-model-serving` - Model deployment patterns and versioning
- `setup-prometheus-monitoring` - Infrastructure metrics collection
- `review-data-analysis` - Statistical analysis validation and peer review
