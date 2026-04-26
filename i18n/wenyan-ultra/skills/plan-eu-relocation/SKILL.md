---
name: plan-eu-relocation
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a complete EU/DACH relocation timeline with dependency mapping between
  bureaucratic steps, deadline tracking, and country-specific procedure
  identification. Use when planning a move between EU/DACH countries, relocating
  from a non-EU country to an EU/DACH destination, coordinating employment-based
  relocation with employer HR, managing a relocation with tight deadlines, or
  when needing a single document that maps the entire relocation process end-to-end.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: advanced
  language: natural
  tags: relocation, eu, dach, timeline, dependencies, planning
---

# 計歐遷

立 EU/DACH 區內遷之構、依存知時計，含官步、期、邦特需也。

## 用

- EU/DACH 國間遷→用
- 非 EU 國至 EU/DACH 遷→用
- 須知何官步依何而起→用
- 共僱者人事協→用
- 緊期遷（職始、租始、學入）→用
- 求單文盡映遷程→用

## 入

### 必

- **源邦**：當居國
- **的邦**：標國（主：德、奧、瑞；他 EU 支）
- **籍**：所執籍、含 EU/非 EU 別
- **僱型**：僱（地約）、派工、自業、自由、無業、學、退
- **標遷期**：身遷之約日
- **戶**：單、偶、有兒（齡）、有寵

### 可

- **職始日**：的邦僱首日
- **居態**：已得、覓中、僱供
- **當前保**：醫、責、戶
- **語**：的邦語級（A1-C2 或無）
- **特況**：殘、孕、軍役、訟、監護
- **前 EU 籍**：他 EU 國前 Anmeldung 等

## 行

### 一：察況

集個、業、法之諸境以定何官徑施。

1. 確戶皆 EU/非 EU 籍
2. 定簽證/居證需否（非 EU、非 EEA 親）
3. 別僱型、察工證需否異於居證
4. 記源的間雙邊約（社險、稅約、資格認）
5. 識遷為永、暫（過或不過 183 日）、跨邊通
6. 記諸定期：職始、租始、學年始、當居告別期

得：構檔含籍態、僱別、遷型、諸定期。

敗：籍/僱模糊（如雙籍含一非 EU、約工/僱員不分）→升至律師或的邦使館再行。勿猜簽證需。

### 二：映依鏈

識諸官步與其前提以立行序。

1. 列的邦諸需登：
   - 居登（Anmeldung / Meldezettel / Anmeldung bei der Gemeinde）
   - 稅登或號授
   - 醫險入
   - 社險登
   - 銀戶開
   - 車易登（若用）
   - 校/育入（若用）
   - 寵入程（若用）
2. 列源邦諸退登：
   - 居退登（Abmeldung 等）
   - 稅署告
   - 險退或轉
   - 用務退
   - 郵轉
3. 映依為有向無環圖（DAG）：
   - 居登常依已簽租
   - 稅號依居登
   - 銀戶恐依居登與稅號
   - 醫險入恐依僱約或居登
   - 社險協依僱別
4. 識並徑：可同行之步
5. 標需身赴約者異於可線上或郵者

得：依圖（文或視）示諸步、其前提、何可並行。

敗：邦依不明→搜官源（如：德 bmi.bund.de、奧 oesterreich.gv.at、瑞 ch.ch）。勿假依轉邦。

### 三：立期與限

化依圖為合標遷之曆計。

1. 自遷日與諸定期（職始、學年）逆推
2. 各步估：
   - 前置（最早可起）
   - 處時（官辦時）
   - 緩時（薦延緩）
3. 各步授曆窗：
   - 遷前（自源邦可行）：簽證、險研、文備
   - 遷週：Anmeldung、銀戶、SIM 卡
   - 遷後（法限內）：稅登、車易登、源退登
4. 記法限與罰：
   - 德：Anmeldung 入內 14 日
   - 奧：Meldezettel 內 3 日
   - 瑞：Anmeldung 內 14 日（按州變）
   - 稅登期變
5. 加約預訂前置（某 Buergeramt 需 2-6 週前訂）

