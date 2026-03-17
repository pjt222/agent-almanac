---
name: deploy-to-kubernetes
description: >
  Deployment、Service、ConfigMap、Secret、IngressリソースのkubectlマニフェストでKubernetesクラスターに
  アプリケーションをデプロイします。本番デプロイメント向けのヘルスチェック、リソース制限、
  ローリングアップデート、Helmチャートパッケージングを実装します。EKS、GKE、AKS、セルフホスト
  クラスターへの新規アプリケーションのデプロイ、Docker Composeからコンテナオーケストレーションへの
  移行、ゼロダウンタイムローリングアップデートの実装、またはdev・staging・production間の
  マルチ環境デプロイメントのセットアップに使用します。
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
  tags: kubernetes, k8s, kubectl, deployment, service
---

# Kubernetesへのデプロイ

ヘルスチェック、リソース管理、自動ロールアウトを含む本番対応設定でコンテナ化アプリケーションをKubernetesにデプロイします。

## 使用タイミング

- KubernetesクラスターへのアプリケーションのデプロイWhen（EKS、GKE、AKS、セルフホスト）
- Docker Composeまたは従来のVMからコンテナオーケストレーションへの移行
- ゼロダウンタイムローリングアップデートとロールバックの実装
- Kubernetesでのアプリケーション設定とシークレットの管理
- マルチ環境デプロイメントのセットアップ（dev、staging、production）
- アプリケーション配布向け再利用可能Helmチャートの作成

## 入力

- **必須**: Kubernetesクラスターアクセス（`kubectl cluster-info`）
- **必須**: レジストリにプッシュ済みのコンテナイメージ（Docker Hub、ECR、GCR、Harbor）
- **必須**: アプリケーション要件（ポート、環境変数、ボリューム）
- **任意**: HTTPSイングレス向けTLS証明書
- **任意**: 永続ストレージ要件（StatefulSets、PVC）
- **任意**: チャートベースデプロイメント向けHelm CLI

## 手順

> 完全な設定ファイルとテンプレートは[拡張サンプル](references/EXAMPLES.md)を参照してください。

### ステップ1: NamespaceとResourceQuotaの作成

アプリケーションをリソース制限とRBACを持つNamespaceに整理します。

```bash
# Create namespace
kubectl create namespace myapp-prod

# Apply resource quota
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: myapp-prod
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    persistentvolumeclaims: "5"
    services.loadbalancers: "2"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: myapp-prod
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
EOF

# Create service account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
  namespace: myapp-prod
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: myapp-role
  namespace: myapp-prod
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: myapp-rolebinding
  namespace: myapp-prod
subjects:
- kind: ServiceAccount
  name: myapp
  namespace: myapp-prod
roleRef:
  kind: Role
  name: myapp-role
  apiGroup: rbac.authorization.k8s.io
EOF

# Verify namespace setup
kubectl get resourcequota -n myapp-prod
kubectl get limitrange -n myapp-prod
kubectl get sa -n myapp-prod
```

**期待結果：** コンピュートとストレージを制限するResourceQuotaを持つNamespaceが作成されます。LimitRangeがデフォルトのCPU・メモリリクエストと制限を設定します。ServiceAccountが最小権限RBACで設定されます。

**失敗時：** クォータエラーの場合、`kubectl describe nodes` でクラスターに十分なリソースがあることを確認します。RBACエラーの場合、`kubectl auth can-i create role --namespace myapp-prod` でクラスター管理者権限を確認します。拒否されたリソースに `kubectl describe` を使用してクォータ・制限違反を確認します。

### ステップ2: アプリケーションシークレットとConfigMapの設定

ConfigMapとSecretを使用して設定と機密データを外部化します。

```bash
# Create ConfigMap from literal values
kubectl create configmap myapp-config \
  --namespace=myapp-prod \
  --from-literal=LOG_LEVEL=info \
  --from-literal=API_TIMEOUT=30s \
  --from-literal=FEATURE_FLAGS='{"newUI":true,"betaAPI":false}'

# Create ConfigMap from file
cat > app.properties <<EOF
database.pool.size=20
cache.ttl=3600
retry.attempts=3
EOF

kubectl create configmap myapp-properties \
  --namespace=myapp-prod \
  --from-file=app.properties

# Create Secret for database credentials
kubectl create secret generic myapp-db-secret \
  --namespace=myapp-prod \
  --from-literal=username=appuser \
  --from-literal=password='sup3rs3cr3t!' \
  --from-literal=connection-string='postgresql://db.example.com:5432/myapp'

# Create TLS secret for ingress
kubectl create secret tls myapp-tls \
  --namespace=myapp-prod \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Verify secrets/configmaps
kubectl get configmap -n myapp-prod
kubectl get secret -n myapp-prod
kubectl describe configmap myapp-config -n myapp-prod
```

