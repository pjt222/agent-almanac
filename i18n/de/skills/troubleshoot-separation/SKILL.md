---
name: troubleshoot-separation
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Diagnostiziere und behebe chromatographische Trennprobleme in GC- und
  HPLC-Systemen systematisch. Erkenne Symptome wie Peaktailing, Peakverbreiterung,
  Retentionszeitverschiebungen, Druckprobleme und Basislinienstoerungen und
  fuehre diese auf zugrunde liegende Ursachen zurueck. Verwende diesen Skill
  bei schlechter Peakform, unerwarteter Retentionszeitverschiebung, abnormalen
  Systemdruckverhaltender Basislinienstoerung oder nachlassender Saeulleistung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, troubleshooting, peak-shape, system-pressure, column-performance
---

# Chromatographische Trennung optimieren

Diagnostiziere und behebe Trennprobleme in GC- und HPLC-Systemen durch systematische Ursachenanalyse der Symptome (Peakform, Druck, Retentionszeit, Basislinie) und gezielte Korrekturmassnahmen.

## Wann verwenden

- Peaktailing oder Peakverbreiterung ueber die Systemeignungsspezifikation hinaus
- Unerwartete Verschiebung oder Drift von Retentionszeiten
- Unerwarteter Druckanstieg oder -abfall im System
- Basislinienstoerungen (Rauschen, Drift, Spikes)
- Abnehmende Saeullenleistung (sinkende Bodenzahl) ueber die Zeit

## Eingaben

- **Erforderlich**: Beschreibung des beobachteten Problems (Symptom) und wann es erstmals aufgetreten ist
- **Erforderlich**: Aktuelle chromatographische Bedingungen (Saeule, Eluent, Fluss, Temperatur)
- **Optional**: Frueheres Referenz-Chromatogramm (wenn Methode frueher funktioniert hat)
- **Optional**: Systemdruckprotokoll der letzten Laeufe

## Vorgehensweise

### Schritt 1: Symptom prazise identifizieren und dokumentieren

Beschreibe das Problem genau, bevor Massnahmen ergriffen werden:

1. **Symptomkategorien**:
   - Peakformprobleme: Tailing, Fronting, Peakverbreiterung, Split-Peak, Schulter
   - Retentionszeitprobleme: Verschiebung, Drift, Irreproduzierbakeit
   - Druckprobleme: Anstieg, Abfall, Pulsation
   - Basislinienprobleme: Drift, Rauschen, Einbrueche, Ghostpeaks
   - Sensitivitaetsprobleme: Signalabnahme, Grundrauschen erhoehe
2. **Zeitlinie des Problems**: Wann trat das Problem erstmals auf? War es plotzlich oder graduell?
3. **Reproduzierbarkeit**: Tritt das Problem bei jedem Lauf auf, oder nur gelegentlich?
4. **Betroffene Peaks**: Alle Peaks betroffen oder nur bestimmte Analyten?

```markdown
## Problemdokumentation
- Symptom: [praezise Beschreibung]
- Erstauftreten: [Datum/Umstand]
- Betroffene Peaks: [alle/bestimmte Analyten]
- Reproduzierbarkeit: [immer/gelegentlich]
- Letzte Systemveraenderung: [neue Saeule/neuer Eluent/Wartung]
```

**Erwartet:** Klare Symptombeschreibung die als Grundlage fuer systematische Diagnose dient.

**Bei Fehler:** Falls das Problem nicht reproduzierbar ist, fuehre mehrere aufeinanderfolgende Laeufe durch um die Reproduzierbarkeit zu bewerten.

### Schritt 2: Ursachendiagnose durch Ausschlussverfahren

Grenze systematisch auf die wahrscheinlichste Ursache ein:

1. **Peaktailing-Diagnosen**:
   - Basische Verbindungen auf unkonditionierter Saeule: Saeure zum Eluenten hinzufuegen oder pH erhoehen
   - Tovolumen im System (HPLC): Kapillaren und Fittings pruefen; besonders bei UHPLC
   - Saeulenbeschaaedigung: Leere Stellen am Saeulenkopf oder Verstopfung
   - Nicht-optimaler pH: pKa des Analyten nahe dem Eluentenphe-Wert
2. **Druckanstieg-Diagnosen**:
   - Verstopfter Inline-Filter oder Vorsaeule: Filter ersetzen
   - Viskositaetsaenderung des Eluenten: Loesungsmittelzusammensetzung pruefen
   - Verstopfte Saeule (Partikulierter Kontaminant): Saeule ruckwaerts spuelen oder ersetzen
   - Zu hohe Flussrate: Systemdruck gegen Geraetespezifikation pruefen
3. **Retentionszeitdrift-Diagnosen**:
   - pH-Aenderung des Puffers: Puffer frisch ansetzen
   - Temperaturinstabilitaet: Saeulenofentemperatur pruefen
   - Saeulenkontamination: Saeule mit starkem Loesungsmittel spuelen
   - Beschaaedigung der stationaeren Phase: Saeule ersetzen

