---
name: review-codebase
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Multi-phase deep codebase review with severity ratings and structured output.
  Covers architecture, security, code quality, and UX/accessibility in a single
  coordinated pass. Produces a prioritized findings table suitable for direct
  conversion to GitHub issues via the create-github-issues skill.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: review, code-quality, architecture, security, accessibility, codebase
---

# 審庫

多階深庫審生重級發見與修序薦。異 `review-pull-request`（限 diff）或單域審（`security-audit-codebase`、`review-software-architecture`）、此技覆全項或子項跨諸質維於一過。

## 用

- 全項或子項審（非 PR 限）
- 新庫熟——建心模於存何與何需顧
- 久開後周健察
- 發前質閘跨構、安、碼質、UX
- 出宜直入問建或衝刺計

## 入

- **必**：`target_path` — 欲審庫或子項根錄
- **可**：
  - `scope` — 行階：`full`（默）、`security`、`architecture`、`quality`、`ux`
  - `output_format` — `findings`（唯表）、`report`（敘）、`both`（默）
  - `severity_threshold` — 含最低重：`LOW`（默）、`MEDIUM`、`HIGH`、`CRITICAL`

## 行

### 一：census

錄庫以立範識審標。

1. 按語/型計檔：`find target_path -type f | sort by extension`
2. 量各語總行
3. 識測錄、估測覆（有測檔對無）
4. 察依態：鎖檔存、舊依、知漏
5. 記建系、CI/CD 配、文態
6. census 為報首段

得：實錄——檔數、語、測在、依健。未判。

敗：標路空或不可達→止報。某子錄不可達→記之以所有續。

### 二：構審

估構健：耦、複、數流、關分。

1. 圖模/錄構、識主構模
2. 察碼複——跨檔重邏、複貼模
3. 估耦——一功改需變諸檔幾
4. 評數流——層間（UI、邏、數）有明界乎？
5. 識死碼、未用出、孤檔
6. 察恆模——庫循己約乎？
7. 各發見分：CRITICAL、HIGH、MEDIUM、LOW

得：構發見列、含重級與檔引。常發見：模派複、缺抽層、環依。

敗：庫過小（< 5 檔）→記略入三。構審需碼足以有構。

### 三：安審

識安漏與防碼缺。

1. 掃注向：HTML 注（`innerHTML`）、SQL 注、命注
2. 察認與授模（適用）
3. 審錯處——錯默吞乎？錯訊漏內乎？
4. 審依版對知 CVE
5. 察硬密、API 鍵、憑
6. 審 Docker/容安：根用、露埠、建密
7. 察 localStorage/sessionStorage 為敏數存
8. 各發見分：CRITICAL、HIGH、MEDIUM、LOW

得：安發見列、含重、影檔、修導。CRITICAL 含注漏與露密。

敗：無安相碼（純文項）→記略入四。

### 四：碼質

評維、易讀、防碼。

1. 識魔數與宜為命常之硬值
2. 察跨庫恆命約
3. 尋系界缺輸驗
4. 估錯處模——恆乎？供有用訊乎？
5. 察註碼、TODO/FIXME 標、未全實
6. 審測質——測為乎抑為實詳？
7. 各發見分：CRITICAL、HIGH、MEDIUM、LOW

得：質發見列注於維。常發見：魔數、不恆模、缺護。

敗：庫為生或縮→記、調期。生碼有異於手碼之質準。

### 五：UX 與可達（前端存）

評用驗與可達合。

1. 察互素 ARIA 角、標、地標
2. 驗鍵盤導——諸互素皆可 Tab 至乎？
3. 測焦管——板開閉時焦邏動乎？
4. 察響應設——測常斷點（320px、768px、1024px）
5. 驗色對比合 WCAG 2.1 AA 標
6. 察屏讀容——動容變宣告乎？
7. 各發見分：CRITICAL、HIGH、MEDIUM、LOW

得：UX/a11y 發見列、適用處引 WCAG。前端無→此步生「N/A — no frontend code detected」。

敗：前端碼存而不可渲（缺建步）→靜析源碼、記運時測不能。

### 六：發見合

合諸發見入序摘。

1. 諸階發見合一表
2. 按重排（CRITICAL 先、後 HIGH、MEDIUM、LOW）
3. 各重級內、按題聚（安、構、質、UX）
4. 各發見含：重、階、檔、一句述、擬修
5. 生薦修序、顧修間依
6. 摘：按重總計、首三優、估力級

得：發見表含列：`#`、`Severity`、`Phase`、`File(s)`、`Finding`、`Fix`。修序薦顧修間依（如「測前重構構」）。

敗：無發見生→自為發見——或庫異潔或審過淺。再深察至少一階。

## 驗

- [ ] 諸請階皆畢（或明略含由）
- [ ] 各發見有重級（CRITICAL/HIGH/MEDIUM/LOW）
- [ ] 各發見引至少一檔或錄
- [ ] 發見表按重排
- [ ] 修序薦顧發見間依
- [ ] 摘含按重總計
- [ ] `output_format` 含 `report`→敘段伴表

## 縮息

審階間、`/rest` 為檢——尤二至五階間、需異析角。檢息（簡、轉）防一階勢偏次。見 `rest` 技「Scaling Rest」段為檢與全息導。

## 忌

- **沸海**：審大庫每行生噪。注高影域：入點、安界、構接
- **重膨**：非皆 CRITICAL。CRITICAL 留可剝漏與數失險。多構患為 MEDIUM
- **失林為樹**：個碼質患少於系模重。魔數現於 20 檔→一構發見、非二十質發見
- **略 census**：census（一）似官而防審不存碼或失整錄
- **階滲**：構審中安發見、或安審中質發見。為正階記、勿混——生潔發見表

## 參

- `security-audit-codebase` — 審庫安階揭複漏時深安審
- `review-software-architecture` — 特子系詳構審
- `review-ux-ui` — 過五階之全 UX/可達審
- `review-pull-request` — diff 限審為個變
- `clean-codebase` — 實此審識之碼質修
- `create-github-issues` — 化發見表為追 GitHub 問
