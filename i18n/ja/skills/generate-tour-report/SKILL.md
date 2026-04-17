---
name: generate-tour-report
description: >
  埋め込みマップ、日別旅程、ロジスティクス表、宿泊・交通の詳細を含むQuartoベースの
  旅行レポートを生成する。旅行中のオフライン使用に適した自己完結型のHTMLまたはPDF
  ドキュメントを生成する。計画した旅程を共有可能なドキュメントにまとめる時、
  オフラインアクセス可能な旅行ガイドを作成する時、写真と統計を含む完了した旅行を
  記録する時、またはグループやクライアント向けのプロフェッショナルな旅行提案を
  作成する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, report, quarto, itinerary, logistics
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 旅行レポートの生成

埋め込みマップ、日別旅程、ロジスティクス表、実用的な旅行情報を含むフォーマットされた旅行レポートを生成する。

## 使用タイミング

- 計画した旅程を共有可能なドキュメントにまとめる時
- 旅行用のオフラインアクセス可能な旅行ガイドを作成する時
- 写真、マップ、統計を含む完了した旅行を記録する時
- グループやクライアント向けのプロフェッショナルな旅行提案を作成する時
- ルート、宿泊、交通データを1つのドキュメントに統合する時

## 入力

- **必須**: ルートデータ（ウェイポイント、区間、距離、時間）
- **必須**: 旅行日程と期間
- **任意**: 宿泊詳細（名称、住所、確認番号）
- **任意**: 交通予約（フライト、列車、レンタカー）
- **任意**: マップ埋め込み用のGPXトラックまたは空間データ
- **任意**: 予算情報（カテゴリ別のコスト）
- **任意**: 含める写真や画像

## 手順

### ステップ1: ルートとPOIデータの収集

レポートの構築前にすべての旅行データを構造化された形式に収集する。

```
Data Sources to Compile:
┌────────────────────┬──────────────────────────────────────────┐
│ Category           │ Required Fields                          │
├────────────────────┼──────────────────────────────────────────┤
│ Route legs         │ From, To, distance_km, time_hrs, mode   │
│ Waypoints          │ Name, lat, lon, arrival, departure, notes│
│ Accommodation      │ Name, address, check-in/out, cost, conf#│
│ Transport          │ Type, operator, depart, arrive, ref#     │
│ Activities         │ Name, time, duration, cost, booking_req  │
│ Emergency contacts │ Local emergency #, embassy, insurance    │
│ POIs               │ Name, category, lat, lon, description    │
└────────────────────┴──────────────────────────────────────────┘
```

日別のセクション構造を支援するためにデータを日ごとに整理する:
1. ウェイポイントとアクティビティを日付ごとにグループ化
2. 各交通区間を日に割り当て
3. 宿泊を宿泊日に合わせる
4. 日別合計を計算（距離、時間、コスト）

**期待結果:** 日ごとに整理された完全なデータ収集。スケジュールにギャップがないこと（毎晩宿泊がある、すべての区間に交通手段がある）。

**失敗時:** データが不完全な場合、欠落している項目を `[TBD]` プレースホルダーでマークし、レポート末尾のフォローアップチェックリストに追加する。日付が合わない場合（例：前の場所からの出発前に宿泊先への到着）、競合をフラグ付けして時間を調整する。

### ステップ2: 日別セクションの構造化

日別セクションを持つQuartoドキュメントのスケルトンを作成する。

```yaml
---
title: "Tour Name: Region/Country"
subtitle: "Date Range"
author: "Planner Name"
date: today
format:
  html:
    toc: true
    toc-depth: 3
    theme: cosmo
    self-contained: true
    code-fold: true
  pdf:
    documentclass: article
    geometry: margin=2cm
    toc: true
execute:
  echo: false
  warning: false
  message: false
---
```

ドキュメントを以下のように構造化する:

