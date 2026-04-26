---
name: label-training-data
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Set up systematic data labeling workflows using Label Studio or similar tools. Implement
  quality controls, measure inter-annotator agreement, manage labeler teams, and integrate
  labeled data into ML training pipelines. Use when starting a supervised ML project that
  requires labeled training data, when model performance is limited by insufficient labeled
  examples, when labeling text, images, audio, or video, or when implementing active learning
  to prioritize the most valuable examples.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: basic
  language: multi
  tags: labeling, label-studio, annotation, inter-annotator-agreement, data-quality, active-learning
---

# 標記訓練數據


> 見 [Extended Examples](references/EXAMPLES.md) 供完整配置文件與模板。

以品控與高效工作流系統標記監督式 ML 數據。

## 適用時機

- 始需標記訓練數據之監督 ML 項目
- 當前模型性能受限於不足之標記例
- 需標記文本、圖、音或視頻數據
- 欲測並改進標注品
- 管異專業水平之標注團隊
- 行主動學習以優先有值之例
- 需追蹤標記進度與成本
- 確跨多標注者之一致標籤

## 輸入

- **必要**：未標數據集（圖、文、音、視）
- **必要**：標籤模式（類、屬性或標注類型）
- **必要**：標注指南文件
- **選擇性**：既有標籤（供品質比較）
- **選擇性**：供預標注之模型預測
- **選擇性**：預算與時間線約束
- **選擇性**：難例供之域專家可用

## 步驟

### 步驟一：裝並配 Label Studio

設 Label Studio 為標注平台。

```bash
# Install Label Studio
pip install label-studio

# Or use Docker for production
docker pull heartexlabs/label-studio:latest

# Create project directory
mkdir -p labeling-project/{data,exports,config}
cd labeling-project

# Initialize Label Studio
label-studio init my_project

# Start Label Studio server
label-studio start my_project --port 8080
```

於 `http://localhost:8080` 訪（默認憑證：首訪時創）。

生產以 Docker 部署：

```bash
# docker-compose.yml
version: '3.8'

services:
  label-studio:
    image: heartexlabs/label-studio:latest
    ports:
      - "8080:8080"
# ... (see EXAMPLES.md for complete implementation)
```

```bash
docker-compose up -d
```

**預期：** Label Studio 運行可訪，PostgreSQL 資料庫已為生產用初始化。

**失敗時：** 若 8080 端口已佔則於配中換端口，若 Docker 敗查 Docker 守護進程運行，確數據卷有足磁空，查防火牆允 8080 端口。

### 步驟二：設計標注介面與模式

為任務類型創標注配置。

```python
# labeling-project/config/labeling_config.py
"""
Label Studio configuration templates for common tasks.
"""

# Text Classification (single label)
TEXT_CLASSIFICATION = """
<View>
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 標注介面以任務類型之適當控件已配，數據成功導入，標注者可訪介面。

**失敗時：** 以 Label Studio 之配驗器驗 XML 配，查數據文件格式（JSON 或 CSV），若用外存儲確圖/音 URL 可訪，驗 API 鍵有正權。

### 步驟三：備數據並行取樣策略

格式化數據供導入並為標注優先例。

```python
# labeling-project/prepare_data.py
import pandas as pd
import json
import random
from typing import List, Dict
from sklearn.cluster import KMeans
import numpy as np

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 數據已為 Label Studio 導入正確格式化，取樣策略優先信息性例，任務含供追蹤之元數據。

**失敗時：** 以 `jq` 或 Python json.load() 驗 JSON 格式，若用遠程圖查 URL 可訪，確無特殊字符破 JSON 編碼，驗列名匹配配。

### 步驟四：行品控與 IAA 測量

設流程以測並改注品。

```python
# labeling-project/quality_control.py
import pandas as pd
import numpy as np
from sklearn.metrics import cohen_kappa_score, confusion_matrix
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 注者間同意已測（Cohen's Kappa > 0.6 為中度，>0.8 為佳），難任務已識供審，注者性能已追。

**失敗時：** 若 Kappa 甚低（<0.4），審標注指南之清，重訓注者，簡標籤模式，查模糊例，思用專家注者作金標。

### 步驟五：匯出並整合標記數據

匯標並備供 ML 訓練。

```python
# labeling-project/export_labels.py
import requests
import pandas as pd
import json
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 注已以訓練就緒格式匯，標籤分佈平衡或已記，訓練前數據品已驗。

**失敗時：** 驗 API 鍵權，查匯格式與汝之 ML 框架兼容，優處缺注，驗 JSON 結構匹配預期格式。

### 步驟六：設連續標注管線

以主動學習整合自動化標注工作流。

```python
# labeling-project/active_learning_pipeline.py
import schedule
import time
import logging
from datetime import datetime
from prepare_data import DataSampler, prepare_label_studio_format
from export_labels import LabelStudioExporter, convert_to_training_format
import pandas as pd
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 主動學習自動擇信息性例，標注批每週備，有足新標時重訓模型。

**失敗時：** 若不確取樣不改模型則試多樣取樣，若注者跟不上則減批大小，監標注佇列長，若佇列長過大則行反壓。

## 驗證

- [ ] Label Studio 可訪並響應
- [ ] 標注介面直觀（以樣注者測）
- [ ] 數據導入成以正確格式
- [ ] 注者間同意（Cohen's Kappa）> 0.6
- [ ] 品控識問題任務
- [ ] 標匯以訓練就緒格式
- [ ] 標籤分佈合預期（或故意不平衡）
- [ ] 主動學習管線無人介入運行
- [ ] 注吞吐合項目時間線

## 常見陷阱

- **指南不清**：模糊指令致不一致標；投於附例之細指南
- **重疊不足**：無多注者每任務則不能測 IAA；用 10-20% 重疊
- **忽難例**：邊緣例常略而於模型韌性關鍵；標以供專家審
- **批效應**：注者疲勞或學習致時間不一致；隨機化任務序
- **無品反饋**：注者無反饋則不改；供常規準確報
- **錯取樣策略**：隨取樣費預算於易例；用不確或多樣取樣
- **孤標注**：複雜任務需域專家；初以新手與專家配對
- **未追成本**：標注貴；監每任務時與總預算消耗

## 相關技能

- `version-ml-data` - 標記數據集之版本控制
- `track-ml-experiments` - 追標加時模型性能
