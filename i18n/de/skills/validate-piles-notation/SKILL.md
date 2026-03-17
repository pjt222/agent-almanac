---
name: validate-piles-notation
description: >
  PILES-Notation (Puzzle Input Line Entry System) fuer die Spezifikation
  von Teilefusionsgruppen in jigsawR parsen und validieren. Umfasst
  Syntaxvalidierung, Parsen in Gruppenlisten, Klartext-Erklaerung,
  Adjazenzverifizierung gegen Puzzleergebnisse und Roundtrip-Serialisierung.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# PILES-Notation validieren

PILES-Notationsstrings fuer Puzzle-Teilefusionsgruppen parsen und validieren.

## Wann verwenden

- Vom Benutzer bereitgestellte PILES-Strings vor der Uebergabe an `generate_puzzle()` validieren
- Fusionsgruppen-Probleme debuggen (falsche Teile zusammengefuegt, unerwartete Ergebnisse)
- PILES-Notation in Klartext fuer Benutzer erklaeren
- Roundtrip-Treue testen: parse -> groups -> serialize -> parse

## Eingaben

- **Erforderlich**: PILES-Notationsstring (z.B. `"1-2-3,4-5"`)
- **Optional**: Puzzle-Ergebnisobjekt (fuer Adjazenzvalidierung und Schluesselwortaufloesung)
- **Optional**: Puzzletyp (fuer Schluesselwortunterstuetzung wie `"center"`, `"ring1"`, `"R1"`)

## Vorgehensweise

### Schritt 1: Syntaxvalidierung

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Gibt TRUE zurueck wenn gueltig, Fehlermeldung wenn ungueltig
```

Auf haeufige Syntaxfehler pruefen:
- Nicht uebereinstimmende Klammern: `"1-2(-3)-4"` mit nicht passenden `()`
- Ungueltige Zeichen: nur Ziffern, `-`, `,`, `:`, `(`, `)` und Schluesselwoerter erlaubt
- Leere Gruppen: `"1-2,,3-4"` (doppeltes Komma)

**Erwartet:** `TRUE` fuer gueltige Syntax, beschreibender Fehler fuer ungueltige.

**Bei Fehler:** Den genauen PILES-String und die Validierungsfehlermeldung ausgeben.

### Schritt 2: In Gruppen parsen

```r
groups <- parse_piles("1-2-3,4-5")
# Gibt zurueck: list(c(1, 2, 3), c(4, 5))
```

Fuer Strings mit Bereichen:
```r
groups <- parse_piles("1:6,7-8")
# Gibt zurueck: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**Erwartet:** Liste von Integer-Vektoren, einer pro Fusionsgruppe, mit korrekten Teile-IDs und Gruppengrenzen.

**Bei Fehler:** Pruefen, ob der PILES-String die Syntaxvalidierung in Schritt 1 zuerst bestanden hat. Falls das Parsen unerwartete Gruppen zurueckgibt, sicherstellen, dass `-` Teile innerhalb einer Gruppe trennt und `,` Gruppen trennt, und dass die Bereichsnotation (`:`) zu inklusiven Endpunkten expandiert.

### Schritt 3: In Klartext erklaeren

Jede Gruppe fuer den Benutzer beschreiben:

- `"1-2-3,4-5"` -> "Gruppe 1: Teile 1, 2 und 3 fusionieren. Gruppe 2: Teile 4 und 5 fusionieren."
- `"1:6"` -> "Gruppe 1: Teile 1 bis 6 fusionieren (6 Teile)."
- `"center,ring1"` -> "Gruppe 1: Mittelteil. Gruppe 2: Alle Teile in Ring 1."

**Erwartet:** Jede Fusionsgruppe in Klartext mit Teileanzahl und Bezeichnern beschrieben, sodass die Notation fuer nicht-technische Benutzer verstaendlich wird.

