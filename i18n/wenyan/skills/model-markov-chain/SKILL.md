---
name: model-markov-chain
locale: wenyan
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

由原轉數或域定構、分、析離時或續時馬可夫鏈，生定態、平均首至時、模驗。涵 DTMC 與 CTMC 端至端流。

## 用時

- 模未來態唯依當前態之系（無記性）
- 已察有限態間之轉數或率
- 求程之久態定概
- 須定預至時或吸概
- 分態為過、回、吸以析構
- 比同系之代馬可夫模
- 為高模築基（隱馬可夫、強化學習 MDP）

## 入

### 必

| Input | Type | Description |
|-------|------|-------------|
| `state_space` | list/vector | Exhaustive enumeration of all states in the chain |
| `transition_data` | matrix, data frame, or edge list | Raw transition counts, a probability matrix, or a rate matrix (for CTMC) |
| `chain_type` | string | Either `"discrete"` (DTMC) or `"continuous"` (CTMC) |

### 可選

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_distribution` | vector | uniform | Starting state probabilities |
| `time_horizon` | integer/float | 100 | Number of steps (DTMC) or time units (CTMC) for simulation |
| `tolerance` | float | 1e-10 | Convergence tolerance for iterative computations |
| `absorbing_states` | list | auto-detect | States explicitly marked as absorbing |
| `labels` | list | state indices | Human-readable names for each state |
| `method` | string | `"eigen"` | Solver method: `"eigen"`, `"power"`, or `"linear_system"` |

## 法

### 第一步：定態空與轉

1.1. 列諸異態。確單盡而互斥。

1.2. 若由原察始，列轉數於 `n x n` 數陣 `C`，其中 `C[i,j]` 乃由 `i` 至 `j` 所察轉之數。

1.3. 續時鏈中，並收每態之留時與轉去處。

1.4. 確無態漏：每察源與所至皆於態空。

1.5. 文檔數源、察期、所施過。此源錄為復析與釋異所要。

**得：** 大小 `n` 之明態空與含諸察轉之數陣或（源、至、率/數）三元組。態空當足小可陣運（密法常 `n < 10000`）。

**敗則：** 若態漏，再察源並擴列。若態空於陣法太大，慮聚稀態為「他」總態或轉模析。若數陣極稀，驗察期足以含典轉。

### 第二步：構轉陣或生

2.1. **離時（DTMC）**：歸數陣每行得轉概陣 `P`：
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - 驗每行和為 1（容差內）

2.2. **續時（CTMC）**：構率（生）陣 `Q`：
   - 非對角：`Q[i,j] = i 至 j 之轉率`
   - 對角：`Q[i,i] = -sum(Q[i,j] for j != i)`
   - 驗每行和為 0（容差內）

2.3. 處零數行（從未為源之態）需定平策：拉普拉斯平、吸定、或標審

2.4. 存陣於宜下流之式（小鏈密、大鏈稀）

**得：** 有效隨陣 `P`（行和為 1）或生陣 `Q`（行和為 0），`P` 無負非對角入，`Q` 無正對角入。

**敗則：** 若行和逾容，察數壞或浮點。重歸或察源。

### 第三步：分態

3.1. 由轉陣導之有向圖（唯正概邊）找強連通分量算通類。

3.2. 每通類定：
   - **回**：類無至他類之出邊
   - **過**：有出邊
   - **吸**：類含一態而 `P[i,i] = 1`

3.3. 每回類算可至類內任態之諸環長之 GCD 察周期。
   - 周 = 1 為非周

3.4. 定鏈為 **不可約**（一通類）或 **可約**（多類）。

3.5. 要：列每類、其類（過/回）、周、有無吸態。

**得：** 全分類：每態於一通類附籤（過、正回、零回、吸）與周。

**敗則：** 若圖析不一致，驗轉陣無負入且行正和。極大鏈用迭圖法非全陣冪。

### 第四步：算定態

4.1. **不可約非周鏈**：解 `pi * P = pi` 附 `sum(pi) = 1`。
   - 重式為 `pi * (P - I) = 0` 附歸約
   - 用特值分解：`pi` 為 `P` 對應特值 1 之左特向，歸至和 1

4.2. **不可約周鏈**：定態仍存而鏈不從任始態收。如 4.1 算之。

4.3. **可約鏈**：每回類獨算定態。總定態為依過態吸概之凸合。

4.4. **CTMC**：解 `pi * Q = 0` 附 `sum(pi) = 1`。

4.5. 驗：算 `pi` 乘 `P`（或 `Q`），確結等 `pi`（容差內）。

4.6. 可約鏈中，算每過態至每回類之吸概。此概合每類定態給依始態之久行。

4.7. 錄譜隙（最大特值與次大之差）。此量控收於定之率，於第六步定模驗所需步數有用。

**得：** 長 `n` 之概向 `pi` 諸入非負，和 1，於容差內滿足平衡式。非周不可約鏈譜隙當正。

**敗則：** 若特解器不收，試迭冪法（`pi_k+1 = pi_k * P` 至收）。若多特值等 1，鏈可約——按 4.3 處。若譜隙極小，鏈混緩，驗需極長模。

### 第五步：算平均首至時

5.1. 定平均首至時 `m[i,j]` 為從 `i` 至 `j` 之預步數。

5.2. 不可約鏈中解線性式系：
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` 諸 `i != j`
   - `m[j,j] = 1 / pi[j]`（平均回時）

