---
name: monitor-data-integrity
description: >
  Datenintegritaets-Ueberwachungsprogramm auf Basis von ALCOA+-Prinzipien
  entwerfen und betreiben. Umfasst Detektivkontrollen, Auditpfad-Pruefungsplaene,
  Anomalieerkennungsmuster (ausserhalb der Geschaeftszeiten, sequenzielle
  Aenderungen, Massenanpassungen), Metrik-Dashboards, Untersuchungsausloeser
  und Definition der Eskalationsmatrix. Anzuwenden beim Aufbau eines
  Datenintegritaets-Ueberwachungsprogramms fuer GxP-Systeme, bei der
  Inspektionsvorbereitung wo Datenintegritaet ein Schwerpunkt ist, nach einem
  Datenintegritaetsvorfall mit erweiterter Ueberwachung oder bei der
  Implementierung von MHRA-, WHO- oder PIC/S-Leitlinien.
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
  tags: gxp, data-integrity, alcoa, monitoring, anomaly-detection, compliance
---

# Datenintegritaet ueberwachen

Ein Programm entwerfen und betreiben, das Datenintegritaet ueber validierte Systeme hinweg kontinuierlich ueberwacht, unter Anwendung von ALCOA+-Prinzipien und Anomalieerkennung.

## Wann verwenden

- Aufbau eines Datenintegritaets-Ueberwachungsprogramms fuer GxP-Systeme
- Vorbereitung einer Behoerdeninspektion, bei der Datenintegritaet ein Schwerpunktbereich ist
- Nach einem Datenintegritaetsvorfall mit erweiterter Ueberwachung
- Regelmaessige Ueberpruefung bestehender Datenintegritaetskontrollen
- Implementierung der MHRA-, WHO- oder PIC/S-Datenintegritaetsleitlinien

## Eingaben

- **Erforderlich**: Systeme im Umfang und ihr ALCOA+-Risikoprofil
- **Erforderlich**: Anwendbare Leitlinien (MHRA Data Integrity, WHO TRS 996, PIC/S PI 041)
- **Erforderlich**: Aktuelle Auditpfad-Faehigkeiten jedes Systems
- **Optional**: Frueherer Datenintegritaetsbefunde oder regulatorische Beobachtungen
- **Optional**: Bestehende Ueberwachungsverfahren oder Metriken
- **Optional**: Benutzerzugangsmatrizen und Rollendefinitionen

## Vorgehensweise

### Schritt 1: Aktuelle ALCOA+-Situation beurteilen

Jedes System gegen alle ALCOA+-Prinzipien bewerten:

```markdown
# Data Integrity Assessment
## Document ID: DIA-[SITE]-[YYYY]-[NNN]

### ALCOA+ Assessment Matrix

| Principle | Definition | Assessment Questions | System 1 | System 2 |
|-----------|-----------|---------------------|----------|----------|
| **Attributable** | Who performed the action and when? | Are all entries linked to unique user IDs? Is the timestamp system-generated? | G/A/R | G/A/R |
| **Legible** | Can data be read and understood? | Are records readable throughout retention period? Are formats controlled? | G/A/R | G/A/R |
| **Contemporaneous** | Was data recorded at the time of the activity? | Are timestamps real-time? Are backdated entries detectable? | G/A/R | G/A/R |
| **Original** | Is this the first-captured data? | Are original records preserved? Is there a clear original vs copy distinction? | G/A/R | G/A/R |
| **Accurate** | Is the data correct and truthful? | Are calculations verified? Are transcription errors detectable? | G/A/R | G/A/R |
| **Complete** | Is all data present? | Are deletions detectable? Are all expected records present? | G/A/R | G/A/R |
| **Consistent** | Are data elements consistent across records? | Do timestamps follow logical sequence? Are versions consistent? | G/A/R | G/A/R |
| **Enduring** | Will data survive for the required retention period? | Is the storage medium reliable? Are backups verified? | G/A/R | G/A/R |
| **Available** | Can data be accessed when needed? | Are retrieval procedures documented? Are access controls appropriate? | G/A/R | G/A/R |

Rating: G = Good (controls adequate), A = Adequate (minor improvements needed), R = Remediation required
```

**Erwartet:** Jedes System hat eine bewertete ALCOA+-Bewertung mit spezifischen Erkenntnissen fuer jedes Prinzip.
**Bei Fehler:** Kann ein System nicht bewertet werden (z. B. keine Auditpfad-Faehigkeit), es als kritische Luecke kennzeichnen, die sofortige Behebung erfordert.

### Schritt 2: Detektivkontrollen entwerfen

Die Ueberwachungsaktivitaeten definieren, die Datenintegritaetsverletzungen erkennen:

