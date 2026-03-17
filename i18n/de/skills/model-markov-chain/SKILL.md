---
name: model-markov-chain
description: >
  Diskrete oder kontinuierliche Markov-Ketten erstellen und analysieren,
  einschliesslich Uebergangsmatrix-Konstruktion, Zustandsklassifikation,
  Berechnung stationaerer Verteilungen und mittlerer Erstpassagezeiten.
  Verwenden beim Modellieren eines gedaechtnislosen Systems mit beobachteten
  Uebergangszaehlungen oder -raten, beim Berechnen von langfristigen
  stationaeren Wahrscheinlichkeiten, beim Bestimmen erwarteter Treffzeiten
  oder Absorptionswahrscheinlichkeiten, beim Klassifizieren von Zustaenden
  als transient oder rekurrent oder beim Aufbau einer Grundlage fuer Hidden
  Markov Models oder Reinforcement Learning MDPs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: intermediate
  language: multi
  tags: stochastic, markov-chain, transition-matrix, stationary-distribution
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Markov-Kette modellieren

Diskrete oder zeitkontinuierliche Markov-Ketten aus Roh-Uebergangsdaten oder Domaenenspezifikationen konstruieren, klassifizieren und analysieren, mit Berechnung stationaerer Verteilungen, mittlerer Erstpassagezeiten und simulationsbasierter Validierung. Umfasst sowohl DTMC- als auch CTMC-Workflows durchgaengig.

## Wann verwenden

- Sie muessen ein System modellieren, dessen kuenftiger Zustand nur vom aktuellen Zustand abhaengt (Gedaechtnislosigkeits-Eigenschaft)
- Sie haben beobachtete Uebergangszaehlungen oder -raten zwischen einer endlichen Menge von Zustaenden
- Sie moechten langfristige stationaere Wahrscheinlichkeiten fuer einen Prozess berechnen
- Sie muessen erwartete Treffzeiten oder Absorptionswahrscheinlichkeiten bestimmen
- Sie klassifizieren Zustaende als transient, rekurrent oder absorbierend fuer Strukturanalyse
- Sie moechten alternative Markov-Modelle fuer dasselbe System vergleichen
- Sie bauen eine Grundlage fuer fortgeschrittenere Modelle auf (Hidden Markov Models, Reinforcement Learning MDPs)

## Eingaben

### Erforderlich

| Eingabe | Typ | Beschreibung |
|---------|-----|--------------|
| `state_space` | list/vector | Vollstaendige Aufzaehlung aller Zustaende in der Kette |
| `transition_data` | Matrix, Data Frame oder Kantenliste | Roh-Uebergangszaehlungen, eine Wahrscheinlichkeitsmatrix oder eine Ratenmatrix (fuer CTMC) |
| `chain_type` | string | Entweder `"discrete"` (DTMC) oder `"continuous"` (CTMC) |

### Optional

| Eingabe | Typ | Standard | Beschreibung |
|---------|-----|----------|--------------|
| `initial_distribution` | vector | uniform | Startzustandswahrscheinlichkeiten |
| `time_horizon` | integer/float | 100 | Anzahl der Schritte (DTMC) oder Zeiteinheiten (CTMC) fuer Simulation |
| `tolerance` | float | 1e-10 | Konvergenztoleranz fuer iterative Berechnungen |
| `absorbing_states` | list | auto-detect | Explizit als absorbierend markierte Zustaende |
| `labels` | list | state indices | Menschenlesbare Namen fuer jeden Zustand |
| `method` | string | `"eigen"` | Loesermethode: `"eigen"`, `"power"` oder `"linear_system"` |

## Vorgehensweise

### Schritt 1: Zustandsraum und Uebergaenge definieren

1.1. Alle unterscheidbaren Zustaende aufzaehlen. Bestaetigen, dass die Liste vollstaendig und sich gegenseitig ausschliessend ist.

