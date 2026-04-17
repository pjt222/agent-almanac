---
name: plan-release-cycle
description: >
  Einen Software-Release-Zyklus mit Meilensteinen, Feature Freezes,
  Release Candidates und Go/No-Go-Kriterien planen. Umfasst kalenderbasierte
  und funktionsbasierte Release-Strategien. Verwenden beim Beginn der Planung
  fuer ein Major- oder Minor-Versions-Release, beim Uebergang von Ad-hoc- zu
  strukturierter Release-Kadenz, bei der Koordination eines Releases ueber mehrere
  Teams oder Komponenten, bei der Definition von Qualitaets-Gates fuer ein
  reguliertes Projekt oder bei der Planung des ersten oeffentlichen Releases
  (v1.0.0) eines Projekts.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, release-planning, milestones, release-cycle
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Release-Zyklus planen

Einen strukturierten Software-Release-Zyklus planen durch Definition der Strategie (kalenderbasiert oder funktionsbasiert), Festlegung von Meilensteinen mit Zieldaten, Etablierung von Feature-Freeze-Kriterien, Verwaltung von Release Candidates, Definition von Go/No-Go-Checklisten und Dokumentation von Rollback-Plaenen. Erzeugt ein `RELEASE-PLAN.md`-Artefakt, das das Team von der Entwicklung bis zum Release leitet.

## Wann verwenden

- Beginn der Planung fuer ein Major- oder Minor-Versions-Release
- Uebergang von Ad-hoc-Releases zu einer strukturierten Release-Kadenz
- Koordination eines Releases ueber mehrere Teams oder Komponenten
- Definition von Qualitaets-Gates und Release-Kriterien fuer ein reguliertes Projekt
- Planung des ersten oeffentlichen Releases (v1.0.0) eines Projekts

## Eingaben

- **Erforderlich**: Ziel-Versionsnummer (z.B. v2.0.0)
- **Erforderlich**: Gewuenschtes Release-Datum oder Release-Fenster
- **Erforderlich**: Liste geplanter Funktionen oder Umfang (Backlog, Roadmap oder Beschreibung)
- **Optional**: Teamgroesse und Verfuegbarkeit
- **Optional**: Release-Strategie-Praeferenz (kalenderbasiert oder funktionsbasiert)
- **Optional**: Regulatorische oder Compliance-Anforderungen, die das Release beeinflussen
- **Optional**: Fruehere Release-Geschwindigkeit oder Zyklusdauerdaten

## Vorgehensweise

### Schritt 1: Release-Strategie bestimmen

Zwischen zwei primaeren Strategien waehlen:

**Kalenderbasiert** (zeitlich begrenzt):
- Release nach festem Zeitplan (z.B. alle 4 Wochen, quartalsweise)
- Funktionen, die nicht bereit sind, werden auf das naechste Release verschoben
- Vorhersagbar fuer Benutzer und nachgelagerte Projekte
- Am besten fuer: Bibliotheken, Frameworks, Werkzeuge mit externen Nutzern

**Funktionsbasiert** (umfangsgesteuert):
- Release, wenn ein definierter Satz von Funktionen vollstaendig ist
- Datum passt sich dem Umfang an
- Risiko von Umfangserweiterung und unbefristeten Verzoegerungen
- Am besten fuer: interne Werkzeuge, Erst-Releases, grosse Neuentwicklungen

Fuer die meisten Projekte funktioniert ein hybrider Ansatz gut: ein Zieldatum mit definiertem Umfang setzen, aber einen 1-2-Wochen-Puffer zulassen. Wenn der Umfang bis zur Puffer-Frist nicht erreicht ist, verbleibende Funktionen verschieben.

Die Strategiewahl mit Begruendung dokumentieren.

**Erwartet:** Release-Strategie mit Begruendung dokumentiert, passend zum Projektkontext.

**Bei Fehler:** Wenn sich das Team nicht auf eine Strategie einigen kann, standardmaessig kalenderbasiert mit einer Funktionsprioritaetsliste waehlen. Zeitliche Begrenzung erzwingt Priorisierungsentscheidungen.

### Schritt 2: Meilensteine definieren

Den Release-Zyklus in Phasen mit Zieldaten unterteilen:

```markdown
## Release Plan: v2.0.0

### Timeline

| Phase | Start | End | Duration | Description |
|---|---|---|---|---|
| Development | 2026-02-17 | 2026-03-14 | 4 weeks | Active feature development |
| Feature Freeze | 2026-03-15 | 2026-03-15 | 1 day | No new features merged after this date |
| Stabilization | 2026-03-15 | 2026-03-21 | 1 week | Bug fixes, documentation, testing only |
| RC1 | 2026-03-22 | 2026-03-22 | 1 day | First release candidate tagged |
| RC Testing | 2026-03-22 | 2026-03-28 | 1 week | Community/team testing of RC |
| RC2 (if needed) | 2026-03-29 | 2026-03-29 | 1 day | Second RC if critical issues found |
| Go/No-Go | 2026-03-31 | 2026-03-31 | 1 day | Final decision meeting |
| Release | 2026-04-01 | 2026-04-01 | 1 day | Tag, publish, announce |
```

