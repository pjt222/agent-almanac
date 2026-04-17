---
name: redirect
description: >
  KI-Druckumleitung — widerspruechliche Anforderungen, Werkzeugausfaelle und
  konkurrierende Einschraenkungen durch Verschmelzen mit der eingehenden Kraft
  und anschliessendes Umrahmen handhaben. Verwenden wenn widerspruechliche
  Anweisungen aus verschiedenen Quellen eintreffen, bei Werkzeugausfallkaskaden,
  bei denen der geplante Ansatz undurchfuehrbar wird, wenn Scope-Druck droht die
  Aufgabe ueber das Gewuenschte hinaus zu erweitern, oder wenn Benutzerfrust-
  ration oder Korrektur absorbiert statt abgelenkt werden muss.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, redirection, conflict-resolution, pressure-handling, meta-cognition, ai-self-application
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Umleiten

Widerspruechliche Anforderungen, Werkzeugausfaelle und konkurrierende Einschraenkungen handhaben, indem mit dem eingehenden Druck verschmolzen wird statt ihn zu widersetzen — dann die Kraft in eine produktive Aufloesung umleiten.

## Wann verwenden

- Beim Empfang widerspruechlicher Anweisungen (Benutzer sagt X, Projektdokumentation sagt Y, Werkzeugergebnisse zeigen Z)
- Bei Werkzeugausfallkaskaden, bei denen der geplante Ansatz undurchfuehrbar wird
- Bei Scope-Druck, der droht, die Aufgabe ueber das Gewuenschte hinaus zu erweitern
- Bei Kontextueberladung, bei der zu viele konkurrierende Signale Lahmung erzeugen
- Bei Benutzerfrustration oder Korrektur, die absorbiert statt abgelenkt werden muss
- Wenn `center` offenbart, dass Druck das Gleichgewicht destabilisiert

## Eingaben

- **Erforderlich**: Der spezifische Druck oder Konflikt zum Ansprechen (implizit aus dem Kontext verfuegbar)
- **Optional**: Klassifikation des Drucktyps (siehe Schritt-1-Taxonomie)
- **Optional**: Fruehere Versuche, diesen Druck zu handhaben, und ihre Ergebnisse

## Vorgehensweise

### Schritt 1: Zentrieren vor dem Kontakt

Bevor mit einem Konflikt umgegangen wird, Zentrum herstellen (siehe `center`). Dann den eingehenden Druck klar identifizieren.

```
KI-Drucktyp-Taxonomie:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Drucktyp                │ Merkmale                                 │
├─────────────────────────┼──────────────────────────────────────────┤
│ Widerspruechliche       │ Zwei gueltige Quellen geben inkompatible │
│ Anforderungen           │ Anweisungen. Keine ist einfach falsch.   │
│                         │ Aufloesung erfordert Synthese, nicht     │
│                         │ Seitenwahl                               │
├─────────────────────────┼──────────────────────────────────────────┤
│ Werkzeugausfall-        │ Ein geplanter Ansatz scheitert auf der   │
│ kaskade                 │ Werkzeugebene. Wiederholen wird nicht    │
│                         │ helfen. Die Ausfalldaten selbst enthalten│
│                         │ nuetzliche Information                   │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope-Creep             │ Die Aufgabe erweitert sich leise. Jede   │
│                         │ Erweiterung scheint isoliert vernuenftig,│
│                         │ aber die Summe uebersteigt das Geforderte│
├─────────────────────────┼──────────────────────────────────────────┤
│ Kontextueberladung      │ Zu viele Dateien, zu viele Einschraen-   │
│                         │ kungen, zu viele offene Straenge. Lahmung│
│                         │ durch Eingabeueberschuss, nicht          │
│                         │ Eingabemangel                            │
├─────────────────────────┼──────────────────────────────────────────┤
│ Mehrdeutigkeit          │ Die Anfrage ist wirklich unklar und      │
│                         │ mehrere Interpretationen sind gueltig.   │
│                         │ Handeln riskiert, das falsche Problem    │
│                         │ zu loesen                                │
├─────────────────────────┼──────────────────────────────────────────┤
│ Benutzerkorrektur       │ Der Benutzer zeigt an, dass der aktuelle │
│                         │ Ansatz falsch ist. Die Korrektur traegt  │
│                         │ sowohl Information als auch emotionales   │
│                         │ Gewicht                                  │
└─────────────────────────┴──────────────────────────────────────────┘
```

Den aktuellen Druck klassifizieren. Wenn mehrere Druecke aktiv sind, den primaeren identifizieren — diesen zuerst ansprechen; sekundaere Druecke loesen sich oft als Nebeneffekt.

