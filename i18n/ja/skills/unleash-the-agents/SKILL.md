---
name: unleash-the-agents
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Unleash the Agents

オープンエンドな問題のための多様な仮説を生成するため、利用可能なすべてのエージェントを並列波で相談する。各エージェントは独自のドメインレンズを通して推論する — kabalist がゲマトリアでパターンを見出し、martial-artist が条件分岐を提案し、contemplative がデータと座って構造に気づく。独立した視点間の収束が、仮説に価値がある主要信号。

## 使用タイミング

- 正しいアプローチが未知のクロスドメイン問題に直面するとき
- 単一エージェントまたは単一ドメインアプローチが停滞または信号を生まなかった
- 問題が真に多様な視点（より多くの計算ではなく）から利益を得る
- 仮説生成（実行ではなく）が必要 — 実行にはチームを使う
- 自明でない角度を逃すことが実コストを伴う高ステークス決定

## 入力

- **必須**: 問題ブリーフ — 問題、5+ 具体例、解決として何が数えられるかの明確な記述
- **必須**: 検証方法 — 仮説が正しいかをテストする方法（プログラム的テスト、専門家レビュー、null モデル比較）
- **任意**: エージェントサブセット — 含めるまたは除外する特定エージェント（既定: すべての登録エージェント）
- **任意**: 波サイズ — 波あたりエージェント数（既定: 10）
- **任意**: 出力フォーマット — エージェント応答用の構造化テンプレート（既定: 仮説 + 推論 + 信頼度 + テスト可能予測）

## 手順

### ステップ1: ブリーフを準備する

ドメイン専門性に関係なく任意のエージェントが理解できる問題ブリーフを書く。含む:

1. **問題声明**: 何を発見または決めようとしているか（1-2 文）
2. **例**: 少なくとも 5 つの具体的入力/出力例またはデータポイント（多いほど良い — 3 はほとんどのエージェントがパターンを見出すには少なすぎる）
3. **既知の制約**: 既に知っていること、既に試したこと
4. **成功基準**: 正しい仮説をどう認識するか
5. **出力テンプレート**: 応答が欲しい正確なフォーマット

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**期待結果：** 自己完結したブリーフ — このテキストだけを受け取るエージェントが問題について推論するに必要なすべてを持つ。

**失敗時：** 5 つの例または検証方法を表現できないなら、問題はマルチエージェント相談に準備できていない。まずスコープを狭める。

### ステップ2: 波を計画する

利用可能なすべてのエージェントを列挙し ~10 の波に分ける。最初の 2 波には順序は重要でない; 後続の波には、波間知識注入が結果を改善する。

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

エージェントを波に割り当てる。最初に 4 波を計画する — すべてが必要にならないかもしれない（ステップ4 の早期停止を参照）。

| Wave | Agents | Brief variant |
|------|--------|---------------|
| 1-2 | 20 agents | Standard brief |
| 3 | 10 agents + advocatus-diaboli | Brief + emerging consensus + adversarial challenge |
| 4+ | 10 agents each | Brief + "X is confirmed. Focus on edge cases and failures." |

**期待結果：** すべてのエージェントが割り当てられた波割当表。後続の波に情報を与えるよう Wave 3（後ではなく）に `advocatus-diaboli` を含める。

**失敗時：** 20 未満のエージェントが利用可能なら、2-3 波に減らす。パターンは 10 ほど少ないエージェントでも動くが、収束信号は弱い。

### ステップ3: 波を起動する

各波を並列エージェントとして起動する。コスト効率のため `sonnet` モデルを使う（価値は個々の深さではなく視点の多様性から来る）。

#### Option A: TeamCreate（フル unleash 推奨）

タスク追跡付きの調整チームをセットアップするため Claude Code の `TeamCreate` ツールを使う。TeamCreate は遅延ツール — まず `ToolSearch("select:TeamCreate")` で取得する。

1. チームを作成:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. ブリーフとドメイン固有フレーミング付きで `TaskCreate` を使ってエージェント毎にタスクを作成
3. `team_name: "unleash-wave-1"` と `subagent_type` をエージェントタイプ（例: `kabalist`、`geometrist`）に設定して `Agent` ツールで各エージェントをチームメイトとして生成
4. `owner` 付き `TaskUpdate` を介してチームメイトにタスクを割り当て
5. `TaskList` を介して進捗を監視 — チームメイトは終わるとタスクを完了とマーク
6. 波の間で、`SendMessage({ type: "shutdown_request" })` を介して現チームをシャットダウンし、更新されたブリーフ（ステップ4）で次のチームを作成

これは組込調整を与える: 共有タスクリストがどのエージェントが応答したかを追跡し、チームメイトは follow-up のためにメッセージされ、リードはタスク割り当てを通じて波遷移を管理する。

#### Option B: 生 Agent 生成（より小さい実行用、より単純）

波の各エージェントについて、ブリーフとドメイン固有フレーミング付きで生成:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

