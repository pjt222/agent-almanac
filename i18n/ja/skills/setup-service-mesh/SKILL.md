---
name: setup-service-mesh
description: >
  サービスメッシュ（IstioまたはLinkerd）をデプロイして設定し、Kubernetesクラスター内の
  セキュアなサービス間通信、トラフィック管理、可観測性、ポリシー強制を実現します。
  インストール、mTLS設定、トラフィックルーティング、サーキットブレーキング、
  モニタリングツールとの統合をカバーします。マイクロサービスに暗号化されたサービス間通信、
  カナリアまたはA/Bデプロイのきめ細かいトラフィック制御、アプリケーション変更なしでの
  すべてのサービスインタラクションへの可観測性、または一貫したサーキットブレーキングと
  リトライポリシーが必要な場合に使用します。
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
  complexity: advanced
  language: multi
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
---

# サービスメッシュのセットアップ

セキュアなサービス間通信と高度なトラフィック管理のためにサービスメッシュをデプロイして設定します。

## 使用タイミング

- マイクロサービスアーキテクチャで暗号化されたサービス間通信が必要
- きめ細かいトラフィック制御が必要（カナリアデプロイ、A/Bテスト、トラフィック分割）
- アプリケーション変更なしですべてのサービスインタラクションへの可観測性が必要
- インフラストラクチャレベルでセキュリティポリシー（mTLS、認可）を強制
- サービス全体で一貫してサーキットブレーキング、リトライ、タイムアウトを実装
- 分散トレーシングとサービス依存マッピングが必要

## 入力

- **必須**: 管理者アクセス権付きのKubernetesクラスター
- **必須**: サービスメッシュの選択（IstioまたはLinkerd）
- **必須**: サービスメッシュを有効にするNamespace
- **任意**: モニタリングスタック（Prometheus、Grafana、Jaeger）
- **任意**: カスタムトラフィック管理要件
- **任意**: mTLS用の認証局設定

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照してください。

### ステップ1: サービスメッシュコントロールプレーンのインストール

サービスメッシュコントロールプレーンを選択してインストールします。

**Istioの場合：**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Linkerdの場合：**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

リソース制限とトレーシングを含むサービスメッシュ設定を作成します：
```yaml
# service-mesh-config.yaml（省略版）
spec:
  profile: production
  meshConfig:
    enableTracing: true
  components:
    pilot:
      k8s:
        resources: { requests: { cpu: 500m, memory: 2Gi } }
# 完全な設定はEXAMPLES.md ステップ1を参照
```

**期待結果：** コントロールプレーンのPodがistio-system（Istio）またはlinkerd（Linkerd）Namespaceで稼働中。`istioctl version`または`linkerd version`がクライアントとサーバーの一致するバージョンを表示。

**失敗時：**
- クラスターに十分なリソースがあるか確認（本番では最低4CPUコア、8GB RAM）
- Kubernetesバージョンの互換性を確認（メッシュのドキュメントを確認）
- ログを確認：`kubectl logs -n istio-system -l app=istiod`または`kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- 競合するCRDを確認：`kubectl get crd | grep istio`または`kubectl get crd | grep linkerd`

### ステップ2: 自動サイドカーインジェクションの有効化

自動サイドカープロキシインジェクションのためにNamespaceを設定します。

**Istioの場合：**
```bash
# Namespaceに自動インジェクションのラベルを付与
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Linkerdの場合：**
```bash
# Namespaceにインジェクションのアノテーションを付与
kubectl annotate namespace default linkerd.io/inject=enabled
```

サンプルデプロイでサイドカーインジェクションをテストします：
```yaml
# test-deployment.yaml（省略版）
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: app
        image: nginx:alpine
# 完全なテストデプロイはEXAMPLES.md ステップ2を参照
```

適用して確認します：
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# 2/2コンテナが期待される（app + proxy）
```

**期待結果：** 新しいPodが2/2コンテナを表示（アプリケーション + サイドカープロキシ）。Describe出力がistio-proxyまたはlinkerd-proxyコンテナを表示。ログがプロキシの正常起動を表示。

**失敗時：**
- Namespaceのラベル/アノテーションを確認：`kubectl get ns default -o yaml`
- mutating webhookが有効か確認：`kubectl get mutatingwebhookconfiguration`
- インジェクションのログを確認：`kubectl logs -n istio-system -l app=sidecar-injector`（Istio）
- 手動インジェクションでテスト：`kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### ステップ3: mTLSポリシーの設定

