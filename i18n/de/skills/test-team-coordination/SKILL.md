---
name: test-team-coordination
description: >
  Fuehrt ein Testszenario gegen ein Team aus, beobachtet Koordinationsmuster-
  Verhaltensweisen, bewertet Akzeptanzkriterien und erzeugt eine strukturierte
  RESULT.md. Verwenden bei der Validierung, dass ein Koordinationsmuster eines
  Teams die erwarteten Verhaltensweisen waehrend einer realistischen Aufgabe
  zeigt, beim Vergleich von Koordinationsmustern bei aequivalenten Arbeitslasten
  oder bei der Einrichtung von Basislinie-Leistungswerten fuer eine
  Teamzusammensetzung.
locale: de
source_locale: en
source_commit: befb7ac1 # stale — source updated for teams infrastructure fix
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: review, testing, teams, coordination, validation
---

# Team-Koordination testen

Ein Testszenario aus `tests/scenarios/teams/` gegen das Zielteam ausfuehren.
Koordinationsmuster-Verhaltensweisen beobachten, Akzeptanzkriterien bewerten,
das Rubrik-Ergebnis ermitteln und eine `RESULT.md` in `tests/results/` erzeugen.

## Wann verwenden

- Validierung, dass das Koordinationsmuster eines Teams erwartete Verhaltensweisen zeigt
- Ausfuehren eines strukturierten Tests nach Aenderung einer Team-Definition oder eines Agents
- Vergleich von Koordinationsmustern durch Ausfuehren desselben Szenarios mit verschiedenen Teams
- Einrichten von Basislinie-Leistungsmetriken fuer eine Teamzusammensetzung
- Regressions-Tests nach Hinzufuegen neuer Agents oder Aenderung der Team-Mitgliedschaft

## Eingaben

- **Erforderlich**: Pfad zur Testszenario-Datei (z. B. `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`)
- **Optional**: Ausfuehrungs-ID-Ueberschreibung (Standard: `YYYY-MM-DD-<target>-NNN` automatisch generiert)
- **Optional**: Team-Groessen-Ueberschreibung (Standard: aus Szenario-Frontmatter)
- **Optional**: Umfangsaenderung ueberspringen (Standard: false — Umfangsaenderung injizieren wenn definiert)

## Vorgehensweise

### Schritt 1: Testszenario laden und validieren

1.1. Die im Input angegebene Testszenario-Datei lesen.

1.2. YAML-Frontmatter parsen und extrahieren:
   - `target` — das zu testende Team
   - `coordination-pattern` — das erwartete Muster
   - `team-size` — Anzahl der zu startenden Mitglieder
   - Akzeptanzkriterien-Tabelle
   - Bewertungsrubrik (falls vorhanden)
   - Ground-Truth-Daten (falls vorhanden)

1.3. Verifizieren, dass die Szenario-Datei alle erforderlichen Abschnitte hat:
   - Objective (Ziel)
   - Pre-conditions (Vorbedingungen)
   - Task (mit Primary-Task-Unterabschnitt)
   - Expected Behaviors (Erwartete Verhaltensweisen)
   - Acceptance Criteria (Akzeptanzkriterien)
   - Observation Protocol (Beobachtungsprotokoll)

**Erwartet:** Szenario-Datei laed, wird geparst und enthaelt alle erforderlichen Abschnitte.

**Bei Fehler:** Wenn die Datei fehlt oder nicht parsebar ist, mit einer Fehlermeldung abbrechen, die die fehlende Datei oder den fehlerhaften Abschnitt identifiziert. Wenn optionale Abschnitte (Rubrik, Ground Truth, Varianten) fehlen, deren Fehlen vermerken und fortfahren.

### Schritt 2: Vorbedingungen verifizieren

2.1. Jede Vorbedingungs-Checkbox im Szenario durchgehen.

2.2. Fuer Datei-Existenz-Pruefungen Glob zur Verifizierung verwenden.

2.3. Fuer Registry-Anzahl-Pruefungen die relevante `_registry.yml` parsen und `total_*` gegen tatsaechliche Dateianzahlen auf dem Datentraeger vergleichen.

2.4. Fuer Branch-/Git-Zustand-Pruefungen `git status --porcelain` und `git branch --show-current` ausfuehren.

**Erwartet:** Alle Vorbedingungen sind erfuellt.

**Bei Fehler:** Wenn eine Vorbedingung fehlschlaegt, als BLOCKED in den Ergebnissen festhalten. Entscheiden ob fortgefahren werden soll (weiche Vorbedingung) oder abgebrochen werden soll (harte Vorbedingung wie fehlende Ziel-Team-Datei). Die Entscheidung dokumentieren.

### Schritt 3: Koordinationsmuster-Kriterien laden

3.1. `tests/_registry.yml` lesen und den `coordination_patterns`-Eintrag finden, der dem `coordination-pattern`-Wert des Szenarios entspricht.

3.2. Die `key_behaviors`-Liste fuer dieses Muster extrahieren.

