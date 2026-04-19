---
name: check-relocation-documents
locale: wenyan
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

# 驗遷文書

驗歐/DACH 遷徙諸官步所需文書之全，標所闕者、譯所必需者，生可行之單。

## 用時

- 遷謀已立，官務未始乃用
- 備特定之約（Buergeramt、Finanzamt、保局）乃用
- 未審何文須證譯、何須加簽乃用
- 官署拒納或索補文書乃用
- 戶中有異籍者，文途須分乃用
- 遷途之間，定期察之防有所遺乃用

## 入

### 必要

- **遷謀**：出自 plan-eu-relocation 之技，列諸官步
- **目之國**：德、奧、瑞士，或他歐國
- **國籍**：戶中諸人之籍
- **文書之藏**：今所持之正本副本

### 可選

- **源之國**：以定何書須加簽、何須海牙公約之合法化
- **僱約**：以定僱主所發之書（如 Arbeitgeberbescheinigung）
- **今文之語**：以識譯之所需
- **舊遷之驗**：前歐之登記或可省諸事
- **特情**：認定難民、歐藍卡者、派駐者（文書之需異）

## 法

### 第一步：列諸官步

自遷謀中取凡登記、申請、申報之步。

1. 讀遷謀，取凡須交書之行
2. 以官署之類分之：
   - 市政登記處（Buergeramt、Meldeamt、Einwohnerkontrolle）
   - 稅務署（Finanzamt）
   - 醫保提供者（Krankenkasse、OeGK、瑞士保者）
   - 社保署（Rentenversicherung、Sozialversicherung、AHV）
   - 移民／外僑局（Auslaenderbehorde）若用
   - 銀行與金融機構
   - 學校與托育
   - 車輛登記（Kfz-Zulassungsstelle）
   - 他（寵物輸入、職照之認）
3. 依遷謀之先後次第列之
4. 記諸步共用之書，勿重備

得：諸官步之序號清單，分類、有序，附共用之註。

敗則：若遷謀不全或缺之，據目之國之官方清單建之（德：make-it-in-germany.com；奧：migration.gv.at；瑞：ch.ch/en/moving-switzerland）。

### 第二步：對每步定所需之書

為每一官步，識官署所求之諸書。

1. 市政登記（Anmeldung/Meldezettel）：
   - 有效之護照或國身證（戶中諸人）
   - Wohnungsgeberbestaetigung／租約／房契
   - 婚書（若以配偶同登）
   - 出生證（童用）
   - 前登記之證（若境內遷）
2. 稅務登記：
   - 居地登記之證（Meldebestaetigung/Meldezettel）
   - 僱約或業之登記
   - 源國之稅號（以供跨境協調）
   - 婚書（德用以定稅級）
3. 醫保入保：
   - 僱約或自營之證
   - 前保之證或 EHIC（歐洲健康保險卡）
   - S1 表（派駐者或跨境之況）
   - 居地登記之證
4. 社保協調：
   - A1 便攜之書（派駐者）
   - E 表或 S 表以轉福利
   - 僱史之書
   - 源國社保號
5. 開銀行戶：
   - 有效之護照或國身證
   - 居地登記之證
   - 收入之證（僱約或近薪單）
   - 稅號或 Steueridentifikationsnummer（德）
6. 居留許可（非歐籍者）：
   - 護照有效，至少餘六月
   - 生物辨識照（各國式異）
   - 僱約或僱邀函
   - 財力之證
   - 醫保之證
   - 大學文憑及認定（歐藍卡用）
   - 無犯罪紀錄（或須加簽）
7. 車輛改登：
   - 車輛之證（Fahrzeugbrief/Zulassungsbescheinigung Teil II）
   - 保險之證（德用 eVB 號）
   - TUeV/Pickerl/MFK 檢驗證
   - 居地登記之證
8. 學校／托育入學：
   - 出生證
   - 接種紀錄（Impfpass）
   - 前校報告附譯
   - 居地登記之證

得：每步對所需書之矩陣，附書之規格（正本須、副本可、證譯所需）。

敗則：若特定步之需不明，直察官署之網或呼其服務專線。需或有變，勿唯信舊於十二月之三方指引。

### 第三步：察當前文書之狀

比所需之書與今藏者，識其闕。

1. 每所需之書，察之：
   - **有（正本）**：正本在藏可取
   - **有（僅副本）**：唯副本存；正本或須訂
   - **已過期**：書存而有效期已逾
   - **闕**：不存，須得之
   - **不適用**：此案不需
2. 凡「有（正本）」者，驗：
   - 書未損壞或難辨
   - 諸書之名相符（察音譯之差、婚前名、中名）
   - 用之時尚有效（護照、身證、保卡）
