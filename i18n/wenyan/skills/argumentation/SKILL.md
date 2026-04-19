---
name: argumentation
locale: wenyan
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

# 建論

自假設經推至具證，建嚴之論。諸說服技之宣皆循一三：假設明述*所信*、論釋*何以*持、例證*其*實持。此技教施此構於代碼審、設計決、研究寫、諸須論證之境。

## 用時

- 書或審提技變之 PR 述乃用
- 於 ADR（架構決記）證設計決乃用
- 建代碼審之饋勝於「不悅」乃用
- 書研論或技提乃用
- 於技議中挑或守一法乃用

## 入

- **必要**：需證之宣或立
- **必要**：境（代碼審、設計決、研、文）
- **可選**：聽者（同行、審者、相關者、研者）
- **可選**：所應之反論或別立
- **可選**：支宣之證或數

## 法

### 第一步：立假設

明述所宣為可證偽之假設。假設非意見非偏——乃可對證試之具宣也。

1. 書宣於一句
2. 施可證偽試：人可以證反之乎？
3. 狹範：限於具境、碼庫、域
4. 以可試之準別於意見

**可證偽對不可證偽：**

| Unfalsifiable (opinion)              | Falsifiable (hypothesis)                                       |
|--------------------------------------|----------------------------------------------------------------|
| "This code is bad"                   | "This function has O(n^2) complexity where O(n) is achievable" |
| "We should use TypeScript"           | "TypeScript's type system will catch the class of null-reference bugs that caused 4 of our last 6 production incidents" |
| "The API design is cleaner"          | "Replacing the 5 endpoint variants with a single parameterized endpoint reduces the public API surface by 60%" |
| "This research approach is better"   | "Method A achieves higher precision than Method B on dataset X at the 95% confidence level" |

**得：** 一句假設具體、限範、可證偽。讀者可即想何證能確或反。

**敗則：** 若假設曖，施「吾何以反之？」試。若不能想反證，宣為意見，非假設。狹範或加可量準使可試。

### 第二步：識論之類

擇支假設之邏輯構。異宣需異推。

1. 審四類論：

| Type        | Structure                                  | Best for                          |
|-------------|--------------------------------------------|-----------------------------------|
| Deductive   | If A then B; A is true; therefore B        | Formal proofs, type safety claims |
| Inductive   | Observed pattern across N cases; therefore likely in general | Performance data, test results    |
| Analogical  | X is similar to Y in relevant ways; Y has property P; therefore X likely has P | Design decisions, technology choices |
| Evidential  | Evidence E is more likely under hypothesis H1 than H2; therefore H1 is supported | Research findings, A/B test results |

2. 合假設於最強論類：
   - 宣*必*真？用**演繹**
   - 宣依觀*傾*真？用**歸納**
   - 宣似前例*或行*？用**類比**
   - 宣一釋*合數優*於他？用**證據**

3. 察合類以強論（如類比推附歸納證）

**得：** 所擇論類（或合）附何合假設之由。

**敗則：** 若無單類合，假設或需析為子宣。破為各有自然論構之部。

### 第三步：建論

建連假設於證之邏輯鏈。

1. 述前提（起之事或假）
2. 示邏輯連（前提如何導結）
3. 強化最強反論：先於駁前述其最佳式
4. 以證或推直對反論

**工之例——代碼審（演繹+歸納）：**

> **假設**：「提取驗邏於共模將減三 API 處器間之錯複。」
>
> **前提**：
> - 三處器（`createUser`、`updateUser`、`deleteUser`）各實同入驗附微異（察 `src/handlers/`）
> - 末半年，五驗錯中三於一處器修而他未傳（見 issues #42、#57、#61）
> - 共模強單源真（演繹：一實則一處修）
>
> **邏輯鏈**：因三處器複同驗（前提一），一處所修錯於他漏（前提二，三於五歸納）。共模則修一應諸（演繹自共模義）。故提取減錯複。
>
> **反論（強化）**：「共模引耦——一處器之驗變可破他。」
>
> **駁**：三處器本共驗*意*；耦為隱而難守。以共模附參化選（如 `validate(input, { requireEmail: true })`）明之，耦見而可試。當前隱複更險，藏其依。

**工之例——研（證據）：**

> **假設**：「於域特語料之預訓於生物 NER 下游任務進勝於增通語料大。」
>
> **前提**：
> - 於 PubMed（4.5B 詞）預訓之 BioBERT 於六之六生物 NER 基勝於通英 16B 預訓之 BERT-Large（Lee et al., 2020）
> - 於 Semantic Scholar（3.1B 詞）預訓之 SciBERT 於 SciERC 與 JNLPBA 雖預訓小勝 BERT-Base
> - 通域擴（BERT-Base 至 BERT-Large，三倍參）於生物 NER 益小於域適（BERT-Base 至 BioBERT，同參）
>
> **邏輯鏈**：諸證恆示域料擇於生物 NER 勝規模（證據：此果於域特勝規模更可能）。三獨比同向強歸納。
>
> **反論（強化）**：「此果或不普於生物 NER 外——生物有異特辭增域適益。」
>
> **駁**：有效限。假設限於生物 NER。然法律 NLP（Legal-BERT）、金融 NLP（FinBERT）示類域適益，或普於他域，然為別宣需獨證。

**得：** 全論鏈附前提、邏輯連、強化反論、駁。讀者可逐步循推。

