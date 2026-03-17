---
name: transmute
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Eine einzelne Funktion, ein Modul oder eine Datenstruktur von einer Form in
  eine andere transformieren und dabei das wesentliche Verhalten beibehalten.
  Leichtgewichtiger als der volle Athanor-Zyklus, geeignet fuer gezielte
  Konvertierungen bei denen die Ein- und Ausgabeformen gut verstanden sind.
  Anwenden beim Konvertieren einer Funktion zwischen Sprachen, Verschieben
  eines Moduls zwischen Paradigmen, Migrieren eines API-Konsumenten auf eine
  neue Version, Konvertieren von Datenformaten oder Ersetzen einer Abhaengigkeit
  — wenn der Transformationsumfang eine einzelne Funktion, Klasse oder ein
  Modul ist statt eines ganzen Systems.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, transmutation, conversion, refactoring, transformation, targeted
---

# Transmutieren

Ein bestimmtes Stueck Code oder Daten von einer Form in eine andere transformieren — Sprachuebersetzung, Paradigmenwechsel, Formatkonvertierung oder API-Migration — und dabei das wesentliche Verhalten und die Semantik beibehalten.

## Wann verwenden

- Konvertieren einer Funktion von einer Sprache in eine andere (Python nach R, JavaScript nach TypeScript)
- Verschieben eines Moduls von einem Paradigma (klassenbasiert zu funktional, Callbacks zu async/await)
- Migrieren eines API-Konsumenten von v1 zu v2 eines externen Dienstes
- Konvertieren von Daten zwischen Formaten (CSV nach Parquet, REST nach GraphQL-Schema)
- Ersetzen einer Abhaengigkeit durch eine gleichwertige (moment.js durch date-fns, jQuery durch natives JS)
- Wenn der Transformationsumfang eine einzelne Funktion, Klasse oder ein Modul ist (nicht ein ganzes System)

## Eingaben

- **Erforderlich**: Quellmaterial (Dateipfad, Funktionsname oder Datenbeispiel)
- **Erforderlich**: Zielform (Sprache, Paradigma, Format oder API-Version)
- **Optional**: Verhaltensvertrag (Tests, Typsignaturen oder erwartete Ein-/Ausgabepaare)
- **Optional**: Einschraenkungen (muss Rueckwaertskompatibilitaet wahren, Performancebudget)

## Vorgehensweise

### Schritt 1: Das Quellmaterial analysieren

Genau verstehen was die Quelle tut bevor eine Transformation versucht wird.

1. Die Quelle vollstaendig lesen — jeden Zweig, Grenzfall und Fehlerpfad
2. Den **Verhaltensvertrag** identifizieren:
   - Welche Eingaben akzeptiert sie? (Typen, Bereiche, Grenzfaelle)
   - Welche Ausgaben erzeugt sie? (Rueckgabewerte, Seiteneffekte, Fehlersignale)
   - Welche Invarianten haelt sie aufrecht? (Reihenfolge, Eindeutigkeit, referenzielle Integritaet)
3. Abhaengigkeiten katalogisieren: was importiert, ruft auf oder setzt die Quelle voraus?
4. Falls Tests existieren, sie lesen um das erwartete Verhalten zu verstehen
5. Falls keine Tests existieren, vor dem Transmutieren Verhaltenscharakterisierungstests schreiben

**Erwartet:** Ein vollstaendiges Verstaendnis dessen was die Quelle tut (nicht wie sie es tut). Der Verhaltensvertrag ist explizit und testbar.

**Bei Fehler:** Wenn die Quelle zu komplex fuer eine einzelne Transmutation ist, erwaegen sie in kleinere Teile zu zerlegen oder zum vollstaendigen `athanor`-Verfahren zu eskalieren. Bei mehrdeutigem Verhalten um Klaerung bitten statt zu raten.

### Schritt 2: Quelle auf Zielform abbilden

Die Transformationsabbildung entwerfen.

1. Fuer jedes Element in der Quelle das Ziel-Aequivalent identifizieren:
   - Sprachkonstrukte: Schleifen -> map/filter, Klassen -> Closures usw.
   - API-Aufrufe: alter Endpunkt -> neuer Endpunkt, Aenderungen der Request-/Response-Struktur
   - Datentypen: DataFrame-Spalten -> Schema-Felder, verschachteltes JSON -> flache Tabellen
2. Elemente **ohne direktes Aequivalent** identifizieren:
   - Quellfunktionalitaet die im Ziel fehlt (z.B. Pattern Matching in einer Sprache ohne diese Funktion)
   - Zielidiome die in der Quelle nicht existieren (z.B. R-Vektorisierung vs. Python-Schleifen)
3. Fuer jede Luecke eine Anpassungsstrategie waehlen:
   - Emulieren: das Verhalten mit zielseitigen Konstrukten nachbilden
   - Vereinfachen: wenn das Quellkonstrukt ein Workaround war, die native Loesung des Ziels nutzen
   - Dokumentieren: wenn sich das Verhalten leicht aendert, den Unterschied explizit festhalten
4. Die **Transformationsabbildung** schreiben: Quellelement -> Zielelement, fuer jedes Stueck

**Erwartet:** Eine vollstaendige Abbildung in der jedes Quellelement ein Ziel hat. Luecken sind identifiziert und Anpassungsstrategien gewaehlt.

