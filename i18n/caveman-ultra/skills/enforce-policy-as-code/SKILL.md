---
name: enforce-policy-as-code
locale: caveman-ultra
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

# Enforce Policy as Code

Declarative policy enforce → OPA Gatekeeper or Kyverno. K8s resource validate + mutate.

## Use When

- Enforce org standards (labels, annotations, limits)
- Prevent security misconfig (privileged containers, host namespaces, insecure images)
- Compliance before deploy
- Standardize naming + metadata
- Auto remediate via mutation
- Audit existing resources no block
- CI/CD shift-left

## In

- **Required**: K8s cluster w/ admin
- **Required**: Engine choice (OPA Gatekeeper or Kyverno)
- **Required**: Policy list (security, compliance, ops)
- **Optional**: Existing resources to audit
- **Optional**: Exemption patterns (namespaces/resources)
- **Optional**: CI/CD config for pre-deploy validate

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Install Engine

Deploy OPA Gatekeeper or Kyverno as admission controller.

**OPA Gatekeeper:**
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

**Kyverno:**
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

NS exclusions:
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

→ Engine pods HA. CRDs installed (ConstraintTemplate, Constraint / ClusterPolicy, Policy). Webhooks active. Audit running.

If err:
- Pod logs: `kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- Endpoints: `kubectl get endpoints -n gatekeeper-system`
- Port/cert issues in webhook logs
- Resources sufficient (~500MB/replica)
- RBAC: `kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### Step 2: Define Templates + Policies

Reusable templates + constraints.

**OPA Gatekeeper Template:**
```yaml
# required-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno ClusterPolicy:**
```yaml
# kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

Apply:
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

→ Templates/Policies created. Status "True" enforce. No err. Webhook evals new resources.

If err:
- Rego syntax (Gatekeeper): `opa test` locally or check status
- YAML: `kubectl apply --dry-run=client -f policy.yaml`
- Status: `kubectl get constraint -o yaml | grep -A 10 status`
- Simple first, add complexity
- Match criteria correct (kinds, namespaces)

### Step 3: Test Enforcement

Validate block non-compliant, allow compliant.

Test manifests:
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

Test:
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

Policy reporting (Kyverno):
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

→ Non-compliant rejected w/ clear msg. Compliant created. Reports show pass/fail. Dry-run works.

If err:
- Audit mode not enforce: `validationFailureAction: audit`
- Webhook processing: `kubectl logs -n gatekeeper-system -l app=gatekeeper`
- NS exclusions exempting test ns
- Webhook connectivity: `kubectl run test --rm -it --image=busybox --restart=Never`
- Failure policy (Ignore vs Fail)

### Step 4: Mutation Policies

Auto remediate via mutation.

**Gatekeeper:**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno:**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

Apply + test:
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

→ Mutations auto add labels/resources/modify images. Mutated values visible. Logged. No err.

If err:
- Mutation webhook enabled: `kubectl get mutatingwebhookconfiguration`
- Syntax: JSON paths + conditions
- Logs: `kubectl logs -n kyverno deploy/kyverno-admission-controller`
- No conflicts (multiple mutations same field)
- Mutation before validation (order matters)

### Step 5: Audit + Reporting

Audit identifies violations no block.

**Gatekeeper audit:**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno audit + reporting:**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

Dashboard:
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

→ Audit finds violations no block. Reports generated pass/fail. Exportable. Metrics. Alerts.

If err:
- Audit controller: `kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- Audit interval setting
- Audit logs: `kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- RBAC read all resource types
- CRD status populated: `kubectl get constraint -o yaml | grep -A 20 status`

### Step 6: CI/CD Integration

Pre-deploy validation → shift-left.

**CI/CD script:**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**GitHub Actions:**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Pre-commit:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

→ Pipeline validates pre-deploy. Violations fail w/ clear msg. Reports on PR. Pre-commit catches early. Devs notified pre-cluster.

If err:
- CLI tools in PATH
- kubeconfig creds valid
- Test locally: `kyverno apply policy.yaml --resource manifest.yaml`
- Policies synced complete
- Policy CLI logs for specific errs

## Check

- [ ] Engine pods HA
- [ ] Webhooks active + reachable
- [ ] Templates + policies created no err
- [ ] Non-compliant rejected clear msg
- [ ] Compliant deploy OK
- [ ] Mutations auto remediate
- [ ] Audit finds violations existing
- [ ] Reports generated + accessible
- [ ] Metrics exposed
- [ ] CI/CD validates pre-deploy
- [ ] Pre-commit prevents
- [ ] NS exclusions appropriate

## Traps

- **Webhook Failure Policy**: `failurePolicy: Fail` blocks all if webhook down. `Ignore` non-critical, understand security. Test availability before enforce.
- **Too Strict Initial**: Strict enforce breaks workloads. Audit first, review, communicate, enforce gradual.
- **Missing Resource Specs**: Must specify API groups/versions/kinds. `kubectl api-resources`. Wildcards (`*`) convenient but slow.
- **Mutation Order**: Mutation before validation. No conflicts. Test together.
- **NS Exclusions**: Exclude system ns necessary but not over-exclude. Review regularly.
- **Rego Complexity (Gatekeeper)**: Complex Rego hard debug. Simple first, `opa test` locally, `trace()` logging, gator offline.
- **Perf Impact**: Policy eval adds latency. Efficient policies, right match criteria, monitor webhook latency.
- **Policy Conflicts**: Multiple policies same field → issues. Coordinate teams, policy libs, test combos.
- **Bg Scanning**: Full cluster scan expensive large clusters. Adjust interval.
- **Version Compat**: CRD versions change. Gatekeeper v3 → `v1beta1`, Kyverno v1.11 → `kyverno.io/v1`. Check docs.

## →

- `manage-kubernetes-secrets` - Secret validation policies
- `security-audit-codebase` - Complementary security scanning
- `deploy-to-kubernetes` - App deployment w/ policy validate
- `setup-service-mesh` - Mesh authz policies complement admission
- `configure-api-gateway` - Gateway policies alongside admission
- `implement-gitops-workflow` - GitOps w/ policy validate in pipeline
