---
name: prepare-inspection-readiness
description: >
  Eine Organisation auf eine Behoerdeninspektion vorbereiten durch Beurteilung
  der Bereitschaft gegenueber behoerdenspezifischen Schwerpunktbereichen (FDA,
  EMA, MHRA). Umfasst Analyse von Warning Letters und 483-Themen,
  Scheininspektion-Protokolle, Dokumentenpaket-Vorbereitung, Inspektionslogistik
  und Erstellung von Antwortvorlagen. Anzuwenden wenn eine Behoerdeninspektion
  angekuendigt oder erwartet wird, wenn eine regelmaessige Selbstbeurteilung
  faellig ist, wenn seit der letzten Inspektion neue Systeme implementiert wurden
  oder nach einem bedeutenden Auditbefund, der regulatorische Aufmerksamkeit
  anziehen koennte.
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
  tags: gxp, inspection, fda, ema, mhra, readiness, compliance, 483
---

# Inspektionsbereitschaft vorbereiten

Die organisatorische Bereitschaft fuer Behoerdeninspektionen beurteilen und verbessern — einschliesslich Dokumentation, Personalvorbereitung, Logistik und Reaktionsplanung.

## Wann verwenden

- Eine Behoerdeninspektion wurde angekuendigt oder wird erwartet
- Eine regelmaessige Selbstbeurteilung der Inspektionsbereitschaft ist faellig
- Seit der letzten Inspektion wurden neue Systeme oder Prozesse implementiert
- Branchentrends (Warning Letters, 483-Beobachtungen) weisen auf einen aufkommenden Schwerpunktbereich hin
- Nach einem bedeutenden Auditbefund, der regulatorische Aufmerksamkeit anziehen koennte

## Eingaben

- **Erforderlich**: Inspektionsbehoerde (FDA, EMA, MHRA oder andere)
- **Erforderlich**: Erwarteter Inspektionsumfang (Datenintegritaet, CSV, GMP, GLP, GCP)
- **Erforderlich**: Compliance-Architektur und Systeminventar
- **Optional**: Fruehere Inspektionsberichte und Beobachtungen
- **Optional**: Aktuelle Branchen-Warning Letters und 483-Themen
- **Optional**: Offene CAPAs und Auditbefunde

## Vorgehensweise

### Schritt 1: Behoerdenspezifische Schwerpunktbereiche analysieren

Die aktuellen Prioritaeten der Inspektionsbehoerde recherchieren:

```markdown
# Inspection Focus Area Analysis
## Document ID: IFA-[SITE]-[YYYY]-[NNN]

### FDA Current Focus Areas
| Focus Area | Regulatory Basis | Recent 483 Trends | Risk to This Site |
|-----------|-----------------|-------------------|-------------------|
| Data integrity | 21 CFR Part 11, CGMP | #1 cited observation in drug 483s since 2016 | [H/M/L] |
| Audit trail | 21 CFR 11.10(e) | Disabled/incomplete audit trails | [H/M/L] |
| Electronic signatures | 21 CFR 11.50-11.300 | Missing manifestation, shared accounts | [H/M/L] |
| Computer system validation | GAMP 5, FDA guidance | Inadequate validation of Category 4/5 systems | [H/M/L] |
| Change control | ICH Q10 | Undocumented or retrospective changes | [H/M/L] |
| Laboratory controls | 21 CFR 211.160-211.176 | OOS investigation, test repetition | [H/M/L] |

### EMA/MHRA-Specific Considerations
| Area | EU Annex 11 Reference | Focus | Risk to This Site |
|------|----------------------|-------|-------------------|
| Computerized system validation | §4, §5 | Risk-based validation, supplier assessment | [H/M/L] |
| Operational phase | §6-§13 | Security, audit trail, backup, business continuity | [H/M/L] |
| Cloud and outsourced systems | §3.4 | Service level agreements, data sovereignty | [H/M/L] |
| Data governance | MHRA DI guidance | ALCOA+, culture of integrity | [H/M/L] |
```

**Erwartet:** Eine risikobewertete Analyse der Inspektionsschwerpunktbereiche, spezifisch fuer die Inspektionsbehoerde.
**Bei Fehler:** Sind aktuelle 483/Warning-Letter-Daten nicht verfuegbar, die FDA Warning Letter Datenbank, EMA-Inspektionsberichte oder Branchenpublikationen fuer die aktuellsten Trends konsultieren.

### Schritt 2: Selbstbeurteilung der Bereitschaft durchfuehren

Den Standort gegenueber jedem Schwerpunktbereich bewerten:

