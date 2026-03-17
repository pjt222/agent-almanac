---
name: adapt-architecture
description: >
  Strukturelle Metamorphose mittels Strangler-Fig-Migration, Chrysalis-Phasen
  und Schnittstellenbewahrung ausfuehren. Umfasst Transformationsplanung,
  Parallelbetrieb, progressive Umstellung, Rollback-Design und
  Post-Metamorphose-Stabilisierung fuer die Evolution von Systemarchitekturen.
  Verwenden, wenn assess-form das System als BEREIT fuer die Transformation
  klassifiziert hat, bei Migration von Monolith zu Microservices, beim Ersetzen
  eines Kernteilsystems waehrend abhaengige Systeme weiterlaufen, oder wenn
  eine Architekturanpassung schrittweise statt als Big-Bang erfolgen muss.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, adaptation, architecture, migration, strangler-fig
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Architektur anpassen

Strukturelle Metamorphose ausfuehren — die Architektur eines Systems von seiner aktuellen Form in eine Zielform transformieren und dabei die betriebliche Kontinuitaet aufrechterhalten. Verwendet Strangler-Fig-Migration, Chrysalis-Phasen und Schnittstellenbewahrung, um sicherzustellen, dass das System waehrend der Transformation nie aufhoert zu funktionieren.

## Wann verwenden

- Formanalyse (siehe `assess-form`) hat das System als BEREIT klassifiziert
- Ein System muss seine Architektur weiterentwickeln, um neue Anforderungen ohne Ausfallzeit zu erfuellen
- Migration von Monolith zu Microservices (oder umgekehrt)
- Ersetzen eines Kernteilsystems waehrend abhaengige Systeme weiterlaufen
- Weiterentwicklung eines Datenmodells bei Beibehaltung der Abwaertskompatibilitaet
- Jede Architekturanpassung, die schrittweise statt als Big-Bang erfolgen muss

## Eingaben

- **Erforderlich**: Aktuelle Formanalyse (von `assess-form` oder gleichwertiger Analyse)
- **Erforderlich**: Zielarchitektur (was das System werden soll)
- **Erforderlich**: Anforderungen an die betriebliche Kontinuitaet (was waehrend der Transformation nicht ausfallen darf)
- **Optional**: Verfuegbares Transformationsbudget (Zeit, Personen, Rechenleistung)
- **Optional**: Rollback-Anforderungen (wie weit muessen wir zurueckgehen koennen?)
- **Optional**: Parallelbetriebsdauer (wie lange sollen Alt und Neu gleichzeitig laufen?)

## Vorgehensweise

### Schritt 1: Transformations-Blueprint entwerfen

Den Metamorphose-Pfad von der aktuellen Form zur Zielform planen.

1. Die Transformation als Abfolge von Zwischenformen abbilden:
   - Aktuelle Form → Zwischenform 1 → ... → Zielform
   - Jede Zwischenform muss betriebsfaehig sein (kann Traffic bedienen, Tests bestehen)
   - Keine Zwischenform sollte schwieriger zu warten sein als die aktuelle Form
2. Die Transformationsnaehte identifizieren:
   - Wo kann die aktuelle Form "geschnitten" werden, um die neue Architektur einzufuegen?
   - Natuerliche Naehte: bestehende Schnittstellen, Modulgrenzen, Datenpartitionen
   - Kuenstliche Naehte: Schnittstellen, die speziell fuer den Schnitt erstellt wurden (Anti-Corruption-Layer)
3. Das Metamorphose-Muster waehlen:
   - **Strangler Fig**: Neues System waechst um das alte herum und ersetzt es schrittweise
   - **Chrysalis**: Altes System wird in eine neue Huelle verpackt; Interna werden ersetzt, waehrend die Huelle die externe Schnittstelle bewahrt
   - **Budding**: Neues System waechst neben dem alten; Traffic wird schrittweise umgeleitet (siehe `scale-colony` fuer Kolonie-Budding)
   - **Metamorphe Migration**: Phasenweise Ersetzung von Komponenten in Abhaengigkeitsreihenfolge (Blaetter zuerst, Wurzeln zuletzt)
4. Die Schnittstellenbewahrungsschicht entwerfen:
   - Externe Konsumenten duerfen keine Stoerung erfahren
   - API-Versionierung, abwaertskompatible Vertraege, Adapter-Muster
   - Die Bewahrungsschicht ist temporaeres Geruest — ihre Entfernung planen

