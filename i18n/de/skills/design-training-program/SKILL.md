---
name: design-training-program
description: >
  GxP-Schulungsprogramm entwerfen mit Schulungsbedarfsanalyse nach Rolle,
  Lehrplangestaltung (Regulierungsbewusstsein, systemspezifisch, Datenintegritaet),
  Kompetenzbeurteilungskriterien, Schulungsunterlagenaufbewahrung und
  Nachschulungsausloesern bei SOP-Revisionen und Vorfaellen. Anzuwenden wenn
  ein neues validiertes System Benutzerschulung vor Inbetriebnahme erfordert,
  ein Auditbefund unzureichende Schulung zitiert, organisatorische Aenderungen
  neue Rollen einfuehren, eine regelmaessige Programmueberpruefung faellig ist
  oder die Inspektionsvorbereitung den Nachweis ausreichender Schulung erfordert.
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
  tags: gxp, training, competency, compliance, quality-management, curriculum
---

# Schulungsprogramm entwerfen

Ein rollenbasiertes GxP-Schulungsprogramm mit Lehrplan, Kompetenzbeurteilungen und Aufzeichnungsmanagement fuer regulierte Umgebungen erstellen.

## Wann verwenden

- Ein neues validiertes System erfordert Benutzerschulung vor Inbetriebnahme
- Ein Auditbefund zitiert unzureichende Schulung oder fehlende Schulungsunterlagen
- Organisatorische Aenderungen fuehren neue Rollen oder Verantwortlichkeiten ein
- Die regelmaessige Ueberpruefung des Schulungsprogramms ist faellig
- Die Inspektionsvorbereitung erfordert den Nachweis ausreichender Schulung

## Eingaben

- **Erforderlich**: Systeme und Prozesse, die geschultes Personal benoetigen
- **Erforderlich**: Rollendefinitionen (Administrator, Nutzer, QA, Management)
- **Erforderlich**: Anwendbare regulatorische Schulungsanforderungen (GMP, GLP, GCP)
- **Optional**: Vorhandene Schulungsmaterialien oder Lehrplaene
- **Optional**: In Audits oder Leistungsbeurteilungen identifizierte Kompetenzluecken
- **Optional**: Faehigkeiten des Schulungsmanagementsystems

## Vorgehensweise

### Schritt 1: Schulungsbedarfsanalyse durchfuehren

Festlegen, was jede Rolle wissen muss:

```markdown
# Training Needs Analysis
## Document ID: TNA-[DEPT]-[YYYY]-[NNN]

### Role-Based Training Requirements

| Role | GxP Awareness | System Training | Data Integrity | SOP Training | Assessment Type |
|------|--------------|----------------|----------------|--------------|-----------------|
| System Administrator | Advanced | Advanced | Advanced | Admin SOPs | Written + Practical |
| End User | Basic | Intermediate | Intermediate | Operational SOPs | Written + Practical |
| QA Reviewer | Advanced | Basic (review focus) | Advanced | QA SOPs | Written |
| Management | Basic | Overview only | Intermediate | Governance SOPs | Written |
| IT Support | Basic | Infrastructure only | Basic | IT SOPs | Written |

### Training Gap Analysis
| Role | Current Competency | Required Competency | Gap | Priority |
|------|-------------------|---------------------|-----|----------|
| [Role] | [Current level] | [Required level] | [Gap description] | [H/M/L] |
```

**Erwartet:** Jede Rolle hat definierte Schulungsanforderungen, die mit ihrer Arbeitsfunktion und GxP-Verantwortlichkeiten verknuepft sind.
**Bei Fehler:** Sind Rollen nicht klar definiert, zuerst eine RACI-Uebung durchfuehren, um Verantwortlichkeiten festzulegen, bevor Schulungsbedarfe definiert werden.

### Schritt 2: Lehrplan gestalten

Schulung in Module nach Thema strukturieren:

```markdown
# Training Curriculum
## Document ID: TC-[DEPT]-[YYYY]-[NNN]

### Module 1: GxP Regulatory Awareness
**Duration:** 2 hours | **Delivery:** Classroom / eLearning | **Audience:** All roles
**Content:**
1. Introduction to GxP regulations (GMP, GLP, GCP overview)
2. 21 CFR Part 11 and EU Annex 11 requirements for electronic records
3. Data integrity principles (ALCOA+)
4. Consequences of non-compliance (warning letters, consent decrees, product recalls)
5. Individual responsibilities and accountability

### Module 2: System-Specific Training — [System Name]
**Duration:** 4 hours | **Delivery:** Instructor-led with hands-on | **Audience:** Users, Admins
**Content:**
1. System purpose and GxP classification
2. Login, navigation, and role-based access
3. Core workflows (step-by-step for each user task)
4. Electronic signature procedures
5. Audit trail: how entries are created and what they mean
6. Error handling and deviation reporting
7. Data entry best practices

### Module 3: Data Integrity in Practice
**Duration:** 1.5 hours | **Delivery:** Workshop | **Audience:** Users, QA, Admins
**Content:**
1. ALCOA+ principles with system-specific examples
2. Common data integrity risks and how to avoid them
3. Recognising and reporting data integrity concerns
4. Audit trail review basics
5. Case studies: real-world data integrity failures and lessons learned

### Module 4: SOP Training — [SOP-ID]
**Duration:** 1 hour per SOP | **Delivery:** Read and sign / walkthrough | **Audience:** Per SOP scope
**Content:**
1. SOP purpose and scope
2. Step-by-step procedure walkthrough
3. Decision points and deviation handling
4. Forms and documentation requirements
5. Q&A and clarification
```

