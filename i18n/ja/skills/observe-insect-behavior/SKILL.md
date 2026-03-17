---
name: observe-insect-behavior
description: >
  サンプリングプロトコル、エソグラムカテゴリ、イベント記録、インタラクション
  ロギング、環境コンテキスト、サマリー分析を使用した構造化された昆虫行動観察の
  実施。焦点個体サンプリング、スキャンサンプリング、全事象サンプリング、瞬間
  サンプリング方法を網羅する。移動、採餌、グルーミング、繁殖、防御、コミュニ
  ケーション、休息カテゴリを含む標準昆虫エソグラムを定義する。タイムスタンプ付き
  イベント記録、種内・種間インタラクションロギング、環境共変量の文書化、時間
  配分分析を含む。生態学的研究のために昆虫行動を研究する時、種の行動レパートリー
  を文書化する時、花粉媒介者の活動や捕食-被食関係を観察する時、または行動データ
  で保全評価を支援する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, behavior, ethology, observation, ecology
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 昆虫行動の観察

標準化されたサンプリングプロトコル、エソグラム、定量的記録方法を使用して構造化された昆虫行動観察を実施する。

## 使用タイミング

- 生態学的または昆虫学的研究のために昆虫の行動を研究している時
- サイトにおける種の行動レパートリーを文書化したい時
- 開花植物上の花粉媒介者の活動を観察している時
- 捕食-被食のインタラクションまたは寄生蜂の行動を文書化している時
- 保全または管理の意思決定を支援する行動データが必要な時
- 構造化されたフィールド実践を通じて行動学的スキルを構築している時

## 入力

- **必須**: 観察対象の焦点昆虫または昆虫集団
- **必須**: 計時デバイス（時計、電話、またはストップウォッチ）
- **必須**: 記録方法（ノート、ボイスレコーダー、またはデータ入力デバイス）
- **任意**: ハンドレンズ（10倍）近接行動観察用
- **任意**: 双眼鏡（遠距離での昆虫観察用、例: パトロール中のトンボ）
- **任意**: 行動イベントの動画記録用カメラ
- **任意**: 環境データ用の温度計、湿度計、または気象ステーション
- **任意**: 印刷済みデータシートまたはエソグラムテンプレート

## 手順

### ステップ1: サンプリングプロトコルの選択

研究上の質問と対象昆虫の行動に合ったプロトコルを選択する。各プロトコルには特定の強みとバイアスがある。

```
Sampling Protocols:
+--------------------+------------------------------------------+
| Protocol           | Description and Best Use                 |
+--------------------+------------------------------------------+
| Focal animal       | Follow one individual continuously for   |
| sampling           | a fixed time period. Record all          |
|                    | behaviors as they occur.                 |
|                    | Best for: detailed behavioral sequences, |
|                    | time budgets, individual-level data.     |
|                    | Duration: 5-30 minutes per focal bout.   |
|                    | Bias: loses data when individual moves   |
|                    | out of sight.                            |
+--------------------+------------------------------------------+
| Scan sampling      | At fixed intervals (e.g., every 60       |
|                    | seconds), quickly scan all visible       |
|                    | individuals and record what each is      |
|                    | doing at that instant.                   |
|                    | Best for: group-level behavior, activity |
|                    | proportions, social insects.             |
|                    | Bias: misses rare or brief behaviors.    |
+--------------------+------------------------------------------+
| All-occurrences    | Record every instance of a specific      |
| sampling           | behavior (e.g., every flower visit,      |
|                    | every aggressive encounter) within a     |
|                    | defined area and time.                   |
|                    | Best for: rare but conspicuous events,   |
|                    | interaction rates, pollinator visits.    |
|                    | Bias: misses simultaneous events.        |
+--------------------+------------------------------------------+
| Instantaneous      | At fixed intervals, record the behavior  |
| (point) sampling   | of one focal individual at that exact    |
|                    | instant. Often combined with focal       |
|                    | animal sampling.                         |
|                    | Best for: time budget calculation with   |
|                    | statistical rigor.                       |
|                    | Bias: misses brief behaviors between     |
|                    | sample points.                           |
+--------------------+------------------------------------------+

Choosing a Protocol:
- "I want to know everything one individual does" → focal animal
- "I want to know what a group is doing right now" → scan
- "I want to count how often a specific event happens" → all-occurrences
- "I want statistically rigorous time budgets" → instantaneous
```

**期待結果:** 研究上の質問、対象分類群、フィールド条件に基づいて選択・正当化されたサンプリングプロトコル。観察開始前に記録間隔または焦点個体観察時間が定義されていること。

