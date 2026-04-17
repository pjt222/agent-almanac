---
name: explore-diophantine-equations
description: >
  Diophantische Gleichungen (nur ganzzahlige Loesungen) einschliesslich linearer,
  quadratischer und Pell-Gleichungen loesen. Umfasst den erweiterten Euklidischen
  Algorithmus, Abstiegsmethoden und Existenzbeweise. Verwenden beim Finden aller
  ganzzahligen Loesungen von ax + by = c, beim Loesen der Pell-Gleichung, beim
  Generieren Pythagoreischer Tripel, beim Beweisen, dass keine ganzzahligen
  Loesungen existieren ueber modulare Einschraenkungen, oder beim Finden der
  Fundamentalloesung, aus der alle anderen erzeugt werden.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: advanced
  language: multi
  tags: number-theory, diophantine, integer-solutions, pell-equation, euclidean
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Diophantische Gleichungen erkunden

Diophantische Gleichungen loesen -- Polynomgleichungen, bei denen nur ganzzahlige Loesungen gesucht werden. Die Gleichung nach Typ klassifizieren, auf Loesbarkeit testen, partikulaere und allgemeine Loesungen finden und Loesungsfamilien erzeugen. Umfasst lineare Gleichungen, Pell-Gleichungen, Pythagoreische Tripel und allgemeine quadratische Formen.

## Wann verwenden

- Alle ganzzahligen Loesungen einer linearen Gleichung ax + by = c finden
- Die Pell-Gleichung x^2 - Dy^2 = 1 (oder = -1) loesen
- Pythagoreische Tripel oder andere parametrische ganzzahlige Familien erzeugen
- Beweisen, dass eine gegebene Gleichung keine ganzzahligen Loesungen hat (ueber modulare Einschraenkungen)
- Loesbarkeit einer allgemeinen quadratischen diophantischen Gleichung testen
- Die Fundamentalloesung finden, aus der alle anderen erzeugt werden

## Eingaben

- **Erforderlich**: Die zu loesende diophantische Gleichung (in expliziter Form, z.B. 3x + 5y = 17 oder x^2 - 7y^2 = 1)
- **Optional**: Ob alle Loesungen gefunden, nur eine partikulaere Loesung bestimmt oder Nichtexistenz bewiesen werden soll
- **Optional**: Einschraenkungen fuer Variablenbereiche (z.B. nur positive ganze Zahlen)
- **Optional**: Ob die allgemeine Loesung parametrisch ausgedrueckt werden soll
- **Optional**: Bevorzugte Beweistechnik (konstruktiv, Abstieg, modulare Obstruktion)

## Vorgehensweise

### Schritt 1: Gleichungstyp klassifizieren

Die Struktur der diophantischen Gleichung bestimmen, um die geeignete Loesungsmethode auszuwaehlen.

1. **Linear**: ax + by = c wobei a, b, c gegebene ganze Zahlen und x, y Unbekannte sind.
   - Loesungsmethode: Erweiterter Euklidischer Algorithmus.

2. **Pell-Gleichung**: x^2 - Dy^2 = 1 (oder = -1, oder = N) wobei D eine positive nicht-quadratische ganze Zahl ist.
   - Loesungsmethode: Kettenbruchentwicklung von sqrt(D).

3. **Pythagoreisch**: x^2 + y^2 = z^2.
   - Loesungsmethode: Parametrische Familie x = m^2 - n^2, y = 2mn, z = m^2 + n^2.

4. **Allgemein quadratisch**: ax^2 + bxy + cy^2 + dx + ey + f = 0.
   - Loesungsmethode: Quadratische Ergaenzung, auf Pell oder einfachere Form reduzieren, oder modulare Einschraenkungen anwenden.

5. **Hoehere Ordnung oder speziell**: Fermat-Typ (x^n + y^n = z^n fuer n > 2), Quadratsummen oder andere.
   - Loesungsmethode: Modulare Obstruktion, Abstieg oder bekannte Unmoeglichkeitsergebnisse.

Klassifikation und gewaehlte Methode festhalten.

**Erwartet:** Eine praezise Klassifikation mit identifizierter Loesungsstrategie.

**Bei Fehler:** Wenn die Gleichung keinem Standardtyp entspricht, Substitution oder Transformation versuchen, um sie auf eine bekannte Form zu reduzieren. Zum Beispiel kann x^2 + y^2 + z^2 = n ueber Legendres Drei-Quadrate-Theorem angegangen werden. Wenn keine Reduktion erkennbar ist, modulare Einschraenkungen (Schritt 4) zur Pruefung auf Obstruktionen anwenden.

### Schritt 2: Lineare diophantische Gleichungen loesen (wenn Typ = linear)

