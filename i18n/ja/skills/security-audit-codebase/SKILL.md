---
name: security-audit-codebase
description: >
  コードベースのセキュリティ監査を実施し、露出したシークレット、脆弱な依存関係、
  インジェクション脆弱性、安全でない設定、OWASP Top 10の問題を検査する。
  プロジェクトの公開・デプロイ前、定期的なセキュリティレビュー、認証やAPI
  連携の追加後、プライベートリポジトリのオープンソース化前、セキュリティ
  コンプライアンス監査の準備時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: security, audit, owasp, secrets, vulnerability
  locale: ja
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# コードベースのセキュリティ監査

コードベースの体系的なセキュリティレビューを実施し、脆弱性と露出したシークレットを特定する。

## 使用タイミング

- プロジェクトの公開またはデプロイ前
- 既存プロジェクトの定期的なセキュリティレビュー
- 認証、API連携、またはユーザー入力処理の追加後
- プライベートリポジトリのオープンソース化前
- セキュリティコンプライアンス監査の準備

## 入力

- **必須**: 監査対象のコードベース
- **任意**: 特定の焦点領域（シークレット、依存関係、インジェクション、認証）
- **任意**: コンプライアンスフレームワーク（OWASP、ISO 27001、SOC 2）
- **任意**: 比較のための過去の監査所見

## 手順

### ステップ1: 露出したシークレットをスキャンする

ハードコードされたシークレットを示すパターンを検索する:

```bash
# APIキーとトークン
grep -rn "sk-\|ghp_\|gho_\|github_pat_\|hf_\|AKIA" --include="*.{md,js,ts,py,R,json,yml,yaml}" .

# 一般的なシークレットパターン
grep -rn "password\s*=\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "api[_-]key\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "secret\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .

# 接続文字列
grep -rn "postgresql://\|mysql://\|mongodb://" .

# 秘密鍵
grep -rn "BEGIN.*PRIVATE KEY" .
```

**期待結果:** 実際のシークレットは見つからない -- `YOUR_TOKEN_HERE` や `your.email@example.com` のようなプレースホルダーのみ。

**失敗時:** 実際のシークレットが見つかった場合、ただちに削除し、露出した認証情報をローテーションし、`git filter-branch` または `git-filter-repo` でgit履歴をクリーンにする。露出したシークレットは漏洩したものとして扱う。

### ステップ2: .gitignoreのカバレッジを確認する

機密ファイルが除外されていることを検証する:

```bash
# これらがgit-ignoreされていることを確認
git check-ignore .env .Renviron credentials.json node_modules/

# 追跡されている機密ファイルを探す
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**期待結果:** すべての機密ファイル（`.env`、`.Renviron`、`credentials.json`）が `.gitignore` に含まれ、`git ls-files` が追跡中の機密ファイルを返さない。

**失敗時:** 機密ファイルが追跡されている場合、`git rm --cached <file>` で追跡を解除し、`.gitignore` に追加してコミットする。ファイルはディスク上に残るが、バージョン管理の対象外になる。

### ステップ3: 依存関係を監査する

**Node.js**:

```bash
npm audit
npx audit-ci --moderate
```

**Python**:

```bash
pip-audit
safety check
```

**R**:

```r
# パッケージの既知の脆弱性を確認
# 組み込みツールはないが、パッケージソースを検証
renv::status()
```

**期待結果:** 依存関係に高・重大な脆弱性がない。中・低の脆弱性はレビュー用に文書化されている。

**失敗時:** 重大な脆弱性が見つかった場合、`npm audit fix` や `pip install --upgrade` で影響を受けるパッケージをただちに更新する。更新が破壊的変更をもたらす場合、脆弱性を文書化し修正計画を作成する。

### ステップ4: インジェクション脆弱性を確認する

**SQLインジェクション**:

```bash
# クエリ内の文字列連結を探す
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

すべてのデータベースクエリは文字列連結ではなくパラメータ化クエリを使用すべきである。

**コマンドインジェクション**:

```bash
# ユーザー入力を伴うシェル実行を探す
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS（クロスサイトスクリプティング）**:

```bash
# HTML内のエスケープされていないユーザーコンテンツを探す
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**期待結果:** SQL、コマンド、XSSのインジェクションベクターが見つからない。すべてのデータベースクエリがパラメータ化されたステートメントを使用し、シェルコマンドがユーザー制御の入力を避け、HTML出力が適切にエスケープされている。

