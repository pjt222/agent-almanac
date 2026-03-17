---
name: prepare-inspection-readiness
description: >
  Preparar a una organización para una inspección regulatoria evaluando la
  preparación frente a las áreas de enfoque específicas de cada agencia (FDA,
  EMA, MHRA). Cubre el análisis de temas de cartas de advertencia y 483,
  protocolos de inspección simulada, preparación de paquetes de documentos,
  logística de la inspección y creación de plantillas de respuesta. Usar cuando
  se ha anunciado o se anticipa una inspección regulatoria, cuando se debe
  realizar una autoevaluación periódica, cuando se han implementado nuevos
  sistemas desde la última inspección, o tras un hallazgo de auditoría
  significativo que pueda atraer la atención regulatoria.
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
  tags: gxp, inspection, fda, ema, mhra, readiness, compliance, 483
---

# Preparar la Disposición para la Inspección

Evaluar y mejorar la preparación organizacional para la inspección regulatoria, abarcando la documentación, la preparación del personal, la logística y la planificación de respuestas.

## Cuándo Usar

- Se ha anunciado o se anticipa una inspección regulatoria
- La autoevaluación periódica de la preparación para la inspección está pendiente
- Se han implementado nuevos sistemas o procesos desde la última inspección
- Las tendencias de la industria (cartas de advertencia, formularios 483) indican un área de enfoque emergente
- Tras un hallazgo de auditoría significativo que puede atraer la atención regulatoria

## Entradas

- **Requerido**: Autoridad inspectora (FDA, EMA, MHRA u otra)
- **Requerido**: Alcance esperado de la inspección (integridad de datos, CSV, GMP, GLP, GCP)
- **Requerido**: Arquitectura de cumplimiento e inventario de sistemas
- **Opcional**: Informes e observaciones de inspecciones anteriores
- **Opcional**: Cartas de advertencia recientes de la industria y temas del formulario 483
- **Opcional**: CAPA abiertas y hallazgos de auditorías

## Procedimiento

### Paso 1: Analizar las Áreas de Enfoque Específicas de la Agencia

Investigar las prioridades actuales de la autoridad inspectora:

```markdown
# Inspection Focus Area Analysis
## Document ID: IFA-[SITE]-[YYYY]-[NNN]

### FDA Current Focus Areas
| Focus Area | Regulatory Basis | Recent 483 Trends | Risk to This Site |
|-----------|-----------------|-------------------|-------------------|
| Data integrity | 21 CFR Part 11, CGMP | #1 cited observation in drug 483s since 2016 | [H/M/L] |
| Audit trail | 21 CFR 11.10(e) | Disabled/incomplete audit trails | [H/M/L] |
| Electronic signatures | 21 CFR 11.50-11.300 | Missing manifestation, shared accounts | [H/M/L] |
| Computer system validation | GAMP 5, FDA guidance | Inadequate validation of Category 4/5 systems | [H/M/L] |
| Change control | ICH Q10 | Undocumented or retrospective changes | [H/M/L] |
| Laboratory controls | 21 CFR 211.160-211.176 | OOS investigation, test repetition | [H/M/L] |

### EMA/MHRA-Specific Considerations
| Area | EU Annex 11 Reference | Focus | Risk to This Site |
|------|----------------------|-------|-------------------|
| Computerized system validation | §4, §5 | Risk-based validation, supplier assessment | [H/M/L] |
| Operational phase | §6-§13 | Security, audit trail, backup, business continuity | [H/M/L] |
| Cloud and outsourced systems | §3.4 | Service level agreements, data sovereignty | [H/M/L] |
| Data governance | MHRA DI guidance | ALCOA+, culture of integrity | [H/M/L] |
```

**Esperado:** Un análisis con calificación de riesgo de las áreas de enfoque de la inspección específicas de la autoridad inspectora.
**En caso de fallo:** Si los datos recientes de formularios 483/cartas de advertencia no están disponibles, consultar la base de datos de cartas de advertencia de la FDA, los informes de inspección de la EMA o las publicaciones de la industria para las tendencias más actuales.

### Paso 2: Realizar la Autoevaluación de Preparación

Evaluar el sitio frente a cada área de enfoque:

