---
name: conduct-gxp-audit
description: >
  GxP-Audit von computergestuetzten Systemen und Prozessen durchfuehren.
  Umfasst Auditplanung, Eroeffnungssitzungen, Beweiserhebung, Befundklassifizierung
  (kritisch/wesentlich/geringfuegig), CAPA-Erstellung, Abschlusssitzungen,
  Berichtserstellung und Nachverfolgungsverifizierung. Anzuwenden fuer
  geplante interne Audits, Lieferantenqualifizierungsaudits,
  Inspektionsbereitschaftsbewertungen, anlassbezogene Audits aufgrund von
  Abweichungen oder Datenintegritaetsbedenken oder regelmaessige
  Konformitaetspruefungen validierter Systeme.
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
  tags: gxp, audit, capa, inspection, compliance, quality-assurance
---

# GxP-Audit durchfuehren

Ein GxP-Audit von computergestuetzten Systemen, Datenintegritaetspraktiken oder regulierten Prozessen planen und durchfuehren.

## Wann verwenden

- Geplantes internes Audit eines validierten computergestuetzten Systems
- Lieferanten-/Herstellerqualifizierungsaudit fuer GxP-relevante Software
- Inspektionsbereitschaftsbewertung vor einer Behoerdeninspektion
- Anlassbezogenes Audit ausgeloest durch Abweichung, Beanstandung oder Datenintegritaetsbedenken
- Regelmaessige Pruefung des Konformitaetsstatus eines validierten Systems

## Eingaben

- **Erforderlich**: Auditumfang (zu auditierendes System, Prozess oder Standort)
- **Erforderlich**: Anwendbare Vorschriften (21 CFR Part 11, EU Annex 11, GMP, GLP, GCP)
- **Erforderlich**: Frueherer Auditbericht und offene CAPA-Punkte
- **Optional**: Systemvalidierungsdokumentation (URS, VP, IQ/OQ/PQ, Rueckverfolgbarkeitsmatrix)
- **Optional**: SOPs, Schulungsunterlagen, Aenderungskontrollprotokolle
- **Optional**: Spezifische Risikobereiche oder Bedenken, die das Audit ausloesen

## Vorgehensweise

### Schritt 1: Auditplan erstellen

```markdown
# Audit Plan
## Document ID: AP-[SYS]-[YYYY]-[NNN]

### 1. Objective
[State the purpose: scheduled, for-cause, supplier qualification, pre-inspection]

### 2. Scope
- **System/Process**: [Name and version]
- **Regulations**: [21 CFR Part 11, EU Annex 11, ICH Q7, etc.]
- **Period**: [Date range of records under review]
- **Exclusions**: [Any areas explicitly out of scope]

### 3. Audit Criteria
| Area | Regulatory Reference | Key Requirements |
|------|---------------------|------------------|
| Electronic records | 21 CFR 11.10 | Controls for closed systems |
| Audit trail | 21 CFR 11.10(e) | Secure, computer-generated, time-stamped |
| Electronic signatures | 21 CFR 11.50 | Manifestation, legally binding |
| Access controls | EU Annex 11, §12 | Role-based, documented |
| Data integrity | MHRA guidance | ALCOA+ principles |
| Change control | ICH Q10 | Documented, assessed, approved |

### 4. Schedule
| Date | Time | Activity | Participants |
|------|------|----------|-------------|
| Day 1 AM | 09:00 | Opening meeting | All |
| Day 1 AM | 10:00 | Document review | Auditor + QA |
| Day 1 PM | 13:00 | System walkthrough | Auditor + IT + System Owner |
| Day 2 AM | 09:00 | Interviews + evidence collection | Auditor + Users |
| Day 2 PM | 14:00 | Finding consolidation | Auditor |
| Day 2 PM | 16:00 | Closing meeting | All |

### 5. Audit Team
| Role | Name | Responsibility |
|------|------|---------------|
| Lead Auditor | [Name] | Plan, execute, report |
| Subject Matter Expert | [Name] | Technical assessment |
| Auditee Representative | [Name] | Facilitate access and information |
```

**Erwartet:** Auditplan mindestens 2 Wochen vor dem Audit vom Qualitaetsmanagement genehmigt und dem Auditierten kommuniziert.
**Bei Fehler:** Neu terminieren, wenn der Auditierte erforderliche Dokumente oder Personal nicht bereitstellen kann.

### Schritt 2: Eroeffnungssitzung durchfuehren

Tagesordnung:
1. Auditteam und Rollen vorstellen
2. Umfang, Zeitplan und Logistik bestaetigen
3. Befundklassifizierungssystem erklaeren (kritisch/wesentlich/geringfuegig)
4. Vertraulichkeitsvereinbarungen bestaetigen
5. Begleiter und Dokumentenverantwortliche beim Auditierten benennen
6. Fragen klaeren

