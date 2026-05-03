---
name: simulate-stochastic-process
locale: wenyan-lite
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

# 模擬隨機過程

模擬隨機過程之樣本路徑——含離散馬可夫鏈、連續時間過程、隨機微分方程與 MCMC 取樣器——附收斂診斷、變異數縮減技巧與軌跡視覺化。

## 適用時機

- 須為估計、預測或視覺化從隨機過程生成樣本路徑
- 解析解不可行而模擬為唯一可行進路
- 執行蒙地卡羅估計而需收斂保證與不確定性量化
- 欲以經驗模擬驗證解析結果（穩態分布、命中時間）
- 須以 MCMC 自複雜後驗分布取樣
- 於投入完整解析處理前先構造隨機模型雛形

## 輸入

### 必要

| Input | Type | Description |
|-------|------|-------------|
| `process_type` | string | Type of process: `"dtmc"`, `"ctmc"`, `"random_walk"`, `"brownian_motion"`, `"sde"`, `"mcmc"` |
| `parameters` | dict | Process-specific parameters (transition matrix, drift/diffusion coefficients, target density, etc.) |
| `n_paths` | integer | Number of independent sample paths to simulate |
| `n_steps` | integer | Number of time steps per path (or total MCMC iterations) |

### 選擇性

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_state` | scalar/vector | process-specific | Starting state or distribution for each path |
| `dt` | float | 0.01 | Time step size for continuous-time discretization |
| `seed` | integer | random | Random seed for reproducibility |
| `burn_in` | integer | `n_steps / 10` | Number of initial steps to discard (MCMC) |
| `thinning` | integer | 1 | Keep every k-th sample to reduce autocorrelation |
| `variance_reduction` | string | `"none"` | Method: `"none"`, `"antithetic"`, `"stratified"`, `"control_variate"` |
| `target_function` | callable | none | Function to evaluate along paths for Monte Carlo estimation |

## 步驟

### 步驟一：定義過程模型與參數

1.1. 識別過程類型並收集所有必要參數：
   - **DTMC**：轉移矩陣 `P` 與狀態空間。驗證 `P` 為列隨機。
   - **CTMC**：速率矩陣 `Q`。驗證列和為 0 且非對角項非負。
   - **隨機漫步**：步長分布（如 `{-1, +1}` 機率均等）、邊界（如有）。
   - **布朗運動**：漂移 `mu`、波動率 `sigma`、維度 `d`。
   - **SDE（伊藤）**：漂移函式 `a(x,t)`、擴散函式 `b(x,t)`。
   - **MCMC**：目標對數密度、提案機制（隨機漫步 Metropolis、Hamiltonian、Gibbs 分量）。

1.2. 驗證參數一致性：
   - 矩陣維度與狀態空間大小相符。
   - SDE 係數於所選求解器下滿足成長與 Lipschitz 條件（至少非形式地）。
   - MCMC 提案於目標分布之支撐上有良定義。

1.3. 設隨機種子以求可重現。

**預期：** 完整指明之隨機模型，參數已驗證且隨機狀態可重現。

**失敗時：** 若參數不一致（如非隨機矩陣），先修正再進。若 SDE 係數病態，考慮另一離散化方案。

### 步驟二：選擇模擬方法

2.1. 依過程類型選擇合適演算法：

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

2.2. SDE 方法中，選 `dt` 須小至數值穩定。經驗法則：自 `dt = 0.01` 起並折半，直至結果穩定。

2.3. MCMC 中，調提案尺度以達約以下接受率：
   - 高維隨機漫步 Metropolis：23.4%
   - 一維目標：57.4%
   - HMC：65-90%（依軌跡長度而定）

2.4. 若請求變異數縮減，配置之：
   - **對偶變數**：對每路徑之隨機增量 `Z`，亦以 `-Z` 模擬。
   - **分層取樣**：劃分機率空間，於每層內取樣。
   - **控制變數**：識別具已知期望之相關量以縮減變異數。

**預期：** 已選妥配對過程類型之模擬演算法及其調參。

**失敗時：** 若所選方法不穩（如 Euler-Maruyama 發散），轉至隱式方法或降 `dt`。

### 步驟三：實作並執行模擬

3.1. 為 `n_paths` 條軌跡分配儲存空間，每條長 `n_steps`（或對如 Gillespie 之事件驅動方法動態分配）。

3.2. 對每路徑 `i = 1, ..., n_paths`：

   **DTMC／隨機漫步：**
   - 設 `x[0] = initial_state`
   - 對 `t = 1, ..., n_steps`：依給定 `x[t-1]` 之轉移分布取樣 `x[t]`

   **CTMC（Gillespie）：**
   - 設 `x[0] = initial_state`、`time = 0`
   - 當 `time < T_max`：
     - 計算總速率 `lambda = -Q[x, x]`
     - 取樣保持時間 `tau ~ Exp(lambda)`
     - 對 `j != x`，依轉移機率 `Q[x, j] / lambda` 取樣下一狀態
     - 更新 `time += tau`、記錄轉移

   **SDE（Euler-Maruyama）：**
   - 設 `x[0] = initial_state`
   - 對 `t = 1, ..., n_steps`：
     - `dW = sqrt(dt) * N(0, I)`（Wiener 增量）
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC（Metropolis-Hastings）：**
   - 設 `x[0] = initial_state`
   - 對 `t = 1, ..., n_steps`：
     - 提議 `x' ~ q(x' | x[t-1])`
     - 計算接受比 `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))`
     - 以機率 `alpha` 接受：接受則 `x[t] = x'`，否則 `x[t] = x[t-1]`
     - 記錄接受決定

