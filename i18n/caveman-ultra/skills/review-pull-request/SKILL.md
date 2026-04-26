---
name: review-pull-request
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review PR end-to-end using GH CLI. Diff analysis, commit history review,
  CI/CD check verify, severity-leveled feedback (blocking/suggestion/nit/
  praise), gh pr review submission. Use → PR assigned for review, self-review
  before req others, second review after feedback addressed, audit merged PR
  for post-merge quality.
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

# Review Pull Request

Review GH PR end-to-end — understand change → submit structured feedback. Uses `gh` CLI for all GH interactions + produces severity-leveled review comments.

## Use When

- PR ready for review + assigned to you
- Second review after author addresses feedback
- Self-review before req others
- Audit merged PR for post-merge quality
- Want structured review process not ad-hoc scanning

## In

- **Required**: PR id (number, URL, `owner/repo#number`)
- **Optional**: Review focus (security, perf, correctness, style)
- **Optional**: Codebase familiarity (familiar, somewhat, unfamiliar)
- **Optional**: Time budget (quick scan, std, thorough)

## Do

### Step 1: Understand Ctx

Read PR description + understand what change accomplishes.

1. Fetch PR metadata:
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. Read title + description:
   - What problem does PR solve?
   - What approach did author take?
   - Specific areas author wants reviewed?
3. Check PR size + assess time req:

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

4. Review commit history:
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - Commits logical + well-structured?
   - History tells story (each commit coherent step)?
5. Check CI/CD status:
   ```bash
   gh pr checks <number>
   ```
   - All checks passing?
   - If failing, note which → affects review

→ Clear understanding of what PR does, why exists, how big, CI green. Ctx shapes review approach.

If err: PR description empty/unclear → note as first feedback. PR w/o ctx = review antipattern. `gh` cmds fail → verify auth (`gh auth status`) + repo access.

### Step 2: Analyze Diff

Read actual code changes systematically.

1. Fetch full diff:
   ```bash
   gh pr diff <number>
   ```
2. **Small/medium PRs**: read entire diff sequential
3. **Large PRs**: review by commit:
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. Each changed file eval:
   - **Correctness**: Code does what PR says?
   - **Edge cases**: Boundary conditions handled?
   - **Error handling**: Caught + handled appropriately?
   - **Security**: Injection, auth, data exposure risks?
   - **Perf**: Obvious O(n^2), missing indexes, mem issues?
   - **Naming**: New vars/fns/classes named clearly?
   - **Tests**: New behaviors covered by tests?
5. Take notes as read, classifying each by severity

→ Set of obs covering correctness, security, perf, quality for every meaningful change. Each obs has severity.

If err: diff too large to review effectively → flag: "This PR changes {N} files and {M} lines. I recommend splitting it into smaller PRs for more effective review." Still review highest-risk files.

### Step 3: Classify Feedback

Organize obs into severity levels.

1. Classify each obs:

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

2. Each Blocking explain:
   - What's wrong (specific issue)
   - Why matters (impact)
   - How to fix (concrete suggestion)
3. Each Suggest explain alternative + why better
4. Keep Nits brief — one sentence enough
5. Include ≥1 Praise if anything positive stands out

→ Sorted feedback list w/ clear severity. Blocking has fix suggestions. Ratio: few Blocking, some Suggest, minimal Nit, ≥1 Praise.

If err: everything seems blocking → PR may need rework not patch. Consider req changes at PR level vs line-by-line. Nothing wrong → say so — "LGTM" valid when code good.

### Step 4: Write Comments

Compose review w/ structured actionable feedback.

1. Write **review summary** (top-level):
   - One sentence: what PR does (confirm understanding)
   - Overall: approve, req changes, comment
   - Key items: list Blocking (if any) + top Suggest
   - Praise: call out good work
2. Write **inline comments** for specific code locations:
   ```bash
   # Post inline comments via gh API
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] This SQL query is vulnerable to injection. Use parameterized queries instead.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. Format feedback consistent:
   - Start each comment w/ severity tag: `[B]`, `[S]`, `[N]`, `[P]`
   - Use GH suggestion blocks for concrete fixes
   - Link to docs for style/pattern suggestions
4. Submit review:
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

→ Submitted review w/ clear actionable feedback. Author knows exactly what to fix (Blocking), consider (Suggest), what went well (Praise).

If err: `gh pr review` fails → check perms. Need write access or be requested reviewer. Inline comments fail → fall back to all feedback in review body w/ file:line refs.

### Step 5: Follow Up

Track resolution.

1. After author responds or pushes updates:
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. Re-review only changes addressing feedback:
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. Verify Blocking resolved before approving
4. Resolve comment threads as issues addressed
5. Approve when all Blocking fixed:
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

→ Blocking verified fixed. Conversation resolved. PR approved or further changes req'd w/ specific remaining items.

If err: author disagrees → discuss in PR thread. Focus on impact (why matters) not authority. Disagreement persists on non-blocking → yield gracefully. Author owns code.

## Check

- [ ] PR ctx understood (purpose, size, CI status)
- [ ] All changed files reviewed (or highest-risk for XL PRs)
- [ ] Feedback classified by severity (Blocking/Suggest/Nit/Praise)
- [ ] Blocking has specific fix suggestions
- [ ] ≥1 Praise for positive aspects
- [ ] Review decision matches feedback (approve only if no Blocking)
- [ ] Inline comments ref specific lines w/ severity tags
- [ ] CI/CD checks verified (green before approval)
- [ ] Follow-up done after author revisions

## Traps

- **Rubber-stamping**: Approving w/o reading diff. Every approval = assertion of quality.
- **Nit avalanche**: Drowning author in style prefs. Save nits for mentoring; skip in time-sensitive reviews.
- **Miss forest**: Reviewing line-by-line w/o understanding overall design. Read description + commit history first.
- **Block on style**: Formatting + naming almost never blocking. Reserve Blocking for bugs, security, data integrity.
- **No praise**: Only pointing problems = demoralizing. Good code deserves recognition.
- **Scope creep**: Commenting on code not changed in PR. Pre-existing issues → file separate issue.

## →

- `review-software-architecture` — system-level architecture review (complementary)
- `security-audit-codebase` — deep security analysis for security-sensitive PRs
- `create-pull-request` — other side: creating PRs easy to review
- `commit-changes` — clean commit history makes PR review easier
