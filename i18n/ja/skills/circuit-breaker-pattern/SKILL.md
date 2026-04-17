---
name: circuit-breaker-pattern
description: >
  エージェントのツール呼び出しにサーキットブレーカーロジックを実装する — ツールの健全性を追跡し、
  closed/open/half-open 状態間を遷移し、ツールが失敗した際にタスクのスコープを縮小し、
  ケイパビリティマップを通じて代替手段にルーティングし、エラーの蓄積を防ぐための障害バジェットを強制する。
  オーケストレーション（何を試みるかの決定）と実行（ツールの呼び出し）を分離し、エクスペディターパターンに従う。
  信頼性が異なる複数のツールに依存するエージェントを構築する場合、耐障害性のあるエージェントワークフローを設計する場合、
  タスク途中のツール停止から適切に回復する場合、または連鎖的なツール障害に対して既存エージェントを強化する場合に使用する。
locale: ja
source_locale: en
source_commit: b092becc
translator: claude-opus-4-6
translation_date: "2026-03-16"
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: resilience, circuit-breaker, error-handling, graceful-degradation, tool-reliability, fault-tolerance
---

# Circuit Breaker Pattern

ツールが失敗した際のグレースフルデグラデーション。5つのツールを呼び出すエージェントで1つが壊れている場合、全体が失敗するべきではない — 壊れたツールを認識し、それへの呼び出しを止め、残りで達成可能なスコープに縮小し、スキップした内容を誠実に報告するべきだ。このスキルは、分散システムのサーキットブレーカーパターンをエージェントのツールオーケストレーションに適応させ、そのロジックを体系化する。

核心的な洞察（kirapixelads の「Kitchen Fire Problem」より）：エクスペディター（オーケストレーション層）は「料理」をしてはならない。「何を試みるか」と「どのように試みるか」の関心の分離は、オーケストレーターが失敗したツールの再試行ループに囚われることを防ぐ。

## 使用タイミング

- 信頼性が異なる複数のツールに依存するエージェントを構築する場合
- 部分的な結果が完全な失敗より優れているような、耐障害性のあるエージェントワークフローを設計する場合
- エージェントが動作中のツールを使い続ける代わりに、壊れたツールの再試行ループに詰まっている場合
- タスク途中のツール停止から適切に回復する場合
- 連鎖的なツール障害に対して既存エージェントを強化する場合
- 古いキャッシュされたツール出力が最新データとして扱われている場合

## 入力

- **必須**: エージェントが依存するツールのリスト（名前と目的）
- **必須**: エージェントが達成しようとしているタスク
- **任意**: 既知のツール信頼性の問題または過去の障害パターン
- **任意**: 障害閾値（デフォルト：サーキットを開く前に3回連続失敗）
- **任意**: サイクルあたりの障害バジェット（デフォルト：一時停止・報告前に合計5回の失敗）
- **任意**: ハーフオープンプローブ間隔（デフォルト：開いた後3回目の試行ごと）

## 手順

### ステップ1: ケイパビリティマップを構築する

各ツールが何を提供し、どんな代替手段が存在するかを宣言する。このマップはスコープ縮小の基盤 — これがなければ、ツールの失敗はエージェントに次に何をすべきか推測させることになる。

```yaml
capability_map:
  - tool: Grep
    provides: content search across files
    alternatives:
      - tool: Bash
        method: "rg or grep command"
        degradation: "loses Grep's built-in output formatting"
      - tool: Read
        method: "read suspected files directly"
        degradation: "requires knowing which files to check; no broad search"
    fallback: "ask the user which files to examine"

  - tool: Bash
    provides: command execution, build tools, git operations
    alternatives: []
    fallback: "report commands that need to be run manually"

  - tool: Read
    provides: file content inspection
    alternatives:
      - tool: Bash
        method: "cat or head command"
        degradation: "loses line numbering and truncation safety"
    fallback: "ask the user to paste file contents"

  - tool: Write
    provides: file creation
    alternatives:
      - tool: Edit
        method: "create via full-file edit"
        degradation: "requires file to already exist for Edit"
      - tool: Bash
        method: "echo/cat heredoc"
        degradation: "loses Write's atomic file creation"
    fallback: "output file contents for the user to save manually"

  - tool: WebSearch
    provides: external information retrieval
    alternatives: []
    fallback: "state what information is needed; ask user to provide it"
```

