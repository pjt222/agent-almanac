---
name: solve-electromagnetic-induction
description: >
  Probleme mit sich aenderndem magnetischen Fluss mittels Faradayschem Gesetz,
  Lenzscher Regel, Bewegungs-EMK, Gegen- und Selbstinduktivitaet sowie
  RL-Schaltungstransienten loesen. Verwenden bei der Berechnung induzierter EMK
  aus zeitveraenderlichen B-Feldern oder bewegten Leitern, bei der Bestimmung
  der Stromrichtung ueber die Lenzsche Regel, bei der Analyse von Induktivitaet
  und Energiespeicherung in Magnetfeldern oder beim Loesen von
  RL-Schaltungs-Differentialgleichungen fuer Schalttransienten.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, induction, faraday, lenz, inductance, rl-circuits
  locale: de
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Elektromagnetische Induktion loesen

Elektromagnetische Induktionsphaenomene analysieren durch Identifikation der Quelle des sich aendernden magnetischen Flusses, Berechnung des Flusses durch die relevante Flaeche, Anwendung des Faradayschen Gesetzes zur Bestimmung der induzierten EMK, Bestimmung der Richtung des induzierten Stroms ueber die Lenzsche Regel und Loesung der resultierenden Schaltungsgleichungen einschliesslich RL-Transienten und im Magnetfeld gespeicherter Energie.

## Wann verwenden

- Berechnung der induzierten EMK in einer Schleife oder Spule aufgrund eines zeitveraenderlichen Magnetfelds
- Analyse der Bewegungs-EMK eines Leiters, der sich durch ein statisches B-Feld bewegt
- Bestimmung der Richtung des induzierten Stroms mittels Lenzscher Regel
- Berechnung der Gegeninduktivitaet zwischen gekoppelten Spulen oder der Selbstinduktivitaet einer einzelnen Spule
- Loesung von RL-Schaltungstransienten (Einschalten, Ausschalten, Umschalten zwischen Zustaenden)
- Berechnung der im Magnetfeld oder in einer Induktivitaet gespeicherten Energie

## Eingaben

- **Erforderlich**: Quelle des sich aendernden Flusses (zeitveraenderliches B-Feld, bewegter Leiter oder sich aendernde Schleifenflaeche)
- **Erforderlich**: Geometrie der Schaltung oder Schleife, durch die der Fluss berechnet wird
- **Erforderlich**: Relevante physikalische Parameter (B-Feld-Staerke, Geschwindigkeit, Widerstand, Induktivitaet oder Geometrie fuer Induktivitaetsberechnung)
- **Optional**: An die Induktionsschleife angeschlossene Schaltungselemente (Widerstaende, zusaetzliche Induktivitaeten, Quellen)
- **Optional**: Anfangsbedingungen fuer Transientenanalyse (Anfangsstrom, anfaenglich gespeicherte Energie)
- **Optional**: Interessierendes Zeitintervall fuer Transientenloesungen

## Vorgehensweise

### Schritt 1: Quelle des sich aendernden Flusses identifizieren

Den physikalischen Mechanismus klassifizieren, der einen zeitveraenderlichen magnetischen Fluss erzeugt:

1. **Sich aenderndes B-Feld**: Das Magnetfeld selbst variiert in der Zeit (z.B. Wechselstrom-Elektromagnet, sich naehernder Magnet, Stromrampe in einer nahen Spule). Die Schleife ist stationaer.
2. **Sich aendernde Flaeche**: Die Schleifenflaeche aendert sich (z.B. expandierende oder kontrahierende Schleife, rotierende Spule in einem statischen Feld). Das B-Feld kann statisch sein.
3. **Bewegter Leiter (Bewegungs-EMK)**: Ein gerader Leiter bewegt sich durch ein statisches B-Feld. Die Flussaenderung entsteht dadurch, dass der Leiter Flaeche ueberstreicht.
4. **Kombiniert**: Sowohl Feld als auch Geometrie aendern sich gleichzeitig (z.B. eine Spule rotiert in einem zeitveraenderlichen Feld). Die Beitraege zur Klarheit trennen.

