---
name: coordinate-reasoning
description: >
  スティグマージックシグナルを用いたAI内部調整 — コンテキストとメモリにおける
  情報の鮮度管理、仮定の陳腐化に対する減衰率、単純なローカルプロトコルから創発する
  一貫した行動。複数のサブタスクが調整を必要とする複雑なタスク中、コンテキストが
  長くなり情報の鮮度が不確かな時、コンテキスト圧縮後に情報が失われた可能性がある時、
  サブタスクの出力が劣化なく相互に供給される必要がある時に使用する。
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
  locale: ja
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# 推論の調整

スティグマージック原理を用いて推論プロセスの内部調整を管理する — コンテキストを、情報シグナルが鮮度、減衰率、相互作用ルールを持ち、単純なローカルプロトコルから一貫した行動を生み出す環境として扱う。

## 使用タイミング

- 複数のサブタスクが調整を必要とする複雑なタスク中（複数ファイル編集、複数ステップのリファクタリング）
- コンテキストが長くなり情報の鮮度が不確かな時
- コンテキスト圧縮後に一部の情報が失われた可能性がある時
- サブタスクの出力が劣化なく相互に供給される必要がある時
- 以前の推論結果を劣化なく引き継ぐ必要がある時
- `forage-solutions`（探索）と`build-coherence`（決定）を実行調整で補完する時

## 入力

- **必須**: 現在のタスク分解（どのサブタスクが存在し、どのように関連するか？）
- **任意**: 既知の情報鮮度の懸念（例：「そのファイルは20メッセージ前に読んだ」）
- **任意**: サブタスク依存関係マップ（どのサブタスクがどれに供給するか？）
- **任意**: 利用可能な調整ツール（MEMORY.md、タスクリスト、インラインノート）

## 手順

### ステップ1: 調整問題の分類

異なる調整課題には異なるシグナル設計が必要。

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

現在のタスクを分類する。ほとんどの複雑なタスクはConstructionまたはDivision of Labor、ほとんどのデバッグタスクはForaging、ほとんどの設計判断はConsensus。

**期待結果:** どの調整シグナルを使用するかを決定する明確な分類。分類はタスクの説明ではなく、タスクの実際の感触に一致すべき。

**失敗時:** タスクが複数のタイプにまたがる場合（大きなタスクでは一般的）、現在のフェーズの支配的なタイプを特定する。実装中はConstruction、デバッグ中はForaging、設計中はConsensus。タイプはタスクの進行に伴い変化できる。

### ステップ2: コンテキストシグナルの設計

会話コンテキスト中の情報を、鮮度と減衰特性を持つシグナルとして扱う。

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

加えて、抑制シグナル — 試行して失敗したアプローチのマーカー — を設計する:

- ツール呼び出しが失敗した後：失敗モードを記録する（同じ呼び出しの再試行を防止）
- アプローチが放棄された後：理由を記録する（新しい証拠なしでの再訪を防止）
- ユーザーの修正後：何が間違っていたかを記録する（同じエラーの繰り返しを防止）

**期待結果:** 現在のコンテキスト全体にわたる情報鮮度のメンタルモデル。どの情報が新鮮で、どの情報が依存前にリフレッシュが必要かの特定。

**失敗時:** 情報鮮度の評価が難しい場合、最後の5〜10アクション内で検証されていないものについては「依存前にリフレッシュ」をデフォルトとする。過剰なリフレッシュは若干の労力を無駄にするが、古い情報に基づくエラーを防止する。

### ステップ3: ローカルプロトコルの定義

各ステップで推論がどのように進むべきかについて、ローカルに利用可能な情報のみを使用する単純なルールを確立する。

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

これらのプロトコルは、大きなオーバーヘッドなく各ステップで適用できるほど単純。

**期待結果:** 実行速度を低下させずに調整品質を向上させる軽量なルールセット。ルールは負担ではなく有用に感じるべき。

**失敗時:** プロトコルがオーバーヘッドに感じる場合、現在のタスクタイプにとって最も重要な2つに削減する：ConstructionにはSafety + Deposit、ForagingにはSafety + Exploration、アクティブなユーザーフィードバックがあるタスクにはSafety + Response。

### ステップ4: 情報鮮度の校正

