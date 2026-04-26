---
name: model-markov-chain
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Build and analyze discrete or continuous Markov chains including transition
  matrix construction, state classification, stationary distribution computation,
  and mean first passage times. Use when modeling a memoryless system with
  observed transition counts or rates, computing long-run steady-state
  probabilities, determining expected hitting times or absorption probabilities,
  classifying states as transient or recurrent, or building a foundation for
  hidden Markov models or reinforcement learning MDPs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: intermediate
  language: multi
  tags: stochastic, markov-chain, transition-matrix, stationary-distribution
---

# 模馬可夫鏈

由原數或域陳築、分、析離散或連續時馬可夫鏈，生穩分布、均首至時、模擬驗。涵 DTMC 與 CTMC 全流。

## 用

- 模未來態唯依今態之系（無記性）
- 有限態間觀轉計或率
- 求過程之長運穩態率
- 定期至或吸率
- 分態為瞬、復、吸以析構
- 比同系之異馬模
- 為高模築基（HMM、RL MDP）

## 入

### 必

| Input | Type | Description |
|-------|------|-------------|
| `state_space` | list/vector | Exhaustive enumeration of all states in the chain |
| `transition_data` | matrix, data frame, or edge list | Raw transition counts, a probability matrix, or a rate matrix (for CTMC) |
| `chain_type` | string | Either `"discrete"` (DTMC) or `"continuous"` (CTMC) |

### 可

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_distribution` | vector | uniform | Starting state probabilities |
| `time_horizon` | integer/float | 100 | Number of steps (DTMC) or time units (CTMC) for simulation |
| `tolerance` | float | 1e-10 | Convergence tolerance for iterative computations |
| `absorbing_states` | list | auto-detect | States explicitly marked as absorbing |
| `labels` | list | state indices | Human-readable names for each state |
| `method` | string | `"eigen"` | Solver method: `"eigen"`, `"power"`, or `"linear_system"` |

## 行

### 一：定態空與轉

1.1. 列諸異態。確盡且互斥。

1.2. 由原察→列轉計入 `n x n` 計陣 `C`，`C[i,j]` 為由 i 至 j 之觀數。

1.3. 連時鏈→收各態持時與轉去處。

1.4. 驗無漏：諸觀源去皆於態空。

1.5. 記源、察期、過濾。此源錄為復析與釋異所必。

得：定態空大 `n` 含計陣或 (源、去、率/數) 元組覆諸觀轉。態空宜小於矩運（密法常 `n < 10000`）。

敗：缺態→重審源擴列。空太大不宜陣→合稀態為「他」或轉模擬析。計陣極稀→驗察期足長以捕典轉。

### 二：築轉陣或生

2.1. **DTMC**：歸計陣各列得轉率陣 `P`：
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - 驗各列和 1（內公差）。

2.2. **CTMC**：築率（生）陣 `Q`：
   - 對外：`Q[i,j] = i 至 j 之轉率`
   - 對：`Q[i,i] = -sum(Q[i,j] for j != i)`
   - 驗各列和 0（內公差）。

2.3. 零計列（從未為源之態）→定平滑：拉普拉斯、吸約定、或標審。

2.4. 存陣以宜後算之式（小鏈密、大鏈稀）。

得：有效隨機陣 `P`（列和 1）或生陣 `Q`（列和 0），`P` 對外無負，`Q` 對無正。

敗：列和逾差→察數壞或浮點誤。重歸或重審源。

### 三：分態

3.1. 算通類：尋轉陣引向圖之強連通分（唯正率邊）。

3.2. 各通類定：
   - **復**：類無向他類之去邊
   - **瞬**：有去邊
   - **吸**：類唯一態且 `P[i,i] = 1`

3.3. 各復類察期：算類中任態可達諸環長之 GCD。
   - 期 1 即非期。

3.4. 定鏈為**不可約**（一通類）或**可約**（多類）。

3.5. 摘：列各類、其型（瞬/復）、其期、有吸態否。

得：諸態皆賦通類含標（瞬、正復、零復、吸）與期。

敗：圖析不一→驗轉陣無負且列和正。極大鏈用迭圖法非全陣冪。

### 四：算穩分

4.1. **不可約非期鏈**：解 `pi * P = pi` 受 `sum(pi) = 1` 約。
   - 重式為 `pi * (P - I) = 0` 含歸約。
   - 用特值分：`pi` 為 `P` 對特值 1 之左特向量，歸至和 1。

4.2. **不可約期鏈**：穩分仍存，鏈不由任始態收於之。算同 4.1。

4.3. **可約鏈**：各復類獨算穩分。總穩分為凸組依瞬態之吸率。

4.4. **CTMC**：解 `pi * Q = 0` 含 `sum(pi) = 1`。

4.5. 驗：算 `pi * P`（或 `Q`）確等 `pi` 內差。

4.6. 可約鏈→算各瞬態至各復類之吸率。此率與類穩分合得依始態之長運。

4.7. 記譜隙（最大與次大特值幅之差）。此量決收於穩之率，於六定模擬步數有用。

得：率向量 `pi` 長 `n`、皆非負、和 1、合衡式內差。非期不可約鏈譜隙宜正。

敗：特解器不收→試迭冪法（`pi_k+1 = pi_k * P` 至收）。多特值等 1→鏈可約——按 4.3 治。譜隙極小→鏈混慢，需極長模擬以驗。

### 五：算均首至時

5.1. 定均首至時 `m[i,j]` 為由 i 始達 j 之期步數。

5.2. 不可約鏈→解線方系：
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` 諸 `i != j`
   - `m[j,j] = 1 / pi[j]`（均復時）

