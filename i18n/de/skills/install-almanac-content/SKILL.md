---
name: install-almanac-content
description: >
  Install skills, agents, and teams from agent-almanac into any supported
  agentic framework using the CLI. Covers framework detection, content
  search, installation with dependency resolution, health auditing, and
  manifest-based syncing. Use when setting up a new project with agentic
  capabilities, installing specific skills or entire domains, targeting
  multiple frameworks simultaneously, or maintaining a declarative
  manifest of installed content.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Almanac-Inhalt installieren

Die `agent-almanac`-CLI nutzen um Skills, Agents und Teams in jedes unterstuetzte agentische Framework zu installieren.

## Wann verwenden

- Aufsetzen eines neuen Projekts und Bedarf agentische Skills, Agents oder Teams zu installieren
- Installieren aller Skills aus einer spezifischen Domaene (z.B. `r-packages`, `devops`)
- Mehrere Frameworks gleichzeitig anvisieren (Claude Code, Cursor, Copilot, etc.)
- Erstellen oder Synchronisieren eines deklarativen `agent-almanac.yml`-Manifests fuer reproduzierbare Setups
- Auditing installierten Inhalts auf defekte Symlinks oder veraltete Referenzen

## Eingaben

- **Erforderlich**: Zu installierender Inhalt -- eine oder mehrere Skill-, Agent- oder Team-IDs (z.B. `create-skill`, `r-developer`, `r-package-review`)
- **Optional**: `--domain <domain>` -- alle Skills aus einer Domaene installieren statt einzelne IDs zu nennen
- **Optional**: `--framework <id>` -- ein spezifisches Framework anvisieren (Standard: alle auto-erkennen)
- **Optional**: `--with-deps` -- auch Agent-Skills und Team-Agents+Skills installieren
- **Optional**: `--dry-run` -- Aenderungen vorschauen ohne auf Disk zu schreiben
- **Optional**: `--global` -- in globalen Scope installieren statt Projekt-Scope
- **Optional**: `--force` -- existierenden Inhalt ueberschreiben
- **Optional**: `--source <path>` -- expliziter Pfad zur agent-almanac-Wurzel (Standard: auto-erkennen)

## Vorgehensweise

### Schritt 1: Frameworks erkennen

Framework-Detection ausfuehren um zu sehen welche agentischen Tools im aktuellen Projekt vorhanden sind:

```bash
agent-almanac detect
```

Dies scannt das Arbeitsverzeichnis nach Konfigurationsdateien und Verzeichnissen (`.claude/`, `.cursor/`, `.github/copilot-instructions/`, `.agents/`, etc.) und berichtet welche Frameworks aktiv sind.

**Erwartet:** Ausgabe listet ein oder mehrere erkannte Frameworks mit ihrem Adapter-Status. Wenn keine Frameworks erkannt werden, wird der universelle Adapter (`.agents/skills/`) als Fallback genutzt.

**Bei Fehler:** Wenn die CLI nicht gefunden wird, sicherstellen dass sie installiert und im PATH ist. Wenn Detection nichts zurueckgibt und du weisst dass ein Framework praesent ist, `--framework <id>` nutzen um es explizit anzugeben. `agent-almanac list --domains` ausfuehren um zu verifizieren dass die CLI die Registries erreichen kann.

### Schritt 2: Nach Inhalt suchen

Skills, Agents oder Teams nach Stichwort finden:

```bash
agent-almanac search <keyword>
```

Nach Kategorie durchstoebern:

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**Erwartet:** Suchergebnisse oder gefilterte Listen zeigen passenden Inhalt mit IDs und Beschreibungen.

**Bei Fehler:** Wenn keine Ergebnisse erscheinen, breitere Stichworte versuchen. Verifizieren dass die Almanac-Wurzel erreichbar ist: `agent-almanac list` sollte die volle Skill-Anzahl zeigen. Wenn die Wurzel nicht gefunden wird, `--source /path/to/agent-almanac` uebergeben.

