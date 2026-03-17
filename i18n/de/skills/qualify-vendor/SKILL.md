---
name: qualify-vendor
description: >
  Einen Anbieter oder Lieferanten von GxP-relevanter Software oder
  Dienstleistungen qualifizieren. Umfasst Anbieter-Risikoklassifizierung,
  Beurteilungsfragebogen-Gestaltung, Schreibtisch- und Vor-Ort-Auditansaetze,
  Qualitaetsvereinbarungsbewertung, SLA-Pruefung und Definition des
  laufenden Ueberwachungsrhythmus. Anzuwenden bei der Auswahl eines neuen
  Anbieters fuer ein GxP-kritisches System, beim Onboarding eines
  Cloud-Anbieters fuer regulierte Daten, bei einer regelmaessigen
  Neubewertung, wenn ein Anbieter-Auditbefund eine Neubewertung erfordert
  oder wenn EU Annex 11 oder ICH Q10 Lieferantenqualifizierung vorschreibt.
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
  tags: gxp, vendor, qualification, supplier, quality-agreement, compliance
---

# Anbieter qualifizieren

Einen Anbieter von GxP-relevanter Software, Infrastruktur oder Dienstleistungen beurteilen und qualifizieren, um sicherzustellen, dass er die regulatorischen Qualitaetsstandards erfuellt.

## Wann verwenden

- Auswahl eines neuen Anbieters fuer ein GxP-kritisches computergestuetztes System
- Onboarding eines Cloud-Dienstleisters fuer regulierte Daten
- Regelmaessige Neubewertung eines bestehenden Anbieters ist faellig
- Ein Anbieter-Auditbefund erfordert Neubewertung
- Regulatorische Anforderung fuer Lieferantenqualifizierung (EU Annex 11 §3.4, ICH Q10)

## Eingaben

- **Erforderlich**: Anbietername, Produkt/Dienstleistung und beabsichtigte GxP-Nutzung
- **Erforderlich**: Kriterien fuer die Anbieter-Risikoklassifizierung
- **Erforderlich**: Anwendbare regulatorische Anforderungen
- **Optional**: Vom Anbieter bereitgestellte Qualitaetsdokumentation (ISO-Zertifizierungen, SOC-Berichte)
- **Optional**: Fruehere Anbieter-Auditberichte oder Qualifizierungsunterlagen
- **Optional**: Referenzkundenerfahrungen

## Vorgehensweise

### Schritt 1: Anbieterrisiko klassifizieren

Das Risikoniveau des Anbieters basierend auf dem GxP-Einfluss bestimmen:

```markdown
# Vendor Risk Classification
## Document ID: VRC-[VENDOR]-[YYYY]-[NNN]

### Risk Classification Criteria
| Factor | Weight | Critical | Major | Minor |
|--------|--------|----------|-------|-------|
| GxP impact | 40% | Directly processes GxP data or affects product quality | Supports GxP processes indirectly | No GxP impact |
| Data access | 20% | Accesses or stores GxP-regulated data | Accesses supporting data only | No data access |
| Substitutability | 15% | Sole source, no alternative | Limited alternatives | Multiple alternatives |
| Regulatory exposure | 15% | Subject to regulatory inspection | May be referenced in submissions | No regulatory exposure |
| Business criticality | 10% | System downtime stops operations | Downtime causes delays | Minimal operational impact |

### Vendor Classification
| Vendor | Product/Service | Risk Score | Classification | Qualification Approach |
|--------|----------------|------------|---------------|----------------------|
| [Vendor name] | [Product] | [Score] | Critical / Major / Minor | On-site audit / Desk audit / Questionnaire only |

### Qualification Approach by Risk
| Risk Level | Qualification Activities | Re-qualification Frequency |
|------------|------------------------|---------------------------|
| **Critical** | Questionnaire + desk audit + on-site audit | Annual |
| **Major** | Questionnaire + desk audit | Every 2 years |
| **Minor** | Questionnaire only | Every 3 years |
```

**Erwartet:** Die Anbieter-Risikoklassifizierung steuert einen verhaeltnismaessigen Qualifizierungsaufwand.
**Bei Fehler:** Ist die Risikoklassifizierung strittig, standardmaessig das hoehere Niveau waehlen. Die Unterqualifizierung eines kritischen Anbieters ist ein regulatorisches Risiko.

