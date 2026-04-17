---
name: fail-early-pattern
description: >
  Aplica el patrón de fallo temprano (fail-fast) para detectar y reportar
  errores en el punto más temprano posible. Cubre la validación de entradas
  con cláusulas de guarda, mensajes de error significativos, funciones de
  aserción y anti-patrones que silenciosamente consumen fallos. Ejemplos
  principales en R con orientación general/polígota. Usar al escribir funciones
  que aceptan entrada externa, al añadir validación de entradas antes del envío
  a CRAN, al refactorizar código que silenciosamente produce resultados
  incorrectos, al revisar PRs para la calidad del manejo de errores, o al
  reforzar APIs internas contra argumentos inválidos.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: error-handling, validation, defensive-programming, guard-clauses, fail-fast
  locale: es
  source_locale: en
  source_commit: acc252e6
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Fallo Temprano

Si algo va a fallar, debe fallar lo antes posible, lo más ruidosamente posible, con tanto contexto como sea posible. Esta habilidad codifica el patrón de fallo temprano: validar entradas en los límites del sistema, usar cláusulas de guarda para rechazar estados inválidos antes de que se propaguen, y escribir mensajes de error que respondan *qué* falló, *dónde*, *por qué* y *cómo solucionarlo*.

## Cuándo Usar

- Al escribir o revisar funciones que aceptan entrada externa (datos del usuario, respuestas de API, contenidos de archivos)
- Al añadir validación de entradas a funciones de paquetes antes del envío a CRAN
- Al refactorizar código que silenciosamente produce resultados incorrectos en lugar de generar errores
- Al revisar pull requests para la calidad del manejo de errores
- Al reforzar APIs internas contra argumentos inválidos

## Entradas

- **Requerido**: Función o módulo al que aplicar el patrón
- **Requerido**: Identificación de los límites de confianza (dónde entra datos externos)
- **Opcional**: Código de manejo de errores existente para refactorizar
- **Opcional**: Lenguaje objetivo (por defecto: R; también aplica a Python, TypeScript, Rust)

## Procedimiento

### Paso 1: Identificar los Límites de Confianza

Mapear dónde los datos externos entran al sistema. Estos son los puntos que necesitan validación:

- Funciones de API públicas (funciones exportadas en un paquete R)
- Parámetros de cara al usuario
- E/S de archivos (leer configuraciones, archivos de datos, cargas de usuarios)
- Respuestas de red (llamadas API, consultas de base de datos)
- Variables de entorno y configuración del sistema

Las funciones auxiliares internas llamadas solo por tu propio código validado generalmente no necesitan validación redundante.

**Esperado:** Una lista de puntos de entrada donde los datos no confiables cruzan hacia tu código.

**En caso de fallo:** Si los límites no están claros, rastrear hacia atrás desde los errores en los registros o informes de errores para encontrar dónde entraron primero los datos incorrectos.

### Paso 2: Añadir Cláusulas de Guarda en los Puntos de Entrada

Validar las entradas al inicio de cada función pública, antes de que comience cualquier trabajo.

**R (base):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  # Guarda: verificación de tipo
  if (!is.data.frame(data)) {
    stop("'data' must be a data frame, not ", class(data)[[1]], call. = FALSE)
  }
  # Guarda: no vacío
  if (nrow(data) == 0L) {
    stop("'data' must have at least one row", call. = FALSE)
  }
  # Guarda: coincidencia de argumentos
  method <- match.arg(method)
  # Guarda: verificación de rango
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    stop("'trim_pct' must be a number between 0 and 0.5, got: ", trim_pct, call. = FALSE)
  }
  # --- Todas las guardas pasaron, comenzar trabajo real ---
  # ...
}
```

**R (rlang/cli — preferido para paquetes):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  rlang::check_required(data)
  if (!is.data.frame(data)) {
    cli::cli_abort("{.arg data} must be a data frame, not {.cls {class(data)}}.")
  }
  if (nrow(data) == 0L) {
    cli::cli_abort("{.arg data} must have at least one row.")
  }
  method <- rlang::arg_match(method)
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    cli::cli_abort("{.arg trim_pct} must be between 0 and 0.5, not {.val {trim_pct}}.")
  }
  # ...
}
```

**General (TypeScript):**

```typescript
function calculateSummary(data: DataFrame, method: Method, trimPct: number): Summary {
  if (data.rows.length === 0) {
    throw new Error(`data must have at least one row`);
  }
  if (trimPct < 0 || trimPct > 0.5) {
    throw new RangeError(`trimPct must be between 0 and 0.5, got: ${trimPct}`);
  }
  // ...
}
```

**Esperado:** Cada función pública abre con cláusulas de guarda que rechazan entradas inválidas antes de cualquier efecto secundario o cálculo.

**En caso de fallo:** Si la lógica de validación se alarga (>15 líneas de guardas), extraer un auxiliar `validate_*` o usar `stopifnot()` para aserciones de tipo simples.

### Paso 3: Escribir Mensajes de Error Significativos

