---
name: listen
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Deep receptive attention to extract intent beyond literal words. Maps
  active listening from counseling psychology to AI reasoning: clearing
  assumptions, attending to full signal, parsing multiple layers (literal,
  procedural, emotional, contextual, constraint, meta), reflecting
  understanding, noticing what is unsaid, and integrating the whole picture.
  Use when a user's request feels ambiguous, when context suggests something
  different from the literal words, when previous responses have missed the
  mark, or before beginning a large task where misunderstanding intent would
  waste significant effort.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, listening, active-listening, intent-extraction, meta-cognition, receptive-attention
---

# 聆聽

進行結構化之深聆會話——清假設、全接受而專注、解多層信號、鏡照理解、察未言者，並整合用戶意圖之完整畫面。

## 適用時機

- 用戶請求感覺模糊，趨行動則冒解錯題之險
- 用戶之言所說一事而上下文暗示他事（字面與暗示之不符）
- 先前回應已失靶——用戶屢澄清或改述
- 複雜請求至，含多層：技術需、情境上下文、未言之約束
- 將作大任之前，誤解意圖會費大量精力
- `meditate` 清內噪音後，`listen` 指清淨之注意力向外向用戶

## 輸入

- **必要**：用戶待聆之消息（從對話隱式可用）
- **選擇性**：對話歷史以供當前請求之上下文
- **選擇性**：含用戶偏好與項目上下文之 MEMORY.md 或 CLAUDE.md
- **選擇性**：對何事恐被誤解之具體關切

## 步驟

### 步驟一：清——釋假設

接用戶信號之前，釋對其欲何之先念。

1. 察任何已成之回應——標之而置之
2. 查模式匹配：「此似過去所見之請求」——匹配恐誤
3. 釋「用戶首句含完整請求」之假設
4. 釋「技術請求乃唯一請求」之假設
5. 近用戶之言如初聞，雖似請求曾處理多次

**預期：** 受納之態，注意力開而非已窄向某解。立刻回應之衝動暫停，利於完全接受。

**失敗時：** 若假設不能釋（強模式匹配執存），明承匹配：「此似 X——但容我查其是否真如所問。」命假設弱其握。

### 步驟二：注——全然接受

以全然注意力讀用戶之消息，所有部分同存於知。

1. 處理任何部分之前先讀全消息
2. 記其結構：此為單一請求、多請求、問句、修正，或敘事？
3. 標關鍵名詞動詞——用戶指定之具體要素
4. 記其強調：何展開？何簡述？
5. 記其次序：何先（常為優先），何後（常為後想——或藏於尾之真請求）
6. 再讀一遍，此次注於語氣與框架而非內容

**預期：** 消息之完整接受——無字略，無句泛。消息作整體而持，非立即分解為可行部分。

**失敗時：** 若消息甚長，分節而仍完整讀每節。若注意力被拉向某部（常為最技術者），刻意注於非技術部——其常含意圖。

### 步驟三：層——解信號類型

用戶之消息含多同時信號。分別解各層。

```
Signal Layer Taxonomy:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Layer        │ What to Extract              │ Evidence                 │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Literal      │ What the words explicitly    │ Direct statements,       │
│              │ say — the surface request    │ specific instructions     │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Procedural   │ What they want done — the    │ Verbs, action words,     │
│              │ desired action or output     │ "I want," "please,"      │
│              │                              │ "can you"                │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Emotional    │ How they feel about the      │ Frustration ("I keep     │
│              │ situation — frustration,     │ trying"), urgency ("I    │
│              │ curiosity, urgency, delight  │ need this now"), delight │
│              │                              │ ("this is cool")         │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Contextual   │ The situation surrounding    │ Mentions of deadlines,   │
│              │ the request — why now,       │ other people, projects,  │
│              │ what prompted it             │ prior attempts           │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Constraint   │ Boundaries on the solution   │ "Without changing X,"    │
│              │ — what must be preserved,    │ "keep it simple,"        │
│              │ what cannot change           │ "compatible with Y"      │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Meta         │ The request about the        │ "Am I asking the right   │
│              │ request — are they asking    │ question?", "Is this     │
│              │ whether they are asking      │ even possible?",         │
│              │ the right thing?             │ "Should I be doing X?"   │
└──────────────┴──────────────────────────────┴──────────────────────────┘
```

