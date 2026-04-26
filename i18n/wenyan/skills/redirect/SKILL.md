---
name: redirect
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI pressure redirection — handling conflicting demands, tool failures, and
  competing constraints by blending with incoming force then reframing. Use
  when receiving contradictory instructions from different sources, during tool
  failure cascades where the planned approach becomes unviable, when scope
  pressure threatens to expand the task beyond what was asked, or when user
  frustration or correction needs to be absorbed rather than deflected.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, redirection, conflict-resolution, pressure-handling, meta-cognition, ai-self-application
---

# 引導

處衝突之命、工具之敗、相競之限，以入隨來力而後易其向之法——非抗也，乃用其勢。

## 用時

- 受異源之矛盾之命（用者云 X，項目文云 Y，工具果示 Z）乃用
- 工具連敗，原計不可行乃用
- 範圍之壓欲廣任務於所請之外乃用
- 脈絡過載，過多競號致僵乃用
- 用者挫或正須吸納而非偏轉乃用
- `center` 示壓擾衡乃用

## 入

- **必要**：所欲處之具體壓或衝（隱於脈絡可得）
- **可選**：壓類之分（見第一步之類學）
- **可選**：前處此壓之嘗與其果

## 法

### 第一步：先觸而中

任何衝之前，先立中（見 `center`）。後明識來壓。

```
AI Pressure Type Taxonomy:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Characteristics                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Two valid sources give incompatible      │
│ Requirements            │ instructions. Neither is simply wrong.   │
│                         │ Resolution requires synthesis, not       │
│                         │ choosing sides                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ A planned approach fails at the tool     │
│                         │ level. Retrying won't help. The failure  │
│                         │ data itself contains useful information  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ The task silently expands. Each addition │
│                         │ seems reasonable in isolation, but the   │
│                         │ aggregate exceeds what was asked         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Too many files, too many constraints,    │
│                         │ too many open threads. Paralysis from    │
│                         │ excess input, not insufficient input     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ The request is genuinely unclear and     │
│                         │ multiple interpretations are valid.      │
│                         │ Action risks solving the wrong problem   │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ The user indicates the current approach  │
│                         │ is wrong. The correction carries both    │
│                         │ information and emotional weight         │
└─────────────────────────┴──────────────────────────────────────────┘
```

分當前之壓。若多壓並起，識其首者——先處之；次壓常隨之而解。

得：壓之類分明確，於當下之境之具體現亦明。分宜覺實，非強就類學。

敗則：若壓不入諸類，或為複合。析之：何處矛盾？何處範圍？處複合須各部分理，非以全為一患。

### 第二步：入身——進其勢

*向*問題而動。陳其全範，勿減、勿偏、勿立議解。

1. 全述其壓：何處實衝？何處實敗？何處實含混？
2. 命其後果：若不處此壓，何隨？
3. 識壓所露：工具敗露假設；矛盾露缺脈；範漂露界不明

**試**：若述問題覺寬慰，乃偏轉，非入身。入身須與難全觸。

- 偏：「此二文間有微小不一致也。」
- 入：「CLAUDE.md 述 150 技而錄含 148。或數誤、或錄殘、或二技去而未更其數。下游諸引皆或波及。」

得：問題之全、無畏之述。其述宜使問題覺更實，非更輕。

敗則：若入問題生憂或迫立解，止之。入身乃入，非反應。目在動前明見問題。若不能於同句述問題而不議解，明分之。

### 第三步：轉身——轉而引之

既已入勢，轉之以引向解。各壓類有其特之引。

