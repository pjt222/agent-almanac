---
name: run-ab-test-models
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
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Run A/B Test for Models


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Execute controlled experiments comparing model versions using traffic splitting and statistical analysis.

## 适用场景

- Deploying new model version and want to validate improvement before full rollout
- Comparing multiple candidate models trained with different algorithms or features
- Testing impact of hyperparameter changes on business metrics
- Need to measure model performance in production without risking full traffic
- Regulatory requirements for gradual rollout (e.g., medical ML systems)
- Evaluating cost-performance tradeoffs between model sizes

## 输入

- **必需**: Champion model (current production version)
- **必需**: Challenger model(s) (new version to test)
- **必需**: Traffic allocation percentage (e.g., 5% to challenger)
- **必需**: Success metrics (business and ML metrics)
- **必需**: Minimum sample size or test duration
- **可选**: Guardrail metrics (latency, error rate thresholds)
- **可选**: User segments for stratified testing

## 步骤

### 第 1 步：Design Experiment

Define test parameters, success criteria, and statistical requirements.

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** Experiment configuration with statistically sound sample size calculation, typically 5-10k samples per variant for 5-10% MDE.

**失败处理：** If required sample size too large, increase traffic allocation, extend test duration, or accept larger MDE; verify baseline metric estimate is accurate; consider sequential testing for continuous monitoring.

### 第 2 步：Implement Traffic Splitting

Set up routing logic to randomly assign requests to models.

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

**预期结果：** Consistent user-to-variant assignment, accurate traffic split matching configured percentages, all assignments logged for analysis.

**失败处理：** Verify hash function produces uniform distribution (test with 10k user IDs), check that user_id is stable across requests (not session_id), ensure logs capture all prediction events, validate traffic split in first 1000 requests.

### 第 3 步：Implement Shadow Deployment (Optional)

Run challenger model in parallel without affecting users (shadow mode).

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

**预期结果：** Champion predictions served with normal latency, challenger predictions logged asynchronously without blocking, prediction differences captured for analysis.

**失败处理：** Set challenger timeout < champion SLA to avoid blocking, handle challenger errors gracefully without affecting champion, monitor memory usage (two models loaded), consider sampling (log only 10% of shadow predictions).

### 第 4 步：Collect and Analyze Metrics

Gather experiment data and perform statistical tests.

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

**预期结果：** Statistical test results with p-values, confidence intervals, and clear decision (rollout/keep/inconclusive), typically after 7-14 days or reaching sample size.

**失败处理：** Verify ground truth labels are available (may need delayed analysis), check for sample ratio mismatch (SRM) indicating assignment bugs, ensure sufficient sample size reached, look for novelty/primacy effects in early data, consider sequential testing if fixed-horizon test is too slow.

### 第 5 步：Monitor Guardrail Metrics

Continuously check that challenger doesn't violate safety thresholds.

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** Guardrail violations detected within 5-15 minutes, automated experiment stop if critical thresholds breached (latency, errors), alerts sent to team.

**失败处理：** Verify guardrail thresholds are realistic (not too tight), ensure monitoring loop is running continuously, check that stop_experiment() function actually updates routing, test alert delivery channels.

### 第 6 步：Make Rollout Decision

Based on experiment results, decide whether to rollout challenger.

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** Clear decision (full/gradual rollout, keep champion, or extend test) with justification and action items.

**失败处理：** If decision unclear, perform subgroup analysis (by user segment, time of day, device type), check for interaction effects, review business context (e.g., is 2% lift worth engineering cost?), consult with stakeholders.

## 验证清单

- [ ] Traffic split matches configured percentages (within 1%)
- [ ] Same user always assigned to same variant (consistency check)
- [ ] Sample size calculation produces reasonable numbers (5-50k per variant)
- [ ] Statistical tests produce p-values consistent with manual calculation
- [ ] Guardrail violations trigger alerts within 5 minutes
- [ ] Shadow deployment shows <5% prediction divergence between models
- [ ] Experiment reports include confidence intervals
- [ ] Rollout decision documented with justification

## 常见问题

- **Sample ratio mismatch (SRM)**: If observed traffic split differs from configured (e.g., 95/5 becomes 92/8), indicates assignment bug; check hash function uniformity
- **Peeking**: Checking results before reaching sample size inflates Type I error; use sequential testing or wait for pre-determined end date
- **Novelty effect**: Users respond differently to new model initially; run for 2+ weeks to see steady-state behavior
- **Carryover effects**: Previous variant exposure affects current behavior; use new users or sufficient washout period
- **Multiple testing**: Testing many metrics increases false positive risk; correct with Bonferroni or focus on single primary metric
- **Insufficient power**: Small traffic allocation may require months to detect realistic effects; balance statistical power with risk tolerance
- **Ignoring segments**: Aggregate lift may hide negative impact on important user segments; perform subgroup analysis
- **Attribution errors**: Ensure outcome metrics correctly attributed to model predictions (not other system changes)

## 相关技能

- `deploy-ml-model-serving` - Model deployment infrastructure and versioning
- `monitor-model-drift` - Ongoing performance monitoring post-rollout
