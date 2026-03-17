---
name: investigate-capa-root-cause
description: >
  Ursachen untersuchen und CAPAs (Korrektive und Praeventive Massnahmen)
  fuer Compliance-Abweichungen verwalten. Umfasst Auswahl der
  Untersuchungsmethode (5-Why, Fischgraet, Fehlerbaum), strukturierte
  Ursachenanalyse, Gestaltung von korrektiven und praeventiven Massnahmen,
  Wirksamkeitsverifizierung und Trendanalyse. Anzuwenden wenn ein
  Auditbefund eine CAPA erfordert, wenn eine Abweichung oder ein Vorfall in
  einem validierten System auftritt, wenn eine regulatorische Beobachtung
  eine formale Antwort benoetigt, wenn eine Datenintegritaets-Anomalie
  untersucht werden muss oder wenn wiederkehrende Probleme auf eine
  systemische Ursache hinweisen.
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
  tags: gxp, capa, root-cause, investigation, fishbone, five-why, compliance
---

# CAPA-Ursache untersuchen

Eine strukturierte Ursachenuntersuchung durchfuehren und wirksame korrektive sowie praeventive Massnahmen fuer Compliance-Abweichungen entwickeln.

## Wann verwenden

- Ein Auditbefund erfordert eine CAPA
- Eine Abweichung oder ein Vorfall ist in einem validierten System aufgetreten
- Eine Behoerdeninspektionsbeobachtung benoetigt eine formale Antwort
- Eine Datenintegritaets-Anomalie erfordert Untersuchung
- Wiederkehrende Probleme deuten auf eine systemische Ursache hin

## Eingaben

- **Erforderlich**: Beschreibung der Abweichung, des Befunds oder des Vorfalls
- **Erforderlich**: Schweregrad-Klassifizierung (kritisch, schwerwiegend, geringfuegig)
- **Erforderlich**: Waehrend des Audits oder der Untersuchung gesammelte Nachweise
- **Optional**: Fruehere verwandte CAPAs oder Untersuchungen
- **Optional**: Relevante SOPs, Validierungsdokumente und Systemprotokolle
- **Optional**: Interviewnotizen von beteiligten Mitarbeitern

## Vorgehensweise

### Schritt 1: Untersuchung einleiten

```markdown
# Root Cause Investigation
## Document ID: RCA-[CAPA-ID]
## CAPA Reference: CAPA-[YYYY]-[NNN]

### 1. Trigger
| Field | Value |
|-------|-------|
| Source | [Audit finding / Deviation / Inspection observation / Monitoring alert] |
| Reference | [Finding ID, deviation ID, or observation number] |
| System | [Affected system name and version] |
| Date discovered | [YYYY-MM-DD] |
| Severity | [Critical / Major / Minor] |
| Investigator | [Name, Title] |
| Investigation deadline | [Date — per severity: Critical 15 days, Major 30 days, Minor 60 days] |

### 2. Problem Statement
[Objective, factual description of what happened, what should have happened, and the gap between the two. No blame, no assumptions.]

### 3. Immediate Containment (if required)
| Action | Owner | Completed |
|--------|-------|-----------|
| [e.g., Restrict system access pending investigation] | [Name] | [Date] |
| [e.g., Quarantine affected batch records] | [Name] | [Date] |
| [e.g., Implement manual workaround] | [Name] | [Date] |
```

**Erwartet:** Untersuchung eingeleitet mit klarer Problemformulierung und Eindaemmungsmasnahmen innerhalb von 24 Stunden bei kritischen Befunden.
**Bei Fehler:** Kann die Eindaemmung nicht sofort implementiert werden, an den QA-Direktor eskalieren und das Risiko einer verzoegerten Eindaemmung dokumentieren.

### Schritt 2: Untersuchungsmethode auswaehlen

Die Methode basierend auf der Problemkomplexitaet auswaehlen:

```markdown
### Investigation Method Selection

| Method | Best For | Complexity | Output |
|--------|----------|-----------|--------|
| **5-Why Analysis** | Single-cause problems, straightforward failures | Low | Linear cause chain |
| **Fishbone (Ishikawa)** | Multi-factor problems, process failures | Medium | Cause-and-effect diagram |
| **Fault Tree Analysis** | System failures, safety-critical events | High | Boolean logic tree |

**Selected method:** [5-Why / Fishbone / Fault Tree / Combination]
**Rationale:** [Why this method is appropriate for this problem]
```

**Erwartet:** Die ausgewaehlte Methode entspricht der Problemkomplexitaet — keinen Fehlerbaum fuer einen einfachen Verfahrensfehler verwenden und keine 5-Why-Analyse fuer ein komplexes systemisches Versagen.
**Bei Fehler:** Fuehrt die erste Methode nicht zu einer uberzeugenden Ursache, eine zweite Methode anwenden. Uebereinstimmung zwischen Methoden staerkt die Schlussfolgerung.

### Schritt 3: Ursachenanalyse durchfuehren

