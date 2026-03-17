---
name: plan-sprint
description: >
  Planificar un sprint refinando elementos del backlog, definiendo un objetivo
  de sprint, calculando la capacidad del equipo, seleccionando elementos y
  descomponiéndolos en tareas. Produce un SPRINT-PLAN.md con el objetivo, los
  elementos seleccionados, el desglose de tareas y la asignación de capacidad.
  Usar al comenzar un nuevo sprint en un proyecto Scrum o ágil, al replanificar
  tras un cambio significativo de alcance, al pasar de trabajo ad-hoc a una
  cadencia de sprint estructurada, o después del refinamiento del backlog cuando
  los elementos están listos para su inclusión.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, sprint, agile, scrum, capacity, sprint-planning
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Planificar un Sprint

Planificar un sprint de tiempo fijo seleccionando elementos refinados del backlog hasta la capacidad del equipo, definiendo un objetivo de sprint claro y descomponiendo los elementos seleccionados en tareas accionables. Esta habilidad produce un plan de sprint completo que guía el trabajo del equipo durante la duración de la iteración del sprint.

## Cuándo Usar

- Al comenzar un nuevo sprint en un proyecto Scrum o ágil
- Al replanificar un sprint después de un cambio significativo de alcance
- Al pasar de trabajo ad-hoc a una cadencia de sprint estructurada
- Después del refinamiento del backlog cuando los elementos están listos para su inclusión en el sprint
- Al planificar el primer sprint después de la aprobación del acta de constitución del proyecto

## Entradas

- **Requerido**: Backlog del producto (priorizado, con estimaciones)
- **Requerido**: Duración del sprint (típicamente 1-2 semanas)
- **Requerido**: Miembros del equipo y su disponibilidad
- **Opcional**: Velocidad del sprint anterior (puntos de historia o elementos completados)
- **Opcional**: Número de sprint y rango de fechas
- **Opcional**: Elementos trasladados del sprint anterior

## Procedimiento

### Paso 1: Revisar y Refinar los Elementos del Backlog

Leer el BACKLOG.md actual. Para cada elemento candidato en la parte superior del backlog, verificar que tenga:

- Título y descripción claros
- Criterios de aceptación (condiciones verificables)
- Estimación (puntos de historia o talla de camiseta)
- Sin bloqueadores sin resolver

Refinar cualquier elemento que carezca de estos elementos. Dividir los elementos estimados con más de la mitad de la capacidad del sprint en piezas más pequeñas y manejables.

**Esperado:** Los 10-15 elementos principales del backlog están "listos para el sprint" con criterios de aceptación y estimaciones.

**En caso de fallo:** Si los elementos carecen de criterios de aceptación, redactarlos ahora. Si los elementos no pueden estimarse, programar una conversación de refinamiento y seleccionar solo los elementos listos.

### Paso 2: Definir el Objetivo del Sprint

Redactar un objetivo de sprint único y claro — una oración que indique lo que el sprint logrará. El objetivo debe ser:

- Alcanzable dentro de la duración del sprint
- Valioso para los interesados
- Verificable (se puede comprobar si se cumplió al final del sprint)

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

Ejemplo: "Enable users to reset their password through email verification with two-factor authentication."

**Esperado:** Objetivo del sprint articulado en una oración clara y verificable.

**En caso de fallo:** Si no emerge un objetivo coherente, las prioridades del backlog pueden estar dispersas — consultar al propietario del producto para enfocarse en un resultado valioso único.

### Paso 3: Calcular la Capacidad del Equipo

Calcular los persona-días disponibles para cada miembro del equipo:

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

Los gastos generales incluyen reuniones, revisiones y solicitudes ad-hoc (típicamente 15-25%).

Si se usan puntos de historia: utilizar la velocidad del sprint anterior como capacidad. Si es el primer sprint, usar el 60-70% del máximo teórico.

**Esperado:** Capacidad calculada en persona-días o puntos de historia con supuestos documentados.

**En caso de fallo:** Si no existe historial de velocidad, ser conservador — planificar al 60% de capacidad y ajustar después del sprint. Es mejor comprometerse menos y entregar que comprometerse demasiado y fallar.

### Paso 4: Seleccionar Elementos y Componer el Backlog del Sprint

Seleccionar elementos de la parte superior del backlog del producto hasta alcanzar la capacidad. Descomponer cada elemento seleccionado en tareas (2-8 horas cada una):