各ツールについて以下を記録する：
1. 提供するケイパビリティ（1行）
2. それを部分的にカバーできる代替ツール（デグラデーションのメモ付き）
3. ツール代替が存在しない場合の手動フォールバック

**期待結果：** エージェントが使用するすべてのツールを網羅する完全なケイパビリティマップ。各エントリには、ツール代替がなくてもフォールバックが少なくとも1つある。このマップは通常暗黙的なことを明示的にする：どのツールが重要（代替なし）で、どのツールが代替可能か。

**失敗時：** ツールリストが不明確な場合、スキルのフロントマターの `allowed-tools` から始める。代替が不確かな場合、省略するよりも `degradation: "unknown — test before relying on this route"` とマークする。

### ステップ2: サーキットブレーカーの状態を初期化する

各ツールの状態トラッカーを設定する。すべてのツールは CLOSED 状態（健全、通常動作）で開始する。

```
Circuit Breaker State Table:
+------------+--------+-------------------+------------------+-----------------+
| Tool       | State  | Consecutive Fails | Last Failure     | Last Success    |
+------------+--------+-------------------+------------------+-----------------+
| Grep       | CLOSED | 0                 | —                | —               |
| Bash       | CLOSED | 0                 | —                | —               |
| Read       | CLOSED | 0                 | —                | —               |
| Write      | CLOSED | 0                 | —                | —               |
| Edit       | CLOSED | 0                 | —                | —               |
| WebSearch  | CLOSED | 0                 | —                | —               |
+------------+--------+-------------------+------------------+-----------------+

Failure budget: 0 / 5 consumed
```

**状態の定義：**

- **CLOSED** — ツールは健全。通常どおり使用する。連続失敗を追跡する。
- **OPEN** — ツールは既知の破損状態。呼び出さない。代替にルーティングするかスコープをデグレードする。
- **HALF-OPEN** — ツールは壊れていたが回復した可能性がある。単一のプローブ呼び出しを送信する。成功すれば CLOSED に遷移する。失敗すれば OPEN に戻る。

**状態遷移：**

- CLOSED -> OPEN: 連続失敗が閾値に達した時（デフォルト: 3）
- OPEN -> HALF-OPEN: 設定可能な間隔後（例: 3番目のタスクステップごと）
- HALF-OPEN -> CLOSED: プローブ呼び出し成功時
- HALF-OPEN -> OPEN: プローブ呼び出し失敗時

**期待結果：** すべてのツールに対して CLOSED 状態とゼロの失敗カウントで初期化された状態テーブル。障害閾値とバジェットが明示的に宣言されている。

**失敗時：** ツールリストを事前に列挙できない場合（動的ツール検出）、各ツールの初回使用時に状態を初期化する。パターンはまだ適用される — テーブルを段階的に構築するだけだ。

### ステップ3: 呼び出し・追跡ループを実装する

エージェントがツールを呼び出す必要がある場合、この決定シーケンスに従う。これはエクスペディターロジック — 呼び出しを「どのように実行するか」ではなく「試みるかどうか」を決定する。

```
BEFORE each tool call:
  1. Check tool state in the circuit breaker table
  2. If OPEN:
     a. Check if it is time for a half-open probe
        - Yes → transition to HALF-OPEN, proceed with probe call
        - No  → skip this tool, route to alternative (Step 4)
  3. If HALF-OPEN:
     a. Make one probe call
     b. Success → transition to CLOSED, reset consecutive fails to 0
     c. Failure → transition to OPEN, increment failure budget
  4. If CLOSED:
     a. Make the call normally

AFTER each tool call:
  1. Success:
     - Reset consecutive fails to 0
     - Record last success timestamp
  2. Failure:
     - Increment consecutive fails
     - Record last failure timestamp and error message
     - Increment failure budget consumed
     - If consecutive fails >= threshold:
         transition to OPEN
         log: "Circuit OPENED for [tool]: [failure count] consecutive failures"
     - If failure budget exhausted:
         PAUSE — do not continue the task
         Report to user (Step 6)
```

エクスペディターは失敗した呼び出しを即座に再試行しない。障害を記録し、閾値を確認して、先へ進む。再試行は後のステップでのハーフオープンプローブメカニズムを通じてのみ発生する。

