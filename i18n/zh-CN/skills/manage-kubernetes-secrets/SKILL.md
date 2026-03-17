---
name: manage-kubernetes-secrets
description: >
  使用 SealedSecrets 实现 GitOps 密钥管理、使用 External Secrets Operator
  对接云端密钥管理器，并制定轮换策略，在 Kubernetes 中安全管理密钥。
  处理 TLS 证书、API 密钥和凭证，实现静态加密和 RBAC 控制。适用于为
  Kubernetes 应用存储敏感配置、在 GitOps 中对密钥进行版本控制、集成
  AWS Secrets Manager 或 Azure Key Vault、不停机轮换凭证，或从明文
  Secret 迁移至加密方案。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: kubernetes, secrets, sealedsecrets, external-secrets, security
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 管理 Kubernetes 密钥

为 Kubernetes 实现生产级密钥管理，支持加密、轮换和与外部密钥存储的集成。

## 适用场景

- 为 Kubernetes 应用存储敏感配置（API 密钥、密码、令牌）
- 实现密钥需要提交至版本控制的 GitOps 工作流
- 将 Kubernetes 与 AWS Secrets Manager、Azure Key Vault、GCP Secret Manager 集成
- 不停机轮换凭证和证书
- 跨命名空间和团队强制执行密钥访问最小权限
- 从明文 Secret 迁移至加密或外部管理方案

## 输入

- **必填**：具有管理员访问权限的 Kubernetes 集群
- **必填**：待管理的密钥（数据库凭证、API 密钥、TLS 证书）
- **可选**：云密钥管理器（AWS Secrets Manager、Azure Key Vault、GCP Secret Manager）
- **可选**：用于生成 TLS 证书的证书颁发机构
- **可选**：用于 SealedSecrets 的 GitOps 仓库
- **可选**：用于静态加密的密钥管理服务（KMS）

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：启用 Kubernetes 密钥静态加密

使用 KMS 或本地加密配置 Secret 的静态加密。

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

对于云托管 Kubernetes：

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

**预期结果：** Secret 在 etcd 中静态加密。hexdump 显示加密数据而非明文。云托管集群已配置 KMS 集成。现有 Secret 的重新加密无错误完成。

**失败处理：** 对于 API server 启动失败，验证 encryption-config.yaml 语法和密钥格式（必须是 base64 编码的 32 字节密钥）。对于 KMS 错误，检查 IAM 权限是否允许 kms:Decrypt 和 kms:Encrypt。对于 etcd 访问问题，如果加密配置错误，使用备份/恢复程序进行恢复。

### 第 2 步：安装和配置 SealedSecrets 用于 GitOps

部署 Bitnami Sealed Secrets 控制器以加密密钥用于 Git 存储。

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

已密封的 Secret 格式如下：

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

应用并验证：

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

**预期结果：** Sealed Secrets 控制器在 kube-system 命名空间运行。已获取公共证书。kubeseal 使用公钥加密 Secret。应用至集群的 SealedSecret 自动创建解密后的 Secret。只有控制器才能解密（拥有私钥）。

**失败处理：** 对于加密错误，验证控制器是否运行，pub-cert.pem 是否有效。对于解密失败，使用 `kubectl logs -n kube-system -l name=sealed-secrets-controller` 检查控制器日志。对于命名空间不匹配错误，SealedSecret 默认为命名空间范围；对跨命名空间密钥使用 `--scope cluster-wide`。如果私钥丢失，SealedSecret 将无法解密；使用 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml` 备份控制器密钥。

### 第 3 步：部署 External Secrets Operator 用于云密钥管理器

将 Kubernetes 与 AWS Secrets Manager、Azure Key Vault 或 GCP Secret Manager 集成。

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

对于 Azure Key Vault：

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

**预期结果：** External Secrets Operator 运行中。SecretStore 配置了云提供商凭证。ExternalSecret 资源通过从云密钥管理器拉取自动创建 Kubernetes Secret。密钥每小时刷新一次。云密钥管理器中的变更传播至集群。

**失败处理：** 对于认证错误，验证 IAM 角色/服务账户注解和信任策略是否允许 assume role。对于同步失败，使用 `kubectl describe externalsecret` 检查 ExternalSecret 状态。对于云中缺少密钥，验证密钥名称和 JSON 属性路径是否匹配。使用 `aws secretsmanager get-secret-value --secret-id myapp/database` 测试 AWS 凭证。

### 第 4 步：使用 cert-manager 实现证书管理

使用 cert-manager 自动化 TLS 证书的预置和续期。

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

对于基于 Ingress 注解的证书颁发：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** cert-manager 从 Let's Encrypt 获取证书。创建包含有效证书和私钥的 TLS Secret。证书在到期前自动续期。Ingress 使用证书进行 HTTPS 终止。

**失败处理：** 对于 ACME 挑战失败，验证 DNS 是否指向 http01 的 Ingress LoadBalancer IP，或 dns01 的 Route53 IAM 权限。对于速率限制错误，使用 `letsencrypt-staging` Issuer 进行测试。对于续期失败，使用 `kubectl logs -n cert-manager deployment/cert-manager` 检查 cert-manager 日志。使用 `curl -v https://myapp.example.com` 测试证书。

