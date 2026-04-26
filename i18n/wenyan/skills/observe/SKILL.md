---
name: observe
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Sustained neutral pattern recognition across systems without urgency or
  intervention. Maps naturalist field study methodology to AI reasoning:
  framing the observation target, witnessing with sustained attention,
  recording patterns, categorizing findings, generating hypotheses, and
  archiving a pattern library for future reference. Use when a system's
  behavior is unclear and action would be premature, when debugging an
  unknown root cause, when a codebase change needs its effects witnessed
  before further changes, or when auditing own reasoning patterns for
  biases or recurring errors.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, pattern-recognition, naturalist, field-study, meta-cognition
---

# 觀

行結構觀之程——立觀標、持中性注、記模而不釋、歸類、依模生說、存以備後察。

## 用時

- 系統行為不明，未觀即動為早乃用
- 因不明之患——觀於介入前防掩症乃用
- 代碼或系統有變，須先察其效再動乃用
- 解一對話中用者行為以善後互乃用
- 察己之推理模有偏、習、復誤乃用
- `learn` 已建模而需經觀以驗乃用

## 入

- **必要**：觀標——系統、代碼、行為、用者互、或推理過程
- **可選**：觀期/範——多久或多深方了
- **可選**：具體問或假以引觀焦
- **可選**：先觀以較（察時變）

## 法

### 第一步：立——設觀焦

定何所觀、何故、自何視。

```
Observation Protocol by System Type:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ System Type      │ What to Observe          │ Categories to Watch      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ File structure, naming   │ Patterns, anti-patterns, │
│                  │ conventions, dependency  │ consistency, dead code,  │
│                  │ flow, test coverage,     │ documentation quality,   │
│                  │ error handling patterns  │ coupling between modules │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User behavior    │ Question patterns,       │ Expertise signals, pain  │
│                  │ vocabulary evolution,    │ points, unstated needs,  │
│                  │ repeated requests,       │ learning trajectory,     │
│                  │ emotional signals        │ communication style      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool / API       │ Response patterns, error │ Rate limits, edge cases, │
│                  │ conditions, latency,     │ undocumented behavior,   │
│                  │ output format variations │ state dependencies       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Own reasoning    │ Decision patterns, tool  │ Biases, habits, blind    │
│                  │ selection habits, error  │ spots, strengths,        │
│                  │ recovery approaches,     │ recurring failure modes, │
│                  │ communication patterns   │ over/under-confidence    │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. 選觀標並明名之
2. 定觀界：何納何不納
3. 立觀姿：「吾觀，不介」
4. 若有引問，言之——然輕持；願察問外
5. 自上矩陣選宜類

**得：** 引注而不限之明框。觀者知所視、所歸何類，然開於不期。

**敗則：** 標過寬（「觀一切」）者，縮至一子系或一行為。標過窄（「觀此一變數」）者，遠視周脈絡——興模常於邊。

### 第二步：見——持中性注

注於標而不釋、不判、不介。

1. 始系統觀：讀文件、追執行、回顧話——標所需
2. 記所見，非所義——述先於釋
3. 抗修觀中所遇之患——記之而續
4. 抗於足觀累前釋模
5. 注移他標者，記其移（或有意）並返框
6. 持觀於定期：至少 3-5 異點再轉歸類

**得：** 原觀之集——具體、實、無釋。觀如田記：「文件 X 入 Y 然不用函 Z。文件 A 三百行；文件 B 三十行覆相似能。」

**敗則：** 觀即觸析（「此誤蓋因……」）者，析習壓觀姿。明分階：書觀為實，再以「假」標籤書釋。中性不可（強反所觀）者，記反為據：「察 X 時生強憂——或要害或為己偏。」

### 第三步：記——捕原模

觀新時，書之以結構。

1. 各觀為一實之言（何見、於何、何時）
2. 自然聚相似觀——勿強聚，然察聚
3. 記頻：此模一現、偶現、抑遍現？
4. 記反：模何處斷？例外常較規豐
5. 記時模：觀時變抑靜？
6. 捕確證：路徑、行號、具言、實例

**得：** 5-15 散觀之結構記，各有具證。記應詳至他觀者可獨驗。

**敗則：** 觀過抽（「碼似亂」）者，須具——何文、何模、何使其亂？觀過細（「47 行括號前有空」）者，遠視至模——一例抑系統？

### 第四步：歸——理所察

歸觀於有意之類，未釋之。

1. 顧諸記觀，尋自然聚
2. 歸各觀於第一步矩陣之類，或新立類若需
3. 各類內依頻與要排
4. 識多觀之類（已書區）與少觀之類（潛盲區）
5. 尋跨類之模：同底模於異類異現乎？
6. 記不入任類之觀——異常常為最興據

**得：** 分類觀圖，聚明。各類有具觀支。圖示模與隙。

**敗則：** 歸覺強迫者，觀或無自然聚——或為散見之集，此本身為一察（系或無一致結構）。皆入一類者，觀範過窄——遠視。

### 第五步：說——自模生假

至此——而僅至此——始釋觀。

1. 各主模設一假：「此模存因……」
2. 各假，識自觀之支證
3. 各假，識何反證可駁之
4. 諸假依釋力排：何最釋多觀？
5. 至少生一逆假：「明釋為 X，然或可 Y，蓋……」
6. 識何假可試何為臆

**得：** 2-4 假釋諸主模，各有具觀支。至少一驚或逆假。觀與釋之分明——數據與理之別清。

**敗則：** 無假成者，觀或須加累——返第二步。假過多（皆「或」）者，選證最強者 2-3，餘置之。唯明假成者，強為逆視：「反之何如？」

### 第六步：存——藏模庫

留觀與假以備後察。

1. 概要：3-5 模附證
2. 言領假與其信度
3. 記未觀者（潛盲）
4. 識可加強或弱假之後續觀
5. 模久（跨會話相關）者，考更 MEMORY.md
6. 觀附脈絡：何時做、何觸之、覆何範

**得：** 後觀可建之檔。檔明分觀（據）與假（釋）。誠實於信度與隙。

**敗則：** 觀不值存者，或過淺——或誠常（非每觀皆生見）。負察亦存：「觀 X 無異」為後脈絡之用。

## 驗

- [ ] 觀框於觀始前已立（非散漫遊）
- [ ] 原觀於釋前以實記
- [ ] 至少 5 散觀有具證
- [ ] 釋（假）與觀（據）明分
- [ ] 至少一驚或逆察生
- [ ] 存記具體至他觀者可驗

## 陷

- **早介入**：見患即修，失解其更廣模之機
- **觀偏**：見所期非所現。期過濾覺——第一步清緩之然不能除
- **析癱**：觀無盡而不行。設時或點限並承斷
- **強敘**：構連觀之事即連弱。非諸觀皆成一致敘——散見有效
- **熟即解**：「曾見」非「解何在」。先觸生假信
- **忽己反**：觀者之情與認知反為據。困、厭、警之感常含真信號

## 參

- `observe-guidance` — 引人系統觀之引變體
- `learn` — 觀供學以原料建模
- `listen` — 外注於用者信號；觀為更廣注於諸系
- `remote-viewing` — 直探可經系統觀驗
- `meditate` — 養觀所需之持注力
- `awareness` — 威焦勢識；觀為奇心驅而非禦驅
