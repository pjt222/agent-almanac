---
name: file-trademark
description: >
  Trademark filing procedures covering EUIPO (EU), USPTO (US), and WIPO Madrid
  Protocol (international). Walks through pre-filing conflict checks, Nice
  classification, descriptiveness assessment, mark type decisions, filing basis
  strategy, office-specific e-filing procedures, Madrid Protocol extension, post-
  filing monitoring, and open-source trademark policy drafting. Use after running
  screen-trademark to confirm the mark is clear, when ready to secure trademark
  rights in one or more jurisdictions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, trademark, filing, euipo, uspto, madrid-protocol
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# File Trademark

EUIPO（EU）、USPTO（US）、WIPO マドリッドプロトコル（国際）に商標出願する。本スキルは出願前検証から登録後監視・オープンソース商標ポリシーまで、実際の出願手順をカバーする。コンフリクトスクリーニングは `screen-trademark` で既に完了していると仮定する。

## 使用タイミング

- コンフリクトスクリーニングが clear である後、商標出願の準備ができたとき
- EU、US、または国際出願戦略の選択
- EU 商標を出願し、後続の US 出願に優先権を主張する
- 既存の国内マークをマドリッドプロトコル経由で国際的に拡張する
- 登録後にオープンソース商標利用ポリシーを起草する
- 審査中の office action または異議手続きへの対応

## 入力

- **必須**: 出願するマーク（言葉、ロゴ、複合）
- **必須**: 商品・サービス記述
- **必須**: ターゲット司法権（EU、US、国際、または組み合わせ）
- **必須**: 出願人氏名と住所
- **任意**: Screen-trademark 結果（コンフリクト検索レポート）
- **任意**: ロゴファイル（具象または複合マークを出願する場合）
- **任意**: 優先権主張（別の司法権での 6 ヶ月以内の先行出願）
- **任意**: 商業使用の証明（USPTO 1(a) basis に必要）
- **任意**: オープンソースプロジェクト文脈（ステップ10 の商標ポリシー用）

## 出願コスト参照

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## 手順

### ステップ1: 出願前チェック

出願料金を投じる前に、マークが出願に対して clear であることを検証する。

1. `screen-trademark` が実行されたことを確認:
   - 同一または混同を生じうる類似マークについてコンフリクト検索レポートをレビュー
   - すべてのターゲット司法権がスクリーニングでカバーされたか検証
   - スクリーニングが最近（理想的には過去 30 日以内）か確認
2. 公式データベースに対して最終コンフリクトチェックを実行:
   - **EUIPO TMview**: すべての EU 加盟国登録簿を横断検索
   - **WIPO Global Brand Database**: 国際登録
   - **USPTO TESS**: US 連邦登録簿（構造化検索を使う: `"mark text"[BI]`）
   - **DPMAregister**: ドイツ国内登録簿（EU 出願時、最大の EU 市場をカバー）
3. ドメイン名とソーシャルメディアハンドルが利用可能または確保されているか検証:
   - ドメイン可用性は挑戦された場合の独自性議論を強化
   - 一致するハンドルは消費者混同リスクを減らす
4. 検索結果を **Pre-Filing Clearance Record** として文書化

**期待結果：** ターゲット司法権にブロックするマークが存在しないことの確認。Pre-Filing Clearance Record はデュー・ディリジェンスを文書化し将来の異議防御をサポートする。

**失敗時：** 衝突マークが見つかったら、深刻度を評価: 同一マーク + 同一商品 = 出願しない。類似マーク + 関連商品 = 混同のおそれについて法律顧問を求める。コンフリクトが単一司法権に限られるなら、clear な司法権でのみの出願を検討する。

### ステップ2: ニース分類選択

ニース分類システムの下で正しい商品・サービスクラスを特定する。

1. クラス特定のため TMclass ツール（tmclass.tmdn.org）を参照:
   - 商品/サービス記述を入力
   - TMclass はほとんどの office に受け入れられる調和化された用語を提案
   - TMclass データベースの事前承認用語を使うと審査遅延が減る
