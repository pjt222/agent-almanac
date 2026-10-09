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
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
  locale: de
  source_locale: en
  source_commit: aa73494d
  fence_basis_commit: aa73494d
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
|---|---|---|
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

Nach dem Zusammenfuehren von Pull Requests veraltete Branches entfernen. Zuerst bestaetigen, dass die Arbeit jedes Branches in `main` angekommen ist, denn `git branch -d` beantwortet diese Frage nicht (siehe Bei Fehler unten). Zwei Bedingungen muessen beide erfuellt sein. Die Forge (der Hosting-Dienst) muss den PR als in `main` zusammengefuehrt melden: `gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` zeigt `MERGED` und `main`. Und der lokale Branch darf nichts enthalten, was der PR nicht enthielt: `git merge-base --is-ancestor <branch> <headRefOid>` endet mit Exit-Code 0. `headRefOid` ist der PR-Head, den die Forge zusammengefuehrt hat, daher funktioniert dieser eine Test gleichermassen fuer einen Merge-Commit, einen Squash-Merge und einen Rebase-Merge. Der PR-Status allein genuegt nicht, weil er keinen lokalen Commit sehen kann, den der PR nie hatte.

Exit-Code 1 bedeutet, dass der Branch einen solchen Commit traegt (einen nach dem letzten Push erstellten oder einen, den der Remote-Branch durch einen Force-Push verloren hat): den Branch behalten. Exit-Code 128 bedeutet, dass der PR-Head lokal nicht vorhanden ist, zum Beispiel weil jemand anderes noch vor dem Loeschen des Branches in den PR gepusht hat: ihn mit `git fetch origin refs/pull/<n>/head` holen (GitHub bewahrt diese Referenz auch nach dem Loeschen des Branches auf) und den Test erneut ausfuehren. Bei einem Merge-Commit beantwortet die Abstammungspruefung gegen den Merge-Commit (`mergeCommit.oid` in derselben `gh`-Ausgabe, nach `git fetch origin main`) dieselbe Frage. Ein Squash-Merge und ein Rebase-Merge, der die Commits umgeschrieben hat, bestehen diesen Merge-Commit-Test konstruktionsbedingt nicht, weil ihre Commits neu sind und die Commits des Branches nicht enthalten; den `headRefOid`-Test bestehen sie dennoch. Nur `MERGED` zusammen mit Exit-Code 0 erlaubt ein Loeschen. Der Codeblock unten listet die Loeschformen zum Nachschlagen auf. Nach bestandener Pruefung ist `git branch -D` sicher; lehnt die `-d`-Zeile des Codeblocks ab, ist das der Fall unter Bei Fehler.

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

**Bei Fehler:** `git branch -d` ist keine Merge-Pruefung (#865, #900). Laut `git help branch` muss der Branch vollstaendig in seinen Upstream zusammengefuehrt sein, oder in HEAD, wenn kein Upstream gesetzt ist; gemessen (git 2.43) zaehlt ein als `gone` angezeigter Upstream als keiner, also wird HEAD geprueft. Ein mit `-u` (Schritt 2) und vollstaendig gepushter Branch besteht die Pruefung daher, ob er jemals in `main` angekommen ist oder nicht: `-d` loescht ihn, endet mit Exit-Code 0 und gibt nur eine Warnung auf stderr aus (`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`). Wird der Codeblock oben der Reihe nach ausgefuehrt, loescht er danach auch den Remote-Branch, und keine Referenz enthaelt die Arbeit mehr. Ein Branch ohne Upstream wird gegen den HEAD des Worktrees geprueft, in dem der Befehl laeuft; ist HEAD also ein gestapelter Branch (Stacked Branch), der ihn enthaelt, loescht `-d` ihn ganz ohne Ausgabe auf stderr. In der Gegenrichtung lehnt `-d` einen Branch ab, der sehr wohl zusammengefuehrt *wurde*, sobald der geprueften Referenz die Branch-Spitze fehlt: HEAD (zum Beispiel ein noch nicht aktualisiertes lokales `main`), sobald der Upstream nach dem Loeschen des Remote-Branches weg ist, oder ein Upstream, der hinter der Spitze zurueckliegt, weil die Spitze aus einem anderen Klon gepusht und noch nicht gefetcht wurde. Eine Spitze, die ihrem Upstream voraus ist, weil ein Commit nie gepusht wurde, ist nicht dieser Fall: Dieser Commit steckt in keinem PR, und die Ablehnung ist korrekt. Ein per Squash-Merge zusammengefuehrter Branch wird nur abgelehnt, wenn der geprueften Referenz die Spitze fehlt, zum Beispiel HEAD, sobald der Upstream weg ist; solange sein eigener gepushter Upstream noch existiert, loescht `-d` ihn. Die Antwort ist in beiden Faellen dieselbe: die Pruefung vom Anfang dieses Schritts ausfuehren und nur dann mit `git branch -D` loeschen, wenn sie besteht.

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
- **Unzusammen gefuehrte Arbeit loeschen**: Keines der beiden Loesch-Flags ist fuer sich allein sicher. `git branch -D` loescht unabhaengig vom Merge-Status, und `git branch -d` loescht einen nicht zusammengefuehrten Branch, der vollstaendig in seinen eigenen Upstream gepusht ist, oder, ohne Upstream, einen, den der aktuelle HEAD enthaelt, auch wenn `main` ihn nicht enthaelt (ohne Warnung). Vor beidem die Pruefung vom Anfang von Schritt 5 ausfuehren: Der PR ist `MERGED` in `main`, und `git merge-base --is-ancestor <branch> <headRefOid>` endet mit Exit-Code 0.
- **Nicht bereinigen**: Auf GitHub geloeschte Remote-Branches erscheinen lokal weiterhin, bis `git fetch --prune` ausgefuehrt wird.

## Verwandte Skills

- `commit-changes` - Arbeit auf Branches committen
- `create-pull-request` - PRs aus Feature-Branches eroeffnen
- `resolve-git-conflicts` - Konflikte waehrend der Synchronisation behandeln
- `configure-git-repository` - Repository-Einrichtung und Branch-Strategie
