---
name: manage-bibliography
description: >
  BibTeX-Bibliographiedateien erstellen, zusammenführen und deduplizieren
  unter Verwendung des RefManageR-Pakets in R. Einträge aus DOI, URL oder
  manuellem Eintrag hinzufügen, auf Duplikate und unvollständige Felder
  prüfen, Eintragstypen und Schlüssel normalisieren sowie saubere .bib-Dateien
  für die akademische Dokumentenerstellung mit Quarto oder R Markdown exportieren.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, bibtex, bibliography, refmanager, deduplication
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Bibliographie verwalten

BibTeX-Bibliographiedateien erstellen, zusammenführen und deduplizieren unter Verwendung des RefManageR-Pakets in R, mit Validierung der Eintragsfelder und sauberem Export für die Dokumentenerstellung.

## Wann verwenden

- Aufbau einer neuen Bibliographiedatei für ein Forschungsprojekt oder eine Publikation
- Zusammenführen mehrerer .bib-Dateien aus verschiedenen Quellen zu einer konsolidierten Bibliographie
- Automatische Lösung von DOIs oder URLs zu vollständigen BibTeX-Einträgen
- Erkennung und Entfernung doppelter Einträge basierend auf DOI, Titel oder anderen Feldern
- Sicherstellung, dass alle Einträge die erforderlichen Felder für ihren Eintragstyp haben
- Export einer sauberen Bibliographie zur Verwendung mit Quarto, R Markdown oder LaTeX

## Eingaben

- **Erforderlich**: Mindestens eine Quelle von Bibliographiedaten (vorhandene .bib-Datei, DOIs-Liste, manueller Eintrag oder URL)
- **Erforderlich**: Zielausgabepfad für die konsolidierte .bib-Datei
- **Optional**: Bevorzugtes Zitierschlüsselformat (z.B. `NachnameJahr`, `nachname2026`)
- **Optional**: Erforderliche Felder über den BibTeX-Standard hinaus
- **Optional**: Zusammenführungsstrategie für Duplikate (erste behalten, vollständigere behalten, manuell entscheiden)

## Vorgehensweise

### Schritt 1: Vorhandene Bibliographiedaten laden

Alle Quellen in ein einheitliches BibEntry-Objekt laden:

1. **Vorhandene .bib-Dateien laden**: `RefManageR::ReadBib("refs.bib")` für jede Eingabedatei verwenden.
2. **Aus DOIs auflösen**: `RefManageR::GetBibEntryWithDOI(dois)` für eine Liste von DOI-Zeichenketten verwenden.
3. **Aus URLs abrufen**: Falls die Quelle Zotero-Übersetzer oder Crossref-Metadaten bereitstellt, DOIs extrahieren und auflösen.
4. **Manuelle Einträge**: BibEntry-Objekte direkt mit `RefManageR::BibEntry()` erstellen, wobei alle erforderlichen Felder für den Eintragstyp angegeben werden.
5. **Zusammenführen**: Alle BibEntry-Objekte mit `c(bib1, bib2, ...)` zusammenführen, um eine einzige Sammlung zu erstellen.

```r
library(RefManageR)
bib_existing <- ReadBib("existing_refs.bib")
bib_from_doi <- GetBibEntryWithDOI(c("10.1234/example1", "10.5678/example2"))
bib_all <- c(bib_existing, bib_from_doi)
```

**Erwartet:** Alle Bibliographiequellen werden in ein einziges BibEntry-Objekt geladen, wobei Parsing-Fehler dokumentiert sind.

**Bei Fehler:** Falls eine .bib-Datei nicht geparst werden kann, auf ungültige Klammern, fehlende Kommas zwischen Feldern oder Nicht-ASCII-Zeichen ohne korrekte LaTeX-Kodierung prüfen. Einzelne problematische Einträge isolieren, indem die Datei in kleinere Teile aufgeteilt wird.

