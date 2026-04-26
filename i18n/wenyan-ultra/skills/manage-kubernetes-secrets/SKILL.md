---
name: manage-kubernetes-secrets
locale: wenyan-ultra
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

於 Kubernetes 以 SealedSecrets（GitOps）、External Secrets Operator（雲密管）、輪換策施安密管。處 TLS 證、API 鍵、憑附靜加與 RBAC 控。

## 用

- 存 Kubernetes 應之敏配（API 鍵、密、令）
- 施 GitOps 密須版控之流
- 合 Kubernetes 與 AWS Secrets Manager、Azure Key Vault、GCP Secret Manager
- 輪憑與證無停機
- 跨命名空間與隊執最小權訪密
- 遷純文 Secret 至加或外管解

## 入

- **必**：有管理員訪之 Kubernetes 集
- **必**：待管密（庫憑、API 鍵、TLS 證）
- **可**：雲密管（AWS Secrets Manager、Azure Key Vault、GCP Secret Manager）
- **可**：TLS 證生之證書機構
- **可**：SealedSecrets 之 GitOps 庫
- **可**：靜加之鑰管服（KMS）

## 行

> 全配置文件與模板詳見 [Extended Examples](references/EXAMPLES.md)。


### 一：啟 Kubernetes 密靜加

為 Secret 配靜加，以 KMS 或本加：

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

雲管 Kubernetes：

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

得：密於 etcd 靜加。hexdump 示加數非純文。雲管集配 KMS 合。現密重加畢無誤。

敗：API 伺啟敗→驗 encryption-config.yaml 語與鑰式（須 base64 編之 32 字節）。KMS 誤→察 IAM 權許 kms:Decrypt 與 kms:Encrypt。etcd 訪問題→用備/恢法以恢若加誤配。

### 二：裝並配 Sealed Secrets 為 GitOps

部 Bitnami Sealed Secrets 控制器加密供 Git 存：

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

封密見：

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

得：Sealed Secrets 控制器於 kube-system 運。公證取。kubeseal 以公鑰加 Secret。封密施於集自造解 Secret。唯控可解（有私鑰）。

敗：加誤→驗控制器運行且 pub-cert.pem 有效。解敗→以 `kubectl logs -n kube-system -l name=sealed-secrets-controller` 察控制器日誌。命名空間不匹→封密默空間域；跨空間用 `--scope cluster-wide`。私鑰失→封密不可解；以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml` 備控制器鑰。

### 三：部 External Secrets Operator 為雲密管

合 Kubernetes 與 AWS Secrets Manager、Azure Key Vault、或 GCP Secret Manager：

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

Azure Key Vault：

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

得：External Secrets Operator 運。SecretStore 附雲供應者憑配。ExternalSecret 資自由雲密管拉造 Kubernetes Secret。密時更。雲密管變傳至集。

敗：認誤→驗 IAM 角色/服務賬戶註及信任政策許 assume role。同敗→以 `kubectl describe externalsecret` 察 ExternalSecret 態。雲缺密→驗密名與 JSON 屬路匹。以 `aws secretsmanager get-secret-value --secret-id myapp/database` 測 AWS 憑。

### 四：以 cert-manager 施證管

以 cert-manager 自動 TLS 證供應與續：

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

Ingress 註發證：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

得：cert-manager 由 Let's Encrypt 得證。TLS 密造附有效證與私鑰。證自續於期前。Ingress 用證於 HTTPS 終。

敗：ACME 挑戰敗→驗 DNS 指 Ingress LoadBalancer IP 供 http01，或 Route53 IAM 權供 dns01。限速誤→測用 `letsencrypt-staging` 發行者。續敗→以 `kubectl logs -n cert-manager deployment/cert-manager` 察。以 `curl -v https://myapp.example.com` 測證。

### 五：施密輪策

以版管與應重啟自動化密輪：

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

驗輪流：

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

得：Reloader 察 Secret/ConfigMap 並於變時重啟 Pod。密輪更 AWS Secrets Manager，External Secrets Operator 同至 Kubernetes，Reloader 觸滾重啟。應取新憑而無手動。

敗：Reloader 不觸→驗註語且 Reloader 運（`kubectl get pods -n default -l app=reloader-reloader`）。External Secrets 同延→減 refreshInterval 或手動以 `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite` 觸。輪中應連敗→於應碼施優雅密重載或以連池附重試邏輯。

### 六：施 Secret 訪控之 RBAC

以 Kubernetes RBAC 最小權限限密訪：

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

得：服賬經 resourceNames 有具密只讀訪。開發者不可視生命名空間密。唯 secret-admins 組可造/更/刪密。RBAC 拒記於審日誌。

敗：訪拒→驗 RoleBinding subjects 匹 ServiceAccount 名與命名空間。過寬角色→除通配動詞加 resourceNames 限。審日隙→於 API 伺層啟 Kubernetes 審日誌。部變前以 `kubectl auth can-i` 測。

## 驗

- [ ] 密於 etcd 靜加（以 etcdctl 或 KMS 驗）
- [ ] Sealed Secrets 控制器運且公證已取
- [ ] External Secrets Operator 由雲密管同
- [ ] TLS 證由 cert-manager 發且自續
- [ ] 密輪自動化附應重啟（經 Reloader）
- [ ] RBAC 政策執密最小權訪
- [ ] Git 庫或容像中無純文密
- [ ] 備/恢法測 sealed-secrets 私鑰
- [ ] 密同敗與過期有監告

## 忌

- **Git 史中密**：提純文密後除不清 Git 史。用 git-filter-repo 或 BFG 重寫史，輪受害密。

- **過寬 RBAC**：授命名空間諸密之 `get secrets`。用 resourceNames 限訪具密。

- **無輪策**：密從不輪，增受害爆範。以 External Secrets Operator 或 CronJob 施自輪。

- **缺靜加**：密於 etcd 純文存。存敏前啟加供應者或 KMS 合。

- **應緩密**：應啟時讀密而永不重載。施信號處（SIGHUP）或密文件觀察。

- **External Secrets 更過慢**：默 1 時更→密變至傳需逾一時。為關密降 refreshInterval，用 webhook 即更。

- **sealed-secrets 鑰無備**：控制器私鑰失→諸封密不可恢。以 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` 備並安存。

- **證續敗**：cert-manager 因 DNS/牆變不能續。以 Prometheus 度與告監證期。

## 參

- `deploy-to-kubernetes` - 於 Deployment 與 StatefulSet 用密
- `enforce-policy-as-code` - 密訪驗之 OPA 政策
- `security-audit-codebase` - 察應碼中硬編密
- `configure-ingress-networking` - Ingress 資中之 TLS 證用
- `implement-gitops-workflow` - ArgoCD/Flux 管道中之 Sealed Secrets
