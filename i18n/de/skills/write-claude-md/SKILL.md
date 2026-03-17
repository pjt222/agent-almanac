---
name: write-claude-md
description: >
  Erstellt eine effektive CLAUDE.md-Datei mit projektspezifischen Anweisungen
  fuer KI-Programmierassistenten. Behandelt Struktur, gaengige Abschnitte,
  Dos und Don'ts sowie die Integration von MCP-Servern und Agentendefinitionen.
  Verwenden beim Starten eines neuen Projekts mit KI-Assistenten, bei der
  Verbesserung des KI-Verhaltens in bestehenden Projekten, der Dokumentation
  von Projektkonventionen und -einschraenkungen oder der Integration von
  MCP-Servern und Agentendefinitionen in einen Projektworkflow.
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
  domain: general
  complexity: basic
  language: multi
  tags: claude-md, ai-assistant, project-config, documentation
---

# CLAUDE.md schreiben

Eine CLAUDE.md-Datei erstellen, die KI-Assistenten effektiven projektspezifischen Kontext liefert.

## Wann verwenden

- Start eines neuen Projekts mit KI-Assistenten
- Verbesserung des KI-Assistenten-Verhaltens in einem bestehenden Projekt
- Dokumentation von Projektkonventionen, Arbeitsablaeufen und Einschraenkungen
- Integration von MCP-Servern oder Agentendefinitionen in ein Projekt

## Eingaben

- **Erforderlich**: Projekttyp und Technologiestack
- **Erforderlich**: Wichtige Konventionen und Einschraenkungen
- **Optional**: MCP-Server-Konfigurationen
- **Optional**: Autoren- und Mitwirkendeninformationen
- **Optional**: Sicherheits- und Vertraulichkeitsanforderungen

## Vorgehensweise

### Schritt 1: CLAUDE.md grundlegend erstellen

`CLAUDE.md` im Projektstammverzeichnis ablegen:

```markdown
# Projektname

Kurze Beschreibung des Projekts und seines Zwecks.

## Schnellstart

Wesentliche Befehle fuer die Arbeit an diesem Projekt:

```bash
# Abhaengigkeiten installieren
npm install  # oder renv::restore() fuer R

# Tests ausfuehren
npm test     # oder devtools::test() fuer R

# Build
npm run build  # oder devtools::check() fuer R
```

## Architektur

Wichtige Architekturentscheidungen und in diesem Projekt verwendete Muster.

## Konventionen

- Immer beschreibende Variablennamen verwenden
- [Sprachspezifischen Stil-Guide] befolgen
- Tests fuer alle neuen Funktionalitaeten schreiben
```

**Erwartet:** Eine `CLAUDE.md`-Datei existiert im Projektstammverzeichnis mit mindestens einer Projektbeschreibung, Schnellstart-Befehlen, einer Architekturuebersicht und einem Konventionsabschnitt.

**Bei Fehler:** Falls unklar ist, was einzubeziehen ist, mit nur dem Schnellstart-Abschnitt beginnen, der die drei wichtigsten Befehle enthaelt (installieren, testen, bauen). Die Datei kann inkrementell erweitert werden, waehrend das Projekt reift.

### Schritt 2: Technologiespezifische Abschnitte hinzufuegen

**Fuer R-Pakete**:

```markdown
## Entwicklungsworkflow

```r
devtools::load_all()    # Fuer Entwicklung laden
devtools::document()    # Dokumentation neu generieren
devtools::test()        # Tests ausfuehren
devtools::check()       # Vollstaendige Paketpruefung
```

## Paketstruktur

- `R/` - Quellcode (eine Funktion pro Datei)
- `tests/testthat/` - Tests spiegeln R/-Struktur wider
- `vignettes/` - Ausfuehrliche Dokumentation
- `man/` - Von roxygen2 generiert (nicht manuell bearbeiten)

## Kritische Dateien (nicht loeschen)

- `.Rprofile` - Sitzungskonfiguration
- `.Renviron` - Umgebungsvariablen (per git ignoriert)
- `renv.lock` - Gesperrte Abhaengigkeiten
```

