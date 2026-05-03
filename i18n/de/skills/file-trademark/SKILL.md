---
name: file-trademark
description: >
  Trademark filing procedures covering EUIPO (EU), USPTO (US), and WIPO Madrid
  Protocol (international). Walks through pre-filing conflict checks, Nice
  classification, descriptiveness assessment, mark type decisions, filing basis
  strategy, office-specific e-filing procedures, Madrid Protocol extension, post-
  filing monitoring, and open-source trademark policy drafting. Use after running
  screen-trademark to confirm the mark is clear, when ready to secure trademark
  rights in one or more jurisdictions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, trademark, filing, euipo, uspto, madrid-protocol
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Marke anmelden

Eine Markenanmeldung bei EUIPO (EU), USPTO (US) oder WIPO Madrider Protokoll (international) einreichen. Dieser Skill deckt das tatsaechliche Anmeldeverfahren ab — von der Vor-Anmeldungs-Verifikation bis zur Nach-Registrierungs-Ueberwachung und Open-Source-Markenpolitik. Er nimmt an dass die Konflikt-Screening bereits via `screen-trademark` abgeschlossen wurde.

## Wann verwenden

- Bereit eine Markenanmeldung einzureichen nachdem die Konflikt-Screening klar ist
- Auswahl zwischen EU-, US- oder internationalen Anmeldestrategien
- Eine EU-Marke anmelden und Prioritaet fuer eine nachfolgende US-Anmeldung beanspruchen
- Eine bestehende nationale Marke international ueber das Madrider Protokoll erweitern
- Eine Open-Source-Marken-Nutzungspolitik nach Registrierung entwerfen
- Auf Office-Actions oder Widerspruchsverfahren waehrend der Pruefung antworten

## Eingaben

- **Erforderlich**: Anzumeldende Marke (Wort, Logo oder kombiniert)
- **Erforderlich**: Waren- und Dienstleistungsbeschreibung
- **Erforderlich**: Ziel-Jurisdiktionen (EU, US, international oder Kombination)
- **Erforderlich**: Anmeldername und -adresse
- **Optional**: Screen-Trademark-Ergebnisse (Konflikt-Suchbericht)
- **Optional**: Logo-Dateien (bei Anmeldung einer Bild- oder kombinierten Marke)
- **Optional**: Prioritaetsbeanspruchung (frueher Anmeldung in anderer Jurisdiktion, innerhalb 6 Monaten)
- **Optional**: Nutzungsnachweis im geschaeftlichen Verkehr (erforderlich fuer USPTO 1(a)-Basis)
- **Optional**: Open-Source-Projekt-Kontext (fuer Markenpolitik in Schritt 10)

## Anmeldungs-Kostenreferenz

| Amt | Grundgebuehr | Pro Klasse | Hinweise |
|-----|--------------|------------|----------|
| EUIPO | 850 EUR | +50 EUR (2.), +150 EUR (3.+) | SME Fund: 75% Rabatt |
| USPTO (TEAS Plus) | $250 | pro Klasse | Auslaendische Anmelder brauchen US-Anwalt |
| USPTO (TEAS Standard) | $350 | pro Klasse | Flexiblere Warenbeschreibung |
| Madrider Protokoll | 653 CHF | variiert je Land | Haengt von Basis-Marke fuer 5 Jahre ab |

## Vorgehensweise

### Schritt 1: Vor-Anmeldungs-Pruefungen

Verifizieren dass die Marke fuer die Anmeldung klar ist bevor in Anmeldegebuehren investiert wird.

1. Bestaetigen dass `screen-trademark` durchgefuehrt wurde:
   - Den Konflikt-Suchbericht auf identische oder verwirrend aehnliche Marken pruefen
   - Verifizieren dass alle Ziel-Jurisdiktionen im Screening abgedeckt waren
   - Pruefen dass das Screening aktuell ist (idealerweise innerhalb der letzten 30 Tage)
2. Finale Konflikt-Pruefungen gegen offizielle Datenbanken durchfuehren:
   - **EUIPO TMview**: Suche ueber alle EU-Mitgliedsstaaten-Register
   - **WIPO Global Brand Database**: Internationale Registrierungen
   - **USPTO TESS**: US-Bundes-Register (strukturierte Suche nutzen: `"mark text"[BI]`)
   - **DPMAregister**: Deutsches nationales Register (bei EU-Anmeldung deckt es den groessten EU-Markt ab)
