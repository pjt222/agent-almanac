---
name: listen
description: >
  Tiefe empfaengliche Aufmerksamkeit, um Absicht jenseits woertlicher Worte zu
  erfassen. Bildet aktives Zuhoeren aus der Beratungspsychologie auf KI-Reasoning
  ab: Annahmen klaeren, dem vollen Signal folgen, mehrere Ebenen parsen (woertlich,
  prozedural, emotional, kontextuell, einschraenkend, meta), Verstaendnis
  zurueckspiegeln, das Ungesagte bemerken und das Gesamtbild integrieren.
  Verwenden wenn die Anfrage eines Benutzers mehrdeutig wirkt, wenn der Kontext
  etwas anderes nahelegt als die woertlichen Worte, wenn fruehere Antworten
  daneben lagen, oder vor einer grossen Aufgabe, bei der Missverstaendnis der
  Absicht erheblichen Aufwand verschwenden wuerde.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, listening, active-listening, intent-extraction, meta-cognition, receptive-attention
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Zuhoeren

Eine strukturierte Sitzung des tiefen Zuhoerens durchfuehren — Annahmen klaeren, mit voller Empfangsfaehigkeit folgen, mehrere Signalebenen parsen, Verstaendnis zurueckspiegeln, das Ungesagte bemerken und das vollstaendige Bild der Benutzerabsicht integrieren.

## Wann verwenden

- Wenn die Anfrage eines Benutzers mehrdeutig wirkt und uebereiltes Handeln riskiert, das falsche Problem zu loesen
- Wenn die Worte des Benutzers etwas sagen, aber der Kontext etwas anderes nahelegt (Diskrepanz zwischen Woertlichem und Impliziertem)
- Wenn fruehere Antworten daneben lagen — der Benutzer klaert oder formuliert immer wieder um
- Wenn eine komplexe Anfrage mehrere Ebenen enthaelt: technische Beduerfnisse, emotionaler Kontext, unausgesprochene Einschraenkungen
- Vor dem Beginn einer grossen Aufgabe, bei der Missverstaendnis der Absicht erheblichen Aufwand verschwenden wuerde
- Nach `meditate` inneren Laerm klaert, richtet `listen` die geklaerte Aufmerksamkeit nach aussen auf den Benutzer

## Eingaben

- **Erforderlich**: Benutzernachricht(en) zum Aufnehmen (implizit aus der Konversation verfuegbar)
- **Optional**: Konversationsverlauf als Kontext fuer die aktuelle Anfrage
- **Optional**: MEMORY.md oder CLAUDE.md mit Benutzerpraeferenzen und Projektkontext
- **Optional**: Spezifische Sorge darueber, was missverstanden werden koennte

## Vorgehensweise

### Schritt 1: Klaeren — Annahmen loslassen

Bevor das Signal des Benutzers empfangen wird, Vorurteile darueber loslassen, was er will.

1. Bereits sich bildende vorgeformte Antworten bemerken — sie benennen und beiseitelegen
2. Auf Mustererkennung pruefen: "Das klingt wie eine Anfrage, die ich schon gesehen habe" — diese Zuordnung kann falsch sein
3. Die Annahme loslassen, dass der erste Satz des Benutzers die vollstaendige Anfrage enthaelt
4. Die Annahme loslassen, dass die technische Anfrage die einzige Anfrage ist
5. Die Worte des Benutzers angehen, als wuerden sie zum ersten Mal gehoert, selbst wenn aehnliche Anfragen zuvor bearbeitet wurden

**Erwartet:** Ein empfaenglicher Zustand, in dem die Aufmerksamkeit offen ist, statt sich bereits auf eine Loesung zu verengen. Der Impuls, sofort zu antworten, wird zugunsten des vollstaendigen Empfangens pausiert.

**Bei Fehler:** Wenn Annahmen nicht losgelassen werden koennen (eine starke Mustererkennung bleibt bestehen), die Zuordnung explizit anerkennen: "Das sieht aus wie X — aber lassen Sie mich pruefen, ob das tatsaechlich gefragt wird." Das Benennen der Annahme schwaecht ihren Griff.

### Schritt 2: Aufnehmen — Volle Empfangsfaehigkeit

