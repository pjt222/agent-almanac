---
name: render-icon-pipeline
locale: es
source_locale: en
source_commit: 41c6956b
translator: claude
translation_date: "2026-03-18"
description: >
  Ejecutar el pipeline de viz para renderizar iconos a partir de glyphs existentes.
  Punto de entrada del subproyecto viz que cubre la generacion de paletas, la
  construccion de datos, la creacion de manifiestos y el renderizado de iconos para
  habilidades, agentes y equipos.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Renderizar Pipeline de Iconos

Ejecutar el pipeline de viz de principio a fin para renderizar iconos a partir de glyphs existentes. Cubre la generacion de paletas, la construccion de datos, la creacion de manifiestos y el renderizado de iconos para habilidades, agentes y equipos.

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

1. Confirmar que el directorio de trabajo es `viz/` (o navegar hasta el):
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   ```
2. Verificar que los paquetes R estan disponibles:
   ```bash
   Rscript -e "requireNamespace('ggplot2'); requireNamespace('ggforce'); requireNamespace('ggfx'); requireNamespace('ragg'); requireNamespace('magick')"
   ```
3. Verificar que Node.js esta disponible:
   ```bash
   node --version
   ```
4. Comprobar que `config.yml` existe (seleccion de ruta R segun el sistema operativo)

**Esperado:** Todos los prerequisitos pasan sin errores.

**En caso de fallo:** Instalar paquetes R faltantes con `install.packages()`. Si Node.js no esta disponible, instalar via nvm. Si `config.yml` no existe, el pipeline usara valores predeterminados del sistema.

### Paso 2: Generar Colores de Paleta

Generar los datos de paleta en JSON y JS a partir de las definiciones de paleta en R.

```bash
Rscript generate-palette-colors.R
```

**Esperado:** `viz/public/data/palette-colors.json` y `viz/js/palette-colors.js` actualizados.

**En caso de fallo:** Verificar que `viz/R/palettes.R` sea codigo R valido. Problema comun: error de sintaxis en la entrada de color de un nuevo dominio.

### Paso 3: Construir Datos

Generar los archivos de datos de habilidades/agentes/equipos a partir de los registros.

```bash
node build-data.js
```

**Esperado:** `viz/public/data/skills.json` actualizado con los datos actuales del registro.

**En caso de fallo:** Verificar que `skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml` sean YAML valido.

### Paso 4: Construir Manifiestos

Generar manifiestos de iconos a partir de los archivos de datos.

```bash
node build-icon-manifest.js
```

**Esperado:** Tres archivos de manifiesto actualizados:
- `viz/public/data/icon-manifest.json`
- `viz/public/data/agent-icon-manifest.json`
- `viz/public/data/team-icon-manifest.json`

**En caso de fallo:** Si los manifiestos estan desactualizados, eliminarlos y volver a ejecutar. Comprobar que `build-data.js` se ejecuto primero.

### Paso 5: Renderizar Iconos

Ejecutar el renderizador de iconos con los indicadores apropiados.

**Pipeline completo (todos los tipos, todas las paletas, estandar + HD):**
```bash
Rscript build-all-icons.R
```

**Incremental (saltar glyphs sin cambios):**
```bash
Rscript build-all-icons.R --skip-existing
```

**Tipo de entidad individual:**
```bash
Rscript build-all-icons.R --type skill
Rscript build-all-icons.R --type agent
Rscript build-all-icons.R --type team
```

**Dominio individual (solo habilidades):**
```bash
Rscript build-icons.R --only design
```

**Agente o equipo individual:**
```bash
Rscript build-agent-icons.R --only mystic
Rscript build-team-icons.R --only r-package-review
```

**Ejecucion en seco (vista previa sin renderizar):**
```bash
Rscript build-all-icons.R --dry-run
```

**Solo tamano estandar (sin HD):**
```bash
Rscript build-all-icons.R --no-hd
```

**Referencia de CLI:**

| Indicador | Predeterminado | Descripcion |
|-----------|----------------|-------------|
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

**Esperado:** Iconos renderizados en `viz/public/icons/<palette>/` y `viz/public/icons-hd/<palette>/`.

**En caso de fallo:**
- **renv se cuelga**: Ejecutar desde el directorio `viz/` para que `.Rprofile` active la solucion alternativa de ruta de biblioteca
- **Paquetes faltantes**: `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick", "future", "furrr", "digest"))`
- **Codigo de salida 5**: Generalmente significa que una funcion de glyph produjo un error — revisar el registro para el ID especifico de habilidad/agente/equipo
- **No glyph mapped**: La entidad necesita una funcion de glyph — usar la habilidad `create-glyph`

### Paso 6: Verificar Salida

Confirmar que el renderizado se completo exitosamente.

1. Verificar que los conteos de archivos coinciden con las expectativas:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Verificar tamanos de archivo razonables (2-80 KB por icono)
3. Comprobar que los manifiestos estan actualizados (ejecutar `audit-icon-pipeline` para una verificacion completa)

**Esperado:** Los conteos de archivos coinciden con los conteos de entradas del manifiesto. Los tamanos de archivo estan en el rango esperado.

**En caso de fallo:** Si los conteos no coinciden, algunos glyphs pueden haber producido errores durante el renderizado. Revisar el registro de construccion buscando lineas `[ERROR]`.

## Alternativa con Docker

El pipeline tambien puede ejecutarse en Docker:

```bash
cd viz
docker compose up --build
```

Esto ejecuta el pipeline completo en un entorno Linux aislado y sirve el resultado en el puerto 8080.

## Lista de Validacion

- [ ] El directorio de trabajo es `viz/`
- [ ] Colores de paleta generados (JSON + JS)
- [ ] Archivos de datos construidos desde los registros
- [ ] Manifiestos generados desde los datos
- [ ] Iconos renderizados para los tipos y paletas objetivo
- [ ] Los conteos de archivos coinciden con las expectativas
- [ ] Los tamanos de archivo estan en el rango esperado (2-80 KB)

## Errores Comunes

- **Directorio de trabajo incorrecto**: Los scripts R esperan ejecutarse desde `viz/` o encontrar `viz/R/utils.R` relativo a la raiz del proyecto
- **renv no activado**: La solucion alternativa de `.Rprofile` requiere ejecutar desde `viz/` — usar el indicador `--vanilla` o ejecutar desde otro directorio lo omitira
- **Manifiestos desactualizados**: Siempre ejecutar los Pasos 2-4 (paleta -> datos -> manifiesto) antes del Paso 5 (renderizar) despues de cambios en el registro
- **Paralelismo en Windows**: Windows no soporta paralelismo basado en fork — el pipeline selecciona automaticamente `multisession` via `config.yml`

## Habilidades Relacionadas

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detectar glyphs e iconos faltantes antes de renderizar
- [create-glyph](../create-glyph/SKILL.md) — crear nuevas funciones de glyph para entidades sin iconos
- [enhance-glyph](../enhance-glyph/SKILL.md) — mejorar glyphs existentes antes de re-renderizar
