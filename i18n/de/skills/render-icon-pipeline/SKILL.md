---
name: render-icon-pipeline
locale: de
source_locale: en
source_commit: 640725b5
translator: claude
translation_date: "2026-03-18"
description: >
  Die viz-Pipeline ausfuehren, um Icons aus bestehenden Glyphen zu rendern.
  Einstiegspunkt fuer das viz-Teilprojekt, der Palettengenerierung, Datenaufbau,
  Manifest-Erstellung und Icon-Rendering fuer Skills, Agents und Teams umfasst.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Icon-Pipeline rendern

Die viz-Pipeline von Anfang bis Ende ausfuehren, um Icons aus bestehenden Glyphen zu rendern. Umfasst Palettengenerierung, Datenaufbau, Manifest-Erstellung und Icon-Rendering fuer Skills, Agents und Teams.

## Wann verwenden

- Nach dem Erstellen oder Aendern von Glyphen-Funktionen
- Nach dem Hinzufuegen neuer Skills, Agents oder Teams zu Registries
- Wenn Icons fuer neue oder aktualisierte Paletten neu gerendert werden muessen
- Fuer einen vollstaendigen Pipeline-Neubau (z.B. nach Infrastruktur-Aenderungen)
- Beim erstmaligen Einrichten der viz-Umgebung

## Eingaben

- **Optional**: Entitaetstyp — `skill`, `agent`, `team` oder `all` (Standard: `all`)
- **Optional**: Palette — spezifischer Palettenname oder `all` (Standard: `all`)
- **Optional**: Domaenenfilter — spezifische Domaene fuer Skill-Icons (z.B. `git`, `design`)
- **Optional**: Rendermodus — `full`, `incremental` oder `dry-run` (Standard: `incremental`)

## Verfahren

### Schritt 1: Voraussetzungen pruefen

Sicherstellen, dass die Umgebung fuer das Rendering bereit ist.

1. Arbeitsverzeichnis ist `viz/` (oder dorthin navigieren):
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   ```
2. R-Pakete auf Verfuegbarkeit pruefen:
   ```bash
   Rscript -e "requireNamespace('ggplot2'); requireNamespace('ggforce'); requireNamespace('ggfx'); requireNamespace('ragg'); requireNamespace('magick')"
   ```
3. Node.js auf Verfuegbarkeit pruefen:
   ```bash
   node --version
   ```
4. Pruefen, ob `config.yml` existiert (betriebssystemabhaengige R-Pfadauswahl)

**Erwartet:** Alle Voraussetzungen bestehen ohne Fehler.

**Bei Fehler:** Fehlende R-Pakete mit `install.packages()` installieren. Falls Node.js fehlt, ueber nvm installieren. Falls `config.yml` fehlt, verwendet die Pipeline Systemstandards als Fallback.

### Schritt 2: Palettenfarben generieren

Die JSON- und JS-Palettendaten aus R-Palettendefinitionen generieren.

```bash
Rscript generate-palette-colors.R
```

**Erwartet:** `viz/public/data/palette-colors.json` und `viz/js/palette-colors.js` aktualisiert.

**Bei Fehler:** Pruefen, ob `viz/R/palettes.R` gueltiger R-Code ist. Haeufiges Problem: Syntaxfehler im neuen Domaenenfarb-Eintrag.

### Schritt 3: Daten aufbauen

Die Skills-/Agents-/Teams-Datendateien aus Registries generieren.

```bash
node build-data.js
```

**Erwartet:** `viz/public/data/skills.json` mit aktuellen Registry-Daten aktualisiert.

**Bei Fehler:** Pruefen, ob `skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml` gueltiges YAML sind.

### Schritt 4: Manifeste erstellen

Icon-Manifeste aus den Datendateien generieren.

```bash
node build-icon-manifest.js
```

**Erwartet:** Drei Manifest-Dateien aktualisiert:
- `viz/public/data/icon-manifest.json`
- `viz/public/data/agent-icon-manifest.json`
- `viz/public/data/team-icon-manifest.json`

**Bei Fehler:** Falls Manifeste veraltet sind, loeschen und erneut ausfuehren. Pruefen, ob `build-data.js` zuerst ausgefuehrt wurde.

### Schritt 5: Icons rendern

Den Icon-Renderer mit passenden Flags ausfuehren.

**Vollstaendige Pipeline (alle Typen, alle Paletten, Standard + HD):**
```bash
Rscript build-all-icons.R
```

**Inkrementell (unveraenderte Glyphen ueberspringen):**
```bash
Rscript build-all-icons.R --skip-existing
```

**Einzelner Entitaetstyp:**
```bash
Rscript build-all-icons.R --type skill
Rscript build-all-icons.R --type agent
Rscript build-all-icons.R --type team
```

**Einzelne Domaene (nur Skills):**
```bash
Rscript build-icons.R --only design
```

**Einzelner Agent oder Team:**
```bash
Rscript build-agent-icons.R --only mystic
Rscript build-team-icons.R --only r-package-review
```

**Probelauf (Vorschau ohne Rendering):**
```bash
Rscript build-all-icons.R --dry-run
```

**Nur Standardgroesse (HD ueberspringen):**
```bash
Rscript build-all-icons.R --no-hd
```

**CLI-Referenz:**

| Flag | Standard | Beschreibung |
|------|----------|--------------|
| `--type <types>` | `all` | Kommagetrennt: skill, agent, team |
| `--palette <name>` | `all` | Einzelne Palette oder `all` (9 Paletten) |
| `--only <filter>` | keiner | Domaene (Skills) oder Entitaets-ID (Agents/Teams) |
| `--skip-existing` | aus | Icons mit vorhandenen WebP-Dateien ueberspringen |
| `--dry-run` | aus | Auflisten, was generiert wuerde |
| `--size <n>` | `512` | Ausgabedimension in Pixeln |
| `--glow-sigma <n>` | `4` | Glow-Unschaerferadius |
| `--workers <n>` | auto | Parallele Worker (detectCores()-1) |
| `--no-cache` | aus | Inhaltshash-Cache ignorieren |
| `--hd` | ein | HD-Varianten aktivieren (1024px) |
| `--no-hd` | aus | HD-Varianten ueberspringen |
| `--strict` | aus | Bei erstem Unterskript-Fehler beenden |

**Erwartet:** Icons gerendert nach `viz/public/icons/<palette>/` und `viz/public/icons-hd/<palette>/`.

**Bei Fehler:**
- **renv-Haenger**: Von `viz/`-Verzeichnis aus starten, damit `.Rprofile` den Library-Pfad-Workaround aktiviert
- **Fehlende Pakete**: `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick", "future", "furrr", "digest"))`
- **Exit-Code 5**: Bedeutet in der Regel, dass eine Glyphen-Funktion einen Fehler verursacht hat — im Log nach der spezifischen Skill-/Agent-/Team-ID suchen
- **No glyph mapped**: Die Entitaet benoetigt eine Glyphen-Funktion — den `create-glyph` Skill verwenden

