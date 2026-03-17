---
name: define-slo-sli-sla
description: >
  Establece Objetivos de Nivel de Servicio (SLO), Indicadores de Nivel de Servicio (SLI)
  y Acuerdos de Nivel de Servicio (SLA) con seguimiento de presupuesto de error, alertas
  de tasa de quema y reportes automáticos usando Prometheus y herramientas como Sloth o
  Pyrra. Útil para definir objetivos de confiabilidad para servicios orientados al cliente,
  equilibrar la velocidad de entrega de características frente a la confiabilidad del
  sistema a través de presupuestos de error, migrar de objetivos arbitrarios de tiempo
  de actividad a métricas basadas en datos, o implementar prácticas de Ingeniería de
  Confiabilidad del Sitio (SRE).
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
  tags: slo, sli, sla, error-budget, burn-rate
---

# Definir SLO/SLI/SLA

Establece objetivos de confiabilidad medibles con Objetivos de Nivel de Servicio, rastréalos con indicadores y gestiona los presupuestos de error.

## Cuándo Usar

- Definir objetivos de confiabilidad para servicios o APIs orientados al cliente
- Establecer expectativas claras entre proveedores y consumidores de servicios
- Equilibrar la velocidad de entrega de características con la confiabilidad del sistema a través de presupuestos de error
- Crear criterios objetivos para la gravedad de incidentes y la respuesta
- Migrar de objetivos arbitrarios de tiempo de actividad a métricas de confiabilidad basadas en datos
- Implementar prácticas de Ingeniería de Confiabilidad del Sitio (SRE)
- Medir y mejorar la calidad del servicio a lo largo del tiempo

## Entradas

- **Requerido**: Descripción del servicio y recorridos críticos del usuario
- **Requerido**: Datos históricos de métricas (tasas de solicitud, latencias, tasas de error)
- **Opcional**: Compromisos de SLA existentes con los clientes
- **Opcional**: Requisitos de negocio para disponibilidad y rendimiento del servicio
- **Opcional**: Historial de incidentes y datos de impacto en los clientes

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Comprender la Jerarquía SLI, SLO y SLA

Aprende la relación y las diferencias entre estos tres conceptos.

**Definiciones**:

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

**Jerarquía**:
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**Principio clave**: El SLO debe ser **más estricto** que el SLA para proporcionar un margen antes del impacto en el cliente.

Ejemplo:
- **SLA**: 99.9% de disponibilidad (promesa al cliente)
- **SLO**: 99.95% de disponibilidad (objetivo interno)
- **Margen**: 0.05% de colchón antes de incumplir el SLA

**Esperado:** El equipo comprende las diferencias, acuerdo sobre qué métricas se convierten en SLIs, alineación en los objetivos de SLO.

**En caso de fallo:**
- Revisar los capítulos del libro SRE de Google sobre SLI/SLO/SLA
- Realizar un taller con las partes interesadas para alinear las definiciones
- Comenzar con un SLI simple de tasa de éxito antes de SLOs de latencia complejos

### Paso 2: Seleccionar SLIs Apropiados

Elige SLIs que reflejen la experiencia del usuario y el impacto en el negocio.

**Las Cuatro Señales Doradas** (Google SRE):

1. **Latencia**: Tiempo para servir una solicitud
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **Tráfico**: Demanda del sistema
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **Errores**: Tasa de solicitudes fallidas
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **Saturación**: Qué tan "lleno" está el sistema
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**Patrones comunes de SLI**:

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

**Criterios de selección de SLI**:
- **Visible para el usuario**: Refleja la experiencia real del usuario
- **Medible**: Se puede cuantificar a partir de métricas existentes
- **Accionable**: El equipo puede mejorarlo a través del trabajo de ingeniería
- **Significativo**: Correlaciona con la satisfacción del cliente
- **Simple**: Fácil de entender y explicar

Evitar:
- Métricas internas del sistema no visibles para los usuarios (CPU, memoria)
- Métricas de vanidad que no predicen el impacto en el cliente
- Puntuaciones compuestas excesivamente complejas

