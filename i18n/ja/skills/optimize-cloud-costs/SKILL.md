---
name: optimize-cloud-costs
description: >
  Kubecostを使用した可視化、ライトサイジング推奨、水平および垂直ポッドオートスケーリング、
  スポット/プリエンプティブルインスタンス、リソースクォータなどのツールを活用した、
  Kubernetesワークロードのクラウドコスト最適化戦略の実装。コスト配分、ショーバック
  レポート、継続的な最適化プラクティスを網羅する。クラウドコストがビジネス価値に比例せず
  増大している時、リソースリクエストが実際の使用量と一致していない時、手動スケーリングが
  過剰プロビジョニングにつながる時、または内部コスト説明責任のためにショーバックと
  チャージバックを実装する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: cost-optimization, kubecost, hpa, vpa, spot-instances, resource-management, kubernetes
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# クラウドコストの最適化

クラウド支出を削減するためのKubernetesクラスターの包括的なコスト最適化戦略を実装する。

## 使用タイミング

- クラウドインフラストラクチャコストがビジネス価値の対応する増加なしに増大している時
- チーム、アプリケーション、または環境別のコスト配分の可視性が必要な時
- リソースリクエスト/リミットが実際の使用パターンと一致していない時
- 手動スケーリングが過剰プロビジョニングと無駄につながっている時
- 非クリティカルなワークロードにスポット/プリエンプティブルインスタンスを活用したい時
- 内部コスト配分のためにショーバックまたはチャージバックを実装する必要がある時
- コスト意識と説明責任を持つFinOps文化を確立したい時

## 入力

- **必須**: ワークロードが実行中のKubernetesクラスター
- **必須**: クラウドプロバイダーの課金APIアクセス
- **必須**: リソースメトリクス用のメトリクスサーバーまたはPrometheus
- **任意**: トレンド分析用の過去の使用データ
- **任意**: コスト配分要件（ネームスペース、ラベル、チーム別）
- **任意**: パフォーマンス制約用のサービスレベル目標（SLO）
- **任意**: 予算制限またはコスト削減目標

## 手順

> 完全な設定ファイルとテンプレートについては[Extended Examples](references/EXAMPLES.md)を参照。


### ステップ1: コスト可視化ツールのデプロイ

コストモニタリングと配分のためにKubecostまたはOpenCostをインストールする。

**Kubecostのインストール:**
```bash
# Add Kubecost Helm repository
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm repo update

# Install Kubecost with Prometheus integration
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="your-token-here" \
  --set prometheus.server.global.external_labels.cluster_id="production-cluster" \
  --set prometheus.nodeExporter.enabled=true \
  --set prometheus.serviceAccounts.nodeExporter.create=true

# For existing Prometheus, configure Kubecost to use it
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set prometheus.enabled=false \
  --set global.prometheus.fqdn="http://prometheus-server.monitoring.svc.cluster.local" \
  --set global.prometheus.enabled=true

# Verify installation
kubectl get pods -n kubecost
kubectl get svc -n kubecost

# Access Kubecost UI
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090
# Open http://localhost:9090
```

**クラウドプロバイダー統合の設定:**
```yaml
# kubecost-cloud-integration.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cloud-integration
  namespace: kubecost
type: Opaque
stringData:
  # For AWS
  cloud-integration.json: |
    {
      "aws": [
        {
          "serviceKeyName": "AWS_ACCESS_KEY_ID",
          "serviceKeySecret": "AWS_SECRET_ACCESS_KEY",
          "athenaProjectID": "cur-query-results",
          "athenaBucketName": "s3://your-cur-bucket",
          "athenaRegion": "us-east-1",
          "athenaDatabase": "athenacurcfn_my_cur",
          "athenaTable": "my_cur"
        }
      ]
    }
---
# For GCP
apiVersion: v1
kind: Secret
metadata:
  name: gcp-key
  namespace: kubecost
type: Opaque
data:
  key.json: <base64-encoded-service-account-key>
---
# For Azure
apiVersion: v1
kind: ConfigMap
metadata:
  name: azure-config
  namespace: kubecost
data:
  azure.json: |
    {
      "azureSubscriptionID": "your-subscription-id",
      "azureClientID": "your-client-id",
      "azureClientSecret": "your-client-secret",
      "azureTenantID": "your-tenant-id",
      "azureOfferDurableID": "MS-AZR-0003P"
    }
```

