---
name: design-training-program
description: >
  Diseñar un programa de formación GxP que cubra el análisis de necesidades
  de formación por rol, diseño curricular (conciencia regulatoria, específico
  del sistema, integridad de datos), criterios de evaluación de competencias,
  retención de registros de formación y desencadenadores de reformación para
  revisiones de SOP e incidentes. Usar cuando un nuevo sistema validado requiere
  formación de usuarios antes de la puesta en marcha, cuando un hallazgo de
  auditoría cita formación inadecuada, cuando los cambios organizacionales
  introducen nuevos roles, cuando se debe realizar una revisión periódica del
  programa, o cuando la preparación para inspecciones requiere demostrar la
  adecuación de la formación.
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
  tags: gxp, training, competency, compliance, quality-management, curriculum
---

# Diseñar Programa de Formación

Crear un programa de formación GxP basado en roles con currículo, evaluaciones de competencias y gestión de registros para entornos regulados.

## Cuándo Usar

- Un nuevo sistema validado requiere formación de usuarios antes de la puesta en marcha
- Un hallazgo de auditoría cita formación inadecuada o registros de formación faltantes
- Los cambios organizacionales introducen nuevos roles o responsabilidades
- La revisión periódica del programa de formación está pendiente
- La preparación para una inspección regulatoria requiere demostrar la adecuación de la formación

## Entradas

- **Requerido**: Sistemas y procesos que requieren personal formado
- **Requerido**: Definiciones de roles (administrador, usuario, Aseguramiento de Calidad, dirección)
- **Requerido**: Requisitos regulatorios aplicables para la formación (GMP, GLP, GCP)
- **Opcional**: Materiales de formación o currículos existentes
- **Opcional**: Brechas de competencia identificadas en auditorías o evaluaciones de rendimiento
- **Opcional**: Capacidades del sistema de gestión de formación

## Procedimiento

### Paso 1: Realizar el Análisis de Necesidades de Formación

Identificar qué necesita saber cada rol:

```markdown
# Training Needs Analysis
## Document ID: TNA-[DEPT]-[YYYY]-[NNN]

### Role-Based Training Requirements

| Role | GxP Awareness | System Training | Data Integrity | SOP Training | Assessment Type |
|------|--------------|----------------|----------------|--------------|-----------------|
| System Administrator | Advanced | Advanced | Advanced | Admin SOPs | Written + Practical |
| End User | Basic | Intermediate | Intermediate | Operational SOPs | Written + Practical |
| QA Reviewer | Advanced | Basic (review focus) | Advanced | QA SOPs | Written |
| Management | Basic | Overview only | Intermediate | Governance SOPs | Written |
| IT Support | Basic | Infrastructure only | Basic | IT SOPs | Written |

### Training Gap Analysis
| Role | Current Competency | Required Competency | Gap | Priority |
|------|-------------------|---------------------|-----|----------|
| [Role] | [Current level] | [Required level] | [Gap description] | [H/M/L] |
```

**Esperado:** Cada rol tiene requisitos de formación definidos vinculados a su función laboral y responsabilidades GxP.
**En caso de fallo:** Si los roles no están claramente definidos, realizar primero un ejercicio RACI para establecer las responsabilidades antes de definir las necesidades de formación.

### Paso 2: Diseñar el Currículo

Estructurar la formación en módulos por tema:

```markdown
# Training Curriculum
## Document ID: TC-[DEPT]-[YYYY]-[NNN]

### Module 1: GxP Regulatory Awareness
**Duration:** 2 hours | **Delivery:** Classroom / eLearning | **Audience:** All roles
**Content:**
1. Introduction to GxP regulations (GMP, GLP, GCP overview)
2. 21 CFR Part 11 and EU Annex 11 requirements for electronic records
3. Data integrity principles (ALCOA+)
4. Consequences of non-compliance (warning letters, consent decrees, product recalls)
5. Individual responsibilities and accountability

### Module 2: System-Specific Training — [System Name]
**Duration:** 4 hours | **Delivery:** Instructor-led with hands-on | **Audience:** Users, Admins
**Content:**
1. System purpose and GxP classification
2. Login, navigation, and role-based access
3. Core workflows (step-by-step for each user task)
4. Electronic signature procedures
5. Audit trail: how entries are created and what they mean
6. Error handling and deviation reporting
7. Data entry best practices

### Module 3: Data Integrity in Practice
**Duration:** 1.5 hours | **Delivery:** Workshop | **Audience:** Users, QA, Admins
**Content:**
1. ALCOA+ principles with system-specific examples
2. Common data integrity risks and how to avoid them
3. Recognising and reporting data integrity concerns
4. Audit trail review basics
5. Case studies: real-world data integrity failures and lessons learned

### Module 4: SOP Training — [SOP-ID]
**Duration:** 1 hour per SOP | **Delivery:** Read and sign / walkthrough | **Audience:** Per SOP scope
**Content:**
1. SOP purpose and scope
2. Step-by-step procedure walkthrough
3. Decision points and deviation handling
4. Forms and documentation requirements
5. Q&A and clarification
```