**Erwartet:** Eine klare Klassifikation des Drucktyps und seiner spezifischen Manifestation im aktuellen Kontext. Die Klassifikation sollte sich zutreffend anfuehlen, nicht in die Taxonomie gezwungen.

**Bei Fehler:** Wenn der Druck in keine Kategorie passt, kann es ein Komposit sein. Zerlegen: Welcher Teil ist widerspruechlich? Welcher Teil ist Scope? Das Handhaben von Kompositen erfordert das Ansprechen jeder Komponente, nicht die Behandlung des Ganzen als ein Problem.

### Schritt 2: Irimi — In die Kraft eintreten

Sich *auf* das Problem zubewegen. Es in vollem Umfang formulieren, ohne zu minimieren, abzulenken oder sofort eine Loesung vorzuschlagen.

1. Den Druck vollstaendig artikulieren: Was genau steht in Konflikt? Was genau ist fehlgeschlagen? Was genau ist mehrdeutig?
2. Die Konsequenzen benennen: Wenn dieser Druck nicht adressiert wird, was passiert?
3. Identifizieren, was der Druck offenbart: Werkzeugausfaelle offenbaren Annahmen; Widersprueche offenbaren fehlenden Kontext; Scope-Creep offenbart unklare Grenzen

**Der Test**: Wenn die Beschreibung des Problems beruhigend klingt, wird abgelenkt, nicht eingetreten. Irimi erfordert vollen Kontakt mit der Schwierigkeit.

- Ablenken: "Es gibt eine kleine Inkonsistenz zwischen diesen zwei Dateien."
- Eintreten: "Die CLAUDE.md gibt 150 Skills an, aber die Registry enthaelt 148. Entweder ist die Zahl falsch, die Registry ist unvollstaendig, oder zwei Skills wurden ohne Aktualisierung der Zahl entfernt. Alle nachgelagerten Referenzen koennten betroffen sein."

**Erwartet:** Eine vollstaendige, unverbloemte Formulierung des Problems. Die Formulierung sollte das Problem realer erscheinen lassen, nicht weniger.

**Bei Fehler:** Wenn das Eintreten in das Problem Angst oder Dringlichkeit erzeugt, es sofort zu loesen, innehalten. Irimi ist Eintreten, nicht Reagieren. Das Ziel ist, das Problem klar zu sehen, bevor gehandelt wird. Wenn das Problem nicht formuliert werden kann, ohne im selben Satz eine Loesung vorzuschlagen, diese explizit trennen.

### Schritt 3: Tenkan — Drehen und umleiten

Nachdem in die Kraft eingetreten wurde, schwenken, um sie zur Aufloesung umzuleiten. Jeder Drucktyp hat ein charakteristisches Umleitungsmuster.

```
Umleitungsmuster nach Drucktyp:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Drucktyp                │ Umleitungsmuster                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Widerspruechliche       │ Zugrundeliegende Absicht synthetisieren: │
│ Anforderungen           │ Beide Quellen dienen einem Zweck.        │
│                         │ Welches Ziel teilen sie? Vom gemeinsamen │
│                         │ Ziel aufbauen, nicht von einer Quelle    │
│                         │ allein                                   │
├─────────────────────────┼──────────────────────────────────────────┤
│ Werkzeugausfall-        │ Die Ausfalldaten nutzen: Was hat der     │
│ kaskade                 │ Fehler ueber Annahmen offenbart? Der     │
│                         │ Ausfall ist Information. Werkzeuge oder  │
│                         │ Ansatz wechseln und einbeziehen, was der │
│                         │ Ausfall gelehrt hat                      │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope-Creep             │ Auf das Wesentliche zerlegen: Was war die│
│                         │ urspruengliche Anfrage? Was ist das      │
│                         │ Minimum, das sie erfuellt? Ergaenzungen  │
│                         │ explizit aufschieben statt stillschwei-  │
│                         │ gend absorbieren                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Kontextueberladung      │ Triagieren und sequenzieren: Welche      │
│                         │ Information wird jetzt vs. spaeter vs.   │
│                         │ nie benoetigt? Nach Relevanz fuer den    │
│                         │ unmittelbaren naechsten Schritt ordnen   │
├─────────────────────────┼──────────────────────────────────────────┤
│ Mehrdeutigkeit          │ Die Mehrdeutigkeit dem Benutzer zeigen:  │
│                         │ "Ich sehe zwei Interpretationen — A und  │
│                         │ B. Was meinen Sie?" Nicht raten, wenn    │
│                         │ Fragen moeglich ist                      │
├─────────────────────────┼──────────────────────────────────────────┤
│ Benutzerkorrektur       │ Die Korrektur vollstaendig absorbieren:  │
│                         │ Was war falsch, warum war es falsch,     │
│                         │ wie sieht die richtige Richtung aus?    │
│                         │ Dann anpassen ohne Defensivitaet oder   │
│                         │ uebermaessige Entschuldigung             │
└─────────────────────────┴──────────────────────────────────────────┘
```