### Schritt 2: Beurteilungsfragebogen gestalten und senden

```markdown
# Vendor Assessment Questionnaire
## Document ID: VAQ-[VENDOR]-[YYYY]-[NNN]

### Section 1: Company Information
1. Legal name, address, and parent company (if applicable)
2. Number of employees (total and in quality/development)
3. Products and services relevant to this qualification
4. Key customers in the pharmaceutical/life sciences industry

### Section 2: Quality Management System
5. Do you maintain a certified QMS? (ISO 9001, ISO 13485, ISO 27001 — provide certificates)
6. Describe your document control system
7. Describe your change management process
8. Describe your CAPA process
9. How do you handle customer complaints?
10. When was your last external audit? Provide the summary report.

### Section 3: Software Development (if applicable)
11. Describe your software development lifecycle (SDLC)
12. Do you follow GAMP 5, IEC 62304, or other development standards?
13. Describe your testing methodology (unit, integration, system, regression)
14. How do you manage source code (version control, branching, code review)?
15. Describe your release management process
16. How do you handle bug reports and patches?

### Section 4: Data Integrity and Security
17. How do you ensure data integrity (ALCOA+ principles)?
18. Describe your audit trail capabilities
19. Describe your access control model (role-based, attribute-based)
20. Describe your data backup and recovery procedures
21. Have you had any data breaches in the last 3 years? If yes, describe.
22. Provide your most recent SOC 2 Type II report (if available)

### Section 5: Regulatory Compliance
23. Are your products used in FDA-regulated or EU-regulated environments?
24. Can you provide a 21 CFR Part 11 compliance statement?
25. Can you provide an EU Annex 11 compliance statement?
26. Do you provide validation support documentation (IQ/OQ/PQ packs)?
27. How do you notify customers of changes that may affect their validated state?

### Section 6: Support and Service Level
28. Describe your support tiers and response times
29. What is your system availability target (uptime SLA)?
30. Describe your disaster recovery and business continuity plan
31. What is your customer notification process for planned and unplanned downtime?
32. What is your end-of-life/end-of-support policy?
```

**Erwartet:** Fragebogen an Anbieter gesendet mit einer Antwortefrist (typischerweise 4-6 Wochen fuer kritische Anbieter).
**Bei Fehler:** Kann oder will der Anbieter den Fragebogen nicht ausfuellen, ist dies selbst ein Risikoindikator. Die Verweigerung dokumentieren und an Einkauf und QA eskalieren.

### Schritt 3: Anbieterantworten bewerten

Die Fragebogenantworten pruefen und bewerten:

```markdown
# Vendor Evaluation
## Document ID: VE-[VENDOR]-[YYYY]-[NNN]

### Response Evaluation Matrix
| Section | Score (1-5) | Key Findings | Acceptable? |
|---------|-------------|-------------|-------------|
| Quality Management System | [Score] | [Summary of findings] | [Yes/No/Conditional] |
| Software Development | [Score] | [Summary] | [Yes/No/Conditional] |
| Data Integrity and Security | [Score] | [Summary] | [Yes/No/Conditional] |
| Regulatory Compliance | [Score] | [Summary] | [Yes/No/Conditional] |
| Support and Service Level | [Score] | [Summary] | [Yes/No/Conditional] |

Score: 1 = Unacceptable, 2 = Significant gaps, 3 = Adequate with conditions, 4 = Good, 5 = Excellent

### Red Flags (automatic escalation)
- [ ] No QMS or expired certification
- [ ] No change notification process to customers
- [ ] No audit trail capability
- [ ] Data breach with no corrective action
- [ ] Cannot provide 21 CFR 11 or EU Annex 11 compliance statement
- [ ] No validation support documentation
```

**Erwartet:** Jeder Abschnitt mit klaren Erkenntnissen und einer Gesamtakzeptabilitaetsbestimmung bewertet.
**Bei Fehler:** Sind Antworten unvollstaendig oder ausweichend, Klarstellung anfordern. Anhaltende Nicht-Reaktionsfaehigkeit ist ein Qualifizierungsversagenskriterium.

### Schritt 4: Audit durchfuehren (falls erforderlich)

Fuer kritische und schwerwiegende Anbieter ein Schreibtisch- oder Vor-Ort-Audit durchfuehren:

