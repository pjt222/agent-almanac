---
name: monitor-model-drift
locale: wenyan-ultra
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

# 監模偏


> 詳例見 [Extended Examples](references/EXAMPLES.md)。

以統計檢驗（PSI、KS）+ Evidently 察生產之數偏、念偏。

## 用

- 模性能無故衰
- 新數分布異訓集
- 入特之季變
- 業指未損前先警
- 監管令（SR 11-7、EU AI Act）
- 多版並存須比

## 入

- **必**：生產預測+特（末 30-90 日）
- **必**：參集（訓/驗）
- **必**：真標（或遲）
- **可**：特要度/SHAP
- **可**：業指閾
- **可**：舊偏報以察趨

## 行

### 一：裝設 Evidently

立框並裝依：

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

立配文：

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

**得：** 配文成、閾合模耐。

**敗：** 始用嚴閾（PSI > 0.2、KS p < 0.01）→依偽警率調。

### 二：施數偏察

立諸統計檢驗之察線：

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

**得：** 察成、生 JSON 報、識偏特。

**敗：** 查缺值（補/刪）、確兩集同欄、確型相符。

### 三：生 Evidently 報

立可見 HTML 報供人察、調：

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

**得：** HTML 報生於 `monitoring/reports/`，瀏覽器可見動圖比分布。

**敗：** 驗寫權、Evidently ≥ 0.4.0、行數足（≥100）。

### 四：施念偏察

察預測性能以識念偏（特↔標關係之變）：

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**得：** 性能監察識準/AUC 跌過閾→疑念偏。

**敗：** 確真標可得（或須遲批）、預測分校（分類 0-1）、查特漏標。

### 五：立自警

合察與警系（Slack、PagerDuty、郵）：

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

**得：** 偏察觸警送 Slack/PagerDuty，重度依偏率+要特定。

**敗：** 先以 curl 試 webhook、驗 PagerDuty 鑰權、查防火牆出 HTTPS、加重試。

### 六：定期作業

自動依日/週察：

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

或用 cron：

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * cd /path/to/monitoring && /path/to/venv/bin/python scheduler.py >> logs/cron.log 2>&1
```

或用 Airflow DAG：

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

**得：** 自動依時行、生報、過閾乃警、皆有日誌。

**敗：** 查作業在行（`ps aux | grep scheduler`）、cron 在運、源可達、察日誌、設死人開關。

## 驗

- [ ] PSI/KS 對已知偏景生預期值
- [ ] Evidently HTML 報能渲、可見分布疊加
- [ ] 要特偏即觸警
- [ ] 念偏察 3 日內識性能衰
- [ ] 警達諸道（Slack、郵、PagerDuty）
- [ ] 排程作業 7+ 日無人介入
- [ ] 偽警率 < 5%（過則調閾）
- [ ] 偏察 1M 行 < 5 分

## 忌

- **參集陳**：每季或重訓後更，以反自然演化
- **樣量失衡**：今集與參集量近（各 ≥1000 行）方信
- **缺真標**：念偏須標→無實時則設遲標線
- **季節惑**：週/月律生偽警→用同期窗或去季節化
- **警疲**：始閾高、依重訓週期漸降
- **忽質偏**：缺值、外點、編碼誤須單察、勿混分布偏
- **過依總指**：每特察必、總偏掩個特之變
- **忽預測分**：無真標亦能：預測分突變即信號

## 參

- `detect-anomalies-aiops`
- `deploy-ml-model-serving`
- `setup-prometheus-monitoring`
- `review-data-analysis`
