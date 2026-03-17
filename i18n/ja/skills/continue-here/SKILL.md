---
name: continue-here
description: >
  新しい Claude Code セッションが現在のセッションの続きから作業を再開できるように、
  現在のセッション状態をキャプチャした CONTINUE_HERE.md ファイルを書く。
  最近の作業の評価、継続ファイルの構造化、および自動ピックアップのための SessionStart フックの
  オプション設定をカバーする。未完了の作業でセッションを終了する場合、セッション間でコンテキストを
  引き継ぐ場合、または git だけではキャプチャできないタスク状態を保持する場合に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: "2026-03-16"
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow
---

# Continue Here

次のセッションが完全なコンテキストで始まれるよう、構造化された継続ファイルを書く。

## 使用タイミング

- 作業がまだ進行中でセッションを終了する場合
- セッション間で複雑なタスクを引き継ぐ場合
- git がキャプチャできない意図、試みた失敗、次のステップを保持する場合
- タスクの途中で Claude Code を閉じる前

## 入力

- **必須**: 要約する最近の作業があるアクティブなセッション
- **任意**: ハンドオフで何を重点的に述べるかについての具体的な指示

## 手順

### ステップ1: セッション状態を評価する

最近の作業に関する事実を収集する：

```bash
git log --oneline -5
git status
git diff --stat
```

会話のコンテキストを確認する：目的は何か、何が完了したか、何が部分的に完了しているか、何を試みて失敗したか、どんな決定が下されたか。

**期待結果：** 現在のタスク状態の明確な理解 — 完了した項目、進行中の項目、計画された次のステップ。

**失敗時：** git リポジトリにない場合は git コマンドをスキップする。継続ファイルは会話のコンテキストとタスク状態をキャプチャできる。

### ステップ2: CONTINUE_HERE.md を書く

以下の構造を使用してプロジェクトルートにファイルを書く。すべてのセクションはプレースホルダーではなく実行可能なコンテンツを含む必要がある。

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

ガイドライン：
- **Objective**: WHY をキャプチャする — git log は何が変わったかを示すが、なぜかは示さない
- **Completed**: 再作業を防ぐために明確に完了した項目をマークする
- **In Progress**: これが最も価値の高いセクション — 部分的な状態は再構成が最も難しい
- **Next Steps**: 優先度でナンバリングする。ユーザー依存の項目には `**[USER]**` のプレフィックスを付ける
- **Context**: ネガティブスペースを記録する — 何を試みて却下されたか、なぜか

**期待結果：** プロジェクトルートに、現在のセッションからの実際のコンテンツで5つのセクションすべてが埋まった CONTINUE_HERE.md ファイル。タイムスタンプとブランチが正確。

**失敗時：** Write が失敗した場合、ファイルのパーミッションを確認する。ファイルはプロジェクトルート（`.git/` と同じディレクトリ）に作成されるべきだ。`.gitignore` に `CONTINUE_HERE.md` が含まれているか確認する — 含まれていない場合は追加する。

### ステップ3: ファイルを確認する

CONTINUE_HERE.md を読み返して確認する：
- タイムスタンプが現在（最後の数分以内）
- ブランチ名が `git branch --show-current` と一致する
- 5つのセクションすべてに実際のコンテンツが含まれている（テンプレートのプレースホルダーなし）
- Next Steps がナンバリングされていて実行可能
- In Progress の項目が再開するのに十分な詳細で現在の状態を説明している

**期待結果：** ファイルが、新しいセッションが即座に作業を再開するために使用できる明確で実行可能なハンドオフとして読める。

**失敗時：** プレースホルダーテキストが含まれているか曖昧すぎるセクションを編集する。各セクションはテスト「新しいセッションは確認の質問なしにこれに基づいて行動できるか？」をパスするべきだ。

### ステップ4: SessionStart フックを設定する（任意）

まだ設定されていない場合、セッション開始時に CONTINUE_HERE.md を自動的に読み込むように設定する。

フックスクリプトを作成する：

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

`~/.claude/settings.json` の SessionStart フックの配列に追加する：

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**期待結果：** フックスクリプトが存在し、実行可能で、settings.json に登録されている。次のセッション開始時に CONTINUE_HERE.md が存在すれば、その内容がセッションコンテキストに挿入される。

**失敗時：** 編集後に settings.json が有効な JSON であることを確認する。フックを手動でテストする：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。スクリプトは `jq` がインストールされていない場合 `awk` にフォールバックするため、`jq` は推奨されるが必須ではない。

### ステップ5: CLAUDE.md の指示を追加する（任意）

プロジェクトの CLAUDE.md にファイルの目的を伝える簡単な指示を追加する：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**期待結果：** CLAUDE.md に指示が含まれている。SessionStart フックが設定されていなくても、将来のセッションは CONTINUE_HERE.md を読んで処理する。

**失敗時：** CLAUDE.md が存在しない場合、このセクションだけで作成する。ファイルが長すぎる場合、切り捨てられない場所である上部付近に指示を追加する。

## バリデーション

- [ ] CONTINUE_HERE.md がプロジェクトルートに存在する
- [ ] ファイルに実際のコンテンツ（プレースホルダーなし）で5つのセクションすべてが含まれている
- [ ] タイムスタンプとブランチが正確
- [ ] `.gitignore` に `CONTINUE_HERE.md` が含まれている
- [ ] Next Steps がナンバリングされていて実行可能
- [ ] In Progress の項目が質問なしに再開するのに十分な詳細を指定している
- [ ] （任意）SessionStart フックスクリプトが存在し実行可能
- [ ] （任意）CLAUDE.md にセッション継続の指示が含まれている

## よくある落とし穴

- **コンテンツの代わりにプレースホルダーを書く**: 「TODO: 後で記入」では目的を果たせない。すべてのセクションには現在のセッションからの実際の情報が含まれていなければならない。
- **git の状態を重複させる**: 変更されたすべてのファイルをリストアップしない — git はすでにそれを追跡している。意図、部分的な状態、次のステップに集中する。
- **Context セクションを忘れる**: 失敗したアプローチは記録する最も価値のあることだ。これがなければ、次のセッションは同じ行き詰まりを再試行する。
- **読まずに上書きする**: CONTINUE_HERE.md が以前のセッションから既に存在する場合、最初に読む — 以前のハンドオフからの未完了の作業が含まれている可能性がある。
- **古いファイルを放置する**: CONTINUE_HERE.md は一時的なものだ。次のセッションがそれを消費した後、削除する。古いファイルは混乱を引き起こす。

## 関連スキル

- `bootstrap-agent-identity` — このスキルが生成する継続ファイルを消費するコールドスタートのアイデンティティ再構成
- `manage-memory` — 耐久性のあるクロスセッションの知識（この一時的なハンドオフを補完する）
- `commit-changes` — 継続ファイルを書く前に作業を git に保存する
- `write-claude-md` — オプションの継続ガイダンスが存在するプロジェクト指示
