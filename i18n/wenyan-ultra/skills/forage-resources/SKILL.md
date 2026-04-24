---
name: forage-resources
locale: wenyan-ultra
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

# 採資

施蟻群優化與採食論於資尋、探用衡、散發現——衡探未知與用已知之益。

## 用

- 尋大解空而窮舉不實
- 衡投於探新與深已知
- 優不確機間之資配
- 設散隊或自動 agent 之尋策
- 察早收（困局最優）或永遊（不委）
- 補 `coordinate-swarm` 以特資發模

## 入

- **必**：所求資述（信、算、才、解、機）
- **必**：尋空述（大、構、已知徵）
- **可**：現尋策與其敗模
- **可**：可用偵/尋者數
- **可**：探費對用敗費
- **可**：時域（短期用對長期探）

## 行

### 一：映採境

表資環以擇適採策。

1. 識資類與其分：
   - **聚**：資聚於富斑（如特社群之才）
   - **散**：資均散（如碼中之蟲）
   - **短**：資現而逝（如市機）
   - **嵌**：富斑含異尺之子斑
2. 估信境：
   - 採前知資位幾？
   - 偵可與採者共信否？（信設見 `coordinate-swarm`）
   - 採時境靜或變？
3. 定費構：
   - 每偵布費（時、算、金）
   - 用低質資費（機費）
   - 漏高質資費（悔）

得：已表採境含資分類、信可用、費構。此定施何採模。

敗：境全不知→自全探始（諸偵，無用），限時預以建初圖。境性明則換適模。

### 二：布偵並標跡

遣探 agent 入尋空並令其標所得。

1. 配偵比（始以可 agent 之 20-30% 為偵）
2. 定偵行：
   - 以隨或系模於尋空動
   - 各位速估（非深析）
   - 以信強與質比標所得：
     - 高質→強跡
     - 中→中
     - 低→弱或無
   - 返信於集體（信存、報、廣播）
3. 設偵模：
   - **Random walk**：未知均境宜
   - **Levy flight**：長跳偶局聚——斑資宜
   - **Systematic sweep**：網或螺——界明空宜
   - **Biased random**：近前得域——聚資宜

得：偵已布於尋空並依資質存跡信。自偵報現境初圖。

敗：偵於初掃無所得→偵比過低（增至 50%）、尋模誤（自 random walk 換 Levy flight 以斑資）、或質估誤校（降察門）。

### 三：立跡強

造正饋環放大功途並令不功者衰。

1. 採者循跡得良資：
   - 強跡信（增力）
   - 強信招更多採→更強→用
2. 採者循跡無所得：
   - 勿強（任其自衰）
   - 弱信招少→跡衰→探復
3. 設強參：
   - **存量**：比所得資質
   - **衰率**：跡每時單失 X% 力
   - **飽頂**：跡最力（避單途失控用）

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

得：自調之正饋環，良資招增注而劣者自棄。系僅以跡動衡用探。

敗：諸採聚於單跡（早收）→衰率過慢或飽頂過高。增衰、降頂、或入隨探令（如 10% 採者恒忽跡）。跡衰過速而無用→減衰率。

### 四：察遞減益

監資產以知何時自用返探。

1. 各活採地追每力之產：
   - 產增→健用，續
   - 產平→近飽，始偵替
   - 產減→遞減益，減採、增偵
2. 施邊際值論：
   - 較現地產率於諸知地平產率
   - 現地降於平→離時至
   - 計遷費（切新地之費）
3. 觸偵波於：
   - 諸地總產降於門
   - 最佳地用逾其期壽
   - 察環變（自未探域偵之新信）

得：採群自用階（聚於已知良地）與探階（偵散）間移，以產監驅非任意表。

敗：群於竭地留過久→邊際值門設過低或遷費估過高。以實產率較重校。群過早棄良地→門過敏——加產量之滑窗。

### 五：依境適採策

依境反饋擇並換採策。

1. 匹策於境：
   - **富、聚**：重投已發斑（高用）
   - **稀、散**：守高偵比（高探）
   - **變、動**：短跡衰、頻偵波（適）
   - **競**：速強、先標跡（領）
2. 監策-境錯：
   - 高力低產→策對境過用
   - 高發率低跟→策過探
   - 產震→策換過激
3. 施適切：
   - 追探-用比之滾均
   - 比離佳（依境類定）過遠→推回
   - 漸轉——急切致協亂

得：採系適現境之探-用衡，境變而守效。

敗：策適本身不穩（震於探用間）→加阻尼：錯信須持 N 時單始觸切。無策合→重估一步境類——資分或較初設更繁。

## 驗

- [ ] 採境已表（分類、信可用、費構）
- [ ] 偵比與尋模已定並布
- [ ] 跡強環運含存、衰、飽參
- [ ] 遞減益察觸自用至探之再衡
- [ ] 策-境匹監並適切設
- [ ] 系於境變（新資、竭資）復

## 忌

- **早收**：諸採堆於首得，忽或佳選。治：必探比、跡飽頂、衰
- **永探**：偵續得新選而群不委。治：降跡強之質門、減偵比
- **忽遷費**：切地有費。恒跳似質地之採於遷上失多於得。入邊際值算
- **動境靜策**：為昨境優之策於明敗。建適於採環，非後思
- **混偵於採質**：良偵（廣速估）與良採（深全用）求異技。勿強諸 agent 為兩角

## 參

- `coordinate-swarm` — 撐採信設之基協模
- `build-consensus` — 群須共議何斑先用時
- `scale-colony` — 資境或群大長時採運擴
- `assess-form` — 估系現態之 morphic 技，與境估互補
- `configure-alerting-rules` — 適遞減益察之警模
- `plan-capacity` — 容謀共採之探-用框
- `forage-solutions` — AI 自用變；映蟻採於單 agent 解探含偵假與跡強
