---
name: grade-tcg-card
description: >
  Eine Sammelkarte nach PSA-, BGS- oder CGC-Standards bewerten. Umfasst
  Beobachtung-zuerst-Bewertung (adaptiert von der unbefangenen Beobachtung
  des meditate-Skills), Zentrierungsmessung, Oberflaechenanalyse, Kanten-
  und Ecken-Bewertung und abschliessende Gradierung mit Konfidenzintervall.
  Unterstuetzt Pokemon, MTG, Flesh and Blood und Kayou-Karten. Verwenden
  beim Bewerten einer Karte vor professioneller Gradierungs-Einreichung, beim
  Vorscreening einer Sammlung auf hochgradig bewertbare Kandidaten, beim
  Beilegen von Zustandsstreitigkeiten zwischen Kaeufern und Verkaeufern oder
  beim Schaetzen der gradierungsabhaengigen Wertspanne einer Karte.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, grading, psa, bgs, cgc, pokemon, mtg, fab, kayou, cards, collecting
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# TCG-Karte bewerten

Eine Sammelkarte nach professionellen Gradierungsstandards (PSA, BGS, CGC) bewerten und einstufen. Verwendet ein Beobachtung-zuerst-Protokoll, adaptiert vom `meditate`-Skill, um Grad-Verankerung zu verhindern — die haeufigste Bewertungsverzerrung.

## Wann verwenden

- Eine Karte vor der Einreichung bei einem professionellen Gradierungsdienst bewerten
- Eine Sammlung vorscreenen, um hochgradig bewertbare Kandidaten zu identifizieren, die eine Einreichung wert sind
- Streitigkeiten ueber den Kartenzustand zwischen Kaeufern und Verkaeufern beilegen
- Lernen, konsistent zu bewerten, indem einem strukturierten Bewertungsprotokoll gefolgt wird
- Die gradierungsabhaengige Wertspanne fuer eine bestimmte Karte schaetzen

## Eingaben

- **Erforderlich**: Kartenidentifikation (Set, Nummer, Name, Variante/Edition)
- **Erforderlich**: Kartenbilder oder physische Beschreibung (Vorder- und Rueckseite)
- **Erforderlich**: Anzuwendender Gradierungsstandard (PSA 1-10, BGS 1-10 mit Unterbewertungen, CGC 1-10)
- **Optional**: Bekannter Marktwert bei verschiedenen Graden (fuer Grad-Wert-Analyse)
- **Optional**: Kartenspiel (Pokemon, Magic: The Gathering, Flesh and Blood, Kayou)

## Vorgehensweise

### Schritt 1: Vorurteilsfreiheit — Beobachtung ohne Voreingenommenheit

Adaptiert von `meditate` Schritt 2-3: Die Karte ohne Verankerung an erwarteten Grad oder Marktwert beobachten.

1. Jedes Wissen ueber den Marktwert der Karte beiseitelegen
2. KEINE kuerzlichen Verkaeufe oder Populationsberichte vor der Bewertung nachschlagen
3. Wenn bekannt ist, dass die Karte "wertvoll" ist, diese Voreingenommenheit explizit anerkennen:
   - "Ich weiss, diese Karte ist in PSA 10 $X wert. Ich lege das beiseite."
4. Die Karte zuerst als physisches Objekt untersuchen, nicht als Sammlerstueck
5. Den ersten Bauchgefuehl-Eindruck notieren, aber die Bewertung NICHT davon verankern lassen
6. Voreilige Gradgedanken als "Verankerung" kennzeichnen und zur Beobachtung zurueckkehren

**Erwartet:** Ein neutraler Ausgangszustand, in dem die Karte rein nach physischem Zustand bewertet wird, nicht nach Markterwartungen. Grad-Verankerung (den Wert vor der Bewertung kennen) ist die haeufigste Ursache fuer Bewertungsinkonsistenz.

**Bei Fehler:** Wenn die Voreingenommenheit hartnackig ist (eine hochwertige Karte laesst eine 10 sehen wollen), die Voreingenommenheit explizit aufschreiben. Externalisierung reduziert ihren Einfluss. Nur fortfahren, wenn die Karte als physisches Objekt untersucht werden kann.

### Schritt 2: Zentrierungsbewertung

Die Druckzentrierung der Karte auf beiden Seiten messen.

1. Die Randbreite auf allen vier Seiten der Vorderseite messen:
   - Linker vs. rechter Rand (horizontale Zentrierung)
   - Oberer vs. unterer Rand (vertikale Zentrierung)
   - Als Verhaeltnis ausdruecken: z.B. 55/45 links-rechts, 60/40 oben-unten
2. Fuer die Rueckseite wiederholen
3. Die Zentrierungsschwellen des Gradierungsstandards anwenden:

```
PSA Centering Thresholds:
+-------+-------------------+-------------------+
| Grade | Front (max)       | Back (max)        |
+-------+-------------------+-------------------+
| 10    | 55/45 or better   | 75/25 or better   |
| 9     | 60/40 or better   | 90/10 or better   |
| 8     | 65/35 or better   | 90/10 or better   |
| 7     | 70/30 or better   | 90/10 or better   |
+-------+-------------------+-------------------+

BGS Centering Subgrade:
+------+-------------------+-------------------+
| Sub  | Front (max)       | Back (max)        |
+------+-------------------+-------------------+
| 10   | 50/50 perfect     | 50/50 perfect     |
| 9.5  | 55/45 or better   | 60/40 or better   |
| 9    | 60/40 or better   | 65/35 or better   |
| 8.5  | 65/35 or better   | 70/30 or better   |
+------+-------------------+-------------------+
```

4. Den Zentrierungswert fuer jede Achse und die zutreffende Unterbewertung erfassen

**Erwartet:** Numerische Zentrierungsverhaeltnisse fuer beide Seiten mit dem entsprechenden Grad/Untergrad identifiziert. Dies ist die objektivste Messung im Bewertungsprozess.

**Bei Fehler:** Wenn Raender zu schmal zum genauen Messen sind (Vollflaechenkarten, randlose Drucke), "Zentrierung N/A — randlos" notieren und zu Schritt 3 springen. Einige Gradierungsdienste wenden unterschiedliche Standards fuer randlose Karten an.

### Schritt 3: Oberflaechenanalyse

Die Kartenoberflaeche auf Defekte untersuchen.

1. Die Vorderoberflaeche bei guter Beleuchtung untersuchen:
   - **Druckfehler**: Tintenflecken, fehlende Tinte, Drucklinien, Farbinkonsistenz
   - **Oberflaechenkratzer**: Unter direktem und schragem Licht sichtbar
   - **Oberflaechenweissung**: Schleier oder Truebung der Oberflaechenschicht
   - **Eindeluungen oder Eindruecke**: Dellen sichtbar bei Streiflicht
   - **Flecken oder Verfaerbung**: Vergilbung, Wasserflecken, chemische Schaeden
2. Die Rueckoberflaeche mit denselben Kriterien untersuchen
3. Auf Werksfehler vs. Handhabungsschaeden pruefen:
   - Werk: Drucklinien, Fehlschnitt, Praegung — kann weniger bestraft werden
   - Handhabung: Kratzer, Dellen, Flecken — wird immer bestraft
4. Oberflaechenzustand bewerten:
   - Makellos (10): Fehlerfrei unter Vergroesserung
   - Nahezu makellos (9-9,5): Geringfuegige Unvollkommenheiten nur unter Vergroesserung sichtbar
   - Ausgezeichnet (8-8,5): Geringfuegige Abnutzung mit blossem Auge sichtbar
   - Gut (6-7): Maessige Abnutzung, mehrere geringfuegige Defekte
   - Befriedigend oder darunter (1-5): Erhebliche Schaeden sichtbar

**Erwartet:** Ein detailliertes Oberflaecheninventar, in dem jeder Defekt lokalisiert, beschrieben und nach Schwere bewertet ist. Werksfehler von Handhabungsschaeden unterschieden.

**Bei Fehler:** Wenn Bilder eine zu niedrige Aufloesung fuer die Oberflaechenanalyse haben, die Einschraenkung notieren und einen Gradbereich statt einer Punktbewertung angeben. Physische Inspektion empfehlen.

### Schritt 4: Kanten- und Ecken-Bewertung

Die Kanten und Ecken der Karte auf Abnutzung bewerten.

1. Alle vier Kanten untersuchen:
   - **Weissung**: Weisse Flecken oder Linien entlang farbiger Kanten (der haeufigste Defekt)
   - **Absplitterung**: Kleine Stuecke der Kantenschicht fehlen
   - **Rauheit**: Kante fuehlt sich uneben an oder hat Mikrorisse
   - **Folienabloesung**: Bei Hologrammkarten auf Delamination an Kanten pruefen
2. Alle vier Ecken untersuchen:
   - **Schaerfe**: Eckenspitze ist scharf und spitz
   - **Abrundung**: Eckenspitze ist zu einer Kurve abgenutzt (leicht, maessig, stark)
   - **Spaltung**: Schichtentrennung an der Ecke sichtbar (Dellen)
   - **Knicke**: Ecke umgebogen oder gefaltet
3. Kanten- und Eckenzustand auf derselben Skala wie die Oberflaeche bewerten
4. Notieren, welche spezifischen Ecken/Kanten den schlechtesten Zustand haben

