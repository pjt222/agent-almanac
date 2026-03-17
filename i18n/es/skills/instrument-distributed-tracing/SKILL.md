---
name: instrument-distributed-tracing
description: >
  Instrumenta aplicaciones con OpenTelemetry para rastreo distribuido, incluyendo
  instrumentación automática y manual, propagación de contexto, estrategias de muestreo
  e integración con Jaeger o Tempo. Útil para depurar problemas de latencia en sistemas
  distribuidos, comprender el flujo de solicitudes entre microservicios, correlacionar
  trazas con logs y métricas para análisis de causa raíz, medir la latencia de extremo a
  extremo, o migrar desde sistemas de rastreo heredados a OpenTelemetry.
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
  complexity: advanced
  language: multi
  tags: opentelemetry, tracing, jaeger, tempo, instrumentation
---

# Instrumentar Rastreo Distribuido

Implementa rastreo distribuido con OpenTelemetry para rastrear solicitudes entre microservicios e identificar cuellos de botella de rendimiento.

## Cuándo Usar

- Depurar problemas de latencia en sistemas distribuidos con múltiples servicios
- Comprender el flujo de solicitudes y las dependencias entre microservicios
- Identificar consultas lentas de base de datos o llamadas a APIs externas dentro de una transacción
- Correlacionar trazas con logs y métricas para análisis de causa raíz
- Medir la latencia de extremo a extremo desde la solicitud del usuario hasta la respuesta
- Migrar desde sistemas de rastreo heredados (Zipkin, Jaeger) a OpenTelemetry
- Establecer el cumplimiento de SLO mediante el seguimiento detallado de percentiles de latencia

## Entradas

- **Requerido**: Lista de servicios a instrumentar (lenguajes y frameworks)
- **Requerido**: Elección de backend de rastreo (Jaeger, Tempo, Zipkin, o SaaS de proveedor)
- **Opcional**: Bibliotecas de instrumentación existentes (OpenTracing, Zipkin)
- **Opcional**: Requisitos de estrategia de muestreo (porcentaje, limitación de tasa)
- **Opcional**: Atributos de span personalizados para metadatos específicos del negocio

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Configurar el Backend de Rastreo

Despliega Jaeger o Grafana Tempo para recibir y almacenar trazas.

**Opción A: Jaeger todo-en-uno** (desarrollo/pruebas):

```yaml
# docker-compose.yml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:1.51
    ports:
      - "5775:5775/udp"   # Zipkin compact thrift
      - "6831:6831/udp"   # Jaeger compact thrift
      - "6832:6832/udp"   # Jaeger binary thrift
      - "5778:5778"       # Serve configs
      - "16686:16686"     # Jaeger UI
      - "14268:14268"     # Jaeger HTTP thrift
      - "14250:14250"     # Jaeger GRPC
      - "9411:9411"       # Zipkin compatible endpoint
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
      - COLLECTOR_OTLP_ENABLED=true
    restart: unless-stopped
```

**Opción B: Grafana Tempo** (producción, escalable):

```yaml
# docker-compose.yml
version: '3.8'
services:
  tempo:
    image: grafana/tempo:2.3.0
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    ports:
      - "3200:3200"   # Tempo HTTP
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "9411:9411"   # Zipkin
    restart: unless-stopped

volumes:
  tempo-data:
```

**Configuración de Tempo** (`tempo.yaml`):

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md for complete configuration)
```

Para **producción con almacenamiento S3**:

```yaml
storage:
  trace:
    backend: s3
    s3:
      bucket: tempo-traces
      endpoint: s3.amazonaws.com
      region: us-east-1
    wal:
      path: /tmp/tempo/wal
    pool:
      max_workers: 100
      queue_depth: 10000
```

**Esperado:** Backend de rastreo accesible, listo para recibir trazas vía OTLP, la interfaz de Jaeger o Grafana muestra "no traces" inicialmente.

**En caso de fallo:**
- Verificar que los puertos no estén ya en uso: `netstat -tulpn | grep -E '(4317|16686|3200)'`
- Verificar los logs del contenedor: `docker logs jaeger` o `docker logs tempo`
- Probar el endpoint OTLP: `curl http://localhost:4318/v1/traces -v`
- Para Tempo: validar la sintaxis de configuración con `tempo -config.file=/etc/tempo.yaml -verify-config`

### Paso 2: Instrumentar Aplicaciones (Auto-Instrumentación)

Usa la auto-instrumentación de OpenTelemetry para frameworks comunes para minimizar cambios de código.

**Python con Flask**:

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

```python
# app.py
from flask import Flask
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
# ... (see EXAMPLES.md for complete configuration)
```

**Go con framework Gin**:

```bash
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/otel/sdk/trace
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

```go
package main

