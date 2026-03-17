---
name: manage-git-branches
description: >
  Git-Branches erstellen, verfolgen, wechseln, synchronisieren und
  bereinigen. Umfasst Namenskonventionen, sicheres Branch-Wechseln mit
  Stash, Upstream-Synchronisation und das Loeschen zusammengefuehrter
  Branches. Verwenden beim Starten von Arbeit an einem neuen Feature
  oder Bugfix, beim Wechseln zwischen Aufgaben auf verschiedenen
  Branches, beim Aktuell-Halten eines Feature-Branches gegenueber main
  oder beim Bereinigen von Branches nach dem Zusammenfuehren von
  Pull Requests.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Git-Branches verwalten

Branches nach einheitlichen Namenskonventionen erstellen, wechseln, synchronisieren und bereinigen.

## Wann verwenden

- Arbeit an einem neuen Feature oder Bugfix beginnen
- Zwischen Aufgaben auf verschiedenen Branches wechseln
- Einen Feature-Branch gegenueber main aktuell halten
- Branches nach dem Zusammenfuehren von Pull Requests bereinigen
- Branches auflisten und inspizieren

## Eingaben

- **Erforderlich**: Repository mit mindestens einem Commit
- **Optional**: Branch-Namenskonvention (Standard: `type/description`)
- **Optional**: Basis-Branch fuer neue Branches (Standard: `main`)
- **Optional**: Remote-Name (Standard: `origin`)

## Vorgehensweise

### Schritt 1: Feature-Branch erstellen

Eine einheitliche Namenskonvention verwenden:

| Praefix | Zweck | Beispiel |
|---------|-------|---------|
| `feature/` | Neue Funktionalitaet | `feature/add-weighted-mean` |
| `fix/` | Fehlerbehebung | `fix/null-pointer-in-parser` |
| `docs/` | Dokumentation | `docs/update-api-reference` |
| `refactor/` | Code-Umstrukturierung | `refactor/extract-validation` |
| `chore/` | Wartung | `chore/update-dependencies` |
| `test/` | Test-Ergaenzungen | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**Erwartet:** Neuer Branch erstellt und ausgecheckt. `git branch` zeigt den neuen Branch mit einem Sternchen.

**Bei Fehler:** Wenn der Basis-Branch lokal nicht existiert, zuerst fetchen: `git fetch origin main && git checkout -b feature/name origin/main`.

### Schritt 2: Remote-Branches verfolgen

Beim erstmaligen Pushen eines neuen Branches Tracking einrichten:

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

Einen von jemand anderem erstellten Remote-Branch auschecken:

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**Erwartet:** Lokaler Branch verfolgt den entsprechenden Remote-Branch. `git branch -vv` zeigt den Upstream.

**Bei Fehler:** Wenn das automatische Tracking fehlschlaegt, manuell setzen: `git branch --set-upstream-to=origin/feature/name feature/name`.

### Schritt 3: Sicher zwischen Branches wechseln

Vor dem Wechsel sicherstellen, dass der Arbeitsbaum sauber ist:

```bash
# Check for uncommitted changes
git status
```

**Bei vorhandenen Aenderungen** entweder committen oder stashen:

```bash
# Option 1: Commit work in progress
git add <files>
git commit -m "wip: save progress on validation logic"

# Option 2: Stash changes temporarily
git stash push -m "validation work in progress"

# Switch branches
git checkout main

# Later, restore stashed changes
git checkout feature/add-weighted-mean
git stash pop
```

Stashes auflisten und verwalten:

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**Erwartet:** Branch-Wechsel erfolgreich. Arbeitsbaum spiegelt den Zustand des Ziel-Branches wider. Gestashte Aenderungen sind wiederherstellbar.

**Bei Fehler:** Wenn der Wechsel durch uncommittierte Aenderungen blockiert wird, die ueberschrieben wuerden, zuerst stashen oder committen. `git stash` kann ungetrackte Dateien nur mit `git stash push -u` stashen.

### Schritt 4: Mit Upstream synchronisieren