```
Report Structure:
1. Overview
   - Tour summary (dates, total distance, highlights)
   - Overview map (all waypoints, full route)
   - Quick reference table (key dates, bookings, contacts)

2. Day 1: [Title]
   - Day summary (start, end, km, hours)
   - Route map for the day
   - Timeline / schedule table
   - Accommodation details
   - POIs and activities

3. Day 2: [Title]
   ... (repeat for each day)

N. Logistics Appendix
   - Full accommodation table
   - Transport bookings table
   - Packing checklist
   - Emergency contacts
   - Budget summary
```

**期待結果:** YAMLヘッダー、すべての日別セクションをH2見出しとして、各セクションのプレースホルダーコンテンツを含む完全な .qmd ファイルスケルトン。

**失敗時:** 旅行が単一ドキュメントには長すぎる場合（14日以上）、週ごとのパートに分割するか、タブセットレイアウト（`{.tabset}`）を使用してドキュメントをナビゲート可能に保つことを検討する。PDF出力が必要な場合、インタラクティブウィジェットが含まれていないことを確認する（代わりに静的マップを使用）。

### ステップ3: マップとチャートの埋め込み

各セクションに空間的な可視化を追加する。

**概要マップ:**

```r
#| label: fig-overview-map
#| fig-cap: "Tour overview with all stops"

leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(data = full_route, color = "#2563eb", weight = 3) |>
  leaflet::addMarkers(data = stops, popup = ~paste(name, "<br>", date))
```

**日別ルートマップ:**

```r
#| label: fig-day1-map
#| fig-cap: "Day 1 route: City A to City B"

day1_route <- full_route[full_route$day == 1, ]
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenStreetMap") |>
  leaflet::addPolylines(data = day1_route, color = "#2563eb", weight = 4) |>
  leaflet::addCircleMarkers(data = day1_stops, radius = 6, popup = ~name)
```

**標高プロファイル（ハイキング/サイクリング日用）:**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

**期待結果:** 各日別セクションに最低限ルートマップがあること。マルチモーダルの日（ドライブ＋ハイキング）にはロードマップと標高プロファイルの両方があること。概要セクションには完全な旅程を示すマップがあること。

**失敗時:** leafletマップのレンダリングに失敗する場合（PDFモードで一般的）、`tmap::tmap_mode("plot")` または `ggplot2` と `ggspatial::annotation_map_tile()` を使用した静的マップにフォールバックする。空間データがある日に利用できない場合、代わりにルートの簡単なテキスト説明を含める。

### ステップ4: ロジスティクス表の追加

宿泊、交通、予算の構造化された表を挿入する。

**宿泊表:**

```markdown
| Night | Date       | Accommodation      | Address            | Check-in | Cost   | Conf# |
|-------|------------|--------------------|--------------------|----------|--------|-------|
| 1     | 2025-07-01 | Hotel Alpine       | Bergstrasse 12     | 15:00    | EUR 95 | AB123 |
| 2     | 2025-07-02 | Mountain Hut       | Zugspitze Huette   | 16:00    | EUR 45 | --    |
| 3     | 2025-07-03 | Pension Edelweiss  | Dorfplatz 3        | 14:00    | EUR 72 | CD456 |
```

**交通表:**

```markdown
| Date       | Type  | From          | To            | Depart | Arrive | Ref#   |
|------------|-------|---------------|---------------|--------|--------|--------|
| 2025-07-01 | Train | Munich Hbf    | Garmisch      | 08:15  | 09:32  | DB1234 |
| 2025-07-03 | Bus   | Zugspitze     | Ehrwald        | 10:00  | 10:25  | --     |
| 2025-07-04 | Train | Innsbruck     | Munich Hbf    | 16:45  | 18:30  | OBB567 |
```

**予算概要:**

```markdown
| Category        | Estimated | Actual | Notes                   |
|-----------------|-----------|--------|-------------------------|
| Accommodation   | EUR 212   |        | 3 nights                |
| Transport       | EUR 85    |        | Rail passes recommended |
| Food            | EUR 150   |        | EUR 50/day estimate     |
| Activities      | EUR 60    |        | Cable car, museum       |
| **Total**       | **EUR 507** |      |                         |
```

