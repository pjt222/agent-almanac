---
name: design-compliance-architecture
description: >
  Diseñar una arquitectura de cumplimiento que mapee las regulaciones aplicables
  a los sistemas informatizados. Cubre inventario de sistemas, clasificación de
  criticidad (GxP-crítico, GxP-de soporte, no GxP), asignación de categoría
  GAMP 5, trazabilidad de requisitos regulatorios y definición de la estructura
  de gobernanza. Usar al establecer una nueva instalación regulada, al formalizar
  el cumplimiento en múltiples sistemas, al abordar un análisis de brechas
  regulatorias, al armonizar el cumplimiento tras fusiones o reorganizaciones,
  o al preparar un expediente de sitio que hace referencia a sistemas
  informatizados.
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
  language: multi
  tags: gxp, compliance, architecture, regulatory, gamp-5, governance
---

# Diseñar Arquitectura de Cumplimiento

Establecer el marco de cumplimiento de alto nivel que mapea las regulaciones a los sistemas, clasifica la criticidad y define la gobernanza para un entorno regulado.

## Cuándo Usar

- Se está estableciendo una nueva instalación, departamento o programa regulado
- Una organización existente necesita formalizar su postura de cumplimiento en múltiples sistemas
- Un análisis de brechas regulatorias revela clasificación de sistemas o estrategia de validación faltante
- Fusiones, adquisiciones o reorganizaciones requieren armonizar el cumplimiento entre entidades
- Al preparar un expediente de sitio o manual de calidad que hace referencia a sistemas informatizados

## Entradas

- **Requerido**: Lista de sistemas informatizados en alcance (nombre, propósito, proveedor/personalizado)
- **Requerido**: Marcos regulatorios aplicables (21 CFR Parte 11, EU Anexo 11, GMP, GLP, GCP, ICH Q7, ICH Q10)
- **Requerido**: Contexto organizacional (departamento, sede, tipos de productos)
- **Opcional**: Plan maestro de validación o manual de calidad existente
- **Opcional**: Hallazgos de auditorías anteriores u observaciones de inspecciones regulatorias
- **Opcional**: Organigrama con líneas de reporte de calidad y TI

## Procedimiento

### Paso 1: Construir el Inventario de Sistemas

Crear un inventario completo de todos los sistemas informatizados:

```markdown
# System Inventory
## Document ID: SI-[SITE]-[YYYY]-[NNN]

| ID | System Name | Version | Vendor | Purpose | Department | Data Types | Users |
|----|-------------|---------|--------|---------|------------|------------|-------|
| SYS-001 | LabWare LIMS | 8.1 | LabWare Inc. | Sample management and testing | QC | Test results, COA | 45 |
| SYS-002 | SAP ERP | S/4HANA | SAP SE | Batch release and inventory | Production | Batch records, BOM | 120 |
| SYS-003 | Custom R/Shiny | 2.1.0 | Internal | Statistical analysis | Biostatistics | Clinical data | 8 |
| SYS-004 | Windows Server | 2022 | Microsoft | File server | IT | Documents | 200 |
```

**Esperado:** Cada sistema que crea, modifica, almacena, recupera o transmite datos relevantes para GxP está listado.
**En caso de fallo:** Si los propietarios de sistemas no pueden proporcionar información completa, documentar la brecha y programar un taller de descubrimiento. Los sistemas faltantes son un riesgo crítico de cumplimiento.

### Paso 2: Clasificar la Criticidad del Sistema

Asignar a cada sistema un nivel de criticidad:

```markdown
# System Criticality Classification
## Document ID: SCC-[SITE]-[YYYY]-[NNN]

### Classification Criteria

| Tier | Definition | Validation Required | Examples |
|------|-----------|-------------------|----------|
| **GxP-Critical** | Directly impacts product quality, patient safety, or data integrity. Generates or processes GxP records. | Full CSV per GAMP 5 | LIMS, ERP (batch), CDMS, MES |
| **GxP-Supporting** | Supports GxP processes but does not directly generate GxP records. Failure has indirect impact. | Risk-based qualification | Email, document management, scheduling |
| **Non-GxP** | No impact on product quality, safety, or data integrity. | IT standard controls only | HR systems, cafeteria, general web |

### System Classification Matrix

| System ID | System | Tier | Rationale |
|-----------|--------|------|-----------|
| SYS-001 | LabWare LIMS | GxP-Critical | Generates test results used for batch release |
| SYS-002 | SAP ERP | GxP-Critical | Manages batch records and material traceability |
| SYS-003 | R/Shiny App | GxP-Critical | Performs statistical analysis for regulatory submissions |
| SYS-004 | Windows Server | GxP-Supporting | Stores controlled documents but does not generate GxP data |
```

