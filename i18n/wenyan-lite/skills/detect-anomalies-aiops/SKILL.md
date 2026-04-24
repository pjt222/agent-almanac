---
name: detect-anomalies-aiops
locale: wenyan-lite
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

# AIOps 異常偵測


> 完整配置檔案與範本見 [Extended Examples](references/EXAMPLES.md)。

以機器學習偵測運維指標之異常、關聯警示、減假陽性。

## 適用時機

- 運維團隊為警示量所淹（>100 警示/日）
- 須偵測多指標之複雜異常（非僅閾值之破）
- 季節性模式使靜態閾值失效
- 欲於問題傷及使用者前預測之（主動偵測）
- 須關聯相關警示以辨根因
- 監控系統生假陽性太多
- 欲偵測細微之性能退化趨勢

## 輸入

- **必要**：監控系統之時序指標（CPU、記憶體、延遲、錯誤率）
- **必要**：歷史數據（至少 30-90 日）
- **選擇**：帶標籤之警示歷史（真陽性 / 假陽性）
- **選擇**：系統拓撲（服務依賴）
- **選擇**：用於關聯之日誌數據
- **選擇**：部署/變更事件，以為上下文

## 步驟

### 步驟一：設環境並載數據

裝依賴並備時序數據以分析。

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

載並備數據：

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

**預期：** 時序數據以規則間隔載入，缺值已處，特徵已工程化以供 ML 模型。

**失敗時：** Prometheus 連接失敗時，驗 URL 與網路存取；有數據缺口時用前向填或插值；確保時間戳欄為 datetime 類型；大時間範圍致記憶體不足時分塊處理。

### 步驟二：施 Isolation Forest 為多變量異常偵測

以無監督之 Isolation Forest 算法偵測異常。

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

**預期：** 模型於歷史數據上訓練成，異常附分數偵出，常 0.5-2% 之點標為異常。

**失敗時：** 異常過多（>5%）時，減 contamination 參數或於較乾淨之基線期重訓；異常過少（<0.1%）時，增 contamination 或檢特徵縮放；驗特徵方差足。

### 步驟三：施 Prophet 為時序預測與異常偵測

以 Facebook Prophet 建季節性之模並偵其偏離。

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

**預期：** Prophet 模型捕日/週季節性，實值落於 99% 信賴區間外時偵為異常，預測已生以供容量規劃。

**失敗時：** Prophet 太慢（每指標 >5 分鐘）時，減歷史至 30 日或停 weekly_seasonality；假陽性過多時增 interval_width 至 0.995；季節性模式失之則加自訂季節性；確保時間戳時區一致。

### 步驟四：關聯警示並辨根因

聚相關之異常並辨可能之根因。

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

**預期：** 相關異常聚為事件，根因依依賴圖辨出，事件摘要已生以供調查。

**失敗時：** 所有異常各自成件時，增 time_window_minutes；根因偵測不明時依架構明定 metric_relationships；驗時間戳排序無誤。

### 步驟五：整合警示系統

發附上下文之智能警示並抑制雜音。

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

**預期：** 高嚴重事件觸發 PagerDuty 呼叫，中嚴重發至 Slack，低嚴重僅記錄，15 分鐘窗內之重複警示已抑。

**失敗時：** 先以 curl 測 webhook URL；驗嚴重度計算出合理之值（0.5-0.9 區間）；檢限流不致抑所有警示；確保 last_alerts 追蹤之時區處理無誤。

### 步驟六：部署為持續監控服務

設自動化之管道，定期運行。

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

**預期：** 服務持續運行，每 5 分鐘偵測異常，事件發警示，一切活動皆記錄。

**失敗時：** 驗調度器進程保活（生產用 systemd/supervisor）；檢 Prometheus 連通性；確保模型載入成；服務停時施 dead man's switch 警示；監控記憶體用量（長時若漲則定期重載模型）。

## 驗證

- [ ] 歷史數據正確載入，無缺時間戳
- [ ] Isolation Forest 偵出測試集之已知異常
- [ ] Prophet 模型於可視化中捕日/週季節性
- [ ] 警示關聯將時間相近之異常聚之
- [ ] 根因偵測正確辨上游問題
- [ ] 智能警示抑制重複警示
- [ ] 嚴重度計算生合理之分（0.5-0.9）
- [ ] 監控服務持續運行 7+ 日不崩
- [ ] 假陽性率 < 10%（以標籤數據驗之）
- [ ] 關鍵事件之真陽性率 > 80%

## 常見陷阱

- **於異常數據上訓練**：確保訓練所用之基線期乾淨（無事件）；人工審或用帶標籤之數據
- **忽季節性**：靜態模型於日/週模式中失；用 Prophet 或加時間特徵
- **閾值太敏**：99% 信賴區間或標正常高峰為異常；自 99.5% 始，依假陽性調之
- **不處缺數據**：指標之缺致模型錯；以插值為穩健之前處理
- **低嚴重度致警示疲勞**：過濾嚴重度低於閾值者；聚焦於高信心異常
- **忽系統拓撲**：視所有指標互不相關，錯過級聯失敗；定依賴關係
- **模型漂移**：舊數據訓練之模型漸陳；月度重訓或系統變時重訓
- **資源爭用**：於每指標上運行偵測成本高；優先關鍵服務或抽樣指標

## 相關技能

- `monitor-model-drift` - 偵測異常偵測模型之退化
- `monitor-data-integrity` - 異常偵測前之數據質量檢查
- `setup-prometheus-monitoring` - 收集運維指標
- `forecast-operational-metrics` - 以 Prophet 預測為容量規劃
