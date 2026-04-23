---
name: defend-colony
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Build layered collective defense for distributed systems, teams, organizations. Alarm signaling, role mobilization, proportional response, immune memory patterns. Inspired by social insect colony defense and biological immune systems.

## When Use

- Designing defense-in-depth for distributed systems where no single guardian covers all threats
- Building incident response scaling with threat severity
- Protecting system where individual components cannot defend alone
- Current defense either over-reactive (every alert triggers full mobilization) or under-reactive (threats go unnoticed until damage done)
- Building organizational resilience where teams must self-organize in response to incidents
- Complementing `coordinate-swarm` with specific threat-response coordination patterns

## Inputs

- **Required**: Description of colony (system, organization, team) to defend
- **Required**: Known threat categories (attacks, failures, competitors, environmental risks)
- **Optional**: Current defense mechanisms and failure modes
- **Optional**: Available defender types and capabilities
- **Optional**: Acceptable response latency per threat tier
- **Optional**: Post-incident recovery requirements

## Steps

### Step 1: Map the Threat Landscape and Defense Perimeter

Find what needs defending, from what, and where perimeter lies.

1. Define colony's critical assets:
   - What must be protected at all costs? (core data, production systems, key people)
   - What can sustain temporary damage? (staging environments, non-critical services)
   - What is expendable under extreme threat? (caches, replicas, non-essential features)
2. Classify threats by type and severity:
   - **Probes**: low-level reconnaissance or testing (port scans, repeated failed logins)
   - **Incursions**: active boundary violations (unauthorized access, injection attempts)
   - **Infestations**: persistent threats already inside perimeter (compromised nodes, insider threats)
   - **Existential**: threats to colony's survival (data corruption, catastrophic failure, DDoS)
3. Map defense perimeter:
   - Outer perimeter: first detection opportunity (firewalls, rate limits, monitoring)
   - Inner perimeter: critical asset boundaries (access controls, encryption, isolation)
   - Core: last-resort defenses (backups, kill switches, circuit breakers)

**Got:** Clear map of assets (prioritized), threats (classified by severity), defense perimeters (layered). Map guides all later defense design.

**If fail:** Threat landscape feels overwhelming? Start with top 3 critical assets and top 3 threat types. Perfect coverage less important than coverage of what matters most. Perimeter boundaries unclear? Default to "trust nothing, verify everything" (zero-trust posture). Define boundaries as you see actual traffic patterns.

### Step 2: Design the Alarm Signaling Network

Build communication system that detects threats and propagates alerts.

1. Deploy sentinels at each defense layer:
   - Outer sentinels: lightweight, high-sensitivity detectors (may produce false positives)
   - Inner sentinels: heavier, high-specificity detectors (fewer false positives, slower)
   - Core sentinels: critical asset monitors (zero tolerance for missed threats)
2. Define alarm signals with graduated intensity:
   - **Yellow**: anomaly detected, more monitoring, no mobilization
   - **Orange**: confirmed threat pattern, local defenders mobilize, scouts investigate
   - **Red**: active breach or severe threat, full defense mobilization, non-essential activity paused
   - **Black**: existential threat, all resources to defense, sacrifice expendable assets if needed
3. Implement alarm propagation:
   - Local: sentinels alert nearby defenders directly
   - Regional: sentinel clusters aggregate signals and escalate if threshold met
   - Colony-wide: regional escalation triggers broadcast alarm
   - Each propagation step adds confirmation — single sentinel cannot trigger colony-wide alarm
4. Build in alarm fatigue prevention:
   - Auto-suppress repeated identical alarms (dedup with time window)
   - Require escalation to be confirmed by independent sentinels
   - Track alarm-to-threat ratio — false positive rate exceeds 50% → recalibrate sentinels

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

**Got:** Graduated alarm system where threat severity drives response intensity. Multiple independent sentinel confirmations stop single-point false alarms. Alarm fatigue managed through deduplication and calibration.

**If fail:** Alarm system produces too many false positives? Raise sentinel thresholds or require more confirmations before escalation. Threats slip through undetected? Add sentinels at penetrated layer or lower detection thresholds. Alarm propagation too slow? Cut confirmation requirements — but accept higher false positive rate as tradeoff.

### Step 3: Mobilize Role-Based Defenders

Assign defense roles and mobilization protocols proportional to threat level.

1. Define defender roles:
   - **Sentinels**: detection specialists (always active, low resource cost)
   - **Guards**: first responders (idle until mobilized, fast response)
   - **Soldiers**: heavy defenders (expensive to mobilize, high capability)
   - **Healers**: damage repair and recovery specialists (see `repair-damage`)
   - **Messengers**: coordinate defense across colony regions
2. Map roles to alert levels:
   - Yellow: sentinels bump monitoring frequency, guards on standby
   - Orange: guards mobilize to threat location, soldiers on standby
   - Red: soldiers mobilize, non-essential workers reassigned to defense
   - Black: all roles to defense, colony activities suspended
