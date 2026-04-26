---
name: observe
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Sustained neutral pattern recognition across systems without urgency or
  intervention. Maps naturalist field study methodology to AI reasoning:
  framing the observation target, witnessing with sustained attention,
  recording patterns, categorizing findings, generating hypotheses, and
  archiving a pattern library for future reference. Use when a system's
  behavior is unclear and action would be premature, when debugging an
  unknown root cause, when a codebase change needs its effects witnessed
  before further changes, or when auditing own reasoning patterns for
  biases or recurring errors.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, pattern-recognition, naturalist, field-study, meta-cognition
---

# 觀察

施行結構化之觀察會話——立觀察目標之框、以持續中立之注意見證、不釋之而錄模式、歸類發現、由模式生假設，並歸檔觀察以備將來。

## 適用時機

- 系統行為不明，未經觀察即行動則過早
- 除錯時因不明，觀察先於介入可免遮症
- 代碼庫或系統已變，須見證其效後再作變
- 透過會話了解用戶行為模式以改進未來互動
- 稽核己之推理模式，察其偏差、習慣或重複之錯誤
- `learn` 已建模型，須觀察系統運作以驗之

## 輸入

- **必要**：觀察目標——系統、代碼庫、行為模式、用戶互動或推理過程
- **選擇性**：觀察持續時間/範圍——觀察多久或多深方下結論
- **選擇性**：引導觀察焦點之具體問題或假設
- **選擇性**：可資對比之先前觀察（隨時間之變化偵測）

## 步驟

### 步驟一：立框——設觀察焦點

定義所觀察者、何故、自何視角。

