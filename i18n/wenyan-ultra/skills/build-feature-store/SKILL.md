---
name: build-feature-store
locale: wenyan-ultra
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

# 建特徵庫

> 詳 [Extended Examples](references/EXAMPLES.md) 備配檔與模。

以 Feast 施中央特徵管，跨訓與推行一致特徵供。

## 用

- 跨隊多 ML 模管特徵
- 保訓供之特徵一致
- 施點時正確之史特徵
- 實時推供低延特徵
- 跨案用特徵定
- 特徵轉版
- 建特徵錄為發現與治
- 訓管中防特徵洩

## 入

- **必**：原資源（庫、湖、倉）
- **必**：裝 Feast 之 Python 環
- **必**：離線庫（BigQuery、Snowflake、Redshift 或 Parquet 檔）
- **必**：線上庫（Redis、DynamoDB、Cassandra 或開發之 SQLite）
- **可**：特徵轉邏（Python、SQL、Spark）
- **可**：實鍵定（user_id、product_id 等）
- **可**：Feast 服發之 Kubernetes 集

## 行

### 一：初 Feast 特徵庫

設 Feast 案構與配存後端。

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

配 `feature_store.yaml`：

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

產環配附雲端後端：

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

**得：** Feast 庫已初附配檔、例特徵定已造、離線與線上庫已配、註徑可達。

**敗：** 驗庫/Redis 證（`psql -U feast_user -h localhost`）、察連串格、確庫存（`CREATE DATABASE feature_store`）、驗 S3/BigQuery/DynamoDB 雲權、試連存後端、察 Feast 版合後端（`feast version`）。

### 二：定實與資源

造實定並連至原資源。

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

定資源：

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

**得：** 實定引正 ID 列、資源連原資成、event_timestamp_column 存於源資、created_timestamp_column 允點時查。

**敗：** 驗源檔存且可讀、察 BigQuery/Redshift 證與表存、確時戳列格正（Unix 時戳或 ISO8601）、驗 Kafka 連與主存、察源與實之綱合。

### 三：以轉定特徵視

造特徵視，定原資如何成 ML 備之特徵。

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

**得：** 特徵視成註、綱合源資、轉無誤行、TTL 合用例、需求視合批與請特徵。

**敗：** 驗欄名全合源列、察類合（Int64 對 Int32）、確實引存、以例資驗轉邏、察算中除零、驗請源綱合推載。

### 四：施特徵定與物化

發特徵定至註並物化至線上庫。

```bash
# Apply feature definitions to registry
feast apply

# Expected output:
# Created entity customer
# Created feature view customer_stats
# Created on demand feature view customer_segments

# ... (see EXAMPLES.md for complete implementation)
```

程物化：

```python
# materialize_features.py
from feast import FeatureStore
from datetime import datetime, timedelta

# Initialize feature store
fs = FeatureStore(repo_path=".")

# Materialize all feature views
# ... (see EXAMPLES.md for complete implementation)
```

**得：** 特徵定無撞施於註、物化務成完、線上庫以特徵充、特徵新於配 TTL 內。

**敗：** 察離線庫查成（`feast feature-views describe customer_stats`）、驗時範有資、確線上庫可書（Redis/DynamoDB 權）、察跨視複特徵名、驗實鍵存源資、監物化務志、察本庫磁空。

### 五：取訓特徵

取點時正確之史特徵為模訓。

```python
# get_training_data.py
from feast import FeatureStore
import pandas as pd
from datetime import datetime

# Initialize feature store
fs = FeatureStore(repo_path=".")

# ... (see EXAMPLES.md for complete implementation)
```

點時正確驗：

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

**得：** 史特徵成取、entity_df 時戳存、物化特徵無 NaN、點時正確保（無未來資洩）、特徵服邏集特徵。

**敗：** 察 entity_df 有必列（實名 + event_timestamp）、驗特徵視名合註、確離線庫有所請時範資、察時區不合（用 UTC）、驗實 ID 存源資、察 SQL 誤志、驗特徵視 TTL 涵所請時範。

### 六：實時推供特徵

自線上庫取低延特徵為模供。

```python
# serve_features.py
from feast import FeatureStore
import time

# Initialize feature store
fs = FeatureStore(repo_path=".")

def get_inference_features(customer_ids: list, request_data: dict = None):
# ... (see EXAMPLES.md for complete implementation)
```

FastAPI 整：

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

**得：** 單實線上特徵於 <10ms 取、批取效縮、需求轉正行、請時特徵合批特徵、API 速應（<50ms 全程）。

**敗：** 察線上庫已充（空則物化）、驗 Redis/DynamoDB 連與延、確實鍵存線上庫、察冷起（暖快）、驗需求轉邏、監線上庫記/CPU、察服與線上庫間網延。

## 驗

- [ ] Feast 庫初且配
- [ ] 離線與線上庫成連
- [ ] 實定合源資
- [ ] 特徵視註於註
- [ ] 需求轉正行
- [ ] 物化無誤完
- [ ] 史特徵以點時正確取
- [ ] 線上特徵低延供（<10ms）
- [ ] 特徵新於配 TTL 內
- [ ] 訓供一致已驗
- [ ] 特徵錄可發現

## 忌

- **特徵洩**：史特徵中用未來資—必驗點時正確，用 created_timestamp 列
- **轉不一**：訓對供異邏—用 Feast 需求視保一致
- **陳特徵**：線上庫非規物化—設排物化務（cron/Airflow）
- **缺實鍵**：訓集實不在線上庫—確全物化，雅處缺鍵
- **類不合**：綱類不合源資—施前驗類，用顯 Field 定
- **緩線上取**：網延或線上庫載—特徵庫近推服，用連池
- **大特徵視**：物化百萬實緩—按日分、增量物化、優離線查
- **無特徵版**：破改影產模—版特徵視、保後容
- **時區混**：混時區致誤合—時戳必 UTC
- **略 TTL**：供過期特徵—設宜 TTL，監特徵新

## 參

- `track-ml-experiments` — MLflow 實驗中錄特徵元資
- `orchestrate-ml-pipeline` — 排特徵物化務
- `version-ml-data` — 特徵工之原資版
- `deploy-ml-model-serving` — 特徵庫與模供整
- `serialize-data-formats` — 特徵擇效存格
- `design-serialization-schema` — 特徵源之綱設