**敗則：** 若論覺弱，察前提。弱論多出無證前提，非邏輯錯。尋各前提之證或認其為假。若反論強於駁，假設或需改。

### 第四步：供具例

以獨立可驗之證支論。例非畫——乃使論可試之經驗基。

1. 供至少一**正例**確假設
2. 供至少一**邊例或界**試其限
3. 確每例**獨立可驗**：他人可再現或察而不依汝釋
4. 碼宣則引具檔、行、提交
5. 研宣則引具論、數集、實驗果

**例擇準：**

| Criterion              | Good example                                        | Bad example                              |
|------------------------|-----------------------------------------------------|------------------------------------------|
| Independently verifiable | "Issue #42 shows the bug was fixed in handler A but not B" | "We've seen this kind of bug before"     |
| Specific               | "`createUser` at line 47 re-implements the same regex as `updateUser` at line 23" | "There's duplication in the codebase"    |
| Representative         | "3 of 5 validation bugs in the last 6 months followed this pattern" | "I once saw a bug like this"             |
| Includes edge cases    | "This pattern holds for string inputs but not for file upload validation, which has handler-specific constraints" | (no limitations mentioned)               |

**得：** 讀者可獨驗之具例。至少一正與一邊。每引具物（檔、行、issue、論、數集）。

**敗則：** 若例難尋，假設或過廣或不基於可察實。狹至可指之範。無例為信，非隙可以曖引蓋。

### 第五步：裝全論

合假設、論、例為境之式。

1. **代碼審** — 注此構：
   ```
   [S] <one-line summary of the suggestion>

   **Hypothesis**: <what you believe should change and why>

   **Argument**: <the logical case, with premises>

   **Evidence**: <specific files, lines, issues, or metrics>

   **Suggestion**: <concrete code change or approach>
   ```

2. **PR 述** — 身結構：
   ```markdown
   ## Why

   <Hypothesis: what problem this solves and the specific improvement claim>

   ## Approach

   <Argument: why this approach was chosen over alternatives>

   ## Evidence

   <Examples: benchmarks, bug references, before/after comparisons>
   ```

3. **ADR**（架構決記）— 用標 ADR 式，以 Context（假設）、Decision（論）、Consequences（預果之例/證）映三

4. **研寫** — 映標構：Introduction 述假設，Methods/Results 供論與例，Discussion 應反論

5. 察所裝論：
   - 邏輯隙（結誠由前提而出乎？）
   - 證闕（有無支之前提乎？）
   - 未應之反論（最強異議已答乎？）
   - 範蔓（論留於假設界乎？）

**得：** 合境之全格論。讀者可評假設、循推、察證、察反論——皆於一構中。

**敗則：** 若所裝論覺散，假設或過廣。析為聚子論，各有自三。二緊論勝於一散論。

## 驗

- [ ] 假設可證偽（人可以證反之）
- [ ] 假設限具境，非普宣
- [ ] 論類識而合宣
- [ ] 前提明述，非假為共知
- [ ] 邏輯鏈連前提於結無隙
- [ ] 最強反論強化而應
- [ ] 至少一正例支假設
- [ ] 至少一邊例或限認
- [ ] 諸例獨立可驗（引供）
- [ ] 出式合境（代碼審、PR、ADR、研）
- [ ] 無邏輯謬（訴權威、假二分、稻草人）

## 陷

- **以意見為假設**：「此碼亂」為偏非假設。改為可試之宣：「此模有四責宜依單責則分，見其六公法跨三無關域」
- **跳反論**：未應之異弱論雖讀者未言。恆強化——於駁前述最佳異式
- **曖例**：「吾嘗見此式」非證。指具 issue、提交、行、論、數集。若不能尋具例，假設或不基
- **訴權威**：「老工程師言」或「Google 如是」非邏輯論。權威可*啟*察，然論必以自證與推立
- **結中範蔓**：結廣於證。若例覆三 API 處器，勿結全庫。結範合證範
- **混論類**：歸納語（「傾」）用於演繹宣（「必」）或反。明述結之強——演繹予定，歸納予概

## 參

- `review-pull-request` — 施論於結構化代碼審之饋
- `review-research` — 研境建證本論
- `review-software-architecture` — 以三證架構決
- `create-skill` — 技本為如何成任之結構化論
- `write-claude-md` — 書得益於清證之約與決

### 合：論 + advocatus-diaboli

高值決可合此技於 `advocatus-diaboli` 吏為決前審環。式：

1. **構** 經論——建三
2. **壓試** 經 advocatus-diaboli——強化提，再以具問挑諸假。標重：關鍵（重設或棄）、中（調）、低（注而進）
3. **改** 依發現——關鍵啟重設；中啟調；低注

**合對獨用：**
- 建提、PR 述、設計證時獨用論
- 審他人之論時獨用 advocatus-diaboli
- 若既為提者又需敵察再提前合用

**例——PR 應精**：
論結構化應（假設：合 PR 更佳、論附證、協助）。Advocatus-diaboli 捕二關鍵患：代理程識之宣為推而非實（於安 PR 將辱）、「吾已於實踐試」不可驗。皆除。終應短 40-50%——過釋示不安。

**例——系設分流**：
論（經 Plan 吏）設全 500 行分流管。Advocatus-diaboli 殺之：於九項時，系過早而自成守擔（遞陷）。終解：25 行加於既本。
