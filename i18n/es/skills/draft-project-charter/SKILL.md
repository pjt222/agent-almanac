---
name: draft-project-charter
description: >
  Redactar un acta de constitución de proyecto que defina el alcance, los
  interesados, los criterios de éxito y el registro inicial de riesgos. Cubre
  el enunciado del problema, la matriz RACI, la planificación de hitos y los
  límites del alcance para metodologías ágiles y clásicas. Usar al iniciar un
  nuevo proyecto o iniciativa, al formalizar el alcance después de un inicio
  informal, al alinear a los interesados antes de que comience la planificación
  detallada, o al pasar del descubrimiento al trabajo activo del proyecto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, charter, scope, stakeholders, raci, risk-register
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Redactar un Acta de Constitución de Proyecto

Crea un acta de constitución estructurada que establece los límites del proyecto, los acuerdos con los interesados y los criterios de éxito antes de que comience la planificación detallada. Produce un documento completo que cubre el alcance, las asignaciones RACI, la planificación de hitos y un registro inicial de riesgos, adecuado para metodologías de proyecto ágiles, clásicas o híbridas.

## Cuándo Usar

- Al iniciar un nuevo proyecto o iniciativa
- Al formalizar el alcance después de un inicio informal del proyecto
- Al alinear a los interesados antes de que comience la planificación detallada
- Al crear un documento de referencia para las decisiones de alcance durante la ejecución
- Al pasar del descubrimiento/ideación al trabajo activo del proyecto

## Entradas

- **Requerido**: Nombre del proyecto y descripción breve
- **Requerido**: Interesado principal o patrocinador
- **Opcional**: Documentación existente (propuestas, resúmenes, correos electrónicos)
- **Opcional**: Restricciones conocidas (presupuesto, plazo, tamaño del equipo)
- **Opcional**: Preferencia de metodología (ágil, clásica, híbrida)

## Procedimiento

### Paso 1: Recopilar el Contexto del Proyecto y Crear la Plantilla del Acta

Leer cualquier documentación existente (propuestas, correos, resúmenes) para entender el contexto del proyecto. Identificar el problema u oportunidad central que aborda el proyecto. Crear el archivo del acta con una plantilla estructurada que se completará en los pasos siguientes.

Crear un archivo llamado `PROJECT-CHARTER-[PROJECT-NAME].md` con esta plantilla:

```markdown
# Project Charter: [Project Name]
## Document ID: PC-[PROJECT]-[YYYY]-[NNN]

### 1. Problem Statement
[2-3 sentences describing the problem or opportunity this project addresses]

### 2. Project Purpose
[What the project will achieve and why it matters]

### 3. Scope
#### In Scope
- [Deliverable 1]
- [Deliverable 2]

#### Out of Scope
- [Exclusion 1]
- [Exclusion 2]

### 4. Deliverables
| # | Deliverable | Acceptance Criteria | Target Date |
|---|------------|---------------------|-------------|
| 1 | | | |

### 5. Stakeholders & RACI
| Stakeholder | Role | D1 | D2 | D3 |
|-------------|------|----|----|-----|
| | | | | |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

### 6. Success Criteria
| # | Criterion | Measure | Target |
|---|-----------|---------|--------|
| 1 | | | |

### 7. Milestones
| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| | | |

### 8. Risk Register
| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|------------|--------|----------|------------|-------|
| R1 | | | | | | |

*Likelihood/Impact: Low, Medium, High*
*Severity = Likelihood × Impact*

### 9. Assumptions and Constraints
#### Assumptions
- [Key assumption 1]

#### Constraints
- [Key constraint 1]

### 10. Approval
| Role | Name | Date |
|------|------|------|
| Sponsor | | |
| Project Lead | | |
```

Completar el ID del documento con el formato PC-[PROJECT]-[YYYY]-[NNN] (por ejemplo, PC-WEBSITE-2026-001). Escribir un enunciado del problema (2-3 oraciones) que describa la situación actual, la brecha y el impacto. Escribir un enunciado del propósito del proyecto (1 párrafo) explicando lo que se logrará.

**Esperado:** Archivo del acta creado con el ID del documento, el enunciado del problema y el propósito completados. El enunciado del problema es específico y describe una brecha medible.

**En caso de fallo:** Si el contexto del proyecto no está claro, documentar preguntas específicas para el patrocinador en una sección QUESTIONS al principio del acta. Si los documentos existentes presentan contradicciones, anotarlas en una sección OPEN ISSUES y señalarlas para resolución por parte de los interesados.

### Paso 2: Definir los Límites del Alcance

Crear listas explícitas de lo que está y no está incluido en el alcance del proyecto. Escribir 3-5 entregables dentro del alcance con criterios de aceptación específicos para cada uno. Escribir 3-5 elementos fuera del alcance para prevenir la expansión del alcance. Completar la tabla de Entregables con cada entregable, sus criterios de aceptación y una fecha objetivo.

**Esperado:** La sección de alcance tiene listas equilibradas de elementos dentro y fuera del alcance. La tabla de Entregables contiene 3-5 entradas con criterios de aceptación específicos y verificables. Las fechas objetivo son realistas y están ordenadas lógicamente.

**En caso de fallo:** Si los entregables son vagos, desglosar cada uno en sub-entregables con salidas concretas. Si faltan criterios de aceptación, preguntar: "¿Cómo demostraríamos que este entregable está completo?" Si las fechas objetivo no están disponibles, marcarlas como TBD y señalarlas para la sesión de planificación de hitos.

### Paso 3: Identificar Interesados y Asignar la RACI

