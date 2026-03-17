---
name: manage-change-control
description: >
  Aenderungskontrolle fuer validierte computergestuetzte Systeme verwalten.
  Umfasst Aenderungsanfrage-Triage (Notfall, Standard, geringfuegig),
  Auswirkungsbewertung auf den validierten Zustand, Bestimmung des
  Revalidierungsumfangs, Genehmigungsworkflows, Implementierungsverfolgung
  und Nachpruefung nach der Aenderung. Anzuwenden wenn ein validiertes System
  ein Softwareupgrade, einen Patch oder eine Konfigurationsaenderung benoetigt;
  wenn Infrastrukturaenderungen validierte Systeme betreffen; wenn eine CAPA
  eine Systemmodifikation erfordert; oder wenn Notfallaenderungen eine
  beschleunigte Genehmigung und nachtraegliche Dokumentation benoetigen.
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
  tags: gxp, change-control, revalidation, impact-assessment, compliance
---

# Aenderungskontrolle verwalten

Aenderungen an validierten computergestuetzten Systemen bewerten, genehmigen, implementieren und verifizieren, waehrend der validierte Zustand erhalten bleibt.

## Wann verwenden

- Ein validiertes System benoetigt ein Softwareupgrade, einen Patch oder eine Konfigurationsaenderung
- Infrastrukturaenderungen (Servermigration, Betriebssystem-Upgrade, Netzwerkaenderung) betreffen validierte Systeme
- Eine CAPA oder ein Auditbefund erfordert eine Systemmodifikation
- Geschaeftsprozessaenderungen erfordern eine Systemneukonfiguration
- Notfallaenderungen benoetigen beschleunigte Genehmigung und nachtraegliche Dokumentation

## Eingaben

- **Erforderlich**: Aenderungsbeschreibung (was sich aendert und warum)
- **Erforderlich**: Betroffene Systeme und ihr aktueller validierter Zustand
- **Erforderlich**: Aenderungsantragsteller und Geschaeftsbegruendung
- **Optional**: Anbieter-Release-Notes oder technische Dokumentation
- **Optional**: Referenzen auf verwandte CAPAs oder Auditbefunde
- **Optional**: Bestehende Validierungsdokumentation fuer betroffene Systeme

## Vorgehensweise

### Schritt 1: Aenderungsanfrage erstellen und klassifizieren

```markdown
# Change Request
## Document ID: CR-[SYS]-[YYYY]-[NNN]

### 1. Change Description
**Requestor:** [Name, Department]
**Date:** [YYYY-MM-DD]
**System:** [System name and version]
**Current State:** [Current configuration/version]
**Proposed State:** [Target configuration/version]

### 2. Justification
[Business, regulatory, or technical reason for the change]

### 3. Classification
| Type | Definition | Approval Path | Timeline |
|------|-----------|--------------|----------|
| **Emergency** | Urgent fix for safety, data integrity, or regulatory compliance | System owner + QA (retrospective CCB) | Implement immediately, document within 5 days |
| **Standard** | Planned change with potential impact on validated state | CCB approval before implementation | Per CCB schedule |
| **Minor** | Low-risk change with no impact on validated state | System owner approval | Documented before implementation |

**This change is classified as:** [Emergency / Standard / Minor]
**Rationale:** [Why this classification]
```

**Erwartet:** Aenderungsanfrage hat eindeutige ID, klare Beschreibung und begruendete Klassifizierung.
**Bei Fehler:** Wird die Klassifizierung beanstandet, zu Standard wechseln und den CCB entscheiden lassen.

### Schritt 2: Auswirkungsbewertung durchfuehren

Die Aenderung gegen alle Dimensionen des validierten Zustands bewerten:

