---
name: redact-for-public-disclosure
description: >
  方法論、一般化可能なパターン、および教育的価値を保持しつつ、
  リバースエンジニアリングの発見を公開用にリダクトする。プライベート
  対パブリックリポジトリの分離、deny-listパターンの保守、`git log`
  漏洩を防ぐorphan-commit公開パターン、カテゴリベースのリダクト較正
  (方法論/パターン/バージョン発見/内部)、および deny-list された
  パターンが出現したときにマージをブロックする `check-redaction.sh`
  形式のCIゲートを扱う。自身が所有していないCLIハーネスについての
  発見を公開する場合、無関係のプロジェクトへのアップストリーム提案
  を準備する場合、またはプライベート研究リポジトリを公開参照用に
  アーカイブする場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
  locale: ja
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# 公開用リダクト

リバースエンジニアリングの研究リポジトリを、プライベートな真の情報源とパブリックな公開用サブセットに分割する。リダクトチェッカ、パターンdeny-list、orphan-commit公開パターンを使用する。方法論は流通させ、具体的な発見はプライベートに留める。

## 使用する場面

- 統合するクローズドソースのCLIハーネスについての方法論的発見を公開する
- 自身が所有していないプロジェクトにアップストリーム提案またはバグレポートを準備する
- プライベート研究リポジトリを公開参照としてアーカイブする
- 調査ノート(Phase 1-4アーティファクト)を公開ガイドに昇格させる
- 発見が蓄積する前に公開パイプラインを確立し、漏洩リスクが溜まらないようにする
- 下書きが機微な識別子をあやうく出荷しかけたニアミスの後片付け

## 入力

- **必須**: 機密度が混在するコンテンツを持つプライベート研究リポジトリ(真の情報源)
- **必須**: リダクト済みコンテンツが公開されるターゲットのパブリックミラー(別リポジトリ、または `public/` ワークツリー)
- **オプション**: 公開予定の既存ドラフト
- **オプション**: バージョン遅延ポリシー(デフォルトは「現行 + 直前1つはプライベート」)
- **オプション**: 既に機微と判明しているベンダー識別子、フラグプレフィックス、または名前空間のリスト

## 手順

### Step 1: すべての候補事実を分類する

コンテンツを書いたり昇格させたりする前に、各事実を次の4カテゴリのいずれかに分類する。カテゴリが、出荷できるかどうかとその時期を決定する。

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

公開レビュー前に、各ドラフトセクション、キャプチャログ、またはノートにカテゴリを注釈する。カテゴリが混在するセクションは分割される — 方法論はきれいに取り出され、残りはプライベートに留まる。

**Expected:** すべての候補事実にカテゴリラベルがある。パブリックミラー向けのドラフトは方法論と一般パターンのエントリ(およびクールオフを超えたバージョン固有の発見)のみを含む。

**On failure:** 事実が分類に抵抗する場合、デフォルトでライブ内部として扱う。バージョン遅延ポリシーに対する明示的なレビュー後にのみ再分類する。

### Step 2: バージョン遅延クールオフポリシーを設定する

「現行」と「共有可能」の間に何バージョン挟むかを事前に決める。2が典型的である: 現行 + 直前1つがプライベートに留まり、それより古いパターンは議論してよい。将来の自分が再導出しなくて済むようにポリシーをプライベートリポジトリに書き込む(例: `REDACTION_POLICY.md`)。

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

「現行」バージョンは経験的(インストールされたバイナリから読み取る)でなければならない。管理的ではない。ポリシーをカレンダーではなくベースラインスキャナ出力に結び付ける。

**Expected:** 明示的なクールオフとオーナーを持つ `REDACTION_POLICY.md` がプライベートリポジトリにコミットされている。

**On failure:** 関係者がクールオフに合意できない場合、最も保守的な提案をデフォルトにする。クールオフは後で短縮できるが、漏洩を取り消すことはできない。

### Step 3: deny-listスキャナを構築する