**Erwartet:** Jedes Modul hat definierte Dauer, Vermittlungsmethode, Zielgruppe und spezifische Inhaltsuebersicht.
**Bei Fehler:** Ist der Inhalt fuer die vorgesehene Zeit zu umfangreich, in Untermodule aufteilen oder Voraussetzungsketten erstellen.

### Schritt 3: Kompetenzbeurteilungen erstellen

Definieren, wie Kompetenz fuer jedes Modul gemessen wird:

```markdown
# Competency Assessment Design

### Assessment Types
| Type | When to Use | Passing Score | Records |
|------|------------|---------------|---------|
| **Written test** | Knowledge assessment (regulations, principles) | 80% | Score sheet retained |
| **Practical demonstration** | Skill assessment (system operation) | All critical steps correct | Signed observation form |
| **Observed task** | On-the-job competency | Supervisor sign-off | Competency form |

### Sample Written Assessment — GxP Awareness (Module 1)
1. List the five ALCOA principles for data integrity. (5 points)
2. Under 21 CFR 11.50, what three elements must an electronic signature display? (3 points)
3. You discover that a colleague's data entry contains an error. Describe the correct procedure to correct it. (5 points)
4. True/False: A shared login account can be used if all users sign a logbook. (2 points — answer: False)
5. Describe one consequence of a data integrity failure for a pharmaceutical company. (5 points)

**Passing score:** 16/20 (80%)
**On failure:** Retraining required before re-assessment. Maximum 2 re-attempts.

### Practical Assessment Template
| Step | Task | Observed? | Performed Correctly? | Comments |
|------|------|-----------|---------------------|----------|
| 1 | Log in with personal credentials | Yes/No | Yes/No | |
| 2 | Navigate to [specific function] | Yes/No | Yes/No | |
| 3 | Enter test data correctly | Yes/No | Yes/No | |
| 4 | Apply electronic signature | Yes/No | Yes/No | |
| 5 | Locate and interpret audit trail | Yes/No | Yes/No | |

**Assessor:** _______ **Date:** _______ **Result:** Pass / Fail
```

**Erwartet:** Beurteilungen testen sowohl Wissen (Verstaendnis des Warum) als auch Fertigkeit (Demonstration des Wie).
**Bei Fehler:** Liegen Bestehensquoten unter 70 %, die Schulungsmaterialien auf Klarheit pruefen, bevor den Lernenden die Schuld gegeben wird.

### Schritt 4: Schulungsunterlagen und Aufbewahrung definieren

```markdown
# Training Record Management

### Required Training Records
| Record | Format | Retention Period | Storage |
|--------|--------|-----------------|---------|
| Training matrix (who needs what) | Electronic | Current + 2 years superseded | Training management system |
| Individual training transcript | Electronic | Employment + 2 years | Training management system |
| Assessment results | Electronic or paper | Same as transcript | Training management system |
| Training materials (version used) | Electronic | Life of system + 1 year | Document management system |
| Trainer qualification records | Electronic | Employment + 2 years | HR system |

### Training Matrix Template
| Employee | Role | Module 1 | Module 2 | Module 3 | SOP-001 | SOP-002 | Status |
|----------|------|----------|----------|----------|---------|---------|--------|
| J. Smith | User | 2026-01-15 ✓ | 2026-01-16 ✓ | Due 2026-03-01 | 2026-01-20 ✓ | N/A | Partially trained |
| K. Jones | Admin | 2026-01-15 ✓ | 2026-01-17 ✓ | 2026-01-18 ✓ | 2026-01-20 ✓ | 2026-01-20 ✓ | Fully trained |
```

**Erwartet:** Schulungsunterlagen belegen, dass jede Person, die GxP-Aktivitaeten durchfuehrt, vor der Durchfuehrung geschult und beurteilt wurde.
**Bei Fehler:** Sind Schulungsunterlagen unvollstaendig, eine rueckwirkende Schulungslueckenanalyse durchfuehren und sofortige Nachschulungsmassnahmen implementieren.

### Schritt 5: Nachschulungsausloeser definieren

