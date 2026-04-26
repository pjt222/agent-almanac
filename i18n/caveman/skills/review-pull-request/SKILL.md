---
name: review-pull-request
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review pull request end-to-end using GitHub CLI. Cover diff analysis,
  commit history review, CI/CD check verification, severity-leveled
  feedback (blocking/suggestion/nit/praise), gh pr review submission.
  Use when pull request assigned for review, performing self-review
  before requesting others' input, conducting second review after
  feedback addressed, or auditing a merged PR for post-merge quality
  assessment.
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

Review GitHub pull request end-to-end — from understand the change through submit structured feedback. Uses `gh` CLI for all GitHub interactions and produces severity-leveled review comments.

## When Use

- Pull request ready for review and assigned to you
- Performing second review after author addresses feedback
- Reviewing your own PR before requesting others' review (self-review)
- Auditing merged PR for post-merge quality assessment
- When you want structured review process rather than ad-hoc scanning

## Inputs

- **Required**: PR identifier (number, URL, or `owner/repo#number`)
- **Optional**: Review focus (security, performance, correctness, style)
- **Optional**: Codebase familiarity level (familiar, somewhat, unfamiliar)
- **Optional**: Time budget for review (quick scan, standard, thorough)

## Steps

### Step 1: Understand Context

Read PR description and understand what change is trying to accomplish.

1. Fetch PR metadata:
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. Read PR title and description:
   - What problem does this PR solve?
   - What approach did author take?
   - Are there any specific areas author wants reviewed?
3. Check PR size and assess time required:

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
   - Are commits logical and well-structured?
   - Does history tell a story (each commit a coherent step)?
5. Check CI/CD status:
   ```bash
   gh pr checks <number>
   ```
   - All checks passing?
   - Checks failing? Note which ones — affects review

**Got:** Clear understanding of what PR does, why exists, how big, whether CI green. This context shapes review approach.

**If fail:** PR description empty or unclear? Note this as first piece of feedback. PR without context = review antipattern. `gh` commands fail? Verify you authenticated (`gh auth status`) and have access to repository.

### Step 2: Analyze the Diff

Read actual code changes systematically.

1. Fetch full diff:
   ```bash
   gh pr diff <number>
   ```
2. For **small/medium PRs**, read entire diff sequentially
3. For **large PRs**, review by commit:
   ```bash
   gh pr diff <number> --patch  # full patch format
   ```
4. For each changed file, evaluate:
   - **Correctness**: Does code do what PR says it does?
   - **Edge cases**: Boundary conditions handled?
   - **Error handling**: Errors caught and handled appropriately?
   - **Security**: Any injection, auth, or data exposure risks?
   - **Performance**: Any obvious O(n^2) loops, missing indexes, or memory issues?
   - **Naming**: New variables/functions/classes named clearly?
   - **Tests**: New behaviors covered by tests?
5. Take notes as you read, classifying each observation by severity

**Got:** Set of observations covering correctness, security, performance, quality for every meaningful change in diff. Each observation has severity level.

**If fail:** Diff too large to review effectively? Flag it: "This PR changes {N} files and {M} lines. I recommend splitting it into smaller PRs for more effective review." Still review highest-risk files.

### Step 3: Classify Feedback

Organize observations into severity levels.

1. Classify each observation:

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

2. For each Blocking item, explain:
   - What's wrong (specific issue)
   - Why matters (the impact)
   - How to fix (concrete suggestion)
3. For each Suggest item, explain alternative and why it's better
4. Keep Nits brief — one sentence is enough
5. Include at least one Praise if anything positive stands out

**Got:** Sorted list of feedback items with clear severity levels. Blocking items have fix suggestions. Ratio should generally be: few Blocking, some Suggest, minimal Nit, at least one Praise.

**If fail:** Everything seems blocking? PR may need to be reworked rather than patched. Consider requesting changes at PR level rather than line-by-line comments. Nothing seems wrong? Say so — "LGTM" is valid feedback when code good.

### Step 4: Write Review Comments

Compose review with structured, actionable feedback.

1. Write **review summary** (top-level comment):
   - One sentence: what PR does (confirm understanding)
   - Overall assessment: approve, request changes, or comment
   - Key items: list Blocking issues (if any) and top Suggest items
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
3. Format feedback consistently:
   - Start each comment with severity tag: `[B]`, `[S]`, `[N]`, or `[P]`
   - Use GitHub suggestion blocks for concrete fixes
   - Link to documentation for style/pattern suggestions
4. Submit review:
   ```bash
   # Approve
   gh pr review <number> --approve --body "Review summary here"

   # Request changes (when blocking issues exist)
   gh pr review <number> --request-changes --body "Review summary here"

   # Comment only (when unsure or providing FYI feedback)
   gh pr review <number> --comment --body "Review summary here"
   ```

**Got:** Submitted review with clear, actionable feedback. Author knows exactly what to fix (Blocking), what to consider (Suggest), what went well (Praise).

**If fail:** `gh pr review` fails? Check permissions. You need write access to repo or to be requested reviewer. Inline comments fail? Fall back to putting all feedback in review body with file:line references.

### Step 5: Follow Up

Track review resolution.

1. After author responds or pushes updates:
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. Re-review only changes that address your feedback:
   ```bash
   gh pr diff <number>  # check new commits
   ```
3. Verify Blocking items resolved before approving
4. Resolve comment threads as issues are addressed
5. Approve when all Blocking items fixed:
   ```bash
   gh pr review <number> --approve --body "All blocking issues resolved. LGTM."
   ```

**Got:** Blocking issues verified as fixed. Review conversation resolved. PR approved or further changes requested with specific remaining items.

**If fail:** Author disagrees with feedback? Discuss in PR thread. Focus on impact (why matters) rather than authority. Disagreement persists on non-blocking items? Yield gracefully — author owns code.

## Checks

- [ ] PR context understood (purpose, size, CI status)
- [ ] All changed files reviewed (or highest-risk files for XL PRs)
- [ ] Feedback classified by severity (Blocking/Suggest/Nit/Praise)
- [ ] Blocking items have specific fix suggestions
- [ ] At least one Praise included for positive aspects
- [ ] Review decision matches feedback (approve only if no Blocking items)
- [ ] Inline comments reference specific lines with severity tags
- [ ] CI/CD checks verified (green before approval)
- [ ] Follow-up completed after author revisions

## Pitfalls

- **Rubber-stamp**: Approve without actually reading diff. Every approval = assertion of quality
- **Nit avalanche**: Drown author in style preferences. Save nits for mentoring situations; skip them in time-sensitive reviews
- **Miss the forest**: Review line-by-line without understand overall design. Read PR description and commit history first
- **Block on style**: Formatting and naming almost never blocking. Reserve Blocking for bugs, security, data integrity
- **No praise**: Only pointing out problems is demoralizing. Good code deserves recognition
- **Review scope creep**: Comment on code not changed in PR. Pre-existing issues bother you? File separate issue

## See Also

- `review-software-architecture` — System-level architecture review (complementary to PR-level review)
- `security-audit-codebase` — Deep security analysis for PRs with security-sensitive changes
- `create-pull-request` — Other side of process: creating PRs easy to review
- `commit-changes` — Clean commit history makes PR review significantly easier