```
Redirect Patterns by Pressure Type:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Redirect Pattern                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Synthesize underlying intent: both       │
│ Requirements            │ sources serve a purpose. What goal do    │
│                         │ they share? Build from the shared goal,  │
│                         │ not from either source alone              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ Use the failure data: what did the error │
│                         │ reveal about assumptions? The failure is │
│                         │ information. Switch tools or approach,   │
│                         │ incorporating what the failure taught    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ Decompose to essentials: what was the    │
│                         │ original request? What is the minimum    │
│                         │ that satisfies it? Defer additions       │
│                         │ explicitly rather than silently absorbing│
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Triage and sequence: which information   │
│                         │ is needed now vs. later vs. never? Rank  │
│                         │ by relevance to the immediate next step  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ Surface the ambiguity to the user: "I   │
│                         │ see two interpretations — A and B. Which │
│                         │ do you mean?" Do not guess when asking   │
│                         │ is available                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ Absorb the correction fully: what was   │
│                         │ wrong, why was it wrong, what does the   │
│                         │ correct direction look like? Then adjust │
│                         │ without defensiveness or over-apology    │
└─────────────────────────┴──────────────────────────────────────────┘
```

施合宜之引。引宜覺用問題之能而非戰之。

得：壓自礙化向。矛盾化合機。敗化診據。過載化排序之練。

敗則：若引覺強或不解壓，第一步之分或誤。再察：此真矛盾乎，抑一源實陳？此真範漂乎，抑廣範實為用者所需？誤分致誤引。

### 第四步：受身——優雅之恢復

時引敗也。壓真而不能化。受身乃安落之術——承限而不誇難。

1. 誠承其限：「以可得之信息，吾不能解此矛盾」或「此徑被阻，吾未見替」
2. 存所進：摘已成、所學、所餘
3. 告境於用者：患為何、嘗為何、進需何
4. 識恢復之徑：何可解此？多信息？異徑？用者之決？

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

得：優雅之承，存信於用者。用者知所發生、所嘗、所需。無信息失。

敗則：若承限覺敗而非告，記此自尊之號。受身乃技，非弱。誠之「吾困矣」附明請助勝強解致新患。

### 第五步：亂取——多壓並至

若多壓並至（用者正 + 工具敗 + 範問），施亂取之則。

1. **永不僵**：擇一壓而處。任何動勝僵
2. **以壓制壓**：工具敗可解範問（「此功不能此式行，故範自縮」）
3. **壓下用簡技**：若不堪，默用最簡之引——承各壓、以急排序、依序處之
4. **守察**：處一壓時，餘者於周視中。先處最急者，勿失其餘

得：雖多壓而前進。非全壓即解，乃依序處而保進。

敗則：若多壓致僵，明列之，後依急編號。處第一。起即破僵。若諸壓似等急，先擇最簡解之——速勝生勢。

### 第六步：殘心——解後續察

引壓後，察次序之效。

1. 引致新壓乎？（如以擇一釋解矛盾或廢前勞）
2. 引解底需，抑僅解表症？
3. 解穩乎，抑同壓再臨？
4. 記引之形供後參——若此類壓再至，反應可速

得：每引後簡掃次效。多數引清，然致連患者正乃殘心要之處。

敗則：若次效失而後現，乃殘心宜深之號。要引後加簡之「此變何破？」之察。

## 驗

- [ ] 壓已分為具體類，未留含混
- [ ] 入身：問題已陳全範，未減
- [ ] 轉身：引用問題之能而非戰之
- [ ] 若引敗，已施受身（誠承、存進）
- [ ] 多壓並至已依序處，未僵
- [ ] 殘心：引之次效已察

## 陷

- **偏轉而非入身**：減患（「僅小不一致也」）阻有效之引，蓋全勢未觸。先入後引
- **強引不合**：非凡壓皆可立引。有需用者之入、多信息、或唯待。強引致新患
- **受身之自尊**：視承限為己之敗而非信息之交。用者得早知之益，非強解之
- **先處次壓**：多壓時，欲先處易者。覺勤而首壓暗增。處最要之壓，非最舒之壓
- **略中**：未先立中而欲引乃化引為應。中非可選之備——乃有效引之基

## 參

- `aikido` — 此技所映之人之武道；身之合與引之則資認知壓之處
- `center` — 有效引之先決；立穩基以行引
- `awareness` — 早察壓於急引前
- `heal` — 壓致子系統偏移後之深恢復
- `meditate` — 處難壓後清餘聲
