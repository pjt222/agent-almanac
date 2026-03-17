---
name: athanor
description: >
  Vierstufige alchemistische Code-Transmutation — Nigredo (Zersetzung), Albedo
  (Reinigung), Citrinitas (Erleuchtung), Rubedo (Synthese) — mit meditate-
  und heal-Pruefpunkten zwischen den Stufen. Verwandelt verwickelten oder
  Legacy-Code in optimierte, gut strukturierte Ausgabe durch systematische
  Materialanalyse. Verwenden beim Transformieren von Legacy-Code in moderne
  Aequivalente, beim Refactoring tief verwickelter Module, bei denen
  inkrementelle Korrekturen immer wieder scheitern, beim Konvertieren einer
  Codebasis zwischen Paradigmen oder wenn einfachere Refactoring-Ansaetze
  stagniert sind und eine vollstaendige Transformation noetig ist.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: multi
  tags: alchemy, transmutation, refactoring, transformation, four-stages, nigredo, albedo, citrinitas, rubedo
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Athanor

Eine vierstufige alchemistische Transmutation von Code oder Daten ausfuehren — die Prima Materia zersetzen, ihre Essenz reinigen, ihre Zielform erleuchten und die verfeinerte Ausgabe synthetisieren. Der Athanor ist der Ofen, der gleichmaessige Hitze ueber alle Stufen aufrechterhaelt.

## Wann verwenden

- Legacy-Code in moderne, gut strukturierte Aequivalente transformieren
- Tief verwickelte Module refactoren, bei denen inkrementelle Korrekturen immer wieder scheitern
- Eine Codebasis von einem Paradigma in ein anderes konvertieren (prozedural zu funktional, Monolith zu modular)
- Rohe, unordentliche Daten in saubere analytische Datensaetze verarbeiten
- Wenn einfachere Refactoring-Ansaetze stagniert sind und eine vollstaendige Transformation noetig ist

## Eingaben

- **Erforderlich**: Das zu transformierende Material (Dateipfade, Modulnamen oder Datenquellen)
- **Erforderlich**: Der gewuenschte Endzustand (Zielarchitektur, Paradigma oder Format)
- **Optional**: Bekannte Einschraenkungen (API muss erhalten bleiben, Datenbankschema darf nicht geaendert werden usw.)
- **Optional**: Fruehere fehlgeschlagene Transformationsversuche und warum sie stagniert sind

## Vorgehensweise

### Schritt 1: Nigredo — Zersetzung

Die Prima Materia in ihre Bestandteile zerlegen. Nichts ist heilig; alles wird katalogisiert.

1. Das Material vollstaendig inventarisieren:
   - Jede Funktion, Klasse, jedes Modul oder jede Datenentitaet auflisten
   - Alle Abhaengigkeiten kartieren (Imports, Aufrufe, Datenfluesse)
   - Versteckte Kopplung identifizieren (geteilte Globale, impliziter Zustand, Seiteneffekte)
2. Versteckte Annahmen aufdecken:
   - Auf welche undokumentierten Verhaltensweisen stuetzt sich der Code?
   - Welche Fehlerbedingungen werden stillschweigend geschluckt?
   - Welche Reihenfolge-Abhaengigkeiten bestehen?
3. Anti-Muster und technische Schulden katalogisieren:
   - God Objects, zirkulaere Abhaengigkeiten, Copy-Paste-Duplikation
   - Toter Code, unerreichbare Zweige, rudimentaere Features
   - Hartcodierte Werte, magische Zahlen, eingebettete Konfiguration
4. Das **Nigredo-Inventar** erstellen: einen strukturierten Katalog aller Elemente, Abhaengigkeiten, Annahmen und Anti-Muster

**Erwartet:** Ein vollstaendiges, schonungsloses Inventar des Materials. Das Inventar sollte sich unbequem anfuehlen — wenn nicht, ist die Zersetzung nicht gruendlich genug. Jede versteckte Annahme ist jetzt explizit.