**期待結果：** エージェントがすべてのツール呼び出しの前後に従う明確な決定ループ。ツールの健全性は継続的に追跡される。エクスペディター層は失敗したツールをブロックしない。

**失敗時：** 呼び出し間の状態追跡が実用的でない場合（例: ステートレス実行）、よりシンプルなモデルへのデグレード：合計失敗をカウントしてバジェットで一時停止。3状態のサーキットブレーカーが理想的だが、障害カウンターが最小限の実行可能なパターンだ。

### ステップ4: 開いたサーキットで代替手段にルーティングする

ツールのサーキットが OPEN の場合、ケイパビリティマップ（ステップ1）を参照して最善の利用可能な代替手段にルーティングする。

**ルーティング優先度：**

1. **デグラデーションが低いツール代替** — 類似したケイパビリティを提供する別のツールを使用する。タスク出力でデグラデーションをメモする。
2. **デグラデーションが高いツール代替** — ケイパビリティが大幅に失われる別のツールを使用する。結果から何が欠けているかを明示的にラベル付けする。
3. **手動フォールバック** — エージェントが何をできないか、ユーザーが提供する必要のある情報やアクションを報告する。
4. **スコープ縮小** — 代替が存在せずフォールバックも実行可能でない場合、依存するサブタスクをスコープから完全に削除する（ステップ5）。

```
Example routing decision:

Tool needed: Grep (circuit OPEN)
Task: find all files containing "API_KEY"

Route 1: Bash with rg command
  → Degradation: loses Grep's built-in formatting
  → Decision: ACCEPTABLE — use this route

If Bash also OPEN:
Route 2: Read suspected config files directly
  → Degradation: requires guessing which files; no broad search
  → Decision: PARTIAL — try known config paths only

If Read also OPEN:
Route 3: Ask user
  → "I need to find files containing 'API_KEY' but my search
     tools are unavailable. Can you run: grep -r 'API_KEY' ."
  → Decision: FALLBACK — user provides the information

If user unavailable:
Route 4: Scope reduction
  → Remove "find API key references" from task scope
  → Document: "SKIPPED: API key search — no tools available"
```

**期待結果：** ツールサーキットが開いた場合、エージェントは透明に代替手段にルーティングするかスコープをデグレードする。ルーティングの決定と任意のデグラデーションはタスク出力に記録され、ユーザーは何が影響を受けたかを知る。

**失敗時：** ケイパビリティマップが不完全な場合（代替がリストされていない）、デフォルトでスコープ縮小して報告する。作業をサイレントにスキップしない — 何をスキップしたか、なぜかを常に記録する。

### ステップ5: 達成可能な作業にスコープを縮小する

ツールがオープンサーキットで代替手段が尽きた場合、動作中のツールで達成可能な作業にタスクを縮小する。これは失敗ではない — 誠実なスコープ管理だ。

**スコープ縮小プロトコル：**

1. 残りのサブタスクをリストアップ
2. 各サブタスクについて必要なツールを確認
3. すべての必要なツールが CLOSED または実行可能な代替がある場合：サブタスクを保持
4. いずれかの必要なツールが代替なしで OPEN の場合：サブタスクを DEFERRED とマーク
5. 縮小されたスコープで続行
6. 終了時に延期されたサブタスクを報告

```
Scope Reduction Report:

Original scope: 5 sub-tasks
  [x] 1. Read configuration files          (Read: CLOSED)
  [x] 2. Search for deprecated patterns    (Grep: CLOSED)
  [ ] 3. Run test suite                    (Bash: OPEN — no alternative)
  [x] 4. Update documentation             (Edit: CLOSED)
  [ ] 5. Deploy to staging                 (Bash: OPEN — no alternative)

Reduced scope: 3 sub-tasks achievable
Deferred: 2 sub-tasks require Bash (circuit OPEN)

Recommendation: Complete sub-tasks 1, 2, 4 now.
Sub-tasks 3 and 5 require Bash — will probe on next cycle
or user can run commands manually.
```

延期されたサブタスクを試みてはならない。うまくいくことを期待してオープンサーキットのツールを再試行してはならない。サーキットブレーカーはまさにこれを防ぐために存在する — その状態を信頼する。

**期待結果：** タスクが達成可能な作業と延期された作業に明確に分割される。エージェントはすべての達成可能な作業を完了し、延期された項目をその理由と何がブロックを解除するかとともに報告する。

