---
name: review-pull-request
description: >
  Reviewt einen Pull Request von Ende zu Ende mit der GitHub CLI. Umfasst
  Diff-Analyse, Commit-Verlaufs-Review, CI/CD-Pruefungsverifizierung,
  schweregradbasiertes Feedback (blocking/suggestion/nit/praise) und
  gh-pr-review-Einreichung. Verwenden wenn ein Pull Request zum Review
  zugewiesen ist, bei einem Selbst-Review vor der Einholung von Feedback anderer,
  bei einem zweiten Review nach bearbeitetem Feedback oder beim Audit eines
  zusammengefuehrten PRs.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, pull-request, github, code-review, gh-cli, feedback, pr
---

# Pull Request reviewen

Einen GitHub-Pull-Request von Ende zu Ende reviewen — vom Verstaendnis der Aenderung bis zur Einreichung strukturierten Feedbacks. Verwendet `gh` CLI fuer alle GitHub-Interaktionen und erzeugt schweregradbasierte Review-Kommentare.

## Wann verwenden

- Ein Pull Request ist bereit zum Review und Ihnen zugewiesen
- Zweites Review nach Bearbeitung des Autorensfeedbacks
- Eigenen PR vor dem Einfordern von Reviews anderer reviewen (Selbst-Review)
- Audit eines zusammengefuehrten PRs zur Qualitaetsbewertung nach dem Merge
- Wenn ein strukturierter Review-Prozess statt ad-hoc-Scanning gewuenscht wird

## Eingaben

- **Erforderlich**: PR-Bezeichner (Nummer, URL oder `owner/repo#number`)
- **Optional**: Review-Fokus (Sicherheit, Leistung, Korrektheit, Stil)
- **Optional**: Vertrautheit mit der Codebasis (vertraut, etwas vertraut, unbekannt)
- **Optional**: Zeitbudget fuer das Review (schneller Scan, Standard, ggruendlich)

## Vorgehensweise

### Schritt 1: Den Kontext verstehen

Die PR-Beschreibung lesen und verstehen, was die Aenderung bewirken soll.

1. PR-Metadaten abrufen:
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. PR-Titel und -Beschreibung lesen:
   - Welches Problem loest dieser PR?
   - Welchen Ansatz hat der Autor gewaehlt?
   - Gibt es bestimmte Bereiche, die der Autor reviewt haben moechte?
3. PR-Groesse pruefen und benoetigte Zeit einschaetzen:

```
PR-Groessen-Leitfaden:
+--------+-----------+---------+-------------------------------------+
| Groesse| Dateien   | Zeilen  | Review-Ansatz                       |
+--------+-----------+---------+-------------------------------------+
| Klein  | 1-5       | <100    | Jede Zeile lesen, schnelles Review  |
| Mittel | 5-15      | 100-500 | Logikaenderungen fokussieren, Config|
|        |           |         | ueberblicken                        |
| Gross  | 15-30     | 500-    | Per Commit reviewen, kritische      |
|        |           | 1000    | Dateien fokussieren, Aufteilung flag|
| XL     | 30+       | 1000+   | Aufteilung empfehlen. Nur kritische |
|        |           |         | Dateien reviewen.                   |
+--------+-----------+---------+-------------------------------------+
```

4. Commit-Verlauf reviewen:
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - Sind Commits logisch und gut strukturiert?
   - Erzaehlt die Geschichte eine Geschichte (jeder Commit ein koh.aenter Schritt)?
5. CI/CD-Status pruefen:
   ```bash
   gh pr checks <number>
   ```
   - Bestehen alle Pruefungen?
   - Wenn Pruefungen fehlschlagen, welche — das beeinflusst das Review

**Erwartet:** Klares Verstaendnis davon, was der PR tut, warum er existiert, wie gross er ist und ob CI gruen ist. Dieser Kontext praegt den Review-Ansatz.

**Bei Fehler:** Wenn die PR-Beschreibung leer oder unklar ist, dies als erstes Feedback vermerken. Ein PR ohne Kontext ist ein Review-Anti-Pattern. Wenn `gh`-Befehle fehlschlagen, Authentifizierung pruefen (`gh auth status`) und Zugriff auf das Repository sicherstellen.

### Schritt 2: Den Diff analysieren

Die tatsaechlichen Codeaenderungen systematisch lesen.

1. Vollstaendigen Diff abrufen:
   ```bash
   gh pr diff <number>
   ```
2. Bei **kleinen/mittleren PRs** den gesamten Diff sequenziell lesen
3. Bei **grossen PRs** per Commit reviewen:
   ```bash
   gh pr diff <number> --patch  # vollstaendiges Patch-Format
   ```
