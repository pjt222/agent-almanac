---
name: audit-discovery-symlinks
description: >
  Audit and repair Claude Code discovery symlinks for skills, agents, and teams.
  Compares registries against .claude/ directories at project and global levels,
  detects missing, broken, and extraneous symlinks, distinguishes almanac content
  from external projects, and optionally repairs gaps. Use after adding new skills
  or agents, after a repository rename or move, when slash commands stop working,
  or as a periodic health check.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: shell
  tags: maintenance, symlinks, discovery, claude-code, audit
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# audit-discovery-symlinks

## Cuándo Usar

- Después de añadir nuevas skills, agentes o equipos al almanaque
- Después de renombrar o mover un repositorio que pueda haber roto symlinks absolutos
- Cuando los slash commands o agentes no se encuentran en Claude Code
- Como verificación periódica de salud para detectar deriva entre los registries y las rutas de discovery
- Al incorporar un proyecto nuevo que debería descubrir contenido compartido del almanaque

**NO usar** para crear el hub inicial de symlinks desde cero. Ver la [guía symlink-architecture](../../guides/symlink-architecture.md) para configuración inicial.

## Entradas

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| `almanac_path` | string | No | Ruta absoluta a la raíz de agent-almanac. Auto-detectada desde objetivos de symlinks `.claude/` o cwd si se omite |
| `scope` | enum | No | `project`, `global`, o `both` (predeterminado: `both`) |
| `fix_mode` | enum | No | `report` (predeterminado: solo auditar), `auto` (corregir todos los problemas seguros), `interactive` (preguntar antes de cada corrección) |

## Procedimiento

### Paso 1: Identificar la Ruta del Almanaque

Localizar el directorio raíz de agent-almanac.

```bash
# Auto-detect from current project's .claude/agents symlink
ALMANAC_PATH=$(readlink -f .claude/agents 2>/dev/null | sed 's|/agents$||')

# Fallback: check if cwd is the almanac
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  if [ -f "skills/_registry.yml" ]; then
    ALMANAC_PATH=$(pwd)
  fi
fi

# Fallback: check global agents symlink
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  ALMANAC_PATH=$(readlink -f ~/.claude/agents 2>/dev/null | sed 's|/agents$||')
fi

echo "Almanac path: $ALMANAC_PATH"
```

**Esperado:** `ALMANAC_PATH` apunta a un directorio que contiene `skills/_registry.yml`, `agents/_registry.yml` y `teams/_registry.yml`.

**En caso de fallo:** Si la auto-detección falla, preguntar al usuario por la entrada `almanac_path`. La raíz del almanaque es el directorio que contiene `skills/`, `agents/`, `teams/` y sus registries.

### Paso 2: Inventariar los Registries

Extraer las listas canónicas de skills, agentes y equipos desde sus registries.

```bash
# Count registered skills (entries with "- id:" under domain sections)
REGISTERED_SKILLS=$(grep '^ \{6\}- id:' "$ALMANAC_PATH/skills/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_SKILL_COUNT=$(echo "$REGISTERED_SKILLS" | wc -l)

# Count registered agents
REGISTERED_AGENTS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/agents/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_AGENT_COUNT=$(echo "$REGISTERED_AGENTS" | wc -l)

# Count registered teams
REGISTERED_TEAMS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/teams/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_TEAM_COUNT=$(echo "$REGISTERED_TEAMS" | wc -l)

echo "Registered: $REGISTERED_SKILL_COUNT skills, $REGISTERED_AGENT_COUNT agents, $REGISTERED_TEAM_COUNT teams"
```

**Esperado:** Los conteos coinciden con los valores `total_skills`, `total_agents`, `total_teams` en el encabezado de cada registry.

**En caso de fallo:** Si los conteos divergen de los totales del encabezado, el registry mismo está desincronizado. Anotar la discrepancia en el reporte pero continuar con las entradas reales `- id:` como fuente de verdad.

### Paso 3: Auditar Symlinks a Nivel de Proyecto

