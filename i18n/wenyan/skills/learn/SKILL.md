---
name: learn
locale: wenyan
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

行結構化之知得——察生疆、建初模、以探試之、合察入貫之解、固以供久取。

## 用時

- 遇無先脈絡之生碼庫、框、或域
- 用者問當前知識外之題，答需真察而非召
- 諸相悖之源或型並存，貫之心模須自無建
- `remote-viewing` 現直覺之引，需系統驗之
- 備 `teach` 一題——AI 先須解之至足以述之

## 入

- **必要**：學之標——題、碼庫區、API、域概念、或欲解之技
- **可選**：範圍界——深及何處（表察對深通）
- **可選**：用者之旨——此知何以要（導何面當優）
- **可選**：既知起點——熟之檔、文、或概念

## 法

### 第一步：察——圖其疆

欲解任何物，先圖其景以辨所存。

```
Learning Modality Selection:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Territory Type   │ Primary Modality         │ Tool Pattern             │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ Structural mapping —     │ Glob for file tree,      │
│                  │ find entry points, core  │ Grep for exports/imports,│
│                  │ modules, boundaries      │ Read for key files       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ API / Library    │ Interface mapping —      │ WebFetch for docs,       │
│                  │ find public surface,     │ Read for examples,       │
│                  │ types, configuration     │ Grep for usage patterns  │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Domain concept   │ Ontology mapping —       │ WebSearch for overviews,  │
│                  │ find core terms,         │ WebFetch for definitions,│
│                  │ relationships, debates   │ Read for local notes     │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User's context   │ Conversational mapping   │ Read conversation,       │
│                  │ — find stated goals,     │ Read MEMORY.md,          │
│                  │ preferences, constraints │ Read CLAUDE.md           │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. 辨疆之類，擇主模
2. 行寬掃——非深讀，乃辨地標（關鍵檔、入點、核心概念）
3. 記界：何為範疇內、何為鄰、何為範疇外
4. 辨隙：面似要而表模糊之區
5. 作粗圖：列諸大成分及其表關係

**得：**疆之骨圖，辨 5-15 地標。知何區自表清、何區需深察。尚無解——僅圖。

**敗則：**若疆過大不可察，即縮範圍。問：「服用者旨所需之最少解為何？」若疆無清入點，自輸出啟（此系統產何？）反溯之。

### 第二步：設——建初模

自察構初假以述系統之運。

1. 形 2-3 假於疆之結構或行為
2. 明述每假：「吾信 X 因察 Y」
3. 每假識何證可證、何證可駁
4. 依信度序假：何最受支、何最搖
5. 辨最先試之高值假（證之則解最多者）

**得：**具體可否證之假——非模糊之印。每有試可證或駁。諸假合覆疆之最要面。

**敗則：**若無假形，察過淺——返第一步深讀 2-3 地標。若諸假同不確，啟於最簡者（Occam 之剃刀）建之。

### 第三步：探——試之

以針對之察系統試每假。

1. 擇優先最高之假
2. 設最小探：最小察可證或駁者為何？
3. 行探（讀一檔、搜一型、試一假設）
4. 記果：證、駁、或改
5. 若駁，依新證更假
6. 若證，深探：假於邊亦立，或僅於中？
7. 移下一假，復之

**得：**至少一假試至結。心模漸具形——部分已證，部分已修。奇尤為珍之息。

**敗則：**若探屢生曖果，假或試非要者。退一步問：「解此系統者當何視為最要之事實？」反探此。

### 第四步：合——建心模

合諸察為貫之模，連諸片。

1. 審諸已證之假與修之模
2. 辨中心組織之原則：諸者所連之「脊」為何？
3. 圖諸關係：何成分依何？何流何處？
4. 辨意外之察——常含最深之見
5. 尋跨疆不同部分重現之型
6. 建可預行為之心模：「予入 X，吾期 Y 因 Z」

**得：**貫之心模，釋疆之結構並預其行。模當可 3-5 句述之，當立具體論而非模糊泛。

**敗則：**若諸片不合貫之模，或於先前之某假有本誤。辨不合之片重試。否則疆或誠不貫（劣設系統存）——記此為察，勿強貫。

### 第五步：驗——挑戰解

以模立預測，察之以試心模。

1. 以模立三具體預測於疆
2. 以察試每預（勿假其真）
3. 每證之預，信增
4. 每駁之預，辨模所訛處並糾之
5. 辨邊例：模於界立乎，抑破？
6. 問：「何會令吾奇？」——察此奇是否可能

**得：**心模過三預之二試。破處，敗已解，模已糾。模今具證強與知限。

**敗則：**若多預敗，心模有本瑕。此乃珍之息——意疆之運異於期。以新證返第二步，自無重建諸假。次試更速，錯模已除。

### 第六步：固——存以供取

以支後取與用之形捕所學。

1. 以 3-5 句總結心模
2. 記關鍵地標——當記之 3-5 最要者
3. 記或被忘之反直覺察
4. 辨此學所連之相關題
5. 若學為久（跨會需），更 MEMORY.md
6. 若學為會專，記為當前對話之脈絡
7. 述仍未知者——誠之隙較假之信為益

**得：**簡而可取之總結，捕本解。此題之後參可自此總結啟，非自無重學。

**敗則：**若學拒總結，或尚未全合——返第四步。若學似顯而不值存，慮今似顯者於新脈絡或不顯。存非顯之部。

## 驗

- [ ] 深察前行察（圖先於潛）
- [ ] 假明述並試，非假設
- [ ] 至少一假依證修之（示真學）
- [ ] 心模立具體可試之預於疆
- [ ] 知之未知與知之已知並辨
- [ ] 固之總結簡至後取可用

## 陷

- **略察**：未解景而潛細耗時於不要區失大局
- **不可否證之假**：「此或複雜」不可試。「此模組處認證因匯密碼學」可試
- **探時確認偏見**：僅尋支初假之證而忽悖
- **早固**：模未試而存致後自信之誤預
- **完美主義**：欲學全者方用任何知。學為迭——用部解，再精
- **無旨之學**：無用心之得，生無焦淺解

## 參

- `learn-guidance` — 為導人歷結構化之學之人類變體
- `teach` — 校於學者之知傳；建於此所構之模
- `remote-viewing` — 直覺探，現系統學所驗之引
- `meditate` — 入新學疆前清先脈絡之噪
- `observe` — 中立持之型辨，以原數據供學
