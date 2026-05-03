---
name: run-ab-test-models
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design+exec A/B tests ML models in prod → traffic split, stat significance, canary/shadow. Measure perf diffs → data-driven rollout decision. Use → validate new ver pre-rollout, compare candidates, measure biz metric impact, regulatory gradual rollout.
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


> See [Extended Examples](references/EXAMPLES.md) for complete config + templates.

Controlled experiments comparing model vers via traffic split + stat analysis.

## Use When

- Deploy new model ver → validate pre-full-rollout
- Compare candidates (diff algos|features)
- Test hyperparam impact on biz metrics
- Measure prod perf w/o full traffic risk
- Regulatory gradual rollout (medical ML)
- Cost-perf tradeoff between sizes

## In

- **Required**: Champion (current prod ver)
- **Required**: Challenger(s) (new ver)
- **Required**: Traffic alloc % (e.g. 5% → challenger)
- **Required**: Success metrics (biz + ML)
- **Required**: Min sample size|test duration
- **Optional**: Guardrail metrics (latency, err threshold)
- **Optional**: User segments → stratified test

## Do

### Step 1: Design Experiment

Test params, success criteria, stat reqs.

```python
# ab_test/experiment_config.py
from dataclasses import dataclass
from typing import List, Dict
import numpy as np
from scipy.stats import norm


@dataclass
# ... (see EXAMPLES.md for complete implementation)
```

→ Stat-sound sample size calc, typically 5-10k/variant for 5-10% MDE.

If err: sample too large → ↑traffic alloc, ext duration, accept larger MDE; verify baseline accurate; sequential testing for continuous monitor.

### Step 2: Traffic Split

Routing → random model assign.

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

→ Consistent user→variant, accurate split, all assigns logged.

If err: verify hash uniform (test 10k user IDs); user_id stable cross-req (not session_id); logs capture all preds; validate split first 1000 reqs.

### Step 3: Shadow Deploy (Optional)

Challenger parallel w/o user impact.

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

→ Champion served normal latency, challenger logged async no-block, pred diffs captured.

If err: challenger timeout < champion SLA → no block; handle errs gracefully → no champion impact; monitor mem (2 models loaded); sample (log 10% shadow preds).

### Step 4: Collect+Analyze Metrics

Gather data → stat tests.

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

→ Stat results w/ p-vals, CIs, clear decision (rollout|keep|inconclusive), typically 7-14d|sample size hit.

If err: verify ground truth labels (may need delayed analysis); SRM check (assign bugs); sufficient sample; novelty/primacy in early data; sequential if fixed-horizon slow.

### Step 5: Monitor Guardrails

Continuous check → challenger no safety violation.

```python
# ab_test/guardrails.py
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

→ Violations detected 5-15min, auto-stop if critical breach (latency, errs), team alerts.

If err: thresholds realistic (not too tight); monitor loop running; stop_experiment() updates routing; test alert delivery.

### Step 6: Rollout Decision

Based on results → decide rollout.

```python
# ab_test/rollout_decision.py
import logging
from typing import Dict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# ... (see EXAMPLES.md for complete implementation)
```

→ Clear decision (full|gradual|keep|extend) + justification + actions.

If err: unclear → subgroup analysis (segment, time, device); interaction effects; biz ctx (2% lift worth eng cost?); consult stakeholders.

## Check

- [ ] Traffic split matches configured (within 1%)
- [ ] Same user → same variant (consistency)
- [ ] Sample size reasonable (5-50k/variant)
- [ ] Stat tests p-vals match manual calc
- [ ] Guardrail violations → alerts <5min
- [ ] Shadow shows <5% pred divergence
- [ ] Reports include CIs
- [ ] Decision documented w/ justification

## Traps

- **SRM**: Observed split ≠ configured (95/5→92/8) → assign bug; check hash uniformity
- **Peeking**: Check before sample size inflates Type I; sequential test or wait for end date
- **Novelty**: Users respond diff initially; run 2+ wks for steady state
- **Carryover**: Prev exposure affects current; new users|washout
- **Multi-test**: Many metrics ↑false pos; Bonferroni or single primary
- **Insufficient power**: Small alloc → months for realistic effects; balance power vs risk
- **Ignore segments**: Aggregate lift hides neg impact on segments; subgroup analysis
- **Attribution errs**: Outcome metrics correctly attributed to preds (not other changes)

## →

- `deploy-ml-model-serving` — deploy infra + versioning
- `monitor-model-drift` — ongoing perf monitor post-rollout
