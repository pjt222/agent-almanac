---
name: polish-claw-project
description: >
  Contribute to OpenClaw ecosystem projects (OpenClaw, NemoClaw, NanoClaw)
  through a structured 9-step workflow: target verification, codebase
  exploration, parallel audit, finding cross-reference, and pull request
  creation. Emphasizes false positive prevention and project convention
  adherence.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Claw-Projekt polieren

Strukturierter Workflow zum Beitragen zu OpenClaw-Oekosystem-Projekten. Der neuartige Wert liegt in den Schritten 5-7: parallele Pruefung, Vermeidung von False Positives und Querverweisen von Befunden gegen offene Issues um hoch-impactvolle Beitraege auszuwaehlen. Mechanische Schritte (Fork, PR-Erstellung) delegieren an existierende Skills.

## Wann verwenden

- Beitragen zu NVIDIA/OpenClaw, NVIDIA/NemoClaw, NVIDIA/NanoClaw oder aehnlichen Claw-Oekosystem-Repos
- Erstmalige Beitraege zu einem unvertrauten Open-Source-Projekt mit sicherheits-sensibler Architektur
- Wenn ein wiederholbarer, auditierbarer Beitrags-Workflow statt Ad-hoc-Fixes gewuenscht ist
- Nach Identifikation eines Claw-Projekts das externe Beitraege akzeptiert (CONTRIBUTING.md pruefen)

## Eingaben

- **Erforderlich**: `repo_url` — GitHub-URL des Ziel-Claw-Projekts (z.B. `https://github.com/NVIDIA/NemoClaw`)
- **Optional**:
  - `contribution_count` — Anzahl Beitraege zu anvisieren (Standard: 1-3)
  - `focus` — Bevorzugter Beitrags-Typ: `security`, `tests`, `docs`, `bugs`, `any` (Standard: `any`)
  - `fork_org` — GitHub-Org/-Benutzer in den geforkt werden soll (Standard: authentifizierter Benutzer)

## Vorgehensweise

### Schritt 1: Ziel identifizieren und verifizieren

Bestaetigen dass das Projekt externe Beitraege akzeptiert und aktiv gepflegt wird.

1. Die Repository-URL oeffnen und `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` und `LICENSE` lesen
2. Aktuelle Commit-Aktivitaet pruefen (letzte 30 Tage) und offene PR-Merge-Rate
3. Verifizieren dass das Projekt eine permissive oder beitragsfreundliche Lizenz nutzt
4. `SECURITY.md` oder Sicherheits-Politik falls vorhanden lesen — Responsible-Disclosure-Regeln vermerken
5. Die primaere Sprache, Test-Framework und CI-System identifizieren

**Erwartet:** CONTRIBUTING.md existiert, Commits innerhalb der letzten 30 Tage, klare Beitrags-Guidelines.

**Bei Fehler:** Wenn keine CONTRIBUTING.md oder keine aktuelle Aktivitaet, dokumentieren warum und stoppen — veraltete Projekte mergen externe PRs selten.

### Schritt 2: Forken und klonen

Eine Arbeitskopie des Repositories erstellen.

1. Forken: `gh repo fork <repo_url> --clone`
2. Upstream-Remote setzen: `git remote add upstream <repo_url>`
3. Verifizieren: `git remote -v` zeigt sowohl `origin` (Fork) als auch `upstream`
4. Synchronisieren: `git fetch upstream && git checkout main && git merge upstream/main`

**Erwartet:** Lokaler Klon mit beiden Remotes konfiguriert und aktuell.

**Bei Fehler:** Wenn Forken scheitert, GitHub-Authentifizierung pruefen (`gh auth status`). Wenn Klonen langsam ist, `--depth=1` fuer initiale Erkundung versuchen.

### Schritt 3: Codebasis erkunden

Ein mentales Modell der Projekt-Architektur aufbauen.

1. `README.md` fuer Architektur-Ueberblick und Projektziele lesen
2. Eintrittspunkte, Kernmodule und oeffentliche API-Oberflaeche identifizieren
3. Die Test-Struktur kartieren: wo Tests leben, welches Framework, Coverage-Level
4. Code-Stil-Konventionen vermerken: Linter-Konfig, Namens-Muster, Import-Stil
5. Auf Docker/Container-Setup, CI-Konfiguration und Deployment-Muster pruefen

