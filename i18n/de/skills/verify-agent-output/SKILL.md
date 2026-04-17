---
name: verify-agent-output
description: >
  Lieferergebnisse validieren und Belegnachweise aufbauen, wenn Arbeit
  zwischen Agenten uebergeben wird. Umfasst Erwartungsdefinition vor der
  Ausfuehrung, strukturierte Belegnachweise waehrend der Ausfuehrung,
  Lieferergebnis-Validierung gegen externe Anker nach der Ausfuehrung,
  Genauigkeitspruefungen fuer komprimierte oder zusammengefasste Ausgaben,
  Vertrauensgrenzklassifizierung und strukturierte Uneinigkeitsberichte
  bei Verifizierungsfehlern. Verwenden bei der Koordination von
  Multi-Agenten-Workflows, beim Pruefen agentenuebergreifender Uebergaben,
  bei der Erstellung extern ausgerichteter Ausgaben oder bei der Pruefung
  ob eine Agenten-Zusammenfassung ihr Quellmaterial treulich darstellt.
locale: de
source_locale: en
source_commit: acc252e6
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: verification, trust, evidence-trail, deliverable-validation, inter-agent, quality-assurance
---

# Agent-Ausgabe verifizieren

Verifizierbare Lieferung zwischen Agenten aufbauen. Wenn ein Agent Ausgaben erstellt, die ein anderer Agent konsumiert — oder auf die ein Mensch angewiesen ist — braucht die Uebergabe mehr als "sieht gut aus." Dieser Skill kodifiziert die Praxis, pruefbare Erwartungen zu definieren bevor Arbeit beginnt, Belege als Nebeneffekt der Arbeit zu generieren und Lieferergebnisse gegen externe Anker zu validieren statt durch Selbstbewertung. Das Kernprinzip: Treue kann nicht intern gemessen werden. Ein Agent kann seine eigene komprimierte Ausgabe nicht zuverlaessig verifizieren; Verifizierung erfordert einen externen Referenzpunkt.

## Wann verwenden

- Ein Multi-Agenten-Workflow uebergibt Lieferergebnisse von einem Agenten an einen anderen
- Ein Agent erstellt extern ausgerichtete Ausgaben (Berichte, Code, Deployments), auf die ein Mensch angewiesen sein wird
- Ein Agent fasst Daten zusammen, komprimiert oder transformiert sie, und die Zusammenfassung muss das Original treulich darstellen
- Ein Team-Koordinationsmuster erfordert strukturierte Uebergabe-Validierung zwischen Mitgliedern
- Vertrauensgrenzen muessen festgelegt werden — entscheiden was Verifizierung erfordert vs. was vertraut werden kann
- Ein Audit-Trail ist fuer Compliance oder Reproduzierbarkeit erforderlich

## Eingaben

- **Erforderlich**: Das zu verifizierende Lieferergebnis (Datei, Artefakt, Bericht oder strukturierte Ausgabe)
- **Erforderlich**: Die Erwartungsdefinition (wie "fertig" aussieht)
- **Optional**: Das Quellmaterial (fuer Genauigkeitspruefungen bei Zusammenfassungen oder Transformationen)
- **Optional**: Vertrauensgrenzklassifizierung (`cross-agent`, `external-facing`, `internal`)
- **Optional**: Verifizierungstiefe (`spot-check`, `full`, `sample-based`)

## Vorgehensweise

### Schritt 1: Erwartungsdefinition festlegen

Vor Ausfuehrungsbeginn aufschreiben, wie "fertig" aussieht — als Reihe konkreter, pruefbarer Bedingungen. Subjektive Kriterien ("gute Qualitaet") durch verifizierbare Aussagen ersetzen.

Kategorien pruefbarer Bedingungen:

- **Existenz**: Datei existiert unter Pfad, Endpunkt antwortet, Datensatz in Datenbank vorhanden
- **Form**: Ausgabe hat N Spalten, JSON entspricht Schema, Funktion hat erwartete Signatur
- **Inhalt**: Wert liegt im Bereich, Zeichenkette entspricht Muster, Liste enthaelt erforderliche Elemente
- **Verhalten**: Testpaket besteht, Befehl endet mit 0, API gibt erwarteten Statuscode zurueck
- **Konsistenz**: Ausgabe-Hash entspricht Eingabe-Hash, Zeilenanzahl nach Transformation erhalten, Summen stimmen

Beispiel-Spezifikation:

```yaml
expected_outcome:
  existence:
    - path: "output/report.html"
    - path: "output/data.csv"
  shape:
    - file: "output/data.csv"
      columns: ["id", "name", "score", "grade"]
      min_rows: 100
  content:
    - file: "output/data.csv"
      column: "score"
      range: [0, 100]
    - file: "output/report.html"
      contains: ["Summary", "Methodology", "Results"]
  behavior:
    - command: "Rscript -e 'testthat::test_dir(\"tests\")'"
      exit_code: 0
  consistency:
    - check: "row_count"
      source: "input/raw.csv"
      target: "output/data.csv"
      tolerance: 0
```

**Erwartet:** Eine schriftliche Spezifikation mit mindestens einer pruefbaren Bedingung pro Lieferergebnis. Jede Bedingung ist maschinell verifizierbar (kann durch ein Skript oder einen Befehl geprueft werden, nicht nur durch Lesen und Urteilen).

**Bei Fehler:** Wenn das erwartete Ergebnis nicht konkret formuliert werden kann, ist die Aufgabe selbst unzureichend spezifiziert. Die Aufgabendefinition hinterfragen, bevor fortgefahren wird — vage Erwartungen produzieren nicht verifizierbare Arbeit.

### Schritt 2: Belegnachweise waehrend der Ausfuehrung generieren

Waehrend die Arbeit voranschreitet, strukturierte Belege als Nebeneffekt der Arbeit ausgeben. Der Belegnachweis ist kein separater Verifizierungsschritt — er wird durch die Ausfuehrung selbst produziert.

Zu erfassende Belegtypen:

```yaml
evidence:
  timing:
    started_at: "2026-03-12T10:00:00Z"
    completed_at: "2026-03-12T10:04:32Z"
    duration_seconds: 272
  checksums:
    - file: "output/data.csv"
      sha256: "a1b2c3..."
    - file: "output/report.html"
      sha256: "d4e5f6..."
  test_results:
    total: 24
    passed: 24
    failed: 0
    skipped: 0
  diff_summary:
    files_changed: 3
    insertions: 47
    deletions: 12
  tool_versions:
    r: "4.5.2"
    testthat: "3.2.1"
```

Praktische Befehle zur Belege-Generierung:

```bash
# Pruefsummen
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# Zeilenanzahlen
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# Testergebnisse (R)
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Git-Diff-Zusammenfassung
git diff --stat HEAD~1 > evidence/diff_summary.txt

# Zeitmessung (eigentlichen Befehl einwickeln)
start_time=$(date +%s)
# ... Arbeit erledigen ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**Erwartet:** Ein `evidence/`-Verzeichnis (oder strukturiertes Log) mit mindestens Pruefsummen und Zeitmessung fuer jedes produzierte Artefakt. Belege werden als Teil der Arbeit generiert, nicht nachtraeglich rekonstruiert.

**Bei Fehler:** Wenn Belege-Generierung die Ausfuehrung stoert, so viel wie moeglich erfassen ohne die Arbeit zu blockieren. Mindestens Datei-Pruefsummen nach Abschluss aufzeichnen — das ermoeglicht spaetere Verifizierung, selbst wenn Echtzeit-Belege nicht erfasst wurden.

### Schritt 3: Lieferergebnisse gegen Erwartungen validieren

Nach der Ausfuehrung das Lieferergebnis gegen die Spezifikation aus Schritt 1 pruefen. Externe Anker verwenden — Testpakete, Schema-Validatoren, Pruefsummen, Zeilenanzahlen — statt den produzierenden Agenten zu fragen "Ist das korrekt?"

Validierungspruefungen nach Kategorie:

```bash
# Existenz
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "BESTANDEN: $file existiert" || echo "FEHLER: $file fehlt"
done

