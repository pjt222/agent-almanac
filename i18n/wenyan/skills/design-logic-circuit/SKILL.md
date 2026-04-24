---
name: design-logic-circuit
locale: wenyan
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

# 邏輯電路之設

將功能規格化為組合邏輯電路：定入出、推最簡布爾式、映為閘級電路、必要時換成 NAND 或 NOR 通用閘基、以窮盡模擬驗其對原真值表之正確。

## 用時

- 將布爾函數實為實體或模擬之閘網
- 設標準組合塊（加法器、多路選擇器、解碼器、比較器）
- 為製造之限將閘網換為純 NAND 或純 NOR 式
- 教學或評議從規格至電路之數字邏輯設計
- 為 build-sequential-circuit 或 simulate-cpu-architecture 備組合數據通路部件

## 入

- **必要**：功能規格——其一為真值表、布爾式、入出行為之言述，或標準塊名（如「4 位漣波進位加法器」）
- **必要**：目標閘庫——不限（AND/OR/NOT）、純 NAND、純 NOR，或特定標準單元庫
- **可選**：優化目標——減閘數、減傳播延遲（臨界路徑）或減扇出
- **可選**：最大扇入之限（如僅 2 入閘）
- **可選**：永不出現之入組合可作 don't-care

## 法

### 第一步：明電路功能

合成之前，全定電路之界面與行為：

1. **入訊**：列諸入訊之名、位寬、有效範圍。多位入須指位序（MSB 先或 LSB 先）
2. **出訊**：列諸出訊之名與位寬
3. **真值表**：書全真值表，每入組合對應之出。入多時以代數或 minterm／maxterm 集表之
4. **Don't-care 條件**：識實際不可出現之入組合（如 BCD 入 1010-1111）記為 don't-care
5. **時序之要**：記傳播延遲之限；組合電路無時鐘——此指臨界路徑最壞閘延遲

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

**得：** 完整無歧之規格，每合法入組合皆對應唯一出值。

**敗則：** 規格有歧（如缺例、同入出相衝）則請求澄清。未明指之入勿擅作 don't-care。

### 第二步：推最簡布爾式

用 evaluate-boolean-expression 技為各出取最簡式：

1. **單出函數**：每出位用 evaluate-boolean-expression 取最簡 SOP（或 POS，擇閘少者）
2. **多出優化**：多出共有子式者，識共積項而提之。以略增佈線換閘數之減
3. **XOR 察**：察真值表中 XOR/XNOR 之象（K 圖中棋盤狀）。XOR 於 NAND/NOR 純實現甚貴，然標準庫中高效
4. **記諸式**：為各出記最簡式，並記文字數與項數

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

**得：** 每出之最簡布爾式，多出電路之共有子式已識。

**敗則：** 式不似最簡（文字數多於該函數複雜度所應有）則重行 evaluate-boolean-expression 中之 K 圖或 Quine-McCluskey 步。變量逾 6 時用 Espresso 或類啟發式最簡化器。

### 第三步：映為閘級電路

將布爾式化為閘網：

1. **直映 (SOP)**：每積項成多入 AND 閘。諸積之和由 OR 閘饋之。每補變量需 NOT 閘（或以 NAND/NOR 吸收反相）
2. **閘分配**：每閘記：
   - 閘類（AND、OR、NOT、XOR、NAND、NOR）
   - 入訊（按名或由他閘之出）
   - 出訊名
   - 扇入（入數）
3. **扇入分解**：閘逾扇入限則分為小閘之樹。如 4 入 AND 於 2 入限下化為兩 2 入 AND 饋第三 2 入 AND
4. **電路表達**：以文本式繪電路或以結構化格式述網表

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

**得：** 完整閘級網表，每出可循閘鏈溯回主入，無浮接入或出。

**敗則：** 網表有懸線或反饋環（組合電路不許）則重察映射。每訊須有唯一驅動，每閘入須接主入或他閘出。

