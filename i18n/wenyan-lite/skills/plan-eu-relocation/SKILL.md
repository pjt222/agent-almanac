---
name: plan-eu-relocation
locale: wenyan-lite
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

# 規劃歐盟搬遷

為遷入或遷往歐盟／DACH 區域之搬遷，建立有結構、含相依關係之計畫，涵蓋官僚步驟、期限與各國特有要求。

## 適用時機

- 規劃自一歐盟／DACH 國遷往另一歐盟／DACH 國
- 自非歐盟國家遷往歐盟／DACH 目的地
- 需在動工前釐清各官僚步驟之相依關係
- 與雇主人資協調基於僱用之搬遷
- 需在緊迫期限下處理搬遷（到職日、租約起日、入學日）
- 需單一文件貫串全部搬遷流程之始末

## 輸入

### 必要

- **原居國**：當前居住國
- **目的地國**：目標國（主要為德國、奧地利、瑞士；其他歐盟國亦支援）
- **國籍**：所持公民身分，含歐盟／非歐盟之區分
- **僱用類型**：受僱（當地合約）、外派員工、自營、自由業、無業、學生或退休
- **目標搬遷日**：實體遷移之概略日期
- **家戶組成**：單身、伴侶、有子女之家庭（年齡）、寵物

### 選擇性

- **到職日**：在目的地國首日工作日
- **住房狀態**：已取得、搜尋中、雇主提供
- **現有保險**：健保、責任險、家庭險
- **語言能力**：目的地國語言程度（A1-C2 或無）
- **特殊狀況**：身心障礙、懷孕、兵役義務、進行中之法律事件、監護安排
- **過往歐盟登記**：先前於其他歐盟國之 Anmeldung 或同等登記

## 步驟

### 步驟一：評估狀況

蒐集所有相關之個人、職業與法律背景，俾判定適用之官僚軌道。

1. 確認家戶全員之歐盟對非歐盟國籍狀態
2. 判定是否需簽證或居留許可（非歐盟國民、非 EEA 之家屬）
3. 分類僱用類型，並檢視工作許可是否須與居留許可分開申請
4. 記錄原居國與目的地國間之雙邊協定（社會保險、稅務協議、學歷認可）
5. 辨明此遷移為永久、暫時（少於或多於 183 天）或跨境通勤
6. 記錄所有固定日期：到職日、租約起日、學年起日、現居處之退租通知期

**預期：** 一份結構化之概況文件，含國籍狀態、僱用分類、遷移類型與所有固定日期。

**失敗時：** 若國籍或僱用狀態存疑（如雙重國籍其一為非歐盟、或承包人對受僱人之區分不明），於進行前轉介至法律顧問或目的地國駐外館。切勿臆測簽證要求。

### 步驟二：繪製相依鏈

辨識所有官僚步驟及其前置條件，以確立正確之執行順序。

1. 列出目的地國所需之全部登記：
   - 居住登記（Anmeldung / Meldezettel / Anmeldung bei der Gemeinde）
   - 稅務登記或稅號分配
   - 健保加保
   - 社會保險登記
   - 開立銀行帳戶
   - 車輛重新登記（若適用）
   - 學校／托育登記（若適用）
   - 寵物入境程序（若適用）
2. 列出原居國之全部退記步驟：
   - 居住退記（Abmeldung 或同等程序）
   - 稅捐機關通知
   - 保險解除或轉移
   - 公用事業解除
   - 郵件轉址
3. 將相依繪為有向無環圖（DAG）：
   - 居住登記通常須先有已簽署之租約
   - 稅號取決於居住登記
   - 銀行帳戶可能取決於居住登記與稅號
   - 健保加保可能取決於僱用合約或居住登記
   - 社會保險協調取決於僱用分類
4. 辨識可平行進行之軌道：可同時推進之步驟
5. 標記須親臨預約之步驟，與可線上或郵寄完成者

**預期：** 一張相依圖（文字或視覺），列出所有步驟、前置條件與可平行執行者。

**失敗時：** 若特定國家之相依不明，搜尋官方政府來源（如德國：bmi.bund.de、奧地利：oesterreich.gv.at、瑞士：ch.ch）。勿假設不同國家之相依可互換。

### 步驟三：建立含期限之時程

將相依圖轉換為與目標搬遷日對齊之日曆時程。

1. 自搬遷日與其他固定期限（到職、學年）反推
2. 對每一步驟估計：
   - 前置時間（最早可開始之時點）
   - 處理時間（機關所需之時間）
   - 緩衝時間（建議之延誤裕度）
3. 為每一步驟指派日曆視窗：
   - 行前動作（自原居國可辦）：簽證申請、保險研究、文件備齊
   - 搬遷週動作：Anmeldung、銀行帳戶、SIM 卡
   - 行後動作（於法定期限內）：稅務登記、車輛重新登記、原居國退記
4. 標註附罰則之法定期限：
   - 德國：搬入後 14 日內 Anmeldung
   - 奧地利：3 日內 Meldezettel
   - 瑞士：14 日內 Anmeldung（依州而異）
   - 稅務登記期限各異
5. 加入預約之前置時間（部分 Buergeramt 須提前 2-6 週預約）

**預期：** 自搬遷前 8-12 週至搬遷後 4-8 週之逐週時程，每一官僚步驟皆置於其執行視窗中。

**失敗時：** 若預約名額難測（德國大都市常見），預留 2 週緩衝，並查找替代辦事處或清晨臨櫃方案。

### 步驟四：辨識各國特有程序

