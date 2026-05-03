---
name: run-ab-test-models
locale: caveman
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

# Run A/B Test for Models


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Run controlled experiments comparing model versions with traffic split + statistical analysis.

## When Use

- Deploy new model version, want validate before full rollout
- Compare multiple candidate models (different algorithms, features)
- Test impact of hyperparameter changes on business metrics
- Measure model performance in prod without risk full traffic
- Regulatory needs gradual rollout (medical ML)
- Judge cost-performance tradeoffs between model sizes

## Inputs

- **Required**: Champion model (current prod)
- **Required**: Challenger model(s) (new version to test)
- **Required**: Traffic allocation % (e.g., 5% to challenger)
- **Required**: Success metrics (business + ML)
- **Required**: Min sample size or test duration
- **Optional**: Guardrail metrics (latency, error rate thresholds)
- **Optional**: User segments for stratified testing

## Steps

### Step 1: Design Experiment

Define test parameters, success criteria, statistical needs.

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Experiment config with stat-sound sample size calc, typical 5-10k samples per variant for 5-10% MDE.

**If fail:** Sample too large? Up traffic allocation, extend duration, or accept larger MDE; verify baseline metric estimate; consider sequential testing.

### Step 2: Implement Traffic Splitting

Set up routing — randomly assign requests to models.

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

**Got:** Consistent user-to-variant assignment, accurate traffic split matches configured %, all assignments logged.

**If fail:** Verify hash uniform (test 10k user IDs), check user_id stable across requests (not session_id), logs capture all predictions, validate split in first 1000 requests.

### Step 3: Implement Shadow Deployment (Optional)

Run challenger in parallel without affecting users (shadow mode).

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

**Got:** Champion served at normal latency, challenger logged async without blocking, prediction diffs captured.

**If fail:** Set challenger timeout < champion SLA, handle challenger errors gracefully, monitor memory (two models loaded), consider sampling (log 10% of shadow predictions).

### Step 4: Collect and Analyze Metrics

Gather data, run statistical tests.

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

**Got:** Stat test results with p-values, CIs, clear decision (rollout/keep/inconclusive), typical after 7-14 days or sample size.

**If fail:** Verify ground truth labels available (delayed analysis maybe), check sample ratio mismatch (SRM = assignment bugs), enough sample size, look for novelty/primacy effects in early data, consider sequential testing if fixed-horizon too slow.

### Step 5: Monitor Guardrail Metrics

Continuous check challenger does not violate safety thresholds.

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Guardrail violations detected within 5-15 min, auto stop if critical thresholds breached (latency, errors), alerts to team.

**If fail:** Verify thresholds realistic (not too tight), monitoring loop runs continuous, check stop_experiment() updates routing, test alert delivery.

### Step 6: Make Rollout Decision

From results, decide rollout challenger.

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Clear decision (full/gradual rollout, keep champion, extend test) with justification + action items.

**If fail:** Decision unclear? Subgroup analysis (segment, time, device), check interaction effects, review business context (2% lift worth eng cost?), consult stakeholders.

## Checks

- [ ] Traffic split matches configured % (within 1%)
- [ ] Same user always to same variant
- [ ] Sample size calc reasonable (5-50k per variant)
- [ ] Stat tests produce p-values consistent with manual calc
- [ ] Guardrail violations trigger alerts within 5 min
- [ ] Shadow deployment shows <5% prediction divergence
- [ ] Reports include CIs
- [ ] Rollout decision documented

## Pitfalls

- **Sample ratio mismatch (SRM)**: Observed split differs from configured (95/5 becomes 92/8) = assignment bug; check hash uniformity
- **Peeking**: Check results before sample size inflates Type I error; use sequential testing or wait for pre-set end date
- **Novelty effect**: Users respond different to new model at first; run 2+ weeks for steady state
- **Carryover effects**: Prev variant exposure affects current; use new users or washout
- **Multiple testing**: Many metrics = false positive risk; correct with Bonferroni or single primary metric
- **Insufficient power**: Small allocation = months to detect; balance power with risk
- **Ignore segments**: Aggregate lift hides negative on important segments; subgroup analysis
- **Attribution errors**: Outcome metrics attributed to predictions (not other system changes)

## See Also

- `deploy-ml-model-serving` - Model deployment infra, versioning
- `monitor-model-drift` - Post-rollout monitoring
