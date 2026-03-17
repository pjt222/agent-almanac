---
name: define-slo-sli-sla
description: >
  Service Level Objectives (SLO), Service Level Indicators (SLI) und Service Level
  Agreements (SLA) mit Fehlerbudget-Tracking, Burn-Rate-Alerts und automatisierter
  Berichterstellung mit Prometheus und Tools wie Sloth oder Pyrra definieren. Verwenden,
  wenn Zuverlaessigkeitsziele fuer kundenseitige Services festgelegt werden, Feature-
  Geschwindigkeit und Systemzuverlaessigkeit durch Fehlerbudgets abgewogen werden, von
  willkuerlichen Uptime-Zielen zu datengetriebenen Metriken migriert wird oder
  Site-Reliability-Engineering-Praktiken implementiert werden.
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
  tags: slo, sli, sla, error-budget, burn-rate
---

# SLO/SLI/SLA definieren

Messbare Zuverlaessigkeitsziele mit Service Level Objectives festlegen, mit Indikatoren verfolgen und Fehlerbudgets verwalten.

## Wann verwenden

- Zuverlaessigkeitsziele fuer kundenseitige Services oder APIs festlegen
- Klare Erwartungen zwischen Service-Anbietern und Verbrauchern etablieren
- Feature-Geschwindigkeit mit Systemzuverlaessigkeit durch Fehlerbudgets ausbalancieren
- Objektive Kriterien fuer Incident-Schweregrad und -Reaktion erstellen
- Von willkuerlichen Uptime-Zielen zu datengetriebenen Zuverlaessigkeitsmetriken migrieren
- Site-Reliability-Engineering-Praktiken (SRE) implementieren
- Servicequalitaet im Laufe der Zeit messen und verbessern

## Eingaben

- **Pflichtfeld**: Service-Beschreibung und kritische Benutzer-Journeys
- **Pflichtfeld**: Historische Metrikdaten (Request-Raten, Latenzen, Fehlerquoten)
- **Optional**: Bestehende SLA-Verpflichtungen gegenueber Kunden
- **Optional**: Geschaeftsanforderungen fuer Service-Verfuegbarkeit und -Performance
- **Optional**: Incident-Verlauf und Daten zu Kundenauswirkungen

## Vorgehensweise

> Unter [Extended Examples](references/EXAMPLES.md) sind vollstaendige Konfigurationsdateien und Templates verfuegbar.


### Schritt 1: SLI-, SLO- und SLA-Hierarchie verstehen

Die Beziehungen und Unterschiede zwischen diesen drei Konzepten erlernen.

**Definitionen**:

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

**Hierarchie**:
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**Schluessprinzip**: Das SLO sollte **strenger** als das SLA sein, um einen Puffer zu bieten, bevor Kunden betroffen sind.

Beispiel:
- **SLA**: 99,9 % Verfuegbarkeit (Kundenzusage)
- **SLO**: 99,95 % Verfuegbarkeit (internes Ziel)
- **Puffer**: 0,05 % Spielraum vor SLA-Verletzung

**Erwartet:** Team versteht Unterschiede, Einigung, welche Metriken zu SLIs werden, Abstimmung zu SLO-Zielen.

**Bei Fehler:**
- Google-SRE-Buch-Kapitel zu SLI/SLO/SLA lesen
- Workshop mit Stakeholdern zur Abstimmung ueber Definitionen durchfuehren
- Mit einfachem Erfolgsquoten-SLI beginnen, bevor komplexe Latenz-SLOs erstellt werden

### Schritt 2: Geeignete SLIs auswaehlen

SLIs auswaehlen, die Benutzererfahrung und Geschaeftsauswirkungen widerspiegeln.

**Die vier goldenen Signale** (Google SRE):

1. **Latenz**: Zeit zur Bearbeitung einer Anfrage
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **Traffic**: Nachfrage an das System
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **Fehler**: Rate fehlgeschlagener Anfragen
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **Saettigung**: Wie "voll" das System ist
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**Gaengige SLI-Muster**:

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

**SLI-Auswahlkriterien**:
- **Benutzersichtbar**: Spiegelt tatsaechliche Benutzererfahrung wider
- **Messbar**: Kann aus vorhandenen Metriken quantifiziert werden
- **Handlungsorientiert**: Team kann es durch Engineering-Arbeit verbessern
- **Bedeutsam**: Korreliert mit Kundenzufriedenheit
- **Einfach**: Leicht zu verstehen und zu erklaeren

