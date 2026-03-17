---
name: interpret-chromatogram
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Ein Chromatogramm aus GC- oder HPLC-Analyse interpretieren: Systemeignungsparameter
  verifizieren, Peaks anhand von Retentionszeit und Spektrenabgleich identifizieren,
  genaue Peakintegration durchfuehren, chromatographische Kenngroessen berechnen
  und die Gesamtpeakqualitaet fuer zuverlaessige Quantifizierung bewerten.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, peak-analysis, resolution, integration, system-suitability
---

# Chromatogramm interpretieren

Systematische Interpretation von GC- und HPLC-Chromatogrammen umfassend Systemeignungsverifikation, Peakidentifikation, Integration, Berechnung chromatographischer Parameter und Bewertung der Peakqualitaet fuer zuverlaessige qualitative und quantitative Ergebnisse.

## Wann verwenden

- Chromatographische Daten vor der Ergebnisberichterstattung ueberpruefen
- Verifizieren dass ein Systemeignungstest besteht bevor eine Probensequenz ausgefuehrt wird
- Unbekannte Peaks identifizieren oder bekannte Analyten durch Retentionszeit oder Spektrendaten bestaetigen
- Unerwartete Peaks, Basislinienanomalien oder Integrationsartefakte untersuchen
- Analysten in der Interpretation chromatographischer Daten schulen

## Eingaben

### Erforderlich

- **Chromatogrammdaten**: Digitales oder gedrucktes Chromatogramm mit Zeitachse und Detektorantwortachse
- **Referenzstandarddaten**: Retentionszeiten und Detektorantworten bekannter Analyten unter denselben Methodenbedingungen
- **Methodenparameter**: Saeule, mobile Phase/Traegergas, Temperatur-/Gradientenprogramm, Detektoreinstellungen

### Optional

- **Spektrendaten**: UV-Vis-Spektren (DAD), Massenspektren (MS) oder andere Spektralinformation zur Peakbestaetigung
- **Fruehere Chromatogramme**: Historische Daten derselben Methode fuer Trendvergleich
- **Systemeignungskriterien**: Akzeptanzgrenzen aus der Methode oder dem regulatorischen Standard
- **Probenvorbereitungsdetails**: Verduennungsfaktoren, Extraktionsausbeute, Interne-Standard-Konzentration

## Vorgehensweise

### Schritt 1: Systemeignung verifizieren

Bestaetigen dass das chromatographische System innerhalb der Spezifikation arbeitet bevor Probendaten interpretiert werden.

