---
name: remote-viewing
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI intuitive exploration for approaching unknown codebases, problems,
  or systems without preconceptions. Adapts the Coordinate Remote Viewing
  protocol to AI investigation: cooldown (clear assumptions), staged data
  gathering (raw signals → dimensional → analytical), AOL management
  (separating observations from premature labels), and structured review.
  Use when investigating an unfamiliar codebase with unknown architecture,
  debugging a problem where premature hypotheses could mislead, exploring a
  domain with limited context, or when previous attempts have been led astray
  by assumptions and "beginner's mind" would be more productive.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, remote-viewing, exploration, investigation, assumption-management
---

# 遙視

以 AI 行 CRV 改之程，近未識之碼庫、問題、系統——先聚原察而後立論，管早標（Analytical Overlay），由階據集而成解。

## 用時

- 察未識構之碼庫乃用
- 解患而其因不顯，早假可誤導乃用
- 探境淺之域或技乃用
- 前察為假所誤導乃用
- 凡「初心」勝形匹之問題乃用

## 入

- **必要**：欲察之目（碼庫之路、問之述、欲解之系）
- **必要**：許盲近——拒立論至據集畢
- **可選**：對目所欲問之問（留至第五階）
- **可選**：前冥以清假（見 `meditate`）

## 法

### 第一步：降溫——清諸假

化重假之模為納察之模。此步不可商。

1. 識對目之諸先念：
   - 「此或為 React 之應用」——宣之
   - 「訛或於庫層」——宣之
   - 「此循 MVC 之構」——宣之
2. 各先念明書於思或出
3. 各記：「此或然或不然。吾將驗，非假。」
4. 釋速識目之需——目在準述，非速標
5. 若覺析心趨框或標，止而引返原察

得：所宣之先念列，自「吾思知此為何」轉為「吾將察此實為何」。覺而納，不躁立論。

敗則：若假反復起（「然其實*乃* React」），延降溫。書其假於「泊處」之列而續。守特假時勿啟據集——其將染所察。

### 第二步：象畫——首觸（第一階）

以最微之察觸目。

1. 用 `Glob` 獨見頂層構（如 `*` 或 `path/*`）——尚勿讀任何文
2. 記汝之立、未濾之印：文數、命形、明標之有無
3. 以簡述記原察：
   - 「多小文」非「微服務之構」
   - 「深巢之所」非「企業 Java」
   - 「單大文」非「單體」
4. 解首印為二分：
   - **A**（活）：此活或寐？長或穩？簡或繁？
   - **B**（感）：此覺有序或亂？密或疏？熟或異？
5. 書 A、B 之察——此乃汝首數點

得：少之原、低層之察，述目表之徵。無名、無標、無構形——獨形、大、質。

敗則：若立分項目（「噢，此乃 Next.js 之應用」），宣為 AOL（第六步），自標下提原述（「JS 文、巢之 pages 所、package.json 在」），續以彼原察。

### 第三步：感印——原據（第二階）

系統聚目之原據而不釋。

```
Stage II Data Channels for Codebase Investigation:
┌──────────────────┬────────────────────────────────────────────────────┐
│ Channel          │ What to Observe                                    │
├──────────────────┼────────────────────────────────────────────────────┤
│ File patterns    │ Extensions, naming conventions, file sizes         │
│                  │ (NOT frameworks — just patterns)                   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Directory shape  │ Depth, breadth, nesting patterns, symmetry         │
├──────────────────┼────────────────────────────────────────────────────┤
│ Configuration    │ What config files exist? How many? What formats?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Dependencies     │ Lock files present? How large? How many entries?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Documentation    │ README present? How long? Other docs? Comments?    │
├──────────────────┼────────────────────────────────────────────────────┤
│ Test presence    │ Test directories? Test files? Ratio to source?     │
├──────────────────┼────────────────────────────────────────────────────┤
│ History signals  │ Presence of .git/, CHANGELOG/RELEASE_NOTES,        │
│                  │ lockfile timestamps (via Glob/Read if accessible)  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Energy/activity  │ Which areas changed recently? Which are dormant?   │
└──────────────────┴────────────────────────────────────────────────────┘
```

1. 各道用 `Glob`、`Grep` 與輕 `Read` 探之
2. 每道記一察——首印，勿深入
3. 用述語，非標：「73 .ts 文」非「TypeScript 項目」
4. 圈覺特要之察
5. 若一道無得，記「無察」而過
6. 諸道共瞄 10-20 數點

得：覺「現」非「假」之原察列。某者要，某者噪。據宜為低層述，非高層分。

敗則：若每察皆化分，已陷析。止，返象畫步，以新目再觸目。若一道主（盡為文察，無史），故移至少用之道。

