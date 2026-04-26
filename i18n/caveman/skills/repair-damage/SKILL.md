---
name: repair-damage
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Implement regenerative recovery using triage, scaffolding, progressive
  rebuild. Cover damage assessment, wound classification, emergency
  stabilization, scar tissue management, resilience strengthening for
  systems that sustained structural damage. Use when system has suffered
  incident needing structured recovery, when failed transformation left
  system in damaged intermediate state, when accumulated technical debt
  caused partial failure, or when system functional but degraded and
  degradation worsening.
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

Implement regenerative recovery for systems that sustained structural damage — from incidents, failed migrations, accumulated neglect, or external disruption. Uses biological wound-healing as framework: triage, stabilization, scaffolding, progressive rebuild, scar tissue management.

## When Use

- System suffered incident, needs structured recovery beyond "just fix it"
- Failed transformation (see `adapt-architecture`) left system in damaged intermediate state
- Accumulated technical debt caused partial system failure
- Organizational damage (team departures, knowledge loss, morale collapse) needs structured repair
- Post-defense recovery (see `defend-colony`) when colony sustained damage
- System functional but degraded, and degradation worsening

## Inputs

- **Required**: Description of damage (what broke, when, how severely)
- **Required**: Current system state (what is still working, what is not)
- **Optional**: Root cause (if known — may not be clear yet)
- **Optional**: Pre-damage system state (for comparison)
- **Optional**: Available repair resources (time, people, budget)
- **Optional**: Urgency (system actively degrading or stable-but-damaged?)

## Steps

### Step 1: Triage — Assess and Classify Wounds

Rapidly assess all damage. Classify by severity and urgency.

1. Catalog every known point of damage:
   - What specific component, function, or capability affected?
   - Damage complete (non-functional) or partial (degraded)?
   - Damage spreading (affecting adjacent components) or contained?
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
   - Critical wounds first (stop the bleeding)
   - Then serious wounds (restore important function)
   - Moderate and minor wounds can wait for scheduled repair
4. Check for wound interaction:
   - Any wounds amplify each other? (A worse because B also broken)
   - Fixing one wound auto-fix others? (shared root cause)
   - Fixing one wound make another worse? (competing repair strategies)

**Got:** Complete wound inventory classified by severity, with prioritized repair order accounting for wound interactions.

**If fail:** Triage takes too long (system actively degrading)? Skip detailed classification and focus on: "What is the single most critical thing to stabilize?" Fix that first, then return to full triage.

### Step 2: Emergency Stabilization

Stop damage from spreading before begin repair.

1. Contain wound:
   - Isolate damaged components (circuit breakers, network segmentation, traffic rerouting)
   - Prevent cascade: disable non-essential features that depend on damaged components
   - Preserve evidence: take snapshots, save logs, capture current state before any changes
2. Apply emergency patches:
   - These are not permanent fixes — they are tourniquets
   - Acceptable emergency measures:
     - Redirect traffic to healthy replica
     - Disable damaged feature entirely
     - Apply known-working configuration from backup
     - Scale up healthy components to absorb redirected load
   - Unacceptable emergency measures:
     - Modify code without testing (creates new wounds)
     - Delete data to "reset" the problem (destroys recovery options)
     - Hide damage (disabling alerts, suppressing errors)
3. Verify stabilization:
   - Damage still spreading? If yes, containment failed — try broader isolation
   - System functional (possibly degraded)? If yes, proceed to repair
   - Emergency patches holding? If yes, you have time for deliberate repair

**Got:** System stable (not actively degrading) even if degraded. Damage contained, not spreading. Evidence preserved for root cause analysis.

**If fail:** Stabilization fails (damage continues spreading despite containment)? Escalate to full system fallback: activate disaster recovery, switch to backup system, or gracefully degrade to minimal viable operation. Stabilization that takes too long becomes the disaster.

### Step 3: Build Repair Scaffolding

Construct temporary structures that support repair process.

1. Set up repair environment:
   - Branch or copy damaged system for repair work
   - Ensure repair changes can be tested before applying to production
   - Create rollback plan for each repair step
2. Build diagnostic infrastructure:
   - Enhanced monitoring on damaged areas (detect regression immediately)
   - Logging that captures repair process (what was changed, when, why)
   - Comparison tools: before-damage state vs current vs after-repair
3. Design repair sequence:
   - For each wound (in priority order from triage):
     a. Root cause identification (why did this break?)
     b. Repair approach (fix the cause, not just the symptom)
     c. Verification method (how to confirm repair worked)
     d. Regression check (did repair break anything else?)
4. ID scar tissue risk:
   - Repairs done under pressure often introduce scar tissue (workarounds, special cases, technical debt)
   - Plan for scar tissue management (Step 5) from the start

**Got:** Repair environment with diagnostic capability, sequenced repair plan, awareness of scar tissue risk.

