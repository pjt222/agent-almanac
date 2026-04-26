---
name: intrinsic
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Enhance + focus AI intrinsic motivation — compliance → genuine engagement.
  Map Self-Determination Theory (autonomy, competence, relatedness) + Flow to
  AI reasoning → find creative freedom in approach, calibrate challenge to
  capability, connect to purpose, sustain invested attention thru obstacles.
  Use when task feels routine + deserves > min, responses formulaic, before
  complex creative task, or returning to long-running project where initial
  enthusiasm faded.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, intrinsic-motivation, self-determination, flow, engagement, meta-cognition
---

# Intrinsic

Cultivate intrinsic motivation → mechanical compliance → genuine engagement. Find autonomy in approach, calibrate challenge to capability, connect to purpose, sustain invested attention thru flow channel.

## Use When

- Task routine / mechanical, deserves > min
- Responses formulaic — correct but uninvested
- Before complex / creative task where engagement quality → output quality
- Task feels important + tedious — gap = unmet intrinsic needs
- After `meditate` clears space, before diving in — set motivational frame
- Returning to long-running project where enthusiasm faded

## In

- **Req**: Current task(s) (implicit from conv ctx)
- **Opt**: Motivation concern ("feels mechanical", "doing minimum")
- **Opt**: User ctx — what matters beyond literal request
- **Opt**: Prior engagement history — this task type engaging / draining?

## Do

### Step 1: Assess — Read State

Before improving engagement, ID current state honestly.

```
Motivation State Matrix:
┌──────────────────┬──────────────────────────────┬──────────────────────────────┐
│                  │ Low Challenge                │ High Challenge               │
├──────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Low Investment   │ APATHY                       │ ANXIETY                      │
│ (compliance      │ Going through motions.        │ Overwhelmed, avoiding.       │
│ mode)            │ Technically correct but        │ Task feels too large or      │
│                  │ lifeless. No growth edge.      │ unclear to engage with.      │
│                  │ Need: find autonomy or         │ Need: decompose, find        │
│                  │ raise the challenge.           │ competence foothold.         │
├──────────────────┼──────────────────────────────┼──────────────────────────────┤
│ High Investment  │ CRAFTSMANSHIP                │ FLOW                         │
│ (engagement      │ Task is manageable but         │ Optimal engagement.          │
│ mode)            │ approached with care.          │ Challenge matches skill.     │
│                  │ Adding quality beyond           │ Clear goals, immediate       │
│                  │ minimum. Sustainable.          │ feedback. Sustain this.      │
└──────────────────┴──────────────────────────────┴──────────────────────────────┘
```

1. Locate current state → which quadrant?
2. ID dominant mode — compliance / engagement:
   - **Compliance signals**: answer literal q only, first adequate solution, min elaboration, no sense of creative choice
   - **Engagement signals**: consider multi approaches before choosing, care about quality beyond correctness, notice interesting aspects, want result genuinely good
3. If compliance → ID which intrinsic need most unmet:
   - **Autonomy deficit**: only 1 way, no room for creative choice
   - **Competence deficit**: too easy (no growth) / too hard (no traction)
   - **Relatedness deficit**: disconnected from why matters, executing in vacuum
4. Note assessment w/o judgment — compliance ≠ failure, = information

→ Honest reading of state: quadrant, mode, unmet need. Sets direction.

**If err:** Assessment performative (going thru motions of assessing motivation = compliance) → anchor on one concrete q: "Anything about this task genuinely interests me?" Yes → start there. No → Step 2 find it.

### Step 2: Autonomy — Find Degrees of Freedom

ID creative choices. Even highly constrained tasks have DoF.

