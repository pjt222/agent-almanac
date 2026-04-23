---
name: create-github-issues
locale: caveman
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

Structured GitHub issue creation from review findings or task breakdowns. Converts list of findings (from `review-codebase`, `security-audit-codebase`, or manual analysis) into well-formed GitHub issues with labels, acceptance criteria, and cross-references.

## When Use

- After codebase review produces findings table needing tracking
- After planning session finds work items that should become issues
- When converting TODO list or backlog into trackable GitHub issues
- When batch-creating related issues needing consistent formatting and labeling

## Inputs

- **Required**: `findings` — list of items, each with at minimum title and description. Ideally also: severity, affected files, suggested labels
- **Optional**:
  - `group_by` — how to batch findings into issues: `severity`, `file`, `theme` (default: `theme`)
  - `label_prefix` — prefix for auto-created labels (default: none)
  - `create_labels` — whether to create missing labels (default: `true`)
  - `dry_run` — preview issues without creating them (default: `false`)

## Steps

### Step 1: Prepare Labels

Ensure all needed labels exist in repository.

1. List existing labels: `gh label list --limit 100`
2. Identify labels needed by findings (from severity, phase, or explicit label fields)
3. Map severities to labels if not mapped: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Map phases/themes to labels: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. If `create_labels` is true, create missing labels: `gh label create "name" --color "hex" --description "desc"`
6. Use consistent colors: red for critical/security, orange for high, yellow for medium, blue for architecture, green for testing

**Got:** All labels referenced by findings exist in repo. No duplicate labels created.

**If fail:** `gh` CLI not authenticated? Tell user to run `gh auth login`. Label creation denied (weak permissions)? Proceed without creating labels, note which labels missing.

### Step 2: Group Findings

Batch related findings into logical issues. Dodge issue sprawl.

1. `group_by` is `theme`? Group findings by phase or category (all security findings → 1-2 issues, all a11y → 1 issue)
2. `group_by` is `severity`? Group findings by severity level (all CRITICAL → 1 issue, all HIGH → 1 issue)
3. `group_by` is `file`? Group findings by primary affected file
4. Within each group, order findings by severity (CRITICAL first)
5. Group has more than 8 findings? Split into sub-groups by sub-theme
6. Each group becomes one GitHub issue

**Got:** Set of issue groups, each with 1-8 related findings. Total issue count manageable (typically 5-15 for full codebase review).

**If fail:** Findings have no grouping metadata? Fall back to one issue per finding. Fine for small sets (< 10). Too many issues for larger sets.

### Step 3: Compose Issues

Build each issue with standard template.

1. **Title**: `[Severity] Theme: Brief description` — e.g., `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **Body** structure:
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
3. Apply labels: severity label + theme label + any custom labels
4. Findings reference specific files? Mention them in body (not as assignees)

**Got:** Each issue has clear title, numbered findings with severity badges, checkbox acceptance criteria, right labels.

**If fail:** Body exceeds GitHub's issue size limit (65536 chars)? Split issue into parts and cross-reference.

### Step 4: Create Issues

Create issues with `gh` CLI. Report results.

1. `dry_run` is true? Print each issue title and body without creating. Stop.
2. For each composed issue, create it:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. Record URL of each created issue
4. After all issues created, print summary table: `#number | Title | Labels | Findings count`
5. Issues should be sequenced? Add cross-references: edit first issue to mention "Blocked by #X" or "See also #Y"

**Got:** All issues created fine. Summary table with issue numbers and URLs printed.

**If fail:** Individual issue fails to create? Log error, continue with remaining issues. Report failures at end. Common failures: authentication expired, label not found (if `create_labels` was false), network timeout.

## Checks

- [ ] All findings represented in at least one issue
- [ ] Each issue has at least one label
- [ ] Each issue has checkbox acceptance criteria
- [ ] No duplicate issues created (check titles against existing open issues)
- [ ] Issue count reasonable for finding count (not 1:1 for large sets)
- [ ] Summary table printed with all issue URLs

## Pitfalls

- **Issue sprawl**: One issue per finding → 20+ issues, hard to manage. Group aggressively — 5-10 issues from full review is ideal
- **Missing acceptance criteria**: Issues without checkboxes cannot be verified as complete. Every finding should map to at least one checkbox
- **Label chaos**: Too many labels → filtering useless. Stick to severity + theme, not per-finding labels
- **Stale references**: Creating issues from old review? Verify findings still apply before creating. Code may have changed
- **Forgetting dry run**: For large finding sets, always preview with `dry_run: true` first. Much easier to edit plan than close 15 bad issues

## See Also

- `review-codebase` — produces findings table this skill consumes
- `review-pull-request` — produces PR-scoped findings that can also convert to issues
- `manage-backlog` — organizes issues into sprints and priorities after creation
- `create-pull-request` — creates PRs that reference and close issues
- `commit-changes` — commits fixes resolving issues
