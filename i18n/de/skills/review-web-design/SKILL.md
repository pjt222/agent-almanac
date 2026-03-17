---
name: review-web-design
description: >
  Bewertet Webdesign auf Layoutqualitaet, Typografie, Farbverwendung, Abstaende,
  Responsive-Verhalten, Markenkonsistenz und visuelle Hierarchie. Umfasst die
  Bewertung von Gestaltungsprinzipien und Verbesserungsempfehlungen. Verwenden
  beim Review eines Design-Mockups vor der Entwicklung, bei der Einschaetzung
  einer implementierten Website auf Designqualitaet, beim Feedback waehrend
  einer Design-Review-Sitzung, bei der Bewertung der Markenkonsistenz oder beim
  Pruefen des Responsive-Verhaltens ueber Breakpoints.
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
  complexity: intermediate
  language: multi
  tags: web-design, layout, typography, colour, responsive, visual-hierarchy, branding
---

# Webdesign reviewen

Ein Webdesign auf visuelle Qualitaet, Konsistenz und Effektivitaet auf verschiedenen Geraeten bewerten.

## Wann verwenden

- Review eines Design-Mockups oder Prototyps vor der Entwicklung
- Einschaetzung einer implementierten Website oder Webanwendung auf Designqualitaet
- Feedback zum visuellen Design waehrend einer Design-Review-Sitzung
- Bewertung der Markenkonsistenz ueber mehrere Seiten oder Abschnitte
- Pruefen des Responsive-Design-Verhaltens ueber Breakpoints

## Eingaben

- **Erforderlich**: Zu reviewendes Design (URL, Mockup-Dateien, Screenshots oder Quellcode)
- **Optional**: Markenrichtlinien oder Design-System-Dokumentation
- **Optional**: Beschreibung der Zielgruppe
- **Optional**: Referenzdesigns oder Konkurrenzbeispiele
- **Optional**: Spezifische Problembereiche

## Vorgehensweise

### Schritt 1: Visuelle Hierarchie bewerten

Visuelle Hierarchie fuehrt das Auge des Nutzers durch Inhalte nach Wichtigkeit.

- [ ] **Klarer Blickfang**: Gibt es auf jeder Seite/jedem Bildschirm einen offensichtlichen Einstiegspunkt?
- [ ] **Ueberschriften-Hierarchie**: Folgen Ueberschriften logisch absteigend (H1 → H2 → H3)?
- [ ] **Groesskkontrast**: Sind wichtige Elemente groesser als unterstuetzende Elemente?
- [ ] **Farbkontrast**: Sind CTAs und wichtige Aktionen visuell hervorgehoben?
- [ ] **Weissraum**: Trennt der Abstand logische Gruppen effektiv?
- [ ] **Lesefluss**: Folgt das Layout einem natuerlichen Lesemuster (F-Muster, Z-Muster)?

```markdown
## Visuelle-Hierarchie-Bewertung
| Seite/Abschnitt | Blickfang | Hierarchie klar? | Probleme |
|-------------|-------------|-----------------|--------|
| Startseite | Hero-Abschnitt CTA | Ja | Sekundaerer CTA konkurriert mit primaarem |
| Produktseite | Produktbild | Groesstenteils | Preis nicht prominent genug |
| Kontaktformular | Absenden-Button | Nein | Formulartitel gleich gross wie Fliesstext |
```

**Erwartet:** Jede wesentliche Seite/jeder Abschnitt auf klare visuelle Hierarchie bewertet.
**Bei Fehler:** Wenn Mockups nicht verfuegbar sind, anhand von Live-Code mit Browser-Entwicklertools bewerten.

### Schritt 2: Typografie bewerten

- [ ] **Schriftauswahl**: Sind Schriften fuer Marke und Inhaltstyp geeignet?
- [ ] **Schriftpaarung**: Ergaenzen sich Ueberschriften- und Fliesstext-Schriften (max. 2-3 Familien)?
- [ ] **Typo-Skala**: Gibt es eine konsistente Skala (z. B. 1,25 Major Second, 1,333 Perfect Fourth)?
- [ ] **Zeilenhoehe**: Fliesstext hat 1,4–1,6 Zeilenhoehe; Ueberschriften haben 1,1–1,3
- [ ] **Zeilenlaenge**: Fliesstextzeilenlaenge betraegt 45–75 Zeichen (optimal ~66)
- [ ] **Schriftstaerke**: Staerkevariationen werden konsistent zur Anzeige von Hierarchie verwendet
- [ ] **Schriftgroesse**: Basis-Schriftgroesse betraegt mindestens 16px fuer Fliesstext

```css
/* Beispiel gut strukturierte Typoskala (Verhaeltnis 1,25) */
:root {
  --text-xs: 0.64rem;    /* 10.24px */
  --text-sm: 0.8rem;     /* 12.8px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.563rem;   /* 25px */
  --text-2xl: 1.953rem;  /* 31.25px */
  --text-3xl: 2.441rem;  /* 39.06px */
}
```