Fuer jeden Mechanismus die relevante Flaeche S identifizieren, die vom Schaltungsring C begrenzt wird:

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

**Erwartet:** Eine klare Identifikation, warum sich der Fluss aendert, ueber welche Flaeche integriert werden muss und welche physikalischen Groessen die Zeitabhaengigkeit tragen.

**Bei Fehler:** Wenn die Quelle des sich aendernden Flusses mehrdeutig ist (z.B. eine sich verformende Schleife in einem ungleichfoermigen Feld), das Problem in eine Summe von Beitraegen zerlegen: einen von der Feldaenderung bei fester Geometrie und einen von der Geometrieaenderung im momentanen Feld. Diese Zerlegung ist immer gueltig.

### Schritt 2: Magnetischen Fluss durch die relevante Flaeche berechnen

Den magnetischen Fluss Phi_B = Integral von B . dA ueber die Flaeche S berechnen:

1. **Gleichfoermiges Feld, flache Schleife**: Phi_B = B * A * cos(theta), wobei theta der Winkel zwischen B und dem Flaechennormalenvektor n_hat ist. Dies ist der haeufigste Lehrbuchfall.

2. **Ungleichfoermiges Feld**: Die Flaeche S parametrisieren und das Integral auswerten:
   - Koordinaten passend zur Flaeche waehlen (z.B. Polarkoordinaten fuer eine kreisfoermige Schleife)
   - B(r) an jedem Punkt der Flaeche ausdruecken
   - Das Skalarprodukt B . dA = B . n_hat dA berechnen
   - Ueber die Flaeche integrieren

3. **Gekoppelte Spulen (Gegeninduktivitaet)**: Fuer Spule 2 verbunden mit Spule 1:
   - B_1 (Feld von Spule 1) am Ort von Spule 2 berechnen
   - B_1 ueber die Flaeche jeder Windung von Spule 2 integrieren
   - Mit N_2 (Windungszahl in Spule 2) fuer Gesamtflussverkettung multiplizieren: Lambda_21 = N_2 * Phi_21
   - Gegeninduktivitaet: M = Lambda_21 / I_1

4. **Selbstinduktivitaet**: Fuer eine einzelne stromfuehrende Spule mit Strom I:
   - B innerhalb der Spule aus dem eigenen Strom der Spule berechnen
   - B ueber den Querschnitt einer Windung integrieren und mit N multiplizieren
   - Selbstinduktivitaet: L = N * Phi / I = Lambda / I
   - Bekannte Ergebnisse: Solenoid L = mu_0 * n^2 * A * l; Toroid L = mu_0 * N^2 * A / (2 pi R)

5. **Zeitabhaengigkeit**: Phi_B(t) explizit ausdruecken durch Einsetzen der in Schritt 1 identifizierten zeitveraenderlichen Groessen.

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

**Erwartet:** Ein expliziter Ausdruck fuer Phi_B(t) mit korrekten Einheiten (Weber = T . m^2) und, falls zutreffend, Induktivitaetswerte mit der Einheit Henry.

**Bei Fehler:** Wenn das Flussintegral nicht analytisch ausgewertet werden kann (z.B. ungleichfoermiges Feld ueber eine nicht-triviale Flaeche), numerische Quadratur verwenden. Fuer die Gegeninduktivitaet komplexer Geometrien die Neumann-Formel in Betracht ziehen: M = (mu_0 / 4 pi) * Doppel-Konturintegral von (dl_1 . dl_2) / |r_1 - r_2|.

### Schritt 3: Faradaysches Gesetz fuer induzierte EMK anwenden

Die induzierte EMK aus der Zeitableitung des Flusses berechnen:

1. **Faradaysches Gesetz**: EMK = -d(Lambda)/dt = -N * d(Phi_B)/dt. Das negative Vorzeichen kodiert die Lenzsche Regel (Gegenwirkung zur Aenderung).