```markdown
# Inspection Readiness Assessment
## Document ID: IRA-[SITE]-[YYYY]-[NNN]

### Readiness Scoring
| Focus Area | Weight | Current State | Score (1-5) | Gap | Remediation Priority |
|-----------|--------|--------------|-------------|-----|---------------------|
| Data integrity controls | High | [Description of current state] | [1-5] | [Gap description] | [Critical/High/Medium/Low] |
| Validation documentation | High | [Description] | [1-5] | [Gap] | [Priority] |
| Audit trail compliance | High | [Description] | [1-5] | [Gap] | [Priority] |
| Electronic signatures | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Change control | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Training records | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| SOPs (current, approved) | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| CAPA management | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Vendor qualification | Low | [Description] | [1-5] | [Gap] | [Priority] |
| Periodic review | Low | [Description] | [1-5] | [Gap] | [Priority] |

Score: 1 = Critical gaps, 5 = Fully compliant
Overall readiness score: [Sum / Max] = [X]%

### Remediation Plan
| Gap ID | Description | Owner | Action | Deadline | Status |
|--------|------------|-------|--------|----------|--------|
| GAP-001 | [Gap] | [Name] | [Remediation action] | [Date] | [Open/In Progress/Closed] |
```

**Esperado:** Una evaluación de preparación cuantificada con acciones de remediación priorizadas.
**En caso de fallo:** Si la preparación general es inferior al 70%, considerar solicitar un aplazamiento de la inspección (si se permite) e implementar remediación de emergencia.

### Paso 3: Preparar los Paquetes de Documentos

Organizar la documentación en paquetes listos para la inspección:

```markdown
# Inspection Document Bundles

### Bundle 1: Validation Pack (per system)
- [ ] Current validation status summary (one-page per system)
- [ ] User Requirements Specification (URS)
- [ ] Risk Assessment
- [ ] Validation Plan
- [ ] IQ Protocol and Report
- [ ] OQ Protocol and Report
- [ ] PQ Protocol and Report (if applicable)
- [ ] Traceability Matrix
- [ ] Validation Summary Report
- [ ] Periodic review records
- [ ] Change control history since last validation

### Bundle 2: Data Integrity Evidence
- [ ] Data integrity policy and programme
- [ ] ALCOA+ assessment results
- [ ] Audit trail review records (last 12 months)
- [ ] Data integrity monitoring metrics and trends
- [ ] Data integrity training records

### Bundle 3: Operational Evidence
- [ ] Current SOPs (master list with effective dates)
- [ ] Training matrix (all GxP personnel)
- [ ] Change control log (last 24 months)
- [ ] Deviation/incident log (last 24 months)
- [ ] CAPA log with closure status
- [ ] Internal audit reports and CAPA follow-up

### Bundle 4: System Configuration Evidence
- [ ] User access list (current active users with roles)
- [ ] System configuration documentation
- [ ] Backup and recovery test records
- [ ] Security patch log
- [ ] Business continuity/disaster recovery plan
```

**Esperado:** Todos los paquetes están ensamblados, indexados y accesibles dentro de los 30 minutos de la solicitud de un inspector.
**En caso de fallo:** Si los documentos están faltantes o incompletos, crear una lista de brechas, priorizar la remediación y documentar el plan. Los inspectores notan la desorganización.

### Paso 4: Diseñar el Protocolo de Inspección Simulada

```markdown
# Mock Inspection Protocol
## Document ID: MIP-[SITE]-[YYYY]-[NNN]

### Scope
- **Focus areas:** [Top 3-5 risk areas from readiness assessment]
- **Systems in scope:** [Systems likely to be inspected]
- **Duration:** [1-2 days]

### Participants
| Role | Name | Mock Inspection Role |
|------|------|---------------------|
| Mock inspector | [Experienced QA or external consultant] | Ask questions, request documents |
| System owner(s) | [Names] | Respond to questions, demonstrate systems |
| QA | [Name] | Observe, note findings |
| Back room coordinator | [Name] | Locate and provide documents |

### Mock Inspection Scenarios
| Scenario | Focus | Inspector Might Ask |
|----------|-------|-------------------|
| 1: Show me the audit trail | Data integrity | "Show me the audit trail for batch record BR-2025-1234" |
| 2: Walk me through a change | Change control | "Show me the change control for the last system upgrade" |
| 3: Show training records | Training | "Show me the training records for user [Name] on system [X]" |
| 4: Explain your validation | CSV | "Walk me through how you validated this system" |
| 5: Show a deviation | CAPA | "Show me your last critical deviation and its CAPA" |
| 6: User access review | Access control | "Show me how you manage user access when people leave" |

### Post-Mock Assessment
| Scenario | Outcome | Findings | Actions |
|----------|---------|----------|---------|
| [#] | [Satisfactory/Needs Work] | [Description] | [Remediation if needed] |
```

**Esperado:** La inspección simulada revela los problemas antes de que lo haga la inspección real.
**En caso de fallo:** Si la inspección simulada revela brechas críticas, tratarlas como hallazgos críticos con la misma urgencia que las observaciones de una inspección real.

### Paso 5: Planificar la Logística de la Inspección

