---
name: plan-spectroscopic-analysis
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  謀全面之光譜分析，定分析問、察樣特性、以決策矩擇宜術、為各術謀樣備、
  序之自非破至破、定成功之準與互驗之策。
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

# 謀光譜分析

設計光譜分析之征伐：擇正確之術、效率序之、定答某樣特定分析問之成功之準。

## 用時

- 始察未知化合物，決用何光譜術
- 優化分析序以保樣供破壞法
- 取儀器時前謀樣備之需
- 確互補術間之互驗
- 資源有限時預算儀器時並分優之術
- 訓新分析者於系統分析謀劃

## 入

- **必要**：分析問（結構識、定量、純度評、官能團篩、反應監）
- **必要**：樣述（物態、約量、已知或疑之化合物類）
- **可選**：可用之儀器與其能
- **可選**：預算與時之制
- **可選**：安全數據（毒性、反應性、揮發性、光敏）
- **可選**：先有分析數據（若已有結果）

## 法

### 第一步：定分析問

擇任術前明確所需之訊：

1. **分問之型**：
   - **結構識**：定未知化合物之全分子結構。需最廣之術集。
   - **結構確認**：驗已知化合物與其預期結構符。所需術較少，焦於診斷之徵。
   - **定量分析**：定已知分析物之濃或量。需校與線性佳之術（UV-Vis、附內標 NMR）。
   - **純度評**：定樣是否含雜質、若有則識之。需高敏與分離之能。
   - **官能團篩**：識何官能團存而不全結構定。IR 常足。
   - **反應監**：時序追化學反應之進。需速與反應條件之相容（in situ IR、Raman、UV-Vis）。

2. **定成功之準**：明示何者為滿之答。結構識：「諸光譜數據相符之單一結構提案」。定量：「相對誤 < 5% 之濃」。

3. **察已知**：匯所有樣已有訊（元素分析、反應式、預期產、文獻先例）。此制問並減所需術數。

得：清晰所述之分析問，含定之成功之準與樣已有之知之要。

敗則：若分析問模糊（「察此樣」），與請者協以縮之。模糊問致分析無焦並耗儀器時。

### 第二步：察樣特性

評樣以定何術可行：

1. **物態**：固（晶、非晶、粉）、液、溶、氣、薄膜、生物組織。各態制何樣備法與術可施。
2. **可用量**：估樣總質或體。某術需毫克（NMR），他可用微克（MS）或納克（SERS）。
3. **溶解性**：試或估於常溶劑（水、甲醇、DMSO、氯仿、己烷）之溶解。NMR 需氘代溶劑；UV-Vis 需透明溶劑。
4. **穩定性**：察熱穩（GC-MS 需揮發）、光穩（Raman 用激光）、空氣/水分敏（KBr 片備）、溶液穩（時依測）。
5. **安全患**：記毒、燃、反應、放射。此影響操作協並或排某術（如揮發毒物不宜於開放氣 Raman 無封）。
6. **預期分子量範圍**：小有機（< 1000 Da）對聚合物/生物分子（> 1000 Da）需異 MS 電離法與異 NMR 採之策。

得：樣特性之要，列態、量、溶、穩、患、分子量範圍。

敗則：若樣不能足察（如量過小不能試溶），用保守之法：始以非破、最少樣之術（Raman、ATR-IR），初果後再評。

### 第三步：以決策矩擇術

依分析問與樣特性擇最有訊之術：

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

*IR with KBr is non-destructive to the molecule but the sample cannot be easily recovered from the pellet.

1. **配問與術**：結構識常需 NMR + MS + IR 為基。官能團篩唯需 IR。定量以 UV-Vis 或 NMR 為佳。
2. **察可行**：諸候術與第二步之樣特性互照。除不容者（如 GC-MS 對非揮發、NMR 對順磁樣）。
3. **依訊密分優**：依各術對此特定問所供之訊量排餘術。
4. **計費與可得**：若數術供類訊，取速、廉、易得者。

得：擇之術之排列，附各擇之因與所排術之何及因之注。

敗則：若無單一術足（結構識常然），謀當含互補術合答之問。若無宜術，記其制並薦他法（如衍化以使樣宜於 GC-MS）。

### 第四步：為各術謀樣備

定各擇術之具體備所需：

1. **NMR 備**：1--50 mg 樣溶於 0.5--0.7 mL 氘代溶劑。依溶與譜窗擇溶：

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR 備**：依樣態擇法：
   - **ATR**：固或液直置於晶。最速，最少備。
   - **KBr 片**：1--2 mg 樣與 100--200 mg 乾 KBr 研，壓為透明片。
   - **溶液池**：溶於 IR 透明溶劑（CCl4、CS2）。透明窗有限。
   - **薄膜**：自溶液鑄於 NaCl 或 KBr 窗。宜聚合物與油。

