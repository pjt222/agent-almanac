---
name: manage-tcg-collection
locale: de
source_locale: en
source_commit: a87e5e03
translator: claude
translation_date: "2026-03-17"
description: >
  Eine Sammelkartenspiel-Sammlung organisieren, verfolgen und bewerten. Umfasst
  Inventarmethoden, Aufbewahrungspraktiken, zustandsbasierte Bewertung,
  Wunschlistenverwaltung und Sammlungsanalysen fuer Pokemon, MTG, Flesh and
  Blood und Kayou-Karten. Anwenden beim Start einer neuen Sammlung und
  Einrichten der Bestandsverfolgung, beim Katalogisieren einer bestehenden
  Sammlung die ueber informelles Wissen hinausgewachsen ist, bei der Bewertung
  einer Sammlung fuer Versicherung oder Verkauf, oder bei der Entscheidung
  welche Karten fuer professionelles Grading eingereicht werden sollen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: basic
  language: natural
  tags: tcg, collection, inventory, storage, valuation, pokemon, mtg, fab, kayou
---

# Sammelkartenspiel-Sammlung verwalten

Eine Sammelkartenspiel-Sammlung mit strukturierter Bestandsverfolgung, sachgemaesser Aufbewahrung und datengetriebener Bewertung organisieren, inventarisieren und bewerten.

## Wann verwenden

- Start einer neuen Sammlung und Einrichtung der Bestandsverfolgung von Anfang an
- Katalogisierung einer bestehenden Sammlung die ueber informelles Wissen hinausgewachsen ist
- Bewertung einer Sammlung fuer Versicherung, Verkauf oder Nachlasszwecke
- Verwaltung von Wunschlisten und Tauschordnern zum Erwerb bestimmter Karten
- Entscheidung welche Karten basierend auf Wertpotenzial fuer professionelles Grading eingereicht werden sollen

## Eingaben

- **Erforderlich**: Kartenspiel(e) in der Sammlung (Pokemon, MTG, FaB, Kayou usw.)
- **Erforderlich**: Sammlungsumfang (gesamte Sammlung, bestimmte Sets oder bestimmte Karten)
- **Optional**: Aktuelles Inventarsystem (Tabelle, App, physische Ordnerorganisation)
- **Optional**: Sammlungsziel (komplette Sets, kompetitives Spielen, Investment, Nostalgie)
- **Optional**: Budget fuer Aufbewahrungs- und Grading-Zubehoer

## Vorgehensweise

### Schritt 1: Das Inventarsystem einrichten

Ein Bestandsverfolgungssystem einrichten das der Sammlungsgroesse entspricht.

1. Eine Inventarmethode basierend auf der Sammlungsgroesse waehlen:

```
Sammlungsgroessen-Leitfaden:
+-----------+-------+-------------------------------------------+
| Groesse   | Karten| Empfohlenes System                        |
+-----------+-------+-------------------------------------------+
| Klein     | <200  | Tabelle (Google Sheets, Excel)             |
| Mittel    | 200-  | Spezial-App (TCGPlayer, Moxfield,          |
|           | 2000  | PokeCollector, Collectr)                   |
| Gross     | 2000+ | Datenbank + App-Kombination mit            |
|           |       | Barcode-Scanning                           |
+-----------+-------+-------------------------------------------+
```

2. Die zu verfolgenden Datenfelder fuer jede Karte definieren:
   - **Identitaet**: Set, Kartennummer, Name, Variante (Holo, Reverse, Full Art)
   - **Zustand**: Rohzustand-Schaetzung (NM, LP, MP, HP, DMG) oder numerischer Grad
   - **Menge**: Wie viele Exemplare vorhanden
   - **Standort**: Wo die Karte aufbewahrt wird (Ordnerseite, Box-Bezeichnung, Grading-Slab)
   - **Erwerb**: Erwerbsdatum, bezahlter Preis, Quelle (Pack, Kauf, Tausch)
   - **Wert**: Aktueller Marktwert zum Zustand, Datum der letzten Aktualisierung
3. Das gewaehlte System mit diesen Feldern einrichten
4. Einen Aktualisierungsrhythmus festlegen (woechentlich fuer aktive Sammler, monatlich fuer stabile Sammlungen)

**Erwartet:** Ein funktionsfaehiges Inventarsystem mit definierten Feldern, bereit fuer die Dateneingabe. Das System passt zur Sammlungsgroesse — nicht ueberentwickelt fuer eine kleine Sammlung, nicht unterdimensioniert fuer eine grosse.

**Bei Fehler:** Wenn die ideale App fuer das Spiel/die Plattform nicht verfuegbar ist, eine Tabelle verwenden. Das Format ist weniger wichtig als Konsistenz. Eine einfache Tabelle die regelmaessig aktualisiert wird ist besser als eine ausgefeilte App die nach einer Woche aufgegeben wird.

### Schritt 2: Die Sammlung katalogisieren

