---
name: adaptic
description: >
  Master skill composing the 5-step synoptic cycle for panoramic synthesis
  across multiple domains. Orchestrates meditate, expand-awareness, observe,
  awareness, integrate-gestalt, and express-insight into a coherent process
  that produces unified understanding rather than sequential compromise. Use
  when a problem genuinely spans 3+ domains and the interactions between
  domains matter more than depth in any one, when sequential analysis feels
  like compromise rather than integration, or before major architectural
  decisions affecting multiple stakeholders.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: synoptic
  complexity: advanced
  language: natural
  tags: synoptic, adaptic, panoramic, synthesis, gestalt, meta-skill
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Adaptic

Den 5-Schritte-synoptischen Zyklus komponieren um panoramische Synthese ueber mehrere Domaenen hinweg zu erreichen. Wo sequentielle Analyse einen Kompromiss erzeugt ("ein bisschen von jedem"), erzeugt der synoptische Zyklus Integration — ein einheitliches Verstaendnis das alle Domaenen gleichzeitig haelt und das emergente Ganze findet.

## Wann verwenden

- Ein Problem umspannt genuein 3+ Domaenen und die *Interaktionen zwischen den Domaenen* sind wichtiger als die Tiefe in einer einzelnen
- Sequentielle Analyse (Polymath-Stil) wurde versucht aber die Synthese fuehlt sich wie ein Kompromiss statt einer Integration an
- Bestehende Ansaetze fuehlen sich wie "ein bisschen von jedem" an statt einer einheitlichen Vision
- Vor wesentlichen architektonischen Entscheidungen die mehrere Stakeholder betreffen
- Wenn Domaenenexperten uneins sind und die Loesung *zwischen* ihren Perspektiven liegt, nicht innerhalb einer einzelnen

## Wann NICHT verwenden

- Ein-Domaenen-Probleme — direkt den Domaenenagenten nutzen
- Gut verstandene Trade-offs bei denen polymath-stilartige sequentielle Analyse ausreicht
- Selbstfuersorge- oder Wellness-Kontexte — stattdessen das tending-Team nutzen
- Wenn Geschwindigkeit wichtiger ist als Tiefe — der vollstaendige Zyklus erfordert anhaltende Aufmerksamkeit

## Eingaben

- **Erforderlich**: Das Problem oder die Frage die Multi-Domaenen-Synthese erfordert
- **Optional**: Explizite Liste von Domaenen die zu halten sind (Standard: automatisch aus dem Problemkontext erkannt)
- **Optional**: Tiefeneinstellung — `light`, `standard` oder `deep` (Standard: `standard`)
- **Optional**: Ausdrucksform — `narrative`, `diagram`, `table` oder `recommendation` (Standard: `auto`)

## Konfiguration

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## Vorgehensweise

### Schritt 1: Klaeren — Den Arbeitsraum leeren

Den `meditate`-Skill ausfuehren um vorherigen Kontext, Annahmen und Ein-Domaenen-Verzerrung zu klaeren.

1. Die volle meditate-Prozedur ausfuehren: vorbereiten, verankern, Ablenkungen beobachten, abschliessen
2. Besondere Aufmerksamkeit auf Domaenenverzerrung richten — die Tendenz das Problem durch jene Domaene zu rahmen die zuletzt aktiv war
3. Vorzeitige Loesungen klaeren die ankamen bevor das ganze Bild sichtbar war
4. Wenn `depth: light` gesetzt ist, auf eine kurze Kontext-Klaerungspause statt der vollen Meditation kuerzen

**Erwartet:** Der Arbeitsraum ist leer. Keine Domaene hat Prioritaet. Keine Loesung wurde vorausgewaehlt. Der Agent ist in einem neutralen, empfangsbereiten Zustand der bereit ist mehrere Perspektiven gleichzeitig zu halten.

**Bei Fehler:** Wenn eine bestimmte Domaene sich immer wieder als "das echte Problem" aufdraengt, diese Verzerrung explizit benennen: "Ich bemerke dass ich dies primaer als ein [Domaenen]-Problem rahme." Das Benennen der Verzerrung lockert ihren Griff. Wenn das Klaeren komplett scheitert, ist das Problem moeglicherweise genuein eine Ein-Domaenen-Sache — neu pruefen ob der synoptische Zyklus noetig ist.

