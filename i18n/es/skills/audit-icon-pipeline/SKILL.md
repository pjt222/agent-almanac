---
name: audit-icon-pipeline
locale: es
source_locale: en
source_commit: e4ffbae4
translator: claude
translation_date: "2026-03-18"
description: >
  Detectar glyphs faltantes, iconos y variantes HD comparando registros contra
  archivos de mapeo de glyphs, directorios de iconos y manifiestos. Reporta
  brechas para habilidades, agentes y equipos en todas las paletas.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# Auditar Pipeline de Iconos

Detectar glyphs faltantes, iconos ausentes y manifiestos desactualizados comparando registros contra archivos de mapeo de glyphs, directorios de iconos y manifiestos. Produce un informe estructurado de brechas que cubre habilidades, agentes y equipos.

## Cuando Usar

- Despues de agregar nuevas habilidades, agentes o equipos para verificar si se necesitan iconos
- Antes de un renderizado completo del pipeline para identificar lo que falta
- Despues de actualizaciones del registro para asegurar que los manifiestos esten sincronizados
- Verificacion periodica del estado del pipeline de iconos

## Entradas

- **Opcional**: Filtro de tipo de entidad — `skill`, `agent`, `team` o `all` (predeterminado: `all`)
- **Opcional**: Paleta a verificar (predeterminado: `cyberpunk` — la paleta de referencia)

## Procedimiento

### Paso 1: Leer Registros

Recopilar todos los IDs de entidades de los registros fuente de verdad.

1. Leer `skills/_registry.yml` — extraer todos los IDs de habilidades en todos los dominios
2. Leer `agents/_registry.yml` — extraer todos los IDs de agentes
3. Leer `teams/_registry.yml` — extraer todos los IDs de equipos
4. Registrar conteos: total de habilidades, agentes y equipos

**Esperado:** Tres listas de IDs de entidades con conteos que coinciden con `total_skills`, `total_agents`, `total_teams`.

**En caso de fallo:** Si un archivo de registro no existe, reportar la ruta y omitir ese tipo de entidad.

### Paso 2: Leer Mapeos de Glyphs

Recopilar todos los IDs de entidades mapeados desde los archivos de mapeo de glyphs.

1. Leer `viz/R/glyphs.R` — extraer todas las claves de la lista `SKILL_GLYPHS`
2. Leer `viz/R/agent_glyphs.R` — extraer todas las claves de la lista `AGENT_GLYPHS`
3. Leer `viz/R/team_glyphs.R` — extraer todas las claves de la lista `TEAM_GLYPHS`

**Esperado:** Tres listas de IDs mapeados.

**En caso de fallo:** Si un archivo de glyphs no existe, reportarlo y marcar todas las entidades de ese tipo como no mapeadas.

### Paso 3: Calcular Glyphs Faltantes

Calcular la diferencia entre IDs del registro e IDs mapeados.

1. Glyphs de habilidades faltantes: `registry_skill_ids - mapped_skill_ids`
2. Glyphs de agentes faltantes: `registry_agent_ids - mapped_agent_ids`
3. Glyphs de equipos faltantes: `registry_team_ids - mapped_team_ids`

**Esperado:** Listas de IDs de entidades que existen en los registros pero no tienen funcion de glyph mapeada.

**En caso de fallo:** Si el calculo de diferencia falla, verificar que los formatos de ID coincidan entre el registro y los archivos de glyph (p. ej., guiones vs guiones bajos).

### Paso 4: Verificar Iconos Renderizados

Comprobar que los glyphs mapeados tienen archivos de icono renderizados correspondientes.