4. Fuer jede geaenderte Datei bewerten:
   - **Korrektheit**: Tut der Code, was der PR vorgibt?
   - **Grenzfaelle**: Werden Randbedingungen behandelt?
   - **Fehlerbehandlung**: Werden Fehler sauber abgefangen und behandelt?
   - **Sicherheit**: Gibt es Injektions-, Auth- oder Datenoffenlegungs-Risiken?
   - **Leistung**: Offensichtliche O(n^2)-Schleifen, fehlende Indizes oder Speicherprobleme?
   - **Benennung**: Sind neue Variablen/Funktionen/Klassen klar benannt?
   - **Tests**: Werden neue Verhaltensweisen durch Tests abgedeckt?
5. Beim Lesen Notizen machen und jede Beobachtung nach Schweregrad klassifizieren

**Erwartet:** Eine Reihe von Beobachtungen zu Korrektheit, Sicherheit, Leistung und Qualitaet fuer jede bedeutende Aenderung im Diff. Jede Beobachtung hat ein Schweregradniveau.

**Bei Fehler:** Wenn der Diff zu gross ist um effektiv reviewt zu werden, dies markieren: "Dieser PR aendert {N} Dateien und {M} Zeilen. Ich empfehle, ihn in kleinere PRs aufzuteilen fuer effektiveres Review." Trotzdem die risikoreichsten Dateien reviewen.

### Schritt 3: Feedback klassifizieren

Beobachtungen nach Schweregradniveaus organisieren.

1. Jede Beobachtung klassifizieren:

```
Feedback-Schweregradniveaus:
+-----------+------+----------------------------------------------------+
| Niveau    | Icon | Beschreibung                                       |
+-----------+------+----------------------------------------------------+
| Blocking  | [B]  | Vor Merge beheben. Bugs, Sicherheitsprobleme,      |
|           |      | Datenverlust-Risiken, beschaedigte Funktionalitaet.|
| Suggest   | [S]  | Sollte behoben werden, blockiert Merge nicht.      |
|           |      | Bessere Ansaetze, fehlende Grenzfaelle, Stilprob.  |
|           |      | die Wartbarkeit beeinflussen.                      |
| Nit       | [N]  | Optionale Verbesserung. Stilpraeferenzen, kleine   |
|           |      | Benennungsvorschlaege, Formatierung.               |
| Praise    | [P]  | Gute Arbeit, die erwaehnens-wert ist. Clevere      |
|           |      | Loesungen, gruendliche Tests, saubere Abstraktionen|
+-----------+------+----------------------------------------------------+
```

2. Fuer jedes Blocking-Element erklaeren:
   - Was falsch ist (das spezifische Problem)
   - Warum es wichtig ist (die Auswirkung)
   - Wie es behoben werden kann (ein konkreter Vorschlag)
3. Fuer jedes Suggest-Element die Alternative erklaeren und warum sie besser ist
4. Nits kurz halten — ein Satz reicht
5. Mindestens ein Praise einschliessen, wenn etwas Positives auffaellt

**Erwartet:** Eine sortierte Liste von Feedback-Punkten mit klaren Schweregradniveaus. Blocking-Punkte haben Loesung-Vorschlaege. Das Verhaeltnis sollte generell sein: wenige Blocking, einige Suggest, minimale Nit, mindestens ein Praise.

**Bei Fehler:** Wenn alles blocking erscheint, muss der PR moeglicherweise ueberarbeitet statt gepatcht werden. Erwaegen, Aenderungen auf PR-Ebene anzufordern statt zeilenbasierter Kommentare. Wenn nichts falsch erscheint, das auch sagen — "LGTM" ist gueltiges Feedback, wenn der Code gut ist.

### Schritt 4: Review-Kommentare verfassen

Das Review mit strukturiertem, umsetzbarem Feedback zusammenstellen.

1. **Review-Zusammenfassung** verfassen (Kommentar auf oberster Ebene):
   - Ein Satz: was der PR tut (Verstaendnis bestaetigen)
   - Gesamtbewertung: genehmigen, Aenderungen anfragen oder kommentieren
   - Wichtige Punkte: Blocking-Probleme (falls vorhanden) und die wichtigsten Suggest-Punkte auflisten
   - Lob: gute Arbeit hervorheben
