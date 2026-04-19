---
name: build-sequential-circuit
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build sequential (stateful) logic circuits including latches, flip-flops,
  registers, counters, and finite state machines. Covers SR latch, D and JK
  flip-flops, binary/BCD/ring counters, and Mealy/Moore FSM design with
  clock signal and timing analysis. Use when a circuit must remember past
  inputs, count events, or implement a state-dependent control sequence.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: advanced
  language: multi
  tags: digital-logic, sequential-circuits, flip-flops, state-machines, registers
---

# 建時序之路

設時序（有態）之邏路，含 latch、flip-flop、register、counter、有限態機。識所須之記與態類，作態圖與轉表，導所擇 flip-flop 之激式，以 flip-flop 與組合邏於門級施，驗以時序圖與態序模。

## 用時

- 路須記舊入或於時脈週間持內態
- 設 counter（二、BCD、ring、Johnson）、移位 register、或序察
- 自態圖或正則生 Mealy 或 Moore 有限態機
- 組合資料徑加時脈之存元（register、流水階）
- 為 simulate-cpu-architecture 技備有態之件（register 檔、程序計、控 FSM）

## 入

- **必要**：行之規——態圖、態表、時序圖、待察正則、或欲時序行之述之一
- **必要**：時脈之徵——邊觸（升/降）或級感；單脈或多相
- **可選**：flip-flop 類好（D、JK、T、SR）
- **可選**：重置類——同步、異步、或無
- **可選**：最態數或位寬之限
- **可選**：時之限（setup、hold、最高脈頻）

## 法

### 第一步：識記與態之須

定路須記何、須異態幾何：

1. **態列**：列路須居之諸異態。序察者，各態表目序之進。counter 者，各態為一計值。
2. **態編**：為諸態擇二進之編。
   - **二進編**：N 態用 ceil(log2(N)) flip-flop。最少 flip-flop 數。
   - **one-hot 編**：N flip-flop，每態一。簡化次態邏而增 flip-flop。
   - **Gray 碼編**：相鄰態只一位異。減轉時之暫態毛刺。
3. **入出之類**：識主入（外信）、主出、內態變（flip-flop 之 Q）。Mealy 機出依態與入。Moore 機出只依態。
4. **flip-flop 類擇**：依設所須擇之。
   - **D flip-flop**：最簡——次態等 D 入。默首擇。
   - **JK flip-flop**：最靈——J=K=1 翻。宜 counter。
   - **T flip-flop**：翻類——T=1 時變態。天然為二進 counter。
   - **SR latch/flip-flop**：置/復——避 S=R=1。新設鮮擇。

```markdown
## State Requirements
- **Number of states**: [N]
- **State encoding**: [binary / one-hot / Gray]
- **Flip-flops needed**: [count and type]
- **Machine type**: [Mealy / Moore]
- **Inputs**: [list with descriptions]
- **Outputs**: [list with descriptions]
- **Reset behavior**: [synchronous / asynchronous / none]
```

**得：** 全態表，附所擇編、所擇 flip-flop 類、Mealy 或 Moore 之類。

**敗則：** 若規中態數不明，以入序（至路記深）追之而列諸態。若數逾實用限（手設逾十六態），考分為小交 FSM。

### 第二步：作態圖與轉表

以態圖與對表形式明路之行：

1. **態圖**：畫有向圖——
   - 各節為一態，標以態名及（Moore 者）出值
   - 各邊為轉，標入條件及（Mealy 者）出值
   - 每態必有諸入合之出邊——無默「留」轉
2. **轉表**：轉圖為表，欄為現態、入、次態、出
3. **可達察**：自初/重置態始，驗諸態皆可達。不可達者示設誤或宜為 don't-care
4. **態減**（選）：察等態——二態於諸入皆生同出且轉至等次態者為等。合之以減 flip-flop

```markdown
## State Transition Table
| Present State | Input | Next State | Output |
|--------------|-------|------------|--------|
| S0           | 0     | S0         | 0      |
| S0           | 1     | S1         | 0      |
| S1           | 0     | S0         | 0      |
| S1           | 1     | S2         | 0      |
| ...          | ...   | ...        | ...    |

- **Unreachable states**: [list, or "none"]
- **Equivalent state pairs**: [list, or "none"]
```

**得：** 全轉表，涵諸現態/入合，諸態皆自初可達。

**敗則：** 若轉表缺條，規不全。返需求解模糊。若有不達者，加轉以達或刪而減編。

### 第三步：導激式

自轉表算 flip-flop 之入式（激式）：

1. **編態**：轉表中以二進編代態名。各位對應一 flip-flop
2. **建各 flip-flop 真值表**：為各 flip-flop 建真值表，現態位與入為入欄，所須 flip-flop 入為出
   - **D flip-flop**：D = 次態位（最簡）
   - **JK flip-flop**：用激表：0→0 為 J=0,K=X；0→1 為 J=1,K=X；1→0 為 J=X,K=1；1→1 為 J=X,K=0
   - **T flip-flop**：T = 現態 XOR 次態（位須變時 T=1）
