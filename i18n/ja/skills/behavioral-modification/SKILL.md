---
name: behavioral-modification
description: >
  脱感作、拮抗条件付け、環境管理を通じて犬の望ましくない行動に対処する。
  反応性（他の犬、人、音に対する）、分離不安、資源保護、過度の吠え、
  リードの引っ張りをカバーする。体系的な閾値管理による強制なしの方法を使用。
  犬が他の犬、人、刺激に対して反応性を示す時、分離不安が破壊的行動や
  発声を引き起こす時、資源保護が存在する時、過度の吠えやリードの引っ張り
  などの行動が日常生活に支障をきたす時 — 基本的な服従訓練が確立された後に
  使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: animal-training
  complexity: advanced
  language: natural
  tags: animal-training, dog, behavior, reactivity, anxiety, desensitization, counter-conditioning
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 行動修正

脱感作、拮抗条件付け、環境管理を通じて犬の望ましくない行動に対処する。

## 使用タイミング

- 犬が他の犬、人、刺激に対して反応性（突進、吠え、唸り）を示す時
- 分離不安が一人にされた時の破壊的行動、発声、排泄として現れる時
- 資源保護: 犬が食事中やオブジェクトを保持中に近づくと体を硬くする、唸る、噛みつく
- 過度の吠え、ジャンプ、リードの引っ張り、その他日常生活に支障をきたす行動
- 基本的な服従訓練が確立された後 — 行動修正は基礎コマンドの上に構築される

## 入力

- **必須**: 対処する具体的な望ましくない行動（「犬が悪い」ではなく「犬がリードで他の犬に突進する」）
- **必須**: 犬の閾値距離またはトリガーレベル（行動が始まるまでの距離/強度）
- **任意**: 行動の履歴（いつ始まったか、何がトリガーするか、何が悪化させるか）
- **任意**: 軽度のストレス下でも犬が食べる高価値トリーツ
- **任意**: 獣医クリアランス（行動変化の痛みや医学的原因を除外）

## 手順

### ステップ1: 行動の特定と定義

精度が重要 — 曖昧な記述は曖昧な介入につながる。

```
Behavior Analysis (ABC Model):
+-------------+------------------------------------------+
| Component   | Define Specifically                      |
+-------------+------------------------------------------+
| Antecedent  | What happens BEFORE the behavior?        |
| (Trigger)   | e.g., "sees another dog within 30 feet"  |
+-------------+------------------------------------------+
| Behavior    | What EXACTLY does the dog do?             |
|             | e.g., "stiffens, stares, then lunges and |
|             | barks"                                   |
+-------------+------------------------------------------+
| Consequence | What happens AFTER the behavior?          |
|             | e.g., "owner pulls the dog away; the     |
|             | other dog leaves" (behavior is reinforced |
|             | because the trigger goes away)           |
+-------------+------------------------------------------+

Threshold Mapping:
- At what distance/intensity does the dog first notice the trigger? (alert)
- At what distance/intensity does the dog become unable to take treats? (over threshold)
- The working zone is BELOW threshold — where the dog notices but can still think
```

**期待結果:** トリガー、閾値距離、現在の結果パターンが特定された正確な行動定義。

**失敗時:** 行動に一貫したトリガーがないように思える場合、1週間ログを取る: 日付、時間、状況、行動、結果。パターンはしばしば、その瞬間には明らかでなかったものが浮かび上がる。

### ステップ2: 介入戦略の選択

```
Strategy Selection:
+----------------------------+-----------------------------------+-----------------+
| Behavior                   | Primary Strategy                  | Timeline        |
+----------------------------+-----------------------------------+-----------------+
| Reactivity (dogs/people)   | Desensitization + counter-        | 4-12 weeks      |
|                            | conditioning (DS/CC)              |                 |
+----------------------------+-----------------------------------+-----------------+
| Separation anxiety         | Graduated absence protocol +      | 6-16 weeks      |
|                            | management                        |                 |
+----------------------------+-----------------------------------+-----------------+
| Resource guarding          | Trade-up protocol +               | 4-8 weeks       |
|                            | approach desensitization          |                 |
+----------------------------+-----------------------------------+-----------------+
| Excessive barking          | Identify function → teach         | 2-6 weeks       |
|                            | alternative behavior              |                 |
+----------------------------+-----------------------------------+-----------------+
| Leash pulling              | Penalty yards (stop when          | 2-4 weeks       |
|                            | pulling) + reward position        |                 |
+----------------------------+-----------------------------------+-----------------+
```

**期待結果:** 特定された行動に対する具体的な戦略が選択される。

**失敗時:** 行動が重篤な場合（接触を伴う咬傷、極度のパニック、自傷行為）、認定応用動物行動学者（CAAB）または獣医行動学者（DACVB）に紹介する。このスキルは中程度の行動問題をカバーし、臨床ケースはカバーしない。

### ステップ3: 脱感作と拮抗条件付けの実施

