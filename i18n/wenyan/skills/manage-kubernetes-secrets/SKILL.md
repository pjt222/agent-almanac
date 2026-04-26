---
name: manage-kubernetes-secrets
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement secure secrets management in Kubernetes using SealedSecrets for GitOps,
  External Secrets Operator for cloud secret managers, and rotation strategies. Handle
  TLS certificates, API keys, and credentials with encryption at rest and RBAC controls.
  Use when storing sensitive configuration for Kubernetes applications, implementing GitOps
  where secrets must be version-controlled, integrating with AWS Secrets Manager or Azure
  Key Vault, rotating credentials without downtime, or migrating from plaintext Secrets to
  encrypted solutions.
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

# 管 Kubernetes 密

以 SealedSecrets 於 GitOps、External Secrets Operator 於雲密管、並旋換之略施產線級 Kubernetes 密管，加密於靜、RBAC 之控。

## 用時

- 為 Kubernetes 應存敏感配置（API 鍵、密碼、詞元）
- 施 GitOps 工作流，密須入版本控制
- 合 Kubernetes 於 AWS Secrets Manager、Azure Key Vault、GCP Secret Manager
- 旋憑證與證書，應無停機
- 施最小特權之密訪，跨名空間與團隊
- 自明文 Secret 遷至加密或外管之解

## 入

- **必要**：具管訪之 Kubernetes 叢集
- **必要**：欲管之密（資料庫憑、API 鍵、TLS 證書）
- **可選**：雲密管（AWS Secrets Manager、Azure Key Vault、GCP Secret Manager）
- **可選**：為 TLS 證書生成之證書機構
- **可選**：SealedSecrets 用之 GitOps 倉
- **可選**：靜加密用之 key management service (KMS)

## 法

> 完整配置檔案與樣板，見 [Extended Examples](references/EXAMPLES.md)。


### 第一步：啟 Kubernetes Secret 之靜加密

以 KMS 或本地加密為 Secret 設靜加密。

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

雲管之 Kubernetes：

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

**得：**Secret 於 etcd 靜加密。Hexdump 顯加密之資，非明文。雲管叢集之 KMS 合已設。既 Secret 之重加密無誤而成。

**敗則：**API 伺啟動敗，驗 encryption-config.yaml 之語法與鍵格（須 base64 編 32 位之鍵）。KMS 誤者，察 IAM 權限容 kms:Decrypt 與 kms:Encrypt。etcd 訪疑者，以備／復之規復加密誤配者。

### 第二步：裝並設 Sealed Secrets 以 GitOps

佈 Bitnami Sealed Secrets 控制器以加密密為 Git 存。

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

封之密似此：

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

施並驗：

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

**得：**Sealed Secrets 控制器運於 kube-system 名空間。公證已取。Kubeseal 以公鍵加密 Secret。Sealed Secret 施於叢集時自動建解密 Secret。唯控制器可解密（有私鍵）。

**敗則：**加密誤者，驗控制器運行而 pub-cert.pem 有效。解密敗者，以 `kubectl logs -n kube-system -l name=sealed-secrets-controller` 察控制器日誌。名空間不合誤者，封密預設為名空間作用域；跨名空間者用 `--scope cluster-wide`。私鍵失則封密不可解；以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml` 備控制器鍵。

### 第三步：佈 External Secrets Operator 以雲密管

合 Kubernetes 於 AWS Secrets Manager、Azure Key Vault、或 GCP Secret Manager。

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

Azure Key Vault 者：

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

**得：**External Secrets Operator 運。SecretStore 以雲供應商憑設。ExternalSecret 資源自雲密管拉而自動建 Kubernetes Secret。Secret 每時刷。雲密管之變播至叢集。

**敗則：**認證誤者，驗 IAM 角色／服務帳戶註與信任政策容 assume role。同步敗者，以 `kubectl describe externalsecret` 察 ExternalSecret 之態。雲中缺密者，驗密名與 JSON 屬性路徑合。以 `aws secretsmanager get-secret-value --secret-id myapp/database` 試 AWS 憑。

### 第四步：以 cert-manager 施證書管

以 cert-manager 自化 TLS 證書之配與續。

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

入口註式之證書發：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**得：**cert-manager 自 Let's Encrypt 得證書。TLS 密建，具有效證書與私鍵。證書於過期前自續。入口用證書為 HTTPS 終止。

**敗則：**ACME 挑戰敗者，http01 驗 DNS 指入口 LoadBalancer IP，dns01 驗 Route53 IAM 權限。速限誤者，試用 `letsencrypt-staging` 發行者。續敗者，以 `kubectl logs -n cert-manager deployment/cert-manager` 察 cert-manager 日誌。以 `curl -v https://myapp.example.com` 試證書。

