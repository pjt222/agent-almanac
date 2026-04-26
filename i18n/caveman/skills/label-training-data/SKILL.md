---
name: label-training-data
locale: caveman
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

# Label Training Data


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Systematically label data for supervised ML with quality controls and efficient workflows.

## When Use

- Starting supervised ML project requiring labeled training data
- Current model performance limited by insufficient labeled examples
- Need to label text, images, audio, video data
- Want to measure and improve annotation quality
- Managing team of annotators with different expertise levels
- Implementing active learning to prioritize valuable examples
- Need to track labeling progress and costs
- Ensuring consistent labels across multiple annotators

## Inputs

- **Required**: Unlabeled dataset (images, text, audio, video)
- **Required**: Label schema (classes, attributes, annotation types)
- **Required**: Labeling guidelines document
- **Optional**: Pre-existing labels (for quality comparison)
- **Optional**: Model predictions for pre-annotation
- **Optional**: Budget and timeline constraints
- **Optional**: Domain expert availability for difficult examples

## Steps

### Step 1: Install and Configure Label Studio

Set up Label Studio as labeling platform.

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

Access at `http://localhost:8080` (default credentials: create on first visit).

For production deployment with Docker:

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

**Got:** Label Studio running and accessible. PostgreSQL database initialized for production use.

**If fail:** Port 8080 already in use? Change port in config. Docker fails? Check Docker daemon running, ensure sufficient disk space for data volumes, check firewall allows port 8080.

### Step 2: Design Labeling Interface and Schema

Create labeling configuration for task type.

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

**Got:** Labeling interface configured with appropriate controls for task type. Data imported successfully. Interface accessible to annotators.

**If fail:** Validate XML config with Label Studio's config validator. Check data file format (JSON or CSV). Ensure image/audio URLs accessible if using external storage. Verify API key has correct permissions.

### Step 3: Prepare Data and Implement Sampling Strategy

Format data for import. Prioritize examples for labeling.

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

**Got:** Data formatted correctly for Label Studio import. Sampling strategy prioritizes informative examples. Tasks include metadata for tracking.

**If fail:** Verify JSON format with `jq` or Python json.load(). Check URLs accessible if using remote images. Ensure no special characters break JSON encoding. Validate column names match config.

### Step 4: Implement Quality Control and IAA Measurement

Set up processes to measure and improve annotation quality.

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

**Got:** Inter-annotator agreement measured (Cohen's Kappa > 0.6 = moderate, >0.8 = good). Difficult tasks identified for review. Annotator performance tracked.

**If fail:** Kappa very low (<0.4)? Review labeling guidelines for clarity. Retrain annotators. Simplify label schema. Check for ambiguous examples. Consider using expert annotators for gold standard.

### Step 5: Export and Integrate Labeled Data

Export labels. Prepare for ML training.

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

**Got:** Annotations exported in training-ready format. Label distribution balanced or documented. Data quality validated before training.

**If fail:** Verify API key permissions. Check export format compatibility with ML framework. Handle missing annotations gracefully. Validate JSON structure matches expected format.

### Step 6: Set Up Continuous Labeling Pipeline

Automate labeling workflow with active learning integration.

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

**Got:** Active learning selects informative examples automatically. Labeling batches prepared weekly. Model retrained when sufficient new labels available.

**If fail:** Uncertainty sampling doesn't improve model? Try diversity sampling. Annotators can't keep up? Reduce batch size. Monitor labeling queue length. Implement backpressure if queue grows too large.

## Checks

- [ ] Label Studio accessible and responsive
- [ ] Labeling interface intuitive (test with sample annotator)
- [ ] Data import successful with correct format
- [ ] Inter-annotator agreement (Cohen's Kappa) > 0.6
- [ ] Quality control identifies problematic tasks
- [ ] Labels export in training-ready format
- [ ] Label distribution matches expected (or intentionally imbalanced)
- [ ] Active learning pipeline runs without manual intervention
- [ ] Annotation throughput meets project timeline

## Pitfalls

- **Unclear guidelines**: Ambiguous instructions cause inconsistent labels. Invest in detailed guidelines with examples
- **Insufficient overlap**: Can't measure IAA without multiple annotators per task. Use 10-20% overlap
- **Ignoring difficult cases**: Edge cases often skipped but critical for model robustness. Flag for expert review
- **Batch effects**: Annotator fatigue or learning causes temporal inconsistency. Randomize task order
- **No quality feedback**: Annotators don't improve without feedback. Provide regular accuracy reports
- **Wrong sampling strategy**: Random sampling wastes budget on easy examples. Use uncertainty or diversity sampling
- **Labeling in isolation**: Domain experts needed for complex tasks. Pair novices with experts initially
- **Not tracking costs**: Labeling expensive. Monitor time per task and total budget consumption

## See Also

- `version-ml-data` - Version control for labeled datasets
- `track-ml-experiments` - Track model performance as labels added
