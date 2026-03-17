---
name: write-standard-operating-procedure
description: >
  Redactar un Procedimiento Operativo Estándar (SOP) conforme a GxP. Cubre la
  estructura regulatoria de la plantilla SOP (propósito, alcance, definiciones,
  responsabilidades, procedimiento, referencias, historial de revisiones),
  diseño del flujo de trabajo de aprobación, programación de revisión periódica
  y procedimientos operacionales para el uso del sistema. Usar cuando un nuevo
  sistema validado requiere procedimientos operacionales, cuando los
  procedimientos informales existentes necesitan formalización, cuando un
  hallazgo de auditoría cita procedimientos faltantes, cuando un control de
  cambios desencadena actualizaciones de SOP, o cuando la revisión periódica
  identifica contenido procedimental desactualizado.
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
  tags: gxp, sop, procedure, documentation, compliance, quality-management
---

# Redactar Procedimiento Operativo Estándar

Crear un Procedimiento Operativo Estándar conforme a GxP que proporcione instrucciones claras y auditables para actividades reguladas.

## Cuándo Usar

- Un nuevo sistema validado requiere procedimientos operacionales
- Los procedimientos existentes necesitan formalización en formato SOP
- Un hallazgo de auditoría cita procedimientos faltantes o inadecuados
- Un control de cambios desencadena actualizaciones de SOP
- La revisión periódica identifica contenido procedimental desactualizado

## Entradas

- **Requerido**: Proceso o sistema que cubre el SOP
- **Requerido**: Contexto regulatorio (GMP, GLP, GCP, 21 CFR Parte 11, EU Anexo 11)
- **Requerido**: Audiencia objetivo (roles que seguirán este SOP)
- **Opcional**: Procedimientos informales existentes, instrucciones de trabajo o materiales de formación
- **Opcional**: SOPs relacionados que interfieren con este procedimiento
- **Opcional**: Hallazgos de auditoría u observaciones regulatorias que impulsan la creación del SOP

## Procedimiento

### Paso 1: Asignar Metadatos de Control de Documentos

```markdown
# Standard Operating Procedure
## Document ID: SOP-[DEPT]-[NNN]
## Title: [Descriptive Title of the Procedure]

| Field | Value |
|-------|-------|
| Document ID | SOP-[DEPT]-[NNN] |
| Version | 1.0 |
| Effective Date | [YYYY-MM-DD] |
| Review Date | [YYYY-MM-DD + review period] |
| Department | [Department name] |
| Author | [Name, Title] |
| Reviewer | [Name, Title] |
| Approver | [Name, Title] |
| Classification | [GxP-Critical / GxP-Supporting] |
| Supersedes | [Previous SOP ID or "N/A — New"] |
```

**Esperado:** Cada SOP tiene un ID único siguiendo la convención de numeración de documentos de la organización.
**En caso de fallo:** Si no existe ninguna convención de numeración, establecer una antes de proceder: [TIPO]-[DEPT]-[3 dígitos secuenciales].

### Paso 2: Redactar el Propósito y el Alcance

```markdown
### 1. Purpose
This SOP defines the procedure for [specific activity] to ensure [regulatory objective].

### 2. Scope
**In scope:**
- [System, process, or activity covered]
- [Applicable departments or roles]
- [Specific regulatory requirements addressed]

**Out of scope:**
- [Related activities covered by other SOPs — reference them]
- [Systems or departments not covered]
```

**Esperado:** El propósito tiene una o dos oraciones. El alcance define claramente los límites.
**En caso de fallo:** Si el alcance se superpone con un SOP existente, referenciar el SOP existente para la sección superpuesta o revisar ambos SOPs para eliminar la superposición.

### Paso 3: Definir Términos y Abreviaturas

```markdown
### 3. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available |
| CCB | Change Control Board |
| GxP | Good [Manufacturing/Laboratory/Clinical] Practice — umbrella for all regulated quality standards |
| SOP | Standard Operating Procedure |
| [Add terms specific to this SOP] | [Definition] |
```

**Esperado:** Cada abreviatura y término técnico usado en el SOP está definido.
**En caso de fallo:** Si un término es ambiguo o específico del dominio, consultar el glosario de la organización o la guía regulatoria relevante para la definición autorizada.

### Paso 4: Asignar Responsabilidades

```markdown
### 4. Responsibilities

| Role | Responsibilities |
|------|-----------------|
| System Owner | Ensure SOP compliance, approve changes, conduct periodic review |
| System Administrator | Execute daily operations per this SOP, report deviations |
| Quality Assurance | Review SOP for regulatory compliance, approve new versions |
| End Users | Follow procedures as written, report issues to system administrator |
| Training Coordinator | Ensure all affected personnel are trained before SOP effective date |
```

**Esperado:** Cada acción en la sección Procedimiento puede trazarse a un rol responsable.
**En caso de fallo:** Si un paso procedimental no tiene ningún rol asignado, es una responsabilidad huérfana. Asignar un propietario antes de que el SOP sea aprobado.

### Paso 5: Redactar la Sección de Procedimiento

Este es el núcleo del SOP. Redactar instrucciones paso a paso:

