---
name: assess-ip-landscape
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Die IP-Landschaft fuer einen Technologiebereich oder Produktbereich kartieren.
  Umfasst Patentcluster-Analyse, Identifikation von Freiraeumen, Bewertung von
  Wettbewerber-IP-Portfolios, vorlaueufiges Freedom-to-Operate-Screening und
  strategische IP-Positionierungsempfehlungen. Anwenden vor dem Start von F&E in
  einem neuen Technologiebereich, bei der Bewertung des Markteintritts gegen
  Wettbewerber mit starken Patentportfolios, bei der Vorbereitung einer
  Investment-Due-Diligence, bei der Entwicklung einer Patent-Anmeldestrategie
  oder bei der Bewertung des Freedom-to-Operate-Risikos fuer ein neues Produkt.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, patents, landscape, fto, trademark, ip-strategy, prior-art
---

# IP-Landschaft bewerten

Die IP-Landschaft fuer einen Technologiebereich kartieren — Patentcluster, Freiraeume, Hauptakteure und Freedom-to-Operate-Risiken identifizieren. Erzeugt eine strategische Bewertung die F&E-Richtung, Lizenzierungsentscheidungen und Patent-Anmeldestrategie informiert.

## Wann verwenden

- Vor dem Start von F&E in einem neuen Technologiebereich (was ist bereits beansprucht?)
- Bewertung eines Markteintritts wo Wettbewerber starke Patentportfolios haben
- Vorbereitung einer Investment-Due-Diligence (IP-Vermoegensbewertung)
- Entwicklung einer Patent-Anmeldestrategie (wo anmelden, was beanspruchen)
- Bewertung des Freedom-to-Operate-Risikos fuer ein neues Produkt oder Feature
- Beobachtung der IP-Aktivitaeten von Wettbewerbern fuer strategische Positionierung

## Eingaben

- **Erforderlich**: Technologiebereich oder Produktbereich zur Bewertung
- **Erforderlich**: Geographischer Umfang (US, EU, global)
- **Optional**: Bestimmte Wettbewerber als Fokus
- **Optional**: Eigenes Patentportfolio (fuer Lueckenanalyse und FTO)
- **Optional**: Zeithorizont (letzte 5 Jahre, letzte 10 Jahre, gesamt)
- **Optional**: Klassifikationscodes (IPC, CPC) falls bekannt

## Vorgehensweise

### Schritt 1: Suchumfang definieren

Die Grenzen der Landschaftsanalyse festlegen.

1. Den Technologiebereich praezise definieren:
   - Kerntechnologiebereich (z.B. "transformerbasierte Sprachmodelle" nicht "KI")
   - Angrenzende Bereiche einbeziehen (z.B. "Aufmerksamkeitsmechanismen, Tokenisierung, Inferenz-Optimierung")
   - Bereiche explizit ausschliessen (z.B. "Computer-Vision-Transformer" bei NLP-Fokus)
2. Relevante Klassifikationscodes identifizieren:
   - IPC (Internationale Patentklassifikation) — breit, weltweit verwendet
   - CPC (Kooperative Patentklassifikation) — spezifischer, US/EU-Standard
   - WIPO-IPC-Publikation oder USPTO-CPC-Browser durchsuchen
3. Den geographischen Umfang definieren:
   - US (USPTO), EU (EPO), WIPO (PCT), spezifische nationale Aemter
   - Die meisten Analysen beginnen mit US + EU + PCT fuer breite Abdeckung
4. Das Zeitfenster festlegen:
   - Aktuelle Aktivitaet: letzte 3-5 Jahre (gegenwaertige Wettbewerbslandschaft)
   - Vollstaendige Historie: 10-20 Jahre (reife Technologiebereiche)
   - Auf abgelaufene Patente achten die Gestaltungsraum eroeffnen
5. Den Umfang als **Landschafts-Charter** dokumentieren

