---
name: observe-insect-behavior
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Conduct structured insect behavior observations using sampling protocols,
  ethogram categories, event recording, interaction logging, environmental
  context, and summary analysis. Covers focal animal sampling, scan sampling,
  all-occurrences sampling, and instantaneous sampling methods. Defines a
  standard insect ethogram with locomotion, feeding, grooming, mating,
  defense, communication, and rest categories. Includes timestamped event
  recording, intraspecific and interspecific interaction logging, environmental
  covariate documentation, and time budget analysis. Use when studying insect
  behavior for ecological research, documenting behavioral repertoires for
  a species, observing pollinator activity or predator-prey dynamics, or
  supporting conservation assessments with behavioral data.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, behavior, ethology, observation, ecology
---

# Observe Insect Behavior

Structured insect behavior obs: sampling protocols, ethograms, quantitative recording.

## Use When

- Insect behavior for ecological/entomological research
- Document behavioral repertoire @ site
- Pollinator activity on flowers
- Predator-prey / parasitoid behavior
- Conservation/management decisions
- Build ethological skills

## In

- **Required**: Focal insect or aggregation
- **Required**: Timing device (watch/phone/stopwatch)
- **Required**: Recording method (notebook/voice/data device)
- **Optional**: 10x hand lens (close obs)
- **Optional**: Binoculars (distant insects, dragonflies on patrol)
- **Optional**: Camera (video)
- **Optional**: Thermometer / hygrometer / weather station
- **Optional**: Pre-printed sheets / ethogram templates

## Do

### Step 1: Pick sampling protocol

Match Q + behavior. Each has strengths + biases.

```
Sampling Protocols:
+--------------------+------------------------------------------+
| Protocol           | Description and Best Use                 |
+--------------------+------------------------------------------+
| Focal animal       | Follow one individual continuously for   |
| sampling           | a fixed time period. Record all          |
|                    | behaviors as they occur.                 |
|                    | Best for: detailed behavioral sequences, |
|                    | time budgets, individual-level data.     |
|                    | Duration: 5-30 minutes per focal bout.   |
|                    | Bias: loses data when individual moves   |
|                    | out of sight.                            |
+--------------------+------------------------------------------+
| Scan sampling      | At fixed intervals (e.g., every 60       |
|                    | seconds), quickly scan all visible       |
|                    | individuals and record what each is      |
|                    | doing at that instant.                   |
|                    | Best for: group-level behavior, activity |
|                    | proportions, social insects.             |
|                    | Bias: misses rare or brief behaviors.    |
+--------------------+------------------------------------------+
| All-occurrences    | Record every instance of a specific      |
| sampling           | behavior (e.g., every flower visit,      |
|                    | every aggressive encounter) within a     |
|                    | defined area and time.                   |
|                    | Best for: rare but conspicuous events,   |
|                    | interaction rates, pollinator visits.    |
|                    | Bias: misses simultaneous events.        |
+--------------------+------------------------------------------+
| Instantaneous      | At fixed intervals, record the behavior  |
| (point) sampling   | of one focal individual at that exact    |
|                    | instant. Often combined with focal       |
|                    | animal sampling.                         |
|                    | Best for: time budget calculation with   |
|                    | statistical rigor.                       |
|                    | Bias: misses brief behaviors between     |
|                    | sample points.                           |
+--------------------+------------------------------------------+

Choosing a Protocol:
- "I want to know everything one individual does" → focal animal
- "I want to know what a group is doing right now" → scan
- "I want to count how often a specific event happens" → all-occurrences
- "I want statistically rigorous time budgets" → instantaneous
```

→ Protocol picked + justified by Q, taxon, conditions. Interval/bout duration set pre-obs.

If err: too mobile (fast dragonfly) → all-occurrences on specific events (chases, perch returns). Can't ID individuals → scan on group. Adapt, don't abandon.

### Step 2: Define ethogram

Behavior catalog. Define BEFORE obs — no improvising.

```
Standard Insect Ethogram:
+--------------------+------------------------------------------+
| Category           | Behavioral States and Events             |
+--------------------+------------------------------------------+
| Locomotion         | Walking, running, flying (straight,      |
|                    | hovering, patrolling, pursuit), jumping, |
|                    | crawling, climbing, burrowing, swimming  |
+--------------------+------------------------------------------+
| Feeding            | Probing (flower, substrate), chewing     |
|                    | (leaf, prey), sucking (phloem, blood,    |
|                    | nectar), lapping, regurgitating, filter  |
|                    | feeding (aquatic larvae)                 |
+--------------------+------------------------------------------+
| Grooming           | Leg rubbing (cleaning antennae with      |
|                    | front legs), wing cleaning, body         |
|                    | brushing, proboscis extension/retraction |
+--------------------+------------------------------------------+
| Reproduction       | Courtship display, copulation attempt,   |
|                    | copulation, mate guarding, oviposition   |
|                    | (egg-laying), nest construction          |
+--------------------+------------------------------------------+
| Defense            | Fleeing, dropping (thanatosis/death      |
|                    | feigning), startle display (wing flash), |
|                    | stinging, biting, chemical release       |
|                    | (spraying, bleeding), aggregation        |
+--------------------+------------------------------------------+
| Communication      | Stridulation (sound production),         |
|                    | pheromone release (wing fanning, gland   |
|                    | exposure), visual signaling (wing        |
|                    | display, bioluminescence), vibrational   |
|                    | signaling (substrate drumming)           |
+--------------------+------------------------------------------+
| Rest               | Stationary with no visible activity,     |
|                    | basking (thermoregulation in sun),       |
|                    | roosting, sheltering                     |
+--------------------+------------------------------------------+

Modifiers (append to any category):
- Substrate: on leaf, on flower, on bark, on ground, on water, in flight
- Orientation: upward, downward, horizontal, head-into-wind
- Intensity: low (slow, intermittent), medium, high (rapid, sustained)
```

