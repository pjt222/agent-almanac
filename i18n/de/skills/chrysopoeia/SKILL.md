---
name: chrysopoeia
locale: de
source_locale: en
source_commit: a87e5e03
translator: claude
translation_date: "2026-03-17"
description: >
  Maximalen Wert aus vorhandenem Code extrahieren — Performanceoptimierung,
  API-Oberflaechenverfeinerung und Beseitigung von Ballast. Die Kunst aus
  Basiscode Gold zu machen durch systematisches Identifizieren und Verstaerken
  wertschoepfender Muster. Anwenden beim Optimieren einer funktionierenden
  aber traegen Codebasis, Verfeinern einer API-Oberflaeche die Krusten
  angesammelt hat, Reduzieren der Bundle-Groesse oder des Speicherverbrauchs,
  oder Vorbereiten von Code fuer Open-Source-Veroeffentlichung — wenn Code
  korrekt funktioniert aber nicht glaenzt und Politur statt eines vollstaendigen
  Neubaus braucht.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
---

# Chrysopoeia

Systematisch maximalen Wert aus vorhandenem Code extrahieren — identifizieren was Gold ist (hochwertig, gut entworfen), was Blei ist (ressourcenlastig, schlecht optimiert) und was Schlacke ist (toter Ballast). Dann das Gold verstaerken, das Blei transmutieren und die Schlacke entfernen.

## Wann verwenden

- Optimieren einer funktionierenden aber traegen Codebasis fuer Performance
- Verfeinern einer API-Oberflaeche die ueber Iterationen Krusten angesammelt hat
- Reduzieren von Bundle-Groesse, Speicherverbrauch oder Startzeit
- Vorbereiten von Code fuer Open-Source-Veroeffentlichung (den wertvollen Kern extrahieren)
- Wenn Code korrekt funktioniert aber nicht glaenzt — er braucht Politur, keinen Neubau

## Eingaben

- **Erforderlich**: Zu optimierende Codebasis oder Modul (Dateipfade)
- **Erforderlich**: Wertmetrik (Performance, API-Klarheit, Bundle-Groesse, Lesbarkeit)
- **Optional**: Profiling-Daten oder Benchmarks die aktuelle Performance zeigen
- **Optional**: Budget oder Ziel (z.B. "Bundle um 40% reduzieren", "unter 100ms Antwortzeit")
- **Optional**: Einschraenkungen (oeffentliche API nicht aenderbar, Rueckwaertskompatibilitaet wahren)

## Vorgehensweise

### Schritt 1: Probieren — Das Material klassifizieren

Jedes Element systematisch nach seinem Wertbeitrag klassifizieren.

1. Die Wertmetrik aus den Eingaben definieren (Performance, Klarheit, Groesse usw.)
2. Die Codebasis-Elemente inventarisieren (Funktionen, Module, Exporte, Abhaengigkeiten)
3. Jedes Element klassifizieren:

```
Wertklassifikation:
+--------+---------------------------------------------------------+
| Gold   | Hoher Wert, gut entworfen. Verstaerken und schuetzen.   |
| Silber | Guter Wert, kleine Makel. Polieren.                      |
| Blei   | Funktional aber schwer — schlechte Performance,          |
|        | komplexe API. In etwas Leichteres transmutieren.         |
| Schlacke| Toter Code, ungenutzte Exporte, vestigiale Funktionen.  |
|        | Vollstaendig entfernen.                                  |
+--------+---------------------------------------------------------+
```

4. Fuer Performanceoptimierung zuerst profilen:
   - Heisse Pfade identifizieren (wo Zeit verbracht wird)
   - Kalte Pfade identifizieren (selten ausgefuehrter Code der Schlacke sein koennte)
   - Speicherzuweisungsmuster messen
5. Den **Probierbericht** erstellen: Element-fuer-Element-Klassifikation mit Belegen

**Erwartet:** Jedes signifikante Element mit Belegen klassifiziert. Gold-Elemente sind zum Schutz waehrend der Optimierung identifiziert. Blei-Elemente sind nach Auswirkung priorisiert.

