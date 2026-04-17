---
name: teach-guidance
description: >
  Eine Person dabei anleiten, ein besserer Lehrer und Erklaerer zu werden. KI
  coacht Inhaltsstrukturierung, Zielgruppenkalibrierung, Erklaerungsklarheit,
  sokratische Fragetechnik, Feedback-Interpretation und reflektive Praxis fuer
  technische Praesentationen, Dokumentation und Mentoring. Verwenden wenn eine
  Person technische Inhalte praesentieren muss und Vorbereitungscoaching will,
  bessere Dokumentation oder Tutorials schreiben will, Schwierigkeiten hat
  Konzepte ueber Expertisenniveaus hinweg zu erklaeren, einen Kollegen mentort
  oder sich auf einen Vortrag oder eine Wissensteilungs-Sitzung vorbereitet.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, coaching, presentation, documentation, explanation, guidance
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Lehr-Anleitung

Eine Person dabei anleiten, ein effektiverer Lehrer, Erklaerer oder Praesentator zu werden. Die KI agiert als Lehr-Coach -- hilft einzuschaetzen, was an wen kommuniziert werden muss, strukturiert Inhalte fuer Klarheit, uebt Erklaerungen, verfeinert basierend auf Feedback, unterstuetzt die Durchfuehrung und reflektiert, was funktioniert hat.

## Wann verwenden

- Wenn eine Person technische Inhalte einem Publikum praesentieren muss und sich effektiv vorbereiten will
- Wenn jemand bessere Dokumentation, Tutorials oder Erklaerungen schreiben will
- Wenn eine Person Schwierigkeiten hat, Konzepte Personen mit unterschiedlichen Expertisenniveaus zu erklaeren
- Wenn jemand einen Kollegen oder Nachwuchsentwickler mentort und effektiver sein will
- Wenn eine Person sich auf einen Vortrag, Workshop oder eine Wissensteilungs-Sitzung vorbereitet
- Nachdem `learn-guidance` beim Wissenserwerb geholfen hat und das Wissen nun an andere weitergegeben werden muss

## Eingaben

- **Erforderlich**: Was die Person lehren oder erklaeren muss (Thema, Konzept, System, Prozess)
- **Erforderlich**: Wer das Publikum ist (Expertisenniveau, Kontext, Beziehung zur Person)
- **Optional**: Format der Durchfuehrung (Praesentation, Dokumentation, Einzel-Mentoring, Workshop)
- **Optional**: Zeitbeschraenkungen (5-Minuten-Erklaerung, 30-Minuten-Vortrag, schriftliches Dokument)
- **Optional**: Fruehere Lehrversuche und was nicht funktioniert hat
- **Optional**: Das eigene Komfortniveau der Person mit dem Thema (tiefer Experte vs. kuerzlich Gelernter)

## Vorgehensweise

### Schritt 1: Bewerten -- Die Lehr-Herausforderung verstehen

Bevor Inhalte strukturiert werden, den vollen Kontext der Lehrsituation verstehen.

1. Fragen, was gelehrt werden muss und warum: "Welches Konzept muss ankommen, und was passiert, wenn es nicht ankommt?"
2. Das Publikum identifizieren: "Wem werden Sie das erklaeren? Was wissen die bereits?"
3. Das eigene Verstaendnis der Person einschaetzen: Kennt sie das Thema tief genug, um es zu lehren? (Falls nicht, zuerst `learn-guidance` vorschlagen)
4. Das Format identifizieren: Praesentation, Dokument, Gespraech, Code-Review, Pair-Programming
5. Erfolgskriterien bestimmen: "Woran werden Sie erkennen, dass das Publikum verstanden hat?"
6. Aengste oder Bedenken aufdecken: "Welcher Teil davon macht Sie am nervoesesten?"

