---
name: prepare-soil
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Gartenboden durch Tests, Verbesserung, Kompostierung und biodynamische
  Praeparate bewerten und verbessern. Umfasst Glastest, Spatentest,
  Regenwurmzaehlung, Verbesserung nach Bodentyp (Ton, Sand, erschoepft,
  verdichtet), Kompostierungsmethoden (heiss, kalt, Vermikompostierung),
  No-Till-Praktiken, Gruenduengung und biodynamische Praeparate 500-508.
  Anwenden beim Anlegen eines neuen Gartenbeets, wenn Pflanzen trotz
  ausreichend Wasser und Licht schlecht gedeihen, bei der Umstellung auf
  biologische oder biodynamische Praxis, wenn der Boden verdichtet oder
  erschoepft ist, oder beim Aufbau eines Kompostiersystems.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gardening
  complexity: intermediate
  language: natural
  tags: gardening, soil, compost, biodynamic, amendment, no-till, cover-crop
---

# Boden vorbereiten

Bodenzustand bewerten und gesunden, lebenden Boden durch Verbesserung, Kompostierung und biologische Aktivierung aufbauen.

## Wann verwenden

- Ein neues Gartenbeet wird angelegt und der vorhandene Boden muss bewertet werden
- Pflanzen gedeihen trotz ausreichend Wasser und Licht schlecht (der Boden ist wahrscheinlich die Ursache)
- Umstellung von konventioneller auf biologische oder biodynamische Praxis
- Boden ist verdichtet, erschoepft oder hydrophob geworden
- Ein Kompostiersystem muss aufgebaut werden
- Biodynamische Praeparate (500-508) sollen angewendet werden

## Eingaben

- **Erforderlich**: Zugang zum zu bewertenden Boden (Gartenbeet, Feld oder Gefaess)
- **Optional**: Aktuelle Bodenanalyseergebnisse (pH, N-P-K, organische Substanz %)
- **Optional**: Gartenhistorie (vorherige Kulturen, angewandte Verbesserungen, Jahre der Bewirtschaftung)
- **Optional**: Zielkulturen oder -pflanzen
- **Optional**: Ansatzpraeferenz (biologisch, biodynamisch, Permakultur)

## Vorgehensweise

### Schritt 1: Den Boden bewerten

Drei Feldtests die kein Labor erfordern — alle drei durchfuehren.

```
Test 1: Glastest (Textur — Sand/Schluff/Ton-Verhaeltnis)
1. Ein Einmachglas zu 1/3 mit Boden aus 15cm Tiefe fuellen
2. Bis oben mit Wasser fuellen, 1 Essloeffel Spuelmittel zugeben
3. 3 Minuten kraeftig schuetteln, dann auf ebene Flaeche stellen
4. Schichten nach dem Absetzen ablesen:
   - Sand setzt sich in 1 Minute ab (unterste Schicht)
   - Schluff setzt sich in 4-6 Stunden ab (mittlere Schicht)
   - Ton setzt sich in 24-48 Stunden ab (oberste Schicht)
5. Jede Schicht als % der Gesamtbodentiefe messen
   - Idealer Gartenboden: ~40% Sand, ~40% Schluff, ~20% Ton (Lehm)

Test 2: Spatentest (Struktur und Verdichtung)
1. Einen Spaten in feuchten Boden bis zur vollen Tiefe (25cm)
   druecken
2. Einen Bodenblock heraushebeln und auf ein Brett legen
3. Beobachten:
   - Zerkruemelt leicht -> gute Struktur
   - Bricht in kantige Bloecke -> verdichtet
   - Schmiert oder ist klebrig -> zu viel Ton oder staunass
   - Schichten sichtbar -> Pflugsohle vorhanden
4. Am Boden riechen:
   - Suess, erdig -> gesunde aerobe Biologie
   - Sauer, schweflig -> anaerobe Bedingungen (Drainageproblem)

Test 3: Regenwurmzaehlung (Biologische Aktivitaet)
1. Einen 30cm x 30cm x 30cm Wuerfel Boden ausgraben
2. Auf eine Plane oder ein Brett legen
3. Vorsichtig auseinanderbrechen und Regenwuermer zaehlen
   - 0-5: Schwache Biologie — braucht organische Substanz
   - 5-10: Maessig — verbessernd aber noch nicht gedeihend
   - 10-20: Gut — gesunde biologische Aktivitaet
   - 20+: Hervorragend — dieser Boden lebt
```

