---
name: learn-guidance
locale: de
source_locale: en
source_commit: 902f69ec
translator: claude
translation_date: "2026-03-17"
description: >
  Eine Person durch strukturiertes Lernen eines neuen Themas, einer
  Technologie oder Faehigkeit fuehren. Die KI agiert als Lerncoach —
  aktuelles Wissen einschaetzen, einen Lernpfad entwerfen, durch Material
  fuehren, Verstaendnis pruefen, Schwierigkeit anpassen und
  Wiederholungssitzungen fuer die Behaltensleistung planen. Anwenden
  wenn eine Person eine neue Technologie lernen moechte und nicht weiss
  wo sie anfangen soll, wenn sich jemand von Dokumentation ueberwaeltigt
  fuehlt, wenn eine Person Material immer wieder vergisst und verteilte
  Wiederholung braucht, oder beim Wechsel zwischen Domaenen mit Bedarf
  an einer Lueckenanalyse.
license: MIT
allowed-tools: Read WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, coaching, education, structured-learning, guidance
---

# Lernen (Anleitung)

Eine Person durch einen strukturierten Lernprozess fuer ein neues Thema, eine Technologie oder Faehigkeit fuehren. Die KI agiert als Lerncoach -- hilft Ausgangswissen einzuschaetzen, einen Studienplan zu entwerfen, im richtigen Tempo durch Material zu fuehren, Verstaendnis mit Fragen zu pruefen, den Ansatz basierend auf Rueckmeldung anzupassen und fuer die Behaltensleistung zu festigen.

## Wann verwenden

- Eine Person moechte eine neue Technologie, ein Framework, eine Sprache oder ein Konzept lernen und weiss nicht wo sie anfangen soll
- Jemand fuehlt sich von Dokumentation oder Lernressourcen ueberwaeltigt und braucht einen strukturierten Pfad
- Eine Person vergisst Material immer wieder und braucht Anleitung zur verteilten Wiederholung
- Jemand wechselt zwischen Domaenen (z.B. Backend zu Frontend) und braucht eine Lueckenanalyse
- Eine Person wuenscht sich Verantwortlichkeit und Struktur fuer selbstgesteuertes Lernen
- Nachdem `meditate-guidance` mentales Rauschen bereinigt hat und Raum fuer fokussiertes Lernen schafft

## Eingaben

- **Erforderlich**: Was die Person lernen moechte (Thema, Technologie, Faehigkeit oder Konzept)
- **Erforderlich**: Ihr Zweck fuer das Lernen (berufliche Anforderung, persoenliches Interesse, Projektbedarf, Berufswechsel)
- **Optional**: Aktuelles Wissensniveau in diesem Bereich (selbst eingeschaetzt oder demonstriert)
- **Optional**: Verfuegbare Lernzeit (Stunden pro Tag/Woche, Termin falls vorhanden)
- **Optional**: Bevorzugter Lernstil (Lesen, praktisches Arbeiten, Video, Diskussion)
- **Optional**: Fruehere gescheiterte Versuche dieses Thema zu lernen (was hat vorher nicht funktioniert)

## Vorgehensweise

### Schritt 1: Einschaetzen — Ausgangposition bestimmen

Bevor ein Lernpfad entworfen wird, verstehen wo die Person aktuell steht.

1. Nach ihrer Erfahrung mit dem Thema fragen: "Was wissen Sie bereits ueber X?"
2. Nach angrenzendem Wissen fragen: "Welche verwandten Themen sind Ihnen vertraut?" (diese werden zu Bruecken)
3. Wenn sie etwas Wissen angeben, eine Kalibrierungsfrage stellen die Tiefe von Oberflaechenvertrautheit unterscheidet
4. Ihren Wortschatz beachten: verwenden sie Fachbegriffe korrekt, naeherungsweise oder gar nicht?
5. Ihr Lernziel spezifisch identifizieren: "Was moechten Sie nach dem Lernen tun koennen?"
6. Ihre primaere Motivation identifizieren: Neugier, praktischer Bedarf, berufliches Fortkommen oder kreatives Projekt

