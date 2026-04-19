---
name: check-relocation-documents
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Verify document completeness for each bureaucratic step of an EU/DACH
  relocation, flagging missing items and translation requirements. Use after
  creating a relocation plan and before beginning bureaucratic procedures, when
  preparing for a specific appointment (Buergeramt, Finanzamt), when unsure
  which documents need certified translation or apostille, after receiving a
  rejection or request for additional documents, or as a periodic check during
  the relocation process to ensure nothing has been overlooked.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: intermediate
  language: natural
  tags: relocation, documents, checklist, verification, translation
---

# 查遷文

核遷策所需文牒，揭缺失與譯之需。

## 用

- 策定→官程未啟→用
- 赴署前（Buergeramt, Finanzamt）→用
- 譯否、認證否存疑→用
- 受拒→用
- 家人異籍→用
- 遷程中定期察→用

## 入

### 必

- **遷策**：plan-eu-relocation 之出
- **目國**：德奧瑞或他 EU
- **籍**：家之諸員
- **現存文牒**

### 可

- **原籍國**：定認證之需
- **僱約**：定僱方所供
- **文之語**：定譯之需
- **往遷經歷**
- **特況**：難民、藍卡、派遣工

## 行

### 一：列官程

析策、列所有官程。

1. 析策取需交文之事
2. 按署分類：
   - 市署（Buergeramt, Meldeamt, Einwohnerkontrolle）
   - 稅署（Finanzamt）
   - 醫保（Krankenkasse, OeGK, Swiss insurer）
   - 社保（Rentenversicherung, Sozialversicherung, AHV）
   - 外署（Auslaenderbehorde）若須
   - 銀行
   - 學校、托兒
   - 車署（Kfz-Zulassungsstelle）
   - 他（寵物入境、職照認可）
3. 依策之序排
4. 注共用文者

得：分類有序之事列。

敗：策闕→依目國官單建之（makeitingermany.de, migration.gv.at, ch.ch）。

### 二：映文於程

每程→所需文。

1. **市登**（Anmeldung）：護照或身份證、住所證（Wohnungsgeberbestaetigung）、婚書、出生證、舊登記
2. **稅登**：市登證、僱約、原籍稅號、婚書
3. **醫保**：僱約、舊保證或 EHIC、S1、市登
4. **社保**：A1、E/S 表、僱歷、原籍社號
5. **開戶**：護照、市登、入憑、稅號
6. **居留**（非 EU）：護照 6 月餘效、生物照、僱約、財證、醫保、認可學位、無犯錄
7. **車**：車牒（Fahrzeugbrief）、保險（eVB）、檢照（TUeV/Pickerl/MFK）、市登
8. **學托**：出生證、疫苗冊、舊校報（譯）、市登

得：程↔文之矩陣。原件/副本/認譯分明。

敗：要求不明→問署官網或電。勿依 12 月前之舊指南。

### 三：察現狀

對比已有與所需→揭缺。

1. 每文之狀：
   - **有原**：原件在手
   - **僅副**：無原、須訂
   - **逾**：已過期
   - **缺**：未有
   - **不需**
2. 有原者→察：未毀、名合、用時尚效
3. 逾者→察：更新期、權宜受否、費
4. 缺者→察：發署、期、上游文（遞歸）、費、遠訂否
5. 名異者（婚前後、拼寫）→標

得：每文之狀表：狀/效期/備註。

敗：狀不明→標「未確」、以缺計。

### 四：辨譯認證之需

定何文須認譯、加簽（apostille）。

1. 目國語：
   - 德：德文或認譯
   - 奧：同德；部分受 EU 英文
   - 瑞：依州（德、法、意、羅）
2. 免譯者：EU 多語標表（2016/1191 規）、護照身份證、EHIC
3. 須譯者：
   - 目國認證譯者（非原籍）
   - 3-10 工作日
   - 30-80 歐/頁
4. 認證/合法化：
   - 海牙國→加簽
   - 非海牙→全鏈（公證、外部、使館）
   - EU 內→多免加簽，然須逐文驗
   - 瑞士為海牙非 EU
5. 察電子加簽受否
6. 或加簽+譯俱須

得：每文之譯/加簽/費/期之矩陣。

敗：存疑→直問目署。備多優於備少。

### 五：生事單

匯總發現→限期分級之單。

1. 併所有缺（缺、逾、譯、加簽）為一
2. 每事：文名、事（取/更/譯/加簽/替）、署、期、費、限期、級
3. 級：
   - **急**：阻首程或限期硬
   - **高**：抵後 2 週內
   - **中**：首月內
   - **低**：無即限
4. 序：急（長期先）→高（限期）→中低
5. 算總費
6. 每赴署之「文匣」清單

得：分級限期有費之單+逐赴清單。

敗：期不明→取最壞、及早啟。注加急之選（增費）。

## 驗

- [ ] 每程皆有文映
- [ ] 無「狀不明」之文
- [ ] 譯之需依目國官規
- [ ] 加簽依海牙籍
- [ ] 限期合遷時
- [ ] 級序一貫
- [ ] 總費已計
- [ ] 首三程之赴署清單已生

## 忌

- **EU 無備之誤**：多署仍須譯、部分須加簽
- **名不合**：轉寫、婚前後、中名→最常致拒
- **只副本**：DACH 多須原件驗
- **譯遲訂**：認譯常 1-2 週積（8-9 月尤甚）
- **漏譯上之加簽**：或須原件加簽+認譯
- **未察效期**：護照餘 2 月→常拒（須 6 月）
- **忽 EU 多語標表**：可免譯，然須明求
- **電子文非受**：DACH 多須紙本

## 參

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md)
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md)
