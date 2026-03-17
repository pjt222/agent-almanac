---
name: validate-piles-notation
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  PILES-Notation (Puzzle Input Line Entry System) fuer die Spezifikation von
  Teilefusionsgruppen in jigsawR parsen und validieren. Umfasst Syntaxvalidierung,
  Parsen in Gruppenlisten, Klartext-Erklaerung, Adjazenzverifikation gegen
  Puzzleergebnisse und Round-Trip-Serialisierung. Anwenden beim Validieren
  benutzerdefinierter PILES-Zeichenketten vor der Uebergabe an generate_puzzle(),
  beim Debuggen von Fusionsgruppen-Problemen, beim Erklaeren der Notation fuer
  Benutzer, oder beim Testen der Round-Trip-Parse/Serialize-Treue.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
---

# PILES-Notation validieren

PILES-Notationszeichenketten fuer Puzzle-Teilefusionsgruppen parsen und validieren.

## Wann verwenden

- Benutzerdefinierte PILES-Zeichenketten vor der Uebergabe an `generate_puzzle()` validieren
- Fusionsgruppen-Probleme debuggen (falsche Teile zusammengefuegt, unerwartete Ergebnisse)
- PILES-Notation fuer Benutzer in Klartext erklaeren
- Round-Trip-Treue testen: Parsen -> Gruppen -> Serialisieren -> Parsen

## Eingaben

- **Erforderlich**: PILES-Notationszeichenkette (z.B. `"1-2-3,4-5"`)
- **Optional**: Puzzle-Ergebnisobjekt (fuer Adjazenzvalidierung und Schluesselwortaufloesung)
- **Optional**: Puzzletyp (fuer Schluesselwort-Unterstuetzung wie `"center"`, `"ring1"`, `"R1"`)

## Vorgehensweise

### Schritt 1: Syntaxvalidierung

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Gibt TRUE zurueck wenn gueltig, Fehlermeldung wenn ungueltig
```

Auf haeufige Syntaxfehler pruefen:
- Ungepaarte Klammern: `"1-2(-3)-4"` mit nicht zusammenpassenden `()`
- Ungueltige Zeichen: nur Ziffern, `-`, `,`, `:`, `(`, `)` und Schluesselwoerter erlaubt
- Leere Gruppen: `"1-2,,3-4"` (doppeltes Komma)

**Erwartet:** `TRUE` fuer gueltige Syntax, beschreibender Fehler fuer ungueltige.

**Bei Fehler:** Die genaue PILES-Zeichenkette und die Validierungsfehlermeldung ausgeben.

### Schritt 2: In Gruppen parsen

```r
groups <- parse_piles("1-2-3,4-5")
# Gibt zurueck: list(c(1, 2, 3), c(4, 5))
```

Fuer Zeichenketten mit Bereichen:
```r
groups <- parse_piles("1:6,7-8")
# Gibt zurueck: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**Erwartet:** Liste von Integer-Vektoren, einer pro Fusionsgruppe, mit korrekten Teil-IDs und Gruppengrenzen.

**Bei Fehler:** Zuerst pruefen ob die PILES-Zeichenkette die Syntaxvalidierung in Schritt 1 bestanden hat. Wenn das Parsen unerwartete Gruppen zurueckgibt, ueberpruefen ob `-` Teile innerhalb einer Gruppe trennt und `,` Gruppen trennt, und dass die Bereichsnotation (`:`) zu inklusiven Endpunkten expandiert.

### Schritt 3: In Klartext erklaeren

Jede Gruppe fuer den Benutzer beschreiben:

- `"1-2-3,4-5"` -> "Gruppe 1: Teile 1, 2 und 3 fusionieren. Gruppe 2: Teile 4 und 5 fusionieren."
- `"1:6"` -> "Gruppe 1: Teile 1 bis 6 fusionieren (6 Teile)."
- `"center,ring1"` -> "Gruppe 1: Mittelteil. Gruppe 2: alle Teile in Ring 1."

**Erwartet:** Jede Fusionsgruppe wird in Klartext beschrieben mit Teilezahlen und Bezeichnern, sodass die Notation fuer nicht-technische Benutzer verstaendlich wird.

