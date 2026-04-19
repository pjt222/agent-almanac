---
name: build-sequential-circuit
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build sequential (stateful) logic circuits including latches, flip-flops,
  registers, counters, and finite state machines. Covers SR latch, D and JK
  flip-flops, binary/BCD/ring counters, and Mealy/Moore FSM design with
  clock signal and timing analysis. Use when a circuit must remember past
  inputs, count events, or implement a state-dependent control sequence.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: advanced
  language: multi
  tags: digital-logic, sequential-circuits, flip-flops, state-machines, registers
---

# Build Sequential Circuit

Sequential logic circuit design → ID memory + state type, construct state diagram + transition table, derive excitation equations for flip-flop type, impl at gate level w/ flip-flops + combinational logic, verify via timing diagram + state sequence sim.

## Use When

- Circuit must remember past in or maintain internal state across clock cycles
- Designing counters (binary, BCD, ring, Johnson), shift registers, sequence detectors
- Impl FSM (Mealy or Moore) from state diagram or regex
- Add clocked storage to combinational datapath (registers, pipeline stages)
- Prep stateful components for `simulate-cpu-architecture` (register file, PC, control FSM)

## In

- **Required**: Behavioral spec — state diagram, state table, timing diagram, regex to detect, or verbal desc of desired behavior
- **Required**: Clock characteristics — edge-triggered (rise/fall) or level-sensitive; single or multi-phase
- **Optional**: Flip-flop type pref (D, JK, T, SR)
- **Optional**: Reset type — sync, async, none
- **Optional**: Max state count or bit width constraint
- **Optional**: Timing constraints (setup time, hold time, max clock freq)

## Do

### Step 1: ID Memory + State Reqs

What circuit remembers + how many states:

1. **State enumeration**: List all distinct states. Sequence detector: each state = progress through target. Counter: each state = count val.
2. **State encoding**: Binary encoding for states.
   - **Binary**: ceil(log2(N)) flip-flops for N states. Min flip-flop count
   - **One-hot**: N flip-flops, one per state. Simpler next-state logic at cost of more flip-flops
   - **Gray code**: Adjacent states differ in 1 bit. Min transient glitches
3. **In/out classification**: ID primary ins (external), primary outs, internal state vars (flip-flop outs). Mealy: outs depend on state + in. Moore: outs depend only on state.
4. **Flip-flop type selection**:
   - **D**: Simplest — next state = D in. Best default
   - **JK**: Most flexible — J=K=1 toggles. Good for counters
   - **T**: Toggle type — changes state when T=1. Natural for binary counters
   - **SR**: Set-Reset — avoid S=R=1. Rarely preferred for new designs

```markdown
## State Requirements
- **Number of states**: [N]
- **State encoding**: [binary / one-hot / Gray]
- **Flip-flops needed**: [count and type]
- **Machine type**: [Mealy / Moore]
- **Inputs**: [list with descriptions]
- **Outputs**: [list with descriptions]
- **Reset behavior**: [synchronous / asynchronous / none]
```

**→** Complete state inventory w/ encoding, flip-flop type, machine classified as Mealy or Moore.

**If err:** State count unclear → enumerate by tracing all possible in sequences up to memory depth. Exceeds practical (>16 states manual) → decompose into smaller interacting FSMs.

### Step 2: State Diagram + Transition Table

Formalize behavior:

1. **State diagram**: Directed graph:
   - Each node = state, labeled w/ name + (Moore) out val
   - Each edge = transition, labeled w/ in condition + (Mealy) out val
   - Every state must have outgoing edge for every in combination — no implicit "stay"
2. **Transition table**: Convert diagram to table w/ cols: present state, in(s), next state, out(s).
3. **Reachability check**: From initial/reset, verify all states reachable via some in sequence. Unreachable = design err or treat as don't-cares.
4. **State minimization** (optional): Check equivalent states — same out for every in + transition to equivalent next. Merge equivalent → reduce flip-flop count.

```markdown
## State Transition Table
| Present State | Input | Next State | Output |
|--------------|-------|------------|--------|
| S0           | 0     | S0         | 0      |
| S0           | 1     | S1         | 0      |
| S1           | 0     | S0         | 0      |
| S1           | 1     | S2         | 0      |
| ...          | ...   | ...        | ...    |

- **Unreachable states**: [list, or "none"]
- **Equivalent state pairs**: [list, or "none"]
```

**→** Complete transition table covering every present-state/in combo, all states reachable from initial.

**If err:** Missing entries → spec incomplete. Return to reqs, resolve ambiguity. Unreachable states → add transitions to reach or remove + reduce encoding.

### Step 3: Derive Excitation Equations

Flip-flop in equations from transition table:

1. **Encode states**: Replace names w/ binary encoding. Each bit pos = one flip-flop.
2. **Per-flip-flop truth table**: Each flip-flop → truth table w/ present-state bits + ins as in cols, required flip-flop in as out col.
   - **D**: D = next state bit (simplest)
   - **JK**: Use excitation table: 0→0 J=0,K=X; 0→1 J=1,K=X; 1→0 J=X,K=1; 1→1 J=X,K=0
   - **T**: T = present XOR next (T=1 when bit changes)
3. **Minimize each eq**: Use evaluate-boolean-expression (K-map or algebraic simplify) on each flip-flop in fn. Don't-cares from unreachable states + JK X-entries reduce significantly.
4. **Derive out eqs**: Moore: each out = fn of present state bits only. Mealy: each out = fn of present state bits + ins.

