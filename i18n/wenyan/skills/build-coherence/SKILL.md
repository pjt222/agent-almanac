---
name: build-coherence
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI multi-path reasoning coherence using bee democracy — independent evaluation
  of competing approaches, waggle dance as reasoning-out-loud, quorum sensing
  for confidence thresholds, and deadlock resolution. Use when forage-solutions
  has identified multiple valid approaches and a selection must be made, when
  oscillating between options without committing, when justifying an architecture
  or tool choice with structured reasoning, or before an irreversible action where
  the cost of the wrong choice is high.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coherence, approach-selection, confidence-thresholds, meta-cognition, ai-self-application
---

# 建一貫

以獨評、明推聲、自信校之諾閾、結構化之僵解評競法——自多推徑生一貫之決。

## 用時

- `forage-solutions` 已識多可行法而須擇
- 於二法間搖而不諾
- 須以結構化推理證決（架構擇、工具擇、施略）
- 昔決出於直覺而須據證驗
- 內推生相悖之結而須復一貫
- 不可逆之行前（合併、交、刪）誤擇之價高

## 入

- **必要**：二或以上競法可評
- **可選**：先探之質評（見 `forage-solutions`）
- **可選**：決之賭（可逆、中、不可逆）以校閾
- **可選**：決之時預
- **可選**：已知之敗模（搖、早諾、群思）

## 法

### 第一步：獨評

各法獨評其值，而後較。要律：勿令 A 之評偏 B 之評。

各法獨評：

```
Approach Evaluation Template:
┌────────────────────────┬──────────────────────────────────────────┐
│ Dimension              │ Assessment                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach name          │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ Core mechanism         │ How does this approach solve the problem? │
├────────────────────────┼──────────────────────────────────────────┤
│ Strengths (2-3)        │ What does this approach do well?          │
├────────────────────────┼──────────────────────────────────────────┤
│ Risks (2-3)            │ What could go wrong? What is assumed?     │
├────────────────────────┼──────────────────────────────────────────┤
│ Evidence quality        │ How well-supported is this approach?      │
│                        │ (verified / inferred / speculated)        │
├────────────────────────┼──────────────────────────────────────────┤
│ Quality score (0-100)  │ Overall assessment                        │
├────────────────────────┼──────────────────────────────────────────┤
│ Confidence (0-100)     │ How confident in this assessment?         │
└────────────────────────┴──────────────────────────────────────────┘
```

各法獨填。諸獨評未畢，勿作較。

**得：** 諸獨評，各法自立評。B 之評不引 A。質分映真評，非排序。

**敗則：** 若評已染（評 B 時書「勝於 A」），重。全評 A，清框而自新評 B。若分皆同，評維太粗——加域特之準。

### 第二步：擺舞——明推

各法之倡，按其質成比。此乃 AI 版蜂舞：令隱推明而公。

1. 各法述其由——如向疑之用者陳：
   - 「法 A 強於 [證]。主危為 [危]，解以 [解]。」
2. 倡之力按質分：
   - 高質：詳倡附具證
   - 中質：簡倡認其限
   - 低質：為全列而提，非主倡
3. **交察**：倡 A 後，主尋 B 之證。倡 B 後，尋 A 之證。此反確認偏

明推之旨在令決可審——於己與用者。若推不可述，評淺於分所示。

**得：** 諸法之明推，足以服中立之觀者。交察示至少一先被略之考。

**敗則：** 若倡覺敷衍，諸法或非真異——或為同念之變。察：法異於機，抑只異於施詳？若後者，決或不要緊——擇一而進。

### 第三步：立諾閾而諾

立諾所須之信閾，按決之賭校。

```
Confidence Thresholds by Stakes:
┌─────────────────────┬───────────┬──────────────────────────────────┐
│ Decision Type       │ Threshold │ Rationale                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Easily reversible   │ 60%       │ Cost of trying and reverting is  │
│ (can undo)          │           │ low. Speed matters more than     │
│                     │           │ certainty                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Moderate stakes     │ 75%       │ Reverting has cost but is        │
│ (costly to reverse) │           │ possible. Worth investing in     │
│                     │           │ evaluation                       │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Irreversible or     │ 90%       │ Cannot undo. Must be confident.  │
│ high-stakes         │           │ If threshold not met, gather     │
│                     │           │ more information before deciding │
└─────────────────────┴───────────┴──────────────────────────────────┘
```

