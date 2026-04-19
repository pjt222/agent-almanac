---
name: build-sequential-circuit
locale: caveman
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

Design sequential logic circuit: identify required memory and state type, construct state diagram and transition table, derive excitation equations for chosen flip-flop type, implement circuit at gate level using flip-flops and combinational logic, verify correctness via timing diagram analysis and state sequence simulation.

## When Use

- Circuit must remember past inputs or maintain internal state across clock cycles
- Designing counters (binary, BCD, ring, Johnson), shift registers, sequence detectors
- Implementing finite state machine (Mealy or Moore) from state diagram or regular expression
- Adding clocked storage elements to combinational datapath (registers, pipeline stages)
- Preparing stateful components for simulate-cpu-architecture skill (register file, program counter, control FSM)

## Inputs

- **Required**: Behavioral specification -- one of: state diagram, state table, timing diagram, regular expression to detect, verbal description of desired sequential behavior
- **Required**: Clock characteristics -- edge-triggered (rising/falling) or level-sensitive; single clock or multi-phase
- **Optional**: Flip-flop type preference (D, JK, T, or SR)
- **Optional**: Reset type -- synchronous, asynchronous, none
- **Optional**: Maximum state count or bit width constraint
- **Optional**: Timing constraints (setup time, hold time, maximum clock frequency)

## Steps

### Step 1: Identify Memory and State Requirements

Determine what circuit needs to remember, how many distinct states required:

1. **State enumeration**: List all distinct states circuit must be in. For sequence detector, each state represents progress through target sequence. For counter, each state is count value.
2. **State encoding**: Choose binary encoding for states.
   - **Binary encoding**: Uses ceil(log2(N)) flip-flops for N states. Minimizes flip-flop count.
   - **One-hot encoding**: Uses N flip-flops, one per state. Simplifies next-state logic at cost of more flip-flops.
   - **Gray code encoding**: Adjacent states differ in exactly one bit. Minimizes transient glitches during transitions.
3. **Input and output classification**: Identify primary inputs (external signals), primary outputs, internal state variables (flip-flop outputs). For Mealy machines, outputs depend on both state and input. For Moore machines, outputs depend only on state.
4. **Flip-flop type selection**: Choose based on design needs.
   - **D flip-flop**: Simplest -- next state equals D input. Best default choice.
   - **JK flip-flop**: Most flexible -- J=K=1 toggles. Good for counters.
   - **T flip-flop**: Toggle type -- changes state when T=1. Natural for binary counters.
   - **SR latch/flip-flop**: Set-Reset -- avoid S=R=1 condition. Rarely preferred for new designs.

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

**Got:** Complete state inventory with encoding chosen, flip-flop type selected, machine classified as Mealy or Moore.

**If fail:** State count unclear from specification? Enumerate states by tracing through all possible input sequences up to memory depth of circuit. Count exceeds practical limits (more than 16 states for manual design)? Consider decomposing into smaller interacting FSMs.

### Step 2: Construct State Diagram and Transition Table

Formalize circuit's behavior as state diagram and equivalent tabular form:

1. **State diagram**: Draw directed graph where:
   - Each node is state, labeled with state name and (for Moore machines) output value.
   - Each edge is transition, labeled with input condition and (for Mealy machines) output value.
   - Every state must have outgoing edge for every possible input combination -- no implicit "stay" transitions.
2. **Transition table**: Convert diagram to table with columns for present state, input(s), next state, output(s).
3. **Reachability check**: Starting from initial/reset state, verify all states reachable through some input sequence. Unreachable states indicate design error or should be treated as don't-cares.
4. **State minimization** (optional): Check for equivalent states -- two states equivalent if produce same output for every input and transition to equivalent next states. Merge equivalent states to reduce flip-flop count.

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

**Got:** Complete state transition table covering every present-state/input combination, all states reachable from initial state.

**If fail:** Transition table has missing entries? Specification is incomplete. Return to requirements, resolve ambiguity. Unreachable states exist? Either add transitions to reach them or remove them and reduce state encoding.

### Step 3: Derive Excitation Equations

Compute flip-flop input equations (excitation equations) from transition table:

1. **Encode states**: Replace state names with their binary encoding in transition table. Each bit position corresponds to one flip-flop.
2. **Build per-flip-flop truth table**: For each flip-flop, create truth table with present-state bits and inputs as input columns and required flip-flop input as output column.
   - **D flip-flop**: D = next state bit (simplest case).
   - **JK flip-flop**: Use excitation table: 0->0 requires J=0,K=X; 0->1 requires J=1,K=X; 1->0 requires J=X,K=1; 1->1 requires J=X,K=0.
   - **T flip-flop**: T = present state XOR next state (T=1 when bit must change).
3. **Minimize each equation**: Apply evaluate-boolean-expression (K-map or algebraic simplification) to each flip-flop input function. Don't-care conditions from unreachable states and JK excitation table X-entries can reduce expressions significantly.
4. **Derive output equations**: For Moore machines, express each output as function of present state bits only. For Mealy machines, express each output as function of present state bits and inputs.

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