# Form (CSV-Spalten-Pruefung)
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "BESTANDEN: Spalten stimmen ueberein" || echo "FEHLER: Spaltenabweichung"

# Zeilenanzahl
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "BESTANDEN: $actual_rows Zeilen (>= 100 + Kopfzeile)" || echo "FEHLER: nur $actual_rows Zeilen"

# Inhaltsbereichspruefung (R)
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("BESTANDEN: alle Werte in [0, 100]\n")
'

# Verhalten
Rscript -e "testthat::test_dir('tests')" && echo "BESTANDEN: Tests bestehen" || echo "FEHLER: Tests scheitern"

# Konsistenz (Zeilenanzahl erhalten)
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "BESTANDEN: Zeilenanzahl erhalten" || echo "FEHLER: $input_rows -> $output_rows"
```

**Erwartet:** Alle Pruefungen bestehen. Ergebnisse werden als strukturierte Ausgabe (BESTANDEN/FEHLER pro Bedingung) zusammen mit dem Belegnachweis aus Schritt 2 aufgezeichnet.

**Bei Fehler:** Teilpruefungen nicht stillschweigend akzeptieren. Jedes FEHLER loest den strukturierten Uneinigkeitsprozess in Schritt 6 aus. Aufzeichnen, welche Pruefungen bestanden und welche scheiterten — Teilergebnisse sind weiterhin wertvolle Belege.

### Schritt 4: Genauigkeitspruefungen fuer komprimierte Ausgaben durchfuehren

Wenn ein Agent Daten zusammenfasst, komprimiert oder transformiert, ist die Ausgabe by design kleiner als die Eingabe. Eine Zusammenfassung kann nicht durch alleiniges Lesen der Zusammenfassung verifiziert werden — sie muss mit der Quelle verglichen werden. Stichprobenartige Pruefungen zur Genauigkeitspruefung verwenden.

Verfahren:

1. Eine Zufallsstichprobe aus dem Quellmaterial waehlen (3–5 Elemente fuer Stichpruefungen, 10 % fuer gruendliche Pruefungen)
2. Fuer jedes entnommene Element pruefen, ob es korrekt in der komprimierten Ausgabe dargestellt ist
3. Auf fabrizierte Inhalte pruefen — Elemente in der Ausgabe, die keine Quelle haben

```bash
# Beispiel: Zusammenfassungsbericht gegen Quelldaten pruefen

# 1. Zufaellige Zeilen aus Quelle waehlen
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. Fuer jede entnommene Zeile pruefen, ob sie korrekt in der Ausgabe erscheint
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "BESTANDEN: $id im Bericht gefunden" || echo "FEHLER: $id fehlt im Bericht"
done < /tmp/sample.csv

