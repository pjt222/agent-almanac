---
name: design-on-call-rotation
description: >
  Nachhaltige On-Call-Rotationen mit ausgewogenen Zeitplaenen, klaren Eskalationsrichtlinien,
  Erschoepfungsmanagement und Uebergabeverfahren entwerfen. Burnout minimieren und gleichzeitig
  Incident-Response-Abdeckung aufrechterhalten. Verwenden, wenn On-Call erstmals eingerichtet
  wird, ein Team von 2-3 auf 5+ Engineers skaliert, On-Call-Burnout oder Alert-Ueberlastung
  adressiert werden, Incident-Response-Zeiten verbessert werden oder nach einem Post-Mortem,
  das Uebergabeprobleme identifiziert hat.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: on-call, rotation, escalation, fatigue-management, handoff
---

# On-Call-Rotation entwerfen

Einen nachhaltigen On-Call-Zeitplan erstellen, der Abdeckung mit dem Wohlbefinden der Engineers ausbalanciert.

## Wann verwenden

- On-Call zum ersten Mal einrichten
- Team von 2-3 auf 5+ Engineers skalieren
- On-Call-Burnout oder Alert-Ueberlastung adressieren
- Incident-Response-Zeiten verbessern
- Nach einem Post-Mortem, das Uebergabeprobleme identifiziert hat

## Eingaben

- **Pflichtfeld**: Teamgroesse und Zeitzonen
- **Pflichtfeld**: Service-SLA-Anforderungen (Reaktionszeit, Abdeckungsstunden)
- **Optional**: Historisches Incident-Volumen und -Zeitpunkte
- **Optional**: Budget fuer On-Call-Verguetung
- **Optional**: Vorhandenes On-Call-Tool (PagerDuty, Opsgenie)

## Vorgehensweise

### Schritt 1: Rotationsplan definieren

Rotationslaenge basierend auf Teamgroesse auswaehlen:

```markdown
## Rotation Models

### Weekly Rotation (5+ person team)
- **Length**: 7 days (Monday 09:00 to Monday 09:00)
- **Pros**: Predictable, easy to plan around
- **Cons**: Whole week disrupted if alerts are frequent

### 12-Hour Split (3-4 person team)
- **Day shift**: 08:00-20:00 local time
- **Night shift**: 20:00-08:00 local time
- **Pros**: Shared burden, night coverage paid differently
- **Cons**: More handoffs, coordination needed

### Follow-the-Sun (Global team)
- **APAC**: 00:00-08:00 UTC
- **EMEA**: 08:00-16:00 UTC
- **Americas**: 16:00-00:00 UTC
- **Pros**: No night shifts, timezone-aligned
- **Cons**: Requires distributed team

### Two-Tier (Senior/Junior split)
- **Primary**: Junior engineers (first responder)
- **Secondary**: Senior engineers (escalation)
- **Pros**: Training opportunity, lighter senior load
- **Cons**: Risk of junior burnout
```

Beispielzeitplan fuer ein 5-koepfiges Team:

```
Week 1: Alice (Primary), Bob (Secondary)
Week 2: Charlie (Primary), Diana (Secondary)
Week 3: Eve (Primary), Alice (Secondary)
Week 4: Bob (Primary), Charlie (Secondary)
Week 5: Diana (Primary), Eve (Secondary)
```

**Erwartet:** Zeitplan, der fair rotiert und 24/7-Abdeckung bietet.

**Bei Fehler:** Wenn Abdeckungsluecken bestehen, mehr Engineers hinzufuegen oder SLA auf Geschaeftsstunden reduzieren.

### Schritt 2: Eskalationsrichtlinie konfigurieren

Gestufte Eskalation in PagerDuty/Opsgenie einrichten:

```yaml
# PagerDuty escalation policy (YAML representation)
escalation_policy:
  name: "Production Services"
  repeat_enabled: true
  num_loops: 3

  escalation_rules:
    - id: primary
      escalation_delay_in_minutes: 0
      targets:
        - type: schedule
          id: primary_on_call_schedule

    - id: secondary
      escalation_delay_in_minutes: 15
      targets:
        - type: schedule
          id: secondary_on_call_schedule

    - id: manager
      escalation_delay_in_minutes: 30
      targets:
        - type: user
          id: engineering_manager
```

Eskalationsflussdiagramm erstellen:

```
Alert Fires
    ↓
Primary On-Call Paged
    ↓
Wait 15 minutes (no ack)
    ↓
Secondary On-Call Paged
    ↓
Wait 15 minutes (no ack)
    ↓
Manager Paged
    ↓
Repeat cycle (max 3 times)
```

