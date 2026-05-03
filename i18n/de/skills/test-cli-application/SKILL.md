---
name: test-cli-application
description: >
  Write integration tests for a Node.js CLI application using the built-in
  node:test module. Covers the exec helper pattern, output assertions,
  filesystem state verification, cleanup hooks, JSON output parsing, error
  case testing, and state restoration after destructive tests. Use when
  adding tests to an existing CLI, testing a new command, verifying adapter
  behavior across frameworks, or setting up CI for a CLI tool.
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
    - testing
    - nodejs
    - node-test
    - integration
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# CLI-Anwendung testen

Integrations-Tests fuer eine Node.js-CLI mit dem eingebauten `node:test`-Modul mit `execSync` schreiben.

## Wann verwenden

- Tests zu einer existierenden CLI-Anwendung hinzufuegen
- Einen neu erstellten Befehl testen
- Adapter-/Plugin-Verhalten ueber Ziel-Frameworks verifizieren
- CI einrichten das CLI-Korrektheit validiert
- Regressionen nach CLI-Internals-Refactoring abfangen

## Eingaben

- **Erforderlich**: Pfad zum CLI-Eintrittspunkt (z.B. `cli/index.js`)
- **Erforderlich**: Zu testende Befehle
- **Optional**: Framework-Adapter zu testen (Dry-Run-Modus)
- **Optional**: Cleanup-Anforderungen (Dateien/Symlinks die durch Tests erstellt werden)

## Vorgehensweise

### Schritt 1: Test-Infrastruktur einrichten

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10000,
  });
}
```

Schluessel-Design-Entscheidungen:
- `node:test` ist eingebaut — keine Test-Runner-Abhaengigkeit noetig
- `execSync` fuehrt die CLI als Subprozess aus — testet das tatsaechliche Binary, nicht interne Funktionen
- 10-Sekunden-Timeout verhindert Haengen bei interaktiven Prompts
- `encoding: 'utf8'` gibt String-Ausgabe fuer Regex-Matching
- Alle Pfade relativ zu `ROOT` fuer Reproduzierbarkeit

**Erwartet:** Eine Test-Datei die aus `node:test` importiert und einen funktionierenden `run()`-Helper hat.

**Bei Fehler:** Wenn `node:test` nicht verfuegbar ist, ist deine Node.js-Version unter 18. Upgraden oder einen Polyfill nutzen.

### Schritt 2: Smoke-Tests schreiben

Smoke-Tests verifizieren dass die CLI startet, Argumente parst und erwartete Ausgabe-Formen produziert:

```javascript
describe('meta', () => {
  it('shows version', () => {
    const out = run('--version');
    assert.match(out, /\d+\.\d+\.\d+/);
  });

  it('shows help with all commands', () => {
    const out = run('--help');
    assert.match(out, /install/);
    assert.match(out, /list/);
    assert.match(out, /detect/);
  });
});

describe('registry', () => {
  it('list shows expected counts', () => {
    const out = run('list --domains');
    assert.match(out, /\d+ domains/);
  });

  it('search finds known items', () => {
    const out = run('search "docker"');
    assert.match(out, /result\(s\) for "docker"/);
  });

  it('search returns 0 for nonsense', () => {
    const out = run('search "xyzzy-nonexistent"');
    assert.match(out, /0 result/);
  });
});
```

Smoke-Test-Muster:
- `--version` und `--help` funktionieren immer
- Registry-Laden validiert Daten-Integritaet
- Suche mit bekannten und unbekannten Begriffen

**Erwartet:** Smoke-Tests bestaetigen dass die CLI funktional ist und Daten geladen sind.

**Bei Fehler:** Wenn Registry-Anzahlen sich haeufig aendern, `\d+` statt hartcodierter Zahlen nutzen.

### Schritt 3: Lifecycle-Tests schreiben

Lifecycle-Tests verifizieren Erstellen → Verifizieren → Loeschen-Sequenzen mit Cleanup:

```javascript
describe('install', () => {
  const testPath = resolve(ROOT, '.agents/skills/commit-changes');

  after(() => {
    // Always clean up, even if tests fail
    try { rmSync(testPath); } catch {}
    try { rmSync(resolve(ROOT, '.agents/skills'), { recursive: true }); } catch {}
    try { rmSync(resolve(ROOT, '.agents'), { recursive: true }); } catch {}
  });

  it('dry-run does not create files', () => {
    const out = run('install commit-changes --dry-run');
    assert.match(out, /DRY RUN/);
    assert.ok(!existsSync(testPath));
  });

  it('installs creates the target', () => {
    run('install commit-changes');
    assert.ok(existsSync(testPath));
  });

  it('skips already installed', () => {
    const out = run('install commit-changes');
    assert.match(out, /skipped/);
  });

  it('uninstall removes the target', () => {
    run('uninstall commit-changes');
    assert.ok(!existsSync(testPath));
  });
});
```

Cleanup-Regeln:
- `after()`-Hooks nutzen, nicht `afterEach()` — Lifecycle-Tests bauen aufeinander auf
- Cleanup in `try/catch` wickeln — Cleanup darf die Test-Suite nicht scheitern lassen
- Von Blatt zu Wurzel aufraeumen (Datei → Eltern-Dir → Grosseltern-Dir)
- Wenn der Test geteilten State modifiziert (Symlinks, Config-Dateien), ihn wiederherstellen

**Erwartet:** Tests laufen sequenziell innerhalb des describe-Blocks, Cleanup laeuft auch bei Versagen.

**Bei Fehler:** Wenn Tests parallel laufen (Nicht-Default in node:test), sequenziell mit `{ concurrency: 1 }` erzwingen.

### Schritt 4: Dry-Run-Tests fuer jeden Adapter schreiben

Den Ziel-Pfad jedes Adapters testen ohne Aenderungen zu machen:

```javascript
describe('adapter: cursor (dry-run)', () => {
  it('targets .cursor/skills/ path', () => {
    const out = run('install commit-changes --framework cursor --dry-run');
    assert.match(out, /\.cursor\/skills/i);
  });
});

