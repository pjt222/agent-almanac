---
name: build-feature-store
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build a feature store using Feast for centralized feature management, configure
  offline and online stores for batch and real-time serving, define feature views
  with transformations, and implement point-in-time correct joins for ML pipelines.
  Use when managing features for multiple ML models, ensuring training-serving consistency,
  serving low-latency features for real-time inference, reusing feature definitions
  across projects, or building a feature catalog for discovery and governance.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: feature-store, feast, offline-store, online-store, feature-engineering
---

# Build Feature Store

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.

Centralized feature mgmt w/ Feast → consistent feature serving across training + inference.

## Use When

- Managing features for many ML models across teams
- Training-serving consistency for features
- Point-in-time correct historical features
- Low-latency features for real-time inference
- Reusing feature defs across projects
- Versioning feature transformations
- Feature catalog for discovery + governance
- Prevent feature leakage in training pipelines

## In

- **Required**: Raw data sources (DBs, data lakes, warehouses)
- **Required**: Python env w/ Feast installed
- **Required**: Offline store backend (BigQuery, Snowflake, Redshift, Parquet)
- **Required**: Online store backend (Redis, DynamoDB, Cassandra, SQLite for dev)
- **Optional**: Feature transformation logic (Python, SQL, Spark)
- **Optional**: Entity key defs (user_id, product_id, etc.)
- **Optional**: K8s cluster for Feast server deploy

## Do

### Step 1: Init Feast Repo

Set up Feast project structure + config storage backends.

```bash
# Install Feast with required extras
pip install 'feast[redis,postgres]'  # Add backends as needed

# Initialize new feature repository
feast init my_feature_repo
cd my_feature_repo

# Directory structure created:
# my_feature_repo/
# ├── feature_store.yaml       # Configuration
# ├── features.py              # Feature definitions
# └── data/                    # Sample data (dev only)
```

Config `feature_store.yaml`:

```yaml
# feature_store.yaml
project: customer_analytics
registry: data/registry.db  # SQLite for dev, use S3/GCS for prod
provider: local

# Offline store for training data
offline_store:
  type: postgres
# ... (see EXAMPLES.md for complete implementation)
```

Prod config w/ cloud backends:

```yaml
# feature_store.prod.yaml
project: customer_analytics
registry: s3://feast-registry/prod/registry.db
provider: aws

offline_store:
  type: bigquery
  project_id: my-gcp-project
# ... (see EXAMPLES.md for complete implementation)
```

**→** Feast repo init'd w/ config, sample feature defs, offline+online stores configured, registry accessible.

**If err:** Verify DB/Redis credentials (`psql -U feast_user -h localhost`), check conn string format, ensure DBs exist (`CREATE DATABASE feature_store`), verify cloud perms for S3/BigQuery/DynamoDB, test connectivity, check Feast ver compat w/ backends (`feast version`).

### Step 2: Entities + Data Sources

Entity defs + connect to raw sources.

```python
# entities.py
from feast import Entity, ValueType

# Define entities (primary keys for features)
customer = Entity(
    name="customer",
    description="Customer entity",
    value_type=ValueType.INT64,
# ... (see EXAMPLES.md for complete implementation)
```

Data sources:

```python
# data_sources.py
from feast import FileSource, BigQuerySource, RedshiftSource
from feast.data_format import ParquetFormat
from datetime import timedelta

# Development: File-based source
customer_transactions_source = FileSource(
    path="data/customer_transactions.parquet",
# ... (see EXAMPLES.md for complete implementation)
```

**→** Entity defs ref correct ID cols, sources connect to raw data, event_timestamp_col exists, created_timestamp_col allows point-in-time queries.

**If err:** Verify source files exist + readable, check BigQuery/Redshift credentials + table access, ensure timestamp cols correct format (Unix/ISO8601), verify Kafka connectivity + topic existence, check schema compat sources ↔ entities.

### Step 3: Feature Views + Transformations

Feature views → how raw data becomes ML-ready features.

```python
# feature_views.py
from feast import FeatureView, Field
from feast.types import Float32, Int64, String, Bool
from datetime import timedelta
from entities import customer, product
from data_sources import customer_features_source

# Simple feature view without transformations
# ... (see EXAMPLES.md for complete implementation)
```

**→** Feature views registered, schema matches source, transformations execute w/o errs, TTL values appropriate, on-demand views combine batch + req features.

**If err:** Verify field names match source cols exactly, check dtype compat (Int64 vs Int32), ensure entity refs exist, validate transformation w/ sample data, check div-by-zero in calcs, verify req source schema matches inference payload.

### Step 4: Apply Defs + Materialize

Deploy defs to registry, materialize to online store.