Vermeiden:
- Interne Systemmetriken, die Benutzern nicht sichtbar sind (CPU, Arbeitsspeicher)
- Eitelkeitsmetriken, die keine Kundenauswirkungen vorhersagen
- Uebermassig komplexe zusammengesetzte Bewertungen

**Erwartet:** 2-4 SLIs pro Service ausgewaehlt, mindestens Verfuegbarkeit und Latenz abdeckend, Team-Einigung zu Messabfragen.

**Bei Fehler:**
- Benutzer-Journey abbilden, um kritische Ausfallpunkte zu identifizieren
- Incident-Verlauf analysieren: Welche Metriken sagten Kundenauswirkungen voraus?
- SLI mit A/B-Test validieren: Metrik verschlechtern, Kundenbeschwerden messen
- Mit einfachem Verfuegbarkeits-SLI beginnen, Komplexitaet iterativ hinzufuegen

### Schritt 3: SLO-Ziele und Zeitfenster festlegen

Realistische und erreichbare Zuverlaessigkeitsziele definieren.

**SLO-Spezifikationsformat**:

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**Auswahl des Zeitfensters**:

Gaengige Fenster:
- **30 Tage** (monatlich): Typisch fuer externe SLAs
- **7 Tage** (woechentlich): Schnelleres Feedback fuer Engineering-Teams
- **1 Tag** (taeglich): Hochfrequente Services mit schneller Reaktion erforderlich

Beispiel-Fehlerbudget fuer 30-Tage-Fenster:
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**Realistische Ziele setzen**:

1. **Aktuelle Performance als Ausgangspunkt nehmen**:
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **Kosten der Neunen berechnen**:
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **Benutzer-Glueck gegenueber Engineering-Kosten abwaegen**:
   - Zu streng: Teuer, verlangsamt Feature-Entwicklung
   - Zu locker: Schlechte Benutzererfahrung, Kundenverlust
   - **Optimaler Punkt**: Etwas besser als Benutzererwartungen

**Erwartet:** SLO-Ziele mit Zustimmung der Geschaefts-Stakeholder gesetzt, mit Begruendung dokumentiert, Fehlerbudget berechnet.

**Bei Fehler:**
- Mit erreichbarem Ziel beginnen (z. B. 99 %, wenn aktuell 98,5 %)
- SLO-Ziele vierteljaehrlich basierend auf tatsaechlicher Performance iterieren
- Fuehrungsunterstuetzung fuer realistische Ziele vs. "fuenf Neunen"-Anforderungen einholen
- Kosten-Nutzen-Analyse fuer jede zusaetzliche Neun dokumentieren

### Schritt 4: SLO-Monitoring mit Sloth implementieren

Sloth verwenden, um Prometheus-Recording-Rules und Alerts aus SLO-Spezifikationen zu generieren.

**Sloth installieren**:

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**Sloth-SLO-Spezifikation erstellen** (`slos/user-api.yml`):

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**Prometheus-Regeln generieren**:

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**Generierte Recording-Rules** (Auszug):

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**Generierte Alerts**:

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**Regeln in Prometheus laden**:

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

Prometheus neu laden:
```bash
curl -X POST http://localhost:9090/-/reload
```

**Erwartet:** Sloth generiert Multi-Window-Multi-Burn-Rate-Alerts, Recording-Rules werden erfolgreich ausgewertet, Alerts werden waehrend Incidents entsprechend ausgeloest.

**Bei Fehler:**
- YAML-Syntax mit `yamllint slos/user-api.yml` validieren
- Sloth-Versionskompatibilitaet pruefen (v0.11+ empfohlen)
- Prometheus-Recording-Rule-Auswertung pruefen: `curl http://localhost:9090/api/v1/rules`
- Mit synthetischer Fehlerinjektion testen, um Alerts auszuloesen
- Sloth-Dokumentation fuer das SLI-Ereignisabfrageformat pruefen

### Schritt 5: Fehlerbudget-Dashboards erstellen

SLO-Compliance und Fehlerbudget-Verbrauch in Grafana visualisieren.

**Grafana-Dashboard-JSON** (Auszug):

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**Zu visualisierende Schluesselmetriken**:
- SLO-Ziel vs. aktueller SLI
- Verbleibendes Fehlerbudget (prozentuell und absolut)
- Burn-Rate (wie schnell das Budget erschoepft wird)
- Historische SLI-Trends (gleitendes 30-Tage-Fenster)
- Bis zur Erschoepfung verbleibende Zeit (bei aktueller Burn-Rate)

**Dashboard fuer Fehlerbudget-Richtlinien** (Markdown-Panel):

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Dashboards zeigen Echtzeit-SLO-Compliance, Fehlerbudget-Abbau sichtbar, Team kann fundierte Entscheidungen zur Feature-Geschwindigkeit treffen.

