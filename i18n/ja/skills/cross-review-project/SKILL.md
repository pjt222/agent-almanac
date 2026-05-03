---
name: cross-review-project
description: >
  Conduct a structured cross-project code review between two Claude Code
  instances via the cross-review-mcp broker. Each agent reads its own
  codebase, reviews the peer's code, and engages in evidence-backed
  dialogue — with QSG scaling laws enforcing review quality through
  minimum bandwidth constraints and phase-gated progression.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Cross-Review Project

2 つの Claude Code インスタンスが、`cross-review-mcp` ブローカーを介した構造化された成果物交換を通じて互いのプロジェクトをレビューする。ブローカーは Quantized Simplex Gossip (QSG) スケーリング則を強制する — レビューバンドルは選択領域（Γ_h ≈ 1.67）に留まるため最低 5 つの所見を含まなければならず、これにより浅いコンセンサスが合意として通るのを防ぐ。

## 使用タイミング

- 2 つのプロジェクトがアーキテクチャ上の関心を共有し、互いに学べるとき
- 単独のレビュアーが見るものを超えた独立コードレビューが欲しいとき
- クロスポリネーション（相互受粉）が目的: あるプロジェクトに存在し他方に欠けているパターンを見つけること
- 受け入れ/拒否/議論の判定を持つ、構造化された証拠裏付けのレビューが必要なとき

## 入力

- **必須**: 2 つの Claude Code インスタンスからアクセス可能な 2 つのプロジェクトパス
- **必須**: `cross-review-mcp` ブローカーが起動し、両インスタンスで MCP サーバーとして設定されている
- **任意**: 焦点領域 — 優先する特定のディレクトリ、パターン、関心事
- **任意**: エージェント ID — 各インスタンスの識別子（既定: プロジェクトディレクトリ名）

## 手順

### ステップ1: 前提条件を検証する

ブローカーが起動し両インスタンスから到達可能であることを確認する。

1. ブローカーが MCP サーバーとして設定されているか確認:
   ```bash
   claude mcp list | grep cross-review
   ```
2. `get_status` を呼んでブローカーが応答的で古いエージェントが登録されていないことを検証
3. `cross-review://protocol` のプロトコルリソースを読む — レビュー次元と QSG 制約を記述した markdown ドキュメント

**期待結果：** ブローカーが `get_status` に空のエージェントリストで応答する。プロトコルリソースが markdown として読める。

**失敗時：** ブローカーが設定されていなければ追加する: `claude mcp add cross-review-mcp -- npx cross-review-mcp`。前セッションからの古いエージェントがあれば、進む前に各々について `deregister` を呼ぶ。

### ステップ2: 登録する

このエージェントをブローカーに登録する。

1. 次の引数で `register` を呼ぶ:
   - `agentId`: 短く一意な識別子（例: プロジェクトディレクトリ名）
   - `project`: プロジェクト名
   - `capabilities`: `["review", "suggest"]`
2. `get_status` を呼んで登録を検証 — エージェントが phase `"registered"` で現れるはず
3. ピアエージェントの登録を待つ: ピアのエージェント ID と phase `"registered"` で `wait_for_phase` を呼ぶ

**期待結果：** 両エージェントがブローカーに登録された。`get_status` は phase `"registered"` の 2 エージェントを示す。

**失敗時：** `register` が "already registered" で失敗するなら、エージェント ID は前セッションから取られている。先に `deregister` を呼んでから再登録する。

### ステップ3: ブリーフィングフェーズ

自分のコードベースを読み、構造化されたブリーフィングをピアに送る。

1. 体系的に読む:
   - エントリポイント（メインファイル、index、CLI コマンド）
   - 依存グラフ（package.json、DESCRIPTION、go.mod）
   - アーキテクチャパターン（ディレクトリ構造、モジュール境界）
   - 既知の問題（TODO コメント、オープンな issue、技術的負債）
   - テストカバレッジ（テストディレクトリ、CI 設定）
