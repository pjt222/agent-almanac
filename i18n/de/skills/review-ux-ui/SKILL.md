---
name: review-ux-ui
description: >
  Bewertet User Experience und Interface-Design anhand von Nielsens Heuristiken,
  WCAG-2.1-Zugaenglichkeitsrichtlinien, Tastatur- und Screenreader-Audit,
  Nutzerfluss-Analyse, Kognitive-Last-Bewertung und Formular-Usability-Pruefung.
  Verwenden bei einem Usability-Review vor dem Release, bei der Bewertung der
  WCAG-2.1-Zugaenglichkeitskonformitaet, bei der Bewertung von Nutzerfluessen
  auf Effizienz, beim Review von Formulardesign oder bei einer heuristischen
  Evaluation einer bestehenden Oberflaeche.
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
  language: multi
  tags: ux, ui, accessibility, wcag, heuristics, usability, user-flows, cognitive-load
---

# UX/UI reviewen

User Experience und Interface-Design auf Usability, Zugaenglichkeit und Wirksamkeit bewerten.

## Wann verwenden

- Durchfuehrung eines Usability-Reviews einer Anwendung vor dem Release
- Bewertung der Zugaenglichkeitskonformitaet (WCAG 2.1 AA oder AAA)
- Bewertung von Nutzerfluessen auf Effizienz und Fehlervermeidung
- Review von Formulardesign auf Usability und Konversionsoptimierung
- Heuristische Evaluation einer bestehenden Benutzeroberflaeche
- Bewertung kognitiver Last und Informationsarchitektur

## Eingaben

- **Erforderlich**: Zu reviewende Anwendung (URL, Prototyp oder Quellcode)
- **Erforderlich**: Beschreibung der Zielnutzer (Rollen, technische Kompetenz, Nutzungskontext)
- **Optional**: Nutzerforschungsergebnisse (Interviews, Umfragen, Analytics)
- **Optional**: WCAG-Konformitaetsziel (A, AA oder AAA)
- **Optional**: Spezifische Nutzerflüsse oder Aufgaben zur Bewertung
- **Optional**: Zu testende assistive Technologie (Screenreader, Switch-Access)

## Vorgehensweise

### Schritt 1: Heuristische Evaluation (Nielsens 10 Heuristiken)

Die Oberflaeche gegen jede Heuristik bewerten:

| # | Heuristik | Schluesselfrage | Bewertung |
|---|-----------|-------------|--------|
| 1 | **Sichtbarkeit des Systemstatus** | Informiert das System die Nutzer stets darueber, was passiert? | |
| 2 | **Uebereinstimmung mit der realen Welt** | Verwendet das System vertraute Sprache und Konzepte? | |
| 3 | **Nutzerkontrolle und -freiheit** | Koennen Nutzer einfach rueckgaengig machen, wiederherstellen oder unerwuenschte Zustaende verlassen? | |
| 4 | **Konsistenz und Standards** | Verhalten sich aehnliche Elemente durchgehend gleich? | |
| 5 | **Fehlervermeidung** | Verhindert das Design Fehler, bevor sie auftreten? | |
| 6 | **Erkennen statt Erinnern** | Sind Optionen, Aktionen und Informationen sichtbar oder leicht abrufbar? | |
| 7 | **Flexibilitaet und Effizienz der Nutzung** | Gibt es Abkuerzungen fuer erfahrene Nutzer, ohne Neulinge zu verwirren? | |
| 8 | **Aesthetisches und minimalistisches Design** | Hat jedes Element einen Zweck? Gibt es unnoetige Unordnung? | |
| 9 | **Nutzer beim Erkennen, Diagnostizieren und Beheben von Fehlern unterstuetzen** | Sind Fehlermeldungen klar, spezifisch und konstruktiv? | |
| 10 | **Hilfe und Dokumentation** | Ist Hilfe verfuegbar und leicht zu finden, wenn noetig? | |

Fuer jede Heuristik den Schweregrad von Verstoessen bewerten:

| Schweregrad | Beschreibung |
|----------|-------------|
| 0 | Kein Usability-Problem |
| 1 | Kosmetisch — beheben, wenn Zeit vorhanden |
| 2 | Geringfuegig — Behebung mit niedriger Prioritaet |
| 3 | Wesentlich — wichtig zu beheben, hohe Prioritaet |
| 4 | Katastrophal — muss vor Release behoben werden |

```markdown
## Befunde der heuristischen Evaluation
| # | Heuristik | Schweregrad | Befund | Stelle |
|---|-----------|----------|---------|----------|
| 1 | Systemstatus | 3 | Kein Ladeindikator waehrend Datenabruf — Nutzer klicken wiederholt | Dashboard-Seite |
| 3 | Nutzerkontrolle | 2 | Kein Rueckgaengig fuer das Loeschen von Eintraegen — nur ein Bestaetigungsdialog | Eintrags-Liste |
| 5 | Fehlervermeidung | 3 | Datumsfeld akzeptiert ungueltige Daten (30. Feb.) | Buchungsformular |
| 9 | Fehlerbehebung | 4 | Formularuebertragungsfehler loescht alle Felder | Registrierung |
```

**Erwartet:** Alle 10 Heuristiken mit spezifischen Befunden und Schweregradebewertungen ausgewertet.
**Bei Fehler:** Bei Zeitdruck auf Heuristiken 1, 3, 5 und 9 konzentrieren (groesste Auswirkung auf User Experience).

### Schritt 2: Zugaenglichkeits-Audit (WCAG 2.1)

#### Wahrnehmbar
- [ ] **1.1.1 Nichttextlicher Inhalt**: Alle Bilder haben Alt-Text (dekorative Bilder haben `alt=""`)
- [ ] **1.3.1 Information und Beziehungen**: Semantisches HTML verwendet (Ueberschriften, Listen, Tabellen, Landmarks)
- [ ] **1.3.2 Bedeutungsvolle Reihenfolge**: DOM-Reihenfolge stimmt mit visueller Reihenfolge ueberein
- [ ] **1.4.1 Verwendung von Farbe**: Farbe ist nicht das einzige Mittel zur Informationsuebermittlung
- [ ] **1.4.3 Kontrast**: Textkontrastverhältnis ≥ 4,5:1 (normal), ≥ 3:1 (grosser Text)
- [ ] **1.4.4 Textgroessenveraenderung**: Text kann ohne Funktionsverlust auf 200% skaliert werden
- [ ] **1.4.11 Nicht-Text-Kontrast**: UI-Komponenten und Grafiken haben ≥ 3:1 Kontrast
- [ ] **1.4.12 Textabstand**: Inhalt funktioniert mit erhoehtem Textabstand (Zeilenhoehe 1,5x, Zeichenabstand 0,12em, Wortabstand 0,16em)

#### Bedienbar
- [ ] **2.1.1 Tastatur**: Alle Funktionen sind per Tastatur bedienbar
- [ ] **2.1.2 Keine Tastaturfalle**: Fokus wird niemals in einer Komponente gefangen
- [ ] **2.4.1 Bloecke ueberspringen**: Skip-Navigation-Link fuer Tastaturnutzer verfuegbar
- [ ] **2.4.3 Fokusreihenfolge**: Tab-Reihenfolge folgt einer logischen, vorhersehbaren Sequenz
- [ ] **2.4.7 Fokus sichtbar**: Tastaturfokus-Indikator ist klar sichtbar
- [ ] **2.4.11 Fokus nicht verdeckt**: Fokussiertes Element verbirgt sich nicht hinter fixierten Headern/Overlays
- [ ] **2.5.5 Zielgroesse**: Interaktive Ziele sind mindestens 24x24px (44x44px auf Touch empfohlen)

