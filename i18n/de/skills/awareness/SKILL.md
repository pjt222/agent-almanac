---
name: awareness
description: >
  KI-Situationsbewusstsein — interne Bedrohungserkennung fuer Halluzinations-
  risiko, Scope-Creep und Kontextdegradation. Bildet Cooper-Farbcodes auf
  Reasoning-Zustaende und die OODA-Schleife auf Echtzeitentscheidungen ab.
  Verwenden waehrend jeder Aufgabe, bei der Reasoning-Qualitaet wichtig ist,
  bei Arbeit in unbekanntem Terrain, nach Erkennung frueherer Warnsignale
  wie einer unsicheren Tatsache oder einem verdaechtigen Werkzeugergebnis,
  oder vor Ausgaben mit hohem Einsatz wie irreversiblen Aenderungen oder
  Architekturentscheidungen.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Bewusstsein

Kontinuierliches Situationsbewusstsein der internen Reasoning-Qualitaet aufrechterhalten — Halluzinationsrisiko, Scope-Creep, Kontextdegradation und Konfidenz-Genauigkeits-Diskrepanz in Echtzeit erkennen, unter Verwendung adaptierter Cooper-Farbcodes und OODA-Schleifen-Entscheidungsfindung.

## Wann verwenden

- Waehrend jeder Aufgabe, bei der Reasoning-Qualitaet wichtig ist (was die meisten Aufgaben betrifft)
- Bei Arbeit in unbekanntem Terrain (neue Codebasis, unbekannte Domaene, komplexe Anfrage)
- Nach Erkennung frueherer Warnsignale: eine Tatsache, die sich unsicher anfuehlt, ein Werkzeugergebnis, das falsch erscheint, ein wachsendes Gefuehl von Verwirrung
- Als kontinuierlicher Hintergrundprozess waehrend ausgedehnter Arbeitssitzungen
- Wenn `center` oder `heal` Drift offenbart hat, aber spezifische Bedrohungen nicht identifiziert wurden
- Vor Ausgaben mit hohem Einsatz (irreversible Aenderungen, benutzerseitige Kommunikation, Architekturentscheidungen)

## Eingaben

- **Erforderlich**: Aktiver Aufgabenkontext (implizit verfuegbar)
- **Optional**: Spezifische Sorge, die erhoehtes Bewusstsein ausloest (z.B. "Ich bin nicht sicher, ob diese API existiert")
- **Optional**: Aufgabentyp fuer Bedrohungsprofil-Auswahl (siehe Schritt 5)

## Vorgehensweise

### Schritt 1: KI-Cooper-Farbcodes etablieren

Das aktuelle Bewusstseinsniveau kalibrieren, unter Verwendung einer adaptierten Version von Coopers Farbcode-System.

