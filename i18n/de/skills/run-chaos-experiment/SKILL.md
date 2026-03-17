---
name: run-chaos-experiment
description: >
  Entwerfen and execute chaos engineering experiments using Litmus or Chaos Mesh.
  Testen system resilience durch controlled fault injection, validate
  hypothesis-driven tests, and improve failure recovery. Verwenden vor major
  product launches, nach architecture changes to validate resilience, waehrend
  GameDays or disaster recovery drills, to validate assumptions about failure
  modes, or as part of an SRE maturity program.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: advanced
  language: multi
  tags: chaos-engineering, litmus, chaos-mesh, resilience, fault-injection
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Chaos-Experiment durchfuehren

Inject controlled failures to test and improve system resilience.

## Wann verwenden

- Before major product launches (load testing)
- After architecture changes (validate resilience)
- During GameDays or disaster recovery drills
- To validate assumptions about failure modes
- As part of SRE maturity program

## Eingaben

- **Erforderlich**: Kubernetes cluster (for Litmus or Chaos Mesh)
- **Erforderlich**: Steady-state definition (what "normal" looks like)
- **Erforderlich**: Hypothesis to test (e.g., "API stays available if one pod crashes")
- **Optional**: Observability stack (Prometheus, Grafana) to measure impact
- **Optional**: Rollback plan

## Vorgehensweise

### Schritt 1: Definieren Steady State and Hypothesis

Dokumentieren normal system behavior:

```markdown
## Steady State Definition

### Service: API Gateway
- **Availability**: 99.9% (< 0.1% error rate)
- **Latency**: p95 < 200ms
- **Throughput**: 1000 req/s
- **Dependencies**: Database (Postgres), Cache (Redis), Auth Service

### Metrics
- `rate(http_requests_total{job="api"}[5m])`
- `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- `rate(http_requests_total{status=~"5.."}[5m])`

## Hypothesis
**"If one API pod is killed, the remaining pods will handle the load with <5s
disruption and no increase in error rate."**

### Validation Criteria
- Error rate remains <1%
- p95 latency stays <300ms (50ms grace)
- Service recovers within 5 seconds
- No cascading failures to downstream services
```

**Erwartet:** Clear, measurable definition of normal behavior and success criteria.

**Bei Fehler:** If you can't define steady state, observability is insufficient. Hinzufuegen metrics first.

### Schritt 2: Set Blast Radius Limits

Scope the experiment to minimize risk:

```yaml
# chaos-config.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-testing

---
# Label pods participating in chaos experiments
apiVersion: v1
kind: Pod
metadata:
  labels:
    chaos-enabled: "true"
    environment: staging  # NEVER production for first run
```

Set safeguards:

```markdown
## Blast Radius Controls

### Environment
- **Scope**: Staging only (first 5 runs)
- **Production**: Only after 5 successful staging runs
- **Timing**: Business hours (09:00-17:00 local), never weekends/holidays

### Target Selection
- **Limit**: Max 1 pod per service
- **Percentage**: Max 25% of replicas
- **Exclusions**: Database, payment service, auth service (critical path)

### Auto-Abort Conditions
- Error rate >10% for >30 seconds
- Customer-facing alerts fire
- Manual abort signal from on-call engineer

### Rollback Plan
- Kubernetes will auto-restart killed pods
- Manual rollback: `kubectl rollout undo deployment/api`
- Incident declared if recovery takes >5 minutes
```

**Erwartet:** Experiment has clear boundaries, won't take down entire system.

**Bei Fehler:** If blast radius is too large, narrow scope. Starten with one non-critical service.

### Schritt 3: Installieren Chaos Mesh

Bereitstellen Chaos Mesh (Kubernetes-native):

```bash
# Add Chaos Mesh Helm repo
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update

# Install Chaos Mesh in isolated namespace
helm install chaos-mesh chaos-mesh/chaos-mesh \
  --namespace chaos-mesh \
  --create-namespace \
  --set dashboard.create=true \
  --set controllerManager.replicaCount=1

# Verify installation
kubectl get pods -n chaos-mesh

# Access dashboard
kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333
# Open http://localhost:2333
```

Alternative: Litmus (vendor-neutral):

```bash
# Install Litmus
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.14.0.yaml

# Wait for Litmus pods
kubectl get pods -n litmus

# Install Litmus CRDs
kubectl apply -f https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/experiments.yaml
```

**Erwartet:** Chaos Mesh or Litmus running, dashboard accessible.

**Bei Fehler:** Check RBAC Berechtigungs. Chaos tools need cluster-wide access.

### Schritt 4: Erstellen and Ausfuehren Experiment

Example: Pod Kill Experiment (Chaos Mesh):

```yaml
# pod-kill-experiment.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-test
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: one  # Kill one pod only
  selector:
    namespaces:
      - production
    labelSelectors:
      app: api-gateway
      chaos-enabled: "true"
  duration: "30s"
  scheduler:
    cron: "@every 5m"  # Repeat every 5 minutes (for sustained testing)
