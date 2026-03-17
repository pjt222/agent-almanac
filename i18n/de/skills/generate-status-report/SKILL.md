---
name: generate-status-report
description: >
  Einen Projektstatusbericht erstellen durch Lesen vorhandener Artefakte (Charter,
  Backlog, Sprint-Plan, PSP), Berechnen von Kennzahlen, Identifizieren von
  Blockaden und Zusammenfassen des Fortschritts mit RAG-Indikatoren fuer Zeitplan,
  Umfang, Budget und Qualitaet. Verwenden am Ende eines Sprints oder Berichtszeitraums,
  wenn Stakeholder ein Gesundheitsupdate anfragen, vor Steuerungsausschuss- oder
  Governance-Sitzungen oder wenn eine neue Blockade oder ein Risiko mitten im
  Projekt auftaucht.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Projektstatusbericht erstellen

Einen periodischen Statusbericht erstellen, indem Projektartefakte analysiert, Fortschrittskennzahlen berechnet und Leistungen, Blockaden und bevorstehende Arbeit mit RAG-Gesundheitsindikatoren (Rot/Gelb/Gruen) zusammengefasst werden.

## Wann verwenden

- Ende eines Sprints oder Berichtszeitraums (woechentlich, zweiwochentlich, monatlich)
- Stakeholder-Anfragen nach einem Projektgesundheitsupdate
- Vor Steuerungsausschuss- oder Governance-Sitzungen
- Wenn sich Projektgesundheitsindikatoren aendern (z.B. neue Blockade oder Risiko taucht auf)
- Periodischer Checkpoint gegen Charter-Meilensteine

## Eingaben

- **Erforderlich**: Berichtszeitraum (Startdatum, Enddatum)
- **Erforderlich**: Mindestens ein Projektartefakt (BACKLOG.md, SPRINT-PLAN.md, WBS.md oder PROJECT-CHARTER.md)
- **Optional**: Vorherige Statusberichte (fuer Trendvergleich)
- **Optional**: Budget- oder Ressourcentracking-Daten
- **Optional**: Risikoregister-Aktualisierungen

## Vorgehensweise

### Schritt 1: Vorhandene Artefakte lesen

Das Projektverzeichnis nach PM-Artefakten durchsuchen:
- PROJECT-CHARTER.md — Meilensteine, Erfolgskriterien
- BACKLOG.md — Eintragsanzahlen nach Status, Burn-down-Daten
- SPRINT-PLAN.md — Sprint-Ziel, zugesagte Eintraege, Aufgabenabschluss
- WBS.md — Abschlussprozentzahlen von Arbeitspaketen
- Vorherige STATUS-REPORT-*.md-Dateien — Trenddaten

Verfuegbare Dateien lesen. Nicht alle werden vorhanden sein — den Bericht an verfuegbare Daten anpassen.

**Erwartet:** Mindestens ein Artefakt erfolgreich gelesen, Schluesseldaten extrahiert.

**Bei Fehler:** Wenn keine Artefakte vorhanden sind, kann kein Bericht erstellt werden. Zuerst eine Charter oder einen Backlog mit den Skills `draft-project-charter` oder `manage-backlog` erstellen.

### Schritt 2: Fortschrittskennzahlen berechnen

Kennzahlen aus verfuegbaren Daten berechnen:

**Agile Kennzahlen** (aus BACKLOG.md / SPRINT-PLAN.md):
- Velocity: in diesem Sprint abgeschlossene Story Points
- Sprint-Abschluss: erledigte Eintraege / zugesagte Eintraege
- Backlog-Burn-down: verbleibende Gesamtpunkte vs. vorherigem Zeitraum
- Durchlaufzeit: durchschnittliche Tage von In Progress bis Done

**Klassische Kennzahlen** (aus WBS.md):
- % abgeschlossen: erledigte Arbeitspakete / Gesamtarbeitspakete
- Zeitplanabweichung: geplante Meilensteindaten vs. tatsaechliche
- Aufwandsabweichung: geschaetzter Aufwand vs. tatsaechlich verbrauchter Aufwand

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**Erwartet:** 3-5 Kennzahlen berechnet mit Vergleich zum Vorjahreszeitraum.

**Bei Fehler:** Wenn keine historischen Daten vorhanden sind (erster Bericht), die Spalten "Previous" und "Trend" weglassen. Wenn Daten unvollstaendig sind, Luecken in der Berichtsfussnote mit Massnahmen zur Etablierung des Trackings vermerken.

### Schritt 3: Blockaden, Risiken und Probleme identifizieren

Aktive Blockaden und Risiken auflisten:

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

Mit dem Charter-Risikoregister abgleichen. Alle neu identifizierten Risiken markieren.

**Erwartet:** Alle aktiven Blockaden und Top-Risiken mit Verantwortlichen und Massnahmen dokumentiert.

