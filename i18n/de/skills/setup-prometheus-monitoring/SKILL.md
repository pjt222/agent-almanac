---
name: setup-prometheus-monitoring
description: >
  Prometheus fuer die Erfassung von Zeitreihenkennzahlen konfigurieren, einschliesslich
  Scrape-Konfigurationen, Service Discovery, Aufzeichnungsregeln und Foederationsmustern
  fuer Multi-Cluster-Deployments. Verwenden beim Aufbau einer zentralen Metrikksammlung
  fuer Microservices, bei der Implementierung von Zeitreihen-Monitoring fuer Anwendungs-
  und Infrastrukturmetriken, beim Etablieren einer Grundlage fuer SLO/SLI-Tracking und
  Alerting oder bei der Migration von Legacy-Monitoring zu einem modernen Observability-Stack.
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
  tags: prometheus, monitoring, metrics, scrape, recording-rules
---

# Setup Prometheus Monitoring

Einen produktionsreifen Prometheus-Einsatz mit Scrape-Zielen, Aufzeichnungsregeln und Foederation konfigurieren.

## Wann verwenden

- Aufbau einer zentralen Metrikksammlung fuer Microservices oder verteilte Systeme
- Implementierung von Zeitreihen-Monitoring fuer Anwendungs- und Infrastrukturmetriken
- Etablierung einer Grundlage fuer SLO/SLI-Tracking und Alerting
- Zusammenfuehren von Metriken aus mehreren Prometheus-Instanzen per Foederation
- Migration von Legacy-Monitoring zu einem modernen Observability-Stack

## Eingaben

- **Erforderlich**: Liste der Scrape-Ziele (Dienste, Exporteure, Endpunkte)
- **Erforderlich**: Aufbewahrungszeitraum und Speicheranforderungen
- **Optional**: Vorhandener Service-Discovery-Mechanismus (Kubernetes, Consul, EC2)
- **Optional**: Aufzeichnungsregeln fuer voraggregierte Metriken
- **Optional**: Foederationshierarchie fuer Multi-Cluster-Setups

## Vorgehensweise

### Schritt 1: Prometheus installieren und konfigurieren

Grundkonfiguration von Prometheus mit globalen Einstellungen und Scrape-Intervallen erstellen.

```bash
# Prometheus-Verzeichnisstruktur anlegen
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

# Prometheus herunterladen (Version ggf. anpassen)
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

`/etc/prometheus/prometheus.yml` erstellen:

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanager-Konfiguration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# Aufzeichnungs- und Alerting-Regeln laden
rule_files:
  - "rules/*.yml"

# Scrape-Konfigurationen
scrape_configs:
  # Prometheus-Selbstmonitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  # Node Exporter fuer Host-Metriken
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

  # Anwendungsmetriken mit dateibasierter Service Discovery
  - job_name: 'app-services'
    file_sd_configs:
      - files:
          - '/etc/prometheus/file_sd/services.json'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [env]
        target_label: environment
```

**Erwartet:** Prometheus startet erfolgreich, Web-UI unter `http://localhost:9090` erreichbar, Ziele unter Status > Targets aufgelistet.

**Bei Fehler:**
- Syntax pruefen mit `promtool check config /etc/prometheus/prometheus.yml`
- Dateirechte pruefen: `sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- Logs pruefen: `journalctl -u prometheus -f`

### Schritt 2: Service Discovery konfigurieren

Dynamische Zielerkennung einrichten, um manuelle Zielverwaltung zu vermeiden.

Fuer **Kubernetes**-Umgebungen zu `scrape_configs` hinzufuegen:

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Nur Pods mit prometheus.io/scrape-Annotation scrapen
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Benutzerdefinierten Port verwenden, falls angegeben
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      # Namespace als Label hinzufuegen
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      # Pod-Name als Label hinzufuegen
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

Fuer **dateibasierte** Service Discovery `/etc/prometheus/file_sd/services.json` erstellen:

```json
[
  {
    "targets": ["web-app-1:8080", "web-app-2:8080"],
    "labels": {
      "job": "web-app",
      "env": "production",
      "team": "platform"
    }
  },
  {
    "targets": ["api-service-1:9090", "api-service-2:9090"],
    "labels": {
      "job": "api-service",
      "env": "production",
      "team": "backend"
    }
  }
]
```

Fuer **Consul** Service Discovery:

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []  # Leere Liste bedeutet alle Dienste entdecken
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

**Erwartet:** Dynamische Ziele erscheinen in der Prometheus-UI, werden automatisch aktualisiert, wenn Dienste skalieren oder sich aendern.

**Bei Fehler:**
- Kubernetes: RBAC-Berechtigungen pruefen mit `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus`
- File SD: JSON-Syntax pruefen mit `python -m json.tool /etc/prometheus/file_sd/services.json`
- Consul: Verbindung testen mit `curl http://consul.example.com:8500/v1/catalog/services`

### Schritt 3: Aufzeichnungsregeln erstellen

