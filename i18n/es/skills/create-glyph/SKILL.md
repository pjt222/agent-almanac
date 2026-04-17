---
name: create-glyph
locale: es
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-18"
description: >
  Crear pictogramas (glyphs) basados en R para iconos de habilidades, agentes o
  equipos en la capa de visualizacion. Cubre el boceto del concepto, la composicion
  de capas con ggplot2 usando la biblioteca de primitivas, la estrategia de color,
  el registro en el archivo de mapeo de glyphs y manifiesto correspondiente, el
  renderizado mediante el pipeline de construccion y la verificacion visual de la
  salida con efecto neon. Usar cuando se ha agregado una nueva entidad y necesita
  un icono visual para la visualizacion de grafo de fuerzas, cuando un glyph
  existente necesita reemplazo, o al crear glyphs en lote para un nuevo dominio.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# Crear Glyph

Crear pictogramas (glyphs) basados en R para iconos de habilidades, agentes o equipos en la capa de visualizacion `viz/`. Cada glyph es una funcion pura de ggplot2 que dibuja una forma reconocible en un lienzo de 100x100, renderizada con un efecto de resplandor neon sobre fondo transparente en formato WebP.

## Cuando Usar

- Se ha agregado una nueva habilidad, agente o equipo y necesita un icono visual
- Un glyph existente necesita reemplazo o rediseno
- Creacion en lote de glyphs para un nuevo dominio de habilidades
- Prototipado de metaforas visuales para conceptos de entidades

## Entradas

- **Requerido**: Tipo de entidad — `skill`, `agent` o `team`
- **Requerido**: ID de la entidad (p. ej., `create-glyph`, `mystic`, `r-package-review`) y dominio (para habilidades)
- **Requerido**: Concepto visual — lo que el glyph debe representar
- **Opcional**: Glyph de referencia para estudiar el nivel de complejidad
- **Opcional**: Valor personalizado de `--glow-sigma` (predeterminado: 4)

## Procedimiento

### Paso 1: Concepto — Disenar la Metafora Visual

Identificar la entidad a iconificar y elegir una metafora visual.

1. Leer el archivo fuente de la entidad para comprender su concepto central:
   - Habilidades: `skills/<id>/SKILL.md`
   - Agentes: `agents/<id>.md`
   - Equipos: `teams/<id>.md`
2. Elegir un tipo de metafora:
   - **Objeto literal**: un matraz para experimentos, un escudo para seguridad
   - **Simbolo abstracto**: flechas para fusion, espirales para iteracion
   - **Compuesto**: combinar 2-3 formas simples (p. ej., documento + pluma)
3. Consultar glyphs existentes para calibrar la complejidad:

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. Decidir un nombre de funcion: `glyph_<nombre_descriptivo>` (snake_case, unico)

**Esperado:** Un boceto mental claro de la forma con 2-6 capas planificadas.

**En caso de fallo:** Si el concepto es demasiado abstracto, recurrir a un objeto concreto relacionado. Revisar glyphs existentes del mismo dominio para inspiracion.

### Paso 2: Componer — Escribir la Funcion del Glyph

Escribir la funcion R que produce capas de ggplot2.

1. Firma de la funcion (contrato inmutable):
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. Aplicar el factor de escala `* s` a TODAS las dimensiones para un escalado consistente:
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. Construir la geometria usando las primitivas disponibles:

   | Geometria | Uso |
   |-----------|-----|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | Formas rellenas |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | Lineas/curvas abiertas |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | Segmentos de linea, flechas |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | Rectangulos |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | Circulos |

4. Aplicar la estrategia de color:

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. Devolver una `list()` plana de capas (el renderizador itera y envuelve cada una con resplandor)

6. Colocar la funcion en el archivo de primitivas correspondiente segun el tipo de entidad:
   - **Habilidades**: agrupadas por dominio en 19 archivos de primitivas:
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - Archivos adicionales `primitives_4.R` hasta `primitives_19.R` para dominios mas recientes
   - **Agentes**: `viz/R/agent_primitives.R`
   - **Equipos**: `viz/R/team_primitives.R`

**Esperado:** Una funcion R funcional que devuelve una lista de 2-6 capas de ggplot2.

**En caso de fallo:** Si `ggforce::geom_circle` causa errores, asegurarse de que ggforce esta instalado. Si las coordenadas estan mal, recordar que el lienzo es de 100x100 con (0,0) en la esquina inferior izquierda. Probar la funcion interactivamente:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### Paso 3: Registrar — Mapear Entidad al Glyph

Agregar el mapeo entidad-glyph en el archivo de mapeo correspondiente.

**Para habilidades:**
1. Abrir `viz/R/glyphs.R`
2. Encontrar la seccion de comentarios del dominio objetivo (p. ej., `# -- design (3)`)
3. Agregar la entrada en orden alfabetico dentro del bloque del dominio:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Actualizar el conteo del dominio en el comentario si aplica