| Parameter | Typische Spezifikation | Berechnung |
|-----------|----------------------|------------|
| Retentionszeit-RSD | <= 1.0% | RSD von tR ueber n >= 5 Injektionen |
| Peakflaechen-RSD | <= 2.0% (Gehalt), <= 5.0% (Verunreinigung) | RSD der Flaeche ueber n >= 5 Injektionen |
| Tailingfaktor (T) | 0.8-2.0 (USP), ideal 0.9-1.2 | T = W0.05 / (2 * f) |
| Aufloesung (Rs) | >= 1.5 (Basislinie), >= 2.0 (reguliert) | Rs = 2(tR2 - tR1) / (w1 + w2) |
| Theoretische Boeden (N) | Gemaess Saeulenspezifikation | N = 16(tR / w)^2 oder N = 5.54(tR / w0.5)^2 |
| Kapazitaetsfaktor (k') | 2.0-10.0 fuer primaeren Analyten | k' = (tR - t0) / t0 |

1. Die Systemeignungsinjektionen finden (typischerweise 5-6 Replikate eines Referenzstandards zu Beginn der Sequenz).
2. Jeden Parameter aus der obigen Tabelle berechnen.
3. Berechnete Werte mit den Akzeptanzkriterien der Methode vergleichen.
4. Wenn ein Parameter versagt, ist das System nicht geeignet -- nicht mit der Probeninterpretation fortfahren bis das Problem behoben ist.
5. Alle Systemeignungsergebnisse im Chargenprotokoll dokumentieren.

**Erwartet:** Alle Systemeignungsparameter innerhalb der Spezifikation, was bestaetigt dass das System fuer den Zweck geeignet ist.

**Bei Fehler:** Wenn Retentionszeit-RSD versagt, auf Temperaturinstabilitaet, Fehler bei der Mobil-Phasen-Herstellung oder Saeulendegradation pruefen. Wenn der Tailingfaktor versagt, den Einlassliner (GC) oder die Saeulenfritte (HPLC) inspizieren.

### Schritt 2: Peaks identifizieren

1. Die Retentionszeit (tR) jedes Peaks mit dem Referenzstandard-Chromatogramm vergleichen.
   - Akzeptabler Retentionszeitabgleich: innerhalb +/- 2% der Referenz-tR.
2. Fuer mehrdeutige Identifikationen Ko-Injektion (Spiken) verwenden: Referenzstandard zur Probe hinzufuegen und erneut injizieren.
3. Fuer HPLC mit DAD: das UV-Vis-Spektrum jedes Peaks gegen eine Spektrenbibliothek vergleichen.
   - Spektrenabgleichindex >= 990 (von 1000) fuer positive Identifikation.
   - Spektrenreinheit ueber den Peak pruefen (Front-, Apex-, Endspektren sollten ueberlagern).
4. Fuer MS-ausgeruestete Systeme: Molekuelion (m/z) und Schluesselfragement-Ionen gegen Referenzspektren bestaetigen.
5. Jeden Peak kennzeichnen der nicht identifiziert werden kann -- als "unbekannt" mit Retentionszeit und relativer Antwort berichten.

**Erwartet:** Alle Zielanalyten durch Retentionszeitabgleich identifiziert, mit spektraler Bestaetigung wo verfuegbar. Unbekannte Peaks mit Retentionszeit und Flaeche gekennzeichnet.

**Bei Fehler:** Wenn Retentionszeiten sich einheitlich verschoben haben, ist eine systematische Aenderung aufgetreten. Den Referenzstandard erneut injizieren um aktuelle Retentionszeiten festzustellen.

### Schritt 3: Peakintegration durchfuehren

1. Integrationsmodus waehlen:
   - Automatische Integration mit Datensystem-Standardwerten als Ausgangspunkt
   - Manuelle Anpassung nur wenn automatische Integration nachweislich Basislinie oder Peakgrenzen falsch platziert
2. Integrationsparameter festlegen:
   - Basislinienerkennung (Steigungsempfindlichkeit / Schwellenwert)
   - Minimale Peakflaeche oder -hoehe zur Rauschunterdrueckung
   - Peakbreitenparameter passend zum schmalsten erwarteten Peak
3. Basislinienplatzierung verifizieren:
   - Basislinie sollte Anfang und Ende jedes Peaks an der wahren chromatographischen Basislinie verbinden
   - Fuer ueberlappende Peaks Tal-zu-Tal- oder Lotfuss-Methoden verwenden wie von der Methode spezifiziert
4. Auf Integrationsfehler pruefen: geteilte Peaks, zusammengefuehrte Schulterpeaks, integrierte Rauschspikes, durch den Peak gezogene Basislinie
5. Endgueltige Integrationsparameter und manuelle Anpassungen mit Begruendung im Audit Trail festhalten.

**Erwartet:** Alle Zielpeaks mit korrekter Basislinienplatzierung integriert, keine Artefakte eingeschlossen, alle manuellen Anpassungen dokumentiert.

**Bei Fehler:** Wenn der automatische Integrator eine bestimmte Peakform durchgehend falsch behandelt, eine zeitgesteuerte Integrationsmethode mit benutzerdefinierten Parametern fuer das Retentionsfenster erstellen. Nie manuell anpassen um ein gewuenschtes Ergebnis zu erzielen.

### Schritt 4: Chromatographische Parameter berechnen

Folgendes fuer alle berichteten Peaks berechnen:

1. **Aufloesung (Rs)** zwischen benachbarten Peaks: Rs = 2(tR2 - tR1) / (w1 + w2). Rs >= 1.5 zeigt Basisllientrennung an.
2. **Tailingfaktor (T)** bei 5% Peakhoehe: T = 1.0 ist perfekt symmetrisch; T > 2.0 zeigt signifikantes Tailing an.
3. **Theoretische Boeden (N)**: Hoeheres N bedeutet bessere Saeuleneffizienz.
4. **Kapazitaetsfaktor (k')**: Idealer Bereich 2-10 fuer gute Trennung mit vernuenftiger Laufzeit.
5. **Selektivitaetsfaktor (alpha)** zwischen kritischem Paar: alpha > 1.05 ist allgemein fuer adaequate Trennung noetig.
6. Ergebnisse fuer alle Analyten tabellarisieren und mit Methodenspezifikationen vergleichen.

**Erwartet:** Alle chromatographischen Parameter berechnet, tabellarisiert und mit Akzeptanzkriterien verglichen.

**Bei Fehler:** Wenn berechnete Boeden deutlich unter der Saeulenspezifikation liegen, koennte die Saeule degradiert sein -- mit frischem Standard testen und mit historischen Daten vergleichen.

### Schritt 5: Peakqualitaet bewerten

1. **Symmetrie**: Peaks sollten gaussfoermig oder nahezu gaussfoermig sein. Signifikantes Fronting deutet auf Saeulenueberlastung; Tailing auf Sekundaerwechselwirkungen hin.
2. **Basisllientrennung**: Fuer quantitative Arbeit muessen kritische Paare basisliniengetrennt sein.
3. **Peakbreitenkonsistenz**: Deutlich breitere Peaks als erwartet koennen auf Saeulendegradation oder extrasaeulare Bandverbreiterung hinweisen.
4. **Spektrale Reinheit** (DAD/MS): Wenn der Reinheitsindex spektrale Inhomogenitaet ueber den Peak anzeigt, ist eine koeluierende Verunreinigung wahrscheinlich.
5. **Negative Peaks oder Basislinistoerungen**: Negative Peaks im UV zeigen an dass das Probensolvens bei der Detektionswellenlaenge mehr absorbiert als die mobile Phase.
6. **Geisterpeaks**: Peaks in der Blindinjektion weisen auf Verschleppung, kontaminierte mobile Phase oder Saeulenbluten hin.
7. Gesamte chromatographische Qualitaet zusammenfassen und Einschraenkungen der berichteten Ergebnisse vermerken.

**Erwartet:** Peakqualitaet fuer alle Zielanalyten bewertet; Anomalien mit ihren potenziellen Auswirkungen auf die Datenqualitaet dokumentiert.

**Bei Fehler:** Wenn erhebliche Qualitaetsprobleme gefunden werden (koeluierende Verunreinigung durch spektrale Unreinheit bestaetigt, Geisterpeaks bei Analyt-Retentionszeiten), sind die Daten moeglicherweise nicht berichtbar. Ergebnisse kennzeichnen, Grundursache untersuchen und nach Korrekturmassnahme erneut analysieren.

## Validierung

- [ ] Systemeignungsparameter berechnet und innerhalb der Spezifikation
- [ ] Alle Zielanalyten durch Retentionszeit (+/- spektrale Bestaetigung) identifiziert
- [ ] Unbekannte Peaks mit Retentionszeit und Flaeche gekennzeichnet
- [ ] Integration mit korrekter Basislinienplatzierung durchgefuehrt; manuelle Anpassungen dokumentiert
- [ ] Aufloesung, Tailing, Boeden und Kapazitaetsfaktor fuer alle Peaks berechnet
- [ ] Peakqualitaet bewertet -- keine ungeloesten Koelutionen die die Quantifizierung beeintraechtigen
- [ ] Geisterpeaks und Verschleppung ueber Blindinjektion evaluiert
- [ ] Ergebnisse tabellarisiert und mit Methoden-Akzeptanzkriterien verglichen

## Haeufige Stolperfallen

- **Automatische Integration ohne Pruefung akzeptieren**: Datensysteme koennen Basislinien falsch platzieren, besonders bei Schultern und kleinen Peaks neben grossen. Jedes Chromatogramm muss visuell ueberprueft werden.
- **Retentionszeitverschiebung mit neuem Peak verwechseln**: Einheitliche Retentionszeitverschiebungen (alle Peaks verschieben sich gemeinsam) zeigen eine systematische Aenderung an, keine neuen Verbindungen.
- **Peaks unterhalb des Rauschniveaus berichten**: Peaks mit Signal-Rausch-Verhaeltnis unter 3 (Detektion) oder 10 (Quantifizierung) sollten nicht identifiziert oder quantifiziert werden.
- **Manuelle Integration zum Erreichen eines Zielergebnisses**: Integration anpassen um ein Ergebnis die Spezifikation bestehen zu lassen ist Datenfaelschung. Alle Integrationsaenderungen muessen wissenschaftlich begruendet und im Audit Trail festgehalten sein.
- **Spektrale Reinheitspruefungen vernachlaessigen**: Ein sauber aussehender Peak kann eine koeluierende Verunreinigung verbergen.

## Verwandte Skills

- `develop-gc-method` -- Methodenentwicklung fuer die GC-Technik die das Chromatogramm erzeugt
- `develop-hplc-method` -- Methodenentwicklung fuer die HPLC-Technik die das Chromatogramm erzeugt
- `troubleshoot-separation` -- Diagnose von Problemen die bei der Chromatogramminterpretation identifiziert wurden
- `validate-analytical-method` -- formale Validierung der Methode die die chromatographischen Daten erzeugt
- `interpret-mass-spectrum` -- detaillierte Interpretation von MS-Daten fuer GC-MS- und LC-MS-Peakbestaetigung
