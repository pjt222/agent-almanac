---
name: create-glyph
description: >
  ビジュアライゼーションレイヤーにおけるスキル、エージェント、またはチームのアイコン用に
  Rベースのピクトグラムグリフを作成する。コンセプトスケッチ、プリミティブライブラリを使用した
  ggplot2レイヤーの構成、カラー戦略、適切なグリフマッピングファイルとマニフェストへの登録、
  ビルドパイプラインによるレンダリング、ネオングロー出力の視覚的検証をカバーする。新しい
  エンティティが追加されてフォースグラフビジュアライゼーション用のビジュアルアイコンが
  必要な場合、既存のグリフを置き換える必要がある場合、または新しいドメインのグリフを
  一括作成する場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
locale: ja
source_locale: en
source_commit: 41c6956b
translator: claude
translation_date: "2026-03-18"
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# グリフ作成

`viz/` ビジュアライゼーションレイヤーにおけるスキル、エージェント、またはチームのアイコン用にRベースのピクトグラムグリフを作成する。各グリフは100x100キャンバス上に認識可能な形状を描画する純粋なggplot2関数であり、ネオングロー効果付きで透過背景のWebPとしてレンダリングされる。

## 使用する場面

- 新しいスキル、エージェント、またはチームが追加され、ビジュアルアイコンが必要な場合
- 既存のグリフを置き換えまたは再設計する必要がある場合
- 新しいドメインのスキル群に対してグリフを一括作成する場合
- エンティティの概念に対するビジュアルメタファーをプロトタイピングする場合

## 入力

- **必須**: エンティティタイプ — `skill`、`agent`、または `team`
- **必須**: エンティティID（例: `create-glyph`、`mystic`、`r-package-review`）およびドメイン（スキルの場合）
- **必須**: ビジュアルコンセプト — グリフが表現すべき内容
- **任意**: 複雑さレベルの参考となるリファレンスグリフ
- **任意**: カスタム `--glow-sigma` 値（デフォルト: 4）

## 手順

### ステップ 1: コンセプト — ビジュアルメタファーの設計

アイコン化するエンティティを特定し、ビジュアルメタファーを選択する。

1. エンティティのソースファイルを読み、コアコンセプトを理解する:
   - スキル: `skills/<id>/SKILL.md`
   - エージェント: `agents/<id>.md`
   - チーム: `teams/<id>.md`
2. メタファーの種類を選択する:
   - **具象オブジェクト**: 実験用のフラスコ、セキュリティ用の盾
   - **抽象シンボル**: マージ用の矢印、反復用のスパイラル
   - **複合型**: 2〜3個のシンプルな形状を組み合わせる（例: ドキュメント＋ペン）
3. 既存のグリフを参照して複雑さの基準を把握する:

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. 関数名を決定する: `glyph_<descriptive_name>`（snake_case、一意であること）

**期待される結果:** 2〜6レイヤーの計画を含む明確なメンタルスケッチ。

**失敗時の対応:** コンセプトが抽象的すぎる場合は、関連する具象オブジェクトに立ち返る。同じドメインの既存グリフをインスピレーション源として参照する。

### ステップ 2: 構成 — グリフ関数の作成

ggplot2レイヤーを生成するR関数を作成する。

1. 関数シグネチャ（不変の契約）:
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. すべての寸法にスケールファクター `* s` を適用し、一貫したスケーリングを行う:
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. 利用可能なプリミティブを使用してジオメトリを構築する:

   | ジオメトリ | 用途 |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | 塗りつぶし形状 |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | 開いた線/曲線 |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | 線分、矢印 |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | 矩形 |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | 円 |

4. カラー戦略を適用する:

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. フラットな `list()` のレイヤーを返す（レンダラーが各レイヤーにグローを適用する）

6. エンティティタイプに基づいて適切なプリミティブファイルに関数を配置する:
   - **スキル**: 19個のプリミティブファイルにドメインごとにグループ化:
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - 新しいドメイン用に `primitives_4.R` から `primitives_19.R` まで追加
   - **エージェント**: `viz/R/agent_primitives.R`
   - **チーム**: `viz/R/team_primitives.R`

**期待される結果:** 2〜6個のggplot2レイヤーのリストを返す動作するR関数。

**失敗時の対応:** `ggforce::geom_circle` でエラーが発生する場合は、ggforceがインストールされていることを確認する。座標がずれている場合は、キャンバスが100x100で (0,0) が左下であることを思い出す。関数をインタラクティブにテストする:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### ステップ 3: 登録 — エンティティとグリフのマッピング

適切なグリフマッピングファイルにエンティティからグリフへのマッピングを追加する。

**スキルの場合:**
1. `viz/R/glyphs.R` を開く
2. 対象ドメインのコメントセクションを見つける（例: `# -- design (3)`）
3. ドメインブロック内でアルファベット順にエントリを追加する:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. 該当する場合はコメント内のドメインカウントを更新する

