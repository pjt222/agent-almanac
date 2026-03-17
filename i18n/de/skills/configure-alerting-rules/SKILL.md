---
name: configure-alerting-rules
description: >
  Prometheus Alertmanager mit Routing-Baeumen, Empfaengern (Slack, PagerDuty, E-Mail),
  Inhibierungsregeln, Stummschaltungen und Benachrichtigungsvorlagen fuer handlungsorientiertes
  Incident-Alerting konfigurieren. Verwenden, wenn proaktives Monitoring mit automatisierter
  Incident-Erkennung implementiert wird, Alerts basierend auf Schweregrad an das
  entsprechende Team geroutet werden, Alert-Ueberlastung durch Gruppierung und Deduplizierung
  reduziert wird, mit On-Call-Systemen wie PagerDuty integriert wird oder von Legacy-Alerting
  zu Prometheus-basiertem Alerting migriert wird.
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
  complexity: intermediate
  language: multi
  tags: alertmanager, alerting, routing, pagerduty, slack
---

# Alerting-Regeln konfigurieren

Prometheus-Alerting-Regeln und Alertmanager fuer zuverlaessige, handlungsorientierte Incident-Benachrichtigungen einrichten.

> Unter [Extended Examples](references/EXAMPLES.md) sind vollstaendige Konfigurationsdateien und Templates verfuegbar.

## Wann verwenden

- Proaktives Monitoring mit automatisierter Incident-Erkennung implementieren
- Alerts basierend auf Schweregrad und Service-Eigentuemer an entsprechende Teams routen
- Alert-Ueberlastung durch intelligente Gruppierung und Deduplizierung reduzieren
- Monitoring mit On-Call-Systemen integrieren (PagerDuty, Opsgenie)
- Eskalationsrichtlinien fuer kritische Produktionsprobleme etablieren
- Von Legacy-Monitoring-Systemen zu Prometheus-basiertem Alerting migrieren
- Handlungsorientierte Alerts erstellen, die Responder zur Loesung fuehren

## Eingaben

- **Pflichtfeld**: Prometheus-Metriken fuer Alerts (Fehlerquoten, Latenz, Saettigung)
- **Pflichtfeld**: On-Call-Rotation und Eskalationsrichtlinien
- **Optional**: Vorhandene Alert-Definitionen zur Migration
- **Optional**: Benachrichtigungskanaele (Slack, E-Mail, PagerDuty)
- **Optional**: Runbook-Dokumentation fuer gaengige Alerts

## Vorgehensweise

### Schritt 1: Alertmanager bereitstellen

Alertmanager installieren und konfigurieren, um Alerts von Prometheus zu empfangen.

**Docker-Compose-Deployment** (Grundstruktur):

```yaml
version: '3.8'
services:
  alertmanager:
    image: prom/alertmanager:v0.26.0
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    # ... (see EXAMPLES.md for complete configuration)
```

**Grundlegende Alertmanager-Konfiguration** (`alertmanager.yml` Auszug):

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical

# ... (see EXAMPLES.md for complete routing, inhibition rules, and receivers)
```

**Prometheus fuer Alertmanager konfigurieren** (`prometheus.yml`):

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**Erwartet:** Alertmanager-UI unter `http://localhost:9093` zugaenglich, Prometheus "Status > Alertmanagers" zeigt UP-Status.

**Bei Fehler:**
- Alertmanager-Logs pruefen: `docker logs alertmanager`
- Pruefen, ob Prometheus Alertmanager erreichen kann: `curl http://alertmanager:9093/api/v2/status`
- Webhook-URLs testen: `curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- YAML-Syntax validieren: `amtool check-config alertmanager.yml`

### Schritt 2: Alerting-Regeln in Prometheus definieren

Alerting-Regeln erstellen, die bei Bedingungserfuellung ausloesen.

**Alerting-Regeldatei erstellen** (`/etc/prometheus/rules/alerts.yml` Auszug):

```yaml
groups:
  - name: instance_alerts
    interval: 30s
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 5m
        labels:
          severity: critical
          team: infrastructure
        annotations:
          summary: "Instance {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} has been down for >5min."
          runbook_url: "https://wiki.example.com/runbooks/instance-down"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          # ... (see EXAMPLES.md for complete alerts)