**Bei Fehler:** Wenn zu viele Elemente kein direktes Aequivalent haben, ist die Transformation moeglicherweise ungeeignet (z.B. Transmutieren eines stark objektorientierten Designs in eine Sprache ohne Klassen). Die Zielform ueberdenken oder zu `athanor` eskalieren.

### Schritt 3: Die Transformation ausfuehren

Die Zielform gemaess der Abbildung schreiben.

1. Die Zieldatei(en) mit passender Struktur und Boilerplate erstellen
2. Jedes Element gemaess der Abbildung aus Schritt 2 transmutieren:
   - Den Verhaltensvertrag beibehalten — gleiche Eingaben erzeugen gleiche Ausgaben
   - Zielseitige Idiome verwenden statt woertlicher Uebersetzungen
   - Fehlerbehandlung beibehalten oder verbessern
3. Abhaengigkeiten behandeln:
   - Quellabhaengigkeiten durch Ziel-Aequivalente ersetzen
   - Wenn eine Abhaengigkeit kein Aequivalent hat, einen minimalen Adapter implementieren
4. Inline-Kommentare nur dort hinzufuegen wo die Transformation nicht offensichtlich war

**Erwartet:** Eine vollstaendige Zielimplementierung die der Transformationsabbildung folgt. Der Code liest sich als waere er nativ in der Zielform geschrieben, nicht mechanisch uebersetzt.

**Bei Fehler:** Wenn ein bestimmtes Element sich der Transformation widersetzt, es isolieren. Alles andere zuerst transformieren, dann das widerspenstige Element mit fokussierter Aufmerksamkeit angehen. Wenn es wirklich nicht transmutiert werden kann, dokumentieren warum und einen Workaround bereitstellen.

### Schritt 4: Verhaltensaequivalenz verifizieren

Bestaetigen dass die transmutierte Form das Verhalten des Originals bewahrt.

1. Die Verhaltensvertragstests gegen die Zielimplementierung ausfuehren
2. Fuer jeden Testfall verifizieren:
   - Gleiche Eingaben -> gleiche Ausgaben (innerhalb akzeptabler Toleranz fuer numerische Konvertierungen)
   - Gleiche Fehlerbedingungen -> aequivalente Fehlersignale
   - Seiteneffekte (falls vorhanden) sind bewahrt oder als geaendert dokumentiert
3. Grenzfaelle explizit pruefen:
   - Null/NA/undefined-Behandlung
   - Leere Sammlungen
   - Grenzwerte (maximaler Integer, leerer String, Arrays der Laenge Null)
4. Wenn die Zielform Faehigkeiten hinzufuegt (z.B. Typsicherheit), diese ebenfalls verifizieren

**Erwartet:** Alle Verhaltensvertragstests bestehen. Grenzfaelle werden aequivalent behandelt. Alle Verhaltensunterschiede sind dokumentiert und beabsichtigt.

**Bei Fehler:** Wenn Tests fehlschlagen, die Differenz zwischen Quell- und Zielverhalten finden. Das Ziel an den Quellvertrag anpassen. Wenn die Abweichung beabsichtigt ist (z.B. Beheben eines Fehlers im Original), sie explizit dokumentieren.

## Validierung

- [ ] Quellmaterial vollstaendig analysiert mit explizitem Verhaltensvertrag
- [ ] Transformationsabbildung deckt jedes Quellelement ab
- [ ] Luecken identifiziert mit dokumentierten Anpassungsstrategien
- [ ] Zielimplementierung verwendet native Idiome (keine woertliche Uebersetzung)
- [ ] Alle Verhaltensvertragstests bestehen gegen das Ziel
- [ ] Grenzfaelle verifiziert (null, leer, Grenzwerte)
- [ ] Abhaengigkeiten mit Ziel-Aequivalenten aufgeloest
- [ ] Alle Verhaltensunterschiede dokumentiert und beabsichtigt

## Haeufige Stolperfallen

- **Woertliche Uebersetzung**: Python-in-R oder Java-in-JavaScript schreiben statt Zielidiome zu verwenden. Das Ergebnis sollte nativ aussehen
- **Verhaltenstests ueberspringen**: Transmutieren ohne Tests bedeutet man kann die Aequivalenz nicht verifizieren. Zuerst Charakterisierungstests schreiben
- **Grenzfaelle ignorieren**: Der Standardpfad transmutiert leicht; in den Grenzfaellen verstecken sich die Fehler
- **Adapter ueberdesignen**: Wenn eine Abhaengigkeit einen 200-Zeilen-Adapter braucht, ist der Transmutationsumfang zu gross
- **Kommentare woertlich uebernehmen**: Kommentare sollten den Zielcode erklaeren, nicht die Quelle widerspiegeln. Sie neu schreiben

## Verwandte Skills

- `athanor` — Vollstaendige vierstufige Transformation fuer Systeme die zu gross fuer eine einzelne Transmutation sind
- `chrysopoeia` — Optimierung transmutierten Codes fuer maximale Wertgewinnung
- `review-software-architecture` — Architekturpruefung nach der Transmutation fuer groessere Konvertierungen
- `serialize-data-formats` — Spezialisierte Datenformat-Konvertierungsverfahren
