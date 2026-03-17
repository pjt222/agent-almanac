---
name: setup-prometheus-monitoring
description: >
  Configura Prometheus para la recopilación de métricas de series temporales, incluyendo
  configuraciones de scrape, descubrimiento de servicios, reglas de grabación y patrones
  de federación para despliegues en múltiples clústeres. Úsalo cuando configures la
  recopilación centralizada de métricas para microservicios, implementes monitorización
  de series temporales para aplicaciones e infraestructura, establezcas una base para el
  seguimiento de SLO/SLI y alertas, o migres desde soluciones de monitorización heredadas
  a una pila de observabilidad moderna.
locale: es
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

Configura un despliegue de Prometheus listo para producción con objetivos de scrape, reglas de grabación y federación.

## Cuándo Usar

- Al configurar la recopilación centralizada de métricas para microservicios o sistemas distribuidos
- Al implementar monitorización de series temporales para métricas de aplicaciones e infraestructura
- Al establecer una base para el seguimiento de SLO/SLI y alertas
- Al consolidar métricas de múltiples instancias de Prometheus mediante federación
- Al migrar desde soluciones de monitorización heredadas a una pila de observabilidad moderna

## Entradas

- **Obligatorio**: Lista de objetivos de scrape (servicios, exportadores, endpoints)
- **Obligatorio**: Período de retención y requisitos de almacenamiento
- **Opcional**: Mecanismo de descubrimiento de servicios existente (Kubernetes, Consul, EC2)
- **Opcional**: Reglas de grabación para métricas pre-agregadas
- **Opcional**: Jerarquía de federación para configuraciones de múltiples clústeres

## Procedimiento

### Paso 1: Instalar y Configurar Prometheus

Crea la configuración base de Prometheus con ajustes globales e intervalos de scrape.

```bash
# Create Prometheus directory structure
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

# Download Prometheus (adjust version as needed)
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

Crea `/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# Load recording and alerting rules
rule_files:
  - "rules/*.yml"

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  # Node exporter for host metrics
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

  # Application metrics with file-based service discovery
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

**Esperado:** Prometheus arranca correctamente, la interfaz web es accesible en `http://localhost:9090`, los objetivos aparecen en Status > Targets.

**En caso de fallo:**
- Verifica la sintaxis con `promtool check config /etc/prometheus/prometheus.yml`
- Verifica los permisos de archivo: `sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- Revisa los logs: `journalctl -u prometheus -f`

### Paso 2: Configurar el Descubrimiento de Servicios

Configura el descubrimiento dinámico de objetivos para evitar la gestión manual.

Para entornos de **Kubernetes**, añade a `scrape_configs`:

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Only scrape pods with prometheus.io/scrape annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Use custom port if specified
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      # Add namespace as label
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      # Add pod name as label
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

Para el descubrimiento de servicios **basado en archivos**, crea `/etc/prometheus/file_sd/services.json`:

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

Para el descubrimiento de servicios con **Consul**:

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []  # Empty list means discover all services
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

**Esperado:** Los objetivos dinámicos aparecen en la interfaz de Prometheus, actualizados automáticamente cuando los servicios escalan o cambian.

**En caso de fallo:**
- Kubernetes: Verifica permisos RBAC con `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus`
- File SD: Valida la sintaxis JSON con `python -m json.tool /etc/prometheus/file_sd/services.json`
- Consul: Prueba la conectividad con `curl http://consul.example.com:8500/v1/catalog/services`

### Paso 3: Crear Reglas de Grabación

Pre-agrega consultas costosas para mejorar el rendimiento de dashboards y la eficiencia de alertas.

Crea `/etc/prometheus/rules/recording_rules.yml`:

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      # Calculate request rate per endpoint (5m window)
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      # Calculate error rate percentage
      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

      # P95 latency by endpoint
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
      # CPU usage by instance
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # Memory usage percentage
      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      # Disk usage by mount point
      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

Valida y recarga:

```bash
# Validate rules syntax
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Reload Prometheus configuration (without restart)
curl -X POST http://localhost:9090/-/reload

# Or send SIGHUP signal
sudo killall -HUP prometheus
```

**Esperado:** Las reglas de grabación se evalúan correctamente, las nuevas métricas son visibles en Prometheus con el prefijo `job:`, el rendimiento de las consultas mejora para los dashboards.

**En caso de fallo:**
- Verifica la sintaxis de las reglas con `promtool check rules`
- Verifica que el intervalo de evaluación coincida con la disponibilidad de datos
- Busca métricas fuente faltantes: `curl http://localhost:9090/api/v1/targets`
- Revisa los logs para errores de evaluación: `journalctl -u prometheus | grep -i error`

### Paso 4: Configurar Almacenamiento y Retención

Optimiza el almacenamiento según los requisitos de retención y el rendimiento de consultas.

Edita `/etc/systemd/system/prometheus.service`:

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

Opciones clave de almacenamiento:
- `--storage.tsdb.retention.time=30d`: Conserva 30 días de datos
- `--storage.tsdb.retention.size=50GB`: Limita el almacenamiento a 50 GB (el que se alcance primero)
- `--storage.tsdb.wal-compression`: Habilita la compresión WAL (reduce E/S de disco)
- `--web.enable-lifecycle`: Permite la recarga de configuración mediante HTTP POST
- `--web.enable-admin-api`: Habilita las API de instantánea y eliminación

Activa e inicia:

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**Esperado:** Prometheus retiene métricas según la política, el uso de disco se mantiene dentro de los límites, los datos antiguos se eliminan automáticamente.

