---
name: catalog-collection
description: >
  Materialien mit Standard-Bibliothekssystemen katalogisieren und klassifizieren.
  Umfasst deskriptive Katalogisierung, Schlagwoerter, Signaturvergabe mit
  Dewey-Dezimalklassifikation und Library of Congress Classification, MARC-
  Grundlagen, Regalorganisation und Normdatenkontrolle fuer konsistente
  Zugangspunkte. Verwenden beim Organisieren einer persoenlichen, institutionellen
  oder Gemeindebibliothek von Grund auf, beim Zuweisen von Signaturen und
  Schlagwoertern zu Neuerwerbungen, beim Umklassifizieren einer Sammlung,
  die ihrem urspruenglichen System entwachsen ist, oder beim Einrichten von
  Normdatenkontrolle fuer Autoren, Reihen oder Themen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, cataloging, classification, dewey, loc, marc, metadata, taxonomy
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Sammlung katalogisieren

Bibliotheks- oder Archivmaterialien mit Standard-Klassifikationssystemen und deskriptiven Katalogisierungspraktiken katalogisieren und klassifizieren.

## Wann verwenden

- Eine persoenliche, institutionelle oder Gemeindebibliothek von Grund auf organisieren
- Signaturen und Schlagwoerter neuen Erwerbungen zuweisen
- Konsistente Katalogdatensaetze fuer Auffindbarkeit erstellen
- Eine Sammlung umklassifizieren, die ihrem urspruenglichen System entwachsen ist
- Normdatenkontrolle fuer Autoren, Reihen oder Themen einrichten

## Eingaben

- **Erforderlich**: Zu katalogisierende Materialien (Buecher, Zeitschriften, Medien, Archivgut)
- **Erforderlich**: Gewaehltes Klassifikationssystem (Dewey-Dezimalklassifikation oder Library of Congress)
- **Optional**: Bestehender Katalog oder Bestandsliste zur Integration
- **Optional**: Schlagwort-Normdatei (LCSH, Sears oder benutzerdefinierter Thesaurus)
- **Optional**: MARC-kompatible Katalogisierungssoftware (Koha, Evergreen, LibraryThing)

## Vorgehensweise

### Schritt 1: Das Klassifikationssystem waehlen

Ein System waehlen, das zu Groesse, Umfang und Zielgruppe der Sammlung passt.

```
Classification System Comparison:
+----------------------------+-------------------------------+-------------------------------+
| Criterion                  | Dewey Decimal (DDC)           | Library of Congress (LCC)     |
+----------------------------+-------------------------------+-------------------------------+
| Best for                   | Public/school libraries,      | Academic/research libraries,  |
|                            | personal collections <10K     | collections >10K volumes      |
+----------------------------+-------------------------------+-------------------------------+
| Structure                  | 10 main classes (000-999),    | 21 letter classes (A-Z),      |
|                            | decimal subdivision           | alphanumeric subdivision      |
+----------------------------+-------------------------------+-------------------------------+
| Granularity                | Broad at top levels,          | Very specific; designed for   |
|                            | expandable via decimals       | research-level distinction    |
+----------------------------+-------------------------------+-------------------------------+
| Learning curve             | Moderate — intuitive          | Steeper — requires schedules  |
|                            | decimal logic                 | and tables                    |
+----------------------------+-------------------------------+-------------------------------+
| Browsability               | Excellent for general         | Excellent for subject-deep    |
|                            | browsing                      | collections                   |
+----------------------------+-------------------------------+-------------------------------+

Decision Rule:
- Personal or small community library: DDC
- Academic, research, or large institutional: LCC
- Mixed or uncertain: Start with DDC; migrate to LCC if collection exceeds 10K
```

**Erwartet:** Ein Klassifikationssystem gewaehlt, das zu Groesse und Zweck der Sammlung passt.

**Bei Fehler:** Wenn keines der Systeme passt (z.B. ein hoch spezialisiertes Archiv), eine Facettenklassifikation oder ein benutzerdefiniertes Schema erwaegen, aber die Zuordnung zu DDC oder LCC fuer Interoperabilitaet dokumentieren.

### Schritt 2: Deskriptive Katalogisierung durchfuehren

Fuer jeden Gegenstand eine bibliographische Beschreibung nach Standardpraxis erstellen.

```
Descriptive Cataloging Elements (RDA-aligned):
1. TITLE AND STATEMENT OF RESPONSIBILITY
   - Title proper (exactly as on title page)
   - Subtitle (if present)
   - Statement of responsibility (author, editor, translator)

2. EDITION
   - Edition statement ("2nd ed.", "Rev. ed.")

3. PUBLICATION INFORMATION
   - Place of publication
   - Publisher name
   - Date of publication

4. PHYSICAL DESCRIPTION
   - Extent (pages, volumes, running time)
   - Dimensions (cm for books)
   - Accompanying material (CD, maps)

5. SERIES
   - Series title and numbering

6. NOTES
   - Bibliography, index, language notes
   - Special features or provenance

7. STANDARD IDENTIFIERS
   - ISBN, ISSN, LCCN, OCLC number

Cataloging Principle: Describe what you see.
Take information from the item itself (title page first,
then cover, colophon, verso). Do not guess or embellish.
```