3. Implement proportional response:
   - Never deploy soldiers for probe (wasteful and reveals capabilities)
   - Never rely only on sentinels against incursion (weak response)
   - Match response to threat tier — escalate if current tier fails, de-escalate when threat recedes
4. Role transition protocol:
   - Workers can become guards (temporary upskilling for emergency)
   - Guards can become soldiers (sustained threat needs heavier response)
   - After threat passes, reverse transitions restore normal operations

**Got:** Defense force scaling with threat severity. Normal operations use minimal defense resources. Under threat, colony can rapidly mobilize proportional defense without over-reacting or under-reacting.

**If fail:** Mobilization too slow? Pre-position guards closer to known threat vectors. Mobilization too expensive? Cut permanent guard force and rely more on worker-to-guard transitions. Role confusion during mobilization? Simplify to 3 roles (detect, respond, recover) instead of 5.

### Step 4: Execute Immune Memory and Adaptation

Learn from each threat encounter to improve future defense.

1. After each incident, create threat signature:
   - Attack pattern (how threat was detected)
   - Attack vector (where it entered)
   - Effective response (what stopped it)
   - Failed response (what didn't work)
2. Store signatures in colony's immune memory:
   - Fast-lookup pattern library for sentinels
   - Updated defender playbooks with known-effective responses
   - Flagged false-positive patterns to cut future alarm fatigue
3. Implement adaptive immunity:
   - New threat signatures propagate to all sentinels (colony-wide learning)
   - Sentinels detecting threat get priority updates (local learning)
   - Periodic review culls outdated signatures (threats that no longer apply)
4. Stress test immune memory:
   - Re-simulate past threats periodically to verify defenses still work
   - Red team exercises introduce novel threats to test adaptation
   - Measure detection time for known vs. unknown threats

**Got:** Defense system growing stronger with each encounter. Known threats detected faster, responded to more effectively. Novel threats handled by graduated alarm system. Their resolution adds to immune memory.

**If fail:** Immune memory grows too large and slows detection? Prioritize signatures by frequency and severity. Archive rare/minor threats. Defense becomes too specialized against known threats and misses novel ones? Keep "general patrol" function not relying on pattern matching — pure anomaly detection as baseline.

### Step 5: Coordinate Post-Incident Recovery

Switch from defense mode back to normal operations with damage repair and resilience improvement.

1. Threat elimination verification:
   - Confirm threat neutralized (not just suppressed)
   - Scan for secondary threats that may have entered during primary incident
   - Verify no compromised agents remain active
2. Damage assessment:
   - Catalog what was damaged, degraded, lost
   - Prioritize repair by criticality (core assets first)
   - Estimate recovery time and resources needed
3. Recovery execution:
   - Deploy healers to damaged areas (see `repair-damage` for detailed recovery)
   - Restore services in priority order
   - Keep elevated sentinel activity during recovery (vulnerable period)
4. De-escalation protocol:
   - Step down alert levels gradually (Red → Orange → Yellow → Normal)
   - Return reassigned workers to primary roles
   - Stand down soldiers and return guards to patrol
   - Post-incident review within 24 hours while memory is fresh

**Got:** Smooth transition from defense to recovery to normal operations. Elevated monitoring during recovery catches secondary threats. Post-incident review feeds learnings into immune memory.

**If fail:** Recovery too slow? Pre-build recovery playbooks for most likely damage scenarios. Secondary threats emerge during recovery? De-escalation too aggressive — keep higher alert levels for longer. Post-incident review skipped (common under time pressure)? Schedule as non-negotiable calendar event.

## Checks

- [ ] Critical assets identified and prioritized
- [ ] Threats classified by type and severity
- [ ] Defense perimeter has many layers with sentinels at each
- [ ] Alarm signaling has graduated levels with multi-sentinel confirmation
- [ ] Defender roles defined with mobilization mapped to alert levels
- [ ] Proportional response stops over- and under-reaction
- [ ] Immune memory captures and applies lessons from each incident
- [ ] Post-incident recovery protocol restores normal operations safely

## Pitfalls

- **Maginot Line defense**: Over-investing in single defense layer while leaving others unprotected. Defense must be layered — any single layer can be breached
- **Alert fatigue**: Too many alarms with too few real threats degrades defender attention. Calibrate sentinels ruthlessly. Missed false positive cheaper than missed real threat
- **Symmetric response**: Responding to every threat with same intensity wastes resources and reveals your full capabilities. Match response to threat. Escalate only when needed
- **No immune memory**: Defending against same threat type over and over without learning is expensive and fragile. Every incident must update colony's defense knowledge
- **Permanent war footing**: Sustained high-alert operations exhaust defenders and degrade normal colony function. De-escalate deliberately when threat passes

## See Also

- `coordinate-swarm` — foundational coordination patterns supporting alarm signaling and mobilization
- `build-consensus` — rapid consensus for collective defense decisions under time pressure
- `scale-colony` — defense systems must scale with colony growth
- `repair-damage` — morphic skill for regenerative recovery after defense incidents
- `configure-alerting-rules` — practical alerting configuration implementing alarm signaling patterns
- `conduct-post-mortem` — structured post-incident analysis for feeding immune memory
