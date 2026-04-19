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
  Immer build.sh als Pipeline-Einstiegspunkt verwenden — niemals Rscript direkt aufrufen.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Icon-Pipeline rendern

Die viz-Pipeline von Anfang bis Ende ausfuehren, um Icons aus bestehenden Glyphen zu rendern. Umfasst Palettengenerierung, Datenaufbau, Manifest-Erstellung und Icon-Rendering fuer Skills, Agents und Teams.

**Kanonischer Einstiegspunkt**: `bash viz/build.sh [flags]` vom Projektstamm aus oder `bash build.sh [flags]` aus `viz/`. Dieses Skript uebernimmt die Plattformerkennung (WSL, Docker, nativ), die Auswahl des R-Binaries und die Reihenfolge der Schritte. Niemals `Rscript` direkt fuer Build-Skripte aufrufen — dieser Pfad ist ausschliesslich fuer die MCP-Server-Konfiguration gedacht.

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

1. Existenz von `viz/build.sh` bestaetigen:
   ```bash
   ls -la viz/build.sh
   ```
2. Verfuegbarkeit von Node.js pruefen:
   ```bash
   node --version
   ```
3. Pruefen, ob `viz/config.yml` existiert (plattformspezifische R-Pfadprofile):
   ```bash
   ls viz/config.yml
   ```

`build.sh` uebernimmt die Aufloesung des R-Binaries automatisch — R-Pfade muessen nicht manuell verifiziert werden. Unter WSL wird `/usr/local/bin/Rscript` (WSL-natives R) verwendet, unter Docker das Container-R, und unter nativem Linux/macOS `Rscript` aus dem PATH.

**Erwartet:** `build.sh`, Node.js und `config.yml` sind vorhanden.

**Bei Fehler:** Falls `config.yml` fehlt, greift die Pipeline auf Systemstandards zurueck. Falls Node.js fehlt, ueber nvm installieren.

### Schritt 2: Pipeline ausfuehren

`build.sh` fuehrt 5 Schritte in folgender Reihenfolge aus:
1. Palettenfarben generieren (R) → `palette-colors.json` + `colors-generated.js`
2. Daten aufbauen (Node) → `skills.json`
3. Manifeste erstellen (Node) → `icon-manifest.json`, `agent-icon-manifest.json`, `team-icon-manifest.json`
4. Icons rendern (R) → WebP-Dateien in `icons/` und `icons-hd/`
5. Terminal-Glyphen generieren (Node) → `cli/lib/glyph-data.json`

**Vollstaendige Pipeline (alle Typen, alle Paletten, Standard + HD):**
```bash
bash viz/build.sh
```

**Inkrementell (bereits vorhandene Icons auf der Festplatte ueberspringen):**
```bash
bash viz/build.sh --skip-existing
```

**Einzelne Domaene (nur Skills):**
```bash
bash viz/build.sh --only design
```

**Einzelner Entitaetstyp:**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**Probelauf (Vorschau ohne Rendering):**
```bash
bash viz/build.sh --dry-run
```

**Nur Standardgroesse (HD ueberspringen):**
```bash
bash viz/build.sh --no-hd
```

Alle Flags nach `build.sh` werden an `build-all-icons.R` durchgereicht.

**Erwartet:** Icons gerendert nach `viz/public/icons/<palette>/` und `viz/public/icons-hd/<palette>/`.

**Bei Fehler:**
- **renv-Haenger auf NTFS**: Die viz-`.Rprofile` umgeht `renv/activate.R` und setzt `.libPaths()` direkt. Sicherstellen, dass aus `viz/` ausgefuehrt wird (build.sh erledigt das automatisch via `cd "$(dirname "$0")"`)
- **Fehlende R-Pakete**: `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"` aus der R-Umgebung ausfuehren, die `build.sh` auswaehlt
- **No glyph mapped**: Die Entitaet benoetigt eine Glyphen-Funktion — den `create-glyph` Skill vor dem Rendering verwenden

### Schritt 3: Ausgabe verifizieren

