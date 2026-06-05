---
name: shift-camouflage
description: >
  Implement cuttlefish-inspired adaptive interfaces — polymorphic APIs,
  context-aware behavior, feature flags, and attack surface reduction.
  Covers environmental assessment, chromatophore mapping, dynamic interface
  generation, behavioral polymorphism, and pattern disruption for systems
  that must present different faces to different observers. Use when a system
  must present different interfaces to different consumers, when reducing attack
  surface by exposing only what each observer needs, when implementing feature
  flags or progressive rollouts at the interface level, or when adapting behavior
  to environmental context without core changes.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, camouflage, polymorphism, feature-flags
---

# Shift Camouflage

Implement adaptive surface transformation — polymorphic interfaces, context-aware behavior, and dynamic presentation — inspired by cuttlefish chromatophores. The system's surface adapts to its environment while its core remains stable, reducing attack surface and optimizing interaction with diverse observers.

## When to Use

- A system must present different interfaces to different consumers (API versioning, multi-tenant, role-based)
- Reducing attack surface by exposing only what each observer needs to see
- Implementing feature flags, progressive rollouts, or A/B testing at the interface level
- A system needs to adapt its behavior to environmental context without core changes
- Protecting internal architecture from external coupling (observers couple to the surface, not the structure)
- Complementing `adapt-architecture` when surface change is sufficient and deep transformation is unnecessary

## Inputs

- **Required**: The system whose surface needs adaptation
- **Required**: The observers/consumers and their different interface needs
- **Optional**: Current interface design and its limitations
- **Optional**: Threat model (what should be hidden from which observers?)
- **Optional**: Feature flag system or progressive rollout infrastructure
- **Optional**: Performance constraints (dynamic surface generation has overhead)

## Procedure

### Step 1: Map the Observer Landscape

Identify who interacts with the system and what each observer needs to see.

1. Catalog all observers:
   - External users (end users, API consumers, partners)
   - Internal services (microservices, background jobs, admin tools)
   - Adversaries (attackers, scrapers, competitors)
   - Regulators (auditors, compliance checks)
2. For each observer, define:
   - What they need to see (required interface surface)
   - What they should not see (hidden surface)
   - What they expect to see (compatibility surface — may differ from what they need)
   - How they interact (protocol, frequency, sensitivity)
3. Create the observer-surface matrix:

```
Observer-Surface Matrix:
┌──────────────┬────────────────────────┬─────────────────┬──────────────┐
│ Observer     │ Required Surface       │ Hidden Surface  │ Threat Level │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ End users    │ Public API v2, UI      │ Internal APIs,  │ Low          │
│              │                        │ admin endpoints │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Partner API  │ Partner API, webhooks  │ Internal logic, │ Medium       │
│              │                        │ user data       │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Admin tools  │ Full API, debug        │ Raw data store  │ Low          │
│              │ endpoints              │ access          │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Adversaries  │ Nothing (minimal)      │ Everything      │ High         │
│              │                        │ possible        │              │
└──────────────┴────────────────────────┴─────────────────┴──────────────┘
```

**Expected:** A complete observer landscape with surface requirements per observer. This drives all subsequent camouflage design.

**On failure:** If observer identification is incomplete, start with the two extremes: the most privileged observer (admin) and the most restricted (adversary). Design surfaces for these two, then interpolate for observers between them.

### Step 2: Design Chromatophore Mapping

Create the mapping between observer context and surface presentation — the "chromatophore" layer.

1. Define context signals:
   - Authentication identity → determines privilege level
   - Request origin → geographic, network, or application context
   - Feature flags → enables/disables specific surface elements
   - Time/phase → deployment stage, business hours, maintenance windows
   - Load/health → degraded mode may present reduced surface
2. Design the surface generation rules:
   - For each combination of context signals, define which surface elements are:
     - **Visible**: included in the response/interface
     - **Hidden**: excluded entirely (not even error messages reveal their existence)
     - **Transformed**: present but modified for this observer (different schema, simplified data)
     - **Decoy**: deliberately misleading surface elements for adversarial contexts
3. Implement the chromatophore layer:
   - A thin middleware/proxy that sits between the core system and observers
   - Evaluates context signals on each request
   - Applies the appropriate surface configuration
   - Never modifies core behavior — only filters and transforms the surface

```
Chromatophore Architecture:
┌──────────────────────────────────────────────────────┐
│ Observer Request                                      │
│        │                                              │
│        ↓                                              │
│ ┌─────────────────┐                                   │
│ │ Context Extract  │ ← Auth, origin, flags, time      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Select   │ ← Observer-surface matrix lookup  │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Core System      │ ← Processes request normally      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Filter   │ ← Remove/transform/add elements   │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ Observer Response (adapted surface)                    │
└──────────────────────────────────────────────────────┘
```

**Expected:** A chromatophore mapping that translates observer context into surface configuration. The mapping is explicit, auditable, and separate from core logic.

**On failure:** If the mapping becomes too complex (too many context combinations), simplify to role-based surfaces: define 3-5 surface profiles (public, partner, admin, internal, minimal) and map every observer to one profile.

### Step 3: Implement Behavioral Polymorphism

Make the system's behavior adapt to context, not just its surface appearance.

1. Identify context-dependent behaviors:
   - Response detail level (verbose for admin, minimal for public)
   - Rate limiting (generous for partners, strict for unknown callers)
   - Error messages (detailed for internal, generic for external)
   - Data freshness (real-time for premium, cached for standard)
   - Feature availability (full for beta testers, stable-only for general)
