---
name: evolve-team
description: >
  Evoluciona una composición de equipo existente refinando su estructura en el
  lugar o creando una variante especializada. Cubre la evaluación del equipo
  actual frente a la plantilla y los patrones de coordinación, la recopilación
  de requisitos de evolución, la elección del alcance (ajustar miembros, cambiar
  el patrón de coordinación, dividir/fusionar equipos), la aplicación de cambios
  al archivo del equipo y el bloque CONFIG, la actualización de metadatos de
  versión y la sincronización del registro y las referencias cruzadas. Usar
  cuando el roster de miembros de un equipo está desactualizado, el patrón de
  coordinación ya no encaja, los comentarios de usuarios revelan brechas en el
  flujo de trabajo, se necesita una variante especializada junto a la original,
  o los agentes han sido añadidos o eliminados de la biblioteca afectando la
  composición del equipo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, evolution, coordination, maintenance
  locale: es
  source_locale: en
  source_commit: 971b2bdc
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Evolucionar un Equipo Existente

Mejora, reestructura o crea una variante especializada de un equipo que fue creado originalmente con `create-team`. Este procedimiento cubre el lado de mantenimiento del ciclo de vida del equipo: evaluar brechas frente a la plantilla y los patrones de coordinación, aplicar mejoras específicas a la composición y el flujo de trabajo, actualizar versiones y mantener sincronizados el registro y las referencias cruzadas.

## Cuándo Usar

- El roster de miembros de un equipo está desactualizado tras añadir, eliminar o evolucionar agentes
- Los comentarios de usuarios revelan cuellos de botella en el flujo de trabajo, traspasos poco claros o perspectivas faltantes
- El patrón de coordinación ya no encaja en el flujo de trabajo real del equipo (p.ej., hub-and-spoke debería ser parallel)
- Se necesita una variante especializada junto a la original (p.ej., `r-package-review` y `r-package-review-security-focused`)
- Las responsabilidades de los miembros del equipo se superponen y necesitan límites más claros
- El bloque CONFIG está desincronizado con la descripción en prosa o la lista de miembros
- Un equipo necesita dividirse en dos equipos más pequeños o dos equipos necesitan fusionarse

## Entradas

- **Requerido**: Ruta al archivo de equipo existente que se va a evolucionar (p.ej., `teams/r-package-review.md`)
- **Requerido**: Disparador de evolución (comentario, nuevos agentes, desajuste de coordinación, solapamiento de alcance, problemas de rendimiento, evolución de agentes)
- **Opcional**: Magnitud objetivo del incremento de versión (parche, menor, mayor)
- **Opcional**: Si crear una variante especializada en lugar de refinar en el lugar (por defecto: refinar en el lugar)

## Procedimiento

### Paso 1: Evaluar el Equipo Actual

Leer el archivo de equipo existente y evaluar cada sección frente a la plantilla de equipo (`teams/_template.md`):

| Sección | Qué verificar | Problemas comunes |
|---------|--------------|------------------|
| Frontmatter | Todos los campos requeridos (`name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`) | Falta `tags`, `version` obsoleta, `coordination` incorrecta |
| Purpose | Justificación clara de múltiples agentes (al menos dos especialidades distintas) | Podría manejarse por un solo agente |
| Team Composition | La tabla coincide con los miembros del frontmatter, sin responsabilidades superpuestas | Tabla obsoleta, áreas de enfoque duplicadas |
| Coordination Pattern | Coincide con el flujo de trabajo real, diagrama ASCII presente | Patrón incorrecto para el flujo de trabajo |
| Task Decomposition | Desglose por fases con tareas concretas por miembro | Tareas vagas, fases faltantes |
| CONFIG Block | YAML válido entre marcadores, coincide con frontmatter y prosa | Desincronizado, falta `blocked_by`, YAML inválido |
| Usage Scenarios | 2-3 prompts de activación realistas | Texto de marcador |
| Limitations | 3-5 restricciones honestas | Faltantes o demasiado genéricas |
| See Also | Enlaces válidos a agentes miembros, equipos relacionados, guías | Enlaces obsoletos |