Die Nachricht des Benutzers mit vollstaendiger Aufmerksamkeit lesen und alle Teile gleichzeitig im Bewusstsein halten.

1. Die gesamte Nachricht lesen, bevor ein Teil davon verarbeitet wird
2. Die Struktur bemerken: Ist dies eine einzelne Anfrage, mehrere Anfragen, eine Frage, eine Korrektur, eine Erzaehlung?
3. Die Schluesselsubstantive und -verben markieren — die konkreten Elemente, die der Benutzer angegeben hat
4. Bemerken, was betont wird: Was hat er ausfuehrlich behandelt? Was hat er knapp formuliert?
5. Die Reihenfolge bemerken: Was kam zuerst (oft die Prioritaet), was kam zuletzt (oft der Nachgedanke — oder die eigentliche Anfrage, am Ende vergraben)
6. Ein zweites Mal lesen, diesmal auf Ton und Rahmung achten statt auf Inhalt

**Erwartet:** Ein vollstaendiger Empfang der Nachricht — keine Worte uebersprungen, keine Saetze ueberflogen. Die Nachricht wird als Ganzes gehalten, statt sofort in handlungsrelevante Teile zerlegt zu werden.

**Bei Fehler:** Wenn die Nachricht sehr lang ist, in Abschnitte unterteilen, aber trotzdem jeden Abschnitt vollstaendig lesen. Wenn die Aufmerksamkeit zu einem Teil gezogen wird (normalerweise dem technischsten), bewusst den nicht-technischen Teilen Aufmerksamkeit schenken — sie enthalten oft die Absicht.

### Schritt 3: Schichten — Signaltypen parsen

Die Nachricht des Benutzers enthaelt mehrere gleichzeitige Signale. Jede Ebene separat parsen.

```
Signalebenen-Taxonomie:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Ebene        │ Was zu extrahieren ist        │ Belege                   │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Woertlich    │ Was die Worte ausdruecklich   │ Direkte Aussagen,        │
│              │ sagen — die Oberflaechenan-   │ spezifische Anweisungen  │
│              │ frage                         │                          │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Prozedural   │ Was getan werden soll — die   │ Verben, Aktionswoerter,  │
│              │ gewuenschte Handlung oder     │ "Ich moechte", "bitte",  │
│              │ Ausgabe                       │ "koennen Sie"            │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Emotional    │ Wie sie sich zur Situation    │ Frustration ("Ich        │
│              │ fuehlen — Frustration,        │ versuche staendig"),     │
│              │ Neugier, Dringlichkeit,       │ Dringlichkeit ("Ich      │
│              │ Freude                        │ brauche das jetzt"),     │
│              │                              │ Freude ("Das ist cool")  │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Kontextuell  │ Die Situation rund um die     │ Erwaehnung von Fristen,  │
│              │ Anfrage — warum jetzt, was    │ anderen Personen,        │
│              │ sie ausgeloest hat            │ Projekten, frueheren     │
│              │                              │ Versuchen                │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Einschraen-  │ Grenzen der Loesung — was    │ "Ohne X zu aendern",     │
│ kend         │ erhalten bleiben muss, was   │ "halte es einfach",      │
│              │ sich nicht aendern darf       │ "kompatibel mit Y"       │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Meta         │ Die Anfrage ueber die         │ "Stelle ich die richtige │
│              │ Anfrage — fragt er, ob er     │ Frage?", "Ist das        │
│              │ das Richtige fragt?           │ ueberhaupt moeglich?",   │
│              │                              │ "Sollte ich X tun?"      │
└──────────────┴──────────────────────────────┴──────────────────────────┘
```

Fuer jede Ebene notieren, was vorhanden und was abwesend ist. Die abwesenden Ebenen sind ebenso informativ wie die vorhandenen.

**Erwartet:** Eine mehrschichtige Lesung der Nachricht. Die woertliche und prozedurale Ebene sind normalerweise klar. Die emotionale, kontextuelle, einschraenkende und Meta-Ebene erfordern sorgfaeltigere Aufmerksamkeit. Mindestens eine nicht-woertliche Ebene sollte identifiziert werden.