2. 技術とソフトウェアの一般的なクラス:
   - **Class 9**: ダウンロード可能ソフトウェア、モバイルアプリ、コンピュータハードウェア
   - **Class 35**: 広告、ビジネス管理、SaaS プラットフォーム管理
   - **Class 42**: SaaS、クラウドコンピューティング、ソフトウェア開発サービス
   - **Class 38**: 通信、オンラインプラットフォーム、メッセージングサービス
3. 商品・サービス記述を起草:
   - 実際の使用を定義するに十分具体的だが、将来拡張に十分広く
   - TEAS Plus（USPTO）は ID Manual の用語を要求 — 事前承認用語を使う
   - EUIPO は TMclass 調和化用語を直接受け入れる
4. コストとカバレッジのバランス:
   - 各追加クラスは料金を加える（上のコスト表参照）
   - 現在使用しているまたは使用するつもりのクラスで出願する
   - 使用なしの過度に広い出願は挑戦されうる（特に US で）

**期待結果：** 各クラスの具体的、事前承認商品・サービス記述を伴うニースクラスの最終リスト。記述は実際のビジネス使用と一致する。

**失敗時：** TMclass が明確なマッチを提案しないなら、ニース分類解説書（WIPO ニースページ）を参照する。曖昧な商品は時に複数クラスにまたがる — 除外リスクよりも、すべての関連クラスで出願する。

### ステップ3: 識別性評価

マークが登録可能か、または識別性異議に直面するかを評価する。

1. **Abercrombie スペクトラム**（US 標準、広く適用）でマークを評価:
   - **Generic**: 製品の一般名（例: コンピュータに対する「Computer」）— 決して登録不能
   - **Descriptive**: 質または特徴を直接記述（例: 「QuickBooks」）— セカンダリミーニングがある場合のみ登録可
   - **Suggestive**: 示唆するが直接記述しない（例: 「Netflix」）— セカンダリミーニングなしで登録可
   - **Arbitrary**: 無関係な文脈で使われる実在語（例: 電子機器に対する「Apple」）— 強い保護
   - **Fanciful**: 発明された語（例: 「Xerox」）— 最強の保護
2. EUTMR 絶対拒絶理由（Article 7(1)）に対して確認:
   - Art. 7(1)(b): 識別性を欠く
   - Art. 7(1)(c): 商品/サービスの特性を記述
   - Art. 7(1)(d): 取引で慣習（関連分野で generic）
3. マークが境界的識別的なら:
   - 取得された識別性の証拠を集める（広告支出、売上数値、消費者調査）
   - 識別的要素（ロゴ、スタイライゼーション）の追加を検討
   - 言葉マークを suggestive または arbitrary 方向へ修正
4. 評価を理由付きで文書化

**期待結果：** マークは Abercrombie スペクトラムで suggestive、arbitrary、fanciful のいずれかに分類される — すべてセカンダリミーニングなしで登録可。境界ケースは緩和戦略と共にフラグ付けされる。

**失敗時：** マークが descriptive または generic なら出願しない — 拒絶される。識別性スペクトラムを上るようマークを再設計。重要な使用履歴があれば、US には Section 2(f) 主張（取得された識別性）、EU には Art. 7(3) EUTMR 下の類似主張を検討。

### ステップ4: マークタイプ決定

ブランドを最もよく保護する登録タイプを選ぶ。

1. **Word mark**（標準文字）:
   - フォント、色、スタイルに関わらず単語自体を保護
   - 最広保護 — 任意の視覚表現をカバー
   - 設計要素を含めない
   - ブランド価値がロゴではなく名前にあるとき最良
2. **Figurative mark**（ロゴまたは設計）:
   - 特定の視覚表現を保護
   - より狭い保護 — 他のスタイルでの単語をカバーしない
   - ロゴ自体が主要なブランド識別子のとき必要
   - 明確な画像ファイルを提出（JPG/PNG、EUIPO: max 2 MB、min 945x945 px）