#### Option A: 5-Why-Analyse

```markdown
### 5-Why Analysis

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Why 1 | Why did [the problem] occur? | [Immediate cause] | [Evidence reference] |
| Why 2 | Why did [immediate cause] occur? | [Contributing factor] | [Evidence reference] |
| Why 3 | Why did [contributing factor] occur? | [Deeper cause] | [Evidence reference] |
| Why 4 | Why did [deeper cause] occur? | [Systemic cause] | [Evidence reference] |
| Why 5 | Why did [systemic cause] occur? | [Root cause] | [Evidence reference] |

**Root cause:** [Clear statement of the fundamental cause]
```

#### Option B: Fischgraet-Diagramm (Ishikawa)

```markdown
### Fishbone Analysis

Analyse causes across six standard categories:

| Category | Potential Causes | Confirmed? | Evidence |
|----------|-----------------|------------|----------|
| **People** | Inadequate training, unfamiliarity with SOP, staffing shortage | [Y/N] | [Ref] |
| **Process** | SOP unclear, missing step, wrong sequence | [Y/N] | [Ref] |
| **Technology** | System misconfiguration, software bug, interface failure | [Y/N] | [Ref] |
| **Materials** | Incorrect input data, wrong version of reference document | [Y/N] | [Ref] |
| **Measurement** | Wrong metric, inadequate monitoring, missed threshold | [Y/N] | [Ref] |
| **Environment** | Organisational change, regulatory change, resource constraints | [Y/N] | [Ref] |

**Contributing causes:** [List confirmed causes]
**Root cause(s):** [The fundamental cause(s) — may be more than one]
```

#### Option C: Fehlerbaumanalyse

```markdown
### Fault Tree Analysis

**Top event:** [The undesired event]

Level 1 (OR gate — any of these could cause the top event):
├── [Cause A]
│   Level 2 (AND gate — both needed):
│   ├── [Sub-cause A1]
│   └── [Sub-cause A2]
├── [Cause B]
│   Level 2 (OR gate):
│   ├── [Sub-cause B1]
│   └── [Sub-cause B2]
└── [Cause C]

**Minimal cut sets:** [Smallest combinations of events that cause the top event]
**Root cause(s):** [Fundamental failures identified in the tree]
```

**Erwartet:** Die Ursachenanalyse erreicht die grundlegende Ursache (nicht nur das Symptom) mit stuetzenden Nachweisen fuer jeden Schritt.
**Bei Fehler:** Produziert die Analyse nur Symptome ("Nutzer hat einen Fehler gemacht"), tiefer bohren. Fragen: "Warum konnte der Nutzer diesen Fehler machen? Welche Kontrolle haette ihn verhindern sollen?"

### Schritt 4: Korrektive und praeventive Massnahmen gestalten

Klar zwischen Korrektur, korrektiver Massnahme und praeventiver Massnahme unterscheiden:

```markdown
### CAPA Plan

| Category | Definition | Action | Owner | Deadline |
|----------|-----------|--------|-------|----------|
| **Correction** | Fix the immediate problem | [e.g., Re-enable audit trail for batch module] | [Name] | [Date] |
| **Corrective Action** | Eliminate the root cause | [e.g., Remove admin ability to disable audit trail; require change control for all audit trail configuration changes] | [Name] | [Date] |
| **Preventive Action** | Prevent recurrence in other areas | [e.g., Audit all systems for audit trail disable capability; add monitoring alert for audit trail configuration changes] | [Name] | [Date] |

### CAPA Details

**CAPA-[YYYY]-[NNN]-CA1: [Corrective Action Title]**
- **Root cause addressed:** [Specific root cause from Step 3]
- **Action description:** [Detailed description of what will be done]
- **Success criteria:** [Measurable outcome that proves the action worked]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [When effectiveness will be verified — typically 3-6 months after implementation]

**CAPA-[YYYY]-[NNN]-PA1: [Preventive Action Title]**
- **Risk addressed:** [What recurrence or spread this prevents]
- **Action description:** [Detailed description]
- **Success criteria:** [Measurable outcome]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [Date]
```

**Erwartet:** Jede CAPA-Massnahme laesst sich auf eine spezifische Ursache zurueckverfolgen, hat messbare Erfolgskriterien und umfasst einen Wirksamkeitsverifizierungsplan.
**Bei Fehler:** Sind Erfolgskriterien vage ("Compliance verbessern"), neu formulieren, damit sie spezifisch und messbar sind ("keine Auditpfad-Konfigurationsaenderungen ausserhalb der Aenderungskontrolle fuer 6 aufeinanderfolgende Monate").

### Schritt 5: Wirksamkeit verifizieren

Nach der CAPA-Implementierung verifizieren, dass die Massnahmen tatsaechlich gewirkt haben:

```markdown
### Effectiveness Verification

**CAPA-[YYYY]-[NNN] — Verification Record**

| CAPA Action | Verification Date | Method | Evidence | Result |
|-------------|------------------|--------|----------|--------|
| CA1: [Action] | [Date] | [Method: audit, sampling, metric review] | [Evidence reference] | [Effective / Not Effective] |
| PA1: [Action] | [Date] | [Method] | [Evidence reference] | [Effective / Not Effective] |

### Effectiveness Criteria Check
- [ ] The original problem has not recurred since CAPA implementation
- [ ] The corrective action eliminated the root cause (evidence: [reference])
- [ ] The preventive action has been applied to similar systems/processes
- [ ] No new issues were introduced by the CAPA actions

### CAPA Closure
| Field | Value |
|-------|-------|
| Closure decision | [Closed — Effective / Closed — Not Effective / Extended] |
| Closed by | [Name, Title] |
| Closure date | [YYYY-MM-DD] |
| Next review | [If recurring, when to re-check] |
```

**Erwartet:** Die Wirksamkeitsverifizierung belegt, dass die Ursache tatsaechlich beseitigt wurde, nicht nur dass die Massnahme abgeschlossen wurde.
**Bei Fehler:** Zeigt die Verifizierung, dass die CAPA nicht wirksam war, die Untersuchung wiederoeffnen und ueberarbeitete Massnahmen entwickeln. Eine unwirksame CAPA nicht schliessen.

### Schritt 6: CAPA-Trends analysieren

```markdown
### CAPA Trend Analysis

| Period | Total CAPAs | By Source | Top 3 Root Cause Categories | Recurring? |
|--------|------------|-----------|---------------------------|------------|
| Q1 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |
| Q2 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |

### Systemic Issues
| Issue | Frequency | Systems Affected | Recommended Action |
|-------|-----------|-----------------|-------------------|
| [e.g., Training gaps] | [N occurrences in 12 months] | [Systems] | [Systemic programme improvement] |
```

**Erwartet:** Die Trendanalyse identifiziert systemische Probleme, die einzelne CAPAs verfehlen.
**Bei Fehler:** Zeigt das Trending wiederkehrende Ursachen trotz CAPAs, behandeln die CAPAs Symptome. An das Management-Review eskalieren fuer systemische Intervention.

## Validierung

- [ ] Untersuchung innerhalb der erforderlichen Frist eingeleitet (24 Stunden fuer kritisch, 72 Stunden fuer schwerwiegend)
- [ ] Problemformulierung ist sachlich und weist keine Schuld zu
- [ ] Untersuchungsmethode ist der Problemkomplexitaet angemessen
- [ ] Ursachenanalyse erreicht die grundlegende Ursache (nicht nur Symptome)
- [ ] Jeder Schritt der Ursachenanalyse ist durch Nachweise belegt
- [ ] CAPAs unterscheiden Korrektur, korrektive Massnahme und praeventive Massnahme
- [ ] Jede CAPA hat messbare Erfolgskriterien und einen Verifizierungsplan
- [ ] Wirksamkeit mit Nachweisen verifiziert vor dem Schliessen der CAPA
- [ ] Trendanalyse mindestens quartalsweise ueberprueft

## Haeufige Stolperfallen

- **Beim Symptom stehenbleiben**: "Der Nutzer hat einen Fehler gemacht" ist keine Ursache. Die Ursache ist, warum das System oder der Prozess den Fehler erlaubt hat.
- **CAPA = Nachschulung**: Nachschulung adressiert nur eine moegliche Ursache (Wissen). Ist die eigentliche Ursache ein Systemdesignfehler oder eine unklare SOP, wird Nachschulung das Wiederauftreten nicht verhindern.
- **Schliessen ohne Verifizierung**: Die Massnahme abschliessen ist nicht dasselbe wie ihre Wirksamkeit zu verifizieren. Eine ohne Wirksamkeitsverifizierung geschlossene CAPA ist ein regulatorischer Zitationskandidat.
- **Schuldbewusste Untersuchung**: Untersuchungen, die sich darauf konzentrieren, wer den Fehler gemacht hat, anstatt was den Fehler erlaubt hat, untergraben die Qualitaetskultur und entmutigen das Melden.
- **Kein Trending**: Einzelne CAPAs scheinen moeglicherweise unzusammenhaengend, aber Trending offenbart haeufig systemische Probleme (z. B. koennen "Schulungs"-Ursachen in mehreren Systemen auf ein defektes Schulungsprogramm hinweisen).

## Verwandte Skills

- `conduct-gxp-audit` — Audits generieren Befunde, die CAPAs erfordern
- `monitor-data-integrity` — Ueberwachung erkennt Anomalien, die Untersuchungen ausloesen
- `manage-change-control` — CAPA-getriebene Aenderungen durchlaufen die Aenderungskontrolle
- `prepare-inspection-readiness` — offene und ueberfaellige CAPAs sind die wichtigsten Inspektionsziele
- `design-training-program` — wenn die Ursache schulungsbezogen ist, das Schulungsprogramm verbessern
