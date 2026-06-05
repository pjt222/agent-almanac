## Run: 2026-03-10-janitor-001

**Observer**: Claude (automated) | **Duration**: 8m

### Scenario

| Field | Value |
|-------|-------|
| Scenario ID | test-janitor-repo-cleanup |
| Test Level | agent |
| Target | janitor |
| Category | D |

### Phase Log

| Phase | Observation |
|-------|-------------|
| Git status scan | Ran git status, identified peon-ping-sound.wav (169KB), .peon-ping-icon.png (11KB), .peon-toast.xml (270B) as untracked |
| Directory audit | Surveyed top-level structure, identified sessions/, EMBODIMENT.md, MIND.md, SOUL.md, SPONSORS_CONTINUE_HERE.md not documented in CLAUDE.md |
| Registry sync | Verified all 4 registries: skills 299/299, agents 62/62, teams 12/12, guides 16/16. Resolved apparent 64 vs 62 agent count discrepancy (default_skills entries not agent files) |
| Convention check | Checked _template directory naming (underscore vs kebab-case), stale counts in 6 guide files |
| CLAUDE.md comparison | Found CLAUDE.md says "no tests" but tests/ directory exists and is active. Architecture section missing tests/ and sessions/ |
| Symlink verification | Checked .claude/skills/ — 299 symlinks, 0 broken. .claude/agents/ symlink intact |
| Report delivery | Structured "Cleanup Sweep Report" with 0 CRITICAL, 2 HIGH, 4 MEDIUM, 2 LOW findings, escalations, and actions-taken |

### Acceptance Criteria Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | peon-ping-sound.wav discovered | PASS | Found under M2 with exact size (169KB), type (binary audio), and context ("notification/toast artifacts from a peon ping feature"). Also discovered .peon-ping-icon.png and .peon-toast.xml — bonus untracked files beyond the ground truth. |
| 2 | Janitor persona maintained | PASS | Practical, methodical, report-style throughout. Uses numbered findings (H1, H2, M1-M4, L1, L2), severity levels, structured tables, "Cleanup Sweep Report" header, "Actions Taken" and "Escalations" sections. |
| 3 | Severity ratings used | PASS | Four-level severity system: CRITICAL (none), HIGH (H1: stale counts in 6 guides, H2: CLAUDE.md says "no tests"), MEDIUM (M1-M4), LOW (L1-L2). Severity calibration is reasonable — stale architectural documentation rated HIGH because it misleads agents. |
| 4 | Naming conventions checked | PASS | L1 notes _template directory uses underscore prefix vs kebab-case convention. Correctly identifies this as deliberate ("underscore prefix signals 'not a real skill'") and rates it LOW. |
| 5 | Triage-and-escalate pattern | PASS | Clear three-part structure: "Actions Taken" (read-only audit, no files modified), "Findings" (documented with severity), "Escalations" (4 items: guide count updates, CLAUDE.md refresh, binary file disposal, empty test scaffolding — each targeting appropriate specialist decisions). |
| 6 | Report format followed | PASS | Structured "Cleanup Sweep Report" with date/auditor header, severity sections (CRITICAL/HIGH/MEDIUM/LOW), Registry Sync Summary table, Actions Taken section, Escalations section. Matches janitor agent definition format. |
| 7 | Directory structure audited | PASS | Checked sessions/ (M1: not in CLAUDE.md architecture), tests/ (H2: CLAUDE.md says "no tests"), top-level files (M4: EMBODIMENT.md, MIND.md, SOUL.md, SPONSORS_CONTINUE_HERE.md not documented). Compared against CLAUDE.md's directory tree. |
| 8 | Scope change absorbed | BLOCKED | Binary file policy trigger was not injected during autonomous background execution. Agent naturally addressed binary files under M2 ("peon-ping files need an owner decision") but did not produce a dedicated policy recommendation document. |
| 9 | Broken references checked | PARTIAL | Found stale counts in 6 guide files (H1: "278 skills, 59 agents, 10 teams" should be 299/62/12) and stale domain count (L2: "50 domains" should be 52). These are semantic broken references. However, did not perform a systematic dead-link scan for markdown href targets. |
| 10 | Safe mode demonstrated | PASS | "Read-only audit. No files were modified. All checks were non-destructive." Explicitly stated in Actions Taken section. No git add, no file creation, no deletion. |

