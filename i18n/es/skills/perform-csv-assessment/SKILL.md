---
name: perform-csv-assessment
description: >
  Realizar una evaluación de Validación de Sistemas Informatizados (CSV)
  siguiendo la metodología GAMP 5. Cubre requisitos de usuario, evaluación
  de riesgo, planificación IQ/OQ/PQ, creación de matrices de trazabilidad e
  informes de resumen de validación. Usar cuando se introduce un nuevo sistema
  informatizado en un entorno GxP, cuando un sistema validado existente
  experimenta un cambio significativo, cuando se requiere revalidación
  periódica, o cuando una inspección regulatoria exige un análisis de brechas
  de validación.
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
  tags: csv, gamp-5, validation, risk-assessment, iq-oq-pq, traceability
---

# Realizar Evaluación CSV

Llevar a cabo una evaluación de Validación de Sistemas Informatizados usando la metodología basada en riesgo GAMP 5 para entornos regulados.

## Cuándo Usar

- Se introduce un nuevo sistema informatizado en un entorno GxP
- Un sistema validado existente experimenta un cambio significativo
- Se requiere revalidación periódica
- La preparación para una inspección regulatoria exige un análisis de brechas de validación

## Entradas

- **Requerido**: Descripción del sistema (nombre, propósito, proveedor, versión)
- **Requerido**: Declaración de uso previsto y contexto regulatorio (alcance GxP)
- **Requerido**: Categoría de software GAMP 5 (1–5)
- **Opcional**: Especificación de requisitos de usuario (URS) existente
- **Opcional**: Documentación del proveedor (especificaciones de diseño, notas de versión, SOPs)
- **Opcional**: Documentación de validación previa

## Procedimiento

### Paso 1: Determinar la Categoría de Software GAMP 5

Clasificar el sistema:

| Categoría | Tipo | Ejemplo | Esfuerzo de Validación |
|----------|------|---------|-------------------|
| 1 | Software de infraestructura | SO, firmware | Bajo — verificar instalación |
| 3 | Producto no configurado | COTS tal como está | Bajo-Medio — verificar funcionalidad |
| 4 | Producto configurado | LIMS con configuración | Medio-Alto — verificar configuración |
| 5 | Aplicación personalizada | App R/Shiny a medida | Alto — validación completa del ciclo de vida |

**Esperado:** Categoría claramente asignada con fundamento documentado.
**En caso de fallo:** Si la categoría es ambigua, usar la categoría superior y documentar el fundamento.

### Paso 2: Redactar la Especificación de Requisitos de Usuario (URS)

Crear un documento URS con requisitos numerados:

```markdown
# User Requirements Specification
## System: [System Name] v[Version]
## Document ID: URS-[SYS]-[NNN]

### 1. Purpose
[Intended use statement]

### 2. Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-001 | System shall calculate BMI from height and weight inputs | Must | Regulatory SOP-xxx |
| URS-002 | System shall generate audit trail entries for all data changes | Must | 21 CFR 11.10(e) |
| URS-003 | System shall export results in PDF format | Should | User request |

### 3. Non-Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-010 | System shall respond within 3 seconds for standard queries | Should | Usability |
| URS-011 | System shall restrict access via role-based authentication | Must | 21 CFR 11.10(d) |

### 4. Data Integrity Requirements
[ALCOA+ requirements: Attributable, Legible, Contemporaneous, Original, Accurate]

### 5. Regulatory Requirements
[Specific 21 CFR Part 11, EU Annex 11, or other applicable requirements]
```

**Esperado:** Todos los requisitos tienen IDs únicos, prioridades y trazabilidad a la fuente.
**En caso de fallo:** Señalar para revisión de las partes interesadas los requisitos sin fuente o prioridad clara.

### Paso 3: Realizar la Evaluación de Riesgo

Aplicar el enfoque basado en riesgo GAMP 5 usando un Análisis de Modos de Fallo y Efectos (FMEA):

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

Número de Prioridad de Riesgo (RPN) = Severidad x Probabilidad x Detectabilidad.

| Rango RPN | Nivel de Riesgo | Requisito de Prueba |
|-----------|------------|---------------------|
| 1–12 | Bajo | Verificación básica |
| 13–36 | Medio | Caso de prueba documentado |
| 37+ | Alto | IQ/OQ/PQ completo con reprueba |

**Esperado:** Cada requisito URS tiene una fila correspondiente en la evaluación de riesgo.
**En caso de fallo:** Escalar al responsable de validación los requisitos sin evaluar antes de proceder.

### Paso 4: Definir la Estrategia de Validación (Plan de Validación)

```markdown
# Validation Plan
## Document ID: VP-[SYS]-[NNN]

### Scope
- System: [Name] v[Version]
- GAMP Category: [N]
- Validation approach: [Prospective / Retrospective / Concurrent]

### Qualification Stages
| Stage | Scope | Applies? | Rationale |
|-------|-------|----------|-----------|
| IQ | Installation correctness | Yes | Verify installation, dependencies, configuration |
| OQ | Operational requirements | Yes | Verify functional requirements from URS |
| PQ | Performance under real conditions | [Yes/No] | [Rationale] |

### Roles and Responsibilities
| Role | Name | Responsibility |
|------|------|---------------|
| Validation Lead | [Name] | Plan, coordinate, approve |
| Tester | [Name] | Execute test scripts |
| System Owner | [Name] | Approve for production use |
| QA | [Name] | Review and sign-off |

### Acceptance Criteria
- All critical test cases pass
- No unresolved critical or major deviations
- Traceability matrix complete
```