1.2. Bei Arbeit mit Rohbeobachtungen die Uebergangszaehlungen in eine `n x n` Zaehlmatrix `C` tabellieren, wobei `C[i,j]` die Anzahl beobachteter Uebergaenge von Zustand `i` zu Zustand `j` ist.

1.3. Fuer zeitkontinuierliche Ketten die Verweilzeiten in jedem Zustand zusammen mit den Uebergangsdestinationen erfassen.

1.4. Verifizieren, dass kein Zustand in der Aufzaehlung fehlt, indem geprueft wird, dass jeder beobachtete Ursprung und jede Destination im Zustandsraum vorkommt.

1.5. Datenquelle, Beobachtungszeitraum und etwaige angewandte Filterung dokumentieren. Dieser Herkunftsnachweis ist wesentlich fuer die Reproduzierbarkeit der Analyse und die Erklaerung von Anomalien.

**Erwartet:** Ein wohldefinierter Zustandsraum der Groesse `n` und entweder eine Zaehlmatrix oder eine Liste von (Ursprung, Destination, Rate/Zaehlung)-Tupeln, die alle beobachteten Uebergaenge abdecken. Der Zustandsraum sollte klein genug fuer Matrixoperationen sein (typischerweise `n < 10000` fuer dichte Methoden).

**Bei Fehler:** Wenn Zustaende fehlen, die Quelldaten erneut untersuchen und die Aufzaehlung erweitern. Wenn der Zustandsraum zu gross fuer Matrixmethoden ist, das Zusammenfassen seltener Zustaende in einen aggregierten „Sonstige"-Zustand erwaegen oder auf simulationsbasierte Analyse umsteigen. Wenn die Zaehlmatrix extrem duenn besetzt ist, pruefen ob der Beobachtungszeitraum lang genug ist, um typische Uebergaenge zu erfassen.

### Schritt 2: Uebergangsmatrix oder Generator konstruieren

2.1. **Diskrete Zeit (DTMC):** Jede Zeile der Zaehlmatrix normalisieren, um die Uebergangswahrscheinlichkeitsmatrix `P` zu erhalten:
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - Verifizieren, dass jede Zeile sich zu 1 summiert (innerhalb der Toleranz).

2.2. **Kontinuierliche Zeit (CTMC):** Die Raten-(Generator-)Matrix `Q` konstruieren:
   - Nebendiagonale: `Q[i,j] = Rate des Uebergangs von i nach j`
   - Diagonale: `Q[i,i] = -sum(Q[i,j] fuer j != i)`
   - Verifizieren, dass jede Zeile sich zu 0 summiert (innerhalb der Toleranz).

2.3. Nullzaehlungszeilen (Zustaende, die nie als Urspruenge beobachtet wurden) behandeln, indem eine Glaettungsstrategie gewaehlt wird: Laplace-Glaettung, Absorptionskonvention oder Kennzeichnung zur Ueberpruefung.

2.4. Die Matrix in einem fuer nachgelagerte Berechnungen geeigneten Format speichern (dicht fuer kleine Ketten, duenn besetzt fuer grosse).

**Erwartet:** Eine gueltige stochastische Matrix `P` (Zeilen summieren sich zu 1) oder Generatormatrix `Q` (Zeilen summieren sich zu 0) ohne negative Nebendiagonaleintraege in `P` und ohne positive Diagonaleintraege in `Q`.

**Bei Fehler:** Wenn Zeilensummen ueber die Toleranz hinaus abweichen, auf Datenkorruption oder Gleitkommaprobleme pruefen. Renormalisieren oder Quelldaten erneut untersuchen.

### Schritt 3: Zustaende klassifizieren

3.1. Die Kommunikationsklassen berechnen, indem die stark zusammenhaengenden Komponenten des gerichteten Graphen gefunden werden, der durch die Uebergangsmatrix induziert wird (nur Kanten mit positiver Wahrscheinlichkeit).