Verificar `.claude/skills/*`, `.claude/agents`, `.claude/teams` en el directorio del proyecto actual.

```bash
PROJECT_CLAUDE=".claude"

# --- Skills ---
# Items on disk (excluding _template)
PROJECT_SKILLS=$(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | sort)
PROJECT_SKILL_COUNT=$(echo "$PROJECT_SKILLS" | grep -c .)

# Missing: in registry but not in project .claude/skills/
MISSING_PROJECT_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_PROJECT_SKILLS=$(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Extraneous: in project but not in registry (and not external)
EXTRA_PROJECT_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# --- Agents ---
if [ -L "$PROJECT_CLAUDE/agents" ] || [ -d "$PROJECT_CLAUDE/agents" ]; then
  PROJECT_AGENT_STATUS="OK"
  test -d "$PROJECT_CLAUDE/agents" || PROJECT_AGENT_STATUS="BROKEN"
  PROJECT_AGENT_COUNT=$(ls "$PROJECT_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  PROJECT_AGENT_STATUS="MISSING"
  PROJECT_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A .claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$PROJECT_CLAUDE/teams" ]; then
  PROJECT_TEAM_STATUS="MISCONFIGURED"
  PROJECT_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  PROJECT_TEAM_STATUS="OK"
  PROJECT_TEAM_COUNT=0
fi
```

**Esperado:** Cero faltantes, cero rotos. Los items extraños se clasifican y explican.

**En caso de fallo:** Si `.claude/` no existe en absoluto, el proyecto no tiene configuración de discovery. Anotar esto y saltar a la auditoría global.

### Paso 4: Auditar Symlinks Globales

Verificar `~/.claude/skills/*` y `~/.claude/agents`. También verificar que `~/.claude/teams` NO sea un symlink (debe estar ausente o ser un directorio para el estado runtime de TeamCreate).

```bash
GLOBAL_CLAUDE="$HOME/.claude"

# --- Skills ---
GLOBAL_SKILLS_ALL=$(ls "$GLOBAL_CLAUDE/skills/" 2>/dev/null | sort)

# Classify each entry: almanac vs external
ALMANAC_GLOBAL_SKILLS=""
EXTERNAL_GLOBAL_SKILLS=""
for item in $GLOBAL_SKILLS_ALL; do
  target=$(readlink -f "$GLOBAL_CLAUDE/skills/$item" 2>/dev/null)
  if [ -z "$target" ]; then
    # Real directory (not a symlink) — external
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  elif echo "$target" | grep -q "^$ALMANAC_PATH"; then
    ALMANAC_GLOBAL_SKILLS="$ALMANAC_GLOBAL_SKILLS $item"
  else
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  fi
done

# Filter: _template is always extraneous for almanac content
ALMANAC_GLOBAL_SKILLS=$(echo "$ALMANAC_GLOBAL_SKILLS" | tr ' ' '\n' | grep -v '^_template$' | grep -v '^$' | sort)

# Missing: in registry but not in global almanac skills
MISSING_GLOBAL_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_GLOBAL_SKILLS=$(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Stale almanac entries: in global almanac set but not in registry
STALE_GLOBAL_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# --- Agents ---
if [ -L "$GLOBAL_CLAUDE/agents" ] || [ -d "$GLOBAL_CLAUDE/agents" ]; then
  GLOBAL_AGENT_STATUS="OK"
  test -d "$GLOBAL_CLAUDE/agents" || GLOBAL_AGENT_STATUS="BROKEN"
  GLOBAL_AGENT_COUNT=$(ls "$GLOBAL_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  GLOBAL_AGENT_STATUS="MISSING"
  GLOBAL_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A ~/.claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$GLOBAL_CLAUDE/teams" ]; then
  GLOBAL_TEAM_STATUS="MISCONFIGURED"
  GLOBAL_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  GLOBAL_TEAM_STATUS="OK"
  GLOBAL_TEAM_COUNT=0
fi
```