**失敗時：** スコープ縮小がすべてのサブタスクを削除する場合（すべてのツールが壊れている）、ステップ6に直接スキップ — 一時停止して報告する。作業中のツールがないエージェントは進捗を上げているふりをしてはならない。

### ステップ6: 古さを処理してデータ品質をラベル付けする

ツールが古い可能性のあるデータ（キャッシュされた結果、古いスナップショット、以前に取得したコンテンツ）を返す場合、最新として扱うのではなく明示的にラベル付けする。

**古さの指標：**

- ツール出力が以前の呼び出しと完全に一致する（キャッシュヒットの可能性）
- データが現在のタスクより古いタイムスタンプを参照している
- ツールのドキュメントにキャッシュ動作について言及がある
- 結果が他の最近の観察と矛盾している

**ラベル付けプロトコル：**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

古いデータを最新として黙ってユーザーに提示してはならない。ユーザーまたは下流のエージェントは健全な判断を下すためにデータ品質を知る必要がある。

**期待結果：** 古い可能性のあるすべてのツール出力には明示的なラベルが付いている。最新データにはラベルが付かない（ラベル付けは確認ではなく不確実性のために予約されている）。

**失敗時：** 古さを判断できない場合（タイムスタンプなし、比較ベースラインなし）、不確実性をメモする：「[FRESHNESS UNKNOWN — no baseline for comparison]」。鮮度についての不確実性それ自体が情報だ。

### ステップ7: 障害バジェットを強制する

すべてのツールにわたる合計失敗を追跡する。バジェットが尽きた場合、エージェントはエラーを蓄積し続けるのではなく一時停止して報告する。

```
Failure Budget Enforcement:

Budget: 5 failures per cycle
Current: 4 / 5 consumed

  Failure 1: Bash — "permission denied" (step 3)
  Failure 2: Bash — "command not found" (step 3)
  Failure 3: Bash — "timeout after 120s" (step 4)
  Failure 4: WebSearch — "connection refused" (step 5)

Status: 1 failure remaining before mandatory pause

→ Next tool call proceeds with heightened caution
→ If it fails: PAUSE and generate status report
```

**バジェット枯渇時：**

```
FAILURE BUDGET EXHAUSTED — PAUSING

Completed work:
  - Sub-task 1: Read configuration files (SUCCESS)
  - Sub-task 2: Search for deprecated patterns (SUCCESS)

Incomplete work:
  - Sub-task 3: Run test suite (FAILED — Bash circuit OPEN)
  - Sub-task 4: Update documentation (NOT ATTEMPTED — paused)
  - Sub-task 5: Deploy to staging (NOT ATTEMPTED — paused)

Tool health:
  Grep: CLOSED (healthy)
  Read: CLOSED (healthy)
  Edit: CLOSED (healthy)
  Bash: OPEN (3 consecutive failures — permission/command/timeout)
  WebSearch: OPEN (1 failure — connection refused)

Failures: 5 / 5 budget consumed

Recommendation:
  1. Investigate Bash failures — likely environment issue
  2. Check network connectivity for WebSearch
  3. Resume from sub-task 4 after resolution
```

一時停止・報告は電気システムのサーキットブレーカーと同じ機能を果たす：ダメージの蓄積を防ぐ。壊れたツールを呼び続けるエージェントはコンテキストウィンドウを浪費し、繰り返されるエラーでユーザーを混乱させ、一貫性のない部分的な結果を生成する可能性がある。

**期待結果：** 障害バジェットが尽きた場合、エージェントはクリーンに停止する。レポートには完了した作業、未完了の作業、ツールの健全性、および実行可能な次のステップが含まれる。

**失敗時：** エージェントがクリーンなレポートを生成できない場合（例: 状態追跡が失われた）、利用可能な情報を出力する。部分的なレポートはサイレントな継続よりも優れている。

### ステップ8: 関心の分離 — エクスペディター対エグゼキューター

オーケストレーションロジック（ステップ2〜7）がツール実行から明確に分離されていることを確認する。

**エクスペディター（オーケストレーション）がすること：**
- ツールの健全性状態を追跡する
- ツールを呼び出すか、スキップするか、プローブするかを決定する
- ツールがオープンサーキットの場合に代替手段にルーティングする
- 障害バジェットを強制する
- ステータスレポートを生成する