2. **Differentiation**: Die totale Zeitableitung von Phi_B(t) bilden:
   - Wenn B = B(t) und A, theta konstant: EMK = -N * A * cos(theta) * dB/dt
   - Wenn theta = omega * t (rotierende Spule in statischem B): EMK = N * B * A * omega * sin(omega * t)
   - Wenn sich die Flaeche aendert (z.B. Gleitschiene): EMK = -B * l * v (Bewegungs-EMK, wobei l die Schienenlaenge und v die Geschwindigkeit ist)
   - Fuer den allgemeinen Fall: die Leibniz-Integralregel zum Differenzieren unter dem Integralzeichen verwenden

3. **Bewegungs-EMK (alternative Herleitung)**: Fuer einen Leiter der Laenge l, der sich mit Geschwindigkeit v im Feld B bewegt:
   - Die Lorentz-Kraft auf Ladungen im Leiter: F = q(v x B)
   - EMK = Integral von (v x B) . dl entlang des Leiters
   - Dies ist aequivalent zum Faradayschen Gesetz, kann aber fuer bewegte Leiter intuitiver sein

4. **Vorzeichen- und Groessenordnungspruefung**: Die Groessenordnung der EMK sollte physikalisch vernuenftig sein. Fuer typische Laboraufbauten: mV- bis V-Bereich. Fuer Stromerzeugung: V- bis kV-Bereich.

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

**Erwartet:** Ein expliziter Ausdruck fuer EMK(t) mit korrekten Einheiten (Volt) und physikalisch vernuenftiger Groessenordnung.

**Bei Fehler:** Wenn die EMK falsche Einheiten hat, zurueck zur Flussberechnung verfolgen -- ein fehlender Flaechenfaktor oder ein inkonsistentes Einheitensystem (z.B. Mischung von CGS und SI) ist die wahrscheinlichste Ursache. Wenn das EMK-Vorzeichen falsch erscheint, die Orientierung der Flaechennormale relativ zur Schaltungsschleifenrichtung erneut pruefen (Rechte-Hand-Regel).

### Schritt 4: Stromrichtung ueber Lenzsche Regel bestimmen

Die Richtung des induzierten Stroms und seine physikalischen Konsequenzen festlegen:

1. **Aussage der Lenzschen Regel**: Der induzierte Strom fliesst in der Richtung, die der Aenderung des magnetischen Flusses entgegenwirkt, die ihn erzeugt hat. Dies ist eine Folge der Energieerhaltung.

2. **Anwendungsverfahren**:
   - Bestimmen ob der Fluss durch die Schleife zunimmt oder abnimmt
   - Wenn der Fluss zunimmt: induzierter Strom erzeugt ein B-Feld, das der Zunahme entgegenwirkt (entgegengesetzt zur externen Feldrichtung durch die Schleife)
   - Wenn der Fluss abnimmt: induzierter Strom erzeugt ein B-Feld, das den abnehmenden Fluss unterstuetzt (gleiche Richtung wie das externe Feld durch die Schleife)
   - Die Rechte-Hand-Regel verwenden um die erforderliche B-Feld-Richtung in eine Stromrichtung umzuwandeln

3. **Kraftkonsequenzen**: Der induzierte Strom in Anwesenheit des externen B-Felds erfaehrt eine Kraft:
   - Wirbelstrombremsung: die Kraft wirkt der Relativbewegung entgegen (immer verzoegernd)
   - Magnetische Levitation: die abstossende Kraft traegt Gewicht wenn die Geometrie geeignet ist
   - Diese Kraefte sind eine direkte Manifestation der Lenzschen Regel auf mechanischer Ebene

4. **Qualitative Verifikation**: Die induzierten Effekte sollten immer der Aenderung widerstehen. Ein fallender Magnet durch ein leitendes Rohr faellt langsamer als im freien Fall. Ein Generator erfordert mechanische Arbeitseinspeisung um elektrische Energie zu erzeugen.

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

**Erwartet:** Eine klar formulierte Stromrichtung, die mit der Lenzschen Regel konsistent ist, mit identifizierter physikalischer Konsequenz (Kraft, Bremsung, Energieuebertragung).

