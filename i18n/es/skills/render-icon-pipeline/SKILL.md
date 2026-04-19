---
name: render-icon-pipeline
locale: es
source_locale: en
source_commit: 640725b5
translator: claude
translation_date: "2026-03-18"
description: >
  Ejecutar el pipeline de viz para renderizar iconos a partir de glyphs existentes.
  Punto de entrada del subproyecto viz que cubre la generacion de paletas, la
  construccion de datos, la creacion de manifiestos y el renderizado de iconos para
  habilidades, agentes y equipos. Usar siempre build.sh como punto de entrada del
  pipeline — nunca llamar a Rscript directamente.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Renderizar Pipeline de Iconos

Ejecutar el pipeline de viz de principio a fin para renderizar iconos a partir de glyphs existentes. Cubre la generacion de paletas, la construccion de datos, la creacion de manifiestos y el renderizado de iconos para habilidades, agentes y equipos.

**Punto de entrada canonico**: `bash viz/build.sh [flags]` desde la raiz del proyecto, o `bash build.sh [flags]` desde `viz/`. Este script maneja la deteccion de plataforma (WSL, Docker, nativa), la seleccion del binario R y el orden de los pasos. Nunca llames a `Rscript` directamente para los scripts de construccion — esa ruta es exclusivamente para la configuracion del servidor MCP.

## Cuando Usar

- Despues de crear o modificar funciones de glyph
- Despues de agregar nuevas habilidades, agentes o equipos a los registros
- Cuando los iconos necesitan re-renderizarse para paletas nuevas o actualizadas
- Para una reconstruccion completa del pipeline (p. ej., despues de cambios de infraestructura)
- Al configurar el entorno viz por primera vez

## Entradas

- **Opcional**: Tipo de entidad — `skill`, `agent`, `team` o `all` (predeterminado: `all`)
- **Opcional**: Paleta — nombre de paleta especifico o `all` (predeterminado: `all`)
- **Opcional**: Filtro de dominio — dominio especifico para iconos de habilidades (p. ej., `git`, `design`)
- **Opcional**: Modo de renderizado — `full`, `incremental` o `dry-run` (predeterminado: `incremental`)

## Procedimiento

### Paso 1: Verificar Prerequisitos

Asegurar que el entorno esta listo para el renderizado.

1. Confirmar que `viz/build.sh` existe:
   ```bash
   ls -la viz/build.sh
   ```
2. Verificar que Node.js esta disponible:
   ```bash
   node --version
   ```
3. Comprobar que `viz/config.yml` existe (perfiles de ruta R especificos por plataforma):
   ```bash
   ls viz/config.yml
   ```

`build.sh` maneja automaticamente la resolucion del binario R — no necesitas verificar las rutas de R manualmente. En WSL usa `/usr/local/bin/Rscript` (R nativo de WSL), en Docker usa el R del contenedor, y en Linux/macOS nativo usa `Rscript` del PATH.

**Esperado:** `build.sh`, Node.js y `config.yml` estan presentes.

**En caso de fallo:** Si `config.yml` no existe, el pipeline usara valores predeterminados del sistema. Si Node.js no esta disponible, instalar via nvm.

### Paso 2: Ejecutar el Pipeline

`build.sh` ejecuta 5 pasos en orden:
1. Generar colores de paleta (R) → `palette-colors.json` + `colors-generated.js`
2. Construir datos (Node) → `skills.json`
3. Construir manifiestos (Node) → `icon-manifest.json`, `agent-icon-manifest.json`, `team-icon-manifest.json`
4. Renderizar iconos (R) → archivos WebP en `icons/` e `icons-hd/`
5. Generar glyphs de terminal (Node) → `cli/lib/glyph-data.json`

**Pipeline completo (todos los tipos, todas las paletas, estandar + HD):**
```bash
bash viz/build.sh
```

**Incremental (saltar iconos que ya existen en disco):**
```bash
bash viz/build.sh --skip-existing
```

**Dominio individual (solo habilidades):**
```bash
bash viz/build.sh --only design
```

**Tipo de entidad individual:**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**Ejecucion en seco (vista previa sin renderizar):**
```bash
bash viz/build.sh --dry-run
```

**Solo tamano estandar (sin HD):**
```bash
bash viz/build.sh --no-hd
```

Todos los indicadores despues de `build.sh` se pasan a `build-all-icons.R`.

**Esperado:** Iconos renderizados en `viz/public/icons/<palette>/` y `viz/public/icons-hd/<palette>/`.

**En caso de fallo:**
- **renv se cuelga en NTFS**: El `.Rprofile` de viz omite `renv/activate.R` y establece `.libPaths()` directamente. Asegurate de ejecutar desde `viz/` (build.sh lo hace automaticamente mediante `cd "$(dirname "$0")"`)
- **Paquetes R faltantes**: Ejecutar `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"` desde el entorno R que `build.sh` selecciona
- **No glyph mapped**: La entidad necesita una funcion de glyph — usar la habilidad `create-glyph` antes de renderizar