クラウド統合を適用する:
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**期待結果:** Kubecostポッドが正常に実行されている。ネームスペース、デプロイメント、ポッド別のコスト内訳を表示するUIにアクセスできる。クラウドプロバイダーコストがインポートされている（初回同期には24-48時間かかる場合がある）。APIがアロケーションデータを返している。

**失敗時:**
- Prometheusが実行中でアクセス可能か確認する: `kubectl get svc -n monitoring prometheus-server`
- クラウド認証情報に課金APIアクセスがあるか確認する
- cost-modelのログをレビューする: `kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- メトリクスサーバーまたはPrometheusのnode-exporterがリソースメトリクスを収集していることを確認する
- クラウド課金APIへのアクセスをブロックしているネットワークポリシーがないか確認する

### ステップ2: 現在のリソース使用率を分析する

過剰プロビジョニングされたリソースと最適化の機会を特定する。

**リソース使用率を照会する:**
```bash
# Get resource requests vs usage for all pods
kubectl top pods --all-namespaces --containers | \
  awk 'NR>1 {print $1,$2,$3,$4,$5}' > current-usage.txt

# Compare requests to actual usage
cat <<'EOF' > analyze-utilization.sh
#!/bin/bash
echo "Pod,Namespace,CPU-Request,CPU-Usage,Memory-Request,Memory-Usage"
for ns in $(kubectl get ns -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get pods -n $ns -o json | jq -r '
    .items[] |
    select(.status.phase == "Running") |
    {
      name: .metadata.name,
      namespace: .metadata.namespace,
      containers: [
        .spec.containers[] |
        {
          name: .name,
          cpuReq: .resources.requests.cpu,
          memReq: .resources.requests.memory
        }
      ]
    } |
    "\(.name),\(.namespace),\(.containers[].cpuReq // "none"),\(.containers[].memReq // "none")"
  ' 2>/dev/null
done
EOF

chmod +x analyze-utilization.sh
./analyze-utilization.sh > resource-requests.csv

# Get actual usage from metrics server
kubectl top pods --all-namespaces --containers > actual-usage.txt
```

**Kubecostの推奨を使用する:**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**使用率ダッシュボードを作成する:**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果:** 現在のリソースリクエストと実際の使用量の明確なビュー。使用率30%未満のポッド（過剰プロビジョニング）の特定。推定節約額付きの最適化機会のリスト。時系列の使用率トレンドを表示するダッシュボード。

**失敗時:**
- メトリクスサーバーが実行中か確認する: `kubectl get deployment metrics-server -n kube-system`
- Prometheusにnode-exporterメトリクスがあるか確認する: `curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- 有意なデータのためにポッドが十分な時間実行されていることを確認する（少なくとも24時間）
- メトリクス収集のギャップを確認する: Prometheusの保持期間とスクレイプ間隔をレビューする
- Kubecostの場合、少なくとも48時間のデータが収集されていることを確認する

### ステップ3: 水平ポッドオートスケーリング（HPA）の実装

CPU、メモリ、またはカスタムメトリクスに基づく自動スケーリングを設定する。

**CPUベースのスケーリング用HPAを作成する:**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**HPAのデプロイと検証:**
```bash
kubectl apply -f hpa-cpu.yaml

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa api-server-hpa -n production

# Monitor scaling events
kubectl get events -n production --field-selector involvedObject.kind=HorizontalPodAutoscaler --watch

# Generate load to test autoscaling
kubectl run load-generator --rm -it --image=busybox -- /bin/sh -c \
  "while true; do wget -q -O- http://api-server.production.svc.cluster.local; done"

# Watch replicas scale
watch kubectl get hpa,deployment -n production
```

**期待結果:** HPAが作成され、現在/目標メトリクスを表示している。負荷時にポッドがスケールアップする。負荷が減少するとポッドがスケールダウンする（安定化ウィンドウ後）。スケーリングイベントがログに記録される。スラッシング（急速なスケールアップ/ダウンサイクル）がない。

**失敗時:**
- メトリクスサーバーが実行中か確認する: `kubectl get apiservice v1beta1.metrics.k8s.io`
- デプロイメントにリソースリクエストが設定されているか確認する（HPAにはこれが必要）
- HPAイベントをレビューする: `kubectl describe hpa api-server-hpa -n production`
- ターゲットデプロイメントが最大レプリカに達していないか確認する
- カスタムメトリクスの場合、メトリクスアダプターがインストールされ設定されているか確認する
- HPAコントローラーのログを確認する: `kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### ステップ4: 垂直ポッドオートスケーリング（VPA）の設定

実際の使用パターンに基づいてリソースリクエストを自動調整する。

**VPAのインストール:**
```bash
# Clone VPA repository
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler

# Install VPA
./hack/vpa-up.sh

# Verify installation
kubectl get pods -n kube-system | grep vpa

# Check VPA CRDs
kubectl get crd | grep verticalpodautoscaler
```

**VPAポリシーを作成する:**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**VPAのデプロイとモニタリング:**
```bash
kubectl apply -f vpa-policies.yaml

# Check VPA recommendations
kubectl get vpa -n production
kubectl describe vpa api-server-vpa -n production

# View detailed recommendations
kubectl get vpa api-server-vpa -n production -o jsonpath='{.status.recommendation}' | jq .

# Monitor VPA-initiated pod updates
kubectl get events -n production --field-selector involvedObject.kind=VerticalPodAutoscaler --watch

# Compare recommendations to current requests
kubectl get deployment api-server -n production -o json | \
  jq '.spec.template.spec.containers[].resources.requests'
```

**期待結果:** VPAが推奨を提供するか、リソースリクエストを自動更新している。推奨がパーセンタイル使用パターン（通常P95）に基づいている。Auto/Recreateモードを使用している場合、ポッドが新しいリクエストで再起動される。HPAとVPAの間に競合がない（HPAはレプリカ用、VPAはポッドごとのリソース用に使用する）。

**失敗時:**
- メトリクスサーバーに十分なデータがあることを確認する（VPAは正確な推奨のために数日必要）
- VPAコンポーネントが実行中か確認する: `kubectl get pods -n kube-system | grep vpa`
- VPAアドミッションコントローラーのログをレビューする: `kubectl logs -n kube-system -l app=vpa-admission-controller`
- Webhookが登録されているか確認する: `kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- 同じメトリクス（CPU/メモリ）でVPAとHPAを使用しない — 競合が発生する
- 自動更新を有効にする前に「Off」モードで推奨をレビューすることから始める

### ステップ5: スポット/プリエンプティブルインスタンスの活用

コスト効率の高いスポットインスタンスでのワークロードスケジューリングを設定する。

**スポットインスタンスでノードプールを作成する:**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**スポットインスタンス用にワークロードを設定する:**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**スポット使用状況のデプロイとモニタリング:**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果:** ワークロードがスポットノードに正常にスケジュールされている。大幅なコスト削減（通常オンデマンドと比較して60-90%）。スポット中断のポッド再スケジューリングによる優雅な処理。モニタリングがスポット中断率と正常な復旧を示している。

**失敗時:**
- リージョン/ゾーンでのスポットインスタンスの利用可能性を確認する
- ノードラベルとテイントがワークロードのトレレーションと一致しているか確認する
- Karpenterのログをレビューする: `kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- ワークロードがステートレスであるか、中断に対する適切な状態管理があることを確認する
- 中断処理をテストする: 手動でスポットノードをcordonしdrainする
- 中断率をモニタリングする — 高すぎる場合、オンデマンドノードへのフォールバックを検討する

### ステップ6: リソースクォータと予算アラートの実装

コスト制御のためのハードリミットとアラートを設定する。

**リソースクォータを作成する:**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**予算アラートを設定する:**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

適用とモニタリング:
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果:** リソースクォータがネームスペースごとの制限を強制している。クォータ超過時にポッド作成がブロックされる。閾値を超えた時に予算アラートが発火する。コストスパイク検出が機能している。ステークホルダーに定期的なレポートが送信される。

**失敗時:**
- ResourceQuotaとLimitRangeが正しく適用されているか確認する: `kubectl get resourcequota,limitrange -A`
- クォータによるポッドの失敗がないか確認する: `kubectl get events -n production | grep quota`
- Kubecostのアラート設定をレビューする: `kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- PrometheusにKubecostメトリクスがあるか確認する: `curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- アラートルーティングをテストする: メール/Slack Webhook設定を確認する

## バリデーション

- [ ] KubecostまたはOpenCostがデプロイされ、正確なコストデータを表示している
- [ ] クラウドプロバイダーの課金統合が機能している（コストが実際の請求書と一致）
- [ ] リソース使用率分析が過剰プロビジョニングされたワークロードを特定している
- [ ] HPAが負荷に基づいてポッドをスケーリングしている（負荷テストで検証済み）
- [ ] VPAが推奨を提供するかリソースリクエストを自動調整している
- [ ] スポットインスタンスが中断を優雅に処理している
- [ ] リソースクォータがネームスペースごとの制限を強制している
- [ ] 閾値超過時に予算アラートが発火している
- [ ] 月次コストが下降傾向にあるか予算内に収まっている
- [ ] チーム/プロジェクト向けのショーバックレポートが生成されている
- [ ] コスト最適化によるパフォーマンス劣化がない
- [ ] 最適化プラクティスでドキュメントが更新されている

## よくある落とし穴

- **積極的すぎるライトサイジング**: VPAの推奨をすぐに適用しない。「Off」モードで開始し、1週間推奨をレビューしてから徐々に適用する。急激な変更はOOMKillやCPUスロットリングを引き起こす可能性がある。

- **HPAとVPAの競合**: 同じメトリクス（CPU/メモリ）でHPAとVPAを同時に使用しない。水平スケーリングにはHPAを、ポッドごとのリソースチューニングにはVPAを使用するか、カスタムメトリクスのHPA + リソースのVPAを使用する。

- **フォールトトレランスなしのスポット**: フォールトトレラントでステートレスなワークロードのみをスポットで実行する。データベース、ステートフルサービス、または単一レプリカのクリティカルサービスは不可。常にPodDisruptionBudgetを使用する。

- **不十分なモニタリング期間**: コスト最適化の決定には過去データが必要。変更前に少なくとも7日、VPA推奨には30日、トレンド分析には90日待つ。

- **バースト要件の無視**: 平均使用量に基づいて制限を低く設定しすぎると、トラフィックスパイク時にスロットリングが発生する。キャパシティプランニングには平均ではなくP95またはP99パーセンタイルを使用する。

- **ネットワークエグレスコスト**: Kubecostではコンピュートコストが可視化されるが、エグレス（データ転送）も大きくなる可能性がある。クロスAZトラフィックをモニタリングし、トポロジー対応ルーティングを使用し、アーキテクチャでデータ転送コストを考慮する。

- **ストレージの見落とし**: PersistentVolumeコストが忘れられがち。未使用のPVCを監査し、ボリュームをライトサイジングし、過剰プロビジョニングの代わりにボリューム拡張を使用し、PVクリーンアップポリシーを実装する。

- **制限的すぎるクォータ**: クォータを低く設定しすぎると正当な成長がブロックされる。クォータ使用量を月次でレビューし、実際のニーズに基づいて調整し、強制前にチームに制限を伝える。

- **間違ったメトリクスからの偽りの節約**: CPU/メモリのみを最適化メトリクスとして使用すると、I/O、ネットワーク、ストレージコストを見逃す。コンピュートだけでなく、総所有コストを考慮する。

- **信頼前のチャージバック**: チームがコストデータを理解し信頼する前にチャージバックを実装すると摩擦が生じる。ショーバック（情報提供）から始め、コスト意識の文化を構築してからチャージバックに移行する。

## 関連スキル

- `deploy-to-kubernetes` — 適切なリソースリクエストを持つアプリケーションデプロイメント
- `setup-prometheus-monitoring` — コストメトリクス用のモニタリングインフラストラクチャ
- `plan-capacity` — コストとパフォーマンスに基づくキャパシティプランニング
- `setup-local-kubernetes` — クラウドコストを回避するためのローカル開発
- `write-helm-chart` — リソースリクエストとリミットのテンプレート化
- `implement-gitops-workflow` — コスト最適化された設定のためのGitOps