import (
    "context"
    "github.com/gin-gonic/gin"
    "go.opentelemetry.io/otel"
# ... (see EXAMPLES.md for complete configuration)
```

**Node.js con Express**:

```bash
npm install @opentelemetry/api \
            @opentelemetry/sdk-node \
            @opentelemetry/auto-instrumentations-node \
            @opentelemetry/exporter-trace-otlp-grpc
```

```javascript
// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las trazas de los servicios instrumentados aparecen en la interfaz de Jaeger o Grafana, las solicitudes HTTP crean spans automáticamente.

**En caso de fallo:**
- Verificar que el endpoint del exportador sea alcanzable desde la aplicación
- Verificar las variables de entorno: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- Habilitar el registro de depuración: `OTEL_LOG_LEVEL=debug` (Python), `OTEL_LOG_LEVEL=DEBUG` (Node.js)
- Probar con un span simple: crear manualmente un span para verificar el pipeline de exportación
- Verificar conflictos de versiones entre paquetes de OpenTelemetry

### Paso 3: Agregar Instrumentación Manual

Crea spans personalizados para lógica de negocio, consultas de base de datos y llamadas externas.

**Spans manuales en Python**:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md for complete configuration)
```

**Spans manuales en Go**:

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md for complete configuration)
```

**Buenas prácticas para atributos de span**:
- Usar convenciones semánticas: `http.method`, `http.status_code`, `db.system`, `db.statement`
- Agregar contexto de negocio: `user.id`, `order.id`, `product.category`
- Incluir identificadores de recursos: `instance.id`, `region`, `availability_zone`
- Registrar errores: `span.RecordError(err)` y `span.SetStatus(codes.Error, message)`
- Agregar eventos para hitos significativos: `span.AddEvent("cache_miss")`

**Esperado:** Los spans personalizados aparecen en la vista de traza, las relaciones padre-hijo son correctas, los atributos son visibles en los detalles del span, los errores están resaltados.

**En caso de fallo:**
- Verificar la propagación de contexto: el contexto del span padre se pasa al hijo
- Verificar que los nombres de span sean descriptivos y sigan las convenciones de nomenclatura
- Asegurarse de que los spans se terminan (usar `defer span.End()` en Go, bloques `with` en Python)
- Revisar los tipos de atributos: solo cadenas, enteros, booleanos, números de punto flotante
- Validar las convenciones semánticas: usar nombres de atributos estándar donde sea aplicable

### Paso 4: Implementar Propagación de Contexto

Asegúrate de que el contexto de traza fluya a través de los límites de servicio y operaciones asíncronas.

**Propagación de encabezados HTTP** (W3C Trace Context):

```python
# Client side (Python with requests)
import requests
from opentelemetry import trace
from opentelemetry.propagate import inject

tracer = trace.get_tracer(__name__)
# ... (see EXAMPLES.md for complete configuration)
```

```go
// Server side (Go with Gin)
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/propagation"
)

# ... (see EXAMPLES.md for complete configuration)
```

**Propagación de cola de mensajes** (Kafka):

```python
# Producer
from opentelemetry.propagate import inject
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

# ... (see EXAMPLES.md for complete configuration)
```

```python
# Consumer
from opentelemetry.propagate import extract

def process_message(msg):
    # Extract trace context from Kafka headers
    headers = {k: v.decode('utf-8') for k, v in msg.headers}
    ctx = extract(headers)

    # Continue the trace
    with tracer.start_as_current_span("process_order_event", context=ctx):
        order_id = json.loads(msg.value)['order_id']
        handle_order(order_id)
```

**Operaciones asíncronas** (Python asyncio):

```python
import asyncio
from opentelemetry import trace, context

async def async_operation():
    # Capture current context
    token = context.attach(context.get_current())
    try:
        with tracer.start_as_current_span("async_database_query"):
            await asyncio.sleep(0.1)  # Simulated async work
            return "result"
    finally:
        context.detach(token)
```

**Esperado:** Las trazas abarcan múltiples servicios, los IDs de traza son consistentes entre límites de servicio, las relaciones padre-hijo se preservan.

**En caso de fallo:**
- Verificar que el propagador de W3C Trace Context esté configurado: `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- Verificar que los encabezados se pasen en las solicitudes HTTP
- Para Kafka: asegurarse de que los encabezados sean soportados por la versión del broker (v0.11+)
- Depurar con inspección de encabezados: registrar el valor del encabezado `traceparent`
- Usar la visualización de trazas para identificar vínculos de traza rotos

### Paso 5: Configurar Estrategias de Muestreo

Implementa el muestreo para reducir el volumen de trazas y el costo mientras se mantiene la visibilidad.

**Estrategias de muestreo**:

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**Muestreo basado en cola con Tempo**:

Configurar en `tempo.yaml`:

```yaml
overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics]
      storage:
        path: /tmp/tempo/generator/wal
        remote_write:
          - url: http://prometheus:9090/api/v1/write
            send_exemplars: true

    # Tail sampling (requires tempo-query)
    ingestion_rate_limit_bytes: 5000000
    ingestion_burst_size_bytes: 10000000
