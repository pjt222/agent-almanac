---
name: monitor-data-integrity
description: >
  Diseñar y operar un programa de monitoreo de integridad de datos basado en
  los principios ALCOA+. Cubre controles detectivos, cronogramas de revisión
  del registro de auditoría, patrones de detección de anomalías (actividad
  fuera de horario, modificaciones secuenciales, cambios masivos), paneles de
  métricas, desencadenadores de investigación y definición de la matriz de
  escalación. Usar al establecer un programa de monitoreo de integridad de
  datos para sistemas GxP, al prepararse para inspecciones donde la integridad
  de datos es un área de enfoque, tras un incidente de integridad de datos que
  requiere un monitoreo mejorado, o al implementar las guías de MHRA, OMS o
  PIC/S.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, data-integrity, alcoa, monitoring, anomaly-detection, compliance
---

# Monitorear la Integridad de Datos

Diseñar y operar un programa que monitorea continuamente la integridad de datos en los sistemas validados usando los principios ALCOA+ y la detección de anomalías.

## Cuándo Usar

- Al establecer un programa de monitoreo de integridad de datos para sistemas GxP
- Al prepararse para una inspección regulatoria donde la integridad de datos es un área de enfoque
- Tras un incidente de integridad de datos que requiere un monitoreo mejorado
- Revisión periódica de los controles de integridad de datos existentes
- Al implementar las guías de integridad de datos de MHRA, OMS o PIC/S

## Entradas

- **Requerido**: Sistemas en alcance y su perfil de riesgo ALCOA+
- **Requerido**: Guías aplicables (Integridad de Datos de MHRA, OMS TRS 996, PIC/S PI 041)
- **Requerido**: Capacidades actuales del registro de auditoría de cada sistema
- **Opcional**: Hallazgos previos de integridad de datos u observaciones regulatorias
- **Opcional**: Procedimientos de monitoreo o métricas existentes
- **Opcional**: Matrices de acceso de usuarios y definiciones de roles

## Procedimiento

### Paso 1: Evaluar la Postura ALCOA+ Actual

Evaluar cada sistema frente a todos los principios ALCOA+:

```markdown
# Data Integrity Assessment
## Document ID: DIA-[SITE]-[YYYY]-[NNN]

### ALCOA+ Assessment Matrix

| Principle | Definition | Assessment Questions | System 1 | System 2 |
|-----------|-----------|---------------------|----------|----------|
| **Attributable** | Who performed the action and when? | Are all entries linked to unique user IDs? Is the timestamp system-generated? | G/A/R | G/A/R |
| **Legible** | Can data be read and understood? | Are records readable throughout retention period? Are formats controlled? | G/A/R | G/A/R |
| **Contemporaneous** | Was data recorded at the time of the activity? | Are timestamps real-time? Are backdated entries detectable? | G/A/R | G/A/R |
| **Original** | Is this the first-captured data? | Are original records preserved? Is there a clear original vs copy distinction? | G/A/R | G/A/R |
| **Accurate** | Is the data correct and truthful? | Are calculations verified? Are transcription errors detectable? | G/A/R | G/A/R |
| **Complete** | Is all data present? | Are deletions detectable? Are all expected records present? | G/A/R | G/A/R |
| **Consistent** | Are data elements consistent across records? | Do timestamps follow logical sequence? Are versions consistent? | G/A/R | G/A/R |
| **Enduring** | Will data survive for the required retention period? | Is the storage medium reliable? Are backups verified? | G/A/R | G/A/R |
| **Available** | Can data be accessed when needed? | Are retrieval procedures documented? Are access controls appropriate? | G/A/R | G/A/R |

Rating: G = Good (controls adequate), A = Adequate (minor improvements needed), R = Remediation required
```

**Esperado:** Cada sistema tiene una evaluación ALCOA+ calificada con hallazgos específicos para cada principio.
**En caso de fallo:** Si un sistema no puede evaluarse (por ejemplo, sin capacidad de registro de auditoría), señalarlo como una brecha crítica que requiere remediación inmediata.

### Paso 2: Diseñar los Controles Detectivos

Definir las actividades de monitoreo que detectan violaciones de integridad de datos:

```markdown
# Detective Controls Design
## Document ID: DCD-[SITE]-[YYYY]-[NNN]

### Audit Trail Review Schedule
| System | Review Type | Frequency | Reviewer | Scope |
|--------|-----------|-----------|----------|-------|
| LIMS | Comprehensive | Monthly | QA | All data modifications, deletions, and access events |
| ERP | Targeted | Weekly | QA | Batch record modifications and approvals |
| R/Shiny | Comprehensive | Per analysis | Statistician | All input/output/parameter changes |

### Review Checklist
For each audit trail review cycle:
- [ ] All data modifications have documented justification
- [ ] No unexplained deletions or void entries
- [ ] Timestamps are sequential and consistent with business operations
- [ ] No off-hours activity without documented justification
- [ ] No shared account usage detected
- [ ] Failed login attempts are within normal thresholds
- [ ] No privilege escalation events outside change control
```

