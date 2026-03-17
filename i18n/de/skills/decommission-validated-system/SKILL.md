---
name: decommission-validated-system
description: >
  Validiertes computergestuetztes System am Ende seines Lebenszyklus
  ausser Betrieb nehmen. Umfasst Datenaufbewahrungsbewertung nach Vorschrift,
  Datenmigrations-Validierung (Mapping, Transformation, Abgleich),
  Archivierungsstrategie, Zugangssperrung, Dokumentenarchivierung und
  Benachrichtigung der Stakeholder. Anzuwenden wenn ein validiertes System
  ersetzt wird, ohne Ersatz das Lebensende erreicht, der Anbieterssupport
  eingestellt wird, mehrere Systeme konsolidiert werden oder regulatorische
  Aenderungen ein System obsolet machen.
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
  complexity: intermediate
  language: multi
  tags: gxp, decommission, data-retention, migration, archival, compliance
---

# Validiertes System ausser Betrieb nehmen

Die kontrollierte Ausserbetriebnahme eines validierten computergestuetzten Systems planen und durchfuehren, waehrend Datenintegritaet erhalten und regulatorische Aufbewahrungsanforderungen erfuellt werden.

## Wann verwenden

- Ein validiertes System wird durch ein neues System ersetzt
- Ein System erreicht das Lebensende ohne Ersatz (Geschaeftsprozess eingestellt)
- Anbieter stellt Support fuer ein validiertes Produkt ein
- Konsolidierung mehrerer Systeme zu einer einzigen Plattform
- Regulatorische oder geschaeftliche Aenderungen machen ein System obsolet

## Eingaben

- **Erforderlich**: Ausser Betrieb zu nehmendes System (Name, Version, Validierungsstatus)
- **Erforderlich**: Datenaufbewahrungsanforderungen nach Vorschrift (21 CFR Part 11, GLP, GCP)
- **Erforderlich**: Ersatzsystem (falls zutreffend) und Migrationsumfang
- **Optional**: Aktuelles Validierungsdokumentationspaket
- **Optional**: Inventar zu Datenvolumen und Datenformat
- **Optional**: Geschaeftseigentuemer und Stakeholder-Liste

## Vorgehensweise

### Schritt 1: Datenaufbewahrungsanforderungen beurteilen

Bestimmen, wie lange Daten aufbewahrt werden muessen und in welcher Form:

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

**Erwartet:** Jede Datenkategorie hat eine definierte Aufbewahrungsfrist, Formatanforderung und geplante Disposition.
**Bei Fehler:** Sind Aufbewahrungsanforderungen unklar, Regulatory Affairs und Rechtsabteilung konsultieren. Standardmaessig die laengste anwendbare Aufbewahrungsfrist verwenden.

### Schritt 2: Datenmigration planen (falls zutreffend)

Wenn Daten in ein Ersatzsystem migriert werden:

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

**Erwartet:** Migrationsplan enthaelt Mapping, Transformationsregeln und Validierungspruefungen, die belegen, dass die Datenintegritaet erhalten wurde.
**Bei Fehler:** Schlaegt die Migrationsvalidierung fehl, nicht mit der Ausserbetriebnahme fortfahren. Migrationsprobleme beheben und erneut validieren.

### Schritt 3: Archivierungsstrategie definieren

Fuer Daten, die archiviert statt migriert werden:

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

**Erwartet:** Archivierte Daten sind ohne das urspruengliche System lesbar, durchsuchbar und verifizierbar.
**Bei Fehler:** Koennen Daten ohne das Quellsystem nicht gelesen werden, ist das Archiv nicht konform. Vor der Ausserbetriebnahme in ein offenes Standardformat (PDF/A, CSV) exportieren.

### Schritt 4: Ausserbetriebnahme ausfuehren

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

**Erwartet:** Ausserbetriebnahme ist kontrolliert, dokumentiert und genehmigt — nicht einfach "abschalten".
**Bei Fehler:** Kann ein Checklisten-Element nicht abgeschlossen werden, die Ausnahme dokumentieren und QA-Genehmigung einholen, bevor weitergemacht wird.

## Validierung

- [ ] Datenaufbewahrungsanforderungen fuer alle Datenkategorien bewertet
- [ ] Datenmigration mit Datensatzzaehlung, Stichproben und Pruefsummen validiert (falls zutreffend)
- [ ] Archiv in einem Format erstellt, das ohne das Quellsystem lesbar ist
- [ ] Archivintegritaet mit Pruefsummen verifiziert
- [ ] Alle Benutzerzugaenge gesperrt
- [ ] Validierungsdokumentation mit definierter Aufbewahrungsfrist archiviert
- [ ] SOPs aktualisiert um Referenzen auf das ausser Betrieb genommene System zu entfernen
- [ ] Ausserbetriebnahmebericht von Systemeigentuemer, QA und IT genehmigt

## Haeufige Stolperfallen

- **Vorzeitige Ausserbetriebnahme**: Ein System ausschalten, bevor die Datenmigration validiert ist, riskiert dauerhaften Datenverlust. Alle Validierungen abschliessen, bevor abgeschaltet wird.
- **Nicht lesbare Archive**: Daten in einem proprietaeren Format zu speichern, das das urspruengliche System zum Lesen benoetigt, macht den Archivierungszweck zunichte. Offene Formate verwenden.
- **Vergessene Auditpfade**: Daten zu archivieren aber nicht den Auditpfad bedeutet, dass die Datenprovenienz nicht nachgewiesen werden kann. Auditpfade immer mit ihren uebergeordneten Aufzeichnungen archivieren.
- **Verwaiste SOPs**: SOPs, die noch auf ein ausser Betrieb genommenes System verweisen, verwirren Nutzer und erzeugen Compliance-Luecken. Alle betroffenen SOPs aktualisieren oder ausser Kraft setzen.
- **Keine regelmaessige Archivverifizierung**: Archive verschlechtern sich. Ohne regelmaessige Integritaetspruefungen kann Datenverlust unbemerkt bleiben, bis die Daten fuer eine Inspektion benoetigt werden.

## Verwandte Skills

- `design-compliance-architecture` — Systeminventar und Compliance-Architektur nach der Ausserbetriebnahme aktualisieren
- `manage-change-control` — Ausserbetriebnahme ist eine wesentliche Aenderung, die Aenderungskontrolle erfordert
- `write-validation-documentation` — Migrationsvalidierung folgt derselben IQ/OQ-Methodik
- `write-standard-operating-procedure` — SOPs, die auf das ausser Betrieb genommene System verweisen, ausser Kraft setzen oder aktualisieren
- `prepare-inspection-readiness` — archivierte Daten muessen fuer Behoerdeninspektionen zugaenglich bleiben
