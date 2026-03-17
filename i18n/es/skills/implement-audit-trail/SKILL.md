---
name: implement-audit-trail
description: >
  Implementar funcionalidad de registro de auditoría para proyectos R en
  entornos regulados. Cubre registro de eventos, seguimiento de procedencia,
  firmas electrónicas, verificaciones de integridad de datos y cumplimiento
  de 21 CFR Parte 11. Usar cuando un análisis R requiere cumplimiento de
  registros electrónicos (21 CFR Parte 11), cuando se necesita rastrear quién
  hizo qué y cuándo en un análisis, al implementar seguimiento de procedencia
  de datos, o al crear registros de análisis a prueba de manipulaciones para
  envíos regulatorios.
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
  tags: audit-trail, logging, provenance, 21-cfr-part-11, data-integrity
---

# Implementar Registro de Auditoría

Añadir capacidades de registro de auditoría a proyectos R para el cumplimiento normativo.

## Cuándo Usar

- Un análisis R requiere cumplimiento de registros electrónicos (21 CFR Parte 11)
- Se necesita rastrear quién hizo qué, cuándo y por qué en un análisis
- Al implementar seguimiento de procedencia de datos
- Al crear registros de análisis a prueba de manipulaciones

## Entradas

- **Requerido**: Proyecto R con scripts de procesamiento de datos o análisis
- **Requerido**: Requisitos regulatorios (qué elementos del registro de auditoría son obligatorios)
- **Opcional**: Infraestructura de registro existente
- **Opcional**: Requisitos de firma electrónica

## Procedimiento

### Paso 1: Configurar el Registro Estructurado

Crear `R/audit_log.R`:

```r
#' Initialize audit log for a session
#'
#' @param log_dir Directory for audit log files
#' @param analyst Name of the analyst
#' @return Path to the created log file
init_audit_log <- function(log_dir = "audit_logs", analyst = Sys.info()["user"]) {
  dir.create(log_dir, showWarnings = FALSE, recursive = TRUE)

  log_file <- file.path(log_dir, sprintf(
    "audit_%s_%s.jsonl",
    format(Sys.time(), "%Y%m%d_%H%M%S"),
    analyst
  ))

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = "SESSION_START",
    analyst = analyst,
    r_version = R.version.string,
    platform = .Platform$OS.type,
    working_directory = getwd(),
    session_id = paste0(Sys.getpid(), "-", format(Sys.time(), "%Y%m%d%H%M%S"))
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
  options(audit_log_file = log_file, audit_session_id = entry$session_id)

  log_file
}

#' Log an audit event
#'
#' @param event Event type (DATA_IMPORT, TRANSFORM, ANALYSIS, EXPORT, etc.)
#' @param description Human-readable description
#' @param details Named list of additional details
log_audit_event <- function(event, description, details = list()) {
  log_file <- getOption("audit_log_file")
  if (is.null(log_file)) stop("Audit log not initialized. Call init_audit_log() first.")

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = event,
    description = description,
    session_id = getOption("audit_session_id"),
    details = details
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
}
```

**Esperado:** `R/audit_log.R` creado con las funciones `init_audit_log()` y `log_audit_event()`. Al llamar a `init_audit_log()` se crea el directorio `audit_logs/` y un archivo JSONL con marca de tiempo. Cada entrada del registro es una línea JSON única con los campos `timestamp`, `event`, `analyst` y `session_id`.

**En caso de fallo:** Si `jsonlite::toJSON()` falla, asegurarse de que el paquete `jsonlite` esté instalado. Si no se puede crear el directorio del registro, verificar los permisos del sistema de archivos. Si las marcas de tiempo carecen de zona horaria, verificar que `%z` sea compatible con la plataforma.

### Paso 2: Añadir Verificaciones de Integridad de Datos

```r
#' Compute and log data hash for integrity verification
#'
#' @param data Data frame to hash
#' @param label Descriptive label for the dataset
#' @return SHA-256 hash string
hash_data <- function(data, label = "dataset") {
  hash_value <- digest::digest(data, algo = "sha256")

  log_audit_event("DATA_HASH", sprintf("Hash computed for %s", label), list(
    hash_algorithm = "sha256",
    hash_value = hash_value,
    nrow = nrow(data),
    ncol = ncol(data),
    columns = names(data)
  ))

  hash_value
}

#' Verify data integrity against a recorded hash
#'
#' @param data Data frame to verify
#' @param expected_hash Previously recorded hash
#' @return Logical indicating whether data matches
verify_data_integrity <- function(data, expected_hash) {
  current_hash <- digest::digest(data, algo = "sha256")
  match <- identical(current_hash, expected_hash)

  log_audit_event("DATA_VERIFY",
    sprintf("Data integrity check: %s", ifelse(match, "PASS", "FAIL")),
    list(expected = expected_hash, actual = current_hash))

  if (!match) warning("Data integrity check FAILED")
  match
}
```

**Esperado:** `hash_data()` devuelve una cadena hash SHA-256 y registra un evento `DATA_HASH`. `verify_data_integrity()` compara los datos actuales con un hash almacenado y registra un evento `DATA_VERIFY` con estado PASS o FAIL.

**En caso de fallo:** Si `digest::digest()` no se encuentra, instalar el paquete `digest`. Si los hashes no coinciden para datos idénticos, verificar que el orden de columnas y los tipos de datos sean consistentes entre el hash y la verificación.

### Paso 3: Rastrear Transformaciones de Datos

