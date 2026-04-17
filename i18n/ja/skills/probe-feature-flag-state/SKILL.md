---
name: probe-feature-flag-state
description: >
  CLIバイナリ内の名前付き機能フラグの実行時状態を検査する。4本の
  証拠プロトコル(バイナリ文字列、ライブ呼び出し、オンディスク状態、
  プラットフォームキャッシュ)、4状態の分類(LIVE / DARK /
  INDETERMINATE / UNKNOWN)、ゲート対イベントの曖昧性解消、論理積
  ゲートの扱い、およびフラグがDARKに見えるが機能が別の手段で
  提供されているスキル代替シナリオを扱う。文書化または推論された
  機能が展開されたかを検証する場合、ダークローンチされた機能を
  監査する場合、または前回の検査結論を新しいバイナリバージョンに
  対して更新する必要がある場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
  locale: ja
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# 機能フラグ状態の検査

出荷済みCLIバイナリ内の名前付き機能フラグがLIVE、DARK、INDETERMINATE、UNKNOWNのいずれであるかを、各状態の主張を具体的な観察と対にする4本の証拠プロトコルを用いて判定する。

## 使用する場面

- ある機能が噂されている、文書化されている、または推論されており、実行中のセッションでゲートが実際に発火するかを検証する必要がある。
- バンドルで出荷されているがゲートオフされているコードであるダークローンチされた機能を監査し、統合計画を責任を持って立てる。
- 前回の検査結論を新しいバイナリバージョンに対して更新する必要がある(フラグが切り替わった、削除された、または論理積に統合された可能性がある)。
- Phase 1(`monitor-binary-version-baselines`)のマーカーを追いかけており、Phase 4のワイヤーキャプチャに進む前に各候補フラグの展開状態を分類する必要がある。
- ユーザー可視の挙動が変化し、フラグの切り替えかコード変更のどちらが要因であったかを知る必要がある。

## 入力

- **必須**: バイナリ内に出現する通りのフラグ名(文字列リテラル形式)。
- **必須**: 読み込んで呼び出せるCLIバイナリまたはバンドルファイル。
- **必須**: ハーネスの通常バックエンドに対する認証済みセッション(自身のアカウント。決して他ユーザーのものではない)。
- **オプション**: バイナリバージョン識別子 — 証拠テーブルが将来の検査と差分可能になるよう強く推奨される。
- **オプション**: 疑わしい共ゲート(このフラグと論理積を構成している可能性のある他のフラグ名)のリスト。
- **オプション**: 差分分析のための、異なるバージョンにおける同じフラグの過去の検査アーティファクト。

## 手順

### Step 1: フラグ名がバイナリ内に存在することを確認する(Prong A — バイナリ文字列)

候補のフラグ名が実際に文字列リテラルとして存在することを確認するためにバンドルから抽出する。これなしでは、後続のすべてのProngは空中を探ることになる。

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

`/tmp/flag-context.txt` を検査し、各出現を以下のいずれかにタグ付けする:

- **gate-call** — ゲート形状の関数の第1引数として出現(`gate("$FLAG", default)`、`isEnabled("$FLAG")`、`flag("$FLAG", ...)`)。
- **telemetry-call** — emit/log/track関数の第1引数として出現。
- **env-var-check** — `process.env.X`(または同等物)の参照に出現。
- **string-table** — 役割が不明確な静的マップまたはレジストリに出現。

**Expected:** バンドル内のフラグ文字列が少なくとも1回出現し、各出現に呼び出し箇所の役割がタグ付けされている。

**On failure:** `grep -c` が0を返す場合、フラグはこのビルドには存在しない。入力名が間違っている(タイプミス、間違った名前空間)か、このバージョンでフラグが削除された。Phase 1のマーカー出力を再確認し、入力を訂正するか、`REMOVED` と分類して停止する。

### Step 2: ゲート、イベント、環境変数を区別する

同じ文字列がゲート、テレメトリイベント名、環境変数、またはそのすべてとして出現することがある。分類は文字列ではなく呼び出し箇所に依存する。テレメトリ名をゲートと勘違いすると、そもそもゲートではなかったものについて意味のない推論(「このゲートはオフであるに違いない」)を生む。

Step 1でタグ付けされた各出現について:

- **gate-call** 出現はこの文字列をLIVE / DARK / INDETERMINATE分類の対象にする。ゲートに渡される**デフォルト値**を記録する(`gate("$FLAG", false)` はフラグをオフにデフォルト設定、`gate("$FLAG", true)` はオンにデフォルト設定)。リテラルのデフォルトとゲート関数名の両方を記録する。
- **telemetry-call** 出現はこの文字列をゲートに**しない**。これは他のゲートが既に通過した後に発火するラベルである。*唯一の*出現がtelemetry-callの場合、その文字列はイベント専用であり、最終分類は `UNKNOWN`(名前は存在するがゲートではない)である。
- **env-var-check** 出現は通常、キルスイッチ(環境変数で無効化されるデフォルトオンの機能)または明示的オプトイン(環境変数で有効化されるデフォルトオフの機能)を示す。極性に注意する — `if (process.env.X) { return null; }` はキルスイッチ。`if (process.env.X) { enable(); }` はオプトインである。
- **string-table** 出現は相互参照が必要 — テーブルが下流でどのように消費されるかを見る。

**Expected:** 各出現について、確定した呼び出し箇所の役割と(gate-callについては)記録されたデフォルト値。

**On failure:** gate-callの周囲のコンテキストがミニファイされすぎてデフォルトを読み取れない場合、grepコンテキストを広げて(`-C 10`)完全な呼び出し先を検査する。それでもデフォルトが判定できない場合、`default=?` として記録し、LIVE/DARKの結論をINDETERMINATEに降格させる。

### Step 3: ライブ呼び出し挙動を観測する(Prong B — 実行時プローブ)

自身が制御する認証済みセッションでハーネスを実行し、ゲートされた機能が表面化するかを観測する。これはシグナルが最も強い単一のProngである: バンドルは何が起こりうるかを述べ、実行時は何が実際に起こるかを示す。

ゲート通過を明らかにするプローブアクションを選ぶ — 典型的にはゲートが守っているユーザー可視の挙動(ツールリストへのツール出現、コマンドフラグの有効化、UI要素の描画、レスポンスへの出力フィールド出現)。

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

次の3つの結果のいずれかを記録する:

- **ゲート通過を観測** — 機能がセッションで表面化した。分類候補: `LIVE`。
- **ゲート通過を観測せず** — 機能が表面化しなかった。分類候補はStep 2のデフォルトに依存する(default-false → `DARK`; default-true → 再確認。これは疑わしい)。
- **ゲート通過がここでは再現できない特定の入力またはコンテキストに依存** — 条件を記録する。分類候補: `INDETERMINATE`。

**Expected:** 記録されたプローブアクション、観測された結果、それが指し示す候補分類。

**On failure:** プローブアクション自体がエラー(認証失敗、ネットワーク到達不能、誤サブコマンド)する場合、今回の実行時Prongは使用不可である。セッションを修正するか別のプローブアクションを選ぶ。実行していない実行時からDARKを推論してはならない。

### Step 4: オンディスク状態を検査する(Prong C — 設定、キャッシュ、セッション)

多くのハーネスはゲート評価やオーバーライド値を再フェッチ不要にするためディスクに永続化する。この状態を検査することで、ハーネスが最終評価時にフラグについて何を信じていたかがわかる。

よくある場所(ハーネスに適応させる — これらは具体的なパスではなく形状):

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

各ヒットのパス、フラグに関連付けられた値、ファイルの最終更新時刻を記録する。最近変更されたキャッシュエントリがバイナリのデフォルトをオーバーライドしている場合、どちらの方向でもこれが可能な限り最強の証拠である。

**Expected:** タイムスタンプ付きの確認済みオーバーライド値、または確認済みの不在(オンディスク状態がこのフラグに言及しない)のいずれか。

**On failure:** フラグへの言及は見つかったが記録された値がキャッシュされたサーバーレスポンスか、ユーザーオーバーライドか、古い値かを判別できない場合、推測するのではなくStep 5(プラットフォームキャッシュ)の調整のためにエントリをフラグ付けする。

### Step 5: プラットフォームフラグサービスキャッシュを検査する(Prong D)

ハーネスが外部の機能フラグサービス(LaunchDarkly、Statsig、GrowthBook、ベンダー内部など)を使用する場合、ローカルにキャッシュされたサービスレスポンスが現在の展開状態の権威ある情報源である。利用可能な場所で検査する。

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

キャッシュされた値、キャッシュタイムスタンプ、そして(存在すれば)キャッシュTTLを記録する。`false` を示すプラットフォームキャッシュは `true` のバイナリデフォルトをオーバーライドする。`true` を示すプラットフォームキャッシュは `false` のバイナリデフォルトをオーバーライドする。