**エージェントの場合:**
1. `viz/R/agent_glyphs.R` を開く
2. `AGENT_GLYPHS` 内のアルファベット順の位置を見つける
3. エントリを追加する:
   ```r
   "agent-id" = "glyph_function_name",
   ```

**チームの場合:**
1. `viz/R/team_glyphs.R` を開く
2. `TEAM_GLYPHS` 内のアルファベット順の位置を見つける
3. エントリを追加する:
   ```r
   "team-id" = "glyph_function_name",
   ```

5. 対象リスト内に重複するIDがないことを確認する

**期待される結果:** 適切な `*_GLYPHS` リストに新しいマッピングが含まれている。

**失敗時の対応:** ビルド時に「No glyph mapped」と報告される場合は、エンティティIDがマニフェストおよびレジストリのものと正確に一致しているかを再確認する。

### ステップ 4: マニフェスト — アイコンエントリの追加

適切なマニフェストファイルにアイコンを登録する。

**スキルの場合:** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**エージェントの場合:** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**チームの場合:** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**期待される結果:** 新しいエントリが同タイプの兄弟要素の中に配置された有効なJSON。

**失敗時の対応:** JSONの構文を検証する。よくあるミス: 配列の最後の要素の後のカンマ、引用符の欠落。

### ステップ 5: レンダリング — アイコンの生成

ビルドパイプラインを実行してWebPをレンダリングする。

1. `viz/` ディレクトリに移動する
2. エンティティタイプに基づいてレンダリングする:

**スキルの場合:**
```bash
cd viz && Rscript build-icons.R --only <domain>
# Or skip existing: Rscript build-icons.R --only <domain> --skip-existing
```

**エージェントの場合:**
```bash
cd viz && Rscript build-agent-icons.R --only <agent-id>
# Or skip existing: Rscript build-agent-icons.R --only <agent-id> --skip-existing
```

**チームの場合:**
```bash
cd viz && Rscript build-team-icons.R --only <team-id>
# Or skip existing: Rscript build-team-icons.R --only <team-id> --skip-existing
```

3. ドライランを先に行うには、任意のコマンドに `--dry-run` を追加する
4. 出力先:
   - スキル: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - エージェント: `viz/public/icons/<palette>/agents/<agent-id>.webp`
   - チーム: `viz/public/icons/<palette>/teams/<team-id>.webp`

**期待される結果:** ログに `OK: <entity> (seed=XXXXX, XX.XKB)` と表示され、WebPファイルが存在する。

**失敗時の対応:**
- `"No glyph mapped"` — ステップ3のマッピングが不足しているか、タイプミスがある
- `"Unknown domain"` — ドメインが `palettes.R` の `get_palette_colors()` に存在しない
- Rパッケージのエラー — まず `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` を実行する
- レンダリングがクラッシュする場合は、グリフ関数をインタラクティブにテストする（ステップ2のフォールバックを参照）

### ステップ 6: 検証 — 目視確認

レンダリング出力が品質基準を満たしているか確認する。

1. ファイルが存在し、適切なサイズであることを確認する:
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. WebPを画像ビューアで開き、以下を確認する:
   - フルサイズ（1024x1024）で形状が明確に読み取れる
   - ネオングローが存在するが、圧倒的ではない
   - 背景が透過（黒/白の矩形がない）
   - キャンバス端でのクリッピングがない

3. 小さいサイズ（フォースグラフでは約40〜160pxでレンダリング）で確認する:
   - 形状が認識可能なまま
   - ディテールがノイズにならない
   - グローが形状を圧倒しない

**期待される結果:** 透過背景上に均一なネオングローを持つ、明確で認識可能なピクトグラム。

**失敗時の対応:**
- グローが強すぎる場合: `--glow-sigma 2` で再レンダリング（デフォルトは4）
- グローが弱すぎる場合: `--glow-sigma 8` で再レンダリング
- 小さいサイズで形状が読み取れない場合: グリフを簡略化する（レイヤー数を減らし、ストロークを太くし、`.lw(s, base)` のbase値を増やす）
- 端でクリッピングが発生する場合: 形状の寸法を縮小するか中心をずらす

### ステップ 7: 反復 — 必要に応じた改良

調整を加えて再レンダリングする。

1. よくある調整:
   - **ストロークを太くする**: `.lw(s, base)` を増やす — `base = 3.0` や `3.5` を試す
   - **塗りをより目立たせる**: アルファを0.10から0.15〜0.20に増やす
   - **形状の比率**: `s` の乗数を調整する（例: `20 * s` → `24 * s`）
   - **ディテールレイヤーの追加/削除**: 最良の結果のためにレイヤー総数を2〜6に保つ

