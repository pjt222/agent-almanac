---
name: construct-geometric-figure
description: >
  Eine Zirkel-und-Lineal-Konstruktion einer euklidischen geometrischen Figur
  durchführen, indem die gewünschte Figur identifiziert, primitive Operationen
  (Kreisschlag, Gerade) aufgelistet, jeder Konstruktionsschritt explizit
  ausgeführt und das Ergebnis durch Überprüfung von Abständen, Winkeln
  und Kollinearität verifiziert wird.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, euclidean-construction, compass-straightedge, classical-geometry
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Geometrische Figur konstruieren

Eine Zirkel-und-Lineal-Konstruktion einer euklidischen geometrischen Figur durchführen, wobei jeder Schritt die erlaubten Grundoperationen nutzt und das Ergebnis durch metrische Verifikation bestätigt wird.

## Wann verwenden

- Konstruktion eines regulären Polygons, einer Winkelhalbierenden, einer Mittelsenkrechten oder einer Tangente mit klassischen Methoden
- Demonstration, warum bestimmte Konstruktionen unmöglich sind (Würfelverdopplung, Winkeldreiteilung, Kreisquadratur)
- Lehren oder Wiederholen euklidischer Geometrie-Grundlagen
- Vorbereitung von Eingaben für den Skill prove-geometric-theorem

## Eingaben

- **Erforderlich**: Beschreibung der zu konstruierenden Figur (z.B. „reguläres Sechseck" oder „Mittelsenkrechte einer Strecke AB")
- **Erforderlich**: Gegebene Elemente (Punkte, Strecken, Winkel)
- **Optional**: Koordinatenwerte der gegebenen Punkte (für numerische Verifikation)
- **Optional**: Ausgabeformat (schrittweiser Text, GeoGebra-Befehle oder TikZ-Code)

## Vorgehensweise

### Schritt 1: Figur und gegebene Elemente identifizieren

Die Konstruktionsaufgabe klar definieren:

