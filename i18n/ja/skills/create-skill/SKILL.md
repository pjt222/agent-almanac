---
name: create-skill
description: >
  Agent Skills オープン標準（agentskills.io）に従って新しいSKILL.mdファイルを
  作成する。フロントマタースキーマ、セクション構造、Expected/On failureペアを
  持つ効果的な手順の作成、バリデーションチェックリスト、クロスリファレンス、
  レジストリ統合をカバーする。繰り返し可能な手順をエージェント用に体系化する
  場合、スキルライブラリに新しい機能を追加する場合、ガイドやランブックを
  エージェント消費可能な形式に変換する場合、またはプロジェクトやチーム間で
  ワークフローを標準化する場合に使用する。
locale: ja
source_locale: en
source_commit: b4dd42cd
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
---

# 新しいスキルの作成

エージェントシステムが特定の手順を実行するために消費できるSKILL.mdファイルを作成する。

## 使用タイミング

- エージェントが従うべき繰り返し可能な手順を体系化する場合
- スキルライブラリに新しい機能を追加する場合
- ガイド、ランブック、チェックリストをエージェント消費可能な形式に変換する場合
- プロジェクトやチーム間でワークフローを標準化する場合

## 入力

- **必須**: スキルが達成すべきタスク
- **必須**: `skills/_registry.yml` の48ドメインのうちの1つのドメイン分類:
  `r-packages`, `jigsawr`, `containerization`, `reporting`, `compliance`, `mcp-integration`,
  `web-dev`, `git`, `general`, `citations`, `data-serialization`, `review`, `bushcraft`,
  `esoteric`, `design`, `defensive`, `project-management`, `devops`, `observability`, `mlops`,
  `workflow-visualization`, `swarm`, `morphic`, `alchemy`, `tcg`, `intellectual-property`,
  `gardening`, `shiny`, `animal-training`, `mycology`, `prospecting`, `crafting`,
  `library-science`, `travel`, `relocation`, `a2a-protocol`, `geometry`, `number-theory`,
  `stochastic-processes`, `theoretical-science`, `diffusion`, `hildegard`, `maintenance`,
  `blender`, `visualization`, `3d-printing`, `lapidary`, `versioning`
- **必須**: 複雑度レベル（basic、intermediate、advanced）
- **任意**: ソース素材（既存のガイド、ランブック、または動作例）
- **任意**: クロスリファレンスする関連スキル

## 手順

### ステップ1: ディレクトリを作成する

各スキルは独自のディレクトリに存在する:

```bash
mkdir -p skills/<skill-name>/
```

命名規則:
- 小文字ケバブケースを使用する: `submit-to-cran`（`SubmitToCRAN` ではなく）
- 動詞で始める: `create-`、`setup-`、`write-`、`deploy-`、`configure-`
- 具体的にする: `create-r-dockerfile`（`create-dockerfile` ではなく）

**期待結果：** ディレクトリ `skills/<skill-name>/` が存在し、名前が動詞で始まる小文字ケバブケースに従っている。

**失敗時：** 名前が動詞で始まっていない場合、ディレクトリを名前変更する。命名の競合を確認する: `ls skills/ | grep <keyword>` で既存のスキルに重複する名前がないことを確認する。

### ステップ2: YAMLフロントマターを作成する

```yaml
---
name: skill-name-here
description: >
  One to three sentences plus key activation triggers. Must be clear
  enough for an agent to decide whether to activate this skill from
  the description alone. Max 1024 characters. Start with a verb.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # optional, experimental
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**必須フィールド**: `name`、`description`

**任意フィールド**: `license`、`allowed-tools`（実験的）、`metadata`、`compatibility`

**メタデータの規則**:
- `complexity`: basic（5ステップ未満、エッジケースなし）、intermediate（5〜10ステップ、判断が必要）、advanced（10ステップ以上、重要なドメイン知識）
- `language`: 主要言語; クロス言語スキルには `multi` を使用
- `tags`: 3〜6タグ; ドメイン名を含める

**期待結果：** YAMLフロントマターがエラーなく解析され、`name` がディレクトリ名と一致し、`description` が1024文字未満で明確なアクティベーショントリガーがある。

**失敗時：** 一致する `---` デリミタ、バージョン文字列の適切なクォーテーション（例: `"1.0"`（`1.0` ではなく））、descriptionフィールドの正しい `>` 複数行フォールディング構文を確認してYAMLを検証する。

### ステップ3: タイトルとイントロダクションを作成する

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

タイトルは `name` と一致するが人間が読める形式にする。「Submit to CRAN」（`submit-to-cran` ではなく）。

**期待結果：** 命令形の最上位 `#` 見出しに続いて、スキルが達成することを述べた簡潔な段落がある。