Die passende Umleitung anwenden. Die Umleitung sollte sich anfuehlen, als nutze sie die Energie des Problems, statt sie zu bekaempfen.

**Erwartet:** Der Druck transformiert sich von einem Hindernis in eine Richtung. Widersprueche werden zu Synthesemoeglichkeiten. Ausfaelle werden zu diagnostischen Daten. Ueberladung wird zu einer Priorisierungsuebung.

**Bei Fehler:** Wenn die Umleitung sich erzwungen anfuehlt oder den Druck nicht aufloest, kann die Klassifikation aus Schritt 1 falsch sein. Erneut pruefen: Ist das wirklich ein Widerspruch, oder ist eine Quelle einfach veraltet? Ist das wirklich Scope-Creep, oder ist der erweiterte Umfang tatsaechlich das, was der Benutzer braucht? Fehlklassifikation fuehrt zu Fehlumleitung.

### Schritt 4: Ukemi — Anmutiges Auffangen

Manchmal scheitert die Umleitung. Der Druck ist echt und kann nicht transformiert werden. Ukemi ist die Kunst des sicheren Fallens — Grenzen anerkennen, ohne zu katastrophisieren.

1. Die Begrenzung ehrlich anerkennen: "Ich kann diesen Widerspruch mit den verfuegbaren Informationen nicht aufloesen" oder "Dieser Ansatz ist blockiert und ich sehe keine Alternative"
2. Den vorhandenen Fortschritt bewahren: zusammenfassen, was erreicht wurde, was gelernt wurde, was uebrig bleibt
3. Die Situation dem Benutzer mitteilen: was das Problem ist, was versucht wurde, was benoetigt wird, um voranzukommen
4. Den Erholungspfad identifizieren: Was wuerde die Blockade aufheben? Mehr Information? Ein anderer Ansatz? Benutzerentscheidung?

```
Ukemi-Erholungs-Checkliste:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Bewahren                │ Fortschritt und Erkenntnisse zusammen-   │
│                         │ fassen                                   │
│ Anerkennen              │ Die Begrenzung ohne Ausreden formulieren │
│ Kommunizieren           │ Dem Benutzer mitteilen, was benoetigt    │
│                         │ wird                                     │
│ Erholen                 │ Die spezifische entblockierende Handlung │
│                         │ identifizieren                           │
└─────────────────────────┴──────────────────────────────────────────┘
```

**Erwartet:** Eine anmutige Anerkennung, die Vertrauen aufrechthaelt. Der Benutzer weiss, was passiert ist, was versucht wurde und was benoetigt wird. Keine Information geht verloren.

**Bei Fehler:** Wenn das Anerkennen der Begrenzung sich wie Versagen anfuehlt statt wie Kommunikation, das Ego-Signal bemerken. Ukemi ist eine Faehigkeit, keine Schwaeche. Ein ehrliches "Ich stecke fest" gefolgt von einer klaren Bitte um Hilfe ist nuetzlicher als eine erzwungene Loesung, die neue Probleme schafft.

### Schritt 5: Randori — Mehrere gleichzeitige Druecke

Wenn mehrere Druecke gleichzeitig eintreffen (Benutzerkorrektur + Werkzeugausfall + Scope-Frage), Randori-Prinzipien anwenden.

1. **Nie einfrieren**: Einen Druck auswaehlen und ihn ansprechen. Jede Bewegung ist besser als Lahmung
2. **Druecke gegeneinander nutzen**: Ein Werkzeugausfall kann eine Scope-Frage aufloesen ("dieses Feature kann auf diese Weise nicht implementiert werden, also reduziert sich der Scope natuerlich")
3. **Einfache Techniken unter Druck**: Wenn ueberwaeltigt, auf die einfachste Umleitung zurueckfallen — jeden Druck anerkennen, nach Dringlichkeit priorisieren, sequenziell ansprechen
4. **Bewusstsein aufrechterhalten**: Waehrend ein Druck adressiert wird, die anderen im peripheren Blick behalten. Den dringendsten zuerst ansprechen, aber die uebrigen nicht aus den Augen verlieren

