---
name: plan-spectroscopic-analysis
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a comprehensive spectroscopic analysis campaign by defining the
  analytical question, assessing sample characteristics, selecting appropriate
  techniques using a decision matrix, planning sample preparation for each
  technique, sequencing analyses from non-destructive to destructive, and
  defining success criteria with a cross-validation strategy.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, analytical-planning, technique-selection, sample-preparation
---

# 規劃光譜分析

設計光譜分析活動，擇正確之技術、有效排序，並定明確成功準則，以回答關於樣品之特定分析問題。

## 適用時機

- 對未知化合物展開調查，須擇用何種光譜技術
- 為求保留樣品供破壞性方法之用，最佳化分析順序
- 申請儀器時間之前先規劃樣品製備需求
- 確保互補技術間之交叉驗證
- 資源有限時，編排儀器時間並排定技術之優先序
- 訓練新分析人員作系統化之分析規劃

## 輸入

- **必要**：分析問題（結構鑑定、定量、純度評估、官能基篩查或反應監測）
- **必要**：樣品描述（物態、約略量、已知或推測之化合物類別）
- **選擇性**：可用儀器及其能力
- **選擇性**：預算與時間限制
- **選擇性**：安全資料（毒性、反應性、揮發性、光敏性）
- **選擇性**：先前之分析資料（若有）

## 步驟

### 步驟一：界定分析問題

擇技術前，先釐清所需之資訊：

1. **歸類問題類型**：
   - **結構鑑定**：判定未知化合物之完整分子結構。需最廣泛之技術組合。
   - **結構確認**：驗證已知化合物與預期結構相符。所需技術較少，聚焦於診斷特徵。
   - **定量分析**：判定已知分析物之濃度或量。需校正與線性良好之技術（UV-Vis、附內標之 NMR）。
   - **純度評估**：判定樣品是否含雜質，並予鑑定。需高靈敏度與分離能力。
   - **官能基篩查**：辨明所含官能基而不全結構鑑定。IR 通常即足。
   - **反應監測**：隨時間追蹤反應進程。需速度且與反應條件相容（原位 IR、Raman 或 UV-Vis）。

2. **訂成功準則**：明確陳述何為令人滿意之答案。結構鑑定：「與所有光譜資料一致之單一結構提案。」定量：「以 < 5% 相對誤差判定濃度。」

3. **盤點已知**：彙整關於樣品之既有資訊（元素分析、反應流程、預期產物、文獻先例）。此可約束問題並減少所需技術。

**預期：** 一份明確之分析問題陳述，附成功準則與既有知識摘要。

**失敗時：** 若分析問題模糊（「鑑定此樣品」），與請求方協作收斂之。模糊問題導致無焦點之分析與儀器時間浪費。

### 步驟二：評估樣品特性

評估樣品以判定可行之技術：

1. **物態**：固體（結晶、非晶、粉末）、液體、溶液、氣體、薄膜或生物組織。各態約束適用之製備方法與技術。
2. **可用量**：估算樣品總質或體積。某些技術需毫克（NMR），他者僅需微克（MS）或奈克（SERS）。
3. **溶解度**：測試或估算於常見溶劑（水、甲醇、DMSO、氯仿、己烷）之溶解度。NMR 需氘代溶劑；UV-Vis 需透明溶劑。
4. **穩定性**：評估熱穩定性（需揮發之 GC-MS）、光穩定性（用雷射激發之 Raman）、空氣／水分敏感性（KBr 壓片製備）、溶液穩定性（時間相依測量）。
5. **安全危害**：留意毒性、易燃性、反應性與放射性。此影響操作協議，並可能排除某些技術（如揮發性毒物不應於開放大氣下作 Raman 分析而無封閉）。
6. **預期分子量範圍**：小有機物（< 1000 Da）與聚合物／生物分子（> 1000 Da）需不同之 MS 離子化法與不同之 NMR 採集策略。

**預期：** 一份樣品概述，列出物態、量、溶解度、穩定性、危害與分子量範圍。

**失敗時：** 若樣品難以充分鑑定（如量過小無法測溶解度），採保守路線：先以非破壞、最少樣品之技術（Raman、ATR-IR）入手，待初步結果後再評估。

### 步驟三：以決策矩陣擇定技術

