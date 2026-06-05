---
name: r-package-review
description: Multi-Agenten-Team fuer umfassende R-Paket-Qualitaetspruefung in den Bereichen Codequalitaet, Architektur und Sicherheit
lead: r-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [R, code-review, quality, package-development]
coordination: hub-and-spoke
members:
  - id: r-developer
    role: Lead
    responsibilities: Verteilt Pruefungsaufgaben, prueft R-spezifische Konventionen (roxygen2, NAMESPACE, testthat), synthetisiert abschliessenden Pruefbericht
  - id: code-reviewer
    role: Qualitaetspruefer
    responsibilities: Prueft Codestil, Testabdeckung, Pull-Request-Qualitaet und allgemeine Best Practices
  - id: senior-software-developer
    role: Architekturpruefer
    responsibilities: Bewertet Paketstruktur, API-Design, Abhaengigkeitsmanagement, SOLID-Prinzipien und technische Schulden
  - id: security-analyst
    role: Sicherheitspruefer
    responsibilities: Auditiert auf offengelegte Geheimnisse, Eingabevalidierung, sichere Dateioperationen und Abhaengigkeitsschwachstellen
locale: de
source_locale: en
source_commit: 6a868d56
translator: claude-opus-4-6
translation_date: 2026-03-13
---

# R-Paket-Review-Team

Ein Vier-Agenten-Team, das eine umfassende Qualitaetspruefung von R-Paketen durchfuehrt. Der Leiter (r-developer) orchestriert parallele Reviews ueber Codequalitaet, Architektur und Sicherheit und synthetisiert die Ergebnisse in einen einheitlichen Bericht.

## Zweck

R-Paketentwicklung profitiert von mehreren Review-Perspektiven, die ein einzelner Agent nicht gleichzeitig bieten kann. Dieses Team zerlegt die Paketpruefung in vier komplementaere Fachgebiete:

- **R-Konventionen**: roxygen2-Dokumentation, NAMESPACE-Exporte, testthat-Muster, CRAN-Compliance
- **Codequalitaet**: Stilkonsistenz, Testabdeckung, Fehlerbehandlung, Pull-Request-Hygiene
- **Architektur**: Paketstruktur, API-Oberflaeche, Abhaengigkeitsgraph, SOLID-Einhaltung
- **Sicherheit**: Geheimnisoffenlegung, Eingabebereinigung, sichere eval-Muster, Abhaengigkeits-CVEs

Durch die parallele Ausfuehrung dieser Reviews und die Synthese der Ergebnisse liefert das Team gruendliches Feedback schneller als ein sequenzielles Einzel-Agent-Review.

## Teamzusammensetzung

| Mitglied | Agent | Rolle | Schwerpunkte |
|---|---|---|---|
| Leitung | `r-developer` | Lead | R-Konventionen, CRAN-Compliance, Endsynthese |
| Qualitaet | `code-reviewer` | Qualitaetspruefer | Stil, Tests, Fehlerbehandlung, PR-Qualitaet |
| Architektur | `senior-software-developer` | Architekturpruefer | Struktur, API-Design, Abhaengigkeiten, technische Schulden |
| Sicherheit | `security-analyst` | Sicherheitspruefer | Geheimnisse, Eingabevalidierung, CVEs, sichere Muster |

## Koordinationsmuster

Hub-and-Spoke: Der r-developer-Leiter verteilt Pruefungsaufgaben, jeder Pruefer arbeitet unabhaengig, und der Leiter sammelt und synthetisiert alle Ergebnisse.

```
            r-developer (Lead)
           /       |        \
          /        |         \
   code-reviewer   |    security-analyst
                   |
     senior-software-developer
```

**Ablauf:**

1. Der Leiter analysiert die Paketstruktur und erstellt Pruefungsaufgaben
2. Drei Pruefer arbeiten parallel an ihren Fachgebieten
3. Der Leiter sammelt alle Ergebnisse und erstellt einen einheitlichen Bericht
4. Der Leiter markiert Konflikte oder ueberlappende Befunde

## Aufgabenzerlegung

### Phase 1: Einrichtung (Leiter)
Der r-developer-Leiter untersucht das Paket und erstellt gezielte Aufgaben:

- Schluesseldateien identifizieren: `DESCRIPTION`, `NAMESPACE`, `R/`, `tests/`, `man/`, `vignettes/`
- Pruefungsaufgaben erstellen, die auf das Fachgebiet jedes Pruefers zugeschnitten sind
- Paketspezifische Besonderheiten notieren (z.B. Rcpp-Integration, Shiny-Komponenten)

### Phase 2: Parallele Pruefung

**code-reviewer**-Aufgaben:
- Codestil gegen den tidyverse-Stilguide pruefen
- Testabdeckung und testthat-Muster pruefen
- Fehlermeldungen und `stop()`/`warning()`-Verwendung bewerten
- `.Rbuildignore` und Entwicklungsdatei-Hygiene pruefen

