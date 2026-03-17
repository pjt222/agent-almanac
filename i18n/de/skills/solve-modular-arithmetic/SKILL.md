---
name: solve-modular-arithmetic
description: >
  Modulare Arithmetik-Probleme loesen einschliesslich Kongruenzen, Systeme ueber den
  Chinesischen Restsatz, modulare Inverse und Anwendungen des Satzes von Euler.
  Umfasst sowohl manuelle als auch rechnerische Ansaetze. Verwenden beim Loesen
  linearer Kongruenzen, Berechnen modularer Inverser, Auswerten grosser modularer
  Potenzen, Arbeiten mit simultanen Kongruenzen (CRT) oder Operieren in zyklischen
  Gruppen und Kontexten diskreter Logarithmen.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, modular-arithmetic, congruences, crt, euler
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Modulare Arithmetik loesen

Modulare Arithmetik-Probleme loesen durch Parsen von Kongruenzsystemen, Anwenden des erweiterten euklidischen Algorithmus fuer Inverse, Verwenden des Chinesischen Restsatzes fuer simultane Kongruenzen und Nutzen des Satzes von Euler fuer modulare Potenzierung. Jede Loesung durch Einsetzen verifizieren.

## Wann verwenden

- Loesen einer einzelnen linearen Kongruenz ax = b (mod m)
- Loesen eines Systems simultaner Kongruenzen (Chinesischer Restsatz)
- Berechnen eines modularen Inversen a^{-1} (mod m)
- Auswerten grosser modularer Potenzen a^k (mod m)
- Bestimmen der Ordnung eines Elements in Z/mZ
- Arbeiten mit zyklischen Gruppen, Primitivwurzeln oder diskreten Logarithmus-Kontexten

## Eingaben

- **Erforderlich**: Die zu loesende Kongruenz(en) oder modulare Gleichung
- **Optional**: Ob die Schritte des erweiterten euklidischen Algorithmus explizit gezeigt werden sollen
- **Optional**: Ob der Satz von Euler oder der kleine Fermatsche Satz angewandt werden soll
- **Optional**: Ob Primitivwurzeln oder Elementordnungen gefunden werden sollen
- **Optional**: Ausgabeformat (Schritt-fuer-Schritt, kompakt oder Beweisstil)

## Vorgehensweise

### Schritt 1: Kongruenzsystem oder modulare Gleichung parsen

Die mathematische Struktur aus der Problemstellung extrahieren.

1. **Typ identifizieren**:
   - Einzelne lineare Kongruenz: ax = b (mod m)
   - Kongruenzsystem: x = a1 (mod m1), x = a2 (mod m2), ...
   - Modulare Potenzierung: a^k (mod m)
   - Modulares Inverses: a^{-1} (mod m) finden

2. **Normalisieren**: Alle Koeffizienten modulo ihrer jeweiligen Moduli reduzieren. Sicherstellen dass a, b, m nicht-negative ganze Zahlen mit m > 0 sind.

3. **Erfassen**: Das geparste Problem in Standardnotation aufschreiben.

**Erwartet:** Ein klar geparstes und normalisiertes modulares Problem mit allen reduzierten Werten.

**Bei Fehler:** Wenn die Notation mehrdeutig ist (z.B. "loese 3x + 5 = 2 mod 7" koennte 3x + 5 = 2 (mod 7) oder 3x + (5 = 2 mod 7) bedeuten), mit dem Benutzer klaeren. Standardmaessig mod als auf die gesamte Gleichung angewandt interpretieren.

### Schritt 2: Einzelne Kongruenz loesen (falls zutreffend)

ax = b (mod m) mittels erweitertem euklidischen Algorithmus loesen.

1. **g = ggT(a, m) berechnen** mittels euklidischem Algorithmus:
   - Wiederholte Division anwenden: m = q1*a + r1, a = q2*r1 + r2, ... bis Rest = 0.
   - Der letzte von Null verschiedene Rest ist ggT(a, m).

2. **Loesbarkeit pruefen**: ax = b (mod m) hat genau dann eine Loesung, wenn g | b.
   - Wenn g nicht b teilt, hat die Kongruenz keine Loesung. Stopp.

3. **Reduzieren**: Durch g teilen um (a/g)x = (b/g) (mod m/g) zu erhalten. Nun ist ggT(a/g, m/g) = 1.

4. **Modulares Inverses finden** von a/g modulo m/g mittels erweitertem euklidischen Algorithmus:
   - Durch die Schritte des euklidischen Algorithmus rueckwaerts einsetzen um ggT als Linearkombination auszudruecken: 1 = (a/g)*s + (m/g)*t.
   - Der Koeffizient s (reduziert mod m/g) ist das Inverse.

5. **Partikulaere Loesung berechnen**: x0 = s * (b/g) mod (m/g).

6. **Allgemeine Loesung aufschreiben**: x = x0 + (m/g)*k fuer k = 0, 1, ..., g - 1 ergibt alle g inkongruenten Loesungen modulo m.

