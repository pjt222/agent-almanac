---
name: register-ml-model
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Register trained models in MLflow Model Registry with version control, implement
  stage transitions (Staging, Production, Archived) with approval workflows, and
  manage model lineage with comprehensive metadata and deployment tracking. Use when
  promoting a trained model from experimentation to production, managing multiple model
  versions across development stages, implementing approval workflows for governance,
  rolling back to previous versions, or auditing model changes for compliance.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: model-registry, mlflow, staging, production, versioning
---

# 註 ML 模

> 全配檔與模、見 [Extended Examples](references/EXAMPLES.md)。

於 MLflow Model Registry 系統化版、階管、與發布治。

## 用

- 升訓模自實驗至生產
- 管多模版於發階
- 立模審流程以治
- 追模譜自訓至發
- 退至前模版
- 較已發版以 A/B 測
- 審模變以合規

## 入

- **必**：MLflow 追器啟 Model Registry
- **必**：經 MLflow 錄之訓模（自追運）
- **必**：模名以註
- **可**：審流接（郵、Slack、Jira）
- **可**：CI/CD 管以自動升
- **可**：模驗指標閾

## 行

### 一：設模登錄後端

設 MLflow Model Registry 與庫後端（檔式登錄非生產宜）。

```bash
# Start MLflow server with Model Registry support
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost:5432/mlflow \
  --default-artifact-root s3://mlflow-artifacts/models \
  --host 0.0.0.0 \
  --port 5000
```

Python 配：

```python
# model_registry_config.py
import mlflow
from mlflow.tracking import MlflowClient

# Set tracking URI (must support Model Registry)
MLFLOW_TRACKING_URI = "http://mlflow-server.company.com:5000"
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

# ... (see EXAMPLES.md for complete implementation)
```

得：Model Registry UI 籤現於 MLflow、`search_registered_models()` 成（雖空）、庫含 `registered_models` 表。

敗：驗 MLflow 版 ≥1.2（Model Registry 始自 1.2）、察庫後端（SQLite 不全支 Model Registry）、確 `--backend-store-uri` 指庫（非 file://）、驗庫用有 CREATE TABLE 權、察 MLflow 器誌求遷移錯。

### 二：自訓運註模

註所錄模於 Model Registry 並全屬。

```python
# register_model.py
import mlflow
from mlflow.tracking import MlflowClient
from model_registry_config import MLFLOW_TRACKING_URI

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
client = MlflowClient()

# ... (see EXAMPLES.md for complete implementation)
```

得：新模版現於 Model Registry UI、版含述與標、模產可由 `models:/<model-name>/<version>` URI 取、模簽與輸入例存。

敗：驗 run_id 存且畢（`client.get_run(run_id)`）、察模產徑合所錄產（`mlflow.search_runs()` 察）、確模以正框香錄（`mlflow.sklearn.log_model` 非 `mlflow.log_artifact`）、驗模名無特字（用連非底線）、察產儲可達。

### 三：階轉與驗

模版過階（None → Staging → Production → Archived）含驗察。

```python
# stage_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime

client = MlflowClient()

class ModelStageManager:
# ... (see EXAMPLES.md for complete implementation)
```

得：模版階更於登錄、舊版自封、轉時印於標、退復前生產版。

敗：察版存且於期階、驗 archive_existing_versions 旗為（若唯一版或不封）、確庫支並發交易以階更、察階轉鎖（一版一時一轉）、驗審流接。

### 四：模別名與引

用模別名為穩發引（MLflow ≥2.0）。

```python
# model_aliases.py
from mlflow.tracking import MlflowClient

client = MlflowClient()

def set_model_alias(model_name, version, alias):
    """
    Set an alias for a model version (MLflow 2.0+).
# ... (see EXAMPLES.md for complete implementation)
```

得：別名現於 Model Registry UI、按別名載模成（`models:/name@alias`）、更別名即影響新載、A/B 測基設可用。

敗：升 MLflow 至 ≥2.0 為原生別名支、舊版用標退、驗別名命（唯字母數字與連）、察別名衝（一模版一別名）。

### 五：模譜追

追全譜自數至發、含全屬。

```python
# model_lineage.py
import mlflow
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

def enrich_model_metadata(model_name, version, lineage_data):
# ... (see EXAMPLES.md for complete implementation)
```

得：模版標含全譜訊、`get_model_lineage()` 返全史、JSON 報含數源、訓詳、發訊。

敗：驗標值為串（化字典為 JSON）、察標鍵命（無空無特字）、確譜訊於訓時捕、驗 run_id 有效可達。

### 六：以 CI/CD 自動登錄業

整模註入 CI/CD 管以自動升。

```yaml
# .github/workflows/model_promotion.yml
name: Model Promotion Pipeline

on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Model name to promote'
# ... (see EXAMPLES.md for complete implementation)
```

Python 自動本：

```python
# scripts/promote_model.py
import argparse
from stage_management import ModelStageManager

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", required=True)
    parser.add_argument("--version", type=int, required=True)
# ... (see EXAMPLES.md for complete implementation)
```

得：GitHub Actions 流於手觸發、驗試過、模升至標階、Slack 告發、發管自觸。

敗：察 GitHub 密配 MLFLOW_TRACKING_URI、驗 GitHub Actions 自網達 MLflow 器（或需 VPN 或 IP 許列）、確驗本有正指標閾、察 Slack webhook 配、驗 Python 本可執權。

## 驗

- [ ] Model Registry 可達、後端已配
- [ ] 模自訓運成註
- [ ] 階轉成（None → Staging → Production → Archived）
- [ ] 驗察執質閾
- [ ] 模別名設且正解
- [ ] 譜屬全捕
- [ ] 退能復前版
- [ ] CI/CD 管自動升
- [ ] 隊告為階變動
- [ ] 模 URI 於各階皆正解

## 忌

- **SQLite 限**：Model Registry 需庫後端（PostgreSQL/MySQL）為生產——檔式致並發患
- **階衝**：同階多版致混——用 `archive_existing_versions=True` 自封
- **缺運接**：註模無 run_id 失譜——常自 MLflow 運註、非自原檔
- **別名混**：用階為發標非別名——階為流、別名為發引
- **驗略**：升 Production 無察——CI/CD 管立必驗
- **無退計**：生產患無退能——存前 Production 版於 Archived 階
- **標載過**：散標過多——標模與命標
- **手程**：人驅升易誤且慢——以 CI/CD 與審流自動

## 參

- `track-ml-experiments` - 註模前錄之於 MLflow
- `deploy-ml-model-serving` - 發已註模於服基設
- `run-ab-test-models` - 用登錄別名 A/B 測模
- `orchestrate-ml-pipeline` - 自模訓與註
- `version-ml-data` - 版訓數以模譜
