---
name: build-feature-store
description: >
  Feastを使用して集中型特徴量管理のための特徴量ストアを構築する。バッチおよび
  リアルタイムサービング用のオフライン/オンラインストアの設定、変換付き特徴量ビューの
  定義、MLパイプライン用のポイントインタイム正確結合の実装をカバーする。
  複数のMLモデルの特徴量を管理する時、学習-サービング一貫性を確保する時、
  リアルタイム推論用の低レイテンシ特徴量を提供する時、プロジェクト間で特徴量定義を
  再利用する時、検出とガバナンスのための特徴量カタログを構築する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: feature-store, feast, offline-store, online-store, feature-engineering
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 特徴量ストアの構築


> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

学習と推論にわたる一貫した特徴量サービングのために、Feastで集中型特徴量管理を実装する。

## 使用タイミング

- チーム横断で複数のMLモデルの特徴量を管理する時
- 特徴量の学習-サービング一貫性を確保する時
- ポイントインタイム正確な履歴特徴量を実装する時
- リアルタイム推論用の低レイテンシ特徴量を提供する時
- プロジェクト間で特徴量定義を再利用する時
- 特徴量変換のバージョニングを行う時
- 検出とガバナンスのための特徴量カタログを構築する時
- 学習パイプラインでの特徴量リーケージを防止する時

## 入力

- **必須**: 生データソース（データベース、データレイク、データウェアハウス）
- **必須**: Feastがインストールされたpython環境
- **必須**: オフラインストアバックエンド（BigQuery、Snowflake、Redshift、またはParquetファイル）
- **必須**: オンラインストアバックエンド（Redis、DynamoDB、Cassandra、または開発用SQLite）
- **任意**: 特徴量変換ロジック（Python、SQL、Spark）
- **任意**: エンティティキー定義（user_id、product_idなど）
- **任意**: Feastサーバーデプロイ用のKubernetesクラスター

## 手順

### ステップ1: Feast特徴量リポジトリの初期化

Feastプロジェクト構造をセットアップし、ストレージバックエンドを設定する。

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

`feature_store.yaml`を設定する:

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

クラウドバックエンドによる本番設定:

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

**期待結果:** Feast リポジトリが設定ファイルとともに初期化され、サンプル特徴量定義が作成され、オフラインおよびオンラインストアが設定され、レジストリパスがアクセス可能。

**失敗時:** データベース/Redisの資格情報を確認する（`psql -U feast_user -h localhost`）、接続文字列のフォーマットを確認する、データベースが存在することを確認する（`CREATE DATABASE feature_store`）、S3/BigQuery/DynamoDBのクラウド権限を確認する、ストレージバックエンドへの接続をテストする、Feastバージョンとバックエンドの互換性を確認する（`feast version`）。

### ステップ2: エンティティとデータソースの定義

エンティティ定義を作成し、生データソースに接続する。

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

データソースを定義する:

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

**期待結果:** エンティティ定義が正しいIDカラムを参照し、データソースが生データに正常に接続し、event_timestamp_columnがソースデータに存在し、created_timestamp_columnがポイントインタイムクエリを可能にする。

**失敗時:** ソースデータファイルが存在し読み取り可能であることを確認する、BigQuery/Redshiftの資格情報とテーブルアクセスを確認する、タイムスタンプカラムが正しいフォーマット（Unixタイムスタンプまたは ISO8601）であることを確認する、Kafkaの接続性とトピックの存在を確認する、ソースとエンティティ間のスキーマ互換性を確認する。

### ステップ3: 変換付き特徴量ビューの定義

生データをML対応の特徴量にする特徴量ビューを作成する。

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

**期待結果:** 特徴量ビューが正常に登録され、スキーマがソースデータと一致し、変換がエラーなく実行され、TTL値がユースケースに適切で、オンデマンドビューがバッチとリクエスト特徴量を結合する。

**失敗時:** フィールド名がソースカラムと正確に一致することを確認する、dtype互換性を確認する（Int64 vs Int32）、エンティティ参照が存在することを確認する、サンプルデータで変換ロジックを検証する、計算でのゼロ除算を確認する、リクエストソーススキーマが推論ペイロードと一致することを確認する。

### ステップ4: 特徴量定義の適用と特徴量のマテリアライズ

特徴量定義をレジストリにデプロイし、オンラインストアにマテリアライズする。

```bash
# Apply feature definitions to registry
feast apply

# Expected output:
# Created entity customer
# Created feature view customer_stats
# Created on demand feature view customer_segments

# ... (see EXAMPLES.md for complete implementation)
```

プログラマティックなマテリアライゼーション:

```python
# materialize_features.py
from feast import FeatureStore
from datetime import datetime, timedelta

# Initialize feature store
fs = FeatureStore(repo_path=".")

# Materialize all feature views
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** 特徴量定義が競合なくレジストリに適用され、マテリアライゼーションジョブが正常に完了し、オンラインストアに特徴量が格納され、特徴量の鮮度が設定されたTTL内。

**失敗時:** オフラインストアクエリが成功することを確認する（`feast feature-views describe customer_stats`）、時間範囲にデータがあることを確認する、オンラインストアが書き込み可能であることを確認する（Redis/DynamoDB権限）、ビュー間で重複する特徴量名がないか確認する、ソースデータにエンティティキーが存在することを確認する、マテリアライゼーションジョブログでエラーを監視する、ローカルストアのディスク容量を確認する。

### ステップ5: 学習用特徴量の取得

モデル学習用のポイントインタイム正確な履歴特徴量を取得する。

```python
# get_training_data.py
from feast import FeatureStore
import pandas as pd
from datetime import datetime