**Erwartet:** Typografie auf Konsistenz, Lesbarkeit und Hierarchie bewertet.
**Bei Fehler:** Wenn das Design mehr als 3 Schriftfamilien verwendet, Konsolidierung empfehlen.

### Schritt 3: Farbverwendung reviewen

- [ ] **Palettenkohaerenz**: Ist die Farbpalette bewusst und begrenzt (typischerweise 3-5 Farben + Neutraltoeone)?
- [ ] **Markenausrichtung**: Stimmen Farben mit den Markenrichtlinien ueberein?
- [ ] **Kontrastverhaeltnisse**: Text erfuellt WCAG AA (4,5:1 fuer normalen Text, 3:1 fuer grossen Text)
- [ ] **Semantische Farbe**: Werden Farben konsistent fuer Bedeutungen verwendet (Rot=Fehler, Gruen=Erfolg)?
- [ ] **Farbenblindheit**: Wird Information nicht ausschliesslich durch Farbe uebermittelt?
- [ ] **Dunkel-/Hellmodus**: Wenn unterstuetzt, behalten beide Modi Lesbarkeit und Markenkonsistenz bei

```markdown
## Farbbewertung
| Verwendung | Farbe | Kontrastverhaeltnis | WCAG AA | Anmerkungen |
|-------|--------|----------------|---------|-------|
| Fliesstext auf Weiss | #333333 | 12,6:1 | Bestanden | Gut |
| Linktext auf Weiss | #2563eb | 5,2:1 | Bestanden | Gut |
| Gedaempfter Text auf Hellgrau | #9ca3af auf #f3f4f6 | 2,1:1 | NICHT BESTANDEN | Kontrast erhoehen |
| CTA-Schaltflaeche Text | #ffffff auf #22c55e | 3,1:1 | NICHT BESTANDEN fuer kleinen Text | Dunkleres Gruen oder groesseren Text verwenden |
```

**Erwartet:** Farbpalette auf Kohaerenz, Zugaenglichkeit und semantische Konsistenz reviewt.
**Bei Fehler:** Kontrastpruef-Tool (WebAIM) fuer exakte Verhaeltnisse verwenden.

### Schritt 4: Layout und Abstaende bewerten

- [ ] **Rastersystem**: Wird ein konsistentes Raster verwendet (12-Spalten, Auto-Layout oder benutzerdefiniert)?
- [ ] **Abstandsskala**: Sind Abstaende systematisch (4px/8px Basis oder Tailwind-aehnliche Skala)?
- [ ] **Ausrichtung**: Sind Elemente am Raster ausgerichtet (keine "fast ausgerichteten" Elemente)?
- [ ] **Dichte**: Ist die Informationsdichte fuer den Inhaltstyp angemessen (datenlastig vs. Marketing)?
- [ ] **Weissraum**: Wird Weissraum bewusst zum Gruppieren und Trennen eingesetzt?
- [ ] **Konsistenz**: Sind aehnliche Abschnitte identisch beabstandet?

Abstandsaudit:

```markdown
## Abstands-Konsistenz-Prüfung
| Elementpaar | Erwarteter Abstand | Tatsaechlicher Abstand | Konsistent? |
|-------------|-------------|------------|-------------|
| Abschnittstitel bis Inhalt | 24px | 24px | Ja |
| Karte zu Karte | 16px | 16px/24px | Nein — inkonsistent |
| Formular-Label bis Eingabe | 8px | 4px/8px/12px | Nein — variiert |
```

**Erwartet:** Layout verwendet ein systematisches Raster und eine Abstandsskala konsistent.
**Bei Fehler:** Wenn Abstaende inkonsistent sind, Einfuehrung einer Abstandsskala empfehlen (z. B. Tailwinds `space-*`).

### Schritt 5: Responsive Design bewerten

Ueber wichtige Breakpoints testen:

| Breakpoint | Breite | Repraesentiert |
|-----------|-------|-----------|
| Mobil | 375px | iPhone SE / kleine Smartphones |
| Mobil L | 428px | iPhone 14 / grosse Smartphones |
| Tablet | 768px | iPad Hochformat |
| Desktop | 1280px | Standard-Laptop |
| Breit | 1536px+ | Desktop-Monitor |

An jedem Breakpoint pruefen:
- [ ] **Layout-Anpassung**: Fliesst das Layout angemessen um (gestapelt auf Mobil, nebeneinander auf Desktop)?
- [ ] **Touch-Ziele**: Sind interaktive Elemente auf Mobil mindestens 44x44px gross?
- [ ] **Textlesbarkeit**: Ist die Schriftgroesse fuer den Viewport geeignet?
- [ ] **Bildskalierung**: Skalieren Bilder ohne Verzerrung oder Ueberlauf?
- [ ] **Navigation**: Ist die mobile Navigation zugaenglich (Hamburger-Menu, Bottom-Nav usw.)?
- [ ] **Kein horizontales Scrollen**: Inhalte ueberlaufen den Viewport nicht horizontal

