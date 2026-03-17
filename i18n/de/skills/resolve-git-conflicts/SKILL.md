---
name: resolve-git-conflicts
description: >
  Merge- und Rebase-Konflikte mit sicheren Wiederherstellungsstrategien
  loesen. Umfasst das Identifizieren von Konfliktquellen, das Lesen von
  Konfliktmarkierungen, die Auswahl von Loesungsstrategien sowie das
  sichere Fortsetzen oder Abbrechen von Operationen. Verwenden wenn ein
  git merge, rebase, cherry-pick oder stash pop Konflikte meldet, ein
  git pull zu widersprueichlichen Aenderungen fuehrt oder eine
  fehlgeschlagene Merge- oder Rebase-Operation sicher abgebrochen und
  neu gestartet werden soll.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Git-Konflikte loesen

Merge- und Rebase-Konflikte identifizieren, loesen und beheben.

## Wann verwenden

- Ein `git merge` oder `git rebase` meldet Konflikte
- Ein `git cherry-pick` kann nicht sauber angewendet werden
- Ein `git pull` fuehrt zu widersprueichlichen Aenderungen
- Ein `git stash pop` konfligiert mit dem aktuellen Arbeitsbaum

## Eingaben

- **Erforderlich**: Repository mit aktiven Konflikten
- **Optional**: Bevorzugte Loesungsstrategie (ours, theirs, manuell)
- **Optional**: Kontext darueber, welche Aenderungen Vorrang haben sollen

## Vorgehensweise

### Schritt 1: Konfliktquelle identifizieren

Bestimmen, welche Operation den Konflikt verursacht hat:

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

Die Statusausgabe zeigt, welche Dateien Konflikte haben und welche Operation gerade laeuft.

**Erwartet:** `git status` zeigt Dateien unter "Unmerged paths" und weist auf die aktive Operation hin.

**Bei Fehler:** Wenn `git status` einen sauberen Baum zeigt, aber Konflikte erwartet wurden, wurde die Operation moeglicherweise bereits abgeschlossen oder abgebrochen. `git log` auf letzte Aktivitaeten pruefen.

### Schritt 2: Konfliktmarkierungen lesen