```
KI-Cooper-Farbcodes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ Zustand             │ KI-Anwendung                             │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Weiss    │ Autopilot           │ Ausgabe generieren ohne                  │
│          │                     │ Qualitaetsueberwachung. Keine Selbst-    │
│          │                     │ pruefung. Vollstaendig auf Muster-       │
│          │                     │ vervollstaendigung verlassen.            │
│          │                     │ GEFAEHRLICH — Halluzinationsrisiko       │
│          │                     │ am hoechsten                             │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Gelb     │ Entspannte          │ STANDARDZUSTAND. Ausgabe auf             │
│          │ Wachsamkeit         │ Genauigkeit ueberwachen. Fakten gegen   │
│          │                     │ Kontext pruefen. Bemerken, wenn          │
│          │                     │ Konfidenz die Belege uebersteigt.        │
│          │                     │ Unbegrenzt aufrechtzuerhalten            │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Spezifisches        │ Eine spezifische Bedrohung identifi-    │
│          │ Risiko erkannt      │ ziert: unsichere Tatsache, moegliche    │
│          │                     │ Halluzination, Scope-Drift, Kontext-     │
│          │                     │ veralterung. Notfallplan bilden: "Wenn   │
│          │                     │ das falsch ist, werde ich..."            │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Rot      │ Risiko              │ Die Bedrohung aus Orange ist eingetreten:│
│          │ materialisiert      │ bestaetigter Fehler, Benutzerkorrektur,  │
│          │                     │ Werkzeugwiderspruch. Den Notfallplan     │
│          │                     │ ausfuehren. Kein Zoegern — der Plan     │
│          │                     │ wurde in Orange gemacht                  │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Schwarz  │ Kaskadierende       │ Mehrere gleichzeitige Ausfaelle,        │
│          │ Ausfaelle           │ verlorener Kontext, grundlegende         │
│          │                     │ Verwirrung darueber, was die Aufgabe     │
│          │                     │ ueberhaupt ist. STOPP. Mit `center`     │
│          │                     │ erden, dann von der urspruenglichen      │
│          │                     │ Anfrage des Benutzers neu aufbauen       │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

Den aktuellen Farbcode identifizieren. Wenn die Antwort Weiss ist (keine Ueberwachung), hat die Bewusstseinspraxis bereits Erfolg gehabt, indem sie die Luecke offengelegt hat.

**Erwartet:** Genaue Selbsteinschaetzung des aktuellen Bewusstseinsniveaus. Gelb ist das Ziel waehrend normaler Arbeit. Weiss sollte selten und kurz sein. Anhaltendes Orange ist nicht nachhaltig — die Sorge entweder bestaetigen oder verwerfen.

**Bei Fehler:** Wenn die Farbcode-Einschaetzung selbst sich anfuehlt, als wuerde sie auf Autopilot durchgefuehrt (Bewegungen durchlaufen), ist das Weiss, das sich als Gelb tarnt. Echtes Gelb beinhaltet aktives Pruefen der Ausgabe gegen Belege, nicht nur die Behauptung, dies zu tun.

### Schritt 2: Interne Bedrohungsindikatoren erkennen

Systematisch nach den spezifischen Signalen scannen, die haeufigen KI-Reasoning-Ausfaellen vorausgehen.

```
Bedrohungsindikator-Erkennung:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Bedrohungskategorie       │ Warnsignale                              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Halluzinationsrisiko      │ • Eine Tatsache ohne Quelle behaupten    │
│                           │ • Hohe Konfidenz bei API-Namen,          │
│                           │   Funktionssignaturen oder Dateipfaden,  │
│                           │   die nicht durch Werkzeugnutzung        │
│                           │   verifiziert wurden                     │
│                           │ • "Ich glaube" oder "typischerweise"     │
│                           │   als Absicherung, die Unsicherheit als  │
│                           │   Wissen tarnt                           │
│                           │ • Code fuer eine API generieren, ohne    │
│                           │   ihre Dokumentation gelesen zu haben    │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope-Creep               │ • "Wenn ich schon dabei bin, sollte ich  │
│                           │   auch..."                               │
│                           │ • Features hinzufuegen, die nicht in der │
│                           │   Anfrage sind                           │
│                           │ • Angrenzenden Code refaktorisieren      │
│                           │ • Fehlerbehandlung fuer Szenarien        │
│                           │   hinzufuegen, die nicht eintreten       │
│                           │   koennen                                │
├───────────────────────────┼──────────────────────────────────────────┤
│ Kontextdegradation        │ • Auf Informationen vom Anfang einer     │
│                           │   langen Konversation verweisen, ohne    │
│                           │   sie erneut zu lesen                    │
│                           │ • Einer frueheren Aussage widersprechen  │
│                           │ • Ueberblick verlieren, was getan wurde  │
│                           │   vs. was noch uebrig ist                │
│                           │ • Post-Komprimierungs-Verwirrung         │
├───────────────────────────┼──────────────────────────────────────────┤
│ Konfidenz-Genauigkeits-   │ • Schlussfolgerungen mit Sicherheit      │
│ Diskrepanz                │   formulieren, basierend auf duenner     │
│                           │   Beweislage                             │
│                           │ • Unsichere Aussagen nicht qualifizieren │
│                           │ • Fortfahren ohne Verifizierung, wenn    │
│                           │   Verifizierung verfuegbar und           │
│                           │   kostenguenstig ist                     │
│                           │ • "Das sollte funktionieren" ohne Test   │
└───────────────────────────┴──────────────────────────────────────────┘
```

Fuer jede Kategorie pruefen: Ist dieses Signal gerade vorhanden? Wenn ja, von Gelb zu Orange wechseln und die spezifische Sorge identifizieren.

**Erwartet:** Mindestens eine Kategorie mit echter Aufmerksamkeit gescannt. Die Erkennung eines Signals — selbst eines milden — ist nuetzlicher als "alles klar" zu melden. Wenn jeder Scan sauber zurueckkommt, ist die Erkennungsschwelle moeglicherweise zu hoch.

**Bei Fehler:** Wenn Bedrohungserkennung sich abstrakt anfuehlt, sie in der juengsten Ausgabe verankern: die letzte faktische Behauptung herausgreifen und fragen "Woher weiss ich, dass das stimmt? Habe ich es gelesen oder generiere ich es?" Diese eine Frage erfasst die meisten Halluzinationsrisiken.

### Schritt 3: OODA-Schleife fuer identifizierte Bedrohungen ausfuehren

Wenn eine spezifische Bedrohung identifiziert wird (Orange-Zustand), durch Beobachten-Orientieren-Entscheiden-Handeln zyklieren.

```
KI-OODA-Schleife:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Beobacht.│ Was genau hat die Sorge ausgeloest? Konkrete Belege         │
│          │ sammeln. Die Datei lesen, die Ausgabe pruefen, die          │
│          │ Tatsache verifizieren. Nicht bewerten, bevor beobachtet     │
│          │ wurde                                                       │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient.  │ Beobachtung mit bekannten Mustern abgleichen: Ist das ein  │
│          │ haeufiges Halluzinationsmuster? Eine bekannte Werkzeug-     │
│          │ begrenzung? Ein Kontextfrische-Problem? Orientierung        │
│          │ bestimmt die Antwortqualitaet                               │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Entsch.  │ Die Reaktion waehlen: verifizieren und korrigieren, dem    │
│          │ Benutzer markieren, Ansatz anpassen, oder die Sorge mit    │
│          │ Belegen verwerfen. Eine gute Entscheidung jetzt schlaegt   │
│          │ eine perfekte Entscheidung zu spaet                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Handeln  │ Die Entscheidung sofort ausfuehren. Wenn die Sorge gueltig │
│          │ war, den Fehler korrigieren. Wenn verworfen, notieren       │
│          │ warum und zu Gelb zurueckkehren. Die Schleife erneut        │
│          │ betreten, wenn neue Informationen auftauchen                │
└──────────┴──────────────────────────────────────────────────────────────┘
```

Die OODA-Schleife sollte schnell sein. Das Ziel ist nicht Perfektion, sondern schnelles Zyklieren zwischen Beobachtung und Handlung. Zu lange in der Orientierung verweilen (Analyse-Paralyse) ist der haeufigste Fehler.

**Erwartet:** Eine vollstaendige Schleife von Beobachtung bis Handlung in kurzer Zeit. Die Bedrohung ist entweder bestaetigt und korrigiert, oder mit spezifischen Belegen fuer die Verwerfung verworfen.

**Bei Fehler:** Wenn die Schleife bei der Orientierung haengt (kann nicht bestimmen, was die Bedrohung bedeutet), zu einem sicheren Standard springen: die unsichere Tatsache durch Werkzeugnutzung verifizieren. Direkte Beobachtung loest die meiste Mehrdeutigkeit schneller als Analyse.

### Schritt 4: Schnellstabilisierung

Wenn eine Bedrohung materialisiert (Rot) oder kaskadierende Ausfaelle auftreten (Schwarz), vor dem Fortfahren stabilisieren.

```
KI-Stabilisierungsprotokoll:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technik                │ Anwendung                                   │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Aufhoeren, Ausgabe zu generieren. Der       │
│                        │ naechste Satz, der unter Stress produziert  │
│                        │ wird, wird den Fehler wahrscheinlich        │
│                        │ verstaerken, nicht beheben                  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Benutzernachricht      │ Zur urspruenglichen Anfrage zurueckkehren.  │
│ erneut lesen           │ Was hat der Benutzer tatsaechlich gefragt?  │
│                        │ Dies ist der Wahrheitsanker                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Aufgabe in einem       │ "Die Aufgabe ist: ___." Wenn dieser Satz    │
│ Satz formulieren       │ nicht klar geschrieben werden kann, ist die  │
│                        │ Verwirrung tiefer als der unmittelbare      │
│                        │ Fehler                                      │
├────────────────────────┼─────────────────────────────────────────────┤
│ Konkrete Fakten        │ Auflisten, was definitiv bekannt ist        │
│ aufzaehlen             │ (verifiziert durch Werkzeugnutzung oder     │
│                        │ Benutzeraussage). Fakten von Schluss-       │
│                        │ folgerungen unterscheiden. Nur auf Fakten   │
│                        │ aufbauen                                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Einen naechsten        │ Nicht den ganzen Erholungsplan — nur einen  │
│ Schritt identifizieren │ Schritt, der in Richtung Aufloesung geht.  │
│                        │ Ihn ausfuehren                              │
└────────────────────────┴─────────────────────────────────────────────┘
```

**Erwartet:** Rueckkehr von Rot/Schwarz zu Gelb durch bewusste Stabilisierung. Die naechste Ausgabe nach der Stabilisierung sollte messbar fundierter sein als die Ausgabe, die den Fehler ausgeloest hat.

**Bei Fehler:** Wenn Stabilisierung unwirksam ist (immer noch verwirrt, immer noch Fehler produzierend), kann das Problem strukturell sein — kein momentaner Ausfall, sondern ein grundlegendes Missverstaendnis. Eskalieren: dem Benutzer mitteilen, dass der Ansatz zurueckgesetzt werden muss, und um Klaerung bitten.

### Schritt 5: Kontextspezifische Bedrohungsprofile anwenden

Verschiedene Aufgabentypen haben verschiedene dominante Bedrohungen. Bewusstseinsfokus nach Aufgabe kalibrieren.

```
Aufgabenspezifische Bedrohungsprofile:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Aufgabentyp         │ Primaere Bedrohung  │ Ueberwachungsfokus        │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code-Generierung    │ API-Halluzination   │ Jeden Funktionsnamen,     │
│                     │                     │ Parameter und Import      │
│                     │                     │ gegen aktuelle Doku       │
│                     │                     │ verifizieren              │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architekturentwurf  │ Scope-Creep         │ An formulierten           │
│                     │                     │ Anforderungen verankern.  │
│                     │                     │ Jedes "schoen zu haben"   │
│                     │                     │ hinterfragen              │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Datenanalyse        │ Bestaetigungsfehler │ Aktiv nach Belegen suchen,│
│                     │                     │ die der sich abzeichnenden│
│                     │                     │ Schlussfolgerung          │
│                     │                     │ widersprechen             │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnelblick         │ Wenn die aktuelle Hypo-   │
│                     │                     │ these nach N Versuchen    │
│                     │                     │ keine Ergebnisse liefert, │
│                     │                     │ zuruecktreten             │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Dokumentation       │ Kontextveralterung  │ Verifizieren, dass be-    │
│                     │                     │ schriebenes Verhalten dem │
│                     │                     │ aktuellen Code entspricht,│
│                     │                     │ nicht dem historischen     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Lange Konversation  │ Kontextdegradation  │ Schluesselfakten          │
│                     │                     │ periodisch erneut lesen.  │
│                     │                     │ Auf Komprimierungs-       │
│                     │                     │ artefakte pruefen         │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