```markdown
# Retraining Triggers

| Trigger | Scope | Timeline | Assessment Required? |
|---------|-------|----------|---------------------|
| SOP revision (minor) | Affected users — read and sign | Before new version effective | No — read and acknowledge |
| SOP revision (major) | Affected users — formal retraining | Before new version effective | Yes — written or practical |
| System upgrade | All users of affected functionality | Before production go-live | Yes — practical demonstration |
| Data integrity incident | Involved personnel + department | Within 30 days of investigation closure | Yes — written |
| Audit finding (training-related) | Per CAPA scope | Per CAPA timeline | Per CAPA requirements |
| Annual refresher | All GxP personnel | Annual from initial training date | No — refresher acknowledgement |
| Role change | Individual | Before assuming new responsibilities | Yes — per new role requirements |
| Extended absence (>6 months) | Returning individual | Before resuming GxP activities | Yes — practical assessment |
```

**Erwartet:** Nachschulungsausloeser sind spezifisch, messbar und mit definierten Zeitplaenen verknuepft.
**Bei Fehler:** Wird die Nachschulung nicht vor dem Ausloese-Stichtag abgeschlossen, darf die Person die betroffenen GxP-Aktivitaeten nicht durchfuehren, bis die Schulung abgeschlossen ist.

### Schritt 6: Schulungsprogrammdokument zusammenstellen

```markdown
# Training Programme
## Document ID: TRAINING-PROGRAM-[DEPT]-[YYYY]-[NNN]

### 1. Purpose and Scope
### 2. Training Needs Analysis [Step 1]
### 3. Curriculum [Step 2]
### 4. Competency Assessments [Step 3]
### 5. Training Records and Retention [Step 4]
### 6. Retraining Triggers [Step 5]
### 7. Programme Review
- Annual review of training effectiveness (pass rates, audit findings, incidents)
- Curriculum update when systems, SOPs, or regulations change
- Trainer qualification verification

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Training Manager | | | |
| QA Director | | | |
| Department Head | | | |
```

**Erwartet:** Vollstaendiges genehmigtes Schulungsprogramm wirksam vor System-Inbetriebnahme oder Compliance-Frist.
**Bei Fehler:** Verzoegert sich die Genehmigung, Zwischenschulungsmassnahmen implementieren und den Plan zur Formalisierung dokumentieren.

## Validierung

- [ ] Schulungsbedarfsanalyse fuer alle Rollen mit GxP-Systeminteraktion abgeschlossen
- [ ] Lehrplanmodule mit Dauer, Vermittlungsmethode und Inhaltsuebersicht definiert
- [ ] Kompetenzbeurteilungen fuer jedes Modul mit definierten Bestehensquoten vorhanden
- [ ] Schulungsmatrix verfolgt alle Mitarbeiter gegen alle erforderlichen Schulungen
- [ ] Schulungsunterlagenaufbewahrung erfuellt regulatorische Anforderungen
- [ ] Nachschulungsausloeser mit Zeitplaenen und Beurteilungsanforderungen definiert
- [ ] Schulungsprogramm von QA und Management genehmigt

## Haeufige Stolperfallen

- **Schulung = SOP lesen**: Lesen-und-Unterzeichnen ist fuer geringfuegige Updates geeignet, nicht fuer Erstschulung. Neue Nutzer benoetigen instruktorgefuehrte Schulung mit praktischer Uebung.
- **Keine Kompetenzbeurteilung**: Schulung ohne Beurteilung kann nicht belegen, dass Lernen stattgefunden hat. Regulatoren erwarten Nachweise von Kompetenz, nicht nur von Anwesenheit.
- **Nicht qualifizierter Schulungsleiter**: Schulungsleiter muessen nachweislich kompetent im Fachgebiet sein. Schulungsleiter-Qualifizierungsunterlagen werden bei Inspektionen haeufig angefordert.
- **Veraltete Schulungsmatrix**: Eine Matrix, die nicht aktualisiert wird, wenn Mitarbeiter eintreten, austreten oder die Rolle wechseln, erzeugt Compliance-Luecken. In HR-Prozesse integrieren.
- **Einheitsgroesse fuer alle**: Administratoren benoetigen tiefere Schulung als Endnutzer. Rollenbasierter Lehrplan vermeidet es, manche Nutzer zu ueberschuetten und andere zu unterzuschulen.

## Verwandte Skills

- `write-standard-operating-procedure` — SOPs treiben Schulungsinhalt und Nachschulungsausloeser
- `design-compliance-architecture` — identifiziert, welche Systeme und Rollen Schulung benoetigen
- `conduct-gxp-audit` — Audits beurteilen haeufig die Schulungsadaequatheit
- `manage-change-control` — Systemand erungen loesen Nachschulungsanforderungen aus
- `prepare-inspection-readiness` — Schulungsunterlagen sind ein primaeres Inspektionsziel
