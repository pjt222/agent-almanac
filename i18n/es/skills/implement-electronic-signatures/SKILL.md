---
name: implement-electronic-signatures
description: >
  Implementar firmas electrónicas conformes con 21 CFR Parte 11 Subcapítulo C
  y EU Anexo 11. Cubre la manifestación de la firma (firmante, fecha/hora,
  significado), el enlace firma-registro, controles biométricos vs no
  biométricos, creación de políticas y requisitos de certificación de usuario.
  Usar cuando un sistema informatizado requiere firmas electrónicas
  legalmente vinculantes para registros GxP, al reemplazar firmas manuscritas
  en flujos de trabajo regulados, al implementar flujos de trabajo de
  liberación de lotes o aprobación de documentos, o cuando una evaluación de
  brechas regulatorias revela controles de firma faltantes.
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
  tags: gxp, electronic-signatures, 21-cfr-11, eu-annex-11, compliance, authentication
---

# Implementar Firmas Electrónicas

Diseñar e implementar controles de firma electrónica que cumplan los requisitos del Subcapítulo C de 21 CFR Parte 11 y del EU Anexo 11 para registros electrónicos regulados.

## Cuándo Usar

- Un sistema informatizado requiere firmas electrónicas legalmente vinculantes para registros GxP
- Al reemplazar firmas manuscritas con equivalentes electrónicos en un flujo de trabajo regulado
- Al implementar flujos de trabajo de aprobación para liberación de lotes, aprobación de documentos o firma de datos
- Una evaluación de brechas regulatorias revela controles de firma faltantes
- Al construir o configurar un sistema que debe cumplir con 21 CFR 11.50–11.300

## Entradas

- **Requerido**: Descripción del sistema y casos de uso de firma (qué registros se están firmando)
- **Requerido**: Regulaciones aplicables (21 CFR Parte 11, EU Anexo 11, contexto GxP específico)
- **Requerido**: Tipos de firma necesarios (aprobación, revisión, reconocimiento, autoría)
- **Opcional**: Infraestructura de autenticación actual (Active Directory, LDAP, SSO)
- **Opcional**: Política de firma electrónica existente o SOPs
- **Opcional**: Documentación del proveedor del sistema sobre capacidades de firma

## Procedimiento

### Paso 1: Evaluar la Aplicabilidad de los Requisitos de Firma Electrónica

Determinar qué disposiciones del Subcapítulo C de 21 CFR Parte 11 aplican:

```markdown
# Electronic Signature Applicability Assessment
## Document ID: ESA-[SYS]-[YYYY]-[NNN]

### Regulatory Scope
| Provision | Section | Requirement | Applies? | Rationale |
|-----------|---------|-------------|----------|-----------|
| General requirements | 11.50 | Signed records contain name, date/time, meaning | Yes/No | [Rationale] |
| Signing by another | 11.50 | Signatures not shared or transferred | Yes/No | [Rationale] |
| Signature linking | 11.70 | Signatures linked to records so they cannot be falsified | Yes/No | [Rationale] |
| General e-sig requirements | 11.100 | Unique to one individual, verified before use | Yes/No | [Rationale] |
| Non-biometric controls | 11.200 | Two distinct identification components at first signing | Yes/No | [Rationale] |
| Biometric controls | 11.200 | Designed to prevent use by anyone other than genuine owner | Yes/No | [Rationale] |
| Certification to FDA | 11.300 | Organisation certifies e-sigs are intended to be legally binding | Yes/No | [Rationale] |

### Signature Use Cases
| Use Case | Record Type | Meaning | Frequency | Current Method |
|----------|-------------|---------|-----------|----------------|
| Batch release | Batch record | "Approved for release" | Daily | Wet-ink |
| Document approval | SOP | "Approved" | Weekly | Wet-ink |
| Data review | Lab results | "Reviewed and verified" | Daily | Wet-ink |
| Deviation closure | Deviation report | "Closed — CAPA effective" | As needed | Wet-ink |
```

**Esperado:** Cada caso de uso de firma tiene una base regulatoria documentada y un significado definido.
**En caso de fallo:** Si un caso de uso no requiere cumplimiento con 21 CFR 11 (por ejemplo, registros no GxP), documentar el fundamento de exclusión y aplicar controles proporcionales.

### Paso 2: Diseñar la Manifestación de la Firma

Definir qué información debe mostrar la firma según 21 CFR 11.50:

```markdown
# Signature Manifestation Specification

### Required Manifestation Elements (21 CFR 11.50)
Every electronic signature must display:
1. **Printed name** of the signer
2. **Date and time** the signature was applied (ISO 8601 format)
3. **Meaning** of the signature (e.g., "Approved," "Reviewed," "Authored")

### Manifestation Format
| Element | Source | Format | Example |
|---------|--------|--------|---------|
| Name | User directory (AD/LDAP) | "First Last" | "Jane Smith" |
| Date/Time | System clock (NTP-synced) | YYYY-MM-DDTHH:MM:SS±TZ | 2026-02-09T14:30:00+01:00 |
| Meaning | Signature type definition | Predefined list | "Approved for release" |

### Signature Meanings Registry
| Code | Meaning | Used For | Authority Level |
|------|---------|----------|----------------|
| APPROVE | "Approved" | Final approval of documents and records | Manager and above |
| REVIEW | "Reviewed and verified" | Technical review of data | Qualified reviewer |
| AUTHOR | "Authored" | Document creation | Author |
| CLOSE | "Closed — corrective action verified" | CAPA and deviation closure | QA |
```

**Esperado:** La manifestación de la firma es inequívoca — cualquier persona que vea el registro firmado puede identificar quién firmó, cuándo y por qué.
**En caso de fallo:** Si el sistema no puede mostrar los tres elementos en la vista del registro, implementar una página de detalles de firma accesible desde el registro firmado.

### Paso 3: Implementar el Enlace Firma-Registro

Garantizar que las firmas no puedan eliminarse, copiarse o transferirse entre registros (21 CFR 11.70):

```markdown
# Signature Binding Specification

### Binding Method
| Method | Mechanism | Strength | Use When |
|--------|-----------|----------|----------|
| **Cryptographic** | Digital signature with PKI certificate | Strongest — tamper-evident | Custom applications, high-risk records |
| **Database referential** | Foreign key constraint linking signature table to record table | Strong — database-enforced | Configured COTS with relational DB |
| **Application-enforced** | Application logic prevents signature modification | Moderate — depends on app security | Vendor systems with signature modules |

### Selected Approach: [Cryptographic / Database referential / Application-enforced]

### Binding Requirements
- [ ] Signature cannot be removed from the record without detection
- [ ] Signature cannot be copied to a different record
- [ ] Signed record cannot be modified after signing without invalidating the signature
- [ ] Signature audit trail records all signature events (apply, invalidate, re-sign)
- [ ] Binding survives record export (PDF, print includes signature metadata)
```

**Esperado:** Un registro firmado y su firma son inseparables — modificar cualquiera de los dos invalida el enlace.
**En caso de fallo:** Si el sistema no puede imponer el enlace a nivel técnico, implementar controles procedimentales (custodia dual, conciliación periódica) y documentar el control compensatorio.

### Paso 4: Configurar los Controles de Autenticación

Implementar los requisitos de verificación de identidad según 21 CFR 11.100 y 11.200:

```markdown
# Authentication Configuration

### Identity Verification (11.100)
- [ ] Each signer has a unique user identity (no shared accounts)
- [ ] Identity verified by at least two of: something you know, have, are
- [ ] Identity assignment documented and approved by security officer
- [ ] Periodic identity re-verification (at least annually)

### Non-Biometric Controls (11.200(a))
For non-biometric signatures (username + password):

**First Signing in a Session:**
- Require both identification (username) AND authentication (password)
- Two distinct identification components at first use

**Subsequent Signings (Same Session):**
- At least one identification component (e.g., password re-entry)
- Session timeout: [Define maximum idle time, e.g., 15 minutes]

**Continuous Session Signing:**
- If multiple signatures in one uninterrupted session, password re-entry for each signature
- System detects session continuity (no logout, no timeout, no workstation lock)

### Password Policy (Supporting 11.200)
| Parameter | Requirement |
|-----------|------------|
| Minimum length | 12 characters |
| Complexity | Upper + lower + number + special |
| Expiry | 90 days (or per organisational policy) |
| History | Cannot reuse last 12 passwords |
| Lockout | After 5 failed attempts, lock for 30 minutes |
| Initial password | Must be changed on first use |
```

**Esperado:** La autenticación garantiza que solo el individuo identificado pueda aplicar su firma.
**En caso de fallo:** Si el sistema no admite controles de firma con reconocimiento de sesión, requerir re-autenticación completa (nombre de usuario + contraseña) para cada evento de firma.

### Paso 5: Crear la Política de Firma Electrónica