**En caso de fallo:**
- Monitoriza el uso de disco: `du -sh /var/lib/prometheus`
- Verifica las estadísticas de TSDB: `curl http://localhost:9090/api/v1/status/tsdb`
- Verifica los ajustes de retención: `curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- Fuerza la limpieza: `curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### Paso 5: Configurar la Federación (Multi-Clúster)

Configura Prometheus jerárquico para agregar métricas de múltiples clústeres.

En instancias de **Prometheus perimetral** (en cada clúster), asegúrate de que las etiquetas externas estén configuradas:

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

En la instancia de **Prometheus central**, añade la configuración de scrape de federación:

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        # Aggregate only pre-computed recording rules
        - '{__name__=~"job:.*"}'
        # Include alert states
        - '{__name__=~"ALERTS.*"}'
        # Include critical infrastructure metrics
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

Buenas prácticas de federación:
- Usa `honor_labels: true` para preservar las etiquetas originales
- Federa solo reglas de grabación y agregados (no métricas en bruto)
- Establece intervalos de scrape apropiados (mayores que la evaluación del Prometheus perimetral)
- Usa `match[]` para filtrar métricas (evita federar todo)

**Esperado:** El Prometheus central muestra métricas federadas de todos los clústeres, las consultas pueden abarcar múltiples regiones, duplicación mínima de datos.

**En caso de fallo:**
- Verifica la accesibilidad del endpoint de federación: `curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- Comprueba conflictos de etiquetas (etiquetas externas central vs. perimetral)
- Monitoriza el retraso de federación: compara diferencias de marcas de tiempo
- Revisa los patrones de coincidencia: `curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### Paso 6: Implementar Alta Disponibilidad (Opcional)

Despliega instancias redundantes de Prometheus con configuraciones idénticas para conmutación por error.

Usa **Thanos** o **Cortex** para HA real, o una configuración simple con balanceador de carga:

```yaml
# prometheus-1.yml and prometheus-2.yml (identical configs)
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'  # Different per instance
    replica: 'A'

# Use --web.external-url flag for each instance
# prometheus-1: --web.external-url=http://prometheus-1.example.com:9090
# prometheus-2: --web.external-url=http://prometheus-2.example.com:9090
```

Configura Grafana para consultar ambas instancias:

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

Usa HAProxy o nginx para el balanceo de carga:

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

**Esperado:** Las solicitudes de consulta se distribuyen entre instancias, conmutación automática por error si una instancia cae, sin pérdida de datos durante el fallo de una sola instancia.

**En caso de fallo:**
- Verifica que ambas instancias rastrean los mismos objetivos (pequeña desincronización temporal es aceptable)
- Comprueba la deriva de configuración entre instancias
- Monitoriza la deduplicación en consultas (Grafana muestra series duplicadas)
- Revisa las verificaciones de salud del balanceador de carga

## Validación

- [ ] La interfaz web de Prometheus es accesible en el endpoint esperado
- [ ] Todos los objetivos de scrape configurados aparecen como UP en Status > Targets
- [ ] El descubrimiento de servicios añade/elimina objetivos dinámicamente según lo esperado
- [ ] Las reglas de grabación se evalúan correctamente (sin errores en los logs)
- [ ] La retención de métricas coincide con los límites de tiempo/tamaño configurados
- [ ] La federación (si está configurada) extrae métricas de las instancias perimetrales
- [ ] Las consultas devuelven la cardinalidad de métricas esperada (no excesiva)
- [ ] El uso de disco es estable y dentro del presupuesto de almacenamiento asignado
- [ ] La recarga de configuración funciona mediante el endpoint HTTP o SIGHUP
- [ ] Las métricas de auto-monitorización de Prometheus están disponibles (up, duración de scrape, etc.)

## Errores Comunes

- **Métricas de alta cardinalidad**: Evita etiquetas con valores ilimitados (IDs de usuario, marcas de tiempo, UUIDs). Usa reglas de grabación para agregar antes del almacenamiento.
- **Desajuste de intervalos de scrape**: Las reglas de grabación deben evaluarse en intervalos iguales o mayores que los intervalos de scrape para evitar huecos.
- **Sobrecarga de federación**: Federar todas las métricas crea una duplicación masiva de datos. Federa solo reglas de grabación agregadas.
- **Falta de configuraciones de reescritura de etiquetas**: Sin reescritura adecuada, el descubrimiento de servicios puede crear etiquetas confusas o duplicadas.
- **Retención demasiado corta**: Establece la retención mayor que la ventana de tiempo del dashboard más largo para evitar huecos de "sin datos".
- **Sin límites de recursos**: Prometheus puede consumir memoria excesiva con alta cardinalidad. Establece `--storage.tsdb.max-block-duration` y monitoriza el uso de heap.
- **Endpoint de ciclo de vida deshabilitado**: Sin `--web.enable-lifecycle`, las recargas de configuración requieren reinicios completos causando huecos en el scrape.

## Habilidades Relacionadas

- `configure-alerting-rules` - Define reglas de alerta basadas en métricas de Prometheus y las enruta a Alertmanager
- `build-grafana-dashboards` - Visualiza métricas de Prometheus con dashboards y paneles de Grafana
- `define-slo-sli-sla` - Establece objetivos SLO/SLI usando reglas de grabación de Prometheus y seguimiento del presupuesto de errores
- `instrument-distributed-tracing` - Complementa las métricas con trazado distribuido para una observabilidad más profunda
