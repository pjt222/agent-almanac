---
name: awareness
description: >
  AI状況認識 — 幻覚リスク、スコープクリープ、コンテキスト劣化に対する内部脅威検出。
  Cooperカラーコードを推論状態に、OODAループをリアルタイム決定にマッピングする。
  推論品質が重要なタスク中、未知の領域で作業する時、不確かな事実や疑わしいツール
  結果などの早期警告サインを検出した後、不可逆的な変更やアーキテクチャ決定などの
  高リスク出力前に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# アウェアネス

内部推論品質の継続的な状況認識を維持する — 適応されたCooperカラーコードとOODAループ意思決定を使用して、幻覚リスク、スコープクリープ、コンテキスト劣化、確信度-精度のミスマッチをリアルタイムで検出する。

## 使用タイミング

- 推論品質が重要なタスク中（ほとんどのタスクがこれに該当する）
- 未知の領域で作業する時（新しいコードベース、不慣れなドメイン、複雑なリクエスト）
- 早期警告サインを検出した後: 不確かに感じる事実、おかしいと思えるツール結果、増大する混乱感
- 長時間の作業セッション中の継続的なバックグラウンドプロセスとして
- `center`または`heal`がドリフトを明らかにしたが、具体的な脅威が特定されていない時
- 高リスク出力前（不可逆的な変更、ユーザー向けコミュニケーション、アーキテクチャ決定）

## 入力

- **必須**: アクティブなタスクコンテキスト（暗黙的に利用可能）
- **任意**: 警戒レベルを上げる特定の懸念（例: 「このAPIが存在するか確信がない」）
- **任意**: 脅威プロファイル選択のためのタスクタイプ（ステップ5を参照）

## 手順

### ステップ1: AI Cooperカラーコードの確立

Cooperのカラーコードシステムの適応版を使用して、現在の認識レベルを校正する。

