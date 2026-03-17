---
name: configure-alerting-rules
description: >
  Configura Prometheus Alertmanager con árboles de enrutamiento, receptores (Slack,
  PagerDuty, correo electrónico), reglas de inhibición, silencios y plantillas de
  notificación para alertas de incidentes accionables. Útil para implementar monitoreo
  proactivo con detección automatizada de incidentes, enrutar alertas al equipo
  apropiado según la gravedad, reducir la fatiga de alertas mediante agrupación y
  deduplicación, integrar con sistemas de guardia como PagerDuty, o migrar desde alertas
  heredadas a alertas basadas en Prometheus.
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
  tags: alertmanager, alerting, routing, pagerduty, slack
---

# Configurar Reglas de Alerta

Configura reglas de alerta de Prometheus y Alertmanager para notificaciones de incidentes confiables y accionables.

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

## Cuándo Usar

- Implementar monitoreo proactivo con detección automatizada de incidentes
- Enrutar alertas a los equipos apropiados según la gravedad y la propiedad del servicio
- Reducir la fatiga de alertas mediante agrupación y deduplicación inteligentes
- Integrar el monitoreo con sistemas de guardia (PagerDuty, Opsgenie)
- Establecer políticas de escalada para problemas críticos de producción
- Migrar desde sistemas de monitoreo heredados a alertas basadas en Prometheus
- Crear alertas accionables que guíen a los equipos de respuesta hacia la resolución

## Entradas

- **Requerido**: Métricas de Prometheus para alertar (tasas de error, latencia, saturación)
- **Requerido**: Rotación de guardia y políticas de escalada
- **Opcional**: Definiciones de alertas existentes para migrar
- **Opcional**: Canales de notificación (Slack, correo electrónico, PagerDuty)
- **Opcional**: Documentación de manual de procedimientos para alertas comunes

## Procedimiento

### Paso 1: Desplegar Alertmanager

Instala y configura Alertmanager para recibir alertas de Prometheus.

**Despliegue con Docker Compose** (estructura básica):

```yaml
version: '3.8'
services:
  alertmanager:
    image: prom/alertmanager:v0.26.0
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    # ... (see EXAMPLES.md for complete configuration)
```

**Configuración básica de Alertmanager** (extracto de `alertmanager.yml`):

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical

# ... (see EXAMPLES.md for complete routing, inhibition rules, and receivers)
```

**Configurar Prometheus para usar Alertmanager** (`prometheus.yml`):

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**Esperado:** Interfaz de Alertmanager accesible en `http://localhost:9093`, "Status > Alertmanagers" de Prometheus muestra estado UP.

**En caso de fallo:**
- Verificar los logs de Alertmanager: `docker logs alertmanager`
- Verificar que Prometheus pueda alcanzar Alertmanager: `curl http://alertmanager:9093/api/v2/status`
- Probar las URL de webhook: `curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- Validar la sintaxis YAML: `amtool check-config alertmanager.yml`

### Paso 2: Definir Reglas de Alerta en Prometheus

Crea reglas de alerta que se activen cuando se cumplan las condiciones.

**Crear el archivo de reglas de alerta** (extracto de `/etc/prometheus/rules/alerts.yml`):

```yaml
groups:
  - name: instance_alerts
    interval: 30s
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 5m
        labels:
          severity: critical
          team: infrastructure
        annotations:
          summary: "Instance {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} has been down for >5min."
          runbook_url: "https://wiki.example.com/runbooks/instance-down"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          # ... (see EXAMPLES.md for complete alerts)
```

**Buenas prácticas de diseño de alertas**:

- **Duración `for`**: Previene alertas intermitentes. Usar 5-10 minutos para la mayoría de las alertas.
- **Anotaciones descriptivas**: Incluir valor actual, recurso afectado y vínculo al manual.
- **Niveles de gravedad**: critical (llama al equipo de guardia), warning (investigar), info (para tu información)
- **Etiquetas de equipo**: Habilitar el enrutamiento al equipo/canal correcto
- **Vínculos a manuales**: Cada alerta debe tener una URL de manual

Cargar reglas en Prometheus:

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

Validar y recargar:

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**Esperado:** Las alertas son visibles en la página "Alerts" de Prometheus, las alertas se activan cuando se superan los umbrales, Alertmanager recibe las alertas activadas.

**En caso de fallo:**
- Verificar los logs de Prometheus para errores de evaluación de reglas
- Verificar la sintaxis de reglas con `promtool check rules`
- Probar las consultas de alerta independientemente en la interfaz de Prometheus
- Inspeccionar las transiciones de estado de alerta: Inactive → Pending → Firing

### Paso 3: Crear Plantillas de Notificación

Diseña mensajes de notificación legibles y accionables.

**Crear el archivo de plantilla** (extracto de `/etc/alertmanager/templates/default.tmpl`):

```gotmpl
{{ define "slack.default.title" }}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{ end }}

{{ define "slack.default.text" }}
{{ range .Alerts }}
*Alert:* {{ .Labels.alertname }}
*Severity:* {{ .Labels.severity }}
*Summary:* {{ .Annotations.summary }}
{{ if .Annotations.runbook_url }}*Runbook:* {{ .Annotations.runbook_url }}{{ end }}
{{ end }}
{{ end }}