```

Usar **TraceQL de Grafana Tempo** para muestreo dinámico:

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**Esperado:** El volumen de trazas se reduce al porcentaje objetivo, las trazas con errores siempre se muestrean, la decisión de muestreo es visible en los metadatos de la traza.

**En caso de fallo:**
- Verificar que el muestreador se aplique antes de la inicialización del proveedor de rastreo
- Verificar el atributo de decisión de muestreo en los spans exportados
- Para el muestreo de cola: asegurarse de que haya suficiente buffer (`ingestion_burst_size_bytes`)
- Monitorear las trazas descartadas: métrica `otel_traces_dropped_total`
- Probar con tráfico sintético de alto volumen para validar la tasa de muestreo

### Paso 6: Correlacionar Trazas con Métricas y Logs

Vincula las trazas con métricas y logs para observabilidad unificada.

**Agregar IDs de traza a logs** (Python):

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**Generar métricas desde trazas** (Tempo):

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md for complete configuration)
```

Esto genera métricas de Prometheus:
- `traces_service_graph_request_total` - recuento de solicitudes entre servicios
- `traces_span_metrics_duration_seconds` - histograma de duración de spans
- `traces_spanmetrics_calls_total` - recuentos de llamadas de span

**Consultar trazas desde métricas** (Grafana):

Agrega soporte de exemplar a la fuente de datos de Prometheus en Grafana:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    jsonData:
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceName: Tempo
```

En el dashboard de Grafana, habilitar los exemplares:

```json
{
  "fieldConfig": {
    "defaults": {
      "custom": {
        "showExemplars": true
      }
    }
  }
}
```

**Esperado:** Al hacer clic en los exemplares de métricas se abre la traza, los logs muestran los IDs de traza, las trazas enlazan a los logs, depuración unificada entre señales.

**En caso de fallo:**
- Verificar que el soporte de exemplares esté habilitado en Prometheus (requiere v2.26+)
- Verificar el formato del ID de traza (hex de 32 caracteres)
- Asegurarse de que el generador de métricas esté habilitado en la configuración de Tempo
- Validar que el endpoint de escritura remota sea accesible desde Tempo
- Probar consultas de exemplares: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## Validación

- [ ] El backend de rastreo recibe spans de todos los servicios instrumentados
- [ ] Las trazas muestran relaciones padre-hijo correctas entre servicios
- [ ] Los atributos de span incluyen convenciones semánticas y contexto de negocio
- [ ] El contexto se propaga correctamente a través de llamadas HTTP y colas de mensajes
- [ ] La estrategia de muestreo reduce el volumen de trazas al porcentaje objetivo
- [ ] Las trazas con errores siempre se muestrean (si se usa muestreo consciente de errores)
- [ ] Los IDs de traza aparecen en los logs de aplicación con el formato correcto
- [ ] Grafana muestra trazas vinculadas desde métricas mediante exemplares
- [ ] Los paneles de logs tienen vínculos de datos al visor de trazas
- [ ] La retención de trazas coincide con la política de almacenamiento configurada

## Errores Comunes

- **Contexto no propagado**: Olvidar pasar `context` a las llamadas posteriores rompe las trazas. Siempre pasar el contexto explícitamente.
- **Spans nunca terminados**: La falta de `defer span.End()` (Go) o bloques `with` (Python) causa que los spans permanezcan abiertos y pérdidas de memoria.
- **Sobre-instrumentación**: Crear spans para cada función causa inflación de trazas. Centrarse en los límites de servicio, llamadas de base de datos y APIs externas.
- **Falta de registro de errores**: No llamar a `span.RecordError()` pierde información valiosa de depuración. Siempre registrar errores en los spans.
- **Atributos de alta cardinalidad**: Usar valores ilimitados (IDs de usuario, cuerpos de solicitud) como atributos de span causa problemas de almacenamiento. Usar muestreo o etiquetas de agregación.
- **Tipo de span incorrecto**: Usar el tipo de span incorrecto (CLIENT vs SERVER vs INTERNAL) afecta la generación del gráfico de servicios. Seguir las convenciones semánticas.
- **Muestreo antes del contexto**: Las decisiones de muestreo deben respetar el contexto de traza padre. Usar el muestreador `ParentBased` para respetar el muestreo ascendente.

## Habilidades Relacionadas

- `correlate-observability-signals` - Depuración unificada con métricas, logs y trazas vinculadas por IDs de traza
- `setup-prometheus-monitoring` - Generar métricas desde trazas usando el generador de métricas de Tempo
- `configure-log-aggregation` - Agregar IDs de traza a los logs para correlación con trazas distribuidas
- `build-grafana-dashboards` - Visualizar métricas derivadas de trazas y vínculos de exemplares en dashboards
