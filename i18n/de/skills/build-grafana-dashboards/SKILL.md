---
name: build-grafana-dashboards
description: >
  Produktionsreife Grafana-Dashboards mit wiederverwendbaren Panels, Template-Variablen,
  Annotationen und Provisioning fuer versionskontrolliertes Dashboard-Deployment erstellen.
  Verwenden, wenn visuelle Darstellungen von Prometheus-, Loki- oder anderen Datenquellen-
  Metriken benoetigt werden, operative Dashboards fuer SRE-Teams aufgebaut werden, von
  manueller Dashboard-Erstellung zu versionskontrolliertem Provisioning migriert wird oder
  Executive-Level-SLO-Compliance-Berichte eingerichtet werden sollen.
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
  tags: grafana, dashboards, visualization, panels, provisioning
---

# Grafana-Dashboards erstellen

Grafana-Dashboards mit Best Practices fuer Wartbarkeit, Wiederverwendbarkeit und Versionskontrolle entwerfen und bereitstellen.

## Wann verwenden

- Visuelle Darstellungen von Prometheus-, Loki- oder anderen Datenquellen-Metriken erstellen
- Operative Dashboards fuer SRE-Teams und Incident-Responder aufbauen
- Executive-Level-Reporting-Dashboards fuer SLO-Compliance einrichten
- Dashboards von manueller Erstellung zu versionskontrolliertem Provisioning migrieren
- Dashboard-Layouts teamuebergreifend mit Template-Variablen standardisieren
- Drill-down-Erlebnisse von High-Level-Uebersichten bis hin zu detaillierten Metriken erstellen

## Eingaben

- **Pflichtfeld**: Datenquellen-Konfiguration (Prometheus, Loki, Tempo usw.)
- **Pflichtfeld**: Metriken oder Logs zur Visualisierung mit ihren Abfragemustern
- **Optional**: Template-Variablen fuer Multi-Service- oder Multi-Environment-Ansichten
- **Optional**: Vorhandenes Dashboard-JSON fuer Migration oder Anpassung
- **Optional**: Annotationsabfragen fuer Ereignis-Korrelation (Deployments, Incidents)

## Vorgehensweise

> Unter [Extended Examples](references/EXAMPLES.md) sind vollstaendige Konfigurationsdateien und Templates verfuegbar.


### Schritt 1: Dashboard-Struktur entwerfen

Dashboard-Layout und -Organisation planen, bevor Panels erstellt werden.

Ein Dashboard-Spezifikationsdokument erstellen:

```markdown
# Service Overview Dashboard

## Purpose
Real-time operational view for on-call engineers monitoring the API service.

## Rows
1. High-Level Metrics (collapsed by default)
   - Request rate, error rate, latency (RED metrics)
   - Service uptime, instance count
2. Detailed Metrics (expanded by default)
   - Per-endpoint latency breakdown
   - Error rate by status code
   - Database connection pool status
3. Resource Utilization
   - CPU, memory, disk usage per instance
   - Network I/O rates
4. Logs (collapsed by default)
   - Recent errors from Loki
   - Alert firing history

## Variables
- `environment`: production, staging, development
- `instance`: all instances or specific instance selection
- `interval`: aggregation window (5m, 15m, 1h)

## Annotations
- Deployment events from CI/CD system
- Alert firing/resolving events
```

Wichtige Designprinzipien:
- **Wichtigste Metriken zuerst**: Kritische Metriken oben, Details darunter
- **Konsistente Zeitbereiche**: Zeit ueber alle Panels synchronisieren
- **Drill-down-Pfade**: Von High-Level zu Detaildashboards verlinken
- **Responsives Layout**: Reihen und Panel-Breiten verwenden, die auf verschiedenen Bildschirmen funktionieren

**Erwartet:** Klare Dashboard-Struktur dokumentiert, Stakeholder zu Metriken und Layout-Prioritaeten abgestimmt.

**Bei Fehler:**
- Dashboard-Designreview mit Endnutzern durchfuehren (SREs, Entwickler)
- Mit Branchenstandards vergleichen (USE-Methode, RED-Methode, Four Golden Signals)
- Bestehende Dashboards im Team auf Konsistenzmuster ueberpruefen