### Schritt 2: Zitierschlüssel normalisieren

Alle Zitierschlüssel auf ein konsistentes Format standardisieren:

1. **Schlüssel extrahieren**: `names(bib_all)` verwenden, um die aktuellen Zitierschlüssel zu erhalten.
2. **Schlüsselformat anwenden**: Schlüssel basierend auf den Metadaten jedes Eintrags generieren (z.B. `paste0(tolower(nachname), jahr)`). Kollisionen durch Anfügen von Suffixen behandeln (a, b, c).
3. **Schlüssel ersetzen**: Aktualisierte Schlüssel den BibEntry-Objekten zuweisen.
4. **Übersetzungstabelle erstellen**: Alte Schlüssel neuen Schlüsseln zuordnen, damit Verweise in Dokumenten aktualisiert werden können.

**Erwartet:** Alle Zitierschlüssel folgen einem konsistenten Format ohne Duplikate, und eine Zuordnung von alten zu neuen Schlüsseln ist verfügbar.

**Bei Fehler:** Falls Schlüsselkollisionen auftreten (z.B. zwei Artikel von Smith aus 2024), die Suffixierungsregel anpassen. Häufige Strategien: Buchstabensuffix (smith2024a, smith2024b), Koautorsuffix (smithjones2024) oder Titelschlüsselwort (smith2024neural).

### Schritt 3: Duplikate erkennen und auflösen

Doppelte Einträge finden und zusammenführen:

1. **DOI-Abgleich**: Einträge mit identischen DOIs gruppieren (nach Zeichenkettenbereinigung: Kleinschreibung, Entfernung von Präfixen).
2. **Titelabgleich**: Für Einträge ohne DOI den Titel-Ähnlichkeitsabgleich verwenden (Kleinschreibung, Entfernung von Satzzeichen, Fuzzy-Matching mit einem Schwellenwert).
3. **Duplikate auflösen**: Für jede Duplikatgruppe nach Zusammenführungsstrategie:
   - **Erste behalten**: Den chronologisch ersten Eintrag behalten (Reihenfolge des Dateiladens).
   - **Vollständigere behalten**: Den Eintrag mit mehr ausgefüllten Feldern behalten.
   - **Zusammenführen**: Leere Felder eines Eintrags mit Werten eines anderen füllen.
4. **Duplikatbericht**: Gefundene Duplikate und durchgeführte Aktionen dokumentieren.

**Erwartet:** Keine doppelten Einträge verbleiben, und ein Bericht dokumentiert, welche Einträge zusammengeführt oder entfernt wurden.

**Bei Fehler:** Falls der Titelabgleich falsch-positive Ergebnisse erzeugt (unterschiedliche Artikel mit ähnlichen Titeln), den Fuzzy-Matching-Schwellenwert erhöhen oder eine zusätzliche Überprüfung durch Autorenabgleich hinzufügen.

### Schritt 4: Eintragsfelder validieren

Jeden Eintrag auf Vollständigkeit und Korrektheit prüfen:

1. **Erforderliche Felder prüfen**: Für jeden Eintragstyp (article, book, inproceedings usw.) sicherstellen, dass alle vom BibTeX-Standard geforderten Felder vorhanden sind.

| Eintragstyp | Erforderliche Felder |
|-------------|---------------------|
| article | author, title, journal, year |
| book | author/editor, title, publisher, year |
| inproceedings | author, title, booktitle, year |
| phdthesis | author, title, school, year |
| techreport | author, title, institution, year |
| misc | author, title, year (empfohlen) |

2. **Feldformat validieren**: Prüfen, ob die Jahresangabe eine gültige vierstellige Zahl ist, DOIs ein gültiges Format haben und URLs erreichbar sind.
3. **Validierungsbericht**: Alle fehlenden oder ungültigen Felder auflisten, geordnet nach Eintragsschlüssel.