**Bei Fehler:** Wenn das Material zu gross fuer eine vollstaendige Inventarisierung ist, nach Modulgrenzen zersetzen und jedes Modul als separaten Athanor-Durchlauf behandeln. Wenn Abhaengigkeiten zu verwickelt zum Kartieren sind, `grep`/`Grep` verwenden, um tatsaechliche Aufrufstellen zu verfolgen, anstatt sich auf Dokumentation zu verlassen.

### Schritt 2: Meditate — Kalzinations-Pruefpunkt

Den `meditate`-Skill ausfuehren, um waehrend des Nigredo angesammelte Annahmen zu klaeren.

1. Das Nigredo-Inventar beiseitelegen und den mentalen Kontext klaeren
2. Auf das in den Eingaben genannte Transformationsziel verankern
3. Beobachten, welche Verzerrungen das Nigredo eingefuehrt hat — hat die Zersetzung bestimmte Ansaetze unvermeidlich erscheinen lassen?
4. Vorzeitige Loesungsideen als "Tangente" kennzeichnen und zum Ziel zurueckkehren

**Erwartet:** Ein klarer, unvoreingenommener Zustand, bereit das Material zu bewerten, ohne an seine aktuelle Form gebunden zu sein. Das Ziel fuehlt sich frisch an, nicht durch die Befunde eingeschraenkt.

**Bei Fehler:** Wenn die Nigredo-Befunde die Aufmerksamkeit staendig anziehen (ein besonders schlimmes Anti-Muster, ein cleverer Hack, den man gerne behalten moechte), aufschreiben und explizit beiseitelegen. Erst fortfahren, wenn das Ziel klarer ist als die aktuelle Form.

### Schritt 3: Albedo — Reinigung

Das Wesentliche vom Zufaelligen trennen. Alles entfernen, was der Zielform nicht dient.

1. Aus dem Nigredo-Inventar jedes Element klassifizieren:
   - **Wesentlich**: Kern-Geschaeftslogik, unersetzliche Algorithmen, kritische Datentransformationen
   - **Zufaellig**: Framework-Boilerplate, Workarounds fuer alte Bugs, Kompatibilitaets-Shims
   - **Toxisch**: Anti-Muster, Sicherheitsluecken, toter Code
2. Die wesentlichen Elemente isoliert extrahieren:
   - Kernlogik aus Framework-Wrappern herausloesen
   - Datentransformation von I/O trennen
   - Schnittstellen von Implementierungen extrahieren
3. Toxische Elemente vollstaendig entfernen — dokumentieren, was entfernt wurde und warum
4. Fuer zufaellige Elemente feststellen, ob Aequivalente in der Zielform existieren
5. Das **Albedo-Extrakt** erstellen: gereinigte wesentliche Logik mit sauberen Schnittstellen

**Erwartet:** Ein Satz reiner, isolierter Funktionen/Module, die den Kernwert des Originalmaterials darstellen. Jedes Stueck ist isoliert testbar. Das Extrakt ist deutlich kleiner als das Original.

**Bei Fehler:** Wenn Wesentliches und Zufaelliges zu verflochten sind, um sie zu trennen, zuerst Nahtstellen (Schnittstellen) einfuehren. Wenn das Material sich der Reinigung widersetzt, muss moeglicherweise `dissolve-form` vor dem Athanor angewendet werden.

### Schritt 4: Heal — Reinigungsbewertung

Den `heal`-Skill ausfuehren, um zu bewerten, ob die Reinigung gruendlich war.

1. Das Albedo-Extrakt sichten: traegt irgendetwas noch toxische Rueckstaende?
2. Auf Abdrift pruefen: ist die Reinigung vom urspruenglichen Transformationsziel abgewichen?
3. Vollstaendigkeit bewerten: sind alle wesentlichen Elemente erfasst, oder wurden einige voreilig verworfen?
4. Bei Bedarf neu ausbalancieren: wesentliche Elemente wiederherstellen, die faelschlicherweise als zufaellig klassifiziert wurden

**Erwartet:** Vertrauen, dass das Albedo-Extrakt vollstaendig, sauber und bereit fuer die Erleuchtung ist. Keine wesentliche Logik wurde verloren; keine toxischen Muster verbleiben.

