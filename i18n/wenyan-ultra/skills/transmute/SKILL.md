---
name: transmute
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Transform a single function, module, or data structure from one form to
  another while preserving its essential behavior. Lighter-weight than the full
  athanor cycle, suitable for targeted conversions where the input and output
  forms are well-understood. Use when converting a function between languages,
  shifting a module between paradigms, migrating an API consumer to a new
  version, converting data formats, or replacing a dependency — when the
  transformation scope is a single function, class, or module rather than a
  full system.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, transmutation, conversion, refactoring, transformation, targeted
---

# 化變

化具碼或資自一形至他——語譯、範轉、式換、API 遷——保要為與義。

## 用

- 譯函於異語（Python 至 R、JavaScript 至 TypeScript）→用
- 模自一範轉（類至函、回呼至 async/await）→用
- API 客自外服 v1 遷 v2→用
- 資式換（CSV 至 Parquet、REST 至 GraphQL 模）→用
- 換依為等（moment.js 至 date-fns、jQuery 至原 JS）→用
- 變範為單函、類、模（非全系）→用

## 入

- **必**：源材（檔路、函名、資樣）
- **必**：目形（語、範、式、API 版）
- **可**：為約（測、類簽、期入出對）
- **可**：限（必持後容、效預）

## 行

### 一：析源材

化前確解源所為。

1. 全讀源——諸枝、邊例、誤路
2. 識**為約**：
   - 受何入？（類、範、邊例）
   - 生何出？（返、副、誤訊）
   - 持何不變？（序、獨、參完）
3. 籍依：源所引、呼、賴何？
4. 測在→讀以解期為
5. 無測→化前書為刻測

得：源所為（非何如）之全解。為約明而可測。

敗：源過繁不能單化→分為小或升至全 `athanor` 程。為歧→詢非猜。

### 二：圖源至目形

設化圖。

1. 各源元識目等：
   - 語構：環 → map/filter、類 → 閉、等
   - API 呼：舊端 → 新端、請/應形變
   - 資類：資框列 → 模域、嵌 JSON → 平表
2. 識**無直等**之元：
   - 目缺之源功（如無模配於某語）
   - 源無之目慣（如 R 向量化於 Python 環）
3. 各缺擇適策：
   - 擬：以目原構生為
   - 簡：源構為迂迴→用目原解
   - 文：為微變→明記差
4. 書**化圖**：源元 → 目元、各片

得：諸源元有目去之全圖。缺識而適策擇。

敗：諸元缺直等過多→變或不宜（如化高物導設於無類之語）。重慮目形或升至 `athanor`。

### 三：行變

依圖書目形。

1. 建目檔含宜構與板
2. 依步二圖各元化：
   - 留為約——同入生同出
   - 用目原慣勿字譯
   - 持或增誤理
3. 理依：
   - 換源依為目等
   - 依無等→行最小適配
4. 唯化非顯處加內注

得：依化圖之全目行。碼讀如目原書、非機譯。

敗：某元拒化→離之。先化餘、後注力於拒元。實不能化→文何故而予迂法。

### 四：驗為等

確化形留原為。

1. 行為約測於目行
2. 各測例驗：
   - 同入 → 同出（數換內可容差）
   - 同誤況 → 等誤訊
   - 副效（若有）留或文為變
3. 明察邊例：
   - Null/NA/undefined 理
   - 空集
   - 邊值（max int、空串、零長陣）
4. 目形加能（如類安）→亦驗

得：諸為約測過。邊例等理。為差皆文意。

敗：測敗→差源目為以覓岔。修目配源約。岔意（如修原誤）→明文。

## 驗清

- [ ] 源材全析含明為約
- [ ] 化圖覆諸源元
- [ ] 缺識含適策文
- [ ] 目行用原慣（非字譯）
- [ ] 諸為約測於目過
- [ ] 邊例驗（null、空、邊值）
- [ ] 依以目等解
- [ ] 諸為差文而意

## 忌

- **字譯**：書 Python-於-R 或 Java-於-JS 而非用目慣。果當似原
- **略為測**：化無測→不能驗等。先書刻測
- **忽邊例**：順路易化；邊例為蟲匿處
- **過工適**：依需 200 行適→化範過大
- **化注原樣**：注當釋目碼、勿復源。重書

## 參

- `athanor` — 全四階變、為過大不能單化之系
- `chrysopoeia` — 化碼之最值取
- `review-software-architecture` — 大化後構覆
- `serialize-data-formats` — 專資式換程