リダクトポリシーの真の情報源である単一の実行可能スクリプト内にパターンを保持する。スクリプトはプライベートリポジトリ(`tools/check-redaction.sh`)に置き、パブリックミラーに対して実行する。

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

各エントリは人間が読めるラベルと正規表現を持つ。機微な識別子の*形状*ごとに1エントリ(リテラル文字列ごとではない — 形状はバージョンの変化を生き延びる)。終了コードはリーク数に等しい。クリーンな実行は0で終わる。

**Expected:** `tools/check-redaction.sh ./public-mirror` が小さなリポジトリで1秒未満で実行され、何も一致しない場合は0で終了する。

**On failure:** `rg` が利用できない場合、`grep -rqE` にフォールバックする。パターンが広すぎる場合(すべての実行でリークが報告される)、抑制を追加するのではなくソースで狭める。

### Step 4: ドラフト作成前にdeny-listを保守する

Phase 1-4の発見がドラフトを通して漏洩し得る場合、ドラフトが書かれる*前*にスキャナを拡張する。ドラフトは安価である。スキャナに新しいパターンを教えることは永続的である。

ワークフロー:

1. 新しい発見がプライベートリポジトリに上陸する(例: 新しく発見されたフラグプレフィックス)。
2. 問う: 「これが漏れた場合、スキャナに何を捕捉させたいか?」
3. `tools/check-redaction.sh` にパターンエントリ(ラベル + 正規表現)を追加する。
4. 新しいパターンが正当なコンテンツによって既にトリップされないことを確認するため、パブリックミラー全体に対してスキャナを実行する。
5. その後にのみ、その領域に触れる公開コンテンツをドラフトする。

これは通常の順序を反転させる: スキャナが最初に更新され、ドラフトが2番目。スキャナは「公開するには機微すぎるもの」の実行可能な仕様になり、ドラフトは誤ってそれを追い越せなくなる。

**Expected:** `tools/check-redaction.sh` 内のパターンエントリが、それらに一致し得るパブリックミラーコンテンツより先行している。`git log tools/check-redaction.sh` は関連ドラフトコミットより先にスキャナ更新が上陸していることを示す。

**On failure:** スキャナ更新がドラフトに遅れる場合、新しいパターンに対してパブリックミラーを直ちに監査する。リダクトした後、発見されたパターンを説明するノートと共にスキャナ更新をコミットする。

### Step 5: プライベート/パブリックファイルセット分割を確立する

