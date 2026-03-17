---
name: validate-statistical-output
description: >
  Validar la salida de análisis estadísticos mediante programación doble,
  verificación independiente y comparación de referencias. Cubre metodología
  de comparación, definición de tolerancias y gestión de desviaciones para
  entornos regulados. Usar al validar análisis de endpoints primarios o
  secundarios para envíos regulatorios, al realizar programación doble (R vs
  SAS o implementaciones R independientes), al verificar que el código de
  análisis produce resultados correctos, o al revalidar tras cambios en el
  código o el entorno.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: R
  tags: validation, statistics, double-programming, verification, pharma
---

# Validar Salida Estadística

Verificar los resultados de análisis estadísticos mediante cálculo independiente y comparación sistemática.

## Cuándo Usar

- Al validar análisis de endpoints primarios y secundarios para envíos regulatorios
- Al realizar programación doble (R vs SAS, o implementaciones R independientes)
- Al verificar que el código de análisis produce resultados correctos
- Al revalidar tras cambios en el código o el entorno

## Entradas

- **Requerido**: Código de análisis primario y resultados
- **Requerido**: Resultados de referencia (cálculo independiente, valores publicados o datos de prueba conocidos)
- **Requerido**: Criterios de tolerancia para comparaciones numéricas
- **Opcional**: Contexto del envío regulatorio

## Procedimiento

### Paso 1: Definir el Marco de Comparación

```r
# Define tolerance levels for different statistics
tolerances <- list(
  counts = 0,           # Exact match for integers
  proportions = 1e-4,   # 0.01% for proportions
  means = 1e-6,         # Numeric precision for means
  p_values = 1e-4,      # 4 decimal places for p-values
  confidence_limits = 1e-3  # 3 decimal places for CIs
)
```

**Esperado:** Niveles de tolerancia definidos para cada categoría de estadístico, con tolerancias más estrictas para conteos enteros (coincidencia exacta) y tolerancias más amplias para estadísticos de punto flotante (valores p, intervalos de confianza).

**En caso de fallo:** Si los niveles de tolerancia están en disputa, documentar el fundamento de cada umbral y obtener la aprobación del responsable estadístico antes de proceder. Consultar las guías ICH E9 para envíos regulatorios.

### Paso 2: Crear la Función de Comparación

```r
#' Compare two result sets with tolerance-based matching
#'
#' @param primary Results from the primary analysis
#' @param reference Results from the independent calculation
#' @param tolerances Named list of tolerance values
#' @return Data frame with comparison results
compare_results <- function(primary, reference, tolerances) {
  stopifnot(names(primary) == names(reference))

  comparison <- data.frame(
    statistic = names(primary),
    primary_value = unlist(primary),
    reference_value = unlist(reference),
    stringsAsFactors = FALSE
  )

  comparison$absolute_diff <- abs(comparison$primary_value - comparison$reference_value)
  comparison$tolerance <- sapply(comparison$statistic, function(s) {
    # Match to tolerance category or use default
    tol <- tolerances[[s]]
    if (is.null(tol)) tolerances$means  # default tolerance
    else tol
  })

  comparison$pass <- comparison$absolute_diff <= comparison$tolerance

  comparison
}
```

**Esperado:** `compare_results()` devuelve un data frame con columnas para el nombre del estadístico, valor primario, valor de referencia, diferencia absoluta, tolerancia y estado aprobado/fallido.

**En caso de fallo:** Si la función genera error por nombres no coincidentes, verificar que ambas listas de resultados usan nombres de estadísticos idénticos. Si el mapeo de tolerancias falla, añadir una tolerancia predeterminada para nombres de estadísticos no reconocidos.

### Paso 3: Implementar la Programación Doble

Escribir una implementación independiente que llegue a los mismos resultados mediante código diferente:

```r
# PRIMARY ANALYSIS (in R/primary_analysis.R)
primary_analysis <- function(data) {
  model <- lm(endpoint ~ treatment + baseline + sex, data = data)
  coefs <- summary(model)$coefficients

  list(
    treatment_estimate = coefs["treatmentActive", "Estimate"],
    treatment_se = coefs["treatmentActive", "Std. Error"],
    treatment_p = coefs["treatmentActive", "Pr(>|t|)"],
    n_subjects = nobs(model),
    r_squared = summary(model)$r.squared
  )
}

# INDEPENDENT VERIFICATION (in validation/independent_analysis.R)
# Written by a different analyst or using different methodology
independent_analysis <- function(data) {
  # Using matrix algebra instead of lm()
  X <- model.matrix(~ treatment + baseline + sex, data = data)
  y <- data$endpoint

  beta <- solve(t(X) %*% X) %*% t(X) %*% y
  residuals <- y - X %*% beta
  sigma2 <- sum(residuals^2) / (nrow(X) - ncol(X))
  var_beta <- sigma2 * solve(t(X) %*% X)
  se <- sqrt(diag(var_beta))

  t_stat <- beta["treatmentActive"] / se["treatmentActive"]
  p_value <- 2 * pt(-abs(t_stat), df = nrow(X) - ncol(X))

  list(
    treatment_estimate = as.numeric(beta["treatmentActive"]),
    treatment_se = se["treatmentActive"],
    treatment_p = as.numeric(p_value),
    n_subjects = nrow(data),
    r_squared = 1 - sum(residuals^2) / sum((y - mean(y))^2)
  )
}
```

**Esperado:** Existen dos implementaciones independientes que usan rutas de código diferentes (por ejemplo, `lm()` vs álgebra matricial) para llegar a los mismos resultados estadísticos. Las implementaciones son escritas por analistas diferentes o usan métodos fundamentalmente distintos.

**En caso de fallo:** Si la implementación independiente produce resultados diferentes, primero verificar que ambas usan los mismos datos de entrada (comparar `digest::digest(data)`). Luego verificar si hay diferencias en el manejo de NA, codificación de contrastes o cálculos de grados de libertad.

### Paso 4: Ejecutar la Comparación

```r
# Execute both analyses
primary_results <- primary_analysis(study_data)
independent_results <- independent_analysis(study_data)

# Compare
comparison <- compare_results(primary_results, independent_results, tolerances)

# Report
cat("Validation Comparison Report\n")
cat("============================\n")
cat(sprintf("Date: %s\n", Sys.time()))
cat(sprintf("Overall: %s\n\n",
  ifelse(all(comparison$pass), "ALL PASS", "DISCREPANCIES FOUND")))

print(comparison)
```

**Esperado:** El informe de comparación muestra todos los estadísticos dentro de la tolerancia. La línea `Overall` dice "ALL PASS".

**En caso de fallo:** Si se encuentran discrepancias, no asumir inmediatamente que el análisis primario es incorrecto. Investigar ambas implementaciones: verificar los cálculos intermedios, confirmar datos de entrada idénticos y comparar el manejo de valores faltantes y casos extremos.

### Paso 5: Comparar contra Referencia Externa (SAS)

Al comparar la salida de R contra SAS:

```r
# Load SAS results (exported as CSV or from .sas7bdat)
sas_results <- list(
  treatment_estimate = 1.2345,  # From SAS PROC GLM output
  treatment_se = 0.3456,
  treatment_p = 0.0004,
  n_subjects = 200,
  r_squared = 0.4567
)

comparison <- compare_results(primary_results, sas_results, tolerances)

# Known sources of difference between R and SAS:
# - Default contrasts (R: treatment, SAS: GLM parameterization)
# - Rounding of intermediate calculations
# - Handling of missing values (na.rm vs listwise deletion)
```

**Esperado:** Los resultados de comparación R-vs-SAS están dentro de la tolerancia, con cualquier diferencia sistemática conocida (codificación de contrastes, redondeo) documentada y explicada.

