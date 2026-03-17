---
name: implement-electronic-signatures
description: >
  Elektronische Signaturen konform mit 21 CFR Part 11 Subpart C und EU
  Annex 11 implementieren. Umfasst Signaturdarstellung (Unterzeichner,
  Datum/Uhrzeit, Bedeutung), Signatur-Datensatz-Bindung, biometrische vs.
  nicht-biometrische Kontrollen, Richtlinienerstellung und Anforderungen an
  Benutzerzertifizierungen. Anzuwenden wenn ein computergestuetztes System
  rechtsverbindliche elektronische Signaturen fuer GxP-Aufzeichnungen benoetigt,
  beim Ersetzen handgeschriebener Signaturen in regulierten Workflows, bei der
  Implementierung von Chargenfreigabe- oder Dokumentengenehmigungsworkflows
  oder wenn eine regulatorische Luecke fehlende Signaturkontrollen aufdeckt.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
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

# Elektronische Signaturen implementieren

Elektronische Signaturkontrollen entwerfen und implementieren, die den Anforderungen von 21 CFR Part 11 Subpart C und EU Annex 11 fuer regulierte elektronische Aufzeichnungen genuegen.

## Wann verwenden

- Ein computergestuetztes System benoetigt rechtsverbindliche elektronische Signaturen fuer GxP-Aufzeichnungen
- Handschriftliche Signaturen werden in einem regulierten Workflow durch elektronische Entsprechungen ersetzt
- Genehmigungsworkflows fuer Chargenfreigabe, Dokumentengenehmigung oder Datenunterschrift implementieren
- Regulatorische Lueckenanalyse deckt fehlende Signaturkontrollen auf
- Aufbau oder Konfiguration eines Systems, das 21 CFR 11.50–11.300 entsprechen muss

## Eingaben

- **Erforderlich**: Systembeschreibung und Signaturanwendungsfaelle (welche Aufzeichnungen unterschrieben werden)
- **Erforderlich**: Anwendbare Vorschriften (21 CFR Part 11, EU Annex 11, spezifischer GxP-Kontext)
- **Erforderlich**: Benoetiate Signaturtypen (Genehmigung, Pruefung, Bestaetigung, Urheberschaft)
- **Optional**: Aktuelle Authentifizierungsinfrastruktur (Active Directory, LDAP, SSO)
- **Optional**: Bestehende Richtlinie oder SOPs fuer elektronische Signaturen
- **Optional**: Anbieter-Dokumentation zu Signaturfaehigkeiten

## Vorgehensweise

### Schritt 1: Anwendbarkeit der Anforderungen an elektronische Signaturen beurteilen

Bestimmen, welche Bestimmungen von 21 CFR Part 11 Subpart C gelten:

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

**Erwartet:** Jeder Signaturanwendungsfall hat eine dokumentierte regulatorische Grundlage und definierte Bedeutung.
**Bei Fehler:** Erfordert ein Anwendungsfall keine 21-CFR-11-Konformitaet (z. B. Nicht-GxP-Aufzeichnungen), die Ausschlussbegruendung dokumentieren und proportionale Kontrollen anwenden.

### Schritt 2: Signaturdarstellung gestalten

Definieren, welche Informationen die Signatur gemaess 21 CFR 11.50 anzeigen muss:

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

**Erwartet:** Signaturdarstellung ist eindeutig — jeder, der den signierten Datensatz einsieht, kann feststellen, wer unterschrieben hat, wann und warum.
**Bei Fehler:** Kann das System nicht alle drei Elemente in der Datensatzansicht anzeigen, eine Signaturdetailseite implementieren, die vom signierten Datensatz aus zugaenglich ist.

### Schritt 3: Signatur-Datensatz-Bindung implementieren

Sicherstellen, dass Signaturen nicht aus Aufzeichnungen entfernt, kopiert oder zwischen Aufzeichnungen uebertragen werden koennen (21 CFR 11.70):

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

**Erwartet:** Ein signierter Datensatz und seine Signatur sind untrennbar — die Aenderung einer der beiden macht die Bindung ungueltug.
**Bei Fehler:** Kann das System die Bindung auf technischer Ebene nicht durchsetzen, prozedurale Kontrollen (doppelte Verwahrung, regelmaessige Abstimmung) implementieren und die kompensierende Kontrolle dokumentieren.

