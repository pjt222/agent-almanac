---
name: orchestrate-ml-pipeline
description: >
  DAG構築、タスク依存関係、リトライロジック、スケジューリング、モニタリング、および
  本番MLワークフロー用のMLflow、DVC、フィーチャーストアとの統合を備えた、PrefectまたはAirflow
  を使用したエンドツーエンドの機械学習パイプラインのオーケストレーション。データ取り込みから
  デプロイまでの複数ステップのMLワークフローを自動化する時、定期的なモデル再トレーニングを
  スケジュールする時、分散トレーニングタスクを調整する時、またはパイプラインステージ間の
  リトライロジックと障害復旧を管理する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: prefect, airflow, pipeline, dag, orchestration
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# MLパイプラインのオーケストレーション


> 完全な設定ファイルとテンプレートについては[Extended Examples](references/EXAMPLES.md)を参照。

依存関係管理、スケジューリング、モニタリングを備えたエンドツーエンドの機械学習パイプラインを構築しオーケストレーションする。

## 使用タイミング

- データ取り込みからデプロイまでの複数ステップのMLワークフローを自動化する時
- 新しいデータでの定期的なモデル再トレーニングをスケジュールする時
- 分散データ処理とトレーニングタスクを調整する時
- MLパイプラインステージ間の複雑な依存関係を実装する時
- リトライロジックと障害復旧を管理する時
- パイプライン実行のモニタリングと障害時のアラートを行う時
- 特徴エンジニアリング、トレーニング、評価、デプロイをオーケストレーションする時
- 環境間で再現可能なMLワークフローを構築する時

## 入力

- **必須**: MLパイプラインコンポーネント（データ取り込み、前処理、トレーニング、評価）
- **必須**: オーケストレーションフレームワークの選択（Prefect、Airflow、Kubeflow）
- **必須**: オーケストレーションライブラリがインストールされたPython環境
- **任意**: 分散実行用のKubernetesクラスター
- **任意**: 実験ログ用のMLflowトラッキングサーバー
- **任意**: データバージョニング用のDVC
- **任意**: アラート用のSlack/メール
- **任意**: モニタリングインフラストラクチャ（Prometheus、Grafana）

## 手順

### ステップ1: オーケストレーションフレームワークの選択とインストール

適切なフレームワークを選択し、インフラストラクチャをセットアップする。

```bash
# Option 1: Prefect (modern, Pythonic, simpler)
pip install prefect
pip install prefect-aws prefect-dask prefect-docker

# Start Prefect server (local development)
prefect server start

# Or use Prefect Cloud (managed)
# ... (see EXAMPLES.md for complete implementation)
```

Airflow用のDocker Compose:

```yaml
# docker-compose.airflow.yml
version: '3.8'

x-airflow-common: &airflow-common
  image: apache/airflow:2.8.0
  environment:
    AIRFLOW__CORE__EXECUTOR: CeleryExecutor
    AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** オーケストレーションフレームワークがインストールされ、Web UI（Prefectは http://localhost:4200、Airflowは http://localhost:8080）にアクセスでき、データベースが初期化され、スケジューラーが実行されていること。

**失敗時:** ポートの利用可能性を確認する（`netstat -tulpn | grep 8080`）、データベース接続を確認する、CeleryにRedisが実行中であることを確認する、Pythonバージョンの互換性を確認する（Airflowは≥3.8が必要）、コンテナ化セットアップ用にDockerデーモンを確認する、初期化エラーのログを検査する。

### ステップ2: PrefectでMLパイプラインを構築する

各パイプラインステージのタスクを持つPrefectフローを作成する。

```python
# prefect_ml_pipeline.py
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta
import pandas as pd
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
# ... (see EXAMPLES.md for complete implementation)
```

デプロイとスケジュール:

```python
# deploy_prefect.py
from prefect.deployments import Deployment
from prefect.server.schemas.schedules import CronSchedule
from prefect_ml_pipeline import ml_training_pipeline

