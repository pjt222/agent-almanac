---
name: fit-hidden-markov-model
description: >
  Hidden-Markov-Modelle mit dem Baum-Welch-(EM-)Algorithmus mit Modellauswahl,
  Viterbi-Dekodierung fuer Zustandssequenzen und Forward-Backward-
  Wahrscheinlichkeiten anpassen. Verwenden wenn Beobachtungen von nicht
  beobachtbaren latenten Zustaenden erzeugt werden, eine Zeitreihe in latente
  Regime segmentiert werden muss (Marktregime, Sprach-Phoneme, biologische
  Sequenzen), Sequenzwahrscheinlichkeiten berechnet, der wahrscheinlichste
  verborgene Zustandspfad dekodiert oder Modelle mit verschiedenen Anzahlen
  verborgener Zustaende verglichen werden sollen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: advanced
  language: multi
  tags: stochastic, hmm, baum-welch, viterbi, em-algorithm
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Hidden-Markov-Modell anpassen

Ein Hidden-Markov-Modell (HMM) an sequenzielle Beobachtungsdaten mit dem Baum-Welch-Expectation-Maximization-Algorithmus anpassen, die wahrscheinlichste verborgene Zustandssequenz ueber Viterbi dekodieren und die optimale Anzahl verborgener Zustaende durch Informationskriterien auswaehlen.

## Wann verwenden

- Sie beobachten eine Sequenz von Emissionen, aber die zugrunde liegenden erzeugenden Zustaende sind nicht direkt beobachtbar
- Sie vermuten, dass Ihre Daten von einem System erzeugt werden, das zwischen einer endlichen Anzahl von Regimen wechselt
- Sie muessen eine Zeitreihe in latente Phasen segmentieren (z.B. Marktregime, Sprach-Phoneme, biologische Sequenzannotation)
- Sie moechten die Wahrscheinlichkeit einer beobachteten Sequenz unter einem generativen Modell berechnen
- Sie benoetigen die wahrscheinlichste Sequenz verborgener Zustaende bei gegebenen Beobachtungen (Dekodierung)
- Sie vergleichen Modelle mit verschiedenen Anzahlen verborgener Zustaende fuer den besten Komplexitaets-Anpassungs-Kompromiss

## Eingaben

### Erforderlich

| Eingabe | Typ | Beschreibung |
|---------|-----|-------------|
| `observations` | Sequenz/Matrix | Beobachtete Datensequenz (univariat oder multivariat) |
| `n_hidden_states` | Integer | Anzahl anzupassender verborgener Zustaende (oder ein Bereich fuer Modellauswahl) |
| `emission_type` | String | Verteilungsfamilie fuer Emissionen: `"gaussian"`, `"discrete"`, `"poisson"`, `"multinomial"` |

### Optional

| Eingabe | Typ | Standard | Beschreibung |
|---------|-----|---------|-------------|
| `initial_params` | Dict | zufaellig/heuristisch | Initiale Uebergangsmatrix, Emissionsparameter und Startwahrscheinlichkeiten |
| `n_restarts` | Integer | 10 | Anzahl zufaelliger Neustarts zur Abschwung lokaler Optima |
| `max_iterations` | Integer | 500 | Maximale EM-Iterationen pro Neustart |
| `convergence_tol` | Float | 1e-6 | Log-Likelihood-Konvergenzschwelle fuer EM |
| `state_range` | Liste von Ints | `[n_hidden_states]` | Bereich von Zustandsanzahlen fuer Modellauswahl |
| `covariance_type` | String | `"full"` | Fuer Gauss-Emissionen: `"full"`, `"diagonal"`, `"spherical"` |
| `regularization` | Float | 1e-6 | Kleine Konstante zur Diagonalen der Kovarianzmatrizen addiert um Singularitaet zu verhindern |

## Vorgehensweise

### Schritt 1: Verborgene Zustaende und Beobachtungsmodell definieren

1.1. Die Anzahl verborgener Zustaende `K` angeben (oder einen Kandidatenbereich fuer Modellauswahl in Schritt 5).

