---
name: manage-memory
description: >
  Organisiert, extrahiert, bereinigt und verifiziert persistente Speicherdateien
  von Claude Code. Behandelt MEMORY.md als kompakten Index, die Extraktion von
  Themen in dedizierte Dateien, die Erkennung veralteter Eintraege, die
  Genauigkeitspruefung anhand des Projektstatus und die 200-Zeilen-Kuerzungs-
  beschraenkung. Verwenden wenn MEMORY.md sich dem 200-Zeilen-Limit naehert,
  nach einer Sitzung mit dauerhaften Erkenntnissen, wenn ein Themenabschnitt
  ueber 10-15 Zeilen gewachsen ist und extrahiert werden sollte, oder wenn sich
  der Projektstatus geaendert hat und Speichereintraege veraltet sein koennten.
locale: de
source_locale: en
source_commit: 6f65f316
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
  tags: memory, claude-code, organization, maintenance, auto-memory
---

# Speicher verwalten

Claude Codes persistentes Speicherverzeichnis pflegen, damit es sitzungsuebergreifend korrekt, praegnant und nuetzlich bleibt. MEMORY.md wird bei jedem Gespraech in den Systemprompt geladen — Zeilen nach 200 werden gekuerzt, daher muss diese Datei ein schlanker Index sein, der fuer Details auf Themendateien verweist.

## Wann verwenden

- MEMORY.md naehert sich dem 200-Zeilen-Kuerzschwellenwert
- Eine Sitzung hat dauerhafte Erkenntnisse hervorgebracht, die erhaltenswert sind (neue Muster, Architekturentscheidungen, Debugging-Loesungen)
- Ein Themenabschnitt in MEMORY.md ist ueber 10-15 Zeilen gewachsen und sollte extrahiert werden
- Der Projektstatus hat sich geaendert (umbenannte Dateien, neue Domains, aktualisierte Zaehler) und Speichereintraege koennten veraltet sein
- Beginn eines neuen Arbeitsbereichs mit Pruefung ob relevanter Speicher bereits vorhanden ist
- Regelmaessige Wartung zwischen Sitzungen, um das Speicherverzeichnis gesund zu erhalten

## Eingaben

