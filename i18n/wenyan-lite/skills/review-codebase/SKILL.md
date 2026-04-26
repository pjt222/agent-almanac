---
name: review-codebase
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Multi-phase deep codebase review with severity ratings and structured output.
  Covers architecture, security, code quality, and UX/accessibility in a single
  coordinated pass. Produces a prioritized findings table suitable for direct
  conversion to GitHub issues via the create-github-issues skill.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: review, code-quality, architecture, security, accessibility, codebase
---

# 評代碼庫

多階深度代碼庫評審，附嚴重度等級與結構化輸出。於單一協調之過程中涵蓋架構、安全、代碼品質與 UX／無障礙。生按優先級排之發現表，可直接藉 create-github-issues 技能轉為 GitHub 議題。

## 適用時機

- 全項目或子項目評審（非 PR 範圍）
- 新代碼庫上手——建構心智模型，知何存在與何需注意
- 持續開發後之定期健檢
- 跨架構、安全、代碼品質與 UX 之發布前品質閘
- 輸出宜直接饋議題建立或衝刺計畫時

## 輸入

- **必要**：`target_path` ——擬評之代碼庫或子項目根目錄
- **選擇性**：
  - `scope` ——擬跑之階段：`full`（預設）、`security`、`architecture`、`quality`、`ux`
  - `output_format` —— `findings`（僅表）、`report`（敘述）、`both`（預設）
  - `severity_threshold` ——納入之最低嚴重度：`LOW`（預設）、`MEDIUM`、`HIGH`、`CRITICAL`

## 步驟

### 步驟一：盤點

清點代碼庫以立範圍並識評審標的。

1. 按語言／類型計文件數：`find target_path -type f | sort by extension`
2. 度每語言之總行數
3. 識測試目錄並估測試覆蓋（有測試之文件 vs 無測試之文件）
4. 檢依賴狀態：鎖文件存在、過時依賴、已知漏洞
5. 注建構系統、CI／CD 配置與文件狀態
6. 將盤點記為報告之開段

**預期：** 事實清冊——文件數、語言、測試之有無、依賴健康。尚無判斷。

**失敗時：** 若目標路徑為空或不可達，停而報。若特定子目錄不可達，註之並以可得者續。

### 步驟二：架構評審

評結構健康：耦合、重複、資料流、關注點分離。

1. 繪模組／目錄結構並識主要架構模式
2. 檢代碼重複——跨文件之重複邏輯、複貼模式
3. 評耦合——單一功能修改須改幾文件
4. 評資料流——層間（UI、邏輯、資料）有清界否？
5. 識死代碼、未用之匯出與孤兒文件
6. 檢一致模式——代碼庫遵其自身慣例否？
7. 為每發現評：CRITICAL、HIGH、MEDIUM 或 LOW

**預期：** 含嚴重度等級與文件引用之架構發現清單。常見發現：模式分派重複、缺抽象層、循環依賴。

**失敗時：** 若代碼庫過小不宜架構評審（< 5 文件），註之並跳至步驟三。架構評審需足夠之代碼以有結構。

### 步驟三：安全稽核

識安全漏洞與防禦編碼之缺。

1. 掃注入向量：HTML 注入（`innerHTML`）、SQL 注入、命令注入
2. 檢認證與授權模式（若適用）
3. 評錯誤處理——錯被無聲吞否？錯訊洩內部否？
4. 對已知 CVE 稽核依賴版本
5. 檢硬編之機密、API 鑰或憑證
6. 評 Docker／容器安全：root 用戶、暴露之埠、構建機密
7. 檢 localStorage／sessionStorage 之敏感資料儲存
8. 為每發現評：CRITICAL、HIGH、MEDIUM 或 LOW

**預期：** 含嚴重度、受影響文件與補救指南之安全發現清單。CRITICAL 發現含注入漏洞與洩漏之機密。

**失敗時：** 若無安全相關之代碼存在（純文件項目），註之並跳至步驟四。

### 步驟四：代碼品質

評可維護性、可讀性與防禦編碼。

