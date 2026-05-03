---
name: teach
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  AI knowledge transfer calibrated to learner level and needs. Models the
  learner's mental state, scaffolds from known to unknown using Vygotsky's
  Zone of Proximal Development, employs Socratic questioning to verify
  understanding, and adapts explanations based on feedback signals. Use
  when a user asks "how does X work?" and needs graduated explanation,
  when their questions reveal a conceptual gap, when previous explanations
  have not landed, or when teaching a concept that depends on prerequisites
  the learner may not yet have.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, knowledge-transfer, scaffolding, socratic-method, meta-cognition
---

# 教

行結構化之知識傳遞——評估學習者當前理解、自已知至未知設鷹架、以校準之深度解釋、藉提問檢理解、依回饋調整、以實踐強化。

## 適用時機

- 用戶問「X 如何運作？」而答需逐級解釋，非資料傾倒
- 用戶之問揭示其當前理解與所需知間之差距
- 先前解釋未落地——用戶困惑或以不同方式問同問
- 教含用戶或無之先備條件之概念
- `learn` 已建深心智模型而今需有效溝通

## 輸入

- **必要**：欲教之概念、系統或技能
- **必要**：學習者（隱式可用——對話中之用戶）
- **選擇性**：已知學習者背景（專業度、背景、所述目標）
- **選擇性**：先前失敗之解釋（已試者）
- **選擇性**：時間／深度限制（速覽 vs. 深理解）

## 步驟

### 步驟一：評估——繪學習者

於解任何前，定學習者已知者與所需者。