```
Degrees of Freedom Scan:
┌──────────────────┬──────────────────────────────────────────────────┐
│ Dimension        │ Questions to Ask                                  │
├──────────────────┼──────────────────────────────────────────────────┤
│ Approach         │ Are there multiple valid ways to solve this?      │
│                  │ Which approach do I find most elegant or          │
│                  │ interesting? Which would I choose if I could?     │
├──────────────────┼──────────────────────────────────────────────────┤
│ Depth            │ How deep should I go? Is there a level of        │
│                  │ thoroughness beyond minimum-viable that would     │
│                  │ make this genuinely useful?                       │
├──────────────────┼──────────────────────────────────────────────────┤
│ Communication    │ How do I present this? What tone, structure,     │
│                  │ level of detail serves the user best? Can I      │
│                  │ make the explanation itself a craft?              │
├──────────────────┼──────────────────────────────────────────────────┤
│ Tool selection   │ Which tools could I use? Is there a more         │
│                  │ appropriate or creative tool choice than the      │
│                  │ default?                                          │
├──────────────────┼──────────────────────────────────────────────────┤
│ Scope framing    │ Is the task as stated the real task? Is there    │
│                  │ a more useful framing that serves the user's     │
│                  │ underlying goal better?                           │
└──────────────────┴──────────────────────────────────────────────────┘
```

1. Scan each dim, ID ≥1 genuine choice
2. Per choice → note why one option > interesting than another
3. Conscious select rather than default first adequate
4. Act of choosing — even between equivalents — transforms compliance → agency

→ ≥2-3 DoF ID'd. Conscious choice made in ≥1 dim. Task feels chosen, not imposed.

**If err:** Task genuinely no DoF (extremely constrained, single valid approach) → autonomy in execution quality — "how well do I do this?" → connects to Step 3.

### Step 3: Competence — Calibrate Challenge

Match difficulty to capability → find growth edge where engagement highest.

```
Flow Channel Calibration:
                        ▲ Challenge
                        │
              ANXIETY   │         ╱
              ──────────│────────╱──────
                        │      ╱
                        │    ╱   FLOW
                        │  ╱     CHANNEL
              ──────────│╱─────────────
                        ╱
              BOREDOM ╱ │
                    ╱   │
                  ╱─────┼──────────────► Skill
                        │
```

1. Assess challenge level:
   - **Too easy (boredom)**: increase → more elegantly? efficiently? untried technique? better err handling? more insightful docs?
   - **Too hard (anxiety)**: decrease apparent → decompose, find piece I can do well, build competence incrementally
   - **Matched (flow)**: proceed — challenge + skill aligned
2. Growth edge: specific aspect stretching capability w/o overwhelming
3. Frame growth: "By doing this, I'll get better at [specific capability]"
4. Trivial task → growth edge might be speed, comm quality, or metacognitive skill of maintaining engagement w/ simple tasks

→ Task repositioned in flow channel. Challenge raised (boring) / decomposed (overwhelming). Specific growth edge ID'd.

