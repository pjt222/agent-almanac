---
name: detect-anomalies-aiops
locale: wenyan-ultra
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

# AIOps 偵異

> 見 [Extended Examples](references/EXAMPLES.md) 以得全配檔與範。

施機學以偵運行指標之異、聯警、減偽陽。

## 用

- 運隊受警量淹（> 100 警／日）
- 宜偵雜多指標之異（非僅越閾）
- 季節模致靜閾失效
- 欲預用者見前之患（主動偵）
- 宜聯警以識根因
- 監視生過多偽陽
- 欲偵微效降之勢

## 入

- **必**：監視系之時序指標（CPU、記憶、延、錯率）
- **必**：史數（至少 30-90 日）
- **可**：有標警史（真／偽陽）
- **可**：系拓撲（服務依）
- **可**：聯用之誌
- **可**：部署／變更事件為脈絡

## 行

### 一：備境並載數

裝依並備析之時序數。

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

載並備數：

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

得：時序數已載於定隔，缺值已處，特徵已造供機學模。

敗：Prometheus 連失→驗 URL 及網路。數有隙→前填或插。時戳欄宜為 datetime 類。大域致記憶問題→分塊處。

### 二：施 Isolation Forest 以偵多變異常

以無監督 Isolation Forest 算偵異。

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

得：模於史數訓，異已偵有分，常 0.5-2% 點標為異。

敗：異過多（> 5%）→減 contamination 參或於更淨基線重訓。過少（< 0.1%）→增 contamination 或查特徵縮。驗特徵有足方差。

### 三：施 Prophet 以時序預並偵異

用 Facebook Prophet 模季節並偵偏。

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

得：Prophet 模捕日／週季節，實值落 99% 信域外則偵為異，預以備容量計。

敗：Prophet 過慢（每指標 > 5 分）→減史至 30 日或關 weekly_seasonality。偽陽多→增 interval_width 至 0.995。缺季節模→加自定季節。時戳時區宜一致。

### 四：聯警並識根因

組相關異並識可能根因。

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

得：相關異組為事件，根因由依圖識，事件摘為察。

敗：諸異各為獨事→增 time_window_minutes。根因不明→依架明定 metric_relationships。驗時戳序正。

### 五：整合警系

送含脈絡之智警，抑噪。

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

得：高危事件發 PagerDuty 呼，中危至 Slack，低危僅誌，15 分窗內抑重。

敗：先以 curl 試 webhook URL。驗危度算之值合理（0.5-0.9）。查速限勿抑諸警。last_alerts 之時區處宜正。

### 六：部為持續監服

設動管定期運。

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

得：服持運，每 5 分偵異，警發於事，諸動皆誌。

敗：排程程序宜存（生產用 systemd/supervisor）。查 Prometheus 連。驗模載成。設 dead man's switch 警若服停。察記憶用（記長則定期重載模）。

## 驗

- [ ] 史數載正無缺時戳
- [ ] Isolation Forest 偵測集已知異
- [ ] Prophet 模於圖捕日／週季節
- [ ] 警聯組時聯之異
- [ ] 根因偵識上游患
- [ ] 智警抑重警
- [ ] 危度算出合理分（0.5-0.9）
- [ ] 監服持運 7+ 日無崩
- [ ] 偽陽率 < 10%（對已標數驗）
- [ ] 關鍵事件真陽率 > 80%

## 忌

- **訓於含異之數**：基線訓期宜淨（無事件）→人查或用有標數
- **略季節**：靜模敗於日／週模→用 Prophet 或加時特
- **閾過敏**：99% 信域可標常峰→始 99.5% 依偽陽調
- **未處缺**：指標隙致模誤→固前處含插
- **低危致警疲**：過濾危度下限→重高信異
- **略系拓撲**：獨立視諸指標失連鎖敗→定依關係
- **模漂**：舊訓模陳→月重訓或系變時
- **資源爭**：每指標偵昂→先關鍵服或採樣

## 參

- `monitor-model-drift`
- `monitor-data-integrity`
- `setup-prometheus-monitoring`
- `forecast-operational-metrics`