3. Verifizieren dass Domainname und Social-Media-Handles verfuegbar oder gesichert sind:
   - Domain-Verfuegbarkeit verstaerkt Distinktivitaets-Argumente bei Anfechtung
   - Passende Handles reduzieren Konsumenten-Verwirrungs-Risiko
4. Die Suchergebnisse als **Vor-Anmeldungs-Klaerungs-Aufzeichnung** dokumentieren

**Erwartet:** Bestaetigung dass keine blockierenden Marken in den Ziel-Jurisdiktionen existieren. Die Vor-Anmeldungs-Klaerungs-Aufzeichnung dokumentiert Sorgfalt und unterstuetzt jede zukuenftige Widerspruchs-Verteidigung.

**Bei Fehler:** Wenn konfliktive Marken gefunden werden, die Schwere einschaetzen: identische Marke + identische Waren = nicht anmelden. Aehnliche Marke + verwandte Waren = Rechtsberatung zur Verwechslungs-Wahrscheinlichkeit suchen. Wenn Konflikte auf eine einzelne Jurisdiktion beschraenkt sind, in Erwaegung ziehen nur in klaren Jurisdiktionen anzumelden.

### Schritt 2: Nizza-Klassifikations-Auswahl

Die korrekten Waren- und Dienstleistungsklassen unter dem Nizza-Klassifikations-System identifizieren.

1. Das TMclass-Tool (tmclass.tmdn.org) zur Klassen-Identifikation konsultieren:
   - Die Waren-/Dienstleistungsbeschreibung eingeben
   - TMclass schlaegt harmonisierte Begriffe vor die von den meisten Aemtern akzeptiert sind
   - Vor-genehmigte Begriffe aus der TMclass-Datenbank zu nutzen reduziert Pruefungs-Verzoegerungen
2. Haeufige Klassen fuer Technologie und Software:
   - **Klasse 9**: Herunterladbare Software, Mobile Apps, Computer-Hardware
   - **Klasse 35**: Werbung, Geschaeftsfuehrung, SaaS-Plattform-Verwaltung
   - **Klasse 42**: SaaS, Cloud-Computing, Software-Entwicklungs-Dienstleistungen
   - **Klasse 38**: Telekommunikation, Online-Plattformen, Messaging-Dienste
3. Die Waren- und Dienstleistungsbeschreibung entwerfen:
   - Spezifisch genug um die tatsaechliche Nutzung zu definieren aber breit genug fuer zukuenftige Erweiterung
   - TEAS Plus (USPTO) erfordert Begriffe aus dem ID-Manual — vor-genehmigte Begriffe nutzen
   - EUIPO akzeptiert TMclass-harmonisierte Begriffe direkt
4. Kosten gegen Abdeckung balancieren:
   - Jede zusaetzliche Klasse fuegt Gebuehren hinzu (siehe Kosten-Tabelle oben)
   - In Klassen anmelden in denen aktuell oder geplant die Marke genutzt wird
   - Uebermaessig breite Anmeldungen ohne Nutzung koennen angefochten werden (besonders in den USA)

**Erwartet:** Eine finalisierte Liste von Nizza-Klassen mit spezifischen, vor-genehmigten Waren- und Dienstleistungsbeschreibungen fuer jede Klasse. Beschreibungen entsprechen der tatsaechlichen Geschaeftsnutzung.

**Bei Fehler:** Wenn TMclass keinen klaren Match vorschlaegt, die Nizza-Klassifikations-Erlaeuterungs-Notizen (WIPO Nizza-Seite) konsultieren. Mehrdeutige Waren erstrecken sich manchmal ueber mehrere Klassen — in allen relevanten Klassen anmelden statt Ausschluss zu riskieren.

### Schritt 3: Distinktivitaets-Bewertung

Evaluieren ob die Marke registrierbar ist oder voraussichtlich Distinktivitaets-Einwaende haben wird.