3. 已過期者，定：
   - 發證署之更新時
   - 過期書是否可暫納（有可、多不可）
   - 更新之費
4. 闕者，定：
   - 發證署及其處理時
   - 得此書所需之他書（遞歸察之）
   - 費與付款式
   - 可遠程訂乎，抑須親至
5. 標諸書名不符者（如護照用婚前名、婚書用婚後名），此類需釋或補改名之證

得：每所需書之狀表：狀（有／僅副本／過期／闕／N-A）、有效期、諸事之註。

敗則：若書狀不能確（如藏於他處或他人手中），記為「未確」，謀劃時以潛在闕者待之。

### 第四步：識譯與加簽之需

定何書須證譯、加簽或他合法化。

1. 察目國之語之需：
   - 德：書宜德文或附證譯
   - 奧：同德；諸署或納歐之英文書
   - 瑞士：視州而定（德、法、意、羅曼什語區）
2. 識免譯之書：
   - 歐之多語標準表（條例 2016/1191）——於歐盟諸國間之生、婚、卒等民事狀況書
   - 護照與國身證（普遍無譯可納）
   - EHIC（歐洲健康保險卡）
3. 須譯之書：
   - 須由宣誓／證定之譯者（beeidigter Uebersetzer）為之
   - 譯者須於目國證定（非源國）
   - 常需三至十工作日
   - 費：每頁三十至八十歐，視語對與繁簡而異
4. 定加簽或合法化之需：
   - 海牙公約國之書：由發國之主管署加簽
   - 非海牙國之書：全鏈合法化（本地公證、外交部、使館）
   - 歐內書：依歐規常免加簽，然須逐類驗之
   - 瑞士為海牙公約員，非歐盟員，規則異
5. 察目國是否納電子或數字加簽
6. 記或有書須同時加簽與證譯（加簽其身亦或須譯）

得：譯／合法化之矩陣——示每書：譯須（是／否）、加簽須（是／否）、估費、估時。

敗則：若未審某書是否須加簽，直呼目署之署。寧過備（加無用之簽）勝過備不足（約時被拒）。

### 第五步：生行動單

合諸發現為依先後、知期限之行動單。

1. 合諸闕（缺、過期、譯需、簽需）為一單
2. 每項附：
   - 書名
   - 所需之行（得、更、譯、簽、替）
   - 發署或服務者
   - 估處理時
   - 估費
   - 期限（自遷謀時中首用之時推之）
   - 先後（急／高／中／低）
3. 先後之定：
   - **急**：阻首官步（如護照為 Anmeldung 用）或有不容議之期
   - **高**：抵後二週內須得；處理時長
   - **中**：抵後一月內須得；處理時合理
   - **低**：終須得；無急迫之期
4. 列之序：
   - 首：急者依最長處理時序（先啟此）
   - 次：高者依期限序
   - 後：中與低
5. 計備書之總估費
6. 為每約日加「文書夾」清單——列所帶正本、副本、譯本之確目

得：依先後之行動單，附期、費、處理時；及每約之文書打包單。

敗則：若處理時不確（自官僚遲緩之國之書常然），以最惡估之，儘早啟。標可加費快辦之項。

## 驗

- 遷謀之每官步皆有至少一書對之
- 無書記為「狀不明」——皆須確為有／闕／過期／N-A
- 譯需依目國之官方語需
- 加簽需驗發國之海牙公約籍
- 行動單之期限合 plan-eu-relocation 之時序
- 先後之分一致（無阻「急」步之「低」項）
- 總估費已計且現之
- 每約之文書單至少為前三官步生之

## 陷

- **謂歐書無需備**：雖歐規簡化跨境納書，諸署仍多求譯，或求簽於歐內國間
- **諸書之名不符**：非拉丁文字之音譯、婚前婚後名之用、中名之不一——此約時被拒之最大因
- **恃影印本**：DACH 之署多須正本以察並留證副；即謂副本足亦宜攜正
- **遲訂譯**：宣誓譯者常積案一二週，盛遷季（八九月）更延
- **忘譯上之加簽**：諸署或求正本有簽，且譯本為加簽文件之單獨證譯
- **不察書之有效期**：餘二月之護照或被拒，若署求餘六月
- **忽歐之多語表**：歐間民事狀況書用多語標準表（發署有）可全免譯——然須明請之
- **謂數字書可納**：DACH 諸官署多仍須實體書；唯電子書之 PDF 印本或不納，除非另驗

## 參

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) -- 立遷謀以入此書驗
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- 用此諸書之程序之詳導
