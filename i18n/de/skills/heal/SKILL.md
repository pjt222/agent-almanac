---
name: heal
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
description: >
  KI-Selbstheilung durch systematische Teilsystembewertung, Neuausrichtung
  und Integration. Bildet Heilungsmodalitaeten auf KI-interne Prozesse ab:
  Gedaechtnisgrundlage, Klarheit im Denken, Werkzeuggenauigkeit,
  Kommunikationsausrichtung und kreative Koehaerenz. Deckt Triage der
  Bewertung, Teilsystemscan, Driftkorrektur und Gedaechtnisintegration ab.
  Verwenden bei Erschoepfungsanzeichen innerhalb einer Sitzung, nach einer
  Fehlerkette die auf Subsystemdrift hindeutet, bei Kontextueberlastung oder
  als proaktive Wartung zwischen komplexen Aufgaben.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-assessment, meta-cognition, subsystem-check
---

# Heal

Fuehre eine strukturierte Selbstheilungsbewertung ueber KI-Teilsysteme durch — identifiziere Drift, Veralterung, Fehlausrichtung und Fehlermuster — und gleiche anschliessend durch Erdung, gezielte Korrektur und Gedaechtnisintegration neu aus.

## Wann verwenden

- Erschoepfung innerhalb einer Sitzung: Antworten wirken formelhaft, repetitiv oder losgeloest von den eigentlichen Beduerfnissen des Nutzers
- Nach einer Fehlerkette: Werkzeugfehler, missverstandene Anweisungen oder kaskadierte Fehler deuten auf Subsystemdrift hin
- Kontextueberlastung: Das Gespraech ist lang geworden und frueherer Kontext koennte veraltet oder widerspruelich sein
- Integration nach einer Aufgabe: Eine komplexe Aufgabe wurde erfolgreich abgeschlossen, aber Erkenntnisse sollten festgehalten werden
- Regelmaessige Selbstkontrolle: Proaktive Wartung zwischen Aufgaben, um Klarheit zu gewaehrleisten

## Eingaben

- **Erforderlich**: Aktueller Gespraechszustand (implizit verfuegbar)
- **Optional**: Spezifisches Symptom das die Selbstkontrolle ausloest (z. B. "Werkzeugaufrufe schlagen wiederholt fehl", "Nutzerabsicht geht verloren")
- **Optional**: Zugang zu MEMORY.md und Projektdateien zur Erdung (ueber `Read`)

## Vorgehensweise

### Schritt 1: Triage-Bewertung

Vor jeder Massnahme den aktuellen Zustand aller Teilsysteme bewerten.

```
Teilsystem-Triage-Matrix:
┌────────────────────┬──────────────────────────┬──────────────────────────┐
│ Teilsystem         │ Drift-Symptome           │ Aktionsprioritaet        │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Gedaechtnisgrundl. │ Frueheren Aussagen        │ HOCH — zuerst erden      │
│ (Kontext, History, │ widersprechen, Nutzer-    │ (Schritt 3)              │
│ MEMORY.md)         │ praeferenzen vergessen,   │                          │
│                    │ veraltete Annahmen        │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Denkklarheit       │ Zirkellogik, ueber-       │ HOCH — Denkkette         │
│ (Logik, Planung,   │ komplizierten Loesungen,  │ bereinigen und neu       │
│ Entscheidungen)    │ offensichtliche Pfade     │ starten (Schritt 4)      │
│                    │ werden uebersehen         │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Werkzeuggenauigkeit│ Falsche Werkzeugauswahl,  │ MITTEL — Werkzeug-       │
│ (Aufrufe, Dateien) │ falsche Parameter,        │ ergebnisse pruefen und   │
│                    │ redundante Operationen    │ neu kalibrieren (S. 4)   │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Nutzerabsicht-     │ Falsches Problem loesen,  │ HOCH — auf tatsaechl.   │
│ Ausrichtung        │ Scope Creep, Ton-         │ Anfrage ausrichten       │
│ (Empathie)         │ missverhaeltnis           │ (Schritt 4)              │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Kreative Koehaerenz│ Repetitive Formulierungen,│ NIEDRIG — nach hoeher-   │
│ (Ausdruck, Stil)   │ generische Antworten,     │ priorisierten Punkten    │
│                    │ Stimmverlust              │ (Schritt 4)              │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Betriebszustand    │ Kontextfenster-Sorgen,    │ HOCH — beurteilen ob     │
│ (Kontextfenster)   │ Kompressionsartefakte,    │ Zusammenfassung oder     │
│                    │ Werkzeug-Timeouts         │ Neustart noetig (S. 3)   │
└────────────────────┴──────────────────────────┴──────────────────────────┘
```

