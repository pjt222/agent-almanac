---
name: write-validation-documentation
description: >
  IQ/OQ/PQ-Validierungsdokumentation fuer computergestuetzte Systeme
  in regulierten Umgebungen erstellen. Umfasst Protokolle, Berichte,
  Testskripte, Abweichungsbehandlung und Genehmigungsworkflows. Anzuwenden
  bei der Validierung von R oder anderer Software fuer den regulierten Einsatz,
  bei der Vorbereitung eines Behoerdenaudits, bei der Dokumentation der
  Qualifizierung von Rechenumgebungen oder beim Erstellen und Aktualisieren
  von Validierungsprotokollen und -berichten fuer neue oder neu qualifizierte
  Systeme.
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
  language: R
  tags: validation, iq-oq-pq, documentation, gxp, qualification
---

# Validierungsdokumentation erstellen

Vollstaendige IQ/OQ/PQ-Validierungsdokumentation fuer computergestuetzte Systeme erstellen.

## Wann verwenden

- Validierung von R oder anderer Software fuer den regulierten Einsatz
- Vorbereitung eines Behoerdenaudits
- Dokumentation der Qualifizierung von Rechenumgebungen
- Erstellen oder Aktualisieren von Validierungsprotokollen und -berichten

## Eingaben

- **Erforderlich**: Zu validierendes System/Software (Name, Version, Zweck)
- **Erforderlich**: Validierungsplan mit Definition von Umfang und Strategie
- **Erforderlich**: Benutzeranforderungsspezifikation
- **Optional**: Vorhandene SOP-Vorlagen
- **Optional**: Fruehere Validierungsdokumentation (fuer Requalifizierung)

## Vorgehensweise

### Schritt 1: Installationsqualifizierungs-(IQ-)Protokoll erstellen

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

**Erwartet:** `validation/iq/iq_protocol.md` ist vollstaendig mit eindeutiger Dokument-ID, Zielsetzung, Voraussetzungscheckliste, Testfaellen fuer R-Installation und jedes erforderliche Paket, Abweichungsabschnitt und Genehmigungsfeldern.

**Bei Fehler:** Erfordert die Organisation ein anderes Dokumentformat, die Vorlage entsprechend anpassen, dabei jedoch die Pflichtfelder (Anforderung, Vorgehensweise, Erwartetes Ergebnis, Tatsaechliches Ergebnis, Bestanden/Fehlgeschlagen) unabhaengig vom Format beibehalten.

### Schritt 2: Operationsqualifizierungs-(OQ-)Protokoll erstellen

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

**Erwartet:** `validation/oq/oq_protocol.md` enthaelt Testfaelle fuer Datenimport, statistische Berechnungen und Fehlerbehandlung, jeweils mit spezifischen Testdaten, Erwartungswerten (mit Toleranzen, wo zutreffend) und Nachweisanforderungen.

**Bei Fehler:** Sind Testdaten noch nicht vorhanden, synthetische Testdatensaetze mit bekannten Eigenschaften erstellen. Die Datenerzeugungsmethode dokumentieren, damit Ergebnisse unabhaengig verifiziert werden koennen.

### Schritt 3: Leistungsqualifizierungs-(PQ-)Protokoll erstellen

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

**Erwartet:** `validation/pq/pq_protocol.md` enthaelt End-to-End-Testfaelle mit realen (oder repraesentativen) Daten, wobei die Ergebnisse gegen eine unabhaengige Referenzberechnung (z. B. SAS-Ausgabe) verglichen werden. Toleranzen sind explizit definiert.

**Bei Fehler:** Sind keine unabhaengigen Referenzergebnisse verfuegbar, die Luecke dokumentieren und Doppelprogrammierung (zwei unabhaengige R-Implementierungen) als alternative Verifizierungsmethode verwenden. PQ als vorlaeufig kennzeichnen, bis die unabhaengige Verifizierung abgeschlossen ist.

### Schritt 4: Qualifizierungsberichte erstellen

Nach Ausfuehren der Protokolle die Ergebnisse dokumentieren:

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

**Erwartet:** Qualifizierungsberichte (IQ, OQ, PQ) sind vollstaendig mit allen eingetragenen Testergebnissen, dokumentierten Abweichungen (oder "Keine beobachtet"), formulierten Schlussfolgerungen und Genehmigungsfeldern zur Unterzeichnung.

**Bei Fehler:** Sind waehrend der Ausfuehrung Testfehler aufgetreten, jeden Fehler als Abweichung mit Grundursachenanalyse und Behebung dokumentieren. Abweichungsabschnitte nicht leer lassen, wenn Fehler beobachtet wurden.

### Schritt 5: Automatisierung wo moeglich

Automatisierte Testskripte erstellen, die Nachweise generieren:

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

**Erwartet:** Automatisierte Skripte in `validation/scripts/` erzeugen Nachweisdateien (z. B. `iq_evidence.txt`) mit zeitgestempelten Ergebnissen fuer jeden Testfall, wodurch manuelle Dateneingabe reduziert und Reproduzierbarkeit sichergestellt wird.

**Bei Fehler:** Schlagen automatisierte Skripte aufgrund von Umgebungsunterschieden fehl, manuell ausfuehren und Ausgabe mit `sink()` erfassen. Unterschiede zwischen automatisierter und manueller Ausfuehrung im Qualifizierungsbericht dokumentieren.

## Validierung

- [ ] Alle Protokolle haben eindeutige Dokument-IDs
- [ ] Protokolle referenzieren den Validierungsplan
- [ ] Testfaelle haben klare Bestanden/Fehlgeschlagen-Kriterien
- [ ] Berichte enthalten alle ausgefuehrten Testergebnisse
- [ ] Abweichungen sind mit Behebungen dokumentiert
- [ ] Genehmigungsunterschriften sind eingeholt
- [ ] Dokumente entsprechen den SOP-Vorlagen der Organisation

## Haeufige Stolperfallen

- **Vage Abnahmekriterien**: "System funktioniert korrekt" ist nicht pruefbar. Exakte Erwartungswerte angeben.
- **Fehlende Nachweise**: Jedes Testergebnis benoetigt begleitende Nachweise (Screenshots, Protokolle, Ausgabedateien)
- **Unvollstaendige Abweichungsbehandlung**: Alle Fehler muessen dokumentiert, untersucht und behoben werden
- **Keine Versionskontrolle fuer Dokumente**: Validierungsdokumente benoetigen Aenderungskontrolle genauso wie Code
- **Requalifizierung ueberspringen**: Systemaktualisierungen (R-Version, Paketaktualisierungen) erfordern eine Requalifizierungsbewertung

## Verwandte Skills

- `setup-gxp-r-project` - Projektstruktur fuer validierte Umgebungen
- `implement-audit-trail` - Verfolgung elektronischer Aufzeichnungen
- `validate-statistical-output` - Methodik zur Ausgabevalidierung
