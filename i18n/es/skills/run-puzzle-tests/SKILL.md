---
name: run-puzzle-tests
description: >
  Ejecutar la suite de pruebas de jigsawR mediante ejecucion R en WSL.
  Soporta suite completa, filtrada por patron o archivo individual.
  Interpreta conteos de pases/fallos/omisiones e identifica pruebas
  fallidas. Nunca usa la bandera --vanilla (renv necesita .Rprofile para
  activacion). Usar despues de modificar cualquier codigo fuente R, despues
  de agregar un nuevo tipo de rompecabezas o caracteristica, antes de
  confirmar cambios para verificar que nada esta roto, o al depurar un
  fallo de prueba especifico.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Ejecutar Pruebas de Rompecabezas

Ejecutar la suite de pruebas de jigsawR e interpretar resultados.

## Cuando Usar

- Despues de modificar cualquier codigo fuente R en el paquete
- Despues de agregar un nuevo tipo de rompecabezas o caracteristica
- Antes de confirmar cambios para verificar que nada esta roto
- Depurar un fallo de prueba especifico

## Entradas

- **Requerido**: Alcance de pruebas (`full`, `filtered` o `single`)
- **Opcional**: Patron de filtro (para modo filtrado, ej. `"snic"`, `"rectangular"`)
- **Opcional**: Ruta especifica del archivo de prueba (para modo individual)

## Procedimiento

### Paso 1: Elegir Alcance de Pruebas

| Alcance | Usar cuando | Duracion |
|---------|------------|----------|
| Full | Antes de commits, despues de cambios importantes | ~2-5 min |
| Filtered | Trabajando en un tipo de rompecabezas | ~30s |
| Single | Depurando un archivo de prueba especifico | ~10s |

**Esperado:** Alcance de pruebas seleccionado segun el flujo de trabajo actual: suite completa antes de commits, filtrada al trabajar en un tipo de rompecabezas especifico, archivo individual al depurar una prueba.

**En caso de fallo:** Si no esta seguro de que alcance usar, usar suite completa por defecto. Toma mas tiempo pero detecta regresiones entre tipos.

### Paso 2: Crear y Ejecutar Script de Prueba

**Suite completa**:

Crear un archivo de script (ej., `/tmp/run_tests.R`):

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**Filtrado por patron**:

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**Archivo individual**:

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**Esperado:** Salida de pruebas con conteos de pases/fallos/omisiones.

**En caso de fallo:**
- NO usar la bandera `--vanilla`; renv necesita `.Rprofile` para activarse
- Si hay errores de renv, ejecutar `renv::restore()` primero
- Para comandos complejos que fallan con codigo de salida 5, escribir en un archivo de script

### Paso 3: Interpretar Resultados

Buscar la linea de resumen:

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Pruebas exitosas
- **FAIL**: Pruebas fallidas (necesitan investigacion)
- **SKIP**: Pruebas omitidas (generalmente por paquetes opcionales faltantes como `snic`)
- **WARN**: Advertencias durante pruebas (revisar pero no bloquean)

**Esperado:** La linea de resumen analizada para identificar conteos PASS, FAIL, SKIP y WARN. FAIL = 0 para una ejecucion de pruebas limpia.

**En caso de fallo:** Si la linea de resumen no es visible, el ejecutor de pruebas puede haberse detenido antes de completar. Verificar errores a nivel de R sobre el resumen. Si la salida esta truncada, redirigir a un archivo: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Paso 4: Investigar Fallos

Si las pruebas fallan:

1. Leer el mensaje de fallo -- incluye archivo, linea y esperado vs real
2. Verificar si es un fallo nuevo o preexistente
3. Para fallos de asercion, leer la prueba y la funcion siendo probada
4. Para fallos de error, verificar si cambio una firma de funcion

```bash
# Run just the failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**Esperado:** Causa raiz de cada prueba fallida identificada. El fallo es una regresion genuina (el codigo necesita correccion) o un problema del entorno de pruebas (dependencia faltante, problema de ruta).

**En caso de fallo:** Si el mensaje de fallo no es claro, agregar sentencias `browser()` o `print()` a la prueba y re-ejecutar con `testthat::test_file()` para depuracion interactiva.

### Paso 5: Verificar Razones de Omision

Las pruebas omitidas son normales cuando faltan dependencias opcionales:

- Las pruebas del paquete `snic` se omiten con `skip_if_not_installed("snic")`
- Las pruebas que requieren un SO especifico se omiten con `skip_on_os()`
- Omisiones solo para CRAN con `skip_on_cran()`

Confirmar que las razones de omision son legitimas, no enmascaran fallos reales.

**Esperado:** Todas las omisiones se explican por razones legitimas (dependencia opcional no instalada, omision especifica de plataforma, omision solo para CRAN). Ninguna omision enmascara fallos de prueba reales.

**En caso de fallo:** Si una omision parece sospechosa, eliminar temporalmente la llamada `skip_if_*()` y ejecutar la prueba para ver si pasa o revela un fallo oculto.

## Validacion

- [ ] Todas las pruebas pasan (FAIL = 0)
- [ ] Sin advertencias inesperadas
- [ ] El conteo de omisiones coincide con lo esperado (solo omisiones de dependencias opcionales)
- [ ] El conteo de pruebas no ha disminuido (ninguna prueba eliminada accidentalmente)

## Errores Comunes

- **Usar `--vanilla`**: Rompe la activacion de renv. Nunca usarlo con jigsawR.
- **Cadenas `-e` complejas**: Problemas de escape del shell causan codigo de salida 5. Usar archivos de script.
- **Estado del paquete obsoleto**: Ejecutar `devtools::load_all()` o `devtools::document()` antes de probar si cambio codigo que afecta el NAMESPACE.
- **Dependencias de prueba faltantes**: Algunas pruebas necesitan paquetes sugeridos. Verificar el campo Suggests de `DESCRIPTION`.
- **Problemas de pruebas paralelas**: Si las pruebas interfieren, ejecutar secuencialmente con `testthat::test_file()`.

## Habilidades Relacionadas

- `generate-puzzle` -- generar rompecabezas para verificar que el comportamiento coincide con las pruebas
- `add-puzzle-type` -- los nuevos tipos necesitan suites de pruebas completas
- `write-testthat-tests` -- patrones generales para escribir pruebas R
- `validate-piles-notation` -- probar el analisis PILES independientemente
