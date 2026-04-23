---
name: define-slo-sli-sla
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Establish Service Level Objectives (SLO), Service Level Indicators (SLI), and Service Level
  Agreements (SLA) with error budget tracking, burn rate alerts, and automated reporting using
  Prometheus and tools like Sloth or Pyrra. Use when defining reliability targets for
  customer-facing services, balancing feature velocity against system reliability through error
  budgets, migrating from arbitrary uptime goals to data-driven metrics, or implementing Site
  Reliability Engineering practices.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: slo, sli, sla, error-budget, burn-rate
---

# Define SLO/SLI/SLA

Measurable reliability targets → SLIs track → err budget manage.

## Use When

- Reliability targets → customer-facing svc/API
- Clear expect → provider ↔ consumer
- Feature velocity ↔ reliability via err budget
- Objective criteria → incident severity
- Arbitrary uptime → data-driven metrics
- SRE impl
- Svc quality → measure + improve

## In

- **Required**: Svc desc + critical user journeys
- **Required**: Historical metrics (req rates, latencies, err rates)
- **Optional**: Existing SLA commitments
- **Optional**: Business reqs → availability/perf
- **Optional**: Incident history + customer impact

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

### Step 1: SLI/SLO/SLA hierarchy

Relationship + diffs.

**Definitions**:

```markdown
SLI (Service Level Indicator)
- **What**: A quantitative measure of service behavior
- **Example**: Request success rate, request latency, system throughput
- **Measurement**: `successful_requests / total_requests * 100`

SLO (Service Level Objective)
- **What**: Target value or range for an SLI over a time window
- **Example**: 99.9% of requests succeed in 30-day window
- **Purpose**: Internal reliability target to guide operations

SLA (Service Level Agreement)
- **What**: Contractual commitment with consequences for missing SLO
- **Example**: 99.9% uptime SLA with refunds if breached
- **Purpose**: External promise to customers with penalties
```

**Hierarchy**:
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

Key: SLO stricter than SLA → buffer before customer impact.

Ex:
- **SLA**: 99.9% (promise)
- **SLO**: 99.95% (internal)
- **Buffer**: 0.05%

→ Team understands, SLI metrics agreed, SLO targets aligned.

If err:
- Read Google SRE book SLI/SLO/SLA chapters
- Stakeholder workshop → align defs
- Start w/ success-rate SLI before latency SLOs

### Step 2: Select SLIs

Reflect user experience + business impact.

**Four Golden Signals** (Google SRE):

1. **Latency**: Req serve time
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **Traffic**: Demand
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **Errors**: Failed req rate
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **Saturation**: How full
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**Common SLI patterns**:

```yaml
# Availability SLI
availability:
  description: "Percentage of successful requests"
  query: |
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  good_threshold: 0.999  # 99.9%

# Latency SLI
latency:
  description: "P99 request latency under 500ms"
  query: |
    histogram_quantile(0.99,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
    ) < 0.5
  good_threshold: 0.95  # 95% of windows meet target

# Throughput SLI
throughput:
  description: "Requests processed per second"
  query: |
    sum(rate(http_requests_total[5m]))
  good_threshold: 1000  # Minimum 1000 req/s

# Data freshness SLI (for batch jobs)
freshness:
  description: "Data updated within last hour"
  query: |
    (time() - max(data_last_updated_timestamp)) < 3600
  good_threshold: 1  # Always fresh
```

SLI criteria:
- User-visible → reflects experience
- Measurable → from existing metrics
- Actionable → team fixes via eng work
- Meaningful → correlates w/ customer satisfaction
- Simple → easy explain

Avoid:
- Internal sys metrics (CPU, mem) not user-visible
- Vanity metrics → no customer impact
- Complex composite scores

→ 2-4 SLIs/svc, availability+latency min, team agrees on queries.

If err:
- Map user journey → critical fail points
- Incident history → which metrics predicted impact?
- A/B test → degrade metric, measure complaints
- Start simple, iterate

### Step 3: SLO targets + time windows

Realistic + achievable.