パブリックミラーに同期されるファイルの明示的な許可リストを定義する。新規ファイルはデフォルトでプライベート。昇格にはリダクトチェック合格が必要。

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` は許可リストを読み、それらのファイルのみをパブリックミラーにコピーし、許可リストが存在しないファイルを参照する場合はゼロ以外で終了する(タイプミスを捕捉する)。

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

昇格には順に3つが必要: ファイルが許可リストに追加される、ファイルがリダクトチェックを通過する、レビュアーがStep 1のカテゴリラベルを確認する。

**Expected:** パブリックミラーには `tools/public-allowlist.txt` に列挙されたファイルだけが正確に含まれる。許可リストにないファイルがパブリックミラーに出現することはない。

**On failure:** パブリックミラーに出現するが許可リストに欠けているファイルがある場合、リーク事象として扱う — どう到達したかを調査し、削除するかリダクトレビュー後に正式に昇格させる。

### Step 6: orphan-commitで公開する

パブリックミラーは、各公開時に再作成される単一の `git commit --orphan` をルートとするコミットである。これにより、パブリックリポジトリの `git log` がリダクト前のドラフトを露呈するのを防ぐ。

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

パブリックリポジトリの `git log` は正確に1つのコミットを示す。以前のドラフトとあらゆるリダクトの反復はプライベートリポジトリの履歴に留まる。パブリックリポジトリ上の `git log -p`、`git reflog`、またはブランチ一覧からは、そこにコミットされたことがないため、リダクト前のコンテンツを復元することはできない。

**Expected:** パブリックミラー上の `git log --oneline` が公開ごとに単一のコミットを示す。プライベートリポジトリの履歴への参照(親SHA、マージコミット、プライベートリポジトリからのタグ)は出現しない。

**On failure:** `git push --force` が拒否される場合(ブランチ保護)、代わりにクリーンなorphanブランチから単一コミットのプルリクエストを開く。プライベート履歴をプッシュすることで拒否を解決してはならない。

### Step 7: CIゲートを配線する

パブリック同期ブランチへの各コミットで `tools/check-redaction.sh` を実行する。失敗したチェックは公開を警告するのではなくブロックする。

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

ここでの2つの設計上の選択:

- スキャナはCI時にプライベートリポジトリから取得されるため、deny-list自体がパブリックリポジトリに存在することはない(パターン自体が機微である — 公開すると読み手に何を探すべきかを正確に伝えてしまう)。
- ジョブはスキャナの終了コードで終わる。ゼロ以外はワークフローをブロックする。

**Expected:** deny-listされたパターンを持ち込むプッシュはCIで失敗する。公開は上陸しない。メンテナは失敗ラベル(例: `LEAK: vendor-prefixed flag`)を正規表現自体を見ずに見る。

**On failure:** プライベートリポジトリのトークンをパブリックCIに付与できない場合、*最小漏洩*部分のスキャナのみ(ベンダーを特定しない幅広い形状パターン)をパブリックリポジトリに埋め込み、完全なスキャナをプライベートリポジトリからpush前に実行する。

### Step 8: 偽陽性を正直に扱う

スキャナが正当なコンテンツでトリップする場合、無視行を追加するよりパターンを狭めることを優先する。ローカルな抑制を持つ幅広いdeny-listは急速に腐敗する — 6か月後には特定の行がなぜ抑制されたかを誰も覚えておらず、次のリークが気づかれずすり抜ける。

決定ツリー:

1. **一致が実際に安全か?** Step 1を使って再分類する。コンテンツが変装したライブ内部であると判明した場合、リダクトする。スキャナを抑制してはならない。
2. **パターンが広すぎるか?** 安全なコンテンツがもはや一致しないよう正規表現を絞る。絞り込みを動機付けたケースにリンクするコメントで `check-redaction.sh` に記録する。
3. **1と2の両方が失敗した場合のみ** — そしてパターンが正当なコンテンツと構造的に絡まりすぎて、それ以上絞れない場合 — 抑制が安全である*理由*を述べた `# REASON:` コメントを持つ単一行抑制を使用する。コメントに日付を付ける。

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**Expected:** 各スキャナパターンには絞り込みを説明するインラインコメントが0件または1件ある。抑制がもしあれば、日付と根拠が付いている。

**On failure:** 抑制が蓄積する(四半期に1件以上)場合、deny-listの形が悪い。リダクトポリシーレビューを予定し、分類済み事実インベントリからパターンを再構築する。

### Step 9: 定期的なリダクトスイープ

すべてのリダクト作業がインシデント駆動であるわけではない。プライベートリポジトリへの最近の追加を再分類し、パブリックミラーに対してスキャナを再実行する定期スイープ(月次が典型的)を行う。ドリフトはインシデント級になる前に自ら捕捉する。

スイープチェックリスト:

- [ ] バージョン遅延ポリシーを再読する。経験的な「現行」バージョンが不変であることを確認するか、ポリシーを更新する
- [ ] 過去1か月のプライベートリポジトリコミットを監査し、分類されなかった新規発見を探す(Step 1)
- [ ] パブリックミラーに対して `tools/check-redaction.sh` を実行する(依然として0で終わるはず)
- [ ] 前回のスイープ以降に追加されたスキャナパターンをレビューする — 広すぎるものはあるか? そうなら絞る
- [ ] いずれかのバージョンがクールオフを超えた場合、昇格の対象となる発見を特定する
- [ ] `tools/public-allowlist.txt` が実際のパブリックミラーファイルセットと一致することを確認する

**Expected:** プライベートリポジトリ内の月次の短いスイープログ(例: `sweeps/2026-04.md`)にチェックリスト結果と実施した任意のアクションがある。