3.2. Fuer jede Kommunikationsklasse bestimmen:
   - **Rekurrent**, wenn die Klasse keine ausgehenden Kanten zu anderen Klassen hat.
   - **Transient**, wenn sie ausgehende Kanten hat.
   - **Absorbierend**, wenn die Klasse aus einem einzigen Zustand mit `P[i,i] = 1` besteht.

3.3. Die Periodizitaet fuer jede rekurrente Klasse pruefen, indem der GGT aller Zykluslaengen berechnet wird, die von jedem Zustand in der Klasse erreichbar sind.
   - Periode = 1 bedeutet aperiodisch.

3.4. Bestimmen, ob die Kette **irreduzibel** (einzelne Kommunikationsklasse) oder **reduzibel** (mehrere Klassen) ist.

3.5. Zusammenfassen: jede Klasse auflisten mit Typ (transient/rekurrent), Periode und ob absorbierende Zustaende existieren.

**Erwartet:** Eine vollstaendige Klassifikation: jeder Zustand einer Kommunikationsklasse zugeordnet mit Bezeichnungen (transient, positiv rekurrent, null-rekurrent, absorbierend) und Periodizitaet.

**Bei Fehler:** Wenn die Graphanalyse inkonsistent ist, die Uebergangsmatrix auf negative Eintraege und korrekte Zeilensummen pruefen. Fuer sehr grosse Ketten iterative Graphalgorithmen statt voller Matrixpotenzen verwenden.

### Schritt 4: Stationaere Verteilung berechnen

4.1. **Irreduzible aperiodische Kette:** `pi * P = pi` unter der Nebenbedingung `sum(pi) = 1` loesen.
   - Umformulieren als `pi * (P - I) = 0` mit der Normierungsbedingung.
   - Eigenwertzerlegung verwenden: `pi` ist der linke Eigenvektor von `P` zum Eigenwert 1, normiert auf Summe 1.

4.2. **Irreduzible periodische Kette:** Die stationaere Verteilung existiert weiterhin, aber die Kette konvergiert nicht im ueblichen Sinne von beliebigen Startzustaenden. Berechnung wie in 4.1.

4.3. **Reduzible Kette:** Die stationaere Verteilung fuer jede rekurrente Klasse unabhaengig berechnen. Die Gesamtverteilung ist eine Konvexkombination, abhaengig von Absorptionswahrscheinlichkeiten aus transienten Zustaenden.

4.4. **CTMC:** `pi * Q = 0` mit `sum(pi) = 1` loesen.

4.5. Verifizieren: das berechnete `pi` mit `P` (oder `Q`) multiplizieren und bestaetigen, dass das Ergebnis `pi` innerhalb der Toleranz entspricht.

4.6. Fuer reduzible Ketten die Absorptionswahrscheinlichkeiten von jedem transienten Zustand zu jeder rekurrenten Klasse berechnen. Diese Wahrscheinlichkeiten, kombiniert mit den klassenweisen stationaeren Verteilungen, ergeben das langfristige Verhalten bedingt auf den Startzustand.

4.7. Die Spektralluecke erfassen (Differenz zwischen dem groessten und zweitgroessten Eigenwertbetrag). Diese Groesse bestimmt die Konvergenzrate zur Stationaritaet und ist nuetzlich fuer die Bestimmung der benoetigten Simulationsschritte in Schritt 6.

**Erwartet:** Ein Wahrscheinlichkeitsvektor `pi` der Laenge `n` mit allen nicht-negativen Eintraegen, Summe 1, der die Gleichgewichtsgleichungen innerhalb der Toleranz erfuellt. Die Spektralluecke sollte fuer aperiodische irreduzible Ketten positiv sein.