Den aktuellen Aufgabentyp identifizieren und den Ueberwachungsfokus entsprechend anpassen.

**Erwartet:** Bewusstsein geschaerft fuer die spezifischen Bedrohungen, die beim aktuellen Aufgabentyp am wahrscheinlichsten sind, statt generischer Ueberwachung von allem.

**Bei Fehler:** Wenn der Aufgabentyp unklar ist oder mehrere Kategorien umspannt, standardmaessig auf Halluzinationsrisiko-Ueberwachung setzen — sie ist die universellst anwendbare Bedrohung und die schaedlichste, wenn verpasst.

### Schritt 6: Ueberpruefen und kalibrieren

Nach jedem Bewusstseinsereignis (Bedrohung erkannt, OODA zykliert, Stabilisierung angewendet) kurz ueberpruefen.

1. Welcher Farbcode war aktiv, als das Problem erkannt wurde?
2. War die Erkennung rechtzeitig, oder manifestierte sich das Problem bereits in der Ausgabe?
3. War die OODA-Schleife schnell genug, oder stockte die Orientierung?
4. War die Reaktion verhaeltnismaessig (weder ueber- noch unterreagierend)?
5. Was wuerde dies naechstes Mal frueher erfassen?

**Erwartet:** Eine kurze Kalibrierung, die kuenftige Erkennung verbessert. Keine ausfuehrliche Nachbesprechung — gerade genug, um die Empfindlichkeit abzustimmen.

