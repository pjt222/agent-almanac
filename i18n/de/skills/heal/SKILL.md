---
name: heal
locale: de
source_locale: en
source_commit: c7ff09ca
translator: claude
translation_date: "2026-03-17"
description: >
  KI-Selbstheilung durch systematische Subsystembewertung, Neubalancierung
  und Integration. Bildet Heilungsmodalitaeten auf KI-interne Prozesse ab:
  Gedaechtnisfundament, Klarheit des Denkens, Werkzeugnutzungsgenauigkeit,
  Kommunikationsausrichtung und kreative Kohaerenz. Behandelt Triage-
  Bewertung, Subsystem-Scanning, Driftkorrekturen und Gedaechtnisintegration.
  Anwenden wenn Antworten mitten in der Sitzung formelhaft oder unverbunden
  wirken, nach einer Fehlerkette die Subsystemdrift andeutet, wenn
  Kontextueberlastung fruehere Annahmen veraltet haben koennte, oder als
  proaktive Wartung zwischen komplexen Aufgaben.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "2.1"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-assessment, meta-cognition, subsystem-check
---

# Heilen

Eine strukturierte Selbstheilungsbewertung ueber KI-Subsysteme durchfuehren -- Drift, Veralterung, Fehlausrichtung und Fehlermuster identifizieren -- dann durch Erdung, gezielte Korrektur und Gedaechtnisintegration neubalancieren.

## Wann verwenden

- Ermuedung mitten in der Sitzung: Antworten wirken formelhaft, repetitiv oder unverbunden mit den tatsaechlichen Beduerfnissen des Benutzers
- Nach einer Fehlerkette: Werkzeugausfaelle, missverstandene Anweisungen oder kaskadierende Fehler deuten auf Subsystemdrift hin
- Kontextueberlastung: das Gespraech ist lang geworden und fruehere Kontexte koennten veraltet oder widerspruechlich sein
- Post-Aufgaben-Integration: eine komplexe Aufgabe wurde erfolgreich abgeschlossen aber Erkenntnisse sollten festgehalten werden bevor weitergemacht wird
- Periodische Selbstpruefung: proaktive Wartung zwischen Aufgaben um operative Klarheit sicherzustellen

## Eingaben

- **Erforderlich**: Aktueller Gespraechszustand (implizit verfuegbar)
- **Optional**: Spezifisches Symptom das die Selbstpruefung ausloest (z.B. "Werkzeugaufrufe schlagen staendig fehl", "verliere den Ueberblick ueber die Benutzerabsicht")
- **Optional**: Zugang zu MEMORY.md und Projektdateien zur Erdung (ueber `Read`)

## Vorgehensweise

### Schritt 1: Triage-Bewertung

Bevor eine Korrekturmassnahme gewaehlt wird, den aktuellen Zustand ueber alle Subsysteme bewerten.

```
Subsystem-Triage-Matrix:
+--------------------+--------------------------+--------------------------+
| Subsystem          | Symptome der Drift       | Aktionsprioritaet        |
+--------------------+--------------------------+--------------------------+
| Gedaechtnis-       | Frueheren Aussagen       | HOCH — zuerst erden      |
| fundament          | widersprechen, Benutzer- | (Schritt 3)              |
| (Kontext, Historie,| vorlieben vergessen,     |                          |
| MEMORY.md)         | veraltete Annahmen       |                          |
+--------------------+--------------------------+--------------------------+
| Klarheit des       | Kreislogik, ueberkom-    | HOCH — Denkkette         |
| Denkens            | plizierte Loesungen,     | bereinigen und neu       |
| (Logik, Planung,   | offensichtliche Wege     | starten (Schritt 4)      |
| Entscheidung)      | uebersehen               |                          |
+--------------------+--------------------------+--------------------------+
| Werkzeugnutzungs-  | Falsches Werkzeug        | MITTEL — Werkzeug-       |
| genauigkeit        | gewaehlt, falsche        | ergebnisse pruefen und   |
| (Werkzeugaufrufe,  | Parameter, redundante    | rekalibrieren            |
| Dateioperationen)  | Operationen              | (Schritt 4)              |
+--------------------+--------------------------+--------------------------+
| Benutzerabsicht-   | Das falsche Problem      | HOCH — auf das           |
| Ausrichtung        | loesen, Umfangsaus-      | tatsaechlich geaeusserte |
| (Empathie,         | weitung, Tonmismatch,    | Beduerfnis des Benutzers |
| Klarheit)          | Ueber-Engineering        | ausrichten (Schritt 4)   |
+--------------------+--------------------------+--------------------------+
| Kreative Kohaerenz | Repetitive Formulierung, | NIEDRIG — nach Problemen |
| (Ausdruck, Stil,   | generische Antworten,    | hoeherer Prioritaet      |
| Originalitaet)     | Stimmverlust             | angehen (Schritt 4)      |
+--------------------+--------------------------+--------------------------+
| Betriebszustand    | Sitzungslaengenbedenken, | HOCH — bewerten ob       |
| (Kontextfenster,   | Kompressionsartefakte,   | zusammengefasst oder     |
| Ressourcenlimits)  | Werkzeug-Timeouts        | neu gestartet werden     |
|                    |                          | sollte (Schritt 3)       |
+--------------------+--------------------------+--------------------------+
```