現在のコンテキストにおける情報の陳腐化のアクティブな監査を実行する。

1. Nメッセージ以上前に確立された事実は何か？ リストアップする
2. それぞれについて：その後更新、矛盾、または無関係になったか？
3. コンテキスト圧縮の損失を確認：記憶にはあるが可視コンテキストに見つからない情報はないか？
4. 初期計画と現在の実行の間のドリフトを確認：計画を更新せずにアプローチが変わっていないか？
5. 最も重要な2〜3の事実（最も多くの下流推論が依存するもの）を再検証する

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**期待結果:** リフレッシュが必要な陳腐な項目が特定された情報鮮度の具体的なインベントリ。少なくとも1つの事実が再検証される — リフレッシュが不要だった場合、監査が浅すぎるか、コンテキストが真に新鮮。

**失敗時:** 監査で重大な情報損失が明らかになった場合（複数の事実が「Lost」または「Unknown」ステータス）、完全なサブシステム評価のために`heal`を実行するシグナル。閾値を超える情報損失は、基盤レベルで調整が損なわれていることを意味する。

### ステップ5: 創発的一貫性のテスト

サブタスクが組み合わされた時に一貫した全体を生み出すかを検証する。

1. 各サブタスクの出力は次にスムーズに供給されるか？ ギャップ、矛盾、または前提の不一致はないか？
2. ツール呼び出しは目標に向かって構築されているか、それとも反復的か（同じファイルの再読み込み、同じ検索の再実行）？
3. 全体的な方向性はまだユーザーのリクエストと整合しているか？ 漸進的なドリフトが大きな不整合に蓄積していないか？
4. ストレステスト：1つの重要な仮定が間違っている場合、どれだけの作業がカスケードするか？ 高いカスケード = 脆弱な調整。低いカスケード = 堅牢な調整

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**期待結果:** 具体的な問題が特定された全体的な一貫性の具体的な評価。一貫した調整は部品がカチッとはまる感覚、不一貫な調整はパズルのピースを無理に合わせる感覚。

**失敗時:** 一貫性が低い場合、サブタスクが分岐する具体的なポイントを特定する。多くの場合、それは下流の作業に伝播した単一の陳腐な仮定または未処理のユーザー修正。分岐点を修正し、次に下流の出力を再検証する。

## バリデーション

- [ ] 調整問題がタイプ別に分類された
- [ ] 依存する事実について情報減衰率が考慮された
- [ ] ローカルプロトコルが適用された（特にSafetyとDeposit）
- [ ] 鮮度監査で陳腐な情報が特定された（または証拠とともに鮮度が確認された）
- [ ] サブタスク間で創発的一貫性がテストされた
- [ ] 抑制シグナルが尊重された（試行して失敗したアプローチが繰り返されていない）

## よくある落とし穴

- **シグナルの過剰設計**: 複雑な調整プロトコルは助けるよりも作業を遅らせる。Safety + Depositから始め、問題が出た時にのみ追加する
- **陳腐なコンテキストの信頼**: 最も一般的な調整失敗は、20メッセージ前には正しかったが、その後更新または無効化された情報に依存すること。疑わしい場合は再読み込み
- **抑制シグナルの無視**: 何も変えずに失敗したアプローチを再試行するのは粘り強さではない — 失敗シグナルを無視すること。再試行が成功するためには何かが変わっている必要がある
- **デポジットなし**: 出力を記録せずにサブタスクを完了すると、後のサブタスクが再導出または再読み込みを強いられる。簡潔な要約で大幅な再作業を節約
- **一貫性の仮定**: サブタスクが実際に一貫した全体に結合するかをテストしない。各サブタスクは個別には正しいが集合的には不一貫な可能性がある — 統合が調整の失敗が起こる場所

## 関連スキル

- `coordinate-swarm` -- このスキルが単一エージェント推論に適応したマルチエージェント調整モデル
- `forage-solutions` -- 複数の仮説にわたる探索を調整する
- `build-coherence` -- 競合するアプローチにわたる評価を調整する
- `heal` -- 調整失敗がサブシステムドリフトを明らかにした時のより深い評価
- `awareness` -- 実行中の調整崩壊シグナルを監視する