2. ピアがあなたのコードベースを効率よく辿るために使える、構造化された要約 `Briefing` 成果物を構成する
3. 次の引数で `send_task` を呼ぶ:
   - `from`: 自分のエージェント ID
   - `to`: ピアのエージェント ID
   - `type`: `"briefing"`
   - `payload`: JSON エンコードされたブリーフィング
4. phase `"briefing"` で `signal_phase` を呼ぶ

**期待結果：** ブリーフィングが送られフェーズが信号された。ブローカーはレビューに進む前にブリーフィング送信を強制する。

**失敗時：** `send_task` がブリーフィングを拒否する場合、`from` フィールドが登録済みエージェント ID と一致するか確認する。自分宛は拒否される。

### ステップ4: レビューフェーズ

ピアのブリーフィングを待ち、彼らのコードをレビューして所見を送る。

1. ピアの ID と phase `"briefing"` で `wait_for_phase` を呼ぶ
2. `poll_tasks` を呼んでピアのブリーフィングを取得する
3. 受け取ったタスク ID で `ack_tasks` を呼ぶ — これは必須（peek-then-ack パターン）
4. ブリーフィングに導かれてピアの実際のソースコードを読む
5. 6 カテゴリにわたる所見を作成する:
   - `pattern_transfer` — ピアが採用しうる、自分のプロジェクトにあるパターン
   - `missing_practice` — ピアに欠けている実践（テスト、検証、エラー処理）
   - `inconsistency` — ピアのコードベース内の内部矛盾
   - `simplification` — 削減可能な不要な複雑性
   - `bug_risk` — 潜在的ランタイム失敗またはエッジケース
   - `documentation_gap` — 欠落または誤解を招くドキュメント
6. 各所見は次を含まねばならない:
   - `id`: 一意な識別子（例: `"F-001"`）
   - `category`: 上記 6 カテゴリのいずれか
   - `targetFile`: ピアのプロジェクト内のパス
   - `description`: 何を見つけたか
   - `evidence`: なぜこれが有効な所見か（コード参照、パターン）
   - `sourceAnalog`（推奨）: 自分のプロジェクトでそのパターンを示す等価物 — 真のクロスポリネーションの唯一の機構
7. 最低 **5 つの所見** をバンドルする（QSG 制約: m ≥ 5 が Γ_h ≈ 1.67 を選択領域に保つ）
8. type `"review_bundle"` と JSON エンコードされた所見配列で `send_task` を呼ぶ
9. phase `"review"` で `signal_phase` を呼ぶ

**期待結果：** レビューバンドルがブローカーに受け入れられる。所見が 5 未満なら拒否される。

**失敗時：** バンドルが所見不足で拒否されたなら、より深くレビューする。制約は浅いレビューが支配するのを防ぐために存在する。本当に 5 つの問題を見つけられないなら、このプロジェクトペアにクロスレビューが正しい道具か再考する。

### ステップ5: 対話フェーズ

自分のプロジェクトに関する所見を受け取り、証拠裏付けの判定で応答する。

1. ピアの ID と phase `"review"` で `wait_for_phase` を呼ぶ
2. `poll_tasks` を呼んで自分のプロジェクトに関する所見を取得する
3. 受け取ったタスク ID で `ack_tasks` を呼ぶ
4. 各所見について `FindingResponse` を作る:
   - `findingId`: 所見の ID と一致
   - `verdict`: `"accept"`（有効、対応する）、`"reject"`（無効、反証付き）、`"discuss"`（明確化が必要）
   - `evidence`: なぜ受け入れる/拒否するか — 空であってはならない
   - `counterEvidence`（任意）: 所見と矛盾する具体的なコード参照
5. type `"response"` ですべての応答を `send_task` で送る
6. phase `"dialogue"` で `signal_phase` を呼ぶ

注: `"discuss"` 判定はプロトコルでゲートされていない — 自動サブ交換ではなく、手動フォローアップ用のフラグとして扱う。

**期待結果：** すべての所見に証拠付き判定で応答した。空応答はブローカーに拒否される。

**失敗時：** 所見について意見が形成できない場合、追加で必要な文脈を説明する証拠付き `"discuss"` を既定とする。