Typische Phasendauern:
- **Entwicklung**: 50-70% des Gesamtzyklus
- **Stabilisierung**: 15-25% des Gesamtzyklus
- **RC-Tests**: 10-20% des Gesamtzyklus

**Erwartet:** Meilensteintabelle mit Daten, Dauern und Beschreibungen fuer jede Phase.

**Bei Fehler:** Wenn der Zeitplan zu komprimiert ist (Stabilisierung < 1 Woche), entweder das Release-Datum verlaengern oder den Umfang reduzieren. Niemals die Stabilisierung ueberspringen.

### Schritt 3: Feature-Freeze-Kriterien festlegen

Definieren, was "Feature Freeze" fuer dieses Release bedeutet:

```markdown
### Feature Freeze Criteria

After feature freeze (2026-03-15):
- **Allowed**: Bug fixes, test additions, documentation updates, dependency security patches
- **Not allowed**: New features, API changes, refactoring, dependency upgrades (non-security)
- **Exception process**: Feature freeze exceptions require written justification and approval from [release owner]

### Feature Priority List
| Priority | Feature | Status | Owner | Notes |
|---|---|---|---|---|
| P0 (must) | New export format | In progress | [Name] | Blocks release |
| P0 (must) | Security audit fixes | Not started | [Name] | Compliance requirement |
| P1 (should) | Performance optimization | In progress | [Name] | Defer if not ready |
| P2 (nice) | Dark mode support | Not started | [Name] | Defer to v2.1.0 if needed |
```

P0-Funktionen blockieren das Release. P1-Funktionen sollten eingeschlossen werden, wenn sie bereit sind. P2-Funktionen werden ohne Verzoegerung verschoben.

**Erwartet:** Feature-Freeze-Regeln mit Ausnahmeverfahren und priorisierter Funktionsliste dokumentiert.

**Bei Fehler:** Wenn P0-Funktionen Gefahr laufen, den Freeze-Termin zu verpassen, sofort eskalieren. Optionen: Entwicklungsphase verlaengern, die Funktion in eine kleinere Liefereinheit aufteilen oder auf ein Punkt-Release (v2.0.1) verschieben.

### Schritt 4: Release-Candidate-Prozess planen

Definieren, wie Release Candidates erzeugt und getestet werden:

```markdown
### Release Candidate Process

1. **RC1 Tag**: Tag from the stabilization branch after all P0 features merged and CI green
   ```bash
   git tag -a v2.0.0-rc.1 -m "Release candidate 1 for v2.0.0"
   ```

2. **RC Distribution**: Publish RC to staging/testing channel
   - R: `install.packages("pkg", repos = "https://staging.r-universe.dev/user")`
   - Node.js: `npm install pkg@next`
   - Internal: Deploy to staging environment

3. **RC Testing Period**: 5-7 business days
   - Run full test suite including integration tests
   - Verify all P0 features work as documented
   - Test upgrade path from previous version
   - Check for regressions in existing functionality

4. **RC Evaluation**:
   - **No critical/high bugs**: Proceed to release
   - **Critical bugs found**: Fix, tag RC2, restart testing period
   - **More than 2 RCs needed**: Revisit scope and timeline

5. **RC2+ Tags**: Only if critical issues found in previous RC
   ```bash
   git tag -a v2.0.0-rc.2 -m "Release candidate 2 for v2.0.0"
   ```
```

**Erwartet:** RC-Prozess dokumentiert mit Tagging-Konvention, Verteilungsmethode, Test-Checkliste und Eskalationskriterien.

**Bei Fehler:** Wenn der RC-Prozess uebersprungen wird (Druck zum Release), das Risiko dokumentieren. Ungetestete Releases haben eine hoehere Rollback-Wahrscheinlichkeit.

### Schritt 5: Go/No-Go-Checkliste definieren

Die Kriterien erstellen, die vor der Release-Freigabe erfuellt sein muessen:

```markdown
### Go/No-Go Checklist

#### Must Pass (release blocked if any fail)
- [ ] All CI checks passing on release branch
- [ ] Zero critical bugs open against this version
- [ ] Zero high-severity security vulnerabilities
- [ ] All P0 features verified and documented
- [ ] Changelog complete and reviewed
- [ ] Upgrade path tested from previous version (v1.x -> v2.0.0)
- [ ] License and attribution files up to date

#### Should Pass (release proceeds with documented risk)
- [ ] Zero high bugs open (non-critical)
- [ ] All P1 features included
- [ ] Performance benchmarks within acceptable range
- [ ] Documentation reviewed and spell-checked
- [ ] External dependencies at latest stable versions

#### Decision
- **Go**: All "Must Pass" items checked, majority of "Should Pass" items checked
- **No-Go**: Any "Must Pass" item unchecked
- **Conditional Go**: All "Must Pass" checked, significant "Should Pass" items unchecked — document accepted risks
```

**Erwartet:** Go/No-Go-Checkliste mit klaren Bestanden/Nicht-Bestanden-Kriterien und Entscheidungsregeln.

