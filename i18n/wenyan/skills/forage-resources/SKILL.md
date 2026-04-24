---
name: forage-resources
locale: wenyan
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

施採食論與蟻群最佳於資搜、探利權衡、分發見。

## 用時

- 搜大解域而暴力窮舉不切
- 於探新法與深化既善間衡投
- 於多不定機間優資分
- 為分隊或自員設搜策
- 診先收斂（困局部）或永遊（永不委）
- 補 `coordinate-swarm` 以特發資之模

## 入

- **必要**：所求資之述（信、算、才、解、機）
- **必要**：搜域之述（大、構、知特）
- **可選**：當搜策及其敗模
- **可選**：可用偵探/搜者數
- **可選**：探費對利敗之費
- **可選**：時程（短利對長探）

## 法

### 第一步：映採景

特資境以擇宜採策。

1. 識資類與其分：
   - **聚**：資聚於富斑（如某社群之才）
   - **散**：資均布（如碼庫之缺）
   - **朝**：資現即散（如市機）
   - **套**：富斑含異尺子斑
2. 評信景：
   - 採前資位知幾何？
   - 偵可與採者共信乎？（信設見 `coordinate-swarm`）
   - 景採時靜或動？
3. 定費構：
   - 每偵之費（時、算、錢）
   - 利差資之費（機費）
   - 失佳資之費（悔）

**得：** 特之採景附資分類、信可得、費構。此定宜用何採模。

**敗則：** 若景全未知，以定時預始最大探（全偵無利）以建初圖。景特明後易至宜模。

### 第二步：遣偵附痕標

遣探員入搜域並令標所見。

1. 配偵百分（自 20-30% 可員始）
2. 定偵行：
   - 於搜域隨機或系序動
   - 評各位（速評，非深析）
   - 以強比質之信標發：
     - 高質 → 強痕信
     - 中質 → 中信
     - 低質 → 弱信或無信
   - 返信於集（信遺、報、廣）
3. 設偵模：
   - **隨機行**：宜未知均景
   - **Levy 飛**：偶遠跳與局聚——宜斑資
   - **系掃**：格或螺——宜界定域
   - **偏隨機**：向似前得之域——宜聚資

**得：** 偵遣於搜域，遺信比資質。景初圖自偵報現。

**敗則：** 若初掃偵無所得，或偵百分過低（升 50%）、搜模誤（隨機行易為 Levy 飛以斑資）、或質評誤校（降察閾）。

### 第三步：立痕強

造正反饋循，放成徑而令敗徑衰。

1. 採者循痕得善資時：
   - 強痕信（增強）
   - 強信引更多採者 → 更強 → 利
2. 採者循痕得無時：
   - 不強（令痕自衰）
   - 弱信引少採者 → 痕衰 → 探復
3. 設強參：
   - **遺量**：比所得資質
   - **衰率**：每時單位痕失 X% 強
   - **飽頂**：最大痕強（防單徑失控利）

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

**得：** 自調反饋循，善資引漸增注而劣資自棄。系以痕動衡利與探。

**敗則：** 若諸採者聚單痕（先收斂），衰率過慢或飽頂過高。增衰、降頂、或引隨機探令（如 10% 採者恆略痕）。若痕衰過速無所利，減衰率。

### 第四步：察漸返

監資產以知何時自利返探。

1. 於各活採位追單位產：
   - 產增 → 健利續
   - 產平 → 近飽，始偵替
   - 產減 → 漸返，減採增偵
2. 施邊際值定理：
   - 較當位產率於諸知位平均率
   - 當位落於平均下時，宜離
   - 計行費（易位之費）
3. 觸偵波於：
   - 諸位總產落於閾下
   - 首位已利過預期壽
   - 境易察（未探域偵之新信）

**得：** 採群自然於利期（聚知善位）與探期（偵散）間易，由產監導，非任程。

**敗則：** 若群於竭位留過久，邊際值閾過低或行費估過高。以實產率重校。若群過早棄善位，閾過敏——加產量平滑窗。

### 第五步：按況適採策

按境回擇並易諸採策。

1. 配策於景：
   - **富聚**：於知斑重委（高利）
   - **稀散**：保高偵比（高探）
   - **易變**：短痕衰、常偵波（適）
   - **競**：速強、先標（領）
2. 監策—境失配：
   - 高工低產 → 策於景過利
   - 高見率低續 → 策過探
   - 產振 → 策換過急
3. 施適換：
   - 追探利比之滾平均
   - 若比偏最佳（依景類定），推返
   - 允漸易——急易致協亂

**得：** 採系適當境衡探利，境易時保效。

**敗則：** 若策適本身不穩（振於探利），加阻：失配信須持 N 時單位方觸策易。若無策似行，復察一步景特——資分或較初設更繁。

## 驗

- [ ] 採景已特（分類、信可得、費構）
- [ ] 偵百分與搜模已定並遣
- [ ] 痕強循有效，附遺、衰、飽參
- [ ] 漸返察觸自利回探之再衡
- [ ] 策—境配監並配適換
- [ ] 系於景易（新資、竭資）中復

## 陷

- **先收斂**：諸採者聚首得善，略他或更佳者。治：強制探百分、痕飽頂、衰
- **永探**：偵屢得新而群不委。治：降痕強質閾、減偵百分
- **略行費**：易位有費。於似質位間常跳之採者於行耗多於所得。計行費於邊際值
- **動景中靜策**：優昨策明日敗。建適於採循，非後加
- **混偵質於採質**：善偵（廣、速評）與善採（深、徹利）需異技。勿強諸員任二職

## 參

- `coordinate-swarm` — 基協模下採信之設
- `build-consensus` — 群須合決何斑優先時用
- `scale-colony` — 資景或群大增時之採擴
- `assess-form` — 評系當態之 morphic 技，補景評
- `configure-alerting-rules` — 警模適於漸返察
- `plan-capacity` — 容謀與採論共探利之架
- `forage-solutions` — AI 自應用變體；映蟻採於單員解探附偵假與痕強