1. Die Marke auf dem **Abercrombie-Spektrum** bewerten (US-Standard, weit angewandt):
   - **Generisch**: Der gewoehnliche Name fuer das Produkt (z.B. "Computer" fuer Computer) — nie registrierbar
   - **Beschreibend**: Beschreibt direkt eine Qualitaet oder Eigenschaft (z.B. "QuickBooks") — registrierbar nur mit sekundaerer Bedeutung
   - **Suggestiv**: Suggeriert aber beschreibt nicht direkt (z.B. "Netflix") — registrierbar ohne sekundaere Bedeutung
   - **Willkuerlich**: Ein echtes Wort in unverwandtem Kontext genutzt (z.B. "Apple" fuer Elektronik) — starker Schutz
   - **Phantasievoll**: Ein erfundenes Wort (z.B. "Xerox") — staerkster Schutz
2. Gegen EUTMR absolute Schutzhindernisse pruefen (Artikel 7(1)):
   - Art. 7(1)(b): Fehlen jeglicher Unterscheidungskraft
   - Art. 7(1)(c): Beschreibend fuer Eigenschaften der Waren/Dienstleistungen
   - Art. 7(1)(d): Im Verkehr ueblich (generisch im relevanten Sektor)
3. Wenn die Marke grenzwertig beschreibend ist:
   - Evidenz fuer erworbene Unterscheidungskraft sammeln (Werbeausgaben, Verkaufszahlen, Konsumenten-Umfragen)
   - In Erwaegung ziehen ein distinktives Element hinzuzufuegen (Logo, Stilisierung)
   - Die Wortmarke modifizieren um sie in Richtung suggestiv oder willkuerlich zu bewegen
4. Die Bewertung mit Begruendung dokumentieren

**Erwartet:** Die Marke ist auf dem Abercrombie-Spektrum als suggestiv, willkuerlich oder phantasievoll klassifiziert — alle ohne sekundaere Bedeutung registrierbar. Grenzfaelle sind mit einer Mitigations-Strategie markiert.

**Bei Fehler:** Wenn die Marke beschreibend oder generisch ist, nicht anmelden — sie wird zurueckgewiesen. Die Marke neu gestalten um sie auf dem Distinktivitaets-Spektrum nach oben zu bewegen. Wenn signifikante Nutzungs-Historie existiert, einen Section 2(f)-Anspruch (erworbene Distinktivitaet) fuer die USA oder einen aehnlichen Anspruch unter Art. 7(3) EUTMR fuer die EU in Erwaegung ziehen.

### Schritt 4: Markentyp-Entscheidung

Den Registrierungstyp waehlen der die Marke am besten schuetzt.

1. **Wortmarke** (Standardzeichen):
   - Schuetzt das Wort selbst unabhaengig von Schriftart, Farbe oder Stil
   - Breitester Schutz — deckt jede visuelle Repraesentation ab
   - Kann keine Designelemente enthalten
   - Beste Wahl wenn der Markenwert im Namen liegt, nicht im Logo
2. **Bildmarke** (Logo oder Design):
   - Schuetzt die spezifische visuelle Repraesentation
   - Engerer Schutz — deckt das Wort in anderen Stilen nicht ab
   - Erforderlich wenn das Logo selbst der primaere Markenidentifikator ist
   - Muss eine klare Bilddatei einreichen (JPG/PNG, EUIPO: max 2 MB, min 945x945 px)
3. **Kombinierte Marke** (Wort + Logo zusammen):
   - Schuetzt die spezifische Kombination wie eingereicht
   - Enger als eine Wortmarke allein — auf die spezifische Kombination beschraenkt
   - Haeufig aber strategisch suboptimal: wenn das Logo sich aendert, deckt die Registrierung die neue Version moeglicherweise nicht ab
4. **Strategische Empfehlung**:
   - Zuerst eine Wortmarke anmelden (breitester Schutz, kosteneffektivst)
   - Eine separate Bildmarke nur fuer das Logo anmelden wenn das Logo signifikanten eigenstaendigen Markenwert hat
   - Kombinierte Marken vermeiden ausser Budget-Beschraenkungen verhindern separate Anmeldungen

**Erwartet:** Eine klare Markentyp-Entscheidung mit strategischer Begruendung. Wortmarke ist die Standard-Empfehlung ausser das Logo traegt unabhaengigen Markenwert.

