---
name: ornament-style-mono
description: >
  Monochrome Ornamentmuster auf Basis der klassischen Ornamenttaxonomie von
  Alexander Speltz entwerfen. Umfasst historische Periodenauswahl, strukturelle
  Motivanalyse, Prompt-Konstruktion fuer Strichzeichnungen und Silhouetten-Rendering
  sowie KI-gestuetzte Bildgenerierung ueber Z-Image. Verwenden, wenn dekorative
  Raender, Medaillons oder Friese in einer Farbe erstellt, historische Ornamentstile
  durch generative KI erkundet, Strichzeichnungen oder Federzeichnungen klassischer
  Motive erzeugt oder Referenzbilder fuer Design- oder Lehrmaterialien generiert
  werden sollen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, monochrome, art-history, speltz, generative-ai, z-image
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Ornamentstil — Monochrom

Monochrome Ornamentmuster durch die Verbindung kunsthistorischen Wissens ueber klassische Ornamentik mit KI-gestuetzter Bildgenerierung entwerfen. Jedes Design ist in einer spezifischen historischen Periode und Motivtradition aus Alexander Speltz' *The Styles of Ornament* (1904) verankert.

## Wann verwenden

- Dekorative Raender, Medaillons, Friese oder Paneele in einer Farbe erstellen
- Historische Ornamentstile durch generative KI erkunden
- Strichzeichnungen, Silhouetten, Holzschnitte oder Federzeichnungen klassischer Motive erzeugen
- Referenzbilder fuer Design, Illustration oder Lehrmaterialien generieren
- Die strukturelle Grammatik von Ornamenttraditionen ueber Kulturen und Epochen studieren

## Eingaben

- **Erforderlich**: Gewuenschte historische Periode oder Stil (oder "ueberrasche mich" fuer zufaellige Auswahl)
- **Erforderlich**: Anwendungskontext (Rand, Medaillon, Fries, Paneel, Kachel, eigenstaendiges Motiv)
- **Optional**: Spezifische Motivpraeferenz (Akanthus, Palmette, Maeander, Arabeske usw.)
- **Optional**: Rendering-Stil-Praeferenz (Strichzeichnung, Silhouette, Holzschnitt, Federzeichnung, Kupferstich)
- **Optional**: Zielaufloesung und Seitenverhaeltnis
- **Optional**: Seed-Wert fuer reproduzierbare Generierung

## Vorgehensweise

### Schritt 1: Historische Periode waehlen

Eine Periode aus der klassischen Ornamenttaxonomie waehlen. Jede Periode hat charakteristische Motive und strukturelle Prinzipien.

```
Historical Ornament Periods:
┌───────────────────┬─────────────────┬──────────────────────────────────────────┬──────────────────────┐
│ Period            │ Date Range      │ Key Motifs                               │ Mono Suitability     │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lotus, papyrus, scarab, winged disk,     │ Excellent — bold     │
│                   │                 │ uraeus, ankh                             │ geometric forms      │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Greek             │ 800–31 BCE      │ Meander/Greek key, palmette, anthemion,  │ Excellent — high     │
│                   │                 │ acanthus, guilloche, egg-and-dart        │ contrast geometry    │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Acanthus scroll, rosette, grotesque,     │ Very good — dense    │
│                   │                 │ candelabra, rinceau, trophy              │ carved relief style  │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Interlace, vine scroll, cross forms,     │ Good — flat          │
│                   │                 │ basket weave, peacock, chi-rho           │ silhouette style     │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Islamic           │ 7th–17th c.     │ Arabesque, geometric star, muqarnas,     │ Excellent — pure     │
│                   │                 │ tessellation, knotwork, calligraphic     │ geometric abstraction│
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Interlace, beast chains, chevron,        │ Very good — heavy    │
│                   │                 │ billet, zigzag, inhabited scroll         │ carved stone quality │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Trefoil, quatrefoil, crocket,           │ Very good — tracery  │
│                   │                 │ finial, tracery, naturalistic leaf       │ and window patterns  │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Grotesque, candelabra, putto,           │ Good — engraving     │
│                   │                 │ medallion, festoon, cartouche           │ and woodcut styles   │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ C-scroll, S-scroll, shell, asymmetric   │ Moderate — complex   │
│                   │                 │ cartouche, garland, ribbon              │ forms benefit from   │
│                   │                 │                                          │ color for depth      │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Whiplash curve, organic line, lily,     │ Excellent — defined  │
│                   │                 │ dragonfly, femme-fleur, sinuous vine    │ by line quality      │
└───────────────────┴─────────────────┴──────────────────────────────────────────┴──────────────────────┘
```

