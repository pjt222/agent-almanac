---
name: repair-damage
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Impl regenerative recovery via triage, scaffolding, progressive rebuild.
  Damage assess, wound classification, emergency stabilization, scar tissue
  mgmt, resilience strengthening for systems sustained structural damage. Use
  → system suffered incident needing structured recovery, failed transform
  left damaged intermediate, accumulated tech debt caused partial fail, or
  functional but degraded + degradation worsening.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, repair, regeneration, resilience, wound-healing
---

# Repair Damage

Impl regenerative recovery for systems sustained structural damage — incidents, failed migrations, accumulated neglect, external disruption. Uses bio wound-healing as framework: triage, stabilization, scaffolding, progressive rebuild, scar tissue mgmt.

## Use When

- System suffered incident, needs structured recovery beyond "fix it"
- Failed transformation (see `adapt-architecture`) left damaged intermediate
- Accumulated tech debt caused partial fail
- Org damage (team departures, knowledge loss, morale collapse) needs structured repair
- Post-defense recovery (see `defend-colony`) when colony sustained damage
- System functional but degraded, degradation worsening

## In

- **Required**: Damage description (what broke, when, severity)
- **Required**: Current system state (working vs not)
- **Optional**: Root cause (if known — may not be clear yet)
- **Optional**: Pre-damage state (compare)
- **Optional**: Resources (time, people, budget)
- **Optional**: Urgency (actively degrading or stable-but-damaged?)

## Do

### Step 1: Triage

Rapidly assess all damage + classify by severity + urgency.

1. Catalog every known damage point:
   - What component, fn, capability affected?
   - Damage complete (non-functional) or partial (degraded)?
   - Spreading (affecting adjacent) or contained?
2. Classify each wound:

```
Wound Classification:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Class    │ Severity             │ Response                           │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Critical │ Core function lost,  │ Immediate: stop bleeding, activate │
│          │ data at risk,        │ backup, redirect traffic, page     │
│          │ actively spreading   │ on-call team                       │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Serious  │ Important function   │ Urgent: fix within hours/days,     │
│          │ degraded, no spread  │ workarounds acceptable short-term  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Moderate │ Non-critical function│ Scheduled: fix within sprint,      │
│          │ affected, contained  │ prioritize against other work      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Minor    │ Cosmetic or edge     │ Backlog: fix when convenient,      │
│          │ case, no user impact │ may self-resolve                   │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

3. Prioritize repair order:
   - Critical first (stop bleeding)
   - Then serious (restore important fn)
   - Moderate + minor wait scheduled
4. Check wound interaction:
   - Wounds amplify each other? (A worse because B also broken)
   - Fixing one auto fix others? (shared root cause)
   - Fixing one make another worse? (competing strategies)

→ Complete wound inventory classified by severity, prioritized order accounting for interactions.

If err: triage too long (system actively degrading) → skip detailed classification + focus: "What single most critical thing to stabilize?" Fix that first, then return full triage.

### Step 2: Emergency Stabilization

Stop damage spreading before repair.

1. Contain wound:
   - Isolate damaged components (circuit breakers, network segmentation, traffic rerouting)
   - Prevent cascade: disable non-essential features depending on damaged
   - Preserve evidence: snapshots, save logs, capture current state before changes
2. Apply emergency patches:
   - Not permanent fixes — tourniquets
   - Acceptable:
     - Redirect traffic to healthy replica
     - Disable damaged feature entirely
     - Apply known-working config from backup
     - Scale up healthy components to absorb redirected load
   - Unacceptable:
     - Modifying code w/o testing (creates new wounds)
     - Deleting data to "reset" (destroys recovery options)
     - Hiding damage (disabling alerts, suppressing errors)
3. Verify stabilization:
   - Damage still spreading? Yes → containment failed → broader isolation
   - System functional (possibly degraded)? Yes → proceed repair
   - Emergency patches holding? Yes → time for deliberate repair

→ System stable (not actively degrading) even if degraded. Damage contained + not spreading. Evidence preserved for root cause.

If err: stabilization fails (damage continues spreading despite containment) → escalate to full system fallback: activate disaster recovery, switch backup, or gracefully degrade to minimal viable. Stabilization too long becomes the disaster.

### Step 3: Build Repair Scaffolding

Construct temp structures supporting repair.

1. Set up repair env:
   - Branch or copy damaged system for repair work
   - Repair changes testable before applying to prod
   - Rollback plan for each repair step
2. Build diagnostic infra:
   - Enhanced monitoring on damaged areas (detect regression immediately)
   - Logging captures repair process (what changed, when, why)
   - Comparison tools: pre-damage vs current vs post-repair
3. Design repair sequence:
   - For each wound (priority order from triage):
     a. Root cause ID (why broke?)
     b. Repair approach (fix cause not just symptom)
     c. Verification method (confirm worked)
     d. Regression check (break anything else?)
4. ID scar tissue risk:
   - Repairs under pressure often introduce scar tissue (workarounds, special cases, tech debt)
   - Plan scar mgmt (Step 5) from start

→ Repair env w/ diagnostic capability, sequenced plan, scar awareness.

If err: setting proper repair env too slow (urgency demands immediate prod changes) → apply directly w/ extreme discipline: one change at a time, tested by available means, rolled back if no help.

### Step 4: Execute Progressive Rebuild

Repair systematically, verify each fix before next.

1. For each wound (triage priority order):
   a. ID root cause:
      - Code bug? Config err? Data corruption? Dep fail?
      - Symptom of deeper structural problem?
      - Fixing cause also addresses other wounds?
   b. Implement repair:
      - Fix root cause not just symptom
      - Can't fix cause immediately → deliberate workaround + document
      - Keep minimal — fix what's broken, no refactor neighborhood
   c. Verify:
      - Specific damaged fn works correctly now?
      - Pass auto tests?
      - Overall health improved or unchanged?
   d. Regression check:
      - Break anything else?
      - Emergency patches Step 2 still needed, or remove?
2. After all critical + serious repaired:
   - Remove emergency patches no longer needed
   - Restore disabled features
   - Return traffic normal routing
3. Schedule moderate + minor repairs:
   - Enter normal dev workflow
   - Track to completion (no "accepted" damage)

→ Critical + serious wounds repaired w/ verified fixes. Emergency patches removed. System restored to functional.

If err: repair attempt fails or causes regression → rollback prev state + reassess. Multi attempts fail same wound → damage too deep for local repair → consider component needs full replacement not repair (see `dissolve-form`).

### Step 5: Manage Scar + Strengthen

Address workarounds + shortcuts from emergency repair, strengthen vs recurrence.

1. Inventory scar:
   - Emergency patches became permanent
   - Workarounds never replaced w/ proper fixes
   - Special cases for damage-related edges
   - Disabled features never re-enabled
2. For each scar piece, decide:
   - **Remove**: workaround no longer needed (damage fully repaired)
   - **Replace**: workaround real need, impl proper
   - **Accept**: most practical long-term (rare, document why)
3. Strengthen vs recurrence:
   - Root cause analysis: why did damage occur?
   - Prevention: what would have prevented? (monitoring, testing, arch change)
   - Detection: how detect faster next time? (alerts, health checks)
   - Recovery: how recover faster? (runbooks, backup procs, automation)
4. Update immune memory:
   - Add incident pattern to monitoring + alerting (see `defend-colony` immune memory)
   - Update runbooks w/ working repair proc
   - Share learnings across team/org

→ Scar managed (removed/replaced/accepted documented). System repaired + more resilient than pre-damage. Learnings captured for future.

If err: scar mgmt deprioritized ("works, don't touch") → schedule explicit. Unmanaged scar accumulates + eventually contributes next incident. Root cause unidentifiable → strengthen detection + recovery speed as compensating controls.

## Check

- [ ] All damage inventoried + classified by severity
- [ ] Emergency stabilization stopped spread
- [ ] Evidence preserved for root cause
- [ ] Critical + serious wounds repaired w/ verified fixes
- [ ] Emergency patches removed after proper repair
- [ ] Scar inventoried + managed (removed/replaced/documented)
- [ ] Root cause analysis IDs prevention + detection improvements
- [ ] System resilience improved vs pre-damage

## Traps

- **Repair w/o stabilize**: Fix root cause while system actively bleeding. Stabilize first, then repair. Tourniquets before surgery.
- **Permanent emergency patches**: Emergency measures becoming permanent → compounding tech debt. Always follow w/ proper repair.
- **Root cause assumption**: Assume root cause known w/o investigation. Many "obvious" causes are symptoms of deeper issues. Investigate before committing strategy.
- **Repair-induced damage**: Rush repairs w/o testing → new wounds. One verified fix per iter — never batch untested.
- **Ignore scar**: "Works now" ≠ "healthy". Scar from hasty repairs = seed of next incident.

## →

- `assess-form` — damage assess shares methodology w/ form assess
- `adapt-architecture` — arch adaptation needed if damage reveals structural weakness
- `dissolve-form` — components too damaged to repair → dissolve + rebuild
- `defend-colony` — defense triggers repair; post-incident recovery feeds defense
- `shift-camouflage` — surface adaptation masks damage while repair proceeds (caution)
- `conduct-post-mortem` — structured post-incident analysis complements root cause
- `write-incident-runbook` — repair procs captured as runbooks for future
