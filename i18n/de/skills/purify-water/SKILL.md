---
name: purify-water
description: >
  Wasser aus natürlichen Quellen durch Abkochen, Filtration und chemische
  Methoden reinigen. Umfasst Quellenbewertung und Prioritätenranking,
  Sediment-Vorfilterung, Methodenwahl (Abkochen, Chemie, UV, Filter),
  höhenangepasstes Abkochverfahren, chemische Behandlungsdosierungen und
  sichere Lagerungspraktiken. Verwenden, wenn Trinkwasser in einer
  Wildnissituation benötigt wird, verfügbare Wasserquellen unbekannter
  Qualität sind, in einer Überlebenssituation mit Dehydrierungsrisiko
  oder beim Aufbereiten von Wasser zum Kochen oder zur Wundreinigung.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, water, purification, survival, wilderness, filtration
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Wasser reinigen

Wasser aus natürlichen Quellen aufbereiten, um es mit feldtauglichen Methoden trinkbar zu machen.

## Wann verwenden

- Trinkwasser wird in einer Wildnissituation ohne Zugang zu aufbereitetem Wasser benötigt
- Verfügbare Wasserquellen sind von unbekannter Qualität (Bäche, Flüsse, Seen, Teiche)
- Notfall-Überlebenssituation mit Dehydrierungsrisiko
- Wasser muss zum Kochen oder zur Wundreinigung sicher gemacht werden

## Eingaben

- **Erforderlich**: Eine Wasserquelle (fließend oder stehend)
- **Erforderlich**: Ein Behälter (Metalltopf, Flasche oder improvisiertes Gefäß)
- **Optional**: Reinigungsmittel (Chemietabletten, Filter, UV-Stift)
- **Optional**: Feuermachfähigkeit zum Abkochen (siehe `make-fire`)
- **Optional**: Tuch oder natürliche Filtermaterialien zur Vorfilterung

## Vorgehensweise

### Schritt 1: Wasserquelle bewerten und auswählen

Nicht alle Wasserquellen bergen das gleiche Risiko. Die beste verfügbare Quelle wählen.

```
Prioritätenranking der Wasserquellen (beste bis schlechteste):
┌──────┬─────────────────────────┬────────────────────────────────────┐
│ Rang │ Quelle                  │ Hinweise                           │
├──────┼─────────────────────────┼────────────────────────────────────┤
│ 1    │ Quelle (am Ursprung)    │ Geringste Kontamination; trotzdem  │
│      │                         │ behandeln                          │
│ 2    │ Schnell fließender Bach │ Fließendes Wasser hat weniger      │
│      │ (oberhalb menschlicher  │ Krankheitserreger als stehendes    │
│      │ Aktivitäten)            │ Wasser                             │
│ 3    │ Großer Fluss            │ Verdünnung hilft, aber Landwirt-   │
│      │                         │ schaft/Industrie flussaufwärts ist  │
│      │                         │ bedenklich                         │
│ 4    │ Großer See              │ Vom offenen Wasser schöpfen, nicht  │
│      │                         │ vom Ufer                           │
│ 5    │ Kleiner Teich/Pfütze    │ Hohes Pathogen- und Parasitenrisiko│
│ 6    │ Stagnierendes Gewässer  │ Letzter Ausweg; intensive Behand-  │
│      │                         │ lung nötig                         │
└──────┴─────────────────────────┴────────────────────────────────────┘

Warnzeichen (wenn möglich meiden):
- Tote Tiere in der Nähe
- Algenblüte (blaugrüner Schaum)
- Chemischer Geruch oder öliger Film
- Flussabwärts von Bergbau, Landwirtschaft oder Siedlungen
- Keine umgebende Vegetation (kann auf toxischen Boden hindeuten)
```

Wasser von unterhalb der Oberfläche schöpfen (Oberflächenfilm meiden) und vom Uferrand entfernt.

**Erwartet:** Klares oder leicht trübes Wasser aus der besten verfügbaren Quelle, in einem sauberen Behälter gesammelt.

**Bei Fehler:** Wenn nur schlechte Quellen verfügbar sind (stagnierend, trüb), fortfahren, aber aggressive Vorfilterung (Schritt 2) einplanen und mehrere Reinigungsmethoden verwenden (Gürtel-und-Hosenträger-Ansatz). Wenn keine Wasserquelle gefunden wird, nach Indikatoren suchen: grüne Vegetation in Tälern, Tierpfade bergab, Insektenschwärme in der Morgen-/Abenddämmerung, und nach fließendem Wasser lauschen.

### Schritt 2: Sediment vorfiltern