```

**Best Practices fuer Alert-Design**:

- **`for`-Dauer**: Verhindert flatternde Alerts. 5-10 Minuten fuer die meisten Alerts verwenden.
- **Beschreibende Annotationen**: Aktuellen Wert, betroffene Ressource und Runbook-Link einschliessen.
- **Schweregrade**: critical (ruft On-Call), warning (untersuchen), info (zur Information)
- **Team-Labels**: Ermoeglicht Routing zum richtigen Team/Kanal
- **Runbook-Links**: Jeder Alert sollte eine Runbook-URL haben

Regeln in Prometheus laden:

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

Validieren und neu laden:

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**Erwartet:** Alerts auf der Prometheus-"Alerts"-Seite sichtbar, Alerts loesen bei ueberschrittenen Schwellenwerten aus, Alertmanager empfaengt ausgeloeste Alerts.

**Bei Fehler:**
- Prometheus-Logs auf Regelauswertungsfehler pruefen
- Regelsyntax mit `promtool check rules` pruefen
- Alert-Abfragen unabhaengig in der Prometheus-UI testen
- Alert-Zustandsuebertragungen pruefen: Inactive → Pending → Firing

### Schritt 3: Benachrichtigungsvorlagen erstellen

Lesbare, handlungsorientierte Benachrichtigungsmeldungen gestalten.

**Vorlagendatei erstellen** (`/etc/alertmanager/templates/default.tmpl` Auszug):

```gotmpl
{{ define "slack.default.title" }}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{ end }}

{{ define "slack.default.text" }}
{{ range .Alerts }}
*Alert:* {{ .Labels.alertname }}
*Severity:* {{ .Labels.severity }}
*Summary:* {{ .Annotations.summary }}
{{ if .Annotations.runbook_url }}*Runbook:* {{ .Annotations.runbook_url }}{{ end }}
{{ end }}
{{ end }}

# ... (see EXAMPLES.md for complete email and PagerDuty templates)
```

**Vorlagen in Empfaengern verwenden**:

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**Erwartet:** Benachrichtigungen konsistent formatiert, enthalten alle relevanten Kontextinformationen, handlungsorientiert mit Runbook-Links.

**Bei Fehler:**
- Vorlagen-Rendering testen: `amtool template test --config.file=alertmanager.yml`
- Vorlagensyntaxfehler in Alertmanager-Logs pruefen
- `{{ . | json }}` zur Fehlersuche in der Vorlage-Datenstruktur verwenden

### Schritt 4: Routing und Gruppierung konfigurieren

Alert-Zustellung mit intelligenten Routing-Regeln optimieren.

**Erweiterte Routing-Konfiguration** (Auszug):

```yaml
route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s

  routes:
    - match:
        team: platform
      receiver: 'team-platform'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-platform'
          group_wait: 10s
          repeat_interval: 15m
          continue: true   # Also send to Slack

# ... (see EXAMPLES.md for complete routing with time intervals)
```

**Gruppierungsstrategien**:

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**Erwartet:** Alerts werden an korrekte Teams geroutet, logisch gruppiert, Zeitplanung angemessen fuer Schweregrad.

**Bei Fehler:**
- Routing testen: `amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- Routing-Baum pruefen: `amtool config routes show --config.file=alertmanager.yml`
- `continue: true` pruefen, wenn Alert mehrere Routen treffen soll

### Schritt 5: Inhibierung und Stummschaltung implementieren

Alert-Rauschen mit Inhibierungsregeln und temporaeren Stummschaltungen reduzieren.

**Inhibierungsregeln** (abhaengige Alerts unterdruecken):

```yaml
inhibit_rules:
  # Cluster down suppresses all node alerts in that cluster
  - source_match:
      alertname: 'ClusterDown'
      severity: 'critical'
    target_match_re:
      alertname: '(InstanceDown|HighCPU|HighMemory)'
    equal: ['cluster']

  # Service down suppresses latency and error alerts
  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: '(HighLatency|HighErrorRate)'
    equal: ['service', 'namespace']

# ... (see EXAMPLES.md for more inhibition patterns)
```

**Stummschaltungen programmgesteuert erstellen**:

```bash
# Silence during maintenance
amtool silence add \
  instance=app-server-1 \
  --author="ops-team" \
  --comment="Scheduled maintenance" \
  --duration=2h

# List and manage silences
amtool silence query
amtool silence expire <SILENCE_ID>
```

