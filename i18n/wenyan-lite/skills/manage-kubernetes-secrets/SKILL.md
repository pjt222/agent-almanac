---
name: manage-kubernetes-secrets
locale: wenyan-lite
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

# 管 Kubernetes 秘密

於 Kubernetes 行生產級秘密管理，附加密、輪替與外部秘密庫整合。

## 適用時機

- 為 Kubernetes 應用存敏感配置（API 鍵、密碼、令牌）
- 行需將秘密提於版控之 GitOps 工作流
- 整合 Kubernetes 與 AWS Secrets Manager、Azure Key Vault、GCP Secret Manager
- 輪替憑證與證書而無應用停機
- 跨命名空間與團隊施最小權秘密訪問
- 自純文 Secrets 遷至加密或外管方案

## 輸入

- **必要**：有管理員訪之 Kubernetes 集群
- **必要**：待管之秘密（資料庫憑證、API 鍵、TLS 證書）
- **選擇性**：雲秘密管理器（AWS Secrets Manager、Azure Key Vault、GCP Secret Manager）
- **選擇性**：供 TLS 證書生成之證書機構
- **選擇性**：供 SealedSecrets 之 GitOps 倉
- **選擇性**：供靜態加密之 KMS

## 步驟

> 見 [Extended Examples](references/EXAMPLES.md) 供完整配置文件與模板。


### 步驟一：啟 Kubernetes Secrets 靜態加密

以 KMS 或本地加密為 Secrets 配靜態加密。

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

雲管 Kubernetes 者：

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

**預期：** Secrets 於 etcd 中靜態加密。Hexdump 示加密數據，非純文。KMS 整合為雲管集群配。既秘密之重加密成而無誤。

**失敗時：** API 伺服器啟動敗者，驗 encryption-config.yaml 語法與鍵格式（必為 base64 編碼之 32 位元組鍵）。KMS 誤者，查 IAM 權允 kms:Decrypt 與 kms:Encrypt。etcd 訪問問題者，用備份/復程以復若加密誤配。

### 步驟二：裝並配 Sealed Secrets 供 GitOps

部署 Bitnami Sealed Secrets 控制器以加密供 Git 存之秘密。

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

已封秘密形如：

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

**預期：** Sealed Secrets 控制器於 kube-system 命名空間運行。公證已取。Kubeseal 以公鑰加密 Secrets。施於集群之 Sealed Secrets 自動創解密 Secrets。僅控制器可解（有私鑰）。

**失敗時：** 加密誤者，驗控制器運行且 pub-cert.pem 有效。解密敗者，以 `kubectl logs -n kube-system -l name=sealed-secrets-controller` 查控制器日誌。命名空間不匹誤者，Sealed Secrets 默按命名空間範圍；用 `--scope cluster-wide` 供跨命名空間秘密。若私鑰失，已封秘密不能解；以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml` 備份控制器鍵。

### 步驟三：部署 External Secrets Operator 供雲秘密管理器

整合 Kubernetes 與 AWS Secrets Manager、Azure Key Vault，或 GCP Secret Manager。

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

**預期：** External Secrets Operator 運行。SecretStore 附雲提供者憑證已配。ExternalSecret 資源自雲秘密管理器拉取自動創 Kubernetes Secrets。秘密每時刷新。雲秘密管理器之變傳於集群。

**失敗時：** 認證誤者，驗 IAM 角色/服務帳號注釋與信任政策允假角色。同步敗者，以 `kubectl describe externalsecret` 查 ExternalSecret 狀。雲中缺秘密者，驗秘密名與 JSON 屬性路匹配。以 `aws secretsmanager get-secret-value --secret-id myapp/database` 測 AWS 憑證。

### 步驟四：以 cert-manager 行證書管理

以 cert-manager 自動化 TLS 證書配置與續期。

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

供 Ingress 注釋基之證書發行：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** cert-manager 自 Let's Encrypt 獲證書。TLS 秘密以有效證書與私鑰創。證書於過期前自續。Ingress 用證書供 HTTPS 終。

**失敗時：** ACME 挑戰敗者，驗 DNS 指向 Ingress LoadBalancer IP（http01）或 Route53 IAM 權（dns01）。速限誤者，用 `letsencrypt-staging` 發行者作測。續期敗者，以 `kubectl logs -n cert-manager deployment/cert-manager` 查 cert-manager 日誌。以 `curl -v https://myapp.example.com` 測證書。