`run_in_background: true` で Agent ツールを使って波内のすべてのエージェントを同時に起動する。波間知識注入を可能にするため次の波を起動する前に波が完了するのを待つ（ステップ4）。

#### オプションの選択

| | TeamCreate | Raw Agent |
|---|---|---|
| Best for | Tier 3 full unleash (40+ agents) | Tier 2 panel (5-10 agents) |
| Coordination | Task list, messaging, ownership | Fire-and-forget, manual collection |
| Inter-wave handoff | Task status carries over | Must track manually |
| Overhead | Higher (team setup per wave) | Lower (single tool call per agent) |

**期待結果：** 各波が 2-5 分以内に ~10 構造化応答を返す。応答に失敗するまたはオフフォーマット出力を返すエージェントは記されるがパイプラインをブロックしない。

**失敗時：** 波の 50% 超が失敗するなら、ブリーフの明確さを確認する。一般的原因: 出力テンプレートが曖昧、または非ドメインエージェントが推論するに例が不十分。

### ステップ4: 波間知識を注入する（早期停止を評価）

波 1-2 の後、次の波を起動する前に現れる信号を抽出する。

1. 完了した波からの応答を繰り返しテーマでスキャン
2. 最も一般的な仮説ファミリー（収束信号）を特定
3. **早期停止閾値を確認**: 20 エージェント後にトップファミリーが既に null モデル期待の 3x を超えるなら、強い信号がある。Wave 3 を adversarial + 精緻化波として計画し、その後の停止を検討
4. 次の波のためにブリーフを更新:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**早期停止ガイダンス**: すべての unleash がすべてのエージェントを必要とするわけではない。よく定義された問題ドメイン（例: コードベース解析）には、収束はしばしば 30-40 エージェントで安定する。抽象的またはオープンエンドな問題（例: 未知の数学変換）には、正しいドメインが真に予測不能なため、フルロスターが価値を加える。各波後に収束を確認 — トップファミリーのカウントと null モデル比が plateau しているなら、追加波は減少する戻りを yield する。

これが再発見（後の波が独立に早い波が既に見つけたものを再導出する）を防ぎ、後のエージェントを問題の縁へ向ける。

**期待結果：** 後の波が現れる合意のギャップに対処するより微妙でターゲット化された仮説を生む。

**失敗時：** 2 波後に収束が現れないなら、問題が制約不足かもしれない。スコープを狭めるかより多くの例を提供することを検討する。

### ステップ5: 集めて重複排除する

すべての波が完了したら、すべての応答を単一ドキュメントに集める。仮説をファミリーにグループ化して重複排除:

1. すべての仮説声明を抽出
2. メカニズムでクラスタ（語法ではなく — 「modular arithmetic mod 94」と「cyclic group over Z_94」は同じファミリー）
3. ファミリーあたりの独立発見をカウント
4. 収束でランク: より多くのエージェントによって独立に発見されたファミリーが上位にランク

**期待結果：** 収束カウント、貢献エージェント、代表的テスト可能予測を伴う仮説ファミリーのランク付きリスト。

**失敗時：** すべての仮説が一意（収束なし）なら、信号対ノイズ比が低すぎる。問題がより多くの例を必要とするか、エージェントがより厳しい出力フォーマットを必要とする。

### ステップ6: Null モデルに対して検証する

収束が共有訓練データの成果物ではなく意味があることを保証するため、null モデルに対してトップ仮説をテストする。

- **プログラム的検証**: 仮説がテスト可能な公式またはアルゴリズムを生むなら、保留例に対して実行
- **Null モデル**: N エージェントが偶然で同じ仮説ファミリーに収束する確率を見積もる（例: K 妥当な仮説ファミリーがあれば、ランダム収束確率は ~N/K）
- **閾値**: 収束が null モデル期待の 3x を超えるなら信号が意味がある

**期待結果：** トップ仮説ファミリーが偶然レベル収束を有意に超えるか、プログラム的検証をパスする。

**失敗時：** トップ仮説が検証に失敗したら、第二ランクファミリーを確認する。どのファミリーもパスしなければ、問題は異なるアプローチ（より深い単一専門家解析、より多くのデータ、再定式化された例）を要するかもしれない。

### ステップ7: Adversarial 精緻化

**好まれるタイミング: 合成後ではなく Wave 3。** Wave 3 に（波間知識注入と並んで）`advocatus-diaboli` を含めることが、すべての波が完了した後の独立した adversarial パスより効果的。早期挑戦が Waves 4+ を、挑戦されていない合意に積み重ねるのではなく批判に対して精緻化させる。

adversarial パスが既に Wave 3 の一部だったなら、このステップは最終確認になる。そうでなければ（例: それなしに全波を実行した）、今 `advocatus-diaboli`（または `senior-researcher`）を生成する。構造化されたパスには、合意に対して並列に作業する両エージェントを伴うレビューチームを立てるため `TeamCreate` を使う:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**期待結果：** 反論、エッジケース、反証実験のセット。仮説が adversarial 精査を生き残るなら、統合の準備ができている。良い adversarial パスは時に合意を *部分的に擁護する* — 不完全でも設計が代替よりも良いと見出す。

