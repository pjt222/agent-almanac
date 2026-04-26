---
name: plan-spectroscopic-analysis
locale: wenyan-ultra
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

# 計譜析

設譜析役、擇正術、效次之、定成則含交驗策也。

## 用

- 起未知物析、決用何術→用
- 優析次以保樣為毀術→用
- 取機時前計樣備→用
- 確補術間之交驗→用
- 限資時量機與序術→用
- 訓新析者於系析計→用

## 入

- **必**：析問（構識、量、純評、官能基篩、應監）
- **必**：樣述（態、約量、知或疑物類）
- **可**：可用機與其能
- **可**：本與時限
- **可**：安資（毒、應、揮、光感）
- **可**：前析資（若已有）

## 行

### 一：定析問

擇術前明所需信：

1. **別問型**：
   - **構識**：定未知物全分子構。需最廣諸術
   - **構驗**：驗已知物合預構。需少術、聚診特
   - **量析**：定已知析物濃或量。需校與線性術 (UV-Vis、含內標 NMR)
   - **純評**：定樣含雜否、若有則識之。需高靈與分能
   - **官能基篩**：識何官能基存而不全構定。IR 常足
   - **應監**：時追化學應進。需速與應況容 (in situ IR、Raman 或 UV-Vis)

2. **定成則**：明述何為足答。構識：「單構提合諸譜資」。量：「濃定相誤 < 5%」。

3. **察已知**：匯諸樣前資（元析、應圖、預品、文先）。此縮問減術數。

得：明析問含定成則與已知撮。

敗：問模糊（「徵此樣」）→與請者縮之。模問致散析、費機時。

### 二：察樣特

評樣以定何術可行：

1. **態**：固（晶、非晶、粉）、液、溶、氣、薄膜或生組。各態限可行樣備與術。
2. **可用量**：估全樣質或容。某術需毫克 (NMR)、他用微克 (MS) 或毫毫克 (SERS)。
3. **溶**：試或估於常溶劑（水、甲醇、DMSO、氯仿、己烷）之溶。NMR 需氘溶；UV-Vis 需透溶。
4. **穩**：評熱穩 (GC-MS 需揮)、光穩 (Raman 用激光)、氣/濕感 (KBr 丸備)、溶穩 (時依測)。
5. **安險**：注毒、燃、應、輻。影處則、可排某術 (如揮毒物無封不宜開氣 Raman)。
6. **預分量範**：小有機 (< 1000 Da) 對聚物/生分子 (> 1000 Da) 需異 MS 離法與 NMR 取策。

得：樣徵撮列態、量、溶、穩、險、分量範。

敗：樣不可徵 (如量太小不能試溶)→保策：始於非毀少樣術 (Raman、ATR-IR)、初果後再評。

### 三：以決陣擇術

按析問與樣特擇最信術：

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

1. **配問於術**：構識常需 NMR + MS + IR 至少。官能基篩唯需 IR。量於 UV-Vis 或 NMR 最佳。
2. **察可行**：對候術與步二樣特。除不容（如非揮物之 GC-MS、順磁樣之 NMR）。
3. **按信密序**：餘術按答此問之信量序之。
4. **計本與供**：諸術同信→擇速、廉、易得者。

得：選術序列含各擇由與排術之由。

敗：無單術足（構識常然）→計含補術合答問。無適術→注限、薦他析徑（如衍化使樣宜 GC-MS）。

### 四：各術計樣備

各擇術定備需：

1. **NMR 備**：1--50 mg 樣溶於 0.5--0.7 mL 氘溶。按溶與譜窗擇溶劑：

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR 備**：按樣態擇法：
   - **ATR**：固或液直置晶上。最速、備少
   - **KBr 丸**：磨 1--2 mg 樣於 100--200 mg 乾 KBr、壓為透盤
   - **溶池**：溶於 IR 透溶（CCl4、CS2）。透窗有限
   - **薄膜**：自溶澆於 NaCl 或 KBr 窗。宜聚物、油

