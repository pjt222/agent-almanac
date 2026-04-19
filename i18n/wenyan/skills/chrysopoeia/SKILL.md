---
name: chrysopoeia
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Extract maximum value from existing code — performance optimization, API
  surface refinement, and dead weight elimination. The art of turning base code
  into gold through systematic identification and amplification of value-bearing
  patterns. Use when optimizing a working but sluggish codebase, refining an
  API surface that has accumulated cruft, reducing bundle size or memory
  footprint, or preparing code for open-source release — when code works
  correctly but doesn't shine and needs polish rather than a full rewrite.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
---

# 點金術

自現存之碼中取至大之值——識何為金（值高、設善），何為鉛（耗重、拙劣），何為渣（死重）。後揚金、化鉛、除渣。

## 用時

- 優行運之遲碼為速
- 磨 API 之面已積冗者
- 減包量、記憶、啟時
- 備碼為開源（取其值核）
- 碼行而不輝——宜磨，非重書

## 入

- **必**：待優之庫或模（路徑）
- **必**：值量之度（性能、API 清晰、包量、可讀）
- **可選**：剖析之資料或基準示當前之能
- **可選**：目標（如「減包四成」、「百毫秒內應」）
- **可選**：制（不可變公 API、須容舊）

## 法

### 第一步：驗——分其材

逐元分其值之獻。

1. 定量度於入（性能、清、量等）
2. 點碼庫諸元（函、模、出、依）
3. 分每元：

```
值之分類：
+--------+---------------------------------------------------------+
| 金     | 值高設善。揚而護之。                                    |
| 銀     | 值善微瑕。磨之。                                        |
| 鉛     | 可行而重——能拙、API 雜。化之為輕。                      |
| 渣     | 死碼、未用之出、殘餘之功。盡除之。                      |
+--------+---------------------------------------------------------+
```

4. 性能之優，先剖：
   - 識熱徑（時所耗處）
   - 識冷徑（罕行之碼或為渣）
   - 量記憶分配之式
5. 生**驗冊**：元元分類附證

**得：** 諸顯元皆分附證。金元已識以護於優時。鉛元依影響列。

**敗則：** 若剖具不可得，以靜析：函複度（環路）、依量、碼量為代。若庫過大，先專危徑。

### 第二步：煉——揚其金

護且增至值之元。

1. 每金元：
   - 確其有全測（此汝至貴之產）
   - 若未然則明書其界面
   - 慎思可否抽為可再用之模
2. 每銀元：
   - 施針對之改（善名、清型、微優）
   - 增測覆至金級
   - 解微碼臭而不重構
3. 勿改金銀之行——只增其磨與護

**得：** 金銀已善測、善書、善護。無行之變，只質之增。

**敗則：** 若「金」元於近察露隱患，重分之。誠於值勝於護瑕。

### 第三步：化——鉛成金

化重拙之元為優等。

1. 鉛元依影響列（耗資最多者先）
2. 每鉛元擇化之策：
   - **算法之優**：以 O(n log n) 代 O(n^2)，除冗算
   - **緩存/記憶**：存屢求之貴果
   - **惰算**：延算至果確需
   - **批處**：合多小作為少大作
   - **結構之簡**：減環路之複，平深嵌
3. 施策而量其改：
   - 前後之基準於性能
   - 前後之行數於複度
   - 前後之依數於耦合
4. 化畢驗其行之等

**得：** 於目量有可量之改。每化元勝於鉛前而行等。

**敗則：** 若鉛元拒優於其當前界面，察界面本為患。或化需變呼之法，非只變實之法。

### 第四步：去——除其渣

系除死重。

1. 每渣元驗其確未用：
   - 搜所有引（grep、IDE 用處查）
   - 察動引（以字分派、反射）
   - 察外用（若碼為庫）
2. 除已證之渣：
   - 刪死碼、未用之出、殘餘之功
   - 自包單中除未用之依
   - 清已除功之設
3. 每除驗無破（行測）
4. 書所除者及其由（於提交之訊，非於碼）

**得：** 庫更輕。包量、依數、碼量可量之減。諸測仍通。

**敗則：** 若除元而破某物，非渣也——重分之。若動引礙驗用，除前加暫誌以確無行時之訪。

### 第五步：驗——稱其金

量總之改。

1. 行第一步之基準
2. 比前後於目量
3. 書點金之果：
   - 已煉之元（金銀之改）
   - 已化之元（鉛→金附量）
   - 已除之元（渣附量/數之影）
   - 總量之改（如「快四成七」、「包減三成二」）

**得：** 於目量有可量、有書之改。庫可證更值於前。

**敗則：** 若總改微，原碼或勝於所料。書所學——知碼已近優本身即值。

## 驗

- [ ] 驗冊分諸顯元附證
- [ ] 金元有全測與書
- [ ] 鉛化示可量之前後改
- [ ] 渣除驗引而後刪
- [ ] 每階諸測皆通
- [ ] 總改已量且書
- [ ] 無行之退引入
- [ ] 入之制皆滿

## 陷

- **早優**：無剖而優。先量，優熱徑
- **磨渣**：費力改當刪之碼。先分後煉
- **破金**：優而損至佳之碼。金只可增，不可減
- **無量之言**：「似速」非點金。每改必量
- **優冷徑**：費力於啟時一行之碼而瓶頸在請求環

## 參

- `athanor` — 全四階之化，於點金露碼需重構非只優
- `transmute` — 針對之化於鉛元需範式之遷
- `review-software-architecture` — 架構級之察補碼級點金
- `review-data-analysis` — 資料管道之優類碼之優