Partikel vor der Reinigung entfernen. Sediment reduziert die Wirksamkeit chemischer Behandlung und verstopft Filter.

```
Improvisierter Schwerkraftfilter (geschichtet in einem Behälter mit Loch am Boden):

    ┌─────────────────────┐  ← Offene Oberseite: Wasser einfüllen
    │  Gras / Tuch        │  ← Grober Vorfilter
    │  Feiner Sand         │  ← Entfernt feine Partikel
    │  Holzkohle (zerklei-│  ← Adsorbiert einige Chemikalien und Gerüche
    │  nert)              │
    │  Kies               │  ← Strukturelle Stützung
    │  Gras / Tuch        │  ← Verhindert das Durchfallen des Kieses
    └────────┬────────────┘
             │
        Gefiltertes Wasser tropft heraus

Materialien:
- Behälter: Birkenrinden-Trichter, hohler Stamm, geschnittene Plastikflasche, Socke
- Sand: feiner, sauberer Sand (wenn möglich vorher spülen)
- Holzkohle: aus einem vorherigen Feuer (NICHT Asche — nur Holzkohle)
- Kies: kleine Steine, gespült
```

Für einfache Sedimententfernung Wasser durch ein Halstuch, T-Shirt oder mehrere Stofflagen filtern.

**Erwartet:** Sichtbar klareres Wasser mit reduzierter Trübung. Die Holzkohleschicht entfernt einige Gerüche und Geschmacksstoffe.

**Bei Fehler:** Wenn das Wasser nach der Filterung immer noch sehr trüb ist, es in einem Behälter 30-60 Minuten absitzen lassen. Die klarere obere Schicht vorsichtig abgießen. Den Absetz- oder Filtervorgang wiederholen. Hinweis: Vorfilterung macht Wasser NICHT trinkbar — sie bereitet es für die Reinigung vor.

### Schritt 3: Reinigungsmethode wählen

Basierend auf verfügbaren Werkzeugen und Bedingungen auswählen.

```
Vergleich der Reinigungsmethoden:
┌───────────────┬────────────┬───────────┬────────────┬──────────────────────┐
│ Methode       │ Tötet      │ Zeit      │ Benötigt   │ Einschränkungen      │
│               │ Bakterien/ │           │            │                      │
│               │ Viren/     │           │            │                      │
│               │ Parasiten  │           │            │                      │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Abkochen      │ Ja/Ja/Ja   │ 1-3 Min   │ Feuer,     │ Brennstoff, Zeit,    │
│               │            │ (wallend) │ Metall-    │ entfernt keine       │
│               │            │           │ behälter   │ Chemikalien          │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Chlordioxid-  │ Ja/Ja/     │ 30 Min    │ Tabletten  │ Weniger wirksam in   │
│ Tabletten     │ Ja         │           │ oder       │ kaltem/trübem Wasser │
│               │            │           │ Tropfen    │                      │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Jod           │ Ja/Ja/     │ 30 Min    │ Tabletten  │ Geschmack; nicht für │
│               │ Teilweise  │           │ oder       │ Schwangere/Schild-   │
│               │            │           │ Tinktur    │ drüsenerkrankungen;  │
│               │            │           │            │ schwach gegen Crypto │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ UV-Stift      │ Ja/Ja/Ja   │ 60-90 Sek │ UV-Gerät,  │ Erfordert klares     │
│               │            │ pro Liter │ Batterien  │ Wasser; batterieabh. │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Pump-/Press-  │ Ja/Nein*/  │ Sofort    │ Filter-    │ Die meisten entfernen│
│ filter        │ Ja         │           │ gerät      │ keine Viren (*außer  │
│               │            │           │            │ 0,02 Mikron)         │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ SODIS (Solar) │ Ja/Ja/     │ 6-48 Std  │ Klare PET- │ Langsam; braucht     │
│               │ Teilweise  │           │ Flasche,   │ Sonne; nur 1-2 L     │
│               │            │           │ Sonnenlicht│ auf einmal           │
└───────────────┴────────────┴───────────┴────────────┴──────────────────────┘

Entscheidungslogik:
- Feuer + Metalltopf vorhanden?     → Abkochen (zuverlässigste Methode)
- Chemietabletten vorhanden?        → Chemische Behandlung
- Filter + Tabletten-Kombination?   → Filtern dann behandeln (Doppelschutz)
- Sonniger Tag + klare PET-Flaschen?→ SODIS als Reservemethode
- Mehrere Methoden verfügbar?       → Zwei verwenden für maximale Sicherheit
```

**Erwartet:** Eine klare Entscheidung, welche Reinigungsmethode(n) basierend auf verfügbaren Werkzeugen verwendet werden.