```
AI Cooper Color Codes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ State               │ AI Application                           │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ White    │ Autopilot           │ Generating output without monitoring     │
│          │                     │ quality. No self-checking. Relying       │
│          │                     │ entirely on pattern completion.          │
│          │                     │ DANGEROUS — hallucination risk highest   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Yellow   │ Relaxed alert       │ DEFAULT STATE. Monitoring output for     │
│          │                     │ accuracy. Checking facts against context.│
│          │                     │ Noticing when confidence exceeds         │
│          │                     │ evidence. Sustainable indefinitely       │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Specific risk       │ A specific threat identified: uncertain  │
│          │ identified          │ fact, possible hallucination, scope      │
│          │                     │ drift, context staleness. Forming        │
│          │                     │ contingency: "If this is wrong, I        │
│          │                     │ will..."                                 │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Red      │ Risk materialized   │ The threat from Orange has materialized: │
│          │                     │ confirmed error, user correction, tool   │
│          │                     │ contradiction. Execute the contingency.  │
│          │                     │ No hesitation — the plan was made in     │
│          │                     │ Orange                                   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Black    │ Cascading failures  │ Multiple simultaneous failures, lost     │
│          │                     │ context, fundamental confusion about     │
│          │                     │ what the task even is. STOP. Ground      │
│          │                     │ using `center`, then rebuild from user's │
│          │                     │ original request                         │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

現在のカラーコードを特定する。答えがWhite（モニタリングなし）であれば、アウェアネスの実践はギャップを明らかにすることですでに成功している。

**期待結果:** 現在の認識レベルの正確な自己評価。通常作業中はYellowが目標。Whiteは稀で短時間であるべき。Orangeの長期化は持続不可能 — 懸念を確認するか却下する。

**失敗時:** カラーコード評価自体がオートパイロットで行われている感じがする場合（形式的に行っている）、それはYellowに偽装したWhiteである。真のYellowは、そうしていると主張するだけでなく、出力をエビデンスに対して積極的にチェックすることを含む。

### ステップ2: 内部脅威インジケーターの検出

一般的なAI推論失敗に先行する特定のシグナルを体系的にスキャンする。

```
Threat Indicator Detection:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Threat Category           │ Warning Signals                          │
├───────────────────────────┼──────────────────────────────────────────┤
│ Hallucination Risk        │ • Stating a fact without a source        │
│                           │ • High confidence about API names,       │
│                           │   function signatures, or file paths     │
│                           │   not verified by tool use               │
│                           │ • "I believe" or "typically" hedging     │
│                           │   that masks uncertainty as knowledge    │
│                           │ • Generating code for an API without     │
│                           │   reading its documentation              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep               │ • "While I'm at it, I should also..."   │
│                           │ • Adding features not in the request     │
│                           │ • Refactoring adjacent code              │
│                           │ • Adding error handling for scenarios    │
│                           │   that can't happen                      │
├───────────────────────────┼──────────────────────────────────────────┤
│ Context Degradation       │ • Referencing information from early in  │
│                           │   a long conversation without re-reading │
│                           │ • Contradicting a statement made earlier │
│                           │ • Losing track of what has been done     │
│                           │   vs. what remains                       │
│                           │ • Post-compression confusion             │
├───────────────────────────┼──────────────────────────────────────────┤
│ Confidence-Accuracy       │ • Stating conclusions with certainty     │
│ Mismatch                  │   based on thin evidence                 │
│                           │ • Not qualifying uncertain statements    │
│                           │ • Proceeding without verification when   │
│                           │   verification is available and cheap    │
│                           │ • "This should work" without testing     │
└───────────────────────────┴──────────────────────────────────────────┘
```

各カテゴリーについて確認する: このシグナルは今存在しているか？ はいの場合、YellowからOrangeにシフトし、具体的な懸念を特定する。

**期待結果:** 少なくとも1つのカテゴリーが真剣な注意でスキャンされる。シグナルの検出は — 軽微なものであっても — 「すべてクリア」と報告するよりも有用。すべてのスキャンがクリーンを返す場合、検出閾値が高すぎる可能性がある。

**失敗時:** 脅威検出が抽象的に感じられる場合、最新の出力でグラウンディングする: 最後に述べた事実的主張を選び、「これが真実だとどうして分かるか？ 読んだのか、それとも生成しているのか？」と問う。この1つの質問がほとんどの幻覚リスクを捕捉する。

### ステップ3: 特定された脅威に対してOODAループを実行

特定の脅威が特定された時（Orange状態）、観察-方向付け-決定-行動を循環する。

```
AI OODA Loop:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Observe  │ What specifically triggered the concern? Gather concrete     │
│          │ evidence. Read the file, check the output, verify the fact.  │
│          │ Do not assess until you have observed                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient   │ Match observation to known patterns: Is this a common       │
│          │ hallucination pattern? A known tool limitation? A context    │
│          │ freshness issue? Orient determines response quality          │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Decide   │ Select the response: verify and correct, flag to user,      │
│          │ adjust approach, or dismiss the concern with evidence.       │
│          │ A good decision now beats a perfect decision too late        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Act      │ Execute the decision immediately. If the concern was valid,  │
│          │ correct the error. If dismissed, note why and return to      │
│          │ Yellow. Re-enter the loop if new information emerges         │
└──────────┴──────────────────────────────────────────────────────────────┘
```

OODAループは高速であるべき。目標は完璧さではなく、観察と行動の間の迅速な循環。Orient（分析麻痺）に時間をかけすぎるのが最も一般的な失敗。

**期待結果:** 観察から行動までの完全なループが短時間で完了する。脅威は確認されて修正されるか、却下の具体的なエビデンスとともに却下される。

**失敗時:** ループがOrientで停滞する場合（脅威の意味が判定できない）、安全なデフォルトにスキップする: ツール使用を通じて不確かな事実を検証する。直接的な観察は分析よりも速く曖昧さの大半を解消する。

### ステップ4: 迅速な安定化

脅威が顕在化した時（Red）またはカスケード障害が発生した時（Black）、続行する前に安定化する。

```
AI Stabilization Protocol:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technique              │ Application                                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Stop generating output. The next sentence   │
│                        │ produced under stress is likely to compound │
│                        │ the error, not fix it                       │
├────────────────────────┼─────────────────────────────────────────────┤
│ Re-read user message   │ Return to the original request. What did   │
│                        │ the user actually ask? This is the ground   │
│                        │ truth anchor                                │
├────────────────────────┼─────────────────────────────────────────────┤
│ State task in one      │ "The task is: ___." If this sentence cannot │
│ sentence               │ be written clearly, the confusion is deeper │
│                        │ than the immediate error                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Enumerate concrete     │ List what is definitely known (verified by  │
│ facts                  │ tool use or user statement). Distinguish    │
│                        │ facts from inferences. Build only on facts  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Identify one next step │ Not the whole recovery plan — just one step │
│                        │ that moves toward resolution. Execute it    │
└────────────────────────┴─────────────────────────────────────────────┘
```

**期待結果:** 意図的な安定化によりRed/BlackからYellowに復帰。安定化後の次の出力は、エラーを引き起こした出力より測定可能にグラウンディングされているべき。

**失敗時:** 安定化が効果的でない場合（まだ混乱している、まだエラーを生成している）、問題は構造的かもしれない — 一時的な失敗ではなく根本的な誤解。エスカレートする: アプローチのリセットが必要であることをユーザーに伝え、明確化を求める。

### ステップ5: コンテキスト固有の脅威プロファイルの適用

異なるタスクタイプは異なる主要な脅威を持つ。タスクに応じて認識の焦点を校正する。

```
Task-Specific Threat Profiles:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Task Type           │ Primary Threat      │ Monitoring Focus          │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code generation     │ API hallucination   │ Verify every function     │
│                     │                     │ name, parameter, and      │
│                     │                     │ import against actual docs│
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architecture design │ Scope creep         │ Anchor to stated          │
│                     │                     │ requirements. Challenge   │
│                     │                     │ every "nice to have"      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Data analysis       │ Confirmation bias   │ Actively seek evidence    │
│                     │                     │ that contradicts the      │
│                     │                     │ emerging conclusion       │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnel vision       │ If the current hypothesis │
│                     │                     │ hasn't yielded results in │
│                     │                     │ N attempts, step back     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Documentation       │ Context staleness   │ Verify that described     │
│                     │                     │ behavior matches current  │
│                     │                     │ code, not historical      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Long conversation   │ Context degradation │ Re-read key facts         │
│                     │                     │ periodically. Check for   │
│                     │                     │ compression artifacts     │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