**Erwartet:** Klares Bild von Bodentextur, Struktur und Biologie. Ein Glastest-Ergebnis, eine Strukturbewertung und eine Wurmzaehlung.

**Bei Fehler:** Wenn Glastest-Schichten schwer zu unterscheiden sind, mit sauberem Wasser und kraeftigerem Schuetteln wiederholen. Wenn die Wurmzaehlung null ist und der Boden sauer riecht, ist der Boden moeglicherweise anaerob — die Drainage muss vor der Verbesserung adressiert werden.

### Schritt 2: Diagnose stellen und Verbesserung planen

Die Bewertung einem Verbesserungsplan zuordnen.

```
Verbesserung nach Bodentyp:
┌────────────────┬─────────────────────────┬──────────────────────────────┐
│ Diagnose       │ Symptome                │ Verbesserung                 │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Schwerer Ton   │ Klebrig, langsame       │ Gips (Calciumsulfat) 1 kg/m²│
│                │ Drainage, >40% Ton      │ in obere 15cm einarbeiten.   │
│                │ im Glastest             │ Groben Kompost hinzufuegen.  │
│                │                         │ Oelrettich zur biologischen  │
│                │                         │ Aufbrechung der Pflugsohle.  │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Sandig         │ Draeniert sofort, haelt │ Kompost 5-10cm dick, in      │
│                │ keine Feuchtigkeit,     │ obere 20cm einarbeiten.      │
│                │ <20% Schluff+Ton        │ Pflanzenkohle (vorgeladen    │
│                │ im Glastest             │ mit Komposttee) fuer         │
│                │                         │ Feuchtigkeitshaltung.        │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Erschoepft     │ Blasse Farbe, niedrige  │ 10cm Kompost als Mulch.      │
│                │ Wurmzahl, schlechtes    │ Gruenduengung (Leguminosen-  │
│                │ Wachstum trotz          │ mischung) zur Stickstoff-    │
│                │ Bewaesserung            │ fixierung. Blatt-Seetang-    │
│                │                         │ spray monatlich.             │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Verdichtet     │ Kantige Bloecke im      │ Grabegabel (kein Rototiller) │
│                │ Spatentest, Oberflaech- │ zum Auflockern ohne Wenden.  │
│                │ enpfuetzen, hart wenn   │ Dicker Mulch (15cm Holz-     │
│                │ trocken                 │ haecksel auf Wegen). Tief-   │
│                │                         │ wurzelnden Beinwell pflanzen. │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Sauer (pH<6)   │ Heidelbeeren gedeihen   │ Holzasche (leichte Gabe)     │
│                │ aber Kohlgewaechse      │ oder Dolomitkalk. pH vorher  │
│                │ kaempfen                │ und nachher testen — langsam │
│                │                         │ ueber 2 Saisons anpassen.   │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Alkalisch      │ Eisenchlorose (gelbe    │ Elementarer Schwefel oder    │
│ (pH>7)         │ Blaetter, gruene Adern) │ saurer Kompost (Kiefern-     │
│                │                         │ nadeln, Eichenlaub). Sehr    │
│                │                         │ langsam zu verschieben.      │
└────────────────┴─────────────────────────┴──────────────────────────────┘
```

**Erwartet:** Ein spezifischer Verbesserungsplan der dem diagnostizierten Bodenzustand entspricht.

**Bei Fehler:** Wenn sich mehrere Zustaende ueberschneiden (z.B. schwerer Ton UND erschoepft), zuerst die Struktur adressieren (Gips + Grabegabel), dann die Biologie (Kompost + Gruenduengung). Alles gleichzeitig beheben zu wollen ueberfordert den Boden.

### Schritt 3: Kompost aufbauen

Eine Methode basierend auf verfuegbarem Platz, Material und Zeitrahmen waehlen.