得：週週計自遷前 8-12 週至遷後 4-8 週、各官步置於行窗。

敗：約難料（德大城常）→建 2 週緩、識他署或晨入無約缺。

### 四：識邦特程

合泛計於的邦特需與俗。

1. 德：
   - Buergeramt Anmeldung（需房東 Wohnungsgeberbestaetigung）
   - Finanzamt 稅 ID 授（Steueridentifikationsnummer 郵到 2-4 週）
   - Gesetzliche 或 private Krankenversicherung 入
   - Rentenversicherung 協
   - Rundfunkbeitrag (GEZ) 登
   - Elterngeld/Kindergeld 申若用
2. 奧：
   - Meldeamt 之 Meldezettel（內 3 日）
   - Finanzamt 登求 Steuernummer
   - 醫險 e-card（過僱或自登 OeGK）
   - Sozialversicherung 協
3. 瑞：
   - Einwohnerkontrolle 登（內 14 日，按州）
   - AHV/IV/EO 社險登
   - 必醫險（Grundversicherung）內 3 月
   - Quellensteuer 或常稅按證型
   - 居證（B 或 L）申過僱或州
4. 對各程於所需文（見 check-relocation-documents 技）

得：邦特程列含確署名、需表、常處時。

敗：的為小邦、程恐異於國準。察 Gemeinde/Kommune 站或呼其 Buergerservice。

### 五：標高險項

識誤期生財罰、法果或連延之步。

1. 標諸法限步（Anmeldung、稅登、醫險入）
2. 算誤各期之罰：
   - 德 Anmeldung 遲：罰至 1,000 EUR
   - 奧 Meldezettel 遲：罰至 726 EUR
   - 瑞醫險遲：追溯保費加附
3. 識瓶頸步阻多下游：
   - 無 Anmeldung = 無稅 ID = 無正薪 = 無銀戶（某況）
4. 標需原文難補項（生證、婚證、學證）
5. 記季險：年末遷遇署閉；九月遷遇學入緊
6. 識源邦亦有期者（退登、稅年協、險告別期）

得：險表含項、期、罰、緩策。

敗：罰額或期不可確於官源→標「未確」、薦逕詢相關署。勿造罰額。

### 六：生遷計檔

匯諸發為單可行遷計。

1. 檔構含：
   - 主撮（遷型、要日、戶）
   - 依圖（視或文）
   - 計（週週清單）
   - 邦特程（的）
   - 退登程（源）
   - 險表（要項顯）
   - 文清單（對 check-relocation-documents）
   - 連絡單（相關署、電、約 URL）
2. 各清項格：
   - 態（未起/中/畢/阻）
   - 期
   - 依
   - 注或要
3. 含「首 48 時」速查卡為到後最緊步
4. 加「若...則」段為常擾：寓失、職始日變、文遲

得：完構遷計檔備行、諸項可溯依圖與險表。

敗：計過複於單檔（如多邦遷含親需異簽徑）→分主計與各人子計。

## 驗

- 依圖諸官步皆有源（官站、使館或法引）
- 諸法限皆注其法基
- 計納週末、公假、署閉期
- 計中無步先於依
- 險表至少含：Anmeldung、稅登、醫險、社險
- 文清單對 check-relocation-documents 技出
- 定期（職始、租始）映於計而無衝

## 忌

- **假諸 EU 邦同程**：登期、需文、署構即 DACH 內亦大異
- **輕約前置**：柏林、漢堡、慕尼黑 Buergeramt 約可 4-6 週滿；計之或用入缺
- **忘源邦**：源退登、稅告、險退期同重於的登
- **忽 183 日稅則**：年內居過 183 日常觸全稅居；協遷日
- **不攜原**：DACH 多署需原（非影本）某需證譯；數位常不受
- **視瑞為 EU**：瑞非 EU；居證、醫險、社險異則即 EU 籍亦然
- **失醫險空**：源險出與的險入間恐無覆；備行旅或國際險橋
- **忽寵則**：寵照、狂犬抗體、種特入則加週

## 參

- [check-relocation-documents](../check-relocation-documents/SKILL.md) -- 驗各官步文之全
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- DACH 政程詳引