**Fuer Node.js/TypeScript**:

```markdown
## Stack

- Next.js 15 mit App Router
- TypeScript strict mode
- Tailwind CSS fuer Styling
- Vercel fuer Deployment

## Konventionen

- `@/`-Import-Alias fuer src/-Verzeichnis verwenden
- Server Components standardmaessig, `"use client"` nur wenn noetig
- API-Routen in `src/app/api/`
```

**Erwartet:** Technologiespezifische Abschnitte werden hinzugefuegt, die dem tatsaechlichen Stack des Projekts entsprechen — R-Paketstruktur fuer R-Projekte, Node.js-Stack-Details fuer Web-Projekte usw. Befehle und Pfade beziehen sich auf das tatsaechliche Projektlayout.

**Bei Fehler:** Falls der Stack unbekannt ist, `package.json`, `DESCRIPTION`, `Cargo.toml` oder Aequivalente untersuchen, um die Technologie zu identifizieren und den entsprechenden Abschnitt hinzuzufuegen.

### Schritt 3: MCP-Server-Informationen hinzufuegen

```markdown
## Verfuegbare MCP-Server

### r-mcptools (R-Integration)
- **Zweck**: Verbindung zu R/RStudio-Sitzungen
- **Status**: Konfiguriert
- **Konfiguration**: `claude mcp add r-mcptools stdio "Rscript.exe" -- -e "mcptools::mcp_server()"`

### hf-mcp-server (Hugging Face)
- **Zweck**: KI/ML-Modell- und Datensatzzugriff
- **Status**: Konfiguriert
- **Konfiguration**: `claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp`
```

**Erwartet:** Jeder konfigurierte MCP-Server hat einen Unterabschnitt, der seinen Zweck, Status (konfiguriert/verfuegbar/nicht konfiguriert) und den Befehl zu seiner Einrichtung dokumentiert. Keine tatsaechlichen Token oder Geheimnisse sind enthalten.

**Bei Fehler:** Falls MCP-Server noch nicht konfiguriert sind, sie als "Verfuegbar" mit Einrichtungsanweisungen anstatt als "Konfiguriert" dokumentieren. Platzhalterwerte wie `your_token_here` fuer alle Anmeldedaten verwenden.

### Schritt 4: Autoreninformationen hinzufuegen

```markdown
## Autoreninformationen

### Standard-Paket-Autorenschaft
- **Name**: Autorenname
- **E-Mail**: autor@beispiel.de
- **ORCID**: 0000-0000-0000-0000
- **GitHub**: benutzername
```

**Erwartet:** Der Autoreninformationsabschnitt enthaelt Name, E-Mail, ORCID (fuer akademische/Forschungsprojekte) und GitHub-Benutzernamen. Fuer R-Pakete entspricht das Format den DESCRIPTION-Datei-Anforderungen.

**Bei Fehler:** Falls Autoreninformationen vertraulich sind oder nicht oeffentlich sein sollen, den Organisationsnamen anstelle persoenlicher Details verwenden oder den Abschnitt fuer interne Projekte weglassen.

### Schritt 5: Sicherheitsrichtlinien hinzufuegen

```markdown
## Sicherheit & Vertraulichkeit

- Niemals `.Renviron`, `.env` oder Dateien mit Token committen
- Platzhalterwerte in der Dokumentation verwenden: `YOUR_TOKEN_HERE`
- Umgebungsvariablen fuer alle Geheimnisse
- Per git ignoriert: `.Renviron`, `.env`, `credentials.json`
```

**Erwartet:** Der Sicherheitsabschnitt listet Dateien auf, die niemals committet werden duerfen, Platzhalterkonventionen fuer die Dokumentation und bestaetigt, dass `.gitignore` alle sensiblen Dateien abdeckt.

