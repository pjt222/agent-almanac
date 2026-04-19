---
name: assess-form
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Evaluate a system's current structural form, identify transformation pressure,
  and classify transformation readiness. Covers structural inventory, pressure
  mapping, rigidity assessment, change capacity estimation, and readiness
  classification for architectural metamorphosis. Use before any significant
  architectural change to understand the starting point, when a system feels
  stuck without clear reasons, when external pressure from growth or tech debt
  is mounting, or as periodic health checks for long-lived systems.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: basic
  language: natural
  tags: morphic, assessment, architecture, transformation-readiness
---

# 評形

評系今構形——構、剛、壓、變能——以定變備於變起前。

## 用

- 大構變前知始點→用
- 系似「卡」而由不清→用
- 外壓（長、市轉、技債）積而應不確→用
- 評擬變於今形可行否→用
- 久存系之常檢（年形評）→用
- 補 `adapt-architecture` ——先評後變→用

## 入

- **必**：欲評之系（庫、組、設、程）
- **可**：擬變向（系當為何）
- **可**：知痛或壓源
- **可**：前變試與其果
- **可**：潛變時域
- **可**：可達變資

## 行

### 一：錄今形

無判錄系構件——評前知所存。

1. 圖構件：
   - **模**：獨功單（服、隊、包、部）
   - **介**：模如何接（API、協、契、報線）
   - **數流**：信如何於系行
   - **依**：何依何（直、傳、循）
   - **承載構**：諸他賴之件
2. 文形齡與史：
   - 各大件何時入？
   - 何件近變對留靜？
   - 「地層」構（古核、新加、近補）為何？
3. 識形之「骨」對「肉」：
   - 骨：變極貴之構決（言、庫、部模）
   - 肉：易變之功決（商邏、UI、設）

```
Structural Inventory Template:
┌──────────────┬──────────┬────────────┬───────────────────┬──────────┐
│ Component    │ Age      │ Last       │ Dependencies      │ Type     │
│              │          │ Modified   │ (in / out)        │          │
├──────────────┼──────────┼────────────┼───────────────────┼──────────┤
│ Auth service │ 3 years  │ 6 months   │ In: 12 / Out: 3  │ Skeleton │
│ Dashboard UI │ 1 year   │ 2 weeks    │ In: 2 / Out: 5   │ Flesh    │
│ Data pipeline│ 4 years  │ 1 year     │ In: 3 / Out: 8   │ Skeleton │
│ Config store │ 2 years  │ 3 months   │ In: 0 / Out: 15  │ Skeleton │
└──────────────┴──────────┴────────────┴───────────────────┴──────────┘
```

得：完構錄示件、其齡、近改、依形、骨/肉分。此即今形之「X 光」。

敗：錄不全（件未知或無文）→自為發——形有不透，乃變險。文可知者、標未知、計缺探。

### 二：圖變壓

識推系向變之力與抗之力。

1. 錄外壓（求變之力）：
   - 長壓：今形不能負日載
   - 市壓：競或用求今形不支之能
   - 技壓：底技將舊或不支
   - 規壓：今形不滿之合規需
   - 接壓：須接今形未為之系
2. 錄內壓（內求變之力）：
   - 技債：累捷致開緩
   - 知聚：關知於少人
   - 士氣：隊對今形之挫
   - 操負：維耗本當為開之資
3. 錄抗力（對變之力）：
   - 慣性：今形「足好」
   - 依鎖：諸物賴今形
   - 知失險：變或毀體知
   - 本：變需投而回不確
   - 懼：前變試敗

得：壓圖示影系力之向與量。變壓大過抗→變宜遲。抗大過壓→變必先減抗否則敗。

敗：壓圖出衡（壓抗皆不強）→系或不需變——或析淺。深探：問利者、量具痛、前推 12-18 月。何壓將強？

### 三：評構剛

定今形柔剛——可彎或破？

1. 測介柔：
   - 模可代而無連動乎？（鬆耦=柔）
   - 介定明穩乎？（契清=柔）
   - 「神模」（諸物賴之模）幾？（聚=剛）
2. 測數柔：
   - 數遷易乎？（規演工、版）
   - 數式標或客？（客=剛）
   - 商邏與數構纏乎？（纏=剛）
3. 測程柔：
   - 隊可速發變乎？（部管健）
   - 測套全乎？（變之安網）
   - 「勿觸」件幾？（禁區=剛）
4. 算剛分：

