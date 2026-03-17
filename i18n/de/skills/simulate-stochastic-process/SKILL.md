---
name: simulate-stochastic-process
description: >
  Stochastische Prozesse (Markov-Ketten, Random Walks, SDEs, MCMC) mit
  Konvergenzdiagnostik, Varianzreduktion und Visualisierung simulieren. Verwenden
  beim Erzeugen von Stichprobenpfaden fuer Schaetzung, Vorhersage oder Visualisierung;
  wenn analytische Loesungen nicht handhabbar sind; bei Monte-Carlo-Schaetzung mit
  Konvergenzgarantien; bei Validierung analytischer Ergebnisse gegen empirische
  Simulation; oder beim Ziehen von Stichproben aus komplexen Posteriors via MCMC.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: advanced
  language: multi
  tags: stochastic, simulation, mcmc, convergence, monte-carlo
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Stochastischen Prozess simulieren

Stichprobenpfade aus stochastischen Prozessen simulieren -- einschliesslich diskreter Markov-Ketten, zeitkontinuierlicher Prozesse, stochastischer Differentialgleichungen und MCMC-Sampler -- mit Konvergenzdiagnostik, Varianzreduktionstechniken und Trajektorienvisualisierung.

## Wann verwenden

- Erzeugung von Stichprobenpfaden aus einem stochastischen Prozess fuer Schaetzung, Vorhersage oder Visualisierung erforderlich
- Analytische Loesungen sind nicht handhabbar und Simulation ist der einzige praktikable Ansatz
- Monte-Carlo-Schaetzung mit Konvergenzgarantien und Unsicherheitsquantifizierung wird durchgefuehrt
- Validierung analytischer Ergebnisse (stationaere Verteilungen, Treffzeiten) gegen empirische Simulation gewuenscht
- Stichprobenziehung aus einer komplexen Posterior-Verteilung mittels MCMC erforderlich
- Prototyping eines stochastischen Modells vor Uebergang zur vollstaendigen analytischen Behandlung

## Eingaben

### Erforderlich

| Eingabe | Typ | Beschreibung |
|---------|-----|--------------|
| `process_type` | string | Art des Prozesses: `"dtmc"`, `"ctmc"`, `"random_walk"`, `"brownian_motion"`, `"sde"`, `"mcmc"` |
| `parameters` | dict | Prozessspezifische Parameter (Uebergangsmatrix, Drift-/Diffusionskoeffizienten, Zieldichte, etc.) |
| `n_paths` | integer | Anzahl unabhaengiger zu simulierender Stichprobenpfade |
| `n_steps` | integer | Anzahl der Zeitschritte pro Pfad (oder Gesamt-MCMC-Iterationen) |

### Optional

| Eingabe | Typ | Standard | Beschreibung |
|---------|-----|----------|--------------|
| `initial_state` | scalar/vector | prozessspezifisch | Startzustand oder -verteilung fuer jeden Pfad |
| `dt` | float | 0.01 | Zeitschrittgroesse fuer zeitkontinuierliche Diskretisierung |
| `seed` | integer | zufaellig | Zufallsseed fuer Reproduzierbarkeit |
| `burn_in` | integer | `n_steps / 10` | Anzahl anfaenglich zu verwerfender Schritte (MCMC) |
| `thinning` | integer | 1 | Jeden k-ten Sample behalten zur Autokorrelationsreduktion |
| `variance_reduction` | string | `"none"` | Methode: `"none"`, `"antithetic"`, `"stratified"`, `"control_variate"` |
| `target_function` | callable | keine | Funktion zur Auswertung entlang der Pfade fuer Monte-Carlo-Schaetzung |

## Vorgehensweise

### Schritt 1: Prozessmodell und Parameter definieren