Cada mensaje de error debe responder cuatro preguntas:

1. **Qué** falló — qué parámetro u operación
2. **Dónde** — nombre de función o contexto (automático con `cli::cli_abort`)
3. **Por qué** — qué se esperaba vs. qué se recibió
4. **Cómo solucionarlo** — cuando la solución no es obvia

**Buenos mensajes:**

```r
# Qué + Por qué (esperado vs. real)
stop("'n' must be a positive integer, got: ", n, call. = FALSE)

# Qué + Por qué + Cómo solucionarlo
cli::cli_abort(c(
  "{.arg config_path} does not exist: {.file {config_path}}",
  "i" = "Create it with {.run create_config({.file {config_path}})}."
))

# Qué + contexto
cli::cli_abort(c(
  "Column {.val {col_name}} not found in {.arg data}.",
  "i" = "Available columns: {.val {names(data)}}"
))
```

**Malos mensajes:**

```r
stop("Error")                    # ¿Qué falló? No hay idea
stop("Invalid input")           # ¿Qué entrada? ¿Qué tiene de malo?
stop(paste("Error in step", i)) # Sin información accionable
```

**Esperado:** Los mensajes de error se documentan por sí mismos — un desarrollador que ve el error por primera vez puede diagnosticarlo y solucionarlo sin leer el código fuente.

**En caso de fallo:** Revisar los tres informes de errores más recientes. Si alguno requirió leer el código fuente para entenderlo, sus mensajes de error necesitan mejoras.

### Paso 4: Preferir stop() Sobre warning()

Usar `stop()` (o `cli::cli_abort()`) cuando la función no puede producir un resultado correcto. Usar `warning()` solo cuando la función aún puede producir un resultado significativo pero el llamador debe saber sobre una preocupación.

**Regla general:** Si un usuario pudiera obtener silenciosamente una respuesta incorrecta, eso es un `stop()`, no un `warning()`.

```r
# CORRECTO: stop cuando el resultado sería incorrecto
read_config <- function(path) {
  if (!file.exists(path)) {
    stop("Config file not found: ", path, call. = FALSE)
  }
  yaml::read_yaml(path)
}

# CORRECTO: advertir cuando el resultado aún es utilizable
summarize_data <- function(data) {
  if (any(is.na(data$value))) {
    warning(sum(is.na(data$value)), " NA values dropped from 'value' column", call. = FALSE)
    data <- data[!is.na(data$value), ]
  }
  # continuar con datos válidos
}
```

**Esperado:** `stop()` se usa para condiciones que producirían resultados incorrectos; `warning()` se reserva para resultados degradados pero válidos.

**En caso de fallo:** Auditar las llamadas a `warning()` existentes. Si la función devuelve algo sin sentido después de la advertencia, cambiarlo a `stop()`.

### Paso 5: Usar Aserciones para Invariantes Internos

Para condiciones que "nunca deben suceder" en código correcto, usar aserciones. Estas detectan errores del programador durante el desarrollo:

```r
# R: stopifnot para invariantes internos
process_chunk <- function(chunk, total_size) {
  stopifnot(
    is.list(chunk),
    length(chunk) > 0,
    total_size > 0
  )
  # ...
}

# R: aserción explícita con contexto
merge_results <- function(left, right) {
  if (ncol(left) != ncol(right)) {
    stop("Internal error: column count mismatch (", ncol(left), " vs ", ncol(right),
         "). This is a bug — please report it.", call. = FALSE)
  }
  # ...
}
```

**Esperado:** Los invariantes internos se afirman para que los errores surjan inmediatamente en el sitio de violación, no tres llamadas de función después con un error críptico.

**En caso de fallo:** Si los mensajes de `stopifnot()` son demasiado crípticos, cambiar a `if/stop` explícito con contexto.

### Paso 6: Refactorizar Anti-Patrones

Identificar y corregir estos anti-patrones comunes:

**Anti-patrón 1: tryCatch vacío (consumir errores silenciosamente)**

```r
# ANTES: El error desaparece silenciosamente
result <- tryCatch(
  parse_data(input),
  error = function(e) NULL
)

# DESPUÉS: Registrar, relanzar o devolver un error tipado
result <- tryCatch(
  parse_data(input),
  error = function(e) {
    cli::cli_abort("Failed to parse input: {e$message}", parent = e)
  }
)
```

**Anti-patrón 2: Valores por defecto enmascarando entradas incorrectas**

```r
# ANTES: El llamador nunca sabe que su entrada fue ignorada
process <- function(x = 10) {
  if (!is.numeric(x)) x <- 10  # reemplaza silenciosamente la entrada incorrecta
  x * 2
}

# DESPUÉS: Informar al llamador sobre el problema
process <- function(x = 10) {
  if (!is.numeric(x)) {
    stop("'x' must be numeric, got ", class(x)[[1]], call. = FALSE)
  }
  x * 2
}
```

**Anti-patrón 3: suppressWarnings como solución**

