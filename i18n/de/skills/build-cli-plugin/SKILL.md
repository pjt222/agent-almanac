---
name: build-cli-plugin
description: >
  Build a plugin or adapter for a CLI tool using the abstract base class
  pattern. Covers defining the contract (static fields, required methods),
  choosing an installation strategy (symlink, copy, append-to-file),
  implementing detection, install/uninstall with idempotency, listing,
  auditing, and registering the plugin. Use when adding support for a
  new framework to a CLI installer, building a plugin system for any
  multi-target tool, or extending an existing adapter architecture.
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
    - plugin
    - adapter
    - architecture
    - nodejs
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# CLI-Plugin bauen

Ein neues Plugin oder Adapter zur pluggablen Architektur eines CLI-Tools mit dem Abstract-Base-Class-Muster hinzufuegen.

## Wann verwenden

- Hinzufuegen von Unterstuetzung fuer ein neues Ziel-Framework zu einem CLI-Installer
- Bauen eines Plugin-Systems fuer ein Multi-Ziel-Kommandozeilen-Tool
- Erweitern einer bestehenden Adapter-Architektur mit einer neuen Strategie-Variante
- Portieren von Content-Delivery zu einem Framework das ein anderes Datei-Layout verwendet

## Eingaben

- **Erforderlich**: Framework oder Ziel das das Plugin unterstuetzt (Name, Config-Pfade, Konventionen)
- **Erforderlich**: Pfad zur Basisklasse oder zum Plugin-Vertrag
- **Erforderlich**: Installationsstrategie: `symlink`, `copy`, `file-per-item` oder `append-to-file`
- **Optional**: Inhaltstypen die das Plugin behandelt (z.B. nur Skills, Skills + Agents, volle Unterstuetzung)
- **Optional**: Scope-Unterstuetzung (Projekt-Ebene, global, beide)

## Vorgehensweise

### Schritt 1: Den Vertrag definieren

Die Basisklasse etabliert das Interface das alle Plugins implementieren muessen:

```javascript
export class FrameworkAdapter {
  static id = 'base';            // Unique identifier
  static displayName = 'Base';   // Human-readable name
  static strategy = 'symlink';   // Installation strategy
  static contentTypes = ['skill']; // What this adapter handles

  async detect(projectDir) { return false; }
  getTargetPath(projectDir, scope) { throw new Error('Not implemented'); }
  async install(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async uninstall(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async listInstalled(projectDir, scope) { return []; }
  async audit(projectDir, scope) { return { framework: this.constructor.displayName, ok: [], warnings: [], errors: [] }; }
  supports(contentType) { return this.constructor.contentTypes.includes(contentType); }
}
```

**Statische Felder** definieren die Identitaet und Faehigkeiten des Plugins:
- `id`: In `--framework <id>`-Option und Ergebnisbericht verwendet
- `displayName`: In menschlich lesbarer Ausgabe gezeigt
- `strategy`: Bestimmt wie Inhalt das Ziel erreicht
- `contentTypes`: Filtert welche Eintraege dieser Adapter empfaengt

Wenn die Basisklasse noch nicht existiert, sie zuerst erstellen. Das Muster skaliert auf jede Plugin-Anzahl.

**Erwartet:** Eine Basisklasse mit statischen Identitaetsfeldern und abstrakten Methoden.

**Bei Fehler:** Wenn die Basisklasse Methoden hat die nicht auf alle Plugins zutreffen (z.B. nicht alle Frameworks unterstuetzen `audit`), Standard-Implementationen bereitstellen die sinnvolle No-Ops zurueckgeben.

### Schritt 2: Die Installationsstrategie waehlen

| Strategie | Wann verwenden | Beispiel |
|-----------|----------------|----------|
| **symlink** | Ziel liest Quelldateien direkt. Guenstigste, bleibt synchron. | Claude Code liest `.claude/skills/<name>/`-Symlinks |
| **copy** | Ziel braucht Dateien in eigenem Verzeichnis. Modifikationen propagieren nicht. | Manche IDEs indizieren nur eigene Dirs |
| **file-per-item** | Ziel erwartet eine Datei pro Eintrag mit spezifischem Format. | Cursor `.mdc`-Regel-Dateien |
| **append-to-file** | Ziel liest eine einzige Instruktionsdatei. | Aider `CONVENTIONS.md`, Codex `AGENTS.md` |