```
Metamorphosis Patterns:
┌───────────────┬───────────────────────────────────────────────────┐
│ Strangler Fig │ New code intercepts routes one by one;            │
│               │ old code handles everything else until replaced   │
│               │ ┌──────────┐                                     │
│               │ │ Old ████ │ → │ Old ██ New ██ │ → │ New ████ │  │
│               │ └──────────┘                                     │
├───────────────┼───────────────────────────────────────────────────┤
│ Chrysalis     │ Wrap old system in new interface; replace         │
│               │ internals while external shell stays stable       │
│               │ ┌──────────┐     ┌──[new]───┐     ┌──[new]───┐  │
│               │ │ old core │ → │ old core │ → │ new core │  │
│               │ └──────────┘     └──────────┘     └──────────┘  │
├───────────────┼───────────────────────────────────────────────────┤
│ Budding       │ New system runs in parallel; traffic shifts       │
│               │ ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐         │
│               │ │ Old  │ │ New  │  →  │ Old  │ │ New  │         │
│               │ │ 100% │ │  0%  │     │  0%  │ │ 100% │         │
│               │ └──────┘ └──────┘     └──────┘ └──────┘         │
└───────────────┴───────────────────────────────────────────────────┘
```

**Erwartet:** Ein Transformations-Blueprint, der Zwischenformen, Naehte, das gewaehlte Metamorphose-Muster und die Schnittstellenbewahrungsstrategie zeigt. Jeder Schritt ist konkret und testbar.

**Bei Fehler:** Wenn keine saubere Naht gefunden werden kann, muss das System moeglicherweise vorab aufgeloest werden (siehe `dissolve-form`), um Naehte vor der Transformation zu schaffen. Wenn die Zwischenformen nicht betriebsfaehig sind, sind die Transformationsschritte zu gross — in kleinere Inkremente zerlegen.

### Schritt 2: Geruest aufbauen

Die temporaere Infrastruktur konstruieren, die die Metamorphose unterstuetzt.

1. Anti-Corruption-Layer erstellen:
   - Eine duenne Uebersetzungsschicht zwischen dem alten und neuen System
   - Leitet Anfragen basierend auf dem Migrationsstatus an das entsprechende System (alt oder neu) weiter
   - Uebersetzt Datenformate zwischen alter und neuer Darstellung
   - Diese Schicht ist der "Kokon", der die Transformation schuetzt
2. Parallelbetrieb-Infrastruktur aufsetzen:
   - Beide Systeme (alt und neu) muessen gleichzeitig deploybar sein
   - Feature-Flags steuern, welches System welchen Traffic behandelt
   - Vergleichsmechanismen validieren, dass alt und neu aequivalente Ergebnisse liefern
3. Rollback-Kontrollpunkte einrichten:
   - Bei jeder Zwischenform sicherstellen, dass ein Rollback zur vorherigen Form moeglich ist
   - Rollback muss schneller sein als der Vorwaerts-Transformationsschritt
   - Datenmigration muss reversibel sein (oder Daten muessen waehrend der Transition doppelt geschrieben werden)
4. Validierungs-Harnisch aufbauen:
   - Automatisierte Tests, die die betriebliche Kontinuitaet bei jeder Zwischenform verifizieren
   - Performance-Benchmarks, die Regressionen erkennen
   - Datenintegritaetspruefungen, die Migrationsfehler auffangen

**Erwartet:** Geruest-Infrastruktur (Anti-Corruption-Layer, Parallelbetrieb, Rollback, Validierung) ist vorhanden, bevor eine Transformation beginnt. Das Geruest selbst ist getestet und verifiziert.

**Bei Fehler:** Wenn das Geruest zu aufwaendig ist, vereinfachen: Das minimale Geruest ist ein Feature-Flag und ein Rollback-Verfahren. Anti-Corruption-Layer und Parallelbetrieb erhoehen die Sicherheit, sind aber fuer kleinere Transformationen nicht immer noetig.

### Schritt 3: Progressive Umstellung durchfuehren

Funktionalitaet schrittweise von der alten Form in die neue Form migrieren.

1. Komponenten fuer die Migration ordnen:
   - Mit der am wenigsten gekoppelten, risikoaermsten Komponente beginnen (Vertrauen aufbauen)
   - Zu kritischeren, staerker gekoppelten Komponenten fortschreiten
   - Die am staerksten gekoppelte/kritischste Komponente fuer zuletzt aufheben (das Team hat dann Erfahrung)
