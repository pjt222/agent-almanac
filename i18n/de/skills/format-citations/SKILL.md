---
name: format-citations
description: >
  Zitate und Literaturverzeichnisse über verschiedene akademische Stile hinweg
  formatieren (APA 7, Chicago, Vancouver, IEEE, benutzerdefiniert) unter
  Verwendung von CSL/citeproc-Verarbeitung in R. Stilregeln anwenden für
  Autorenformatierung, Datumsplatzierung, Kursivschrift, DOI-Einbindung
  und Reihenfolge des Literaturverzeichnisses. Verwenden, wenn zwischen
  Zitierstilen konvertiert oder stilkonforme Literaturverzeichnisse für
  Einreichungen erstellt werden sollen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, csl, citeproc, formatting, academic-styles
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Zitate formatieren

Zitate und Literaturverzeichnisse über verschiedene akademische Stile hinweg formatieren unter Verwendung von CSL-Definitionen und citeproc-Verarbeitung in R, mit Regeln für Autorenformatierung, Datumsstile, Kursivschrift und DOI-Einbindung.

## Wann verwenden

- Umstellung eines Manuskripts von einem Zitierstil auf einen anderen (z.B. APA zu Vancouver)
- Erzeugung eines stilkonformen Literaturverzeichnisses für Zeitschrifteneinreichung
- Prüfung, ob Zitate korrekt nach einem bestimmten Stil formatiert sind
- Erstellung konsistenter In-Text-Zitate und korrespondierender Literaturverzeichniseinträge
- Anpassung eines CSL-Stils für besondere Zeitschriftenanforderungen

## Eingaben

- **Erforderlich**: Bibliographiedaten (BibTeX .bib-Datei oder BibEntry-Objekt)
- **Erforderlich**: Zielzitierstil (APA 7., Chicago Autor-Jahr, Vancouver, IEEE oder benutzerdefinierte CSL-Datei)
- **Optional**: Spezifische zu formatierende Zitierschlüssel (Standardmäßig werden alle Einträge formatiert)
- **Optional**: Dokumentkontext (Quarto .qmd, R Markdown .Rmd oder eigenständig)
- **Optional**: Sprachgebiet für lokalisierte Formatierung (z.B. Deutsch: „und" statt „and")

## Vorgehensweise

### Schritt 1: Stilregeln und CSL-Definition laden

Den Zielzitierstil vorbereiten:

1. **Vordefinierten Stil identifizieren**: Standardstile im CSL-Repository unter https://github.com/citation-style-language/styles finden.
2. **CSL-Datei herunterladen oder lokalisieren**: Sicherstellen, dass die .csl-Datei für das Projekt zugänglich ist. Häufige Stile:

| Stil | CSL-Dateiname | In-Text-Format |
|------|---------------|----------------|
| APA 7. Auflage | `apa.csl` | (Nachname, Jahr) |
| Chicago Autor-Jahr | `chicago-author-date.csl` | (Nachname Jahr) |
| Vancouver | `vancouver.csl` | Nummern [1] |
| IEEE | `ieee.csl` | Nummern [1] |
| Nature | `nature.csl` | Hochgestellte Nummern |

3. **Sprachgebiet prüfen**: CSL-Stile verwenden Sprachgebietsdateien für lokalisierte Begriffe. Sicherstellen, dass das richtige Sprachgebiet konfiguriert ist.
4. **Benutzerdefinierte Änderungen**: Falls der Zielstil von einem Standard-CSL-Stil abweicht, die CSL-XML-Datei bearbeiten oder eine Kopie erstellen.

**Erwartet:** Die CSL-Stildatei ist geladen und alle stilspezifischen Regeln sind dokumentiert.

**Bei Fehler:** Falls kein exakter CSL-Stil verfügbar ist, den nächstliegenden Stil als Basis verwenden und die benötigten Änderungen dokumentieren. Häufige Anpassungen: Reihenfolge der Autoren, Datumsformat, Verwendung von Kursivschrift vs. Anführungszeichen für Titel.

### Schritt 2: Stilregeln auf Einträge anwenden

Jeden Bibliographieeintrag gemäß den CSL-Regeln formatieren:

1. **Autorenformatierung**:
   - APA: Nachname, Initiale(n). Format, „&" vor dem letzten Autor, max. 20 Autoren
   - Vancouver: Nachname Initialen, Komma-getrennt, max. 6 dann „et al."
   - Chicago: Erster Autor invertiert, nachfolgende in normaler Reihenfolge