**On failure:** スイープが繰り返しスキップされる場合、カレンダーリマインダを自動化する。スイープが同じドリフトを見つけ続ける場合、その上流のワークフローが問題である — ドラフト時に分類がなぜスキップされているかを調査する。

## 検証

- [ ] パブリックミラー内のすべてのファイルが `tools/public-allowlist.txt` にある
- [ ] `tools/check-redaction.sh ./public-mirror` が0で終わる
- [ ] パブリックミラー上の `git log --oneline` が公開ごとに単一のorphanコミットを示す
- [ ] `REDACTION_POLICY.md` がプライベートリポジトリに存在し、明示的なバージョン遅延クールオフを持つ
- [ ] すべてのPhase 1-4発見にカテゴリラベルがある(methodology / generic pattern / version-specific / live internal)
- [ ] パブリックCIが各プッシュでスキャナを実行する。意図的なテストパターンがビルドを失敗させる
- [ ] deny-listスキャナ自体がパブリックリポジトリに存在しない
- [ ] 最新の月次スイープログが過去35日以内の日付である

## よくある落とし穴

- **「具体化するために一例だけ」**。「方法論を地に足を付けるため」に具体的な発見を1つ含めたい誘惑は、最も一般的な漏洩経路である。合成プレースホルダ(例: `acme_widget_v3`、`widget_handler_42`)を使う — 明らかに発明されたもの、決して実際の製品に追跡可能でないもの。
- **パブリックリポジトリ上でインプレースに漏洩をスクラブするために `git rebase` または `git filter-branch` を使う**。書き直された履歴を強制プッシュしても、クローンとフォークに痕跡が残る。orphan-commit公開パターンは構造的な修正である。場当たり的な履歴書き換えはそうではない。
- **パターン絞り込みの代わりに抑制**。20個の抑制を持つスキャナは、有意味なカバレッジを0持つスキャナである。すべての抑制は、コンテキストが薄れるのを待つ将来の漏洩である。
- **失敗ではなく警告するパブリックCI**。警告は無視される。CIゲートは公開をブロックしなければならない(ゼロ以外の終了、マージボタンなし)。
- **許可リストドリフト**。プライベートリポジトリに追加された新規ファイルが自動的に許可リストに属するわけではない。デフォルト拒否が唯一安全な姿勢である。
- **暗号化をリダクトと勘違いする**。機微な識別子をエンコード、ハッシュ、またはrot13して結果を公開することは、依然としてそれを公開している — 元の値は復元可能である。リダクトとは「まったく出現しない」を意味する。
- **deny-listを公開する**。パターン自体が発見カタログである: 正規表現を見る読み手は、バイナリで何をgrepすべきかを正確に知る。スキャナをプライベートに保ち、そのラベル(例: `LEAK: vendor-prefixed flag`)のみをパブリックCIログに出す。
- **プライベートリポジトリをドラフトの堆積場所として扱う**。それは研究の真の情報源であり、スクラッチスペースではない。本番アーティファクトに適用するのと同じバージョン管理、レビュー、バックアップ規律を適用する。

## 関連スキル

- `monitor-binary-version-baselines` — Phase 1。ベースラインがバージョン遅延ポリシーを供給する: 「現行」として数えるのは経験的事実であり、カレンダー上の事実ではない
- `probe-feature-flag-state` — Phase 2-3。ここでの分類発見がカテゴリステップ(Step 1)でリダクトパイプラインに入る
- `conduct-empirical-wire-capture` — Phase 4。キャプチャアーティファクト(ワイヤーログ、ペイロードスキーマ)は、公開で参照される前にリダクトが必要
- `security-audit-codebase` — 両パイプラインがdeny-list形式のスキャンから恩恵を受ける。このスキルは秘密漏洩ではなく研究公開に特化している
- `manage-git-branches` — orphan-commit公開パターンはブランチ操作である。安全な実行にはそこに文書化されたブランチ衛生の実践が必要