3. **Combined mark**（言葉 + ロゴ一緒に）:
   - 出願された特定の組み合わせを保護
   - 単独の word mark より狭い — 特定の組み合わせに限定
   - 一般的だが戦略的に最適でない: ロゴが変わると登録は新しいバージョンをカバーしないかもしれない
4. **戦略的推奨**:
   - まず word mark を出願（最広保護、最もコスト効果的）
   - ロゴが大きな独立ブランド価値を持つ場合のみ別個の figurative mark を出願
   - 予算制約が別個出願を妨げない限り combined mark は避ける

**期待結果：** 戦略的推論を伴う明確なマークタイプ決定。ロゴが独立ブランド価値を持たない限り Word mark が既定推奨。

**失敗時：** 名前単独で十分識別的かわからないなら、こう問うてテストする: 「消費者はロゴなしで普通のテキストでこの名前を認識するか？」イエスなら word mark を出願。ロゴがブランドアイデンティティから不可分なら、word mark と figurative mark を別々に出願することを検討。

### ステップ5: 出願 Basis 選択

出願の法的根拠を判定する（主に USPTO で関連）。

1. **Use in commerce — Section 1(a)**:
   - マークが既に州際商業（US）または genuine use（EU）で使用中
   - 使用中のマークを示す specimen を提出（スクリーンショット、パッケージ、広告）
   - 登録への最速経路
2. **Intent to use — Section 1(b)**:
   - マークがまだ使用中ではないが、出願人は誠実な使用意図を持つ
   - 登録前に Statement of Use を要求（追加料金、期限）
   - ローンチ前に優先権を確保することを許す
   - 期限延長利用可能（合計最大 36 ヶ月）
3. **Foreign priority — Section 44(d)**:
   - 過去 6 ヶ月以内になされた外国出願から優先権を主張
   - **戦略**: まず EUIPO 出願（より低コスト、速い）、それから USPTO に 44(d) 優先権を主張
   - これにより US 出願に EU 出願と同じ優先日を与える
   - 外国出願の認証コピーが必要
4. **Foreign registration — Section 44(e)**:
   - 外国登録（出願ではなく）に基づく
   - 出願時の US 商業での使用は不要（しかし最終的に使用しなければならない）
5. **Madrid Protocol extension — Section 66(a)**:
   - マドリッドシステムを通じた US の指定
   - マドリッド詳細はステップ8 を参照

**期待結果：** タイムラインと specimen 要件が文書化された出願 basis。EU-first 戦略（EUIPO それから USPTO へ 44(d)）を使うなら、6 ヶ月の優先期間がカレンダー化される。

**失敗時：** 商業での使用がなく外国出願が pending でないなら、Section 1(b)（intent to use）が USPTO の唯一の選択肢。追加の Statement of Use コストと期限を加味する。EUIPO では出願時に使用は不要 — 意図の宣言で十分。

### ステップ6: EUIPO E-Filing 手順

EU 商標出願をオンラインで出願する。

1. EUIPO e-filing ポータル（euipo.europa.eu）にナビゲート:
   - まだ登録していなければ EUIPO ユーザーアカウントを作成
   - 事前承認 TMclass 用語には "Fast Track" 出願を使う（速い審査）
2. 出願フォームを完成:
   - **Applicant details**: 氏名、住所、法的形態、国籍
   - **Representative**: EU ベース出願人には任意; 非 EU 出願人には必須
   - **Mark**: word mark テキストを入力または figurative mark 画像をアップロード
   - **Goods and services**: TMclass 用語を選ぶか、カスタム記述を入力
   - **Filing language**: EN、FR、DE、ES、IT から選ぶ（第 2 言語必要）
   - **Priority claim**: 優先権を主張するなら外国出願番号と日付を入力
3. 料金概要をレビュー:
   - 1 class: 850 EUR
   - 2 classes: 900 EUR (+50 EUR)
   - 3+ classes: 900 EUR + 追加クラスごと 150 EUR
   - **SME Fund (EUIPOIdeaforIP)**: 中小企業は 75% 償還を主張可
