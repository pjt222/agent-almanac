---
name: build-sequential-circuit
description: >
  Erstellen sequential (stateful) logic circuits einschliesslich latches, flip-flops,
  registers, counters, and finite state machines. Umfasst SR latch, D and JK
  flip-flops, binary/BCD/ring counters, and Mealy/Moore FSM design with
  clock signal and timing analysis. Verwenden wenn a circuit must remember past
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
  locale: de
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Sequentielle Schaltung bauen

Entwerfen a sequential logic circuit by identifying the required memory and state type, constructing a state diagram and transition table, deriving excitation equations for the chosen flip-flop type, implementing the circuit at the gate level using flip-flops and combinational logic, and verifying correctness durch timing diagram analysis and state sequence simulation.

## Wann verwenden

- A circuit must remember past inputs or maintain internal state across clock cycles
- Designing counters (binary, BCD, ring, Johnson), shift registers, or sequence detectors
- Implementing a finite state machine (Mealy or Moore) from a state diagram or regular expression
- Adding clocked storage elements to a combinational datapath (registers, pipeline stages)
- Preparing stateful components for the simulate-cpu-architecture skill (register file, program counter, control FSM)

## Eingaben

- **Erforderlich**: Behavioral specification -- one of: state diagram, state table, timing diagram, regular expression to detect, or verbal description of the desired sequential behavior
- **Erforderlich**: Clock characteristics -- edge-triggered (rising/falling) or level-sensitive; single clock or multi-phase
- **Optional**: Flip-flop type preference (D, JK, T, or SR)
- **Optional**: Zuruecksetzen type -- synchronous, asynchronous, or none
- **Optional**: Maximum state count or bit width constraint
- **Optional**: Timing constraints (setup time, hold time, maximum clock frequency)

## Vorgehensweise

### Schritt 1: Identifizieren Memory and State Requirements

Bestimmen what the circuit needs to remember and how many distinct states it requires:

1. **State enumeration**: Auflisten all distinct states the circuit muss in. For a sequence detector, each state represents the progress durch das Ziel sequence. For a counter, each state is a count value.
2. **State encoding**: Waehlen a binary encoding for der Zustands.
   - **Binary encoding**: Uses ceil(log2(N)) flip-flops for N states. Minimizes flip-flop count.
   - **One-hot encoding**: Uses N flip-flops, one per state. Simplifies next-state logic at the cost of more flip-flops.
   - **Gray code encoding**: Adjacent states differ in exactly one bit. Minimizes transient glitches waehrend transitions.
3. **Input and output classification**: Identifizieren primary inputs (external signals), primary outputs, and internal state variables (flip-flop outputs). For Mealy machines, outputs depend on both state and input. For Moore machines, outputs depend only on state.
4. **Flip-flop type selection**: Waehlen basierend auf the design's needs.
   - **D flip-flop**: Simplest -- next state equals the D input. Best default choice.
   - **JK flip-flop**: Most flexible -- J=K=1 toggles. Good for counters.
   - **T flip-flop**: Toggle type -- changes state when T=1. Natural for binary counters.
   - **SR latch/flip-flop**: Set-Zuruecksetzen -- avoid the S=R=1 condition. Rarely preferred for new designs.

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

**Erwartet:** A complete state inventory with encoding chosen, flip-flop type selected, and the machine classified as Mealy or Moore.

**Bei Fehler:** If der Zustand count is unclear from the specification, enumerate states by tracing durch all possible input sequences up to the memory depth of the circuit. If the count exceeds practical limits (more than 16 states for manual design), consider decomposing into smaller interacting FSMs.

### Schritt 2: Construct State Diagram and Transition Table

Formalize the circuit's behavior as a state diagram and equivalent tabular form:

1. **State diagram**: Draw a directed graph where:
   - Each node is a state, labeled with der Zustand name and (for Moore machines) die Ausgabe value.
   - Each edge is a transition, labeled with die Eingabe condition and (for Mealy machines) die Ausgabe value.
   - Every state must have an outgoing edge for every possible input combination -- no implicit "stay" transitions.