```markdown
# Detective Controls Design
## Document ID: DCD-[SITE]-[YYYY]-[NNN]

### Audit Trail Review Schedule
| System | Review Type | Frequency | Reviewer | Scope |
|--------|-----------|-----------|----------|-------|
| LIMS | Comprehensive | Monthly | QA | All data modifications, deletions, and access events |
| ERP | Targeted | Weekly | QA | Batch record modifications and approvals |
| R/Shiny | Comprehensive | Per analysis | Statistician | All input/output/parameter changes |

### Review Checklist
For each audit trail review cycle:
- [ ] All data modifications have documented justification
- [ ] No unexplained deletions or void entries
- [ ] Timestamps are sequential and consistent with business operations
- [ ] No off-hours activity without documented justification
- [ ] No shared account usage detected
- [ ] Failed login attempts are within normal thresholds
- [ ] No privilege escalation events outside change control
```

**Erwartet:** Detektivkontrollen sind terminiert, zugewiesen und mit klaren Pruefkriterien dokumentiert.
**Bei Fehler:** Werden Auditpfad-Ueberpruefungen nicht termingerecht durchgefuehrt, die Luecke dokumentieren und an das QA-Management eskalieren. Versaeumte Pruefungen haeufen Risiken an.

### Schritt 3: Anomalieerkennungsmuster definieren

Spezifische Muster erstellen, die Untersuchungen ausloesen:

```markdown
# Anomaly Detection Patterns

### Pattern 1: Off-Hours Activity
**Trigger:** Data creation, modification, or deletion outside business hours (defined as [06:00-20:00 local time, Monday-Friday])
**Threshold:** Any GxP-critical data modification outside defined hours
**Response:** Verify with user and supervisor within 2 business days
**Exceptions:** Documented shift work, approved overtime, automated processes

### Pattern 2: Sequential Modifications
**Trigger:** Multiple modifications to the same record within a short timeframe
**Threshold:** >3 modifications to the same record within 60 minutes
**Response:** Review modification reasons; verify each change has documented justification
**Exceptions:** Initial data entry corrections within [grace period, e.g., 30 minutes]

### Pattern 3: Bulk Changes
**Trigger:** Unusually high volume of data modifications by a single user
**Threshold:** >50 modifications per user per day (baseline: [calculate from normal usage])
**Response:** Verify business justification for bulk activity
**Exceptions:** Documented batch operations, data migration activities under change control

### Pattern 4: Delete/Void Spikes
**Trigger:** Unusual number of record deletions or voidings
**Threshold:** >5 delete/void events per user per week
**Response:** Immediate QA review of deleted/voided records
**Exceptions:** None — all delete/void events require documented justification

### Pattern 5: Privilege Escalation
**Trigger:** User access changes granting administrative or elevated privileges
**Threshold:** Any privilege change outside the user access management SOP
**Response:** Verify with IT security and system owner within 24 hours
**Exceptions:** Emergency access per documented emergency access procedure

### Pattern 6: Audit Trail Gaps
**Trigger:** Missing or interrupted audit trail entries
**Threshold:** Any gap > 0 entries (audit trail should be continuous)
**Response:** Immediate investigation — potential system malfunction or tampering
**Exceptions:** None — audit trail gaps are always critical
```

**Erwartet:** Muster sind spezifisch, messbar und handlungsrelevant mit definierten Schwellenwerten und Reaktionsverfahren.
**Bei Fehler:** Sind Schwellenwerte zu niedrig (zu viele Fehlalarme), auf Basis von Basisdaten anpassen. Sind sie zu hoch (echte Probleme werden uebersehen), nach dem ersten Ueberwachungszyklus verschaerfen.

### Schritt 4: Metrik-Dashboard aufbauen

```markdown
# Data Integrity Metrics Dashboard
## Document ID: DIMD-[SITE]-[YYYY]-[NNN]

### Key Performance Indicators

| KPI | Metric | Target | Yellow Threshold | Red Threshold | Source |
|-----|--------|--------|-----------------|---------------|--------|
| DI-01 | Audit trail review completion rate | 100% | <95% | <90% | Review log |
| DI-02 | Anomalies detected per month | Trending down | >10% increase MoM | >25% increase MoM | Anomaly log |
| DI-03 | Anomaly investigation closure rate | <15 business days | >15 days | >30 days | Investigation log |
| DI-04 | Open data integrity CAPAs | 0 overdue | 1-2 overdue | >2 overdue | CAPA tracker |
| DI-05 | Shared account instances detected | 0 | 1-2 | >2 | Access review |
| DI-06 | Unauthorised access attempts | <5/month | 5-10/month | >10/month | System logs |
| DI-07 | Audit trail gap events | 0 | N/A | >0 (always red) | System monitoring |

### Reporting Cadence
| Report | Frequency | Audience | Owner |
|--------|-----------|----------|-------|
| DI Metrics Summary | Monthly | QA Director, System Owners | QA Analyst |
| DI Trend Report | Quarterly | Quality Council | QA Manager |
| DI Annual Review | Annual | Site Director | QA Director |
```

**Erwartet:** Dashboard liefert auf einen Blick den Compliance-Status mit klaren Eskalationsausloesern.
**Bei Fehler:** Koennen Datenquellen keine automatisierten Metriken unterstuetzen, manuelle Erfassung implementieren und den Plan zur Automatisierung dokumentieren.

### Schritt 5: Untersuchungsausloeser und Eskalation etablieren

