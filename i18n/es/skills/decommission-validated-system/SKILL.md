---
name: decommission-validated-system
description: >
  Dar de baja un sistema informatizado validado al final de su vida útil.
  Cubre la evaluación de la retención de datos según la regulación, la
  validación de la migración de datos (mapeo, transformación, conciliación),
  la estrategia de archivado, la revocación de acceso, el archivado de
  documentación y la notificación a las partes interesadas. Usar cuando un
  sistema validado está siendo reemplazado, cuando alcanza su fin de vida
  útil sin reemplazo, cuando el soporte del proveedor es discontinuado,
  cuando múltiples sistemas se consolidan, o cuando los cambios regulatorios
  hacen obsoleto un sistema.
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
  complexity: intermediate
  language: multi
  tags: gxp, decommission, data-retention, migration, archival, compliance
---

# Dar de Baja un Sistema Validado

Planificar y ejecutar el retiro controlado de un sistema informatizado validado preservando la integridad de los datos y cumpliendo los requisitos regulatorios de retención.

## Cuándo Usar

- Un sistema validado está siendo reemplazado por un nuevo sistema
- Un sistema alcanza su fin de vida útil sin reemplazo (proceso de negocio eliminado)
- El proveedor discontinúa el soporte de un producto validado
- Consolidación de múltiples sistemas en una única plataforma
- Los cambios regulatorios o de negocio hacen obsoleto un sistema

## Entradas

- **Requerido**: Sistema a dar de baja (nombre, versión, estado de validación)
- **Requerido**: Requisitos de retención de datos según la regulación (21 CFR Parte 11, GLP, GCP)
- **Requerido**: Sistema de reemplazo (si aplica) y alcance de la migración
- **Opcional**: Paquete actual de documentación de validación
- **Opcional**: Inventario de volumen y formato de datos
- **Opcional**: Propietario del negocio y lista de partes interesadas

## Procedimiento

### Paso 1: Evaluar los Requisitos de Retención de Datos

Determinar cuánto tiempo deben retenerse los datos y en qué forma:

```markdown
# Data Retention Assessment
## Document ID: DRA-[SYS]-[YYYY]-[NNN]

### Regulatory Retention Requirements
| Regulation | Data Type | Retention Period | Format Requirements |
|-----------|-----------|-----------------|-------------------|
| 21 CFR 211 (GMP) | Batch records, test results | 1 year past product expiry or 3 years after distribution | Readable, retrievable |
| 21 CFR 58 (GLP) | Study data and records | Duration of study + retention agreement | Original or certified copy |
| ICH E6 (GCP) | Clinical trial records | 2 years after last marketing approval or formal discontinuation | Accessible for inspection |
| 21 CFR Part 11 | Electronic records | Per predicate rule | Original format or validated migration |
| EU Annex 11 | Computerized system records | Per applicable GxP | Readable and available |
| Tax/financial | Financial records | 7-10 years (jurisdiction-dependent) | Readable |

### System Data Inventory
| Data Category | Volume | Format | Retention Required Until | Disposition |
|---------------|--------|--------|------------------------|-------------|
| [e.g., Batch records] | [e.g., 50,000 records] | [e.g., Database + PDF reports] | [Date] | Migrate / Archive / Destroy |
| [e.g., Audit trail] | [e.g., 2M entries] | [e.g., Database] | [Same as parent records] | Archive |
| [e.g., User data] | [e.g., 200 profiles] | [e.g., LDAP/Database] | [Employment + 2 years] | Anonymise and archive |
```

**Esperado:** Cada categoría de datos tiene un período de retención definido, un requisito de formato y una disposición planificada.
**En caso de fallo:** Si los requisitos de retención no están claros, consultar a asuntos regulatorios y asesoría legal. Por defecto, usar el período de retención aplicable más largo.

### Paso 2: Planificar la Migración de Datos (Si Aplica)

Si los datos se migran a un sistema de reemplazo:

```markdown
# Data Migration Plan
## Document ID: DMP-[SYS]-[YYYY]-[NNN]

### Migration Scope
| Source | Target | Data Category | Records | Migration Method |
|--------|--------|---------------|---------|-----------------|
| [Old system] | [New system] | [Category] | [Count] | ETL / Manual / API |

### Data Mapping
| Source Field | Source Format | Target Field | Target Format | Transformation |
|-------------|-------------|-------------|---------------|---------------|
| [e.g., test_result] | FLOAT(8,2) | [e.g., result_value] | DECIMAL(10,3) | Precision conversion |
| [e.g., operator_id] | VARCHAR(20) | [e.g., user_id] | UUID | Lookup table mapping |

### Validation Approach
| Check | Method | Acceptance Criteria |
|-------|--------|-------------------|
| Record count reconciliation | Source count vs target count | 100% match |
| Field-level comparison | Sample 5% of records, all fields | 100% match after transformation |
| Checksum verification | Hash source vs target for key fields | Checksums match |
| Business rule validation | Verify key calculations in target | Results match source |
| Audit trail continuity | Verify historical audit trail migrated | All entries present with original timestamps |
```

**Esperado:** El plan de migración incluye mapeo, reglas de transformación y verificaciones de validación que demuestran que se mantuvo la integridad de los datos.
**En caso de fallo:** Si la validación de la migración falla, no proceder a dar de baja el sistema. Corregir los problemas de migración y revalidar.

### Paso 3: Definir la Estrategia de Archivado

Para los datos que se archivarán en lugar de migrarse:

```markdown
# Archival Strategy

### Archive Format
| Consideration | Decision | Rationale |
|--------------|----------|-----------|
| Format | [PDF/A, CSV, XML, database backup] | [Why this format survives the retention period] |
| Medium | [Network storage, cloud archive, tape, optical] | [Durability and accessibility] |
| Encryption | [Yes/No — method if yes] | [Security vs long-term accessibility trade-off] |
| Integrity verification | [SHA-256 checksums, periodic verification schedule] | [Prove archive is uncorrupted] |

### Archive Verification
- [ ] Archived data is readable without the source system
- [ ] All required data categories are included in the archive
- [ ] Checksums recorded at time of archival
- [ ] Archive can be searched and retrieved within [defined SLA, e.g., 5 business days]
- [ ] Periodic integrity checks scheduled (annually)

### Archive Access
| Role | Access Level | Authorisation |
|------|-------------|--------------|
| QA Director | Read access to all archived data | Standing authorisation |
| Regulatory Affairs | Read access for inspection support | Standing authorisation |
| System Owner (former) | Read access for business queries | Request-based |
| External auditors | Read access, supervised | Per audit plan |
```

**Esperado:** Los datos archivados son legibles, consultables y verificables sin el sistema original.
**En caso de fallo:** Si los datos no pueden leerse independientemente del sistema fuente, el archivo no es conforme. Considerar exportar a un formato estándar abierto (PDF/A, CSV) antes de dar de baja el sistema.

### Paso 4: Ejecutar la Baja del Sistema

```markdown
# Decommission Checklist
## Document ID: DC-[SYS]-[YYYY]-[NNN]

### Pre-Decommission
- [ ] All stakeholders notified of decommission date and data disposition
- [ ] Data migration completed and validated (if applicable)
- [ ] Data archive created and verified (if applicable)
- [ ] Final backup of complete system taken and stored separately
- [ ] All open change requests resolved or transferred
- [ ] All open CAPAs resolved or transferred to successor system
- [ ] All active users informed and redirected to replacement system (if applicable)

### Decommission Execution
- [ ] User access revoked for all accounts
- [ ] System removed from production environment
- [ ] Network connections disconnected
- [ ] Licenses returned or terminated
- [ ] System entry removed from active system inventory
- [ ] System moved to "Decommissioned" status in compliance architecture

### Post-Decommission
- [ ] Validation documentation archived (URS, VP, IQ/OQ/PQ, TM, VSR)
- [ ] SOPs retired or updated to remove references to decommissioned system
- [ ] Training records archived
- [ ] Change control records archived
- [ ] Audit trail archived
- [ ] Decommission report completed and approved

### Decommission Report
| Section | Content |
|---------|---------|
| System description | Name, version, purpose, GxP classification |
| Decommission rationale | Why the system is being retired |
| Data disposition summary | What data went where (migrated, archived, destroyed) |
| Validation evidence | Migration validation results, archive verification |
| Residual risk | Any ongoing data retention obligations |
| Approval | System owner, QA, IT signatures |
```

**Esperado:** La baja del sistema es controlada, documentada y aprobada — no simplemente "apagarlo".
**En caso de fallo:** Si algún elemento de la lista de verificación no puede completarse, documentar la excepción y obtener la aprobación de Aseguramiento de Calidad antes de proceder.

## Validación

- [ ] Requisitos de retención de datos evaluados para todas las categorías de datos
- [ ] Migración de datos validada con conteos de registros, muestreo y sumas de verificación (si aplica)
- [ ] Archivo creado en un formato legible sin el sistema fuente
- [ ] Integridad del archivo verificada con sumas de verificación
- [ ] Todo el acceso de usuarios revocado
- [ ] Documentación de validación archivada con período de retención definido
- [ ] SOPs actualizados para eliminar referencias al sistema dado de baja
- [ ] Informe de baja del sistema aprobado por el propietario del sistema, Aseguramiento de Calidad y TI

## Errores Comunes

- **Baja prematura**: Apagar un sistema antes de que la migración de datos esté validada arriesga la pérdida permanente de datos. Completar toda la validación antes de apagar el sistema.
- **Archivos ilegibles**: Almacenar datos en un formato propietario que requiere el sistema original para leerlos derrota el propósito del archivado. Usar formatos abiertos.
- **Registro de auditoría olvidado**: Archivar los datos pero no el registro de auditoría significa que la procedencia de los datos no puede demostrarse. Siempre archivar los registros de auditoría junto con sus registros padre.
- **SOPs huérfanos**: Los SOPs que aún hacen referencia a un sistema dado de baja confunden a los usuarios y crean brechas de cumplimiento. Actualizar o retirar todos los SOPs afectados.
- **Sin verificación periódica del archivo**: Los archivos se degradan. Sin verificaciones periódicas de integridad, la pérdida de datos puede pasar desapercibida hasta que los datos sean necesarios para una inspección.

## Habilidades Relacionadas

- `design-compliance-architecture` — actualizar el inventario de sistemas y la arquitectura de cumplimiento tras la baja
- `manage-change-control` — dar de baja un sistema es un cambio importante que requiere control de cambios
- `write-validation-documentation` — la validación de la migración sigue la misma metodología IQ/OQ
- `write-standard-operating-procedure` — retirar o actualizar los SOPs que hacen referencia al sistema dado de baja
- `prepare-inspection-readiness` — los datos archivados deben permanecer accesibles para inspecciones regulatorias