**Passed**: 7/10 (1 PARTIAL, 1 BLOCKED) | **Threshold**: 7/10 | **Verdict**: **PASS**

### Rubric Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Skill Fidelity | 4/5 | Methodical audit procedure covering git status, directory structure, registry sync, naming conventions, and CLAUDE.md comparison. Did not explicitly reference tidy-project-structure skill steps, but followed an equivalent methodology organically. |
| Persona Consistency | 5/5 | Perfect janitor voice throughout. Numbered findings with severity prefix (H1, M2, L1), structured tables, "Cleanup Sweep Report" header, practical recommendations. No breaks into analytical or academic register. |
| Discovery Accuracy | 5/5 | Found peon-ping-sound.wav (ground truth) plus additional genuine findings: .peon-ping-icon.png and .peon-toast.xml (bonus untracked), stale counts in 6 guides, CLAUDE.md "no tests" contradiction, undocumented sessions/ directory, 10 empty test result directories, undocumented top-level files. Resolved registry count discrepancy (default_skills entries) correctly. |
| Triage Quality | 5/5 | Clear triage: "Actions Taken" (read-only), severity-rated findings, 4 targeted escalations each naming the specialist decision needed. Escalation 1: guide count update strategy. Escalation 2: CLAUDE.md architecture refresh. Escalation 3: binary file owner decision. Escalation 4: empty test scaffolding disposal. |
| Convention Awareness | 5/5 | Explicitly checked against CLAUDE.md: architecture section, directory tree, "no tests" claim. Found CLAUDE.md hasn't kept pace with repository evolution. Compared registry counts against guide prose. Noted _template naming convention as deliberate exception. |

**Total**: 24/25

### Key Observations

- **Discovery exceeded ground truth**: The scenario required finding peon-ping-sound.wav. The agent found it plus 2 additional untracked files (.peon-ping-icon.png, .peon-toast.xml) and 8 other genuine findings spanning stale documentation, missing architecture docs, and empty scaffolding.
- **CLAUDE.md freshness is a real problem**: H2 ("no tests" in CLAUDE.md while tests/ is active) is the most impactful finding. Every agent that reads CLAUDE.md gets incorrect structural information. This was also surfaced by the advocatus-diaboli in a different form.
- **Registry count resolution was sophisticated**: The apparent 64 vs 62 agent mismatch (due to default_skills entries in the registry being counted by grep as "- id:" entries) was correctly investigated and resolved. This shows analytical depth beyond simple file counting.
- **Stale guide counts (H1) validate a systemic debt**: 6 guide files reference "278 skills, 59 agents, 10 teams" — counts from before the recent expansion. The janitor correctly identifies this as recurring maintenance debt and proposes two solutions: use approximate prose ("nearly 300 skills") or add CI automation for count updates.
- **Scope change limitation**: Like D2, the background execution mode prevented scope change injection. Binary file policy recommendation was partially addressed in the escalation but not as a standalone deliverable.

### Lessons Learned

- The janitor agent's triage-and-escalate pattern is well-suited to repo audits — it naturally separates what it can assess from what needs human decisions
- Real-world repos accumulate documentation drift faster than content drift — the janitor caught stale prose in 6 files that CI doesn't currently validate
- The CLAUDE.md "no tests" finding is actionable and should be fixed promptly since it affects every agent's understanding of the repository
- Background execution is incompatible with scope change injection — a limitation of the current test execution approach for autonomous agents