3.3. 若提供 `target_function`，於每路徑之每狀態評估之並儲存其值。

3.4. 套用稀疏化：保留每 `thinning` 之第 k 樣。

3.5. 自每路徑開頭丟棄 `burn_in` 樣（主要對 MCMC）。

**預期：** `n_paths` 條完整軌跡儲存於記憶體，附選擇性之函式評估。MCMC 接受率於目標範圍內。

**失敗時：** 若模擬產生 NaN 或 Inf，對 SDE 方法降 `dt` 或檢查參數有效性。若 MCMC 接受率近 0% 或 100%，調整提案尺度。

### 步驟四：套用收斂診斷

4.1. **追蹤圖**：對部分路徑繪每分量之值隨時間之變化。視覺檢查穩態（無趨勢、變異數穩定）。

4.2. **Gelman-Rubin 診斷（R-hat）**：對含多鏈之 MCMC：
   - 計算鏈內變異數 `W` 與鏈間變異數 `B`。
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - 收斂示為 `R_hat < 1.01`（嚴格）或 `R_hat < 1.1`（寬鬆）。

4.3. **有效樣本數（ESS）**：
   - 估計遞增滯後之自相關。
   - `ESS = n_samples / (1 + 2 * sum(autocorrelations))`
   - 經驗法則：`ESS > 400` 為可靠後驗摘要。

4.4. **Geweke 診斷**：比對每鏈前 10% 與後 50% 之均值。z 分數應於 [-2, 2] 內以示收斂。

4.5. **對非 MCMC 過程**：驗證時間平均統計（均值、變異數）隨路徑長度增而穩定。繪走動均值。

4.6. 報告摘要表：

| Diagnostic | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Acceptance rate | ... | 0.15-0.50 | ... |

**預期：** 所有收斂診斷皆過其閾值。追蹤圖示鏈穩定且混合良好。

**失敗時：** 若 R-hat > 1.1，跑更長之鏈或改善提案。若 ESS 甚低，增稀疏化或轉至更佳取樣器（如 HMC）。若 Geweke 失敗，延長 burn-in。

### 步驟五：計算摘要統計與信賴區間

5.1. 對每關注量（狀態占用、函式期望、命中時間）：
   - 計算點估計為跨路徑（burn-in 與稀疏化後）之樣本均值。
   - 用有效樣本數計算標準誤：`SE = SD / sqrt(ESS)`。

5.2. 構造信賴區間：
   - 常態近似：`estimate +/- z_{alpha/2} * SE`
   - 偏態分布用百分位 bootstrap 或批次均值。

5.3. 若已套變異數縮減，計算變異數縮減因子：
   - `VRF = Var(naive estimator) / Var(reduced estimator)`
   - 報告有效加速。

