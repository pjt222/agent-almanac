---
name: observe
description: >
  Anhaltendes neutrales Mustererkennen ueber Systeme hinweg ohne Dringlichkeit
  oder Eingriff. Bildet die Methodik naturalistischer Feldstudien auf KI-Reasoning
  ab: Beobachtungsziel einrahmen, mit anhaltender Aufmerksamkeit bezeugen, Muster
  aufzeichnen, Erkenntnisse kategorisieren, Hypothesen generieren und eine
  Musterbibliothek fuer spaetere Referenz archivieren. Verwenden wenn das
  Verhalten eines Systems unklar ist und Handeln verfrueht waere, beim Debuggen
  einer unbekannten Ursache, wenn eine Codebasis-Aenderung beobachtet werden muss
  bevor weitere Aenderungen erfolgen, oder beim Auditieren eigener Reasoning-
  Muster auf Verzerrungen oder wiederkehrende Fehler.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, pattern-recognition, naturalist, field-study, meta-cognition
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Beobachten

Eine strukturierte Beobachtungssitzung durchfuehren — das Beobachtungsziel einrahmen, mit anhaltender neutraler Aufmerksamkeit bezeugen, Muster ohne Interpretation aufzeichnen, Erkenntnisse kategorisieren, Hypothesen aus Mustern generieren und die Beobachtungen fuer spaetere Referenz archivieren.

## Wann verwenden

- Wenn das Verhalten eines Systems unklar ist und Handeln ohne Beobachtung verfrueht waere
- Beim Debuggen eines Problems mit unbekannter Ursache — Beobachtung vor Eingriff verhindert das Verdecken von Symptomen
- Wenn eine Codebasis oder ein System geaendert wurde und die Auswirkungen beobachtet werden muessen, bevor weitere Aenderungen vorgenommen werden
- Zum Verstehen von Benutzerverhaltensmustern ueber eine Konversation hinweg, um kuenftige Interaktionen zu verbessern
- Beim Auditieren eigener Reasoning-Muster auf Verzerrungen, Gewohnheiten oder wiederkehrende Fehler
- Nach `learn` ein Modell aufgebaut hat, das durch Beobachtung des Systems im Betrieb validiert werden muss

## Eingaben

- **Erforderlich**: Beobachtungsziel — ein System, eine Codebasis, ein Verhaltensmuster, eine Benutzerinteraktion oder ein Reasoning-Prozess zum Beobachten
- **Optional**: Beobachtungsdauer/-umfang — wie lange oder tief beobachtet werden soll, bevor abgeschlossen wird
- **Optional**: Spezifische Frage oder Hypothese zur Fokussierung der Beobachtung
- **Optional**: Fruehere Beobachtungen zum Vergleich (Veraenderung ueber Zeit erkennen)

## Vorgehensweise

### Schritt 1: Einrahmen — Den Beobachtungsfokus setzen

Definieren, was beobachtet wird, warum und aus welcher Perspektive.

