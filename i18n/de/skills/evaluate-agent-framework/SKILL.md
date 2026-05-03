---
name: evaluate-agent-framework
description: >
  Assess an open-source agent framework for investment readiness by evaluating
  community health, supersession risk, architecture alignment, and governance
  sustainability. Produces a four-tier classification (INVEST / EVALUATE-FURTHER /
  CONTRIBUTE-CAUTIOUSLY / AVOID) to guide resource allocation decisions before
  committing engineering effort.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, framework-evaluation, risk-assessment, community-health, supersession, investment
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Agent-Framework evaluieren

Strukturierte Bewertung der Investitionsbereitschaft eines Open-Source-Agent-Frameworks. Der neuartige Wert liegt in Schritten 2-3: Quantifizierung der Community-Gesundheit durch Beitrags-Ueberlebensraten und Messung des Supersession-Risikos — der haeufigste Grund warum externer Engineering-Aufwand verschwendet wird. Die finale Klassifikation (INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID) kalibriert Ressourcenallokation bevor Entwicklungszyklen verpflichtet werden.

## Wann verwenden

- Bewerten ob ein Agent-Framework fuer Production-Use uebernommen werden soll
- Abhaengigkeitsrisiko auf einem Framework einschaetzen auf das das Projekt sich verlaesst
- Entscheiden ob Engineering-Aufwand zu einem externen Projekt beigetragen werden soll
- Konkurrierende Frameworks fuer eine Build-vs-Adopt-Entscheidung vergleichen
- Ein Framework nach einem Major-Release, Governance-Wechsel oder Acquisition neu bewerten

## Eingaben

- **Erforderlich**: `framework_url` — GitHub-URL des Framework-Repositories
- **Optional**:
  - `comparison_frameworks` — Liste alternativer Framework-URLs zum Benchmarken
  - `use_case` — beabsichtigter Anwendungsfall fuer Architektur-Alignment-Bewertung (z.B. "multi-agent orchestration", "tool-use pipelines")
  - `contribution_budget` — geplante Engineering-Stunden, zur Kalibrierung der Investitions-Stufe

## Vorgehensweise

### Schritt 1: Framework-Zensus sammeln

Grundlegende Daten ueber Groesse, Aktivitaet und Landscape-Position des Projekts vor tieferer Analyse sammeln.

1. `README.md`, `CONTRIBUTING.md`, `LICENSE` und alle Architektur-Docs (`docs/`, `ARCHITECTURE.md`) abrufen und lesen
2. Quantitative Metriken sammeln:
   - Stars, Forks, offene Issues, offene PRs: `gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - Abhaengige Repositories: GitHubs "Used by"-Anzahl pruefen oder `gh api repos/<owner>/<repo>/dependents`
   - Release-Kadenz: `gh release list --limit 10` — Frequenz vermerken und ob Releases semver folgen
3. Bus-Faktor berechnen: Top-5-Contributors nach Commit-Anzahl ueber die letzten 12 Monate identifizieren. Wenn der Top-Contributor >60% der Commits ausmacht, ist der Bus-Faktor kritisch niedrig
4. Landscape-Position kartieren:
   - **Pioneer**: First Mover, definiert die Kategorie (hoher Einfluss, hohes Supersession-Risiko fuer Follower)
   - **Fast-Follower**: innerhalb 6 Monaten nach dem Pioneer gestartet, iteriert ueber das Konzept
   - **Spaet-Einsteiger**: nach Stabilisierung der Kategorie angekommen, konkurriert ueber Features oder Governance
5. Wenn `comparison_frameworks` angegeben ist, dieselben Metriken fuer jede Alternative sammeln

**Erwartet:** Zensus-Tabelle mit Stars, Forks, Dependents, Release-Kadenz, Bus-Faktor und Landscape-Position fuer das Ziel (und Vergleiche falls bereitgestellt).

**Bei Fehler:** Wenn das Repository privat oder API-rate-limitiert ist, auf manuelle README-Analyse zurueckfallen. Wenn Metriken nicht verfuegbar sind (z.B. selbst gehostetes GitLab), die Luecke vermerken und mit qualitativer Bewertung fortfahren.

### Schritt 2: Community-Gesundheit bewerten

Quantifizieren ob das Projekt externe Beitragende willkommen heisst, unterstuetzt und haelt.

1. Die **externe Beitrags-Ueberlebensrate** berechnen:
   - Die letzten 50 geschlossenen PRs ziehen: `gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - Jeden PR-Autor als intern (Org-Mitglied) oder extern klassifizieren
   - Berechnen: `survival_rate = merged_external_PRs / total_external_PRs`
   - Gesunder Schwellwert: >50% Ueberlebensrate; bedenklich: <30%
