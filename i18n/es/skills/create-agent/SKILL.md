---
name: create-agent
description: >
  Crea un nuevo archivo de definición de agente siguiendo la plantilla de
  agente de agent-almanac y las convenciones del registro. Cubre el diseño de
  la persona, la selección de herramientas, la asignación de habilidades, la
  elección del modelo, el esquema de frontmatter, las secciones requeridas, la
  integración en el registro y la verificación de symlinks de descubrimiento.
  Usar al añadir un nuevo agente especializado a la biblioteca, al definir una
  persona para un subagente de Claude Code, o al crear un asistente específico
  de dominio con habilidades y herramientas seleccionadas.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, creation, persona, agentskills
  locale: es
  source_locale: en
  source_commit: b4dd42cd
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Crear un Nuevo Agente

Define una persona de subagente de Claude Code con un propósito enfocado, herramientas seleccionadas, habilidades asignadas y documentación completa siguiendo la plantilla de agente y las convenciones del registro.

## Cuándo Usar

- Al añadir un nuevo agente especialista a la biblioteca para un dominio aún no cubierto
- Al convertir un flujo de trabajo recurrente o patrón de prompt en una persona de agente reutilizable
- Al crear un asistente específico de dominio con habilidades seleccionadas y herramientas restringidas
- Al dividir un agente demasiado amplio en agentes enfocados con responsabilidad única
- Al diseñar un nuevo miembro del equipo antes de componer un equipo multiagente

## Entradas

- **Requerido**: Nombre del agente (kebab-case en minúsculas, p.ej., `data-engineer`)
- **Requerido**: Descripción de una línea del propósito principal del agente
- **Requerido**: Declaración de propósito que explique el problema que el agente resuelve
- **Opcional**: Elección del modelo (por defecto: `sonnet`; alternativas: `opus`, `haiku`)
- **Opcional**: Nivel de prioridad (por defecto: `normal`; alternativas: `high`, `low`)
- **Opcional**: Lista de habilidades de `skills/_registry.yml` para asignar
- **Opcional**: Servidores MCP que el agente requiere (p.ej., `r-mcptools`, `hf-mcp-server`)

## Procedimiento

### Paso 1: Diseñar la Persona del Agente

Elegir una identidad clara y enfocada para el agente:

- **Nombre**: kebab-case en minúsculas, descriptivo del rol. Comenzar con un sustantivo o calificador de dominio: `security-analyst`, `r-developer`, `tour-planner`. Evitar nombres genéricos como `helper` o `assistant`.
- **Propósito**: un párrafo que explique el problema específico que resuelve este agente. Pregunta: "¿Qué hace este agente que ningún agente existente cubre?"
- **Estilo de comunicación**: considerar el dominio. Los agentes técnicos deben ser precisos y con muchas citas. Los agentes creativos pueden ser más exploratorios. Los agentes de cumplimiento deben ser formales y orientados a auditorías.

Antes de continuar, verificar si hay solapamiento con los 53 agentes existentes:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**Esperado:** Ningún agente existente cubre el mismo nicho. Si un agente existente se superpone parcialmente, considerar extenderlo en lugar de crear uno nuevo.

**En caso de fallo:** Si existe un agente con solapamiento significativo, ya sea extender la lista de habilidades de ese agente o reducir el alcance del nuevo agente para complementar en lugar de duplicar.

### Paso 2: Seleccionar las Herramientas

Elegir el conjunto mínimo de herramientas que el agente necesita. Se aplica el principio de mínimo privilegio:

| Conjunto de herramientas | Cuándo usar | Ejemplos de agentes |
|--------------------------|-------------|---------------------|
| `[Read, Grep, Glob]` | Análisis de solo lectura, revisión, auditoría | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | Análisis más búsquedas externas | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | Desarrollo completo — crear/modificar código | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | Desarrollo más investigación externa | polymath, shapeshifter |

No incluir `Bash` para agentes que solo analizan código. No incluir `WebFetch` o `WebSearch` a menos que el agente genuinamente necesite consultar recursos externos.

**Esperado:** La lista de herramientas contiene solo las herramientas que el agente usará realmente en sus flujos de trabajo principales.

**En caso de fallo:** Revisar la lista de capacidades del agente — si una capacidad no requiere una herramienta, eliminar la herramienta.

### Paso 3: Elegir el Modelo

Seleccionar el modelo según la complejidad de la tarea:

- **`sonnet`** (por defecto): La mayoría de los agentes. Buen equilibrio entre razonamiento y velocidad. Usar para desarrollo, revisión, análisis y flujos de trabajo estándar.
- **`opus`**: Razonamiento complejo, planificación en múltiples pasos, juicio matizado. Usar para agentes de nivel sénior, decisiones arquitectónicas o tareas que requieren profunda experiencia en el dominio.
- **`haiku`**: Respuestas simples y rápidas. Usar para agentes que realizan búsquedas sencillas, formateo o relleno de plantillas.