3.3. Diese Verhaltensweisen werden zur Beobachtungs-Checkliste — jede muss waehrend der Ausfuehrung beobachtet und als beobachtet/nicht beobachtet festgehalten werden.

**Erwartet:** Muster-Schluesselverhaltensweisen geladen und bereit zur Beobachtung.

**Bei Fehler:** Wenn das Koordinationsmuster nicht in der Registry definiert ist, den Abschnitt Expected Behaviors des Szenarios als alleinige Beobachtungsquelle verwenden. Eine Warnung protokollieren.

### Schritt 4: Aufgabe ausfuehren

4.1. Das Ergebnisverzeichnis erstellen: `tests/results/YYYY-MM-DD-<target>-NNN/`.

4.2. T0 (Aufgaben-Startzeit) festhalten.

4.3. Das Zielteam mit TeamCreate und der Team-Groesse aus dem Szenario starten. Den Primary-Task-Prompt wortwortlich aus dem Task-Abschnitt des Szenarios uebergeben.

4.4. Die Ausfuehrungsphasen des Teams beobachten. Zeitstempel festhalten fuer:
   - T1: Formausschreibung / Aufgabenzerlegung abgeschlossen
   - T2: Rollenzuweisungen sichtbar

4.5. Wenn das Szenario einen Scope-Change-Trigger definiert und skip-scope-change false ist:
   - Warten bis Phase 2 (Rollenzuweisung) sichtbar ist
   - T3 (Zeitstempel der Umfangsaenderungs-Injektion) festhalten
   - Den Umfangsaenderungs-Prompt per SendMessage an das Team senden
   - T4 (Umfangsaenderung absorbiert — Rollenanpassung sichtbar) festhalten

4.6. Beobachtung fortsetzen bis das Team seine Ausgabe liefert.
   - T5 (Integration beginnt) festhalten
   - T6 (Abschlussbericht geliefert) festhalten

4.7. Die vollstaendige Ausgabe des Teams erfassen.

**Erwartet:** Team fuehrt die Aufgabe durch seine Koordinationsmuster-Phasen aus. Zeitstempel fuer alle Uebergaenge festgehalten. Umfangsaenderung (falls zutreffend) injiziert und absorbiert.

**Bei Fehler:** Wenn das Team keine Ausgabe erzeugt, den Fehlerpunkt und alle Fehlermeldungen festhalten. Wenn das Team ins Stocken geraet, die zuletzt beobachtete Phase und Zeitueberschreitung vermerken. Mit partiellen Ergebnissen zur Bewertung fortfahren.

### Schritt 5: Muster-Verhaltensweisen bewerten

5.1. Fuer jede Schluesselverhalten aus Schritt 3 bestimmen, ob sie waehrend der Ausfuehrung beobachtet wurde:
   - **Beobachtet**: Klare Beweise in Ausgabe oder Koordination des Teams
   - **Teilweise**: Einige Beweise, aber unvollstaendig oder mehrdeutig
   - **Nicht beobachtet**: Kein Nachweis

5.2. Fuer jedes aufgabenspezifische Verhalten aus dem Expected-Behaviors-Abschnitt des Szenarios dieselbe Bewertung anwenden.

5.3. Befunde im Beobachtungsprotokoll festhalten.

**Erwartet:** Alle oder die meisten muster- und aufgabenspezifischen Verhaltensweisen werden beobachtet.

**Bei Fehler:** Nicht beobachtete Verhaltensweisen sind Befunde, keine Fehler des Test-Verfahrens. Sie genau festhalten — sie zeigen an, dass das Koordinationsmuster sich nicht vollstaendig manifestiert hat.

### Schritt 6: Akzeptanzkriterien bewerten

6.1. Jedes Akzeptanzkriterium aus dem Szenario durchgehen.

6.2. Fuer jedes Kriterium eine Bestimmung zuweisen:
   - **PASS**: Kriterium klar erfuellt mit beobachtbaren Nachweisen
   - **PARTIAL**: Kriterium teilweise erfuellt (zaehlt mit 0,5-Gewichtung zum Schwellenwert)
   - **FAIL**: Kriterium nicht erfuellt trotz Gelegenheit
   - **BLOCKED**: Konnte nicht bewertet werden (Vorbedingungsversagen, Team-Zeitueberschreitung usw.)

6.3. Wenn das Szenario Ground-Truth-Daten enthaelt, gemeldete Befunde dagegen verifizieren:
   - Genauigkeitsprozentsaetze pro Kategorie berechnen
   - Falsch-Positive und Falsch-Negative markieren

6.4. Wenn das Szenario eine Bewertungsrubrik enthaelt, jede Dimension 1-5 mit kurzer Begruendung bewerten.

6.5. Zusammenfassungsmetriken berechnen:
   - Akzeptanz: X/N Kriterien bestanden (PARTIAL zaehlt als 0,5)
   - Schwellenwert: PASS wenn >= im Szenario definierter Schwellenwert
   - Rubrik-Gesamt: X/Y Punkte (falls zutreffend)