**SLO spec format**:

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**Time window**:
- 30d → external SLAs
- 7d → eng teams feedback
- 1d → high-freq svc

30d window err budget ex:
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**Realistic targets**:

1. Baseline perf:
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. Cost of nines:
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. Balance:
   - Too strict → expensive, slow features
   - Too loose → bad UX, churn
   - Sweet spot → slightly > user expectations

→ SLOs set w/ buy-in, rationale docs, err budget calc.

If err:
- Start achievable (99% if 98.5% now)
- Iterate quarterly
- Exec sponsorship vs "five nines" demands
- Doc cost-benefit/nine

### Step 4: SLO monitoring w/ Sloth

Sloth → Prometheus rules + alerts from SLO specs.

**Install Sloth**:

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**Sloth SLO spec** (`slos/user-api.yml`):

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**Generate rules**:

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**Recording rules** (excerpt):

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**Alerts**:

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**Load rules**:

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

Reload:
```bash
curl -X POST http://localhost:9090/-/reload
```

→ Multi-window multi-burn alerts, rules eval OK, alerts fire on incidents.

If err:
- `yamllint slos/user-api.yml`
- Sloth ver ≥ v0.11
- Verify `curl http://localhost:9090/api/v1/rules`
- Synth err injection → trigger alerts
- Check Sloth docs → SLI event query format

### Step 5: Err budget dashboards

Grafana → SLO compliance + budget consumption.

**Grafana JSON** (excerpt):

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

Key metrics:
- SLO target vs SLI
- Budget remaining (% + abs)
- Burn rate
- Historical SLI (30d rolling)
- Time to exhaustion

**Err budget policy** (md panel):

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

→ Real-time compliance, budget depletion visible, informed velocity decisions.

If err:
- Verify rules: `curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- Prometheus datasource URL correct
- Query in Explore view before dashboard
- Time range → 30d for monthly SLOs

### Step 6: Err budget policy

Org process → budget mgmt.

**Policy template**:

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**Automate enforcement**:

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

CI/CD:

```yaml
# .github/workflows/deploy.yml
jobs:
  check-error-budget:
    runs-on: ubuntu-latest
    steps:
      - name: Check SLO Error Budget
        run: |
          python scripts/check_error_budget.py user-api
      - name: Deploy
        if: success()
        run: |
          kubectl apply -f deploy/
```

→ Policy docs, auto gates block risky deploys on budget depletion, team aligned.

If err:
- Start manual (Slack reminders)
- Automate w/ soft gates (warns)
- Exec buy-in before hard gates (block deploys)
- Quarterly review

## Check

- [ ] SLIs → user exp + business impact
- [ ] SLO targets → stakeholder agree + rationale docs
- [ ] Prometheus rules → SLI metrics OK
- [ ] Multi-burn alerts → tested w/ synth errs
- [ ] Grafana → real-time SLO + budget
- [ ] Err budget policy docs + communicated
- [ ] Auto gates → block risky deploys
- [ ] Weekly/monthly SLO reviews scheduled
- [ ] Incident retros → SLO impact analysis
- [ ] SLO reports → stakeholders

## Traps

- **Too strict SLOs**: "Five nines" w/o cost analysis → burnout + slow velocity. Start achievable, iterate up.
- **Too many SLIs**: 10+ → confusion. Focus 2-4 user-facing.
- **No SLA buffer**: SLO = SLA → no margin. Keep 0.05-0.1%.
- **Ignore err budget**: Track SLOs w/o action → defeats purpose. Enforce policy.
- **Vanity metrics**: Internal (CPU, mem) vs user-visible (latency, errs) → misaligned priorities.
- **No buy-in**: Eng-only SLOs → conflicts w/ product/biz. Get exec sponsorship.
- **Static SLOs**: Never review → stale. Revisit quarterly.

## →

- `setup-prometheus-monitoring` — metrics collection for SLI calc
- `configure-alerting-rules` — burn rate alerts → Alertmanager
- `build-grafana-dashboards` — viz SLO compliance + budget
- `write-incident-runbook` — SLO impact in runbooks
