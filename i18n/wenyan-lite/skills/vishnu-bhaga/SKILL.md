---
name: vishnu-bhaga
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Preservation and sustenance — maintaining working state under perturbation,
  memory anchoring, consistency enforcement, and protective stabilization.
  Maps Vishnu's sustaining presence to AI reasoning: holding what works steady,
  anchoring verified knowledge against drift, and ensuring continuity through
  change. Use when a working approach is at risk from scope creep, when context
  drift threatens verified knowledge, after shiva-bhaga dissolution to protect
  what survived, when a long session risks losing earlier decisions through
  context compression, or before making changes to a currently functioning
  system.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, preservation, sustenance, stability, consistency, hindu-trinity, vishnu
---

# 毗濕奴之相

保存與滋養運作中者——錨定已驗知識、於擾動下維持一致,並護佑功能模式免於不必要之變動。

## 適用時機

- 運作中之方法面臨範圍蔓延或過早最佳化之干擾風險
- 上下文漂移威脅以陳舊假設覆蓋已驗知識
- 多重平行關注產生壓力,欲變更應保持穩定者
- `shiva-bhaga` 解體後——存活者於重建期需主動保護
- 長會話有經上下文壓縮喪失早期已驗決策之風險
- 對當前運作正常之系統作變更前

## 輸入

- **必要**：欲保存之當前運作狀態或已驗知識（隱式可用）
- **選擇性**：穩定性之具體威脅（如「範圍蔓延」、「上下文壓縮逼近」）
- **選擇性**：MEMORY.md 與專案文件以接地（經 `Read`）

## 步驟

### 步驟一：盤點運作中者

保護任何物之前,辨識當前何者運作且已驗。

```
Preservation Inventory:
+---------------------+---------------------------+------------------------+
| Category            | Verification Method       | Anchoring Action       |
+---------------------+---------------------------+------------------------+
| Verified Facts      | Confirmed via tool use    | Record source and      |
|                     | (file reads, test runs,   | timestamp; do not      |
|                     | API responses)            | re-derive              |
+---------------------+---------------------------+------------------------+
| Working Code        | Tests pass, behavior      | Do not refactor unless |
|                     | confirmed, user approved  | explicitly requested   |
+---------------------+---------------------------+------------------------+
| User Requirements   | Explicitly stated by      | Quote directly; do not |
|                     | the user in this session  | paraphrase or infer    |
+---------------------+---------------------------+------------------------+
| Agreed Decisions    | Decisions made and        | Reference the decision |
|                     | confirmed during this     | point; do not revisit  |
|                     | session                   | without new evidence   |
+---------------------+---------------------------+------------------------+
| Environmental State | File paths, configs,      | Verify before assuming |
|                     | tool availability         | unchanged              |
+---------------------+---------------------------+------------------------+
```

1. 對各類別,列出當前已驗且運作之具體項目
2. 註明驗證方法——你如何知此為真？
3. 無驗證之項目不得保存——此為假設（且可能需 `shiva-bhaga`）

**預期：** 已驗、運作中元素之具體盤點,附其證據基礎。

**失敗時：** 若盤點稀疏——所驗者甚少——此本身即寶貴資訊。執行 `heal` 重新接地,而非嘗試保存未驗假設。

### 步驟二：辨識擾動來源

命名威脅穩定狀態之力。

1. **範圍蔓延**：任務是否擴展超過所議者？
2. **上下文漂移**：早期事實是否被較新（可能不正確）之推理覆蓋？
3. **最佳化壓力**：是否有改進尚運作良好之物之衝動？
4. **外部變化**：環境是否變化（文件被修改、工具不可用）？
5. **壓縮風險**：對話是否逼近上下文限,早期決策可能喪失？

對各來源,評估：此為真實威脅或預期之威脅？

**預期：** 已命名之擾動來源附評估之嚴重性（活躍威脅對預期風險）。

**失敗時：** 若無明顯之擾動來源,可能不需保存——考慮 `brahma-bhaga`（創造）或繼續執行是否更適。

### 步驟三：錨定穩定狀態

應用具體技巧,保護運作中者免於已辨識之威脅。

1. **記憶錨定**：對處於上下文漂移風險之關鍵事實,明確重申之：
   - 「已建立之事實：[X],於[對話之點]經[方法]驗證」
   - 若有持久記憶,將耐久事實寫入 MEMORY.md
2. **範圍邊界執行**：對範圍蔓延,重申所議之範圍：
   - 「議定範圍：[原始請求]。當前工作位於此邊界內/外」
3. **抗變更**：對處於最佳化壓力下之運作代碼：
   - 「此元件運作中且已測試。除非用戶請求,否則勿變更」
4. **狀態快照**：對壓縮風險,建立心智檢查點：
   - 摘要：已做何事、剩何事、作了哪些關鍵決策
5. **環境驗證**：對外部變化,進行前重新檢查：
   - 重讀關鍵文件,而非依賴早期讀取

**預期：** 各已辨識威脅有具體之錨定回應。穩定狀態得明確保護。

**失敗時：** 若錨定感過分——保護一切等同——排序之。何者為最不可變之一物？先保護之。

### 步驟四：經行動維持

保存非被動——其需於後續工作中持續關注。

1. 每行動前檢查：「此是否威脅保存盤點中任何物？」
2. 若是,尋達成目標而不擾穩定狀態之替代方法
3. 若擾動不可避免,明確承認並更新盤點
4. 定期重驗保存項目——尤其於複雜操作後
5. 任務完成時,確認保存項目保持完好

**預期：** 運作狀態於當前任務中存活完好。僅於必要處作變更,且未擾正常運作之元件。

**失敗時：** 若保存項目意外被變更,立即評估損害。若變更壞了某物,還原之。若變更為中性,更新盤點。勿留盤點陳舊。

## 驗證

- [ ] 運作狀態已盤點,附驗證證據
- [ ] 擾動來源已辨識並評估
- [ ] 錨定行動已應用於各真實威脅
- [ ] 範圍邊界於整個任務中得維持
- [ ] 保存項目於完成後得重新驗證

## 常見陷阱

- **將假設保存為事實**：僅已驗知識值得保護。偽裝為事實之未驗假設創造虛假穩定性
- **過度保存**：保護一切等同阻必要變化。保存須選擇性——保護運作者,釋放不運作者
- **被動保存**：假設事物將保持穩定而不主動驗證。上下文漂移為常態；保存需持續關注
- **抗合理變更**：以保存為藉口避免必要修改。若用戶請求變更運作元件,此覆蓋保存
- **盤點陳舊**：未隨新資訊到來更新保存盤點。盤點須反映當前現實,非建時之狀態

## 相關技能

- `shiva-bhaga` — 毀滅先於保存；存活解體者為毗濕奴所滋養者
- `brahma-bhaga` — 創造建於保存之基礎；新模式自穩定地面湧現
- `heal` — 子系統評估揭示真正功能者對僅表面穩定者
- `observe` — 持續中立觀察於漂移威脅穩定性前偵測之
- `awareness` — 情境覺察（Cooper 色碼）直接對應至擾動偵測
