---
name: write-incident-runbook
description: >
  Crea manuales de incidentes estructurados con pasos de diagnóstico, procedimientos de
  resolución, rutas de escalada y plantillas de comunicación para una respuesta efectiva a
  incidentes. Útil para documentar procedimientos de respuesta para alertas recurrentes,
  estandarizar la respuesta a incidentes en una rotación de guardia, reducir el MTTR con
  pasos de diagnóstico claros, crear materiales de formación para nuevos miembros del
  equipo, o vincular anotaciones de alerta directamente a procedimientos de resolución.
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
  tags: runbook, incident-response, diagnostics, escalation, documentation
---

# Escribir Manual de Incidentes

Crea manuales accionables que guíen a los equipos de respuesta a través del diagnóstico y la resolución de incidentes.

## Cuándo Usar

- Documentar procedimientos de respuesta para alertas o incidentes recurrentes
- Estandarizar la respuesta a incidentes entre los miembros de la rotación de guardia
- Reducir el tiempo medio de resolución (MTTR) con pasos de diagnóstico claros
- Crear materiales de formación para nuevos miembros del equipo en el manejo de incidentes
- Establecer rutas de escalada y protocolos de comunicación
- Migrar el conocimiento tribal a documentación escrita
- Vincular alertas a procedimientos de resolución (anotaciones de alerta)

## Entradas

- **Requerido**: Nombre/descripción del incidente o alerta
- **Requerido**: Datos históricos de incidentes y patrones de resolución
- **Opcional**: Consultas de diagnóstico (Prometheus, logs, trazas)
- **Opcional**: Contactos de escalada y canales de comunicación
- **Opcional**: Post-mortems de incidentes anteriores

## Procedimiento

### Paso 1: Elegir la Estructura de Plantilla del Manual

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-1-runbook-template-examples) para archivos de plantilla completos.

Selecciona una plantilla apropiada según el tipo y la complejidad del incidente.

**Estructura básica de plantilla de manual**:
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**Plantilla avanzada de manual SRE** (extracto):
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

Componentes clave de la plantilla:
- **Metadatos**: Propiedad del servicio, gravedad, rotación de guardia
- **Fase de diagnóstico**: Verificaciones rápidas → investigación detallada → patrones de fallo
- **Fase de resolución**: Mitigación inmediata → corrección de causa raíz → verificación
- **Escalada**: Criterios y rutas de contacto
- **Comunicación**: Plantillas internas/externas
- **Prevención**: Acciones a corto/largo plazo

**Esperado:** La plantilla seleccionada coincide con la complejidad del incidente, las secciones son apropiadas para el tipo de servicio.

**En caso de fallo:**
- Comenzar con la plantilla básica, iterar basándose en los patrones del incidente
- Revisar ejemplos de la industria (libros SRE de Google, manuales de proveedores)
- Adaptar la plantilla basándose en los comentarios del equipo después del primer uso

### Paso 2: Documentar los Procedimientos de Diagnóstico

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-2-complete-diagnostic-procedures) para consultas de diagnóstico completas y árboles de decisión.

Crea procedimientos de investigación paso a paso con consultas específicas.

**Lista de verificación de diagnóstico de seis pasos**:

1. **Verificar la salud del servicio**: Verificaciones del endpoint de salud y métricas de tiempo de actividad
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **Verificar la tasa de errores**: Porcentaje de error actual y desglose por endpoint
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **Analizar los logs**: Errores recientes y mensajes de error principales desde Loki
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **Verificar la utilización de recursos**: Estado de CPU, memoria y pool de conexiones
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **Revisar los cambios recientes**: Despliegues, commits de git, cambios de infraestructura

6. **Examinar las dependencias**: Salud del servicio descendente, latencia de base de datos/API

**Árbol de decisión de patrones de fallo** (extracto):
- ¿Servicio caído? → Verificar todos los pods/instancias
- ¿Tasa de error elevada? → Verificar tipos de error específicos (5xx, gateway, base de datos, timeouts)
- ¿Cuándo comenzó? → Después del despliegue (rollback), gradual (fuga de recursos), repentino (tráfico/dependencia)

**Esperado:** Los procedimientos de diagnóstico son específicos, incluyen valores esperados vs actuales, guían al equipo de respuesta a través de la investigación.

**En caso de fallo:**
- Probar las consultas en el sistema de monitoreo real antes de documentarlas
- Incluir capturas de pantalla de dashboards para referencia visual
- Agregar una sección de "Errores comunes" para pasos frecuentemente omitidos
- Iterar basándose en los comentarios de los equipos de respuesta a incidentes