```markdown
# Investigation and Escalation Matrix

### Investigation Triggers
| Trigger | Severity | Response Time | Investigator |
|---------|----------|---------------|-------------|
| Audit trail gap detected | Critical | Immediate (within 4 hours) | IT + QA |
| Confirmed data falsification | Critical | Immediate (within 4 hours) | QA Director |
| Anomaly pattern confirmed after review | Major | Within 5 business days | QA Analyst |
| Repeated anomalies from same user | Major | Within 5 business days | QA + HR |
| Overdue audit trail review | Minor | Within 10 business days | QA Manager |

### Escalation Path
| Level | Escalated To | When |
|-------|-------------|------|
| 1 | System Owner | Any confirmed anomaly |
| 2 | QA Director | Major or critical finding |
| 3 | Site Director | Critical finding or potential regulatory impact |
| 4 | Regulatory Affairs | Confirmed data integrity failure requiring regulatory notification |
```

**Erwartet:** Jede Untersuchung hat definierte Schwere, Zeitplan und Eskalationspfad.
**Bei Fehler:** Werden Untersuchungen nicht innerhalb der definierten Zeitplaene abgeschlossen, auf die naechste Ebene eskalieren.

### Schritt 6: Ueberwachungsplan zusammenstellen

Alle Komponenten in den Master-Datenintegritaets-Ueberwachungsplan zusammenfuehren:

```markdown
# Data Integrity Monitoring Plan
## Document ID: DI-MONITORING-PLAN-[SITE]-[YYYY]-[NNN]

### 1. Purpose and Scope
[From assessment scope]

### 2. ALCOA+ Assessment Summary
[From Step 1]

### 3. Detective Controls
[From Step 2]

### 4. Anomaly Detection Rules
[From Step 3]

### 5. Metrics and Reporting
[From Step 4]

### 6. Investigation and Escalation
[From Step 5]

### 7. Periodic Review
- Monitoring plan review: Annual
- Anomaly thresholds: Adjust after each quarterly review
- ALCOA+ re-assessment: When systems change or new systems are added

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Director | | | |
| IT Director | | | |
| Site Director | | | |
```

**Erwartet:** Ein einzelnes genehmigtes Dokument, das das vollstaendige Datenintegritaets-Ueberwachungsprogramm definiert.
**Bei Fehler:** Ist der Plan fuer ein einzelnes Dokument zu gross, einen Masterplan mit Referenzen auf systemspezifische Ueberwachungsverfahren erstellen.

## Validierung

- [ ] ALCOA+-Bewertung fuer alle Systeme im Umfang abgeschlossen
- [ ] Auditpfad-Pruefungsplan mit Haeufigkeit, Umfang und verantwortlichem Pruefer definiert
- [ ] Mindestens 5 Anomalieerkennungsmuster mit spezifischen Schwellenwerten definiert
- [ ] Metrik-Dashboard hat KPIs mit Gruen/Gelb/Rot-Schwellenwerten
- [ ] Untersuchungsausloeser mit Schwere und Reaktionszeitplaenen definiert
- [ ] Eskalationsmatrix erreicht Regulatory Affairs bei kritischen Befunden
- [ ] Ueberwachungsplan von QA und IT-Leitung genehmigt
- [ ] Regelmaessiger Pruefungsrhythmus etabliert

## Haeufige Stolperfallen

- **Ueberwachung ohne Handlung**: Metriken sammeln aber Anomalien nie untersuchen gibt ein falsches Sicherheitsgefuehl und ist schlimmer als keine Ueberwachung (es erzeugt Nachweise ignorierter Befunde).
- **Statische Schwellenwerte**: Schwellenwerte basierend auf Vermutungen statt Basisdaten erzeugen uebermaeig viele Fehlalarme, die zu Alarmmudigkeit fuehren.
- **Auditpfad-Pruefung als Checkboxen-Uebung**: Auditpfade ohne Verstaendnis, wonach man sucht, zu pruefen ist wirkungslos. Pruefer in Anomalieerkennungsmustern schulen.
- **Systemlimitierungen ignorieren**: Manche Systeme haben schlechte Auditpfad-Faehigkeiten. Einschraenkungen dokumentieren und kompensierende Kontrollen implementieren, anstatt so zu tun als gaebe es die Einschraenkung nicht.
- **Kein Trending**: Einzelne Anomalien koennen geringfuegig erscheinen, aber Muster ueber Zeit oder Nutzer hinweg offenbaren systemische Probleme. Datenintegritaetsmetriken immer im Trend verfolgen.

## Verwandte Skills

- `design-compliance-architecture` — identifiziert Systeme, die Datenintegritaets-Ueberwachung benoetigen
- `implement-audit-trail` — die technische Grundlage, auf die Ueberwachung angewiesen ist
- `investigate-capa-root-cause` — wenn Ueberwachung Probleme aufdeckt, die formale Untersuchung erfordern
- `conduct-gxp-audit` — Audits bewerten die Wirksamkeit des Ueberwachungsprogramms
- `prepare-inspection-readiness` — Datenintegritaet ist ein primaerer Schwerpunktbereich bei Behoerdeninspektionen
