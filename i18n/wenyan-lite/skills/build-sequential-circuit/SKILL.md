---
name: build-sequential-circuit
locale: wenyan-lite
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

# Build Sequential Circuit

辨所需記憶與狀類、構狀圖與轉表、為所擇之 flip-flop 類推激勵方程、以 flip-flop 與組合邏輯於閘級實作電路、以時序圖分析與狀序模擬驗正確，以設計時序邏輯電路。

## 適用時機

- 電路須憶過去輸入或於時鐘週期間持內態
- 設計計數器（二元、BCD、環、Johnson）、移位暫存器、或序列偵測器
- 自狀圖或正則表達式實作有限狀機（Mealy 或 Moore）
- 於組合數據徑加時控儲存元（暫存器、管線階）
- 為 simulate-cpu-architecture 技能備有態組件（暫存器檔、程序計數器、控制 FSM）

## 輸入

- **必要**：行為規——其一：狀圖、狀表、時序圖、欲偵之正則表達式、或欲時序行為之口述
- **必要**：時鐘特——邊緣觸（上升／下降）或電平敏；單時鐘或多相
- **選擇性**：Flip-flop 類之好（D、JK、T、或 SR）
- **選擇性**：重置類——同步、異步、或無
- **選擇性**：最大狀數或位寬之限
- **選擇性**：時序之限（設定時、保持時、最大時鐘頻）

## 步驟

### 步驟一：辨記憶與狀需

定電路須憶何，須幾異狀：

1. **狀列舉**：列電路須在之諸異狀。序列偵測器中，每狀代表朝目標序列之進。計數器中，每狀為一計數值。
2. **狀編碼**：擇狀之二元編碼。
   - **二元編碼**：N 狀用 ceil(log2(N)) 個 flip-flop。極小 flip-flop 數。
   - **獨熱編碼**：N 狀用 N 個 flip-flop，每狀一。簡次態邏輯而代價為更多 flip-flop。
   - **格雷碼編碼**：相鄰狀恰差一位。極小轉時之暫態閃爍。
3. **輸入與輸出之類**：辨主輸入（外信號）、主輸出、內狀變（flip-flop 輸出）。Mealy 機中輸出依狀與輸入。Moore 機中輸出惟依狀。
4. **Flip-flop 類之擇**：依設計之需擇之。
   - **D flip-flop**：最簡——次態等於 D 輸入。最佳預設之擇。
   - **JK flip-flop**：最彈——J=K=1 翻轉。宜於計數器。
   - **T flip-flop**：翻轉類——T=1 時變態。二元計數器之自然。
   - **SR 閂／flip-flop**：Set-Reset——避 S=R=1 之況。新設計少好之。

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

**預期：** 完整狀清單，編碼已擇、flip-flop 類已選，機已類為 Mealy 或 Moore。

**失敗時：** 若狀數自規不明，以過所有輸入序至電路記憶深度而列狀。若數超實用限（手設計超十六狀），考分解為更小互動之 FSM。

### 步驟二：構狀圖與轉表

將電路行為化為狀圖與等價之表：

1. **狀圖**：畫有向圖，其中：
   - 每節為狀，以狀名（Moore 機亦以輸出值）為標。
   - 每邊為轉，以輸入條件（Mealy 機亦以輸出值）為標。
   - 每狀對每可能輸入組合須有外邊——無隱式之「留」轉。
2. **轉表**：將圖化為表，列含當前狀、輸入、次態、輸出。
3. **可達查**：自初始／重置狀起，驗諸狀皆可達於某輸入序。不可達狀示設計誤或當為 don't-care。
4. **狀極小化**（選）：查等價狀——二狀等價若其對每輸入生同輸出且轉至等價次態。合等價狀以減 flip-flop 數。

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

**預期：** 完整狀轉表，覆每當前狀／輸入組合，諸狀皆可達於初態。

**失敗時：** 若轉表有缺，規不全。返需而解其曖昧。若有不可達狀，或加轉以達之，或移之並減狀編碼。

### 步驟三：推激勵方程

自轉表算 flip-flop 輸入方程（激勵方程）：

1. **編狀**：轉表中以二元編碼代狀名。每位位置對應一 flip-flop。
2. **建每 flip-flop 真值表**：每 flip-flop 建真值表，以當前狀位與輸入為輸入列、以所需 flip-flop 輸入為輸出列。
   - **D flip-flop**：D = 次態位（最簡）。
   - **JK flip-flop**：用激勵表：0->0 需 J=0,K=X；0->1 需 J=1,K=X；1->0 需 J=X,K=1；1->1 需 J=X,K=0。
   - **T flip-flop**：T = 當前狀 XOR 次態（位須變時 T=1）。
3. **極小化每方程**：對每 flip-flop 輸入函用 evaluate-boolean-expression（K 圖或代數簡化）。自不可達狀之 don't-care 與 JK 激勵表之 X 項可顯減表達。
4. **推輸出方程**：Moore 機中每輸出為當前狀位之函。Mealy 機中每輸出為當前狀位與輸入之函。

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

