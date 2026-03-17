---
name: solve-trigonometric-problem
description: >
  Trigonometrische Gleichungen lösen, Dreiecke auflösen (Sinus-/Kosinussatz),
  trigonometrische Identitäten verifizieren und Anwendungen mit Winkeln und
  periodischen Funktionen bearbeiten. Verwenden für Gleichungen mit sin, cos,
  tan, Dreiecksberechnungen und Identitätsbeweise.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, trigonometry, triangle-solving, identities, periodic-functions
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Trigonometrisches Problem lösen

Trigonometrische Gleichungen lösen, Dreiecke mit Sinus- und Kosinussatz auflösen, Identitäten verifizieren und Anwendungen mit periodischen Funktionen bearbeiten.

## Wann verwenden

- Lösen trigonometrischer Gleichungen (z.B. 2sin(x) + 1 = 0)
- Berechnung unbekannter Seiten und Winkel in Dreiecken
- Beweis oder Verifikation trigonometrischer Identitäten
- Analyse periodischer Funktionen (Amplitude, Periode, Phasenverschiebung)
- Anwendungsprobleme mit Winkeln, Entfernungen und Höhen

## Eingaben

- **Erforderlich**: Trigonometrische Gleichung, Identität oder Dreiecksproblem
- **Erforderlich**: Problemtyp (Gleichung lösen, Dreieck auflösen, Identität beweisen, Anwendung)
- **Optional**: Lösungsintervall (z.B. [0, 2pi) oder alle reellen Zahlen)
- **Optional**: Gewünschte Einheit (Grad oder Bogenmaß)
- **Optional**: Genauigkeitsanforderung (exakt oder gerundete Dezimalzahl)

## Vorgehensweise

### Schritt 1: Problem klassifizieren und normalisieren

Den Problemtyp bestimmen und in Standardform bringen:

1. **Gleichung**: In die Form f(x) = 0 bringen, alle trigonometrischen Funktionen auf eine einzige Funktion (sin, cos) reduzieren, sofern möglich.
2. **Dreiecksauflösung**: Die gegebenen Elemente identifizieren (SSS, SWS, WSW, SSW) und den passenden Lösungsansatz wählen.
3. **Identitätsbeweis**: Eine Seite als Ausgangspunkt wählen und systematisch zur anderen Seite umformen.
4. **Periodische Funktion**: In die Form A * sin(B*x + C) + D bringen und Parameter identifizieren.

**Erwartet:** Problem in Standardform mit identifiziertem Lösungsansatz.

**Bei Fehler:** Falls die Gleichung gemischte trigonometrische Funktionen enthält, Additionstheoreme oder die Beziehung sin^2 + cos^2 = 1 verwenden, um auf eine einzige Funktion zu reduzieren.

### Schritt 2: Lösung berechnen

Den identifizierten Lösungsansatz anwenden:

1. **Gleichungen**: Trigonometrische Funktion isolieren, Referenzwinkel bestimmen, alle Lösungen im gegebenen Intervall finden.
2. **Dreiecke**:
   - **Kosinussatz**: c^2 = a^2 + b^2 - 2ab*cos(C) für SSS und SWS
   - **Sinussatz**: a/sin(A) = b/sin(B) = c/sin(C) für WSW und SSW
   - **Mehrdeutigkeit bei SSW**: Prüfen, ob 0, 1 oder 2 Dreiecke existieren
3. **Identitäten**: Systematisch umformen unter Verwendung von:
   - Pythagoräische Identitäten: sin^2 + cos^2 = 1
   - Additionstheoreme: sin(A+B), cos(A+B)
   - Doppelwinkelformeln: sin(2A), cos(2A)
   - Produkt-zu-Summe und Summe-zu-Produkt-Formeln

**Erwartet:** Vollständige Lösung mit allen Werten und Begründung der Schritte.

**Bei Fehler:** Bei SSW-Problemen die Mehrdeutigkeit systematisch prüfen: Wenn a >= b, gibt es genau ein Dreieck. Wenn a < b, den Winkel B berechnen und prüfen, ob B und 180-B beide gültige Lösungen ergeben.

### Schritt 3: Ergebnis verifizieren

Die Lösung durch Rücksubstitution oder alternative Methode bestätigen:

1. **Rücksubstitution**: Alle Lösungen in die Originalgleichung einsetzen und Gleichheit prüfen.
2. **Dreieck**: Winkelsumme = 180° prüfen, Sinussatz auf alle Seiten/Winkel anwenden und Konsistenz verifizieren.
3. **Identität**: Beide Seiten für mehrere spezifische Winkelwerte numerisch auswerten.
4. **Grafische Prüfung**: Die Funktion plotten, um Lösungen visuell zu bestätigen.

**Erwartet:** Alle Lösungen bestehen die Verifikation und Scheinlösungen sind ausgeschlossen.

**Bei Fehler:** Falls eine Lösung die Verifikation nicht besteht, prüfen, ob beim Quadrieren oder bei der Division durch null Scheinlösungen eingeführt wurden.

## Validierung

- [ ] Problem korrekt klassifiziert und Lösungsansatz identifiziert
- [ ] Alle Lösungen im angegebenen Intervall gefunden
- [ ] Bei Dreiecken: Mehrdeutigkeit bei SSW geprüft
- [ ] Lösungen durch Rücksubstitution verifiziert
- [ ] Scheinlösungen erkannt und ausgeschlossen
- [ ] Einheiten (Grad/Bogenmaß) konsistent verwendet

## Häufige Fehler

- **Scheinlösungen durch Quadrieren**: Wenn eine trigonometrische Gleichung quadriert wird, können zusätzliche Lösungen entstehen, die die Originalgleichung nicht erfüllen. Immer rücksubstituieren.
- **Mehrdeutigkeit bei SSW ignorieren**: Der Fall SSW (zwei Seiten und ein gegenüberliegender Winkel) kann 0, 1 oder 2 Lösungen haben. Das Ignorieren des zweiten möglichen Dreiecks ist ein häufiger Fehler.
- **Grad und Bogenmaß verwechseln**: In einem Problem konsequent eine Einheit verwenden. Taschenrechner zwischen DEG und RAD umschalten ist eine häufige Fehlerquelle.
- **Definitionsbereich ignorieren**: tan(x) ist bei x = pi/2 + n*pi nicht definiert, und arcsin/arccos haben eingeschränkte Wertebereiche.
- **Nur Hauptwerte angeben**: Trigonometrische Gleichungen haben typischerweise unendlich viele Lösungen. Im Intervall [0, 2pi) alle Lösungen finden, dann die allgemeine Lösung mit + n*2pi (oder + n*pi für tan) angeben.

## Verwandte Skills

- `construct-geometric-figure` -- Winkelkonstruktionen, die trigonometrische Berechnungen nutzen
- `prove-geometric-theorem` -- Trigonometrie in geometrischen Beweisen anwenden
- `derive-theoretical-result` -- trigonometrische Ergebnisse herleiten
