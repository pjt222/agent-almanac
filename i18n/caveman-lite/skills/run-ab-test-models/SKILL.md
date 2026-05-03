---
name: run-ab-test-models
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design and execute A/B tests for ML models in production using traffic
  splitting, statistical significance testing, and canary/shadow deployment.
  Measure performance differences and make data-driven rollout decisions. Use
  to validate a new model before full rollout, compare candidate models from
  different algorithms, measure business metric impact of model changes, or
  meet regulatory gradual rollout requirements.
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

# Run A/B Test for Models


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Execute controlled experiments comparing model versions using traffic splitting and statistical analysis.

## When to Use

- Deploying a new model version and validating improvement before full rollout
- Comparing multiple candidate models from different algorithms or features
- Testing impact of hyperparameter changes on business metrics
- Measuring model performance in production without risking full traffic
- Regulatory requirements for gradual rollout (e.g., medical ML)
- Evaluating cost-performance tradeoffs between model sizes

## Inputs

- **Required**: Champion model (current production version)
- **Required**: Challenger model(s) (new version to test)
- **Required**: Traffic allocation percentage (e.g., 5% to challenger)
- **Required**: Success metrics (business and ML)
- **Required**: Minimum sample size or test duration
- **Optional**: Guardrail metrics (latency, error rate thresholds)
- **Optional**: User segments for stratified testing

## Procedure

### Step 1: Design Experiment

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

**Got:** Experiment config with statistically sound sample size — typically 5-10k samples per variant for 5-10% MDE.

**If fail:** With required sample size too large, increase traffic allocation, extend duration, or accept larger MDE; verify baseline metric estimate is accurate; consider sequential testing for continuous monitoring.

### Step 2: Implement Traffic Splitting

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

**Got:** Consistent user-to-variant assignment, accurate traffic split matching configured percentages, all assignments logged.

**If fail:** Verify hash function produces uniform distribution (test with 10k user IDs), check user_id is stable across requests (not session_id), ensure logs capture all prediction events, validate traffic split in first 1000 requests.

### Step 3: Implement Shadow Deployment (Optional)

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

**Got:** Champion predictions served with normal latency, challenger predictions logged async without blocking, prediction differences captured.

**If fail:** Set challenger timeout < champion SLA to avoid blocking, handle challenger errors gracefully, monitor memory usage (two models loaded), consider sampling (log only 10% of shadow predictions).

### Step 4: Collect and Analyze Metrics

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

**Got:** Statistical test results with p-values, confidence intervals, and clear decision (rollout/keep/inconclusive) — typically after 7-14 days or reaching sample size.

**If fail:** Verify ground truth labels are available (may need delayed analysis), check for sample ratio mismatch (SRM) indicating assignment bugs, ensure sufficient sample size reached, look for novelty/primacy effects in early data, consider sequential testing if fixed-horizon test is too slow.

### Step 5: Monitor Guardrail Metrics

Continuously check that challenger does not violate safety thresholds.

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Guardrail violations detected within 5-15 minutes, automated experiment stop if critical thresholds breached (latency, errors), alerts sent to team.

**If fail:** Verify guardrail thresholds are realistic (not too tight), ensure monitoring loop is running continuously, check that stop_experiment() actually updates routing, test alert delivery channels.

### Step 6: Make Rollout Decision

Based on results, decide whether to roll out the challenger.

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Clear decision (full/gradual rollout, keep champion, or extend test) with justification and action items.

**If fail:** With unclear decision, perform subgroup analysis (by user segment, time of day, device type), check for interaction effects, review business context (e.g., is 2% lift worth engineering cost?), consult stakeholders.

## Validation

- [ ] Traffic split matches configured percentages (within 1%)
- [ ] Same user always assigned to same variant (consistency check)
- [ ] Sample size calculation produces reasonable numbers (5-50k per variant)
- [ ] Statistical tests produce p-values consistent with manual calculation
- [ ] Guardrail violations trigger alerts within 5 minutes
- [ ] Shadow deployment shows <5% prediction divergence between models
- [ ] Experiment reports include confidence intervals
- [ ] Rollout decision documented with justification

## Pitfalls

- **Sample ratio mismatch (SRM)**: If observed traffic split differs from configured (e.g., 95/5 becomes 92/8), indicates assignment bug; check hash function uniformity
- **Peeking**: Checking results before reaching sample size inflates Type I error; use sequential testing or wait for pre-determined end date
- **Novelty effect**: Users respond differently to new model initially; run for 2+ weeks to see steady-state behavior
- **Carryover effects**: Previous variant exposure affects current behavior; use new users or sufficient washout period
- **Multiple testing**: Testing many metrics increases false positive risk; correct with Bonferroni or focus on single primary metric
- **Insufficient power**: Small traffic allocation may require months to detect realistic effects; balance statistical power with risk tolerance
- **Ignoring segments**: Aggregate lift may hide negative impact on important user segments; perform subgroup analysis
- **Attribution errors**: Ensure outcome metrics correctly attributed to model predictions (not other system changes)

## Related Skills

- `deploy-ml-model-serving` - Model deployment infrastructure and versioning
- `monitor-model-drift` - Ongoing performance monitoring post-rollout
