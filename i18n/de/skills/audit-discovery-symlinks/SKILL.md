---
name: audit-discovery-symlinks
description: >
  Audit and repair Claude Code discovery symlinks for skills, agents, and teams.
  Compares registries against .claude/ directories at project and global levels,
  detects missing, broken, and extraneous symlinks, distinguishes almanac content
  from external projects, and optionally repairs gaps. Use after adding new skills
  or agents, after a repository rename or move, when slash commands stop working,
  or as a periodic health check.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: shell
  tags: maintenance, symlinks, discovery, claude-code, audit
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# audit-discovery-symlinks

## Wann verwenden

- Nach Hinzufuegen neuer Skills, Agents oder Teams zum Almanac
- Nach einem Repository-Rename oder Move der absolute Symlinks gebrochen haben koennte
- Wenn Slash-Commands oder Agents in Claude Code nicht gefunden werden
- Als periodische Gesundheitspruefung um Drift zwischen Registries und Discovery-Pfaden zu erfassen
- Beim Onboarding eines neuen Projekts das geteilten Almanac-Inhalt entdecken soll

**NICHT verwenden** zum Erstellen des initialen Symlink-Hubs von Grund auf. Siehe [symlink-architecture-Guide](../../guides/symlink-architecture.md) fuer Erstaufstellung.

## Eingaben

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `almanac_path` | string | No | Absoluter Pfad zur agent-almanac-Wurzel. Auto-erkannt aus `.claude/`-Symlink-Zielen oder cwd wenn weggelassen |
| `scope` | enum | No | `project`, `global` oder `both` (Standard: `both`) |
| `fix_mode` | enum | No | `report` (Standard: nur Audit), `auto` (alle sicheren Probleme beheben), `interactive` (vor jedem Fix nachfragen) |

## Vorgehensweise

### Schritt 1: Almanac-Pfad identifizieren

Das agent-almanac-Wurzelverzeichnis lokalisieren.

```bash
# Auto-detect from current project's .claude/agents symlink
ALMANAC_PATH=$(readlink -f .claude/agents 2>/dev/null | sed 's|/agents$||')

# Fallback: check if cwd is the almanac
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  if [ -f "skills/_registry.yml" ]; then
    ALMANAC_PATH=$(pwd)
  fi
fi

# Fallback: check global agents symlink
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  ALMANAC_PATH=$(readlink -f ~/.claude/agents 2>/dev/null | sed 's|/agents$||')
fi

echo "Almanac path: $ALMANAC_PATH"
```

**Erwartet:** `ALMANAC_PATH` zeigt auf ein Verzeichnis das `skills/_registry.yml`, `agents/_registry.yml` und `teams/_registry.yml` enthaelt.

**Bei Fehler:** Wenn Auto-Detection scheitert, den Benutzer nach der `almanac_path`-Eingabe fragen. Die Almanac-Wurzel ist das Verzeichnis das `skills/`, `agents/`, `teams/` und ihre Registries enthaelt.

### Schritt 2: Registries inventarisieren

Die kanonischen Listen von Skills, Agents und Teams aus ihren Registries extrahieren.

```bash
# Count registered skills (entries with "- id:" under domain sections)
REGISTERED_SKILLS=$(grep '^ \{6\}- id:' "$ALMANAC_PATH/skills/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_SKILL_COUNT=$(echo "$REGISTERED_SKILLS" | wc -l)

# Count registered agents
REGISTERED_AGENTS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/agents/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_AGENT_COUNT=$(echo "$REGISTERED_AGENTS" | wc -l)

# Count registered teams
REGISTERED_TEAMS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/teams/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_TEAM_COUNT=$(echo "$REGISTERED_TEAMS" | wc -l)

echo "Registered: $REGISTERED_SKILL_COUNT skills, $REGISTERED_AGENT_COUNT agents, $REGISTERED_TEAM_COUNT teams"
```

**Erwartet:** Anzahlen entsprechen den `total_skills`, `total_agents`, `total_teams`-Werten in jedem Registry-Header.

**Bei Fehler:** Wenn Anzahlen von den Header-Totalen abweichen, ist das Registry selbst ausser Sync. Die Diskrepanz im Bericht vermerken aber mit den tatsaechlichen `- id:`-Eintraegen als Wahrheitsquelle fortfahren.

### Schritt 3: Projekt-Symlinks auditieren