```markdown
# Inspection Logistics Plan

### Room Setup
| Room | Purpose | Equipment | Assigned To |
|------|---------|-----------|-------------|
| Front room | Inspector workspace | Table, chairs, network access, printer | Facility manager |
| Back room | Document retrieval and strategy | Copier, network access, phone | QA team |
| Demo room | System demonstrations | Workstation with system access | IT support |

### Roles During Inspection
| Role | Person | Responsibilities |
|------|--------|-----------------|
| Inspection coordinator | [Name] | Single point of contact with inspector, schedule management |
| Subject matter experts | [Names] | Answer technical questions in their domain |
| Back room lead | [Name] | Coordinate document retrieval, track requests |
| Scribe | [Name] | Document all questions, requests, and responses |
| Executive sponsor | [Name] | Available for escalation, opening/closing meetings |

### Communication Protocol
- All document requests flow through the back room lead
- No documents provided without QA review
- Questions requiring research get a "we will get back to you" response (track and follow up)
- Daily debrief with inspection team after each day
```

**Esperado:** El plan de logística garantiza una respuesta profesional y organizada a la inspección.
**En caso de fallo:** Si el personal clave no está disponible en la fecha de la inspección, identificar y preparar suplentes.

### Paso 6: Crear Plantillas de Respuesta

```markdown
# Inspection Response Templates

### Template 1: 483 Observation Response
[Date]
[FDA District Office Address]

Re: FDA Form 483 Observations — [Inspection Dates] — [Facility Name]

Dear [Inspector Name],

We appreciate the opportunity to address the observations identified during the inspection of [facility] on [dates].

**Observation [N]:** [Quote the exact observation text]

**Response:**
- **Root Cause:** [Brief root cause description]
- **Immediate Corrective Action:** [What was done immediately]
  - Completed: [Date]
- **Long-term Corrective Action:** [Systemic fix]
  - Target completion: [Date]
- **Preventive Action:** [How recurrence will be prevented]
  - Target completion: [Date]
- **Effectiveness Verification:** [How effectiveness will be measured]
  - Target verification date: [Date]

### Template 2: Immediate Correction During Inspection
When an inspector identifies an issue that can be corrected immediately:
1. Acknowledge the observation
2. Implement the correction (if feasible)
3. Document the correction with before/after evidence
4. Inform the inspector that the correction has been made
5. Include in the formal response as "corrected during inspection"
```

**Esperado:** Las plantillas de respuesta permiten respuestas rápidas y estructuradas a las observaciones de la inspección.
**En caso de fallo:** Si las plantillas de respuesta son genéricas y no abordan la observación específica, personalizar cada respuesta con evidencias y plazos específicos.

## Validación

- [ ] Áreas de enfoque específicas de la agencia analizadas con calificaciones de riesgo
- [ ] Autoevaluación de preparación completada con puntuaciones cuantificadas
- [ ] Plan de remediación creado para todas las brechas con propietarios y plazos
- [ ] Paquetes de documentos ensamblados e indexados para todos los sistemas en alcance
- [ ] Inspección simulada realizada con hallazgos documentados y seguimiento
- [ ] El plan de logística de la inspección define salas, roles y protocolo de comunicación
- [ ] Plantillas de respuesta preparadas para tipos comunes de observación
- [ ] Todos los elementos críticos de remediación cerrados antes de la fecha de la inspección

## Errores Comunes

- **Preparación de último momento**: La preparación para la inspección es un programa continuo, no un ejercicio de urgencia. Las organizaciones que improvisan producen respuestas desorganizadas e incompletas.
- **Ocultar problemas**: Los inspectores son profesionales experimentados que detectan el encubrimiento. La transparencia con un plan de remediación claro es siempre mejor que el intento de encubrimiento.
- **Proporcionar información en exceso**: Responder la pregunta que se formuló. Proporcionar información no solicitada puede abrir nuevas líneas de investigación.
- **Personal no formado**: Los expertos en la materia que nunca han practicado responder a las preguntas de los inspectores actúan de forma deficiente. Las inspecciones simuladas son práctica esencial.
- **Ignorar la sala de apoyo**: La sala de apoyo (recuperación de documentos y coordinación de estrategia) es tan importante como la sala de la inspección. Una recuperación deficiente de documentos crea la impresión de desorganización.

## Habilidades Relacionadas

- `design-compliance-architecture` — el documento fundamental que los inspectores querrán ver
- `conduct-gxp-audit` — las auditorías internas deben imitar la metodología de la inspección
- `monitor-data-integrity` — la integridad de datos es el área de enfoque principal de la inspección de la FDA
- `investigate-capa-root-cause` — las CAPA deben estar investigadas minuciosamente antes de la inspección
- `qualify-vendor` — las calificaciones de proveedores son frecuentemente solicitadas durante las inspecciones
