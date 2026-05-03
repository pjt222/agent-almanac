---
name: choose-loop-wakeup-interval
description: >
  Select a `delaySeconds` value when scheduling a loop wakeup via the
  `ScheduleWakeup` tool or the `/loop` slash command. Covers the three-tier
  cache-aware decision (cache-warm under 5 minutes, cache-miss 5 minutes to
  1 hour, idle default 20 to 30 minutes), the 300-second anti-pattern, the
  [60, 3600] runtime clamp, the minute-boundary rounding quirk, and writing
  a telemetry-worthy `reason` field. Use when designing an autonomous loop,
  when a heartbeat cadence is being planned, when polling cadence is being
  tuned, or when post-hoc review of loop costs reveals interval mis-sizing.
license: MIT
allowed-tools: ""
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: loop, wakeup, cache, scheduling, delay, decision
  locale: ja
  source_locale: en
  source_commit: 9c546edf
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Choose Loop Wakeup Interval

`ScheduleWakeup` の `delaySeconds` 値を、プロンプトキャッシュの 5 分 TTL、スケジューラの分単位の粒度、`[60, 3600]` のランタイムクランプを尊重して選ぶ。決定は構造的に自明ではない: 「だいたい5分待とう」という共通の直感は最悪の領域に落ちる — キャッシュミスのコストを払いながら待ちを償却できない。

その推論は `ScheduleWakeup` ツールの説明と共にツール呼び出し時に運ばれるが、その時点ではループはすでにスケジュールされている。本スキルはその推論を、それが属する計画時間へと引き上げる。

## 使用タイミング

- 自律的な `/loop` または `ScheduleWakeup` 駆動の継続を設計し、ティックあたりの遅延を選ぶとき
- ポーリング、監視、反復を行う長時間実行エージェントのハートビート周期を計画するとき
- コストやキャッシュ温度の圧力に対してポーリング周期をチューニングするとき
- ループコストを事後レビューし、間隔のミスサイジングを発見するとき
- `delaySeconds` の選択を含むガイド、ランブック、実例を執筆するとき

## 入力

- **必須**: ループが何を待っているか（特定のイベント、状態遷移、アイドルティック、定期チェック）
- **必須**: このティックの読み手が新鮮な文脈（cache-warm）を必要とするか、コールド再読込（cache-miss 許容）に耐えうるか
- **任意**: 待機イベントが起こりうる最早時刻に関する既知の下限（例: 「ビルドは少なくとも4分かかる」）
- **任意**: ループ全体のコスト天井（ティック数 × ティックあたりコスト）

## 手順

### ステップ1: 待機を分類する

待機がどの階層に属するかを決める:

- **アクティブ監視 (cache-warm)**: 何かが次の5分以内に変化することが予想される — 完了に近いビルド、ポーリングされる状態遷移、たった今キックオフされたプロセス
- **Cache-miss 待機**: 5分以内に確認する価値のあるものはない; 文脈キャッシュは冷め、それは許容できる
- **アイドル**: 監視する具体的な信号はない; ループは何かを見つけるかもしれないという理由でチェックしているのであり、見つけるからではない

**期待結果：** 明確な分類: active-watch、cache-miss、idle のいずれか。

**失敗時：** 待機が分類できない場合 — 「私は何を待っているのか？」に正直な答えがない場合 — そのループはおそらく存在すべきではない。ステップ5へ飛び、wakeup を全くスケジュールしないことを検討する。

### ステップ2: 三層決定を適用する

分類に基づいて `delaySeconds` を選ぶ:

| Tier | Range | Cache behaviour | Use when |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | Cache stays warm (under 5-minute TTL) | Active watch — the next tick needs fast, cheap re-entry |
| Cache-miss | **1200 – 3600 s** | Cache goes cold; one miss buys a long wait | Genuinely idle, or the awaited event cannot happen sooner |
| Idle default | **1200 – 1800 s** (20–30 min) | Cache goes cold | No specific signal; periodic check with user able to interrupt |

