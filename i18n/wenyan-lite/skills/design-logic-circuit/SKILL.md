---
name: design-logic-circuit
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design combinational logic circuits from a functional specification through
  gate-level implementation. Covers AND, OR, NOT, XOR, NAND, NOR gates;
  NAND/NOR universality conversions; and standard building blocks including
  multiplexers, decoders, half/full adders, and ripple-carry adders. Use when
  translating a Boolean function or truth table into a hardware-realizable
  gate network and verifying it by exhaustive simulation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: intermediate
  language: multi
  tags: digital-logic, combinational-circuits, logic-gates, nand-universality, adders
---

# 設計邏輯電路

由功能規格轉為門級實現之組合邏輯電路：定輸入輸出，導出最簡布林式，映射至門級電路圖，視需換至通用門基（NAND 唯或 NOR 唯），末以窮舉模擬對照原真值表驗其正確。

## 適用時機

- 將布林函數實作為物理或模擬之門網
- 設計標準組合積木（加法器、多路選擇器、解碼器、比較器）
- 因製造限制，將任意門網換為 NAND 唯或 NOR 唯形式
- 由規格至電路圖，以教或審數位邏輯設計
- 為 build-sequential-circuit 或 simulate-cpu-architecture 所需之組合資料通路備料

## 輸入

- **必要**：功能規格——擇其一：真值表、布林表達式、輸入輸出行為之文字描述、標準模塊名（如「4 位漣波進位加法器」）
- **必要**：目標門庫——不限（AND/OR/NOT）、NAND 唯、NOR 唯，或特定標準單元庫
- **選擇**：優化目標——最少門數、最短傳播延遲（關鍵路徑）、或最低扇出
- **選擇**：最大扇入限制（如唯 2 輸入門）
- **選擇**：永不發生之輸入組合（don't-care）

## 步驟

### 步驟一：定電路功能

於合成前備齊電路之介面與行為：

1. **輸入信號**：列所有輸入信號之名、位寬、有效範圍。多位輸入須定位序（MSB 先或 LSB 先）。
2. **輸出信號**：列所有輸出信號之名與位寬。
3. **真值表**：寫全真值表，映每一輸入組合至對應輸出。輸入甚多時，代以代數式或 minterm/maxterm 集。
4. **Don't-care 條件**：辨實務中不發生之輸入組合（如 BCD 之 1010-1111），標為 don't-care。
5. **時序要求**：記傳播延遲之限。組合電路無時鐘——此「時序」指關鍵路徑上最壞門延遲。

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

**預期：** 規格完備無歧義，每一合法輸入組合恰映至一輸出值。

**失敗時：** 規格有歧（如漏案、同輸入出衝突輸出）時，請澄清。未經明示莫以未指定輸入為 don't-care。

### 步驟二：導最簡布林式

用 evaluate-boolean-expression 技能為每輸出得最簡式：

1. **單輸出函數**：為每輸出位應用 evaluate-boolean-expression 得最簡 SOP（或 POS，視何者門數少）。
2. **多輸出優化**：多輸出有共用子式者，辨可共用之積項以抽之。總門數減，然佈線稍繁。
3. **XOR 偵測**：於真值表中（K-圖之棋盤格）查 XOR/XNOR 模式。XOR 門於 NAND/NOR 唯實現中成本高，於標準庫中則效。
4. **記式**：錄每輸出之最簡式，計其字面數與積/和項數。

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

**預期：** 每輸出皆有最簡布林式，多輸出電路之共用子式已辨。

**失敗時：** 式似非最簡（字面多於函數複雜度所應）時，重行 evaluate-boolean-expression 中 K-圖或 Quine-McCluskey 之步。變數逾 6 時用 Espresso 等啟發式簡化器。

### 步驟三：映至門級電路圖

將布林式轉為門網：

1. **直接映射（SOP）**：每積項為多輸入 AND 門。諸積之和由 OR 門聚 AND 之輸出。每取反變數需 NOT 門（或以 NAND/NOR 吸之）。
2. **門指派**：每門記：
   - 門類（AND、OR、NOT、XOR、NAND、NOR）
   - 輸入信號（依名或另一門之輸出）
   - 輸出信號名
   - 扇入（輸入數）
3. **扇入分解**：門之扇入逾限者，分解為小門之樹。例如 4 輸入 AND 於 2 輸入限制下為二 2 輸入 AND 饋第三 2 輸入 AND。
4. **電路圖記法**：以文字記法繪電路，或以結構化格式述其網表。

```markdown
## Gate-Level Netlist
| Gate ID | Type | Inputs       | Output | Fan-in |
|---------|------|-------------|--------|--------|
| G1      | NOT  | A           | A'     | 1      |
| G2      | AND  | A', B       | w1     | 2      |
| G3      | AND  | A, C        | w2     | 2      |
| G4      | OR   | w1, w2      | F      | 2      |

- **Total gates**: [count]
- **Critical path depth**: [number of gate levels from input to output]
```