1. Wenn der Benutzer eine Periode angegeben hat, bestaetigen und die charakteristischen Motive notieren
2. Bei "ueberrasche mich" zufaellig auswaehlen — Perioden mit "Excellent" Mono-Eignung bevorzugen
3. 2-3 primaere Motive der Periode fuer die Prompt-Konstruktion notieren

**Erwartet:** Eine klar identifizierte Periode mit 2-3 Kandidatenmotiven und Verstaendnis dafuer, warum das Ornament der Periode in Monochrom gut funktioniert (oder Herausforderungen birgt).

**Bei Fehler:** Wenn der Benutzer eine Periode anfragt, die nicht in der Tabelle steht (z.B. keltisch, aztekisch, Art Deco), deren ornamentales Vokabular mit WebSearch oder WebFetch recherchieren und einen aequivalenten Eintrag mit Motivliste und Mono-Eignungsbewertung erstellen, bevor fortgefahren wird.

### Schritt 2: Motivstruktur analysieren

Die strukturelle Grammatik des gewaehlten Motivs vor der Prompt-Konstruktion verstehen.

1. Den **Symmetrietyp** identifizieren:
   - Bilateral (Spiegelung an einer Achse — die meisten organischen Motive)
   - Radial (rotierend — Rosetten, Medaillons, Sternmuster)
   - Translational (wiederholende Einheit — Friese, Raender, Tessellationen)
   - Punkt (zentraler Fokus nach aussen strahlend — Kompassen, Mandalas)

2. Das **geometrische Geruest** identifizieren:
   - Kreisbasiert (Rosetten, Medaillons, Rundungen)
   - Rechteckbasiert (Paneele, Metopen, Kartuschen)
   - Dreiecksbasiert (Giebelfelder, Zwickel)
   - Bandbasiert (Friese, Raender, laufendes Ornament)

3. Das **Fuellmuster** identifizieren:
   - Massiv (Silhouette, kein inneres Detail)
   - Linienfuellung (Schraffur, Kreuzschraffur, Parallellinien)
   - Offen (nur Umriss, negativer Raum dominant)
   - Gemischt (Umriss mit selektivem inneren Detail)

4. Die **Kantenbehandlung** identifizieren:
   - Klare Begrenzung (innerhalb eines Rahmens eingeschlossen)
   - Organisches Auslaufen (Motiv erstreckt sich ueber den Rand oder loest sich auf)
   - Verzahnung (verbindet sich mit benachbarten Einheiten — fuer wiederholende Muster)

**Erwartet:** Eine strukturelle Beschreibung wie "bilaterale Symmetrie, bandbasiertes Geruest, Linienfuellung, verzahnte Raender", die den Prompt informiert.

**Bei Fehler:** Wenn die Motivstruktur unklar ist, visuelle Referenzen mit WebSearch nach "[Periode] [Motiv] ornament" suchen und die ersten Ergebnisse analysieren. Die Originalplatten von Speltz sind gemeinfrei und online weit verbreitet.

### Schritt 3: Monochrom-Prompt konstruieren

Den Text-Prompt fuer die Z-Image-Generierung aus Periode, Motiv und Strukturanalyse aufbauen.

