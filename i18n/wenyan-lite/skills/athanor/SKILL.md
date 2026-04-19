---
name: athanor
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Four-stage alchemical code transmutation — nigredo (decomposition), albedo
  (purification), citrinitas (illumination), rubedo (synthesis) — with meditate
  and heal checkpoints between stages. Transforms tangled or legacy code into
  optimized, well-structured output through systematic material analysis. Use
  when transforming legacy code into modern equivalents, refactoring deeply
  tangled modules where incremental fixes keep failing, converting a codebase
  between paradigms, or when simpler refactoring approaches have stalled and a
  full-cycle transformation is needed.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: multi
  tags: alchemy, transmutation, refactoring, transformation, four-stages, nigredo, albedo, citrinitas, rubedo
---

# 鍊金爐

執行碼或資料之四階段鍊金轉化——分解原質、淨其本、明其目標形、合精煉之輸出。鍊金爐（athanor）為維諸階段穩熱之爐。

## 適用時機

- 將遺留碼轉為現代、結構良好之等價
- 重構深糾纏之模組，漸進修補屢失敗時
- 將碼庫由一典範轉至另（程序至函式、單體至模組）
- 將原始亂資料處理為潔分析資料集
- 較簡單之重構法已停滯而需全循環轉化時

## 輸入

- **必要**：欲轉之原料（檔案路徑、模組名或資料源）
- **必要**：所欲之終態（目標架構、典範或格式）
- **選擇性**：已知約束（須保 API、不能改資料庫 schema 等）
- **選擇性**：先前失敗之轉化嘗試與其停滯之因

## 步驟

### 步驟一：Nigredo——分解

將原質拆為其組成元素。無聖；一切編目。

1. 完整清點原料：
   - 列每函式、類、模組或資料實體
   - 對應一切依賴（imports、calls、資料流）
   - 辨隱耦合（共全域、隱態、副作用）
2. 揭隱假設：
   - 碼依何未記之行為？
   - 何錯誤條件被默吞？
   - 何順序依賴存？
3. 編目反模式與技術債：
   - 神物件、循環依賴、複製貼上重複
   - 死碼路徑、不可達分支、殘餘功能
   - 硬編值、魔數、嵌入配置
4. 產**Nigredo 清單**：每元素、依賴、假設、反模式之結構編目

**預期：** 對原料之完整、不退縮之清單。清單應覺不適——若不然，分解未足深。每隱假設今已顯。

**失敗時：** 若原料過大難全清點，按模組界線分解並將各模組視為獨立鍊金爐運行。若依賴過糾纏難對應，用 `grep`/`Grep` 追實際呼叫處而非依文件。

### 步驟二：Meditate——煅燒檢查點

行 `meditate` 技能以清 nigredo 中積之假設。

1. 將 nigredo 清單置旁並清心智情境
2. 錨於輸入所陳之轉化目標
3. 觀 nigredo 引何偏見——分解使某些法看似不可避否？
4. 將任倉促解之念標為「岔」並返目標

**預期：** 清晰、無偏之態，可不錨於原料當前形而評之。目標覺新而非為所尋之物所限。

**失敗時：** 若 nigredo 之發現屢牽注意（特糟之反模式、可保之巧妙駭客），書之並明置旁。僅於目標較當前形更清時方進。

### 步驟三：Albedo——淨化

分本質與偶然。剝去一切不為目標形服務者。

1. 自 nigredo 清單將每元素分類：
   - **本質**：核心業務邏輯、不可代之演算法、關鍵資料轉換
   - **偶然**：框架樣板、舊缺陷之變通、相容墊
   - **毒**：反模式、安全弱點、死碼
2. 將本質元素提至隔離：
   - 將核心邏輯由框架包裝中拉出
   - 分資料轉換與 I/O
   - 自實作提介面
3. 全移毒元素——記何被移與其因
4. 對偶然元素，判目標形中是否存等價
5. 產**Albedo 萃取**：純之本質邏輯附潔介面

**預期：** 純、隔離之函式／模組集，呈原料之核心值。每件可隔離測。萃取顯小於原。

**失敗時：** 若本質與偶然糾纏難分，先引縫點（介面）。若原料抗淨化，恐需先 `dissolve-form` 而後鍊金爐方可續。

### 步驟四：Heal——淨化評估

行 `heal` 技能以評淨化是否徹底。

1. 分流 albedo 萃取：仍有任攜毒餘者否？
2. 查偏移：淨化是否已偏離原轉化目標？
3. 評完整：一切本質元素皆計，或某些已倉促棄？
4. 重平衡若需：恢復誤分為偶然之任本質元素

**預期：** 信 albedo 萃取完整、潔、可備明照。無本質邏輯失；無毒模式留。