依目的地國之具體要求與慣例調整通用計畫。

1. 德國：
   - Buergeramt Anmeldung（須房東出具 Wohnungsgeberbestaetigung）
   - Finanzamt 稅務識別號分配（Steueridentifikationsnummer 於 2-4 週內郵寄送達）
   - Gesetzliche 或 private Krankenversicherung 加保
   - Rentenversicherung 協調
   - Rundfunkbeitrag（GEZ）登記
   - 適用時申請 Elterngeld/Kindergeld
2. 奧地利：
   - 於 Meldeamt 辦 Meldezettel（3 日內）
   - 於 Finanzamt 申請 Steuernummer
   - 健保 e-card（透過雇主或自行向 OeGK 登記）
   - Sozialversicherung 協調
3. 瑞士：
   - Einwohnerkontrolle 登記（14 日內，依州而異）
   - AHV/IV/EO 社會保險登記
   - 強制健保（Grundversicherung）3 個月內加保
   - Quellensteuer 或一般稅，依許可類別
   - 居留許可（B 或 L）經雇主或州政府申請
4. 將每一程序與所需文件交叉比對（見 check-relocation-documents 技能）

**預期：** 一份各國特有程序清單，含確切辦事處名稱、所需表單與一般處理時間。

**失敗時：** 若目的地為較小之自治市，程序可能與全國標準不同。查閱該 Gemeinde/Kommune 網站或直接致電其 Buergerservice。

### 步驟五：標示高風險項目

辨識違誤期限將招致財務處罰、法律後果或連鎖延誤之步驟。

1. 標記所有具法定期限之步驟（Anmeldung、稅務登記、健保加保）
2. 計算各期限違誤之罰則：
   - 德國 Anmeldung 逾期：罰款最高 1,000 EUR
   - 奧地利 Meldezettel 逾期：罰款最高 726 EUR
   - 瑞士健保逾期：追溯保費並加徵
3. 辨識阻擋多項下游動作之瓶頸步驟：
   - 無 Anmeldung = 無稅號 = 薪資無法正確處理 = 部分情況下無法開戶
4. 標示需正本且難以補發之文件（出生證明、結婚證、學歷認證）
5. 留意季節性風險：歲末搬遷與機關休假衝突；九月搬遷與入學潮重疊
6. 辨識原居國亦有期限之步驟（退記、稅務年度協調、保險通知期）

**預期：** 一份風險清冊，每項高風險載明期限、罰則與緩解策略。

**失敗時：** 若罰款金額或期限無法自官方來源確認，標為「未確認」並建議直接洽該主管機關。切勿臆造罰款金額。

### 步驟六：產生搬遷計畫文件

將所有發現整合為單一可執行之搬遷計畫。

1. 依下列章節組織文件：
   - 摘要（遷移類型、關鍵日期、家戶組成）
   - 相依圖（視覺或文字）
   - 時程（逐週查核表）
   - 各國特有程序（目的地）
   - 退記程序（原居國）
   - 風險清冊（高優項目醒目）
   - 文件查核表（與 check-relocation-documents 交叉參照）
   - 聯絡清單（相關辦事處、電話、預約網址）
2. 每項查核表項目皆附：
   - 狀態指示（未開始／進行中／完成／受阻）
   - 期限
   - 相依
   - 備註或要訣
3. 加入「抵達後 48 小時」速查卡，涵蓋抵達後最緊迫之步驟
4. 加入「設想情境」一節，因應常見之意外：租屋告吹、到職日變動、文件郵寄延誤

**預期：** 一份完整、結構化之搬遷計畫文件，可付諸執行；所有項目皆可追溯至相依圖與風險清冊。

**失敗時：** 若計畫過於繁複，無法以單一文件涵蓋（如多國搬遷且有家屬須各別簽證），拆為主時程與各人分計畫。

## 驗證

- 相依圖中之每一官僚步驟皆至少附一來源（官方政府網站、駐外館或法源）
- 所有法定期限皆載明法源
- 時程已考量週末、公眾假日與機關休假
- 時程中無步驟先於其相依出現
- 風險清冊至少涵蓋：Anmeldung、稅務登記、健保與社會保險
- 文件查核表已交叉參照 check-relocation-documents 技能之輸出
- 固定日期（到職、租約起日）已反映於時程，無衝突

## 常見陷阱

- **以為各歐盟國程序相同**：登記期限、所需文件與機關架構即便於 DACH 內亦顯著不同
- **低估預約前置時間**：柏林、漢堡、慕尼黑之 Buergeramt 預約常需排 4-6 週；及早規劃或運用臨櫃名額
- **遺忘原居國**：原居國之退記、稅務通知與保險解除期同等重要
- **忽略 183 天稅務規則**：一年內於某國停留逾 183 天通常觸發完整稅務居留；謹慎協調搬遷日
- **未攜正本**：多數 DACH 機關要求正本（非影本），部分尚需公證翻譯；數位影本常不被接受
- **以歐盟之姿待瑞士**：瑞士不屬歐盟；居留許可、健保與社會保險規則皆異，即便對歐盟國民亦然
- **健保空窗**：自原居國退保至目的地國加保之間恐有空窗；安排旅遊險或國際健保以接續
- **疏忽寵物規定**：寵物護照、狂犬病抗體效價、特定犬種輸入規則可能延長時程數週

## 相關技能

- [check-relocation-documents](../check-relocation-documents/SKILL.md) —— 為各官僚步驟核驗文件齊全度
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) —— DACH 各特定政府程序之詳細指引
