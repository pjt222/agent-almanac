---
name: enforce-policy-as-code
description: >
  使用 OPA Gatekeeper 或 Kyverno 实现策略即代码执行，根据组织策略
  验证和变更 Kubernetes 资源。涵盖约束模板、准入控制、审计模式、
  报告违规，以及与 CI/CD 流水线集成实现左移策略验证。适用于强制执行
  资源配置标准、防止特权容器等安全配置错误、在部署前确保合规、
  标准化命名规范，或审计现有集群资源是否符合策略的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: opa, gatekeeper, kyverno, policy, admission-control, compliance, kubernetes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 强制执行策略即代码

使用 OPA Gatekeeper 或 Kyverno 实现 Kubernetes 资源验证和变更的声明式策略执行。

## 适用场景

- 强制执行资源配置的组织标准（标签、注解、限制）
- 防止安全配置错误（特权容器、主机命名空间、不安全镜像）
- 在部署资源前确保满足合规要求
- 标准化资源命名规范和元数据
- 通过变更策略实现自动修复
- 在不阻止部署的情况下审计现有集群资源是否符合策略
- 将策略验证集成到 CI/CD 流水线实现左移方法

## 输入

- **必填**：具有管理员权限的 Kubernetes 集群
- **必填**：策略引擎选择（OPA Gatekeeper 或 Kyverno）
- **必填**：需要执行的策略列表（安全、合规、运营）
- **可选**：需要审计的现有资源
- **可选**：特定命名空间或资源的豁免/排除模式
- **可选**：预部署验证的 CI/CD 流水线配置

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：安装策略引擎

将 OPA Gatekeeper 或 Kyverno 部署为准入控制器。

**OPA Gatekeeper 方案：**
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

**Kyverno 方案：**
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

创建命名空间排除配置：
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

**预期结果：** 策略引擎 pod 以多个副本运行。CRD 已安装（Gatekeeper 的 ConstraintTemplate、Constraint；Kyverno 的 ClusterPolicy、Policy）。验证/变更 Webhook 处于活动状态。审计控制器运行中。

**失败处理：**
- 检查 pod 日志：`kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- 验证 Webhook 端点可达：`kubectl get endpoints -n gatekeeper-system`
- 检查 Webhook 日志中的端口冲突或证书问题
- 确保集群有足够资源（策略引擎每副本约需 500MB）
- 检查 RBAC 权限：`kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### 第 2 步：定义约束模板和策略

创建可复用的策略模板和特定约束。

**OPA Gatekeeper 约束模板：**
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

应用策略：
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

**预期结果：** ConstraintTemplate/ClusterPolicy 成功创建。约束显示状态为 "True" 表示执行中。策略定义无错误。Webhook 开始根据策略评估新资源。

**失败处理：**
- 验证 Rego 语法（Gatekeeper）：使用 `opa test` 在本地测试或检查约束状态
- 检查策略 YAML 语法：`kubectl apply --dry-run=client -f policy.yaml`
- 检查约束状态：`kubectl get constraint -o yaml | grep -A 10 status`
- 先使用简单策略测试，再增加复杂度
- 验证匹配条件（kinds、namespaces）是否正确

### 第 3 步：测试策略执行

验证策略能阻止不合规资源并允许合规资源。

创建测试清单：
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

测试策略：
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

使用策略报告测试（Kyverno）：
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**预期结果：** 不合规资源以清晰的违规消息被拒绝。合规资源成功创建。策略报告显示通过/失败结果。干运行验证在不创建资源的情况下工作。

**失败处理：**
- 检查策略是否处于审计模式而非执行模式：`validationFailureAction: audit`
- 验证 Webhook 正在处理请求：`kubectl logs -n gatekeeper-system -l app=gatekeeper`
- 检查可能豁免测试命名空间的命名空间排除配置
- 测试 Webhook 连通性：`kubectl run test --rm -it --image=busybox --restart=Never`
- 检查 Webhook 失败策略（Ignore 与 Fail）

### 第 4 步：实现变更策略

通过变更配置自动修复。

**Gatekeeper 变更：**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 变更策略：**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

应用并测试变更：
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 变更自动添加标签、资源或修改镜像。已部署的资源显示变更后的值。变更记录在策略引擎日志中。应用变更时无错误。

