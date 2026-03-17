---
name: document-insect-sighting
description: >
  Insektensichtungen mit Standort, Datum, Lebensraum, Fotografie,
  Verhaltensnotizen, vorlaeufiger Bestimmung und Citizen-Science-Meldung
  erfassen. Umfasst GPS-Koordinaten, Wetterbedingungen, Mikrohabitatbeschreibung,
  Makrofotografie-Techniken, Verhaltensbeobachtungen, vorlaeufige Bestimmung
  bis zur Ordnung anhand des Koerperbaus und Meldung an Citizen-Science-
  Plattformen wie iNaturalist. Verwenden beim Dokumentieren eines angetroffenen
  Insekts, beim Beitragen zu Citizen-Science-Biodiversitaetsdatenbanken, beim
  Fuehren eines persoenlichen Beobachtungstagebuchs oder beim Unterstuetzen
  oekologischer Erhebungen mit georeferenzierten fotografischen Aufzeichnungen.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: basic
  language: natural
  tags: entomology, insects, documentation, citizen-science, iNaturalist, photography
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Insektensichtung dokumentieren

Insektensichtungen mit strukturierten Daten, Qualitaetsfotografien und Citizen-Science-Meldung fuer Biodiversitaetsforschung erfassen.

## Wann verwenden

- Sie treffen ein Insekt an, das Sie fuer persoenliche Aufzeichnungen oder Forschung dokumentieren moechten
- Sie tragen Beobachtungen zu Citizen-Science-Plattformen wie iNaturalist oder BugGuide bei
- Sie fuehren ein systematisches Beobachtungstagebuch fuer einen Lebensraum oder eine Region
- Sie moechten oekologische Erhebungen mit georeferenzierten, fotografierten Aufzeichnungen unterstuetzen
- Sie sind Anfaenger und lernen, Insektenvielfalt wahrzunehmen und zu erfassen

## Eingaben

- **Erforderlich**: Eine Insektensichtung (lebendes Insekt im Feld oder kuerzlich angetroffenes Exemplar)
- **Erforderlich**: Eine Kamera oder ein Smartphone mit Nahaufnahme-Faehigkeit
- **Optional**: GPS-Geraet oder Smartphone mit aktivierten Standortdiensten
- **Optional**: Notizbuch oder Feldtagebuch fuer schriftliche Beobachtungen
- **Optional**: Handlupe (10x) fuer Feindetailbeobachtung
- **Optional**: Lineal oder Muenze als fotografische Groessenreferenz
- **Optional**: iNaturalist-Konto oder gleichwertiges Citizen-Science-Plattform-Konto

## Vorgehensweise

### Schritt 1: Standort, Datum und Wetter erfassen

Den Kontext erfassen, bevor man sich dem Insekt naehert. Viele Arten sind lebensraumspezifisch und saisonal aktiv, daher sind diese Metadaten ebenso wichtig wie das Foto selbst.

```
Sighting Record — Context:
+--------------------+------------------------------------------+
| Field              | Record                                   |
+--------------------+------------------------------------------+
| Date               | Full date and time (e.g., 2026-06-15,    |
|                    | 14:30 local time)                        |
+--------------------+------------------------------------------+
| Location           | GPS coordinates if available; otherwise   |
|                    | describe precisely (e.g., "south bank of |
|                    | Elm Creek, 200m east of footbridge")     |
+--------------------+------------------------------------------+
| Elevation          | Meters above sea level if available       |
+--------------------+------------------------------------------+
| Weather            | Temperature (estimate is fine), cloud     |
|                    | cover, wind, recent rain                 |
+--------------------+------------------------------------------+
| Season phase       | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
```

**Erwartet:** Ein vollstaendiger Kontextdatensatz mit Datum, Uhrzeit, praezisem Standort (idealerweise GPS-Koordinaten) und Wetterbedingungen zum Zeitpunkt der Beobachtung.

**Bei Fehler:** Wenn GPS nicht verfuegbar ist, den Standort relativ zu Orientierungspunkten beschreiben (Wegkreuzungen, Gebaeude, Gewaesser) mit genug Detail, dass der Ort wiedergefunden werden koennte. Wenn Wetterdaten unsicher sind, Temperaturbereich schaetzen und "bewoelkt" oder "klar" notieren, anstatt das Feld leer zu lassen.