**Erwartet:** Ein klarer, abgegrenzter Umfang der spezifisch genug ist um umsetzbare Ergebnisse zu liefern aber breit genug um die relevante Wettbewerbslandschaft zu erfassen. Klassifikationscodes fuer systematische Suche identifiziert.

**Bei Fehler:** Wenn der Technologiebereich zu breit ist (tausende Ergebnisse), durch Hinzufuegen technischer Spezifitaet oder Fokussierung auf einen bestimmten Anwendungsbereich einschraenken. Wenn zu eng (wenige Ergebnisse), auf angrenzende Technologien erweitern. Der richtige Umfang liefert typischerweise 100-1000 Patentfamilien.

### Schritt 2: Patentdaten erheben

Die Patentdaten innerhalb des definierten Umfangs sammeln.

1. Patentdatenbanken mit dem Landschafts-Charter abfragen:
   - **Kostenlose Datenbanken**: Google Patents, USPTO PatFT/AppFT, Espacenet, WIPO Patentscope
   - **Kommerzielle Datenbanken**: Orbit, PatSnap, Derwent, Lens.org (Freemium)
   - Stichwortssuche + Klassifikationscodes kombinieren fuer beste Abdeckung
2. Suchabfragen systematisch aufbauen:

```
Abfrageaufbau:
+-------------------+------------------------------------------+
| Komponente        | Beispiel                                 |
+-------------------+------------------------------------------+
| Kernbegriffe      | "language model" OR "LLM" OR "GPT"       |
| Fachbegriffe      | "attention mechanism" OR "transformer"    |
| Klassifikation    | CPC: G06F40/*, G06N3/08                  |
| Zeitraum          | filed:2019-2024                          |
| Anmelderfilter    | (optional) bestimmte Unternehmen         |
+-------------------+------------------------------------------+
```

3. Ergebnisse in strukturiertem Format herunterladen (CSV, JSON) einschliesslich:
   - Patent-/Anmeldenummer, Titel, Zusammenfassung, Anmeldedatum
   - Anmelder/Inhaber, Erfinder
   - Klassifikationscodes, Zitationsdaten
   - Rechtsstatus (erteilt, anhaengig, abgelaufen, aufgegeben)
4. Nach Patentfamilie deduplizieren (nationale Anmeldungen derselben Erfindung gruppieren)
5. Die Gesamtzahl der Patentfamilien und Quelldatenbanken erfassen

**Erwartet:** Ein strukturierter Datensatz von Patentfamilien innerhalb des Umfangs, dedupliziert und mit Zeitstempel. Der Datensatz ist die Grundlage fuer alle nachfolgenden Analysen.

**Bei Fehler:** Wenn der Datenbankzugang eingeschraenkt ist, bieten Google Patents + Lens.org (kostenlos) gute Abdeckung. Wenn die Abfrage zu viele Ergebnisse liefert (>5000), technische Spezifitaet hinzufuegen. Wenn zu wenige (<50), Stichwoerter erweitern oder Klassifikationscodes hinzufuegen.

### Schritt 3: Die Landschaft analysieren

Die Patentcluster, Hauptakteure und Trends kartieren.

1. **Clusteranalyse**: Patente nach Subtechnologie gruppieren:
   - Klassifikationscodes oder Stichwortklustering verwenden um 5-10 Unterbereiche zu identifizieren
   - Patentfamilien pro Cluster zaehlen
   - Identifizieren welche Cluster wachsen (aktuelle Anmeldeschuebe) vs. reif (stagnierend oder ruecklaeufig)
2. **Hauptakteur-Analyse**: Die Top-10-Anmelder identifizieren nach:
   - Gesamtzahl der Patentfamilien (Portfoliobreite)
   - Aktuelle Anmelderate (letzte 3 Jahre — gegenwaertige Aktivitaet)
   - Durchschnittliche Zitationszahl (Qualitaetsindikator fuer Patente)
   - Geographische Anmeldebreite (nur US vs. globale Anmeldungen)
