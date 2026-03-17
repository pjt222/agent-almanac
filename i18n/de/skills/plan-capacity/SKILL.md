---
name: plan-capacity
description: >
  Kapazitaetsplanung anhand historischer Metriken und Wachstumsmodelle durchfuehren.
  predict_linear fuer Prognosen verwenden, Ressourcenengpaesse identifizieren, Spielraum
  berechnen und Skalierungsmassnahmen empfehlen, bevor Saettigung eintritt. Verwenden, vor
  saisonalen Traffic-Spitzen oder Produktlaunches, waehrend vierteljaehrlicher Kapazitaets-
  reviews, wenn Ressourcenauslastungstrends aufwaerts zeigen oder vor Budget-Planungszyklen.
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
  tags: capacity-planning, forecasting, predict-linear, growth, headroom
---

# Kapazitaet planen

Ressourcenbedarf prognostizieren und Saettigung durch datengetriebene Kapazitaetsplanung vermeiden.

## Wann verwenden

- Vor saisonalen Traffic-Spitzen (Feiertage, Verkaufsereignisse)
- Bei der Planung neuer Feature-Launches
- Waehrend vierteljaehrlicher Kapazitaets-Reviews
- Wenn Ressourcenauslastungstrends aufwaerts zeigen
- Vor Budget-Planungszyklen

## Eingaben

- **Pflichtfeld**: Historische Metriken (CPU, Arbeitsspeicher, Festplatte, Netzwerk, Anfragen/Sek.)
- **Pflichtfeld**: Zeitbereich fuer Trendanalyse (mindestens 4 Wochen)
- **Optional**: Geschaeftliche Wachstumsprognosen (erwartetes Nutzerwachstum, Feature-Launches)
- **Optional**: Budgeteinschraenkungen

## Vorgehensweise

### Schritt 1: Historische Metriken sammeln

Schluessel-Ressourcenmetriken aus Prometheus abfragen:

```promql
# CPU usage trend over 8 weeks
avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)

# Memory usage trend
avg(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) by (instance)

# Disk usage growth
avg(node_filesystem_size_bytes - node_filesystem_free_bytes) by (instance, device)

# Request rate growth
sum(rate(http_requests_total[5m])) by (service)

# Database connection pool usage
avg(db_connection_pool_used / db_connection_pool_max) by (instance)
```

Zur Analyse exportieren:

```bash
# Export 8 weeks of CPU data
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)' \
  --data-urlencode 'start=2024-12-15T00:00:00Z' \
  --data-urlencode 'end=2025-02-09T00:00:00Z' \
  --data-urlencode 'step=1h' | jq '.data.result' > cpu_8weeks.json
```

**Erwartet:** Saubere Zeitreihendaten fuer jede Ressource ohne grosse Luecken.

**Bei Fehler:** Fehlende Daten reduzieren die Prognosegenauigkeit. Metrik-Aufbewahrung und Scrape-Intervalle pruefen.

### Schritt 2: Wachstumsraten mit predict_linear berechnen

Prometheus's `predict_linear()` verwenden, um Saettigung zu prognostizieren:

```promql
# Predict when CPU will hit 80% (4 weeks ahead)
predict_linear(
  avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))[8w:],
  4*7*24*3600  # 4 weeks in seconds
) > 0.80

# Predict disk full date (8 weeks ahead)
predict_linear(
  avg(node_filesystem_size_bytes - node_filesystem_free_bytes)[8w:],
  8*7*24*3600
) > 0.95 * avg(node_filesystem_size_bytes)

# Predict memory pressure (2 weeks ahead)
predict_linear(
  avg(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)[8w:],
  2*7*24*3600
) / avg(node_memory_MemTotal_bytes) > 0.90

# Predict request rate capacity breach (4 weeks ahead)
predict_linear(
  sum(rate(http_requests_total[5m]))[8w:],
  4*7*24*3600
) > 10000  # known capacity limit
```

Ein Prognose-Dashboard erstellen:

```json
{
  "dashboard": {
    "title": "Capacity Forecast",
    "panels": [
      {
        "title": "CPU Saturation Forecast (4 weeks)",
        "targets": [
          {
            "expr": "predict_linear(avg(rate(node_cpu_seconds_total{mode!=\"idle\"}[5m]))[8w:], 4*7*24*3600)",
            "legendFormat": "Predicted CPU"
          },
          {
            "expr": "0.80",
            "legendFormat": "Target Threshold (80%)"
          }
        ]
      },
      {
        "title": "Disk Full Date",
        "targets": [
          {
            "expr": "(avg(node_filesystem_size_bytes) - predict_linear(avg(node_filesystem_free_bytes)[8w:], 8*7*24*3600)) / avg(node_filesystem_size_bytes)",
            "legendFormat": "Predicted Usage %"
          }
        ]
      }
    ]
  }
}
```

