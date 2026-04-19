---
name: assess-form
locale: wenyan-lite
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

評系統當前之結構形——其架構、剛性、壓力點、變動之能——以於蛻變起始前判轉化就緒。

## 適用時機

- 任何顯著建築變更前以解起點
- 系統覺「卡」然因不明
- 外部壓力（成長、市場移、技術債）積而應對不確
- 評所提之轉化於當前形下可行否
- 久存系統之定期健康查（年度形評）
- 補 `adapt-architecture`——先評後轉

## 輸入

- **必要**：欲評之系統（碼庫、組織、基礎設施、流程）
- **選擇性**：所提之轉化方向（系統或須化為何？）
- **選擇性**：已知之痛點或壓力源
- **選擇性**：先前轉化嘗試與其結果
- **選擇性**：潛在轉化之時間範圍
- **選擇性**：可用於轉化努力之資源

## 步驟

### 步驟一：清點當前形

不評斷地將系統之結構元素編目——評之前先解其存。

1. 對應結構元件：
   - **模組**：獨之功能單元（服務、團隊、套件、部門）
   - **介面**：模組如何連（API、協定、契約、報告線）
   - **資料流**：資訊如何於系統中移
   - **依賴**：何依何（直接、傳遞、循環）
   - **承重結構**：他一切所依之元件
2. 記形之齡與史：
   - 各主元件何時引？
   - 何元件近期變 vs. 仍靜？
   - 「地質層」結構為何（舊核、新增、近補）？
3. 辨形之「骨」與「肉」：
   - 骨：變之極繁之結構決策（語言、資料庫、部署模型）
   - 肉：較易變之功能決策（業務邏輯、UI、配置）

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

**預期：** 完整結構清單呈元件、其齡、修改近期、依賴剖面、骨或肉之分類。此為當前形之「X 光」。

**失敗時：** 若清單不全（元件未知或無記載），此本身為發現——形有不透明，乃轉化之險。記可記者，標未知，並計畫為缺發現。

### 步驟二：對應轉化壓力

辨推系統向變之力與抗之力。

1. 列外部壓力（求變之力）：
   - 成長壓：當前形不能應增載
   - 市場壓：競爭或使用者求當前形不能支之能
   - 技術壓：底層技術漸過時或不支
   - 法規壓：當前形不合之合規要求
   - 整合壓：須與當前形未為其設計之系統連
2. 列內部壓力（自內求變之力）：
   - 技術債：累積之捷徑緩開發
   - 知識集中：關鍵知識為過少人持
   - 士氣壓：團隊對當前形之挫
   - 運營負擔：維護成本耗本應投開發之資源
3. 列抗力（反變之力）：
   - 慣性：既有形「足以」工
   - 依賴鎖定：過多事依當前形
   - 知識失之險：轉化或毀機構知識
   - 成本：轉化需投資而回報不確
   - 懼：先前轉化嘗試失敗

**預期：** 壓力圖呈對系統之力之向與量。若轉化壓力顯超抗力，轉化逾時。若抗力顯超壓力，轉化將失敗，須先減抗力。

**失敗時：** 若壓力對應產平衡之圖（壓力與抗力皆不強），系統或不需轉化——或分析為表面。深掘：訪利害關係人、量特定痛點、向前投 12-18 月。何壓力將強？

### 步驟三：評結構剛性

判當前形之彈或剛——能彎，抑或將斷？

1. 試介面彈性：
   - 模組可換而無連動變更否？（鬆耦合 = 彈）
   - 介面定義良好且穩否？（契約清 = 彈）
   - 存幾「神模組」（一切所依之模組）？（集中 = 剛）
2. 試資料彈性：
   - 資料遷移直截否？（schema 演進工具、版本控制）
   - 資料格式標準或客製？（客製 = 剛）
   - 業務邏輯與資料結構糾纏多深？（糾纏 = 剛）
3. 試流程彈性：
   - 團隊可速出貨變更否？（部署管線健康）
   - 測試套件全否？（變動之安全網）
   - 存幾「勿觸」元件？（禁區 = 剛）
4. 計算剛性分：

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

