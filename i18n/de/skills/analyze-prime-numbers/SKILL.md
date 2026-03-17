---
name: analyze-prime-numbers
description: >
  Primzahlen analysieren durch Primzahltests (Probedivision, Miller-Rabin),
  Faktorisierung (Probedivision, Pollard-Rho), Sieb des Eratosthenes und
  Anwendung des Primzahlsatzes. Verwenden zur Bestimmung der Primalität,
  Faktorzerlegung zusammengesetzter Zahlen und Analyse der Primzahlverteilung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, prime-numbers, factorization, primality-testing, sieve
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Primzahlen analysieren

Primzahltests und Faktorisierungsalgorithmen anwenden, um die Primalität von Zahlen zu bestimmen, zusammengesetzte Zahlen in Primfaktoren zu zerlegen und die Verteilung von Primzahlen zu untersuchen.

## Wann verwenden

- Bestimmung, ob eine gegebene Zahl prim ist
- Zerlegung einer zusammengesetzten Zahl in ihre Primfaktoren
- Erzeugung aller Primzahlen bis zu einer gegebenen Grenze
- Abschätzung der Primzahlanzahl in einem Intervall
- Vorbereitung zahlentheoretischer Eingaben für Kryptographie oder modulare Arithmetik

## Eingaben

- **Erforderlich**: Zu analysierende Zahl(en) oder Zahlenbereich
- **Erforderlich**: Aufgabentyp (Primzahltest, Faktorisierung, Sieb oder Verteilungsanalyse)
- **Optional**: Gewünschte Zuverlässigkeit für probabilistische Tests (Anzahl der Runden)
- **Optional**: Zeitlimit für Faktorisierungsversuche

## Vorgehensweise

### Schritt 1: Methode basierend auf Zahlenbereich wählen

Die passende Methode für die Größenordnung der Eingabe auswählen:

1. **Kleine Zahlen (< 10^6)**: Probedivision bis sqrt(n) ist effizient. Sieb des Eratosthenes für die Erzeugung aller Primzahlen.
2. **Mittlere Zahlen (10^6 bis 10^18)**: Deterministische Miller-Rabin-Tests mit spezifischen Basen, die für den Bereich beweiskräftig sind.
3. **Große Zahlen (> 10^18)**: Probabilistische Miller-Rabin-Tests mit mehreren zufälligen Basen. Faktorisierung mit Pollard-Rho oder ECM (Elliptische-Kurven-Methode).

**Erwartet:** Eine begründete Methodenwahl mit dokumentierter Zuverlässigkeit.

**Bei Fehler:** Falls die Methode zu langsam ist, zu einer effizienteren Methode wechseln. Falls die probabilistische Methode ein unsicheres Ergebnis liefert, die Anzahl der Runden erhöhen.

### Schritt 2: Primzahltest oder Faktorisierung durchführen

Den gewählten Algorithmus ausführen:

1. **Probedivision**: Durch alle Primzahlen p <= sqrt(n) teilen. Falls keine teilt, ist n prim.
2. **Sieb des Eratosthenes**: Alle Vielfachen von Primzahlen ab 2 streichen. Die verbleibenden Zahlen sind prim.
3. **Miller-Rabin-Test**: n-1 = 2^s * d schreiben, dann für Basis a prüfen, ob a^d = 1 (mod n) oder a^(2^r * d) = -1 (mod n) für ein r < s.
4. **Pollard-Rho**: Iterative Sequenz x_{i+1} = x_i^2 + c (mod n) berechnen und ggT(|x_i - x_j|, n) prüfen.

**Erwartet:** Definitiver Primzahltest oder vollständige Faktorzerlegung mit dokumentiertem Algorithmus.

**Bei Fehler:** Falls Pollard-Rho keinen Faktor findet, den Parameter c ändern und erneut starten. Falls alle Methoden scheitern, fortgeschrittene Methoden (ECM, Quadratisches Sieb, GNFS) in Betracht ziehen.

### Schritt 3: Ergebnis verifizieren und dokumentieren

Das Ergebnis bestätigen und in Kontext setzen:

1. **Faktorisierung prüfen**: Das Produkt aller gefundenen Primfaktoren muss die Originalzahl ergeben.
2. **Primalität der Faktoren prüfen**: Jeden gefundenen Faktor separat auf Primalität testen.
3. **Primzahlsatz anwenden**: Die Ergebnisse mit dem Primzahlsatz pi(x) ~ x/ln(x) vergleichen, um die Plausibilität zu prüfen.
4. **Besondere Eigenschaften notieren**: Zwillingsprimzahlen, Sophie-Germain-Primzahlen, Mersenne-Primzahlen usw.

**Erwartet:** Verifiziertes Ergebnis mit vollständiger Dokumentation.

**Bei Fehler:** Falls die Verifikation fehlschlägt, den Algorithmus Schritt für Schritt nachverfolgen, um den Fehler zu lokalisieren.

## Validierung

- [ ] Methode passend zur Größenordnung gewählt
- [ ] Algorithmus korrekt implementiert und ausgeführt
- [ ] Ergebnis durch Rückmultiplikation verifiziert (bei Faktorisierung)
- [ ] Alle Faktoren auf Primalität geprüft
- [ ] Probabilistische Tests mit ausreichend Runden durchgeführt

## Häufige Fehler

- **1 als Primzahl betrachten**: 1 ist per Definition keine Primzahl. Die Primfaktorzerlegung beginnt bei 2.
- **Probedivision über sqrt(n) hinaus**: Es genügt, bis sqrt(n) zu prüfen. Falls keine Primzahl bis sqrt(n) die Zahl teilt, ist sie prim.
- **Miller-Rabin als deterministisch behandeln**: Der allgemeine Miller-Rabin-Test ist probabilistisch. Für deterministische Ergebnisse spezifische Basen verwenden, die für den Zahlenbereich beweiskräftig sind.
- **Pollard-Rho bei Primzahlen anwenden**: Der Algorithmus findet nur nichttriviale Faktoren. Bei Primzahlen läuft er endlos ohne Ergebnis. Zuerst einen Primzahltest durchführen.

## Verwandte Skills

- `solve-modular-arithmetic` -- modulare Arithmetik, die auf Primzahleigenschaften aufbaut
- `explore-diophantine-equations` -- diophantische Gleichungen mit Primzahlbezug
- `derive-theoretical-result` -- zahlentheoretische Ergebnisse formal herleiten