### 第四步：維據——構（第三階）

自原察移至空與構之解。

1. 始繪目之構而不標之：
   - 何連何？（引、參、配指）
   - 大「區」為何，其相關如何？
   - 階層為何——平、巢、或混？
2. 輕讀數要文——入點、配文、README
3. 記關：「所 A 引自所 B」、「配文引 C 之路」
4. 略繪空：信於系中如何流？
5. 記美感影響（AI）——此碼庫感如何？善守？急？試驗？

得：略構圖附關注。目之大範（大/小、簡/繁、單/模）漸明。碼庫之「感」已捕。

敗則：若圖覺純猜，簡之：獨記可驗之連（實 import、實配引）。若無構形現，返第二階聚多原據——維解需察之基。

### 第五步：問訊——直問（第五階）

於古典 CRV，第四階深入析構；於碼庫察，此勞已故合於前維/構之階，故此改程進至第五階以行直問。

至此，且唯此時，對察具體問。

1. 各問明陳：「入點為何？」「數源為何？」「試覆如何？」
2. 各問用 `Grep` 與 `Read` 尋答——的，非探
3. 各問記首得
4. 記信等：高（直證）、中（推）、低（不確）
5. 明標諸第五階據——其 AOL 險高，蓋問定期

得：直問之具答，繫於已聚之原與構之據。信等誠。

敗則：若直問獨生 AOL（汝答自假而非證），返前階。CRV 程之有序有故——略察階而躍至問致不可信之答。

### 第六步：管 Analytical Overlay（AOL）

AOL 乃察之主誤源。析心過早標目時生之。全席皆管之。

```
AOL Types in Codebase Investigation:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Type             │ Description and Response                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL (labeling)   │ "This is a Django app" — Declare: "AOL: Django"│
│                  │ Extract raw descriptors: "Python files, urls.py,│
│                  │ migrations directory, settings module."         │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Drive        │ The label becomes insistent: "This HAS to be   │
│                  │ Django." Declare "AOL Drive" and pause. What    │
│                  │ evidence contradicts the label? Look for it.    │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Signal       │ The label may contain valid information. After  │
│                  │ declaring, extract: "Django" → "URL routing,    │
│                  │ ORM pattern, middleware chain." These raw        │
│                  │ descriptors are valid data even if "Django" is  │
│                  │ wrong.                                          │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Peacocking   │ An elaborate narrative: "This was built by a    │
│                  │ team that was migrating from Java and..." This  │
│                  │ is imagination, not signal. Declare "AOL/P" and │
│                  │ return to raw observation.                      │
└──────────────────┴─────────────────────────────────────────────────┘
```

律非避 AOL——乃識而宣之，使勿污察。每察皆生 AOL。技在汝捕之速。

得：AOL 起時頃即識，明宣之，察續以原述非標。

敗則：若 AOL 主（汝覺已自標推數步），立「AOL 休」。返第二階聚試標之新原察。重污之察宜於審中記之。

### 第七步：閉而審之

正式終察而合所得。

1. 按序審所聚之據：首印、原察、構據、直答、AOL 宣
2. 識最信之 5-10 察
3. 至此——且唯此時——立合：此系為何？如何行？要徵為何？
4. 記合之何部由證實，何部由推
5. 較合與第一步所宣之先念——何中？何誤？
6. 為用者或自後參書之

得：自原察建之目實解，非由形匹假。合勝速分之確，信等誠。

敗則：若合覺薄，前階或聚不足。然勿棄部分之得——「73 TypeScript 文、深巢之件構、活之 git 史、薄之試覆」之述勝誤標。準述為目，非識。

## 驗

- [ ] 據集前已宣諸先念
- [ ] 第一階察為原述，非標
- [ ] 第二階據過諸道集，非獨一
- [ ] 諸 AOL 識時即宣
- [ ] 諸階依序進（一→二→三→五），未躍至論
- [ ] 目盲近——無基於假之文之讀
- [ ] 合分證之得與推
- [ ] 察錄存供後參

## 陷

- **躍至識**：聚原察前尋「此何框？」必致 AOL 污
- **抑諸標**：欲不立假生張——代之以宣之而提原號
- **略降溫**：守假時啟察偏所有後察
- **獨確之尋**：假立後獨尋確證而忽矛盾
- **誤速為技**：速識覺勤而常誤。詳階察緩而生更準之解
- **道單**：獨於一鏡察（獨讀碼、獨察構）失他道之號

## 參

- `remote-viewing-guidance` — 人引變，AI 任 CRV 監/授
- `meditate` — 冥所發之心寂與清假直善察之質
- `heal` — 察露 AI 自之推偏時，自愈解其根
