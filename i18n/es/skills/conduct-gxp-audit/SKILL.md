---
name: conduct-gxp-audit
description: >
  Realizar una auditoría GxP de sistemas informatizados y procesos. Cubre
  planificación de la auditoría, reuniones de apertura, recopilación de
  evidencias, clasificación de hallazgos (crítico/mayor/menor), generación
  de CAPA, reuniones de cierre, redacción de informes y verificación de
  seguimiento. Usar para auditorías internas programadas, auditorías de
  calificación de proveedores, evaluaciones de preparación previa a la
  inspección, auditorías por causa desencadenadas por desviaciones o
  preocupaciones de integridad de datos, o revisiones periódicas del estado
  de cumplimiento de sistemas validados.
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
  tags: gxp, audit, capa, inspection, compliance, quality-assurance
---

# Realizar Auditoría GxP

Planificar y ejecutar una auditoría GxP de sistemas informatizados, prácticas de integridad de datos o procesos regulados.

## Cuándo Usar

- Auditoría interna programada de un sistema informatizado validado
- Auditoría de calificación de proveedor/vendedor para software relevante para GxP
- Evaluación de preparación previa a la inspección antes de una auditoría regulatoria
- Auditoría por causa desencadenada por una desviación, reclamación o preocupación de integridad de datos
- Revisión periódica del estado de cumplimiento de un sistema validado

## Entradas

- **Requerido**: Alcance de la auditoría (sistema, proceso o instalación a auditar)
- **Requerido**: Regulaciones aplicables (21 CFR Parte 11, EU Anexo 11, GMP, GLP, GCP)
- **Requerido**: Informes de auditorías anteriores y elementos CAPA abiertos
- **Opcional**: Documentación de validación del sistema (URS, VP, IQ/OQ/PQ, matriz de trazabilidad)
- **Opcional**: SOPs, registros de formación, registros de control de cambios
- **Opcional**: Áreas de riesgo específicas o preocupaciones que desencadenan la auditoría

## Procedimiento

### Paso 1: Desarrollar el Plan de Auditoría

```markdown
# Audit Plan
## Document ID: AP-[SYS]-[YYYY]-[NNN]

### 1. Objective
[State the purpose: scheduled, for-cause, supplier qualification, pre-inspection]

### 2. Scope
- **System/Process**: [Name and version]
- **Regulations**: [21 CFR Part 11, EU Annex 11, ICH Q7, etc.]
- **Period**: [Date range of records under review]
- **Exclusions**: [Any areas explicitly out of scope]

### 3. Audit Criteria
| Area | Regulatory Reference | Key Requirements |
|------|---------------------|------------------|
| Electronic records | 21 CFR 11.10 | Controls for closed systems |
| Audit trail | 21 CFR 11.10(e) | Secure, computer-generated, time-stamped |
| Electronic signatures | 21 CFR 11.50 | Manifestation, legally binding |
| Access controls | EU Annex 11, §12 | Role-based, documented |
| Data integrity | MHRA guidance | ALCOA+ principles |
| Change control | ICH Q10 | Documented, assessed, approved |

### 4. Schedule
| Date | Time | Activity | Participants |
|------|------|----------|-------------|
| Day 1 AM | 09:00 | Opening meeting | All |
| Day 1 AM | 10:00 | Document review | Auditor + QA |
| Day 1 PM | 13:00 | System walkthrough | Auditor + IT + System Owner |
| Day 2 AM | 09:00 | Interviews + evidence collection | Auditor + Users |
| Day 2 PM | 14:00 | Finding consolidation | Auditor |
| Day 2 PM | 16:00 | Closing meeting | All |

### 5. Audit Team
| Role | Name | Responsibility |
|------|------|---------------|
| Lead Auditor | [Name] | Plan, execute, report |
| Subject Matter Expert | [Name] | Technical assessment |
| Auditee Representative | [Name] | Facilitate access and information |
```

**Esperado:** Plan de auditoría aprobado por la dirección de calidad y comunicado al auditado al menos 2 semanas antes de la auditoría.
**En caso de fallo:** Reprogramar si el auditado no puede proporcionar la documentación o el personal requeridos.

### Paso 2: Realizar la Reunión de Apertura

Orden del día:
1. Presentar al equipo auditor y sus roles
2. Confirmar alcance, cronograma y logística
3. Explicar el sistema de clasificación de hallazgos (crítico/mayor/menor)
4. Confirmar acuerdos de confidencialidad
5. Identificar acompañantes del auditado y custodios de documentos
6. Responder preguntas

