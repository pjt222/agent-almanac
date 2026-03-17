---
name: defend-colony
description: >
  Implementieren layered collective defense using alarm signaling, role mobilization,
  and proportional response. Umfasst threat detection, alert propagation, immune
  response patterns, escalation tiers, and post-incident recovery for distributed
  systems and organizations. Verwenden wenn designing defense-in-depth where no single
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Kolonie verteidigen

Implementieren layered collective defense for distributed systems, teams, or organizations — using alarm signaling, role mobilization, proportional response, and immune memory patterns inspired by social insect colony defense and biological immune systems.

## Wann verwenden

- Designing defense-in-depth for distributed systems where no single guardian can cover all threats
- Building incident response processes that scale with threat severity
- Protecting a system where individual components cannot defend themselves alone
- Current defense is either over-reactive (every alert triggers full mobilization) or under-reactive (threats go unnoticed until damage is done)
- Building organizational resilience where teams must self-organize in response to incidents
- Complementing `coordinate-swarm` with specific threat-response coordination patterns

## Eingaben

- **Erforderlich**: Description of the colony (system, organization, team) to be defended
- **Erforderlich**: Known threat categories (attacks, failures, competitors, environmental risks)
- **Optional**: Current defense mechanisms and their failure modes
- **Optional**: Available defender types and their capabilities
- **Optional**: Acceptable response latency per threat tier
- **Optional**: Post-incident recovery requirements

## Vorgehensweise

### Schritt 1: Abbilden the Threat Landscape and Defense Perimeter

Identifizieren what needs defending, from what, and where the perimeter lies.

1. Definieren the colony's critical assets:
   - What muss protected at all costs? (core data, production systems, key people)
   - What can sustain temporary damage? (staging environments, non-critical services)
   - What is expendable under extreme threat? (caches, replicas, non-essential features)
2. Classify threats by type and severity:
   - **Probes**: low-level reconnaissance or testing (port scans, repeated failed logins)
   - **Incursions**: active boundary violations (unauthorized access, injection attempts)
   - **Infestations**: persistent threats already inside the perimeter (compromised nodes, insider threats)
   - **Existential**: threats to the colony's survival (data corruption, catastrophic failure, DDoS)
3. Abbilden the defense perimeter:
   - Outer perimeter: first detection opportunity (firewalls, rate limits, monitoring)
   - Inner perimeter: critical asset boundaries (access controls, encryption, isolation)
   - Core: last-resort defenses (backups, kill switches, circuit breakers)

**Erwartet:** A clear map of assets (prioritized), threats (classified by severity), and defense perimeters (layered). This map guides all subsequent defense design.

**Bei Fehler:** If the threat landscape feels overwhelming, start with the top 3 critical assets and the top 3 threat types. Perfect coverage is less important than coverage of what matters most. If perimeter boundaries are unclear, default to "trust nothing, verify everything" (zero-trust posture) and define boundaries as you observe actual traffic patterns.

### Schritt 2: Entwerfen the Alarm Signaling Network

Erstellen the communication system that detects threats and propagates alerts.

1. Bereitstellen sentinels at each defense layer:
   - Outer sentinels: lightweight, high-sensitivity detectors (may produce false positives)
   - Inner sentinels: heavier, high-specificity detectors (fewer false positives, slower)
   - Core sentinels: critical asset monitors (zero tolerance for missed threats)
2. Definieren alarm signals with graduated intensity:
   - **Yellow**: anomaly detected, increased monitoring, no mobilization
   - **Orange**: confirmed threat pattern, local defenders mobilize, scouts investigate
   - **Red**: active breach or severe threat, full defense mobilization, non-essential activity paused
   - **Black**: existential threat, all resources to defense, sacrifice expendable assets if needed
3. Implementieren alarm propagation:
   - Local: sentinels alert nearby defenders directly
   - Regional: sentinel clusters aggregate signals and escalate if threshold is met
   - Colony-wide: regional escalation triggers broadcast alarm
   - Each propagation step adds confirmation — a single sentinel cannot trigger colony-wide alarm
4. Erstellen in alarm fatigue prevention:
   - Auto-suppress repeated identical alarms (dedup with time window)
   - Erfordern escalation to be confirmed by independent sentinels
   - Verfolgen alarm-to-threat ratio — if false positive rate exceeds 50%, recalibrate sentinels

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

**Erwartet:** A graduated alarm system where threat severity determines response intensity. Multiple independent sentinel confirmations prevent single-point false alarms. Alarm fatigue is managed durch deduplication and calibration.

**Bei Fehler:** If the alarm system produces too many false positives, raise sentinel thresholds or require more confirmations vor escalation. If threats slip durch undetected, add sentinels at the penetrated layer or lower detection thresholds. If alarm propagation is too slow, reduce the confirmation requirements — but accept higher false positive rate as the tradeoff.

### Schritt 3: Mobilize Role-Based Defenders

Zuweisen defense roles and mobilization protocols proportional to threat level.

1. Definieren defender roles:
   - **Sentinels**: detection specialists (always active, low resource cost)
   - **Guards**: first responders (idle until mobilized, fast response)
   - **Soldiers**: heavy defenders (expensive to mobilize, high capability)
   - **Healers**: damage repair and recovery specialists (see `repair-damage`)
   - **Messengers**: coordinate defense across colony regions
2. Abbilden roles to alert levels:
   - Yellow: sentinels increase monitoring frequency, guards on standby
   - Orange: guards mobilize to threat location, soldiers on standby
   - Red: soldiers mobilize, non-essential workers reassigned to defense
   - Black: all roles to defense, colony activities suspended