セキュアなサービス間通信のために相互TLSを有効にします。

**Istioの場合：**
```yaml
# mtls-policy.yaml（省略版）
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
# Namespace単位とpermissiveモードの例はEXAMPLES.md ステップ3を参照
```

**Linkerdの場合：**
```bash
# Linkerdはデフォルトでメッシュ化されたPodにmTLSを強制
linkerd viz tap deploy/test-app -n default
# 🔒（ロック）シンボルを確認
```

適用して確認します：
```bash
kubectl apply -f mtls-policy.yaml
# Istio：mTLSステータスを確認
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**期待結果：** メッシュ化されたサービス間のすべての接続がmTLSを表示。Istioの`tls-check`がSTATUSを「OK」と表示。Linkerdの`tap`出力がすべての接続に🔒を表示。サービスのログにTLSエラーがない。

**失敗時：**
- 証明書発行を確認：`kubectl get certificates -A`（cert-manager）
- CAが正常か確認：`kubectl logs -n istio-system -l app=istiod | grep -i cert`
- まずPERMISSIVEモードでテストしてからSTRICTに移行
- サイドカーのないサービスを確認：`kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### ステップ4: トラフィック管理ルールの実装

インテリジェントなトラフィックルーティング、リトライ、サーキットブレーキングを設定します。

トラフィック管理ポリシーを作成します：
```yaml
# traffic-management.yaml（省略版）
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - match:
    - uri: { prefix: /api/v2 }
    route:
    - destination: { host: api-service, subset: v2 }
      weight: 10
    - destination: { host: api-service, subset: v1 }
      weight: 90
    retries: { attempts: 3, perTryTimeout: 2s }
# 完全なルーティング、サーキットブレーカー、ゲートウェイ設定はEXAMPLES.md ステップ4を参照
```

**Linkerdのトラフィック分割：**
```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

適用してテストします：
```bash
kubectl apply -f traffic-management.yaml
# トラフィック分散をテスト
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# 監視：istioctl dashboard kiali または linkerd viz dashboard
```

**期待結果：** トラフィックが定義された重みに従って分割。サーキットブレーカーが連続エラー後にトリップ。一時的な失敗にリトライが発生。Kiali/Linkerdダッシュボードがトラフィックフローの可視化を表示。

**失敗時：**
- デスティネーションホストが解決されるか確認：`kubectl get svc -n production`
- サブセットラベルがPodラベルと一致するか確認：`kubectl get pods -n production --show-labels`
- パイロットのログを確認：`kubectl logs -n istio-system -l app=istiod`
- まずサーキットブレーカーなしでテストしてから徐々に追加
- `istioctl analyze`で設定を確認：`istioctl analyze -n production`

### ステップ5: 可観測性スタックの統合

サービスメッシュのテレメトリをモニタリングとトレーシングシステムに接続します。

**可観測性アドオンのインストール：**
```bash
# Istio：Prometheus、Grafana、Kiali、Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

カスタムメトリクスとダッシュボードを設定します：
```yaml
# service-monitor.yaml（省略版）
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
spec:
  selector: { matchLabels: { app: istiod } }
  endpoints:
  - port: http-monitoring
    interval: 30s
# GrafanaダッシュボードとテレメトリはEXAMPLES.md ステップ5を参照
```

ダッシュボードへアクセスします：
```bash
istioctl dashboard grafana  # または：linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**期待結果：** ダッシュボードがサービストポロジー、リクエスト率、レイテンシパーセンタイル、エラー率を表示。Jaegerで分散トレースが利用可能。PrometheusがメッシュメトリクスのスクレーピングをしているOK。カスタムメトリクスがクエリに表示。

**失敗時：**
- Prometheusのスクレーピングを確認：`kubectl get servicemonitor -A`
- アドオンのPodが稼働中か確認：`kubectl get pods -n istio-system`
- テレメトリ設定を確認：`istioctl proxy-config log <pod-name> -n <namespace>`
- メッシュ設定でテレメトリが有効か確認：`kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- ポートフォワードが失敗する場合はポートの競合を確認

### ステップ6: メッシュの健全性の検証と監視

包括的なヘルスチェックと継続的な監視をセットアップします。

