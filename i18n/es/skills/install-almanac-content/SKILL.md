---
name: install-almanac-content
description: >
  Install skills, agents, and teams from agent-almanac into any supported
  agentic framework using the CLI. Covers framework detection, content
  search, installation with dependency resolution, health auditing, and
  manifest-based syncing. Use when setting up a new project with agentic
  capabilities, installing specific skills or entire domains, targeting
  multiple frameworks simultaneously, or maintaining a declarative
  manifest of installed content.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Install Almanac Content

Usar la CLI `agent-almanac` para instalar skills, agentes y equipos en cualquier framework agentic soportado.

## Cuándo Usar

- Configurando un proyecto nuevo y necesitas instalar skills agentic, agentes o equipos
- Instalando todas las skills de un dominio específico (p. ej., `r-packages`, `devops`)
- Apuntando a múltiples frameworks simultáneamente (Claude Code, Cursor, Copilot, etc.)
- Creando o sincronizando un manifiesto declarativo `agent-almanac.yml` para configuraciones reproducibles
- Auditando contenido instalado por symlinks rotos o referencias obsoletas

## Entradas

- **Requerido**: Contenido a instalar -- uno o más IDs de skill, agente o equipo (p. ej., `create-skill`, `r-developer`, `r-package-review`)
- **Opcional**: `--domain <domain>` -- instalar todas las skills de un dominio en lugar de nombrar IDs individuales
- **Opcional**: `--framework <id>` -- apuntar a un framework específico (predeterminado: auto-detectar todos)
- **Opcional**: `--with-deps` -- también instalar skills de agentes y agentes+skills de equipos
- **Opcional**: `--dry-run` -- previsualizar cambios sin escribir a disco
- **Opcional**: `--global` -- instalar en scope global en lugar de scope de proyecto
- **Opcional**: `--force` -- sobrescribir contenido existente
- **Opcional**: `--source <path>` -- ruta explícita a la raíz de agent-almanac (predeterminado: auto-detectar)

## Procedimiento

### Paso 1: Detectar Frameworks

Ejecutar la detección de frameworks para ver qué herramientas agentic están presentes en el proyecto actual:

```bash
agent-almanac detect
```

Esto escanea el directorio de trabajo por archivos y directorios de configuración (`.claude/`, `.cursor/`, `.github/copilot-instructions/`, `.agents/`, etc.) y reporta qué frameworks están activos.

**Esperado:** La salida lista uno o más frameworks detectados con su estado de adaptador. Si no se detectan frameworks, el adaptador universal (`.agents/skills/`) se usa como respaldo.

**En caso de fallo:** Si la CLI no se encuentra, asegurar que está instalada y en PATH. Si la detección retorna nada y sabes que un framework está presente, usar `--framework <id>` para especificarlo explícitamente. Ejecutar `agent-almanac list --domains` para verificar que la CLI puede alcanzar los registries.

### Paso 2: Buscar Contenido

Encontrar skills, agentes o equipos por palabra clave:

```bash
agent-almanac search <keyword>
```

Para navegar por categoría:

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**Esperado:** Los resultados de búsqueda o listas filtradas muestran contenido coincidente con IDs y descripciones.

**En caso de fallo:** Si no aparecen resultados, probar palabras clave más amplias. Verificar que la raíz del almanaque sea alcanzable: `agent-almanac list` debe mostrar el conteo completo de skills. Si no puede encontrar la raíz, pasar `--source /path/to/agent-almanac`.

### Paso 3: Instalar Contenido

Instalar uno o más items por nombre:

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

La CLI resuelve el contenido de los registries, selecciona el adaptador apropiado para cada framework detectado y escribe archivos a las rutas específicas del framework (p. ej., `.claude/skills/` para Claude Code, `.cursor/rules/` para Cursor).

**Esperado:** La salida confirma el número de items instalados y el/los framework(s) objetivo. El contenido instalado aparece en el directorio correcto del framework.

**En caso de fallo:** Si los items no se encuentran, verificar que el ID coincida con el campo `name` en el registry (`skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`). Si los archivos ya existen y la instalación es saltada, usar `--force` para sobrescribir.

### Paso 4: Verificar la Instalación

Ejecutar una verificación de salud en todo el contenido instalado:

```bash
agent-almanac audit
```

Para auditar un framework o scope específico:

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

Para ver lo que está actualmente instalado:

```bash
agent-almanac list --installed
```

**Esperado:** La auditoría reporta todos los items instalados como saludables sin referencias rotas. El listado `--installed` muestra cada item con su tipo y framework.

**En caso de fallo:** Si la auditoría reporta items rotos, reinstalarlos con `--force`. Si los symlinks están rotos, verificar que la ruta fuente del almanaque no se haya movido. Ejecutar `agent-almanac install <broken-id> --force` para reparar.

### Paso 5: Gestionar con un Manifiesto (Opcional)

Para configuraciones reproducibles, usar un manifiesto declarativo `agent-almanac.yml`:

```bash
# Generate a starter manifest
agent-almanac init
```

Esto crea `agent-almanac.yml` en el directorio actual con frameworks detectados y listas de contenido placeholder. Editar el archivo para declarar skills, agentes y equipos deseados:

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

Luego instalar todo lo declarado en el manifiesto:

```bash
agent-almanac install
```

Para reconciliar el estado instalado con el manifiesto (instalar lo faltante, eliminar lo extra):

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**Esperado:** Ejecutar `install` sin argumentos lee el manifiesto e instala todo el contenido declarado. Ejecutar `sync` alinea el estado instalado con el manifiesto, añadiendo items faltantes y eliminando los no declarados.

**En caso de fallo:** Si `sync` reporta "No agent-almanac.yml found", ejecutar `agent-almanac init` primero. Si el manifiesto resuelve a 0 items, verificar que los IDs de skill/agente/equipo coincidan exactamente con las entradas del registry. Las líneas de comentario que comienzan con `#` son ignoradas.

### Paso 6: Gestionar Equipos como Campfires (Opcional)

Los comandos campfire proveen una alternativa cálida y orientada a equipos a `install --team`:

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

El estado de campfire se rastrea en `.agent-almanac/state.json` (git-ignored, local al proyecto). Los fuegos tienen estados térmicos: **burning** (usado dentro de 7 días), **embers** (dentro de 30 días), **cold** (30+ días). Ejecutar `tend` calienta todos los fuegos y reporta su salud.

Las skills compartidas están protegidas durante scatter — si una skill es necesitada por otro fuego encendido, permanece instalada. Los agentes compartidos caminan entre fuegos en lugar de duplicarse.

Todos los comandos campfire soportan `--quiet` (salida estándar del reporter) y `--json` (parseable por máquina) para scripting.

**Esperado:** Los equipos son encendidos y gestionados con rastreo de estado. `campfire --all` muestra los estados de fuego. `tend` reporta salud.

**En caso de fallo:** Si el estado de campfire está corrupto, eliminar `.agent-almanac/state.json` y volver a encender equipos. Si `gather` falla, verificar que el nombre del equipo coincida con una entrada en `teams/_registry.yml`.

## Validación

- [ ] `agent-almanac detect` muestra los frameworks esperados
- [ ] `agent-almanac list --installed` muestra todo el contenido pretendido
- [ ] `agent-almanac audit` reporta sin items rotos
- [ ] Las skills instaladas se resuelven en el framework objetivo (p. ej., `/skill-name` funciona en Claude Code)
- [ ] Si se usa un manifiesto, `agent-almanac sync --dry-run` reporta sin cambios necesarios

## Errores Comunes

- **Olvidar `--with-deps` para agentes y equipos**: Instalar un agente sin `--with-deps` instala solo la definición del agente, no sus skills referenciadas. El agente estará presente pero incapaz de seguir sus procedimientos de skill. Siempre usar `--with-deps` para agentes y equipos a menos que ya hayas instalado las dependencias por separado.
- **Deriva de manifiesto**: Después de instalar o eliminar contenido manualmente, el manifiesto cae fuera de sincronía con el estado instalado real. Ejecutar `agent-almanac sync` periódicamente, o siempre instalar a través del manifiesto para mantenerlos alineados.
- **Confusión de scope (proyecto vs global)**: El contenido instalado con `--global` va a `~/.claude/skills/` (o equivalente), mientras que el contenido de scope de proyecto va a `.claude/skills/` en el directorio actual. Si una skill no se encuentra, verificar si fue instalada en el scope incorrecto.
- **Ruta fuente obsoleta**: Si el repositorio agent-almanac es movido o renombrado, la ruta `--source` en los manifiestos y la auto-detección se romperán. Actualizar el campo `source` en `agent-almanac.yml` o volver a ejecutar `agent-almanac init`.
- **Framework no detectado**: El detector busca archivos y directorios específicos. Un proyecto recién inicializado puede no tener estos todavía. Usar `--framework <id>` explícitamente hasta que el proyecto tenga la estructura esperada, o confiar en el adaptador universal.
- **Confusión de estado térmico de campfire**: Los fuegos se enfrían después de 30 días sin uso. Ejecutar `agent-almanac tend` resetea el timer para todos los fuegos encendidos. Si un fuego muestra como "cold", aún está totalmente instalado — el estado térmico refleja la recencia de uso, no la salud de la instalación.

## Habilidades Relacionadas

- `create-skill` -- crear nuevas skills para añadir al almanaque antes de instalarlas
- `configure-mcp-server` -- configurar servidores MCP que los agentes pueden necesitar después de la instalación
- `write-claude-md` -- configurar CLAUDE.md para referenciar skills instaladas
- `audit-discovery-symlinks` -- diagnosticar problemas de symlinks para el descubrimiento de skills de Claude Code
- `design-cli-output` -- patrones de salida de terminal usados por el reporter de la CLI y la ceremonia campfire