3. Implementieren proportional response:
   - Never deploy soldiers for a probe (wasteful and reveals capabilities)
   - Never rely only on sentinels gegen an incursion (insufficient response)
   - Match die Antwort to the threat tier — escalate if the current tier fails, de-escalate when the threat recedes
4. Role transition protocol:
   - Workers kanncome guards (temporary upskilling for emergency)
   - Guards kanncome soldiers (sustained threat requires heavier response)
   - After threat passes, reverse transitions restore normal operations

**Erwartet:** A defense force that scales with threat severity. Normal operations use minimal defense resources. Under threat, the colony can rapidly mobilize proportional defense ohne over-reacting or under-reacting.

**Bei Fehler:** If mobilization is too slow, pre-position guards closer to known threat vectors. If mobilization is too expensive, reduce the permanent guard force and rely more on worker-to-guard transitions. If role confusion occurs waehrend mobilization, simplify to 3 roles (detect, respond, recover) stattdessen of 5.

### Schritt 4: Ausfuehren Immune Memory and Adaptation

Lernen from each threat encounter to improve future defense.

1. After each incident, create a threat signature:
   - Attack pattern (how the threat was detected)
   - Attack vector (where it entered)
   - Effective response (what stopped it)
   - Failed response (what didn't work)
2. Speichern signatures in the colony's immune memory:
   - Fast-lookup pattern library for sentinels
   - Updated defender playbooks with known-effective responses
   - Flagged false-positive patterns to reduce future alarm fatigue
3. Implementieren adaptive immunity:
   - New threat signatures are propagated to all sentinels (colony-wide learning)
   - Sentinels that detected the threat get priority updates (local learning)
   - Periodic review culls outdated signatures (threats that no longer apply)
4. Stress test the immune memory:
   - Re-simulate past threats periodically to verify defenses still work
   - Red team exercises introduce novel threats to test adaptation
   - Messen detection time for known vs. unknown threats

**Erwartet:** A defense system that gets stronger with each encounter. Known threats are detected faster and responded to more effectively. Novel threats are handled by the graduated alarm system, and their resolution adds to the immune memory.

**Bei Fehler:** If immune memory grows too large and slows detection, prioritize signatures by frequency and severity, archiving rare/minor threats. If the defense becomes too specialized gegen known threats and misses novel ones, maintain a "general patrol" function that doesn't rely on pattern matching — pure anomaly detection as the baseline.

### Schritt 5: Coordinate Post-Incident Recovery

Transition from defense mode back to normal operations with damage repair and resilience improvement.

1. Threat elimination verification:
   - Bestaetigen the threat is neutralized (not just suppressed)
   - Scannen for secondary threats that may have entered waehrend the primary incident
   - Verifizieren no compromised agents remain active
2. Damage assessment:
   - Catalog what was damaged, degraded, or lost
   - Priorisieren repair by criticality (core assets first)
   - Schaetzen recovery time and resources needed
3. Recovery execution:
   - Bereitstellen healers to damaged areas (see `repair-damage` for detailed recovery)
   - Wiederherstellen services in priority order
   - Warten elevated sentinel activity waehrend recovery (vulnerable period)
4. De-escalation protocol:
   - Step down alert levels gradually (Red → Orange → Yellow → Normal)
   - Zurueckgeben reassigned workers to their primary roles
   - Stand down soldiers and return guards to patrol
   - Post-incident review innerhalb 24 hours while memory is fresh

**Erwartet:** A smooth transition from defense to recovery to normal operations. Elevated monitoring waehrend recovery catches secondary threats. The post-incident review feeds learnings into immune memory.

**Bei Fehler:** If recovery is too slow, pre-build recovery playbooks for the most likely damage scenarios. If secondary threats emerge waehrend recovery, the de-escalation was too aggressive — maintain higher alert levels for longer. If post-incident review is skipped (common under time pressure), schedule it as a non-negotiable calendar event.

## Validierung

- [ ] Critical assets are identified and prioritized
- [ ] Threats are classified by type and severity
- [ ] Defense perimeter has multiple layers with sentinels at each
- [ ] Alarm signaling has graduated levels with multi-sentinel confirmation
- [ ] Defender roles are defined with mobilization mapped to alert levels
- [ ] Proportional response prevents over- and under-reaction
- [ ] Immune memory captures and applies lessons from each incident
- [ ] Post-incident recovery protocol restores normal operations safely

## Haeufige Stolperfallen

- **Maginot Line defense**: Over-investing in a single defense layer while leaving others unprotected. Defense muss layered — any single layer kann breached
- **Alarmieren fatigue**: Too many alarms with too few real threats degrades defender attention. Kalibrieren sentinels ruthlessly; a missed false positive is cheaper than a missed real threat
- **Symmetric response**: Responding to every threat with the same intensity wastes resources and reveals your full capabilities. Match response to threat — escalate only when needed
- **No immune memory**: Defending gegen the same threat type repeatedly ohne learning is expensive and fragile. Every incident must update the colony's defense knowledge
- **Permanent war footing**: Sustained high-alert operations exhaust defenders and degrade normal colony function. De-escalate deliberately when the threat passes

## Verwandte Skills

- `coordinate-swarm` — foundational coordination patterns that support alarm signaling and mobilization
- `build-consensus` — rapid consensus for collective defense decisions under time pressure
- `scale-colony` — defense systems must scale with colony growth
- `repair-damage` — morphic skill for regenerative recovery nach defense incidents
- `configure-alerting-rules` — practical alerting configuration that implements alarm signaling patterns
- `conduct-post-mortem` — structured post-incident analysis for feeding immune memory
