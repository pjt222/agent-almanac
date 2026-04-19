---
name: build-sequential-circuit
locale: wenyan-ultra
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

# 建序路

設序路—識記與態類、建態圖與轉表、導所擇 FF 類之激方、以 FF 與組合邏輯於門級施、以時圖析與態序模驗正。

## 用

- 路當記昔入或於時週間守內態
- 設計計（binary、BCD、ring、Johnson）、移寄、序偵
- 自態圖或正表施有限態機（Mealy 或 Moore）
- 加時控存於組合資路（寄、管階）
- 備態件為 simulate-cpu-architecture 技（寄檔、程計、控 FSM）

## 入

- **必**：行規—一於：態圖、態表、時圖、當偵之正表、或欲序行之述
- **必**：時特—邊觸（升/降）或級敏；單時或多相
- **可**：FF 類偏（D、JK、T、SR）
- **可**：重置類—同步、異步或無
- **可**：最多態或位寬限
- **可**：時束（setup、hold、最大時頻）

## 行

### 一：識記與態需

定路當記何與需幾異態：

1. **態列**：列諸路必居之異態。序偵中每態示於標序中之進。計中每態為一計值。
2. **態編**：擇態之二進編。
   - **二進編**：N 態用 ceil(log2(N)) FF。最少 FF 計。
   - **One-hot 編**：N 態用 N FF，一態一。簡次態邏於多 FF 之價。
   - **Gray 編**：鄰態異於一位。轉時減瞬閃。
3. **入出分**：識主入（外號）、主出、內態變（FF 出）。Mealy 機出依態與入。Moore 機出唯依態。
4. **FF 類擇**：依設需。
   - **D FF**：最簡—次態為 D 入。佳默擇。
   - **JK FF**：最活—J=K=1 翻。計之宜。
   - **T FF**：翻類—T=1 時變態。二進計自然。
   - **SR 閂/FF**：Set-Reset—避 S=R=1。新設罕宜。

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

**得：** 全態錄附所擇編、所擇 FF 類、機分為 Mealy 或 Moore。

**敗：** 規中態計不明→循諸入序至路記深以列態。計過實限（手設過 16 態）→宜分為小互 FSM。

### 二：建態圖與轉表

以態圖與等表正路行：

1. **態圖**：繪有向圖：
   - 每節為態，以態名與（Moore 機）出值標
   - 每邊為轉，以入條與（Mealy 機）出值標
   - 每態必有每可能入組之出邊—無隱「留」轉
2. **轉表**：圖轉表，列為當態、入、次態、出。
3. **可達察**：自初/重置態始→驗諸態可經某入序達。不可達態示設誤或視為 don't-care。
4. **態小化**（可選）：察等態—兩態若每入同出且轉至等次態則等。合等態以減 FF 計。

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

**得：** 全轉表涵每當態/入組，諸態自初可達。

**敗：** 轉表條缺→規不全。返需而解模糊。不可達態存→或加轉以達，或除而減態編。

### 三：導激方

自轉表算 FF 入方（激方）：

1. **編態**：轉表中態名以二進編代。每位應一 FF。
2. **建每 FF 真表**：每 FF 造真表—當態位與入為入列，所需 FF 入為出列。
   - **D FF**：D = 次態位（最簡）
   - **JK FF**：用激表：0->0 需 J=0,K=X；0->1 需 J=1,K=X；1->0 需 J=X,K=1；1->1 需 J=X,K=0
   - **T FF**：T = 當態 XOR 次態（T=1 時位必變）
3. **小化每方**：施 evaluate-boolean-expression（K 圖或代數簡）於每 FF 入函。不可達態與 JK 激表 X 之 don't-care 可顯減表。
4. **導出方**：Moore 機→每出為當態位之函。Mealy 機→每出為當態位與入之函。

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

**得：** 每 FF 之小化激方與每主出之出方，諸 don't-care 已用。

**敗：** 激方似過繁→重思態編。異編（如自二進換 one-hot，或重賦態碼）可顯簡組合邏輯。試至少兩編而較字計。

### 四：門級施

自 FF 與組合門建全路：

1. **置 FF**：每態位實 FF 一。諸時入連系時。若述重置→連重置入（異步重置直連 FF CLR/PRE；同步重置為激邏一分）
2. **建激邏**：每激方以 design-logic-circuit 技為組合路施。此邏輯入為當態 FF 出（Q、Q'）與主入。
3. **建出邏**：每出方為組合邏。Moore 機→唯取態位。Mealy 機→取態位與主入。
4. **連路**：激邏出連 FF D/JK/T 入。出邏連主出。
5. **加初**：確路通電達知初態。典乃異步重置迫諸 FF 為 0（或編之初態）

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**得：** 全門級網表附 FF、激邏、出邏、時布、重置，每號有且唯有一驅。

**敗：** 施有 FF 外之回饋→組合迴現。同步序路諸回饋必經 FF。循犯路而改經寄。

### 五：以時圖與態序模驗

證路跨諸時週正行：

1. **擇試序**：擇入序至少行每態轉一次。序偵中含標序、部分合、疊合、不合行。
2. **繪時圖**：每時週錄：
   - 時邊（升/降）
   - 主入值（活時邊取）
   - 當態（時邊前 FF 出）
   - 次態（時邊後 FF 出）
   - 出值（出邏穩後有效）
3. **循態序**：驗態序合步二之態圖。每轉當循圖中一邊。
4. **察時束**：驗：
   - **Setup**：活時邊前入穩至少 t_setup
   - **Hold**：活時邊後入穩至少 t_hold
   - **時至出延**：出於時週減下游邏之 setup 內穩
5. **重置驗**：確施重置驅路至初態，無論當態。

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

**得：** 時圖每週合轉表，出每週正，無時違。

**敗：** 態轉誤→循其當態/入組之激邏。出誤而轉正→誤於出邏。路入意外態→察重置未全或未用態碼缺轉。

## 驗

- [ ] 諸態列且自初態可達
- [ ] 態編錄附賦表
- [ ] 轉表涵每當態/入組
- [ ] 激方以 don't-care 小化
- [ ] 出方正施 Mealy 或 Moore 義
- [ ] 每 FF 之時、重置、激入已連
- [ ] 無 FF 外之組合回饋
- [ ] 時圖涵諸態轉至少一次
- [ ] 重置驅路至錄之初態
- [ ] setup 與 hold 束已滿

## 忌

- **轉不全**：忘定每態每入何行。轉缺常致路入未定或意外態。諸入組必皆定。
- **未用態碼**：N FF 有 2^N 可能碼而或少於有效態。路誤入未用碼（因噪或起）→或鎖。諸未用碼必加轉至重置態或證不可達。
- **混 Mealy 與 Moore 出**：Mealy 機入變出即變（入至出之組合路）。Moore 機出唯於時邊變。一設混兩→時險。
- **異步入於同步路**：未同時之外號或違 setup/hold 致亞穩。異步入必經二 FF 同步器而後用於態邏。
- **SR 閂 S=R=1 險**：Set 與 Reset 同高→SR 閂於未定態。若用 SR→加邏保此組不現，或換 D 或 JK FF。
- **多 FF 之時偏**：時於異 FF 異時達→一 FF 或取他之舊資。入設假零偏；實硬用時樹合。

## 參

- `design-logic-circuit` — 設組合激與出邏塊
- `simulate-cpu-architecture` — CPU 資路用序塊（寄、計、控 FSM）
- `model-markov-chain` — FSM 與離時馬氏鏈共正框
