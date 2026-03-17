---
name: prune-agent-memory
description: >
  Gespeicherte Erinnerungen auditieren, klassifizieren und selektiv loeschen.
  Umfasst Speicher-Enumeration und -Klassifizierung nach Typ, Alter und
  Zugriffshaeufigkeit, Veraltungserkennunug fuer veraltete Referenzen,
  Genauigkeitspruefungen anhand externer Anker, einen Entscheidungsbaum
  fuer selektives Loeschen, praeventiive Filterregeln fuer Inhalte die nie
  als Erinnerungen gespeichert werden sollten, und ein Audit-Trail, sodass
  das Vergessen selbst ueberprufbar ist. Verwenden, wenn der Speicher gross
  und unkuratiert geworden ist, wenn sich der Projektstatus seit dem Schreiben
  der Erinnerungen wesentlich veraendert hat, wenn die Abrufqualitaet
  abgenommen hat oder als periodische Wartung neben manage-memory.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory
---

# Agent-Speicher prunen

Gespeicherte Erinnerungen auditieren, klassifizieren und selektiv loeschen. Speicher ist Infrastruktur. Vergessen ist Richtlinie. Dieser Skill definiert die Richtlinie.

Waehrend `manage-memory` sich auf das Organisieren und Wachsenlassen des Speichers konzentriert (was behalten werden soll, wie es zu strukturieren ist), konzentriert sich dieser Skill auf das Gegenteil: was verworfen werden soll, wie Verfall erkannt wird und wie sichergestellt wird, dass Vergessen absichtlich statt versehentlich geschieht. Die beiden Skills sind komplementaer und sollten bei der periodischen Wartung zusammen verwendet werden.

## Wann verwenden

- Speicherdateien sind gross geworden und niemand hat sie auf Relevanz geprueft
- Der Projektstatus hat sich wesentlich veraendert (grosse Refaktorierungen, umbenannte Repos, abgeschlossene Meilensteine) und Erinnerungen referenzieren wahrscheinlich veralteten Kontext
- Abrufqualitaet hat abgenommen — Erinnerungen erzeugen Rauschen statt Signal
- Nach einer Burst-Aktivitaet, die viele Speichereintraege ohne Kuration generiert hat
- Als geplante Wartungsaufgabe (z. B. alle 10–20 Sitzungen oder bei Projekt-Meilensteinen)
- Wenn mehrere Speichereintraege dasselbe Thema mit leichten Variationen abdecken (Duplikatdrift)
- Vor der Aufnahme eines neuen Mitarbeiters, der den Speicherkontext erbt

## Eingaben

- **Erforderlich**: Pfad zum Speicherverzeichnis (typischerweise `~/.claude/projects/<project-path>/memory/`)
- **Optional**: Aufbewahrungsrichtlinien-Ueberschreibungen (z. B. "alles ueber Deployment behalten", "Debug-Notizen agressiv prunen")
- **Optional**: Bekannte Projektstatus-Aenderungen seit dem letzten Audit (z. B. "Repo wurde umbenannt", "von Jest zu Vitest migriert")
- **Optional**: Vorheriger Pruning-Audit-Trail fuer Trendanalyse

## Vorgehensweise

### Schritt 1: Erinnerungen enumerieren und klassifizieren

Alle Speicherdateien lesen und jeden Eintrag nach vier Dimensionen klassifizieren.

```bash
# Speicherverzeichnis inventarisieren
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Gesamteintraege zaehlen (naeherungsweise ueber Top-Level-Aufzaehlungen und Ueberschriften)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") Eintraege"; done
```

Jeden Speichereintrag in einen dieser Typen klassifizieren:

| Typ | Beschreibung | Beispiel | Standard-Aufbewahrung |
|-----|-------------|---------|----------------------|
| **Projekt** | Fakten ueber Projektstruktur, Architektur, Konventionen | "skills/ hat 310 SKILL.md-Dateien ueber 55 Domaenen" | Behalten bis als veraltet bestaetigt |
| **Entscheidung** | Getroffene Entscheidungen und ihre Begruendung | "Hub-and-Spoke statt Sequential fuer Review-Teams gewaehlt, weil..." | Unbegrenzt behalten |
| **Muster** | Debug-Loesungen, Workflow-Erkenntnisse, wiederkehrendes Verhalten | "Exit-Code 5 bedeutet Anführungszeichen-Fehler — temporaere Dateien verwenden" | Behalten bis abgeloest |
| **Referenz** | Links, Versionsnummern, externe Ressourcen | "mcptools-Docs: https://..." | Behalten bis als veraltet bestaetigt |
| **Rueckmeldung** | Nutzerpraeferenzen, Korrekturen, Stilhinweise | "Nutzer bevorzugt Kebab-Case fuer Dateinamen" | Unbegrenzt behalten |
| **Ephemer** | Sitzungsspezifischer Kontext, der in den persistenten Speicher ausgelaufen ist | "Arbeite gerade an Issue #42" | Sofort prunen |

Fuer jeden Eintrag zusaetzlich notieren:
- **Alter**: Wann wurde er geschrieben oder zuletzt aktualisiert?
- **Zugriffshaeufigkeit**: War dieser Eintrag in letzten Sitzungen nuetzlich? (Schaetzen basierend auf Themenrelevanz fuer aktuelle Arbeit)

**Erwartet:** Vollstaendiges Inventar mit jedem Speichereintrag klassifiziert nach Typ, mit Alters- und Zugriffshaeufigkeitsschaetzungen. Ephemere Eintraege sind bereits fuer sofortige Entfernung markiert.

**Bei Fehler:** Wenn Speicherdateien zu gross oder unstrukturiert sind, um Eintrag fuer Eintrag zu klassifizieren, auf Abschnittsebene arbeiten. Ganze Abschnitte statt einzelner Aufzaehlungen klassifizieren. Das Ziel ist Abdeckung, nicht Granularitaet.

### Schritt 2: Veraltung erkennen

Speicherbehauptungen mit dem aktuellen Projektstatus vergleichen. Veraltung ist die haeufigste Form des Speicherverfalls.

Nach diesen Veraltungsmustern suchen:

1. **Zaehldrift**: Anzahlen von Dateien, Skills, Agenten, Domaenen, Teammitgliedern, die sich veraendert haben
2. **Pfaddrift**: Dateien, Verzeichnisse oder URLs, die verschoben, umbenannt oder geloescht wurden
3. **Statusdrift**: Zustaende (geloeste Issues, abgeschlossene Meilensteine, geschlossene PRs), die noch als offen oder in Bearbeitung beschrieben werden
4. **Entscheidungsumkehr**: Entscheidungen, die spaeter ueberstimmt wurden, aber die urspruengliche Begruendung bleibt im Speicher
5. **Tool-/Versions-Drift**: Versionsnummern, API-Signaturen oder Tool-Namen, die sich geaendert haben (z. B. Paketumbenennungen)