```bash
# Leer el archivo del equipo
cat teams/<team-name>.md

# Verificar que todos los agentes miembros aún existen
grep "id:" teams/<team-name>.md | while read line; do
  agent=$(echo "$line" | grep -oP '(?<=id: )[\w-]+')
  grep "id: $agent" agents/_registry.yml || echo "MISSING: $agent"
done

# Comprobar si alguna guía referencia este equipo
grep -r "<team-name>" guides/*.md
```

**Esperado:** Una lista de brechas específicas, debilidades u oportunidades de mejora organizadas por sección.

**En caso de fallo:** Si el archivo del equipo no existe o no tiene frontmatter, esta habilidad no aplica — usar `create-team` en su lugar para crearlo desde cero.

### Paso 2: Reunir los Requisitos de Evolución

Identificar y categorizar qué desencadenó la evolución:

| Disparador | Ejemplo | Alcance típico |
|-----------|---------|---------------|
| Comentario del usuario | "Las revisiones tardan demasiado, los agentes duplican esfuerzo" | Afinar responsabilidades o cambiar patrón |
| Nuevo agente disponible | Se creó el agente `api-security-analyst` | Añadir miembro |
| Agente evolucionado | `code-reviewer` ganó nuevas habilidades | Actualizar responsabilidades del miembro |
| Agente eliminado | `deprecated-agent` fue retirado | Eliminar miembro, reasignar tareas |
| Desajuste de coordinación | Equipo secuencial tiene subtareas independientes | Cambiar a parallel |
| Expansión de alcance | El equipo necesita cubrir el despliegue, no solo la revisión | Añadir miembro o crear variante |
| Equipo demasiado grande | 6+ miembros causando sobrecarga de coordinación | Dividir en dos equipos |
| Equipo demasiado pequeño | Un solo miembro hace la mayor parte del trabajo | Fusionar con otro equipo o añadir miembros |

Documentar los cambios específicos necesarios antes de editar:

```
- Frontmatter: añadir nuevo miembro `api-security-analyst` con rol "API Security Reviewer"
- Team Composition: añadir fila a la tabla de composición
- Task Decomposition: añadir tareas de revisión de seguridad API a la fase de ejecución
- CONFIG block: añadir entradas de miembro y tareas
- See Also: añadir enlace al nuevo archivo de agente
```

**Esperado:** Una lista concreta de cambios, cada uno mapeado a una sección específica del archivo del equipo.

**En caso de fallo:** Si los cambios no están claros, consultar al usuario para aclaración antes de proceder. Los objetivos de evolución vagos producen mejoras vagas.

### Paso 3: Elegir el Alcance de la Evolución

Usar esta matriz de decisión para determinar si refinar en el lugar o crear una variante:

| Criterios | Refinamiento (en el lugar) | Variante Especializada (nuevo equipo) |
|-----------|---------------------------|--------------------------------------|
| ID del equipo | Sin cambios | Nuevo ID: `<team>-<specialty>` |
| Ruta del archivo | Mismo archivo `.md` | Nuevo archivo en `teams/` |
| Incremento de versión | Parche o menor | Comienza en 1.0.0 |
| Coordinación | Puede cambiar | Puede diferir del original |
| Registro | Actualizar entrada existente | Nueva entrada añadida |
| Equipo original | Modificado directamente | Intacto, gana referencia cruzada en Ver También |

**Refinamiento**: Elegir al ajustar miembros, afinar responsabilidades, corregir el bloque CONFIG o cambiar el patrón de coordinación. El equipo mantiene su identidad.

**Variante**: Elegir cuando la versión evolucionada serviría a un caso de uso sustancialmente diferente, requeriría un patrón de coordinación diferente o apuntaría a una audiencia diferente. El original permanece como está para su caso de uso existente.

Decisiones adicionales de alcance:

| Situación | Acción |
|-----------|--------|
| El equipo tiene 6+ miembros y es lento | Dividir en dos equipos enfocados |
| Dos equipos de 2 cubren dominios adyacentes | Fusionar en un equipo de 3-4 |
| El patrón de coordinación del equipo es incorrecto | Refinamiento — cambiar patrón en el lugar |
| El equipo necesita un líder completamente diferente | Refinamiento si el líder existe; crear agente primero si no |

**Esperado:** Una decisión clara — refinamiento, variante, división o fusión — con justificación.

**En caso de fallo:** Si no estás seguro, por defecto optar por refinamiento. Dividir o fusionar equipos tiene mayor radio de impacto y debe confirmarse con el usuario.

### Paso 4: Aplicar los Cambios al Archivo del Equipo

#### Para Refinamientos

Editar el archivo de equipo existente directamente. Mantener la consistencia en todas las secciones que hacen referencia a la composición del equipo:

1. **`members[]` del frontmatter**: Añadir, eliminar o actualizar entradas de miembros (cada uno con `id`, `role`, `responsibilities`)
2. **Tabla de Team Composition**: Debe coincidir exactamente con los miembros del frontmatter
3. **Coordination Pattern**: Actualizar la prosa y el diagrama ASCII si el patrón cambia
4. **Task Decomposition**: Revisar las fases y las tareas por miembro para reflejar la nueva composición
5. **Bloque CONFIG**: Actualizar las listas de `members` y `tasks` para que coincidan (ver Paso 5)
6. **Usage Scenarios**: Revisar si los disparadores de activación del equipo cambiaron
7. **Limitations**: Actualizar para reflejar nuevas restricciones o eliminar las resueltas
8. **See Also**: Actualizar los enlaces de agentes y añadir referencias a nuevos equipos o guías relacionados

Seguir estas reglas de edición:
- Preservar todas las secciones existentes — añadir contenido, no eliminar secciones
- Al añadir un miembro, añadirlo a TODOS: frontmatter, tabla de composición, descomposición de tareas y bloque CONFIG
- Al eliminar un miembro, eliminarlo de TODOS esos lugares y reasignar sus tareas
- Verificar que cada agente miembro existe: `grep "id: agent-name" agents/_registry.yml`
- Mantener al líder en la lista de miembros — el líder siempre es un miembro

#### Para Variantes

```bash
# Copiar el original como punto de partida
cp teams/<team-name>.md teams/<team-name>-<specialty>.md

# Editar la variante:
# - Cambiar `name` a `<team-name>-<specialty>`
# - Actualizar `description` para reflejar el alcance especializado
# - Ajustar el patrón `coordination` si es necesario
# - Restablecer `version` a "1.0.0"
# - Modificar miembros, tareas y bloque CONFIG para el caso de uso especializado
# - Referenciar el original en Ver También como alternativa de propósito general
```

**Esperado:** El archivo del equipo (refinado o nueva variante) pasa la lista de verificación de evaluación del Paso 1, con todas las secciones internamente consistentes.

**En caso de fallo:** Si una edición rompe la consistencia interna (p.ej., el bloque CONFIG lista un miembro no en el frontmatter), comparar el `members[]` del frontmatter con la tabla de Team Composition, Task Decomposition y el bloque CONFIG para encontrar el desajuste.

### Paso 5: Actualizar el Bloque CONFIG

El bloque CONFIG entre `<!-- CONFIG:START -->` y `<!-- CONFIG:END -->` debe mantenerse sincronizado con las secciones en prosa. Tras cualquier cambio de miembro o tarea:

1. Verificar que cada `agent` en los `members` del CONFIG coincide con un miembro en el frontmatter
2. Verificar que cada `assignee` en las `tasks` del CONFIG coincide con un ID de agente miembro
3. Actualizar las dependencias `blocked_by` si el orden de las tareas cambió
4. Asegurar que la tarea de síntesis/final hace referencia a todas las tareas prerequisito

