---
name: label-training-data
description: >
  Label Studioまたは同様のツールを使用して体系的なデータラベリングワークフローを設定する。
  品質管理を実装し、アノテーター間一致度を測定し、ラベラーチームを管理し、ラベル付き
  データをML訓練パイプラインに統合する。ラベル付き訓練データを必要とする教師あり
  MLプロジェクトを開始する時、モデル性能がラベル付き例の不足により制限されている時、
  テキスト・画像・音声・動画のラベリングを行う時、または能動学習を実装して最も
  価値のある例を優先する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: basic
  language: multi
  tags: labeling, label-studio, annotation, inter-annotator-agreement, data-quality, active-learning
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# 訓練データのラベリング


> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

品質管理と効率的なワークフローで教師ありMLのためにデータを体系的にラベリングする。

## 使用タイミング

- ラベル付き訓練データを必要とする教師ありMLプロジェクトを開始する時
- 現在のモデル性能がラベル付き例の不足により制限されている時
- テキスト、画像、音声、動画データのラベリングが必要な時
- アノテーション品質を測定・改善したい時
- 異なる専門レベルのアノテーターチームを管理する時
- 能動学習を実装して価値の高い例を優先したい時
- ラベリングの進捗とコストを追跡する必要がある時
- 複数のアノテーター間でラベルの一貫性を確保する時

## 入力

- **必須**: ラベルなしデータセット（画像、テキスト、音声、動画）
- **必須**: ラベルスキーマ（クラス、属性、またはアノテーションタイプ）
- **必須**: ラベリングガイドライン文書
- **任意**: 既存のラベル（品質比較用）
- **任意**: 事前アノテーション用のモデル予測
- **任意**: 予算とタイムラインの制約
- **任意**: 困難な例に対するドメイン専門家の利用可能性

## 手順

### ステップ1: Label Studioのインストールと設定

Label Studioをラベリングプラットフォームとして設定する。

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

`http://localhost:8080`でアクセス（デフォルト認証情報: 初回アクセス時に作成）。

プロダクションデプロイメントにはDockerを使用:

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

**期待結果:** Label Studioが起動しアクセス可能であること。PostgreSQLデータベースがプロダクション使用のために初期化されていること。

**失敗時:** ポート8080が既に使用中の場合、設定でポートを変更する。Dockerが失敗する場合、Dockerデーモンが起動しているか確認する。データボリュームに十分なディスク容量があることを確認する。ファイアウォールがポート8080を許可していることを確認する。

### ステップ2: ラベリングインターフェースとスキーマの設計

タスクタイプに応じたラベリング設定を作成する。

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

**期待結果:** タスクタイプに適切なコントロールでラベリングインターフェースが設定され、データが正常にインポートされ、アノテーターがインターフェースにアクセスできること。

**失敗時:** Label Studioの設定バリデーターでXML設定を検証する。データファイル形式（JSONまたはCSV）を確認する。外部ストレージを使用している場合、画像/音声URLがアクセス可能であることを確認する。APIキーが正しい権限を持っていることを検証する。

### ステップ3: データの準備とサンプリング戦略の実装

インポート用にデータをフォーマットし、ラベリングの例に優先順位を付ける。

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

**期待結果:** Label Studioインポート用にデータが正しくフォーマットされ、サンプリング戦略が情報量の多い例を優先し、タスクに追跡用のメタデータが含まれること。

**失敗時:** `jq`またはPythonのjson.load()でJSON形式を検証する。リモート画像を使用している場合、URLがアクセス可能であることを確認する。特殊文字がJSONエンコーディングを壊していないことを確認する。カラム名が設定と一致していることを検証する。

### ステップ4: 品質管理とIAA測定の実装

アノテーション品質を測定・改善するプロセスを設定する。

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

**期待結果:** アノテーター間一致度が測定されること（Cohenのκ > 0.6は中程度、> 0.8は良好）。困難なタスクがレビュー用に特定されること。アノテーターのパフォーマンスが追跡されること。

**失敗時:** κが非常に低い場合（< 0.4）、ラベリングガイドラインの明確さを見直す。アノテーターを再訓練する。ラベルスキーマを簡素化する。曖昧な例を確認する。ゴールドスタンダードに専門家アノテーターの使用を検討する。

### ステップ5: ラベル付きデータのエクスポートと統合

ラベルをエクスポートしML訓練用に準備する。

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

**期待結果:** アノテーションが訓練可能な形式でエクスポートされること。ラベル分布がバランスしているか文書化されていること。訓練前にデータ品質が検証されること。

**失敗時:** APIキーの権限を検証する。エクスポート形式のMLフレームワークとの互換性を確認する。欠落したアノテーションを適切に処理する。JSON構造が期待される形式と一致していることを検証する。

### ステップ6: 継続的ラベリングパイプラインの設定

能動学習統合を含むラベリングワークフローを自動化する。

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

**期待結果:** 能動学習が情報量の多い例を自動的に選択すること。ラベリングバッチが毎週準備されること。十分な新しいラベルが利用可能になった時にモデルが再訓練されること。

**失敗時:** 不確実性サンプリングがモデルを改善しない場合、多様性サンプリングを試す。アノテーターが追いつけない場合、バッチサイズを減らす。ラベリングキューの長さを監視する。キューが大きくなりすぎた場合、バックプレッシャーを実装する。

## バリデーション

- [ ] Label Studioがアクセス可能で応答性がある
- [ ] ラベリングインターフェースが直感的である（サンプルアノテーターでテスト）
- [ ] データインポートが正しい形式で成功した
- [ ] アノテーター間一致度（Cohenのκ）> 0.6
- [ ] 品質管理が問題のあるタスクを特定する
- [ ] ラベルが訓練可能な形式でエクスポートされる
- [ ] ラベル分布が期待通り（または意図的に不均衡）
- [ ] 能動学習パイプラインが手動介入なしで実行される
- [ ] アノテーションのスループットがプロジェクトタイムラインを満たす

## よくある落とし穴

- **不明確なガイドライン**: 曖昧な指示は一貫性のないラベルを引き起こす; 例を含む詳細なガイドラインに投資する
- **不十分なオーバーラップ**: タスクごとに複数のアノテーターがいなければIAAを測定できない; 10-20%のオーバーラップを使用する
- **困難なケースの無視**: エッジケースはスキップされがちだがモデルの堅牢性に重要; 専門家レビュー用にフラグを立てる
- **バッチ効果**: アノテーターの疲労や学習が時間的な不整合を引き起こす; タスク順序をランダム化する
- **品質フィードバックの欠如**: フィードバックなしではアノテーターは改善しない; 定期的な精度レポートを提供する
- **誤ったサンプリング戦略**: ランダムサンプリングは簡単な例に予算を浪費する; 不確実性または多様性サンプリングを使用する
- **孤立したラベリング**: 複雑なタスクにはドメイン専門家が必要; 最初は初心者と専門家をペアにする
- **コスト追跡の欠如**: ラベリングは高価; タスクあたりの時間と総予算消費を監視する

## 関連スキル

- `version-ml-data` - ラベル付きデータセットのバージョン管理
- `track-ml-experiments` - ラベル追加に伴うモデル性能の追跡