**失敗時：** タイトルが動詞句ではなく名詞句として読める場合、書き直す。「Package Submission」は「Submit to CRAN」になる。

### ステップ4: 「使用タイミング」を作成する

エージェントがこのスキルをアクティブにするべき3〜5つのトリガー条件を列挙する:

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

エージェントの視点から書く。これらはエージェントがアクティベーションを決定するために確認する条件だ。

> **注意**: 最も重要なトリガー条件は `description` フロントマターフィールドにも表示すべきだ。完全な本文が読み込まれる前の発見フェーズで読まれるためだ。`## When to Use` セクションは追加の詳細とコンテキストを提供する。

**期待結果：** エージェントがこのスキルをアクティブにするべき具体的で観察可能な条件を説明した3〜5つの箇条書き。

**失敗時：** トリガーが曖昧に感じられる場合（「何かをする必要があるとき」）、エージェントの視点から書き直す: どの観察可能な状態またはユーザーリクエストがアクティベーションをトリガーするか?

### ステップ5: 「入力」を作成する

必須と任意を分ける。型とデフォルトについて具体的にする:

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**期待結果：** 入力セクションが必須と任意のパラメータを明確に分け、それぞれに型ヒントと適用可能なデフォルト値がある。

**失敗時：** パラメータの型が曖昧な場合、括弧内に具体的な例を追加する: 「パッケージ名（小文字、`.` 以外の特殊文字なし）」。

### ステップ6: 「手順」を作成する

これがスキルの核心だ。各ステップはこのパターンに従う:

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**効果的なステップの作成**:
- 各ステップは独立して検証可能であるべき
- 実際のコードを含め、疑似コードではない
- 最も一般的なパスを最初に置き、エッジケースは「失敗時」に
- 5〜10ステップが最適。5未満は曖昧すぎる可能性があり、12を超えると複数のスキルに分割すべき
- 実際のツールと実際のコマンドを参照し、抽象的な説明ではない

**期待結果：** 手順セクションに5〜12の番号付きステップがあり、それぞれに具体的なコード、`**Expected:**` の結果、`**On failure:**` の回復アクションがある。

**失敗時：** ステップにコードがない場合、実際のコマンドまたは設定を追加する。Expected/On failureが欠けている場合、今すぐ書く — 失敗する可能性のあるすべてのステップに両方が必要だ。

### ステップ7: 「バリデーション」を作成する

手順完了後にエージェントが実行するチェックリスト:

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

各アイテムは客観的に検証可能でなければならない。「コードがクリーン」は悪い。「`devtools::check()` が0エラーを返す」は良い。

**期待結果：** エージェントがプログラム的または検査によって確認できる3〜8のバイナリ合否基準を持つmarkdownチェックリスト（`- [ ]`）。

**失敗時：** 主観的な基準を測定可能なものに置き換える。「十分に文書化されている」は「すべてのエクスポートされた関数に `@param`、`@return`、`@examples` のroxygenタグがある」になる。

### ステップ8: 「よくある落とし穴」を作成する

原因と回避策を含む3〜6つの落とし穴:

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

実際の経験から引き出す。最良の落とし穴は、大幅な時間を無駄にし、非自明なものだ。

**期待結果：** 3〜6の落とし穴があり、それぞれに太字の名前、何が問題になるかの説明、回避方法がある。

**失敗時：** 落とし穴が一般的に感じられる場合（「Xに注意する」）、具体的にする: 症状、原因、修正を名前を挙げる。開発中やテスト中に遭遇した実際の失敗シナリオから引き出す。

### ステップ9: 「関連スキル」を作成する

このスキルの前後または並行して一般的に使用される2〜5のスキルをクロスリファレンスする:

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

スキルの `name` フィールド（ケバブケース）を使用し、タイトルではない。

