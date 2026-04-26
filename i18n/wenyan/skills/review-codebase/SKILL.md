---
name: review-codebase
locale: wenyan
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

# 審碼庫

多階深之碼庫審附重之等與構出。一過合構、安、碼質、UX/可訪。生排序之得表，可直化為 `create-github-issues` 之 GitHub 問題。

## 用時

- 全項目或子項目之審（非 PR 範）乃用
- 新碼庫之啟——建何存何要之心象乃用
- 久發後之周期健察乃用
- 釋前之質閘越構、安、碼質、UX 乃用
- 出宜直入問題立或衝刺計乃用

## 入

- **必要**：`target_path` — 欲審之碼庫或子項目之根所
- **可選**：
  - `scope` — 行何階：`full`（默）、`security`、`architecture`、`quality`、`ux`
  - `output_format` — `findings`（獨表）、`report`（敘）、`both`（默）
  - `severity_threshold` — 含之最少重：`LOW`（默）、`MEDIUM`、`HIGH`、`CRITICAL`

## 法

### 第一步：census 普查

錄碼庫以立範與識審之的。

1. 各語/類數文：`find target_path -type f | sort by extension`
2. 各語量總行數
3. 識試所而估試覆（有試之文與無試之文）
4. 察依態：鎖文存、過時依、知 CVE
5. 記建系、CI/CD 配、文檔之態
6. 記普查為報之首段

得：實之錄——文數、語、試之有、依之健。尚無斷。

敗則：若目路空或不可訪，止而報。若某子所不可訪，記之而以可得者續。

### 第二步：構之審

察結構之健：耦合、複、數流、分。

1. 圖模/所構而識主構形
2. 察碼複——文間之重邏、複貼之形
3. 估耦合——一功之改需變多少文
4. 評數流——層間有明界乎（UI、邏、數）？
5. 識死碼、未用之出、孤文
6. 察恆形——碼庫循己之規乎？
7. 各得評：CRITICAL、HIGH、MEDIUM、LOW

得：構之得列附重之等與文引。常得：模派之複、缺抽層、環依。

敗則：若碼庫過小不能義審（< 5 文），記之而過第三步。構審需足之碼以有構。

### 第三步：安審

識安患與守碼缺。

1. 掃注入：HTML 注入（`innerHTML`）、SQL 注入、命注入
2. 察認與授形（若有）
3. 審誤處——誤暗吞乎？誤信露內乎？
4. 對知 CVE 審依版
5. 察硬秘、API 鑰、憑
6. 審 Docker/容器之安：root 用戶、露口、建秘
7. 察 localStorage/sessionStorage 之敏存
8. 各得評：CRITICAL、HIGH、MEDIUM、LOW

得：安得列附重、影文、修議。CRITICAL 含注入患與露秘。

敗則：若無安碼（純文檔項目），記之而過第四步。

### 第四步：碼質

評可守、可讀、守碼。

1. 識魔數與宜為命常之硬值
2. 察恆命規於碼庫
3. 尋系界缺之入驗
4. 估誤處形——恆乎？示有用之信乎？
5. 察注之碼、TODO/FIXME 之標、未畢之施
6. 審試之質——試行為乎，抑試施細乎？
7. 各得評：CRITICAL、HIGH、MEDIUM、LOW

得：質之得列專守。常得：魔數、不恆形、缺護。

敗則：若碼庫為生或縮，記之而調期。生碼有異於手書之質規。

### 第五步：UX 與可訪（若有前端）

評用驗與可訪之合。

1. 察 ARIA 之角、標、地標於互動之元
2. 驗鍵導——諸互動元 Tab 可達乎？
3. 試焦管——板開閉時焦合邏移乎？
4. 察響應之設——常斷點試之（320px、768px、1024px）
5. 驗色對比合 WCAG 2.1 AA 之標
6. 察讀屏之容——動內變宣乎？
7. 各得評：CRITICAL、HIGH、MEDIUM、LOW

得：UX/a11y 之得列附 WCAG 引（若可）。若無前端，此步生「N/A — 無前端碼察」。

敗則：若前端碼存而不能渲（缺建步），靜審其源碼而記運時試不可。

### 第六步：得之合

合諸得為排序之摘。

1. 合諸階之得為單表
2. 依重排序（CRITICAL 先，後 HIGH、MEDIUM、LOW）
3. 同重等內，依題群之（安、構、質、UX）
4. 各得含：重、階、文、一行述、議修
5. 出修序之議慮諸修間之依
6. 摘：依重之總得、首三急、估力等

得：得表附欄：`#`、`Severity`、`Phase`、`File(s)`、`Finding`、`Fix`。修序之議慮諸得間之依（如「立試前先重構」）。

敗則：若無得，此本身為得——或碼庫特淨或審過淺。再以深察至少一階。

## 驗

- [ ] 諸所請階皆畢（或明略附故）
- [ ] 各得有重評（CRITICAL/HIGH/MEDIUM/LOW）
- [ ] 各得引至少一文或所
- [ ] 得表依重排序
- [ ] 修序之議慮諸得間之依
- [ ] 摘含依重之總數
- [ ] 若 `output_format` 含 `report`，敘段附表

## 與息相伴之尺

審諸階間，用 `/rest` 為檢點——尤於 2-5 階間，蓋其需異析視。檢點之息（簡、過）防一階之勢偏次階。`rest` 技之「Scaling Rest」段供檢點對全息之引。

## 陷

- **燒海**：審大碼庫之諸行生噪。專注於高影區：入點、安界、構縫
- **重之膨**：非凡得皆 CRITICAL。CRITICAL 留為可利之患與失數之險。多構患為 MEDIUM
- **見樹失林**：個碼質患輕於系形。若魔數現於 20 文，乃一構得，非 20 質得
- **略普查**：普查（第一步）似官然防審不存之碼或漏全所
- **階溢**：構審時得安、安審時得質。記於正階而非混憂——生更淨之得表

## 參

- `security-audit-codebase` — review-codebase 之安階露繁患時行深安審
- `review-software-architecture` — 為特子系行詳構審
- `review-ux-ui` — 全 UX/可訪審逾五階所及
- `review-pull-request` — 為單變行差範審
- `clean-codebase` — 施此審所識之碼質修
- `create-github-issues` — 化得表為追之 GitHub 問題