```markdown
# Vendor Audit Plan
## Document ID: VAP-[VENDOR]-[YYYY]-[NNN]

### Desk Audit (Remote)
| Document Requested | Received? | Assessment |
|-------------------|-----------|------------|
| QMS manual or overview | [Y/N] | [Finding] |
| SDLC documentation | [Y/N] | [Finding] |
| Most recent internal audit report | [Y/N] | [Finding] |
| SOC 2 Type II report | [Y/N] | [Finding] |
| 21 CFR 11 / EU Annex 11 compliance statement | [Y/N] | [Finding] |
| Sample release notes (last 3 releases) | [Y/N] | [Finding] |
| Customer notification examples | [Y/N] | [Finding] |

### On-Site Audit (if critical vendor)
| Area | Activities | Duration |
|------|-----------|----------|
| Quality system | Review QMS documentation, CAPA records, complaint handling | 2 hours |
| Development | Walk through SDLC, code review process, testing evidence | 2 hours |
| Operations | Observe data centre (if applicable), review security controls | 1 hour |
| Support | Review support ticket resolution, SLA compliance metrics | 1 hour |

### Audit Findings
| Finding ID | Area | Observation | Severity | Vendor Response Required? |
|-----------|------|-------------|----------|--------------------------|
| VF-001 | [Area] | [Observation] | [Major/Minor/Obs] | [Yes/No] |
```

**Erwartet:** Auditbefunde objektiv mit Schweregradklassifizierung dokumentiert.
**Bei Fehler:** Kann ein Vor-Ort-Audit nicht arrangiert werden, ein gruendliches Schreibtischaudit ergaenzt durch Videokonferenzinterviews durchfuehren.

### Schritt 5: Qualitaetsvereinbarung und SLA bewerten

```markdown
# Quality Agreement Evaluation
## Document ID: QAE-[VENDOR]-[YYYY]-[NNN]

### Quality Agreement Checklist
| Clause | Present? | Adequate? | Comments |
|--------|----------|-----------|----------|
| Roles and responsibilities (vendor vs customer) | [Y/N] | [Y/N] | |
| Change notification (advance notice of changes) | [Y/N] | [Y/N] | [Minimum notice period?] |
| Audit rights (right to audit vendor) | [Y/N] | [Y/N] | [Frequency, scope?] |
| Data ownership and portability | [Y/N] | [Y/N] | [Data return on termination?] |
| Security and confidentiality obligations | [Y/N] | [Y/N] | |
| Regulatory inspection cooperation | [Y/N] | [Y/N] | [Vendor supports regulatory inspections?] |
| CAPA process for quality issues | [Y/N] | [Y/N] | |
| Validation support obligations | [Y/N] | [Y/N] | [IQ/OQ/PQ support?] |
| Subcontractor management | [Y/N] | [Y/N] | [Vendor's subcontractor quality?] |
| Termination and transition support | [Y/N] | [Y/N] | [Data migration support?] |

### SLA Evaluation
| Metric | Vendor Commitment | Industry Benchmark | Acceptable? |
|--------|------------------|-------------------|-------------|
| Availability (uptime) | [e.g., 99.9%] | 99.5% - 99.99% | [Y/N] |
| Response time (critical issues) | [e.g., 1 hour] | 1-4 hours | [Y/N] |
| Resolution time (critical issues) | [e.g., 4 hours] | 4-24 hours | [Y/N] |
| Planned maintenance notification | [e.g., 5 days] | 5-14 days | [Y/N] |
| Data backup frequency | [e.g., Daily] | Daily minimum | [Y/N] |
| Disaster recovery RTO | [e.g., 4 hours] | 4-24 hours | [Y/N] |
```

**Erwartet:** Qualitaetsvereinbarung und SLA-Bedingungen vor Vertragsunterzeichnung auf Angemessenheit geprueft.
**Bei Fehler:** Fehlen kritische Qualitaetsvereinbarungsklauseln, deren Aufnahme verhandeln. Keinen Anbieter ohne angemessene Auditrechte und Aenderungsbenachrichtigung qualifizieren.

### Schritt 6: Qualifizierungsentscheidung treffen