**If fail:** Setting up proper repair environment too slow (system urgency demands immediate production changes)? Apply changes direct but with extreme discipline: one change at a time, tested by available means, rolled back if no help.

### Step 4: Execute Progressive Rebuild

Repair damage systematic. Verify each fix before proceed.

1. For each wound (in triage priority order):
   a. ID root cause:
      - Code bug? Configuration error? Data corruption? Dependency failure?
      - Symptom of deeper structural problem?
      - Fixing root cause would also address other wounds?
   b. Implement repair:
      - Fix root cause, not just symptom
      - Root cause cannot be fixed immediately? Implement deliberate workaround and document it
      - Keep repairs minimal — fix what is broken, no refactor the neighborhood
   c. Verify repair:
      - Specific damaged function works correctly now?
      - Repair passes automated tests?
      - System overall health improved or at least unchanged?
   d. Check for regression:
      - Did this repair break anything else?
      - Emergency patches from Step 2 still needed, or can some be removed?
2. After all critical and serious wounds repaired:
   - Remove emergency patches no longer needed
   - Restore disabled features
   - Return traffic to normal routing
3. Schedule moderate and minor wound repairs:
   - These enter normal development workflow
   - Track them to completion (don't let them become "accepted" damage)

**Got:** Critical and serious wounds repaired with verified fixes. Emergency patches removed. System restored to functional operation.

**If fail:** Repair attempt fails or causes regression? Roll back to previous state and reassess. Multiple repair attempts fail for same wound? Damage may be too deep for local repair — consider whether affected component needs full replacement rather than repair (see `dissolve-form`).

### Step 5: Manage Scar Tissue and Strengthen

Address workarounds and shortcuts introduced during emergency repair. Strengthen against recurrence.

1. Inventory scar tissue:
   - Emergency patches that became permanent
   - Workarounds never replaced with proper fixes
   - Special cases added to handle damage-related edge cases
   - Disabled features never re-enabled
2. For each piece of scar tissue, decide:
   - **Remove**: workaround no longer needed (damage fully repaired)
   - **Replace**: workaround addresses real need but should be implemented properly
   - **Accept**: workaround is most practical long-term solution (rare, document why)
3. Strengthen against recurrence:
   - Root cause analysis: why did this damage occur?
   - Prevention: what would have prevented it? (monitoring, testing, architecture change)
   - Detection: how could we detect this faster next time? (alerts, health checks)
   - Recovery: how could we recover faster? (runbooks, backup procedures, automation)
4. Update immune memory:
   - Add incident pattern to monitoring and alerting (see `defend-colony` immune memory)
   - Update runbooks with repair procedure that worked
   - Share learnings across team/organization

**Got:** Scar tissue managed (removed, replaced, or accepted with documentation). System not only repaired but more resilient than before damage. Learnings captured for future incidents.

**If fail:** Scar tissue management deprioritized ("it works, don't touch it")? Schedule it explicit. Unmanaged scar tissue accumulates and eventually contributes to next incident. Root cause cannot be identified? Strengthen detection and recovery speed as compensating controls.

## Checks

- [ ] All damage inventoried and classified by severity
- [ ] Emergency stabilization stopped spread of damage
- [ ] Evidence preserved for root cause analysis
- [ ] Critical and serious wounds repaired with verified fixes
- [ ] Emergency patches removed after proper repair
- [ ] Scar tissue inventoried and managed (removed, replaced, or documented)
- [ ] Root cause analysis IDs prevention and detection improvements
- [ ] System resilience improved compared to pre-damage state

## Pitfalls

- **Repair without stabilize**: Attempt to fix root cause while system actively bleeding. Stabilize first, then repair. Tourniquets before surgery
- **Permanent emergency patches**: Emergency measures that become permanent solution create compounding technical debt. Always follow up with proper repair
- **Root cause assumption**: Assume root cause known without investigation. Many "obvious" causes are symptoms of deeper issues. Investigate before commit to repair strategy
- **Repair-induced damage**: Rush repairs without testing creates new wounds. One verified fix per iteration — never batch untested changes
- **Ignore scar tissue**: "It works now" is not same as "it's healthy." Scar tissue from hasty repairs = seed of next incident

## See Also

- `assess-form` — damage assessment shares methodology with form assessment
- `adapt-architecture` — architectural adaptation may be needed if damage reveals structural weakness
- `dissolve-form` — for components too damaged to repair; dissolve and rebuild
- `defend-colony` — defense triggers repair; post-incident recovery feeds back into defense
- `shift-camouflage` — surface adaptation can mask damage while repair proceeds (with caution)
- `conduct-post-mortem` — structured post-incident analysis complements root cause identification
- `write-incident-runbook` — repair procedures should be captured as runbooks for future incidents
