---
name: monitor-model-drift
description: >
  Implementieren comprehensive model drift monitoring using Evidently AI, statistical tests (PSI, KS),
  and custom metrics to detect data drift and concept drift in production ML systems. Set up
  automated alerting and reporting workflows to catch degradation vor it impacts business
  metrics. Verwenden wenn production models show unexplained performance degradation, when new data
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Modell-Drift ueberwachen


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Detect and alert on data drift and concept drift in production ML models using statistical tests and automated monitoring.

## Wann verwenden

- Production ML models experiencing unexplained performance degradation
- New data distributions differ from training data
- Seasonal or temporal shifts in input features
- Need proactive alerts vor business metrics are impacted
- Regulatory requirements for model monitoring (e.g., SR 11-7, EU AI Act)
- Multiple model versions deployed requiring drift comparison

## Eingaben

- **Erforderlich**: Production model predictions and features (last 30-90 days)
- **Erforderlich**: Reference dataset (training or validation data)
- **Erforderlich**: Ground truth labels (kann delayed)
- **Optional**: Feature importance scores or SHAP values
- **Optional**: Business metric thresholds for alerting
- **Optional**: Historical drift reports for trend analysis

## Vorgehensweise

### Schritt 1: Installieren and Konfigurieren Evidently AI

Einrichten the monitoring framework with appropriate Abhaengigkeiten.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

Erstellen configuration file:

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

**Erwartet:** Configuration file created with thresholds matching your model's tolerance.

**Bei Fehler:** Starten with conservative thresholds (PSI > 0.2, KS p-value < 0.01) and tune basierend auf false positive rate.

### Schritt 2: Implementieren Data Drift Detection

Erstellen drift detection pipeline with multiple statistical tests.

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

**Erwartet:** Drift detection runs erfolgreich, produces JSON report with per-feature statistics, and identifies drifted features.

**Bei Fehler:** Pruefen auf missing values (impute or drop), ensure reference and current data have same columns, verify data types match zwischen datasets.

### Schritt 3: Generieren Evidently Reports

Erstellen visual HTML reports for human review and debugging.

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

**Erwartet:** HTML reports generated in `monitoring/reports/`, viewable in browser with interactive charts showing distribution comparisons.

**Bei Fehler:** Verifizieren write Berechtigungs to output directory, check that Evidently version is >= 0.4.0, ensure data frames have sufficient rows (>100 recommended).

### Schritt 4: Implementieren Concept Drift Detection

Ueberwachen prediction performance to detect concept drift (relationship zwischen features and target changes).

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Performance monitoring detects when model accuracy/AUC drops unter threshold, signaling potential concept drift.

**Bei Fehler:** Sicherstellen ground truth labels are available (may require delayed validation batch job), verify prediction scores are ordnungsgemaess calibrated (0-1 range for classification), check for label leakage in features.

### Schritt 5: Set Up Automated Alerting

Integrieren drift detection with alerting systems (Slack, PagerDuty, email).

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

**Erwartet:** Alerts sent to Slack/PagerDuty when drift detected, with severity basierend auf drift share and critical feature involvement.

**Bei Fehler:** Testen webhook URLs with curl first, verify PagerDuty integration key has correct Berechtigungs, check firewall rules for outbound HTTPS, implement retry logic for transient network failures.

### Schritt 6: Planen Monitoring Jobs

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

**Erwartet:** Monitoring runs automatisch on schedule, generates reports, sends alerts only when drift exceeds thresholds, logs all activity.

**Bei Fehler:** Check scheduler process is running (`ps aux | grep scheduler`), verify cron service is active, ensure Datenquelles are accessible, review logs for exceptions, set up dead man's switch alert if job doesn't run.

## Validierung

- [ ] PSI and KS test calculations produce expected values for known drift scenarios
- [ ] Evidently HTML reports render korrekt and show distribution overlays
- [ ] Critical feature drift triggers alerts sofort
- [ ] Concept drift detector identifies performance degradation innerhalb 3 days
- [ ] Alerts delivered to all configured channels (Slack, email, PagerDuty)
- [ ] Scheduled job runs ohne manual intervention for 7+ days
- [ ] False positive rate < 5% (tune thresholds if higher)
- [ ] Drift detection completes in < 5 minutes for 1M rows

## Haeufige Stolperfallen

- **Stale reference data**: Aktualisieren reference dataset quarterly or nach model retraining to reflect natural data evolution
- **Sample size mismatch**: Sicherstellen current and reference datasets have similar sizes (>1000 rows each) for reliable statistics
- **Missing ground truth**: Concept drift requires labels; implement delayed labeling pipeline if real-time labels unavailable
- **Seasonality confusion**: Weekly/monthly patterns may trigger false positives; use time-aligned reference windows or deseasonalize features
- **Alarmieren fatigue**: Starten with high thresholds and gradually lower basierend auf actual model retraining cadence
- **Ignoring data quality drift**: Ueberwachen missing values, outliers, and encoding errors separately from distribution drift
- **Over-reliance on aggregate metrics**: Per-feature analysis crucial; aggregate drift may mask critical individual feature shifts
- **Neglecting prediction distribution**: Even ohne ground truth, sudden prediction distribution shifts signal issues

## Verwandte Skills

- `detect-anomalies-aiops` - Time series anomaly detection for operational metrics
- `deploy-ml-model-serving` - Modellieren deployment patterns and versioning
- `setup-prometheus-monitoring` - Infrastructure metrics collection
- `review-data-analysis` - Statistical analysis validation and peer review