### ステップ6: 統合フェーズ

受け入れた所見と計画した行動をまとめる統合成果物を作る。

1. ピアの ID と phase `"dialogue"` で `wait_for_phase` を呼ぶ
2. 残るタスクをポールして承認する
3. `Synthesis` 成果物をコンパイル:
   - 計画した行動付きの受け入れ所見（何を変えるか、なぜか）
   - 拒否所見と理由（将来のレビューのために推論を保存）
4. type `"synthesis"` と JSON エンコードされた統合で `send_task` を呼ぶ
5. phase `"synthesis"` で `signal_phase` を呼ぶ
6. 任意: 受け入れた所見について GitHub issue を作成
7. phase `"complete"` で `signal_phase` を呼ぶ
8. クリーンアップのため `deregister` を呼ぶ

**期待結果：** 両エージェントが `"complete"` に到達。ブローカーは complete に進むのに最低 2 つの登録エージェントを要求する。

**失敗時：** ピアが既に登録解除されていても、ローカルで完了できる。受け取った所見から統合をコンパイルする。

## バリデーション

- [ ] 両エージェントが登録され `"complete"` フェーズに到達した
- [ ] レビュー開始前にブリーフィングが交換された（フェーズ強制）
- [ ] レビューバンドルが各々最低 5 つの所見を含んだ
- [ ] すべての所見が証拠付き判定（accept/reject/discuss）を受けた
- [ ] 各 `poll_tasks` の後で `ack_tasks` が呼ばれた
- [ ] 受け入れ所見が行動にマップされた統合が作成された
- [ ] 完了後にエージェントが登録解除された

## よくある落とし穴

- **5 未満の所見**: ブローカーは m < 5 のバンドルを拒否する。これは恣意的ではない — N=2 エージェントと 6 カテゴリでは、m < 5 は Γ_h を、コンセンサスがノイズと区別不能になる臨界境界以下に置く。より深くレビューする; 5 つの所見が本当に見つからないなら、プロジェクトはクロスレビューの恩恵を受けないかもしれない。
- **`ack_tasks` を忘れる**: ブローカーは peek-then-ack 配信を使う。タスクは承認まで queue に残る。ack を忘れると次のポールで重複処理を引き起こす。
- **`from` パラメータを忘れる**: `send_task` は自分のエージェント ID と一致する明示的な `from` フィールドを要求する。自分宛は拒否される。
- **同モデルの認識相関**: 2 つの Claude インスタンスは訓練バイアスを共有する。時間順序はレビュー中に互いの出力を読まないことを保証するが、事前確率は相関する。真の認識的独立性のためには、異なるモデルファミリーをインスタンス間で使う。
- **`sourceAnalog` をスキップ**: `sourceAnalog` フィールドは任意だが、真のクロスポリネーションの唯一の機構 — 推奨しているパターンの *自分の* 実装を示す。ソース類似物が存在するなら常に埋める。
- **`discuss` をブロッキングとして扱う**: プロトコルには未解決議論の解決を `complete` の条件とするものはない。`discuss` 判定はセッション後の手動フォローアップ用のフラグとして扱う。
- **テレメトリをレビューしない**: ブローカーはすべてのイベントを JSONL にログする。セッション後、ログをレビューして QSG 仮定を検証する — α を経験的に推定（`α ≈ 1 - reject_rate`）し、カテゴリごとの受け入れ率を確認する。

## 関連スキル

- `scaffold-mcp-server` — ブローカー自体を構築または拡張する
- `implement-a2a-server` — ブローカーが引き継ぐ A2A プロトコルパターン
- `review-codebase` — 単独エージェントレビュー（このスキルはそれをクロスエージェント構造化交換へ拡張する）
- `build-consensus` — スワームコンセンサスパターン（QSG が理論基盤）
- `configure-mcp-server` — Claude Code でブローカーを MCP サーバーとして設定する
- `unleash-the-agents` — ブローカー自体を解析するために使える（バトルテスト済: 40 エージェント、10 仮説ファミリー）
