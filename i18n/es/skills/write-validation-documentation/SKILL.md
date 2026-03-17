---
name: write-validation-documentation
description: >
  Redactar documentación de validación IQ/OQ/PQ para sistemas informatizados
  en entornos regulados. Cubre protocolos, informes, scripts de prueba,
  gestión de desviaciones y flujos de trabajo de aprobación. Usar al validar
  R u otro software para uso regulado, al prepararse para una auditoría
  regulatoria, al documentar la calificación de entornos informáticos, o al
  crear y actualizar protocolos e informes de validación para sistemas nuevos
  o recalificados.
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
  tags: validation, iq-oq-pq, documentation, gxp, qualification
---

# Redactar Documentación de Validación

Crear documentación completa de validación IQ/OQ/PQ para sistemas informatizados.

## Cuándo Usar

- Al validar R u otro software para uso regulado
- Al prepararse para una auditoría regulatoria
- Al documentar la calificación de entornos informáticos
- Al crear o actualizar protocolos e informes de validación

## Entradas

- **Requerido**: Sistema/software a validar (nombre, versión, propósito)
- **Requerido**: Plan de validación que define el alcance y la estrategia
- **Requerido**: Especificación de requisitos de usuario
- **Opcional**: Plantillas de SOP existentes
- **Opcional**: Documentación de validación previa (para recalificación)

## Procedimiento

### Paso 1: Redactar el Protocolo de Calificación de la Instalación (IQ)

```markdown
# Installation Qualification Protocol
**System**: R Statistical Computing Environment
**Version**: 4.5.0
**Document ID**: IQ-PROJ-001
**Prepared by**: [Name] | **Date**: [Date]
**Reviewed by**: [Name] | **Date**: [Date]
**Approved by**: [Name] | **Date**: [Date]

## 1. Objective
Verify that R and required packages are correctly installed per specifications.

## 2. Prerequisites
- [ ] Server/workstation meets hardware requirements
- [ ] Operating system qualified
- [ ] Network access available (for package downloads)

## 3. Test Cases

### IQ-001: R Installation
| Field | Value |
|-------|-------|
| Requirement | R version 4.5.0 correctly installed |
| Procedure | Open R console, execute `R.version.string` |
| Expected Result | "R version 4.5.0 (2025-04-11)" |
| Actual Result | ______________________ |
| Pass/Fail | [ ] |
| Executed by | ____________ Date: ________ |

### IQ-002: Package Inventory
| Package | Required Version | Installed Version | Pass/Fail |
|---------|-----------------|-------------------|-----------|
| dplyr | 1.1.4 | | [ ] |
| ggplot2 | 3.5.0 | | [ ] |
| survival | 3.7-0 | | [ ] |

## 4. Deviations
[Document any deviations from expected results and their resolution]

## 5. Conclusion
[ ] All IQ tests PASSED - system installation verified
[ ] IQ tests FAILED - see deviation section
```

**Esperado:** `validation/iq/iq_protocol.md` está completo con un ID de documento único, objetivo, lista de verificación de prerrequisitos, casos de prueba para la instalación de R y cada paquete requerido, sección de desviaciones y campos de aprobación.

**En caso de fallo:** Si la organización requiere un formato de documento diferente, adaptar la plantilla para que coincida con el SOP existente. Los campos clave (requisito, procedimiento, resultado esperado, resultado real, aprobado/fallido) deben conservarse independientemente del formato.

### Paso 2: Redactar el Protocolo de Calificación Operacional (OQ)

```markdown
# Operational Qualification Protocol
**Document ID**: OQ-PROJ-001

## 1. Objective
Verify that the system operates correctly under normal conditions.

## 2. Test Cases

### OQ-001: Data Import Functionality
| Field | Value |
|-------|-------|
| Requirement | System correctly imports CSV files |
| Test Data | validation/test_data/import_test.csv (MD5: abc123) |
| Procedure | Execute `read.csv("import_test.csv")` |
| Expected | Data frame with 100 rows, 5 columns |
| Actual Result | ______________________ |
| Evidence | Screenshot/log file reference |

### OQ-002: Statistical Calculations
| Field | Value |
|-------|-------|
| Requirement | t-test produces correct results |
| Test Data | Known dataset: x = c(2.1, 2.5, 2.3), y = c(3.1, 3.5, 3.3) |
| Procedure | Execute `t.test(x, y)` |
| Expected | t = -5.000, df = 4, p = 0.00753 |
| Actual Result | ______________________ |
| Tolerance | ±0.001 |

### OQ-003: Error Handling
| Field | Value |
|-------|-------|
| Requirement | System handles invalid input gracefully |
| Procedure | Execute `analysis_function(invalid_input)` |
| Expected | Informative error message, no crash |
| Actual Result | ______________________ |
```

**Esperado:** `validation/oq/oq_protocol.md` contiene casos de prueba para importación de datos, cálculos estadísticos y manejo de errores, cada uno con datos de prueba específicos, resultados esperados (con tolerancias donde aplique) y requisitos de evidencia.

**En caso de fallo:** Si los datos de prueba aún no están disponibles, crear conjuntos de datos de prueba sintéticos con propiedades conocidas. Documentar el método de generación de datos para que los resultados puedan verificarse de forma independiente.

