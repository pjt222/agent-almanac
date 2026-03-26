---
name: create-team
description: >
  Crea un nuevo archivo de composición de equipo siguiendo la plantilla de
  equipo de agent-almanac y las convenciones del registro. Cubre la definición
  del propósito del equipo, la selección de miembros, la elección del patrón
  de coordinación, el diseño de la descomposición de tareas, el bloque de
  configuración legible por máquinas, la integración en el registro y la
  automatización del README. Usar al definir un flujo de trabajo multiagente,
  al componer agentes para un proceso de revisión complejo, o al crear un
  grupo coordinado para tareas colaborativas recurrentes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, creation, composition, coordination
  locale: es
  source_locale: en
  source_commit: acc252e6 # stale — source updated for teams infrastructure fix
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Crear un Nuevo Equipo

Define una composición de equipo multiagente que coordina dos o más agentes para realizar tareas que requieren múltiples perspectivas, especialidades o fases. El archivo de equipo resultante se integra con el registro de equipos y puede activarse en Claude Code por nombre.

## Cuándo Usar

- Una tarea requiere múltiples perspectivas que un solo agente no puede proporcionar (p.ej., revisión de código más auditoría de seguridad más revisión de arquitectura)
- Se necesita un flujo de trabajo colaborativo recurrente con asignaciones de roles consistentes y patrones de traspaso
- Una composición de agentes existente se usa repetidamente y debe formalizarse
- Un proceso complejo se descompone naturalmente en fases o especialidades manejadas por diferentes agentes
- Se quiere definir un grupo coordinado para trabajo basado en sprints, pipelines o paralelo

## Entradas

- **Requerido**: Nombre del equipo (kebab-case en minúsculas, p.ej., `data-pipeline-review`)
- **Requerido**: Propósito del equipo (un párrafo que describe qué problema requiere múltiples agentes)
- **Requerido**: Agente líder (debe existir en `agents/_registry.yml`)
- **Opcional**: Patrón de coordinación (por defecto: hub-and-spoke). Uno de: `hub-and-spoke`, `sequential`, `parallel`, `timeboxed`, `adaptive`
- **Opcional**: Número de miembros (por defecto: 3-4; rango recomendado: 2-5)
- **Opcional**: Material fuente (flujo de trabajo existente, manual de operaciones o composición de equipo ad-hoc para formalizar)

## Procedimiento

### Paso 1: Definir el Propósito del Equipo

Articular qué problema requiere que múltiples agentes trabajen juntos. Un propósito de equipo válido debe responder:

1. **¿Qué resultado** entrega este equipo? (p.ej., un informe de revisión completo, una aplicación desplegada, un incremento de sprint)
2. **¿Por qué un solo agente no puede hacer esto?** Identificar al menos dos especialidades o perspectivas distintas requeridas.
3. **¿Cuándo debe activarse este equipo?** Definir las condiciones de activación.

Escribir el propósito como un párrafo que un humano o agente pueda leer para decidir si activar este equipo.

**Esperado:** Un párrafo claro que explica la propuesta de valor del equipo, con al menos dos especialidades distintas identificadas.

**En caso de fallo:** Si no puedes identificar dos especialidades distintas, la tarea probablemente no necesita un equipo. Usar un solo agente con múltiples habilidades en su lugar.

### Paso 2: Seleccionar el Agente Líder

El agente líder orquesta el equipo. Elegir un agente de `agents/_registry.yml` que:

- Tenga experiencia en el dominio relevante para la producción principal del equipo
- Pueda descomponer las solicitudes entrantes en subtareas para otros miembros
- Pueda sintetizar los resultados de múltiples revisores en un entregable coherente

```bash
# Listar todos los agentes disponibles
grep "^  - id:" agents/_registry.yml
```

El líder también debe aparecer como miembro en la composición del equipo (el líder siempre es un miembro).

**Esperado:** Un agente seleccionado como líder, confirmado que existe en el registro de agentes.

