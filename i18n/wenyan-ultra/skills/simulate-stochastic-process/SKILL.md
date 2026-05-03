---
name: simulate-stochastic-process
locale: wenyan-ultra
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

# 擬機程

擬機程之樣路——含 DTMC、CTMC、SDE、MCMC——含收歛診、減差、軌示。

## 用

- 需自機程生樣路為估、測、示→用
- 析解難得、唯擬可行→用
- 行 Monte Carlo 估而需收歛保與不確量→用
- 欲驗析果（穩分、抵時）於實擬→用
- 自繁後分以 MCMC 取樣→用
- 機模試於全析前→用

## 入

### 必

| Input | Type | Description |
|-------|------|-------------|
| `process_type` | string | Type of process: `"dtmc"`, `"ctmc"`, `"random_walk"`, `"brownian_motion"`, `"sde"`, `"mcmc"` |
| `parameters` | dict | Process-specific parameters (transition matrix, drift/diffusion coefficients, target density, etc.) |
| `n_paths` | integer | Number of independent sample paths to simulate |
| `n_steps` | integer | Number of time steps per path (or total MCMC iterations) |

### 可

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_state` | scalar/vector | process-specific | Starting state or distribution for each path |
| `dt` | float | 0.01 | Time step size for continuous-time discretization |
| `seed` | integer | random | Random seed for reproducibility |
| `burn_in` | integer | `n_steps / 10` | Number of initial steps to discard (MCMC) |
| `thinning` | integer | 1 | Keep every k-th sample to reduce autocorrelation |
| `variance_reduction` | string | `"none"` | Method: `"none"`, `"antithetic"`, `"stratified"`, `"control_variate"` |
| `target_function` | callable | none | Function to evaluate along paths for Monte Carlo estimation |

## 行

### 一：定模與參

1.1 識程類、集諸需參：
   - **DTMC**：轉陣 `P` 與態空。驗 `P` 為行隨
   - **CTMC**：率陣 `Q`。驗行和為 0、非對角非負
   - **隨步**：步分（如 `{-1, +1}` 等概）、界若有
   - **Brown**：漂 `mu`、波 `sigma`、維 `d`
   - **SDE（Ito）**：漂 `a(x,t)`、擴 `b(x,t)`
   - **MCMC**：標對數密、提機（隨步 Metropolis、Hamilton、Gibbs 分量）

1.2 驗參恆：
   - 陣維配態空大
   - SDE 係滿增與 Lipschitz（至少非形）為所擇解
   - MCMC 提於標分支撐良定

1.3 設機種以重現

得：全述機模、參驗、機態可重現。

敗：參不恆（如非隨陣）→正之。SDE 係病態→慮異離散法。

### 二：擇擬法

2.1 依程類擇宜算：

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

2.2 SDE 法擇 `dt` 足小以數穩。試啟：始 `dt = 0.01`、半之至果穩。

2.3 MCMC 調提尺以納率約：
   - 23.4% 為高維隨步 Metropolis
   - 57.4% 為一維標
   - 65-90% 為 HMC（依軌長）

2.4 若請減差→配之：
   - **反變**：各路隨增 `Z`、亦擬 `-Z`
   - **層樣**：分概空、各層內樣
   - **控變**：識相關量有知期以減差

得：擇配程類之擬算與宜調參。

敗：法不穩（如 Euler-Maruyama 散）→換隱法或減 `dt`。

### 三：行擬

3.1 配 `n_paths` 軌存、各長 `n_steps`（或為 Gillespie 等事件驅動法動配）。

3.2 各路 `i = 1, ..., n_paths`：

   **DTMC / 隨步：**
   - 設 `x[0] = initial_state`
   - 各 `t = 1, ..., n_steps`：自轉分樣 `x[t]` 給 `x[t-1]`

   **CTMC（Gillespie）：**
   - 設 `x[0] = initial_state`、`time = 0`
   - 當 `time < T_max`：
     - 計總率 `lambda = -Q[x, x]`
     - 樣留時 `tau ~ Exp(lambda)`
     - 樣次態自 `Q[x, j] / lambda` 為 `j != x`
     - 更 `time += tau`、記轉

   **SDE（Euler-Maruyama）：**
   - 設 `x[0] = initial_state`
   - 各 `t = 1, ..., n_steps`：
     - `dW = sqrt(dt) * N(0, I)`（Wiener 增）
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC（Metropolis-Hastings）：**
   - 設 `x[0] = initial_state`
   - 各 `t = 1, ..., n_steps`：
     - 提 `x' ~ q(x' | x[t-1])`
     - 計納比 `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))`
     - 以 `alpha` 概納：納則 `x[t] = x'`、否 `x[t] = x[t-1]`
     - 記納決

3.3 若 `target_function` 予→各路各態評之、存值。