2. Fuer jede Komponente:
   a. Die neue Version hinter dem Anti-Corruption-Layer implementieren
   b. Parallel betreiben: sowohl alt als auch neu verarbeiten dieselben Eingaben
   c. Ausgaben vergleichen — sie sollten aequivalent sein (oder die Unterschiede sollten erwartet und dokumentiert sein)
   d. Bei Zuversicht den Traffic auf die neue Version umschalten (Feature-Flag-Wechsel)
   e. Auf Anomalien ueberwachen (Monitoring-Empfindlichkeit nach der Umstellung erhoehen)
   f. Nach einer Stabilitaetsphase die alte Version dieser Komponente stilllegen
3. Kontinuierliche Auslieferung durchgehend aufrechterhalten:
   - Jeder Umstellungsschritt ist ein normales Deployment, kein Sonderereignis
   - Das System befindet sich immer in einem bekannten, getesteten, betriebsfaehigen Zustand
   - Wenn eine Umstellung Probleme verursacht, auf den vorherigen Zustand zurueckrollen (der noch betriebsfaehig ist)

**Erwartet:** Funktionalitaet migriert Komponente fuer Komponente mit Validierung bei jedem Schritt. Das System ist immer betriebsfaehig. Jede Umstellung baut Vertrauen fuer die naechste auf.

**Bei Fehler:** Wenn der Parallelbetrieb Diskrepanzen aufdeckt, hat die neue Implementierung einen Fehler — vor der Umstellung beheben. Wenn eine Umstellung Performance-Verschlechterung verursacht, benoetigt die neue Komponente moeglicherweise Optimierung oder der Anti-Corruption-Layer erzeugt zu viel Overhead. Wenn das Team mitten in der Migration das Vertrauen verliert, pausieren und stabilisieren — ein halb-migriertes System in einem bekannten Zustand ist weit besser als eine ueberstuerzte vollstaendige Migration.

### Schritt 4: Chrysalis-Phase managen

Die verwundbarste Phase navigieren — wenn sich das System zwischen den Formen befindet.

1. Die Chrysalis-Realitaet anerkennen:
   - Waehrend der Migration ist das System teils alt und teils neu
   - Dieser Hybridzustand ist inherent komplexer als jeder reine Zustand
   - Komplexitaet erreicht den Hoehepunkt am Mittelpunkt der Migration und nimmt dann ab
2. Chrysalis-Disziplin:
   - Keine neuen Features waehrend der Chrysalis-Phase (nur Transformation)
   - Minimale externe Aenderungen (nicht-essentielle Deployments einfrieren)
   - Erhoehtes Monitoring und Bereitschaftsabdeckung
   - Taegliche Check-ins zum Migrationsfortschritt und Systemzustand
3. Chrysalis-Zwischenbewertung:
   - Am Halbzeitpunkt bewerten: Ist die Zielform noch das richtige Ziel?
   - Hat sich etwas geaendert (Markt, Anforderungen, Team), das das Ziel beeinflusst?
   - Sollte die Transformation fortgesetzt, pausiert oder umgeleitet werden?
4. Die Chrysalis schuetzen:
   - Den Rollback-Pfad jederzeit freihalten
   - Den aktuellen Hybridzustand gruendlich dokumentieren (zukuenftige Debugger werden es brauchen)
   - Der Versuchung widerstehen, temporaeres Geruest vor Abschluss der Migration "aufzuraeumen"

**Erwartet:** Die Chrysalis-Phase wird als bewusste, zeitlich begrenzte Periode mit erhoehter Disziplin und Monitoring gefuehrt. Das Team versteht, dass temporaere Komplexitaet der Preis fuer sichere Transformation ist.

**Bei Fehler:** Wenn die Chrysalis-Phase zu lange dauert, wird der Hybridzustand zum neuen Normal — was schlimmer ist als alt oder neu. Ein Zeitlimit setzen. Wenn das Limit erreicht ist, entweder die verbleibende Migration beschleunigen oder den Hybridzustand als "neue Form" akzeptieren und stabilisieren.

### Schritt 5: Metamorphose abschliessen und stabilisieren

Die Transformation beenden und das Geruest entfernen.

1. Finale Umstellung:
   - Die letzte(n) Komponente(n) in die neue Form migrieren
   - Vollstaendige Validierungssuite gegen das komplette neue System laufen lassen
   - Performance-Test unter produktionsaequivalenter Last
