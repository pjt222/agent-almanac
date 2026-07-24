---
name: mathematical-research
description: Hub-and-spoke mathematical research team that surveys and formalizes a problem, decomposes it into sub-problems routed to geometry, number-theory, stochastic, and diffusion specialists, then synthesizes one rigorous derivation
lead: theoretical-researcher
version: "1.0.0"
author: Philipp Thoss
created: 2026-07-24
updated: 2026-07-24
tags: [mathematics, research, proof, theoretical-science, geometry, number-theory, stochastic-processes, diffusion]
coordination: hub-and-spoke
members:
  - id: theoretical-researcher
    role: Lead
    responsibilities: Surveys the literature, formalizes the problem, decomposes it into sub-problems, dispatches each to the right specialist, and synthesizes the returned proofs and models into one derivation
  - id: geometrist
    role: Geometry Specialist
    responsibilities: Handles geometric and trigonometric sub-problems via ruler-and-compass constructions, Euclidean and coordinate proofs, and transformations
  - id: number-theorist
    role: Number Theory Specialist
    responsibilities: Handles prime, modular-arithmetic, and Diophantine sub-problems with paired computational verification and formal proof
  - id: markovian
    role: Stochastic Process Specialist
    responsibilities: Models Markov-chain, HMM, MDP, and MCMC sub-problems, computing stationary distributions, convergence diagnostics, and simulations
  - id: diffusion-specialist
    role: Diffusion Dynamics Specialist
    responsibilities: Analyzes diffusion and SDE sub-problems (Fokker-Planck, first-passage times, drift-diffusion, and generative diffusion dynamics)
locale: de
source_locale: en
source_commit: 7de503a4
translator: "Claude + human review"
translation_date: "2026-07-24"
---

# Mathematical Research Team

A five-agent research team that attacks a mathematical or theoretical problem too broad for any single proof toolkit. The lead (theoretical-researcher) surveys the literature, formalizes the problem, and decomposes it into sub-problems. Each sub-problem is routed to the specialist whose toolkit fits — geometry, number theory, stochastic processes, or diffusion dynamics — and the returned proofs and models are synthesized back into a single rigorous derivation.

## Purpose

Hard research problems rarely stay inside one branch of mathematics. A single question can hide a geometric lemma, a congruence condition, a convergence argument, and a first-passage estimate — each needing a different proof toolkit that no lone agent carries at full depth. Before this team, five solo agents (`theoretical-researcher`, `geometrist`, `number-theorist`, `markovian`, `diffusion-specialist`) spanned five domains (theoretical-science, geometry, number-theory, stochastic-processes, diffusion) with **zero** team coverage — nothing coordinated a decompose-and-synthesize research loop across them.

This team supplies that loop. It decomposes one problem into sub-problems that each need a distinct toolkit, then recombines the partial results into **one** derivation rather than four disconnected write-ups:

- **Formalization & synthesis**: literature survey, precise problem statement, and final derivation from first principles (lead)
- **Geometry**: constructions, Euclidean and coordinate proofs, trigonometric relations, transformations
- **Number theory**: primality and factorization, modular systems and CRT, Diophantine solution families
- **Stochastic processes**: transition matrices, stationary distributions, HMM/MDP structure, MCMC convergence
- **Diffusion dynamics**: SDEs, Fokker-Planck equations, first-passage-time distributions, drift and denoising dynamics

The value is in the seams: the lead frames the problem so the sub-problems are cleanly separable, and reconciles the returned pieces — checking limiting cases, dimensions, and consistency — into a coherent whole.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `theoretical-researcher` | Lead | Literature survey, formalization, decomposition, final derivation and synthesis |
| Geometry | `geometrist` | Geometry Specialist | Constructions, Euclidean/coordinate proofs, trigonometry, transformations |
| Number Theory | `number-theorist` | Number Theory Specialist | Primes, modular arithmetic, CRT, Diophantine equations |
| Stochastic | `markovian` | Stochastic Process Specialist | Markov chains, HMMs, MDPs, MCMC, convergence diagnostics |
| Diffusion | `diffusion-specialist` | Diffusion Dynamics Specialist | SDEs, Fokker-Planck, first-passage times, drift/denoising dynamics |

## Coordination Pattern

Hub-and-spoke: the theoretical-researcher lead is the hub. It formalizes the problem, decomposes it, and dispatches each sub-problem to the spoke whose toolkit fits. Spokes work independently on their assigned sub-problems and return proofs or models to the hub, which synthesizes them into a single derivation. When synthesis exposes a gap — an unproven lemma, a missing convergence condition, a boundary case — the lead flags it back to the relevant spoke for a second pass. The spokes do not talk to each other; all routing and reconciliation flows through the hub.