**Esperado:** Cero skills almanaque faltantes, cero rotos. El contenido externo (peon-ping, etc.) se lista pero no se marca como error.

**En caso de fallo:** Si `~/.claude/` no existe, el hub global no está configurado. Referirse a la [guía symlink-architecture](../../guides/symlink-architecture.md) para configuración inicial.

### Paso 5: Generar Reporte de Auditoría

Producir una tabla resumen cubriendo ambas capas.

```markdown
# Discovery Symlink Audit Report

**Date**: YYYY-MM-DD
**Almanac**: <almanac_path>
**Scope**: both | project | global

## Summary

| Content | Registered | Project | Global (almanac) | Global (external) |
|---------|------------|---------|-------------------|-------------------|
| Skills  | N          | N       | N                 | N                 |
| Agents  | N          | STATUS  | STATUS            | —                 |
| Teams   | N          | STATUS  | STATUS            | —                 |

## Issues

### Missing (registered but no symlink)
- Project skills: [list or "none"]
- Global skills: [list or "none"]

### Broken (symlink exists, target gone)
- Project: [list or "none"]
- Global: [list or "none"]

### Extraneous
- Stale almanac (in discovery but not registry): [list or "none"]
- _template in discovery path: [yes/no]
- External content (non-almanac): [list — informational only]
```

**Esperado:** Un reporte claro y accionable. Cero problemas significa salud limpia.

**En caso de fallo:** Si la generación del reporte mismo falla, emitir conteos y listas crudos a la consola como respaldo.

### Paso 6: Reparar (Opcional)

Si `fix_mode` es `auto` o `interactive`, corregir los problemas encontrados.

**6a. Crear symlinks de proyecto faltantes:**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. Crear symlinks globales faltantes:**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. Eliminar symlinks rotos:**
```bash
# Project
for broken in $BROKEN_PROJECT_SKILLS; do
  rm "$PROJECT_CLAUDE/skills/$broken"
done

# Global
for broken in $BROKEN_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$broken"
done
```

**6d. Eliminar entradas obsoletas del almanaque:**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. Corregir symlinks de directorio faltantes (agents/teams):**
```bash
# Project agents
if [ "$PROJECT_AGENT_STATUS" = "MISSING" ]; then
  ln -s ../agents "$PROJECT_CLAUDE/agents"
fi

# Project teams
if [ "$PROJECT_TEAM_STATUS" = "MISSING" ]; then
  ln -s ../teams "$PROJECT_CLAUDE/teams"
fi

# Global agents
if [ "$GLOBAL_AGENT_STATUS" = "MISSING" ]; then
  ln -s "$ALMANAC_PATH/agents" "$GLOBAL_CLAUDE/agents"
fi

# Global teams
if [ "$GLOBAL_TEAM_STATUS" = "MISSING" ]; then
  ln -sf "$ALMANAC_PATH/teams" "$GLOBAL_CLAUDE/teams"
fi
```

**Importante:** Nunca eliminar items clasificados como externos. Estos pertenecen a otros proyectos (p. ej., peon-ping) y deben preservarse.

**Esperado:** Todos los symlinks faltantes creados, todos los symlinks rotos eliminados, todas las entradas obsoletas del almanaque limpiadas. Contenido externo intacto.

**En caso de fallo:** Si `ln -s` falla debido a un archivo/directorio existente en la ruta objetivo (p. ej., directorio vacío en lugar de symlink), eliminar el bloqueador primero con `rmdir` (para directorios vacíos) o marcar para revisión manual (para directorios no vacíos).

### Paso 7: Verificar

Re-ejecutar las verificaciones de auditoría de los Pasos 3-4 para confirmar las reparaciones.