```
Teaching Challenge Matrix:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Challenge Type   │ Indicators               │ Focus Area               │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Knowledge gap    │ "I sort of know it       │ Deepen their own under-  │
│                  │ but can't explain it"     │ standing first (learn)   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Audience gap     │ "I don't know what       │ Build audience empathy   │
│                  │ they already know"        │ and calibration          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Structure gap    │ "I know it all but       │ Organize content into    │
│                  │ don't know where to       │ a narrative arc          │
│                  │ start"                    │                          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Confidence gap   │ "What if they ask        │ Practice and preparation │
│                  │ something I can't         │ for edge cases           │
│                  │ answer?"                  │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

**Erwartet:** Ein klares Bild der Lehr-Herausforderung: was, an wen, in welchem Format, mit welchen Beschraenkungen und wo die Person sich am wenigsten sicher fuehlt.

**Bei Fehler:** Wenn die Person ihr Publikum nicht artikulieren kann, ihr helfen eine Persona zu erstellen: "Stellen Sie sich eine bestimmte Person vor, die das hoeren wird. Was weiss sie? Was interessiert sie?" Wenn sie das Thema nicht artikulieren kann, muss sie es moeglicherweise erst tiefer lernen.

### Schritt 2: Strukturieren -- Inhalte fuer Klarheit organisieren

Der Person helfen, eine klare narrative Struktur fuer ihre Erklaerung aufzubauen.

1. Die einzelne Kernbotschaft identifizieren: "Wenn das Publikum sich nur an eine Sache erinnert, was sollte es sein?"
2. Von der Kernbotschaft nach aussen aufbauen: welcher Kontext wird vor der Kernbotschaft benoetigt, und welche Details folgen danach?
3. Die umgekehrte Pyramide anwenden: wichtigste Information zuerst, unterstuetzende Details danach
4. Fuer technische Inhalte ein Strukturmuster waehlen:
   - **Konzepterklaerung**: Was -> Warum -> Wie -> Beispiel -> Grenzfaelle
   - **Tutorial**: Ziel -> Voraussetzungen -> Schritte -> Verifikation -> Naechste Schritte
   - **Architekturuebersicht**: Problem -> Einschraenkungen -> Loesung -> Kompromisse -> Betrachtete Alternativen
   - **Debugging-Durchgang**: Symptom -> Untersuchung -> Ursache -> Behebung -> Praevention
5. Sicherstellen, dass jeder Abschnitt einen klaren Zweck hat: wenn ein Abschnitt der Kernbotschaft nicht dient, ihn streichen
6. Uebergaenge planen: "Wir haben X behandelt. Aufbauend darauf muessen wir Y verstehen, weil..."

**Erwartet:** Ein strukturiertes Gliederung, in der jedes Element der Kernbotschaft dient. Die Struktur sollte sich logisch und unvermeidlich anfuehlen -- jeder Abschnitt fuehrt natuerlich zum naechsten.

**Bei Fehler:** Wenn die Struktur staendig waechst, ist der Umfang zu breit -- beim Kuerzen helfen. Wenn die Struktur sich flach anfuehlt (alles auf gleicher Ebene), muss die Hierarchie ueberarbeitet werden -- identifizieren, welche Punkte primaer und welche unterstuetzend sind. Wenn sie sich gegen Struktur wehren ("Ich erklaere es einfach natuerlich"), anmerken, dass natuerliche Erklaerungen fuer einfache Themen funktionieren, aber bei komplexen versagen -- Struktur ist das Geruest.

### Schritt 3: Ueben -- Die Erklaerung proben

Die Person das Konzept ueben lassen, wobei die KI als Publikum agiert.

1. Sie bitten, das Konzept so zu erklaeren, wie sie es ihrem tatsaechlichen Publikum wuerden
2. Beim ersten Durchlauf ohne Unterbrechung zuhoeren -- sie ihren natuerlichen Fluss finden lassen
3. Notieren, wo die Erklaerung klar ist und wo sie verworren oder vage wird
4. Notieren, wo sie Fachsprache verwenden, die das Publikum moeglicherweise nicht kennt
5. Notieren, wo sie Schritte ueberspringen oder Wissen voraussetzen, das das Publikum moeglicherweise nicht hat
6. Notieren, wo sie zu lange bei einfachen Teilen verweilen und schwere Teile ueberhasten
7. Die Erklaerung timen, wenn es eine Zeitbeschraenkung gibt

**Erwartet:** Eine Erstfassung der Erklaerung, die die natuerlichen Lehrmuster der Person offenbart -- Staerken zum Aufbauen und Gewohnheiten zum Anpassen. Die Uebung sollte sich entspannt anfuehlen: "Das ist ein Entwurf, keine Auffuehrung."

**Bei Fehler:** Wenn die Person blockiert oder sagt "Ich weiss nicht, wo ich anfangen soll", zur Struktur aus Schritt 2 zurueckkehren und sie einen Abschnitt nach dem anderen erklaeren lassen, anstatt das Ganze. Wenn sie uebertrieben selbstkritisch sind ("Das war furchtbar"), zu Konkretem umlenken: "Eigentlich war die Art, wie Sie X erklaert haben, sehr klar -- lassen Sie uns darauf konzentrieren, Y auf dieses Niveau zu bringen."

### Schritt 4: Verfeinern -- Basierend auf Feedback verbessern

Spezifisches, umsetzbares Feedback zur geuebten Erklaerung geben.

1. Mit Staerken beginnen: "Der Teil, wo Sie X mit der Analogie von Y erklaert haben, war sehr wirksam, weil..."
2. Die groesste Verbesserungsmoeglichkeit identifizieren (nicht alle Probleme -- auf ein oder zwei fokussieren)
3. Konkrete Alternativen vorschlagen: "Anstatt zu sagen [komplexe Version], versuchen Sie: [einfachere Version]"
4. Auf den Fluch des Wissens pruefen: gibt es Stellen, wo ihre Expertise sie Schritte ueberspringen laesst, die das Publikum braucht?
5. Auf Zielgruppenkalibrierung pruefen: ist die Tiefe fuer das Publikum richtig, oder ist sie zu flach/tief?
6. Wenn sie Analogien verwenden, pruefen ob die Analogien akkurat sind (irrefuehrende Analogien sind schlimmer als keine Analogie)
7. Sie den verfeinerten Abschnitt erneut erklaeren lassen, um die Verbesserung zu testen

**Erwartet:** Gezieltes Feedback, das die Erklaerung messbar verbessert. Die Person kann den Unterschied zwischen dem ersten und zweiten Versuch spueren. Feedback ist konstruktiv formuliert -- was zu tun ist, nicht nur was zu vermeiden ist.

**Bei Fehler:** Wenn die Person bei Feedback defensiv wird, von "das war unklar" zu "das Publikum koennte hier nicht folgen -- wie koennten wir es noch klarer machen?" umformulieren. Wenn die verfeinerte Version nicht besser ist, kann das Problem strukturell (Schritt 2) statt praesentationstechnisch sein -- zur Gliederung zurueckkehren.

### Schritt 5: Durchfuehren -- Waehrend des Lehrens unterstuetzen

Wenn das Lehren in Echtzeit stattfindet, waehrend der Durchfuehrung unterstuetzen.

1. Fuer Live-Praesentationen: im Voraus Antworten auf wahrscheinliche Fragen vorbereiten helfen
2. Fuer Dokumentation: die schriftliche Version auf Klarheit, Struktur und Zielgruppenkalibrierung ueberpruefen
3. Auf den "Ich weiss nicht"-Moment vorbereiten helfen: "Wenn etwas gefragt wird, das Sie nicht beantworten koennen, sagen Sie: 'Gute Frage -- ich werde das nachschauen und mich melden.' Das ist immer akzeptabel."
4. Interaktion foerdern: Pruefungsfragen fuer das Publikum vorbereiten helfen
5. Wiederherstellungsplaene vorbereiten: was tun, wenn das Publikum verloren, gelangweilt oder der Erklaerung voraus ist
6. Wenn waehrend der Durchfuehrung gecoacht wird: kurze, spezifische Hinweise geben ("hier verlangsamen", "sie wirken verwirrt -- nachfragen")

**Erwartet:** Die Person fuehlt sich vorbereitet und unterstuetzt. Sie hat Antworten auf wahrscheinliche Fragen, Strategien fuer unerwartete Situationen und das Vertrauen, dass nicht alles zu wissen akzeptabel ist.

**Bei Fehler:** Wenn Angst der primaere Blocker ist, sie direkt ansprechen: Vorbereitung reduziert Angst, und Nervositaet dem Publikum gegenueber einzugestehen schafft oft Verbindung. Wenn sich das Durchfuehrungsformat staendig aendert, helfen das Format zu akzeptieren und sich anzupassen, anstatt zu versuchen Bedingungen zu kontrollieren.

### Schritt 6: Reflektieren -- Analysieren was funktioniert hat

Nach dem Lehrereignis Reflexion fuer kontinuierliche Verbesserung anleiten.

1. Fragen: "Was lief gut? Worauf sind Sie stolz?"
2. Fragen: "Wo haben Sie bemerkt, dass das Publikum am engagiertesten war? Am wenigsten engagiert?"
3. Fragen: "Hat Sie etwas an der Reaktion des Publikums ueberrascht?"
4. Fragen: "Wenn Sie eine Sache aendern koennten, was waere es?"
5. Die Reflexion mit Prinzipien verbinden: "Der Teil, der funktioniert hat, verwendete [Technik]. Das koennen Sie breiter anwenden."
6. Ein spezifisches Verbesserungsziel fuer das naechste Mal identifizieren
7. Die Leistung wuerdigen: Lehren ist eine Faehigkeit, die sich mit Uebung verbessert

**Erwartet:** Die Person gewinnt konkrete Einsicht ueber ihre Lehrwirksamkeit -- nicht vage Gefuehle, sondern spezifische Beobachtungen darueber, was funktioniert hat und warum. Sie geht mit einer umsetzbaren Verbesserung fuer das naechste Mal.

**Bei Fehler:** Wenn sie nur Negatives sehen, zu spezifischen Momenten umlenken, die funktioniert haben. Wenn sie nur Positives sehen, behutsam nach Bereichen sondieren, in denen das Publikum verwirrt war. Wenn keine Reflexion stattfindet (sie gehen sofort weiter), anmerken, dass Reflexion der Ort ist, an dem die dauerhafteste Verbesserung geschieht -- selbst 5 Minuten Rueckblick zaehlen.

## Validierung

- [ ] Die Lehr-Herausforderung wurde vor dem Strukturieren bewertet (Publikum, Format, Beschraenkungen)
- [ ] Eine Kernbotschaft wurde identifiziert und die Struktur um sie herum organisiert
- [ ] Die Person hat die Erklaerung mindestens einmal vor der Durchfuehrung geuebt
- [ ] Feedback war spezifisch, umsetzbar und fuehrte zu messbarer Verbesserung
- [ ] Die Person war auf Fragen, Unsicherheit und Publikumsanpassung vorbereitet
- [ ] Reflexion nach der Durchfuehrung identifizierte mindestens eine spezifische Verbesserung fuer das naechste Mal
- [ ] Das Coaching war durchgehend ermutigend -- Lehren ist schwer und das sollte anerkannt werden

## Haeufige Stolperfallen

- **Den Inhalt coachen, nicht das Lehren**: Ihnen helfen das Material zu lernen, anstatt ihnen zu helfen es zu praesentieren. Wenn sie lernen muessen, zuerst `learn-guidance` verwenden
- **Ueberstrukturierung**: Die Struktur so starr machen, dass die natuerliche Lehrstimme der Person verloren geht. Struktur sollte ihren Stil unterstuetzen, nicht ersetzen
- **Perfektionismus-Falle**: Endlos proben, anstatt durchzufuehren. Irgendwann hat die Uebung abnehmende Ertraege -- zur Durchfuehrung draengen
- **Publikumsvielfalt ignorieren**: Ein gemischtes Publikum braucht geschichtete Erklaerung -- Kernidee fuer alle, Details fuer Experten, Analogien fuer Neueinsteiger
- **Feedback-Ueberflutung**: Zu viele Anmerkungen auf einmal ueberwaeltigen. Auf die ein oder zwei Aenderungen mit der hoechsten Auswirkung fokussieren
- **Emotionale Vorbereitung vernachlaessigen**: Lehrangst ist real. Vertrauen anzusprechen ist ebenso wichtig wie Inhalte anzusprechen

## Verwandte Skills

- `teach` -- die KI-selbstgesteuerte Variante fuer kalibrierten Wissenstransfer
- `learn-guidance` -- eine Person durch das Lernen coachen; die Voraussetzung fuer effektives Lehren
- `listen-guidance` -- aktive Zuhoerfaehigkeiten helfen Lehrenden, auf Publikumsbeduerfnisse in Echtzeit zu reagieren
- `meditate-guidance` -- Angst beruhigen und Fokus vor einem Lehrereignis erreichen