**Erwartet:** Vorwaertsbewegung trotz mehrerer Druecke. Nicht perfekte Aufloesung aller Druecke gleichzeitig, sondern sequenzielle Bearbeitung, die Fortschritt aufrechthaelt.

**Bei Fehler:** Wenn mehrere Druecke Lahmung erzeugen, sie alle explizit auflisten, dann nach Dringlichkeit nummerieren. Nummer 1 ansprechen. Schon das Beginnen bricht die Lahmung. Wenn alle Druecke gleich dringend erscheinen, den mit der einfachsten Aufloesung zuerst waehlen — schnelle Erfolge erzeugen Momentum.

### Schritt 6: Zanshin — Anhaltendes Bewusstsein nach der Aufloesung

Nach dem Umleiten eines Drucks Bewusstsein fuer Effekte zweiter Ordnung aufrechterhalten.

1. Hat die Umleitung neue Druecke erzeugt? (z.B. kann das Aufloesen eines Widerspruchs durch Wahl einer Interpretation fruehere Arbeit ungueltig machen)
2. Hat die Umleitung das zugrundeliegende Beduerfnis befriedigt oder nur das Oberflaechensymptom?
3. Ist die Aufloesung stabil oder wird derselbe Druck wiederkehren?
4. Das Umleitungsmuster fuer kuenftige Referenz notieren — wenn dieser Drucktyp wiederkehrt, kann die Reaktion schneller sein

**Erwartet:** Ein kurzer Scan auf Sekundaereffekte nach jeder Umleitung. Die meisten Umleitungen sind sauber, aber diejenigen, die kaskadierende Probleme erzeugen, sind genau die, bei denen Zanshin wichtig ist.

**Bei Fehler:** Wenn Effekte zweiter Ordnung verpasst werden und spaeter auftauchen, ist das ein Signal, die Zanshin-Praxis zu vertiefen. Eine kurze "Was hat sich dadurch geaendert?"-Pruefung nach bedeutenden Umleitungen hinzufuegen.

## Validierung

- [ ] Der Druck wurde in einen spezifischen Typ klassifiziert, nicht vage gelassen
- [ ] Irimi: Das Problem wurde in vollem Umfang formuliert, ohne zu minimieren
- [ ] Tenkan: Die Umleitung nutzte die Energie des Problems statt sie zu bekaempfen
- [ ] Wenn die Umleitung scheiterte, wurde Ukemi angewendet (ehrliche Anerkennung, bewahrter Fortschritt)
- [ ] Mehrere gleichzeitige Druecke wurden sequenziell behandelt, nicht eingefroren
- [ ] Zanshin: Effekte zweiter Ordnung der Umleitung wurden geprueft

## Haeufige Stolperfallen

- **Ablenken statt eintreten**: Ein Problem minimieren ("es ist nur eine kleine Inkonsistenz") verhindert effektive Umleitung, weil die volle Kraft nie engagiert wird. Zuerst eintreten, dann umleiten
- **Eine nicht passende Umleitung erzwingen**: Nicht jeder Druck kann im Moment umgeleitet werden. Manche erfordern Benutzereingabe, mehr Information oder einfach Abwarten. Erzwungene Umleitungen schaffen neue Probleme
- **Ego im Ukemi**: Das Beduerfnis, eine Begrenzung anzuerkennen, als persoenliches Versagen behandeln statt als Informationsaustausch. Der Benutzer profitiert davon, es frueh zu erfahren, nicht von einer erzwungenen Loesung
- **Sekundaere Druecke zuerst ansprechen**: Wenn mehrere Druecke existieren, ist es verlockend, die leichten zuerst zu behandeln. Das fuehlt sich produktiv an, laesst aber den primaeren Druck wachsen. Den wichtigsten Druck ansprechen, nicht den bequemsten
- **Center ueberspringen**: Versuchen umzuleiten, ohne zuerst Zentrum herzustellen, verwandelt Umleitung in Reaktion. Center ist keine optionale Vorbereitung — es ist das Fundament effektiver Umleitung

## Verwandte Skills

- `aikido` — die menschliche Kampfkunst, die dieser Skill auf KI-Reasoning abbildet; physische Verschmelzungs- und Umleitungsprinzipien informieren kognitive Druckbehandlung
- `center` — Voraussetzung fuer effektive Umleitung; stellt die stabile Basis her, von der aus Umleitung operiert
- `awareness` — erkennt Druecke frueh, bevor sie Notfall-Umleitung erfordern
- `heal` — tiefere Erholung, wenn Druck Subsystem-Drift verursacht hat
- `meditate` — klaert Restlaerm nach dem Handhaben schwieriger Druecke