**En caso de fallo:** Si ningún agente existente se adapta al rol de líder, crear uno primero usando la habilidad `create-agent` (o `agents/_template.md` manualmente). No crear un equipo con un líder que no existe como definición de agente.

### Paso 3: Seleccionar los Agentes Miembros

Elegir de 2 a 5 miembros (incluyendo al líder) con responsabilidades claras y no superpuestas. Para cada miembro, definir:

- **id**: Nombre del agente del registro de agentes
- **role**: Un título corto (p.ej., "Quality Reviewer", "Security Auditor", "Architecture Reviewer")
- **responsibilities**: Una oración que describe qué hace este miembro que ningún otro miembro hace

```bash
# Verificar que cada agente candidato existe
grep "id: agent-name-here" agents/_registry.yml
```

Validar la no superposición: ningún dos miembros deben tener la misma responsabilidad principal. Si las responsabilidades se superponen, ya sea fusionar los roles o afilar los límites.

**Esperado:** De 2 a 5 miembros seleccionados, cada uno con un rol único y responsabilidades claras, todos confirmados en el registro de agentes.

**En caso de fallo:** Si un agente necesario no existe, crearlo primero. Si las responsabilidades se superponen entre dos miembros, reescribirlas para aclarar los límites o eliminar un miembro.

### Paso 4: Elegir el Patrón de Coordinación

Seleccionar el patrón que mejor se adapte al flujo de trabajo del equipo. Los cinco patrones y sus casos de uso:

| Patrón | Cuándo usar | Equipos de ejemplo |
|--------|-------------|-------------------|
| **hub-and-spoke** | El líder distribuye tareas, recopila resultados y sintetiza. Mejor para flujos de trabajo de revisión y auditoría. | r-package-review, gxp-compliance-validation, ml-data-science-review |
| **sequential** | Cada agente construye sobre la salida del agente anterior. Mejor para pipelines y flujos de trabajo por etapas. | fullstack-web-dev, tending |
| **parallel** | Todos los agentes trabajan simultáneamente en subtareas independientes. Mejor cuando las subtareas no tienen dependencias. | devops-platform-engineering |
| **timeboxed** | El trabajo se organiza en iteraciones de longitud fija. Mejor para trabajo de proyecto continuo con un backlog. | scrum-team |
| **adaptive** | El equipo se auto-organiza según la tarea. Mejor para tareas desconocidas o muy variables. | opaque-team |

**Guía de decisión:**
- Si el líder debe ver todos los resultados antes de producir la salida: **hub-and-spoke**
- Si el agente B necesita la salida del agente A para empezar: **sequential**
- Si todos los agentes pueden trabajar sin ver la salida de los demás: **parallel**
- Si el trabajo abarca múltiples iteraciones con ceremonias de planificación: **timeboxed**
- Si no puedes predecir de antemano la estructura de la tarea: **adaptive**

**Esperado:** Un patrón de coordinación seleccionado con una justificación clara para la elección.

**En caso de fallo:** Si no estás seguro, por defecto hub-and-spoke. Es el patrón más común y funciona para la mayoría de los flujos de trabajo de revisión y análisis.

### Paso 5: Diseñar la Descomposición de Tareas

Definir cómo una solicitud entrante típica se divide entre los miembros del equipo. Estructurar esto como fases:

1. **Fase de configuración**: Lo que el líder hace para analizar la solicitud y crear tareas
2. **Fase de ejecución**: En qué trabaja cada miembro (en paralelo, en secuencia o por sprint según el patrón de coordinación)
3. **Fase de síntesis**: Cómo se recopilan los resultados y se produce el entregable final

Para cada miembro, listar de 3 a 5 tareas concretas que realizarían en una solicitud típica. Estas tareas aparecen tanto en la sección prosa de "Task Decomposition" como en la lista `tasks` del bloque CONFIG.

**Esperado:** Una descomposición estructurada por fases con tareas concretas por miembro, que coincida con el patrón de coordinación elegido.

**En caso de fallo:** Si las tareas son demasiado vagas (p.ej., "revisa cosas"), hacerlas específicas (p.ej., "revisa el estilo del código frente a la guía de estilo de tidyverse, verifica la cobertura de pruebas, evalúa la calidad de los mensajes de error").