**Erwartet:** Alle Akzeptanzkriterien haben eine Bestimmung. Zusammenfassungsmetriken sind berechnet.

**Bei Fehler:** Wenn weniger als die Haelfte der Kriterien bewertet werden kann (zu viele BLOCKED), ist der Testlauf nicht schlussfolgerungsfaehig. Dokumentieren warum und erneuten Durchlauf nach Beheben der Vorbedingungen empfehlen.

### Schritt 7: RESULT.md erzeugen

7.1. `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md` mit der Aufzeichnungsvorlage aus dem Beobachtungsprotokoll des Szenarios erstellen.

7.2. Alle Abschnitte befuellen:
   - Ausfuehrungs-Metadaten (Beobachter, Zeitstempel, Dauer)
   - Phasenprotokoll mit allen festgehaltenen Zeitstempeln
   - Rollenentstehungs-Protokoll (fuer adaptive/Team-Tests)
   - Ergebnistabelle der Akzeptanzkriterien
   - Rubrik-Punkte-Tabelle (falls zutreffend)
   - Ground-Truth-Verifikationstabelle (falls zutreffend)
   - Schluessbeobachtungen (narrativ)
   - Gelernte Lektionen

7.3. Die Rohausgabe des Teams als Anhang oder in einer separaten Datei (`team-output.md`) im selben Ergebnisverzeichnis einschliessen.

7.4. Zusammenfassungs-Urteil oben hinzufuegen:
   ```
   **Urteil**: PASS | FAIL | INCONCLUSIVE
   **Ergebnis**: X/N Kriterien (Y/Z Rubrik-Punkte)
   **Dauer**: Xm
   ```

**Erwartet:** Vollstaendige RESULT.md mit allen befuellten Abschnitten und einem klaren Urteil.

**Bei Fehler:** Wenn die Ergebnisdatei nicht geschrieben werden kann, die Ergebnisse als Fallback nach stdout ausgeben. Die Bewertungsdaten sollten niemals verloren gehen.

## Validierung

- [ ] Testszenario-Datei geladen und alle erforderlichen Abschnitte vorhanden
- [ ] Vorbedingungen verifiziert (oder als BLOCKED dokumentiert)
- [ ] Koordinationsmuster-Schluesselverhaltensweisen aus der Registry geladen
- [ ] Team gestartet und Aufgabe zugestellt
- [ ] Umfangsaenderung zum richtigen Zeitpunkt injiziert (falls zutreffend)
- [ ] Alle musterspezifischen Verhaltensweisen bewertet (beobachtet/teilweise/nicht beobachtet)
- [ ] Alle Akzeptanzkriterien haben eine Bestimmung (PASS/PARTIAL/FAIL/BLOCKED)
- [ ] Ground-Truth-Verifikation abgeschlossen (falls zutreffend)
- [ ] RESULT.md mit allen befuellten Abschnitten erzeugt
- [ ] Zusammenfassungs-Urteil berechnet und festgehalten

## Haeufige Stolperfallen

- **Ausgabequalitaet statt Koordination bewerten**: Dieser Skill testet *wie das Team koordiniert*, nicht ob die Aufgabenausgabe perfekt ist. Ein Team, das gut koordiniert, aber nur 7/9 defekte Referenzen findet, demonstriert trotzdem das Muster.
- **Umfangsaenderung zu frueh injizieren**: Warten, bis Rollenzuweisung klar sichtbar ist, bevor die Umfangsaenderung injiziert wird. Zu frueh bedeutet, dass das Team sich noch nicht differenziert hat, daher gibt es nichts anzupassen.
- **Team-Mitglieder-Ausgabe mit Team-Ausgabe verwechseln**: Das opake Team sollte eine einheitliche Ausgabe praesentieren. Wenn individuelle Mitglieder-Berichte zu sehen sind, ist das ein Befund ueber Opazitaet, kein Test-Infrastruktur-Problem.
- **Exaktes Ground-Truth-Matching**: Ground-Truth-Zaehlen sind ungefaehr. Bewerten, ob Befunde in der richtigen Groessenordnung sind, nicht ob sie exakt uebereinstimmen.
- **Zeitstempel nicht festhalten**: Zeitstempel sind fuer die Messung von Phasendauern und Anpassungsgeschwindigkeit unverzichtbar. Sie als Ereignisse festhalten, nicht rueckwirkend.

## Verwandte Skills

- `review-codebase` — eingehender Codebasis-Review, der Team-Level-Tests ergaenzt
- `review-skill-format` — validiert individuelles Skill-Format (dieser Skill validiert Team-Koordination)
- `create-team` — erstellt Team-Definitionen, die dieser Skill testet
- `evolve-team` — entwickelt Team-Definitionen basierend auf Testergebnissen weiter
- `test-a2a-interop` — aehnliches Testmuster fuer A2A-Protokoll-Konformanz
- `assess-form` — die morphische Bewertung, die der opake Team-Lead intern verwendet