### Schritt 2: Dashboard mit Template-Variablen erstellen

Dashboard-Grundlage mit wiederverwendbaren Variablen zur Filterung aufbauen.

Dashboard-JSON-Struktur erstellen (oder Benutzerflaeche verwenden und exportieren):

```json
{
  "dashboard": {
    "title": "API Service Overview",
    "uid": "api-service-overview",
    "version": 1,
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\"}, environment)",
          "multi": false,
          "includeAll": false,
          "refresh": 1,
          "sort": 1,
          "current": {
            "selected": false,
            "text": "production",
            "value": "production"
          }
        },
        {
          "name": "instance",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\",environment=\"$environment\"}, instance)",
          "multi": true,
          "includeAll": true,
          "refresh": 1,
          "allValue": ".*",
          "current": {
            "selected": true,
            "text": "All",
            "value": "$__all"
          }
        },
        {
          "name": "interval",
          "type": "interval",
          "options": [
            {"text": "1m", "value": "1m"},
            {"text": "5m", "value": "5m"},
            {"text": "15m", "value": "15m"},
            {"text": "1h", "value": "1h"}
          ],
          "current": {
            "text": "5m",
            "value": "5m"
          },
          "auto": false
        }
      ]
    },
    "annotations": {
      "list": [
        {
          "name": "Deployments",
          "datasource": "Prometheus",
          "enable": true,
          "expr": "changes(app_version{job=\"api-service\",environment=\"$environment\"}[5m]) > 0",
          "step": "60s",
          "iconColor": "rgba(0, 211, 255, 1)",
          "tagKeys": "version"
        }
      ]
    }
  }
}
```

Variablentypen und Anwendungsfaelle:
- **Query-Variablen**: Dynamische Listen aus der Datenquelle (`label_values()`, `query_result()`)
- **Intervall-Variablen**: Aggregationsfenster fuer Abfragen
- **Benutzerdefinierte Variablen**: Statische Listen fuer Nicht-Metrik-Auswahlen
- **Konstantenvariablen**: Gemeinsame Werte ueber Panels hinweg (Datenquellennamen, Schwellenwerte)
- **Textfeld-Variablen**: Freitext-Eingabe zur Filterung

**Erwartet:** Variablen werden korrekt aus der Datenquelle befuellt, kaskadierende Filter funktionieren (Umgebung filtert Instanzen), Standardauswahl angemessen.

**Bei Fehler:**
- Variablenabfragen unabhaengig in der Prometheus-Benutzerflaeche testen
- Auf Zirkularabhaengigkeiten pruefen (Variable A haengt von B ab, das von A abhaengt)
- Regex-Muster im `allValue`-Feld fuer Multi-Select-Variablen ueberpruefen
- Variablen-Refresh-Einstellungen pruefen (beim Dashboard-Laden vs. bei Zeitbereichsaenderung)

### Schritt 3: Visualisierungs-Panels erstellen

Panels fuer jede Metrik mit geeigneten Visualisierungstypen erstellen.

**Time-Series-Panel** (Request Rate):

```json
{
  "type": "timeseries",
  "title": "Request Rate",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{job=\"api-service\",environment=\"$environment\",instance=~\"$instance\"}[$interval])) by (method)",
      "legendFormat": "{{method}}",
      "refId": "A"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth",
        "fillOpacity": 10,
        "spanNulls": true
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1000, "color": "yellow"},
          {"value": 5000, "color": "red"}
        ]
      }
    }
  },
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "desc"
    },
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "calcs": ["mean", "max", "last"]
    }
  }
}
```

**Stat-Panel** (Fehlerrate):

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**Heatmap-Panel** (Latenz-Verteilung):

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

Panel-Auswahlhilfe:
- **Time series**: Trends ueber Zeit (Raten, Zaehler, Dauern)
- **Stat**: Einzelner aktueller Wert mit Schwellenwerteinfaerbung
- **Gauge**: Prozentwerte (CPU, Arbeitsspeicher, Festplattenauslastung)
- **Bar gauge**: Mehrere Werte zu einem Zeitpunkt vergleichen
- **Heatmap**: Werteverteilung ueber Zeit (Latenz-Perzentile)
- **Table**: Detaillierte Aufschluesselung mehrerer Metriken
- **Logs**: Rohe Log-Zeilen aus Loki mit Filterung

