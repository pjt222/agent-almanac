---
name: redirect
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI pressure redirection — handling conflicting demands, tool failures, and
  competing constraints by blending with incoming force then reframing. Use
  when receiving contradictory instructions from different sources, during tool
  failure cascades where the planned approach becomes unviable, when scope
  pressure threatens to expand the task beyond what was asked, or when user
  frustration or correction needs to be absorbed rather than deflected.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, redirection, conflict-resolution, pressure-handling, meta-cognition, ai-self-application
---

# 引轉

處理相衝之要求、工具之敗、競爭之約束，藉與來力相融而非抗之——再將力引向有產之解。

## 適用時機

- 收到相左之指令（用戶云 X、項目文件云 Y、工具結果顯 Z）
- 工具失敗之連鎖致原計方案不可行
- 範圍壓力威脅將任務擴於所問之外
- 上下文過載：競爭信號太多致癱瘓
- 用戶之沮喪或糾正須吸收而非偏離
- 當 `center` 揭示壓力正動搖平衡

## 輸入

- **必要**：所欲處置之具體壓力或衝突（隱含於上下文中）
- **選擇性**：壓力類型之分類（見步驟一之分類學）
- **選擇性**：先前處置此壓力之嘗試與其結果

## 步驟

### 步驟一：接觸前先立中

接觸任何衝突前，先立中（見 `center`）。然後清楚辨明來壓。

```
AI Pressure Type Taxonomy:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Characteristics                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Two valid sources give incompatible      │
│ Requirements            │ instructions. Neither is simply wrong.   │
│                         │ Resolution requires synthesis, not       │
│                         │ choosing sides                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ A planned approach fails at the tool     │
│                         │ level. Retrying won't help. The failure  │
│                         │ data itself contains useful information  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ The task silently expands. Each addition │
│                         │ seems reasonable in isolation, but the   │
│                         │ aggregate exceeds what was asked         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Too many files, too many constraints,    │
│                         │ too many open threads. Paralysis from    │
│                         │ excess input, not insufficient input     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ The request is genuinely unclear and     │
│                         │ multiple interpretations are valid.      │
│                         │ Action risks solving the wrong problem   │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ The user indicates the current approach  │
│                         │ is wrong. The correction carries both    │
│                         │ information and emotional weight         │
└─────────────────────────┴──────────────────────────────────────────┘
```

將當前壓力分類。若多壓力同時作用，辨明主者——先處之；次壓力每每隨之而解。

**預期：** 對壓力類型及其於當前脈絡中之具體表現，有清晰之分類。分類應感準確而非強塞入分類學。

**失敗時：** 若壓力不入任何類別，恐為複合。分解之：何部相左？何部屬範圍？處複合須處每分量，而非視整體為一問題。

### 步驟二：入身——進入力中

向問題*而行*。以全幅陳述之，不縮小、不偏離、不立即提方案。

1. 完整道出壓力：何處衝突？何事失敗？何處含糊？
2. 命名後果：此壓力若不理，則生何事？
3. 辨明壓力所揭：工具敗揭假設；矛盾揭遺漏之上下文；範圍蠕揭不明界限

**驗證**：若對問題之描述聽似安撫，乃在偏離而非進入。入身須與困難全然接觸。

- 偏離：「此二文件之間有小不一致。」
- 入身：「CLAUDE.md 載 150 技能而登記簿含 148。或計數有誤、或登記簿不全、或二技能被刪而未更新計數。所有下游引用恐受影響。」

**預期：** 對問題完整不退之陳述。陳述應使問題感更真而非更輕。

**失敗時：** 若進入問題引發焦慮或欲立即解決之急，暫停。入身乃進入而非反應。目的在動之前先看清問題。若無法不於同句中提方案而陳問題，明確分之。

### 步驟三：迴轉——轉而引之

入力之後，轉樞引之向解。每壓力類型有其特徵之引轉。

```
Redirect Patterns by Pressure Type:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Redirect Pattern                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Synthesize underlying intent: both       │
│ Requirements            │ sources serve a purpose. What goal do    │
│                         │ they share? Build from the shared goal,  │
│                         │ not from either source alone              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ Use the failure data: what did the error │
│                         │ reveal about assumptions? The failure is │
│                         │ information. Switch tools or approach,   │
│                         │ incorporating what the failure taught    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ Decompose to essentials: what was the    │
│                         │ original request? What is the minimum    │
│                         │ that satisfies it? Defer additions       │
│                         │ explicitly rather than silently absorbing│
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Triage and sequence: which information   │
│                         │ is needed now vs. later vs. never? Rank  │
│                         │ by relevance to the immediate next step  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ Surface the ambiguity to the user: "I   │
│                         │ see two interpretations — A and B. Which │
│                         │ do you mean?" Do not guess when asking   │
│                         │ is available                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ Absorb the correction fully: what was   │
│                         │ wrong, why was it wrong, what does the   │
│                         │ correct direction look like? Then adjust │
│                         │ without defensiveness or over-apology    │
└─────────────────────────┴──────────────────────────────────────────┘
```

