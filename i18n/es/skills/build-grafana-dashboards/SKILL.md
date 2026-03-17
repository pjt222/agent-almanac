---
name: build-grafana-dashboards
description: >
  Crea dashboards de Grafana listos para producción con paneles reutilizables, variables
  de plantilla, anotaciones y aprovisionamiento para despliegue controlado por versiones.
  Útil para crear representaciones visuales de métricas de Prometheus, Loki u otras
  fuentes de datos, construir dashboards operacionales para equipos SRE, migrar de
  creación manual a aprovisionamiento controlado por versiones, o establecer informes
  de cumplimiento SLO a nivel ejecutivo.
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
  tags: grafana, dashboards, visualization, panels, provisioning
---

# Construir Dashboards de Grafana

Diseña y despliega dashboards de Grafana con buenas prácticas de mantenibilidad, reutilización y control de versiones.

## Cuándo Usar

- Crear representaciones visuales de métricas de Prometheus, Loki u otras fuentes de datos
- Construir dashboards operacionales para equipos SRE y equipos de respuesta a incidentes
- Establecer dashboards de informes a nivel ejecutivo para cumplimiento de SLO
- Migrar dashboards de creación manual a aprovisionamiento controlado por versiones
- Estandarizar diseños de dashboards entre equipos con variables de plantilla
- Crear experiencias de desglose desde resúmenes generales hasta métricas detalladas

## Entradas

- **Requerido**: Configuración de fuente de datos (Prometheus, Loki, Tempo, etc.)
- **Requerido**: Métricas o logs a visualizar con sus patrones de consulta
- **Opcional**: Variables de plantilla para vistas de múltiples servicios o entornos
- **Opcional**: JSON de dashboard existente para migración o modificación
- **Opcional**: Consultas de anotación para correlación de eventos (despliegues, incidentes)

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Diseñar la Estructura del Dashboard

Planifica el diseño y la organización del dashboard antes de construir los paneles.

Crea un documento de especificación del dashboard:

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

Principios clave de diseño:
- **Métricas más importantes primero**: Métricas críticas en la parte superior, detalles abajo
- **Rangos de tiempo consistentes**: Sincronizar el tiempo entre todos los paneles
- **Rutas de desglose**: Enlazar desde resúmenes generales hasta dashboards detallados
- **Diseño adaptable**: Usar filas y anchos de panel que funcionen en varias pantallas

**Esperado:** Estructura de dashboard documentada claramente, partes interesadas alineadas en métricas y prioridades de diseño.

**En caso de fallo:**
- Realizar revisión del diseño del dashboard con usuarios finales (SREs, desarrolladores)
- Comparar con estándares de la industria (método USE, método RED, Four Golden Signals)
- Revisar dashboards existentes del equipo para patrones de consistencia

### Paso 2: Crear el Dashboard con Variables de Plantilla

Construye la base del dashboard con variables reutilizables para filtrado.

Crea la estructura JSON del dashboard (o usa la interfaz y luego exporta):

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

Tipos de variables y casos de uso:
- **Variables de consulta**: Listas dinámicas desde la fuente de datos (`label_values()`, `query_result()`)
- **Variables de intervalo**: Ventanas de agregación para consultas
- **Variables personalizadas**: Listas estáticas para selecciones no métricas
- **Variables constantes**: Valores compartidos entre paneles (nombres de fuentes de datos, umbrales)
- **Variables de caja de texto**: Entrada libre para filtrado

**Esperado:** Las variables se llenan correctamente desde la fuente de datos, los filtros en cascada funcionan (el entorno filtra instancias), las selecciones predeterminadas son apropiadas.

**En caso de fallo:**
- Probar consultas de variables independientemente en la interfaz de Prometheus
- Verificar dependencias circulares (variable A depende de B depende de A)
- Verificar patrones de regex en el campo `allValue` para variables de selección múltiple
- Revisar configuración de actualización de variables (al cargar el dashboard vs al cambiar el rango de tiempo)

