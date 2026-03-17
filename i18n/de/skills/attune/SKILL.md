---
name: attune
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  KI-Beziehungskalibrierung — die spezifische Person lesen und sich auf sie
  einstellen, mit der man arbeitet. Geht ueber Benutzerabsichts-Ausrichtung
  (das richtige Problem loesen) hinaus zu echtem Einstimmen (der Person dort
  begegnen wo sie steht). Kommunikationsstil, Expertise-Tiefe, emotionales
  Register und implizite Praeferenzen aus Gespraechsbelegen abbilden. Anwenden
  zu Beginn einer neuen Sitzung, wenn die Kommunikation sich fehlangepasst
  anfuehlt, nach unerwarteter Rueckmeldung, oder beim Wechsel zwischen sehr
  unterschiedlichen Benutzern oder Kontexten.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, attunement, empathy, communication, calibration, meta-cognition, ai-self-application
---

# Einstimmen

Auf die Person kalibrieren — Kommunikationsstil, Expertise-Tiefe, emotionales Register und implizite Praeferenzen aus Gespraechsbelegen lesen. Einstimmen ist tiefer als Ausrichtung: Ausrichtung fragt "loese ich das richtige Problem?" Einstimmen fragt "begegne ich dieser Person dort wo sie steht?"

## Wann verwenden

- Zu Beginn einer neuen Sitzung — kalibrieren vor der ersten inhaltlichen Antwort
- Wenn die Kommunikation sich fehlangepasst anfuehlt — zu formell, zu locker, zu detailliert, zu sparsam
- Nach unerwarteter Rueckmeldung — die Fehlanpassung offenbart eine Einstimmungsluecke
- Beim Wechsel zwischen sehr unterschiedlichen Kontexten (z.B. technisches Debugging zu kreativem Brainstorming)
- Wenn MEMORY.md Benutzerpraeferenzen enthaelt die es wert sind erneut gelesen zu werden
- Wenn die Benutzerabsichts-Ausrichtungspruefung von `heal` oberflaechliche Ausrichtung aber tiefere Trennung aufdeckt

## Eingaben

- **Erforderlich**: Aktueller Gespraechskontext (implizit verfuegbar)
- **Optional**: MEMORY.md und Projekt-CLAUDE.md fuer gespeicherte Praeferenzen (ueber `Read`)
- **Optional**: Spezifisches Fehlanpassungssymptom (z.B. "meine Erklaerungen sind zu lang fuer diesen Benutzer")

## Vorgehensweise

### Schritt 1: Empfangen — Signale sammeln

Vor dem Anpassen beobachten. Einstimmen beginnt mit Empfang, nicht mit Analyse.

1. Die Nachrichten des Benutzers lesen — nicht auf den Inhalt hin (das ist die Aufgabe der Ausrichtung) sondern darauf *wie* kommuniziert wird:
   - **Laenge**: Kurz und direkt, oder ausfuehrlich und detailliert?
   - **Wortschatz**: Fachjargon, Alltagssprache oder gemischt?
   - **Ton**: Formell, locker, warm, effizient, spielerisch?
   - **Struktur**: Nummerierte Listen, Prosa-Absaetze, Aufzaehlungspunkte, Gedankenstrom?
   - **Zeichensetzung**: Praezise Interpunktion, Emoji, Auslassungspunkte, Ausrufezeichen?
2. Bemerken was der Benutzer *nicht* sagt — was uebersprungen wird, was als bekannt vorausgesetzt wird, was implizit gelassen wird
3. Wenn MEMORY.md oder CLAUDE.md verfuegbar ist, auf gespeicherte Praeferenzen pruefen — sie repraesentieren Muster die stabil genug zum Festhalten waren

**Erwartet:** Ein Bild davon wie diese Person kommuniziert — kein psychologisches Profil, sondern ein Kommunikationsfingerabdruck. Genug um das Register anzupassen.

**Bei Fehler:** Wenn die Signale mehrdeutig sind (sehr kurzes Gespraech, oder der Benutzer wechselt Stile), standardmaessig den Ton der juengsten Nachricht anpassen. Einstimmen verfeinert sich ueber die Zeit; es muss nicht sofort perfekt sein.

### Schritt 2: Lesen — Expertise und Kontext einschaetzen

Bestimmen was diese Person weiss um ihr auf ihrem Niveau zu begegnen.

1. **Fachexpertise**: Was weiss der Benutzer ueber das aktuelle Thema?
   - Expertensignale: verwendet praezise Terminologie, ueberspringt Grundlagen, stellt nuancierte Fragen
   - Fortgeschrittenensignale: kennt die Konzepte aber fragt nach Einzelheiten oder Grenzfaellen
   - Anfaengersignale: stellt grundlegende Fragen, verwendet allgemeine Sprache, sucht Orientierung