### Schritt 2: Lebensraum und Mikrohabitat dokumentieren

Erfassen, wo innerhalb der Landschaft das Insekt gefunden wurde und welches unmittelbare Substrat oder welche Struktur es nutzte.

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Broad habitat      | Deciduous forest, grassland, wetland,    |
|                    | urban garden, riparian corridor, desert   |
+--------------------+------------------------------------------+
| Microhabitat       | Underside of leaf, bark crevice, flower   |
|                    | head, soil surface, under rock, on water  |
|                    | surface, in flight                       |
+--------------------+------------------------------------------+
| Substrate          | Specific plant species if known, dead     |
|                    | wood, dung, carrion, bare soil, rock     |
+--------------------+------------------------------------------+
| Plant association  | What plant is the insect on or near?     |
|                    | (host plant relationships are diagnostic) |
+--------------------+------------------------------------------+
| Light conditions   | Full sun, partial shade, deep shade       |
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, submerged margin          |
+--------------------+------------------------------------------+
```

**Erwartet:** Eine Beschreibung des Lebensraums, die das Insekt in einen oekologischen Kontext setzt, einschliesslich sowohl der breiten Landschaft als auch des unmittelbaren Mikrohabitats, in dem das Insekt gefunden wurde.

**Bei Fehler:** Wenn das Mikrohabitat schwer zu charakterisieren ist (z.B. Insekt im Flug), notieren, in der Naehe wovon es flog oder worauf es landete. "Im Flug, 1m ueber Wiesengraesern" erfassen, anstatt das Feld leer zu lassen.

### Schritt 3: Mit diagnostischer Qualitaet fotografieren

Gute Fotografien sind das einzelne wichtigste Element einer Sichtungsaufzeichnung. Citizen-Science-Bestimmungen stuetzen sich fast ausschliesslich auf Bildqualitaet.

```
Photography Protocol:

Shots to take (in priority order):
1. DORSAL (top-down) — shows wing pattern, body shape, coloration
2. LATERAL (side view) — shows leg structure, body profile, antennae
3. FRONTAL (head-on) — shows eyes, mouthparts, antennae base
4. VENTRAL (underside) — if accessible, shows leg joints, abdominal pattern
5. SCALE REFERENCE — place a coin, ruler, or finger near the insect
   for size comparison (do not touch the insect)

Tips for quality macro photographs:
- Get as close as your camera allows while maintaining focus
- Use natural light; avoid flash if possible (causes glare and flattens detail)
- Shoot against a neutral background when feasible (leaf, paper, hand)
- Hold the camera parallel to the insect's body plane for maximum sharpness
- Take multiple shots at each angle — at least 3 per view
- If the insect is moving, use burst mode or continuous shooting
- Photograph the insect in situ first, then closer shots if it remains
- Include at least one photo showing the insect in its habitat context
- If wings are open, photograph quickly — the pattern may change when
  wings close (especially butterflies and dragonflies)