```markdown
## Diagnose-Matrix
| Symptom | Wahrscheinliche Ursache | Testmassnahme | Korrektur |
|---------|------------------------|---------------|-----------|
| [Symptom] | [Ursache 1] | [Test] | [Massnahme] |
| [Symptom] | [Ursache 2] | [Test] | [Massnahme] |
```

**Erwartet:** Diagnoseliste mit den zwei oder drei wahrscheinlichsten Ursachen und einem Pruefschema.

**Bei Fehler:** Falls keine der naheliegenden Ursachen zutrifft, arbeite den Flusspfad von der Pumpe bis zum Detektor systematisch ab (Pumpe, Injektor, Vorsaeule, Saeule, Detektor).

### Schritt 3: Einfache Massnahmen zuerst versuchen

Fuehre Massnahmen vom leichtesten zum aufwenidgsten durch:

1. **Zuerst pruefen**:
   - Eluent frisch ansetzen und filtrieren (Pufferkonzentration und pH pruefen)
   - Inline-Filter wechseln
   - Leerinjektion (Blank) zur Basisliniendiagnose
   - Systemspuelung mit starkem Loesungsmittel (100% MeOH oder ACN)
2. **Dann pruefen**:
   - Vorsaeule wechseln oder entfernen (Test ohne Vorsaeule)
   - Kapillaren auf Knicke oder Lecks pruefen
   - Pumpenmembran oder Ventile auf Verschleiss pruefen
3. **Letzter Schritt**:
   - Saeule wechseln (benoetigt nach vielen Laeufen oder Kontamination)
   - Detektorlampe oder Detektor-Durchflusszelle reinigen

**Erwartet:** Problem nach einer oder zwei Massnahmen behoben; falls nicht, systematisch weiter eingrenzen.

**Bei Fehler:** Falls keine der Massnahmen hilft, ist es ratsam den Systemdruck zu einem Referenzpunkt zu messen (z.B. ohne Saeule) um Hardware-Probleme von Saeulen-Problemen zu trennen.

### Schritt 4: Loesung implementieren und verifizieren

Setze die identifizierte Korrekturmassnahme um und bestaetige Erfolg:

1. **Massnahme protokollieren**: Welche Aenderung wurde vorgenommen? Wann? Von wem?
2. **Referenz-Chromatogramm erstellen**: Nach der Massnahme Referenz-Chromatogramm mit Standardloesung aufnehmen.
3. **Systemeignungstest**: Aufloesung, Tailing-Faktor, Bodenzahl und Retentionszeiten-Reproduzierbarkeit pruefen.
4. **Vergleich mit Originalzustand**: Problem geloest? Falls nicht, naechste Ursache eingrenzen.

**Erwartet:** Chromatogramm entspricht nach Korrektur den Systemeignungsspezifikationen.

**Bei Fehler:** Falls Problem nach mehreren Massnahmen nicht geloest, kontaktiere Saeulenhersteller oder Geraetesupport und dokumentiere alle Diagnoseschritte.

### Schritt 5: Praeventive Massnahmen und Dokumentation

Vermeide kuenftige Probleme durch praeventive Massnahmen:

1. **Wartungsintervalle festlegen**: Inline-Filter-Wechsel alle X Injektionen; Saeulenwechsel nach X Laeufen.
2. **Systemsaeuberungsroutine**: Taeglich End-of-day-Spuelung mit starkem Loesungsmittel.
3. **Monitoring einrichten**: Systemdruck und Retentionszeiten dokumentieren um fruehzeitig Trends zu erkennen.
4. **Problemdokumentation abschliessen**: Ursache, Loesung und Massnahmen dokumentieren fuer kuenftige Referenz.

**Erwartet:** Schriftliches Wartungsprotokoll und Leistungsmonitoring-System um wiederkehrende Probleme fruehzeitig zu erkennen.

## Validierung

- [ ] Symptom praezise dokumentiert
- [ ] Diagnose durch Ausschlussverfahren eingegrenzt
- [ ] Massnahmen vom einfachsten zum aufwendigsten abgearbeitet
- [ ] Systemeignungstest nach Korrektur erfolgreich
- [ ] Problem und Loesung dokumentiert
- [ ] Praeventive Massnahmen implementiert

## Haeufige Stolperfallen

- **Problem ohne Diagnose loesen**: Einfach die Saeule ersetzen ohne Ursachenanalyse fuehrt zu Wiederholung des Problems.
- **Mehrere Veraenderungen gleichzeitig**: Gleichzeitig Puffer, Saeule und Fluss zu aendern macht unklar, was das Problem verursacht hat.
- **Kontamination unterschaetzen**: Probenkontaminanten koennen Saeule und Inline-Filter irreversibel beschaedigen; Probenaufbereitung pruefen.
- **Zu spaet handeln**: Ansteigende Retentionszeiten oder Druckaenderungen fruehzeitig als Warnsignal erkennen.

## Verwandte Skills

- `develop-gc-method` -- GC-Methodenentwicklung
- `develop-hplc-method` -- HPLC-Methodenentwicklung
- `validate-analytical-method` -- Methodenvalidierung nach ICH