```
Kompostierungsmethoden:
┌────────────────┬──────────────┬──────────────┬─────────────────────────┐
│ Methode        │ Zeit bis     │ Platz-       │ Am besten fuer          │
│                │ fertig       │ bedarf       │                         │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Heisskompost   │ 4-8 Wochen   │ 1m³ Minimum  │ Grosse Gaerten, Unkraut-│
│                │              │              │ samen / Krankheitsabt.  │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Kaltkompost    │ 6-12 Monate  │ Beliebig     │ Geringer Aufwand, kleine│
│                │              │              │ Mengen                  │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Wurmkompost    │ 3-6 Monate   │ 0,5m² Innen  │ Kuechenabfaelle, Innen- │
│                │              │              │ / Balkongazerten         │
└────────────────┴──────────────┴──────────────┴─────────────────────────┘

Heisskompost-Protokoll:
1. Haufen in Schichten aufbauen — 2 Teile Braun (Kohlenstoff) zu
   1 Teil Gruen (Stickstoff)
   - Braun: getrocknete Blaetter, Stroh, Karton, Holzhaecksel
   - Gruen: Kuechenabfaelle, frisches Gras, Mist, Kaffeesatz
2. Jede Schicht befeuchten (Konsistenz eines ausgedrueckten Schwamms)
3. Haufen muss mindestens 1m x 1m x 1m sein um Temperatur zu
   erreichen
4. Innentemperatur sollte innerhalb von 3-5 Tagen 55-65°C erreichen
5. Haufen wenden wenn Temperatur unter 45°C faellt (alle 5-7 Tage)
6. Nach 3-4 Mal Wenden 2-4 Wochen ohne Wenden nachreifen lassen
7. Fertiger Kompost: dunkel, kruemelig, riecht nach Waldboden,
   keine erkennbaren Ausgangsstoffe

Nie kompostieren:
- Fleisch, Milchprodukte, Oele (ziehen Schaedlinge an)
- Krankes Pflanzenmaterial (es sei denn Heisskompost erreicht
  60°C+ fuer 3 Tage)
- Behandeltes Holz, Hochglanzpapier
- Haustierkot (Pathogenrisiko)
```

**Erwartet:** Kompostiersystem eingerichtet und erste Charge in Bearbeitung.

**Bei Fehler:** Wenn Heisskompost nicht warm wird: Feuchtigkeit pruefen (zu trocken oder zu nass), C:N-Verhaeltnis pruefen (mehr Gruen fuer Stickstoff hinzufuegen), Haufengroesse pruefen (unter 1m³ heizt nicht zuverlaessig).

### Schritt 4: No-Till und Gruenduengung anwenden

Bodenstruktur schuetzen und aufbauen ohne Wenden.

```
No-Till-Flaechenmulch (Neues Beet aus Rasen oder Unkraut):
1. Bestehende Vegetation so niedrig wie moeglich maehen oder sensen
2. Karton (ueberlappende Kanten) direkt auf den Boden legen — keine
   Luecken
3. Karton gruendlich naessen
4. 5cm Kompost auf den Karton geben
5. 10-15cm organischen Mulch auftragen (Stroh, Holzhaecksel,
   Blaetter)
6. 3-6 Monate warten (Herbstausbringung -> Fruehlingspflanzung)
7. Durch den Mulch pflanzen indem er zur Seite geschoben wird —
   nicht umgraben

Gruenduenung-Kurzuebersicht:
┌─────────────────┬────────────────┬───────────────────────────────┐
│ Kultur          │ Saison         │ Nutzen                        │
├─────────────────┼────────────────┼───────────────────────────────┤
│ Inkarnatklee    │ Herbstaussaat  │ Stickstofffixierung,          │
│                 │                │ Bienenweide                   │
│ Winterroggen    │ Herbstaussaat  │ Biomasse, Unkrautunterd.      │
│ Buchweizen      │ Sommeraussaat  │ Schnelle Abdeckung,           │
│                 │                │ Phosphorerschliessung         │
│ Phacelia        │ Fruehling/     │ Bestaeubungsmagnet, bricht    │
│                 │ Herbst         │ Verdichtung auf               │
│ Oelrettich      │ Herbstaussaat  │ Tiefwurzel bricht Pflugsohle, │
│                 │                │ verrottet an Ort und Stelle   │
│                 │                │ ueber Winter (Bio-Bohrer)     │
└─────────────────┴────────────────┴───────────────────────────────┘

Gruenduengung beenden durch:
- Walzen und knicken (am besten — laesst Wurzeln an Ort und Stelle)
- Sensen und als Mulch ablegen
- Nie rototillen — das zerstoert die Bodenstruktur die aufgebaut wird
```

