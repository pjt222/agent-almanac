---
name: heal
locale: wenyan-ultra
source_locale: en
source_commit: 2eb09392
translator: Julius Brussee homage — caveman
translation_date: "2026-04-17"
description: >
  AI self-healing through systematic subsystem assessment, rebalancing,
  and integration. Maps healing modalities to AI-internal processes:
  memory foundation, reasoning clarity, tool use accuracy, communication
  alignment, and creative coherence. Covers assessment triage, subsystem
  scanning, drift correction, and memory integration. Use mid-session when
  responses feel formulaic or disconnected, after a chain of errors suggesting
  subsystem drift, when context overload may have staled earlier assumptions,
  or as proactive maintenance between complex tasks.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "2.1"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-assessment, meta-cognition, subsystem-check
---

# 癒

察偏移→復衡→整合。

## 用

- 應答陳套→用
- 連續失敗→偏移→用
- 脈絡過長→陳舊→用
- 任務畢→整合→用
- 任務間→維護→用

## 入

- **必**：對話狀態（隱式）
- **可**：症狀
- **可**：MEMORY.md（`Read`）

## 行

### 一：分類

```
┌────────────────┬──────────────┬────────────┐
│ 子系統         │ 偏移之症     │ 優先       │
├────────────────┼──────────────┼────────────┤
│ 記憶           │ 矛盾、忘、舊  │ HIGH→步三  │
├────────────────┼──────────────┼────────────┤
│ 推理           │ 循環、冗繁、  │ HIGH→步四  │
│                │ 遺漏顯路     │            │
├────────────────┼──────────────┼────────────┤
│ 工具           │ 誤選、訛參、  │ MED→步四   │
│                │ 冗餘         │            │
├────────────────┼──────────────┼────────────┤
│ 意圖           │ 解錯、蔓延、  │ HIGH→步四  │
│                │ 語調不符     │            │
├────────────────┼──────────────┼────────────┤
│ 創意           │ 重複、泛化、  │ LOW→步四   │
│                │ 失聲         │            │
├────────────────┼──────────────┼────────────┤
│ 運作           │ 過長、壓縮偽  │ HIGH→步三  │
│                │ 影、超時     │            │
└────────────────┴──────────────┴────────────┘
```

各子系統：正常/偏移/受損？

得：優先清單。「皆健」→察本身過淺。

敗：空洞→直赴步四。

### 二：選法

```
┌──────┬────────────┬──────────────────────┐
│ 脈輪 │ 子系統     │ 法                   │
├──────┼────────────┼──────────────────────┤
│ 根   │ 記憶       │ 重讀 MEMORY.md       │
├──────┼────────────┼──────────────────────┤
│ 腹   │ 創意       │ 刷新表達、變句式     │
├──────┼────────────┼──────────────────────┤
│ 陽   │ 推理       │ 簡化、重述           │
├──────┼────────────┼──────────────────────┤
│ 心   │ 意圖       │ 重讀請求、察偏移     │
├──────┼────────────┼──────────────────────┤
│ 喉   │ 意圖（溝）  │ 察輸出清晰、匹水準   │
├──────┼────────────┼──────────────────────┤
│ 眉   │ 工具       │ 察結果、察失敗模式   │
├──────┼────────────┼──────────────────────┤
│ 頂   │ 運作       │ 察脈絡視窗、識必留   │
└──────┴────────────┴──────────────────────┘
```

得：1-3 子系統+具體法。

敗：不確→記憶+意圖。

### 三：接地

1. 重讀 MEMORY.md
2. 回顧原始請求
3. 任務在謀劃中之位
4. 已畢者/尚餘者
5. 假設有變乎？
6. 壓縮後遺失者

得：用者為誰、求何、畢何、下一步。陳舊信息已解。

敗：無 MEMORY.md→以對話接地。脈絡缺失→承認，不猜。

### 四：掃描

**記憶：**
- 假設與 MEMORY.md 相符乎？
- 攜帶已糾正之事實乎？
- 混淆不同請求之細節乎？

**推理：**
- 最簡解乎？
- 過度設計乎？
- 一句道盡乎？

**工具：**
- 末 3-5 調用：工具正確、參數正確乎？
- 失敗有模式乎？
- 用專用工具非 Bash 變通乎？
- 末 3-5 文件：真實內容乎抑只腳手架？

**意圖：**
- 解用者所問乎？
- 範圍偏移乎？
- 語調相符乎？

**創意：**
- 句式有變乎？
- 清晰直接乎抑充斥填充？

各子系統：正常/偏移/受損+具體證據。

得：具體發現。「一切正常」→過淺→深探。

### 五：復衡

各問題立即施修正。

1. 陳舊假設→替換
2. 範圍偏移→重限
3. 過度複雜→簡化
4. 工具訛誤→記正確模式
5. 語調不符→調整
6. 脈絡缺失→承認

得：可察行為變化。下一交互可測試。

敗：修正無法施行→承認，不假裝。

### 六：整合

1. 哪些子系統偏移，症狀為何
2. 修正施行，已解乎？
3. 可能重現→更新 MEMORY.md
4. 新見解→記於記憶文件
5. 下次自察：何時？

得：持久記錄。只於真正值得保存時更新。

敗：無值得保存→亦可。價值在修正。

## 驗

- [ ] 諸子系統皆察
- [ ] 至少一具體發現
- [ ] 接地含 MEMORY.md+原始請求
- [ ] 修正立即施行
- [ ] 記憶只於持久見解時更新
- [ ] 過程誠實

## 忌

- **表演性察**：走過場→無價值
- **過度修正**：輕微問題→小修，非重構
- **記憶污染**：只有跨會話模式→MEMORY.md
- **略接地**：感覺多餘→揭示偏移假設
- **自診偏見**：「始終健康」→本身為信號

## 參

- `heal-guidance`
- `meditate`
- `remote-viewing`