1.2. Die Emissionsverteilungsfamilie basierend auf dem Datentyp waehlen:
   - Stetige Daten: Gauss (univariat oder multivariat)
   - Zaehldaten: Poisson oder negativ-binomial
   - Kategoriale Daten: diskret/multinomial

1.3. Die Modellkomponenten definieren:
   - **Uebergangsmatrix** `A` der Groesse `K x K`: `A[i,j] = P(z_t = j | z_{t-1} = i)`
   - **Emissionsparameter** `theta_k` fuer jeden Zustand `k`: verteilungsspezifisch (z.B. Mittelwert und Kovarianz fuer Gauss)
   - **Anfangszustandsverteilung** `pi`: `pi[k] = P(z_1 = k)`

1.4. Verifizieren, dass Beobachtungsdaten korrekt formatiert sind: keine fehlenden Werte in der Sequenz, konsistente Dimensionalitaet und ausreichende Laenge relativ zur Parameteranzahl.

**Erwartet:** Eine klar spezifizierte HMM-Architektur mit `K` Zustaenden, einer gewaehlten Emissionsfamilie und sauberen Beobachtungsdaten der Laenge `T >> K^2`.

**Bei Fehler:** Wenn Daten fehlende Werte enthalten, imputieren oder betroffene Segmente entfernen. Wenn `T` relativ zu `K` zu klein ist, `K` reduzieren oder mehr Daten beschaffen.

### Schritt 2: Parameter initialisieren

2.1. Initiale Parameter fuer jeden der `n_restarts` Neustarts erzeugen:
   - **Uebergangsmatrix**: Zufaellige stochastische Matrix (jede Zeile aus einer Dirichlet-Verteilung gezogen) oder leicht gestoerte Gleichverteilungsmatrix.
   - **Emissionsparameter**: K-Means-Clustering auf den Beobachtungen zur Initialisierung der Mittelwerte verwenden; Clustervarianzen fuer Gauss-Emissionen berechnen.
   - **Anfangsverteilung**: Gleichverteilt oder proportional zu den Clustergroessen aus K-Means.

2.2. Fuer den ersten Neustart die K-Means-informierte Initialisierung verwenden (im Allgemeinen der staerkste Start). Fuer nachfolgende Neustarts zufaellige Stoerungen verwenden.

2.3. Verifizieren, dass alle initialen Parameter gueltig sind:
   - Uebergangsmatrixzeilen summieren sich zu 1 mit allen Eintraegen positiv.
   - Emissionsparameter befinden sich in der gueltigen Domaene (z.B. Kovarianzmatrizen sind positiv definit).
   - Anfangsverteilung summiert sich zu 1.

**Erwartet:** `n_restarts` Saetze gueltiger Initialparameter, mit mindestens einer datengetriebenen Initialisierung.

**Bei Fehler:** Wenn K-Means nicht konvergiert, rein zufaellige Initialisierung mit mehr Neustarts verwenden. Wenn Kovarianzmatrizen singulaer sind, die Regularisierungskonstante zur Diagonalen addieren.

### Schritt 3: Baum-Welch-EM fuer Parameterschaetzung ausfuehren

3.1. **E-Schritt (Forward-Backward-Algorithmus):**
   - Forward-Wahrscheinlichkeiten `alpha[t,k]` = P(o_1,...,o_t, z_t=k | Modell) mit der Rekursion berechnen:
     - `alpha[1,k] = pi[k] * b_k(o_1)`
     - `alpha[t,k] = sum_j(alpha[t-1,j] * A[j,k]) * b_k(o_t)`
   - Backward-Wahrscheinlichkeiten `beta[t,k]` = P(o_{t+1},...,o_T | z_t=k, Modell) berechnen:
     - `beta[T,k] = 1`
     - `beta[t,k] = sum_j(A[k,j] * b_j(o_{t+1}) * beta[t+1,j])`
   - Zustands-Posterior `gamma[t,k]` = P(z_t=k | O, Modell) berechnen:
     - `gamma[t,k] = alpha[t,k] * beta[t,k] / P(O | Modell)`
   - Uebergangs-Posterior `xi[t,i,j]` = P(z_t=i, z_{t+1}=j | O, Modell) berechnen.

