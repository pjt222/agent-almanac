---
name: learn
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  AI systematic knowledge acquisition from unfamiliar territory — deliberate
  model-building with feedback loops. Maps spaced repetition principles to
  AI reasoning: survey the territory, hypothesize structure, explore with
  probes, integrate findings, verify understanding, and consolidate for
  future retrieval. Use when encountering an unfamiliar codebase or domain,
  when a user asks about a topic requiring genuine investigation rather than
  recall, when multiple conflicting sources require building a coherent model,
  or when preparing to teach a topic and deep understanding is required first.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, knowledge-acquisition, meta-cognition, model-building
---

# 學

行結構知識採集——掃未知、立初模、以試探、合發現、驗解、固持久。

## 用

- 遇未知碼庫、框、或域且無前脈
- 用者問技外需真察非回憶之題
- 多矛盾源→須自空構一致心模
- `remote-viewing` 出直覺線索需系統驗
- 備 `teach` — AI 須深解以釋

## 入

- **必**：學目——題、碼庫區、API、域概、或技
- **可**：範約——幾深（表掃 vs 深專）
- **可**：用者目——此知何要（導優先面）
- **可**：已知起點——已熟文件、文、或概

## 行

### 一：掃——圖疆

解前先圖景以識存者：

```
學模擇：
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ 疆型              │ 主模                      │ 工具式                    │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 碼庫              │ 結構圖——               │ Glob 為文件樹、           │
│                  │ 尋入口、核模、邊            │ Grep 為 exports/imports、│
│                  │                          │ Read 為關鍵文件            │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ API/庫            │ 接口圖——               │ WebFetch 為文、           │
│                  │ 尋公面、型、配              │ Read 為例、               │
│                  │                          │ Grep 為用式                │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 域概              │ 本體圖——               │ WebSearch 為概覽、         │
│                  │ 尋核詞、關係、辯論           │ WebFetch 為定義、          │
│                  │                          │ Read 為本地註               │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ 用者脈            │ 對話圖——               │ Read 對話、                │
│                  │ 尋所陳目、偏、約            │ Read MEMORY.md、          │
│                  │                          │ Read CLAUDE.md             │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. 識疆型並擇主模
2. 行廣掃——非深讀，識地標（關鍵文件、入口、核概）
3. 記邊：何於範、何鄰、何外
4. 識隙：顯要而表不透之區
5. 造粗圖：列主組件與其表顯關係

得：疆骨圖有 5-15 地標識。何區表顯清、何需深察之感。尚無解——僅圖。

敗：疆過大不可掃→即窄範。問：「為服用目最少須解何？」無明入口→由出始（此系統生何？）逆追。

### 二：設——立初模

由掃構系統如何行之初設：

1. 立 2-3 結構或行為設
2. 各設明述：「吾信 X 因察 Y」
3. 各設識何證確、何證駁
4. 按信排：最支者、最動搖者
5. 識首試最高價設（若確→解最多者）

得：具體可證偽設——非模糊印。各有確或駁之試。諸設合蓋疆最要面。

敗：無設→掃淺→返步一，深讀 2-3 地標。諸設等不確→由最簡始（奧卡姆剃刀）構。

### 三：探——試並驗

以針察系統驗各設：

1. 擇最高優設
2. 設最小探：確或駁之最小察？
3. 行探（讀文件、搜式、試假）
4. 記結：確、駁、或改
5. 駁→按新證更設
6. 確→深探：設於邊是否持，抑僅中？
7. 次設複

得：至少一設試至結。心模成形——部確、部修。驚為特價數據。

敗：探恒生模糊結→設或試誤物。退問：「解此系統者視何為最要事實？」→探之。

### 四：合——構心模

合發現為連片之一致模：

1. 審諸確設與修模
2. 識中組原則：諸物所連之「脊」何？
3. 圖關係：何組件依何？何流何？
4. 識驚發現——常含最深洞見
5. 尋跨疆不同部重現之式
6. 構可預行為之心模：「入 X →出 Y，因 Z」

得：釋疆結構且預行為之一致心模。模可 3-5 句述且具體聲明非模糊泛化。

敗：片不合為一致模→前設中或有根解誤。識不合之片並重試。或疆真不一致（差設系統存）——記此為發現非強合。

### 五：驗——挑戰解

以預測並查驗心模：

1. 以模立 3 關疆之具體預
2. 以察驗各預（非假之）
3. 各確→信增
4. 各駁→識模誤處並正
5. 識邊例：模於邊持否，或崩？
6. 問：「何驚吾？」——查此驚可能乎

得：心模過 3 中至少 2 預測。崩處誤解並正。模有確優與已知限。

敗：多預敗→心模有根缺。此乃貴信息——意疆異預。以新證返步二重構設。二試速快因已除誤模。

### 六：固——存以取

捕學為支未來取與用之形：

1. 3-5 句總心模
2. 記關鍵地標——最要 3-5 事
3. 記易忘之反直覺發現
4. 識此學所連之相關題
5. 若學持久（跨會話須）→更 MEMORY.md
6. 若會話特→記為當對話脈
7. 述未知何——誠隙較假信有用

得：捕核解之簡取總。未來此題可由此總始非由空重學。

敗：學抗總→尚未完合→返步四。學似顯而不值存→考今顯者新脈中或不顯。存非顯部。

## 驗

- [ ] 深察前掃（圖先於潛）
- [ ] 設明述並試，非假
- [ ] 至少一設按證修（示真學）
- [ ] 心模作具體可試預
- [ ] 已知未知與已知已知同識
- [ ] 固總簡以有利未來取

## 忌

- **略掃**：解景前潛入細→費於非要區失大圖
- **不可證偽設**：「此或複」不可試。「此模處認證因導 crypto」可
- **探時確認偏**：僅尋支設之證忽矛盾
- **過早固**：未試存模→信錯之未來預
- **完美主義**：用知前欲學一切。學乃迭——用部解後精
- **無目學**：無應用之知→無焦淺解

## 參

- `learn-guidance` — 人指結構學之變體
- `teach` — 按學者校之知轉；基此處構之模
- `remote-viewing` — 出線索供系統學驗之直察
- `meditate` — 入新學疆前清前脈絡噪
- `observe` — 養學原數據之持中式識