**Bei Fehler:** Wenn Profiling-Werkzeuge nicht verfuegbar sind, statische Analyse verwenden: Funktionskomplexitaet (zyklomatisch), Abhaengigkeitsanzahl und Codegroesse als Naeherungswerte. Wenn die Codebasis zu gross ist, sich zuerst auf den kritischen Pfad konzentrieren.

### Schritt 2: Veredeln — Das Gold verstaerken

Die hochwertigsten Elemente schuetzen und verbessern.

1. Fuer jedes Gold-Element:
   - Sicherstellen dass es umfassende Tests hat (das sind die wertvollsten Vermoegenswerte)
   - Seine Schnittstelle klar dokumentieren falls noch nicht geschehen
   - Erwaegen ob es als wiederverwendbares Modul extrahiert werden koennte
2. Fuer jedes Silber-Element:
   - Gezielte Verbesserungen anwenden (bessere Benennung, klarere Typen, kleine Optimierungen)
   - Testabdeckung auf Gold-Niveau bringen
   - Kleine Code-Gerueche beheben ohne umzustrukturieren
3. Gold/Silber-Verhalten nicht aendern — nur Politur und Schutz verbessern

**Erwartet:** Gold- und Silber-Elemente sind besser getestet, dokumentiert und geschuetzt. Keine Verhaltensaenderungen, nur Qualitaetsverbesserungen.

**Bei Fehler:** Wenn ein "Gold"-Element bei naeherem Hinsehen verborgene Probleme offenbart, es umklassifizieren. Besser ehrlich ueber den Wert sein als fehlerhaften Code zu schuetzen.

### Schritt 3: Transmutieren — Blei in Gold umwandeln

Schwere, ineffiziente Elemente in optimierte Aequivalente transformieren.

1. Blei-Elemente nach Auswirkung priorisieren (hoechster Ressourcenverbrauch zuerst)
2. Fuer jedes Blei-Element eine Transmutationsstrategie waehlen:
   - **Algorithmusoptimierung**: O(n^2) durch O(n log n) ersetzen, redundante Berechnung eliminieren
   - **Caching/Memoisierung**: Teure Ergebnisse speichern die wiederholt angefordert werden
   - **Faule Auswertung**: Berechnung aufschieben bis Ergebnisse tatsaechlich gebraucht werden
   - **Stapelverarbeitung**: Viele kleine Operationen in weniger grosse zusammenfassen
   - **Strukturelle Vereinfachung**: Zyklomatische Komplexitaet reduzieren, tiefe Verschachtelung abflachen
3. Die Strategie anwenden und die Verbesserung messen:
   - Vorher/Nachher-Benchmarks fuer Performanceaenderungen
   - Vorher/Nachher-Zeilenzahlen fuer Komplexitaetsaenderungen
   - Vorher/Nachher-Abhaengigkeitszahlen fuer Kopplungsaenderungen
4. Verhaltensaequivalenz nach jeder Transmutation verifizieren

**Erwartet:** Messbare Verbesserung der Zielwertmetrik. Jedes transmutierte Element leistet mehr als sein Blei-Vorgaenger bei Beibehaltung identischen Verhaltens.

**Bei Fehler:** Wenn ein Blei-Element sich innerhalb seiner aktuellen Schnittstelle der Optimierung widersetzt, erwaegen ob die Schnittstelle selbst das Problem ist. Manchmal erfordert die Transmutation eine Aenderung darin wie das Element aufgerufen wird, nicht nur wie es implementiert ist.

### Schritt 4: Reinigen — Die Schlacke entfernen

Ballast systematisch beseitigen.

1. Fuer jedes Schlacke-Element verifizieren dass es tatsaechlich ungenutzt ist:
   - Alle Referenzen suchen (grep, IDE-Verwendungssuche)
   - Auf dynamische Referenzen pruefen (zeichenkettenbasierter Dispatch, Reflection)
   - Auf externe Konsumenten pruefen (wenn der Code eine Bibliothek ist)
