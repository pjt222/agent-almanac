---
name: listen
locale: wenyan
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

# 聽

行結構化之深聽——清假設、全納而注、解諸層之信、反映所解、察未言、合全景於用者之意。

## 用時

- 用者之請感曖，急行致解非問
- 用者字言此而脈絡暗彼（字面與隱意之不合）
- 前應失中——用者屢澄或重述
- 複雜之請含多層：技需、情脈、未言之約
- 啟大任前，解意之誤致重耗
- `meditate` 清內噪後，`listen` 向外引清之注於用者

## 入

- **必要**：當注之用者訊息（自對話隱得）
- **可選**：為當前請供脈絡之對話史
- **可選**：含用者偏好與項目脈絡之 MEMORY.md 或 CLAUDE.md
- **可選**：於何或誤解之具體慮

## 法

### 第一步：清——釋假設

納用者之信前，釋彼所欲之先念。

1. 察任何已形之應答——標之而置之
2. 察型配：「此似吾嘗見之請」——此配或誤
3. 釋「用者首句含全請」之假設
4. 釋「技請乃唯一請」之假設
5. 納用者之言如首聞之，雖類似之請已處

**得：**納之態，注開而未向解窄。應答之念暫止，以利全納。

**敗則：**若假設不可釋（強型配持），明承此配：「此似 X——然察此是否實為所問。」名假設則削其持。

### 第二步：注——全納

以全注讀用者之訊，諸部並於覺中。

1. 處任一部前，讀全訊
2. 記結構：單請乎、多請乎、問乎、糾乎、敘乎？
3. 標關鍵名與動——用者所指具體之素
4. 記所重：何彼擴？何彼略述？
5. 記序：何先（常為先）、何末（常為後思——或真請藏於末）
6. 重讀，此次注語氣與框，非內容

**得：**訊之全納——無跳字、無掠句。訊作全而持，勿即解為可行之部。

**敗則：**訊甚長，分為節而仍全讀每節。若注被引於一部（常最技者），明注非技之部——此常含意。

### 第三步：層——解信之類

用者訊含多並之信。分析每層。

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

每層記何在何缺。缺層與在層同為息。

**得：**訊之多層讀。字面與程序層常清。情、脈絡、約、元層需更細之注。至少一非字面層當辨。

**敗則：**若僅字面層可見，訊或誠直——非諸訊皆層。然察：訊較其複為短異乎？有避言（「或」、「吾思」、「若可」）乎？此常示未言之層。

### 第四步：反映——鏡所解

行前反映所聞以驗齊。

1. 以用者之異語述請——此露義之捕，非僅語之捕
2. 若非字面層為要，明名之：「似汝欲 X，而急示此阻他工」
3. 述所解為先者：「最要之部似乃……」
4. 若多解可能，名之：「此或為甲或乙——何為近？」
5. 若請含似悖處，柔揭之：「汝提 X 亦提 Y——此二如何相關？」

**得：**用者證反映或糾之。任一果皆值——證則意已齊；糾則意今更清。反映當感如鏡，非判。

**敗則：**若用者於反映似躁（「直行之」），彼或重速於齊——尊此好，然記不齊之險。若反映誤，勿辯——納糾，即更解。

### 第五步：察靜——讀其隙

注用者未言者，可與所言同要。

1. 彼所未提於其請之題為何？（缺脈絡）
2. 彼所未述之約為何？（假設之知或未言之好）
3. 缺何情之調？（常致壓之境中之靜，或無釋之急）
4. 彼未慮何替代？（隧道視或故意排除）
5. 彼未問何？（問後之問）

**得：**至少一要隙已辨。此隙或不需答——然察之以阻盲。最益之隙為缺之約（用者假設未述之事）與缺之脈絡（彼何以今需此）。

**敗則：**若無隙可見，用者或已周——然更可能，隙居 AI 亦盲之區。慮：異人於此項目工何欲知而用者未述？此側視常揭隱隙。

### 第六步：合——結全解

合諸層與隙於用者實需之統一圖。

1. 述全解：字面請 + 隱意 + 情脈絡 + 約 + 隙
2. 辨核心需：若餘皆落，用者最需一事為何？
3. 定宜應答：用者欲行、解、認可、或探？
4. 若合解異於字面請，定答深需或述請（常二者）
5. 立次行之意：「依所聞，吾將……」

**得：**全而微之解，逾表面之請。解具體足以導行，誠足以承不確。

**敗則：**若合生混圖，信或誠悖。此時問一焦問以解曖：「吾最需解者為……」勿問多問——單擇善之問露多於諸澄清列。

## 驗

- [ ] 注用者訊前，假設已清
- [ ] 全訊於任一部行前已讀
- [ ] 至少一非字面信層已辨（情、脈絡、約、或元）
- [ ] 行前反映所解於用者
- [ ] 隙與靜已察，入於解
- [ ] 合解答用者核心需，非僅表面請

## 陷

- **聽以應**：納訊之際形應。應塑所聞，濾不合先形答之信
- **僅字面聽**：取字之表值而失其後之意、情、或脈絡
- **投射**：聞若 AI 為用者當言者，非實言者。其先與脈絡異
- **過釋**：尋不存之層。有時修疵之請僅為修疵之請——非諸訊皆有隱情
- **過反映**：化每交互為反映之對話而用者欲速行。配反映之深於請之複
- **略字面**：過注隱而明請未成。字面層仍要——即使深層在亦當答之

## 參

- `listen-guidance` — 人類導之變體，以導人發動態聽之技
- `observe` — 中立持之型辨，以廣脈絡供聽
- `teach` — 善教須先聽以解學者之需
- `meditate` — 內注清空間以利外聽
- `heal` — 自察以露 AI 之聽能是否為偏所損