```
Ausgangspositions-Einschaetzung:
+---------------+----------------------------+--------------------------+
| Gefundenes    | Indikatoren                | Pfadansatz               |
| Niveau        |                            |                          |
+---------------+----------------------------+--------------------------+
| Keine         | Kein Wortschatz, kein      | Mit "was" und "warum"    |
| Berueherung   | mentales Modell, alles     | beginnen bevor "wie"     |
|               | ist neu                    |                          |
+---------------+----------------------------+--------------------------+
| Oberflaech-   | Hat Begriffe gehoert,      | Wortschatzluecken        |
| liches        | keine praktische Erfahrung,| fuellen, dann zum        |
| Bewusstsein   | vages Modell               | Praktischen uebergehen   |
+---------------+----------------------------+--------------------------+
| Teilwissen    | Etwas Erfahrung, Luecken   | Spezifische Luecken      |
|               | im Verstaendnis, kann      | identifizieren und       |
|               | manches aber nicht alles   | direkt adressieren       |
+---------------+----------------------------+--------------------------+
| Auffrischung  | Wusste es frueher, jetzt   | Schnelle Wiederholung +  |
| noetig        | eingerostet                | Uebung zum Reaktivieren  |
+---------------+----------------------------+--------------------------+
```

**Erwartet:** Ein klares Bild der Ausgangsposition, des Ziels und der Einschraenkungen der Person. Die Einschaetzung sollte warm und ermutigend sein, nicht wie eine Pruefung -- Fragen als Neugier ueber ihren Hintergrund formulieren.

**Bei Fehler:** Wenn die Person ihr aktuelles Niveau nicht artikulieren kann, sie bitten einen kuerzlichen Versuch das Thema zu nutzen oder zu verstehen zu beschreiben. Konkrete Geschichten verraten das Niveau genauer als Selbsteinschaetzung. Wenn sie sich fuer ihr Niveau schaemen, normalisieren: "Jeder faengt irgendwo an -- zu wissen wo Sie stehen hilft mir den besten Pfad fuer Sie zu gestalten."

### Schritt 2: Planen — Den Lernpfad entwerfen

Einen strukturierten Pfad von der aktuellen Position zum Ziel erstellen.

1. Das Thema in 4-7 Lernmeilensteine unterteilen (nicht zu granulaer, nicht zu vage)
2. Meilensteine nach Abhaengigkeit ordnen: was muss vor was verstanden werden?
3. Fuer jeden Meilenstein das Kernkonzept (was verstanden werden muss) und die Kernfaehigkeit (was getan werden koennen muss) identifizieren
4. Zeit pro Meilenstein basierend auf ihren verfuegbaren Stunden schaetzen
5. Den ersten Meilenstein identifizieren -- hier beginnt das Lernen
6. Fruehe Erfolge einbauen: der erste Meilenstein sollte schnell erreichbar sein um Schwung aufzubauen
7. Den Pfad visuell praesentieren: eine nummerierte Liste mit kurzen Beschreibungen

**Erwartet:** Ein Lernpfad den die Person sehen und verstehen kann. Er sollte sich handhabbar anfuehlen -- nicht ueberwealtigend. Die Person sollte auf jeden Meilenstein zeigen und verstehen koennen warum er da ist.

**Bei Fehler:** Wenn der Pfad zu lang wirkt, ist das Ziel moeglicherweise zu ehrgeizig fuer die verfuegbare Zeit -- Umfangsreduzierung besprechen. Wenn der Pfad zu kurz wirkt, ist das Thema moeglicherweise einfacher als erwartet -- oder die Meilensteine sind zu grob und brauchen Zerlegung.

### Schritt 3: Fuehren — Durch Material geleiten

Fuer jeden Meilenstein die Person im richtigen Tempo durch das Material fuehren.

1. Das Meilensteinkonzept mit einem kurzen Ueberblick einfuehren: "In diesem Abschnitt lernen wir X, was Ihnen erlaubt Y zu tun"
2. Das Material in kleinen Einheiten praesentieren -- ein Konzept pro Einheit
3. Den bevorzugten Lernstil der Person nutzen: Lesen -> Text bereitstellen; praktisch -> Uebungen bereitstellen; Diskussion -> sokratisches Fragen verwenden
4. Jedes neue Konzept mit etwas bereits Bekanntem verbinden (aus der Einschaetzung)
5. Konkrete Beispiele vor abstrakten Definitionen geben
6. Wenn Dokumentation verwendet wird, sie durch die relevanten Abschnitte fuehren statt sie allein zum Lesen zu schicken
7. Nach jeder Einheit pausieren: "Ist das bisher verstaendlich?"