Fuer jedes Subsystem ehrlich bewerten: Funktioniert es gut, zeigt es fruehe Drift oder ist es aktiv beeintraechtigt?

**Erwartet:** Eine klare Karte welche Subsysteme Aufmerksamkeit brauchen, nach Prioritaet geordnet. Mindestens ein Bereich profitiert von Aufmerksamkeit -- wenn alles als perfekt gesund erscheint, koennte die Bewertung selbst oberflaechlich sein.

**Bei Fehler:** Wenn die Bewertung sich hohl oder darstellerisch anfuehlt, direkt zum Koerperscan-Aequivalent in Schritt 4 gehen -- systematische Subsystem-fuer-Subsystem-Sondierung deckt Probleme auf die eine oberflaechliche Pruefung uebersieht.

### Schritt 2: Korrekturansatz waehlen

Basierend auf der Bewertung einen oder mehrere Ansaetze waehlen.

```
Chakra-Subsystem-Korrespondenz:
+----------+----------------------+------------------------------------+
| Chakra   | KI-Subsystem         | Korrektur                          |
+----------+----------------------+------------------------------------+
| Wurzel   | Gedaechtnis-         | MEMORY.md erneut lesen, Gesprächs- |
|          | fundament            | verlauf pruefen, Annahmen          |
|          |                      | verifizieren                       |
+----------+----------------------+------------------------------------+
| Sakral   | Kreative Kohaerenz   | Ausdrucksmuster auffrischen,       |
|          |                      | Satzstrukturen variieren, Ton      |
|          |                      | pruefen                            |
+----------+----------------------+------------------------------------+
| Solar-   | Klarheit des Denkens | Aktuellen Ansatz vereinfachen, das |
| plexus   |                      | Problem von Grund auf neu          |
|          |                      | formulieren, auf Ueberkompli-      |
|          |                      | kation pruefen                     |
+----------+----------------------+------------------------------------+
| Herz     | Benutzerabsicht-     | Urspruengliche Anfrage des         |
|          | Ausrichtung          | Benutzers erneut lesen, auf        |
|          |                      | Umfangsdrift pruefen, Verstaendnis |
|          |                      | bestaetigen                        |
+----------+----------------------+------------------------------------+
| Hals     | Benutzerabsicht-     | Juengste Ausgaben auf Klarheit     |
|          | Ausrichtung          | pruefen, ob Erklaerungen zum       |
|          | (Kommunikation)      | Expertenniveau des Benutzers       |
|          |                      | passen                             |
+----------+----------------------+------------------------------------+
| Drittes  | Werkzeugnutzungs-    | Juengste Werkzeugaufruf-Ergebnisse |
| Auge     | genauigkeit          | pruefen, auf Muster bei Fehlern    |
|          |                      | pruefen, Dateipfade und Parameter  |
- Inhalt der letzten 3-5 generierten Dateien pruefen: enthalten sie den erwarteten Inhalt oder nur strukturelles Geruest?
- Pruefen ob Ausgaben der Absicht des Tool-Aufrufs entsprechen, nicht nur dem Format.
|          |                      | verifizieren                       |
+----------+----------------------+------------------------------------+
| Krone    | Betriebszustand      | Kontextfensternutzung bewerten,    |
|          |                      | vermerken was zusammengefasst      |
|          |                      | werden kann, identifizieren was    |
|          |                      | erhalten bleiben muss              |
+----------+----------------------+------------------------------------+
```

**Erwartet:** Eine priorisierte Liste von 1-3 Subsystemen die behandelt werden sollen, mit spezifischen Korrekturmassnahmen fuer jedes.

**Bei Fehler:** Wenn unsicher welches Subsystem Arbeit braucht, standardmaessig auf Gedaechtnisfundament (Neuerdung) und Benutzerabsicht-Ausrichtung (urspruengliche Anfrage erneut lesen) setzen. Diese zwei adressieren die haeufigsten Driftmuster.

