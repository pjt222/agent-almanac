---
name: review-pull-request
locale: wenyan-ultra
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

# 審 PR

GitHub PR 端至端審——自解變至投結構饋。用 `gh` CLI 為諸 GitHub 互、生重級審註。

## 用

- PR 備審且授汝
- 二審於作者處饋後
- 審己 PR 於請他審前（自審）
- 審合後 PR 為合後質估
- 欲結構審程而非臨掃時

## 入

- **必**：PR 識（號、URL、`owner/repo#number`）
- **可**：審注（安、效、正、格）
- **可**：庫熟級（熟、稍、生）
- **可**：審時預（速掃、標、徹）

## 行

### 一：解脈

讀 PR 述、解變所欲達。

1. 取 PR 屬：
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. 讀 PR 題與述：
   - 此 PR 解何問？
   - 作者所取何法？
   - 作者欲特審何域乎？
3. 察 PR 大估時需：

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

4. 審提交史：
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - 提交邏結構良乎？
   - 史敘故乎（各提交為連步）？
5. 察 CI/CD 態：
   ```bash
   gh pr checks <number>
   ```
   - 諸察過乎？
   - 察敗→記何敗——影審

得：明解 PR 為何、何由存、幾大、CI 綠乎。此脈塑審法。

敗：PR 述空或不明→記為首饋。無脈 PR 為審反模。`gh` 命敗→驗已認（`gh auth status`）並有庫達。

### 二：析 diff

系讀實碼變。

1. 取全 diff：
   ```bash
   gh pr diff <number>
   ```
2. 為**小/中 PR**、依序讀全 diff
3. 為**大 PR**、按提交審：
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. 各變檔、評：
   - **正**：碼為 PR 所述乎？
   - **邊例**：邊條件處乎？
   - **錯處**：錯捕處應乎？
   - **安**：注、認、數露險乎？
   - **效**：顯 O(n^2) 環、缺索、記患乎？
   - **命**：新變/函/類命明乎？
   - **測**：新為由測覆乎？
5. 讀時記、各察按重分

得：各意變含正、安、效、質察、含重級。

敗：diff 過大不能效審→標：「此 PR 變 {N} 檔 {M} 行。我薦分為小 PR 為效審。」仍審最高險檔。

### 三：分饋

組察入重級。

1. 各察分：

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

2. 各 Blocking、釋：
   - 何誤（特問）
   - 何要（影）
   - 如何修（具薦）
3. 各 Suggest、釋替與何故勝
4. Nit 簡——一句足
5. 至少一 Praise 若有正出

得：饋條按重級分序列。Blocking 含修薦。比應：少 Blocking、些 Suggest、最少 Nit、至少一 Praise。

敗：諸覺皆 Blocking→PR 或需重作非補。考於 PR 級請變、非行行註。無誤覺→述之——「LGTM」於碼良時為效饋。

### 四：書審註

組結構、可動饋審。

1. 書**審摘**（頂級註）：
   - 一句：PR 何為（確解）
   - 總估：准、請變、註
   - 關條：列 Blocking（若有）與首 Suggest 條
   - Praise：揭良工
2. 書**內聯註**為特碼處：
   ```bash
   # Post inline comments via gh API
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] This SQL query is vulnerable to injection. Use parameterized queries instead.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. 饋恆格：
   - 各註首為重標：`[B]`、`[S]`、`[N]`、`[P]`
   - 用 GitHub 薦塊為具修
   - 鏈文為格/模薦
4. 投審：
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

得：投審含明、可動饋。作者明知何修（Blocking）、何考（Suggest）、何良（Praise）。

敗：`gh pr review` 敗→察權。需庫寫權或為請審。內聯註敗→退置諸饋於審體含 file:line 引。

### 五：續

追審解。

1. 作者應或推更後：
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. 唯重審對饋之變：
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. 准前驗 Blocking 已解
4. 患處後解註串
5. 諸 Blocking 修則准：
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

得：Blocking 驗已修。審話解。PR 准或請更變含特餘條。

敗：作者異饋→於 PR 串議。注影（何要）非權。非 Blocking 條議續→雅讓——作者主碼。

## 驗

- [ ] PR 脈解（旨、大、CI 態）
- [ ] 諸變檔審（XL PR 審最高險檔）
- [ ] 饋按重分（Blocking/Suggest/Nit/Praise）
- [ ] Blocking 含具修薦
- [ ] 至少一 Praise 為正
- [ ] 審決合饋（無 Blocking 乃准）
- [ ] 內聯註引特行含重標
- [ ] CI/CD 察驗（准前綠）
- [ ] 作者改後續畢

## 忌

- **橡章**：未實讀 diff 而准。各准為質斷
- **Nit 雪**：以格偏淹作者。Nit 留導況；急審略之
- **失林**：行行審而不解總設。先讀 PR 述與提交史
- **格 Blocking**：格與命幾不為 Blocking。Blocking 留錯、安、數正
- **無 Praise**：唯指患沮人。良碼當揚
- **審範蔓**：註未變於 PR 之碼。前存患擾汝→別開問

## 參

- `review-software-architecture` — 系級構審（補 PR 級審）
- `security-audit-codebase` — 安變 PR 之深安析
- `create-pull-request` — 程他面：建易審 PR
- `commit-changes` — 潔提交史使 PR 審甚易