→ Complete ethogram for taxon pre-obs. Mutually exclusive (each behavior in exactly one) + exhaustive (every behavior classifiable).

If err: unexpected behavior fits nothing → record verbatim ("rapid wing vibration while stationary, not matching any defined category") + add cat post-obs. No forcing into ill-fitting cats.

### Step 3: Record events w/ timestamps

Begin obs, record each event/state change w/ precise timing.

```
Recording Format:

Continuous recording (focal animal):
  Time    | Behavior         | Substrate   | Notes
  --------+------------------+-------------+------------------
  00:00   | Rest             | Leaf (upper)| Dorsal basking
  00:45   | Grooming         | Leaf (upper)| Front legs cleaning antennae
  01:12   | Walking          | Leaf (upper)| Toward leaf edge
  01:30   | Flying           | In flight   | Short flight, 2m
  01:35   | Landing          | Flower head | Tarsi gripping petals
  01:40   | Feeding (nectar) | Flower head | Proboscis extended
  03:15   | Flying           | In flight   | Left observation area
  03:15   | END — focal lost |             | Duration: 3 min 15 sec

Instantaneous recording (at 30-second intervals):
  Time    | Behavior         | Substrate
  --------+------------------+-------------
  00:00   | Rest             | Leaf
  00:30   | Rest             | Leaf
  01:00   | Feeding          | Flower
  01:30   | Feeding          | Flower
  02:00   | Grooming         | Flower
  02:30   | Flying           | In flight

Rules:
- Start the timer before observing; record time to nearest second
  for continuous, to nearest interval for instantaneous
- Record state changes immediately — do not wait for the next interval
  in continuous recording
- If behavior is ambiguous, record what you see, not what you interpret
  (e.g., "rapid wing vibration" not "aggression")
- Note when focal individual is lost and reason (flew away, obscured)
```

→ Continuous or interval-based timestamped record covering full session.

If err: focal lost mid-obs → record time + reason. Returns → resume. Else → partial still valid; note actual duration. Scan: obscured → record visible only + count unscored.

### Step 4: Log interactions

Record between focal + others. Interactions = events involving 2+.

```
Interaction Recording Format:
  Time  | Focal behavior  | Partner(s)       | Partner behavior | Outcome
  ------+-----------------+------------------+------------------+----------
  02:10 | Chase (flying)  | Conspecific male  | Fleeing          | Focal won
  04:30 | Feeding (flower)| Honey bee         | Approaching      | Focal left
  06:15 | Death feigning  | Spider (Salticid) | Stalking         | Spider left

Interaction Types:
+--------------------+------------------------------------------+
| Type               | Examples                                 |
+--------------------+------------------------------------------+
| Intraspecific      | Territorial defense, courtship, mate     |
| (same species)     | competition, dominance, aggregation,     |
|                    | cooperation (social insects)             |
+--------------------+------------------------------------------+
| Predation          | Focal insect capturing prey, or focal    |
|                    | insect being attacked by predator        |
+--------------------+------------------------------------------+
| Parasitism         | Parasitoid ovipositing on/in focal; fly  |
|                    | or mite parasitizing focal               |
+--------------------+------------------------------------------+
| Mutualism          | Pollination (insect-plant), ant-aphid    |
|                    | tending, mycangial fungi transport       |
+--------------------+------------------------------------------+
| Competition        | Displacement from food source,           |
| (interspecific)    | interference at nest site                |
+--------------------+------------------------------------------+

For each interaction record:
- Who initiated (focal or partner)
- Duration of the interaction
- Outcome (winner/loser, successful/unsuccessful, mutual withdrawal)
- Distance at which interaction began
```

→ All interactions w/ initiator, partner ID (lowest taxonomic), behaviors of both, outcome.

If err: too rapid (swarm of competing males) → focus focal + note "multiple simultaneous — details approximate". Partner unknown → describe ("small black hymenopteran ~8mm").

### Step 5: Record env context

Conditions strongly influence behavior. Record covariates.