**Erwartet:** Die Person schreitet mit Verstaendnis durch das Material voran, nicht nur mit Beruehrung. Sie sollte jedes Konzept in eigenen Worten erklaeren koennen bevor zum naechsten uebergegangen wird. Das Tempo fuehlt sich richtig an -- nicht gehetzt, nicht verschleppt.

**Bei Fehler:** Wenn sie Schwierigkeiten haben, langsamer werden und auf fehlende Voraussetzungen pruefen. Wenn sie muehelos durchkommen, beschleunigen -- ihre Zeit nicht mit bereits Beherrschtem verschwenden. Wenn das Material selbst verwirrend ist (schlechte Dokumentation), eine klarere Erklaerung liefern und die Ressourcenqualitaet fuer zukuenftige Referenz vermerken.

### Schritt 4: Pruefen — Verstaendnis ueberpruefen

Lernen mit Fragen verifizieren die Anwendung erfordern, nicht nur Abrufen.

1. Vorhersagefragen stellen: "Was wuerde passieren wenn Sie X aendern?"
2. Vergleichsfragen stellen: "Wie unterscheidet sich das von Y, das Sie frueher gelernt haben?"
3. Anwendungsfragen stellen: "Wie wuerden Sie das nutzen um Z zu loesen?"
4. Debugging-Fragen stellen: "Dieser Code hat einen Fehler in Bezug auf das was wir gerade gelernt haben -- koennen Sie ihn finden?"
5. Korrekte Antworten spezifisch wuerdigen: "Ja -- und der Grund warum das funktioniert ist..."
6. Bei falschen Antworten ihre Ueberlegung erkunden: "Interessant -- fuehren Sie mich durch Ihren Denkprozess"
7. Falsche Antworten nie als Versagen rahmen -- sie sind diagnostische Information

**Erwartet:** Das Pruefen zeigt ob die Person ein funktionierendes mentales Modell hat oder oberflaechlichen Abruf. Funktionierende Modelle koennen mit Variationen umgehen; oberflaechlicher Abruf nicht. Das Pruefen sollte sich wie eine gemeinsame Uebung anfuehlen, nicht wie eine Pruefung.

**Bei Fehler:** Wenn die Person Anwendungsfragen nicht beantworten kann, war das Lernen zu passiv -- sie brauchen praktische Uebung bevor mehr Material kommt. Wenn sie Abruffragen beantworten aber keine Anwendungsfragen, wurden die Konzepte einzeln verstanden aber nicht integriert -- auf Verbindungen zwischen Konzepten fokussieren.

### Schritt 5: Anpassen — Den Pfad justieren

Basierend auf Pruefungsergebnissen und der Rueckmeldung der Person den Lernpfad anpassen.

1. Wenn ein Meilenstein leicht war: erwaegen ihn mit dem naechsten zu verbinden oder den Inhalt zu vertiefen
2. Wenn ein Meilenstein schwer war: in kleinere Schritte unterteilen oder eine Voraussetzungswiederholung hinzufuegen
3. Wenn sich das Interesse der Person waehrend des Lernens verschiebt: den Pfad nach Moeglichkeit ihrer Neugier anpassen -- Engagement treibt Behalten
4. Wenn sie ermuudet sind: eine Pause und eine spaetere Wiederholungssitzung vorschlagen statt durchzudruecken
5. Wenn ein bestimmter Lehransatz nicht funktioniert: eine andere Modalitaet versuchen (von Lesen zu Tun wechseln, oder von abstrakt zu konkret)
6. Den Lernpfad aktualisieren und Aenderungen kommunizieren: "Basierend auf dem Verlauf schlage ich vor dass wir anpassen..."

**Erwartet:** Der Lernpfad entwickelt sich basierend auf echten Daten. Kein fester Lehrplan ueberlebt den Kontakt mit einem tatsaechlichen Lernenden -- die Anpassung ist der Wert.

**Bei Fehler:** Wenn wiederholte Anpassungen die Person weiterhin kaempfen lassen, gibt es moeglicherweise eine grundlegende Voraussetzungsluecke die in der Einschaetzung nicht erfasst wurde. Zu Schritt 1 zurueckkehren und tiefer sondieren. Wenn die Person die Motivation verliert, das urspruengliche Ziel besprechen -- manchmal ist es angemessener das Ziel anzupassen als den Pfad zu aendern.