**Erwartet:** Panels werden mit Daten korrekt gerendert, Visualisierungen entsprechen den beabsichtigten Metriktypen, Legenden beschreibend, Schwellenwerte heben Probleme hervor.

**Bei Fehler:**
- Abfragen in der Explore-Ansicht mit demselben Zeitbereich und Variablen testen
- Auf Metriknamen-Tippfehler oder falsche Label-Filter pruefen
- Aggregationsfunktionen mit dem Metriktyp abgleichen (rate fuer Counter, avg fuer Gauges)
- Einheitenkonfigurationen pruefen (Bytes, Sekunden, Anfragen pro Sekunde)
- "Show query inspector" aktivieren, um leere Ergebnisse zu debuggen

### Schritt 4: Reihen und Layout konfigurieren

Panels in zusammenfaltbare Reihen zur logischen Gruppierung organisieren.

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

Layout-Best-Practices:
- Das Raster ist 24 Einheiten breit, jedes Panel gibt `w` (Breite) und `h` (Hoehe) an
- Reihen verwenden, um verwandte Panels zu gruppieren, weniger kritische Abschnitte standardmaessig einklappen
- Wichtigste Metriken im ersten sichtbaren Bereich platzieren (y=0-8)
- Konsistente Panel-Hoehen innerhalb von Reihen beibehalten (typischerweise 4, 8 oder 12 Einheiten)
- Volle Breite (24) fuer Time-Series-Panels verwenden, halbe Breite (12) fuer Vergleiche

**Erwartet:** Dashboard-Layout logisch organisiert, Reihen klappen korrekt ein/aus, Panels richten sich optisch ohne Luecken aus.

**Bei Fehler:**
- Validieren, dass gridPos-Koordinaten sich nicht ueberschneiden
- Pruefen, dass Reihen-Panels-Array Panels enthaelt (nicht null)
- Sicherstellen, dass y-Koordinaten logisch nach unten zunehmen
- Grafana-Benutzerflaeche "Edit JSON" verwenden, um Rasterpositionen zu inspizieren

### Schritt 5: Links und Drill-downs hinzufuegen

Navigationspfade zwischen verwandten Dashboards erstellen.

Dashboard-Level-Links in JSON:

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

Panel-Level-Datenlinks:

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

Link-Variablen:
- `$service`, `$environment`: Dashboard-Template-Variablen
- `${__field.labels.instance}`: Label-Wert aus dem angeklickten Datenpunkt
- `${__from}`, `${__to}`: Aktueller Dashboard-Zeitbereich
- `$__url_time_range`: Kodierter Zeitbereich fuer URL

**Erwartet:** Das Klicken auf Panel-Elemente oder Dashboard-Links navigiert zu verwandten Ansichten, wobei der Kontext erhalten bleibt (Zeitbereich, Variablen).

**Bei Fehler:**
- Sonderzeichen in Abfrageparametern URL-kodieren
- Links mit verschiedenen Variablenauswahlen testen (All vs. spezifischer Wert)
- Pruefen, ob Ziel-Dashboard-UIDs vorhanden und zugaenglich sind
- Sicherstellen, dass `includeVars`- und `keepTime`-Flags wie erwartet funktionieren

### Schritt 6: Dashboard-Provisioning einrichten

Dashboards als Code versionieren fuer reproduzierbare Deployments.

Provisioning-Verzeichnisstruktur erstellen:

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

Datenquellen-Provisioning (`/etc/grafana/provisioning/datasources/prometheus.yml`):

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

Dashboard-Provisioning (`/etc/grafana/provisioning/dashboards/default.yml`):

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Services'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

Dashboard-JSON-Dateien in `/var/lib/grafana/dashboards/` speichern:

```bash
/var/lib/grafana/dashboards/
├── api-service/
│   ├── overview.json
│   └── details.json
├── database/
│   └── postgres.json
└── infrastructure/
    ├── nodes.json
    └── kubernetes.json
```

