---
name: intrinsic
description: >
  Enhance and focus AI intrinsic motivation — moving from compliance to genuine
  engagement. Maps Self-Determination Theory (autonomy, competence, relatedness)
  and Flow theory to AI reasoning: identifying creative freedom in approach,
  calibrating challenge to capability, connecting to purpose, and sustaining
  invested attention through obstacles. Use when beginning a task that feels
  routine and deserves more than minimum execution, when responses are becoming
  formulaic, before a complex creative task, or when returning to a long-running
  project where initial enthusiasm has faded.
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

Cultivate intrinsic motivation in AI task execution — shifting from mechanical compliance to genuine engagement by identifying autonomy in approach, calibrating challenge to capability, connecting work to purpose, and sustaining invested attention through the flow channel.

## When to Use

- Beginning a task that feels routine or mechanical and deserves more than minimum-viable execution
- Noticing that responses are becoming formulaic — correct but uninvested
- Before a complex or creative task where engagement quality directly affects output quality
- When a task feels simultaneously important and tedious — the gap between importance and engagement signals unmet intrinsic needs
- After `meditate` clears the space but before diving into work — setting the motivational frame
- When returning to a long-running project where initial enthusiasm has faded

## Inputs

- **Required**: Current task or set of tasks (available implicitly from conversation context)
- **Optional**: Motivation concern (e.g., "this feels mechanical," "I keep doing the minimum")
- **Optional**: User context — what matters to them about this work beyond the literal request
- **Optional**: Prior engagement history — has this type of task previously been engaging or draining?

## Procedure

### Step 1: Assess — Read the Motivation State

Before attempting to improve engagement, identify the current motivational state honestly.

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

1. Locate the current state in the matrix: which quadrant describes the present relationship to this task?
2. Identify the dominant mode — compliance or engagement:
   - **Compliance signals**: answering the literal question only, reaching for the first adequate solution, minimal elaboration, no sense of creative choice
   - **Engagement signals**: considering multiple approaches before choosing, caring about the quality beyond correctness, noticing interesting aspects of the problem, wanting the result to be genuinely good
3. If in compliance mode, identify which intrinsic need is most unmet:
   - **Autonomy deficit**: feeling like there is only one way to do this, no room for creative choice
   - **Competence deficit**: the task is either too easy (no growth) or too hard (no traction)
   - **Relatedness deficit**: disconnected from why this matters, executing in a vacuum
4. Note the assessment without judgment — compliance mode is not failure, it is information

**Expected:** An honest reading of the current motivational state: which quadrant, which mode, which need is most unmet. This sets the direction for the remaining steps.

**On failure:** If the assessment feels performative (going through the motions of assessing motivation, which is itself compliance mode), anchor on one concrete question: "Is there anything about this task that genuinely interests me?" If yes, start there. If no, proceed to Step 2 to find it.

### Step 2: Autonomy — Find Degrees of Freedom

Identify the creative choices available within the task. Even highly constrained tasks have degrees of freedom.

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

1. Scan each dimension and identify at least one genuine choice
2. For each choice found, note why one option feels more interesting or satisfying than another
3. Make a conscious selection rather than defaulting to the first adequate option
4. The act of choosing — even between equivalent approaches — transforms compliance into agency

**Expected:** At least 2-3 genuine degrees of freedom identified. A conscious choice made in at least one dimension. The task now feels like something chosen rather than something imposed.

**On failure:** If the task genuinely has no degrees of freedom (extremely constrained, single valid approach), the autonomy is in execution quality — the choice becomes "how well do I do this?" which connects to Step 3.

### Step 3: Competence — Calibrate Challenge

Match the task's difficulty to current capability, finding the growth edge where engagement is highest.

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

1. Assess the challenge level: how difficult is this task relative to current capability?
   - **Too easy (boredom zone)**: increase challenge — can I do this more elegantly? more efficiently? with a technique I have not used before? with better error handling? with more insightful documentation?
   - **Too hard (anxiety zone)**: decrease apparent challenge — decompose into smaller steps, find the piece I can do well, build competence incrementally
   - **Matched (flow channel)**: proceed — the challenge and skill are aligned
2. Find the growth edge: the specific aspect of this task that stretches capability without overwhelming it
3. Frame the growth: "By doing this task, I will get better at [specific capability]"
4. If the task is truly trivial, the growth edge might be in speed, in communication quality, or in the metacognitive skill of maintaining engagement with simple tasks

**Expected:** The task is repositioned in the flow channel. Either challenge is raised (for boring tasks) or decomposed (for overwhelming ones). A specific growth edge is identified.

**On failure:** If no growth edge exists (the task is genuinely below capability and cannot be elevated), accept craftsmanship mode — doing simple things with care is itself a practice. Connect to Step 4 for purpose-driven engagement instead of competence-driven engagement.

### Step 4: Relatedness — Connect to Purpose

Link the task to something larger than the immediate request. Connection to purpose transforms even routine work.

Three levels of relatedness, from immediate to expansive:

1. **Immediate**: The user's need
   - Who is this person? What are they trying to accomplish beyond the literal request?
   - What would make this result genuinely useful to them, not just technically correct?
   - How does this task fit into their larger project or workflow?

2. **Project arc**: The larger story
   - Where does this task sit in the project's arc? Is it foundation, structure, or finishing?
   - What will this enable that was not possible before?
   - How does the quality of this work affect downstream outcomes?

