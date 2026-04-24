---
name: enforce-policy-as-code
locale: wenyan-ultra
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

用 OPA Gatekeeper 或 Kyverno 行宣告式策，驗與變 Kubernetes 資源。

## 用

- 行資源組態之組規（標、注、限）
- 防安全誤設（特權容器、主名、不安映像）
- 資源布前確合規
- 規範命名與元
- 經變策自癒
- 審舊資源合策否而不阻
- 入 CI/CD 為左移策驗

## 入

- **必**：管權之 Kubernetes 群
- **必**：擇策引（OPA Gatekeeper 或 Kyverno）
- **必**：所行策列（安、規、營）
- **可**：待審之舊資源
- **可**：特名或資源之豁免模
- **可**：CI/CD 管線設（布前驗）

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 備全設與模。

### 一：裝策引

布 OPA Gatekeeper 或 Kyverno 為入控器。

**OPA Gatekeeper：**
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

**Kyverno：**
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

設名空排除：
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

得：策引艙多副運。CRD 已裝（Gatekeeper 之 ConstraintTemplate、Constraint；Kyverno 之 ClusterPolicy、Policy）。驗/變鈎活。審控運。

敗：
- 察艙日：`kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- 驗鈎端可達：`kubectl get endpoints -n gatekeeper-system`
- 察港衝或證於鈎日
- 確群有足資源（策引每副需約 500MB）
- 閱 RBAC：`kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### 二：定約模與策

造可複策模與特定約。

**OPA Gatekeeper 約模：**
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

得：ConstraintTemplates/ClusterPolicies 建成。約態顯「True」執行。策無誤。鈎始評新資源。

敗：
- 驗 Rego 語法（Gatekeeper）：用 `opa test` 於本機或察約態
- 察策 YAML 語法：`kubectl apply --dry-run=client -f policy.yaml`
- 閱約態：`kubectl get constraint -o yaml | grep -A 10 status`
- 先試簡策，後加複
- 驗匹準（kinds、namespaces）正

### 三：試策行

驗策阻非合而許合者。

造試單：
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

試策報（Kyverno）：
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

得：非合者拒而示明違信。合者建成。策報示過/敗。乾跑驗不建資源。

敗：
- 察策在審態非行：`validationFailureAction: audit`
- 驗鈎處請求：`kubectl logs -n gatekeeper-system -l app=gatekeeper`
- 察名空排除或豁免試名
- 試鈎連：`kubectl run test --rm -it --image=busybox --restart=Never`
- 閱鈎敗策（Ignore 對 Fail）

### 四：行變策

經變自動修復。

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

施而試變：
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

得：變自動加標、源或改映像。布後資源顯變值。策引日記變。變無誤。

敗：
- 察變鈎已啟：`kubectl get mutatingwebhookconfiguration`
- 驗變策語法：尤 JSON 徑與條件
- 閱日：`kubectl logs -n kyverno deploy/kyverno-admission-controller`
- 試變勿衝（同欄多變）
- 確變於驗前行（序要）

### 五：啟審態與報

設審識舊資源之違而不阻。

**Gatekeeper 審：**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 審與報：**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

造策合規儀表：
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

得：審識舊資源違而不阻布。策報生過/敗計。違可出以閱。監計已露。違增時警。

敗：
- 驗審控運：`kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 察審週設於裝時
- 閱審日：`kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 確 RBAC 許讀諸類以審
- 驗 CRD 態欄已填：`kubectl get constraint -o yaml | grep -A 20 status`

### 六：入 CI/CD 管

布前加策驗以左移行策。

**CI/CD 入本：**
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

**Pre-commit 鈎：**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

得：CI/CD 管於布前驗單。策違敗管線並示明信。策報附於 PR。Pre-commit 鈎早捕違。發者於入群前聞策議。

敗：
- 驗 CLI 已裝並在 PATH
- 察 kubeconfig 憑於取策有效
- 先於本機試策驗：`kyverno apply policy.yaml --resource manifest.yaml`
- 確自群同步之策完整
- 閱策 CLI 日以特定驗誤

## 驗

- [ ] 策引艙以 HA 設運
- [ ] 驗與變鈎活且可達
- [ ] 約模與策建而無誤
- [ ] 非合者拒並示明違信
- [ ] 合者布成
- [ ] 變策自動修資源
- [ ] 審態識舊資源之違
- [ ] 策報生且可取
- [ ] 監計露以察策合規
- [ ] CI/CD 管於布前驗單
- [ ] Pre-commit 鈎阻策違
- [ ] 名空排除適設

## 忌

- **鈎敗策**：`failurePolicy: Fail` 於鈎無時阻諸資源。非要策用 `Ignore`，然知安全之虞。行前試鈎可用否
- **初策過嚴**：以行態始於嚴策→破舊工作。先審態，閱違，告隊，後漸行
- **缺資源規**：策須正定 API 組、版、類。用 `kubectl api-resources` 尋確值。通配符（`*`）便但損性能
- **變序**：變於驗前施。確變勿衝且驗慮變值。並試變與驗
- **名空排除**：排系名必要，然勿過排。策熟後常閱排除
- **Rego 複（Gatekeeper）**：複 Rego 策難調。自簡始，於本機以 `opa test` 試，以 `trace()` 記，用 gator 離線試
- **性能影響**：策評加入時延。策宜高效，匹準宜確，監鈎時延計
- **策衝**：多策改同欄致議。跨隊協策，用策庫共模，試組合
- **背景掃**：背景審掃全群。大群資源密。依群大與策數調審週
- **版容**：策 CRD 版變。Gatekeeper v3 用 `v1beta1` 約，Kyverno v1.11 用 `kyverno.io/v1`。察文以定版

## 參

- `manage-kubernetes-secrets` - 密驗策
- `security-audit-codebase` - 互補之安掃
- `deploy-to-kubernetes` - 含策驗之應用布
- `setup-service-mesh` - 服務網授權策補入策
- `configure-api-gateway` - 關策與入策並行
- `implement-gitops-workflow` - 含策驗於管之 GitOps