Den Feature-Branch gegenueber dem Basis-Branch aktuell halten:

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**Erwartet:** Branch enthaelt nun die neuesten Aenderungen aus main. Keine Konflikte, oder Konflikte geloest (siehe `resolve-git-conflicts`).

**Bei Fehler:** Wenn Rebase Konflikte verursacht, jeden einzeln loesen und `git rebase --continue`. Sind die Konflikte zu komplex, mit `git rebase --abort` abbrechen und stattdessen `git merge origin/main` versuchen.

### Schritt 5: Zusammengefuehrte Branches bereinigen

Nach dem Zusammenfuehren von Pull Requests veraltete Branches entfernen:

```bash
# Delete a local branch that has been merged
git branch -d feature/add-weighted-mean

# Delete a local branch (force, even if not merged)
git branch -D feature/abandoned-experiment

# Delete a remote branch
git push origin --delete feature/add-weighted-mean

# Prune remote-tracking references for deleted remote branches
git fetch --prune
```

**Erwartet:** Zusammengefuehrte Branches sind lokal und remote entfernt. `git branch` zeigt nur aktive Branches.

**Bei Fehler:** `git branch -d` lehnt das Loeschen nicht zusammengefuehrter Branches ab. Wenn der Branch auf GitHub per Squash Merge zusammengefuehrt wurde, erkennt Git ihn moeglicherweise nicht als zusammengefuehrt. `git branch -D` verwenden, wenn sicher ist, dass die Arbeit erhalten ist.

### Schritt 6: Branches auflisten und inspizieren

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List branches with last commit info
git branch -v

# List branches merged into main
git branch --merged main

# List branches NOT yet merged
git branch --no-merged main

# See which remote branch each local branch tracks
git branch -vv
```

**Erwartet:** Klare Uebersicht ueber alle Branches, ihren Status und die Tracking-Beziehungen.

**Bei Fehler:** Wenn Remote-Branches veraltet erscheinen, `git fetch --prune` ausfuehren, um Referenzen auf geloeschte Remote-Branches zu bereinigen.

## Validierung

- [ ] Branch-Namen folgen der vereinbarten Namenskonvention
- [ ] Feature-Branches werden vom richtigen Basis-Branch erstellt
- [ ] Lokale Branches verfolgen ihre Remote-Entsprechungen
- [ ] Zusammengefuehrte Branches sind bereinigt (lokal und remote)
- [ ] Arbeitsbaum ist vor Branch-Wechseln sauber
- [ ] Gestashte Aenderungen bleiben nicht verwaist

## Haeufige Stolperfallen

- **Direkt auf main arbeiten**: Immer einen Feature-Branch erstellen. Direkt auf main zu committen erschwert die Erstellung von PRs und die Zusammenarbeit.
- **Vergessen vor dem Branchen zu fetchen**: Einen Branch von einem veralteten lokalen main zu erstellen bedeutet, rueckstaendig zu beginnen. Immer zuerst `git fetch origin` ausfuehren.
- **Langlebige Branches**: Feature-Branches, die wochenlang bestehen, haeufen Merge-Konflikte an. Haeufig synchronisieren und Branches kurzlebig halten.
- **Verwaiste Stashes**: `git stash` ist temporaerer Speicher. Nicht fuer langfristige Arbeit darauf verlaessen. Stattdessen committen oder branchen.
- **Unzusammen gefuehrte Arbeit loeschen**: `git branch -D` ist destruktiv. Vor dem Zwangsloeschen mit `git log branch-name` pruefen.
- **Nicht bereinigen**: Auf GitHub geloeschte Remote-Branches erscheinen lokal weiterhin, bis `git fetch --prune` ausgefuehrt wird.

## Verwandte Skills

- `commit-changes` - Arbeit auf Branches committen
- `create-pull-request` - PRs aus Feature-Branches eroeffnen
- `resolve-git-conflicts` - Konflikte waehrend der Synchronisation behandeln
- `configure-git-repository` - Repository-Einrichtung und Branch-Strategie
