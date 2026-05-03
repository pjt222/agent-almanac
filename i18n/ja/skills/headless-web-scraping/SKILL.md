---
name: headless-web-scraping
description: >
  Extract data from web pages using the scrapling Python library — select the
  appropriate fetcher tier (HTTP, stealth Chromium, or full browser automation)
  based on target site defenses, configure headless browsing, and extract
  structured data with CSS selectors. Use when WebFetch is insufficient for
  JS-rendered pages, anti-bot-protected sites, or structured multi-element
  extraction requiring DOM traversal.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, headless, scrapling, automation, data-extraction
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Headless Web Scraping

単純な HTTP リクエストに抵抗するウェブページ — JS レンダリングされたコンテンツ、Cloudflare 保護されたサイト、動的 SPA — から、scrapling の 3 ティア fetcher アーキテクチャと CSS ベースのデータ抽出を使ってデータを抽出する。

## 使用タイミング

- ターゲットページが JavaScript レンダリング（SPA、React、Vue）を要求する
- サイトに anti-bot 保護がある（Cloudflare Turnstile、TLS フィンガープリンティング）
- CSS セレクタを介して複数要素の構造化抽出が必要
- 単純な `WebFetch` または `requests.get()` が空またはブロックされた応答を返す
- スケールでの表データ、リンクリスト、繰り返し DOM 構造の抽出

## 入力

- **必須**: スクレイプする URL またはターゲット URL のリスト
- **必須**: 抽出するデータ（CSS セレクタ、フィールド名、ターゲット要素の記述）
- **任意**: Fetcher ティア上書き（既定: サイト挙動に基づく自動選択）
- **任意**: 出力フォーマット（既定: JSON; 代替: CSV、Python dict）
- **任意**: リクエスト間のレート制限遅延（秒）（既定: 1）

## 手順

### ステップ1: Fetcher ティアを選ぶ

どの scrapling fetcher がターゲットサイトの防御に合うかを判定する。

```python
# Decision matrix:
# 1. Fetcher        — static HTML, no JS, no anti-bot (fastest)
# 2. StealthyFetcher — Cloudflare/Turnstile, TLS fingerprint checks
# 3. DynamicFetcher  — JS-rendered SPAs, click/scroll interactions

# Quick probe: try Fetcher first, escalate on failure
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get("https://example.com/target-page")

if response.status == 200 and response.get_all_text():
    print("Fetcher tier sufficient")
else:
    print("Escalate to StealthyFetcher or DynamicFetcher")
```

| Signal | Recommended Tier |
|--------|-----------------|
| Static HTML, no protection | `Fetcher` |
| 403/503, Cloudflare challenge page | `StealthyFetcher` |
| Page loads but content area is empty | `DynamicFetcher` |
| Need to click buttons or scroll | `DynamicFetcher` |
| altcha CAPTCHA present | None (cannot be automated) |

**期待結果：** 3 ティアのうち 1 つが特定される。ほとんどの現代サイトには、`StealthyFetcher` が正しい開始点。

**失敗時：** 3 ティアすべてがブロック応答を返すなら、サイトが altcha CAPTCHA（バイパス不能な proof-of-work チャレンジ）を使うか確認する。そうなら、制限を文書化し代わりに手動抽出指示を提供する。

### ステップ2: Fetcher を設定する

選んだ fetcher を適切なオプションでセットアップする。

```python
from scrapling import Fetcher, StealthyFetcher, DynamicFetcher

# Tier 1: Fast HTTP with TLS fingerprint impersonation
fetcher = Fetcher()
fetcher.configure(
    timeout=30,
    retries=3,
    follow_redirects=True
)

# Tier 2: Headless Chromium with anti-detection
fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True  # wait for all network requests to settle
)

# Tier 3: Full browser automation
fetcher = DynamicFetcher()
fetcher.configure(
    headless=True,
    timeout=90,
    network_idle=True,
    wait_selector="div.results"  # wait for specific element before extracting
)
```

**期待結果：** Fetcher インスタンスが設定され準備できている。インスタンス化でエラーなし。`StealthyFetcher` と `DynamicFetcher` には Chromium バイナリが利用可能（scrapling が初回実行時に自動管理）。