**Bei Fehler:** Wenn die Bewertung erhebliche Luecken aufdeckt, zu Schritt 3 mit den spezifisch identifizierten Luecken zurueckkehren. Nicht zur Citrinitas fortschreiten mit unvollstaendigem Material.

### Schritt 5: Citrinitas — Erleuchtung

Die Zielform sehen. Die gereinigten Elemente auf ihre optimale Struktur abbilden.

1. Mustererkennung: identifizieren, welche Entwurfsmuster den gereinigten Elementen dienen
   - Legt der Datenfluss Pipes/Filter, Event Sourcing, CQRS nahe?
   - Legen die Schnittstellen Strategy, Adapter, Facade nahe?
   - Legt die Modulstruktur hexagonal, geschichtet, Mikro-Kernel nahe?
2. Die Zielarchitektur entwerfen:
   - Jedes wesentliche Element auf seinen neuen Platz abbilden
   - Die Schnittstellen zwischen Komponenten definieren
   - Den Datenfluss durch die neue Struktur spezifizieren
3. Identifizieren, was neu erstellt werden muss (hat kein Aequivalent im Original):
   - Neue Abstraktionen, die duplizierte Logik vereinheitlichen
   - Neue Schnittstellen, die implizite Kopplung ersetzen
   - Neue Fehlerbehandlung, die stille Fehler ersetzt
4. Den **Citrinitas-Bauplan** erstellen: eine vollstaendige Abbildung vom Albedo-Extrakt zur Zielform

**Erwartet:** Ein klarer, detaillierter Bauplan, in dem jedes wesentliche Element eine Heimat hat und jede Schnittstelle definiert ist. Der Bauplan sollte sich unvermeidlich anfuehlen — angesichts der gereinigten Elemente ist diese Struktur die natuerliche Passung.

**Bei Fehler:** Wenn mehrere gueltige Architekturen konkurrieren, jede gegen die Einschraenkungen aus den Eingaben bewerten. Wenn kein klarer Sieger hervorgeht, die einfachste Option bevorzugen und die Alternativen als zukuenftige Optionen dokumentieren.

### Schritt 6: Meditate — Vorsynthese-Pruefpunkt

Den `meditate`-Skill ausfuehren, um sich auf die abschliessende Synthese vorzubereiten.

1. Den analytischen Kontext der Citrinitas klaeren
2. Auf den Citrinitas-Bauplan als Syntheseleitfaden verankern
3. Eventuelle Angst vor der Transformation beobachten — wird irgendetwas ueberhastet?
4. Bereitschaft bestaetigen: der Bauplan ist klar, das Material gereinigt, die Einschraenkungen bekannt

**Erwartet:** Ruhige Klarheit darueber, was gebaut werden muss. Die Synthesephase sollte Ausfuehrung sein, nicht Entwurf.

**Bei Fehler:** Wenn Zweifel am Bauplan bestehen bleiben, Schritt 5 mit den spezifischen Bedenken erneut besuchen. Besser den Bauplan verfeinern als die Synthese mit Unsicherheit beginnen.

### Schritt 7: Rubedo — Synthese

Die gereinigten Elemente zu ihrer Zielform zusammensetzen. Der Stein der Weisen: funktionierender, optimierter Code.

1. Die neue Struktur nach dem Citrinitas-Bauplan aufbauen:
   - Dateien, Module und Schnittstellen wie spezifiziert erstellen
   - Jedes wesentliche Element an seinen neuen Platz migrieren
   - Neue Abstraktionen und Schnittstellen implementieren
2. Die Komponenten verbinden:
   - Datenfluesse wie entworfen anschliessen
   - Fehlerweiterleitung durch neue Pfade implementieren
   - Dependency Injection oder Modulladung konfigurieren
3. Die Synthese verifizieren:
   - Funktioniert jede Komponente isoliert? (Unit-Tests)
   - Setzen sich die Komponenten korrekt zusammen? (Integrationstests)
   - Erzeugt das Gesamtsystem die gleichen Ausgaben wie das Original? (Regressionstests)
