---
name: generate-puzzle
description: >
  Generar rompecabezas mediante generate_puzzle() o geom_puzzle_*() con
  validacion de parametros contra inst/config.yml. Soporta tipos de
  rompecabezas rectangulares, hexagonales, concentricos, voronoi y snic con
  parametros configurables de cuadricula, tamano, semilla, desplazamiento y
  disposicion. Usar al crear archivos SVG de rompecabezas para un tipo y
  configuracion especificos, probar la generacion con diferentes parametros,
  generar salida de muestra para documentacion o demos, o crear
  visualizaciones de rompecabezas con ggplot2.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Generar Rompecabezas

Generar rompecabezas usando la API unificada del paquete jigsawR.

## Cuando Usar

- Crear archivos SVG de rompecabezas para un tipo y configuracion especificos
- Probar la generacion de rompecabezas con diferentes parametros
- Generar salida de muestra para documentacion o demos
- Crear visualizaciones de rompecabezas con geom_puzzle_*() de ggplot2

## Entradas

- **Requerido**: Tipo de rompecabezas (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Requerido**: Dimensiones de cuadricula (dependiente del tipo: `c(cols, rows)` o `c(rings)`)
- **Opcional**: Tamano en mm (el valor predeterminado varia segun el tipo)
- **Opcional**: Semilla para reproducibilidad (predeterminado: 42)
- **Opcional**: Desplazamiento (0 = entrelazado, >0 = piezas separadas)
- **Opcional**: Disposicion (`"grid"` o `"repel"` para rectangular)
- **Opcional**: Grupos de fusion (cadena en notacion PILES)

## Procedimiento

### Paso 1: Leer Restricciones de Configuracion

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

O leer `inst/config.yml` directamente para verificar los rangos validos para el tipo elegido.

**Esperado:** Los valores min/max para grid, size, tabsize y otros parametros son conocidos para el tipo de rompecabezas elegido.

**En caso de fallo:** Si `config.yml` no existe o la clave del tipo no existe, verificar que se encuentra en la raiz del proyecto jigsawR y que el paquete ha sido compilado al menos una vez.

### Paso 2: Determinar Tipo y Parametros

Mapear la solicitud del usuario a argumentos validos de `generate_puzzle()`:

| Tipo | grid | size | Parametros extra |
|------|------|------|-----------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**Esperado:** La solicitud del usuario mapeada a argumentos validos de `generate_puzzle()` con `type`, dimensiones `grid` y valores `size` correctos dentro de los rangos de config.yml.

**En caso de fallo:** Si no esta seguro de que formato de parametro usar, consulte la tabla anterior. Los tipos rectangular y voronoi usan `c(cols, rows)` para grid; hexagonal y concentric usan `c(rings)`.

### Paso 3: Crear Script R

Escribir un archivo de script (preferido sobre `-e` para comandos complejos):

```r
library(jigsawR)

result <- generate_puzzle(
  type = "rectangular",
  seed = 42,
  grid = c(3, 4),
  size = c(400, 300),
  offset = 0,
  layout = "grid"
)

cat("Pieces:", length(result$pieces), "\n")
cat("SVG length:", nchar(result$svg_content), "\n")
cat("Files:", paste(result$files, collapse = ", "), "\n")
```

Guardar en un archivo de script temporal.

**Esperado:** Un archivo de script R guardado en una ubicacion temporal que contiene `library(jigsawR)`, una llamada a `generate_puzzle()` con todos los parametros y lineas de salida diagnostica.

**En caso de fallo:** Si el script tiene errores de sintaxis, verificar que todos los argumentos de cadena estan entre comillas y los vectores numericos usan `c()`. Evitar el escape complejo del shell usando siempre archivos de script.

### Paso 4: Ejecutar mediante WSL R

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**Esperado:** El script se completa sin errores. Archivo(s) SVG escritos en `output/`.

**En caso de fallo:** Verificar que renv esta restaurado (`renv::restore()`). Verificar que el paquete esta cargado (`devtools::load_all()`). NO usar la bandera `--vanilla` (renv necesita .Rprofile).

### Paso 5: Verificar Salida

- El archivo SVG existe en el directorio `output/`
- El contenido SVG comienza con `<?xml` o `<svg`
- El conteo de piezas coincide con lo esperado: cols * rows (rectangular), formula de anillos (hex/concentric)
- Para el enfoque ggplot2, verificar que el objeto de grafico se renderiza sin error

**Esperado:** El archivo SVG existe en `output/`, el contenido comienza con `<?xml` o `<svg`, y el conteo de piezas coincide con la especificacion de cuadricula (cols * rows para rectangular, formula de anillos para hex/concentric).

**En caso de fallo:** Si falta el archivo SVG, verificar que el directorio `output/` existe. Si el conteo de piezas es incorrecto, verificar que las dimensiones de cuadricula coinciden con la formula esperada del tipo de rompecabezas. Para salida ggplot2, verificar que el grafico se renderiza sin error envolviendolo en `tryCatch()`.

### Paso 6: Guardar Salida

Los archivos generados se guardan en `output/` por defecto. El objeto `result` contiene:
- `$svg_content` -- cadena SVG sin procesar
- `$pieces` -- lista de datos de piezas
- `$canvas_size` -- dimensiones
- `$files` -- rutas a archivos escritos

**Esperado:** El objeto `result` contiene los campos `$svg_content`, `$pieces`, `$canvas_size` y `$files`. Los archivos listados en `$files` existen en disco.

**En caso de fallo:** Si `$files` esta vacio, el rompecabezas puede haberse generado solo en memoria. Guardar explicitamente con `writeLines(result$svg_content, "output/puzzle.svg")`.

## Validacion

- [ ] El script se ejecuta sin errores
- [ ] El archivo SVG es XML bien formado
- [ ] El conteo de piezas coincide con la especificacion de cuadricula
- [ ] La misma semilla produce salida identica (reproducibilidad)
- [ ] Los parametros estan dentro de las restricciones de config.yml

## Errores Comunes

- **Usar la bandera `--vanilla`**: Rompe la activacion de renv. Nunca usarla.
- **Comandos `-e` complejos**: Usar archivos de script en su lugar; el escape del shell causa codigo de salida 5.
- **Confusion grid vs size**: Grid es el conteo de piezas, size son las dimensiones fisicas en mm.
- **Semantica de offset**: 0 = rompecabezas ensamblado, positivo = piezas explotadas/separadas.
- **SNIC sin paquete**: El tipo snic requiere el paquete `snic` instalado.

## Habilidades Relacionadas

- `add-puzzle-type` -- crear un nuevo tipo de rompecabezas de principio a fin
- `validate-piles-notation` -- validar cadenas de grupos de fusion antes de pasarlas a generate_puzzle()
- `run-puzzle-tests` -- ejecutar la suite de pruebas despues de cambios en la generacion
- `write-testthat-tests` -- agregar pruebas para nuevos escenarios de generacion