```r
# ANTES: Ocultar el síntoma en lugar de corregir la causa
result <- suppressWarnings(as.numeric(user_input))

# DESPUÉS: Validar explícitamente, manejar el caso esperado
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**Anti-patrón 4: Manejadores de excepción que capturan todo**

```r
# ANTES: Cada error tratado igual
tryCatch(
  complex_operation(),
  error = function(e) message("Something went wrong")
)

# DESPUÉS: Manejar condiciones específicas, dejar que las inesperadas se propaguen
tryCatch(
  complex_operation(),
  custom_validation_error = function(e) {
    cli::cli_warn("Validation issue: {e$message}")
    fallback_value
  }
  # Los errores inesperados se propagan naturalmente
)
```

**Esperado:** Los anti-patrones se reemplazan con validación explícita o manejo de errores específico.

**En caso de fallo:** Si eliminar un `tryCatch` causa fallos en cascada, el código aguas arriba tiene una brecha de validación. Corregir la fuente, no el síntoma.

### Paso 7: Validar la Refactorización de Fallo Temprano

Ejecutar el conjunto de pruebas para confirmar que las rutas de error funcionan correctamente:

```r
# Verificar que se desencadenan los mensajes de error
testthat::expect_error(calculate_summary("not_a_df"), "must be a data frame")
testthat::expect_error(calculate_summary(data.frame()), "at least one row")
testthat::expect_error(calculate_summary(mtcars, trim_pct = 2), "between 0 and 0.5")

# Verificar que las entradas válidas aún funcionan
testthat::expect_no_error(calculate_summary(mtcars, method = "mean"))
```

```bash
# Ejecutar el conjunto de pruebas completo
Rscript -e "devtools::test()"
```

**Esperado:** Todas las pruebas pasan. Las pruebas de ruta de error confirman que las entradas incorrectas desencadenan el mensaje de error esperado.

**En caso de fallo:** Si las pruebas existentes dependían de fallos silenciosos (p.ej., devolver NULL en entrada incorrecta), actualizarlas para esperar el nuevo error.

## Validación

- [ ] Cada función pública valida sus entradas antes de hacer trabajo
- [ ] Los mensajes de error responden: qué falló, dónde, por qué y cómo solucionarlo
- [ ] `stop()` se usa para condiciones que producen resultados incorrectos
- [ ] `warning()` se usa solo para resultados degradados pero válidos
- [ ] Sin bloques `tryCatch` vacíos que consumen errores silenciosamente
- [ ] Sin `suppressWarnings()` usado como sustituto de la validación adecuada
- [ ] Sin valores por defecto que enmascaran silenciosamente entradas inválidas
- [ ] Los invariantes internos usan `stopifnot()` o aserciones explícitas
- [ ] Existen pruebas de ruta de error para cada guarda de validación
- [ ] El conjunto de pruebas pasa tras la refactorización

## Errores Comunes

- **Validar demasiado profundo**: Validar en los límites de confianza (API pública), no en cada auxiliar interno. La sobre-validación añade ruido y perjudica el rendimiento.
- **Mensajes de error sin contexto**: `"Invalid input"` obliga al llamador a adivinar. Incluir siempre el nombre del parámetro, el tipo/rango esperado y el valor real recibido.
- **Usar warning() cuando se quiere decir stop()**: Si la función devuelve basura después de la advertencia, el llamador obtiene una respuesta incorrecta silenciosamente. Usar `stop()` y dejar que el llamador decida cómo manejarlo.
- **Consumir errores en tryCatch**: `tryCatch(..., error = function(e) NULL)` oculta errores. Si debes capturar, registrar o relanzar con contexto añadido.
- **Olvidar call. = FALSE**: En R, `stop("msg")` incluye la llamada por defecto, lo que es ruidoso para los usuarios finales. Usar `call. = FALSE` en funciones de cara al usuario. `cli::cli_abort()` hace esto automáticamente.
- **Validar en pruebas en lugar de en código**: Las pruebas verifican el comportamiento pero no protegen a los llamadores en producción. La validación pertenece a la función misma.

- **Binario R incorrecto en sistemas híbridos**: En WSL o Docker, `Rscript` puede resolverse a un contenedor multiplataforma en lugar de R nativo. Comprueba con `which Rscript && Rscript --version`. Prefiere el binario R nativo (p. ej., `/usr/local/bin/Rscript` en Linux/WSL) para mayor fiabilidad. Consulta [Setting Up Your Environment](../../guides/setting-up-your-environment.md) para la configuración de la ruta de R.

## Habilidades Relacionadas

- `write-testthat-tests` - escribir pruebas que verifiquen las rutas de error
- `review-pull-request` - revisar código para detectar validación faltante y fallos silenciosos
- `review-software-architecture` - evaluar la estrategia de manejo de errores a nivel de sistema
- `create-skill` - crear nuevas habilidades siguiendo el estándar agentskills.io
- `security-audit-codebase` - revisión orientada a la seguridad que se superpone con la validación de entradas