```markdown
## Responsive-Review
| Breakpoint | Layout | Touch-Ziele | Text | Bilder | Navigation | Probleme |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Ueberlauf im Hero | Hamburger | Hero-Bild wird abgeschnitten |
| 768px | OK | OK | OK | OK | Hamburger | Keine |
| 1280px | OK | N/A | OK | OK | Volle Navigation | Keine |
| 1536px | OK | N/A | Zeilenlaenge zu gross | OK | Volle Navigation | max-width zum Inhalt hinzufuegen |
```

**Erwartet:** Design an allen wichtigen Breakpoints getestet mit dokumentierten Problemen.
**Bei Fehler:** Wenn Responsive-Testing-Tools nicht verfuegbar sind, CSS-Media-Queries auf Abdeckung ueberpruefen.

### Schritt 6: Markenkonsistenz pruefen

- [ ] **Logo-Verwendung**: Logo korrekt dargestellt (Groesse, Abstand, Schutzzone)
- [ ] **Farbgenauigkeit**: Markenfarben stimmen mit Vorgaben ueberein (Hex-Werte, nicht "nah genug")
- [ ] **Typografie-Uebereinstimmung**: Schriften entsprechen den Markenrichtlinien
- [ ] **Ton/Stimme**: UI-Texte passen zur Markenpersoenlichkeit
- [ ] **Ikonografie**: Icons stammen aus einem konsistenten Set (Stil, Staerke, Raster)
- [ ] **Fotografie-Stil**: Bilder entsprechen den Markenrichtlinien (falls zutreffend)

**Erwartet:** Markenelemente gegen Richtlinien verifiziert mit spezifisch vermerkten Abweichungen.
**Bei Fehler:** Wenn keine Markenrichtlinien vorhanden sind, dies als Empfehlung vermerken und stattdessen interne Konsistenz bewerten.

### Schritt 7: Den Design-Review verfassen

```markdown
## Webdesign-Review

### Gesamteindruck
[2-3 Saetze: Gesamtqualitaet, staerkste und schwaechste Aspekte]

### Visuelle Hierarchie: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Typografie: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Farbe: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Layout & Abstaende: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Responsive Design: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Markenkonsistenz: [Bewertung/5]
[Wichtigste Befunde mit spezifischen Referenzen]

### Prioritaere Verbesserungen
1. [Wirkungsvollste Aenderung — spezifisch und umsetzbar]
2. [Zweite Prioritaet]
3. [Dritte Prioritaet]

### Positive Anmerkungen
1. [Was gut funktioniert und erhalten werden sollte]
```

**Erwartet:** Review liefert spezifisches, visuell referenziertes Feedback mit priorisierten Verbesserungen.
**Bei Fehler:** Wenn Bewertungen beliebig erscheinen, stattdessen ein einfacheres Bestanden/Bedenken/Nicht-bestanden-System verwenden.

## Validierung

- [ ] Visuelle Hierarchie fuer alle wesentlichen Seiten/Abschnitte bewertet
- [ ] Typografie auf Lesbarkeit, Konsistenz und Skala geprueft
- [ ] Farbkontrast gegen WCAG-AA-Mindestwerte verifiziert
- [ ] Layout und Abstaende auf Rasterkonsistenz geprueft
- [ ] Responsive Design an mindestens 3 Breakpoints getestet
- [ ] Markenkonsistenz gegen Richtlinien verifiziert (oder interne Konsistenz bewertet)
- [ ] Feedback ist spezifisch mit visuellen Referenzen (Seite, Abschnitt, Element)

## Haeufige Stolperfallen

- **Subjektiv ohne Begruendung**: "Ich mag die Farbe nicht" ist nicht umsetzbar. Erklaeren warum (Kontrast, Markendiskrepanz, Zugaenglichkeit).
- **Zugaenglichkeit ignorieren**: Visuelles Design-Review muss WCAG-Kontrastpruefungen enthalten. Schoene Designs, die Nutzer ausschliessen, sind keine guten Designs.
- **Nur Mockups reviewen**: Responsive-Verhalten, Hover-Zustaende und Uebergaenge testen — nicht nur statische Layouts.
- **Loesungen vorschreiben**: Das Problem beschreiben ("Text ist auf diesem Hintergrund schwer lesbar") statt eine bestimmte Loesung vorzuschreiben ("Verwende #333").
- **Kontext vergessen**: Eine Banken-App und eine Gaming-Site haben unterschiedliche Designstandards. Gegen den angemessenen Kontext reviewen.

## Verwandte Skills

- `review-ux-ui` — Usability-, Interaktionsmuster- und Zugaenglichkeitsreview (ergaenzend zum visuellen Design)
- `setup-tailwind-typescript` — Tailwind CSS Implementierung fuer Design-Systeme
- `scaffold-nextjs-app` — Next.js-Anwendungs-Scaffolding