**エクスペディターがしないこと：**
- 失敗したツール呼び出しを即座に再試行する
- エラーを回避するためにツール呼び出しパラメーターを変更する
- ツールエラーをキャッチして抑制する
- ツールが失敗した理由について推測する
- ツール自体を必要とするフォールバックロジックを実行する

エクスペディターが「料理」（他のツール障害を回避するためにツール呼び出しを行う）している場合、分離が壊れている。エクスペディターは代替ツールにルーティングするかスコープを縮小すべき — 壊れたツールを修正しようとするべきではない。

**期待結果：** オーケストレーションの決定とツール実行の間の明確な境界。エクスペディター層は特定のツール API やエラータイプを参照せずに説明できる。

**失敗時：** オーケストレーションと実行が絡み合っている場合、決定ロジックを各ツール呼び出しの前に実行する別のステップに抽出してリファクタリングする。決定ステップは4つの出力の1つを生成する：CALL、SKIP、PROBE、または PAUSE。実行ステップはその出力に基づいて行動する。

### ステップ9: 連鎖的な障害を検出する

複数のツールがインフラストラクチャ（ネットワーク、ファイルシステム、権限）を共有する場合、単一の根本原因が複数のブレーカーを同時にトリップする可能性がある。各ブレーカーを独立して扱うのではなく、この相関パターンを検出して処理する。

**連鎖的な障害の指標：**

- 同じタスクステップまたは狭い時間枠内で3つ以上のツールが OPEN に遷移する
- 障害が共通のエラーシグネチャを共有する（例: 「connection refused」「permission denied」）
- 以前は独立した障害履歴を持っていたツールが突然一緒に失敗する

**対応プロトコル：**

1. 2番目のブレーカーが開いた場合、障害カテゴリが最初のものと一致するか確認する
2. 相関がある場合：**systemic failure** としてフラグを立て — 壊れたものだけでなくすべてのツール呼び出しを一時停止する
3. 疑われる根本原因を報告する：「[共有パターン]で複数のツールが失敗 — [ネットワーク/ファイルシステム/権限]の問題の可能性が高い」
4. systemic failure 中はハーフオープンのツールをプローブしない — プローブも失敗してバジェットを浪費する
5. ユーザーがインフラストラクチャの問題が解決されたことを確認した後にのみプローブを再開する

**バックオフ複合：** 連鎖的な障害がトリガーされた場合、ハーフオープンのプローブに指数バックオフを使用する：ステップ3でプローブし、次にステップ6、次にステップ12。回復中のシステムを急速なプローブで圧倒することを防ぐために最大間隔を20ステップに制限する。

**期待結果：** 相関する障害はN個の独立したブレーカートリップではなく、単一の systemic イベントとして検出・処理される。障害バジェットはsystemic イベントをN回ではなく1回カウントする。

**失敗時：** 相関検出が実用的でない場合（障害が共有原因にもかかわらず異なるエラーシグネチャを持つ）、独立したツールごとのブレーカーにフォールバックする。システムはまだ適切にデグレードする — バジェットの消費が速くなるだけだ。

### ステップ10: 事前呼び出しツール選択レイヤー

サーキットブレーカーループ（ステップ3）に参加する前に、オプションでツールが利用可能で成功する可能性が高いことを確認する。これにより予測可能な失敗からの不必要なブレーカートリップが減少する。

**事前呼び出しチェック：**

| チェック | 方法 | 失敗時のアクション |
|-------|--------|-------------------|
| Tool exists | Verify tool is in the allowed-tools list | Skip — do not even attempt |
| MCP server health | Check server process/connection status | Route to alternative immediately |
| Resource availability | Verify target file/URL/endpoint exists | Route or degrade scope |

**決定テーブル：**

```
Pre-call score:
  AVAILABLE  → proceed to circuit breaker loop (Step 3)
  DEGRADED   → proceed with caution, lower the failure threshold by 1
  UNAVAILABLE → skip tool, route to alternative (Step 4) without consuming budget
```

事前呼び出しチェックは参考的なものであり、権威的なものではない。事前呼び出しチェックをパスしたツールでも実行中に失敗する可能性がある。サーキットブレーカーは主要な信頼性メカニズムとして残る。

**期待結果：** 予測可能な失敗（ツールの欠如、到達不能なサーバー）が障害バジェットを消費する前にキャッチされる。サーキットブレーカーは本物のランタイム障害のみを処理する。