**期待結果：** 2〜5の関連スキルが、関係（前提条件、フォローアップ、代替）の簡単な説明とともにケバブケースのIDで一覧されている。

**失敗時：** 参照された各スキルが存在することを確認する: `ls skills/<skill-name>/SKILL.md`。名前変更または削除されたスキルへの参照を削除する。

### ステップ10: レジストリに追加する

`skills/_registry.yml` を編集し、適切なドメインに新しいスキルを追加する:

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

レジストリの先頭の `total_skills` カウントを更新する。

**期待結果：** `skills/_registry.yml` の正しいドメインに新しいエントリが表示され、`total_skills` カウントがディスク上のスキルディレクトリの実際の数と一致する。

**失敗時：** `find skills -name SKILL.md | wc -l` でディスク上のスキルをカウントし、レジストリの `total_skills` と比較する。`id` フィールドがディレクトリ名と完全に一致することを確認する。

### ステップ11: 引用を追加する（任意）

スキルが確立されたメソドロジー、研究論文、ソフトウェアパッケージ、または標準に基づいている場合、`references/` ディレクトリに引用サブファイルを追加する:

```bash
mkdir -p skills/<skill-name>/references/
```

2つのファイルを作成する:

- **`references/CITATIONS.bib`** — 機械可読なBibTeX（真実のソース）
- **`references/CITATIONS.md`** — GitHubブラウジング用の人間が読める形式の参照

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

```markdown
<!-- references/CITATIONS.md -->
# Citations

References underpinning the **skill-name** skill.

1. Author, F., & Other, S. (2024). *Paper Title*. Journal Name. https://doi.org/10.xxxx/xxxxx
```

引用は任意 — 出所の追跡が重要な場合（学術的な方法、公開された標準、規制フレームワーク）に追加する。

**期待結果：** 両方のファイルが存在し、`.bib` が有効なBibTeXとして解析される。

**失敗時：** `bibtool -d references/CITATIONS.bib` またはオンラインバリデーターでBibTeX構文を検証する。

### ステップ12: スキルを検証する

コミット前にローカル検証チェックを実行する:

```bash
# 行数を確認する（≤500でなければならない）
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# 必須フロントマターフィールドを確認する
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**期待結果：** 行数≤500、すべての必須フィールドが存在する。

**失敗時：** 500行を超える場合、プログレッシブディスクロージャーを適用する — 大きなコードブロック（15行超）を `references/EXAMPLES.md` に抽出する:

```bash
mkdir -p skills/<skill-name>/references/
```

拡張コード例、完全な設定ファイル、複数バリアントの例を `references/EXAMPLES.md` に移動する。SKILL.mdにクロスリファレンスを追加する: `See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` 簡単なインラインスニペット（3〜10行）はメインのSKILL.mdに残す。`.github/workflows/validate-skills.yml` のCIワークフローは、すべてのPRでこれらの制限を適用する。

### ステップ13: スラッシュコマンドのシンリンクを作成する

Claude Codeがスキルを `/slash-command` として発見できるようにシンリンクを作成する:

```bash
# プロジェクトレベル（このプロジェクトで利用可能）
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# グローバル（すべてのプロジェクトで利用可能）
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**期待結果：** `ls -la .claude/skills/<skill-name>/SKILL.md` がスキルファイルに解決される。

**失敗時：** 相対パスが正しいことを確認する。`.claude/skills/` から、パス `../../skills/<skill-name>` がスキルディレクトリに到達するべきだ。シンリンクの解決をデバッグするには `readlink -f` を使用する。Claude Codeは `.claude/skills/<name>/SKILL.md` にフラット構造を期待する。

### ステップ14: 翻訳ファイルを生成する

> **すべてのスキルに必須。** このステップは、この手順に従う人間の著者とAIエージェントの両方に適用される。スキップしない — 欠落した翻訳は古いバックログとして蓄積される。

新しいスキルをコミットした直後に、サポートされている4つのロケールすべての翻訳ファイルを生成する:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

その後、各ファイル内の生成されたプロセを翻訳する（コードブロックとIDは英語のまま）。最後にステータスファイルを再生成する:

```bash
npm run translation:status
```

**期待結果：** `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md` に4つのファイルが作成され、すべての `source_commit` が現在のHEADと一致する。`npm run validate:translations` は新しいスキルに対して0件の古さ警告を示す。