- **Erforderlich**: Zugriff auf das Speicherverzeichnis (typischerweise `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Spezifischer Ausloesungsgrund (z.B. "MEMORY.md ist zu lang", "gerade einen grossen Refaktor abgeschlossen")
- **Optional**: Thema zum Hinzufuegen, Aktualisieren oder Extrahieren

## Vorgehensweise

### Schritt 1: Aktuellen Zustand beurteilen

MEMORY.md lesen und alle Dateien im Speicherverzeichnis auflisten:

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

Zeilenanzahl gegen das 200-Zeilen-Limit pruefen. Vorhandene Themendateien inventarisieren.

**Erwartet:** Klares Bild der Gesamtzeilenzahl, Anzahl der Themendateien und welche Abschnitte in MEMORY.md vorhanden sind.

**Bei Fehler:** Falls das Speicherverzeichnis nicht existiert, es erstellen. Falls MEMORY.md nicht existiert, eine minimale mit einem `# Project Memory`-Header und einem `## Topic Files`-Abschnitt erstellen.

### Schritt 2: Veraltete Eintraege erkennen

Speicherbehauptungen mit dem aktuellen Projektstatus vergleichen. Haeufige Veraltungsmuster:

1. **Zaehlerabweichung**: Datei-, Skill-, Domain-, Zaehlerstaende, die sich nach Ergaenzungen/Entfernungen geaendert haben
2. **Umbenannte Pfade**: Dateien oder Verzeichnisse, die verschoben oder umbenannt wurden
3. **Ueberholte Muster**: Workarounds, die nach Korrekturen nicht mehr benoetigt werden
4. **Widersprueche**: Zwei Eintraege, die unterschiedliches ueber dasselbe Thema sagen

Grep verwenden, um Schluesselbehautungen stichprobenartig zu pruefen:

```bash
# Beispiel: einen Skill-Zaehler-Anspruch verifizieren
grep -c "^      - id:" skills/_registry.yml
# Beispiel: pruefen ob eine Datei noch existiert
ls path/claimed/in/memory.md
```

**Erwartet:** Eine Liste veralteter Eintraege mit den aktuell korrekten Werten.

**Bei Fehler:** Falls ein Anspruch nicht verifiziert werden kann (er verweist z.B. auf externen Status, der nicht geprueft werden kann), ihn belassen, aber eine `(unverified)`-Notiz hinzufuegen, anstatt moeglicherweise falsche Informationen stillschweigend beizubehalten.

### Schritt 3: Entscheiden was hinzugefuegt werden soll

Fuer neue Eintraege folgende Filter anwenden, bevor sie geschrieben werden:

1. **Dauerhaftigkeit**: Wird dies in der naechsten Sitzung noch wahr sein? Sitzungsspezifischen Kontext vermeiden (aktuelle Aufgabe, laufende Arbeit, temporaerer Status).
2. **Keine Duplikation**: Deckt CLAUDE.md oder Projektdokumentation dies bereits ab? Keine Duplikation — Speicher ist fuer Dinge, die NICHT anderswo erfasst sind.
3. **Verifiziert**: Wurde dies ueber mehrere Interaktionen bestaetigt, oder ist es eine einzelne Beobachtung? Fuer einzelne Beobachtungen gegen Projektdokumentationen pruefen, bevor sie geschrieben werden.
4. **Handlungsrelevant**: Aendert dieses Wissen das Verhalten? "Der Himmel ist blau" ist nicht nuetzlich. "Exit-Code 5 bedeutet Zitierfehler — temporaere Dateien verwenden" aendert die Arbeitsweise.

Ausnahme: Falls der Benutzer explizit bittet, etwas zu speichern, sofort speichern — kein Warten auf mehrfache Bestaetigung erforderlich.

**Erwartet:** Eine gefilterte Liste von Eintraegen, die es wert sind hinzugefuegt zu werden, wobei jeder die Kriterien Dauerhaftigkeit + Keine-Duplikation + Verifizierung + Handlungsrelevanz erfuellt.

**Bei Fehler:** Falls unklar ist, ob ein Eintrag erhaltenswert ist, im Zweifel kurz in MEMORY.md behalten — es ist einfacher spaeter zu beschneiden als neu zu entdecken.

### Schritt 4: Uebergrosse Themen extrahieren

Wenn ein Abschnitt in MEMORY.md ~10-15 Zeilen ueberschreitet, in eine dedizierte Themendatei extrahieren:

1. `<memory-dir>/<topic-name>.md` mit einem beschreibenden Header erstellen
2. Den detaillierten Inhalt von MEMORY.md in die Themendatei verschieben
3. Den Abschnitt in MEMORY.md durch eine 1-2-zeilige Zusammenfassung und einen Link ersetzen:

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Kurze Beschreibung des Inhalts
```

Benennungskonventionen fuer Themendateien:
- Kleinbuchstaben-Kebab-Case verwenden: `viz-architecture.md`, nicht `VizArchitecture.md`
- Nach Thema benennen, nicht nach Chronologie: `patterns.md`, nicht `session-2024-12.md`
- Verwandte Elemente gruppieren: "R-Debugging" und "WSL-Besonderheiten" in `patterns.md` zusammenfassen, anstatt eine Datei pro Fakt zu erstellen

**Erwartet:** MEMORY.md bleibt unter 200 Zeilen. Jede Themendatei ist eigenstaendig und ohne MEMORY.md-Kontext lesbar.

**Bei Fehler:** Falls eine Themendatei weniger als 5 Zeilen haben wuerde, lohnt sich die Extraktion wahrscheinlich nicht — inline in MEMORY.md belassen.

### Schritt 5: MEMORY.md aktualisieren

Alle Aenderungen anwenden: veraltete Eintraege entfernen, neue Eintraege hinzufuegen, Zaehler aktualisieren und sicherstellen, dass der Abschnitt "Topic Files" alle dedizierten Dateien auflistet.

MEMORY.md-Struktur sollte diesem Muster folgen:

```markdown
# Project Memory

## Abschnitt 1 — Uebergeordneter Kontext
- Stichpunkte, praegnant

## Abschnitt 2 — Ein weiteres Thema
- Nur Schluesselfakten

## Topic Files
- [file.md](file.md) — Was abgedeckt wird
```

Richtlinien:
- Jeden Stichpunkt auf maximal 1-2 Zeilen halten
- Inline-Formatierung (`code`, **fett**) fuer schnelle Lesbarkeit verwenden
- Den am haeufigsten benoetigen Kontext zuerst stellen
- Der Abschnitt "Topic Files" sollte immer am Ende stehen

**Erwartet:** MEMORY.md ist unter 200 Zeilen, korrekt und hat funktionierende Links zu allen Themendateien.

**Bei Fehler:** Falls nach der Extraktion nicht unter 200 Zeilen moeglich, den am wenigsten genutzten Abschnitt identifizieren und extrahieren. Jeder Abschnitt ist ein Kandidat — selbst die Projektuebersicht kann in eine Themendatei ausgelagert werden, wenn noetig, und nur eine 1-zeilige Zusammenfassung hinterlaesst.

### Schritt 6: Integritaet verifizieren

Eine abschliessende Pruefung durchfuehren:

1. **Zeilenanzahl**: Bestaetigen, dass MEMORY.md unter 200 Zeilen liegt
2. **Links**: Pruefen ob jede referenzierte Themendatei in MEMORY.md existiert
3. **Verwaiste Dateien**: Auf Themendateien pruefen, die nicht in MEMORY.md referenziert werden
4. **Genauigkeit**: 2-3 Faktenbehauptungen stichprobenartig gegen den Projektstatus pruefen

```bash
wc -l <memory-dir>/MEMORY.md
# Auf fehlerhafte Links pruefen
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Auf verwaiste Dateien pruefen
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**Erwartet:** Zeilenanzahl unter 200, keine fehlerhaften Links, keine verwaisten Dateien, stichprobenartig geprueft Behauptungen sind korrekt.

**Bei Fehler:** Fehlerhafte Links beheben (aktualisieren oder entfernen). Fuer verwaiste Dateien entweder eine Referenz in MEMORY.md hinzufuegen oder sie loeschen, falls sie nicht mehr relevant sind.

## Validierung

- [ ] MEMORY.md ist unter 200 Zeilen
- [ ] Alle in MEMORY.md referenzierten Themendateien existieren auf der Festplatte
- [ ] Keine verwaisten `.md`-Dateien im Speicherverzeichnis (jede Datei ist von MEMORY.md verlinkt)
- [ ] Keine veralteten Zaehler oder umbenannte Pfade in einer Speicherdatei
- [ ] Neue Eintraege erfuellen die Kriterien Dauerhaftigkeit/Keine-Duplikation/Verifiziert/Handlungsrelevant
- [ ] Themendateien haben beschreibende Header und sind eigenstaendig
- [ ] MEMORY.md liest sich als nuetzliche Schnellreferenz, nicht als Aenderungsprotokoll

## Haeufige Stolperfallen

- **Speicherverschmutzung**: Jede Sitzungsbeobachtung in den Speicher schreiben. Die meisten Erkenntnisse sind sitzungsspezifisch und muessen nicht dauerhaft gespeichert werden. Die vier Filter (Schritt 3) anwenden, bevor etwas geschrieben wird.
- **Veraltete Zaehler**: Code aktualisieren, aber nicht den Speicher. Zaehler (Skills, Agenten, Domains, Dateien) weichen still ab. Zaehler immer gegen die Wahrheitsquelle pruefen, bevor dem Speicher vertraut wird.
- **Chronologische Organisation**: Nach "wann ich es gelernt habe" statt nach "worum es geht" organisieren. Themenbasierte Organisation (`patterns.md`, `viz-architecture.md`) ist fuer den Abruf viel nuetzlicher als datumsbasierte Dateien.
- **CLAUDE.md duplizieren**: CLAUDE.md ist die massgebliche Projektanweisungsdatei. Speicher sollte Dinge erfassen, die NICHT in CLAUDE.md stehen — Debugging-Erkenntnisse, Architekturentscheidungen, Workflow-Praeferenzen, projektuebergreifende Muster.
- **Uebermaessige Extraktion**: Fuer jeden 3-zeiligen Abschnitt eine Themendatei erstellen. Nur extrahieren, wenn ein Abschnitt ~10-15 Zeilen ueberschreitet. Kleine Abschnitte funktionieren gut inline.
- **Das 200-Zeilen-Limit vergessen**: MEMORY.md wird in jeden Systemprompt geladen. Zeilen nach 200 werden still abgeschnitten. Wenn die Datei darueber hinauswachst, ist der untere Inhalt effektiv unsichtbar.

## Verwandte Skills

- `write-claude-md` — CLAUDE.md erfasst Projektanweisungen; Speicher erfasst sitzungsuebergreifendes Lernen
- `prune-agent-memory` — das Gegenstueck zu manage-memory: Pruefung, Klassifizierung und selektives Vergessen gespeicherter Erinnerungen
- `continue-here` — eine strukturierte Fortsetzungsdatei fuer den Sitzungsuebergabe schreiben; ergaenzt den Speicher als kurzfristige Kontextbruecke
- `create-skill` — neue Skills koennen erinnerungswuerdige Muster erzeugen
- `heal` — Selbstheilung kann den Speicher als Teil des Integrationsschritts aktualisieren
- `meditate` — Meditationssitzungen koennen Erkenntnisse zutage foerdern, die es wert sind, dauerhaft gespeichert zu werden
