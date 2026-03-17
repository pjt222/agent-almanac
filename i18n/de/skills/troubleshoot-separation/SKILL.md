---
name: troubleshoot-separation
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Chromatographische Trennprobleme systematisch diagnostizieren und loesen:
  Symptome dokumentieren, Grundursachen fuer Peakform- und Retentionsanomalien
  identifizieren, Matrixeffekte evaluieren und gezielte Korrekturen mit einem
  Eine-Variable-nach-der-anderen-Ansatz fuer GC- und HPLC-Systeme umsetzen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, troubleshooting, peak-shape, resolution, matrix-effects
---

# Chromatographische Trennung fehlersuchen

Systematische Diagnose und Loesung von GC- und HPLC-Trennproblemen umfassend Symptomdokumentation, Peakformdiagnose, Untersuchung von Retentionsanomalien, Evaluierung von Matrixeffekten und verifizierte Korrekturmassnahmen mit kontrollierten Einzel-Variablen-Aenderungen.

## Wann verwenden

- Peaks tailen, fronten, spalten oder sind breiter als erwartet
- Retentionszeiten haben sich verschoben oder sind nicht reproduzierbar
- Aufloesung zwischen kritischen Paaren hat sich verschlechtert
- Basisliniendrift, Geisterpeaks oder negative Peaks sind aufgetreten
- Empfindlichkeit ist gesunken oder Signal-Rausch-Verhaeltnis hat sich verschlechtert
- Eine zuvor funktionierende Methode besteht die Systemeignung nicht mehr

## Eingaben

### Erforderlich

- **Problemchromatogramm**: Aktuelle Daten die das Problem zeigen
- **Referenzchromatogramm**: Aktuelles gutes Chromatogramm derselben Methode zum Vergleich
- **Methodenbedingungen**: Saeule, mobile Phase/Traegergas, Temperatur/Gradient, Detektor, Flussrate
- **Systemprotokoll**: Kuerzliche Wartung, Saeulenwechsel, Mobil-Phasen-Herstellungen, Geraeteereignisse

### Optional

- **Blindchromatogramm**: Juengste Blind- oder Solvens-Injektion
- **Systemeignungstrenddaten**: Historische Werte fuer Tailing, Aufloesung, Boeden, Retentionszeit
- **Saeulenhistorie**: Anzahl Injektionen, Probentypen, Alter der Saeule
- **Geraetewartungsprotokoll**: Pumpendichtungswechsel, Lampenstunden, Detektor-Servicedaten

## Vorgehensweise

### Schritt 1: Das Problem dokumentieren

1. Das Symptom praezise beschreiben: welche Peaks sind betroffen, wie unterscheiden sie sich vom Referenzchromatogramm.
2. Bestimmen wann das Problem begonnen hat: allmaehliche Verschlechterung oder ploetzliches Auftreten.
3. Festhalten ob das Problem alle Peaks oder nur bestimmte betrifft.
4. Vermerken ob das Problem in Standards, Proben oder beiden auftritt.
5. Aktuelle Systemeignungsdaten sammeln und mit historischen Trends vergleichen.
6. Das Problemchromatogramm neben dem Referenzchromatogramm fuer Seite-an-Seite-Vergleich dokumentieren.

**Erwartet:** Eine dokumentierte Problembeschreibung mit Zeitlinie, Umfang (alle Peaks vs. bestimmte, Standards vs. Proben) und Vergleich mit Referenzdaten.

**Bei Fehler:** Wenn kein Referenzchromatogramm verfuegbar ist, eine frische Standardzubereitung unter den dokumentierten Methodenbedingungen injizieren um eine aktuelle Ausgangslage vor der Fehlersuche zu erstellen.

### Schritt 2: Peakformprobleme diagnostizieren

Die Symptomtabelle zur Identifikation wahrscheinlicher Grundursachen verwenden.