**Erwartet:** Bewertung pro Kante und pro Ecke. Die schlechteste einzelne Ecke/Kante begrenzt typischerweise die Gesamtbewertung.

**Bei Fehler:** Wenn die Karte in einer Schutzhuelle oder einem Toploader steckt, der Kanten verdeckt, notieren welche Bereiche nicht vollstaendig bewertet werden konnten.

### Schritt 5: Endnote vergeben

Teilbewertungen zur Endnote zusammenfuehren.

1. Fuer **PSA-Gradierung** (einzelne Zahl 1-10):
   - Die Endnote wird durch die schwaechste Teilbewertung begrenzt
   - Eine Karte mit perfekter Oberflaeche aber 65/35-Zentrierung ist auf PSA 8 begrenzt
   - Das "niedrigstes-begrenzt"-Prinzip anwenden, dann nach oben anpassen wenn andere Bereiche herausragend sind
2. Fuer **BGS-Gradierung** (vier Unterbewertungen → Gesamt):
   - Unterbewertungen vergeben: Zentrierung, Kanten, Ecken, Oberflaeche (jeweils 1-10 in 0,5-Schritten)
   - Gesamt = gewichteter Durchschnitt, aber die niedrigste Unterbewertung begrenzt das Gesamt
   - BGS 10 Pristine erfordert alle vier Unterbewertungen auf 10
   - BGS 9.5 Gem Mint erfordert Durchschnitt von 9,5+ ohne Unterbewertung unter 9
3. Fuer **CGC-Gradierung** (aehnlich wie PSA mit Unterbewertungen auf dem Etikett):
   - Zentrierung, Oberflaeche, Kanten, Ecken vergeben
   - Gesamt folgt CGCs proprietaerer Gewichtung
4. Die Endnote mit Konfidenz angeben:
   - "PSA 8 (sicher)" — klare Note, unwahrscheinlich hoeher oder niedriger
   - "PSA 8-9 (grenzwertig)" — koennte bei dem Gradierungsdienst in beide Richtungen gehen
   - "PSA 7-8 (unsicher)" — begrenzte Bewertungsdaten

**Erwartet:** Eine Endnote mit Konfidenzgrad. Fuer BGS alle vier Unterbewertungen berichtet. Die Note wird durch Belege aus den Schritten 2-4 gestuetzt.

**Bei Fehler:** Wenn die Bewertung nicht eindeutig ist (z.B. unklar ob ein Oberflaechenmal ein Kratzer oder Schmutz ist), einen Gradbereich angeben und professionelle Gradierung empfehlen. Niemals eine sichere Note mit unzureichenden Daten vergeben.

## Validierung

- [ ] Vorurteilspruefung vor der Bewertung abgeschlossen (keine Grad-Verankerung)
- [ ] Zentrierung auf beiden Seiten mit erfassten Verhaeltnissen gemessen
- [ ] Oberflaeche auf Kratzer, Druckfehler, Flecken, Eindellungen untersucht
- [ ] Alle vier Kanten und Ecken einzeln bewertet
- [ ] Werksfehler von Handhabungsschaeden unterschieden
- [ ] Endnote durch Belege aus jeder Teilbewertung gestuetzt
- [ ] Konfidenzgrad angegeben (sicher, grenzwertig, unsicher)
- [ ] Gradierungsstandard korrekt angewendet (PSA/BGS/CGC-Schwellenwerte)

## Haeufige Stolperfallen

- **Grad-Verankerung**: Den Wert einer Karte vor der Bewertung zu kennen verzerrt die Einschaetzung in Richtung des "erhofften" Grades. Immer zuerst physisch bewerten
- **Die Rueckseite ignorieren**: Rueckoberflaeche und Rueckzentrierung zaehlen. Viele Bewerter konzentrieren sich zu stark auf die Vorderseite
- **Werksfehler mit Handhabungsschaeden verwechseln**: Eine werkseitige Drucklinie unterscheidet sich von einem Kratzer, aber beide beeinflussen die Note
- **Hologrammkarten ueberbewerten**: Holographische und Folienkarten verbergen Oberflaechenkratzer bis sie im richtigen Winkel betrachtet werden. Mehrere Lichtwinkel verwenden
- **Optische Taeuschungen bei der Zentrierung**: Die Platzierung der Grafik kann die Zentrierung besser oder schlechter erscheinen lassen als sie ist. Die Raender messen, nicht die Grafik

## Verwandte Skills

- `build-tcg-deck` — Deck-Bau, bei dem der Kartenzustand die Turnierlegalitaet beeinflusst
- `manage-tcg-collection` — Sammlungsverwaltung mit gradierungsbasierter Bewertung
- `meditate` — Quelle der Beobachtung-ohne-Vorurteil-Technik, adaptiert fuer die Verhinderung von Bewertungsverzerrungen