3.2. **M-Schritt (Parameterneuschätzung):**
   - Uebergangsmatrix aktualisieren: `A[i,j] = sum_t(xi[t,i,j]) / sum_t(gamma[t,i])`
   - Emissionsparameter mit gewichteten hinreichenden Statistiken aktualisieren:
     - Gauss-Mittelwert: `mu_k = sum_t(gamma[t,k] * o_t) / sum_t(gamma[t,k])`
     - Gauss-Kovarianz: gewichtete Streumatrix plus Regularisierung
     - Diskret: `b_k(v) = sum_t(gamma[t,k] * I(o_t=v)) / sum_t(gamma[t,k])`
   - Anfangsverteilung aktualisieren: `pi[k] = gamma[1,k]`

3.3. Log-Likelihood berechnen: `log P(O | Modell) = log sum_k(alpha[T,k])`. Den Log-Sum-Exp-Trick verwenden, um Unterlauf zu verhindern.

3.4. **Skalierung:** Skalierte Forward-Backward-Variablen verwenden, um numerischen Unterlauf fuer lange Sequenzen zu verhindern. `alpha` bei jedem Zeitschritt normalisieren und logarithmische Skalierungsfaktoren akkumulieren.

3.5. E-Schritt und M-Schritt wiederholen, bis die Log-Likelihood-Aenderung unter `convergence_tol` liegt oder `max_iterations` erreicht ist.

3.6. Ueber alle Neustarts den Parametersatz mit der hoechsten finalen Log-Likelihood behalten.

**Erwartet:** Monoton nicht-abnehmende Log-Likelihood ueber Iterationen, konvergierend innerhalb von `max_iterations`. Finale Parameter sind gueltig (stochastische Matrizen, positiv-definite Kovarianzen).

**Bei Fehler:** Wenn die Log-Likelihood abnimmt, liegt ein Fehler im E-Schritt oder M-Schritt vor -- Formeln verifizieren. Wenn die Konvergenz sehr langsam ist, bessere Initialisierung versuchen oder `max_iterations` erhoehen. Wenn die Kovarianz singulaer wird, Regularisierung erhoehen.

### Schritt 4: Viterbi-Dekodierung fuer wahrscheinlichste Zustandssequenz anwenden

4.1. Viterbi-Variablen initialisieren:
   - `delta[1,k] = log(pi[k]) + log(b_k(o_1))`
   - `psi[1,k] = 0` (kein Vorgaenger)

4.2. Vorwaerts rekursieren fuer `t = 2,...,T`:
   - `delta[t,k] = max_j(delta[t-1,j] + log(A[j,k])) + log(b_k(o_t))`
   - `psi[t,k] = argmax_j(delta[t-1,j] + log(A[j,k]))`

4.3. Terminieren:
   - `z*_T = argmax_k(delta[T,k])`
   - Bester Pfad-Log-Wahrscheinlichkeit: `max_k(delta[T,k])`

4.4. Rueckwaerts verfolgen fuer `t = T-1,...,1`:
   - `z*_t = psi[t+1, z*_{t+1}]`

4.5. Die dekodierte Zustandssequenz `z* = (z*_1, ..., z*_T)` und ihre Log-Wahrscheinlichkeit ausgeben.

4.6. Die Viterbi-Pfadwahrscheinlichkeit mit der Gesamtsequenzwahrscheinlichkeit vom Forward-Algorithmus vergleichen, um zu beurteilen, wie dominant der beste Pfad ist.

**Erwartet:** Eine einzelne wahrscheinlichste Zustandssequenz der Laenge `T` mit jedem Eintrag in `{1,...,K}`. Die Viterbi-Log-Wahrscheinlichkeit sollte kleiner oder gleich der Gesamt-Log-Likelihood sein.

**Bei Fehler:** Wenn der Viterbi-Pfad eine Log-Wahrscheinlichkeit von negativ Unendlich hat, ist eine Uebergangs- oder Emissionswahrscheinlichkeit Null, wo sie es nicht sein sollte. Mindest-Werte hinzufuegen, um log(0) zu verhindern.