**Bei Fehler:** Falls unklar ist, welche Dateien sensibel sind, `grep -rn "sk-\|ghp_\|password" .` ausfuehren, um nach exponierten Geheimnissen zu suchen. Jede Datei mit echten Anmeldedaten sollte zu `.gitignore` hinzugefuegt und in diesem Abschnitt erwaehnt werden.

### Schritt 6: Skills und Anleitungen referenzieren

```markdown
## Entwicklungs-Best-Practices-Referenzen
@agent-almanac/skills/write-testthat-tests/SKILL.md
@agent-almanac/skills/submit-to-cran/SKILL.md
```

**Erwartet:** Relevante Skills und Anleitungen werden ueber `@`-Pfade referenziert, wodurch KI-Assistenten Zugang zu detaillierten Verfahren fuer haeufige Aufgaben im Projekt erhalten.

**Bei Fehler:** Falls die referenzierten Skills oder Anleitungen nicht an den angegebenen Pfaden existieren, Pfade pruefen oder Referenzen entfernen. Fehlerhafte `@`-Referenzen bieten keinen Mehrwert und koennen den Assistenten verwirren.

### Schritt 7: Qualitaets- und Statusinformationen hinzufuegen

```markdown
## Qualitaetsstatus

- R CMD check: 0 Fehler, 0 Warnungen, 1 Hinweis
- Testabdeckung: 85 %
- Tests: 200+ bestanden
- Vignetten: 3 (bewertet mit 9/10)
```

**Erwartet:** Der Qualitaetsmetrik-Abschnitt spiegelt den aktuellen Stand des Projekts mit genauen Zahlen fuer Check-Ergebnisse, Testabdeckung, Testanzahl und Dokumentationsstatus wider.

**Bei Fehler:** Falls Metriken noch nicht verfuegbar sind (neues Projekt), Platzhaltereintraege mit "TBD" hinzufuegen und aktualisieren, wenn das Projekt reift. Keine Zahlen erfinden.

## Validierung

- [ ] CLAUDE.md befindet sich im Projektstammverzeichnis
- [ ] Schnellstart-Befehle sind korrekt und funktionieren
- [ ] Architekturabschnitt spiegelt die tatsaechliche Projektstruktur wider
- [ ] Keine sensiblen Informationen (Token, Passwoerter, private Pfade)
- [ ] MCP-Server-Konfigurationen sind aktuell
- [ ] Referenzierte Dateien und Pfade existieren

## Haeufige Stolperfallen

- **Veraltete Informationen**: CLAUDE.md aktualisieren, wenn sich die Projektstruktur aendert
- **Zu viel Detail**: Praegnant halten. Auf detaillierte Anleitungen verlinken anstatt Inhalte zu duplizieren.
- **Sensible Daten**: Niemals echte Token oder Anmeldedaten einbeziehen. Platzhalter verwenden.
- **Widerspruechliche Anweisungen**: Sicherstellen, dass CLAUDE.md anderen Konfigurationsdateien nicht widerspricht
- **Fehlt in `.Rbuildignore`**: Fuer R-Pakete `^CLAUDE\\.md$` zu `.Rbuildignore` hinzufuegen

## Beispiele

In erfolgreichen Projekten beobachtetes Muster:

1. **putior** (829 Zeilen): Umfassende CLAUDE.md mit Qualitaetsmetriken, 20 Errungenschaften, MCP-Integrationsdetails und Entwicklungsworkflow
2. **Einfaches Projekt** (20 Zeilen): Nur Schnellstart-Befehle und Schluesselbconventionen

Die CLAUDE.md entsprechend der Projektkomplexitaet skalieren.

## Verwandte Skills

- `create-r-package` - CLAUDE.md als Teil der Paketeinrichtung
- `configure-mcp-server` - MCP-Konfiguration in CLAUDE.md referenziert
- `security-audit-codebase` - pruefen ob keine Geheimnisse in CLAUDE.md