# ... (see EXAMPLES.md for complete email and PagerDuty templates)
```

**Usar plantillas en receptores**:

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**Esperado:** Las notificaciones tienen formato consistente, incluyen todo el contexto relevante, son accionables con vínculos a manuales.

**En caso de fallo:**
- Probar el renderizado de plantillas: `amtool template test --config.file=alertmanager.yml`
- Verificar errores de sintaxis de plantillas en los logs de Alertmanager
- Usar `{{ . | json }}` para depurar la estructura de datos de la plantilla

### Paso 4: Configurar Enrutamiento y Agrupación

Optimiza la entrega de alertas con reglas de enrutamiento inteligentes.

**Configuración de enrutamiento avanzada** (extracto):

```yaml
route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s

  routes:
    - match:
        team: platform
      receiver: 'team-platform'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-platform'
          group_wait: 10s
          repeat_interval: 15m
          continue: true   # Also send to Slack

# ... (see EXAMPLES.md for complete routing with time intervals)
```

**Estrategias de agrupación**:

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**Esperado:** Las alertas se enrutan a los equipos correctos, agrupadas lógicamente, con timing apropiado para la gravedad.

**En caso de fallo:**
- Probar el enrutamiento: `amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- Verificar el árbol de enrutamiento: `amtool config routes show --config.file=alertmanager.yml`
- Verificar `continue: true` si la alerta debe coincidir con múltiples rutas

### Paso 5: Implementar Inhibición y Silenciado

Reduce el ruido de alertas con reglas de inhibición y silencios temporales.

**Reglas de inhibición** (suprimir alertas dependientes):

```yaml
inhibit_rules:
  # Cluster down suppresses all node alerts in that cluster
  - source_match:
      alertname: 'ClusterDown'
      severity: 'critical'
    target_match_re:
      alertname: '(InstanceDown|HighCPU|HighMemory)'
    equal: ['cluster']

  # Service down suppresses latency and error alerts
  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: '(HighLatency|HighErrorRate)'
    equal: ['service', 'namespace']

# ... (see EXAMPLES.md for more inhibition patterns)
```

**Crear silencios de forma programática**:

```bash
# Silence during maintenance
amtool silence add \
  instance=app-server-1 \
  --author="ops-team" \
  --comment="Scheduled maintenance" \
  --duration=2h

# List and manage silences
amtool silence query
amtool silence expire <SILENCE_ID>
```

**Esperado:** La inhibición reduce las alertas en cascada automáticamente, los silencios previenen notificaciones durante el mantenimiento planificado.

**En caso de fallo:**
- Probar la lógica de inhibición con alertas en vivo
- Verificar la pestaña "Silences" en la interfaz de Alertmanager
- Verificar que los matchers del silencio sean exactos (las etiquetas deben coincidir perfectamente)

### Paso 6: Integrar con Sistemas Externos

Conecta Alertmanager con PagerDuty, Opsgenie, Jira, etc.

**Integración con PagerDuty** (extracto):

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - routing_key: 'YOUR_INTEGRATION_KEY'
        severity: '{{ .CommonLabels.severity }}'
        description: '{{ range .Alerts.Firing }}{{ .Annotations.summary }}{{ end }}'
        details:
          firing: '{{ .Alerts.Firing | len }}'
          alertname: '{{ .GroupLabels.alertname }}'
        # ... (see EXAMPLES.md for complete integration examples)
```

**Webhook para integraciones personalizadas**:

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**Esperado:** Las alertas crean incidentes en PagerDuty, aparecen en los canales de comunicación del equipo, activan las escaladas de guardia.

**En caso de fallo:**
- Verificar que las claves/tokens de API sean válidos
- Verificar la conectividad de red a los servicios externos
- Probar los endpoints de webhook independientemente con curl
- Habilitar el modo de depuración: `--log.level=debug`

## Validación

- [ ] Alertmanager recibe alertas de Prometheus correctamente
- [ ] Las alertas se enrutan a los equipos correctos según etiquetas y gravedad
- [ ] Las notificaciones se entregan a Slack, correo electrónico o PagerDuty
- [ ] La agrupación de alertas reduce el volumen de notificaciones apropiadamente
- [ ] Las reglas de inhibición suprimen las alertas dependientes correctamente
- [ ] Los silencios previenen notificaciones durante las ventanas de mantenimiento
- [ ] Las plantillas de notificación incluyen vínculos a manuales y contexto
- [ ] El intervalo de repetición previene la fatiga de alertas para problemas de larga duración
- [ ] Las notificaciones de resolución se envían cuando las alertas se eliminan
- [ ] Las integraciones externas (PagerDuty, Opsgenie) crean incidentes

## Errores Comunes

- **Fatiga de alertas**: Demasiadas alertas de baja prioridad hacen que los equipos ignoren las críticas. Establecer umbrales estrictos, usar inhibición.
- **Falta de duración `for`**: Las alertas sin `for` se activan en picos transitorios. Siempre usar ventanas de 5-10 minutos.
- **Agrupación demasiado amplia**: Agrupar por `['...']` envía notificaciones individuales. Usar agrupación de etiquetas específica.
- **Sin vínculos a manuales**: Las alertas sin manuales dejan a los equipos adivinando. Cada alerta necesita una URL de manual.
- **Gravedad incorrecta**: Etiquetar advertencias como críticas desensibiliza al equipo. Reservar crítico para emergencias.
- **Silencios olvidados**: Los silencios sin expiración pueden ocultar problemas reales. Siempre establecer tiempos de fin.
- **Ruta única**: Todas las alertas a un canal pierde contexto. Usar enrutamiento específico por equipo.
- **Sin inhibición**: Las alertas en cascada durante interrupciones crean ruido. Implementar reglas de inhibición.

## Habilidades Relacionadas

- `setup-prometheus-monitoring` - Definir métricas y reglas de grabación que alimentan las reglas de alerta
- `define-slo-sli-sla` - Generar alertas de tasa de quema de SLO para la gestión del presupuesto de error
- `write-incident-runbook` - Crear manuales vinculados desde las anotaciones de alerta
- `build-grafana-dashboards` - Visualizar el historial de activación de alertas y patrones de silencio