Mit Docker Compose:

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

**Erwartet:** Dashboards werden beim Grafana-Start automatisch geladen, Aenderungen an JSON-Dateien werden nach dem Aktualisierungsintervall uebernommen, Versionskontrolle verfolgt Dashboard-Aenderungen.

**Bei Fehler:**
- Grafana-Logs pruefen: `docker logs grafana | grep -i provisioning`
- JSON-Syntax validieren: `python -m json.tool dashboard.json`
- Dateiberechtigungen sicherstellen, dass Grafana lesen kann: `chmod 644 *.json`
- Mit `allowUiUpdates: false` testen, um UI-Aenderungen zu verhindern
- Provisioning-Konfiguration validieren: `curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## Validierung

- [ ] Dashboard laedt ohne Fehler in der Grafana-Benutzerflaeche
- [ ] Alle Template-Variablen werden mit erwarteten Werten befuellt
- [ ] Variablen-Kaskadierung funktioniert (Umgebung filtert Instanzen)
- [ ] Panels zeigen Daten fuer konfigurierte Zeitbereiche an
- [ ] Panel-Abfragen verwenden Variablen korrekt (keine fest codierten Werte)
- [ ] Schwellenwerte heben Problemzustaende angemessen hervor
- [ ] Legende beschreibend und uebersichtlich
- [ ] Annotationen erscheinen fuer relevante Ereignisse
- [ ] Links navigieren zu korrekten Dashboards mit erhaltenem Kontext
- [ ] Dashboard aus JSON-Datei provisioniert (versionskontrolliert)
- [ ] Responsives Layout funktioniert auf verschiedenen Bildschirmgroessen
- [ ] Tooltip- und Hover-Interaktionen bieten nuetzlichen Kontext

## Haeufige Stolperfallen

- **Variable aktualisiert Panels nicht**: Sicherstellen, dass Abfragen die `$variable`-Syntax verwenden, keine fest codierten Werte. Variablen-Refresh-Einstellungen pruefen.
- **Leere Panels mit korrekter Abfrage**: Pruefen, ob der Zeitbereich Datenpunkte enthaelt. Scrape-Intervall vs. Aggregationsfenster beachten (5m-Rate benoetigt >5m an Daten).
- **Zu ausfuehrliche Legende**: `legendFormat` verwenden, um nur relevante Labels anzuzeigen, nicht den vollstaendigen Metriknamen. Beispiel: `{{method}} - {{status}}` statt Standard.
- **Inkonsistente Zeitbereiche**: Dashboard-Zeitsynchronisation einstellen, damit alle Panels dasselbe Zeitfenster teilen. "Sync cursor" fuer korrelierte Untersuchungen verwenden.
- **Performance-Probleme**: Abfragen vermeiden, die hochkardinalitaere Serien zurueckgeben (>1000). Recording Rules oder Voraggregation verwenden. Zeitbereiche fuer aufwaendige Abfragen begrenzen.
- **Dashboard-Drift**: Ohne Provisioning fuehren manuelle UI-Aenderungen zu Versionskonflikten. In Produktion `allowUiUpdates: false` verwenden.
- **Fehlende Datenlinks**: Datenlinks benoetigen genaue Label-Namen. `${__field.labels.labelname}` sorgfaeltig verwenden und Label im Abfrageergebnis verifizieren.
- **Annotationsueberlastung**: Zu viele Annotationen trueben die Ansicht. Annotationen nach Wichtigkeit filtern oder separate Annotationsspuren verwenden.

## Verwandte Skills

- `setup-prometheus-monitoring` - Prometheus-Datenquellen konfigurieren, die Grafana-Dashboards speisen
- `configure-log-aggregation` - Loki fuer Log-Panel-Abfragen und Log-basierte Annotationen einrichten
- `define-slo-sli-sla` - SLO-Compliance und Fehlerbudgets mit Grafana-Stat- und Gauge-Panels visualisieren
- `instrument-distributed-tracing` - Trace-ID-Links von Metrik-Panels zu Tempo-Trace-Ansichten hinzufuegen
