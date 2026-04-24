---
name: enforce-policy-as-code
locale: caveman
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

Set declarative policy enforcement with OPA Gatekeeper or Kyverno for Kubernetes resource check and mutate.

## When Use

- Enforce org rules for resource config (labels, annotations, limits)
- Block security mis-configs (privileged containers, host namespaces, bad images)
- Ensure compliance rules met before resource deploy
- Standard resource name and meta
- Auto-fix through mutation policy
- Audit existing cluster resources vs policy with no block
- Wire policy check into CI/CD for shift-left

## Inputs

- **Required**: Kubernetes cluster with admin access
- **Required**: Pick policy engine (OPA Gatekeeper or Kyverno)
- **Required**: List of policies to enforce (security, compliance, ops)
- **Optional**: Existing resources to audit
- **Optional**: Exempt patterns for specific namespaces or resources
- **Optional**: CI/CD config for pre-deploy check

## Steps

> See [Extended Examples](references/EXAMPLES.md) for full config files and templates.


### Step 1: Install Policy Engine

Deploy OPA Gatekeeper or Kyverno as admission controller.

**For OPA Gatekeeper:**
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

**For Kyverno:**
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

Make namespace excludes:
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

**Got:** Policy engine pods running with many replicas. CRDs in (ConstraintTemplate, Constraint for Gatekeeper; ClusterPolicy, Policy for Kyverno). Validating/mutating webhooks on. Audit controller running.

**If fail:**
- Check pod logs: `kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- Check webhook endpoints reach: `kubectl get endpoints -n gatekeeper-system`
- Look for port clash or cert issue in webhook logs
- Cluster needs enough resources (policy engines need ~500MB per replica)
- Review RBAC: `kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### Step 2: Define Constraint Templates and Policies

Make reusable policy templates and specific constraints.

**OPA Gatekeeper Constraint Template:**
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

Apply policies:
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

**Got:** ConstraintTemplates/ClusterPolicies made OK. Constraints show status "True" for enforce. No errors in policy definitions. Webhook start checking new resources vs policies.

**If fail:**
- Check Rego syntax (Gatekeeper): use `opa test` local or check constraint status
- Check policy YAML: `kubectl apply --dry-run=client -f policy.yaml`
- Review constraint status: `kubectl get constraint -o yaml | grep -A 10 status`
- Test with simple policy first, add more later
- Check match rules (kinds, namespaces) right

### Step 3: Test Policy Enforcement

Check policies block bad resources and allow good ones.

Make test manifests:
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

Test policies:
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

Test with policy reporting (Kyverno):
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**Got:** Bad resources blocked with clear violation msg. Good resources made OK. Policy reports show pass/fail. Dry-run check works no resource made.

**If fail:**
- Check if policy in audit mode vs enforce: `validationFailureAction: audit`
- Check webhook handling req: `kubectl logs -n gatekeeper-system -l app=gatekeeper`
- Look for namespace excludes that exempt test namespace
- Test webhook reach: `kubectl run test --rm -it --image=busybox --restart=Never`
- Review webhook failure policy (Ignore vs Fail)

### Step 4: Implement Mutation Policies

Set auto-fix through mutation.

**Gatekeeper mutation:**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno mutation policies:**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

Apply and test mutations:
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Mutations auto add labels, resources, or change images. Deployed resources show mutated values. Mutations logged in policy engine logs. No errors during mutation.

**If fail:**
- Check mutation webhook on: `kubectl get mutatingwebhookconfiguration`
- Check mutation policy syntax: JSON paths and conditions
- Review logs: `kubectl logs -n kyverno deploy/kyverno-admission-controller`
- Test mutations not clash (many mutations on same field)
- Make mutation happen before validation (order matters)

### Step 5: Enable Audit Mode and Reporting

Set audit to spot violations in existing resources with no block.

**Gatekeeper audit:**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno audit and reporting:**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

Make dashboard for policy compliance:
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Audit spot violations in existing resources with no block on deploy. Policy reports made with pass/fail counts. Violations export for review. Metrics out for watch. Alerts fire on rising violations.

**If fail:**
- Check audit controller running: `kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- Check audit interval in install
- Review audit logs for errors: `kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- RBAC perms must let read all resource types for audit
- Check CRD status field filling: `kubectl get constraint -o yaml | grep -A 20 status`

### Step 6: Integrate with CI/CD Pipeline

Add pre-deploy policy check for shift-left enforce.

**CI/CD integration script:**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**GitHub Actions workflow:**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Pre-commit hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** CI/CD pipeline check manifests before deploy. Policy violations fail pipeline with clear msg. Policy reports pinned to PR. Pre-commit hooks catch violations early. Devs know policy issues before cluster.

**If fail:**
- Check CLI tools in PATH
- Check kubeconfig creds good for fetching policies
- Test policy check local first: `kyverno apply policy.yaml --resource manifest.yaml`
- Policies synced from cluster must be full
- Review policy CLI logs for specific check errors

## Validation

- [ ] Policy engine pods running with HA config
- [ ] Validating and mutating webhooks on and reachable
- [ ] Constraint templates and policies made with no errors
- [ ] Bad resources blocked with clear violation msg
- [ ] Good resources deploy OK
- [ ] Mutation policies auto fix resources
- [ ] Audit mode spots violations in existing resources
- [ ] Policy reports made and open
- [ ] Metrics out for policy compliance watch
- [ ] CI/CD pipeline checks manifests pre-deploy
- [ ] Pre-commit hooks stop policy violations
- [ ] Namespace excludes set right

## Pitfalls

- **Webhook Failure Policy**: `failurePolicy: Fail` blocks all resources if webhook down. Use `Ignore` for low-risk policies, but know security impact. Test webhook up before enforce.

- **Too Strict Initial Policies**: Start with enforce mode on strict policies break existing workloads. Begin with audit mode, review violations, talk with teams, then enforce step by step.

- **Missing Resource Specs**: Policies must set API groups, versions, kinds right. Use `kubectl api-resources` to find exact values. Wildcards (`*`) easy but can cause speed issues.

- **Mutation Order**: Mutations run before validations. Make mutations not clash and validations know mutated values. Test mutation+validation together.

- **Namespace Excludes**: Exempt system namespaces needed, but watch not over-exempt. Review excludes often as policies grow.

- **Rego Complex (Gatekeeper)**: Complex Rego policies hard to debug. Start simple, test with `opa test` local, add logging with `trace()`, use gator for offline tests.

- **Speed Hit**: Policy check adds lag to admission. Keep policies tight, use right match rules, watch webhook lag metrics.

- **Policy Clash**: Many policies changing same field cause issues. Team up policies across teams, use policy libs for common patterns, test mixes.

- **Background Scan**: Background audit scans full cluster. Can be heavy on big clusters. Tune audit interval by cluster size and policy count.

- **Version Compat**: Policy CRD versions change. Gatekeeper v3 uses `v1beta1` constraints, Kyverno v1.11 uses `kyverno.io/v1`. Check docs for your version.

## See Also

- `manage-kubernetes-secrets` - Secret check policies
- `security-audit-codebase` - Complement security scan
- `deploy-to-kubernetes` - App deploy with policy check
- `setup-service-mesh` - Service mesh authz policies complement admission policies
- `configure-api-gateway` - Gateway policies work with admission policies
- `implement-gitops-workflow` - GitOps with policy check in pipeline
