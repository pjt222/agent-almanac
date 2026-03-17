---
name: setup-gxp-r-project
description: >
  Configurar una estructura de proyecto R conforme a las regulaciones GxP
  (21 CFR Parte 11, EU Anexo 11). Cubre entornos validados, documentación
  de calificación, control de cambios y requisitos de registros electrónicos.
  Usar al iniciar un proyecto de análisis R en un entorno regulado (farma,
  biotecnología, dispositivos médicos), al configurar R para análisis de
  ensayos clínicos, al crear un entorno informático validado para envíos
  regulatorios, o al implementar los requisitos de 21 CFR Parte 11 o EU Anexo 11.
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
  tags: gxp, validation, regulatory, pharma, 21-cfr-part-11
---

# Configurar Proyecto R para GxP

Crear una estructura de proyecto R que cumpla los requisitos regulatorios GxP para computación validada.

## Cuándo Usar

- Al iniciar un proyecto de análisis R en un entorno regulado (farma, biotecnología, dispositivos médicos)
- Al configurar R para uso en análisis de ensayos clínicos
- Al crear un entorno informático validado para envíos regulatorios
- Al implementar los requisitos de 21 CFR Parte 11 o EU Anexo 11

## Entradas

- **Requerido**: Alcance del proyecto y marco regulatorio (FDA, EMA, o ambos)
- **Requerido**: Versión de R y versiones de paquetes a validar
- **Requerido**: Estrategia de validación (enfoque basado en riesgo)
- **Opcional**: SOPs existentes para sistemas informatizados
- **Opcional**: Requisitos de integración con el sistema de gestión de calidad

## Procedimiento

### Paso 1: Crear la Estructura Validada del Proyecto

```
gxp-project/
├── R/                          # Analysis scripts
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/                 # Validation documentation
│   ├── validation_plan.md      # VP: scope, strategy, roles
│   ├── risk_assessment.md      # Risk categorization
│   ├── iq/                     # Installation Qualification
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/                     # Operational Qualification
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/                     # Performance Qualification
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md  # Requirements to tests mapping
├── tests/                      # Automated test suite
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/                       # Input data (controlled)
│   ├── raw/                    # Immutable raw data
│   └── derived/                # Processed datasets
├── output/                     # Analysis outputs
├── docs/                       # Supporting documentation
│   ├── sop_references.md       # Links to relevant SOPs
│   └── change_log.md           # Manual change documentation
├── renv.lock                   # Locked dependencies
├── DESCRIPTION                 # Project metadata
├── .Rprofile                   # Session configuration
└── CLAUDE.md                   # AI assistant instructions
```

**Esperado:** La estructura completa de directorios existe con `R/`, `validation/` (incluyendo subdirectorios `iq/`, `oq/`, `pq/`), `tests/testthat/`, `data/raw/`, `data/derived/`, `output/` y `docs/`.

**En caso de fallo:** Si faltan directorios, créalos con `mkdir -p`. Verifica que estás en la raíz correcta del proyecto. Para proyectos existentes, crea únicamente los directorios faltantes en lugar de sobreescribir la estructura existente.

### Paso 2: Crear el Plan de Validación

Crear `validation/validation_plan.md`:

```markdown
# Validation Plan

## 1. Purpose
This plan defines the validation strategy for [Project Name] using R [version].

## 2. Scope
- R version: 4.5.0
- Packages: [list with versions]
- Analysis: [description]
- Regulatory framework: 21 CFR Part 11 / EU Annex 11

## 3. Risk Assessment Approach
Using GAMP 5 risk-based categories:
- Category 3: Non-configured products (R base)
- Category 4: Configured products (R packages with default settings)
- Category 5: Custom applications (custom R scripts)

## 4. Validation Activities
| Activity | Category 3 | Category 4 | Category 5 |
|----------|-----------|-----------|-----------|
| IQ | Required | Required | Required |
| OQ | Reduced | Standard | Enhanced |
| PQ | N/A | Standard | Enhanced |

## 5. Roles and Responsibilities
- Validation Lead: [Name]
- Developer: [Name]
- QA Reviewer: [Name]
- Approver: [Name]

## 6. Acceptance Criteria
All tests must pass with documented evidence.
```

**Esperado:** `validation/validation_plan.md` está completo con alcance, categorías de riesgo GAMP 5, matriz de actividades de validación, roles y responsabilidades, y criterios de aceptación. El plan hace referencia a la versión específica de R y al marco regulatorio.

**En caso de fallo:** Si el marco regulatorio no está claro, consultar al departamento de Aseguramiento de Calidad para los SOPs aplicables. No proceder con las actividades de validación hasta que el plan sea revisado y aprobado.

### Paso 3: Bloquear Dependencias con renv

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

El archivo `renv.lock` sirve como inventario controlado de paquetes.

**Esperado:** `renv.lock` existe con números de versión exactos para todos los paquetes requeridos. `renv::status()` no reporta problemas. Cada versión de paquete está fijada (por ejemplo, `dplyr@1.1.4`), no flotante.