**Esperado:** Cada módulo tiene definidos la duración, el método de entrega, la audiencia y el esquema de contenidos específico.
**En caso de fallo:** Si el contenido es demasiado amplio para el tiempo asignado, dividir en sub-módulos o crear cadenas de prerrequisitos.

### Paso 3: Crear las Evaluaciones de Competencia

Definir cómo se mide la competencia para cada módulo:

```markdown
# Competency Assessment Design

### Assessment Types
| Type | When to Use | Passing Score | Records |
|------|------------|---------------|---------|
| **Written test** | Knowledge assessment (regulations, principles) | 80% | Score sheet retained |
| **Practical demonstration** | Skill assessment (system operation) | All critical steps correct | Signed observation form |
| **Observed task** | On-the-job competency | Supervisor sign-off | Competency form |

### Sample Written Assessment — GxP Awareness (Module 1)
1. List the five ALCOA principles for data integrity. (5 points)
2. Under 21 CFR 11.50, what three elements must an electronic signature display? (3 points)
3. You discover that a colleague's data entry contains an error. Describe the correct procedure to correct it. (5 points)
4. True/False: A shared login account can be used if all users sign a logbook. (2 points — answer: False)
5. Describe one consequence of a data integrity failure for a pharmaceutical company. (5 points)

**Passing score:** 16/20 (80%)
**On failure:** Retraining required before re-assessment. Maximum 2 re-attempts.

### Practical Assessment Template
| Step | Task | Observed? | Performed Correctly? | Comments |
|------|------|-----------|---------------------|----------|
| 1 | Log in with personal credentials | Yes/No | Yes/No | |
| 2 | Navigate to [specific function] | Yes/No | Yes/No | |
| 3 | Enter test data correctly | Yes/No | Yes/No | |
| 4 | Apply electronic signature | Yes/No | Yes/No | |
| 5 | Locate and interpret audit trail | Yes/No | Yes/No | |

**Assessor:** _______ **Date:** _______ **Result:** Pass / Fail
```

**Esperado:** Las evaluaciones prueban tanto el conocimiento (entender el por qué) como la habilidad (demostrar el cómo).
**En caso de fallo:** Si las tasas de aprobación son inferiores al 70%, revisar los materiales de formación para claridad antes de culpar a los aprendices.

### Paso 4: Definir los Registros de Formación y la Retención

```markdown
# Training Record Management

### Required Training Records
| Record | Format | Retention Period | Storage |
|--------|--------|-----------------|---------|
| Training matrix (who needs what) | Electronic | Current + 2 years superseded | Training management system |
| Individual training transcript | Electronic | Employment + 2 years | Training management system |
| Assessment results | Electronic or paper | Same as transcript | Training management system |
| Training materials (version used) | Electronic | Life of system + 1 year | Document management system |
| Trainer qualification records | Electronic | Employment + 2 years | HR system |

### Training Matrix Template
| Employee | Role | Module 1 | Module 2 | Module 3 | SOP-001 | SOP-002 | Status |
|----------|------|----------|----------|----------|---------|---------|--------|
| J. Smith | User | 2026-01-15 ✓ | 2026-01-16 ✓ | Due 2026-03-01 | 2026-01-20 ✓ | N/A | Partially trained |
| K. Jones | Admin | 2026-01-15 ✓ | 2026-01-17 ✓ | 2026-01-18 ✓ | 2026-01-20 ✓ | 2026-01-20 ✓ | Fully trained |
```

**Esperado:** Los registros de formación demuestran que cada persona que realiza actividades GxP fue formada y evaluada antes de realizar dichas actividades.
**En caso de fallo:** Si los registros de formación están incompletos, realizar una evaluación retrospectiva de brechas de formación e implementar formación de remediación inmediata.

