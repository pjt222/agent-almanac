---
name: manage-backlog
description: >
  Einen Produkt- oder Projekt-Backlog mit priorisierten Eintraegen, Abnahmekriterien
  und Schaetzungen erstellen und pflegen. Umfasst User-Story-Schreiben, MoSCoW-
  Priorisierung, Backlog-Grooming, Eintragsteilung und Statusverfolgung.
  Verwenden beim Start eines neuen Projekts und Umwandlung von Umfang in umsetzbare
  Eintraege, beim laufenden Grooming vor der Sprint-Planung, bei Neu-Priorisierung
  nach Stakeholder-Feedback oder Scope-Aenderungen oder beim Aufteilen zu grosser
  Eintraege in implementierbare Stuecke.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Produkt-Backlog verwalten

Einen Backlog von Arbeitseintraegen erstellen, priorisieren und pflegen, der als einzige Wahrheitsquelle fuer ausstehende Arbeit dient, anwendbar auf agile und klassische Projektmethoden.

## Wann verwenden

- Start eines neuen Projekts und Umwandlung von Umfang in umsetzbare Eintraege
- Laufendes Backlog-Grooming vor der Sprint-Planung
- Neu-Priorisierung von Arbeit nach Stakeholder-Feedback oder Scope-Aenderungen
- Aufteilen zu grosser Eintraege in implementierbare Stuecke
- Ueberpruefen und Archivieren abgeschlossener oder abgebrochener Eintraege

## Eingaben

- **Erforderlich**: Projektumfang (aus Charter, PSP oder Stakeholder-Input)
- **Optional**: Vorhandene Backlog-Datei (BACKLOG.md) zur Aktualisierung
- **Optional**: Priorisierungs-Framework-Praeferenz (MoSCoW, Wert/Aufwand, WSJF)
- **Optional**: Schaetzungsskala (Story Points, T-Shirt-Groessen, Personentage)
- **Optional**: Sprint- oder Iterations-Feedback, das Backlog-Aktualisierungen erfordert

## Vorgehensweise

### Schritt 1: Backlog-Struktur erstellen oder laden

Wenn kein Backlog vorhanden ist, BACKLOG.md mit Standardspalten erstellen. Wenn einer vorhanden ist, lesen und Struktur validieren.

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

**Erwartet:** BACKLOG.md existiert mit gueltiger Struktur und Zusammenfassungsstatistiken.

**Bei Fehler:** Wenn die Datei fehlerhaft ist, unter Beibehaltung vorhandener Eintragsdaten neu strukturieren.

### Schritt 2: Eintraege schreiben oder verfeinern

Fuer jeden neuen Eintrag als User Story oder Anforderung schreiben:

- **User-Story-Format**: "Als [Rolle] moechte ich [Faehigkeit], damit [Nutzen]"
- **Anforderungsformat**: "[System/Komponente] soll [Verhalten] wenn [Bedingung]"

Jeder Eintrag muss haben:
- Eindeutige ID (B-NNN, aufsteigend)
- Klaren Titel (imperativische Verbform)
- Typklassifizierung
- Mindestens 2 Abnahmekriterien (testbar, binaeres Bestehen/Nicht-Bestehen)

Beispiel:
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

**Erwartet:** Alle Eintraege haben Titel, Typen und Abnahmekriterien.

**Bei Fehler:** Eintraege ohne Abnahmekriterien werden als Status: New markiert (nicht Ready). Sie koennen keinen Sprint betreten.

### Schritt 3: Mit MoSCoW oder Wert/Aufwand priorisieren

Das gewahlte Priorisierungs-Framework anwenden:

**MoSCoW** (Standard):
- **Must**: Projekt scheitert ohne dies. Nicht verhandelbar.
- **Should**: Wichtig, aber Projekt kann ohne es erfolgreich sein. Einbeziehen wenn Kapazitaet erlaubt.
- **Could**: Schoen zu haben. Nur einbeziehen, wenn kein Einfluss auf Must/Should-Eintraege.
- **Won't**: Explizit aus aktuellem Umfang ausgeschlossen. Fuer kuenftige Beruecksichtigung dokumentiert.

**Wert/Aufwand-Matrix** (Alternative):

| | Geringer Aufwand | Hoher Aufwand |
|---|-----------|-------------|
| **Hoher Wert** | Zuerst tun (Quick Wins) | Danach tun (grosse Wetten) |
| **Geringer Wert** | Drittens tun (Fueller) | Nicht tun (Geldgruben) |