2. **Titelformatierung**:
   - APA: Satzmäßige Großschreibung für Artikeltitel, titelgemäße Großschreibung für Bücher/Zeitschriften
   - Vancouver: Satzmäßige Großschreibung, keine Kursivschrift für Artikeltitel
   - Zeitschriftennamen je nach Stil abgekürzt oder ausgeschrieben

3. **Datum und Volumen**:
   - APA: (Jahr). Vor dem Titel
   - Vancouver: Jahr;Volumen(Ausgabe):Seiten
   - IEEE: vol. X, no. Y, S. Z–W, Mon. Jahr

4. **DOI/URL-Einbindung**:
   - APA 7: DOI als `https://doi.org/10.xxxx` (immer einschließen)
   - Vancouver: DOI nach Seitenangaben, optional
   - Einige Stile erfordern „Verfügbar unter:" vor URLs

5. **Seitenangaben und Identifikatoren**: Seitenbereiche, Artikelnummern und elektronische Standorte korrekt formatieren.

**Erwartet:** Jeder Eintrag ist vollständig im Zielstil formatiert mit korrekter Autorenreihenfolge, Zeichensetzung und Typografie.

**Bei Fehler:** Falls ein Eintrag vom Stil nicht unterstützte Felder hat (z.B. Softwarezitat im Vancouver-Stil), auf den nächsten unterstützten Eintragstyp zurückfallen und die Abweichung dokumentieren.

### Schritt 3: In-Text-Zitate generieren

Die in den Dokumenttext eingebetteten Zitationsverweise erstellen:

1. **Autor-Jahr-Stile** (APA, Chicago):
   - Einzelner Autor: (Müller, 2024)
   - Zwei Autoren: (Müller & Schmidt, 2024)
   - Drei oder mehr: (Müller et al., 2024)
   - Narrativ: Müller (2024) berichtet, dass...
   - Seitenverweis: (Müller, 2024, S. 45)

2. **Nummerierte Stile** (Vancouver, IEEE):
   - Sequenziell nummeriert in Reihenfolge des ersten Erscheinens: [1], [2], [3]
   - Bereiche: [1–3], [1, 3, 5]
   - Hochgestellt (Nature): ¹, ²⁻⁴

3. **Mehrdeutigkeiten auflösen**: Wenn mehrere Einträge zur gleichen Zitation zusammenfallen (gleicher Autor, gleiches Jahr), Buchstabensuffixe hinzufügen: (Müller, 2024a), (Müller, 2024b).

**Erwartet:** In-Text-Zitate stimmen exakt mit dem Literaturverzeichnis überein und folgen den Regeln des Zielstils.

**Bei Fehler:** Falls Mehrdeutigkeitsregeln den Stil überkomplizieren, die spezifischen Stilrichtlinien für die Disambiguierung konsultieren (einige Stile verwenden Initialen des Vornamens statt Buchstabensuffixe).

### Schritt 4: Literaturverzeichnis zusammenstellen

Die vollständige Literaturliste generieren:

1. **Sortierreihenfolge**: Nach Stil sortieren:
   - APA: Alphabetisch nach Nachname des ersten Autors, dann Jahr
   - Vancouver: In Reihenfolge des ersten Erscheinens im Text
   - Chicago: Alphabetisch nach Nachname

2. **Formatierung**: Jeden formatierten Eintrag mit korrekten hängenden Einzügen, Abständen und Trennzeichen zusammenstellen.

3. **Überschrift**: Geeignete Abschnittsüberschrift verwenden:
   - APA: „Literatur" (englisch: „References")
   - Chicago: „Bibliographie" oder „Zitierte Werke"
   - Vancouver: „Literatur"

4. **Ausgabe rendern**: Für Quarto/R Markdown den CSL-Prozessor die Formatierung übernehmen lassen. Für eigenständige Ausgabe formatierten Text oder HTML erzeugen.

**Erwartet:** Ein vollständiges, korrekt geordnetes und formatiertes Literaturverzeichnis, das zum gewählten Stil passt.

**Bei Fehler:** Falls die Sortierreihenfolge falsch ist, die Sprachgebiet-Einstellungen des CSL-Prozessors prüfen (betrifft die Alphabetisierung in nicht-englischen Namen). Falls Einträge fehlen, sicherstellen, dass alle zitierten Schlüssel in der .bib-Datei vorhanden sind.