**期待結果:** すべての予約が時系列に記載された完全なロジスティクス表。宿泊表に欠落した日付がないこと。予算合計が正しく計算されていること。

**失敗時:** 予約の詳細がまだ確定していない場合、`[TBD]` を使用して行をハイライトする。旅行が複数の通貨を含む場合、通貨列を追加し脚注に為替レートを含める。

### ステップ5: レポートのレンダリング

Quartoドキュメントを最終出力形式にコンパイルする。

```bash
# 自己完結型HTMLにレンダリング（オフライン使用に最適）
quarto render tour-report.qmd --to html

# PDFにレンダリング（印刷用）
quarto render tour-report.qmd --to pdf

# 編集中のライブリロード付きプレビュー
quarto preview tour-report.qmd
```

レンダリング後のチェック:
1. HTMLファイルを開き、すべてのマップが正しく読み込まれることを確認
2. 目次のリンクが機能することをテスト
3. すべての画像とチャートが適切なサイズでレンダリングされることを確認
4. 自己完結型HTMLがオフラインで動作することを確認（切断してリロード）
5. PDFの場合：ページブレークが論理的な位置（日の間）に来ることを確認

**期待結果:** オフラインで動作し、ナビゲート可能な形式ですべての旅行情報を含む完全な自己完結型ドキュメント。

**失敗時:** レンダリングが失敗する場合、パッケージエラー（sf、leaflet、ggplot2の欠落）をRコンソールで確認する。自己完結型HTMLが大きすぎる場合（20 MB超）、マップタイルの解像度を下げるかインタラクティブマップの代わりにPNGスクリーンショットを使用する。PDFレンダリングがLaTeXエラーで失敗する場合、`quarto install tinytex` でTinyTeXをインストールする。

## バリデーション

- [ ] レポートがターゲット形式でエラーなくレンダリングされる
- [ ] 概要マップがすべてのストップを含む完全なルートを表示する
- [ ] 各日にルートマップとスケジュールがある
- [ ] 宿泊表が旅行の毎晩をカバーしている
- [ ] 交通表がすべての区間を含む
- [ ] 予算合計が正確である
- [ ] 自己完結型HTMLがオフラインで動作する
- [ ] 目次がすべてのセクションに正しくナビゲートする
- [ ] [TBD]プレースホルダーが残っていない（意図的にフラグ付けされている場合を除く）

## よくある落とし穴

- **PDFでのインタラクティブマップ**: Leafletやその他のHTMLウィジェットはPDFでレンダリングできない。PDF出力には常に静的マップの代替を提供する
- **大きすぎる自己完結型HTML**: 多くのマップタイルの埋め込みは非常に大きなファイルを作成する。ズームレベルを制限するか、タイルが多いマップには静的マップのスクリーンショットを使用する
- **タイムゾーンの欠落**: 国際旅行はタイムゾーンを越える。混乱を避けるため、出発・到着時刻に常にタイムゾーンを指定する
- **古い予約参照**: 確認番号と時刻は変更される可能性がある。「最終更新日」を含め、旅行前に確認するようユーザーに通知する
- **オフラインフォールバックなし**: レポートがWebロードのマップタイルに依存している場合、オフラインでは空白になる。`self-contained: true` を使用するかマップを画像として事前レンダリングする
- **日付形式の不一致**: DD/MMとMM/DDの混在は混乱を引き起こす。ドキュメント全体を通じてISO 8601（YYYY-MM-DD）を一貫して使用する

## 関連スキル

- `plan-tour-route` — このレポートにコンパイルされるルートデータを生成する
- `create-spatial-visualization` — レポートに埋め込むマップとチャートを作成する
- `create-quarto-report` — 一般的なQuartoドキュメントの作成と設定
- `plan-hiking-tour` — 山岳旅行レポート用のハイキング固有のデータを提供する
- `check-hiking-gear` — ロジスティクス付録用のパッキングチェックリストを生成する
