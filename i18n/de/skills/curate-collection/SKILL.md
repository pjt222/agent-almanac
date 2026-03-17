---
name: curate-collection
description: >
  Eine Bibliothekssammlung durch Erwerbungen, Aussonderung (Deakzession),
  Bestandsbewertung, Leserberatung und Fernleihe-Koordination aufbauen und
  pflegen. Umfasst Auswahlkriterien, Bestandsentwicklungsrichtlinien, die
  CREW/MUSTIE-Methode zur Aussonderung, Nutzungsanalyse und responsive
  Bestandsverwaltung. Verwenden beim Aufbau einer neuen Sammlung mit
  definiertem Umfang und Budget, bei der Bewertung einer bestehenden Sammlung
  auf Luecken oder veraltete Materialien, wenn Regale ueberfuellt sind und
  systematische Aussonderung benoetigt wird, oder beim Erstellen einer
  formalen Bestandsentwicklungsrichtlinie.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, collection-development, weeding, acquisitions, reader-advisory, curation
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Sammlung kuratieren

Eine Bibliothekssammlung durch strategische Erwerbungen, systematische Aussonderung, Nutzungsanalyse und responsive Leserberatung aufbauen, bewerten und pflegen.

## Wann verwenden

- Sie bauen eine neue Sammlung mit definiertem Umfang und Budget auf
- Eine bestehende Sammlung muss auf Luecken, Redundanzen oder veraltete Materialien bewertet werden
- Regale sind ueberfuellt und systematische Aussonderung ist erforderlich
- Nutzer fragen Materialien an, die die Sammlung nicht enthaelt
- Sie moechten eine formale Bestandsentwicklungsrichtlinie erstellen

## Eingaben

- **Erforderlich**: Sammlungsumfang (Fachgebiete, Zielgruppe, Formate)
- **Erforderlich**: Budget (jaehrliches Erwerbungsbudget oder einmalige Zuweisung)
- **Optional**: Nutzungsdaten (Ausleihstatistiken, Vormerkungen, Fernleihanfragen)
- **Optional**: Gemeinde- oder Institutionsprofil (Demografie, Lehrplan, Forschungsbereiche)
- **Optional**: Bestehende Bestandsentwicklungsrichtlinie

## Vorgehensweise

### Schritt 1: Bestandsentwicklungsrichtlinie definieren

Das Leitdokument fuer alle Erwerbungs- und Aussonderungsentscheidungen erstellen.

```
Collection Development Policy Template:

1. MISSION STATEMENT
   What is the collection for? Who does it serve?
   Example: "Support the undergraduate curriculum in the
   humanities and social sciences with current and
   foundational works."

2. SCOPE
   +-------------------+------------------------------------------+
   | Element           | Definition                               |
   +-------------------+------------------------------------------+
   | Subject areas     | List of disciplines collected             |
   | Depth levels      | Basic, instructional, research,           |
   |                   | comprehensive, exhaustive                |
   | Formats           | Print, ebook, audiobook, media, serial    |
   | Languages         | Primary and secondary languages           |
   | Chronological     | Current only, or retrospective            |
   | Geographic        | Any focus area or exclusion               |
   +-------------------+------------------------------------------+

3. SELECTION CRITERIA (in priority order)
   a. Relevance to mission and audience needs
   b. Authority and reputation of author/publisher
   c. Currency (publication date vs. field currency)
   d. Quality of content (reviews, awards, citations)
   e. Format suitability (print vs. digital)
   f. Cost relative to budget and expected use
   g. Representation: diversity of perspectives and voices

4. WEEDING GUIDELINES
   - Frequency: annual review cycle
   - Method: CREW/MUSTIE (see Step 4)
   - Disposition: sale, donation, recycling

5. REVIEW SCHEDULE
   - Policy reviewed and updated every 3 years
```

**Erwartet:** Eine schriftliche Richtlinie, die konsistente, nachvollziehbare Erwerbungs- und Aussonderungsentscheidungen leitet.

**Bei Fehler:** Wenn eine formale Richtlinie fuer eine kleine Sammlung uebertrieben erscheint, eine einseitige Umfangsbeschreibung verfassen, die Auftrag, gesammelte Fachgebiete und grundlegende Auswahlkriterien abdeckt. Selbst eine kurze Erklaerung verhindert Abdriften.

### Schritt 2: Bestehende Sammlung bewerten

Verstehen, was vorhanden ist, bevor entschieden wird, was hinzugefuegt oder entfernt werden soll.