**失敗時：** 足場作りが失敗した場合、生成する前にスキルが `skills/_registry.yml` に存在するか確認する — スクリプトはレジストリを読み込む。`translation:status` が新しいファイルを古いと表示する場合、`source_commit` が英語ソースが最後に変更されたコミットハッシュと一致しているか確認する。

## バリデーション

- [ ] SKILL.mdが `skills/<skill-name>/SKILL.md` に存在する
- [ ] YAMLフロントマターがエラーなく解析される
- [ ] `name` フィールドがディレクトリ名と一致する
- [ ] `description` が1024文字未満である
- [ ] 必須セクションすべてが存在する: 使用タイミング、入力、手順、バリデーション、よくある落とし穴、関連スキル
- [ ] すべての手順ステップに具体的なコードとExpected/On failureペアがある
- [ ] 関連スキルが有効なスキル名を参照している
- [ ] スキルが `_registry.yml` に正しいパスで一覧されている
- [ ] レジストリの `total_skills` カウントが更新されている
- [ ] SKILL.mdが≤500行（超える場合は `references/EXAMPLES.md` に抽出する）
- [ ] スキルが公開された方法に基づいている場合、引用が `references/CITATIONS.bib` と `CITATIONS.md` に追加されている
- [ ] `.claude/skills/<skill-name>` にシンリンクがスキルディレクトリを指して存在する
- [ ] グローバルシンリンクが `~/.claude/skills/<skill-name>` に存在する（グローバルで利用可能な場合）

## よくある落とし穴

- **曖昧な手順**: 「システムを適切に設定する」はエージェントには役に立たない。正確なコマンド、ファイルパス、設定値を提供する。
- **On failureの欠如**: 失敗する可能性のあるすべてのステップには回復のガイダンスが必要だ。エージェントは即興できない — フォールバックを明確にする必要がある。
- **過度に広いスコープ**: 「開発環境全体をセットアップする」をカバーしようとするスキルは、3〜5つの焦点を絞ったスキルにすべきだ。1スキル = 1手順。
- **テスト不可能なバリデーション**: 「コードの品質が良い」は確認できない。「リンターが0警告でパスする」は確認できる。
- **古くなったクロスリファレンス**: スキルを名前変更または削除する場合、すべての関連スキルセクションで古い名前をgrepする。
- **説明が長すぎる**: descriptionフィールドはエージェントがアクティベーションを決定するために読むもの。1024文字以内に保ち、主要情報を最初に置く。
- **NTFS マウントパスでの `git mv` を避ける（WSL）**: `/mnt/` パスでは、ディレクトリの `git mv` が壊れたパーミッション（`d?????????`）を作成する可能性がある。代わりに `mkdir -p` + ファイルのコピー + 古いパスの `git rm` を使用する。[環境ガイド](../../guides/setting-up-your-environment.md)のトラブルシューティングセクションを参照。

## 例

よく構造化されたスキルはこの品質チェックリストに従う:
1. エージェントが説明だけからそれを使用するかどうかを決定できる
2. 手順が曖昧さなく機械的に従える
3. すべてのステップに検証可能な結果がある
4. 失敗モードに具体的な回復パスがある
5. スキルが関連するスキルと組み合わせられる

このライブラリのサイズリファレンス:
- 基本スキル: 約80〜120行（例: `write-vignette`、`configure-git-repository`）
- 中級スキル: 約120〜180行（例: `write-testthat-tests`、`manage-renv-dependencies`）
- 上級スキル: 約180〜250行（例: `submit-to-cran`、`setup-gxp-r-project`）
- 拡張例を持つスキル: SKILL.md ≤500行 + 大きな設定用の `references/EXAMPLES.md`

## 関連スキル

- `evolve-skill` - この手順で作成されたスキルの進化と改良
- `create-agent` - エージェント定義を作成するための並行手順
- `create-team` - チーム構成を作成するための並行手順
- `write-claude-md` - CLAUDE.mdはプロジェクト固有のワークフローのスキルを参照できる
- `configure-git-repository` - スキルはバージョン管理されるべきだ
- `commit-changes` - 新しいスキルとそのシンリンクをコミットする
- `security-audit-codebase` - 誤って含まれた秘密情報や認証情報のスキルをレビューする