**Erwartet:** Eroeffnungssitzung mit Anwesenheitsliste dokumentiert.
**Bei Fehler:** Sind Schluesskelpersonen nicht verfuegbar, betroffene Auditaktivitaeten neu planen.

### Schritt 3: Nachweise erheben und pruefen

Dokumente und Aufzeichnungen gegen die Auditkriterien pruefen:

#### 3a. Pruefung der Validierungsdokumentation
- [ ] URS vorhanden und genehmigt
- [ ] Validierungsplan entspricht Systemkategorie und Risiko
- [ ] IQ/OQ/PQ-Protokolle mit dokumentierten Ergebnissen ausgefuehrt
- [ ] Rueckverfolgbarkeitsmatrix verknuepft Anforderungen mit Testergebnissen
- [ ] Abweichungen dokumentiert und behoben
- [ ] Validierungszusammenfassungsbericht genehmigt

#### 3b. Pruefung der betrieblichen Kontrollen
- [ ] SOPs aktuell und genehmigt
- [ ] Schulungsunterlagen belegen Kompetenz aller Nutzer
- [ ] Aenderungskontrollunterlagen vollstaendig (Antrag, Bewertung, Genehmigung, Verifizierung)
- [ ] Vorfall-/Abweichungsberichte gemaess SOP behandelt
- [ ] Regelmaessige Pruefung termingerecht durchgefuehrt

#### 3c. Datenintegritaetsbewertung
- [ ] Auditpfad aktiviert und fuer Nutzer nicht aenderbar
- [ ] Elektronische Signaturen erfuellen regulatorische Anforderungen
- [ ] Sicherungs- und Wiederherstellungsverfahren dokumentiert und getestet
- [ ] Zugriffskontrollen setzen rollenbasierte Berechtigungen durch
- [ ] Daten sind zuzuordnen, leserlich, zeitgleich erfasst, original und korrekt (ALCOA+)

#### 3d. Systemkonfigurationspruefung
- [ ] Produktionskonfiguration entspricht dem validierten Zustand
- [ ] Benutzerkonten geprueft — keine geteilten Konten, inaktive Konten deaktiviert
- [ ] Systemuhren synchronisiert und korrekt
- [ ] Sicherheitspatches gemaess genehmigter Aenderungskontrolle eingespielt

**Erwartet:** Nachweise als Screenshots, Dokumentkopien, Interviewnotizen mit Zeitstempeln gesammelt.
**Bei Fehler:** "Nicht verifizierbar" als Beobachtung erfassen und den Grund notieren.

### Schritt 4: Befunde klassifizieren

Jeden Befund nach Schweregrad klassifizieren:

| Klassifizierung | Definition | Erforderliche Reaktion |
|---------------|------------|-------------------|
| **Kritisch** | Direkter Einfluss auf Produktqualitaet, Patientensicherheit oder Datenintegritaet. Systematisches Versagen einer Schluesselkontrolle. | Sofortige Eindaemmung + CAPA innerhalb 15 Werktage |
| **Wesentlich** | Erhebliche Abweichung von GxP-Anforderungen. Potenzieller Einfluss auf Datenintegritaet bei fehlender Korrektur. | CAPA innerhalb 30 Werktage |
| **Geringfuegig** | Isolierte Abweichung vom Verfahren. Kein direkter Einfluss auf Datenintegritaet oder Produktqualitaet. | Korrektur innerhalb 60 Werktage |
| **Beobachtung** | Verbesserungsmoeglichkeit. Keine regulatorische Anforderung. | Optional — fuer Trendanalyse verfolgt |

Jeden Befund dokumentieren:

```markdown
## Finding F-[NNN]
**Classification:** [Critical / Major / Minor / Observation]
**Area:** [Audit trail / Access control / Change control / etc.]
**Reference:** [Regulatory clause, e.g., 21 CFR 11.10(e)]

**Observation:**
[Objective description of what was found]

**Evidence:**
[Document ID, screenshot reference, interview notes]

**Regulatory Expectation:**
[What the regulation requires]

**Risk:**
[Impact on data integrity, product quality, or patient safety]
```

**Erwartet:** Jeder Befund hat Klassifizierung, Nachweis und regulatorische Referenz.
**Bei Fehler:** Wird die Klassifizierung beanstandet, an den Auditprogrammverantwortlichen zur Klaerug eskalieren.

### Schritt 5: Abschlusssitzung durchfuehren

Tagesordnung:
1. Befundszusammenfassung praesentieren (keine neuen Befunde sollen mehr gemeldet werden)
2. Befundklassifizierungen durchgehen
3. Vorlaeutige CAPA-Erwartungen und Zeitplaene besprechen
4. Naechste Schritte und Berichtszeitplan bestaetigen
5. Kooperation des Auditierten wuerdigen

