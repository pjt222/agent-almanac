---
name: conduct-retrospective
description: >
  Eine Projekt- oder Sprint-Retrospektive durchfuehren durch Erfassen von Daten
  aus Statusberichten und Velocity-Kennzahlen, Strukturieren von was gut lief
  und was verbessert werden muss, und Erstellen umsetzbarer Verbesserungsmassnahmen
  mit Verantwortlichen und Faelligkeitsdaten. Verwenden am Ende eines Sprints,
  nach einer Projektphase oder einem Meilenstein, nach einem bedeutenden Vorfall
  oder Erfolg, bei einer vierteljaehrlichen Ueberprueung laufender Prozesse oder
  vor dem Start eines aehnlichen Projekts zur Erfassung von Learnings.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Retrospektive durchfuehren

Eine strukturierte Retrospektive moderieren, die die juengste Projektdurchfuehrung ueberblickt, identifiziert was funktioniert hat und was nicht, und umsetzbare Verbesserungsmassnahmen produziert, die in Projektprozesse zurueckfliessen. Dieser Skill verwandelt rohe Projektdaten in evidenzgestuetzte Erkenntnisse mit spezifischen Massnahmen, Verantwortlichen und Faelligkeitsdaten.

## Wann verwenden

- Ende eines Sprints (Sprint-Retrospektive)
- Ende einer Projektphase oder eines Meilensteins
- Nach einem bedeutenden Vorfall, Misserfolg oder Erfolg
- Vierteljaehrliche Ueberprueung laufender Projektprozesse
- Vor dem Start eines aehnlichen Projekts (Lessons-Learned-Ueberprueung)

## Eingaben

- **Erforderlich**: Ueberprueifungszeitraum (Sprint-Nummer, Datumsbereich oder Meilenstein)
- **Optional**: Statusberichte aus dem Ueberprueifungszeitraum
- **Optional**: Sprint-Velocity- und Abschlussdaten
- **Optional**: Massnahmen aus der vorherigen Retrospektive (zum Abgleich der Schliessungen)
- **Optional**: Team-Feedback oder Umfrageergebnisse

## Vorgehensweise

### Schritt 1: Retrospektivdaten erfassen

Verfuegbare Artefakte aus dem Ueberprueifungszeitraum lesen:
- STATUS-REPORT-*.md-Dateien fuer den Zeitraum
- SPRINT-PLAN.md fuer Geplantes vs. Tatsaechliches
- BACKLOG.md fuer Eintragsdurchfluss und Durchlaufzeiten
- Vorherige RETRO-*.md-Dateien fuer offene Massnahmen

Schluesselfakten extrahieren:
- Geplante vs. abgeschlossene Eintraege
- Velocity-Trend
- Aufgetretene Blockaden und Loesungszeit
- Ungeplante Arbeit, die in den Sprint eintrat
- Offene Massnahmen aus vorherigen Retrospektiven

**Erwartet:** Datenzusammenfassung mit quantitativen Kennzahlen (Velocity, Abschluss-%, Blockaden-Anzahl).

**Bei Fehler:** Wenn keine Artefakte vorhanden sind, die Retrospektive auf qualitativen Beobachtungen basieren.

### Schritt 2: "Was gut lief" strukturieren

3-5 Dinge aufzaehlen, die gut funktioniert haben, mit Belegen:

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

Auf Praktiken konzentrieren, die fortgefuehrt werden sollen, nicht nur auf Ergebnisse. "Taegliche Stand-ups hielten Blockaden sichtbar" ist umsetzbarer als "Wir haben rechtzeitig geliefert."

**Erwartet:** 3-5 evidenzgestuetzte positive Beobachtungen.

**Bei Fehler:** Wenn nichts gut lief, genauer hinschauen — selbst kleine Erfolge zaehlen. Mindestens hat das Team den Zeitraum abgeschlossen.

### Schritt 3: "Was verbessert werden muss" strukturieren

3-5 Dinge aufzaehlen, die verbessert werden muessen, mit Belegen:

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

Spezifisch und sachlich sein. "Schaetzungen waren falsch" ist vage. "3 von 5 Eintraegen ueberschritten Schaetzungen um mehr als 50%, was 8 ungeplante Tage hinzufuegte" ist umsetzbar.