**失敗時：** 事前呼び出しチェックが利用できないかオーバーヘッドが大きすぎる場合、このステップを完全にスキップする。ステップ3のサーキットブレーカーループがすべての障害を処理する — 事前呼び出し選択は要件ではなく最適化だ。

## バリデーション

- [ ] ケイパビリティマップが代替手段とフォールバックを記録した上ですべてのツールをカバーしている
- [ ] サーキットブレーカー状態テーブルがすべてのツールに対して初期化されている
- [ ] 状態遷移が CLOSED -> OPEN -> HALF-OPEN -> CLOSED サイクルに従っている
- [ ] 障害閾値が明示的に宣言されている（暗黙的でない）
- [ ] スコープ縮小の前に代替ルーティングが試みられている
- [ ] スコープ縮小が延期されたサブタスクと理由とともに記録されている
- [ ] 古いデータが明示的にラベル付けされている — 最新として提示されない
- [ ] 障害バジェットが枯渇時に一時停止・報告で強制されている
- [ ] エクスペディターロジックがツール呼び出しを実行したり失敗した呼び出しを再試行したりしない
- [ ] ステータスレポートに完了した作業、未完了の作業、ツールの健全性が含まれている
- [ ] サイレントな失敗がない — すべてのスキップ、延期、デグラデーションが記録されている
- [ ] 3つ以上のツールが同時に開いた場合に連鎖的な障害が検出される
- [ ] Systemic failure モードがインフラストラクチャの回復確認まですべてのプローブを一時停止する
- [ ] 事前呼び出しチェック（使用する場合）が予測可能な失敗で障害バジェットを消費しない

## よくある落とし穴

- **サーキットブレーカーの代わりに再試行する**: 壊れたツールを繰り返し呼び出すと障害バジェットとコンテキストウィンドウが無駄になる。3回の連続失敗はパターンであり、不運ではない。サーキットを開く。
- **エクスペディターで料理する**: オーケストレーション層は「何を試みるか」を決定すべきであり、壊れたツールを「どのように修正するか」ではない。エクスペディターが Bash の障害のための回避策コマンドを作成しているなら、分離境界を越えている。
- **サイレントなスコープ縮小**: サブタスクを記録せずに削除すると、完全に見えるが完全でない結果が生成される。スキップされたものを常に報告する。
- **古いデータを最新として扱う**: キャッシュされたり以前に取得したりした結果は現在の状態を反映していない可能性がある。不確実性を無視するのではなくラベル付けする。
- **サーキットを急いで開く**: 単一の一時的な障害でサーキットを開いてはならない。ノイズとシグナルを区別するために閾値（デフォルト: 3）を使用する。
- **開いた後にプローブしない**: 永久に開いたサーキットはエージェントがツールが回復したことを発見できないことを意味する。ハーフオープンプローブは回復に不可欠だ。
- **障害バジェットを無視する**: バジェットがなければ、エージェントは紙の上では「進捗」を上げながら異なるツールにわたって数十の障害を蓄積できる。バジェットは誠実なチェックポイントを強制する。
- **連鎖バックオフ乗算**: 依存チェーンの複数のツールがそれぞれ独自の指数バックオフを適用すると、複合遅延が乗算的に増大する。各ツールごとではなく、チェーン全体の総バックオフを制限する。
- **古い発見スコア**: 事前呼び出し選択（ステップ10）はツール可用性評価をキャッシュする。条件が変わった時にキャッシュが無効化されないと、エージェントが回復したツールをスキップするか、利用不可のツールを試みる可能性がある。systemic failure イベント後にスコアを再チェックする。

## 関連スキル

- `fail-early-pattern` — 補完的なパターン：fail-early は作業開始前に入力を検証する；circuit-breaker は作業中の障害を管理する
- `escalate-issues` — 障害バジェットが枯渇したりスコープ縮小が大きい場合、専門家または人間にエスカレーションする
- `write-incident-runbook` — 繰り返されるツール障害パターンを迅速な診断のためのランブックとして記録する
- `assess-context` — 複数のツールがデグレードされている場合に現在のアプローチが適応できるか評価する；スコープ縮小の決定と組み合わせる
- `du-dum` — 観察と意思決定を分離する二重時計アーキテクチャ；エージェントループの観察コスト削減のための補完パターン