**Erwartet:** Ein konsistenter bibliographischer Datensatz fuer jeden Gegenstand mit genuegend Detail fuer eindeutige Identifikation und Auffindbarkeit.

**Bei Fehler:** Wenn Publikationsinformationen fehlen (haeufig bei aelteren oder selbst veroeffentlichten Werken), eckige Klammern verwenden, um ergaenzte Informationen anzuzeigen: `[ca. 1920]`, `[s.l.]` (kein Ort), `[s.n.]` (kein Verlag).

### Schritt 3: Schlagwoerter zuweisen

Kontrollierte Vokabular-Begriffe anwenden, damit Benutzer Materialien nach Thema finden koennen.

```
Subject Heading Sources:
+------------------------------+------------------------------------------+
| Authority                    | Use For                                  |
+------------------------------+------------------------------------------+
| LCSH (Library of Congress    | General and academic collections.        |
| Subject Headings)            | Most widely used worldwide.              |
+------------------------------+------------------------------------------+
| Sears List of Subject        | Small public and school libraries.       |
| Headings                     | Simpler vocabulary than LCSH.            |
+------------------------------+------------------------------------------+
| MeSH (Medical Subject        | Medical and health science collections.  |
| Headings)                    |                                          |
+------------------------------+------------------------------------------+
| Custom thesaurus             | Specialized archives or corporate        |
|                              | collections with domain-specific terms.  |
+------------------------------+------------------------------------------+

Assignment Rules:
1. Assign 1-3 subject headings per item (more is noise, fewer is loss)
2. Use the most specific heading available (not "Science" when
   "Marine Biology" exists)
3. Apply subdivisions where helpful:
   - Topical: "Cooking--Italian"
   - Geographic: "Architecture--France--Paris"
   - Chronological: "Art--20th century"
   - Form: "Poetry--Collections"
4. Check authority files for preferred forms before creating new headings
5. Be consistent: if you use "Automobiles" don't also use "Cars" as a heading
```

**Erwartet:** Jeder Gegenstand hat 1-3 Schlagwoerter aus einem kontrollierten Vokabular, konsistent ueber die gesamte Sammlung angewendet.

**Bei Fehler:** Wenn kein passendes Schlagwort in der Normdatei existiert, ein lokales Schlagwort erstellen und es in einer lokalen Normdatei dokumentieren. Periodisch auf Uebereinstimmung mit der Haupt-Normdatei pruefen.

### Schritt 4: Signaturen zuweisen

Die Regaladresse mit dem gewaehlten Klassifikationssystem aufbauen.

```
Dewey Decimal Call Number Construction:
1. Main class number (3 digits minimum): 641.5
2. Add Cutter number for author: .S65 (Smith)
3. Add date for editions: 2023
   Result: 641.5 S65 2023

DDC Main Classes:
  000 - Computer Science, Information
  100 - Philosophy, Psychology
  200 - Religion
  300 - Social Sciences
  400 - Language
  500 - Science
  600 - Technology
  700 - Arts, Recreation
  800 - Literature
  900 - History, Geography

LCC Call Number Construction:
1. Class letter(s): QA (Mathematics)
2. Subclass number: 76.73 (Programming languages)
3. Cutter for specific topic: .P98 (Python)
4. Date: 2023
   Result: QA76.73.P98 2023

Shelving Rule: Call numbers sort left-to-right,
segment by segment. Numbers sort numerically,
letters sort alphabetically, Cutters sort as decimals.
```

**Erwartet:** Jeder katalogisierte Gegenstand hat eine eindeutige Signatur, die seine Regalposition bestimmt.

**Bei Fehler:** Wenn zwei Gegenstaende die gleiche Signatur erzeugen, eine Werkmarkierung (erster Buchstabe des Titels, ohne Artikel) oder eine Exemplarnummer zur Unterscheidung hinzufuegen.

### Schritt 5: Katalogdatensaetze erstellen oder aktualisieren

Die katalogisierten Informationen in das Katalogsystem eingeben.

