---
name: create-agent
description: >
  agent-almanacエージェントテンプレートとレジストリ規則に従って新しい
  エージェント定義ファイルを作成する。ペルソナ設計、ツール選択、スキル
  割り当て、モデル選択、フロントマタースキーマ、必須セクション、レジストリ
  統合、発見シンリンクの確認をカバーする。新しい専門エージェントをライブラリ
  に追加する場合、Claude Codeサブエージェントのペルソナを定義する場合、
  またはキュレートされたスキルとツールを持つドメイン固有のアシスタントを
  作成する場合に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, creation, persona, agentskills
---

# 新しいエージェントを作成する

焦点を絞った目的、キュレートされたツール、割り当てられたスキル、エージェントテンプレートとレジストリ規則に従った完全なドキュメントを持つClaude Codeサブエージェントのペルソナを定義する。

## 使用タイミング

- まだカバーされていないドメインの新しい専門エージェントをライブラリに追加する場合
- 繰り返されるワークフローまたはプロンプトパターンを再利用可能なエージェントペルソナに変換する場合
- キュレートされたスキルと制約されたツールを持つドメイン固有のアシスタントを作成する場合
- 過度に広いエージェントを焦点を絞った単一責任エージェントに分割する場合
- マルチエージェントチームを構成する前に新しいチームメンバーを設計する場合

## 入力

- **必須**: エージェント名（小文字ケバブケース、例: `data-engineer`）
- **必須**: エージェントの主要目的の一行説明
- **必須**: エージェントが解決する問題を説明する目的ステートメント
- **任意**: モデルの選択（デフォルト: `sonnet`; 代替: `opus`、`haiku`）
- **任意**: 優先度レベル（デフォルト: `normal`; 代替: `high`、`low`）
- **任意**: `skills/_registry.yml` から割り当てるスキルのリスト
- **任意**: エージェントが必要とするMCPサーバー（例: `r-mcptools`、`hf-mcp-server`）

## 手順

### ステップ1: エージェントペルソナを設計する

エージェントに明確で焦点を絞ったアイデンティティを選ぶ:

- **名前**: 小文字ケバブケース、役割の説明的なもの。名詞またはドメイン修飾子で始める: `security-analyst`、`r-developer`、`tour-planner`。`helper` や `assistant` などの一般的な名前を避ける。
- **目的**: このエージェントが解決する特定の問題を説明する一段落。問う: 「このエージェントは既存のエージェントがカバーしていない何をするか?」
- **コミュニケーションスタイル**: ドメインを考慮する。技術的なエージェントは正確で引用が豊富であるべき。クリエイティブなエージェントはより探索的になれる。コンプライアンスエージェントは正式で監査指向であるべき。

進める前に、既存の53エージェントとの重複を確認する:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**期待結果：** 既存のエージェントが同じニッチをカバーしていない。既存のエージェントが部分的に重複している場合、新しいエージェントを作成する代わりにそのエージェントを拡張することを検討する。

**失敗時：** 重大な重複を持つエージェントが存在する場合、そのエージェントのスキルリストを拡張するか、新しいエージェントのスコープを既存のエージェントと補完するように絞り込む。

### ステップ2: ツールを選択する

エージェントが必要とする最小限のツールセットを選ぶ。最小権限の原則が適用される:

| ツールセット | 使用タイミング | エージェント例 |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | 読み取り専用の分析、レビュー、監査 | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | 分析プラス外部検索 | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | 完全な開発 — コードの作成/変更 | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | 開発プラス外部調査 | polymath, shapeshifter |

コードのみを分析するエージェントには `Bash` を含めない。外部リソースを検索する必要が本当にある場合を除いて `WebFetch` や `WebSearch` を含めない。

**期待結果：** ツールリストにエージェントの主要なワークフローで実際に使用するツールのみが含まれている。

**失敗時：** エージェントの機能リストを確認する — 機能がツールを必要としない場合、そのツールを削除する。

### ステップ3: モデルを選択する

タスクの複雑さに基づいてモデルを選択する:

- **`sonnet`** （デフォルト）: ほとんどのエージェント。推論と速度の良いバランス。開発、レビュー、分析、標準的なワークフローに使用。
- **`opus`**: 複雑な推論、マルチステップ計画、微妙な判断。シニアレベルのエージェント、アーキテクチャの決定、深いドメイン専門知識を必要とするタスクに使用。
- **`haiku`**: シンプルで高速な応答。単純な検索、フォーマット、またはテンプレート入力を行うエージェントに使用。

**期待結果：** モデルがエージェントの主要なユースケースの認知的要求に一致する。

**失敗時：** 疑わしい場合は `sonnet` を使用する。テストで推論品質が不十分であることが明らかになった場合のみ `opus` にアップグレードする。

### ステップ4: スキルを割り当てる

スキルレジストリを参照し、エージェントのドメインに関連するスキルを選択する:

```bash
# ドメインのすべてのスキルを一覧表示する
grep -A3 "domain-name:" skills/_registry.yml

# キーワードでスキルを検索する
grep -i "keyword" skills/_registry.yml
```

フロントマターのスキルリストを構築する:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**重要**: すべてのエージェントはレジストリレベルの `default_skills` フィールドからデフォルトスキル（`meditate`、`heal`）を自動的に継承する。これらをエージェントのフロントマターに一覧する必要はない。ただし、それがエージェントの方法論の核心である場合を除く（例: `mystic` エージェントは瞑想の促進が主な目的であるため `meditate` を一覧する）。

**期待結果：** スキルリストに `skills/_registry.yml` に存在する3〜15のスキルIDが含まれている。

**失敗時：** 各スキルIDが存在することを確認する: `grep "id: skill-name" skills/_registry.yml`。一致しないものは削除する。

### ステップ5: エージェントファイルを作成する

テンプレートをコピーしてフロントマターを入力する:

```bash
cp agents/_template.md agents/<agent-name>.md
```

YAMLフロントマターを入力する:

```yaml
---
name: agent-name
description: One to two sentences describing primary capability and domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Note: All agents inherit default skills (meditate, heal) from the registry.
# Only list them here if they are core to this agent's methodology.
# mcp_servers: []  # Uncomment and populate if MCP servers are needed
---
```

**期待結果：** YAMLフロントマターがエラーなく解析される。必須フィールド（`name`、`description`、`tools`、`model`、`version`、`author`）がすべて存在する。

**失敗時：** YAML構文を検証する。一般的な問題: バージョン文字列のクォーテーション欠落、不正なインデント、ツールリストの閉じていない括弧。

### ステップ6: 目的と機能を作成する

テンプレートのプレースホルダーセクションを置き換える:

**目的**: このエージェントが解決する特定の問題と提供する価値を説明する一段落。具体的にする — ドメイン、ワークフロー、結果を名前を挙げる。

**機能**: 太字のリードインを持つ箇条書きリスト。エージェントに多くの機能がある場合はカテゴリでグループ化する:

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**利用可能なスキル**: 割り当てた各スキルを簡単な説明で一覧する。スキルIDのまま（スラッシュコマンド名）を使用する:

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**期待結果：** 目的が具体的で（「開発を助ける」ではない）、機能が具体的で検証可能で、スキルリストがフロントマターと一致する。

**失敗時：** 目的が曖昧に感じられる場合、「このエージェントに何を依頼するか?」と答える。その答えを目的として使用する。

### ステップ7: 使用シナリオと例を作成する

エージェントのスポーンの仕方を示す2〜3の使用シナリオを提供する:

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

ユーザーリクエストと期待されるエージェントの動作を示す1〜2の具体的な例を追加する:

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**期待結果：** シナリオが現実的で、例が実際の価値を示し、呼び出しパターンがClaude Codeの規則と一致する。

**失敗時：** 例を精神的にテストする — エージェントは割り当てられたツールとスキルでリクエストを実際に実行できるか?

### ステップ8: 制限事項と「参照」を作成する

**制限事項**: 3〜5の正直な制約。エージェントができないこと、使用すべきでないこと、または貧しい結果を生む場所:

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**参照**: 補完的なエージェント、関連するガイド、関連するチームへのクロスリファレンス:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**期待結果：** 制限事項が正直で具体的。「参照」が存在するファイルを参照している。

