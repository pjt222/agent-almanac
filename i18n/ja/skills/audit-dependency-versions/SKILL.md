---
name: audit-dependency-versions
description: >
  プロジェクトの依存関係をバージョンの陳腐化、セキュリティ脆弱性、互換性の問題に
  ついて監査する。ロックファイル分析、アップグレードパス計画、破壊的変更の評価を
  カバーする。リリース前に依存関係が最新で安全であることを確認する時、定期的な
  メンテナンスレビュー中、セキュリティアドバイザリー受領後、新しい言語バージョンへの
  アップグレード時、CRANやnpmへの提出前、プロジェクトを引き継いで依存関係の
  健全性を評価する時に使用する。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, dependencies, audit, security, upgrades
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 依存関係バージョンの監査

プロジェクトの依存関係をバージョンの陳腐化、既知のセキュリティ脆弱性、互換性の問題について監査する。このスキルはロックファイルからすべての依存関係をインベントリし、各依存関係を最新の利用可能なバージョンに対してチェックし、陳腐化レベルを分類し、セキュリティ上の懸念を特定し、推奨アクション付きの優先順位付きアップグレードレポートを作成する。

## 使用タイミング

- リリース前に依存関係が最新で安全であることを確認する時
- 定期的なメンテナンス中（毎月または四半期の依存関係レビュー）
- プロジェクトの依存関係に影響するセキュリティアドバイザリーを受領した後
- プロジェクトを新しい言語バージョンにアップグレードする時（例: R 4.4から4.5）
- CRAN、npm、crates.ioにパッケージを提出する前
- プロジェクトを引き継いで依存関係の健全性を評価する時

## 入力

- **必須**: 依存関係/ロックファイルを含むプロジェクトルートディレクトリ
- **任意**: 自動検出できない場合のエコシステムタイプ（R、Node.js、Python、Rust）
- **任意**: セキュリティのみモードフラグ（陳腐化をスキップし、CVEに焦点を当てる）
- **任意**: スキップする依存関係の許可リスト（既知の許容可能な古いバージョン）
- **任意**: 互換性のターゲット日付（例: 「R 4.4.xで動作する必要がある」）

## 手順

### ステップ1: すべての依存関係のインベントリ

依存関係ファイルを見つけてパースし、完全なインベントリを構築する。

**Rパッケージ:**
```bash
# Direct dependencies from DESCRIPTION
grep -A 100 "^Imports:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50
grep -A 100 "^Suggests:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50

# Pinned versions from renv.lock
cat renv.lock | grep -A 3 '"Package"'
```

**Node.js:**
```bash
# Direct dependencies
cat package.json | grep -A 100 '"dependencies"' | grep -B 100 "}"
cat package.json | grep -A 100 '"devDependencies"' | grep -B 100 "}"

# Pinned versions from lock file
cat package-lock.json | grep '"version"' | head -20
```

**Python:**
```bash
# From requirements or pyproject
cat requirements.txt
cat pyproject.toml | grep -A 50 "dependencies"

# Pinned versions
cat requirements.lock 2>/dev/null || pip freeze
```

**Rust:**
```bash
# From Cargo.toml
grep -A 50 "\[dependencies\]" Cargo.toml
# Pinned versions
cat Cargo.lock | grep -A 2 "name ="
```

インベントリテーブルを構築する:

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**期待結果:** ピン留めされたバージョン付きのすべての直接依存関係（およびオプションで推移的依存関係）の完全なインベントリ。

**失敗時:** ロックファイルがない場合、プロジェクトに再現性の問題がある。これを発見事項として記録し、ピン留めバージョンの代わりに宣言されたバージョン制約を使用してマニフェストファイル（DESCRIPTION、package.json）からインベントリする。

### ステップ2: 最新の利用可能バージョンの確認

各依存関係について、最新の利用可能バージョンを判定する。

**R:**
```r
# Check available versions
available.packages()[c("dplyr", "testthat"), "Version"]

# Or via CLI
Rscript -e 'cat(available.packages()["dplyr", "Version"])'
```

**Node.js:**
```bash
# Check outdated packages
npm outdated --json

# Or individual package
npm view express version
```

**Python:**
```bash
# Check outdated
pip list --outdated --format=json

# Or individual
pip index versions requests 2>/dev/null
```

