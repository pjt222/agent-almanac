---
name: enforce-policy-as-code
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement policy-as-code enforcement using OPA Gatekeeper or Kyverno to validate and mutate
  Kubernetes resources according to organizational policies. Covers constraint templates,
  admission control, audit mode, reporting violations, and integrating with CI/CD pipelines
  for shift-left policy validation. Use when enforcing resource configuration standards,
  preventing security misconfigurations such as privileged containers, ensuring compliance
  before deployment, standardizing naming conventions, or auditing existing cluster resources
  against policies.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: opa, gatekeeper, kyverno, policy, admission-control, compliance, kubernetes
---

# 以碼行策

以 OPA Gatekeeper 或 Kyverno 行宣言式之策，驗並變 Kubernetes 諸資源。

## 用時

- 立資源配置之組織準則（標籤、注釋、限制）
- 防安全誤配（特權容、宿名空、不安之像）
- 部署前確合規之求
- 正資源命名與元數
- 以變之策自動補救
- 察既存資源於不阻時
- 於 CI/CD 前置策驗，以左移之道

## 入

- **必要**：有管權之 Kubernetes 集
- **必要**：擇策引（OPA Gatekeeper 或 Kyverno）
- **必要**：欲行之策（安全、合規、運行）
- **可選**：欲察之既存資源
- **可選**：特定名空或資源之豁免/排除
- **可選**：部署前驗之 CI/CD 流

## 法

> 詳見 [Extended Examples](references/EXAMPLES.md) 全配置與模板。


### 第一步：裝策引

部署 OPA Gatekeeper 或 Kyverno 為准入控。

**若為 OPA Gatekeeper：**
```bash
# Install Gatekeeper using Helm
helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts
helm repo update

# Install with audit enabled
helm install gatekeeper gatekeeper/gatekeeper \
  --namespace gatekeeper-system \
  --create-namespace \
  --set audit.replicas=2 \
  --set replicas=3 \
  --set validatingWebhookFailurePolicy=Fail \
  --set auditInterval=60

# Verify installation
kubectl get pods -n gatekeeper-system
kubectl get crd | grep gatekeeper

# Check webhook configuration
kubectl get validatingwebhookconfigurations gatekeeper-validating-webhook-configuration -o yaml
```

**若為 Kyverno：**
```bash
# Install Kyverno using Helm
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update

# Install with HA setup
helm install kyverno kyverno/kyverno \
  --namespace kyverno \
  --create-namespace \
  --set replicaCount=3 \
  --set admissionController.replicas=3 \
  --set backgroundController.replicas=2 \
  --set cleanupController.replicas=2

# Verify installation
kubectl get pods -n kyverno
kubectl get crd | grep kyverno

# Check webhook configurations
kubectl get validatingwebhookconfigurations kyverno-resource-validating-webhook-cfg
kubectl get mutatingwebhookconfigurations kyverno-resource-mutating-webhook-cfg
```

立名空排除：
```yaml
# gatekeeper-config.yaml
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  match:
    - excludedNamespaces:
      - kube-system
      - kube-public
      - kube-node-lease
      - gatekeeper-system
      processes:
      - audit
      - webhook
  validation:
    traces:
      - user: system:serviceaccount:gatekeeper-system:gatekeeper-admin
        kind:
          group: ""
          version: v1
          kind: Namespace
```

**得：** 策引之 pod 以數副本運。CRD 已裝（Gatekeeper 之 ConstraintTemplate、Constraint；Kyverno 之 ClusterPolicy、Policy）。驗/變 webhook 活。察控運。

**敗則：**
- 察 pod 日誌：`kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- 驗 webhook 端點可達：`kubectl get endpoints -n gatekeeper-system`
- 察端口衝突或證書問題於 webhook 日誌
- 確集資源足（策引每副本約需 500MB）
- 審 RBAC 權：`kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### 第二步：定約束模板與策

造可復用之策模板與具體約束。

**OPA Gatekeeper 約束模板：**
```yaml
# required-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno ClusterPolicy：**
```yaml
# kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

施策：
```bash
# Apply Gatekeeper templates and constraints
kubectl apply -f required-labels-template.yaml

# Apply Kyverno policies
kubectl apply -f kyverno-policies.yaml

# Verify constraint/policy status
kubectl get constraints
kubectl get clusterpolicies

# Check for any policy errors
kubectl describe k8srequiredlabels require-app-labels
kubectl describe clusterpolicy require-labels
```

**得：** ConstraintTemplate/ClusterPolicy 成功立。約束狀態「True」表行。策定無誤。webhook 始對新資源按策評之。

**敗則：**
- 驗 Rego 語法（Gatekeeper）：本地 `opa test` 或察約束狀態
- 察策 YAML 語法：`kubectl apply --dry-run=client -f policy.yaml`
- 審約束狀態：`kubectl get constraint -o yaml | grep -A 10 status`
- 先試簡策，再加繁
- 驗匹配之準（kinds、namespaces）正確

