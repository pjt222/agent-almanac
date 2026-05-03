---
name: run-ab-test-models
locale: wenyan-ultra
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

# 行 A/B 模測

> 全配與板見 [Extended Examples](references/EXAMPLES.md)。

於產分流、計析、金/影釋以較模本。

## 用

- 釋新模本欲驗於全→用
- 較異算/特之候模→用
- 試超參改於業指影→用
- 量產上模效不冒全流→用
- 監管漸釋（如醫 ML）→用
- 評費效衡（模大）→用

## 入

- **必**：冠模（當產本）
- **必**：挑模（試新本）
- **必**：流分比（如 5% 予挑）
- **必**：成指（業與 ML）
- **必**：最小樣或測時
- **可**：護指（延、誤率限）
- **可**：用段（分層測）

## 行

### 一：設驗

定測參、成準、計需。

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

得：驗配含計健全之樣大算，常 5-10k/變於 5-10% MDE。

敗：樣需過大→增分、延時、納大 MDE；驗基指準；考序測續察。

### 二：行流分

設路邏隨配請於模。

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

得：用-變一致配、流分準合配比、諸配記以析。

敗：驗散函生均勻（試 10k user_id）、查 user_id 跨請求穩（非 session_id）、確日誌捕諸測事件、首 1000 請驗分。

### 三：行影釋（可）

並行挑模而不擾用（影模）。

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

得：冠測常延供、挑測異步記不阻、測異捕以析。

敗：挑超時 < 冠 SLA、優雅理挑誤、察記憶（兩模載）、考採樣（記 10% 影測）。

### 四：採析指

集驗資、行計測。

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

得：計測果含 p、信區、明決（釋/留/未定），常 7-14 日後或達樣。

敗：驗真標可（或需延析）、查樣比錯（SRM）示配漏、足樣達、察初新/首因、考序測若定平太緩。

### 五：察護指

續查挑不破安限。

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

得：護違 5-15 分內察、自停若關限破（延、誤）、警送組。

敗：驗護限現實（不過嚴）、確察循環續行、查 stop_experiment() 真更路、測警送。

### 六：作釋決

按驗果決挑釋否。

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

得：明決（全/漸釋、留冠、延測）含理與行項。

敗：決不明→行子組析（按段、時、機）、查互效、覆業境（2% 升值工本乎？）、徵相關方。

## 驗

- [ ] 流分合配比（內 1%）
- [ ] 同用恆配同變（一致查）
- [ ] 樣大算合理（5-50k/變）
- [ ] 計測 p 合手算
- [ ] 護違 5 分內警
- [ ] 影釋示模測異 < 5%
- [ ] 驗報含信區
- [ ] 釋決文錄附理

## 忌

- **樣比錯（SRM）**：察分異於配（95/5 變 92/8）→配漏；查散函均
- **窺**：未達樣前查果脹一型誤；用序測或待定終
- **新效**：用初應殊；行 ≥ 2 週見穩態
- **承效**：前變露擾今；用新用或足洗期
- **多測**：多指增假陽；以 Bonferroni 正或重一主指
- **力不足**：小流配需月察實效；平衡計力與險忍
- **忽段**：聚升可藏要段負影；行子組析
- **歸誤**：確指正歸於模測（非他系變）

## 參

- `deploy-ml-model-serving`
- `monitor-model-drift`
