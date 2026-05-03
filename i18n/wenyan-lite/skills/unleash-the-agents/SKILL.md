---
name: unleash-the-agents
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
---

# 釋放眾代理

以平行波次召集所有可用代理,為開放式問題生成多元假設。每代理透過其獨特之領域視角推理——卡巴拉學者經由 gematria 尋模式、武術家提條件分支、凝思者以靜坐與資料共處而注意結構。獨立視角間之收斂為假設具價值之主要訊號。

## 適用時機

- 面對跨領域問題,正確方法未知
- 單代理或單領域方法已停滯或無訊號
- 問題受益於真正多元之視角（非僅更多算力）
- 需要假設生成,而非執行（執行用團隊）
- 高風險決策,錯失非顯而易見之角度有真實代價

## 輸入

- **必要**：問題簡報——清楚之問題描述、5 個以上具體範例、何謂解答
- **必要**：驗證方法——如何測試假設正確與否（程式測試、專家審查或零模型比較）
- **選擇性**：代理子集——納入或排除之特定代理（預設：所有已註冊代理）
- **選擇性**：波次規模——每波代理數（預設：10）
- **選擇性**：輸出格式——代理回應之結構化範本（預設：假設 + 推理 + 信心 + 可測試預測）

## 步驟

### 步驟一：擬定簡報

撰寫一份任何代理皆可理解之問題簡報,不論領域專業。包含：

1. **問題陳述**：欲發現或決定者為何（一兩句）
2. **範例**：至少 5 個具體輸入/輸出範例或資料點（愈多愈佳——3 個對多數代理而言不足以找模式）
3. **已知約束**：已知者為何、已嘗試者為何
4. **成功準則**：如何辨識正確假設
5. **輸出範本**：欲收回應之確切格式

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**預期：** 簡報自包含——僅收此文之代理已具一切推理問題所需。

**失敗時：** 若無法表述 5 個範例或驗證方法,問題尚未準備好作多代理諮詢。先收窄範圍。

### 步驟二：規劃波次

列出所有可用代理,分為約 10 人之波次。前兩波順序無關緊要；後續波次,波間知識注入可改善結果。

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

將代理分配至波次。先規劃 4 波——未必皆需用（見步驟四之提早停止）。

| 波次 | 代理 | 簡報變體 |
|------|--------|---------------|
| 1-2 | 20 代理 | 標準簡報 |
| 3 | 10 代理 + advocatus-diaboli | 簡報 + 浮現之共識 + 對抗性挑戰 |
| 4+ | 各 10 代理 | 簡報 + 「X 已確認。聚焦邊緣情況與失敗。」 |

**預期：** 波次分配表,所有代理皆有歸屬。將 `advocatus-diaboli` 納入第 3 波（非更晚）,使對抗性回合得告知後續波次。

**失敗時：** 若可用代理少於 20,減為 2-3 波。此模式即便僅 10 代理亦可運作,雖收斂訊號較弱。

### 步驟三：發動波次

將每波作為平行代理發動。用 `sonnet` 模型以節省成本（價值來自視角多元,非個別深度）。

#### 選項 A：TeamCreate（推薦用於完整 unleash）

用 Claude Code 之 `TeamCreate` 工具設置具任務追蹤之協調團隊。TeamCreate 為延遲工具——須先經 `ToolSearch("select:TeamCreate")` 取得。

1. 建立團隊：
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. 用 `TaskCreate` 為每代理建立任務,含簡報與領域特定框架
3. 以 `Agent` 工具召喚每代理為隊員,`team_name: "unleash-wave-1"`,`subagent_type` 設為該代理類型（如 `kabalist`、`geometrist`）
4. 經 `TaskUpdate` 含 `owner` 將任務指派予隊員
5. 經 `TaskList` 監看進度——隊員完成時將任務標為已完成
6. 波次間,經 `SendMessage({ type: "shutdown_request" })` 關閉當前團隊,並以更新後之簡報建立次團隊（步驟四）

此提供內建協調：共享任務清單追蹤哪些代理已回應,隊員可被傳訊以追問,主導者經任務指派管理波次轉換。

