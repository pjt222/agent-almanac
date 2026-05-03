---
name: simulate-stochastic-process
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Simulate stochastic processes (Markov chains, random walks, SDEs, MCMC) with
  convergence diagnostics, variance reduction, and visualization. Use when
  generating sample paths for estimation, prediction, or visualization;
  when analytical solutions are intractable; running Monte Carlo estimation
  needing convergence guarantees; validating analytical results against
  empirical simulation; or sampling from complex posteriors via MCMC.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: advanced
  language: multi
  tags: stochastic, simulation, mcmc, convergence, monte-carlo
---

# 仿隨機之程

仿隨機程之樣徑——含離散馬可夫鏈、續時程、隨機微分方程、MCMC 之取樣——並收斂之察、減方之術、徑之繪。

## 用時

- 須生樣徑以估、預、繪乃用
- 解析不可解，仿為唯可行之途乃用
- 行蒙特卡羅之估而須收斂之保與不確之量乃用
- 欲驗解析之果（穩態分布、擊中時）於實仿乃用
- 須以 MCMC 取樣於繁後驗乃用
- 全析前先試隨機之模乃用

## 入

### 必要

| Input | Type | Description |
|-------|------|-------------|
| `process_type` | string | 程之類：`"dtmc"`、`"ctmc"`、`"random_walk"`、`"brownian_motion"`、`"sde"`、`"mcmc"` |
| `parameters` | dict | 程特之參（轉移矩、漂／散係、目密度等） |
| `n_paths` | integer | 獨樣徑之數 |
| `n_steps` | integer | 各徑之步數（或 MCMC 全迭數） |

