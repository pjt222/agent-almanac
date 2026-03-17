---
name: review-research
description: >
  Fuehrt ein Peer-Review von Forschungsmethodik, Versuchsdesign und
  Manuskriptqualitaet durch. Umfasst Methodenbewertung, statistische
  Angemessenheit, Reproduzierbarkeitsbewertung, Biasidentifikation und
  konstruktives Feedback. Verwenden bei der Begutachtung eines Manuskripts,
  Preprints oder internen Forschungsberichts, bei der Bewertung eines
  Forschungsvorschlags oder Studienprotokolls, bei der Einschaetzung der
  Beweisqualitaet hinter einer Behauptung oder beim Review eines
  Dissertationskapitels.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: peer-review, methodology, research, reproducibility, bias, manuscript
---

# Forschung reviewen

Fuehrt ein strukturiertes Peer-Review von Forschungsarbeiten durch und bewertet Methodik, statistische Entscheidungen, Reproduzierbarkeit und wissenschaftliche Stringenz insgesamt.

## Wann verwenden

- Begutachtung eines Manuskripts, Preprints oder internen Forschungsberichts
- Bewertung eines Forschungsvorschlags oder Studienprotokolls
- Einschaetzung der Beweisqualitaet hinter einer Behauptung oder Empfehlung
- Rueckmeldung zum Forschungsdesign eines Kollegen vor der Datenerhebung
- Review eines Dissertationskapitels oder Dissertationsabschnitts

## Eingaben

- **Erforderlich**: Forschungsdokument (Manuskript, Bericht, Vorschlag oder Protokoll)
- **Erforderlich**: Fachlicher Kontext (beeinflusst Methodenstandards)
- **Optional**: Richtlinien des Journals oder der Veranstaltung (bei Begutachtung zur Publikation)
- **Optional**: Ergaenzende Materialien (Daten, Code, Anhaenge)
- **Optional**: Frueherer Gutachterkommentare (bei Begutachtung einer Revision)

## Vorgehensweise

### Schritt 1: Erster Durchgang — Umfang und Struktur

Das gesamte Dokument einmal lesen, um Folgendes zu verstehen:
1. **Forschungsfrage**: Ist sie klar formuliert und spezifisch?
2. **Beitragsanspruch**: Was ist neu oder originell?
3. **Gesamtstruktur**: Folgt es dem erwarteten Format (IMRaD oder veranstaltungsspezifisch)?
4. **Thematische Passung**: Ist die Arbeit fuer die Zielgruppe/das Zielmedium geeignet?

```markdown
## Bewertung des ersten Durchgangs
- **Forschungsfrage**: [Klar / Unscharf / Fehlend]
- **Neuheitsanspruch**: [Formuliert und begruendet / Uebertrieben / Unklar]
- **Struktur**: [Vollstaendig / Fehlende Abschnitte: ___]
- **Thematische Passung**: [Angemessen / Grenzwertig / Nicht angemessen]
- **Empfehlung nach erstem Durchgang**: [Review fortsetzen / Schwerwiegende Bedenken fruehzeitig markieren]
```

**Erwartet:** Klares Verstaendnis der Behauptungen und des Beitrags der Arbeit.
**Bei Fehler:** Wenn die Forschungsfrage nach vollstaendiger Lektuere unklar bleibt, dies als schwerwiegendes Problem vermerken und fortfahren.

### Schritt 2: Methodik bewerten

Das Forschungsdesign anhand der Fachstandards beurteilen:

#### Quantitative Forschung
- [ ] Studiendesign angemessen fuer die Forschungsfrage (experimentell, quasi-experimentell, beobachtend, Umfrage)
- [ ] Stichprobengroe begruendet (Poweranalyse oder praktische Begruendung)
- [ ] Stichprobenmethode beschrieben und angemessen (zufaellig, geschichtet, opportunistisch)
- [ ] Variablen klar definiert (unabhaengig, abhaengig, Kontroll-, Stoervariablen)
- [ ] Messinstrumente validiert und Reliabilitaet berichtet
- [ ] Datenerhebungsverfahren aus der Beschreibung reproduzierbar
- [ ] Ethische Aspekte beruecksichtigt (IRB/Ethikgenehmigung, Einwilligung)

