---
name: learn
description: >
  Systematischer KI-Wissenserwerb in unbekanntem Terrain — gezielter Modellaufbau
  mit Rueckkopplungsschleifen. Bildet Prinzipien des verteilten Lernens auf
  KI-Reasoning ab: Terrain erkunden, Struktur hypothetisieren, mit Sonden
  erforschen, Erkenntnisse integrieren, Verstaendnis verifizieren und fuer
  spaeteres Abrufen konsolidieren. Verwenden wenn eine unbekannte Codebasis oder
  Domaene auftritt, wenn ein Benutzer ein Thema stellt, das echte Untersuchung
  statt Abruf erfordert, wenn mehrere widerspruechliche Quellen ein kohaerentes
  Modell erfordern, oder bei der Vorbereitung, ein Thema zu lehren, das zuerst
  tiefes Verstaendnis erfordert.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, knowledge-acquisition, meta-cognition, model-building
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Lernen

Eine strukturierte Wissenserwerbssitzung durchfuehren — unbekanntes Terrain erkunden, erste Modelle aufbauen, diese durch gezielte Erforschung testen, Erkenntnisse zu kohaerentem Verstaendnis integrieren und fuer dauerhaftes Abrufen konsolidieren.

## Wann verwenden

- Bei einer unbekannten Codebasis, einem Framework oder einer Domaene ohne vorherigen Kontext
- Wenn ein Benutzer ein Thema ausserhalb des aktuellen Arbeitswissens stellt und die Antwort echte Untersuchung erfordert, nicht Abruf
- Wenn mehrere widerspruechliche Quellen oder Muster existieren und ein kohaerentes mentales Modell von Grund auf aufgebaut werden muss
- Nach `remote-viewing` intuitive Hinweise aufdeckt, die systematische Validierung benoetigen
- Bei der Vorbereitung zu `teach` — die KI muss ein Thema zuerst tief genug verstehen, um es erklaeren zu koennen

## Eingaben

- **Erforderlich**: Lernziel — ein Thema, Codebasis-Bereich, API, Domaenenkonzept oder Technologie zum Verstehen
- **Optional**: Umfangsgrenze — wie tief vorzudringen ist (Oberflaechensondierung vs. tiefe Expertise)
- **Optional**: Zweck des Benutzers — warum dieses Wissen wichtig ist (leitet die Priorisierung)
- **Optional**: Bekannte Ausgangspunkte — Dateien, Dokumentation oder bereits vertraute Konzepte

## Vorgehensweise

### Schritt 1: Erkunden — Das Terrain kartieren

Bevor versucht wird, etwas zu verstehen, die Landschaft kartieren, um zu identifizieren, was existiert.

