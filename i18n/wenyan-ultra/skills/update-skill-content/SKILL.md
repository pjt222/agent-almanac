---
name: update-skill-content
locale: wenyan-ultra
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

# 更技容

精現 SKILL.md 之步、廣常忌（記真敗式）、同參技、升版。用於技過式驗而容缺、舊參、步未盡。

## 用

- 步引舊工、API、版→用
- 常忌節薄（< 3）或無真敗→用
- 參技壞參或漏關→用
- 步無具體碼或指含混→用
- 新技入庫，現技應參之→用
- 受饋謂步不清不盡→用

## 入

- **必**：欲更 SKILL.md 之路
- **可**：特節（如「procedure」、「pitfalls」、「related-skills」）
- **可**：更源（變更日、議報、用饋）
- **可**：升版乎（默：是，小升）

## 行

### 一：讀現技、評容質

讀全 SKILL.md、評每節之盡與正。

每節評標：
- **用時**：觸具體可行乎？（3-5 期）
- **入**：型、默、必/可分明乎？
- **行**：每步有具碼、得、敗乎？
- **驗**：清單可客觀試乎？（5+ 期）
- **忌**：忌具體附徵與修乎？（3-6 期）
- **參**：所參存乎？顯關漏乎？

得：何節須改、特隙辨明。

敗：技不能讀（路誤）→驗路。SKILL.md 之 YAML 壞→先用 `review-skill-format` 修式乃改容。

### 二：察舊參

掃步覓特版參、工名、URL、API 式或已變者。

常舊辨：
- 特版（如 `v1.24`、`R 4.3.0`、`Node 18`）
- URL 或已遷期
- CLI 旗或命法已變
- 包名已改或廢
- 配檔式已演

```bash
# Check for version-specific references
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Check for URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

得：可能舊參表附行號。各參驗為今或標待更。

敗：手察過多→排序：步碼塊先（最易致行敗）、次常忌（或引舊計）、後信文。

### 三：更步以正

每須改之步：

1. 驗碼塊仍可行或合今佳法
2. 加缺脈絡述步*何以*須
3. 確具命用真路、真旗、真出
4. 更得塊以合今工為
5. 更敗塊以今誤訊與修

更碼塊保原構：
- 步號續
- 維 `### Step N: Title` 式
- 勿重排步除非原誤

得：諸步含今可行之碼。得/敗塊合今實為。

敗：不確碼仍正→加註：`<!-- TODO: Verify this command against current version -->`。勿移可行碼換未試替。

### 四：擴常忌

察常忌節，有隙乃擴。

忌質標：
- 各忌**粗名**附特述
- 述含*徵*（何敗）與*修*（如何免或復）
- 忌出真敗式，非假慮
- 3-6 為的

新忌源：
- 步附複雜敗塊（多為忌）
- 參技警同工或式
- 用報常疾於程

得：3-6 忌，各附特徵與修。無「謹慎」「全試」之泛忌。

敗：僅辨 1-2→於基技可。中高難技 < 3 示作者未盡探敗→標待擴。

### 五：同參技節

驗諸交參正、加缺。

1. 各參技驗存：
   ```bash
   # Check if referenced skill exists
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. 搜參此技之技（須交鏈）：
   ```bash
   # Find skills that reference this skill
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. 按域與標察顯關技
4. 用式：`- \`skill-id\` — 一行述關`

得：諸參技存盤。雙向交參就。無孤鏈。

敗：所參技不存→移參或註為來技附評。多技參此而未列於參→加最關 2-3。

### 六：升版於前綴

更 `metadata.version` 按語意版：
- **補升**（1.0 至 1.1）：訛修、小釋、URL 更
- **小升**（1.0 至 2.0）：新步、容大增、構變
- **註**：技用簡化二段版（major.minor）

亦更前綴中日（若有）。

得：版升合宜。改度合更範。

敗：今版不能析→設 `"1.1"` 並註版史隙。

## 驗

- [ ] 諸步含今可行碼或具指
- [ ] 無舊版參、URL、廢工名
- [ ] 諸步有 **得：** 與 **敗：** 塊
- [ ] 常忌節 3-6 特忌附徵與修
- [ ] 諸參技指存技
- [ ] 緊關技雙向交參就
- [ ] 前綴版適升
- [ ] 更後行數仍 < 500
- [ ] 改後仍過 `review-skill-format` 驗

## 忌

- **未試而更碼**：改步命未驗甚於留舊。不確時加驗註，勿換未試替
- **過擴忌**：> 10 稀此節。留 3-6 最重，邊例移 `references/` 檔
- **更時破交參**：改技名或域時，全庫 grep 舊名。`grep -rl "old-name" skills/` 覓諸位
- **忘升版**：每容更，不論小，皆升版。使消費者測技已變
- **滲入重構**：容更改技*所述*。若覺重排節或抽至 `references/`→改用 `refactor-skill-structure`

## 參

- `review-skill-format` — 容更前行式驗確基構穩
- `refactor-skill-structure` — 容更使技超 500 行→重構騰位
- `evolve-skill` — 深改超容更（如建進階變）
- `create-skill` — 加新節或步時參規範
- `repair-broken-references` — 全庫批量修參