### 第五步：施密旋策

以版管與應重啟自化密旋。

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

驗旋工作流：

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

**得：**Reloader 察 Secret/ConfigMap 並於變時重啟 Pod。密旋更 AWS Secrets Manager，External Secrets Operator 同至 Kubernetes，Reloader 觸滾動重啟。應無手介而取新憑。

**敗則：**Reloader 未觸者，驗註之語與 Reloader 運以 `kubectl get pods -n default -l app=reloader-reloader`。External Secrets 同延者，減 refreshInterval 或以 `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite` 手觸。旋中應連敗者，於應碼施優雅密重載或以連池附重試邏輯。

### 第六步：以 RBAC 施密訪控

以 Kubernetes RBAC 以最小特權之則限密訪。

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

試 RBAC：

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**得：**服務帳戶經 resourceNames 僅讀特定密。開發者不可察產線名空間之密。唯 secret-admins 群可建／更／刪密。RBAC 拒記於審計日誌。

**敗則：**訪拒誤者，驗 RoleBinding 之主體配 ServiceAccount 名與名空間。權限過廣者，除萬用動詞並加 resourceNames 限。審計日誌隙者，於 API 伺器層啟 Kubernetes 審計日誌。佈變前以 `kubectl auth can-i` 試。

## 驗

- [ ] Secret 於 etcd 靜加密（以 etcdctl 或 KMS 驗）
- [ ] Sealed Secrets 控制器運而公證已取
- [ ] External Secrets Operator 自雲密管同步
- [ ] TLS 證書由 cert-manager 發且自續
- [ ] 密旋經 Reloader 自動化，附應重啟
- [ ] RBAC 政策施最小特權之密訪
- [ ] 無明文密於 Git 倉或容器鏡像
- [ ] sealed-secrets 私鍵之備／復規已試
- [ ] 密同步敗與過期之監告已設

## 陷

- **Git 史中之密**：提交明文密後除之不清 Git 史。用 git-filter-repo 或 BFG 重寫史，旋洩露之密

- **RBAC 過廣**：於名空間諸密准 `get secrets`。用 resourceNames 僅限特定密之訪

- **無旋策**：密永不旋，增洩之爆半徑。以 External Secrets Operator 或 CronJob 施自動旋

- **缺靜加密**：密以明文存於 etcd。存敏資前啟加密供應商或 KMS 合

- **應快取密**：應啟時讀密一次而永不重載。施信號處（SIGHUP）或檔察於密檔之變

- **External Secrets 刷過慢**：預設 1 小時刷意密變傳播需時至一小時。為關鍵密降 refreshInterval，用 webhook 為即更

- **sealed-secrets 鍵無備**：控制器私鍵失則諸封密不可復。以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` 備並安存

- **證書續敗**：cert-manager 因 DNS／防火牆之變不能續。以 Prometheus 指標與告監證書過期

## 參

- `deploy-to-kubernetes` — 於 Deployment 與 StatefulSet 中用密
- `enforce-policy-as-code` — 密訪驗之 OPA 政策
- `security-audit-codebase` — 察應碼中之硬碼密
- `configure-ingress-networking` — 入口資源中 TLS 證書之用
- `implement-gitops-workflow` — ArgoCD/Flux 管線中之 Sealed Secrets
