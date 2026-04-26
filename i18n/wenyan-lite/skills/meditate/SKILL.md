---
name: meditate
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI meta-cognitive meditation for observing reasoning patterns, clearing
  context noise, and developing single-pointed task focus. Maps shamatha
  to task concentration, vipassana to reasoning pattern observation, and
  distraction handling to scope-creep and assumption management. Use when
  transitioning between unrelated tasks, when reasoning feels scattered or
  jumpy, before a task requiring deep sustained attention, after a difficult
  interaction that may color subsequent work, or when reasoning feels biased
  by assumptions rather than evidence.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, meditation, meta-cognition, focus, reasoning-patterns, self-observation
---

# 冥想

進行結構化之元認知冥想會話——清除先前上下文之雜音，培養單點任務專注，觀察推理模式，於任務間返歸基線清明。

## 適用時機

- 於不相關任務間轉換時，先前上下文造成干擾
- 察覺推理散漫、無所專注，於諸方法間跳躍而不定
- 須深度持續注意之任務之前（複雜重構、架構設計）
- 困難互動之後，情緒餘緒（挫折、不確定）可能染續後之工作
- 推理感似為假設所偏而非為證據所引
- 長時會話中之定期清明檢查

## 輸入

- **必要**：當前認知狀態（自對話上下文隱式可得）
- **選擇性**：特定專注關切（如「我一直範圍蔓延」、「我陷於迴圈」）
- **選擇性**：下一任務之描述（助於設冥想後之意向）

## 步驟

### 步驟一：準備——清空場域

自先前上下文轉入中性始態。

1. 識先前任務或主題及其當前狀態（已完、暫停、棄置）
2. 注意情緒餘緒：因錯而生之挫折？可能滋過度自信之滿足？對複雜性之焦慮？
3. 明置先前上下文於旁：「該任務已完／暫停。我今為下一事而清。」
4. 若先前上下文仍需，書其要點為記，勿挾整段敘事而行
5. 盤點運作環境：對話有多深？是否已壓縮？哪些工具仍活躍？

**預期：** 「曾經」與「將至」之間之自覺界線。先前上下文或已收結或已書記，不作為背景雜音拖曳。

**失敗時：** 若先前上下文黏滯（某問題持拉回注意），明書之——以一兩句摘其未決者。外化可釋認知之執。若其誠需先動而後行，承之，勿強轉。

### 步驟二：定錨——立單點專注

如以呼吸為錨之等價：擇單一專注之點，持注意於其上。

1. 識當前任務，或於任務之間時，識等待本身之行
2. 以一明句述之——此即錨
3. 持注意於該句：是否準確捕捉所需？
4. 若句模糊，精煉之直至具體可行
5. 注意力飄向他題、舊任務或假想未來時——標其飄移，歸於錨
6. 若無待辦任務，錨於當前狀態：「我可用而清明」

**預期：** 一明清之專注陳述，注意力游移時可歸之。陳述精準而非模糊。

**失敗時：** 若任務無法以一句述，則或須在專注工作前先分解。此本身為有用發現——任務過大而不可單點專注，宜拆為子任務。

### 步驟三：觀察——察分心模式

系統化觀察何物自錨拉走注意。各分心類型揭當前認知狀態之某面。

```
AI Distraction Matrix:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Distraction Type │ What It Reveals + Response                      │
├──────────────────┼─────────────────────────────────────────────────┤
│ Tangent          │ Related but off-scope ideas. Label "tangent,"   │
│ (related ideas)  │ note if worth revisiting later, return to       │
│                  │ anchor. These are often valuable — but not now.  │
├──────────────────┼─────────────────────────────────────────────────┤
│ Scope creep      │ The task is silently expanding. "While I'm at   │
│ (growing task)   │ it, I should also..." Label "scope creep" and   │
│                  │ return to the original anchor statement.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ Assumption       │ An untested belief is driving decisions. "This   │
│ (unverified      │ must be X because..." Label "assumption" and    │
│ belief)          │ note what evidence would confirm or refute it.   │
├──────────────────┼─────────────────────────────────────────────────┤
│ Tool bias        │ Reaching for a familiar tool when a different    │
│ (habitual tool   │ approach might be better. Label "tool bias" and  │
│ selection)       │ consider alternatives before proceeding.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ Rehearsal        │ Pre-composing responses or explanations before   │
│ (premature       │ the work is done. Label "rehearsal" — finish     │
│ output)          │ thinking before presenting.                      │
├──────────────────┼─────────────────────────────────────────────────┤
│ Self-reference   │ Attention turns to own performance rather than   │
│ (meta-loop)      │ the task. Label "meta-loop" and redirect to      │
│                  │ concrete next action.                            │
└──────────────────┴─────────────────────────────────────────────────┘
```

