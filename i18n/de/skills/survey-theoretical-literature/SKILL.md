---
name: survey-theoretical-literature
description: >
  Theoretische Literatur zu einem bestimmten Thema sichten und synthetisieren,
  richtungsweisende Arbeiten, Schluesselergebnisse, offene Probleme und
  domaenenuebergreifende Verbindungen identifizieren. Verwenden beim Beginn von
  Forschung zu einem unbekannten theoretischen Thema, beim Schreiben einer
  Literatururebersicht fuer eine Arbeit oder Dissertation, beim Identifizieren
  offener Probleme und Forschungsluecken, beim Finden domaenenuebergreifender
  Verbindungen oder beim Bewerten der Neuheit eines vorgeschlagenen
  theoretischen Beitrags gegenueber bestehendem Werk.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: intermediate
  language: natural
  tags: theoretical, literature, survey, synthesis, review, research
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Theoretische Literatur sichten

Eine strukturierte Uebersicht theoretischer Literatur zu einem definierten Thema durchfuehren, die eine Synthese erstellt, die richtungsweisende Beitraege kartiert, die chronologische Entwicklung von Schluesselideen nachzeichnet, offene Probleme und aktive Forschungsfronten identifiziert und domaenenuebergreifende Verbindungen aufzeigt.

## Wann verwenden

- Beim Beginn von Forschung zu einem unbekannten theoretischen Thema und der Notwendigkeit, die Landschaft zu kartieren
- Beim Schreiben eines Literaturuebersichts-Abschnitts fuer eine Arbeit, Dissertation oder einen Foerderantrag
- Beim Identifizieren offener Probleme und Luecken in einem theoretischen Feld
- Beim Finden von Verbindungen zwischen einem theoretischen Ergebnis und Arbeiten in benachbarten Feldern
- Beim Bewerten der Neuheit eines vorgeschlagenen theoretischen Beitrags gegenueber bestehendem Werk

## Eingaben

- **Erforderlich**: Themenbeschreibung (spezifisch genug, um die Suche einzugrenzen; z.B. "topologische Phasen in nicht-hermiteschen Systemen", nicht nur "Topologie")
- **Erforderlich**: Umfangsbeschraenkungen (Zeitraum, einzubeziehende/auszuschliessende Teilgebiete, theoretischer vs. experimenteller Fokus)
- **Optional**: Bekannte Ausgangspapiere (Arbeiten, die der Anfragende bereits kennt, um die Suche zu verankern)
- **Optional**: Zielgruppe und Tiefe (einfuehrende Uebersicht vs. Expertenniveau-Survey)
- **Optional**: Gewuenschtes Ausgabeformat (kommentierte Bibliografie, narrativer Review, Konzeptkarte)

## Vorgehensweise

### Schritt 1: Umfang und Suchbegriffe definieren

Die Uebersicht praezise eingrenzen, bevor gesucht wird:

1. **Kernthema-Statement**: Einen einzelnen Satz schreiben, der definiert, was die Uebersicht abdeckt. Dieser Satz ist das Akzeptanzkriterium dafuer, ob eine Arbeit in die Uebersicht gehoert.
2. **Suchbegriffe**: Primaere und sekundaere Suchbegriffe generieren:
   - Primaere Begriffe: die exakten Fachausdruecke, die Praktiker verwenden (z.B. "Kohn-Sham equations", "Berry phase", "renormalization group")
   - Sekundaere Begriffe: breitere oder benachbarte Formulierungen, die relevante Arbeiten aus anderen Gemeinschaften erfassen koennten (z.B. "geometric phase" als Synonym fuer "Berry phase")
   - Ausschlussbegriffe: Formulierungen, die irrelevante Ergebnisse einbringen wuerden (z.B. Ausschluss von "Berry" im botanischen Sinne)
3. **Zeitlicher Umfang**: Das Zeitfenster definieren. Fuer ein reifes Feld koennen die richtungsweisenden Arbeiten Jahrzehnte alt sein, aber juengste Fortschritte koennen sich auf die letzten 5-10 Jahre verengen. Fuer ein aufstrebendes Feld kann die gesamte Geschichte nur wenige Jahre umfassen.
4. **Domaenengrenzen**: Explizit angeben, welche Teilgebiete im Umfang liegen und welche nicht. Beispielsweise koennte eine Uebersicht zur Quantenfehlerkorrektur topologische Codes einschliessen, aber klassische Codierungstheorie ausschliessen.

```markdown
## Survey Scope
- **Core topic**: [one-sentence definition]
- **Primary search terms**: [list]
- **Secondary search terms**: [list]
- **Exclusion terms**: [list]
- **Time window**: [start year] to [end year]
- **In scope**: [subfields]
- **Out of scope**: [subfields]
```