**300 s を選ばない。** これは最悪の間隔: キャッシュはミスし、しかも待機がミスを償却するには短すぎる。「だいたい5分」を取りたくなったら、270 s に下げる（warm のまま）か、1200 s+ にコミットする（ミスを償却する）。

**期待結果：** 三層のいずれかから選ばれた具体的な `delaySeconds` 値、習慣的に選ばれた切りのよい分単位値ではないもの。

**失敗時：** 選択がいつも 300 s に落ちるなら、根底の問いは普通「このループはこの周期で存在すべきか？」である — ステップ1を再検討する。

### ステップ3: 分境界に合わせてサイジングする

スケジューラは整数分の境界で発火する。`delaySeconds` が `N` だと実際の遅延は分のどの秒に呼んだかに依って `N` から `N + 60` 秒となる。

実例:

> `HH:MM:40` で `ScheduleWakeup({delaySeconds: 90})` を呼ぶと、ターゲットは `HH:(MM+2):00` — つまり実際の待機は 90 s ではなく 140 s。

帰結: 分未満の意図は無意味。渡す値は精密スケジュールではなく **最小値** として扱う。1分のずれが問題になるなら、ループ周期はこの機構には厳しすぎる。

**期待結果：** 実際の待機が要求した `delaySeconds` より最大 60 秒長くなることを受け入れている。cache-warm ティックではこれは重要 — 270 s が実際には ~330 s になり cache-miss 領域に転がりうる。

**失敗時：** 上限近くの値（例: cache-warm を狙って 265 s）が一般的なら、下方にパディングする — 最悪ケースの分境界ずれの下でも cache-warm 保証を維持するため、270 s ではなく 240 s を使う。

### ステップ4: クランプを尊重する

ランタイムは `delaySeconds` を `[60, 3600]` にクランプする — 範囲外の値は静かに調整される。テレメトリはモデルが要求したもの（`chosen_delay_seconds`）と実際にスケジュールされたもの（`clamped_delay_seconds`）を区別し、不一致時は `was_clamped: true` をセットする。

要求値ではなくクランプ値に対して計画する:

- 60 未満の要求 → 実際の待機は 60 s + 分境界ずれ（実際には最大 120 s）
- 3600 超の要求 → 実際の待機は 3600 s（1時間）
- 天井を延ばすランタイムはない; 数時間の待機には複数ティックが必要

**期待結果：** 選んだ値が `[60, 3600]` の中にあるか、もしくはクランプ挙動を意図的に受け入れている。

**失敗時：** 真に数時間（例: 「4時間後に起こせ」）が必要なら、wakeup を連鎖させる — 自身を再スケジュールする 3600 s ティック — か、cron ベースのループ（`CronCreate` with `kind: "loop"`）を代わりに使う。

### ステップ5: 具体的な `reason` を書く

`reason` フィールドはテレメトリ、ユーザー可視ステータス、プロンプトキャッシュ温度推論を一行に兼ねる。200 文字に切られる。具体的にする。

- 良: `checking long bun build`、`polling for EC2 instance running-state`、`idle heartbeat — watching the feed`
- 悪: `waiting`、`loop`、`next tick`、`continuing`

このフィールドの読み手は、あなたの周期を事前に予測することなくループが何をしているかを理解しようとするユーザー。彼らに向けて書く。

**期待結果：** ステータスをちらと見るユーザーに意味の通る、具体的な一句の理由。

**失敗時：** 具体的な理由を述べられないなら、ループが存在すべきかを再検討する（ステップ1とステップ6）。

### ステップ6: ループしないケースを認識する

すべての「後で戻ってこよう」という衝動がスケジュール wakeup に値するわけではない。次の場合はティックをスケジュール **しない**:

- ユーザーが能動的に見ている — タイマーではなく彼らの入力が正しいトリガー
- 収束基準がない — ループに「完了」の定義がない
- タスクが対話的（ティックの間にユーザーに質問する）
- 必要な周期がクランプ下限（60 s）より短い — それほど厳しいポーリングはループではなくイベント駆動機構に属する