```r
#' Wrap a data transformation with audit logging
#'
#' @param data Input data frame
#' @param transform_fn Function to apply
#' @param description Description of the transformation
#' @return Transformed data frame
audited_transform <- function(data, transform_fn, description) {
  input_hash <- digest::digest(data, algo = "sha256")
  input_dim <- dim(data)

  result <- transform_fn(data)

  output_hash <- digest::digest(result, algo = "sha256")
  output_dim <- dim(result)

  log_audit_event("DATA_TRANSFORM", description, list(
    input_hash = input_hash,
    input_rows = input_dim[1],
    input_cols = input_dim[2],
    output_hash = output_hash,
    output_rows = output_dim[1],
    output_cols = output_dim[2]
  ))

  result
}
```

**Esperado:** `audited_transform()` envuelve cualquier función de transformación, registrando las dimensiones y el hash de entrada, las dimensiones y el hash de salida, y la descripción de la transformación como un evento `DATA_TRANSFORM`.

**En caso de fallo:** Si la función de transformación genera un error, el evento de auditoría no se registra. Envolver la transformación en `tryCatch()` para registrar tanto los éxitos como los fallos. Asegurarse de que la función de transformación acepte y devuelva un data frame.

### Paso 4: Registrar el Entorno de la Sesión

```r
#' Log complete session information for reproducibility
log_session_info <- function() {
  si <- sessionInfo()

  log_audit_event("SESSION_INFO", "Complete session environment recorded", list(
    r_version = si$R.version$version.string,
    platform = si$platform,
    locale = Sys.getlocale(),
    base_packages = si$basePkgs,
    attached_packages = sapply(si$otherPkgs, function(p) paste(p$Package, p$Version)),
    renv_lockfile_hash = if (file.exists("renv.lock")) {
      digest::digest(file = "renv.lock", algo = "sha256")
    } else NA
  ))
}
```

**Esperado:** Un evento `SESSION_INFO` registrado con versión de R, plataforma, configuración regional, paquetes adjuntos con versiones y el hash del archivo de bloqueo renv (si aplica).

**En caso de fallo:** Si `sessionInfo()` devuelve información incompleta de paquetes, asegurarse de que todos los paquetes estén cargados mediante `library()` antes de llamar a `log_session_info()`. El hash del archivo de bloqueo renv será `NA` si el proyecto no usa renv.

### Paso 5: Implementar en Scripts de Análisis

```r
# 01_analysis.R
library(jsonlite)
library(digest)

# Start audit trail
log_file <- init_audit_log(analyst = "Philipp Thoss")

# Import data with audit
raw_data <- read.csv("data/raw/study_data.csv")
raw_hash <- hash_data(raw_data, "raw study data")

# Transform with audit
clean_data <- audited_transform(raw_data, function(d) {
  d |>
    dplyr::filter(!is.na(primary_endpoint)) |>
    dplyr::mutate(bmi = weight / (height/100)^2)
}, "Remove missing endpoints, calculate BMI")

# Run analysis
log_audit_event("ANALYSIS_START", "Primary efficacy analysis")
model <- lm(primary_endpoint ~ treatment + age + sex, data = clean_data)
log_audit_event("ANALYSIS_COMPLETE", "Primary efficacy analysis", list(
  model_class = class(model),
  formula = deparse(formula(model)),
  n_observations = nobs(model)
))

# Log session
log_session_info()
```

**Esperado:** Los scripts de análisis inicializan el registro de auditoría al inicio, registran cada importación de datos, transformación y paso de análisis, y registran la información de la sesión al final. El archivo de registro JSONL captura la cadena completa de procedencia.

**En caso de fallo:** Si falta `init_audit_log()`, asegurarse de que `R/audit_log.R` esté incluido o que el paquete esté cargado. Si faltan eventos en el registro, verificar que `log_audit_event()` se llame después de cada operación significativa.

### Paso 6: Control de Cambios Basado en Git

Complementar el registro de auditoría a nivel de aplicación con git:

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**Esperado:** Los commits de git están firmados (GPG) y usan mensajes descriptivos que hacen referencia a los IDs de control de cambios. La combinación del registro de auditoría JSONL a nivel de aplicación y el historial de git proporciona un registro completo de control de cambios.

**En caso de fallo:** Si la firma GPG falla, configurar la clave de firma con `git config --global user.signingkey KEY_ID`. Si la clave no está configurada, seguir `gpg --gen-key` para crear una.

## Validación

- [ ] El registro de auditoría captura todos los eventos requeridos (inicio, acceso a datos, transformaciones, análisis, exportación)
- [ ] Las marcas de tiempo usan el formato ISO 8601 con zona horaria
- [ ] Los hashes de datos permiten la verificación de integridad
- [ ] La información de la sesión está registrada
- [ ] Los registros son solo de adición (sin eliminación ni modificación)
- [ ] La identidad del analista se captura para cada sesión
- [ ] El formato del registro es legible por máquina (JSONL)

## Errores Comunes

- **Registrar demasiado**: Enfocarse en los eventos regulados. No registrar cada asignación de variable.
- **Registros mutables**: Los registros de auditoría deben ser solo de adición. Usar JSONL (un objeto JSON por línea).
- **Marcas de tiempo faltantes**: Cada evento necesita una marca de tiempo con zona horaria.
- **Sin contexto de sesión**: Cada entrada del registro debe hacer referencia a la sesión para su correlación.
- **Olvidar inicializar**: Los scripts deben llamar a `init_audit_log()` antes de cualquier análisis.

## Habilidades Relacionadas

- `setup-gxp-r-project` — estructura del proyecto para entornos validados
- `write-validation-documentation` — protocolos e informes de validación
- `validate-statistical-output` — metodología de verificación de salidas
- `configure-git-repository` — control de versiones como parte del control de cambios
