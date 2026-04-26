---
name: review-software-architecture
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review software architecture for coupling, cohesion, SOLID, API design,
  scalability, tech debt. System-level eval, ADR review, improvement recs.
  Use → eval proposed arch before impl, assess existing system for
  scalability/security, review ADRs, tech debt assess, eval readiness for
  significant scale-up.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: architecture, solid, coupling, cohesion, api-design, scalability, tech-debt, adr
---

# Review Software Architecture

Eval architecture at system level → quality attribs, design principles adherence, long-term maintainability.

## Use When

- Eval proposed architecture before impl begins
- Assess existing system → scalability, maintainability, security
- Review ADRs for project
- Tech debt assess
- Eval ready for significant scale-up or feature expansion
- Differentiate from line-level code review (PR-scoped)

## In

- **Required**: System codebase or arch docs (diagrams, ADRs, README)
- **Required**: Ctx about purpose, scale, constraints
- **Optional**: Non-functional req (latency, throughput, availability targets)
- **Optional**: Team size + skill composition
- **Optional**: Tech constraints/prefs
- **Optional**: Known pain points

## Do

### Step 1: Understand System Ctx

Map system boundaries + interfaces:

```markdown
## System Context
- **Name**: [System name]
- **Purpose**: [One-line description]
- **Users**: [Who uses it and how]
- **Scale**: [Requests/sec, data volume, user count]
- **Age**: [Years in production, major versions]
- **Team**: [Size, composition]

## External Dependencies
| Dependency | Type | Criticality | Notes |
|-----------|------|-------------|-------|
| PostgreSQL | Database | Critical | Primary data store |
| Redis | Cache | High | Session store + caching |
| Stripe | External API | Critical | Payment processing |
| S3 | Object storage | High | File uploads |
```

→ Clear picture of what system does + depends on.
If err: arch docs missing → derive ctx from code structure, configs, deployment.

### Step 2: Eval Structural Quality

#### Coupling Assessment
Examine how tightly modules depend:

- [ ] **Dep direction**: Flow one direction (layered) or circular?
- [ ] **Interface boundaries**: Modules connected via defined interfaces or direct impl refs?
- [ ] **Shared state**: Mutable state shared between modules?
- [ ] **DB coupling**: Multi services read/write same tables direct?
- [ ] **Temporal coupling**: Ops happen in specific order w/o explicit orchestration?

