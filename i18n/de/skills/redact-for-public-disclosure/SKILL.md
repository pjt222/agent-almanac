---
name: redact-for-public-disclosure
description: >
  Reverse-Engineering-Befunde für die öffentliche Offenlegung redigieren
  und dabei Methodik, generalisierbare Muster und Lehrwert erhalten.
  Behandelt die Trennung zwischen privatem und öffentlichem Repo, die
  Pflege einer Muster-Sperrliste, das Orphan-Commit-Publish-Muster, das
  `git log`-Lecks verhindert, die kategoriebasierte Redaktionskalibrierung
  (Methodik/Muster/Versionsbefund/intern) sowie das CI-Gate im Stil von
  `check-redaction.sh`, das Merges blockiert, wenn ein gesperrtes Muster
  erscheint. Einzusetzen, wenn Befunde über einen CLI-Harness veröffentlicht
  werden sollen, der nicht einem selbst gehört, wenn Upstream-Vorschläge
  für ein unabhängiges Projekt vorbereitet werden oder wenn ein privates
  Forschungs-Repo als öffentliche Referenz archiviert werden soll.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
  locale: de
  source_locale: en
  source_commit: b9570f58
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Redact for Public Disclosure

Ein Reverse-Engineering-Forschungs-Repo in eine private Source-of-Truth und eine öffentliche Offenlegungs-Teilmenge aufspalten — mittels Redaktions-Checker, Muster-Sperrlisten und Orphan-Commit-Publish-Muster. Methodik wandert, spezifische Befunde bleiben privat.

## Wann verwenden

- Methodische Befunde zu einem Closed-Source-CLI-Harness veröffentlichen, mit dem integriert wird
- Einen Upstream-Vorschlag oder Bug-Report für ein Projekt vorbereiten, das nicht einem selbst gehört
- Ein privates Forschungs-Repo als öffentliche Referenz archivieren
- Untersuchungsnotizen (Phase-1-4-Artefakte) in einen öffentlichen Leitfaden überführen
- Eine Publikations-Pipeline etablieren, bevor sich Befunde anhäufen, damit Leckrisiken nicht aufstauen
- Nach einem Beinahe-Vorfall aufräumen, bei dem ein Entwurf fast einen sensiblen Identifikator ausgeliefert hätte

## Eingaben

