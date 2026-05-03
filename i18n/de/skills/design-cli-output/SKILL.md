---
name: design-cli-output
description: >
  Design terminal output for a CLI tool with chalk colors, Unicode glyphs,
  multiple verbosity levels (human, verbose, quiet, JSON), and consistent
  voice rules. Covers color palette selection, status indicator design,
  reporter function architecture, ceremony/narrative output variants, and
  cross-terminal compatibility. Use when building a new CLI reporter module,
  adding warm narrative output to an existing tool, standardizing output
  across multiple commands, or designing machine-readable JSON alongside
  human-readable text.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: basic
  language: TypeScript
  tags:
    - cli
    - terminal
    - ux
    - chalk
    - unicode
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# CLI-Ausgabe entwerfen

Konsistente, mehrstufige Terminal-Ausgabe fuer ein Kommandozeilen-Tool entwerfen.

## Wann verwenden

- Bauen eines neuen Reporter-Moduls fuer ein CLI-Tool
- Hinzufuegen warmer oder narrativer Ausgabe neben standardmaessiger transaktionaler Ausgabe
- Standardisieren des Ausgabeformats ueber mehrere Befehle
- Entwerfen von JSON-Maschinen-Ausgabe parallel zu menschlich lesbarer Ausgabe
- Auswaehlen von Farben, Glyphen und Verbosity-Stufen fuer ein neues Terminal-Tool

## Eingaben

- **Erforderlich**: CLI-Tool-Name und primaere Zielgruppe (Entwickler, Operatoren, Endbenutzer)
- **Erforderlich**: Befehle die Ausgabe-Formatierung brauchen
- **Optional**: Ob eine "Zeremonie"- oder narrative Ausgabe-Variante gewuenscht ist
- **Optional**: Branding-Beschraenkungen (Farbpalette, Ton)

## Vorgehensweise

### Schritt 1: Die Farbpalette definieren

Chalk nutzen um ein benanntes Paletten-Objekt zu erstellen:

**Standard-Palette** (transaktionale Ausgabe):

```javascript
let chalk;
try { chalk = (await import('chalk')).default; }
catch { chalk = new Proxy({}, { get: () => (s) => s }); }

// Status colors
const ok = chalk.green;       // success
const fail = chalk.red;       // errors
const warn = chalk.yellow;    // warnings
const info = chalk.cyan;      // identifiers, names
const dim = chalk.dim;        // secondary info, paths
const bold = chalk.bold;      // headers
```

**Warme Palette** (Zeremonie/narrative Ausgabe):

```javascript
const C = {
  flame: chalk.hex('#FF6B35'),   // active elements, fire
  amber: chalk.hex('#FFB347'),   // arriving items, warm highlights
  spark: chalk.hex('#FFF4E0'),   // individual items (sparks/skills)
  ember: chalk.hex('#8B4513'),   // cold/dormant states
  warm:  chalk.hex('#D4A574'),   // neutral warm text
  dim:   chalk.dim,              // background, secondary
  fail:  chalk.red,              // errors stay red (honest)
};
```

Paletten-Design-Regeln:
- Immer einen No-Color-Fallback bereitstellen (das Proxy-Muster oben)
- Hex-Farben fuer benutzerdefinierte Paletten verwenden (`chalk.hex('#FF6B35')`)
- Die Fail-/Error-Farbe rot halten unabhaengig vom Paletten-Thema
- Paletten-Eintraege nach semantischer Rolle benennen, nicht visueller Erscheinung

**Erwartet:** Ein Paletten-Objekt mit benannten Eintraegen und einem No-Color-Fallback.

**Bei Fehler:** Wenn chalk nicht verfuegbar ist (gepipte Ausgabe, CI), gibt der Proxy-Fallback Strings unveraendert zurueck. Mit `NO_COLOR=1`-Umgebungsvariable testen.

### Schritt 2: Status-Indikatoren waehlen

Unicode-Glyphen oder ASCII-Zeichen fuer Status-Kommunikation auswaehlen:

**ASCII (maximale Kompatibilitaet):**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode (reicher, braucht UTF-8-Terminal):**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

Auswahlkriterien:
- ASCII fuer Tools die in CI oder gepipten Kontexten laufen
- Unicode fuer Tools mit interaktiven Terminal-Benutzern
- Beide via `--ascii`-Flag oder `NO_COLOR`-Detection anbieten
- Glyphen testen in: macOS Terminal, Windows Terminal, VS-Code-Terminal, SSH-Sessions