**Esperado:** Los controles detectivos están programados, asignados y documentados con criterios de revisión claros.
**En caso de fallo:** Si las revisiones del registro de auditoría no se realizan según el cronograma, documentar la brecha y escalar a la dirección de Aseguramiento de Calidad. Las revisiones omitidas acumulan riesgo.

### Paso 3: Definir los Patrones de Detección de Anomalías

Crear patrones específicos que desencadenen investigación:

```markdown
# Anomaly Detection Patterns

### Pattern 1: Off-Hours Activity
**Trigger:** Data creation, modification, or deletion outside business hours (defined as [06:00-20:00 local time, Monday-Friday])
**Threshold:** Any GxP-critical data modification outside defined hours
**Response:** Verify with user and supervisor within 2 business days
**Exceptions:** Documented shift work, approved overtime, automated processes

### Pattern 2: Sequential Modifications
**Trigger:** Multiple modifications to the same record within a short timeframe
**Threshold:** >3 modifications to the same record within 60 minutes
**Response:** Review modification reasons; verify each change has documented justification
**Exceptions:** Initial data entry corrections within [grace period, e.g., 30 minutes]

### Pattern 3: Bulk Changes
**Trigger:** Unusually high volume of data modifications by a single user
**Threshold:** >50 modifications per user per day (baseline: [calculate from normal usage])
**Response:** Verify business justification for bulk activity
**Exceptions:** Documented batch operations, data migration activities under change control

### Pattern 4: Delete/Void Spikes
**Trigger:** Unusual number of record deletions or voidings
**Threshold:** >5 delete/void events per user per week
**Response:** Immediate QA review of deleted/voided records
**Exceptions:** None — all delete/void events require documented justification

### Pattern 5: Privilege Escalation
**Trigger:** User access changes granting administrative or elevated privileges
**Threshold:** Any privilege change outside the user access management SOP
**Response:** Verify with IT security and system owner within 24 hours
**Exceptions:** Emergency access per documented emergency access procedure

### Pattern 6: Audit Trail Gaps
**Trigger:** Missing or interrupted audit trail entries
**Threshold:** Any gap > 0 entries (audit trail should be continuous)
**Response:** Immediate investigation — potential system malfunction or tampering
**Exceptions:** None — audit trail gaps are always critical
```

**Esperado:** Los patrones son específicos, medibles y accionables con umbrales definidos y procedimientos de respuesta.
**En caso de fallo:** Si los umbrales se establecen demasiado bajos (exceso de falsos positivos), ajustar basándose en datos de línea de base. Si son demasiado altos (omitiendo problemas reales), ajustarlos tras el primer ciclo de monitoreo.

### Paso 4: Construir el Panel de Métricas

```markdown
# Data Integrity Metrics Dashboard
## Document ID: DIMD-[SITE]-[YYYY]-[NNN]

### Key Performance Indicators

| KPI | Metric | Target | Yellow Threshold | Red Threshold | Source |
|-----|--------|--------|-----------------|---------------|--------|
| DI-01 | Audit trail review completion rate | 100% | <95% | <90% | Review log |
| DI-02 | Anomalies detected per month | Trending down | >10% increase MoM | >25% increase MoM | Anomaly log |
| DI-03 | Anomaly investigation closure rate | <15 business days | >15 days | >30 days | Investigation log |
| DI-04 | Open data integrity CAPAs | 0 overdue | 1-2 overdue | >2 overdue | CAPA tracker |
| DI-05 | Shared account instances detected | 0 | 1-2 | >2 | Access review |
| DI-06 | Unauthorised access attempts | <5/month | 5-10/month | >10/month | System logs |
| DI-07 | Audit trail gap events | 0 | N/A | >0 (always red) | System monitoring |

### Reporting Cadence
| Report | Frequency | Audience | Owner |
|--------|-----------|----------|-------|
| DI Metrics Summary | Monthly | QA Director, System Owners | QA Analyst |
| DI Trend Report | Quarterly | Quality Council | QA Manager |
| DI Annual Review | Annual | Site Director | QA Director |
```

**Esperado:** El panel proporciona el estado de cumplimiento de un vistazo con desencadenadores de escalación claros.
**En caso de fallo:** Si las fuentes de datos no pueden admitir métricas automatizadas, implementar la recopilación manual y documentar el plan para automatizar.