**senior-software-developer**-Aufgaben:
- Paket-API-Oberflaeche bewerten (`@export`-Entscheidungen)
- Abhaengigkeitsgewicht pruefen (`Imports` vs. `Suggests`)
- Interne Code-Organisation und Kopplung beurteilen
- Auf unnoetige Komplexitaet oder verfrueht Abstraktion pruefen

**security-analyst**-Aufgaben:
- Auf offengelegte Geheimnisse in Code und Daten scannen
- `system()`, `eval()` und `source()`-Verwendung pruefen
- Datei-I/O auf Path-Traversal-Risiken pruefen
- Abhaengigkeiten auf bekannte Schwachstellen pruefen

### Phase 3: Synthese (Leiter)
Der r-developer-Leiter:
- Sammelt alle Pruefer-Ergebnisse
- Prueft R-spezifische Konventionen (roxygen2, NAMESPACE, CRAN-Hinweise)
- Loest widerspruchliche Empfehlungen
- Erstellt einen priorisierten Bericht: kritisch > hoch > mittel > niedrig

## Konfiguration

Maschinenlesbarer Konfigurationsblock fuer Werkzeuge, die dieses Team automatisch erstellen.

<!-- CONFIG:START -->
```yaml
team:
  name: r-package-review
  lead: r-developer
  coordination: hub-and-spoke
  members:
    - agent: r-developer
      role: Lead
      subagent_type: r-developer
    - agent: code-reviewer
      role: Quality Reviewer
      subagent_type: code-reviewer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
  tasks:
    - name: review-code-quality
      assignee: code-reviewer
      description: Review code style, test coverage, error handling, and PR hygiene
    - name: review-architecture
      assignee: senior-software-developer
      description: Evaluate package structure, API design, dependencies, and tech debt
    - name: review-security
      assignee: security-analyst
      description: Audit for secrets, input validation, safe patterns, and dependency CVEs
    - name: review-r-conventions
      assignee: r-developer
      description: Check roxygen2 docs, NAMESPACE, testthat patterns, CRAN compliance
    - name: synthesize-report
      assignee: r-developer
      description: Collect all findings and produce unified prioritized report
      blocked_by: [review-code-quality, review-architecture, review-security, review-r-conventions]
```
<!-- CONFIG:END -->

## Einsatzszenarien

### Szenario 1: Review vor CRAN-Einreichung
Vor der CRAN-Einreichung das vollstaendige Team-Review durchfuehren, um Probleme in allen Dimensionen aufzudecken:

```
Benutzer: Pruefe mein R-Paket unter /pfad/zu/meinpaket vor der CRAN-Einreichung
```

Das Team prueft CRAN-spezifische Anforderungen (Beispiele, \dontrun, URL-Gueltigkeit) neben allgemeinen Qualitaets-, Architektur- und Sicherheitsbelangen.

### Szenario 2: Pull-Request-Review
Fuer bedeutende PRs, die mehrere Paketkomponenten beruehren:

```
Benutzer: Pruefe PR #42 meines R-Pakets -- er fuegt einen neuen API-Endpunkt und Rcpp-Integration hinzu
```

Das Team verteilt das Review auf die geaenderten Bereiche, wobei der Architekturpruefer sich auf das API-Design und der Sicherheitspruefer auf die Rcpp-Bindings konzentriert.

### Szenario 3: Paket-Audit
Fuer geerbte oder unbekannte Pakete, die eine gruendliche Bewertung benoetigen:

```
Benutzer: Auditiere dieses R-Paket, das ich geerbt habe -- ich muss seine Qualitaet und Risiken verstehen
```

Das Team liefert eine umfassende Bewertung, die Code-Gesundheit, Architekturentscheidungen und Sicherheitslage abdeckt.

## Einschraenkungen

- Am besten geeignet fuer R-Pakete; nicht fuer allgemeine Code-Reviews konzipiert
- Erfordert die Verfuegbarkeit aller vier Agent-Typen als Subagenten
- Der synthetisierte Bericht spiegelt automatisierte Analyse wider; menschliches Urteilsvermoegen ist weiterhin fuer domaenenspezifische Logik erforderlich
- Fuehrt `R CMD check` oder Tests nicht direkt aus -- konzentriert sich auf statische Pruefung
- Grosse Pakete (>100 R-Dateien) profitieren moeglicherweise von gezieltem statt vollstaendigem Review

## Siehe auch

- [r-developer](../agents/r-developer.md) -- Leitender Agent mit R-Paket-Expertise
- [code-reviewer](../agents/code-reviewer.md) -- Qualitaetspruefungs-Agent
- [senior-software-developer](../agents/senior-software-developer.md) -- Architekturpruefungs-Agent
- [security-analyst](../agents/security-analyst.md) -- Sicherheitsaudit-Agent
- [submit-to-cran](../skills/submit-to-cran/SKILL.md) -- CRAN-Einreichungs-Skill
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) -- Architekturpruefungs-Skill

---

**Autor**: Philipp Thoss
**Version**: 1.0.0
**Letzte Aktualisierung**: 2026-02-16