`.claude/skills/*`, `.claude/agents`, `.claude/teams` im aktuellen Projektverzeichnis pruefen.

```bash
PROJECT_CLAUDE=".claude"

# --- Skills ---
# Items on disk (excluding _template)
PROJECT_SKILLS=$(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | sort)
PROJECT_SKILL_COUNT=$(echo "$PROJECT_SKILLS" | grep -c .)

# Missing: in registry but not in project .claude/skills/
MISSING_PROJECT_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_PROJECT_SKILLS=$(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Extraneous: in project but not in registry (and not external)
EXTRA_PROJECT_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# --- Agents ---
if [ -L "$PROJECT_CLAUDE/agents" ] || [ -d "$PROJECT_CLAUDE/agents" ]; then
  PROJECT_AGENT_STATUS="OK"
  test -d "$PROJECT_CLAUDE/agents" || PROJECT_AGENT_STATUS="BROKEN"
  PROJECT_AGENT_COUNT=$(ls "$PROJECT_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  PROJECT_AGENT_STATUS="MISSING"
  PROJECT_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A .claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$PROJECT_CLAUDE/teams" ]; then
  PROJECT_TEAM_STATUS="MISCONFIGURED"
  PROJECT_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  PROJECT_TEAM_STATUS="OK"
  PROJECT_TEAM_COUNT=0
fi
```

**Erwartet:** Null fehlend, null defekt. Ueberzaehlige Eintraege werden klassifiziert und erklaert.

**Bei Fehler:** Wenn `.claude/` ueberhaupt nicht existiert, hat das Projekt kein Discovery-Setup. Dies vermerken und zum globalen Audit ueberspringen.

### Schritt 4: Globale Symlinks auditieren

`~/.claude/skills/*` und `~/.claude/agents` pruefen. Auch pruefen dass `~/.claude/teams` KEIN Symlink ist (es sollte abwesend sein oder ein Verzeichnis fuer TeamCreate-Runtime-State).

```bash
GLOBAL_CLAUDE="$HOME/.claude"

# --- Skills ---
GLOBAL_SKILLS_ALL=$(ls "$GLOBAL_CLAUDE/skills/" 2>/dev/null | sort)

# Classify each entry: almanac vs external
ALMANAC_GLOBAL_SKILLS=""
EXTERNAL_GLOBAL_SKILLS=""
for item in $GLOBAL_SKILLS_ALL; do
  target=$(readlink -f "$GLOBAL_CLAUDE/skills/$item" 2>/dev/null)
  if [ -z "$target" ]; then
    # Real directory (not a symlink) — external
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  elif echo "$target" | grep -q "^$ALMANAC_PATH"; then
    ALMANAC_GLOBAL_SKILLS="$ALMANAC_GLOBAL_SKILLS $item"
  else
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  fi
done

# Filter: _template is always extraneous for almanac content
ALMANAC_GLOBAL_SKILLS=$(echo "$ALMANAC_GLOBAL_SKILLS" | tr ' ' '\n' | grep -v '^_template$' | grep -v '^$' | sort)

# Missing: in registry but not in global almanac skills
MISSING_GLOBAL_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_GLOBAL_SKILLS=$(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Stale almanac entries: in global almanac set but not in registry
STALE_GLOBAL_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# --- Agents ---
if [ -L "$GLOBAL_CLAUDE/agents" ] || [ -d "$GLOBAL_CLAUDE/agents" ]; then
  GLOBAL_AGENT_STATUS="OK"
  test -d "$GLOBAL_CLAUDE/agents" || GLOBAL_AGENT_STATUS="BROKEN"
  GLOBAL_AGENT_COUNT=$(ls "$GLOBAL_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  GLOBAL_AGENT_STATUS="MISSING"
  GLOBAL_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A ~/.claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$GLOBAL_CLAUDE/teams" ]; then
  GLOBAL_TEAM_STATUS="MISCONFIGURED"
  GLOBAL_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  GLOBAL_TEAM_STATUS="OK"
  GLOBAL_TEAM_COUNT=0
fi
```

**Erwartet:** Null fehlende Almanac-Skills, null defekt. Externer Inhalt (peon-ping, etc.) wird gelistet aber nicht als Fehler markiert.

**Bei Fehler:** Wenn `~/.claude/` nicht existiert, ist der globale Hub nicht eingerichtet. Auf [symlink-architecture-Guide](../../guides/symlink-architecture.md) fuer initiales Setup verweisen.