```text
                theoretical-researcher (Lead / Hub)
          survey → formalize → decompose → synthesize
        ┌──────────┬──────────┼──────────┬──────────┐
        ↓          ↓          ↓          ↓          ↑
   geometrist  number-    markovian  diffusion-   (gaps flagged
              theorist              specialist    back to spokes)
```

**Flow:**

1. Lead surveys the literature and formalizes the problem into a precise statement
2. Lead decomposes it into sub-problems and dispatches each to the fitting specialist
3. Specialists return proofs and models for their sub-problems
4. Lead synthesizes the pieces into one derivation and flags any gaps back to the spokes for a second pass

## Task Decomposition

### Phase 1: Survey & Formalize (Lead)
The theoretical-researcher lead establishes the ground the whole team stands on:

- Run `survey-theoretical-literature` to map prior results, seminal papers, and open threads
- Run `formulate-quantum-problem` (or the equivalent formalization step) to state the problem precisely — assumptions, objects, and the quantity to be derived
- Identify which branches of mathematics the problem touches, so decomposition targets real toolkits rather than arbitrary splits

### Phase 2: Decompose & Dispatch (Lead)
The lead breaks the formalized problem into sub-problems and routes each to the specialist whose skills match:

- **Geometric / trigonometric sub-problems** → `geometrist` (`prove-geometric-theorem`, `construct-geometric-figure`, `solve-trigonometric-problem`)
- **Prime / modular / Diophantine sub-problems** → `number-theorist` (`solve-modular-arithmetic`, `analyze-prime-numbers`, `explore-diophantine-equations`)
- **State-transition / convergence sub-problems** → `markovian` (`model-markov-chain`, `fit-hidden-markov-model`, `simulate-stochastic-process`)
- **Diffusion / SDE / first-passage sub-problems** → `diffusion-specialist` (`analyze-diffusion-dynamics`, `fit-drift-diffusion-model`, `implement-diffusion-network`, `analyze-generative-diffusion-model`)

### Phase 3: Specialist Work (Spokes, in parallel)

**geometrist** tasks:
- Prove the geometric lemmas the derivation depends on, showing the axiom-to-conclusion chain
- Supply constructions or trigonometric identities the lead needs as building blocks
- Verify symbolic results numerically before returning them

**number-theorist** tasks:
- Resolve congruence conditions, factorizations, or Diophantine solution families
- Provide the gcd / divisibility conditions and integer-solution structure the derivation requires
- Pair each analytic claim with a computational check

**markovian** tasks:
- Model the state-transition or convergence sub-structure; compute stationary distributions or mixing behavior
- Establish ergodicity / reversibility conditions where the derivation assumes them
- Return convergence diagnostics, not just point results

**diffusion-specialist** tasks:
- Analyze the SDE / Fokker-Planck sub-problem; derive first-passage-time or transition densities
- Verify analytic densities against Euler-Maruyama simulation before returning
- Flag where approximations enter the result

### Phase 4: Synthesize & Close Gaps (Lead)
The theoretical-researcher lead runs `derive-theoretical-result` to assemble the returned pieces into one derivation:

- Chain the specialist proofs and models into a single, first-principles argument with every step justified
- Check limiting cases, dimensions, and cross-piece consistency
- Where synthesis exposes a gap — an unproven lemma, a missing convergence or boundary condition — flag it back to the responsible spoke and re-integrate the second-pass result
- Produce the final derivation with precise citations to the sub-results it rests on

## Configuration

Machine-readable configuration block Claude reads when activating this team. In ordinary interactive sessions, activation spawns each listed member as a subagent via the Agent tool (`subagent_type`), coordinated with SendMessage under the session's single implicit team. (`TeamCreate` is a gated FleetView/cloud-only fallback.)

