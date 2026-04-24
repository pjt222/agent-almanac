---
name: design-logic-circuit
locale: wenyan-ultra
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

# 設邏輯電路

由功能規範轉組合邏輯電路至門級實：定入出、導最簡布爾式、映至門級圖、可選轉萬能門基（NAND 或 NOR）、以窮舉模擬對原真值表驗正確。

## 用

- 布爾函作實或模之門網
- 設標組合塊（加器、多工、解碼、比較）
- 任意門網轉 NAND 或 NOR 以符製造限
- 教或評數字邏輯由規至圖
- 備 build-sequential-circuit 或 simulate-cpu-architecture 所需之組合數路組件

## 入

- **必**：功能規—一：真值表、布爾式、入出行之口述、或標塊名（如「4 位漣波加器」）
- **必**：目門庫—無限（AND/OR/NOT）、僅 NAND、僅 NOR、或某標單元庫
- **可**：優化標—減門數、減傳延（關鍵路）、或減扇出
- **可**：最大扇入限（如僅 2 入門）
- **可**：永不發生之 don't-care 入

## 行

### 一：定電路功

合成前盡定電路介與行：

1. **入訊**：列諸入訊之名、位寬、有效域。多位入宜定位序（MSB 先或 LSB 先）
2. **出訊**：列諸出訊之名、位寬
3. **真值表**：書全真值表映每入組至出。入多者以代數或小項／大項集表
4. **Don't-care 條件**：識實不可發之入組（如 BCD 入 1010-1111）標為 don't-care
5. **時求**：記諸傳延限—組合電路無時鐘—此指關鍵路最差門延

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

得：全、無糊之規，諸合法入組映至唯一出值。

敗：規糊（缺例、同入異出）→求明。勿假 don't-care，除明言。

### 二：導最簡布爾式

用 evaluate-boolean-expression 以求諸出之最簡式：

1. **單出函**：各出位行 evaluate-boolean-expression 得最簡 SOP（或 POS，擇少門者）
2. **多出優**：諸出共子式→識共積項以提。減總門數，換略雜之路由
3. **XOR 辨**：掃真值表之 XOR/XNOR 模（K 圖之棋盤）→XOR 門於 NAND/NOR 實昂但標庫中高效
4. **記諸式**：書各出之最簡式，記字母數與積／和項數

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

得：各出最簡布爾式，多出電路共子式已識。

敗：式似非最簡（字母多於預期）→由 evaluate-boolean-expression 重行 K 圖或 Quine-McCluskey。變量 > 6 用 Espresso 或類啟發簡化。

### 三：映至門級圖

轉布爾式為門網：

1. **直映（SOP）**：各積項為多入 AND；積之和為 AND 饋之 OR。各補變需 NOT（或 NAND/NOR 吸收反）
2. **門配**：各門記：
   - 門類（AND、OR、NOT、XOR、NAND、NOR）
   - 入訊（以名或他門出）
   - 出訊名
   - 扇入（入數）
3. **扇入分**：門超最大扇入→分為小門之樹。如 2 入限下 4 入 AND→二 2 入 AND 饋第三 2 入 AND
4. **圖記**：以文字或結構表述網表

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

得：全門級網表，各出經門鏈回溯至原入，無浮（未連）之入或出。

敗：網表有懸線或反饋迴（組合電路不合）→重查映。各訊宜有唯一驅且各門入宜連原入或他門出。

### 四：轉萬能門基（可選）

轉電路為僅 NAND 或僅 NOR：

1. **僅 NAND 轉**：
   - 各 AND→NAND 接 NOT（NAND 同入）
   - 各 OR 用 De Morgan：`A + B = ((A')*(B'))' = NAND(A', B')` → NOT 諸入後 NAND
   - 各 NOT→NAND 二入相連：`A' = NAND(A, A)`
   - **氣泡推**：簡以消鄰反。二 NOT 串消。NAND 饋 NOT = AND
2. **僅 NOR 轉**：
   - 各 OR→NOR 接 NOT
   - 各 AND 用 De Morgan：`A * B = ((A')+(B'))' = NOR(A', B')`
   - 各 NOT→`NOR(A, A)`
   - 施氣泡推消反
3. **門數比**：記轉前後門數。僅 NAND／僅 NOR 常多門但簡製造（單門類）

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

得：功能等價電路僅用目門類，冗反已消於氣泡推。

敗：轉後反多於預期→重查氣泡推。常誤乃忘 NAND 與 NOR 於補下自對偶—由出至入連貫施 De Morgan 以避。

### 五：窮舉模擬驗

確電路於諸入組出正確：

1. **模擬法**：入至 16（65,536 組）窮舉；更大用針對性測向量（邊、界、隨機）
2. **傳值**：各入組，依拓撲序門門傳（無門於其入未備前算）
3. **對規比**：各出對步一真值表或預期函比。Don't-care 出可 0 或 1
4. **記果**：誌諸不符之入組與預期 vs 實際
5. **時析**（可選）：數任入至任出最長路之門級→乘單門延估最差傳延

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

得：諸向量皆過。電路功正且關鍵路深已書。

敗：某向量敗→對該入追訊路門門以得首門出錯。常因：線接錯門入、缺反、或 NAND/NOR 轉誤。

## 驗

- [ ] 諸入出已命名且位寬已定
- [ ] 真值表或小項表涵諸合法入組
- [ ] 布爾式最簡（由 K 圖或 Quine-McCluskey 驗）
- [ ] 網表諸門之諸入皆連且唯一出
- [ ] 電路無組合反饋迴
- [ ] 符扇入限（諸門在最大扇入內）
- [ ] NAND/NOR 轉（若行）保功能等價
- [ ] 氣泡推已施以消冗反
- [ ] 窮舉模擬過諸非 don't-care 入
- [ ] 關鍵路深已書

## 忌

- **組合反饋迴**：誤連門出回其入鏈→造順序素（鎖存），非組合→若需態，改用 build-sequential-circuit
- **NAND/NOR 轉忘反**：最常轉誤乃於 De Morgan 丟 NOT→常由出至入系統施氣泡推，勿隨手
- **超扇入而不分**：5 入 AND 不在 2 入庫中→分為平衡樹減傳延，勿線鏈
- **略 don't-cares**：簡化未用 don't-cares→電路大於必要→凡有 don't-cares 皆含
- **混門延與線延**：入門設計門延主。實 VLSI 中線延（互連電容）可勝門延。估時宜記此限
- **多出隱患**：諸出共門→變一出之邏可誤影共子式→改後驗諸出，勿僅被改者

## 參

- `evaluate-boolean-expression`
- `build-sequential-circuit`
- `simulate-cpu-architecture`