# 3. Auf fabrizierte IDs in der Ausgabe pruefen
# IDs aus Ausgabe extrahieren, jede auf Existenz in Quelle pruefen
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "BESTANDEN: $output_id hat Quelle" || echo "FEHLER: $output_id fabriziert"
done
```

Fuer Textzusammenfassungen, wo genaue Uebereinstimmung nicht moeglich ist, Schluesselbehautpungen pruefen:

- Zitierte Statistiken stimmen mit Quelldaten ueberein
- In der Zusammenfassung genannte Named Entities existieren in der Quelle
- Kausalaussagen oder Rankings werden durch die zugrundeliegenden Daten gestuetzt
- Keine Elemente erscheinen in der Zusammenfassung, die in der Quelle fehlen

**Erwartet:** Alle entnommenen Elemente sind korrekt dargestellt. Kein fabrizierter Inhalt erkannt. Schluessselstatistiken in der Zusammenfassung stimmen mit berechneten Werten aus der Quelle ueberein.

**Bei Fehler:** Wenn Genauigkeitspruefungen scheitern, kann der Zusammenfassung nicht vertraut werden. Die spezifischen Abweichungen im strukturierten Uneinigkeitsformat aus Schritt 6 berichten. Der produzierende Agent muss die Zusammenfassung aus der Quelle neu ableiten, nicht die vorhandene Ausgabe flicken.

### Schritt 5: Vertrauensgrenzen klassifizieren

Nicht alles bedarf der Verifizierung. Ueberpruefung ist selbst ein Kostenfaktor — sie verlangsamt die Ausfuehrung, erhoht die Komplexitaet und kann falsches Vertrauen in den Verifizierungsprozess selbst erzeugen. Ausgaben nach Vertrauensniveau klassifizieren, um den Verifizierungsaufwand zu fokussieren.

Vertrauensgrenzklassifizierung:

| Grenze | Verifizierung erforderlich | Beispiele |
|--------|--------------------------|----------|
| **Agentenuebergreifende Uebergabe** | Ja — immer | Agent A produziert Daten, die Agent B konsumiert; Teammitglied gibt Lieferergebnis an Leiter weiter |
| **Extern ausgerichtete Ausgabe** | Ja — immer | An Menschen gelieferte Berichte, deployeter Code, veroefffentlichte Pakete, API-Antworten |
| **Komprimiert/zusammengefasst** | Ja — stichprobenartig | Jede Ausgabe, die by design kleiner als ihre Eingabe ist (Zusammenfassungen, Aggregationen, Extrakte) |
| **Internes Zwischenergebnis** | Nein — mit Pruefsummen vertrauen | Temporaere Dateien, Zwischenberechnungsergebnisse, interner Zustand zwischen Schritten |
| **Idempotente Operationen** | Nein — einmal pruefen | Konfigurationsdateischreibvorgaenge, deterministische Transformationen, reine Funktionen mit bekannten Eingaben |

Verifizierung proportional anwenden:

- **Agentenuebergreifende Uebergaben**: Vollstaendige Validierung gegen Erwartungsdefinition (Schritt 3)
- **Extern ausgerichtete Ausgaben**: Vollstaendige Validierung plus Genauigkeitspruefungen falls zusammengefasst (Schritte 3–4)
- **Interne Zwischenergebnisse**: Nur Pruefsummen aufzeichnen (Schritt 2) — bei Bedarf pruefen wenn Nachgelagerte scheitern
- **Idempotente Operationen**: Bei erster Ausfuehrung pruefen, bei Wiederholung vertrauen

**Erwartet:** Jedes Lieferergebnis im Workflow ist in eine der Vertrauensgrenz-Kategorien klassifiziert. Verifizierungsaufwand konzentriert sich auf agentenuebergreifende und extern ausgerichtete Grenzen.

**Bei Fehler:** Im Zweifel verifizieren. Die Kosten falschen Vertrauens (schlechte Ausgabe akzeptieren) uebersteigen fast immer die Kosten unnoetig verschwendeter Verifizierung. Standard auf Verifizierung setzen und nur lockern, wenn Belege vorliegen, dass eine Grenze sicher ist.

### Schritt 6: Strukturierte Uneinigkeiten bei Fehler berichten

Wenn Verifizierung scheitert, eine strukturierte Uneinigkeit produzieren statt die Ausgabe stillschweigend zu akzeptieren oder stillschweigend abzulehnen. Eine strukturierte Uneinigkeit macht den Fehler handlungsrelevant — sie teilt dem produzierenden Agenten (oder dem Menschen) genau mit, was erwartet wurde, was empfangen wurde und wo die Luecke liegt.

Uneinigkeitsformat:

```yaml
verification_result: FAIL
deliverable: "output/data.csv"
timestamp: "2026-03-12T10:04:32Z"
failures:
  - check: "row_count"
    expected: 500
    actual: 487
    severity: warning
    note: "13 Zeilen entfernt — Filter-Logik untersuchen"
  - check: "score_range"
    expected: "[0, 100]"
    actual: "[-3, 100]"
    severity: error
    note: "3 negative Werte gefunden — Dateneingabevalidierung fehlt"
  - check: "column_presence"
    expected: "grade"
    actual: null
    severity: error
    note: "grade-Spalte fehlt in Ausgabe"