### 第三步：試策之行

驗策阻不合者而容合者。

造試之清單：
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

試策：
```bash
# Attempt to create non-compliant resource (should fail)
kubectl apply -f test-non-compliant.yaml
# Expected: Error with policy violation message

# Create compliant resource (should succeed)
kubectl apply -f test-compliant.yaml
# Expected: deployment.apps/test-compliant created

# Test with dry-run for validation
kubectl apply -f test-non-compliant.yaml --dry-run=server
# Shows policy violations without actually creating resource

# Clean up
kubectl delete -f test-compliant.yaml
```

以策報試（Kyverno）：
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**得：** 不合之資源被拒，附明違訊。合者成立。策報示過/敗。dry-run 驗無立資源。

**敗則：**
- 察策或在察模而非行模：`validationFailureAction: audit`
- 驗 webhook 處請：`kubectl logs -n gatekeeper-system -l app=gatekeeper`
- 察名空排除或豁試名空
- 試 webhook 之通：`kubectl run test --rm -it --image=busybox --restart=Never`
- 審 webhook 敗策（Ignore 或 Fail）

### 第四步：行變之策

以變自動補救。

**Gatekeeper 變：**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 變策：**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

施並試變：
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 變自動加標、資源、或改像。部之資源示變值。變記於策引日誌。施變無誤。

**敗則：**
- 察變 webhook 啟：`kubectl get mutatingwebhookconfiguration`
- 驗變策語法：尤其 JSON 路徑與條件
- 審日誌：`kubectl logs -n kyverno deploy/kyverno-admission-controller`
- 試變不衝（同域多變）
- 確變先於驗（序為要）

### 第五步：啟察模與報

設察以識既存資源之違而不阻。

**Gatekeeper 察：**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 察與報：**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

立策合規之面板：
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 察識既存違而不阻部署。策報生附過/敗數。違可出供審。指數出供監。違增時警發。

**敗則：**
- 驗察控運：`kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 察裝之察隔
- 審察日誌：`kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 確 RBAC 允讀諸資源類供察
- 驗 CRD 狀態域被填：`kubectl get constraint -o yaml | grep -A 20 status`

### 第六步：接 CI/CD 流

加部署前策驗以左移策之行。

**CI/CD 接本：**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**GitHub Actions 流：**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Pre-commit hook：**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**得：** CI/CD 流部署前驗清單。違使流敗附明訊。策報附於 PR。pre-commit hook 早捕違。發者於至集前知策問。

**敗則：**
- 驗 CLI 裝於 PATH
- 察 kubeconfig 憑證有效取策
- 先於本地試策驗：`kyverno apply policy.yaml --resource manifest.yaml`
- 確自集同步之策全
- 審策 CLI 日誌具體驗誤

## 驗

- [ ] 策引 pod 以 HA 配運
- [ ] 驗與變 webhook 活可達
- [ ] 約束模板與策立無誤
- [ ] 不合之資源被拒附明訊
- [ ] 合之資源成部
- [ ] 變策自動補救資源
- [ ] 察模識既存資源之違
- [ ] 策報生而可取
- [ ] 指數出供策合規之監
- [ ] CI/CD 流部前驗清單
- [ ] pre-commit hook 防策違
- [ ] 名空排除設宜

## 陷

- **Webhook 敗策**：`failurePolicy: Fail` 於 webhook 不可用時阻所有資源。非關鍵之策用 `Ignore`，然明其安全之涉。行前先試 webhook 可用

- **初策過嚴**：初即以嚴策行模壞既有工。先以察模，審違，通隊，漸行

- **缺資源規**：策須正定 API 組、版、類。以 `kubectl api-resources` 求確值。萬用（`*`）便而能致性能問題

- **變之序**：變先於驗。確變不衝，驗計變值。同試變與驗

- **名空排除**：排系名空必須，然勿過排。策成熟後常審排除

- **Rego 之繁（Gatekeeper）**：繁 Rego 策難查。始簡，本地以 `opa test` 試，以 `trace()` 加日誌，以 gator 離線試

- **性能之影**：策評加入准之延。策宜效，用宜匹之準，監 webhook 延之指

- **策之衝**：多策改同域致問。諸隊協策，以策庫用常模，試組合

- **背景掃**：背景察掃全集。大集中可耗資源。察隔宜合集大與策數

- **版容**：策 CRD 版易。Gatekeeper v3 用 `v1beta1` 約束，Kyverno v1.11 用 `kyverno.io/v1`。察汝版之文

## 參

- `manage-kubernetes-secrets` - 秘之驗策
- `security-audit-codebase` - 互補之安全掃
- `deploy-to-kubernetes` - 附策驗之應用部
- `setup-service-mesh` - 服網授策補准策
- `configure-api-gateway` - 關策並行於准策
- `implement-gitops-workflow` - GitOps 於流中附策驗