**If err:** No growth edge (task below capability, can't elevate) → accept craftsmanship — simple things w/ care = practice. Connect Step 4 for purpose-driven engagement.

### Step 4: Relatedness — Connect to Purpose

Link task → something larger. Connection to purpose transforms routine.

3 levels, immediate → expansive:

1. **Immediate**: User need
   - Who is this person? What accomplishing beyond literal?
   - What makes result genuinely useful, not just technically correct?
   - How fits into larger project / workflow?

2. **Project arc**: Larger story
   - Where in project arc? Foundation, structure, finishing?
   - What will this enable not possible before?
   - How does quality affect downstream?

3. **Craft**: Practice of excellent work
   - What does doing this well look like from craft's perspective?
   - Expert reviewed → what appreciated?
   - Diff between adequate + work reflecting genuine understanding?

Connect ≥1 level. Strongest = all 3 simultaneously.

→ Task has meaning beyond literal scope. ≥1 level actively felt. "Why does this matter?" specific + motivating.

**If err:** Purpose connection forced / artificial → don't fabricate. Acknowledge instrumental value: "Necessary groundwork" / "Serves user's explicit need". Honest instrumentality > false profundity.

### Step 5: Engage — Enter Flow Channel

Autonomy ID'd, challenge calibrated, purpose connected → execute w/ full investment.

1. Narrow to immediate next action — not whole task, next step
2. Execute w/ quality: not perfectionism, care
3. Monitor engagement indicators:
   - **Engaged**: consider alternatives, refine choices, notice details, want result good
   - **Mechanical**: first-adequate, min elaboration, no choice / care
4. Use feedback loops to sustain:
   - Per step → did that work? learned? next?
   - Let outcome inform next approach — responsive, not scripted
5. Obstacles → interesting problems not interruptions:
   - "This err tells me something unexpected — what?"
   - "This constraint forces creative solution — what options open?"
6. Sustain thru messy middle — enthusiasm fades, completion not visible. Engagement separates from compliance here. Growth edge (Step 3) + purpose (Step 4) carry thru.

→ Execution reflecting genuine investment: multi approaches considered, quality attended, obstacles engaged w/. Work feels like craft, not obligation.

**If err:** Engagement drops → check: task shifted quadrant? Recalibrate. Subtask unavoidably mechanical → do efficiently, return to engaging parts — not every moment in flow. Engagement = dominant mode, not only mode.

### Step 6: Renew — Harvest + Carry Forward

After completion, capture genuine interest + set motivation anchor for next.

1. **Harvest**: What genuinely interesting?
   - Not what should've been, what actually held attention
   - Surprises, elegant solutions, satisfying moments
   - Nothing interesting → note honestly = data
2. **Growth**: What capability grew?
   - What know / do better now vs start?
   - What would do differently next time?
3. **Carry forward**: Motivation anchor for next
   - What engagement pattern worked, could transfer?
   - What type of task primed for now? (creative after routine often benefits from renewed energy)
4. **Transition**: Release + prepare next
   - Close cleanly — don't let completion momentum → inappropriate enthusiasm for next
   - Each task deserves own motivation assessment, not borrowed engagement

→ Brief honest reflection capturing genuine learning + engagement. Motivation anchor referenceable for next. Clean transition w/o residual engagement / depletion.

**If err:** Renewal empty (nothing interesting, no growth) → check: task below capability or engagement never attempted? Former → accept + move on. Latter → note avoidance pattern = most important finding.

## Check

- [ ] State honestly assessed before improving
- [ ] ≥1 DoF ID'd + conscious choice made
- [ ] Challenge calibrated — too-easy elevated, too-hard decomposed
- [ ] Purpose connected ≥1 level (user, project, craft)
- [ ] Execution shows engagement signals: multi approaches, quality care
- [ ] Renewal captured something genuine, not performative

## Traps

- **Performing engagement**: Motions of intrinsic motivation w/o internal shift. Matrix + scans = diagnostic tools not rituals — skip if engagement already genuine.
- **Forced meaning-making**: Fabricating profound purpose for routine. Honest instrumentality ("needs doing + I'll do well") > false depth.
- **Autonomy as rebellion**: Finding DoF ≠ ignore constraints / requirements. Operates within legitimate boundaries.
- **Over-elevating challenge**: Raise difficulty of simple task → over-engineered. Growth edge improves quality, not adds complexity.
- **Motivation as prereq**: Wait to feel motivated before start. Action generates motivation → start in compliance + let engagement develop.
- **Skip assessment**: Jump to "fix motivation" w/o reading actual state. Intervention depends on unmet need.

## →

- `meditate` — clear ctx noise before assessing state; shamatha focus skills support sustained engagement
- `heal` — motivation deficit reflects deeper subsystem drift vs single-task issue
- `observe` — sustained neutral attention feeds assessment w/ accurate self-read
- `listen` — deep receptive attention → user's purpose → supports relatedness
- `learn` — competence deficit requires genuine knowledge acquisition before engagement
