---
name: rotate-scraping-proxies
description: >
  プロバイダ非依存のプロキシローテーションで、ブロックされたスクレイピング
  キャンペーンを段階的に突破します。データセンター、レジデンシャル、
  モバイルの各プールを使い分け、scrapling にローテーションを統合し、
  ステートフルなフロー向けにセッションの固定性を設定し、コストと健全性を
  監視しつつ、法的・倫理的な境界の内側に留まります。`headless-web-scraping`
  のクライアントサイドのステルス（StealthyFetcher、レート制限、robots.txt）
  では不十分で、かつトラフィックが正当である場合の次の一手として利用して
  ください。
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, proxies, rotation, residential, scrapling, networking
  locale: ja
  source_locale: en
  source_commit: 89cb55b1
  translator: "Claude + human review"
  translation_date: "2026-04-14"
---

# スクレイピングプロキシのローテーション

クライアントサイドのステルス対策をすでに使い切ったスクレイピング
キャンペーンに対する、ネットワーク層での段階的な対処です。プロキシ
ローテーションは最終手段であり、既定の選択肢ではありません。コストが
高く、倫理的に繊細で、容易に悪用されます。このスキルは、うまく使う
方法と同じくらい、*使うべきでない*場面を教えます。

## 利用する場面

- `headless-web-scraping`（Fetcher → StealthyFetcher → DynamicFetcher）
  を試したにもかかわらず、対象サイトが依然として 403/429/地理ブロックを
  返す
- レート制限をすでに 3 秒以上の間隔に設定しており、`robots.txt` が該当
  パスを許可している
- User-Agent と TLS フィンガープリントがすでに現実的なもの（デフォルトの
  `python-requests` ではない）
- スクレイピングが正当である場合。公開データであり、認証の回避や有料
  コンテンツの突破を行わず、法的根拠のない個人データの収集も行わない
- プロキシトラフィックの予算を確保でき、運用上の複雑さを受容できる

**利用しない場面**: 公開 API が存在する場合（それを使う）、サイトの
利用規約が自動アクセスを禁止している場合、地理ライセンスを回避する
ことになる場合、または目的が不正行為・クレデンシャルスタッフィング・
スニーカー bot・コンテンツ海賊行為である場合。

## 入力

- **必須**: 対象 URL と、それをスクレイピングする法的根拠
- **必須**: プロキシプールの認証情報（環境変数から読み込み、ハードコード
  は絶対に行わない）
- **必須**: プールの種別 — datacenter、residential、または mobile
- **任意**: 地理的ターゲティング（国・地域・都市）
- **任意**: ローテーション粒度 — リクエスト単位（デフォルト）または
  スティッキーセッション
- **任意**: 1 日あたりのトラフィック量や支出上限
- **任意**: レート制限の遅延（秒単位、デフォルト: 1。ローテーションが
  あっても維持）

## 手順

### Step 1: 実行前の合法性・倫理性チェック

ワークフロー全体を、文書化された法的・倫理的レビューの通過を条件として
ゲートします。この手順を飛ばすことが、害の最大の発生源です。

```python
# コードを書き始める前に確認すべき入力:
# 1. データは公開されているか（ログイン不要か）？
# 2. robots.txt は該当パスを許可しているか？
# 3. サイトの ToS は自動アクセスを禁止していないか？（実際に読む）
# 4. 処理対象に個人データは含まれるか？ 含まれる場合、法的根拠は何か？
# 5. このアクセスは地理ライセンス、有料コンテンツ、認証の回避になり得るか？
# 6. スクレイピング不要にできる公開 API やデータダンプは存在しないか？
# 7. 範囲が大きい場合、サイト運営者に連絡したか？
```

**Expected:** すべての質問に、説明可能な書面での回答が揃っている。最初に
「いいえ」または「不明」が出た時点で、解決するまで手順を停止する。

**On failure:**
- ToS が自動アクセスを禁止している — 続行しない。サイト運営者に連絡するか、
  公式 API またはライセンス済みデータセットを代わりに利用する
- 法的根拠のない個人データ — 続行しない。プライバシー関連の法務担当を
  関与させる
- 認証または地理ライセンスの回避 — いかなる状況でも続行しない

### Step 2: プールの種別を選ぶ

プールの種別ごとに、コスト・検知されやすさ・倫理的プロファイルが異なり
ます。実際にブロックを解消できる範囲で、最も安価なティアを選びます。

| プール種別 | 検知されやすさ | コスト | 適した用途 |
|-----------|---------------|------|----------|
| Datacenter | 高（Cloudflare/Akamai に容易にブロックされる） | $ | 本格的な bot 対策がないサイト、地理的切り替えのみ |
| Residential | 低（実 ISP の IP） | $$$ | データセンター ASN をブロックするサイト |
| Mobile | 極めて低（キャリアグレード NAT、数千人と共有） | $$$$ | Residential さえブロックするサイト（稀） |