**Bei Fehler:** Wenn die Stromrichtung die Flussaenderung zu verstaerken scheint statt ihr entgegenzuwirken, ist die Orientierung der Flaechennormale oder die Anwendung der Rechte-Hand-Regel umgekehrt. Die Schleifenorientierungskonvention erneut pruefen. Ein Strom, der die Flussaenderung verstaerkt, wuerde die Energieerhaltung verletzen.

### Schritt 5: Resultierende Schaltungsgleichung loesen

Die Schaltungsgleichung einschliesslich der Induktivitaet formulieren und loesen:

1. **RL-Schaltungsbildung**: Wenn die induzierte EMK Strom durch eine Schaltung mit Widerstand R und Induktivitaet L treibt, gibt die Kirchhoffsche Spannungsregel:
   - Einschalten (Schalter schliesst auf DC-Quelle V_0): V_0 = L dI/dt + R I
   - Ausschalten (Quelle entfernt, Schleife geschlossen): 0 = L dI/dt + R I
   - Allgemein (zeitveraenderliche EMK): EMK(t) = L dI/dt + R I

2. **Loesung der gewoehnlichen Differentialgleichung erster Ordnung**:
   - Einschalten: I(t) = (V_0 / R) * [1 - exp(-t / tau)], wobei tau = L / R die Zeitkonstante ist
   - Ausschalten: I(t) = I_0 * exp(-t / tau)
   - Wechselstromantrieb EMK = EMK_0 sin(omega t): mittels Zeigermethoden oder partikulaerer + homogener Loesung loesen
   - Transientendauer: Strom erreicht ~63% des Endwerts nach 1 tau, ~95% nach 3 tau, ~99.3% nach 5 tau

3. **Energieanalyse**:
   - In der Induktivitaet gespeicherte Energie: U_L = (1/2) L I^2
   - Im Magnetfeld pro Volumeneinheit gespeicherte Energie: u_B = B^2 / (2 mu_0) im Vakuum, oder u_B = (1/2) B . H in magnetischen Materialien
   - Im Widerstand dissipierte Leistung: P_R = I^2 R
   - Energieerhaltung: Energieeingangsrate = Energiespeicherrate + Dissipationsrate

4. **Gegeninduktivitaetskopplung**: Fuer zwei gekoppelte Spulen mit Gegeninduktivitaet M:
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - Kopplungskoeffizient: k = M / sqrt(L_1 L_2), wobei 0 <= k <= 1
   - Die gekoppelten DGLs gleichzeitig loesen (Matrixexponential oder Laplace-Transformation)

5. **Stationaer- und Transientenseparation**: Fuer wechselstromgetriebene Schaltungen die Loesung in einen Transienten (abklingende Exponentialfunktion) und einen stationaeren Anteil (sinusfoermig bei Antriebsfrequenz) zerlegen. Impedanz Z_L = j omega L und Phasenwinkel berichten.

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

**Erwartet:** Eine vollstaendige Zeitbereichsloesung fuer den Strom mit korrekten exponentiellen Zeitkonstanten, verifizierter Energiebilanz und physikalisch vernuenftigen Groessenordnungen.

**Bei Fehler:** Wenn der Strom unbegrenzt waechst, liegt wahrscheinlich ein Vorzeichenfehler im DGL-Aufbau vor (der Induktivitaetsterm sollte Stromaenderungen entgegenwirken). Wenn die Zeitkonstante unvernuenftig gross oder klein ist, die Induktivitaetsberechnung aus Schritt 2 und den Widerstandswert erneut pruefen. Zeitkonstanten fuer typische Labor-RL-Schaltungen reichen von Mikrosekunden bis Sekunden.

## Validierung

