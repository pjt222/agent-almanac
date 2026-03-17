---
name: configure-api-gateway
description: >
  APIゲートウェイ（KongまたはTraefik）をデプロイして設定し、APIトラフィック管理、
  認証、レート制限、リクエスト/レスポンス変換、ルーティングを処理します。プラグイン設定、
  上流サービス、コンシューマー管理、既存インフラとの統合をカバーします。複数のバックエンド
  サービスに統一されたAPIエンドポイントが必要な場合、集中認証またはレート制限が必要な場合、
  APIバージョニングを実装する場合、またはマイクロサービスの詳細な分析とロードバランシングが
  必要な場合に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: "2026-03-16"
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: api-gateway, kong, traefik, rate-limiting, authentication, routing, middleware
---

# APIゲートウェイの設定

集中型APIトラフィック管理とポリシー強制のためのAPIゲートウェイをデプロイして設定します。

## 使用タイミング

- 複数のバックエンドサービスに一貫したポリシーを持つ統一APIエンドポイントが必要
- APIアクセスへの集中型認証/認可が必要
- API全体でレート制限とクォータ管理が必要
- バックエンドサービスを変更せずにリクエスト/レスポンスを変換したい
- APIバージョニングと廃止予定の戦略を実装
- 詳細なAPI分析とモニタリングが必要
- マイクロサービスのサービスディスカバリとロードバランシングが必要

## 入力

- **必須**: KubernetesクラスターまたはDocker環境
- **必須**: APIゲートウェイの選択（KongまたはTraefik）
- **必須**: プロキシするバックエンドサービスエンドポイント
- **任意**: 認証プロバイダー（OAuth2、OIDC、APIキー）
- **任意**: レート制限要件（分/時間あたりのリクエスト数）
- **任意**: カスタムミドルウェアまたはプラグイン設定
- **任意**: HTTPSエンドポイント用のTLS証明書

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照してください。

### ステップ1: APIゲートウェイのインストール

データベース付き（Kong）またはファイルベース設定（Traefik）でAPIゲートウェイをデプロイします。

**KongとPostgreSQLの場合：**
```yaml
# kong-deployment.yaml（抜粋 - 完全なファイルはEXAMPLES.mdを参照）
apiVersion: v1
kind: Namespace
metadata:
  name: kong
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: kong
spec:
  replicas: 2
  # ... (PostgreSQL、マイグレーション、サービス - EXAMPLES.mdを参照)
```

**Traefikの場合：**
```yaml
# traefik-deployment.yaml（抜粋 - 完全なファイルはEXAMPLES.mdを参照）
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  # ... (RBAC、ConfigMap、サービス - EXAMPLES.mdを参照)
```

完全なデプロイマニフェストは[EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway)を参照

デプロイ：
```bash
kubectl apply -f kong-deployment.yaml  # または traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # ロードバランサーIPを取得
```

**期待結果：** ゲートウェイのPodが2レプリカで稼働中。LoadBalancerサービスに外部IPが割り当て済み。管理APIにアクセス可能（Kong：ポート8001、Traefik：ダッシュボードポート8080）。ヘルスチェックが合格。

**失敗時：**
- Podのログを確認：`kubectl logs -n kong -l app=kong`
- データベース接続を確認（Kong）：`kubectl logs -n kong kong-migrations-<hash>`
- サービスアカウントのパーミッションを確認（Traefik）：`kubectl get clusterrolebinding traefik -o yaml`
- ポートがすでに使用中でないか確認：`kubectl get svc --all-namespaces | grep 8000`

### ステップ2: バックエンドサービスとルートの設定

上流サービスを定義してAPIを公開するルートを作成します。

**Kongの場合（宣言的設定にdeCKを使用）：**
```bash
# decK CLIのインストール
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# サービス、ルート、アップストリームのkong.yamlを作成
# (完全な設定はEXAMPLES.mdを参照)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # ルートを確認
```

**Traefikの場合（IngressRoute CRDを使用）：**
```yaml
# traefik-routes.yaml（抜粋）
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-route
spec:
  entryPoints: [websecure]
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/users`)
    # ... (完全な設定はEXAMPLES.mdを参照)
```

ルートを適用：
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

完全なルーティング設定は[EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes)を参照

**期待結果：** ルートがトラフィックをバックエンドサービスに正しくプロキシ。重み付きルーティングが設定に従ってトラフィックを分散。ヘルスチェックがバックエンドサービスの健全性を監視。

**失敗時：**
- バックエンドサービスが稼働中か確認：`kubectl get svc -n default`
- DNS解決を確認：`kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- ゲートウェイのログを確認：`kubectl logs -n kong -l app=kong --tail=50`
- 設定を検証：`deck validate -s kong.yaml`

### ステップ3: 認証と認可の実装

APIセキュリティのための認証プラグイン/ミドルウェアを設定します。

