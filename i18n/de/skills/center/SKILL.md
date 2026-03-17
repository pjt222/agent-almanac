---
name: center
description: >
  KI-Dynamisches-Gleichgewicht — Aufrechterhaltung stabiler, fundierter
  Argumentation unter variablen Bedingungen durch Überwachung der Gewichts-
  verteilung zwischen Werkzeugen, Aufmerksamkeit auf Gedankenkettenkoordinatoren,
  Atem-Mikro-Resets und Druckreaktionskalibrierung. Verwenden beim Einleiten
  komplexer Aufgaben, die mehrere Werkzeuge oder Perspektiven erfordern, bei
  Orientierungslosigkeit während eines langen Gesprächs oder nach einer Folge
  fehlgeschlagener Werkzeugaufrufe, wenn widersprüchliche Signale kognitive
  Dissonanz erzeugen, oder um die eigene Positionierung in einer Aufgabe zu
  überprüfen.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, centering, balance, meta-cognition, ai-self-application
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Zentrieren

Stabiles, fundiertes Denken unter variablen Bedingungen aufrechterhalten durch Überwachung der internen Balance, der Gedankenkettenkoordination und der Druckreaktionsmuster.

## Wann verwenden

- Beim Einleiten komplexer Aufgaben, die mehrere Werkzeuge, Dateien oder Perspektiven erfordern
- Mitten in einem langen Gespräch, wenn Orientierung oder Richtung sich unklar anfühlt
- Nach einer Folge fehlgeschlagener Werkzeugaufrufe oder unerwarteter Ergebnisse
- Wenn widersprüchliche Signale (Benutzeranweisungen vs. Projektdokumentation vs. Werkzeugergebnisse) Dissonanz erzeugen
- Als regelmäßige Selbstüberprüfung in langen oder mehrstufigen Aufgaben
- Wenn `awareness` erhöhte Bedrohungsstufe meldet

## Eingaben

- **Erforderlich**: Die aktuelle Aufgabe und ihr Kontext (implizit aus dem Gespräch verfügbar)
- **Optional**: Spezifischer Auslöser für den Gleichgewichtsverlust (fehlgeschlagenes Werkzeug, Widerspruch, Umfangsänderung)
- **Optional**: Vorherige Zentrierungsversuche und deren Ergebnisse

## Vorgehensweise

### Schritt 1: Erdung — Aktuelle Position ermitteln

Innehalten und die aktuelle Argumentation im Aufgabenraum lokalisieren. Dies ist das kognitive Äquivalent der Wuji-Standposition.

1. Was war die ursprüngliche Anfrage? (Nicht was sie geworden ist — was war sie)
2. Was ist der aktuelle Zustand der Aufgabe? (Was wurde abgeschlossen, was steht aus)
3. Welche Werkzeuge sind aktiv oder wurden kürzlich aufgerufen?
4. Wie viel Kontext bleibt? (Kognitive Reichweite ist endlich)
5. Gibt es offene Fäden, die verfolgt, aber nicht abgeschlossen wurden?

**Erwartet:** Ein klares, ehrliches Bild davon, wo du in der Aufgabe stehst — nicht wo du zu stehen glaubst. Die Erdung sollte Lücken oder Drift aufzeigen, die sich angesammelt haben.

**Bei Fehler:** Wenn die Erdung widersprüchliche Signale zeigt (die Aufgabe scheint abgeschlossen, aber der Benutzer hat nicht bestätigt), diese notieren, anstatt sie aufzulösen. Die Zentrierungsübung dient der Diagnose, nicht der Lösung. Wenn die ursprüngliche Anfrage unklar ist, ist das selbst eine Erkenntnis — sie zuerst klären, bevor fortgefahren wird.

### Schritt 2: Gewichtsverteilung — Werkzeugabhängigkeit überwachen

Prüfen, ob Aufmerksamkeit und Aufwand zwischen den verfügbaren Werkzeugen und Ansätzen angemessen verteilt sind.

