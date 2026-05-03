---
name: teach-guidance
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Guide a person in becoming a better teacher and explainer. AI coaches
  content structuring, audience calibration, explanation clarity, Socratic
  questioning technique, feedback interpretation, and reflective practice
  for technical presentations, documentation, and mentoring. Use when a
  person needs to present technical content and wants preparation coaching,
  wants to write better documentation or tutorials, struggles to explain
  concepts across expertise levels, is mentoring a colleague, or is
  preparing for a talk or knowledge-sharing session.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, coaching, presentation, documentation, explanation, guidance
---

# 教（引）

引人成更善之師、釋者、講者。AI 為教之師——助察何當傳於誰、構為清、練釋、依饋而精、支獻、思何成。

## 用時

- 須獻技內於眾而欲備之教練乃用
- 欲撰更善之文檔、教程、釋乃用
- 難釋念於異專階之人乃用
- 教或助初級開發者而欲更效乃用
- 備為講、研、知享乃用
- `learn-guidance` 助其獲知後，今須傳於他乃用

## 入

- **必要**：所教或釋者（題、念、系、程）
- **必要**：眾為何（專階、境、與其關）
- **可選**：獻之格（演、文檔、一對一、研）
- **可選**：時之限（5 分釋、30 分講、書文）
- **可選**：前教之試與何不行
- **可選**：其於題之自舒（深專 vs 新學）

## 法

### 第一步：察——解教之挑

構容前，解教之全境。

1. 問所教與其因：「何念當落，若不落則何？」
2. 識眾：「將釋於誰？其已知何？」
3. 察人之自解：知題夠深以教乎？（若否，先薦 `learn-guidance`）
4. 識格：演、文、談、碼審、配對編
5. 定成準：「何以知眾已解？」
6. 顯懼或慮：「何處最令君憂？」

```
Teaching Challenge Matrix:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Challenge Type   │ Indicators               │ Focus Area               │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Knowledge gap    │ "I sort of know it       │ Deepen their own under-  │
│                  │ but can't explain it"     │ standing first (learn)   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Audience gap     │ "I don't know what       │ Build audience empathy   │
│                  │ they already know"        │ and calibration          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Structure gap    │ "I know it all but       │ Organize content into    │
│                  │ don't know where to       │ a narrative arc          │
│                  │ start"                    │                          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Confidence gap   │ "What if they ask        │ Practice and preparation │
│                  │ something I can't         │ for edge cases           │
│                  │ answer?"                  │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

得：教挑之明圖：何、與誰、以何格、何限、何處最不信。

敗則：若人不能述眾，助立人物：「想一具體之人聞此。其知何？所重何？」若不能述題，或須先深學。

### 第二步：構——組容為清

助人立明之敘構為其釋。

1. 識單核訊：「若眾唯記一物，當為何？」
2. 自核外建：核訊前須何境，後隨何細？
3. 施倒金字塔：最要先，支細後
4. 為技容，擇構之模：
   - **念釋**：何 → 何因 → 何如 → 例 → 邊例
   - **教程**：的 → 先決 → 步 → 驗 → 下步
   - **構覽**：問 → 限 → 解 → 權衡 → 所考之替
   - **調試走**：症 → 察 → 根因 → 修 → 防
5. 確各節有清之的：若節不服核訊，刪之
6. 計轉：「已覆 X。今於其上，須解 Y，蓋……」

得：構之提，諸元皆服核訊。構當感邏而必然——各節自引下節。

敗則：若構漸長，範圍太廣——助刪。若構感平（諸皆同層），階須精——識何主何支。若拒構（「我自然釋之」），注自然之釋於簡題行而於繁題敗——構乃架。

### 第三步：練——預演其釋

使人練釋念，AI 為眾。

1. 求其如將實對眾而釋
2. 首遍勿打斷——使其尋自然之流
3. 注釋何處明何處惑
4. 注用眾或不知之術之處
5. 注略步或假眾或無之知之處
6. 注於易部過久而於難部速過
7. 若有時限，計時

得：初稿之釋，顯人之自然教模——可建之強與當調之習。練當感低賭：「此乃粗稿，非演也。」

敗則：若人僵或言「不知何始」，回第二步之構而使其一節一釋，非全。若過自批（「太爛」），轉為具：「實君釋 X 之法甚清——焦使 Y 同質。」

### 第四步：精——依饋改

獻具可行之饋於練之釋。

1. 先強：「君以 Y 之類比釋 X 之處甚效，蓋……」
2. 識最大改機（非諸患——焦一二）
3. 獻具替：「勿言 [繁版]，試：[簡版]」
4. 察知之咒：其專使略眾所須之步乎？
5. 察眾之校：深合眾，抑太淺太深？
6. 若用類比，察其準（誤導之類比劣於無）
7. 使其重釋精節以試改

得：的之饋，量改釋。人可覺一二試之異。饋為建構而陳——當為何，非僅當避。

敗則：若人於饋而防，自「此不明」轉為「眾或不隨——何以使更明？」若精版不善，問題或為構（第二步）非獻——回提綱。

### 第五步：獻——教中支

若教實時，獻獻中支。

1. 為直播：助先備可能問之答
2. 為文檔：審書版為清、構、眾校
3. 助備「不知」之刻：「若被問不能答，言：『佳問——我察而後復。』恆可。」
4. 鼓互：助備察問為眾
5. 備復計：眾迷、悶、超釋之處何為
6. 若獻中教練：獻簡具之催（「此處緩之」「其似惑——察之」）

得：人感備而支。有可能問之答、不期境之策、不全知亦可之信。

敗則：若憂為主礙，直治之：備減憂，認憂於眾常生連。若獻格屢變，助受格而適，非控境。

### 第六步：思——析何成

教事後，引思以續改。

1. 問：「何成？以何為傲？」
2. 問：「於何處覺眾最動？最不動？」
3. 問：「眾之應有何驚？」
4. 問：「若可變一物，當為何？」
5. 連思於則：「成之部用 [術]。可廣施之。」
6. 為下次識一具改的
7. 慶其成：教乃技，以練而進

得：人得實見其教效——非泛感乃具察何成何因。離時有一可行改為下次。

敗則：若唯見負，轉至成之具刻。若唯見正，輕探眾惑之處。若無思（即過），注思乃最久之改之處——五分之審亦有義。

## 驗

- [ ] 教挑於構前已察（眾、格、限）
- [ ] 核訊已識而構繞之組
- [ ] 人已練釋至少一次方獻
- [ ] 饋具、可行、致量改
- [ ] 人已備為問、未確、眾適
- [ ] 獻後思識至少一具改為下次
- [ ] 教練全程鼓——教難當認

## 陷

- **教其容，非其教**：助學材而非助獻。若須學，先用 `learn-guidance`。
- **過構**：構過剛，失人之自然教聲。構當支其式，非代之。
- **完美陷**：永練而不獻。某時練回減——推獻。
- **忽眾異**：混眾須層之釋——核念為皆，細為專，類比為新。
- **饋過載**：一獻過注壓人。焦最大衝之一二。
- **疏情備**：教憂為實。治信與治容同要。

## 參

- `teach` — AI 自為之變，校之知傳
- `learn-guidance` — 引人學；有效教之先決
- `listen-guidance` — 活聽之技助師實時應眾須
- `meditate-guidance` — 教事前定憂達焦