#### Qualitative Forschung
- [ ] Methodik explizit (Grounded Theory, Phaenomenologie, Fallstudie, Ethnographie)
- [ ] Auswahlkriterien der Teilnehmer und Datensaettigung diskutiert
- [ ] Datenerhebungsmethoden beschrieben (Interviews, Beobachtungen, Dokumente)
- [ ] Positionierung des Forschenden anerkannt
- [ ] Vertrauenswuerdigkeitsstrategien berichtet (Triangulation, Member-Checking, Pruefpfad)
- [ ] Ethische Aspekte beruecksichtigt

#### Mixed-Methods
- [ ] Begruendung fuer das Mixed-Design erlaeutert
- [ ] Integrationsstrategie beschrieben (konvergent, erklaerend-sequenziell, explorativ-sequenziell)
- [ ] Beide Komponenten (quantitativ und qualitativ) erfullen ihre jeweiligen Standards

**Erwartet:** Methodik-Checkliste mit spezifischen Beobachtungen zu jedem Punkt abgeschlossen.
**Bei Fehler:** Wenn kritische Methodikinformationen fehlen, als schwerwiegendes Problem markieren statt anzunehmen.

### Schritt 3: Statistische und analytische Entscheidungen bewerten

- [ ] Statistische Methoden angemessen fuer den Datentyp und die Forschungsfrage
- [ ] Voraussetzungen statistischer Tests geprueft und berichtet (Normalverteilung, Homoskedastizitaet, Unabhaengigkeit)
- [ ] Effektgroessen neben p-Werten berichtet
- [ ] Konfidenzintervalle wo angemessen angegeben
- [ ] Korrekturen fuer multiples Testen angewendet (Bonferroni, FDR usw.)
- [ ] Umgang mit fehlenden Daten beschrieben und angemessen
- [ ] Sensitivitaetsanalysen fuer wichtige Annahmen durchgefuehrt
- [ ] Ergebnisinterpretation konsistent mit der Analyse (keine Uebertreibung der Befunde)

Haeufige statistische Warnsignale:
- p-Hacking-Indikatoren (viele Vergleiche, selektive Berichterstattung, "marginally significant")
- Unangemessene Tests (t-Test bei nicht-normalen Daten ohne Begruendung, parametrische Tests bei Ordinaldaten)
- Verwechslung von statistischer und praktischer Signifikanz
- Keine Angabe von Effektgroessen
- Post-hoc-Hypothesen als a-priori-Hypothesen prasentiert

**Erwartet:** Statistische Entscheidungen bewertet mit dokumentierten spezifischen Bedenken.
**Bei Fehler:** Wenn Fachkenntnisse zu einer bestimmten Methode fehlen, dies eingestehen und einen spezialisierten Gutachter empfehlen.

### Schritt 4: Reproduzierbarkeit bewerten

- [ ] Datenverfuegbarkeit angegeben (offene Daten, Repository-Link, auf Anfrage verfuegbar)
- [ ] Verfuegbarkeit des Analysecodes angegeben
- [ ] Softwareversionen und Umgebungen dokumentiert
- [ ] Zufallsseeds oder Reproduzierbarkeitsmechanismen beschrieben
- [ ] Wichtige Parameter und Hyperparameter berichtet
- [ ] Rechenumgebung beschrieben (Hardware, Betriebssystem, Abhaengigkeiten)

Reproduzierbarkeitsstufen:
| Stufe | Beschreibung | Nachweis |
|-------|-------------|---------|
| Gold | Vollstaendig reproduzierbar | Offene Daten + offener Code + containerisierte Umgebung |
| Silber | Weitgehend reproduzierbar | Daten verfuegbar, Analyse detailliert beschrieben |
| Bronze | Potenziell reproduzierbar | Methoden beschrieben, aber kein Daten-/Code-Sharing |
| Undurchsichtig | Nicht reproduzierbar | Unzureichende Methodendetails oder proprietaere Daten |

**Erwartet:** Reproduzierbarkeitsstufe mit Begruendung vergeben.
**Bei Fehler:** Wenn Daten nicht geteilt werden koennen (Datenschutz, proprietaer), sind synthetische Daten oder detaillierter Pseudocode ein akzeptables Alternativ — vermerken, ob dies bereitgestellt wird.

### Schritt 5: Moegliche Verzerrungen identifizieren

