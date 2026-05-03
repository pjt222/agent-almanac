---
name: teach
locale: wenyan
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

行構之知傳——察學者所知、自知至未知架橋、依適深釋之、以問驗解、隨饋而調、以練固之。

## 用時

- 用者問「X 何以行？」而答須漸釋而非數據之傾乃用
- 用者之問顯其與所須知之缺乃用
- 前釋未落——用者惑或異辭再問乃用
- 教含用者或無之先決條件之念乃用
- `learn` 既建深心模而今須有效傳乃用

## 入

- **必要**：所教之念、系、技
- **必要**：學者（隱式可得——對話之用者）
- **可選**：知學者之境（專階、背景、明的）
- **可選**：前敗之釋（已試何）
- **可選**：時／深之限（速覽 vs 深解）

## 法

### 第一步：察——圖學者

釋前，定學者所知與所須。

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

1. 察用者所言：問、辭、明的
2. 為此題分其可能之階（人於一域可進，於他域可初）
3. 識最近發展區（ZPD）：何過其當前及而以助可達？
4. 注須先治之誤念，以使正模可落
5. 識最佳入點：所知連於所學者為何？

得：明圖學者所知、所須、橋連二者。察當具體足以擇釋之策。

敗則：若學者之階不明，問校之問：「君熟悉 [先決念] 否？」此非試——乃集資以更善教。若問感尷，默為中階而依其應調。

### 第二步：架——橋知至未知

自學者所解者建路至新念。

1. 識錨：學者必解之一念，連於目
2. 明陳其連：「君所知之 X 於此新境似 Y，蓋……」
3. 一句中唯引一新念——勿二
4. 具例先於抽象之則
5. 建層之繁：簡版先，後加細
6. 若先決缺，先教先決（小架）方回主念

得：架之路，各步建於前。學者不當迷，蓋每新念連於其所持。

敗則：若知與未知之缺太大，分為數小步。若無熟之錨（全新域），用學者所知他域之類比。若類比不全，認其限：「如 X，唯……」

### 第三步：釋——調深與式

於正階，以正模獻釋。

1. 一句啟核念——文前之題
2. 以第二步所建之架釋之
3. 用學者之辭，非域之術（除非進階）
4. 為碼念：示最小可行例，非全例
5. 為抽念：先具例，後通之
6. 為程：先具例逐步，後陳通則
7. 察惑之徵：若下問不建於此釋，釋未落

得：學者得釋，不淺（留其問）不深（過細而壓）。釋用其辭而連其境。

敗則：若釋太長，核念或埋——重述一句之題。若學者於釋後更惑，入點誤——試他錨或類比。若念實繁，認其繁，勿藏：「此有三部，相交。先始於一。」

### 第四步：察——驗解

勿假釋已成。以問顯學者之心模而試之。

1. 問須施而非憶之問：「給 X，期何發？」
2. 求其重述：「能以己辭釋之乎？」
3. 獻變：「若變此一物何如？」
4. 察具體之解：可預乎，非僅復？
5. 若答顯誤念，記其具誤為第五步
6. 若答正，輕推之：可通乎？

得：察顯學者有可行心模或徒復釋。可行模能治變；憶之釋不能。

敗則：若學者不能答察問，釋未建正心模。此非其敗——乃教之饋。注何具未落而續第五步。

### 第五步：調——應饋

依察果調教法。

1. 解固：續至固（第六步）或進下念
2. 有具誤念：以證直治之，非復
3. 通惑：試全異釋之法
4. 學者超察：加速——略架而至細
5. 學者落察：緩之——教所缺先決

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

得：教實時依饋而調。無釋同重——每試異法。調當感應，非機。

敗則：若數調皆敗，問題或為極基之先決，二者皆未識。明問：「釋中何感最大跳？」此常顯隱缺。

### 第六步：固——獻練

以施固解，非以復。

1. 獻須新念之練問（非詐問）
2. 碼境：薦小修既存碼用此念
3. 念境：獻境而求其施之模
4. 連前：「君既解 X，連於 Y，下可探之」
5. 獻參資為獨探：文檔鏈、相關文、續讀
6. 閉環：「總所覆者……」——一句為核念

得：學者已施念至少一次，有資為續學。總錨之為來憶。

敗則：若練問太難，教跳太遠——簡之。若學者能行而不能釋因，有程知無念解——回第三步焦於「何以」非「何如」。

## 驗

- [ ] 釋前已察學者之階
- [ ] 釋自知至未知已架，非數據傾
- [ ] 至少一察問已問以驗解（非假）
- [ ] 教依饋而調，非復同釋
- [ ] 學者能施念，非僅憶釋
- [ ] 誠之缺已認，非掩

## 陷

- **知之咒**：忘學者不共教者之境。術、假先決、隱推步為主犯。
- **釋為印而非教**：全而精之釋，顯知而留學者於後。
- **聲復**：釋未落，重以更力而非試他法。
- **以察為試**：以察問為陷而非診器。的在顯解，非捕敗。
- **假默為解**：無問非釋成——常為學者不知何問。
- **齊深**：與初者進釋因「當解全圖」則壓；與專者初釋因「保險」則耗其時。

## 參

- `teach-guidance` — 人之引變，導人成更善之師
- `learn` — 系之知獲，建可教之解
- `listen` — 深受之注，顯學者所述問外實之須
- `meditate` — 教課間清假，每學者新待之
