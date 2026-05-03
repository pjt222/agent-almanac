---
name: run-ab-test-models
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design and execute A/B tests for ML models in production using traffic splitting,
  statistical significance testing, and canary/shadow deployment strategies. Measure
  performance differences and make data-driven decisions about model rollout. Use when
  validating a new model version before full rollout, comparing candidate models trained
  with different algorithms, measuring business metric impact of model changes, or when
  regulatory requirements mandate gradual rollout.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: ab-testing, canary, shadow-deployment, traffic-splitting, statistical-significance, experimentation
---

# 對模型執行 A/B 測試

> 詳見 [Extended Examples](references/EXAMPLES.md) 取得完整配置文件與範本。

以流量分割與統計分析比較模型版本之受控實驗。

## 適用時機

- 部署新模型版本，欲於全量推出前驗證改進
- 比較以不同演算法或特徵訓練之多個候選模型
- 測試超參數變化對業務指標之影響
- 須於生產量測模型表現而不冒全流量風險
- 法規要求漸進推出（如醫療 ML 系統）
- 評估模型尺寸間之成本-效能權衡

## 輸入

- **必要**：冠軍模型（當前生產版本）
- **必要**：挑戰者模型（待測之新版本）
- **必要**：流量分配比例（如挑戰者 5%）
- **必要**：成功指標（業務與 ML 指標）
- **必要**：最低樣本量或測試時長
- **選擇性**：護欄指標（延遲、錯誤率閾值）
- **選擇性**：分層測試之用戶區段

## 步驟

### 步驟一：設計實驗

定義測試參數、成功標準與統計要求。

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 實驗配置含統計健全之樣本量計算，通常每變體 5-10k 樣本以達 5-10% MDE。

**失敗時：** 若所需樣本量過大，提高流量分配、延長測試時長或接受更大 MDE；驗證基線指標估計準確；考慮序貫測試以連續監控。

### 步驟二：實作流量分割

設置路由邏輯以隨機分派請求至各模型。

```python
# ab_test/traffic_router.py
import hashlib
import random
from typing import Dict, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 用戶到變體之分派一致，流量分割比例符合配置，所有分派皆已記錄供分析。

**失敗時：** 驗證雜湊函數產生均勻分佈（以 10k 用戶 ID 測試）、確認 user_id 跨請求穩定（非 session_id）、確保日誌捕捉所有預測事件、於前 1000 請求驗證流量分割。

### 步驟三：實作影子部署（選擇性）

挑戰者模型平行執行而不影響用戶（影子模式）。

```python
# ab_test/shadow_deployment.py
import asyncio
from typing import Dict, Any
import logging
from concurrent.futures import ThreadPoolExecutor
import time

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 冠軍預測以正常延遲提供，挑戰者預測非同步記錄而不阻塞，預測差異已捕捉以供分析。

**失敗時：** 將挑戰者超時設小於冠軍 SLA 以避免阻塞；優雅處理挑戰者錯誤而不影響冠軍；監控記憶體用量（兩模型載入）；考慮取樣（僅記錄 10% 影子預測）。

### 步驟四：收集並分析指標

收集實驗資料並執行統計檢驗。

```python
# ab_test/analysis.py
import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 統計檢驗結果含 p 值、信賴區間與明確決策（推出/保留/不確定），通常於 7-14 日後或達樣本量時。

**失敗時：** 驗證真值標籤可用（可能需延遲分析）；檢查樣本比例不匹配（SRM）以識別分派錯誤；確保達足夠樣本量；於早期資料中尋找新奇/首因效應；若固定時程測試過慢，考慮序貫測試。

### 步驟五：監控護欄指標

持續檢查挑戰者未違反安全閾值。

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 護欄違規於 5-15 分鐘內偵測，關鍵閾值（延遲、錯誤）越界時自動停止實驗，警報送至團隊。

**失敗時：** 驗證護欄閾值合理（非過緊）；確保監控迴圈持續執行；檢查 stop_experiment() 函數確實更新路由；測試警報傳遞通道。

### 步驟六：作出推出決策

依實驗結果，決定是否推出挑戰者。

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 明確決策（全量/漸進推出、保留冠軍或延長測試），附理由與行動項。

**失敗時：** 若決策不明，執行子群分析（依用戶區段、時段、設備類型）；檢查交互效應；審視業務情境（如 2% 提升是否值得工程成本？）；與利害相關方諮詢。

## 驗證

- [ ] 流量分割符合配置比例（誤差 1% 內）
- [ ] 同一用戶始終分派至同一變體（一致性檢查）
- [ ] 樣本量計算產生合理數字（每變體 5-50k）
- [ ] 統計檢驗產生與手算一致之 p 值
- [ ] 護欄違規於 5 分鐘內觸發警報
- [ ] 影子部署顯示模型間預測差異 <5%
- [ ] 實驗報告含信賴區間
- [ ] 推出決策附理由已記錄

## 常見陷阱

- **樣本比例不匹配（SRM）**：若觀察到之流量分割異於配置（如 95/5 變 92/8），表示分派錯誤；檢查雜湊函數均勻性
- **偷看**：未達樣本量前查看結果會膨脹 Type I 錯誤；用序貫測試或等預定終結日
- **新奇效應**：用戶對新模型初期反應不同；執行 2 週以上以見穩態行為
- **延續效應**：先前變體曝露影響當前行為；用新用戶或足夠之沖洗期
- **多重檢驗**：測試眾多指標增加假陽性風險；以 Bonferroni 校正或聚焦單一主指標
- **檢力不足**：小流量分配可能需數月偵測現實效應；於統計檢力與風險容忍間平衡
- **忽視區段**：總體提升可能掩蓋對重要用戶區段之負面影響；執行子群分析
- **歸因錯誤**：確保結果指標正確歸因於模型預測（非其他系統變化）

## 相關技能

- `deploy-ml-model-serving` - 模型部署基礎設施與版本控制
- `monitor-model-drift` - 推出後之持續效能監控