describe('adapter: copilot (dry-run)', () => {
  it('targets .github/ path', () => {
    const out = run('install commit-changes --framework copilot --dry-run');
    assert.match(out, /\.github/i);
  });
});
```

Dieses Muster skaliert auf jede Anzahl Adapter. Jeder Test:
- Nutzt `--framework` um Auto-Detection zu umgehen
- Nutzt `--dry-run` damit keine Dateien erstellt werden
- Behauptet dass der Ziel-Pfad in der Ausgabe erscheint

**Erwartet:** Ein describe-Block pro Adapter, jeder mit mindestens einer Pfad-Behauptung.

**Bei Fehler:** Wenn der Adapter im Projekt nicht existiert, wird der Test mit "Unknown framework" scheitern. Das ist korrekt — Adapter-Tests sollten nur fuer implementierte Adapter existieren.

### Schritt 5: Fehlerfall-Tests schreiben

```javascript
describe('errors', () => {
  it('rejects unknown items', () => {
    assert.throws(
      () => run('install nonexistent-skill-xyz'),
      /No matching items|Unknown/,
    );
  });

  it('rejects unknown framework', () => {
    assert.throws(
      () => run('install commit-changes --framework nonexistent'),
      /Unknown framework/,
    );
  });

  it('handles missing state gracefully', () => {
    assert.throws(
      () => run('scatter nonexistent-team'),
      /not burning|Unknown/,
    );
  });
});
```

Fehler-Test-Muster:
- `assert.throws` faengt Nicht-Null-Exit-Codes von `execSync`
- Regex-Match auf der Fehlermeldung (von stderr erfasst)
- Sowohl "Item nicht gefunden"- als auch "Ungueltige Option"-Fehler testen
- Verifizieren dass Fehlermeldungen Korrekturmassnahmen vorschlagen

**Erwartet:** Alle Fehler-Pfade produzieren Nicht-Null-Exit-Codes und hilfreiche Nachrichten.

**Bei Fehler:** `execSync` wirft bei Nicht-Null-Exit. Der `stderr` oder `stdout` des Fehlers enthaelt die Nachricht. `error.stdout` pruefen wenn `assert.throws` Regex nicht matcht.

### Schritt 6: JSON-Ausgabe-Tests schreiben

```javascript
describe('json output', () => {
  it('campfire --json outputs valid JSON', () => {
    const out = run('campfire --json');
    const data = JSON.parse(out);
    assert.ok(typeof data.totalTeams === 'number');
    assert.ok(Array.isArray(data.fires));
  });

  it('gather --dry-run --json outputs structured data', () => {
    const out = run('gather tending --dry-run --json');
    // JSON may follow a DRY RUN header — extract from first '{'
    const jsonStart = out.indexOf('{');
    assert.ok(jsonStart >= 0, 'Should contain JSON');
    const data = JSON.parse(out.slice(jsonStart));
    assert.equal(data.team, 'tending');
  });
});
```

JSON-Test-Fallstricke:
- Manche Befehle praefixen JSON mit menschlich lesbarem Text (z.B. DRY-RUN-Header)
- JSON extrahieren indem das erste `{`-Zeichen gefunden wird
- Struktur validieren (Schluessel-Praesenz, Typen), nicht exakte Werte
- Werte wie Anzahlen koennen sich aendern wenn Inhalt hinzugefuegt wird

**Erwartet:** JSON-Ausgabe ist parsebar und enthaelt erwartete Schluessel.

**Bei Fehler:** Wenn `JSON.parse` scheitert, mischt der Befehl moeglicherweise menschlichen Text mit JSON. Entweder den Befehl reparieren um pures JSON in `--json`-Modus auszugeben oder den JSON-Substring extrahieren.

### Schritt 7: Cleanup und State-Wiederherstellung handhaben

```javascript
describe('stateful commands', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    // Remove state file created by tests
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  // Tests that create/modify state...
});