```markdown
# Impact Assessment
## Change Request: CR-[SYS]-[YYYY]-[NNN]

### Impact Matrix
| Dimension | Affected? | Details | Risk |
|-----------|-----------|---------|------|
| Software configuration | Yes/No | [Specific parameters changing] | [H/M/L] |
| Source code | Yes/No | [Modules, functions, or scripts affected] | [H/M/L] |
| Database schema | Yes/No | [Tables, fields, constraints changing] | [H/M/L] |
| Infrastructure | Yes/No | [Servers, network, storage affected] | [H/M/L] |
| Interfaces | Yes/No | [Upstream/downstream system connections] | [H/M/L] |
| User access/roles | Yes/No | [Role changes, new access requirements] | [H/M/L] |
| SOPs/work instructions | Yes/No | [Procedures requiring update] | [H/M/L] |
| Training | Yes/No | [Users requiring retraining] | [H/M/L] |
| Data migration | Yes/No | [Data transformation or migration needed] | [H/M/L] |
| Audit trail | Yes/No | [Impact on audit trail continuity] | [H/M/L] |

### Regulatory Impact
- [ ] Change affects 21 CFR Part 11 controls
- [ ] Change affects EU Annex 11 controls
- [ ] Change affects data integrity (ALCOA+)
- [ ] Change requires regulatory notification
```

**Erwartet:** Jede Dimension ist mit einem klaren Ja/Nein und einer Begruendung bewertet.
**Bei Fehler:** Kann die Auswirkung nicht ohne Tests bestimmt werden, die Dimension als "Unbekannt — Untersuchung erforderlich" klassifizieren und eine Sandbox-Evaluierung vor der Produktionsaenderung vorschreiben.

### Schritt 3: Revalidierungsumfang bestimmen

Basierend auf der Auswirkungsbewertung die erforderlichen Validierungsaktivitaeten definieren:

```markdown
# Revalidation Determination

| Revalidation Level | Criteria | Activities Required |
|--------------------|----------|-------------------|
| **Full revalidation** | Core functionality changed, new GAMP category, or major version upgrade | URS review, RA update, IQ, OQ, PQ, TM update, VSR |
| **Partial revalidation** | Specific functions affected, configuration changes | Targeted OQ for affected functions, TM update |
| **Documentation only** | No functional impact, administrative changes | Update validation documents, change log entry |
| **None** | No impact on validated state (e.g., cosmetic change) | Change log entry only |

### Determination for CR-[SYS]-[YYYY]-[NNN]
**Revalidation level:** [Full / Partial / Documentation only / None]
**Rationale:** [Specific reasoning based on impact assessment]

### Required Activities
| Activity | Owner | Deadline |
|----------|-------|----------|
| [e.g., Execute OQ test cases TC-OQ-015 through TC-OQ-022] | [Name] | [Date] |
| [e.g., Update traceability matrix for URS-007] | [Name] | [Date] |
| [e.g., Update SOP-LIMS-003 section 4.2] | [Name] | [Date] |
```

**Erwartet:** Revalidierungsumfang ist proportional zur Aenderungsauswirkung — nicht mehr, nicht weniger.
**Bei Fehler:** Wird der Revalidierungsumfang beanstandet, lieber mehr Tests durchfuehren. Untervalidierung ist ein regulatorisches Risiko; Uebervalidierung ist nur ein Ressourcenaufwand.

### Schritt 4: Genehmigung einholen

Die Aenderung durch den entsprechenden Genehmigungsworkflow leiten:

```markdown
# Change Approval

### Approval for: CR-[SYS]-[YYYY]-[NNN]

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| System Owner | | Approve / Reject / Defer | | |
| QA Representative | | Approve / Reject / Defer | | |
| IT Representative | | Approve / Reject / Defer | | |
| Validation Lead | | Approve / Reject / Defer | | |

### Conditions (if any)
[Any conditions attached to the approval]

### Planned Implementation Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Rollback deadline:** [Point of no return]
```

**Erwartet:** Alle erforderlichen Genehmiger haben vor Implementierungsbeginn unterzeichnet (ausser Notfallaenderungen).
**Bei Fehler:** Bei Notfallaenderungen muendliche Genehmigung von Systemeigentuemer und QA einholen, Aenderung implementieren und formale Dokumentation innerhalb von 5 Werktagen abschliessen.

### Schritt 5: Implementieren und verifizieren

Die Aenderung ausfuehren und Nachverifizierung durchfuehren:

```markdown
# Implementation Record

### Pre-Implementation
- [ ] Backup of current system state completed
- [ ] Rollback procedure documented and tested
- [ ] Affected users notified
- [ ] Test environment validated (if applicable)

### Implementation
- **Implemented by:** [Name]
- **Date/Time:** [YYYY-MM-DD HH:MM]
- **Steps performed:** [Detailed implementation steps]
- **Deviations from plan:** [None / Description]

### Post-Change Verification
| Verification | Result | Evidence |
|--------------|--------|----------|
| System accessible and functional | Pass/Fail | [Screenshot/log reference] |
| Changed functionality works as specified | Pass/Fail | [Test case reference] |
| Unchanged functionality unaffected (regression) | Pass/Fail | [Test case reference] |
| Audit trail continuity maintained | Pass/Fail | [Audit trail screenshot] |
| User access controls intact | Pass/Fail | [Access review reference] |

### Closure
- [ ] All verification activities completed successfully
- [ ] Validation documents updated per revalidation determination
- [ ] SOPs updated and effective
- [ ] Training completed for affected users
- [ ] Change record closed in change control system
```

**Erwartet:** Implementierung entspricht dem genehmigten Plan, und alle Verifikationsaktivitaeten sind bestanden.
**Bei Fehler:** Schlaegt die Verifizierung fehl, sofort das Rollback-Verfahren ausfuehren und den Fehler als Abweichung dokumentieren. Nicht ohne QA-Zustimmung weitermachen.

## Validierung

- [ ] Aenderungsanfrage hat eindeutige ID, Beschreibung und Klassifizierung
- [ ] Auswirkungsbewertung deckt alle Dimensionen ab (Software, Daten, Infrastruktur, SOPs, Schulung)
- [ ] Revalidierungsumfang mit Begruendung definiert
- [ ] Alle erforderlichen Genehmigungen vor Implementierung eingeholt (oder innerhalb von 5 Tagen fuer Notfaelle)
- [ ] Vorimplementierungs-Backup und Rollback-Verfahren dokumentiert
- [ ] Nachimplementierungs-Verifizierung zeigt, dass die Aenderung funktioniert und nichts anderes beschaedigt wurde
- [ ] Validierungsdokumente aktualisiert um die Aenderung widerzuspiegeln
- [ ] Aenderungsdatensatz formell geschlossen

## Haeufige Stolperfallen

- **Auswirkungsbewertung bei "kleinen" Aenderungen ueberspringen**: Selbst geringfuegige Aenderungen koennen unerwartete Auswirkungen haben. Ein Konfigurationsschalter, der harmlos erscheint, kann einen Auditpfad deaktivieren oder eine Berechnung aendern.
- **Missbrauch von Notfallaenderungen**: Werden mehr als 10 % der Aenderungen als "Notfall" klassifiziert, wird der Aenderungsprozess umgangen. Notfallkriterien ueberpruefen und verschaerfen.
- **Unvollstaendige Rollback-Planung**: Annehmen, dass Rollback "nur das Backup wiederherstellen" bedeutet, ignoriert Daten, die zwischen Backup und Rollback erstellt wurden. Datendisposition fuer jedes Rollback-Szenario definieren.
- **Genehmigung nach Implementierung**: Rueckwirkende Genehmigung (ausser dokumentierten Notfaellen) ist ein Compliance-Verstoss. Der CCB muss vor Arbeitsbeginn genehmigen.
- **Fehlende Regressionstests**: Nur die geaenderte Funktionalitaet zu pruefen ist unzureichend. Regressionstests muessen bestaetigen, dass bestehende validierte Funktionen unveraendert bleiben.

## Verwandte Skills

- `design-compliance-architecture` — definiert den Governance-Rahmen einschliesslich des Aenderungskontrollausschusses
- `write-validation-documentation` — die durch Aenderungen ausgeloeste Revalidierungsdokumentation erstellen
- `perform-csv-assessment` — vollstaendige CSV-Neubewertung fuer wesentliche Aenderungen mit vollstaendiger Revalidierung
- `write-standard-operating-procedure` — von der Aenderung betroffene SOPs aktualisieren
- `investigate-capa-root-cause` — wenn Aenderungen durch CAPAs ausgeloest werden