### Schritt 5: Modellauswahl durchfuehren (BIC/AIC ueber Modellordnungen)

5.1. Fuer jede Kandidatenanzahl verborgener Zustaende `K` in `state_range` das vollstaendige HMM anpassen (Schritte 2-4).

5.2. Die Anzahl freier Parameter `p` berechnen:
   - Uebergangsmatrix: `K * (K - 1)` (jede Zeile ist ein Simplex)
   - Emissionsparameter: abhaengig von der Familie (z.B. Gauss mit voller Kovarianz in `d` Dimensionen: `K * (d + d*(d+1)/2)`)
   - Anfangsverteilung: `K - 1`

5.3. Informationskriterien berechnen:
   - `BIC = -2 * log_likelihood + p * log(T)`
   - `AIC = -2 * log_likelihood + 2 * p`
   - `AICc = AIC + 2*p*(p+1) / (T - p - 1)` (Kleinstichproben-Korrektur)

5.4. Das Modell mit dem niedrigsten BIC (bevorzugt fuer Konsistenz) oder AIC (bevorzugt fuer Vorhersage) auswaehlen. Beide berichten.

5.5. Ergebnisse tabellarisch darstellen: fuer jedes `K` Log-Likelihood, Parameteranzahl, BIC, AIC und Konvergenzstatus zeigen.

5.6. Wenn das optimale `K` am Rand des `state_range` liegt, den Bereich erweitern und neu anpassen.

**Erwartet:** Ein klares Minimum in BIC/AIC, das die optimale Anzahl verborgener Zustaende identifiziert. Das ausgewaehlte Modell sollte konvergiert sein und interpretierbare Zustandsbedeutungen haben.

**Bei Fehler:** Wenn kein klares Minimum existiert (monoton abnehmender BIC), kann das Modell fehlspezifiziert sein -- eine andere Emissionsfamilie in Betracht ziehen. Wenn alle Modelle schlechte Log-Likelihood haben, folgen die Daten moeglicherweise keiner HMM-Struktur.

### Schritt 6: Mit zurueckgehaltenen Daten und Posterior-Dekodierung validieren

6.1. Daten in Trainings- und Validierungsmengen aufteilen (z.B. 80/20 oder mehrere Sequenzen verwenden falls verfuegbar).

6.2. Das Modell auf Trainingsdaten anpassen. Log-Likelihood auf zurueckgehaltenen Daten mit dem Forward-Algorithmus berechnen (Parameter nicht neu anpassen).

6.3. **Posterior-Dekodierung** (Alternative zu Viterbi):
   - Fuer jeden Zeitschritt den Zustand mit der hoechsten Posterior-Wahrscheinlichkeit zuweisen: `z^_t = argmax_k(gamma[t,k])`
   - Dies maximiert die erwartete Anzahl korrekt dekodierter Zustaende (vs. Viterbi, das die gemeinsame Pfadwahrscheinlichkeit maximiert).

6.4. Viterbi- und Posterior-Dekodierung vergleichen:
   - Uebereinstimmungsrate zwischen den beiden dekodierten Sequenzen berechnen.
   - Bereiche der Nichtueberein-stimmung deuten auf mehrdeutige Zustandszuweisungen hin.

6.5. Zustandsinterpretierbarkeit bewerten:
   - Emissionsparameter fuer jeden Zustand untersuchen (Mittelwerte, Varianzen, diskrete Verteilungen).
   - Verifizieren, dass Zustaende sinnvollen Regimen im Domaenenkontext entsprechen.
   - Pruefen, dass Zustandsverweilzeiten (impliziert durch die Diagonale von `A`) angemessen sind.

6.6. Zurueckgehaltene Log-Likelihood pro Beobachtung berechnen und ueber Modellordnungen vergleichen, um die Trainingsmengen-Modellauswahl zu bestaetigen.