**Bei Fehler:** Wenn unsicher ob der Name allein distinktiv genug ist, durch Fragen testen: "Wuerden Konsumenten diesen Namen in einfachem Text erkennen, ohne das Logo?" Wenn ja, die Wortmarke anmelden. Wenn das Logo untrennbar von der Markenidentitaet ist, in Erwaegung ziehen sowohl Wort- als auch Bildmarken separat anzumelden.

### Schritt 5: Anmeldungs-Basis-Auswahl

Die Rechtsbasis fuer die Anmeldung bestimmen (primaer relevant fuer USPTO).

1. **Nutzung im Verkehr — Section 1(a)**:
   - Die Marke ist bereits im zwischenstaatlichen Verkehr (USA) oder in echter Nutzung (EU) verwendet
   - Muss ein Specimen einreichen das die Marke wie genutzt zeigt (Screenshot, Verpackung, Werbung)
   - Schnellster Weg zur Registrierung
2. **Nutzungs-Absicht — Section 1(b)**:
   - Die Marke ist noch nicht in Nutzung aber der Anmelder hat eine bona-fide-Absicht zur Nutzung
   - Erfordert ein Statement of Use vor Registrierung (zusaetzliche Gebuehren, Fristen)
   - Erlaubt Sicherung der Prioritaet vor dem Launch
   - Verlaengerungen der Zeit verfuegbar (bis zu 36 Monate insgesamt)
3. **Auslaendische Prioritaet — Section 44(d)**:
   - Prioritaet aus einer auslaendischen Anmeldung beanspruchen die innerhalb der letzten 6 Monate gemacht wurde
   - **Strategie**: EUIPO zuerst anmelden (geringere Kosten, schneller), dann 44(d)-Prioritaet fuer USPTO beanspruchen
   - Dies gibt der US-Anmeldung dasselbe Prioritaetsdatum wie der EU-Anmeldung
   - Erfordert eine zertifizierte Kopie der auslaendischen Anmeldung
4. **Auslaendische Registrierung — Section 44(e)**:
   - Basiert auf einer auslaendischen Registrierung (nicht nur einer Anmeldung)
   - Keine US-Verkehrs-Nutzung bei Anmeldung erforderlich (aber muss eventuell nutzen)
5. **Madrider-Protokoll-Erweiterung — Section 66(a)**:
   - USA durch das Madrider-System designieren
   - Siehe Schritt 8 fuer Madrider-Details

**Erwartet:** Anmeldungs-Basis ausgewaehlt mit Zeitleiste und Specimen-Anforderungen dokumentiert. Bei Verwendung der EU-zuerst-Strategie (EUIPO dann 44(d) zu USPTO) ist das 6-Monats-Prioritaets-Fenster im Kalender.

**Bei Fehler:** Wenn keine Verkehrs-Nutzung existiert und keine auslaendische Anmeldung anhaengt, ist Section 1(b) (Nutzungs-Absicht) die einzige Option fuer USPTO. Die zusaetzlichen Statement-of-Use-Kosten und Fristen einkalkulieren. Fuer EUIPO ist keine Nutzung bei Anmeldung erforderlich — Erklaerung der Absicht ist ausreichend.

### Schritt 6: EUIPO-E-Anmeldungs-Verfahren

Die EU-Markenanmeldung online einreichen.

1. Zum EUIPO-E-Anmeldungs-Portal navigieren (euipo.europa.eu):
   - Ein EUIPO-Benutzerkonto erstellen falls noch nicht registriert
   - Die "Fast Track"-Anmeldung fuer vor-genehmigte TMclass-Begriffe nutzen (schnellere Pruefung)
2. Das Anmeldeformular ausfuellen:
   - **Anmelder-Details**: Name, Adresse, Rechtsform, Nationalitaet
   - **Vertreter**: Optional fuer EU-basierte Anmelder; erforderlich fuer Nicht-EU-Anmelder
   - **Marke**: Wortmarken-Text eingeben oder Bildmarken-Bild hochladen
   - **Waren und Dienstleistungen**: TMclass-Begriffe auswaehlen oder benutzerdefinierte Beschreibungen eingeben
   - **Anmeldesprache**: Aus EN, FR, DE, ES, IT waehlen (zweite Sprache erforderlich)
   - **Prioritaets-Beanspruchung**: Auslaendische Anmeldungs-Nummer und -Datum eingeben falls Prioritaet beansprucht wird