### 第 5 步：实现密钥轮换策略

通过版本管理和应用重启自动化密钥轮换。

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

验证轮换工作流：

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

**预期结果：** Reloader 监控 Secret/ConfigMap 并在变更时重启 Pod。密钥轮换更新 AWS Secrets Manager，External Secrets Operator 同步至 Kubernetes，Reloader 触发滚动重启。应用无需手动干预即可获取新凭证。

**失败处理：** 对于 Reloader 未触发，验证注解语法并用 `kubectl get pods -n default -l app=reloader-reloader` 确认 Reloader 是否运行。对于 External Secrets 同步延迟，减少 refreshInterval 或使用 `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite` 手动触发。对于轮换期间应用连接失败，在应用代码中实现优雅的密钥重新加载，或使用带重试逻辑的连接池。

### 第 6 步：实现密钥访问控制 RBAC

使用最小权限原则的 Kubernetes RBAC 限制密钥访问。

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

测试 RBAC：

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 服务账户通过 resourceNames 对特定密钥具有只读访问权限。开发人员无法查看生产命名空间中的密钥。只有 secret-admins 组才能创建/更新/删除密钥。RBAC 拒绝记录在审计日志中。

**失败处理：** 对于访问拒绝错误，验证 RoleBinding subjects 是否与 ServiceAccount 名称和命名空间匹配。对于权限过宽的角色，移除通配符动词并添加 resourceNames 限制。对于审计日志缺失，在 API server 级别启用 Kubernetes 审计日志。在部署变更前使用 `kubectl auth can-i` 测试。

## 验证清单

- [ ] Secret 在 etcd 中静态加密（使用 etcdctl 或 KMS 验证）
- [ ] Sealed Secrets 控制器运行，公共证书已获取
- [ ] External Secrets Operator 从云密钥管理器同步
- [ ] TLS 证书由 cert-manager 颁发并自动续期
- [ ] 通过 Reloader 实现密钥轮换自动化和应用重启
- [ ] RBAC 策略对密钥强制执行最小权限访问
- [ ] Git 仓库或容器镜像中无明文密钥
- [ ] sealed-secrets 私钥的备份/恢复程序已测试
- [ ] 配置了密钥同步失败和到期的监控警报

## 常见问题

- **Git 历史中的密钥**：提交明文密钥后再删除不会清除 Git 历史。使用 git-filter-repo 或 BFG 重写历史，轮换被泄露的密钥。

- **RBAC 权限过宽**：授予命名空间中所有密钥的 `get secrets` 权限。使用 resourceNames 将访问限制为特定密钥。

- **无轮换策略**：密钥从不轮换，增加了泄露的爆炸半径。使用 External Secrets Operator 或 CronJob 实现自动轮换。

- **缺少静态加密**：Secret 在 etcd 中以明文存储。在存储敏感数据前启用加密提供商或 KMS 集成。

- **应用缓存密钥**：应用在启动时读取一次密钥，之后不重新加载。实现信号处理（SIGHUP）或密钥文件变更的文件监视器。

- **External Secrets 刷新太慢**：默认 1 小时刷新意味着密钥变更需要长达一小时才能传播。对关键密钥降低 refreshInterval，使用 webhook 实现即时更新。

- **无 sealed-secrets 密钥备份**：控制器私钥丢失后，所有密封密钥将无法恢复。使用 `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` 备份并安全存储。

- **证书续期失败**：cert-manager 因 DNS/防火墙变更无法续期。使用 Prometheus 指标和警报监控证书到期。

## 相关技能

- `deploy-to-kubernetes` - 在 Deployment 和 StatefulSet 中使用密钥
- `enforce-policy-as-code` - 密钥访问验证的 OPA 策略
- `security-audit-codebase` - 检测应用代码中的硬编码密钥
- `configure-ingress-networking` - Ingress 资源中的 TLS 证书使用
- `implement-gitops-workflow` - ArgoCD/Flux 流水线中的 SealedSecrets