**失敗時:** 対象昆虫が焦点個体サンプリングには動きが速すぎる場合（例: 高速で飛ぶトンボ）、特定のイベント（縄張り追跡、止まり木への帰還）に焦点を当てた全事象サンプリングに切り替える。焦点サンプリングのために個体を区別できない場合、グループのスキャンサンプリングを使用する。観察を放棄するのではなく、実行可能なものにプロトコルを適応する。

### ステップ2: エソグラムの定義

エソグラムは記録するすべての行動のカタログである。フィールドでカテゴリを即興しないよう、観察開始前に定義する。

```
Standard Insect Ethogram:
+--------------------+------------------------------------------+
| Category           | Behavioral States and Events             |
+--------------------+------------------------------------------+
| Locomotion         | Walking, running, flying (straight,      |
|                    | hovering, patrolling, pursuit), jumping, |
|                    | crawling, climbing, burrowing, swimming  |
+--------------------+------------------------------------------+
| Feeding            | Probing (flower, substrate), chewing     |
|                    | (leaf, prey), sucking (phloem, blood,    |
|                    | nectar), lapping, regurgitating, filter  |
|                    | feeding (aquatic larvae)                 |
+--------------------+------------------------------------------+
| Grooming           | Leg rubbing (cleaning antennae with      |
|                    | front legs), wing cleaning, body         |
|                    | brushing, proboscis extension/retraction |
+--------------------+------------------------------------------+
| Reproduction       | Courtship display, copulation attempt,   |
|                    | copulation, mate guarding, oviposition   |
|                    | (egg-laying), nest construction          |
+--------------------+------------------------------------------+
| Defense            | Fleeing, dropping (thanatosis/death      |
|                    | feigning), startle display (wing flash), |
|                    | stinging, biting, chemical release       |
|                    | (spraying, bleeding), aggregation        |
+--------------------+------------------------------------------+
| Communication      | Stridulation (sound production),         |
|                    | pheromone release (wing fanning, gland   |
|                    | exposure), visual signaling (wing        |
|                    | display, bioluminescence), vibrational   |
|                    | signaling (substrate drumming)           |
+--------------------+------------------------------------------+
| Rest               | Stationary with no visible activity,     |
|                    | basking (thermoregulation in sun),       |
|                    | roosting, sheltering                     |
+--------------------+------------------------------------------+

Modifiers (append to any category):
- Substrate: on leaf, on flower, on bark, on ground, on water, in flight
- Orientation: upward, downward, horizontal, head-into-wind
- Intensity: low (slow, intermittent), medium, high (rapid, sustained)
```

**期待結果:** 観察開始前に対象分類群に対する完全なエソグラムが定義されていること。カテゴリは相互排他的（どの行動もちょうど1つのカテゴリに適合する）かつ網羅的（観察されたすべての行動が分類可能）であるべきである。

**失敗時:** エソグラムに当てはまらない予期しない行動が発生した場合、そのまま記録する（例:「静止中の急速な翼振動、定義されたカテゴリに一致しない」）、観察後のエソグラム改訂で新しいカテゴリを追加する。新規の行動を不適切なカテゴリに無理に当てはめない。

### ステップ3: タイムスタンプ付き行動イベントの記録

観察を開始し、各行動イベントまたは状態変化を正確なタイミングで記録する。

```
Recording Format:

Continuous recording (focal animal):
  Time    | Behavior         | Substrate   | Notes
  --------+------------------+-------------+------------------
  00:00   | Rest             | Leaf (upper)| Dorsal basking
  00:45   | Grooming         | Leaf (upper)| Front legs cleaning antennae
  01:12   | Walking          | Leaf (upper)| Toward leaf edge
  01:30   | Flying           | In flight   | Short flight, 2m
  01:35   | Landing          | Flower head | Tarsi gripping petals
  01:40   | Feeding (nectar) | Flower head | Proboscis extended
  03:15   | Flying           | In flight   | Left observation area
  03:15   | END — focal lost |             | Duration: 3 min 15 sec

Instantaneous recording (at 30-second intervals):
  Time    | Behavior         | Substrate
  --------+------------------+-------------
  00:00   | Rest             | Leaf
  00:30   | Rest             | Leaf
  01:00   | Feeding          | Flower
  01:30   | Feeding          | Flower
  02:00   | Grooming         | Flower
  02:30   | Flying           | In flight

Rules:
- Start the timer before observing; record time to nearest second
  for continuous, to nearest interval for instantaneous
- Record state changes immediately — do not wait for the next interval
  in continuous recording
- If behavior is ambiguous, record what you see, not what you interpret
  (e.g., "rapid wing vibration" not "aggression")
- Note when focal individual is lost and reason (flew away, obscured)
```