| Symptom | Moegliche Ursachen | Loesungen |
|---------|-------------------|-----------|
| **Tailing** (T > 1.5) | Sekundaerwechselwirkungen, Totvolumen in Verschraubungen, kontaminierte Saeulenfritte | Aminmodifizierer hinzufuegen (HPLC), Liner desaktivieren (GC), Fritte ersetzen, Injektionsmasse reduzieren |
| **Fronting** (T < 0.8) | Saeulenueberladung, Fehlanpassung zwischen Probensolvens und mobiler Phase | Injektionsvolumen oder -konzentration reduzieren, in schwaecerem Solvens verduennen |
| **Gespaltene/Doppelpeaks** | Teilweise blockierte Fritte, Hohlraum am Saeulenkopf, zwei polymorphe Formen | Fritte ersetzen, Saeulenkopf neu packen, Probenstabilitaet verifizieren |
| **Breite Peaks (alle)** | Extrasaeulare Bandverbreiterung, falscher Rohrdurchmesser, alte Saeule | Post-Saeulen-Rohrlänge und -durchmesser minimieren, Saeule ersetzen |
| **Breite Peaks (frueh)** | Schlechte Fokussierung am Saeulenkopf, zu starkes Injektionssolvens (HPLC) | Schwaecheres Injektionssolvens verwenden, Injektionsvolumen reduzieren |
| **Breite Peaks (spaet)** | Saeulendiffusion, Temperatur zu niedrig (GC), Gradient nicht steil genug (HPLC) | Endtemperatur erhoehen, Gradienten steiler machen |
| **Negative Peaks** | Brechungsindex/Absorbanz des Probensolvens unterscheidet sich von mobiler Phase | Probensolvens an mobile Phase angleichen, andere Detektionswellenlaenge verwenden |
| **Geisterpeaks** | Verschleppung, kontaminierte mobile Phase, Saeulenbluten, Septumbluten (GC) | Blindlauf zur Bestaetigung, Injektionssystem reinigen/ersetzen, mobile Phase filtern/entgasen |
| **Basisliniendrift** | Saeulenbluten (GC bei hoher Temp.), Gradientenbasislinie (HPLC), Lampeninstabilitaet | Maximaltemp. reduzieren, Low-Bleed-Saeule verwenden, Lampe ersetzen |
| **Basislinienrauschen** | Elektrische Stoerung, Pumpenpulsation, Luftblasen im Detektor | Instrument erden, Pumpendichtungen ersetzen, mobile Phase entgasen |

1. Beobachtete Symptome der obigen Tabelle zuordnen.
2. Die Ursachenliste einengen indem geprueft wird ob das Problem alle oder nur bestimmte Peaks betrifft und ob es ploetzlich oder allmaehlich auftrat.
3. Die wahrscheinlichste Ursache basierend auf der Systemhistorie priorisieren.

**Erwartet:** Ein oder zwei wahrscheinlichste Grundursachen identifiziert aus der Symptom-Ursachen-Zuordnung, priorisiert nach Systemhistorie.

**Bei Fehler:** Wenn das Symptom keiner Zeile in der Tabelle entspricht oder mehrere Symptome gleichzeitig vorliegen, koennte das Problem zusammengesetzt sein. Das offensichtlichste Problem zuerst angehen, dann erneut bewerten.

### Schritt 3: Retentionszeitprobleme diagnostizieren