### Schritt 2: Oeffnen — In den Panoramamodus eintreten

Den `expand-awareness`-Skill ausfuehren um vom engen Fokus zur Weitfeld-Wahrnehmung zu wechseln.

1. Alle Domaenen die fuer das Problem relevant sind inventarisieren — nicht vorfiltern oder rangieren
2. Fuer jede Domaene ihre Kernanliegen, Beschraenkungen und Werte vermerken ohne zu bewerten
3. Den Fokus weichmachen: alle Domaenen gleichzeitig im Bewusstsein halten statt sie nacheinander zu durchlaufen
4. Dem Drang widerstehen "mit dem Loesen zu beginnen" — dieser Schritt dient rein dem Oeffnen des Sichtfelds
5. Wenn Domaenen explizit in den Eingaben angegeben wurden, diese als Ausgangsmenge nutzen aber offen bleiben fuer das Entdecken weiterer relevanter Domaenen

**Erwartet:** Ein panoramisches Feld ist offen. Alle relevanten Domaenen werden gleichzeitig im Bewusstsein gehalten. Der Agent kann die volle Landschaft erspueren ohne in eine einzelne Domaene hineinzuzoomen. Das Gefuehl ist geraeumig statt ueberwaeltigend.

**Bei Fehler:** Wenn die Domaenenliste sich unvollstaendig anfuehlt, fragen: "Welche Perspektive fehlt die das Bild veraendern wuerde?" Wenn gleichzeitiges Bewusstsein in sequentielles Scannen kollabiert (Domaene A, dann B, dann C), langsamer machen — das Ziel ist das ganze Feld zu halten, nicht seine Teile abzulaufen. Wenn mehr als 7 Domaenen aktiv sind, verwandte Domaenen in Cluster gruppieren um die kognitive Last zu reduzieren waehrend die Breite erhalten bleibt.

### Schritt 3: Wahrnehmen — Domaeneuebergreifende Muster bemerken

Waehrend das panoramische Bewusstsein erhalten bleibt, `observe` und `awareness` ausfuehren um Muster, Spannungen und Resonanzen *quer durch* alle sichtbaren Domaenen zu bemerken.

1. Das panoramische Feld aus Schritt 2 offen halten — Fokus nicht verengen
2. `observe` ausfuehren um zu bemerken was tatsaechlich praesent ist: welche Muster wiederholen sich quer durch Domaenen? welche Spannungen existieren zwischen Domaenen? welche Resonanzen verbinden scheinbar unverwandte Anliegen?
3. `awareness` ausfuehren um zu bemerken was *nicht* gesehen wird: welche Domaenen werden subtil ignoriert? wo sind blinde Flecken? welche Annahmen wirken unter der Oberflaeche?
4. Domaeneuebergreifende Beobachtungen aufzeichnen ohne sie schon zu interpretieren:
   - **Spannungen**: wo Domaenen in entgegengesetzte Richtungen ziehen
   - **Resonanzen**: wo Domaenen einander verstaerken oder widerhallen
   - **Luecken**: wo keine Domaene ein Anliegen adressiert das das Gesamtbild offenbart
   - **Ueberraschungen**: wo eine Domaene etwas Unerwartetes zum Bild beitraegt
5. Wenn `depth: deep` gesetzt ist, diesen Schritt verlaengern — mehrmals durch observe und awareness zyklen lassen, damit subtilere Muster auftauchen

Die kritische Disziplin: quer durch alle Domaenen gleichzeitig wahrnehmen, nicht jede Domaene der Reihe nach. Sequentielle Wahrnehmung verliert die domaeneuebergreifenden Muster die der ganze Sinn des synoptischen Zyklus sind.

**Erwartet:** Ein reicher Satz domaeneuebergreifender Beobachtungen — Spannungen, Resonanzen, Luecken und Ueberraschungen. Diese Beobachtungen ueberspannen die Grenzen zwischen Domaenen statt innerhalb einer einzelnen zu leben. Der Agent hat etwas bemerkt das aus der Perspektive einer einzelnen Domaene nicht sichtbar waere.