**En caso de fallo:** Si R y SAS producen resultados diferentes más allá de la tolerancia, verificar las tres fuentes más comunes de divergencia: codificación de contrastes predeterminada (R usa contrastes de tratamiento, SAS usa parametrización GLM), manejo de valores faltantes y redondeo de cálculos intermedios. Documentar cada diferencia con su causa raíz.

### Paso 6: Documentar los Resultados

Crear un informe de validación:

```r
# validation/output_comparison_report.R
sink("validation/output_comparison_report.txt")

cat("OUTPUT VALIDATION REPORT\n")
cat("========================\n")
cat(sprintf("Project: %s\n", project_name))
cat(sprintf("Date: %s\n", format(Sys.time())))
cat(sprintf("Primary Analyst: %s\n", primary_analyst))
cat(sprintf("Independent Analyst: %s\n", independent_analyst))
cat(sprintf("R Version: %s\n\n", R.version.string))

cat("COMPARISON RESULTS\n")
cat("------------------\n")
print(comparison, row.names = FALSE)

cat(sprintf("\nOVERALL VERDICT: %s\n",
  ifelse(all(comparison$pass), "VALIDATED", "DISCREPANCIES - INVESTIGATION REQUIRED")))

cat("\nSESSION INFO\n")
print(sessionInfo())

sink()
```

**Esperado:** Un archivo de informe de validación completo existe en `validation/output_comparison_report.txt` que contiene metadatos del proyecto, resultados de comparación, veredicto general e información de la sesión.

**En caso de fallo:** Si `sink()` falla o produce un archivo vacío, verificar que el directorio de salida existe (`dir.create("validation", showWarnings = FALSE)`) y que ninguna llamada previa a `sink()` sigue activa (usar `sink.number()` para verificar).

### Paso 7: Gestionar las Discrepancias

Cuando los resultados no coinciden:

1. Verificar que ambas implementaciones usan los mismos datos de entrada (comparación de hashes)
2. Verificar si hay diferencias en el manejo de NA
3. Comparar los cálculos intermedios paso a paso
4. Documentar la causa raíz
5. Determinar si la diferencia es aceptable (dentro de la tolerancia) o requiere corrección del código

**Esperado:** Todas las discrepancias son investigadas, las causas raíz identificadas y cada una clasificada como aceptable (dentro de la tolerancia con razón documentada) o que requiere corrección del código.

**En caso de fallo:** Si una discrepancia no puede explicarse, escalar al responsable estadístico. No ignorar las diferencias inexplicables, ya que pueden indicar un error genuino en una de las implementaciones.

## Validación

- [ ] El análisis independiente produce resultados dentro de la tolerancia
- [ ] Todos los estadísticos de comparación están documentados
- [ ] Las discrepancias (si las hay) están investigadas y resueltas
- [ ] La integridad de los datos de entrada está verificada (coincidencia de hashes)
- [ ] Los criterios de tolerancia están preespecificados y justificados
- [ ] El informe de validación está completo y firmado

## Errores Comunes

- **El mismo analista escribe ambas implementaciones**: La programación doble requiere analistas independientes para una verdadera validación
- **Compartir código entre implementaciones**: La versión independiente no debe copiar del análisis primario
- **Tolerancia inapropiada**: Demasiado laxa oculta errores reales; demasiado estricta marca ruido de punto flotante
- **Ignorar las diferencias sistemáticas**: Pequeños sesgos consistentes pueden indicar un error real incluso dentro de la tolerancia
- **No validar la validación**: Verificar que el código de comparación en sí funciona correctamente con entradas conocidas

## Habilidades Relacionadas

- `setup-gxp-r-project` — estructura del proyecto para trabajo validado
- `write-validation-documentation` — plantillas de protocolos e informes
- `implement-audit-trail` — seguimiento del proceso de validación en sí
- `write-testthat-tests` — conjuntos de pruebas automatizadas para validación continua