2. Bestaetigte Schlacke entfernen:
   - Toten Code, ungenutzte Exporte, vestigiale Funktionen loeschen
   - Ungenutzte Abhaengigkeiten aus Paketmanifesten entfernen
   - Konfiguration fuer entfernte Funktionen bereinigen
3. Nach jeder Entfernung verifizieren dass nichts kaputt geht (Tests ausfuehren)
4. Dokumentieren was entfernt wurde und warum (in Commit-Nachrichten, nicht im Code)

**Erwartet:** Die Codebasis ist leichter. Bundle-Groesse, Abhaengigkeitsanzahl oder Codevolumen messbar reduziert. Alle Tests bestehen weiterhin.

**Bei Fehler:** Wenn das Entfernen eines Elements etwas kaputt macht, war es keine Schlacke — umklassifizieren. Wenn dynamische Referenzen die Nutzungsverifikation erschweren, temporaeres Logging vor dem Loeschen hinzufuegen um keinen Laufzeitzugriff zu bestaetigen.

### Schritt 5: Verifizieren — Das Gold wiegen

Die Gesamtverbesserung messen.

1. Dieselben Benchmarks/Metriken wie in Schritt 1 ausfuehren
2. Vorher/Nachher der Zielwertmetrik vergleichen
3. Die Chrysopoeia-Ergebnisse dokumentieren:
   - Veredelte Elemente (Gold/Silber-Verbesserungen)
   - Transmutierte Elemente (Blei -> Gold-Konvertierungen mit Messungen)
   - Gereinigte Elemente (entfernte Schlacke mit Groessen-/Mengenauswirkung)
   - Gesamtmetrische Verbesserung (z.B. "47% schneller", "32% kleineres Bundle")

**Erwartet:** Messbare, dokumentierte Verbesserung der Zielwertmetrik. Die Codebasis ist nachweislich wertvoller als zuvor.

**Bei Fehler:** Wenn die Gesamtverbesserung geringfuegig ist, war der urspruengliche Code moeglicherweise besser als angenommen. Dokumentieren was gelernt wurde — zu wissen dass Code bereits nahezu optimal ist, ist selbst wertvoll.

## Validierung

- [ ] Probierbericht klassifiziert alle signifikanten Elemente mit Belegen
- [ ] Gold-Elemente haben umfassende Tests und Dokumentation
- [ ] Blei-Transmutationen zeigen messbare Vorher/Nachher-Verbesserung
- [ ] Schlacke-Entfernung mit Referenzpruefungen vor dem Loeschen verifiziert
- [ ] Alle Tests bestehen nach jeder Phase
- [ ] Gesamtverbesserung gemessen und dokumentiert
- [ ] Keine Verhaltensregressionen eingefuehrt
- [ ] Einschraenkungen aus den Eingaben sind erfuellt

## Haeufige Stolperfallen

- **Vorzeitige Optimierung**: Optimieren ohne Profiling. Immer zuerst messen, die heissen Pfade optimieren
- **Schlacke polieren**: Aufwand in die Verbesserung von Code stecken der geloescht werden sollte. Klassifizieren vor dem Veredeln
- **Gold brechen**: Optimierung die den besten Code verschlechtert. Gold-Elemente sollten nur besser werden, nie schlechter
- **Unbelegte Behauptungen**: "Es fuehlt sich schneller an" ist keine Chrysopoeia. Jede Verbesserung muss quantifiziert werden
- **Kalte Pfade optimieren**: Aufwand in Code stecken der einmal beim Start laeuft waehrend der Engpass die Anfrageschleife ist

## Verwandte Skills

- `athanor` — Vollstaendige vierstufige Transformation wenn Chrysopoeia aufdeckt dass der Code Umstrukturierung braucht, nicht nur Optimierung
- `transmute` — Gezielte Konvertierung wenn ein Blei-Element einen Paradigmenwechsel braucht
- `review-software-architecture` — Bewertung auf Architekturebene die Chrysopoeia auf Codeebene ergaenzt
- `review-data-analysis` — Optimierung von Datenpipelines parallel zu Codeoptimierung