```
Collection Assessment Methods:

1. QUANTITATIVE ANALYSIS
   - Total volumes by subject area (using call number ranges)
   - Age distribution: what percentage published in last 5, 10, 20 years?
   - Format breakdown: print vs. digital vs. media
   - Circulation data: items checked out in last 1, 3, 5 years
   - Holds-to-copies ratio: >3:1 = need more copies

2. QUALITATIVE ANALYSIS
   - Spot-check condition (see preserve-materials condition survey)
   - Check currency: are key reference works up to date?
   - Compare against standard bibliographies or peer collections
   - Identify gaps: subjects in scope but underrepresented

3. USAGE ANALYSIS
   +-------------------+------------------+-------------------------+
   | Metric            | What It Shows    | Action                  |
   +-------------------+------------------+-------------------------+
   | High circ, few    | Popular subject, | Buy more in this area   |
   | copies            | unmet demand     |                         |
   +-------------------+------------------+-------------------------+
   | Zero circ in      | Possible dead    | Evaluate for weeding    |
   | 5 years           | weight           |                         |
   +-------------------+------------------+-------------------------+
   | High ILL requests | Gap in own       | Acquire in this subject |
   | in a subject      | collection       |                         |
   +-------------------+------------------+-------------------------+
   | Many copies, low  | Over-purchased   | Weed duplicates         |
   | circ per copy     |                  |                         |
   +-------------------+------------------+-------------------------+

Collection Map: Create a grid of subjects vs. depth levels.
Mark each cell as: Strong, Adequate, Weak, or Not Collected.
This visual map reveals gaps and overlaps at a glance.
```

**Erwartet:** Ein klares Bild der Staerken, Schwaechen, Luecken und des toten Bestands der Sammlung, gestuetzt auf Daten.

**Bei Fehler:** Wenn Ausleihdaten nicht verfuegbar sind (kein automatisiertes System), Regalbeobachtung nutzen: verstaubte, dicht gepackte Buecher, die sich nicht bewegt haben, deuten auf geringe Nutzung hin. Praesenznutzung kann geschaetzt werden, indem auf Tischen liegen gelassene statt zurueckgestellte Medien gezaehlt werden.

### Schritt 3: Materialien strategisch erwerben

Materialien auswaehlen und beschaffen, die Luecken fuellen und Nutzerbedarf decken.

```
Acquisition Workflow:
1. IDENTIFY needs from:
   - Collection assessment gaps
   - User requests and purchase suggestions
   - Curriculum changes or new research areas
   - Professional review sources (Choice, Kirkus, Booklist,
     Publishers Weekly, discipline-specific journals)
   - Bestseller and award lists

2. EVALUATE each candidate against selection criteria (Step 1)

3. DECIDE using the Selection Decision Matrix:
   +-------------+-------------+------------------+
   | Relevance   | Quality     | Decision         |
   +-------------+-------------+------------------+
   | High        | High        | Buy              |
   | High        | Low/Unknown | Consider; check  |
   |             |             | reviews first    |
   | Low         | High        | Skip unless      |
   |             |             | scope expanding  |
   | Low         | Low         | Do not buy       |
   +-------------+-------------+------------------+

4. ORDER through appropriate channel:
   - Vendor (Baker & Taylor, Ingram, GOBI for academic)
   - Publisher direct (for small press or specialized)
   - Standing orders/approval plans for ongoing series

5. RECEIVE AND PROCESS:
   - Verify against order (correct title, edition, condition)
   - Send to cataloging (see catalog-collection)
   - Notify requestor if user-suggested

Budget Allocation Rule of Thumb:
- 60-70% of budget: materials in core subject areas
- 15-20%: emerging areas and user requests
- 10-15%: replacement of worn/lost copies
- 5%: reserve for urgent or unexpected needs
```

**Erwartet:** Neue Erwerbungen fuellen systematisch identifizierte Luecken und reagieren auf Nutzernachfrage, im Rahmen des Budgets.

**Bei Fehler:** Wenn das Budget stark begrenzt ist, Nutzeranfragen (nachgewiesene Nachfrage) gegenueber spekulativen Kaeufen priorisieren. Fuer Fachgebiete mit geringer Nachfrage durch Fernleihe ergaenzen, anstatt Materialien zu kaufen, die moeglicherweise nicht ausgeliehen werden.

### Schritt 4: Sammlung aussondern (Deakzession)

Materialien entfernen, die dem Sammlungsauftrag nicht mehr dienen.

```
CREW Method / MUSTIE Criteria:
Evaluate each candidate for weeding against these factors:

M - Misleading: factually inaccurate or obsolete information
    (medical texts >5 years, technology >3 years, legal >2 years)

U - Ugly: worn, damaged, or unattractive condition that
    discourages use (torn covers, heavy underlining, staining)

S - Superseded: replaced by a newer edition, or better
    coverage exists in another item in the collection

T - Trivial: of no discernible literary, scientific, or
    informational value; ephemeral interest has passed

I - Irrelevant: no longer within the collection's scope
    or the community's needs

E - Elsewhere: readily available through ILL, digital access,
    or other local collections; no need to duplicate

Weeding Decision Flowchart:
  Is the item misleading or dangerous? → YES → Withdraw
  Is it in poor physical condition? → YES →
    Can it be repaired? → YES → Repair → Keep
                        → NO → Is it still relevant? →
                          YES → Replace → Withdraw original
                          NO → Withdraw
  Has it circulated in the last 5 years? → NO →
    Is it a classic, reference, or historically significant? →
      YES → Keep (flag for preservation)
      NO → Withdraw

Disposition of Withdrawn Items:
1. Offer to other libraries or book sales
2. Donate to literacy programs or schools
3. Recycle (last resort — not landfill)
Never discard items with local historical significance
without institutional review.
```

