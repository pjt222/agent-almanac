---
name: register-ml-model
locale: wenyan
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

於 MLflow Model Registry 註已訓之模附版控、行階轉（Staging、Production、Archived）附審流、管模系附詳屬與部署之追。

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

施 MLflow Model Registry 以系統行模之版、階管、部署治。

## 用時

- 升已訓之模自試至產乃用
- 管多模版於諸發階乃用
- 為治施模之審流乃用
- 追模系自訓至部署乃用
- 退至前模版乃用
- 較部署之模版以行 A/B 試乃用
- 為合規審模之變乃用

## 入

- **必要**：MLflow tracking 服附 Model Registry 啟
- **必要**：以 MLflow 錄之已訓之模（自 tracking 之行）
- **必要**：模名以註於庫
- **可選**：審流之集成（郵、Slack、Jira）
- **可選**：自動升之 CI/CD 線
- **可選**：模驗指之閾

## 法

### 第一步：設模庫之後端

立 MLflow Model Registry 附庫後端（產不宜檔基庫）。

```bash
# Start MLflow server with Model Registry support
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost:5432/mlflow \
  --default-artifact-root s3://mlflow-artifacts/models \
  --host 0.0.0.0 \
  --port 5000
```

Python 配置：

```python
# model_registry_config.py
import mlflow
from mlflow.tracking import MlflowClient

# Set tracking URI (must support Model Registry)
MLFLOW_TRACKING_URI = "http://mlflow-server.company.com:5000"
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

# ... (see EXAMPLES.md for complete implementation)
```

得：Model Registry 之頁現於 MLflow，`search_registered_models()` 順返（雖空），庫含 `registered_models` 表。

敗則：驗 MLflow 版 ≥1.2（Model Registry 始於 1.2），察庫後端（SQLite 不全持 Model Registry），確 `--backend-store-uri` 指庫（非 file://），驗庫之用戶有 CREATE TABLE 之權，察 MLflow 服日誌之遷誤。

### 第二步：自訓行註模

註已錄之模於 Model Registry 附詳屬。

```python
# register_model.py
import mlflow
from mlflow.tracking import MlflowClient
from model_registry_config import MLFLOW_TRACKING_URI

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
client = MlflowClient()

# ... (see EXAMPLES.md for complete implementation)
```

得：新模版現於 Model Registry 之 UI，版含述與標，模件可由 `models:/<model-name>/<version>` URI 取，模簽與入例已存。

敗則：驗 run_id 存且已畢（`client.get_run(run_id)`），察模件路合錄之件（`mlflow.search_runs()` 以察），確模以正之框錄（`mlflow.sklearn.log_model` 非 `mlflow.log_artifact`），驗模名無特字（用短橫非下橫），察件存可訪。

### 第三步：施階轉附驗

行模版過諸階（None → Staging → Production → Archived）附驗察。

```python
# stage_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime

client = MlflowClient()

class ModelStageManager:
# ... (see EXAMPLES.md for complete implementation)
```

得：模版之階更於庫，舊版自存檔，轉之時錄於標，退復前產之版。

敗則：察版存且於望階，驗 archive_existing_versions 旗之行（若僅一版或不檔），確庫持並發以更階，察階轉之鎖（一版一時一轉），驗審流之集成。

### 第四步：施模別名與引

用模別名以行穩之部署引（MLflow ≥2.0）。

```python
# model_aliases.py
from mlflow.tracking import MlflowClient

client = MlflowClient()

def set_model_alias(model_name, version, alias):
    """
    Set an alias for a model version (MLflow 2.0+).
# ... (see EXAMPLES.md for complete implementation)
```

得：別名現於 Model Registry 之 UI，由別名載模可（`models:/name@alias`），更別名立影新載，A/B 試之基設可行。

敗則：升 MLflow 至 ≥2.0 以原生持別名，老版退用標基，驗別名之命（獨字母數字與短橫），察別名之衝（一模版一別名）。

### 第五步：施模系之追

追自數據至部署之全系附詳屬。

```python
# model_lineage.py
import mlflow
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

def enrich_model_metadata(model_name, version, lineage_data):
# ... (see EXAMPLES.md for complete implementation)
```

得：模版之標含詳系信，`get_model_lineage()` 返全史，JSON 報含數源、訓細、部署信。

敗則：驗標值為串（化字典為 JSON），察標鍵之命（無空或特字），確系資於訓時捕，驗 run_id 有效可訪。

### 第六步：以 CI/CD 自動庫之操

集模註於 CI/CD 線以自動升。

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

Python 自動文：

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

得：GitHub Actions 流於手動發起，驗試過，模升至目階，Slack 報送，部署線自起。

敗則：察 GitHub secrets 之 MLFLOW_TRACKING_URI 配置，驗自 GitHub Actions 至 MLflow 服之網訪（或需 VPN 或 IP 許列），確驗本有正指閾，察 Slack webhook 配置，驗 Python 文之執權。

## 驗

- [ ] Model Registry 可訪且後端已設
- [ ] 模自訓行順註
- [ ] 階轉行（None → Staging → Production → Archived）
- [ ] 驗察行質之閾
- [ ] 模別名設且解正
- [ ] 系屬詳捕
- [ ] 退之能復前版
- [ ] CI/CD 線自動升
- [ ] 階變之團報行
- [ ] 模 URI 諸階皆解正

## 陷

- **SQLite 之限**：Model Registry 產用須庫後端（PostgreSQL/MySQL）——檔基致並發患
- **階衝**：同階多版生惑——用 `archive_existing_versions=True` 自檔
- **缺行繫**：註模無 run_id 失系——必自 MLflow 行註，非自原檔
- **別名惑**：用階為部署目而非別名——階為流，別名為部署引
- **驗略**：升至產而無察——於 CI/CD 線施必驗
- **無退計**：產患而無退能——存前產版於 Archived 階
- **標過載**：過多無構之標——立標式與命之規
- **手流**：人驅升易誤而緩——以 CI/CD 與審流自動之
- **失件**：模註而件刪——確件留之策合模生命

## 參

- `track-ml-experiments` — 註前先錄模於 MLflow
- `deploy-ml-model-serving` — 部署已註之模至供基設
- `run-ab-test-models` — 用庫之別名行 A/B 模試
- `orchestrate-ml-pipeline` — 自動模訓與註
- `version-ml-data` — 版訓數據以資模系
