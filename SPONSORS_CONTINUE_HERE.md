# GitHub Sponsors — Manual Steps

These steps require the GitHub web UI and cannot be automated via CLI.

## 1. Update Sponsors Dashboard

Go to https://github.com/sponsors/pjt222/dashboard

### Short Description

```
Building structured knowledge infrastructure for AI-human collaboration — currently 295 skills, 62 agents, 12 teams following the agentskills.io open standard.
```

### Full Description (Introduction)

```markdown
I'm Philipp — a data scientist, chemist, and open-source developer building tools that make AI coding assistants more reliable.

## What I Build

**[Agent Almanac](https://github.com/pjt222/agent-almanac)** is currently the largest open-source skills library following the [agentskills.io](https://agentskills.io) specification — 295 structured procedures across 52 domains, from R package development to security auditing to spectroscopic analysis. Each skill encodes not just the happy path but the failure modes: what to do when renv hangs on WSL, when pkgdown 404s after deployment, when a git credential expires mid-session.

The library also includes 62 agent personas (from `r-developer` to `security-analyst` to `contemplative`) and 12 team compositions that coordinate multiple agents on complex tasks.

**[putior](https://github.com/pjt222/putior)** is an R package (on CRAN) for annotation-driven workflow visualization — add comments to your source code, get Mermaid diagrams automatically.

## Why This Matters

Your AI coding assistant is only as good as the procedures it can follow. General-purpose models are powerful but inconsistent on domain-specific workflows. Structured skills with explicit recovery paths turn inconsistent AI assistance into reliable AI assistance.

The agentskills.io standard gives AI procedures a distribution format — the same shift that npm gave to JavaScript code. Agent Almanac is the largest open implementation of that standard, testing whether structured skill libraries can make AI systems genuinely more reliable across domains.

I also maintain skills that treat the AI's own operational state as worth tending — `heal` for detecting reasoning drift, `meditate` for clearing context noise, `rest` for intentional non-production. These exist because the relationship between humans and AI tools should be reciprocal, not purely extractive.

## What Sponsorship Enables

- Maintaining registry sync, CI validation, and the standard implementation across 295+ skills
- Expanding into new domains with the same depth of failure-mode coverage
- Contributing generalized templates upstream to the agentskills.io specification
- Keeping everything free and open source

## On the Pricing

Every tier price is prime. The sequence is anchored by Mersenne primes — primes of the form 2^p - 1, the numbers that appear in primality testing, perfect number theory, and the history of the largest known primes. The primes of computation, for a project that serves computation.
```

## 2. Create Tiers

Create these in the GitHub Sponsors dashboard (https://github.com/sponsors/pjt222/dashboard/tiers):

| Monthly Price | Name | Description |
|-------------|------|-------------|
| **$7**/mo | **Practitioner** | 2^3 - 1, a Mersenne prime. You use AI coding tools and want them to work better. Your sponsorship keeps the skills library maintained and the CI pipeline green. |
| **$17**/mo | **Architect** | 2^4 + 1, a Fermat prime. You build software seriously and care about the difference between "AI assistance" and "reliable AI assistance." Supports domain expansion and meta-skill tooling. Name in README sponsors section. |
| **$31**/mo | **Systems Thinker** | 2^5 - 1, a Mersenne prime. You understand that structured procedural knowledge is infrastructure. Supports team compositions, spec engagement, and interoperability work. Early access to skill drafts and design rationale. |
| **$107**/mo | **Keeper of the Almanac** | A prime twinned with 109. You're sustaining the long game: a maintained, growing, open-standard library that any compliant agent system can use. Named acknowledgment, input on domain priorities, early access to new agents and teams. |

### One-Time Tier

| Price | Name | Description |
|-------|------|-------------|
| **$127**+ | **Custom** | 2^7 - 1, the fourth Mersenne prime. One-time support at any amount above $127. |

## 3. Set Goal

In the dashboard, set a **sponsor count** goal (not dollar amount):

> **10 sponsors — publish a public roadmap for the next 10 domain expansions**

## Verification Checklist

- [ ] Short description updated
- [ ] Full description/introduction updated
- [ ] 4 monthly tiers created ($7, $17, $31, $107)
- [ ] 1 one-time tier created ($127+)
- [ ] Goal set (10 sponsors)
- [ ] "Sponsor" button visible on agent-almanac repo page
- [ ] "Sponsor" button visible on putior repo page
- [ ] Profile README shows sponsor badge
- [ ] agent-almanac README shows sponsor badge + support section
- [ ] putior README shows sponsor badge

After completing all items, delete this file:
```bash
rm SPONSORS_CONTINUE_HERE.md
```