**失敗時:** インジェクション脆弱性が見つかった場合、クエリ内の文字列連結をパラメータ化クエリに置き換え、シェル実行前にユーザー入力をサニタイズまたはエスケープし、`innerHTML` や `dangerouslySetInnerHTML` の代わりにフレームワーク安全なレンダリング方法を使用する。

### ステップ5: 認証と認可をレビューする

チェックリスト:
- [ ] パスワードがbcrypt/argon2でハッシュされている（MD5/SHA1ではない）
- [ ] セッショントークンがランダムで十分な長さを持つ
- [ ] 認証トークンに有効期限がある
- [ ] APIエンドポイントが認可を確認している
- [ ] CORSが制限的に設定されている
- [ ] 状態変更操作にCSRF保護が有効になっている

**期待結果:** すべてのチェックリスト項目がパスする: パスワードが強力なハッシュを使用し、トークンがランダムで有効期限付き、エンドポイントが認可を強制し、CORSが制限的で、CSRF保護がアクティブ。

**失敗時:** 重大度に基づいて修正の優先度を付ける: 弱いパスワードハッシュと認可の欠如は重大、CORSとCSRFの問題は高。すべての所見を重大度レベルとともに文書化する。

### ステップ6: 設定のセキュリティを確認する

```bash
# 本番設定でのデバッグモード
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# 許容的なCORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTPSではなくHTTP
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**期待結果:** 本番設定でデバッグモードが無効、CORSが本番でワイルドカードオリジンを使用していない、すべての外部URLがHTTPSを使用している。

**失敗時:** 本番設定でデバッグモードが有効な場合はただちに無効にする。ワイルドカードCORSオリジンを明示的な許可ドメインに置き換える。エンドポイントがサポートしている場合は `http://` URLを `https://` に更新する。

### ステップ7: 所見を文書化する

監査レポートを作成する:

```markdown
# Security Audit Report

**Date**: YYYY-MM-DD
**Auditor**: [Name]
**Scope**: [Repository/Project]
**Status**: [PASS/FAIL/CONDITIONAL]

## Findings Summary

| Category | Status | Details |
|----------|--------|---------|
| Exposed secrets | PASS | No secrets found |
| .gitignore | PASS | Sensitive files excluded |
| Dependencies | WARN | 2 moderate vulnerabilities |
| Injection | PASS | Parameterized queries used |
| Auth/AuthZ | N/A | No authentication in scope |
| Configuration | PASS | Debug mode disabled |

## Detailed Findings

### Finding 1: [Title]
- **Severity**: Low / Medium / High / Critical
- **Location**: `path/to/file:line`
- **Description**: What was found
- **Recommendation**: How to fix
- **Status**: Open / Resolved

## Recommendations
1. Update dependencies to fix moderate vulnerabilities
2. [Additional recommendations]
```

**期待結果:** プロジェクトルートに完全な `SECURITY_AUDIT_REPORT.md` が保存され、所見が重大度別に分類され、それぞれに具体的な場所、説明、推奨事項が含まれている。

**失敗時:** 個別に文書化するには所見が多すぎる場合、カテゴリ別にグループ化し、重大/高の所見を優先する。結果に関わらずベースラインを確立するためにレポートを生成する。

## バリデーション

- [ ] ソースコードにハードコードされたシークレットがない
- [ ] .gitignoreがすべての機密ファイルをカバーしている
- [ ] 高/重大な依存関係の脆弱性がない
- [ ] インジェクション脆弱性がない
- [ ] 認証が適切に実装されている（該当する場合）
- [ ] 監査レポートが完成し所見に対処済みである

## よくある落とし穴

- **現在のファイルのみの確認**: git履歴のシークレットは依然として露出している。`git log -p --all -S 'secret_pattern'` で確認する。
- **開発依存関係の無視**: 開発用の依存関係でもサプライチェーンリスクをもたらしうる。
- **`.gitignore` による誤った安心感**: `.gitignore` は将来の追跡を防ぐのみ。既にコミット済みのファイルには `git rm --cached` が必要。
- **設定ファイルの見落とし**: `docker-compose.yml`、CI設定、デプロイスクリプトにはシークレットが含まれていることが多い。
- **漏洩した認証情報のローテーション忘れ**: シークレットを発見・削除するだけでは不十分。認証情報は無効化して再生成する必要がある。

## 関連スキル

- `configure-git-repository` - 適切な.gitignoreの設定
- `write-claude-md` - セキュリティ要件の文書化
- `setup-gxp-r-project` - 規制環境におけるセキュリティ