**Erwartet:** Ein Glyphen-Set das Status auf einen Blick kommuniziert ohne sich allein auf Farbe zu verlassen.

**Bei Fehler:** Wenn ein Glyph beim Testen als `?` oder Box gerendert wird, durch das ASCII-Aequivalent ersetzen. Das `+/-/=/!`-Set funktioniert ueberall.

### Schritt 3: Verbosity-Stufen entwerfen

Jeder Befehl sollte vier Ausgabe-Stufen unterstuetzen:

| Stufe | Flag | Zielgruppe | Inhalt |
|-------|------|------------|--------|
| **Default** | (keine) | Mensch am Terminal | Formatiert, gefaerbt, informativ |
| **Verbose** | `--verbose` oder `--ceremonial` | Mensch der Detail will | Per-Item-Aufschluesselung, Ankunfts-Sequenzen |
| **Quiet** | `--quiet` | Skripte, CI | Minimale Zeilen, Status-Icons, keine Dekoration |
| **JSON** | `--json` | Maschinen-Konsumenten | Strukturiert, parsebar, vollstaendig |

Implementations-Muster:

```javascript
function output(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (options.quiet) {
    for (const item of data.items) {
      const icon = item.ok ? '+' : '!';
      console.log(`${icon} ${item.id}`);
    }
    return;
  }
  // Default (or verbose) human output
  printFormatted(data, { verbose: options.verbose });
}
```

JSON-Ausgabe-Regeln:
- Immer gueltiges JSON (kein Vermischen mit menschlichem Text)
- Alle Daten enthalten die die menschliche Ausgabe zeigt, plus maschinen-nuetzliche Felder
- Konsistente Schluessel-Benennung ueber Befehle
- Exit-Code 0 fuer Erfolg, 1 fuer Fehler (unabhaengig vom Ausgabe-Modus)

**Erwartet:** Vier klare Ausgabe-Stufen mit konsistentem Verhalten ueber Befehle.

**Bei Fehler:** Wenn der Verbose-Modus zu laut ist, ihn opt-in machen (`--ceremonial`) statt einer abgestuften Verbosity-Stufe.

### Schritt 4: Stimmregeln etablieren

Den Ton und Stil definieren dem alle Ausgabe-Funktionen folgen. Dies verhindert Inkonsistenz ueber Befehle.

Beispiel-Stimmregeln (vom campfire-Reporter):

1. **Praesens, Aktiv**: "mystic arrives" nicht "mystic has been installed"
2. **Keine Ausrufezeichen**: Stille Zuversicht. Das Tool schreit nicht.
3. **Metapher ersetzt Jargon**: "practices" nicht "dependencies" (nur fuer Zeremonie-Modus)
4. **Fehler sind ehrlich, nicht katastrophal**: "A spark was lost" nicht "ERROR: installation failed with exit code 1"
5. **Schlusszeile reflektiert Zustand**: Jede Operation endet mit einer Status-Zusammenfassung
6. **Keine Emojis**: Unicode-Glyphen tragen visuelles Gewicht ohne dekorativ zu sein
7. **Jedes Wort traegt Information**: Wenn ein Wort kein Verstaendnis hinzufuegt, entfernen

Stimmregeln fuer Standard- (Nicht-Zeremonie) Ausgabe:
- Praegnante, faktische Zeilen
- Status-Icon + Item-ID + Kontext
- Zusammenfassungs-Zeile mit Anzahlen
- Fehlermeldungen schlagen Korrekturmassnahmen vor

**Erwartet:** Ein geschriebener Satz von 3-7 Stimmregeln denen Ausgabe-Funktionen folgen muessen.

**Bei Fehler:** Wenn Regeln willkuerlich erscheinen, sie testen: dieselbe Ausgabe mit und ohne jede Regel schreiben. Wenn das Entfernen einer Regel die Ausgabe-Qualitaet nicht aendert, wird die Regel nicht gebraucht.

### Schritt 5: Reporter-Funktionen implementieren

Ausgabe in ein Reporter-Modul mit fokussierten Funktionen organisieren:

```javascript
// reporter.js — standard output
export function printResults(results) { ... }
export function printItemTable(items) { ... }
export function printDetections(detections) { ... }
export function printAudit(auditResults) { ... }
export function printDryRun() { ... }
export function warn(msg) { ... }
export function error(msg) { ... }
export { chalk };
```