4. Gerueste entfernen:
   - Temporaere Kompatibilitaets-Shims loeschen
   - Migrationshilfen entfernen
   - Verbleibende Referenzen auf die alte Struktur bereinigen
5. Die **Rubedo-Ausgabe** erstellen: den transmutierten Code, voll funktionsfaehig in seiner neuen Form

**Erwartet:** Funktionierender Code, der messbar besser als das Original ist: weniger Zeilen, klarere Struktur, bessere Testabdeckung, weniger Abhaengigkeiten. Die Transformation ist abgeschlossen und die alte Form kann in den Ruhestand versetzt werden.

**Bei Fehler:** Wenn die Synthese Luecken im Bauplan aufdeckt, nicht flicken — zu Schritt 5 (Citrinitas) zurueckkehren, um den Entwurf zu ueberarbeiten. Wenn einzelne Komponenten scheitern, sie isolieren und reparieren, bevor die vollstaendige Integration versucht wird. Das Rubedo darf keine halb-transformierte Chimaere erzeugen.

## Validierung

- [ ] Nigredo-Inventar ist vollstaendig (alle Elemente, Abhaengigkeiten, Annahmen katalogisiert)
- [ ] Meditate-Pruefpunkt zwischen Nigredo/Albedo bestanden (Annahmen geklaert)
- [ ] Albedo-Extrakt enthaelt nur wesentliche Elemente mit sauberen Schnittstellen
- [ ] Heal-Bewertung bestaetigt Reinigungsvollstaendigkeit
- [ ] Citrinitas-Bauplan bildet jedes wesentliche Element auf die Zielform ab
- [ ] Meditate-Pruefpunkt zwischen Citrinitas/Rubedo bestanden (bereit zur Synthese)
- [ ] Rubedo-Ausgabe besteht Regressionstests gegen das Originalverhalten
- [ ] Rubedo-Ausgabe ist messbar verbessert (Komplexitaet, Kopplung, Testabdeckung)
- [ ] Keine toxischen Elemente haben die endgueltige Ausgabe ueberlebt
- [ ] Transformationseinschraenkungen aus den Eingaben sind erfuellt

## Haeufige Stolperfallen

- **Nigredo-Tiefe ueberspringen**: Hastige Zersetzung bedeutet, dass versteckte Kopplung waehrend der Synthese auftaucht. Vollstaendig in das Inventar investieren
- **Zufaellige Komplexitaet bewahren**: Bindung an clevere Workarounds oder "funktioniert doch, nicht anfassen"-Code. Wenn es nicht wesentlich ist, muss es weg
- **Meditate-Pruefpunkte ueberspringen**: Kognitive Traegheit von einer Stufe verzerrt die naechste. Die Pausen sind strukturell, nicht optional
- **Bauplanlose Synthese**: Mit dem Coden beginnen, bevor Citrinitas abgeschlossen ist, erzeugt Flickwerk, keine Transmutation
- **Unvollstaendige Regressionstests**: Das Rubedo muss das Originalverhalten reproduzieren. Ungetestete Pfade werden lautlos brechen
- **Scope-Creep waehrend Citrinitas**: Die Erleuchtungsphase enthuellt Verbesserungsmoeglichkeiten jenseits des urspruenglichen Ziels. Notieren aber nicht verfolgen — der Athanor dient der angegebenen Transformation, nicht einem hypothetischen Ideal

## Verwandte Skills

- `transmute` — Leichtgewichtigere Transformation fuer einzelne Funktionen oder kleine Module
- `chrysopoeia` — Wertextraktion und Optimierung (aus Basis-Code Gold machen)
- `meditate` — Metakognitive Klaerung als Stufentor-Pruefpunkte verwendet
- `heal` — Subsystem-Bewertung fuer die Reinigungsvalidierung verwendet
- `dissolve-form` — Wenn Material zu starr fuer den Athanor ist, zuerst aufloesen
- `adapt-architecture` — Komplementaerer Ansatz fuer Migrationsmuster auf Systemebene
- `review-software-architecture` — Architekturpruefung nach der Synthese
