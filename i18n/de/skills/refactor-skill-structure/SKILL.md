---
name: refactor-skill-structure
description: >
  Refaktoriert eine zu lange oder schlecht strukturierte SKILL.md durch Auslagern
  von Beispielen in references/EXAMPLES.md, Aufteilen zusammengesetzter Prozeduren
  und Neuorganisation der Abschnitte fuer progressive Offenlegung. Verwenden wenn
  ein Skill das 500-Zeilen-CI-Limit ueberschreitet, wenn Code-Bloecke den
  Skill-Koerper dominieren, wenn ein Prozedurschritt mehrere unzusammenhaengende
  Operationen enthaelt oder wenn eine Inhaltsaktualisierung den Skill ueber das
  Zeilenlimit geschoben hat.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# Skill-Struktur refaktorieren

Eine SKILL.md refaktorieren, die das 500-Zeilen-Limit ueberschritten hat oder strukturelle Probleme entwickelt hat. Dieser Skill lagert erweiterte Code-Beispiele in `references/EXAMPLES.md` aus, teilt zusammengesetzte Prozeduren in fokussierte Teilprozeduren auf, fuegt Querverweise fuer progressive Offenlegung hinzu und verifiziert, dass der Skill nach der Umstrukturierung vollstaendig und gueltig bleibt.

## Wann verwenden

- Ein Skill ueberschreitet das von CI erzwungene 500-Zeilen-Limit
- Ein einzelner Prozedurschritt enthaelt mehrere unzusammenhaengende Operationen, die separate Schritte sein sollten
- Code-Bloecke laenger als 15 Zeilen dominieren die SKILL.md und koennten ausgelagert werden
- Der Skill hat ad-hoc-Abschnitte angesammelt, die die standardmaessige Sechsabschnittsstruktur durchbrechen
- Nach einer Inhaltsaktualisierung, die den Skill ueber das Zeilenlimit geschoben hat
- Ein Skill-Review hat strukturelle Probleme markiert, die ueber Inhaltsqualitaet hinausgehen

## Eingaben

- **Erforderlich**: Pfad zur zu refaktorierenden SKILL.md-Datei
- **Optional**: Ziel-Zeilenzahl (Standard: 80% des 500-Zeilen-Limits anstreben, d. h. ~400 Zeilen)
- **Optional**: Ob `references/EXAMPLES.md` erstellt werden soll (Standard: ja, wenn auslagerbare Inhalte vorhanden)
- **Optional**: Ob in mehrere Skills aufgeteilt werden soll (Standard: nein, Auslagerung bevorzugen)

## Vorgehensweise

### Schritt 1: Aktuelle Zeilenzahl messen und Quellen der Aufblaehung identifizieren

Den Skill lesen und ein abschnittsbezogenes Zeilenbudget erstellen, um zu identifizieren, wo die Aufblaehung liegt.

