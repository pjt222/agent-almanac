---
name: write-incident-runbook
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Create structured incident runbooks with diagnostic steps, resolution procedures, escalation
  paths, and communication templates for effective incident response. Use when documenting
  response procedures for recurring alerts, standardizing incident response across an on-call
  rotation, reducing MTTR with clear diagnostic steps, creating training materials for new
  team members, or linking alert annotations directly to resolution procedures.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: runbook, incident-response, diagnostics, escalation, documentation
---

# Write Incident Runbook

Actionable runbooks → guide responders through incident diagnosis + resolution.

## Use When

- Doc response procedures for recurring alerts|incidents
- Standardize response across on-call rotation
- Reduce MTTR via clear diagnostic steps
- Training for new team on incident handling
- Establish escalation paths + comm protocols
- Migrate tribal knowledge → written
- Link alerts → resolution (alert annotations)

## In

- **Required**: Incident|alert name|desc
- **Required**: Historical incident data + resolution patterns
- **Optional**: Diagnostic queries (Prometheus, logs, traces)
- **Optional**: Escalation contacts + comm channels
- **Optional**: Prev incident post-mortems

## Do

### Step 1: Choose Template

> See [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples) for complete template files.

Select per incident type + complexity.

**Basic runbook template structure**:
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**Advanced SRE template** (excerpt):
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

Key components:
- **Metadata**: Service ownership, severity, on-call rotation
- **Diagnostic Phase**: Quick checks → detailed → failure patterns
- **Resolution**: Immediate mitigation → root cause fix → verify
- **Escalation**: Criteria + contact paths
- **Comm**: Internal|external templates
- **Prevention**: Short|long-term actions

**Got:** Template selected matches incident complexity, sections appropriate for service type.

**If err:**
- Start basic, iterate per incident patterns
- Review industry examples (Google SRE books, vendor runbooks)
- Adapt per team feedback after first use

### Step 2: Diagnostic Procedures

> See [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures) for complete diagnostic queries and decision trees.

Step-by-step investigation w/ specific queries.

**6-step checklist**:

1. **Verify Service Health**: Health endpoint + uptime metrics
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **Check Error Rate**: Current % + breakdown by endpoint
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **Analyze Logs**: Recent errs + top err msgs from Loki
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **Resource Util**: CPU, memory, conn pool status
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **Recent Changes**: Deployments, git commits, infra changes

6. **Dependencies**: Downstream service health, DB|API latency

**Failure pattern decision tree** (excerpt):
- Service down? → Check all pods|instances
- Error rate elevated? → Check specific err types (5xx, gateway, DB, timeouts)
- When started? → After deployment (rollback), gradual (resource leak), sudden (traffic|dep)

**Got:** Diagnostic procedures specific, expected vs actual vals, guides responder.

**If err:**
- Test queries in actual monitoring before doc
- Screenshots of dashboards for visual ref
- "Common mistakes" section for missed steps
- Iterate per responder feedback

### Step 3: Resolution Procedures

> See [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures) for all 5 resolution options with full commands and rollback procedures.

Step-by-step remediation w/ rollback.

**5 resolution options** (brief):

1. **Rollback Deployment** (fastest): For post-deployment errs
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   Verify → Monitor → Confirm (err rate < 1%, latency normal, no alerts)

2. **Scale Up**: High CPU|memory, conn pool exhaustion
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **Restart Service**: Memory leaks, stuck conns, cache corruption
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **Feature Flag | Circuit Breaker**: Specific feature errs|external dep failures
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **DB Remediation**: Conns, slow queries, pool exhaustion
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**Universal verify checklist**:
- [ ] Err rate < 1%
- [ ] Latency P99 < threshold
- [ ] Throughput at baseline
- [ ] Resource healthy (CPU < 70%, Memory < 80%)
- [ ] Deps healthy
- [ ] User-facing tests pass
- [ ] No active alerts

**Rollback**: Resolution worsens → pause|cancel → revert → reassess

**Got:** Resolution clear, verify checks, rollback options per action.

**If err:**
- Granular steps for complex
- Screenshots|diagrams for multi-step
- Doc cmd outs (expected vs actual)
- Separate runbook for complex resolution

### Step 4: Escalation Paths

> See [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines) for full escalation levels and contact directory template.

When + how to escalate.

**Escalate immediately**:
- Customer-facing outage > 15 min
- SLO err budget > 10% depleted
- Data loss|corruption|security breach suspected
- Can't ID root cause in 20 min
- Mitigation fails|worsens