**預期：** 網表完備，每輸出可經門鏈溯至原輸入，無浮空（未接）之輸入或輸出。

**失敗時：** 網表有懸線或反饋環（組合電路所不許）時，重審映射。每信號恰有一驅動，每門輸入須接至原輸入或他門輸出。

### 步驟四：換為通用門基（選擇性）

換電路為唯用 NAND 或唯用 NOR 門：

1. **NAND 唯換法**：
   - 每 AND 門換為 NAND 繼之以 NOT（NAND 輸入共接）。
   - 每 OR 門用 De Morgan：`A + B = ((A')*(B'))' = NAND(A', B')`，故輸入先 NOT 再 NAND。
   - 每 NOT 門換為兩輸入共接之 NAND：`A' = NAND(A, A)`。
   - **氣泡推移**：相鄰取反相消以簡之。兩 NOT 相繼相消。NAND 饋 NOT 即 AND。
2. **NOR 唯換法**：
   - 每 OR 門換為 NOR 繼之以 NOT。
   - 每 AND 門用 De Morgan：`A * B = ((A')+(B'))' = NOR(A', B')`。
   - 每 NOT 門換為 `NOR(A, A)`。
   - 施氣泡推移以相消取反。
3. **門數比較**：錄換前換後之門數。NAND 唯與 NOR 唯之實現常用門較多，然製造較易（晶片上唯一種門）。

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

**預期：** 所成電路功能等同，唯用目標門類，冗取反已由氣泡推移消之。

**失敗時：** 換後電路取反多於所應時，重審氣泡推移之步。常誤為忘 NAND 與 NOR 於取反下自對偶——由輸出向輸入一貫施 De Morgan 可免。

### 步驟五：窮舉模擬驗證

驗電路於每可能輸入皆出正確值：

1. **模擬法**：輸入至 16 位（65,536 組合）者，窮舉模擬之。更大者用定向測試向量，涵蓋角例、邊界條件、隨機取樣。
2. **傳值**：每輸入組合，依拓撲序由輸入至輸出逐門傳信號值（門不早於其輸入就緒而估）。
3. **對照規格**：據步驟一之真值表或所期函數驗每輸出。Don't-care 輸出或 0 或 1 皆可。
4. **記結果**：錄任何不符，述失敗之輸入組合及期值對實值。
5. **時序分析**（選擇性）：數任一輸入至任一輸出最長路之門層。乘以每門延遲以估最壞傳播延遲。

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

**預期：** 所有測試向量皆過。電路功能正確，關鍵路徑深度已錄。

**失敗時：** 某向量失敗時，逐門追該輸入之信號路徑，尋第一出誤值之門。常因：線接錯門輸入、漏取反、NAND/NOR 換法有誤。

## 驗證

- [ ] 所有輸入輸出皆命名，位寬已定
- [ ] 真值表或 minterm 列涵蓋所有合法輸入組合
- [ ] 布林式為最簡（經 K-圖或 Quine-McCluskey 驗之）
- [ ] 網表中每門所有輸入皆接，恰一輸出
- [ ] 電路中無組合反饋環
- [ ] 扇入限制皆遵（所有門於最大扇入內）
- [ ] NAND/NOR 換法（若行之）保持功能等同
- [ ] 氣泡推移已施以消冗取反
- [ ] 窮舉模擬對所有非 don't-care 輸入組合皆通過
- [ ] 關鍵路徑深度已錄

## 常見陷阱

- **組合反饋環**：誤接門輸出回至其自身輸入鏈，即成時序元件（鎖存器），非組合電路。若需狀態，改用 build-sequential-circuit 技能。
- **NAND/NOR 換法中遺取反**：最常之換法誤為 De Morgan 變換中丟 NOT。由輸出向輸入一貫施氣泡推移，勿以臨時處置。
- **扇入逾限而未分解**：5 輸入 AND 於 2 輸入庫中無。分解為平衡樹以減傳播延遲，非線性鏈。
- **忽 don't-care**：簡化時不用 don't-care 條件，則電路大於所需。有之則必用。
- **混淆門延遲與線延遲**：入門設計中以門延遲為主。實 VLSI 中線延遲（互連電容）可逾門延遲。估時序時須註此限。
- **多輸出之冒險**：多輸出共用門時，改一輸出之邏輯可誤傷共用子式。改動後驗所有輸出，非唯所改者。

## 相關技能

- `evaluate-boolean-expression` -- 導本技能所用之最簡布林式
- `build-sequential-circuit` -- 加狀態元件（觸發器）以成時序電路
- `simulate-cpu-architecture` -- 以組合積木（ALU、多路選擇器、解碼器）為資料通路元件