**Esperado:** 2-4 SLIs seleccionados por servicio, cubriendo al menos disponibilidad y latencia, acuerdo del equipo sobre las consultas de medición.

**En caso de fallo:**
- Trazar el recorrido del usuario para identificar puntos críticos de fallo
- Analizar el historial de incidentes: ¿qué métricas predijeron el impacto en el cliente?
- Validar el SLI con una prueba A/B: degradar la métrica, medir las quejas de los clientes
- Comenzar con un SLI simple de disponibilidad, agregar complejidad iterativamente

### Paso 3: Establecer Objetivos de SLO y Ventanas de Tiempo

Define objetivos de confiabilidad realistas y alcanzables.

**Formato de especificación de SLO**:

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**Selección de ventana de tiempo**:

Ventanas comunes:
- **30 días** (mensual): Típico para SLAs externos
- **7 días** (semanal): Retroalimentación más rápida para equipos de ingeniería
- **1 día** (diario): Servicios de alta frecuencia que requieren respuesta rápida

Ejemplo de presupuesto de error para ventana de 30 días:
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**Establecer objetivos realistas**:

1. **Establecer el rendimiento actual como línea base**:
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **Calcular el costo de los nueves**:
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **Equilibrar la satisfacción del usuario frente al costo de ingeniería**:
   - Demasiado estricto: costoso, ralentiza el desarrollo de características
   - Demasiado laxo: mala experiencia del usuario, abandono de clientes
   - **Punto óptimo**: Ligeramente mejor que las expectativas del usuario

**Esperado:** Objetivos de SLO establecidos con la aprobación de las partes interesadas del negocio, documentados con justificación, presupuesto de error calculado.

**En caso de fallo:**
- Comenzar con un objetivo alcanzable (p. ej., 99% si el actual es 98.5%)
- Iterar los objetivos de SLO trimestralmente basándose en el rendimiento real
- Obtener el patrocinio ejecutivo para objetivos realistas frente a exigencias de "cinco nueves"
- Documentar el análisis de costo-beneficio para cada nueve adicional

### Paso 4: Implementar el Monitoreo de SLO con Sloth

Usa Sloth para generar reglas de grabación y alertas de Prometheus desde especificaciones de SLO.

**Instalar Sloth**:

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**Crear la especificación de SLO de Sloth** (`slos/user-api.yml`):

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**Generar reglas de Prometheus**:

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**Reglas de grabación generadas** (extracto):

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**Alertas generadas**:

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**Cargar reglas en Prometheus**:

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

Recargar Prometheus:
```bash
curl -X POST http://localhost:9090/-/reload
```

**Esperado:** Sloth genera alertas de múltiples ventanas y múltiples tasas de quema, las reglas de grabación se evalúan correctamente, las alertas se activan apropiadamente durante los incidentes.

**En caso de fallo:**
- Validar la sintaxis YAML con `yamllint slos/user-api.yml`
- Verificar la compatibilidad de la versión de Sloth (se recomienda v0.11+)
- Verificar la evaluación de reglas de grabación de Prometheus: `curl http://localhost:9090/api/v1/rules`
- Probar con inyección sintética de errores para activar las alertas
- Verificar la documentación de Sloth para el formato de consulta de eventos SLI

### Paso 5: Construir Dashboards de Presupuesto de Error

Visualiza el cumplimiento de SLO y el consumo del presupuesto de error en Grafana.

**JSON del dashboard de Grafana** (extracto):

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**Métricas clave a visualizar**:
- Objetivo de SLO vs SLI actual
- Presupuesto de error restante (porcentaje y absoluto)
- Tasa de quema (qué tan rápido se está agotando el presupuesto)
- Tendencias históricas de SLI (ventana móvil de 30 días)
- Tiempo hasta el agotamiento (si continúa la tasa de quema actual)

**Panel de política de presupuesto de error** (panel markdown):

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Los dashboards muestran el cumplimiento de SLO en tiempo real, el agotamiento del presupuesto de error es visible, el equipo puede tomar decisiones informadas sobre la velocidad de entrega de características.

