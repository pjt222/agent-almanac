---
name: screen-trademark
description: >
  Screen a proposed trademark for conflicts and distinctiveness before filing.
  Covers trademark database searches (TMview, WIPO Global Brand Database, USPTO
  TESS), distinctiveness analysis using the Abercrombie spectrum, likelihood of
  confusion assessment using DuPont factors and EUIPO relative grounds, common
  law rights evaluation, and goods/services overlap analysis. Produces a conflict
  report with a risk matrix. Use before adopting a new brand name, logo, or
  slogan — distinct from patent prior art search, which uses different databases,
  legal frameworks, and analysis methods.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, trademark, screening, distinctiveness, conflict, likelihood-of-confusion
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Marke screenen

Eine vorgeschlagene Marke auf Konflikte screenen und ihre Unterscheidungskraft vor Anmeldung bewerten. Marken-Register durchsuchen, die Marke auf dem Abercrombie-Spektrum bewerten, Verwechslungs-Wahrscheinlichkeit mit Vorgaengermarken analysieren und einen Konflikt-Bericht mit umsetzbaren Risiko-Bewertungen produzieren.

## Wann verwenden

- Vor Annahme eines neuen Markennamens, Produktnamens oder Service-Marks
- Beim Rebranding oder Erweitern in neue Waren-/Dienstleistungs-Klassen
- Vor Einreichung einer Markenanmeldung (national, EU oder international)
- Beim Bewerten von Acquisition-Zielen mit Markenportfolios
- Vor Launch eines Produkts in einem neuen geografischen Markt mit existierendem Branding
- Wenn ein Cease-and-Desist-Schreiben empfangen wird und Exposition eingeschaetzt werden muss

## Eingaben

- **Erforderlich**: Vorgeschlagene Marke (Wortmarke, Bildmarke oder beide)
- **Erforderlich**: Waren und/oder Dienstleistungen die die Marke abdecken wird (einfache Sprache)
- **Erforderlich**: Geografischer Scope (US, EU, spezifische Laender oder global)
- **Optional**: Nizza-Klassifikations-Klassen falls bereits bekannt
- **Optional**: Beabsichtigtes Datum der ersten Nutzung (relevant fuer US-Common-Law-Prioritaet)
- **Optional**: Bekannte konkurrierende Marken oder Brands im Bereich
- **Optional**: Ob die Marke eine Wort-, Bild- oder Composite-Marke ist

## Vorgehensweise

### Schritt 1: Marke und Waren/Dienstleistungen definieren

Genau etablieren was gescreent wird und in welchen Klassen.

1. Die vorgeschlagene Marke praezise aufzeichnen:
   - Wortmarke: der Text wie er erscheinen wird (Gross-/Kleinschreibung wichtig fuer figurative Elemente)
   - Bildmarke: die visuellen Elemente, Farben, Stilisierung beschreiben
   - Composite-Marke: sowohl die Wort- als auch die figurativen Elemente zusammen
