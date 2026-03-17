---
name: conduct-retrospective
description: >
  Llevar a cabo una retrospectiva de proyecto o sprint recopilando datos de
  informes de estado y métricas de velocidad, estructurando qué salió bien y
  qué necesita mejora, y generando elementos de mejora accionables con
  responsables y fechas de vencimiento. Usar al final de un sprint, después de
  una fase o hito del proyecto, tras un incidente o éxito significativo, en una
  revisión trimestral de procesos en curso, o antes de iniciar un proyecto
  similar para capturar las lecciones aprendidas.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Realizar una Retrospectiva

Facilitar una retrospectiva estructurada que revise la ejecución reciente del proyecto, identifique qué funcionó y qué no, y produzca elementos de mejora accionables que se retroalimenten en los procesos del proyecto. Esta habilidad transforma datos brutos del proyecto en aprendizajes respaldados por evidencia con acciones específicas, responsables y fechas de vencimiento.

## Cuándo Usar

- Fin de un sprint (retrospectiva de sprint)
- Fin de una fase o hito del proyecto
- Tras un incidente, fracaso o éxito significativo
- Revisión trimestral de los procesos del proyecto en curso
- Antes de iniciar un proyecto similar (revisión de lecciones aprendidas)

## Entradas

- **Requerido**: Período en revisión (número de sprint, rango de fechas o hito)
- **Opcional**: Informes de estado del período en revisión
- **Opcional**: Datos de velocidad y completado del sprint
- **Opcional**: Acciones de retrospectivas anteriores (para verificar cierre)
- **Opcional**: Retroalimentación del equipo o resultados de encuestas

## Procedimiento

### Paso 1: Recopilar Datos para la Retrospectiva

Leer los artefactos disponibles del período en revisión:
- Archivos STATUS-REPORT-*.md del período
- SPRINT-PLAN.md para planificado vs real
- BACKLOG.md para el flujo de elementos y tiempos de ciclo
- Archivos RETRO-*.md anteriores para elementos de acción abiertos

Extraer hechos clave:
- Elementos planificados vs completados
- Tendencia de velocidad
- Bloqueadores encontrados y tiempo de resolución
- Trabajo no planificado que entró al sprint
- Elementos de acción abiertos de retrospectivas anteriores

**Esperado:** Resumen de datos con métricas cuantitativas (velocidad, % de completado, recuento de bloqueadores).

**En caso de fallo:** Si no existen artefactos, basar la retrospectiva en observaciones cualitativas.

### Paso 2: Estructurar "Qué Salió Bien"

Listar 3-5 cosas que funcionaron bien, con evidencia:

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

Enfocarse en prácticas a continuar, no solo en resultados. "Las reuniones diarias mantuvieron los bloqueadores visibles" es más accionable que "Entregamos a tiempo."

**Esperado:** 3-5 observaciones positivas respaldadas por evidencia.

**En caso de fallo:** Si nada salió bien, buscar con más detenimiento — incluso las victorias pequeñas importan. Como mínimo, el equipo completó el período.

### Paso 3: Estructurar "Qué Necesita Mejora"

Listar 3-5 cosas que necesitan mejora, con evidencia:

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

Ser específico y objetivo. "La estimación fue incorrecta" es vago. "3 de 5 elementos superaron las estimaciones en >50%, añadiendo 8 días no planificados" es accionable.

**Esperado:** 3-5 áreas de mejora respaldadas por evidencia con impacto declarado.

**En caso de fallo:** Si el equipo afirma que todo está bien, comparar las métricas planificadas vs reales — las brechas revelan problemas.

### Paso 4: Generar Acciones de Mejora

Para cada área de mejora, crear un elemento accionable:

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

Cada acción debe ser:
- Específica (no "mejorar la estimación" sino "añadir paso de revisión de estimación al refinamiento")
- Con responsable (una persona responsable)
- Con límite de tiempo (fecha de vencimiento dentro de los próximos 1-2 sprints)
- Verificable (criterios de éxito definidos)

**Esperado:** 2-4 acciones de mejora con responsables y fechas de vencimiento.

**En caso de fallo:** Si las acciones son demasiado vagas, aplicar la prueba "¿cómo verificarías que esto se hizo?".

### Paso 5: Revisar Acciones Anteriores y Redactar el Informe

Verificar el cierre de las acciones de la retrospectiva anterior:

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

Señalar los elementos recurrentes (el mismo problema aparece en 3+ retrospectivas) — estos necesitan escalada o un enfoque diferente.

Redactar la retrospectiva completa:

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

Guardar como `RETRO-[YYYY-MM-DD].md`.

**Esperado:** Documento de retrospectiva completo guardado con acciones, evidencia y revisión de acciones anteriores.

**En caso de fallo:** Si la retrospectiva no tiene acciones de mejora, no está impulsando el cambio — revisar el Paso 3.

## Validación

- [ ] Archivo de retrospectiva creado con nombre de archivo con sello de fecha
- [ ] El resumen del período incluye métricas cuantitativas
- [ ] "Qué Salió Bien" tiene 3-5 elementos respaldados por evidencia
- [ ] "Qué Necesita Mejora" tiene 3-5 elementos respaldados por evidencia
- [ ] Las acciones de mejora tienen responsables, fechas de vencimiento y criterios de éxito
- [ ] Las acciones de la retrospectiva anterior revisadas para verificar cierre
- [ ] Problemas recurrentes señalados

## Errores Comunes

- **Juego de culpas**: Las retrospectivas revisan procesos y prácticas, no personas. Enmarcar los problemas como sistémicos, no personales.
- **Acciones sin seguimiento**: El mayor fracaso de la retrospectiva. Siempre revisar las acciones anteriores antes de crear nuevas.
- **Demasiadas acciones**: 2-4 acciones enfocadas son mejores que 10 vagas. El equipo solo puede absorber tantos cambios.
- **Sin evidencia**: "Sentimos que la estimación es mala" es opinión. "3 de 5 elementos superaron las estimaciones en un 50%" son datos. Adjuntar siempre evidencia.
- **Omitir los aspectos positivos**: Hablar solo de problemas es desmoralizador. Celebrar los logros refuerza las buenas prácticas.

## Habilidades Relacionadas

- `generate-status-report` — los informes de estado proporcionan los datos para las retrospectivas
- `manage-backlog` — las acciones de mejora se retroalimentan en el backlog
- `plan-sprint` — los aprendizajes de la retrospectiva mejoran la precisión de la planificación del sprint
- `draft-project-charter` — revisar los supuestos del acta y la precisión de los riesgos
- `create-work-breakdown-structure` — revisar la precisión de la estimación en relación con la EDT