**失败处理：**
- 检查变更 Webhook 是否启用：`kubectl get mutatingwebhookconfiguration`
- 验证变更策略语法：特别是 JSON 路径和条件
- 检查日志：`kubectl logs -n kyverno deploy/kyverno-admission-controller`
- 测试变更不冲突（同一字段的多个变更）
- 确保变更在验证之前应用（顺序很重要）

### 第 5 步：启用审计模式和报告

配置审计以识别现有资源中的违规，而不阻止部署。

**Gatekeeper 审计：**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno 审计和报告：**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

创建策略合规性仪表板：
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 审计识别现有资源中的违规而不阻止部署。生成带通过/失败计数的策略报告。违规可导出供审查。指标暴露用于监控。在违规增加时发送告警。

**失败处理：**
- 验证审计控制器是否运行：`kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 检查安装中的审计间隔设置
- 检查审计日志中的错误：`kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- 确保 RBAC 权限允许读取所有资源类型以进行审计
- 验证 CRD 状态字段是否被填充：`kubectl get constraint -o yaml | grep -A 20 status`

### 第 6 步：与 CI/CD 流水线集成

添加预部署策略验证，实现左移策略执行。

**CI/CD 集成脚本：**
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

**Pre-commit 钩子：**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** CI/CD 流水线在部署前验证清单。策略违规导致流水线失败并显示清晰消息。策略报告附加到 PR。Pre-commit 钩子尽早发现违规。开发者在到达集群之前收到策略问题通知。

**失败处理：**
- 验证 CLI 工具已安装并在 PATH 中
- 检查获取策略的 kubeconfig 凭证是否有效
- 先在本地测试策略验证：`kyverno apply policy.yaml --resource manifest.yaml`
- 确保从集群同步的策略是完整的
- 检查策略 CLI 日志获取具体验证错误

## 验证清单

- [ ] 策略引擎 pod 以高可用配置运行
- [ ] 验证和变更 Webhook 处于活动状态且可达
- [ ] 约束模板和策略创建无错误
- [ ] 不合规资源以清晰的违规消息被拒绝
- [ ] 合规资源成功部署
- [ ] 变更策略自动修复资源
- [ ] 审计模式识别现有资源中的违规
- [ ] 策略报告已生成且可访问
- [ ] 指标暴露用于策略合规性监控
- [ ] CI/CD 流水线在预部署时验证清单
- [ ] Pre-commit 钩子防止策略违规
- [ ] 命名空间排除配置适当

## 常见问题

- **Webhook 失败策略**：`failurePolicy: Fail` 在 Webhook 不可用时阻止所有资源。对非关键策略使用 `Ignore`，但要了解安全影响。在执行前测试 Webhook 可用性。

- **初始策略过于严格**：在严格策略上以执行模式开始会破坏现有工作负载。先使用审计模式，检查违规，与团队沟通，然后逐步执行。

- **缺少资源规格**：策略必须正确指定 API 组、版本和类型。使用 `kubectl api-resources` 查找确切值。通配符（`*`）方便但可能导致性能问题。

- **变更顺序**：变更在验证之前应用。确保变更不冲突，且验证考虑到变更后的值。一起测试变更+验证。

- **命名空间排除**：排除系统命名空间是必要的，但要注意不要过度排除。随着策略成熟，定期审查排除配置。

- **Rego 复杂度（Gatekeeper）**：复杂的 Rego 策略难以调试。从简单开始，用 `opa test` 在本地测试，用 `trace()` 添加日志，使用 gator 进行离线测试。

- **性能影响**：策略评估为准入增加延迟。保持策略高效，使用适当的匹配条件，监控 Webhook 延迟指标。

- **策略冲突**：修改同一字段的多个策略会产生问题。跨团队协调策略，使用策略库处理常见模式，测试组合。

- **后台扫描**：后台审计扫描整个集群。在大型集群中可能资源密集。根据集群大小和策略数量调整审计间隔。

- **版本兼容性**：策略 CRD 版本会变化。Gatekeeper v3 使用 `v1beta1` 约束，Kyverno v1.11 使用 `kyverno.io/v1`。查阅你的版本文档。

## 相关技能

- `manage-kubernetes-secrets` - 密钥验证策略
- `security-audit-codebase` - 互补的安全扫描
- `deploy-to-kubernetes` - 带策略验证的应用部署
- `setup-service-mesh` - 服务网格授权策略与准入策略互补
- `configure-api-gateway` - 网关策略与准入策略协同工作
- `implement-gitops-workflow` - 流水线中带策略验证的 GitOps