**Erwartet:** 3-5 evidenzgestuetzte Verbesserungsbereiche mit angegebener Auswirkung.

**Bei Fehler:** Wenn das Team behauptet, alles sei in Ordnung, geplante vs. tatsaechliche Kennzahlen vergleichen — Luecken offenbaren Probleme.

### Schritt 4: Verbesserungsmassnahmen erstellen

Fuer jeden Verbesserungsbereich einen umsetzbaren Eintrag erstellen:

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

Jede Massnahme muss sein:
- Spezifisch (nicht "Schaetzung verbessern", sondern "Schaetzungs-Review-Schritt ins Grooming einfuegen")
- Verantwortet (eine Person verantwortlich)
- Zeitgebunden (Faelligkeitsdatum innerhalb der naechsten 1-2 Sprints)
- Verifizierbar (Erfolgskriterien definiert)

**Erwartet:** 2-4 Verbesserungsmassnahmen mit Verantwortlichen und Faelligkeitsdaten.

**Bei Fehler:** Wenn Massnahmen zu vage sind, den Test "Wie wuerden Sie verifizieren, dass dies getan wurde?" anwenden.

### Schritt 5: Vorherige Massnahmen ueberpruefen und Bericht schreiben

Massnahmen aus der vorherigen Retrospektive auf Schliessungen pruefen:

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

Wiederkehrende Eintraege markieren (dasselbe Problem in 3+ Retrospektiven) — diese benoetigen Eskalation oder einen anderen Ansatz.

Die vollstaendige Retrospektive schreiben:

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

Als `RETRO-[YYYY-MM-DD].md` speichern.

**Erwartet:** Vollstaendiges Retrospektiv-Dokument gespeichert mit Massnahmen, Belegen und Ueberprueifung vorheriger Massnahmen.

**Bei Fehler:** Wenn die Retrospektive keine Verbesserungsmassnahmen hat, treibt sie keine Veraenderung — Schritt 3 erneut durchfuehren.

## Validierung

- [ ] Retrospektiv-Datei mit datumsgestempeltem Dateinamen erstellt
- [ ] Zusammenfassung des Zeitraums enthaelt quantitative Kennzahlen
- [ ] "Was gut lief" hat 3-5 evidenzgestuetzte Eintraege
- [ ] "Was verbessert werden muss" hat 3-5 evidenzgestuetzte Eintraege
- [ ] Verbesserungsmassnahmen haben Verantwortliche, Faelligkeitsdaten und Erfolgskriterien
- [ ] Massnahmen aus der vorherigen Retrospektive auf Schliessungen geprueft
- [ ] Wiederkehrende Probleme markiert

## Haeufige Stolperfallen

- **Schuldzuweisungsspiel**: Retrospektiven ueberpruefen Prozesse und Praktiken, nicht Menschen. Probleme als systemisch, nicht persoenlich formulieren.
- **Massnahmen ohne Nachverfolgung**: Das groesste Retrospektiv-Versagen. Immer vorherige Massnahmen ueberpruefen, bevor neue erstellt werden.
- **Zu viele Massnahmen**: 2-4 fokussierte Massnahmen sind besser als 10 vage. Das Team kann nur so viele Veraenderungen absorbieren.
- **Kein Beleg**: "Wir glauben, dass Schaetzungen schlecht sind" ist eine Meinung. "3 von 5 Eintraegen ueberschritten Schaetzungen um 50%" sind Daten. Immer Belege anfuegen.
- **Positives ueberspringen**: Nur Probleme zu diskutieren ist demoralisierend. Erfolge feiern verstaerkt gute Praktiken.

## Verwandte Skills

- `generate-status-report` — Statusberichte liefern die Daten fuer Retrospektiven
- `manage-backlog` — Verbesserungsmassnahmen fliessen in den Backlog zurueck
- `plan-sprint` — Retrospektiv-Erkenntnisse verbessern die Sprint-Planungsgenauigkeit
- `draft-project-charter` — Charter-Annahmen und Risikoqualitaet ueberpruefen
- `create-work-breakdown-structure` — Schaetzungsgenauigkeit gegen PSP ueberpruefen