1.1. Prozesstyp identifizieren und alle erforderlichen Parameter zusammenstellen:
   - **DTMC**: Uebergangsmatrix `P` und Zustandsraum. Validieren dass `P` zeilenstochastisch ist.
   - **CTMC**: Ratenmatrix `Q`. Validieren dass Zeilen sich zu 0 summieren und Nebendiagonaleintraege nicht-negativ sind.
   - **Random Walk**: Schrittverteilung (z.B. `{-1, +1}` mit gleicher Wahrscheinlichkeit), gegebenenfalls Grenzen.
   - **Brownsche Bewegung**: Drift `mu`, Volatilitaet `sigma`, Dimension `d`.
   - **SDE (Ito)**: Driftfunktion `a(x,t)`, Diffusionsfunktion `b(x,t)`.
   - **MCMC**: Ziel-Log-Dichte, Vorschlagsmechanismus (Random-Walk-Metropolis, Hamilton, Gibbs-Komponenten).

1.2. Parameterkonsistenz validieren:
   - Matrixdimensionen stimmen mit Zustandsraumgroesse ueberein.
   - SDE-Koeffizienten erfuellen Wachstums- und Lipschitz-Bedingungen (zumindest informell) fuer den gewaehlten Loeser.
   - MCMC-Vorschlag ist wohldefiniert fuer den Traeger der Zielverteilung.

1.3. Zufallsseed fuer Reproduzierbarkeit setzen.

**Erwartet:** Ein vollstaendig spezifiziertes stochastisches Modell mit validierten Parametern und einem reproduzierbaren Zufallszustand.

**Bei Fehler:** Wenn Parameter inkonsistent sind (z.B. nicht-stochastische Matrix), vor dem Fortfahren korrigieren. Wenn SDE-Koeffizienten pathologisch sind, ein anderes Diskretisierungsschema in Betracht ziehen.

### Schritt 2: Simulationsmethode auswaehlen

2.1. Den geeigneten Algorithmus basierend auf dem Prozesstyp waehlen:

| Prozess | Methode | Schluesseleigenschaft |
|---------|---------|----------------------|
| DTMC | Direkte Stichprobenziehung aus Uebergangszeile | Exakt |
| CTMC | Gillespie-Algorithmus (SSA) | Exakt, ereignisgesteuert |
| CTMC (approx.) | Tau-Leaping | Approximativ, schneller bei hohen Raten |
| Random Walk | Direkte Stichprobenziehung der Inkremente | Exakt |
| Brownsche Bew. | Kumulative Summe Gauss'scher Inkremente | Exakt fuer festes `dt` |
| SDE (allgemein) | Euler-Maruyama | Ordnung 0.5 stark, Ordnung 1.0 schwach |
| SDE (hoehere Ord.) | Milstein | Ordnung 1.0 stark (skalares Rauschen) |
| SDE (steif) | Implizites Euler-Maruyama | Stabil fuer steife Drift |
| MCMC (allgemein) | Metropolis-Hastings | Asymptotisch exakt |
| MCMC (Gradient) | Hamiltonsches Monte Carlo (HMC) | Besseres Mixing in hohen Dimensionen |
| MCMC (bedingt) | Gibbs-Sampler | Exakte Bedingungsverteilungen wenn verfuegbar |

2.2. Fuer SDE-Methoden `dt` klein genug fuer numerische Stabilitaet waehlen. Nuetzliche Heuristik: mit `dt = 0.01` beginnen und halbieren bis Ergebnisse stabil sind.

2.3. Fuer MCMC die Vorschlagsskala anpassen um eine Akzeptanzrate von ungefaehr zu erreichen:
   - 23.4% fuer hochdimensionalen Random-Walk-Metropolis
   - 57.4% fuer eindimensionale Ziele
   - 65-90% fuer HMC (abhaengig von Trajektorienlaenge)

2.4. Wenn Varianzreduktion angefordert, diese konfigurieren:
   - **Antithetische Variablen**: Fuer jeden Pfad mit Zufallsinkrementen `Z` auch mit `-Z` simulieren.
   - **Stratifizierte Stichprobe**: Den Wahrscheinlichkeitsraum partitionieren und innerhalb jeder Schicht ziehen.
   - **Kontrollvariablen**: Eine korrelierte Groesse mit bekanntem Erwartungswert zur Varianzreduktion identifizieren.

**Erwartet:** Ein ausgewaehlter Simulationsalgorithmus passend zum Prozesstyp mit geeigneten Abstimmungsparametern.

**Bei Fehler:** Wenn die gewaehlte Methode instabil ist (z.B. Euler-Maruyama divergiert), zu einer impliziten Methode wechseln oder `dt` reduzieren.