```bash
# Gesamte Zeilenzahl
wc -l < skills/<skill-name>/SKILL.md

# Zeilenzahl pro Abschnitt (ungefaehr)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

Aufblaehungs-Quellen klassifizieren:
- **Auslagerbar**: Code-Bloecke mit mehr als 15 Zeilen, vollstaendige Konfigurationsbeispiele, Multi-Varianten-Beispiele
- **Teilbar**: Zusammengesetzte Prozedurschritte, die 2+ unzusammenhaengende Operationen ausfuehren
- **Kuerzbar**: Redundante Erklaerungen, uebermaeissig ausfuehrliche Kontextsaetze
- **Strukturell**: Ad-hoc-Abschnitte nicht in der standardmaessigen Sechsabschnittsstruktur

**Erwartet:** Ein Zeilenbudget, das zeigt, welche Abschnitte ueberdimensioniert sind und welche Aufblaehungskategorie auf jeden zutrifft. Die groessten Abschnitte sind die primaeren Refaktorierungsziele.

**Bei Fehler:** Wenn der Skill unter 500 Zeilen ist und keine strukturellen Probleme erkennbar sind, wird dieser Skill moeglicherweise nicht benoetigt. Die Refaktorierungsanfrage vor dem Fortfahren begruenden.

### Schritt 2: Code-Bloecke in references/EXAMPLES.md auslagern

Code-Bloecke laenger als 15 Zeilen in eine `references/EXAMPLES.md`-Datei verschieben, kurze Inline-Snippets (3-10 Zeilen) in der Haupt-SKILL.md belassen.

1. References-Verzeichnis erstellen:
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. Fuer jeden auslagerungswuerdigen Code-Block:
   - Vollstaendigen Code-Block unter einer beschreibenden Ueberschrift nach `references/EXAMPLES.md` kopieren
   - Code-Block in SKILL.md durch ein kurzes 3-5-zeiliges Snippet ersetzen
   - Querverweis hinzufuegen: `Vollstaendige Konfiguration in [EXAMPLES.md](references/EXAMPLES.md#ueberschrift) einsehen.`

3. `references/EXAMPLES.md` mit klaren Ueberschriften strukturieren:
   ```markdown
   # Beispiele

   ## Beispiel 1: Vollstaendige Konfiguration

   Vollstaendige Konfigurationsdatei fuer [Kontext]:

   \```yaml
   # ... vollstaendige Konfiguration hier ...
   \```

   ## Beispiel 2: Multi-Varianten-Setup

   ### Variante A: Entwicklung
   \```yaml
   # ... Entwicklungskonfiguration ...
   \```

   ### Variante B: Produktion
   \```yaml
   # ... Produktionskonfiguration ...
   \```
   ```

**Erwartet:** Alle Code-Bloecke mit mehr als 15 Zeilen ausgelagert. Die Haupt-SKILL.md behaelt kurze Inline-Snippets fuer Lesbarkeit. Querverweise verlinken auf den ausgelagerten Inhalt. `references/EXAMPLES.md` ist gut organisiert mit beschreibenden Ueberschriften.

**Bei Fehler:** Wenn das Auslagern von Code-Bloecken die Zeilenzahl nicht ausreichend reduziert (noch ueber 500), zu Schritt 3 fuer Prozeduraufteilung fortfahren. Wenn der Skill sehr wenige Code-Bloecke hat (z. B. ein natuerlichsprachlicher Skill), stattdessen auf Schritte 3 und 4 konzentrieren.

### Schritt 3: Zusammengesetzte Prozeduren in fokussierte Schritte aufteilen

Prozedurschritte identifizieren, die mehrere unzusammenhaengende Operationen ausfuehren, und sie aufteilen.

Anzeichen fuer einen zusammengesetzten Schritt:
- Der Schritttitel enthaelt "und" (z. B. "Datenbank konfigurieren und Caching einrichten")
- Der Schritt hat mehrere Expected/On-failure-Bloecke (oder sollte sie haben)
- Der Schritt ist laenger als 30 Zeilen
- Der Schritt koennte in anderer Reihenfolge als seine Teilschritte uebersprungen oder ausgefuehrt werden

Fuer jeden zusammengesetzten Schritt:
1. Die distincten Operationen innerhalb des Schritts identifizieren
2. Fuer jede Operation einen neuen `### Schritt N:` erstellen
3. Nachfolgende Schritte neu nummerieren
4. Sicherstellen, dass jeder neue Schritt eigene Expected- und On-failure-Bloecke hat
5. Uebergangkontext zwischen neuen Schritten hinzufuegen

**Erwartet:** Jeder Prozedurschritt tut eine Sache. Kein Schritt ueberschreitet 30 Zeilen. Die Schrittanzahl kann zunehmen, aber jeder Schritt ist unabhaengig verifizierbar.

**Bei Fehler:** Wenn das Aufteilen eines Schritts zu zu feingranularen Schritten fuehrt (z. B. 20+ Gesamtschritte), verwandte Mikroschritte unter einem einzigen Schritt mit nummerierten Teilschritten gruppieren. Der Suessbereich liegt bei 5-12 Prozedurschritten.

### Schritt 4: Querverweise von SKILL.md zu ausgelagertem Inhalt hinzufuegen

Sicherstellen, dass die Haupt-SKILL.md nach der Auslagerung lesbar und auffindbar bleibt.

Fuer jede Auslagerung:
1. Das Inline-Snippet in SKILL.md sollte fuer den haeufigen Fall eigenstaendig sein
2. Der Querverweis sollte erklaeren, welche zusaetzlichen Inhalte verfuegbar sind
3. Relative Pfade verwenden: `[EXAMPLES.md](references/EXAMPLES.md#abschnitts-anker)`

Querverweis-Muster:
- Nach einem kurzen Code-Snippet: `Vollstaendige Konfiguration mit allen Optionen in [EXAMPLES.md](references/EXAMPLES.md#full-configuration) einsehen.`
- Fuer Multi-Varianten-Beispiele: `Entwicklungs-, Staging- und Produktionsvarianten in [EXAMPLES.md](references/EXAMPLES.md#variants) einsehen.`
- Fuer erweiterte Fehlerbehebung: `Weitere Fehlerszenarien in [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) einsehen.`

**Erwartet:** Jede Auslagerung hat einen entsprechenden Querverweis. Ein Leser kann der Haupt-SKILL.md fuer den haeufigen Fall folgen und fuer Details in die Referenzen eintauchen.

**Bei Fehler:** Wenn Querverweise den Textfluss unhandlich machen, mehrere Verweise in einen einzelnen Hinweis am Ende des Prozedurschritts konsolidieren: `Fuer erweiterte Beispiele einschliesslich [X], [Y] und [Z] siehe [EXAMPLES.md](references/EXAMPLES.md).`

### Schritt 5: Zeilenzahl nach Refaktorierung verifizieren

Die SKILL.md-Zeilenzahl nach allen Aenderungen neu messen.

```bash
# Haupt-SKILL.md pruefen
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines Zeilen)" || echo "SKILL.md: NOCH DRÜBER ($lines Zeilen)"

# References-Datei pruefen falls erstellt
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines Zeilen"
fi

# Gesamter Inhalt
echo "Gesamter Inhalt: $((lines + ${ref_lines:-0})) Zeilen"
```

**Erwartet:** SKILL.md ist unter 500 Zeilen. Idealerweise unter 400 Zeilen, um Raum fuer zukuenftiges Wachstum zu lassen. Fuer `references/EXAMPLES.md` gibt es kein Zeilenlimit.

**Bei Fehler:** Wenn nach Auslagerung und Aufteilung noch ueber 500 Zeilen, erwaegen, ob der Skill in zwei separate Skills zerlegt werden sollte. Ein Skill, der zu viel abdeckt, ist ein Zeichen von Scope-Creep. `create-skill` verwenden, um den zweiten Skill zu erstellen, und Related-Skills-Querverweise in beiden aktualisieren.

### Schritt 6: Alle Abschnitte noch vorhanden validieren

Nach der Refaktorierung verifizieren, dass der Skill noch alle erforderlichen Abschnitte hat und das Frontmatter intakt ist.

Die `review-skill-format`-Checkliste ausfuehren:
1. YAML-Frontmatter wird korrekt geparst
2. Alle sechs erforderlichen Abschnitte vorhanden (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
3. Jeder Prozedurschritt hat Expected- und On-failure-Bloecke
4. Keine verwaisten Querverweise (alle Links loesen sich auf)

```bash
# Schnelle Abschnitts-Pruefung
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: FEHLT"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: FEHLT"
```

**Erwartet:** Alle Abschnitte vorhanden. Kein Inhalt wurde bei der Auslagerung versehentlich geloescht. Querverweise in SKILL.md loesen sich zu tatsaechlichen Ueberschriften in EXAMPLES.md auf.

**Bei Fehler:** Wenn ein Abschnitt versehentlich entfernt wurde, ihn aus dem Git-Verlauf wiederherstellen: `git diff skills/<skill-name>/SKILL.md`, um zu sehen, was sich geaendert hat. Wenn Querverweise defekt sind, Ueberschriften-Anker in EXAMPLES.md gegen die Links in SKILL.md verifizieren (GitHub Flavored Markdown Anker-Regeln: Kleinbuchstaben, Bindestriche fuer Leerzeichen, Interpunktion entfernen).

## Validierung

- [ ] SKILL.md-Zeilenzahl betraegt 500 oder weniger
- [ ] Alle Code-Bloecke in SKILL.md sind 15 Zeilen oder weniger
- [ ] Ausgelagerter Inhalt ist in `references/EXAMPLES.md` mit beschreibenden Ueberschriften
- [ ] Jede Auslagerung hat einen Querverweis in der Haupt-SKILL.md
- [ ] Keine zusammengesetzten Prozedurschritte verbleiben (jeder Schritt tut eine Sache)
- [ ] Alle sechs erforderlichen Abschnitte sind nach der Refaktorierung vorhanden
- [ ] Jeder Prozedurschritt hat **Expected:**- und **On failure:**-Bloecke
- [ ] YAML-Frontmatter ist intakt und parsebar
- [ ] Querverweis-Links loesen sich zu tatsaechlichen Ueberschriften in EXAMPLES.md auf
- [ ] `review-skill-format`-Validierung besteht auf dem refaktorisierten Skill

## Haeufige Stolperfallen

- **Zu aggressiv auslagern**: Alles in Referenzen zu verschieben macht die Haupt-SKILL.md unlesbar. Inline 3-10-Zeilen-Snippets fuer den haeufigen Fall behalten. Nur Bloecke auslagern, die mehr als 15 Zeilen haben oder mehrere Varianten zeigen.
- **Defekte Anker-Links**: GitHub Flavored Markdown Anker sind in manchen Renderern gross-/kleinschreibungsempfindlich. Kleinbuchstaben-Ueberschriften in EXAMPLES.md verwenden und in Querverweisen exakt uebereinstimmen. Mit `grep -c "ueberschrift-text" references/EXAMPLES.md` testen.
- **Expected/On failure beim Aufteilen verlieren**: Beim Aufteilen zusammengesetzter Schritte sicherstellen, dass jeder neue Schritt eigene Expected- und On-failure-Bloecke bekommt. Es ist leicht, nach einer Aufteilung einen Schritt ohne diese Bloecke zu lassen.
- **Zu viele winzige Schritte erstellen**: Das Aufteilen sollte 5-12 Prozedurschritte ergeben. Bei 15+ wurde zu aggressiv aufgeteilt. Verwandte Mikroschritte zu logischen Gruppen zurueckfuehren.
- **EXAMPLES.md-Ueberschriften-Aktualisierungen vergessen**: Wenn ein Abschnitt in EXAMPLES.md umbenannt wird, muessen alle Querverweis-Anker in SKILL.md aktualisiert werden. Den alten Ankernamen suchen, um alle Referenzen zu finden.

## Verwandte Skills

- `review-skill-format` — Formatvalidierung nach der Refaktorierung ausfuehren, um zu bestaetigen, dass der Skill noch konform ist
- `update-skill-content` — Inhaltsaktualisierungen sind haeufig der Ausloser fuer strukturelle Refaktorierung, wenn sie einen Skill ueber das Zeilenlimit schieben
- `create-skill` — Die kanonische Struktur referenzieren, wenn entschieden wird, wie ausgelagerter Inhalt organisiert wird
- `evolve-skill` — Wenn ein Skill in zwei separate Skills aufgeteilt werden muss, Evolution verwenden, um den abgeleiteten Skill zu erstellen