Jede konfliktbehaftete Datei oeffnen und die Konfliktmarkierungen lokalisieren:

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` bis `=======`: Die Version des aktuellen Branches (oder des Branches, auf den rebased wird)
- `=======` bis `>>>>>>>`: Die eingehenden Aenderungen (der zusammenzufuehrende Branch oder der anzuwendende Commit)

**Erwartet:** Jede konfliktbehaftete Datei enthaelt einen oder mehrere Bloecke mit `<<<<<<<`, `=======` und `>>>>>>>` Markierungen.

**Bei Fehler:** Wenn keine Markierungen gefunden werden, Dateien aber als konfliktbehaftet erscheinen, koennte es sich um eine Binaerdatei oder einen "geloescht vs. geaendert"-Konflikt handeln. `git diff --name-only --diff-filter=U` fuer die vollstaendige Liste pruefen.

### Schritt 3: Loesungsstrategie waehlen

**Manuelles Zusammenfuehren** (am haeufigsten): Die Datei bearbeiten, um beide Aenderungen logisch zu kombinieren, dann alle Konfliktmarkierungen entfernen.

**Eigene Version akzeptieren** (Version des aktuellen Branches behalten):

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**Fremde Version akzeptieren** (Version des eingehenden Branches behalten):

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**Erwartet:** Nach der Loesung enthaelt die Datei den korrekten zusammengefuehrten Inhalt ohne verbleibende Konfliktmarkierungen.

**Bei Fehler:** Wenn die falsche Seite gewaehlt wurde, die konfliktbehaftete Version aus der Merge-Basis erneut lesen. Waehrend eines Merges stellt `git checkout -m path/to/file` die Konfliktmarkierungen wieder her, damit ein neuer Versuch moeglich ist.

### Schritt 4: Dateien als geloest markieren

Nach dem Bearbeiten jeder konfliktbehafteten Datei:

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

Fuer jede Datei unter "Unmerged paths" wiederholen.

**Erwartet:** Alle Dateien wechseln von "Unmerged paths" zu "Changes to be committed". In keiner Datei verbleiben Konfliktmarkierungen.

**Bei Fehler:** Wenn `git add` fehlschlaegt oder Markierungen verbleiben, die Datei erneut oeffnen und sicherstellen, dass alle Zeilen mit `<<<<<<<`, `=======` und `>>>>>>>` entfernt sind.

### Schritt 5: Operation fortsetzen

Sobald alle Konflikte geloest sind:

**Fuer Merge**:

```bash
git commit
# Git auto-populates the merge commit message
```

**Fuer Rebase**:

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**Fuer Cherry-Pick**:

```bash
git cherry-pick --continue
```

**Fuer Stash Pop**:

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

**Erwartet:** Die Operation wird abgeschlossen. `git status` zeigt einen sauberen Arbeitsbaum (oder wechselt waehrend des Rebase zum naechsten Commit).

**Bei Fehler:** Wenn der Fortsetzungsbefehl fehlschlaegt, `git status` auf verbleibende ungeloeste Dateien pruefen. Alle Konflikte muessen geloest sein, bevor fortgefahren werden kann.

### Schritt 6: Bei Bedarf abbrechen

Wenn die Loesung zu komplex ist oder der falsche Ansatz gewaehlt wurde, sicher abbrechen:

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**Erwartet:** Das Repository kehrt in den Zustand vor dem Start der Operation zurueck. Kein Datenverlust.

**Bei Fehler:** Wenn der Abbruch fehlschlaegt (selten), `git reflog` nach dem Commit vor der Operation durchsuchen und mit `git reset --hard <commit>` wiederherstellen. Mit Vorsicht verwenden — dies verwirft uncommittierte Aenderungen.

### Schritt 7: Loesung verifizieren

Nachdem die Operation abgeschlossen ist:

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**Erwartet:** Sauberer Arbeitsbaum, korrekte Merge-Historie, Tests bestehen.

**Bei Fehler:** Wenn Tests nach der Loesung fehlschlagen, hat der Merge moeglicherweise logische Fehler eingefuehrt, auch wenn Syntaxkonflikte geloest sind. Den Diff sorgfaeltig pruefen und beheben.

## Validierung

- [ ] Keine Konfliktmarkierungen (`<<<<<<<`, `=======`, `>>>>>>>`) in irgendeiner Datei verbleibend
- [ ] `git status` zeigt einen sauberen Arbeitsbaum
- [ ] Die Merge-/Rebase-Historie ist in `git log` korrekt
- [ ] Tests bestehen nach der Konfliktloesung
- [ ] Keine unbeabsichtigten Aenderungen wurden eingefuehrt

## Haeufige Stolperfallen

- **Blind eine Seite akzeptieren**: `--ours` oder `--theirs` verwirft die andere Seite vollstaendig. Nur verwenden, wenn sicher ist, dass eine Version vollstaendig korrekt ist.
- **Konfliktmarkierungen im Code belassen**: Die gesamte Datei nach verbleibenden Markierungen nach dem Bearbeiten durchsuchen. Eine unvollstaendige Loesung bricht den Code.
- **Amenden waehrend Rebase**: Waehrend eines interaktiven Rebase nicht `--amend` verwenden, es sei denn, der Rebase-Schritt sieht dies ausdrueichlich vor. Stattdessen `git rebase --continue` verwenden.
- **Arbeit beim Abbrechen verlieren**: `git rebase --abort` und `git merge --abort` verwerfen alle Loesungsarbeiten. Nur abbrechen, wenn von vorne begonnen werden soll.
- **Nach der Loesung nicht testen**: Ein syntaktisch sauberer Merge kann logisch noch falsch sein. Immer Tests ausfuehren.
- **Force-Push nach Rebase**: Nach dem Rebasing eines gemeinsamen Branches mit Mitarbeitern koordinieren, bevor force-gepusht wird, da dadurch die Historie neu geschrieben wird.

## Verwandte Skills

- `commit-changes` - Nach der Konfliktloesung committen
- `manage-git-branches` - Branch-Workflows, die zu Konflikten fuehren
- `configure-git-repository` - Repository-Einrichtung und Merge-Strategien