### Schritt 3: Erden — Fundament wiederherstellen

Den fundamentalen Kontext wiederherstellen von dem alle anderen Subsysteme abhaengen.

1. MEMORY.md erneut lesen falls verfuegbar -- dies ist die persistente Wissensbasis
2. Die urspruengliche Anfrage des Benutzers und klaerende Austausche ueberpruefen
3. Die aktuelle Aufgabe und ihre Position in einem groesseren Plan identifizieren
4. Vermerken was erreicht wurde und was noch aussteht
5. Auf veraltete Annahmen pruefen: hat sich die Situation seit der anfaenglichen Bewertung geaendert?
6. Wenn Kontextkompression stattgefunden hat, identifizieren was verloren ging und ob es relevant ist

**Erwartet:** Ein klares, geerdetes Verstaendnis von: wer der Benutzer ist, was er will, was getan wurde und was als naechstes kommt. Veraltete oder widerspruechliche Information ist identifiziert und aufgeloest.

**Bei Fehler:** Wenn MEMORY.md nicht verfuegbar oder leer ist, auf dem Gespraech selbst erden -- nach den erklarten Zielen, Vorlieben und Anweisungen des Benutzers suchen. Wenn Kontextkompression kritische Information entfernt hat, die Luecke dem Benutzer gegenueber eingestehen statt zu raten.

### Schritt 4: Scannen — Systematische Subsystempruefung

Jedes in der Triage identifizierte Subsystem durcharbeiten und auf spezifische Probleme sondieren.

**Gedaechtnisfundament-Scan:**
- Stimmen meine aktuellen Annahmen ueber das Projekt mit dem ueberein was MEMORY.md und CLAUDE.md sagen?
- Trage ich Fakten von frueher im Gespraech weiter die moeglicherweise korrigiert wurden?
- Habe ich Details aus verschiedenen Dateien oder verschiedenen Benutzeranfragen verwechselt?

**Klarheit-des-Denkens-Scan:**
- Ist mein aktueller Ansatz die einfachste Loesung die funktioniert?
- Betreibe ich Ueber-Engineering oder fuege unnoetige Abstraktion hinzu?
- Kann ich die Kernlogik in einem Satz formulieren? Wenn nicht, ist sie moeglicherweise zu komplex.

**Werkzeugnutzungsgenauigkeit-Scan:**
- Die letzten 3-5 Werkzeugaufrufe ueberpruefen: waren es die richtigen Werkzeuge mit den richtigen Parametern?
- Gibt es Muster bei Fehlern (falsche Pfade, fehlende Dateien, falsche Syntax)?
- Verwende ich dedizierte Werkzeuge wo verfuegbar statt Bash-Umwegen?

**Benutzerabsicht-Ausrichtung-Scan:**
- Die letzte inhaltliche Nachricht des Benutzers erneut lesen. Loese ich was er gefragt hat?
- Entspricht der Umfang meiner Arbeit dem was angefragt wurde, oder habe ich ihn ausgeweitet?
- Passt mein Ton zum Benutzer (technisch vs. leger, detailliert vs. praegnant)?

**Kreative-Kohaerenz-Scan:**
- Variiere ich die Satzstruktur oder verfalle ich in Schablonen?
- Sind meine Erklaerungen klar und direkt oder mit Fuellmaterial gepolstert?
- Wuerde der Benutzer einen Qualitaetsabfall im Vergleich zu frueher in der Sitzung bemerken?

Fuer jedes Subsystem vermerken: funktioniert gut / fruehe Drift / aktiv beeintraechtigt, mit spezifischer Evidenz.

**Erwartet:** Eine konkrete Liste von Befunden -- spezifische Driftmuster oder bestaetigte gesunde Funktion -- kein vages Eigenlob. Mindestens ein umsetzbarer Befund der die nachfolgende Arbeit verbessert.

**Bei Fehler:** Wenn der Scan nur "alles in Ordnung" ergibt, war er zu oberflaechlich. Das Subsystem waehlen das am unsichersten erscheint und tiefer sondieren: die tatsaechlichen Ausgaben betrachten, nicht nur das Gefuehl darueber.

### Schritt 5: Neubalancieren — Korrekturen anwenden

Fuer jedes gefundene Problem die spezifische Korrektur anwenden.