**Beispiel des erweiterten euklidischen Algorithmus (Finden von 17^{-1} mod 43):**
```
43 = 2*17 + 9
17 = 1*9  + 8
 9 = 1*8  + 1
 8 = 8*1  + 0

Back-substitute:
1 = 9 - 1*8
  = 9 - 1*(17 - 1*9) = 2*9 - 17
  = 2*(43 - 2*17) - 17 = 2*43 - 5*17

So 17*(-5) = 1 (mod 43), i.e., 17^{-1} = -5 = 38 (mod 43).
```

**Erwartet:** Die vollstaendige Loesungsmenge der Kongruenz oder ein Beweis, dass keine Loesung existiert.

**Bei Fehler:** Wenn die Rueckwaertssubstitution des erweiterten euklidischen Algorithmus ein falsches Ergebnis liefert, jeden Divisionsschritt verifizieren. Der haeufigste Fehler ist ein Vorzeichenfehler bei der Rueckwaertssubstitution. Pruefung: a * Inverses mod m sollte 1 ergeben.

### Schritt 3: System ueber den Chinesischen Restsatz loesen (falls zutreffend)

x = a1 (mod m1), x = a2 (mod m2), ..., x = ak (mod mk) loesen.

1. **Paarweise Teilerfremdheit pruefen**: Fuer jedes Paar (mi, mj) verifizieren dass ggT(mi, mj) = 1.
   - Wenn alle Paare teilerfremd sind, ist der CRT direkt anwendbar.
   - Wenn einige Paare nicht teilerfremd sind, Kompatibilitaet pruefen: fuer jedes nicht-teilerfremde Paar verifizieren dass ai = aj (mod ggT(mi, mj)). Falls kompatibel, mittels kgV reduzieren. Falls inkompatibel, existiert keine Loesung.

2. **M = m1 * m2 * ... * mk berechnen** (das Produkt aller Moduli).

3. **Fuer jedes i, Mi = M / mi berechnen** (das Produkt aller Moduli ausser mi).

4. **Fuer jedes i, yi = Mi^{-1} (mod mi) finden** mittels erweitertem euklidischen Algorithmus aus Schritt 2.

5. **Loesung berechnen**: x = sum(ai * Mi * yi fuer i = 1..k) mod M.

6. **Ergebnis angeben**: x = [Wert] (mod M). Dies ist die eindeutige Loesung modulo M.

**Referenz haeufiger Euler-Funktionswerte:**

| n    | phi(n) | n    | phi(n) | n    | phi(n) |
|------|--------|------|--------|------|--------|
| 2    | 1      | 10   | 4      | 20   | 8      |
| 3    | 2      | 11   | 10     | 24   | 8      |
| 4    | 2      | 12   | 4      | 25   | 20     |
| 5    | 4      | 13   | 12     | 30   | 8      |
| 6    | 2      | 14   | 6      | 36   | 12     |
| 7    | 6      | 15   | 8      | 48   | 16     |
| 8    | 4      | 16   | 8      | 60   | 16     |
| 9    | 6      | 18   | 6      | 100  | 40     |

**Erwartet:** Eine eindeutige Loesung modulo M oder ein Beweis der Inkompatibilitaet.

**Bei Fehler:** Wenn die CRT-Berechnung ein Ergebnis liefert, das die Verifikation nicht besteht, die modularen Inversberechnungen in Schritt 4 pruefen. Ein haeufiger Fehler ist die Berechnung von Mi^{-1} mod M statt Mi^{-1} mod mi. Jedes Inverse wird modulo des *einzelnen* Modulus berechnet, nicht des Produkts.

### Schritt 4: Satz von Euler oder kleinen Fermatschen Satz anwenden (falls zutreffend)

Modulare Potenzen auswerten oder Ausdruecke mittels Satz von Euler vereinfachen.

1. **Satz von Euler**: Wenn ggT(a, m) = 1, dann a^{phi(m)} = 1 (mod m).
   - phi(m) mittels Euler-Formel berechnen: wenn m = p1^e1 * p2^e2 * ... * pk^ek, dann phi(m) = m * Produkt((1 - 1/pi) fuer jede Primzahl pi die m teilt).

2. **Kleiner Fermatscher Satz** (Spezialfall): Wenn p Primzahl und ggT(a, p) = 1, dann a^{p-1} = 1 (mod p).

3. **Exponenten reduzieren**: Um a^k (mod m) zu berechnen:
   - r = k mod phi(m) berechnen.
   - Dann a^k = a^r (mod m).

4. **a^r (mod m) berechnen** mittels wiederholtem Quadrieren (binaere Potenzierung):
   - r in Binaerdarstellung schreiben: r = b_n * 2^n + ... + b_1 * 2 + b_0.
   - Mit result = 1 beginnen.
   - Fuer jedes Bit von hoechstwertig bis niedrigstwertig: result = result^2 mod m; wenn Bit 1 ist, result = result * a mod m.

5. **Fall ggT(a, m) > 1 behandeln**: Der Satz von Euler ist nicht direkt anwendbar. m faktorisieren und CRT verwenden um Ergebnisse aus Primzahlpotenz-Moduli zu kombinieren, mittels Exponentenanhebung oder direkter Berechnung.

