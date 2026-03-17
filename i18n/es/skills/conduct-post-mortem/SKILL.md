---
name: conduct-post-mortem
description: >
  Conduce un análisis post-mortem sin culpa después de un incidente. Construye la
  reconstrucción de la cronología, identifica los factores contribuyentes y genera
  mejoras accionables. Se centra en los problemas sistémicos en lugar de la culpa
  individual. Útil después de cualquier incidente de producción o degradación del
  servicio, tras un casi accidente, cuando se investigan problemas recurrentes, o
  para compartir aprendizajes sistémicos entre equipos.
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
  complexity: basic
  language: multi
  tags: post-mortem, incident-review, blameless, timeline, action-items
---

# Conducir Post-Mortem

Lidera un post-mortem sin culpa para aprender de los incidentes y mejorar la resiliencia del sistema.

## Cuándo Usar

- Después de cualquier incidente de producción o degradación del servicio
- Tras un casi accidente o situación de riesgo
- Cuando se investigan problemas recurrentes
- Para compartir aprendizajes entre equipos

## Entradas

- **Requerido**: Detalles del incidente (hora de inicio/fin, servicios afectados, gravedad)
- **Requerido**: Acceso a logs, métricas y alertas durante la ventana del incidente
- **Opcional**: Manual utilizado durante la respuesta al incidente
- **Opcional**: Registros de comunicación (Slack, PagerDuty)

## Procedimiento

### Paso 1: Recopilar Datos Sin Procesar

Reúne todos los artefactos del incidente:

```bash
# Export relevant logs (adjust timerange)
kubectl logs deployment/api-service \
  --since-time="2025-02-09T10:00:00Z" \
  --until-time="2025-02-09T11:30:00Z" > incident-logs.txt

# Export Prometheus metrics snapshot
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=rate(http_requests_total{job="api"}[5m])' \
  --data-urlencode 'start=2025-02-09T10:00:00Z' \
  --data-urlencode 'end=2025-02-09T11:30:00Z' \
  --data-urlencode 'step=15s' > metrics.json

# Export alert history
amtool alert query --within=2h alertname="HighErrorRate" --output json > alerts.json
```

**Esperado:** Logs, métricas y alertas que cubren la cronología completa del incidente.

**En caso de fallo:** Si los datos están incompletos, nota las lagunas en el informe. Configura una retención más larga para la próxima vez.

### Paso 2: Construir la Cronología

Crea una reconstrucción cronológica:

```markdown
## Timeline (all times UTC)

| Time     | Event | Source | Actor |
|----------|-------|--------|-------|
| 10:05:23 | First 5xx errors appear | nginx access logs | - |
| 10:06:45 | High error rate alert fires | Prometheus | - |
| 10:08:12 | On-call engineer paged | PagerDuty | System |
| 10:12:00 | Engineer acknowledges alert | PagerDuty | @alice |
| 10:15:30 | Database connection pool exhausted | app logs | - |
| 10:18:45 | Database queries identified as slow | pganalyze | @alice |
| 10:22:10 | Cache layer deployed as mitigation | kubectl | @alice |
| 10:35:00 | Error rate returns to normal | Prometheus | - |
| 10:40:00 | Incident marked resolved | PagerDuty | @alice |
```

**Esperado:** Una secuencia clara, minuto a minuto, que muestra qué ocurrió y cuándo.

**En caso de fallo:** Desajustes de marca de tiempo. Asegurarse de que todos los sistemas usen NTP y registren en UTC.

### Paso 3: Identificar los Factores Contribuyentes

Usa los Cinco Porqués o el análisis de espina de pescado:

```markdown
## Contributing Factors

### Immediate Cause
- Database connection pool exhausted (max 20 connections)
- Query introduced in v2.3.0 deployment lacked index

### Contributing Factors
1. **Monitoring Gap**: Connection pool utilization not monitored
2. **Testing Gap**: Load testing didn't include new query pattern
3. **Runbook Gap**: No documented procedure for DB connection issues
4. **Capacity Planning**: Pool size unchanged despite 3x traffic growth

### Systemic Issues
- No pre-deployment query plan review
- Database alerts only fire on total failure, not degradation
```

**Esperado:** Se identifican múltiples capas de causalidad, evitando la culpa.

**En caso de fallo:** Si el análisis se detiene en "el ingeniero cometió un error", profundizar más. ¿Qué permitió ese error?

