---
name: conduct-post-mortem
description: >
  Eine schuldfreie Post-Mortem-Analyse nach einem Incident durchfuehren. Timeline-
  Rekonstruktion aufbauen, beitragende Faktoren identifizieren und handlungsorientierte
  Verbesserungen generieren. Auf systemische Probleme statt auf individuelle Schuld
  fokussieren. Verwenden, nach einem Produktionsincident oder einer Service-Degradierung,
  nach einem Beinaheunfall, bei der Untersuchung wiederkehrender Probleme oder um
  systemische Erkenntnisse teamuebergreifend zu teilen.
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
  tags: post-mortem, incident-review, blameless, timeline, action-items
---

# Post-Mortem durchfuehren

Ein schuldfreies Post-Mortem leiten, um aus Incidents zu lernen und die Systemresilienz zu verbessern.

## Wann verwenden

- Nach jedem Produktionsincident oder einer Service-Degradierung
- Nach einem Beinaheunfall oder knappem Ausweichen
- Bei der Untersuchung wiederkehrender Probleme
- Um Erkenntnisse teamuebergreifend zu teilen

## Eingaben

- **Pflichtfeld**: Incident-Details (Start-/Endzeit, betroffene Services, Schweregrad)
- **Pflichtfeld**: Zugriff auf Logs, Metriken und Alerts waehrend des Incident-Zeitfensters
- **Optional**: Waehrend der Incident-Reaktion verwendetes Runbook
- **Optional**: Kommunikationslogs (Slack, PagerDuty)

## Vorgehensweise

### Schritt 1: Rohdaten sammeln

Alle Artefakte aus dem Incident erfassen:

```bash
# Export relevant logs (adjust timerange)
kubectl logs deployment/api-service \
  --since-time="2025-02-09T10:00:00Z" \
  --until-time="2025-02-09T11:30:00Z" > incident-logs.txt

# Export Prometheus metrics snapshot
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=rate(http_requests_total{job="api"}[5m])' \
  --data-urlencode 'start=2025-02-09T10:00:00Z' \
  --data-urlencode 'end=2025-02-09T11:30:00Z' \
  --data-urlencode 'step=15s' > metrics.json

# Export alert history
amtool alert query --within=2h alertname="HighErrorRate" --output json > alerts.json
```

**Erwartet:** Logs, Metriken und Alerts, die die vollstaendige Incident-Timeline abdecken.

**Bei Fehler:** Wenn Daten unvollstaendig sind, Luecken im Bericht vermerken. Laengere Aufbewahrungsfrist fuer das naechste Mal einrichten.

### Schritt 2: Timeline aufbauen

Chronologische Rekonstruktion erstellen:

```markdown
## Timeline (all times UTC)

| Time     | Event | Source | Actor |
|----------|-------|--------|-------|
| 10:05:23 | First 5xx errors appear | nginx access logs | - |
| 10:06:45 | High error rate alert fires | Prometheus | - |
| 10:08:12 | On-call engineer paged | PagerDuty | System |
| 10:12:00 | Engineer acknowledges alert | PagerDuty | @alice |
| 10:15:30 | Database connection pool exhausted | app logs | - |
| 10:18:45 | Database queries identified as slow | pganalyze | @alice |
| 10:22:10 | Cache layer deployed as mitigation | kubectl | @alice |
| 10:35:00 | Error rate returns to normal | Prometheus | - |
| 10:40:00 | Incident marked resolved | PagerDuty | @alice |
```

**Erwartet:** Eine klare, minuetliche Abfolge, die zeigt, was wann geschah.

**Bei Fehler:** Zeitstempel-Unstimmigkeiten. Sicherstellen, dass alle Systeme NTP verwenden und in UTC protokollieren.

### Schritt 3: Beitragende Faktoren identifizieren

Die Fuenf Warums oder Fischgraeten-Analyse verwenden:

```markdown
## Contributing Factors

### Immediate Cause
- Database connection pool exhausted (max 20 connections)
- Query introduced in v2.3.0 deployment lacked index

### Contributing Factors
1. **Monitoring Gap**: Connection pool utilization not monitored
2. **Testing Gap**: Load testing didn't include new query pattern
3. **Runbook Gap**: No documented procedure for DB connection issues
4. **Capacity Planning**: Pool size unchanged despite 3x traffic growth

### Systemic Issues
- No pre-deployment query plan review
- Database alerts only fire on total failure, not degradation
```

**Erwartet:** Mehrere Kausalitaetsschichten identifiziert, ohne Schuld zuzuweisen.

**Bei Fehler:** Wenn die Analyse bei "Ein Mitarbeiter hat einen Fehler gemacht" stoppt, tiefer graben. Was hat diesen Fehler ermoeglicht?