2. Implement behavioral variants:
   - Each variant is a complete, tested behavior path
   - Context determines which variant executes
   - Variants share core logic but differ in presentation and policy
3. Feature flag integration:
   - Feature flags control which behavioral variants are active
   - Progressive rollout: expose new behavior to a percentage of observers, increasing over time
   - Circuit breakers: automatically revert to safe behavior if the new variant causes errors

**Expected:** The system's behavior adapts to observer context — the same core logic produces appropriate responses for different audiences. Feature flags enable progressive rollout of new behaviors.

**On failure:** If behavioral polymorphism creates too many code paths, consolidate to a pipeline model: core logic → policy layer → presentation layer. Polymorphism lives in the policy and presentation layers only, keeping core logic singular.

### Step 4: Reduce Attack Surface

Minimize what adversaries can observe and interact with.

1. Apply the principle of least surface:
   - Each observer sees only what they need — nothing more
   - Unauthenticated observers see the minimum possible surface
   - Error messages never leak internal structure (no stack traces, no internal paths, no version numbers)
2. Implement active surface reduction:
   - Remove default pages, headers, and endpoints that reveal technology stack
   - Randomize non-essential response characteristics (timing jitter, header order)
   - Disable unused API endpoints entirely (not just hidden — actually off)
3. Deploy pattern disruption:
   - Vary response characteristics to defeat fingerprinting
   - Introduce controlled unpredictability in non-functional aspects
   - Ensure that functional behavior remains deterministic while surface characteristics vary
4. Monitor for reconnaissance:
   - Detect patterns of requests that probe for hidden surface (enumeration attacks)
   - Alert on repeated access to non-existent endpoints (path fuzzing)
   - Track and correlate reconnaissance patterns across sessions (see `defend-colony`)

**Expected:** A minimal attack surface where adversaries cannot easily determine the system's technology stack, internal structure, or hidden capabilities. Reconnaissance attempts are detected and tracked.

**On failure:** If surface reduction breaks legitimate consumers, the observer-surface matrix is incomplete — legitimate needs are being hidden. Review Step 1 and update the matrix. If randomization causes issues, reduce randomization to non-functional aspects only (timing, headers) and keep functional responses deterministic.

### Step 5: Maintain Surface Coherence

Ensure that the dynamic surface remains consistent, debuggable, and maintainable.

1. Surface testing:
   - Test each observer profile explicitly (does admin see admin surface? does public see public surface?)
   - Test surface transitions (what happens when an observer's context changes mid-session?)
   - Test surface failure modes (what surface appears if the chromatophore layer fails?)
2. Surface documentation:
   - Document each observer profile and its surface configuration
   - Document the context signals and their effects on surface selection
   - Keep documentation in sync with actual behavior (test documentation against reality)
3. Debugging support:
   - Admin/debug mode reveals which surface profile is active and why
   - Logging captures which surface configuration was applied to each request
   - Ability to replay a request through a specific surface profile for debugging
4. Surface evolution:
   - Adding new surface elements: add to the appropriate profiles, test, deploy
   - Removing surface elements: deprecation warning period, then removal
   - Changing surface behavior: feature flag controlled, progressive rollout

**Expected:** A maintainable, testable, well-documented surface adaptation system. The dynamic nature doesn't compromise the ability to debug, document, or evolve the interfaces.

**On failure:** If the chromatophore layer becomes a debugging nightmare, add transparency: every response includes a trace header (visible only to admin/debug profile) indicating which surface profile was applied and which context signals determined it.

## Validation

- [ ] Observer landscape is mapped with surface requirements per observer
- [ ] Chromatophore mapping translates context to surface configuration
- [ ] Behavioral polymorphism adapts responses to observer context
- [ ] Attack surface is minimized for adversarial observers
- [ ] Each observer profile is explicitly tested
- [ ] Surface failure mode presents a safe default (minimal surface)
- [ ] Debug/admin mode can inspect active surface configuration
- [ ] Surface documentation matches actual behavior

## Common Pitfalls

- **Surface complexity explosion**: Too many observer profiles with too many variations. Consolidate to 3-5 profiles maximum. Most observers fit into broad categories
- **Core contamination**: Letting surface adaptation logic leak into core business logic. The chromatophore layer must be separate — if you're adding if-statements about observer type in core code, the architecture is wrong
- **Security through obscurity alone**: Surface reduction is a defense-in-depth layer, not a replacement for proper security controls. A hidden endpoint still needs authentication and authorization
- **Inconsistent surfaces**: Observer A sees version 1 of a response and observer B sees version 2 — but they're supposed to see the same thing. Test surfaces explicitly and keep the observer-surface matrix authoritative
- **Forgetting the failure surface**: When the chromatophore layer itself fails, what surface does the observer see? The default must be safe (minimal surface) not open (full surface)

## Related Skills

- `assess-form` — surface adaptation may resolve pressure identified in form assessment without requiring deep transformation
- `adapt-architecture` — deep structural change for when surface adaptation is insufficient
- `repair-damage` — surface adaptation can mask damage during repair (with caution — don't hide real problems)
- `defend-colony` — attack surface reduction is a defense layer; reconnaissance detection feeds into defense
- `coordinate-swarm` — context-aware behavior in distributed systems requires coordinated surface adaptation
- `configure-api-gateway` — API gateways implement many chromatophore layer functions in practice
- `deploy-to-kubernetes` — Kubernetes services and ingress enable network-level surface control