2. Reaktivitaet messen:
   - **Issue-Erstantwort-Zeit**: Median-Zeit von Issue-Erstellung zu erstem Maintainer-Kommentar
   - **PR-Merge-Latenz**: Median-Zeit von PR-Eroeffnung bis Merge fuer externe PRs
   - Gesund: <7 Tage Erstantwort, <30 Tage Merge; bedenklich: >30 Tage Erstantwort
3. Contributor-Diversitaet einschaetzen:
   - Externes/internes Contributor-Verhaeltnis ueber die letzten 6 Monate
   - Anzahl einzigartiger externer Contributors mit >=2 gemergten PRs (wiederkehrende Contributors signalisieren ein gesundes Oekosystem)
4. Governance-Artefakte pruefen:
   - `CONTRIBUTING.md` existiert und ist umsetzbar (nicht nur "PR einreichen")
   - `CODE_OF_CONDUCT.md` existiert
   - Governance-Docs beschreiben den Entscheidungsprozess
   - Issue-/PR-Templates leiten Beitragende

**Erwartet:** Community-Gesundheits-Scorecard mit Ueberlebensrate, Antwortzeiten, Diversitaets-Verhaeltnis und Governance-Artefakt-Checkliste.

**Bei Fehler:** Wenn PR-Daten unzureichend sind (neues Projekt mit <20 geschlossenen PRs), die Stichprobengroessen-Beschraenkung vermerken und andere Signale staerker gewichten. Wenn das Projekt eine Nicht-GitHub-Plattform nutzt, die Queries an die API dieser Plattform anpassen.

### Schritt 3: Supersession-Risiko berechnen

Bestimmen wie wahrscheinlich es ist dass externe Beitraege durch interne Entwicklung obsolet gemacht werden — das groesste Einzelrisiko fuer Framework-Adopters und -Beitragende.

1. Die letzten 50-100 gemergten externen PRs sampeln (oder alle wenn weniger existieren)
2. Fuer jeden gemergten externen PR pruefen ob der beigetragene Code spaeter:
   - **Reverted**: expliziter Revert-Commit der den PR referenziert
   - **Rewritten**: dieselbe Datei/Modul innerhalb 90 Tagen wesentlich von einem internen Contributor geaendert
   - **Obsoleted**: Feature in einem nachfolgenden Release entfernt oder ersetzt