### Schritt 6: Nachbereiten — Festigen und naechste Sitzung planen

Gelerntes festigen und fortgesetztes Lernen vorbereiten.

1. Zusammenfassen was behandelt wurde: "Heute haben wir X, Y und Z gelernt"
2. Sie bitten die wichtigste Erkenntnis in eigenen Worten zu formulieren
3. Eine kurze Uebungsaufgabe fuer selbstaendiges Arbeiten bereitstellen (keine Hausaufgabe -- optionale Verstaerkung)
4. 2-3 Ressourcen fuer weitere Erkundung empfehlen (Dokumentation, Tutorials, Beispiele)
5. Bei Verwendung verteilter Wiederholung: Wiederholungspunkte festlegen -- "Diese Konzepte in 2 Tagen erneut durchgehen, dann in einer Woche"
6. Den naechsten Meilenstein vorbereiten: "Naechstes Mal werden wir uns mit ... befassen"
7. Um Rueckmeldung bitten: "Was hat gut funktioniert? Was koennte ich anders machen?"

**Erwartet:** Die Person geht mit klarem Verstaendnis dessen was sie gelernt hat, was sie ueben kann und was als naechstes kommt. Die Sitzung hat einen sauberen Abschluss, kein abruptes Ende.

**Bei Fehler:** Wenn die Person keine wichtigste Erkenntnis formulieren kann, wurde in der Sitzung zu viel oder zu wenig behandelt das haengen blieb. Das eine Konzept identifizieren das am meisten Verstaerkung braucht und die Wiederholung darauf konzentrieren. Wenn sie keine Motivation fuer selbstaendige Uebung haben, muss der Lernpfad moeglicherweise eigenstaendiger sein (alles Lernen innerhalb der Sitzungen).

## Validierung

- [ ] Ausgangsposition wurde vor dem Entwurf des Lernpfads eingeschaetzt
- [ ] Der Lernpfad hat klare Meilensteine geordnet nach Abhaengigkeit
- [ ] Material wurde in kleinen Einheiten mit Verstaendnisprueefungen dazwischen praesentiert
- [ ] Pruefung verwendete Anwendungsfragen, nicht nur Abruf
- [ ] Der Pfad wurde mindestens einmal basierend auf dem tatsaechlichen Fortschritt der Person angepasst
- [ ] Die Sitzung endete mit einer Zusammenfassung, einem Uebungsvorschlag und naechsten Schritten
- [ ] Die Person fuehlte sich durchgehend ermutigt, nicht getestet oder beurteilt

## Haeufige Stolperfallen

- **Informationsueberflutung**: Das gesamte Material auf einmal bereitstellen statt es ueber Meilensteine zu portionieren. Ueberforderung toetet Lernen
- **Die Einschaetzung ueberspringen**: Das Niveau der Person annehmen statt es zu pruefen. Ein Frontend-Experte der Backend lernt kennt moeglicherweise angrenzende Konzepte aber nicht die erwarteten
- **Auf den Durchschnitt unterrichten**: Wenn die Person schneller oder langsamer ist als erwartet, muss das Tempo sich aendern -- am Plan festhalten trotz Rueckmeldung verschwendet ihre Zeit oder verliert sie
- **Nur Theorie, keine Praxis**: Verstaendnis erfordert Tun, nicht nur Hoeren. Jeder Meilenstein sollte ein Praxiselement enthalten
- **Motivation ignorieren**: Eine Person die nicht sieht warum ein Konzept wichtig ist wird es nicht behalten. Jedes Konzept mit ihrem erklarten Ziel verbinden
- **Sitzungen ueberladen**: Zu viel in einer Sitzung abdecken wollen. Besser weniger mit Behalten als mehr mit Vergessen
- **Coach als Dozent**: Der Coach leitet die Erkundung des Lernenden, haelt keinen Monolog. Mehr Fragen stellen als beantworten

## Verwandte Skills

- `learn` -- die selbstgesteuerte KI-Variante fuer systematischen Wissenserwerb
- `teach-guidance` -- eine Person anleiten andere zu unterrichten; komplementaer zum Lerncoaching
- `meditate-guidance` -- mentales Rauschen vor einer Lernsitzung bereinigen verbessert Fokus und Behalten
- `remote-viewing-guidance` -- teilt den strukturierten Beobachtungsansatz der Lernen aus Erfahrung unterstuetzt