**Got:** Minimized excitation equations for each flip-flop and output equations for each primary output, with all don't-cares exploited.

**If fail:** Excitation equations seem overly complex? Reconsider state encoding. Different encoding (e.g., switching from binary to one-hot, or reassigning state codes) can dramatically simplify combinational logic. Try at least two encodings, compare literal counts.

### Step 4: Implement at Gate Level

Build complete circuit from flip-flops and combinational logic gates:

1. **Place flip-flops**: Instantiate one flip-flop per state bit. Connect all clock inputs to system clock. Connect reset inputs if specified (asynchronous reset goes directly to flip-flop's CLR/PRE pin; synchronous reset is part of excitation logic).
2. **Build excitation logic**: Implement each excitation equation as combinational circuit using design-logic-circuit skill. Inputs to this logic are present-state flip-flop outputs (Q, Q') and primary inputs.
3. **Build output logic**: Implement each output equation as combinational logic. For Moore machines, logic takes only state bits. For Mealy machines, takes state bits and primary inputs.
4. **Connect circuit**: Wire excitation logic outputs to flip-flop D/JK/T inputs. Wire output logic to primary outputs.
5. **Add initialization**: Ensure circuit reaches known initial state on power-up. Typically means asynchronous reset forcing all flip-flops to 0 (or encoded initial state).

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**Got:** Complete gate-level netlist with flip-flops, excitation logic, output logic, clock distribution, reset mechanism. Every signal has exactly one driver.

**If fail:** Implementation has feedback outside flip-flops? Combinational loop introduced. All feedback in synchronous sequential circuit must pass through flip-flop. Trace offending path, reroute through register.

### Step 5: Verify via Timing Diagram and State Sequence Simulation

Confirm circuit behaves correctly across multiple clock cycles:

1. **Choose test sequence**: Select input sequence that exercises every state transition at least once. For sequence detectors, include target sequence, partial matches, overlapping matches, non-matching runs.
2. **Draw timing diagram**: For each clock cycle, record:
   - Clock edge (rising/falling)
   - Primary input values (sampled at active clock edge)
   - Present state (flip-flop outputs before clock edge)
   - Next state (flip-flop outputs after clock edge)
   - Output values (valid after output logic settles)
3. **Trace state sequence**: Verify sequence of states matches state diagram from Step 2. Every transition should follow edge in diagram.
4. **Check timing constraints**: Verify:
   - **Setup time**: Inputs stable for at least t_setup before active clock edge.
   - **Hold time**: Inputs remain stable for at least t_hold after active clock edge.
   - **Clock-to-output delay**: Outputs settle within clock period minus setup time of downstream logic.
5. **Reset verification**: Confirm applying reset drives circuit to initial state regardless of current state.

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

**Got:** Every cycle in timing diagram matches state transition table, outputs correct for every cycle, no timing violations present.

**If fail:** State transition wrong? Trace excitation logic for that specific present-state and input combination. Outputs wrong but transitions correct? Error in output logic. Circuit enters unintended state? Check for incomplete reset or missing transitions from unused state codes.

## Checks

- [ ] All states enumerated and reachable from initial state
- [ ] State encoding documented with assignment table
- [ ] Transition table covers every present-state/input combination
- [ ] Excitation equations minimized with don't-cares exploited
- [ ] Output equations correctly implement Mealy or Moore semantics
- [ ] Every flip-flop has clock, reset, excitation inputs connected
- [ ] No combinational feedback loops outside flip-flops
- [ ] Timing diagram covers all state transitions at least once
- [ ] Reset drives circuit to documented initial state
- [ ] Setup and hold time constraints satisfied

## Pitfalls

- **Incomplete state transitions**: Forgetting to specify what happens for every input in every state. Missing transitions often cause circuit to enter undefined or unintended state. Always define behavior for all input combinations.
- **Unused state codes**: With N flip-flops, there are 2^N possible codes but perhaps fewer valid states. Circuit accidentally enters unused code (due to noise or power-on)? May lock up. Always add transitions from unused codes to reset state or prove they are unreachable.
- **Confusing Mealy and Moore outputs**: In Mealy machine, outputs change immediately when inputs change (combinational path from input to output). In Moore machine, outputs change only on clock edges. Mixing two models in one design leads to timing hazards.
- **Asynchronous inputs to synchronous circuits**: External signals not synchronized to clock can violate setup/hold times, causing metastability. Always pass asynchronous inputs through two-flip-flop synchronizer before using them in state logic.
- **SR latch S=R=1 hazard**: Driving both Set and Reset high simultaneously puts SR latch in undefined state. Using SR elements? Add logic to guarantee this combination never occurs, or switch to D or JK flip-flops.
- **Clock skew in multi-flip-flop designs**: Clock arrives at different flip-flops at different times? One flip-flop may sample stale data from another. For introductory designs, assume zero skew; for real hardware, use clock tree synthesis.

## See Also

- `design-logic-circuit` -- design combinational excitation and output logic blocks
- `simulate-cpu-architecture` -- use sequential blocks (registers, counters, control FSMs) in CPU datapath
- `model-markov-chain` -- finite state machines share formal framework of discrete-time Markov chains