```bash
echo "=== Post-repair verification ==="
echo "Project skills: $(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | wc -l)"
echo "Global skills (almanac): $(echo "$ALMANAC_GLOBAL_SKILLS" | wc -w)"
echo "Broken project: $(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Broken global:  $(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Project agents: $PROJECT_AGENT_STATUS ($PROJECT_AGENT_COUNT .md files)"
echo "Global agents:  $GLOBAL_AGENT_STATUS ($GLOBAL_AGENT_COUNT .md files)"
echo "Project teams:  $PROJECT_TEAM_STATUS ($PROJECT_TEAM_COUNT .md files)"
echo "Global teams:   $GLOBAL_TEAM_STATUS ($GLOBAL_TEAM_COUNT .md files)"
```

**Esperado:** Cero faltantes, cero rotos. Los conteos coinciden con los totales registrados (para contenido del almanaque). Contenido externo listado por separado.

**En caso de fallo:** Si los problemas persisten después de la reparación, reportar las fallas específicas. Causas comunes: errores de permisos en `~/.claude/`, límites de longitud de ruta NTFS en rutas `/mnt/`, o un directorio no vacío bloqueando la creación del symlink.

## Validación

- [ ] La ruta del almanaque está correctamente identificada y contiene los tres registries
- [ ] Los conteos del registry coinciden con los valores del encabezado `total_*` (o discrepancia anotada)
- [ ] Skills, agentes y equipos a nivel de proyecto auditados
- [ ] Skills, agentes y equipos a nivel global auditados
- [ ] Contenido externo (no-almanaque) identificado y excluido de los conteos de problemas
- [ ] Entradas `_template` marcadas como extrañas (nunca pertenecen a las rutas de discovery)
- [ ] Reporte de auditoría generado con conteos claros y listas accionables
- [ ] Si `fix_mode` es `auto`: todas las reparaciones seguras aplicadas, contenido externo intacto
- [ ] La verificación post-reparación confirma cero faltantes, cero rotos

## Errores Comunes

1. **Confundir contenido externo con contenido faltante del almanaque**: `~/.claude/skills/` puede contener skills de otros proyectos (p. ej., peon-ping). Siempre verificar si un objetivo de symlink está bajo la ruta del almanaque antes de clasificarlo como obsoleto o extraño.

2. **Eliminar contenido externo**: Nunca borrar items que no apunten al almanaque. Pertenecen a otros proyectos y son intencionales.

3. **Symlinkear directorios `_template`**: Las plantillas son scaffolding, no contenido consumible. El directorio `_template` nunca debe aparecer en `.claude/skills/` o `.claude/agents/`. Los scripts de sincronización masiva deben saltarlo explícitamente.

4. **Symlink obsoleto `.claude/teams`**: Un symlink `.claude/teams` apuntando a definiciones de equipo es una mala configuración. `TeamCreate` de Claude Code usa `~/.claude/teams/` para estado runtime (config.json, inboxes). Si esta ruta es un symlink al directorio `teams/` del almanaque, los artefactos runtime se escribirán en el repositorio rastreado por git. Eliminar cualquier symlink `.claude/teams` encontrado a nivel de proyecto o global.

5. **Rutas relativas vs absolutas**: Los symlinks de skills a nivel de proyecto usan rutas relativas (`../../skills/<name>`). Los symlinks globales usan rutas absolutas (`/path/to/almanac/skills/<name>`). Mezclar estos patrones causa rotura en movimientos.

6. **Encabezado del registry vs conteo real**: El campo `total_skills` en el encabezado del registry puede estar obsoleto si alguien añadió entradas sin actualizar el conteo. Confiar en las entradas reales `- id:`, no en el encabezado.

## Habilidades Relacionadas

- [repair-broken-references](../repair-broken-references/SKILL.md) -- reparación general de enlaces y referencias rotas
- [tidy-project-structure](../tidy-project-structure/SKILL.md) -- organización del directorio del proyecto
- [create-skill](../create-skill/SKILL.md) -- incluye creación de symlinks para nuevas skills (Paso 13)
- [create-agent](../create-agent/SKILL.md) -- incluye verificación de discovery (Paso 10)
- [create-team](../create-team/SKILL.md) -- creación de equipos con integración del registry