3. Die Gebuehrenuebersicht reviewen:
   - 1 Klasse: 850 EUR
   - 2 Klassen: 900 EUR (+50 EUR)
   - 3+ Klassen: 900 EUR + 150 EUR pro zusaetzlicher Klasse
   - **SME Fund (EUIPOIdeaforIP)**: Klein- und mittelstaendische Unternehmen koennen 75% Erstattung beanspruchen
4. Online bezahlen (Kreditkarte, Bankueberweisung oder EUIPO-Konto)
5. Die Anmeldungs-Quittung mit Anmeldungs-Nummer und Anmeldungs-Datum speichern

**Erwartet:** EUIPO-Anmeldung mit Bestaetigungs-Quittung eingereicht. Anmeldungs-Nummer und Anmeldungs-Datum aufgezeichnet. Bei Verwendung von Fast Track schliesst die Pruefung typischerweise innerhalb 1 Monats ab.

**Bei Fehler:** Wenn das Online-Portal die Anmeldung ablehnt (technischer Fehler), einen Screenshot speichern und erneut versuchen. Wenn die Waren-/Dienstleistungs-Beschreibung abgelehnt wird, auf vor-genehmigte TMclass-Begriffe wechseln. Wenn die Zahlung scheitert, wird die Anmeldung als Entwurf fuer 30 Tage gespeichert.

### Schritt 7: USPTO-Anmeldungs-Verfahren

Die US-Bundes-Markenanmeldung online einreichen.

1. Zum USPTO TEAS (Trademark Electronic Application System) navigieren:
   - TEAS Plus ($250/Klasse) oder TEAS Standard ($350/Klasse) waehlen
   - TEAS Plus erfordert vor-genehmigte ID-Manual-Begriffe; TEAS Standard erlaubt freie Beschreibungen
2. **Auslaendische-Anmelder-Anforderung**:
   - Anmelder mit Wohnsitz ausserhalb der USA MUESSEN einen US-lizenzierten Anwalt benennen
   - Der Anwalt muss Mitglied in gutem Stand einer US-Staatsanwaltschaft sein
   - Diese Anforderung gilt auch bei Anmeldung ueber das Madrider Protokoll
3. Das Anmeldeformular ausfuellen:
   - **Anmelder-Information**: Name, Adresse, Entity-Typ, Citizenship/State of Organization
   - **Anwalts-Information**: Name, Bar-Mitgliedschaft, Korrespondenz-E-Mail
   - **Marke**: Wortmarke in Standardzeichen eingeben oder Designmarken-Bild hochladen
   - **Waren und Dienstleistungen**: Aus dem ID-Manual auswaehlen (TEAS Plus) oder benutzerdefiniert entwerfen (TEAS Standard)
   - **Anmeldungs-Basis**: Section 1(a), 1(b), 44(d) oder 44(e) auswaehlen (siehe Schritt 5)
   - **Specimen** (nur 1(a)-Basis): Hochladen das die Marke wie im Verkehr genutzt zeigt
   - **Erklaerung**: Genauigkeit unter Strafe des Meineids verifizieren
4. Die Anmeldegebuehr bezahlen ($250 oder $350 pro Klasse)
5. Die Anmeldungs-Quittung mit Seriennummer und Anmeldungs-Datum speichern

**Erwartet:** USPTO-Anmeldung mit zugewiesener Seriennummer eingereicht. Anmeldungs-Quittung gespeichert. Pruefung dauert typischerweise 8-12 Monate fuer die erste Office-Action.

**Bei Fehler:** Wenn das TEAS-System die Anmeldung ablehnt, die Fehlermeldungen reviewen — haeufige Probleme sind falscher Entity-Typ, fehlendes Specimen (fuer 1(a)-Anmeldungen) oder Warenbeschreibungen die nicht den ID-Manual-Begriffen entsprechen (TEAS Plus). Wenn ein auslaendischer Anmelder ohne US-Anwalt anmeldet, wird die Anmeldung abgelehnt.

### Schritt 8: Madrider-Protokoll-Erweiterung

Schutz international durch das WIPO-Madrider-System erweitern.