依分析問題與樣品特性擇最具資訊量之技術：

| Technique | Best For | Sample Needs | Destructive? | Sensitivity | Key Limitations |
|-----------|----------|-------------|--------------|-------------|-----------------|
| 1H NMR | H connectivity, integration, coupling | 1--10 mg in deuterated solvent | No | mg | Requires solubility, insensitive |
| 13C NMR | Carbon skeleton, functional groups | 10--50 mg in deuterated solvent | No | mg | Very insensitive, long acquisition |
| 2D NMR | Full connectivity, stereochemistry | 5--20 mg in deuterated solvent | No | mg | Hours of instrument time |
| IR (ATR) | Functional group ID | Any solid/liquid, minimal prep | No | ug | Water interference, fingerprint overlap |
| IR (KBr) | Functional group ID, transmission | 1--2 mg solid in KBr pellet | No* | ug | Moisture sensitive, sample mixed |
| Raman | Symmetric modes, aqueous samples | Any state, no prep for solids | No | ug--mg | Fluorescence, photodegradation |
| EI-MS | Volatile small molecules, fragmentation | ug, must be volatile | Yes (GC-MS) | ng--ug | Requires volatility |
| ESI-MS | Polar/large molecules, MW determination | Solution in volatile solvent | Yes | pg--ng | Adduct complexity, ion suppression |
| MALDI-MS | Polymers, proteins, large molecules | Solid + matrix | Yes | fmol | Matrix interference below 500 Da |
| UV-Vis | Chromophores, quantitation | Solution, ug--mg | No | ug | Limited structural information |

*以 KBr 之 IR 對分子非破壞，惟樣品難自壓片回收。

1. **問題對應技術**：結構鑑定通常至少需 NMR + MS + IR；官能基篩查只需 IR；定量以 UV-Vis 或 NMR 為佳。
2. **檢視可行性**：將每一候選技術與步驟二之樣品特性交叉比對，剔除不相容者（如非揮發性化合物之 GC-MS、順磁性樣品之 NMR）。
3. **依資訊密度排序**：將餘下技術依其對特定問題之資訊量排序。
4. **考量成本與可用性**：若多技術提供相近資訊，擇較快、較廉或較易取得者。

**預期：** 一份排序之技術清單，每項擇用之理由皆明，並註記排除技術之原因。

**失敗時：** 若無單一技術足以勝任（結構鑑定常如此），計畫應納入合在一起能回答問題之互補技術。若無合適技術可用，記錄此限制並建議替代分析路線（如衍生化以使樣品適於 GC-MS）。

### 步驟四：為各技術規劃樣品製備

界定每一所擇技術之具體製備要求：

1. **NMR 製備**：將 1--50 mg 樣品溶於 0.5--0.7 mL 氘代溶劑。依溶解度與譜窗擇溶劑：

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR 製備**：依樣品態擇法：
   - **ATR**：將固體或液體直置於晶體上。最快、製備極簡。
   - **KBr 壓片**：將 1--2 mg 樣品與 100--200 mg 乾 KBr 研磨，壓為透明圓片。
   - **溶液槽**：溶於 IR 透明溶劑（CCl4、CS2）。透明窗有限。
   - **薄膜**：自溶液於 NaCl 或 KBr 窗上鑄膜。適用於聚合物與油類。

3. **MS 製備**：將離子化法配樣品：
   - **EI（GC-MS）**：樣品須揮發。溶於揮發性溶劑（二氯甲烷、己烷）。
   - **ESI（LC-MS）**：溶於 ESI 相容溶劑（甲醇／水、乙腈／水加 0.1% 甲酸）。
   - **MALDI**：與適當基質（DHB、CHCA、Sinapinic acid）混合，乾於靶板。

4. **UV-Vis 製備**：溶於 UV 透明溶劑。調整濃度使 lambda-max 處之吸光度於 0.1 至 1.0 之間。樣品與參比用配對之光程槽。

5. **Raman 製備**：多數樣品所需製備極簡。固體可直接量；液體置於玻璃小瓶（玻璃之 Raman 散射弱）；避用螢光容器。對水溶液 Raman 表現佳，因水之 Raman 散射弱。

**預期：** 為每一所擇技術之製備協議，含溶劑選擇、所需量與特殊操作須知。