**En caso de fallo:** Si `renv::install()` falla para una versión específica, verificar que la versión existe en los archivos de CRAN. Usar `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` para versiones archivadas.

### Paso 4: Implementar Control de Versiones

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**Esperado:** El proyecto está bajo control de versiones git con commits firmados habilitados. El commit inicial contiene la estructura validada del proyecto y `renv.lock`.

**En caso de fallo:** Si la firma GPG falla, verificar que la clave GPG está configurada con `gpg --list-secret-keys`. Para entornos sin GPG, documentar la desviación y usar commits sin firmar con entradas manuales de registro de auditoría en `docs/change_log.md`.

### Paso 5: Crear el Protocolo IQ

`validation/iq/iq_protocol.md`:

```markdown
# Installation Qualification Protocol

## Objective
Verify that R and required packages are correctly installed.

## Test Cases

### IQ-001: R Version Verification
- **Requirement**: R 4.5.0 installed
- **Procedure**: Execute `R.version.string`
- **Expected:** "R version 4.5.0 (date)"
- **Result**: [ PASS / FAIL ]

### IQ-002: Package Installation Verification
- **Requirement**: All packages in renv.lock installed
- **Procedure**: Execute `renv::status()`
- **Expected:** "No issues found"
- **Result**: [ PASS / FAIL ]

### IQ-003: Package Version Verification
- **Procedure**: Execute `installed.packages()[, c("Package", "Version")]`
- **Expected:** Versions match renv.lock exactly
- **Result**: [ PASS / FAIL ]
```

**Esperado:** `validation/iq/iq_protocol.md` contiene casos de prueba para verificación de la versión de R, verificación de la instalación de paquetes y verificación de la versión de paquetes, cada uno con resultados esperados claros y campos de aprobado/fallido.

**En caso de fallo:** Si la plantilla del protocolo IQ no cumple los requisitos del SOP organizacional, adaptar el formato conservando los campos requeridos (requisito, procedimiento, resultado esperado, resultado real, aprobado/fallido). Consultar a Aseguramiento de Calidad para las plantillas aprobadas.

### Paso 6: Escribir Pruebas Automatizadas OQ/PQ

```r
# tests/testthat/test-analysis.R
test_that("primary analysis produces validated results", {
  # Known input -> known output (double programming validation)
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  # Compare against independently calculated expected values
  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

**Esperado:** Los archivos de prueba automatizados existen en `tests/testthat/` cubriendo OQ (verificación operacional de cada función) y PQ (validación de extremo a extremo contra valores de referencia calculados de forma independiente). Las pruebas usan tolerancias numéricas explícitas.

**En caso de fallo:** Si los valores de referencia aún no están disponibles por cálculo independiente (por ejemplo, SAS), crear pruebas de marcador con `skip("Awaiting independent reference values")` y documentar en la matriz de trazabilidad.

### Paso 7: Crear la Matriz de Trazabilidad

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**Esperado:** `validation/traceability_matrix.md` vincula cada requisito con al menos un caso de prueba, y cada caso de prueba está vinculado a un requisito. Sin requisitos o pruebas huérfanos.

**En caso de fallo:** Si los requisitos no están probados, crear casos de prueba para ellos o documentar una justificación basada en riesgo para su exclusión. Si las pruebas no tienen un requisito vinculado, vincularlas a un requisito existente o eliminarlas por estar fuera del alcance.

## Validación

- [ ] La estructura del proyecto sigue la plantilla documentada
- [ ] renv.lock contiene todas las dependencias con versiones exactas
- [ ] El plan de validación está completo y aprobado
- [ ] El protocolo IQ se ejecuta correctamente
- [ ] Los casos de prueba OQ cubren toda la funcionalidad configurada
- [ ] Las pruebas PQ validan contra resultados calculados de forma independiente
- [ ] La matriz de trazabilidad vincula requisitos con pruebas
- [ ] El proceso de control de cambios está documentado

## Errores Comunes

- **Usar `install.packages()` sin fijar versión**: Usar siempre renv con versiones bloqueadas
- **Registro de auditoría faltante**: Cada cambio debe estar documentado. Usar commits git firmados.
- **Sobrevalidación**: Aplicar el enfoque basado en riesgo. No todos los paquetes CRAN necesitan validación de Categoría 5.
- **Olvidar la calificación a nivel del sistema**: El sistema operativo y la instalación de R también necesitan IQ
- **Sin verificación independiente**: La PQ debe comparar contra resultados calculados de forma independiente (SAS, cálculo manual)

## Habilidades Relacionadas

- `write-validation-documentation` — creación detallada de documentación de validación
- `implement-audit-trail` — registros electrónicos y registros de auditoría
- `validate-statistical-output` — programación doble y validación de salidas
- `manage-renv-dependencies` — bloqueo de dependencias para entornos validados