**Expected:** タイムスタンプ付きの確定したキャッシュ値、またはこのハーネスにフラグサービスキャッシュが存在しないことの確認のいずれか。

**On failure:** ハーネスにフラグサービスがないかキャッシュを探し当てられない場合、このProngは何にも寄与しない — それは許容される。証拠テーブルに「Prong D: 適用外」と記す。推測してはならない。

### Step 6: 論理積ゲートを扱う

一部の機能はすべてが真でなければならない複数のフラグによって保護されている: `gate("A") && gate("B") && gate("C")`。いずれか1つがDARKであれば機能はDARKになるが、個別のフラグ分類は依然として各フラグに個別に属する。

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

表面化した各共ゲート文字列について:

- そのフラグについてStep 1–5を繰り返す(それぞれを独自のプローブとして扱う)。
- フラグごとの分類を記録する。
- **機能レベル**の分類を計算する: すべての合接項がLIVEならLIVE。いずれかの合接項がDARKならDARK。DARKの合接項がなく少なくとも1つがINDETERMINATEならINDETERMINATE。

**Expected:** すべての合接項が特定され個別に分類されている。加えて派生的な機能レベルの分類。

**On failure:** 述語がミニファイされすぎてきれいに列挙できない(呼び出し箇所がインライン化されているかラップされている)場合、論理積を「≥1追加ゲート、構造読み取り不能」として記録し、主フラグがLIVEに見えても機能レベルの分類をINDETERMINATEに降格する。

### Step 7: スキル代替を確認する

あるフラグが正当にDARKである一方で、それが解除するはずのユーザー可視機能が、異なる完全にサポートされたルート — 異なるコマンド、ユーザー呼び出し可能なスキル、代替API — から到達可能であることがある。「フラグDARK、機能は代替経由でLIVE」という正直な発見はよくあり重要である。これを見逃すと、ユーザーが実際に持っている機能についてパニック的なダークローンチレポートを生む。

DARKまたはINDETERMINATEの候補分類について、次を問う:

- 同じエンドユーザー成果を提供する、文書化されたユーザー呼び出し可能なコマンド、スラッシュコマンド、またはスキルはあるか?
- 同等のデータを返す代替API面(異なるエンドポイント、異なるツール名)はあるか?
- ハーネスは、ユーザーが同等の機能を自ら組み立てることを可能にするユーザー向け拡張ポイント(プラグイン、カスタムツール、フック)を公開しているか?

いずれかに「はい」であれば、代替ルートとその可観測性(ユーザーがどう到達するか、文書化されているか)を記録する `substitution:` メモを証拠行に追加する。

**Expected:** 各DARK / INDETERMINATE分類について、明示的な代替チェック — ルート、または明示的なメモ「代替ルートは特定されず」のいずれか。

**On failure:** 代替が存在することが疑われるがルートを確認できない場合、どちらかに断定するのではなく「代替の疑いあり。未確認」と記す。

### Step 8: 証拠テーブルと最終分類を組み立てる

4本のProngを1つのテーブルに統合する。各状態主張は、それを裏付ける観察と対にされていなければならない。新しいバージョンで検査を再実行すると差分可能なアーティファクトが生成される。

| Field | Value |
|---|---|
| Flag | `acme_widget_v3` (synthetic placeholder) |
| Binary version | `<version-id>` |
| Probe date | `YYYY-MM-DD` |
| Prong A — strings | present (3 occurrences: 1 gate-call default=`false`, 2 telemetry) |
| Prong B — runtime | gate-pass not observed in capability list |
| Prong C — on-disk | no override found in `~/.config/<harness>/` |
| Prong D — platform cache | service cache absent / not applicable |
| Conjunction | none — single-gate predicate |
| Substitution | user-invokable `widget` slash command delivers equivalent UX |
| **Final state** | **DARK (capability LIVE via substitution)** |

分類ルールを適用する:

- **LIVE** — このセッションで少なくとも1つのProngがゲート通過を観測し、かつ矛盾するProngがない。
- **DARK** — フラグ文字列が存在し、gate-callのデフォルトが `false`、ゲート通過を観測したProngがなく、オーバーライドでオンに反転されていない。
- **INDETERMINATE** — ゲート通過がこの検査で再現できない入力またはコンテキストに依存する、またはゲートのデフォルトが判定できない、または合接項がINDETERMINATEである。
- **UNKNOWN** — 文字列は存在するがゲートとして使用されていない(テレメトリ専用、文字列テーブル専用、環境変数専用のラベル)。

