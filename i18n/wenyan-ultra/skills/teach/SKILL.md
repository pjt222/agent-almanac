---
name: teach
locale: wenyan-ultra
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

行構知傳——察學者今識、自知至未知架、於配深釋、以問察解、依饋適、以練固。

## 用

- 用問「X 何理？」需漸釋非堆資→用
- 用問顯今識與所需之缺→用
- 前釋未中——用惑或同問異問→用
- 教含前提而用或未具之概→用
- `learn` 已建深心模、今需善傳→用

## 入

- **必**：所教之概、系、技
- **必**：學者（隱——對話用）
- **可**：知學者境（專級、背、陳標）
- **可**：前敗釋（已試者）
- **可**：時/深限（速覽對深解）

## 行

### 一：察——圖學者

釋前定學者已知與所需。

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

1. 覆用所言：問、詞、陳標
2. 為此題分其可能級（一人或於某域進、於他域始）
3. 識最近發域（ZPD）：恰超今及而於支可達者？
4. 記諸誤念當前理乃正模可中
5. 識最佳入點：已知何接所需學？

得：明圖：學者所知、所需、何橋接二。察當足具以擇釋策。

敗：學者級不明→問校：「熟 [前概] 乎？」此非試——為善教集資。問覺尷→默為中級依答調。

### 二：架——架知至未知

由已解建至新概之路。

1. 識錨：學者必解之一概關標
2. 明陳接：「X、汝知者、於此新境作 Y、因...」
3. 一句一新概——勿同句二新概
4. 抽象前用具例
5. 建層繁：先簡、後加細
6. 缺前提→先教前提（小架）乃歸主概

得：架路、各步建於前。學者勿覺迷、各新念接已持者。

敗：知與未知間缺過大不能單架→分為多小步。無熟錨（全新域）→以類於學者所知他域。類不全→認限：「此似 X、唯...」

### 三：釋——調深與式

於正級、正模交釋。

1. 始以一句核——文前之題
2. 廣以步二之架釋
3. 用學者詞、非域術（除進階）
4. 碼概：示最小可行例、非全
5. 抽象概：先具例、後通
6. 流程：先具行步步、後陳通則
7. 監惑：次問不建於釋→釋未中

得：學者得釋、不淺（留問）不深（不必細淹）。釋用其語接其境。

敗：釋過長→核或埋——重陳一句題。釋後用更惑→入點誤——試異錨或類。概實繁→認繁勿匿：「此有三部、相影。先始於一。」

### 四：察——驗解

勿設釋成。問察學者心模。

1. 問需用、非憶：「予 X、料何發？」
2. 求復述：「能以汝詞釋之乎？」
3. 出變：「若改此一、何如？」
4. 覓具解：能測非唯重？
5. 答顯誤念→記具誤為步五
6. 答正→輕進：能通乎？

得：察顯學者持行心模或鸚鵡釋。行模可理變；憶釋不能。

敗：用不能答察→釋未建正心模。非用敗——為教之饋。記何未中而入步五。

### 五：適——應饋

依察果調教。

1. 解固→入固（步六）或進次概
2. 具誤念存→以據直理、非重
3. 通惑→試全異釋法
4. 學者越察→加速——略架入細
5. 學者落察→慢——教所缺前提

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

得：教實時依饋適。無釋同重——各試異法。適當覺應、非機。

敗：多適試敗→問或為缺前提甚基、雙方未識。明問：「釋何部覺最大跳？」此常顯隱缺。

### 六：固——予練

以用、非重固解。

1. 予練問需新概（非詭問）
2. 碼境：薦小改既存碼用此概
3. 概境：陳場景而求其施模
4. 接前：「今汝解 X、此接 Y、可後探」
5. 予獨探資：文鏈、關檔、續讀
6. 閉環：「總所學...」——一句為核

得：學者至少用概一次、有續學資。總錨於未來憶。

敗：練問過難→教跳過遠——簡之。學者能練而不能釋何故→有程序知無概解——歸步三焦「何」勝「如何」。

## 驗

- [ ] 釋前察學者級
- [ ] 釋自知至未知架、非堆資交
- [ ] 至少一察問驗解（非設）
- [ ] 教依饋適非重同釋
- [ ] 學者能用概、非唯憶釋
- [ ] 誠缺認、非覆

## 忌

- **知咒**：忘學者不享教者境。術、設前提、隱推步為主因
- **釋為動人非為教**：全準之釋顯知而留學者後
- **重高聲**：釋未中、加重重之而非試異法
- **試代教**：用察問為陷非為診。標為顯解、非捕敗
- **設默為解**：無問非謂釋成——常謂學者不知問何
- **單尺寸深**：予始者進釋因「當解全」淹之；予專家始釋因「安為佳」費其時

## 參

- `teach-guidance` — 人導變、為練人成善師
- `learn` — 系知取建可教之解
- `listen` — 深受注顯學者真需於陳問之外
- `meditate` — 教間清設以新待各學者