### 第四步：換通用閘基（可選）

將電路換為純 NAND 或純 NOR 閘：

1. **純 NAND 換**：
   - AND 換為 NAND 後接 NOT（入相連之 NAND）
   - OR 用 De Morgan 換：`A + B = ((A')*(B'))' = NAND(A', B')`，先入作 NOT 再 NAND
   - NOT 換為兩入相連之 NAND：`A' = NAND(A, A)`
   - **氣泡推移**：消鄰連反相以簡化。兩串聯 NOT 相消。NAND 饋 NOT 等同於 AND。
2. **純 NOR 換**：
   - OR 換為 NOR 後接 NOT
   - AND 用 De Morgan 換：`A * B = ((A')+(B'))' = NOR(A', B')`
   - NOT 換為 `NOR(A, A)`
   - 行氣泡推移以消反相
3. **閘數比較**：記換前換後之閘數。純 NAND 與純 NOR 常用閘更多然簡化製造（芯上單類閘）

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

**得：** 功能等價之電路，僅用目標閘類，冗餘反相已由氣泡推移消去。

**敗則：** 換後電路反相多於預期則重審氣泡推移。常錯為忘 NAND 與 NOR 於補下之自對偶——自出至入一貫行 De Morgan 可避之。

### 第五步：以窮盡模擬驗之

察電路於諸可能入皆出正確：

1. **模擬法**：入不逾 16（65,536 組合）者窮舉模擬。更大者用含角例、邊界、隨機樣本之針對性測試向量
2. **傳值**：每入組合逐閘從入至出傳訊值，守拓撲序（閘之入未備前不評其）
3. **比對規格**：每出與第一步真值表或預期函數比對。Don't-care 之出 0 或 1 皆可
4. **記結果**：記所有不符，附失敗之入組合與預期實際之出
5. **時序分析**（可選）：計從任入至任出最長路徑之閘層數。乘以單閘延遲以估最壞傳播延遲

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

**得：** 諸測試向量皆過。電路功能正確，臨界路徑深度已記。

**敗則：** 某向量失敗則逐閘追訊於該入組合以找首出錯之閘。常因：線接錯閘入、缺反相、NAND/NOR 換算之誤。

## 驗

- [ ] 諸入出已命名且定位寬
- [ ] 真值表或 minterm 集覆諸合法入組合
- [ ] 布爾式已最簡（以 K 圖或 Quine-McCluskey 驗）
- [ ] 網表每閘諸入皆接且有唯一出
- [ ] 電路中無組合反饋環
- [ ] 扇入之限已守（諸閘皆在最大扇入內）
- [ ] NAND/NOR 換（若行）保功能等價
- [ ] 已行氣泡推移以消冗餘反相
- [ ] 窮盡模擬於非 don't-care 入組合皆過
- [ ] 臨界路徑深度已記

## 陷

- **組合反饋環**：誤將閘出連回其入鏈成時序元（鎖存器）而非組合電路。須狀態者用 build-sequential-circuit 技
- **忘 NAND/NOR 換中反相**：最常錯為 De Morgan 中丟 NOT 閘。恆自出至入系統行氣泡推移，勿隨機為之
- **逾扇入而不分解**：2 入庫無 5 入 AND 閘。宜分為平衡樹以減傳播延遲，非線性鏈
- **略 don't-care**：最簡化時不用 don't-care 致電路大於所需。有之則盡用之
- **混淆閘延遲與線延遲**：入門設計中閘延遲為主。實 VLSI 中線延遲（互連電容）或逾閘延遲。估時序時須記此限
- **多出隱患**：多出共閘時，改一出邏輯或波及共子式。每改須驗諸出，非僅所改者

## 參

- `evaluate-boolean-expression` — 推本技所用之最簡布爾式
- `build-sequential-circuit` — 加狀態元（觸發器）以成時序電路
- `simulate-cpu-architecture` — 以組合塊（ALU、多路選擇器、解碼器）作數據通路部件
