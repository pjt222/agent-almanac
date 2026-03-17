---
name: search-prior-art
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Stand der Technik recherchieren der fuer eine bestimmte Erfindung oder
  Patentanspruch relevant ist. Umfasst Patentliteratur, Nichtpatentliteratur
  (wissenschaftliche Arbeiten, Produkte, Open Source), defensive Publikationen
  und standardessentielle Patente. Anwenden bei der Bewertung ob eine Erfindung
  vor der Anmeldung neuartig und nicht naheliegend ist, bei der Anfechtung
  der Gueltigkeit eines bestehenden Patents, zur Unterstuetzung einer
  Freedom-to-Operate-Analyse, bei der Dokumentation einer defensiven
  Publikation oder bei der Beantwortung eines Patentamtsbescheids der
  Neuheit oder Erfindungshoehe in Frage stellt.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, prior-art, patents, novelty, obviousness, invalidity, fto
---

# Stand der Technik recherchieren

Eine strukturierte Stand-der-Technik-Recherche durchfuehren um Publikationen, Patente, Produkte oder Offenlegungen zu finden die einer bestimmten Erfindung vorausgehen. Verwendet zur Beurteilung der Patentierbarkeit (kann dies patentiert werden?), zur Anfechtung der Gueltigkeit (haette dieses Patent erteilt werden sollen?) oder zur Feststellung der Handlungsfreiheit (decken bestehende Schutzrechte dieses Design ab?).

## Wann verwenden

- Bewertung ob eine Erfindung vor Einreichung einer Patentanmeldung neuartig und nicht naheliegend ist
- Anfechtung der Gueltigkeit eines bestehenden Patents durch Auffinden von Stand der Technik den der Pruefer uebersehen hat
- Unterstuetzung einer Freedom-to-Operate-Analyse durch Auffinden von Stand der Technik der den Schutzumfang eines blockierenden Patents einschraenkt
- Dokumentation einer defensiven Publikation um andere an der Patentierung eines Konzepts zu hindern
- Beantwortung eines Patentamtsbescheids der Neuheit oder Erfindungshoehe in Frage stellt

## Eingaben

- **Erforderlich**: Erfindungsbeschreibung (was sie tut, wie sie funktioniert, welches Problem sie loest)
- **Erforderlich**: Recherchezweck (Patentierbarkeit, Ungueltigmachung, FTO, defensiv)
- **Erforderlich**: Kritisches Datum (Anmeldedatum der Patentanmeldung oder Erfindungsdatum fuer Stand der Technik)
- **Optional**: Bekannte verwandte Patente oder Publikationen
- **Optional**: Technologieklassifikationscodes (IPC, CPC)
- **Optional**: Wichtige Erfinder oder Unternehmen im Fachgebiet

## Vorgehensweise

### Schritt 1: Die Erfindung in durchsuchbare Elemente zerlegen

Die Erfindung in ihre technischen Bestandteile aufglieder.

1. Die Erfindungsbeschreibung lesen (oder Patentansprueche falls gegen ein bestehendes Patent recherchiert wird)
2. Die **wesentlichen Elemente** extrahieren — jedes unabhaengige technische Merkmal:
   - Welche Komponenten hat sie?
   - Welche Schritte folgt der Prozess?
   - Welchen technischen Effekt erzielt sie?
   - Welches Problem loest sie und wie?
3. Die **neuartige Kombination** identifizieren — was unterscheidet dies vom bekannten Stand der Technik:
   - Ist es ein neues Element ergaenzt zu bekannten Elementen?
   - Ist es eine neue Kombination bekannter Elemente?
   - Ist es ein bekanntes Element angewendet in einem neuen Gebiet?
4. Suchbegriffe fuer jedes Element generieren:
   - Fachbegriffe, Synonyme und Abkuerzungen
   - Breitere und engere Begriffe (Hierarchie)
   - Alternative Beschreibungen desselben Konzepts
5. Die **Suchkarte** dokumentieren: Elemente, Begriffe und Beziehungen

```
Suchkarten-Beispiel:
+------------------+-----------------------------------+-----------+
| Element          | Suchbegriffe                      | Prioritaet|
+------------------+-----------------------------------+-----------+
| Attention layer  | attention mechanism, self-         | Hoch      |
|                  | attention, multi-head attention    |           |
| Sparse routing   | mixture of experts, sparse MoE,   | Hoch      |
|                  | top-k routing, expert selection    |           |
| Training method  | knowledge distillation, teacher-   | Mittel    |
|                  | student, progressive training      |           |
+------------------+-----------------------------------+-----------+
```