2. **Inline-Kommentare** fuer spezifische Codestellen verfassen:
   ```bash
   # Inline-Kommentare per gh API einreichen
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] Diese SQL-Abfrage ist anfaellig fuer Injection. Stattdessen parametrisierte Abfragen verwenden.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. Feedback konsistent formatieren:
   - Jeden Kommentar mit dem Schweregradtag beginnen: `[B]`, `[S]`, `[N]` oder `[P]`
   - GitHub-Vorschlagsblocks fuer konkrete Fixes verwenden
   - Fuer Stil-/Muster-Vorschlaege zur Dokumentation verlinken
4. Das Review einreichen:
   ```bash
   # Genehmigen
   gh pr review <number> --approve --body "Review-Zusammenfassung hier"

   # Aenderungen anfordern (wenn Blocking-Probleme vorhanden)
   gh pr review <number> --request-changes --body "Review-Zusammenfassung hier"

   # Nur kommentieren (wenn unsicher oder FYI-Feedback)
   gh pr review <number> --comment --body "Review-Zusammenfassung hier"
   ```

**Erwartet:** Ein eingereichten Review mit klarem, umsetzbarem Feedback. Der Autor weiss genau, was zu beheben ist (Blocking), was zu beruecksichtigen ist (Suggest) und was gut war (Praise).

**Bei Fehler:** Wenn `gh pr review` fehlschlaegt, Berechtigungen pruefen. Schreibzugriff auf das Repository oder Status als angefragter Reviewer wird benoetigt. Wenn Inline-Kommentare fehlschlagen, alles Feedback im Review-Body mit Datei:Zeile-Referenzen platzieren.

### Schritt 5: Nachverfolgen

Die Review-Auflosung verfolgen.

1. Nachdem der Autor reagiert oder Aktualisierungen gepusht hat:
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. Nur die Aenderungen neu reviewen, die Ihr Feedback adressieren:
   ```bash
   gh pr diff <number>  # neue Commits pruefen
   ```
3. Blocking-Punkte vor der Genehmigung als geloest verifizieren
4. Kommentar-Threads aufloesen, wenn Probleme behoben wurden
5. Genehmigen, wenn alle Blocking-Punkte geloest sind:
   ```bash
   gh pr review <number> --approve --body "Alle Blocking-Probleme geloest. LGTM."
   ```

**Erwartet:** Blocking-Probleme als geloest verifiziert. Review-Konversation aufgeloest. PR genehmigt oder weitere Aenderungen mit spezifisch verbleibenden Punkten angefordert.

**Bei Fehler:** Wenn der Autor Feedback ablehnt, im PR-Thread diskutieren. Auf Auswirkungen (warum es wichtig ist) konzentrieren statt auf Autoritaet. Wenn bei nicht-blocking Punkten keine Einigung erzielt wird, elegant nachgeben — der Autor besitzt den Code.

## Validierung

- [ ] PR-Kontext verstanden (Zweck, Groesse, CI-Status)
- [ ] Alle geaenderten Dateien reviewt (oder risikoreichste Dateien fuer XL-PRs)
- [ ] Feedback nach Schweregrad klassifiziert (Blocking/Suggest/Nit/Praise)
- [ ] Blocking-Punkte haben spezifische Loesung-Vorschlaege
- [ ] Mindestens ein Praise fuer positive Aspekte eingeschlossen
- [ ] Review-Entscheidung stimmt mit Feedback ueberein (genehmigen nur wenn keine Blocking-Punkte)
- [ ] Inline-Kommentare referenzieren spezifische Zeilen mit Schweregradtags
- [ ] CI/CD-Pruefungen verifiziert (gruen vor Genehmigung)
- [ ] Nachverfolgung nach Autorenrevisionen abgeschlossen

## Haeufige Stolperfallen

- **Blind genehmigen**: Genehmigen ohne den Diff tatsaechlich zu lesen. Jede Genehmigung ist eine Qualitaetsbestaetigung
- **Nit-Flut**: Den Autor in Stilpraeferenzen ertraenken. Nits fuer Mentoring-Situationen aufsparen; bei zeitkritischen Reviews weglassen
- **Den Wald vor Baeumen nicht sehen**: Zeile fuer Zeile reviewen ohne das Gesamtdesign zu verstehen. Zuerst die PR-Beschreibung und den Commit-Verlauf lesen
- **Stil als Blocking**: Formatierung und Benennung sind fast nie blocking. Blocking fuer Bugs, Sicherheit und Datenintegritaet reservieren
- **Kein Lob**: Nur auf Probleme hinzuweisen ist demotivierend. Guter Code verdient Anerkennung
- **Review-Scope-Creep**: Code kommentieren, der nicht im PR geaendert wurde. Wenn vorhandene Probleme stoeren, ein separates Issue erstellen

## Verwandte Skills

- `review-software-architecture` — systemweites Architektur-Review (ergaenzend zum PR-Review)
- `security-audit-codebase` — eingehende Sicherheitsanalyse fuer PRs mit sicherheitsrelevanten Aenderungen
- `create-pull-request` — die andere Seite des Prozesses: PRs erstellen, die leicht zu reviewen sind
- `commit-changes` — saubere Commit-Geschichte erleichtert das PR-Review erheblich
