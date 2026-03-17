---
name: qualify-vendor
description: >
  Calificar a un proveedor de software o servicios relevantes para GxP. Cubre
  la clasificación del riesgo del proveedor, el diseño del cuestionario de
  evaluación, los enfoques de auditoría de escritorio y en sitio, la evaluación
  del acuerdo de calidad, la revisión del SLA y la definición de la cadencia de
  monitoreo continuo. Usar al seleccionar un nuevo proveedor para un sistema
  crítico de GxP, al incorporar un proveedor de nube para datos regulados,
  al realizar una recalificación periódica, cuando un hallazgo de auditoría de
  proveedor requiere una reevaluación, o cuando EU Anexo 11 o ICH Q10 exige la
  calificación de proveedores.
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
  complexity: intermediate
  language: multi
  tags: gxp, vendor, qualification, supplier, quality-agreement, compliance
---

# Calificar a un Proveedor

Evaluar y calificar a un proveedor de software, infraestructura o servicios relevantes para GxP para garantizar que cumplen los estándares de calidad regulatorios.

## Cuándo Usar

- Al seleccionar un nuevo proveedor para un sistema informatizado crítico de GxP
- Al incorporar un proveedor de servicios en la nube para datos regulados
- Cuando vence la recalificación periódica de un proveedor existente
- Cuando un hallazgo de auditoría de proveedor requiere una reevaluación
- Requisito regulatorio para la calificación de proveedores (EU Anexo 11 §3.4, ICH Q10)

## Entradas

- **Requerido**: Nombre del proveedor, producto/servicio y uso GxP previsto
- **Requerido**: Criterios de clasificación del riesgo del proveedor
- **Requerido**: Requisitos regulatorios aplicables
- **Opcional**: Documentación de calidad aportada por el proveedor (certificaciones ISO, informes SOC)
- **Opcional**: Informes de auditoría de proveedor anteriores o registros de calificación
- **Opcional**: Experiencias de clientes de referencia

## Procedimiento

### Paso 1: Clasificar el Riesgo del Proveedor

Determinar el nivel de riesgo del proveedor en función del impacto en GxP:

```markdown
# Vendor Risk Classification
## Document ID: VRC-[VENDOR]-[YYYY]-[NNN]

### Risk Classification Criteria
| Factor | Weight | Critical | Major | Minor |
|--------|--------|----------|-------|-------|
| GxP impact | 40% | Directly processes GxP data or affects product quality | Supports GxP processes indirectly | No GxP impact |
| Data access | 20% | Accesses or stores GxP-regulated data | Accesses supporting data only | No data access |
| Substitutability | 15% | Sole source, no alternative | Limited alternatives | Multiple alternatives |
| Regulatory exposure | 15% | Subject to regulatory inspection | May be referenced in submissions | No regulatory exposure |
| Business criticality | 10% | System downtime stops operations | Downtime causes delays | Minimal operational impact |

### Vendor Classification
| Vendor | Product/Service | Risk Score | Classification | Qualification Approach |
|--------|----------------|------------|---------------|----------------------|
| [Vendor name] | [Product] | [Score] | Critical / Major / Minor | On-site audit / Desk audit / Questionnaire only |

### Qualification Approach by Risk
| Risk Level | Qualification Activities | Re-qualification Frequency |
|------------|------------------------|---------------------------|
| **Critical** | Questionnaire + desk audit + on-site audit | Annual |
| **Major** | Questionnaire + desk audit | Every 2 years |
| **Minor** | Questionnaire only | Every 3 years |
```

**Esperado:** La clasificación del riesgo del proveedor impulsa el esfuerzo de calificación proporcional.
**En caso de fallo:** Si la clasificación del riesgo es disputada, por defecto usar el nivel más alto. Subcalificar a un proveedor crítico es un riesgo regulatorio.

### Paso 2: Diseñar y Enviar el Cuestionario de Evaluación

