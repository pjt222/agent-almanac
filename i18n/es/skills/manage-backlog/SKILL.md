---
name: manage-backlog
description: >
  Crear y mantener un backlog de producto o proyecto con elementos priorizados,
  criterios de aceptación y estimaciones. Cubre la escritura de historias de
  usuario, la priorización MoSCoW, el refinamiento del backlog, la división de
  elementos y el seguimiento de estados. Usar al iniciar un nuevo proyecto y
  convertir el alcance en elementos accionables, durante el refinamiento continuo
  antes de la planificación del sprint, al repriorizar después de comentarios de
  interesados o cambios de alcance, o al dividir elementos sobredimensionados en
  piezas implementables.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Gestionar un Backlog de Producto

Crear, priorizar y mantener un backlog de elementos de trabajo que sirva como única fuente de verdad sobre lo que debe hacerse, aplicable tanto a metodologías de proyecto ágiles como clásicas.

## Cuándo Usar

- Al iniciar un nuevo proyecto y convertir el alcance en elementos accionables
- Refinamiento continuo del backlog antes de la planificación del sprint
- Al repriorizar el trabajo después de comentarios de interesados o cambios de alcance
- Al dividir elementos sobredimensionados en piezas implementables
- Al revisar y archivar elementos completados o cancelados

## Entradas

- **Requerido**: Alcance del proyecto (del acta, EDT o información de interesados)
- **Opcional**: Archivo de backlog existente (BACKLOG.md) para actualizar
- **Opcional**: Preferencia de marco de priorización (MoSCoW, valor/esfuerzo, WSJF)
- **Opcional**: Escala de estimación (puntos de historia, tallas de camiseta, persona-días)
- **Opcional**: Retroalimentación de sprint o iteración que requiera actualizaciones del backlog

## Procedimiento

### Paso 1: Crear o Cargar la Estructura del Backlog

Si no existe ningún backlog, crear BACKLOG.md con columnas estándar. Si ya existe, leer y validar la estructura.

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

**Esperado:** BACKLOG.md existe con estructura válida y estadísticas de resumen.

**En caso de fallo:** Si el archivo está malformado, reestructurarlo preservando los datos de los elementos existentes.

### Paso 2: Redactar o Refinar Elementos

Para cada nuevo elemento, redactarlo como una historia de usuario o requisito:

- **Formato de historia de usuario**: "Como [rol], quiero [capacidad] para que [beneficio]"
- **Formato de requisito**: "[Sistema/Componente] deberá [comportamiento] cuando [condición]"

Cada elemento debe tener:
- ID único (B-NNN, incremental)
- Título claro (forma verbal imperativa)
- Clasificación de tipo
- Al menos 2 criterios de aceptación (verificables, aprobación/rechazo binario)

Ejemplo:
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

**Esperado:** Todos los elementos tienen títulos, tipos y criterios de aceptación.

**En caso de fallo:** Los elementos sin criterios de aceptación se marcan con Estado: New (no Ready). No pueden entrar a un sprint.

### Paso 3: Priorizar Usando MoSCoW o Valor/Esfuerzo

Aplicar el marco de priorización elegido:

**MoSCoW** (predeterminado):
- **Must** (Debe): El proyecto falla sin esto. No negociable.
- **Should** (Debería): Importante pero el proyecto puede tener éxito sin ello. Incluir si la capacidad lo permite.
- **Could** (Podría): Agradable de tener. Incluir solo si no hay impacto en los elementos Must/Should.
- **Won't** (No): Explícitamente excluido del alcance actual. Documentado para consideración futura.

**Matriz Valor/Esfuerzo** (alternativa):

| | Bajo Esfuerzo | Alto Esfuerzo |
|---|-----------|-------------|
| **Alto Valor** | Hacer Primero (Victorias Rápidas) | Hacer Segundo (Grandes Apuestas) |
| **Bajo Valor** | Hacer Tercero (Relleno) | No Hacer (Sumideros de Dinero) |

Ordenar la tabla del backlog: primero los elementos Must (por valor dentro de Must), luego Should, luego Could.

**Esperado:** Cada elemento tiene una prioridad. El backlog está ordenado por prioridad.

**En caso de fallo:** Si los interesados no están de acuerdo en las prioridades, escalar las decisiones Must vs Should al patrocinador del proyecto.

### Paso 4: Refinamiento — Dividir, Estimar y Refinar

Revisar los elementos para su disposición para el sprint. Para cada elemento:
1. **Dividir** si la estimación es >8 puntos (o >1 semana de esfuerzo): descomponer en 2-4 elementos más pequeños
2. **Estimar** usando la escala elegida del proyecto
3. **Refinar** criterios de aceptación vagos convirtiéndolos en condiciones verificables
4. **Marcar como Ready** cuando el elemento tenga título, criterios de aceptación, estimación y sin bloqueadores

Documentar la división:
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

**Esperado:** Todos los elementos Must y Should están en estado Ready.

**En caso de fallo:** Los elementos que no pueden estimarse necesitan un Spike (tarea de investigación con tiempo fijo) añadido al backlog.

### Paso 5: Actualizar el Resumen y Archivar

Actualizar las estadísticas de resumen. Mover los elementos Done y Cancelled a una sección de archivo:

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

Actualizar el resumen contando los elementos en cada estado:
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**Esperado:** Las estadísticas de resumen coinciden con los recuentos reales de elementos. La sección de archivo contiene todos los elementos cerrados.

**En caso de fallo:** Si los recuentos no coinciden, recontarlos buscando valores de Estado y actualizar el resumen manualmente.

## Validación

- [ ] BACKLOG.md existe con estructura estándar
- [ ] Cada elemento tiene un ID único, título, tipo, prioridad y estado
- [ ] Todos los elementos Must y Should tienen criterios de aceptación
- [ ] Los elementos están ordenados por prioridad (primero Must, luego Should, luego Could)
- [ ] Ningún elemento estimado en >8 puntos sin haber sido dividido
- [ ] Las estadísticas de resumen son precisas
- [ ] Los elementos Done/Cancelled están archivados

## Errores Comunes

- **Sin criterios de aceptación**: Los elementos sin criterios no pueden verificarse como terminados. Cada elemento necesita al menos 2 criterios verificables.
- **Todo es prioridad Must**: Si >50% de los elementos son Must, las prioridades no son reales. Forzar un ranking dentro de Must.
- **Elementos zombi**: Los elementos que llevan meses en el backlog sin avance deben reevaluarse o cancelarse.
- **Estimaciones sin contexto**: Los puntos de historia son relativos — un equipo debe tener un elemento de referencia (por ejemplo, "B-001 es nuestro elemento de referencia de 3 puntos").
- **La división crea fragmentos**: Al dividir, asegurarse de que cada elemento hijo sea entregable y valioso de forma independiente.
- **El backlog como basurero**: El backlog no es una lista de deseos. Podar regularmente los elementos que ya no se alinean con los objetivos del proyecto.
- **Dependencias faltantes**: Anotar los elementos bloqueantes en el campo Notes. Un elemento bloqueado no debe marcarse como Ready.

## Habilidades Relacionadas

- `draft-project-charter` — el alcance del acta alimenta la creación inicial del backlog
- `create-work-breakdown-structure` — los paquetes de trabajo de la EDT pueden convertirse en elementos del backlog
- `plan-sprint` — la planificación del sprint selecciona de la parte superior del backlog
- `generate-status-report` — el burn-down del backlog alimenta los informes de estado
- `conduct-retrospective` — los elementos de mejora de la retrospectiva se retroalimentan en el backlog