**Erwartet:** Sammlung wird regelmaessig ausgesondert, mit klarer Dokumentation der ausgesonderten Medien und ihrer Verwendung. Die verbleibende Sammlung ist aktuell, relevant und in gutem Zustand.

**Bei Fehler:** Wenn Aussonderung emotional schwerfaellt (was bei vielen Bibliothekaren der Fall ist), bedenken: Ein irreguehrendes medizinisches Fachbuch zu behalten ist schaedlicher als es zu entfernen. Aussonderung ist ein Akt der Fuersorge fuer den Nutzer, nicht Respektlosigkeit gegenueber dem Buch.

### Schritt 5: Leserberatung und Auskunft bereitstellen

Nutzer mit Materialien verbinden, die ihren Beduerfnissen entsprechen.

```
Reader Advisory Framework:

1. THE REFERENCE INTERVIEW
   - Start open: "What are you looking for?"
   - Clarify: "Is this for research, personal interest, or a class?"
   - Scope: "How much do you already know about this topic?"
   - Format: "Do you prefer books, articles, or other formats?"
   - Follow-up: "Did you find what you needed?"

2. READ-ALIKE RECOMMENDATIONS
   When a user says "I liked X, what else would I like?"
   - Match on appeal factors: pacing, tone, subject, style
   - Use databases: NoveList, Goodreads, LibraryThing
   - Build displays and reading lists by theme

3. INTERLIBRARY LOAN (ILL)
   When the collection doesn't have what the user needs:
   - Submit ILL request through OCLC WorldShare or regional system
   - Typical turnaround: 3-10 business days for books
   - Articles often available same-day via electronic delivery
   - Track ILL requests by subject — patterns reveal collection gaps

4. FEEDBACK LOOP
   - Record user requests (fulfilled and unfulfilled)
   - Track "not owned" search results from the catalog
   - Use this data to inform next acquisition cycle
   - Display new acquisitions prominently — users notice responsiveness
```

**Erwartet:** Nutzer finden, was sie brauchen, entweder in der Sammlung oder ueber Fernleihe, und ihr Feedback praegt kuenftige Erwerbungen.

**Bei Fehler:** Wenn Fernleihe nicht verfuegbar ist (kein Bibliotheksverbund), Open-Access-Quellen, digitale Bibliotheken (HathiTrust, Internet Archive, Project Gutenberg) und gegenseitige Leihvereinbarungen mit nahegelegenen Bibliotheken erkunden.

## Validierung

- [ ] Bestandsentwicklungsrichtlinie verfasst und genehmigt
- [ ] Bestandsbewertung mit quantitativen und qualitativen Daten abgeschlossen
- [ ] Luecken identifiziert und fuer die Erwerbung priorisiert
- [ ] Budget auf Fachgebiete und Bedarfskategorien verteilt
- [ ] Erwerbungsworkflow mit Rezensionsquellen und Lieferantenbeziehungen etabliert
- [ ] Aussonderungszyklus geplant (jaehrlich) mit CREW/MUSTIE-Kriterien
- [ ] Nutzer-Feedbackschleife eingerichtet (Anfragen, Fernleihdaten, Suchlogs)

## Haeufige Stolperfallen

- **Sammeln ohne Richtlinie**: Ohne Umfangsbeschreibung wachsen Sammlungen durch Anhaeufen statt durch Absicht. Alles wird hinzugefuegt, nichts entfernt, und die Sammlung wird zum Lager
- **Angst vor dem Aussondern**: Alles "fuer alle Faelle" aufzubewahren vergraebt nuetzliche Materialien unter totem Bestand. Eine kleinere, kuratierte Sammlung dient den Nutzern besser als eine grosse, undifferenzierte
- **Nutzungsdaten ignorieren**: Nur aufgrund fachlicher Einschaetzung einzukaufen verfehlt, was Nutzer tatsaechlich brauchen. Ausleih- und Fernleihdaten sollten mindestens 30% der Erwerbungsentscheidungen bestimmen
- **Kein Budget fuer Ersatz**: Neuerwerbungen erhalten das gesamte Budget, und abgenutzte populaere Medien werden nie ersetzt. 10-15% fuer Ersatzbeschaffung reservieren
- **Formatvielfalt vernachlaessigen**: Nicht alle Nutzer lesen gedruckt. Hoerbuecher, E-Books und barrierefreie Formate dienen Nutzern, die nicht drucken koennen oder es vorziehen, nicht zu lesen

## Verwandte Skills

- `catalog-collection` — Neu erworbene Materialien muessen katalogisiert werden; ausgesonderte Medien benoetigen Datensatzloeschung
- `preserve-materials` — Zustandsbewertung waehrend der Aussonderung identifiziert konservierungsbeduerftige Medien
- `review-research` — Die Bewertung von Informationsqualitaet entspricht der Bewertung von Materialien fuer die Auswahl