```markdown
# Vendor Assessment Questionnaire
## Document ID: VAQ-[VENDOR]-[YYYY]-[NNN]

### Section 1: Company Information
1. Legal name, address, and parent company (if applicable)
2. Number of employees (total and in quality/development)
3. Products and services relevant to this qualification
4. Key customers in the pharmaceutical/life sciences industry

### Section 2: Quality Management System
5. Do you maintain a certified QMS? (ISO 9001, ISO 13485, ISO 27001 — provide certificates)
6. Describe your document control system
7. Describe your change management process
8. Describe your CAPA process
9. How do you handle customer complaints?
10. When was your last external audit? Provide the summary report.

### Section 3: Software Development (if applicable)
11. Describe your software development lifecycle (SDLC)
12. Do you follow GAMP 5, IEC 62304, or other development standards?
13. Describe your testing methodology (unit, integration, system, regression)
14. How do you manage source code (version control, branching, code review)?
15. Describe your release management process
16. How do you handle bug reports and patches?

### Section 4: Data Integrity and Security
17. How do you ensure data integrity (ALCOA+ principles)?
18. Describe your audit trail capabilities
19. Describe your access control model (role-based, attribute-based)
20. Describe your data backup and recovery procedures
21. Have you had any data breaches in the last 3 years? If yes, describe.
22. Provide your most recent SOC 2 Type II report (if available)

### Section 5: Regulatory Compliance
23. Are your products used in FDA-regulated or EU-regulated environments?
24. Can you provide a 21 CFR Part 11 compliance statement?
25. Can you provide an EU Annex 11 compliance statement?
26. Do you provide validation support documentation (IQ/OQ/PQ packs)?
27. How do you notify customers of changes that may affect their validated state?

### Section 6: Support and Service Level
28. Describe your support tiers and response times
29. What is your system availability target (uptime SLA)?
30. Describe your disaster recovery and business continuity plan
31. What is your customer notification process for planned and unplanned downtime?
32. What is your end-of-life/end-of-support policy?
```

**Esperado:** Cuestionario enviado al proveedor con un plazo de respuesta (normalmente 4-6 semanas para proveedores críticos).
**En caso de fallo:** Si el proveedor no puede o no quiere completar el cuestionario, esto es en sí mismo un indicador de riesgo. Documentar la negativa y escalar a adquisiciones y Aseguramiento de Calidad.

### Paso 3: Evaluar las Respuestas del Proveedor

Revisar y puntuar las respuestas al cuestionario:

```markdown
# Vendor Evaluation
## Document ID: VE-[VENDOR]-[YYYY]-[NNN]

### Response Evaluation Matrix
| Section | Score (1-5) | Key Findings | Acceptable? |
|---------|-------------|-------------|-------------|
| Quality Management System | [Score] | [Summary of findings] | [Yes/No/Conditional] |
| Software Development | [Score] | [Summary] | [Yes/No/Conditional] |
| Data Integrity and Security | [Score] | [Summary] | [Yes/No/Conditional] |
| Regulatory Compliance | [Score] | [Summary] | [Yes/No/Conditional] |
| Support and Service Level | [Score] | [Summary] | [Yes/No/Conditional] |

Score: 1 = Unacceptable, 2 = Significant gaps, 3 = Adequate with conditions, 4 = Good, 5 = Excellent

### Red Flags (automatic escalation)
- [ ] No QMS or expired certification
- [ ] No change notification process to customers
- [ ] No audit trail capability
- [ ] Data breach with no corrective action
- [ ] Cannot provide 21 CFR 11 or EU Annex 11 compliance statement
- [ ] No validation support documentation
```

**Esperado:** Cada sección evaluada con hallazgos claros y una determinación de aceptabilidad general.
**En caso de fallo:** Si las respuestas son incompletas o evasivas, solicitar aclaración. La falta de respuesta persistente es un criterio de fallo de calificación.

### Paso 4: Realizar la Auditoría (Si se Requiere)

