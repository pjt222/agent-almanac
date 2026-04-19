---
name: assess-form
locale: wenyan
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

# 察形

察系當前結構之形——其架構、剛、壓點、變之能——以定啟蛻前之備。

## 用時

- 重架構變前解起點乃用
- 系覺「滯」而因不明乃用
- 外壓（長、市變、技債）積而應不定乃用
- 估擬之蛻於當前形可行乎乃用
- 長壽系之期察（年察形）乃用
- 補 `adapt-architecture`——先察後蛻乃用

## 入

- **必要**：待察之系（碼庫、組織、基、程）
- **可選**：擬之蛻向（系或當為何？）
- **可選**：已知之痛點或壓源
- **可選**：前蛻之試與果
- **可選**：潛蛻之時限
- **可選**：蛻之可得資源

## 法

### 第一步：錄當前之形

錄系結構之元而不評——解所存而後評之。

1. 映結構元：
   - **模**：別功單（服、隊、包、部）
   - **界**：模如何連（API、協、約、匯報線）
   - **數流**：信息於系如何動
   - **依**：何依於何（直、遞、環）
   - **承載結構**：諸他皆依之元
2. 書形之齡與史：
   - 各主元何時引？
   - 何元近變、何元靜？
   - 「地層」構（老核、新增、近補）為何？
3. 識形之「骨」於「肉」：
   - 骨：極費以變之結構決（語、庫、部署）
   - 肉：易變之功決（業邏、UI、設）

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

**得：** 全結構錄顯元、齡、近改、依式、骨肉分類。此當前形之 X 光也。

**敗則：** 若錄不全（元未知或未書），此本為發現——形有不透，為蛻險。書可察者，標未知，計補隙。

### 第二步：映蛻變壓

識推系向變之力與抗之力。

1. 錄外壓（求變之力）：
   - 長壓：當前形不能承增載
   - 市壓：競或用要當前形不能之能
   - 技壓：底技將廢或失支
   - 規壓：當前形不合之合規求
   - 整壓：當前形未設之系需連
2. 錄內壓（內求變之力）：
   - 技債：累之短切緩開
   - 知集中：關知由寡人持
   - 士氣壓：隊對當前形之厭
   - 運擔：守耗當開之資
3. 錄抗力（抗變之力）：
   - 慣：當前形「足」行
   - 依鎖：諸物依當前形
   - 知失險：蛻或壞機構知
   - 費：蛻需投資附不定返
   - 懼：前蛻試敗

**得：** 示系所受力向與幅之壓圖。若蛻壓大勝抗，蛻過時。若抗大勝壓，先減抗而蛻敗。

**敗則：** 若壓映示衡（無強壓無強抗），系或不需蛻——或析表淺。深察：訪相關者、量具痛點、前瞻 12-18 月。何壓將增？

### 第三步：察結構剛

定當前形柔剛——能曲乎、將崩乎？

1. 試界柔：
   - 模可易換不連變乎？（鬆耦 = 柔）
   - 界明定穩乎？（約明 = 柔）
   - 幾「神模」（諸依之模）？（集中 = 剛）
2. 試數柔：
   - 數遷順乎？（模演具、版控）
   - 數式標乎、特乎？（特 = 剛）
   - 業邏與數構纏乎？（纏 = 剛）
3. 試程柔：
   - 隊可速發變乎？（部署管健）
   - 試套全乎？（變之安網）
   - 幾「勿觸」元？（禁區 = 剛）
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

**得：** 剛分量蛻將遇結構抗之多。柔系（6-9）可漸蛻。剛系（14-18）需溶而重（見 `dissolve-form`）。

**敗則：** 若剛察歧（中分而不清真患何），注最高維。系可整柔而有一極剛元阻蛻。目此元。

### 第四步：估變能

察系（與隊）收行蛻之能。

1. 可得蛻能：
   - 隊能幾割分於蛻？
   - 有組織支（預算、授權、耐）乎？
   - 正技（架構、遷、試）可得乎？
2. 變吸率：
   - 系每時可吸幾變而不穩？
   - 重變後復時？
   - 有漸蛻之備/灰機制乎？
3. 蛻經：
   - 隊曾成蛻類系乎？
   - 蛻具與實（功能旗、絞榕、藍綠）存乎？
   - 隊之險容？
4. 算變能：
   - 高能：專隊、強具、前經、組織支
   - 中能：部分分、些具、限經
   - 低能：無專資、無具、無經、抗之組織

**得：** 變能察示系/隊能依當前資、技、組織支行擬蛻乎。

**敗則：** 若變能低而蛻壓高，首蛻非系——乃隊能也。投具、訓、組織認可於試架構蛻前。

### 第五步：分蛻備

合壓、剛、能察為備分類。

1. 繪系於備矩：

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

2. 書備分類：
   - 標（READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER）
   - 每察維之要發現
   - 薦下步
   - 可變分類之險因
3. 若 READY：進 `adapt-architecture`
4. 若 PREPARE：進 `dissolve-form` 減剛
5. 若 INVEST：建能（訓、具、組織支），再察
6. 若 CRITICAL：同治能與剛（或需外助）
7. 若 OPTIONAL/DEFER：書察而定再察日

**得：** 清證之蛻備分類附具下步。分使何時何以蛻之明決。

**敗則：** 若分歧（中壓、中剛、中能），默 PREPARE——漸減剛而察壓。此建能減險，無論全蛻終需否。

## 驗

- [ ] 結構錄全附元、齡、依、類
- [ ] 蛻變壓映（外、內、抗力）
- [ ] 剛分於諸維算
- [ ] 變能察（資、吸率、經）
- [ ] 備分類定附證之推
- [ ] 下步依分類書
- [ ] 再察日定（雖當前 READY）

## 陷

- **只察技系**：蛻備含組織備。技柔系而組織剛隊仍敗於蛻
- **樂觀能估**：隊恆估其變能過高而守常運。以宣能之半為實估
- **忽抗力**：只錄變力之壓映失將緩或止蛻之抗。抗常強於所顯
- **察癱**：形察宜時至日，非週。若過久，系過繁不可全察——於高抽察而深入問區
- **混剛於穩**：剛系非穩系。穩來於良設之柔；剛為無設之柔

## 參

- `adapt-architecture` — 主蛻技；assess-form 定備
- `dissolve-form` — PREPARE 或 CRITICAL 之系蛻前減剛
- `repair-damage` — 察前需修之系
- `shift-camouflage` — 表級適或解壓無需全蛻
- `forage-resources` — 資源探啟「當為何」之形察
- `review-software-architecture` — 詳技架構評之補
- `assess-context` — AI 自用之變；映結構察於推境之可塑、剛映、蛻備
