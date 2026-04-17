---
name: audit-icon-pipeline
locale: de
source_locale: en
source_commit: e4ffbae4
translator: claude
translation_date: "2026-03-18"
description: >
  Fehlende Glyphen, Icons und HD-Varianten erkennen durch Abgleich von Registries
  mit Glyph-Zuordnungsdateien, Icon-Verzeichnissen und Manifesten. Meldet Luecken
  fuer Skills, Agents und Teams ueber alle Paletten hinweg.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# Icon-Pipeline pruefen

Fehlende Glyphen, fehlende Icons und veraltete Manifeste erkennen durch Abgleich von Registries mit Glyph-Zuordnungsdateien, Icon-Verzeichnissen und Manifesten. Erzeugt einen strukturierten Lueckenbericht fuer Skills, Agents und Teams.

## Wann verwenden

- Nach dem Hinzufuegen neuer Skills, Agents oder Teams, um zu pruefen, ob Icons benoetigt werden
- Vor einem vollstaendigen Pipeline-Rendering, um fehlende Elemente zu identifizieren
- Nach Registry-Aktualisierungen, um Manifest-Synchronisation sicherzustellen
- Periodische Zustandspruefung der Icon-Pipeline

## Eingaben

- **Optional**: Entitaetstypfilter — `skill`, `agent`, `team` oder `all` (Standard: `all`)
- **Optional**: Zu pruefende Palette (Standard: `cyberpunk` — die Referenzpalette)

## Verfahren

### Schritt 1: Registries lesen

Alle Entitaets-IDs aus den massgeblichen Registries zusammentragen.

1. `skills/_registry.yml` lesen — alle Skill-IDs ueber alle Domaenen extrahieren
2. `agents/_registry.yml` lesen — alle Agent-IDs extrahieren
3. `teams/_registry.yml` lesen — alle Team-IDs extrahieren
4. Zaehlerstaende festhalten: Gesamt-Skills, -Agents, -Teams

**Erwartet:** Drei Listen von Entitaets-IDs mit Zaehlerstaenden, die `total_skills`, `total_agents`, `total_teams` entsprechen.

**Bei Fehler:** Falls eine Registry-Datei fehlt, den Pfad melden und diesen Entitaetstyp ueberspringen.

### Schritt 2: Glyph-Zuordnungen lesen

Alle zugeordneten Entitaets-IDs aus den Glyph-Zuordnungsdateien zusammentragen.

1. `viz/R/glyphs.R` lesen — alle Schluessel aus der `SKILL_GLYPHS`-Liste extrahieren
2. `viz/R/agent_glyphs.R` lesen — alle Schluessel aus der `AGENT_GLYPHS`-Liste extrahieren
3. `viz/R/team_glyphs.R` lesen — alle Schluessel aus der `TEAM_GLYPHS`-Liste extrahieren

**Erwartet:** Drei Listen zugeordneter IDs.

**Bei Fehler:** Falls eine Glyph-Datei fehlt, dies melden und alle Entitaeten dieses Typs als nicht zugeordnet markieren.

### Schritt 3: Fehlende Glyphen berechnen

Registry-IDs gegen zugeordnete IDs abgleichen.

1. Fehlende Skill-Glyphen: `registry_skill_ids - mapped_skill_ids`
2. Fehlende Agent-Glyphen: `registry_agent_ids - mapped_agent_ids`
3. Fehlende Team-Glyphen: `registry_team_ids - mapped_team_ids`

**Erwartet:** Listen von Entitaets-IDs, die in Registries existieren, aber keine zugeordnete Glyphen-Funktion haben.

**Bei Fehler:** Falls die Differenzberechnung fehlschlaegt, ID-Formate zwischen Registry und Glyph-Dateien pruefen (z.B. Unterstriche vs. Bindestriche).

### Schritt 4: Gerenderte Icons pruefen

Verifizieren, dass zugeordnete Glyphen entsprechende gerenderte Icon-Dateien haben.

