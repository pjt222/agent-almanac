---
name: scaffold-cli-command
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers command naming, option design, shared context patterns,
  error handling, and integration testing. Use when adding a command to an
  existing Commander.js CLI, designing a new CLI tool from scratch, or
  standardizing command structure across a multi-command CLI.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: intermediate
  language: TypeScript
  tags:
    - cli
    - commander
    - nodejs
    - terminal
    - command-pattern
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# CLI-Befehl scaffolden

Einen neuen Befehl zu einer Commander.js-CLI-Anwendung mit konsistenter Options-Behandlung, drei Ausgabe-Modi und Integrations-Tests hinzufuegen.

## Wann verwenden

- Hinzufuegen eines neuen Befehls zu einer existierenden Commander.js-CLI
- Entwerfen eines Multi-Befehl-CLI-Tools von Grund auf
- Standardisieren der Befehls-Struktur damit alle Befehle denselben Mustern folgen
- Hinzufuegen einer "Zeremonie"-Variante die Maschinen-Ausgabe mit warmer, narrativer Ausgabe ersetzt

## Eingaben

- **Erforderlich**: Befehlsname und -verb (z.B. `gather`, `audit`, `sync`)
- **Erforderlich**: Was der Befehl tut (ein Satz)
- **Erforderlich**: Pfad zum CLI-Eintrittspunkt (z.B. `cli/index.js`)
- **Optional**: Ob der Befehl eine Zeremonie-Variante braucht (warme narrative Ausgabe)
- **Optional**: Custom-Optionen ueber das Standard-Set hinaus
- **Optional**: Subbefehl-Argumente (positionelle Args wie `<name>` oder `[names...]`)

## Vorgehensweise

### Schritt 1: Befehlsname und Kategorie waehlen

Ein Verb auswaehlen das die Aktion des Befehls kommuniziert. Befehle in Kategorien gruppieren:

| Kategorie | Verben | Muster |
|-----------|--------|--------|
| CRUD | `install`, `uninstall`, `list`, `search` | Operiert auf Inhalt |
| Lifecycle | `init`, `sync`, `audit` | Verwaltet Projekt-State |
| Zeremonie | `gather`, `scatter`, `tend`, `campfire` | Warme narrative Ausgabe |