### Schritt 5: Ausgabe validieren und exportieren

Die formatierte Ausgabe prüfen und liefern:

1. **Stichprobenprüfung**: 3–5 Einträge manuell gegen die Stilrichtlinien prüfen: Autorformat, Interpunktion, Kursivschrift, DOI-Format.
2. **Querverweis**: Sicherstellen, dass jedes In-Text-Zitat einen korrespondierenden Literaturverzeichniseintrag hat und umgekehrt.
3. **Exportformate**: Ausgabe in dem für den Arbeitsablauf benötigten Format liefern:
   - Quarto/R Markdown: YAML-Header mit `bibliography:` und `csl:` konfigurieren
   - Eigenständig: Formatierten Text, HTML oder Word-Dokument erzeugen
   - LaTeX: Formatierten .bbl-Dateiabschnitt erzeugen

**Erwartet:** Validierte, stilkonforme Zitate und Literaturverzeichnis, bereit für die Einreichung oder Veröffentlichung.

**Bei Fehler:** Falls die Validierung Inkonsistenzen findet, die CSL-Stilregeln (Schritt 1) mit den stilspezifischen Transformationen (Schritt 2) abgleichen. Häufige Probleme: Groß-/Kleinschreibungsregeln, die vom Bibliographiemanager nicht durchgesetzt werden, fehlende Felder, die zu unvollständigen Einträgen führen.

## Validierung

- [ ] CSL-Stildatei korrekt geladen und Stilregeln dokumentiert
- [ ] Autorenformatierung entspricht den Regeln des Zielstils
- [ ] Titel, Daten, Volumina und Seitenangaben korrekt formatiert
- [ ] DOIs/URLs gemäß Stilanforderungen eingebunden
- [ ] In-Text-Zitate stimmen mit Literaturverzeichniseinträgen überein
- [ ] Sortierreihenfolge des Literaturverzeichnisses entspricht dem Stil
- [ ] Stichprobenprüfung repräsentativer Einträge gegen Stilrichtlinien bestanden
- [ ] Querverweisüberprüfung: keine verwaisten Zitate und keine nicht zitierten Einträge

## Häufige Fehler

- **CSL-Stile variieren in subtilen Details**: Zwei „APA"-Stildateien aus verschiedenen Quellen können unterschiedliche Ergebnisse liefern. Immer das offizielle CSL-Repository (citation-style-language/styles) als Autoritätsquelle verwenden.
- **Groß-/Kleinschreibungsregeln zwischen Stilen verwechseln**: APA verwendet Satzmäßige Großschreibung für Artikeltitel, aber titelgemäße Großschreibung für Zeitschriftennamen. Eine globale Anwendung einer Groß-/Kleinschreibungsregel erzeugt in den meisten Stilen falsche Ergebnisse.
- **Autorenmehrdeutigkeiten nicht auflösen**: Wenn zwei Einträge den gleichen Erstautor und das gleiche Jahr haben, erfordern die meisten Stile eine Disambiguierung (Buchstabensuffixe oder zusätzliche Autoreninitialen). Fehlende Disambiguierung hinterlässt mehrdeutige Zitate.
- **Sprachgebiet ignorieren**: Deutsche Bibliographien brauchen „und" statt „and", „Hrsg." statt „Eds." und passende Datumsformate. Die Sprachgebietskonfiguration im CSL-Prozessor muss zum Dokumentsprachgebiet passen.
- **Annehmen, dass alle Zitierstile „Nachname, Jahr" sind**: Nummerierte Stile (Vancouver, IEEE) haben grundlegend andere Sortier- und Referenzierungsregeln. In-Text-Zitat-Generierung und Sortierung des Literaturverzeichnisses müssen zum Stiltyp passen.

## Verwandte Skills

- `manage-bibliography` -- Bibliographiedateien erstellen und bereinigen, bevor die Formatierung angewendet wird
- `validate-references` -- Zitate gegen externe Quellen prüfen, bevor sie formatiert werden
- `create-quarto-report` -- Quarto-Dokumente erstellen, die formatierte Zitate konsumieren
- `format-apa-report` -- spezialisierte APA-7-Formatierung für Berichte und Manuskripte