### Paso 3: Definir los Procedimientos de Resolución

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-3-complete-resolution-procedures) para las 5 opciones de resolución con comandos completos y procedimientos de reversión.

Documenta la remediación paso a paso con opciones de reversión.

**Cinco opciones de resolución** (resumen breve):

1. **Revertir el despliegue** (más rápido): Para errores post-despliegue
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   Verificar → Monitorear → Confirmar resolución (tasa de error < 1%, latencia normal, sin alertas)

2. **Escalar recursos**: Para alta CPU/memoria, agotamiento del pool de conexiones
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **Reiniciar el servicio**: Para fugas de memoria, conexiones bloqueadas, corrupción de caché
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **Feature Flag / Circuit Breaker**: Para errores de características específicas o fallos de dependencias externas
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **Remediación de base de datos**: Para conexiones de base de datos, consultas lentas, agotamiento del pool
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**Lista de verificación de verificación universal**:
- [ ] Tasa de error < 1%
- [ ] Latencia P99 < umbral
- [ ] Rendimiento en la línea base
- [ ] Uso de recursos saludable (CPU < 70%, Memoria < 80%)
- [ ] Dependencias saludables
- [ ] Pruebas orientadas al usuario pasan
- [ ] Sin alertas activas

**Procedimiento de reversión**: Si la resolución empeora la situación → pausar/cancelar → revertir → reevaluar

**Esperado:** Los pasos de resolución son claros, incluyen verificaciones de verificación, proporcionan opciones de reversión para cada acción.

**En caso de fallo:**
- Agregar pasos más detallados para procedimientos complejos
- Incluir capturas de pantalla o diagramas para procesos de múltiples pasos
- Documentar las salidas de comandos (esperadas vs actuales)
- Crear un manual separado para procedimientos de resolución complejos

### Paso 4: Establecer las Rutas de Escalada

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-4-complete-escalation-guidelines) para niveles de escalada completos y plantilla de directorio de contactos.

Define cuándo y cómo escalar los incidentes.

**Cuándo escalar inmediatamente**:
- Interrupción orientada al cliente > 15 minutos
- Presupuesto de error de SLO > 10% agotado
- Pérdida/corrupción de datos o sospecha de brecha de seguridad
- No se puede identificar la causa raíz en 20 minutos
- Los intentos de mitigación fallan o empeoran la situación

**Cinco niveles de escalada**:
1. **Guardia primario** (respuesta en 5 min): Desplegar correcciones, rollback, escalar (hasta 30 min solo)
2. **Guardia secundario** (automático después de 15 min): Soporte adicional de investigación
3. **Líder de equipo** (decisiones arquitectónicas): Cambios de base de datos, escalada de proveedor, incidentes > 1 hora
4. **Comandante de incidente** (coordinación entre equipos): Múltiples equipos, comunicaciones con clientes, incidentes > 2 horas
5. **Ejecutivo** (nivel C): Gran impacto (>50% usuarios), incumplimiento de SLA, medios/PR, interrupciones > 4 horas

**Proceso de escalada**:
1. Notificar al destinatario con: estado actual, impacto, acciones tomadas, ayuda necesaria, vínculo al dashboard
2. Traspaso si es necesario: compartir cronología, acciones, acceso, permanecer disponible
3. No guardar silencio: actualizar cada 15 min, hacer preguntas, proporcionar retroalimentación

**Directorio de contactos**: Mantener una tabla con rol, Slack, teléfono, PagerDuty para:
- Equipos de Plataforma/Base de datos/Seguridad/Red
- Comandante de incidente
- Proveedores externos (AWS, proveedor de base de datos, proveedor de CDN)

**Esperado:** Criterios claros para la escalada, información de contacto fácilmente accesible, rutas de escalada alineadas con la estructura organizacional.

**En caso de fallo:**
- Validar que la información de contacto esté actualizada (probar trimestralmente)
- Agregar árbol de decisión para cuándo escalar
- Incluir ejemplos de mensajes de escalada
- Documentar las expectativas de tiempo de respuesta para cada nivel

### Paso 5: Crear Plantillas de Comunicación

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-5-complete-communication-templates) para todas las plantillas internas y externas con formato completo.

Proporciona mensajes pre-escritos para actualizaciones de incidentes.