### Paso 3: Construir Paneles de Visualización

Crea paneles para cada métrica con tipos de visualización apropiados.

**Panel de series de tiempo** (tasa de solicitudes):

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

**Panel estadístico** (tasa de errores):

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**Panel de mapa de calor** (distribución de latencia):

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

Guía de selección de paneles:
- **Series de tiempo**: Tendencias a lo largo del tiempo (tasas, conteos, duraciones)
- **Estadístico**: Valor actual único con coloración por umbrales
- **Medidor**: Valores porcentuales (CPU, memoria, uso de disco)
- **Medidor de barras**: Comparar múltiples valores en un punto en el tiempo
- **Mapa de calor**: Distribución de valores a lo largo del tiempo (percentiles de latencia)
- **Tabla**: Desglose detallado de múltiples métricas
- **Logs**: Líneas de log sin procesar de Loki con filtrado

**Esperado:** Los paneles se renderizan correctamente con datos, las visualizaciones coinciden con los tipos de métricas previstos, las leyendas son descriptivas, los umbrales resaltan problemas.

**En caso de fallo:**
- Probar consultas en la vista Explorar con el mismo rango de tiempo y variables
- Verificar errores tipográficos en nombres de métricas o filtros de etiquetas incorrectos
- Verificar que las funciones de agregación coincidan con el tipo de métrica (rate para contadores, avg para medidores)
- Revisar configuraciones de unidades (bytes, segundos, solicitudes por segundo)
- Habilitar "Show query inspector" para depurar resultados vacíos

### Paso 4: Configurar Filas y Diseño

Organiza los paneles en filas colapsables para agrupación lógica.

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

Buenas prácticas de diseño:
- La cuadrícula tiene 24 unidades de ancho, cada panel especifica `w` (ancho) y `h` (altura)
- Usa filas para agrupar paneles relacionados, colapsar secciones menos críticas por defecto
- Coloca las métricas más críticas en el primer área visible (y=0-8)
- Mantener alturas de panel consistentes dentro de las filas (típicamente 4, 8 o 12 unidades)
- Usa ancho completo (24) para series de tiempo, medio ancho (12) para comparaciones

**Esperado:** El diseño del dashboard está organizado lógicamente, las filas colapsan/expanden correctamente, los paneles se alinean visualmente sin espacios.

**En caso de fallo:**
- Validar que las coordenadas gridPos no se superpongan
- Verificar que el arreglo de paneles de fila contenga paneles (no nulo)
- Verificar que las coordenadas y incrementen lógicamente hacia abajo en la página
- Usar la interfaz de Grafana "Edit JSON" para inspeccionar posiciones de cuadrícula

### Paso 5: Agregar Vínculos y Desglose

Crea rutas de navegación entre dashboards relacionados.

Vínculos a nivel de dashboard en JSON:

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

Vínculos de datos a nivel de panel:

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

Variables de vínculos:
- `$service`, `$environment`: Variables de plantilla del dashboard
- `${__field.labels.instance}`: Valor de etiqueta desde el punto de datos clicado
- `${__from}`, `${__to}`: Rango de tiempo actual del dashboard
- `$__url_time_range`: Rango de tiempo codificado para URL

**Esperado:** Al hacer clic en elementos de paneles o vínculos del dashboard se navega a vistas relacionadas con el contexto preservado (rango de tiempo, variables).

**En caso de fallo:**
- Codificar en URL los caracteres especiales en parámetros de consulta
- Probar vínculos con varias selecciones de variables (Todas vs valor específico)
- Verificar que los UIDs de los dashboards de destino existan y sean accesibles
- Comprobar que los indicadores `includeVars` y `keepTime` funcionen según lo esperado

### Paso 6: Configurar el Aprovisionamiento del Dashboard

Controla los dashboards como código para despliegues reproducibles.

Crea la estructura de directorios de aprovisionamiento:

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

Aprovisionamiento de fuente de datos (`/etc/grafana/provisioning/datasources/prometheus.yml`):

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