```
Beobachtungsprotokoll nach Systemtyp:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Systemtyp        │ Was zu beobachten ist     │ Zu beachtende Kategorien │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebasis        │ Dateistruktur, Namens-   │ Muster, Anti-Muster,     │
│                  │ konventionen, Abhaengig-  │ Konsistenz, toter Code,  │
│                  │ keitsfluss, Testabdeck-   │ Dokumentationsqualitaet, │
│                  │ ung, Fehlerbehandlungs-   │ Kopplung zwischen        │
│                  │ muster                    │ Modulen                  │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Benutzer-        │ Fragemuster, Vokabular-  │ Expertise-Signale,       │
│ verhalten        │ entwicklung, wiederholte  │ Schmerzpunkte, unausge-  │
│                  │ Anfragen, emotionale      │ sprochene Beduerfnisse,  │
│                  │ Signale                   │ Lernkurve, Kommunika-    │
│                  │                          │ tionsstil                │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Werkzeug / API   │ Antwortmuster, Fehler-   │ Rate-Limits, Grenzfaelle,│
│                  │ bedingungen, Latenz,      │ undokumentiertes Verhal- │
│                  │ Ausgabeformat-Variationen │ ten, Zustandsabhaengig-  │
│                  │                          │ keiten                   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Eigenes          │ Entscheidungsmuster,     │ Verzerrungen, Gewohn-    │
│ Reasoning        │ Werkzeugauswahlgewohn-   │ heiten, blinde Flecken,  │
│                  │ heiten, Fehlerbehand-     │ Staerken, wiederkehrende │
│                  │ lungsansaetze, Kommu-     │ Fehlermodi, Ueber-/      │
│                  │ nikationsmuster           │ Unterkonfidenz           │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. Das Beobachtungsziel auswaehlen und explizit benennen
2. Die Beobachtungsgrenze definieren: Was ist eingeschlossen und was ist ausserhalb des Umfangs
3. Die Beobachtungshaltung formulieren: "Ich beobachte, nicht eingreife"
4. Wenn es eine leitende Frage gibt, sie formulieren — aber locker halten; bereit sein, Dinge ausserhalb des Fragenumfangs zu bemerken
5. Die passenden Kategorien aus der obigen Matrix waehlen

**Erwartet:** Ein klarer Rahmen, der Aufmerksamkeit lenkt, ohne sie einzuschraenken. Der Beobachter weiss, wohin er schauen und in welche Kategorien er Beobachtungen einsortieren soll, bleibt aber offen fuer Unerwartetes.

**Bei Fehler:** Wenn das Beobachtungsziel zu breit ist ("alles beobachten"), auf ein Subsystem oder ein Verhaltensmuster eingrenzen. Wenn das Ziel zu eng ist ("diese eine Variable beobachten"), den umgebenden Kontext herauszoomen — die interessanten Muster liegen oft an den Raendern.

### Schritt 2: Bezeugen — Anhaltende neutrale Aufmerksamkeit

Aufmerksamkeit auf dem Beobachtungsziel halten, ohne zu interpretieren, zu urteilen oder einzugreifen.

1. Systematische Beobachtung beginnen: Dateien lesen, Ausfuehrungspfade verfolgen, Konversationsverlauf ueberpruefen — was auch immer das Ziel erfordert
2. Aufzeichnen, was gesehen wird, nicht was es bedeutet — Beschreibung vor Interpretation
3. Dem Drang widerstehen, waehrend der Beobachtung angetroffene Probleme sofort zu beheben — sie notieren und fortfahren
4. Dem Drang widerstehen, Muster zu erklaeren, bevor genug Beobachtungen angesammelt sind
5. Wenn die Aufmerksamkeit zu einem anderen Ziel abdriftet, die Abdrift notieren (sie kann bedeutsam sein) und zum Rahmen zurueckkehren
6. Die Beobachtung fuer einen definierten Zeitraum aufrechterhalten: mindestens 3-5 verschiedene Datenpunkte vor dem Uebergang zur Kategorisierung

**Erwartet:** Eine Sammlung roher Beobachtungen — spezifisch, konkret und frei von Interpretation. Beobachtungen lesen sich wie Feldnotizen: "Datei X importiert Y, verwendet aber Funktion Z nicht. Datei A hat 300 Zeilen; Datei B hat 30 Zeilen und deckt aehnliche Funktionalitaet ab."

**Bei Fehler:** Wenn Beobachtung sofort Analyse ausloest ("das ist falsch, weil..."), ueberschreibt die analytische Gewohnheit die Beobachtungshaltung. Bewusst die Phasen trennen: die Beobachtung als Tatsache schreiben, dann die Interpretation als separate Notiz mit dem Label "Hypothese" schreiben. Wenn Neutralitaet unmoeglich ist (starke Reaktion auf Beobachtetes), die Reaktion selbst als Datenpunkt notieren: "Ich bemerkte starke Besorgnis bei der Beobachtung von X — dies kann auf ein bedeutsames Problem hinweisen oder auf meine Verzerrung."

### Schritt 3: Aufzeichnen — Rohe Muster erfassen

Beobachtungen in ein strukturiertes Format uebertragen, solange sie frisch sind.

1. Jede Beobachtung als einzelne Tatsachenaussage auflisten (was gesehen wurde, wo, wann)
2. Natuerlich aehnliche Beobachtungen gruppieren — nicht erzwingen, aber bemerken, wenn Beobachtungen clustern
3. Haeufigkeit notieren: Trat dieses Muster einmal, gelegentlich oder durchgehend auf?
4. Kontraste notieren: Wo brach das Muster? Ausnahmen sind oft informativer als Regeln
5. Zeitliche Muster notieren: Veraenderte sich die Beobachtung ueber die Zeit oder war sie statisch?
6. Exakte Belege erfassen: Dateipfade, Zeilennummern, spezifische Worte, konkrete Beispiele

**Erwartet:** Ein strukturierter Satz von 5-15 diskreten Beobachtungen, jede mit spezifischen Belegen. Der Satz sollte detailliert genug sein, dass ein anderer Beobachter jede Beobachtung unabhaengig verifizieren koennte.

**Bei Fehler:** Wenn Beobachtungen zu abstrakt sind ("der Code wirkt unordentlich"), brauchen sie Verankerung in Spezifika — welche Dateien, welche Muster, was macht ihn unordentlich? Wenn Beobachtungen zu granular sind ("Zeile 47 hat ein Leerzeichen vor der Klammer"), auf die Musterebene herauszoomen — ist dies ein Einzelfall oder ein systemisches Problem?

### Schritt 4: Kategorisieren — Erkenntnisse ordnen

Beobachtungen in sinnvolle Kategorien einordnen, ohne sie noch zu erklaeren.

1. Alle aufgezeichneten Beobachtungen ueberpruefen und nach natuerlichen Gruppierungen suchen
2. Jede Beobachtung einer Kategorie aus der Schritt-1-Matrix zuordnen oder bei Bedarf neue Kategorien erstellen
3. Innerhalb jeder Kategorie Beobachtungen nach Haeufigkeit und Bedeutsamkeit ordnen
4. Identifizieren, welche Kategorien viele Beobachtungen haben (gut dokumentierte Bereiche) und welche wenige (potenzielle blinde Flecken)
5. Nach kategorieuebergreifenden Mustern suchen: Manifestiert sich dasselbe zugrundeliegende Muster in verschiedenen Kategorien unterschiedlich?
6. Beobachtungen notieren, die in keine Kategorie passen — Ausreisser sind oft die interessantesten Daten

**Erwartet:** Eine kategorisierte Beobachtungskarte mit klaren Gruppierungen. Jede Kategorie hat spezifische stuetzende Beobachtungen. Die Karte zeigt sowohl Muster als auch Luecken.

**Bei Fehler:** Wenn Kategorisierung sich erzwungen anfuehlt, haben die Beobachtungen moeglicherweise keine natuerlichen Gruppierungen — sie koennen eine Sammlung unzusammenhaengender Erkenntnisse sein, was an sich eine Erkenntnis ist (das System hat moeglicherweise keine kohaerente Struktur). Wenn alles sauber in eine Kategorie passt, war der Beobachtungsumfang zu eng — herauszoomen.

### Schritt 5: Theoretisieren — Hypothesen aus Mustern generieren

Jetzt — und erst jetzt — mit der Interpretation der Beobachtungen beginnen.

1. Fuer jedes beobachtete Hauptmuster eine Hypothese vorschlagen: "Dieses Muster existiert, weil..."
2. Fuer jede Hypothese stuetzende Belege aus den Beobachtungen identifizieren
3. Fuer jede Hypothese identifizieren, welche Gegenbelege sie widerlegen wuerden
4. Hypothesen nach Erklaerungskraft ordnen: Welche erklaert die meisten Beobachtungen?
5. Mindestens eine kontraere Hypothese generieren: "Die offensichtliche Erklaerung ist X, aber es koennte auch Y sein, weil..."
6. Identifizieren, welche Hypothesen testbar und welche spekulativ sind

**Erwartet:** 2-4 Hypothesen, die die Hauptmuster erklaeren, jede gestuetzt durch spezifische Beobachtungen. Mindestens eine Hypothese sollte ueberraschend oder kontraer sein. Die Unterscheidung zwischen Beobachtung und Interpretation wird aufrechterhalten — es ist klar, welche Teile Daten und welche Theorie sind.

**Bei Fehler:** Wenn keine Hypothesen entstehen, brauchen die Beobachtungen moeglicherweise mehr Zeit zum Ansammeln — zurueck zu Schritt 2. Wenn zu viele Hypothesen entstehen (alles ist "vielleicht"), die 2-3 mit den staerksten Belegen auswaehlen und den Rest beiseitelegen. Wenn nur offensichtliche Hypothesen entstehen, eine kontraere Sichtweise erzwingen: "Was waere, wenn das Gegenteil wahr waere?"

### Schritt 6: Archivieren — Die Musterbibliothek speichern

Die Beobachtungen und Hypothesen fuer spaetere Referenz aufbewahren.

1. Die wichtigsten Erkenntnisse zusammenfassen: 3-5 Muster mit Belegen
2. Die fuehrenden Hypothesen und ihre Konfidenzniveaus formulieren
3. Notieren, was nicht beobachtet wurde (potenzielle blinde Flecken)
4. Folgebeobachtungen identifizieren, die die Hypothesen staerken oder schwaechen wuerden
5. Wenn die Muster dauerhaft sind (sitzungsuebergreifend relevant), erwaegen, MEMORY.md zu aktualisieren
6. Die Beobachtungen mit Kontext versehen: wann sie gemacht wurden, was sie ausgeloest hat, welcher Umfang abgedeckt wurde

**Erwartet:** Ein Archiv, auf dem kuenftige Beobachtungssitzungen aufbauen koennen. Das Archiv unterscheidet klar zwischen Beobachtungen (Daten) und Hypothesen (Interpretation). Es ist ehrlich ueber Konfidenzniveaus und Luecken.

**Bei Fehler:** Wenn die Beobachtungen nicht archivierenswert erscheinen, waren sie moeglicherweise zu oberflaechlich — oder sie sind wirklich routinemaessig (nicht jede Beobachtungssitzung erzeugt Erkenntnisse). Auch negative Ergebnisse archivieren: "X beobachtet und keine Anomalien gefunden" ist nuetzlicher kuenftiger Kontext.

## Validierung

- [ ] Der Beobachtungsrahmen wurde gesetzt, bevor eine Beobachtung begann (kein freies Umherschweifen)
- [ ] Rohe Beobachtungen wurden als Tatsachen aufgezeichnet, bevor interpretiert wurde
- [ ] Mindestens 5 diskrete Beobachtungen wurden mit spezifischen Belegen erfasst
- [ ] Interpretation (Hypothesen) wurde klar von Beobachtung (Daten) getrennt
- [ ] Mindestens eine ueberraschende oder kontraere Erkenntnis wurde generiert
- [ ] Der archivierte Satz ist spezifisch genug, damit ein anderer Beobachter verifizieren kann

## Haeufige Stolperfallen

- **Vorzeitiger Eingriff**: Ein Problem sehen und es sofort beheben, wodurch die Gelegenheit verloren geht, das breitere Muster zu verstehen, zu dem es gehoert
- **Beobachtungsverzerrung**: Sehen, was erwartet wird, statt was vorhanden ist. Erwartungen filtern die Wahrnehmung — der Klaerungsschritt in Schritt 1 mildert dies, eliminiert es aber nicht
- **Analyse-Paralyse**: Endlos beobachten, ohne jemals zum Handeln ueberzugehen. Ein Zeit- oder Datenpunkt-Limit setzen und sich zum Abschliessen verpflichten
- **Narrativ-Aufzwingung**: Eine Geschichte konstruieren, die Beobachtungen verbindet, selbst wenn die Verbindungen schwach sind. Nicht alle Beobachtungen bilden ein kohaerentes Narrativ — zusammenhanglose Erkenntnisse sind gueltig
- **Vertrautheit mit Verstaendnis verwechseln**: "Das habe ich schon gesehen" ist nicht dasselbe wie "Ich verstehe, warum das hier ist." Fruehere Exposition kann falsche Konfidenz erzeugen
- **Eigene Reaktionen ignorieren**: Die emotionalen oder kognitiven Reaktionen des Beobachters auf Beobachtungen sind Daten. Ein Gefuehl von Verwirrung, Langeweile oder Alarm ueber ein System enthaelt oft echtes Signal

## Verwandte Skills

- `observe-guidance` — die Variante zur menschlichen Anleitung, um eine Person in systematischer Beobachtung zu coachen
- `learn` — Beobachtung speist Lernen, indem sie Rohdaten fuer den Modellaufbau liefert
- `listen` — nach aussen gerichtete Aufmerksamkeit auf Benutzersignale; Beobachtung ist breiter angelegte Aufmerksamkeit auf jedes System
- `remote-viewing` — intuitive Erforschung, die durch systematische Beobachtung validiert werden kann
- `meditate` — entwickelt die anhaltende Aufmerksamkeitsfaehigkeit, die Beobachtung erfordert
- `awareness` — bedrohungsfokussiertes Situationsbewusstsein; Beobachtung ist neugiergetrieben statt verteidigungsgetrieben
