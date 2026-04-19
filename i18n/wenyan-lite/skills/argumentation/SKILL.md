---
name: argumentation
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Construct well-structured arguments using the hypothesis-argument-example
  triad. Covers formulating falsifiable hypotheses, building logical arguments
  (deductive, inductive, analogical, evidential), providing concrete examples,
  and steelmanning counterarguments. Use when writing or reviewing PR descriptions
  that propose technical changes, justifying design decisions in ADRs, constructing
  substantive code review feedback, or building a research argument or technical
  proposal.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: argumentation, reasoning, hypothesis, logic, rhetoric, critical-thinking
---

# 構論證

自假設經推理至具體證據之嚴謹論證構建。每有說服力之技術主張遵同三合：清晰假設陳*何*所信，論證釋*何以*成立，例證實*事實*成立。此技能教君將此結構施於碼複查、設計決策、研究撰寫，及任何主張需理由之情境。

## 適用時機

- 撰或複查提技術變更之 PR 描述
- 於 ADR（Architecture Decision Record）中為設計決策辯
- 為碼複查構超「我不喜」之回饋
- 撰研究論證或技術提案
- 於技術討論中挑戰或捍衛一法

## 輸入

- **必要**：需理由之主張或立場
- **必要**：情境（碼複查、設計決策、研究、文件）
- **選擇性**：受眾（同儕開發者、複查者、利害關係人、研究者）
- **選擇性**：欲應之反論或替代立場
- **選擇性**：可支主張之證據或資料

## 步驟

### 步驟一：擬假設

將主張陳為清晰、可證偽之假設。假設非意見或偏好——乃可對證據試之特定斷言。

1. 將主張寫為一句
2. 施可證偽試：他人能以證據證之為錯否？
3. 窄其範：限於特定情境、碼庫或領域
4. 由查可試之準則以與意見區

**不可證偽 vs. 可證偽：**

| Unfalsifiable (opinion)              | Falsifiable (hypothesis)                                       |
|--------------------------------------|----------------------------------------------------------------|
| "This code is bad"                   | "This function has O(n^2) complexity where O(n) is achievable" |
| "We should use TypeScript"           | "TypeScript's type system will catch the class of null-reference bugs that caused 4 of our last 6 production incidents" |
| "The API design is cleaner"          | "Replacing the 5 endpoint variants with a single parameterized endpoint reduces the public API surface by 60%" |
| "This research approach is better"   | "Method A achieves higher precision than Method B on dataset X at the 95% confidence level" |

**預期：** 一句之假設，特定、有範、可證偽。讀者可即想何證據將證或駁之。

**失敗時：** 若假設覺曖昧，施「我如何駁之？」之試。若不能想反證，主張為意見而非假設。窄範或加可量準則直至可試。

### 步驟二：辨論證類型

擇最佳支假設之邏輯結構。不同主張需不同推理策略。

1. 覽四論證類型：

| Type        | Structure                                  | Best for                          |
|-------------|--------------------------------------------|-----------------------------------|
| Deductive   | If A then B; A is true; therefore B        | Formal proofs, type safety claims |
| Inductive   | Observed pattern across N cases; therefore likely in general | Performance data, test results    |
| Analogical  | X is similar to Y in relevant ways; Y has property P; therefore X likely has P | Design decisions, technology choices |
| Evidential  | Evidence E is more likely under hypothesis H1 than H2; therefore H1 is supported | Research findings, A/B test results |

2. 將假設配於最強論證類型：
   - 主張某事*必*為真？用**演繹**
   - 主張某事依觀察而*傾向*真？用**歸納**
   - 主張某事依先例而*將可能工*？用**類比**
   - 主張一解釋較替代*更合資料*？用**證據**

3. 考合類型以更強論證（如類比推理由歸納證據支持）

**預期：** 已擇之論證類型（或合），附其合於假設之清理由。

**失敗時：** 若無單一類型潔合，假設或須拆為子主張。將之拆為各有自然論證結構之部。

### 步驟三：構論證

建連假設於其理由之邏輯鏈。

1. 陳前提（君所自起之事實或假設）
2. 示邏輯連結（前提如何引至結論）
3. 鋼化最強反論：於駁前以最佳形式陳之
4. 以證據或推理直應反論

**舉例——碼複查（演繹 + 歸納）：**