```markdown
# Inspection Readiness Assessment
## Document ID: IRA-[SITE]-[YYYY]-[NNN]

### Readiness Scoring
| Focus Area | Weight | Current State | Score (1-5) | Gap | Remediation Priority |
|-----------|--------|--------------|-------------|-----|---------------------|
| Data integrity controls | High | [Description of current state] | [1-5] | [Gap description] | [Critical/High/Medium/Low] |
| Validation documentation | High | [Description] | [1-5] | [Gap] | [Priority] |
| Audit trail compliance | High | [Description] | [1-5] | [Gap] | [Priority] |
| Electronic signatures | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Change control | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Training records | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| SOPs (current, approved) | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| CAPA management | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Vendor qualification | Low | [Description] | [1-5] | [Gap] | [Priority] |
| Periodic review | Low | [Description] | [1-5] | [Gap] | [Priority] |

Score: 1 = Critical gaps, 5 = Fully compliant
Overall readiness score: [Sum / Max] = [X]%

### Remediation Plan
| Gap ID | Description | Owner | Action | Deadline | Status |
|--------|------------|-------|--------|----------|--------|
| GAP-001 | [Gap] | [Name] | [Remediation action] | [Date] | [Open/In Progress/Closed] |
```

**Erwartet:** Eine quantifizierte Bereitschaftsbeurteilung mit priorisierten Behebunsmasnahmen.
**Bei Fehler:** Liegt die Gesamtbereitschaft unter 70 %, eine Verschiebung der Inspektion (falls zulaessig) erwaegen und Notfallbehebung implementieren.

### Schritt 3: Dokumentenpakete vorbereiten

Dokumentation in inspektionsbereite Pakete organisieren:

```markdown
# Inspection Document Bundles

### Bundle 1: Validation Pack (per system)
- [ ] Current validation status summary (one-page per system)
- [ ] User Requirements Specification (URS)
- [ ] Risk Assessment
- [ ] Validation Plan
- [ ] IQ Protocol and Report
- [ ] OQ Protocol and Report
- [ ] PQ Protocol and Report (if applicable)
- [ ] Traceability Matrix
- [ ] Validation Summary Report
- [ ] Periodic review records
- [ ] Change control history since last validation

### Bundle 2: Data Integrity Evidence
- [ ] Data integrity policy and programme
- [ ] ALCOA+ assessment results
- [ ] Audit trail review records (last 12 months)
- [ ] Data integrity monitoring metrics and trends
- [ ] Data integrity training records

### Bundle 3: Operational Evidence
- [ ] Current SOPs (master list with effective dates)
- [ ] Training matrix (all GxP personnel)
- [ ] Change control log (last 24 months)
- [ ] Deviation/incident log (last 24 months)
- [ ] CAPA log with closure status
- [ ] Internal audit reports and CAPA follow-up

### Bundle 4: System Configuration Evidence
- [ ] User access list (current active users with roles)
- [ ] System configuration documentation
- [ ] Backup and recovery test records
- [ ] Security patch log
- [ ] Business continuity/disaster recovery plan
```

**Erwartet:** Alle Pakete sind zusammengestellt, indexiert und innerhalb von 30 Minuten nach einer Anfrage des Inspektors zugaenglich.
**Bei Fehler:** Fehlen oder sind Dokumente unvollstaendig, eine Lueckenliste erstellen, Behebung priorisieren und den Plan dokumentieren. Inspektoren bemerken Desorganisation.

### Schritt 4: Scheininspektion-Protokoll entwerfen

```markdown
# Mock Inspection Protocol
## Document ID: MIP-[SITE]-[YYYY]-[NNN]

### Scope
- **Focus areas:** [Top 3-5 risk areas from readiness assessment]
- **Systems in scope:** [Systems likely to be inspected]
- **Duration:** [1-2 days]

### Participants
| Role | Name | Mock Inspection Role |
|------|------|---------------------|
| Mock inspector | [Experienced QA or external consultant] | Ask questions, request documents |
| System owner(s) | [Names] | Respond to questions, demonstrate systems |
| QA | [Name] | Observe, note findings |
| Back room coordinator | [Name] | Locate and provide documents |

### Mock Inspection Scenarios
| Scenario | Focus | Inspector Might Ask |
|----------|-------|-------------------|
| 1: Show me the audit trail | Data integrity | "Show me the audit trail for batch record BR-2025-1234" |
| 2: Walk me through a change | Change control | "Show me the change control for the last system upgrade" |
| 3: Show training records | Training | "Show me the training records for user [Name] on system [X]" |
| 4: Explain your validation | CSV | "Walk me through how you validated this system" |
| 5: Show a deviation | CAPA | "Show me your last critical deviation and its CAPA" |
| 6: User access review | Access control | "Show me how you manage user access when people leave" |

### Post-Mock Assessment
| Scenario | Outcome | Findings | Actions |
|----------|---------|----------|---------|
| [#] | [Satisfactory/Needs Work] | [Description] | [Remediation if needed] |
```

**Erwartet:** Die Scheininspektion deckt Probleme auf, bevor die echte Inspektion es tut.
**Bei Fehler:** Deckt die Scheininspektion kritische Luecken auf, diese als kritische Befunde mit derselben Dringlichkeit wie echte Inspektionsbeobachtungen behandeln.

### Schritt 5: Inspektionslogistik planen