```markdown
# Electronic Signature Policy
## Document ID: ESP-[ORG]-[YYYY]-[NNN]

### 1. Purpose
This policy establishes requirements for the use of electronic signatures as legally binding equivalents of handwritten signatures for GxP electronic records.

### 2. Scope
Applies to all computerized systems listed in the Compliance Architecture (CA-[SITE]-[YYYY]-[NNN]) that require signatures for GxP records.

### 3. Definitions
- **Electronic signature**: A computer data compilation of any symbol or series of symbols executed, adopted, or authorized by an individual to be the legally binding equivalent of the individual's handwritten signature.
- **Biometric**: A method of verifying an individual's identity based on measurement of a physical feature (fingerprint, retina, voice pattern).
- **Non-biometric**: A method using a combination of identification codes (username) and passwords.

### 4. Requirements
4.1 All electronic signatures shall include the printed name, date/time, and meaning.
4.2 Each individual shall have a unique electronic signature that is not shared.
4.3 Signatures shall be linked to their respective records such that they cannot be falsified.
4.4 Before an individual uses their electronic signature, the organisation shall verify their identity.
4.5 Individuals must certify that their electronic signature is intended to be the legally binding equivalent of their handwritten signature.

### 5. User Certification
Each user must sign the Electronic Signature Certification Form before first use:

"I, [Full Name], certify that my electronic signature, as used within [System Name], is the legally binding equivalent of my handwritten signature. I understand that I am solely responsible for all actions performed under my electronic signature."

Signature: _____________ Date: _____________

### 6. FDA Certification (11.300)
The organisation shall submit a certification to the FDA that electronic signatures used within its systems are intended to be the legally binding equivalent of handwritten signatures.
```

**Esperado:** El documento de política está aprobado por calidad, TI y asesoría legal/asuntos regulatorios antes de que las firmas electrónicas entren en vigor.
**En caso de fallo:** Si el asesor legal no ha revisado la política, señalarlo como un riesgo de cumplimiento y obtener revisión legal antes del primer uso de las firmas electrónicas.

### Paso 6: Verificar la Implementación

Ejecutar pruebas de verificación para todos los controles de firma:

```markdown
# E-Signature Verification Protocol

| Test ID | Test Case | Expected Result | Actual | Pass/Fail |
|---------|-----------|-----------------|--------|-----------|
| ES-001 | Apply signature to record | Name, date/time, meaning displayed | | |
| ES-002 | Attempt to modify signed record | System prevents modification or invalidates signature | | |
| ES-003 | Attempt to copy signature to different record | System prevents or signature is invalid | | |
| ES-004 | Sign with incorrect password | Signature rejected, failed attempt logged | | |
| ES-005 | Sign after session timeout | Full re-authentication required | | |
| ES-006 | Sign within continuous session | Password re-entry required | | |
| ES-007 | View signed record as different user | Signature details visible but not editable | | |
| ES-008 | Export signed record to PDF | PDF includes signature metadata | | |
| ES-009 | Attempt to use another user's credentials | System detects and rejects | | |
| ES-010 | Verify audit trail captures signature event | Timestamp, user, meaning, record ID logged | | |
```

**Esperado:** Todos los casos de prueba pasan, demostrando que los controles de firma cumplen los requisitos regulatorios.
**En caso de fallo:** Los casos de prueba que fallan requieren remediación antes de que el sistema entre en producción. Documentar los fallos como desviaciones y hacer seguimiento de la resolución a través del control de cambios.

## Validación

- [ ] La evaluación de aplicabilidad documenta qué disposiciones del Subcapítulo C de 21 CFR 11 aplican
- [ ] La manifestación de la firma incluye nombre, fecha/hora y significado para cada caso de uso
- [ ] El enlace de la firma previene la eliminación, copia o transferencia de firmas
- [ ] La autenticación requiere dos componentes de identificación distintos en la primera firma
- [ ] La política de contraseñas cumple los requisitos mínimos de seguridad
- [ ] La política de firma electrónica aprobada por calidad, TI y asesoría legal
- [ ] Formularios de certificación de usuario recopilados para todos los firmantes
- [ ] Certificación FDA enviada (si se requiere bajo 11.300)
- [ ] Las pruebas de verificación pasan para todos los controles de firma

## Errores Comunes

- **Confundir autenticación con firma electrónica**: Iniciar sesión es autenticación; firmar un registro es una firma electrónica. Tienen diferentes requisitos regulatorios.
- **Cuentas compartidas**: Cualquier sistema con cuentas compartidas no puede tener firmas electrónicas conformes. Resolver las cuentas compartidas antes de implementar las firmas electrónicas.
- **Significado faltante**: Las firmas que muestran nombre y fecha pero no el significado ("Aprobado", "Revisado") no cumplen el 21 CFR 11.50.
- **Gestión de sesiones**: Permitir firmas en sesión continua sin re-autenticación socava la garantía de identidad de la firma.
- **Olvidar la certificación 11.300**: Las organizaciones que usan firmas electrónicas en contextos regulados por la FDA deben certificar a la FDA que pretenden que las firmas electrónicas sean legalmente vinculantes.

## Habilidades Relacionadas

- `design-compliance-architecture` — mapea los requisitos de firma electrónica en los sistemas
- `implement-audit-trail` — el registro de auditoría captura los eventos de firma
- `write-validation-documentation` — las pruebas de verificación son parte de la documentación OQ
- `write-standard-operating-procedure` — SOP para el uso de firmas electrónicas
- `manage-change-control` — los cambios en la configuración de la firma van a través del control de cambios
