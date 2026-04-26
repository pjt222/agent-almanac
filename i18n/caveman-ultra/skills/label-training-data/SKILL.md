---
name: label-training-data
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Setup systematic data labeling via Label Studio or similar. QC, inter-
  annotator agreement, labeler teams, integrate labeled data into ML pipelines.
  Use starting supervised ML needing labeled data, model perf limited by
  insufficient labels, labeling text/image/audio/video, or active learning to
  prioritize valuable examples.
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

# Label Training Data


> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.

Systematically label data for supervised ML w/ QC + efficient workflows.

## Use When

- Start supervised ML needing labeled data
- Model perf limited by insufficient examples
- Label text, images, audio, video
- Measure + improve annotation quality
- Team of annotators w/ diff expertise
- Active learning → prioritize valuable examples
- Track progress + costs
- Consistent labels across multi annotators

## In

- **Req**: Unlabeled dataset (images, text, audio, video)
- **Req**: Label schema (classes, attributes, annotation types)
- **Req**: Labeling guidelines doc
- **Opt**: Pre-existing labels (quality compare)
- **Opt**: Model predictions for pre-annotation
- **Opt**: Budget + timeline
- **Opt**: Domain expert availability

## Do

### Step 1: Install + Config Label Studio

Setup labeling platform.

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

Access `http://localhost:8080` (default creds: create on first visit).

Prod deploy w/ Docker:

```bash
# docker-compose.yml
version: '3.8'

services:
  label-studio:
    image: heartexlabs/label-studio:latest
    ports:
      - "8080:8080"
# ... (see EXAMPLES.md)
```

```bash
docker-compose up -d
```

→ Label Studio running + accessible, PostgreSQL DB init for prod.

**If err:** Port 8080 busy → change port in config. Docker fails → check daemon running. Ensure disk space for data vols. Firewall allows 8080.

### Step 2: Design Interface + Schema

Create labeling config for task type.

```python
# labeling-project/config/labeling_config.py
"""
Label Studio configuration templates for common tasks.
"""

# Text Classification (single label)
TEXT_CLASSIFICATION = """
<View>
# ... (see EXAMPLES.md)
```

→ Interface configured w/ appropriate controls for task type, data imported, interface accessible to annotators.

**If err:** Validate XML config w/ Label Studio validator. Check data file format (JSON / CSV). Ensure image/audio URLs accessible if external storage. Verify API key perms.

### Step 3: Prepare Data + Sampling Strategy

Format data for import + prioritize for labeling.

```python
# labeling-project/prepare_data.py
import pandas as pd
import json
import random
from typing import List, Dict
from sklearn.cluster import KMeans
import numpy as np

# ... (see EXAMPLES.md)
```

→ Data formatted for Label Studio import, sampling prioritizes informative examples, tasks include metadata for tracking.

**If err:** Verify JSON w/ `jq` / Py json.load(). Check URLs accessible if remote images. Ensure no special chars break JSON. Validate column names match config.

### Step 4: QC + IAA Measurement

Setup processes to measure + improve quality.

```python
# labeling-project/quality_control.py
import pandas as pd
import numpy as np
from sklearn.metrics import cohen_kappa_score, confusion_matrix
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
# ... (see EXAMPLES.md)
```

→ IAA measured (Cohen's Kappa > 0.6 = moderate, >0.8 = good), difficult tasks ID'd for review, annotator perf tracked.

**If err:** Kappa very low (<0.4) → review guidelines for clarity, retrain annotators, simplify schema, check ambiguous examples, consider expert annotators for gold std.

### Step 5: Export + Integrate Labeled Data

Export labels + prep for ML training.

```python
# labeling-project/export_labels.py
import requests
import pandas as pd
import json
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)
# ... (see EXAMPLES.md)
```

→ Annotations exported training-ready format, label distribution balanced / documented, data quality validated before training.

**If err:** Verify API key perms. Check export format compat w/ ML framework. Handle missing annotations gracefully. Validate JSON matches expected.

### Step 6: Continuous Labeling Pipeline

Automate workflow w/ active learning.

```python
# labeling-project/active_learning_pipeline.py
import schedule
import time
import logging
from datetime import datetime
from prepare_data import DataSampler, prepare_label_studio_format
from export_labels import LabelStudioExporter, convert_to_training_format
import pandas as pd
# ... (see EXAMPLES.md)
```

→ Active learning selects informative examples auto, batches prep weekly, model retrained when sufficient new labels avail.

**If err:** Uncertainty sampling doesn't improve model → try diversity sampling. Annotators can't keep up → reduce batch size. Monitor queue length, backpressure if queue grows.

## Check

- [ ] Label Studio accessible + responsive
- [ ] Interface intuitive (test w/ sample annotator)
- [ ] Data import successful w/ correct format
- [ ] IAA (Cohen's Kappa) > 0.6
- [ ] QC IDs problematic tasks
- [ ] Labels export training-ready
- [ ] Distribution matches expected (or intentionally imbalanced)
- [ ] Active learning pipeline runs w/o manual intervention
- [ ] Throughput meets timeline

## Traps

- **Unclear guidelines**: Ambiguous → inconsistent labels. Invest detailed guidelines + examples.
- **Insufficient overlap**: Can't measure IAA w/o multi annotators per task. 10-20% overlap.
- **Ignore difficult cases**: Edge cases often skipped, critical for robustness. Flag for expert review.
- **Batch effects**: Annotator fatigue / learning → temporal inconsistency. Randomize task order.
- **No quality feedback**: Annotators don't improve w/o feedback. Regular accuracy reports.
- **Wrong sampling**: Random wastes budget on easy. Use uncertainty / diversity sampling.
- **Labeling in isolation**: Domain experts needed for complex tasks. Pair novices w/ experts initially.
- **Not tracking costs**: Labeling expensive. Monitor time per task + budget consumption.

## →

- `version-ml-data` — version control for labeled datasets
- `track-ml-experiments` — track model perf as labels added
