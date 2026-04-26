---
name: review-pull-request
locale: wenyan-lite
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

# 評拉取請求

端對端評 GitHub 拉取請求——自理解變更至提交結構化回饋。所有 GitHub 互動皆用 `gh` CLI，並產附嚴重度等級之評審註解。

## 適用時機

- PR 已備評且分配予爾
- 作者處理回饋後之第二次評
- 請他人評之前自評之 PR（自評）
- 為合併後品質評稽核已合併之 PR
- 欲結構化評過程而非臨時掃描時

## 輸入

- **必要**：PR 識別符（編號、URL 或 `owner/repo#number`）
- **選擇性**：評焦（安全、效能、正確性、風格）
- **選擇性**：對代碼庫之熟悉度（熟、略熟、不熟）
- **選擇性**：評審時預算（速掃、標準、徹底）

## 步驟

### 步驟一：解上下文

讀 PR 描述並理解變更欲達何

1. 取 PR 元資料：
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. 讀 PR 標題與描述：
   - 此 PR 解何問題？
   - 作者取何法？
   - 作者欲評之特定處？
3. 檢 PR 大小並評所需時：

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

4. 評提交歷史：
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - 提交是否合邏輯且結構良好？
   - 歷史是否述事（每提交為一致之步）？
5. 檢 CI／CD 狀態：
   ```bash
   gh pr checks <number>
   ```
   - 所有檢查皆過否？
   - 若有失敗，記何者——此影響評審

**預期：** 對 PR 何作、為何存在、多大、CI 是否綠之清晰理解。此上下文塑評審法。

**失敗時：** 若 PR 描述為空或不清，記為首回饋。無上下文之 PR 為評審反模式。若 `gh` 命令失敗，驗已認證（`gh auth status`）並有倉庫權。

### 步驟二：析 diff

系統化讀實際代碼變更。

1. 取完整 diff：
   ```bash
   gh pr diff <number>
   ```
2. **小／中 PR**，順讀整 diff
3. **大 PR**，按提交評：
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. 對每變更文件，評：
   - **正確性**：代碼是否如 PR 所述？
   - **邊例**：邊界條件是否處理？
   - **錯誤處理**：錯被捉並適當處否？
   - **安全**：任何注入、認證或資料暴露之風險？
   - **效能**：明顯之 O(n^2) 迴圈、缺索引或記憶體問題？
   - **命名**：新變數／函數／類命名清否？
   - **測試**：新行為由測試覆蓋否？
5. 讀時記筆記，按嚴重度分類每觀察

**預期：** 對 diff 中每有意義之變更皆有覆蓋正確性、安全、效能、品質之觀察集。每觀察有嚴重度等級。

**失敗時：** 若 diff 過大難以有效評，標之：「此 PR 改 {N} 文件 {M} 行。建議拆為小 PR 以資更有效之評。」仍評最高風險之文件。

### 步驟三：分類回饋

將觀察組入嚴重度等級。

1. 分類每觀察：

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

2. 對每 Blocking 項，釋：
   - 何錯（具體問題）
   - 為何要緊（影響）
   - 如何修（具體建議）
3. 對每 Suggest 項，釋替代與其優處
4. Nit 宜短——一句即足
5. 若有正面之處宜含至少一 Praise

**預期：** 含明嚴重度等級之回饋項排序清單。Blocking 項有修復建議。比例宜：少 Blocking、些 Suggest、極少 Nit、至少一 Praise。

**失敗時：** 若一切似 blocking，PR 恐須重作而非補。考慮於 PR 層級請求變更而非逐行註解。若無錯，陳之——「LGTM」於代碼好時為有效回饋。

### 步驟四：撰評論註解

以結構化、可行之回饋作評。

1. 撰**評論摘要**（頂層註解）：
   - 一句：PR 何作（確認理解）
   - 整體評：核准、請求變更或註解
   - 關鍵項：列 Blocking 議題（若有）與頂 Suggest 項
   - 讚：道好處
2. 為具體代碼位置撰**行內註解**：
   ```bash
   # Post inline comments via gh API
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] This SQL query is vulnerable to injection. Use parameterized queries instead.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. 一致格式化回饋：
   - 每註解以嚴重度標籤起：`[B]`、`[S]`、`[N]` 或 `[P]`
   - 用 GitHub 建議塊作具體修
   - 風格／模式建議鏈接文件
4. 提交評：
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

**預期：** 已提交之評，附清晰可行之回饋。作者確知何修（Blocking）、何考慮（Suggest）、何處良（Praise）。

**失敗時：** 若 `gh pr review` 失敗，檢權限。需倉庫之寫權或為已請評者。若行內註解失敗，回退將所有回饋置於評論本體並附 file:line 引用。

### 步驟五：跟進

追評之解決。

1. 作者回應或推更新後：
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. 僅重評處理回饋之變更：
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. 核准前驗 Blocking 項已解
4. 議題處理時解註解串
5. 所有 Blocking 項已修時核准：
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

**預期：** Blocking 議題已驗為修。評對話已解。PR 已核准或請求進一步變更附餘剩特定項。

**失敗時：** 若作者不同意回饋，於 PR 串中議。聚焦於影響（為何要緊）而非權威。若於非 blocking 項上分歧持續，優雅讓步——作者擁有代碼。

## 驗證

- [ ] PR 上下文已解（目的、大小、CI 狀態）
- [ ] 所有變更文件已評（或 XL PR 之最高風險文件）
- [ ] 回饋按嚴重度分類（Blocking／Suggest／Nit／Praise）
- [ ] Blocking 項有具體修復建議
- [ ] 含至少一正面 Praise
- [ ] 評決定合回饋（無 Blocking 項時方核准）
- [ ] 行內註解引特定行附嚴重度標籤
- [ ] CI／CD 檢查已驗（核准前綠）
- [ ] 作者修訂後跟進已完成

## 常見陷阱

- **橡皮圖章**：未實讀 diff 即核准。每核准乃對品質之斷
- **Nit 雪崩**：以風格偏好淹作者。將 nit 留予指導場合；於時急之評中略之
- **見木不見林**：未解整體設計即逐行評。先讀 PR 描述與提交歷史
- **以風格 blocking**：格式與命名幾無 blocking。Blocking 留予錯、安全與資料完整
- **無讚**：僅指問題令人沮喪。良代碼當得認可
- **評審範圍蠕**：對 PR 中未變之代碼註解。若先存問題擾爾，另開議題

## 相關技能

- `review-software-architecture` — 系統層架構評（補 PR 層評）
- `security-audit-codebase` — 對含敏感安全變更之 PR 之深度安全分析
- `create-pull-request` — 過程之另面：建易評之 PR
- `commit-changes` — 潔淨之提交歷史使 PR 評顯著更易