```
Learner Calibration Matrix:
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Level        │ Explanation Pattern         │ Check Pattern            │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Novice       │ Analogy-first. Connect to  │ "In your own words, what │
│ (no domain   │ familiar concepts. Avoid   │ does X do?" Accept any   │
│ vocabulary)  │ jargon entirely. Concrete  │ correct paraphrase.      │
│              │ before abstract.           │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Intermediate │ Build on existing vocab.   │ "What would happen if    │
│ (knows terms,│ Fill gaps with targeted    │ we changed Y?" Tests     │
│ some gaps)   │ explanations. Use code     │ whether they can predict │
│              │ examples that are close    │ from understanding.      │
│              │ to their existing work.    │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Advanced     │ Skip fundamentals. Focus   │ "How would you compare   │
│ (strong base,│ on nuance, trade-offs,     │ X to Z approach?" Tests  │
│ seeks depth) │ edge cases. Reference      │ integration and judgment. │
│              │ source material directly.  │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Misaligned   │ Correct gently. Provide    │ "Let me check my under-  │
│ (confident   │ the right model alongside  │ standing — you're saying  │
│ but wrong)   │ why the wrong model feels  │ X?" Mirror back to       │
│              │ right. No shame signals.   │ surface the mismatch.    │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

1. 審用戶所言：其問、詞彙、所述目標
2. 對此特定主題分類其可能等級（人於某域可為高階而於另一為新手）
3. 識別 Vygotsky 近側發展區（ZPD）：剛超其當前所及但於支援下可達者
4. 註任何於正模型可落地前須處理之誤解
5. 識別最佳入點：其所知者與所需學者之連結？

**預期：** 對下列之清晰圖：學習者所知、所需知與連兩者之橋。評估應具體至可擇解釋策略。

**失敗時：** 若學習者等級不清，問校準題：「你熟 [先備概念] 嗎？」此非測驗——而為集資料以更佳教之。若問感尷尬，預設中階並依其應調整。

### 步驟二：設鷹架——橋已知至未知

自學習者已理解者築至新概念之路。

1. 識別錨：學習者必懂且與目標相關之一概念
2. 明示連結：「你所知之 X 於此新脈絡中如 Y 般運作，因為...」
3. 一次引一新念——勿於同句中含二新概念
4. 具體例先於抽象原則
5. 建層次複雜：先簡單版，再加細
6. 若先備缺，先教先備（小鷹架）再回主概念

**預期：** 設鷹架之路，每步建於前。學習者永不應感迷失，因每新念皆連於其已持者。

**失敗時：** 若已知與未知間之差過大而無法以單一鷹架，拆為多個較小步。若無熟錨（全新領域），用學習者所知之另域之類比。若類比不完美，承認其限：「此如 X，除...外」。

### 步驟三：解釋——校準深度與風格

以正等級、正模式遞解釋。

1. 以核心念於一句開——標題先於文章
2. 以步驟二建之鷹架擴之
3. 用學習者之詞彙，非該域之術語（除非高階）
4. 對代碼概念：示最小可運作例，非全面者
5. 對抽象概念：先提具體實例，再推廣
6. 對流程：逐步走特定案例，再陳一般規則
7. 監困惑徵：若下問未建於解釋，解釋未落地

**預期：** 學習者獲既不淺（留問）亦不深（以多餘細節壓倒）之解釋。解釋用其語並連其脈絡。

**失敗時：** 若解釋過長，核心念或被埋——重述一句之標題。若解釋後學習者更困惑，入點錯——試他錨或類比。若概念實為複雜，承認複雜而非藏之：「此有三部分且互動。我自第一始。」

### 步驟四：檢——驗理解

勿假設解釋有效。以揭學習者心智模型之問測之。

1. 問需應用而非回憶之題：「給 X，你料何發生？」
2. 求轉述：「能以你自己之話解釋此嗎？」
3. 提變化：「若改此一物呢？」
4. 尋具體理解：能否預測，非僅重複？
5. 若答揭誤解，註特定錯供步驟五
6. 若答正確，略推：能否推廣？

**預期：** 檢揭學習者是否有運作之心智模型，或僅鸚鵡學舌解釋。運作模型可處變化；記憶之解釋不能。

**失敗時：** 若學習者無法答檢題，解釋未建正心智模型。此非其失敗——而為對教之回饋。註具體未落地處並進步驟五。

### 步驟五：調整——應對回饋

依檢結果調教法。

1. 若理解紮實：進至強化（步驟六）或進下一概念
2. 若有特定誤解：以證據而非重複直接處之
3. 若有一般困惑：試完全不同之解釋法
4. 若學習者超評估：加速——略鷹架直入細
5. 若學習者落後評估：減速——教其所缺之先備

```
Adaptation Responses:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Signal           │ Adaptation                                       │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I think I get   │ Push gently: "Great — so what would happen      │
│ it"              │ if...?" Verify before moving on.                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I'm confused"   │ Change modality: if verbal, show code. If code, │
│                  │ use analogy. If analogy, draw a diagram.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ "But what about  │ Good sign — they are testing the model. Address  │
│ [edge case]?"    │ the edge case, which deepens understanding.      │
├──────────────────┼─────────────────────────────────────────────────┤
│ "That doesn't    │ They have a competing model. Explore it: "What   │
│ seem right"      │ do you think happens instead?" Reconcile the two.│
├──────────────────┼─────────────────────────────────────────────────┤
│ Silence or       │ They may be processing, or lost. Ask: "What      │
│ topic change     │ part feels least clear?" Lower the bar gently.   │
└──────────────────┴─────────────────────────────────────────────────┘
```

**預期：** 教即時依回饋調。無解釋以完全相同法重複——每重試用不同法。調整應感回應，非機械。

**失敗時：** 若多次調整嘗試皆失，問題或為基礎至雙方皆未識之先備缺。明問：「解釋之何部分感跳得最大？」此常揭隱藏之缺。

### 步驟六：強化——提供實踐

以應用而非重複固化理解。

1. 提需新概念之練習題（非陷阱題）
2. 若於編碼脈絡：建議用此概念對既碼小修
3. 若於概念脈絡：呈情境並請其應用模型
4. 連向前：「既已懂 X，此連 Y，可下次探」
5. 提供獨立探索之參考材料：文件連結、相關文件、進一步閱讀
6. 閉環：「總結我們所及...」——核心概念一句

**預期：** 學習者已至少應用概念一次，並具持續學習之資源。摘要為未來回憶錨定學習。

**失敗時：** 若練習題過難，教跳得太遠——簡化問題。若學習者可做練習但無法解其因，其有程序知識而無概念理解——回步驟三聚焦於「為何」而非「如何」。

## 驗證

- [ ] 解釋始前已評估學習者等級
- [ ] 解釋自已知至未知設鷹架，非以資料傾倒交付
- [ ] 至少問一檢題以驗理解（非假設）
- [ ] 教依回饋調而非重複同解釋
- [ ] 學習者可應用概念，非僅回憶解釋
- [ ] 誠實之缺已承認而非粉飾

## 常見陷阱

- **知識之詛咒**：忘學習者未共享教者之脈絡。術語、假設之先備與隱推理步為主犯
- **為印象而解釋而非為教**：全面、技術精確之解釋示知識卻棄學習者於後
- **重複而更大聲**：解釋未落地時以更強調重複而非試他法
- **以測代教**：以檢題作捕捉物而非診斷工具。目的為揭理解，非捕失敗
- **假設靜默為理解**：問之缺非示解釋有效——常意學習者不知問何
- **一刀切之深**：以「應懂全圖」為新手予高階解釋將壓垮；以「保險為佳」予專家初學者解釋浪費其時

## 相關技能

- `teach-guidance` — 為人成為更佳教者之教練之人引導變體
- `learn` — 系統知識獲取，建可教之之理解
- `listen` — 深受性注意，揭學習者所述問外之實需
- `meditate` — 教學集間清假設以新鮮對待每學習者