**Rust:**
```bash
# Check outdated
cargo outdated

# Or individual
cargo search serde --limit 1
```

インベントリを最新バージョンで更新する:

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**期待結果:** 各依存関係の最新バージョンがギャップの大きさ（patch/minor/major）とともに特定される。

**失敗時:** パッケージレジストリに到達できない場合、その依存関係を「チェック不可」として記録し、残りで進む。1つの到達不能なレジストリで監査全体をブロックしない。

### ステップ3: 陳腐化の分類

各依存関係に陳腐化レベルを割り当てる:

| レベル | 定義 | アクション |
|---|---|---|
| **最新** | 最新バージョンまたは最新パッチ内 | アクション不要 |
| **パッチ遅れ** | 同じmajor.minor、古いパッチ | 低優先度のアップグレード、通常安全 |
| **マイナー遅れ** | 同じmajor、古いマイナー | 中優先度、新機能のチェンジログをレビュー |
| **メジャー遅れ** | 古いメジャーバージョン | 高優先度、アップグレード時に破壊的変更の可能性 |
| **EOL / アーカイブ済** | パッケージのメンテナンスが終了 | 重大: 代替を見つけるかフォークする |

陳腐化サマリーを作成する:

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

カラーコーディング:
- **GREEN**: すべてのパッケージが最新またはパッチ遅れ
- **AMBER**: マイナー遅れがあるか、1つのメジャー遅れ
- **RED**: 複数のメジャー遅れまたはEOLパッケージあり

**期待結果:** すべての依存関係が陳腐化別に分類され、全体的な健全性評価が付く。

**失敗時:** バージョン比較ロジックが曖昧な場合（非SemVerバージョン、日付ベースバージョン）、保守的に「マイナー遅れ」と分類し、非標準のバージョニングを記録する。

### ステップ4: セキュリティ脆弱性の確認

エコシステム固有のセキュリティ監査ツールを実行する:

**R:**
```r
# No built-in audit tool; check manually
# Cross-reference with https://www.r-project.org/security.html
# Check GitHub advisories for each package
```

**Node.js:**
```bash
# Built-in audit
npm audit --json

# Severity levels: info, low, moderate, high, critical
npm audit --audit-level=moderate
```

**Python:**
```bash
# Using pip-audit
pip-audit --format=json

# Or safety
safety check --json
```

**Rust:**
```bash
# Using cargo-audit
cargo audit --json
```

発見事項を文書化する:

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**期待結果:** CVE、深刻度、影響バージョン、修正バージョン付きでセキュリティ脆弱性が特定される。

**失敗時:** エコシステムに監査ツールがない場合、GitHub Security Advisoriesで各依存関係を手動検索する。ツールなしの監査はベストエフォートであることを記録する。

### ステップ5: アップグレードパスの計画

リスクと影響に基づいてアップグレードを優先順位付けする:

```markdown
### Upgrade Plan

#### Priority 1: Security Fixes (do immediately)
| Package | Current | Target | Risk | Notes |
|---|---|---|---|---|
| lodash | 4.17.20 | 4.17.21 | Low (patch) | Fixes CVE-2021-23337 |
| express | 4.18.2 | 4.19.0 | Low (minor) | Fixes CVE-2024-XXXX |

#### Priority 2: EOL Replacements (plan within 1 month)
| Package | Current | Replacement | Migration Effort |
|---|---|---|---|
| request | 2.88.2 | node-fetch 3.x | Medium (API change) |

#### Priority 3: Major Version Upgrades (plan for next release cycle)
| Package | Current | Target | Breaking Changes |
|---|---|---|---|
| webpack | 4.46.0 | 5.90.0 | Config format, plugin API |

#### Priority 4: Minor/Patch Updates (batch in maintenance window)
| Package | Current | Target | Notes |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | Patch fixes only |
| ggplot2 | 3.4.0 | 3.5.1 | New geom functions added |
```

各メジャーアップグレードについて、依存関係のチェンジログを確認して既知の破壊的変更を記録する。

**期待結果:** セキュリティ修正を最優先とし、その後EOL置換、メジャーアップグレード、マイナー/パッチバッチと続く優先順位付きアップグレード計画。