1. **Zielfigur**: Exakt angeben, was konstruiert werden soll: ein Punkt, eine Gerade, ein Kreis oder eine zusammengesetzte Figur.
2. **Gegebene Elemente**: Die Ausgangselemente auflisten (Punkte, Strecken, Kreise, Winkel).
3. **Nebenbedingungen**: Zusätzliche Anforderungen dokumentieren (z.B. „der Punkt soll auf der Geraden liegen").
4. **Konstruierbarkeit prüfen**: Feststellen, ob die Konstruktion mit Zirkel und Lineal prinzipiell möglich ist. Unmögliche Konstruktionen dokumentieren und begründen.

**Erwartet:** Eine präzise Aufgabenstellung mit vollständiger Liste der gegebenen und gesuchten Elemente.

**Bei Fehler:** Falls die Aufgabe mehrdeutig ist, die einfachste Interpretation wählen und dokumentieren. Falls die Konstruktion unmöglich ist (z.B. allgemeine Winkeldreiteilung), den Unmöglichkeitsbeweis nennen.

### Schritt 2: Konstruktionsplan erstellen

Die Folge der Grundoperationen planen:

1. **Grundoperationen auflisten**: Jede Zirkel-und-Lineal-Konstruktion besteht aus:
   - Gerade durch zwei gegebene Punkte ziehen
   - Kreis mit gegebenem Mittelpunkt und durch einen gegebenen Punkt schlagen
   - Schnittpunkte von Geraden/Kreisen bestimmen
2. **Teilkonstruktionen identifizieren**: Komplexe Figuren in bekannte Teilkonstruktionen zerlegen (Mittelsenkrechte, Winkelhalbierende, Lot, Parallele).
3. **Reihenfolge festlegen**: Die Schritte so ordnen, dass jeder Schritt nur bereits konstruierte Elemente verwendet.

**Erwartet:** Ein geordneter Plan aus benannten Schritten, der von den gegebenen Elementen zur Zielfigur führt.

**Bei Fehler:** Falls kein Plan erkennbar ist, die Konstruktion rückwärts von der gewünschten Figur zu den gegebenen Elementen aufbauen (Analysis).

### Schritt 3: Konstruktion schrittweise ausführen

Jeden Schritt explizit beschreiben und die resultierenden Elemente benennen:

1. **Benennung**: Jeden neuen Punkt, jede neue Gerade und jeden neuen Kreis benennen.
2. **Beschreibung**: Jeden Schritt als eine der drei Grundoperationen formulieren.
3. **Schnittpunkte**: Alle relevanten Schnittpunkte bestimmen und benennen.
4. **Koordinaten** (falls gegeben): Die Koordinaten jedes neuen Punktes berechnen.

**Erwartet:** Eine vollständige, reproduzierbare Konstruktionsbeschreibung, bei der jeder Schritt eindeutig ist.

**Bei Fehler:** Falls ein Schnittpunkt nicht existiert (z.B. parallele Geraden), die Nebenbedingungen der Aufgabe überprüfen. Falls die Konstruktion mehr Schritte benötigt als erwartet, auf überflüssige Schritte prüfen.

### Schritt 4: Ergebnis verifizieren

Die Korrektheit der Konstruktion bestätigen:

1. **Metrische Prüfung**: Abstände, Winkel und Flächeninhalte berechnen und mit den Vorgaben vergleichen.
2. **Kollinearität und Konzyklität**: Prüfen, ob Punkte, die kollinear oder konzyklisch sein sollen, dies tatsächlich sind.
3. **Symmetrieprüfung**: Falls die Figur Symmetrien besitzen soll, diese verifizieren.
4. **Unabhängige Methode**: Das Ergebnis durch eine alternative Methode (z.B. Koordinatengeometrie) bestätigen.

**Erwartet:** Alle metrischen Beziehungen werden durch die Konstruktion erfüllt, bestätigt durch unabhängige Berechnung.

**Bei Fehler:** Falls die Verifikation fehlschlägt, den Schritt identifizieren, an dem der Fehler entstand. Häufige Ursachen: falscher Schnittpunkt gewählt (von zwei möglichen), Kreis mit falschem Radius geschlagen.

## Validierung

- [ ] Zielfigur und gegebene Elemente klar definiert
- [ ] Konstruierbarkeit geprüft und dokumentiert
- [ ] Jeder Schritt verwendet nur die drei erlaubten Grundoperationen
- [ ] Alle neuen Elemente sind benannt und eindeutig definiert
- [ ] Konstruktion ist vollständig (Zielfigur wurde erreicht)
- [ ] Metrische Verifikation bestätigt die Korrektheit
- [ ] Ergebnis durch unabhängige Methode bestätigt

## Häufige Fehler

- **Falschen Schnittpunkt wählen**: Zwei Kreise oder ein Kreis und eine Gerade haben typischerweise zwei Schnittpunkte. Die Wahl des falschen Punktes führt zu einer korrekten, aber unbeabsichtigten Konstruktion. Immer angeben, welcher der beiden Schnittpunkte gewählt wird.
- **Annahme der Konstruierbarkeit**: Nicht alle geometrischen Aufgaben sind mit Zirkel und Lineal lösbar. Die drei klassischen unmöglichen Probleme (Winkeldreiteilung, Würfelverdopplung, Kreisquadratur) erfordern algebraische Zahlen, die nicht mit Zirkel und Lineal erreichbar sind.
- **Überflüssige Schritte**: Mehr Kreise und Geraden als nötig zeichnen. Dies macht die Konstruktion unübersichtlich und erhöht die Fehlergefahr.
- **Koordinatenfreie Verifikation vergessen**: Auch wenn die Konstruktion rechnerisch korrekt erscheint, sollte eine geometrische Begründung gegeben werden, warum sie für beliebige Eingaben funktioniert.

## Verwandte Skills

- `prove-geometric-theorem` -- die Korrektheit einer Konstruktion formal beweisen
- `solve-trigonometric-problem` -- trigonometrische Berechnungen für Winkelkonstruktionen
