---
title: "Team Assembly Prompt Patterns"
description: "How to phrase requests to Claude Code for multi-agent team work at every level of specificity"
category: workflow
agents: [shapeshifter, contemplative, adaptic]
teams: [r-package-review, opaque-team, dyad, synoptic-mind, scrum-team]
skills: [coordinate-swarm, create-team]
---

# Team Assembly Prompt Patterns

The system has 15 pre-defined teams with 8 coordination patterns, 68 agents, and 337 skills. Teams are activated through natural conversation with Claude Code -- Claude reads team definitions from `teams/`, calls `TeamCreate`, spawns agents, and creates tasks. But the way you phrase your request determines how much control you retain versus how much autonomy Claude exercises. This guide covers the human-to-Claude conversation layer: how phrasing affects team selection, coordination quality, and autonomy delegation.

**Scope boundary**: This guide covers how to phrase requests for team activation and coordination pattern selection. It does not cover general prompt engineering, post-assembly operational management (see [Production Coordination Patterns](production-coordination-patterns.md)), or team definition authoring (see [Creating Agents and Teams](creating-agents-and-teams.md)).

## When to Use This Guide

- You know which team you want but are unsure how to phrase the request for best results
- You want Claude to choose the right team for your problem without specifying it
- You need to redirect or re-scope a running team mid-session
- You are getting generic results from team invocations and suspect the prompt is the issue
- You want to pair agents in a dyad and need to specify the practitioner slot

## Prerequisites

- Familiarity with what teams are and how they coordinate -- see [Understanding the System](understanding-the-system.md)
- At least one team invocation experience (any team, any coordination pattern)
- For pattern-specific guidance: awareness of the 8 coordination patterns documented in [teams/README.md](../teams/README.md)

## The Specificity Gradient

Every team activation request falls on a spectrum from fully explicit to fully open. Each level shifts decision-making from human to Claude.

### Level 1: Full Control

You name the team, the target, and the focus area. Claude handles task decomposition per the CONFIG block.

```
"Use the r-package-review team to review the putior package. Focus on CRAN readiness."
```

```
"Activate the scrum-team for a 2-week sprint on this R package. I will be Product Owner."
```

```
"Launch the translation-campaign team. Start with wave 1 (r-packages domain)."
```

Best when: you know exactly which team fits, you want predictable agent composition, or you need repeatability across sessions.

### Level 2: Team Chosen, Task Open

You name the team but leave decomposition to Claude. Claude decides which aspects to focus on and how to prioritize.

```
"Use the r-package-review team on this codebase. Tell me what you find."
```

```
"Run the devops-platform-engineering team against our infrastructure. Full assessment."
```

Best when: you trust the team composition but the codebase is unfamiliar, or you want Claude to discover what matters.

### Level 3: Domain Hinted

You describe the domain or concern without naming a team. Claude selects the appropriate team (or a single agent if a team is overkill).

```
"I need a thorough security and architecture review of this web app."
```

```
"This R package needs a pre-CRAN quality check. Whatever team is appropriate."
```

```
"I want a contemplative check-in -- something light, not a full session."
```

Best when: you know what kind of work you need but not which team does it, or when multiple teams could apply. The permission signal (next section) helps Claude understand its latitude.

### Level 4: Fully Open (Experimental)

You state the outcome. Claude decides everything: team, agents, coordination pattern, task decomposition.

```
"Make this production-ready. Put together whatever team you need."
```

```
"I inherited this codebase and don't trust it. Figure out what I'm dealing with."
```

**Caveat**: Adaptive coordination (which fully open requests often trigger) scored lowest in testing -- 73% vs 92%+ for structured patterns. Recommended for exploratory or hypothesis-generation work. For high-stakes tasks (compliance reviews, production deployments), prefer Levels 1-2 and verify team selection before proceeding.

Best when: the problem spans multiple domains, you don't know what you don't know, or you want to see what Claude considers important.

## The Permission Signal

Certain phrasings function as permission signals -- they tell Claude it is authorized to make architectural decisions (which team, how many agents, which coordination pattern) rather than following a specific instruction.