**Bei Fehler:** Wenn keine Blockaden vorhanden sind, explizit "Keine aktiven Blockaden" angeben — den Abschnitt nicht leer lassen. Wenn einer Blockade ein Verantwortlicher fehlt, an den Projektmanager zur Zuweisung eskalieren.

### Schritt 4: Leistungen und Plan fuer naechsten Zeitraum zusammenfassen

Zwei Abschnitte schreiben:

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**Erwartet:** 3-5 Leistungen mit konkreten Belegen, 3-5 geplante Eintraege fuer den naechsten Zeitraum.

**Bei Fehler:** Wenn keine Leistungen vorhanden sind, den Grund berichten (blockiert, Neuplanung, Team nicht verfuegbar). Wenn der Plan fuer den naechsten Zeitraum unklar ist, "Planungssitzung geplant fuer [Datum]" als Haupteintrag auffuehren.

### Schritt 5: RAG-Indikatoren zuweisen und Bericht schreiben

Projektgesundheit in vier Dimensionen bewerten:

| Dimension | Gruen | Gelb | Rot |
|-----------|-------|------|-----|
| **Zeitplan** | Im Plan oder voraus | 1-2 Wochen zurueck | >2 Wochen zurueck oder Meilenstein verpasst |
| **Umfang** | Keine unkontrollierten Aenderungen | Geringfuegige Umfangsanpassungen | Scope Creep beeintraechtigt Lieferergebnisse |
| **Budget** | Innerhalb 5% des Plans | 5-15% ueber Plan | >15% ueber Plan oder nicht nachverfolgt |
| **Qualitaet** | Tests bestehen, Kriterien erfuellt | Geringfuegige Qualitaetsprobleme | Kritische Maengel oder Abnahmefehler |

Den vollstaendigen Bericht schreiben:

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

Als `STATUS-REPORT-[YYYY-MM-DD].md` speichern.

**Erwartet:** Vollstaendiger Statusbericht gespeichert mit RAG-Indikatoren, Kennzahlen und Narrativ.

**Bei Fehler:** Wenn Daten fuer die RAG-Bewertung ungenuegend sind, ⚪ (Grau) verwenden mit dem Hinweis "ungenuegend Daten" und auflisten, welche Daten fuer den naechsten Bericht gesammelt werden muessen.

## Validierung

- [ ] Statusberichtsdatei mit korrektem datumsgestempeltem Dateinamen erstellt
- [ ] RAG-Indikatoren fuer alle vier Dimensionen mit Begruendung zugewiesen
- [ ] Mindestens 3 Kennzahlen aus Projektartefakten berechnet
- [ ] Blockaden-Abschnitt vorhanden (auch wenn "Keine aktiven Blockaden")
- [ ] Leistungen mit Belegen aufgelistet
- [ ] Plan fuer naechsten Zeitraum enthalten
- [ ] Executive Summary ist 2-3 Saetze, kein Absatz
- [ ] Jede Blockade und jedes Risiko hat einen Verantwortlichen und eine Massnahme mit Frist

## Haeufige Stolperfallen

- **Bericht ohne Daten**: Statusberichte muessen evidenzbasiert sein. Jede Aussage sollte ein Artefakt oder eine Kennzahl referenzieren.
- **Alles immer Gruen**: Dauerhaftes Gruen ohne Belege deutet darauf hin, dass der Bericht nicht ehrlich ist. Gruen-Bewertungen hinterfragen.
- **Blockade ohne Verantwortlichen**: Jede Blockade braucht einen Verantwortlichen und eine Massnahme. Unbesitzte Blockaden werden nicht geloest.
- **Kennzahl ohne Kontext**: "Velocity = 18" bedeutet nichts ohne Vergleich. Immer den Vorjahreszeitraum oder das Ziel einbeziehen.
- **Zu lang**: Ein Statusbericht sollte in 2 Minuten ueberschaubar sein. Auf 1-2 Seiten beschraenken.
- **Fehlender Entscheidungsabschnitt**: Wenn das Projekt Stakeholder-Entscheidungen benoetigt, diese mit Fristen explizit machen.
- **Veraltete Daten**: Veraltete Artefakte fuehren zu irrefuehrenden Berichten. Artefaktdaten auf den Berichtszeitraum abgleichen.
- **Fehlende Trenddaten**: Erstberichte koennen keine Trends zeigen, aber nachfolgende Berichte muessen mit vorherigen Zeitraeumen vergleichen.

## Verwandte Skills

- `draft-project-charter` — Charter liefert Meilensteine und Erfolgskriterien fuer das Status-Tracking
- `manage-backlog` — Backlog-Kennzahlen speisen den Statusbericht
- `plan-sprint` — Sprint-Ergebnisse liefern Velocity- und Abschlussdaten
- `create-work-breakdown-structure` — PSP-Abschluss treibt klassische Fortschrittskennzahlen
- `conduct-retrospective` — Statusberichtsdaten speisen die Retrospektive
