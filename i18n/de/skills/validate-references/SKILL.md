---
name: validate-references
description: >
  BibTeX-Einträge auf Korrektheit, Vollständigkeit und Aktualität prüfen
  durch DOI-Auflösung gegen Crossref, URL-Erreichbarkeitsprüfung, Validierung
  erforderlicher Felder pro Eintragstyp und Zeichenkodierungskonsistenz.
  Verwenden, wenn ein Literaturverzeichnis vor der Einreichung oder
  Veröffentlichung auditiert werden soll.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, validation, doi-resolution, url-checking, bibtex
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Referenzen validieren

BibTeX-Einträge auf Korrektheit, Vollständigkeit und Aktualität prüfen durch DOI-Auflösung, URL-Prüfung, Pflichtfeldvalidierung und Zeichenkodierungskonsistenz.

## Wann verwenden

- Auditierung eines Literaturverzeichnisses vor Zeitschrifteneinreichung
- Überprüfung, ob alle DOIs auf die richtigen Artikel verweisen
- Erkennung defekter URLs in Bibliographieeinträgen
- Sicherstellung, dass alle BibTeX-Einträge die erforderlichen Felder für ihren Typ haben
- Prüfung auf Zeichenkodierungsprobleme, die LaTeX-Kompilierungsfehler verursachen
- Abgleich von BibTeX-Metadaten mit den tatsächlichen veröffentlichten Versionen

## Eingaben

- **Erforderlich**: BibTeX-Datei (.bib) oder BibEntry-Objekt zur Validierung
- **Erforderlich**: Validierungsumfang (Felder, DOIs, URLs oder alle)
- **Optional**: Crossref-API-Schlüssel für höhere Abfragegrenzen
- **Optional**: Zeitüberschreitung für URL-Prüfungen (Standard: 10 Sekunden)
- **Optional**: Benutzerdefinierte Pflichtfelder über den BibTeX-Standard hinaus
- **Optional**: Zulässige URL-Domänen (für das Herausfiltern institutioneller Proxy-URLs)

## Vorgehensweise

### Schritt 1: Bibliographie laden und Struktur analysieren

Die BibTeX-Datei parsen und die Zusammensetzung der Einträge katalogisieren:

1. **Datei parsen**: `RefManageR::ReadBib()` verwenden, um die .bib-Datei zu laden. Parsing-Warnungen und -Fehler aufzeichnen.
2. **Eintragstypen zählen**: Anzahl der Einträge nach Typ zusammenstellen (article, book, inproceedings, misc usw.).
3. **Felder inventarisieren**: Für jeden Eintrag die vorhandenen und fehlenden Felder auflisten.
4. **Zeichenkodierung prüfen**: Nicht-ASCII-Zeichen erkennen und verifizieren, dass sie korrekte LaTeX-Escapes verwenden.

**Erwartet:** Alle Einträge werden erfolgreich geparst, mit einer Zusammenfassung der Eintragstypen und markierten Kodierungsproblemen.

**Bei Fehler:** Falls das Parsen fehlschlägt, den fehlerhaften Eintrag durch zeilenweise Isolierung lokalisieren. Häufige Ursachen: nicht-geschlossene Klammern, fehlende Kommas zwischen Feldern, ungültiges UTF-8.

### Schritt 2: Pflichtfelder pro Eintragstyp validieren

Jeden Eintrag gegen die BibTeX-Feldanforderungen prüfen:

1. **Standardfelder prüfen**: Für jeden Eintragstyp die erforderlichen Felder validieren:

| Eintragstyp | Erforderliche Felder |
|-------------|---------------------|
| article | author, title, journal, year, volume |
| book | author/editor, title, publisher, year |
| inproceedings | author, title, booktitle, year |
| incollection | author, title, booktitle, publisher, year |
| phdthesis | author, title, school, year |
| mastersthesis | author, title, school, year |
| techreport | author, title, institution, year |
| misc | (keine streng erforderlich, aber author, title, year empfohlen) |

