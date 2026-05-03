---
name: update-skill-content
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Update the content of an existing SKILL.md to improve accuracy,
  completeness, and clarity. Covers version bumping, procedure
  refinement, pitfall expansion, and related skills synchronization. Use
  when a skill's procedures reference outdated tools or APIs, the Common
  Pitfalls section is thin, Related Skills has broken cross-references, or
  after receiving feedback that a skill's procedures are unclear or incomplete.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, content, update, maintenance, quality
---

# 更術之內

精現有 SKILL.md：精步、補陷以實敗、合相關之術、升其版。其用於術已過格式之驗，然內有缺、引陳、或步未全者。

## 用時

- 術之步引陳具、API、或版號
- 陷之段薄（少於三）或缺實敗
- 相關之段之引斷或缺要連
- 步缺具碼之例或令糊
- 新術已入庫，現有術宜引之
- 已得反饋謂術之步不清或未全

## 入

- **必要**：欲更之 SKILL.md 之徑
- **可選**：所專之段（如 "procedure"、"pitfalls"、"related-skills"）
- **可選**：更之源（變更記、事報、用反饋）
- **可選**：是否升版（默：是，小升）

## 法

### 第一步：讀現術而評其質

讀全 SKILL.md，每段察其全與正。

各段之評準：
- **用時**：觸是否具、可行？（期 3-5 條）
- **入**：類、默、必/選是否清分？
- **法**：每步有具碼、Expected、On failure 乎？
- **驗**：列項是否客觀可試？（期 5+ 條）
- **陷**：陷是否具，含症與解？（期 3-6）
- **參**：所引之術存乎？顯然之相關術缺乎？

得：諸段需改之圖明，特定缺已識。

敗則：術不可讀（徑訛），驗其徑。SKILL.md 之 YAML 額損者，先以 `review-skill-format` 修額而後改內。

### 第二步：察陳引

掃步求版引、具名、URL、API 模或已變者。

陳之常徵：
- 特定版號（如 `v1.24`、`R 4.3.0`、`Node 18`）
- 已遷或已過期之 URL
- 已變之 CLI 旗或命法
- 已重名或已棄之包名
- 已演之設文式

```bash
# Check for version-specific references
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Check for URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

得：可能陳之引列，含行號。每引已驗為當前或標待更。

敗則：引多不可手察者，定先後：步之碼塊先（最易致時敗），次陷（或引舊變通），再述文。

### 第三步：更步以求正

每需改之步：

1. 驗碼塊仍正行或合當前佳法
2. 補缺之語以述步*之故*
3. 確具命用真徑、真旗、真出
4. 更 Expected 以合當前具行
5. 更 On failure 以合當前訛辭與解

更碼塊時，存原結構：
- 步之數一致
- 守 `### Step N: Title` 之式
- 勿重序，除非原序誤

得：諸步含當前可行之碼。Expected/On failure 反當前實行。

敗則：碼塊正否未確者，加注：`<!-- TODO: Verify this command against current version -->`。勿移可行碼以未試之代之。

### 第四步：補陷之段

察陷之段，缺則補。

陷之質準：
- 各陷有**粗名**與具述
- 述含*症*（何敗）與*解*（如何避或復）
- 陷取於實敗，非假慮
- 3-6 為目標之數

新陷之源：
- 步有複雜 On failure 者（其多為陷）
- 警相同具或模之相關術
- 用之常報

得：3-6 陷，各有具症與解。無泛陷如「慎之」「徹試」。

敗則：唯 1-2 陷可識者，於基本之術可。中高之術少於三者，示作者未盡探敗模——標待後補。

### 第五步：合相關之術之段

驗相關之段中諸引皆有效，補缺之連。

1. 每引之術，驗其存：
   ```bash
   # Check if referenced skill exists
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. 求引此術之術（其宜互連）：
   ```bash
   # Find skills that reference this skill
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. 依域與標察顯然相關之術
4. 用式：`- \`skill-id\` — 一行述其關係`

得：諸引之術皆存於盤。雙向互引在位。無孤連。

敗則：引之術不存者，去之或注為計後出之術。多術引此而未列於相關者，加最相關之 2-3。

### 第六步：升額之版

依語義版升 `metadata.version`：
- **補升**（1.0 至 1.1）：訛字修、小清、URL 更
- **小升**（1.0 至 2.0）：新步、重內加、結構變
- **注**：術用簡化二段版（major.minor）

亦更額中日期之段（若有）。

得：版升合宜。變之大與更之範相符。

敗則：當前版不可解者，設為 `"1.1"` 並注版史之缺。

## 驗

- [ ] 諸步含當前可行之碼或具令
- [ ] 無陳版引、URL、棄具名遺
- [ ] 每步有 **Expected:** 與 **On failure:**
- [ ] 陷段有 3-6 具陷，含症與解
- [ ] 諸相關引皆指存術
- [ ] 緊密相關之術有雙向互引
- [ ] 額版已升合宜
- [ ] 更後行數仍 ≤ 500
- [ ] 變後 SKILL.md 仍過 `review-skill-format` 之驗

## 陷

- **更碼而不試**：改步之命而不驗其行，不如留舊命。不確時，加驗注勝未試之代。
- **過補陷**：加 10+ 陷稀其段。守 3-6 最有影者；邊例移至 `references/` 檔。
- **更時破引**：重名或變域時，全術庫 grep 求舊名。用 `grep -rl "old-name" skills/` 求諸現。
- **忘升版**：每內更，無論小大，皆宜升版。此使用者察術已變。
- **範蔓入重構**：內更改*術之言*。若覺重結構或抽至 `references/`，改用 `refactor-skill-structure` 之術。

## 參

- `review-skill-format` — 內更前行格式驗以確基結構穩
- `refactor-skill-structure` — 內更使術逾 500 行時，重構以讓位
- `evolve-skill` — 較內更深之變（如造高級變體）
- `create-skill` — 加新段或步時引典範式之規
- `repair-broken-references` — 全術庫批量斷引修
