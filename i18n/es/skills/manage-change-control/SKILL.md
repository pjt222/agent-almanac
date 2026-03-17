---
name: manage-change-control
description: >
  Gestionar el control de cambios para sistemas informatizados validados. Cubre
  la clasificación de solicitudes de cambio (emergencia, estándar, menor),
  evaluación del impacto sobre el estado validado, determinación del alcance de
  la revalidación, flujos de trabajo de aprobación, seguimiento de la
  implementación y verificación posterior al cambio. Usar cuando un sistema
  validado requiere una actualización de software, parche o cambio de
  configuración; cuando los cambios de infraestructura afectan a sistemas
  validados; cuando una CAPA requiere modificación del sistema; o cuando los
  cambios de emergencia necesitan aprobación expedita y documentación
  retrospectiva.
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
  tags: gxp, change-control, revalidation, impact-assessment, compliance
---

# Gestionar Control de Cambios

Evaluar, aprobar, implementar y verificar los cambios en los sistemas informatizados validados manteniendo su estado validado.

## Cuándo Usar

- Un sistema validado requiere una actualización de software, parche o cambio de configuración
- Los cambios de infraestructura (migración de servidor, actualización de SO, cambio de red) afectan a sistemas validados
- Una CAPA o hallazgo de auditoría requiere modificación del sistema
- Los cambios en los procesos de negocio requieren reconfiguración del sistema
- Los cambios de emergencia necesitan aprobación expedita y documentación retrospectiva

## Entradas

- **Requerido**: Descripción del cambio (qué está cambiando y por qué)
- **Requerido**: Sistema(s) afectado(s) y su estado validado actual
- **Requerido**: Solicitante del cambio y justificación del negocio
- **Opcional**: Notas de versión del proveedor o documentación técnica
- **Opcional**: Referencias a CAPA o hallazgos de auditoría relacionados
- **Opcional**: Documentación de validación existente para el(los) sistema(s) afectado(s)

## Procedimiento

### Paso 1: Crear y Clasificar la Solicitud de Cambio

```markdown
# Change Request
## Document ID: CR-[SYS]-[YYYY]-[NNN]

### 1. Change Description
**Requestor:** [Name, Department]
**Date:** [YYYY-MM-DD]
**System:** [System name and version]
**Current State:** [Current configuration/version]
**Proposed State:** [Target configuration/version]

### 2. Justification
[Business, regulatory, or technical reason for the change]

### 3. Classification
| Type | Definition | Approval Path | Timeline |
|------|-----------|--------------|----------|
| **Emergency** | Urgent fix for safety, data integrity, or regulatory compliance | System owner + QA (retrospective CCB) | Implement immediately, document within 5 days |
| **Standard** | Planned change with potential impact on validated state | CCB approval before implementation | Per CCB schedule |
| **Minor** | Low-risk change with no impact on validated state | System owner approval | Documented before implementation |

**This change is classified as:** [Emergency / Standard / Minor]
**Rationale:** [Why this classification]
```

**Esperado:** La solicitud de cambio tiene un ID único, una descripción clara y una clasificación justificada.
**En caso de fallo:** Si la clasificación está en disputa, usar Estándar y dejar que el CCB tome la decisión.

### Paso 2: Realizar la Evaluación de Impacto

Evaluar el cambio frente a todas las dimensiones del estado validado:

```markdown
# Impact Assessment
## Change Request: CR-[SYS]-[YYYY]-[NNN]

### Impact Matrix
| Dimension | Affected? | Details | Risk |
|-----------|-----------|---------|------|
| Software configuration | Yes/No | [Specific parameters changing] | [H/M/L] |
| Source code | Yes/No | [Modules, functions, or scripts affected] | [H/M/L] |
| Database schema | Yes/No | [Tables, fields, constraints changing] | [H/M/L] |
| Infrastructure | Yes/No | [Servers, network, storage affected] | [H/M/L] |
| Interfaces | Yes/No | [Upstream/downstream system connections] | [H/M/L] |
| User access/roles | Yes/No | [Role changes, new access requirements] | [H/M/L] |
| SOPs/work instructions | Yes/No | [Procedures requiring update] | [H/M/L] |
| Training | Yes/No | [Users requiring retraining] | [H/M/L] |
| Data migration | Yes/No | [Data transformation or migration needed] | [H/M/L] |
| Audit trail | Yes/No | [Impact on audit trail continuity] | [H/M/L] |

### Regulatory Impact
- [ ] Change affects 21 CFR Part 11 controls
- [ ] Change affects EU Annex 11 controls
- [ ] Change affects data integrity (ALCOA+)
- [ ] Change requires regulatory notification
```

**Esperado:** Cada dimensión está evaluada con un sí/no claro y fundamento.
**En caso de fallo:** Si el impacto no puede determinarse sin pruebas, clasificar la dimensión como "Desconocido — requiere investigación" y exigir una evaluación en entorno de prueba antes del cambio en producción.

### Paso 3: Determinar el Alcance de la Revalidación

Basándose en la evaluación de impacto, definir qué actividades de validación son necesarias:

```markdown
# Revalidation Determination

| Revalidation Level | Criteria | Activities Required |
|--------------------|----------|-------------------|
| **Full revalidation** | Core functionality changed, new GAMP category, or major version upgrade | URS review, RA update, IQ, OQ, PQ, TM update, VSR |
| **Partial revalidation** | Specific functions affected, configuration changes | Targeted OQ for affected functions, TM update |
| **Documentation only** | No functional impact, administrative changes | Update validation documents, change log entry |
| **None** | No impact on validated state (e.g., cosmetic change) | Change log entry only |

### Determination for CR-[SYS]-[YYYY]-[NNN]
**Revalidation level:** [Full / Partial / Documentation only / None]
**Rationale:** [Specific reasoning based on impact assessment]

### Required Activities
| Activity | Owner | Deadline |
|----------|-------|----------|
| [e.g., Execute OQ test cases TC-OQ-015 through TC-OQ-022] | [Name] | [Date] |
| [e.g., Update traceability matrix for URS-007] | [Name] | [Date] |
| [e.g., Update SOP-LIMS-003 section 4.2] | [Name] | [Date] |
```

**Esperado:** El alcance de la revalidación es proporcional al impacto del cambio — ni más ni menos.
**En caso de fallo:** Si el alcance de la revalidación está en disputa, errar del lado de más pruebas. La subvalidación es un riesgo regulatorio; la sobrevalidación es solo un costo de recursos.

### Paso 4: Obtener la Aprobación

Dirigir el cambio a través del flujo de trabajo de aprobación apropiado:

```markdown
# Change Approval

### Approval for: CR-[SYS]-[YYYY]-[NNN]

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| System Owner | | Approve / Reject / Defer | | |
| QA Representative | | Approve / Reject / Defer | | |
| IT Representative | | Approve / Reject / Defer | | |
| Validation Lead | | Approve / Reject / Defer | | |

### Conditions (if any)
[Any conditions attached to the approval]

### Planned Implementation Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Rollback deadline:** [Point of no return]
```

**Esperado:** Todos los aprobadores requeridos han firmado antes de que comience la implementación (excepto los cambios de emergencia).
**En caso de fallo:** Para cambios de emergencia, obtener aprobación verbal del propietario del sistema y Aseguramiento de Calidad, implementar el cambio y completar la documentación formal dentro de los 5 días hábiles.

### Paso 5: Implementar y Verificar

Ejecutar el cambio y realizar la verificación posterior al cambio:

```markdown
# Implementation Record

### Pre-Implementation
- [ ] Backup of current system state completed
- [ ] Rollback procedure documented and tested
- [ ] Affected users notified
- [ ] Test environment validated (if applicable)

### Implementation
- **Implemented by:** [Name]
- **Date/Time:** [YYYY-MM-DD HH:MM]
- **Steps performed:** [Detailed implementation steps]
- **Deviations from plan:** [None / Description]

### Post-Change Verification
| Verification | Result | Evidence |
|--------------|--------|----------|
| System accessible and functional | Pass/Fail | [Screenshot/log reference] |
| Changed functionality works as specified | Pass/Fail | [Test case reference] |
| Unchanged functionality unaffected (regression) | Pass/Fail | [Test case reference] |
| Audit trail continuity maintained | Pass/Fail | [Audit trail screenshot] |
| User access controls intact | Pass/Fail | [Access review reference] |

### Closure
- [ ] All verification activities completed successfully
- [ ] Validation documents updated per revalidation determination
- [ ] SOPs updated and effective
- [ ] Training completed for affected users
- [ ] Change record closed in change control system
```

**Esperado:** La implementación coincide con el plan aprobado, y todas las actividades de verificación pasan.
**En caso de fallo:** Si la verificación falla, ejecutar el procedimiento de reversión inmediatamente y documentar el fallo como una desviación. No proceder sin la conformidad de Aseguramiento de Calidad.

## Validación

- [ ] La solicitud de cambio tiene ID único, descripción y clasificación
- [ ] La evaluación de impacto cubre todas las dimensiones (software, datos, infraestructura, SOPs, formación)
- [ ] El alcance de la revalidación está definido con fundamento
- [ ] Todas las aprobaciones requeridas obtenidas antes de la implementación (o dentro de 5 días para emergencias)
- [ ] Copia de seguridad previa a la implementación y procedimiento de reversión documentados
- [ ] La verificación posterior al cambio demuestra que el cambio funciona y nada más se rompió
- [ ] Los documentos de validación actualizados para reflejar el cambio
- [ ] El registro de cambio formalmente cerrado

## Errores Comunes

- **Omitir la evaluación de impacto para cambios "pequeños"**: Incluso los cambios menores pueden tener impactos inesperados. Un interruptor de configuración que parece inofensivo puede deshabilitar un registro de auditoría o cambiar un cálculo.
- **Abuso de cambios de emergencia**: Si más del 10% de los cambios se clasifican como "emergencia", el proceso de cambio está siendo eludido. Revisar y endurecer los criterios de emergencia.
- **Planificación de reversión incompleta**: Asumir que la reversión es "simplemente restaurar la copia de seguridad" ignora los datos creados entre la copia de seguridad y la reversión. Definir la disposición de los datos para cada escenario de reversión.
- **Aprobación después de la implementación**: La aprobación retrospectiva (excepto para emergencias documentadas) es una violación de cumplimiento. El CCB debe aprobar antes de que comience el trabajo.
- **Falta de pruebas de regresión**: Verificar solo la funcionalidad modificada es insuficiente. Las pruebas de regresión deben confirmar que las funciones validadas existentes permanecen sin afectación.

## Habilidades Relacionadas

- `design-compliance-architecture` — define el marco de gobernanza incluyendo el comité de control de cambios
- `write-validation-documentation` — crear la documentación de revalidación desencadenada por los cambios
- `perform-csv-assessment` — reevaluación CSV completa para cambios importantes que requieren revalidación total
- `write-standard-operating-procedure` — actualizar los SOPs afectados por el cambio
- `investigate-capa-root-cause` — cuando los cambios son desencadenados por CAPA