**Esperado:** Reunión de apertura documentada con registro de asistencia.
**En caso de fallo:** Si el personal clave no está disponible, reprogramar las actividades de auditoría afectadas.

### Paso 3: Recopilar y Revisar Evidencias

Revisar la documentación y los registros frente a los criterios de auditoría:

#### 3a. Revisión de Documentación de Validación
- [ ] La URS existe y está aprobada
- [ ] El plan de validación coincide con la categoría del sistema y el riesgo
- [ ] Los protocolos IQ/OQ/PQ ejecutados con resultados documentados
- [ ] La matriz de trazabilidad vincula los requisitos con los resultados de prueba
- [ ] Las desviaciones documentadas y resueltas
- [ ] El informe de resumen de validación aprobado

#### 3b. Revisión de Controles Operacionales
- [ ] Los SOPs actuales y aprobados
- [ ] Los registros de formación demuestran competencia para todos los usuarios
- [ ] Los registros de control de cambios completos (solicitud, evaluación, aprobación, verificación)
- [ ] Los informes de incidentes/desviaciones gestionados según el SOP
- [ ] La revisión periódica realizada según el cronograma

#### 3c. Evaluación de Integridad de Datos
- [ ] El registro de auditoría habilitado y no modificable por los usuarios
- [ ] Las firmas electrónicas cumplen los requisitos regulatorios
- [ ] Los procedimientos de copia de seguridad y recuperación documentados y probados
- [ ] Los controles de acceso hacen cumplir los permisos basados en roles
- [ ] Los datos son atribuibles, legibles, contemporáneos, originales y precisos (ALCOA+)

#### 3d. Revisión de Configuración del Sistema
- [ ] La configuración de producción coincide con el estado validado
- [ ] Cuentas de usuario revisadas — sin cuentas compartidas, cuentas inactivas deshabilitadas
- [ ] Los relojes del sistema sincronizados y precisos
- [ ] Los parches de seguridad aplicados según el control de cambios aprobado

**Esperado:** Evidencias recopiladas como capturas de pantalla, copias de documentos, notas de entrevista con marcas de tiempo.
**En caso de fallo:** Registrar "no se puede verificar" como una observación y anotar el motivo.

### Paso 4: Clasificar los Hallazgos

Clasificar cada hallazgo por severidad:

| Clasificación | Definición | Respuesta Requerida |
|---------------|------------|-------------------|
| **Crítico** | Impacto directo en la calidad del producto, seguridad del paciente o integridad de datos. Fallo sistemático de un control clave. | Contención inmediata + CAPA en 15 días hábiles |
| **Mayor** | Desviación significativa de los requisitos GxP. Potencial de impactar la integridad de datos si no se corrige. | CAPA en 30 días hábiles |
| **Menor** | Desviación aislada del procedimiento. Sin impacto directo en la integridad de datos o calidad del producto. | Corrección en 60 días hábiles |
| **Observación** | Oportunidad de mejora. No es un requisito regulatorio. | Opcional — seguido para análisis de tendencias |

Documentar cada hallazgo:

```markdown
## Finding F-[NNN]
**Classification:** [Critical / Major / Minor / Observation]
**Area:** [Audit trail / Access control / Change control / etc.]
**Reference:** [Regulatory clause, e.g., 21 CFR 11.10(e)]

**Observation:**
[Objective description of what was found]

**Evidence:**
[Document ID, screenshot reference, interview notes]

**Regulatory Expectation:**
[What the regulation requires]

**Risk:**
[Impact on data integrity, product quality, or patient safety]
```

**Esperado:** Cada hallazgo tiene clasificación, evidencia y referencia regulatoria.
**En caso de fallo:** Si la clasificación está en disputa, escalar al responsable del programa de auditoría para arbitraje.

### Paso 5: Realizar la Reunión de Cierre

Orden del día:
1. Presentar el resumen de hallazgos (no deben plantearse nuevos hallazgos)
2. Revisar las clasificaciones de los hallazgos
3. Analizar las expectativas preliminares de CAPA y los plazos
4. Confirmar los próximos pasos y el cronograma del informe
5. Reconocer la cooperación del auditado