5.4. 對蒙地卡羅積分估計：
   - 報告估計、標準誤、95% CI、ESS 與函式評估數。

5.5. 對分布估計：
   - 計算經驗分位數（中位數、2.5、97.5 百分位）。
   - 對連續量做核密度估計。

5.6. 列表所有摘要統計及其不確定性。

**預期：** 點估計附對應標準誤與信賴區間。變異數縮減（若已套）產生 VRF > 1。

**失敗時：** 若信賴區間過寬，增 `n_paths` 或 `n_steps`。若變異數縮減反惡化估計（VRF < 1），停用之——控制變數或對偶方案或不適本問題。

### 步驟六：視覺化軌跡與分布

6.1. **軌跡圖**：繪具代表性之樣本路徑子集（5-20 條）隨時間之變化。對重疊路徑用透明度。

6.2. **集合統計**：疊繪均值軌跡與跨所有路徑之點對點 95% 信賴帶。

6.3. **邊際分布**：於選定時點，繪跨路徑之狀態分布之直方圖或密度估計。

6.4. **穩態分布比對**：若有解析穩態分布，疊於最終時間切片之經驗直方圖上。

6.5. **自相關圖**：對 MCMC，繪每分量自相關函式（ACF）至合理滯後。

6.6. **診斷儀表板**：將追蹤圖、ACF 圖、走動均值圖與邊際密度合於單一多面板圖以供綜合評估。

6.7. 將所有圖以向量（PDF/SVG）與點陣（PNG）格式存檔以供文件用。

**預期：** 出版品質之圖示，呈現軌跡行為、分布收斂與診斷摘要。解析解（如有）與經驗結果相符。

**失敗時：** 若視覺化揭示模型未預期之非穩態或多模態，回看步驟一二之參數或方法錯誤。若圖過雜亂，減顯示路徑數或加大圖尺。

## 驗證

- 所有模擬軌跡留於有效狀態空間（無越界值、無 NaN/Inf）
- DTMC/CTMC：經驗穩態分布收斂至解析者（於預期蒙地卡羅誤差內）
- SDE：折半 `dt` 不對結果產生質性變化（收斂階檢查）
- MCMC：R-hat < 1.01、ESS > 400、Geweke z 分數於 [-2, 2] 內
- 信賴區間寬度依 `1/sqrt(n_paths)` 比例縮小（中央極限定理）
- 變異數縮減技巧產生 VRF > 1（估計改善而非惡化）
- 可重現性：同種子重跑產生相同結果

## 常見陷阱

- **MCMC burn-in 不足**：自不良初始狀態起需長 burn-in 樣本方能代表目標分布。永遠檢查追蹤圖並用收斂診斷，而非猜 burn-in 長。
- **僵硬 SDE 之 Euler-Maruyama 不穩**：若漂移項梯度大，顯式 Euler-Maruyama 可能發散。轉隱式方法或用適應步長。
- **混淆 SDE 之強弱收斂**：強收斂衡量逐路徑誤差（對個別軌跡重要）；弱收斂衡量分布誤差（對期望足夠）。Euler-Maruyama 弱階為 1.0 但強階為 0.5。
- **偽隨機數生成器品質**：對極長模擬，低品質 RNG 可能產相關樣本。用經充分測試之生成器（Mersenne Twister、PCG 或 Xoshiro）並驗獨立性。
- **忽略 MCMC 自相關**：將自相關 MCMC 樣本當獨立會低估不確定性。永遠用有效樣本數，非原始樣本數，計算標準誤。
- **對非單調函式用對偶變數**：對偶取樣僅當被估量為底層均勻變數之單調函式時縮減變異數。對非單調函式可能增變異數。
- **大規模模擬之記憶體**：儲存多長路徑之所有時步可能耗盡記憶體。當完整軌跡非視覺化所需時，用線上統計（走動均值、變異數）。

## 相關技能

- [Model Markov Chain](../model-markov-chain/SKILL.md) — 提供模擬所驗證之轉移矩陣與解析解
- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — 自擬合 HMM 之模擬使後驗預測檢查與合成資料生成成為可能