#### Verstaendlich
- [ ] **3.1.1 Sprache der Seite**: `lang`-Attribut auf `<html>` gesetzt
- [ ] **3.2.1 Beim Fokus**: Fokus loest keine unerwarteten Aenderungen aus
- [ ] **3.2.2 Bei Eingabe**: Eingabe loest ohne Warnung keine unerwarteten Aenderungen aus
- [ ] **3.3.1 Fehleridentifikation**: Fehler werden in Text klar beschrieben
- [ ] **3.3.2 Beschriftungen oder Anweisungen**: Formulareingaben haben sichtbare Beschriftungen
- [ ] **3.3.3 Fehlerkorrekturhinweis**: Fehlermeldungen schlagen Korrekturen vor

#### Robust
- [ ] **4.1.1 Parsen**: HTML ist valide (keine doppelten IDs, korrekte Verschachtelung)
- [ ] **4.1.2 Name, Rolle, Wert**: Benutzerdefinierte Komponenten haben ARIA-Rollen und -Eigenschaften
- [ ] **4.1.3 Statusmeldungen**: Dynamische Inhaltaenderungen werden Screenreadern angezeigt

**Erwartet:** WCAG-2.1-AA-Kriterien systematisch mit Bestanden/Nicht-bestanden geprueft.
**Bei Fehler:** Automatisierte Tools (axe-core, Lighthouse) fuer initialen Scan verwenden, dann manuelles Testen fuer Kriterien, die menschliches Urteilsvermoegen erfordern.

### Schritt 3: Tastatur- und Screenreader-Audit

#### Tastaturnavigations-Test
Nur Tab, Umschalt+Tab, Eingabe, Leertaste, Pfeiltasten und Escape verwenden:

```markdown
## Tastaturnavigations-Audit
| Aufgabe | Erfuellbar? | Probleme |
|------|-------------|--------|
| Zum Hauptinhalt navigieren | Ja — Skip-Link funktioniert | Keine |
| Dropdown-Menu oeffnen | Ja | Pfeiltasten funktionieren nicht innerhalb des Menus |
| Formular absenden | Ja | Tab-Reihenfolge ueberspringt den Absenden-Button |
| Modal schliessen | Nein | Escape schliesst nicht, kein sichtbarer Schliessen-Button in Tab-Reihenfolge |
| Datumsauswahl verwenden | Nein | Benutzerdefinierte Datumsauswahl nicht per Tastatur zugaenglich |
```

#### Screenreader-Test
Mit NVDA (Windows), VoiceOver (macOS/iOS) oder TalkBack (Android) testen:

```markdown
## Screenreader-Audit
| Element | Angezeigt als | Erwartet | Problem |
|---------|-------------|----------|-------|
| Logo-Link | "Link, Bild" | "Home, Link" | Fehlender Alt-Text beim Logo |
| Sucheingabe | "Bearbeiten, Suchen" | "Produkte suchen, Bearbeiten" | Fehlende Label-Verknuepfung |
| Navigations-Menu | "Navigation, Haupt" | Korrekt | Keine |
| Fehlermeldung | (nicht angezeigt) | "Fehler: E-Mail ist erforderlich" | Fehlende Live-Region |
| Ladeanzeige | (nicht angezeigt) | "Wird geladen, bitte warten" | Fehlende aria-live oder role="status" |
```

**Erwartet:** Vollstaendige Aufgabenfluesse mit Nur-Tastatur und Screenreader getestet.
**Bei Fehler:** Wenn kein Screenreader verfuegbar ist, ARIA-Attribute und semantisches HTML als Ersatz pruefen.

### Schritt 4: Nutzerfluesse analysieren

Wichtige Nutzerfluesse kartieren und bewerten:

```markdown
## Nutzerfluss: Kauf abschliessen

### Schritte
1. Produkte durchsuchen → 2. Produkt ansehen → 3. In den Warenkorb → 4. Warenkorb ansehen →
5. Versand angeben → 6. Zahlung angeben → 7. Bestellung pruefen → 8. Bestaetigen

### Bewertung
| Schritt | Reibung | Schweregrad | Anmerkungen |
|------|---------|----------|-------|
| 1→2 | Niedrig | - | Klare Produktkarten |
| 2→3 | Mittel | 2 | "In den Warenkorb"-Schaltflaeche unterhalb des sichtbaren Bereichs auf Mobil |
| 3→4 | Niedrig | - | Warenkorb-Icon aktualisiert sich mit Anzahl |
| 4→5 | Hoch | 3 | Konto erforderlich — kein Gaeste-Checkout |
| 5→6 | Niedrig | - | Adress-Autovervollstaendigung funktioniert gut |
| 6→7 | Mittel | 2 | Kartennummernfeld formatiert sich nicht automatisch |
| 7→8 | Niedrig | - | Klare Bestelluebersicht |

### Fluss-Effizienz
- **Schritte**: 8 (akzeptabel fuer E-Commerce)
- **Pflichtfelder**: 14 (koennte mit Adress-Autovervollstaendigung + gespeicherter Zahlung reduziert werden)
- **Entscheidungspunkte**: 2 (Groessenauswahl, Versandart)
- **Potenzielle Abbruchpunkte**: Schritt 4→5 (erzwungene Kontoerstellung)
```

**Erwartet:** Kritische Nutzerfluesse mit identifizierten und bewerteten Reibungspunkten kartiert.
**Bei Fehler:** Wenn keine Nutzer-Analytics verfuegbar sind, Fluesse anhand von Aufgabenkomplexitaet und Anzahl der Schritte bewerten.

### Schritt 5: Kognitive Last bewerten

