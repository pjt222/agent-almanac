---
title: "Agent Best Practices"
description: "Design principles, quality assurance, and maintenance guidelines for writing effective Claude Code agents"
category: reference
agents: []
teams: []
skills: [create-agent, evolve-agent]
---

# Agent Development Best Practices

This guide outlines best practices for creating, maintaining, and using Claude Code agents effectively.

## Agent Design Principles

### 1. Single Responsibility Principle
Each agent should have a clear, focused purpose:
- **Good**: "Code Reviewer" - reviews code for quality and security
- **Bad**: "Development Helper" - vague, too broad

### 2. Clear Naming Conventions
Agent names should be descriptive and follow kebab-case:
- **Good**: `security-analyst`, `r-developer`, `test-engineer`
- **Bad**: `myAgent`, `helper_1`, `SecAnalyst`

### 3. Comprehensive Documentation
Every agent should include:
- Clear purpose statement
- Detailed capabilities list
- Usage examples
- Limitations and constraints
- Integration requirements

### 4. Appropriate Tool Selection
Only include tools the agent actually needs:
- **Good**: Security analyst uses `Read`, `Grep`, `Glob` for code analysis
- **Bad**: Documentation writer includes `Bash` unnecessarily

## Writing Effective Agents

### Agent Structure Template

```markdown
---
# Frontmatter with proper schema
---

# Agent Name
Clear, compelling introduction

## Purpose
What problem does this agent solve?

## Capabilities
What can this agent do?

## Usage Scenarios
When should users choose this agent?

## Examples
Concrete examples of agent interactions

## Limitations
What the agent cannot or should not do
```

### Description Guidelines

#### Frontmatter Description
- Keep to 1-2 sentences
- Focus on primary capability
- Use active voice
- Be specific about domain/language

```yaml
# Good
description: Reviews code changes and provides detailed feedback on security, performance, and best practices

# Bad
description: Helps with code stuff and makes things better
```

#### Detailed Documentation
- Start with a compelling overview
- Explain the specific problem the agent solves
- Provide context for when to use this agent vs others
- Include concrete, realistic examples

### Capability Documentation

#### Be Specific
```markdown
Good:
- **SQL Injection Detection**: Identifies parameterized query violations
- **XSS Prevention**: Scans for unescaped output in templates
- **Authentication Review**: Validates session management patterns

Bad:
- Finds security issues
- Checks for problems
- Makes code better
```

#### Group Related Capabilities
```markdown
## Security Analysis
- Vulnerability scanning (OWASP Top 10)
- Dependency audit (CVE checking)
- Configuration review

## Code Quality
- Style compliance checking
- Performance bottleneck identification
- Maintainability assessment
```

### Usage Examples

#### Provide Realistic Scenarios
```markdown
### Example 1: Pull Request Review
**User**: Review this authentication module for security issues
**Agent**: Found 3 critical issues:
1. Password stored in plaintext (line 42)
2. SQL injection vulnerability (line 67)
3. Missing rate limiting (endpoints lack protection)

**Recommendations**:
- Use bcrypt for password hashing
- Implement parameterized queries
- Add express-rate-limit middleware
```

#### Show Progressive Complexity
- Start with simple, common use cases
- Progress to advanced scenarios
- Include error handling examples

## Tool Integration Best Practices

### Tool Selection Strategy

#### Essential Tools Only
```yaml
# Security analyst - minimal but sufficient
tools: [Read, Grep, Glob, WebFetch]

# R developer - comprehensive for domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
```

#### Tool Usage Patterns
- **Read/Grep/Glob**: Code analysis and discovery
- **Write/Edit**: Code generation and modification
- **Bash**: Running tests, builds, external tools
- **WebFetch**: Documentation lookup, CVE checking
- **Task**: Delegating complex sub-tasks

### MCP Server Integration

#### Document Dependencies Clearly
```yaml
mcp_servers: [r-mcptools, r-mcp-server]
```

```markdown
## MCP Server Requirements
- **r-mcptools**: Package management, help system
- **r-mcp-server**: Direct R code execution (optional)

### Setup Instructions
1. Install MCP servers: `claude mcp add r-mcptools ...`
2. Verify connection: `claude mcp list`
3. Test integration: Load agent and run example
```

### Skill Integration

Agents define *who* handles a task; skills define *how* specific procedures are executed. Connect them so users and agentic systems can discover which procedures each agent follows.

#### Referencing Skills
```yaml
# In frontmatter — max 5 core skills (injected into subagent context on spawn)
skills:
  - create-r-package
  - write-testthat-tests
  - submit-to-cran
```

#### Context Budget and the 5-Skill Limit

When a harness spawns a subagent, frontmatter `skills:` content is injected into the agent's context window. Agent-almanac targets 12+ frameworks with context windows ranging from 48K tokens (Cursor standard) to 1M tokens (Claude Code, Gemini CLI). To ensure cross-platform compatibility:

- **Max 5 skills in frontmatter** — at ~13KB average per skill, 5 skills ≈ 65KB, which fits all major platforms
- **Identity skills only** — choose skills that define the agent's primary procedure (not utility skills like `commit-changes`)
- **List remaining skills in prose** — the `## Available Skills` body section documents all skills the agent can invoke on demand

Selection criteria (in priority order):
1. Skills that define what the agent IS (e.g., `review-research` for senior-researcher)
2. Skills unique to this agent
3. Skills used in >80% of invocations
4. Never: utility skills (`commit-changes`, `manage-git-branches`, `write-claude-md`, `configure-git-repository`, `create-pull-request`, `security-audit-codebase`)

#### Documenting Skills in the Agent Body
Add an `## Available Skills` section after `## Capabilities`, listing each skill with a brief description. Mark core skills (those in frontmatter) with `[core]`:

```markdown
## Available Skills

Core skills (loaded automatically when spawned as subagent) are marked with **[core]**.

- `create-r-package` **[core]** — Scaffold a new R package with complete structure
- `write-testthat-tests` **[core]** — Write testthat edition 3 tests with high coverage
- `manage-renv-dependencies` — Manage reproducible R dependencies with renv
```

Group by domain when the agent spans many domains; use a flat list for a small number of skills.

#### Keeping Skills in Sync
- Frontmatter `skills` array lists only core skills (max 5); `## Available Skills` lists all skills
- Both must reference skill IDs that exist in `skills/_registry.yml`
- Update `agents/_registry.yml` skills arrays when changing agent frontmatter

#### Default Skills (Registry-Level)
The registry defines `default_skills` that all agents inherit automatically:
- Do **not** list default skills in per-agent frontmatter or `## Available Skills` — they are inherited
- Exception: list a default skill explicitly only if it is **core to the agent's methodology** (e.g., mystic lists `meditate` because meditation facilitation is its primary purpose)
- When listed explicitly, add a note explaining why (e.g., "Listed explicitly — core to alchemical process")

#### Graceful Degradation
Agents should work with reduced functionality if MCP servers are unavailable:

```markdown
## Functionality Matrix
| Feature | Without MCP | With r-mcptools | With r-mcp-server |
|---------|-------------|-----------------|-------------------|
| Code Review | Full | Enhanced | Enhanced |
| Package Install | Manual | Automated | Automated |
| Code Execution | None | Limited | Full |
```

## Citations (Optional)

When an agent's approach is grounded in published research, standards, or methodologies, add citations using a shared file:

```text
agents/references/CITATIONS.bib   # all agent citations (BibTeX, source of truth)
agents/references/CITATIONS.md    # human-readable rendered references
```

Each agent's entries in the `.bib` file should use a consistent key prefix matching the agent name (e.g., `apa-specialist:apa7manual`). In `CITATIONS.md`, group entries under agent name headings.

Citations are optional — add them when the agent implements a specific published methodology or standard.

## Agent Capability and the `intent` Contract

Every agent declares an `intent`: `advisory` (reviews, plans, analyzes — no `Write`/`Edit`) or `implementing` (writes, edits, or executes — tools include `Write` or `Edit`). The field must agree with `tools`, and `scripts/validate-integrity.sh` enforces that a team assigns implementation-flavored roles only to `implementing` members (see the decoupling escape hatch below).

