---
name: review-pull-request
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review a pull request end-to-end using GitHub CLI. Covers diff analysis,
  commit history review, CI/CD check verification, severity-leveled feedback
  (blocking/suggestion/nit/praise), and gh pr review submission. Use when a
  pull request is assigned for review, performing a self-review before
  requesting others' input, conducting a second review after feedback is
  addressed, or auditing a merged PR for post-merge quality assessment.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, pull-request, github, code-review, gh-cli, feedback, pr
---

# 審拉請

由 GitHub CLI 全程審拉請——自解變至遞構之反。用 `gh` CLI 行諸 GitHub 之動，生重之等審注。

## 用時

- PR 備審且授汝乃用
- 著者處反後行二審乃用
- 請他審前自審己之 PR 乃用
- 為合後質察審已合之 PR 乃用
- 欲構之審程而非臨之掃乃用

## 入

- **必要**：PR 之識（號、URL、或 `owner/repo#number`）
- **可選**：審之專（安、性、正、格）
- **可選**：碼庫之熟（熟、稍、生）
- **可選**：審之時算（速掃、標、深）

## 法

### 第一步：解其境

讀 PR 之述而解此變欲成何。

1. 取 PR 之屬：
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. 讀 PR 之題與述：
   - 此 PR 解何患？
   - 著者用何徑？
   - 著者欲審何特區乎？
3. 察 PR 之大而估所需之時：

```
PR Size Guide:
+--------+-----------+---------+-------------------------------------+
| Size   | Files     | Lines   | Review Approach                     |
+--------+-----------+---------+-------------------------------------+
| Small  | 1-5       | <100    | Read every line, quick review       |
| Medium | 5-15      | 100-500 | Focus on logic changes, skim config |
| Large  | 15-30     | 500-    | Review by commit, focus on critical  |
|        |           | 1000    | files, flag if should be split       |
| XL     | 30+       | 1000+   | Flag for splitting. Review only the  |
|        |           |         | most critical files.                 |
+--------+-----------+---------+-------------------------------------+
```

4. 審提交之史：
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - 提交為邏且善構乎？
   - 史敘故乎（各提交為合之步）？
5. 察 CI/CD 之狀：
   ```bash
   gh pr checks <number>
   ```
   - 諸察皆過乎？
   - 若察敗，記其敗者——影審之徑

得：明解 PR 為何、為何存、何大、CI 綠乎。此境形審之徑。

敗則：若 PR 述空或不清，標此為首反。無境之 PR 為審之反形。若 `gh` 命敗，驗已認證（`gh auth status`）且有庫之訪。

### 第二步：析其差

系讀實之碼變。

1. 取全差：
   ```bash
   gh pr diff <number>
   ```
2. 為**小/中之 PR**，序讀全差
3. 為**大 PR**，依提交審：
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. 各變文評：
   - **正**：碼行 PR 所述乎？
   - **邊例**：界處乎？
   - **誤處**：誤捕與宜處乎？
   - **安**：注入、認、數露之險乎？
   - **性**：明 O(n^2) 環、缺索、存患乎？
   - **命**：新變/函/類命清乎？
   - **試**：新行為試覆乎？
5. 讀時記之，依重分各察

得：諸有意變之察集，覆正、安、性、質。各察有重等。

敗則：若差過大不能效審，標之：「此 PR 變 {N} 文 {M} 行。吾議分為小 PR 以效審。」仍審最險之文。

### 第三步：分反

組諸察為重之等。

1. 各察分之：

```
Feedback Severity Levels:
+-----------+------+----------------------------------------------------+
| Level     | Icon | Description                                        |
+-----------+------+----------------------------------------------------+
| Blocking  | [B]  | Must fix before merge. Bugs, security issues,      |
|           |      | data loss risks, broken functionality.             |
| Suggest   | [S]  | Should fix, but won't block merge. Better           |
|           |      | approaches, missing edge cases, style issues that   |
|           |      | affect maintainability.                            |
| Nit       | [N]  | Optional improvement. Style preferences, minor      |
|           |      | naming suggestions, formatting.                    |
| Praise    | [P]  | Good work worth calling out. Clever solutions,      |
|           |      | thorough testing, clean abstractions.              |
+-----------+------+----------------------------------------------------+
```

2. 各 Blocking 之入釋：
   - 何誤（具體之患）
   - 何要（其影）
   - 如何修（具體議）
3. 各 Suggest 之入釋替與何以勝
4. Nit 簡——一句即足
5. 若有陽事，至少一 Praise

得：排序之反列附明重等。Blocking 之入有修議。比常宜為：少 Blocking、某 Suggest、微 Nit、至少一 Praise。

敗則：若皆似 Blocking，PR 或宜重作而非補。考於 PR 等請變而非行行注。若無事似誤，述之——「LGTM」乃碼善時之效反。

### 第四步：書審注

撰附構、可行反之審。

1. 書**審摘**（頂注）：
   - 一句：PR 行何（確解）
   - 整評：批准、請變、或注
   - 要入：列 Blocking 患（若有）與首 Suggest
   - Praise：標善勞
2. 書**行注**於具體碼所：
   ```bash
   # Post inline comments via gh API
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] This SQL query is vulnerable to injection. Use parameterized queries instead.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. 反式恆：
   - 各注始以重標：`[B]`、`[S]`、`[N]`、`[P]`
   - 用 GitHub 之議塊行具修
   - 鏈至文檔以行格/形之議
4. 遞其審：
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

得：已遞之審附明、可行之反。著者明知何修（Blocking）、何慮（Suggest）、何善（Praise）。

敗則：若 `gh pr review` 敗，察權。汝需庫之書權或為所請審者。若行注敗，退以諸反置於審體附 file:line 引。

### 第五步：續

追審之解。

1. 著者應或推更後：
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. 獨再審處汝反之變：
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. 批准前驗 Blocking 之入已解
4. 患解時解其注串
5. Blocking 入皆修後批准：
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

得：Blocking 患驗為修。審談已解。PR 已批准或續請變附具餘入。

敗則：若著者異反，於 PR 串議之。專於影（何要）而非權。若異於非阻入，優雅讓——著者擁其碼。

## 驗

- [ ] PR 境已解（用、大、CI 狀）
- [ ] 諸變文已審（或 XL PR 之最險文）
- [ ] 反依重分（Blocking/Suggest/Nit/Praise）
- [ ] Blocking 入有具修議
- [ ] 至少一 Praise 為陽面
- [ ] 審決合反（獨無 Blocking 入時批准）
- [ ] 行注引具行附重標
- [ ] CI/CD 察已驗（綠後批准）
- [ ] 著者改後續已畢

## 陷

- **橡章**：未實讀差而批准。各批准乃質之斷
- **Nit 之雪崩**：以格之喜淹著者。Nit 留為教境；緊審時略之
- **失林**：行行審而不解整設。先讀 PR 述與提交史
- **格之 Blocking**：式與命幾不為 Blocking。Blocking 留為訛、安、數整
- **無 Praise**：獨指患令意沮。善碼宜認
- **審範漂**：注 PR 未變之碼。若先存患擾汝，立別問題

## 參

- `review-software-architecture` — 系等構審（補 PR 等審）
- `security-audit-codebase` — 為安敏變 PR 行深安析
- `create-pull-request` — 程之他面：立易審之 PR
- `commit-changes` — 淨之提交史使 PR 審甚易