### Paso 6: Escribir el Archivo del Equipo

Copiar la plantilla y completar todas las secciones:

```bash
cp teams/_template.md teams/<team-name>.md
```

Completar las siguientes secciones en orden:

1. **YAML frontmatter**: `name`, `description`, `lead`, `version` ("1.0.0"), `author`, `created`, `updated`, `tags`, `coordination`, `members[]` (cada uno con id, role, responsibilities)
2. **Title**: `# Team Name` (legible por humanos, en formato título)
3. **Introduction**: Resumen de un párrafo
4. **Purpose**: Por qué existe este equipo, qué especialidades combina
5. **Team Composition**: Tabla con columnas Member, Agent, Role, Focus Areas
6. **Coordination Pattern**: Descripción prosa más diagrama ASCII del flujo
7. **Task Decomposition**: Desglose por fases con tareas concretas por miembro
8. **Configuration**: Bloque CONFIG legible por máquinas (ver Paso 7)
9. **Usage Scenarios**: 2-3 escenarios concretos con ejemplos de prompts de usuario
10. **Limitations**: 3-5 restricciones conocidas
11. **See Also**: Enlaces a archivos de agentes miembros y habilidades/equipos relacionados

**Esperado:** Un archivo de equipo completo con todas las secciones completadas, sin texto de marcador de posición de la plantilla.

**En caso de fallo:** Comparar con un archivo de equipo existente (p.ej., `teams/r-package-review.md`) para verificar la estructura. Buscar strings de marcador de posición de plantilla como "your-team-name" o "another-agent" para encontrar secciones sin completar.

### Paso 7: Escribir el Bloque CONFIG

El bloque CONFIG entre los marcadores `<!-- CONFIG:START -->` y `<!-- CONFIG:END -->` proporciona YAML legible por máquinas para las herramientas. Estructurarlo de la siguiente manera:

    <!-- CONFIG:START -->
    ```yaml
    team:
      name: <team-name>
      lead: <lead-agent-id>
      coordination: <pattern>
      members:
        - agent: <agent-id>
          role: <role-title>
          subagent_type: <agent-id>  # Claude Code subagent type for spawning
        # ... repetir para cada miembro
      tasks:
        - name: <task-name>
          assignee: <agent-id>
          description: <one-line description>
        # ... repetir para cada tarea
        - name: synthesize-report  # tarea final si hub-and-spoke
          assignee: <lead-agent-id>
          description: <synthesis description>
          blocked_by: [<prior-task-names>]  # para ordenación de dependencias
    ```
    <!-- CONFIG:END -->

El campo `subagent_type` se mapea a los tipos de agentes de Claude Code. Para agentes definidos en `.claude/agents/`, usar el id del agente como el subagent_type. Usar `blocked_by` para expresar dependencias de tareas (p.ej., la síntesis está bloqueada por todas las tareas de revisión).

**Esperado:** El bloque CONFIG es YAML válido, todos los agentes coinciden con los de la lista de miembros del frontmatter, y las dependencias de tareas forman un DAG válido (sin ciclos).

**En caso de fallo:** Validar la sintaxis YAML. Verificar que cada `assignee` en la lista de tareas coincide con un `agent` en la lista de miembros. Comprobar que `blocked_by` hace referencia solo a nombres de tareas definidos anteriormente en la lista.

### Paso 8: Añadir al Registro

Editar `teams/_registry.yml` para añadir el nuevo equipo:

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

Actualizar el recuento `total_teams` al inicio del registro.

```bash
# Verificar que la entrada fue añadida
grep "id: <team-name>" teams/_registry.yml
```

**Esperado:** La nueva entrada aparece en el registro, el recuento `total_teams` se incrementa en uno.

**En caso de fallo:** Si el nombre del equipo ya existe en el registro, elegir un nombre diferente o actualizar la entrada existente. Verificar que la sangría YAML coincide con las entradas existentes.

### Paso 9: Ejecutar la Automatización de README