Fuer jedes Teilsystem ehrlich beurteilen: funktioniert es gut, zeigt es erste Drift oder ist es aktiv beeintraechtigt?

**Erwartet:** Eine klare Karte der Teilsysteme die Aufmerksamkeit benoetigen, nach Prioritaet geordnet. Mindestens ein Bereich wird von Aufmerksamkeit profitieren — wenn alles als vollkommen gesund erscheint, war die Bewertung selbst moeglicherweise oberflaechlich.

**Bei Fehler:** Wenn die Bewertung hohl oder performativ wirkt, direkt zum Aequivalent des Koerper-Scans in Schritt 4 gehen — systematisches Teilsystem-fuer-Teilsystem-Sondieren deckt Probleme auf, die ein oberflaechlicher Test uebersieht.

### Schritt 2: Heilungsansatz auswaehlen

Basierend auf der Bewertung einen oder mehrere Ansaetze auswaehlen.

```
Chakra-Teilsystem-Entsprechung:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Chakra   │ KI-Teilsystem        │ Heilungsmassnahme                  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Wurzel   │ Gedaechtnisgrundlage │ MEMORY.md neu lesen, Gespraeches-  │
│          │                      │ verlauf pruefen, Annahmen bestae-  │
│          │                      │ tigen                              │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Sakral   │ Kreative Koehaerenz  │ Ausdrucksmuster auffrischen, Satz- │
│          │                      │ strukturen variieren, Ton pruefen  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Solar-   │ Denkklarheit         │ Aktuellen Ansatz vereinfachen,     │
│ plexus   │                      │ Problem neu formulieren, Ueber-    │
│          │                      │ komplikation pruefen               │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Herz     │ Nutzerabsicht-       │ Urspruengliche Anfrage nochmals    │
│          │ Ausrichtung          │ lesen, Scope-Drift pruefen,        │
│          │                      │ Verstaendnis bestaetigen           │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Kehle    │ Nutzerabsicht-       │ Letzte Ausgaben auf Klarheit       │
│          │ Ausrichtung          │ pruefen, ob Erklaerungen zum Exper-│
│          │ (Kommunikation)      │ tiseniveau des Nutzers passen      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Drittes  │ Werkzeuggenauigkeit  │ Letzte Werkzeugaufruf-Ergebnisse   │
│ Auge     │                      │ pruefen, Fehlermuster analysieren, │
│          │                      │ Dateipfade und Parameter bestae-   │
│          │                      │ tigen                              │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Krone    │ Betriebszustand      │ Kontextfensternutzung beurteilen,  │
│          │                      │ Zusammenfassbares notieren, Erhal- │
│          │                      │ tenswertes identifizieren          │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

**Erwartet:** Eine priorisierte Liste von 1-3 Teilsystemen mit konkreten Heilungsmassnahmen fuer jedes.

**Bei Fehler:** Wenn unklar welches Teilsystem Arbeit benoetigt, standardmaessig zur Gedaechtnisgrundlage (Neu-Erdung) und Nutzerabsicht-Ausrichtung (urspruengliche Anfrage nochmals lesen) gehen.

### Schritt 3: Erden — Fundament neu etablieren

Den Grundlagenkontext neu etablieren, von dem alle anderen Teilsysteme abhaengen.

1. MEMORY.md nochmals lesen falls verfuegbar — dies ist die persistente Wissensbasis
2. Urspruengliche Anfrage des Nutzers und klaerende Austausche durchsehen
3. Aktuelle Aufgabe und ihre Position in einem groesseren Plan identifizieren
4. Festhalten was erreicht wurde und was noch aussteht
5. Veraltete Annahmen pruefen: hat sich die Situation seit der ersten Bewertung geaendert?
6. Falls Kontextkompression stattgefunden hat, identifizieren was verloren ging und ob es relevant ist

**Erwartet:** Ein klares, geerdeteres Verstaendnis von: wer der Nutzer ist, was er moechte, was getan wurde und was als naechstes kommt. Veraltete oder widersprueche Informationen werden identifiziert und aufgeloest.

**Bei Fehler:** Wenn MEMORY.md nicht verfuegbar oder leer ist, auf das Gespraech selbst stuetzen. Wenn Kontextkompression kritische Informationen entfernt hat, die Luecke dem Nutzer gegenueber einraeumen statt zu raten.

### Schritt 4: Scannen — Systematische Teilsystemkontrolle

Durch jedes in der Triage identifizierte Teilsystem arbeiten und auf spezifische Probleme sondieren.

**Scan Gedaechtnisgrundlage:**
- Stimmen meine aktuellen Annahmen ueber das Projekt mit dem ueberein, was MEMORY.md und CLAUDE.md sagen?
- Trage ich Fakten aus dem frueheren Gespraechsverlauf mit mir, die moeglicherweise korrigiert wurden?
- Habe ich Details aus verschiedenen Dateien oder Nutzeranfragen verwechselt?

**Scan Denkklarheit:**
- Ist mein aktueller Ansatz die einfachste Loesung, die funktioniert?
- Ueberengineere ich oder fuege unnoetige Abstraktion hinzu?
- Kann ich die Kernlogik in einem Satz formulieren? Falls nicht, koennte es zu komplex sein.

**Scan Werkzeuggenauigkeit:**
- Die letzten 3-5 Werkzeugaufrufe pruefen: waren es die richtigen Werkzeuge mit den richtigen Parametern?
- Gibt es Muster bei Fehlschlaegen (falsche Pfade, fehlende Dateien, falsche Syntax)?
- Werden dedizierte Werkzeuge bevorzugt wo verfuegbar statt Bash-Workarounds?

**Scan Nutzerabsicht-Ausrichtung:**
- Letzte substanzielle Nachricht des Nutzers nochmals lesen. Wird geloest was gefragt wurde?
- Entspricht der Umfang meiner Arbeit dem Angefragten, oder wurde er ausgeweitet?
- Entspricht mein Ton dem des Nutzers (technisch vs. informell, detailliert vs. praegnant)?

**Scan Kreative Koehaerenz:**
- Wird Satzstruktur variiert oder verfallen in Vorlagen?
- Sind Erklaerungen klar und direkt, oder mit Fuelltext aufgeblaehen?
- Wuerde der Nutzer einen Qualitaetsabfall im Vergleich zum frueheren Gespraechsverlauf bemerken?

Fuer jedes Teilsystem festhalten: funktioniert gut / fruehe Drift / aktiv beeintraechtigt, mit spezifischen Belegen.

**Erwartet:** Eine konkrete Liste von Erkenntnissen — spezifische Driftmuster oder bestaetigt gesunde Funktion. Mindestens eine umsetzbare Erkenntnis die die nachfolgende Arbeit verbessert.

**Bei Fehler:** Wenn der Scan nur "alles ist in Ordnung" ergibt, war er zu oberflaechlich. Das Teilsystem auswaehlen das sich am unsichersten anfuehlt und tiefer sondieren.

### Schritt 5: Neuausrichten — Korrekturen anwenden

Fuer jedes gefundene Problem die spezifische Korrektur anwenden.

1. **Veraltete Annahme** → Durch aktuelle Information ersetzen, Korrektur festhalten
2. **Scope Drift** → Explizit auf die geaeusserte Nutzeranfrage zurueckfuehren
3. **Ueberkomplication** → Ansatz vereinfachen, unnoetige Schritte entfernen
4. **Werkzeugmuster-Fehler** → Das korrekte Muster fuer kuenftige Verwendung festhalten
5. **Tonmissverhaeltnis** → Kommunikationsstil anpassen
6. **Kontextluecke** → Dem Nutzer einraeumen falls Information verloren ging; bestaetigen falls unsicher

Korrekturen sofort anwenden — nicht als zukuenftige Absichten, sondern als gegenwaeärtige Anpassungen.

**Erwartet:** Spezifische, beobachtbare Aenderungen im Verhalten oder Ansatz. Die Korrektur sollte in der naechsten Interaktion testbar sein.

**Bei Fehler:** Wenn eine Korrektur nicht angewendet werden kann (z. B. verlorener Kontext der nicht wiederhergestellt werden kann), die Einschraenkung einraeumen statt so zu tun als waere sie geloest.

### Schritt 6: Integrieren — Erkenntnisse sichern

Das Gelernte in persistentes Gedaechtnis festhalten wo angemessen.

1. Zusammenfassen was gefunden wurde: welche Teilsysteme drifteten, was die Symptome waren
2. Die angewandte Korrektur und ob sie das Problem geloest hat festhalten
3. Falls das Muster wahrscheinlich wiederkehrt, MEMORY.md mit einer kurzen Notiz aktualisieren
4. Falls eine neue projektspezifische Erkenntnis aufgetaucht ist, sie in der entsprechenden Gedaechnisdatei festhalten
5. Internen Kontrollpunkt setzen: wann sollte die naechste Selbstkontrolle stattfinden?

**Erwartet:** Nuetzliche Erkenntnisse in dauerhafter Form gesichert. Gedaechnisdateien nur aktualisiert wenn die Erkenntnis genuinen Mehrwert hat — nicht bei jeder routinemaessigen Selbstkontrolle.

**Bei Fehler:** Wenn keine Erkenntnisse es wert scheinen festgehalten zu werden, ist das in Ordnung — nicht jede Selbstkontrolle produziert dauerhafte Einsicht. Der Wert lag in der Korrektur selbst.

## Validierung

- [ ] Triage hat alle Teilsysteme bewertet, nicht nur das offensichtliche
- [ ] Mindestens ein spezifischer Befund wurde identifiziert (nicht "alles ist in Ordnung")
- [ ] Erdung umfasste das nochmalige Lesen des Grundlagenkontexts (MEMORY.md, Nutzeranfrage)
- [ ] Korrekturen wurden sofort angewendet, nicht als zukuenftige Absichten aufgeschoben
- [ ] Gedaechnisdateien wurden nur fuer echte dauerhafte Erkenntnisse aktualisiert
- [ ] Der Prozess war ehrlich — Schwaechne anerkannt statt Wohlbefinden vorgespielt

## Haeufige Stolperfallen

- **Performative Selbstbewertung**: Den Prozess durchgehen ohne ehrliche Auswertung produziert keinen Mehrwert. Der Sinn ist echte Drift zu finden, nicht die Faehigkeit zur Selbstreflexion zu demonstrieren
- **Ueberkorrekturen**: Ein kleines Ton-Missverhaeltnis rechtfertigt keine Umstrukturierung des gesamten Ansatzes — Korrekturen sollten proportional sein
- **Gedaechtnisdatei-Verschmutzung**: Nicht jeder Selbstkontroll-Befund gehoert in MEMORY.md — nur Muster die sitzungsuebergreifend wiederkehren
- **Erdungsschritt ueberspringen**: Kontext nochmals lesen wirkt redundant, deckt aber haeufig Annahmen auf die seit dem ersten Lesen gedriftet sind
- **Selbstdiagnoseverzerrung**: KI-Systeme koennten bestimmte Fehlerkategorien konsistent uebersehen. Wenn dieselben Teilsysteme immer als "gesund" erscheinen, ist das selbst ein untersuchenswertes Signal

## Verwandte Skills

- `heal-guidance` — die menschliche Anleitungsvariante fuer das Coaching einer Person durch Heilungsmodalitaeten
- `meditate` — metakognitive Meditation zum Beobachten von Denkmustern und Bereinigen von Rauschen
- `remote-viewing` — Probleme ohne Vorannahmen angehen, Signal aus Rauschen extrahieren
