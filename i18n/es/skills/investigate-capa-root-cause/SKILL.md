---
name: investigate-capa-root-cause
description: >
  Investigar las causas raíz y gestionar las CAPA (Acciones Correctivas y
  Preventivas) para desviaciones de cumplimiento. Cubre la selección del método
  de investigación (5-Por qué, espina de pez, árbol de fallos), análisis
  estructurado de la causa raíz, diseño de acciones correctivas vs preventivas,
  verificación de la efectividad y análisis de tendencias. Usar cuando un
  hallazgo de auditoría requiere una CAPA, cuando ocurre una desviación o
  incidente en un sistema validado, cuando una observación regulatoria necesita
  una respuesta formal, cuando una anomalía de integridad de datos requiere
  investigación, o cuando los problemas recurrentes sugieren una causa raíz
  sistémica.
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
  tags: gxp, capa, root-cause, investigation, fishbone, five-why, compliance
---

# Investigar la Causa Raíz de CAPA

Llevar a cabo una investigación estructurada de la causa raíz y desarrollar acciones correctivas y preventivas efectivas para las desviaciones de cumplimiento.

## Cuándo Usar

- Un hallazgo de auditoría requiere una CAPA
- Ocurrió una desviación o incidente en un sistema validado
- Una observación de inspección regulatoria necesita una respuesta formal
- Una anomalía de integridad de datos requiere investigación
- Los problemas recurrentes sugieren una causa raíz sistémica

## Entradas

- **Requerido**: Descripción de la desviación, hallazgo o incidente
- **Requerido**: Clasificación de severidad (crítico, mayor, menor)
- **Requerido**: Evidencias recopiladas durante la auditoría o investigación
- **Opcional**: CAPA o investigaciones relacionadas anteriores
- **Opcional**: SOPs relevantes, documentos de validación y registros del sistema
- **Opcional**: Notas de entrevistas con el personal involucrado

## Procedimiento

### Paso 1: Iniciar la Investigación

```markdown
# Root Cause Investigation
## Document ID: RCA-[CAPA-ID]
## CAPA Reference: CAPA-[YYYY]-[NNN]

### 1. Trigger
| Field | Value |
|-------|-------|
| Source | [Audit finding / Deviation / Inspection observation / Monitoring alert] |
| Reference | [Finding ID, deviation ID, or observation number] |
| System | [Affected system name and version] |
| Date discovered | [YYYY-MM-DD] |
| Severity | [Critical / Major / Minor] |
| Investigator | [Name, Title] |
| Investigation deadline | [Date — per severity: Critical 15 days, Major 30 days, Minor 60 days] |

### 2. Problem Statement
[Objective, factual description of what happened, what should have happened, and the gap between the two. No blame, no assumptions.]

### 3. Immediate Containment (if required)
| Action | Owner | Completed |
|--------|-------|-----------|
| [e.g., Restrict system access pending investigation] | [Name] | [Date] |
| [e.g., Quarantine affected batch records] | [Name] | [Date] |
| [e.g., Implement manual workaround] | [Name] | [Date] |
```

**Esperado:** Investigación iniciada con una declaración del problema clara y acciones de contención dentro de las 24 horas para los hallazgos críticos.
**En caso de fallo:** Si la contención no puede implementarse de inmediato, escalar al Director de Aseguramiento de Calidad y documentar el riesgo de la demora en la contención.

### Paso 2: Seleccionar el Método de Investigación

Elegir el método en función de la complejidad del problema:

```markdown
### Investigation Method Selection

| Method | Best For | Complexity | Output |
|--------|----------|-----------|--------|
| **5-Why Analysis** | Single-cause problems, straightforward failures | Low | Linear cause chain |
| **Fishbone (Ishikawa)** | Multi-factor problems, process failures | Medium | Cause-and-effect diagram |
| **Fault Tree Analysis** | System failures, safety-critical events | High | Boolean logic tree |

**Selected method:** [5-Why / Fishbone / Fault Tree / Combination]
**Rationale:** [Why this method is appropriate for this problem]
```

**Esperado:** El método seleccionado coincide con la complejidad del problema — no usar un árbol de fallos para un simple error procedimental, ni usar 5-Por qué para un fallo sistémico complejo.
**En caso de fallo:** Si el primer método no llega a una causa raíz convincente, aplicar un segundo método. La convergencia entre métodos fortalece la conclusión.

### Paso 3: Realizar el Análisis de Causa Raíz

#### Opción A: Análisis 5-Por qué