```markdown
# Sprint Plan: Sprint [N]
## Document ID: SP-[PROJECT]-S[NNN]

### Sprint Details
- **Sprint Goal**: [From Step 2]
- **Duration**: [Start date] to [End date]
- **Capacity**: [From Step 3] person-days / [N] story points
- **Team**: [List team members]

### Sprint Backlog
| ID | Item | Points | Tasks | Assignee | Status |
|----|------|--------|-------|----------|--------|
| B-001 | [Item title] | 5 | 4 | [Name] | To Do |
| B-002 | [Item title] | 3 | 3 | [Name] | To Do |
| B-003 | [Item title] | 8 | 6 | [Name] | To Do |
| **Total** | | **16** | **13** | | |

### Task Breakdown

#### B-001: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (4h, [Assignee])
- [ ] Task 2: [Description] (2h, [Assignee])
- [ ] Task 3: [Description] (4h, [Assignee])
- [ ] Task 4: [Description] (2h, [Assignee])

#### B-002: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])

#### B-003: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])
- [ ] Task 4: [Description] (3h, [Assignee])
- [ ] Task 5: [Description] (4h, [Assignee])
- [ ] Task 6: [Description] (2h, [Assignee])

### Risks and Dependencies
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk 1] | [Impact] | [Mitigation] |
| [Risk 2] | [Impact] | [Mitigation] |

### Carry-Over from Previous Sprint
| ID | Item | Reason | Remaining Effort |
|----|------|--------|-----------------|
| B-XXX | [Item] | [Reason] | [Hours/points] |
```

**Esperado:** Backlog del sprint con elementos seleccionados hasta la capacidad, cada uno descompuesto en tareas con estimaciones de tiempo.

**En caso de fallo:** Si el total de puntos supera la capacidad, eliminar el elemento de menor prioridad. Nunca superar la capacidad en más del 10%. Si las dependencias bloquean la secuencia, reordenar o diferir elementos.

### Paso 5: Documentar Compromisos y Guardar

Escribir el plan del sprint en `SPRINT-PLAN.md` (o `SPRINT-PLAN-S[NNN].md` para archivo). Confirmar:

- El objetivo del sprint es alcanzable con los elementos seleccionados
- Ningún miembro del equipo está sobreasignado (>100% de capacidad)
- Las dependencias entre elementos están secuenciadas correctamente
- Los elementos trasladados están contabilizados en la capacidad
- Todos los criterios de aceptación copiados de los elementos del backlog

Ejecutar una validación final:

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

**Esperado:** SPRINT-PLAN.md creado con el backlog del sprint completo y el desglose de tareas. El total de horas debe ser ≤80% de los persona-días disponibles × 8 horas.

**En caso de fallo:** Si los compromisos no se alinean con el objetivo, revisar la selección de elementos en el Paso 4. Si las horas de las tareas superan la capacidad, eliminar el último elemento o descomponer las tareas de forma más granular.

## Validación

- [ ] El objetivo del sprint es una oración clara y verificable
- [ ] La capacidad del equipo calculada con supuestos documentados (% de gastos generales, tiempo libre contabilizado)
- [ ] Los elementos seleccionados no superan la capacidad (puntos o persona-días)
- [ ] Cada elemento seleccionado tiene criterios de aceptación copiados en el desglose de tareas
- [ ] Cada elemento seleccionado está descompuesto en tareas (2-8 horas cada una)
- [ ] Ningún miembro del equipo sobreasignado más del 100% de capacidad
- [ ] Elementos trasladados del sprint anterior documentados con esfuerzo restante
- [ ] Dependencias entre elementos secuenciadas correctamente
- [ ] Riesgos y mitigaciones documentados
- [ ] Archivo SPRINT-PLAN.md creado y guardado

## Errores Comunes

- **Sin objetivo de sprint**: Sin un objetivo, el sprint es solo una bolsa de tareas. El objetivo proporciona enfoque y una base para las decisiones de alcance durante el sprint.
- **Sobrecompromiso**: Planificar al 100% de capacidad ignora interrupciones, errores y gastos generales. Planificar al 70-80% para dejar margen ante lo inesperado.
- **Tareas demasiado grandes**: Las tareas de más de 8 horas ocultan complejidad y dificultan el seguimiento del progreso. Descomponer hasta que las tareas sean de 2-8 horas.
- **Ignorar los trasladados**: Los elementos sin terminar del último sprint consumen capacidad en este sprint. Contabilizarlos explícitamente en los cálculos de capacidad.
- **El objetivo del sprint como lista de elementos**: "Completar B-001, B-002, B-003" no es un objetivo. Un objetivo describe el resultado: "Los usuarios pueden restablecer su contraseña mediante verificación por correo electrónico."
- **Sin responsables de tareas**: Cada tarea debe tener un responsable asignado en el momento de la planificación para detectar conflictos de capacidad tempranamente.
- **Omitir criterios de aceptación**: Las tareas sin criterios de aceptación no pueden verificarse. Copiar los criterios de aceptación de los elementos del backlog en la sección de desglose de tareas.

## Habilidades Relacionadas

- `manage-backlog` — mantener y priorizar el backlog del producto que alimenta la planificación del sprint
- `draft-project-charter` — proporciona el contexto del proyecto y el alcance inicial para el primer sprint
- `generate-status-report` — informar el progreso del sprint y la velocidad a los interesados
- `conduct-retrospective` — revisar la ejecución del sprint y mejorar el proceso de planificación
- `create-work-breakdown-structure` — los paquetes de trabajo de la EDT pueden alimentar el backlog en enfoques híbridos ágiles-en cascada