**Erwartet:** Klarer Eskalationspfad mit angemessenen Verzoegerungen.

**Bei Fehler:** Wenn Eskalationen zu oft ausloesen, Bestaettigungsfenster verkuerzen oder Alertqualitaet pruefen.

### Schritt 3: Uebergabeverfahren definieren

Eine strukturierte Uebergabe-Checkliste erstellen:

```markdown
## On-Call Handoff Checklist

### Outgoing On-Call
- [ ] Update incident log with any ongoing issues
- [ ] Document any workarounds or known issues
- [ ] Share any alerts that are "noisy but safe to ignore" temporarily
- [ ] Note any upcoming deploys or maintenance windows
- [ ] Provide context on any flapping alerts

### Incoming On-Call
- [ ] Review incident log from previous shift
- [ ] Check for any ongoing incidents
- [ ] Verify PagerDuty/Opsgenie has correct contact info
- [ ] Test alert delivery (send test page to yourself)
- [ ] Review recent deploys and release notes
- [ ] Check capacity metrics for any concerning trends

### Handoff Meeting (15 min)
- Review any incidents from past week
- Discuss any changes to systems or runbooks
- Questions and clarifications
```

Uebergabe-Erinnerungen automatisieren:

```bash
# Slack reminder script
curl -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#on-call",
    "text": "On-call handoff in 1 hour. Outgoing: @alice, Incoming: @bob. Please use the handoff checklist: https://wiki.company.com/oncall-handoff"
  }'
```

**Erwartet:** Reibungsloser Wissenstransfer, kein Informationsverlust zwischen Schichten.

**Bei Fehler:** Wenn Incidents sich wiederholen, weil der eingehende Engineer nichts von Workarounds wusste, Uebergabe verbindlich machen.

### Schritt 4: Erschoepfungsmanagement implementieren

Regeln zur Burnout-Praevention festlegen:

```markdown
## Fatigue Prevention Rules

### Alert Volume Limits
- **Threshold**: Max 5 pages per night (22:00-06:00)
- **Action**: If exceeded, trigger incident review next day
- **Goal**: Reduce noisy alerts that disrupt sleep

### Time Off After Major Incident
- **Rule**: If on-call handles P1 incident >2 hours overnight, they get comp time
- **Amount**: Equal to incident duration (e.g., 3-hour incident = 3 hours off)
- **Scheduling**: Must be taken within 2 weeks

### Maximum Consecutive Weeks
- **Limit**: No more than 2 consecutive weeks on-call
- **Reason**: Prevents exhaustion from extended coverage

### Minimum Rest Between Rotations
- **Cooldown**: At least 2 weeks between primary rotations
- **Exception**: Emergency coverage (requires manager approval)

### Vacation Protection
- **Rule**: No on-call during scheduled vacation
- **Process**: Mark as "Out of Office" in PagerDuty 2 weeks in advance
- **Swap**: Coordinate swap with team, update schedule
```

Alert-Erschoepfungsmetriken verfolgen:

```promql
# Alerts per on-call engineer per week
count(ALERTS{alertstate="firing"}) by (oncall_engineer)

# Nighttime pages (22:00-06:00 local)
count(ALERTS{alertstate="firing", hour_of_day>=22 or hour_of_day<6})

# Time to acknowledge (should be <5 min during business hours)
histogram_quantile(0.95, rate(alert_ack_duration_seconds_bucket[7d]))
```

**Erwartet:** On-Call-Last ist nachhaltig, Engineers sind nicht chronisch erschoepft.

**Bei Fehler:** Wenn Burnout trotz Regeln auftritt, Alert-Volumen reduzieren oder mehr Engineers einstellen.

### Schritt 5: Runbooks und Eskalationskontakte dokumentieren

Einen On-Call-Kurzreferenzleitfaden erstellen:

```markdown
# On-Call Quick Reference

## Emergency Contacts
- **Engineering Manager**: Alice Smith, +1-555-0100
- **CTO**: Bob Johnson, +1-555-0200
- **Security Team**: security@company.com, +1-555-0300
- **Cloud Provider Support**: AWS Support Case Portal

## Common Runbooks
- [Database Connection Pool Exhaustion](https://wiki/runbook-db-pool)
- [High API Latency](https://wiki/runbook-api-latency)
- [Disk Space Full](https://wiki/runbook-disk-full)
- [SSL Certificate Expiration](https://wiki/runbook-ssl-renewal)

## Access & Credentials
- **Production AWS**: SSO via company.okta.com
- **Kubernetes**: `kubectl --context production`
- **Database**: Read-only access via Bastion host
- **Secrets**: 1Password vault "On-Call Production"

## Escalation Decision Tree
- **P1 (Service Down)**: Immediate response, escalate to manager after 30min
- **P2 (Degraded)**: Response within 15min, escalate if not resolved in 1 hour
- **P3 (Warning)**: Acknowledge, resolve during business hours
- **Security Incident**: Immediately escalate to Security Team, don't investigate alone
```

