---
name: commit-changes
description: >
  Dateien bereitstellen, committen und mit konventionellen Commit-Nachrichten
  nachbessern. Umfasst das Pruefen von Aenderungen, selektives Staging,
  das Verfassen aussagekraeftiger Commit-Nachrichten im HEREDOC-Format und
  die Ueberpruefung der Commit-Historie. Verwenden beim Sichern einer
  logischen Arbeitseinheit in der Versionskontrolle, beim Erstellen eines
  Commits mit konventioneller Nachricht, beim Nachbessern des letzten
  Commits oder beim Pruefen bereitgestellter Aenderungen vor dem Commit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: de
  source_locale: en
  source_commit: 6a868d56
  translator: claude-opus-4-6
  translation_date: 2026-03-13
---

# Aenderungen committen

Dateien gezielt bereitstellen, klare Commit-Nachrichten verfassen und die Commit-Historie ueberpruefen.

## Wann verwenden

- Beim Sichern einer logischen Arbeitseinheit in der Versionskontrolle
- Beim Erstellen eines Commits mit einer aussagekraeftigen, konventionellen Nachricht
- Beim Nachbessern des letzten Commits (Nachricht oder Inhalt)
- Beim Ueberpruefen, was vor dem Commit bereitgestellt wird

## Eingaben

- **Erforderlich**: Eine oder mehrere geaenderte Dateien zum Committen
- **Optional**: Commit-Nachricht (wird bei Bedarf automatisch entworfen)
- **Optional**: Ob der vorherige Commit nachgebessert werden soll
- **Optional**: Co-Autor-Zuordnung

## Vorgehensweise

### Schritt 1: Aktuelle Aenderungen pruefen

Arbeitsbaumstatus pruefen und Diffs inspizieren:

```bash
# Zeigt geaenderte, bereitgestellte und unverfolgte Dateien
git status

# Zeigt nicht bereitgestellte Aenderungen
git diff

# Zeigt bereitgestellte Aenderungen
git diff --staged
```

**Erwartet:** Klares Bild aller geaenderten, bereitgestellten und unverf

olgten Dateien.

**Bei Fehler:** Falls `git status` fehlschlaegt, pruefen, ob man sich in einem Git-Repository befindet (`git rev-parse --is-inside-work-tree`).

### Schritt 2: Dateien gezielt bereitstellen

Bestimmte Dateien bereitstellen statt `git add .` oder `git add -A` zu verwenden, um das versehentliche Einschliessen sensibler Dateien oder nicht zusammenhaengender Aenderungen zu vermeiden:

```bash
# Bestimmte Dateien namentlich bereitstellen
git add src/feature.R tests/test-feature.R

# Alle Aenderungen in einem bestimmten Verzeichnis bereitstellen
git add src/

# Teile einer Datei interaktiv bereitstellen (in nicht-interaktiven Kontexten nicht unterstuetzt)
# git add -p filename
```

Vor dem Commit pruefen, was bereitgestellt ist:

```bash
git diff --staged
```

**Erwartet:** Nur die beabsichtigten Dateien und Aenderungen sind bereitgestellt. Keine `.env`-Dateien, Zugangsdaten oder grosse Binaerdateien.

**Bei Fehler:** Versehentlich bereitgestellte Dateien mit `git reset HEAD <file>` zuruecknehmen. Falls sensible Daten bereitgestellt wurden, sofort vor dem Commit zuruecknehmen.

### Schritt 3: Commit-Nachricht verfassen

Konventionelles Commit-Format verwenden. Die Nachricht immer per HEREDOC uebergeben fuer korrekte Formatierung:

```bash
git commit -m "$(cat <<'EOF'
feat: add weighted mean calculation

Implements weighted_mean() with support for NA handling and
zero-weight filtering. Includes input validation for mismatched
vector lengths.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Konventionelle Commit-Typen:

| Typ | Verwendung |
|-----|-----------|
| `feat` | Neues Feature |
| `fix` | Fehlerbehebung |
| `docs` | Nur Dokumentation |
| `test` | Tests hinzufuegen oder aktualisieren |
| `refactor` | Code-Aenderung ohne Fehlerbehebung oder neues Feature |
| `chore` | Build, CI, Abhaengigkeitsaktualisierungen |
| `style` | Formatierung, Leerzeichen (keine Logik-Aenderung) |

**Erwartet:** Commit erstellt mit einer aussagekraeftigen Nachricht, die das *Warum* erklaert, nicht nur das *Was*.

**Bei Fehler:** Falls ein Pre-Commit-Hook fehlschlaegt, das Problem beheben, erneut mit `git add` bereitstellen und einen **neuen** Commit erstellen (kein `--amend` verwenden, da der fehlgeschlagene Commit nie erstellt wurde).

### Schritt 4: Letzten Commit nachbessern (optional)

Nur nachbessern, wenn der Commit **noch nicht** auf ein gemeinsam genutztes Remote gepusht wurde:

```bash
# Nur Nachricht aendern
git commit --amend -m "$(cat <<'EOF'
fix: correct weighted mean edge case for empty vectors

EOF
)"

# Mit zusaetzlich bereitgestellten Aenderungen nachbessern
git add forgotten-file.R
git commit --amend --no-edit
```

**Erwartet:** Der vorherige Commit wurde direkt aktualisiert. `git log -1` zeigt den nachgebesserten Inhalt.

**Bei Fehler:** Falls der Commit bereits gepusht wurde, nicht nachbessern. Stattdessen einen neuen Commit erstellen. Force-Pushing nachgebesserter Commits auf gemeinsam genutzte Branches verursacht Historie-Divergenz.

### Schritt 5: Commit ueberpruefen

```bash
# Letzten Commit anzeigen
git log -1 --stat

# Letzte Commit-Historie anzeigen
git log --oneline -5

# Commit-Inhalt ueberpruefen
git show HEAD
```

**Erwartet:** Der Commit erscheint in der Historie mit der korrekten Nachricht, dem Autor und den Dateiaenderungen.

**Bei Fehler:** Falls der Commit falsche Dateien enthaelt, `git reset --soft HEAD~1` verwenden, um den Commit rueckgaengig zu machen und die Aenderungen bereitgestellt zu lassen, dann korrekt neu committen.

## Validierung

- [ ] Nur beabsichtigte Dateien sind im Commit enthalten
- [ ] Keine sensiblen Daten (Tokens, Passwoerter, `.env`-Dateien) committet
- [ ] Commit-Nachricht folgt dem konventionellen Commit-Format
- [ ] Nachrichtentext erklaert *warum* die Aenderung vorgenommen wurde
- [ ] `git log` zeigt den Commit mit korrekten Metadaten
- [ ] Pre-Commit-Hooks (falls vorhanden) sind bestanden

## Haeufige Stolperfallen

- **Zu viel auf einmal committen**: Jeder Commit sollte eine logische Aenderung darstellen. Nicht zusammenhaengende Aenderungen in separate Commits aufteilen.
- **`git add .` blindlings verwenden**: Immer zuerst `git status` pruefen. Dateien vorzugsweise namentlich bereitstellen.
- **Gepushte Commits nachbessern**: Niemals Commits nachbessern, die bereits auf einen gemeinsam genutzten Branch gepusht wurden. Dies schreibt die Historie um und verursacht Probleme fuer andere Mitwirkende.
- **Vage Commit-Nachrichten**: "fix bug" oder "update" sagt nichts aus. Beschreiben, was sich geaendert hat und warum.
- **`--no-edit` bei Inhalts-Nachbesserungen vergessen**: Beim Hinzufuegen vergessener Dateien zum letzten Commit `--no-edit` verwenden, um die bestehende Nachricht beizubehalten.
- **Hook-Fehler fuehrt zu `--amend`**: Wenn ein Pre-Commit-Hook fehlschlaegt, wurde der Commit nie erstellt. `--amend` wuerde den *vorherigen* Commit aendern. Nach Behebung von Hook-Problemen immer einen neuen Commit erstellen.

## Verwandte Skills

- `manage-git-branches` - Branch-Workflow vor dem Committen
- `create-pull-request` - Naechster Schritt nach dem Committen
- `resolve-git-conflicts` - Konflikte bei Merge/Rebase behandeln
- `configure-git-repository` - Repository-Einrichtung und Konventionen
