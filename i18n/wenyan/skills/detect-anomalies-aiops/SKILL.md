---
name: detect-anomalies-aiops
locale: wenyan
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

# AIOps 之異常察

> 完整配置與範本詳見 [擴展範例](references/EXAMPLES.md)。

以機器學習察運維指標之異常，關聯告警，減誤報。

## 用時

- 運維隊為告警之量所困（>100/日）
- 須察超靜閾之多指標複合異常
- 季節性模式令靜閾失效
- 欲於事件前預察以主動應對
- 須關聯告警以識根因
- 監控系統生誤報過多
- 欲察性能微降之勢

## 入

- **必要**：監控系統之時序指標（CPU、記憶體、延遲、錯誤率）
- **必要**：歷史資料（至少 30-90 日）
- **可選**：帶標籤之告警歷史（真誤報）
- **可選**：系統拓撲（服務依賴）
- **可選**：用於關聯之日誌資料
- **可選**：部署／變更事件以作上下文

## 法

### 第一步：立環境並載資料

裝依賴並備時序資料以作分析。

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

載並備資料：

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

**得：** 時序資料以規律間隔載入，缺值已處，特徵已為 ML 模型所工程。

**敗則：** Prometheus 連接失敗則驗 URL 與網絡；資料有缺則用前向填充或插值；確保時戳列為 datetime 型；察大日期範圍之記憶體之虞（分塊處之）。

### 第二步：施 Isolation Forest 察多變量異常

以無監督 Isolation Forest 算法察異常。

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

**得：** 模型於歷史資料上訓練畢，異常已帶分標出，常 0.5-2% 之點標為異常。

**敗則：** 異常過多（>5%）則減 contamination 參數或於更潔基期重訓；過少（<0.1%）則增 contamination 或察特徵縮放；驗特徵有足夠方差。

### 第三步：施 Prophet 作時序預測與異常察

用 Facebook Prophet 建季節模型並察偏離。

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

**得：** Prophet 模型捕捉日／週季節性，實值落於 99% 置信區間外時察為異常，並生預測以作容量規劃。

**敗則：** Prophet 過慢（每指標 >5 min）則縮歷史為 30 日或閉 weekly_seasonality；誤報過多則增 interval_width 至 0.995；缺季節模式則加自定義季節；確保時戳時區一致。

### 第四步：關聯告警並識根因

將相關異常聚為事件並識潛在根因。

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

**得：** 相關異常聚為事件，根因基於依賴圖而識，生事件摘要以資調查。

**敗則：** 諸異常皆分為獨立事件則增 time_window_minutes；根因不明則按架構明定 metric_relationships；驗時戳序正確。

### 第五步：整合於告警系統

發帶上下文之智告警並抑噪。

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

**得：** 高嚴重性事件觸 PagerDuty 呼叫，中嚴重性至 Slack，低嚴重性僅記錄；重複告警於 15 分鐘窗內被抑。

**敗則：** 先以 curl 測 webhook URL；驗嚴重性之算出合理值（0.5-0.9 範圍）；察限速未抑諸告警；確保 last_alerts 追蹤之時區處理正確。

### 第六步：部署為持續監控服務

立定期運行之自動化流水線。

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

**得：** 服務持續運行，每 5 分鐘察異常，事件時發告警，諸活動皆記。

**敗則：** 驗調度進程存活（生產用 systemd/supervisor）；察 Prometheus 連通；確保模型成功載入；若服務停則施 dead man 告警；察記憶體用量（記憶體增長則周期重載模型）。

## 驗

- [ ] 歷史資料正載，無缺時戳
- [ ] Isolation Forest 察測試集中已知異常
- [ ] Prophet 模型於可視化中捕日／週季節性
- [ ] 告警關聯聚時間相關之異常
- [ ] 根因察正識上游問題
- [ ] 智告警抑重複告警
- [ ] 嚴重性之算生合理分（0.5-0.9）
- [ ] 監控服務連運 7 日以上不崩
- [ ] 誤報率 < 10%（以帶標籤資料驗）
- [ ] 關鍵事件真正率 > 80%

## 陷

- **於異常資料上訓**：確保訓練基期潔（無事件）；手動審或用帶標籤資料
- **略季節性**：靜模型於日／週模式上失。用 Prophet 或加時間特徵
- **閾過敏**：99% 置信區間或標正常峰值；始於 99.5% 依誤報調之
- **不處缺資料**：指標有缺致模型誤；施含插值之穩健預處理
- **低嚴重性致告警疲**：過濾低嚴重性告警；專注高置信異常
- **略系統拓撲**：獨立視諸指標遺級聯故障；明定依賴關係
- **模型漂移**：舊資料訓練之模型會陳舊；月重訓或系統變時重訓
- **資源爭用**：察諸指標費資源；優先關鍵服務或抽樣指標

## 參

- `monitor-model-drift` — 察異常察模型之退化
- `monitor-data-integrity` — 異常察前之資料質量檢查
- `setup-prometheus-monitoring` — 收集運維指標
- `forecast-operational-metrics` — 以 Prophet 預測作容量規劃
