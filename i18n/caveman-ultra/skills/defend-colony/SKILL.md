---
name: defend-colony
locale: caveman-ultra
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

Layered collective defense: alarm signal + role mobilize + proportional response + immune memory. Inspired by social insect + biological immune sys.

## Use When

- Defense-in-depth, no single guardian covers all
- Incident response scales w/ severity
- Components can't defend alone
- Defense over-reactive (every alert = full mob) / under-reactive (threats unnoticed)
- Org resilience: teams self-org on incident
- Complement `coordinate-swarm` w/ threat-response patterns

## In

- **Required**: Colony desc (sys, org, team)
- **Required**: Threat cats (attacks, failures, competitors, env)
- **Optional**: Current defenses + fail modes
- **Optional**: Defender types + caps
- **Optional**: Latency per tier
- **Optional**: Recovery reqs

## Do

### Step 1: Threat Landscape + Perimeter

ID what to defend, from what, where perimeter.

1. Critical assets:
   - Protect all cost (core data, prod sys, key ppl)
   - Can sustain temp damage (staging, non-crit svcs)
   - Expendable under extreme (caches, replicas, non-essential)
2. Classify threats:
   - **Probes**: low-level recon (port scans, failed logins)
   - **Incursions**: active boundary violations (unauth access, injection)
   - **Infestations**: persistent inside (compromised nodes, insider)
   - **Existential**: survival threats (corruption, catastrophic fail, DDoS)
3. Perimeter:
   - Outer: first detection (firewalls, rate limits, monitoring)
   - Inner: critical asset boundaries (access ctrl, encryption, isolation)
   - Core: last-resort (backups, kill switches, circuit breakers)

**Got:** Map: assets prioritized + threats classified + perimeters layered.

**If err:** Overwhelming → top 3 critical assets + top 3 threat types. Coverage of what matters > perfect. Unclear boundaries → default zero-trust + define from actual traffic.

### Step 2: Alarm Network

Detection + alert propagation.

1. Sentinels per layer:
   - Outer: light, high-sens (may false+)
   - Inner: heavy, high-spec (fewer false+, slower)
   - Core: critical monitors (zero missed tolerance)
2. Graduated alarms:
   - **Yellow**: anomaly, increased monitor, no mob
   - **Orange**: confirmed pattern, local defenders mob, scouts investigate
   - **Red**: active breach / severe, full mob, non-essential paused
   - **Black**: existential, all → defense, sacrifice expendable if needed
3. Propagation:
   - Local: sentinels alert nearby directly
   - Regional: clusters aggregate + escalate if threshold met
   - Colony-wide: regional escalation → broadcast
   - Each step adds confirmation — single sentinel can't trigger colony-wide
4. Fatigue prevention:
   - Auto-suppress repeated identical (dedup w/ time window)
   - Req escalation confirmed by indep sentinels
   - Track alarm-to-threat ratio — FP >50% → recalibrate

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

**Got:** Graduated alarm, severity → response intensity. Multi-sentinel confirms prevent single FPs. Fatigue managed via dedup + calibration.

**If err:** Too many FPs → raise thresh / more confirms. Threats slip → add sentinels at breach layer / lower thresh. Too slow → reduce confirm reqs (accept higher FP).

### Step 3: Role-Based Defenders

Assign roles + mob protocols proportional to threat.

1. Roles:
   - **Sentinels**: detection (always active, low cost)
   - **Guards**: first responders (idle until mob, fast)
   - **Soldiers**: heavy (expensive mob, high cap)
   - **Healers**: repair + recovery (see `repair-damage`)
   - **Messengers**: coord across regions
2. Roles → alerts:
   - Yellow: sentinels ↑ monitor freq, guards standby
   - Orange: guards mob → threat loc, soldiers standby
   - Red: soldiers mob, non-essential → defense
   - Black: all → defense, colony activities suspended