```
Minimum Viable Catalog Record:
+-----------------+----------------------------------------------+
| Field           | Example                                      |
+-----------------+----------------------------------------------+
| Call Number     | 641.5 S65 2023                               |
| Title           | The Joy of Cooking                           |
| Author          | Smith, Jane                                  |
| Edition         | 9th ed.                                      |
| Publisher       | New York : Scribner, 2023                    |
| Physical Desc.  | xii, 1200 p. : ill. ; 26 cm                 |
| ISBN            | 978-1-5011-6971-7                            |
| Subjects        | Cooking, American                            |
|                 | Cookbooks                                    |
| Status          | Available                                    |
| Location        | Main Stacks                                  |
+-----------------+----------------------------------------------+

If using MARC format:
- 245 $a Title $c Statement of responsibility
- 100 $a Author (personal name)
- 050 $a LCC call number
- 082 $a DDC call number
- 650 $a Subject headings
- 020 $a ISBN

Copy cataloging: Check OCLC WorldCat or your library system's
shared database before creating original records. Someone has
likely already cataloged the same edition.
```

**Erwartet:** Jeder Gegenstand hat einen Katalogdatensatz im System mit allen erforderlichen Feldern. Datensaetze sind nach Autor, Titel, Thema und Signatur durchsuchbar.

**Bei Fehler:** Wenn keine Katalogisierungssoftware verfuegbar ist, dient eine gut strukturierte Tabellenkalkulation (mit konsistenten Spaltenkoepfen, die den obigen Feldern entsprechen) als funktionaler Katalog. Auf richtige Software migrieren, wenn verfuegbar.

### Schritt 6: Das physische Regal organisieren

Materialien gemaess ihren Signaturen anordnen.

```
Shelf Organization Principles:
1. Left to right, top to bottom (like reading a page)
2. Call numbers in strict sort order:
   - DDC: 000 → 999, then Cutter alphabetically
   - LCC: A → Z, then number, then Cutter
3. Spine labels: print or write call number on spine label
   (white label, black text, 3 lines max)
4. Shelf markers: place dividers at major class boundaries
   (every 100 in DDC, every letter in LCC)
5. Shifting: leave 20-30% empty space per shelf for growth
6. Oversize: shelve items taller than 30cm in a separate
   oversize section, with "+q" prefix on call number

Shelf Reading (periodic verification):
- Walk the stacks weekly
- Check that items are in correct call number order
- Reshelve any misplaced items
- Note damaged items for repair or replacement
```

**Erwartet:** Materialien sind physisch in Signaturenreihenfolge mit klaren Rueckenschildern und Wachstumsplatz angeordnet.

**Bei Fehler:** Wenn der Platz nicht ausreicht, vielgenutzte Gegenstaende auf zugaenglichen Regalen priorisieren und wenig genutzte Gegenstaende in Kompaktspeicher verlegen, wobei die Standortaenderung in Katalogdatensaetzen notiert wird.

## Validierung

- [ ] Klassifikationssystem gewaehlt und dokumentiert
- [ ] Deskriptive Katalogisierung fuer alle Gegenstaende mit Titel, Autor und Publikationsdaten abgeschlossen
- [ ] Schlagwoerter aus einem kontrollierten Vokabular zugewiesen (1-3 pro Gegenstand)
- [ ] Signaturen zugewiesen und eindeutig fuer jeden Gegenstand
- [ ] Katalogdatensaetze im System oder in Tabellenkalkulation erstellt
- [ ] Physische Materialien in Signaturenreihenfolge mit Rueckenschildern aufgestellt
- [ ] Normdatenkontrolle fuer konsistente Namens- und Themenformen eingerichtet

## Haeufige Stolperfallen

- **Inkonsistente Schlagwoerter**: Sowohl "Weltkrieg, 1939-1945" als auch "2. WK" zu verwenden, unterlaueft den Zweck des kontrollierten Vokabulars. Eine Normdatei waehlen und dabei bleiben
- **Ueberklassifikation**: Einer kleinen persoenlichen Bibliothek eine 15-stellige DDC-Nummer zuzuweisen, fuegt Komplexitaet ohne Nutzen hinzu. Granularitaet an Sammlungsgroesse anpassen
- **Fremdkatalogisierung ignorieren**: Originaldatensaetze erstellen, wenn Fremddatensaetze existieren, verschwendet Zeit. Immer zuerst gemeinsame Datenbanken pruefen
- **Rueckenschilder vernachlaessigen**: Ein katalogisiertes Buch ohne Rueckenschild wird falsch eingestellt. Sofort nach der Katalogisierung beschriften
- **Kein Wachstumsplatz**: Regale zu 100% zu fuellen bedeutet, dass jede Neuerwerbung eine Kette von Verschiebungen ausloest. Platz lassen

## Verwandte Skills

- `preserve-materials` — Erhaltung katalogisierter Materialien zur Zustandsbewahrung
- `curate-collection` — Bestandsentwicklungsentscheidungen, die bestimmen, was katalogisiert wird
- `manage-memory` — Organisation persistenter Wissensspeicher (digitale Parallele zur physischen Katalogisierung)