**失敗時：**
- `playwright` またはブラウザバイナリが見つからない -- `python -m playwright install chromium` を実行
- `configure()` でのタイムアウト -- タイムアウト値を増やすかネットワーク接続を確認
- インポートエラー -- scrapling をインストール: `pip install scrapling`

### ステップ3: データを取得し抽出する

ターゲット URL にナビゲートし、CSS セレクタを使って構造化データを抽出する。

```python
# Fetch the page
response = fetcher.get("https://example.com/target-page")

# Single element extraction
title = response.find("h1.page-title")
if title:
    print(title.get_all_text())

# Multiple elements
items = response.find_all("div.result-item")
for item in items:
    name = item.find("span.name")
    price = item.find("span.price")
    print(f"{name.get_all_text()}: {price.get_all_text()}")

# Get attribute values
links = response.find_all("a.product-link")
urls = [link.get("href") for link in links]

# Get raw HTML content of an element
detail_html = response.find("div.description").html_content
```

**主要 API リファレンス:**

| Method | Purpose |
|--------|---------|
| `response.find("selector")` | First matching element |
| `response.find_all("selector")` | All matching elements |
| `element.get("attr")` | Attribute value (href, src, data-*) |
| `element.get_all_text()` | All text content, recursively |
| `element.html_content` | Raw inner HTML |

**期待結果：** 抽出データが可視ページコンテンツと一致する。要素は非 None で、ポピュレートされたページではテキストコンテンツが非空。

**失敗時：**
- `find()` が `None` を返す -- 実際の HTML を検査（`response.html_content`）してセレクタを検証する; ページは予想と異なるクラス名を使うかもしれない
- `get_all_text()` から空テキスト -- コンテンツは shadow DOM または iframe 内かもしれない; `wait_selector` を伴う `DynamicFetcher` を試す
- `.css_first()` を使わない -- これは scrapling API の一部ではない（他ライブラリとの一般的な混乱）

### ステップ4: 失敗とエッジケースを扱う

CAPTCHA 検出、空応答、セッション要件のためのフォールバックロジックを実装する。

```python
import time

def scrape_with_fallback(url, selector):
    """Try each fetcher tier in order, with CAPTCHA detection."""
    tiers = [
        ("Fetcher", Fetcher),
        ("StealthyFetcher", StealthyFetcher),
        ("DynamicFetcher", DynamicFetcher),
    ]

    for tier_name, tier_class in tiers:
        fetcher = tier_class()
        fetcher.configure(headless=True, timeout=60)

        try:
            response = fetcher.get(url)
        except Exception as error:
            print(f"{tier_name} failed: {error}")
            continue

        # Detect CAPTCHA / challenge pages
        page_text = response.get_all_text().lower()
        if "altcha" in page_text or "proof of work" in page_text:
            print(f"altcha CAPTCHA detected -- cannot automate")
            return None

        if response.status == 403 or response.status == 503:
            print(f"{tier_name} blocked (HTTP {response.status}), escalating")
            continue

        result = response.find(selector)
        if result and result.get_all_text().strip():
            return result.get_all_text()

        print(f"{tier_name} returned empty content, escalating")

    print("All tiers exhausted. Manual extraction required.")
    return None
```

**期待結果：** 関数は成功時に抽出テキスト、すべてのティアが失敗したときに診断メッセージと共に `None` を返す。CAPTCHA ページは無限にリトライではなく検出され報告される。

**失敗時：**
- すべてのティアが 403 を返す -- サイトはすべての自動アクセスをブロックする（WIPO、TMview、一部政府データベースで一般）; 手動アクセスを要求する URL として文書化
- タイムアウトエラー -- ページは遅い CDN 後ろにあるかもしれない; タイムアウトを 120s に増やす
- セッション/cookie エラー -- サイトはログインを要求するかもしれない; cookie 処理を加えるかまず認証する

### ステップ5: レート制限と倫理的スクレイピング

スケールで実行する前に遅延を実装しサイトポリシーを尊重する。