Die Backlog-Tabelle sortieren: Zuerst Must-Eintraege (nach Wert innerhalb von Must), dann Should, dann Could.

**Erwartet:** Jeder Eintrag hat eine Prioritaet. Backlog ist nach Prioritaet sortiert.

**Bei Fehler:** Wenn Stakeholder ueber Prioritaeten uneinig sind, Must-vs-Should-Entscheidungen an den Projektauftraggeber eskalieren.

### Schritt 4: Groomen — Aufteilen, Schaetzen und Verfeinern

Eintraege auf Sprint-Bereitschaft pruefen. Fuer jeden Eintrag:
1. **Aufteilen** wenn Schaetzung > 8 Punkte (oder > 1 Woche Aufwand): in 2-4 kleinere Eintraege zerlegen
2. **Schaetzen** mit der gewahlten Projektskala
3. **Verfeinern** vager Abnahmekriterien zu testbaren Bedingungen
4. **Als Ready markieren** wenn der Eintrag Titel, Abnahmekriterien, Schaetzung und keine Blockaden hat

Aufteilung dokumentieren:
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

**Erwartet:** Alle Must- und Should-Eintraege haben Ready-Status.

**Bei Fehler:** Eintraege, die nicht geschaetzt werden koennen, benoetigen einen Spike (zeitbegrenzte Rechercheaufgabe), der dem Backlog hinzugefuegt wird.

### Schritt 5: Zusammenfassung aktualisieren und archivieren

Die Zusammenfassungsstatistiken aktualisieren. Done- und Cancelled-Eintraege in einen Archivabschnitt verschieben:

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

Die Zusammenfassung durch Zaehlen der Eintraege in jedem Status aktualisieren:
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**Erwartet:** Zusammenfassungsstatistiken stimmen mit tatsaechlichen Eintragsanzahlen ueberein. Archivabschnitt enthaelt alle geschlossenen Eintraege.

**Bei Fehler:** Wenn Zaehler nicht uebereinstimmen, durch Grep der Status-Werte neu zaehlen und Zusammenfassung manuell aktualisieren.

## Validierung

- [ ] BACKLOG.md existiert mit Standardstruktur
- [ ] Jeder Eintrag hat eindeutige ID, Titel, Typ, Prioritaet und Status
- [ ] Alle Must- und Should-Eintraege haben Abnahmekriterien
- [ ] Eintraege sind nach Prioritaet sortiert (Must zuerst, dann Should, dann Could)
- [ ] Kein Eintrag auf > 8 Punkte geschaetzt ohne aufgeteilt zu sein
- [ ] Zusammenfassungsstatistiken sind korrekt
- [ ] Done/Cancelled-Eintraege sind archiviert

## Haeufige Stolperfallen

- **Keine Abnahmekriterien**: Eintraege ohne Kriterien koennen nicht als fertig verifiziert werden. Jeder Eintrag braucht mindestens 2 testbare Kriterien.
- **Alles hat Must-Prioritaet**: Wenn mehr als 50% der Eintraege Must sind, sind die Prioritaeten nicht real. Must-Eintraege zwangs-ranken.
- **Zombie-Eintraege**: Eintraege, die monatelang ohne Fortschritt im Backlog liegen, sollten neu bewertet oder abgebrochen werden.
- **Schaetzungen ohne Kontext**: Story Points sind relativ — ein Team muss einen Referenz-Eintrag haben (z.B. "B-001 ist unser 3-Punkte-Referenz").
- **Aufteilen erzeugt Fragmente**: Beim Aufteilen sicherstellen, dass jeder Kind-Eintrag unabhaengig lieferbar und wertvoll ist.
- **Backlog als Ablageort**: Der Backlog ist keine Wunschliste. Regelmaessig Eintraege aussortieren, die nicht mehr mit den Projektzielen uebereinstimmen.
- **Fehlende Abhaengigkeiten**: Blockierende Eintraege im Notizen-Feld vermerken. Ein blockierter Eintrag sollte nicht als Ready markiert werden.

## Verwandte Skills

- `draft-project-charter` — Charter-Umfang speist die initiale Backlog-Erstellung
- `create-work-breakdown-structure` — PSP-Arbeitspakete koennen zu Backlog-Eintraegen werden
- `plan-sprint` — Sprint-Planung waehlt von der Spitze des Backlogs
- `generate-status-report` — Backlog-Burn-down speist Status-Berichte
- `conduct-retrospective` — Verbesserungspunkte aus der Retrospektive fliessen in den Backlog zurueck