**Bei Fehler:** Wenn Schluesselwoerter nicht erklaert werden koennen (z.B. hat `"ring1"` keine klare Bedeutung), braucht die Notation moeglicherweise ein Puzzle-Ergebnisobjekt fuer Kontext. Den Benutzer empfehlen den Puzzletyp anzugeben oder stattdessen numerische Teil-IDs zu verwenden.

### Schritt 4: Gegen Puzzle-Ergebnis validieren (Optional)

Wenn ein Puzzle-Ergebnisobjekt verfuegbar ist, verifizieren:

```r
# Zuerst das Puzzle generieren
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Mit Puzzle-Kontext parsen (loest Schluesselwoerter auf)
groups <- parse_fusion("center,ring1", puzzle)
```

Pruefen:
- Alle Teil-IDs existieren im Puzzle
- Schluesselwoerter loesen zu gueltigen Teilemengen auf
- Fusionierte Teile sind tatsaechlich benachbart (Warnung wenn nicht)

**Erwartet:** Alle Teil-IDs gueltig. Benachbarte Teile fusionieren sauber.

**Bei Fehler:** Ungueltige Teil-IDs oder nicht benachbarte Paare auflisten.

### Schritt 5: Round-Trip-Serialisierung

Parse/Serialize-Treue verifizieren:

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip sollte gleich original sein (oder kanonisch aequivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Muss TRUE sein
```

**Erwartet:** Der Round-Trip erzeugt identische Gruppenlisten, was bestaetigt dass `parse_piles()` und `to_piles()` zueinander invers sind.

**Bei Fehler:** Wenn der Round-Trip abweicht, pruefen ob der Serialisierer die Notation normalisiert (z.B. Teil-IDs sortiert oder Bereiche in explizite Listen konvertiert). Kanonische Unterschiede sind akzeptabel solange `identical(groups, groups2)` `TRUE` zurueckgibt.

## PILES-Kurzreferenz

```
# Grundsyntax
"1-2"           # Teile 1 und 2 fusionieren
"1-2-3,4-5"     # Zwei Gruppen: (1,2,3) und (4,5)
"1:6"           # Bereich: Teile 1 bis 6

# Schluesselwoerter (benoetigen puzzle_result)
"center"        # Mittelteil (hex/concentric)
"ring1"         # Alle Teile in Ring 1
"R1"            # Reihe 1 (rectangular)
"boundary"      # Alle Randteile

# Funktionen
parse_piles("1-2-3,4-5")                    # PILES-Zeichenkette parsen
parse_fusion("1-2-3", puzzle)               # Format automatisch erkennen
to_piles(list(c(1,2), c(3,4)))              # In PILES konvertieren
validate_piles_syntax("1-2(-3)-4")          # Syntax validieren
```

## Validierung

- [ ] `validate_piles_syntax()` gibt TRUE fuer gueltige Zeichenketten zurueck
- [ ] `parse_piles()` gibt korrekte Gruppenlisten zurueck
- [ ] Round-Trip-Serialisierung bewahrt die Gruppen
- [ ] Schluesselwoerter loesen korrekt mit Puzzle-Kontext auf
- [ ] Ungueltige Syntax erzeugt klare Fehlermeldungen

## Haeufige Stolperfallen

- **Schluesselwort ohne Puzzle-Kontext**: Schluesselwoerter wie `"center"` benoetigen ein Puzzle-Ergebnisobjekt. Es an `parse_fusion()` uebergeben, nicht an `parse_piles()`.
- **1-indizierte Teile**: Teil-IDs beginnen bei 1, nicht bei 0.
- **Benachbarte vs. nicht benachbarte Fusion**: Nicht benachbarte Teile zu fusionieren funktioniert, kann aber unerwartete visuelle Ergebnisse erzeugen. Adjazenz validieren wenn moeglich.
- **Bereichsnotation**: `"1:6"` schliesst beide Endpunkte ein (1, 2, 3, 4, 5, 6).

## Verwandte Skills

- `generate-puzzle` — Puzzles mit Fusionsgruppen generieren
- `add-puzzle-type` — neue Typen brauchen PILES/Fusions-Unterstuetzung
- `run-puzzle-tests` — PILES-Parsing mit der vollstaendigen Suite testen
