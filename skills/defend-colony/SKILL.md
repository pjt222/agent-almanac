---
name: defend-colony
description: >
  Implement layered collective defense using alarm signaling, role mobilization,
  and proportional response. Covers threat detection, alert propagation, immune
  response patterns, escalation tiers, and post-incident recovery for distributed
  systems and organizations. Use when designing defense-in-depth where no single
  guardian covers all threats, building incident response that scales with severity,
  or when current defense is over-reactive to every alert or under-reactive to
  genuine threats.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, defense, immune-response, threat-detection
---

# Defend Colony

Implement layered collective defense for distributed systems, teams, or organizations — using alarm signaling, role mobilization, proportional response, and immune memory patterns inspired by social insect colony defense and biological immune systems.

## When to Use

- Designing defense-in-depth for distributed systems where no single guardian can cover all threats
- Building incident response processes that scale with threat severity
- Protecting a system where individual components cannot defend themselves alone
- Current defense is either over-reactive (every alert triggers full mobilization) or under-reactive (threats go unnoticed until damage is done)
- Building organizational resilience where teams must self-organize in response to incidents
- Complementing `coordinate-swarm` with specific threat-response coordination patterns

## Inputs

- **Required**: Description of the colony (system, organization, team) to be defended
- **Required**: Known threat categories (attacks, failures, competitors, environmental risks)
- **Optional**: Current defense mechanisms and their failure modes
- **Optional**: Available defender types and their capabilities
- **Optional**: Acceptable response latency per threat tier
- **Optional**: Post-incident recovery requirements

## Procedure

### Step 1: Map the Threat Landscape and Defense Perimeter

Identify what needs defending, from what, and where the perimeter lies.

1. Define the colony's critical assets:
   - What must be protected at all costs? (core data, production systems, key people)
   - What can sustain temporary damage? (staging environments, non-critical services)
   - What is expendable under extreme threat? (caches, replicas, non-essential features)
2. Classify threats by type and severity:
   - **Probes**: low-level reconnaissance or testing (port scans, repeated failed logins)
   - **Incursions**: active boundary violations (unauthorized access, injection attempts)
   - **Infestations**: persistent threats already inside the perimeter (compromised nodes, insider threats)
   - **Existential**: threats to the colony's survival (data corruption, catastrophic failure, DDoS)
3. Map the defense perimeter:
   - Outer perimeter: first detection opportunity (firewalls, rate limits, monitoring)
   - Inner perimeter: critical asset boundaries (access controls, encryption, isolation)
   - Core: last-resort defenses (backups, kill switches, circuit breakers)

**Expected:** A clear map of assets (prioritized), threats (classified by severity), and defense perimeters (layered). This map guides all subsequent defense design.

**On failure:** If the threat landscape feels overwhelming, start with the top 3 critical assets and the top 3 threat types. Perfect coverage is less important than coverage of what matters most. If perimeter boundaries are unclear, default to "trust nothing, verify everything" (zero-trust posture) and define boundaries as you observe actual traffic patterns.

### Step 2: Design the Alarm Signaling Network

Build the communication system that detects threats and propagates alerts.

1. Deploy sentinels at each defense layer:
   - Outer sentinels: lightweight, high-sensitivity detectors (may produce false positives)
   - Inner sentinels: heavier, high-specificity detectors (fewer false positives, slower)
   - Core sentinels: critical asset monitors (zero tolerance for missed threats)
2. Define alarm signals with graduated intensity:
   - **Yellow**: anomaly detected, increased monitoring, no mobilization
   - **Orange**: confirmed threat pattern, local defenders mobilize, scouts investigate
   - **Red**: active breach or severe threat, full defense mobilization, non-essential activity paused
   - **Black**: existential threat, all resources to defense, sacrifice expendable assets if needed
3. Implement alarm propagation:
   - Local: sentinels alert nearby defenders directly
   - Regional: sentinel clusters aggregate signals and escalate if threshold is met
   - Colony-wide: regional escalation triggers broadcast alarm
   - Each propagation step adds confirmation — a single sentinel cannot trigger colony-wide alarm
4. Build in alarm fatigue prevention:
   - Auto-suppress repeated identical alarms (dedup with time window)
   - Require escalation to be confirmed by independent sentinels
   - Track alarm-to-threat ratio — if false positive rate exceeds 50%, recalibrate sentinels

```
Alarm Propagation:
┌──────────────────────────────────────────────────────────┐
│ Sentinel detects anomaly ──→ Yellow alert (local)        │
│        │                                                 │
│        ↓ (confirmed by 2nd sentinel)                     │
│ Orange alert ──→ Local defenders mobilize                │
│        │                                                 │
│        ↓ (pattern matches known threat + 3rd sentinel)   │
│ Red alert ──→ Full defense mobilization                  │
│        │                                                 │
│        ↓ (critical asset under active attack)            │
│ Black alert ──→ All resources to defense, circuit break  │
└──────────────────────────────────────────────────────────┘
```

**Expected:** A graduated alarm system where threat severity determines response intensity. Multiple independent sentinel confirmations prevent single-point false alarms. Alarm fatigue is managed through deduplication and calibration.

**On failure:** If the alarm system produces too many false positives, raise sentinel thresholds or require more confirmations before escalation. If threats slip through undetected, add sentinels at the penetrated layer or lower detection thresholds. If alarm propagation is too slow, reduce the confirmation requirements — but accept higher false positive rate as the tradeoff.

### Step 3: Mobilize Role-Based Defenders

Assign defense roles and mobilization protocols proportional to threat level.

1. Define defender roles:
   - **Sentinels**: detection specialists (always active, low resource cost)
   - **Guards**: first responders (idle until mobilized, fast response)
   - **Soldiers**: heavy defenders (expensive to mobilize, high capability)
   - **Healers**: damage repair and recovery specialists (see `repair-damage`)
   - **Messengers**: coordinate defense across colony regions