**Bei Fehler:** Falls Schluesselwoerter nicht erklaert werden koennen (z.B. `"ring1"` hat keine klare Bedeutung), benoetigt die Notation moeglicherweise ein Puzzle-Ergebnisobjekt fuer Kontext. Den Benutzer empfehlen, den Puzzletyp anzugeben oder stattdessen numerische Teile-IDs zu verwenden.

### Schritt 4: Gegen Puzzleergebnis validieren (optional)

Falls ein Puzzle-Ergebnisobjekt verfuegbar ist, verifizieren:

```r
# Puzzle zuerst generieren
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Mit Puzzlekontext parsen (loest Schluesselwoerter auf)
groups <- parse_fusion("center,ring1", puzzle)
```

Pruefen:
- Alle Teile-IDs existieren im Puzzle
- Schluesselwoerter loesen zu gueltigen Teilemengen auf
- Fusionierte Teile sind tatsaechlich benachbart (Warnung falls nicht)

**Erwartet:** Alle Teile-IDs gueltig. Benachbarte Teile fusionieren sauber.

**Bei Fehler:** Ungueltige Teile-IDs oder nicht-benachbarte Paare auflisten.

### Schritt 5: Roundtrip-Serialisierung

Parse/Serialize-Treue verifizieren:

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip sollte dem Original entsprechen (oder kanonisches Aequivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Muss TRUE sein
```

**Erwartet:** Roundtrip erzeugt identische Gruppenlisten, was bestaetigt, dass `parse_piles()` und `to_piles()` Inverse sind.

**Bei Fehler:** Falls der Roundtrip sich unterscheidet, pruefen, ob der Serializer die Notation normalisiert (z.B. Teile-IDs sortieren oder Bereiche in explizite Listen umwandeln). Kanonische Unterschiede sind akzeptabel, solange `identical(groups, groups2)` `TRUE` zurueckgibt.

## PILES-Kurzreferenz

```
# Grundlegende Syntax
"1-2"           # Teile 1 und 2 fusionieren
"1-2-3,4-5"     # Zwei Gruppen: (1,2,3) und (4,5)
"1:6"           # Bereich: Teile 1 bis 6

# Schluesselwoerter (erfordern puzzle_result)
"center"        # Mittelteil (hex/concentric)
"ring1"         # Alle Teile in Ring 1
"R1"            # Reihe 1 (rectangular)
"boundary"      # Alle Randteile

# Funktionen
parse_piles("1-2-3,4-5")                    # PILES-String parsen
parse_fusion("1-2-3", puzzle)               # Format automatisch erkennen
to_piles(list(c(1,2), c(3,4)))              # Zu PILES konvertieren
validate_piles_syntax("1-2(-3)-4")          # Syntax validieren
```

## Validierung

- [ ] `validate_piles_syntax()` gibt TRUE fuer gueltige Strings zurueck
- [ ] `parse_piles()` gibt korrekte Gruppenlisten zurueck
- [ ] Roundtrip-Serialisierung bewahrt Gruppen
- [ ] Schluesselwoerter loesen mit Puzzlekontext korrekt auf
- [ ] Ungueltige Syntax erzeugt klare Fehlermeldungen

## Haeufige Fehler

- **Schluesselwort ohne Puzzlekontext**: Schluesselwoerter wie `"center"` erfordern ein Puzzle-Ergebnisobjekt. An `parse_fusion()` uebergeben, nicht an `parse_piles()`.
- **1-indizierte Teile**: Teile-IDs beginnen bei 1, nicht bei 0.
- **Benachbarte vs. nicht-benachbarte Fusion**: Die Fusion nicht-benachbarter Teile funktioniert, kann aber unerwartete visuelle Ergebnisse erzeugen. Adjazenz wenn moeglich validieren.
- **Bereichsnotation**: `"1:6"` schliesst beide Endpunkte ein (1, 2, 3, 4, 5, 6).

## Verwandte Skills

- `generate-puzzle` -- Puzzles mit Fusionsgruppen generieren
- `add-puzzle-type` -- Neue Typen benoetigen PILES/Fusions-Unterstuetzung
- `run-puzzle-tests` -- PILES-Parsing mit der vollstaendigen Suite testen