# Initialize feature store
fs = FeatureStore(repo_path=".")

# ... (see EXAMPLES.md for complete implementation)
```

ポイントインタイム正確性の検証:

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

**期待結果:** 履歴特徴量が正常に取得され、entity_dfのタイムスタンプが保存され、マテリアライズされた特徴量にNaN値がなく、ポイントインタイム正確性が保証され（将来のデータリーケージなし）、特徴量サービスが特徴量を論理的にグループ化する。

**失敗時:** entity_dfに必要なカラム（エンティティ名 + event_timestamp）があることを確認する、特徴量ビュー名がレジストリと一致することを確認する、オフラインストアにリクエストされた時間範囲のデータがあることを確認する、タイムゾーンの不一致を確認する（UTCを使用）、ソースデータにエンティティIDが存在することを確認する、SQLクエリエラーについてログを検査する、特徴量ビューのTTLがリクエストされた時間範囲をカバーしていることを確認する。

### ステップ6: リアルタイム推論用特徴量のサービング

モデルサービング用にオンラインストアから低レイテンシ特徴量を取得する。

```python
# serve_features.py
from feast import FeatureStore
import time

# Initialize feature store
fs = FeatureStore(repo_path=".")

def get_inference_features(customer_ids: list, request_data: dict = None):
# ... (see EXAMPLES.md for complete implementation)
```

FastAPI統合:

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

**期待結果:** 単一エンティティのオンライン特徴量が<10msで取得され、バッチ取得が効率的にスケールし、オンデマンド変換が正しく実行され、リクエスト時特徴量がバッチ特徴量とマージされ、APIが迅速に応答する（<50msエンドツーエンド）。

**失敗時:** オンラインストアが格納されていることを確認する（空の場合materializeを実行）、Redis/DynamoDBの接続性とレイテンシを確認する、オンラインストアにエンティティキーが存在することを確認する、コールドスタートの問題を確認する（キャッシュのウォームアップ）、オンデマンド変換ロジックを確認する、オンラインストアのメモリ/CPU使用量を監視する、サービスとオンラインストア間のネットワークレイテンシを確認する。

## バリデーション

- [ ] Feastリポジトリが初期化され設定されている
- [ ] オフラインおよびオンラインストアが正常に接続されている
- [ ] エンティティ定義がソースデータと一致する
- [ ] 特徴量ビューがレジストリに登録されている
- [ ] オンデマンド変換が正しく実行される
- [ ] マテリアライゼーションがエラーなく完了する
- [ ] ポイントインタイム正確性で履歴特徴量が取得される
- [ ] オンライン特徴量が低レイテンシ（<10ms）で提供される
- [ ] 特徴量の鮮度が設定されたTTL内
- [ ] 学習-サービング一貫性が検証されている
- [ ] 検出のための特徴量カタログがアクセス可能

## よくある落とし穴

- **特徴量リーケージ**: 履歴特徴量で将来のデータを使用する - 常にポイントインタイム正確性を検証し、created_timestampカラムを使用する
- **一貫性のない変換**: 学習とサービングで異なるロジック - 一貫性のためにFeastオンデマンドビューを使用する
- **古い特徴量**: オンラインストアが定期的にマテリアライズされていない - スケジュールされたマテリアライゼーションジョブ（cron/Airflow）をセットアップする
- **欠落するエンティティキー**: 学習セットのエンティティがオンラインストアにない - 包括的なマテリアライゼーションを確保し、欠落キーを適切に処理する
- **型の不一致**: スキーマの型がソースデータと一致しない - 適用前にdtypeを検証し、明示的なField定義を使用する
- **遅いオンライン取得**: ネットワークレイテンシまたは過負荷のオンラインストア - 特徴量ストアを推論サービスと同じ場所に配置し、コネクションプーリングを使用する
- **大きな特徴量ビュー**: 数百万のエンティティのマテリアライズは遅い - 日付でパーティション化し、増分マテリアライゼーションを使用し、オフラインクエリを最適化する
- **特徴量のバージョニングなし**: 破壊的変更が本番モデルに影響 - 特徴量ビューをバージョニングし、後方互換性を維持する
- **タイムゾーンの混乱**: タイムゾーンの混在が不正な結合を引き起こす - タイムスタンプには常にUTCを使用する
- **TTLの無視**: 期限切れの特徴量を提供する - 適切なTTL値を設定し、特徴量の鮮度を監視する

## 関連スキル

- `track-ml-experiments` -- MLflow実験で特徴量メタデータを記録する
- `orchestrate-ml-pipeline` -- 特徴量マテリアライゼーションジョブをスケジュールする
- `version-ml-data` -- 特徴量エンジニアリング用の生データソースをバージョニングする
- `deploy-ml-model-serving` -- 特徴量ストアをモデルサービングと統合する
- `serialize-data-formats` -- 特徴量に効率的なストレージフォーマットを選択する
- `design-serialization-schema` -- 特徴量ソースのスキーマを設計する