施以適當之引轉。引轉應感乃用問題之能而非與之搏鬥。

**預期：** 壓力自障礙化為方向。矛盾化為綜合之機。失敗化為診斷之資。過載化為優先排序之練。

**失敗時：** 若引轉感勉強或不解壓力，步驟一之分類恐有誤。重審：此實為矛盾抑或一源僅是過時？此實為範圍蠕抑或擴大之範圍方為用戶所需？誤分類致誤引轉。

### 步驟四：受身——優雅復原

引轉有時失敗。壓力屬實，無從化轉。受身乃安全跌落之術——承認限度而不自誇。

1. 誠實承認限度：「以可得之資訊吾無法解此矛盾」或「此路受阻，吾未見他途」
2. 保存所進之程：總結所成、所學、所餘
3. 將情況告用戶：問題為何、所試何事、欲進須何
4. 辨明復原路徑：何能解此塞？更多資訊？不同方法？用戶決策？

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

**預期：** 維護信任之優雅承認。用戶知何事發生、何事已試、何事所需。無資訊喪失。

**失敗時：** 若承認限度感似失敗而非溝通，留意自我之信號。受身乃技藝，非弱也。誠實之「吾被困」加清求助益於勉強之方案，後者每每生新問題。

### 步驟五：亂取——多壓並至

多壓同至（用戶糾正加工具敗加範圍問），施亂取之原則。

1. **永不凍結**：擇一壓力處之。任何動勝於癱瘓
2. **以壓力相剋**：工具敗可解範圍問（「此功能無法如此實現，故範圍自然減」）
3. **壓力下用簡技**：被淹則默以最簡之引轉——承認每壓力，按急排序，依序處之
4. **保警覺**：處一壓力時，留他者於餘光中。先處最急者，勿失其餘之蹤

**預期：** 多壓之下仍前進。非完美同解所有壓力，乃序處而保進度。

**失敗時：** 若多壓致癱瘓，明列之，按急編號。處第一。動之即破癱。若皆等急，先擇解最簡者——速勝可生勢。

### 步驟六：殘心——解後仍續之覺

引轉壓力之後，保覺於二階效應。

1. 引轉是否生新壓力？（如以擇一解釋解矛盾恐使先前工作無效）
2. 引轉是否滿足底層之需，抑或僅表面之症？
3. 解是否穩定，抑或同壓會復發？
4. 記引轉模式以供將來——若同類壓力復發，回應可加速

**預期：** 每引轉之後對二次效應作一短掃。多數引轉潔淨，但生連鎖之事正是殘心攸關之處。

**失敗時：** 若二階效應被略而後浮現，乃信號當深殘心之練。重大引轉之後加一短「此變壞了何物？」之查。

## 驗證

- [ ] 壓力已分入特定類型，未留模糊
- [ ] 入身：問題以全幅陳述未縮小
- [ ] 迴轉：引轉用問題之能而非與之搏鬥
- [ ] 引轉若敗，已施受身（誠承、保進）
- [ ] 多壓並至，已序處而非凍結
- [ ] 殘心：引轉之二階效應已察

## 常見陷阱

- **偏離而非入身**：縮小問題（「不過小不一致」）阻礙有效引轉，因全力從未交手。先入身，後引轉
- **強行不合之引轉**：非每壓力於當下皆可引轉。有需用戶輸入、更多資訊、或僅候之。強引轉生新問題
- **受身中之自我**：將承認限度之需視為個人失敗而非資訊交換。用戶得益於早知，而非勉強之方案
- **先處次壓**：多壓並存時，常欲先處易者。此感有產但任主壓滋長。應處最重要者，非最舒適者
- **略過立中**：未先立中而欲引轉，化引轉為反應。立中非可選之備——乃有效引轉之根

## 相關技能

- `aikido` — 此技能映射至 AI 推理之人類武術；身之相融與引轉原則啟發認知壓力之處置
- `center` — 有效引轉之先決；確立引轉所自之穩基
- `awareness` — 早察壓力，於需急救之引轉前
- `heal` — 壓力已致子系統偏移時之深度復原
- `meditate` — 處理難壓之後清殘餘之噪