- [ ] Quelle des sich aendernden Flusses ist klar identifiziert (sich aenderndes B, sich aendernde Flaeche, Bewegung, kombiniert)
- [ ] Magnetisches Flussintegral ist ueber die korrekte Flaeche mit richtiger Orientierung aufgestellt
- [ ] Fluss hat korrekte Einheiten (Weber = T . m^2)
- [ ] Induktivitaetswerte (Selbst- oder Gegen-) haben korrekte Einheiten (Henry) und vernuenftige Groessenordnung
- [ ] EMK hat korrekte Einheiten (Volt) und physikalisch vernuenftige Groessenordnung
- [ ] EMK-Vorzeichen ist konsistent mit Lenzscher Regel (wirkt der Flussaenderung entgegen)
- [ ] Stromrichtung ist durch Lenzsche Regel bestimmt und mit Rechte-Hand-Regel verifiziert
- [ ] RL-Schaltungs-DGL ist korrekt mit richtigen Vorzeichen aufgestellt
- [ ] Zeitkonstante tau = L/R hat korrekte Einheiten (Sekunden) und vernuenftige Groessenordnung
- [ ] Energiebilanz ist verifiziert: Eingangsenergie = gespeicherte Energie + dissipierte Energie
- [ ] Grenzfaelle geprueft (t -> 0 fuer Anfangsbedingungen, t -> unendlich fuer stationaeren Zustand)

## Haeufige Stolperfallen

- **Falsches Vorzeichen im Faradayschen Gesetz**: Die EMK ist EMK = -d(Lambda)/dt, nicht +d(Lambda)/dt. Das negative Vorzeichen ist wesentlich -- es kodiert die Lenzsche Regel und die Energieerhaltung. Sein Weglassen erzeugt einen Strom, der die Flussaenderung verstaerkt, was die Thermodynamik verletzt.
- **Verwechslung von Fluss und Flussverkettung**: Fuer eine Einwindungsschleife sind Phi_B und Lambda identisch. Fuer eine Spule mit N Windungen ist Lambda = N * Phi_B. Induktivitaet ist definiert als L = Lambda / I, nicht L = Phi_B / I. Das Fehlen des Faktors N erzeugt Induktivitaetswerte, die N-mal zu klein sind.
- **Inkonsistenz der Flaechennormale**: Die Flaechennormale n_hat muss durch die Rechte-Hand-Regel mit der Schleifenumlaufrichtung zusammenhaengen. Unabhaengige Wahl fuehrt zu Vorzeichenfehlern sowohl im Fluss als auch in der EMK.
- **Gegen-EMK in RL-Schaltungen ignorieren**: Wenn sich der Strom in einer Induktivitaet aendert, erzeugt die Induktivitaet eine Gegen-EMK, die der Aenderung entgegenwirkt. Das Weglassen dieses Terms aus der Kirchhoffschen Spannungsregel macht die Schaltungsgleichung algebraisch statt differentiell und verfehlt den Transienten vollstaendig.
- **Annahme instantaner Stromaenderung**: Der Strom durch eine ideale Induktivitaet kann sich nicht instantan aendern (es wuerde unendliche Spannung erfordern). Anfangsbedingungen fuer RL-Transienten muessen Stetigkeit des Induktivitaetsstroms ueber Schaltereignisse hinweg erfuellen.
- **Vernachlaessigung von Wirbelstroemen in Massivleitern**: Das Faradaysche Gesetz gilt fuer jeden geschlossenen Pfad in einem Leiter, nicht nur fuer diskrete Drahtschleifen. Zeitveraenderliche Felder in Massivleitern induzieren verteilte Wirbelstroeme, die Erwaermung (Verlust) und entgegenwirkende Felder (Abschirmung) erzeugen. Diese sind in Transformatorkernen kritisch und muessen durch Laminierung minimiert werden.

## Verwandte Skills

- `analyze-magnetic-field` -- das B-Feld aus Stromverteilungen berechnen, die als Flussquelle dienen
- `formulate-maxwell-equations` -- Induktion auf den vollstaendigen Maxwell-Rahmen verallgemeinern einschliesslich Verschiebungsstrom
- `design-electromagnetic-device` -- Induktionsprinzipien auf Motoren, Generatoren und Transformatoren anwenden
- `derive-theoretical-result` -- analytische Ergebnisse fuer Induktivitaet, EMK oder Transientenloesungen aus ersten Prinzipien herleiten