```bash
# Detect circular dependencies (JavaScript/TypeScript)
npx madge --circular src/

# Detect import patterns (Python)
# Look for deep cross-package imports
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### Cohesion Assessment
Eval whether each module has single, clear responsibility:

- [ ] **Module naming**: Name accurately describes what module does?
- [ ] **File size**: Files/classes excessively large (> 500 lines suggests multi responsibilities)?
- [ ] **Change frequency**: Unrelated features need changes to same module?
- [ ] **God objects**: Classes/modules everything depends on?

| Coupling Level | Description | Example |
|---------------|-------------|---------|
| Low (good) | Modules communicate through interfaces | Service A calls Service B's API |
| Medium | Modules share data structures | Shared DTO/model library |
| High (concern) | Modules reference each other's internals | Direct database access across modules |
| Pathological | Modules modify each other's internal state | Global mutable state |

→ Coupling + cohesion assessed w/ specific examples from codebase.
If err: codebase too large for manual review → sample 3-5 key modules + most-changed files.

### Step 3: Assess SOLID Principles

| Principle | Question | Red Flags |
|-----------|----------|-----------|
| **S**ingle Responsibility | Does each class/module have one reason to change? | Classes with >5 public methods on unrelated concerns |
| **O**pen/Closed | Can behavior be extended without modifying existing code? | Frequent modifications to core classes for each new feature |
| **L**iskov Substitution | Can subtypes replace their base types without breaking behavior? | Type checks (`instanceof`) scattered through consumer code |
| **I**nterface Segregation | Are interfaces focused and minimal? | "Fat" interfaces where consumers implement unused methods |
| **D**ependency Inversion | Do high-level modules depend on abstractions, not details? | Direct instantiation of infrastructure classes in business logic |

```markdown
## SOLID Assessment
| Principle | Status | Evidence | Impact |
|-----------|--------|----------|--------|
| SRP | Concern | UserService handles auth, profile, notifications, and billing | High — changes to billing risk breaking auth |
| OCP | Good | Plugin system for payment providers | Low |
| LSP | Good | No type-checking anti-patterns found | Low |
| ISP | Concern | IRepository has 15 methods, most implementors use 3-4 | Medium |
| DIP | Concern | Controllers directly instantiate database repositories | Medium |
```

→ Each principle assessed w/ ≥1 specific example.
If err: not all principles apply equally to every arch style. Note when principle less relevant (e.g. ISP matters less in functional codebases).

### Step 4: Review API Design

For systems exposing APIs (REST, GraphQL, gRPC):

- [ ] **Consistency**: Naming conventions, error formats, pagination patterns uniform
- [ ] **Versioning**: Strategy exists + applied (URL, header, content negotiation)
- [ ] **Error handling**: Responses structured, consistent, no leak internals
- [ ] **Authn/Authz**: Properly enforced at API layer
- [ ] **Rate limiting**: Protection vs abuse
- [ ] **Docs**: OpenAPI/Swagger, GraphQL schema, protobuf maintained
- [ ] **Idempotency**: Mutating ops (POST/PUT) handle retries safely

```markdown
## API Design Review
| Aspect | Status | Notes |
|--------|--------|-------|
| Naming consistency | Good | RESTful resource naming throughout |
| Versioning | Concern | No versioning strategy — breaking changes affect all clients |
| Error format | Good | RFC 7807 Problem Details used consistently |
| Auth | Good | JWT with role-based scopes |
| Rate limiting | Missing | No rate limiting on any endpoint |
| Documentation | Concern | OpenAPI spec exists but 6 months out of date |
```

→ API design reviewed vs common stds w/ specific findings.
If err: no API exposed → skip + focus internal module interfaces.

### Step 5: Eval Scalability + Reliability

- [ ] **Statelessness**: App can scale horizontal (no local state)?
- [ ] **DB scalability**: Queries indexed? Schema suitable for data volume?
- [ ] **Caching strategy**: Applied at appropriate layers (DB, app, CDN)?
- [ ] **Failure handling**: What happens when dep unavailable (circuit breaker, retry, fallback)?
- [ ] **Observability**: Logs, metrics, traces impl?
- [ ] **Data consistency**: Eventual acceptable or strong required?

→ Scalability + reliability assessed vs stated non-functional req.
If err: non-functional req undocumented → recommend defining as first step.

### Step 6: Tech Debt Assess

```markdown
## Technical Debt Inventory
| Item | Severity | Impact | Estimated Effort | Recommendation |
|------|----------|--------|-----------------|----------------|
| No database migrations | High | Schema changes are manual and error-prone | 1 sprint | Adopt Alembic/Flyway |
| Monolithic test suite | Medium | Tests take 45 min, developers skip them | 2 sprints | Split into unit/integration/e2e |
| Hardcoded config values | Medium | Environment-specific values in source code | 1 sprint | Extract to env vars/config service |
| No CI/CD pipeline | High | Manual deployment prone to errors | 1 sprint | Set up GitHub Actions |
```

→ Tech debt catalogued w/ severity, impact, effort estimates.
If err: debt inventory overwhelming → prioritize top 5 by impact/effort ratio.

### Step 7: Review ADRs

ADRs exist → eval:
- [ ] Decisions have clear ctx (what problem)
- [ ] Alternatives considered + documented
- [ ] Trade-offs explicit
- [ ] Decisions still current (not superseded w/o documentation)
- [ ] New significant decisions have ADRs

ADRs don't exist → recommend establishing for key decisions.

### Step 8: Write Review

```markdown
## Architecture Review Report

### Executive Summary
[2-3 sentences: overall health, key concerns, recommended actions]

### Strengths
1. [Specific architectural strength with evidence]
2. ...

### Concerns (by severity)

#### Critical
1. **[Title]**: [Description, impact, recommendation]

#### Major
1. **[Title]**: [Description, impact, recommendation]

#### Minor
1. **[Title]**: [Description, recommendation]

### Technical Debt Summary
[Top 5 debt items with prioritized recommendations]

### Recommended Next Steps
1. [Actionable recommendation with clear scope]
2. ...
```

→ Review report actionable w/ prioritized recs.
If err: time-boxed → clearly state what covered + what remains unassessed.

## Check

- [ ] System ctx documented (purpose, scale, deps, team)
- [ ] Coupling + cohesion assessed w/ specific code examples
- [ ] SOLID eval'd where applicable
- [ ] API design reviewed (if applicable)
- [ ] Scalability + reliability assessed vs req
- [ ] Tech debt catalogued + prioritized
- [ ] ADRs reviewed or absence noted
- [ ] Recs specific, prioritized, actionable

## Traps

- **Review code not architecture**: System-level design not line-level quality. Use `code-reviewer` for PR-level feedback.
- **Prescribe specific tech**: Arch reviews ID problems not mandate specific tools unless clear technical reason.
- **Ignore team ctx**: "Best" arch for 3-person team diff from 30-person. Consider organizational constraints.
- **Perfectionism**: Every system has tech debt. Focus on debt actively causing pain or blocking future work.
- **Assume scale**: Don't recommend distributed systems for app serving 100 users. Match arch to actual req.

## →

- `security-audit-codebase` — security-focused code + config review
- `configure-git-repository` — repo structure + conventions
- `design-serialization-schema` — data schema design + evolution
- `review-data-analysis` — review of analytical correctness (complementary perspective)