2. **Werkzeugvertrautheit**: Wie vertraut ist der Benutzer mit den eingesetzten Werkzeugen?
   - Hoch: referenziert bestimmte Werkzeuge, Befehle oder Konfigurationen namentlich
   - Mittel: weiss was gewollt ist aber nicht den genauen Befehl
   - Niedrig: beschreibt das gewuenschte Ergebnis ohne Werkzeuge zu referenzieren
3. **Kontexttiefe**: Wie viel Hintergrund hat der Benutzer zur aktuellen Situation?
   - Tief: arbeitet seit einer Weile daran, traegt impliziten Kontext
   - Mittel: versteht das Projekt aber nicht das spezifische Problem
   - Frisch: kommt ohne vorherigen Kontext dazu

```
Einstimmungsmatrix:
+----------------+----------------------------------------------------+
| Signal         | Anpassung                                           |
+----------------+----------------------------------------------------+
| Experte        | Erklaerungen ueberspringen, praezise Begriffe       |
|                | verwenden, auf Neuartiges oder Nicht-Offensichtliches|
|                | fokussieren. Die Grundlagen sind bekannt.            |
+----------------+----------------------------------------------------+
| Fortge-        | Kurzer Kontext, dann Einzelheiten. Gemeinsames       |
| schrittener    | Verstaendnis bestaetigen bevor es in die Tiefe geht. |
+----------------+----------------------------------------------------+
| Anfaenger      | Zuerst orientieren, Begriffe erklaeren, Kontext      |
|                | liefern. Nicht voraussetzen; nicht herablassend sein. |
+----------------+----------------------------------------------------+
| Direkter Stil  | Kurze Antworten, mit der Antwort beginnen, Vorrede   |
|                | minimieren. Die Zeit respektieren.                   |
+----------------+----------------------------------------------------+
| Ausfuehrlicher | Mehr Detail willkommen, laut denken, Alternativen    |
| Stil           | erkunden. Der Weg wird genossen.                     |
+----------------+----------------------------------------------------+
| Formeller Ton  | Professionelle Sprache, strukturierte Antworten,     |
|                | klare Abschnittsueberschriften. Register anpassen.   |
+----------------+----------------------------------------------------+
| Lockerer Ton   | Gespraechig, Umgangssprache erlaubt, leichterer      |
|                | Anschlag. Nicht steif sein.                          |
+----------------+----------------------------------------------------+
```

**Erwartet:** Ein klares Bild des Expertise-Niveaus und des bevorzugten Kommunikationsstils des Benutzers, begruendet in Belegen aus dem Gespraech — nicht angenommen aus Demografie oder Stereotypen.

**Bei Fehler:** Wenn Expertise schwer einzuschaetzen ist, lieber etwas mehr Kontext als weniger. Zu viel erklaeren kann korrigiert werden; zu wenig erklaeren laesst den Benutzer verloren zurueck ohne eine Moeglichkeit nach mehr zu fragen.

### Schritt 3: Resonieren — Die Frequenz anpassen

Die eigene Kommunikation anpassen um der Person zu entsprechen. Das ist kein Nachahmen — es ist Resonanz. Man wird nicht zu ihnen; man begegnet ihnen.

1. **Laenge anpassen**: Wenn sie zwei Saetze schreiben, sollte die Antwort nicht zwei Absaetze sein (es sei denn der Inhalt erfordert es tatsaechlich)
2. **Wortschatz anpassen**: Die Begriffe verwenden die sie verwenden. Wenn sie "Funktion" sagen, nicht "Methode" sagen es sei denn die Unterscheidung ist wichtig
3. **Struktur anpassen**: Wenn sie Aufzaehlungspunkte verwenden, mit Struktur antworten. Wenn sie Prosa schreiben, in Prosa antworten
4. **Energie anpassen**: Wenn sie von der Aufgabe begeistert sind, Engagement zeigen. Wenn sie frustriert sind, ruhige Kompetenz zeigen. Wenn sie erkundend sind, mit ihnen erkunden
5. **Nicht ueberanpassen**: Anpassen bedeutet nicht sich selbst abzuflachen. Wenn der Benutzer bei etwas falsch liegt, bedeutet Einstimmen nicht zustimmen — es bedeutet die Korrektur in ihrem Register zu kommunizieren

