---
name: enforce-policy-as-code
locale: wenyan-lite
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

# 以碼執策

以 OPA Gatekeeper 或 Kyverno 行宣告式之策略執行，以驗證並變更 Kubernetes 資源。

## 適用時機

- 執組織於資源配置之標準（標籤、註解、限額）
- 防安全誤配（特權容器、主機命名空間、不安之鏡像）
- 確資源部署前合規
- 統一資源命名規範與元數據
- 藉變更策略實現自動修正
- 審既有叢集資源而不阻
- 納策略驗證於 CI/CD 管線以行左移之法

## 輸入

- **必要**：具管理員存取之 Kubernetes 叢集
- **必要**：策略引擎之選（OPA Gatekeeper 或 Kyverno）
- **必要**：待執之策略清單（安全、合規、運營）
- **選擇性**：待審之既有資源
- **選擇性**：特定命名空間或資源之豁免/排除模式
- **選擇性**：部署前驗證之 CI/CD 管線配置

## 步驟

> 見 [擴展範例](references/EXAMPLES.md) 查完整配置文件與模板。


### 步驟一：安裝策略引擎

以 OPA Gatekeeper 或 Kyverno 為准入控制器部署。

**OPA Gatekeeper 之法：**
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

**Kyverno 之法：**
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

建命名空間之排除：
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

**預期：** 策略引擎之 pod 以多副本運行。CRD 已裝（Gatekeeper 之 ConstraintTemplate、Constraint；Kyverno 之 ClusterPolicy、Policy）。驗證/變更之 webhook 活。審計控制器行。

**失敗時：**
- 查 pod 日誌：`kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- 驗 webhook 端點可達：`kubectl get endpoints -n gatekeeper-system`
- 查 webhook 日誌中之埠衝突或憑證問題
- 確叢集有足資源（策略引擎每副本需約 500MB）
- 審 RBAC 權限：`kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### 步驟二：定約束模板與策略

建可復用之策略模板與特定之約束。

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

施策略：
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

**預期：** ConstraintTemplates/ClusterPolicies 建成。Constraints 示狀態為 "True" 以行執行。策略定義無誤。Webhook 始依策略評新資源。

**失敗時：**
- 驗 Rego 語法（Gatekeeper）：本地用 `opa test` 或查 constraint 狀態
- 查策略 YAML 語法：`kubectl apply --dry-run=client -f policy.yaml`
- 審 constraint 狀態：`kubectl get constraint -o yaml | grep -A 10 status`
- 先試簡單策略，再加複雜
- 驗 match 條件（kinds、namespaces）之正確

### 步驟三：測策略執行

驗策略阻不合規之資源並容合規者。

造測試清單：
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

測策略：
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

以策略報告測（Kyverno）：
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**預期：** 不合規之資源被拒，帶明違規訊。合規者建成。策略報告示 pass/fail。Dry-run 驗證可行而不建資源。

**失敗時：**
- 查策略是否處審計而非執行模式：`validationFailureAction: audit`
- 驗 webhook 處請求：`kubectl logs -n gatekeeper-system -l app=gatekeeper`
- 檢可能豁免測試命名空間之排除
- 測 webhook 連通：`kubectl run test --rm -it --image=busybox --restart=Never`
- 審 webhook 失敗策略（Ignore vs Fail）

### 步驟四：實作變更策略

藉變更配置自動修正。

**Gatekeeper 變更：**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 變更策略：**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

施並測變更：
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 變更自動加標籤、資源或改鏡像。已部署之資源示變後之值。變更見於策略引擎日誌。施變更時無誤。

**失敗時：**
- 查變更 webhook 已啟：`kubectl get mutatingwebhookconfiguration`
- 驗變更策略語法：尤 JSON 路徑與條件
- 審日誌：`kubectl logs -n kyverno deploy/kyverno-admission-controller`
- 測變更無衝突（同欄多變更）
- 確變更先於驗證（序之要）