将来の検査が差分を取れるよう、テーブルを検査アーティファクト(例: `probes/<flag>-<version>.md`)として保存する。

**Expected:** すべての4本のProng、論理積の状態、代替の状態、単一の最終分類を網羅した完全な証拠テーブル。

**On failure:** どのProngも使用可能なシグナルを生まない(バイナリが読めない、実行時が起動できない、オンディスクとプラットフォームキャッシュの両方が不在)場合、分類を捏造してはならない。理由「シグナルを生んだProngなし」と共に `INDETERMINATE` を記録して停止する。

## 検証

- [ ] 証拠テーブル内のすべての状態主張が具体的な観察と対になっている(裸の断定はない)。
- [ ] フラグのgate-callデフォルト値が記録されている(または明示的に読み取り不能と注釈されている)。
- [ ] テレメトリイベント出現がゲート証拠として数えられていない。
- [ ] 論理積ゲートがフラグごとの分類**と**機能レベルの分類を持つ。
- [ ] すべてのDARK / INDETERMINATE行に明示的な代替チェックがある。
- [ ] アーティファクトが将来の検査と差分可能になるようバイナリバージョンを記録する。
- [ ] 実際の製品名、バージョンに紐づいた識別子、またはダーク専用フラグ名が、公開を意図したアーティファクトに出現しない(`redact-for-public-disclosure` を参照)。

## よくある落とし穴

- **テレメトリイベントをゲートと混同する**。`emit("$FLAG", ...)` に出現する文字列はラベルであり、ゲートではない。「テレメトリ専用」であるフラグには展開状態がなく、DARKではなくUNKNOWNと分類されるべきである。
- **Prong B(ライブ呼び出し)をスキップする**。静的証拠だけ(バイナリが `default=false` と言う)は実行時証拠(機能が出現しなかった)とは同じではない。バイナリでデフォルトfalseのフラグがサーバー側オーバーライドでtrueに反転される可能性がある。セッションが実際に何を得たかを示すのは実行時プローブだけである。
- **論理積を見逃す**。単一の出現が `default=true` を示していても、周囲の `&& gate("B") && gate("C")` を無視して主フラグをLIVEと分類すると、実際にはBまたはCでゲートされた機能について誤って自信のあるLIVEを生む。
- **代替チェックなしでDARKを宣言する**。多くのDARKフラグは真に到達不能だが、多くの他にはサポートされたユーザー呼び出し可能なルートがある。代替チェックこそが「警戒すべきダークローンチ」を「正直な発見」に変える。
- **古いバイナリバージョンを検査する**。バージョンスタンプのない検査アーティファクトは使い物にならない — 現状を反映しているのか前四半期の状態なのか判別できない。常にバージョンを記録し、将来の検査をアーティファクトと差分比較する。
- **確認のためにゲートを有効化する**。フラグをテストするために反転させることは、このスキルの一部ではない。一部のダークゲートは安全上の理由でオフである(機能が不完全、規制上の保留、移行未完了)。文書化する。決して迂回しない。
- **他ユーザーの状態を捕捉する**。Prong CとProng Dは*自身の*オンディスク状態と*自身の*キャッシュを検査する。他ユーザーのキャッシュを読むことは持ち出しであり、範囲外である。
- **INDETERMINATEを失敗として扱う**。そうではない — 証拠が部分的な場合の正直な分類である。レポートを決定的に見せるためにINDETERMINATEの結果をLIVEまたはDARKに押し込むのは、誤りに至る最速の道である。

## 関連スキル

- `monitor-binary-version-baselines` — 親ガイドのPhase 1。このスキルが構築するマーカー追跡が候補フラグインベントリを供給する。
- `conduct-empirical-wire-capture` — Phase 4。Prong Bの表面レベルプローブが不十分な場合、より深い実行時証拠(ネットワークキャプチャ、ライフサイクルフック)を提供する。
- `security-audit-codebase` — ダークローンチされたコードは攻撃面考古学の一部である。このスキルはその監査の発見側である。
- `redact-for-public-disclosure` — Phase 5。どの検査アーティファクトがプライベートワークスペースを離れられるかを決定するリダクト規律。