### 可選

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_state` | scalar/vector | process-specific | 各徑之始態或始分布 |
| `dt` | float | 0.01 | 續時離散之時步 |
| `seed` | integer | random | 隨種以可復 |
| `burn_in` | integer | `n_steps / 10` | 棄之初步數（MCMC） |
| `thinning` | integer | 1 | 每 k 取一以減自相關 |
| `variance_reduction` | string | `"none"` | 法：`"none"`、`"antithetic"`、`"stratified"`、`"control_variate"` |
| `target_function` | callable | none | 沿徑求蒙特卡羅估之函 |

## 法

### 第一步：定程之模與參

1.1. 識程之類而集所須之參：
   - **DTMC**：轉移矩 `P` 與態空。驗 `P` 為行隨機。
   - **CTMC**：率矩 `Q`。驗行和為 0，非對角為非負。
   - **隨機行**：步分布（如等概之 `{-1, +1}`）、邊界（若有）。
   - **布朗動**：漂 `mu`、波 `sigma`、維 `d`。
   - **SDE（伊藤）**：漂函 `a(x,t)`、散函 `b(x,t)`。
   - **MCMC**：目對數密度、提機制（隨機行 Metropolis、Hamiltonian、Gibbs 諸件）。

1.2. 驗參之諧：
   - 矩維合態空之大。
   - SDE 係滿足長與 Lipschitz 條件（至少非式）為所擇之解。
   - MCMC 提於目分布之支可定。

1.3. 設隨種以可復。

得：完設之隨機模，已驗之參與可復之隨態。

敗則：若參不諧（如非隨機矩），先正之而後續。若 SDE 係病，考他離散之法。

### 第二步：擇仿之法

2.1. 依程類擇宜之算：

| Process | Method | Key Property |
|---------|--------|-------------|
| DTMC | Direct sampling from transition row | Exact |
| CTMC | Gillespie algorithm (SSA) | Exact, event-driven |
| CTMC (approx.) | Tau-leaping | Approximate, faster for high rates |
| Random walk | Direct sampling of increments | Exact |
| Brownian motion | Cumulative sum of Gaussian increments | Exact for fixed `dt` |
| SDE (general) | Euler-Maruyama | Order 0.5 strong, order 1.0 weak |
| SDE (higher order) | Milstein | Order 1.0 strong (scalar noise) |
| SDE (stiff) | Implicit Euler-Maruyama | Stable for stiff drift |
| MCMC (general) | Metropolis-Hastings | Asymptotically exact |
| MCMC (gradient) | Hamiltonian Monte Carlo (HMC) | Better mixing for high dimensions |
| MCMC (conditional) | Gibbs sampler | Exact conditionals when available |

2.2. 為 SDE 法，擇 `dt` 足小以求數值穩。常法：自 `dt = 0.01` 始，半之至果穩。

2.3. 為 MCMC，調提之尺以求受率約：
   - 高維隨機行 Metropolis 為 23.4%
   - 一維目為 57.4%
   - HMC 為 65-90%（依軌長）

2.4. 若請減方，設之：
   - **對偶**：每徑有隨增 `Z`，亦仿 `-Z`。
   - **層別**：分概空為層而於各層取樣。
   - **控變**：識相關之量有已知期以減方。

得：擇與程類合之仿算與宜之調參。

敗則：若所擇之法不穩（如 Euler-Maruyama 散），轉隱法或減 `dt`。

### 第三步：實而行仿

3.1. 為 `n_paths` 軌分配儲，各長 `n_steps`（或為事件驅之法如 Gillespie 動態）。

3.2. 各徑 `i = 1, ..., n_paths`：

   **DTMC / 隨機行：**
   - 設 `x[0] = initial_state`
   - 為 `t = 1, ..., n_steps`：自 `x[t-1]` 之轉移分布取 `x[t]`

   **CTMC（Gillespie）：**
   - 設 `x[0] = initial_state`、`time = 0`
   - 當 `time < T_max`：
     - 算總率 `lambda = -Q[x, x]`
     - 取持時 `tau ~ Exp(lambda)`
     - 自轉移概 `Q[x, j] / lambda` 為 `j != x` 取下態
     - 更 `time += tau`，記轉移

   **SDE（Euler-Maruyama）：**
   - 設 `x[0] = initial_state`
   - 為 `t = 1, ..., n_steps`：
     - `dW = sqrt(dt) * N(0, I)`（Wiener 增）
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC（Metropolis-Hastings）：**
   - 設 `x[0] = initial_state`
   - 為 `t = 1, ..., n_steps`：
     - 提 `x' ~ q(x' | x[t-1])`
     - 算受率 `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))`
     - 以概 `alpha` 受：受則 `x[t] = x'`，否 `x[t] = x[t-1]`
     - 記受之決

3.3. 若供 `target_function`，於各徑各態求之而存其值。

3.4. 行稀化：每 `thinning` 取一。

3.5. 棄各徑首之 `burn_in` 樣（主為 MCMC）。

得：`n_paths` 完軌存於憶，含可選之函求值。MCMC 受率於目範圍。

敗則：若仿生 NaN 或 Inf，為 SDE 減 `dt` 或察參之效。若 MCMC 受率近 0% 或 100%，調提尺。

### 第四步：施收斂之察

4.1. **跡圖**：繪部分徑各分量之值於時。觀其穩（無趨、方穩）。

4.2. **Gelman-Rubin 之察（R-hat）**：MCMC 多鏈：
   - 算鏈內方 `W` 與鏈間方 `B`。
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - `R_hat < 1.01`（嚴）或 `R_hat < 1.1`（寬）示收斂。

4.3. **有效樣本數（ESS）**：
   - 估增延遲之自相關。
   - `ESS = n_samples / (1 + 2 * sum(autocorrelations))`
   - 規則：`ESS > 400` 為可信之後驗總。

4.4. **Geweke 之察**：比各鏈首 10% 與末 50% 之均。z 分宜於 [-2, 2] 內為收斂。

4.5. **非 MCMC 程**：驗時均之計（均、方）隨徑長而穩。繪行均。

4.6. 報總表：

| Diagnostic | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Acceptance rate | ... | 0.15-0.50 | ... |