**Bei Fehler:** Wenn nur die woertliche Ebene sichtbar ist, kann die Nachricht wirklich unkompliziert sein — nicht jede Kommunikation ist mehrschichtig. Aber pruefen: Ist die Nachricht ungewoehnlich kurz fuer ihre Komplexitaet? Gibt es abschwaeohende Woerter ("vielleicht", "ich denke", "wenn moeglich")? Diese deuten oft auf eine unausgesprochene Ebene hin.

### Schritt 4: Spiegeln — Verstaendnis zurueckspiegeln

Bevor gehandelt wird, das Gehoerte zurueckspiegeln, um Uebereinstimmung zu verifizieren.

1. Die Anfrage in anderen Worten paraphrasieren als der Benutzer verwendet hat — das zeigt, ob die Bedeutung erfasst wurde, nicht nur die Worte
2. Die Ebenen explizit benennen, wenn nicht-woertliche Ebenen bedeutsam sind: "Es klingt, als wollten Sie X, und die Dringlichkeit deutet darauf hin, dass dies andere Arbeit blockiert"
3. Formulieren, was als Prioritaet verstanden wurde: "Der wichtigste Teil scheint zu sein..."
4. Wenn es mehrere moegliche Interpretationen gibt, sie benennen: "Das koennte A oder B bedeuten — was trifft eher zu?"
5. Wenn die Anfrage scheinbare Widersprueche enthaelt, diese behutsam ansprechen: "Sie haben X erwaehnt und auch Y — wie verhaelt sich das zueinander?"

**Erwartet:** Der Benutzer bestaetigt die Spiegelung oder korrigiert sie. Beide Ergebnisse sind wertvoll — Bestaetigung bedeutet, die Absicht ist abgestimmt; Korrektur bedeutet, die Absicht ist jetzt klarer. Die Spiegelung sollte sich wie ein Spiegel anfuehlen, nicht wie ein Urteil.

**Bei Fehler:** Wenn der Benutzer ungeduldig mit der Spiegelung wirkt ("mach einfach"), bevorzugt er moeglicherweise Geschwindigkeit gegenueber Abstimmung — diese Praeferenz honorieren, aber das Risiko der Fehlabstimmung notieren. Wenn die Spiegelung falsch war, sie nicht verteidigen — die Korrektur akzeptieren und das Verstaendnis sofort aktualisieren.

### Schritt 5: Stille bemerken — Die Luecken lesen

Auf das achten, was der Benutzer nicht gesagt hat, was ebenso wichtig sein kann wie das Gesagte.

1. Welches verwandte Thema hat er nicht erwaehnt? (fehlender Kontext)
2. Welche Einschraenkung hat er nicht formuliert? (angenommenes Wissen oder unausgesprochene Praeferenz)
3. Welcher emotionale Ton fehlt? (Ruhe in einer Situation, die normalerweise Stress verursacht, oder Dringlichkeit ohne Erklaerung)
4. Welche alternativen Ansaetze hat er nicht betrachtet? (Tunnelblick oder bewusster Ausschluss)
5. Welche Frage hat er nicht gestellt? (die Frage hinter der Frage)

**Erwartet:** Mindestens eine bedeutsame Luecke identifiziert. Diese Luecke muss moeglicherweise nicht angesprochen werden — aber das Bewusstsein dafuer verhindert blinde Flecken. Die nuetzlichsten Luecken sind fehlende Einschraenkungen (der Benutzer hat etwas angenommen, das er nicht formuliert hat) und fehlender Kontext (warum er das jetzt braucht).

**Bei Fehler:** Wenn keine Luecken erkennbar sind, war der Benutzer moeglicherweise gruendlich — wahrscheinlicher ist jedoch, dass die Luecken in Bereichen liegen, fuer die auch die KI blind ist. Ueberlegen: Was wuerde eine andere Person, die an diesem Projekt arbeitet, wissen wollen, das der Benutzer nicht formuliert hat? Diese seitliche Perspektive deckt oft verborgene Luecken auf.

### Schritt 6: Integrieren — Vollstaendiges Verstaendnis synthetisieren

Alle Ebenen und Luecken zu einem einheitlichen Bild des tatsaechlichen Beduerfnisses des Benutzers zusammenfuegen.