3. **Trendanalyse**: Anmeldetrends ueber das Zeitfenster darstellen:
   - Gesamtes Anmeldevolumen nach Jahr
   - Anmeldevolumen pro Cluster nach Jahr
   - Neue Marktteilnehmer (Anmelder die erstmals in der Domain anmelden)
4. **Zitationsnetzwerk**: Die meistzitierten Patente identifizieren (grundlegende IP):
   - Hohe Vorwaertszitationen = stark genutzt durch nachfolgende Anmeldungen
   - Dies sind wahrscheinlich blockierende Patente oder essentieller Stand der Technik
5. Die **Landschaftskarte** erstellen: Cluster, Akteure, Trends und Schluesselpatente

**Erwartet:** Ein klares Bild davon wer was besitzt, wo die Aktivitaet konzentriert ist und wie sich die Landschaft entwickelt. Blockierende Schluesselpatente identifiziert. Freiraeume (Bereiche mit wenigen Anmeldungen) sichtbar.

**Bei Fehler:** Wenn der Datensatz fuer sinnvolles Clustering zu klein ist, Cluster in breitere Gruppen zusammenfassen. Wenn ein Anmelder dominiert (>50% der Anmeldungen), dessen Portfolio als separate Unterlandschaft analysieren.

### Schritt 4: Freiraeume und Risiken identifizieren

Strategische Erkenntnisse aus der Landschaft extrahieren.

1. **Freiraumanalyse** (Chancen):
   - Technologiebereiche innerhalb des Umfangs mit wenigen oder keinen Patentanmeldungen
   - Abgelaufene Patentfamilien wo der Gestaltungsraum sich wieder geoeffnet hat
   - Aktive Bereiche wo nur ein Akteur angemeldet hat (Vorreiter aber kein Wettbewerb)
   - Freiraeume angrenzend an wachsende Cluster (naechste Grenze)
2. **FTO-Risikovorpruefung** (Bedrohungen) — angelehnt an die `heal`-Triage-Matrix:
   - **Kritisch**: Erteilte Patente die direkt das geplante Produkt/Feature abdecken
   - **Hoch**: Anhaengige Anmeldungen die wahrscheinlich mit relevanten Anspruechen erteilt werden
   - **Mittel**: Erteilte Patente in angrenzenden Bereichen die breit ausgelegt werden koennten
   - **Niedrig**: Abgelaufene Patente, enge Ansprueche, oder geographisch irrelevante Anmeldungen
3. **Wettbewerbspositionierung**:
   - Wo steht das eigene Portfolio (falls vorhanden) relativ zu Wettbewerbern?
   - Welche Wettbewerber haben blockierende Positionen in Zielbereichen?
   - Welche Wettbewerber koennten an Kreuzlizenzierung interessiert sein?
4. Die **strategische Bewertung** erstellen: Freiraeume, FTO-Risiken, Positionierung und Empfehlungen

**Erwartet:** Umsetzbare strategische Empfehlungen: wo anmelden, was vermeiden, wen beobachten und welche Risiken eine detaillierte FTO-Analyse benoetigen.

**Bei Fehler:** Wenn FTO-Risiken identifiziert werden, ist dieses Screening vorlaueufig — es ersetzt NICHT ein formelles FTO-Gutachten eines Patentanwalts. Kritische Risiken zur rechtlichen Pruefung kennzeichnen. Wenn Freiraeume zu gut erscheinen (ein wertvoller Bereich ohne Anmeldungen), pruefen ob der Suchumfang nicht versehentlich relevante Anmeldungen ausgeschlossen hat.

### Schritt 5: Dokumentieren und empfehlen

Die Landschaftsbewertung fuer Entscheidungstraeger aufbereiten.

1. Den **Landschaftsbericht** mit Abschnitten verfassen:
   - Zusammenfassung (1 Seite: Hauptergebnisse, Top-Risiken, wichtigste Empfehlungen)
   - Umfang und Methodik (Suchbegriffe, Datenbanken, Zeitraum)
   - Landschaftsuebersicht (Cluster, Trends, Hauptakteure mit Visualisierungen)
   - Freiraumanalyse (Chancen nach strategischem Wert geordnet)
   - Risikobewertung (FTO-Bedenken nach Schweregrad geordnet)
   - Empfehlungen (Anmeldestrategie, Lizenzierungsziele, Monitoring-Alarme)