```markdown
### 5. Procedure

#### 5.1 [First Major Activity]
1. [Action verb] [specific instruction]. Reference: [form, system screen, tool].
2. [Action verb] [specific instruction].
   - If [condition], then [action].
   - If [alternative condition], then [alternative action].
3. [Action verb] [specific instruction].
4. Record the result in [form/system/log].

#### 5.2 [Second Major Activity]
1. [Action verb] [specific instruction].
2. Verify [specific criterion].
3. If verification fails, initiate [deviation procedure — reference SOP-XXX].

#### 5.3 Deviation Handling
1. If any step cannot be performed as written, STOP and document the deviation.
2. Notify [role] within [timeframe].
3. Complete Deviation Form [form reference].
4. Do not proceed until [role] provides disposition.
```

Reglas de redacción para SOPs GxP:
- Comenzar cada paso con un verbo de acción (verificar, registrar, ingresar, aprobar, notificar)
- Ser lo suficientemente específico para que un operador entrenado pueda seguirlo sin interpretación
- Incluir puntos de decisión con criterios claros para cada camino
- Referenciar nombres exactos de formularios, pantallas del sistema o identificadores de herramientas
- Incluir puntos de espera donde el trabajo debe detenerse pendiente de aprobación o verificación

**Esperado:** Una persona entrenada, no familiarizada con el proceso específico, podría seguir estos pasos correctamente.
**En caso de fallo:** Si los expertos en la materia dicen que el procedimiento es ambiguo, añadir detalle o desglosar el paso en sub-pasos. La ambigüedad en los SOPs es un hallazgo de auditoría recurrente.

### Paso 6: Añadir Referencias, Adjuntos e Historial de Revisiones

```markdown
### 6. References
| Document ID | Title |
|-------------|-------|
| SOP-QA-001 | Document Control |
| SOP-IT-015 | User Access Management |
| [Regulation reference] | [e.g., 21 CFR Part 11] |

### 7. Attachments
| Attachment | Description |
|-----------|-------------|
| Form-001 | [Form name and purpose] |
| Template-001 | [Template name and purpose] |

### 8. Revision History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | [Date] | [Name] | Initial release |
```

**Esperado:** Todos los documentos referenciados son accesibles para los usuarios, y el historial de revisiones comienza desde la versión 1.0.
**En caso de fallo:** Si los documentos referenciados aún no existen, crearlos o eliminar la referencia y anotar la brecha en la revisión del SOP.

### Paso 7: Dirigir para Revisión y Aprobación

```markdown
### Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | [Name] | | |
| Technical Reviewer | [Name] | | |
| QA Reviewer | [Name] | | |
| Approver (Department Head) | [Name] | | |

### Training Requirement
All personnel listed in Section 4 must complete training on this SOP before the effective date. Training must be documented in the training management system.

### Periodic Review
This SOP must be reviewed at least every [2 years / annually] or when triggered by:
- Change control affecting the covered process or system
- Audit finding related to the covered process
- Regulatory guidance update affecting the covered requirements
```

**Esperado:** El SOP es revisado por un experto en la materia y aprobado por Aseguramiento de Calidad antes de entrar en vigor.
**En caso de fallo:** Si el flujo de trabajo de aprobación se retrasa, la fecha de vigencia debe posponerse. Un SOP no puede estar en vigor sin las aprobaciones completadas.

## Validación

- [ ] El ID del documento sigue la convención de numeración de la organización
- [ ] El propósito es específico y conciso (1-2 oraciones)
- [ ] El alcance define claramente los límites dentro y fuera del alcance
- [ ] Todas las abreviaturas y términos técnicos están definidos
- [ ] Cada rol en la sección Responsabilidades se mapea a pasos del procedimiento
- [ ] Los pasos del procedimiento comienzan con verbos de acción y son lo suficientemente específicos para seguirlos sin interpretación
- [ ] Los puntos de decisión tienen criterios claros para cada camino
- [ ] El manejo de desviaciones está definido
- [ ] Todos los documentos referenciados existen y son accesibles
- [ ] El historial de revisiones está completo desde la versión 1.0
- [ ] Las firmas de aprobación incluyen autor, revisor y aprobador
- [ ] El cronograma de revisión periódica está definido

## Errores Comunes

- **Demasiado vago**: "Asegurar la calidad de los datos" no es un paso procedimental. "Verificar que los 15 campos del Formulario-001 están rellenados y dentro del rango según el Apéndice A" sí lo es.
- **Demasiado detallado**: Incluir resolución de problemas para cada posible error hace que el SOP sea ilegible. Referenciar una instrucción de trabajo separada para la resolución de problemas compleja.
- **Sin manejo de desviaciones**: Cada SOP debe definir qué hacer cuando el procedimiento no puede seguirse tal como está escrito. El silencio sobre las desviaciones implica que no son posibles.
- **En vigor antes de la formación**: Un SOP en vigor antes de que todos los usuarios estén formados crea una brecha de cumplimiento inmediata.
- **SOPs huérfanos**: Los SOPs que nunca se revisan quedan desactualizados y poco confiables. Establecer fechas de revisión y hacer seguimiento de ellas en el sistema de control de documentos.

## Habilidades Relacionadas

- `design-compliance-architecture` — identifica qué sistemas y procesos necesitan SOPs
- `manage-change-control` — desencadena actualizaciones de SOP cuando los procesos cambian
- `design-training-program` — garantiza que los usuarios sean formados en SOPs nuevos y actualizados
- `conduct-gxp-audit` — las auditorías evalúan la adecuación y el cumplimiento de los SOPs
- `write-validation-documentation` — los SOPs y los documentos de validación comparten flujos de trabajo de aprobación