### 步驟五：行秘密輪替策略

以版本管理與應用重啟自動化秘密輪替。

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

驗輪替工作流：

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

**預期：** Reloader 察 Secrets/ConfigMaps 並於變時重啟 Pods。秘密輪替更 AWS Secrets Manager，External Secrets Operator 同步至 Kubernetes，Reloader 觸發滾動重啟。應用不需手動介入即取新憑證。

**失敗時：** Reloader 未觸者，驗注釋語法且 Reloader 以 `kubectl get pods -n default -l app=reloader-reloader` 運行。External Secrets 同步遲者，減 refreshInterval 或手觸以 `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite`。輪替中應用連敗者，於應用碼行優雅秘密重載或用附重試邏之連接池。

### 步驟六：行 RBAC 供秘密訪問控制

以 Kubernetes RBAC 以最小權原則限秘密訪問。

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

測 RBAC：

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 服務帳號經 resourceNames 有特定秘密之唯讀訪問。開發者不能察生產命名空間之秘密。僅 secret-admins 組可創/更/刪秘密。RBAC 拒於審計日誌記。

**失敗時：** 訪拒誤者，驗 RoleBinding 主題匹配 ServiceAccount 名與命名空間。過寬角者，除萬用字元動詞並加 resourceNames 限。審計日誌缺者，於 API 伺服器啟 Kubernetes 審計日誌。部署變前以 `kubectl auth can-i` 測。

## 驗證

- [ ] Secrets 於 etcd 靜態加密（以 etcdctl 或 KMS 驗）
- [ ] Sealed Secrets 控制器運行且公證已取
- [ ] External Secrets Operator 自雲秘密管理器同步
- [ ] TLS 證書由 cert-manager 發並自續
- [ ] 秘密輪替以 Reloader 自動化應用重啟
- [ ] RBAC 政策施秘密之最小權訪問
- [ ] Git 倉或容器映像中無純文秘密
- [ ] sealed-secrets 私鑰之備份/復程已測
- [ ] 為秘密同步敗與過期配監警

## 常見陷阱

- **Git 史中之秘密**：提純文秘密而後除之不清 Git 史。以 git-filter-repo 或 BFG 重寫史，輪替已妥秘密

- **過寬 RBAC**：於命名空間中所有秘密授 `get secrets`。用 resourceNames 以僅限特定秘密之訪

- **無輪替策略**：秘密永不輪替，增妥協之爆炸半徑。以 External Secrets Operator 或 CronJobs 行自動輪替

- **缺靜態加密**：Secrets 以純文存於 etcd。存敏數據前啟加密提供者或 KMS 整合

- **應用緩秘密**：應用於啟時讀秘密一次而不重載。行信號處理（SIGHUP）或秘密文件變之文件察

- **External Secrets 刷過慢**：默 1 時刷謂秘密變需至一時方傳。為關秘密降 refreshInterval，用 webhook 以立即更

- **無 sealed-secrets 鍵備**：控制器私鑰失，所有已封秘密不可復。以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` 備並安存

- **證書續期敗**：cert-manager 因 DNS/防火牆變不能續。以 Prometheus 指標與警監證書過期

## 相關技能

- `deploy-to-kubernetes` - 於 Deployments 與 StatefulSets 中用秘密
- `enforce-policy-as-code` - 為秘密訪問驗證之 OPA 政策
- `security-audit-codebase` - 察應用碼中之硬編碼秘密
- `configure-ingress-networking` - Ingress 資源中之 TLS 證書用
- `implement-gitops-workflow` - ArgoCD/Flux 管線中之 Sealed Secrets