### Schritt 3: Simulation implementieren und ausfuehren

3.1. Speicher fuer `n_paths` Trajektorien zuweisen, jeweils der Laenge `n_steps` (oder dynamisch fuer ereignisgesteuerte Methoden wie Gillespie).

3.2. Fuer jeden Pfad `i = 1, ..., n_paths`:

   **DTMC / Random Walk:**
   - `x[0] = initial_state` setzen
   - Fuer `t = 1, ..., n_steps`: `x[t]` aus der Uebergangsverteilung gegeben `x[t-1]` ziehen

   **CTMC (Gillespie):**
   - `x[0] = initial_state` setzen, `time = 0`
   - Solange `time < T_max`:
     - Gesamtrate `lambda = -Q[x, x]` berechnen
     - Haltezeit `tau ~ Exp(lambda)` ziehen
     - Naechsten Zustand aus Uebergangswahrscheinlichkeiten `Q[x, j] / lambda` fuer `j != x` ziehen
     - `time += tau` aktualisieren, Uebergang aufzeichnen

   **SDE (Euler-Maruyama):**
   - `x[0] = initial_state` setzen
   - Fuer `t = 1, ..., n_steps`:
     - `dW = sqrt(dt) * N(0, I)` (Wiener-Inkrement)
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC (Metropolis-Hastings):**
   - `x[0] = initial_state` setzen
   - Fuer `t = 1, ..., n_steps`:
     - `x' ~ q(x' | x[t-1])` vorschlagen
     - Akzeptanzverhaeltnis `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))` berechnen
     - Mit Wahrscheinlichkeit `alpha` akzeptieren: `x[t] = x'` falls akzeptiert, sonst `x[t] = x[t-1]`
     - Akzeptanzentscheidung aufzeichnen

3.3. Wenn `target_function` angegeben, diese an jedem Zustand entlang jedes Pfades auswerten und Werte speichern.

3.4. Thinning anwenden: jeden `thinning`-ten Sample behalten.

3.5. `burn_in` Samples vom Beginn jedes Pfades verwerfen (hauptsaechlich fuer MCMC).

**Erwartet:** `n_paths` vollstaendige Trajektorien im Speicher, mit optionalen Funktionsauswertungen. MCMC-Akzeptanzrate liegt im Zielbereich.

**Bei Fehler:** Wenn die Simulation NaN- oder Inf-Werte erzeugt, `dt` fuer SDE-Methoden reduzieren oder Parametergueltigkeit pruefen. Wenn die MCMC-Akzeptanzrate nahe 0% oder 100% liegt, Vorschlagsskala anpassen.

### Schritt 4: Konvergenzdiagnostik anwenden

4.1. **Trace-Plots**: Den Wert jeder Komponente ueber die Zeit fuer eine Teilmenge der Pfade darstellen. Visuelle Inspektion auf Stationaritaet (keine Trends, stabile Varianz).

4.2. **Gelman-Rubin-Diagnostik (R-hat)**: Fuer MCMC mit mehreren Ketten:
   - Innerhalb-Ketten-Varianz `W` und Zwischen-Ketten-Varianz `B` berechnen.
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - Konvergenz angezeigt durch `R_hat < 1.01` (streng) oder `R_hat < 1.1` (nachsichtig).

4.3. **Effektive Stichprobengroesse (ESS)**:
   - Autokorrelation bei steigenden Lags schaetzen.
   - `ESS = n_samples / (1 + 2 * sum(autocorrelations))`
   - Faustregel: `ESS > 400` fuer zuverlaessige Posterior-Zusammenfassungen.

4.4. **Geweke-Diagnostik**: Mittelwert der ersten 10% und der letzten 50% jeder Kette vergleichen. Der z-Score sollte innerhalb [-2, 2] fuer Konvergenz liegen.

4.5. **Fuer Nicht-MCMC-Prozesse**: Sicherstellen dass zeitgemittelte Statistiken (Mittelwert, Varianz) mit zunehmender Pfadlaenge stabilisieren. Laufende Durchschnitte darstellen.