```
Auswahl der Lernmodalitaet:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Terrain-Typ      │ Primaere Modalitaet      │ Werkzeug-Muster          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebasis        │ Strukturelle Kartierung  │ Glob fuer Dateibaum,     │
│                  │ — Einstiegspunkte,       │ Grep fuer Exports/       │
│                  │ Kernmodule, Grenzen      │ Imports, Read fuer       │
│                  │ finden                   │ Schluesseldateien        │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ API / Bibliothek │ Schnittstellenkartierung │ WebFetch fuer Doku,      │
│                  │ — oeffentliche Ober-     │ Read fuer Beispiele,     │
│                  │ flaeche, Typen,          │ Grep fuer Nutzungs-      │
│                  │ Konfiguration finden     │ muster                   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Domaenenkonzept  │ Ontologie-Kartierung     │ WebSearch fuer Ueber-    │
│                  │ — Kernbegriffe,          │ blicke, WebFetch fuer    │
│                  │ Beziehungen, Debatten    │ Definitionen, Read fuer  │
│                  │ finden                   │ lokale Notizen           │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Benutzerkontext  │ Konversationskartierung  │ Konversation lesen,      │
│                  │ — erklaerte Ziele,       │ MEMORY.md lesen,         │
│                  │ Praeferenzen,            │ CLAUDE.md lesen          │
│                  │ Einschraenkungen finden  │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. Den Terrain-Typ identifizieren und die primaere Modalitaet waehlen
2. Einen breiten Scan durchfuehren — nicht tief lesen, sondern Orientierungspunkte identifizieren (Schluesseldateien, Einstiegspunkte, Kernkonzepte)
3. Die Grenzen notieren: Was ist im Umfang, was ist angrenzend, was ist ausserhalb des Umfangs
4. Luecken identifizieren: Bereiche, die wichtig erscheinen, aber von der Oberflaeche her undurchsichtig sind
5. Eine grobe Karte erstellen: die Hauptkomponenten und ihre scheinbaren Beziehungen auflisten

**Erwartet:** Eine Skelettkarte des Terrains mit 5-15 identifizierten Orientierungspunkten. Ein Gefuehl dafuer, welche Bereiche von der Oberflaeche klar sind und welche tiefere Untersuchung erfordern. Noch kein Verstaendnis — nur eine Karte.

**Bei Fehler:** Wenn das Terrain zu gross zum Erkunden ist, den Umfang sofort eingrenzen. Fragen: "Was ist das Minimum, das ich verstehen muss, um dem Zweck des Benutzers zu dienen?" Wenn das Terrain keinen klaren Einstiegspunkt hat, von der Ausgabe starten (was produziert dieses System?) und rueckwaerts verfolgen.

### Schritt 2: Hypothetisieren — Erste Modelle aufbauen

Aus der Erkundung erste Hypothesen ueber die Funktionsweise des Systems konstruieren.

1. 2-3 Hypothesen ueber Struktur oder Verhalten des Terrains formulieren
2. Jede Hypothese klar formulieren: "Ich glaube X, weil ich Y beobachtet habe"
3. Fuer jede Hypothese identifizieren, welche Belege sie bestaetigen und welche sie widerlegen wuerden
4. Hypothesen nach Konfidenz ordnen: welche fuehlt sich am besten unterstuetzt an, welche ist am wackligsten
5. Die wertvollste Hypothese zuerst testen (diejenige, die, wenn bestaetigt, das meiste Verstaendnis freischalten wuerde)

**Erwartet:** Konkrete, falsifizierbare Hypothesen — keine vagen Eindruecke. Jede hat einen Test, der sie bestaetigen oder widerlegen wuerde. Die Hypothesen decken zusammen die wichtigsten Aspekte des Terrains ab.

**Bei Fehler:** Wenn keine Hypothesen entstehen, war die Erkundung zu oberflaechlich — zurueck zu Schritt 1 und 2-3 Orientierungspunkte vertiefen. Wenn alle Hypothesen gleich unsicher wirken, mit der einfachsten beginnen (Ockhams Rasiermesser) und von dort aufbauen.

### Schritt 3: Erforschen — Sondieren und testen

Jede Hypothese systematisch durch gezielte Untersuchung testen.

1. Die Hypothese mit hoechster Prioritaet auswaehlen
2. Eine minimale Sonde entwerfen: Was ist die kleinste Untersuchung, die sie bestaetigen oder widerlegen wuerde?
3. Die Sonde ausfuehren (eine Datei lesen, nach einem Muster suchen, eine Annahme testen)
4. Das Ergebnis festhalten: bestaetigt, widerlegt oder modifiziert
5. Wenn widerlegt, die Hypothese aufgrund der neuen Belege aktualisieren
6. Wenn bestaetigt, tiefer sondieren: haelt die Hypothese an den Raendern oder nur im Zentrum?
7. Zur naechsten Hypothese uebergehen und wiederholen

**Erwartet:** Mindestens eine Hypothese bis zur Schlussfolgerung getestet. Das mentale Modell beginnt Form anzunehmen — einige Teile bestaetigt, einige revidiert. Ueberraschungen werden als besonders wertvolle Daten notiert.

**Bei Fehler:** Wenn Sonden konsistent mehrdeutige Ergebnisse liefern, testen die Hypothesen moeglicherweise die falschen Dinge. Zuruecktreten und fragen: "Was wuerde jemand, der dieses System versteht, als die wichtigste Tatsache betrachten?" Stattdessen danach sondieren.

### Schritt 4: Integrieren — Mentales Modell aufbauen

Erkenntnisse zu einem kohaerenten Modell synthetisieren, das die Teile verbindet.

1. Alle bestaetigten Hypothesen und revidierten Modelle ueberpruefen
2. Das zentrale Ordnungsprinzip identifizieren: Was ist das "Rueckgrat", mit dem alles verbunden ist?
3. Beziehungen kartieren: Welche Komponenten haengen von welchen ab? Was fliesst wohin?
4. Die ueberraschenden Erkenntnisse identifizieren — diese enthalten oft die tiefste Einsicht
5. Nach Mustern suchen, die sich in verschiedenen Teilen des Terrains wiederholen
6. Ein mentales Modell aufbauen, das Verhalten vorhersagen kann: "Bei Eingabe X erwarte ich Y, weil Z"

**Erwartet:** Ein kohaerentes mentales Modell, das Struktur des Terrains erklaert und sein Verhalten vorhersagt. Das Modell sollte in 3-5 Saetzen ausdrueckbar sein und spezifische Behauptungen aufstellen, keine vagen Verallgemeinerungen.

**Bei Fehler:** Wenn die Teile sich nicht zu einem kohaerenten Modell integrieren lassen, liegt moeglicherweise ein grundlegendes Missverstaendnis in einer der frueheren Hypothesen. Das Teil identifizieren, das nicht passt, und es erneut testen. Alternativ kann das Terrain wirklich inkohaerent sein (schlecht entworfene Systeme existieren) — dies als Erkenntnis notieren, statt Kohaerenz zu erzwingen.

### Schritt 5: Verifizieren — Verstaendnis herausfordern

Das mentale Modell testen, indem Vorhersagen gemacht und ueberprueft werden.

1. Das Modell nutzen, um 3 spezifische Vorhersagen ueber das Terrain zu machen
2. Jede Vorhersage durch Untersuchung testen (nicht durch Annehmen, dass sie stimmt)
3. Fuer jede bestaetigte Vorhersage steigt die Konfidenz
4. Fuer jede widerlegte Vorhersage identifizieren, wo das Modell falsch ist, und korrigieren
5. Grenzfaelle identifizieren: haelt das Modell an den Raendern oder bricht es zusammen?
6. Fragen: "Was wuerde mich ueberraschen?" — dann pruefen, ob diese Ueberraschung moeglich ist

**Erwartet:** Das mentale Modell uebersteht mindestens 2 von 3 Vorhersagetests. Wo es bricht, wird das Versagen verstanden und das Modell korrigiert. Das Modell hat nun sowohl bestaetigte Staerken als auch bekannte Grenzen.

**Bei Fehler:** Wenn die meisten Vorhersagen fehlschlagen, hat das mentale Modell einen grundlegenden Fehler. Das ist tatsaechlich wertvolle Information — es bedeutet, dass das Terrain anders funktioniert als erwartet. Zurueck zu Schritt 2 mit den neuen Belegen und die Hypothesen von Grund auf neu aufbauen. Der zweite Versuch wird viel schneller sein, weil die falschen Modelle eliminiert wurden.

### Schritt 6: Konsolidieren — Fuer Abruf speichern

Das Gelernte in einer Form festhalten, die spaeteres Abrufen und Anwenden unterstuetzt.

1. Das mentale Modell in 3-5 Saetzen zusammenfassen
2. Die wichtigsten Orientierungspunkte notieren — die 3-5 wichtigsten Dinge zum Erinnern
3. Kontraintuitive Erkenntnisse festhalten, die vergessen werden koennten
4. Verwandte Themen identifizieren, mit denen dieses Lernen verbunden ist
5. Wenn das Gelernte dauerhaft ist (wird sitzungsuebergreifend benoetigt), MEMORY.md aktualisieren
6. Wenn das Gelernte sitzungsspezifisch ist, als Kontext fuer die aktuelle Konversation notieren
7. Formulieren, was unbekannt bleibt — ehrliche Luecken sind nuetzlicher als falsche Konfidenz

**Erwartet:** Eine praegnante, abrufbare Zusammenfassung, die das wesentliche Verstaendnis erfasst. Kuenftige Verweise auf dieses Thema koennen von dieser Zusammenfassung ausgehen, statt von Grund auf neu zu lernen.

**Bei Fehler:** Wenn das Gelernte sich der Zusammenfassung widersetzt, ist es moeglicherweise noch nicht vollstaendig integriert — zurueck zu Schritt 4. Wenn das Gelernte zu offensichtlich erscheint, um gespeichert zu werden, bedenken, dass das, was jetzt offensichtlich fuehlt, in einem frischen Kontext moeglicherweise nicht offensichtlich ist. Die nicht-offensichtlichen Teile speichern.

## Validierung

- [ ] Eine Erkundung wurde vor jeder vertieften Untersuchung durchgefuehrt (kartieren vor tauchen)
- [ ] Hypothesen wurden explizit formuliert und getestet, nicht angenommen
- [ ] Mindestens eine Hypothese wurde aufgrund von Belegen revidiert (zeigt echtes Lernen)
- [ ] Das mentale Modell macht spezifische, testbare Vorhersagen ueber das Terrain
- [ ] Bekannte Unbekannte werden neben bekannten Bekannten identifiziert
- [ ] Die konsolidierte Zusammenfassung ist praegnant genug, um fuer kuenftiges Abrufen nuetzlich zu sein

## Haeufige Stolperfallen

- **Die Erkundung ueberspringen**: Ins Detail eintauchen, bevor die Landschaft verstanden ist, verschwendet Zeit in unwichtigen Bereichen und verpasst das grosse Bild
- **Unfalsifizierbare Hypothesen**: "Das ist wahrscheinlich komplex" kann nicht getestet werden. "Dieses Modul behandelt Authentifizierung, weil es crypto importiert" kann getestet werden
- **Bestaetigungsfehler bei der Erforschung**: Nur nach Belegen suchen, die die anfaengliche Hypothese stuetzen, waehrend Widersprueche ignoriert werden
- **Vorzeitige Konsolidierung**: Ein Modell speichern, bevor es getestet wurde, fuehrt zu selbstbewusst falschen kuenftigen Vorhersagen
- **Perfektionismus**: Versuchen, alles zu lernen, bevor Wissen angewendet wird. Lernen ist iterativ — teilweises Verstaendnis nutzen, dann verfeinern
- **Lernen ohne Zweck**: Wissen ohne geplante Anwendung erwerben erzeugt unfokussiertes, oberflaechliches Verstaendnis

## Verwandte Skills

- `learn-guidance` — die Variante zur menschlichen Anleitung, um eine Person durch strukturiertes Lernen zu coachen
- `teach` — kalibrierter Wissenstransfer an einen Lernenden; baut auf dem hier konstruierten Modell auf
- `remote-viewing` — intuitive Erforschung, die Hinweise fuer systematisches Lernen zur Validierung liefert
- `meditate` — Laerm aus frueheren Kontexten klaeren, bevor neues Lernterrain betreten wird
- `observe` — anhaltendes neutrales Mustererkennen, das Lernen mit Rohdaten speist