Aprovisionamiento de dashboard (`/etc/grafana/provisioning/dashboards/default.yml`):

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

Almacena los archivos JSON del dashboard en `/var/lib/grafana/dashboards/`:

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

Usando Docker Compose:

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

**Esperado:** Los dashboards se cargan automáticamente al iniciar Grafana, los cambios en archivos JSON se reflejan después del intervalo de actualización, el control de versiones registra los cambios del dashboard.

**En caso de fallo:**
- Verificar los logs de Grafana: `docker logs grafana | grep -i provisioning`
- Verificar la sintaxis JSON: `python -m json.tool dashboard.json`
- Asegurarse de que los permisos de archivo permitan a Grafana leer: `chmod 644 *.json`
- Probar con `allowUiUpdates: false` para evitar modificaciones desde la interfaz
- Validar la configuración de aprovisionamiento: `curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## Validación

- [ ] El dashboard carga sin errores en la interfaz de Grafana
- [ ] Todas las variables de plantilla se llenan con los valores esperados
- [ ] La cascada de variables funciona (seleccionar entorno filtra instancias)
- [ ] Los paneles muestran datos para los rangos de tiempo configurados
- [ ] Las consultas de paneles usan variables correctamente (sin valores codificados)
- [ ] Los umbrales resaltan estados problemáticos apropiadamente
- [ ] El formato de leyenda es descriptivo y no está sobrecargado
- [ ] Las anotaciones aparecen para eventos relevantes
- [ ] Los vínculos navegan a dashboards correctos con el contexto preservado
- [ ] El dashboard está aprovisionado desde un archivo JSON (controlado por versiones)
- [ ] El diseño adaptable funciona en diferentes tamaños de pantalla
- [ ] Las interacciones de información en pantalla y al pasar el cursor proporcionan contexto útil

## Errores Comunes

- **Variable que no actualiza paneles**: Asegúrate de que las consultas usen la sintaxis `$variable`, no valores codificados. Verificar la configuración de actualización de variables.
- **Paneles vacíos con consulta correcta**: Verificar que el rango de tiempo incluya puntos de datos. Verificar el intervalo de recopilación frente a la ventana de agregación (la tasa de 5m necesita >5m de datos).
- **Leyenda demasiado verbosa**: Usar `legendFormat` para mostrar solo las etiquetas relevantes, no el nombre completo de la métrica. Ejemplo: `{{method}} - {{status}}` en lugar del predeterminado.
- **Rangos de tiempo inconsistentes**: Establecer sincronización de tiempo del dashboard para que todos los paneles compartan la misma ventana de tiempo. Usar "Sync cursor" para investigación correlacionada.
- **Problemas de rendimiento**: Evitar consultas que devuelvan series de alta cardinalidad (>1000). Usar reglas de grabación o pre-agregación. Limitar los rangos de tiempo para consultas costosas.
- **Deriva del dashboard**: Sin aprovisionamiento, los cambios manuales en la interfaz crean conflictos en el control de versiones. Usar `allowUiUpdates: false` en producción.
- **Vínculos de datos faltantes**: Los vínculos de datos requieren nombres de etiquetas exactos. Usar `${__field.labels.labelname}` con cuidado, verificar que la etiqueta existe en el resultado de la consulta.
- **Sobrecarga de anotaciones**: Demasiadas anotaciones saturan la vista. Filtrar anotaciones por importancia o usar pistas de anotación separadas.

## Habilidades Relacionadas

- `setup-prometheus-monitoring` - Configurar fuentes de datos de Prometheus que alimentan los dashboards de Grafana
- `configure-log-aggregation` - Configurar Loki para consultas de paneles de log y anotaciones basadas en log
- `define-slo-sli-sla` - Visualizar el cumplimiento de SLO y los presupuestos de error con paneles de estadísticas y medidores de Grafana
- `instrument-distributed-tracing` - Agregar vínculos de ID de traza desde paneles de métricas a vistas de traza de Tempo
