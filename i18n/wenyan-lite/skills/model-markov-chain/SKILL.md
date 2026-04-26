---
name: model-markov-chain
locale: wenyan-lite
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

# 建馬可夫鏈

由原始轉移資料或領域規格建、分類並析離散時或連續時之馬可夫鏈，產穩態分佈、平均首達時與基於模擬之驗證。涵 DTMC 與 CTMC 端到端之工作流。

## 適用時機

- 須建未來態僅依當前態之系統（無記憶性）
- 已觀有限態集間之轉移計數或率
- 欲計過程之長期穩態機率
- 須定預期首達時或吸收機率
- 為結構分析將態分類為瞬態、常返或吸收
- 欲比同系統之替代馬可夫模型
- 為更高階模型（隱馬可夫、強化學習 MDP）建基礎

## 輸入

### 必要

| Input | Type | Description |
|-------|------|-------------|
| `state_space` | list/vector | Exhaustive enumeration of all states in the chain |
| `transition_data` | matrix, data frame, or edge list | Raw transition counts, a probability matrix, or a rate matrix (for CTMC) |
| `chain_type` | string | Either `"discrete"` (DTMC) or `"continuous"` (CTMC) |

### 選擇性

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_distribution` | vector | uniform | Starting state probabilities |
| `time_horizon` | integer/float | 100 | Number of steps (DTMC) or time units (CTMC) for simulation |
| `tolerance` | float | 1e-10 | Convergence tolerance for iterative computations |
| `absorbing_states` | list | auto-detect | States explicitly marked as absorbing |
| `labels` | list | state indices | Human-readable names for each state |
| `method` | string | `"eigen"` | Solver method: `"eigen"`, `"power"`, or `"linear_system"` |

## 步驟

### 步驟一：定態空間與轉移

1.1. 列舉所有不同態。確認列表詳盡且互斥。

1.2. 若由原始觀測，將轉移計數彙為 `n x n` 計數矩陣 `C`，`C[i,j]` 為自態 `i` 至態 `j` 之觀測轉移數。

1.3. 對連續時鏈，連同轉移目的記各態之逗留時。

1.4. 確無態自列舉中遺漏，方法為核每觀測之起與止皆出現於態空間。

1.5. 記資料源、觀測期及任何施加之過濾。此來源記錄為復現分析與解異常之要。

**預期：** 大小為 `n` 之明定態空間，及計數矩陣或 (起、止、率/數) 之元組列表，涵所有觀測轉移。態空間宜小至可施矩陣運算（密集法通常 `n < 10000`）。

**失敗時：** 若有態遺漏，重審源資料並擴列舉。若態空間過大不能用矩陣法，可將罕態併為「其他」聚態，或改用模擬。若計數矩陣極稀疏，驗觀測期是否夠長以捕典型轉移。

### 步驟二：建轉移矩陣或生成元

2.1. **離散時（DTMC）**：將計數矩陣按行歸一以得轉移機率矩陣 `P`：
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - 驗每行之和為一（容差內）。

2.2. **連續時（CTMC）**：建率（生成元）矩陣 `Q`：
   - 非對角：`Q[i,j] = rate of transition from i to j`
   - 對角：`Q[i,i] = -sum(Q[i,j] for j != i)`
   - 驗每行之和為零（容差內）。

2.3. 對零計數行（從未為起之態）擇平滑策略：拉普拉斯平滑、吸收約定，或標記以待審。

2.4. 將矩陣存於合下游運算之格式（小鏈用密集，大鏈用稀疏）。

**預期：** 有效之隨機矩陣 `P`（行和為一），或生成元矩陣 `Q`（行和為零），`P` 之非對角無負，`Q` 之對角無正。

**失敗時：** 若行和偏出容差，查資料破損或浮點問題。重歸一或重審源資料。

### 步驟三：分類各態

3.1. 由轉移矩陣（僅機率為正之邊）所引之有向圖求其強連通分量以計通信類。

3.2. 對每通信類定：
   - **常返**若該類無出邊至他類。
   - **瞬態**若有出邊。
   - **吸收**若該類僅含一態且 `P[i,i] = 1`。

3.3. 對每常返類，由可自類中任態到達之所有迴圈長之最大公因數計週期。
   - 週期為一示非週期。

3.4. 定鏈為**不可約**（單一通信類）或**可約**（多類）。

3.5. 摘要：列每類、其類型（瞬態／常返）、其週期，以及是否有吸收態。

**預期：** 完整分類：每態歸入一通信類含標記（瞬態、正常返、零常返、吸收）與週期。

**失敗時：** 若圖分析不一致，驗轉移矩陣無負並行和正確。對極大鏈用迭代圖算法而非完整矩陣冪。

### 步驟四：計穩態分佈

4.1. **不可約非週期鏈**：解 `pi * P = pi` 受 `sum(pi) = 1` 之制。
   - 重述為 `pi * (P - I) = 0` 連同歸一限制。
   - 用特徵值分解：`pi` 為 `P` 對應特徵值一之左特徵向量，歸一使和為一。

4.2. **不可約週期鏈**：穩態分佈仍存，然鏈自任意初態不收斂於之。同 4.1 計之。

4.3. **可約鏈**：對每常返類獨計穩態分佈。整體穩態分佈為依瞬態起算之吸收機率之凸組合。

4.4. **CTMC**：解 `pi * Q = 0` 連同 `sum(pi) = 1`。

4.5. 驗：將計得之 `pi` 乘 `P`（或 `Q`），確結果於容差內等於 `pi`。

4.6. 對可約鏈，計每瞬態至每常返類之吸收機率。此等機率連同類內穩態分佈，給依始態而定之長期行為。

4.7. 記譜隙（最大特徵值與第二大特徵值幅度之差）。此量主導向穩態之收斂率，於步驟六定模擬步數時有用。

**預期：** 長為 `n` 之機率向量 `pi`，皆非負，和為一，於容差內滿足平衡方程。對非週期不可約鏈，譜隙宜為正。

**失敗時：** 若特徵解算器不收斂，試迭代冪法（`pi_k+1 = pi_k * P` 直至收斂）。若多特徵值等一，則鏈可約——按 4.3 處之。若譜隙極小，鏈混合慢，驗證須甚長之模擬。

### 步驟五：計平均首達時

5.1. 定平均首達時 `m[i,j]` 為自態 `i` 始達態 `j` 之預期步數。

5.2. 對不可約鏈，解線性方程組：
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` for all `i != j`
   - `m[j,j] = 1 / pi[j]`（平均常返時）