Strategie bestimmt die Implementations-Form:
- **Symlink**: `symlinkSync(source, target)` — relative vs. absolute Pfade behandeln
- **Copy**: `cpSync(source, target, { recursive: true })` — Ueberschreibungen behandeln
- **File-per-item**: `writeFileSync(target, transform(content))` — kann Format-Konvertierung brauchen
- **Append-to-file**: Inhalt mit Markern fuer idempotenten Insert/Replace/Remove umhuellen

**Erwartet:** Strategie ausgewaehlt mit klarer Begruendung basierend darauf wie das Ziel-Framework Inhalt entdeckt.

**Bei Fehler:** Wenn unsicher, die Framework-Dokumentation pruefen wie es Konfiguration oder Instruktionsdateien entdeckt. Auf symlink defaulten wenn das Framework beliebige Verzeichnisse liest.

### Schritt 3: Detection implementieren

Detection sagt der CLI welche Frameworks in einem Projekt vorhanden sind:

```javascript
// In detector.js — each rule checks for a filesystem marker
const RULES = [
  {
    id: 'my-framework',
    displayName: 'My Framework',
    check: (dir) => existsSync(resolve(dir, '.myframework/')),
    marker: '.myframework/',
    scope: 'project',
  },
];
```

Detection-Strategien:
- **Verzeichnis-Praesenz**: `.claude/`, `.cursor/`, `.gemini/`
- **Config-Datei**: `opencode.json`, `.aider.conf.yml`
- **Instruktions-Datei**: `AGENTS.md`, `CONVENTIONS.md`
- **Globale Marker**: `~/.openclaw/`, `~/.hermes/`

Den Marker immer im Detection-Ergebnis zurueckgeben damit Benutzer verstehen koennen warum ein Framework erkannt wurde.

**Erwartet:** Eine Detection-Regel die das Framework zuverlaessig ohne False Positives identifiziert.

**Bei Fehler:** Wenn das Framework keinen einzigartigen Marker hat (generischer Verzeichnisname), eine Kombination von Markern verwenden oder explizite `--framework`-Spezifikation verlangen.

### Schritt 4: Install mit Idempotenz implementieren

```javascript
async install(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  // Idempotency: skip if already installed (unless force)
  if (existsSync(targetPath) && !options.force) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'created', path: targetPath, details: 'dry-run' };
  }

  // Ensure parent directory exists
  mkdirSync(targetDir, { recursive: true });

  // Strategy-specific installation
  if (this.constructor.strategy === 'symlink') {
    const relPath = relative(targetDir, item.sourceDir);
    symlinkSync(relPath, targetPath);
  } else if (this.constructor.strategy === 'copy') {
    cpSync(item.sourceDir, targetPath, { recursive: true });
  }

  return { action: 'created', path: targetPath };
}
```

Idempotenz-Regeln:
- **Skip** wenn Ziel existiert und `--force` nicht gesetzt ist
- **Overwrite** wenn `--force` gesetzt ist (zuerst entfernen, dann installieren)
- **Dry-run** ist immer mit `action: 'created'` erfolgreich
- **Returnwert** muss immer `{ action, path, details? }` sein

**Erwartet:** Install erstellt Inhalt am Ziel-Pfad, ueberspringt wenn bereits vorhanden, respektiert `--force` und `--dry-run`.

**Bei Fehler:** Wenn Symlink-Erstellung auf Windows/NTFS scheitert, auf Verzeichnis-Junction oder Copy zurueckfallen. Das Fallback loggen.

### Schritt 5: Uninstall mit Cleanup implementieren

```javascript
async uninstall(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  if (!existsSync(targetPath)) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'removed', path: targetPath };
  }

  // Remove the installed content
  rmSync(targetPath, { recursive: true });

  return { action: 'removed', path: targetPath };
}
```

Cleanup-Ueberlegungen:
- Nur entfernen was das Plugin installiert hat — niemals benutzererstellte Dateien loeschen
- Fuer append-to-file: den markierten Abschnitt entfernen, nicht die ganze Datei
- Eltern-Verzeichnisse intakt lassen (andere Plugins koennen sie nutzen)

**Erwartet:** Uninstall entfernt nur den Plugin-Inhalt und sonst nichts.

**Bei Fehler:** Wenn Entfernung scheitert (Berechtigungen, gesperrte Datei), ein Fehler-Ergebnis zurueckgeben statt zu werfen.

