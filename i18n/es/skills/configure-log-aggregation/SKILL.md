---
name: configure-log-aggregation
description: >
  Configura la agregación centralizada de logs con Loki y Promtail (o el stack ELK),
  incluyendo análisis de logs, extracción de etiquetas, políticas de retención e
  integración con métricas para correlación. Útil para consolidar logs de múltiples
  servicios en un sistema con capacidad de búsqueda, reemplazar archivos de log locales
  con almacenamiento centralizado consultable, correlacionar logs con métricas y trazas,
  implementar registro estructurado con extracción de etiquetas, o solucionar incidentes
  de producción que requieren análisis de logs entre servicios.
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
  tags: loki, promtail, logging, elk, log-aggregation
---

# Configurar Agregación de Logs

Implementa recopilación, análisis y consulta centralizados de logs con Loki/Promtail o el stack ELK para visibilidad operacional.

## Cuándo Usar

- Consolidar logs de múltiples servicios o hosts en un sistema con capacidad de búsqueda
- Reemplazar archivos de log locales con almacenamiento de logs centralizado y consultable
- Correlacionar logs con métricas y trazas para observabilidad completa
- Implementar registro estructurado con extracción de etiquetas de logs no estructurados
- Establecer políticas de retención para datos de log según necesidades de almacenamiento y cumplimiento
- Solucionar incidentes de producción que requieren análisis de logs entre servicios

## Entradas

- **Requerido**: Fuentes de logs (logs de aplicación, logs del sistema, logs de contenedores)
- **Requerido**: Patrones de formato de log (JSON, texto plano, syslog, etc.)
- **Opcional**: Reglas de extracción de etiquetas para consultas estructuradas
- **Opcional**: Políticas de retención y compresión
- **Opcional**: Configuración existente de reenvío de logs (Fluentd, Filebeat, Promtail)

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Elegir el Stack de Agregación de Logs

Selecciona entre Loki (estilo Prometheus) o ELK (basado en Elasticsearch) según los requisitos.

**Ventajas de Loki**:
- Ligero, diseñado para entornos Kubernetes y nativos de la nube
- Indexación basada en etiquetas (como Prometheus) para baja sobrecarga de almacenamiento
- Integración nativa con Grafana para dashboards unificados
- Escalabilidad horizontal con almacenamiento de objetos (S3, GCS)
- Menor consumo de recursos comparado con Elasticsearch

**Ventajas de ELK**:
- Búsqueda de texto completo en todo el contenido de los logs (no solo etiquetas)
- DSL de consulta rico y agregaciones
- Ecosistema maduro con plugins de beats y logstash
- Mejor para logs de cumplimiento/auditoría que requieren búsqueda histórica profunda

Para esta guía, nos centraremos en **Loki + Promtail** (recomendado para la mayoría de configuraciones modernas).

Criterios de decisión:
```markdown
Use Loki if:
- You want label-based queries similar to Prometheus
- Storage costs are a concern (Loki indexes only labels)
- You already use Grafana for metrics
- Kubernetes/container-native deployment

Use ELK if:
- You need full-text search across all log content
- You have complex log parsing and enrichment requirements
- You require advanced analytics and aggregations
- Legacy systems with existing Logstash pipelines
```

**Esperado:** Elección clara tomada según los requisitos, el equipo descarga los artefactos de instalación apropiados.

**En caso de fallo:**
- Comparar requisitos de almacenamiento: Loki ~10x menos que Elasticsearch para los mismos logs
- Evaluar patrones de consulta: necesidad de búsqueda de texto completo vs filtrado por etiquetas
- Considerar la sobrecarga operacional: ELK requiere más ajuste y recursos

### Paso 2: Desplegar Loki

Instala y configura Loki con el backend de almacenamiento apropiado.