### Paso 5: Establecer Desencadenadores de Investigación y Escalación

```markdown
# Investigation and Escalation Matrix

### Investigation Triggers
| Trigger | Severity | Response Time | Investigator |
|---------|----------|---------------|-------------|
| Audit trail gap detected | Critical | Immediate (within 4 hours) | IT + QA |
| Confirmed data falsification | Critical | Immediate (within 4 hours) | QA Director |
| Anomaly pattern confirmed after review | Major | Within 5 business days | QA Analyst |
| Repeated anomalies from same user | Major | Within 5 business days | QA + HR |
| Overdue audit trail review | Minor | Within 10 business days | QA Manager |

### Escalation Path
| Level | Escalated To | When |
|-------|-------------|------|
| 1 | System Owner | Any confirmed anomaly |
| 2 | QA Director | Major or critical finding |
| 3 | Site Director | Critical finding or potential regulatory impact |
| 4 | Regulatory Affairs | Confirmed data integrity failure requiring regulatory notification |
```

**Esperado:** Cada investigación tiene una severidad definida, cronograma y ruta de escalación.
**En caso de fallo:** Si las investigaciones no se completan dentro de los plazos definidos, escalar al nivel siguiente.

### Paso 6: Compilar el Plan de Monitoreo

Reunir todos los componentes en el plan maestro de monitoreo de integridad de datos:

```markdown
# Data Integrity Monitoring Plan
## Document ID: DI-MONITORING-PLAN-[SITE]-[YYYY]-[NNN]

### 1. Purpose and Scope
[From assessment scope]

### 2. ALCOA+ Assessment Summary
[From Step 1]

### 3. Detective Controls
[From Step 2]

### 4. Anomaly Detection Rules
[From Step 3]

### 5. Metrics and Reporting
[From Step 4]

### 6. Investigation and Escalation
[From Step 5]

### 7. Periodic Review
- Monitoring plan review: Annual
- Anomaly thresholds: Adjust after each quarterly review
- ALCOA+ re-assessment: When systems change or new systems are added

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Director | | | |
| IT Director | | | |
| Site Director | | | |
```

**Esperado:** Un único documento aprobado que define el programa completo de monitoreo de integridad de datos.
**En caso de fallo:** Si el plan es demasiado extenso para un solo documento, crear un plan maestro con referencias a procedimientos de monitoreo específicos de cada sistema.

## Validación

- [ ] Evaluación ALCOA+ completada para todos los sistemas en alcance
- [ ] Cronograma de revisión del registro de auditoría definido con frecuencia, alcance y revisor responsable
- [ ] Al menos 5 patrones de detección de anomalías definidos con umbrales específicos
- [ ] El panel de métricas tiene KPIs con umbrales verde/amarillo/rojo
- [ ] Los desencadenadores de investigación definidos con severidad y cronogramas de respuesta
- [ ] La matriz de escalación llega a asuntos regulatorios para hallazgos críticos
- [ ] El plan de monitoreo aprobado por el liderazgo de Aseguramiento de Calidad y TI
- [ ] Cronograma de revisión periódica establecido

## Errores Comunes

- **Monitoreo sin acción**: Recopilar métricas pero nunca investigar las anomalías proporciona una falsa sensación de seguridad y es peor que ningún monitoreo (genera evidencia de hallazgos ignorados).
- **Umbrales estáticos**: Los umbrales basados en conjeturas en lugar de datos de línea de base generan exceso de falsos positivos, lo que conduce a la fatiga de alertas.
- **Revisión del registro de auditoría como tarea rutinaria**: Revisar los registros de auditoría sin entender qué buscar es ineficaz. Formar a los revisores en patrones de detección de anomalías.
- **Ignorar las limitaciones del sistema**: Algunos sistemas tienen capacidades deficientes de registro de auditoría. Documentar las limitaciones e implementar controles compensatorios en lugar de fingir que la limitación no existe.
- **Sin análisis de tendencias**: Las anomalías individuales pueden parecer menores, pero los patrones a lo largo del tiempo o entre usuarios revelan problemas sistémicos. Siempre analizar las tendencias de las métricas de integridad de datos.

## Habilidades Relacionadas

- `design-compliance-architecture` — identifica los sistemas que requieren monitoreo de integridad de datos
- `implement-audit-trail` — la base técnica en la que se apoya el monitoreo
- `investigate-capa-root-cause` — cuando el monitoreo detecta problemas que requieren investigación formal
- `conduct-gxp-audit` — las auditorías evalúan la efectividad del programa de monitoreo
- `prepare-inspection-readiness` — la integridad de datos es un área de enfoque primaria en las inspecciones regulatorias