### Schritt 6: Listing und Audit implementieren

```javascript
async listInstalled(projectDir, scope) {
  const targetDir = this.getTargetPath(projectDir, scope);
  if (!existsSync(targetDir)) return [];

  const entries = readdirSync(targetDir);
  return entries.map(name => {
    const fullPath = resolve(targetDir, name);
    const broken = lstatSync(fullPath).isSymbolicLink()
      && !existsSync(fullPath);
    return { id: name, type: 'skill', broken };
  });
}

async audit(projectDir, scope) {
  const items = await this.listInstalled(projectDir, scope);
  const ok = items.filter(i => !i.broken);
  const broken = items.filter(i => i.broken);
  return {
    framework: this.constructor.displayName,
    ok: [`${ok.length} skills installed`],
    warnings: [],
    errors: broken.map(i => `Broken: ${i.id}`),
  };
}
```

**Erwartet:** Listing gibt alle installierten Eintraege mit Broken-Link-Detection zurueck. Audit fasst Gesundheit zusammen.

**Bei Fehler:** Wenn das Ziel-Verzeichnis nicht existiert, leere Ergebnisse zurueckgeben (kein Fehler — das Framework hat einfach nichts installiert).

### Schritt 7: Das Plugin registrieren

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

Registrierung macht den Adapter verfuegbar fuer:
- Auto-Detection (`detectFrameworks()` → `getAdaptersForDetections()`)
- Explizite Auswahl (`--framework my-framework`)
- Listing (`listAdapters()`)

**Erwartet:** Der Adapter erscheint in der `tool detect`-Ausgabe und kann mit `--framework` adressiert werden.

**Bei Fehler:** Wenn der Adapter nicht erscheint, verifizieren dass `static id` mit der Detection-Regel-`id` uebereinstimmt und dass `register()` aufgerufen wurde.

### Schritt 8: Tests schreiben

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

Mindestens testen: Dry-Run-Pfad, Detection-Praesenz und Inhaltstyp-Unterstuetzung.

**Erwartet:** Adapter-spezifische Tests bestaetigen den Installationspfad und das Verhalten.

**Bei Fehler:** Wenn das Framework in CI nicht erkannt wird (kein Marker-Verzeichnis), `--framework` explizit in Tests verwenden.

## Validierung

- [ ] Plugin erweitert die Basisklasse korrekt
- [ ] Statische Felder (`id`, `displayName`, `strategy`, `contentTypes`) sind gesetzt
- [ ] Detection-Regel identifiziert das Framework ohne False Positives
- [ ] `install()` ist idempotent (skip wenn vorhanden, `--force` respektieren)
- [ ] `uninstall()` entfernt nur plugin-erstellten Inhalt
- [ ] `listInstalled()` erkennt defekte Symlinks
- [ ] `audit()` berichtet Gesundheit akkurat
- [ ] Plugin ist registriert und erscheint in `tool detect`
- [ ] Dry-Run-Tests bestehen

## Haeufige Stolperfallen

- **Relative vs. absolute Symlinks vergessen**: Projekt-Scope-Symlinks sollten relativ sein (portabel). Globale-Scope-Symlinks sollten absolut sein (nicht abhaengig von cwd).
- **Fehlende Eltern-Verzeichnisse nicht behandeln**: Immer `mkdirSync(dir, { recursive: true })` vor dem Erstellen von Inhalt.
- **Append-to-file ohne Marker**: Ohne idempotente Marker (`<!-- start:id -->` / `<!-- end:id -->`) duplizieren wiederholte Installs Inhalt. Angefuegten Inhalt immer umhuellen.
- **Detection-False-Positives**: Ein generischer Verzeichnisname (z.B. `.config/`) kann mehrere Frameworks matchen. Spezifische Datei-Marker innerhalb des Verzeichnisses verwenden.
- **`supports()`-Pruefung vergessen**: Der Installer ruft `supports(item.type)` vor Dispatch. Wenn `contentTypes` falsch ist, ueberspringt der Adapter Eintraege still.

## Verwandte Skills

- `scaffold-cli-command` — die CLI-Befehle bauen die dieses Plugin nutzen
- `test-cli-application` — Test-Muster fuer CLI-Tools inklusive Adapter-Tests
- `design-cli-output` — Terminal-Ausgabe fuer Install/Uninstall-Ergebnisse