- **Erforderlich**: Ein privates Forschungs-Repo mit gemischter Sensibilität als Source-of-Truth
- **Erforderlich**: Ein öffentliches Spiegel-Ziel (separates Repo oder ein `public/`-Worktree), in das redigierter Inhalt veröffentlicht wird
- **Optional**: Ein bestehender Entwurf, der zur Veröffentlichung ansteht
- **Optional**: Eine Versionsverzögerungs-Policy (Voreinstellung „aktuelle + 1 vorherige bleiben privat")
- **Optional**: Eine Liste bekanntermaßen sensibler Hersteller-Identifikatoren, Flag-Präfixe oder Namensräume

## Vorgehen

### Schritt 1: Jedes Kandidaten-Fakt kategorisieren

Bevor Inhalte verfasst oder befördert werden, jedes Fakt in eine von vier Kategorien einordnen. Die Kategorie entscheidet, ob und wann es ausgeliefert werden kann.

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

Jeden Abschnitt eines Entwurfs, jedes Capture-Log und jede Notiz vor der Prüfung für die Veröffentlichung mit einer Kategorie annotieren. Ein Abschnitt, der Kategorien mischt, wird aufgeteilt — die Methodik löst sich sauber heraus, der Rest bleibt privat.

**Expected:** Jedes Kandidaten-Fakt trägt eine Kategoriekennzeichnung. Für den öffentlichen Spiegel bestimmte Entwürfe enthalten nur Methodik- und generische-Muster-Einträge (plus versionsbezogene Befunde jenseits der Wartezeit).

**On failure:** Lässt sich ein Fakt nicht zuordnen, standardmäßig als Live-Internes behandeln. Erst nach explizitem Abgleich mit der Versionsverzögerungs-Policy neu kategorisieren.

### Schritt 2: Die Versionsverzögerungs-Policy festlegen

Vorab festlegen, wie viele Versionen zwischen „aktuell" und „teilbar" liegen. Zwei ist typisch: aktuelle + 1 vorherige bleiben privat, ältere Muster dürfen besprochen werden. Die Policy in das private Repo schreiben (z. B. `REDACTION_POLICY.md`), damit künftige-Ich sie nicht neu ableiten muss.

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

Die „aktuelle" Version muss empirisch sein (aus dem installierten Binary gelesen), nicht administrativ. Die Policy an die Ausgabe des Baseline-Scanners binden, nicht an einen Kalender.

**Expected:** Eine eingecheckte `REDACTION_POLICY.md` im privaten Repo mit einer expliziten Wartezeit und einem Verantwortlichen.

**On failure:** Können sich Stakeholder nicht auf die Wartezeit einigen, im Zweifel den konservativsten Vorschlag wählen. Wartezeiten lassen sich später verkürzen; ein Leck lässt sich nicht zurückrufen.

### Schritt 3: Den Sperrlisten-Scanner bauen

Muster in einem einzigen ausführbaren Skript pflegen, das die Source-of-Truth für die Redaktions-Policy ist. Das Skript lebt im privaten Repo (`tools/check-redaction.sh`) und wird gegen den öffentlichen Spiegel ausgeführt.

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

Jeder Eintrag hat ein menschenlesbares Label und eine Regex. Ein Eintrag pro sensibler Identifikator*form* (nicht pro Literalstring — Formen überstehen Versionswechsel). Der Exitcode entspricht der Anzahl der Lecks; ein sauberer Lauf endet mit 0.

**Expected:** `tools/check-redaction.sh ./public-mirror` läuft auf einem kleinen Repo in unter einer Sekunde und beendet sich mit 0, wenn nichts matcht.

**On failure:** Ist `rg` nicht verfügbar, auf `grep -rqE` ausweichen. Sind Muster zu breit (jeder Lauf meldet Lecks), an der Quelle verengen, anstatt Unterdrückungen hinzuzufügen.

### Schritt 4: Die Sperrliste vor dem Verfassen pflegen

Wenn ein Phase-1-4-Befund durch einen Entwurf lecken könnte, den Scanner *vor* dem Schreiben des Entwurfs erweitern. Entwürfe sind billig; dem Scanner neue Muster beizubringen, hält.

Ablauf:

1. Neuer Befund landet im privaten Repo (z. B. ein frisch entdecktes Flag-Präfix).
2. Frage stellen: „Wenn das lecken würde, was sollte der Scanner fangen?"
3. Mustereintrag in `tools/check-redaction.sh` anfügen (Label + Regex).
4. Den Scanner gegen den gesamten öffentlichen Spiegel laufen lassen, um zu bestätigen, dass das neue Muster nicht bereits von legitimen Inhalten ausgelöst wird.
5. Erst dann öffentlichen Inhalt verfassen, der den betroffenen Bereich berührt.

Dies kehrt die übliche Reihenfolge um: Der Scanner wird zuerst aktualisiert, der Entwurf danach. Der Scanner wird zur ausführbaren Spezifikation von „was zu sensibel ist, um veröffentlicht zu werden", und der Entwurf kann ihn nicht versehentlich überholen.

**Expected:** Mustereinträge in `tools/check-redaction.sh` liegen zeitlich vor jedem Inhalt im öffentlichen Spiegel, der ihnen entsprechen könnte. `git log tools/check-redaction.sh` zeigt Scanner-Aktualisierungen, die vor verwandten Entwurfs-Commits landen.

**On failure:** Hängen Scanner-Aktualisierungen den Entwürfen hinterher, sofort den öffentlichen Spiegel gegen das neue Muster auditieren. Redigieren und dann die Scanner-Aktualisierung mit einer Notiz committen, die das entdeckte Muster erklärt.

### Schritt 5: Die Trennung privates/öffentliches Dateiset etablieren

Eine explizite Erlaubnisliste der Dateien definieren, die in den öffentlichen Spiegel synchronisiert werden. Neue Dateien sind standardmäßig privat; die Beförderung erfordert eine bestandene Redaktionsprüfung.

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

Ein `tools/sync-to-public.sh` liest die Erlaubnisliste, kopiert nur diese Dateien in den öffentlichen Spiegel und beendet sich mit einem Exitcode ungleich 0, wenn die Erlaubnisliste auf eine Datei verweist, die nicht existiert (fängt Tippfehler ab).

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

Die Beförderung erfordert drei Dinge in Reihenfolge: Die Datei wird der Erlaubnisliste hinzugefügt, die Datei besteht die Redaktionsprüfung, und ein Reviewer bestätigt die Kategoriekennzeichnungen aus Schritt 1.

**Expected:** Der öffentliche Spiegel enthält genau die in `tools/public-allowlist.txt` aufgeführten Dateien. Keine Datei erscheint im öffentlichen Spiegel, die nicht auf der Erlaubnisliste steht.

**On failure:** Erscheint eine Datei im öffentlichen Spiegel, die nicht auf der Erlaubnisliste steht, als Leck-Vorfall behandeln — untersuchen, wie sie dorthin kam, dann entweder entfernen oder nach Redaktionsprüfung formal befördern.

### Schritt 6: Via Orphan-Commit veröffentlichen

Der öffentliche Spiegel ist ein einzelner mit `git commit --orphan` gewurzelter Commit, der bei jeder Veröffentlichung neu erzeugt wird. Das verhindert, dass `git log` im öffentlichen Repo Entwürfe vor der Redaktion preisgibt.

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

Das `git log` des öffentlichen Repos zeigt genau einen Commit. Frühere Entwürfe und jegliche Redaktionsiterationen bleiben in der Historie des privaten Repos. Weder `git log -p`, `git reflog` noch das Branch-Listing im öffentlichen Repo kann Inhalte aus der Zeit vor der Redaktion wiederherstellen, weil sie dort nie committet wurden.

**Expected:** `git log --oneline` im öffentlichen Spiegel zeigt einen einzigen Commit pro Veröffentlichung. Es erscheinen keine Verweise auf die Historie des privaten Repos (keine Eltern-SHAs, keine Merge-Commits, keine Tags aus dem privaten Repo).

**On failure:** Wird `git push --force` abgelehnt (Branch-Schutz), stattdessen einen Single-Commit-Pull-Request aus einem sauberen Orphan-Branch öffnen. Niemals eine Ablehnung durch Pushen der privaten Historie lösen.

### Schritt 7: Das CI-Gate verdrahten

`tools/check-redaction.sh` bei jedem Commit auf dem Publish-Sync-Branch laufen lassen. Ein fehlgeschlagener Check blockiert die Veröffentlichung, er warnt nicht nur.

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

Zwei Designentscheidungen dabei:

- Der Scanner wird zur CI-Zeit aus dem privaten Repo gezogen, sodass die Sperrliste selbst niemals im öffentlichen Repo liegt (die Muster sind selbst sensibel — sie zu veröffentlichen würde einem Leser genau sagen, wonach er suchen soll).
- Der Job endet mit dem Exitcode des Scanners; ungleich 0 blockiert den Workflow.

**Expected:** Pushes, die ein gesperrtes Muster einführen, lassen die CI fehlschlagen; die Veröffentlichung landet nicht. Maintainer sehen das fehlschlagende Label (z. B. `LEAK: vendor-prefixed flag`), ohne die Regex selbst zu sehen.

**On failure:** Lässt sich das Private-Repo-Token nicht an die öffentliche CI vergeben, nur einen *leckminimalen* Teil des Scanners im öffentlichen Repo einbetten (breite Formmuster, die den Hersteller selbst nicht identifizieren) und den vollen Scanner vor dem Push aus dem privaten Repo heraus laufen lassen.

### Schritt 8: False Positives ehrlich behandeln

Stolpert der Scanner über legitimen Inhalt, das Muster verengen statt eine Ignorier-Zeile hinzuzufügen. Breite Sperrlisten mit lokalen Unterdrückungen verfallen schnell — sechs Monate später weiß niemand mehr, warum eine bestimmte Zeile unterdrückt wurde, und das nächste Leck rutscht unbemerkt durch.

Entscheidungsbaum:

1. **Ist der Treffer tatsächlich sicher?** Mit Schritt 1 neu kategorisieren. Stellt sich der Inhalt als verdeckt Live-Internes heraus, redigieren; den Scanner nicht unterdrücken.
2. **Ist das Muster zu breit?** Die Regex so verengen, dass der sichere Inhalt nicht mehr matcht. Die Verengung in `check-redaction.sh` mit einem Kommentar dokumentieren, der auf den motivierenden Fall verweist.
3. **Nur wenn 1 und 2 beide scheitern** — und das Muster strukturell zu sehr mit legitimem Inhalt verflochten ist, um weiter zu verengen — eine einzeilige Unterdrückung mit einem `# REASON:`-Kommentar nutzen, der erklärt, *warum* die Unterdrückung sicher ist. Den Kommentar datieren.

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**Expected:** Jedes Scanner-Muster trägt null oder einen Inline-Kommentar, der eine Verengung erklärt. Unterdrückungen — falls vorhanden — tragen ein Datum und eine Begründung.

**On failure:** Häufen sich Unterdrückungen (mehr als eine pro Quartal), ist die Sperrliste falsch geformt. Eine Policy-Review ansetzen und die Muster aus der kategorisierten Faktenliste neu aufbauen.

### Schritt 9: Periodische Redaktions-Sweeps

Nicht alle Redaktionsarbeit ist vorfallsgetrieben. Einen periodischen Sweep (typischerweise monatlich) durchführen, der die jüngsten Ergänzungen im privaten Repo neu kategorisiert und den Scanner erneut gegen den öffentlichen Spiegel laufen lässt. So fängt sich Drift, bevor sie Vorfallstufe erreicht.

Sweep-Checkliste:

- [ ] Die Versionsverzögerungs-Policy erneut lesen; bestätigen, dass die empirische „aktuelle" Version unverändert ist, oder die Policy aktualisieren
- [ ] Die Commits des letzten Monats im privaten Repo auf neu hinzugekommene Befunde prüfen, die nicht kategorisiert wurden (Schritt 1)
- [ ] `tools/check-redaction.sh` gegen den öffentlichen Spiegel ausführen (sollte weiterhin mit 0 enden)
- [ ] Seit dem letzten Sweep hinzugefügte Scanner-Muster durchsehen — sind welche zu breit? Gegebenenfalls verengen
- [ ] Ist eine Version über die Wartezeit hinaus gealtert, Befunde identifizieren, die nun zur Beförderung infrage kommen
- [ ] Bestätigen, dass `tools/public-allowlist.txt` dem tatsächlichen Dateiset im öffentlichen Spiegel entspricht

**Expected:** Ein kurzes Sweep-Log pro Monat im privaten Repo (z. B. `sweeps/2026-04.md`) mit Checklistenergebnissen und gegebenenfalls ergriffenen Maßnahmen.

**On failure:** Wird der Sweep wiederholt übergangen, eine Kalendererinnerung automatisieren. Findet der Sweep immer wieder denselben Drift, liegt das Problem im Workflow davor — untersuchen, warum die Kategorisierung zur Entwurfszeit ausgelassen wird.

## Validierung

- [ ] Jede Datei im öffentlichen Spiegel steht in `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` endet mit 0
- [ ] `git log --oneline` im öffentlichen Spiegel zeigt einen einzigen Orphan-Commit pro Veröffentlichung
- [ ] `REDACTION_POLICY.md` existiert im privaten Repo mit expliziter Versionsverzögerungs-Wartezeit
- [ ] Jeder Phase-1-4-Befund hat ein Kategorie-Label (methodology / generic pattern / version-specific / live internal)
- [ ] Die öffentliche CI führt den Scanner bei jedem Push aus; ein bewusstes Testmuster lässt den Build fehlschlagen
- [ ] Der Sperrlisten-Scanner selbst liegt nicht im öffentlichen Repo
- [ ] Das jüngste monatliche Sweep-Log ist innerhalb der letzten 35 Tage datiert

## Häufige Fallstricke

- **„Nur ein Beispiel, um es konkret zu machen."** Die Versuchung, einen spezifischen Befund aufzunehmen, „um die Methodik zu erden", ist der häufigste Leck-Pfad. Synthetische Platzhalter verwenden (z. B. `acme_widget_v3`, `widget_handler_42`) — klar erfunden, nie auf ein reales Produkt zurückführbar.
- **`git rebase` oder `git filter-branch` nutzen, um ein Leck im öffentlichen Repo an Ort und Stelle auszuradieren.** Ein Force-Push umgeschriebener Historie hinterlässt trotzdem Spuren in Klonen und Forks. Das Orphan-Commit-Publish-Muster ist eine strukturelle Lösung; ad-hoc-Historienumschreibung ist es nicht.
- **Unterdrückungen statt Musterverengung.** Ein Scanner mit zwanzig Unterdrückungen ist ein Scanner mit null bedeutsamer Abdeckung. Jede Unterdrückung ist ein künftiges Leck, das auf das Verblassen des Kontexts wartet.
- **Öffentliche CI, die warnt statt fehlschlägt.** Warnungen werden ignoriert. Das CI-Gate muss die Veröffentlichung blockieren (Exitcode ungleich 0, kein Merge-Button).
- **Drift der Erlaubnisliste.** Neu im privaten Repo hinzugefügte Dateien gehören nicht automatisch auf die Erlaubnisliste. Default-Deny ist die einzig sichere Haltung.
- **Verschlüsselung mit Redaktion verwechseln.** Einen sensiblen Identifikator zu kodieren, zu hashen oder zu rot13-en und das Ergebnis zu veröffentlichen, veröffentlicht ihn weiterhin — das Original ist rekonstruierbar. Redigieren heißt: „taucht überhaupt nicht auf".
- **Die Sperrliste veröffentlichen.** Die Muster selbst sind ein Befundkatalog: Wer die Regex sieht, weiß genau, wonach er im Binary greppen muss. Den Scanner privat halten; nur seine Labels (z. B. `LEAK: vendor-prefixed flag`) sollen in öffentlichen CI-Logs erscheinen.
- **Das private Repo als Entwurfshalde behandeln.** Es ist die Source-of-Truth für die Forschung, kein Schmierplatz. Dieselbe Versionierungs-, Review- und Backup-Disziplin wie für jedes Produktionsartefakt anwenden.

## Verwandte Skills

- `monitor-binary-version-baselines` — Phase 1; Baselines speisen die Versionsverzögerungs-Policy: was als „aktuell" gilt, ist ein empirisches Fakt, kein Kalender-Fakt
- `probe-feature-flag-state` — Phasen 2–3; Klassifizierungsbefunde gelangen hier im Kategorieschritt (Schritt 1) in die Redaktionspipeline
- `conduct-empirical-wire-capture` — Phase 4; Erfassungsartefakte (Wire-Logs, Payload-Schemas) müssen redigiert werden, bevor eines öffentlich referenziert werden kann
- `security-audit-codebase` — beide Pipelines profitieren vom Sperrlisten-artigen Scannen; dieser Skill spezialisiert sich auf Forschungs-Offenlegung statt auf Geheimnisleck
- `manage-git-branches` — das Orphan-Commit-Publish-Muster ist eine Branch-Operation; die sichere Ausführung setzt die dort dokumentierten Branch-Hygiene-Praktiken voraus
