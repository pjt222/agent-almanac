---
name: forage-resources
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Apply ant colony optimization and foraging theory to resource search,
  exploration-exploitation tradeoffs, and distributed discovery. Covers
  scout deployment, trail reinforcement, diminishing returns detection,
  and adaptive foraging strategy selection. Use when searching a large
  solution space where brute-force enumeration is impractical, balancing
  investment between exploring new approaches and deepening known good ones,
  optimizing resource allocation across uncertain opportunities, or diagnosing
  premature convergence on local optima.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, ant-colony-optimization, exploration-exploitation
---

# 採資源

施採覓論與蟻群優化以系統搜、評、用分散之資源——衡探未知境與用已知產。

## 適用時機

- 搜大之解空間，窮舉不可行
- 衡投入於探新法與深化已知善法
- 於多不定機會間優化資源配置
- 為分散之團隊或自動代理設計搜策
- 診過早收斂（困於局部最優）或永恆游走（永不承諾）
- 以具體資源發現模式輔 `coordinate-swarm`

## 輸入

- **必要**：所求資源之述（信息、算力、人才、解、機會）
- **必要**：搜空間之述（大小、結構、已知特徵）
- **選擇性**：當前搜策與其敗模
- **選擇性**：可用之 scout/搜者數
- **選擇性**：探之代價 vs 用失敗之代價
- **選擇性**：時間範圍（短期用 vs 長期探）

## 步驟

### 步驟一：映採覓景

察資源環境以擇合適之採覓策。

1. 識資源類與其分布：
   - **集中**：資源聚於富片（如人才於特社區）
   - **分散**：資源均布（如 bug 於代碼庫）
   - **暫現**：資源現而消（如市場機會）
   - **嵌套**：富片於異尺度含子片
2. 評信息景：
   - 採覓始前已知幾多資源位？
   - Scout 可與採者共信息否？（見 `coordinate-swarm` 查信號設計）
   - 採覓中景靜或變？
3. 定代價結構：
   - 每 scout 部署之代價（時、算、金）
   - 用低質資源之代價（機會成本）
   - 失高質資源之代價（悔）

**預期：** 已具資源分布類、信息可得、代價結構之採覓景。此定施何採覓模型。

**失敗時：** 若景全不知，以固定時間預算始最大之探（所有 scout，無用）以建初圖。景性明後切至合適之模型。

### 步驟二：部 scout 帶跡標

送探性代理入搜空間，帶其所尋之標之指令。

1. 配 scout 百分比（自 20-30% 可用代理為 scout 始）
2. 定 scout 行為：
   - 以隨機或系統模式穿搜空間
   - 評每所遇之位（速評，非深析）
   - 以與質成比之信號強度標發現：
     - 高質 → 強跡信號
     - 中質 → 中信號
     - 低質 → 弱或無信號
   - 返信息予集體（信號存、報、廣播）
3. 設 scout 模式：
   - **隨機遊走**：於未知均勻景為佳
   - **Levy 飛行**：長跳加偶爾局部聚——於片狀資源為佳
   - **系統掃**：格或螺——於有界、明空間為佳
   - **偏隨機**：傾向於似前尋處之區——於聚狀資源為佳

**預期：** Scout 已部於搜空間，存與資源質成比之跡信號。景之初圖自 scout 報始現。

**失敗時：** 若 scout 於初掃無所得，或 scout 百分比過低（增至 50%）、或搜模式誤（於片狀資源自隨機遊走切至 Levy 飛行）、或質評誤校（降偵閾）。

### 步驟三：立跡強化

建擴成功路而令失敗者衰之正反饋環。

1. 採者循跡而尋得善資源時：
   - 強化跡信號（增強）
   - 強化之信號引更多採者 → 更多強化 → 用
2. 採者循跡而無所得時：
   - 勿強化（令跡自然衰）
   - 弱化之信號引少採者 → 跡衰 → 探續
3. 設強化參：
   - **存量**：與所尋資源質成比
   - **衰率**：跡每時單位失 X% 強
   - **飽頂**：最大跡強（防單路之狂用）