**Para agentes:**
1. Abrir `viz/R/agent_glyphs.R`
2. Encontrar la posicion alfabetica en `AGENT_GLYPHS`
3. Agregar la entrada:
   ```r
   "agent-id" = "glyph_function_name",
   ```

**Para equipos:**
1. Abrir `viz/R/team_glyphs.R`
2. Encontrar la posicion alfabetica en `TEAM_GLYPHS`
3. Agregar la entrada:
   ```r
   "team-id" = "glyph_function_name",
   ```

5. Verificar que no exista un ID duplicado en la lista objetivo

**Esperado:** La lista `*_GLYPHS` correspondiente contiene el nuevo mapeo.

**En caso de fallo:** Si la construccion reporta "No glyph mapped", verificar que el ID de la entidad coincide exactamente con el del manifiesto y el registro.

### Paso 4: Manifiesto — Agregar Entrada de Icono

Registrar el icono en el archivo de manifiesto correspondiente.

**Para habilidades:** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**Para agentes:** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**Para equipos:** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**Esperado:** JSON valido con la nueva entrada colocada entre sus entidades del mismo tipo.

**En caso de fallo:** Validar la sintaxis JSON. Errores comunes: coma final despues del ultimo elemento del arreglo, comillas faltantes.

### Paso 5: Renderizar — Generar el Icono

Ejecutar el pipeline de construccion para renderizar el WebP.

1. Navegar al directorio `viz/`
2. Renderizar segun el tipo de entidad:

**Para habilidades:**
```bash
cd viz && Rscript build-icons.R --only <domain>
# O saltar existentes: Rscript build-icons.R --only <domain> --skip-existing
```

**Para agentes:**
```bash
cd viz && Rscript build-agent-icons.R --only <agent-id>
# O saltar existentes: Rscript build-agent-icons.R --only <agent-id> --skip-existing
```

**Para equipos:**
```bash
cd viz && Rscript build-team-icons.R --only <team-id>
# O saltar existentes: Rscript build-team-icons.R --only <team-id> --skip-existing
```

3. Para una ejecucion en seco primero, agregar `--dry-run` a cualquier comando
4. Ubicaciones de salida:
   - Habilidades: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - Agentes: `viz/public/icons/<palette>/agents/<agent-id>.webp`
   - Equipos: `viz/public/icons/<palette>/teams/<team-id>.webp`

**Esperado:** El registro muestra `OK: <entity> (seed=XXXXX, XX.XKB)` y el archivo WebP existe.

**En caso de fallo:**
- `"No glyph mapped"` — Falta el mapeo del Paso 3 o tiene un error tipografico
- `"Unknown domain"` — El dominio no esta en `get_palette_colors()` en `palettes.R`
- Errores de paquetes R — Ejecutar `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` primero
- Si el renderizado falla, probar la funcion del glyph interactivamente (ver alternativa del Paso 2)

### Paso 6: Verificar — Inspeccion Visual

Comprobar que la salida renderizada cumple los estandares de calidad.

