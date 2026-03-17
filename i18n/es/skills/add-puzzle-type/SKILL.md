---
name: add-puzzle-type
description: >
  Crear la estructura para un nuevo tipo de rompecabezas en los mas de 10
  puntos de integracion del pipeline en jigsawR. Crea el modulo central del
  rompecabezas, lo conecta al pipeline unificado (generacion, posicionamiento,
  renderizado, adyacencia), agrega capas geom/stat de ggpuzzle, actualiza
  DESCRIPTION y config.yml, extiende la aplicacion Shiny y crea una suite de
  pruebas completa. Usar al agregar un tipo de rompecabezas completamente
  nuevo al paquete o al seguir la lista de verificacion de integracion de
  10 puntos para asegurar que nada se omita de principio a fin.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Agregar Tipo de Rompecabezas

Crear la estructura para un nuevo tipo de rompecabezas en todos los puntos de integracion del pipeline en jigsawR.

## Cuando Usar

- Agregar un tipo de rompecabezas completamente nuevo al paquete
- Seguir la lista de verificacion de integracion establecida (pipeline de 10 puntos de CLAUDE.md)
- Asegurar que nada se omita al conectar un nuevo tipo de principio a fin

## Entradas

- **Requerido**: Nombre del nuevo tipo (minusculas, ej. `"triangular"`)
- **Requerido**: Descripcion de la geometria (como se forman/organizan las piezas)
- **Requerido**: Si el tipo necesita paquetes externos (agregar a Suggests)
- **Opcional**: Lista de parametros mas alla de los estandar (grid, size, seed, tabsize, offset)
- **Opcional**: Implementacion de referencia o fuente del algoritmo

## Procedimiento

### Paso 1: Crear Modulo Central del Rompecabezas

Crear `R/<type>_puzzle.R` con la funcion interna de generacion:

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. Initialize RNG state
  # 2. Generate piece geometries
  # 3. Build edge paths (SVG path data)
  # 4. Compute adjacency
  # 5. Return list: pieces, edges, adjacency, metadata
}
```

Seguir el patron en `R/voronoi_puzzle.R` o `R/snic_puzzle.R` para la estructura.

**Esperado:** La funcion retorna una lista con `$pieces`, `$edges`, `$adjacency`, `$metadata`.

**En caso de fallo:** Comparar la estructura de retorno contra `generate_voronoi_pieces_internal()` para identificar elementos de lista faltantes o tipos incorrectos.

### Paso 2: Conectar en jigsawR_clean.R

Editar `R/jigsawR_clean.R`:

1. Agregar `"<type>"` al vector `valid_types`
2. Agregar extraccion de parametros especificos del tipo en la seccion de parametros
3. Agregar logica de validacion para restricciones especificas del tipo
4. Agregar mapeo de prefijo de nombre de archivo (ej., `"<type>"` -> `"<type>_"`)

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**Esperado:** `generate_puzzle(type = "<type>")` es aceptado sin error de "tipo desconocido".

**En caso de fallo:** Verificar que la cadena del tipo se agrego a `valid_types` exactamente como se escribe, y que la extraccion de parametros cubre todos los argumentos requeridos especificos del tipo.

### Paso 3: Conectar en unified_piece_generation.R

Editar `R/unified_piece_generation.R`:

1. Agregar caso de despacho en `generate_pieces_internal()`
2. Agregar manejo de fusion si el tipo soporta notacion PILES

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**Esperado:** Las piezas se generan cuando se despacha el tipo.

**En caso de fallo:** Confirmar que la cadena del caso de despacho coincide exactamente con el nombre del tipo y que `generate_<type>_pieces_internal` esta definida y exportada desde el modulo del rompecabezas.

### Paso 4: Conectar en piece_positioning.R

Editar `R/piece_positioning.R`:

Agregar despacho de posicionamiento para el nuevo tipo. La mayoria de los tipos usan logica de posicionamiento compartida, pero algunos necesitan manejo personalizado.

**Esperado:** `apply_piece_positioning()` maneja el nuevo tipo sin errores y las piezas se colocan en las coordenadas correctas.

**En caso de fallo:** Verificar si el nuevo tipo necesita logica de posicionamiento personalizada o puede reutilizar la ruta de posicionamiento compartida. Agregar un caso de despacho si la ruta predeterminada no aplica.

### Paso 5: Conectar en unified_renderer.R

Editar `R/unified_renderer.R`:

1. Agregar caso de renderizado en `render_puzzle_svg()`
2. Agregar funcion de ruta de bordes: `get_<type>_edge_paths()`
3. Agregar funcion de nombre de pieza: `get_<type>_piece_name()`

**Esperado:** Se genera salida SVG para el nuevo tipo con contornos de piezas y rutas de bordes correctos.

**En caso de fallo:** Verificar que `get_<type>_edge_paths()` retorna datos de ruta SVG validos y `get_<type>_piece_name()` produce identificadores unicos para cada pieza.

### Paso 6: Conectar en adjacency_api.R

Editar `R/adjacency_api.R`:

Agregar despacho de vecinos para que `get_neighbors()` y `get_adjacency()` funcionen para el nuevo tipo.

**Esperado:** `get_neighbors(result, piece_id)` retorna los vecinos correctos para cualquier pieza del rompecabezas.

**En caso de fallo:** Verificar que el despacho de adyacencia retorna la estructura de datos correcta. Probar con una cuadricula pequena y verificar manualmente las relaciones de vecindad contra la geometria.

### Paso 7: Agregar Capa Geom de ggpuzzle

Editar `R/geom_puzzle.R`:

Crear `geom_puzzle_<type>()` usando la fabrica `make_puzzle_layer()`:

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**Esperado:** `ggplot() + geom_puzzle_<type>(aes(...))` se renderiza sin error.

**En caso de fallo:** Verificar que `make_puzzle_layer()` recibe la cadena de tipo correcta y que la funcion geom esta exportada en el NAMESPACE via `@export`.

### Paso 8: Agregar Despacho Stat

Editar `R/stat_puzzle.R`:

1. Agregar parametros predeterminados especificos del tipo
2. Agregar caso de despacho en `compute_panel()`

**Esperado:** La capa stat calcula la geometria del rompecabezas correctamente y produce el numero esperado de poligonos.

**En caso de fallo:** Verificar que el caso de despacho de `compute_panel()` retorna un data frame con las columnas requeridas (`x`, `y`, `group`, `piece_id`) y que los parametros predeterminados son razonables para el nuevo tipo.

### Paso 9: Actualizar DESCRIPTION

Editar `DESCRIPTION`:

1. Agregar el nuevo tipo al texto del campo Description
2. Agregar nuevos paquetes a `Suggests:` (si es dependencia externa)
3. Actualizar `Collate:` para incluir el nuevo archivo R (orden alfabetico)

**Esperado:** `devtools::document()` tiene exito. Sin NOTE sobre archivos no listados.

**En caso de fallo:** Verificar que el nuevo archivo R esta listado en el campo `Collate:` en orden alfabetico y que cualquier nuevo paquete en Suggests esta escrito correctamente con restricciones de version.

### Paso 10: Actualizar config.yml

Editar `inst/config.yml`:

Agregar valores predeterminados y restricciones para el nuevo tipo:

```yaml
<type>:
  grid:
    default: [3, 3]
    min: [2, 2]
    max: [20, 20]
  size:
    default: [300, 300]
    min: [100, 100]
    max: [2000, 2000]
  tabsize:
    default: 20
    min: 5
    max: 50
  # Add type-specific params here