1. Fuer jede zugeordnete Skill-ID pruefen: `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. Fuer jede zugeordnete Agent-ID pruefen: `viz/public/icons/<palette>/agents/<agentId>.webp`
3. Fuer jede zugeordnete Team-ID pruefen: `viz/public/icons/<palette>/teams/<teamId>.webp`
4. HD-Varianten in `viz/public/icons-hd/` mit derselben Struktur pruefen

**Erwartet:** Listen von Entitaeten mit Glyphen, aber fehlenden gerenderten Icons (Standard und/oder HD).

**Bei Fehler:** Falls das Icon-Verzeichnis nicht existiert, wurde die Pipeline noch nicht ausgefuehrt — alle als fehlend melden.

### Schritt 5: Manifest-Aktualitaet pruefen

Manifest-Zaehlerstaende mit Registry-Zaehlerstaenden vergleichen.

1. `viz/public/data/icon-manifest.json` lesen — Eintraege zaehlen
2. `viz/public/data/agent-icon-manifest.json` lesen — Eintraege zaehlen
3. `viz/public/data/team-icon-manifest.json` lesen — Eintraege zaehlen
4. Mit Registry-Gesamtzahlen vergleichen

**Erwartet:** Manifest-Zaehlerstaende stimmen mit Registry-Zaehlerstaenden ueberein. Abweichungen zeigen veraltete Manifeste an.

**Bei Fehler:** Falls Manifest-Dateien nicht existieren, muss die Daten-Pipeline zuerst ausgefuehrt werden (`node build-data.js && node build-icon-manifest.js`).

### Step 6: Detect Orphan Icons

Walk `viz/public/icons*/` and flag WebP files whose `<palette>/<domain>/<skillId>` triple does not appear in `icon-manifest.json`.

1. Enumerate all WebP files: `find viz/public/icons* -name "*.webp"`
2. For each file, extract `<domain>/<id>` from its path
3. Check if `<domain>/<id>` has an entry in `icon-manifest.json`
4. Collect non-matching files as orphans — they exist on disk but are no longer referenced

```bash
# Quick orphan count per palette
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('viz/public/data/icon-manifest.json'));
const ids = new Set(manifest.map(e => e.domain + '/' + e.id));
const orphans = require('child_process')
  .execSync('find viz/public/icons -name \"*.webp\"').toString().trim().split('\n')
  .filter(p => { const parts = p.split('/'); const id = parts.slice(-2).join('/').replace('.webp',''); return !ids.has(id); });
console.log('Orphans:', orphans.length);
orphans.forEach(p => console.log(' ', p));
"
```

**Expected:** Zero orphans. Any orphans indicate skills re-homed to a different domain without cleanup.

**On failure:** Delete orphans manually — they have no corresponding manifest entry and will not be served.

### Schritt 6: Lueckenbericht generieren

Eine strukturierte Zusammenfassung erstellen.

1. Ausgabe als uebersichtliche Tabelle oder Liste formatieren:
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. Naechste Schritte basierend auf den Ergebnissen vorschlagen

**Erwartet:** Ein vollstaendiger Lueckenbericht mit umsetzbaren naechsten Schritten.

**Bei Fehler:** Falls alle Pruefungen ohne Luecken bestehen, "Pipeline vollstaendig synchron" als positives Ergebnis melden.

## Validierungscheckliste

- [ ] Alle drei Registries erfolgreich gelesen
- [ ] Alle drei Glyph-Zuordnungsdateien geprueft
- [ ] Icon-Verzeichnisse fuer Standard und HD durchsucht
- [ ] Manifest-Aktualitaet verifiziert
- [ ] Lueckenbericht mit Zaehlerstaenden und Entitaetslisten erstellt
- [ ] Umsetzbare naechste Schritte angegeben

## Haeufige Fehler

- **ID-Format-Abweichung**: Registry verwendet Kebab-Case (`create-skill`), Glyph-Zuordnungen koennen Snake-Case-Schluessel verwenden — Vergleich muss normalisieren
- **Palettenannahme**: Nur die Cyberpunk-Palette zu pruefen uebersieht palettenspezifische Rendering-Luecken
- **Leere Verzeichnisse**: Ein vorhandenes, aber leeres Domaenenverzeichnis zaehlt beim Globbing als "Icons vorhanden" — Dateiexistenz pruefen, nicht Verzeichnisexistenz
- **HD nicht gerendert**: HD-Icons befinden sich in einem separaten Verzeichnisbaum (`icons-hd/`) — nicht mit Standard-Icons verwechseln

## Verwandte Skills

- [create-glyph](../create-glyph/SKILL.md) — Eine durch dieses Audit identifizierte fehlende Glyphe erstellen
- [enhance-glyph](../enhance-glyph/SKILL.md) — Qualitaet bestehender Glyphen verbessern
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — Die vollstaendige Pipeline ausfuehren, um fehlende Icons zu generieren
- [ ] Orphan icons checked (disk paths vs manifest)
- **Orphans after re-homing**: When a skill's domain changes, `build.sh` creates icons at the new path but does NOT delete the old path — always run Step 6 orphan check after any domain migration