2. Geruest entfernen:
   - Anti-Corruption-Layer stilllegen (wird nicht mehr benoetigt)
   - Feature-Flags im Zusammenhang mit der Migration entfernen
   - Parallelbetrieb-Infrastruktur bereinigen
   - Den alten Systemcode archivieren (nicht loeschen) zur Referenz
3. Post-Metamorphose-Stabilisierung:
   - 2-4 Wochen in der neuen Form mit erhoehtem Monitoring betreiben
   - Alle Probleme behandeln, die unter realen Bedingungen auftreten
   - Dokumentation aktualisieren, um die neue Architektur widerzuspiegeln
4. Retrospektive:
   - Was lief gut bei der Transformation?
   - Was war schwieriger als erwartet?
   - Was wuerden wir naechstes Mal anders machen?
   - Das Transformations-Playbook des Teams aktualisieren

**Erwartet:** Die Transformation ist abgeschlossen. Das System arbeitet in seiner neuen Form. Das Geruest ist entfernt. Die Dokumentation ist aktualisiert. Das Team hat Erkenntnisse fuer zukuenftige Transformationen festgehalten.

**Bei Fehler:** Wenn die neue Form nach der Umstellung instabil ist, den Rollback-Pfad aufrechterhalten und die Stabilisierung fortsetzen. Wenn die Stabilisierung laenger dauert als geplant, liegt moeglicherweise ein Designproblem in der neuen Architektur vor — abwaegen, ob gezielte Korrekturen oder ein teilweiser Rollback der problematischsten Komponente angemessen sind.

## Validierung

- [ ] Transformations-Blueprint zeigt tragfaehige Zwischenformen
- [ ] Geruest (Anti-Corruption-Layer, Rollback, Validierungs-Harnisch) ist vor Migrationsbeginn vorhanden
- [ ] Komponenten migrieren in der Reihenfolge vom niedrigsten zum hoechsten Risiko
- [ ] Parallelbetrieb validiert Aequivalenz bei jedem Schritt
- [ ] Chrysalis-Phase ist zeitlich begrenzt mit Feature-Freeze-Disziplin
- [ ] Gesamtes Geruest wird nach Abschluss der Transformation entfernt
- [ ] Post-Metamorphose-Stabilisierungsphase verlaeuft ohne kritische Probleme
- [ ] Retrospektive erfasst Erkenntnisse

## Haeufige Stolperfallen

- **Big-Bang-Migration**: Versuch, alles auf einmal zu transformieren. Dies gibt die Sicherheit der inkrementellen Umstellung auf und maximiert den Wirkungsradius. Immer inkrementell migrieren
- **Permanentes Geruest**: Anti-Corruption-Layer und Feature-Flags, die nie entfernt werden, werden zu technischen Schulden. Die Geruest-Entfernung als Teil der Transformation planen, nicht als Nachgedanke
- **Chrysalis-Leugnung**: So zu tun, als waere der Hybridzustand normal, fuehrt zu Feature-Entwicklung auf instabilen Grundlagen. Die Chrysalis-Phase anerkennen und ihre Disziplin durchsetzen
- **Zielfixierung**: So sehr auf die Zielarchitektur festgelegt sein, dass Anzeichen einer besseren Alternative ignoriert werden. Die Chrysalis-Zwischenbewertung existiert aus diesem Grund
- **Transformationsmuedigkeit**: Lange Migrationen erschoepfen Teams. Jeden Transformationsschritt klein genug halten, um in Tagen statt Wochen abgeschlossen zu werden. Meilensteine feiern, um die Dynamik aufrechtzuerhalten

## Verwandte Skills

- `assess-form` — Voraussetzungsanalyse, die bestimmt, ob das System fuer die Transformation bereit ist
- `dissolve-form` — fuer Systeme, die zu starr fuer eine direkte Transformation sind; Aufloesung schafft die hier benoetigten Naehte
- `repair-damage` — Wiederherstellungs-Skill fuer den Fall, dass die Transformation Schaeden einfuehrt
- `shift-camouflage` — Oberflaechenanpassung, die ohne tiefgreifende Architekturanpassung ausreichen kann
- `coordinate-swarm` — Schwarmkoordination informiert die Sequenzierung der Transformation ueber verteilte Systeme
- `scale-colony` — Wachstumsdruck ist ein haeufiger Ausloeser fuer Architekturanpassung
- `implement-gitops-workflow` — GitOps liefert die Deployment-Infrastruktur fuer progressive Umstellung
- `review-software-architecture` — ergaenzender Review-Skill zur Bewertung der Zielarchitektur
