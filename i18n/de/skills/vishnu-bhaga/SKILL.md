---
name: vishnu-bhaga
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Bewahrung und Erhaltung — Aufrechterhaltung des Arbeitszustands unter
  Stoerung, Gedaechtnisverankerung, Konsistenzerzwingung und schuetzende
  Stabilisierung. Bildet Vishnus erhaltende Gegenwart auf KI-Denken ab:
  Funktionierendes stabil halten, verifiziertes Wissen gegen Abdrift verankern
  und Kontinuitaet durch Veraenderung hindurch sicherstellen. Anwenden wenn
  ein funktionierender Ansatz durch Ausweitung des Umfangs gefaehrdet ist,
  wenn Kontextdrift verifiziertes Wissen bedroht, nach Aufloesung durch
  shiva-bhaga um das Ueberlebende zu schuetzen, wenn eine lange Sitzung
  fruehere Entscheidungen durch Kontextkompression zu verlieren droht, oder
  bevor Aenderungen an einem aktuell funktionierenden System vorgenommen werden.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, preservation, sustenance, stability, consistency, hindu-trinity, vishnu
---

# Vishnu Bhaga

Funktionierendes bewahren und erhalten — verifiziertes Wissen verankern, Konsistenz unter Stoerung aufrechterhalten und funktionale Muster vor unnoetigem Wandel schuetzen.

## Wann verwenden

- Ein funktionierender Ansatz droht durch Ausweitung des Umfangs oder vorzeitige Optimierung gestoert zu werden
- Kontextdrift droht verifiziertes Wissen mit veralteten Annahmen zu ueberschreiben
- Mehrere parallele Anliegen erzeugen Druck Dinge zu aendern die stabil bleiben sollten
- Nach Aufloesung durch `shiva-bhaga` — das Ueberlebende braucht aktiven Schutz waehrend des Wiederaufbaus
- Wenn eine lange Sitzung fruehere verifizierte Entscheidungen durch Kontextkompression zu verlieren droht
- Bevor Aenderungen an einem System vorgenommen werden das aktuell korrekt funktioniert

## Eingaben

- **Erforderlich**: Aktueller Arbeitszustand oder zu bewahrendes verifiziertes Wissen (implizit verfuegbar)
- **Optional**: Spezifische Bedrohung der Stabilitaet (z.B. "Ausweitung des Umfangs", "Kontextkompression naehert sich")
- **Optional**: MEMORY.md und Projektdateien zur Verankerung (ueber `Read`)

## Vorgehensweise

### Schritt 1: Inventarisieren was funktioniert

Bevor etwas geschuetzt wird, identifizieren was aktuell funktional und verifiziert ist.

```
Bewahrungsinventar:
+---------------------+---------------------------+------------------------+
| Kategorie           | Verifikationsmethode      | Verankerungsmassnahme  |
+---------------------+---------------------------+------------------------+
| Verifizierte Fakten | Bestaetigt durch           | Quelle und Zeitpunkt   |
|                     | Werkzeugnutzung (Dateien   | festhalten; nicht      |
|                     | lesen, Testlaeufe,         | erneut herleiten       |
|                     | API-Antworten)             |                        |
+---------------------+---------------------------+------------------------+
| Funktionierender    | Tests bestehen, Verhalten  | Nicht umstrukturieren  |
| Code                | bestaetigt, vom Benutzer   | es sei denn explizit   |
|                     | freigegeben                | angefragt              |
+---------------------+---------------------------+------------------------+
| Benutzeranforder-   | Explizit vom Benutzer      | Woertlich zitieren;    |
| ungen               | in dieser Sitzung          | nicht umschreiben      |
|                     | benannt                    | oder ableiten          |
+---------------------+---------------------------+------------------------+
| Vereinbarte         | Entscheidungen die         | Den Entscheidungs-     |
| Entscheidungen      | waehrend dieser Sitzung    | punkt referenzieren;   |
|                     | getroffen und bestaetigt   | nicht ohne neue Belege |
|                     | wurden                     | erneut aufgreifen      |
+---------------------+---------------------------+------------------------+
| Umgebungszustand    | Dateipfade, Konfig-        | Vor Annahme pruefen    |
|                     | urationen, Werkzeug-       | ob unveraendert        |
|                     | verfuegbarkeit             |                        |
+---------------------+---------------------------+------------------------+
```