1. **Voraussetzungen**:
   - Eine Basis-Marke (Anmeldung oder Registrierung) im Ursprungsamt
   - Der Anmelder muss Staatsangehoeriger eines, mit Wohnsitz in einem oder einer realen und effektiven Niederlassung in einem Madrider Mitgliedsland haben
   - Die Basis-Marke muss dieselben oder engere Waren/Dienstleistungen abdecken
2. Durch das Ursprungsamt einreichen (nicht direkt bei WIPO):
   - **EUIPO als Ursprung**: EUIPO-Madrider-E-Anmeldungs-Tool nutzen
   - **USPTO als Ursprung**: Via TEAS International Application Form einreichen
3. Die Madrider-Anmeldung (MM2-Formular) ausfuellen:
   - **Anmelder-Details**: Muessen exakt mit dem Basis-Marken-Inhaber uebereinstimmen
   - **Markenrepraesentation**: Muss identisch zur Basis-Marke sein
   - **Waren und Dienstleistungen**: Aus der Spezifikation der Basis-Marke auswaehlen (kann verengen, nicht erweitern)
   - **Designierte Vertragsparteien**: Ziel-Laender/Regionen auswaehlen
   - **Sprache**: Englisch, Franzoesisch oder Spanisch
4. Gebuehren berechnen:
   - Grundgebuehr: 653 CHF (schwarz-weiss) oder 903 CHF (farbig)
   - Zusatzgebuehr: 100 CHF pro Klasse ueber die erste hinaus
   - Individuelle Gebuehren: variieren je designiertem Land (WIPO-Gebuehrenrechner pruefen)
   - Haeufige individuelle Gebuehren: USA ~$400+/Klasse, Japan ~$500+/Klasse, China ~$150+/Klasse
5. **Central-Attack-Abhaengigkeit**:
   - Fuer die ersten 5 Jahre haengt die internationale Registrierung von der Basis-Marke ab
   - Wenn die Basis-Marke geloescht wird (Widerspruch, Nichtnutzung), fallen alle Designationen
   - Nach 5 Jahren wird jede Designation unabhaengig
   - Strategie: Die Basis-Marke waehrend der Abhaengigkeitsperiode energisch schuetzen

**Erwartet:** Madrider-Anmeldung durch das Ursprungsamt eingereicht. Designierte Laender mit dokumentierten Gebuehren-Berechnungen ausgewaehlt. Das 5-Jahres-Abhaengigkeits-Risiko ist anerkannt und der Basis-Marken-Schutzplan ist vorhanden.

**Bei Fehler:** Wenn das Ursprungsamt die Madrider-Anmeldung ablehnt (z.B. Mismatch mit Basis-Marke), die Diskrepanz korrigieren und neu einreichen. Wenn ein designiertes Land Schutz verweigert, durch das Madrider-System innerhalb der Frist des designierten Amtes antworten (typischerweise 12-18 Monate).

### Schritt 9: Nach-Anmeldungs-Ueberwachung

Die Anmeldung durch die Pruefung verfolgen und auf Aktionen antworten.

1. **EUIPO-Ueberwachung**:
   - Veroeffentlichung in Teil A des EU-Markenblatts
   - **Widerspruchsfrist**: 3 Monate ab Veroeffentlichung (verlaengerbar um 1 Monat Cooling-off)
   - Wenn kein Widerspruch: Registrierung erfolgt automatisch
   - Widerspruchs-Verteidigung: Stellungnahmen innerhalb 2 Monaten nach Benachrichtigung einreichen
2. **USPTO-Ueberwachung**:
   - TSDR (Trademark Status and Document Retrieval) regelmaessig pruefen
   - **Pruefungsanwalts-Review**: 8-12 Monate nach Anmeldung
   - **Office-Actions**: Antwortfrist ist typischerweise 3 Monate (einmal verlaengerbar fuer $125)
   - **Veroeffentlichung fuer Widerspruch**: 30-Tage-Periode in der Official Gazette
   - **Statement of Use** (1(b)-Anmeldungen): Muss innerhalb 6 Monaten der Notice of Allowance eingereicht werden (verlaengerbar bis zu 36 Monate insgesamt, $125 pro Verlaengerung)
3. **Madrider-Ueberwachung**:
   - WIPO benachrichtigt jedes designierte Amt
   - Jedes Amt prueft unabhaengig (12-18-Monats-Fenster)
   - Vorlaeufige Verweigerungen muessen durch die Verfahren des lokalen Amtes beantwortet werden