5.3. 吸鏈→算吸率與期吸時：
   - 分 `P` 為瞬（`Q_t`）與吸塊。
   - 基陣：`N = (I - Q_t)^{-1}`
   - 期吸步：`N * 1`（一列向量）
   - 吸率：`N * R`，`R` 為瞬至吸塊。

5.4. CTMC→以生陣換步計為期持時。

5.5. 出為陣或表，含關態對之首至時。

得：均首至時陣，對等均復時（`1/pi[j]`），對外於通態對為有限。

敗：線系奇異→鏈有瞬態不能達標。報不達對為無限。驗三之鏈構。

### 六：以模擬驗

6.1. 模 `K` 獨樣路各 `T` 步，由始分發。

6.2. 經驗估穩分：棄燒入後計諸路之態占率。

6.3. 比模率與析穩分。算總變距或卡方計。

6.4. 經驗估均首至時：記諸復下各標態之首至時。

6.5. 報合度：
   - 析與模穩率之最大絕差
   - 模首至時對析值之 95% 信區

6.6. 差逾差→重審轉陣築與分步。

得：模穩分於析解內 0.01 總變距（足長運）。模均首至時於析值內 10%。

敗：增模長 `T` 或重數 `K`。差持→析解或有數誤——重以高精算。

## 驗

- 轉陣 `P` 諸入非負、各列和 1（或 CTMC 之 `Q` 列和 0）
- 穩分 `pi` 為合率向量合 `pi * P = pi`
- 均復時等 `1/pi[j]` 於各復態 `j`
- 模態率收於析穩分
- 態分一：無復態有出其通類之邊
- `P` 諸特值幅至多 1，各復類精一特值等 1
- 吸鏈：各瞬態之吸率於諸吸類和 1
- 基陣 `N = (I - Q_t)^{-1}` 諸入正（期訪計正）
- 細衡若鏈可逆：`pi[i] * P[i,j] = pi[j] * P[j,i]` 諸 `i,j`

## 忌

- **態空不盡**：缺態生次隨機陣（列和 < 1）。析前必驗列和
- **混 DTMC 與 CTMC**：率陣對非正且列和 0。施 DTMC 式於率陣生謬
- **忽期**：期鏈有有效穩分而不於常義收。混時析必計期
- **大鏈數不穩**：大密陣特分貴失精。逾數百態用稀解器或迭法
- **零率轉**：轉陣構零致鏈可約。算單穩分前驗不可約
- **模擬不足**：短模混差生偏估。算有效樣本量察跡
- **假可逆未驗**：諸析捷（如細衡）唯施可逆鏈。用可逆果前驗 `pi[i] * P[i,j] = pi[j] * P[j,i]`
- **冪法浮點積**：`pi * P` 多迭積入誤。冪迭中時重歸 `pi` 和 1

## 參

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md)
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md)