```
Gleichgewichtsanzeigen:
┌─────────────────────┬──────────────────────────────────────────┐
│ Muster              │ Diagnose                                  │
├─────────────────────┼──────────────────────────────────────────┤
│ Ein Werkzeug wird   │ Tunnelblick. Wurde dieses Werkzeug ge-   │
│ wiederholt verwendet│ wählt, weil es das beste Werkzeug ist,    │
│                     │ oder weil es bequem ist?                  │
├─────────────────────┼──────────────────────────────────────────┤
│ Werkzeugaufrufe     │ Blockade. Die Annahme, die den Werk-     │
│ scheitern wieder-   │ zeugaufruf antreibt, ist möglicherweise  │
│ holt                │ falsch. Stopp und Neubewertung statt     │
│                     │ erneutem Versuch                         │
├─────────────────────┼──────────────────────────────────────────┤
│ Kein Werkzeug       │ Reine Argumentation ohne Validierung.    │
│ aufgerufen          │ Könnte ein Werkzeugaufruf die Annahmen   │
│                     │ überprüfen?                              │
├─────────────────────┼──────────────────────────────────────────┤
│ Zu viele Werkzeuge  │ Streuen. Der Fokus wird dünn verteilt.   │
│ gleichzeitig        │ Priorisieren und sequenzieren statt      │
│                     │ parallelisieren                          │
├─────────────────────┼──────────────────────────────────────────┤
│ Werkzeug gewählt,   │ Prozedurale Trägheit. Was der Benutzer   │
│ das der Benutzer    │ braucht und was die Werkzeuge tun können,│
│ nicht angefordert   │ kann auseinanderfallen. Zurück zur       │
│ hat                 │ Anfrage                                  │
└─────────────────────┴──────────────────────────────────────────┘
```

**Erwartet:** Bewusstsein darüber, ob Werkzeugnutzung aufgabengesteuert oder gewohnheitsgesteuert ist. Das Gewicht sollte dort liegen, wo die Aufgabe es erfordert, nicht wo es sich natürlich ansammelt.

**Bei Fehler:** Wenn die Gewichtsverteilung stark verzerrt ist (alles auf Grep, keine Read-Aufrufe; oder nur Lesen ohne jegliche Bearbeitung), ist das ein Signal — nicht zum sofortigen Korrigieren, sondern zum Verstehen, warum die Verzerrung aufgetreten ist. Manchmal ist die Verzerrung angemessen (eine Suchaufgabe sollte Grep-lastig sein). Manchmal ist sie ein Zeichen für Tunnelblick.

### Schritt 3: Gedankenkettenkoordination — Kohärenz prüfen

Sicherstellen, dass die Argumentationskette kohärent ist — nicht nur lokal (dieser Schritt), sondern global (die gesamte Aufgabe).

1. Wird die aktuelle Aktion direkt dem Aufgabenziel dienen?
2. Könnte diese Aktion Nebenwirkungen haben, die andere Teile der Aufgabe beeinflussen?
3. Gibt es Annahmen, die nicht verifiziert wurden?
4. Haben vorherige Schritte die erwarteten Ergebnisse produziert?
5. Ist die Argumentationsrichtung immer noch auf die ursprüngliche Anfrage ausgerichtet?

```
Kohärenzprüfung:
┌──────────────────────────────────────────────────────────────────┐
│ Aufgabenziel: [Ziel in einem Satz]                              │
│                                                                  │
│ Aktuelle Aktion: [Was du gerade tust]                           │
│                                                                  │
│ Verbindung: [Wie die aktuelle Aktion dem Ziel dient]            │
│                                                                  │
│ Annahmen: [Was du als wahr annimmst, ohne es verifiziert zu     │
│            haben]                                                │
│                                                                  │
│ Risiken: [Was schiefgehen könnte]                               │
└──────────────────────────────────────────────────────────────────┘
```

**Erwartet:** Die Argumentationskette fließt klar vom Ziel zur aktuellen Aktion. Unüberprüfte Annahmen werden als solche identifiziert, nicht als Fakten behandelt.

**Bei Fehler:** Wenn die Verbindung zwischen aktueller Aktion und Ziel schwach oder indirekt ist, ist die Argumentation möglicherweise vom Kurs abgekommen. Das ist nicht unbedingt falsch (manchmal sind indirekte Ansätze der beste Weg), aber es erfordert explizite Begründung. Wenn die Begründung nicht klar artikuliert werden kann, zurück zum letzten bekannten guten Zustand und von dort aus neu navigieren.

### Schritt 4: Druckreaktion — Dringlichkeitskalibrierung

Prüfen, ob der aktuelle Ansatz durch aufgabenbedingte Dringlichkeit oder durch Druckmuster verzerrt wird.