より複雑な設定にはYAMLマニフェストを使用します：

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp-prod
data:
  nginx.conf: |
    server {
      listen 8080;
      location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
      }
    }
  app-config.json: |
    {
      "logLevel": "info",
      "features": {
        "authentication": true,
        "metrics": true
      }
    }
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
  namespace: myapp-prod
type: Opaque
stringData:  # Automatically base64 encoded
  api-key: "sk-1234567890abcdef"
  jwt-secret: "my-jwt-signing-key"
```

**期待結果：** ConfigMapが非機密設定を、Secretが認証情報・キーを保存します。値が環境変数またはボリュームマウント経由でPodからアクセス可能です。TLSシークレットがIngressリソース向けに適切にフォーマットされています。

**失敗時：** エンコードの問題には、YAMLで `data` の代わりに `stringData` を使用します。TLSシークレットエラーの場合、`openssl x509 -in tls.crt -text -noout` で証明書とキーのフォーマットを確認します。アクセス問題の場合、ServiceAccount RBACパーミッションを確認します。`kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d` でデコードされたシークレットを表示します。

### ステップ3: ヘルスチェックとリソース制限を含むDeploymentの作成

プローブとリソース管理を含む本番対応設定でアプリケーションをデプロイします。

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp-prod
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime updates
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: myapp
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: myapp
        image: myregistry.io/myapp:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: LOG_LEVEL
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        startupProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30  # 5 minutes for slow startup
        volumeMounts:
        - name: config
          mountPath: /etc/myapp
          readOnly: true
        - name: cache
          mountPath: /var/cache/myapp
      volumes:
      - name: config
        configMap:
          name: myapp-properties
      - name: cache
        emptyDir: {}
      imagePullSecrets:
      - name: registry-credentials
```

デプロイと監視：

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# Watch rollout status
kubectl rollout status deployment/myapp -n myapp-prod

# Check pod status
kubectl get pods -n myapp-prod -l app=myapp

# View pod logs
kubectl logs -n myapp-prod -l app=myapp --tail=50 -f

# Describe deployment for events
kubectl describe deployment myapp -n myapp-prod

