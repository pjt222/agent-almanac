---
name: argumentation
locale: wenyan-ultra
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

# 構辯

由設經辯至實證建嚴辯。技稱皆循三：明設述何信、辯釋何以、例證之確。

## 用

- 書或察提技變之 PR 述→用
- 證 ADR 設決→用
- 構非「不喜」之碼察饋→用
- 書研辯或技提→用
- 技論挑或衛某法→用

## 入

- **必**：須證之稱或位
- **必**：脈（碼察、設決、研、文）
- **可**：受（同伴、察者、利相關、研）
- **可**：對辯或他位以對
- **可**：可達證或數

## 行

### 一：擬設

述稱為明、可駁設。設非見或好——乃可對證測之具體斷。

1. 一句書稱
2. 施可駁測：有人可以證駁此乎？
3. 窄範：限於某脈、庫、域
4. 由可測準與見分

**可駁與不可駁：**

| Unfalsifiable (opinion)              | Falsifiable (hypothesis)                                       |
|--------------------------------------|----------------------------------------------------------------|
| "This code is bad"                   | "This function has O(n^2) complexity where O(n) is achievable" |
| "We should use TypeScript"           | "TypeScript's type system will catch the class of null-reference bugs that caused 4 of our last 6 production incidents" |
| "The API design is cleaner"          | "Replacing the 5 endpoint variants with a single parameterized endpoint reduces the public API surface by 60%" |
| "This research approach is better"   | "Method A achieves higher precision than Method B on dataset X at the 95% confidence level" |

得：一句設具體、定範、可駁。讀者可即想何證可確或駁。

敗：設似糊→施「吾何駁此」測。不能想反證→稱為見非設。窄範或加可量準至可測。

### 二：識辯類

擇最支設之邏構。異稱呼異推法。

1. 察四辯類：

| Type        | Structure                                  | Best for                          |
|-------------|--------------------------------------------|-----------------------------------|
| Deductive   | If A then B; A is true; therefore B        | Formal proofs, type safety claims |
| Inductive   | Observed pattern across N cases; therefore likely in general | Performance data, test results    |
| Analogical  | X is similar to Y in relevant ways; Y has property P; therefore X likely has P | Design decisions, technology choices |
| Evidential  | Evidence E is more likely under hypothesis H1 than H2; therefore H1 is supported | Research findings, A/B test results |

2. 配設於最強辯類：
   - 稱**必**真→**演繹**
   - 稱按觀**傾**真→**歸納**
   - 稱按相似前例**或行**→**類比**
   - 稱一釋**較合數**於它→**證據**

3. 考合類為強辯（如類比輔以歸納證）

得：擇辯類（或合）附明由何配設。

敗：無單類合→設或須分子稱。析為部，各有自然辯構。

### 三：構辯

築接設於證之邏鏈。

1. 述前提（始事或設）
2. 示邏接（前提如何引結）
3. 鋼化最強對辯：先述最佳對例**而後**駁
4. 直以證或推對對辯

**例——碼察（演+納）：**

> **設**：「取驗邏為共模將減三 API 處之蟲重」
>
> **前提**：
> - 三處（`createUser`、`updateUser`、`deleteUser`）各施同入驗微異（觀於 `src/handlers/`）
> - 末 6 月 5 驗蟲中 3 修一處而未傳他（見 #42、#57、#61）
> - 共模行邏一源（演：一施則一處可修）
>
> **邏鏈**：因三處重同驗（提一），一修而他漏（提二，自 3/5 例納）。共模意一修達諸呼者（共模語演）。故取將減蟲重。
>
> **對辯（鋼化）**：「共模引耦——驗變影一處可破他」
>
> **駁**：諸處已共同驗*意*；耦隱難維。經共模附參選（如 `validate(input, { requireEmail: true })`）使耦明可測。今隱重更險，蓋藏依。

**例——研（證據）：**

> **設**：「域語料前訓較增通語料更增生醫 NER 下游性能」
>
> **前提**：
> - PubMed 前訓 BioBERT（4.5B 詞）勝通英前訓 BERT-Large（16B 詞）於 6/6 生醫 NER 基（Lee 等，2020）
> - Semantic Scholar 前訓 SciBERT（3.1B 詞）勝 BERT-Base 於 SciERC、JNLPBA 雖前訓料小
> - 通域擴（BERT-Base 至 BERT-Large、3x 參）於生醫 NER 益小於域適（BERT-Base 至 BioBERT、同參）
>
> **邏鏈**：證一致示生醫 NER 域料擇勝料規（證據：此果於域特較規重時更可）。三獨比同向，強納。
>
> **對辯（鋼化）**：「此或不普於生醫 NER 外——生醫獨技詞膨域適優」
>
> **駁**：有效限。設專為生醫 NER。然似域適益見於法 NLP（Legal-BERT）與金 NLP（FinBERT），示紋或普於他特域，雖此分稱需自證。

得：完辯鏈附前提、邏接、鋼對辯、駁。讀者可步循。