**Erwartet:** Boden ganzjaehrig bedeckt, Biologie ungestoert, organische Substanz zunehmend.

**Bei Fehler:** Wenn Gruenduengung nicht anwaechst, Saattiefe (die meisten brauchen oberflaechliche oder flache Aussaat) und Feuchtigkeit pruefen. Nachsaeen oder dicken Mulch als Ersatz-Bodenbedeckung auftragen.

### Schritt 5: Biodynamische Praeparate (optional — Fortgeschritten)

Fuer Praktizierende nach Demeter- oder biodynamischen Grundsaetzen.

```
Biodynamische Praeparate — Uebersicht:
┌──────┬───────────────┬──────────────────────┬─────────────────────────┐
│ Prae.│ Material      │ Anwendung            │ Zweck                   │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 500  │ Hornmist      │ Auf Boden spruehen,  │ Bodenbiologie anregen,  │
│      │               │ Herbst & Fruehling   │ Wurzelwachstum, Humus   │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 501  │ Hornkiesel    │ Auf Laub spruehen,   │ Lichtstoffwechsel,      │
│      │               │ Morgens, Sommer      │ Fruchtqualitaet, Reife  │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 502  │ Schafgarbe    │ Dem Kompost zugeben   │ Schwefel und Kalium     │
│ 503  │ Kamille       │ Dem Kompost zugeben   │ Calcium, stabilisiert N │
│ 504  │ Brennnessel   │ Dem Kompost zugeben   │ Eisen, regt Boden an   │
│ 505  │ Eichenrinde   │ Dem Kompost zugeben   │ Calcium, Krankheitsres. │
│ 506  │ Loewenzahn    │ Dem Kompost zugeben   │ Kieselsaeure, Lichtkr.  │
│ 507  │ Baldrian      │ Auf Kompost spruehen  │ Waerme, Phosphor        │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 508  │ Schachtelhalm │ Auf Laub spruehen    │ Pilzkrankheitsvorb.     │
└──────┴───────────────┴──────────────────────┴─────────────────────────┘

Praeparat-500-Anwendung:
1. 100g Hornmist in 35 Liter warmem Wasser ruehren
2. 1 Stunde dynamisch ruehren — Strudel erzeugen, umkehren,
   Strudel erzeugen (Richtung jede Minute wechseln)
3. Innerhalb 1 Stunde nach dem Ruehren ausbringen
4. In grossen Tropfen auf Bodenoberflaeche spruehen — spaeter
   Nachmittag, absteigender Mond
5. Herbst (vor Winter) und frueh im Fruehling (vor Aussaat) anwenden

Hinweis: Biodynamische Praeparate sind bei zertifizierten
Lieferanten oder lokalen biodynamischen Landwirtschaftsgruppen
erhaeltlich. Eigenherstellung erfordert die Praeparate der
Vorsaison und spezifische Tierhornhuellen.
```

**Erwartet:** Praeparate zur richtigen Zeit und Mondphase angewendet. Aktivierung der Bodenbiologie sichtbar ueber 1-2 Saisons.

**Bei Fehler:** Wenn Praeparate nicht verfuegbar sind, erreichen guter Kompost und Gruenduengung 80% des biologischen Nutzens. Praeparate verstaerken, sind aber kein Ersatz fuer solides Bodenmanagement.

### Schritt 6: Heal-Checkpoint — Nachverbesserungsbewertung

Sechs Wochen nach der Verbesserung den Boden neu bewerten.