5.3. 對吸收鏈，計吸收機率與至吸收之預期時：
   - 將 `P` 分為瞬態（`Q_t`）與吸收塊。
   - 基本矩陣：`N = (I - Q_t)^{-1}`
   - 至吸收之預期步數：`N * 1`（一向量）
   - 吸收機率：`N * R`，`R` 為瞬態至吸收之塊。

5.4. 對 CTMC，以生成元矩陣將步數代以預期逗留時。

5.5. 將結果以矩陣或表呈為關鍵態對之兩兩首達時。

**預期：** 平均首達時之矩陣，對角等於平均常返時（`1/pi[j]`），通信態對之非對角為有限。

**失敗時：** 若線性系奇異，鏈有不能達目標之瞬態。報不可達對為無窮。驗步驟三之鏈結構。

### 步驟六：以模擬驗證

6.1. 模擬 `K` 條獨立樣本路徑，每條 `T` 步，自初分佈始。

6.2. 棄燒入期後，由所有路徑之態占有頻率經驗估穩態分佈。

6.3. 較模擬頻與解析穩態分佈。計總變差距離或卡方統計。

6.4. 對每目標態跨重複記首達時，經驗估平均首達時。

6.5. 報吻合度：
   - 解析與模擬穩態機率間之最大絕對偏差。
   - 模擬首達時對解析值之 95% 信賴區間。

6.6. 若差超容差，重審轉移矩陣建構與分類步驟。

**預期：** 模擬之穩態分佈於解析解之 0.01 總變差內（足長之執行下）。模擬之平均首達時於解析值之百分之十內。

**失敗時：** 增模擬長 `T` 或重複數 `K`。若差仍存，解析解或有數值誤——以更高精度重算。

## 驗證

- 轉移矩陣 `P` 之所有項非負且每行和為一（CTMC 之 `Q` 行和為零）
- 穩態分佈 `pi` 為有效機率向量並滿足 `pi * P = pi`
- 對每常返態 `j`，平均常返時等於 `1/pi[j]`
- 模擬之態頻收斂於解析穩態分佈
- 態分類一致：無常返態有離其通信類之邊
- `P` 之所有特徵值之幅度至多為一，每常返類恰有一特徵值等於一
- 對吸收鏈：每瞬態跨所有吸收類之吸收機率和為一
- 基本矩陣 `N = (I - Q_t)^{-1}` 之所有項皆正（預期訪數為正）
- 細緻平衡成立若且唯若鏈可逆：`pi[i] * P[i,j] = pi[j] * P[j,i]` 對所有 `i,j`

## 常見陷阱

- **態空間不詳盡**：遺態生次隨機矩陣（行和小於一）。析前必驗行和。
- **混 DTMC 與 CTMC**：率矩陣須有非正之對角且行和為零。將 DTMC 公式施於率矩陣生謬。
- **忽週期性**：週期鏈有有效之穩態分佈，然不於通常意下收斂於之。混合時分析必計週期。
- **大鏈之數值不穩**：大密集矩陣之特徵值分解貴而失精度。鏈逾數百態用稀疏解算器或迭代法。
- **零機率轉移**：轉移矩陣中之結構零可使鏈可約。計單一穩態分佈前先驗不可約性。
- **模擬不夠長**：短模擬與差混合生偏估。必計有效樣本大小並查軌跡圖。
- **未驗即設可逆**：諸解析捷徑（如細緻平衡）僅於可逆鏈。用依可逆性之結果前先驗 `pi[i] * P[i,j] = pi[j] * P[j,i]`。
- **冪法之浮點累積**：多次迭代 `pi * P` 累積捨入誤。冪迭代中定期將 `pi` 重歸一至和為一。

## 相關技能

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) -- 將馬可夫鏈擴至含觀測釋放之潛態模型
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) -- 通用模擬框架，可施於馬可夫鏈樣本路徑與蒙地卡羅驗證