**Erwartet:** Eine vollstaendige Zerlegung mit Suchbegriffen fuer jedes Element. Die neuartige Kombination ist identifiziert — danach muss die Recherche entweder suchen (zur Ungueltigmachung) oder deren Abwesenheit bestaetigen (zur Stuetzung der Neuheit).

**Bei Fehler:** Wenn die Erfindung zu abstrakt ist um sie zu zerlegen, eine spezifischere Beschreibung anfordern. Wenn die Ansprueche unklar sind, sich auf die breiteste vernuenftige Auslegung jedes Anspruchselements konzentrieren.

### Schritt 2: Patentliteratur recherchieren

Patentdatenbanken systematisch durchsuchen.

1. Abfragen aus Elementbegriffen konstruieren:
   - Zuerst jedes Element einzeln suchen (breit)
   - Dann Elemente kombinieren um naehere Treffer zu finden (eng)
   - Klassifikationscodes verwenden um nach Technologiebereich zu filtern
2. Mehrere Datenbanken durchsuchen:
   - **Google Patents**: Gut fuer Volltextsuche, kostenlos, grosser Korpus
   - **USPTO PatFT/AppFT**: US-Patente und -Anmeldungen, offizielle Quelle
   - **Espacenet**: Europaeische Patente, ausgezeichnete Klassifikationssuche
   - **WIPO Patentscope**: PCT-Anmeldungen, globale Abdeckung
3. Datumsfilter anwenden:
   - Stand der Technik muss dem **kritischen Datum** vorausgehen (Anmelde- oder Prioritaetsdatum)
   - Publikationen bis 1 Jahr vor der Anmeldung einbeziehen (Neuheitsschonfrist variiert je nach Rechtsordnung)
4. Fuer jedes relevante Ergebnis erfassen:
   - Dokumentennummer, Titel, Anmeldedatum, Veroeffentlichungsdatum
   - Welche Elemente es offenbart (auf Suchkarte abbilden)
   - Ob es die neuartige Kombination offenbart
5. Ergebnisse nach Relevanz klassifizieren:
   - **X-Referenz**: Offenbart die Erfindung allein (Neuheitsschaedlichkeit)
   - **Y-Referenz**: Offenbart Schluesselelemente, kombinierbar mit anderen Referenzen (Naheliegen)
   - **A-Referenz**: Hintergrund, definiert den allgemeinen Stand der Technik

**Erwartet:** Eine klassifizierte Liste von Patentreferenzen die den Erfindungselementen zugeordnet sind. X-Referenzen (falls gefunden) sind Showstopper fuer die Neuheit. Y-Referenzen sind die Bausteine fuer Naheliegen-Argumente.

**Bei Fehler:** Wenn kein relevanter Patentstand gefunden wird, bedeutet das nicht dass die Erfindung neuartig ist — Nichtpatentliteratur (Schritt 3) kann die entscheidende Referenz enthalten. Abwesenheit in einer Datenbank bedeutet nicht Abwesenheit ueberall.

### Schritt 3: Nichtpatentliteratur recherchieren

Wissenschaftliche Arbeiten, Produkte, Open Source und andere Nicht-Patent-Offenlegungen durchsuchen.

1. **Wissenschaftliche Literatur**:
   - Google Scholar, arXiv, IEEE Xplore, ACM Digital Library
   - Mit denselben Begriffen aus Schritt 1 suchen
   - Konferenzbeitraege und Workshop-Proceedings gehen Patentanmeldungen oft voraus
2. **Produkte und kommerzielle Offenlegungen**:
   - Produktdokumentation, Benutzerhandbuecher, Marketingmaterialien
   - Internet Archive (Wayback Machine) fuer datumsverifizierte Webinhalte
   - Fachpublikationen und Pressemitteilungen
3. **Open Source und Code**:
   - GitHub, GitLab — nach Implementierungen der technischen Merkmale suchen
   - README-Dateien, Dokumentation und Commit-Historien fuer Datumsnachweise
   - Software-Releases mit Versionsdaten