2. Die Waren und/oder Dienstleistungen in einfacher Sprache beschreiben
3. Die anwendbaren Nizza-Klassifikations-Klassen identifizieren:
   - TMclass (https://tmclass.tmdn.org/) zur Klassen-Suche nutzen
   - Nach Stichwort suchen um die korrekte Klasse und akzeptable Begriffe zu finden
   - Die meisten Marken brauchen 1-3 Klassen; alle relevanten identifizieren
   - Angrenzende Klassen wo Verwechslung entstehen koennte (z.B. Klasse 9 Software und Klasse 42 SaaS)
4. Den geografischen Scope dokumentieren:
   - US (USPTO), EU (EUIPO), international (WIPO Madrid) oder spezifische nationale Aemter
   - Jurisdiktionsunterschiede vermerken: US ist First-to-Use; EU ist First-to-File

**Erwartet:** Eine klare Aufzeichnung der Marke, ihrer Waren-/Dienstleistungs-Beschreibung, Nizza-Klassen und Ziel-Jurisdiktionen. Dies definiert den Such-Scope fuer alle nachfolgenden Schritte.

**Bei Fehler:** Wenn Nizza-Klassifikation mehrdeutig ist (Waren/Dienstleistungen umspannen mehrere Klassen oder passen nicht klar in eine), zugunsten von mehr Klassen einbeziehen irren. Einen breiteren Scope zu screenen ist sicherer als einen Konflikt in einer angrenzenden Klasse zu verfehlen.

### Schritt 2: Marken-Datenbanken durchsuchen

Nach identischen und aehnlichen Marken ueber Register durchsuchen.

1. Zuerst nach **identischen Marken** suchen (exakter Match):
   - **TMview** (https://www.tmdn.org/tmview/): EU und teilnehmende nationale Aemter
   - **WIPO Global Brand Database** (https://branddb.wipo.int/): internationale Registrierungen
   - **USPTO TESS / Trademark Center** (https://tsdr.uspto.gov/): US-Registrierungen und -Anmeldungen
   - **Nationale Aemter** wie relevant: DPMAregister (Deutschland), UKIPO (UK), CIPO (Kanada)
2. Nach **aehnlichen Marken** suchen — die Suche erweitern um zu finden:
   - Phonetische Aequivalente: Marken die gleich klingen ("Kool" vs. "Cool", "Lyft" vs. "Lift")
   - Visuelle Aequivalente: Marken die gleich aussehen ("Adidaz" vs. "Adidas")
   - Transliterationen und Uebersetzungen der Marke
   - Marken mit gemeinsamen hinzugefuegten/entfernten Praefixen/Suffixen
   - Plurale, Possessive und Abkuerzungen
3. Ergebnisse filtern nach:
   - Status: lebende/registrierte Marken und anhaengige Anmeldungen (tote/gestrichene ignorieren)
   - Waren/Dienstleistungen: gleiche oder verwandte Nizza-Klassen (aus Schritt 1)
   - Geografie: Ziel-Jurisdiktionen
4. Fuer jeden potenziellen Konflikt aufzeichnen:
   - Markentext und Registrierungs-/Anmeldungs-Nummer
   - Inhabername und Jurisdiktion
   - Nizza-Klassen und Waren-/Dienstleistungs-Beschreibung
   - Status (registriert, anhaengig, widersprochen) und Daten
   - Ob die Marke identisch oder aehnlich ist (und wie: phonetisch, visuell, konzeptuell)

**Erwartet:** Eine Liste potenziell konfliktiver Marken aus mindestens zwei Datenbanken, die sowohl identische als auch aehnliche Marken in den relevanten Klassen und Jurisdiktionen abdeckt. Jedes Ergebnis enthaelt genuegend Details fuer die Verwechslungs-Analyse in Schritt 4.

**Bei Fehler:** Wenn eine Datenbank vorruebergehend nicht verfuegbar ist, die Luecke vermerken und mit verfuegbaren Quellen fortfahren. Wenn die vorgeschlagene Marke ein gewoehnliches Wort ist, einen grossen Ergebnis-Satz erwarten — Ergebnisse in derselben oder eng verwandten Nizza-Klassen priorisieren bevor erweitert wird.

### Schritt 3: Unterscheidungskraft bewerten

Evaluieren wo die vorgeschlagene Marke auf dem Abercrombie-Spektrum faellt.

1. Das **Abercrombie-Spektrum** anwenden (schwaechste bis staerkste):
   - **Generisch**: Der gewoehnliche Name fuer die Waren/Dienstleistungen ("Computer Software" fuer Software). Nicht registrierbar und nicht schutzfaehig
   - **Beschreibend**: Beschreibt direkt eine Qualitaet, Eigenschaft oder Zweck ("Quick Print" fuer Druck). Registrierbar nur mit Evidenz fuer sekundaere Bedeutung (erworbene Unterscheidungskraft)
   - **Suggestiv**: Suggeriert eine Qualitaet aber erfordert Vorstellungskraft zur Verbindung ("Netflix" = Internet + Flicks). Inhaerent unterscheidungskraeftig; registrierbar ohne sekundaere Bedeutung
   - **Willkuerlich**: Ein echtes Wort in unverwandtem Kontext genutzt ("Apple" fuer Computer). Starke inhaerente Unterscheidungskraft
   - **Phantasievoll**: Ein gepraegtes Wort ohne vorherige Bedeutung ("Xerox", "Kodak"). Staerkste Unterscheidungskraft
2. Sekundaere Bedeutung bewerten wenn die Marke beschreibend ist:
   - Dauer und Umfang der Nutzung im Verkehr
   - Werbeausgaben und Konsumenten-Exposition
   - Konsumenten-Umfragen oder Erklaerungen
   - Medien-Berichterstattung und unaufgeforderte Anerkennung
3. Auf Marken pruefen die durch **Genericide** generisch geworden sind:
   - War die Marke einst unterscheidungskraeftig wird aber jetzt als gewoehnlicher Begriff genutzt? (z.B. "escalator", "aspirin" in den USA)
4. Die Unterscheidungskraft-Bewertung mit Begruendung dokumentieren

**Erwartet:** Eine klare Klassifikation der Marke auf dem Abercrombie-Spektrum mit unterstuetzender Begruendung. Wenn die Marke beschreibend ist, eine Bewertung ob sekundaere Bedeutung etabliert werden kann. Suggestive, willkuerliche und phantasievolle Marken werden mit Vertrauen fortfahren.

**Bei Fehler:** Wenn die Marke an der generisch-beschreibenden Grenze faellt, ist dies ein signifikantes Registrierungs-Risiko. Empfehlen die Marke zu modifizieren um sie in Richtung suggestiv zu schieben (Twist hinzufuegen, mit unverwandtem Konzept kombinieren) oder eine Sekundaer-Bedeutungs-Evidenz-Strategie vorbereiten.

### Schritt 4: Verwechslungs-Wahrscheinlichkeit analysieren

Evaluieren ob die vorgeschlagene Marke wahrscheinlich mit irgendwelchen Vorgaengermarken aus Schritt 2 verwechselt wird.

1. Fuer jede potenziell konfliktive Vorgaengermarke die **DuPont-Faktoren** (US-Rahmen) oder **EUIPO-relative-Schutzhindernisse** bewerten:
   - **Aehnlichkeit der Marken**:
     - Visuell: Side-by-Side-Erscheinung, Buchstaben-Komposition, Laenge, Struktur
     - Phonetisch: Aussprache, Silbenanzahl, Betonungsmuster, Vokal-Klaenge
     - Konzeptuell: Bedeutung, Konnotation, kommerzieller Eindruck
   - **Aehnlichkeit der Waren/Dienstleistungen**:
     - Selbe Nizza-Klasse ist ein starker Indikator aber nicht abschliessend
     - Verwandte Waren/Dienstleistungen in unterschiedlichen Klassen koennen immer noch kollidieren
     - Vertriebskanaele und typische Kaeufer beruecksichtigen
   - **Staerke der Vorgaengermarke**:
     - Beruehmte Marken erhalten breiteren Schutz (Verwaesserungs-Doktrin)
     - Schwache/beschreibende Marken erhalten engeren Schutz
     - Marktpraesenz, Werbeausgaben, Anerkennungs-Umfragen
   - **Evidenz tatsaechlicher Verwechslung**:
     - Kundenbeschwerden, fehlgeleitete Kommunikation
     - Social-Media-Erwaehnungen die die zwei Brands verwechseln
     - Frueher Widerspruchs- oder Cancellation-Verfahren
2. Die Faktoren ganzheitlich abwaegen:
   - Kein einzelner Faktor ist entscheidend; die Analyse ist ein Abwaegungs-Test
   - Starke Aehnlichkeit in Marken kann schwache Aehnlichkeit in Waren ausgleichen (und umgekehrt)
   - Beruehmte Marken kippen die Balance leichter zugunsten von Verwechslungs-Befund
3. Jeden potenziellen Konflikt bewerten:
   - **Blockierend**: Beinahe-identische Marke in selben Waren/Dienstleistungen, starke Vorgaengermarke
   - **Hohes Risiko**: Aehnliche Marke in selben/verwandten Waren oder identische Marke in verwandten Waren
   - **Moderates Risiko**: Aehnliche Marke in verwandten Waren oder identische Marke in entfernten Waren
   - **Niedriges Risiko**: Schwache Aehnlichkeit, entfernte Waren oder schwache Vorgaengermarke

**Erwartet:** Eine bewertete Liste potenzieller Konflikte mit Analyse die jede Bewertung unterstuetzt. Die ernsthaftesten Konflikte (blockierend und hohes Risiko) sind mit spezifischer Begruendung identifiziert.

**Bei Fehler:** Wenn die Analyse grenzwertig ist (Faktoren in beide Richtungen zeigend), den Konflikt konservativ bewerten (hoeheres Risiko). Es ist sicherer einen potenziellen Konflikt zu markieren der sich als handhabbar erweist, als einen zu verfehlen der Registrierung blockiert oder Rechtsstreit ausloest.

### Schritt 5: Common-Law-Rechte bewerten

Nicht registrierte Markenrechte evaluieren die in Datenbank-Suchen moeglicherweise nicht erscheinen.

1. Nach frueherer Nutzung ohne Registrierung suchen:
   - Geschaeftsname-Register und staatliche/provinzielle Datenbanken
   - Domainnamen-Registrierungen (WHOIS, Domain-Such-Tools)
   - Social-Media-Handles und Geschaeftsprofile
   - Branchen-Verzeichnisse und Fachpublikationen
   - Google- und allgemeine Web-Suche nach kommerzieller Nutzung der Marke
2. Jurisdiktions-Regeln beruecksichtigen:
   - **US**: First-to-Use-System — frueher kommerzielle Nutzung schafft Rechte auch ohne Registrierung
   - **EU**: First-to-File-System — Registrierung hat Vorrang, aber frueher Nutzung kann begrenzte Verteidigungen schaffen
   - **UK**: Passing-off-Doktrin schuetzt nicht registrierte Marken mit Goodwill
3. Den Scope gefundener Common-Law-Rechte einschaetzen:
   - Geografische Reichweite des Marktes des frueheren Nutzers
   - Dauer und Konsistenz der Nutzung
   - Ob der Nutzer Goodwill in der Marke aufgebaut hat
4. Common-Law-Befunde und ihre Auswirkung auf die Gesamt-Risikobewertung dokumentieren

**Erwartet:** Eine ergaenzende Liste nicht registrierter Nutzungen der Marke (oder aehnlicher Marken) die Konflikte schaffen koennten die in Marken-Register-Suchen nicht sichtbar sind. Besonders wichtig fuer US-Anmeldungen.

**Bei Fehler:** Wenn Common-Law-Suche ueberwaeltigende Ergebnisse ergibt (die Marke ist ein gewoehnliches Wort), auf Nutzungen in derselben Branche/Waren-Kategorie fokussieren. Common-Law-Rechte sind typischerweise eng im Scope — eine lokale Baeckerei namens "Sunrise" blockiert kein Software-Produkt namens "Sunrise."

### Schritt 6: Waren-/Dienstleistungs-Ueberlappung evaluieren

Die wettbewerbliche Naehe von Waren/Dienstleistungen detailliert analysieren.

1. Nizza-Klassifikation der vorgeschlagenen Marke gegen jede Vorgaengermarke vergleichen:
   - Selbe Klasse: vermutete Ueberlappung (aber nicht automatisch — Klassen koennen breit sein)
   - Angrenzende Klassen: bewerten ob die Waren/Dienstleistungen komplementaer oder konkurrierend sind
   - Entfernte Klassen: typischerweise sicher ausser die Vorgaengermarke ist beruehmt
2. Vertriebskanaele analysieren:
   - Werden die Waren durch dieselben Einzelhaendler oder Plattformen verkauft?
   - Anvisieren sie dieselbe Konsumenten-Demografie?
   - Wuerde ein Konsument der beide Marken antrifft eine gemeinsame Quelle annehmen?
3. Erweiterungs-Wahrscheinlichkeit einschaetzen:
   - Ist der Vorgaengermarken-Inhaber wahrscheinlich in die Waren/Dienstleistungen der vorgeschlagenen Marke zu erweitern?
   - "Zone der natuerlichen Erweiterung"-Doktrin (US)
4. Die Ueberlappungs-Analyse mit unterstuetzender Begruendung dokumentieren

**Erwartet:** Eine klare Bewertung der Waren-/Dienstleistungs-Naehe fuer jeden potenziellen Konflikt, die die Verwechslungs-Wahrscheinlichkeits-Bewertungen aus Schritt 4 staerkt oder schwaecht.

**Bei Fehler:** Wenn die Waren-/Dienstleistungs-Beziehung unklar ist (neue Produktkategorien, konvergente Branchen), den Reasonable-Consumer-Test anwenden: wuerde ein typischer Kaeufer der beide Marken im Markt sieht annehmen dass sie aus derselben Quelle kommen?

### Schritt 7: Konflikt-Bericht erzeugen

Alle Befunde in einen strukturierten, umsetzbaren Bericht zusammenstellen.

1. Den **Marken-Konflikt-Bericht** mit Abschnitten schreiben:
   - **Executive Summary**: vorgeschlagene Marke, Schluessel-Befunde, Gesamt-Risiko-Bewertung
   - **Marke und Scope**: Markenbeschreibung, Nizza-Klassen, Jurisdiktionen
   - **Unterscheidungskraft-Bewertung**: Abercrombie-Klassifikation, Registrierungs-Implikationen
   - **Konflikt-Matrix**: alle identifizierten Konflikte mit Risiko-Bewertungen

```
Conflict Risk Matrix:
+----+-------------------+----------+---------+-------+---------+
| #  | Prior Mark        | Classes  | Juris.  | Type  | Risk    |
+----+-------------------+----------+---------+-------+---------+
| 1  | ACMESOFT          | 9, 42    | US, EU  | Ident | BLOCK   |
| 2  | ACME SOLUTIONS    | 42       | US      | Sim   | HIGH    |
| 3  | ACMEX             | 35       | EU      | Phon  | MOD     |
| 4  | ACM               | 16       | US      | Vis   | LOW     |
+----+-------------------+----------+---------+-------+---------+
Risk: BLOCK = blocking | HIGH | MOD = moderate | LOW | CLEAR
Type: Ident = identical | Sim = similar | Phon = phonetic | Vis = visual
```

   - **Common-Law-Befunde**: nicht registrierte Nutzungen von Relevanz
   - **Waren-/Dienstleistungs-Analyse**: Ueberlappungs-Bewertung pro Konflikt
   - **Empfehlungen**: eine der folgenden Gesamt-Schlussfolgerungen:
     - **Klar**: Keine signifikanten Konflikte gefunden — zur Anmeldung fortfahren
     - **Niedriges Risiko**: Geringe Konflikte unwahrscheinlich Registrierung zu verhindern — mit Monitoring fortfahren
     - **Moderates Risiko**: Konflikte existieren aber koennen handhabbar sein — Koexistenz-Vereinbarung, Markenmodifikation oder Verengung von Waren/Dienstleistungen erwaegen
     - **Hohes Risiko**: Signifikante Konflikte wahrscheinlich Widerspruch oder Verweigerung auszuloesen — substanzielle Markenmodifikation oder alternative Marken erwaegen
     - **Blockierend**: Beinahe-identische Vorgaengermarke in selben Waren/Dienstleistungen — nicht ohne Rechtsberatung fortfahren
2. Beschraenkungen und Einschraenkungen einbeziehen:
   - Screening ist keine Rechtsmeinung; vor Anmeldung Markenanwalt konsultieren
   - Common-Law-Rechte koennen ueber das hinaus existieren was Datenbank-Suchen enthuellen
   - Figurative Aehnlichkeit erfordert visuelle Inspektion (jenseits Text-Such-Faehigkeit)

**Erwartet:** Ein vollstaendiger Konflikt-Bericht mit Risiko-Bewertungen, Unterscheidungskraft-Bewertung und klaren Empfehlungen. Der Bericht ermoeglicht eine Go-/No-Go-Entscheidung zur vorgeschlagenen Marke.

**Bei Fehler:** Wenn die Analyse nicht schluessig ist (gemischte Signale ueber Jurisdiktionen oder Klassen), die Befunde nach Jurisdiktion praesentieren und den Entscheidungstraeger Geschaeftsueberlegungen neben Rechtsrisiko abwaegen lassen. Ein qualifiziertes "mit Vorsicht fortfahren" ist eine gueltige Schlussfolgerung.

## Validierungs-Checkliste

- [ ] Marke und Waren/Dienstleistungen klar mit Nizza-Klassen dokumentiert
- [ ] Mindestens zwei Marken-Datenbanken durchsucht (z.B. TMview + USPTO TESS)
- [ ] Sowohl identische als auch aehnliche Marken durchsucht (phonetisch, visuell, konzeptuell)
- [ ] Unterscheidungskraft auf dem Abercrombie-Spektrum mit Begruendung bewertet
- [ ] Verwechslungs-Wahrscheinlichkeit mit DuPont-Faktoren oder EUIPO-relativen-Schutzhindernissen analysiert
- [ ] Common-Law-Rechte untersucht (Geschaeftsnamen, Domains, Web-Praesenz)
- [ ] Waren-/Dienstleistungs-Ueberlappung fuer jeden potenziellen Konflikt evaluiert
- [ ] Konflikt-Matrix produziert mit Risiko-Bewertungen pro Marke
- [ ] Gesamt-Empfehlung bereitgestellt (klar / niedrig / moderat / hoch / blockierend)
- [ ] Beschraenkungen angegeben (Screening vs. Rechtsmeinung, Datenbank-Coverage-Luecken)

## Haeufige Stolperfallen

- **Nur-identisch-Suche**: Nach exakten Matches zu suchen verfehlt die gefaehrlichsten Konflikte — phonetisch und visuell aehnliche Marken die Verwechslungs-Wahrscheinlichkeit ausloesen. Immer nach Varianten suchen
- **Verwandte Klassen ignorieren**: Eine Software-Marke (Klasse 9) kann mit einer SaaS-Marke (Klasse 42) oder einer Beratungs-Marke (Klasse 35) kollidieren. Nizza-Klassen sind Guidelines, keine Mauern
- **Common-Law-Suche ueberspringen**: In den USA uebertrifft eine nicht registrierte Marke mit fruehere Nutzung eine spaetere Bundes-Registrierung. Datenbank-Suchen allein sind unzureichend
- **Unterscheidungskraft mit Verfuegbarkeit verbinden**: Eine Marke kann hoch unterscheidungskraeftig (phantasievoll) sein und trotzdem mit einer existierenden identischen Registrierung kollidieren. Unterscheidungskraft und Verfuegbarkeit sind separate Fragen
- **Single-Jurisdiction-Bias**: Eine Marke die in den USA klar ist kann in der EU blockiert sein und umgekehrt. Immer die Jurisdiktionen screenen wo die Marke tatsaechlich genutzt wird
- **Screening als Rechtsmeinung behandeln**: Dieser Skill produziert eine strukturierte Risiko-Bewertung, keine Rechtsberatung. Blockierende und hoch-Risiko-Befunde rechtfertigen Pruefung durch Markenanwalt vor finalen Entscheidungen

## Verwandte Skills

- `assess-ip-landscape` -- Breitere IP-Landscape-Kartierung die Marken-Screening innerhalb einer vollen IP-Strategie kontextualisiert
- `search-prior-art` -- Patent-fokussierte Prior-Art-Suche mit unterschiedlichen Datenbanken und Rechtsstandards (Neuheit/Naheliegung vs. Verwechslungs-Wahrscheinlichkeit)
- `file-trademark` -- Anmeldungs-Verfahren das einem erfolgreichen Screening folgt
