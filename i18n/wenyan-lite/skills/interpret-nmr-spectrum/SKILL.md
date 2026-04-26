---
name: interpret-nmr-spectrum
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret nuclear magnetic resonance spectra (1H, 13C, DEPT,
  and 2D experiments) to elucidate molecular structure. Covers chemical shift
  assignment, coupling pattern analysis, integration, and correlation of
  multi-dimensional data into coherent structural proposals.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, nmr, chemical-shift, coupling, structure-elucidation
---

# 解讀 NMR 光譜

分析一維與二維 NMR 光譜以指派峰、定耦合關係，並擬議與所有所觀數據一致之分子結構片段。

## 適用時機

- 自 NMR 數據定未知有機化合物之結構
- 確合成產物之同一與純度
- 指派重疊信號之複雜光譜中之峰
- 關多 NMR 實驗（1H、13C、DEPT、COSY、HSQC、HMBC）為統一結構畫面
- 別區域異構、立體異構或構象異構

## 輸入

- **必要**：NMR 光譜數據（至少 1H 光譜附化學位移、多重性與積分）
- **必要**：分子式或分子量（自質譜或元素分析）
- **選擇性**：13C 與 DEPT 光譜（化學位移與多重性）
- **選擇性**：2D 光譜（COSY、HSQC、HMBC、NOESY/ROESY 相關表）
- **選擇性**：獲取所用溶劑與場強
- **選擇性**：已知結構約束（如反應起始物、IR 確之官能團）

## 步驟

### 步驟一：評實驗類型與獲取參數

解讀之前，立可得數據及其品質：

1. **識實驗類型**：錄可得光譜（1H、13C、DEPT-135、DEPT-90、COSY、HSQC、HMBC、NOESY、ROESY、TOCSY）。記觀之核與維度
2. **記獲取參數**：記譜儀頻率（如 400 MHz、600 MHz）、溶劑、溫度與參考標準
3. **識溶劑與參考峰**：用下表定位並排除溶劑信號

| Solvent | 1H Residual (ppm) | 13C Signal (ppm) |
|---------|-------------------|-------------------|
| CDCl3 | 7.26 | 77.16 |
| DMSO-d6 | 2.50 | 39.52 |
| D2O | 4.79 | -- |
| CD3OD | 3.31 | 49.00 |
| Acetone-d6 | 2.05 | 29.84, 206.26 |
| C6D6 | 7.16 | 128.06 |

4. **評光譜品質**：查基線平度、多重峰分辨，與信噪比。標任何偽影（自旋邊帶、13C 衛星、CDCl3 中 ~1.56 ppm 之水等溶劑雜質峰）

**預期：** 可得實驗之完整清單，已確溶劑/參考峰已排，並有品質評估。

**失敗時：** 若光譜信噪差或基線嚴重失真，記此限並謹慎行之。標不能可靠與噪別之峰。

### 步驟二：分析 1H 化學位移

以特徵位移範圍指派每 1H 信號於化學環境：

1. **列所有信號**：對每峰記化學位移（ppm）、多重性、耦合常數 J（Hz），與相對積分
2. **以化學位移區分類**：

| Range (ppm) | Environment | Examples |
|-------------|-------------|----------|
| 0.0--0.5 | Shielded (cyclopropane, M-H) | Cyclopropyl H, metal hydrides |
| 0.5--2.0 | Alkyl (CH3, CH2, CH) | Saturated aliphatic chains |
| 2.0--4.5 | Alpha to heteroatom/unsaturation | -OCH3, -NCH2, allylic, benzylic |
| 4.5--6.5 | Vinyl / olefinic | =CH-, =CH2 |
| 6.5--8.5 | Aromatic | ArH |
| 9.0--10.0 | Aldehyde | -CHO |
| 10.0--12.0 | Carboxylic acid | -COOH |
| 0.5--5.0 (broad, exchangeable) | OH, NH | Alcohols, amines, amides |

3. **數氫**：用積分比相對分子式以指派每信號之質子數。歸一於最簡整數比
4. **記可交換質子**：於 D2O 搖中失之信號（OH、NH、COOH）為可交換。記其存與約位移

**預期：** 所有 1H 信號之表：位移、多重性、J 值、積分（H 數），與初步環境指派。

**失敗時：** 若積分比不加為預期之總質子數，查重疊信號、藏於基線之寬峰，或錯分子式。

### 步驟三：定耦合模式與 J 值

自裂分模式抽連接性信息：

1. **識多重性**：指派每信號為單峰（s）、雙峰（d）、三峰（t）、四峰（q）、雙雙峰（dd）等。對複雜多重峰（m），估耦合夥伴數
2. **測耦合常數**：抽 Hz 之 J 值。匹配互耦合（若 H_A 與 H_B 以 J = 7.2 Hz 耦合，H_B 必對 H_A 示同 J）
3. **以類分 J 值**：

| J Range (Hz) | Coupling Type |
|--------------|---------------|
| 0--3 | Geminal (2J) or long-range (4J, 5J) |
| 6--8 | Vicinal aliphatic (3J) |
| 8--10 | Vicinal with restricted rotation |
| 10--17 | Vicinal olefinic cis (6--12) or trans (12--18) |
| 0--3 | Aromatic meta |
| 6--9 | Aromatic ortho |

4. **繪耦合網**：將互耦合質子分於自旋系統。每自旋系統代分子之一連接片段
5. **評屋頂效應**：於 AB 型模式，雙峰之內線較外線強，示化學位移近

**預期：** 所有耦合常數已測並互匹配，自旋系統已識，耦合類型已分。

**失敗時：** 若多重峰過複而不能以一級規則析，記高級模式。思重疊信號或強耦合核（delta-nu/J < 10）產非一級模式需模擬。