1. Para cada ID de habilidad mapeado, verificar `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. Para cada ID de agente mapeado, verificar `viz/public/icons/<palette>/agents/<agentId>.webp`
3. Para cada ID de equipo mapeado, verificar `viz/public/icons/<palette>/teams/<teamId>.webp`
4. Verificar variantes HD en `viz/public/icons-hd/` con la misma estructura

**Esperado:** Listas de entidades con glyphs pero sin iconos renderizados (estandar y/o HD).

**En caso de fallo:** Si el directorio de iconos no existe, el pipeline aun no se ha ejecutado — reportar todos como faltantes.

### Paso 5: Verificar Frescura del Manifiesto

Comparar conteos del manifiesto contra conteos del registro.

1. Leer `viz/public/data/icon-manifest.json` — contar entradas
2. Leer `viz/public/data/agent-icon-manifest.json` — contar entradas
3. Leer `viz/public/data/team-icon-manifest.json` — contar entradas
4. Comparar contra los totales del registro

**Esperado:** Los conteos del manifiesto coinciden con los conteos del registro. Las discrepancias indican manifiestos desactualizados.

**En caso de fallo:** Si los archivos de manifiesto no existen, el pipeline de datos necesita ejecutarse primero (`node build-data.js && node build-icon-manifest.js`).

### Step 6: Detect Orphan Icons

Walk `viz/public/icons*/` and flag WebP files whose `<palette>/<domain>/<skillId>` triple does not appear in `icon-manifest.json`.

1. Enumerate all WebP files: `find viz/public/icons* -name "*.webp"`
2. For each file, extract `<domain>/<id>` from its path
3. Check if `<domain>/<id>` has an entry in `icon-manifest.json`
4. Collect non-matching files as orphans — they exist on disk but are no longer referenced

```bash
# Quick orphan count per palette
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('viz/public/data/icon-manifest.json'));
const ids = new Set(manifest.map(e => e.domain + '/' + e.id));
const orphans = require('child_process')
  .execSync('find viz/public/icons -name \"*.webp\"').toString().trim().split('\n')
  .filter(p => { const parts = p.split('/'); const id = parts.slice(-2).join('/').replace('.webp',''); return !ids.has(id); });
console.log('Orphans:', orphans.length);
orphans.forEach(p => console.log(' ', p));
"
```

**Expected:** Zero orphans. Any orphans indicate skills re-homed to a different domain without cleanup.

**On failure:** Delete orphans manually — they have no corresponding manifest entry and will not be served.

### Paso 6: Generar Informe de Brechas

Producir un resumen estructurado.

1. Formatear la salida como una tabla o lista clara:
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. Sugerir acciones siguientes basadas en los hallazgos

**Esperado:** Un informe de brechas completo con pasos de accion concretos.

**En caso de fallo:** Si todas las verificaciones pasan con cero brechas, reportar "Pipeline completamente sincronizado" como resultado positivo.

## Lista de Validacion

- [ ] Los tres registros se leyeron exitosamente
- [ ] Los tres archivos de mapeo de glyphs fueron verificados
- [ ] Los directorios de iconos fueron escaneados tanto para estandar como para HD
- [ ] La frescura del manifiesto fue verificada
- [ ] El informe de brechas fue producido con conteos y listas de entidades
- [ ] Se proporcionaron pasos de accion concretos

## Errores Comunes

- **Discrepancia en formato de ID**: El registro usa kebab-case (`create-skill`), los mapeos de glyph pueden usar claves en snake_case — asegurar que la comparacion normalice los formatos
- **Suposicion de paleta**: Solo verificar la paleta cyberpunk omite brechas de renderizado especificas de paleta
- **Directorios vacios**: Un directorio de dominio existente pero vacio cuenta como "iconos presentes" al buscar con glob — verificar existencia de archivos, no de directorios
- **HD no renderizado**: Los iconos HD estan en un arbol de directorios separado (`icons-hd/`) — no confundir con los iconos estandar

## Habilidades Relacionadas

- [create-glyph](../create-glyph/SKILL.md) — crear un glyph faltante identificado por esta auditoria
- [enhance-glyph](../enhance-glyph/SKILL.md) — mejorar la calidad de glyphs existentes
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — ejecutar el pipeline completo para generar iconos faltantes
- [ ] Orphan icons checked (disk paths vs manifest)
- **Orphans after re-homing**: When a skill's domain changes, `build.sh` creates icons at the new path but does NOT delete the old path — always run Step 6 orphan check after any domain migration