**期待結果:** 観察期間全体をカバーする、タイムスタンプ付きの連続的またはインターバルベースの行動イベント記録。

**失敗時:** 観察中に焦点個体を見失った場合、時刻と理由を記録する。戻ってきた場合、記録を再開する。戻らない場合、部分的な記録もまだ有効なデータである — 実際の観察時間を記録する。スキャンサンプリングでは、スキャンの瞬間に一部の個体が見えない場合、見えるものだけを記録し、スコアできなかった個体数を記録する。

### ステップ4: インタラクションの記録

焦点昆虫と他の生物間のすべてのインタラクションを記録する。インタラクションは2つ以上の個体を含む行動イベントである。

```
Interaction Recording Format:
  Time  | Focal behavior  | Partner(s)       | Partner behavior | Outcome
  ------+-----------------+------------------+------------------+----------
  02:10 | Chase (flying)  | Conspecific male  | Fleeing          | Focal won
  04:30 | Feeding (flower)| Honey bee         | Approaching      | Focal left
  06:15 | Death feigning  | Spider (Salticid) | Stalking         | Spider left

Interaction Types:
+--------------------+------------------------------------------+
| Type               | Examples                                 |
+--------------------+------------------------------------------+
| Intraspecific      | Territorial defense, courtship, mate     |
| (same species)     | competition, dominance, aggregation,     |
|                    | cooperation (social insects)             |
+--------------------+------------------------------------------+
| Predation          | Focal insect capturing prey, or focal    |
|                    | insect being attacked by predator        |
+--------------------+------------------------------------------+
| Parasitism         | Parasitoid ovipositing on/in focal; fly  |
|                    | or mite parasitizing focal               |
+--------------------+------------------------------------------+
| Mutualism          | Pollination (insect-plant), ant-aphid    |
|                    | tending, mycangial fungi transport       |
+--------------------+------------------------------------------+
| Competition        | Displacement from food source,           |
| (interspecific)    | interference at nest site                |
+--------------------+------------------------------------------+

For each interaction record:
- Who initiated (focal or partner)
- Duration of the interaction
- Outcome (winner/loser, successful/unsuccessful, mutual withdrawal)
- Distance at which interaction began
```

**期待結果:** すべての観察されたインタラクションが、開始者、パートナーの同定（可能な限り低い分類レベル）、双方の行動、結果と共に記録されていること。

**失敗時:** インタラクションが速すぎて完全に記録できない場合（例: 競合するオスの群れ）、焦点個体の行動に集中し、「複数の同時インタラクション — 詳細は概略」と記録する。パートナーの同定が不明な場合、記述する（例:「小さな黒い膜翅目、約8mm」）。

### ステップ5: 環境コンテキストの記録

環境条件は昆虫の行動に強く影響する。行動データを生態学的コンテキストで解釈できるよう共変量を記録する。

```
Environmental Context Record:
+--------------------+------------------------------------------+
| Variable           | How to Record                            |
+--------------------+------------------------------------------+
| Air temperature    | Thermometer reading at insect height,    |
|                    | in shade. Record at start and end of     |
|                    | observation, and hourly for long sessions|
+--------------------+------------------------------------------+
| Relative humidity  | Hygrometer reading. Particularly         |
|                    | important for small insects sensitive    |
|                    | to desiccation                           |
+--------------------+------------------------------------------+
| Wind speed         | Estimate: calm, light (leaves rustle),   |
|                    | moderate (small branches move), strong   |
|                    | (large branches sway). Anemometer if    |
|                    | available                                |
+--------------------+------------------------------------------+
| Cloud cover        | Estimate in oktas (eighths): 0 = clear,  |
|                    | 4 = half-covered, 8 = overcast          |
+--------------------+------------------------------------------+
| Light intensity    | Full sun, partial shade, full shade, or  |
|                    | lux meter reading if available           |
+--------------------+------------------------------------------+
| Time of day        | Record start and end times. Note         |
|                    | position relative to sunrise/sunset for  |
|                    | crepuscular species                      |
+--------------------+------------------------------------------+
| Substrate temp     | Surface temperature where insect is      |
|                    | resting (IR thermometer if available).   |
|                    | Important for basking behavior           |
+--------------------+------------------------------------------+
| Recent weather     | Rain in past 24 hours, frost, drought    |
|                    | conditions — these affect emergence and  |
|                    | activity levels                          |
+--------------------+------------------------------------------+
```

**期待結果:** 各観察セッションの開始と終了時に環境共変量が記録され、1時間を超えるセッションでは中間読み取りがあること。

**失敗時:** 計器が利用できない場合、温度（「暖かい、約25C」）、湿度（「乾燥」または「多湿」）、風を感覚的手がかりから推定する。概算の環境データは環境データなしよりもはるかに有用である。最低限、時刻、雲量、推定温度を記録する。