**En caso de fallo:**
- Verificar que las reglas de grabación existan: `curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- Verificar que la fuente de datos de Prometheus en Grafana tenga la URL correcta
- Validar los resultados de consulta en la vista Explore antes de agregar al dashboard
- Asegurarse de que el rango de tiempo esté configurado en la ventana apropiada (p. ej., 30d para SLOs mensuales)

### Paso 6: Establecer la Política de Presupuesto de Error

Define el proceso organizacional para gestionar los presupuestos de error.

**Plantilla de política de presupuesto de error**:

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**Automatizar el cumplimiento de políticas**:

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

Integrar en el pipeline de CI/CD:

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

**Esperado:** Política clara documentada, puertas automatizadas previenen despliegues riesgosos durante el agotamiento del presupuesto, alineación del equipo en las prioridades de confiabilidad.

**En caso de fallo:**
- Comenzar con cumplimiento manual de políticas (recordatorios de Slack)
- Automatizar gradualmente con puertas suaves (advertencias, no bloqueos)
- Obtener la aprobación ejecutiva antes de las puertas duras (despliegues bloqueados)
- Revisar la efectividad de la política trimestralmente, ajustar los umbrales según sea necesario

## Validación

- [ ] Los SLIs seleccionados reflejan la experiencia del usuario y el impacto en el negocio
- [ ] Los objetivos de SLO establecidos con acuerdo de las partes interesadas y justificación documentada
- [ ] Las reglas de grabación de Prometheus generan métricas de SLI correctamente
- [ ] Las alertas de múltiples tasas de quema configuradas y probadas con errores sintéticos
- [ ] Los dashboards de Grafana muestran el cumplimiento de SLO en tiempo real y el presupuesto de error
- [ ] La política de presupuesto de error documentada y comunicada al equipo
- [ ] Las puertas automatizadas previenen despliegues riesgosos durante el agotamiento del presupuesto
- [ ] Reuniones de revisión de SLO semanales/mensuales programadas
- [ ] Las retrospectivas de incidentes incluyen análisis de impacto en el SLO
- [ ] Los informes de cumplimiento de SLO se comparten con las partes interesadas

## Errores Comunes

- **SLOs demasiado estrictos**: Establecer "cinco nueves" sin análisis de costos lleva al agotamiento y ralentiza la velocidad de entrega de características. Comenzar alcanzable, iterar hacia arriba.
- **Demasiados SLIs**: Rastrear más de 10 indicadores crea confusión. Centrarse en 2-4 métricas críticas orientadas al usuario.
- **SLO sin margen de SLA**: Establecer el SLO igual al SLA no deja margen de error antes del impacto en el cliente. Mantener un margen de 0.05-0.1%.
- **Ignorar el presupuesto de error**: Rastrear SLOs pero no actuar sobre el agotamiento del presupuesto anula el propósito. Hacer cumplir la política de presupuesto de error.
- **Métricas de vanidad como SLIs**: Usar métricas internas (CPU, memoria) en lugar de métricas visibles para el usuario (latencia, errores) desalinea las prioridades.
- **Sin aprobación de las partes interesadas**: Los SLOs solo de ingeniería sin acuerdo de producto/negocio llevan a conflictos. Obtener patrocinio ejecutivo.
- **SLOs estáticos**: Nunca revisar ni ajustar los objetivos a medida que el sistema evoluciona. Revisitar trimestralmente basándose en el rendimiento real y los comentarios de los usuarios.

## Habilidades Relacionadas

- `setup-prometheus-monitoring` - Configurar Prometheus para recopilar métricas para el cálculo de SLI
- `configure-alerting-rules` - Integrar alertas de tasa de quema de SLO con Alertmanager para notificaciones de guardia
- `build-grafana-dashboards` - Visualizar el cumplimiento de SLO y el consumo del presupuesto de error
- `write-incident-runbook` - Incluir el impacto en el SLO en los manuales para priorizar la respuesta a incidentes