5.3. 吸鏈中算吸概與至吸預時：
   - 分 `P` 為過（`Q_t`）與吸塊
   - 基本陣：`N = (I - Q_t)^{-1}`
   - 至吸預步：`N * 1`（一柱向）
   - 吸概：`N * R`，`R` 為過至吸塊

5.4. CTMC 中以生陣之預留時代步數。

5.5. 結果以陣或要態對首至時表呈。

**得：** 平均首至時陣，對角入等平均回時（`1/pi[j]`），非對角入於通態對為有限。

**敗則：** 若線系奇，鏈有過態不可至標。報不可至對為無限。驗第三步鏈構。

### 第六步：模驗

6.1. 自始分布模 `K` 獨樣徑，每行 `T` 步。

6.2. 棄燒入後，跨諸徑算態占頻以實估定態。

6.3. 比模頻與析定態。算總變距或卡方統計。

6.4. 跨復記每標態之首至時實估平均首至時。

6.5. 報合度量：
   - 析與模定概之最大絕差
   - 模首至時對析值之 95% 信區

6.6. 若差逾容，再察轉陣構與分類步。

**得：** 模定態於析解總變距 0.01 內（足長行）。模平均首至時於析值 10% 內。

**敗則：** 增模長 `T` 或復數 `K`。若差持，析解或有數誤——以更高精重算。

## 驗

- 轉陣 `P` 諸入非負且每行和為 1（CTMC `Q` 行和 0）
- 定態 `pi` 為有效概向滿足 `pi * P = pi`
- 平均回時等 `1/pi[j]`，每回態 `j`
- 模態頻收於析定態
- 態分類一致：無回態邊出其通類
- `P` 諸特值絕值至多 1，每回類正一特值等 1
- 吸鏈：每過態吸概跨諸吸類和為 1
- 基本陣 `N = (I - Q_t)^{-1}` 諸入正（預訪數正）
- 細衡若且唯若鏈可逆：`pi[i] * P[i,j] = pi[j] * P[j,i]` 諸 `i,j`

## 陷

- **態空不盡**：態漏生子隨陣（行和小於 1）。析前必驗行和
- **混 DTMC 與 CTMC**：率陣必非正對角且行和 0。施 DTMC 式於率陣生謬
- **忽周**：周鏈有有效定態而於常義不收。混時析必慮周
- **大鏈數不穩**：大密陣特分解費而失精。逾數百態用稀解器或迭法
- **零概轉**：轉陣構零可使鏈可約。算單定態前驗不可約
- **模長不足**：短模混差生偏估。必算有效樣大並察跡圖
- **未驗即設可逆**：諸析簡（如細衡）唯施可逆鏈。用倚可逆之結前驗 `pi[i] * P[i,j] = pi[j] * P[j,i]`
- **冪法浮點積**：屢迭 `pi * P` 積捨誤。冪迭中定期重歸 `pi` 至和 1

## 參

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — 擴馬可夫鏈為含發放之潛態模
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) — 通模框，可施於馬可夫鏈樣徑與蒙特卡洛驗