2. **Transition table**: Konvertieren the diagram to a table with columns for present state, input(s), next state, and output(s).
3. **Reachability check**: Starting from the initial/reset state, verify that all states are reachable durch some input sequence. Unreachable states indicate a design error or sollte treated as don't-cares.
4. **State minimization** (optional): Pruefen auf equivalent states -- two states are equivalent if they produce the same output for every input and transition to equivalent next states. Zusammenfuehren equivalent states to reduce flip-flop count.

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

**Erwartet:** A complete state transition table covering every present-state/input combination, with all states reachable from the initial state.

**Bei Fehler:** If the transition table has missing entries, the specification is incomplete. Zurueckgeben to the requirements and resolve the ambiguity. If unreachable states exist, either add transitions to reach them or remove them and reduce der Zustand encoding.

### Schritt 3: Derive Excitation Equations

Berechnen the flip-flop input equations (excitation equations) from the transition table:

1. **Encode states**: Replace state names with their binary encoding in the transition table. Each bit position corresponds to one flip-flop.
2. **Erstellen per-flip-flop truth table**: Fuer jede flip-flop, create a truth table with present-state bits and inputs as die Eingabe columns and the required flip-flop input as die Ausgabe column.
   - **D flip-flop**: D = next state bit (the simplest case).
   - **JK flip-flop**: Use the excitation table: 0->0 requires J=0,K=X; 0->1 requires J=1,K=X; 1->0 requires J=X,K=1; 1->1 requires J=X,K=0.
   - **T flip-flop**: T = present state XOR next state (T=1 when the bit must change).
3. **Minimieren each equation**: Anwenden evaluate-boolean-expression (K-map or algebraic simplification) to each flip-flop input function. Don't-care conditions from unreachable states and JK excitation table X-entries can reduce the expressions erheblich.
4. **Derive output equations**: For Moore machines, express each output as a function of present state bits only. For Mealy machines, express each output as a function of present state bits and inputs.

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

**Erwartet:** Minimized excitation equations fuer jede flip-flop and output equations fuer jede primary output, with all don't-cares exploited.

**Bei Fehler:** If the excitation equations seem overly complex, reconsider der Zustand encoding. A different encoding (e.g., switching from binary to one-hot, or reassigning state codes) can dramatically simplify the combinational logic. Versuchen mindestens two encodings and compare literal counts.

### Schritt 4: Implementieren at Gate Level

Erstellen the complete circuit from flip-flops and combinational logic gates:

1. **Place flip-flops**: Instantiate one flip-flop per state bit. Verbinden all clock inputs to das System clock. Verbinden reset inputs if specified (asynchronous reset goes directly to the flip-flop's CLR/PRE pin; synchronous reset is part of the excitation logic).
2. **Erstellen excitation logic**: Implementieren each excitation equation as a combinational circuit using the design-logic-circuit skill. The inputs to this logic are the present-state flip-flop outputs (Q, Q') and primary inputs.
3. **Erstellen output logic**: Implementieren each output equation as combinational logic. For Moore machines, this logic takes only state bits. For Mealy machines, it takes state bits and primary inputs.
4. **Verbinden the circuit**: Wire the excitation logic outputs to the flip-flop D/JK/T inputs. Wire die Ausgabe logic to the primary outputs.
5. **Hinzufuegen initialization**: Sicherstellen the circuit reaches a known initial state on power-up. This typischerweise means an asynchronous reset that forces all flip-flops to 0 (or the encoded initial state).

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**Erwartet:** A complete gate-level netlist with flip-flops, excitation logic, output logic, clock distribution, and reset mechanism, where every signal has exactly one driver.

**Bei Fehler:** If the implementation has feedback outside of the flip-flops, a combinational loop wurde introduced. All feedback in a synchronous sequential circuit must pass durch a flip-flop. Trace the offending path and reroute it durch a register.

### Schritt 5: Verifizieren via Timing Diagram and State Sequence Simulation

Bestaetigen the circuit behaves korrekt across multiple clock cycles:

1. **Waehlen test sequence**: Auswaehlen an input sequence that exercises every state transition mindestens once. For sequence detectors, include das Ziel sequence, partial matches, overlapping matches, and non-matching runs.
2. **Draw timing diagram**: Fuer jede clock cycle, record:
   - Clock edge (rising/falling)
   - Primary input values (sampled at the active clock edge)
   - Present state (flip-flop outputs vor the clock edge)
   - Next state (flip-flop outputs nach the clock edge)
   - Output values (valid nach die Ausgabe logic settles)
3. **Trace state sequence**: Sicherstellen, dass the sequence of states matches der Zustand diagram from Step 2. Every transition should follow an edge in the diagram.
4. **Check timing constraints**: Verifizieren that:
   - **Setup time**: Inputs are stable for mindestens t_setup vor the active clock edge.
   - **Hold time**: Inputs remain stable for mindestens t_hold nach the active clock edge.
   - **Clock-to-output delay**: Outputs settle innerhalb the clock period minus the setup time of downstream logic.
5. **Zuruecksetzen verification**: Bestaetigen, dass applying reset drives the circuit to the initial state unabhaengig von the current state.

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

**Erwartet:** Every cycle in the timing diagram matches der Zustand transition table, outputs are correct for every cycle, and no timing violations are present.

**Bei Fehler:** If a state transition is wrong, trace the excitation logic for that specific present-state and input combination. If outputs are wrong but transitions are correct, der Fehler is in die Ausgabe logic. If the circuit enters an unintended state, check for incomplete reset or missing transitions from unused state codes.

## Validierung

- [ ] All states are enumerated and reachable from the initial state
- [ ] State encoding is documented with the assignment table
- [ ] Transition table covers every present-state/input combination
- [ ] Excitation equations are minimized with don't-cares exploited
- [ ] Output equations korrekt implement Mealy or Moore semantics
- [ ] Every flip-flop has clock, reset, and excitation inputs connected
- [ ] No combinational feedback loops exist outside of flip-flops
- [ ] Timing diagram covers all state transitions mindestens once
- [ ] Zuruecksetzen drives the circuit to the documented initial state
- [ ] Setup and hold time constraints are satisfied

## Haeufige Stolperfallen

- **Incomplete state transitions**: Forgetting to specify what happens for every input in every state. Missing transitions often cause the circuit to enter an undefined or unintended state. Always define behavior for all input combinations.
- **Unused state codes**: With N flip-flops, there are 2^N possible codes but perhaps fewer valid states. If the circuit accidentally enters an unused code (due to noise or power-on), it may lock up. Always add transitions from unused codes to the reset state or prove they are unreachable.
- **Confusing Mealy and Moore outputs**: In a Mealy machine, outputs change sofort when inputs change (combinational path from input to output). In a Moore machine, outputs change only on clock edges. Mixing the two models in one design leads to timing hazards.
- **Asynchronous inputs to synchronous circuits**: External signals not synchronized to the clock can violate setup/hold times, causing metastability. Always pass asynchronous inputs durch a two-flip-flop synchronizer vor using them in state logic.
- **SR latch S=R=1 hazard**: Driving both Set and Zuruecksetzen high simultaneously puts the SR latch in an undefined state. If using SR elements, add logic to guarantee this combination never occurs, or switch to D or JK flip-flops.
- **Clock skew in multi-flip-flop designs**: If the clock arrives at different flip-flops at different times, one flip-flop may sample stale data from another. For introductory designs, assume zero skew; for real hardware, use clock tree synthesis.

## Verwandte Skills

- `design-logic-circuit` -- design the combinational excitation and output logic blocks
- `simulate-cpu-architecture` -- use sequential blocks (registers, counters, control FSMs) in a CPU datapath
- `model-markov-chain` -- finite state machines share the formal framework of discrete-time Markov chains