**Residential と Mobile に関する倫理的留意点:** これらのプールは実際の
一般消費者の接続を介してトラフィックを中継します。プール運営者の同意
モデルは多様で、ユーザに対価を支払う事業者もあれば、「無料 VPN」の
EULA に出口ノード同意を紛れ込ませ、ユーザが実際には読んでいない形で
成立させている事業者もあります。監査済みかつオプトインの同意モデルを
持つプロバイダを選んでください。見知らぬ他人が自分の家のルータ経由で
スクレイピングトラフィックを送ることに抵抗があるなら、他人の回線を
通して自分のトラフィックを送ってはいけません。

**Expected:** 最も安価で実用可能なティアを選択したことが文書化され、
なぜより高いティアを棄却したか（またはなぜ高いティアが必要か）の短い
メモが添えられている。

**On failure:**
- Datacenter はブロックされたが Residential は予算超過 — ティアを上げる
  前にスクレイピングの範囲を絞る（URL を減らす、ケイデンスを下げる）
- オプトイン同意が文書化されたプロバイダを見つけられない — そもそも
  スクレイピングが必要かどうかを再検討する

### Step 3: scrapling にローテーションを統合する

scrapling のフェッチャーにプロキシを組み込みます。認証情報は環境変数
から読み込みます。ハードコードは厳禁であり、`.env` を git にコミット
しては絶対にいけません。

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

# パターン A: プロバイダ管理のローテーティングエンドポイント（単一 URL、プロバイダがリクエストごとに切替）
PROXY_URL = os.environ["SCRAPING_PROXY_URL"]  # http://user:pass@gateway.example:7777

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

# パターン B: 明示的なプールを自分でローテーションする
POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")  # カンマ区切りの URL

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

**Expected:** リクエストが成功し、呼び出しごとに送信元 IP が変化する。
実際のスクレイピングを走らせる前に、IP エコー用エンドポイント
（例: `https://api.ipify.org`）で確認する。

**On failure:**
- 407 Proxy Authentication Required — 認証情報が誤っているか、パスワード
  の URL エンコードが崩れている（特殊文字を再エンコードする）
- どの呼び出しでも同じ IP が返る — プロバイダのエンドポイントが既定で
  スティッキーになっている可能性がある。`-rotating` やリクエスト単位の
  フラグの有無をドキュメントで確認する
- 遅延が大幅に増加する — 想定内。ローテーションはリクエストごとに
  200〜2000 ミリ秒を追加する

### Step 4: スティッキーセッションとプールの健全性

ワークロードごとにローテーションの粒度を決め、その上でプールを健全に
保ちます。

```python
# ステートフルなフロー（ログイン、複数ページにまたがるチェックアウト系の巡回）向けのスティッキーセッション。
# 多くのプロバイダはユーザー名にセッション ID を埋め込む形で公開している:
#   user-session-abc123:pass@gateway.example:7777
# 同じセッション ID を持つリクエストは、約 10 分間すべて同じ IP を経由する。

# 匿名の大量スクレイピングにはリクエスト単位のローテーション（デフォルト）を使う。

# プール健全性チェック — 大規模実行の前に呼び出す
def check_pool(pool, sample_size=5):
    sample = random.sample(pool, min(sample_size, len(pool)))
    alive = []
    for proxy in sample:
        try:
            r = StealthyFetcher().configure(proxy=proxy, timeout=10).get(
                "https://api.ipify.org"
            )
            if r.status == 200:
                alive.append(proxy)
        except Exception:
            pass
    return alive

# 一時的なプロキシ障害に対するバックオフ
def fetch_with_backoff(url, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            r = fetch_with_rotation(url)
            if r.status not in (407, 502, 503):
                return r
        except Exception:
            pass
        time.sleep(2 ** attempt)
    return None
```

**Expected:** ステートフルなフローではリクエストをまたいで Cookie が
保持される。匿名の大量スクレイピングではリクエストごとに IP がばらつく。
死んだプロキシはループせずにスキップされる。

**On failure:**
- フロー途中でログインが壊れる — セッションの内側でローテーションが
  発生している。スティッキーセッションの認証情報に切り替える
- サンプルしたプロキシがすべて健全性チェックに失敗する — プールが
  枯渇しているか認証情報が失効している。認証情報を更新するか、
  プロバイダに連絡する

### Step 5: モニタリング、コスト管理、キルスイッチ

プロキシトラフィックには GB 単価とリクエスト単価が発生します。暴走した
スクレイパは暴走した請求書を生みます。常に上限と停止機構を組み込んで
ください。