> **假設**：「將驗證邏輯提取至共享模組將減三 API 處理器間之缺陷重複。」
>
> **前提**：
> - 三處理器（`createUser`、`updateUser`、`deleteUser`）各以微異實作同輸入驗證（於 `src/handlers/` 觀察）
> - 過去 6 月，5 驗證缺陷中 3 於一處理器修而未傳於他者（見 issues #42、#57、#61）
> - 共享模組執行邏輯之單一真源（演繹：若一實作，則一處可修）
>
> **邏輯鏈**：因三處理器重複同驗證（前提一），於一中修之缺陷於他者中漏（前提二，自 3/5 案歸納）。共享模組意修一施於一切呼叫者（自共享模組語意演繹）。故，提取將減缺陷重複。
>
> **反論（鋼化）**：「共享模組引耦合——對一處理器驗證之變或斷他者。」
>
> **反駁**：處理器已共相同驗證*意圖*；耦合為隱且難維。經有參數化選項之共享模組（如 `validate(input, { requireEmail: true })`）使之顯，使耦合可見可測。當前隱重複更險，因其隱依賴。

**舉例——研究（證據）：**

> **假設**：「對生醫 NER 而言，於領域特定語料預訓練較增大通用語料更能改進下游任務表現。」
>
> **前提**：
> - 於 PubMed（45 億字）預訓練之 BioBERT 於 6/6 生醫 NER 基準上勝於通用英文（160 億字）預訓練之 BERT-Large（Lee et al., 2020）
> - 於 Semantic Scholar（31 億字）預訓練之 SciBERT 雖預訓練語料更小仍於 SciERC 與 JNLPBA 上勝 BERT-Base
> - 通用領域之擴展（BERT-Base 至 BERT-Large，3 倍參數）於生醫 NER 上產之增益較領域適應（BERT-Base 至 BioBERT，同參數）為小
>
> **邏輯鏈**：證據一致示對生醫 NER 而言，領域語料之擇勝語料規模（證據：此結果若領域特異性較規模更要則更可能）。三獨立比對指同方向，強歸納之案。
>
> **反論（鋼化）**：「此結果或不能推廣於生醫 NER 之外——生醫有異常專之詞彙，膨脹領域適應之優勢。」
>
> **反駁**：合理之限。假設特限於生醫 NER。然類似領域適應增益於法律 NLP（Legal-BERT）與金融 NLP（FinBERT）亦現，示模式或可推廣於他專領域，然此為需自身證據之另論。

**預期：** 完整論證鏈，附前提、邏輯連結、鋼化之反論、反駁。讀者可逐步循推理。

**失敗時：** 若論證覺弱，查前提。弱論證常源於未支前提，非邏輯之誤。為每前提尋證據或承認其為假設。若反論強於反駁，假設或需修。

### 步驟四：供具體例

以可獨立驗之證據支論證。例非說明——乃使論證可試之經驗基礎。

1. 至少供一**正例**確認假設
2. 至少供一**邊界情況或極端例**測極限
3. 確各例**可獨立驗**：他人能複現或查而不依君之詮
4. 對碼主張，引特定檔案、行號或提交
5. 對研究主張，引特定論文、資料集或實驗結果

**例選擇準則：**

| Criterion              | Good example                                        | Bad example                              |
|------------------------|-----------------------------------------------------|------------------------------------------|
| Independently verifiable | "Issue #42 shows the bug was fixed in handler A but not B" | "We've seen this kind of bug before"     |
| Specific               | "`createUser` at line 47 re-implements the same regex as `updateUser` at line 23" | "There's duplication in the codebase"    |
| Representative         | "3 of 5 validation bugs in the last 6 months followed this pattern" | "I once saw a bug like this"             |
| Includes edge cases    | "This pattern holds for string inputs but not for file upload validation, which has handler-specific constraints" | (no limitations mentioned)               |

**預期：** 讀者可獨立驗之具體例。至少一正例與一邊界情況。每引特定產物（檔案、行、issue、論文、資料集）。

**失敗時：** 若例難尋，假設或過廣或不繫於可觀察之實。將範窄至君實能指之事。例之缺為信號，非以糢糊引用粉飾之缺。

### 步驟五：組完整論證

將假設、論證、例合為情境宜之格式。

1. **碼複查**——將評論結構為：
   ```
   [S] <one-line summary of the suggestion>

   **Hypothesis**: <what you believe should change and why>

   **Argument**: <the logical case, with premises>

   **Evidence**: <specific files, lines, issues, or metrics>

   **Suggestion**: <concrete code change or approach>
   ```

