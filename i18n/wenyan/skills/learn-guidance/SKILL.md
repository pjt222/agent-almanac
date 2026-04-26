---
name: learn-guidance
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Guide a person through structured learning of a new topic, technology,
  or skill. AI acts as learning coach — assessing current knowledge,
  designing a learning path, walking through material, testing understanding,
  adapting difficulty, and planning review sessions for retention. Use when
  a person wants to learn a new technology and does not know where to start,
  when someone feels overwhelmed by documentation, when a person keeps
  forgetting material and needs spaced repetition, or when transitioning
  between domains and needing a gap analysis.
license: MIT
allowed-tools: Read WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, coaching, education, structured-learning, guidance
---

# 學（導人）

導一人歷結構化之學，以習新題、技、或能。AI 為學之教練——察當前知、設學之徑、以適速行教、以問試解、依反饋適法、並計復以留。

## 用時

- 欲學新技、框、語、或概念而不知自何起
- 感文件或學源壓迫而需結構之徑
- 屢忘其所學而需間隔復習之導
- 於域間遷（如後端至前端）而需察隙
- 欲自主之學有擔與結構
- `meditate-guidance` 清心噪後，為專學立空間

## 入

- **必要**：彼欲學者（題、技、能、或概念）
- **必要**：彼學之旨（職需、興趣、項目需、職轉）
- **可選**：此域之當前知（自評或已示）
- **可選**：學之可得時間（每日／每週時數、若有限期）
- **可選**：偏好之學式（讀、親行、影片、討論）
- **可選**：先前失敗之學嘗（何前不奏效）

## 法

### 第一步：察——定起點

設學徑前，解彼今所居。

1. 問彼於此題之經：「汝既知 X 何？」
2. 問鄰知：「汝熟何相關題？」（此為橋）
3. 若彼言知，以校準之問示深或表之熟
4. 記彼詞彙：用域語正、近、或全不？
5. 具體辨彼學之標：「學此後，汝欲能何為？」
6. 辨彼主動機：好奇、實需、職進、或創項

```
Starting Position Assessment:
┌───────────────┬────────────────────────────┬──────────────────────────┐
│ Level Found   │ Indicators                 │ Path Approach            │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ No exposure   │ No vocabulary, no mental   │ Start with "what" and    │
│               │ model, everything is new   │ "why" before "how"       │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Surface       │ Has heard terms, no hands- │ Fill vocabulary gaps,    │
│ awareness     │ on experience, vague model │ then move to hands-on    │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Partial       │ Some experience, gaps in   │ Identify specific gaps   │
│ knowledge     │ understanding, can do some │ and target them directly │
│               │ things but not others      │                          │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Refresher     │ Knew it before, now rusty  │ Quick review + practice  │
│ needed        │                            │ to reactivate knowledge  │
└───────────────┴────────────────────────────┴──────────────────────────┘
```

**得：**彼起點、標、限之清圖。察當溫而勵，勿似試——以好奇其背為問之框。

**敗則：**若彼不能述當前之階，令彼述近嘗用或解此題之實。具體事較自評更精露階。若彼為階愧，常化之：「人皆自某處起——知汝於何處助吾設最善之徑。」

### 第二步：計——設學徑

自彼當前位至其標，建結構之徑。

1. 分題為 4-7 學之里程（勿過細，勿過虛）
2. 依依賴序里程：何須先解於何？
3. 每里程辨核心概念（須解者）與核心能（須行者）
4. 依彼可得時估每里程之時
5. 辨首里程——學自此起
6. 納早勝：首里程當速達以立勢
7. 圖以視：列附短述之編號

**得：**彼可視可解之學徑。當感可管——非壓。彼當能指任里程而解其所在。

**敗則：**若徑似過長，標或於可得時過於雄——議縮範圍。若徑似過短，題或較期為簡——或里程過粗而需解。

### 第三步：導——行於材

每里程，以適速導彼歷材。