**失敗時：** adversarial エージェントが致命的欠陥を見出したら、批判をターゲット化されたフォローアップ波（Tier 3+ 反復モード — 特定批判に対処するに最も位置付けられた 5-10 エージェントを選ぶ）にフィードバックする。

### ステップ8: チームに引き渡す

Unleash は問題を見つけ、チームがそれらを解決する。検証された仮説ファミリーを実行可能な issue に変換し、それから各々を解決する焦点的チームを組み立てる。

1. 検証された仮説ファミリー毎に GitHub issue を作成（`create-github-issues` スキルを使う）
2. 収束強度とインパクトで issue を優先順位付け
3. 各 issue について、`TeamCreate` を介して小チームを組み立てる:
   - 問題ドメインに合う `teams/` の事前定義チーム定義があれば、それを使う
   - 適合チームが存在しなければ、`opaque-team`（適応的役割割り当てを伴う N shapeshifters）を既定とする — それはカスタム構成を要求せずに未知の問題形を扱う
   - 少なくとも 1 つの非技術エージェント（例: `advocatus-diaboli`、`contemplative`）を含む — 技術エージェントが見逃す実装リスクを彼らが捕える
   - 急ぎを防ぐためフェーズ間で REST チェックポイントを使う
4. パイプラインは: **unleash → triage → team-per-issue → resolve**

**期待結果：** 各仮説ファミリーがチームが割り当てられた追跡 issue にマップする。Unleash が診断を生み、チームが修正を生む。

**失敗時：** チーム構成が問題に合わなければ、再割り当てする。Shapeshifter エージェントは研究と設計はできるが書き込みツールを持たない — チームリードが彼らのコード提案を適用しなければならない。

## バリデーション

- [ ] すべての利用可能エージェントが相談された（または意図的なサブセットが正当化と共に選ばれた）
- [ ] 応答が構造化、解析可能なフォーマットで集められた
- [ ] 仮説が独立収束で重複排除されランクされた
- [ ] トップ仮説が null モデルまたはプログラム的テストに対して検証された
- [ ] adversarial パスが合意に挑戦した
- [ ] 最終仮説がテスト可能予測と既知の制限を含む

## よくある落とし穴

- **ブリーフの例が少なすぎる**: エージェントはパターンを見つけるに 5+ 例が必要。3 例では、ほとんどのエージェントが表面レベルパターンマッチングまたはテンプレートエコー（異なる言葉でブリーフを繰り返す）に頼る。
- **検証経路なし**: 仮説をテストする方法なしには、信号をノイズと区別できない。収束だけでは必要だが十分でない。
- **メタファー応答**: ドメイン専門エージェント（mystic、shaman、kabalist）は解析が難しい豊かなメタファー的推論で応答するかもしれない。出力テンプレートに「あなたの仮説をテスト可能な公式またはアルゴリズムとして表現」を含める。
- **波を越える再発見**: 波間知識注入なしでは、波 3-7 が独立に波 1-2 が既に見つけたものを再発見する。常に波の間でブリーフを更新する。
- **収束を過剰解釈**: メカニズムファミリーへの 43% 収束は印象的に聞こえるが、ベースレートを確認する。妥当なメカニズムファミリーが 3 つしかないなら、ランダム収束は ~33%。
- **単一ファミリー支配を期待**: 抽象問題（パターン認識、暗号）は一つの支配的仮説ファミリーを生む傾向がある。多次元問題（コードベース解析、システム設計）は複数の有効ファミリーにわたって広い収束を生む — これはパターンの失敗ではなく予想され健全。
- **非技術エージェントへの汎用フレーミング**: 非技術エージェントの貢献の質は、ブリーフが彼らのドメイン言語で問題をどうフレームするかに依存する。「あなたの伝統はこの閾値のシステムについて何を言うか？」は構造的洞察を生む; 汎用ブリーフは何も生まない。問題の自然なドメイン外のエージェントにはドメイン固有フレーミングに投資する。
- **これを実行に使う**: このパターンは仮説を生成し、実装ではない。検証された仮説を持ったら、それらを issue に変換しチームに引き渡す（ステップ8）。パイプラインは unleash → triage → team-per-issue。

## 関連スキル

- `forage-solutions` — 解空間探索のためのアントコロニー最適化（補完: より狭いスコープ、より深い探索）
- `build-coherence` — 競合アプローチ間で選ぶための bee 民主主義（このスキル後にトップ仮説間で選ぶために使う）
- `coordinate-reasoning` — エージェント間情報フロー管理のためのスティグマージック調整
- `coordinate-swarm` — 分散システムのためのより広いスワーム調整パターン
- `expand-awareness` — 狭める前のオープン知覚（補完: 個別エージェント準備として使う）
- `meditate` — 起動前に文脈ノイズをクリア（ステップ1 の前に推奨）