Bestaetigen, dass das Rendering erfolgreich abgeschlossen wurde.

1. Dateianzahlen gegen Erwartungen pruefen:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Auf angemessene Dateigroessen pruefen (2-80 KB pro Icon)
3. Den `audit-icon-pipeline` Skill fuer eine vollstaendige Pruefung ausfuehren

**Erwartet:** Dateianzahlen stimmen mit Manifest-Eintragsanzahlen ueberein. Dateigroessen im erwarteten Bereich.

**Bei Fehler:** Falls die Anzahlen nicht uebereinstimmen, koennten einige Glyphen waehrend des Renderings Fehler verursacht haben. Das Build-Log auf `[ERROR]`-Zeilen pruefen.

## CLI-Flag-Referenz

Alle Flags werden von `build.sh` an `build-all-icons.R` durchgereicht:

| Flag | Default | Beschreibung |
|------|---------|--------------|
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

## Was build.sh intern tut

Nur zur Referenz — diese Schritte NICHT manuell ausfuehren:

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Docker-Alternative

Die Pipeline kann auch in Docker ausgefuehrt werden:

```bash
cd viz
docker compose up --build
```

Dies fuehrt die vollstaendige Pipeline in einer isolierten Linux-Umgebung aus und liefert das Ergebnis auf Port 8080.

## Validierungscheckliste

- [ ] `bash viz/build.sh` ausgefuehrt (nicht bloss `Rscript`)
- [ ] Palettenfarben generiert (JSON + JS)
- [ ] Datendateien aus Registries aufgebaut
- [ ] Manifeste aus Daten generiert
- [ ] Icons fuer Zieltypen und -paletten gerendert
- [ ] Dateianzahlen stimmen mit Erwartungen ueberein
- [ ] Dateigroessen im erwarteten Bereich (2-80 KB)

## Haeufige Fehler

- **Rscript direkt aufrufen**: Niemals `Rscript build-icons.R` oder `Rscript generate-palette-colors.R` manuell ausfuehren. Immer `bash build.sh [flags]` verwenden. Direkte Rscript-Aufrufe umgehen die Plattformerkennung und koennen das falsche R-Binary verwenden (Windows-R ueber `~/bin/Rscript`-Wrapper anstelle von WSL-nativem R unter `/usr/local/bin/Rscript`). Hinweis: Der Windows-R-Pfad in CLAUDE.md und Guides ist **ausschliesslich fuer die MCP-Server-Konfiguration** gedacht, nicht fuer Build-Skripte.
- **Falsches Arbeitsverzeichnis**: `build.sh` wechselt automatisch in sein eigenes Verzeichnis (`cd "$(dirname "$0")"`), sodass der Aufruf von ueberall aus funktioniert: `bash viz/build.sh` vom Projektstamm aus arbeitet korrekt.
- **Veraltete Manifeste**: `build.sh` fuehrt die Schritte 1-5 in der richtigen Reihenfolge aus, sodass Manifeste immer vor dem Rendering neu generiert werden. Werden nur Manifeste ohne Rendering benoetigt, `node viz/build-data.js && node viz/build-icon-manifest.js` verwenden (die Node-Schritte benoetigen kein R).
- **renv nicht aktiviert**: Der `.Rprofile`-Workaround erfordert Ausfuehrung von `viz/` — `build.sh` erledigt dies. Die Verwendung des `--vanilla`-Flags oder das Starten von R aus einem anderen Verzeichnis ueberspringt ihn.
- **Parallelitaet unter Windows**: Windows unterstuetzt keine fork-basierte Parallelitaet — die Pipeline waehlt automatisch `multisession` ueber `config.yml`.

## Verwandte Skills

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — Fehlende Glyphen und Icons vor dem Rendering erkennen
- [create-glyph](../create-glyph/SKILL.md) — Neue Glyphen-Funktionen fuer Entitaeten ohne Icons erstellen
- [enhance-glyph](../enhance-glyph/SKILL.md) — Bestehende Glyphen vor dem erneuten Rendering verbessern
