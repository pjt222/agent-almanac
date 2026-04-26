---
name: label-training-data
locale: wenyan-ultra
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


> 全配置文件與模板詳見 [Extended Examples](references/EXAMPLES.md)。

以 Label Studio 系統標 ML 監督數據，附質控與高效流程。

## 用

- 啟需標數據之監督 ML 項目
- 模型因標例不足而性能限
- 標文、圖、音、視數據
- 量並改註質
- 管多技能註者隊
- 施主動學以擇要例
- 追進度與本
- 確多註者間標一致

## 入

- **必**：未標數據集（圖、文、音、視）
- **必**：標模（類、屬、或註型）
- **必**：標指南文
- **可**：既標（質比）
- **可**：模預測用於預註
- **可**：預算與期約
- **可**：難例處有域專家

## 行

### 一：裝並配 Label Studio

以 Label Studio 為標平台：

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

訪 `http://localhost:8080`（首訪時造憑）。

生產 Docker 部署：

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

得：Label Studio 運行可訪，生產用 PostgreSQL 已初。

敗：8080 占→改配置；Docker 敗→查守護進程；確磁足容數據卷；查防火牆許 8080。

### 二：設標接口與模

為任型造標配：

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

得：標接口按任型配適當控件，數據導入成，註者可訪接口。

敗：以 Label Studio 配驗器驗 XML；查數據文件格式（JSON 或 CSV）；若用外部存→確圖/音 URL 可訪；驗 API 鍵權限正。

### 三：備數據並施採樣策略

格化數據以導並優先標例：

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

得：數據正格化以導 Label Studio，採樣策略優先信息例，任含追蹤元。

敗：以 `jq` 或 Python json.load() 驗 JSON 格；若用遠圖→確 URL 可訪；確無特殊字符破 JSON 編；驗列名匹配置。

### 四：施質控與 IAA 量

立量並改註質之過程：

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

得：註者間一致量（Cohen's Kappa > 0.6 中，> 0.8 佳），難任識待審，註者性能追。

敗：Kappa 極低（< 0.4）→審標指南之明、再訓註者、簡標模、察歧例、考用專家註為金標。

### 五：出並合標數據

出標並備 ML 訓：

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

得：註以訓備格出，標分布平衡或記，訓前驗數據質。

敗：驗 API 鍵權；察出格與 ML 框兼容；優處缺註；驗 JSON 結構匹預期格。

### 六：立連續標管線

以主動學合自動化標流程：

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

得：主動學自動擇信息例，週備標批，新標足時重訓模。

敗：若不確採樣不改模→試多樣採樣；註者趕不上→減批大；監標隊長；隊過大施反壓。

## 驗

- [ ] Label Studio 可訪且響應
- [ ] 標接口直觀（試樣註者）
- [ ] 數據導入成且格正
- [ ] 註者間一致（Cohen's Kappa）> 0.6
- [ ] 質控識問題任
- [ ] 標以訓備格出
- [ ] 標分布匹預期（或意偏）
- [ ] 主動學管線無手動運行
- [ ] 註吞吐合項目期

## 忌

- **指南不清**：歧指示致標不一；投詳指南附例
- **重疊不足**：無多註者→不可量 IAA；用 10-20% 重疊
- **忽難例**：邊緣常略而對模堅健關鍵；標待專家審
- **批效**：註者倦或學致時間不一；隨任序
- **無質反饋**：無反饋註者不改；常精度報告
- **採樣錯**：隨採費預算於易例；用不確或多樣採樣
- **獨立標**：複任需域專家；初新手配專家
- **不追本**：標昂；監任時與總預算耗

## 參

- `version-ml-data` - 標數據集之版控
- `track-ml-experiments` - 追模性能隨標增