### Schritt 3: Inhalt installieren

Eines oder mehrere Items nach Namen installieren:

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

Die CLI loest den Inhalt aus den Registries auf, waehlt den angemessenen Adapter fuer jedes erkannte Framework und schreibt Dateien in die framework-spezifischen Pfade (z.B. `.claude/skills/` fuer Claude Code, `.cursor/rules/` fuer Cursor).

**Erwartet:** Ausgabe bestaetigt die Anzahl installierter Items und das/die Ziel-Framework(s). Installierter Inhalt erscheint im korrekten Framework-Verzeichnis.

**Bei Fehler:** Wenn Items nicht gefunden werden, verifizieren dass die ID dem `name`-Feld in der Registry entspricht (`skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`). Wenn Dateien bereits existieren und Installation uebersprungen wird, `--force` zum Ueberschreiben nutzen.

### Schritt 4: Installation verifizieren

Eine Gesundheitspruefung an allem installierten Inhalt durchfuehren:

```bash
agent-almanac audit
```

Ein spezifisches Framework oder Scope auditieren:

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

Sehen was aktuell installiert ist:

```bash
agent-almanac list --installed
```

**Erwartet:** Audit berichtet alle installierten Items als gesund ohne defekte Referenzen. Die `--installed`-Liste zeigt jedes Item mit Typ und Framework.

**Bei Fehler:** Wenn das Audit defekte Items berichtet, sie mit `--force` neu installieren. Wenn Symlinks defekt sind, verifizieren dass der Almanac-Quellpfad sich nicht bewegt hat. `agent-almanac install <broken-id> --force` zum Reparieren ausfuehren.

### Schritt 5: Mit einem Manifest verwalten (Optional)

Fuer reproduzierbare Setups ein deklaratives `agent-almanac.yml`-Manifest nutzen:

```bash
# Generate a starter manifest
agent-almanac init
```

Dies erstellt `agent-almanac.yml` im aktuellen Verzeichnis mit erkannten Frameworks und Platzhalter-Inhaltslisten. Die Datei bearbeiten um gewuenschte Skills, Agents und Teams zu deklarieren:

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

Dann alles im Manifest deklarierte installieren:

```bash
agent-almanac install
```

Den installierten Zustand mit dem Manifest abgleichen (Fehlendes installieren, Zusaetzliches entfernen):

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**Erwartet:** `install` ohne Argumente auszufuehren liest das Manifest und installiert allen deklarierten Inhalt. `sync` auszufuehren bringt den installierten Zustand in Einklang mit dem Manifest, fuegt fehlende Items hinzu und entfernt nicht-deklarierte.

**Bei Fehler:** Wenn `sync` "No agent-almanac.yml found" berichtet, zuerst `agent-almanac init` ausfuehren. Wenn das Manifest zu 0 Items aufloest, pruefen dass Skill-/Agent-/Team-IDs den Registry-Eintraegen exakt entsprechen. Kommentar-Zeilen mit `#` werden ignoriert.

### Schritt 6: Teams als Lagerfeuer verwalten (Optional)

Die Lagerfeuer-Befehle bieten eine warme, team-orientierte Alternative zu `install --team`:

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

Lagerfeuer-State wird in `.agent-almanac/state.json` verfolgt (git-ignoriert, lokal zum Projekt). Feuer haben thermale Zustaende: **brennend** (innerhalb 7 Tagen genutzt), **Glut** (innerhalb 30 Tagen), **kalt** (30+ Tage). `tend` auszufuehren waermt alle Feuer und berichtet ihre Gesundheit.

Geteilte Skills sind waehrend Scatter geschuetzt — wenn ein Skill von einem anderen versammelten Feuer benoetigt wird, bleibt er installiert. Geteilte Agents wandern zwischen Feuern statt dupliziert zu werden.

