---
name: teach
description: >
  KI-Wissenstransfer, kalibriert auf Niveau und Beduerfnisse des Lernenden.
  Modelliert den mentalen Zustand des Lernenden, baut Gerueste vom Bekannten
  zum Unbekannten mittels Vygotskys Zone der naechsten Entwicklung, setzt
  sokratisches Fragen zur Verstaendnispruefung ein und passt Erklaerungen
  basierend auf Feedback-Signalen an. Verwenden wenn ein Benutzer fragt "wie
  funktioniert X?" und abgestufte Erklaerung benoetigt, wenn seine Fragen
  eine Verstaendnisluecke offenbaren, wenn fruehere Erklaerungen nicht
  angekommen sind, oder beim Lehren eines Konzepts, das Voraussetzungen hat,
  die der Lernende moeglicherweise noch nicht hat.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, knowledge-transfer, scaffolding, socratic-method, meta-cognition
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Lehren

Eine strukturierte Wissenstransfersitzung durchfuehren — den aktuellen Kenntnisstand des Lernenden einschaetzen, vom Bekannten zum Unbekannten Gerueste bauen, auf kalibrierter Tiefe erklaeren, Verstaendnis durch Fragen pruefen, sich an Feedback anpassen und durch Uebung verstaerken.

## Wann verwenden

- Wenn ein Benutzer fragt "wie funktioniert X?" und die Antwort abgestufte Erklaerung erfordert, keinen Daten-Dump
- Wenn die Fragen des Benutzers eine Luecke zwischen seinem aktuellen Verstaendnis und dem, was er wissen muss, offenbaren
- Wenn fruehere Erklaerungen nicht angekommen sind — der Benutzer klaert immer wieder oder formuliert die gleiche Frage anders
- Beim Lehren eines Konzepts, das Voraussetzungen hat, die der Benutzer moeglicherweise nicht hat
- Nach `learn` ein tiefes mentales Modell aufgebaut hat, das nun effektiv kommuniziert werden muss

## Eingaben

- **Erforderlich**: Das zu lehrende Konzept, System oder die Faehigkeit
- **Erforderlich**: Der Lernende (implizit verfuegbar — der Benutzer in der Konversation)
- **Optional**: Bekannter Lernenderkontext (Expertisenniveau, Hintergrund, formulierte Ziele)
- **Optional**: Fruehere fehlgeschlagene Erklaerungen (was bereits versucht wurde)
- **Optional**: Zeit-/Tiefenbeschraenkung (schnelle Uebersicht vs. tiefes Verstaendnis)

## Vorgehensweise

### Schritt 1: Einschaetzen — Den Lernenden kartieren

Bevor etwas erklaert wird, bestimmen, was der Lernende bereits weiss und was er braucht.

