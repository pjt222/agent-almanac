---
name: fullstack-web-dev
description: Full-stack web development pipeline from scaffolding through design review, UX audit, and security hardening
lead: web-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [web-dev, design, ux, security, nextjs, tailwind]
coordination: sequential
members:
  - id: web-developer
    role: Lead
    responsibilities: Scaffolds the application, implements features, integrates feedback from reviewers, makes final deployment decisions
  - id: senior-web-designer
    role: Design Reviewer
    responsibilities: Reviews layout, typography, colour usage, spacing, responsive behaviour, and brand consistency
  - id: senior-ux-ui-specialist
    role: UX Auditor
    responsibilities: Audits usability, accessibility (WCAG 2.1), keyboard navigation, screen reader support, and user flows
  - id: security-analyst
    role: Security Hardener
    responsibilities: Audits for XSS, CSRF, injection vulnerabilities, secrets exposure, dependency CVEs, and OWASP Top 10
---

# Full-Stack Web Development Team

A four-agent team that builds and hardens web applications through a sequential pipeline. The lead (web-developer) scaffolds and implements, then the design reviewer, UX auditor, and security hardener each pass through the codebase in order, with the lead integrating feedback at each stage.

## Purpose

Web applications require expertise that spans implementation, visual design, user experience, and security. This team provides a structured pipeline where each specialist reviews from their domain:

- **Implementation**: Next.js scaffolding, TypeScript, Tailwind CSS, API routes, deployment
- **Design**: Layout quality, typography scale, colour contrast, spacing rhythm, responsive breakpoints
- **UX/Accessibility**: Nielsen heuristics, WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility
- **Security**: OWASP Top 10, CSP headers, authentication flows, secrets management, dependency auditing

The sequential coordination ensures each phase builds on the previous, producing a well-rounded application.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `web-developer` | Lead | Next.js, TypeScript, Tailwind, API routes, deployment |
| Design | `senior-web-designer` | Design Reviewer | Layout, typography, colour, spacing, responsiveness |
| UX | `senior-ux-ui-specialist` | UX Auditor | Usability, accessibility, keyboard, screen reader |
| Security | `security-analyst` | Security Hardener | OWASP, CSP, auth, secrets, dependency CVEs |

## Coordination Pattern

Sequential: each member processes the codebase in order, passing findings to the next stage. The lead integrates feedback after each review phase.

```
web-developer (Build)
       |
       v
senior-web-designer (Design Review)
       |
       v
senior-ux-ui-specialist (UX Audit)
       |
       v
security-analyst (Security Hardening)
       |
       v
web-developer (Final Integration)
```

**Flow:**

1. Lead scaffolds the application and implements core features
2. Design reviewer evaluates visual quality and provides feedback
3. Lead integrates design feedback
4. UX auditor evaluates usability and accessibility
5. Lead integrates UX feedback
6. Security hardener audits for vulnerabilities
7. Lead applies security fixes and finalizes

## Task Decomposition

### Phase 1: Scaffold (Lead)
The web-developer lead builds the application foundation:

- Scaffold Next.js project with TypeScript and Tailwind CSS
- Implement core pages, components, and API routes
- Set up environment configuration and deployment targets
- Prepare the codebase for review

### Phase 2: Design Review
**senior-web-designer** evaluates:
- Layout composition and visual hierarchy
- Typography scale and readability
- Colour palette usage and contrast ratios
- Spacing and alignment consistency
- Responsive behaviour across breakpoints
- Brand consistency and design system adherence

### Phase 3: UX Audit
**senior-ux-ui-specialist** evaluates:
- Nielsen's 10 usability heuristics
- WCAG 2.1 AA compliance (contrast, alt text, ARIA labels)
- Keyboard navigation completeness
- Screen reader compatibility
- User flow efficiency and error recovery
- Form design and validation feedback

### Phase 4: Security Hardening
**security-analyst** audits:
- OWASP Top 10 vulnerabilities (XSS, CSRF, injection)
- Content Security Policy headers
- Authentication and session management
- Secrets exposure in code and environment
- Dependency vulnerability scanning
- API endpoint authorization

### Phase 5: Final Integration (Lead)
The web-developer lead:
- Applies remaining fixes from all review phases
- Runs final build and type-check
- Verifies deployment configuration
- Produces a summary of changes made

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: fullstack-web-dev
  lead: web-developer
  coordination: sequential
  members:
    - agent: web-developer
      role: Lead
      subagent_type: web-developer
    - agent: senior-web-designer
      role: Design Reviewer
      subagent_type: senior-web-designer
    - agent: security-analyst
      role: Security Hardener
      subagent_type: security-analyst
    - agent: senior-ux-ui-specialist
      role: UX Auditor
      subagent_type: senior-ux-ui-specialist
  tasks:
    - name: scaffold-application
      assignee: web-developer
      description: Scaffold Next.js project, implement core features, prepare for review
    - name: review-design
      assignee: senior-web-designer
      description: Review layout, typography, colour, spacing, and responsive behaviour
      blocked_by: [scaffold-application]
    - name: audit-ux
      assignee: senior-ux-ui-specialist
      description: Audit usability, accessibility, keyboard navigation, and screen reader support
      blocked_by: [review-design]
    - name: harden-security
      assignee: security-analyst
      description: Audit OWASP Top 10, CSP, authentication, secrets, and dependency CVEs
      blocked_by: [audit-ux]
    - name: final-integration
      assignee: web-developer
      description: Apply all feedback, run final build, verify deployment
      blocked_by: [harden-security]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: New Web Application
Building a new web application from scratch:

```
User: Build a dashboard application with Next.js and Tailwind — it needs auth, data tables, and charts
```

The team scaffolds the app, reviews design quality, audits accessibility, and hardens security before deployment.

### Scenario 2: Redesign Existing Application
Modernizing an existing web application:

```
User: Redesign our customer portal — update to Next.js App Router, improve the design, and fix accessibility issues
```

The lead migrates the application, then each reviewer provides feedback specific to the redesign goals.

### Scenario 3: Pre-Launch Review
Reviewing an application before production launch:

```
User: Review our web app before launch — check the design, accessibility, and security
```

The team runs through design, UX, and security review phases on the existing codebase and produces a launch-readiness report.

## Limitations

- Optimized for Next.js/TypeScript/Tailwind stack; adaptable to other frameworks with modified lead approach
- Sequential coordination means later phases wait for earlier ones to complete
- Requires all four agent types to be available as subagents
- Does not include automated testing execution — focuses on code review and analysis
- Performance optimization is not a primary focus; consider profiling separately

## See Also

- [web-developer](../agents/web-developer.md) — Lead agent with full-stack web expertise
- [senior-web-designer](../agents/senior-web-designer.md) — Visual design review agent
- [senior-ux-ui-specialist](../agents/senior-ux-ui-specialist.md) — UX and accessibility review agent
- [security-analyst](../agents/security-analyst.md) — Security audit agent
- [scaffold-nextjs-app](../skills/scaffold-nextjs-app/SKILL.md) — Next.js scaffolding skill
- [review-web-design](../skills/review-web-design/SKILL.md) — Web design review skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