| Signal strength | Example phrases | Claude decides |
|----------------|-----------------|----------------|
| Strong | "Assemble whatever team you need" | Team, members, pattern, decomposition |
| Strong | "Put together the right agents for this" | Same as above |
| Strong | "Figure out the best approach" | Same as above |
| Moderate | "Use the right review team for this" | Team (constrained to review-type) |
| Moderate | "I need esoteric support -- pick the right format" | Tending vs dyad vs single agent |
| Moderate | "Do a multi-agent review, you decide the specialists" | Members within review pattern |
| Absent | "Use the r-package-review team" | Task decomposition only |
| Absent | "Spawn the security-analyst" | Nothing -- literal execution |

Without a permission signal, Claude executes literally. Naming a specific team removes adaptive selection -- even if another team might be a better fit.

These are observed patterns, not guaranteed mechanisms. Claude may still suggest alternatives if the named team is clearly a poor fit.

## Prompt Patterns by Coordination Type

Different coordination patterns benefit from different information in your prompt.

### Hub-and-Spoke

*Teams: r-package-review, gxp-compliance-validation, ml-data-science-review, agentskills-alignment, entomology, analytical-chemistry*

**Include**: the target artifact, the focus dimensions, any dimensions to skip.
**Leave to Claude**: task distribution order, finding prioritization.

```
"Review this R package with the r-package-review team. Skip security -- I ran that yesterday. Focus on CRAN compliance."
```

**Anti-pattern**: "First have the code-reviewer check style, then the architect check structure..." -- this imposes sequential order on a parallel-capable pattern. Let the lead distribute.

### Sequential

*Teams: fullstack-web-dev, tending, physical-computing*

**Include**: the starting state and desired end state. The lead needs to know where the pipeline begins.
**Leave to Claude**: transitions between stages.

```
"Build out this Next.js app using the fullstack-web-dev team. The scaffolding is done -- start from design review."
```

**Anti-pattern**: Asking to skip a middle step in the sequence -- it breaks the chain of dependencies.

### Parallel

*Teams: devops-platform-engineering*

**Include**: scope boundaries for each domain -- what is in and out of scope.
**Leave to Claude**: intra-domain task decomposition.

```
"Run the devops-platform-engineering team on this Kubernetes setup. ML infrastructure is not relevant -- skip mlops."
```

**Anti-pattern**: Serializing parallel agents -- "wait for security to finish before mlops starts" defeats the pattern's strength.

### Timeboxed

*Teams: scrum-team*

**Include**: sprint duration, your role (Product Owner), the sprint goal or feature scope.
**Leave to Claude**: task sizing, sprint backlog composition.

```
"Run a 1-week sprint with the scrum-team. I'm the PO. Sprint goal: add OAuth login. Initial backlog: user registration, token refresh, session management."
```

**Anti-pattern**: Omitting the sprint goal -- the team has no north star for prioritization.

### Adaptive

*Teams: opaque-team*

**Include**: the desired outcome. Do NOT prescribe roles or decomposition -- that is the team's job.
**Leave to Claude**: role emergence, task decomposition, coordination structure.

```
"Use the opaque-team with 4 shapeshifters. Goal: make this CLI tool robust, documented, and tested."
```

**Anti-pattern**: "Have shapeshifter #1 do tests, #2 do docs..." -- this manually assigns roles to an adaptive team, defeating self-organization. If you know the roles, use a pre-defined team instead.

### Wave-Parallel

*Teams: translation-campaign*

**Include**: which waves to run, locale priorities, any glossary overrides.
**Leave to Claude**: wave-internal parallelism, translator pacing.

```
"Start the translation-campaign team. Run waves 1-3 only. Prioritize German and Japanese."
```

**Anti-pattern**: Asking for all locales simultaneously -- wave dependencies exist for a reason.

### Reciprocal (Dyad)

*Teams: dyad*

**Include**: which agent fills the practitioner slot (the dyad definition uses "any") and the primary task.
**Leave to Claude**: micro-intervention timing, reflection facilitation.

```
"Set up a dyad: contemplative witnessing the r-developer while it refactors the plotting module."
```

```
"Dyad session -- mystic practicing, contemplative witnessing."
```

```
"Pair the contemplative with the code-reviewer for this PR. I want attunement to the author's intent."
```

**Anti-pattern**: "Start a dyad session" without naming the practitioner -- Claude cannot fill the "any" slot without guidance.