**Esperado:** Cada sistema tiene una asignación de nivel con fundamento documentado.
**En caso de fallo:** Si la criticidad de un sistema está en disputa, escalar al consejo de calidad. Ante la duda, clasificar un nivel más alto y reevaluar tras una evaluación formal de riesgo.

### Paso 3: Asignar las Categorías de Software GAMP 5

Para cada sistema GxP-Crítico y GxP-de Soporte, asignar la categoría GAMP 5:

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

Referencia de categorías:
- **Categoría 1**: Infraestructura (SO, firmware) — verificar instalación
- **Categoría 3**: COTS no configurado — verificar funcionalidad tal como está
- **Categoría 4**: Producto configurado — verificar todas las configuraciones
- **Categoría 5**: Aplicación personalizada — validación completa del ciclo de vida

**Esperado:** La asignación de categoría se alinea con cómo se usa el sistema, no solo con lo que es.
**En caso de fallo:** Si un sistema abarca categorías (por ejemplo, COTS con complementos personalizados), clasificar las partes personalizadas como Categoría 5 y la base como Categoría 4.

### Paso 4: Mapear los Requisitos Regulatorios a los Sistemas

Crear una matriz de trazabilidad de requisitos regulatorios:

```markdown
# Regulatory Requirements Traceability Matrix
## Document ID: RRTM-[SITE]-[YYYY]-[NNN]

| Regulation | Clause | Requirement | Applicable Systems | Control Type |
|-----------|--------|-------------|-------------------|--------------|
| 21 CFR 11 | 11.10(a) | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| 21 CFR 11 | 11.10(d) | Access controls | SYS-001, SYS-002, SYS-003, SYS-004 | Technical |
| 21 CFR 11 | 11.10(e) | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| 21 CFR 11 | 11.50 | Signature manifestation | SYS-001, SYS-002 | Technical |
| EU Annex 11 | §4 | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| EU Annex 11 | §7 | Data storage and backup | All | Technical |
| EU Annex 11 | §9 | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| EU Annex 11 | §12 | Security and access | All | Technical |
| ICH Q10 | §3.2 | Change management | All GxP-Critical | Procedural |
| ICH Q10 | §1.8 | Knowledge management | SYS-001, SYS-003 | Procedural |
```

**Esperado:** Cada cláusula regulatoria aplicable se mapea a al menos un sistema, y cada sistema GxP-Crítico se mapea a las cláusulas regulatorias relevantes.
**En caso de fallo:** Las cláusulas sin mapear representan brechas de cumplimiento. Crear un plan de remediación con plazos para cada brecha.

### Paso 5: Definir la Estrategia de Validación por Sistema

Basándose en la criticidad, la categoría y el mapeo regulatorio:

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

Abreviaturas: URS (Requisitos de Usuario), RA (Evaluación de Riesgos), VP (Plan de Validación), IQ/OQ/PQ (Calificación de Instalación/Operacional/Desempeño), TM (Matriz de Trazabilidad), VSR (Informe de Resumen de Validación).

**Esperado:** El esfuerzo de validación es proporcional al riesgo — los sistemas GxP-Críticos de Categoría 5 obtienen el ciclo de vida completo; la infraestructura de Categoría 1 obtiene IQ simplificado.
**En caso de fallo:** Si las partes interesadas presionan para reducir la validación de sistemas críticos, documentar la aceptación del riesgo con la firma de Aseguramiento de Calidad.

### Paso 6: Diseñar la Estructura de Gobernanza

Definir el marco organizacional para mantener el cumplimiento:

```markdown
# Compliance Governance Structure

## Roles and Responsibilities
| Role | Responsibility | Authority |
|------|---------------|-----------|
| Quality Director | Overall compliance accountability | Approve validation strategies, accept risks |
| System Owner | Day-to-day system compliance | Approve changes, ensure validated state |
| Validation Lead | Plan and coordinate validation activities | Define validation scope and approach |
| IT Operations | Technical infrastructure and security | Implement technical controls |
| QA Reviewer | Independent review of validation deliverables | Accept or reject validation evidence |

## Governance Committees
| Committee | Frequency | Purpose | Members |
|-----------|-----------|---------|---------|
| Change Control Board | Weekly | Review and approve system changes | System owners, QA, IT, validation |
| Periodic Review Committee | Quarterly | Review system compliance status | Quality director, system owners, QA |
| Audit Programme Committee | Annual | Plan internal audit schedule | Quality director, lead auditor, QA |

## Escalation Matrix
| Issue | First Escalation | Second Escalation | Timeline |
|-------|-----------------|-------------------|----------|
| Critical audit finding | System Owner → QA Director | QA Director → Site Director | 24 hours |
| Validated state breach | Validation Lead → System Owner | System Owner → Quality Director | 48 hours |
| Data integrity incident | System Owner → QA Director | QA Director → Regulatory Affairs | 24 hours |
```