**Prompt-Vorlage:**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], monochrome, black and white,
[structural details from Step 2],
[application context], [additional qualifiers]
```

**Rendering-Stil-Optionen:**
- `detailed line art` — saubere vektorartige Linien, keine Fuellungen
- `black silhouette` — massive schwarze Formen auf weissem Grund
- `woodcut print` — kraeftige geschnitzte Linien mit Holzmaserungstextur
- `pen-and-ink illustration` — feine Linien mit Schraffur fuer Tiefe
- `copperplate engraving` — praezise Parallellinien, die Tonabstufungen erzeugen
- `stencil design` — verbundener negativer Raum, keine schwebenden Inseln

**Erwartet:** Ein Prompt von 20-40 Woertern, der Rendering-Stil, Motiv, Periode, Komposition und Monochrom-Einschraenkung spezifiziert.

**Bei Fehler:** Wenn der Prompt zu vage ist, strukturelle Details aus Schritt 2 hinzufuegen. Wenn zu komplex (ueber 50 Woerter), durch Entfernen von Adjektiven vereinfachen und nur die strukturellen Grundlagen beibehalten. Z-Image reagiert am besten auf klare, spezifische Prompts — abstrakte oder konzeptuelle Sprache vermeiden.

### Schritt 4: Generierungsparameter konfigurieren

Aufloesung und Generierungsparameter passend zum Anwendungskontext waehlen.

```
Resolution by Application:
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine line work  │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. Aufloesung basierend auf Anwendungskontext waehlen
2. `steps` auf 8 (Standard) fuer initiale Generierung setzen; auf 10-12 erhoehen fuer feine Liniendetails
3. `shift` auf 3 (Standard) setzen, es sei denn, es wird experimentiert
4. `random_seed: true` fuer Erkundung oder `random_seed: false` mit spezifischem Seed fuer Reproduzierbarkeit waehlen
5. Alle Parameter zur Dokumentation festhalten

**Erwartet:** Ein vollstaendiger Parametersatz fuer die Generierung: Aufloesung, Steps, Shift, Seed-Strategie.

**Bei Fehler:** Im Zweifelsfall auf 1024x1024 (1:1) zurueckgreifen — dies funktioniert fuer die meisten Ornamentkontexte und ist am schnellsten zu generieren.

### Schritt 5: Bild generieren

Das Z-Image-MCP-Tool aufrufen, um das Ornament zu erzeugen.

1. `mcp__hf-mcp-server__gr1_z_image_turbo_generate` aufrufen mit den Parametern aus Schritt 3 und 4
2. Den zurueckgegebenen Seed-Wert fuer Reproduzierbarkeit festhalten
3. Die Generierungszeit notieren

**Erwartet:** Ein generiertes Bild und ein Seed-Wert. Das Bild sollte erkennbare ornamentale Formen in Monochrom zeigen.

**Bei Fehler:** Wenn das MCP-Tool nicht verfuegbar ist, pruefen, ob hf-mcp-server konfiguriert ist (siehe `configure-mcp-server` oder `troubleshoot-mcp-connection`). Wenn das generierte Bild vollstaendig abstrakt ohne ornamentalen Charakter ist, benoetigt der Prompt spezifischere strukturelle Sprache — zu Schritt 3 zurueckkehren.

### Schritt 6: Gegen Stilkriterien bewerten

Das generierte Bild anhand von vier Kriterien bewerten: Symmetrie, Monochrom-Treue, Periodengenauigkeit und Detailgrad.

1. Jedes Kriterium bewerten: **Stark** (klar erfuellt), **Ausreichend** (teilweise erfuellt), **Schwach** (nicht erfuellt)
2. Spezifische Beobachtungen fuer jedes Kriterium notieren
3. Wenn 3+ Kriterien als Stark bewertet werden, ist das Design erfolgreich
4. Wenn 2+ Kriterien als Schwach bewertet werden, zu Schritt 3 fuer Prompt-Verfeinerung zurueckkehren

**Erwartet:** Eine bewertete Evaluation mit spezifischen Beobachtungen. Die meisten Erstgenerierungsbilder werden bei 2-3 Kriterien als Ausreichend bewertet.

**Bei Fehler:** Wenn alle Kriterien als Schwach bewertet werden, ist der Prompt moeglicherweise zu abstrakt oder zu komplex. Auf die wesentlichsten Elemente vereinfachen: ein Motiv, ein Rendering-Stil, explizite "monochrome black and white"-Einschraenkung.