// Restore symlinks that destructive tests may remove
describe('destructive tests', () => {
  after(() => {
    // Restore symlinks that scatter/uninstall removed
    const skills = ['heal', 'meditate', 'remote-viewing'];
    for (const skill of skills) {
      const link = resolve(ROOT, `.claude/skills/${skill}`);
      if (!existsSync(link)) {
        try {
          execSync(`ln -s ../../skills/${skill} ${link}`, { cwd: ROOT });
        } catch {}
      }
    }
  });
});
```

State-Wiederherstellungs-Regeln:
- State-Dateien (`.agent-almanac/state.json`) muessen nach Tests aufgeraeumt werden
- Symlinks die von `scatter`/`uninstall` entfernt wurden muessen wiederhergestellt werden
- Manifest-Dateien (`agent-almanac.yml`) die durch `init` erstellt wurden muessen entfernt werden
- Reihenfolge: `after()`-Hooks laufen in umgekehrter Deklarations-Reihenfolge — Restore-Hooks zuletzt deklarieren

**Erwartet:** Die Test-Suite hinterlaesst das Projekt in demselben Zustand in dem sie es vorgefunden hat.

**Bei Fehler:** Wenn CI Restdateien nach Test-Laeufen berichtet, das Cleanup zu `after()` hinzufuegen. `git status` nach Test-Laeufen nutzen um geleckten State zu erkennen.

## Validierung

- [ ] Test-Datei laeuft mit `node --test cli/test/cli.test.js`
- [ ] Alle Tests bestehen (0 Versagen)
- [ ] Smoke-Tests decken `--version`, `--help` und Registry-Laden ab
- [ ] Lifecycle-Tests verifizieren Erstellen → Verifizieren → Loeschen mit Cleanup
- [ ] Mindestens ein Adapter-Dry-Run-Test existiert pro implementiertem Adapter
- [ ] Fehlerfaelle testen Nicht-Null-Exit-Codes mit Nachrichten-Matching
- [ ] JSON-Ausgabe-Tests parsen tatsaechliche Ausgabe (nicht gemockt)
- [ ] After-Hooks stellen allen durch Tests modifizierten State wieder her

## Haeufige Stolperfallen

- **Hartcodierte Anzahlen die brechen**: Registry-Totale aendern sich wenn Inhalt hinzugefuegt wird. `\d+`-Regex nutzen oder die Anzahl dynamisch lesen statt `329 skills` zu behaupten.
- **Tests die von Ausfuehrungs-Reihenfolge abhaengen**: `node:test` laeuft Suites in Deklarations-Reihenfolge per Default, aber Tests innerhalb einer Suite koennen das nicht. Lifecycle-Suites (Erstellen → Verifizieren → Loeschen) innerhalb eines einzelnen `describe` nutzen um Reihenfolge zu garantieren.
- **Fehlendes Cleanup bei Test-Versagen**: Wenn ein Test mitten im Lifecycle scheitert, laeuft `after()` immer noch. Aber wenn man in `before()` wirft, koennen nachfolgende Tests und `after()` nicht laufen. `before()` minimal halten.
- **Interaktive Prompts haengen Tests**: Befehle mit Bestaetigungs-Prompts werden `execSync` haengen. Entweder `echo y |` pipen oder sicherstellen dass `--yes` immer in Tests uebergeben wird.
- **Mit echten Installs in CI testen**: Tests die Dateien in `.claude/skills/` oder `.agents/skills/` erstellen modifizieren den Working-Tree. CI kann an "dirty working directory"-Pruefungen scheitern. Immer aufraeumen.

## Verwandte Skills

- `scaffold-cli-command` — die Befehle bauen die diese Tests verifizieren
- `build-cli-plugin` — die in Schritt 4 getesteten Adapter bauen
- `design-cli-output` — Ausgabe-Muster gegen die Tests behaupten