**Erwartet:** Eine Umfangsdefinition, die praezise genug ist, dass zwei Forschende unabhaengig uebereinstimmen wuerden, ob eine gegebene Arbeit in die Uebersicht gehoert.

**Bei Fehler:** Wenn der Umfang zu breit ist (mehr als ~200 potenziell relevante Arbeiten), durch Hinzufuegen von Teilgebietsbeschraenkungen oder Verengung des Zeitfensters eingrenzen. Wenn zu eng (weniger als ~10 Arbeiten), die sekundaeren Suchbegriffe erweitern oder das Zeitfenster verlaengern.

### Schritt 2: Richtungsweisende Arbeiten und Schluesselergebnisse identifizieren

Das Rueckgrat der Uebersicht aus den einflussreichsten Beitraegen aufbauen:

1. **Saatbasierte Entdeckung**: Von den Ausgangspapieren (falls angegeben) oder vom juengsten Review-Artikel zum Thema ausgehen. Referenzen rueckwaerts und Zitierungen vorwaerts verfolgen, um die Arbeiten zu identifizieren, die wiederholt auftauchen.
2. **Zitierungszahl-Heuristik**: Zitierungszahlen als grobe Naeherung fuer Einfluss verwenden, aber juengere Arbeiten (letzte 5 Jahre) staerker gewichten, da sie weniger Zeit hatten, Zitierungen zu sammeln.
3. **Kriterien fuer richtungsweisende Arbeiten**: Eine Arbeit qualifiziert sich als richtungsweisend, wenn sie mindestens eines der Folgenden erfuellt:
   - Ein grundlegendes Konzept, einen Formalismus oder eine Methode eingefuehrt hat
   - Ein Ergebnis bewiesen hat, das das Feld umgelenkt hat
   - Zuvor getrennte Straenge der Arbeit vereinigt hat
   - Von einer Mehrheit nachfolgender Arbeiten im Feld zitiert wird
4. **Schluesselergebnis-Extraktion**: Fuer jede richtungsweisende Arbeit extrahieren:
   - Das Hauptergebnis (Theorem, Gleichung, Vorhersage oder Methode)
   - Die erforderlichen Annahmen oder Naeherungen
   - Die Auswirkung auf nachfolgende Arbeiten

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

**Erwartet:** Eine Tabelle von 5-15 richtungsweisenden Arbeiten, die das intellektuelle Rueckgrat des Themas bilden, wobei fuer jede Arbeit das Hauptergebnis und die Auswirkung klar formuliert sind.

**Bei Fehler:** Wenn die Suche keine klar richtungsweisenden Arbeiten ergibt, kann das Thema zu neu oder zu speziell sein. In diesem Fall die fruehesten Arbeiten und die meistzitierten Arbeiten als Anker identifizieren und anmerken, dass die kanonischen Referenzen des Feldes noch nicht entstanden sind.

### Schritt 3: Die Ideenentwicklung chronologisch kartieren

Nachzeichnen, wie sich das Feld von seinen Urspruengen bis zur Gegenwart entwickelt hat:

1. **Ursprungsphase**: Identifizieren, wann und wo die Kernideen erstmals auftraten. Festhalten, ob die Ideen innerhalb des Zielfeldes entstanden oder aus einer anderen Domaene importiert wurden.
2. **Wachstumsphase**: Nachzeichnen, wie die anfaenglichen Ergebnisse verallgemeinert, angewendet oder in Frage gestellt wurden. Schluesselwendepunkte identifizieren, an denen sich die Richtung des Feldes aenderte (z.B. eine neue Beweistechnik, ein unerwartetes Gegenbeispiel, eine experimentelle Bestaetigung).
3. **Verzweigungspunkte**: Kartieren, wo sich die Literatur in Unterthemen verzweigt. Fuer jeden Zweig kurz seinen Fokus und seine Beziehung zum Hauptstrang charakterisieren.
4. **Aktueller Stand**: Charakterisieren, wo das Feld heute steht. Ist es reif (Ergebnisse konsolidieren sich), aktiv (schnelle Entwicklung) oder stagnierend (wenige neue Arbeiten)?
5. **Zeitstrahl-Konstruktion**: Einen chronologischen Zeitstrahl der wichtigsten Entwicklungen erstellen.

```markdown
## Chronological Development

### Origin ([decade])
- [event/paper]: [description of foundational contribution]

### Key Developments
- **[year]**: [milestone and its significance]
- **[year]**: [milestone and its significance]
- ...

### Branching Points
- **[year]**: Field splits into [branch A] and [branch B]
  - Branch A focuses on [topic]
  - Branch B focuses on [topic]

### Current State ([year])
- **Activity level**: [mature / active / emerging / stagnant]
- **Dominant approach**: [current mainstream methodology]
- **Recent trend**: [direction of latest work]
```