```bash
# Apply feature definitions to registry
feast apply

# Expected output:
# Created entity customer
# Created feature view customer_stats
# Created on demand feature view customer_segments

# ... (see EXAMPLES.md for complete implementation)
```

Programmatic materialization:

```python
# materialize_features.py
from feast import FeatureStore
from datetime import datetime, timedelta

# Initialize feature store
fs = FeatureStore(repo_path=".")

# Materialize all feature views
# ... (see EXAMPLES.md for complete implementation)
```

**→** Defs applied to registry w/o conflicts, materialization job completes, online store populated, freshness w/in TTL.

**If err:** Check offline store query succeeds (`feast feature-views describe customer_stats`), verify time range has data, ensure online store writable (Redis/DynamoDB perms), check dup feature names across views, verify entity keys in source, monitor materialization logs, check disk space for local stores.

### Step 5: Retrieve for Training

Point-in-time correct historical features for model training.

```python
# get_training_data.py
from feast import FeatureStore
import pandas as pd
from datetime import datetime

# Initialize feature store
fs = FeatureStore(repo_path=".")

# ... (see EXAMPLES.md for complete implementation)
```

Point-in-time correctness validation:

```python
# validate_pit_correctness.py
import pandas as pd
from datetime import datetime, timedelta

def validate_point_in_time_correctness(training_df, entity_df):
    """
    Ensure features don't leak future information.
    """
# ... (see EXAMPLES.md for complete implementation)
```

**→** Historical features retrieved, entity_df timestamps preserved, no NaN for materialized features, point-in-time correct (no future leak), feature service groups logically.

**If err:** Check entity_df has req cols (entity names + event_timestamp), verify feature view names match registry, ensure offline store has data for time range, check timezone mismatches (use UTC), verify entity IDs in source, inspect SQL query err logs, validate TTL covers time range.

### Step 6: Serve for Real-Time Inference

Low-latency features from online store for model serving.

```python
# serve_features.py
from feast import FeatureStore
import time

# Initialize feature store
fs = FeatureStore(repo_path=".")

def get_inference_features(customer_ids: list, request_data: dict = None):
# ... (see EXAMPLES.md for complete implementation)
```

FastAPI integration:

```python
# api.py
from fastapi import FastAPI
from pydantic import BaseModel
from feast import FeatureStore
import mlflow

app = FastAPI()
fs = FeatureStore(repo_path=".")
# ... (see EXAMPLES.md for complete implementation)
```

**→** Online features retrieved in <10ms for single entity, batch scales efficiently, on-demand transformations execute, request-time + batch features merged, API <50ms e2e.

**If err:** Check online store populated (materialize if empty), verify Redis/DynamoDB connectivity + latency, ensure entity keys in online store, check cold start (warm cache), verify on-demand logic, monitor online store mem/CPU, check network latency service ↔ online store.

## Check

- [ ] Feast repo init'd + configured
- [ ] Offline + online stores connected
- [ ] Entity defs match source data
- [ ] Feature views registered in registry
- [ ] On-demand transformations execute correctly
- [ ] Materialization completes w/o errs
- [ ] Historical features retrieved w/ PIT correctness
- [ ] Online features served low-latency (<10ms)
- [ ] Feature freshness w/in TTL
- [ ] Training-serving consistency verified
- [ ] Feature catalog accessible for discovery

## Traps

- **Feature leakage**: Future data in historical features → always validate PIT correctness, use created_timestamp col
- **Inconsistent transformations**: Diff logic training vs serving → use Feast on-demand views for consistency
- **Stale features**: Online store not materialized regularly → scheduled materialization jobs (cron/Airflow)
- **Missing entity keys**: Entities in training not in online store → comprehensive materialization, handle missing gracefully
- **Type mismatch**: Schema types don't match source → validate dtypes before apply, explicit Field defs
- **Slow online retrieval**: Network latency or overloaded online store → co-locate w/ inference service, use conn pooling
- **Large feature views**: Millions of entities slow → partition by date, incremental materialization, optimize offline queries
- **No feature versioning**: Breaking changes affect prod models → version views, backward compat
- **Timezone confusion**: Mixing tz → incorrect joins. Always UTC
- **Ignoring TTL**: Serving expired features → set appropriate TTL, monitor freshness

## →

- `track-ml-experiments` — log feature metadata in MLflow experiments
- `orchestrate-ml-pipeline` — schedule feature materialization jobs
- `version-ml-data` — version raw data sources for feature eng
- `deploy-ml-model-serving` — integrate feature store w/ model serving
- `serialize-data-formats` — choose efficient storage for features
- `design-serialization-schema` — design schemas for feature sources