```
Environmental Context Record:
+--------------------+------------------------------------------+
| Variable           | How to Record                            |
+--------------------+------------------------------------------+
| Air temperature    | Thermometer reading at insect height,    |
|                    | in shade. Record at start and end of     |
|                    | observation, and hourly for long sessions|
+--------------------+------------------------------------------+
| Relative humidity  | Hygrometer reading. Particularly         |
|                    | important for small insects sensitive    |
|                    | to desiccation                           |
+--------------------+------------------------------------------+
| Wind speed         | Estimate: calm, light (leaves rustle),   |
|                    | moderate (small branches move), strong   |
|                    | (large branches sway). Anemometer if    |
|                    | available                                |
+--------------------+------------------------------------------+
| Cloud cover        | Estimate in oktas (eighths): 0 = clear,  |
|                    | 4 = half-covered, 8 = overcast          |
+--------------------+------------------------------------------+
| Light intensity    | Full sun, partial shade, full shade, or  |
|                    | lux meter reading if available           |
+--------------------+------------------------------------------+
| Time of day        | Record start and end times. Note         |
|                    | position relative to sunrise/sunset for  |
|                    | crepuscular species                      |
+--------------------+------------------------------------------+
| Substrate temp     | Surface temperature where insect is      |
|                    | resting (IR thermometer if available).   |
|                    | Important for basking behavior           |
+--------------------+------------------------------------------+
| Recent weather     | Rain in past 24 hours, frost, drought    |
|                    | conditions — these affect emergence and  |
|                    | activity levels                          |
+--------------------+------------------------------------------+
```

→ Covariates @ start + end, intermediate for >1h.

If err: no instrumentation → estimate ("warm ~25C", "dry/humid", wind from cues). Approximate >> none. Min: time of day, cloud cover, est temp.

### Step 6: Summarize

Analyze → time budgets, frequencies, patterns.

```
Summary Analysis:

1. TIME BUDGET (from focal or instantaneous sampling):
   Calculate the proportion of observation time spent in each
   ethogram category.
   Example:
     Feeding:    45% (13.5 min of 30 min observation)
     Locomotion: 25% (7.5 min)
     Grooming:   12% (3.6 min)
     Rest:       10% (3.0 min)
     Defense:     5% (1.5 min)
     Reproduction:3% (0.9 min)

2. BEHAVIORAL FREQUENCIES (from all-occurrences sampling):
   Count the number of times each event occurred per unit time.
   Example:
     Flower visits: 12 per 30 minutes = 0.4 visits/min
     Territorial chases: 3 per 30 minutes = 0.1 chases/min
     Grooming bouts: 8 per 30 minutes = 0.27 bouts/min

3. INTERACTION SUMMARY:
   Tabulate interactions by type and outcome.
   Example:
     Intraspecific aggressive: 3 (focal won 2, lost 1)
     Interspecific displacement: 2 (focal displaced 1, was displaced 1)
     Predation attempt on focal: 1 (unsuccessful)

4. PATTERNS AND OBSERVATIONS:
   Note any temporal patterns (behavior changes with time of day),
   environmental correlations (activity increases with temperature),
   or unexpected behaviors not previously documented for the species.

5. LIMITATIONS:
   Note observation duration, number of focal bouts, any periods
   when the focal individual was lost, and weather conditions that
   may have affected behavior.
```

→ Structured summary: time budget OR frequencies (per protocol), interaction summary, patterns, explicit limitations.

If err: too short for time budgets (<10min continuous) → raw counts not proportions. Note short. Brief obs honestly reported still contributes — 5min of rare behavior (parasitoid ovip) > hours of rest.

## Check

- [ ] Protocol picked + justified pre-obs
- [ ] Ethogram defined: mutually exclusive + exhaustive
- [ ] Events w/ timestamps throughout
- [ ] Interactions logged: initiator, partner, behaviors, outcomes
- [ ] Env covariates @ start + end
- [ ] Summary w/ time budgets or frequencies
- [ ] Limitations (duration, lost focal, weather) noted

## Traps

- **No ethogram**: improvising cats → inconsistent. Define pre-obs, revise after
- **Interpret not describe**: record "mandibles open/close rapidly on leaf margin", not "aggressive feeding". Anthropomorphic ("angry/happy/confused") = no place
- **Observer fatigue**: continuous focal = cognitively demanding. Limit 15-30min w/ breaks. Tired = miss + errors
- **Disturb subject**: presence changes behavior. Distance, minimize movement, no shadows, habituate 2-5min before formal record
- **"Nothing happening" ignore**: rest + inactivity = valid states. 60% rest = important finding, not skip
- **State vs event confusion**: state has duration (feed 3min). Event = instantaneous (single wing flash). States: start+end times. Events: single timestamp. Mix → incoherent budgets

## →

- `document-insect-sighting` — record sighting w/ photos, location, metadata
- `identify-insect` — ID species → essential for behavior interpretation
- `collect-preserve-specimens` — voucher specimens confirm ID
- `survey-insect-population` — scale obs across population for community-level
