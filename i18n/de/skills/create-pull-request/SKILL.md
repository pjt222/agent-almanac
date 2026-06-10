---
name: create-pull-request
description: >
  Pull Requests mit GitHub CLI erstellen und verwalten. Umfasst Branch-
  Vorbereitung, Verfassen von PR-Titeln und -Beschreibungen, Erstellen
  von PRs, Umgang mit Review-Feedback und Merge-/Aufraeumungs-Workflows.
  Verwenden beim Vorschlagen von Aenderungen aus einem Feature- oder
  Fix-Branch zur Ueberpruefung, beim Zusammenfuehren abgeschlossener
  Arbeit in den Hauptbranch, beim Anfordern von Code-Reviews von
  Mitarbeitern oder beim Dokumentieren von Zweck und Umfang einer
  Reihe von Aenderungen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
  locale: de
  source_locale: en
  source_commit: 6a868d56
  translator: claude-opus-4-6
  translation_date: 2026-03-13
---

# Pull Request erstellen

Einen GitHub Pull Request mit klarem Titel, strukturierter Beschreibung und ordnungsgemaesser Branch-Einrichtung erstellen.

## Wann verwenden

- Beim Vorschlagen von Aenderungen aus einem Feature- oder Fix-Branch zur Ueberpruefung
- Beim Zusammenfuehren abgeschlossener Arbeit in den Hauptbranch
- Beim Anfordern von Code-Reviews von Mitarbeitern
- Beim Dokumentieren von Zweck und Umfang einer Reihe von Aenderungen

## Eingaben

- **Erforderlich**: Feature-Branch mit committeten Aenderungen
- **Erforderlich**: Zielbranch fuer den Merge (ueblicherweise `main`)
- **Optional**: Zu benennende Reviewer
- **Optional**: Labels oder Meilenstein
- **Optional**: Entwurfsstatus

## Vorgehensweise

### Schritt 1: Branch-Bereitschaft sicherstellen

Sicherstellen, dass der Branch mit dem Zielbranch aktuell ist und alle Aenderungen committet sind:

```bash
# Auf nicht committete Aenderungen pruefen
git status

# Neueste Aenderungen vom Remote holen
git fetch origin

# Auf aktuellen main rebasen (oder mergen)
git rebase origin/main
```

**Erwartet:** Der Branch liegt vor `origin/main`, ohne nicht committete Aenderungen und ohne Konflikte.

**Bei Fehler:** Bei Rebase-Konflikten diese loesen (siehe Skill `resolve-git-conflicts`), dann `git rebase --continue`. Falls der Branch erheblich divergiert ist, stattdessen `git merge origin/main` in Betracht ziehen.

### Schritt 2: Alle Aenderungen auf dem Branch pruefen

Den vollstaendigen Diff und die Commit-Historie pruefen, die im PR enthalten sein werden:

```bash
# Alle Commits auf diesem Branch anzeigen (die nicht auf main sind)
git log origin/main..HEAD --oneline

# Vollstaendigen Diff gegen main anzeigen
git diff origin/main...HEAD

# Pruefen ob der Branch einen Remote verfolgt und gepusht ist
git status -sb
```

**Erwartet:** Alle Commits sind fuer den PR relevant. Der Diff zeigt nur beabsichtigte Aenderungen.

**Bei Fehler:** Falls nicht zusammenhaengende Commits vorhanden sind, interaktives Rebase in Betracht ziehen, um die Historie vor dem PR aufzuraeumen.

### Schritt 3: Branch pushen

```bash
# Branch zum Remote pushen (Upstream-Tracking setzen)
git push -u origin HEAD
```

**Erwartet:** Der Branch erscheint auf dem GitHub-Remote.

**Bei Fehler:** Falls der Push abgelehnt wird, zuerst mit `git pull --rebase origin <branch>` pullen und eventuelle Konflikte loesen.

### Schritt 4: PR-Titel und -Beschreibung verfassen

Den Titel unter 70 Zeichen halten. Den Body fuer Details nutzen:

```bash
gh pr create --title "Add weighted mean calculation" --body "$(cat <<'EOF'
## Summary
- Implement `weighted_mean()` with NA handling and zero-weight filtering
- Add input validation for mismatched vector lengths
- Include unit tests covering edge cases

## Test plan
- [ ] `devtools::test()` passes with no failures
- [ ] Manual verification with example data
- [ ] Edge cases: empty vectors, all-NA weights, zero-length input

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Fuer Entwurfs-PRs:

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**Erwartet:** PR auf GitHub erstellt, eine URL wird zurueckgegeben. Die Beschreibung kommuniziert klar, was sich geaendert hat und wie es getestet werden kann.

**Bei Fehler:** Falls `gh` nicht authentifiziert ist, `gh auth login` ausfuehren. Falls der Zielbranch falsch ist, mit `--base main` angeben.

### Schritt 5: Review-Feedback bearbeiten

Auf Review-Kommentare reagieren und Aktualisierungen pushen:

```bash
# PR-Kommentare anzeigen
gh api repos/{owner}/{repo}/pulls/{number}/comments

# PR-Review-Status anzeigen
gh pr checks

# Nach Aenderungen committen und pushen
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**Erwartet:** Neue Commits erscheinen auf dem PR. Review-Kommentare sind bearbeitet.

**Bei Fehler:** Falls CI-Checks nach dem Push fehlschlagen, die Check-Ausgabe mit `gh pr checks` lesen und die Probleme beheben, bevor ein erneutes Review angefordert wird.

### Schritt 6: Mergen und aufraeumen

Nach der Genehmigung:

```bash
# PR mergen (Squash-Merge haelt die Historie uebersichtlich)
gh pr merge --squash --delete-branch

# Oder mit allen Commits beibehalten mergen
gh pr merge --merge --delete-branch

# Oder Rebase-Merge (lineare Historie)
gh pr merge --rebase --delete-branch
```

Nach dem Merge den lokalen main aktualisieren:

```bash
git checkout main
git pull origin main
```

**Erwartet:** PR ist gemergt, der Remote-Branch ist geloescht, der lokale main ist aktualisiert.

**Bei Fehler:** Falls der Merge durch fehlgeschlagene Checks oder fehlende Genehmigungen blockiert ist, diese zuerst bearbeiten. Nicht ohne Klaerung der Blocker erzwungen mergen.

## Validierung

- [ ] PR-Titel ist praegnant (unter 70 Zeichen) und aussagekraeftig
- [ ] PR-Body enthaelt Zusammenfassung der Aenderungen und Testplan
- [ ] Alle Commits auf dem Branch sind fuer den PR relevant
- [ ] CI-Checks bestehen
- [ ] Branch ist mit dem Zielbranch aktuell
- [ ] Reviewer sind zugewiesen (falls vom Repository verlangt)
- [ ] Keine sensiblen Daten im Diff

## Haeufige Stolperfallen

- **PR zu gross**: PRs auf ein einzelnes Feature oder einen Fix fokussieren. Grosse PRs sind schwerer zu reviewen und anfaelliger fuer Merge-Konflikte.
- **Fehlender Testplan**: Immer beschreiben, wie die Aenderungen verifiziert werden koennen, auch bei Dokumentations-PRs.
- **Veralteter Branch**: Falls der Zielbranch erheblich vorangeschritten ist, vor der PR-Erstellung rebasen, um Merge-Konflikte zu minimieren.
- **Force-Push waehrend des Reviews**: Vermeiden, auf einen Branch mit offenen Review-Kommentaren force-zu-pushen. Neue Commits pushen, damit Reviewer inkrementelle Aenderungen sehen koennen.
- **CI-Ausgabe nicht lesen**: `gh pr checks` pruefen, bevor ein erneutes Review angefordert wird. Fehlschlagende CI vergeudet die Zeit der Reviewer.
- **Branch-Loesung vergessen**: `--delete-branch` beim Merge verwenden, um das Remote sauber zu halten.

## Verwandte Skills

- `commit-changes` - Commits fuer den PR erstellen
- `manage-git-branches` - Branch-Erstellung und Namenskonventionen
- `resolve-git-conflicts` - Konflikte bei Rebase/Merge behandeln
- `create-github-release` - Release nach dem Merge