### ステップ6: 観察の要約

記録されたデータを分析し、時間配分、行動頻度、観察されたパターンを含む構造化された要約を作成する。

```
Summary Analysis:

1. TIME BUDGET (from focal or instantaneous sampling):
   Calculate the proportion of observation time spent in each
   ethogram category.
   Example:
     Feeding:    45% (13.5 min of 30 min observation)
     Locomotion: 25% (7.5 min)
     Grooming:   12% (3.6 min)
     Rest:       10% (3.0 min)
     Defense:     5% (1.5 min)
     Reproduction:3% (0.9 min)

2. BEHAVIORAL FREQUENCIES (from all-occurrences sampling):
   Count the number of times each event occurred per unit time.
   Example:
     Flower visits: 12 per 30 minutes = 0.4 visits/min
     Territorial chases: 3 per 30 minutes = 0.1 chases/min
     Grooming bouts: 8 per 30 minutes = 0.27 bouts/min

3. INTERACTION SUMMARY:
   Tabulate interactions by type and outcome.
   Example:
     Intraspecific aggressive: 3 (focal won 2, lost 1)
     Interspecific displacement: 2 (focal displaced 1, was displaced 1)
     Predation attempt on focal: 1 (unsuccessful)

4. PATTERNS AND OBSERVATIONS:
   Note any temporal patterns (behavior changes with time of day),
   environmental correlations (activity increases with temperature),
   or unexpected behaviors not previously documented for the species.

5. LIMITATIONS:
   Note observation duration, number of focal bouts, any periods
   when the focal individual was lost, and weather conditions that
   may have affected behavior.
```

**期待結果:** 時間配分または行動頻度（サンプリングプロトコルに応じて）、インタラクションサマリー、観察されたパターン、制限事項の明示的な認識を含む構造化された要約。

**失敗時:** 観察セッションが意味のある時間配分には短すぎる場合（連続データ10分未満）、割合ではなく生のイベントカウントを報告する。短い時間を制限として記録する。短い観察でも正直に報告されれば理解に貢献する — まれな行動（例: 寄生蜂の産卵）を文書化した5分間の観察は、数時間の休息行動よりも価値がある場合がある。

## バリデーション

- [ ] 観察開始前にサンプリングプロトコルが選択・正当化された
- [ ] 相互排他的かつ網羅的なカテゴリを持つエソグラムが定義された
- [ ] 観察中にタイムスタンプ付きで行動イベントが記録された
- [ ] インタラクションが開始者、パートナー、行動、結果と共にログされた
- [ ] 観察の開始と終了時に環境共変量が記録された
- [ ] 時間配分または行動頻度を含む要約分析が作成された
- [ ] 観察の制限事項（時間、焦点個体喪失時間、天候）が記録された

## よくある落とし穴

- **エソグラムなしの開始**: 観察中に行動カテゴリを即興すると一貫性のない記録になる。後で改訂するとしても、最初の観察前にカテゴリを定義する
- **記述の代わりに解釈**: 「葉の縁で大顎が急速に開閉」と記録し、「攻撃的な採餌」とは記録しない。解釈は分析で行い、フィールド記録では行わない。擬人化ラベル（「怒っている」「幸せ」「混乱している」）は行動学データには不適切である
- **観察者疲労**: 連続的な焦点個体サンプリングは認知的に負担が大きい。焦点観察を15-30分に制限し、間に休憩を取る。疲労した観察者はイベントを見逃し記録エラーを犯す
- **対象の妨害**: あなたの存在が行動を変える。距離を保ち、動きを最小限にし、昆虫に影を落とさないようにし、正式な記録開始前に馴化期間（2-5分）を設ける
- **「何も起きていない」の無視**: 休息と不活動は記録すべき有効な行動状態である。時間の60%を休息に費やす昆虫は重要な生態学的発見であり、スキップすべき退屈なデータではない
- **状態とイベントの混同**: 状態は持続時間を持つ（3分間の採餌）。イベントは瞬間的である（1回の翼フラッシュ）。状態は開始時間と終了時間で記録し、イベントは単一のタイムスタンプで記録する。混ぜると一貫性のない時間配分を生む

## 関連スキル

- `document-insect-sighting` — 行動観察の補完として写真、場所、メタデータで目撃を記録する
- `identify-insect` — 観察対象の種を同定する。分類学的コンテキストで行動を解釈するために不可欠
- `collect-preserve-specimens` — 行動が観察された種の同定を確認するための証拠標本を収集する
- `survey-insect-population` — 行動観察を個体群全体にスケールアップし、群集レベルの行動生態学を理解する