**Erwartet:** Zurueckgehaltene Log-Likelihood ist angemessen nahe an der Trainings-Log-Likelihood (keine schwere Ueberanpassung). Viterbi- und Posterior-Dekodierung stimmen in 90%+ der Zeitschritte ueberein. Zustaende haben unterschiedliche, interpretierbare Emissionsverteilungen.

**Bei Fehler:** Wenn die zurueckgehaltene Likelihood viel schlechter als die Trainings-Likelihood ist, ueberpasst das Modell -- `K` reduzieren oder Regularisierung erhoehen. Wenn Zustaende nicht interpretierbar sind, andere Initialisierungen oder eine andere Emissionsfamilie versuchen.

## Validierung

- Log-Likelihood ist monoton nicht-abnehmend ueber Baum-Welch-Iterationen fuer jeden Neustart
- Die Uebergangsmatrix ist zeilenstochastisch (Zeilen summieren sich zu 1, alle Eintraege nichtnegativ)
- Emissionsparameter befinden sich in der gueltigen Domaene (positiv-definite Kovarianzen, gueltige Wahrscheinlichkeitsverteilungen)
- Die Viterbi-Pfad-Log-Wahrscheinlichkeit uebersteigt nicht die Gesamtsequenz-Log-Wahrscheinlichkeit
- BIC/AIC-Kurven zeigen ein klares Minimum bei der gewaehlten Modellordnung
- Zurueckgehaltene Log-Likelihood bestaetigt, dass das Modell ueber die Trainingsmenge hinaus generalisiert
- Forward- und Backward-Wahrscheinlichkeitsberechnungen stimmen ueberein: `P(O) = sum_k(alpha[T,k]) = sum_k(pi[k] * b_k(o_1) * beta[1,k])`

## Haeufige Stolperfallen

- **Lokale Optima im EM**: Der Baum-Welch-Algorithmus konvergiert zu einem lokalen Maximum, nicht notwendigerweise zum globalen. Immer mehrere zufaellige Neustarts verwenden und den besten waehlen.
- **Numerischer Unterlauf**: Forward-Backward-Wahrscheinlichkeiten schrumpfen exponentiell mit der Sequenzlaenge. Log-Raum-Berechnung oder skalierte Variablen verwenden, um Unterlauf auf Null zu verhindern.
- **Ueberanpassung mit zu vielen Zustaenden**: Jeder zusaetzliche verborgene Zustand fuegt `O(K + d^2)` Parameter hinzu. BIC (nicht nur Likelihood) fuer Modellauswahl verwenden und auf zurueckgehaltenen Daten validieren.
- **Label-Switching**: Verborgene Zustaende sind nur bis auf Permutation identifizierbar. Beim Vergleich von Modellen ueber Neustarts Zustaende nach Emissionsparametern abgleichen, nicht nach Index.
- **Degenerierte Zustaende**: Ein Zustand kann kollabieren, um eine einzelne Beobachtung zu erklaeren (Gauss mit nahezu Null-Varianz). Regularisierung auf Kovarianzmatrizen verhindert dies.
- **Verwechslung von Viterbi und Posterior-Dekodierung**: Viterbi liefert den einzelnen besten gemeinsamen Pfad; Posterior-Dekodierung liefert den besten marginalen Zustand bei jedem Zeitschritt. Sie beantworten verschiedene Fragen und koennen erheblich voneinander abweichen.
- **Zustandsverweilzeiten ignorieren**: Die geometrische Verweilzeitverteilung, die in Standard-HMMs implizit ist, kann eine schlechte Anpassung fuer Daten mit langen Regime-Dauern sein. Hidden-Semi-Markov-Modelle in Betracht ziehen, wenn Verweilzeiten nicht-geometrisch sind.

## Verwandte Skills

- [Markov-Kette modellieren](../model-markov-chain/SKILL.md) -- Voraussetzung zum Verstaendnis der Uebergangsstruktur, die der verborgenen Schicht zugrunde liegt
- [Stochastischen Prozess simulieren](../simulate-stochastic-process/SKILL.md) -- Kann verwendet werden, um synthetische HMM-Daten zum Testen zu erzeugen und aus einem angepassten Modell fuer Posterior-Praediktivpruefungen zu simulieren
