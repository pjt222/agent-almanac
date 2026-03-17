---
name: generate-status-report
description: >
  Generar un informe de estado del proyecto leyendo artefactos existentes
  (acta, backlog, plan de sprint, EDT), calculando métricas, identificando
  bloqueadores y resumiendo el progreso con indicadores RAV (Rojo/Ámbar/Verde)
  para cronograma, alcance, presupuesto y calidad. Usar al final de un sprint
  o período de reporte, cuando los interesados solicitan una actualización del
  estado, antes de reuniones del comité directivo o de gobernanza, o cuando
  un nuevo bloqueador o riesgo se materializa a mitad del proyecto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Generar un Informe de Estado del Proyecto

Producir un informe de estado periódico analizando los artefactos del proyecto, calculando métricas de progreso y resumiendo logros, bloqueadores y trabajo futuro con indicadores de salud RAV (Rojo/Ámbar/Verde).

## Cuándo Usar

- Fin de sprint o período de reporte (semanal, quincenal, mensual)
- Solicitudes de los interesados para una actualización del estado del proyecto
- Antes de reuniones del comité directivo o de gobernanza
- Cuando los indicadores de salud del proyecto cambian (por ejemplo, aparece un nuevo bloqueador o riesgo)
- Revisión periódica en relación con los hitos del acta de constitución

## Entradas

- **Requerido**: Período de reporte (fecha de inicio, fecha de fin)
- **Requerido**: Al menos un artefacto del proyecto (BACKLOG.md, SPRINT-PLAN.md, WBS.md o PROJECT-CHARTER.md)
- **Opcional**: Informes de estado anteriores (para comparación de tendencias)
- **Opcional**: Datos de seguimiento de presupuesto o recursos
- **Opcional**: Actualizaciones del registro de riesgos

## Procedimiento

### Paso 1: Leer los Artefactos Existentes

Explorar el directorio del proyecto en busca de artefactos de gestión de proyectos:
- PROJECT-CHARTER.md — hitos, criterios de éxito
- BACKLOG.md — recuentos de elementos por estado, datos de burn-down
- SPRINT-PLAN.md — objetivo del sprint, elementos comprometidos, finalización de tareas
- WBS.md — porcentajes de finalización de paquetes de trabajo
- Archivos STATUS-REPORT-*.md anteriores — datos de tendencias

Leer los archivos disponibles. No todos existirán — adaptar el informe a los datos disponibles.

**Esperado:** Al menos un artefacto leído con éxito, métricas clave extraídas.

**En caso de fallo:** Si no existen artefactos, no se puede generar el informe. Crear primero un acta o un backlog usando las habilidades `draft-project-charter` o `manage-backlog`.

### Paso 2: Calcular las Métricas de Progreso

Calcular métricas a partir de los datos disponibles:

**Métricas ágiles** (de BACKLOG.md / SPRINT-PLAN.md):
- Velocidad: puntos de historia completados en este sprint
- Completado del sprint: elementos terminados / elementos comprometidos
- Burn-down del backlog: puntos totales restantes vs período anterior
- Tiempo de ciclo: promedio de días de En Progreso a Terminado

**Métricas clásicas** (de WBS.md):
- % completado: paquetes de trabajo terminados / total de paquetes de trabajo
- Variación del cronograma: fechas planificadas de hitos vs fechas reales
- Variación del esfuerzo: esfuerzo estimado vs esfuerzo real consumido

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**Esperado:** 3-5 métricas calculadas con comparación del período anterior.

**En caso de fallo:** Si no existen datos históricos (primer informe), omitir las columnas Previous y Trend. Si los datos están incompletos, anotar las brechas en el pie del informe con elementos de acción para establecer el seguimiento.

### Paso 3: Identificar Bloqueadores, Riesgos e Incidencias

Listar los bloqueadores y riesgos activos:

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

Cruzar referencias con el registro de riesgos del acta. Señalar cualquier riesgo nuevo no identificado previamente.

**Esperado:** Todos los bloqueadores activos y los principales riesgos documentados con responsables y acciones.