ax + by = c fuer ganzzahlige x, y loesen.

1. **g = ggT(a, b) berechnen** mit dem Euklidischen Algorithmus.

2. **Loesbarkeit testen**: Loesungen existieren genau dann, wenn g | c.
   - Wenn g nicht c teilt, Nichtexistenz beweisen: "Da ggT(a, b) = g und g nicht c teilt, hat die Gleichung ax + by = c keine ganzzahligen Loesungen."
   - Stoppen, wenn keine Loesung existiert.

3. **Vereinfachen**: Durch g teilen um (a/g)x + (b/g)y = c/g zu erhalten, wobei nun ggT(a/g, b/g) = 1.

4. **Partikulaere Loesung finden** mit dem erweiterten Euklidischen Algorithmus:
   - 1 = (a/g)*s + (b/g)*t ueber Rueckwaertssubstitution ausdruecken.
   - Mit c/g multiplizieren: (c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g).
   - Partikulaere Loesung: x0 = s * (c/g), y0 = t * (c/g).

5. **Allgemeine Loesung aufschreiben**:
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - fuer alle ganzen Zahlen k.

6. **Einschraenkungen anwenden** (wenn positive Loesungen erforderlich):
   - x0 + (b/g)*k > 0 und y0 - (a/g)*k > 0 nach k loesen.
   - Den Bereich gueltiger k-Werte angeben oder feststellen, dass keine positive Loesung existiert.

**Beispiel (15x + 21y = 39):**
```
gcd(15, 21) = 3. Does 3 | 39? Yes.
Simplify: 5x + 7y = 13.
Extended Euclidean: 1 = 3*5 - 2*7.
Multiply by 13: 13 = 39*5 - 26*7.
Particular: x0 = 39, y0 = -26.
General: x = 39 + 7k, y = -26 - 5k, k in Z.
Check (k=0): 5*39 + 7*(-26) = 195 - 182 = 13. Correct.
```

**Erwartet:** Die allgemeine Loesungsfamilie (x, y) parametrisiert durch eine ganze Zahl k, mit Verifikation der partikulaeren Loesung.

**Bei Fehler:** Wenn die partikulaere Loesung falsch ist, die erweiterte Euklidische Rueckwaertssubstitution Schritt fuer Schritt nochmals pruefen. Der haeufigste Fehler ist ein Vorzeichenfehler. Verifizieren: a * x0 + b * y0 muss exakt c ergeben (nicht nur modulo etwas).

### Schritt 3: Pell-Gleichungen loesen (wenn Typ = Pell)

x^2 - Dy^2 = 1 loesen, wobei D eine positive nicht-quadratische ganze Zahl ist.

1. **Verifizieren, dass D kein perfektes Quadrat ist**: Falls D = k^2, dann x^2 - k^2*y^2 = (x - ky)(x + ky) = 1, was x - ky = x + ky = +/-1 erzwingt und y = 0, x = +/-1 ergibt (trivial). Die Gleichung ist nur fuer nicht-quadratisches D interessant.

2. **Kettenbruchentwicklung von sqrt(D) berechnen**:
   - Initialisieren: a0 = floor(sqrt(D)), m0 = 0, d0 = 1.
   - Iterieren: m_{i+1} = d_i * a_i - m_i, d_{i+1} = (D - m_{i+1}^2) / d_i, a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1}).
   - Fortfahren bis sich die Folge der a_i wiederholt (die Entwicklung ist nach a0 periodisch).
   - Periodenlaenge r festhalten.

3. **Fundamentalloesung aus den Konvergenten extrahieren**:
   - Die Konvergenten p_i / q_i des Kettenbruchs berechnen.
   - Die Konvergente p_{r-1} / q_{r-1} (am Ende der ersten Periode) liefert die Fundamentalloesung:
     - Wenn r gerade: (x1, y1) = (p_{r-1}, q_{r-1}) loest x^2 - Dy^2 = 1.
     - Wenn r ungerade: (p_{r-1}, q_{r-1}) loest x^2 - Dy^2 = -1 (die negative Pell-Gleichung). Dann loest (p_{2r-1}, q_{2r-1}) die positive Gleichung.

4. **Weitere Loesungen erzeugen** aus der Fundamentalloesung (x1, y1):
   - Die Rekursion: x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}.
   - Aequivalent: x_{n+1} = x1 * x_n + D * y1 * y_n, y_{n+1} = x1 * y_n + y1 * x_n.

5. Die Fundamentalloesung und die Rekursion zur Erzeugung aller Loesungen **praesentieren**.

**Fundamentalloesungen fuer kleine D:**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