### Schritt 4: Massnahmen generieren

Konkrete, nachverfolgbare Verbesserungen erstellen:

```markdown
## Action Items

| ID | Action | Owner | Deadline | Priority |
|----|--------|-------|----------|----------|
| AI-001 | Add connection pool metrics to Grafana | @bob | 2025-02-16 | High |
| AI-002 | Create runbook: DB connection saturation | @alice | 2025-02-20 | High |
| AI-003 | Add DB query plan check to CI/CD | @charlie | 2025-03-01 | Medium |
| AI-004 | Review and adjust connection pool size | @dan | 2025-02-14 | High |
| AI-005 | Implement DB slow query alerts (<100ms) | @bob | 2025-02-23 | Medium |
| AI-006 | Add load testing for new query patterns | @charlie | 2025-03-15 | Low |
```

**Erwartet:** Jede Massnahme hat einen Eigentuemer, eine Deadline und ein klares Ergebnis.

**Bei Fehler:** Vage Massnahmen wie "Tests verbessern" werden nicht erledigt. Konkret formulieren.

### Schritt 5: Bericht schreiben und verteilen

Diese Template-Struktur verwenden:

```markdown
# Post-Mortem: API Service Degradation (2025-02-09)

**Date**: 2025-02-09
**Duration**: 1h 35min (10:05 - 11:40 UTC)
**Severity**: P1 (Critical service degraded)
**Authors**: @alice, @bob
**Reviewed**: 2025-02-10

## Summary
The API service experienced elevated error rates (40% of requests) due to
database connection pool exhaustion. Service was restored by deploying a
cache layer. No data loss occurred.

## Impact
- 40,000 failed requests over 1.5 hours
- 2,000 customers affected
- Revenue impact: ~$5,000 (estimated)

## Root Cause
Query introduced in v2.3.0 deployment performed a full table scan due to
missing index. Under increased load, this saturated the connection pool.

[... timeline, contributing factors, action items as above ...]

## What Went Well
- Alert fired within 90 seconds of first errors
- Mitigation deployed quickly (10 minutes from page to fix)
- Communication to customers was clear and timely

## Lessons Learned
- Database monitoring is insufficient; need connection-level metrics
- Load testing must cover new query patterns, not just volume
- Connection pool sizing hasn't kept pace with traffic growth

## Prevention
See Action Items above.
```

**Erwartet:** Bericht wird innerhalb von 48 Stunden nach dem Incident an Team und Stakeholder verteilt.

**Bei Fehler:** Wenn Berichtsverzoegerungen 1 Woche ueberschreiten, werden Erkenntnisse altbacken. Post-Mortems priorisieren.

### Schritt 6: Massnahmen in Standup/Retrospektiven nachverfolgen

Fortschritt der Massnahmen verfolgen:

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**Erwartet:** Massnahmen werden in einem Projektmanagement-Tool verfolgt und woechentlich ueberprueft.

**Bei Fehler:** Wenn Massnahmen liegen bleiben, werden Incidents wiederkehren. Fuehrungssponsor fuer hochpriorisierte Punkte benennen.

## Validierung

- [ ] Timeline ist vollstaendig und chronologisch korrekt
- [ ] Mehrere beitragende Faktoren identifiziert (nicht nur einer)
- [ ] Massnahmen haben Eigentuemer, Deadlines und Prioritaeten
- [ ] Bericht verwendet schuldfreie Sprache (kein "X hat das Problem verursacht")
- [ ] Bericht innerhalb von 48 Stunden an alle Stakeholder verteilt
- [ ] Massnahmen in einem Ticketsystem verfolgt
- [ ] Nachfolgendes Review fuer 4 Wochen spaeter geplant

## Haeufige Stolperfallen

- **Schuldkultur**: "Wer"-Sprache statt "Was/Warum"-Sprache verwenden. Auf Systeme konzentrieren, nicht auf Menschen.
- **Oberflaechliche Analyse**: Bei der ersten Ursache aufhoeren. Immer mindestens 5-mal "Warum" fragen.
- **Vage Massnahmen**: "Monitoring verbessern" ist nicht handlungsorientiert. "Metrik X zu Dashboard Y bis Datum Z hinzufuegen" schon.
- **Kein Follow-through**: Massnahmen erstellt, aber nie ueberprueft. Kalendererinnerungen einrichten.
- **Angst vor Transparenz**: Incidents zu verbergen reduziert das Lernen. Breit teilen (innerhalb geeigneter Sicherheitsgrenzen).

## Verwandte Skills

- `write-incident-runbook` - Runbooks erstellen, die waehrend Incidents referenziert werden
- `configure-alerting-rules` - Alerts basierend auf Post-Mortem-Erkenntnissen verbessern