**En caso de fallo:** Si no existen bloqueadores, indicar explícitamente "No hay bloqueadores activos" — no dejar la sección vacía. Si un bloqueador carece de responsable, escalar al director del proyecto para su asignación.

### Paso 4: Resumir los Logros y el Plan del Próximo Período

Redactar dos secciones:

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**Esperado:** 3-5 logros con evidencia concreta, 3-5 elementos planificados para el próximo período.

**En caso de fallo:** Si no existen logros, informar la razón (bloqueado, replaneando, equipo no disponible). Si el plan del próximo período no está claro, listar "Sesión de planificación programada para [fecha]" como elemento principal.

### Paso 5: Asignar Indicadores RAV y Redactar el Informe

Evaluar la salud del proyecto en cuatro dimensiones:

| Dimensión | Verde | Ámbar | Rojo |
|-----------|-------|-------|-----|
| **Cronograma** | En curso o adelantado | 1-2 semanas de retraso | >2 semanas de retraso o hito perdido |
| **Alcance** | Sin cambios no controlados | Ajustes menores de alcance | Expansión del alcance que afecta entregables |
| **Presupuesto** | Dentro del 5% del plan | 5-15% sobre el plan | >15% sobre el plan o sin seguimiento |
| **Calidad** | Pruebas aprobadas, criterios cumplidos | Problemas menores de calidad | Defectos críticos o fallos de aceptación |

Redactar el informe completo:

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

Guardar como `STATUS-REPORT-[YYYY-MM-DD].md`.

**Esperado:** Informe de estado completo guardado con indicadores RAV, métricas y narrativa.

**En caso de fallo:** Si los datos son insuficientes para la evaluación RAV, usar ⚪ (Gris) que indica "datos insuficientes" y listar qué datos deben recopilarse para el próximo informe.

## Validación

- [ ] Archivo de informe de estado creado con nombre de archivo con sello de fecha correcto
- [ ] Indicadores RAV asignados para las cuatro dimensiones con justificación
- [ ] Al menos 3 métricas calculadas a partir de los artefactos del proyecto
- [ ] Sección de bloqueadores presente (incluso si indica "No hay bloqueadores activos")
- [ ] Logros listados con evidencia
- [ ] Plan del próximo período incluido
- [ ] El resumen ejecutivo tiene 2-3 oraciones, no un párrafo
- [ ] Cada bloqueador y riesgo tiene un responsable y una acción con fecha límite

## Errores Comunes

- **Informe sin datos**: Los informes de estado deben basarse en evidencia. Cada afirmación debe referenciar un artefacto o métrica.
- **Todo verde, siempre**: El verde persistente en el RAV sin evidencia sugiere que el informe no es honesto. Cuestionar las evaluaciones verdes.
- **Bloqueador sin responsable**: Cada bloqueador necesita un responsable y una acción. Los bloqueadores sin responsable no se resuelven.
- **Métrica sin contexto**: "Velocidad = 18" no significa nada sin comparación. Incluir siempre el período anterior o el objetivo.
- **Demasiado largo**: Un informe de estado debe poder examinarse en 2 minutos. Limitarlo a 1-2 páginas.
- **Falta la sección de decisiones**: Si el proyecto necesita decisiones de los interesados, hacerlas explícitas con plazos.
- **Datos obsoletos**: Usar artefactos desactualizados lleva a informes engañosos. Verificar que las fechas de los artefactos coincidan con el período de reporte.
- **Falta de datos de tendencia**: Los primeros informes no pueden mostrar tendencias, pero los informes posteriores deben compararse con períodos anteriores.

## Habilidades Relacionadas

- `draft-project-charter` — el acta proporciona hitos y criterios de éxito para el seguimiento del estado
- `manage-backlog` — las métricas del backlog alimentan el informe de estado
- `plan-sprint` — los resultados del sprint proporcionan datos de velocidad y completado
- `create-work-breakdown-structure` — el completado de la EDT impulsa las métricas de progreso clásicas
- `conduct-retrospective` — los datos del informe de estado alimentan la retrospectiva