**Erwartet:** Abschlusssitzung mit Anwesenheitsliste dokumentiert. Auditierter erkennt Befunde an (Anerkennung ≠ Zustimmung).
**Bei Fehler:** Bestreitet der Auditierte einen Befund, die Uneinigkeit dokumentieren und gemaess SOP eskalieren.

### Schritt 6: Auditbericht erstellen

```markdown
# Audit Report
## Document ID: AR-[SYS]-[YYYY]-[NNN]

### 1. Executive Summary
An audit of [System/Process] was conducted on [dates] against [regulations].
[N] findings were identified: [n] critical, [n] major, [n] minor, [n] observations.

### 2. Scope and Methodology
[Summarize audit plan scope, criteria, and methods used]

### 3. Findings Summary
| Finding ID | Classification | Area | Brief Description |
|-----------|---------------|------|-------------------|
| F-001 | Major | Audit trail | Audit trail disabled for batch record module |
| F-002 | Minor | Training | Two users missing annual GxP training |
| F-003 | Observation | Documentation | SOP formatting inconsistencies |

### 4. Detailed Findings
[Include full finding details from Step 4 for each finding]

### 5. Positive Observations
[Document areas of good practice observed during the audit]

### 6. Conclusion
The overall compliance status is assessed as [Satisfactory / Needs Improvement / Unsatisfactory].

### 7. Distribution
| Recipient | Role |
|-----------|------|
| [Name] | System Owner |
| [Name] | QA Director |
| [Name] | IT Manager |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Auditor | | | |
| QA Director | | | |
```

**Erwartet:** Bericht innerhalb von 15 Werktagen nach der Abschlusssitzung ausgegeben.
**Bei Fehler:** Verzoegert sich die Ausgabe um mehr als 15 Tage, Stakeholder benachrichtigen und Grund dokumentieren.

### Schritt 7: CAPA verfolgen und Wirksamkeit verifizieren

Fuer jeden Befund, der eine CAPA erfordert:

```markdown
## CAPA Tracking
| Finding ID | CAPA ID | Root Cause | Corrective Action | Due Date | Status | Effectiveness Check |
|-----------|---------|------------|-------------------|----------|--------|-------------------|
| F-001 | CAPA-2025-042 | Configuration oversight during upgrade | Enable audit trail, verify all modules | 2025-04-15 | Open | Scheduled 2025-07-15 |
| F-002 | CAPA-2025-043 | Training matrix not updated | Complete training, update tracking | 2025-05-01 | Open | Scheduled 2025-08-01 |
```

**Erwartet:** CAPAs sind zugewiesen, verfolgt und die Wirksamkeit gemaess definiertem Zeitplan verifiziert.
**Bei Fehler:** Ungeloeste CAPAs werden an das QA-Management eskaliert und im naechsten Auditzyklus markiert.

## Validierung

- [ ] Auditplan genehmigt und vor dem Audit kommuniziert
- [ ] Eroeffnungs- und Abschlusssitzungen mit Anwesenheitslisten dokumentiert
- [ ] Nachweise mit Zeitstempeln und Quellenangaben gesammelt
- [ ] Jeder Befund hat Klassifizierung, Nachweis und regulatorische Referenz
- [ ] Auditbericht innerhalb von 15 Werktagen ausgegeben
- [ ] CAPAs mit Faelligkeitsterminen fuer alle kritischen und wesentlichen Befunde zugewiesen
- [ ] Frueherer CAPAs auf Abschlusswirksamkeit geprueft

## Haeufige Stolperfallen

- **Umfangsausweitung**: Ausweitung des Auditumfangs waehrend der Durchfuehrung ohne formale Vereinbarung fuehrt zu unvollstaendiger Abdeckung und Streitigkeiten.
- **Meinungsbasierte Befunde**: Befunde muessen auf spezifische regulatorische Anforderungen verweisen, nicht auf persoenliche Praeferenzen.
- **Gegnerischer Ton**: Audits sind gemeinsame Qualitaetsverbesserungsuebungen, keine Verhoere.
- **Positives ignorieren**: Nur Befunde zu berichten ohne gute Praktiken anzuerkennen untergaebt das Vertrauen.
- **Keine Wirksamkeitspruefung**: Eine CAPA ohne Verifizierung der Fehlerbehebung zu schliessen ist eine wiederkehrende regulatorische Zitation.

## Verwandte Skills

- `perform-csv-assessment` — vollstaendige CSV-Lebenszyklus-Bewertung (URS bis Validierungszusammenfassung)
- `setup-gxp-r-project` — Projektstruktur fuer validierte R-Umgebungen
- `implement-audit-trail` — Auditpfad-Implementierung fuer elektronische Aufzeichnungen
- `write-validation-documentation` — IQ/OQ/PQ-Protokoll- und Berichtserstellung
- `security-audit-codebase` — sicherheitsorientiertes Code-Audit (komplementaere Perspektive)
