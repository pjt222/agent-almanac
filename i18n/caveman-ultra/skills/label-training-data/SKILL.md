---
name: label-training-data
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

## When to Use

- Starting supervised ML project that requires labeled training data
- Current model performance limited by insufficient labeled examples
- Need to label text, images, audio, or video data
- Want to measure and improve annotation quality
- Managing team of annotators with different expertise levels
- Implementing active learning to prioritize valuable examples
- Need to track labeling progress and costs
- Ensuring consistent labels across multiple annotators

## Inputs

- **Required**: Unlabeled dataset (images, text, audio, video)
- **Required**: Label schema (classes, attributes, or annotation types)
- **Required**: Labeling guidelines document
- **Optional**: Pre-existing labels (for quality comparison)
- **Optional**: Model predictions for pre-annotation
- **Optional**: Budget and timeline constraints
- **Optional**: Domain expert availability for difficult examples

## Procedure

### Step 1: Install and Configure Label Studio

Set up Label Studio as the labeling platform.

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

**Expected:** Label Studio running and accessible, PostgreSQL database initialized for production use.

**On failure:** If port 8080 already in use, change port in config, if Docker fails check Docker daemon is running, ensure sufficient disk space for data volumes, check firewall allows port 8080.

### Step 2: Design Labeling Interface and Schema

Create labeling configuration for your task type.

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

**Expected:** Labeling interface configured with appropriate controls for task type, data imported successfully, interface accessible to annotators.

**On failure:** Validate XML config with Label Studio's config validator, check data file format (JSON or CSV), ensure image/audio URLs are accessible if using external storage, verify API key has correct permissions.

### Step 3: Prepare Data and Implement Sampling Strategy

Format data for import and prioritize examples for labeling.

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

**Expected:** Data formatted correctly for Label Studio import, sampling strategy prioritizes informative examples, tasks include metadata for tracking.

**On failure:** Verify JSON format with `jq` or Python json.load(), check that URLs are accessible if using remote images, ensure no special characters break JSON encoding, validate column names match config.

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

**Expected:** Inter-annotator agreement measured (Cohen's Kappa > 0.6 is moderate, >0.8 is good), difficult tasks identified for review, annotator performance tracked.

**On failure:** If Kappa very low (<0.4), review labeling guidelines for clarity, retrain annotators, simplify label schema, check for ambiguous examples, consider using expert annotators for gold standard.

### Step 5: Export and Integrate Labeled Data

Export labels and prepare for ML training.

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

**Expected:** Annotations exported in training-ready format, label distribution balanced or documented, data quality validated before training.

**On failure:** Verify API key permissions, check export format compatibility with your ML framework, handle missing annotations gracefully, validate JSON structure matches expected format.

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

**Expected:** Active learning selects informative examples automatically, labeling batches prepared weekly, model retrained when sufficient new labels available.

**On failure:** If uncertainty sampling doesn't improve model, try diversity sampling, if annotators can't keep up reduce batch size, monitor labeling queue length, implement backpressure if queue grows too large.

## Validation

- [ ] Label Studio accessible and responsive
- [ ] Labeling interface intuitive (test with sample annotator)
- [ ] Data import successful with correct format
- [ ] Inter-annotator agreement (Cohen's Kappa) > 0.6
- [ ] Quality control identifies problematic tasks
- [ ] Labels export in training-ready format
- [ ] Label distribution matches expected (or intentionally imbalanced)
- [ ] Active learning pipeline runs without manual intervention
- [ ] Annotation throughput meets project timeline

## Common Pitfalls

- **Unclear guidelines**: Ambiguous instructions cause inconsistent labels; invest in detailed guidelines with examples
- **Insufficient overlap**: Can't measure IAA without multiple annotators per task; use 10-20% overlap
- **Ignoring difficult cases**: Edge cases often skipped but critical for model robustness; flag for expert review
- **Batch effects**: Annotator fatigue or learning causes temporal inconsistency; randomize task order
- **No quality feedback**: Annotators don't improve without feedback; provide regular accuracy reports
- **Wrong sampling strategy**: Random sampling wastes budget on easy examples; use uncertainty or diversity sampling
- **Labeling in isolation**: Domain experts needed for complex tasks; pair novices with experts initially
- **Not tracking costs**: Labeling expensive; monitor time per task and total budget consumption

## Related Skills

- `version-ml-data` - Version control for labeled datasets
- `track-ml-experiments` - Track model performance as labels added
