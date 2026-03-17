---
name: prove-geometric-theorem
description: >
  Geometrische Sätze formal beweisen mit euklidisch-axiomatischen Methoden,
  Koordinatenbeweisen und Vektorbeweisen. Verwenden zum Beweis von Kongruenz-
  und Ähnlichkeitssätzen, Kreiseigenschaften, Kollinearität und Konzyklität
  sowie zur Validierung geometrischer Konstruktionen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: advanced
  language: multi
  tags: geometry, proofs, euclidean-axioms, coordinate-proofs, vector-proofs
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Geometrischen Satz beweisen

Geometrische Sätze mit verschiedenen Beweismethoden formal beweisen: euklidisch-axiomatische Beweise, Koordinatenbeweise und Vektorbeweise, mit klarer Argumentationsstruktur und vollständiger Begründung jedes Schritts.

## Wann verwenden

- Formaler Beweis eines geometrischen Satzes aus Axiomen und bekannten Sätzen
- Beweis von Kongruenz, Ähnlichkeit oder metrischen Beziehungen in Figuren
- Nachweis von Kollinearität, Konzyklität oder Parallelität
- Validierung, dass eine geometrische Konstruktion die gewünschte Eigenschaft besitzt
- Lehre oder Wiederholung geometrischer Beweistechniken

## Eingaben

- **Erforderlich**: Zu beweisende Aussage (Satz, Korollar oder Vermutung)
- **Erforderlich**: Gegebene Voraussetzungen und Definitionen
- **Optional**: Bevorzugte Beweismethode (synthetisch, Koordinaten, Vektor, Transformation)
- **Optional**: Erlaubte Hilfssätze und Axiome
- **Optional**: Figur oder Diagramm der Konfiguration

## Vorgehensweise

### Schritt 1: Aussage analysieren und Beweismethode wählen

Die Aussage in eine beweisbare Form bringen:

1. **Aussage formalisieren**: Die zu beweisende Aussage als logische Formel oder präzise Wenn-Dann-Aussage formulieren.
2. **Bekannte Sätze identifizieren**: Relevante bekannte Sätze auflisten, die als Hilfsmittel dienen können (z.B. Strahlensätze, Kreiswinkelsatz, Satz des Pythagoras).
3. **Beweismethode wählen**:
   - **Synthetisch (euklidisch)**: Direkte Argumentationskette aus Axiomen und Sätzen. Bevorzugt für elegante, allgemeine Beweise.
   - **Koordinaten**: Punkte in ein Koordinatensystem setzen und algebraisch rechnen. Gut für metrische Aussagen.
   - **Vektor**: Vektoren für Punkte und Strecken verwenden. Gut für Parallelität, Teilungsverhältnisse und Kollinearität.
   - **Widerspruchsbeweis**: Annahme des Gegenteils und Herleitung eines Widerspruchs.
   - **Transformation**: Symmetrie, Drehung oder Ähnlichkeit nutzen.

**Erwartet:** Aussage formalisiert, Beweismethode gewählt und begründet.

**Bei Fehler:** Falls keine Beweismethode offensichtlich ist, mit Koordinatenbeweisen beginnen (mechanisch aber zuverlässig), dann prüfen, ob ein eleganterer synthetischer Beweis möglich ist.

### Schritt 2: Beweis ausführen

Den Beweis Schritt für Schritt durchführen:

1. **Jede Aussage begründen**: Jeden Schritt mit einer der folgenden Begründungen versehen:
   - Voraussetzung (gegeben)
   - Definition
   - Axiom
   - Zuvor bewiesener Satz (mit Referenz)
   - Logische Schlussfolgerung aus vorherigen Schritten
2. **Hilfskonstruktionen**: Falls nötig, zusätzliche Punkte, Geraden oder Kreise einführen und deren Existenz begründen.
3. **Fallunterscheidung**: Falls die Aussage Fallunterscheidungen erfordert, jeden Fall separat behandeln und die Vollständigkeit der Fälle begründen.
4. **Ketten**: Kongruenz- und Ähnlichkeitsschlüsse sauber aufbauen (z.B. SWS, WSW, SSS für Kongruenz).