**Erwartet:** Die Fundamentalloesung (x1, y1) durch Einsetzen verifiziert, plus die Rekursion zur Erzeugung aller positiven Loesungen.

**Bei Fehler:** Wenn die Kettenbruchberechnung nicht zu einer Periode konvergiert, die Iterationsformel pruefen. Die Periodenlaenge r kann gross sein (z.B. hat D = 61 r = 11 und die Fundamentalloesung (1766319049, 226153980)). Fuer grosse D Rechenwerkzeuge anstatt manueller Berechnung verwenden.

### Schritt 4: Modulare Einschraenkungen fuer Existenz/Nichtexistenz anwenden (wenn Typ = allgemein quadratisch oder hoeher)

Beweisen, dass eine Gleichung keine ganzzahligen Loesungen hat, indem eine modulare Obstruktion gezeigt wird.

1. **Einen Modul m waehlen** (typischerweise m = 2, 3, 4, 5, 7, 8 oder 16).

2. **Alle Reste aufzaehlen**: Die linke Seite modulo m fuer alle moeglichen Reste der Variablen berechnen.

3. **Pruefen, ob irgendeine Kombination die erforderliche rechte Seite modulo m ergibt**.
   - Wenn keine Kombination funktioniert, hat die Gleichung keine Loesung (modulare Obstruktion).

4. **Haeufige Obstruktionen**:
   - **Quadrate mod 4**: n^2 = 0 oder 1 (mod 4). Also hat x^2 + y^2 = c keine Loesung wenn c = 3 (mod 4).
   - **Quadrate mod 8**: n^2 = 0, 1 oder 4 (mod 8). Also hat x^2 + y^2 + z^2 = c keine Loesung wenn c = 7 (mod 8).
   - **Kuben mod 9**: n^3 = 0, 1 oder 8 (mod 9). Also kann x^3 + y^3 + z^3 = c fuer bestimmte c mod 9 obstruiert sein.

5. **Wenn keine Obstruktion gefunden wird**, kann ein modularer Ansatz die Nichtexistenz nicht beweisen. Loesungen koennen existieren oder nicht; konstruktive Methoden oder Abstieg versuchen.

**Referenz quadratischer Reste:**

| Mod | Quadrate (Reste)           |
|-----|---------------------------|
| 3   | {0, 1}                    |
| 4   | {0, 1}                    |
| 5   | {0, 1, 4}                |
| 7   | {0, 1, 2, 4}             |
| 8   | {0, 1, 4}                |
| 11  | {0, 1, 3, 4, 5, 9}       |
| 13  | {0, 1, 3, 4, 9, 10, 12}  |
| 16  | {0, 1, 4, 9}             |

**Erwartet:** Entweder ein Beweis der Nichtexistenz ueber modulare Obstruktion oder eine Feststellung, dass bei den getesteten Modulen keine Obstruktion gefunden wurde.

**Bei Fehler:** Wenn modulare Methoden ergebnislos sind, den unendlichen Abstieg versuchen: eine Loesung annehmen, eine strikt kleinere Loesung ableiten und wiederholen, bis ein Widerspruch zur Positivitaet erreicht wird. Diese Technik ist klassisch fuer den Beweis, dass x^4 + y^4 = z^2 keine nicht-trivialen Loesungen hat.

### Schritt 5: Loesungsfamilien aus der Fundamentalloesung erzeugen

Alle Loesungen in Bezug auf die Fundamentalloesung und ganzzahlige Parameter ausdruecken.

1. **Fuer lineare Gleichungen**: Die Familie ist x = x0 + (b/g)*k, y = y0 - (a/g)*k (aus Schritt 2).

2. **Fuer Pell-Gleichungen**: Die Rekursion aus Schritt 3 verwenden, um die ersten Loesungen zu erzeugen:
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   Mindestens 3-5 Loesungen als Plausibilitaetspruefung auflisten.

3. **Fuer Pythagoreische Tripel**: Primitive Tripel aus Parametern m > n > 0, ggT(m, n) = 1, m - n ungerade erzeugen:
   - a = m^2 - n^2, b = 2mn, c = m^2 + n^2.
   - Alle primitiven Tripel entstehen so (bis auf Vertauschung von a und b).

4. **Fuer allgemeine Familien**: Loesungen wenn moeglich in parametrischer Form ausdruecken. Wenn die Gleichung eine Kurve vom Geschlecht 0 definiert, existiert eine rationale Parametrisierung. Bei Geschlecht >= 1 kann es endlich viele Loesungen geben (Satz von Faltings fuer Geschlecht >= 2).

5. Mindestens 3 Mitglieder der Familie durch Einsetzen in die Originalgleichung **verifizieren**.

