---
name: design-logic-circuit
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design combinational logic circuits from a functional specification through
  gate-level implementation. Covers AND, OR, NOT, XOR, NAND, NOR gates;
  NAND/NOR universality conversions; and standard building blocks including
  multiplexers, decoders, half/full adders, and ripple-carry adders. Use when
  translating a Boolean function or truth table into a hardware-realizable
  gate network and verifying it by exhaustive simulation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: intermediate
  language: multi
  tags: digital-logic, combinational-circuits, logic-gates, nand-universality, adders
---

# Design Logic Circuit

Spec → combinational circuit. Define I/O, derive min Bool expr, map → gate schematic, (optional) convert to universal gate basis (NAND/NOR), verify via exhaustive sim.

## Use When

- Bool fn → gate net (physical or sim)
- Std combinational blocks (adders, muxes, decoders, comparators)
- Convert arbitrary → NAND-only / NOR-only for mfg
- Teach/review digital logic spec → schematic
- Prep combinational datapath for build-sequential-circuit or simulate-cpu-architecture

## In

- **Required**: Spec — truth table, Bool expr, verbal I/O desc, or std block name (e.g., "4-bit ripple-carry adder")
- **Required**: Target gate lib — unrestricted (AND/OR/NOT), NAND-only, NOR-only, or std cell lib
- **Optional**: Optimize goal — min gate count, min prop delay (critical path), min fan-out
- **Optional**: Max fan-in (e.g., 2-input only)
- **Optional**: Don't-cares

## Do

### Step 1: Spec

Interface + behavior before synthesis:

1. **Inputs**: Names, widths, ranges. Multi-bit → bit order (MSB/LSB-first).
2. **Outputs**: Names + widths.
3. **Truth table**: Every input combo → outputs. Many inputs → algebraic or minterms/maxterms.
4. **Don't-cares**: Input combos that can't occur (BCD 1010-1111) → mark.
5. **Timing**: Prop delay constraints. Combinational = no clock → worst-case gate delay through critical path.

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

→ Unambiguous spec, every legal input → exactly one output.

If err: Ambiguous (missing cases, conflicting outputs) → clarify. Don't assume don't-care unless told.

### Step 2: Derive min Bool expr

evaluate-boolean-expression skill:

1. **Single-output**: Each bit → min SOP (or POS, whichever fewer gates).
2. **Multi-output**: Shared sub-exprs → factor out. Fewer gates + more routing.
3. **XOR detection**: Checkerboard patterns in K-map. XOR expensive in NAND/NOR-only, efficient in std libs.
4. **Record**: Min expr each output + literal count + term count.

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

→ Min expr each output + shared sub-exprs ID'd.

If err: Non-minimal (more literals than expected) → re-run K-map or Quine-McCluskey. >6 vars → Espresso.

### Step 3: Map → gate schematic

Bool → gate network:

1. **Direct SOP**: Product term → multi-input AND. Sum → OR fed by ANDs. Complemented var → NOT (or use NAND/NOR to absorb).
2. **Gate assignment**: Each gate:
   - Type (AND, OR, NOT, XOR, NAND, NOR)
   - Inputs (name or from other gate)
   - Output name
   - Fan-in
3. **Fan-in decomp**: Exceeds max → tree of smaller. 4-input AND w/ 2-input → 2 two-input ANDs feeding 3rd.
4. **Notation**: Text netlist or structured.

```markdown
## Gate-Level Netlist
| Gate ID | Type | Inputs       | Output | Fan-in |
|---------|------|-------------|--------|--------|
| G1      | NOT  | A           | A'     | 1      |
| G2      | AND  | A', B       | w1     | 2      |
| G3      | AND  | A, C        | w2     | 2      |
| G4      | OR   | w1, w2      | F      | 2      |

- **Total gates**: [count]
- **Critical path depth**: [number of gate levels from input to output]
```

→ Complete netlist, every output traceable to primary inputs, no floating.

If err: Dangling wires or feedback loops (invalid combinational) → recheck. Every signal = exactly one driver, every gate input connects.

### Step 4: Convert → universal basis (optional)

NAND-only or NOR-only:

1. **NAND-only**:
   - AND → NAND + NOT (NAND tied inputs)
   - OR → De Morgan: `A + B = ((A')*(B'))' = NAND(A', B')` → NOTs then NAND
   - NOT → `A' = NAND(A, A)`
   - **Bubble pushing**: Cancel adjacent inversions. 2 NOTs series cancel. NAND → NOT = AND.
2. **NOR-only**:
   - OR → NOR + NOT
   - AND → De Morgan: `A * B = ((A')+(B'))' = NOR(A', B')`
   - NOT → `NOR(A, A)`
   - Bubble push cancels inversions.
3. **Gate count**: Before + after. NAND/NOR-only typ more gates but simplify mfg.

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

→ Functionally equiv, redundant inversions eliminated via bubble push.

If err: More inversions than expected → re-examine bubble push. Common: forgetting NAND/NOR self-dual under complementation. De Morgan consistently from outputs back → inputs.

### Step 5: Verify via exhaustive sim

Correct for every input:

1. **Approach**: ≤16 inputs (65,536 combos) → exhaustive. Larger → targeted vectors + corner cases + random.
2. **Propagate**: Each combo, propagate gate by gate in topological order.
3. **Compare**: Check each output vs truth table. Don't-cares → 0 or 1.
4. **Record**: Mismatches w/ input + expected vs actual.
5. **Timing** (optional): Count gate levels longest path. × per-gate delay → worst-case prop.

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

→ All vectors pass. Functional + critical path docs.

If err: Vector fails → trace path gate by gate. First gate w/ incorrect output. Common: wire wrong input, missing inversion, NAND/NOR conversion err.

## Check

- [ ] All I/O named + widths spec'd
- [ ] Truth table covers all legal combos
- [ ] Bool exprs min (K-map/Quine-McCluskey)
- [ ] Every gate all inputs connected + exactly one output
- [ ] No combinational feedback
- [ ] Fan-in constraints respected
- [ ] NAND/NOR conversion preserves equivalence
- [ ] Bubble push eliminates redundant inversions
- [ ] Exhaustive sim passes (non-don't-cares)
- [ ] Critical path depth docs

## Traps

- **Combinational feedback**: Output → own input chain = latch, not combinational. State needed → build-sequential-circuit.
- **Forget inversions in NAND/NOR**: Most common err = dropping NOT in De Morgan. Bubble push systematically outputs → inputs, not ad hoc.
- **Exceed fan-in w/o decomp**: 5-input AND not in 2-input lib. Balanced tree min delay, not linear chain.
- **Ignore don't-cares**: Unexploited → bigger circuit. Always include when avail.
- **Gate vs wire delay**: Intro design → gate delay dominates. Real VLSI → wire delay can exceed. Note when estimating.
- **Multi-output hazards**: Shared gates → change one affects shared sub-expr. Verify all outputs after any mod.

## →

- `evaluate-boolean-expression` — derive min Bool expr for this skill
- `build-sequential-circuit` — add state (flip-flops) → sequential
- `simulate-cpu-architecture` — use blocks (ALU, mux, decoder) as datapath