Namens-Konventionen:
- Ein einzelnes Verb verwenden (nicht `install-skill` — Optionen spezifizieren lassen was)
- Kleinbuchstaben verwenden, keine Bindestriche im Befehlsnamen selbst
- Positionelle Args: `<required>` oder `[optional]` oder `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**Erwartet:** Ein Befehlsname, eine Beschreibung und positionelle Args definiert.

**Bei Fehler:** Wenn das Verb mit einem existierenden Befehl ueberlappt, sie entweder komponieren (eine Option zum existierenden Befehl hinzufuegen) oder klar in der Beschreibung differenzieren.

### Schritt 2: Optionen definieren

Jeder Befehl sollte ein Standard-Set geteilter Optionen plus befehl-spezifische unterstuetzen.

**Standard-Optionen** (nach Bedarf einbeziehen):

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**Befehl-spezifische Optionen** — nur hinzufuegen was der Befehl braucht:

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

Design-Regeln:
- Kurze Flags (`-n`) fuer haeufig genutzte Optionen
- Lange Flags (`--dry-run`) fuer Klarheit
- Default-Werte als drittes Argument wo angemessen
- Boolesche Flags (kein Argument) fuer Toggles

**Erwartet:** Eine vollstaendige Options-Kette mit beiden Standard- und Custom-Optionen.

**Bei Fehler:** Wenn zu viele Optionen akkumulieren (>8), in Erwaegung ziehen in Subbefehle aufzuteilen oder verwandte Optionen zu gruppieren.

### Schritt 3: Den Action-Handler implementieren

Der Action-Handler folgt einem konsistenten Muster:

```javascript
.action(async (name, options) => {
  // 1. Get shared context (registries, adapters, paths)
  const ctx = getContext(options);

  // 2. Resolve what to operate on
  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  // 3. Preview if dry-run
  if (options.dryRun) reporter.printDryRun();

  // 4. Execute the operation
  const results = await executeOperation(items, ctx, options);

  // 5. Output results (3 modes)
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

Der `getContext()`-Shared-Helper zentralisiert:
- Root-Verzeichnis-Detection
- Registry-Laden
- Framework-Detection oder explizite Auswahl
- Scope-Aufloesung

**Erwartet:** Ein Action-Handler der dem 5-Schritte-Muster folgt: Kontext → Aufloesen → Vorschau → Ausfuehren → Ausgabe.

**Bei Fehler:** Wenn der Befehl nicht in das Resolve-then-Execute-Muster passt (z.B. er ist rein informationell wie `detect`), vereinfachen zu: Kontext → Berechnen → Ausgabe.

### Schritt 4: Die drei Ausgabe-Modi hinzufuegen

Jeder Befehl sollte drei Ausgabe-Modi unterstuetzen:

**Default (menschlich lesbar):**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`):**
Standard-Reporter-Ausgabe — praegnante Zeilen mit Status-Icons (`+`, `-`, `=`, `!`), keine Zeremonie, keine Dekoration.

**JSON (`--json`):**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

Implementations-Muster:

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
// Default: human-readable output
printHumanReadable(results, options);
```

**Erwartet:** Alle drei Modi produzieren nuetzliche Ausgabe. JSON ist parsebar. Quiet ist praegnant. Default ist informativ.

**Bei Fehler:** Wenn der Befehl keine bedeutungsvolle JSON-Repraesentation hat (z.B. `detect`), den JSON-Modus ueberspringen und dokumentieren warum.

### Schritt 5: Zeremonie-Variante hinzufuegen (Optional)

Fuer Befehle die von warmer, narrativer Ausgabe statt transaktionalem Reporting profitieren:

```javascript
if (options.json) {
  ceremonyReporter.printJson(data);
} else if (options.quiet) {
  reporter.printResults(results);
} else {
  ceremonyReporter.printArrival({
    teamId: name,
    agents,
    results: { installed, skipped, failed },
    ceremonial: options.ceremonial || false,
  });
}
```

Zeremonie-Ausgabe folgt Stimm-Regeln:
1. Praesens, Aktiv ("mystic arrives", nicht "mystic was installed")
2. Keine Ausrufezeichen
3. Metapher ersetzt Jargon ("practices" nicht "dependencies")
4. Versagen sind ehrlich, nicht katastrophal ("a spark was lost")
5. Schlusszeile reflektiert Zustand ("The fire burns.")
6. Keine Emojis — Unicode-Glyphen verwenden (✦ ◉ ◎ ○ ✗)
7. Jedes Wort muss Information tragen

Siehe den `design-cli-output`-Skill fuer detaillierte Terminal-Ausgabe-Muster.

**Erwartet:** Zeremonie-Ausgabe die alle Stimm-Regeln befolgt und warme, informative Narrativen produziert.

**Bei Fehler:** Wenn die Zeremonie-Ausgabe sich erzwungen anfuehlt oder keine Information ueber die Standard-Ausgabe hinaus hinzufuegt, sie ueberspringen. Nicht jeder Befehl braucht eine Zeremonie-Variante.

### Schritt 6: Fehler und Grenzfaelle behandeln

```javascript
// Unknown item
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

// Confirmation for destructive actions
if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

// State validation
if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

Fehler-Design-Prinzipien:
- Fehlermeldungen schlagen die Korrekturmassnahme vor
- `process.exit(1)` fuer nicht behebbare Fehler
- Bestaetigungs-Prompts fuer destruktive Operationen (umgehen mit `--yes`)
- Dry-run ist immer erfolgreich (blockiert nie auf Bestaetigung)

**Erwartet:** Alle Fehler-Pfade produzieren hilfreiche Nachrichten. Destruktive Operationen erfordern Bestaetigung.

**Bei Fehler:** Wenn Bestaetigungs-Prompts mit Skripting interferieren, sicherstellen dass `--yes` und `--quiet` beide sie umgehen.

### Schritt 7: Integrations-Tests schreiben

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { /* cleanup created files/state */ });

  it('dry-run shows preview', () => {
    const out = run('new-command arg --dry-run');
    assert.match(out, /DRY RUN/);
  });

  it('--json outputs valid JSON', () => {
    const out = run('new-command arg --json');
    const start = out.indexOf('{');
    const data = JSON.parse(out.slice(start));
    assert.equal(data.command, 'new-command');
  });

  it('rejects unknown input', () => {
    assert.throws(() => run('new-command nonexistent'), /Unknown/);
  });
});
```

Siehe den `test-cli-application`-Skill fuer umfassende CLI-Test-Muster.

**Erwartet:** Mindestens 3 Tests: Dry-Run, JSON-Ausgabe, Fehler-Fall. Mehr fuer komplexe Befehle.

**Bei Fehler:** Wenn `execSync` Timeout erreicht, das Timeout erhoehen oder auf interaktive Prompts pruefen die den Befehl blockieren.

## Validierung

- [ ] Befehl ist im CLI-Eintrittspunkt registriert und erscheint in `--help`
- [ ] Standard-Optionen (`--dry-run`, `--quiet`, `--json`) funktionieren korrekt
- [ ] Default-Ausgabe ist menschlich lesbar und informativ
- [ ] JSON-Ausgabe ist gueltig und parsebar
- [ ] Fehlermeldungen schlagen Korrekturmassnahmen vor
- [ ] Destruktive Operationen erfordern Bestaetigung (umgangen durch `--yes`)
- [ ] Mindestens 3 Integrations-Tests bestehen
- [ ] Befehl folgt dem getContext → Aufloesen → Ausfuehren → Ausgabe-Muster

## Haeufige Stolperfallen

- **Den JSON-Modus vergessen**: Maschinen-Konsumenten (Skripte, CI) haengen von strukturierter Ausgabe ab. Immer `--json` implementieren auch wenn der Befehl interaktiv-only erscheint.
- **Bestaetigungs-Prompts blockieren Skripte**: Jeder Befehl der nach Eingabe fragt wird in nicht-interaktiven Kontexten haengen. Immer `--yes` fuer destruktive Befehle bereitstellen und sicherstellen dass `--quiet` Prompts unterdrueckt.
- **Inkonsistente Fehler-Exit-Codes**: `process.exit(1)` fuer alle Fehler verwenden. Tools die CLI-Ausgabe parsen pruefen Exit-Codes zuerst.
- **Optionen ohne Defaults**: Optionen wie `--scope` sollten sinnvolle Defaults haben damit Benutzer sie nicht jedes Mal spezifizieren muessen.
- **Zeremonie in Quiet-Modus lecken**: Das `--quiet`-Flag bedeutet "minimale Ausgabe fuer Maschinen". Wenn Zeremonie-Text in Quiet-Modus leckt, werden Skripte an unerwarteter Ausgabe brechen.

## Verwandte Skills

- `build-cli-plugin` — den Adapter/das Plugin bauen auf dem Befehle operieren
- `test-cli-application` — umfassende CLI-Test-Muster ueber die Basics in Schritt 7 hinaus
- `design-cli-output` — Terminal-Ausgabe-Design fuer alle Verbosity-Stufen
- `install-almanac-content` — Beispiel eines gut strukturierten CLI-Befehls-Skills