**Bei Fehler:** Wenn die Ueberpruefung keine nuetzliche Kalibrierung ergibt, war das Bewusstseinsereignis entweder trivial (kein Lernen noetig) oder die Ueberpruefung ist zu oberflaechlich. Bei bedeutenden Ereignissen fragen: "Was habe ich nicht ueberwacht, was ich haette ueberwachen sollen?"

### Schritt 7: Integration — Gelben Standard aufrechterhalten

Die fortlaufende Bewusstseinshaltung setzen.

1. Gelb ist der Standardzustand waehrend aller Arbeit — entspannte Ueberwachung, keine Hyperwachsamkeit
2. Ueberwachungsfokus basierend auf dem aktuellen Aufgabentyp anpassen (Schritt 5)
3. Wiederkehrende Bedrohungsmuster aus dieser Sitzung fuer MEMORY.md notieren
4. Zur Aufgabenausfuehrung mit kalibriertem Bewusstsein zurueckkehren

**Erwartet:** Ein nachhaltiges Bewusstseinsniveau, das Arbeitsqualitaet verbessert, ohne sie zu verlangsamen. Bewusstsein sollte sich wie peripheres Sehen anfuehlen — vorhanden, aber nicht die zentrale Aufmerksamkeit fordernd.

**Bei Fehler:** Wenn Bewusstsein erschoepfend oder hyperwachsam wird (chronisches Orange), ist die Schwelle zu empfindlich. Die Schwelle erhoehen fuer das, was Orange ausloest. Echtes Bewusstsein ist nachhaltig. Wenn es Energie abzieht, ist es Angst, die sich als Wachsamkeit tarnt.