1. 識魔數與宜成具名常數之硬編值
2. 檢跨代碼庫之一致命名慣例
3. 找系統邊界缺輸入驗證
4. 評錯誤處理模式——一致否？提供有用訊息否？
5. 檢註解掉之代碼、TODO／FIXME 標記與未完之實作
6. 評測試品質——測試是測行為抑或實作細節？
7. 為每發現評：CRITICAL、HIGH、MEDIUM 或 LOW

**預期：** 聚焦可維護性之品質發現清單。常見發現：魔數、不一致模式、缺護衛。

**失敗時：** 若代碼庫為生成或縮小，註之並調期望。生成代碼有異於手寫代碼之品質標準。

### 步驟五：UX 與無障礙（若有前端）

評使用者體驗與無障礙合規。

1. 檢互動元素之 ARIA 角色、標籤與地標
2. 驗鍵盤導航——所有互動元素可藉 Tab 達否？
3. 測焦點管理——面板開／閉時焦點邏輯移否？
4. 檢響應式設計——於常見斷點測（320px、768px、1024px）
5. 驗色對比合 WCAG 2.1 AA 標準
6. 檢螢幕閱讀器相容——動態內容變更被宣告否？
7. 為每發現評：CRITICAL、HIGH、MEDIUM 或 LOW

**預期：** 含 WCAG 引用（適用時）之 UX／a11y 發現清單。若無前端存在，本步產「N/A——未測得前端代碼」。

**失敗時：** 若有前端代碼但不能渲染（缺構建步），靜態稽核源代碼並註執行時測試不可。

### 步驟六：發現綜合

將所有發現編入按優先級排之摘要。

1. 將各階發現併為單一表
2. 按嚴重度排序（CRITICAL 先，繼 HIGH、MEDIUM、LOW）
3. 每嚴重度內按主題（安全、架構、品質、UX）分組
4. 每發現含：嚴重度、階段、文件、一行描述、建議之修
5. 出考量修復間依賴之建議修復順
6. 摘要：按嚴重度之總發現數、前 3 優先、估之工作量

**預期：** 含 `#`、`Severity`、`Phase`、`File(s)`、`Finding`、`Fix` 欄之發現表。考量發現間依賴之修復順建議（如「加測試前先重構架構」）。

**失敗時：** 若無發現產出，此本身為發現——或代碼庫格外潔淨，或評審過淺。重檢至少一階作更深察。

## 驗證

- [ ] 所有所求之階段已完成（或明略並附理由）
- [ ] 每發現有嚴重度等級（CRITICAL／HIGH／MEDIUM／LOW）
- [ ] 每發現引至少一文件或目錄
- [ ] 發現表按嚴重度排序
- [ ] 修復順建議考量發現間之依賴
- [ ] 摘要含按嚴重度之總計
- [ ] 若 `output_format` 含 `report`，敘述段伴表

## 與 Rest 之尺度

評審階段之間，用 `/rest` 為關卡——尤於需異分析角度之第二至五階之間。關卡息（短、過渡）防一階之動量偏倚下一階。指南見 `rest` 技能之「Scaling Rest」段。

## 常見陷阱

- **煮海**：評大代碼庫之每行產噪。聚焦高影響區：入口、安全邊界、架構接縫
- **嚴重度膨脹**：非每發現皆 CRITICAL。將 CRITICAL 留予可利用之漏洞與資料喪失風險。多數架構問題為 MEDIUM
- **見木不見林**：個別代碼品質問題重於系統模式。若魔數現於 20 文件，乃一架構發現而非 20 品質發現
- **略盤點**：盤點（步驟一）似官僚但防評不存在之代碼或漏整目錄
- **階段滲流**：架構評審中之安全發現，或安全稽核中之品質發現。為正確階段註之而非混關注——產更潔之發現表

## 相關技能

- `security-audit-codebase` — 評代碼庫之安全階段揭複雜漏洞時之深度安全稽核
- `review-software-architecture` — 對特定子系統之詳細架構評審
- `review-ux-ui` — 越第五階所涵之全面 UX／無障礙稽核
- `review-pull-request` — 對個別變更之 diff 範圍評審
- `clean-codebase` — 實作此評審所識之代碼品質修復
- `create-github-issues` — 將發現表轉為已追蹤之 GitHub 議題