**Despliegue con Docker Compose** (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
```

**Configuración de Loki** (`loki-config.yml`):

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

Para **producción** con almacenamiento S3:

```yaml
storage_config:
  aws:
    s3: s3://us-east-1/my-loki-bucket
    s3forcepathstyle: true
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: s3
```

**Esperado:** Loki arranca correctamente, la verificación de salud pasa en `http://localhost:3100/ready`, los logs se almacenan según la política de retención.

**En caso de fallo:**
- Verificar los logs de Loki: `docker logs loki`
- Verificar que los directorios de almacenamiento existan y sean escribibles
- Probar la sintaxis de configuración: `docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- Asegurarse de que la configuración de retención no exceda la capacidad del disco
- Para S3: verificar permisos IAM y acceso al bucket

### Paso 3: Configurar Promtail para el Envío de Logs

Configura Promtail para recopilar logs y enviarlos a Loki con extracción de etiquetas.

**Configuración de Promtail** (`promtail-config.yml`):

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Conceptos clave de Promtail:
- **Scrape configs**: Define las fuentes de log y cómo descubrirlas
- **Pipeline stages**: Transforma y etiqueta los logs antes de enviarlos a Loki
- **Relabel configs**: Etiquetado dinámico basado en metadatos
- **Positions file**: Registra los desplazamientos de lectura para evitar re-procesar los logs

**Esperado:** Promtail recopila los archivos de log configurados, las etiquetas se aplican correctamente, los logs son visibles en Loki mediante consultas LogQL.

**En caso de fallo:**
- Verificar los logs de Promtail: `docker logs promtail`
- Verificar que las rutas de archivos sean accesibles: `docker exec promtail ls /var/log`
- Probar patrones de regex independientemente con líneas de log de muestra
- Monitorear las métricas de Promtail: `curl http://localhost:9080/metrics | grep promtail`
- Verificar el archivo de posiciones para el progreso: `cat /tmp/positions.yaml`

### Paso 4: Consultar Logs con LogQL

Aprende la sintaxis LogQL para filtrar y agregar logs.

**Consultas básicas**:

```logql
# All logs from a job
{job="app"}

# Logs with specific label values
{job="app", level="error"}

# Regex filter on log line content
{job="app"} |~ "authentication failed"

# Case-insensitive regex
{job="app"} |~ "(?i)error"

# Line filter (doesn't parse, just includes/excludes)
{job="app"} |= "user"  # Contains "user"
{job="app"} != "debug" # Doesn't contain "debug"
```

**Análisis y filtrado**:

```logql
# JSON parsing
{job="app"} | json | level="error"

# Regex parsing with named groups
{job="app"} | regexp "user_id=(?P<user_id>\\d+)" | user_id="12345"

# Logfmt parsing (key=value format)
{job="app"} | logfmt | level="error", service="auth"

# Pattern parsing
{job="nginx"} | pattern `<ip> - <user> [<timestamp>] "<method> <path> <protocol>" <status> <size>` | status >= 500
```

**Agregaciones** (métricas desde logs):

```logql
# Count log lines per level
sum by (level) (count_over_time({job="app"}[5m]))

# Rate of error logs
rate({job="app", level="error"}[5m])

# Bytes processed per service
sum by (service) (bytes_over_time({job="app"}[1h]))

# Average request duration from logs
avg_over_time({job="app"} | json | unwrap duration [5m])

# Top 10 error messages
topk(10, sum by (message) (count_over_time({level="error"} [1h])))
```

**Filtrado por campos extraídos**:

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

Crea consultas Explore de Grafana o paneles de dashboard usando estos patrones.

**Esperado:** Las consultas devuelven las líneas de log esperadas, el filtrado funciona correctamente, las agregaciones producen métricas desde logs.

**En caso de fallo:**
- Usar Grafana Explore para depurar consultas interactivamente
- Verificar los nombres de etiquetas: `curl http://localhost:3100/loki/api/v1/labels`
- Verificar los valores de etiquetas: `curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- Simplificar la consulta: comenzar con el selector de etiquetas básico, agregar filtros incrementalmente
- Verificar el rango de tiempo: los logs pueden no existir en la ventana seleccionada

### Paso 5: Integrar Logs con Métricas y Trazas

Correlaciona logs con métricas de Prometheus y trazas distribuidas para observabilidad unificada.

**Agregar IDs de traza a los logs** (instrumentación de aplicación):

```python
# Python with OpenTelemetry
import logging
from opentelemetry import trace

logger = logging.getLogger(__name__)

def handle_request():
    span = trace.get_current_span()
    trace_id = span.get_span_context().trace_id

    logger.info(
        "Processing request",
        extra={"trace_id": format(trace_id, "032x")}
    )
```

```go
// Go with OpenTelemetry
import (
    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
)

func handleRequest(ctx context.Context) {
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    logger.Info("Processing request",
        zap.String("trace_id", traceID),
    )
}
```

**Configurar vínculos de datos de Grafana** desde métricas a logs:

En la configuración de campo del panel de Prometheus:

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs",
          "url": "/explore?left={\"datasource\":\"Loki\",\"queries\":[{\"refId\":\"A\",\"expr\":\"{job=\\\"app\\\",instance=\\\"${__field.labels.instance}\\\"} |= `${__field.labels.trace_id}`\"}],\"range\":{\"from\":\"${__from}\",\"to\":\"${__to}\"}}",
          "targetBlank": false
        }
      ]
    }
  }
}
```

**Configurar vínculos de datos de Grafana** desde logs a trazas:

En la configuración de la fuente de datos de Loki:

```yaml
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100
    jsonData:
      derivedFields:
        - datasourceName: Tempo
          matcherRegex: "trace_id=(\\w+)"
          name: TraceID
          url: "$${__value.raw}"
```

**Correlacionar logs en Grafana Explore**:
1. Consultar métricas en Prometheus
2. Hacer clic en un punto de datos
3. Seleccionar "View Logs" del menú contextual
4. La consulta de Loki se completa automáticamente con etiquetas y rango de tiempo relevantes
5. Hacer clic en el ID de traza en los logs
6. Se abre la vista de traza de Tempo con la traza distribuida completa

**Esperado:** Al hacer clic en las métricas se abren los logs relacionados, los IDs de traza en los logs enlazan al visor de trazas, navegación en un solo panel para métricas/logs/trazas.

**En caso de fallo:**
- Verificar que el formato del ID de traza coincida con el regex en los campos derivados
- Verificar que la etiqueta trace_id fue extraída por el pipeline de Promtail
- Asegurarse de que la fuente de datos de Tempo esté configurada en Grafana
- Probar la codificación URL para expresiones de filtro complejas
- Validar las URL de vínculos de datos en una ventana del navegador de incógnito

### Paso 6: Configurar Retención y Compactación de Logs

Configura políticas de retención y compactación para gestionar los costos de almacenamiento.

**Retención por flujo** (en la configuración de Loki):

```yaml
limits_config:
  retention_period: 720h  # Global default: 30 days

  # Per-tenant retention (requires multi-tenancy enabled)
  per_tenant_override_config: /etc/loki/overrides.yaml

# overrides.yaml
overrides:
  production:
    retention_period: 2160h  # 90 days for production
  staging:
    retention_period: 360h   # 15 days for staging
  development:
    retention_period: 168h   # 7 days for dev
```

**Retención por etiquetas de flujo** (requiere compactador):

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

La prioridad determina qué regla se aplica cuando varias coinciden (número más bajo = mayor prioridad).

**Configuración de compresión**:

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**Monitorear la retención**:

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**Esperado:** Los logs antiguos se eliminan automáticamente según la política de retención, el uso de almacenamiento se estabiliza, la compactación reduce el tamaño del índice.

**En caso de fallo:**
- Habilitar el compactador en la configuración de Loki si la retención no funciona
- Verificar los logs del compactador: `docker logs loki | grep compactor`
- Verificar `retention_enabled: true` y `retention_deletes_enabled: true`
- Monitorear el uso de disco: `du -sh /loki/`
- Para S3: verificar que las políticas de ciclo de vida del bucket no entren en conflicto con la retención de Loki

## Validación

- [ ] La verificación de salud de la API de Loki devuelve 200: `curl http://localhost:3100/ready`
- [ ] Promtail recopila logs correctamente de todas las fuentes configuradas
- [ ] Las etiquetas se extraen correctamente de las líneas de log (visible en Grafana Explore)
- [ ] Las consultas LogQL devuelven resultados esperados con filtrado correcto
- [ ] La política de retención de logs se aplica (los logs antiguos se eliminan después del período de retención)
- [ ] Los logs son accesibles desde los dashboards de Grafana y la vista Explore
- [ ] Los IDs de traza de los logs enlazan al visor de trazas de Tempo
- [ ] Los paneles de métricas tienen vínculos de datos a logs relevantes
- [ ] La compactación se ejecuta y reduce la sobrecarga de almacenamiento
- [ ] El uso de almacenamiento está dentro del presupuesto asignado de disco/S3

## Errores Comunes

- **Etiquetas de alta cardinalidad**: Usar valores de etiquetas ilimitados (IDs de usuario, IDs de solicitud) provoca una explosión del índice. Usar etiquetas fijas (level, service, env) y colocar las variables en las líneas de log.
- **Análisis de logs faltante**: Enviar logs sin procesar sin extracción de etiquetas limita las capacidades de consulta. Siempre analizar logs estructurados (JSON, logfmt) o usar regex para los no estructurados.
- **Análisis de tiempo incorrecto**: Los formatos de marca de tiempo no coincidentes hacen que los logs estén fuera de orden o sean rechazados. Probar el análisis de marca de tiempo con logs de muestra.
- **Retención que no funciona**: El compactador debe estar habilitado para que la retención elimine datos antiguos. Verificar `retention_enabled: true` y `retention_deletes_enabled: true`.
- **Límites de tasa de ingesta**: Los límites predeterminados (10MB/s) pueden ser demasiado bajos para sistemas de alto volumen. Ajustar `ingestion_rate_mb` y `ingestion_burst_size_mb`.
- **Tiempos de espera de consulta**: Las consultas amplias en largos rangos de tiempo pueden agotar el tiempo de espera. Usar selectores de etiquetas más específicos y ventanas de tiempo más cortas.
- **Duplicación de logs**: Múltiples instancias de Promtail recopilando los mismos logs crean duplicados. Usar etiquetas únicas o coordinación del archivo de posiciones.

## Habilidades Relacionadas

- `correlate-observability-signals` - Depuración unificada entre métricas, logs y trazas usando IDs de traza
- `build-grafana-dashboards` - Visualizar métricas derivadas de logs y crear paneles de logs en dashboards
- `setup-prometheus-monitoring` - Las métricas proporcionan contexto sobre cuándo consultar logs durante incidentes
- `instrument-distributed-tracing` - Agregar IDs de traza a los logs para correlación con trazas distribuidas