```
Rigidity Assessment:
┌──────────────────────┬─────┬──────────┬──────┬──────────────────────┐
│ Dimension            │ Low │ Moderate │ High │ Your Assessment      │
├──────────────────────┼─────┼──────────┼──────┼──────────────────────┤
│ Interface coupling   │ 1   │ 2        │ 3    │ ___                  │
│ God module count     │ 1   │ 2        │ 3    │ ___                  │
│ Data entanglement    │ 1   │ 2        │ 3    │ ___                  │
│ Deployment friction  │ 1   │ 2        │ 3    │ ___                  │
│ Test coverage gaps   │ 1   │ 2        │ 3    │ ___                  │
│ "Don't touch" zones  │ 1   │ 2        │ 3    │ ___                  │
├──────────────────────┼─────┴──────────┴──────┼──────────────────────┤
│ Total (max 18)       │ 6-9: flexible         │ ___                  │
│                      │ 10-13: moderate        │                      │
│                      │ 14-18: rigid           │                      │
└──────────────────────┴───────────────────────┴──────────────────────┘
```

得：剛分量變遇之構抗。柔系（6-9）可漸變。剛系（14-18）需溶後重建（見 `dissolve-form`）。

敗：剛評不結（中分而真題不清）→注最高分維。系可全柔而一極剛件阻變。標彼件。

### 四：估變能

評系（與隊）吸與行變之能。

1. 可達變能：
   - 隊能何分可給變？
   - 有組支（預、令、忍）乎？
   - 對技在乎（構、遷、測）？
2. 變吸率：
   - 系每時可吸幾變不致不穩？
   - 大變後復時何？
   - 有階/金絲機為漸變乎？
3. 變經：
   - 隊曾成變似系乎？
   - 有變工與例（特旗、絞榕、藍綠）乎？
   - 隊險忍何？
4. 算變能：
   - 高：專隊、強工、前經、組支
   - 中：兼職、某工、限經
   - 低：無專資、無工、無經、抗組

得：變能評示系/隊以今資、技、組支可行擬變否。

敗：變能低而變壓高→首變非系——乃隊能。先投工、訓、組同意再試構變。

### 五：分變備

合壓、剛、能評為備分。

1. 圖系於備矩：

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — Transform now  │ PREPARE — Reduce       │
│ + High Capacity │ using adapt-architecture│ rigidity first, then   │
│                 │                        │ use dissolve-form       │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — Build capacity│ CRITICAL — Invest in   │
│ + Low Capacity  │ first, then transform  │ capacity AND reduce    │
│                 │                        │ rigidity before change │
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ OPTIONAL — Transform   │ DEFER — No urgency,    │
│ + Any Capacity  │ if strategic value is  │ monitor pressure and   │
│                 │ clear, otherwise defer │ reassess quarterly     │
└─────────────────┴────────────────────────┴────────────────────────┘
```

2. 文備分附：
   - 分標（READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER）
   - 各評維要發
   - 薦次步
   - 變分之險因
3. READY→入 `adapt-architecture`
4. PREPARE→入 `dissolve-form` 減剛
5. INVEST→建能（訓、工、組支）後重評
6. CRITICAL→同處能與剛（或需外助）
7. OPTIONAL/DEFER→文評、設重評日

得：明、證之變備分附具次步。分使知決何時與如何變。

敗：分含糊（如中壓、中剛、中能）→默 PREPARE——漸減剛而監壓。建能減險不論全變終是否需。

## 驗

- [ ] 構錄完附件、齡、依、類
- [ ] 變壓圖（外、內、抗）
- [ ] 剛分跨諸維算
- [ ] 變能評（資、吸率、經）
- [ ] 備分定附證理
- [ ] 次步按分文
- [ ] 重評日設（即今 READY）

## 忌

- **唯評技系**：變備含組備。技柔系而組剛隊仍變敗
- **樂觀能估**：隊恆過估持常操之變能。用 50% 述能為實估
- **忽抗力**：壓圖唯錄變力失緩或止變之抗。抗常較表強
- **評癱**：形評當時至日，非週。久→系太繁不能全評——升抽象階評而入題區
- **混剛於穩**：剛系非穩系。穩自設善之柔；剛乃設柔之缺

## 參

- `adapt-architecture` —— 主變技；assess-form 定備
- `dissolve-form` —— 分為 PREPARE 或 CRITICAL 之系，變前減剛
- `repair-damage` —— 評有意前需修之系
- `shift-camouflage` —— 表變或解壓無須全變
- `forage-resources` —— 資探告形評於問「當為何」
- `review-software-architecture` —— 詳技構評之伴技
- `assess-context` —— AI 自施變；圖構評於推脈塑、剛圖、變備
