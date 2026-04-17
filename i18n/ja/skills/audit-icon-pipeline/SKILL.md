---
name: audit-icon-pipeline
description: >
  レジストリとグリフマッピングファイル、アイコンディレクトリ、マニフェストを比較して、
  欠落しているグリフ、アイコン、およびHDバリアントを検出する。すべてのパレットにわたる
  スキル、エージェント、チームのギャップを報告する。
license: MIT
allowed-tools: Read Bash Grep Glob
locale: ja
source_locale: en
source_commit: e4ffbae4
translator: claude
translation_date: "2026-03-18"
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# アイコンパイプライン監査

レジストリとグリフマッピングファイル、アイコンディレクトリ、マニフェストを比較することで、欠落しているグリフ、欠落しているアイコン、古いマニフェストを検出する。スキル、エージェント、チームをカバーする構造化されたギャップレポートを生成する。

## 使用する場面

- 新しいスキル、エージェント、またはチームを追加した後、アイコンが必要かどうかを確認する場合
- フルパイプラインレンダリングの前に、何が欠落しているかを特定する場合
- レジストリ更新後にマニフェストが同期されていることを確認する場合
- アイコンパイプラインの定期的なヘルスチェック

## 入力

- **任意**: エンティティタイプフィルタ — `skill`、`agent`、`team`、または `all`（デフォルト: `all`）
- **任意**: チェックするパレット（デフォルト: `cyberpunk` — リファレンスパレット）

## 手順

### ステップ 1: レジストリの読み取り

信頼できるソースであるレジストリからすべてのエンティティIDを収集する。

1. `skills/_registry.yml` を読み取り — すべてのドメインにわたるスキルIDを抽出する
2. `agents/_registry.yml` を読み取り — すべてのエージェントIDを抽出する
3. `teams/_registry.yml` を読み取り — すべてのチームIDを抽出する
4. カウントを記録する: スキル総数、エージェント総数、チーム総数

**期待される結果:** `total_skills`、`total_agents`、`total_teams` と一致するカウントを持つ3つのエンティティIDリスト。

**失敗時の対応:** レジストリファイルが見つからない場合は、パスを報告してそのエンティティタイプをスキップする。

### ステップ 2: グリフマッピングの読み取り

グリフマッピングファイルからマッピング済みのエンティティIDをすべて収集する。

1. `viz/R/glyphs.R` を読み取り — `SKILL_GLYPHS` リストからすべてのキーを抽出する
2. `viz/R/agent_glyphs.R` を読み取り — `AGENT_GLYPHS` リストからすべてのキーを抽出する
3. `viz/R/team_glyphs.R` を読み取り — `TEAM_GLYPHS` リストからすべてのキーを抽出する

**期待される結果:** マッピング済みIDの3つのリスト。

**失敗時の対応:** グリフファイルが見つからない場合は報告し、そのタイプのすべてのエンティティをマッピングなしとしてマークする。

### ステップ 3: 欠落グリフの計算

レジストリIDとマッピング済みIDの差分を計算する。

1. 欠落スキルグリフ: `registry_skill_ids - mapped_skill_ids`
2. 欠落エージェントグリフ: `registry_agent_ids - mapped_agent_ids`
3. 欠落チームグリフ: `registry_team_ids - mapped_team_ids`

**期待される結果:** レジストリには存在するがグリフ関数がマッピングされていないエンティティIDのリスト。

**失敗時の対応:** 差分計算が失敗する場合は、レジストリとグリフファイル間のIDフォーマットが一致しているか確認する（例: アンダースコア対ハイフン）。

### ステップ 4: レンダリング済みアイコンの確認

マッピング済みグリフに対応するレンダリング済みアイコンファイルがあるか確認する。

1. マッピング済みの各スキルIDについて、`viz/public/icons/<palette>/<domain>/<skillId>.webp` を確認する
2. マッピング済みの各エージェントIDについて、`viz/public/icons/<palette>/agents/<agentId>.webp` を確認する
3. マッピング済みの各チームIDについて、`viz/public/icons/<palette>/teams/<teamId>.webp` を確認する
4. `viz/public/icons-hd/` 内のHDバリアントも同じ構造で確認する

**期待される結果:** グリフはあるがレンダリング済みアイコンが欠落しているエンティティのリスト（標準およびHD）。

**失敗時の対応:** アイコンディレクトリが存在しない場合、パイプラインがまだ実行されていない — すべてを欠落として報告する。

### ステップ 5: マニフェストの鮮度確認

マニフェストのカウントをレジストリのカウントと比較する。

1. `viz/public/data/icon-manifest.json` を読み取り — エントリ数をカウントする
2. `viz/public/data/agent-icon-manifest.json` を読み取り — エントリ数をカウントする
3. `viz/public/data/team-icon-manifest.json` を読み取り — エントリ数をカウントする
4. レジストリの合計と比較する

**期待される結果:** マニフェストのカウントがレジストリのカウントと一致する。不一致は古いマニフェストを示す。

**失敗時の対応:** マニフェストファイルが存在しない場合、データパイプラインをまず実行する必要がある（`node build-data.js && node build-icon-manifest.js`）。

### ステップ 6: ギャップレポートの生成

構造化されたサマリーを生成する。

1. 出力を明確なテーブルまたはリスト形式でフォーマットする:
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. 発見事項に基づいて次のアクションを提案する

**期待される結果:** 実行可能な次のステップを含む完全なギャップレポート。

**失敗時の対応:** すべてのチェックがギャップゼロで合格した場合、ポジティブな結果として「パイプライン完全同期」と報告する。

## 検証チェックリスト

- [ ] 3つのレジストリすべてが正常に読み取られている
- [ ] 3つのグリフマッピングファイルすべてが確認されている
- [ ] 標準とHDの両方のアイコンディレクトリがスキャンされている
- [ ] マニフェストの鮮度が確認されている
- [ ] カウントとエンティティリストを含むギャップレポートが生成されている
- [ ] 実行可能な次のステップが提供されている

## よくある落とし穴

- **IDフォーマットの不一致**: レジストリはケバブケース（`create-skill`）を使用するが、グリフマップではスネークケースのキーを使用する場合がある — 比較時に正規化を行うこと
- **パレットの前提**: cyberpunkパレットのみのチェックではパレット固有のレンダリングギャップを見逃す
- **空のディレクトリ**: ドメインディレクトリが存在するが空である場合、glob時に「アイコンが存在する」とカウントされる — ディレクトリの存在ではなく、ファイルの存在を確認すること
- **HDが未レンダリング**: HDアイコンは別のディレクトリツリー（`icons-hd/`）にある — 標準アイコンと混同しないこと

## 関連スキル

- [create-glyph](../create-glyph/SKILL.md) — この監査で特定された欠落グリフを作成する
- [enhance-glyph](../enhance-glyph/SKILL.md) — 既存グリフの品質を改善する
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 欠落アイコンを生成するためにフルパイプラインを実行する
- [ ] Orphan icons checked (disk paths vs manifest)
- **Orphans after re-homing**: When a skill's domain changes, `build.sh` creates icons at the new path but does NOT delete the old path — always run Step 6 orphan check after any domain migration
