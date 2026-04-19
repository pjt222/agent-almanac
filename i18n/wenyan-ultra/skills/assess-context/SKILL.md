---
name: assess-context
locale: wenyan-ultra
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

# 評脈

評今推脈為可塑——識何剛、何柔、變壓何積、今法可適否。

## 用

- 繁務似卡而不知續或轉→用
- 大法變前評今推構可支否→用
- 累變通示底法或誤→用
- `heal` 或 `awareness` 識偏而適應（續、調、重建）不清→用
- 脈長而不知存何重建何→用
- 久多步務之構檢→用

## 入

- **必**：今務脈與推態（隱含）
- **可**：發評之憂（如「吾恆加變通」）
- **可**：擬轉向（法當為何）
- **可**：前評以析趨

## 行

### 一：錄推形

無判錄今推法之構件。

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

分各件：

- **骨**：難變；變之則諸下游連動
- **肉**：易變；可換不影他件
- **疤**：示構題之變通；常為偽骨之肉

圖依：何件依何？多依之骨件為承載。無依之肉件可棄。

得：完錄示今法所成、何剛、何柔、何處顯壓（變通）。錄當揭錄前未明之構。

敗：錄難構（法太亂不能分）→自為發——構透明度低示剛度高。始於可見而註不透區。

### 二：圖變壓

識推今法向變之力與抗之力。

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

估衡：變壓增、穩、減乎？

得：影今法力之明像。壓大過抗→轉宜。抗大過壓→今法當續。

敗：壓圖含糊（壓抗皆不強）→前推：壓增否？變通累否？「今足而退」較表壓更大。

### 三：評推剛

定今法柔否——可適或破？

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

得：剛分附各維具證。分揭法可吸變或須重建。

敗：諸維皆低分（稱高柔）→細探「神模」維：有無一關結或設諸他依？若有則柔為幻——一錯設崩全構。

### 四：估變能

評實際轉或適今法之能。

1. **脈窗餘**：新推餘空？大餘=高能。近限=低能
2. **轉時資存**：法變→何可承前？善子務出存轉；繫舊法之推鏈不存
3. **復工可達**：MEMORY.md 可捕關發前轉乎？用者可供加脈乎？相關檔仍可達乎？
4. **用者忍因**：用者示急否？多正示忍降。明「慢來」示高忍

變能非僅理——含今會具限。

得：誠評變向之能，計技與關因。

敗：變能低（脈限、關信險失）→任轉前先存：要發要、註關、適時更 MEMORY.md。無存而轉劣於不轉。

### 五：分變備

合諸評為備分。

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

文分附：

- 分標（READY / PREPARE / INVEST / CRITICAL / DEFER）
- 各維要發
- 薦下動
- 何信會變分

得：明、有由之分附具薦動。分當似結非猜。

敗：分含糊→默 PREPARE——減剛（明設、去變通）有值不論全轉是否生。備改善法不論續或變。

## 驗

- [ ] 構錄完附骨/肉/疤分
- [ ] 變壓圖（外、內、抗）
- [ ] 剛跨多維評附具證
- [ ] 變能評含實會限
- [ ] 備分定附證理
- [ ] 由分定具下動
- [ ] 重評觸定

## 忌

- **唯評技法**：脈備含用者關因。技柔而生用者怒之法較表更剛
- **沉本為剛**：前工非構剛。已工或有值不論法變否。分「不能變」（剛）於「不欲變」（沉本）
- **評為避**：assess-context 為避難決而呼→評必設計含糊。壓明則行
- **忽變通為信**：變通乃疤——構受壓而補非正適之證。多變通示次壓更可破
- **混剛於諾**：諾法（明擇、基證）異於剛法（依與設鎖）。諾可由決變；剛唯由重構變

## 參

- `assess-form` —— 此技適 AI 推脈之多系評模
- `adapt-architecture` —— 分為 READY 用構適律於轉
- `heal` —— 評揭構外偏時深子系掃
- `center` —— 立誠評所需之衡基
- `coordinate-reasoning` —— 管評賴之信新
