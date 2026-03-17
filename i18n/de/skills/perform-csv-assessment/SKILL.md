---
name: perform-csv-assessment
description: >
  Computervalidierungsbewertung (CSV) nach GAMP-5-Methodik durchfuehren.
  Umfasst Benutzeranforderungen, Risikobewertung, IQ/OQ/PQ-Planung,
  Erstellung einer Rueckverfolgbarkeitsmatrix und Erstellung des
  Validierungszusammenfassungsberichts. Anzuwenden wenn ein neues
  computergestuetztes System in einer GxP-Umgebung eingefuehrt wird,
  ein bestehendes validiertes System eine wesentliche Aenderung erfahert,
  eine regelmaessige Revalidierung erforderlich ist oder eine Behoerdeninspektion
  eine Validierungslueckenanalyse fordert.
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
  tags: csv, gamp-5, validation, risk-assessment, iq-oq-pq, traceability
---

# CSV-Bewertung durchfuehren

Eine Computervalidierungsbewertung (CSV) nach GAMP-5-risikobasierter Methodik fuer regulierte Umgebungen durchfuehren.

## Wann verwenden

- Ein neues computergestuetztes System wird in eine GxP-Umgebung eingefuehrt
- Ein bestehendes validiertes System erhaelt eine wesentliche Aenderung
- Regelmaessige Revalidierung ist erforderlich
- Vorbereitung einer Behoerdeninspektion erfordert eine Validierungslueckenanalyse

## Eingaben

- **Erforderlich**: Systembeschreibung (Name, Zweck, Anbieter, Version)
- **Erforderlich**: Bestimmungsgemaesse Verwendungserklaerung und regulatorischer Kontext (GxP-Umfang)
- **Erforderlich**: GAMP-5-Softwarekategorie (1-5)
- **Optional**: Vorhandene Benutzeranforderungsspezifikation (URS)
- **Optional**: Anbieterdokumentation (Designspezifikationen, Release Notes, SOPs)
- **Optional**: Fruehere Validierungsdokumentation

## Vorgehensweise

### Schritt 1: GAMP-5-Softwarekategorie bestimmen

Das System klassifizieren:

| Kategorie | Typ | Beispiel | Validierungsaufwand |
|----------|------|---------|-------------------|
| 1 | Infrastruktursoftware | Betriebssystem, Firmware | Gering — Installation verifizieren |
| 3 | Nicht-konfiguriertes Produkt | COTS ohne Anpassung | Gering-Mittel — Funktionalitaet pruefen |
| 4 | Konfiguriertes Produkt | LIMS mit Konfiguration | Mittel-Hoch — Konfiguration pruefen |
| 5 | Benutzerdefinierte Anwendung | Massgeschneiderte R/Shiny-App | Hoch — vollstaendiger Lebenszyklus |

**Erwartet:** Kategorie klar zugewiesen mit dokumentierter Begruendung.
**Bei Fehler:** Ist die Kategorie mehrdeutig, zur hoeheren Kategorie wechseln und die Begruendung dokumentieren.

### Schritt 2: Benutzeranforderungsspezifikation (URS) erstellen

Ein URS-Dokument mit nummerierten Anforderungen erstellen:

```markdown
# User Requirements Specification
## System: [System Name] v[Version]
## Document ID: URS-[SYS]-[NNN]

### 1. Purpose
[Intended use statement]

### 2. Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-001 | System shall calculate BMI from height and weight inputs | Must | Regulatory SOP-xxx |
| URS-002 | System shall generate audit trail entries for all data changes | Must | 21 CFR 11.10(e) |
| URS-003 | System shall export results in PDF format | Should | User request |

### 3. Non-Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-010 | System shall respond within 3 seconds for standard queries | Should | Usability |
| URS-011 | System shall restrict access via role-based authentication | Must | 21 CFR 11.10(d) |

### 4. Data Integrity Requirements
[ALCOA+ requirements: Attributable, Legible, Contemporaneous, Original, Accurate]

### 5. Regulatory Requirements
[Specific 21 CFR Part 11, EU Annex 11, or other applicable requirements]
```

