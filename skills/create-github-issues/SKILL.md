---
name: create-github-issues
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

Structured GitHub issue creation from review findings or task breakdowns. Converts a list of findings (from `review-codebase`, `security-audit-codebase`, or manual analysis) into well-formed GitHub issues with labels, acceptance criteria, and cross-references.

## When to Use

- After a codebase review produces a findings table that needs tracking
- After a planning session identifies work items that should become issues
- When converting a TODO list or backlog into trackable GitHub issues
- When batch-creating related issues that need consistent formatting and labeling

## Inputs

- **Required**: `findings` — a list of items, each with at minimum a title and description. Ideally also includes: severity, affected files, and suggested labels
- **Optional**:
  - `group_by` — how to batch findings into issues: `severity`, `file`, `theme` (default: `theme`)
  - `label_prefix` — prefix for auto-created labels (default: none)
  - `create_labels` — whether to create missing labels (default: `true`)
  - `dry_run` — preview issues without creating them (default: `false`)

## Procedure

### Step 1: Prepare Labels

Ensure all needed labels exist in the repository.

1. List existing labels: `gh label list --limit 100`
2. Identify labels needed by the findings (from severity, phase, or explicit label fields)
3. Map severities to labels if not already mapped: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Map phases/themes to labels: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. If `create_labels` is true, create missing labels: `gh label create "name" --color "hex" --description "desc"`
6. Use consistent colors: red for critical/security, orange for high, yellow for medium, blue for architecture, green for testing

**Expected:** All labels referenced by findings exist in the repository. No duplicate labels created.

**On failure:** If `gh` CLI is not authenticated, instruct the user to run `gh auth login`. If label creation is denied (insufficient permissions), proceed without creating labels and note which labels are missing.

### Step 2: Group Findings

Batch related findings into logical issues to avoid issue sprawl.

1. If `group_by` is `theme`: group findings by their phase or category (all security findings → 1-2 issues, all a11y → 1 issue)
2. If `group_by` is `severity`: group findings by severity level (all CRITICAL → 1 issue, all HIGH → 1 issue)
3. If `group_by` is `file`: group findings by primary affected file
4. Within each group, order findings by severity (CRITICAL first)
5. If a group has more than 8 findings, split into sub-groups by sub-theme
6. Each group becomes one GitHub issue

**Expected:** A set of issue groups, each containing 1-8 related findings. The total number of issues should be manageable (typically 5-15 for a full codebase review).

**On failure:** If findings have no grouping metadata, fall back to one issue per finding. This is acceptable for small finding sets (< 10) but produces too many issues for larger sets.

### Step 3: Compose Issues

Build each issue using a standard template.

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
4. If findings reference specific files, mention them in the body (not as assignees)

**Expected:** Each issue has a clear title, numbered findings with severity badges, checkbox acceptance criteria, and appropriate labels.

**On failure:** If the body exceeds GitHub's issue size limit (65536 chars), split the issue into parts and cross-reference them.

### Step 4: Create Issues

Create the issues using `gh` CLI and report results.

1. If `dry_run` is true, print each issue title and body without creating, then stop
2. For each composed issue, create it:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. Record the URL of each created issue
4. After all issues are created, print a summary table: `#number | Title | Labels | Findings count`
5. If issues should be sequenced, add cross-references: edit the first issue to mention "Blocked by #X" or "See also #Y"

**Expected:** All issues created successfully. A summary table with issue numbers and URLs is printed.

**On failure:** If an individual issue fails to create, log the error and continue with remaining issues. Report failures at the end. Common failures: authentication expired, label not found (if `create_labels` was false), network timeout.

## Validation

- [ ] All findings are represented in at least one issue
- [ ] Each issue has at least one label
- [ ] Each issue has checkbox acceptance criteria
- [ ] No duplicate issues were created (check titles against existing open issues)
- [ ] Issue count is reasonable for the finding count (not 1:1 for large sets)
- [ ] Summary table was printed with all issue URLs

## Common Pitfalls

- **Issue sprawl**: Creating one issue per finding produces 20+ issues that are hard to manage. Group aggressively — 5-10 issues from a full review is ideal
- **Missing acceptance criteria**: Issues without checkboxes cannot be verified as complete. Every finding should map to at least one checkbox
- **Label chaos**: Creating too many labels makes filtering useless. Stick to severity + theme, not per-finding labels
- **Stale references**: If creating issues from an old review, verify findings still apply before creating issues. Code may have changed
- **Forgetting dry run**: For large finding sets, always preview with `dry_run: true` first. It is much easier to edit a plan than to close 15 incorrect issues

## Related Skills

- `review-codebase` — produces the findings table this skill consumes
- `review-pull-request` — produces PR-scoped findings that can also be converted to issues
- `manage-backlog` — organizes issues into sprints and priorities after creation
- `create-pull-request` — creates PRs that reference and close the issues
- `commit-changes` — commits the fixes that resolve the issues