4. **Standards und Spezifikationen**:
   - IEEE, IETF (RFCs), W3C, ISO-Standards
   - Standardessentielle Patente muessen offengelegt werden; IP-Datenbanken der Normungsorganisationen durchsuchen
5. **Defensive Publikationen**:
   - IBM Technical Disclosure Bulletin
   - Research Disclosure Journal
   - IP.com Prior Art Database
6. Fuer jedes Ergebnis das **Veroeffentlichungsdatum** vor dem kritischen Datum verifizieren:
   - Webseiten: Wayback Machine fuer Datumsnachweise verwenden
   - Software: Release-Daten oder Commit-Zeitstempel verwenden
   - Arbeiten: Veroeffentlichungsdatum verwenden, nicht Einreichungsdatum

**Erwartet:** Nicht-Patent-Referenzen die die Patentrecherche ergaenzen. Wissenschaftliche Arbeiten und Open-Source-Code sind oft der wirkungsvollste Stand der Technik, da sie technische Details tendenziell expliziter beschreiben als Patente.

**Bei Fehler:** Wenn Nichtpatentliteratur duenn ist, wird die Technologie moeglicherweise hauptsaechlich in der Unternehmens-F&E entwickelt (patentlastig). Den Schwerpunkt auf Patentliteratur verlagern und sich auf das kombinationsbasierte Naheliegen-Argument konzentrieren.

### Schritt 4: Ergebnisse analysieren und zuordnen

Bewerten wie der gesammelte Stand der Technik sich zur Erfindung verhaelt.

1. Eine **Anspruchskarte** erstellen die Stand der Technik den Erfindungselementen zuordnet:

```
Anspruchselement vs. Stand-der-Technik-Matrix:
+------------------+--------+--------+--------+--------+
| Element          | Ref #1 | Ref #2 | Ref #3 | Ref #4 |
+------------------+--------+--------+--------+--------+
| Element A        |   X    |   X    |        |   X    |
| Element B        |        |   X    |   X    |        |
| Element C        |   X    |        |   X    |        |
| Neuartige Komb.  |        |        |        |        |
| A+B+C            |        |        |        |        |
+------------------+--------+--------+--------+--------+
X = Element in dieser Referenz offenbart
```

2. **Neuheit** bewerten: Offenbart eine einzelne Referenz alle Elemente?
   - Falls ja -> Erfindung ist vorweggenommen (nicht neuartig)
   - Falls nein -> Erfindung kann neuartig sein (weiter mit Naheliegen)
3. **Naheliegen** bewerten: Kann eine kleine Anzahl von Referenzen (2-3) kombiniert werden um alle Elemente abzudecken?
   - Gibt es eine Motivation zur Kombination? (wuerde ein Fachmann einen Grund sehen diese zu kombinieren?)
   - Lehren die Referenzen von der Kombination weg? (legen nahe dass sie nicht funktionieren wuerde?)
4. Fuer **FTO-Recherchen**: Schraenkt der Stand der Technik die Ansprueche des blockierenden Patents ein?
   - Stand der Technik der sich mit den Anspruechen des blockierenden Patents ueberschneidet begrenzt deren durchsetzbaren Schutzumfang
5. Die Analyse klar mit Verweis auf spezifische Passagen dokumentieren

**Erwartet:** Eine klare Anspruchskarte die zeigt welche Elemente von welchen Referenzen abgedeckt werden, mit einer Bewertung von Neuheit und Naheliegen. Jede Zuordnung zitiert spezifische Passagen oder Figuren in den Referenzen.

**Bei Fehler:** Wenn die Anspruchskarte Luecken zeigt (Elemente in keinem Stand der Technik gefunden), stellen diese Luecken die potenziell neuartigen Aspekte dar. Nachfolgende Recherchen auf diese spezifischen Luecken konzentrieren.

### Schritt 5: Dokumentieren und liefern

Die Rechercheergebnisse fuer ihren beabsichtigten Zweck aufbereiten.

1. Den **Stand-der-Technik-Recherchebericht** verfassen:
   - Zweck und Umfang der Recherche
   - Recherchemethodik (Datenbanken, Abfragen, Zeitraeume)
   - Ergebniszusammenfassung (Anzahl gefundener Referenzen, Klassifikationsaufschluesselung)
   - Top-Referenzen mit detaillierter Analyse (Anspruchskarten)
   - Bewertung: Neuheit, Naheliegen und FTO-Implikationen
   - Einschraenkungen und Empfehlungen fuer weitere Recherche