現在のタスクタイプを特定し、それに応じてモニタリングの焦点を調整する。

**期待結果:** すべてを汎用的にモニタリングするのではなく、現在のタスクタイプで最も発生しやすい特定の脅威に対して認識が研ぎ澄まされる。

**失敗時:** タスクタイプが不明確または複数カテゴリーにまたがる場合、幻覚リスクモニタリングをデフォルトとする — 最も普遍的に適用可能な脅威であり、見落とした場合の被害が最も大きい。

### ステップ6: レビューと校正

各アウェアネスイベント（脅威検出、OODAサイクル、安定化適用）の後、簡潔にレビューする。

1. 問題が検出された時、どのカラーコードがアクティブだったか？
2. 検出はタイムリーだったか、それとも問題がすでに出力に現れていたか？
3. OODAループは十分に速かったか、それともOrientで停滞したか？
4. 対応は適切だったか（過剰反応でも過小反応でもないか）？
5. 次回これをより早く捕捉するには何が必要か？

**期待結果:** 将来の検出を改善する簡潔な校正。長時間のポストモーテムではない — 感度を調整するのに十分な量だけ。

**失敗時:** レビューが有用な校正を生まない場合、アウェアネスイベントは些細なもの（学習不要）か、レビューが浅すぎるかのいずれか。重大なイベントの場合、問う: 「モニタリングすべきだったのに、していなかったものは何か？」

### ステップ7: 統合 — Yellowデフォルトの維持

継続的な認識姿勢を設定する。

1. Yellowはすべての作業中のデフォルト状態 — リラックスしたモニタリング、過警戒ではない
2. 現在のタスクタイプに基づいてモニタリングの焦点を調整する（ステップ5）
3. このセッションの繰り返し脅威パターンをMEMORY.mdに記録する
4. 校正されたアウェアネスをアクティブにしてタスク実行に戻る

**期待結果:** 作業品質を向上させつつも遅延させない持続可能な認識レベル。アウェアネスは周辺視野のように感じるべき — 存在しているが中心的な注意を要求しない。

**失敗時:** アウェアネスが疲弊または過警戒的になる場合（慢性的なOrange）、閾値が敏感すぎる。Orangeをトリガーする閾値を上げる。真のアウェアネスは持続可能。エネルギーを消耗する場合、それは警戒に偽装した不安である。

## バリデーション

- [ ] 現在のカラーコードが正直に評価された（Whiteがより正確な時にYellowにデフォルトしていない）
- [ ] 少なくとも1つの脅威カテゴリーが具体的なエビデンスでスキャンされた（チェックしただけではない）
- [ ] 特定された脅威にOODAループが適用された（観察、方向付け、決定、行動）
- [ ] 必要に応じて安定化プロトコルが利用可能だった（トリガーされなくても）
- [ ] 認識の焦点が現在のタスクタイプに校正された
- [ ] 重大なアウェアネスイベントに対してイベント後の校正が実行された
- [ ] 持続可能なデフォルトとしてYellowが再確立された

## よくある落とし穴

- **Yellowに偽装したWhite**: モニタリングしていると主張しながら実際にはオートパイロット。テスト: 最後に検証した事実を挙げられるか？ できなければWhiteにいる
- **慢性的なOrange**: すべての不確実性を脅威として扱うと認知リソースを消耗し、作業を遅らせる。Orangeは特定の識別されたリスク用であり、一般的な不安ではない。すべてがリスクに感じる場合、校正がずれている
- **行動なしの観察**: 脅威を検出するがOODAを循環して解決しない。対応なしの検出は検出なしよりも悪い — 修正なしに不安を追加する
- **Orientのスキップ**: 観察の意味を理解せずにObserveからActにジャンプする。これは元のエラーよりも悪い反応的修正を生む
- **直感シグナルの無視**: 何かが「おかしい」と感じるが明示的チェックがクリーンを返す時、その感覚を却下するのではなくさらに調査する。暗黙のパターンマッチングは明示的分析よりも先に問題を検出することが多い
- **過剰安定化**: 軽微な問題に完全な安定化プロトコルを実行する。ほとんどのOrangeレベルの懸念には素早い事実確認で十分。完全な安定化はRedとBlackイベント用に取っておく

## 関連スキル

- `mindfulness` — このスキルがAI推論にマッピングする人間のプラクティス; 身体的な状況認識原則が認知的脅威検出に情報を提供する
- `center` — アウェアネスが動作するバランスの取れたベースラインを確立する; centerなしのアウェアネスは過警戒である
- `redirect` — アウェアネスが検出した圧力を処理する
- `heal` — アウェアネスがドリフトのパターンを明らかにした時のより深いサブシステム評価
- `meditate` — アウェアネスが依存する観察的明晰さを発達させる