```markdown
# Inspection Logistics Plan

### Room Setup
| Room | Purpose | Equipment | Assigned To |
|------|---------|-----------|-------------|
| Front room | Inspector workspace | Table, chairs, network access, printer | Facility manager |
| Back room | Document retrieval and strategy | Copier, network access, phone | QA team |
| Demo room | System demonstrations | Workstation with system access | IT support |

### Roles During Inspection
| Role | Person | Responsibilities |
|------|--------|-----------------|
| Inspection coordinator | [Name] | Single point of contact with inspector, schedule management |
| Subject matter experts | [Names] | Answer technical questions in their domain |
| Back room lead | [Name] | Coordinate document retrieval, track requests |
| Scribe | [Name] | Document all questions, requests, and responses |
| Executive sponsor | [Name] | Available for escalation, opening/closing meetings |

### Communication Protocol
- All document requests flow through the back room lead
- No documents provided without QA review
- Questions requiring research get a "we will get back to you" response (track and follow up)
- Daily debrief with inspection team after each day
```

**Erwartet:** Der Logistikplan gewaehrleistet eine professionelle, organisierte Antwort auf die Inspektion.
**Bei Fehler:** Sind Schluessel-Mitarbeiter am Inspektionstag nicht verfuegbar, Stellvertreter identifizieren und einweisen.

### Schritt 6: Antwortvorlagen erstellen

```markdown
# Inspection Response Templates

### Template 1: 483 Observation Response
[Date]
[FDA District Office Address]

Re: FDA Form 483 Observations — [Inspection Dates] — [Facility Name]

Dear [Inspector Name],

We appreciate the opportunity to address the observations identified during the inspection of [facility] on [dates].

**Observation [N]:** [Quote the exact observation text]

**Response:**
- **Root Cause:** [Brief root cause description]
- **Immediate Corrective Action:** [What was done immediately]
  - Completed: [Date]
- **Long-term Corrective Action:** [Systemic fix]
  - Target completion: [Date]
- **Preventive Action:** [How recurrence will be prevented]
  - Target completion: [Date]
- **Effectiveness Verification:** [How effectiveness will be measured]
  - Target verification date: [Date]

### Template 2: Immediate Correction During Inspection
When an inspector identifies an issue that can be corrected immediately:
1. Acknowledge the observation
2. Implement the correction (if feasible)
3. Document the correction with before/after evidence
4. Inform the inspector that the correction has been made
5. Include in the formal response as "corrected during inspection"
```

**Erwartet:** Antwortvorlagen ermoeglichen schnelle, strukturierte Antworten auf Inspektionsbeobachtungen.
**Bei Fehler:** Sind Antwortvorlagen zu allgemein und gehen nicht auf die spezifische Beobachtung ein, jede Antwort mit spezifischen Nachweisen und Zeitplaenen anpassen.

## Validierung

- [ ] Behoerdenspezifische Schwerpunktbereiche mit Risikobewertungen analysiert
- [ ] Selbstbeurteilung der Bereitschaft mit quantifizierten Punktzahlen abgeschlossen
- [ ] Behebunsplan fuer alle Luecken mit Verantwortlichen und Fristen erstellt
- [ ] Dokumentenpakete fuer alle im Umfang befindlichen Systeme zusammengestellt und indexiert
- [ ] Scheininspektion mit dokumentierten Befunden und Nachverfolgung durchgefuehrt
- [ ] Inspektionslogistikplan definiert Raeume, Rollen und Kommunikationsprotokoll
- [ ] Antwortvorlagen fuer haeufige Beobachtungstypen vorbereitet
- [ ] Alle kritischen Behebunsmasnahmen vor dem Inspektionsdatum abgeschlossen

## Haeufige Stolperfallen

- **Vorbereitung in letzter Minute**: Inspektionsbereitschaft ist ein kontinuierliches Programm, kein Pauken. Organisationen, die sich hastig vorbereiten, liefern desorganisierte, unvollstaendige Antworten.
- **Probleme verstecken**: Inspektoren sind erfahrene Fachleute, die Verschleierung erkennen. Transparenz mit einem klaren Behebunsplan ist immer besser als Verschleierungsversuche.
- **Zu viele Informationen freiwillig geben**: Die gestellte Frage beantworten. Unaufgeforderte Informationen koennen neue Fragenlinien eroeffnen.
- **Ungeschultes Personal**: Fachexperten, die noch nie geuebt haben, auf Inspektorfragen zu antworten, schneiden schlecht ab. Scheininspektionen sind unentbehrliche Uebung.
- **Den Hinterraum vernachlaessigen**: Der Hinterraum (Dokumentenabfrage und Strategiekoordination) ist genauso wichtig wie der Vorderraum. Schlechte Dokumentenabfrage vermittelt den Eindruck von Desorganisation.

## Verwandte Skills

- `design-compliance-architecture` — das Grundlagendokument, das Inspektoren sehen wollen
- `conduct-gxp-audit` — interne Audits sollten die Inspektionsmethodik nachahmen
- `monitor-data-integrity` — Datenintegritaet ist der wichtigste FDA-Inspektionsschwerpunktbereich
- `investigate-capa-root-cause` — CAPAs muessen vor der Inspektion gruendlich untersucht sein
- `qualify-vendor` — Lieferantenqualifizierungen werden haeufig waehrend Inspektionen angefordert