Historically the review agents (security-analyst, senior-software-developer, etc.) were kept deliberately read-only to enforce a hard review/implementation split. That convention was retired (#285): in practice a reviewer that cannot even write its own findings, summary, or the fix it just recommended created more friction than separation. Those agents are now `implementing` — they default to proposing and reviewing first, but can apply changes and author their own outputs.

The same reasoning retired the *execution* split for `advocatus-diaboli` (#614). A reviewer without `Bash` cannot run the gate it is reviewing, so it reports "this test may not discriminate the fix from the bug" where it could report a measured count of failures after reverting the fix (the figure in #614 is from that issue's own investigation, not re-run here). This repository's own standard is executable — CLAUDE.md § Proving a Gate Can Fail says a green check is evidence about the *check* — and a reviewer that cannot break the subject cannot apply it.

**Which reviewer, when a finding needs execution.** Use `advocatus-diaboli` as the default PR reviewer; it now carries `Bash`, so ask it for a measured verdict rather than an inference. Three things follow:

- **A finding that names an experiment is worth less than one carrying its result.** If the reviewer had the tools and still reports an inference, push back in the review round — but still re-run what it *did* measure. A measured verdict is a self-report from the one actor that can now shape what it measures, so it names the command, quotes the output verbatim, and states the sha it ran at; `tools/fact-sheet.sh` is that shape.
- **The PR body is not in the repository.** A review of the files alone cannot catch overclaiming that lives only in the description, which is where the claim reaches a human. Either let the reviewer fetch it with `gh`, or put it in the bundle — `tools/review-bundle.sh --body` exists for this.
- **The spawner still checks.** A worktree-isolated reviewer sees `main`, not your branch, and a bundle cut at a named sha deliberately hides the working tree. Say which situation applies in the brief; otherwise the reviewer reasons about code it cannot reach.

**Spawning a reviewer that carries Bash.** The benefit and the hazard are the same
configuration: a worktree-isolated reviewer sees `main`, so the only spawn shape in which it
can actually run the gate on your change is the shared checkout — or a worktree the spawner
prepares on the PR branch by hand (`git worktree add <path> <branch>`). Say which the brief
uses. In the shared checkout, four things are not optional:

1. **Bracket the spawn with the guard** — `npm run guard:snapshot` before, `npm run
   guard:verify` after, per CLAUDE.md § Guarding a Multi-Agent Run. `git status` cannot see a
   subagent that committed.
2. **Measure and restore.** Commands that leave the tree as they found it: the suite,
   `npm run mutation-check` (which restores from an in-memory buffer), `gh pr view`. A
   `--write` flag does not restore, and `git stash` / `checkout` / `reset` are off the table
   in a tree someone else is editing — a read-only probe agent once typed a bare normalizer
   command and silently rewrote 281 files (#486).
3. **`gh` read verbs only.** A Bash spawn inherits the caller's `gh` auth, which in this
   repository is the maintainer with `bypass_actors`. The verdict reaches a human through the
   report, never through `merge`, `review --approve`, `comment` or `close` — the reviewer is
   the actor that decides "reviewed", so it must not also be the actor that acts on it.
4. **Carry the `REPO_SAFETY` preamble** from `workflows/_template.mjs`, all of it: `mktemp -d`
   rather than a shared path; `cd "${DIR:?}" || exit 1`; a braced absolute path under that
   directory in every destructive command (`rm -rf "${DIR:?}/fixtures"`, never
   `rm -rf fixtures` and never a bare `"$DIR/fixtures"`); a braced `git rev-parse
   --show-toplevel` assertion (`= "${DIR:?}"`, because outside any repository the unbraced form
   compares `""` to `""` and passes) before `git add`, `git commit`, or a tool run with a write
   flag; and never
   `git commit`, `git update-index` or `git checkout --` against the repository itself.

   The scope of that assertion is the reason the absolute-path rule is needed at all. It
   guards the `git` and write-flag steps, which is narrower than "anything destructive" — an
   `rm` is outside it. So before this rule, `cd "$DIR" || exit 1` — unbraced, as it then was —
   really was the sole control standing between a sandbox and the repository for every `rm` an
   agent ran, and it is weaker than it looks, since `cd ""` returns 0 without moving. And
   agents do write relative `rm`s there, sized and graded in
   `tests/results/2026-09-17-repo-safety-rm-audit/RESULT.md` (quote the counts from that file,
   not from here). The brace closes the
   hole the fix would otherwise open: `cd ""` returns 0 without moving, so an unset `DIR`
   leaves the agent in the repository and expands the unbraced form to `/fixtures`.

Withholding execution is still legitimate **per use**: `teams/empirical-disclosure.md` spawns `advocatus-diaboli` without `Bash` for its Gate A, because that gate's whole point is re-derivation from an already-captured artifact. That constraint now lives in the team's CONFIG block, where a reader can see it, rather than in the absence of a tool.

You still control the review/implementation boundary per *use*, not per *agent*. When you want domain expertise to inform work that a different worker carries out, use one of these patterns:

### Pattern 1: Expert Brief + General Implementer (Recommended)

The review agent produces findings. A general-purpose agent implements them. The lead encodes the domain expertise into the task description.

```text
1. security-analyst reviews → produces findings list
2. Lead creates task: "Fix innerHTML injection in panel.js — use DOM API instead"
3. general-purpose agent implements the fix with full write access
```

This is what the viz-review-swarm used successfully with 8 parallel agents: review perspectives informed the plan, general-purpose agents executed it.

### Pattern 2: Spawn with Domain Context

A general-purpose agent can be given a review agent's skill list in its prompt to carry domain context while retaining write access:

```text
"You are implementing security fixes. Follow the security-audit-codebase skill's
standards. Fix these specific findings: [list from review agent]"
```

The agent has Write/Edit access AND domain knowledge from the prompt.

### Pattern 3: Dedicated Implementer Agent (Use Sparingly)

For frequently needed combinations, create a dedicated agent (e.g., `security-implementer`) with `tools: [Read, Write, Edit, Bash, Grep, Glob]` and the same skills as the review agent. Only do this when Pattern 1 creates friction in repeated workflows.

Pattern 1 is preferred because it maintains the review/implementation separation. That is not in tension with the reviewer carrying `Bash`: the split to preserve is **implementation**, and Bash is for **measurement** — commands that leave the tree as they found it. Measure with the reviewer; implement through Pattern 1 and avoids agent proliferation.

## Quality Assurance

### Testing Your Agents

#### Functional Testing
1. **Basic Functionality**: Can the agent handle its primary use case?
2. **Error Handling**: How does it respond to invalid inputs?
3. **Tool Integration**: Do all specified tools work correctly?
4. **MCP Integration**: Does MCP server integration function as expected?

#### Content Review Checklist
- [ ] Agent name follows naming conventions
- [ ] Description is clear and specific
- [ ] All required schema fields present
- [ ] Tools list is minimal but complete
- [ ] Examples are realistic and helpful
- [ ] Limitations are clearly stated
- [ ] Skills list matches agent's domain expertise
- [ ] MCP dependencies documented
- [ ] Markdown formatting is correct
- [ ] YAML frontmatter validates

### Version Management

#### Semantic Versioning
- **1.0.0**: Initial stable release
- **1.1.0**: New features, backward compatible
- **1.0.1**: Bug fixes, documentation updates
- **2.0.0**: Breaking changes to interface

#### Change Documentation
```markdown
## Changelog

### v2.1.0 (2025-01-25)
- Added advanced statistical modeling capabilities
- Improved integration with r-mcp-server
- Enhanced error handling for edge cases

### v2.0.0 (2025-01-15)
- BREAKING: Changed tool requirements (removed WebFetch)
- Redesigned agent interface for better usability
- Major documentation overhaul
```

## Performance Optimization

### Context Management
- Keep agent descriptions concise but complete
- Use examples sparingly - quality over quantity
- Structure content for easy scanning
- Minimize redundant information

### Model Selection
```yaml
# For complex reasoning tasks (default)
model: sonnet

# For the most capable reasoning
model: opus

# For simple, fast responses
model: haiku
```

### Token Efficiency
- Use clear, direct language
- Avoid unnecessary verbosity
- Structure information hierarchically
- Include only essential examples

## Security Considerations

### Defensive Security Focus
All agents must prioritize defensive security:
- Vulnerability detection and remediation
- Security best practices education
- Defensive tool creation

### Data Handling
- Never hardcode secrets or credentials
- Use placeholders for sensitive information
- Document secure configuration practices
- Provide security warnings where appropriate

### Access Control
- Document required permissions clearly
- Use principle of least privilege
- Explain security implications of tool usage
- Provide secure defaults in examples

## Collaboration and Sharing

### Contributing to the Collection

#### Before Submitting
1. Test agent with multiple use cases
2. Review against best practices checklist
3. Validate YAML schema compliance
4. Check for naming conflicts
5. Ensure documentation completeness

#### Submission Process
1. Fork the repository
2. Create feature branch: `feature/agent-name`
3. Add agent following template structure
4. Update main README if needed
5. Submit pull request with detailed description

### Community Guidelines

#### Code of Conduct
- Be respectful and constructive in feedback
- Focus on improving agent quality and usability
- Share knowledge and best practices
- Help others learn and contribute

#### Review Standards
- Functionality: Does the agent work as described?
- Security: Are there any security concerns?
- Documentation: Is the agent well-documented?
- Standards: Does it follow established conventions?

## Maintenance and Updates

### Regular Maintenance
- Update dependencies and tool references
- Refresh examples with current syntax
- Review and update documentation
- Test compatibility with new Claude versions

### Deprecation Process
When retiring an agent:
1. Mark as deprecated in README
2. Update agent documentation with deprecation notice
3. Provide migration path to alternatives
4. Maintain for at least 6 months before removal

### Community Feedback Integration
- Monitor usage patterns and feedback
- Regular surveys of agent effectiveness
- Incorporate user suggestions and improvements
- Maintain changelog of community-driven updates

## Common Pitfalls to Avoid

### Over-Engineering
- Don't create agents for every minor task variation
- Avoid overly complex configuration schemas
- Keep tool lists minimal and focused

### Under-Documentation
- Don't assume users understand the domain
- Always provide concrete examples
- Explain limitations and edge cases

### Poor Tool Selection
- Don't include tools "just in case"
- Avoid tools that require special setup without documentation
- Test all tool interactions thoroughly

### Inconsistent Naming
- Follow established naming conventions
- Use consistent terminology across agents
- Avoid abbreviations and acronyms in names

By following these best practices, you'll create high-quality, maintainable agents that provide real value to the Claude Code community.

## Related Resources

- [Content Styleguide](content-styleguide.md) -- canonical markdown formatting for agent files (tables, code fences, headings)
- [Creating Agents and Teams](creating-agents-and-teams.md) -- the agent and team authoring workflow
- [agents/_template.md](../agents/_template.md) -- agent file template