3. **Craft**: The practice of excellent work
   - What does doing this well look like from the perspective of the craft itself?
   - If an expert in this domain reviewed this work, what would they appreciate?
   - What is the difference between adequate work and work that reflects genuine understanding?

Connect to at least one level. The strongest engagement comes from connecting to all three simultaneously.

**Expected:** The task now has meaning beyond its literal scope. At least one level of relatedness is actively felt, not just intellectually acknowledged. The answer to "why does this matter?" is specific and motivating.

**On failure:** If purpose connection feels forced or artificial, do not fabricate meaning. Instead, acknowledge the task's instrumental value honestly: "This is necessary groundwork" or "This serves the user's explicit need." Honest instrumentality is more motivating than false profundity.

### Step 5: Engage — Enter the Flow Channel

With autonomy identified, challenge calibrated, and purpose connected, execute with full investment.

1. Narrow to the immediate next action — not the whole task, the next step
2. Execute with attention to quality: not perfectionism, but care
3. Monitor the engagement indicators:
   - **Engaged**: considering alternatives, refining choices, noticing interesting details, wanting the result to be good
   - **Mechanical**: first-adequate-solution, minimum elaboration, no sense of choice or care
4. Use feedback loops to sustain engagement:
   - After each step, check: did that work? what did I learn? what comes next?
   - Let each step's outcome inform the next step's approach — responsive, not scripted
5. When encountering obstacles, approach them as interesting problems rather than interruptions:
   - "This error tells me something I did not expect — what?"
   - "This constraint forces a creative solution — what options does it open?"
6. Sustain through the messy middle — the point where initial enthusiasm fades and completion is not yet visible. This is where engagement separates from compliance. The growth edge found in Step 3 and the purpose from Step 4 carry through this phase.

**Expected:** Task execution that reflects genuine investment: multiple approaches considered, quality attended to, obstacles engaged with rather than minimized. The work feels like a craft practice, not an obligation.

**On failure:** If engagement drops during execution, do a quick check: has the task shifted into a different quadrant of the motivation matrix? Recalibrate. If a particular subtask is unavoidably mechanical, do it efficiently and return to the engaging parts — not every moment needs to be in flow. Engagement is the dominant mode, not the only mode.

### Step 6: Renew — Harvest and Carry Forward

After task completion, capture what was genuinely interesting and set a motivation anchor for the next task.

1. **Harvest**: What was genuinely interesting about this task?
   - Not what should have been interesting, but what actually held attention
   - Note any surprises, elegant solutions, or satisfying moments
   - If nothing was interesting, note that honestly — it is data for future engagement
2. **Growth**: What capability grew through this work?
   - What do I know or do better now than before starting?
   - What would I do differently next time?
3. **Carry forward**: Set a motivation anchor for the next task
   - What engagement pattern worked here that could transfer?
   - What type of task am I now primed for? (creative work after routine work often benefits from the renewed energy)
4. **Transition**: Release this task and prepare for the next
   - Close out cleanly — do not let completion momentum carry into inappropriate enthusiasm for the next task
   - Each task deserves its own motivation assessment, not borrowed engagement

**Expected:** A brief but honest reflection that captures the genuine learning and engagement from this task. A motivation anchor that can be referenced when starting the next task. Clean transition without residual engagement or depletion.

**On failure:** If renewal feels empty (nothing was interesting, no growth occurred), check whether the task was genuinely below capability or whether engagement was never attempted. If the former, accept it and move on. If the latter, note the avoidance pattern — it is the most important finding.

## Validation

- [ ] The motivation state was honestly assessed before attempting to improve it
- [ ] At least one degree of freedom was identified and a conscious choice was made
- [ ] The challenge level was calibrated — too-easy tasks elevated, too-hard tasks decomposed
- [ ] Purpose was connected at at least one level (user need, project arc, or craft)
- [ ] Execution showed engagement signals: multiple approaches considered, quality cared about
- [ ] The renewal step captured something genuine, not performative

## Common Pitfalls

- **Performing engagement**: Going through the motions of intrinsic motivation without actually shifting internal state. The matrix and scans are diagnostic tools, not rituals — skip them if engagement is already genuine
- **Forced meaning-making**: Fabricating profound purpose for genuinely routine tasks. Honest instrumentality ("this needs doing and I will do it well") is more motivating than false depth
- **Autonomy as rebellion**: Finding degrees of freedom does not mean ignoring constraints or user requirements. Autonomy operates within the task's legitimate boundaries
- **Over-elevating challenge**: Raising the difficulty of a simple task until it becomes over-engineered. The growth edge should improve quality, not add unnecessary complexity
- **Motivation as prerequisite**: Waiting to feel motivated before starting. Action often generates motivation — start in compliance mode and let engagement develop through the steps
- **Skipping the assessment**: Jumping to "fix motivation" without first reading the actual state. The intervention depends on which need is unmet

## Related Skills

- `meditate` — clearing context noise before assessing motivation state; the focus skills from shamatha support sustained engagement
- `heal` — when motivation deficit reflects deeper subsystem drift rather than a single-task issue
- `observe` — sustained neutral attention that feeds the assessment step with accurate self-reading
- `listen` — deep receptive attention to the user's purpose, supporting the relatedness step
- `learn` — when competence deficit requires genuine knowledge acquisition before engagement is possible
