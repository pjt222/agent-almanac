---
name: monitor-model-drift
locale: wenyan
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

# 察模型偏移


> 詳例見 [Extended Examples](references/EXAMPLES.md)。

以 Evidently AI、統計試（PSI、KS）、與自定度量察生產 ML 模型之數據偏與概念偏，並警之。

## 用時

- 生產 ML 模型現不明性能退化乃用
- 新數據分布異於訓練數據乃用
- 入特之季節或時域變化乃用
- 業務度量受影前先警乃用
- 監管要求模型察（如 SR 11-7、EU AI Act）乃用
- 多模型版本部署，須偏移較乃用

## 入

- **必要**：生產模型預測與特（近 30-90 日）
- **必要**：參照數據集（訓練或驗證集）
- **必要**：真值標（或滯後）
- **可選**：特要性分或 SHAP 值
- **可選**：警業務度量閾
- **可選**：歷史偏移報以察趨勢

## 法

### 第一步：裝並設 Evidently AI

設察框架及相應依賴。

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

建配置文件：

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

**得：** 配置文件已建，閾合模型容差。

**敗則：** 始以保守閾（PSI > 0.2，KS p-value < 0.01），依假陽率調之。

### 第二步：行數據偏察

建偏察管道，含多統計試。

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

**得：** 偏察成行，生 JSON 報含每特統計，識偏移之特。

**敗則：** 察缺值（補或刪），確保參照與當前數據同列、類同。

### 第三步：生 Evidently 報

建可視 HTML 報供人察與調試。

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

**得：** HTML 報生於 `monitoring/reports/`，瀏覽器可觀，互動圖示分布較。

**敗則：** 驗輸出目錄寫權，察 Evidently 版本 >= 0.4.0，確保數據幀有足夠行（建議 >100）。

### 第四步：行概念偏察

察預測性能以見概念偏（特與目之關係變）。

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**得：** 性能察測模型準/AUC 落於閾下時，示概念偏可能。

**敗則：** 確保真值標可得（或須延後驗證批處），驗預測分校（分類為 0-1），察特中標泄。

### 第五步：設自動警

合偏察與警系（Slack、PagerDuty、郵）。

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

**得：** 偏移察測時，警送至 Slack/PagerDuty，嚴依偏分與要害特而定。

**敗則：** 先以 curl 試 webhook URL，驗 PagerDuty 整合鍵權限，察出口 HTTPS 防火牆規，加重試以容暫網失。

### 第六步：排察任務

自動偏察依期（每日或每週）。

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

**得：** 察依期自動行，生報，僅偏越閾時送警，全行記之。

**敗則：** 察排程進程在行（`ps aux | grep scheduler`），驗 cron 服務活，確保數據源可達，閱日誌察異，若任務不行設死寂警。

## 驗

- [ ] PSI 與 KS 試之計，於已知偏景生預期值
- [ ] Evidently HTML 報正渲，現分布疊
- [ ] 要害特偏即觸警
- [ ] 概念偏察於三日內測得性能退化
- [ ] 警送至諸配置道（Slack、郵、PagerDuty）
- [ ] 排程任務無人為干預行 7 日以上
- [ ] 假陽率 < 5%（高則調閾）
- [ ] 偏察百萬行於 5 分內畢

## 陷

- **參照數據陳舊**：每季或模型重訓後更新參照集，反映自然數據演進
- **樣本量不匹**：當前與參照集應有近量（各 >1000 行）以保統計可靠
- **缺真值**：概念偏需標；若無實時標，行延後標管道
- **季節性混淆**：週月模或觸假陽；用時對齊參照窗或去季化特
- **警疲**：始以高閾，依實際模型重訓步調漸降
- **忽數據質量偏**：分察缺值、離群、編碼錯，獨於分布偏
- **過信合計度量**：每特察要；合計偏或掩個別要害特之變
- **忽預測分布**：即無真值，預測分布驟變示問題

## 參

- `detect-anomalies-aiops` - 操作度量之時序異察
- `deploy-ml-model-serving` - 模型部署模與版本
- `setup-prometheus-monitoring` - 基設度量收
- `review-data-analysis` - 統計分析驗與同行察