敗：辯似弱→察前提。弱辯多由不證前提非邏誤。為各前提尋證或認為設。對辯強於駁→設或須改。

### 四：供具例

以獨可驗證輔辯。例非繪——乃使辯可測之經基。

1. 至少一**正例**確設
2. 至少一**邊例**測限
3. 各例**獨可驗**：他人可重或察不賴釋
4. 碼稱：引具檔、行、提
5. 研稱：引具論、集、實果

**例擇準：**

| Criterion              | Good example                                        | Bad example                              |
|------------------------|-----------------------------------------------------|------------------------------------------|
| Independently verifiable | "Issue #42 shows the bug was fixed in handler A but not B" | "We've seen this kind of bug before"     |
| Specific               | "`createUser` at line 47 re-implements the same regex as `updateUser` at line 23" | "There's duplication in the codebase"    |
| Representative         | "3 of 5 validation bugs in the last 6 months followed this pattern" | "I once saw a bug like this"             |
| Includes edge cases    | "This pattern holds for string inputs but not for file upload validation, which has handler-specific constraints" | (no limitations mentioned)               |

得：讀者可獨驗之具例。至少正一邊一。各引具產（檔、行、議、論、集）。

敗：例難尋→設或太廣或非觀現實接地。窄範至可指。例缺乃信號非以糊引補之缺。

### 五：合全辯

合設、辯、例為脈適式。

1. **碼察**——構註：
   ```
   [S] <one-line summary of the suggestion>

   **Hypothesis**: <what you believe should change and why>

   **Argument**: <the logical case, with premises>

   **Evidence**: <specific files, lines, issues, or metrics>

   **Suggestion**: <concrete code change or approach>
   ```

2. **PR 述**——構體：
   ```markdown
   ## Why

   <Hypothesis: what problem this solves and the specific improvement claim>

   ## Approach

   <Argument: why this approach was chosen over alternatives>

   ## Evidence

   <Examples: benchmarks, bug references, before/after comparisons>
   ```

3. **ADR**——用標 ADR 式三映於脈（設）、決（辯）、果（例/預證）

4. **研書**——映標構：引述設、法/果供辯與例、論對對辯

5. 察合辯：
   - 邏缺（結真自前提引乎）
   - 缺證（有不證前提乎）
   - 未對對辯（強對已答乎）
   - 範蔓（辯留設限內乎）

得：完、格之辯適於脈。讀者可評設、循推、察證、考對辯——皆於一連構。

敗：合辯似散→設或太廣。析為焦子辯，各自有設辯例三。兩緊辯勝一蔓辯。

## 驗

- [ ] 設可駁（有人可以證駁）
- [ ] 設定範於某脈非通稱
- [ ] 辯類識且合稱
- [ ] 前提明述非設共知
- [ ] 邏鏈無缺接前提於結
- [ ] 強對辯鋼化且對之
- [ ] 至少一正例支設
- [ ] 至少一邊例或限認
- [ ] 諸例獨可驗（附引）
- [ ] 出式配脈（碼察、PR、ADR、研）
- [ ] 無邏謬（訴威、假二分、稻人）

## 忌

- **以見為設**：「此碼亂」乃好非設。重書為可測稱：「此模有 4 責當分按單責律，證為其 6 公法跨 3 無關域」
- **略對辯**：未對之異弱辯雖讀者未述。恆鋼化——以最佳形述強對例而後駁
- **糊例**：「吾常見此紋」非證。指具議、提、行、論、集。具例難尋→設或非接地
- **訴威**：「資工程師言之」或「Google 如此」非邏辯。威可**激**究但辯須自證自推立
- **結範蔓**：結廣於證所支。例覆 3 API 處→勿結全庫。配結範於證範
- **混辯類**：演繹稱用納語（「傾」）或反之。精述結強——演供確、納供概

## 參

- `review-pull-request` —— 施構辯於構碼察饋
- `review-research` —— 構基證辯於研脈
- `review-software-architecture` —— 證構決以設辯例三
- `create-skill` —— 技本身為構辯如何成事
- `write-claude-md` —— 文益於明證之例與決

### 合：構辯 + 對辯魔

高險決，合此技與 `advocatus-diaboli` 為決前察環。紋：

1. **構** 經構辯——築設辯例三
2. **壓測** 經 advocatus-diaboli——鋼化提，後以具問挑各設。標嚴：關（重設或棄）、中（調）、低（註而進）
3. **改** 按發——關發重設；中發調；低發註

**何時合對獨用：**

- 構提、PR 述、設證唯用構辯
- 察他既辯唯用 advocatus-diaboli
- 既為提者且需對抗自察前提時合用兩

**例——PR 應精：**
構辯構應（設：合 PR 善、附證辯、合作邀）。advocatus-diaboli 後捕兩關症：代過程識稱為揣非實（安 PR 致愧）、「吾實踐已測之」不可驗。皆去。末應短 40-50%——過釋示不安。

**例——系設分流：**
構辯（經 Plan 代）設全 500 行分流管。advocatus-diaboli 殺之：9 項時系太早自為維負（遞陷）。末解：25 行加既腳。