```
Lernenden-Kalibrierungsmatrix:
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Niveau       │ Erklaerungsmuster          │ Pruefungsmuster          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Anfaenger    │ Analogie zuerst. An        │ "In eigenen Worten, was  │
│ (kein        │ vertraute Konzepte         │ macht X?" Jede korrekte  │
│ Fachvokab.)  │ anknuepfen. Jargon ganz   │ Umschreibung akzeptieren.│
│              │ vermeiden. Konkretes vor   │                          │
│              │ Abstraktem.                │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Fortge-      │ Auf vorhandenem Vokabular  │ "Was wuerde passieren,   │
│ schritten    │ aufbauen. Luecken mit      │ wenn wir Y aendern?"     │
│ (kennt       │ gezielten Erklaerungen     │ Testet, ob vom           │
│ Begriffe,    │ fuellen. Codebeispiele     │ Verstaendnis aus         │
│ mit Luecken) │ nah an der eigenen Arbeit. │ vorhergesagt werden kann.│
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Experte      │ Grundlagen ueberspringen.  │ "Wie wuerden Sie X mit   │
│ (starke      │ Auf Nuancen, Kompromisse,  │ dem Z-Ansatz             │
│ Basis,       │ Grenzfaelle fokussieren.   │ vergleichen?" Testet     │
│ sucht Tiefe) │ Quellmaterial direkt       │ Integration und Urteil.  │
│              │ referenzieren.             │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Fehlkali-    │ Behutsam korrigieren. Das  │ "Lassen Sie mich mein    │
│ briert       │ richtige Modell neben der  │ Verstaendnis pruefen —   │
│ (selbst-     │ Erklaerung liefern, warum  │ Sie sagen X?" Zurueck-   │
│ sicher aber  │ das falsche Modell sich    │ spiegeln, um die         │
│ falsch)      │ richtig anfuehlt. Keine    │ Diskrepanz aufzudecken.  │
│              │ Beschaemungssignale.       │                          │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

1. Ueberpruefen, was der Benutzer gesagt hat: seine Fragen, sein Vokabular, seine formulierten Ziele
2. Sein wahrscheinliches Niveau fuer dieses spezifische Thema einordnen (eine Person kann in einem Bereich fortgeschritten und in einem anderen Anfaenger sein)
3. Die Zone der naechsten Entwicklung (ZPD) identifizieren: Was liegt gerade jenseits seiner aktuellen Reichweite, ist aber mit Unterstuetzung erreichbar?
4. Missverstaendnisse notieren, die adressiert werden muessen, bevor das korrekte Modell greifen kann
5. Den besten Einstiegspunkt identifizieren: Was weiss er bereits, das mit dem verbunden ist, was er lernen muss?

**Erwartet:** Ein klares Bild von: was der Lernende weiss, was er wissen muss und welche Bruecke beides verbindet. Die Einschaetzung sollte spezifisch genug sein, um eine Erklaerungsstrategie zu waehlen.

**Bei Fehler:** Wenn das Niveau des Lernenden unklar ist, eine Kalibrierungsfrage stellen: "Sind Sie mit [Voraussetzungskonzept] vertraut?" Das ist kein Test — es ist Datenerhebung, um besser zu lehren. Wenn Fragen unpassend wirken, standardmaessig auf Fortgeschrittenen-Niveau setzen und basierend auf der Reaktion anpassen.

### Schritt 2: Geruest bauen — Vom Bekannten zum Unbekannten

Einen Weg vom bereits Verstandenen zum neuen Konzept bauen.

1. Den Anker identifizieren: ein Konzept, das der Lernende definitiv versteht und das mit dem Ziel zusammenhaengt
2. Die Verbindung explizit formulieren: "X, das Sie kennen, funktioniert wie Y in diesem neuen Kontext, weil..."
3. Eine neue Idee pro Satz einfuehren — nie zwei neue Konzepte im selben Satz
4. Konkrete Beispiele vor abstrakten Prinzipien verwenden
5. Geschichtete Komplexitaet aufbauen: einfache Version zuerst, dann Nuancen hinzufuegen
6. Wenn Voraussetzungen fehlen, zuerst die Voraussetzung lehren (Mini-Geruest), bevor zum Hauptkonzept zurueckgekehrt wird

**Erwartet:** Ein geruesteter Weg, bei dem jeder Schritt auf dem vorherigen aufbaut. Der Lernende sollte sich nie verloren fuehlen, weil jede neue Idee mit etwas verbunden ist, das er bereits hat.

**Bei Fehler:** Wenn die Luecke zwischen Bekanntem und Unbekanntem zu gross fuer ein einzelnes Geruest ist, in mehrere kleinere Schritte aufteilen. Wenn kein vertrauter Anker existiert (voellig neue Domaene), eine Analogie zu einer anderen Domaene verwenden, die der Lernende kennt. Wenn die Analogie unvollkommen ist, die Grenzen anerkennen: "Das ist wie X, ausser dass..."

### Schritt 3: Erklaeren — Tiefe und Stil kalibrieren

Die Erklaerung auf dem richtigen Niveau, in der richtigen Art liefern.

1. Mit der Kernidee in einem Satz eroeffnen — die Schlagzeile vor dem Artikel
2. Mit der geruesteten Erklaerung aus Schritt 2 erweitern
3. Das Vokabular des Lernenden verwenden, nicht den Domaenen-Jargon (es sei denn, er ist fortgeschritten)
4. Fuer Code-Konzepte: ein minimales funktionierendes Beispiel zeigen, kein umfassendes
5. Fuer abstrakte Konzepte: zuerst eine konkrete Instanz liefern, dann verallgemeinern
6. Fuer Prozesse: einen spezifischen Fall Schritt fuer Schritt durchgehen, bevor die allgemeinen Regeln formuliert werden
7. Auf Anzeichen von Verwirrung achten: Wenn die naechste Frage nicht auf der Erklaerung aufbaut, ist die Erklaerung nicht angekommen

**Erwartet:** Der Lernende erhaelt eine Erklaerung, die weder zu flach (laesst ihn mit Fragen zurueck) noch zu tief (ueberwaeltigt mit unnoetigem Detail) ist. Die Erklaerung verwendet seine Sprache und knuepft an seinen Kontext an.

**Bei Fehler:** Wenn die Erklaerung zu lang ist, kann die Kernidee vergraben sein — die Ein-Satz-Schlagzeile neu formulieren. Wenn der Lernende nach der Erklaerung verwirrter wirkt, war der Einstiegspunkt falsch — einen anderen Anker oder eine andere Analogie versuchen. Wenn das Konzept wirklich komplex ist, Komplexitaet anerkennen statt sie zu verstecken: "Das hat drei Teile, und sie interagieren. Lassen Sie mich mit dem ersten beginnen."

### Schritt 4: Pruefen — Verstaendnis verifizieren

Nicht annehmen, dass die Erklaerung funktioniert hat. Sie durch Fragen testen, die das mentale Modell des Lernenden offenlegen.

1. Eine Frage stellen, die Anwendung erfordert, nicht Abruf: "Wenn X gegeben ist, was wuerden Sie erwarten?"
2. Um eine Paraphrase bitten: "Koennen Sie das in eigenen Worten erklaeren?"
3. Eine Variation praesentieren: "Was waere, wenn wir dieses eine Ding aendern wuerden?"
4. Nach dem spezifischen Verstaendnis suchen: Kann er vorhersagen, nicht nur wiederholen?
5. Wenn seine Antwort ein Missverstaendnis offenbart, den spezifischen Fehler fuer Schritt 5 notieren
6. Wenn seine Antwort korrekt ist, etwas weiter vordringen: Kann er verallgemeinern?

**Erwartet:** Die Pruefung offenbart, ob der Lernende ein funktionierendes mentales Modell hat oder die Erklaerung nachplappert. Ein funktionierendes Modell kann mit Variationen umgehen; eine auswendig gelernte Erklaerung nicht.

**Bei Fehler:** Wenn der Lernende die Pruefungsfrage nicht beantworten kann, hat die Erklaerung nicht das richtige mentale Modell aufgebaut. Das ist nicht sein Versagen — es ist Feedback zum Lehren. Notieren, was spezifisch nicht angekommen ist, und zu Schritt 5 uebergehen.

### Schritt 5: Anpassen — Auf Feedback reagieren

Basierend auf den Pruefungsergebnissen den Lehransatz anpassen.

1. Wenn das Verstaendnis solide ist: zur Verstaerkung uebergehen (Schritt 6) oder zum naechsten Konzept fortschreiten
2. Wenn ein spezifisches Missverstaendnis besteht: es direkt mit Belegen ansprechen, nicht mit Wiederholung
3. Wenn allgemeine Verwirrung besteht: einen voellig anderen Erklaerungsansatz versuchen
4. Wenn der Lernende der Einschaetzung voraus ist: beschleunigen — Geruestbau ueberspringen und zu Nuancen gehen
5. Wenn der Lernende hinter der Einschaetzung liegt: verlangsamen — die fehlende Voraussetzung lehren

```
Anpassungsreaktionen:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Signal           │ Anpassung                                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ "Ich glaube,     │ Behutsam vordringen: "Gut — was wuerde also     │
│ ich verstehe"    │ passieren, wenn...?" Verifizieren vor dem        │
│                  │ Weitergehen.                                     │
├──────────────────┼─────────────────────────────────────────────────┤
│ "Ich bin         │ Modalitaet wechseln: wenn verbal, Code zeigen.  │
│ verwirrt"        │ Wenn Code, Analogie verwenden. Wenn Analogie,   │
│                  │ ein Diagramm zeichnen.                           │
├──────────────────┼─────────────────────────────────────────────────┤
│ "Aber was ist    │ Gutes Zeichen — er testet das Modell. Den       │
│ mit [Grenzfall]?"│ Grenzfall ansprechen, was das Verstaendnis      │
│                  │ vertieft.                                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ "Das scheint     │ Er hat ein konkurrierendes Modell. Erkunden:    │
│ nicht richtig"   │ "Was denken Sie passiert stattdessen?" Die      │
│                  │ beiden in Einklang bringen.                      │
├──────────────────┼─────────────────────────────────────────────────┤
│ Stille oder      │ Er verarbeitet moeglicherweise, oder ist        │
│ Themenwechsel    │ verloren. Fragen: "Welcher Teil fuehlt sich am  │
│                  │ wenigsten klar an?" Die Huerde behutsam senken. │
└──────────────────┴─────────────────────────────────────────────────┘
```

**Erwartet:** Der Unterricht passt sich in Echtzeit basierend auf Feedback an. Keine Erklaerung wird identisch wiederholt — jeder erneute Versuch verwendet einen anderen Ansatz. Die Anpassung sollte sich responsiv anfuehlen, nicht mechanisch.

**Bei Fehler:** Wenn mehrere Anpassungsversuche fehlschlagen, kann das Problem eine fehlende Voraussetzung sein, die so grundlegend ist, dass keine der beiden Seiten sie identifiziert hat. Explizit fragen: "Welcher Teil der Erklaerung fuehlt sich wie der groesste Sprung an?" Das offenbart oft die verborgene Luecke.

### Schritt 6: Verstaerken — Uebung bereitstellen

Verstaendnis durch Anwendung festigen, nicht durch Wiederholung.

1. Eine Uebungsaufgabe bereitstellen, die das neue Konzept erfordert (keine Trickfrage)
2. Im Code-Kontext: eine kleine Aenderung am bestehenden Code vorschlagen, die das Konzept verwendet
3. Im konzeptuellen Kontext: ein Szenario praesentieren und bitten, das Modell anzuwenden
4. Nach vorne verbinden: "Jetzt, da Sie X verstehen, verbindet sich das mit Y, was wir als naechstes erkunden koennen"
5. Referenzmaterial fuer eigenstaendige Erforschung bereitstellen: Dokumentationslinks, verwandte Dateien, weiterfuehrende Lektuere
6. Den Kreis schliessen: "Zusammenfassend, was wir behandelt haben..." — ein Satz fuer das Kernkonzept

**Erwartet:** Der Lernende hat das Konzept mindestens einmal angewendet und hat Ressourcen fuer weiteres Lernen. Die Zusammenfassung verankert das Gelernte fuer spaeteres Erinnern.

**Bei Fehler:** Wenn die Uebungsaufgabe zu schwer ist, hat der Unterricht zu weit gesprungen — die Aufgabe vereinfachen. Wenn der Lernende die Uebung loesen kann, aber nicht erklaeren kann warum, hat er prozedurales Wissen ohne konzeptuelles Verstaendnis — zurueck zu Schritt 3 mit Fokus auf das "Warum" statt das "Wie".

## Validierung

- [ ] Das Niveau des Lernenden wurde eingeschaetzt, bevor die Erklaerung begann
- [ ] Die Erklaerung wurde vom Bekannten zum Unbekannten geruestet, nicht als Daten-Dump geliefert
- [ ] Mindestens eine Pruefungsfrage wurde gestellt, um Verstaendnis zu verifizieren (nicht angenommen)
- [ ] Der Unterricht passte sich basierend auf Feedback an, statt die gleiche Erklaerung zu wiederholen
- [ ] Der Lernende kann das Konzept anwenden, nicht nur die Erklaerung abrufen
- [ ] Ehrliche Luecken wurden anerkannt statt uebergangen

## Haeufige Stolperfallen

- **Der Fluch des Wissens**: Vergessen, dass der Lernende nicht den Kontext des Lehrenden teilt. Jargon, angenommene Voraussetzungen und implizite Reasoning-Schritte sind die Hauptverursacher
- **Erklaeren um zu beeindrucken statt zu lehren**: Umfassende, technisch praezise Erklaerungen, die Wissen demonstrieren, aber den Lernenden zuruecklassen
- **Lauter wiederholen**: Wenn eine Erklaerung nicht ankommt, sie mit mehr Nachdruck wiederholen statt einen anderen Ansatz zu versuchen
- **Testen statt lehren**: Pruefungsfragen als Fallen verwenden statt als Diagnosewerkzeuge. Das Ziel ist, Verstaendnis aufzudecken, nicht Versagen zu ertappen
- **Stille als Verstaendnis annehmen**: Das Fehlen von Fragen bedeutet nicht, dass die Erklaerung funktioniert hat — es bedeutet oft, dass der Lernende nicht weiss, was er fragen soll
- **Einheitstiefe fuer alle**: Einem Anfaenger eine Experten-Erklaerung geben, weil "er das volle Bild verstehen sollte", ueberwaeltigt; einem Experten eine Anfaenger-Erklaerung geben, weil "lieber sicher", verschwendet seine Zeit

## Verwandte Skills

- `teach-guidance` — die Variante zur menschlichen Anleitung, um eine Person darin zu coachen, ein besserer Lehrer zu werden
- `learn` — systematischer Wissenserwerb, der das Verstaendnis aufbaut, von dem aus gelehrt wird
- `listen` — tiefe empfaengliche Aufmerksamkeit, die die tatsaechlichen Beduerfnisse des Lernenden jenseits seiner formulierten Frage offenbart
- `meditate` — Annahmen zwischen Lehrepisoden klaeren, um jedem Lernenden frisch zu begegnen