3. **MS 備**：配電離法與樣：
   - **EI (GC-MS)**：樣必揮發。溶於揮發溶劑（二氯甲烷、己烷）。
   - **ESI (LC-MS)**：溶於 ESI 容溶劑（甲醇/水、乙腈/水含 0.1% 甲酸）。
   - **MALDI**：與宜矩陣（DHB、CHCA、芥子酸）混並乾於板。

4. **UV-Vis 備**：溶於 UV 透明溶劑。調濃使 lambda-max 之吸光在 0.1 至 1.0 之間。樣與參用配對之比色皿。

5. **Raman 備**：多樣需最少備。固可裸測。液於玻璃瓶（玻璃 Raman 散射弱）。避螢光容器。水溶液 Raman 良，水為弱 Raman 散射者。

得：各擇術之備協，含溶之擇、所需量、特殊處理之指。

敗則：若樣量不足諸謀術，依第三步之訊階分優。若樣不溶於諸宜溶劑，考固態術（ATR-IR、Raman、固態 NMR、MALDI-MS）。

### 第五步：定分析序與互驗策

序分析以保樣與最大訊流：

1. **依破壞分序**：非破術先，破術後。
   - **首層（非破、無備）**：Raman、ATR-IR
   - **二層（非破、需備）**：UV-Vis、NMR（樣常可蒸溶劑而回收）
   - **三層（破或耗樣）**：MS（ESI、EI/GC-MS、MALDI）

2. **訊流**：以早果優化後分析：
   - IR/Raman 官能團數據助擇最佳 NMR 試（如 IR 無羰基，略羰基焦之 13C 分析）。
   - MS 之分子式助釋 NMR（積分比、預期峰數）。
   - NMR 連接數據助釋 MS 碎裂。

3. **定互驗點**：識諸術果當合處：
   - 分子式：MS（分子離子）必合 NMR（H 與 C 計）與元素分析。
   - 官能團：IR 之歸必與 NMR 化學位移與 MS 碎裂相合。
   - 不飽和度：自式（MS）算者必合所觀環與雙鍵（NMR、UV-Vis）。

4. **謀備案**：定若初果模糊，何附加試行：
   - 若 NMR 示意外複雜：行 2D 試（COSY、HSQC、HMBC）。
   - 若 MS 分子離子模糊：試異電離法或請 HRMS。
   - 若 IR 為一官能團主導：試 Raman 取互補訊。

5. **記謀**：生書面分析謀，含術序、樣備步驟、預期周轉時、備案試之決點。

得：完備、有序之分析謀，含備協、互驗之準、備案規記之。

敗則：若謀因樣或儀器之制不能完，明記其制並提最佳可達之分析子集。

## 驗

- [ ] 分析問清晰定，附明示之成功之準
- [ ] 樣特性已察（態、量、溶、穩、患）
- [ ] 術以決策矩擇之，附諸因記之
- [ ] 不可行之術已識並排，附因
- [ ] 各擇術之樣備已謀
- [ ] 分析序自非破至破
- [ ] 互補術間之互驗點已定
- [ ] 模糊果之備案試已識
- [ ] 估總樣耗並對可用量驗

## 陷

- **略謀劃相**：直赴最近之儀器耗樣與時。即 15 分鐘之謀亦省數時之重析。
- **依習慣而非需擇術**：非每分析皆需 NMR。簡單官能團確認唯需 IR。配術與問。
- **低估樣需**：分析序中途耗盡樣可避。前算總樣需並加 20% 備。
- **先行破壞法**：NMR 前 GC-MS 致 NMR 樣自另一份。先序非破法以最大每毫克之訊。
- **忽溶劑相容**：DMSO-d6 中之 NMR 樣不易用於 GC-MS（非揮發溶劑）。跨諸術謀溶劑之擇。
- **無互驗策**：無定檢點，諸術之矛盾果或至最終解時方覺。

## 參

- `interpret-nmr-spectrum` — 釋依此謀採之 NMR 數據
- `interpret-ir-spectrum` — 釋依此謀採之 IR 數據
- `interpret-mass-spectrum` — 釋依此謀採之 MS 數據
- `interpret-uv-vis-spectrum` — 釋依此謀採之 UV-Vis 數據
- `interpret-raman-spectrum` — 釋依此謀採之 Raman 數據
- `validate-analytical-method` — 驗此謀所擇之定量法