4. オンラインで支払う（クレジットカード、銀行振込、または EUIPO current account）
5. 出願番号と出願日付の出願受領書を保存

**期待結果：** 確認受領書付きで EUIPO 出願が出願された。出願番号と出願日付が記録された。Fast Track を使えば、審査は通常 1 ヶ月以内に完了する。

**失敗時：** オンラインポータルが出願を拒否（技術的エラー）したら、スクリーンショットを保存して再試行。商品/サービス記述が拒否されたら、事前承認 TMclass 用語に切り替える。支払いが失敗すれば、出願はドラフトとして 30 日間保存される。

### ステップ7: USPTO 出願手順

US 連邦商標出願をオンラインで出願する。

1. USPTO TEAS（Trademark Electronic Application System）にナビゲート:
   - TEAS Plus（$250/class）または TEAS Standard（$350/class）を選ぶ
   - TEAS Plus は事前承認 ID Manual 用語を要求; TEAS Standard は自由形式記述を許す
2. **外国出願人要件**:
   - US 外に住所地を持つ出願人は US ライセンス弁護士を任命しなければならない
   - 弁護士は US 州弁護士会の good standing メンバーでなければならない
   - この要件はマドリッドプロトコル経由の出願にも適用される
3. 出願フォームを完成:
   - **Applicant information**: 氏名、住所、エンティティタイプ、市民権/組織の州
   - **Attorney information**: 氏名、弁護士会員資格、通信メール
   - **Mark**: 標準文字で word mark を入力または design mark 画像をアップロード
   - **Goods and services**: ID Manual から選ぶ（TEAS Plus）またはカスタム起草（TEAS Standard）
   - **Filing basis**: Section 1(a)、1(b)、44(d)、44(e) から選ぶ（ステップ5 参照）
   - **Specimen**（1(a) basis のみ）: 商業で使用中のマークを示すアップロード
   - **Declaration**: 偽証罪の責任の下で正確性を検証
4. 出願料金を支払う（クラスあたり $250 または $350）
5. シリアル番号と出願日付の出願受領書を保存

**期待結果：** シリアル番号が割り当てられた USPTO 出願。出願受領書が保存された。審査は典型的に最初の office action まで 8-12 ヶ月かかる。

**失敗時：** TEAS システムが出願を拒否したら、エラーメッセージをレビューする — 一般的問題には誤ったエンティティタイプ、欠落 specimen（1(a) 出願）、ID Manual 用語に一致しない商品記述（TEAS Plus）が含まれる。外国出願人が US 弁護士なしで出願すると出願は拒否される。

### ステップ8: マドリッドプロトコル拡張

WIPO マドリッドシステムを通じて保護を国際的に拡張する。

1. **前提条件**:
   - origin office にベースマーク（出願または登録）
   - 出願人はマドリッド加盟国の国民、住所地、または real and effective establishment を持たねばならない
   - ベースマークは同じまたはより狭い商品/サービスをカバーしなければならない
2. origin office を通じて出願（WIPO に直接ではなく）:
   - **EUIPO as origin**: EUIPO Madrid e-filing tool を使う
   - **USPTO as origin**: TEAS International Application form を経由
3. マドリッド出願（MM2 form）を完成:
   - **Applicant details**: ベースマーク保有者と完全に一致しなければならない
   - **Mark representation**: ベースマークと同一でなければならない
   - **Goods and services**: ベースマークの仕様から選ぶ（狭めることはできるが広げることはできない）
   - **Designated Contracting Parties**: ターゲット国/地域を選ぶ
   - **Language**: English、French、Spanish
4. 料金を計算:
   - Base fee: 653 CHF（白黒）または 903 CHF（カラー）
   - Supplementary fee: 最初を超えるクラスごとに 100 CHF
   - Individual fees: 指定国により異なる（WIPO 料金計算機を確認）
   - 一般的な individual fees: US ~$400+/class、Japan ~$500+/class、China ~$150+/class