**Erwartet:** Klare Visualisierung, die zeigt, wann Ressourcen Schwellenwerte ueberschreiten werden.

**Bei Fehler:** Wenn Prognosen falsch aussehen (negative Werte, wilde Schwankungen), auf folgendes pruefen:
- Unzureichende Historie (mindestens 4 Wochen erforderlich)
- Stufenfoermige Spitzen (Deployments, Migrationen) verzerren den Trend
- Saisonale Muster, die das lineare Modell nicht erfasst

### Schritt 3: Aktuellen Spielraum berechnen

Sicherheitsspanne vor der Saettigung bestimmen:

```promql
# CPU headroom (percentage remaining before 80% threshold)
(0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) / 0.80 * 100

# Memory headroom (bytes remaining before 90% usage)
avg(node_memory_MemAvailable_bytes) - (avg(node_memory_MemTotal_bytes) * 0.10)

# Request rate headroom (requests/sec before saturation)
10000 - sum(rate(http_requests_total[5m]))

# Time until saturation (weeks until CPU hits 80%)
(0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) /
  deriv(avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))[8w:]) /
  (7*24*3600)
```

Einen Spielraum-Zusammenfassungsbericht erstellen:

```bash
cat > capacity_headroom.md <<'EOF'
# Capacity Headroom Report (2025-02-09)

## Current Utilization
- **CPU**: 45% average (target: <80%)
- **Memory**: 62% (target: <90%)
- **Disk**: 71% (target: <95%)
- **Request Rate**: 4,200 req/s (capacity: 10,000)

## Headroom Analysis
- **CPU**: 35% headroom → ~12 weeks until saturation
- **Memory**: 28% headroom → ~16 weeks until saturation
- **Disk**: 24% headroom → ~8 weeks until full
- **Request Rate**: 5,800 req/s headroom → ~20 weeks until capacity

## Priority Actions
1. **Disk**: Implement log rotation or expand volume within 4 weeks
2. **CPU**: Plan horizontal scaling in next quarter
3. **Memory**: Monitor but no immediate action needed
EOF
```

**Erwartet:** Quantifizierter Spielraum fuer jede Ressource mit Zeitschatzungen bis zur Saettigung.

**Bei Fehler:** Wenn der Spielraum bereits negativ ist, befindet man sich im reaktiven Modus. Sofortige Skalierung erforderlich.

### Schritt 4: Wachstumsszenarien modellieren

Geschaeftliche Prognosen einbeziehen:

```python
# Example Python script for scenario modeling
import pandas as pd
import numpy as np

# Load historical data
df = pd.read_json('cpu_8weeks.json')

# Calculate weekly growth rate
growth_rate_weekly = df['value'].pct_change(periods=7).mean()

# Scenario 1: Current trend
weeks_ahead = 12
current_trend = df['value'].iloc[-1] * (1 + growth_rate_weekly) ** weeks_ahead

# Scenario 2: 2x user growth (marketing campaign)
accelerated_trend = df['value'].iloc[-1] * (1 + growth_rate_weekly * 2) ** weeks_ahead

# Scenario 3: New feature launch (+30% baseline)
feature_launch = (df['value'].iloc[-1] * 1.30) * (1 + growth_rate_weekly) ** weeks_ahead

print(f"Current Trend (12 weeks): {current_trend:.1%} CPU")
print(f"2x Growth Scenario: {accelerated_trend:.1%} CPU")
print(f"Feature Launch Scenario: {feature_launch:.1%} CPU")
print(f"Threshold: 80%")
```

**Erwartet:** Mehrere Szenarien zeigen die Auswirkungen von Geschaeftsaenderungen auf die Kapazitaet.

**Bei Fehler:** Wenn Szenarien die Kapazitaet ueberschreiten, Skalierung vor dem Ereignis priorisieren.

### Schritt 5: Skalierungsempfehlungen generieren

Handlungsorientierte Empfehlungen erstellen:

```markdown
## Capacity Scaling Plan

### Immediate Actions (Next 4 Weeks)
1. **Disk Expansion** [Priority: HIGH]
   - Current: 500GB, 71% used
   - Projected full date: 2025-04-01 (8 weeks)
   - Action: Expand to 1TB by 2025-03-15
   - Cost: $50/month additional
   - Justification: 5 weeks lead time needed

2. **Log Rotation Policy** [Priority: MEDIUM]
   - Current: Logs retained 90 days
   - Action: Reduce to 30 days, archive to S3
   - Savings: ~150GB disk space
   - Cost: $5/month S3 storage

### Near-Term Actions (Next Quarter)
3. **Horizontal Scaling - API Tier** [Priority: MEDIUM]
   - Current: 4 instances, 45% CPU
   - Projected: 65% CPU by 2025-05-01
   - Action: Add 2 instances (to 6 total)
   - Cost: $400/month
   - Trigger: When CPU avg exceeds 60% for 7 days

4. **Database Connection Pool** [Priority: LOW]
   - Current: 50 max connections, 40% used
   - Projected: 55% by Q3
   - Action: Increase to 75 in Q2
   - Cost: None (configuration change)

### Long-Term Planning (Next 6 Months)
5. **Migration to Auto-Scaling** [Priority: MEDIUM]
   - Current: Manual scaling
   - Action: Implement Kubernetes HPA (Horizontal Pod Autoscaler)
   - Timeline: Q3 2025
   - Benefit: Automatic response to load spikes
```

**Erwartet:** Priorisierte Liste mit Kosten, Zeitplaenen und Ausloesebedingungen.

**Bei Fehler:** Wenn Empfehlungen wegen Kosten abgelehnt werden, Schwellenwerte ueberarbeiten oder Risiko akzeptieren.

### Schritt 6: Kapazitaets-Alerts einrichten

Alerts fuer geringen Spielraum erstellen:

```yaml
# capacity_alerts.yml
groups:
  - name: capacity
    interval: 1h
    rules:
      - alert: CPUCapacityLow
        expr: |
          (0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) / 0.80 < 0.20
        for: 24h
        labels:
          severity: warning
        annotations:
          summary: "CPU headroom below 20%"
          description: "Current CPU headroom: {{ $value | humanizePercentage }}. Scaling needed within 4 weeks."

      - alert: DiskFillForecast
        expr: |
          predict_linear(avg(node_filesystem_free_bytes)[8w:], 4*7*24*3600) < 0.10 * avg(node_filesystem_size_bytes)
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Disk projected to fill within 4 weeks"
          description: "Expand disk volume soon."

      - alert: MemoryCapacityLow
        expr: |
          avg(node_memory_MemAvailable_bytes) < 0.15 * avg(node_memory_MemTotal_bytes)
        for: 6h
        labels:
          severity: warning
        annotations:
          summary: "Memory headroom below 15%"
```

**Erwartet:** Alerts loesen vor der Saettigung aus und geben Zeit fuer proaktive Skalierung.

**Bei Fehler:** Schwellenwerte anpassen, wenn Alerts zu oft auslosen (Alert-Ueberlastung) oder zu spaet (reaktives Handeln).

## Validierung

- [ ] Historische Metriken decken mindestens 8 Wochen ab
- [ ] `predict_linear()`-Abfragen liefern sinnvolle Prognosen (keine negativen Werte)
- [ ] Spielraum fuer alle kritischen Ressourcen berechnet
- [ ] Wachstumsszenarien enthalten geschaeftliche Prognosen
- [ ] Skalierungsempfehlungen haben Kosten und Zeitplaene
- [ ] Kapazitaets-Alerts konfiguriert und getestet
- [ ] Bericht mit Ingenieurleitung und Finanzen besprochen

## Haeufige Stolperfallen

- **Unzureichende Historie**: Lineare Prognosen benoetigen mindestens 4 Wochen Daten. Weniger davon macht Prognosen unzuverlaessig.
- **Stufenfoermige Aenderungen ignorieren**: Deployments, Migrationen oder Feature-Launches verzerren Trends. Filtern oder annotieren.
- **Lineare Annahme**: Nicht alles Wachstum ist linear. Exponentielles Wachstum (virale Produkte) erfordert andere Modelle.
- **Vorlaufzeit vergessen**: Cloud-Provisioning ist schnell, aber Beschaffung, Budgets und Migrationen dauern Wochen. Fruehzeitig planen.
- **Keine Budget-Abstimmung**: Kapazitaetsplanung ohne Budget-Zustimmung fuehrt zu Last-Minute-Hektik. Finanzen fruehzeitig einbeziehen.

## Verwandte Skills

- `setup-prometheus-monitoring` - Metriken fuer die Kapazitaetsplanung sammeln
- `build-grafana-dashboards` - Prognosen und Spielraum visualisieren
- `optimize-cloud-costs` - Kapazitaetsplanung mit Kostenoptimierung ausbalancieren