### Paso 3: Redactar el Protocolo de Calificación del Desempeño (PQ)

```markdown
# Performance Qualification Protocol
**Document ID**: PQ-PROJ-001

## 1. Objective
Verify the system performs as intended with real-world data and workflows.

## 2. Test Cases

### PQ-001: End-to-End Primary Analysis
| Field | Value |
|-------|-------|
| Requirement | Primary endpoint analysis matches reference |
| Test Data | Blinded test dataset (hash: sha256:abc...) |
| Reference | Independent SAS calculation (report ref: SAS-001) |
| Procedure | Execute full analysis pipeline |
| Expected | Estimate within ±0.001 of reference |
| Actual Result | ______________________ |

### PQ-002: Report Generation
| Field | Value |
|-------|-------|
| Requirement | Generated report contains all required sections |
| Procedure | Execute report generation script |
| Checklist | |
| | [ ] Title page with study information |
| | [ ] Table of contents |
| | [ ] Demographic summary table |
| | [ ] Primary analysis results |
| | [ ] Appendix with session info |
```

**Esperado:** `validation/pq/pq_protocol.md` contiene casos de prueba de extremo a extremo usando datos del mundo real (o representativos), con resultados comparados contra un cálculo de referencia independiente (por ejemplo, salida SAS). Las tolerancias están definidas explícitamente.

**En caso de fallo:** Si los resultados de referencia independientes no están disponibles, documentar la brecha y usar programación dual (dos implementaciones R independientes) como método de verificación alternativo. Marcar la PQ como provisional hasta que la verificación independiente esté completa.

### Paso 4: Redactar los Informes de Calificación

Después de ejecutar los protocolos, documentar los resultados:

```markdown
# Installation Qualification Report
**Document ID**: IQ-RPT-001
**Protocol Reference**: IQ-PROJ-001

## 1. Summary
All IQ test cases were executed on [date] by [name].

## 2. Results Summary
| Test ID | Description | Result |
|---------|-------------|--------|
| IQ-001 | R Installation | PASS |
| IQ-002 | Package Inventory | PASS |

## 3. Deviations
None observed.

## 4. Conclusion
The installation of R 4.5.0 and associated packages has been verified
and meets all specified requirements.

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Executor | | | |
| Reviewer | | | |
| Approver | | | |
```

**Esperado:** Los informes de calificación (IQ, OQ, PQ) están completos con todos los resultados de prueba documentados, desviaciones documentadas (o "No se observaron"), conclusiones declaradas y campos de firma de aprobación listos para firmar.

**En caso de fallo:** Si se produjeron fallos durante la ejecución, documentar cada fallo como una desviación con análisis de causa raíz y resolución. No dejar las secciones de desviaciones en blanco cuando se observaron fallos.

### Paso 5: Automatizar Donde Sea Posible

Crear scripts de prueba automatizados que generen evidencia:

```r
# validation/scripts/run_iq.R
sink("validation/iq/iq_evidence.txt")
cat("IQ Execution Date:", format(Sys.time()), "\n\n")

cat("IQ-001: R Version\n")
cat("Result:", R.version.string, "\n")
cat("Status:", ifelse(R.version$major == "4" && R.version$minor == "5.0",
                      "PASS", "FAIL"), "\n\n")

cat("IQ-002: Package Versions\n")
required <- renv::dependencies()
installed <- installed.packages()
# ... comparison logic
sink()
```

**Esperado:** Los scripts automatizados en `validation/scripts/` generan archivos de evidencia (por ejemplo, `iq_evidence.txt`) con resultados con marca de tiempo para cada caso de prueba, reduciendo la entrada manual de datos y asegurando la reproducibilidad.

**En caso de fallo:** Si los scripts automatizados fallan debido a diferencias en el entorno, ejecutarlos manualmente y capturar la salida con `sink()`. Documentar cualquier diferencia entre la ejecución automatizada y la manual en el informe de calificación.

## Validación

- [ ] Todos los protocolos tienen IDs de documento únicos
- [ ] Los protocolos hacen referencia al plan de validación
- [ ] Los casos de prueba tienen criterios claros de aprobado/fallido
- [ ] Los informes incluyen todos los resultados de prueba ejecutados
- [ ] Las desviaciones están documentadas con resoluciones
- [ ] Se obtienen las firmas de aprobación
- [ ] Los documentos siguen las plantillas de SOP de la organización

## Errores Comunes

- **Criterios de aceptación vagos**: "El sistema funciona correctamente" no es verificable. Especificar valores esperados exactos.
- **Evidencia faltante**: Cada resultado de prueba necesita evidencia de respaldo (capturas de pantalla, registros, archivos de salida)
- **Manejo incompleto de desviaciones**: Todos los fallos deben documentarse, investigarse y resolverse
- **Sin control de versiones para documentos**: Los documentos de validación necesitan control de cambios al igual que el código
- **Omitir la recalificación**: Las actualizaciones del sistema (versión de R, actualizaciones de paquetes) requieren una evaluación de recalificación

## Habilidades Relacionadas

- `setup-gxp-r-project` — estructura del proyecto para entornos validados
- `implement-audit-trail` — seguimiento de registros electrónicos
- `validate-statistical-output` — metodología de validación de salidas