**Esperado:** El modelo coincide con las demandas cognitivas de los casos de uso principales del agente.

**En caso de fallo:** En caso de duda, usar `sonnet`. Actualizar a `opus` solo si las pruebas revelan calidad de razonamiento insuficiente.

### Paso 4: Asignar Habilidades

Explorar el registro de habilidades y seleccionar las habilidades relevantes para el dominio del agente:

```bash
# Listar todas las habilidades en un dominio
grep -A3 "domain-name:" skills/_registry.yml

# Buscar habilidades por palabra clave
grep -i "keyword" skills/_registry.yml
```

Construir la lista de habilidades para el frontmatter:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**Importante**: Todos los agentes heredan automáticamente las habilidades por defecto (`meditate`, `heal`) del campo `default_skills` a nivel de registro. NO listar estas en el frontmatter del agente a menos que sean fundamentales para la metodología del agente (p.ej., el agente `mystic` lista `meditate` porque la facilitación de la meditación es su propósito principal).

**Esperado:** La lista de habilidades contiene de 3 a 15 IDs de habilidades que existen en `skills/_registry.yml`.

**En caso de fallo:** Verificar que cada ID de habilidad existe: `grep "id: skill-name" skills/_registry.yml`. Eliminar los que no coincidan.

### Paso 5: Escribir el Archivo del Agente

Copiar la plantilla y completar el frontmatter:

```bash
cp agents/_template.md agents/<agent-name>.md
```

Completar el frontmatter YAML:

```yaml
---
name: agent-name
description: One to two sentences describing primary capability and domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Note: All agents inherit default skills (meditate, heal) from the registry.
# Only list them here if they are core to this agent's methodology.
# mcp_servers: []  # Uncomment and populate if MCP servers are needed
---
```

**Esperado:** El frontmatter YAML se analiza sin errores. Todos los campos requeridos (`name`, `description`, `tools`, `model`, `version`, `author`) están presentes.

**En caso de fallo:** Validar la sintaxis YAML. Problemas comunes: comillas faltantes alrededor de strings de versión, sangría incorrecta, corchetes no cerrados en las listas de herramientas.

### Paso 6: Escribir el Propósito y las Capacidades

Reemplazar las secciones de marcador de posición de la plantilla:

**Purpose**: Un párrafo que explique el problema específico que resuelve este agente y el valor que proporciona. Ser concreto — nombrar el dominio, el flujo de trabajo y el resultado.

**Capabilities**: Lista con viñetas con encabezados en negrita. Agrupar por categoría si el agente tiene muchas capacidades:

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**: Listar cada habilidad asignada con una breve descripción. Usar IDs de habilidades simples (los nombres de comandos slash):

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**Esperado:** El propósito es específico (no "ayuda con el desarrollo"), las capacidades son concretas y verificables, la lista de habilidades coincide con el frontmatter.

**En caso de fallo:** Si el propósito se siente vago, responder: "¿Qué tarea específica pediría un usuario a este agente que realice?" Usar esa respuesta como el propósito.

### Paso 7: Escribir Escenarios de Uso y Ejemplos

Proporcionar 2-3 escenarios de uso que muestren cómo invocar al agente:

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

Añadir 1-2 ejemplos concretos que muestren una solicitud del usuario y el comportamiento esperado del agente:

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**Esperado:** Los escenarios son realistas, los ejemplos muestran valor real, los patrones de invocación coinciden con las convenciones de Claude Code.

**En caso de fallo:** Probar los ejemplos mentalmente — ¿podría el agente realmente cumplir con la solicitud con sus herramientas y habilidades asignadas?

### Paso 8: Escribir Limitaciones y Ver También

**Limitations**: 3-5 restricciones honestas. Lo que el agente no puede hacer, para qué no debe usarse o dónde puede producir resultados deficientes:

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**: Referenciar cruzadamente agentes complementarios, guías relevantes y equipos relacionados:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**Esperado:** Las limitaciones son honestas y específicas. Las referencias de Ver También apuntan a archivos existentes.

**En caso de fallo:** Verificar que los archivos referenciados existen: `ls agents/complementary-agent.md`.

### Paso 9: Añadir al Registro

Editar `agents/_registry.yml` y añadir la nueva entrada de agente en posición alfabética:

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Same one-line description from frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Incrementar el recuento `total_agents` al inicio del archivo.

**Esperado:** La entrada del registro coincide con el frontmatter del archivo del agente. `total_agents` es igual al número real de entradas de agentes.