**期待結果：** wakeup をスケジュールするか全くループしないかの意識的な選択。「できるから」はループする理由ではない。

**失敗時：** 発火前にユーザーが割り込む wakeup を繰り返しスケジュールしているなら、間隔ではなくパターンが間違っている。

## バリデーション

- [ ] 待機が active-watch、cache-miss、idle のいずれかに分類された（三つのうち一つ）
- [ ] 選ばれた `delaySeconds` が三層範囲のいずれか（60–270、1200–3600、idle なら 1200–1800）に入る
- [ ] 値が 300 ではない（最悪領域）
- [ ] 値が `[60, 3600]` の中、もしくはクランプ挙動が明示的に受け入れられている
- [ ] 分境界ずれが考慮されている（値を最小値として扱う）
- [ ] `reason` が具体的で 200 文字未満
- [ ] don't-loop チェックが行われた — wakeup が実際に正当化されている

## よくある落とし穴

- **切りの良い分の既定 (300 s)**: 最も一般的な誤り。「だいたい5分」は自然に感じられ、しかも全く誤り。270 s に下げるか 1200 s+ にコミットする。
- **分境界ずれを無視する**: 分の終わり近くで 60 s を要求すると実際の遅延は ~120 s になりうる。cache-warm ティックでは予想外に 5 分 TTL を超えうる。
- **分未満の精度を追う**: スケジューラは分単位の粒度を持つ。85 s vs 90 s vs 95 s を尋ねるのはノイズ — 値を選んで進む。
- **不透明な `reason` フィールド**: `"waiting"` はユーザーに何も伝えず、テレメトリの有用性も下げる。理由はステータスラインで読まれるかのように書く。
- **不要なループを正当化するために本スキルを使う**: 「私は何を見ているのか？」への正直な答えが曖昧なら、どんな間隔の選択も助けにならない — そのループは存在すべきでない。
- **プロンプトでの手動クランプ**: モデルの推論内でクランプしない（「念のため 3600 を上限に」）。ランタイムがクランプする。任せる。
- **7 日エイジアウトを忘れる**: 動的ループは既定で 7 日後にリープされる（ユーザー設定で最大 30 日）。長時間実行ループは天井に対するレースではなく、その天井よりかなり前に終わるよう設計すべき。

## 例

### 例1 — Cache-warm アクティブ監視

`bun build` がキックオフされ、エージェントは結果到着時にキャッシュがまだ warm なように素早く確認したい。

- 分類: アクティブ監視（ステップ1）
- 階層: cache-warm（ステップ2）、**240 s** を選ぶ
- 分境界（ステップ3）: 最悪ケースの実際の待機 ~300 s — 60 s バッファで 5 分 TTL の下に収まる
- 理由（ステップ5）: `checking long bun build`

### 例2 — アイドルハートビート

自律エージェントが、行動に値するものを求めて低ボリュームのフィードを 1 時間に 1 回監視する。

- 分類: アイドル（ステップ1）
- 階層: アイドル既定（ステップ2）、**1800 s**（30 分）を選ぶ
- 分境界（ステップ3）: 無関係 — 60 s のずれはこの周期では無視できる
- 理由（ステップ5）: `idle heartbeat — watching the feed`

### 例3 — アンチパターン

エージェントがリモート API のリトライ中に「5分待ち」たい。要求は 300 s。

- 問題: キャッシュは 5 分で冷めるので 300 s はミスを払う — しかし 300 s はミスを償却するには短すぎる
- 修正: 270 s に下げる（warm のまま）か 1500 s にコミットする（ミスを償却する）。300 を選ばない。

## 関連スキル

- `manage-token-budget` — 長期エージェントループのコスト天井; キャッシュ意識サイジングは一つのレバー
- `du-dum` — 観察/行為の分離パターン; 本スキルはループが cron なしのときの観察クロック間隔をサイジングする
- `read-continue-here` — セッション越しの引き継ぎ; 本スキルはセッション内の wakeup を扱う
- `write-continue-here` — `read-continue-here` の補完