**Erwartet:** Alle Anforderungen haben eindeutige IDs, Prioritaeten und Rueckverfolgbarkeit zur Quelle.
**Bei Fehler:** Anforderungen ohne klare Quelle oder Prioritaet zur Pruefung durch die Stakeholder kennzeichnen.

### Schritt 3: Risikobewertung durchfuehren

GAMP-5-risikobasierten Ansatz mit einer Fehlermodus- und Auswirkungsanalyse (FMEA) anwenden:

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

Risikoprioritaetszahl (RPN) = Schweregrad x Wahrscheinlichkeit x Erkennbarkeit.

| RPN-Bereich | Risikoniveau | Pruefanforderung |
|-----------|------------|---------------------|
| 1-12 | Gering | Grundlegende Verifizierung |
| 13-36 | Mittel | Dokumentierter Testfall |
| 37+ | Hoch | Vollstaendiges IQ/OQ/PQ mit Retest |

**Erwartet:** Jede URS-Anforderung hat eine entsprechende Zeile in der Risikobewertung.
**Bei Fehler:** Nicht bewertete Anforderungen vor dem Fortfahren an den Validierungsleiter eskalieren.

### Schritt 4: Validierungsstrategie definieren (Validierungsplan)

```markdown
# Validation Plan
## Document ID: VP-[SYS]-[NNN]

### Scope
- System: [Name] v[Version]
- GAMP Category: [N]
- Validation approach: [Prospective / Retrospective / Concurrent]

### Qualification Stages
| Stage | Scope | Applies? | Rationale |
|-------|-------|----------|-----------|
| IQ | Installation correctness | Yes | Verify installation, dependencies, configuration |
| OQ | Operational requirements | Yes | Verify functional requirements from URS |
| PQ | Performance under real conditions | [Yes/No] | [Rationale] |

### Roles and Responsibilities
| Role | Name | Responsibility |
|------|------|---------------|
| Validation Lead | [Name] | Plan, coordinate, approve |
| Tester | [Name] | Execute test scripts |
| System Owner | [Name] | Approve for production use |
| QA | [Name] | Review and sign-off |

### Acceptance Criteria
- All critical test cases pass
- No unresolved critical or major deviations
- Traceability matrix complete
```

**Erwartet:** Validierungsplan vor der Testausfuehrung von allen Stakeholdern genehmigt.
**Bei Fehler:** Ohne genehmigten Validierungsplan nicht mit der Testausfuehrung beginnen.

### Schritt 5: Testprotokolle erstellen (IQ/OQ/PQ)

Testskripte fuer jede Qualifizierungsphase erstellen:

```markdown
# Operational Qualification Protocol
## Test Case: TC-OQ-001
## Traces to: URS-001

**Objective:** Verify BMI calculation accuracy

**Prerequisites:**
- System installed per IQ protocol
- Test data set prepared

**Test Steps:**
| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Enter height=180cm, weight=75kg | BMI displayed as 23.15 | | |
| 2 | Enter height=160cm, weight=90kg | BMI displayed as 35.16 | | |
| 3 | Enter height=0, weight=75kg | Error message displayed | | |

**Tester:** _________ Date: _________
**Reviewer:** _________ Date: _________
```

**Erwartet:** Jede Anforderung mit mittlerem und hohem Risiko hat mindestens einen Testfall.
**Bei Fehler:** Fehlende Testfaelle vor dem Start der Ausfuehrung hinzufuegen.

### Schritt 6: Rueckverfolgbarkeitsmatrix aufbauen

Eine Anforderungsrueckverfolgbarkeitsmatrix (RTM) erstellen, die jede Anforderung ueber die Risikobewertung mit den Testfaellen verknuepft:

```markdown
# Traceability Matrix
## Document ID: TM-[SYS]-[NNN]

| URS ID | Requirement | Risk Level | Test Case(s) | Test Result | Status |
|--------|-------------|------------|--------------|-------------|--------|
| URS-001 | BMI calculation | Low | TC-OQ-001 | Pass | Verified |
| URS-002 | Audit trail | High | TC-IQ-003, TC-OQ-005 | Pass | Verified |
| URS-003 | PDF export | Low | TC-OQ-008 | Pass | Verified |
| URS-011 | Role-based access | Medium | TC-OQ-010, TC-OQ-011 | Pass | Verified |
```