### Synoptic

*Teams: synoptic-mind*

**Include**: which domain agents fill the Domain Voice slots, and the cross-domain question. Frame the question as an integration challenge, not a survey.
**Leave to Claude**: the gestalt integration process.

```
"Activate synoptic-mind with r-developer, security-analyst, and devops-engineer as domain voices. Question: should we containerize the MCP server as a sidecar or embed it?"
```

**Anti-pattern**: "What does each domain say about X?" -- this produces parallel summaries, not a gestalt. Ask "What do these domains mean together?" instead.

## Mid-Session Steering

For operational depth on managing running teams, see [Production Coordination Patterns](production-coordination-patterns.md). The three most common mid-session adjustments:

**Scope injection** -- adding new focus areas after the team has started:
```
"Also have the code-reviewer check for memory leaks in the Rcpp code."
```

**Priority override** -- shifting the team's focus:
```
"I know there are style issues, but prioritize the architecture review. The dependency graph is my main concern."
```

**Early termination** -- stopping when you have enough:
```
"That's enough -- summarize what you've found so far."
```

Always request a partial summary rather than abruptly stopping -- findings in progress are lost without explicit collection.

## Anti-Patterns

| Anti-pattern | Why it fails | Fix |
|-------------|-------------|-----|
| Over-specifying adaptive teams | Manually assigning roles to shapeshifters defeats self-organization | State the outcome, not the roles. Use a pre-defined team if you know the roles. |
| Under-specifying hub-and-spoke teams | No target artifact or focus area produces generic, unfocused reports | Always include what to review and at least one focus hint. |
| Imposing sequential order on parallel teams | Serializing concurrent agents wastes the pattern's strength | If you need ordering, use a sequential team instead. |
| Skipping the practitioner in a dyad | The "any" slot cannot be filled automatically | Always name the practitioner agent explicitly. |
| Asking for gestalt from hub-and-spoke | Hub-and-spoke produces independent reviews, not cross-domain integration | Use synoptic-mind when you need interaction-aware synthesis. |
| Mixing specificity levels | "Assemble whatever you need, but use r-developer as lead" sends conflicting signals | Pick one level. Either name the team and customize, or truly delegate. |

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Claude uses a single agent instead of a team | No team name or permission signal in prompt | Add "use a team" or name the specific team |
| Claude chooses the wrong team | Domain hint is ambiguous | Be more specific about the domain, or name the team directly (Level 1) |
| Team produces a generic report | Prompt lacked target or focus area | Include what to review and what to focus on |
| Adaptive team assigns poor roles | Outcome description too vague | Describe the end state concretely: "tested, documented, deployable" |
| Dyad starts without a practitioner | Prompt did not specify which agent to pair | Always name the practitioner: "dyad with r-developer" |
| Synoptic produces summaries instead of gestalt | Prompt asked "what does each domain say?" | Reframe as integration: "what do these domains mean together?" |

## Related Resources

### Guides

- [Understanding the System](understanding-the-system.md) -- what teams are and how they compose
- [Creating Agents and Teams](creating-agents-and-teams.md) -- designing new teams and coordination patterns
- [Production Coordination Patterns](production-coordination-patterns.md) -- post-assembly operational management
- [Unleash the Agents](unleash-the-agents.md) -- multi-agent consultation tiers for open-ended problems
- [Quick Reference](quick-reference.md) -- team names and basic invocation examples

### Teams

- [r-package-review](../teams/r-package-review.md) -- hub-and-spoke review (primary example throughout this guide)
- [opaque-team](../teams/opaque-team.md) -- adaptive self-organizing (most affected by prompt phrasing)
- [dyad](../teams/dyad.md) -- reciprocal paired practice (requires practitioner specification)
- [synoptic-mind](../teams/synoptic-mind.md) -- synoptic shared workspace (requires integration framing)
- [scrum-team](../teams/scrum-team.md) -- timeboxed sprints (requires PO role and sprint goal)

### Skills

- [create-team](../skills/create-team/SKILL.md) -- authoring team definitions with CONFIG blocks
- [coordinate-swarm](../skills/coordinate-swarm/SKILL.md) -- distributed coordination patterns

<!-- Target: 200-400 lines. Maintain cross-references to complementary guides. -->