```bash
# Istioの検証
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerdの検証
linkerd check
linkerd viz check
linkerd diagnostics policy

# プロキシの同期ステータスを確認
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# コントロールプレーンの健全性を監視
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

ヘルスチェックスクリプトとアラートを作成します：
```bash
#!/bin/bash
# mesh-health-check.sh（省略版）
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# 完全なヘルスチェックスクリプトとアラート設定はEXAMPLES.md ステップ6を参照
```

**期待結果：** 全ての分析チェックが警告なしで合格。Proxy-statusがすべてのプロキシが同期済みを表示。mTLSチェックが暗号化を確認。メトリクスがトラフィックの流れを表示。コントロールプレーンのPodが低いリソース使用量で安定。

**失敗時：**
- `istioctl analyze`の出力から特定の問題に対処
- 個々のPodのプロキシログを確認：`kubectl logs <pod> -c istio-proxy -n <namespace>`
- ネットワークポリシーがメッシュトラフィックをブロックしていないか確認
- コントロールプレーンのエラーログを確認：`kubectl logs -n istio-system deploy/istiod --tail=100`
- 問題のあるプロキシを再起動：`kubectl rollout restart deploy/<deployment> -n <namespace>`

## バリデーション

- [ ] コントロールプレーンのPodが稼働中かつ正常（istiod/linkerd-controller）
- [ ] サイドカープロキシが全アプリケーションPodにインジェクト済み（2/2コンテナ）
- [ ] mTLSが有効かつ機能している（tls-check/tapで確認）
- [ ] トラフィック管理ルールがリクエストを正しくルーティング（curlテストで確認）
- [ ] サーキットブレーカーが繰り返しの失敗でトリップ（フォルトインジェクションでテスト）
- [ ] 可観測性ダッシュボードがメトリクスを表示（Grafana/Kiali/Linkerd Viz）
- [ ] Jaegerでサンプルリクエストの分散トレースをキャプチャ
- [ ] istioctl analyze/linkerd checkからの設定警告なし
- [ ] プロキシ同期ステータスが全プロキシの同期を表示
- [ ] サービス間通信が暗号化されている（ログ/ダッシュボードで確認）

## よくある落とし穴

- **リソース枯渇**: サービスメッシュはサイドカーのためにPod当たり100-200MBのメモリを追加する。クラスターに十分な容量があることを確認。インジェクション設定に適切なリソース制限を設定する。

- **設定の競合**: 同じホストに対する複数のVirtualServiceが未定義の動作を引き起こす。代わりに複数のマッチ条件を持つ単一のVirtualServiceをホスト毎に使用する。

- **証明書の有効期限**: mTLS証明書は自動更新されるがCAルートは管理が必要。`kubectl get certificate -A`で証明書の有効期限を監視してアラートを設定する。

- **サイドカーがインジェクトされていない**: Namespaceへのラベル付け前に作成されたPodにはサイドカーがない。再作成が必要：`kubectl rollout restart deploy/<name> -n <namespace>`。

- **DNS解決の問題**: サービスメッシュがDNSをインターセプト。クロスNamespaceの呼び出しには完全修飾名（service.namespace.svc.cluster.local）を使用する。

- **ポート命名要件**: Istioはプロトコル名パターンに従った名前付きポートが必要（例：http-web、tcp-db）。名前のないポートはデフォルトでTCPパススルーになる。

- **段階的なロールアウトが必要**: 本番でSTRICT mTLSをすぐに有効にしない。移行中はPERMISSIVEモードを使用し、全サービスがメッシュ化されたことを確認してからSTRICTに切り替える。

- **可観測性のオーバーヘッド**: 100%トレーシングサンプリングはパフォーマンスの問題を引き起こす。本番では1-10%を使用：メッシュ設定で`sampling: 1.0`。

- **GatewayとVirtualServiceの混乱**: Gatewayはイングレス（ロードバランサー）を設定し、VirtualServiceはルーティングを設定する。外部トラフィックには両方が必要。

- **バージョンの互換性**: メッシュバージョンがKubernetesバージョンと互換性があることを確認。IstioはKubernetesのn-1マイナーバージョンをサポート、Linkerdは通常最後の3つのKubernetesバージョンをサポート。

## 関連スキル

- `configure-ingress-networking` - Gatewayの設定がメッシュのイングレスを補完
- `deploy-to-kubernetes` - サービスメッシュと連携するアプリケーションデプロイパターン
- `setup-prometheus-monitoring` - メッシュメトリクスのためのPrometheus統合
- `manage-kubernetes-secrets` - mTLSの証明書管理
- `enforce-policy-as-code` - メッシュ認可と連携するOPAポリシー