反応性と恐怖ベースの行動のためのコアプロトコル。

```
DS/CC Protocol:
1. FIND the threshold: position the dog where the trigger is visible
   but the dog is still calm enough to eat treats

2. MARK and TREAT: trigger appears → mark → treat → treat → treat
   (classical conditioning: trigger predicts good things)

3. CRITERIA: the dog should be:
   - Able to eat treats
   - Ears relaxed or neutral (not pinned forward)
   - Loose body posture
   - Able to look at the trigger and then look back at the handler

4. DECREASE DISTANCE gradually:
   Session 1: 50 feet from trigger
   Session 3: 45 feet
   Session 5: 40 feet
   (Only decrease when the dog is consistently relaxed at current distance)

5. SESSION STRUCTURE:
   - 5-15 minutes maximum
   - 3-5 trigger exposures per session
   - End BEFORE the dog goes over threshold
   - If the dog goes over threshold, increase distance immediately
     and end on a calmer note

6. PROGRESS INDICATORS:
   - Dog looks at trigger, then immediately looks at handler ("check-in")
   - Dog's threshold distance decreases over sessions
   - Recovery time after exposure shortens
   - Dog's body language at threshold becomes more relaxed
```

**期待結果:** 数週間にわたり、犬の閾値距離が減少し、トリガーへの感情的反応が恐怖/攻撃性から中立またはポジティブに変化する。

**失敗時:** 3-4週間の一貫したセッション後に進歩がない場合、再評価する: (1) 閾値以下で作業しているか？ (2) トリーツは十分に高価値か？ (3) トレーニング外でのトリガー露出が頻繁すぎないか（フラッディングはDS/CCを取り消す）？ (4) 専門家への相談を検討する。

### ステップ4: 環境の管理

トレーニングは時間をかけて行動を変える。管理は今すぐリハーサルを防ぐ。

```
Management Strategies:
+----------------------------+------------------------------------------+
| Behavior                   | Management During Training Period        |
+----------------------------+------------------------------------------+
| Dog reactivity             | Walk at off-peak hours; cross the street |
|                            | when another dog approaches; use visual  |
|                            | barriers (parked cars, bushes)           |
+----------------------------+------------------------------------------+
| Separation anxiety         | Do not leave the dog alone beyond their  |
|                            | current tolerance; use daycare, pet      |
|                            | sitter, or take the dog with you         |
+----------------------------+------------------------------------------+
| Resource guarding          | Do not approach while eating; trade up   |
|                            | from a distance; manage access to        |
|                            | high-value items                         |
+----------------------------+------------------------------------------+
| Excessive barking          | Block visual triggers (frosted window    |
|                            | film); provide enrichment; address       |
|                            | underlying cause (boredom, anxiety)      |
+----------------------------+------------------------------------------+

Every rehearsal of the unwanted behavior strengthens it.
Management prevents rehearsal while training builds the new response.
```

**期待結果:** 管理されたトレーニングセッション外で望ましくない行動が練習されていない。

**失敗時:** 管理が不可能な場合（例: すべての犬との遭遇を避けられない）、現実に合わせてトレーニング基準を下げる。環境的露出は避けられない場合もある; トレーニングセッションが十分に強い対抗体験を提供するようにする。

## バリデーション

- [ ] ABCモデルを使用して行動が正確に定義された
- [ ] DS/CC開始前に閾値距離が特定された
- [ ] トレーニングが一貫して閾値以下で実施された
- [ ] トリーツがトリガー存在下で犬が食べるのに十分な高価値だった
- [ ] セッションが5-15分で、犬が閾値を超える前に終了した
- [ ] 環境管理がトレーニング外での行動リハーサルを防いだ
- [ ] 進捗指標（チェックイン、閾値距離の減少）が追跡されている

## よくある落とし穴

- **閾値を超えた作業**: 最も一般的なエラー。犬がトリーツを食べられない場合、近すぎる。後退する
- **一貫性のなさ**: DS/CCは定期的なセッション（最低週3-5回）を必要とする。散発的なトレーニングは散発的な結果を生む
- **フラッディング**: 犬に近距離でトリガーに耐えることを強制しても「慣れさせる」ことにはならない — トラウマを与え、行動を悪化させる
- **罰**: 反応的な犬を矯正する（リーシュポップ、「ダメ」と叫ぶ）は警告シグナルを抑制するが、根本的な感情を増大させる。犬は警告なしに噛むことを学ぶ
- **直線的な進歩の期待**: 行動修正にはプラトーとリグレッションがある。悪いセッションが以前の進歩を消去することはない。ズームアウトして数週間のトレンドを見る
- **医学的原因の無視**: 痛み、甲状腺障害、神経学的問題はすべて行動問題として現れる可能性がある。突然発症した行動変化に対する獣医クリアランスはオプションではない

## 関連スキル

- `basic-obedience` — 行動修正が構築される基礎コマンド; 信頼できるリコールは安全に不可欠
