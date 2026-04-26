---
name: monitor-model-drift
locale: wenyan-lite
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

# 監測模型漂移


> 完整配置檔與範本詳見 [Extended Examples](references/EXAMPLES.md)。

以統計檢定與自動化監測，偵測並告警生產 ML 模型之資料漂移與概念漂移。

## 適用時機

- 生產 ML 模型呈現不明性能下降
- 新資料分布與訓練資料不同
- 輸入特徵之季節性或時序偏移
- 須先發告警，免業務指標受擊
- 法規要求模型監測（如 SR 11-7、EU AI Act）
- 部署多模型版本，須漂移比較

## 輸入

- **必要**：生產模型之預測與特徵（最近 30-90 日）
- **必要**：參考資料集（訓練或驗證資料）
- **必要**：真值標籤（或有延遲）
- **選擇性**：特徵重要性分數或 SHAP 值
- **選擇性**：告警之業務指標閾值
- **選擇性**：歷史漂移報告，供趨勢分析

## 步驟

### 步驟一：安裝並配置 Evidently AI

以適當之依賴項建立監測框架。

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Evidently and dependencies
pip install evidently pandas scikit-learn prometheus-client

# Create monitoring directory structure
mkdir -p monitoring/{reports,config,alerts}
```

建配置檔：

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

**預期：** 配置檔已建，閾值合於模型之容忍度。

**失敗時：** 從保守閾值始（PSI > 0.2、KS p-value < 0.01），依誤報率調校。

### 步驟二：實作資料漂移偵測

建立含多種統計檢定之漂移偵測管道。

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

**預期：** 漂移偵測順利運行，產出 JSON 報告含各特徵統計，並識別漂移之特徵。

**失敗時：** 檢查缺失值（補值或捨棄），確保參考與當前資料具相同欄位，驗證資料型別一致。

### 步驟三：產生 Evidently 報告

為人工檢視與調試，產生視覺化 HTML 報告。

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

**預期：** HTML 報告產於 `monitoring/reports/`，瀏覽器中可檢視，互動圖示分布比較。

**失敗時：** 驗輸出目錄之寫入權限，確認 Evidently 版本 >= 0.4.0，確保資料框有足夠列數（建議 >100）。

### 步驟四：實作概念漂移偵測

監測預測性能，以偵概念漂移（特徵與目標關係之變）。

```python
# monitoring/concept_drift.py
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score
from typing import Dict, List
import json


# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 性能監測能偵知模型準確率/AUC 跌破閾值，預示概念漂移。

**失敗時：** 確真值標籤可得（或須延遲驗證批次作業），驗預測分數已適當校準（分類為 0-1 區間），查特徵中無標籤洩漏。

### 步驟五：建立自動告警

將漂移偵測與告警系統（Slack、PagerDuty、email）整合。

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

**預期：** 偵知漂移時告警送至 Slack/PagerDuty，嚴重度依漂移占比與關鍵特徵涉及而定。

**失敗時：** 先以 curl 測試 webhook URL，驗 PagerDuty 整合金鑰權限正確，查防火牆對外 HTTPS 規則，對暫時性網路失敗實作重試邏輯。

### 步驟六：排程監測作業

將漂移偵測自動化，按排程運行（每日或每週）。

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

**預期：** 監測按排程自動運行，產報告，僅於漂移逾閾值時送告警，並記錄所有活動。

**失敗時：** 查排程程序是否運行（`ps aux | grep scheduler`），驗 cron 服務啟動，確資料來源可達，覽日誌中之例外，作業未運行時設「死人開關」告警。

## 驗證

- [ ] PSI 與 KS 檢定計算對已知漂移情境產出預期值
- [ ] Evidently HTML 報告正確渲染，呈分布疊加圖
- [ ] 關鍵特徵之漂移即刻觸發告警
- [ ] 概念漂移偵測器可於 3 日內識別性能下降
- [ ] 告警送至所有所配通道（Slack、email、PagerDuty）
- [ ] 排程作業 7+ 日可無人介入運行
- [ ] 誤報率 < 5%（若高，調校閾值）
- [ ] 漂移偵測對 1M 列資料於 5 分內完成

## 常見陷阱

- **參考資料陳舊**：每季或模型重訓後更新參考資料集，反映自然之資料演變
- **樣本大小不匹**：確保當前與參考資料集大小相近（各 >1000 列），以求統計可靠
- **無真值標籤**：概念漂移需標籤；若即時標籤不可得，實作延遲標記管道
- **季節性混淆**：每週/每月模式可能誤報；用時間對齊之參考視窗或對特徵去季節化
- **告警疲勞**：從高閾值始，依實際模型重訓週期漸降
- **忽略資料品質漂移**：監測缺失值、離群值、編碼錯誤，與分布漂移分而視之
- **過度依賴合計指標**：每特徵分析至要；合計漂移可掩個別關鍵特徵之偏移
- **忽略預測分布**：縱無真值，預測分布之驟變即是訊號

## 相關技能

- `detect-anomalies-aiops` - 時序異常偵測，用於運維指標
- `deploy-ml-model-serving` - 模型部署模式與版本管理
- `setup-prometheus-monitoring` - 基礎設施指標蒐集
- `review-data-analysis` - 統計分析驗證與同儕審查