4. **Alle Fristen kalendrieren**:
   - Widerspruchs-Antwortfristen
   - Statement-of-Use-Fristen (USPTO 1(b))
   - Erneuerungsfristen (10 Jahre EUIPO, 10 Jahre USPTO, 10 Jahre Madrid)
   - USPTO Section 8/71 Declaration of Use: zwischen 5. und 6. Jahr
5. Auf Drittanmeldungen verwirrend aehnlicher Marken ueberwachen:
   - TMview-/TESS-Watch-Alerts fuer aehnliche Marken in den Klassen einrichten
   - Einen professionellen Markenwatch-Service fuer kritische Marken in Erwaegung ziehen

**Erwartet:** Alle Fristen sind mit Erinnerungen kalendriert. Anmeldungs-Status wird durch das Online-System jedes Amtes ueberwacht. Widerspruchs- oder Office-Action-Antwortstrategien sind im Voraus vorbereitet.

**Bei Fehler:** Eine Frist zu verpassen kann fatal sein — die meisten Markenamt-Fristen sind nicht verlaengerbar. Wenn eine Frist verpasst wird, pruefen ob Wiederbelebung oder Wiedereinsetzung verfuegbar ist (USPTO erlaubt Petition zur Wiederbelebung bei unbeabsichtigter Verzoegerung). Fuer EUIPO sind verpasste Widerspruchsfristen generell endgueltig.

### Schritt 10: Open-Source-Markenpolitik

Eine Markennutzungs-Politik entwerfen wenn die Marke ein Open-Source-Projekt abdeckt.

1. Etablierte Modelle studieren:
   - **Linux Foundation**: Erlaubt Projektnamen-Nutzung in faktischen Verweisen; beschraenkt Logos auf Lizenznehmer
   - **Mozilla**: Detaillierte Guidelines die unmodifizierte Distributionen von modifizierten Builds unterscheiden
   - **Rust Foundation**: Breite Erlaubnis fuer Community-Nutzung mit spezifischen Beschraenkungen auf kommerziellen Produkten
   - **Apache Software Foundation**: Permissive Namenspolitik mit Beschraenkungen auf Implikationen von Befuerwortung
2. Nutzungskategorien definieren:
   - **Fair Use** (immer erlaubt): Verweis auf das Projekt nach Namen in Artikeln, Reviews, Vergleichen, akademischen Papieren
   - **Community-/Contributor-Nutzung** (breit erlaubt): Benutzergruppen, Konferenzen, Bildungsmaterialien, unmodifizierte Distributionen
   - **Kommerzielle Nutzung** (erfordert Lizenz oder Beschraenkungen): Produkte die die Software einbeziehen, Dienste basierend auf dem Projekt, Zertifizierungs-/Kompatibilitaets-Behauptungen
   - **Verbotene Nutzung**: Implikation offizieller Befuerwortung, Nutzung auf wesentlich modifizierten Versionen ohne Disclosure, Domainnamen die Verwirrung verursachen
3. Das Markenpolitik-Dokument entwerfen:
   - Klare Aussage von Markeneigentum
   - Welche Nutzungen ohne Erlaubnis erlaubt sind
   - Welche Nutzungen schriftliche Erlaubnis erfordern
   - Wie Erlaubnis anzufragen ist (Kontakt, Prozess)
   - Konsequenzen von Missbrauch
4. Die Politik-Datei im Projekt-Repository platzieren:
   - Haeufige Standorte: `TRADEMARKS.md`, `TRADEMARK-POLICY.md` oder ein Abschnitt in `CONTRIBUTING.md`
   - Aus `README.md` und der Projekt-Website verlinken
5. Die Marke vor Veroeffentlichung der Politik registrieren:
   - Eine Markenpolitik ohne Registrierung ist in den meisten Faellen nicht durchsetzbar
   - Mindestens die Anmeldung vor Veroeffentlichung einreichen — "TM" kann sofort verwendet werden, "(R)" nur nach Registrierung

**Erwartet:** Eine klare, faire Markenpolitik die die Marke schuetzt waehrend gesunde Community-Nutzung ermoeglicht wird. Die Politik folgt etablierten Open-Source-Foundation-Modellen und ist aus der Hauptdokumentation des Projekts zugaenglich.