Listar todas las personas o grupos que se verán afectados por el proyecto, que contribuirán a él o que tendrán autoridad de decisión sobre el mismo. Incluir su rol organizacional. Crear una matriz RACI que asigne cada interesado a cada entregable usando:
- **R** (Responsible / Responsable): Realiza el trabajo
- **A** (Accountable / Rendición de cuentas): Autoridad final de decisión (solo una A por entregable)
- **C** (Consulted / Consultado): Proporciona información antes de las decisiones
- **I** (Informed / Informado): Se mantiene actualizado sobre el progreso

Asegurarse de que cada entregable tenga exactamente una A y al menos una R.

**Esperado:** La tabla de interesados lista 5-10 personas con sus roles. La matriz RACI tiene una A por columna de entregable. Ningún entregable carece de una R ni tiene múltiples A. El patrocinador es A para la aprobación final.

**En caso de fallo:** Si la lista de interesados está incompleta, cruzar referencias con el organigrama y los asistentes a las reuniones de la fase de descubrimiento. Si se identifican múltiples A, escalar el conflicto al patrocinador para aclarar la autoridad de decisión. Si no existe ninguna R, marcar el entregable como no asignado y que requiere asignación de recursos.

### Paso 4: Definir Criterios de Éxito e Hitos

Escribir 3-5 criterios de éxito medibles usando el formato SMART (Específico, Medible, Alcanzable, Relevante, Con límite de tiempo). Cada criterio debe vincularse a una medida cuantificable y un valor objetivo. Definir 4-6 hitos clave que representen las principales etapas del proyecto o la finalización de entregables, con fechas objetivo y dependencias de hitos anteriores.

**Esperado:** La tabla de Criterios de Éxito tiene 3-5 entradas con medidas específicas (por ejemplo, "Tiempo de actividad del sistema" medido como "% de disponibilidad" con objetivo "99,5%"). La tabla de Hitos muestra fases lógicas del proyecto con fechas objetivo realistas. Las dependencias están claramente indicadas.

**En caso de fallo:** Si los criterios de éxito son vagos (por ejemplo, "mejorar la calidad"), reescribirlos como resultados medibles con valores de referencia y objetivo. Si las fechas de los hitos son poco realistas, trabajar hacia atrás desde la fecha límite final usando duraciones estimadas y márgenes. Si las dependencias crean una lógica circular, reestructurar la secuencia de hitos o dividir los hitos conflictivos.

### Paso 5: Crear el Registro Inicial de Riesgos

Identificar 5-10 riesgos que podrían afectar el éxito del proyecto. Para cada riesgo, evaluar la probabilidad (Baja/Media/Alta) y el impacto (Bajo/Medio/Alto), luego calcular la gravedad. Definir una estrategia de mitigación específica para cada riesgo y asignar un responsable del riesgo encargado del seguimiento y la respuesta. Incluir al menos un riesgo en cada categoría: alcance, cronograma, recursos, técnico y externo.

**Esperado:** El Registro de Riesgos tiene 5-10 entradas que cubren riesgos de alcance, cronograma, recursos, técnicos y externos. Cada riesgo tiene evaluados la probabilidad, el impacto y la gravedad. Las estrategias de mitigación son específicas y accionables. Cada riesgo tiene un responsable asignado.

**En caso de fallo:** Si la lista de riesgos está incompleta, revisar los límites del alcance, las dependencias, la lista de interesados y los supuestos en busca de puntos de fallo potenciales. Si las estrategias de mitigación son genéricas ("monitorear de cerca"), especificar: ¿Qué se monitoreará? ¿Con qué frecuencia? ¿Qué desencadena la acción? Si nadie acepta la responsabilidad de un riesgo, asignarla temporalmente al líder del proyecto y escalar al patrocinador.

## Validación

- [ ] Archivo del acta creado con ID del documento
- [ ] El enunciado del problema es específico y medible
- [ ] El alcance tiene tanto elementos dentro como fuera del mismo
- [ ] La matriz RACI cubre todos los entregables
- [ ] Los criterios de éxito son medibles (SMART)
- [ ] Al menos 5 riesgos identificados con estrategias de mitigación
- [ ] Los hitos tienen fechas objetivo
- [ ] Sección de aprobación incluida

## Errores Comunes

- **Alcance sin límites**: Listar elementos dentro del alcance sin elementos explícitos fuera del mismo lleva a la expansión del alcance. Siempre definir qué no se hará.
- **Criterios de éxito vagos**: "Mejorar el rendimiento" no es medible. Vincular cada criterio a un número con una línea base y un objetivo.
- **Interesados faltantes**: Los interesados que se pasan por alto aparecen tarde y desvían el proyecto. Cruzar referencias con organigramas y comunicaciones de proyectos anteriores.
- **El registro de riesgos como lista de verificación**: Enumerar riesgos sin planes de mitigación accionables proporciona una falsa confianza. Cada riesgo necesita una estrategia de respuesta específica.
- **Acta demasiado detallada**: El acta es una brújula, no un mapa. Mantenerla en 2-4 páginas. La planificación detallada ocurre después.

## Habilidades Relacionadas

- `create-work-breakdown-structure` — descomponer los entregables del acta en paquetes de trabajo
- `manage-backlog` — traducir el alcance del acta en una lista de pendientes priorizada
- `plan-sprint` — planificar el primer sprint a partir de los entregables del acta
- `generate-status-report` — informar el progreso en relación con los hitos del acta
- `conduct-retrospective` — revisar los supuestos del acta después de la ejecución