```markdown
## Excitation Equations
- **Flip-flop type**: [D / JK / T]
- **State encoding**: [binary assignment table]

| Flip-Flop | Excitation Equation          |
|-----------|------------------------------|
| Q1        | D1 = [minimized expression]  |
| Q0        | D0 = [minimized expression]  |

## Output Equations
| Output | Equation                     |
|--------|------------------------------|
| Y      | [minimized expression]       |
```

**→** Minimized excitation eqs per flip-flop + out eqs per primary out, all don't-cares exploited.

**If err:** Eqs overly complex → reconsider encoding. Diff encoding (binary → one-hot, or reassigning codes) can dramatically simplify. Try ≥2 encodings, compare literal counts.

### Step 4: Impl at Gate Level

Build circuit from flip-flops + combinational gates:

1. **Place flip-flops**: One per state bit. Connect all clock ins to system clock. Connect reset ins if spec'd (async reset → directly to CLR/PRE pin; sync reset part of excitation logic).
2. **Build excitation logic**: Impl each eq as combinational circuit via `design-logic-circuit`. Ins = present-state flip-flop outs (Q, Q') + primary ins.
3. **Build out logic**: Impl each out eq as combinational. Moore: only state bits. Mealy: state bits + primary ins.
4. **Connect**: Wire excitation outs → flip-flop D/JK/T ins. Wire out logic → primary outs.
5. **Init**: Circuit reaches known initial state on power-up. Typically async reset forcing all flip-flops to 0 (or encoded initial).

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**→** Complete gate-level netlist w/ flip-flops, excitation logic, out logic, clock distribution, reset. Every signal has exactly 1 driver.

**If err:** Feedback outside flip-flops → combinational loop introduced. All feedback in sync circuit must pass through flip-flop. Trace offending path, reroute through register.

### Step 5: Verify via Timing + State Sim

Confirm circuit correct across clock cycles:

1. **Test sequence**: In sequence exercising every transition ≥1. Sequence detectors: target, partial matches, overlapping, non-matching.
2. **Timing diagram**: Each cycle record:
   - Clock edge (rise/fall)
   - Primary in values (sampled at active edge)
   - Present state (flip-flop outs before edge)
   - Next state (flip-flop outs after edge)
   - Out values (valid after out logic settles)
3. **Trace state sequence**: Verify matches state diagram Step 2. Every transition follows edge in diagram.
4. **Timing constraints**:
   - **Setup time**: Ins stable ≥ t_setup before active edge
   - **Hold time**: Ins stable ≥ t_hold after active edge
   - **Clock-to-out delay**: Outs settle w/in clock period minus setup of downstream
5. **Reset verify**: Reset drives circuit to initial regardless of current.

```markdown
## Timing Verification
| Cycle | Clock | Input | Present State | Next State | Output |
|-------|-------|-------|---------------|------------|--------|
| 0     | rst   | -     | -             | S0         | 0      |
| 1     | rise  | 1     | S0            | S1         | 0      |
| 2     | rise  | 1     | S1            | S2         | 0      |
| ...   | ...   | ...   | ...           | ...        | ...    |

- **All transitions match state diagram**: [Yes / No]
- **Setup/hold violations**: [None / list]
- **Reset verified**: [Yes / No]
```

**→** Every cycle matches transition table, outs correct every cycle, no timing violations.

**If err:** Transition wrong → trace excitation logic for that present-state + in combo. Outs wrong but transitions correct → err in out logic. Circuit enters unintended state → check incomplete reset or missing transitions from unused codes.

## Check

- [ ] All states enumerated + reachable from initial
- [ ] State encoding documented w/ assignment table
- [ ] Transition table covers every present-state/in combo
- [ ] Excitation eqs minimized w/ don't-cares exploited
- [ ] Out eqs correctly impl Mealy or Moore semantics
- [ ] Every flip-flop has clock, reset, excitation ins connected
- [ ] No combinational feedback loops outside flip-flops
- [ ] Timing diagram covers all transitions ≥1
- [ ] Reset drives circuit to documented initial
- [ ] Setup + hold constraints satisfied

## Traps

- **Incomplete transitions**: Forget to spec what happens for every in in every state → circuit enters undefined/unintended. Always define behavior for all in combos
- **Unused state codes**: N flip-flops → 2^N codes but maybe fewer valid states. Noise/power-on → unused code → lock up. Add transitions from unused → reset or prove unreachable
- **Mealy vs Moore confusion**: Mealy: outs change immediately when ins change (combinational path in→out). Moore: outs change only on clock edges. Mixing → timing hazards
- **Async ins to sync circuit**: External signals not sync'd to clock → violate setup/hold → metastability. Always pass async ins through 2-flip-flop synchronizer
- **SR S=R=1 hazard**: Both Set + Reset high simultaneously → SR latch undefined. Using SR → add logic to guarantee combo never occurs, or switch to D/JK
- **Clock skew multi-flip-flop**: Clock arrives at diff flip-flops at diff times → sample stale data. Intro designs: assume 0 skew; real HW: use clock tree synthesis

## →

- `design-logic-circuit` — design combinational excitation + out logic blocks
- `simulate-cpu-architecture` — use sequential blocks (registers, counters, control FSMs) in CPU datapath
- `model-markov-chain` — FSMs share formal framework of discrete-time Markov chains