### Schritt 4: Authentifizierungskontrollen konfigurieren

Die Identitaetsverifizierungsanforderungen gemaess 21 CFR 11.100 und 11.200 implementieren:

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

**Erwartet:** Authentifizierung stellt sicher, dass nur die identifizierte Person ihre Signatur anbringen kann.
**Bei Fehler:** Unterstuetzt das System keine sitzungsgewahren Signaturkontrollen, vollstaendige Reauthentifizierung (Benutzername + Passwort) fuer jedes Signierereignis verlangen.

### Schritt 5: Richtlinie fuer elektronische Signaturen erstellen

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

**Erwartet:** Richtliniendokument vor dem Inbetriebnehmen elektronischer Signaturen von Qualitaet, IT und Rechts-/Regulatorik genehmigt.
**Bei Fehler:** Hat Rechtsanwalt die Richtlinie noch nicht geprueft, dies als Compliance-Risiko kennzeichnen und vor dem ersten Einsatz elektronischer Signaturen eine Rechtspruefung einholen.

### Schritt 6: Implementierung verifizieren

Verifizierungstests fuer alle Signaturkontrollen durchfuehren:

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

**Erwartet:** Alle Testfaelle sind bestanden und zeigen, dass die Signaturkontrollen die regulatorischen Anforderungen erfuellen.
**Bei Fehler:** Fehlgeschlagene Testfaelle erfordern Behebung, bevor das System in Betrieb geht. Fehler als Abweichungen dokumentieren und Behebung ueber Aenderungskontrolle verfolgen.

## Validierung

- [ ] Anwendbarkeitsbewertung dokumentiert, welche Bestimmungen von 21 CFR 11 Subpart C gelten
- [ ] Signaturdarstellung enthaelt Name, Datum/Uhrzeit und Bedeutung fuer jeden Anwendungsfall
- [ ] Signaturbindung verhindert Entfernen, Kopieren oder Uebertragen von Signaturen
- [ ] Authentifizierung erfordert zwei unterschiedliche Identifikationskomponenten bei der ersten Unterzeichnung
- [ ] Passwortrichtlinie erfuellt Mindestsicherheitsanforderungen
- [ ] Richtlinie fuer elektronische Signaturen von Qualitaet, IT und Rechts genehmigt
- [ ] Benutzerzertifizierungsformulare von allen Unterzeichnern gesammelt
- [ ] FDA-Zertifizierung eingereicht (falls unter 11.300 erforderlich)
- [ ] Verifizierungstests fuer alle Signaturkontrollen bestanden

## Haeufige Stolperfallen

- **Authentifizierung mit elektronischer Signatur verwechseln**: Anmelden ist Authentifizierung; einen Datensatz unterzeichnen ist eine elektronische Signatur. Sie haben unterschiedliche regulatorische Anforderungen.
- **Geteilte Konten**: Jedes System mit geteilten Konten kann keine konformen elektronischen Signaturen haben. Geteilte Konten vor der Implementierung von e-Signaturen aufloesen.
- **Fehlende Bedeutung**: Signaturen, die Name und Datum, aber nicht die Bedeutung ("Genehmigt", "Geprueft") anzeigen, erfuellen 21 CFR 11.50 nicht.
- **Sitzungsbehandlung**: Kontinuierliches Sitzungsunterzeichnen ohne Reauthentifizierung untergreabt die Identitaetssicherheit der Signatur.
- **11.300-Zertifizierung vergessen**: Organisationen, die elektronische Signaturen in FDA-regulierten Kontexten verwenden, muessen der FDA bescheinigen, dass sie e-Signaturen als rechtsverbindlich beabsichtigen.

## Verwandte Skills

- `design-compliance-architecture` — ordnet e-Signatur-Anforderungen systemuebereifend zu
- `implement-audit-trail` — Auditpfad erfasst Signierereignisse
- `write-validation-documentation` — Verifizierungstests sind Teil der OQ-Dokumentation
- `write-standard-operating-procedure` — SOP fuer die Nutzung elektronischer Signaturen
- `manage-change-control` — Aenderungen an der Signaturkonfiguration gehen durch Aenderungskontrolle