#### 選項 B：原始 Agent 召喚（更簡單,適小規模）

對波中每代理,以簡報與領域特定框架召喚之：

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

用 Agent 工具加 `run_in_background: true` 同時發動一波中之所有代理。等該波完成再發動下一波（以使步驟四之波間知識注入得進行）。

#### 選項間之取捨

| | TeamCreate | Raw Agent |
|---|---|---|
| 最適合 | 第 3 級全 unleash（40+ 代理） | 第 2 級小組（5-10 代理） |
| 協調 | 任務清單、傳訊、所有權 | 發出即忘、手動收集 |
| 波間交接 | 任務狀態延續 | 須手動追蹤 |
| 開銷 | 較高（每波設團隊） | 較低（每代理單次工具呼叫） |

**預期：** 每波於 2-5 分鐘內回約 10 個結構化回應。未回應或回非格式輸出之代理被記錄,但不阻塞流水線。

**失敗時：** 若一波超過 50% 失敗,檢查簡報之清晰度。常見原因：輸出範本含糊,或範例不足以使非領域代理推理。

### 步驟四：注入波間知識（並評估提早停止）

第 1-2 波後,於發動下一波前提取浮現之訊號。

1. 掃描已完成波次之回應以察重複主題
2. 辨識最常見之假設族（收斂訊號）
3. **檢查提早停止閾值**：若 20 代理後最高族已超過零模型期望之 3 倍,則訊號強。將第 3 波規劃為對抗性 + 精煉波,並考慮其後即停止
4. 為下一波更新簡報：

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**提早停止指引**：未必每次 unleash 皆需所有代理。對良定義之問題領域（如代碼庫分析）,收斂常於 30-40 代理時穩定。對抽象或開放式問題（如未知數學變換）,完整名單有價值,因正確領域真不可預測。每波後檢查收斂——若最高族之計數與零模型比已平台化,額外波次收益遞減。

此防止重複發現（後續波次獨立重新導出前波已找到者）並導向後續代理至問題之邊緣。

**預期：** 後續波次產生更細緻、針對性之假設,處理浮現共識中之缺口。

**失敗時：** 若兩波後無收斂,問題可能太無拘束。考慮收窄範圍或提供更多範例。

### 步驟五：收集與去重

所有波次完成後,將所有回應彙集至一文件。將假設按族分組去重：

1. 提取所有假設陳述
2. 依機制分群（非依措辭——「mod 94 模算術」與「Z_94 上之循環群」為同族）
3. 計每族之獨立發現次數
4. 依收斂排序：被更多代理獨立發現之族排序更高

**預期：** 假設族之排序清單,含收斂計數、貢獻代理及代表性可測試預測。

**失敗時：** 若每假設皆獨特（無收斂）,則信噪比過低。要麼問題需更多範例,要麼代理需更緊之輸出格式。

### 步驟六：對零模型驗證

對最高假設測試零模型,確保收斂有意義,非共享訓練資料之偽影。

- **程式驗證**：若假設產出可測試之公式或演算法,於保留範例上跑之
- **零模型**：估 N 個代理偶然收斂於同假設族之機率（如若有 K 個合理假設族,隨機收斂機率約 N/K）
- **閾值**：收斂超過零模型期望 3 倍時訊號才有意義

**預期：** 最高假設族顯著超過機率水準收斂,且/或通過程式驗證。

**失敗時：** 若最高假設未通過驗證,檢查次高族。若無族通過,問題可能需不同方法（更深之單專家分析、更多資料或重述範例）。

### 步驟七：對抗性精煉

**首選時機：第 3 波,而非綜合後。** 將 `advocatus-diaboli` 納入第 3 波（與波間知識注入並行）比所有波後之獨立對抗回合更有效。早期挑戰使第 4 波及之後得對批評精煉,而非堆疊於未經挑戰之共識之上。

