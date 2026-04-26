---
name: learn
locale: wenyan-lite
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

# 學習

進行結構化之知識獲取會話——勘察陌生之域，建立初始模型，以刻意探索驗之，整合所得為連貫理解，最終固化以便持久檢索。

## 適用時機

- 遇陌生代碼庫、框架或領域，毫無先前上下文
- 用戶詢及當前工作知識之外之主題，答案需真實探究，非僅回憶
- 多源或多模式相悖，須從零建立連貫心智模型
- `remote-viewing` 呈現直覺線索後需系統驗證
- 備 `teach` 之時——AI 須先深解方能釋之

## 輸入

- **必要**：學習目標——主題、代碼庫區、API、域概念或待解之技術
- **選擇性**：範圍邊界——深至何處（表面勘察 vs. 深度專精）
- **選擇性**：用戶之目的——何以需此知識（指引優先面向）
- **選擇性**：已知起點——已熟悉之文件、文檔或概念

## 步驟

### 步驟一：勘察——繪領土

試解之前，先繪地景以識別存在者。

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

1. 識別領土類型，擇主要模式
2. 作廣掃——非深讀，乃識別地標（關鍵文件、入口、核心概念）
3. 記邊界：何在範內，何毗鄰，何在範外
4. 識別缺口：表面重要而不透明之域
5. 繪粗圖：列主要組件及其表面關係

**預期：** 領土骨架圖，有 5-15 地標。對何處自表可明、何處需深探有所感。尚無理解——僅圖而已。

**失敗時：** 若領土太廣難勘，立即收窄範圍。問：「為滿足用戶目的，所需最少理解為何？」若無明顯入口，自輸出起（此系統產何？）逆向追溯。

### 步驟二：假設——建初始模型

自勘察構建系統運作之初始假設。

1. 擬 2-3 假設關於領土之結構或行為
2. 明陳每假設：「我信 X，因觀 Y」
3. 對每假設，識別何證據可驗之，何證據可否之
4. 以信心排序：何最受支持，何最搖擺
5. 識別最高價值之假設以先驗（若驗成，最能解鎖理解者）

**預期：** 具體、可證偽之假設——非模糊印象。各有驗證之測。諸假設共涵領土最重要之面。

**失敗時：** 若無假設可形，勘察過淺——返步驟一，深讀 2-3 地標。若所有假設感同不確，自最簡者起（奧卡姆剃刀）漸建。

### 步驟三：探索——探測並驗

系統驗每假設，以目標探究。

1. 擇最高優先級之假設
2. 設計最小探測：能驗或否之之最小探究為何？
3. 執行探測（讀文件、搜模式、測假設）
4. 記結果：已驗、已否，或已改
5. 若已否，依新證據更新假設
6. 若已驗，探更深：假設於邊緣是否仍立，抑或僅於中心？
7. 轉下一假設，重之

**預期：** 至少一假設已驗至結論。心智模型漸成——部分已驗，部分已修。驚奇為特有價值之數據。

**失敗時：** 若探測屢產模糊之果，假設恐驗錯物。退而問：「解此系統者會視何事為最重要之事實？」轉探此。

### 步驟四：整合——建心智模型

合所得為連貫之模型，連接諸片。

1. 回顧所有已驗與已修之假設
2. 識別中心組織原則：何為「脊柱」——萬事皆連於此？
3. 繪關係：何組件依何？何流何處？
4. 識別驚奇之發現——常含最深洞見
5. 尋跨領土不同部分重複之模式
6. 建可預測行為之心智模型：「輸入 X，我期 Y，因 Z」

**預期：** 連貫之心智模型能釋領土結構並預測行為。模型當可 3-5 句表達，須作具體斷言，非模糊之泛論。

**失敗時：** 若諸片不合為連貫模型，恐早期假設有根本誤解。識別不合之片，再驗之。另，領土或真實不連貫（劣設計之系統存在）——此亦作發現記之，勿強求連貫。

### 步驟五：驗證——挑戰理解

以預測驗心智模型，並查之。

1. 用模型對領土作 3 具體預測
2. 以探究驗每預測（勿假其為真）
3. 每已驗之預測，信心增
4. 每已否之預測，識別模型何處誤並修之
5. 識別邊緣情形：模型於邊界是否仍立，或崩？
6. 問：「何會使我驚？」——再查此驚是否可能

**預期：** 心智模型過至少 3 之 2 預測驗。其崩處，敗因已解，模型已修。模型今有已驗之強與已知之限。

**失敗時：** 若多預測敗，心智模型有根本缺陷。此反為有價值之信息——謂領土與所期不同。攜新證據返步驟二，自零重建假設。第二嘗試將快多，因誤模型已剔。

### 步驟六：固化——存以備檢索

捕學習於支未來檢索與應用之形式。

1. 以 3-5 句總結心智模型
2. 記關鍵地標——最須記之 3-5 事
3. 記任何反直覺之發現，或易忘者
4. 識別此學習所連之相關主題
5. 若學習持久（跨會話所需），更新 MEMORY.md
6. 若學習限本會話，作當前對話上下文記之
7. 陳述何仍未知——誠實缺口比虛假信心有用

**預期：** 簡潔、可檢索之總結，捕本質理解。未來此主題之引用可自此總結始，勿從零重學。

**失敗時：** 若學習抗拒總結，恐尚未完全整合——返步驟四。若學習感覺過於顯而見，值得存否可疑，思今感覺顯者於新上下文未必顯。存非顯之部分。

## 驗證

- [ ] 深究之前已勘察（先繪圖後潛）
- [ ] 假設已明陳並驗，非默認
- [ ] 至少一假設依證據已修（示真學習）
- [ ] 心智模型對領土作具體可驗之預測
- [ ] 已知未知與已知已知並識
- [ ] 固化之總結夠簡潔，於未來檢索有用

## 常見陷阱

- **略勘察**：未解地景即入細節，費時於不重處，失大局
- **不可證偽之假設**：「此恐複雜」不可驗。「此模塊處驗證，因其導入 crypto」可驗
- **探索中之確認偏誤**：僅尋支持初假之證據而忽矛盾
- **過早固化**：未驗模型即存之，致未來自信地預測誤
- **完美主義**：欲學盡方用。學習乃疊代——用部分理解，再精之
- **無目的之學**：無應用之志而獲知，產分散淺薄之理解

## 相關技能

- `learn-guidance` — 人類指導變體，用於陪伴人過結構化學習
- `teach` — 校準於學者之知識傳遞；建基於此處所構之模型
- `remote-viewing` — 直覺探索，呈現系統學習所驗之線索
- `meditate` — 入新學習領土之前清先前上下文噪音
- `observe` — 持續中性模式識別，以原始數據飼學習
