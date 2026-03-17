---
name: plan-capacity
description: >
  Realiza planificación de capacidad usando métricas históricas y modelos de crecimiento.
  Usa predict_linear para pronósticos, identifica restricciones de recursos, calcula el
  margen disponible y recomienda acciones de escalado antes de la saturación. Útil antes
  de picos de tráfico estacionales o lanzamientos de productos, durante revisiones
  trimestrales de capacidad, cuando las tendencias de utilización de recursos van en
  aumento, o antes de los ciclos de planificación presupuestaria.
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
  tags: capacity-planning, forecasting, predict-linear, growth, headroom
---

# Planificar Capacidad

Pronostica las necesidades de recursos y previene la saturación mediante la planificación de capacidad basada en datos.

## Cuándo Usar

- Antes de picos de tráfico estacionales (festividades, eventos de ventas)
- Cuando se planifican nuevos lanzamientos de características
- Durante revisiones trimestrales de capacidad
- Cuando las tendencias de utilización de recursos van en aumento
- Antes de los ciclos de planificación presupuestaria

## Entradas

- **Requerido**: Métricas históricas (CPU, memoria, disco, red, solicitudes/seg)
- **Requerido**: Rango de tiempo para el análisis de tendencias (mínimo 4 semanas)
- **Opcional**: Proyecciones de crecimiento del negocio (crecimiento esperado de usuarios, lanzamientos de características)
- **Opcional**: Restricciones presupuestarias

## Procedimiento

### Paso 1: Recopilar Métricas Históricas

Consulta Prometheus para las métricas clave de recursos:

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

Exportar para análisis:

```bash
# Export 8 weeks of CPU data
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)' \
  --data-urlencode 'start=2024-12-15T00:00:00Z' \
  --data-urlencode 'end=2025-02-09T00:00:00Z' \
  --data-urlencode 'step=1h' | jq '.data.result' > cpu_8weeks.json
```

**Esperado:** Datos de series de tiempo limpios para cada recurso sin grandes lagunas.

**En caso de fallo:** Los datos faltantes reducen la precisión del pronóstico. Verificar la retención de métricas y los intervalos de recopilación.

### Paso 2: Calcular las Tasas de Crecimiento con predict_linear

Usa `predict_linear()` de Prometheus para pronosticar la saturación:

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

Crea un dashboard de pronóstico:

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

**Esperado:** Visualización clara que muestra cuándo los recursos superarán los umbrales.

**En caso de fallo:** Si las predicciones parecen incorrectas (valores negativos, oscilaciones drásticas), verificar:
- Historial insuficiente (se necesita un mínimo de 4 semanas)
- Picos escalonados (despliegues, migraciones) que distorsionan la tendencia
- Patrones estacionales no capturados por el modelo lineal

### Paso 3: Calcular el Margen Actual

Determina el margen de seguridad antes de la saturación:

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

Crea un informe de resumen del margen:

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

**Esperado:** Margen cuantificado para cada recurso con estimaciones de tiempo hasta la saturación.

**En caso de fallo:** Si el margen ya es negativo, estás en modo reactivo. Se necesita escalado inmediato.

### Paso 4: Modelar Escenarios de Crecimiento

Incorpora las proyecciones del negocio:

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

**Esperado:** Múltiples escenarios que muestran el impacto de los cambios en el negocio sobre la capacidad.

**En caso de fallo:** Si los escenarios superan la capacidad, priorizar el escalado antes del evento.

### Paso 5: Generar Recomendaciones de Escalado

Crea recomendaciones accionables:

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

**Esperado:** Lista priorizada con costos, cronogramas y condiciones desencadenantes.

**En caso de fallo:** Si las recomendaciones son rechazadas por costos, revisar los umbrales o aceptar el riesgo.

### Paso 6: Configurar Alertas de Capacidad

Crea alertas para el margen bajo:

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

**Esperado:** Las alertas se activan antes de la saturación, dando tiempo para escalar de forma proactiva.

**En caso de fallo:** Ajustar los umbrales si las alertas se activan con demasiada frecuencia (fatiga de alertas) o demasiado tarde (respuesta reactiva).

## Validación

- [ ] Las métricas históricas cubren al menos 8 semanas
- [ ] Las consultas `predict_linear()` devuelven pronósticos razonables (sin valores negativos)
- [ ] El margen se calcula para todos los recursos críticos
- [ ] Los escenarios de crecimiento incluyen proyecciones del negocio
- [ ] Las recomendaciones de escalado tienen costos y cronogramas
- [ ] Las alertas de capacidad están configuradas y probadas
- [ ] El informe fue revisado con el liderazgo de ingeniería y finanzas

## Errores Comunes

- **Historial insuficiente**: Las predicciones lineales necesitan más de 4 semanas de datos. Con menos, los pronósticos son poco confiables.
- **Ignorar los cambios escalonados**: Los despliegues, migraciones o lanzamientos de características crean picos que distorsionan las tendencias. Filtrar o anotar.
- **Suposición lineal**: No todo el crecimiento es lineal. El crecimiento exponencial (productos virales) necesita modelos diferentes.
- **Olvidar el tiempo de entrega**: El aprovisionamiento en la nube es rápido, pero la adquisición, los presupuestos y las migraciones toman semanas. Planificar con anticipación.
- **Sin alineación presupuestaria**: La planificación de capacidad sin aprobación presupuestaria conduce a prisas de último momento. Involucrar a finanzas desde el principio.

## Habilidades Relacionadas

- `setup-prometheus-monitoring` - recopilar las métricas utilizadas para la planificación de capacidad
- `build-grafana-dashboards` - visualizar pronósticos y márgenes
- `optimize-cloud-costs` - equilibrar la planificación de capacidad con la optimización de costos