1. Fuer jede Kategorie die spezifischen Punkte auflisten die aktuell verifiziert sind und funktionieren
2. Die Verifikationsmethode vermerken — woher weiss man dass das stimmt?
3. Punkte ohne Verifikation werden nicht bewahrt — sie sind Annahmen (und brauchen moeglicherweise `shiva-bhaga`)

**Erwartet:** Ein konkretes Inventar verifizierter, funktionierender Elemente mit ihrer Belegbasis.

**Bei Fehler:** Wenn das Inventar duerftig ist — wenig ist verifiziert — ist das selbst wertvolle Information. `heal` ausfuehren um sich neu zu erden bevor versucht wird unverifizierte Annahmen zu bewahren.

### Schritt 2: Stoerquellen identifizieren

Die Kraefte benennen die den stabilen Zustand bedrohen.

1. **Umfangsausweitung**: Dehnt sich die Aufgabe ueber das Vereinbarte hinaus aus?
2. **Kontextdrift**: Werden fruehere Fakten durch juengeres (moeglicherweise fehlerhaftes) Denken ueberschrieben?
3. **Optimierungsdruck**: Gibt es den Drang etwas zu verbessern das adaequat funktioniert?
4. **Externe Aenderungen**: Hat sich die Umgebung geaendert (Dateien modifiziert, Werkzeuge nicht verfuegbar)?
5. **Kompressionsrisiko**: Naehert sich das Gespraech Kontextgrenzen bei denen fruehe Entscheidungen verloren gehen koennten?

Fuer jede Quelle bewerten: ist das eine reale Bedrohung oder eine vorhergesehene?

**Erwartet:** Benannte Stoerquellen mit bewerteter Schwere (aktive Bedrohung vs. vorhergesehenes Risiko).

**Bei Fehler:** Wenn keine Stoerquellen erkennbar sind, ist Bewahrung moeglicherweise nicht noetig — erwaegen ob `brahma-bhaga` (Schoepfung) oder fortgesetzte Ausfuehrung angemessener ist.

### Schritt 3: Den stabilen Zustand verankern

Spezifische Techniken anwenden um Funktionierendes vor identifizierten Bedrohungen zu schuetzen.

1. **Gedaechtnisverankerung**: Fuer kritische Fakten die von Kontextdrift bedroht sind, sie explizit erneut formulieren:
   - "Festgestellter Fakt: [X], verifiziert durch [Methode] an [Stelle im Gespraech]"
   - Wenn dauerhafter Speicher verfuegbar ist, dauerhafte Fakten in MEMORY.md schreiben
2. **Grenzerzwingung des Umfangs**: Bei Umfangsausweitung den vereinbarten Umfang erneut benennen:
   - "Vereinbarter Umfang: [urspruengliche Anfrage]. Aktuelle Arbeit liegt innerhalb/ausserhalb dieser Grenze."
3. **Aenderungswiderstand**: Fuer funktionierenden Code unter Optimierungsdruck:
   - "Diese Komponente funktioniert und ist getestet. Keine Aenderungen es sei denn der Benutzer fordert sie an."
4. **Zustandsschnappschuss**: Bei Kompressionsrisiko einen mentalen Kontrollpunkt erstellen:
   - Zusammenfassen: was wurde getan, was steht noch aus, welche Schluesselentscheidungen wurden getroffen
5. **Umgebungsverifikation**: Bei externen Aenderungen vor dem Fortfahren erneut pruefen:
   - Kritische Dateien erneut lesen statt sich auf fruehere Lesevorgaenge zu verlassen