**Bei Fehler:** Wenn das Projekt keine Markenregistrierung oder Anmeldung hat, zuerst anmelden (Schritte 6-8) bevor die Politik entworfen wird. Eine nicht registrierte Marke hat begrenzte Durchsetzbarkeit. Wenn die Community gegen die Politik pusht, den Ansatz der Rust Foundation studieren — er wurde nach Community-Feedback ueberarbeitet und gilt als gutes Modell zum Balancieren von Schutz mit Offenheit.

## Validierungs-Checkliste

- [ ] Vor-Anmeldungs-Konflikt-Pruefungen abgeschlossen und dokumentiert (Schritt 1)
- [ ] Nizza-Klassen ausgewaehlt mit vor-genehmigten Waren- und Dienstleistungs-Beschreibungen (Schritt 2)
- [ ] Distinktivitaet auf dem Abercrombie-Spektrum bewertet (Schritt 3)
- [ ] Markentyp entschieden mit strategischer Begruendung (Schritt 4)
- [ ] Anmeldungs-Basis ausgewaehlt mit Zeitleiste und Specimen-Anforderungen dokumentiert (Schritt 5)
- [ ] Anmeldung in mindestens einer Ziel-Jurisdiktion eingereicht (Schritte 6-8)
- [ ] Anmeldungs-Quittung mit Anmeldungs-Nummer und Anmeldungs-Datum gespeichert
- [ ] Alle Nach-Anmeldungs-Fristen mit Erinnerungen kalendriert (Schritt 9)
- [ ] Markenwatch-Alerts fuer verwirrend aehnliche Marken konfiguriert (Schritt 9)
- [ ] Open-Source-Markenpolitik entworfen falls anwendbar (Schritt 10)

## Haeufige Stolperfallen

- **Anmeldung ohne Screening**: `screen-trademark` ueberspringen und direkt zur Anmeldung gehen verschwendet Gebuehren wenn eine konfliktive Marke existiert. Immer zuerst screenen
- **Falsche Anmeldungs-Basis**: Nutzung im Verkehr (1(a)) zu beanspruchen wenn die Marke noch nicht in Nutzung ist resultiert in einer betruegerischen Anmeldung. Intent-to-use (1(b)) nutzen wenn Launch nicht erfolgt ist
- **Uebermaessig breite Warenbeschreibungen**: Waren und Dienstleistungen zu beanspruchen die nicht genutzt werden oder genutzt werden sollen ladet zur Loeschung wegen Nichtnutzung ein (besonders in der EU nach 5 Jahren)
- **Das Prioritaets-Fenster verpassen**: Auslaendische Prioritaet unter Section 44(d) muss innerhalb 6 Monaten der ersten Anmeldung beansprucht werden. Dieses Fenster zu verpassen bedeutet das fruehere Prioritaetsdatum zu verlieren
- **Die Foreign-Attorney-Anforderung ignorieren**: Nicht-US-Anmelder die beim USPTO ohne US-lizenzierten Anwalt anmelden werden ihre Anmeldung abgelehnt bekommen — dies ist eine harte Regel seit 2019
- **Madrider Central-Attack-Exposition**: Sich allein auf Madrider Designationen verlassen ohne die 5-jaehrige Abhaengigkeit von der Basis-Marke zu verstehen. Wenn die Basis-Marke faellt, fallen alle Designationen mit ihr
- **Keine Nach-Anmeldungs-Ueberwachung**: Die Anmeldung einreichen und vergessen. Office-Actions und Widerspruchsfristen vergehen und die Anmeldung wird verlassen
- **Markenpolitik vor Registrierung**: Eine Markenpolitik ohne mindestens anhaengende Anmeldung zu veroeffentlichen unterminiert Durchsetzbarkeit. Zuerst anmelden, dann die Politik entwerfen

## Verwandte Skills

- `screen-trademark` — Konflikt-Screening das diesem Anmeldungs-Verfahren vorausgehen muss
- `assess-ip-landscape` — Breitere IP-Landscape-Analyse einschliesslich Markenlandscape-Mapping
- `search-prior-art` — Prior-Art-Such-Methodologie anwendbar auf Marken-Distinktivitaets-Forschung