2. Unterstuetzende Daten beifuegen:
   - Patentfamilienliste (strukturiert, sortierbar)
   - Clusterkarte (visuell)
   - Anmeldetrend-Diagramme
   - Zusammenfassungen der Schluesselpatente (Top 10-20 relevanteste Patente)
3. Laufendes Monitoring einrichten:
   - Alarm-Abfragen fuer neue Anmeldungen in kritischen Bereichen definieren
   - Pruefungsrhythmus festlegen (vierteljaehrlich fuer aktive Bereiche, jaehrlich fuer stabile)

**Erwartet:** Ein vollstaendiger Landschaftsbericht der strategische IP-Entscheidungen ermoeglicht. Der Bericht ist evidenzbasiert, klar abgegrenzt und umsetzbar.

**Bei Fehler:** Wenn der Bericht zu umfangreich ist, zuerst die Zusammenfassung erstellen und detaillierte Abschnitte auf Anfrage anbieten. Die Zusammenfassung sollte immer fuer sich als Entscheidungsdokument stehen koennen.

## Validierung

- [ ] Landschafts-Charter definiert Umfang, Klassifikation, Geographie und Zeitfenster
- [ ] Patentdatensatz aus mehreren Datenbanken erhoben und dedupliziert
- [ ] Cluster mit Anmeldezahlen und Trendrichtung identifiziert
- [ ] Top-10-Hauptakteure mit Portfoliokennzahlen profiliert
- [ ] Freiraeume identifiziert und nach strategischem Wert eingestuft
- [ ] FTO-Risiken vorgeprüft und nach Schweregrad klassifiziert
- [ ] Blockierende Schluesselpatente mit Zitationsanalyse identifiziert
- [ ] Empfehlungen sind spezifisch und umsetzbar
- [ ] Einschraenkungen anerkannt (Screening vs. formelles FTO-Gutachten)
- [ ] Monitoring-Alarme fuer laufende Landschaftsbeobachtung definiert

## Haeufige Stolperfallen

- **Zu breiter Umfang**: "KI-Patente" ist keine Landschaft — es ist ein Ozean. Spezifisch sein bezueglich Technologie und Anwendung
- **Abhaengigkeit von einer einzelnen Datenbank**: Keine einzelne Patentdatenbank hat vollstaendige Abdeckung. Mindestens zwei Quellen verwenden
- **Patentfamilien ignorieren**: Einzelne Anmeldungen statt Familien zaehlen blaest die Zahlen auf. Eine Erfindung in 10 Laendern angemeldet ist eine Patentfamilie, nicht zehn
- **Anmeldungen mit Erteilungen verwechseln**: Eine anhaengige Anmeldung ist kein durchsetzbares Recht. Zwischen erteilten Patenten und veroeffentlichten Anmeldungen unterscheiden
- **Fehlinterpretation von Freiraum**: Ein leerer Bereich kann "niemand hat es versucht" oder "alle haben es versucht und sind gescheitert" bedeuten. Vor der Annahme einer Chance untersuchen
- **Landschaft als Rechtsgutachten**: Dieser Skill erzeugt strategische Intelligenz, keine Rechtsberatung. Hier markierte FTO-Risiken benoetigen eine formelle Analyse durch einen Patentanwalt

## Verwandte Skills

- `search-prior-art` — Detaillierte Stand-der-Technik-Recherche fuer spezifische Erfindungen oder Patentanfechtungen
- `security-audit-codebase` — Risikobewertungsmethodik parallelt IP-Risikovorpruefung
- `review-research` — Literaturrecherche-Faehigkeiten gelten fuer Stand-der-Technik-Analysen
- `conduct-gxp-audit` — Audit-Methodik parallelt systematische IP-Landschaftsdokumentation