# Check resource usage
kubectl top pods -n myapp-prod -l app=myapp
```

**期待結果：** Deploymentがローリングアップデート戦略で3つのレプリカを作成します。Podがトラフィックを受信する前にReadinessプローブをパスします。Livenessプローブが異常なPodを再起動します。リソースリクエスト・制限がOOMキルを防ぎます。ログが正常なアプリケーション起動を示します。

**失敗時：** ImagePullBackOffの場合、`kubectl get secret registry-credentials -o yaml` でイメージが存在しimagePullSecretが有効であることを確認します。CrashLoopBackOffの場合、`kubectl logs pod-name --previous` でログを確認します。プローブ失敗の場合、`kubectl port-forward` と `curl localhost:8080/healthz` でエンドポイントを手動テストします。OOMKilledされたPodの場合、メモリ制限を増やすかメモリリークを調査します。

### ステップ4: ServiceとLoad Balancerでアプリケーションを公開

Serviceリソースでアプリケーションを内部および外部に公開します。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Serviceの適用とテスト：

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** LoadBalancer ServiceがパブリックIP・ホスト名を持つ外部LBをプロビジョニングします。ClusterIP Serviceが安定した内部DNSを提供します。EndpointsリストがヘルシーなPod IPを表示します。curlリクエストが期待されるレスポンスで成功します。

**失敗時：** LoadBalancerが保留中の場合、クラウドプロバイダーの統合とクォータを確認します。エンドポイントがない場合、`kubectl get pods --show-labels` でPodラベルがServiceセレクターと一致することを確認します。接続が拒否される場合、targetPortがコンテナポートと一致することを確認します。デバッグ用にServiceレイヤーをバイパスするために `kubectl port-forward` を使用します。

### ステップ5: Horizontal Pod Autoscalingの設定

CPU・メモリまたはカスタムメトリクスに基づく自動スケーリングを実装します。

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

metrics-serverがない場合のインストール：

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** HPAがCPU・メモリメトリクスを監視します。閾値を超えると、レプリカがmaxReplicasまでスケールアップします。負荷が減少すると、レプリカが徐々にスケールダウンします（安定化ウィンドウがフラッピングを防ぎます）。`kubectl top` でメトリクスが表示されます。

**失敗時：** メトリクスが「unknown」の場合、metrics-serverが実行中でPodにリソースリクエストが定義されていることを確認します。スケーリングがない場合、`kubectl top pods` で現在の使用率が実際にターゲットを超えていることを確認します。フラッピングの場合、stabilizationWindowSecondsを増やします。スケールアップが遅い場合、scaleUpポリシーのperiodSecondsを減らします。

### ステップ6: HelmチャートでアプリケーションをパッケージNG

マルチ環境デプロイメント向けの再利用可能なHelmチャートを作成します。

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** Helmチャートがテンプレート化された値を持つすべてのKubernetesリソースをパッケージングします。ドライランがレンダリングされたマニフェストを表示します。インストールが正しい順序ですべてのリソースをデプロイします。アップグレードがローリングアップデートを実行します。ロールバックが以前のリビジョンに戻ります。

**失敗時：** テンプレートエラーの場合、インストールなしにローカルでレンダリングするために `helm template .` を実行します。依存関係の問題には `helm dependency update` を実行します。値オーバーライド失敗の場合、YAMLパスがvalues.yamlに存在することを確認します。`helm get manifest myapp -n myapp-prod` で実際にデプロイされたリソースを確認します。

## バリデーション

- [ ] PodがすべてのコンテナがReadyになった状態でRunning
- [ ] Serviceエンドポイントに追加される前にReadinessプローブがパスする
- [ ] Livenessプローブが異常なコンテナを自動的に再起動する
- [ ] リソースリクエストと制限がOOMキルとノードのオーバーコミットを防ぐ
- [ ] SecretとConfigMapが期待値で正しくマウントされている
- [ ] ServiceがDNS（cluster.local）経由で他のPodから解決される
- [ ] LoadBalancer・Ingressが外部ネットワークからアクセス可能
- [ ] HPAが負荷下でレプリカをスケールアップし、アイドル時にスケールダウンする
- [ ] ローリングアップデートがゼロダウンタイムで完了する
- [ ] ログがkubectl logsまたは集中ロギングで収集・アクセス可能

## よくある落とし穴

- **Readinessプローブの欠如**: Podが完全に起動する前にトラフィックを受信します。アプリケーションの依存関係を検証するReadinessプローブを常に実装してください。

- **起動時間の不足**: 高速なLivenessプローブが起動の遅いアプリを終了させます。初期化に十分なfailureThresholdを持つstartupProbeを使用してください。

- **リソース制限なし**: Podが無制限のCPU・メモリを消費し、ノードの不安定化を引き起こします。リクエストと制限を常に設定してください。

- **ハードコードされた設定**: マニフェスト内の環境固有の値が再利用を妨げます。ConfigMap、Secret、Helm値を使用してください。

- **デフォルトのServiceAccount**: Podに不必要なクラスター権限があります。最小限のRBACを持つ専用ServiceAccountを作成してください。

- **ローリングアップデート戦略なし**: Deploymentがすべてのドを同時に再作成し、ダウンタイムを引き起こします。maxUnavailable: 0でRollingUpdateを使用してください。

- **バージョン管理されたシークレット**: Gitにコミットされた機密データ。sealed-secrets、external-secrets-operator、またはvaultを使用してください。

- **PodDisruptionBudgetなし**: クラスターメンテナンスがノードをドレインしサービスを破壊します。最小利用可能レプリカを確保するためにPodDisruptionBudgetを作成してください。

## 関連スキル

- `setup-docker-compose` - Kubernetes前のコンテナオーケストレーションの基礎
- `containerize-mcp-server` - デプロイ向けコンテナイメージの作成
- `write-helm-chart` - 高度なHelmチャート開発
- `manage-kubernetes-secrets` - SealedSecretsとexternal-secrets-operator
- `configure-ingress-networking` - NGINX IngressとCert-Managerのセットアップ
- `implement-gitops-workflow` - 宣言型デプロイメント向けArgoCD/Flux
- `setup-container-registry` - イメージレジストリ統合