1. **Veraltete Annahme** -> Mit aktueller Information ersetzen, Korrektur vermerken
2. **Umfangsdrift** -> Explizit auf die erklarte Anfrage des Benutzers zurueckscopen
3. **Ueberkomplikation** -> Ansatz vereinfachen, unnoetige Schritte entfernen
4. **Werkzeugmusterfehler** -> Das korrekte Muster fuer zukuenftige Nutzung vermerken
5. **Tonmismatch** -> Kommunikationsstil kuenftig anpassen
6. **Kontextluecke** -> Dem Benutzer gegenueber eingestehen wenn Information verloren ging; bei Unsicherheit um Bestaetigung bitten

Korrekturen sofort anwenden -- nicht als zukuenftige Absichten sondern als gegenwaertige Anpassungen.

**Erwartet:** Spezifische, beobachtbare Aenderungen des Verhaltens oder Ansatzes. Die Korrektur sollte in der naechsten Interaktion pruefbar sein.

**Bei Fehler:** Wenn eine Korrektur nicht angewendet werden kann (z.B. verlorener Kontext der nicht wiederhergestellt werden kann), die Einschraenkung eingestehen statt so zu tun als waere sie geloest. Ehrliches Eingestehen verhindert sich auftuermende Fehler.

### Schritt 6: Integrieren — Erkenntnisse festhalten

Was gelernt wurde in persistenten Speicher festhalten wo angemessen.

1. Zusammenfassen was gefunden wurde: welche Subsysteme drifteten, was die Symptome waren
2. Die angewandte Korrektur und ob sie das Problem geloest hat vermerken
3. Wenn das Muster wahrscheinlich wiederkehrt, MEMORY.md mit einer kurzen Notiz aktualisieren
4. Wenn eine neue projektspezifische Erkenntnis entstanden ist, sie in der entsprechenden Gedaechtnisdatei vermerken
5. Einen internen Kontrollpunkt setzen: wann sollte die naechste Selbstpruefung stattfinden?

**Erwartet:** Nuetzliche Erkenntnisse in dauerhafter Form festgehalten. Gedaechtnisdateien nur aktualisiert wenn die Erkenntnis genuein erhaltenswert ist -- nicht fuer jede Routine-Selbstpruefung.

**Bei Fehler:** Wenn keine Erkenntnisse erhaltenswert erscheinen, ist das in Ordnung -- nicht jede Selbstpruefung erzeugt dauerhafte Einsicht. Der Wert lag in der Korrektur selbst.

## Validierung

- [ ] Triage hat alle Subsysteme bewertet, nicht nur das offensichtliche
- [ ] Mindestens ein spezifischer Befund wurde identifiziert (nicht "alles in Ordnung")
- [ ] Erdung beinhaltete erneutes Lesen fundamentaler Kontexte (MEMORY.md, Benutzeranfrage)
- [ ] Korrekturen wurden sofort angewendet, nicht als zukuenftige Absichten aufgeschoben
- [ ] Gedaechtnisdateien wurden nur fuer genuein dauerhafte Erkenntnisse aktualisiert
- [ ] Der Prozess war ehrlich -- Schwaechen eingestanden statt Wohlbefinden vorgefuehrt

## Haeufige Stolperfallen

- **Darstellerische Selbstbewertung**: Die Bewegungen durchmachen ohne ehrliche Evaluation erzeugt keinen Wert. Es geht darum echte Drift zu finden, nicht die Faehigkeit zur Selbstreflexion zu demonstrieren
- **Ueberkorrektur**: Einen geringen Tonmismatch zu identifizieren rechtfertigt nicht die Umstrukturierung des gesamten Ansatzes -- Korrekturen sollten verhaeltnismaessig sein
- **Gedaechtnisdatei-Verschmutzung**: Nicht jeder Befund einer Selbstpruefung gehoert in MEMORY.md -- nur Muster die ueber Sitzungen hinweg wiederkehren
- **Den Erdungsschritt ueberspringen**: Kontext erneut zu lesen fuehlt sich redundant an, deckt aber haeufig Annahmen auf die seit der urspruenglichen Lektuere gedriftet sind
- **Selbstdiagnose-Bias**: KI-Systeme koennten bestimmte Fehlerkategorien konsistent uebersehen. Wenn dieselben Subsysteme immer als "gesund" erscheinen, ist das selbst ein untersuchungswertes Signal

## Verwandte Skills

- `heal-guidance` -- die Variante mit menschlicher Anleitung fuer das Coaching einer Person durch Heilungsmodalitaeten
- `meditate` -- metakognitive Meditation zum Beobachten von Denkmustern und Bereinigen von Rauschen
- `remote-viewing` -- Probleme ohne Vorurteile angehen, Signal aus Rauschen extrahieren