**預期：** 量化轉化將遇之結構抗力之剛性分。彈性系統（6-9）可漸進轉化。剛性系統（14-18）需重建前先溶解（見 `dissolve-form`）。

**失敗時：** 若剛性評估不確（中分而真問題不清），重於分最高之維。系統可整體彈而有一極剛元件阻轉化。針對該元件特行。

### 步驟四：估變動之能

評系統（與團隊）吸納並執行轉化之能。

1. 可用之轉化能量：
   - 團隊能配多少百分比於轉化？
   - 有組織支持否（預算、授權、耐心）？
   - 有合適技能否（架構、遷移、測試）？
2. 變動吸納率：
   - 系統每時可吸納多少變動而不失穩？
   - 顯著變動後之復原時為何？
   - 有 staging/canary 機制以漸進轉化否？
3. 轉化經驗：
   - 團隊曾成功轉化類系統否？
   - 有轉化工具與實踐就位否（特性旗標、絞殺榕、blue-green）？
   - 團隊之風險容忍為何？
4. 計算變動之能：
   - 高能：專團、強工具、先前經驗、組織支持
   - 中能：兼職配置、有些工具、有限經驗
   - 低能：無專資源、無工具、無經驗、抗組織

**預期：** 變動之能評估，示系統／團隊以當前資源、技能、組織支持是否能執所提轉化。

**失敗時：** 若變動之能低而轉化壓力高，首要轉化非系統——而為團隊之能力。先投工具、訓練、組織共識，後試建築轉化。

### 步驟五：分類轉化就緒

合壓力、剛性、能評估為就緒分類。

1. 將系統繪於就緒矩陣：

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

2. 記就緒分類附：
   - 分類標籤（READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER）
   - 各評估維之關鍵發現
   - 建議下步
   - 可改分類之風險因子
3. 若 READY：進至 `adapt-architecture`
4. 若 PREPARE：進至 `dissolve-form` 以減剛性
5. 若 INVEST：建能（訓練、工具、組織支持），後重評
6. 若 CRITICAL：同時應對能與剛性（或需外援）
7. 若 OPTIONAL/DEFER：記評估並設重評日

**預期：** 清晰、有理之轉化就緒分類，附特定下步。分類使對何時與如何轉化之知情決策成為可能。

**失敗時：** 若分類曖昧（如中壓、中剛、中能），預設 PREPARE——漸進減剛性而監壓力。此建能力並減險，無論最終是否需全轉化。

## 驗證

- [ ] 結構清單完整附元件、齡、依賴、類型
- [ ] 轉化壓力已對應（外、內、抗力）
- [ ] 剛性分已跨諸維計
- [ ] 變動之能已評（資源、吸納率、經驗）
- [ ] 就緒分類已定附有理推理
- [ ] 依分類記下步
- [ ] 重評日已設（即使當前 READY）

## 常見陷阱

- **僅評技術系統**：轉化就緒含組織就緒。技術上彈而組織上剛之團隊仍將不能轉化
- **樂觀估能**：團隊持續高估其於維常運下變動之能。以宣稱能之 50% 為實際估
- **忽抗力**：僅列變動力之壓力對應失將緩或止轉化之抗力。抗力常較其表面更強
- **評估癱瘓**：形評估應費時數小時至數日，非數週。若費時過長，系統過繁難全評——於更高抽象層評並深入問題區
- **混剛性與穩定**：剛系統異於穩系統。穩來自良設計之彈性；剛為設計彈性之缺

## 相關技能

- `adapt-architecture` — 主要轉化技能；assess-form 為其判就緒
- `dissolve-form` — 對分為 PREPARE 或 CRITICAL 之系統，轉化前減剛性
- `repair-damage` — 對需修復才能有意評估之系統
- `shift-camouflage` — 表面適應，可能無需全轉化即可解壓力
- `forage-resources` — 資源探究告知形評估，當問題為「我們應化為何？」時
- `review-software-architecture` — 詳技術架構評之互補技能
- `assess-context` — AI 自應用變體；將結構評估對應於推理情境之可塑性、剛性對應、轉化就緒