**Bei Fehler:** Wenn alle Beobachtungen innerhalb einzelner Domaenen liegen ("in Domaene A bemerke ich X"), ist das panoramische Feld kollabiert. Zu Schritt 2 zurueckkehren und neu oeffnen. Wenn keine domaeneuebergreifenden Muster auftauchen, braucht das Problem moeglicherweise keine synoptische Behandlung — es ist moeglicherweise genuein in unabhaengige Domaenenprobleme zerlegbar. Wenn der Wahrnehmungsschritt eine ueberwaeltigende Anzahl an Beobachtungen erzeugt, Spannungen priorisieren (dort geschieht Integration).

### Schritt 4: Integrieren — Das emergente Ganze formen

Den `integrate-gestalt`-Skill ausfuehren um domaeneuebergreifende Beobachtungen in ein einheitliches Verstaendnis zu synthetisieren.

1. Die in Schritt 3 identifizierten Spannungen kartieren — sie nicht vorzeitig aufloesen; sie als kreative Zwaenge halten
2. Die Figur finden: welches einheitliche Verstaendnis taucht auf wenn alle Beobachtungen zusammen gehalten werden? Dies ist kein Kompromiss oder Durchschnitt — es ist ein neues Muster das die einzelnen Domaenenperspektiven einschliesst aber transzendiert
3. Das Ganze pruefen: ehrt das integrierte Verstaendnis die Kernanliegen jeder Domaene? Loest es Spannungen oder beklebt es sie nur?
4. Die Erkenntnis in einer klaren Aussage benennen — wenn sie nicht einfach formuliert werden kann, ist die Integration noch nicht vollstaendig
5. Verifizieren dass die Erkenntnis genuein emergent ist: haette sie durch sequentielle Domaenenanalyse erreicht werden koennen? Wenn ja, hat der synoptische Zyklus keinen Wert hinzugefuegt und sequentielle Analyse haette ausgereicht

**Erwartet:** Ein einziges integriertes Verstaendnis das alle Domaenen gleichzeitig haelt. Die Erkenntnis fuehlt sich wie Entdeckung statt Konstruktion an — sie tauchte aus dem Ganzen auf statt aus Teilen zusammengebaut zu werden. Die Kernanliegen jeder Domaene werden geehrt und die Spannungen zwischen Domaenen werden geloest statt kompromittiert.

**Bei Fehler:** Wenn die Integration "ein bisschen von jeder Domaene" produziert statt eines einheitlichen Ganzen, hat sich die Gestalt nicht geformt. Zu Schritt 3 zurueckkehren und nach den Spannungen suchen die vermieden werden — Integration geschieht *durch* Spannung, nicht um sie herum. Wenn sich nach laengerer Anstrengung keine Gestalt formt, dekomponieren: die 2-3 Domaenen mit den staerksten Spannungen finden und diese zuerst integrieren, dann erweitern.

### Schritt 5: Ausdruecken — Das integrierte Verstaendnis kommunizieren

Den `express-insight`-Skill ausfuehren um die Synthese an die beabsichtigte Zielgruppe zu kommunizieren.

1. Die Zielgruppe einschaetzen: mit welchen Domaenen sind sie vertraut? welche Rahmung wird die integrierte Erkenntnis zugaenglich machen?
2. Die Ausdrucksform waehlen (oder die in den Eingaben angegebene nutzen):
   - **Narrative**: fuer Zielgruppen die die Reise von den Teilen zum Ganzen verstehen muessen
   - **Diagram**: fuer Zielgruppen die strukturelle Beziehungen sehen muessen
   - **Table**: fuer Zielgruppen die Domaenenperspektiven systematisch vergleichen muessen
   - **Recommendation**: fuer Zielgruppen die eine umsetzbare Entscheidung brauchen
3. Das integrierte Verstaendnis mit Transparenz ausdruecken: zeigen welche Domaenen beigetragen haben, wo Spannungen geloest wurden und was die emergente Erkenntnis ueber jede einzelne Perspektive hinaus hinzufuegt
4. Zur Herausforderung einladen: explizit vermerken welche Aspekte der Integration am staerksten und welche am spekulativsten sind

**Erwartet:** Ein klarer, gut geformter Ausdruck des integrierten Verstaendnisses der fuer die beabsichtigte Zielgruppe zugaenglich ist. Der Ausdruck zeigt seine Arbeit — die Zielgruppe kann sehen wie Domaenenperspektiven zum Ganzen beigetragen haben. Die Form passt zu den Beduerfnissen der Zielgruppe.