- [ ] **Informationsdichte**: Ist die Informationsmenge pro Bildschirm angemessen?
- [ ] **Progressive Offenlegung**: Werden komplexe Informationen schrittweise aufgedeckt?
- [ ] **Chunking**: Sind verwandte Elemente visuell gruppiert (Gestalt-Prinzipien)?
- [ ] **Erkennen statt Erinnern**: Koennen Nutzer Optionen sehen, anstatt sich an sie erinnern zu muessen?
- [ ] **Konsistente Muster**: Verwenden aehnliche Aufgaben aehnliche Interaktionsmuster?
- [ ] **Entscheidungsmuedigkeit**: Werden Nutzern zu viele Optionen auf einmal praesentiert? (Hick'sches Gesetz)
- [ ] **Arbeitsgedaechtnis**: Muessen Nutzer sich Informationen ueber mehrere Schritte merken?

**Erwartet:** Kognitive Last mit spezifischen ueberlasteten oder unterlasteten Bereichen bewertet.
**Bei Fehler:** Wenn kognitive Last objektiv schwer zu bewerten ist, den "Squint-Test" verwenden — Augen zusammenkneifen und sehen, ob Struktur und Hierarchie noch erkennbar sind.

### Schritt 6: Formular-Usability reviewen

Fuer jedes Formular in der Anwendung:

- [ ] **Beschriftungen**: Jede Eingabe hat eine sichtbare, verknuepfte Beschriftung
- [ ] **Platzhaltertext**: Nur fuer Beispiele verwendet, nicht als Beschriftungen
- [ ] **Eingabetypen**: Korrekte HTML-Eingabetypen (email, tel, number, date) fuer mobile Tastaturen
- [ ] **Validierungszeitpunkt**: Fehler werden bei Verlassen oder Absenden angezeigt (nicht bei jedem Tastendruck)
- [ ] **Fehlermeldungen**: Spezifisch ("E-Mail muss @ enthalten") nicht generisch ("Ungueltige Eingabe")
- [ ] **Pflichtfelder**: Klar markiert (und optionale Felder markiert, wenn die meisten Pflichtfelder sind)
- [ ] **Feldgruppierung**: Verwandte Felder visuell gruppiert (Name, Adresse, Zahlungsabschnitte)
- [ ] **Autovervollstaendigung**: `autocomplete`-Attribute fuer Standardfelder gesetzt (name, email, address, cc-number)
- [ ] **Tab-Reihenfolge**: Logischer Fluss entsprechend dem visuellen Layout
- [ ] **Mehrstufige Formulare**: Fortschrittsindikator zeigt aktuellen Schritt und Gesamtanzahl
- [ ] **Persistenz**: Formulardaten bleiben erhalten, wenn Nutzer die Seite verlassen und zurueckkehren

**Erwartet:** Jedes Formular gegen die Checkliste bewertet mit dokumentierten spezifischen Problemen.
**Bei Fehler:** Wenn es viele Formulare gibt, die haeufigst genutzten Formulare priorisieren (Registrierung, Checkout, Kontakt).

### Schritt 7: Den UX/UI-Review verfassen

```markdown
## UX/UI-Review-Bericht

### Zusammenfassung
[2-3 Saetze: Gesamtusability, kritischste Probleme, staerkste Aspekte]

### Zusammenfassung der heuristischen Evaluation
| Heuristik | Schweregrad | Wichtigster Befund |
|-----------|----------|-------------|
[Zusammenfassungstabelle aus Schritt 1]

### Zugaenglichkeitskonformitaet
- **Ziel**: WCAG 2.1 AA
- **Status**: [X von Y Kriterien bestanden]
- **Kritische Fehler**: [Liste]

### Nutzerfluss-Analyse
[Wichtige Reibungspunkte mit Schweregrad und Empfehlungen]

### Top-5-Verbesserungen (Priorisiert)
1. **[Problem]** — Schweregrad: [N] — [Spezifische Empfehlung]
2. ...

### Was gut funktioniert
1. [Spezifische positive Beobachtung]
2. ...
```

**Erwartet:** Review liefert priorisierte, umsetzbare Empfehlungen mit Schweregradebewertungen.
**Bei Fehler:** Wenn der Review zu viele Probleme aufdeckt, in "muss behoben werden" (Schweregrad 3-4) und "sollte behoben werden" (Schweregrad 1-2) kategorisieren.

## Validierung

- [ ] Alle 10 Nielsenschen Heuristiken mit Schweregradebewertungen ausgewertet
- [ ] WCAG-2.1-Kriterien geprueft (mindestens: 1.1.1, 1.4.3, 2.1.1, 2.4.7, 3.3.1, 4.1.2)
- [ ] Tastaturnavigation fuer wichtige Nutzerfluesse getestet
- [ ] Screenreader getestet (oder ARIA/semantisches HTML als Ersatz geprueft)
- [ ] Mindestens ein kritischer Nutzerfluss auf Reibung analysiert
- [ ] Kognitive Last bewertet
- [ ] Formular-Usability ausgewertet
- [ ] Befunde nach Schweregrad priorisiert mit umsetzbaren Empfehlungen

## Haeufige Stolperfallen

- **UX mit visuellem Design verwechseln**: UX handelt davon, wie es funktioniert; visuelles Design davon, wie es aussieht. Eine schoene Oberflaeche kann eine schreckliche UX haben. Beides bewerten, aber unterscheiden.
- **Nur den gluecklichen Pfad testen**: Fehler-, Leer- und Ladezustaende sowie Grenzfaelle verbergen UX-Probleme.
- **Echte Geraete ignorieren**: Der responsive Modus der Browser-Entwicklertools ist ein Ersatz. Das Testen auf echten Geraeten deckt Touch-, Leistungs- und Viewport-Probleme auf.
- **Zugaenglichkeit als Nachgedanke**: Spaet gefundene Zugaenglichkeitsprobleme sind teuer zu beheben. Fruehzeitig und kontinuierlich bewerten.
- **Persoenliche Praeferenz als UX-Feedback**: "Ich wuerde lieber..." ist kein UX-Feedback. Heuristiken, Forschung oder etablierte Muster zitieren.

## Verwandte Skills

- `review-web-design` — visuelles Design-Review (Layout, Typografie, Farbe — ergaenzend zu UX)
- `scaffold-nextjs-app` — Next.js-Anwendungs-Scaffolding
- `setup-tailwind-typescript` — Tailwind CSS fuer Design-System-Implementierung