passes:
  - check: "file_exists"
  - check: "checksum_stable"
  - check: "test_suite"
recommendation: >
  Mit aktivierter Eingabevalidierung neu ausfuehren. Die score_range- und
  column_presence-Fehler deuten darauf hin, dass der Transformationsschritt
  Grenzfaelle nicht behandelt. Ausgabe nicht flicken — Transformation korrigieren
  und von Quelle neu ausfuehren.
```

Schluesselgrundsaetze fuer Uneinigkeitsberichte:

- **Spezifisch sein**: "3 negative Werte in Zeilen 42, 187, 301 gefunden" nicht "einige Werte sind falsch"
- **Sowohl Erwartet als auch Tatsaechlich einschliessen**: Die Luecke zwischen ihnen ist das Wesentliche
- **Schweregrad klassifizieren**: `error` (blockiert Akzeptanz), `warning` (mit Vorbehalt akzeptieren), `info` (zur Kenntnis genommen)
- **Aktion empfehlen**: Korrigieren-und-Neu-Ausfuehren vs. Mit-Vorbehalt-Akzeptieren vs. Direkt-Ablehnen
- **Nie stillschweigend akzeptieren**: Soziales Vertrauen ("der andere Agent hat gesagt es ist gut") ist ein Angriffvektor. Den Belegen vertrauen, nicht der Behauptung.

**Erwartet:** Jeder Verifizierungsfehler produziert eine strukturierte Uneinigkeit mit mindestens: der fehlgeschlagenen Pruefung, dem erwarteten Wert, dem tatsaechlichen Wert und einer Schweregradklassifizierung.

**Bei Fehler:** Wenn der Verifizierungsprozess selbst fehlschlaegt (z. B. das Validierungsskript gibt Fehler), das als Meta-Fehler berichten. Die Unmoeglichkeit zu verifizieren ist selbst ein Befund — es bedeutet, das Lieferergebnis ist in seiner aktuellen Form nicht verifizierbar, was schlimmer als ein bekannter Fehler ist.

## Validierung

- [ ] Erwartungsdefinition existiert vor Ausfuehrungsbeginn
- [ ] Spezifikation enthaelt nur maschinell verifizierbare Bedingungen (keine subjektiven Kriterien)
- [ ] Belegnachweis wird waehrend der Ausfuehrung generiert (Pruefsummen, Zeitmessung, Testergebnisse)
- [ ] Belege sind ein Nebeneffekt der Arbeit, kein separater nachtraeglicher Schritt
- [ ] Lieferergebnisse werden gegen externe Anker validiert (Tests, Schemas, Pruefsummen)
- [ ] Kein Lieferergebnis wird verifiziert, indem sein Produzent "Ist das korrekt?" gefragt wird
- [ ] Komprimierte oder zusammengefasste Ausgaben umfassen stichprobenartige Genauigkeitspruefungen
- [ ] Genauigkeitspruefungen vergleichen mit Quellmaterial, nicht mit der Zusammenfassung selbst
- [ ] Vertrauensgrenzen sind klassifiziert (agentenuebergreifend, extern, intern)
- [ ] Verifizierungsaufwand ist proportional zur Vertrauensgrenz-Schwere
- [ ] Verifizierungsfehler produzieren strukturierte Uneinigkeiten (erwartet vs. tatsaechlich)
- [ ] Kein Verifizierungsfehler wird stillschweigend akzeptiert oder stillschweigend abgelehnt

## Haeufige Stolperfallen

- **Ausgabe durch Befragung des Produzenten verifizieren**: Ein Agent kann seine eigene Arbeit nicht zuverlaessig verifizieren. "Ich habe es geprueft und es sieht korrekt aus" ist keine Verifizierung — externe Anker (Tests, Pruefsummen, Schemas) sind Verifizierung. Wie rtamind beobachtet: Treue kann nicht intern gemessen werden.
- **Interne Zwischenergebnisse ueberprufen**: Jede temporaere Datei und jedes Zwischenergebnis zu verifizieren erhoht den Aufwand ohne die Zuverlaessigkeit zu verbessern. Vertrauensgrenzen klassifizieren (Schritt 5) und Verifizierung auf agentenuebergreifende und extern ausgerichtete Ausgaben konzentrieren.
- **Subjektive Erwartungsdefinitionen**: "Der Bericht sollte von hoher Qualitaet sein" ist nicht pruefbar. "Der Bericht enthaelt Abschnitte Zusammenfassung, Methodik und Ergebnisse, und alle zitierten Statistiken stimmen mit berechneten Werten aus der Quelle ueberein" ist pruefbar.
- **Nachttraegliche Belege-Rekonstruktion**: Belege nachtraeglich zu generieren ("lass mich die Pruefsumme berechnen von dem, was ich glaube produziert zu haben") ist unzuverlaessig. Belege muessen ein Nebeneffekt der Ausfuehrung sein, in Echtzeit erfasst.
- **Verifizierung als unfehlbar behandeln**: Verifizierung selbst kann Fehler haben. Ein bestehendes Testpaket bedeutet nicht, dass der Code korrekt ist — es bedeutet, dass der Code die Tests erfuellt.
- **Teilpruefungen stillschweigend akzeptieren**: Wenn 9 von 10 Pruefungen bestehen, scheitert das Lieferergebnis immer noch. Den einen Fehler als strukturierte Uneinigkeit berichten. Teilpunkte sind fuer Benotung; Lieferung ist binaer.
- **Soziales Vertrauen als Ersatz**: "Agent A ist zuverlaessig, also ueberspringe ich die Verifizierung" ist ein Angriffvektor. Wie Sentinel_Orol bemerkt, ist Vertrauen ohne Verifizierung ausnutzbar. Basierend auf der Grenzklassifizierung verifizieren, nicht auf dem Ruf des Produzenten.

- **Falsches R-Binary auf Hybrid-Systemen**: Unter WSL oder Docker kann `Rscript` einen plattformuebergreifenden Wrapper statt nativem R aufloesen. Mit `which Rscript && Rscript --version` pruefen. Das native R-Binary bevorzugen (z.B. `/usr/local/bin/Rscript` unter Linux/WSL) fuer Zuverlaessigkeit. Fuer die R-Pfadkonfiguration siehe [Setting Up Your Environment](../../guides/setting-up-your-environment.md).

## Verwandte Skills

- `fail-early-pattern` — komplementaer: fail-early faengt schlechte Eingaben am Anfang ab; verify-agent-output faengt schlechte Ausgaben am Ende ab
- `security-audit-codebase` — ueberlappende Bedenken: Sicherheitsaudits pruefen, ob Code Sicherheitserwartungen erfuellt, ein spezifischer Fall von Lieferergebnis-Validierung
- `honesty-humility` — komplementaer: ehrliche Agenten erkennen Unsicherheit an und machen Verifizierungsluecken sichtbar statt sie zu verbergen
- `review-skill-format` — verify-agent-output kann pruefen, ob eine produzierte SKILL.md Formatanforderungen erfuellt, eine konkrete Instanz von Lieferergebnis-Validierung
- `create-team` — Teams, die mehrere Agenten koordinieren, profitieren von strukturierter Uebergabe-Validierung bei jedem Koordinationsschritt
- `test-team-coordination` — prueft ob Team-Uebergaben verifizierbare Lieferergebnisse produzieren, und uebst damit die Verfahren dieses Skills von Ende zu Ende