若對抗回合已是第 3 波之一部分,則此步成最終檢查。否則（如未含而跑完所有波次）,現在召喚 `advocatus-diaboli`（或 `senior-researcher`）。為結構化回合,用 `TeamCreate` 設立審查團隊,兩代理皆對共識平行運作：

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**預期：** 一組反論點、邊緣情況與一個證偽實驗。若假設於對抗審視中存活,則準備整合。良好之對抗回合有時*部分捍衛*共識——發現該設計勝過其他選項,即便不完美。

**失敗時：** 若對抗代理找到致命缺陷,將批評反饋至針對性之追補波次（第 3+ 級迭代模式——選 5-10 個最能處理該特定批評之代理）。

### 步驟八：交接予團隊

Unleash 找問題；團隊解問題。將驗證之假設族轉為可行 issue,再組焦點團隊解每一個。

1. 為每驗證之假設族建立 GitHub issue（用 `create-github-issues` 技能）
2. 依收斂強度與影響為 issue 排序
3. 為每 issue,經 `TeamCreate` 組小團隊：
   - 若 `teams/` 中有預定義團隊配對問題領域,用之
   - 若無合適者,預設用 `opaque-team`（N 個 shapeshifter 含適應性角色指派）——此處理未知問題形狀,無需自訂組成
   - 至少含一非技術代理（如 `advocatus-diaboli`、`contemplative`）——彼等捕捉技術代理錯失之實作風險
   - 階段間用 REST 檢查點防匆忙
4. 流水線為：**unleash → 分流 → 每 issue 一團隊 → 解決**

**預期：** 每假設族對應至有指派團隊之追蹤 issue。Unleash 產出診斷；團隊產出修復。

**失敗時：** 若團隊組成不合問題,重新指派。Shapeshifter 代理可研究與設計但缺寫工具——團隊主導者須應用其代碼建議。

## 驗證

- [ ] 所有可用代理皆已諮詢（或刻意選子集並有理由）
- [ ] 回應以結構化、可解析之格式收集
- [ ] 假設已去重並依獨立收斂排序
- [ ] 最高假設已對零模型或程式測試驗證
- [ ] 對抗回合已挑戰共識
- [ ] 最終假設含可測試預測與已知限制

## 常見陷阱

- **簡報範例過少**：代理需 5+ 範例以找模式。3 範例下,多數代理訴諸表面模式匹配或範本回聲（將簡報以不同字詞回覆）
- **無驗證路徑**：無測試假設之法,則無法區分訊號與雜訊。收斂單獨為必要但不充分
- **隱喻式回應**：領域專家代理（mystic、shaman、kabalist）可能以豐富隱喻推理回應,難以程式解析。於輸出範本中含「將假設表為可測試之公式或演算法」
- **波間重複發現**：無波間知識注入,第 3-7 波獨立重新發現第 1-2 波已找到者。永遠於波次間更新簡報
- **過度詮釋收斂**：機制族 43% 收斂聽似可觀,但查基率。若僅有 3 個合理機制族,隨機收斂約 33%
- **期望單族主導**：抽象問題（模式辨識、密碼學）傾向產生一個主導假設族。多維問題（代碼庫分析、系統設計）產生跨多個有效族之較廣收斂——此為預期且健康,非模式之失敗
- **非技術代理之通用框架**：非技術代理之貢獻品質取決於簡報如何以其領域語言框架問題。「你的傳統對處於此閾值之系統有何見解？」產生結構性洞察；通用簡報無所獲。為問題自然領域之外之代理投入領域特定框架
- **以此為執行**：此模式生成假設,非實作。一旦有驗證之假設,將之轉為 issue 並交接予團隊（步驟八）。流水線為 unleash → 分流 → 每 issue 一團隊

## 相關技能

- `forage-solutions` — 探索解空間之蟻群最佳化（互補：較窄範圍、較深探索）
- `build-coherence` — 蜜蜂民主以選競爭方法（此技能後用以於最高假設間擇一）
- `coordinate-reasoning` — 用以管理代理間資訊流之 stigmergic 協調
- `coordinate-swarm` — 分散式系統之更廣群體協調模式
- `expand-awareness` — 收窄前先開啟感知（互補：作為個別代理之準備）
- `meditate` — 發動前清除上下文雜訊（步驟一前推薦）