**Erwartet:** 100 % der URS-Anforderungen erscheinen in der Rueckverfolgbarkeitsmatrix mit verknuepften Testergebnissen.
**Bei Fehler:** Jede Anforderung ohne verknuepftes Testergebnis wird als Validierungsluecke markiert.

### Schritt 7: Validierungszusammenfassungsbericht erstellen

```markdown
# Validation Summary Report
## Document ID: VSR-[SYS]-[NNN]

### 1. Executive Summary
[System name] v[version] has been validated in accordance with [VP document ID].

### 2. Validation Activities Performed
| Activity | Document ID | Status |
|----------|-------------|--------|
| User Requirements | URS-SYS-001 | Approved |
| Risk Assessment | RA-SYS-001 | Approved |
| Validation Plan | VP-SYS-001 | Approved |
| IQ Protocol/Report | IQ-SYS-001 | Executed — Pass |
| OQ Protocol/Report | OQ-SYS-001 | Executed — Pass |
| Traceability Matrix | TM-SYS-001 | Complete |

### 3. Deviations
| Dev ID | Description | Impact | Resolution |
|--------|-------------|--------|------------|
| DEV-001 | [Description] | [Impact assessment] | [Resolution and rationale] |

### 4. Conclusion
The system meets all user requirements as documented in [URS ID]. The validation is considered [Successful / Successful with conditions].

### 5. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Validation Lead | | | |
| System Owner | | | |
| Quality Assurance | | | |
```

**Erwartet:** Bericht referenziert alle Validierungsliefergegenstände mit klarer Bestanden/Fehlgeschlagen-Schlussfolgerung.
**Bei Fehler:** Sind Abweichungen unbehoben, muss der Bericht den Status "bedingt" mit CAPA-Referenzen angeben.

## Validierung

- [ ] GAMP-5-Kategorie mit dokumentierter Begruendung zugewiesen
- [ ] URS hat nummerierte Anforderungen mit Prioritaeten und Quellrueckverfolgbarkeit
- [ ] Risikobewertung deckt jede URS-Anforderung ab
- [ ] Validierungsplan vor der Testausfuehrung genehmigt
- [ ] Testprotokolle haben Voraussetzungs-, Schritt-, Erwartungsergebnis- und Signaturfelder
- [ ] Rueckverfolgbarkeitsmatrix verknuepft jede Anforderung mit Risiko und Testergebnissen
- [ ] Validierungszusammenfassungsbericht dokumentiert alle Aktivitaeten, Abweichungen und Schlussfolgerungen
- [ ] Alle Dokumente haben eindeutige Dokument-IDs und Versionskontrolle

## Haeufige Stolperfallen

- **Uebervalidierung**: Category-5-Aufwand auf Category-3-Software anwenden verschwendet Ressourcen. Aufwand dem Risiko anpassen.
- **Fehlende Rueckverfolgbarkeit**: Anforderungen ohne Rueckverfolgbarkeit zu Testfaellen sind unsichtbare Luecken.
- **Testen ohne Plan**: Tests vor Genehmigung des Validierungsplans auszufuehren macht die Ergebnisse ungueltug.
- **Nichtfunktionale Anforderungen ignorieren**: Sicherheits-, Leistungs- und Datenintegritaetsanforderungen werden haeufig uebersehen.
- **Statische Validierung**: Validierung als Einmalereignis behandeln. Aenderungen erfordern eine Neubewertung.

## Verwandte Skills

- `setup-gxp-r-project` — Projektstruktur fuer validierte R-Umgebungen
- `write-validation-documentation` — IQ/OQ/PQ-Protokoll- und Berichtserstellung
- `implement-audit-trail` — Auditpfad-Implementierung fuer elektronische Aufzeichnungen
- `validate-statistical-output` — Methodik zur Verifizierung statistischer Ausgaben
- `conduct-gxp-audit` — Auditierung validierter Systeme