3. Proportional:
   - Never soldiers for probe (waste + reveals caps)
   - Never only sentinels vs incursion (insufficient)
   - Match tier — escalate if fails, de-escalate when recedes
4. Role transitions:
   - Workers → guards (temp upskill emergency)
   - Guards → soldiers (sustained threat)
   - Post-threat → reverse transitions restore normal

**Got:** Force scales w/ severity. Normal = min defense. Under threat = rapid proportional mob, no over/under.

**If err:** Mob too slow → pre-position guards near known vectors. Too expensive → reduce permanent guards, rely on worker-to-guard. Role confusion → simplify to 3 (detect/respond/recover).

### Step 4: Immune Memory + Adaptation

Learn each encounter.

1. Per incident, threat signature:
   - Attack pattern (how detected)
   - Vector (where entered)
   - Effective response (what stopped)
   - Failed response (what didn't)
2. Store in immune memory:
   - Fast-lookup pattern lib for sentinels
   - Updated playbooks w/ known-effective
   - Flagged FP patterns → reduce future fatigue
3. Adaptive immunity:
   - New signatures → all sentinels (colony-wide learning)
   - Detecting sentinels get priority updates (local)
   - Periodic review culls outdated
4. Stress test:
   - Re-sim past threats → verify defenses still work
   - Red team → novel threats test adaptation
   - Measure detection: known vs unknown

**Got:** Defense gets stronger per encounter. Known = faster detect + better response. Novel = graduated alarm, resolution → memory.

**If err:** Memory too large → prioritize by freq + severity, archive rare/minor. Too specialized, misses novel → keep "general patrol" (anomaly detection, no pattern match).

### Step 5: Post-Incident Recovery

Defense → normal w/ repair + resilience.

1. Threat elim verify:
   - Confirm neutralized (not just suppressed)
   - Scan secondaries during primary
   - Verify no compromised agents remain
2. Damage assess:
   - Catalog damaged/degraded/lost
   - Priority by criticality (core first)
   - Estimate recovery time + resources
3. Recovery:
   - Healers → damaged (see `repair-damage`)
   - Restore svcs in priority
   - Elevated sentinel during recovery (vulnerable period)
4. De-escalate:
   - Step down (Red → Orange → Yellow → Normal)
   - Reassigned workers → primary roles
   - Stand down soldiers, guards → patrol
   - Post-incident review <24h (fresh memory)

**Got:** Smooth defense → recovery → normal. Elevated monitor catches secondaries. Review feeds memory.

**If err:** Slow recovery → pre-build playbooks for likely damage. Secondaries during recovery → de-esc too aggressive, keep higher alert longer. Review skipped (time pressure) → schedule non-negotiable.

## Check

- [ ] Critical assets ID'd + prioritized
- [ ] Threats classified (type + severity)
- [ ] Perimeter layered + sentinels per layer
- [ ] Alarm graduated + multi-sentinel confirm
- [ ] Roles defined + mob → alerts
- [ ] Proportional prevents over/under
- [ ] Memory captures + applies lessons
- [ ] Recovery restores safely

## Traps

- **Maginot Line**: Over-invest 1 layer, others unprotected. Layered — any single can breach.
- **Alert fatigue**: Many alarms, few real → degrades attention. Calibrate ruthless; missed FP cheaper than missed real.
- **Symmetric response**: Same intensity always → wastes + reveals caps. Match — escalate only when needed.
- **No immune memory**: Repeated same threat, no learning → expensive + fragile. Every incident → update knowledge.
- **Permanent war footing**: Sustained high-alert → exhausts + degrades normal. De-esc deliberate when threat passes.

## →

- `coordinate-swarm` — foundational coord patterns supporting alarm + mob
- `build-consensus` — rapid consensus for collective defense under pressure
- `scale-colony` — defense scales w/ growth
- `repair-damage` — morphic regenerative recovery
- `configure-alerting-rules` — practical alerting impl
- `conduct-post-mortem` — structured analysis → feeds memory