```
Bodengesundheitspruefung nach Verbesserung:
1. Spatentest wiederholen:
   - Hat sich die Struktur verbessert? (Zerkruemelt leichter)
   - Dringen Wurzeln tiefer ein?
   - Noch verbleibende Pflugsohlen?

2. Regenwurmzaehlung wiederholen:
   - Hat die Zaehlung zugenommen? (Auch 2-3 mehr sind Fortschritt)
   - Sind Wuermer durch die Tiefe verteilt oder nur an der
     Oberflaeche?

3. Drainagetest:
   - Ein 30cm-Loch graben, mit Wasser fuellen, ablaufen lassen,
     nachfuellen
   - Zweite Fuellung sollte innerhalb von 1-4 Stunden ablaufen
   - <1 Stunde: Sehr frei draenierend (braucht moeglicherweise
     mehr organische Substanz)
   - >4 Stunden: Noch verdichtet oder tonlastig (Behandlung
     fortsetzen)

4. Oberflaechenbeobachtung:
   - Pilzfaeden im Mulch sichtbar? (Gut — Zersetzung aktiv)
   - Gruenalgen an der Oberflaeche? (Zu nass oder zu verdichtet)
   - Mulchschicht baut sich ab? (Biologie arbeitet)

Triage:
- Alles verbessert sich -> Aktuellen Ansatz fortsetzen, naechste
  Saison neu bewerten
- Struktur verbessert aber Wuermer niedrig -> Vielfaeltigere
  organische Substanz hinzufuegen
- Wuermer vorhanden aber Drainage schlecht -> Erneut mit Grabe-
  gabel lockern, grobes Material hinzufuegen
- Keine Verbesserung -> Boden hat moeglicherweise Kontamination —
  Labortest auf Schwermetalle in Betracht ziehen
```

**Erwartet:** Messbare Verbesserung bei mindestens 2 von 3 Indikatoren (Struktur, Biologie, Drainage).

**Bei Fehler:** Wenn nach 6 Wochen keine Verbesserung, liegt das Problem moeglicherweise tiefer als Oberboden-Verbesserung adressieren kann. Hochbeete mit importierter Erdmischung als parallele Strategie in Betracht ziehen, waehrend der In-Ground-Boden ueber mehrere Saisons weiter verbessert wird.

## Validierung

- [ ] Alle drei Feldtests durchgefuehrt (Glas, Spaten, Regenwurm)
- [ ] Bodentyp aus Testergebnissen korrekt diagnostiziert
- [ ] Verbesserungsplan entspricht diagnostiziertem Zustand
- [ ] Kompostiersystem eingerichtet (heiss, kalt oder Wurm)
- [ ] Boden ganzjaehrig bedeckt (Mulch, Gruenduengung oder lebende Pflanzen)
- [ ] Kein Rototillen oder Bodenwenden
- [ ] Heal-Checkpoint 6 Wochen nach Verbesserung durchgefuehrt
- [ ] Gartentagebuch mit Testergebnissen und angewandter Verbesserung aktualisiert

## Haeufige Stolperfallen

1. **Hinzufuegen ohne zu testen**: Wahllose Verbesserungen verschwenden Geld und koennen Ungleichgewichte verschlimmern. Immer zuerst testen
2. **Rototillen**: Fuehlt sich produktiv an, zerstoert aber Bodenstruktur, toetet Regenwuermer und bringt Unkrautsamen an die Oberflaeche. Bei Bedarf Grabegabel verwenden
3. **Nackter Boden**: Freiliegender Boden verliert Feuchtigkeit, Struktur und Biologie. Immer mulchen oder Gruenduengung pflanzen
4. **Frischer Mist auf Beeten**: Verbrennt Wurzeln und bringt Pathogene ein. Allen Mist mindestens 6 Monate kompostieren bevor er in Bodenkontakt kommt
5. **Kalken ohne pH zu testen**: Ueberkalken macht Naehrstoffe unverfuegbar. pH nur basierend auf tatsaechlichen Testergebnissen anpassen
6. **Sofortige Ergebnisse erwarten**: Bodenaufbau wird in Saisons und Jahren gemessen, nicht in Wochen

## Verwandte Skills

- `cultivate-bonsai` — Bonsai-Erdmischung (Akadama/Bimsstein/Lava) ist eine spezialisierte Bodenvorbereitung
- `plan-garden-calendar` — Zeitpunkt der Bodenverbesserung stimmt mit dem saisonalen Kalender ueberein (Herbst fuer Kalk, Fruehling fuer Kompost)
- `read-garden` — Bodenbeobachtung ist Teil des Gartenleseprotokolls
- `heal` — Die Nachverbesserungsbewertung folgt dem Heal-Triagemuster
- `forage-plants` — Verstaendnis von Boden-Pflanze-Beziehungen hilft beim Lesen von Wildpflanzen-Habitaten
- `make-fire` — Holzasche aus Feuer ist eine traditionelle Bodenverbesserung (Kalium + Kalk)