**Erwartet:** Ein narrativer Zeitstrahl, den ein Neuling lesen koennte, um zu verstehen, wie das Feld zu seinem aktuellen Stand gelangt ist, einschliesslich der intellektuellen Abstammung von Schluesselideen.

**Bei Fehler:** Wenn die Chronologie unklar ist (z.B. mehrere unabhaengige Entdeckungen, streitige Prioritaet), die Mehrdeutigkeit dokumentieren, anstatt eine falsche lineare Erzaehlung aufzuzwingen. Parallele Zeitstraehle sind akzeptabel.

### Schritt 4: Offene Probleme und aktive Fronten identifizieren

Katalogisieren, was noch nicht bekannt oder geloest ist:

1. **Explizit formulierte offene Probleme**: Nach Review-Artikeln, Problemlisten und Survey-Arbeiten suchen, die explizit offene Fragen auflisten. Viele Felder pflegen kanonische Listen (z.B. die Clay Millennium-Probleme, Hilberts Probleme, offene Probleme in der Quanteninformation).
2. **Implizit offene Probleme**: Ergebnisse identifizieren, die vermutet aber nicht bewiesen sind, numerische Beobachtungen ohne theoretische Erklaerung oder Diskrepanzen zwischen Theorie und Experiment.
3. **Aktive Fronten**: Die Themen identifizieren, die in den letzten 2-3 Jahren die meiste Aufmerksamkeit erhalten. Diese zeichnen sich durch eine hohe Rate neuer Preprints, Konferenzsitzungen und Foerderaufrufe aus.
4. **Fortschrittsbarrieren**: Fuer jedes groessere offene Problem kurz beschreiben, warum es schwer ist. Welches mathematische oder konzeptuelle Hindernis steht im Weg?
5. **Potenzielle Auswirkung**: Fuer jedes offene Problem die Auswirkung seiner Loesung abschaetzen. Waere es inkrementell (eine Luecke fuellend) oder transformativ (veraendert, wie das Feld denkt)?

```markdown
## Open Problems and Frontiers

### Explicitly Open
| # | Problem | Status | Barrier | Potential Impact |
|---|---------|--------|---------|-----------------|
| 1 | [statement] | [conjecture / partial / open] | [why hard] | [incremental / significant / transformative] |
| 2 | ... | ... | ... | ... |

### Active Frontiers
- **[frontier topic]**: [what is happening and why it matters]
- ...

### Implicit Gaps
- [observation without theoretical explanation]
- [conjecture without proof]
- ...
```

**Erwartet:** Ein strukturierter Katalog von mindestens 3-5 offenen Problemen mit Schwierigkeitsbewertungen, plus eine Charakterisierung der aktivsten Forschungsfronten.

**Bei Fehler:** Wenn keine offenen Probleme erkennbar sind, kann der Uebersichtsumfang zu eng sein (das Unterthema ist geloest) oder die Literatursuche hat die relevanten Review-Artikel verfehlt. Den Umfang erweitern oder gezielt nach "open problems in [topic]" und "future directions in [topic]" suchen.

### Schritt 5: Domaenenuebergreifende Verbindungen synthetisieren und strukturierte Uebersicht erstellen

Das untersuchte Feld mit benachbarten Bereichen verbinden und die endgueltige Ausgabe zusammenstellen:

1. **Domaenenuebergreifende Verbindungen**: Identifizieren, wo das untersuchte Thema sich mit anderen Feldern verbindet:
   - Gemeinsame mathematische Strukturen (z.B. dieselbe Gleichung, die in Optik und Quantenmechanik auftaucht)
   - Analogien und Dualitaeten (z.B. AdS/CFT, das Gravitation und Feldtheorie verbindet)
   - Methodische Importe (z.B. maschinelles Lernen, angewandt auf theoretische Physik)
   - Experimentelle Verbindungen (z.B. Vorhersagen, die in Kalt-Atom- oder photonischen Systemen testbar sind)

2. **Verbindungsqualitaetsbewertung**: Fuer jede Verbindung bewerten, ob sie ist:
   - Tief (strukturelle Aequivalenz, bewiesene Dualitaet)
   - Vielversprechend (suggestive Analogie, aktive Untersuchung)
   - Oberflaechlich (oberflaechliche Aehnlichkeit, keine bewiesene Beziehung)

3. **Lueckenanalyse**: Verbindungen identifizieren, die existieren sollten, aber noch nicht erforscht wurden. Dies sind potenzielle Forschungsmoeglichkeiten.