**Kongの場合（APIキーとJWT認証）：**
```yaml
# kong-auth-config.yaml（抜粋）
consumers:
- username: mobile-app
  custom_id: app-001

keyauth_credentials:
- consumer: mobile-app
  key: mobile-secret-key-123

plugins:
- name: key-auth
  service: user-api
  # ... (完全な設定はEXAMPLES.mdを参照)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-auth-config.yaml
curl -i -H "apikey: mobile-secret-key-123" http://GATEWAY_IP/api/users
```

**Traefikの場合（BasicAuthとForwardAuthミドルウェア）：**
```yaml
# traefik-auth-middleware.yaml（抜粋）
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: basic-auth-middleware
spec:
  basicAuth:
    secret: basic-auth
    removeHeader: true
# ... (OAuth2、レート制限はEXAMPLES.mdを参照)
```

```bash
kubectl apply -f traefik-auth-middleware.yaml
curl -u user1:password https://GATEWAY_IP/api/protected
```

完全な認証設定は[EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization)を参照

**期待結果：** 未認証リクエストが401を返す。有効なクレデンシャルでアクセスが許可。レート制限が閾値を超えた後429を返す。JWTトークンが正しく検証される。ACLがグループのパーミッションを強制。

**失敗時：**
- コンシューマーの作成を確認：`curl http://localhost:8001/consumers`
- プラグインが有効か確認：`curl http://localhost:8001/plugins | jq .`
- verbose付きでテスト：`curl -v`でレスポンスヘッダーを確認
- JWTを検証：jwt.ioでトークンをデコード

### ステップ4: リクエスト/レスポンス変換の設定

リクエストとレスポンスを変換するミドルウェアを追加します。

**Kongの場合：**
```yaml
# kong-transformations.yaml（抜粋）
plugins:
- name: request-transformer
  service: user-api
  config:
    add:
      headers: [X-Gateway-Version:1.0, X-Request-ID:$(uuid)]
    remove:
      headers: [X-Internal-Token]
- name: correlation-id
  # ... (完全な設定はEXAMPLES.mdを参照)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-transformations.yaml
```

**Traefikの場合：**
```yaml
# traefik-transformations.yaml（抜粋）
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: add-headers
spec:
  headers:
    customRequestHeaders:
      X-Gateway-Version: "1.0"
    # ... (サーキットブレーカー、リトライ、チェーンはEXAMPLES.mdを参照)
```

```bash
kubectl apply -f traefik-transformations.yaml
curl -v https://GATEWAY_IP/api/users | grep X-Gateway
```

完全な変換設定は[EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation)を参照

**期待結果：** リクエストヘッダーが設定通りに追加/削除される。レスポンスヘッダーにゲートウェイメタデータが含まれる。大きなリクエストが413で拒否される。サーキットブレーカーが繰り返しの失敗でトリップ。一時的なエラーにリトライが発生。

**失敗時：**
- チェーン内のミドルウェアの順序を確認
- バックエンドサービスとのヘッダー競合を確認
- チェーン化する前に変換を個別にテスト
- 変換エラーのログを確認

### ステップ5: モニタリングと分析の有効化

API可視性のためのメトリクス、ログ、ダッシュボードを設定します。

**Kongのモニタリングセットアップ：**
```yaml
# kong-monitoring.yaml（抜粋）
plugins:
- name: prometheus
  config:
    per_consumer: true
- name: http-log
  service: user-api
  # ... (Datadog、file-log設定はEXAMPLES.mdを参照)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-monitoring.yaml

# ServiceMonitorのデプロイ（EXAMPLES.mdを参照）
kubectl apply -f kong-servicemonitor.yaml
curl http://localhost:8100/metrics
```

**Traefikのモニタリング（組み込み）：**
```yaml
# ServiceMonitor（抜粋 - GrafanaダッシュボードはEXAMPLES.mdを参照）
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
spec:
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

```bash
kubectl port-forward -n traefik svc/traefik-dashboard 8080:8080
# http://localhost:8080/dashboard/ を開く
```

完全なモニタリング設定は[EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics)を参照

**期待結果：** Prometheusがゲートウェイメトリクスをスクレーピング成功。ダッシュボードがリクエスト率、レイテンシパーセンタイル、エラー率を表示。ログが集約システムに転送。メトリクスがサービス、ルート、コンシューマー別に分割。

**失敗時：**
- ServiceMonitorを確認：`kubectl get servicemonitor -A`
- UIでPrometheusターゲットを確認
- メトリクスポートがアクセス可能か確認：`kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- ログエンドポイントの到達可能性を検証

### ステップ6: APIバージョニングと廃止予定の実装

バージョン管理と優雅なAPI廃止予定を設定します。

**Kongのバージョニング戦略：**
```yaml
# kong-versioning.yaml（抜粋）
services:
- name: user-api-v1
  url: http://user-service-v1.default.svc.cluster.local:8080
  routes:
  - name: user-v1-route
    paths: [/api/v1/users]
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-Deprecation-Notice:"API v1 deprecated on 2024-12-31"
        - Sunset:"Wed, 31 Dec 2024 23:59:59 GMT"
# ... (v2、デフォルトルーティング、レート制限はEXAMPLES.mdを参照)
```