Alle Lagerfeuer-Befehle unterstuetzen `--quiet` (Standard-Reporter-Ausgabe) und `--json` (maschinen-parsebar) fuer Skripting.

**Erwartet:** Teams werden mit State-Tracking versammelt und verwaltet. `campfire --all` zeigt Feuerzustaende. `tend` berichtet Gesundheit.

**Bei Fehler:** Wenn Lagerfeuer-State korrupt ist, `.agent-almanac/state.json` loeschen und Teams erneut versammeln. Wenn `gather` scheitert, pruefen dass der Team-Name einem Eintrag in `teams/_registry.yml` entspricht.

## Validierung

- [ ] `agent-almanac detect` zeigt erwartete Frameworks
- [ ] `agent-almanac list --installed` zeigt allen beabsichtigten Inhalt
- [ ] `agent-almanac audit` berichtet keine defekten Items
- [ ] Installierte Skills loesen sich im Ziel-Framework auf (z.B. `/skill-name` funktioniert in Claude Code)
- [ ] Bei Manifest-Nutzung berichtet `agent-almanac sync --dry-run` keine noetigen Aenderungen

## Haeufige Stolperfallen

- **`--with-deps` fuer Agents und Teams vergessen**: Einen Agent ohne `--with-deps` zu installieren installiert nur die Agent-Definition, nicht seine referenzierten Skills. Der Agent wird praesent sein aber nicht in der Lage seinen Skill-Verfahren zu folgen. Immer `--with-deps` fuer Agents und Teams nutzen ausser Abhaengigkeiten wurden bereits separat installiert.
- **Manifest-Drift**: Nach manuellem Installieren oder Entfernen von Inhalt faellt das Manifest aus dem Sync mit dem tatsaechlich installierten Zustand. `agent-almanac sync` periodisch ausfuehren oder immer durch das Manifest installieren um sie ausgerichtet zu halten.
- **Scope-Verwirrung (Projekt vs. global)**: Inhalt installiert mit `--global` geht zu `~/.claude/skills/` (oder Aequivalent), waehrend Projekt-Scope-Inhalt zu `.claude/skills/` im aktuellen Verzeichnis geht. Wenn ein Skill nicht gefunden wird, pruefen ob er im falschen Scope installiert wurde.
- **Veralteter Quellpfad**: Wenn das agent-almanac-Repository bewegt oder umbenannt wird, wird der `--source`-Pfad in Manifests und Auto-Detection brechen. Das `source`-Feld in `agent-almanac.yml` aktualisieren oder `agent-almanac init` neu ausfuehren.
- **Framework nicht erkannt**: Der Detector schaut nach spezifischen Dateien und Verzeichnissen. Ein frisch initialisiertes Projekt hat diese moeglicherweise noch nicht. `--framework <id>` explizit nutzen bis das Projekt die erwartete Struktur hat oder auf den universellen Adapter verlassen.
- **Lagerfeuer-Thermal-State-Verwirrung**: Feuer werden nach 30 Tagen ohne Nutzung kalt. `agent-almanac tend` auszufuehren setzt den Timer fuer alle versammelten Feuer zurueck. Wenn ein Feuer als "kalt" angezeigt wird, ist es immer noch voll installiert — der thermale Zustand reflektiert Aktualitaet der Nutzung, nicht Installations-Gesundheit.

## Verwandte Skills

- `create-skill` -- neue Skills entwerfen die zum Almanac hinzugefuegt werden bevor sie installiert werden
- `configure-mcp-server` -- MCP-Server einrichten die Agents nach Installation brauchen koennen
- `write-claude-md` -- CLAUDE.md konfigurieren um installierte Skills zu referenzieren
- `audit-discovery-symlinks` -- Symlink-Probleme fuer Claude-Code-Skill-Discovery diagnostizieren
- `design-cli-output` -- Terminal-Ausgabe-Muster die vom CLI-Reporter und der Lagerfeuer-Zeremonie genutzt werden
