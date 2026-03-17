---
name: manage-kubernetes-secrets
description: >
  GitOps向けSealedSecrets、クラウドシークレットマネージャー向けExternal Secrets Operator、
  ローテーション戦略を使用してKubernetesで安全なシークレット管理を実装します。
  保存時の暗号化とRBACコントロールによるTLS証明書、APIキー、認証情報を処理します。
  Kubernetesアプリケーションの機密設定の保存、シークレットをバージョン管理する必要のある
  GitOpsの実装、AWS Secrets ManagerやAzure Key Vaultとの統合、ダウンタイムなしの
  認証情報ローテーション、またはプレーンテキストSecretから暗号化ソリューションへの
  移行に使用します。
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
  tags: kubernetes, secrets, sealedsecrets, external-secrets, security
---

# Kubernetesシークレットの管理

暗号化、ローテーション、外部シークレットストアとの統合による本番グレードのKubernetesシークレット管理を実装します。

## 使用タイミング

- Kubernetesアプリケーションの機密設定（APIキー、パスワード、トークン）の保存
- シークレットをバージョン管理にコミットする必要のあるGitOpsワークフローの実装
- KubernetesとAWS Secrets Manager、Azure Key Vault、GCP Secret Managerの統合
- アプリケーションのダウンタイムなしの認証情報と証明書のローテーション
- NamespaceとチームをまたいだシークレットへのID最小権限アクセスの強制
- プレーンテキストSecretから暗号化または外部管理ソリューションへの移行

## 入力

- **必須**: Admin権限を持つKubernetesクラスター
- **必須**: 管理対象シークレット（データベース認証情報、APIキー、TLS証明書）
- **任意**: クラウドシークレットマネージャー（AWS Secrets Manager、Azure Key Vault、GCP Secret Manager）
- **任意**: TLS証明書生成向け認証局
- **任意**: SealedSecrets向けGitOpsリポジトリ
- **任意**: 保存時暗号化向けKMS

## 手順

> 完全な設定ファイルとテンプレートは[拡張サンプル](references/EXAMPLES.md)を参照してください。

### ステップ1: Kubernetesシークレットの保存時暗号化の有効化

KMSまたはローカル暗号化を使用してSecretの保存時暗号化を設定します。

```bash
# For AWS EKS, enable secrets encryption with KMS
cat > encryption-config.yaml <<EOF
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: $(head -c 32 /dev/urandom | base64)
      - identity: {}
EOF

# For self-hosted clusters, configure API server
# Add to kube-apiserver flags:
# --encryption-provider-config=/etc/kubernetes/encryption-config.yaml

# Verify encryption status
kubectl get secrets -A -o json | jq '.items[] | select(.metadata.name != "default-token") | .metadata.name'

# Encrypt existing secrets by reading and rewriting
kubectl get secrets --all-namespaces -o json | kubectl replace -f -

# Verify a secret is encrypted at rest
# Check etcd directly (requires etcd access)
ETCDCTL_API=3 etcdctl get /registry/secrets/default/my-secret --print-value-only | hexdump -C
```

クラウド管理Kubernetesの場合：

```bash
# AWS EKS - Create KMS key
aws kms create-key --description "EKS secrets encryption"
KMS_KEY_ARN=$(aws kms describe-key --key-id alias/eks-secrets --query 'KeyMetadata.Arn' --output text)

# Enable encryption on EKS cluster
aws eks associate-encryption-config \
  --cluster-name my-cluster \
  --encryption-config "resources=secrets,provider={keyArn=$KMS_KEY_ARN}"

# GKE - Enable application-layer secrets encryption
gcloud container clusters update my-cluster \
  --database-encryption-key projects/PROJECT_ID/locations/LOCATION/keyRings/RING_NAME/cryptoKeys/KEY_NAME

# AKS - Encryption enabled by default with platform-managed keys
# Optionally use customer-managed keys
az aks update \
  --name my-cluster \
  --resource-group my-rg \
  --enable-azure-keyvault-secrets-provider
```