4.6. Eine Zusammenfassungstabelle erstellen:

| Diagnostik | Wert | Schwellenwert | Status |
|-----------|------|---------------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Akzeptanzrate | ... | 0.15-0.50 | ... |

**Erwartet:** Alle Konvergenzdiagnostiken bestehen ihre Schwellenwerte. Trace-Plots zeigen stabile, gut mischende Ketten.

**Bei Fehler:** Wenn R-hat > 1.1, laengere Ketten laufen lassen oder den Vorschlag verbessern. Wenn ESS sehr niedrig ist, Thinning erhoehen oder zu einem besseren Sampler wechseln (z.B. HMC). Wenn Geweke fehlschlaegt, Burn-in verlaengern.

### Schritt 5: Zusammenfassungsstatistiken mit Konfidenzintervallen berechnen

5.1. Fuer jede Groesse von Interesse (Zustandsbelegung, Funktionserwartungswert, Treffzeiten):
   - Punktschaetzung als Stichprobenmittel ueber Pfade berechnen (nach Burn-in und Thinning).
   - Standardfehler mittels effektiver Stichprobengroesse berechnen: `SE = SD / sqrt(ESS)`.

5.2. Konfidenzintervalle konstruieren:
   - Normalapproximation: `Schaetzung +/- z_{alpha/2} * SE`
   - Fuer schiefe Verteilungen Percentil-Bootstrap oder Batch-Mittel verwenden.

5.3. Wenn Varianzreduktion angewandt wurde, den Varianzreduktionsfaktor berechnen:
   - `VRF = Var(naiver Schaetzer) / Var(reduzierter Schaetzer)`
   - Die effektive Beschleunigung berichten.

5.4. Fuer Monte-Carlo-Integrationsschaetzungen:
   - Schaetzung, Standardfehler, 95%-KI, ESS und Anzahl der Funktionsauswertungen berichten.

5.5. Fuer Verteilungsschaetzungen:
   - Empirische Quantile berechnen (Median, 2.5te, 97.5te Perzentile).
   - Kerndichteschaetzungen fuer stetige Groessen.

5.6. Alle Zusammenfassungsstatistiken mit ihren Unsicherheiten tabellieren.

**Erwartet:** Punktschaetzungen mit zugehoerigen Standardfehlern und Konfidenzintervallen. Varianzreduktion (falls angewandt) ergibt VRF > 1.

**Bei Fehler:** Wenn Konfidenzintervalle zu breit sind, `n_paths` oder `n_steps` erhoehen. Wenn Varianzreduktion Schaetzungen verschlechtert (VRF < 1), deaktivieren -- die Kontrollvariable oder das antithetische Schema passt moeglicherweise nicht zum Problem.

### Schritt 6: Trajektorien und Verteilungen visualisieren

6.1. **Trajektorienplots**: Eine repraesentative Teilmenge von Stichprobenpfaden (5-20 Pfade) ueber die Zeit darstellen. Transparenz fuer ueberlappende Pfade verwenden.

6.2. **Ensemble-Statistiken**: Die mittlere Trajektorie und punktweise 95%-Konfidenzbaender ueber alle Pfade ueberlagern.

6.3. **Randverteilungen**: An ausgewaehlten Zeitpunkten Histogramme oder Dichteschaetzungen der Zustandsverteilung ueber Pfade darstellen.

6.4. **Vergleich mit stationaerer Verteilung**: Wenn eine analytische stationaere Verteilung verfuegbar ist, diese dem empirischen Histogramm der letzten Zeitscheibe ueberlagern.

6.5. **Autokorrelationsplots**: Fuer MCMC die Autokorrelationsfunktion (ACF) fuer jede Komponente bis zu einem vernuenftigen Lag darstellen.

6.6. **Diagnostik-Dashboard**: Trace-Plots, ACF-Plots, laufende Mittelwert-Plots und Randdichten zu einer einzigen Mehrfach-Paneel-Abbildung fuer umfassende Bewertung kombinieren.

6.7. Alle Abbildungen sowohl in Vektor- (PDF/SVG) als auch in Rasterformaten (PNG) fuer die Dokumentation speichern.

