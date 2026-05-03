---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, parsing the structured handoff, confirming the resumption plan
  with the user, and cleaning up after consumption. Optionally configures a
  SessionStart hook and CLAUDE.md instruction for automatic pickup. Use at the
  start of a session when a continuation file exists, when bootstrapping after
  an interrupted session, or when setting up automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
  locale: ja
  source_locale: en
  source_commit: 025eea68
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Read Continue Here

構造化された継続ファイルを読み、前セッションが残した場所から作業を再開する。

## 使用タイミング

- 新規セッション開始時、プロジェクトルートに CONTINUE_HERE.md が存在する
- SessionStart フックが継続文脈を注入した後
- アイデンティティのブートストラップと前セッション成果物の検出
- プロジェクトの自動継続検出のセットアップ（一回限りのインフラ）

## 入力

- **必須**: プロジェクトディレクトリ（既定はカレント作業ディレクトリ）
- **任意**: インフラ（SessionStart フック + CLAUDE.md 指示）を設定するか
- **任意**: 消費後にファイルを削除するか（既定: yes）

## 手順

### ステップ1: 継続ファイルを検出して読む

プロジェクトルートで `CONTINUE_HERE.md` を確認:

```bash
ls -la CONTINUE_HERE.md 2>/dev/null
```

不在なら、優雅に終了 — 継続するものがない。

存在するなら、ファイル内容を読む。5 セクションを解析: Objective、Completed、In Progress、Next Steps、Context。ヘッダ行からタイムスタンプとブランチを抽出する。

**期待結果：** ファイルが読まれ、そのセクションが前セッション状態の明確なメンタルモデルに解析される。

**失敗時：** ファイルが存在するが整形不良（セクション欠落、空）なら、部分信号として扱う — 存在するものを抽出し、欠落しているものをユーザーに記す。

### ステップ2: 鮮度を評価する

ファイルのタイムスタンプを現時刻と比較:

```bash
# File modification time
stat -c '%Y' CONTINUE_HERE.md 2>/dev/null || stat -f '%m' CONTINUE_HERE.md
# Current time
date +%s
```

鮮度を分類:
- **Fresh**（< 24 時間、同ブランチ）: 直接行動して安全
- **Stale**（> 24 時間または異ブランチ）: 進む前にユーザーにフラグ
- **Superseded**（引き渡しタイムスタンプ後に新コミットがある）: 引き渡し以来誰かがプロジェクトに作業した

ブランチ整合性を確認:

```bash
git branch --show-current
git log --oneline --since="$(stat -c '%Y' CONTINUE_HERE.md | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**期待結果：** 分類（fresh、stale、superseded）と支持証拠付きの鮮度評価。

**失敗時：** git リポジトリでなければ、ブランチとコミットチェックをスキップする。ファイルヘッダのタイムスタンプだけに依存する。

### ステップ3: 要約と再開を確認する

継続状態をユーザーに簡潔に提示:
- 「前セッション目的: [Objective]」
- 「完了: [概要]」
- 「進行中: [概要]」
- 「提案次行動: [Next Steps item 1]」

鮮度が "stale" または "superseded" なら、証拠を提示し引き渡しで進むか新たに始めるか尋ねる。

任意の Next Steps アイテムが `**[USER]**` でタグ付けされていれば、明示的に表面化する — 作業が進む前にユーザー決定を要求する。

**期待結果：** ユーザーが再開計画を、おそらく調整付きで確認する。エージェントは次に何をするかの明確なマンデートを持つ。

**失敗時：** ユーザーが「新たに始めて」または「そのファイルを無視して」と言えば、承認して継続文脈なしに進む。将来の混乱を防ぐためファイル削除を申し出る。

### ステップ4: 引き渡しに行動する

Next Steps item 1（またはユーザーが指示した場所）から作業を始める:
- 部分状態を理解するため In Progress アイテムを参照
- 失敗したアプローチのリトライを避けるため Context セクションを使う
- Completed アイテムを完了として扱う — ユーザーが尋ねない限り再検証しない

**期待結果：** エージェントが継続ファイルに情報を得て、正しいタスクに生産的に作業している。

**失敗時：** Next Steps が曖昧または In Progress 状態が不明確なら、推測ではなくユーザーに明確化を求める。

### ステップ5: クリーンアップ

引き渡しが消費され作業が進行中になったら、CONTINUE_HERE.md を削除:

```bash
rm CONTINUE_HERE.md
```

古い継続ファイルは将来のセッションで混乱を引き起こす。

**期待結果：** ファイルが削除される。プロジェクトルートはクリーン。

**失敗時：** ユーザーがファイルを保ちたい（例: セッション中の参照として）なら、残すが、次セッションがそれを再消費しないようセッション終了前に削除すべきと記す。

### ステップ6: SessionStart フックを設定（任意）

まだ設定されていなければ、セッション開始時の CONTINUE_HERE.md の自動読み取りを設定する。

フックスクリプトを作成:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/bin/bash
# SessionStart hook: inject CONTINUE_HERE.md into session context
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS)
set -uo pipefail

# --- Platform detection ---
detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}
PLATFORM=${PLATFORM:-$(detect_platform)}

CONTINUE_FILE="$PWD/CONTINUE_HERE.md"

if [ ! -f "$CONTINUE_FILE" ]; then
  exit 0
fi

# Strip CRLF (files on NTFS often have Windows line endings)
CONTENT=$(sed 's/\r$//' "$CONTINUE_FILE")

# JSON-escape: prefer jq, fall back to portable awk
if command -v jq >/dev/null 2>&1; then
  ESCAPED=$(printf '%s' "$CONTENT" | jq -Rsa .)
else
  ESCAPED=$(printf '%s' "$CONTENT" | awk '
    BEGIN { ORS=""; print "\"" }
    {
      gsub(/\\/, "\\\\")
      gsub(/"/, "\\\"")
      gsub(/\t/, "\\t")
      if (NR > 1) print "\\n"
      print
    }
    END { print "\"" }
  ')
fi

cat << EOF
{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":$ESCAPED}}}
EOF
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

`~/.claude/settings.json` の SessionStart hooks 配列に加える:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**期待結果：** フックスクリプトが存在し実行可能で、settings.json に登録されている。次のセッション開始時、CONTINUE_HERE.md が存在すればその内容がセッション文脈に注入される。

**失敗時：** 編集後 settings.json が有効 JSON か確認する。フックを手動でテスト: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。スクリプトは `jq` がインストールされていなければ `awk` にフォールバックするので、`jq` は推奨だが必須ではない。

### ステップ7: CLAUDE.md 指示を加える（任意）

Claude がファイルの目的を理解するようプロジェクトの CLAUDE.md に簡潔な指示を加える:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**期待結果：** CLAUDE.md が指示を含む。SessionStart フックが設定されていなくても、将来のセッションは CONTINUE_HERE.md を読み行動する。

**失敗時：** CLAUDE.md が存在しなければ、このセクションだけで作成する。ファイルが長すぎれば、切り詰められない上部近くに指示を加える。

## バリデーション

- [ ] CONTINUE_HERE.md が検出された（または不在が優雅に処理された）
- [ ] 鮮度が評価された（タイムスタンプ、ブランチ、引き渡し後コミット）
- [ ] 再開計画がユーザーに提示され確認された
- [ ] 作業が正しい Next Steps アイテムから始まった
- [ ] 消費後にファイルがクリーンアップされた
- [ ] (任意) SessionStart フックスクリプトが存在し実行可能
- [ ] (任意) CLAUDE.md がセッション継続性指示を含む

## よくある落とし穴

- **確認なしの行動**: 常にユーザーに再開計画を提示する。ファイルが新鮮でも、彼らが何に作業するかについて心を変えているかもしれない。
- **古いファイルを盲目的に信頼**: 24 時間より古いまたは異ブランチからの継続ファイルは提案であってマンデートではない。常に鮮度を確認する。
- **Context セクションを無視**: ファイルの最も価値ある部分はしばしば失敗したアプローチ。このセクションをスキップすると死路のリトライに繋がる。
- **クリーンアップを忘れる**: 消費後に CONTINUE_HERE.md を残すと次セッションが再びそれに行動しようとし混乱を引き起こす。
- **Completed アイテムを未検証として扱う**: ユーザーが特に求めない限り、完了作業をやり直さない。前セッションの評価を信頼する。

## 関連スキル

- `write-continue-here` — 補完: セッション終了時の継続ファイル書き込み
- `bootstrap-agent-identity` — 継続検出を一つのヒューリスティックとして含むフルアイデンティティ再構築
- `manage-memory` — 持続的なクロスセッション知識（このエフェメラルな引き渡しを補完）
- `write-claude-md` — 任意の継続性ガイダンスが住むプロジェクト指示