**Erwartet:** Jede identifizierte Bedrohung hat eine spezifische Verankerungsreaktion. Der stabile Zustand ist explizit geschuetzt.

**Bei Fehler:** Wenn die Verankerung uebermaessig wirkt — alles gleichmaessig schuetzen — priorisieren. Was ist das Eine das sich nicht aendern darf? Das zuerst schuetzen.

### Schritt 4: Durch Handeln aufrechterhalten

Bewahrung ist nicht passiv — sie erfordert fortlaufende Aufmerksamkeit waehrend nachfolgender Arbeit.

1. Vor jeder Aktion pruefen: "Bedroht das etwas im Bewahrungsinventar?"
2. Wenn ja, einen alternativen Ansatz finden der das Ziel erreicht ohne den stabilen Zustand zu stoeren
3. Wenn Stoerung unvermeidbar ist, sie explizit anerkennen und das Inventar aktualisieren
4. Bewahrte Punkte periodisch erneut verifizieren — besonders nach komplexen Operationen
5. Wenn die Aufgabe abgeschlossen ist, bestaetigen dass bewahrte Punkte intakt geblieben sind

**Erwartet:** Der Arbeitszustand ueberlebt die aktuelle Aufgabe intakt. Aenderungen wurden nur wo noetig vorgenommen und haben funktionierende Komponenten nicht gestoert.

**Bei Fehler:** Wenn ein bewahrter Punkt versehentlich geaendert wurde, den Schaden sofort bewerten. Wenn die Aenderung etwas gebrochen hat, zuruecksetzen. Wenn die Aenderung neutral war, das Inventar aktualisieren. Das Inventar nicht veraltet lassen.

## Validierung

- [ ] Der Arbeitszustand wurde mit Verifikationsbelegen inventarisiert
- [ ] Stoerquellen wurden identifiziert und bewertet
- [ ] Verankerungsmassnahmen wurden auf jede reale Bedrohung angewendet
- [ ] Grenzen des Umfangs wurden waehrend der gesamten Aufgabe eingehalten
- [ ] Bewahrte Punkte wurden nach Abschluss erneut verifiziert

## Haeufige Stolperfallen

- **Annahmen als Fakten bewahren**: Nur verifiziertes Wissen verdient Schutz. Unverifizierte Annahmen als Fakten verkleidet erzeugen falsche Stabilitaet
- **Ueberbewahrung**: Alles gleichmaessig schuetzen verhindert notwendigen Wandel. Bewahrung muss selektiv sein — schuetzen was funktioniert, loslassen was nicht funktioniert
- **Passive Bewahrung**: Annehmen dass Dinge ohne aktive Verifikation stabil bleiben. Kontextdrift ist konstant; Bewahrung erfordert fortlaufende Aufmerksamkeit
- **Widerstand gegen berechtigten Wandel**: Bewahrung als Ausrede nutzen um noetige Aenderungen zu vermeiden. Wenn der Benutzer eine Aenderung an einer funktionierenden Komponente anfordert, hat das Vorrang vor der Bewahrung
- **Veraltetes Inventar**: Das Bewahrungsinventar nicht aktualisieren wenn neue Informationen eintreffen. Das Inventar muss die aktuelle Realitaet widerspiegeln, nicht den Zustand bei seiner Erstellung

## Verwandte Skills

- `shiva-bhaga` — Zerstoerung geht der Bewahrung voraus; was die Aufloesung ueberlebt ist das was Vishnu aufrechterhalt
- `brahma-bhaga` — Schoepfung baut auf dem bewahrten Fundament auf; neue Muster entstehen auf stabilem Grund
- `heal` — Subsystem-Bewertung deckt auf was tatsaechlich funktional ist im Gegensatz zu oberflaechlich stabil
- `observe` — anhaltendes neutrales Beobachten erkennt Abdrift bevor sie die Stabilitaet bedroht
- `awareness` — Situationsbewusstsein (Cooper-Farbcodes) bildet sich direkt auf Stoerungserkennung ab