# Create deployment with schedule
deployment = Deployment.build_from_flow(
    flow=ml_training_pipeline,
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** Prefectフローがすべてのタスクを正しい順序で実行し、タスクの失敗が自動的にリトライをトリガーし、成功した実行がUIでグリーンに表示され、MLflowが実験をログし、モデルが登録されデプロイされること。

**失敗時:** タスク依存関係が正しく定義されているか確認する、MLflowサーバーにアクセスできるか確認する、データソースパスが正しいか確認する、循環依存関係がないか確認する、タスクタイムアウト制限を確認する、詳細なエラーのためにPrefectログを検査する、リソースの利用可能性（メモリ/CPU）を確認する。

### ステップ3: AirflowでMLパイプラインを構築する

本番MLワークフロー用のAirflow DAGを作成する。

```python
# dags/ml_training_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.docker.operators.docker import DockerOperator
from airflow.utils.dates import days_ago
from datetime import datetime, timedelta
import mlflow
import pandas as pd
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** DAGがAirflow UIに表示され、スケジュールされた実行が時間通りに実行され、タスクの失敗がリトライとアラートをトリガーし、XComがタスク間でデータを渡し、MLflow統合が実験をログすること。

**失敗時:** DAGファイルの構文を確認する（`python dags/ml_training_dag.py`）、Airflow環境でインポートが利用可能か確認する、XComがサイズ制限を超えていないか確認する（大きなデータにはファイルパスを使用する）、アラートのメール設定を確認する、スケジューラーが実行中か確認する、Airflow UIでタスクログを検査する。

### ステップ4: 高度な機能の実装

動的DAG、分岐、並列実行を追加する。

```python
# advanced_pipeline.py (Prefect)
from prefect import flow, task
from prefect.task_runners import DaskTaskRunner, ConcurrentTaskRunner
import time

@task
def process_shard(shard_id: int, data: list) -> dict:
    """Process data shard in parallel."""
# ... (see EXAMPLES.md for complete implementation)
```

Airflowの分岐:

```python
# Airflow branching with BranchPythonOperator
from airflow.operators.python import BranchPythonOperator

def check_data_quality(**context):
    """Decide which branch to take."""
    data_path = context['ti'].xcom_pull(key='data_path')
    df = pd.read_csv(data_path)

# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 並列タスクが同時に実行される（より高速なパイプライン）、条件分岐がロジックに基づいて実行される、動的タスク生成が機能する、Daskクラスターが作業を分散すること。

**失敗時:** Daskクラスターが設定されアクセス可能か確認する、task_runnerが指定されているか確認する、分岐が有効なタスクIDを返すか確認する、並列タスクのリソース競合を確認する、条件ロジックの正確性を確認する。

### ステップ5: モニタリングとアラートの統合

包括的なモニタリングと障害通知を追加する。

```python
# monitoring_integration.py
from prefect.blocks.notifications import SlackWebhook
from prefect import flow, task, get_run_logger
from prefect.context import FlowRunContext

@task(on_failure=[notify_failure])
def critical_task():
    """Task with failure notification."""
# ... (see EXAMPLES.md for complete implementation)
```

センサーを使用したAirflowモニタリング:

```python
# Airflow SLA and monitoring
from airflow.sensors.base import BaseSensorOperator
from airflow.utils.decorators import apply_defaults

default_args = {
    'sla': timedelta(hours=4),  # Alert if task exceeds 4 hours
    'on_failure_callback': slack_alert_failure,
    'on_success_callback': slack_alert_success,
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 障害時にSlack/メール通知が送信される、SLA違反がアラートをトリガーする、カスタムメトリクスが追跡される、ログがモニタリングシステムに集約されること。

**失敗時:** Slack Webhookが正しく設定されているか確認する、メールSMTP設定を確認する、通知ブロックが適切にロードされているか確認する、SLA値が合理的か確認する、通知をブロックしているネットワーク問題がないか確認する。

### ステップ6: パイプライン用CI/CDの実装

パイプラインデプロイメントのバージョン管理と自動化を行う。

```yaml
# .github/workflows/deploy-pipeline.yml
name: Deploy ML Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'pipelines/**'
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** デプロイ前にパイプラインテストが合格する、本番への自動デプロイ、成功したデプロイ時にチームに通知、パイプラインのバージョニングがGitで追跡されること。

**失敗時:** テストカバレッジと失敗を確認する、Prefect Cloudの認証情報を確認する、デプロイスクリプトがエラーを処理しているか確認する、Slack Webhook設定を確認する、デプロイエラーのCIログを検査する。

## バリデーション

- [ ] オーケストレーションフレームワークがインストールされ実行されている
- [ ] パイプラインDAGが正しい依存関係で定義されている
- [ ] すべてのタスクが適切な順序で実行される
- [ ] 障害時にリトライロジックが正しく機能する
- [ ] スケジュールされた実行が時間通りに実行される
- [ ] MLflow統合が実験をログする
- [ ] DVC統合がデータをバージョン管理する
- [ ] 並列タスクが同時に実行される
- [ ] 条件分岐が正しく動作する
- [ ] モニタリングとアラートが機能している
- [ ] CI/CDパイプラインが自動的にデプロイする
- [ ] パイプラインが環境間で再現可能である

## よくある落とし穴

- **循環依存関係**: タスクAがBに依存し、BがAに依存する — DAG構造を慎重に設計し、Airflow/Prefectのバリデーターを使用する
- **メモリリーク**: 長時間実行されるタスクがメモリを蓄積する — タスクタイムアウトを設定し、リソース使用量をモニタリングし、ワーカーを定期的に再起動する
- **XComサイズ制限**: XCom経由で大きなデータを渡す — 直接シリアライゼーションの代わりにファイルパスまたは外部ストレージ（S3）を使用する
- **タイムゾーンの混乱**: 間違った時間に実行がスケジュールされる — 常にUTCを使用し、スケジュールにタイムゾーンを明示的に設定する
- **リトライの欠如**: 一時的なエラーでタスクが永続的に失敗する — 指数バックオフ付きのリトライを設定する
- **密結合**: タスクが実装の詳細に直接依存する — 明確なインターフェースを使用し、パラメータを明示的に渡す
- **冪等性の欠如**: タスクの再実行が重複やエラーを引き起こす — タスクを冪等に設計する（リトライしても安全）
- **不十分なエラー処理**: 障害が有用なコンテキストを提供しない — 詳細なログを追加し、例外を適切にキャプチャする
- **リソース競合**: 並列タスクがリソースを圧迫する — 同時実行数を制限し、リソースクォータを設定する
- **バージョン競合**: 異なるタスクが互換性のない依存関係を必要とする — タスクの分離にDockerコンテナを使用する

## 関連スキル

- `track-ml-experiments` — パイプラインタスクにMLflowトラッキングを統合する
- `version-ml-data` — パイプラインでデータバージョニングにDVCを使用する
- `build-feature-store` — パイプラインタスクとして特徴を具現化する
- `deploy-ml-model-serving` — 最終パイプラインステージとしてデプロイメントを追加する
- `deploy-to-kubernetes` — Kubernetes上でオーケストレーションされたパイプラインを実行する