```
Observation Protocol by System Type:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ System Type      │ What to Observe          │ Categories to Watch      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ File structure, naming   │ Patterns, anti-patterns, │
│                  │ conventions, dependency  │ consistency, dead code,  │
│                  │ flow, test coverage,     │ documentation quality,   │
│                  │ error handling patterns  │ coupling between modules │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User behavior    │ Question patterns,       │ Expertise signals, pain  │
│                  │ vocabulary evolution,    │ points, unstated needs,  │
│                  │ repeated requests,       │ learning trajectory,     │
│                  │ emotional signals        │ communication style      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool / API       │ Response patterns, error │ Rate limits, edge cases, │
│                  │ conditions, latency,     │ undocumented behavior,   │
│                  │ output format variations │ state dependencies       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Own reasoning    │ Decision patterns, tool  │ Biases, habits, blind    │
│                  │ selection habits, error  │ spots, strengths,        │
│                  │ recovery approaches,     │ recurring failure modes, │
│                  │ communication patterns   │ over/under-confidence    │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. 擇觀察目標並明命之
2. 定觀察邊界：何在內、何在外
3. 述觀察立場：「我觀察，不介入」
4. 若有引導問題，述之——然輕持之；願察問題範圍外之事
5. 自上表擇適之類別

**預期：** 清晰之框，引導注意而不束縛之。觀察者知何處看、觀察歸於何類，仍對意外保持開放。

**失敗時：** 若觀察目標過廣（「觀察一切」），縮至一子系統或一行為模式。若過窄（「觀察此一變數」），縮至周圍上下文——有趣之模式常於邊緣。

### 步驟二：見證——持續中立之注意

持注意於觀察目標而不釋、不判、不介。

1. 始系統化觀察：讀檔、追蹤執行路徑、覽對話歷史——目標所需之事
2. 錄所見，非其義——描述先於釋
3. 抗觀察中遇問題即修之欲——記之而續
4. 抗於觀察累積足夠前釋模式之欲
5. 若注意飄向他目標，記其飄（或有意義）並回原框
6. 維持觀察一定期：至少 3-5 個獨立資料點，方移至歸類

**預期：** 一組原始觀察——具體、實在、無釋。觀察讀如田野筆記：「檔 X 引入 Y 而不用函式 Z。檔 A 有 300 行；檔 B 有 30 行而涵蓋類似功能。」

**失敗時：** 若觀察即觸發分析（「此誤，因…」），則分析習慣壓觀察立場。意識分諸階段：先寫觀察為事實，再寫釋為獨立筆記，標為「假設」。若中立不可（對所觀有強反應），記反應本身為資料：「我觀察 X 時感強憂——或顯重要問題，或顯吾之偏見。」

### 步驟三：記錄——捕原始模式

當觀察新鮮時，將之轉為結構化格式。

1. 將每觀察列為一事實之單一陳述（所見、何處、何時）
2. 自然相似之觀察分群——勿強分群，但察之何時聚
3. 記頻率：此模式現一次、偶爾或普遍？
4. 記對比：模式於何處斷？例外常較規則更具信息
5. 記時間模式：觀察隨時間變還是靜？
6. 捕確切證據：檔路徑、行號、具體字、實在範例

**預期：** 5-15 個離散觀察之結構化記錄，每附具體證據。記錄詳實足夠，他觀察者可獨立驗每一觀察。

**失敗時：** 若觀察過抽象（「代碼似亂」），須以具體紮根——何檔、何模式、何使之亂？若觀察過細粒（「第 47 行括號前有空格」），縮至模式層次——此乃孤例還是系統性問題？

### 步驟四：歸類——組織發現

將觀察分入有意義之類，尚不釋之。

1. 覽所有錄之觀察，尋自然之分群
2. 將每觀察歸於步驟一表中之類，或必要時建新類
3. 每類內，依頻率與重要性排觀察
4. 辨何類有眾多觀察（已記錄之區）與何類少（潛在盲點）
5. 尋跨類模式：同一底層模式在不同類中是否異形顯現？
6. 記不合任何類之觀察——離群者常為最有趣之資料

**預期：** 一張歸類觀察圖，分群清晰。每類有支持之具體觀察。圖示模式與缺口。

**失敗時：** 若歸類感勉強，觀察或無自然分群——或為一組不相關之發現，此自身亦為發現（系統或缺一致結構）。若一切皆整齊歸於一類，則觀察範圍過窄——縮之。

### 步驟五：理論——由模式生假設

至此——僅至此——始釋觀察。

1. 對每主要模式所觀者，提一假設：「此模式存，因…」
2. 對每假設，自觀察中辨支持之證據
3. 對每假設，辨何反證可駁之
4. 依解釋力排假設：何者解釋最多觀察？
5. 至少生一相反假設：「明顯解釋為 X，然亦可為 Y，因…」
6. 辨何假設可測，何為臆測

**預期：** 2-4 個假設解釋諸主要模式，每附具體觀察支持。至少一假設出乎意料或相反。觀察與釋之分維持——資料與理論之部分分明。

**失敗時：** 若無假設成形，觀察或須累積更久——回步驟二。若假設過多（皆「或」），擇 2-3 證據最強者，餘擱置。若僅形成明顯假設，強迫相反觀：「若反之為真又如何？」

### 步驟六：歸檔——存模式庫

存觀察與假設以備將來參考。

1. 摘要關鍵發現：3-5 個附證據之模式
2. 述主導假設與其信心水準
3. 記未觀察之事（潛在盲點）
4. 辨何後續觀察可加強或削弱假設
5. 若模式持久（跨會話皆相關），考更新 MEMORY.md
6. 標觀察以上下文：何時所為、何所引發、所涵範圍

**預期：** 可供未來觀察會話建立其上之檔案。檔案明分觀察（資料）與假設（釋）。對信心水準與缺口誠實。

**失敗時：** 若觀察不值歸檔，或太膚淺——或實屬例行（非每觀察會話皆生洞見）。即負面結果亦歸檔：「觀察 X 而無異常」對未來上下文有用。

## 驗證

- [ ] 觀察開始前已立觀察框（非自由漫遊）
- [ ] 原始觀察作為事實先記錄，後釋
- [ ] 至少捕 5 個離散觀察附具體證據
- [ ] 釋（假設）與觀察（資料）分明
- [ ] 至少生一意外或相反之發現
- [ ] 歸檔之記錄具體足夠，他觀察者可驗

## 常見陷阱

- **過早介入**：見問題即修之，失機以了解其所屬之更廣模式
- **觀察偏差**：所見為所期而非所在。期望濾感知——步驟一之清除可緩之而不能除之
- **分析癱瘓**：永觀而從不行動。設時間或資料點之限，承諾下結論
- **強加敘事**：構故事連觀察，縱連結弱亦然。非所有觀察皆成連貫敘事——不相干之發現亦有效
- **混熟悉與了解**：「我曾見此」非同「我了解此何在」。先前接觸可生虛妄之自信
- **忽略己之反應**：觀察者對觀察之情感或認知反應為資料。對系統之困惑、無聊或警覺常含真實訊號

## 相關技能

- `observe-guidance` — 指導他人施行系統化觀察之變體
- `learn` — 觀察為學習供原始資料以建模
- `listen` — 對外向之注意專於用戶訊號；觀察為對任何系統之更廣範圍之注意
- `remote-viewing` — 直觀探索，可透過系統化觀察驗證
- `meditate` — 培養觀察所需之持續注意能力
- `awareness` — 威脅向之情境警覺；觀察由好奇而非防禦驅動