**Erwartet:** Der Wert von a^k (mod m), berechnet ueber Exponenrenreduktion und wiederholtes Quadrieren.

**Bei Fehler:** Wenn ggT(a, m) > 1 und das Ergebnis falsch erscheint, den Satz von Euler nicht anwenden. Stattdessen direkt berechnen oder m in teilerfremde Teile faktorisieren, wobei zumindest einige Teile teilerfremd zu a sind, modulo jedes Teils loesen und mit CRT rekombinieren.

### Schritt 5: Loesung durch Einsetzen verifizieren

Jede Loesung durch Einsetzen in die Originalgleichungen pruefen.

1. **Fuer einzelne Kongruenzen**: a * x mod m berechnen und verifizieren dass es gleich b ist.

2. **Fuer CRT-Systeme**: Fuer jede Kongruenz x = ai (mod mi) verifizieren dass x mod mi = ai.

3. **Fuer modulare Potenzen**: Falls moeglich, mit einer zweiten Berechnungsmethode verifizieren (z.B. direkte Berechnung fuer kleine Werte oder unabhaengige Implementierung wiederholten Quadrierens).

4. **Verifikation explizit dokumentieren**:
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

**Erwartet:** Alle Originalgleichungen mit explizit gezeigter Berechnung verifiziert.

**Bei Fehler:** Wenn die Verifikation fehlschlaegt, durch die Vorgehensweise zurueckverfolgen um den Rechenfehler zu finden. Haeufige Quellen: Rechenfehler im erweiterten euklidischen Algorithmus, falsches Vorzeichen bei der Rueckwaertssubstitution oder vergessene Reduktion modulo M im letzten CRT-Schritt.

## Validierung

- [ ] Problemtyp ist korrekt identifiziert (einzelne Kongruenz, System, Potenzierung, Inverses)
- [ ] Alle Koeffizienten sind modulo ihrer jeweiligen Moduli reduziert
- [ ] Fuer ax = b (mod m): ggT(a, m) | b ist vor dem Loesen geprueft
- [ ] Rueckwaertssubstitution des erweiterten euklidischen Algorithmus ist verifiziert: a * Inverses mod m = 1
- [ ] Fuer CRT: paarweise Teilerfremdheit ist vor Anwendung des Satzes verifiziert
- [ ] Fuer CRT mit nicht-teilerfremden Moduli: Kompatibilitaet ist geprueft
- [ ] Satz von Euler wird nur angewandt wenn ggT(a, m) = 1
- [ ] Euler-Funktion phi(m) ist aus der Primfaktorzerlegung berechnet, nicht geraten
- [ ] Wiederholtes Quadrieren verwendet modulare Reduktion bei jedem Schritt (kein Ueberlauf)
- [ ] Jede Loesung ist durch Einsetzen in die Originalgleichungen verifiziert

## Haeufige Stolperfallen

- **CRT ohne Teilerfremdheitspruefung anwenden**: Die Standard-CRT-Formel erfordert paarweise teilerfremde Moduli. Anwendung auf nicht-teilerfremde Moduli gibt eine falsche Antwort, keinen Fehler. Immer zuerst ggT(mi, mj) = 1 pruefen.

- **Das falsche Inverse berechnen**: Mi^{-1} muss modulo mi (dem *einzelnen* Modulus) berechnet werden, nicht modulo M (dem Produkt). Dies ist der einzelne haeufigste CRT-Implementierungsfehler.

- **Satz von Euler anwenden wenn ggT(a, m) > 1**: a^{phi(m)} = 1 (mod m) erfordert ggT(a, m) = 1. Wenn dies fehlschlaegt, ist der Satz nicht anwendbar und das Ergebnis falsch.

- **Vorzeichenfehler bei der Rueckwaertssubstitution des erweiterten euklidischen Algorithmus**: Bei jedem Schritt sorgfaeltig auf Vorzeichen achten. Das endgueltige Inverse kann negativ sein; immer modulo m reduzieren um einen positiven Repraesentanten zu erhalten.

- **Ueberlauf bei modularer Potenzierung**: Selbst bei wiederholtem Quadrieren koennen Zwischenprodukte ueberlaufen. Immer modulo m nach jeder Multiplikation reduzieren, nicht erst am Ende.

- **Mehrfachloesungen vergessen**: ax = b (mod m) mit g = ggT(a, m) > 1 und g | b hat genau g inkongruente Loesungen modulo m, nicht nur eine.

## Verwandte Skills

- `analyze-prime-numbers` -- Primfaktorzerlegung wird zur Berechnung von phi(m) und zur Verifikation der Teilerfremdheit benoetigt
- `explore-diophantine-equations` -- Lineare diophantische Gleichungen ax + by = c sind aequivalent zu linearen Kongruenzen ax = c (mod b)
- `prove-geometric-theorem` -- Modulare Arithmetik erscheint in Konstruierbarkeiitsbeweisen (z.B. welche regelmaessigen n-Ecke konstruierbar sind)