**Esperado:** Responsabilidad clara para cada actividad de cumplimiento sin responsabilidades huérfanas.
**En caso de fallo:** Si los roles se superponen o no están asignados, convocar un taller RACI para resolver. La propiedad ambigua es una cita regulatoria recurrente.

### Paso 7: Compilar el Documento de Arquitectura de Cumplimiento

Reunir todos los componentes en el documento maestro:

```markdown
# Compliance Architecture
## Document ID: CA-[SITE]-[YYYY]-[NNN]
## Version: 1.0

### 1. Purpose and Scope
[Organisation, site, product scope, regulatory scope]

### 2. System Inventory
[From Step 1]

### 3. Criticality Classification
[From Step 2]

### 4. GAMP 5 Category Assignments
[From Step 3]

### 5. Regulatory Requirements Traceability
[From Step 4]

### 6. Validation Strategy
[From Step 5]

### 7. Governance Structure
[From Step 6]

### 8. Periodic Review Schedule
- System inventory refresh: Annual
- Criticality re-assessment: When new systems added or regulations change
- Regulatory mapping update: When new guidance issued
- Governance review: Annual or after organisational change

### 9. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Director | | | |
| IT Director | | | |
| Regulatory Affairs | | | |
```

**Esperado:** Un único documento que sirve como el plano de cumplimiento para todo el entorno regulado.
**En caso de fallo:** Si el documento supera un tamaño práctico, crear un documento maestro con referencias a documentos subsidiarios por sistema o dominio.

## Validación

- [ ] El inventario de sistemas incluye cada sistema que maneja datos GxP
- [ ] Cada sistema tiene un nivel de criticidad con fundamento documentado
- [ ] Categorías GAMP 5 asignadas a todos los sistemas GxP-Críticos y GxP-de Soporte
- [ ] La matriz de trazabilidad de requisitos regulatorios cubre todas las cláusulas aplicables
- [ ] Cada sistema GxP-Crítico tiene una estrategia de validación definida
- [ ] La estructura de gobernanza define roles, comités y rutas de escalación
- [ ] Todos los documentos tienen IDs únicos y control de versiones
- [ ] El documento de arquitectura de cumplimiento está aprobado por el liderazgo de calidad y TI

## Errores Comunes

- **Inventario incompleto**: Los sistemas faltantes son invisibles para el cumplimiento. Usar escaneos de red, herramientas de gestión de activos de software y entrevistas departamentales, no solo preguntar a TI.
- **Pensamiento binario**: Los sistemas no son simplemente "GxP" o "no GxP". El modelo de tres niveles (Crítico, De Soporte, No GxP) evita tanto la sobrevalidación como la subvalidación.
- **Confusión de categorías**: La categoría GAMP 5 describe lo que el software ES, pero el esfuerzo de validación debe reflejar cómo se USA. Un sistema de Categoría 4 usado para la liberación de lotes necesita más pruebas que uno de Categoría 4 usado para programación.
- **Arquitectura estática**: La arquitectura de cumplimiento es un documento vivo. Los nuevos sistemas, los cambios regulatorios y los hallazgos de auditorías requieren actualizaciones.
- **Gobernanza sin efecto real**: Los comités que existen sobre el papel pero nunca se reúnen no aportan valor de cumplimiento. Definir la cadencia de reuniones y los requisitos de quórum.

## Habilidades Relacionadas

- `perform-csv-assessment` — ejecutar la estrategia de validación definida aquí para sistemas individuales
- `manage-change-control` — operacionalizar el proceso de control de cambios definido en la gobernanza
- `implement-electronic-signatures` — implementar los controles de firma electrónica mapeados en la matriz regulatoria
- `prepare-inspection-readiness` — usar esta arquitectura como base para la preparación de inspecciones
- `conduct-gxp-audit` — auditar contra la arquitectura de cumplimiento como línea de base