### Paso 5: Definir los Desencadenadores de Reformación

```markdown
# Retraining Triggers

| Trigger | Scope | Timeline | Assessment Required? |
|---------|-------|----------|---------------------|
| SOP revision (minor) | Affected users — read and sign | Before new version effective | No — read and acknowledge |
| SOP revision (major) | Affected users — formal retraining | Before new version effective | Yes — written or practical |
| System upgrade | All users of affected functionality | Before production go-live | Yes — practical demonstration |
| Data integrity incident | Involved personnel + department | Within 30 days of investigation closure | Yes — written |
| Audit finding (training-related) | Per CAPA scope | Per CAPA timeline | Per CAPA requirements |
| Annual refresher | All GxP personnel | Annual from initial training date | No — refresher acknowledgement |
| Role change | Individual | Before assuming new responsibilities | Yes — per new role requirements |
| Extended absence (>6 months) | Returning individual | Before resuming GxP activities | Yes — practical assessment |
```

**Esperado:** Los desencadenadores de reformación son específicos, medibles y están vinculados a plazos definidos.
**En caso de fallo:** Si la reformación no se completa antes del plazo establecido por el desencadenador, el individuo no debe realizar las actividades GxP afectadas hasta que la formación esté completa.

### Paso 6: Compilar el Documento del Programa de Formación

```markdown
# Training Programme
## Document ID: TRAINING-PROGRAM-[DEPT]-[YYYY]-[NNN]

### 1. Purpose and Scope
### 2. Training Needs Analysis [Step 1]
### 3. Curriculum [Step 2]
### 4. Competency Assessments [Step 3]
### 5. Training Records and Retention [Step 4]
### 6. Retraining Triggers [Step 5]
### 7. Programme Review
- Annual review of training effectiveness (pass rates, audit findings, incidents)
- Curriculum update when systems, SOPs, or regulations change
- Trainer qualification verification

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Training Manager | | | |
| QA Director | | | |
| Department Head | | | |
```

**Esperado:** Programa de formación completo aprobado y en vigor antes de la puesta en marcha del sistema o el plazo de cumplimiento.
**En caso de fallo:** Si la aprobación se retrasa, implementar medidas de formación interinas y documentar el plan para formalizar.

## Validación

- [ ] Análisis de necesidades de formación completado para todos los roles que interactúan con sistemas GxP
- [ ] Módulos del currículo definidos con duración, método de entrega y esquema de contenidos
- [ ] Las evaluaciones de competencia existen para cada módulo con criterios de aprobación definidos
- [ ] La matriz de formación hace seguimiento de todo el personal frente a toda la formación requerida
- [ ] La retención de registros de formación cumple los requisitos regulatorios
- [ ] Los desencadenadores de reformación están definidos con plazos y requisitos de evaluación
- [ ] El programa de formación aprobado por Aseguramiento de Calidad y la dirección

## Errores Comunes

- **Formación = leer el SOP**: Leer y firmar es apropiado para actualizaciones menores, no para la formación inicial. Los nuevos usuarios necesitan formación dirigida por un instructor con práctica práctica.
- **Sin evaluación de competencia**: La formación sin evaluación no puede demostrar que ocurrió el aprendizaje. Los reguladores esperan evidencia de competencia, no solo de asistencia.
- **Formador no cualificado**: Los formadores deben ser demostrablemente competentes en la materia. Los registros de "formación de formadores" son frecuentemente solicitados durante las inspecciones.
- **Matriz de formación desactualizada**: Una matriz de formación que no se actualiza cuando las personas se incorporan, se van o cambian de rol crea brechas de cumplimiento. Integrar con los procesos de RRHH.
- **Talla única para todos**: Los administradores necesitan una formación más profunda que los usuarios finales. El currículo basado en roles evita sobrecargar a algunos usuarios mientras se forma insuficientemente a otros.

## Habilidades Relacionadas

- `write-standard-operating-procedure` — los SOPs impulsan el contenido de la formación y los desencadenadores de reformación
- `design-compliance-architecture` — identifica qué sistemas y roles requieren formación
- `conduct-gxp-audit` — las auditorías frecuentemente evalúan la adecuación de la formación
- `manage-change-control` — los cambios en el sistema desencadenan requisitos de reformación
- `prepare-inspection-readiness` — los registros de formación son un objetivo primario de inspección
