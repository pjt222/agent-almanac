---
name: label-training-data
locale: wenyan
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

# 標訓練數據


> 完整配置檔案與樣板，見 [Extended Examples](references/EXAMPLES.md)。

以質控與高效工作流系統化標監督 ML 數據。

## 用時

- 啟監督 ML 項目需標訓練數據
- 當前模型之效為標例不足所限
- 需標文字、影像、音頻、或影片數據
- 欲量並改標註之質
- 管專長異之標員團隊
- 施主動學習以優價值之例
- 需追標註進度與成本
- 於多標員保持標一致

## 入

- **必要**：未標數據（影像、文字、音頻、影片）
- **必要**：標模式（類、屬、或標註類型）
- **必要**：標指引文件
- **可選**：既有之標（為質比）
- **可選**：預標之模型預測
- **可選**：預算與時程約束
- **可選**：難例之域專家可得性

## 法

### 第一步：裝並設 Label Studio

立 Label Studio 為標平台。

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

於 `http://localhost:8080` 訪之（預設憑證：首訪時建）。

產線以 Docker 佈：

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

**得：**Label Studio 運行可達，產線用 PostgreSQL 數據庫已初始。

**敗則：**若埠 8080 占用則改配置之埠；Docker 敗則察 daemon 是否運行；確數據卷盤空間足；察防火牆允埠 8080。

### 第二步：設標介面與模式

為任務類型建標配置。

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

**得：**標介面以任務類型合之控件已設，數據已導入，介面可為標員訪。

**敗則：**以 Label Studio 之配置驗器驗 XML 配置；察數據檔格式（JSON 或 CSV）；若用外部存儲確影像／音頻 URL 可達；驗 API 金鑰權限正。

### 第三步：備數據並施採樣策略

格式數據以入，優標之例。

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

**得：**數據正格式以 Label Studio 入，採樣策略優具資訊之例，任務含追蹤之元數據。

**敗則：**以 `jq` 或 Python json.load() 驗 JSON 格式；若用遠端影像察 URL 可達；確無特殊字元破 JSON 編碼；驗列名合配置。

### 第四步：施質控與 IAA 量測

立察並改標註質之程。

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

**得：**標員間一致性已量（Cohen 之 Kappa > 0.6 中等、> 0.8 佳），難任務已辨以審，標員效能已追。

**敗則：**若 Kappa 極低 (<0.4)，審標指引之明；重訓標員；簡標模式；察曖昧之例；慮以專家標為金標準。

### 第五步：出並合標數據

出標並備 ML 訓練。

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

**得：**標註以可訓格式出，標分布平衡或有記，數據質於訓前已驗。

**敗則：**驗 API 金鑰權限；察出格式與 ML 框架之相容；優雅處理闕之標註；驗 JSON 結構合預期格式。

### 第六步：立續標管線

以主動學習合自動化標工作流。

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

**得：**主動學習自動擇具資訊之例，每週備標批，新標足時重訓模型。

**敗則：**若不確定性採樣未改模型，試多樣採樣；標員不能跟則減批量；監標隊列長；隊列過長則施反壓。

## 驗

- [ ] Label Studio 可達且應答
- [ ] 標介面直觀（以樣本標員試之）
- [ ] 數據導入以正格式成
- [ ] 標員間一致性（Cohen 之 Kappa）> 0.6
- [ ] 質控辨問題之任務
- [ ] 標以可訓格式出
- [ ] 標分布合預期（或故不平衡）
- [ ] 主動學習管線無需人介入而運行
- [ ] 標註吞吐合項目時程

## 陷

- **指引不明**：曖指令致不一標；投詳指引附例
- **重疊不足**：無多標員於任則 IAA 不可量；用 10-20% 重疊
- **忽難例**：邊緣例常被跳而於模型穩健為關鍵；標為專家審
- **批效應**：標員疲倦或學致時間上不一；隨機任務序
- **無質反饋**：標員無反饋則不改；予常規準確度報
- **採樣策略訛**：隨機採樣耗預算於易例；用不確定性或多樣採樣
- **獨標**：複雜任需域專家；初以新手配專家
- **不追成本**：標昂；監每任時間與總預算耗

## 參

- `version-ml-data` — 標數據集之版本控制
- `track-ml-experiments` — 隨標增追模型效能