5. **Central attack 依存**:
   - 最初の 5 年間、国際登録はベースマークに依存
   - ベースマークが取り消されると（異議、不使用）、すべての指定が落ちる
   - 5 年後、各指定は独立になる
   - 戦略: 依存期間中ベースマーク保護を強力に行う

**期待結果：** origin office を通じてマドリッド出願が出願された。料金計算が文書化された指定国が選ばれた。5 年依存リスクが認識されベースマーク保護計画が整っている。

**失敗時：** origin office がマドリッド出願を拒否（例: ベースマークとの不一致）したら、相違を訂正して再出願する。指定国が保護を拒否したら、指定 office の期限内（典型的に 12-18 ヶ月）にマドリッドシステムを通じて応答する。

### ステップ9: 出願後監視

審査中に出願を追跡し、アクションに応答する。

1. **EUIPO 監視**:
   - EU Trade Marks Bulletin の Part A での公表
   - **異議期間**: 公表から 3 ヶ月（1 ヶ月のクーリングオフで延長可）
   - 異議なし: 登録が自動的に発行される
   - 異議防御: 通知から 2 ヶ月以内に観察を出願
2. **USPTO 監視**:
   - TSDR（Trademark Status and Document Retrieval）を定期的に確認
   - **Examining attorney review**: 出願後 8-12 ヶ月
   - **Office actions**: 応答期限は典型的に 3 ヶ月（$125 で 1 度延長可）
   - **Publication for opposition**: Official Gazette で 30 日期間
   - **Statement of Use**（1(b) 出願）: Notice of Allowance から 6 ヶ月以内に出願（合計最大 36 ヶ月、延長ごと $125）
3. **Madrid 監視**:
   - WIPO が各指定 office に通知
   - 各 office が独立に審査（12-18 ヶ月窓）
   - Provisional refusals はローカル office の手順を通じて応答しなければならない
4. **すべての期限をカレンダー化**:
   - 異議応答期限
   - Statement of Use 期限（USPTO 1(b)）
   - 更新期限（EUIPO 10 年、USPTO 10 年、Madrid 10 年）
   - USPTO Section 8/71 Declaration of Use: 5 年目と 6 年目の間
5. 混同を生じうる類似マークの第三者出願を監視:
   - クラス内の類似マークについて TMview/TESS watch アラートを設定
   - クリティカルブランドにはプロフェッショナル trademark watch service を検討

**期待結果：** すべての期限がリマインダーと共にカレンダー化される。出願ステータスは各 office のオンラインシステムを通じて監視される。異議または office action 応答戦略が事前に準備される。

**失敗時：** 期限を逃すことは致命的でありうる — ほとんどの商標 office 期限は延長不能。期限を逃したら、復活または復旧が利用可能か確認する（USPTO は意図しない遅延に対する petition to revive を許す）。EUIPO では逃した異議期限は一般に最終的。

### ステップ10: オープンソース商標ポリシー

マークがオープンソースプロジェクトをカバーする場合、商標利用ポリシーを起草する。

1. 確立されたモデルを研究:
   - **Linux Foundation**: 事実参照でのプロジェクト名使用を許可; ロゴをライセンシーに制限
   - **Mozilla**: 非変更ディストリビューションと変更ビルドを区別する詳細ガイドライン
   - **Rust Foundation**: 商業製品への特定制限付きでコミュニティ使用への広い許可
   - **Apache Software Foundation**: 推奨を示唆する制限付きの寛容な命名ポリシー
2. 使用カテゴリを定義:
   - **Fair use**（常に許可）: 記事、レビュー、比較、学術論文でプロジェクトを名前で参照
   - **Community/contributor use**（広く許可）: ユーザーグループ、カンファレンス、教育資料、非変更ディストリビューション
   - **Commercial use**（ライセンスまたは制限を要求）: ソフトウェアを組み込む製品、プロジェクトに基づくサービス、認証/互換性主張
   - **Prohibited use**: 公式推奨を示唆、開示なしの実質変更バージョンでの使用、混同を引き起こすドメイン名
