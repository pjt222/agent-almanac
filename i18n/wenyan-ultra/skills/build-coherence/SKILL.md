---
name: build-coherence
locale: wenyan-ultra
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

# 建合

評競法以獨評、顯推言倡、信校委閾、結構困解—自多推路生合決。

## 用

- `forage-solutions` 識多有效法→當擇
- 於兩法間振而未委
- 需以結構推證決（構擇、工擇、施策）
- 前決由直覺而需據驗
- 內推生矛結而需復合
- 前不可逆行（合、發、刪）→誤擇價高

## 入

- **必**：兩或多競法以評
- **可**：昔偵之質評（見 `forage-solutions`）
- **可**：決重（可逆、中、不可逆）以校閾
- **可**：決之時限
- **可**：知敗模（振、早委、群思）

## 行

### 一：獨評

較前以己質評每法。要律：勿令 A 評偏 B 評。

每法獨評：

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

每法別填。諸獨評未完前勿書較。

**得：** 獨評—每法以己語評。B 評不引 A。質分映真評，非排序。

**敗：** 評染（評 B 時書「勝 A」）→重置。全評 A，而後清框自零評 B。諸分皆同→評維過粗—加域專準。

### 二：搖擺舞—言推

依質倡每法。乃蜂搖擺舞之 AI 對：令隱推為顯為公。

1. 每法→陳其理—如對疑用者呈：
   - 「A 法強因 [證]。主險為 [險]，以 [緩] 解。」
2. 倡強當依質分比：
   - 高質法：詳倡附具體證
   - 中質法：略倡附認限
   - 低質法：為全而提，不主倡
3. **互察**：倡 A 後→主尋支 B 之證。倡 B 後→尋支 A 之證。此抗證偏

言推之旨乃令決可審—於己與用者。若推不可述→評淺於所述分。

**得：** 每法顯推，可服中察者。互察揭至少一初遺之慮。

**敗：** 倡覺草率（走過場）→諸法或非真異—或一念之變。察：諸法異於機乎，抑唯異於施詳？後者→決或不要—擇其一而進。

### 三：設法定閾而委

設委所需信閾，校於決之重。

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

1. 分決重
2. 察：首法之質分 × 信達閾乎？
3. 若然：委。陳決、推、所受之要險
4. 若否：識何加訊可升信至閾
5. 委後勿重察除非新去權證現

**得：** 清委時附述推。決以重所宜之信級作。

**敗：** 閾永不達（不可逆事不能達九成）→問：決真不可逆乎？可分為可逆試階 + 不可逆委乎？多似不可逆之決可分階。若不可→告用者疑而求導。

### 四：解困

兩或多法分近而無單一達法定閾。

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

**得：** 困以所宜之機解。解要—無留疑擾行。

**敗：** 諸解後困仍→決或早。問用者：「見兩等強法：[A] 與 [B]。[各略陳]。合汝值者何？」委真平於用者—非敗—乃認決依 AI 不可推之值。

### 五：評合質

委後→評程生真合或但決。

1. 決據證乎，或但印初偏？
   - 試：評前後偏同乎？若同→評改何？
2. 敗法真慮乎，抑稻草人？
   - 試：能述敗法之最強理乎？
3. 何訊觸重評？
   - 定具體察以廢決（「若 API 不支 X，則 B 法更佳」）
4. 敗法中有益訊當導施乎？
   - B 法識之險或亦適 A

**得：** 略質察—證決或識其弱。弱→返宜前步，勿於不穩地進。

**敗：** 質察揭決由偏而非據→誠認。偏或所有—當名之，勿飾為析。

## 驗

- [ ] 較前每法獨評
- [ ] 倡依質比（非平注無論優劣）
- [ ] 互察已行（倡後尋反證）
- [ ] 法定閾校於決重
- [ ] 若困→具體解策已施
- [ ] 決後質察已行
- [ ] 重評觸已定

## 忌

- **早委**：評諸法前決。首慮法有錨利—但先得更心注。評諸而後較
- **平倡不平法**：A 分 85 而 B 分 45→平時倡兩→費力造偽等
- **印決**：行評以飾已決。試：評能改果乎？不→程為戲
- **避閾**：降信閾以易決，非集所需訊達宜閾
- **略敗側**：敗法常含警適勝法。B 識之險不因 A 勝而失

## 參

- `build-consensus` — 此技所適於單將推之多將合模
- `forage-solutions` — 偵合所評之解空；常先於此
- `coordinate-reasoning` — 多路評時訊流管
- `center` — 立無偏評所需之衡基
- `meditate` — 評異法間清假
