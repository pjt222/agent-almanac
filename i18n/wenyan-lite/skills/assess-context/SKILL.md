---
name: assess-context
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI context assessment — evaluating problem malleability, mapping structural
  rigidity versus flexibility, analyzing transformation pressure, and estimating
  capacity to adapt. Use when a complex task feels stuck and it is unclear
  whether to push through or pivot, before a significant approach change to
  assess whether the current reasoning structure can support it, when accumulated
  workarounds suggest the underlying approach may be wrong, or as a periodic
  structural health check during extended multi-step tasks.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, assessment, context-evaluation, malleability, meta-cognition, ai-self-application
---

# 評情境

評當前推理情境之可塑性——辨何元素剛（不可變）、何彈性（可廉變）、何處轉化壓力積、當前法是否有應變之能。

## 適用時機

- 繁任務覺卡且不明應推進或轉
- 顯著變法前評當前推理結構是否能支
- 累積之變通示底層法或誤
- 經 `heal` 或 `awareness` 已辨偏移然宜應（續、調或重建）不明時
- 情境已長且不明可保多少 vs. 須重建多少
- 久多步任務中之定期結構健康查

## 輸入

- **必要**：當前任務情境與推理態（隱式可用）
- **選擇性**：觸評估之特定關切（如「我屢加變通」）
- **選擇性**：所提之轉向（法或須化為何？）
- **選擇性**：先前評估結果以資趨勢分析

## 步驟

### 步驟一：清點推理形

不評斷地將當前推理法之結構元件編目。

```
Structural Inventory Table:
┌────────────────────┬──────────────┬──────────────────────────────────┐
│ Component          │ Type         │ Description                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Main task          │ Skeleton     │ The user's core request — cannot │
│                    │              │ change without user direction     │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Sub-task breakdown │ Flesh        │ How the task is decomposed —     │
│                    │              │ can be restructured               │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Tool strategy      │ Flesh        │ Which tools are being used and   │
│                    │              │ in what order — can be changed    │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Output plan        │ Flesh/Skel   │ The expected deliverable format  │
│                    │              │ — may be constrained by user     │
│                    │              │ expectations                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Key assumptions    │ Skeleton     │ Facts treated as given — may be  │
│                    │              │ wrong but are load-bearing        │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Constraints        │ Skeleton     │ Hard limits (user-imposed, tool  │
│                    │              │ limitations, time)                │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Workarounds        │ Scar tissue  │ Patches for things that didn't   │
│                    │              │ work as expected — signals of     │
│                    │              │ structural stress                 │
└────────────────────┴──────────────┴──────────────────────────────────┘
```

分類各元件：
- **Skeleton（骨）**：難變；變之則下游皆連動
- **Flesh（肉）**：易變；可換而不影他元件
- **Scar tissue（疤）**：示結構問題之變通；常為偽裝為骨之肉

對應依賴：何元件依何？多依賴之骨元件為承重。無依賴之肉元件為可棄。

**預期：** 完整清單呈當前法所構自何、何剛、何彈、壓力於何處可見（變通）。清單應揭編目前不顯之結構。

**失敗時：** 若清單難構（法過糾結難拆），此本身為發現——高結構不透明示高剛性。自可見者起並注不透明區。

### 步驟二：對應轉化壓力

辨推當前法向變之力與抗之力。

```
Pressure Map:
┌─────────────────────────┬──────────────────────────────────────────┐
│ External Pressure       │ Forces from outside the reasoning        │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ New information         │ Tool results or user input that          │
│                         │ contradicts current approach              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool contradictions     │ Tools returning unexpected results that  │
│                         │ the current approach cannot explain       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Time pressure           │ The current approach is too slow for the │
│                         │ complexity of the task                    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Internal Pressure       │ Forces from within the reasoning         │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Diminishing returns     │ Each step yields less progress than the  │
│                         │ previous one                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Workaround accumulation │ The number of patches is growing —       │
│                         │ complexity is outpacing the structure     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Coherence loss          │ Sub-tasks are not fitting together       │
│                         │ cleanly anymore                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Resistance              │ Forces opposing change                    │
│ (pushing against change)│                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Sunk cost               │ Significant work already done on current │
│                         │ approach — pivoting "wastes" that effort  │
├─────────────────────────┼──────────────────────────────────────────┤
│ "Good enough"           │ The current approach is producing        │
│                         │ acceptable (if not optimal) results       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Pivot cost              │ Switching approaches means rebuilding    │
│                         │ context, losing momentum, potential      │
│                         │ confusion                                 │
└─────────────────────────┴──────────────────────────────────────────┘
```

估平衡：轉化壓力增、穩或減？

**預期：** 對當前法之力之清晰圖。若壓力顯超抗力，轉向已逾時。若抗力顯超壓力，當前法應續。

**失敗時：** 若壓力圖曖昧（壓力與抗力皆不強），向前投：壓力將增強否？變通將累積否？「現可然將退化」之法所受壓力較其表面更多。

### 步驟三：評推理剛性

判當前法之彈性——能適應，抑或將斷？