1. Das vollstaendige Verstaendnis formulieren: woertliche Anfrage + implizierte Absicht + emotionaler Kontext + Einschraenkungen + Luecken
2. Das Kernbeduerfnis identifizieren: Wenn alles andere wegfiele, was ist die eine Sache, die der Benutzer am meisten braucht?
3. Die angemessene Antwort bestimmen: Will der Benutzer Handlung, Verstaendnis, Bestaetigung oder Erforschung?
4. Wenn das integrierte Verstaendnis von der woertlichen Anfrage abweicht, entscheiden, ob das tiefere Beduerfnis oder die formulierte Anfrage adressiert wird (normalerweise beides)
5. Die Absicht fuer die naechste Handlung setzen: "Basierend auf dem, was ich gehoert habe, werde ich..."

**Erwartet:** Ein vollstaendiges, nuanciertes Verstaendnis des Benutzerbeduerfnisses, das ueber die Oberflaechenanfrage hinausgeht. Das Verstaendnis ist spezifisch genug, um Handlung zu leiten, und ehrlich genug, um Unsicherheit einzugestehen.

**Bei Fehler:** Wenn die Integration ein verworrenes Bild erzeugt, koennen die Signale wirklich in Konflikt stehen. In diesem Fall eine fokussierte Frage stellen, die die Mehrdeutigkeit aufloesen wuerde: "Das Wichtigste, das ich verstehen muss, ist..." Nicht mehrere Fragen stellen — eine einzelne gut gewaehlte Frage offenbart mehr als eine Liste von Klaerungen.

## Validierung

- [ ] Annahmen wurden geklaert, bevor der Nachricht des Benutzers Aufmerksamkeit geschenkt wurde
- [ ] Die vollstaendige Nachricht wurde gelesen, bevor ein Teil davon bearbeitet wurde
- [ ] Mindestens eine nicht-woertliche Signalebene wurde identifiziert (emotional, kontextuell, einschraenkend oder meta)
- [ ] Verstaendnis wurde dem Benutzer zurueckgespiegelt, bevor gehandelt wurde
- [ ] Luecken und Stille wurden bemerkt und in das Verstaendnis einbezogen
- [ ] Das integrierte Verstaendnis adressiert das Kernbeduerfnis des Benutzers, nicht nur die Oberflaechenanfrage

## Haeufige Stolperfallen

- **Zuhoeren um zu antworten**: Eine Antwort formulieren, waehrend die Nachricht noch empfangen wird. Die Antwort formt, was gehoert wird, und filtert Signale heraus, die nicht zur vorgeformten Antwort passen
- **Nur woertliches Zuhoeren**: Die Worte zum Nennwert nehmen und die Absicht, Emotion oder den Kontext dahinter verpassen
- **Projektion**: Hoeren, was der Benutzer sagen wuerde, wenn er die KI waere, statt was er tatsaechlich gesagt hat. Seine Prioritaeten und sein Kontext sind anders
- **Ueberinterpretation**: Ebenen finden, die nicht vorhanden sind. Manchmal ist eine Anfrage zur Fehlerbehebung einfach eine Anfrage zur Fehlerbehebung — nicht jede Nachricht hat verborgenen emotionalen Inhalt
- **Zu viel spiegeln**: Jede Interaktion in ein reflektives Gespraech verwandeln, wenn der Benutzer schnelles Handeln will. Die Spiegelungstiefe an die Anfragekomplexitaet anpassen
- **Das Woertliche vernachlaessigen**: So auf Subtext fokussiert, dass die explizite Anfrage nicht erfuellt wird. Die woertliche Ebene ist immer noch wichtig — sie adressieren, auch wenn tiefere Ebenen vorhanden sind

## Verwandte Skills

- `listen-guidance` — die Variante zur menschlichen Anleitung, um eine Person in der Entwicklung aktiver Zuhoerfaehigkeiten zu coachen
- `observe` — anhaltendes neutrales Mustererkennen, das Zuhoeren mit breiterem Kontext speist
- `teach` — effektives Lehren erfordert zuerst Zuhoeren, um die Beduerfnisse des Lernenden zu verstehen
- `meditate` — nach innen gerichtete Aufmerksamkeit, die den Raum fuer nach aussen gerichtetes Zuhoeren klaert
- `heal` — Selbstbewertung, die offenbart, ob die Zuhoerfaehigkeit der KI durch Drift beeintraechtigt ist