**Beispiel (Pell, D = 2):**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

**Erwartet:** Eine parametrische oder rekursive Beschreibung aller Loesungen, mit mindestens 3 verifizierten Loesungen.

**Bei Fehler:** Wenn erzeugte Loesungen die Verifikation nicht bestehen, ist die Fundamentalloesung oder die Rekursionsformel falsch. Fuer Pell-Gleichungen die Fundamentalloesung aus dem Kettenbruch neu ableiten. Fuer lineare Gleichungen die erweiterte Euklidische Berechnung nochmals pruefen.

## Validierung

- [ ] Gleichung ist korrekt nach Typ klassifiziert (linear, Pell, Pythagoreisch, allgemein quadratisch, hoehere Ordnung)
- [ ] Fuer lineare Gleichungen: ggT(a, b) | c wird vor dem Loesen geprueft
- [ ] Erweiterte Euklidische Rueckwaertssubstitution ist verifiziert: a*x0 + b*y0 = c exakt
- [ ] Allgemeine Loesung umfasst alle Loesungen (parametrisiert durch ganze Zahl k oder Rekursion)
- [ ] Fuer Pell: D ist als nicht-quadratisch verifiziert vor Anwendung der Kettenbruchmethode
- [ ] Fuer Pell: Fundamentalloesung erfuellt x1^2 - D*y1^2 = 1 durch direkte Berechnung
- [ ] Beweise modularer Obstruktion zaehlen alle Restkombinationen auf, nicht nur einige
- [ ] Mindestens 3 Mitglieder jeder Loesungsfamilie sind durch Einsetzen verifiziert
- [ ] Einschraenkungen (positive ganze Zahlen, begrenzter Bereich) werden nach Finden der allgemeinen Loesung angewendet
- [ ] Nichtexistenz-Behauptungen sind entweder durch ggT-Bedingung oder modulare Obstruktion gerechtfertigt

## Haeufige Stolperfallen

- **Annahme, dass alle Gleichungen mit ggT | c positive Loesungen haben**: Die allgemeine Loesung x = x0 + (b/g)*k schliesst negative Werte ein. Positive Loesungen existieren moeglicherweise nicht, selbst wenn die Gleichung ueber allen ganzen Zahlen loesbar ist.

- **Verwechslung von x^2 - Dy^2 = 1 mit x^2 - Dy^2 = -1**: Die negative Pell-Gleichung hat nur Loesungen, wenn die Kettenbruch-Periodenlaenge ungerade ist. Die Formel der positiven Gleichung auf ein negatives Gleichungsziel anzuwenden ergibt ein falsches Ergebnis.

- **Triviale Loesung der Pell-Gleichung vergessen**: (x, y) = (1, 0) erfuellt immer x^2 - Dy^2 = 1, ist aber nicht nuetzlich zur Erzeugung nicht-trivialer Loesungen. Die Fundamentalloesung ist die *kleinste* Loesung mit y > 0.

- **Unvollstaendige modulare Obstruktion**: Nur mod 2 oder mod 4 zu pruefen kann Obstruktionen uebersehen, die bei hoeheren Modulen sichtbar sind. Wenn die ersten Modulen keine Obstruktion zeigen, mod 8, 9, 16 oder die Diskriminante der quadratischen Form versuchen.

- **Off-by-one in der Kettenbruchperiode**: Die Konvergentenindizes muessen sorgfaeltig verfolgt werden. Die Fundamentalloesung kommt von p_{r-1}/q_{r-1} wobei r die Periodenlaenge ist, nicht von p_r/q_r.

- **Unendlicher Abstieg ohne Basisfall**: Beim Abstieg zum Beweis der Nichtexistenz muss gezeigt werden, dass der Abstieg bei einem Widerspruch terminiert (z.B. x = 0 widerspricht x > 0). Ohne diesen Basisfall ist das Argument unvollstaendig.

- **Fermats Letzten Satz falsch anwenden**: x^n + y^n = z^n hat keine nicht-trivialen ganzzahligen Loesungen fuer n > 2 (Wiles, 1995), aber dies gilt nicht fuer Gleichungen mit verschiedenen Koeffizienten wie 2x^3 + 3y^3 = z^3.

## Verwandte Skills

- `analyze-prime-numbers` -- Faktorisierung und ggT-Berechnung sind Voraussetzungen fuer diophantisches Loesen
- `solve-modular-arithmetic` -- Lineare Kongruenzen ax = c (mod b) sind aequivalent zu linearen diophantischen Gleichungen
- `derive-theoretical-result` -- Formale Ableitungstechniken zum Beweis diophantischer Unmoeglichkeitsergebnisse