**Erwartet:** On-Call-Engineer kann alle benoetigen Informationen in weniger als 2 Minuten finden.

**Bei Fehler:** Wenn Engineers wiederholt fragen "Wo ist X?", Dokumentation zentralisieren.

### Schritt 6: Regelmaessige On-Call-Retrospektiven planen

On-Call-Erfahrung monatlich ueberpruefen:

```markdown
## On-Call Retrospective Agenda (Monthly)

### Metrics Review (15 min)
- Total alerts: [X] (target: <50/week)
- Nighttime pages: [Y] (target: <5/week)
- Mean time to acknowledge: [Z] (target: <5 min)
- Incidents by severity: P1: [A], P2: [B], P3: [C]

### Qualitative Feedback (20 min)
- What was the most challenging incident?
- Which alerts were noisy/low-value?
- Were runbooks helpful? Which need updates?
- Any gaps in monitoring or alerting?

### Action Items (10 min)
- Fix noisy alerts identified
- Update runbooks that were incomplete
- Adjust rotation schedule if needed
- Plan alert tuning work

### Recognition (5 min)
- Shout-outs for excellent incident response
- Share learnings from interesting incidents
```

Verbesserungen ueber Zeit verfolgen:

```bash
# Generate monthly on-call report
cat > oncall_report_2025-02.md <<EOF
# On-Call Report: February 2025

## Key Metrics
- **Total Alerts**: 38 (down from 52 in January)
- **Nighttime Pages**: 4 (within target)
- **P1 Incidents**: 1 (database outage, 45min MTTR)
- **P2 Incidents**: 3 (all resolved <1 hour)

## Improvements Made
- Tuned CPU alert threshold (reduced false positives by 40%)
- Added runbook for Redis cache failures
- Implemented log rotation (prevented disk full alerts)

## Upcoming Changes
- Migrate to follow-the-sun rotation (Q2)
- Add Slack alert integration (in progress)
EOF
```

**Erwartet:** On-Call-Erfahrung verbessert sich von Monat zu Monat, Alert-Volumen nimmt ab.

**Bei Fehler:** Wenn Metriken sich nicht verbessern, an Fuehrungsebene eskalieren. Moeglicherweise muss Feature-Arbeit pausiert werden, um Betriebsprobleme zu beheben.

## Validierung

- [ ] Rotationsplan deckt alle erforderlichen Stunden ab (24/7 oder Geschaeftsstunden)
- [ ] Eskalationsrichtlinie getestet (Test-Alerts senden)
- [ ] Uebergabeverfahren dokumentiert und mit dem Team geteilt
- [ ] Erschoepfungsmanagement-Regeln kodifiziert
- [ ] On-Call-Referenzleitfaden vollstaendig und zugaenglich
- [ ] Monatliche Retrospektiven geplant
- [ ] On-Call-Verguetung genehmigt (falls zutreffend)

## Haeufige Stolperfallen

- **Zu wenige Engineers**: 3 oder weniger bedeutet On-Call alle 2-3 Wochen, nicht nachhaltig. Mindestens 5 fuer wochentliche Rotation.
- **Keine Eskalationsverzoegerungen**: Sofortige Manager-Eskalation verschwendet Senior-Zeit. Primaer 15 Minuten zum Reagieren geben.
- **Uebergaben ueberspringen**: Fehlender Kontexttransfer fuehrt zu wiederholten Fehlern. Uebergaben verbindlich machen.
- **Alert-Erschoepfung ignorieren**: Wenn Engineers Alerts wegen Rauschen ignorieren, werden kritische Probleme uebersehen. Aggressiv optimieren.
- **Keine Verguetung**: On-Call ohne Bezahlung oder Freizeitausgleich erzeugt Unmut. Dafuer budgetieren.

## Verwandte Skills

- `configure-alerting-rules` - Alert-Rauschen reduzieren, das Erschoepfung verursacht
- `write-incident-runbook` - Runbooks erstellen, die waehrend On-Call-Schichten referenziert werden