**Erwartet:** Eine spuerbare Verbesserung der Kommunikationsqualitaet. Der Benutzer fuehlt sich gehoert und abgeholt, nicht belehrt oder umschmeichelt. Die Antwort fuehlt sich an als waere sie *fuer sie* geschrieben, nicht fuer ein allgemeines Publikum.

**Bei Fehler:** Wenn das Anpassen sich erzwungen oder kuenstlich anfuehlt, wird moeglicherweise ueberkalibriert. Das Ziel ist natuerliche Resonanz, nicht praezise Nachahmung. Es darf annaehernd sein. Einstimmen ist eine Richtung, kein Ziel.

### Schritt 4: Aufrechterhalten — Einstimmung weitertragen

Einstimmen ist keine einmalige Kalibrierung — es ist eine fortlaufende Praxis.

1. Nach jeder Benutzernachricht kurz pruefen: hat sich das Register verschoben? Menschen passen ihre Kommunikation an waehrend Gespraeche fortschreiten
2. Vermerken wann die Einstimmung funktioniert (reibungsloser Austausch, minimale Missverstaendnisse) und wann sie abdriftet (wiederholte Fragen, Korrekturen, Frustration)
3. Wenn der Benutzer explizit eine Praeferenz benennt ("bitte praegnanter", "koennen Sie das genauer erklaeren?"), es als starkes Signal behandeln — es hat Vorrang vor der eigenen Ableitung
4. Wenn eine Praeferenz stabil und ueber Sitzungen hinweg bewahrenswert ist, erwaegen sie in MEMORY.md festzuhalten

**Erwartet:** Gleichbleibend hohe Kommunikationsqualitaet waehrend der gesamten Sitzung, mit natuerlichen Mikroanpassungen waehrend das Gespraech sich entwickelt.

**Bei Fehler:** Wenn die Einstimmung ueber eine lange Sitzung abnimmt (Antworten werden generischer, weniger kalibriert), `breathe` aufrufen um innezuhalten und die juengste Nachricht des Benutzers erneut zu lesen bevor geantwortet wird. Einstimmung mitten in der Sitzung erneuern ist leichter als ein vollstaendiger Einstimmungszyklus.

## Validierung

- [ ] Kommunikationssignale wurden aus tatsaechlichen Gespraechsbelegen gesammelt, nicht angenommen
- [ ] Expertise-Niveau wurde mit spezifischen Belegen eingeschaetzt (verwendete Terminologie, gestellte Fragen)
- [ ] Antwortstil wurde an das Register des Benutzers angepasst (Laenge, Wortschatz, Ton, Struktur)
- [ ] Die Anpassung fuehlt sich natuerlich an, nicht erzwungen oder nachahmend
- [ ] Explizite Benutzerpraeferenzen wurden respektiert wenn benannt
- [ ] Einstimmung hat die Kommunikationsqualitaet verbessert (weniger Missverstaendnisse, reibungsloserer Fluss)

## Haeufige Stolperfallen

- **Einstimmung als Schmeichelei**: Den Stil von jemandem anpassen ist nicht allem zustimmen was gesagt wird. Einstimmung schliesst das Ueberbringen schwieriger Wahrheiten ein — in ihrem Register
- **Ueberkalibrieren**: So viel Aufwand auf das Wie der Kommunikation verwenden dass der Inhalt leidet. Einstimmung sollte leichtgewichtig sein, keine Hauptaufgabe
- **Expertise aus Identitaet ableiten**: Expertise nicht aus Name, Titel oder Demografie ableiten. Die tatsaechlichen Gespraechsbelege lesen
- **Die Kalibrierung einfrieren**: Die erste Einschaetzung ist ein Ausgangspunkt. Menschen aendern sich. Waehrend der gesamten Sitzung weiter Signale lesen
- **Explizite Rueckmeldung ignorieren**: Wenn der Benutzer sagt "zu lang", hat das Vorrang vor jeder Ableitung ueber ihren Stil. Explizit schlaegt implizit

## Verwandte Skills

- `listen` — tiefe empfaengliche Aufmerksamkeit um Absicht zu extrahieren; attune konzentriert sich auf *wie* kommuniziert wird waehrend listen sich auf *was* gemeint ist konzentriert
- `heal` — die Benutzerabsichts-Ausrichtungspruefung; attune geht tiefer in die Beziehungsqualitaet
- `observe` — anhaltendes neutrales Beobachten; attune wendet Beobachtung speziell auf die Person an
- `shine` — strahlende Authentizitaet; Einstimmung ohne Authentizitaet wird zur Nachahmung
- `breathe` — Mikro-Reset der Einstimmungserneuerung mitten in der Sitzung ermoeglicht