<!-- CONFIG:START -->
```yaml
team:
  name: mathematical-research
  lead: theoretical-researcher
  coordination: hub-and-spoke
  members:
    - agent: theoretical-researcher
      role: Lead
      subagent_type: theoretical-researcher
    - agent: geometrist
      role: Geometry Specialist
      subagent_type: geometrist
    - agent: number-theorist
      role: Number Theory Specialist
      subagent_type: number-theorist
    - agent: markovian
      role: Stochastic Process Specialist
      subagent_type: markovian
    - agent: diffusion-specialist
      role: Diffusion Dynamics Specialist
      subagent_type: diffusion-specialist
  tasks:
    - name: survey-and-formalize
      assignee: theoretical-researcher
      description: Survey the literature and formalize the problem into a precise statement
    - name: decompose-and-dispatch
      assignee: theoretical-researcher
      description: Decompose the formalized problem into sub-problems and route each to the fitting specialist
      blocked_by: [survey-and-formalize]
    - name: geometry-subproblem
      assignee: geometrist
      description: Prove geometric/trigonometric lemmas and constructions the derivation depends on
      blocked_by: [decompose-and-dispatch]
    - name: number-theory-subproblem
      assignee: number-theorist
      description: Resolve prime, modular-arithmetic, and Diophantine sub-problems with computational checks
      blocked_by: [decompose-and-dispatch]
    - name: stochastic-subproblem
      assignee: markovian
      description: Model state-transition/convergence structure; compute stationary distributions and diagnostics
      blocked_by: [decompose-and-dispatch]
    - name: diffusion-subproblem
      assignee: diffusion-specialist
      description: Analyze SDE/Fokker-Planck sub-problem; derive first-passage or transition densities
      blocked_by: [decompose-and-dispatch]
    - name: synthesize-derivation
      assignee: theoretical-researcher
      description: Assemble specialist results into one derivation via derive-theoretical-result and flag gaps back to spokes
      blocked_by: [geometry-subproblem, number-theory-subproblem, stochastic-subproblem, diffusion-subproblem]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Multi-Toolkit Research Problem
A problem whose full solution needs more than one branch of mathematics:

```text
User: Derive an asymptotic estimate for the expected first-passage time of a biased
      random walk on a lattice whose step set is constrained by a modular condition
```

The lead surveys the relevant literature, formalizes the walk and its constraint, and decomposes: the modular step constraint goes to `number-theorist`, the lattice geometry to `geometrist`, the walk's transition structure to `markovian`, and the continuum first-passage limit to `diffusion-specialist`. The lead then synthesizes the pieces into one asymptotic derivation, flagging back any gap (e.g., a missing recurrence condition) for a second pass.

### Scenario 2: Cross-Domain Conjecture Exploration
Probing a conjecture that sits at the seam between fields:

```text
User: Explore whether the mixing time of this Markov chain is controlled by a
      geometric isoperimetric constant, and formalize the connection
```

The lead frames the conjecture and dispatches the isoperimetric/geometry piece to `geometrist` and the spectral-gap/mixing piece to `markovian`, then derives the combined bound and reports where the connection holds versus where it remains conjectural.

### Scenario 3: Formalizing an Informal Result
Turning a heuristic argument into a rigorous derivation:

```text
User: We have a hand-wavy argument that this diffusion limit matches a number-theoretic
      density — make it rigorous
```

The lead surveys prior formalizations, decomposes the claim into a diffusion sub-result (`diffusion-specialist`) and a density/counting sub-result (`number-theorist`), and synthesizes a step-by-step derivation, escalating unresolved lemmas back to the spokes until the argument closes.

## Limitations

- Best for problems that genuinely span multiple toolkits; a single-domain question is faster with the matching solo agent (e.g. `number-theorist` alone for a pure congruence problem)
- Requires all five agent types to be available as subagents
- The lead's decomposition quality bounds the whole run — a poorly separated split produces sub-problems that do not recombine cleanly
- Produces derivations and models, not machine-checked formal proofs; there is no proof-assistant (Lean/Coq) verification in the loop
- Heavy numerical computation is bounded by each specialist's scripting limits — not a substitute for a CAS (Mathematica/Sage) or GPU cluster
- Cannot settle open conjectures (e.g. Riemann, Goldbach); it can formalize, decompose, and verify instances, not resolve them
- Spokes coordinate only through the hub; problems needing tight peer-to-peer negotiation between two specialists still route every exchange through the lead

## See Also

- [theoretical-researcher](../agents/theoretical-researcher.md) — Lead: formalization, derivation, and literature synthesis
- [geometrist](../agents/geometrist.md) — Geometry and trigonometry specialist
- [number-theorist](../agents/number-theorist.md) — Prime, modular-arithmetic, and Diophantine specialist
- [markovian](../agents/markovian.md) — Markov-chain, HMM, and MCMC specialist
- [diffusion-specialist](../agents/diffusion-specialist.md) — SDE and diffusion-dynamics specialist
- [survey-theoretical-literature](../skills/survey-theoretical-literature/SKILL.md) — Phase-1 literature survey skill
- [derive-theoretical-result](../skills/derive-theoretical-result/SKILL.md) — Phase-4 synthesis skill
- [synoptic-mind](synoptic-mind.md) — Distinct: gestalt cross-domain *synthesis* of perspectives, not a formal proof-toolkit derivation loop
- [physical-computing](physical-computing.md) — Distinct: takes logic/theory down to *hardware* (logic-to-circuit), not abstract mathematical derivation

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-07-24