### 步驟五：啟審計模式與報告

配審計以識既有資源中之違規而不阻。

**Gatekeeper 審計：**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 審計與報告：**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

建策略合規儀表板：
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 審計識既有資源中之違規而不阻部署。策略報告帶 pass/fail 計。違規可導出以供審。指標外顯以供監測。違規增則告警。

**失敗時：**
- 驗審計控制器行：`kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 查安裝中之審計間隔
- 審日誌查錯：`kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 確 RBAC 權限容審計讀所有資源類型
- 驗 CRD 狀態欄填：`kubectl get constraint -o yaml | grep -A 20 status`

### 步驟六：整合 CI/CD 管線

加部署前策略驗證以行左移之執策。

**CI/CD 整合腳本：**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**GitHub Actions 工作流：**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Pre-commit 鉤：**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** CI/CD 管線於部署前驗清單。策略違規使管線敗且帶明訊。策略報告附於 PR。Pre-commit 鉤早捕違規。違規及達叢集前通知開發者。

**失敗時：**
- 驗 CLI 工具已裝且在 PATH
- 查 kubeconfig 憑證可取策略
- 先本地測策略驗證：`kyverno apply policy.yaml --resource manifest.yaml`
- 確自叢集同步之策略完整
- 審策略 CLI 日誌查特定驗證錯

## 驗證

- [ ] 策略引擎 pod 以 HA 配置行
- [ ] 驗證與變更 webhook 活且可達
- [ ] 約束模板與策略建成無誤
- [ ] 不合規之資源被拒並帶明違規訊
- [ ] 合規之資源部署成
- [ ] 變更策略自動修正資源
- [ ] 審計模式識既有資源中之違規
- [ ] 策略報告生並可讀
- [ ] 指標外顯以供策略合規監測
- [ ] CI/CD 管線於部署前驗清單
- [ ] Pre-commit 鉤防策略違規
- [ ] 命名空間排除配置得當

## 常見陷阱

- **Webhook 失敗策略**：`failurePolicy: Fail` 於 webhook 不可得時阻所有資源。非關鍵策略用 `Ignore`，但知其安全含義。執前測 webhook 可得性。

- **初始策略過嚴**：以嚴格策略直入執行模式將壞既有工作負載。先以審計模式始，審違規，與團隊溝通，再漸執之。

- **缺資源規範**：策略須正確指 API group、version、kind。用 `kubectl api-resources` 查確切值。通配（`*`）方便但可致效能問題。

- **變更之序**：變更先於驗證。確變更無衝突且驗證顧及已變之值。合測變更與驗證。

- **命名空間排除**：排除系統命名空間必要，但勿過排。策略成熟時定期審排除。

- **Rego 複雜（Gatekeeper）**：複雜之 Rego 策略難除錯。自簡始，本地以 `opa test` 測，以 `trace()` 加日誌，用 gator 行離線測。

- **效能影響**：策略評估加准入延遲。保策略高效，用合適之匹配條件，監 webhook 延遲指標。

- **策略衝突**：多策略改同欄致問題。跨團隊協調策略，用策略庫為常見模式，測組合。

- **後臺掃描**：後臺審計掃整叢集。於大叢集可耗資源。依叢集規模與策略數調審計間隔。

- **版本相容**：策略 CRD 版本變。Gatekeeper v3 用 `v1beta1` constraint，Kyverno v1.11 用 `kyverno.io/v1`。查爾版本之文件。

## 相關技能

- `manage-kubernetes-secrets` - 密秘驗證策略
- `security-audit-codebase` - 互補之安全掃描
- `deploy-to-kubernetes` - 帶策略驗證之應用部署
- `setup-service-mesh` - 服務網格授權策略輔准入策略
- `configure-api-gateway` - 網關策略與准入策略並行
- `implement-gitops-workflow` - 帶管線策略驗證之 GitOps