**5 escalation levels**:
1. **Primary On-Call** (5 min response): Deploy fixes, rollback, scale (up to 30 min solo)
2. **Secondary On-Call** (auto after 15 min): Investigation support
3. **Team Lead** (architectural): DB changes, vendor escalation, > 1 hour
4. **Incident Commander** (cross-team): Multi teams, customer comms, > 2 hours
5. **Executive** (C-level): Major impact (>50% users), SLA breach, media|PR, > 4 hours

**Process**:
1. Notify target: status, impact, actions taken, help needed, dashboard link
2. Handoff: timeline, actions, access, remain available
3. No silence: update every 15 min, ask questions, feedback

**Contact directory**: Table w/ role, Slack, phone, PagerDuty for:
- Platform|DB|Security|Network teams
- Incident Commander
- External vendors (AWS, DB vendor, CDN provider)

**Got:** Clear escalation criteria, contact info accessible, paths align w/ org.

**If err:**
- Validate contact current (test quarterly)
- Decision tree for when to escalate
- Examples of escalation msgs
- Doc response time per level

### Step 5: Comm Templates

> See [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates) for all internal and external templates with full formatting.

Pre-written msgs for incident updates.

**Internal** (Slack #incident-response):

1. **Initial Declaration**:
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **Progress Update** (every 15-30 min):
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **Mitigation Complete**:
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **Resolution**:
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **False Alarm**: No impact, no follow-up

**External** (status page):
- **Initial**: Investigating, started time, next update in 15 min
- **Progress**: ID'd cause (customer-friendly), implementing fix, est resolution
- **Resolution**: Resolved time, root cause (simple), duration, prevention

**Customer email template**: Timeline, impact, resolution, prevention, compensation (if applicable)

**Got:** Templates save time, consistent comm, reduce cognitive load on responders.

**If err:**
- Customize to company comm style
- Pre-fill w/ common incident types
- Slack workflow|bot to populate auto
- Review during retrospectives

### Step 6: Link Runbook → Monitoring

> See [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples) for complete Prometheus alert configuration and Grafana dashboard JSON.

Integrate w/ alerts + dashboards.

**Add runbook links to Prometheus alerts**:
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**Embed quick diagnostic links in runbook**:
- Service Overview Dashboard
- Error Rate Last 1h (Prometheus direct link)
- Recent Error Logs (Loki|Grafana Explore)
- Recent Deployments (GitHub|CI)
- PagerDuty Incidents

**Grafana dashboard panel** w/ runbook links (md panel listing all incident runbooks w/ on-call + escalation)

**Got:** Responders access runbooks direct from alerts|dashboards, diagnostic queries pre-filled, one-click access.

**If err:**
- Verify URLs accessible w/o VPN|login
- URL shorteners for complex Grafana|Prometheus
- Test links quarterly → no break
- Browser bookmarks for frequent

## Check

- [ ] Runbook follows consistent template
- [ ] Diagnostic procedures w/ specific queries + expected vals
- [ ] Resolution actionable w/ clear cmds
- [ ] Escalation criteria + contacts current
- [ ] Comm templates for internal + external
- [ ] Linked from monitoring alerts + dashboards
- [ ] Tested during incident sim or actual
- [ ] Responder feedback incorporated
- [ ] Revision history tracked w/ dates + authors
- [ ] Accessible w/o auth (or cached offline)

## Traps

- **Too generic**: Vague "check the logs" w/o specific queries → not actionable. Specific.
- **Outdated**: Refs old systems|cmds → useless. Quarterly review.
- **No verify**: Resolution w/o verify → false positives. "How to confirm fixed."
- **Missing rollback**: Every action → rollback plan. Don't trap responders worse state.
- **Assume knowledge**: Expert-only → excludes juniors. Write for least experienced on rotation.
- **No ownership**: No owners → stale. Assign team|person responsible.
- **Hidden behind auth**: Inaccessible during VPN|SSO issues → useless during crisis. Cache copies or public wiki.

## →

- `configure-alerting-rules` — Link runbooks to alert annotations for immediate access
- `build-grafana-dashboards` — Embed runbook links in dashboards + diagnostic panels
- `setup-prometheus-monitoring` — Diagnostic queries from Prometheus in runbook procedures
- `define-slo-sli-sla` — Reference SLO impact in incident severity classification