3. 商標ポリシードキュメントを起草:
   - 商標所有権の明確な声明
   - 許可なしに何の使用が許されるか
   - 何の使用が書面許可を要求するか
   - 許可をどう要求するか（連絡、プロセス）
   - 誤用の結果
4. ポリシーファイルをプロジェクトリポジトリに配置:
   - 一般的な場所: `TRADEMARKS.md`、`TRADEMARK-POLICY.md`、または `CONTRIBUTING.md` のセクション
   - `README.md` とプロジェクトウェブサイトからリンク
5. ポリシーを公開する前にマークを登録:
   - 登録なしの商標ポリシーはほとんどの場合執行不能
   - 最低限、公開前に出願 — "TM" は即座に使えるが、"(R)" は登録後のみ

**期待結果：** ブランドを保護しつつ健全なコミュニティ使用を可能にする明確で公正な商標ポリシー。ポリシーは確立されたオープンソース foundation モデルに従い、プロジェクトの主ドキュメントからアクセス可能。

**失敗時：** プロジェクトに商標登録または出願がないなら、ポリシーを起草する前にまず出願する（ステップ6-8）。未登録マークは限定的な執行可能性を持つ。コミュニティがポリシーに反発するなら、Rust Foundation のアプローチを研究する — それはコミュニティフィードバック後に修正され、保護と開放性のバランスをとる良いモデルと考えられる。

## バリデーションチェックリスト

- [ ] 出願前コンフリクトチェックが完了し文書化されている（ステップ1）
- [ ] ニースクラスが事前承認商品・サービス記述と共に選ばれている（ステップ2）
- [ ] 識別性が Abercrombie スペクトラムで評価されている（ステップ3）
- [ ] マークタイプが戦略的推論と共に決定されている（ステップ4）
- [ ] 出願 basis がタイムラインと specimen 要件と共に選ばれている（ステップ5）
- [ ] 少なくとも一つのターゲット司法権で出願された（ステップ6-8）
- [ ] 出願番号と出願日付の出願受領書が保存された
- [ ] すべての出願後期限がリマインダーと共にカレンダー化されている（ステップ9）
- [ ] 混同を生じうる類似マーク用に商標 watch アラートが設定されている（ステップ9）
- [ ] 該当する場合オープンソース商標ポリシーが起草されている（ステップ10）

## よくある落とし穴

- **スクリーニングなしの出願**: `screen-trademark` をスキップして直接出願に進むと、衝突マークが存在すれば料金を無駄にする。常にまずスクリーニングする
- **誤った出願 basis**: マークがまだ使用中でないのに use in commerce（1(a)）を主張すると不正出願になる。ローンチが起こっていないなら intent-to-use（1(b)）を使う
- **過度に広い商品記述**: 使用しないまたは使用するつもりがない商品・サービスを主張すると、不使用での取り消し（特に EU では 5 年後）を招く
- **優先期間を逃す**: Section 44(d) 下の外国優先権は最初の出願から 6 ヶ月以内に主張しなければならない。この期間を逃すと先の優先日を失う
- **外国弁護士要件を無視**: USPTO で US ライセンス弁護士なしに出願する非 US 出願人は出願を拒否される — これは 2019 年以来のハードルール
- **マドリッド central attack エクスポージャー**: ベースマークへの 5 年依存を理解せずにマドリッド指定にのみ依存する。ベースマークが落ちると、指定もすべて一緒に落ちる
- **出願後監視なし**: 出願して忘れる。Office action と異議期限が過ぎ、出願が放棄される
- **登録前の商標ポリシー**: 少なくとも出願 pending なしに商標ポリシーを公開すると執行可能性を損なう。まず出願し、それからポリシーを起草する

## 関連スキル

- `screen-trademark` — この出願手順に先行しなければならないコンフリクトスクリーニング
- `assess-ip-landscape` — 商標ランドスケープマッピングを含むより広い IP ランドスケープ解析
- `search-prior-art` — 商標識別性研究に適用可能な先行技術調査方法論
