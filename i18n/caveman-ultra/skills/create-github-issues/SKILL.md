---
name: create-github-issues
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Structured GitHub issue creation from review findings or task breakdowns.
  Groups related findings into logical issues, applies labels, and produces
  issues with standard templates including summary, findings, and acceptance
  criteria. Designed to consume output from review-codebase or similar review
  skills.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
---

# Create GitHub Issues

Findings → grouped GitHub issues w/ labels + acceptance criteria + cross-refs.

## Use When

- Codebase review → findings table → track
- Planning session → work items → issues
- TODO / backlog → trackable issues
- Batch-create related issues, consistent fmt

## In

- **Required**: `findings` — items w/ title + desc. Ideally: severity, files, labels
- **Optional**:
  - `group_by` — batch: `severity`, `file`, `theme` (def: `theme`)
  - `label_prefix` — auto-label prefix (def: none)
  - `create_labels` — create missing (def: `true`)
  - `dry_run` — preview no create (def: `false`)

## Do

### Step 1: Prep Labels

Needed labels exist in repo.

1. List: `gh label list --limit 100`
2. Identify labels from findings (severity, phase, label fields)
3. Severity map: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Phase/theme: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. `create_labels` = true → `gh label create "name" --color "hex" --description "desc"`
6. Colors: red=crit/sec, orange=high, yellow=med, blue=arch, green=test

**Got:** All label refs exist. No dup.

**If err:** `gh` not auth → `gh auth login`. Create denied → skip, note missing.

### Step 2: Group

Batch → logical issues, no sprawl.

1. `theme` → phase/category (sec → 1-2 issues, a11y → 1)
2. `severity` → level (CRIT → 1, HIGH → 1)
3. `file` → primary file
4. Within group: severity order (CRIT first)
5. >8 findings → split by sub-theme
6. Each group → 1 issue

**Got:** Groups w/ 1-8 findings each. Total: 5-15 for full review.

**If err:** No grouping metadata → 1 issue per finding (OK for <10, bad for larger).

### Step 3: Compose

Std template.

1. **Title**: `[Severity] Theme: Brief description` — `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **Body**:
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. Labels: severity + theme + custom
4. File refs → body mention (not assignee)

**Got:** Title + numbered findings + checkbox criteria + labels.

**If err:** Body > 65536 chars → split + cross-ref.

### Step 4: Create

Use `gh` CLI.

1. `dry_run` = true → print + stop
2. Create each:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. Record URLs
4. Summary table: `#number | Title | Labels | Findings count`
5. Sequence → edit first issue: "Blocked by #X" / "See also #Y"

**Got:** All created. Summary table w/ URLs.

**If err:** Individual fail → log + continue. Report end. Common: auth expired, label not found (`create_labels`=false), network timeout.

## Check

- [ ] All findings in ≥1 issue
- [ ] Each issue ≥1 label
- [ ] Each issue has checkbox criteria
- [ ] No dup (check titles vs open)
- [ ] Issue count reasonable (not 1:1 for large)
- [ ] Summary table printed w/ URLs

## Traps

- **Sprawl**: 1-per-finding → 20+ issues. Group aggressive → 5-10 ideal
- **Missing criteria**: No checkboxes → no verify. Every finding → ≥1 checkbox
- **Label chaos**: Too many → filter useless. Stick severity + theme
- **Stale refs**: Old review → verify findings still apply
- **No dry run**: Large sets → always `dry_run: true` first. Easier edit plan vs close 15 bad issues

## →

- `review-codebase` — findings source
- `review-pull-request` — PR findings → issues
- `manage-backlog` — sprints + priorities
- `create-pull-request` — PRs close issues
- `commit-changes` — fix commits