Vorhandene Karten in das Inventarsystem eingeben.

1. Karten physisch sortieren bevor sie digital erfasst werden:
   - Nach Set (alle Karten eines Sets zusammen)
   - Innerhalb eines Sets nach Kartennummer (aufsteigend)
   - Varianten mit ihrer Basiskarte gruppiert
2. Karten in das System eingeben:
   - Masseneingabe nutzen wo verfuegbar (Barcode-Scanning, Set-Checklisten)
   - Zustand ehrlich erfassen — Ueberbewertung eigener Karten fuehrt zu Bewertungsfehlern
   - Karten mit besonderer Provenienz vermerken (signiert, Erstauflage, Turnierpreise)
3. Fuer grosse Sammlungen in Sitzungen arbeiten:
   - Ein Set oder eine Aufbewahrungsbox pro Sitzung bearbeiten
   - Fortschritt klar markieren (welche Boxen/Ordner sind erledigt)
   - Eine Zufallsstichprobe jeder Sitzung auf Richtigkeit pruefen
4. Mit Set-Checklisten abgleichen um Vervollstaendigungsraten zu ermitteln

**Erwartet:** Jede Karte der Sammlung mit genauen Zustands- und Standortdaten erfasst. Vervollstaendigungsraten fuer jedes gesammelte Set bekannt.

**Bei Fehler:** Wenn die Sammlung fuer manuelle Eingabe zu gross ist, priorisieren: zuerst alle seltenen/wertvollen Karten erfassen, dann Common-Karten per Set mit geschaetzten Mengen massenerfassen. Ein zu 80% genaues Inventar ist weit besser als gar keins.

### Schritt 3: Physische Aufbewahrung organisieren

Karten ihrem Wert und ihrer Verwendung entsprechend aufbewahren.

1. Das **Aufbewahrungsstufensystem** anwenden:

```
Aufbewahrungsstufen:
+----------+---------------+----------------------------------------------+
| Stufe    | Kartenwert    | Aufbewahrungsmethode                         |
+----------+---------------+----------------------------------------------+
| Premium  | >50€          | Toploader + Teamhuelle, oder Pennysleeve in  |
|          |               | Magnetcase. Aufrecht in einer Box gelagert.  |
| Standard | 5€-50€        | Pennysleeve + Toploader oder Ordner mit       |
|          |               | seitlich ladenden Huellen.                   |
| Masse    | <5€           | Reihenbox (BCW 800er oder aehnlich), nach     |
|          |               | Set sortiert. Keine Einzelhuellen noetig.     |
| Bewertet | Alle (Slab)   | Aufrecht in Grading-Kartenbox. Nie schwer     |
|          |               | stapeln.                                     |
+----------+---------------+----------------------------------------------+
```

2. Umgebungskontrolle:
   - An einem kuehlen, trockenen, dunklen Ort aufbewahren (nicht Dachboden, nicht Keller)
   - Direktes Sonnenlicht, Feuchtigkeit und Temperaturschwankungen vermeiden
   - Silikagel-Paeckchen in Aufbewahrungsboxen fuer Feuchtigkeitskontrolle verwenden
3. Alles beschriften:
   - Jede Box mit Inhalt beschriftet (Setname, Kartenbereich, Einlagerungsdatum)
   - Jede Ordnerseite entspricht Inventar-Standortcodes
   - Bewertete Karten mit Inventar-ID gekennzeichnet die dem digitalen System entspricht
4. Das Inventarsystem mit Aufbewahrungsstandorten aktualisieren

**Erwartet:** Jede Karte ihrem Wert entsprechend aufbewahrt mit Standortdaten im Inventar. Premiumkarten sind geschuetzt, Massenkarten sind organisiert und zugaenglich.

**Bei Fehler:** Wenn Premium-Aufbewahrungszubehoer nicht sofort verfuegbar ist, sind Pennysleeves + Toploader immer das Minimum fuer jede Karte ueber 10€ Wert. Aufbewahrung aufruesten wenn Zubehoer verfuegbar wird; die Prioritaet ist wertvolle Karten in irgendeine Form von Schutz zu bringen.

### Schritt 4: Die Sammlung bewerten

Aktuelle Marktwerte berechnen.

1. Eine Preisquelle waehlen:
   - **TCGPlayer-Marktpreis**: Am gaengigsten fuer den US-Markt (MTG, Pokemon)
   - **CardMarket**: Standard fuer den europaeischen Markt
   - **eBay-Verkaufshistorie**: Am besten fuer seltene/einzigartige Stuecke ohne Standardpreise
   - **PSA/BGS-Preisfuehrer**: Speziell fuer bewertete Karten
2. Werte fuer alle Standard- und Premium-Stufenkarten aktualisieren
3. Fuer Massenkarten Set-uebergreifende Massenpreise statt Einzelrecherchen verwenden
4. Sammlungszusammenfassung berechnen:

```
Sammlungswert-Zusammenfassung:
+--------------------+--------+--------+
| Kategorie          | Anzahl | Wert   |
+--------------------+--------+--------+
| Bewertete Karten   |        | €      |
| Premium unbew.     |        | €      |
| Standardkarten     |        | €      |
| Massenkarten       |        | €      |
+--------------------+--------+--------+
| GESAMT             |        | €      |
+--------------------+--------+--------+
```

5. Grading-Kandidaten identifizieren: Karten bei denen die Gradingpraemie die Gradingkosten uebersteigt
   - Faustregel: Grading wenn (erwarteter Gradingwert - Rohwert) > 2x Gradingkosten

**Erwartet:** Eine aktuelle Bewertung der Sammlung mit Einzelwerten fuer bedeutende Karten und Gesamtwerten fuer Massenware. Grading-Kandidaten identifiziert.

**Bei Fehler:** Wenn Preisdaten veraltet oder nicht verfuegbar sind, das Preisdatum und die Quelle vermerken. Fuer sehr seltene Karten mehrere Quellen pruefen und den Median verwenden. Nie auf einen einzelnen Ausreisserverkauf vertrauen.

### Schritt 5: Pflegen und optimieren

Laufende Routinen zur Sammlungsverwaltung etablieren.

1. **Regelmaessige Aktualisierungen** (gemaess Rhythmus aus Schritt 1):
   - Neue Zugaenge sofort erfassen
   - Werte fuer Premium-Stufe vierteljaehrlich, Standard-Stufe halbjaehrlich aktualisieren
   - Aufbewahrungsstufe bei Wertaenderungen neu bewerten
2. **Wunschlistenverwaltung**:
   - Eine Liste gewuenschter Karten mit Hoechstpreisen fuehren
   - Wunschliste mit Tauschordner-Bestand abgleichen
   - Preisalarme setzen wo die Inventar-App dies unterstuetzt
3. **Sammlungsanalysen**:
   - Gesamtwert ueber die Zeit verfolgen (monatliche Momentaufnahmen)
   - Set-Vervollstaendigungsraten beobachten
   - Konzentrationsrisiko identifizieren (zu viel Wert in einer Karte/einem Set)
4. **Periodische Pruefung** (jaehrlich):
   - Physische Zaehlung vs. Inventarzaehlung fuer eine Zufallsstichprobe
   - Aufbewahrungsbedingungen pruefen (auf Feuchtigkeit, Schaedlingsbefall pruefen)
   - Grading-Kandidaten basierend auf aktuellen Werten ueberpruefen und aktualisieren

**Erwartet:** Ein lebendes Sammlungsverwaltungssystem das aktuell bleibt und informierte Entscheidungen ueber Kauf, Verkauf, Grading und Tausch unterstuetzt.

**Bei Fehler:** Wenn die Pflege nachlasst, priorisieren: zuerst Premium-Stufenwerte aktualisieren, dann neue Zugaenge nacherfassen. Das Wichtigste ist zu wissen was die wertvollsten Karten heute wert sind.

## Validierung

- [ ] Inventarsystem mit angemessenen Datenfeldern eingerichtet
- [ ] Alle Karten mit Zustands- und Standortdaten katalogisiert
- [ ] Physische Aufbewahrung entspricht den Kartenwert-Stufen
- [ ] Umgebungskontrollen vorhanden (kuehl, trocken, dunkel)
- [ ] Sammlung mit aktuellen Marktpreisen und Daten bewertet
- [ ] Grading-Kandidaten mit Kosten-Nutzen-Analyse identifiziert
- [ ] Pflegerhythmus festgelegt und eingehalten
- [ ] Wunschliste fuer Erwerbsziele gefuehrt

## Haeufige Stolperfallen

- **Eigene Karten ueberbewerten**: Sammler bewerten ihre eigenen Karten durchgehend 1-2 Grade hoeher als die Realitaet. Ehrlich sein oder `grade-tcg-card` fuer strukturierte Bewertung verwenden
- **Massenware ignorieren**: Massenkarten akkumulieren kollektiv Wert. Eine Box mit 800 Common-Karten zu je 0,10€ sind 80€ — es lohnt sich diese zu verfolgen
- **Schlechte Aufbewahrungsumgebung**: Feuchtigkeit und Temperaturschwankungen schaedigen Karten schneller als Handhabung. Die Umgebung ist wichtiger als Huellen
- **Veraltete Bewertungen**: Kartenmaerkte bewegen sich. Eine 6 Monate alte Bewertung kann voellig ungenau sein, besonders rund um Set-Veroeffentlichungen oder Bannankuendigungen
- **Kein Backup**: Digitales Inventar ohne Backup ist fragil. Monatlich als CSV exportieren. Premiumkarten fuer die Versicherung fotografieren

## Verwandte Skills

- `grade-tcg-card` — Strukturiertes Kartengrading fuer genaue Zustandsbewertung
- `build-tcg-deck` — Deckbau unter Nutzung des Sammlungsinventars