### Paso 3: Verificar Salida

Confirmar que el renderizado se completo exitosamente.

1. Verificar que los conteos de archivos coinciden con las expectativas:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Verificar tamanos de archivo razonables (2-80 KB por icono)
3. Ejecutar la habilidad `audit-icon-pipeline` para una verificacion completa

**Esperado:** Los conteos de archivos coinciden con los conteos de entradas del manifiesto. Los tamanos de archivo estan en el rango esperado.

**En caso de fallo:** Si los conteos no coinciden, algunos glyphs pueden haber producido errores durante el renderizado. Revisar el registro de construccion buscando lineas `[ERROR]`.

## Referencia de Indicadores CLI

Todos los indicadores se pasan a traves de `build.sh` a `build-all-icons.R`:

| Flag | Default | Descripcion |
|------|---------|-------------|
| `--type <types>` | `all` | Separados por coma: skill, agent, team |
| `--palette <name>` | `all` | Paleta individual o `all` (9 paletas) |
| `--only <filter>` | ninguno | Dominio (habilidades) o ID de entidad (agentes/equipos) |
| `--skip-existing` | desactivado | Saltar iconos con archivos WebP existentes |
| `--dry-run` | desactivado | Listar lo que se generaria |
| `--size <n>` | `512` | Dimension de salida en pixeles |
| `--glow-sigma <n>` | `4` | Radio de difuminado del resplandor |
| `--workers <n>` | automatico | Trabajadores paralelos (detectCores()-1) |
| `--no-cache` | desactivado | Ignorar cache de hash de contenido |
| `--hd` | activado | Habilitar variantes HD (1024px) |
| `--no-hd` | desactivado | Saltar variantes HD |
| `--strict` | desactivado | Salir ante el primer fallo de sub-script |

## Que Hace build.sh Internamente

Solo como referencia — NO ejecutar estos pasos manualmente:

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Alternativa con Docker

El pipeline tambien puede ejecutarse en Docker:

```bash
cd viz
docker compose up --build
```

Esto ejecuta el pipeline completo en un entorno Linux aislado y sirve el resultado en el puerto 8080.

## Lista de Validacion

- [ ] Se ejecuto `bash viz/build.sh` (no `Rscript` directo)
- [ ] Colores de paleta generados (JSON + JS)
- [ ] Archivos de datos construidos desde los registros
- [ ] Manifiestos generados desde los datos
- [ ] Iconos renderizados para los tipos y paletas objetivo
- [ ] Los conteos de archivos coinciden con las expectativas
- [ ] Los tamanos de archivo estan en el rango esperado (2-80 KB)

## Errores Comunes

- **Llamar a Rscript directamente**: Nunca ejecutes `Rscript build-icons.R` o `Rscript generate-palette-colors.R` manualmente. Usa siempre `bash build.sh [flags]`. Las llamadas directas a Rscript omiten la deteccion de plataforma y pueden usar el binario R incorrecto (Windows R via el wrapper `~/bin/Rscript` en lugar del R nativo de WSL en `/usr/local/bin/Rscript`). Nota: la ruta de Windows R en CLAUDE.md y en las guias es **exclusivamente para la configuracion del servidor MCP**, no para los scripts de construccion.
- **Directorio de trabajo incorrecto**: `build.sh` hace cd a su propio directorio automaticamente (`cd "$(dirname "$0")"`), asi que puedes llamarlo desde cualquier lugar: `bash viz/build.sh` desde la raiz del proyecto funciona correctamente.
- **Manifiestos desactualizados**: `build.sh` ejecuta los pasos 1-5 en orden, por lo que los manifiestos siempre se regeneran antes del renderizado. Si solo necesitas manifiestos sin renderizar, usa `node viz/build-data.js && node viz/build-icon-manifest.js` (los pasos de Node no necesitan R).
- **renv no activado**: La solucion alternativa de `.Rprofile` requiere ejecutar desde `viz/` — `build.sh` se encarga de esto. Usar el indicador `--vanilla` o ejecutar R desde otro directorio lo omitira.
- **Paralelismo en Windows**: Windows no soporta paralelismo basado en fork — el pipeline selecciona automaticamente `multisession` via `config.yml`.

## Habilidades Relacionadas

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detectar glyphs e iconos faltantes antes de renderizar
- [create-glyph](../create-glyph/SKILL.md) — crear nuevas funciones de glyph para entidades sin iconos
- [enhance-glyph](../enhance-glyph/SKILL.md) — mejorar glyphs existentes antes de re-renderizar