**Esperado:** Reunión de cierre documentada con asistencia. El auditado reconoce los hallazgos (reconocimiento ≠ acuerdo).
**En caso de fallo:** Si el auditado disputa un hallazgo, documentar el desacuerdo y escalar según el SOP.

### Paso 6: Redactar el Informe de Auditoría

```markdown
# Audit Report
## Document ID: AR-[SYS]-[YYYY]-[NNN]

### 1. Executive Summary
An audit of [System/Process] was conducted on [dates] against [regulations].
[N] findings were identified: [n] critical, [n] major, [n] minor, [n] observations.

### 2. Scope and Methodology
[Summarize audit plan scope, criteria, and methods used]

### 3. Findings Summary
| Finding ID | Classification | Area | Brief Description |
|-----------|---------------|------|-------------------|
| F-001 | Major | Audit trail | Audit trail disabled for batch record module |
| F-002 | Minor | Training | Two users missing annual GxP training |
| F-003 | Observation | Documentation | SOP formatting inconsistencies |

### 4. Detailed Findings
[Include full finding details from Step 4 for each finding]

### 5. Positive Observations
[Document areas of good practice observed during the audit]

### 6. Conclusion
The overall compliance status is assessed as [Satisfactory / Needs Improvement / Unsatisfactory].

### 7. Distribution
| Recipient | Role |
|-----------|------|
| [Name] | System Owner |
| [Name] | QA Director |
| [Name] | IT Manager |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Auditor | | | |
| QA Director | | | |
```

**Esperado:** Informe emitido dentro de los 15 días hábiles posteriores a la reunión de cierre.
**En caso de fallo:** Si se supera el plazo de 15 días, notificar a las partes interesadas y documentar el motivo.

### Paso 7: Hacer Seguimiento de las CAPA y Verificar la Efectividad

Para cada hallazgo que requiere una CAPA:

```markdown
## CAPA Tracking
| Finding ID | CAPA ID | Root Cause | Corrective Action | Due Date | Status | Effectiveness Check |
|-----------|---------|------------|-------------------|----------|--------|-------------------|
| F-001 | CAPA-2025-042 | Configuration oversight during upgrade | Enable audit trail, verify all modules | 2025-04-15 | Open | Scheduled 2025-07-15 |
| F-002 | CAPA-2025-043 | Training matrix not updated | Complete training, update tracking | 2025-05-01 | Open | Scheduled 2025-08-01 |
```

**Esperado:** Las CAPA están asignadas, se les hace seguimiento y su efectividad se verifica según el cronograma definido.
**En caso de fallo:** Las CAPA sin resolver se escalan a la dirección de Aseguramiento de Calidad y se señalan en el siguiente ciclo de auditoría.

## Validación

- [ ] Plan de auditoría aprobado y comunicado antes de la auditoría
- [ ] Las reuniones de apertura y cierre documentadas con asistencia
- [ ] Evidencias recopiladas con marcas de tiempo y referencias de fuente
- [ ] Cada hallazgo tiene clasificación, evidencia y referencia regulatoria
- [ ] Informe de auditoría emitido en 15 días hábiles
- [ ] CAPA asignadas con fechas de vencimiento para todos los hallazgos críticos y mayores
- [ ] Las CAPA de auditorías anteriores verificadas para cierre efectivo

## Errores Comunes

- **Expansión del alcance**: Ampliar el alcance de la auditoría durante la ejecución sin acuerdo formal lleva a cobertura incompleta y disputas.
- **Hallazgos basados en opiniones**: Los hallazgos deben hacer referencia a requisitos regulatorios específicos, no a preferencias personales.
- **Tono adversarial**: Las auditorías son ejercicios colaborativos de mejora de la calidad, no interrogatorios.
- **Ignorar los aspectos positivos**: Reportar solo los hallazgos sin reconocer las buenas prácticas socava la confianza.
- **Sin verificación de efectividad**: Cerrar una CAPA sin verificar que la corrección realmente funciona es una cita regulatoria recurrente.

## Habilidades Relacionadas

- `perform-csv-assessment` — evaluación del ciclo de vida CSV completo (URS hasta resumen de validación)
- `setup-gxp-r-project` — estructura del proyecto para entornos R validados
- `implement-audit-trail` — implementación de registro de auditoría para registros electrónicos
- `write-validation-documentation` — redacción de protocolos e informes IQ/OQ/PQ
- `security-audit-codebase` — auditoría de código enfocada en seguridad (perspectiva complementaria)