### 步驟四：分析 13C 與 DEPT 數據

自 13C 實驗定碳類型與數：

1. **數異 13C 信號**：比 13C 峰數於分子式。較預期少示分子對稱
2. **以化學位移分類**：

| Range (ppm) | Carbon Type | Examples |
|-------------|-------------|----------|
| 0--50 | sp3 Alkyl | CH3, CH2, CH, quaternary C |
| 50--100 | Alpha to O or N | -OCH3, -OCH2, anomeric C |
| 100--150 | Aromatic / vinyl | =CH-, ArC |
| 150--170 | Heteroaromatic / enol / imine | C=N, C-O aromatic |
| 170--185 | Carboxyl / ester / amide | -COOH, -COOR, -CONR2 |
| 185--220 | Aldehyde / ketone | -CHO, >C=O |

3. **用 DEPT 編輯**：用 DEPT-135（CH 與 CH3 向上，CH2 向下，季碳缺）與 DEPT-90（僅 CH）定每碳之附氫數
4. **算不飽和度**：DBE = (2C + 2 + N - H - X) / 2。比光譜所暗示之 pi 鍵與環數

**預期：** 每 13C 信號以類（CH3、CH2、CH、C）與化學環境分類，不飽和度已算並與所觀官能團一致。

**失敗時：** 若 DEPT 數據不可得，自 HSQC 相關（步驟五）推氫附。若碳數不合分子式，查重合信號或藏於噪之季碳。

### 步驟五：關聯 2D NMR 數據

用二維實驗建連接性：

1. **COSY（1H-1H 相關）**：識 2--3 鍵內之質子。繪交叉峰以確並擴步驟三之自旋系統
2. **HSQC（1H-13C 一鍵）**：指派每質子於其直連碳。此明確連 1H 與 13C 指派
3. **HMBC（1H-13C 長程）**：識 2--3 鍵 H-C 相關。HMBC 於跨季碳、雜原子與缺直 H-C 鍵之羰基連片段甚關鍵
4. **NOESY/ROESY（穿空間）**：識空間近（< 5 埃）之質子不論連接性。用於立體化學指派與構象分析
5. **建片段連接性**：用 HMBC 相關將 COSY 之自旋系統連為更大片段。每 HMBC 交叉峰代 H 至 C 之 2--3 鍵路徑

**預期：** 連接性圖連所有自旋系統為連貫分子骨架，並於可得處有 NOE 之立體化學信息。

**失敗時：** 若 2D 數據不全或模糊，記何連接暫定。或需多結構提議。優先以 HMBC 相關組片段，因其橋 COSY 不能之缺。

### 步驟六：擬並驗結構

合片段為完整結構提議：

1. **合片段**：用 HMBC 相關與不飽和度約束連步驟二至五之結構片段
2. **查分子式**：驗擬議結構恰合分子式（原子數、不飽和度）
3. **反預測化學位移**：對擬議結構預測 1H 與 13C 化學位移。比預測於觀值；偏差 > 0.3 ppm（1H）或 > 5 ppm（13C）當再審
4. **驗所有相關**：確每觀之 COSY、HSQC 與 HMBC 相關皆由擬議結構解。未解交叉峰示誤或雜質
5. **思替代**：若多結構合數據，列可解模糊之區別實驗或相關
6. **指派立體化學**：用 NOE 數據、J 值分析（Karplus 二面角關係），與已知構象偏好指派相對（可能處絕對）立體化學

**預期：** 單一最合結構提議，所有 NMR 數據已解，或候選排序清單並有區別之計劃。

**失敗時：** 若無單一結構解所有數據，查：化合物混合（非整數積分比之多峰）、動態過程（構象交換之寬峰），或順磁雜質（異常寬化）。若多結構同等可行，再審分子式。

## 驗證

- [ ] 所有溶劑與參考峰已識別並於解讀中排除
- [ ] 每 1H 信號已指派化學位移區、多重性、J 值與積分
- [ ] 耦合常數互等（耦合夥伴間匹配）
- [ ] 13C 信號已以 DEPT 多重性與化學位移區分類
- [ ] 不飽和度已算並與擬議結構一致
- [ ] 2D 相關（COSY、HSQC、HMBC）皆由結構提議解
- [ ] 擬議結構恰合分子式
- [ ] 反預測化學位移於容差內合觀值
- [ ] 於可用處以 NOE 與/或 J 值分析應對立體化學

## 常見陷阱

- **忽溶劑峰**：常溶劑產可與分析物峰重之信號。解讀之前恒識並排溶劑殘、水與油脂峰
- **於二級模式強以一級分析**：強耦合核（相對 J 之化學位移差小）產失真多重峰，不能以簡單 n+1 規則解。認屋頂效應與非二項強度模式為指示
- **忽可交換質子**：OH 與 NH 信號可寬、因濃度/溫而移，或於質子溶劑中缺。D2O 搖實驗明何信號可交換
- **假所有 13C 峰可見**：季碳有長弛豫時與低強度。於短獲取光譜中可缺。HMBC 相關常為檢之唯一途
- **誤解 HMBC 偽影**：HMBC 光譜可示一鍵偽影（誤指派為長程相關）與弱四鍵相關。以 HSQC 交叉查以濾一鍵穿漏
- **忽對稱**：若觀之 13C 峰數少於分子式所預，分子恐有對稱元素。於擬結構之前計此

## 相關技能

- `interpret-ir-spectrum` — 識官能團以約 NMR 基之結構提議
- `interpret-mass-spectrum` — 定分子式與裂片以交叉驗證
- `interpret-uv-vis-spectrum` — 刻畫發色團與共軛程度
- `interpret-raman-spectrum` — 獲對稱模式之互補振動數據
- `plan-spectroscopic-analysis` — 於數據獲取前擇並排序光譜技術