### Schritt 7: Iterieren oder finalisieren

Das Design durch gezielte Iteration verfeinern oder das Ergebnis akzeptieren.

**Iterationsstrategien:**
1. **Seed-fixierte Verfeinerung**: Gleichen Seed beibehalten, Prompt leicht anpassen
2. **Zufaellige Erkundung**: `random_seed: true` mit demselben Prompt verwenden
3. **Prompt-Evolution**: Spezifische Elemente modifizieren (Rendering-Stil aendern, Motivdetails hinzufuegen/entfernen)

**Iterationsbudget:** Auf 3 Iterationen pro Designkonzept begrenzen.

**Erwartet:** Ein verbessertes Bild nach 1-2 Iterationen oder eine Entscheidung, das aktuelle beste Ergebnis zu akzeptieren.

**Bei Fehler:** Wenn die Iteration die Ergebnisse nicht verbessert, ist das grundlegende Prompt-Konzept moeglicherweise nicht gut fuer das Modell geeignet. Ein anderes Motiv aus derselben Periode versuchen oder den Rendering-Stil komplett wechseln.

### Schritt 8: Design dokumentieren

Eine vollstaendige Aufzeichnung des endgueltigen Designs fuer Reproduzierbarkeit und Referenz erstellen, einschliesslich Periode, Motiv, Rendering-Stil, endgueltiger Prompt, Seed, Aufloesung, Steps/Shift, Bewertung und Iterationen.

**Erwartet:** Eine reproduzierbare Aufzeichnung, die die exakte Neugenerierung des Bildes ermoeglicht.

**Bei Fehler:** Wenn die Dokumentation uebertrieben erscheint, mindestens den endgueltigen Prompt und Seed festhalten — diese beiden Werte genuegen, um das Bild zu reproduzieren.

## Validierung

- [ ] Eine spezifische historische Periode wurde mit Begruendung ausgewaehlt
- [ ] Motivstruktur wurde analysiert (Symmetrie, Geruest, Fuellung, Kantenbehandlung)
- [ ] Prompt enthaelt explizite Monochrom-Einschraenkung
- [ ] Prompt spezifiziert einen Rendering-Stil
- [ ] Aufloesung passt zum Anwendungskontext
- [ ] Generiertes Bild wurde anhand der 4-Punkte-Rubrik bewertet
- [ ] Seed-Wert wurde fuer Reproduzierbarkeit festgehalten
- [ ] Endgueltiges Design ist mit Prompt, Seed und Parametern dokumentiert

## Haeufige Fehler

- **Monochrom-Einschraenkung weglassen**: Z-Image generiert standardmaessig Farbe. Ohne explizites "monochrome, black and white" im Prompt erhaelt man Farbausgabe
- **Prompt ueberspezifizieren**: Prompts ueber 50 Woerter erzeugen verwirrte Ergebnisse. Bei einem Motiv, einem Rendering-Stil, einer Komposition bleiben
- **Periodengrammatik ignorieren**: Jede Periode hat strukturelle Regeln. Gotische Dreiblaetter in aegyptischen Rahmen erzeugen visuelle Inkohaerenz
- **Vektorausgabe erwarten**: Z-Image erzeugt Rasterbilder. Fuer echte Vektorzeichnungen dient das generierte Bild als Referenz fuer manuelles Nachzeichnen
- **Strukturanalyse ueberspringen**: Ohne Motivstrukturanalyse von der Periodenauswahl direkt zum Prompt zu springen, erzeugt generische Ergebnisse

## Verwandte Skills

- `ornament-style-color` — der polychrome Begleiter; fuegt Farbpalettendefinition und Farb-Struktur-Zuordnung hinzu
- `meditate` — fokussierte Aufmerksamkeit und visuelle Vorstellungsuebungen koennen die ornamentale Komposition informieren
- `review-web-design` — Designreview-Prinzipien (visuelle Hierarchie, Rhythmus, Balance) gelten direkt fuer ornamentale Komposition