**期待結果：** シークレットがetcdで保存時に暗号化されます。hexdumpがプレーンテキストではなく暗号化されたデータを表示します。クラウド管理クラスターのKMS統合が設定されます。既存シークレットの再暗号化がエラーなく完了します。

**失敗時：** APIサーバー起動失敗の場合、encryption-config.yamlの構文とキーフォーマット（base64エンコードされた32バイトキーが必須）を確認します。KMSエラーの場合、IAMパーミッションがkms:DecryptとKms:Encryptを許可していることを確認します。etcdアクセスの問題には、暗号化が誤って設定された場合はバックアップ・リストア手順を使用して復旧します。

### ステップ2: GitOps向けSealed Secretsのインストールと設定

Git保存向けにシークレットを暗号化するBitnami Sealed Secretsコントローラーをデプロイします。

```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Verify controller is running
kubectl get pods -n kube-system -l name=sealed-secrets-controller

# Install kubeseal CLI
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar xfz kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Fetch public key for offline sealing
kubeseal --fetch-cert \
  --controller-namespace=kube-system \
  --controller-name=sealed-secrets-controller \
  > pub-cert.pem

# Create a regular Secret (NOT applied to cluster yet)
kubectl create secret generic mysecret \
  --from-literal=username=admin \
  --from-literal=password='sup3rs3cr3t!' \
  --dry-run=client \
  -o yaml > mysecret.yaml

# Seal the secret
kubeseal --format=yaml --cert=pub-cert.pem < mysecret.yaml > mysealedsecret.yaml

# Inspect sealed secret (safe to commit to Git)
cat mysealedsecret.yaml
```

シールドシークレットは次のようになります：

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: mysecret
  namespace: default
spec:
  encryptedData:
    username: AgA8V7f3q2... (encrypted data)
    password: AgBkXp9n1h... (encrypted data)
  template:
    metadata:
      name: mysecret
      namespace: default
```

適用と検証：

```bash
# Apply sealed secret to cluster
kubectl apply -f mysealedsecret.yaml

# Verify regular Secret was created automatically
kubectl get secret mysecret -o yaml

# Decode secret to verify values
kubectl get secret mysecret -o jsonpath='{.data.username}' | base64 -d

# Commit sealed secret to Git (safe, encrypted)
git add mysealedsecret.yaml
git commit -m "Add database credentials as sealed secret"
```

**期待結果：** Sealed Secretsコントローラーがkube-system namespaceで実行されています。公開証明書が取得されています。Kubesealが公開キーを使用してSecretを暗号化します。クラスターに適用されたSealed Secretsが自動的に復号化されたSecretを作成します。コントローラーのみが復号化できます（秘密キーを持つ）。

**失敗時：** 暗号化エラーの場合、コントローラーが実行中でpub-cert.pemが有効であることを確認します。復号化失敗の場合、`kubectl logs -n kube-system -l name=sealed-secrets-controller` でコントローラーログを確認します。Namespaceミスマッチエラーの場合、Sealed SecretはデフォルトでNamespaceスコープです。Namespace横断シークレットには `--scope cluster-wide` を使用します。秘密キーが失われた場合、Sealed Secretを復号化できません。`kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml` でコントローラーキーをバックアップします。

### ステップ3: クラウドシークレットマネージャー向けExternal Secrets Operatorのデプロイ

KubernetesをAWS Secrets Manager、Azure Key Vault、またはGCP Secret Managerと統合します。

```bash
# Install External Secrets Operator via Helm
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Verify operator is running
kubectl get pods -n external-secrets-system

# Create IAM role for AWS Secrets Manager (EKS with IRSA)
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.REGION.amazonaws.com/id/OIDC_ID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:default:external-secrets-sa"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name external-secrets-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name external-secrets-role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

# Create SecretStore referencing AWS Secrets Manager
cat <<EOF | kubectl apply -f -
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretsmanager
  namespace: default
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-secrets-sa
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/external-secrets-role
EOF

