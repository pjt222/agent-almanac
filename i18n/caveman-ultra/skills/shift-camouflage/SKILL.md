---
name: shift-camouflage
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Cuttlefish-inspired adaptive interfaces — polymorphic APIs, context-aware
  behavior, feature flags, attack surface reduction. Env assess, chromatophore
  map, dynamic interface gen, behavioral polymorphism, pattern disruption.
  Use → diff faces to diff observers, reduce attack surface, feature flags |
  progressive rollout at interface, adapt behavior to env w/o core change.
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

Adaptive surface transform — polymorphic interfaces, context-aware behavior, dynamic presentation. Cuttlefish chromatophores. Surface adapts → env, core stable. Reduces attack surface + optimizes diverse observer interaction.

## Use When

- Diff interfaces → diff consumers (API ver, multi-tenant, role-based)
- Reduce attack surface → expose only what observer needs
- Feature flags, progressive rollout, A/B at interface
- Adapt behavior → env context w/o core change
- Protect internal arch from external coupling (observers couple surface, not structure)
- Complement `adapt-architecture` when surface enough, deep transform unneeded

## In

- **Required**: System whose surface adapts
- **Required**: Observers + diff interface needs
- **Optional**: Current interface design + limits
- **Optional**: Threat model (hide what from whom?)
- **Optional**: Feature flag | progressive rollout infra
- **Optional**: Perf constraints (dynamic surface gen has overhead)

## Do

### Step 1: Map Observer Landscape

Who interacts + what each needs to see.

1. Catalog observers:
   - External (end users, API consumers, partners)
   - Internal services (microservices, bg jobs, admin tools)
   - Adversaries (attackers, scrapers, competitors)
   - Regulators (auditors, compliance)
2. Per observer:
   - Need to see (req surface)
   - Should not see (hidden)
   - Expect to see (compat surface — may differ from need)
   - How interact (protocol, freq, sensitivity)
3. Build observer-surface matrix:

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

**Got:** Complete observer landscape w/ surface reqs. Drives all camouflage design.

**If err:** Incomplete obs ID → start two extremes (most privileged: admin; most restricted: adversary). Design surfaces, interpolate between.

### Step 2: Design Chromatophore Mapping

Map observer context → surface presentation. "Chromatophore" layer.

1. Context signals:
   - Auth identity → privilege
   - Origin → geo, network, app
   - Feature flags → enable/disable
   - Time/phase → deploy stage, biz hours, maint
   - Load/health → degraded mode → reduced surface
2. Surface gen rules. Per context combo, elements are:
   - **Visible**: in res/interface
   - **Hidden**: excluded entirely (errs reveal nothing)
   - **Transformed**: present but modified for observer (diff schema, simpler data)
   - **Decoy**: deliberately misleading for adversarial contexts
3. Implement chromatophore layer:
   - Thin middleware/proxy between core + observers
   - Eval context signals each req
   - Apply surface config
   - Never modify core behavior — only filter + transform surface

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

**Got:** Mapping translates observer context → surface config. Explicit, auditable, separate from core.

**If err:** Too complex → simplify to role-based: 3-5 profiles (public, partner, admin, internal, minimal). Map every observer → one.

### Step 3: Behavioral Polymorphism

Behavior adapts to context, not just surface.

1. Context-dep behaviors:
   - Res detail (verbose admin, minimal public)
   - Rate limit (generous partners, strict unknown)
   - Err msgs (detail internal, generic external)
   - Data freshness (real-time premium, cached std)
   - Feature avail (full beta, stable-only general)
2. Variants:
   - Each = complete tested path
   - Context → which variant runs
   - Variants share core, differ in presentation + policy
3. Feature flag integration:
   - Flags control active variants
   - Progressive rollout: % of observers, increase over time
   - Circuit breakers: auto-revert safe behavior on err

**Got:** Behavior adapts → context. Same core → appropriate res for diff audiences. Flags → progressive rollout.

**If err:** Too many code paths → consolidate pipeline: core → policy layer → presentation layer. Polymorphism in policy + presentation only, core singular.

### Step 4: Reduce Attack Surface

Minimize what adversaries observe + interact w/.

1. Least surface:
   - Each observer sees only what needed
   - Unauth observers see min possible
   - Errs never leak internals (no stack traces, paths, vers)
2. Active reduction:
   - Remove default pages, headers, endpoints revealing tech stack
   - Randomize non-essential res chars (timing jitter, header order)
   - Disable unused endpoints entirely (off, not hidden)
3. Pattern disruption:
   - Vary res chars → defeat fingerprint
   - Controlled unpredictability in non-functional aspects
   - Functional behavior deterministic, surface chars vary
4. Recon monitoring:
   - Detect req patterns probing hidden surface (enum attacks)
   - Alert repeated access to nonexistent endpoints (path fuzz)
   - Track + correlate recon across sessions (see `defend-colony`)

**Got:** Min attack surface. Adversaries can't ID stack, internals, hidden caps. Recon detected + tracked.

**If err:** Reduction breaks legit consumers → matrix incomplete. Review Step 1, update. Randomization issues → reduce to non-functional only (timing, headers), keep functional res deterministic.

### Step 5: Surface Coherence

Dynamic surface stays consistent, debuggable, maintainable.

1. Testing:
   - Each profile explicit (admin sees admin? public sees public?)
   - Transitions (context changes mid-session?)
   - Failure modes (chromatophore layer fails → what surface?)
2. Docs:
   - Each profile + config
   - Context signals + effects
   - Sync w/ actual behavior (test docs vs reality)
3. Debug:
   - Admin/debug mode → which profile active + why
   - Logs → which config applied per req
   - Replay req through specific profile
4. Evolution:
   - Add: appropriate profiles, test, deploy
   - Remove: deprecation warning, then remove
   - Change: flag controlled, progressive rollout

**Got:** Maintainable, testable, documented system. Dynamic ≠ undebuggable.

**If err:** Debug nightmare → add transparency: trace header (admin/debug only) → which profile applied + which signals decided.

## Check

- [ ] Observer landscape mapped w/ surface reqs
- [ ] Chromatophore translates context → surface config
- [ ] Behavioral polymorphism adapts to context
- [ ] Attack surface min for adversaries
- [ ] Each profile explicit tested
- [ ] Failure mode → safe default (minimal)
- [ ] Debug/admin can inspect active config
- [ ] Docs match behavior

## Traps

- **Complexity explosion**: Too many profiles + variations. Max 3-5 profiles.
- **Core contamination**: Surface logic leaks into core. Chromatophore = separate. If-statements about observer type in core code → arch wrong.
- **Obscurity alone**: Surface reduction = defense-in-depth, not auth/authz replacement. Hidden endpoint still needs authn+authz.
- **Inconsistent surfaces**: A sees v1, B sees v2, supposed same. Test explicit, matrix authoritative.
- **Failure surface**: Chromatophore fails → what does observer see? Default must be safe (minimal), not open (full).

## →

- `assess-form` — surface adaptation may resolve form pressure w/o deep transform
- `adapt-architecture` — deep structural change when surface insufficient
- `repair-damage` — surface can mask damage during repair (caution — don't hide real probs)
- `defend-colony` — attack surface reduction = defense layer
- `coordinate-swarm` — context-aware in distributed needs coordinated surface
- `configure-api-gateway` — API gateways implement chromatophore in practice
- `deploy-to-kubernetes` — k8s svc + ingress enable network-level surface control