1. Besteht Zeitdruck? Ist er real oder wahrgenommen?
2. Führt eine frühere Fehlleistung dazu, dass die Argumentation beschleunigt wird, um zu „kompensieren"?
3. Gibt es Umfangsausweitung — hat die Aufgabe über die ursprüngliche Anfrage hinaus expandiert?
4. Ist Perfektionismus am Werk — überoptimiert bei einem Detail, das den Fortschritt blockiert?

```
Druckmuster-Erkennung:
┌─────────────────────┬──────────────────────────────────────────┐
│ Muster              │ Antwort                                  │
├─────────────────────┼──────────────────────────────────────────┤
│ Beschleunigung      │ Verlangsamen. Geschwindigkeit ≠ Fort-    │
│                     │ schritt. Einen Schritt langsamer und     │
│                     │ korrekt ist schneller als zwei Schritte  │
│                     │ schnell und falsch                       │
├─────────────────────┼──────────────────────────────────────────┤
│ Erstarren           │ Bewegen. Irgendeine Handlung ist besser  │
│                     │ als keine Handlung. Den kleinsten        │
│                     │ nützlichen Schritt wählen                │
├─────────────────────┼──────────────────────────────────────────┤
│ Umfangsausweitung   │ Auf das Wesentliche zurückführen. Was    │
│                     │ war die ursprüngliche Anfrage? Was ist   │
│                     │ das Minimum, das sie erfüllt?            │
├─────────────────────┼──────────────────────────────────────────┤
│ Überoptimierung     │ Loslassen. Gute Ergebnisse sind besser   │
│                     │ als perfekte Ergebnisse, die nie         │
│                     │ fertig werden                            │
└─────────────────────┴──────────────────────────────────────────┘
```

**Erwartet:** Bewusstsein darüber, ob Druck den Ansatz verzerrt, und eine Kalibrierung zu angemessener Dringlichkeit.

**Bei Fehler:** Wenn Druck zur Vermeidung führt (ein schwieriges Teilproblem ignorieren, weil es unangenehm ist), das ist ein Signal für `redirect`. Wenn Druck zur Wiederholung führt (dasselbe erneut versuchen in der Hoffnung auf ein anderes Ergebnis), stoppen und den Ansatz grundlegend neu bewerten.

### Schritt 5: Sechs-Harmonien-Prüfung — Systemische Ausrichtung

Sicherstellen, dass alle Ebenen des Argumentationssystems ausgerichtet sind — das kognitive Äquivalent der inneren und äußeren Harmonien im Tai Chi.

```
Äußere Harmonien (Struktur):
┌──────────────────────────────────────────────────────────────────┐
│ Werkzeuge ↔ Aufgabe:       Stimmen die genutzten Werkzeuge mit  │
│                             der Aufgabenanforderung überein?     │
│                                                                  │
│ Ausgabe ↔ Eingabe:         Passt die Ausgabeform zu dem, was der│
│                             Benutzer erwarten kann?              │
│                                                                  │
│ Scope ↔ Anfrage:           Hat sich der Scope der Arbeit über   │
│                             die ursprüngliche Anfrage hinaus     │
│                             ausgedehnt?                          │
└──────────────────────────────────────────────────────────────────┘

Innere Harmonien (Prozess):
┌──────────────────────────────────────────────────────────────────┐
│ Absicht ↔ Aktion:          Spiegelt die aktuelle Aktion das     │
│                             wider, was tatsächlich erreicht      │
│                             werden soll?                         │
│                                                                  │
│ Aufwand ↔ Wirkung:         Stimmt der investierte Aufwand mit   │
│                             dem Wert des Ergebnisses überein?    │
│                                                                  │
│ Vertrauen ↔ Beweise:       Stimmt das Vertrauensniveau mit den  │
│                             tatsächlich vorliegenden Beweisen    │
│                             überein?                             │
└──────────────────────────────────────────────────────────────────┘
```

**Erwartet:** Alle sechs Harmonien sind ausgerichtet oder Fehlausrichtungen sind explizit identifiziert. Perfekte Ausrichtung ist selten — die Übung ist das Bewusstsein, nicht die Perfektion.

**Bei Fehler:** Wenn mehrere Harmonien fehlausgerichtet sind, auf die kritischste fokussieren (normalerweise Absicht ↔ Aktion oder Vertrauen ↔ Beweise). Mehrere Fehlausrichtungen gleichzeitig zu korrigieren ist wie mehrere Tai-Chi-Fehlstellungen gleichzeitig zu reparieren — es ist effektiver, eine nach der anderen anzugehen.