**失敗時：** 参照されているファイルが存在することを確認する: `ls agents/complementary-agent.md`。

### ステップ9: レジストリに追加する

`agents/_registry.yml` を編集し、アルファベット順の位置に新しいエージェントエントリを追加する:

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Same one-line description from frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

ファイルの先頭の `total_agents` カウントをインクリメントする。

**期待結果：** レジストリエントリがエージェントファイルのフロントマターと一致する。`total_agents` が実際のエージェントエントリ数と等しい。

**失敗時：** `grep -c "^  - id:" agents/_registry.yml` でエントリをカウントし、`total_agents` と一致することを確認する。

### ステップ10: 発見を確認する

Claude Codeは `.claude/agents/` ディレクトリからエージェントを発見する。このリポジトリでは、そのディレクトリが `agents/` へのシンリンクだ:

```bash
# シンリンクが存在し解決されることを確認する
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

`.claude/agents/` シンリンクが無傷であれば、追加のアクションは必要ない — 新しいエージェントファイルは自動的に発見可能だ。

READMEオートメーションを実行してエージェントREADMEを更新する:

```bash
npm run update-readmes
```

**期待結果：** `.claude/agents/<agent-name>.md` が新しいエージェントファイルに解決される。`agents/README.md` に新しいエージェントが含まれている。

**失敗時：** シンリンクが壊れている場合、再作成する: `ln -sf ../agents .claude/agents`。`npm run update-readmes` が失敗する場合、`scripts/generate-readmes.js` が存在し `js-yaml` がインストールされていることを確認する。

## バリデーション

- [ ] エージェントファイルが `agents/<agent-name>.md` に存在する
- [ ] YAMLフロントマターがエラーなく解析される
- [ ] 必須フィールドすべてが存在する: `name`、`description`、`tools`、`model`、`version`、`author`
- [ ] `name` フィールドがファイル名（`.md` 除く）と一致する
- [ ] すべてのセクションが存在する: 目的、機能、利用可能なスキル、使用シナリオ、例、制限事項、参照
- [ ] フロントマターのスキルが `skills/_registry.yml` に存在する
- [ ] デフォルトスキル（`meditate`、`heal`）はエージェントの方法論の核心でない限り一覧されていない
- [ ] ツールリストが最小権限原則に従っている
- [ ] エージェントが `agents/_registry.yml` に正しいパスと一致するメタデータで一覧されている
- [ ] レジストリの `total_agents` カウントが更新されている
- [ ] `.claude/agents/` シンリンクが新しいエージェントファイルに解決される
- [ ] 既存のエージェントとの重大な重複がない

## よくある落とし穴

- **ツールの過剰プロビジョニング**: エージェントが読んで分析するだけの場合に `Bash`、`Write`、または `WebFetch` を含める。これは最小権限に違反し、意図しない副作用につながる可能性がある。最小限のセットから始め、機能がツールを必要とする場合にのみツールを追加する。
- **スキル割り当ての欠落または誤り**: レジストリに存在しないスキルIDを一覧するか、スキルを割り当てることを完全に忘れる。常に `grep "id: skill-name" skills/_registry.yml` で各スキルIDを確認してから追加する。
- **デフォルトスキルの不必要な一覧**: レジストリからすでに継承されている場合に `meditate` や `heal` をエージェントフロントマターに追加する。方法論の核心である場合（例: `mystic`、`alchemist`、`gardener`、`shaman`）にのみ一覧する。
- **既存エージェントとのスコープの重複**: 既存の53エージェントのいずれかによって既にカバーされている機能を複製する新しいエージェントを作成する。常にレジストリを先に検索し、代わりに既存エージェントのスキルを拡張することを検討する。
- **曖昧な目的と機能**: 「開発を助ける」ではなく「完全な構造、文書化、CI/CD設定でRパッケージを足場する」と書く。具体性こそがエージェントを有用で発見可能にする。

## 関連スキル

- `create-skill` - エージェントファイルの代わりにSKILL.mdファイルを作成するための並行手順
- `create-team` - 複数のエージェントを調整されたチームに構成する（予定）
- `commit-changes` - 新しいエージェントファイルとレジストリ更新をコミットする