### Paso 4: Generar Elementos de Acción

Crea mejoras concretas y rastreables:

```markdown
## Action Items

| ID | Action | Owner | Deadline | Priority |
|----|--------|-------|----------|----------|
| AI-001 | Add connection pool metrics to Grafana | @bob | 2025-02-16 | High |
| AI-002 | Create runbook: DB connection saturation | @alice | 2025-02-20 | High |
| AI-003 | Add DB query plan check to CI/CD | @charlie | 2025-03-01 | Medium |
| AI-004 | Review and adjust connection pool size | @dan | 2025-02-14 | High |
| AI-005 | Implement DB slow query alerts (<100ms) | @bob | 2025-02-23 | Medium |
| AI-006 | Add load testing for new query patterns | @charlie | 2025-03-15 | Low |
```

**Esperado:** Cada acción tiene un propietario, fecha límite y resultado claro.

**En caso de fallo:** Las acciones vagas como "mejorar las pruebas" no se completarán. Ser específico.

### Paso 5: Escribir y Distribuir el Informe

Usa esta estructura de plantilla:

```markdown
# Post-Mortem: API Service Degradation (2025-02-09)

**Date**: 2025-02-09
**Duration**: 1h 35min (10:05 - 11:40 UTC)
**Severity**: P1 (Critical service degraded)
**Authors**: @alice, @bob
**Reviewed**: 2025-02-10

## Summary
The API service experienced elevated error rates (40% of requests) due to
database connection pool exhaustion. Service was restored by deploying a
cache layer. No data loss occurred.

## Impact
- 40,000 failed requests over 1.5 hours
- 2,000 customers affected
- Revenue impact: ~$5,000 (estimated)

## Root Cause
Query introduced in v2.3.0 deployment performed a full table scan due to
missing index. Under increased load, this saturated the connection pool.

[... timeline, contributing factors, action items as above ...]

## What Went Well
- Alert fired within 90 seconds of first errors
- Mitigation deployed quickly (10 minutes from page to fix)
- Communication to customers was clear and timely

## Lessons Learned
- Database monitoring is insufficient; need connection-level metrics
- Load testing must cover new query patterns, not just volume
- Connection pool sizing hasn't kept pace with traffic growth

## Prevention
See Action Items above.
```

**Esperado:** El informe se comparte con el equipo y las partes interesadas dentro de las 48 horas posteriores al incidente.

**En caso de fallo:** Si los retrasos en el informe superan 1 semana, los aprendizajes pierden relevancia. Priorizar los post-mortems.

### Paso 6: Revisar los Elementos de Acción en las Reuniones/Retrospectivas

Rastrea el progreso de los elementos de acción:

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**Esperado:** Los elementos de acción se rastrean en la herramienta de gestión de proyectos, se revisan semanalmente.

**En caso de fallo:** Si los elementos de acción se estancan, los incidentes se repetirán. Asignar un patrocinador ejecutivo para los elementos de alta prioridad.

## Validación

- [ ] La cronología está completa y es cronológicamente precisa
- [ ] Se identifican múltiples factores contribuyentes (no solo uno)
- [ ] Los elementos de acción tienen propietarios, fechas límite y prioridades
- [ ] El informe usa lenguaje sin culpa (sin "X causó el problema")
- [ ] El informe se distribuyó a todas las partes interesadas dentro de las 48 horas
- [ ] Los elementos de acción se rastrean en el sistema de tickets
- [ ] Se programó una revisión de seguimiento para 4 semanas después

## Errores Comunes

- **Cultura de culpa**: Usar lenguaje de "quién" en lugar de "qué/por qué". Centrarse en los sistemas, no en las personas.
- **Análisis superficial**: Detenerse en la primera causa. Siempre preguntar "por qué" al menos 5 veces.
- **Elementos de acción vagos**: "Mejorar el monitoreo" no es accionable. "Agregar la métrica X al dashboard Y para la fecha Z" sí lo es.
- **Sin seguimiento**: Elementos de acción creados pero nunca revisados. Establecer recordatorios en el calendario.
- **Miedo a la transparencia**: Ocultar incidentes reduce el aprendizaje. Compartir ampliamente (dentro de los límites de seguridad apropiados).

## Habilidades Relacionadas

- `write-incident-runbook` - crear manuales referenciados durante los incidentes
- `configure-alerting-rules` - mejorar las alertas basándose en los hallazgos del post-mortem