```

Anwenden the experiment:

```bash
# Apply experiment
kubectl apply -f pod-kill-experiment.yaml

# Watch experiment status
kubectl get podchaos -n chaos-testing -w

# View detailed status
kubectl describe podchaos api-pod-kill-test -n chaos-testing

# Check which pods were affected
kubectl get events -n production --sort-by=.metadata.creationTimestamp | grep api-gateway
```

Ueberwachen impact in Grafana:

```promql
# Error rate during experiment
rate(http_requests_total{status=~"5..", job="api"}[1m])

# Latency spike
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api"}[1m]))

# Pod restarts
rate(kube_pod_container_status_restarts_total{pod=~"api-.*"}[5m])
```

**Erwartet:** Pod is killed, Kubernetes restarts it, service continues with minor blip.

**Bei Fehler:** If error rate spikes or service degrades erheblich, abort experiment and investigate.

### Schritt 5: Analysieren Results and Iterate

Erstellen experiment report:

```markdown
# Chaos Experiment Report: API Pod Kill

**Date**: 2025-02-09
**Hypothesis**: API stays available if one pod crashes
**Tool**: Chaos Mesh
**Environment**: Staging
**Duration**: 30 seconds (pod kill + recovery)

## Results

### Metrics During Experiment
- **Error Rate**: Increased from 0.1% to 2.3% (spike lasted 8 seconds)
- **p95 Latency**: Increased from 180ms to 450ms (spike lasted 12 seconds)
- **Recovery Time**: 8 seconds (pod restart + load balancer update)

### Hypothesis Outcome
**FAILED**: Error rate exceeded 1% threshold, latency spike >300ms

## Root Cause Analysis
- Load balancer continued routing to killed pod for 8 seconds (stale endpoint)
- Readiness probe set to 10s interval (too slow)
- No pre-stop hook to drain connections gracefully

## Improvements Made
1. **Reduced readiness probe interval**: 10s → 2s
2. **Added pre-stop hook**: 5-second sleep for connection draining
3. **Tuned load balancer**: Enabled faster endpoint updates

## Follow-Up Experiment
- Re-run with same parameters in 1 week
- Expected: Error rate <1%, recovery <5s
```

Verfolgen experiments in a log:

```bash
# chaos-experiment-log.csv
date,experiment,environment,status,error_rate_peak,recovery_time_s,outcome
2025-02-09,pod-kill-api,staging,complete,2.3%,8,failed
2025-02-16,pod-kill-api,staging,complete,0.8%,4,passed
2025-02-23,network-delay-db,staging,aborted,15%,N/A,failed
```

**Erwartet:** Learnings captured, fixes implemented, follow-up scheduled.

**Bei Fehler:** If no action is taken post-experiment, chaos engineering becomes theater. Priorisieren fixes.

### Schritt 6: Graduate to Production (Carefully)

Once staging experiments pass consistently:

```yaml
# Production pod-kill experiment (more conservative)
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-prod
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - production
    labelSelectors:
      app: api-gateway
      chaos-enabled: "true"
  duration: "10s"  # Shorter than staging
  scheduler:
    cron: "0 10 * * 2"  # Tuesdays at 10 AM only (predictable, low-risk time)
```

Production safeguards:

```bash
# Create a kill switch for production chaos
kubectl create configmap chaos-killswitch \
  -n chaos-testing \
  --from-literal=enabled=true

# Update experiments to check kill switch
# (implementation depends on chaos tool)
```

**Erwartet:** Production experiments run waehrend low-risk windows, with kill switch ready.

**Bei Fehler:** If production experiment causes incident, disable sofort and post-mortem.

## Validierung

- [ ] Steady state and hypothesis clearly defined
- [ ] Blast radius limited (environment, scope, timing)
- [ ] Chaos tool (Chaos Mesh or Litmus) installed and tested
- [ ] Experiment runs erfolgreich in staging
- [ ] Results documented with metrics and analysis
- [ ] Improvements implemented basierend auf findings
- [ ] Follow-up experiment validates fixes
- [ ] Production experiments run only nach 5+ staging successes

## Haeufige Stolperfallen

- **No hypothesis**: Running chaos "to see what happens" wastes time. Always have a hypothesis.
- **Too broad scope**: Killing all pods at once tests disaster recovery, not resilience. Starten small.
- **Production-first**: Never run first experiment in production. Staging first, always.
- **Ignoring results**: Chaos ohne action is theater. Beheben what you learn.
- **Alarmieren fatigue**: Chaos experiments trigger alerts. Annotate Grafana or silence expected alerts.
- **No abort plan**: If experiment goes wrong, you need a kill switch. Have it ready.

## Verwandte Skills

- `setup-prometheus-monitoring` - metrics to measure experiment impact
- `configure-alerting-rules` - alerts that fire waehrend chaos (expected)
- `define-slo-sli-sla` - steady state tied to SLOs
