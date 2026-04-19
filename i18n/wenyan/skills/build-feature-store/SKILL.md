---
name: build-feature-store
locale: wenyan
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


> 全設檔與範見 [Extended Examples](references/EXAMPLES.md)。

以 Feast 施中央特徵之管，令訓練與推理得一致之特徵供。

## 用時

- 理諸 ML 模跨隊之特徵
- 保訓練與供之一致
- 施時點正確之歷史特徵
- 為即時推理供低延之特徵
- 跨項目復用特徵定
- 版特徵之變
- 建特徵目錄為察與治
- 防訓練脈中之特徵漏

## 入

- **必要**：源資料（庫、湖、倉）
- **必要**：Python 境，已裝 Feast
- **必要**：離線庫後端（BigQuery、Snowflake、Redshift、或 Parquet 檔）
- **必要**：在線庫後端（Redis、DynamoDB、Cassandra、或 SQLite 為開發）
- **可選**：特徵變之邏（Python、SQL、Spark）
- **可選**：實體鍵之定（user_id、product_id 等）
- **可選**：Feast 服交之 Kubernetes 群

## 法

### 第一步：初 Feast 特徵庫

立 Feast 項之構而設儲後端。

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

設 `feature_store.yaml`：

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

以雲後端之生產設：

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

**得：** Feast 庫已初附設檔，範特徵定已建，離與在線庫皆設，註冊路可及。

**敗則：** 驗庫/Redis 憑（`psql -U feast_user -h localhost`），察連串格，確庫存（`CREATE DATABASE feature_store`），驗雲之 S3/BigQuery/DynamoDB 權，試連儲後端，察 Feast 版合後端（`feast version`）。

### 第二步：定實體與源

建實體定，連源資料。

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

定源：

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

**得：** 實體定引正 ID 欄，源連源資料成功，event_timestamp_column 存源中，created_timestamp_column 令時點詢可行。

**敗則：** 驗源檔存而可讀，察 BigQuery/Redshift 憑與表取，確時戳欄格正（Unix 或 ISO8601），驗 Kafka 連與題存，察源與實體之模合。

### 第三步：定特徵視含變

建特徵視以定源如何成 ML 備之特徵。

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

**得：** 特徵視已註，模合源，變無錯行，TTL 合用例，按需視合批與請時特徵。

**敗則：** 驗欄名全合源欄，察 dtype 合（Int64 非 Int32），確實體引存，以範驗變邏，察算中除零，驗請源模合推理荷。

### 第四步：施特徵定而物化

交特徵定於註冊，物化於在線庫。

```bash
# Apply feature definitions to registry
feast apply

# Expected output:
# Created entity customer
# Created feature view customer_stats
# Created on demand feature view customer_segments

# ... (see EXAMPLES.md for complete implementation)
```

程式之物化：

```python
# materialize_features.py
from feast import FeatureStore
from datetime import datetime, timedelta

# Initialize feature store
fs = FeatureStore(repo_path=".")

# Materialize all feature views
# ... (see EXAMPLES.md for complete implementation)
```

**得：** 特徵定施於註冊無衝，物化任成，在線庫已填特徵，特徵新於設之 TTL。

**敗則：** 察離線庫詢成（`feast feature-views describe customer_stats`），驗時段有資料，確在線庫可書（Redis/DynamoDB 權），察視間無重特徵名，驗實體鍵存於源，監物化任之日誌，察盤空於本地庫。

### 第五步：為訓練取特徵

取時點正確之歷史特徵以訓模。

```python
# get_training_data.py
from feast import FeatureStore
import pandas as pd
from datetime import datetime

# Initialize feature store
fs = FeatureStore(repo_path=".")

# ... (see EXAMPLES.md for complete implementation)
```

時點正確之驗：

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

**得：** 歷史特徵取成，entity_df 時戳保留，物化之特徵無 NaN，時點正確保（無未來漏），特徵服邏輯集特徵。

**敗則：** 察 entity_df 有須欄（實體名 + event_timestamp），驗特徵視名合註冊，確離庫有所請時段之資料，察時區不合（用 UTC），驗實體 ID 存於源，察日誌之 SQL 詢錯，驗特徵視 TTL 涵所請時段。

### 第六步：為即時推理供特徵

自在線庫取低延之特徵供模。

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

**得：** 單實體之在線特徵取於十毫秒內，批取高效，按需變正行，請時特徵與批特徵合，API 速應（端至端五十毫秒內）。

**敗則：** 察在線庫已填（空則行物化），驗 Redis/DynamoDB 連與延，確實體鍵存於在線庫，察冷啟題（暖緩），驗按需變邏，監在線庫之記/CPU 用，察服與在線庫間之網延。

## 驗

- [ ] Feast 庫已初已設
- [ ] 離線與在線庫皆連成
- [ ] 實體定合源
- [ ] 特徵視已註於註冊
- [ ] 按需變正行
- [ ] 物化畢無錯
- [ ] 歷史特徵取附時點正確
- [ ] 在線特徵供以低延（十毫秒內）
- [ ] 特徵新於設之 TTL
- [ ] 訓供之一致已驗
- [ ] 特徵目可為察

## 陷

- **特徵漏**：歷史特徵中用未來資料——恆驗時點正確，用 created_timestamp 欄
- **變不一**：訓與供邏異——用 Feast 按需視為一致
- **陳特徵**：在線庫未定期物化——立排程物化任（cron/Airflow）
- **缺實體鍵**：訓集中之實體不於在線庫——確全物化，優理缺鍵
- **型不合**：模型類不合源——apply 前驗 dtype，用明 Field 定
- **在線取慢**：網延或在線庫過載——特徵庫共置於推理服，用連池
- **大特徵視**：物化百萬實體慢——按日分，用增量物化，優離詢
- **無特徵版**：破變影響生產模——版特徵視，持向後相容
- **時區之惑**：混時區致合誤——恆用 UTC 為時戳
- **忽 TTL**：供過期特徵——設合 TTL，監特徵新

## 參

- `track-ml-experiments` - 記特徵元於 MLflow 實驗
- `orchestrate-ml-pipeline` - 排程特徵物化任
- `version-ml-data` - 版源資料為特徵工
- `deploy-ml-model-serving` - 整特徵庫與模供
- `serialize-data-formats` - 擇特徵之高效儲格
- `design-serialization-schema` - 設特徵源之模