3. **MS 備**：配離法於樣：
   - **EI (GC-MS)**：樣需揮。溶於揮溶（二氯甲烷、己烷）
   - **ESI (LC-MS)**：溶於 ESI 容溶（甲醇/水、乙腈/水含 0.1% 甲酸）
   - **MALDI**：與適矩 (DHB、CHCA、芥酸) 混、乾於靶板

4. **UV-Vis 備**：溶於 UV 透溶。調濃使 lambda-max 吸於 0.1 至 1.0 間。樣參用配池。

5. **Raman 備**：多樣需備少。固可裸測。液於玻管（玻 Raman 散弱）。避螢容。水溶 Raman 行（水 Raman 散弱）。

得：各擇術之備則含溶擇、需量、特處。

敗：樣不足諸計術→按步三信序序。樣於諸適溶皆不溶→計固態術 (ATR-IR、Raman、固 NMR、MALDI-MS)。

### 五：定析序與交驗策

序析以保樣與最大信流：

1. **按毀性序**：非毀術先、毀術末。
   - **首層 (非毀、無備)**：Raman、ATR-IR
   - **次層 (非毀、需備)**：UV-Vis、NMR (樣常可蒸溶劑回收)
   - **末層 (毀或耗樣)**：MS (ESI、EI/GC-MS、MALDI)

2. **信流**：用早果精晚析：
   - IR/Raman 官能基資助擇佳 NMR 驗（如 IR 無羰→略羰聚 13C 析）
   - MS 分式助釋 NMR（積比、預峰數）
   - NMR 連資助釋 MS 碎

3. **定交驗點**：識諸術果當合處：
   - 分式：MS（分子離）必合 NMR（H、C 數）與元析
   - 官能基：IR 析配當合 NMR 化位與 MS 碎
   - 不飽和度：自式（MS）算當合所察環與雙鍵（NMR、UV-Vis）

4. **計變**：定初果模時當行何加驗：
   - NMR 示未期繁→行 2D 驗 (COSY、HSQC、HMBC)
   - MS 分子離模→試他離法或求 HRMS
   - IR 為一官能基所主→試 Raman 補

5. **記計**：書析計含術序、樣備、預返時、變驗決點。

得：完序析計含備則、交驗則、變備已記。

敗：計因樣或機限不可成→明記限、提最佳可行子集。

## 驗

- [ ] 析問明定含明成則
- [ ] 樣特已察（態、量、溶、穩、險）
- [ ] 用決陣擇術、含由
- [ ] 不可行術已識排與由
- [ ] 各擇術之樣備已計
- [ ] 析序自非毀至毀
- [ ] 補術間定交驗點
- [ ] 模果之變驗已識
- [ ] 全樣耗已估、對可用量驗

## 忌

- **略計段**：直赴最近機費樣費時。即 15 分計省數時重析
- **習擇非需**：非皆需 NMR。簡官能基驗唯需 IR。配術於問
- **輕樣需**：析中盡樣可避。前算全需加 20% 留
- **毀術先**：GC-MS 先於 NMR 則 NMR 樣需自他份。非毀先以最大每毫克信
- **忽溶相容**：DMSO-d6 NMR 樣難為 GC-MS（非揮）。諸術計溶擇
- **無交驗策**：無定查點則異術矛盾果至末釋未察

## 參

- `interpret-nmr-spectrum` -- 釋按此計取之 NMR 資
- `interpret-ir-spectrum` -- 釋按此計取之 IR 資
- `interpret-mass-spectrum` -- 釋按此計取之 MS 資
- `interpret-uv-vis-spectrum` -- 釋按此計取之 UV-Vis 資
- `interpret-raman-spectrum` -- 釋按此計取之 Raman 資
- `validate-analytical-method` -- 驗此計擇之量法