Regenerar los archivos README a partir del registro actualizado:

```bash
npm run update-readmes
```

Esto actualiza las secciones dinámicas en `teams/README.md` y cualquier otro archivo con marcadores `<!-- AUTO:START -->` / `<!-- AUTO:END -->` que hagan referencia a datos de equipos.

**Esperado:** El comando termina con 0, `teams/README.md` ahora lista el nuevo equipo.

**En caso de fallo:** Ejecutar `npm run check-readmes` para ver qué archivos están desincronizados. Si el script falla, verificar que `package.json` existe en la raíz del repositorio y `js-yaml` está instalado (`npm install`).

### Paso 10: Verificar la Activación del Equipo

Probar que el equipo puede activarse en Claude Code:

```
User: Use the <team-name> team to <typical task description>
```

Claude Code debe:
1. Encontrar el archivo del equipo en `teams/<team-name>.md`
2. Identificar al líder y los miembros
3. Seguir el patrón de coordinación descrito en el archivo

**Esperado:** Claude Code reconoce el nombre del equipo, identifica al líder y miembros correctos, y sigue el patrón de coordinación.

**En caso de fallo:** Verificar que el archivo del equipo está en `teams/<team-name>.md` (no en un subdirectorio). Comprobar que todos los agentes miembros existen en `.claude/agents/` (que enlaza a `agents/`). Confirmar que el equipo está listado en `teams/_registry.yml`.

## Validación

- [ ] El archivo del equipo existe en `teams/<team-name>.md`
- [ ] El frontmatter YAML se analiza sin errores
- [ ] Todos los campos de frontmatter requeridos presentes: `name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`
- [ ] Cada miembro en el frontmatter tiene `id`, `role` y `responsibilities`
- [ ] Todas las secciones presentes: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] El bloque CONFIG existe entre los marcadores `<!-- CONFIG:START -->` y `<!-- CONFIG:END -->`
- [ ] El YAML del bloque CONFIG es válido y analizable
- [ ] Todos los IDs de agentes miembros existen en `agents/_registry.yml`
- [ ] El agente líder aparece en la lista de miembros
- [ ] Ningún dos miembros comparten la misma responsabilidad principal
- [ ] El equipo está listado en `teams/_registry.yml` con la ruta, líder, miembros y coordinación correctos
- [ ] El recuento `total_teams` en el registro se incrementa
- [ ] `npm run update-readmes` se completa sin errores

## Errores Comunes

- **Demasiados miembros**: Los equipos con más de 5 miembros se vuelven difíciles de coordinar. La sobrecarga de distribuir tareas y sintetizar resultados supera el beneficio de perspectivas adicionales. Dividir en dos equipos o reducir a las especialidades esenciales.
- **Responsabilidades superpuestas**: Si dos miembros "revisan la calidad del código", sus hallazgos entrarán en conflicto y el líder perderá tiempo deduplicando. Cada miembro debe tener un área de enfoque claramente distinta.
- **Patrón de coordinación incorrecto**: Usar hub-and-spoke cuando los agentes necesitan la salida de los demás (debería ser sequential), o usar sequential cuando los agentes pueden trabajar independientemente (debería ser parallel). Revisar la guía de decisión en el Paso 4.
- **Bloque CONFIG faltante**: El bloque CONFIG no es una decoración en prosa opcional. Las herramientas lo leen para crear automáticamente equipos con `TeamCreate`. Sin él, el archivo del equipo solo es legible por humanos y no puede activarse programáticamente.
- **Agente líder no en la lista de miembros**: El líder también debe aparecer como miembro con su propio rol y responsabilidades. Un líder que solo "coordina" sin hacer trabajo sustantivo desperdicia un espacio. Dar al líder una responsabilidad concreta de revisión o síntesis.

## Habilidades Relacionadas

- `create-skill` - sigue el mismo meta-patrón para crear archivos SKILL.md
- `create-agent` - crear definiciones de agentes que sirvan como miembros del equipo
- `commit-changes` - confirmar el nuevo archivo del equipo y las actualizaciones del registro
