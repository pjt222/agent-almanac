---
name: transmute
locale: wenyan
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

# 蛻變

變一具碼或資自一形於他——語譯、範轉、格變、API 遷——而存其要行與義。

## 用時

- 自一語譯函於他語（Python 至 R、JavaScript 至 TypeScript）乃用
- 模自一範遷（類本至函、回調至 async/await）乃用
- API 之用者自一外服 v1 遷於 v2 乃用
- 資自格變（CSV 至 Parquet、REST 至 GraphQL 模）乃用
- 替依以等（moment.js 至 date-fns、jQuery 至純 JS）乃用
- 變範為單函、類、模（非全系）乃用

## 入

- **必要**：源（文路、函名、資樣）
- **必要**：目形（語、範、格、API 版）
- **可選**：行之約（試、型簽、期 I/O 對）
- **可選**：限（須維反向兼、性能預）

## 法

### 第一步：析源

試變前，知源實何為。

1. 全讀源——諸枝、邊例、誤路
2. 識**行之約**：
   - 受何入？（型、域、邊例）
   - 出何？（返值、副作、誤信）
   - 守何不變？（序、唯、引全）
3. 列依：源引、呼、賴於何？
4. 若試存，讀以解期之行
5. 若無試，蛻前撰行特試

**得：** 源實為何之全解（非如何為）。行之約明而可試。

**敗則：** 若源太繁不為單蛻，分小或升至全 `athanor` 之程。若行歧，求清，勿猜。

### 第二步：圖源至目

設變之圖。

1. 源各元，識目之等：
   - 語構：循環 → map/filter、類 → 閉包等
   - API 呼：舊端 → 新端，請／應之形變
   - 資型：資框列 → 模域，嵌 JSON → 平表
2. 識**無直等**之元：
   - 源有而目缺（如無模匹之語中之模匹）
   - 目有而源無（如 R 之向量化 vs Python 循環）
3. 各缺，擇適之策：
   - 仿：以目本之構復其行
   - 簡：若源構為變通，用目之本解
   - 書：若行微變，明注其異
4. 撰**變圖**：源元 → 目元，諸皆然

**得：** 全圖，源各元有目之歸。缺已識而適策已擇。

**敗則：** 若太多元無直等，變或不宜（如蛻高度物之設於無類之語）。再考目形或升至 `athanor`。

### 第三步：行變

依圖書目形。

1. 立目文與宜構與骨
2. 依第二步之圖蛻各元：
   - 存行之約——同入生同出
   - 用目本之語，非字面譯
   - 維或改誤治
3. 治依：
   - 替源依以目之等
   - 若依無等，實小適配
4. 加行內注唯於變不顯處

**得：** 完目實依變圖。碼讀如於目本撰，非機譯。

**敗則：** 若某元抗變，孤之。先變他者，後以焦注治抗者。若實不可蛻，書其因而獻變通。

### 第四步：驗行之等

確蛻形存原之行。

1. 行行之約試於目實
2. 各試例驗：
   - 同入 → 同出（數值轉之內可受容差）
   - 同誤條 → 等之誤信
   - 副作（若有）存或書為已變
3. 明察邊例：
   - Null/NA/undefined 之治
   - 空集
   - 邊值（最大整、空串、零長陣）
4. 若目形加能（如型安），亦驗

**得：** 諸行之約試皆過。邊例等治。諸行差皆書而意。

**敗則：** 若試敗，diff 源與目之行以尋分歧。修目以合源約。若分歧為意（如修原之 bug），明書之。

## 驗

- [ ] 源已全析，行之約明
- [ ] 變圖覆源各元
- [ ] 缺已識，適策已書
- [ ] 目實用本之語（非字面譯）
- [ ] 諸行之約試過於目
- [ ] 邊例已驗（null、空、邊值）
- [ ] 依以目之等解
- [ ] 諸行差已書而意

## 陷

- **字面譯**：書 R 中之 Python 或 JavaScript 中之 Java，而非用目之語。果當似本。
- **略行試**：無試而蛻則不能驗等。先撰行特試。
- **忽邊例**：樂路易蛻；邊例為 bug 藏處。
- **過工適配**：若依須二百行之適配，蛻範太大。
- **逐字譯注**：注當釋目碼，非回響源。重撰之。

## 參

- `athanor` — 全四階變為太大不能單蛻之系
- `chrysopoeia` — 蛻碼之優化以最大值之提
- `review-software-architecture` — 大變後之構審
- `serialize-data-formats` — 專之資格變程