**Erwartet:** Publikationsreife Abbildungen die Trajektorienverhalten, Verteilungskonvergenz und diagnostische Zusammenfassungen zeigen. Analytische Loesungen (wo verfuegbar) stimmen mit empirischen Ergebnissen ueberein.

**Bei Fehler:** Wenn Visualisierungen Nichtstationaritaet oder nicht erwartete Multimodalitaet aus dem Modell zeigen, Schritte 1-2 auf Parameter- oder Methodenfehler ueberpruefen. Wenn Plots ueberladen sind, Anzahl dargestellter Pfade reduzieren oder Abbildungsgroesse erhoehen.

## Validierung

- Alle simulierten Trajektorien bleiben im gueltigen Zustandsraum (keine Out-of-Bounds-Werte, kein NaN/Inf)
- Fuer DTMC/CTMC: empirische stationaere Verteilung konvergiert zur analytischen (innerhalb erwarteten Monte-Carlo-Fehlers)
- Fuer SDE: Halbierung von `dt` aendert Ergebnisse nicht qualitativ (Konvergenzordnungspruefung)
- Fuer MCMC: R-hat < 1.01, ESS > 400, Geweke-z-Scores innerhalb [-2, 2]
- Konfidenzintervallbreiten nehmen proportional zu `1/sqrt(n_paths)` ab (Zentraler Grenzwertsatz)
- Varianzreduktionstechniken ergeben VRF > 1 (Schaetzungen verbessern sich, verschlechtern sich nicht)
- Reproduzierbarkeit: erneutes Ausfuehren mit demselben Seed erzeugt identische Ergebnisse

## Haeufige Stolperfallen

- **Unzureichendes Burn-in fuer MCMC**: Start von einem schlechten Anfangszustand erfordert ein langes Burn-in bevor Samples die Zielverteilung repraesentieren. Immer Trace-Plots inspizieren und Konvergenzdiagnostik verwenden statt die Burn-in-Laenge zu raten.
- **Euler-Maruyama-Instabilitaet fuer steife SDEs**: Wenn der Driftterm grosse Gradienten hat, kann explizites Euler-Maruyama divergieren. Zu impliziten Methoden wechseln oder adaptive Schrittgroesse verwenden.
- **Verwechslung starker und schwacher Konvergenz fuer SDEs**: Starke Konvergenz misst pfadweisen Fehler (wichtig fuer einzelne Trajektorien); schwache Konvergenz misst Verteilungsfehler (ausreichend fuer Erwartungswerte). Euler-Maruyama hat schwache Ordnung 1.0 aber starke Ordnung 0.5.
- **Qualitaet des Pseudozufallszahlengenerators**: Fuer sehr lange Simulationen koennen minderwertige RNGs korrelierte Samples erzeugen. Einen gut getesteten Generator verwenden (Mersenne Twister, PCG oder Xoshiro) und Unabhaengigkeit verifizieren.
- **Autokorrelation in MCMC ignorieren**: Autokorrelierte MCMC-Samples als unabhaengig behandeln unterschaetzt Unsicherheit. Immer effektive Stichprobengroesse verwenden, nicht rohe Sampleanzahl, fuer Standardfehler.
- **Antithetische Variablen fuer nicht-monotone Funktionen**: Antithetische Stichprobenziehung reduziert Varianz nur wenn der Schaetzgegenstand eine monotone Funktion der zugrundeliegenden Uniformen ist. Fuer nicht-monotone Funktionen kann sie Varianz erhoehen.
- **Speicher fuer grosse Simulationen**: Speicherung aller Zeitschritte vieler langer Pfade kann den Speicher erschoepfen. Online-Statistiken verwenden (laufender Mittelwert, Varianz) wenn vollstaendige Trajektorien nicht fuer die Visualisierung benoetigt werden.

## Verwandte Skills

- [Markov-Kette modellieren](../model-markov-chain/SKILL.md) -- stellt die Uebergangsmatrizen und analytischen Loesungen bereit, die die Simulation validiert
- [Hidden-Markov-Modell anpassen](../fit-hidden-markov-model/SKILL.md) -- Simulation aus angepassten HMMs ermoeglicht posteriore praediktive Pruefung und synthetische Datenerzeugung