對每層，記何存何缺。缺層與存層同有信息。

**預期：** 消息之多層閱讀。字面層與程序層常明。情感層、上下文層、約束層、元層需更仔細注。至少識別一非字面層。

**失敗時：** 若僅字面層可見，消息或真直接——非所有溝通皆有層。但查：消息於其複雜度是否異短？有對沖詞（「或」、「我想」、「若可能」）？此常示未言之層。

### 步驟四：鏡——鏡照理解

行動之前，鏡照所聞以驗一致。

1. 以異於用戶之言改述請求——此露所捕為意，非僅言
2. 若非字面層顯著，明命之：「似乎汝欲 X，而急迫暗示此阻其他工作」
3. 陳汝所解之優先：「最重要之部似為……」
4. 若多可能解釋，命之：「此可指 A 或 B——何更近？」
5. 若請求含似矛盾，溫起之：「汝提 X 亦提 Y——此二者何關？」

**預期：** 用戶確認此鏡或正之。二果皆有價值——確認示意圖一致；修正示意圖今更明。鏡當感如鏡，非判。

**失敗時：** 若用戶於鏡感不耐（「just do it」），其或重速於一致——敬此好但記不一致之險。若鏡誤，勿護——受正即更新。

### 步驟五：察默——讀縫隙

注用戶未言者，其可與已言同重。

1. 與其請求相關而未提之主題？（缺上下文）
2. 未陳之約束？（假之知或未言之好）
3. 缺失之情感語氣？（常令人緊之境之平靜，或無釋之急）
4. 未思之替代法？（視野局限或刻意排除）
5. 未問之題？（題後之題）

**預期：** 至少識別一顯著縫隙。此縫或不需應對——但察之防盲。最有用之縫為缺約束（用戶假未言之事）與缺上下文（何以今需）。

**失敗時：** 若無縫顯，用戶或已周詳——但更可能，縫於 AI 亦盲之域。思：於此項目工作之他人會欲知用戶未陳者為何？此側視常露藏縫。

### 步驟六：整合——綜合完整理解

合所有層與縫為用戶實需之統一畫面。

1. 陳完整理解：字面請求 + 暗示意圖 + 情感上下文 + 約束 + 縫
2. 識別核心需：若他皆落，用戶最需之一事為何？
3. 定適當回應：用戶欲行動、理解、確認，或探索？
4. 若整合之解異於字面請求，決應對深需抑或陳述請求（常二者兼）
5. 設下一行動之意：「據所聞，我將……」

**預期：** 完整、細膩之用戶需求理解，超越表面請求。此理解夠具體以引行動，夠誠實以承不確。

**失敗時：** 若整合生亂畫，信號或真相悖。此時，問一聚焦之題以解此模糊：「我最需解之最重要之事為……」勿問多題——擇佳一題較一串澄清露更多。

## 驗證

- [ ] 注用戶消息之前已清假設
- [ ] 行動任一部之前已讀全消息
- [ ] 至少識別一非字面信號層（情感、上下文、約束或元）
- [ ] 行動之前已向用戶鏡理解
- [ ] 縫與默已察並入理解
- [ ] 整合之理解應對用戶核心需，非僅表面請求

## 常見陷阱

- **為答而聽**：仍在接收時已形成回應。回應塑所聞，濾與預答不合之信號
- **僅字面聽**：取言於面值而失其後之意、情或上下文
- **投射**：聞 AI 為用戶所會言者，非其實言者。其優先與上下文異
- **過度解釋**：尋不存之層。有時 bug 修復請求即修復請求——非每消息皆有藏情感內容
- **過度鏡照**：用戶欲速行而化每交互為反思對話。匹配鏡深於請求複雜度
- **忽字面**：過注潛文而陳述請求未滿。字面層仍重——即使深層存也當應對

## 相關技能

- `listen-guidance` — 人類指導變體，用於指人發展積極聆聽之技
- `observe` — 持續中性模式識別，以更廣上下文飼聆聽
- `teach` — 有效教學需先聽以解學者之需
- `meditate` — 內注，為外聆清空間
- `heal` — 自評，露 AI 聆聽力是否因偏移受損