```
Trail Reinforcement Dynamics:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Strong trail ──→ More foragers ──→ If good: reinforce ──→ EXPLOIT │
│       ↑                                                      │      │
│       │                              If bad: no reinforce    │      │
│       │                                     │                │      │
│       │                                     ↓                │      │
│  Decay ←── Weak trail ←── Fewer foragers ←── Trail fades    │      │
│       │                                                      │      │
│       ↓                                                      │      │
│  No trail ──→ Scouts explore ──→ New discovery ──→ New trail ↗      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**預期：** 善資源引漸增之注意而劣資源自然棄之自調反饋環。系統僅藉跡動力衡用與探。

**失敗時：** 若所有採者收於單跡（過早收斂），衰率過慢或飽頂過高。增衰、降頂或入隨機探令（如 10% 採者恒忽跡）。若跡衰過速而無用，減衰率。

### 步驟四：偵減益

監資源產以知何時自用轉回探。

1. 追每活採覓位每單位力之產：
   - 產增 → 健康之用，續
   - 產平 → 近飽，始探替代
   - 產降 → 減益，減採者、增 scout
2. 施邊際值定理：
   - 比當前位之產率與所有已知位之平均產率
   - 當前位降於平均時，即離之時
   - 計旅代價（切至新位之代價）
3. 觸發探波於：
   - 所有位之整體產降於閾
   - 最佳位已用過其預期生命
   - 偵環境變（自未探區之 scout 新信號）

**預期：** 採覓群自然於用相（集中於已知善位）與探相（scout 分散）間切，由產監驅動而非任意程序。

**失敗時：** 若群於耗盡位留過久，邊際值閾設過低或旅代價估過高。以實產率比重校。若群過早棄善位，閾過敏——於產量加平滑窗。

### 步驟五：依條件調採覓策

依環境反饋擇並切採覓策。

1. 配策於景：
   - **富聚**：重投於已發現之片（高用）
   - **稀散**：保高 scout 比（高探）
   - **變動**：短跡衰、頻探波（適應）
   - **競爭**：速強化、先標跡（領地）
2. 監策-環境不配：
   - 高力、低產 → 策於景過用
   - 高發現率、低跟進 → 策過探
   - 振盪產 → 策切過激
3. 施適應切：
   - 追探-用比之滾動平均
   - 若比漂離最優（由景類定）過遠，推之回
   - 容漸過渡——突切致協調亂

**預期：** 採覓系統調其探-用平衡於當前環境，隨條件變保效。

**失敗時：** 若策適應本身不穩（於探與用間振盪），加阻尼：需不配信號持 N 時單位方觸策切。若無策似可行，重評步驟一之景刻劃——資源分布或較初假為更複。

## 驗證

- [ ] 採覓景已刻（分布類、信息可得、代價結構）
- [ ] Scout 百分比與搜模式已定並部
- [ ] 跡強化環可行，帶存、衰、飽參
- [ ] 減益偵觸自用至探之再衡
- [ ] 策-環境配已監，適應切已配
- [ ] 系統自景變（新資源、耗盡資源）恢復

## 常見陷阱

- **過早收斂**：所有採者堆於首尋之善，忽可能更佳之選。解：必要探百分、跡飽頂、衰
- **永恆探**：scout 恒尋新選而群永不承諾。解：降質閾以強跡、減 scout 百分比
- **忽旅代價**：切位有代價。於相似質位間恒跳之採者於旅所耗較於尋所得為多。計旅代價於邊際值算
- **變動景中之靜策**：優於昨日條件之策於明日敗。建適應於採覓環中，非為事後
- **混 scout 質與採者質**：善 scout（廣、速評）與善採者（深、周用）需異技。勿強所有代理入二角

## 相關技能

- `coordinate-swarm` — 支採覓信號設計之基礎協調模式
- `build-consensus` — 群須共議何資源片優先時所用
- `scale-colony` — 資源景或群規模增時之採覓操作規模化
- `assess-form` — morphic 評當前系統態之技，輔景評
- `configure-alerting-rules` — 適於減益偵之告警模式
- `plan-capacity` — 容量規劃與採覓論共探-用之框
- `forage-solutions` — AI 自應用變體；映蟻群採覓至單代理解探，帶 scout 假設與跡強化