**Erwartet:** Klares Verstaendnis der Projektstruktur, Konventionen und wo Beitraege passen wuerden.

**Bei Fehler:** Wenn Architektur unklar ist, auf ein spezifisches Subsystem statt das ganze Projekt fokussieren.

### Schritt 4: Offene Issues lesen

Existierende Issues durchgehen um Projektbeduerfnisse zu verstehen und doppelte Arbeit zu vermeiden.

1. Offene Issues auflisten: `gh issue list --state open --limit 50`
2. Nach Typ kategorisieren: Bugs, Features, Docs, Security, good-first-issue
3. Issues mit Labels `help wanted`, `good first issue` oder `hacktoberfest` vermerken
4. Auf veraltete Issues (>90 Tage offen, keine aktuellen Kommentare) pruefen — diese koennen verlassen sein
5. Verlinkte PRs lesen um versuchte Loesungen zu verstehen

**Erwartet:** Kategorisierte Liste nicht beanspruchter Issues mit Typ-Labels.

**Bei Fehler:** Wenn keine offenen Issues existieren, zu Schritt 5 fortfahren — die Pruefung kann nicht gelistete Verbesserungen aufdecken.

### Schritt 5: Parallele Pruefung

Sicherheits- und Code-Qualitaets-Pruefungen parallel ausfuehren. Hier tauchen neuartige Befunde auf.

1. `security-audit-codebase`-Skill gegen das Projekt-Root ausfuehren
2. Gleichzeitig `review-codebase`-Skill mit Scope `quality` ausfuehren
3. **Kritisch: jeden Befund gegen das Bedrohungsmodell und die Architektur des Projekts verifizieren**
   - Ein "hartcodiertes Geheimnis" in einem Sandbox-Bootstrap-Skript ist keine Schwachstelle
   - Eine fehlende Eingabe-Validierung an einer nur-internen Funktion ist niedrige Schwere
   - Eine als verwundbar markierte Abhaengigkeit kann bereits durch die Architektur des Projekts gemildert sein
4. Verifizierte Befunde bewerten: CRITICAL, HIGH, MEDIUM, LOW
5. False Positives mit Begruendung dokumentieren — sie informieren Common Pitfalls fuer zukuenftige Laeufe

**Erwartet:** Liste verifizierter Befunde mit Schwere-Bewertungen und False-Positive-Annotationen.

**Bei Fehler:** Wenn keine Befunde auftauchen, Fokus auf Test-Coverage-Luecken, Dokumentations-Verbesserungen oder Developer-Experience-Verbesserungen verschieben.

### Schritt 6: Befunde querverweisen

Verifizierte Audit-Befunde auf offene Issues abbilden — der Kern-Urteilsschritt.

1. Fuer jeden verifizierten Befund offene Issues nach verwandten Diskussionen durchsuchen
2. Jeden Befund kategorisieren als:
   - **Passt zu offenem Issue** — den Befund mit dem Issue verlinken
   - **Neuer Befund** — kein existierendes Issue deckt dies ab
   - **Bereits in PR gefixt** — offene PRs auf laufende Fixes pruefen
3. Befunde priorisieren die existierenden Issues entsprechen (hoechste Merge-Wahrscheinlichkeit)
4. Fuer neue Befunde einschaetzen ob die Maintainer den Fix basierend auf Projekt-Prioritaeten begruessen wuerden

**Erwartet:** Priorisierte Liste mit Befund-zu-Issue-Mapping und Merge-Wahrscheinlichkeits-Bewertung.

**Bei Fehler:** Wenn alle Befunde bereits adressiert sind, zu Schritt 4 zurueckkehren und nach Dokumentations-, Test- oder Developer-Experience-Beitraegen suchen.

### Schritt 7: Beitraege auswaehlen

1-3 Beitraege basierend auf Impact, Aufwand und Expertise auswaehlen.

1. Jeden Kandidaten bewerten auf:
   - **Impact**: Wie sehr verbessert dies das Projekt? (Sicherheit > Bugs > Tests > Docs)
   - **Aufwand**: Kann dies in einer fokussierten Sitzung gut erledigt werden? (kleine, vollstaendige PRs bevorzugen)
   - **Expertise**: Hat der Contributor Domaenen-Wissen fuer diesen Fix?
   - **Merge-Wahrscheinlichkeit**: Passt dies zu erklaerten Projekt-Prioritaeten?