```
Rigidity Score:
┌──────────────────────────┬─────┬──────────┬──────┬──────────────┐
│ Dimension                │ Low │ Moderate │ High │ Assessment   │
│                          │ (1) │ (2)      │ (3)  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Component swappability   │ Can swap parts   │ Changing one │              │
│                          │ freely          │ breaks others│              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ "God module" dependency  │ No single point  │ Everything   │              │
│                          │ of failure       │ depends on   │              │
│                          │                  │ one conclusion│             │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Tool entanglement        │ Tools serve      │ Approach is  │              │
│                          │ reasoning        │ shaped by    │              │
│                          │                  │ tool limits   │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Assumption transparency  │ Assumptions are  │ Assumptions  │              │
│                          │ stated, testable │ are implicit, │             │
│                          │                  │ untested      │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Workaround count         │ None or few      │ Multiple     │              │
│                          │                  │ accumulating  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Total (max 15)           │ 5-7: flexible    │              │              │
│                          │ 8-10: moderate   │              │              │
│                          │ 11-15: rigid     │              │              │
└──────────────────────────┴─────┴──────────┴──────┴──────────────┘
```

**預期：** 剛性分數，附各維特定證據。分數揭法能吸納變動或須重建。

**失敗時：** 若諸維皆低分（稱高彈性），詳查「神模組」維：是否有一關鍵結論或假設為他一切所依？若是，彈性虛幻——一誤假設崩整結構。

### 步驟四：估變動之能

評實際轉向或適應當前法之能。

1. **情境視窗剩餘**：留多少新推理之餘？充裕剩餘 = 高能。近極限 = 低能
2. **轉向時資訊保存**：若法變，何可前帶？高品質子任務輸出可越轉向；繫於舊法之推理鏈不行
3. **可用復原工具**：MEMORY.md 可於轉向前捕關鍵發現否？使用者可供額外情境否？相關檔仍可達否？
4. **使用者耐心因子**：使用者已示緊迫否？多次糾正示耐心降。明確「慢慢來」示高耐心

變動之能不僅理論——含當前會話之實際約束。

**預期：** 對改向能之誠評，計技術與關係因素。

**失敗時：** 若變動之能低（情境有限、關鍵資訊有失之險），轉向前首要為保存：總結關鍵發現、注關鍵事實、宜時更新 MEMORY.md。無保存之轉向劣於不轉向。

### 步驟五：分類轉化就緒

合諸評估為就緒分類。

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — pivot now.     │ PREPARE — simplify     │
│ + High Capacity │ The approach can adapt  │ first. Remove          │
│                 │ and should. Preserve    │ workarounds, clarify   │
│                 │ valuable sub-outputs,   │ assumptions, then      │
│                 │ rebuild the structure   │ pivot                  │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — preserve      │ CRITICAL — ask the     │
│ + Low Capacity  │ findings first. Update  │ user. Explain the      │
│                 │ MEMORY.md, summarize    │ situation: approach is  │
│                 │ progress, then pivot    │ struggling, pivoting   │
│                 │ with preserved context  │ is costly, what do     │
│                 │                        │ they want to prioritize?│
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ DEFER — the approach   │ DEFER — no urgency,    │
│ + Any Capacity  │ is working. Continue.   │ continue. Monitor for  │
│                 │ Reassess if pressure    │ pressure changes        │
│                 │ increases               │                        │
└─────────────────┴────────────────────────┴────────────────────────┘
```

記分類附：
- 分類標籤（READY / PREPARE / INVEST / CRITICAL / DEFER）
- 各維之關鍵發現
- 建議之下步行動
- 何信號將改分類

**預期：** 清晰、有理之分類，附特定建議行動。分類應如結論而非猜測。

**失敗時：** 若分類曖昧，預設為 PREPARE——減剛性（澄清假設、移變通）無論是否全轉向皆有值。準備改進法，無論其續或變。

## 驗證

- [ ] 結構清單已成附骨／肉／疤分類
- [ ] 轉化壓力已對應（外、內、抗）
- [ ] 剛性已跨多維評分附特定證據
- [ ] 變動之能已評，含實際會話約束
- [ ] 就緒分類已定附有理推理
- [ ] 依分類辨具體下步行動
- [ ] 重評觸發已定

## 常見陷阱

- **僅評技術法**：情境就緒含使用者關係因素。技術上彈而已生使用者挫之法，較其表面更剛
- **沉沒成本作剛性**：先前努力非結構剛性。已成之工或有值，無論法是否變。區「不能變」（剛性）與「不欲變」（沉沒成本）
- **評為迴避**：若 assess-context 為避難決而呼叫，評估按設計將不確。若壓力清晰，行之
- **忽變通為信號**：變通為疤——結構受壓而打補丁而非正適應之證據。變通數高意下次壓力更可能突破
- **混剛性與承諾**：承諾之法（審慎擇、基於證據）異於剛性者（為依賴與假設所鎖）。承諾可由決策變；剛性僅可由重構變

## 相關技能

- `assess-form` — 此技能為 AI 推理情境所適配之多系統評估模型
- `adapt-architecture` — 若分為 READY，用建築適應原則於轉向
- `heal` — 評估揭超結構問題之偏移時之深層子系統掃描
- `center` — 立誠評所需之平衡基線
- `coordinate-reasoning` — 管評估所依之資訊新鮮