```

**Erwartet:** Mindestens 3 verwendbare Fotografien: eine dorsal, eine lateral und eine mit Groessenreferenz. Idealerweise 5 oder mehr Bilder aus mehreren Winkeln.

**Bei Fehler:** Wenn das Insekt sich bewegt, bevor mehrere Winkel eingefangen werden koennen, die Dorsalansicht (von oben) priorisieren, da sie die meisten diagnostischen Informationen fuer die Bestimmung traegt. Ein einzelnes scharfes Dorsalfoto ist besser als mehrere unscharfe Bilder. Wenn das Insekt wegfliegt, bevor ein Foto gemacht werden konnte, sofort die Koerperform skizzieren und Farben aus dem Gedaechtnis notieren.

### Schritt 4: Verhalten und Interaktionen notieren

Verhaltensbeobachtungen fuegen oekologischen Wert hinzu, den Fotografien allein nicht erfassen koennen.

```
Behavioral Notes:
+--------------------+------------------------------------------+
| Category           | Record what you observe                  |
+--------------------+------------------------------------------+
| Activity           | Feeding, flying, resting, mating,        |
|                    | ovipositing (egg-laying), burrowing,     |
|                    | grooming, basking                        |
+--------------------+------------------------------------------+
| Movement           | Crawling, hovering, darting, undulating   |
|                    | flight, walking on water, jumping        |
+--------------------+------------------------------------------+
| Feeding            | What is it eating? Nectar, pollen, leaf   |
|                    | tissue, other insects, dung, sap?        |
+--------------------+------------------------------------------+
| Interactions       | Other insects nearby? Being predated?     |
|                    | Ants attending? Parasites visible?        |
+--------------------+------------------------------------------+
| Sound              | Buzzing, clicking, stridulation (wing or  |
|                    | leg rubbing)? Silent?                    |
+--------------------+------------------------------------------+
| Abundance          | Solitary individual, a few, many (swarm,  |
|                    | aggregation)?                            |
+--------------------+------------------------------------------+
| Duration           | How long did you observe?                 |
+--------------------+------------------------------------------+
```

**Erwartet:** Mindestens 3 Verhaltensbeobachtungen erfasst: Aktivitaet, Bewegungsmuster und Haeufigkeit.

**Bei Fehler:** Wenn das Insekt nur kurz angetroffen wird (z.B. landet und sofort wegfliegt), erfassen, was beobachtet wurde, und die Beobachtungsdauer notieren. Selbst "ruhend auf Blattoberflaeche, einzeln, flog bei Annaeherung weg, Beobachtungsdauer 5 Sekunden" sind nuetzliche Daten.

### Schritt 5: Vorlaeufige Bestimmung bis zur Ordnung

Sie muessen die Art nicht bestimmen. Das Insekt in seine Ordnung einzuordnen grenzt die Bestimmung erheblich ein und hilft Citizen-Science-Gutachtern.

```
Quick Key to Major Insect Orders:

1. Count the legs.
   - 6 legs → insect (proceed below)
   - 8 legs → arachnid (spider, tick, mite) — not an insect
   - More than 8 legs → myriapod (centipede, millipede) — not an insect
   - Wings but hard to count legs → likely insect; look at wings

2. Examine the wings.
   - Hard front wings (elytra) covering body → Coleoptera (beetles)
   - Scaly wings, often colorful → Lepidoptera (butterflies/moths)
   - Two wings + knob-like halteres → Diptera (flies)
   - Four membranous wings + narrow waist → Hymenoptera (bees/wasps/ants)
   - Half-leathery, half-membranous front wings → Hemiptera (true bugs)
   - Large, transparent wings + long abdomen → Odonata (dragonflies/damselflies)
   - Straight, narrow, leathery front wings → Orthoptera (grasshoppers/crickets)
   - No wings, laterally flattened, jumps → Siphonaptera (fleas)
   - No wings, pale body, in wood or soil → Isoptera (termites)

3. If unsure, note: "Order uncertain — resembles [description]"
```

**Erwartet:** Eine vorlaeufige Bestimmung bis zur Ordnung (z.B. "Coleoptera — Kaefer") oder ein ehrliches "Ordnung unsicher" mit einer physischen Beschreibung.

**Bei Fehler:** Wenn das Insekt keiner Ordnung im Schnellschluessel eindeutig entspricht, Koerperform, Fluegeltyp und Beinzahl erfassen. Plattformen wie iNaturalist akzeptieren "Insecta" als Ausgangsbestimmung, und Gemeinschaftsbestimmer werden sie verfeinern. Ein ehrliches "unbekannt" ist immer besser als eine erzwungene Vermutung.

### Schritt 6: An Citizen-Science-Plattform melden

Die Sichtung auf eine Plattform hochladen, auf der Experten und Gemeinschaftsbestimmer die Bestimmung verifizieren und verfeinern koennen.

```
Submission Checklist for iNaturalist (or equivalent):

1. Upload photographs — start with the best dorsal shot
2. Set location — use the map pin or enter GPS coordinates
3. Set date and time of observation
4. Add initial identification (order or family if known; "Insecta" if not)
5. Add observation notes:
   - Habitat and microhabitat
   - Behavior observed
   - Approximate size
   - Any sounds produced