# Create secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name myapp/database \
  --secret-string '{
    "username":"dbadmin",
    "password":"dbpass123",
    "endpoint":"db.example.com:5432",
    "database":"myapp"
  }'

# Create ExternalSecret to sync from AWS
cat <<EOF | kubectl apply -f -
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-database
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: myapp-db-secret
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: myapp/database
      property: username
  - secretKey: password
    remoteRef:
      key: myapp/database
      property: password
  - secretKey: endpoint
    remoteRef:
      key: myapp/database
      property: endpoint
EOF

# Verify ExternalSecret synced
kubectl get externalsecret myapp-database
kubectl get secret myapp-db-secret -o yaml

# Check synchronization status
kubectl describe externalsecret myapp-database
```

Azure Key Vaultの場合：

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: azure-keyvault
  namespace: default
spec:
  provider:
    azurekv:
      authType: ManagedIdentity
      vaultUrl: "https://my-keyvault.vault.azure.net"
      tenantId: "tenant-id"
```

**期待結果：** External Secrets Operatorが実行されています。SecretStoreがクラウドプロバイダー認証情報で設定されています。ExternalSecretリソースがクラウドシークレットマネージャーからプルしてKubernetes Secretを自動作成します。シークレットが毎時リフレッシュされます。クラウドシークレットマネージャーの変更がクラスターに伝播します。

**失敗時：** 認証エラーの場合、IAMロール・ServiceAccountアノテーションとトラストポリシーがロール引き受けを許可していることを確認します。同期失敗の場合、`kubectl describe externalsecret` でExternalSecretのステータスを確認します。クラウドでシークレットが見つからない場合、シークレット名とJSONプロパティパスが一致することを確認します。`aws secretsmanager get-secret-value --secret-id myapp/database` でAWSクレデンシャルをテストします。

### ステップ4: cert-managerによる証明書管理の実装

cert-managerを使用したTLS証明書のプロビジョニングと更新を自動化します。

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

Ingressアノテーションベースの証明書発行：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** cert-managerがLet's Encryptから証明書を取得します。有効な証明書と秘密キーを含むTLSシークレットが作成されます。証明書の有効期限前に自動更新されます。IngressがHTTPS終端に証明書を使用します。

**失敗時：** ACMEチャレンジ失敗の場合、DNSがhttp01のIngressのLoadBalancer IPを指していることを確認するか、dns01のRoute53 IAMパーミッションを確認します。レート制限エラーの場合、テストに `letsencrypt-staging` issuerを使用します。更新失敗の場合、`kubectl logs -n cert-manager deployment/cert-manager` でcert-managerログを確認します。`curl -v https://myapp.example.com` で証明書をテストします。

### ステップ5: シークレットローテーション戦略の実装

バージョン管理とアプリケーション再起動によるシークレットローテーションを自動化します。

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

ローテーションワークフローの検証：

```bash
# Manually trigger rotation
kubectl create job --from=cronjob/secret-rotation manual-rotation-$(date +%s)

# Watch for Secret update
kubectl get secret myapp-db-secret -w

# Verify Reloader triggered Pod restart
kubectl get events --sort-by='.lastTimestamp' | grep Reloader

# Check new Pods are using updated secret
kubectl get pods -l app=myapp
kubectl exec -it <pod-name> -- env | grep DB_PASSWORD
```

**期待結果：** ReloaderがSecretとConfigMapを監視し、変更時にPodを再起動します。シークレットローテーションがAWS Secrets Managerを更新し、External Secrets OperatorがKubernetesに同期し、Reloaderがローリング再起動をトリガーします。アプリケーションが手動介入なしに新しい認証情報を取得します。

**失敗時：** Reloaderがトリガーしない場合、アノテーション構文を確認し `kubectl get pods -n default -l app=reloader-reloader` でReloaderが実行中であることを確認します。External Secretsの同期遅延の場合、refreshIntervalを減らすか `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite` で手動トリガーします。ローテーション中のアプリケーション接続失敗の場合、アプリケーションコードにグレースフルなシークレットリロードを実装するか、リトライロジックを持つ接続プーリングを使用します。