**Erwartet:** Alle Einträge bestehen die Feldvalidierung, oder ein Bericht listet die spezifischen Probleme zur Korrektur auf.

**Bei Fehler:** Falls erforderliche Felder fehlen und nicht durch DOI-Auflösung ermittelt werden können, die Einträge für manuelle Vervollständigung markieren, anstatt unvollständige Daten zu erfinden.

### Schritt 5: Saubere Bibliographie exportieren

Die validierte Bibliographie in eine .bib-Datei schreiben:

1. **Einträge sortieren**: Nach Zitierschlüssel (alphabetisch) oder einem anderen angegebenen Kriterium sortieren.
2. **Exportieren**: `RefManageR::WriteBib(bib_clean, file = "output.bib")` verwenden.
3. **Ausgabe überprüfen**: Die exportierte Datei zurücklesen und bestätigen, dass alle Einträge erhalten sind und das Parsen fehlerfrei erfolgt.
4. **Zusammenfassung erstellen**: Die Gesamtzahl der Einträge nach Typ, gelöste Duplikate und verbleibende Warnungen dokumentieren.

```r
WriteBib(bib_clean, file = "output.bib")
bib_verify <- ReadBib("output.bib")
stopifnot(length(bib_verify) == length(bib_clean))
```

**Erwartet:** Eine saubere, validierte .bib-Datei wird geschrieben, die sich ohne Fehler parsen lässt und alle erwarteten Einträge enthält.

**Bei Fehler:** Falls die exportierte Datei nicht geparst werden kann, Nicht-ASCII-Zeichen prüfen, die während des Exports nicht korrekt escaped wurden. Häufige Probleme: geschweifte Klammern innerhalb von Titelfeldern, Sonderzeichen in Autorennamen.

## Validierung

- [ ] Alle Eingabequellen erfolgreich geladen
- [ ] Zitierschlüssel folgen einem konsistenten Format ohne Duplikate
- [ ] Doppelte Einträge erkannt und gemäß der Zusammenführungsstrategie aufgelöst
- [ ] Alle Einträge bestehen die Pflichtfeldvalidierung für ihren Eintragstyp
- [ ] Die exportierte .bib-Datei lässt sich ohne Fehler parsen
- [ ] Die Anzahl der exportierten Einträge entspricht der erwarteten Zahl (nach Deduplizierung)

## Häufige Fehler

- **Nicht-ASCII-Zeichen in Autorennamen**: BibTeX erwartet LaTeX-Kodierung für Akzente (z.B. `{M\"uller}` statt `Müller`). RefManageR verarbeitet dies bei einigen Operationen, aber der Export kann kodierungsabhängig variieren. Den Export immer in einem LaTeX-kompilierenden Workflow überprüfen.
- **Geschweifte Klammern im Feld title**: BibTeX interpretiert Groß-/Kleinschreibung in Titeln stilspezifisch. Um die Schreibweise zu erhalten, das Wort in zusätzliche geschweifte Klammern setzen: `title = {The {Bayesian} Approach}`.
- **DOI-Auflösung schlägt leise fehl**: `GetBibEntryWithDOI` kann `NULL` oder unvollständige Einträge für gültige DOIs zurückgeben, wenn der Crossref-Dienst nicht antwortet. Immer den Rückgabewert vor dem Zusammenführen prüfen.
- **Duplikaterkennung zu aggressiv**: Titel mit Sonderzeichen oder Formatierungsunterschieden können nach der Normalisierung identisch erscheinen. Den Abgleich immer durch Autoren- oder Jahreszahlenvergleich verifizieren, bevor Einträge entfernt werden.

## Verwandte Skills

- `format-citations` -- Zitate mithilfe der verwalteten Bibliographie in bestimmten Stilen formatieren
- `validate-references` -- tiefergehende Validierung einschließlich DOI-Auflösung und URL-Prüfung
- `create-quarto-report` -- Quarto-Dokumente erstellen, die die Bibliographie konsumieren