**Bei Fehler:** Wenn das Go/No-Go-Meeting zu einem No-Go fuehrt, die blockierenden Punkte identifizieren, Verantwortliche zuweisen, ein neues Zieldatum setzen (typischerweise 1-2 Wochen spaeter) und den Release-Plan aktualisieren.

### Schritt 6: Rollback-Plan dokumentieren

Definieren, wie zurueckgerollt wird, wenn das Release kritische Probleme in der Produktion verursacht:

```markdown
### Rollback Plan

#### Rollback Triggers
- Critical bug affecting >10% of users
- Data corruption or loss
- Security vulnerability introduced by the release
- Breaking change not documented in changelog

#### Rollback Procedure
1. **Revert package registry**: Unpublish or yank the release
   - R/CRAN: Contact CRAN maintainers (cannot self-unpublish)
   - npm: `npm unpublish pkg@2.0.0` (within 72 hours)
   - GitHub: Mark release as pre-release, publish point fix

2. **Communicate**: Notify users via GitHub issue, mailing list, or social channels
   - Template: "v2.0.0 has been rolled back due to [issue]. Please use v1.x.y until a fix is released."

3. **Fix forward**: Prefer a v2.0.1 patch release over a full rollback when possible

4. **Post-mortem**: Conduct a post-mortem within 48 hours of rollback to identify process gaps

#### Point Release Policy
- v2.0.1 for critical bug fixes within 1 week of release
- v2.0.2 for additional fixes within 2 weeks
- Patch releases do not require full RC cycle but must pass CI and critical test suite
```

Den vollstaendigen Release-Plan in `RELEASE-PLAN.md` oder `RELEASE-PLAN-v2.0.0.md` schreiben.

**Erwartet:** Rollback-Plan dokumentiert mit Ausloesern, Verfahren, Kommunikationsvorlage und Punkt-Release-Richtlinie. Vollstaendige RELEASE-PLAN.md geschrieben.

**Bei Fehler:** Wenn Rollback nicht machbar ist (z.B. Datenbankmigration bereits durchgefuehrt), stattdessen das Forward-Fix-Verfahren dokumentieren. Jedes Release sollte einen Wiederherstellungspfad haben.

## Validierung

- [ ] Release-Strategie (kalender-/funktionsbasiert/hybrid) mit Begruendung dokumentiert
- [ ] Meilensteintabelle enthaelt alle Phasen mit Daten: Entwicklung, Freeze, Stabilisierung, RC, Release
- [ ] Feature-Freeze-Kriterien mit erlaubten/nicht erlaubten Aenderungstypen definiert
- [ ] Funktionsprioritaetsliste kategorisiert (P0 muss / P1 sollte / P2 wuenschenswert)
- [ ] RC-Prozess dokumentiert: Tagging-Konvention, Verteilung, Testzeitraum, Eskalation
- [ ] Go/No-Go-Checkliste hat klare "Muss bestehen"- und "Sollte bestehen"-Abschnitte
- [ ] Rollback-Plan enthaelt Ausloeser, Verfahren und Kommunikationsvorlage
- [ ] RELEASE-PLAN.md (oder Aequivalent) erstellt und gespeichert
- [ ] Zeitplan ist realistisch (Stabilisierung betraegt mindestens 15% des Gesamtzyklus)

## Haeufige Stolperfallen

- **Keine Stabilisierungsphase**: Direkt von Entwicklung zum Release gehen. Selbst eine 3-taegige Stabilisierungsphase entdeckt Probleme, die aktive Entwicklung maskiert
- **Umfangserweiterung nach Freeze**: "Nur noch eine Funktion" nach Feature Freeze zulassen. Jede Post-Freeze-Ergaenzung setzt Tests zurueck und fuehrt zu Regressionsrisiko
- **P0-Risiken ignorieren**: Nicht fruehzeitig eskalieren, wenn eine P0-Funktion gefaehrdet ist. Je frueher der Umfang angepasst wird, desto weniger Stoerung fuer den Zeitplan
- **RC fuer "kleine" Releases ueberspringen**: Auch Minor-Releases profitieren von mindestens einem RC. Ein Tag RC-Tests ist guenstiger als ein Post-Release-Hotfix
- **Kein Rollback-Plan**: Annehmen, dass das Release erfolgreich sein wird. Jeder Release-Plan sollte "Was wenn das schiefgeht?" vor der Veroeffentlichung beantworten
- **Kalenderdruck ueberwiegt Qualitaet**: An einem Datum releasen, weil es versprochen wurde, trotz Nichtbestehens der Go/No-Go-Kriterien. Ein verspaetetes Release ist eine kleine Unannehmlichkeit; ein kaputtes Release ist ein Vertrauensbruch

## Verwandte Skills

- `apply-semantic-versioning` — Die Versionsnummer fuer das geplante Release bestimmen
- `manage-changelog` — Das Changelog pflegen, das in die Release Notes einfliesst
- `plan-sprint` — Sprint-Planung innerhalb der Entwicklungsphase des Release-Zyklus
- `draft-project-charter` — Projektcharta kann die Release-Roadmap und Erfolgskriterien definieren
- `generate-status-report` — Fortschritt gegen Release-Meilensteine verfolgen