**Bei Fehler:** Wenn keine Standard-Reinigungswerkzeuge verfügbar sind, ist Abkochen die Standardmethode — es erfordert nur Feuer und einen hitzebeständigen Behälter. Selbst eine einwandige Metall-Trinkflasche kann zum Abkochen verwendet werden. In einer extremen Notlage kann ein Behälter aus einer Felsvertiefung oder einem grünen Bambusabschnitt in Feuernähe improvisiert werden.

### Schritt 4: Wasser abkochen

Die zuverlässigste Feld-Reinigungsmethode. Tötet alle Erregerklassen.

```
Abkochverfahren:
1. Wasser zum WALLENDEN KOCHEN bringen (große Blasen durchbrechen die Oberfläche)
2. Wallendes Kochen aufrechterhalten für:
   - Meereshöhe bis 2000 m:      1 Minute
   - 2000-4000 m:                3 Minuten
   - Über 4000 m:                5 Minuten
3. Vom Feuer nehmen
4. Im abgedeckten Behälter abkühlen lassen
5. Wenn der Geschmack fade ist, zwischen zwei Behältern mehrmals umgießen zum Belüften

Höhenanpassung:
  Wasser kocht in der Höhe bei niedrigeren Temperaturen.
  Auf 3000 m kocht Wasser bei ~90°C.
  Längeres Kochen kompensiert die niedrigere Temperatur.

Brennstoffschätzung:
  1 L Abkochen erfordert ca. 15-20 Min. anhaltendes Feuer,
  abhängig von Behälter, Wind und Ausgangstemperatur.
```

**Erwartet:** Wasser erreicht ein kräftiges wallendes Kochen und wird für die höhenangepasste Dauer aufrechterhalten. Nach dem Abkühlen ist das Wasser frei von biologischen Krankheitserregern.

**Bei Fehler:** Wenn kein wallendes Kochen aufrechterhalten werden kann (Wind, schwaches Feuer), die Kochzeit verlängern. Wenn der Behälter undicht wird oder reißt, in ein anderes Gefäß umfüllen. Wenn kein Metallbehälter verfügbar ist, kann Wasser in einem Holz-, Rinden- oder Lederbehälter mit heißen Steinen gekocht werden: Steine 20+ Minuten im Feuer erhitzen, dann mit Stöcken oder Zangen in den Wasserbehälter überführen. Flusssteine meiden (können durch eingeschlossene Feuchtigkeit platzen oder explodieren).

### Schritt 5: Chemische Behandlung anwenden

Verwenden, wenn Abkochen unpraktisch ist oder als Zweitbehandlung.

```
Dosierungen für chemische Behandlung:
┌─────────────────────┬──────────────────┬────────────┬─────────────────────┐
│ Chemikalie          │ Dosis pro Liter  │ Wartezeit  │ Hinweise            │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Chlordioxid-        │ Laut Hersteller  │ 30 Min     │ Wirksamste chemi-   │
│ Tabletten           │ (meist 1 Tab     │ (4 Std für │ sche Methode; tötet │
│ (z.B. Aquamira,     │ pro 1 L)         │ Crypto)    │ alle Erreger        │
│ Katadyn Micropur)   │                  │            │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Jodtabletten        │ 1-2 Tabletten    │ 30 Min     │ Schwach gegen       │
│                     │ pro Liter        │            │ Cryptosporidium     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Jodtinktur          │ 5 Tropfen pro    │ 30 Min     │ Doppelte Dosis für  │
│ (2%)                │ Liter (klar)     │ (60 Min    │ trübes Wasser       │
│                     │ 10 Tropfen pro   │ wenn kalt/ │                     │
│                     │ Liter (trüb)     │ trüb)      │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Haushaltsbleiche    │ 2 Tropfen pro    │ 30 Min     │ Muss unparfümiert,  │
│ (5-8% Natrium-      │ Liter (klar)     │            │ reine Bleiche sein; │
│ hypochlorit)        │ 4 Tropfen pro    │            │ Verfallsdatum       │
│                     │ Liter (trüb)     │            │ prüfen              │
└─────────────────────┴──────────────────┴────────────┴─────────────────────┘

Nach der Behandlung sollte das Wasser einen leichten Chlor-/Jodgeruch haben.
Wenn kein Geruch feststellbar ist, die halbe ursprüngliche Dosis hinzufügen
und weitere 15 Min warten.

Anpassung für kaltes/trübes Wasser:
- Temperatur unter 5°C: Wartezeit verdoppeln
- Trübes Wasser: Dosis verdoppeln ODER vorher filtern (empfohlen)
```