**Plantillas internas** (Slack #incident-response):

1. **Declaración inicial**:
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **Actualización de progreso** (cada 15-30 min):
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **Mitigación completada**:
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **Resolución**:
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **Falsa alarma**: Sin impacto, sin seguimiento necesario

**Plantillas externas** (página de estado):
- **Inicial**: Investigando, hora de inicio, próxima actualización en 15 min
- **Progreso**: Causa identificada (amigable para el cliente), implementando corrección, resolución estimada
- **Resolución**: Hora de resolución, causa raíz (simple), duración, medidas de prevención

**Plantilla de correo electrónico para clientes**: Cronología, descripción del impacto, resolución, prevención, compensación (si aplica)

**Esperado:** Las plantillas ahorran tiempo durante los incidentes, garantizan comunicación consistente, reducen la carga cognitiva en los equipos de respuesta.

**En caso de fallo:**
- Personalizar las plantillas para que coincidan con el estilo de comunicación de la empresa
- Pre-completar las plantillas con tipos de incidentes comunes
- Crear un flujo de trabajo/bot de Slack para completar las plantillas automáticamente
- Revisar las plantillas durante las retrospectivas de incidentes

### Paso 6: Vincular el Manual al Monitoreo

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md#step-6-alert-integration-examples) para la configuración completa de alertas de Prometheus y el JSON del dashboard de Grafana.

Integra el manual con alertas y dashboards.

**Agregar vínculos de manual a las alertas de Prometheus**:
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**Incrustar vínculos de diagnóstico rápido en el manual**:
- Dashboard de Resumen del Servicio
- Tasa de Error Última 1h (vínculo directo de Prometheus)
- Logs de Error Recientes (Loki/Grafana Explore)
- Despliegues Recientes (GitHub/CI)
- Incidentes de PagerDuty

**Crear panel de dashboard de Grafana** con vínculos de manual (panel markdown que lista todos los manuales de incidentes con información de guardia y escalada)

**Esperado:** Los equipos de respuesta pueden acceder a los manuales directamente desde las alertas o dashboards, las consultas de diagnóstico están pre-completadas, acceso con un clic a las herramientas relevantes.

**En caso de fallo:**
- Verificar que las URL de los manuales sean accesibles sin VPN/inicio de sesión
- Usar acortadores de URL para vínculos complejos de Grafana/Prometheus
- Probar los vínculos trimestralmente para asegurarse de que no se rompan
- Crear marcadores del navegador para los manuales de uso frecuente

## Validación

- [ ] El manual sigue una estructura de plantilla consistente
- [ ] Los procedimientos de diagnóstico incluyen consultas específicas y valores esperados
- [ ] Los pasos de resolución son accionables con comandos claros
- [ ] Los criterios de escalada y los contactos están actualizados
- [ ] Se proporcionan plantillas de comunicación para audiencias internas y externas
- [ ] El manual está vinculado desde las alertas de monitoreo y los dashboards
- [ ] El manual se probó durante una simulación de incidente o un incidente real
- [ ] Los comentarios de los equipos de respuesta se incorporan al manual
- [ ] El historial de revisiones se rastrea con fechas y autores
- [ ] El manual es accesible sin autenticación (o en caché sin conexión)

## Errores Comunes

- **Demasiado genérico**: Los manuales con pasos vagos como "verificar los logs" sin consultas específicas no son accionables. Ser específico.
- **Información desactualizada**: Los manuales que hacen referencia a sistemas o comandos antiguos se vuelven inútiles. Revisar trimestralmente.
- **Sin pasos de verificación**: La resolución sin verificación lleva a falsos positivos. Siempre incluir "cómo confirmar que está arreglado."
- **Procedimientos de reversión faltantes**: Cada acción debe tener un plan de reversión. No atrapar a los equipos de respuesta en un estado peor.
- **Asumir conocimiento**: Los manuales solo para expertos excluyen a los ingenieros junior. Escribir para la persona menos experimentada en rotación.
- **Sin propietario**: Los manuales sin propietarios se vuelven obsoletos. Asignar equipo/persona responsable de las actualizaciones.
- **Oculto detrás de autenticación**: Los manuales inaccesibles durante problemas de VPN/SSO son inútiles durante una crisis. Guardar copias en caché o usar una wiki pública.

## Habilidades Relacionadas

- `configure-alerting-rules` - Vincular manuales a anotaciones de alerta para acceso inmediato durante incidentes
- `build-grafana-dashboards` - Incrustar vínculos de manuales en dashboards y paneles de diagnóstico
- `setup-prometheus-monitoring` - Incluir consultas de diagnóstico de Prometheus en los procedimientos del manual
- `define-slo-sli-sla` - Referenciar el impacto en el SLO en la clasificación de gravedad del incidente