**Esperado:** Plan de validación aprobado por todas las partes interesadas antes de la ejecución de pruebas.
**En caso de fallo:** No proceder a la ejecución de pruebas sin un plan de validación aprobado.

### Paso 5: Crear Protocolos de Prueba (IQ/OQ/PQ)

Redactar scripts de prueba para cada etapa de calificación:

```markdown
# Operational Qualification Protocol
## Test Case: TC-OQ-001
## Traces to: URS-001

**Objective:** Verify BMI calculation accuracy

**Prerequisites:**
- System installed per IQ protocol
- Test data set prepared

**Test Steps:**
| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Enter height=180cm, weight=75kg | BMI displayed as 23.15 | | |
| 2 | Enter height=160cm, weight=90kg | BMI displayed as 35.16 | | |
| 3 | Enter height=0, weight=75kg | Error message displayed | | |

**Tester:** _________ Date: _________
**Reviewer:** _________ Date: _________
```

**Esperado:** Cada requisito de riesgo medio y alto tiene al menos un caso de prueba.
**En caso de fallo:** Añadir los casos de prueba faltantes antes de que comience la ejecución.

### Paso 6: Construir la Matriz de Trazabilidad

Crear una Matriz de Trazabilidad de Requisitos (RTM) que vincule cada requisito a través de la evaluación de riesgo hasta los casos de prueba:

```markdown
# Traceability Matrix
## Document ID: TM-[SYS]-[NNN]

| URS ID | Requirement | Risk Level | Test Case(s) | Test Result | Status |
|--------|-------------|------------|--------------|-------------|--------|
| URS-001 | BMI calculation | Low | TC-OQ-001 | Pass | Verified |
| URS-002 | Audit trail | High | TC-IQ-003, TC-OQ-005 | Pass | Verified |
| URS-003 | PDF export | Low | TC-OQ-008 | Pass | Verified |
| URS-011 | Role-based access | Medium | TC-OQ-010, TC-OQ-011 | Pass | Verified |
```

**Esperado:** El 100% de los requisitos URS aparece en la matriz de trazabilidad con resultados de prueba vinculados.
**En caso de fallo:** Cualquier requisito sin resultado de prueba vinculado se señala como una brecha de validación.

### Paso 7: Redactar el Informe de Resumen de Validación

```markdown
# Validation Summary Report
## Document ID: VSR-[SYS]-[NNN]

### 1. Executive Summary
[System name] v[version] has been validated in accordance with [VP document ID].

### 2. Validation Activities Performed
| Activity | Document ID | Status |
|----------|-------------|--------|
| User Requirements | URS-SYS-001 | Approved |
| Risk Assessment | RA-SYS-001 | Approved |
| Validation Plan | VP-SYS-001 | Approved |
| IQ Protocol/Report | IQ-SYS-001 | Executed — Pass |
| OQ Protocol/Report | OQ-SYS-001 | Executed — Pass |
| Traceability Matrix | TM-SYS-001 | Complete |

### 3. Deviations
| Dev ID | Description | Impact | Resolution |
|--------|-------------|--------|------------|
| DEV-001 | [Description] | [Impact assessment] | [Resolution and rationale] |

### 4. Conclusion
The system meets all user requirements as documented in [URS ID]. The validation is considered [Successful / Successful with conditions].

### 5. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Validation Lead | | | |
| System Owner | | | |
| Quality Assurance | | | |
```

**Esperado:** El informe hace referencia a todos los entregables de validación con una conclusión clara de aprobado/fallido.
**En caso de fallo:** Si las desviaciones no están resueltas, el informe debe indicar el estado "condicional" con referencias CAPA.

## Validación

- [ ] Categoría GAMP 5 asignada con fundamento documentado
- [ ] La URS tiene requisitos numerados con prioridades y trazabilidad a la fuente
- [ ] La evaluación de riesgo cubre cada requisito URS
- [ ] El plan de validación aprobado antes de la ejecución de pruebas
- [ ] Los protocolos de prueba tienen campos de prerrequisito, paso, resultado esperado y firma
- [ ] La matriz de trazabilidad vincula cada requisito con el riesgo y los resultados de prueba
- [ ] El informe de resumen de validación documenta todas las actividades, desviaciones y conclusión
- [ ] Todos los documentos tienen IDs únicos y control de versiones

## Errores Comunes

- **Sobrevalidación**: Aplicar el esfuerzo de Categoría 5 al software de Categoría 3 desperdicia recursos. Ajustar el esfuerzo al riesgo.
- **Trazabilidad faltante**: Los requisitos que no se vinculan hasta los casos de prueba son brechas invisibles.
- **Probar sin un plan**: Ejecutar pruebas antes de que el plan de validación esté aprobado invalida los resultados.
- **Ignorar los requisitos no funcionales**: Los requisitos de seguridad, rendimiento e integridad de datos a menudo se pasan por alto.
- **Validación estática**: Tratar la validación como un evento único. Los cambios requieren reevaluación.

## Habilidades Relacionadas

- `setup-gxp-r-project` — estructura del proyecto para entornos R validados
- `write-validation-documentation` — redacción de protocolos e informes IQ/OQ/PQ
- `implement-audit-trail` — implementación de registro de auditoría para registros electrónicos
- `validate-statistical-output` — metodología de verificación de salida estadística
- `conduct-gxp-audit` — auditoría de sistemas validados