### Schritt 6: Ausgabe verifizieren

Bestaetigen, dass das Rendering erfolgreich abgeschlossen wurde.

1. Dateianzahlen gegen Erwartungen pruefen:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Auf angemessene Dateigroessen pruefen (2-80 KB pro Icon)
3. Manifest-Aktualitaet verifizieren (`audit-icon-pipeline` fuer vollstaendige Pruefung ausfuehren)

**Erwartet:** Dateianzahlen stimmen mit Manifest-Eintragsanzahlen ueberein. Dateigroessen im erwarteten Bereich.

**Bei Fehler:** Falls die Anzahlen nicht uebereinstimmen, koennten einige Glyphen waehrend des Renderings Fehler verursacht haben. Das Build-Log auf `[ERROR]`-Zeilen pruefen.

## Docker-Alternative

Die Pipeline kann auch in Docker ausgefuehrt werden:

```bash
cd viz
docker compose up --build
```

Dies fuehrt die vollstaendige Pipeline in einer isolierten Linux-Umgebung aus und liefert das Ergebnis auf Port 8080.

## Validierungscheckliste

- [ ] Arbeitsverzeichnis ist `viz/`
- [ ] Palettenfarben generiert (JSON + JS)
- [ ] Datendateien aus Registries aufgebaut
- [ ] Manifeste aus Daten generiert
- [ ] Icons fuer Zieltypen und -paletten gerendert
- [ ] Dateianzahlen stimmen mit Erwartungen ueberein
- [ ] Dateigroessen im erwarteten Bereich (2-80 KB)

## Haeufige Fehler

- **Falsches Arbeitsverzeichnis**: R-Skripte erwarten, von `viz/` aus ausgefuehrt zu werden oder `viz/R/utils.R` relativ zum Projektstamm zu finden
- **renv nicht aktiviert**: Der `.Rprofile`-Workaround erfordert Ausfuehrung von `viz/` — die Verwendung des `--vanilla`-Flags oder das Starten aus einem anderen Verzeichnis ueberspringt ihn
- **Veraltete Manifeste**: Immer Schritte 2-4 (Palette -> Daten -> Manifest) vor Schritt 5 (Rendern) nach Registry-Aenderungen ausfuehren
- **Parallelitaet unter Windows**: Windows unterstuetzt keine fork-basierte Parallelitaet — die Pipeline waehlt automatisch `multisession` ueber `config.yml`

## Verwandte Skills

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — Fehlende Glyphen und Icons vor dem Rendering erkennen
- [create-glyph](../create-glyph/SKILL.md) — Neue Glyphen-Funktionen fuer Entitaeten ohne Icons erstellen
- [enhance-glyph](../enhance-glyph/SKILL.md) — Bestehende Glyphen vor dem erneuten Rendering verbessern