**Erwartet:** Ein lückenloser Beweis, bei dem jeder Schritt explizit begründet ist.

**Bei Fehler:** Falls ein Schritt nicht begründet werden kann, prüfen, ob eine Voraussetzung fehlt oder ob ein stärkerer Hilfssatz benötigt wird. Häufiger Fehler: implizite Annahmen, die nicht aus den Voraussetzungen folgen.

### Schritt 3: Beweis verifizieren

Die Korrektheit und Vollständigkeit prüfen:

1. **Logische Kette prüfen**: Sicherstellen, dass jeder Schritt aus den vorherigen folgt und keine zirkulären Argumente vorliegen.
2. **Spezialfälle testen**: Den Satz für konkrete Zahlenwerte oder degenerierte Fälle (z.B. gleichseitiges Dreieck, rechter Winkel) prüfen.
3. **Gegenbeispiel suchen**: Aktiv versuchen, ein Gegenbeispiel zu finden, das die Aussage widerlegt (sollte scheitern, wenn der Beweis korrekt ist).
4. **Vollständigkeit**: Prüfen, ob alle Fälle abgedeckt sind und keine Randübergänge fehlen.

**Erwartet:** Der Beweis ist verifiziert, alle Spezialfälle bestehen den Test, und kein Gegenbeispiel existiert.

**Bei Fehler:** Falls ein Spezialfall fehlschlägt, den Beweis auf implizite Annahmen prüfen, die in diesem Fall verletzt werden. Häufig: Division durch null in Koordinatenbeweisen, degenerierte Dreiecke in Kongruenzsätzen.

## Validierung

- [ ] Aussage klar und formal formuliert
- [ ] Voraussetzungen vollständig aufgelistet
- [ ] Beweismethode gewählt und begründet
- [ ] Jeder Beweisschritt explizit begründet
- [ ] Keine zirkulären Argumente
- [ ] Alle Fälle in Fallunterscheidungen abgedeckt
- [ ] Spezialfälle getestet
- [ ] Kein Gegenbeispiel gefunden

## Häufige Fehler

- **Zirkuläre Argumentation**: Den zu beweisenden Satz (oder eine äquivalente Aussage) als Hilfsmittel verwenden. Immer prüfen, ob ein verwendeter Hilfssatz unabhängig vom aktuellen Satz bewiesen wurde.
- **Implizite Annahmen aus der Figur**: Aus einem Diagramm ablesen, dass Punkte „offensichtlich" kollinear oder Geraden „offensichtlich" parallel sind, ohne dies zu beweisen. Die Figur dient nur der Intuition, nicht als Beweis.
- **Degenerierte Fälle ignorieren**: Viele geometrische Sätze haben Ausnahmen bei degenerierten Konfigurationen (z.B. wenn drei Punkte kollinear sind oder ein Dreieck zum Segment degeneriert). Diese Fälle müssen separat behandelt oder explizit ausgeschlossen werden.
- **Falsche Kongruenzsätze**: SSA (Seite-Seite-Winkel) ist kein gültiger Kongruenzsatz (es gibt einen Mehrdeutigkeitsfall). Nur SSS, SWS, WSW und der Hypotenuse-Kathete-Satz (für rechtwinklige Dreiecke) sind gültig.
- **Koordinatenwahl verzerrt**: Bei Koordinatenbeweisen die Koordinaten so wählen, dass keine Spezialität eingeführt wird. Einen Punkt auf den Ursprung und eine Achse entlang einer gegebenen Geraden zu legen ist erlaubt; aber z.B. ein Dreieck gleichschenklig zu machen, wenn dies nicht vorausgesetzt ist, führt zu einem Beweis, der nur den Spezialfall abdeckt.

## Verwandte Skills

- `construct-geometric-figure` -- geometrische Konstruktionen, deren Korrektheit bewiesen werden kann
- `solve-trigonometric-problem` -- trigonometrische Werkzeuge für metrische Beweise
- `derive-theoretical-result` -- allgemeine Techniken für formale Herleitungen
- `argumentation` -- strukturiertes logisches Argumentieren