2. Referenzen organisieren:
   - Nach Relevanz sortiert (X-Referenzen zuerst, dann Y, dann A)
   - Jede Referenz mit vollstaendigen bibliographischen Daten und Zugangslink
   - Schluesselpassagen hervorgehoben oder extrahiert
3. Empfehlungen basierend auf dem Recherchezweck:
   - **Patentierbarkeit**: Anmelden/nicht anmelden, vorgeschlagener Anspruchsumfang basierend auf Luecken im Stand der Technik
   - **Ungueltigmachung**: Staerkste Kombination von Referenzen, vorgeschlagene rechtliche Argumentation
   - **FTO**: Risikoniveau, Design-Around-Moeglichkeiten, Lizenzierungsueberlegungen
   - **Defensiv**: Ob als defensive Publikation veroeffentlicht werden soll basierend auf gefundenem Freiraum

**Erwartet:** Ein vollstaendiger, gut organisierter Recherchebericht der die beabsichtigte Entscheidung direkt unterstuetzt. Referenzen sind zugaenglich und die Analyse ist nachvollziehbar.

**Bei Fehler:** Wenn die Recherche nicht eindeutig ist (keine starken X- oder Y-Referenzen, aber etwas relevanter Hintergrund), die Schlussfolgerung klar formulieren: "Kein neuheitsschaedlicher Stand der Technik gefunden; naechster Stand adressiert Elemente A und B aber nicht C. Anmeldung mit Anspruechen empfohlen die Element C betonen." Nicht eindeutig ist ein gueltiges und nuetzliches Ergebnis.

## Validierung

- [ ] Erfindung in eigenstaendige durchsuchbare Elemente zerlegt
- [ ] Neuartige Kombination explizit identifiziert
- [ ] Patentdatenbanken durchsucht (mindestens 2 Datenbanken)
- [ ] Nichtpatentliteratur durchsucht (wissenschaftlich + Produkte + Open Source)
- [ ] Alle Referenzen liegen vor dem kritischen Datum (Daten verifiziert)
- [ ] Anspruchskarte ordnet Elemente Referenzen mit Passagenzitaten zu
- [ ] Neuheit und Naheliegen mit Begruendung bewertet
- [ ] Ergebnisse nach Relevanz klassifiziert (X-, Y-, A-Referenzen)
- [ ] Bericht enthaelt Methodik, Einschraenkungen und Empfehlungen
- [ ] Recherche ist reproduzierbar (Abfragen und Datenbanken dokumentiert)

## Haeufige Stolperfallen

- **Stichworttunnelblick**: Nur exakte Begriffe suchen uebersieht Synonyme und alternative Beschreibungen. Die Begriffshierarchie aus Schritt 1 verwenden
- **Nur-Patent-Recherche**: Nichtpatentliteratur (Arbeiten, Produkte, Code) ist oft expliziter als Patente. Schritt 3 nicht ueberspringen
- **Datumsnachlaessigkeit**: Stand der Technik muss dem kritischen Datum vorausgehen. Eine brillante Referenz von einem Tag nach dem Anmeldedatum ist wertlos
- **Fremdsprachigen Stand der Technik ignorieren**: Bedeutende Erfindungen erscheinen moeglicherweise zuerst in chinesischer, japanischer, koreanischer oder deutscher Patentliteratur. Maschinelle Uebersetzung macht diese durchsuchbar
- **Bestaetigungsfehler**: Recherchieren um Neuheit zu bestaetigen statt zu suchen um entkraeftenden Stand der Technik zu finden. Die beste Recherche versucht am haertesten den naechsten Stand der Technik zu finden
- **Zu frueh aufhoeren**: Die ersten Ergebnisse sind selten die besten. Suchbegriffe basierend auf dem iterieren was fruehe Ergebnisse ueber den Fachwortschatz des Gebiets offenbaren

## Verwandte Skills

- `assess-ip-landscape` — Breitere Landschaftskartierung die spezifische Stand-der-Technik-Recherchen kontextualisiert
- `review-research` — Literaturrecherche-Methodik ueberschneidet sich erheblich mit Stand-der-Technik-Recherche
- `security-audit-codebase` — Systematische Suchmethodik parallelt (Gruendlichkeit, Dokumentation, Reproduzierbarkeit)