Para proveedores críticos y mayores, realizar una auditoría de escritorio o en sitio:

```markdown
# Vendor Audit Plan
## Document ID: VAP-[VENDOR]-[YYYY]-[NNN]

### Desk Audit (Remote)
| Document Requested | Received? | Assessment |
|-------------------|-----------|------------|
| QMS manual or overview | [Y/N] | [Finding] |
| SDLC documentation | [Y/N] | [Finding] |
| Most recent internal audit report | [Y/N] | [Finding] |
| SOC 2 Type II report | [Y/N] | [Finding] |
| 21 CFR 11 / EU Annex 11 compliance statement | [Y/N] | [Finding] |
| Sample release notes (last 3 releases) | [Y/N] | [Finding] |
| Customer notification examples | [Y/N] | [Finding] |

### On-Site Audit (if critical vendor)
| Area | Activities | Duration |
|------|-----------|----------|
| Quality system | Review QMS documentation, CAPA records, complaint handling | 2 hours |
| Development | Walk through SDLC, code review process, testing evidence | 2 hours |
| Operations | Observe data centre (if applicable), review security controls | 1 hour |
| Support | Review support ticket resolution, SLA compliance metrics | 1 hour |

### Audit Findings
| Finding ID | Area | Observation | Severity | Vendor Response Required? |
|-----------|------|-------------|----------|--------------------------|
| VF-001 | [Area] | [Observation] | [Major/Minor/Obs] | [Yes/No] |
```

**Esperado:** Hallazgos de auditoría documentados objetivamente con clasificación de severidad.
**En caso de fallo:** Si no puede organizarse una auditoría en sitio, realizar una auditoría de escritorio exhaustiva complementada con entrevistas por videoconferencia.

### Paso 5: Evaluar el Acuerdo de Calidad y el SLA

```markdown
# Quality Agreement Evaluation
## Document ID: QAE-[VENDOR]-[YYYY]-[NNN]

### Quality Agreement Checklist
| Clause | Present? | Adequate? | Comments |
|--------|----------|-----------|----------|
| Roles and responsibilities (vendor vs customer) | [Y/N] | [Y/N] | |
| Change notification (advance notice of changes) | [Y/N] | [Y/N] | [Minimum notice period?] |
| Audit rights (right to audit vendor) | [Y/N] | [Y/N] | [Frequency, scope?] |
| Data ownership and portability | [Y/N] | [Y/N] | [Data return on termination?] |
| Security and confidentiality obligations | [Y/N] | [Y/N] | |
| Regulatory inspection cooperation | [Y/N] | [Y/N] | [Vendor supports regulatory inspections?] |
| CAPA process for quality issues | [Y/N] | [Y/N] | |
| Validation support obligations | [Y/N] | [Y/N] | [IQ/OQ/PQ support?] |
| Subcontractor management | [Y/N] | [Y/N] | [Vendor's subcontractor quality?] |
| Termination and transition support | [Y/N] | [Y/N] | [Data migration support?] |

### SLA Evaluation
| Metric | Vendor Commitment | Industry Benchmark | Acceptable? |
|--------|------------------|-------------------|-------------|
| Availability (uptime) | [e.g., 99.9%] | 99.5% - 99.99% | [Y/N] |
| Response time (critical issues) | [e.g., 1 hour] | 1-4 hours | [Y/N] |
| Resolution time (critical issues) | [e.g., 4 hours] | 4-24 hours | [Y/N] |
| Planned maintenance notification | [e.g., 5 days] | 5-14 days | [Y/N] |
| Data backup frequency | [e.g., Daily] | Daily minimum | [Y/N] |
| Disaster recovery RTO | [e.g., 4 hours] | 4-24 hours | [Y/N] |
```