```

**Esperado:** La configuracion es YAML valido. Los valores predeterminados producen un rompecabezas funcional cuando son usados por `generate_puzzle()`.

**En caso de fallo:** Validar YAML con `yaml::yaml.load_file("inst/config.yml")`. Asegurar que los valores predeterminados de grid y size producen un rompecabezas razonable (ni demasiado pequeno ni demasiado grande).

### Paso 11: Extender la Aplicacion Shiny

Editar `inst/shiny-app/app.R`:

1. Agregar el nuevo tipo al selector de tipo en la UI
2. Agregar paneles UI condicionales para parametros especificos del tipo
3. Agregar logica de generacion del lado del servidor

**Esperado:** La aplicacion Shiny muestra el nuevo tipo en el desplegable y genera rompecabezas cuando se selecciona.

**En caso de fallo:** Verificar que el tipo se agrego al argumento `choices` del selector UI, que el panel condicional para parametros especificos del tipo usa `conditionalPanel(condition = "input.type == '<type>'")`, y que el manejador del servidor pasa los parametros correctos.

### Paso 12: Crear Suite de Pruebas

Crear `tests/testthat/test-<type>-puzzles.R`:

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

Si el tipo requiere un paquete externo, envolver las pruebas con `skip_if_not_installed()`.

**Esperado:** Todas las pruebas pasan. Sin omisiones a menos que falte una dependencia externa.

**En caso de fallo:** Verificar cada punto de integracion individualmente. El problema mas comun es la falta de casos de despacho -- ejecutar `grep -rn "switch\|valid_types" R/` para encontrar todas las ubicaciones de despacho.

## Validacion

- [ ] `generate_puzzle(type = "<type>")` produce salida valida
- [ ] Los 10 puntos de integracion estan conectados correctamente
- [ ] `devtools::test()` pasa con las nuevas pruebas
- [ ] `devtools::check()` retorna 0 errores, 0 advertencias
- [ ] La aplicacion Shiny renderiza el nuevo tipo
- [ ] Las restricciones de configuracion se aplican (validacion min/max)
- [ ] La adyacencia y fusion funcionan correctamente
- [ ] La capa geom de ggpuzzle se renderiza sin error
- [ ] `devtools::document()` tiene exito (NAMESPACE actualizado)

## Errores Comunes

- **Caso de despacho faltante**: Olvidar uno de los mas de 10 archivos causa fallo silencioso o errores de "tipo desconocido"
- **strsplit con numeros negativos**: Al crear claves de adyacencia con `paste(a, b, sep = "-")`, las etiquetas de pieza negativas producen claves como `"1--1"`. Usar separador `"|"` y dividir con `"\\|"`.
- **Usar `cat()` para salida**: Siempre usar envoltorios de registro del paquete `cli` (`log_info`, `log_warn`, etc.)
- **Orden de Collate**: El campo Collate de DESCRIPTION debe estar en orden alfabetico o por dependencias
- **Formato de Config.yml**: Asegurar que el YAML es valido; probar con `yaml::yaml.load_file("inst/config.yml")`

## Habilidades Relacionadas

- `generate-puzzle` -- probar el nuevo tipo despues de crearlo
- `run-puzzle-tests` -- ejecutar la suite completa de pruebas para verificar la integracion
- `validate-piles-notation` -- probar fusion con el nuevo tipo
- `write-testthat-tests` -- patrones generales de escritura de pruebas
- `write-roxygen-docs` -- documentar la nueva funcion geom