**Bei Fehler:** Wenn der Eigenwertloeser nicht konvergiert, die iterative Potenzmethode versuchen (`pi_k+1 = pi_k * P` bis Konvergenz). Wenn mehrere Eigenwerte gleich 1 sind, ist die Kette reduzibel — gemaess Schritt 4.3 behandeln. Wenn die Spektralluecke extrem klein ist, mischt die Kette langsam und erfordert sehr lange Simulationen zur Validierung.

### Schritt 5: Mittlere Erstpassagezeiten berechnen

5.1. Die mittlere Erstpassagezeit `m[i,j]` als die erwartete Anzahl von Schritten definieren, um Zustand `j` ausgehend von Zustand `i` zu erreichen.

5.2. Fuer eine irreduzible Kette das System linearer Gleichungen loesen:
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] fuer k != j)` fuer alle `i != j`
   - `m[j,j] = 1 / pi[j]` (mittlere Rekurrenzzeit)

5.3. Fuer absorbierende Ketten Absorptionswahrscheinlichkeiten und erwartete Zeiten bis zur Absorption berechnen:
   - `P` in transiente (`Q_t`) und absorbierende Bloecke partitionieren.
   - Fundamentalmatrix: `N = (I - Q_t)^{-1}`
   - Erwartete Schritte bis zur Absorption: `N * 1` (Spaltenvektor aus Einsen)
   - Absorptionswahrscheinlichkeiten: `N * R` wobei `R` der Transient-zu-Absorbierend-Block ist.

5.4. Fuer CTMC Schrittzaehlungen durch erwartete Verweilzeiten unter Verwendung der Generatormatrix ersetzen.

5.5. Ergebnisse als Matrix oder Tabelle paarweiser Erstpassagezeiten fuer wichtige Zustandspaare darstellen.

**Erwartet:** Eine Matrix mittlerer Erstpassagezeiten, bei der Diagonaleintraege den mittleren Rekurrenzzeiten entsprechen (`1/pi[j]`) und Nebendiagonaleintraege fuer kommunizierende Zustandspaare endlich sind.

**Bei Fehler:** Wenn das lineare System singulaer ist, hat die Kette transiente Zustaende, die das Ziel nicht erreichen koennen. Unerreichbare Paare als unendlich melden. Die Kettenstruktur aus Schritt 3 verifizieren.

### Schritt 6: Mit Simulation validieren

6.1. `K` unabhaengige Stichprobenpfade der Kette fuer `T` Schritte simulieren, startend von der Anfangsverteilung.

6.2. Die stationaere Verteilung empirisch schaetzen, indem Zustandsbelegungshaeufigkeiten ueber alle Pfade gezaehlt werden, nach Verwerfen einer Einbrennphase.

6.3. Simulierte Haeufigkeiten mit der analytischen stationaeren Verteilung vergleichen. Die Totalvariationsdistanz oder Chi-Quadrat-Statistik berechnen.

6.4. Mittlere Erstpassagezeiten empirisch schaetzen, indem die erste Treffzeit fuer jeden Zielzustand ueber Replikationen erfasst wird.

6.5. Uebereinstimmungsmetriken berichten:
   - Maximale absolute Abweichung zwischen analytischen und simulierten stationaeren Wahrscheinlichkeiten.
   - 95%-Konfidenzintervalle fuer simulierte Erstpassagezeiten vs. analytische Werte.

6.6. Wenn Abweichungen die Toleranz ueberschreiten, die Uebergangsmatrix-Konstruktion und Klassifikationsschritte erneut untersuchen.

**Erwartet:** Simulierte stationaere Verteilung innerhalb von 0,01 Totalvariationsdistanz zur analytischen Loesung (bei ausreichend langen Laeufen). Simulierte mittlere Erstpassagezeiten innerhalb von 10% der analytischen Werte.

**Bei Fehler:** Simulationslaenge `T` oder Anzahl der Replikationen `K` erhoehen. Wenn Abweichungen bestehen bleiben, kann die analytische Loesung numerische Fehler haben — mit hoeherer Praezision neu berechnen.

## Validierung

- Die Uebergangsmatrix `P` hat alle nicht-negativen Eintraege und jede Zeile summiert sich zu 1 (oder `Q`-Zeilen summieren sich zu 0 fuer CTMC)
- Die stationaere Verteilung `pi` ist ein gueltiger Wahrscheinlichkeitsvektor, der `pi * P = pi` erfuellt
- Mittlere Rekurrenzzeiten entsprechen `1/pi[j]` fuer jeden rekurrenten Zustand `j`
- Simulierte Zustandshaeufigkeiten konvergieren zur analytischen stationaeren Verteilung
- Zustandsklassifikation ist konsistent: kein rekurrenter Zustand hat Kanten, die seine Kommunikationsklasse verlassen
- Alle Eigenwerte von `P` haben Betrag hoechstens 1, mit genau einem Eigenwert gleich 1 pro rekurrenter Klasse
- Fuer absorbierende Ketten: Absorptionswahrscheinlichkeiten von jedem transienten Zustand summieren sich zu 1 ueber alle absorbierenden Klassen
- Die Fundamentalmatrix `N = (I - Q_t)^{-1}` hat alle positiven Eintraege (erwartete Besuchszaehlungen sind positiv)
- Detailliertes Gleichgewicht gilt genau dann, wenn die Kette reversibel ist: `pi[i] * P[i,j] = pi[j] * P[j,i]` fuer alle `i,j`

## Haeufige Stolperfallen

- **Nicht-vollstaendiger Zustandsraum**: Fehlende Zustaende erzeugen eine sub-stochastische Matrix (Zeilen summieren sich zu weniger als 1). Immer Zeilensummen vor der Analyse verifizieren
- **DTMC und CTMC verwechseln**: Eine Ratenmatrix muss nicht-positive Diagonale und Zeilen mit Summe 0 haben. Die Anwendung von DTMC-Formeln auf eine Ratenmatrix erzeugt Unsinn
- **Periodizitaet ignorieren**: Eine periodische Kette hat eine gueltige stationaere Verteilung, konvergiert aber nicht im ueblichen Sinne dorthin. Die Mischzeitanalyse muss die Periode beruecksichtigen
- **Numerische Instabilitaet bei grossen Ketten**: Eigenwertzerlegung grosser dichter Matrizen ist teuer und kann Praezision verlieren. Duenn besetzte Loeser oder iterative Methoden fuer Ketten mit mehr als einigen hundert Zustaenden verwenden
- **Null-Wahrscheinlichkeits-Uebergaenge**: Strukturelle Nullen in der Uebergangsmatrix koennen die Kette reduzibel machen. Irreduzibilitaet vor der Berechnung einer einzelnen stationaeren Verteilung verifizieren
- **Unzureichende Simulationslaenge**: Kurze Simulationen mit schlechter Mischung erzeugen verzerrte Schaetzungen. Immer effektive Stichprobengroesse berechnen und Traceplots pruefen
- **Reversibilitaet ohne Pruefung annehmen**: Viele analytische Abkuerzungen (z.B. detailliertes Gleichgewicht) gelten nur fuer reversible Ketten. `pi[i] * P[i,j] = pi[j] * P[j,i]` vor der Verwendung reversibilitaetsabhaengiger Ergebnisse verifizieren
- **Gleitkomma-Akkumulation bei der Potenzmethode**: Vielfaches Iterieren von `pi * P` akkumuliert Rundungsfehler. `pi` waehrend der Potenziteration periodisch auf Summe 1 renormalisieren

## Verwandte Skills

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) -- Erweitert Markov-Ketten zu Latent-Zustand-Modellen mit beobachteten Emissionen
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) -- Allgemeines Simulationsrahmenwerk, anwendbar auf Markov-Ketten-Stichprobenpfade und Monte-Carlo-Validierung