得：諸收斂之察皆過閾。跡圖示穩、混好之鏈。

敗則：若 R-hat > 1.1，行更長之鏈或改提。若 ESS 甚低，增稀化或轉更佳之取樣（如 HMC）。若 Geweke 敗，延 burn-in。

### 第五步：算總計與信區

5.1. 各關之量（態占、函期、擊中時）：
   - 算點估為樣均跨諸徑（burn-in 與稀化後）。
   - 以 ESS 算標誤：`SE = SD / sqrt(ESS)`。

5.2. 構信區：
   - 正態近：`estimate +/- z_{alpha/2} * SE`
   - 為偏分布，用百分位 bootstrap 或批均。

5.3. 若施減方，算減方之比：
   - `VRF = Var(naive estimator) / Var(reduced estimator)`
   - 報有效之速倍。

5.4. 蒙特卡羅積分之估：
   - 報估、標誤、95% CI、ESS、函求值之數。

5.5. 分布之估：
   - 算實分位（中、2.5、97.5 百分位）。
   - 為續量之核密度估。

5.6. 列諸總計與其不確。

得：點估有相應之標誤與信區。減方（若施）生 VRF > 1。

敗則：若信區太寬，增 `n_paths` 或 `n_steps`。若減方反劣（VRF < 1），閉之——控變或對偶之術或不宜此問題。

### 第六步：繪軌與分布

6.1. **軌圖**：繪具表之少數樣徑（5-20）於時。重疊用透明。

6.2. **總計**：迭均軌與點之 95% 信帶於諸徑。

6.3. **邊際分布**：選時點，繪態分布之直方或密度估。

6.4. **穩態分布之比**：若有解析穩態，迭之於末時切之實直方上。

6.5. **自相關圖**：MCMC 各分量繪自相關函（ACF）至理之延遲。

6.6. **察之盤**：合跡、ACF、行均、邊密為一多板圖以全察。

6.7. 存諸圖為向量（PDF/SVG）與點陣（PNG）以為文。

得：可發版之圖示軌行、分布收斂、察總。解析（若有）合實果。

敗則：若繪示非穩或多模而模未期，回第一二步察參或法之誤。若圖雜，減顯之徑或增圖大。

## 驗

- 諸仿軌皆於有效態空（無越界、無 NaN/Inf）
- DTMC/CTMC：實穩態分布收斂於解析者（於預期蒙卡誤之內）
- SDE：半 `dt` 不變果之質（收斂階之察）
- MCMC：R-hat < 1.01、ESS > 400、Geweke z 於 [-2, 2]
- 信區寬以 `1/sqrt(n_paths)` 比減（中央極限）
- 減方術生 VRF > 1（估改非劣）
- 可復：同種重行生同果

## 陷

- **MCMC burn-in 不足**：自劣始態須長 burn-in 方代目分布。常觀跡圖而用收斂察，勿猜其長。
- **Euler-Maruyama 為剛 SDE 不穩**：若漂項梯度大，顯式 Euler-Maruyama 散。轉隱法或用適步。
- **強弱收斂之惑於 SDE**：強收斂量徑誤（要於個軌）；弱收斂量分布誤（足於期）。Euler-Maruyama 弱階一，強階半。
- **偽隨數之質**：甚長仿中，劣 RNG 生相關樣。用驗之器（Mersenne Twister、PCG、Xoshiro）而驗其獨立。
- **忽 MCMC 之自相關**：以自相 MCMC 樣為獨低估不確。用有效樣本數，非生樣本之數，為標誤。
- **對偶為非單調函**：對偶取樣唯估為底均勻之單調函時減方。為非單調，反增方。
- **大仿之憶**：存多長徑之諸時步耗憶。若全軌不為繪所須，用線上計（行均、行方）。

## 參

- [Model Markov Chain](../model-markov-chain/SKILL.md) — 供轉移矩與解析果以仿之驗
- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — 自擬 HMM 之仿使後驗預測察與合資生