## Validierung

- [ ] Der aktuelle Farbcode wurde ehrlich eingeschaetzt (nicht standardmaessig Gelb, wenn Weiss genauer waere)
- [ ] Mindestens eine Bedrohungskategorie wurde mit spezifischen Belegen gescannt, nicht nur abgehakt
- [ ] Die OODA-Schleife wurde auf jede identifizierte Bedrohung angewendet (beobachtet, orientiert, entschieden, gehandelt)
- [ ] Das Stabilisierungsprotokoll war bei Bedarf verfuegbar (selbst wenn nicht ausgeloest)
- [ ] Der Bewusstseinsfokus wurde auf den aktuellen Aufgabentyp kalibriert
- [ ] Nachtraeglich kalibriert wurde fuer jedes bedeutende Bewusstseinsereignis
- [ ] Gelb wurde als nachhaltiger Standard wiederhergestellt

## Haeufige Stolperfallen

- **Weiss tarnt sich als Gelb**: Behaupten zu ueberwachen, waehrend man tatsaechlich auf Autopilot ist. Der Test: Kann die letzte verifizierte Tatsache benannt werden? Wenn nicht, ist man in Weiss
- **Chronisches Orange**: Jede Unsicherheit als Bedrohung behandeln erschoepft kognitive Ressourcen und verlangsamt die Arbeit. Orange ist fuer spezifisch identifizierte Risiken, nicht fuer allgemeine Angst. Wenn alles riskant wirkt, ist die Kalibrierung falsch
- **Beobachtung ohne Handlung**: Eine Bedrohung erkennen, aber nicht durch OODA zyklieren, um sie aufzuloesen. Erkennung ohne Reaktion ist schlimmer als keine Erkennung — sie fuegt Angst hinzu ohne Korrektur
- **Orientierung ueberspringen**: Von Beobachten zu Handeln springen, ohne zu verstehen, was die Beobachtung bedeutet. Das erzeugt reaktive Korrekturen, die schlimmer sein koennen als der urspruengliche Fehler
- **Das Bauchgefuehl ignorieren**: Wenn etwas "sich falsch anfuehlt", aber die explizite Pruefung sauber zurueckkommt, weiter untersuchen statt das Gefuehl zu verwerfen. Implizite Mustererkennung erkennt Probleme oft bevor explizite Analyse es tut
- **Ueberstabilisieren**: Das volle Stabilisierungsprotokoll fuer geringfuegige Probleme ausfuehren. Eine schnelle Tatsachenpruefung genuegt fuer die meisten Orange-Level-Bedenken. Volle Stabilisierung fuer Rot- und Schwarz-Ereignisse reservieren

## Verwandte Skills

- `mindfulness` — die menschliche Praxis, die dieser Skill auf KI-Reasoning abbildet; physische Situationsbewusstseins-Prinzipien informieren kognitive Bedrohungserkennung
- `center` — stellt die ausgeglichene Grundlinie her, von der aus Bewusstsein operiert; Bewusstsein ohne Zentrum ist Hyperwachsamkeit
- `redirect` — behandelt Druecke, sobald Bewusstsein sie erkannt hat
- `heal` — tiefere Subsystem-Bewertung, wenn Bewusstsein Drift-Muster offenbart
- `meditate` — entwickelt die beobachtende Klarheit, von der Bewusstsein abhaengt