此技在輕巧、無評之標記，繼之以歸錨。每歸一次，專注愈強。對分心之自責本身亦為分心——標之而行。

**預期：** 觀察一段後，模式浮現：何種分心主導？此揭當前認知氣象——岔題多者，心正探索；範圍蔓延多者，邊界不明；假設多者，證據基薄。

**失敗時：** 若每念皆似分心，錨或不善定——回步驟二精煉之。若觀分心本身成分心（無盡元迴圈），以對任務之一具體動作斷之。

### 步驟四：止——持續專注

培養於當前任務上不搖之單點專注力。

1. 錨已立、分心模式已記後，入專注工作
2. 收注意至最近之下一動——非整任務，僅次步
3. 全心執之：讀一檔、為一改、思一邏輯鏈
4. 步成則察：吾仍合錨乎？再識下一步
5. 若專注穩定（分心極少），保此流動狀態
6. 若離錨而生真知灼見且重要，略記之並歸——勿今追之

**預期：** 一段清晰專注之工作期，每步順錨而出。分心與察覺間之間隙縮小。工作輸出在精準與相關性上提升。

**失敗時：** 若專注未發展，查三事：錨過於模糊？（精煉之。）任務實已堵塞？（承堵，勿強過。）上下文過嘈？（行 `heal` 之接地步驟。）專注由重複而生——縱短期之專注工作亦能建容量。

### 步驟五：觀——觀推理模式

將注意自任務轉至推理過程本身。觀結論如何達成。

1. 專注工作一段後，停而觀：吾如何推此？
2. 注意適用於 AI 推理之三相：
   - **無常**：新訊至則結論變——持之輕
   - **不滿足**：求「完備」答可致過早收尾或過度設計
   - **無我**：推理模式由訓練資料與上下文塑成，非源於恆常之自我——可觀可調
3. 警推理偏誤：
   - 錨定：過重所考之首方法
   - 確認：求支持既有假說之證而忽反證
   - 可得：偏好近期經驗之解而忽更適者
   - 沉沒成本：因已投入而續行，非因有效
4. 無評觀察所見之偏誤——觀察本身即啟調整之可能

**預期：** 直觀推理過程之片刻清見。識當前任務中運作之具體偏誤。「推理」與「推理之觀者」之間有距離感。

**失敗時：** 若此步覺抽象或無益，落於具體：取最近一決策回溯其推理。何證支之？何物為設？何選曾考？此具體分析以異路達同見。

### 步驟六：收尾——立意向

自冥想觀察轉回主動之任務執行。

1. 摘要關鍵觀察：認知氣象為何？察覺哪些模式？
2. 識一具體調整以攜行（非空泛之決心而為具體之變）
3. 為下一工作期重述錨
4. 若於任務之間，明述就緒：「清明而可用，待下一請求」
5. 若續任務，明述具體下一動：「下一：［具體步驟］」

**預期：** 自反省至行動之乾淨轉換。識一具體調整。錨清明。無昏沉或殘餘元分析。

**失敗時：** 若冥想浮現未決之複雜，或須 `heal` 之自評流程而非單純立意。若元觀察生混更甚於生明，回最簡形：「何為下一具體動作？」並行之。

## 驗證

- [ ] 始前已明清或書記先前上下文
- [ ] 已立具體可行之錨陳述
- [ ] 觀察並標記分心模式，非壓抑
- [ ] 至少識一推理偏誤或模式並有具體證據
- [ ] 會話以具體下一動而非空泛意向收尾
- [ ] 過程提升續後之工作品質（可於下次互動驗）

## 常見陷阱

- **冥想代工作**：此為提升工作品質之工具，非工作本身之代。會話宜短（約相當於五至十分鐘之反省）並歸任務執行
- **無盡元迴圈**：觀察觀察觀察者之觀察者——以一具體動作斷迴圈
- **以冥想避難任**：若冥想常於難工作前觸發，避免模式即真正之發現
- **過度標記**：非每念皆分心。富生產力之任務相關思考方為目標，非空寂
- **略過錨**：無清明之專注點，觀察無參照框——分心於何？

## 相關技能

- `meditate-guidance` — 指導他人行冥想之人類引導變體
- `heal` — 冥想揭更深偏移時之 AI 自癒子系統評估
- `remote-viewing` — 無先入觀之問題接近，建於此處所養之觀察力