**Erwartet:** Inhibierung reduziert Kaskaden-Alerts automatisch, Stummschaltungen verhindern Benachrichtigungen waehrend geplanter Wartungsarbeiten.

**Bei Fehler:**
- Inhibierungslogik mit Live-Alerts testen
- "Silences"-Tab in der Alertmanager-UI pruefen
- Sicherstellen, dass Stummschaltungs-Matcher exakt sind (Labels muessen perfekt uebereinstimmen)

### Schritt 6: Mit externen Systemen integrieren

Alertmanager mit PagerDuty, Opsgenie, Jira usw. verbinden.

**PagerDuty-Integration** (Auszug):

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - routing_key: 'YOUR_INTEGRATION_KEY'
        severity: '{{ .CommonLabels.severity }}'
        description: '{{ range .Alerts.Firing }}{{ .Annotations.summary }}{{ end }}'
        details:
          firing: '{{ .Alerts.Firing | len }}'
          alertname: '{{ .GroupLabels.alertname }}'
        # ... (see EXAMPLES.md for complete integration examples)
```

**Webhook fuer benutzerdefinierte Integrationen**:

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**Erwartet:** Alerts erstellen Incidents in PagerDuty, erscheinen in Team-Kommunikationskanaelen, loesen On-Call-Eskalationen aus.

**Bei Fehler:**
- API-Schluessel/Tokens auf Gueltigkeit pruefen
- Netzwerkkonnektivitaet zu externen Services pruefen
- Webhook-Endpunkte unabhaengig mit curl testen
- Debug-Modus aktivieren: `--log.level=debug`

## Validierung

- [ ] Alertmanager empfaengt erfolgreich Alerts von Prometheus
- [ ] Alerts werden basierend auf Labels und Schweregrad an korrekte Teams geroutet
- [ ] Benachrichtigungen werden an Slack, E-Mail oder PagerDuty zugestellt
- [ ] Alert-Gruppierung reduziert Benachrichtigungsvolumen angemessen
- [ ] Inhibierungsregeln unterdruecken abhaengige Alerts korrekt
- [ ] Stummschaltungen verhindern Benachrichtigungen waehrend Wartungsfenstern
- [ ] Benachrichtigungsvorlagen enthalten Runbook-Links und Kontext
- [ ] Wiederholungsintervall verhindert Alert-Ueberlastung bei lang andauernden Problemen
- [ ] Aufloesungsbenachrichtigungen werden gesendet, wenn Alerts sich klaeren
- [ ] Externe Integrationen (PagerDuty, Opsgenie) erstellen Incidents

## Haeufige Stolperfallen

- **Alert-Ueberlastung**: Zu viele niedrig priorisierte Alerts fuehren dazu, dass Responder kritische ignorieren. Strenge Schwellenwerte setzen, Inhibierung verwenden.
- **Fehlende `for`-Dauer**: Alerts ohne `for` loesen bei vorueber gehenden Spitzen aus. Immer 5-10-Minuten-Fenster verwenden.
- **Zu breite Gruppierung**: Gruppierung mit `['...']` sendet einzelne Benachrichtigungen. Spezifische Label-Gruppierung verwenden.
- **Keine Runbook-Links**: Alerts ohne Runbooks lassen Responder raten. Jeder Alert braucht eine Runbook-URL.
- **Falscher Schweregrad**: Warnungen faelschlicherweise als kritisch zu bezeichnen, desensibilisiert das Team. Critical nur fuer Notfaelle reservieren.
- **Vergessene Stummschaltungen**: Stummschaltungen ohne Ablaufzeit koennen echte Probleme verbergen. Immer Endzeiten setzen.
- **Einzelne Route**: Alle Alerts in einen Kanal verliert Kontext. Teamspezifisches Routing verwenden.
- **Keine Inhibierung**: Kaskaden-Alerts waehrend Ausfaellen erzeugen Rauschen. Inhibierungsregeln implementieren.

## Verwandte Skills

- `setup-prometheus-monitoring` - Metriken und Recording-Rules definieren, die Alerting-Regeln speisen
- `define-slo-sli-sla` - SLO-Burn-Rate-Alerts fuer Fehlerbudget-Management generieren
- `write-incident-runbook` - Runbooks erstellen, die aus Alert-Annotationen verlinkt werden
- `build-grafana-dashboards` - Alert-Ausloesungshistorie und Stummschaltungsmuster visualisieren