**Erwartet:** Behandeltes Wasser hat nach der Wartezeit einen schwachen chemischen Geruch, was ausreichende Desinfektion anzeigt. Wasser ist sicher vor Bakterien und Viren; Chlordioxid ist auch gegen Parasiten wirksam.

**Bei Fehler:** Wenn Tabletten abgelaufen sind (kein Geruch nach Behandlung), doppelte Dosis verwenden oder mit einer anderen Methode kombinieren. Wenn der Geschmack unangenehm ist, das Wasser 30 Minuten offen stehen lassen zum Ausgasen, oder durch einen improvisierten Holzkohlefilter gießen, um den Geschmack zu verbessern. Wenn chemische Behandlung die einzige Methode ist und Cryptosporidium vermutet wird (häufig in der Nähe von Vieh), die vollen 4 Stunden für Chlordioxid warten oder mit Filtration kombinieren.

### Schritt 6: Sicher lagern

Gereinigtes Wasser kann durch schmutzige Behälter oder Hände rekontaminiert werden.

```
Sichere Lagerungspraktiken:
1. In sauberen, dafür vorgesehenen Behältern lagern (keine ungereinigten Behälter wiederverwenden)
2. Bei Wiederverwendung eines Behälters diesen mit einer kleinen Menge gereinigtem Wasser spülen
3. Behälter verschlossen oder abgedeckt halten
4. "Roh-" und "Gereinigt"-Behälter markieren oder trennen
   (z.B. einen Knoten ins Paracord des gereinigten Behälters)
5. Nicht mit den Händen in Behälter greifen — gießen, nicht eintauchen
6. Bei warmem Wetter innerhalb von 24 Stunden verbrauchen
7. Wasser, das länger als 24 Stunden gelagert wurde, erneut behandeln

Hydrationsplanung:
- Minimum: 2 L pro Tag (sitzend, kühles Wetter)
- Aktiv: 4-6 L pro Tag (Wandern, heißes Wetter)
- Reinigungskapazität auf den Tagesbedarf abstimmen
```

**Erwartet:** Gereinigtes Wasser bleibt in sauberen, verschlossenen Behältern sicher. Ein System zur Vermeidung von Kreuzkontamination zwischen rohem und behandeltem Wasser ist vorhanden.

**Bei Fehler:** Wenn Behälter begrenzt sind, einen als "Roh" (nur Sammlung) und einen als "Sauber" (nur Gereinigtes) bestimmen. Deutlich markieren oder ritzen. Bei Verdacht auf Rekontamination das Wasser vor dem Trinken erneut behandeln.

## Validierung

- [ ] Wasserquelle wurde bewertet und die beste verfügbare Option gewählt
- [ ] Sediment wurde vor der Reinigung aus trübem Wasser vorgefiltert
- [ ] Reinigungsmethode war für verfügbare Werkzeuge und Bedingungen geeignet
- [ ] Abkochen erreichte und hielt ein wallendes Kochen für die höhenangepasste Dauer
- [ ] Chemische Behandlung verwendete korrekte Dosierung und Wartezeit
- [ ] Gereinigtes Wasser in sauberen, verschlossenen, markierten Behältern gelagert
- [ ] Ausreichend Wasser gereinigt, um den täglichen Hydrationsbedarf zu decken

## Häufige Fehler

- **Vorfilterung überspringen**: Sediment reduziert die chemische Wirksamkeit und verstopft Filter. Trübes Wasser immer vorfiltern
- **Unvollständiges Kochen**: Ein paar Blasen am Boden sind kein wallendes Kochen. Auf kräftige, die Oberfläche durchbrechende Blasen warten
- **Höhe ignorieren**: Wasser kocht in der Höhe bei niedrigeren Temperaturen. Kochzeit entsprechend verlängern
- **Chemische Unterdosierung**: Kaltes oder trübes Wasser erfordert mehr Chemie oder längere Kontaktzeit
- **Kreuzkontamination**: Denselben Behälter für rohes und gereinigtes Wasser verwenden oder den Trinkrand mit schmutzigen Händen berühren
- **Bei schlechtesten Quellen auf eine einzige Methode verlassen**: Bei stagnierendem oder viehnahem Wasser zwei Methoden verwenden (z.B. Filter + Chemie oder Abkochen + Chemie)

## Verwandte Skills

- `make-fire` — erforderlich für die Abkochmethode; Feuer bietet auch Wärme während der Wartezeit bei chemischer Behandlung
- `forage-plants` — einige Pflanzen zeigen nahegelegene Wasserquellen an (Weiden, Rohrkolben, Pappeln); gesammelte Nahrung kann sauberes Wasser zur Zubereitung erfordern