**失敗時：** 若樣品量不足以涵蓋所有計畫之技術，依步驟三之資訊層級排序。若樣品於所有合適溶劑皆不溶，考慮固態技術（ATR-IR、Raman、固態 NMR、MALDI-MS）。

### 步驟五：訂分析順序與交叉驗證策略

排定分析順序以保留樣品並最大化資訊流：

1. **依破壞性排序**：先非破壞，後破壞。
   - **第一層（非破壞、無製備）**：Raman、ATR-IR
   - **第二層（非破壞、需製備）**：UV-Vis、NMR（蒸去溶劑後常可回收樣品）
   - **第三層（破壞或耗用樣品）**：MS（ESI、EI/GC-MS、MALDI）

2. **資訊流**：以早期結果精煉後續分析：
   - IR/Raman 之官能基資料協助擇 NMR 實驗（如 IR 無羰基訊號，可省略以羰基為焦點之 13C 分析）。
   - MS 之分子式協助詮釋 NMR（積分比、預期峰數）。
   - NMR 之連接資料協助詮釋 MS 之碎片化。

3. **訂交叉驗證點**：辨明不同技術間應一致之處：
   - 分子式：MS（分子離子）須與 NMR（H 與 C 數）及元素分析吻合。
   - 官能基：IR 之歸屬須與 NMR 化學位移及 MS 碎片化一致。
   - 不飽和度：自分子式（MS）所算須與所觀環與雙鍵（NMR、UV-Vis）相符。

4. **預作備案**：訂初步結果模糊時之追加實驗：
   - NMR 出現非預期之複雜：作 2D 實驗（COSY、HSQC、HMBC）。
   - MS 之分子離子不明：改另一離子化法或申請 HRMS。
   - IR 受單一官能基主導：以 Raman 取互補資訊。

5. **記錄計畫**：產出書面分析計畫，含技術順序、樣品製備步驟、預期週轉時間與備案實驗之決策點。

**預期：** 一份完整、有序之分析計畫，含製備協議、交叉驗證準則與備案安排。

**失敗時：** 若計畫因樣品或儀器限制無法盡行，明確記錄限制並提出可行之最佳子集。

## 驗證

- [ ] 分析問題明確，並有明示之成功準則
- [ ] 已評估樣品特性（態、量、溶解度、穩定性、危害）
- [ ] 已以決策矩陣擇定技術，並記錄理由
- [ ] 已辨明並排除不可行之技術，附原因
- [ ] 已為每一所擇技術規劃樣品製備
- [ ] 分析順序自非破壞至破壞排定
- [ ] 已於互補技術間定交叉驗證點
- [ ] 已為模糊結果預訂備案實驗
- [ ] 已估算總樣品消耗，並對照可用量加以驗證

## 常見陷阱

- **跳過規劃階段**：直奔最近之儀器將浪費樣品與時間。即便 15 分鐘之規劃，亦可省下數小時之重做。
- **依習慣而非依需求擇技術**：並非每次分析皆需 NMR。簡單之官能基確認，IR 已足。技術應配問題。
- **低估樣品需求**：分析中途用罄樣品本可避免。先計算總需求並預留 20% 餘裕。
- **先作破壞性方法**：NMR 之前作 GC-MS，意即 NMR 樣品須來自另一份。先作非破壞以求每毫克之最大資訊量。
- **忽略溶劑相容性**：為 NMR 溶於 DMSO-d6 之樣品難作 GC-MS（非揮發溶劑）。跨技術規劃溶劑選擇。
- **無交叉驗證策略**：無檢查點，不同技術之相反結果可能拖至最後詮釋階段方才察覺。

## 相關技能

- `interpret-nmr-spectrum` —— 詮釋依本計畫所得之 NMR 資料
- `interpret-ir-spectrum` —— 詮釋依本計畫所得之 IR 資料
- `interpret-mass-spectrum` —— 詮釋依本計畫所得之 MS 資料
- `interpret-uv-vis-spectrum` —— 詮釋依本計畫所得之 UV-Vis 資料
- `interpret-raman-spectrum` —— 詮釋依本計畫所得之 Raman 資料
- `validate-analytical-method` —— 驗證本計畫所擇之定量方法