3. Berechnen: `supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. Die veroeffentlichte Roadmap (falls verfuegbar) gegen Bereiche kartieren in denen externe Contributors aktiv sind:
   - Hohe Ueberlappung = hohes Supersession-Risiko (Interne werden ueber externe Arbeit bauen)
   - Niedrige Ueberlappung = niedrigeres Supersession-Risiko (Externe fuellen Luecken die Interne nicht fuellen werden)
5. Auf "Beitrags-Fallen" pruefen: Bereiche die beitragsfreundlich aussehen aber fuer internen Rewrite geplant sind
6. Referenz-Benchmark: NemoClaw-Analyse zeigte 71% externe PRs innerhalb 6 Monaten superseded — als Kalibrierungspunkt nutzen

**Erwartet:** Supersession-Rate als Prozentsatz, mit Aufschluesselung nach Typ (reverted/rewritten/obsoleted). Roadmap-Ueberlappungs-Bewertung.

**Bei Fehler:** Wenn die Commit-Historie flach oder squash-merged ist (Attribution verloren), Supersession schaetzen indem externe PR-Dateipfade gegen in nachfolgenden Releases geaenderte Dateien verglichen werden. Reduziertes Vertrauen in die Schaetzung vermerken.

### Schritt 4: Architektur-Alignment evaluieren

Bewerten ob die Architektur des Frameworks deinen Anwendungsfall ohne uebermaessigen Lock-in unterstuetzt.

1. Erweiterungspunkte kartieren:
   - Plugin-/Extension-API: legt das Framework eine dokumentierte Plugin-Schnittstelle offen?
   - Konfigurations-Oberflaeche: kann Verhalten ohne Forking angepasst werden?
   - Hook-/Callback-System: kannst du Framework-Verhalten an Schluesselpunkten abfangen und modifizieren?
2. Lock-in-Risiko einschaetzen:
   - **Rewrite-Kosten**: Engineering-Aufwand zum Wegmigrieren schaetzen (Tage/Wochen/Monate)
   - **Datenportabilitaet**: koennen Daten/State in Standardformaten exportiert werden?
   - **Standard-Compliance**: nutzt das Framework offene Standards (agentskills.io, MCP, A2A) oder proprietaere Protokolle?
3. API-Stabilitaet evaluieren:
   - Breaking Changes pro Major-Release zaehlen (CHANGELOG, Migrations-Guides)
   - Auf Deprecation-Policy pruefen (Vorwarnung vor Entfernung)
   - Semver-Compliance einschaetzen (Breaking Changes nur in Major-Versionen)
4. Alignment mit dem spezifischen Anwendungsfall pruefen:
   - Wenn `use_case` angegeben ist, evaluieren ob die Framework-Architektur ihn natuerlich unterstuetzt
   - Architektonische Mismatches identifizieren die Workarounds erfordern wuerden
5. Interoperabilitaet evaluieren:
   - agentskills.io-Kompatibilitaet (Skill-Modell-Alignment)
   - MCP-Unterstuetzung (Tool-Integration)
   - A2A-Protokoll-Unterstuetzung (Agent-zu-Agent-Kommunikation)

**Erwartet:** Architektur-Alignment-Bericht mit Erweiterungspunkt-Inventar, Lock-in-Risiko-Bewertung (niedrig/mittel/hoch), API-Stabilitaets-Score und Anwendungsfall-Fit-Bewertung.

**Bei Fehler:** Wenn Architektur-Dokumentation duenn ist, die Bewertung aus Code-Struktur und oeffentlicher API-Oberflaeche ableiten. Wenn das Framework zu jung fuer Stabilitaets-Historie ist, dies vermerken und Governance-Signale staerker gewichten.

### Schritt 5: Governance und Nachhaltigkeit bewerten

Evaluieren ob das Governance-Modell des Projekts langfristige Lebensfaehigkeit und faire Behandlung externer Beitragender unterstuetzt.

1. Governance-Modell klassifizieren:
   - **BDFL** (Benevolent Dictator for Life): einzelner Entscheider — schnelle Entscheidungen, Bus-Faktor-Risiko
   - **Komitee/Core-Team**: verteilte Entscheidungsfindung — langsamer aber widerstandsfaehiger
   - **Foundation-backed**: formale Governance (Apache, Linux Foundation, CNCF) — am nachhaltigsten
   - **Corporate-controlled**: einzelnes Unternehmen treibt Entwicklung — auf Rug-Pull-Risiko achten
2. Funding und Nachhaltigkeit einschaetzen:
   - Funding-Quellen: VC-backed, corporate-sponsored, Grants, community-finanziert, unfinanziert
   - Vollzeit-Maintainer-Anzahl: >=2 ist gesund; 0 ist eine rote Flagge
   - Umsatzmodell (falls vorhanden): wie haelt sich das Projekt selbst?
3. Contributor-Schutz evaluieren:
   - Lizenztyp: permissiv (MIT, Apache-2.0) vs. copyleft (GPL) vs. custom
   - CLA-Anforderungen: ueberfuehrt das Unterzeichnen einer CLA Rechte die Beitragende benachteiligen?
   - Contributor-Anerkennung: werden externe Beitragende in Releases, Changelogs, Docs gewuerdigt?
4. Sicherheits-Posture pruefen:
   - Sicherheits-Disclosure-Policy (`SECURITY.md` oder Aequivalent)
   - Median-Zeit von CVE-Disclosure zu Patch-Release
   - Dependency-Update-Praktiken (Dependabot, Renovate, manuell)
5. Trajektorie einschaetzen:
   - Entwickelt sich das Governance-Modell (z.B. Bewegung in Richtung Foundation)?
   - Gab es kuerzlich einen Leadership-Wechsel, eine Acquisition oder Re-Lizenzierung?
   - Gibt es oeffentliche Konflikte zwischen Maintainern und Beitragenden?

**Erwartet:** Governance-Bewertung mit Modell-Klassifikation, Nachhaltigkeitsbewertung (nachhaltig/at-risk/kritisch), Contributor-Schutz-Bewertung und Sicherheits-Posture-Zusammenfassung.

**Bei Fehler:** Wenn Governance-Information undokumentiert ist, die Abwesenheit selbst als Gelb-Flagge behandeln. Auf implizite Governance pruefen indem geprueft wird wer PRs merged, wer Issues schliesst und wer Release-Entscheidungen trifft.

### Schritt 6: Investitions-Bereitschaft klassifizieren

Alle Befunde in eine Vier-Stufen-Klassifikation mit spezifischen Begruendungen und umsetzbaren Empfehlungen synthetisieren.

1. Jede Dimension scoren (1-5-Skala):
   - **Community-Gesundheit**: Ueberlebensrate, Reaktivitaet, Diversitaet
   - **Supersession-Risiko**: Rate, Roadmap-Ueberlappung, Beitrags-Fallen (invertieren: niedriger ist besser)
   - **Architektur-Alignment**: Erweiterungspunkte, Lock-in, Stabilitaet, Anwendungsfall-Fit
   - **Governance-Nachhaltigkeit**: Modell, Funding, Schutz, Sicherheit
2. Klassifikations-Schwellwerte anwenden:
   - **INVEST** (alle Dimensionen >=4): Gesunde Community, niedriges Supersession (<20%), aligntierte Architektur, nachhaltige Governance. Sicher zu uebernehmen und Engineering-Aufwand beizutragen.
   - **EVALUATE-FURTHER** (gemischt, keine Dimension <2): Gemischte Signale die spezifische Follow-ups erfordern. Dokumentieren was Klaerung braucht und ein Re-Evaluierungs-Datum setzen.
   - **CONTRIBUTE-CAUTIOUSLY** (irgendeine Dimension 2, keine <2): Hohes Supersession (>40%) oder Governance-Bedenken. Beitraege auf explizit angefragte Arbeit, vom Maintainer genehmigten Scope oder Plugin-/Extension-Entwicklung beschraenken die vom Core entkoppelt ist.
   - **AVOID** (irgendeine Dimension 1): Kritische rote Flaggen — verlassenes Projekt, externen-feindlich (Ueberlebensrate <15%), inkompatible Lizenz oder unmittelbare Rug-Pull-Indikatoren. Keinen Engineering-Aufwand investieren.
3. Den Klassifikations-Bericht schreiben:
   - Mit der Stufen-Klassifikation und einsatzartiger Begruendung beginnen
   - Jeden Dimensions-Score mit Schluessel-Evidenz zusammenfassen
   - Wenn `contribution_budget` angegeben war, empfehlen wie diese Stunden gegeben der Stufe alloziert werden sollen
   - Fuer EVALUATE-FURTHER spezifische Fragen auflisten die Antworten brauchen und einen Zeitplan vorschlagen
   - Fuer CONTRIBUTE-CAUTIOUSLY spezifizieren welche Beitragstypen sicher (Plugins, Docs, Tests) vs. riskant (Core-Features) sind
4. Wenn `comparison_frameworks` evaluiert wurden, eine Vergleichsmatrix produzieren die alle Frameworks rangiert

**Erwartet:** Klassifikations-Bericht mit Stufe, Dimensions-Scores, Evidenz-Zusammenfassung und umsetzbaren Empfehlungen massgeschneidert auf den Investitions-Kontext.

**Bei Fehler:** Wenn Datenluecken sichere Klassifikation verhindern, auf EVALUATE-FURTHER defaulten mit expliziter Dokumentation was an Daten fehlt und wie man sie erhaelt. Niemals auf INVEST defaulten wenn unsicher.

## Validierung

- [ ] Zensus-Daten gesammelt: Stars, Forks, Dependents, Release-Kadenz, Bus-Faktor, Landscape-Position
- [ ] Community-Gesundheit quantifiziert: Ueberlebensrate, Antwortzeiten, Contributor-Diversitaet, Governance-Artefakte
- [ ] Supersession-Risiko berechnet mit Aufschluesselung nach Typ (reverted/rewritten/obsoleted)
- [ ] Architektur-Alignment bewertet: Erweiterungspunkte, Lock-in-Risiko, API-Stabilitaet, Anwendungsfall-Fit
- [ ] Governance evaluiert: Modell, Funding, Contributor-Schutz, Sicherheits-Posture
- [ ] Klassifikation produziert: eine von INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID
- [ ] Jeder Dimensions-Score mit spezifischer Evidenz aus der Analyse begruendet
- [ ] Empfehlungen sind umsetzbar und auf das Beitragsbudget kalibriert (falls bereitgestellt)
- [ ] Datenluecken und Vertrauensbeschraenkungen explizit dokumentiert

## Haeufige Stolperfallen

- **Popularitaet mit Gesundheit verwechseln**: Hohe Stars aber niedrige Contributor-Diversitaet bedeutet einen Single Point of Failure. Ein 50k-Star-Projekt mit einem Maintainer ist weniger gesund als ein 2k-Star-Projekt mit 15 aktiven Contributors.
- **Supersession-Risiko ignorieren**: Der haeufigste Grund warum externe Beitraege scheitern. Eine einladende Community bedeutet nichts wenn interne Entwicklung externe Arbeit routinemaessig ueberschreibt.
- **Architektur ueberzgewichten ohne Governance zu pruefen**: Ein wunderschoen entworfenes Framework kann immer noch scheitern wenn das Governance-Modell unhaltbar oder externen-feindlich ist.
- **EVALUATE-FURTHER als AVOID behandeln**: Gemischte Signale erfordern Untersuchung, nicht Ablehnung. Ein konkretes Re-Evaluierungs-Datum setzen und die spezifischen zu beantwortenden Fragen auflisten.
- **Snapshot-Verzerrung**: Alle Metriken sind Punkt-in-Zeit. Ein abnehmendes Projekt mit grossartigen aktuellen Metriken ist schlimmer als ein verbesserndes Projekt mit mittelmaessigen aktuellen Metriken. Immer die Trend-Richtung ueber 6-12 Monate pruefen.
- **CLA-Selbstzufriedenheit**: Manche CLAs ueberfuehren Copyright zum Projekteigentuemer, was bedeutet dass deine Beitraege ihr proprietaerer Vermoegenswert werden. Den CLA-Text lesen, nicht nur die Checkbox.
- **Auf einem einzelnen Framework ankern**: Ohne Vergleichsframeworks sieht jedes Projekt entweder grossartig oder schrecklich aus. Immer gegen mindestens eine Alternative benchmarken, auch informell.

## Verwandte Skills

- [polish-claw-project](../polish-claw-project/SKILL.md) — Beitrags-Workflow den diese Bewertung informiert
- [review-software-architecture](../review-software-architecture/SKILL.md) — in Schritt 4 fuer Architektur-Bewertung verwendet
- [forage-solutions](../forage-solutions/SKILL.md) — Alternative-Framework-Entdeckung fuer Vergleich
- [search-prior-art](../search-prior-art/SKILL.md) — Landscape-Mapping und Prior-Work-Analyse
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — Sicherheits-Posture-Bewertung in Schritt 5 referenziert
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — Lizenz- und IP-Risiko-Analyse