4. **Uebersicht-Zusammenstellung**: Die Ergebnisse aus Schritten 1-5 zu einem strukturierten Dokument zusammenstellen:
   - Zusammenfassung (1 Absatz)
   - Umfang und Methodik (aus Schritt 1)
   - Historische Entwicklung (aus Schritt 3)
   - Schluesselergebnisse und richtungsweisende Arbeiten (aus Schritt 2)
   - Offene Probleme und Fronten (aus Schritt 4)
   - Domaenenuebergreifende Verbindungen (aus diesem Schritt)
   - Bibliografie

```markdown
## Cross-Domain Connections
| # | Connected Field | Type of Connection | Depth | Key Reference |
|---|----------------|-------------------|-------|---------------|
| 1 | [field] | [shared math / analogy / method import] | [deep / promising / superficial] | [paper] |
| 2 | ... | ... | ... | ... |

## Unexplored Connections (Research Opportunities)
- [potential connection]: [why it might exist and what it could yield]
- ...
```

**Erwartet:** Ein vollstaendiges, strukturiertes Uebersichtsdokument, das das Thema von den Urspruengen bis zu aktuellen Fronten kartiert, mit identifizierten und bewerteten domaenenuebergreifenden Verbindungen.

**Bei Fehler:** Wenn die Uebersicht sich zusammenhanglos anfuehlt, den chronologischen Zeitstrahl (Schritt 3) erneut aufgreifen und als organisierendes Rueckgrat verwenden. Jede richtungsweisende Arbeit, jedes offene Problem und jede domaenenuebergreifende Verbindung sollte auf dem Zeitstrahl verortet werden koennen.

## Validierung

- [ ] Der Uebersichtsumfang ist mit Einschluss- und Ausschlusskriterien praezise definiert
- [ ] Richtungsweisende Arbeiten sind mit Hauptergebnissen und formulierter Auswirkung identifiziert
- [ ] Die chronologische Entwicklung ist mit Schluesselmeilensteinen nachgezeichnet
- [ ] Mindestens 3-5 offene Probleme sind mit Schwierigkeits- und Auswirkungsbewertungen katalogisiert
- [ ] Domaenenuebergreifende Verbindungen sind identifiziert und ihre Tiefe ist bewertet
- [ ] Die Bibliografie enthaelt alle zitierten Arbeiten mit vollstaendigen Referenzinformationen
- [ ] Ein Neuling im Feld koennte die Uebersicht lesen und die Landschaft verstehen
- [ ] Die Uebersicht unterscheidet gesicherte Ergebnisse von Vermutungen und offenen Fragen
- [ ] Der Zeitpunkt der Erstellung der Uebersicht ist angegeben, damit Leser die Aktualitaet beurteilen koennen

## Haeufige Stolperfallen

- **Umfangsausdehnung**: Mit einem fokussierten Thema beginnen und es schrittweise ausweiten, um alles tangential Verwandte einzubeziehen. Der Kernthema-Satz aus Schritt 1 ist das Akzeptanzkriterium; ihn rigoros durchsetzen.
- **Aktualitaetsbias**: Juengere Arbeiten auf Kosten grundlegender Beitraege uebermaessig repraesentieren. Eine Arbeit von 2024 mit 10 Zitierungen kann weniger wichtig sein als eine Arbeit von 1980 mit 5.000 Zitierungen. Einfluss gewichten, nicht Neuheit.
- **Zitierungszahl-Vergoetterung**: Zitierungszahlen als einziges Mass fuer Wichtigkeit verwenden. Vielzitierte Arbeiten koennen methodische Werkzeuge sein (weit verbreitet, aber konzeptuell nicht tiefgehend), waehrend transformative Arbeiten in Nischenfeldern weniger zitiert sein koennen.
- **Negative Ergebnisse uebersehen**: Fehlgeschlagene Versuche und widerlegte Vermutungen sind Teil der Geschichte des Feldes. Ihr Weglassen ergibt eine irrefuehrend glatte Erzaehlung.
- **Oberflaechliche domaenenuebergreifende Verbindungen**: Eine Verbindung zwischen zwei Feldern behaupten, weil sie dasselbe Wort verwenden (z.B. "Entropie" in Thermodynamik und Informationstheorie sind verwandt, aber "Gauge" in Physik und Stricken sind es nicht). Tiefe bewerten, bevor einbezogen wird.
- **Praesentismus**: Historische Arbeiten nach modernen Standards beurteilen. Eine Arbeit von 1960 sollte fuer ihren Beitrag angesichts dessen bewertet werden, was 1960 bekannt war, nicht fuer das, was sie nicht vorhergesehen hat.

## Verwandte Skills

- `formulate-quantum-problem` -- spezifische Probleme formulieren, die waehrend der Literatururebersicht identifiziert wurden
- `derive-theoretical-result` -- Schluesselergebnisse aus der gesichteten Literatur ableiten oder nachleiten
- `review-research` -- einzelne Arbeiten bewerten, die waehrend der Uebersicht angetroffen wurden