2. 変更後の再レンダリング:
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. 満足したら、マニフェストのステータスが `"done"` と表示されていることを確認する（ビルドスクリプトが成功時に自動的に更新する）

**期待される結果:** 最終アイコンがステップ6のすべての検証チェックに合格する。

**失敗時の対応:** 3回以上の反復後もグリフが読み取りにくい場合は、まったく異なるビジュアルメタファーの使用を検討する（ステップ1に戻る）。

## リファレンス

### ドメインとエンティティのカラーパレット

全58ドメインのカラー（スキル用）は `viz/R/palettes.R` で定義されている（唯一の信頼できるソース）。エージェントとチームのカラーも `palettes.R` で管理されている。cyberpunkパレット（手動調整されたネオンカラー）は `get_cyberpunk_colors()` に格納されている。viridisファミリーのパレットは `viridisLite` で自動生成される。

カラーを参照するには:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

新しいドメインを追加する場合は、`palettes.R` の3箇所に追加する:
1. `PALETTE_DOMAIN_ORDER`（アルファベット順）
2. `get_cyberpunk_colors()` のドメインリスト
3. `Rscript generate-palette-colors.R` を実行してJSON + JSを再生成する

### グリフ関数カタログ

利用可能なグリフ関数の完全なカタログはプリミティブソースファイルを参照:
- **スキル**: `viz/R/primitives.R` から `viz/R/primitives_19.R`（ドメインごとにグループ化）
- **エージェント**: `viz/R/agent_primitives.R`
- **チーム**: `viz/R/team_primitives.R`

### ヘルパー関数

| 関数 | シグネチャ | 用途 |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | スケール対応の線幅 |
| `.aes(...)` | `ggplot2::aes` のエイリアス | 省略形のエステティックマッピング |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | 16進カラーにアルファを追加 |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | 16進カラーを明るくする |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | 16進カラーを暗くする |

## 検証チェックリスト

- [ ] グリフ関数が `glyph_<name>(cx, cy, s, col, bright) -> list()` のシグネチャに従っている
- [ ] すべての寸法が `* s` スケールファクターを使用している
- [ ] カラー戦略が塗りに `col`、アウトラインに `bright`、透過に `hex_with_alpha()` を使用している
- [ ] 関数がエンティティタイプとドメインに応じた正しいプリミティブファイルに配置されている
- [ ] 適切な `*_glyphs.R` ファイルにグリフマッピングエントリが追加されている
- [ ] マニフェストエントリに正しいエンティティID、パス、および `"status": "pending"` が設定されている
- [ ] ビルドコマンドがエラーなく実行される（まずドライラン）
- [ ] レンダリングされたWebPが想定パスに存在する
- [ ] ファイルサイズが想定範囲内（15〜80 KB）
- [ ] アイコンが1024pxと約40pxの両方の表示サイズで明確に読み取れる
- [ ] 透過背景（グリフの背後に矩形がない）
- [ ] レンダリング成功後にマニフェストステータスが `"done"` に更新されている

## よくある落とし穴

- **`* s` の付け忘れ**: ハードコードされたピクセル値はスケール変更時に壊れる。常に `s` を乗算すること。
- **キャンバス原点の混同**: (0,0) は左下であり、左上ではない。`y` 値が大きいほど上に移動する。
- **二重グロー**: レンダラーがすでにすべてのレイヤーに `ggfx::with_outer_glow()` を適用している。グリフ関数内でグローを追加しないこと。
- **レイヤー過多**: 各レイヤーに個別のグローラッピングが適用される。8レイヤーを超えるとレンダリングが遅くなり、視覚的にノイジーになる。
- **IDの不一致**: グリフマッピング、マニフェスト、およびレジストリのエンティティIDはすべて正確に一致しなければならない。
- **JSON末尾のカンマ**: マニフェストは厳密なJSONである。配列の最後の要素の後にカンマを付けないこと。
- **ドメインカラーの欠落**: ドメインが `palettes.R` の `get_cyberpunk_colors()` に存在しない場合、レンダリングはエラーになる。まずカラーを追加してから再生成すること。
- **間違ったプリミティブファイル**: スキルはドメインごとにグループ化された `primitives*.R`、エージェントは `agent_primitives.R`、チームは `team_primitives.R` に配置する。

## 関連スキル

- [enhance-glyph](../enhance-glyph/SKILL.md) — 既存グリフのビジュアル品質の改善、レンダリング問題の修正、ディテールレイヤーの追加
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 作成が必要な欠落グリフとアイコンの検出
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — レンダリングパイプライン全体のエンドツーエンド実行
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 補完的なAIベースの画像生成（Z-Image対Rコードグリフ）
- [ornament-style-color](../ornament-style-color/SKILL.md) — グリフのアクセント塗りの決定に適用可能な色彩理論
- [create-skill](../create-skill/SKILL.md) — 新しいスキル追加時にグリフ作成をトリガーする親ワークフロー