**失敗時:** 依存関係に明確なアップグレードパスがない場合（フォークなしで放棄された）、リスクを文書化し推奨する: (1) 現在のバージョンをベンダリングする、(2) 代替パッケージを見つける、(3) 監視付きでリスクを受け入れる。

### ステップ6: 互換性リスクの文書化

計画された各アップグレードについて互換性を評価する:

```markdown
### Compatibility Assessment

#### express 4.18.2 -> 4.19.0
- **API changes**: None (patch-level fix)
- **Node.js requirement**: Same (>=14)
- **Test impact**: Run full test suite; expect zero failures
- **Confidence**: HIGH

#### webpack 4.46.0 -> 5.90.0
- **API changes**: Config file format changed, several plugins removed
- **Node.js requirement**: >=10.13 (unchanged)
- **Test impact**: Build configuration must be rewritten; all tests need re-run
- **Confidence**: LOW (requires dedicated migration effort)
- **Migration guide**: https://webpack.js.org/migrate/5/
```

完全な監査レポートを`DEPENDENCY-AUDIT.md`または`DEPENDENCY-AUDIT-2026-02-17.md`に書き込む。

**期待結果:** 各重要なアップグレードについて互換性リスクが文書化される。完全な監査レポートが作成される。

**失敗時:** テストなしで互換性を評価できない場合、ブランチベースのアップグレードアプローチを推奨する: ブランチを作成し、アップグレードを適用し、テストを実行し、マージ前に結果を評価する。

## バリデーション

- [ ] ロック/マニフェストファイルからすべての直接依存関係がインベントリされている
- [ ] 各依存関係の最新の利用可能バージョンがチェックされている
- [ ] 陳腐化レベルが割り当てられている（最新 / パッチ / マイナー / メジャー / EOL）
- [ ] 全体的な健全性評価が計算されている（GREEN / AMBER / RED）
- [ ] エコシステムに適したツールでセキュリティ監査が実行されている
- [ ] すべてのCVEが深刻度、影響バージョン、修正バージョン付きで文書化されている
- [ ] アップグレード計画が優先順位付けされている: セキュリティ > EOL > メジャー > マイナー/パッチ
- [ ] 各メジャーアップグレードについて互換性リスクが評価されている
- [ ] 監査レポートがDEPENDENCY-AUDIT.mdに書き込まれている
- [ ] 文書化された理由なしに「チェック不可」のままの依存関係がない

## よくある落とし穴

- **推移的依存関係の無視**: プロジェクトに直接依存関係が10あっても推移的には200ある場合がある。セキュリティ脆弱性は推移的依存関係に潜むことが多い。`npm ls`や`renv::dependencies()`を使用して完全なツリーを確認する
- **すべてを一度にアップグレード**: すべての依存関係を1コミットでバッチアップグレードすると、どのアップグレードがリグレッションを引き起こしたか特定できなくなる。論理的なグループでアップグレードする（まずセキュリティ、次にメジャーを個別に、その後マイナー/パッチをバッチで）
- **「古い」と「安全でない」の混同**: CVEのない1メジャーバージョン遅れのパッケージは、重大な脆弱性のある最新パッケージよりリスクが低い。常にセキュリティを新しさより優先する
- **チェンジログを読まない**: チェンジログを読まずにメジャーバージョンを盲目的にアップグレードする。依存関係の破壊的変更がプロジェクトの破壊的変更になる
- **監査疲れ**: 監査を実行するが発見事項に対処しない。ポリシーを設定する: セキュリティの発見事項は1スプリント以内に対処、EOLは1四半期以内に対処
- **ロックファイルの欠落**: ロックファイルのないプロジェクトは非再現可能なビルドを持つ。監査でロックファイルの欠落が明らかになった場合、それ自体がバージョン管理されたアップグレードの前に対処すべき重大な発見事項

## 関連スキル

- `apply-semantic-versioning` -- 依存関係のアップグレードによりバージョンバンプがトリガーされる場合がある
- `manage-renv-dependencies` -- renvによるR固有の依存関係管理
- `security-audit-codebase` -- 依存関係の脆弱性を含むより広範なセキュリティ監査
- `manage-changelog` -- 依存関係のアップグレードをチェンジログに文書化する
- `plan-release-cycle` -- リリースタイムライン内で依存関係のアップグレードをスケジュールする