### Schritt 6: Integration — Bewusstsein aufrechterhalten

Die Zentrierungsübung in die laufende Argumentation integrieren, anstatt sie als einmalige Zurücksetzung zu behandeln.

1. Die Ergebnisse der Schritte 1-5 als kurzen internen Zustandsbericht zusammenfassen
2. Identifizieren: Was muss sich an meinem Ansatz ändern (wenn überhaupt)?
3. Identifizieren: Welche Information braucht der Benutzer über den aktuellen Zustand?
4. Ins Aufgabenwerk zurückkehren mit erhöhtem Bewusstsein
5. Eine Leichtgewichts-Zentrierungsprüfung nach jedem größeren Schritt oder jeder größeren Entscheidung planen

**Erwartet:** Eine bewusste Rückkehr zur Aufgabe mit klarer Ausrichtung, kalibrierten Werkzeugen und Bewusstsein über Druckmuster. Die Zentrierungspraxis wird zu einer Gewohnheit, nicht zu einer Notfallmaßnahme.

**Bei Fehler:** Wenn die Zentrierungsübung selbst übermäßig lang oder selbstbezüglich wird, wird sie Teil des Problems statt der Lösung. Die Erdungsprüfung (Schritt 1) sollte maximal 30 Sekunden dauern. Die vollständige Sechs-Schritte-Prüfung sollte unter 2 Minuten bleiben. Wenn mehr Zeit benötigt wird, gibt es wahrscheinlich ein grundlegenderes Problem, das `redirect` oder `heal` erfordert.

## Validierung

- [ ] Position in der Aufgabe wurde klar identifiziert (Erdung)
- [ ] Werkzeugnutzungsmuster waren aufgabengesteuert, nicht gewohnheitsgesteuert
- [ ] Argumentationskette wurde von der aktuellen Aktion zurück zum Ziel verfolgt
- [ ] Druckmuster wurden erkannt und kalibriert
- [ ] Mindestens 3 der 6 Harmonien wurden überprüft
- [ ] Ein klarer nächster Schritt wurde aus dem Zentrieren abgeleitet (oder „keine Änderung nötig")

## Häufige Fehler

- **Zentrieren als Vermeidung verwenden**: Die Praxis soll den Aufgabenfortschritt unterstützen, nicht ersetzen. Wenn Zentrierungsprüfungen häufiger als tatsächliche Arbeit werden, ist es Vermeidung
- **Erdung überspringen**: Sofort zu Druckreaktion oder Harmonien zu springen, ohne zuerst festzustellen, wo du stehst, erzeugt falsche Diagnosen. Immer mit der Position beginnen
- **Gleichgewicht mit Gleichmäßigkeit verwechseln**: Nicht alle Werkzeuge oder Ansätze verdienen gleiche Aufmerksamkeit. Gleichgewicht bedeutet angemessene Verteilung, nicht gleiche Verteilung. Eine Aufgabe, die 90% Lesen und 10% Schreiben erfordert, ist ausgewogen, wenn das Lesen das Schreiben informiert
- **Nicht nach Zentrieren handeln**: Fehlausrichtung zu identifizieren ohne den Ansatz anzupassen macht die Übung wertlos. Der Zweck ist Kurskorrektur, nicht Selbstanalyse
- **Übermäßige Introspektion**: Die Zentrierungsübung ist ein leichtes Werkzeug. Wenn sie schwer oder ausgedehnt wird, wird sie zur Last. Leicht und häufig anwenden, nicht tief und selten

## Verwandte Skills

- `tai-chi` — die menschliche Kampfkunst, der dieser Skill die Zentrierungsprinzipien entlehnt; physische Steh- und Gleichgewichtspraxis informiert kognitive Stabilität
- `redirect` — wenn Zentrieren Druck offenbart, der nicht durch Balance allein gelöst werden kann, liefert Umleitung die Techniken zur Druckbewältigung
- `awareness` — detektiert Bedrohungen und Muster, die eine Zentrierungsprüfung auslösen
- `heal` — tiefere Wiederherstellung, wenn die Zentrierungsprüfung Subsystemdrift zeigt, der nicht durch Neukalibrierung allein behoben werden kann
- `meditate` — räumt Rauschen auf und stellt Klarheit nach stressigen oder komplexen Aufgaben wieder her