2. **Optionale Felder empfehlen**: Fehlende, aber empfohlene Felder markieren (pages, doi, url, abstract).
3. **Benutzerdefinierte Anforderungen**: Falls angegeben, zusätzliche benutzerdefinierte Pflichtfelder prüfen.
4. **Bericht erstellen**: Einen Validierungsbericht erstellen, der fehlende Felder nach Eintrag gruppiert auflistet.

**Erwartet:** Jeder Eintrag hat alle erforderlichen Felder, oder ein Bericht listet die spezifischen Lücken auf.

**Bei Fehler:** Falls erforderliche Felder fehlen, versuchen, sie über DOI-Abfrage (Schritt 3) zu ergänzen. Falls kein DOI vorhanden ist, die Einträge für manuelle Ergänzung markieren.

### Schritt 3: DOIs gegen Crossref validieren

Jeden DOI auflösen und die Metadaten mit dem BibTeX-Eintrag abgleichen:

1. **DOIs extrahieren**: DOI-Felder aus allen Einträgen sammeln. DOI-Format normalisieren (Präfixe wie „https://doi.org/" entfernen).
2. **Crossref abfragen**: `rcrossref::cr_works(dois = doi_list)` oder die Crossref-REST-API verwenden, um die veröffentlichten Metadaten zu den einzelnen DOIs abzurufen.
3. **Felder abgleichen**: Lokale BibTeX-Felder mit den von Crossref zurückgegebenen Daten vergleichen:
   - **Titel**: Fuzzy-Abgleich (Groß-/Kleinschreibungs- und Interpunktionsunterschiede ignorieren)
   - **Autoren**: Nachnamen und Initialen des ersten Autors vergleichen
   - **Jahr**: Exakte Übereinstimmung
   - **Journal**: Abgekürzte vs. ausgeschriebene Formen vergleichen
   - **Volumen/Seiten**: Exakte Übereinstimmung falls vorhanden
4. **Abweichungen markieren**: Einträge kennzeichnen, bei denen die lokalen Metadaten wesentlich von der Crossref-Version abweichen.
5. **Einträge ohne DOI**: Als Einträge markieren, die nicht automatisch verifiziert werden können.

**Erwartet:** Alle DOIs werden erfolgreich aufgelöst und die Metadaten stimmen mit den lokalen Einträgen überein, oder Abweichungen werden dokumentiert.

**Bei Fehler:** Falls ein DOI nicht aufgelöst werden kann (HTTP 404), ist der DOI möglicherweise falsch. In Crossref nach dem Titel suchen, um den korrekten DOI zu finden. Falls die API-Abfragegrenze erreicht ist, mit einem API-Schlüssel (`mailto`-Parameter) authentifizieren.

### Schritt 4: URLs auf Erreichbarkeit prüfen

Alle URL-Felder auf funktionale Erreichbarkeit testen:

1. **URLs extrahieren**: URL- und URL-Felder aus allen Einträgen sammeln, einschließlich DOI-basierter URLs.
2. **HTTP-HEAD-Anfragen**: HEAD-Anfrage an jede URL senden mit konfigurierter Zeitüberschreitung. Statuscode aufzeichnen.
3. **Ergebnisse klassifizieren**:
   - 200 OK: URL erreichbar
   - 301/302 Umleitung: Finale URL aufzeichnen, prüfen ob inhaltlich korrekt
   - 403/404: URL defekt oder zugriffsbeschränkt
   - Zeitüberschreitung: Netzwerkproblem oder Server nicht erreichbar
   - SSL-Fehler: Zertifikatsproblem
4. **Bericht erstellen**: Defekte URLs mit vorgeschlagenen Korrekturen auflisten (z.B. aktualisierte URL nach Umleitung).

**Erwartet:** Alle URLs sind erreichbar oder defekte URLs sind dokumentiert mit Vorschlägen für Korrekturen.

**Bei Fehler:** Falls viele URLs zugriffsbeschränkt sind (403), kann dies auf institutionellen Proxy-Zugriff hindeuten. Bekannte akademische Domains (Verlagswebsites) von der strikten Prüfung ausnehmen und nur auf 404-Fehler prüfen.

### Schritt 5: Validierungsbericht zusammenstellen

Alle Ergebnisse in einem umfassenden Bericht konsolidieren:

1. **Zusammenfassung**: Gesamtzahl geprüfter Einträge, Bestehensrate, Anzahl der Probleme nach Kategorie.
2. **Detailbericht**: Jeden Eintrag mit Problemen auflisten:
   - Fehlende Pflichtfelder
   - DOI-Metadaten-Abweichungen
   - Defekte URLs
   - Zeichenkodierungsprobleme
3. **Priorität**: Probleme nach Schweregrad ordnen (fehlende Pflichtfelder > falscher DOI > defekte URL > fehlende optionale Felder).
4. **Korrekturen vorschlagen**: Wo möglich, automatische Korrekturen vorschlagen (z.B. DOI aus Crossref-Suche, aktualisierte URL nach Umleitung).

**Erwartet:** Ein vollständiger Validierungsbericht mit priorisierter Problemliste und vorgeschlagenen Korrekturen.

**Bei Fehler:** Falls der Bericht zu viele Probleme enthält, nach Schweregrad filtern und auf die Pflichtfeld- und DOI-Korrekturen fokussieren, die für die Einreichung kritisch sind.

## Validierung

- [ ] BibTeX-Datei ohne Fehler geparst
- [ ] Alle Eintragstypen auf Pflichtfelder geprüft
- [ ] DOIs gegen Crossref aufgelöst und Metadaten abgeglichen
- [ ] DOI-Abweichungen dokumentiert mit Korrekturvorschlägen
- [ ] URLs auf Erreichbarkeit getestet
- [ ] Defekte URLs mit vorgeschlagenen Alternativen dokumentiert
- [ ] Zeichenkodierungsprobleme identifiziert
- [ ] Validierungsbericht mit priorisierter Problemliste erstellt
- [ ] Einträge ohne DOI für manuelle Überprüfung markiert

## Häufige Fehler

- **Crossref-API-Ratenlimit**: Ohne authentifizierte Anfragen (mit `mailto`-Parameter) liegt das Limit bei etwa 50 Anfragen pro Sekunde. Bei großen Bibliographien Anfragen drosseln oder einen API-Schlüssel verwenden.
- **DOI-Format-Inkonsistenz**: DOIs können als `10.1234/example`, `doi:10.1234/example` oder `https://doi.org/10.1234/example` gespeichert sein. Vor dem Abgleich normalisieren.
- **Zeitschriftennamen-Varianten**: Abgekürzte und ausgeschriebene Zeitschriftennamen können beim Abgleich als Abweichung erscheinen. Eine Zuordnungstabelle oder NLM-Katalogabfrage verwenden.
- **URL-Prüfung bei institutionellem Proxy**: Viele akademische URLs sind hinter Anmeldeportalen zugänglich. HTTP-403-Fehler für bekannte Verlagsdomänen (Elsevier, Springer, Wiley) nicht als „defekt" melden.
- **Falsch-positive beim Titelabgleich**: Sonderzeichen, Hochstellungen und mathematische Notation im Titel können den Fuzzy-Abgleich verfälschen. Immer die Ergebnisse manuell überprüfen.
- **Veraltete DOIs**: Manche DOIs verweisen auf Preprints statt auf die finale veröffentlichte Version. Den DOI-Typ (Preprint vs. Verlagsversion) in den Crossref-Metadaten prüfen.

## Verwandte Skills

- `manage-bibliography` -- Bibliographiedateien erstellen und bereinigen vor der Validierung
- `format-citations` -- Zitate formatieren nach Validierung der zugrundeliegenden Daten
- `create-quarto-report` -- validierte Bibliographie in Quarto-Dokumente integrieren