### Schritt 5: Audit-Bericht erzeugen

Eine Zusammenfassungstabelle erzeugen die beide Schichten abdeckt.

```markdown
# Discovery Symlink Audit Report

**Date**: YYYY-MM-DD
**Almanac**: <almanac_path>
**Scope**: both | project | global

## Summary

| Content | Registered | Project | Global (almanac) | Global (external) |
|---------|------------|---------|-------------------|-------------------|
| Skills  | N          | N       | N                 | N                 |
| Agents  | N          | STATUS  | STATUS            | —                 |
| Teams   | N          | STATUS  | STATUS            | —                 |

## Issues

### Missing (registered but no symlink)
- Project skills: [list or "none"]
- Global skills: [list or "none"]

### Broken (symlink exists, target gone)
- Project: [list or "none"]
- Global: [list or "none"]

### Extraneous
- Stale almanac (in discovery but not registry): [list or "none"]
- _template in discovery path: [yes/no]
- External content (non-almanac): [list — informational only]
```

**Erwartet:** Ein klarer, umsetzbarer Bericht. Null Probleme bedeutet ein sauberer Gesundheitsbescheid.

**Bei Fehler:** Wenn die Berichtserzeugung selbst scheitert, rohe Anzahlen und Listen als Fallback an die Konsole ausgeben.

### Schritt 6: Reparieren (Optional)

Wenn `fix_mode` `auto` oder `interactive` ist, die gefundenen Probleme beheben.

**6a. Fehlende Projekt-Symlinks erstellen:**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. Fehlende globale Symlinks erstellen:**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. Defekte Symlinks entfernen:**
```bash
# Project
for broken in $BROKEN_PROJECT_SKILLS; do
  rm "$PROJECT_CLAUDE/skills/$broken"
done

# Global
for broken in $BROKEN_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$broken"
done
```

**6d. Veraltete Almanac-Eintraege entfernen:**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. Fehlende Verzeichnis-Symlinks beheben (agents/teams):**
```bash
# Project agents
if [ "$PROJECT_AGENT_STATUS" = "MISSING" ]; then
  ln -s ../agents "$PROJECT_CLAUDE/agents"
fi

# Project teams
if [ "$PROJECT_TEAM_STATUS" = "MISSING" ]; then
  ln -s ../teams "$PROJECT_CLAUDE/teams"
fi

# Global agents
if [ "$GLOBAL_AGENT_STATUS" = "MISSING" ]; then
  ln -s "$ALMANAC_PATH/agents" "$GLOBAL_CLAUDE/agents"
fi

# Global teams
if [ "$GLOBAL_TEAM_STATUS" = "MISSING" ]; then
  ln -sf "$ALMANAC_PATH/teams" "$GLOBAL_CLAUDE/teams"
fi
```

**Wichtig:** Niemals als extern klassifizierte Eintraege entfernen. Diese gehoeren zu anderen Projekten (z.B. peon-ping) und muessen erhalten bleiben.

**Erwartet:** Alle fehlenden Symlinks erstellt, alle defekten Symlinks entfernt, alle veralteten Almanac-Eintraege bereinigt. Externer Inhalt unangetastet.

**Bei Fehler:** Wenn `ln -s` aufgrund einer existierenden Datei/eines Verzeichnisses am Ziel-Pfad scheitert (z.B. leeres Verzeichnis statt Symlink), den Blocker zuerst mit `rmdir` (fuer leere Verzeichnisse) entfernen oder fuer manuelle Pruefung markieren (fuer nicht-leere Verzeichnisse).

### Schritt 7: Verifizieren

Die Audit-Pruefungen aus Schritten 3-4 erneut ausfuehren um Reparaturen zu bestaetigen.

```bash
echo "=== Post-repair verification ==="
echo "Project skills: $(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | wc -l)"
echo "Global skills (almanac): $(echo "$ALMANAC_GLOBAL_SKILLS" | wc -w)"
echo "Broken project: $(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Broken global:  $(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Project agents: $PROJECT_AGENT_STATUS ($PROJECT_AGENT_COUNT .md files)"
echo "Global agents:  $GLOBAL_AGENT_STATUS ($GLOBAL_AGENT_COUNT .md files)"
echo "Project teams:  $PROJECT_TEAM_STATUS ($PROJECT_TEAM_COUNT .md files)"
echo "Global teams:   $GLOBAL_TEAM_STATUS ($GLOBAL_TEAM_COUNT .md files)"
```