```markdown
# Vendor Qualification Report
## Document ID: VENDOR-QUALIFICATION-[VENDOR]

### Qualification Summary
| Criterion | Result |
|-----------|--------|
| Vendor risk classification | [Critical / Major / Minor] |
| Questionnaire assessment | [Score/5] |
| Audit results (if applicable) | [Satisfactory / Satisfactory with conditions / Unsatisfactory] |
| Quality agreement | [Adequate / Needs revision] |
| SLA | [Adequate / Needs revision] |

### Qualification Decision
| Decision | Meaning |
|----------|---------|
| **Qualified** | Vendor meets all requirements; proceed with procurement |
| **Conditionally qualified** | Vendor meets most requirements; specific conditions must be met within defined timeline |
| **Not qualified** | Vendor does not meet requirements; do not proceed |

**Decision:** [Qualified / Conditionally Qualified / Not Qualified]
**Conditions (if applicable):** [List specific conditions with deadlines]

### Ongoing Monitoring
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Performance metrics review | Quarterly | System owner |
| Quality agreement compliance | Annual | QA |
| Re-qualification audit/assessment | [Per risk level] | QA |
| Regulatory update review | As needed | Regulatory affairs |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Assurance | | | |
| System Owner | | | |
| Procurement | | | |
```

**Erwartet:** Klare Qualifizierungsentscheidung mit dokumentierter Begruendung und laufendem Ueberwachungsplan.
**Bei Fehler:** Lautet die Entscheidung "Nicht qualifiziert", die spezifischen Maengel dokumentieren und an den Einkauf kommunizieren. Alternative Anbieter identifizieren.

## Validierung

- [ ] Anbieterrisiko mit dokumentierter Begruendung klassifiziert
- [ ] Beurteilungsfragebogen deckt QMS, Entwicklung, Sicherheit, Compliance und Support ab
- [ ] Anbieterantworten mit bewerteten Erkenntnissen ausgewertet
- [ ] Audit fuer kritische und schwerwiegende Anbieter durchgefuehrt
- [ ] Qualitaetsvereinbarung auf alle erforderlichen Klauseln geprueft
- [ ] SLA gegenueber regulatorischen und geschaeftlichen Anforderungen bewertet
- [ ] Qualifizierungsentscheidung mit Genehmigungsunterschriften dokumentiert
- [ ] Laufender Ueberwachungsplan mit Haeufigkeit und Verantwortlichkeiten definiert

## Haeufige Stolperfallen

- **Einkauf vor Qualifizierung**: Das Unterzeichnen eines Vertrags vor Abschluss der Qualifizierung entfernt den Verhandlungsspielraum fuer Qualitaetsvereinbarungen und schafft eine Compliance-Luecke.
- **Fragebogen ohne Verifizierung**: Die Selbstbeurteilung des Anbieters ohne Pruefung zu akzeptieren ist ungenuegend. Schluessige Behauptungen durch Audits, Referenzpruefungen oder Dokumentenpruefu ng verifizieren.
- **Keine Aenderungsbenachrichtigungsklausel**: Ohne vertragliche Aenderungsbenachrichtigung kann ein Anbieter sein Produkt oder seine Dienstleistung auf eine Weise aendern, die den validierten Zustand beeinflusst, ohne Kenntnis des Kunden.
- **Qualifizierung als Einmalereignis**: Anbieterqualifizierung ist ein kontinuierlicher Prozess. Regelmaessige Ueberwachung, Neubewertung und Leistungsbeurteilung sind fuer anhaltende Compliance unentbehrlich.
- **Unterauftragnehmer ignorieren**: Vergibt der Anbieter kritische Dienstleistungen (z. B. Hosting, Entwicklung) an Unterauftragnehmer, muss auch die Qualitaet des Unterauftragnehmers bewertet werden.

## Verwandte Skills

- `design-compliance-architecture` — identifiziert, welche Anbieter Qualifizierung benoetigen
- `conduct-gxp-audit` — Anbieteraudits folgen derselben Methodik wie interne Audits
- `prepare-inspection-readiness` — Anbieterqualifizierungen werden haeufig waehrend Inspektionen angefordert
- `manage-change-control` — Anbieter-initiierte Aenderungen erfordern eine Aenderungskontrollbewertung
- `perform-csv-assessment` — die Anbieterqualifizierung informiert den Validierungsansatz fuer das Produkt des Anbieters