### ステップ6: シークレットアクセス制御向けRBACの実装

最小権限原則を使用したKubernetes RBACでシークレットアクセスを制限します。

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

RBACのテスト：

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** ServiceAccountがresourceNamesで特定のシークレットに読み取り専用アクセスを持ちます。開発者がproduction namespaceでシークレットを閲覧できません。secret-adminsグループのみがシークレットを作成・更新・削除できます。RBACの拒否が監査ログに記録されます。

**失敗時：** アクセス拒否エラーの場合、RoleBindingのサブジェクトがServiceAccountの名前とnamespaceに一致することを確認します。過度に広い権限の場合、ワイルドカード動詞を削除してresourceNames制限を追加します。監査ログのギャップの場合、APIサーバーレベルでKubernetes監査ロギングを有効にします。変更をデプロイする前に `kubectl auth can-i` でテストします。

## バリデーション

- [ ] etcdでシークレットが保存時に暗号化されている（etcdctlまたはKMSで検証）
- [ ] Sealed Secretsコントローラーが実行中で公開証明書が取得済み
- [ ] External Secrets Operatorがクラウドシークレットマネージャーから同期中
- [ ] TLS証明書がcert-managerによって発行され自動更新中
- [ ] シークレットローテーションがReloader経由のアプリケーション再起動で自動化
- [ ] RBACポリシーがシークレットへの最小権限アクセスを強制
- [ ] Gitリポジトリやコンテナイメージにプレーンテキストシークレットがない
- [ ] sealed-secretsの秘密キーのバックアップ・リストア手順がテスト済み
- [ ] シークレット同期失敗と有効期限に対するモニタリングアラートが設定済み

## よくある落とし穴

- **Gitヒストリーへのシークレット**: プレーンテキストシークレットをコミットしてから削除しても、Gitヒストリーは消去されません。git-filter-repoまたはBFGでヒストリーを書き換え、漏洩したシークレットをローテーションしてください。

- **過度に広いRBAC**: namespace内のすべてのシークレットに `get secrets` を付与しています。特定のシークレットのみへのアクセスを制限するためにresourceNamesを使用してください。

- **ローテーション戦略なし**: シークレットが決してローテーションされず、漏洩の影響範囲が拡大します。External Secrets OperatorまたはCronJobによる自動ローテーションを実装してください。

- **保存時暗号化なし**: シークレットがetcdにプレーンテキストで保存されています。機密データを保存する前に暗号化プロバイダーまたはKMS統合を有効にしてください。

- **アプリケーションがシークレットをキャッシュ**: アプリが起動時に一度シークレットを読み込み、リロードしません。シークレットファイルの変更に対するシグナルハンドリング（SIGHUP）またはファイルウォッチャーを実装してください。

- **External Secretsのリフレッシュが遅すぎる**: デフォルトの1時間リフレッシュは、シークレット変更の伝播に最大1時間かかることを意味します。クリティカルなシークレットにはrefreshIntervalを下げ、即座の更新にはWebhookを使用してください。

- **sealed-secretsキーのバックアップなし**: コントローラーの秘密キーが失われ、すべてのSealed Secretsが復旧不能になります。`kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` でバックアップし、安全に保管してください。

- **証明書更新失敗**: DNS・ファイアウォールの変更によりcert-managerが更新できません。Prometheusメトリクスとアラートで証明書の有効期限を監視してください。

## 関連スキル

- `deploy-to-kubernetes` - DeploymentとStatefulSetでのシークレット使用
- `enforce-policy-as-code` - シークレットアクセス検証のOPAポリシー
- `security-audit-codebase` - アプリケーションコードでのハードコードされたシークレットの検出
- `configure-ingress-networking` - IngressリソースでのTLS証明書使用
- `implement-gitops-workflow` - ArgoCD・FluxパイプラインでのSealed Secrets