1. 以短概介里程概念：「此節，吾輩將學 X，以令汝能 Y」
2. 以小塊呈材——每塊一概念
3. 用彼偏好之學式：讀 → 供文；親行 → 供練；討論 → 用蘇格拉底問
4. 連每新概念於彼既知者（自察得）
5. 具體例先於抽象定義
6. 若用文件，導彼歷相關段，非遣彼獨讀
7. 每塊後停：「至此解否？」

**得：**彼以解進歷材，非僅曝。彼當能於移次前以己語述每概念。速適——不急不拖。

**敗則：**若彼苦，緩速而察缺前置。若彼過速，加速——勿耗時於彼已掌。若材本困（劣文件），供更清之釋並記資源之質以後參。

### 第四步：試——察解

以需用之問驗學，非僅召。

1. 問預測：「若汝改 X，何生？」
2. 問比較：「此與汝先學之 Y 何異？」
3. 問用：「汝將如何用此以解 Z？」
4. 問除錯：「此碼有疵與吾輩剛學者相關——汝能察乎？」
5. 具體慶正答：「然——而此奏效之故為……」
6. 誤答，探其思：「有趣——述汝之思」
7. 勿以誤答為敗——乃診斷之息

**得：**試露彼具運作心模或表面召。運作模能處變；表面召不能。試當感如協作之練，非考。

**敗則：**若彼不能答用之問，學過被——需親行於更多材前。若彼答召而不答用，概念獨解而未合——聚於概念間之連。

### 第五步：適——調徑

依試果與彼反饋調學徑。

1. 若里程易：慮併於次里程，或深化內容
2. 若里程難：分為更小步，或添前置復
3. 若彼於學中興轉：盡可能隨彼好奇調徑——投入驅留
4. 若彼倦：議歇並後復，勿強推
5. 若某教法不奏效：試他模式（自讀換行、自抽象換具體）
6. 更學徑並傳改：「依此之況，吾薦調……」

**得：**學徑依實數據而進。無固課綱遇真學者而存——適乃值。

**敗則：**若屢適彼仍苦，或於察未獲之本前置有隙。返第一步深探。若彼失動機，議原標——有時調標較改徑更宜。

### 第六步：復——固並計次會

固所學並為續學立。

1. 總述所涵：「今吾輩學 X、Y、Z」
2. 令彼以己語述關鍵要點
3. 供短練以獨自為（非作業——選之強化）
4. 薦 2-3 資源以擴察（文件、教程、例）
5. 若用間隔復：排復點——「二日後復此概念，繼於一週後」
6. 立次里程：「下次，吾輩將攻……」
7. 求反饋：「何奏效？何吾當異為？」

**得：**彼去時清解所學、可練、次來者。會淨閉，非突停。

**敗則：**若彼不能述關鍵要點，會涵過多或留過少。辨最需強化之一概念，復聚於此。若彼於獨練無動機，學徑或需更自足（諸學皆於會內）。

## 驗

- [ ] 起點於學徑設前已察
- [ ] 學徑具清里程，依依賴序
- [ ] 材以小塊呈，間以解察
- [ ] 試用用之問，非僅召
- [ ] 徑依彼實進至少適一
- [ ] 會以總結、練議、次步閉
- [ ] 彼始終受勵，非試或判

## 陷

- **息傾**：一次全供材而不以里程調速。壓迫殺學
- **略察**：假彼之階而不驗。前端專學後端，或知鄰概念而非汝所期
- **教於均**：若彼較期速或慢，速須改——執計不顧反饋耗彼時或失彼
- **全理無練**：解需行，非僅聽。每里程當含練之素
- **忽動機**：不見概念何以要者不留。連每概念於彼述之標
- **會過載**：欲一坐涵過多。少而留優於多而忘
- **教練為講者**：教練導學者之探，非作獨白。問多於答

## 參

- `learn` — AI 自主變體，以行系統之知得
- `teach-guidance` — 導一人教他者；與學之導互補
- `meditate-guidance` — 學會前清心噪改焦與留
- `remote-viewing-guidance` — 共結構化觀察之法，支自經學