**Esperado:** Los términos del acuerdo de calidad y del SLA son revisados para verificar su adecuación antes de la firma del contrato.
**En caso de fallo:** Si faltan cláusulas críticas del acuerdo de calidad, negociar su inclusión. No calificar a un proveedor sin derechos de auditoría adecuados y notificación de cambios.

### Paso 6: Emitir la Decisión de Calificación

```markdown
# Vendor Qualification Report
## Document ID: VENDOR-QUALIFICATION-[VENDOR]

### Qualification Summary
| Criterion | Result |
|-----------|--------|
| Vendor risk classification | [Critical / Major / Minor] |
| Questionnaire assessment | [Score/5] |
| Audit results (if applicable) | [Satisfactory / Satisfactory with conditions / Unsatisfactory] |
| Quality agreement | [Adequate / Needs revision] |
| SLA | [Adequate / Needs revision] |

### Qualification Decision
| Decision | Meaning |
|----------|---------|
| **Qualified** | Vendor meets all requirements; proceed with procurement |
| **Conditionally qualified** | Vendor meets most requirements; specific conditions must be met within defined timeline |
| **Not qualified** | Vendor does not meet requirements; do not proceed |

**Decision:** [Qualified / Conditionally Qualified / Not Qualified]
**Conditions (if applicable):** [List specific conditions with deadlines]

### Ongoing Monitoring
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Performance metrics review | Quarterly | System owner |
| Quality agreement compliance | Annual | QA |
| Re-qualification audit/assessment | [Per risk level] | QA |
| Regulatory update review | As needed | Regulatory affairs |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Assurance | | | |
| System Owner | | | |
| Procurement | | | |
```

**Esperado:** Decisión de calificación clara con justificación documentada y plan de monitoreo continuo.
**En caso de fallo:** Si la decisión es "No Calificado", documentar las deficiencias específicas y comunicarlas a adquisiciones. Identificar proveedores alternativos.

## Validación

- [ ] Riesgo del proveedor clasificado con justificación documentada
- [ ] El cuestionario de evaluación cubre SGC, desarrollo, seguridad, cumplimiento y soporte
- [ ] Respuestas del proveedor evaluadas con hallazgos puntuados
- [ ] Auditoría realizada para proveedores críticos y mayores
- [ ] Acuerdo de calidad revisado para todas las cláusulas requeridas
- [ ] SLA evaluado frente a requisitos regulatorios y de negocio
- [ ] Decisión de calificación documentada con firmas de aprobación
- [ ] Plan de monitoreo continuo definido con frecuencia y responsabilidades

## Errores Comunes

- **Adquisición antes de la calificación**: Firmar un contrato antes de que la calificación esté completa elimina el margen de negociación para el acuerdo de calidad y crea una brecha de cumplimiento.
- **Cuestionario sin verificación**: Aceptar la autoevaluación del proveedor al pie de la letra es insuficiente. Verificar las afirmaciones clave mediante auditorías, referencias de clientes o revisión de documentos.
- **Sin cláusula de notificación de cambios**: Sin notificación contractual de cambios, un proveedor puede modificar su producto o servicio de formas que afecten su estado validado sin su conocimiento.
- **Calificación como evento único**: La calificación del proveedor es continua. El monitoreo regular, la recalificación y la revisión del desempeño son esenciales para el cumplimiento sostenido.
- **Ignorar a los subcontratistas**: Si el proveedor subcontrata servicios críticos (por ejemplo, alojamiento, desarrollo), la calidad del subcontratista también debe evaluarse.

## Habilidades Relacionadas

- `design-compliance-architecture` — identifica qué proveedores requieren calificación
- `conduct-gxp-audit` — las auditorías de proveedores siguen la misma metodología que las auditorías internas
- `prepare-inspection-readiness` — las calificaciones de proveedores son frecuentemente solicitadas durante las inspecciones
- `manage-change-control` — los cambios iniciados por el proveedor requieren evaluación de control de cambios
- `perform-csv-assessment` — la calificación del proveedor informa el enfoque de validación del producto del proveedor