Jede Funktion folgt derselben Struktur:
1. Leere/Null-Eingabe anmutig behandeln
2. Layout berechnen (Spaltenbreiten, Padding)
3. Mit Paletten-Farben ausgeben
4. Zusammenfassungs-Zeile am Boden

Fuer Zeremonie-Ausgabe ein separates Modul erstellen:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**Erwartet:** Reporter-Funktionen die unabhaengig nutzbar sind — jede behandelt ihre eigene Formatierung ohne von Caller-State abzuhaengen.

**Bei Fehler:** Wenn Funktionen ueber ~50 Zeilen wachsen, Helfer extrahieren. Eine Reporter-Funktion sollte einfach in Isolation reviewbar sein.

### Schritt 6: Ausgabe ueber Umgebungen testen

Verifizieren dass Ausgabe in unterschiedlichen Kontexten korrekt rendert:

```bash
# With colors (interactive terminal)
node cli/index.js list --domains

# Without colors (piped)
node cli/index.js list --domains | cat

# With NO_COLOR environment variable
NO_COLOR=1 node cli/index.js list --domains

# JSON mode (parseable)
node cli/index.js campfire --json | jq .

# In CI (typically no TTY)
CI=true node cli/index.js audit
```

Pruefen auf:
- Farben zeigen sich korrekt im interaktiven Modus
- Keine ANSI-Escape-Codes lecken in gepipte/umgeleitete Ausgabe
- JSON ist gueltig (an `jq .` pipen zur Verifikation)
- Unicode-Glyphen rendern in den Ziel-Terminals
- Spaltenausrichtung haelt mit variierenden Inhalts-Breiten

**Erwartet:** Ausgabe ist in allen fuenf Kontexten korrekt.

**Bei Fehler:** Wenn ANSI-Codes lecken, sicherstellen dass chalk `NO_COLOR` respektiert. Wenn Unicode bricht, einen ASCII-Fallback-Modus bereitstellen.

## Validierung

- [ ] Farbpalette hat einen No-Color-Fallback
- [ ] Status-Indikatoren funktionieren in beiden Farb- und No-Color-Modi
- [ ] Alle vier Verbosity-Stufen produzieren nuetzliche Ausgabe
- [ ] JSON-Ausgabe ist gueltig und durch `jq` parsebar
- [ ] Stimmregeln sind dokumentiert und konsistent befolgt
- [ ] Reporter-Funktionen behandeln leere/Null-Eingabe anmutig
- [ ] Ausgabe getestet in: Terminal, gepipt, NO_COLOR, CI

## Haeufige Stolperfallen

- **Menschlichen Text mit JSON vermischen**: Im `--json`-Modus nur gueltiges JSON ausgeben. Eine einzelne verirrte Zeile (wie "DRY RUN") bricht JSON-Parser. Wenn der Befehl beides zeigen muss, sie klar trennen oder den menschlichen Text im JSON-Modus unterdruecken.
- **Hartcodierte Spaltenbreiten**: Inhaltslaenge variiert. `Math.max(...items.map(i => i.id.length))` nutzen um Padding dynamisch zu berechnen.
- **Farbe ohne Bedeutung**: Wenn Farbe der einzige Weg ist Erfolg von Versagen zu unterscheiden, verlieren farbenblinde Benutzer und gepipte Ausgabe Information. Farbe immer mit einem Text-Indikator paaren (`+`, `OK`, `ERR`).
- **Zeremonie im falschen Kontext**: Warme narrative Ausgabe ist angemessen fuer interaktive Terminal-Sessions. In CI, Skripten oder `--quiet`-Modus fuegt sie Rauschen hinzu. Zeremonie-Ausgabe hinter explizite Flags sperren.
- **Die Zusammenfassungs-Zeile vergessen**: Benutzer scannen die letzte Zeile zuerst. Jede Operation sollte mit einer einzeiligen Zusammenfassung enden (Anzahlen Erfolg/Versagen/uebersprungen).

## Verwandte Skills

- `scaffold-cli-command` — die Befehle die diese Ausgabe nutzen
- `test-cli-application` — Tests dass Ausgabe Erwartungen entspricht
- `build-cli-plugin` — Plugins berichten Ergebnisse durch dieses Ausgabe-System