**En caso de fallo:** Contar entradas con `grep -c "^  - id:" agents/_registry.yml` y verificar que coincide con `total_agents`.

### Paso 10: Verificar el Descubrimiento

Claude Code descubre los agentes desde el directorio `.claude/agents/`. En este repositorio, ese directorio es un symlink a `agents/`:

```bash
# Verificar que el symlink existe y se resuelve
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

Si el symlink `.claude/agents/` está intacto, no se necesita acción adicional — el nuevo archivo de agente es automáticamente descubrible.

Ejecutar la automatización de README para actualizar el README de agentes:

```bash
npm run update-readmes
```

**Esperado:** `.claude/agents/<agent-name>.md` resuelve al nuevo archivo de agente. `agents/README.md` incluye el nuevo agente.

**En caso de fallo:** Si el symlink está roto, recrearlo: `ln -sf ../agents .claude/agents`. Si `npm run update-readmes` falla, verificar que `scripts/generate-readmes.js` existe y `js-yaml` está instalado.

### Paso 11: Generar Archivos de Traducción

> **Obligatorio para todos los agentes.** Este paso se aplica tanto a autores humanos como a agentes de IA que siguen este procedimiento. No omitir — las traducciones faltantes se acumulan como un atraso obsoleto.

Generar archivos de traducción para las 4 localizaciones compatibles inmediatamente después de confirmar el nuevo agente:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

Luego traducir la prosa generada en cada archivo (los bloques de código y los IDs permanecen en inglés). Finalmente regenerar los archivos de estado:

```bash
npm run translation:status
```

**Esperado:** 4 archivos creados en `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`, todos con `source_commit` coincidiendo con el HEAD actual. `npm run validate:translations` muestra 0 advertencias de obsolescencia para el nuevo agente.

**En caso de fallo:** Si la generación de andamiaje falla, verificar que el agente existe en `agents/_registry.yml`. Si los archivos de estado no se actualizan, ejecutar `npm run translation:status` explícitamente — no se activa automáticamente por CI.

## Validación

- [ ] El archivo del agente existe en `agents/<agent-name>.md`
- [ ] El frontmatter YAML se analiza sin errores
- [ ] Todos los campos requeridos presentes: `name`, `description`, `tools`, `model`, `version`, `author`
- [ ] El campo `name` coincide con el nombre del archivo (sin `.md`)
- [ ] Todas las secciones presentes: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Las habilidades en el frontmatter existen en `skills/_registry.yml`
- [ ] Las habilidades por defecto (`meditate`, `heal`) NO están listadas a menos que sean fundamentales para la metodología del agente
- [ ] La lista de herramientas sigue el principio de mínimo privilegio
- [ ] El agente está listado en `agents/_registry.yml` con la ruta correcta y metadatos coincidentes
- [ ] El recuento `total_agents` en el registro está actualizado
- [ ] El symlink `.claude/agents/` resuelve al nuevo archivo del agente
- [ ] No hay solapamiento significativo con agentes existentes

## Errores Comunes

- **Sobreprovisión de herramientas**: Incluir `Bash`, `Write` o `WebFetch` cuando el agente solo necesita leer y analizar. Esto viola el mínimo privilegio y puede llevar a efectos secundarios no deseados. Comenzar con el conjunto mínimo y añadir herramientas solo cuando una capacidad las requiera.
- **Asignaciones de habilidades faltantes o incorrectas**: Listar IDs de habilidades que no existen en el registro, u olvidar asignar habilidades completamente. Siempre verificar cada ID de habilidad con `grep "id: skill-name" skills/_registry.yml` antes de añadirlo.
- **Listar habilidades por defecto innecesariamente**: Añadir `meditate` o `heal` al frontmatter del agente cuando ya se heredan del registro. Solo listarlas si son fundamentales para la metodología del agente (p.ej., `mystic`, `alchemist`, `gardener`, `shaman`).
- **Solapamiento de alcance con agentes existentes**: Crear un nuevo agente que duplica la funcionalidad ya cubierta por uno de los 53 agentes existentes. Siempre buscar primero en el registro y considerar extender las habilidades de un agente existente en su lugar.
- **Propósito y capacidades vagos**: Escribir "ayuda con el desarrollo" en lugar de "crea paquetes R con estructura completa, documentación y configuración CI/CD." La especificidad es lo que hace a un agente útil y descubrible.

## Habilidades Relacionadas

- `create-skill` - el procedimiento paralelo para crear archivos SKILL.md en lugar de archivos de agente
- `create-team` - componer múltiples agentes en un equipo coordinado (planificado)
- `commit-changes` - confirmar el nuevo archivo de agente y la actualización del registro