- [ ] Selektionsverzerrung: Waren die Teilnehmer repraesentativ fuer die Zielpopulation?
- [ ] Messverzerrung: Konnte der Messprozess die Ergebnisse systematisch verzerren?
- [ ] Berichtsverzerrung: Werden alle Ergebnisse berichtet, einschliesslich nicht-signifikanter?
- [ ] Bestatigungsverzerrung: Suchten die Autoren nur nach Belegen, die ihre Hypothese stuetzen?
- [ ] Survivorship Bias: Wurden Abbrecher, ausgeschlossene Daten oder fehlgeschlagene Experimente beruecksichtigt?
- [ ] Finanzierungsverzerrung: Ist die Finanzierungsquelle offengelegt und koennte sie die Befunde beeinflussen?
- [ ] Publikationsverzerrung: Ist dies ein vollstaendiges Bild, oder koennten negative Ergebnisse fehlen?

**Erwartet:** Moegliche Verzerrungen mit spezifischen Beispielen aus dem Manuskript identifiziert.
**Bei Fehler:** Wenn Verzerrungen anhand der verfuegbaren Informationen nicht beurteilt werden koennen, empfehlen, dass die Autoren dies explizit thematisieren.

### Schritt 6: Das Review verfassen

Review konstruktiv strukturieren:

```markdown
## Zusammenfassung
[2-3 Saetze, die den Beitrag des Artikels und die Gesamtbewertung zusammenfassen]

## Schwerwiegende Bedenken
[Probleme, die behoben werden muessen, bevor die Arbeit als solide gelten kann]

1. **[Titel des Bedenkenbereichs]**: [Spezifische Beschreibung mit Verweis auf Abschnitt/Seite/Abbildung]
   - *Vorschlag*: [Wie die Autoren dies behoben koennten]

2. ...

## Geringfuegige Bedenken
[Probleme, die die Qualitaet verbessern, aber nicht grundlegend sind]

1. **[Titel des Bedenkenbereichs]**: [Spezifische Beschreibung]
   - *Vorschlag*: [Empfohlene Aenderung]

## Fragen an die Autoren
[Klaerungsbedarfe zur Vervollstaendigung der Bewertung]

1. ...

## Positive Beobachtungen
[Spezifische Staerken, die es wert sind, anerkannt zu werden]

1. ...

## Empfehlung
[Annehmen / Geringfuegige Revision / Wesentliche Revision / Ablehnen]
[Kurze Begruendung der Empfehlung]
```

**Erwartet:** Das Review ist spezifisch, konstruktiv und verweist auf genaue Stellen im Manuskript.
**Bei Fehler:** Wenn das Review zu lang wird, schwerwiegende Bedenken priorisieren und geringfuegige Probleme in einer Zusammenfassungsliste vermerken.

## Validierung

- [ ] Jedes schwerwiegende Bedenken verweist auf einen spezifischen Abschnitt, eine Abbildung oder Behauptung
- [ ] Rueckmeldungen sind konstruktiv — Probleme werden mit Vorschlaegen gepaart
- [ ] Positive Aspekte werden neben Bedenken anerkannt
- [ ] Statistische Bewertung passt zu den verwendeten Analysemethoden
- [ ] Reproduzierbarkeit wird explizit bewertet
- [ ] Die Empfehlung ist konsistent mit dem Ernst der geaeusserten Bedenken
- [ ] Der Ton ist professionell, respektvoll und kollegial

## Haeufige Stolperfallen

- **Vage Kritik**: "Die Methodik ist schwach" ist nicht hilfreich. Spezifizieren, was schwach ist und warum.
- **Forderung nach einer anderen Studie**: Die durchgefuehrte Forschung reviewen, nicht die Forschung, die man selbst gemacht haette.
- **Kontext ignorieren**: An eine Konferenzarbeit werden andere Erwartungen gestellt als an einen Zeitschriftenartikel.
- **Ad hominem**: Die Arbeit reviewen, nicht die Autoren. Niemals auf die Identitaet der Autoren eingehen.
- **Perfektionismus**: Keine Studie ist perfekt. Auf Bedenken konzentrieren, die die Schlussfolgerungen veraendern wuerden.

## Verwandte Skills

- `review-data-analysis` — tieferer Fokus auf Datenqualitaet und Modellvalidierung
- `format-apa-report` — APA-Formatierungsstandards fuer Forschungsberichte
- `generate-statistical-tables` — publikationsreife statistische Tabellen
- `validate-statistical-output` — Verifikation statistischer Ausgaben