```python
import time
import urllib.robotparser

def check_robots_txt(base_url, target_path):
    """Check if scraping is allowed by robots.txt."""
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{base_url}/robots.txt")
    rp.read()
    return rp.can_fetch("*", f"{base_url}{target_path}")

def scrape_urls(urls, selector, delay=1.0):
    """Scrape multiple URLs with rate limiting."""
    results = []
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60)

    for url in urls:
        response = fetcher.get(url)
        data = response.find(selector)
        if data:
            results.append(data.get_all_text())

        time.sleep(delay)  # respect the server

    return results
```

**倫理的スクレイピングチェックリスト:**

1. スクレイピング前に `robots.txt` を確認 -- `Disallow` 指令を尊重
2. リクエスト間に最低 1 秒の遅延を使う
3. 可能なら記述的 User-Agent でスクレイパーを識別
4. 法的根拠なしに個人データをスクレイプしない
5. 冗長リクエストを避けるためローカルに応答をキャッシュ
6. 429（Too Many Requests）を受け取ったらすぐ停止

**期待結果：** スクレイピングが制御されたレートで動く。バルク操作前に `robots.txt` が確認される。429 応答が引き起こされない。

**失敗時：**
- 429 Too Many Requests -- 遅延を 3-5 秒に増やす、または停止して後で再試行
- `robots.txt` がパスを禁じる -- 指令を尊重; オーバーライドしない
- IP ban -- スクレイピングをすぐ停止; レート制限が不十分だった。アクセスが正当（パブリックデータ、ToS 許可、robots.txt 尊重）で続けねばならないなら、ネットワーク層エスカレーションには [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) を参照

## バリデーション

- [ ] 正しい fetcher ティアが選ばれている（ターゲットに対して過剰または不足電力でない）
- [ ] `configure()` メソッドが使われている（非推奨コンストラクタ kwargs ではなく）
- [ ] CSS セレクタが実際のページ構造と一致する（ページソースに対して検証済み）
- [ ] `.find()` / `.find_all()` API が使われている（`.css_first()` または他ライブラリメソッドではなく）
- [ ] CAPTCHA 検出が整っている（altcha ページは報告され、リトライされない）
- [ ] マルチ URL スクレイピングにレート制限が実装されている
- [ ] バルク操作前に `robots.txt` が確認される
- [ ] 抽出データが非空で構造的に正しい

## よくある落とし穴

- **`.find()` ではなく `.css_first()` を使う**: scrapling は要素選択に `.find()` と `.find_all()` を使う -- `.css_first()` は別ライブラリに属し `AttributeError` を発生させる
- **DynamicFetcher で開始**: 常にまず `Fetcher` を試して、それからエスカレートする -- `DynamicFetcher` は完全ブラウザ起動のため 10-50 倍遅い
- **`configure()` の代わりにコンストラクタ kwargs**: scrapling v0.4.x はコンストラクタへのオプション渡しを非推奨にした; 常に `configure()` メソッドを使う
- **altcha CAPTCHA の無視**: いかなる fetcher ティアも altcha proof-of-work チャレンジを解けない -- 早期に検出し手動指示にフォールバックする
- **レート制限なし**: サイトが 429 を返さなくても、攻撃的スクレイピングは IP ban またはサービス劣化を引き起こしうる
- **安定セレクタの仮定**: ウェブサイト CSS クラスは頻繁に変わる -- 各スクレイピングキャンペーン前に現在のページソースに対してセレクタを検証する

## 関連スキル

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) -- クライアントサイドステルスが尽き、IP ban が正当な ToS 許可アクセスをブロックするときのネットワーク層エスカレーション
- [use-graphql-api](../use-graphql-api/SKILL.md) -- サイトが GraphQL エンドポイントを提供するときの構造化 API クエリ（スクレイピングより優先）
- [serialize-data-formats](../serialize-data-formats/SKILL.md) -- 抽出データを JSON、CSV、または他のフォーマットに変換
- [deploy-searxng](../deploy-searxng/SKILL.md) -- 複数ソースから結果を集約するセルフホストサーチエンジン
- [forage-solutions](../forage-solutions/SKILL.md) -- 多様なソースから情報を集めるより広いパターン