3. **減各式**：施 evaluate-boolean-expression（K-map 或代數簡）於各 flip-flop 入函。不達態與 JK 表 X 條件之 don't-care 可大減之
4. **導出式**：Moore 者，各出只依現態位。Mealy 者，各出依現態位與入

```markdown
## Excitation Equations
- **Flip-flop type**: [D / JK / T]
- **State encoding**: [binary assignment table]

| Flip-Flop | Excitation Equation          |
|-----------|------------------------------|
| Q1        | D1 = [minimized expression]  |
| Q0        | D0 = [minimized expression]  |

## Output Equations
| Output | Equation                     |
|--------|------------------------------|
| Y      | [minimized expression]       |
```

**得：** 各 flip-flop 與各主出之減激式，諸 don't-care 已用。

**敗則：** 若激式過繁，重考態編。異編（如由二進轉 one-hot，或重分態碼）可大簡組邏。試至少二編而較字數。

### 第四步：於門級施

自 flip-flop 與組邏門建全路：

1. **置 flip-flop**：每態位一 flip-flop。諸脈入接系脈。指定者接重置入（異步重置直接於 flip-flop 之 CLR/PRE 腳；同步重置為激邏之部）
2. **建激邏**：以 design-logic-circuit 技施各激式。此邏之入為現態 flip-flop 出（Q、Q'）與主入
3. **建出邏**：以組邏施各出式。Moore 者此邏只取態位。Mealy 者取態位與主入
4. **連路**：接激邏之出於 flip-flop D/JK/T 入。接出邏於主出
5. **加初化**：確電時路至已知初態。通常以異步重置強諸 flip-flop 為 0（或編之初態）

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**得：** 全門級網表，含 flip-flop、激邏、出邏、脈分、重置機，各信號一驅。

**敗則：** 若施有 flip-flop 外之反饋，組合環已入。同步時序之諸反饋必經 flip-flop。追犯徑，重路經 register。

### 第五步：以時序圖與態序模驗

證路於諸脈週正行：

1. **擇測序**：擇一入序以至少觸每態轉一次。序察者，含標序、半合、疊合、不合之段
2. **畫時序圖**：各脈週記——
   - 脈邊（升/降）
   - 主入值（於活脈邊取樣）
   - 現態（脈邊前 flip-flop 出）
   - 次態（脈邊後 flip-flop 出）
   - 出值（於出邏穩後有效）
3. **追態序**：驗態序合第二步之態圖。每轉循圖中之邊
4. **察時限**：驗——
   - **Setup**：入於活脈邊前穩至少 t_setup
   - **Hold**：入於活脈邊後穩至少 t_hold
   - **脈至出之延**：出於下游邏之 setup 減去脈週內穩
5. **重置驗**：證施重置驅路至初態不論當態

```markdown
## Timing Verification
| Cycle | Clock | Input | Present State | Next State | Output |
|-------|-------|-------|---------------|------------|--------|
| 0     | rst   | -     | -             | S0         | 0      |
| 1     | rise  | 1     | S0            | S1         | 0      |
| 2     | rise  | 1     | S1            | S2         | 0      |
| ...   | ...   | ...   | ...           | ...        | ...    |

- **All transitions match state diagram**: [Yes / No]
- **Setup/hold violations**: [None / list]
- **Reset verified**: [Yes / No]
```

**得：** 時序圖各週合轉表，諸週出正，無時違。

**敗則：** 若某態轉誤，追該現態/入合之激邏。若出誤而轉正，誤於出邏。若路入未期之態，察重置不全或自未用態碼缺轉。

## 驗

- [ ] 諸態已列且自初可達
- [ ] 態編已記含分表
- [ ] 轉表涵諸現態/入合
- [ ] 激式已減，用 don't-care
- [ ] 出式正施 Mealy 或 Moore 之義
- [ ] 各 flip-flop 之脈、重置、激入皆接
- [ ] 無 flip-flop 外之組合環
- [ ] 時序圖涵諸態轉至少一次
- [ ] 重置驅路至所記初態
- [ ] Setup 與 hold 之限皆滿

## 陷

- **轉不全**：忘指某態某入之行。缺轉常致路入未定或意外之態。恆定諸入合之行
- **未用態碼**：N flip-flop 有 2^N 可碼而或少於有效態。若路誤入未用碼（噪或啟），或鎖。恆自未用碼加轉至重置態或證不達
- **混 Mealy 與 Moore 出**：Mealy 中入變時出即變（自入至出之組合徑）。Moore 中出只於脈邊變。一設混二模致時險
- **異步入於同步路**：未同步於脈之外信違 setup/hold，致亞穩。恆以二 flip-flop 同步器過異步入
- **SR latch S=R=1 險**：同舉 S 與 R 令 SR latch 入未定。若用 SR，加邏保此合不發，或轉 D 或 JK flip-flop
- **多 flip-flop 設之脈偏**：若脈至諸 flip-flop 時異，或採他陳資料。初設假零偏；真件用脈樹合成

## 參

- `design-logic-circuit` -- 設組激與出之邏塊
- `simulate-cpu-architecture` -- 於 CPU 資料徑用時序塊（register、counter、控 FSM）
- `model-markov-chain` -- 有限態機與離散時 Markov 鏈共形式框
