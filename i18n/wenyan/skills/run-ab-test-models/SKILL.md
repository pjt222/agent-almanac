---
name: run-ab-test-models
locale: wenyan
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

# 行模型 A/B 試

> 詳備之配置與模板，參 [Extended Examples](references/EXAMPLES.md)。

於生產之模型，分流量、行統計之析，以行受控之試。

## 用時

- 新模欲驗其改善，於全展之前乃用
- 比數候選之模（異算法或異特徵所訓）乃用
- 試超參之變於業務指標之影乃用
- 量模於生產之效，而不冒全流量之險乃用
- 監管之求漸進展（如醫用 ML）乃用
- 模大小之費效權衡乃用

## 入

- **必要**：冠軍之模（當前生產之版）
- **必要**：挑戰之模（欲試之新版）
- **必要**：流量之分（如挑戰者得 5%）
- **必要**：成之指（業務與 ML 之指）
- **必要**：最少樣或試之時
- **可選**：護欄之指（延、誤率之閾）
- **可選**：分層之用者群

## 法

### 第一步：設試

定試之參、成之準、統計之求。

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

得：試之配有統計之確算樣本，常每變 5-10k 樣於 5-10% 之 MDE。

敗則：所求樣過大，則增流量之分、延試之時、或受較大之 MDE；驗基線估之確；或行序試以續察。

### 第二步：施流量之分

設路由之邏，隨機分請於諸模。

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

得：用者之分一致，流量之分合所配，諸分皆記以析。

敗則：驗哈希之均（試以 10k user_id）；user_id 跨請穩（非 session_id）；日誌捕諸預測；於前 1000 請驗其分。

### 第三步：施影子之展（可選）

行挑戰者於並，而不影用者（影子模）。

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

得：冠軍以常延供，挑戰者異步而記不阻，預測之差皆捕以析。

敗則：挑戰者超時宜短於冠軍 SLA 以免阻；挑戰者誤宜柔處而不影冠軍；察記憶之用（二模並載）；可採樣（唯記 10% 影子預測）。

### 第四步：採與析指

聚試之數，行統計之試。

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

得：統計試之果含 p 值、置信區、與明決（展/留/未決），常於 7-14 日後或樣達。

敗則：驗真標可得（或須延析）；察樣比之失（SRM）示分配之誤；驗樣達；察初期之新奇/首因；若定期試慢，則考序試。

### 第五步：監護欄之指

續察挑戰者不破安全之閾。

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

得：護欄之違 5-15 分內察之，要閾破則自止試（延、誤），警送團隊。

敗則：驗護欄之閾合實（非過嚴）；確監循環續行；驗 stop_experiment() 實更路由；試警之送渠。

### 第六步：作展之決

依試果決是否展挑戰者。

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

得：明決（全展/漸展、留冠軍、或延試），附其由與行項。

敗則：決不明，則行子群之析（依用群、時、設備）；察交互之效；察業務之境（如 2% 之升值工程之費乎）；諮利益相關者。

## 驗

- [ ] 流量之分合所配（差於 1% 內）
- [ ] 同用者常分同變（一致察）
- [ ] 樣大算合理（每變 5-50k）
- [ ] 統計試之 p 值合人手算
- [ ] 護欄之違 5 分內觸警
- [ ] 影子展示模間預測之差 <5%
- [ ] 試報含置信區
- [ ] 展之決有書面之由

## 陷

- **樣比之失（SRM）**：察之分異於所配（如 95/5 變 92/8）示分配之誤；察哈希之均
- **窺**：未達樣前察果，膨第一型誤；用序試，或俟預定之終
- **新奇之效**：用者初應新模有異；行二週以上以見穩態
- **遺留之效**：前變之曝影當前之為；用新用或足之洗期
- **多試**：試多指增假陽之險；以 Bonferroni 校，或專一首指
- **力不足**：流量之分小者，欲察實效或需數月；權衡力與險
- **忽群**：總升或藏要群之負影；行子群之析
- **歸因之誤**：果指確歸於模之預（非他系統之變）

## 參

- `deploy-ml-model-serving` — 模展之基與版控
- `monitor-model-drift` — 展後續察之效