**Bei Fehler:**
- Recording-Rules pruefen: `curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- Prometheus-Datenquelle in Grafana auf korrekte URL pruefen
- Abfrageergebnisse in der Explore-Ansicht validieren, bevor zum Dashboard hinzugefuegt wird
- Sicherstellen, dass der Zeitbereich auf das entsprechende Fenster eingestellt ist (z. B. 30d fuer monatliche SLOs)

### Schritt 6: Fehlerbudget-Richtlinie etablieren

Organisatorischen Prozess zur Verwaltung von Fehlerbudgets definieren.

**Vorlage fuer Fehlerbudget-Richtlinien**:

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**Richtliniendurchsetzung automatisieren**:

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

In CI/CD-Pipeline integrieren:

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

**Erwartet:** Klare Richtlinie dokumentiert, automatisierte Gates verhindern riskante Deployments waehrend der Budget-Erschoepfung, Team-Abstimmung zu Zuverlaessigkeitsprioritaeten.

**Bei Fehler:**
- Mit manueller Richtliniendurchsetzung beginnen (Slack-Erinnerungen)
- Schrittweise mit weichen Gates automatisieren (Warnungen, keine Blockierungen)
- Fuehrungsunterstuetzung vor harten Gates einholen (Deployments blockieren)
- Richtlinieneffektivitaet vierteljaehrlich ueberpruefen, Schwellenwerte nach Bedarf anpassen

## Validierung

- [ ] SLIs ausgewaehlt, die Benutzererfahrung und Geschaeftsauswirkungen widerspiegeln
- [ ] SLO-Ziele mit Stakeholder-Zustimmung und dokumentierter Begruendung gesetzt
- [ ] Prometheus-Recording-Rules generieren SLI-Metriken erfolgreich
- [ ] Multi-Burn-Rate-Alerts konfiguriert und mit synthetischen Fehlern getestet
- [ ] Grafana-Dashboards zeigen Echtzeit-SLO-Compliance und Fehlerbudget
- [ ] Fehlerbudget-Richtlinie dokumentiert und an Team kommuniziert
- [ ] Automatisierte Gates verhindern riskante Deployments waehrend Budget-Erschoepfung
- [ ] Woechentliche/monatliche SLO-Reviewmeetings geplant
- [ ] Incident-Retrospektiven beinhalten SLO-Auswirkungsanalyse
- [ ] SLO-Compliance-Berichte werden mit Stakeholdern geteilt

## Haeufige Stolperfallen

- **Zu strenge SLOs**: "Fuenf Neunen" ohne Kostenanalyse setzen fuehrt zu Erschoepfung und verlangsamter Feature-Entwicklung. Erreichbar beginnen, iterativ steigern.
- **Zu viele SLIs**: 10+ Indikatoren verfolgen schafft Verwirrung. Auf 2-4 kritische kundenseitige Metriken konzentrieren.
- **SLO ohne SLA-Puffer**: SLO gleich SLA setzen laesst keinen Spielraum fuer Fehler vor Kundenauswirkungen. 0,05-0,1 % Puffer halten.
- **Fehlerbudget ignorieren**: SLOs verfolgen, aber nicht auf Budget-Erschoepfung reagieren, macht den Zweck zunichte. Fehlerbudget-Richtlinie durchsetzen.
- **Eitelkeitsmetriken als SLIs**: Interne Metriken (CPU, Arbeitsspeicher) statt benutzersichtbarer Metriken (Latenz, Fehler) verwenden, fuehrt zu Fehlausrichtung der Prioritaeten.
- **Kein Stakeholder-Buy-in**: Nur Engineering-SLOs ohne Produkt/Geschaefts-Vereinbarung fuehren zu Konflikten. Fuehrungsunterstuetzung einholen.
- **Statische SLOs**: Ziele niemals ueberpruefen oder anpassen, wenn das System sich weiterentwickelt. Vierteljaehrlich basierend auf tatsaechlicher Performance und Benutzerfeedback ueberpruefen.

## Verwandte Skills

- `setup-prometheus-monitoring` - Prometheus konfigurieren, um Metriken fuer SLI-Berechnung zu sammeln
- `configure-alerting-rules` - SLO-Burn-Rate-Alerts mit Alertmanager fuer On-Call-Benachrichtigungen integrieren
- `build-grafana-dashboards` - SLO-Compliance und Fehlerbudget-Verbrauch visualisieren
- `write-incident-runbook` - SLO-Auswirkungen in Runbooks fuer die Priorisierung der Incident-Reaktion einschliessen