2. Map roles to alert levels:
   - Yellow: sentinels increase monitoring frequency, guards on standby
   - Orange: guards mobilize to threat location, soldiers on standby
   - Red: soldiers mobilize, non-essential workers reassigned to defense
   - Black: all roles to defense, colony activities suspended
3. Implement proportional response:
   - Never deploy soldiers for a probe (wasteful and reveals capabilities)
   - Never rely only on sentinels against an incursion (insufficient response)
   - Match the response to the threat tier — escalate if the current tier fails, de-escalate when the threat recedes
4. Role transition protocol:
   - Workers can become guards (temporary upskilling for emergency)
   - Guards can become soldiers (sustained threat requires heavier response)
   - After threat passes, reverse transitions restore normal operations

**Expected:** A defense force that scales with threat severity. Normal operations use minimal defense resources. Under threat, the colony can rapidly mobilize proportional defense without over-reacting or under-reacting.

**On failure:** If mobilization is too slow, pre-position guards closer to known threat vectors. If mobilization is too expensive, reduce the permanent guard force and rely more on worker-to-guard transitions. If role confusion occurs during mobilization, simplify to 3 roles (detect, respond, recover) instead of 5.

### Step 4: Execute Immune Memory and Adaptation

Learn from each threat encounter to improve future defense.

1. After each incident, create a threat signature:
   - Attack pattern (how the threat was detected)
   - Attack vector (where it entered)
   - Effective response (what stopped it)
   - Failed response (what didn't work)
2. Store signatures in the colony's immune memory:
   - Fast-lookup pattern library for sentinels
   - Updated defender playbooks with known-effective responses
   - Flagged false-positive patterns to reduce future alarm fatigue
3. Implement adaptive immunity:
   - New threat signatures are propagated to all sentinels (colony-wide learning)
   - Sentinels that detected the threat get priority updates (local learning)
   - Periodic review culls outdated signatures (threats that no longer apply)
4. Stress test the immune memory:
   - Re-simulate past threats periodically to verify defenses still work
   - Red team exercises introduce novel threats to test adaptation
   - Measure detection time for known vs. unknown threats

**Expected:** A defense system that gets stronger with each encounter. Known threats are detected faster and responded to more effectively. Novel threats are handled by the graduated alarm system, and their resolution adds to the immune memory.

**On failure:** If immune memory grows too large and slows detection, prioritize signatures by frequency and severity, archiving rare/minor threats. If the defense becomes too specialized against known threats and misses novel ones, maintain a "general patrol" function that doesn't rely on pattern matching — pure anomaly detection as the baseline.

### Step 5: Coordinate Post-Incident Recovery

Transition from defense mode back to normal operations with damage repair and resilience improvement.

1. Threat elimination verification:
   - Confirm the threat is neutralized (not just suppressed)
   - Scan for secondary threats that may have entered during the primary incident
   - Verify no compromised agents remain active
2. Damage assessment:
   - Catalog what was damaged, degraded, or lost
   - Prioritize repair by criticality (core assets first)
   - Estimate recovery time and resources needed
3. Recovery execution:
   - Deploy healers to damaged areas (see `repair-damage` for detailed recovery)
   - Restore services in priority order
   - Maintain elevated sentinel activity during recovery (vulnerable period)
4. De-escalation protocol:
   - Step down alert levels gradually (Red → Orange → Yellow → Normal)
   - Return reassigned workers to their primary roles
   - Stand down soldiers and return guards to patrol
   - Post-incident review within 24 hours while memory is fresh

**Expected:** A smooth transition from defense to recovery to normal operations. Elevated monitoring during recovery catches secondary threats. The post-incident review feeds learnings into immune memory.

**On failure:** If recovery is too slow, pre-build recovery playbooks for the most likely damage scenarios. If secondary threats emerge during recovery, the de-escalation was too aggressive — maintain higher alert levels for longer. If post-incident review is skipped (common under time pressure), schedule it as a non-negotiable calendar event.

## Validation

- [ ] Critical assets are identified and prioritized
- [ ] Threats are classified by type and severity
- [ ] Defense perimeter has multiple layers with sentinels at each
- [ ] Alarm signaling has graduated levels with multi-sentinel confirmation
- [ ] Defender roles are defined with mobilization mapped to alert levels
- [ ] Proportional response prevents over- and under-reaction
- [ ] Immune memory captures and applies lessons from each incident
- [ ] Post-incident recovery protocol restores normal operations safely

## Common Pitfalls

- **Maginot Line defense**: Over-investing in a single defense layer while leaving others unprotected. Defense must be layered — any single layer can be breached
- **Alert fatigue**: Too many alarms with too few real threats degrades defender attention. Calibrate sentinels ruthlessly; a missed false positive is cheaper than a missed real threat
- **Symmetric response**: Responding to every threat with the same intensity wastes resources and reveals your full capabilities. Match response to threat — escalate only when needed
- **No immune memory**: Defending against the same threat type repeatedly without learning is expensive and fragile. Every incident must update the colony's defense knowledge
- **Permanent war footing**: Sustained high-alert operations exhaust defenders and degrade normal colony function. De-escalate deliberately when the threat passes

## Related Skills

- `coordinate-swarm` — foundational coordination patterns that support alarm signaling and mobilization
- `build-consensus` — rapid consensus for collective defense decisions under time pressure
- `scale-colony` — defense systems must scale with colony growth
- `repair-damage` — morphic skill for regenerative recovery after defense incidents
- `configure-alerting-rules` — practical alerting configuration that implements alarm signaling patterns
- `conduct-post-mortem` — structured post-incident analysis for feeding immune memory