1. Verificar que el archivo existe y tiene un tamano razonable:
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Esperado: rango tipico de 15-80 KB
   ```

2. Abrir el WebP en un visor de imagenes para comprobar:
   - La forma se lee claramente a tamano completo (1024x1024)
   - El resplandor neon esta presente pero no es excesivo
   - El fondo es transparente (sin rectangulo negro/blanco)
   - No hay recorte en los bordes del lienzo

3. Comprobar a tamanos pequenos (el icono se renderiza a ~40-160px en el grafo de fuerzas):
   - La forma sigue siendo reconocible
   - Los detalles no se convierten en ruido
   - El resplandor no abruma la forma

**Esperado:** Un pictograma claro y reconocible con resplandor neon uniforme sobre fondo transparente.

**En caso de fallo:**
- Resplandor demasiado fuerte: re-renderizar con `--glow-sigma 2` (el predeterminado es 4)
- Resplandor demasiado debil: re-renderizar con `--glow-sigma 8`
- Forma ilegible a tamanos pequenos: simplificar el glyph (menos capas, trazos mas gruesos, aumentar el valor base de `.lw(s, base)`)
- Recorte en los bordes: reducir las dimensiones de la forma o desplazar el centro

### Paso 7: Iterar — Refinar si es Necesario

Realizar ajustes y re-renderizar.

1. Ajustes comunes:
   - **Trazos mas gruesos**: aumentar `.lw(s, base)` — probar `base = 3.0` o `3.5`
   - **Relleno mas visible**: aumentar el alpha de 0.10 a 0.15-0.20
   - **Proporciones de la forma**: ajustar los multiplicadores de `s` (p. ej., `20 * s` -> `24 * s`)
   - **Agregar/eliminar capas de detalle**: mantener el total de capas entre 2-6 para mejores resultados

2. Para re-renderizar despues de cambios:
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. Cuando se este satisfecho, verificar que el estado del manifiesto muestra `"done"` (el script de construccion lo actualiza automaticamente al completarse con exito)

**Esperado:** El icono final pasa todas las verificaciones del Paso 6.

**En caso de fallo:** Si despues de 3+ iteraciones el glyph aun no se lee bien, considerar usar una metafora visual completamente diferente (volver al Paso 1).

## Referencia

### Paletas de Color por Dominio y Entidad

Los 58 colores de dominio (para habilidades) estan definidos en `viz/R/palettes.R` (la unica fuente de verdad). Los colores de agentes y equipos tambien se gestionan en `palettes.R`. La paleta cyberpunk (colores neon ajustados manualmente) esta en `get_cyberpunk_colors()`. Las paletas de la familia viridis se generan automaticamente via `viridisLite`.

Para buscar un color:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

Al agregar un nuevo dominio, agregarlo en tres lugares de `palettes.R`:
1. `PALETTE_DOMAIN_ORDER` (alfabeticamente)
2. Lista de dominios en `get_cyberpunk_colors()`
3. Ejecutar `Rscript generate-palette-colors.R` para regenerar JSON + JS

### Catalogo de Funciones de Glyph

Consultar el catalogo completo de funciones de glyph disponibles en los archivos fuente de primitivas:
- **Habilidades**: `viz/R/primitives.R` hasta `viz/R/primitives_19.R` (agrupados por dominio)
- **Agentes**: `viz/R/agent_primitives.R`
- **Equipos**: `viz/R/team_primitives.R`

### Funciones Auxiliares

| Funcion | Firma | Proposito |
|---------|-------|-----------|
| `.lw(s, base)` | `(scale, base=2.5)` | Ancho de linea consciente de la escala |
| `.aes(...)` | alias de `ggplot2::aes` | Atajo para mapeo estetico |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | Agregar alfa a color hexadecimal |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | Aclarar un color hexadecimal |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | Oscurecer un color hexadecimal |

## Lista de Validacion

- [ ] La funcion del glyph sigue la firma `glyph_<name>(cx, cy, s, col, bright) -> list()`
- [ ] Todas las dimensiones usan el factor de escala `* s`
- [ ] La estrategia de color usa `col` para rellenos, `bright` para contornos, `hex_with_alpha()` para transparencia
- [ ] La funcion esta colocada en el archivo de primitivas correcto segun tipo de entidad y dominio
- [ ] Entrada de mapeo del glyph agregada en el archivo `*_glyphs.R` correspondiente
- [ ] Entrada del manifiesto agregada con ID de entidad correcto, ruta y `"status": "pending"`
- [ ] El comando de construccion se ejecuta sin errores (ejecucion en seco primero)
- [ ] El WebP renderizado existe en la ruta esperada
- [ ] El tamano del archivo esta en el rango esperado (15-80 KB)
- [ ] El icono se lee claramente tanto a 1024px como a ~40px de tamano de visualizacion
- [ ] Fondo transparente (sin rectangulo solido detras del glyph)
- [ ] El estado del manifiesto se actualizo a `"done"` despues del renderizado exitoso

## Errores Comunes

- **Olvidar `* s`**: Los valores de pixeles codificados directamente se rompen cuando la escala cambia. Siempre multiplicar por `s`.
- **Confusion del origen del lienzo**: (0,0) esta en la esquina inferior izquierda, no la superior izquierda. Valores de `y` mas altos mueven ARRIBA.
- **Doble resplandor**: El renderizador ya aplica `ggfx::with_outer_glow()` a cada capa. NO agregar resplandor dentro de la funcion del glyph.
- **Demasiadas capas**: Cada capa recibe su propio envoltorio de resplandor. Mas de 8 capas hace el renderizado lento y visualmente ruidoso.
- **IDs no coincidentes**: El ID de la entidad en el mapeo del glyph, el manifiesto y el registro deben coincidir exactamente.
- **Comas finales en JSON**: El manifiesto es JSON estricto. Sin coma final despues del ultimo elemento del arreglo.
- **Color de dominio faltante**: Si el dominio no esta en `get_cyberpunk_colors()` en `palettes.R`, el renderizado fallara. Agregar el color primero y luego regenerar.
- **Archivo de primitivas incorrecto**: Las habilidades van en `primitives*.R` agrupados por dominio, los agentes en `agent_primitives.R`, los equipos en `team_primitives.R`.

## Habilidades Relacionadas

- [enhance-glyph](../enhance-glyph/SKILL.md) — mejorar la calidad visual de un glyph existente, corregir problemas de renderizado o agregar capas de detalle
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detectar glyphs e iconos faltantes para saber que necesita crearse
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — ejecutar el pipeline de renderizado completo de principio a fin
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — generacion de imagenes complementaria basada en IA (Z-Image vs glyphs codificados en R)
- [ornament-style-color](../ornament-style-color/SKILL.md) — teoria del color aplicable a decisiones de relleno con acento en glyphs
- [create-skill](../create-skill/SKILL.md) — el flujo de trabajo padre que activa la creacion de glyphs al agregar nuevas habilidades