Teure Abfragen voraggregieren fuer Dashboard-Leistung und Alerting-Effizienz.

`/etc/prometheus/rules/recording_rules.yml` erstellen:

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      # Anfragerate pro Endpunkt berechnen (5-Minuten-Fenster)
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      # Fehlerrate in Prozent berechnen
      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

      # P95-Latenz pro Endpunkt
      - record: job:http_request_duration_seconds:p95
        expr: |
          histogram_quantile(0.95,
            sum by (job, endpoint, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )

  - name: resource_aggregations
    interval: 1m
    rules:
      # CPU-Auslastung pro Instanz
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # Speicherauslastung in Prozent
      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      # Festplattenauslastung pro Einhängepunkt
      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

Validieren und neu laden:

```bash
# Regelssyntax pruefen
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Prometheus-Konfiguration neu laden (ohne Neustart)
curl -X POST http://localhost:9090/-/reload

# Oder SIGHUP senden
sudo killall -HUP prometheus
```

**Erwartet:** Aufzeichnungsregeln werden erfolgreich ausgewertet, neue Metriken mit `job:`-Praefix in Prometheus sichtbar, Abfrageleistung fuer Dashboards verbessert.

**Bei Fehler:**
- Regelssyntax pruefen mit `promtool check rules`
- Auswertungsintervall auf Datenverfuegbarkeit abstimmen
- Fehlende Quellmetriken pruefen: `curl http://localhost:9090/api/v1/targets`
- Logs auf Auswertungsfehler pruefen: `journalctl -u prometheus | grep -i error`

### Schritt 4: Speicher und Aufbewahrung konfigurieren

Speicher fuer Aufbewahrungsanforderungen und Abfrageleistung optimieren.

`/etc/systemd/system/prometheus.service` bearbeiten:

```ini
[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --storage.tsdb.retention.time=30d \
  --storage.tsdb.retention.size=50GB \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=:9090 \
  --web.enable-lifecycle \
  --web.enable-admin-api

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

Wichtige Speicher-Flags:
- `--storage.tsdb.retention.time=30d`: 30 Tage Daten aufbewahren
- `--storage.tsdb.retention.size=50GB`: Speicher auf 50 GB begrenzen (welches Limit zuerst erreicht wird)
- `--storage.tsdb.wal-compression`: WAL-Komprimierung aktivieren (reduziert Festplatten-I/O)
- `--web.enable-lifecycle`: Konfigurationsneuladung per HTTP POST erlauben
- `--web.enable-admin-api`: Snapshot- und Loeschungs-APIs aktivieren

Aktivieren und starten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**Erwartet:** Prometheus bewahrt Metriken gemaess Richtlinie auf, Festplattennutzung bleibt innerhalb der Grenzen, alte Daten werden automatisch bereinigt.

**Bei Fehler:**
- Festplattennutzung ueberwachen: `du -sh /var/lib/prometheus`
- TSDB-Stats pruefen: `curl http://localhost:9090/api/v1/status/tsdb`
- Aufbewahrungseinstellungen pruefen: `curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- Bereinigung erzwingen: `curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### Schritt 5: Foederation einrichten (Multi-Cluster)

Hierarchisches Prometheus zum Aggregieren von Metriken ueber Cluster hinweg konfigurieren.

Auf **Edge-Prometheus**-Instanzen (in jedem Cluster) externe Labels sicherstellen:

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

Auf **zentraler Prometheus**-Instanz Foederations-Scrape-Konfiguration hinzufuegen:

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        # Nur vorab berechnete Aufzeichnungsregeln aggregieren
        - '{__name__=~"job:.*"}'
        # Alert-Zustände einschliessen
        - '{__name__=~"ALERTS.*"}'
        # Kritische Infrastrukturmetriken einschliessen
        - 'up{job=~".*"}'
    static_configs:
      - targets:
          - 'prometheus-east.example.com:9090'
          - 'prometheus-west.example.com:9090'
        labels:
          env: 'production'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [__address__]
        regex: 'prometheus-(.*).example.com.*'
        target_label: cluster
        replacement: '$1'
```

Foederations-Best-Practices:
- `honor_labels: true` verwenden, um urspruengliche Labels beizubehalten
- Nur Aufzeichnungsregeln und Aggregate foederieren (keine Rohmetriken)
- Geeignete Scrape-Intervalle setzen (laenger als Edge-Prometheus-Auswertung)
- `match[]` zum Filtern von Metriken verwenden (nicht alles foederieren)

**Erwartet:** Zentrales Prometheus zeigt foederierte Metriken aus allen Clustern, Abfragen koennen mehrere Regionen umspannen, minimale Datenduplizierung.

**Bei Fehler:**
- Foederationsendpunkt-Erreichbarkeit pruefen: `curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- Label-Konflikte pruefen (zentrale vs. Edge-externe Labels)
- Foederationsverzoegerung ueberwachen: Zeitstempel-Differenzen vergleichen
- Match-Muster pruefen: `curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### Schritt 6: Hochverfuegbarkeit implementieren (Optional)

Redundante Prometheus-Instanzen mit identischen Konfigurationen fuer Failover bereitstellen.

**Thanos** oder **Cortex** fuer echte HA oder einfaches lastverteiltes Setup:

```yaml
# prometheus-1.yml und prometheus-2.yml (identische Konfigurationen)
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'  # Unterschiedlich pro Instanz
    replica: 'A'

# --web.external-url-Flag fuer jede Instanz verwenden
# prometheus-1: --web.external-url=http://prometheus-1.example.com:9090
# prometheus-2: --web.external-url=http://prometheus-2.example.com:9090
```

Grafana konfigurieren, um beide Instanzen abzufragen:

```json
{
  "name": "Prometheus-HA",
  "type": "prometheus",
  "url": "http://prometheus-lb.example.com",
  "jsonData": {
    "httpMethod": "POST",
    "timeInterval": "15s"
  }
}
```

HAProxy oder nginx fuer Lastverteilung:

```nginx
upstream prometheus_backend {
    server prometheus-1.example.com:9090 max_fails=3 fail_timeout=30s;
    server prometheus-2.example.com:9090 max_fails=3 fail_timeout=30s;
}

server {
    listen 9090;
    location / {
        proxy_pass http://prometheus_backend;
        proxy_set_header Host $host;
    }
}
```

**Erwartet:** Anfragen werden auf Instanzen verteilt, automatisches Failover bei Ausfall einer Instanz, kein Datenverlust beim Ausfall einer Instanz.

**Bei Fehler:**
- Pruefen, ob beide Instanzen dieselben Ziele scrapen (leichte Zeitverschiebung akzeptabel)
- Konfigurationsabweichungen zwischen Instanzen pruefen
- Deduplizierung in Abfragen ueberwachen (Grafana zeigt doppelte Serien)
- Load-Balancer-Gesundheitspruefungen ueberpruefen

## Validierung

- [ ] Prometheus-Web-UI am erwarteten Endpunkt erreichbar
- [ ] Alle konfigurierten Scrape-Ziele zeigen Status UP unter Status > Targets
- [ ] Service Discovery fuegt/entfernt Ziele dynamisch wie erwartet
- [ ] Aufzeichnungsregeln werden erfolgreich ausgewertet (keine Fehler in Logs)
- [ ] Metrikaufbewahrung entspricht konfigurierten Zeit-/Groessenlimits
- [ ] Foederation (falls konfiguriert) zieht Metriken von Edge-Instanzen
- [ ] Abfragen geben erwartete Metrik-Kardinalitaet zurueck (nicht uebermassig)
- [ ] Festplattennutzung stabil und innerhalb des zugewiesenen Speicherbudgets
- [ ] Konfigurationsneuladung per HTTP-Endpunkt oder SIGHUP funktioniert
- [ ] Prometheus-Selbstmonitoring-Metriken verfuegbar (up, Scrape-Dauer etc.)

## Haeufige Stolperfallen

- **Hochkardinalitaetsmetriken**: Labels mit unbegrenzten Werten (Benutzer-IDs, Zeitstempel, UUIDs) vermeiden. Aufzeichnungsregeln zur Aggregation vor der Speicherung verwenden.
- **Scrape-Intervall-Abweichung**: Aufzeichnungsregeln sollten in Intervallen auswerten, die gleich oder groesser als Scrape-Intervalle sind, um Luecken zu vermeiden.
- **Foederationsueberlastung**: Foederierung aller Metriken erzeugt massive Datenduplizierung. Nur aggregierte Aufzeichnungsregeln foederieren.
- **Fehlende Relabel-Konfigurationen**: Ohne korrekte Relabelings kann Service Discovery verwirrende oder doppelte Labels erzeugen.
- **Zu kurze Aufbewahrung**: Aufbewahrung laenger als das laengste Dashboard-Zeitfenster setzen, um "Keine Daten"-Luecken zu vermeiden.
- **Keine Ressourcenlimits**: Prometheus kann bei hoher Kardinalitaet uebermassig Speicher verbrauchen. `--storage.tsdb.max-block-duration` setzen und Heap-Nutzung ueberwachen.
- **Deaktivierter Lifecycle-Endpunkt**: Ohne `--web.enable-lifecycle` erfordern Konfigurationsneuladungen vollstaendige Neustarts mit Scrape-Luecken.

## Verwandte Skills

- `configure-alerting-rules` - Alerting-Regeln basierend auf Prometheus-Metriken und Weiterleitung an Alertmanager definieren
- `build-grafana-dashboards` - Prometheus-Metriken mit Grafana-Dashboards und Panels visualisieren
- `define-slo-sli-sla` - SLO/SLI-Ziele mit Prometheus-Aufzeichnungsregeln und Fehlerbudget-Tracking etablieren
- `instrument-distributed-tracing` - Metriken durch verteiltes Tracing fuer tiefere Observability ergaenzen