```yaml
team:
  name: <team-name>
  lead: <lead-agent>
  coordination: <pattern>
  members:
    - agent: <agent-id>
      role: <role-title>
      subagent_type: <agent-id>
  tasks:
    - name: <task-name>
      assignee: <agent-id>
      description: <one-line>
    - name: synthesize-results
      assignee: <lead-agent>
      description: Collect and synthesize all member outputs
      blocked_by: [<prior-task-names>]
```

**Esperado:** El YAML del CONFIG es válido, todos los agentes y tareas son consistentes con el resto del archivo, y `blocked_by` forma un DAG válido.

**En caso de fallo:** Analizar el YAML del bloque CONFIG por separado para encontrar errores de sintaxis. Verificar cada `assignee` frente a la lista de `members`.

### Paso 6: Actualizar la Versión y los Metadatos

Incrementar el campo `version` en el frontmatter siguiendo el versionado semántico:

| Tipo de cambio | Incremento de versión | Ejemplo |
|---------------|----------------------|---------|
| Corrección de redacción, actualización de Ver También | Parche: 1.0.0 → 1.0.1 | Enlace de agente obsoleto corregido |
| Nuevo miembro añadido, tareas revisadas | Menor: 1.0.0 → 1.1.0 | Añadido miembro security-analyst |
| Patrón de coordinación cambiado, equipo reestructurado | Mayor: 1.0.0 → 2.0.0 | Cambiado de hub-and-spoke a parallel |

También actualizar:
- Fecha `updated` a la fecha actual
- `tags` si la cobertura de dominio del equipo cambió
- `description` si el propósito del equipo es materialmente diferente
- `coordination` si el patrón cambió

**Esperado:** `version` y `updated` del frontmatter reflejan la magnitud y fecha de los cambios. Las nuevas variantes comienzan en `"1.0.0"`.

**En caso de fallo:** Si olvidas incrementar la versión, la próxima evolución no tendrá forma de distinguir el estado actual del anterior. Siempre incrementar antes de confirmar.

### Paso 7: Actualizar el Registro y las Referencias Cruzadas

#### Para Refinamientos

Actualizar la entrada existente en `teams/_registry.yml` para que coincida con el frontmatter revisado:

```bash
# Encontrar la entrada del registro del equipo
grep -A 10 "id: <team-name>" teams/_registry.yml
```

Actualizar los campos `description`, `lead`, `members` y `coordination` para que coincidan con el archivo del equipo. No se necesita cambio de recuento.

#### Para Variantes

Añadir el nuevo equipo a `teams/_registry.yml`:

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

Luego:
1. Incrementar `total_teams` al inicio del registro
2. Añadir referencia cruzada Ver También en el equipo original apuntando a la variante
3. Añadir referencia cruzada Ver También en la variante apuntando al original

Ejecutar la automatización de README:

```bash
npm run update-readmes
```

**Esperado:** La entrada del registro coincide con el frontmatter del archivo del equipo. `npm run update-readmes` termina con 0. Para variantes, `total_teams` es igual al número real de entradas de equipos.

**En caso de fallo:** Si el recuento del registro es incorrecto, contar entradas con `grep -c "^  - id:" teams/_registry.yml` y corregir el recuento. Si la automatización de README falla, verificar que `package.json` existe y `js-yaml` está instalado.

### Paso 8: Validar el Equipo Evolucionado

Ejecutar la lista de verificación de validación completa:

- [ ] El archivo del equipo existe en la ruta esperada
- [ ] El frontmatter YAML se analiza sin errores
- [ ] `version` fue incrementada (refinamiento) o establecida en "1.0.0" (variante)
- [ ] La fecha `updated` refleja hoy
- [ ] Todas las secciones requeridas presentes: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] El `members[]` del frontmatter coincide con la tabla de Team Composition
- [ ] Los miembros del bloque CONFIG coinciden con los miembros del frontmatter
- [ ] Las tareas del bloque CONFIG tienen asignados válidos y referencias `blocked_by`
- [ ] Todos los IDs de agentes miembros existen en `agents/_registry.yml`
- [ ] El agente líder aparece en la lista de miembros
- [ ] Ningún dos miembros comparten la misma responsabilidad principal
- [ ] La entrada del registro existe y coincide con el frontmatter
- [ ] Para variantes: el recuento `total_teams` coincide con el recuento real en disco
- [ ] Las referencias cruzadas son bidireccionales (original ↔ variante)
- [ ] `git diff` no muestra eliminaciones accidentales del contenido original