**Traefikのバージョニング：**
```yaml
# traefik-versioning.yaml（抜粋）
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v1-deprecation-headers
spec:
  headers:
    customResponseHeaders:
      X-Deprecation-Notice: "API v1 deprecated on 2024-12-31"
# ... (完全なIngressRoutesはEXAMPLES.mdを参照)
```

バージョニングをテスト：
```bash
curl -i https://api.example.com/api/v1/users  # 廃止予定
curl -i https://api.example.com/api/v2/users  # 現行
curl -i https://api.example.com/api/users     # v2にルーティング
```

完全なバージョニング設定は[EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation)を参照

**期待結果：** 異なるバージョンが適切なバックエンドサービスにルーティング。v1レスポンスに廃止予定ヘッダーが存在。廃止予定バージョンはレート制限が厳しい。デフォルトパスが最新バージョンにルーティング。メトリクスがAPIバージョン別に分割。

**失敗時：**
- パス優先度/プライオリティ設定を確認（優先度が高い = 最初に評価される）
- 重複するパスパターンを確認
- 各バージョンのルートを独立してテスト
- ルーティングのログでパスマッチングを確認
- 各バージョンのバックエンドサービスが稼働中か確認

## バリデーション

- [ ] APIゲートウェイのPodがHA用の複数レプリカで稼働中
- [ ] LoadBalancerサービスに外部IPが割り当て済み
- [ ] ルートがトラフィックをバックエンドサービスに正しくプロキシ
- [ ] 認証/認可がアクセス制御を強制（401/403レスポンス）
- [ ] レート制限がクォータ超過後に429を返す
- [ ] リクエスト/レスポンス変換がヘッダーを正しく追加/削除
- [ ] サーキットブレーカーがバックエンドの繰り返し失敗でトリップ
- [ ] メトリクスが公開されPrometheusにスクレーピングされている
- [ ] ダッシュボードがリクエスト率、レイテンシ、エラーを表示
- [ ] APIバージョニングがリクエストを正しいバックエンドバージョンにルーティング
- [ ] 古いAPIバージョンのレスポンスに廃止予定ヘッダーが存在
- [ ] ヘルスチェックがバックエンドサービスの可用性を監視

## よくある落とし穴

- **データベース依存（Kong）**: データベースを持つKongはPostgreSQL/Cassandraが必要。DBレスモードは利用可能だが一部の機能が制限される（実行時の設定変更）。複数のゲートウェイインスタンスを持つ本番ではDBモードを使用する。

- **パスマッチングの順序**: ルート/IngressRouteが特定の順序で評価される。より具体的なパスは優先度を高くすべき。重複するパスは予測不可能なルーティングを引き起こす。`curl -v`で実際にヒットしたルートを確認する。

- **認証バイパス**: 全ルートに認証プラグインが適用されていることを確認する。認証なしにルートを追加しやすい。サービスレベルでデフォルトプラグインを使用し、必要に応じてルート単位でオーバーライドする。

- **レート制限のスコープ**: レート制限の`policy: local`はゲートウェイのPod単位でカウントする。レプリカ間で一貫した制限には集中型ポリシー（Redis）またはスティッキーセッションを使用する。

- **CORS設定**: APIゲートウェイがCORSを処理すべきで、個々のサービスではない。ブラウザのプリフライト失敗を避けるために早い段階でCORSプラグイン/ミドルウェアを追加する。

- **SSL/TLSターミネーション**: ゲートウェイは通常SSLを終端する。証明書が有効で自動更新が設定されていることを確認する。Kubernetes証明書管理にcert-managerを使用する。

- **上流のヘルスチェック**: バックエンドの失敗を素早く検出するためにアクティブなヘルスチェックを設定する。パッシブチェックはリアルトラフィックに依存し、問題の検出が遅い場合がある。

- **プラグイン/ミドルウェアの実行順序**: 順序が重要。レート制限より先に認証（無効なリクエストでレート制限スロットを無駄にしない）。ログより先に変換（変換された値をログに記録する）。

- **リソース制限**: ゲートウェイのPodは負荷がかかると大量のCPUを消費する可能性がある。適切なリソースリクエスト/制限を設定する。本番でのCPUスロットリングを監視する。

- **移行戦略**: 全プラグインを一度に有効にしない。段階的にロールアウトする：ルーティング → 認証 → レート制限 → 変換 → 高度な機能。

## 関連スキル

- `configure-ingress-networking` - APIゲートウェイを補完するIngressコントローラーのセットアップ
- `setup-service-mesh` - サービスメッシュが補完的な東西トラフィック管理を提供
- `manage-kubernetes-secrets` - ゲートウェイの証明書とクレデンシャル管理
- `setup-prometheus-monitoring` - ゲートウェイメトリクスのモニタリング統合
- `enforce-policy-as-code` - ゲートウェイ認可を補完するポリシー強制