3.4 行稀：留每 `thinning` 樣。

3.5 棄各路始 `burn_in` 樣（主於 MCMC）。

得：`n_paths` 全軌存於憶、可選函評。MCMC 納率於目範。

敗：擬生 NaN 或 Inf→減 SDE 之 `dt` 或察參。MCMC 納率近 0% 或 100%→調提尺。

### 四：行收歛診

4.1 **追圖**：繪某路各分量之值於時。目視穩（無趨、差穩）。

4.2 **Gelman-Rubin 診（R-hat）**：MCMC 多鏈：
   - 計鏈內差 `W` 與鏈間差 `B`
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - 收歛示於 `R_hat < 1.01`（嚴）或 `R_hat < 1.1`（寬）

4.3 **有效樣大（ESS）**：
   - 估增滯之自相
   - `ESS = n_samples / (1 + 2 * sum(autocorrelations))`
   - 試則：`ESS > 400` 為可信後總

4.4 **Geweke 診**：比各鏈首 10% 與末 50% 之均。z 應於 [-2, 2] 為收歛。

4.5 **非 MCMC 程**：驗時均統（均、差）隨路長穩。繪行均。

4.6 報總表：

| Diagnostic | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Acceptance rate | ... | 0.15-0.50 | ... |

得：諸收歛診過閾。追圖示穩、混良鏈。

敗：R-hat > 1.1→行更長鏈或增提。ESS 甚低→增稀或換更佳樣（如 HMC）。Geweke 敗→延 burn-in。

### 五：計總統含信區

5.1 各關量（態占、函期、抵時）：
   - 計點估為跨路樣均（過 burn-in 與稀後）
   - 用 ESS 計標誤：`SE = SD / sqrt(ESS)`

5.2 建信區：
   - 常近：`estimate +/- z_{alpha/2} * SE`
   - 偏分→用百分自舉或批均

5.3 若用減差→計減差因：
   - `VRF = Var(naive estimator) / Var(reduced estimator)`
   - 報有效加速

5.4 Monte Carlo 積估：
   - 報估、標誤、95% CI、ESS、函評數

5.5 分估：
   - 計實百分（中、2.5、97.5）
   - 連量用核密估

5.6 列諸總統與其不確。

得：點估含標誤與信區。減差（若用）生 VRF > 1。

敗：信區過寬→增 `n_paths` 或 `n_steps`。減差敗（VRF < 1）→閉之——控變或反變或不宜。

### 六：示軌與分

6.1 **軌圖**：繪代表樣路（5-20）於時。重疊用透明。

6.2 **集統**：覆均軌與跨路逐點 95% 信帶。

6.3 **邊分**：選時點繪態跨路之直方或密估。

6.4 **穩分比**：若析穩分有→覆於末時實直方。

6.5 **自相圖**：MCMC 繪各分量自相函（ACF）至宜滯。

6.6 **診盤**：合追、ACF、行均、邊密為一多板圖以全察。

6.7 諸圖存為向量（PDF/SVG）與點陣（PNG）為文。

得：版質之圖示軌為、分收歛、診總。析解（若有）配實果。

敗：示顯非穩或非期之多模→覆步一二察參或法誤。圖亂→減示路或增圖大。

## 驗

- 諸擬軌留於有效態空（無越界、無 NaN/Inf）
- DTMC/CTMC：實穩分收於析者（於期 Monte Carlo 誤內）
- SDE：半 `dt` 不質變果（收歛序察）
- MCMC：R-hat < 1.01、ESS > 400、Geweke z 於 [-2, 2]
- 信區寬隨 `1/sqrt(n_paths)` 減（中極限）
- 減差技生 VRF > 1（估改非劣）
- 重現：同種重行生同果

## 忌

- **MCMC burn-in 不足**：自劣始態需長 burn-in 乃樣代標分。常察追圖與用收歛診、勿猜
- **僵 SDE 之 Euler-Maruyama 不穩**：漂大梯→明 Euler-Maruyama 散。換隱法或用適步
- **混 SDE 強弱收歛**：強收歛測路誤（要於個軌）；弱收歛測分誤（足為期）。Euler-Maruyama 弱序 1.0 而強序 0.5
- **偽隨數質**：甚長擬中、劣 RNG 或生相關樣。用善測者（Mersenne Twister、PCG、Xoshiro）並驗獨
- **忽 MCMC 自相**：視自相 MCMC 樣為獨低估不確。常用 ESS、非原樣數、為標誤
- **非單調函之反變**：反樣唯於估為下均勻之單調函時減差。非單調或增差
- **大擬之憶**：諸長路全步存或耗憶。完軌不需示時、用線統（行均、差）

## 參

- [Model Markov Chain](../model-markov-chain/SKILL.md) — 予轉陣與析解、擬驗之
- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — 自合 HMM 擬助後測檢與合資生