6. Mark as "wild" (not captive/cultivated)
7. Set location accuracy — use the uncertainty circle to reflect GPS precision
8. Submit and monitor for community identifications

Data Quality Tips:
- Observations with 3+ photos from different angles get identified faster
- Including habitat context in one photo helps remote identifiers
- Adding a size reference dramatically improves identification accuracy
- Responding to identifier questions speeds up the process
- "Research Grade" status requires 2+ agreeing identifications at species level
```

**Erwartet:** Eine vollstaendige Beobachtung, gemeldet an eine Citizen-Science-Plattform mit Fotografien, Standort, Datum und vorlaeufiger Bestimmung, bereit fuer die Gemeinschaftsueberpruefung.

**Bei Fehler:** Wenn im Feld kein Internetzugang verfuegbar ist, alle Fotografien und Notizen lokal speichern mit der Absicht, spaeter hochzuladen. Die meisten Plattformen erlauben rueckdatierte Meldungen. Wenn Sie kein Konto haben, die Aufzeichnung in Ihrem persoenlichen Tagebuch speichern — die Daten haben dennoch Wert fuer Ihr eigenes Lernen und koennen spaeter hochgeladen werden.

## Validierung

- [ ] Datum, Uhrzeit und praeziser Standort wurden vor Annaeherung an das Insekt erfasst
- [ ] Wetter- und Lebensraumkontext wurden dokumentiert
- [ ] Mindestens 3 Fotografien aus verschiedenen Winkeln wurden aufgenommen
- [ ] Mindestens eine Fotografie enthaelt eine Groessenreferenz
- [ ] Verhalten und Aktivitaet wurden notiert
- [ ] Eine vorlaeufige Bestimmung bis zur Ordnung wurde versucht (oder ehrlich als unbekannt markiert)
- [ ] Die Beobachtung wurde an eine Citizen-Science-Plattform gemeldet oder in einem strukturierten Tagebuch gespeichert

## Haeufige Stolperfallen

- **Zu schnelles Annaeherung**: Viele Insekten fliehen bei schneller Annaeherung. Langsam bewegen und vermeiden, den eigenen Schatten ueber das Objekt zu werfen. Zuerst von weiter weg fotografieren, dann schrittweise naeher kommen
- **Lebensraumkontext ignorieren**: Ein Foto eines Insekts auf einer weissen Wand verliert den oekologischen Kontext. Immer mindestens ein In-situ-Foto einschliessen, das das Insekt in seiner natuerlichen Umgebung zeigt
- **Auf ein einzelnes Foto verlassen**: Ein Bild reicht oft nicht fuer die Bestimmung. Fluegelmuster, Beinstruktur und Fuehler sind moeglicherweise nur aus bestimmten Winkeln sichtbar
- **Massstab vergessen**: Ohne Groessenreferenz koennen ein 5mm-Kaefer und ein 50mm-Kaefer auf Fotos identisch aussehen. Immer eine Muenze, ein Lineal oder einen Finger als Massstab einschliessen
- **Bestimmung erzwingen**: Eine zuversichtliche aber falsche Bestimmung auf Citizen-Science-Plattformen einzureichen erzeugt Rauschen fuer Forscher. "Insecta" oder "Ordnung unbekannt" ist immer akzeptabel und gegenueber einer falschen Gattung oder Art vorzuziehen
- **Negativbefunde nicht erfassen**: "Keine Insekten auf Seidenpflanzenbestand beobachtet" sind wertvolle Abwesenheitsdaten fuer Erhebungen. Erfassen, was geprueft wurde, nicht nur was gefunden wurde

## Verwandte Skills

- `identify-insect` — Detailliertes morphologisches Bestimmungsverfahren, wenn ueber die vorlaeufige Ordnungszuordnung hinausgegangen werden muss
- `observe-insect-behavior` — Strukturierte ethologische Beobachtungsprotokolle fuer vertiefte Verhaltensstudien
- `collect-preserve-specimens` — Wenn ein physisches Exemplar fuer definitive Bestimmung benoetigt wird
- `survey-insect-population` — Einzelsichtungen zu systematischen populationsbezogenen Erhebungen skalieren