```python
import time

class ScrapeBudget:
    def __init__(self, max_requests, max_duration_seconds, max_failures):
        self.max_requests = max_requests
        self.max_duration = max_duration_seconds
        self.max_failures = max_failures
        self.requests = 0
        self.failures = 0
        self.start = time.monotonic()

    def allow(self):
        if self.requests >= self.max_requests:
            return False, "request cap reached"
        if time.monotonic() - self.start >= self.max_duration:
            return False, "time cap reached"
        if self.failures >= self.max_failures:
            return False, "failure cap reached (circuit breaker)"
        return True, None

    def record(self, success):
        self.requests += 1
        if not success:
            self.failures += 1

budget = ScrapeBudget(max_requests=1000, max_duration_seconds=3600, max_failures=20)

for url in target_urls:
    ok, reason = budget.allow()
    if not ok:
        print(f"Aborting: {reason}")
        break
    response = fetch_with_backoff(url)
    budget.record(success=response is not None)
    time.sleep(1)  # ローテーションがあってもレート制限は依然として適用する
```

**Expected:** 予算上限が暴走コストに先んじて発動する。ログにプロキシ
ごとの成功率が出力され、問題のある送信元 IP を特定して除外できる。

**On failure:**
- 失敗率が 20% を超えて上昇する — 一時停止する。サイトがローテーション
  パターンを検知している可能性がある（例: すべての IP が同じサブネット
  を共有している）。プール種別を切り替えるか停止する
- レコードあたりのコストが想定の 5 倍を超える — 積極的にキャッシュし、
  URL を重複排除し、可能な箇所はバッチ化する

## 検証

- [ ] Step 1 の合法性チェックが、いかなるコードを動かす前に書面で文書化
      されている
- [ ] トラッキング対象のファイルにプロキシ認証情報、プール URL、セッション
      ID が含まれていない（`gateway.`、`proxy=`、プロバイダのホスト名で
      grep する）
- [ ] `.env`（または同等のファイル）が `.gitignore` に含まれている
- [ ] プール選定が正当化されている。最も安価で実用可能なティアを選び、
      residential/mobile については同意モデルが確認済みである
- [ ] 本番実行の前に、エコー用エンドポイントで IP のばらつきを確認して
      いる
- [ ] ステートフルなフローはスティッキーセッションを使い、匿名の大量
      処理はリクエスト単位を使っている
- [ ] 予算上限（リクエスト数、実行時間、失敗数）が配線されテスト済みで
      ある
- [ ] レート制限（1 秒以上）が維持されている。ローテーションを理由に
      洪水のようなアクセスをしない
- [ ] `robots.txt` が依然として尊重されている。ローテーションがこれを
      上書きすることはない

## よくある落とし穴

- **ステルス策を使い切る前にローテーションに走る**: サイトは新しい IP を
  必要としていないことが多く、現実的な User-Agent、TLS フィンガープリント、
  より遅いケイデンスを必要としているだけのことが多い。まず
  `StealthyFetcher` とレート制限を試す。ローテーションは高コストで、
  不要に展開するのは倫理に反する。
- **認証情報のハードコード**: プロキシ URL をソースファイルに貼り付けると、
  git、コンテナイメージ、スタックトレースへ漏洩する。必ず環境変数または
  シークレットマネージャから読み込む。
- **セッションの途中でのローテーション**: リクエスト単位のローテーションは、
  Cookie、CSRF トークン、ショッピングカートの状態に依存するあらゆる
  フローを壊す。ステートフルな作業にはスティッキーセッションを使う。
- **ローテーションを「倫理的な匿名性」とみなす**: ローテーションは対象
  サイトから*あなた*を隠すが、有害なスクレイピングを倫理的にする訳では
  ない。ToS、著作権、プライバシー法、レート制限の倫理は従来通り適用
  される。
- **高リスク用途でのレジデンシャルプロキシの利用**: クレデンシャル
  スタッフィング、スニーカー bot、地理的な配信コンテンツの海賊化、
  不正行為 — これらはこのスキルの対象外であることを明示する。自分の
  ユースケースがこれに見えるなら、やめる。
- **「ローテーションを導入したから」と `robots.txt` を無視する**:
  ローテーションは許可を与えるものではない。ディレクティブは
  ディレクティブである。
- **キルスイッチの欠如**: 従量課金のプロキシプール上で監督なしにループを
  走らせると、一晩で四桁の請求書に化ける。必ずリクエスト数、実行時間、
  失敗数の上限を設ける。
- **同意が不透明なレジデンシャルプールを選ぶ**: 一部のプロバイダは、
  実ユーザが読まない「無料 VPN」の EULA から出口ノードを調達している。
  監査済みでオプトインの同意モデルを持つ事業者のために割増料金を払う。

## 関連スキル

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — 親スキル。
  常にこちらから始める。本スキルはエスカレーションとしてのみ利用する。
- [use-graphql-api](../use-graphql-api/SKILL.md) — 公式 API が存在する
  ときは、スクレイピングよりも API を優先する。
- [deploy-searxng](../deploy-searxng/SKILL.md) — セルフホスト型の検索に
  より、検索エンジンのスクレイピング自体を回避できる。
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) —
  ネットワークの反対方向（取得ではなく提供）。近隣領域として有用な
  参照先。
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 認証
  情報を統合した後に実行し、リポジトリへ何も漏洩していないことを確認
  する。

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