**預期：** 極小化之激勵方程與輸出方程，諸 don't-care 已用。

**失敗時：** 若激勵方程似過繁，重考狀編碼。異編碼（如由二元轉獨熱、或重指狀碼）可顯簡組合邏輯。試至少二編碼並比文字數。

### 步驟四：閘級實作

自 flip-flop 與組合邏輯閘建全電路：

1. **置 flip-flop**：每狀位實例化一 flip-flop。諸時鐘輸入皆連至系統時鐘。若指定，連重置輸入（異步重置直至 flip-flop 之 CLR/PRE 腳；同步重置為激勵邏輯之部）。
2. **建激勵邏輯**：以 design-logic-circuit 技能將每激勵方程實作為組合電路。此邏輯之輸入為當前狀 flip-flop 輸出（Q、Q'）與主輸入。
3. **建輸出邏輯**：將每輸出方程實作為組合邏輯。Moore 機中此邏輯只受狀位。Mealy 機中受狀位與主輸入。
4. **連電路**：將激勵邏輯輸出連至 flip-flop D/JK/T 輸入。將輸出邏輯連至主輸出。
5. **加初始化**：確電路於通電時達已知初態。此常意異步重置迫諸 flip-flop 為 0（或所編之初態）。

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**預期：** 完整閘級網表，含 flip-flop、激勵邏輯、輸出邏輯、時鐘分配、重置機制，每信號恰有一驅。

**失敗時：** 若實作 flip-flop 外有反饋，則已引組合環。同步時序電路中諸反饋須過 flip-flop。追犯路並改之過暫存器。

### 步驟五：以時序圖與狀序模擬驗

確電路跨多時鐘週期正確行為：

1. **擇測序**：擇輸入序使每狀轉至少運一次。序列偵測器中含目標序、部分匹、重疊匹、無匹之運。
2. **畫時序圖**：每時鐘週期記：
   - 時鐘邊緣（上升／下降）
   - 主輸入值（於活時鐘邊緣取樣）
   - 當前狀（時鐘邊緣前之 flip-flop 輸出）
   - 次態（時鐘邊緣後之 flip-flop 輸出）
   - 輸出值（輸出邏輯穩後有效）
3. **追狀序**：驗狀序合步驟二之狀圖。每轉當循圖中之一邊。
4. **查時序限**：驗：
   - **設定時**：輸入於活時鐘邊緣前至少穩 t_setup。
   - **保持時**：輸入於活時鐘邊緣後至少穩 t_hold。
   - **時鐘至輸出延**：輸出於時鐘週期減下游邏輯設定時內穩。
5. **重置驗**：確施重置時不論當前狀皆驅電路至初態。

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

**預期：** 時序圖中每週期合狀轉表，每週期輸出正，無時序違。

**失敗時：** 若某狀轉誤，追該當前狀與輸入組合之激勵邏輯。若輸出誤而轉正，錯於輸出邏輯。若電路入非意之狀，查重置不全或缺自未用狀碼之轉。

## 驗證

- [ ] 諸狀皆已列舉且自初態可達
- [ ] 狀編碼附指派表已錄
- [ ] 轉表覆每當前狀／輸入組合
- [ ] 激勵方程已極小化，諸 don't-care 已用
- [ ] 輸出方程正實作 Mealy 或 Moore 語義
- [ ] 每 flip-flop 之時鐘、重置、激勵輸入已連
- [ ] Flip-flop 外無組合反饋環
- [ ] 時序圖覆諸狀轉至少一次
- [ ] 重置驅電路至所錄之初態
- [ ] 設定與保持時之限已滿

## 常見陷阱

- **轉不全**：忘指每狀每輸入之行。缺轉常致電路入未定或非意之狀。恆定諸輸入組合之行為。
- **未用狀碼**：N 個 flip-flop 有 2^N 可能碼而或僅少有效狀。若電路偶入未用碼（因噪或通電），或鎖死。恆加自未用碼至重置狀之轉，或證其不可達。
- **混 Mealy 與 Moore 輸出**：Mealy 機中輸入變時輸出即變（輸入至輸出之組合路）。Moore 機中輸出僅於時鐘邊緣變。一設計中混二模致時序險。
- **同步電路之異步輸入**：未與時鐘同步之外信號或違設定／保持時，致亞穩。恆令異步輸入過雙 flip-flop 同步器後用於狀邏輯。
- **SR 閂之 S=R=1 險**：同時驅 Set 與 Reset 高置 SR 閂於未定。若用 SR 元，加邏輯保此組合不生，或轉 D 或 JK flip-flop。
- **多 flip-flop 設計之時鐘偏斜**：時鐘於不同 flip-flop 於不同時至，一 flip-flop 或取他之陳資。入門設計假零偏斜；實硬用時鐘樹合成。

## 相關技能

- `design-logic-circuit` — 設計組合激勵與輸出邏輯塊
- `simulate-cpu-architecture` — 於 CPU 數據徑中用時序塊（暫存器、計數器、控制 FSM）
- `model-markov-chain` — 有限狀機與離散時馬爾可夫鏈共形式框架