2. **PR 描述**——將本結構為：
   ```markdown
   ## Why

   <Hypothesis: what problem this solves and the specific improvement claim>

   ## Approach

   <Argument: why this approach was chosen over alternatives>

   ## Evidence

   <Examples: benchmarks, bug references, before/after comparisons>
   ```

3. **ADR（Architecture Decision Records）**——用標準 ADR 格式，將三合對應於 Context（假設）、Decision（論證）、Consequences（預期結果之例／證據）

4. **研究撰寫**——對應於標準結構：Introduction 陳假設，Methods/Results 供論證與例，Discussion 應反論

5. 複查組成之論證以查：
   - 邏輯缺（結論實由前提導否？）
   - 缺證（有未支前提否？）
   - 未應反論（最強反對已答否？）
   - 範蔓延（論證留於假設範圍內否？）

**預期：** 完整、宜其情境之格式之論證。讀者可評假設、循推理、查證據、考反論——皆於一連貫結構中。

**失敗時：** 若組成之論證覺脫節，假設或過廣。拆為焦點子論證，各有自身假設-論證-例三合。二緊論證強於一鬆散。

## 驗證

- [ ] 假設可證偽（他人可以證據駁之）
- [ ] 假設範限於特定情境，非普世主張
- [ ] 論證類型已辨且合於主張
- [ ] 前提明陳，非假為共知
- [ ] 邏輯鏈連前提於結論而無缺
- [ ] 最強反論已鋼化並已應
- [ ] 至少一正例支假設
- [ ] 至少一邊界情況或限制已承
- [ ] 一切例皆可獨立驗（引用已供）
- [ ] 輸出格式合於情境（碼複查、PR、ADR、研究）
- [ ] 無邏輯謬誤（訴諸權威、假二分、稻草人）

## 常見陷阱

- **將意見陳為假設**：「此碼亂」為偏好，非假設。改為可試之主張：「此模組有 4 責任應依單一責任原則分，由其跨 3 不相關領域之 6 公共方法為證」
- **跳反論**：未應之反對弱化論證，即使讀者未發聲。恆鋼化——以最佳形式陳最強反對之案，後駁之
- **糢糊例**：「我們曾見此模式」非證據。指特定 issue、提交、行、論文或資料集。若不能尋具體例，假設或不甚紮實
- **訴諸權威**：「資深工程師曰然」或「Google 此為之」非邏輯論證。權威可*動*探究，然論證須立於自身之證據與推理
- **結論之範蔓延**：自證據所支以外導結論。若君之例涵 3 API 處理器，勿於整碼庫導結論。將結論之範配於證據之範
- **混論證類型**：對演繹主張（「必為」）用歸納語（「傾向」），或反之。精言結論之強——演繹論證給確定，歸納論證給機率

## 相關技能

- `review-pull-request` — 將論證施於結構化碼複查回饋
- `review-research` — 於研究情境中構基於證據之論證
- `review-software-architecture` — 以假設-論證-例三合為架構決策辯
- `create-skill` — 技能本身為達任務之結構化論證
- `write-claude-md` — 文件化得益於清理由之慣例與決策

### 組合：Argumentation + Advocatus Diaboli

對高賭注之決策，將此技能與 `advocatus-diaboli` 代理組成決策前複查環。模式：

1. **結構**經 argumentation——構假設-論證-例三合
2. **壓力測試**經 advocatus-diaboli——鋼化提案，後以特定問挑戰各假設。標嚴重度：Critical（重設計或棄）、Medium（調）、Low（注並進）
3. **修**依發現——critical 發現觸重設計；medium 觸調；low 受注

**何時組合 vs. 獨用：**
- 構提案、PR 描述或設計理由時獨用 argumentation
- 複查他人既有論證時獨用 advocatus-diaboli
- 君既為提者又需於提交前對抗自我複查時，組二者

**舉例——PR 回應精修：**
Argumentation 結構回應（假設：合 PR 為佳，附證據之論證，合作邀請）。Advocatus-diaboli 後捕二關鍵問題：關於代理過程識別之主張為臆測非事實（於安全 PR 上將尷尬），「我已實踐測試之」不可驗。皆移之。最終回應短 40-50%——過解釋示不安。

**舉例——系統設計分流：**
Argumentation（經 Plan 代理）設計完整 500 行分流管線。Advocatus-diaboli 殺之：於 9 項時，系統為過早，自身將成維護負擔（遞迴陷阱）。最終解：於既有腳本加 25 行。