```markdown
### 5-Why Analysis

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Why 1 | Why did [the problem] occur? | [Immediate cause] | [Evidence reference] |
| Why 2 | Why did [immediate cause] occur? | [Contributing factor] | [Evidence reference] |
| Why 3 | Why did [contributing factor] occur? | [Deeper cause] | [Evidence reference] |
| Why 4 | Why did [deeper cause] occur? | [Systemic cause] | [Evidence reference] |
| Why 5 | Why did [systemic cause] occur? | [Root cause] | [Evidence reference] |

**Root cause:** [Clear statement of the fundamental cause]
```

#### Opción B: Diagrama de Espina de Pez (Ishikawa)

```markdown
### Fishbone Analysis

Analyse causes across six standard categories:

| Category | Potential Causes | Confirmed? | Evidence |
|----------|-----------------|------------|----------|
| **People** | Inadequate training, unfamiliarity with SOP, staffing shortage | [Y/N] | [Ref] |
| **Process** | SOP unclear, missing step, wrong sequence | [Y/N] | [Ref] |
| **Technology** | System misconfiguration, software bug, interface failure | [Y/N] | [Ref] |
| **Materials** | Incorrect input data, wrong version of reference document | [Y/N] | [Ref] |
| **Measurement** | Wrong metric, inadequate monitoring, missed threshold | [Y/N] | [Ref] |
| **Environment** | Organisational change, regulatory change, resource constraints | [Y/N] | [Ref] |

**Contributing causes:** [List confirmed causes]
**Root cause(s):** [The fundamental cause(s) — may be more than one]
```

#### Opción C: Análisis de Árbol de Fallos

```markdown
### Fault Tree Analysis

**Top event:** [The undesired event]

Level 1 (OR gate — any of these could cause the top event):
├── [Cause A]
│   Level 2 (AND gate — both needed):
│   ├── [Sub-cause A1]
│   └── [Sub-cause A2]
├── [Cause B]
│   Level 2 (OR gate):
│   ├── [Sub-cause B1]
│   └── [Sub-cause B2]
└── [Cause C]

**Minimal cut sets:** [Smallest combinations of events that cause the top event]
**Root cause(s):** [Fundamental failures identified in the tree]
```

**Esperado:** El análisis de la causa raíz llega a la causa fundamental (no solo al síntoma) con evidencias de respaldo para cada paso.
**En caso de fallo:** Si el análisis produce solo síntomas ("el usuario cometió un error"), profundizar más. Preguntar: "¿Por qué el usuario pudo cometer ese error? ¿Qué control debería haberlo prevenido?"

### Paso 4: Diseñar las Acciones Correctivas y Preventivas

Distinguir claramente entre corrección, acción correctiva y acción preventiva:

```markdown
### CAPA Plan

| Category | Definition | Action | Owner | Deadline |
|----------|-----------|--------|-------|----------|
| **Correction** | Fix the immediate problem | [e.g., Re-enable audit trail for batch module] | [Name] | [Date] |
| **Corrective Action** | Eliminate the root cause | [e.g., Remove admin ability to disable audit trail; require change control for all audit trail configuration changes] | [Name] | [Date] |
| **Preventive Action** | Prevent recurrence in other areas | [e.g., Audit all systems for audit trail disable capability; add monitoring alert for audit trail configuration changes] | [Name] | [Date] |

### CAPA Details

**CAPA-[YYYY]-[NNN]-CA1: [Corrective Action Title]**
- **Root cause addressed:** [Specific root cause from Step 3]
- **Action description:** [Detailed description of what will be done]
- **Success criteria:** [Measurable outcome that proves the action worked]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [When effectiveness will be verified — typically 3-6 months after implementation]

**CAPA-[YYYY]-[NNN]-PA1: [Preventive Action Title]**
- **Risk addressed:** [What recurrence or spread this prevents]
- **Action description:** [Detailed description]
- **Success criteria:** [Measurable outcome]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [Date]
```

**Esperado:** Cada acción CAPA se remonta a una causa raíz específica, tiene criterios de éxito medibles e incluye un plan de verificación de la efectividad.
**En caso de fallo:** Si los criterios de éxito son vagos ("mejorar el cumplimiento"), reescribirlos para que sean específicos y medibles ("cero cambios de configuración del registro de auditoría fuera del control de cambios durante 6 meses consecutivos").

### Paso 5: Verificar la Efectividad

Después de la implementación de las CAPA, verificar que las acciones realmente funcionaron:

```markdown
### Effectiveness Verification

**CAPA-[YYYY]-[NNN] — Verification Record**

| CAPA Action | Verification Date | Method | Evidence | Result |
|-------------|------------------|--------|----------|--------|
| CA1: [Action] | [Date] | [Method: audit, sampling, metric review] | [Evidence reference] | [Effective / Not Effective] |
| PA1: [Action] | [Date] | [Method] | [Evidence reference] | [Effective / Not Effective] |

### Effectiveness Criteria Check
- [ ] The original problem has not recurred since CAPA implementation
- [ ] The corrective action eliminated the root cause (evidence: [reference])
- [ ] The preventive action has been applied to similar systems/processes
- [ ] No new issues were introduced by the CAPA actions

### CAPA Closure
| Field | Value |
|-------|-------|
| Closure decision | [Closed — Effective / Closed — Not Effective / Extended] |
| Closed by | [Name, Title] |
| Closure date | [YYYY-MM-DD] |
| Next review | [If recurring, when to re-check] |
```

**Esperado:** La verificación de la efectividad demuestra que la causa raíz fue realmente eliminada, no solo que la acción fue completada.
**En caso de fallo:** Si la verificación muestra que la CAPA no fue efectiva, reabrir la investigación y desarrollar acciones revisadas. No cerrar una CAPA inefectiva.

### Paso 6: Analizar las Tendencias de las CAPA

```markdown
### CAPA Trend Analysis

| Period | Total CAPAs | By Source | Top 3 Root Cause Categories | Recurring? |
|--------|------------|-----------|---------------------------|------------|
| Q1 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |
| Q2 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |

### Systemic Issues
| Issue | Frequency | Systems Affected | Recommended Action |
|-------|-----------|-----------------|-------------------|
| [e.g., Training gaps] | [N occurrences in 12 months] | [Systems] | [Systemic programme improvement] |
```

**Esperado:** El análisis de tendencias identifica los problemas sistémicos que las CAPA individuales pasan por alto.
**En caso de fallo:** Si el análisis de tendencias revela causas raíz recurrentes a pesar de las CAPA, estas están tratando los síntomas. Escalar a la revisión de la dirección para una intervención sistémica.

## Validación

- [ ] Investigación iniciada dentro del plazo requerido (24h para críticos, 72h para mayores)
- [ ] La declaración del problema es factual y no asigna culpa
- [ ] El método de investigación es apropiado para la complejidad del problema
- [ ] El análisis de la causa raíz llega a la causa fundamental (no solo a los síntomas)
- [ ] Cada paso del análisis de la causa raíz está respaldado por evidencias
- [ ] Las CAPA distinguen corrección, acción correctiva y acción preventiva
- [ ] Cada CAPA tiene criterios de éxito medibles y un plan de verificación
- [ ] La efectividad verificada con evidencias antes del cierre de la CAPA
- [ ] El análisis de tendencias revisado al menos trimestralmente

## Errores Comunes

- **Detenerse en el síntoma**: "El usuario cometió un error" no es una causa raíz. La causa raíz es por qué el sistema o proceso permitió el error.
- **CAPA = reformación**: La reformación aborda solo una posible causa raíz (el conocimiento). Si la causa raíz real es un defecto de diseño del sistema o un SOP poco claro, la reformación no prevendrá la recurrencia.
- **Cerrar sin verificación**: Completar la acción no es lo mismo que verificar su efectividad. Una CAPA cerrada sin verificación de efectividad es una cita regulatoria esperando ocurrir.
- **Investigación orientada a la culpa**: Las investigaciones que se centran en quién cometió el error en lugar de qué permitió el error socavan la cultura de calidad y desincentivan la notificación.
- **Sin análisis de tendencias**: Las CAPA individuales pueden parecer no relacionadas, pero el análisis de tendencias a menudo revela problemas sistémicos (por ejemplo, causas raíz de "formación" en múltiples sistemas pueden indicar un programa de formación defectuoso).

## Habilidades Relacionadas

- `conduct-gxp-audit` — las auditorías generan hallazgos que requieren CAPA
- `monitor-data-integrity` — el monitoreo detecta anomalías que desencadenan investigaciones
- `manage-change-control` — los cambios impulsados por CAPA van a través del control de cambios
- `prepare-inspection-readiness` — las CAPA abiertas y vencidas son objetivos prioritarios de inspección
- `design-training-program` — cuando la causa raíz está relacionada con la formación, mejorar el programa de formación