**失敗時：** 若評估揭顯著缺，返步驟三附特定缺之辨。勿以不全之原料進至 citrinitas。

### 步驟五：Citrinitas——明照

見目標形。將淨之元素對應於其最佳結構。

1. 模式辨識：辨何設計模式服務淨之元素
   - 資料流示 pipes/filters、event sourcing、CQRS 否？
   - 介面示 strategy、adapter、facade 否？
   - 模組結構示 hexagonal、layered、micro-kernel 否？
2. 設計目標架構：
   - 將每本質元素對應至其新位
   - 定元件間之介面
   - 規新結構中之資料流
3. 辨何須新建（於原中無等價）：
   - 統一重複邏輯之新抽象
   - 代隱耦合之新介面
   - 代默失敗之新錯誤處理
4. 產**Citrinitas 藍圖**：自 albedo 萃取至目標形之完整對應

**預期：** 清晰、詳之藍圖，每本質元素皆有家，每介面皆已定。藍圖應覺不可避——既有淨之元素，此結構乃自然之合。

**失敗時：** 若多有效架構競，對輸入之約束評各。若無明勝者現，寧最簡選項並記替代為將來選。

### 步驟六：Meditate——合成前檢查點

行 `meditate` 技能以備終合成。

1. 清 citrinitas 之分析情境
2. 錨於 citrinitas 藍圖為合成指引
3. 觀對轉化之任慮——任事被趕否？
4. 確就緒：藍圖清、原料純、約束已知

**預期：** 對所須建之物有靜清。合成階段應為執行而非設計。

**失敗時：** 若對藍圖疑存，附特定關切返步驟五。寧精藍圖而勿以不確始合成。

### 步驟七：Rubedo——合成

將淨之元素組為其目標形。哲學家之石：可工、最佳化之碼。

1. 依 citrinitas 藍圖建新結構：
   - 建檔、模組、介面如所規
   - 將每本質元素遷至其新位
   - 實作新抽象與介面
2. 將元件接：
   - 連資料流如所設計
   - 經新路徑實作錯誤傳遞
   - 配依賴注入或模組載入
3. 驗合成：
   - 各元件於隔離下工否？（單元測試）
   - 元件正確組合否？（整合測試）
   - 全系統產與原同之輸出否？（迴歸測試）
4. 移鷹架：
   - 刪臨時相容墊
   - 移遷移輔助
   - 清任至舊結構之餘引用
5. 產**Rubedo 輸出**：已轉化之碼，於新形下完整可工

**預期：** 較原可量更優之可工碼：行少、結構清、測試覆蓋佳、依賴少。轉化已成且舊形可退役。

**失敗時：** 若合成揭藍圖之缺，勿補——返步驟五（citrinitas）以修設計。若個別元件失敗，先隔離並修而後試全整合。Rubedo 不應產半轉之嵌合體。

## 驗證

- [ ] Nigredo 清單完整（一切元素、依賴、假設已編目）
- [ ] Nigredo/albedo 間之 meditate 檢查點已過（假設已清）
- [ ] Albedo 萃取僅含本質元素附潔介面
- [ ] Heal 評估確淨化完整
- [ ] Citrinitas 藍圖將每本質元素對應至目標形
- [ ] Citrinitas/rubedo 間之 meditate 檢查點已過（為合成就緒）
- [ ] Rubedo 輸出對原行為通過迴歸測試
- [ ] Rubedo 輸出可量改進（繁複、耦合、測試覆蓋）
- [ ] 無毒元素存於最終輸出中
- [ ] 自輸入之轉化約束已滿

## 常見陷阱

- **跳 nigredo 之深**：倉促分解致隱耦合於合成中浮現。全投於清單
- **保偶然繁複**：執著於巧妙變通或「可工，勿觸」之碼。若非本質，去之
- **跳 meditate 檢查點**：自一階段之認知動量偏下一。停為結構，非選
- **無藍圖之合成**：於 citrinitas 完成前始碼產拼湊而非轉化
- **不全迴歸測試**：Rubedo 須複現原行為。未測之路徑將默斷
- **citrinitas 中之範蔓延**：明照階段揭原目標外之改進機會。注之但勿追——鍊金爐服所陳轉化，非假想理想

## 相關技能

- `transmute` — 為單函式或小模組之較輕之轉化
- `chrysopoeia` — 值提取與最佳化（化基碼為金）
- `meditate` — 用為階段門檢查點之元認知清
- `heal` — 用為淨化驗證之子系統評估
- `dissolve-form` — 原料對鍊金爐過剛時，先溶
- `adapt-architecture` — 系統級遷移模式之互補法
- `review-software-architecture` — 合成後之架構複查