```bash
# Zaehlen gegen Quelle der Wahrheit pruefen
grep -oP '\d+ skills' <memory-dir>/MEMORY.md
grep -c "^      - id:" skills/_registry.yml

# Auf Referenzen zu nicht mehr existierenden Dateien pruefen
grep -oP '`[^`]+\.(md|yml|R|js|ts)`' <memory-dir>/MEMORY.md | sort -u | while read f; do
  path="${f//\`/}"
  [ ! -f "$path" ] && echo "VERALTET: $path referenziert, aber nicht gefunden"
done

# Auf Referenzen zu alten Namen/Pfaden pruefen
grep -i "old-name\|previous-name\|renamed-from" <memory-dir>/*.md
```

Jeden veralteten Eintrag mit der Art der Veraltung und dem aktuell korrekten Wert markieren.

**Erwartet:** Eine Liste veralteter Eintraege mit spezifischen Belegen fuer das, was sich geaendert hat. Jeder veraltete Eintrag hat eine empfohlene Aktion: aktualisieren (wenn der korrekte Wert bekannt ist), pruefen (wenn unsicher) oder prunen (wenn der gesamte Eintrag obsolet ist).

**Bei Fehler:** Wenn eine Behauptung nicht verifiziert werden kann, weil sie externen Zustand referenziert (APIs, Drittanbieter-Docs, Deployment-Status), als `nicht verifizierbar` markieren statt Richtigkeit anzunehmen. Nicht verifizierbare Eintraege sind Kandidaten fuer Pruning, wenn sie nicht aktiv nuetzlich sind.

### Schritt 3: Genauigkeitspruefungen durchfuehren

Testen, ob Erinnerungen beim Abruf noch nuetzlichen Kontext liefern. Dies ist der schwerste Schritt, weil ein Agent nicht pruefen kann, ob seine eigenen komprimierten Erinnerungen korrekt sind — externe Anker sind erforderlich.

Genauigkeitspruefungsmethoden:

1. **Hin-und-Her-Verifizierung**: Einen Speichereintrag lesen, dann den tatsaechlichen Projektstatus pruefen, den er beschreibt. Fuehrt die Erinnerung zur richtigen Datei, zum richtigen Muster, zur richtigen Schlussfolgerung?

2. **Kompressionsverlust-Erkennung**: Erinnerungszusammenfassungen mit dem urspruenglichen Quellmaterial vergleichen. Wenn eine 50-zeilige Diskussion zu einer 2-zeiligen Erinnerung komprimiert wurde, hat die Kompression die handlungsrelevante Erkenntnis oder nur das Thema-Label bewahrt?

   ```bash
   # Die Quelle finden, aus der ein Speichereintrag abgeleitet wurde
   # (git log, alte PRs, urspruengliche Dateien)
   git log --oneline --all --grep="<Schluesselwort aus Speichereintrag>" | head -5
   ```

3. **Widerspruchs-Scan**: Nach Erinnerungen suchen, die sich gegenseitig widersprechen oder CLAUDE.md / Projektdokumentation widersprechen.

   ```bash
   # Auf potenzielle Widerspruche in Zaehlen pruefen
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Werte vergleichen — sie sollten uebereinstimmen
   ```

4. **Nuetzlichkeitstest**: Fuer jeden Speichereintrag fragen: "Wenn dieser Eintrag geloescht waere, wuerde in den naechsten 5 Sitzungen etwas schief gehen?" Wenn die Antwort "wahrscheinlich nicht" ist, hat der Eintrag unabhaengig von der Genauigkeit geringen Fidelitaetswert.

**Erwartet:** Jeder Speichereintrag hat jetzt eine Genauigkeitsbewertung: **hoch** (verifiziert korrekt und nuetzlich), **mittel** (wahrscheinlich korrekt, gelegentlich nuetzlich), **niedrig** (nicht verifiziert oder selten nuetzlich) oder **fehlgeschlagen** (als ungenau oder widersprueuchlich verifiziert).

**Bei Fehler:** Wenn Genauigkeitspruefungen fuer viele Eintraege nicht eindeutig sind, auf die Eintraege mit dem groessten Schadenpotenzial konzentrieren. Eine falsche Erinnerung ueber die Projektarchitektur ist gefaehrlicher als eine falsche Erinnerung ueber einen Debug-Trick.

### Schritt 4: Selektives Loeschen anwenden

Diesen Entscheidungsbaum verwenden, um in Prioritaetsreihenfolge festzustellen, was gepruned werden soll:

```
Pruning-Entscheidungsbaum (in Reihenfolge anwenden):

1. EPHEMERE Eintraege (Klassifizierung aus Schritt 1)
   → Sofort loeschen. Diese haetten nie persistiert werden sollen.

2. Eintraege mit FEHLGESCHLAGENER Genauigkeit (Schritt 3)
   → Sofort loeschen. Ungenaue Erinnerungen sind schlimmer als keine Erinnerungen.

3. DUPLIKATE
   → Die vollstaendigste/genaueste Version behalten, andere loeschen.
   → Wenn Duplikate MEMORY.md und eine Themendatei umfassen, die Themendateiversion behalten.

4. VERALTETE Eintraege mit bekannten Korrekturen (Schritt 2)
   → AKTUALISIEREN, wenn der Eintrag ansonsten nuetzlich ist (veralteten Wert auf aktuellen aendern).
   → LOESCHEN, wenn der gesamte Eintrag obsolet ist (das Thema ist nicht mehr relevant).

5. NIEDRIGE Genauigkeit, niedrige Zugriffshaeufigkeit
   → Loeschen. Diese beanspruchen Platz ohne Wert zu bieten.

6. MITTLERE Genauigkeit bei abgeschlossener/geschlossener Arbeit
   → Archivieren oder loeschen. Vergangene Sprint-Details, geloeste Vorfaelle, zusammengefuehrte PRs.
   → Ausnahme: behalten, wenn die Loesung ein wiederverwendbares Muster enthaelt.

7. REFERENZ-Eintraege mit frei verfuegbaren Quellen
   → Loeschen, wenn die Referenz mit einer Google-Suche zu finden ist.
   → Behalten, wenn die Referenz schwer zu finden ist oder projektspezifischen Kontext hat.
```

Fuer jede Loeschung den Eintrag, seine Klassifizierung und den Loeschgrund notieren (verwendet in Schritt 6).

**Erwartet:** Eine klare Liste von zu loeschenden, zu aktualisierenden und zu behaltenden Eintraegen — jeder mit dokumentiertem Grund. Das Behalten/Loeschen-Verhaeltnis haengt von der Speichergesundheit ab; ein gut gewarteter Speicher koennte 5–10 % prunen, ein vernachlaessigter 30–50 %.

**Bei Fehler:** Wenn der Entscheidungsbaum fuer viele Eintraege mehrdeutige Ergebnisse liefert, einen strengeren Filter anwenden: "Wuerde ich diesen Eintrag heute schreiben, mit dem Wissen, das ich jetzt habe?" Wenn nicht, ist es ein Loeschkandidat. Eher mehr prunen — es ist einfacher, eine Tatsache neu zu lernen als mit einer falschen Erinnerung umzugehen.

### Schritt 5: Praeventive Filter anwenden

"Was NICHT gespeichert werden soll"-Regeln definieren, um kuenftige Speicherverschmutzung zu verhindern. Vorhandene Erinnerungen auf Muster pruefen, die beim Schreiben haetten gefiltert werden sollen.

Muster, die **niemals** persistente Erinnerungen werden sollten:

| Muster | Warum | Beispiel |
|--------|-------|---------|
| Sitzungsspezifischer Aufgabenstatus | Bis zur naechsten Sitzung veraltet | "Debugge gerade Issue #42" |
| Zwischenschlussfolgerungen | Keine Schlussfolgerung | "Ansatz A versucht, hat nicht funktioniert, weil..." |
| Debug-Ausgabe / Stack Traces | Ephemere Diagnosedaten | "Fehler war: TypeError bei Zeile 234..." |
| Exakte Befehlssequenzen | Sproede, versionsabhaengig | "Fuehre `npm install foo@3.2.1 && ...` aus" |
| Emotionale/tonale Notizen | Nicht handlungsrelevant | "Nutzer schien frustriert" |
| Duplikate von CLAUDE.md | Bereits in Systemaufforderung | "Projekt verwendet renv fuer Abhaengigkeiten" |
| Nicht verifizierte Einzelbeobachtungen | Koennte falsch sein | "Ich glaube das API-Rate-Limit ist 100/Min" |

Wenn eines dieser Muster in vorhandenen Erinnerungen gefunden wird, zur Loeschliste aus Schritt 4 hinzufuegen.

Die Filterregeln in MEMORY.md oder einer `retention-policy.md`-Themendatei dokumentieren, damit kuenftige Sitzungen sie vor dem Schreiben neuer Erinnerungen referenzieren koennen.

**Erwartet:** Eine Reihe praeventiver Filterregeln im Speicherverzeichnis dokumentiert. Bestehende Eintraege, die diesen Mustern entsprechen, sind fuer Loeschung markiert.

**Bei Fehler:** Wenn das Dokumentieren von Filterregeln verfrueht erscheint (Speicher ist klein, Verschmutzung minimal), die Dokumentation ueberspringen, aber dennoch die Filter anwenden, um vorhandene Verletzungen zu erkennen. Die Regeln koennen spaeter formalisiert werden.

### Schritt 6: Audit-Trail schreiben

Jede Loeschung protokollieren, damit das Vergessen selbst ueberprufbar ist. Ein Pruning-Log erstellen oder aktualisieren.

```markdown
<!-- In <memory-dir>/pruning-log.md oder an MEMORY.md angehaengt -->

## Pruning-Log

### JJJJ-MM-TT Audit
- **Audited Eintraege**: N
- **Geprinte Eintraege**: M (X%)
- **Aktualisierte Eintraege**: K
- **Gefundene Veraltungen**: [Liste erkannter Veraltungsmuster]
- **Genauigkeitsfehler**: [Liste nicht bestandener Eintraege]

#### Loeschungen
| Eintrag (Zusammenfassung) | Typ | Grund |
|--------------------------|-----|-------|
| "Arbeite gerade an Issue #42" | Ephemer | Sitzungsspezifisch, veraltet |
| "skills/ hat 280 SKILL.md-Dateien" | Projekt | Zaehldrift: tatsaechlich 310 |
| "Verwende acquaint::mcp_session()" | Muster | Paket zu mcptools umbenannt |
```

Das Pruning-Log kurz halten. Es existiert fuer Nachvollziehbarkeit, nicht fuer Archaeologie. Wenn das Log selbst gross wird, aeltere Eintraege zusammenfassen: "2025: 3 Audits, 47 Eintraege insgesamt gepruned (groesstenteils Zaehldrift und ephemeres Auslaufen)."

**Erwartet:** Ein zeitgestempelter Pruning-Log-Eintrag, der dokumentiert was geloescht wurde und warum. Das Log ist im Speicherverzeichnis neben den Erinnerungen selbst gespeichert.

**Bei Fehler:** Wenn das Erstellen einer separaten Log-Datei uebertrieben erscheint (nur 1–2 Eintraege gepruned), stattdessen eine kurze Notiz in MEMORY.md hinzufuegen: `<!-- Zuletzt gepruned: JJJJ-MM-TT, 2 veraltete Eintraege entfernt -->`. Irgendein Nachweis ist besser als stilles Loeschen.

### Schritt 7: Geschuetzte Erinnerungen bestimmen

Bestimmte Speichereintraege sollten unabhaengig von Alter, Zugriffshaeufigkeit oder Genauigkeitsbewertung unveraenderlich bleiben. Diese repraesentieren unersetzlichen Kontext, dessen Verlust erheblichen Aufwand zur Rekonstruktion erfordern wuerde.

**Schutzkriterien:**

| Kategorie | Beispiele | Warum geschuetzt |
|-----------|----------|-----------------|
| Architekturentscheidungen | "Flaches Skill-Verzeichnis statt verschachteltem gewaehlt" | Begruendung geht verloren, wenn spaeter neu abgeleitet |
| Nutzer-Identitaetspraeferenzen | "Immer Kebab-Case verwenden", "Nie automatisch commiten" | Expliziter Nutzer-Intent, nicht ableitbar |
| Sicherheitsaudit-Ergebnisse | "Letzter Audit: 2025-12-13 — BESTANDEN" | Compliance-Nachweis mit Zeitstempeln |
| Umbenennungs-/Migrationsaufzeichnungen | "Repo umbenannt: X nach Y am Datum Z" | Querverweisintegritaet haengt davon ab |

**Kennzeichnungsmethode:** Geschuetzte Eintraege mit `<!-- PROTECTED -->` inline markieren oder eine `protected`-Liste im Pruning-Log pflegen. Der Entscheidungsbaum in Schritt 4 muss vor Anwendung jeder Loeschregel auf Schutzstatus pruefen.

**Schutz aufheben:** Um einen geschuetzten Eintrag zu prunen, zuerst explizit die Kennzeichnung entfernen und den Grund im Pruning-Log dokumentieren. Dieser zweistufige Prozess verhindert versehentliches Loeschen wertvoller Erinnerungen.

**Erwartet:** Geschuetzte Eintraege ueberstehen alle Pruning-Durchgaenge. Das Pruning-Log zeichnet Schutzhinzufuegungen oder -entfernungen auf.

**Bei Fehler:** Wenn der geschuetzte Satz zu gross wird (> 30 % aller Eintraege), die Kriterien ueberpruefen — Schutz gilt fuer unersetzlichen Kontext, nicht fuer "wichtige" Eintraege. Wichtige aber rekonstruierbare Fakten sollten normalem Pruning unterliegen.

### Schritt 8: Nach dem Pruning neu synthetisieren

Nach dem Loeschen koennen verbleibende Erinnerungen fragmentiert sein — Querverweise zeigen auf geloeschte Eintraege, Themendateien verlieren Koeharenz und MEMORY.md kann Luecken haben. Neu-Synthese stellt strukturelle Integritaet wieder her.

**Neu-Synthese-Checkliste:**

1. **Gebrochene Referenzen aufloesen**: Verbleibende Eintraege auf Links zu geloeschten Inhalten scannen. Referenz entfernen oder umleiten.
2. **Verwandte Fragmente zusammenfuehren**: Wenn Pruning zwei Eintraege hinterliess, die ueberlappende Aspekte desselben Themas abdecken, zu einem kohaerenten Eintrag zusammenfuehren.
3. **Themenstruktur aktualisieren**: Wenn eine Themendatei > 50 % ihres Inhalts verloren hat, den Rest in MEMORY.md zurueckfalten und die Themendatei loeschen.
4. **Kalte Erinnerungen klassifizieren**: Eintraege pruefen, die das Pruning ueberlebt haben, aber in letzter Zeit nicht abgerufen wurden:
   - **Kalt-durch-Nichtnutzung**: Thema entspricht aktiven Projektzielen, aber die spezifische Phase, die es generiert hat, ist abgeschlossen. Behalten — koennte wieder relevant werden, wenn diese Phase wieder aufgenommen wird.
   - **Kalt-durch-Irrelevanz**: Das Thema war immer randstaendig — ein einmaliges Experiment, eine tangentiale Untersuchung oder ein abgeloester Ansatz. Fuer Loeschung im naechsten Pruning-Zyklus markieren.
5. **MEMORY.md-Koeharenz pruefen**: MEMORY.md von oben nach unten lesen. Es sollte eine kohaerente Geschichte ueber das Projekt erzaehlen, nicht wie eine zufaellige Faktensammlung lesen.

**Erwartet:** Post-Pruning-Speicher ist strukturell solide — keine verwaisten Referenzen, keine redundanten Fragmente, keine inkoehaerenten Themendateien. Kalte Eintraege sind fuer kuenftige Pruning-Entscheidungen klassifiziert.

**Bei Fehler:** Wenn Neu-Synthese zeigt, dass Pruning zu agressiv war (kritischer Kontext ging verloren), das Pruning-Log pruefen und aus dem Audit-Trail rekonstruieren. Deshalb existiert der Audit-Trail.

### Schritt 9: Von Speicherdrift erholen

Speicherdrift tritt auf, wenn gespeicherte Fakten still falsch werden — nicht weil sie immer falsch waren, sondern weil sich die zugrundeliegende Realitaet geaendert hat und die Erinnerung nicht aktualisiert wurde. Drift-Wiederherstellung versucht, Erinnerungen an Ort und Stelle zu korrigieren statt sie zu prunen.

**Drift-Erkennungsausloeser:**

- Eine Speicherbehauptung widerspricht der aktuellen Tool-Ausgabe oder dem Dateiinhalt
- Eine Zahl oder Versionsnummer im Speicher stimmt nicht mit der Registry oder der Lockdatei ueberein
- Ein Pfad im Speicher gibt "Datei nicht gefunden" zurueck
- Eine Erinnerung ueber eine Abhaengigkeit referenziert ein umbenanntes oder veraltetes Paket

**Wiederherstellungsverfahren:**

1. **Drift identifizieren**: Speicherbehauptung gegen aktuelle Grundwahrheit vergleichen (git log, Registry, tatsaechliche Dateien)
2. **Wiederherstellbarkeit beurteilen**: Kann der korrekte Wert aus dem aktuellen Projektstatus ermittelt werden?
   - Ja → Speichereintrag an Ort und Stelle mit aktuellem Wert und Anmerkung `[korrigiert JJJJ-MM-TT]` aktualisieren
   - Nein → Eintrag als `nicht verifizierbar` markieren und fuer Pruning vormerken
3. **Ursache nachverfolgen**: War dies eine graduelle Drift (Zahl divergierte langsam) oder ein diskretes Ereignis (Umbenennung, Migration)? Diskrete Ereignisse betreffen oft mehrere Eintraege — nach Geschwistern scannen.
4. **Wiederholung verhindern**: Wenn die Drift einen sich haeufig aendernden Wert betrifft (Zaehlen, Versionen), ueberlegen ob die Erinnerung den Wert ueberhaupt tracken soll oder stattdessen die Wahrheitsquelle referenzieren: "Aktuellen Zaehler in skills/_registry.yml nachschlagen" statt "317 Skills."

**Erwartet:** Gedriftete Erinnerungen werden wenn moeglich an Ort und Stelle korrigiert, wobei der Kontext erhalten bleibt. Eintraege, die nicht korrigiert werden koennen, werden fuer Pruning markiert. Praeventionsregeln reduzieren kuenftige Drift.

**Bei Fehler:** Wenn Drift weitverbreitet ist (> 20 % der Eintraege), benoetigt der Speicher moeglicherweise einen vollstaendigen Neuaufbau statt inkrementeller Korrekturen. In diesem Fall das aktuelle Speicherverzeichnis archivieren, neu beginnen und selektiv Eintraege reimportieren, die die Verifizierung bestehen.

## Validierung

- [ ] Alle Speicherdateien wurden inventarisiert und Eintraege nach Typ klassifiziert
- [ ] Veraltungspruefungen wurden gegen aktuellen Projektstatus durchgefuehrt
- [ ] Mindestens eine Genauigkeitspruefungsmethode wurde angewendet (Hin-und-Her, Kompressionsverlust, Widerspruchs-Scan oder Nuetzlichkeitstest)
- [ ] Loeschentscheidungen folgen der Prioritaetsreihenfolge im Entscheidungsbaum
- [ ] Kein Eintrag wurde ohne dokumentierten Grund geloescht
- [ ] Praeventive Filterregeln sind dokumentiert oder angewendet
- [ ] Pruning-Log zeichnet auf, was geloescht wurde, wann und warum
- [ ] MEMORY.md bleibt nach Pruning unter 200 Zeilen
- [ ] Verbleibende Erinnerungen sind korrekt (stichprobenartig gegen Projektstatus geprueft)
- [ ] Keine verwaisten Themendateien durch Pruning von Referenzen aus MEMORY.md entstanden
- [ ] Geschuetzte Eintraege sind bestimmt und ueberstehen alle Pruning-Durchgaenge
- [ ] Post-Pruning-Neu-Synthese loest gebrochene Querverweise auf und fuehrt Fragmente zusammen
- [ ] Kalte Eintraege sind als Nichtnutzung vs. Irrelevanz fuer kuenftige Pruning-Entscheidungen klassifiziert
- [ ] Gedriftete Eintraege werden wenn moeglich an Ort und Stelle korrigiert, nicht nur geloescht

## Haeufige Stolperfallen

- **Pruning ohne Verifizierung**: Eintraege loeschen, weil sie "alt aussehen", ohne zu pruefen ob sie noch korrekt und nuetzlich sind. Alter allein ist kein Loeschkriterium — manche der wertvollsten Erinnerungen sind alte Architekturentscheidungen, die immer noch gelten.
- **Selbstverifizierung der Genauigkeit**: Ein Agent, der seine eigene komprimierte Erinnerung liest und schlussfolgert "ja, das klingt richtig", fuehrt keine Genauigkeitspruefung durch. Genauigkeit erfordert externe Anker: Projektdateien, git-Verlauf, Registry-Zaehlen, tatsaechliche Tool-Ausgabe.
- **Aggressives Pruning ohne Audit-Trail**: Eintraege loeschen ohne aufzuzeichnen, was geloescht wurde. Wenn eine kuenftige Sitzung eine Tatsache benoetigt, die gepruned wurde, erklaert der Audit-Trail was passiert ist und enthaelt moeglicherweise genug Kontext zur Rekonstruktion.
- **Pruning-Entscheidungen als Erinnerungen**: Nicht "Ich habe entschieden X zu prunen, weil Y" als regulaeren Speichereintrag schreiben. Das gehoert nur ins Pruning-Log. Speichereintraege ueber Speicherverwaltung sind Meta-Verschmutzung.
- **Praeventive Filter ignorieren**: Vorhandene Eintraege prunen, aber keine Regeln zur Verhinderung derselben Muster aufstellen. Ohne Filter werden die naechsten 10 Sitzungen dieselben ephemeren Eintraege neu erstellen, die gerade geloescht wurden.
- **Alle Typen gleich behandeln**: Entscheidungs- und Rueckmeldungs-Erinnerungen sollten fast nie gepruned werden — sie repraesentieren Nutzer-Intent und Begruendung. Projekt- und Referenz-Erinnerungen sind die primaeren Pruning-Ziele, weil sie Status tracken, der sich aendert.
- **Kompression mit Beschaedigung verwechseln**: Eine Erinnerung, die ein komplexes Thema in einer Zeile zusammenfasst, ist komprimiert, nicht beschaedigt. Nur als Genauigkeitsfehler markieren, wenn die Kompression die handlungsrelevante Erkenntnis verloren hat, nicht bloss das Detail.
- **Ueberpinnen**: Zu viele Eintraege als geschuetzt markieren vereitelt den Zweck des Prunings. Wenn > 30 % der Eintraege geschuetzt sind, sind die Kriterien zu locker. Unersetzlichen Kontext schuetzen, nicht bloss wichtige Fakten.
- **Neu-Synthese-Schleifen**: Das Zusammenfuehren von Fragmenten waehrend der Neu-Synthese kann neue Eintraege erstellen, die selbst im naechsten Zyklus Pruning benoetigen. Zusammenfuehrungen minimal halten — nur Eintraege kombinieren, die eindeutig dasselbe Thema abdecken.

## Verwandte Skills

- `manage-memory` — der komplementaere Skill fuer das Organisieren und Wachsenlassen von Speicher; zusammen fuer vollstaendige Speicherwartung verwenden
- `meditate` — Klaerung und Verankerung, die aufzeigen kann, welche Erinnerungen Rauschen erzeugen
- `rest` — manchmal ist die beste Speicherwartung keine Speicherwartung
- `assess-context` — Reasoning-Kontext-Gesundheit bewerten, die Speicherqualitaet direkt beeinflusst