| Symptom | Moegliche Ursachen | Loesungen |
|---------|-------------------|-----------|
| **Alle Peaks frueher** | Erhoehte Flussrate, hoehere Saeulentemperatur, staerkere mobile Phase | Flussrateneinstellung pruefen, Temperatur verifizieren, mobile Phase neu herstellen |
| **Alle Peaks spaeter** | Verringerte Flussrate, niedrigere Temperatur, schwaechere mobile Phase | Auf Leckagen pruefen, Temperatur verifizieren, Inline-Filter pruefen |
| **Retentionszeitdrift** | Saeulendegradation, Verdunstung der mobilen Phase, Temperaturschwankung | Saeule ersetzen, Reservoir abdichten, Ofen stabilisieren |
| **Retentionszeit nicht reproduzierbar** | Leckage an Verschraubung, Rueckschlagventilfehlfunktion, ungenuegender Reequilibrierung | Verschraubungen druckpruefen, Rueckschlagventile ersetzen, Equilibriervolumen erhoehen |
| **Retention verloren (k' nahe 0)** | Phasenkollaps (RP bei hohem Wasseranteil), falsche mobile Phase | Polar-Embedded- oder AQ-Typ-Saeule verwenden, Saeule mit Organik rewetten |
| **Koelution (zuvor getrennt)** | Saeulenselektivitaet verloren, Zusammensetzung der mobilen Phase geaendert | Saeule ersetzen, Herstellung der mobilen Phase verifizieren |

1. Bestimmen ob Retentionsverschiebungen einheitlich (alle Peaks) oder selektiv (bestimmte Peaks) sind.
2. Einheitliche Verschiebungen weisen auf systematische Ursachen hin.
3. Selektive Verschiebungen weisen auf Saeulenchemieuenderungen hin.
4. Die Instrumentendruckkurve pruefen: ploetzliche Druckaenderungen weisen auf Leckagen oder Verstopfungen hin.
5. Den Referenzstandard erneut injizieren um zu bestaetigen ob das Problem im System oder der Probe liegt.

**Erwartet:** Grundursache der Retentionsanomalie identifiziert und als systematisch oder saeulenbedingt kategorisiert.

**Bei Fehler:** Wenn Neuinjektion des Standards auf einer neuen Saeule das Problem loest, ist die urspruengliche Saeule das Problem. Wenn das Problem auf einer neuen Saeule fortbesteht, liegt die Ursache stromaufwaerts.

### Schritt 4: Matrixeffekte evaluieren

1. Standard- und Probenchromatogramm vergleichen: zusaetzliche Peaks, erhoehte Basislinie, veraenderte Peakformen.
2. Fuer LC-MS Ionensuppression/-verstaerkung evaluieren: Post-Saeulen-Infusionstest durchfuehren.
3. Auf Saeulenkontamination pruefen: Solvensblinds nach einer Probensequenz injizieren.
4. Probenvorbereitung bewerten: verschmutzte Injektornadel, ungenuegender Probencleanup.
5. Fuer GC: auf Aufbau nichtfluechtiger Rueckstaende im Einlassliner pruefen.

**Erwartet:** Matrixeffekte charakterisiert mit umsetzbaren Empfehlungen.

**Bei Fehler:** Wenn Matrixeffekte mit verfuegbaren Daten nicht adaequat charakterisiert werden koennen, eine matrixangepasste Kalibrierungskurve erstellen und Steigungen vergleichen.

### Schritt 5: Korrektur umsetzen und verifizieren

1. Nur eine Variable nach der anderen aendern. Dokumentieren was geaendert wurde und warum.
2. Nach jeder Aenderung den Systemeignungsstandard erneut injizieren und mit dem Referenzchromatogramm vergleichen.
3. Reihenfolge der zu versuchenden Aenderungen (von am wenigsten bis am staerksten stoerend):
   - Frische mobile Phase herstellen / Traegergas-Flasche wechseln
   - Verbrauchsmaterialien ersetzen (Septum, Liner, Fritte, Inline-Filter, Lampe)
   - Verschraubungen und Rohrleitungen anziehen oder ersetzen
   - Saeule spuelen/regenerieren
   - Methodenparameter anpassen (Temperatur, Fluss, Gradient, pH)
   - Saeule ersetzen
   - Instrument warten (Pumpendichtungen, Rueckschlagventile, Detektor)
4. Sobald die Korrektur identifiziert ist, den vollstaendigen Systemeignungstest (n >= 5 Injektionen) ausfuehren.
5. Alle Parameter mit historischer Spezifikation vergleichen.
6. Grundursache, Korrekturmassnahme und Verifikationsergebnisse im Geraete-/Saeulenlogbuch dokumentieren.
7. Wenn dasselbe Problem erneut auftritt, einen praeventiven Wartungsplan erstellen.

**Erwartet:** Problem geloest mit auf Spezifikation wiederhergestellten Systemeignungsparametern. Grundursache, Korrekturmassnahme und Verifikation dokumentiert.

**Bei Fehler:** Wenn alle Einzel-Variablen-Aenderungen das Problem nicht loesen, koennten mehrere gleichzeitige Ausfaelle vorliegen. Alle Verbrauchsmaterialien und die Saeule zusammen ersetzen, mit frischem Standard verifizieren und die Fehlersuche von der neuen Ausgangslage neu aufbauen.

## Validierung

- [ ] Problem dokumentiert mit Symptomdeschreibung, Zeitlinie und Umfang
- [ ] Grundursache unter Verwendung der Symptom-Ursachen-Zuordnungstabellen identifiziert
- [ ] Nur eine Variable nach der anderen waehrend der Fehlersuche geaendert
- [ ] Korrektur durch Systemeignungstest (n >= 5 Replikat-Injektionen) verifiziert
- [ ] Alle Systemeignungsparameter innerhalb der Spezifikation wiederhergestellt
- [ ] Grundursache und Korrekturmassnahme im Logbuch dokumentiert
- [ ] Praeventive Massnahme zur Vermeidung von Wiederauftreten identifiziert

## Haeufige Stolperfallen

- **Mehrere Variablen gleichzeitig aendern**: Macht die Identifikation der tatsaechlichen Grundursache unmoeglich. Immer eine Sache aendern, testen, dann entscheiden ob eine weitere geaendert werden soll.
- **Saeulenersatz als erster Schritt**: Saeulenersatz ist teuer und kann das echte Problem verdecken. Einfachere Moeglichkeiten zuerst ausschoepfen.
- **Das Geraetelogbuch ignorieren**: Viele Probleme lassen sich auf ein kuerzliches Wartungsereignis oder einen Wechsel der mobilen Phase zurueckfuehren. Immer pruefen was sich kuerzlich geaendert hat.
- **Die Probe ohne Beleg beschuldigen**: Zuerst den Referenzstandard ausfuehren. Wenn der Standard das Problem auch zeigt, liegt es im System, nicht in der Probe.
- **Saeule mit inkompatiblen Solvenzien spuelen**: Nie eine RP-Saeule mit reinem Wasser spuelen (verursacht Phasenkollaps). Dem Waschprotokoll des Herstellers folgen.
- **Nicht dokumentieren was versucht wurde**: Gescheiterte Fehlersuche-Versuche sind wertvolle Information. Jede versuchte Aenderung und ihr Ergebnis festhalten.

## Verwandte Skills

- `interpret-chromatogram` -- Verstaendnis der chromatographischen Daten die Trennprobleme aufdecken
- `develop-gc-method` -- GC-Methodenentwicklung, relevant wenn Fehlersuche Methoden-Neudesign erfordert
- `develop-hplc-method` -- HPLC-Methodenentwicklung, relevant wenn Fehlersuche Methoden-Neudesign erfordert
- `validate-analytical-method` -- Revalidierung kann nach erheblichen Methodenaenderungen waehrend der Fehlersuche erforderlich sein