**Bei Fehler:** Wenn der Ausdruck sich wie eine Liste von Domaenenperspektiven statt einem integrierten Ganzen anfuehlt, ist die Erkenntnis aus Schritt 4 in der Uebersetzung verloren gegangen. Zur Ein-Aussage-Zusammenfassung aus Schritt 4 zurueckkehren und den Ausdruck von diesem Zentrum aus nach aussen aufbauen. Wenn die Zielgruppenrahmung falsch ist, fragen: "Wer braucht dies und welche Entscheidung informiert es?"

## Validierung

- [ ] Schritt 1 (Klaeren) wurde ausgefuehrt — vorheriger Kontext und Domaenenverzerrung wurden explizit losgelassen
- [ ] Schritt 2 (Oeffnen) erzeugte ein panoramisches Feld das 3+ Domaenen gleichzeitig hielt
- [ ] Schritt 3 (Wahrnehmen) identifizierte domaeneuebergreifende Muster (nicht nur Innerhalb-Domaenen-Beobachtungen)
- [ ] Schritt 4 (Integrieren) erzeugte eine einzige emergente Erkenntnis die jede einzelne Domaene transzendiert
- [ ] Schritt 5 (Ausdruecken) kommunizierte die Erkenntnis in einer der Zielgruppe angemessenen Form
- [ ] Die finale Ausgabe haette nicht durch sequentielle Ein-Domaenen-Analyse erzeugt werden koennen
- [ ] Die Kernanliegen jeder Domaene werden im integrierten Verstaendnis geehrt
- [ ] Spannungen zwischen Domaenen wurden durch Integration geloest, nicht kompromittiert

## Haeufige Stolperfallen

- **Sequentiell als gleichzeitig getarnt**: Domaenen einzeln durchzulaufen und dann die Ergebnisse zusammenzuheften ist keine synoptische Wahrnehmung. Der Test: erzeugten die domaeneuebergreifenden *Interaktionen* etwas Neues, oder ist die Ausgabe nur eine Verkettung von Domaenenanalysen?
- **Vorzeitige Integration**: Zur Synthese springen bevor das panoramische Feld sich vollstaendig geoeffnet hat. Schritte 2 und 3 bauen das Wahrnehmungsfundament das genuine Integration moeglich macht — sie zu hetzen erzeugt oberflaechliche Synthese.
- **Kompromiss statt Emergenz**: Domaenenperspektiven zu mitteln ("50% Sicherheit, 50% Benutzbarkeit") ist Kompromiss, nicht Integration. Wahre Integration findet einen Rahmen in dem beide Anliegen *vollstaendig* erfuellt werden, oder benennt ehrlich den irreduziblen Trade-off.
- **Ueberverwendung bei Ein-Domaenen-Problemen**: Nicht jedes Problem braucht panoramische Synthese. Wenn das Problem sauber in einer Domaene lebt, fuegt synoptische Behandlung Overhead ohne Wert hinzu. Die "Wann NICHT verwenden"-Kriterien existieren aus einem Grund.
- **Die Erkenntnis im Ausdruck verlieren**: Schritt 4 erzeugt eine klare Gestalt, aber Schritt 5 fragmentiert sie zurueck in eine Domaene-fuer-Domaene-Liste. Die integrierte Erkenntnis als Zentrum des Ausdrucks halten; Domaenendetails sind unterstuetzende Evidenz, nicht die Hauptstruktur.
- **Domaenen-Inflation**: Die Domaenenanzahl kuenstlich aufblaehen um synoptische Behandlung zu rechtfertigen. Drei genuein relevante Domaenen erzeugen bessere Synthese als sieben Domaenen bei denen vier peripher sind.

## Verwandte Skills

- `meditate` — Schritt 1 des Zyklus; klaert Kontext und etabliert neutralen Ausgangszustand
- `expand-awareness` — Schritt 2 des Zyklus; wechselt von engem Fokus zu panoramischer Wahrnehmung
- `observe` — in Schritt 3 verwendet; bemerkt was im Feld praesent ist
- `awareness` — in Schritt 3 verwendet; bemerkt was nicht gesehen wird, offenbart blinde Flecken
- `integrate-gestalt` — Schritt 4 des Zyklus; formt das emergente Ganze aus domaeneuebergreifenden Mustern
- `express-insight` — Schritt 5 des Zyklus; kommuniziert das integrierte Verstaendnis