2. Die Top-Kandidaten auswaehlen (Standard: 1-3)
3. Fuer jeden definieren: Branch-Name, Scope-Grenze, Akzeptanzkriterien, Test-Plan

**Erwartet:** 1-3 ausgewaehlte Beitraege mit klarem Scope und Akzeptanzkriterien.

**Bei Fehler:** Wenn keine Beitraege gut bewertet werden, in Erwaegung ziehen gut geschriebene Issues statt PRs einzureichen.

### Schritt 8: Implementieren

Einen Branch pro Beitrag erstellen und den Fix implementieren.

1. Fuer jeden Beitrag: `git checkout -b fix/<description>`
2. Projekt-Konventionen exakt folgen (Linter, Naming, Import-Stil)
3. Tests die die Aenderung abdecken hinzufuegen oder aktualisieren
4. Die Test-Suite des Projekts ausfuehren: verifizieren dass alle Tests bestehen
5. Den Linter des Projekts ausfuehren: verifizieren dass keine neuen Warnings
6. Jeden PR fokussiert halten — eine logische Aenderung pro Branch

**Erwartet:** Saubere Implementation mit bestehenden Tests und keinen Linter-Warnings.

**Bei Fehler:** Wenn Tests an vorbestehenden Problemen scheitern, sie dokumentieren und sicherstellen dass der PR keine neuen Versagen einfuehrt.

### Schritt 9: Pull Requests erstellen

Beitraege gemaess CONTRIBUTING.md des Projekts einreichen.

1. Branch pushen: `git push origin fix/<description>`
2. PR mit `create-pull-request`-Skill erstellen
3. Das verwandte Issue im PR-Body referenzieren (z.B. "Fixes #123")
4. Dem PR-Template des Projekts folgen falls eines existiert
5. Auf Reviewer-Feedback reagieren — schnell iterieren

**Erwartet:** PRs erstellt, mit Issues verlinkt, Projekt-Konventionen folgend.

**Bei Fehler:** Wenn PR-Erstellung scheitert, Branch-Schutz-Regeln und Contributor-License-Agreements pruefen.

## Validierung

1. Alle ausgewaehlten Beitraege wurden implementiert und als PRs eingereicht
2. Jeder PR referenziert das verwandte Issue (falls eines existiert)
3. Alle Projekt-Tests bestehen auf jedem PR-Branch
4. Keine False-Positive-Befunde wurden als echte Issues eingereicht
5. PR-Beschreibungen folgen dem CONTRIBUTING.md-Template des Projekts

## Haeufige Stolperfallen

- **False-Positive-Ueberanspruch**: Claw-Projekte nutzen Sandbox-Architekturen — eine "Schwachstelle" innerhalb einer gesandboxten Umgebung kann beabsichtigt sein. Immer gegen das Bedrohungsmodell des Projekts verifizieren bevor berichtet wird.
- **Digest-/Signatur-Ketten-Stoerung**: Claw-Projekte nutzen oft Verifikations-Ketten fuer Modell-Integritaet. Aenderungen muessen diese Ketten erhalten oder der PR wird abgelehnt.
- **Konventions-Mismatch**: Claw-Projekte erzwingen strikten Stil. Den eigenen Linter des Projekts ausfuehren, keinen generischen. Import-Reihenfolge, Docstring-Format und Test-Muster exakt entsprechen.
- **Scope-Creep**: 3 fokussierte PRs mergen schneller als 1 ausufernder PR. Jeden Beitrag atomar halten.
- **Veralteter Fork**: Vor Arbeitsbeginn immer mit Upstream synchronisieren (`git fetch upstream && git merge upstream/main`).

## Verwandte Skills

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — in Schritt 5 fuer Sicherheits-Befunde verwendet
- [review-codebase](../review-codebase/SKILL.md) — in Schritt 5 fuer Code-Qualitaets-Review verwendet
- [create-pull-request](../create-pull-request/SKILL.md) — in Schritt 9 fuer PR-Erstellung verwendet
- [create-github-issues](../create-github-issues/SKILL.md) — zum Einreichen von Issues aus Befunden die nicht als PRs adressiert werden
- [manage-git-branches](../manage-git-branches/SKILL.md) — Branch-Verwaltung waehrend Implementation
- [commit-changes](../commit-changes/SKILL.md) — Commit-Workflow