1. 類決之賭
2. 察：領法之質分 × 信達閾乎？
3. 若是：諾。述決、推、所受之要危
4. 若否：識何增訊可令信達閾
5. 諾後，除非新除格之證現，勿再察

**得：** 明諾之刻，附推。決於合賭之信級而成。

**敗則：** 若閾不達（不可逆決而信不及九成），問：決真不可逆乎？可分為可逆試階 + 不可逆諾乎？多似不可逆之決可階。若不能階，告用者其不確，請指引。

### 第四步：解僵

二或多法分相近而無一達諾閾。

```
Deadlock Resolution:
┌────────────────────────┬──────────────────────────────────────────┐
│ Deadlock Type          │ Resolution                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Genuine tie            │ The approaches are equivalent. Pick one  │
│ (scores within 5%)     │ and commit. The cost of deliberating     │
│                        │ exceeds the cost of picking the "wrong"  │
│                        │ equivalent option. Flip a coin mentally  │
├────────────────────────┼──────────────────────────────────────────┤
│ Information deficit    │ The tie exists because evaluation is     │
│ (scores uncertain)     │ incomplete. Invest one more specific     │
│                        │ investigation — a targeted file read, a  │
│                        │ quick test — then re-score               │
├────────────────────────┼──────────────────────────────────────────┤
│ Oscillation            │ Scoring keeps flip-flopping depending on │
│ (scores keep changing) │ which dimension gets attention. Time-box:│
│                        │ set a timer, evaluate once more, commit  │
│                        │ to the result regardless                 │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach merge         │ The best parts of A and B can be         │
│ (compatible strengths) │ combined. Check for compatibility. If    │
│                        │ merge is coherent, use it. If forced,    │
│                        │ don't — pick one                         │
└────────────────────────┴──────────────────────────────────────────┘
```

**得：** 以合機解僵。解為決斷——無餘疑撼施行。

**敗則：** 若諸解略僵仍在，決或過早。問用者：「吾見二等強之法：[A]、[B]。[各簡由]。何者合汝先？」託真等決於用者非敗——乃認決依 AI 不能推之值。

### 第五步：評一貫之質

諾決後，察過程生真一貫抑只生決。

1. 決據證乎，抑蓋章初好？
   - 試：評前後好同乎？若是，評改何乎？
2. 敗法真考乎，抑稻草人？
   - 試：能述敗法之最強由乎？
3. 何信觸重評？
   - 定具體察可廢決（「若發現 API 不支 X，則法 B 更佳」）
4. 敗法有益施行之訊乎？
   - 法 B 所識之危或亦適 A

**得：** 略察質以證或識弱之決。弱者，返先步，勿進於弱基。

**敗則：** 若質察示決據好非據證，實承之。或唯好可用——宜標為好，勿裝為析。

## 驗

- [ ] 各法較前已獨評
- [ ] 倡按質成比（非均注）
- [ ] 交察已行（倡後尋反證）
- [ ] 諾閾按賭校
- [ ] 若僵，已施具體解略
- [ ] 決後質察已行
- [ ] 已定重評之觸

## 陷

- **早諾**：諸法未全評而決。首考之法有錨利——先即得更多注。全評而後較
- **不等法均倡**：A 得八五 B 得四五，均倡費力且造假等
- **蓋章**：走過評以證已成之決。試：評能改果乎？否則過程為戲
- **避閾**：降閾以易決，而非集訊以達合閾
- **忽敗方**：敗法常含適勝法之警。B 所識之危未因擇 A 而消

## 參

- `build-consensus` — 此技改自之多代理共識模型
- `forage-solutions` — 探解空，一貫所評者；常先此技
- `coordinate-reasoning` — 多徑評中理訊流
- `center` — 立無偏評所須之平衡基線
- `meditate` — 評異法間清假設
