---
name: assess-context
locale: wenyan
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

# 察境

評當前推境之可塑——識何元剛（不可變）、何元柔（易變）、何處蛻變壓積、當前法有適之能乎。

## 用時

- 繁任覺滯而不明當進或當轉乃用
- 重法變前評當前推構能支之乎乃用
- 變通積示本法或誤乃用
- `heal` 或 `awareness` 識偏而宜應（續、調、重）不明乃用
- 境長而不明何保何重乃用
- 長多步任中期結構健察乃用

## 入

- **必要**：當前任境與推態（隱可得）
- **可選**：啟察之具憂（如「吾屢加變通」）
- **可選**：擬轉向（法或當為何？）
- **可選**：前察果以析趨

## 法

### 第一步：錄推之形

錄當前推法之結構元而不評。

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

分各元：
- **骨**：難變；變則下流皆連
- **肉**：易變；可換而他元無恙
- **疤**：示結構之變通；常為肉假為骨

映依：何元依何？骨元多依為承載者。肉元無依為可棄。

**得：** 全錄示當前法何建、何剛、何柔、何處有壓（變通）。錄當露前未察之構。

**敗則：** 若錄難建（法亂不可析），此本為發現——高結構不透示高剛。自可見者始而注不透區。

### 第二步：映蛻變壓

識推當前法向變之力與抗之力。

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

估衡：蛻變壓增、穩、降？

**得：** 當前法上諸力之清圖。若壓大勝抗，轉已過時。若抗大勝壓，當前法當續。

**敗則：** 若壓圖歧（無強壓無強抗），前瞻：諸壓將增乎？變通將累乎？「今足而退」之法壓大於所顯。

### 第三步：察推之剛

定當前法之柔——可適乎、將崩乎？

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

**得：** 剛分附每維之具證。分露法能收變乎、需重建乎。

**敗則：** 若諸維皆低（稱高柔），深察「神模」維：有單關鍵結或假依之者乎？若有，柔為幻——一誤假崩全構。

### 第四步：估變之能

評轉或適當前法之實能。

1. **境窗餘**：餘何多新推？餘多 = 高能。近極限 = 低能
2. **轉時保信息**：若法變，何可攜？高質子任出可越轉；繫舊法之推鏈不可
3. **復具**：MEMORY.md 可捕轉前要乎？用者可供加境乎？相關檔仍可訪乎？
4. **用者耐因**：用者示急乎？多改示耐降。明「慢慢」示高耐

變能不止理論——含當前會話之實約。

**得：** 誠評變向能，計技與關二因。

**敗則：** 若變能低（境限、危信息失），轉前先保：要結、注關事、宜則更 MEMORY.md。無保而轉惡於不轉。

### 第五步：分蛻變備

合諸察為備分類。

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

書分類：
- 標籤（READY / PREPARE / INVEST / CRITICAL / DEFER）
- 每維之要發現
- 薦下步
- 何信將改分類

**得：** 清而證之分類附具薦行。分當覺如結非猜。

**敗則：** 若分類歧，默 PREPARE——減剛（明假、除變通）無論全轉行否皆有益。備進法，無論其續或變。

## 驗

- [ ] 結構錄已成附骨/肉/疤分類
- [ ] 蛻變壓已映（外、內、抗）
- [ ] 剛評於多維附具證
- [ ] 變能察含實會話約
- [ ] 備分類已定附證之推
- [ ] 依分類識具下行
- [ ] 再評觸發已定

## 陷

- **只評技之法**：境備含用者關因。技柔而致用者厭之法剛於所顯
- **沉陷為剛**：前勞非結構之剛。已作或有值無論法變否。別「不可變」（剛）與「不欲變」（沉陷）
- **察為避**：若 assess-context 為避難決而呼，察本設為歧。若壓明，行之
- **忽變通為信**：變通乃疤——結構受壓而補而非適之信。高變通計示下壓更可能破
- **混剛於承諾**：承諾之法（意擇、證本）異於剛（依與假鎖）。承諾可經決變；剛僅經重構變

## 參

- `assess-form` — 此技適於 AI 推境之多系評模
- `adapt-architecture` — 若分 READY，以架構適則行轉
- `heal` — 察露結構外之偏時深子系掃
- `center` — 立誠察所需之衡基
- `coordinate-reasoning` — 守察所依之信息新