```bash
# Verificar frontmatter
head -25 teams/<team-name>.md

# Verificar que todos los agentes miembros existen
for agent in agent-a agent-b agent-c; do
  grep "id: $agent" agents/_registry.yml
done

# Contar equipos en disco vs registro
ls teams/*.md | grep -v template | wc -l
grep total_teams teams/_registry.yml

# Revisar todos los cambios
git diff
```

**Esperado:** Todos los elementos de la lista de verificación pasan. El equipo evolucionado está listo para confirmar.

**En caso de fallo:** Abordar cada elemento fallido individualmente. Los problemas más comunes tras la evolución son la desviación del bloque CONFIG (miembros o tareas que no coinciden con la prosa) y una fecha `updated` olvidada.

## Validación

- [ ] El archivo del equipo existe y tiene frontmatter YAML válido
- [ ] El campo `version` refleja los cambios realizados
- [ ] La fecha `updated` es actual
- [ ] Todas las secciones presentes e internamente consistentes
- [ ] El `members[]` del frontmatter, la tabla de Team Composition y el bloque CONFIG están sincronizados
- [ ] Todos los IDs de agentes miembros existen en `agents/_registry.yml`
- [ ] El agente líder está en la lista de miembros
- [ ] El YAML del bloque CONFIG es válido y analizable
- [ ] La entrada del registro coincide con el archivo del equipo
- [ ] Para variantes: nueva entrada en `teams/_registry.yml` con la ruta correcta
- [ ] Para variantes: recuento `total_teams` actualizado
- [ ] Las referencias cruzadas son válidas (sin enlaces rotos en Ver También)
- [ ] `git diff` confirma que no se eliminó contenido accidentalmente

## Errores Comunes

- **Desviación del bloque CONFIG**: El bloque CONFIG, el frontmatter y las secciones en prosa deben coincidir en miembros y tareas. Actualizar uno sin los demás es el error más común de evolución de equipos. Tras cada cambio, verificar los tres.
- **Olvidar incrementar la versión**: Sin incrementos de versión, no hay forma de rastrear qué cambió o cuándo. Siempre actualizar `version` y `updated` en el frontmatter antes de confirmar.
- **Referencias de miembro huérfanas**: Al eliminar un miembro, sus tareas en Task Decomposition y el bloque CONFIG deben reasignarse o eliminarse. Dejar asignados huérfanos causa fallos de activación.
- **Patrón de coordinación incorrecto tras la evolución**: Añadir miembros con capacidad parallel a un equipo secuencial, o hacer un equipo hub-and-spoke donde los agentes necesitan la salida de los demás. Reevaluar la decisión de patrón de `create-team` Paso 4 tras cualquier cambio estructural.
- **Equipo demasiado grande tras añadir miembros**: Los equipos con más de 5 miembros se vuelven difíciles de coordinar. Si la evolución empuja al equipo más allá de 5, considerar dividirlo en dos equipos enfocados en su lugar.
- **Ver También obsoleto tras la creación de variante**: Al crear una variante, tanto el original como la variante necesitan referenciarse mutuamente. Las referencias unidireccionales dejan el grafo incompleto.

## Habilidades Relacionadas

- `create-team` — base para la creación de nuevos equipos; evolve-team asume que esto se siguió originalmente
- `evolve-skill` — el procedimiento paralelo para evolucionar archivos SKILL.md
- `evolve-agent` — el procedimiento paralelo para evolucionar definiciones de agentes
- `commit-changes` — confirmar el equipo evolucionado con un mensaje descriptivo