**Erwartet:** Null fehlend, null defekt. Anzahlen entsprechen registrierten Totalen (fuer Almanac-Inhalt). Externer Inhalt separat gelistet.

**Bei Fehler:** Wenn nach Reparatur Probleme bestehen bleiben, die spezifischen Fehler berichten. Haeufige Ursachen: Berechtigungsfehler auf `~/.claude/`, NTFS-Pfadlaengen-Limits auf `/mnt/`-Pfaden oder ein nicht-leeres Verzeichnis das Symlink-Erstellung blockiert.

## Validierung

- [ ] Almanac-Pfad korrekt identifiziert und enthaelt alle drei Registries
- [ ] Registry-Anzahlen entsprechen `total_*`-Header-Werten (oder Diskrepanz vermerkt)
- [ ] Projekt-Skills, -Agents und -Teams auditiert
- [ ] Globale Skills, Agents und Teams auditiert
- [ ] Externer Inhalt (Nicht-Almanac) identifiziert und aus Problemzaehlern ausgeschlossen
- [ ] `_template`-Eintraege als ueberzaehlig markiert (gehoert nie in Discovery-Pfade)
- [ ] Audit-Bericht mit klaren Anzahlen und umsetzbaren Listen erzeugt
- [ ] Wenn `fix_mode` `auto` ist: alle sicheren Reparaturen angewendet, externer Inhalt unangetastet
- [ ] Post-Reparatur-Verifikation bestaetigt null fehlend, null defekt

## Haeufige Stolperfallen

1. **Externen Inhalt mit fehlendem Almanac-Inhalt verwechseln**: `~/.claude/skills/` kann Skills aus anderen Projekten enthalten (z.B. peon-ping). Immer pruefen ob ein Symlink-Ziel unter dem Almanac-Pfad liegt bevor es als veraltet oder ueberzaehlig klassifiziert wird.

2. **Externen Inhalt entfernen**: Niemals Eintraege loeschen die nicht auf den Almanac zielen. Sie gehoeren zu anderen Projekten und sind beabsichtigt.

3. **`_template`-Verzeichnisse symlinken**: Templates sind Geruest, kein konsumierbarer Inhalt. Das `_template`-Verzeichnis sollte nie in `.claude/skills/` oder `.claude/agents/` erscheinen. Bulk-Sync-Skripte muessen es explizit ueberspringen.

4. **Veralteter `.claude/teams`-Symlink**: Ein `.claude/teams`-Symlink der auf Team-Definitionen zeigt ist eine Fehlkonfiguration. Claude Codes `TeamCreate` nutzt `~/.claude/teams/` fuer Runtime-State (config.json, Inboxes). Wenn dieser Pfad ein Symlink zum Almanac-`teams/`-Verzeichnis ist, werden Runtime-Artefakte ins git-getrackte Repository geschrieben. Jeden auf Projekt- oder globaler Ebene gefundenen `.claude/teams`-Symlink entfernen.

5. **Relative vs. absolute Pfade**: Projekt-Skill-Symlinks nutzen relative Pfade (`../../skills/<name>`). Globale Symlinks nutzen absolute Pfade (`/path/to/almanac/skills/<name>`). Vermischung dieser Muster verursacht Brueche bei Moves.

6. **Registry-Header vs. tatsaechliche Anzahl**: Das `total_skills`-Feld im Registry-Header kann veraltet sein wenn jemand Eintraege ohne Aktualisierung der Anzahl hinzugefuegt hat. Den tatsaechlichen `- id:`-Eintraegen vertrauen, nicht dem Header.

## Verwandte Skills

- [repair-broken-references](../repair-broken-references/SKILL.md) -- generelle Reparatur defekter Links und Referenzen
- [tidy-project-structure](../tidy-project-structure/SKILL.md) -- Projektverzeichnis-Organisation
- [create-skill](../create-skill/SKILL.md) -- enthaelt Symlink-Erstellung fuer neue Skills (Schritt 13)
- [create-agent](../create-agent/SKILL.md) -- enthaelt Discovery-Verifikation (Schritt 10)
- [create-team](../create-team/SKILL.md) -- Team-Erstellung mit Registry-Integration
