---
name: design-logic-circuit
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

Translate a functional specification into a combinational logic circuit by defining inputs and outputs, deriving a minimal Boolean expression, mapping it to a gate-level schematic, optionally converting to a universal gate basis (NAND-only or NOR-only), and verifying correctness through exhaustive simulation against the original truth table.

## When to Use

- Implementing a Boolean function as a physical or simulated gate network
- Designing standard combinational building blocks (adders, multiplexers, decoders, comparators)
- Converting an arbitrary gate network to NAND-only or NOR-only form for manufacturing constraints
- Teaching or reviewing digital logic design from specification to schematic
- Preparing the combinational datapath components needed by build-sequential-circuit or simulate-cpu-architecture

## Inputs

- **Required**: Functional specification -- one of: truth table, Boolean expression, verbal description of input/output behavior, or a standard block name (e.g., "4-bit ripple-carry adder")
- **Required**: Target gate library -- unrestricted (AND/OR/NOT), NAND-only, NOR-only, or a specific standard cell library
- **Optional**: Optimization goal -- minimize gate count, minimize propagation delay (critical path), or minimize fan-out
- **Optional**: Maximum fan-in constraint (e.g., 2-input gates only)
- **Optional**: Don't-care conditions for inputs that will never occur

## Procedure

### Step 1: Specify Circuit Function

Define the circuit's interface and behavior completely before any synthesis:

1. **Input signals**: List all input signals with their names, bit widths, and valid ranges. For multi-bit inputs, specify bit ordering (MSB-first or LSB-first).
2. **Output signals**: List all output signals with their names and bit widths.
3. **Truth table**: Write the complete truth table mapping every input combination to the corresponding outputs. For circuits with many inputs, express the function algebraically or as a set of minterms/maxterms instead.
4. **Don't-care conditions**: Identify input combinations that cannot occur in practice (e.g., BCD inputs 1010-1111) and mark them as don't-cares.
5. **Timing requirements**: Note any propagation delay constraints, though combinational circuits have no clock -- timing here refers to worst-case gate delay through the critical path.

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

**Expected:** A complete, unambiguous specification where every legal input combination maps to exactly one output value.

**On failure:** If the specification is ambiguous (e.g., missing cases, conflicting outputs for the same input), request clarification. Do not assume don't-care for unspecified inputs unless explicitly told to.

### Step 2: Derive Minimal Boolean Expression

Obtain the simplest expression for each output using the evaluate-boolean-expression skill:

1. **Single-output functions**: For each output bit, apply evaluate-boolean-expression to get the minimal SOP (or POS, depending on which yields fewer gates).
2. **Multi-output optimization**: If multiple outputs share common sub-expressions, identify shared product terms that can be factored out. This reduces total gate count at the expense of slightly more complex routing.
3. **XOR detection**: Scan for XOR/XNOR patterns in the truth table (checkerboard patterns in the K-map). XOR gates are expensive in NAND/NOR-only implementations but efficient in standard libraries.
4. **Record the expressions**: Document the minimal expression for each output, noting the literal count and the number of product/sum terms.

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

**Expected:** A minimal Boolean expression for each output, with shared sub-expressions identified for multi-output circuits.

**On failure:** If the expressions appear non-minimal (more literals than expected for the function's complexity), re-run the K-map or Quine-McCluskey step from evaluate-boolean-expression. For functions with more than 6 variables, use Espresso or a similar heuristic minimizer.

### Step 3: Map to Gate-Level Schematic

Convert the Boolean expressions into a network of logic gates:

1. **Direct mapping (SOP)**: Each product term becomes a multi-input AND gate. The sum of products becomes an OR gate fed by the AND gates. Each complemented variable requires a NOT gate (or use NAND/NOR to absorb inversions).
2. **Gate assignment**: For each gate, record:
   - Gate type (AND, OR, NOT, XOR, NAND, NOR)
   - Input signals (by name or from the output of another gate)
   - Output signal name
   - Fan-in (number of inputs)
3. **Fan-in decomposition**: If a gate exceeds the maximum fan-in constraint, decompose it into a tree of smaller gates. For example, a 4-input AND with a 2-input constraint becomes two 2-input ANDs feeding a third 2-input AND.
4. **Schematic notation**: Draw the circuit using text-based notation or describe the netlist in a structured format.

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

**Expected:** A complete gate-level netlist where every output can be traced back to primary inputs through a chain of gates, with no floating (unconnected) inputs or outputs.

**On failure:** If the netlist has dangling wires or feedback loops (which are invalid in combinational circuits), recheck the mapping. Every signal must have exactly one driver and every gate input must connect to either a primary input or another gate's output.

### Step 4: Convert to Universal Gate Basis (Optional)

Transform the circuit to use only NAND gates or only NOR gates:

1. **NAND-only conversion**:
   - Replace each AND gate with a NAND followed by a NOT (NAND with tied inputs).
   - Replace each OR gate using De Morgan: `A + B = ((A')*(B'))' = NAND(A', B')`, so use NOTs on inputs then NAND.
   - Replace each NOT gate with a NAND gate with both inputs tied together: `A' = NAND(A, A)`.
   - **Bubble pushing**: Simplify by canceling adjacent inversions. Two NOTs in series cancel. A NAND feeding a NOT is equivalent to an AND.
2. **NOR-only conversion**:
   - Replace each OR gate with a NOR followed by a NOT.
   - Replace each AND gate using De Morgan: `A * B = ((A')+(B'))' = NOR(A', B')`.
   - Replace each NOT gate with `NOR(A, A)`.
   - Apply bubble pushing to cancel inversions.
3. **Gate count comparison**: Record the gate count before and after conversion. NAND-only and NOR-only implementations typically use more gates but simplify manufacturing (single gate type on a chip).

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

**Expected:** A functionally equivalent circuit using only the target gate type, with redundant inversions eliminated via bubble pushing.

**On failure:** If the converted circuit has more inversions than expected, re-examine the bubble-pushing step. A common mistake is forgetting that NAND and NOR are self-dual under complementation -- applying De Morgan consistently from outputs back to inputs avoids this.

### Step 5: Verify via Exhaustive Simulation

Confirm the circuit produces correct outputs for every possible input:

1. **Simulation approach**: For circuits with up to 16 inputs (65,536 combinations), simulate every input exhaustively. For larger circuits, use targeted test vectors covering corner cases, boundary conditions, and random samples.
2. **Propagate values**: For each input combination, propagate signal values gate by gate from inputs to outputs, respecting the topological order (no gate is evaluated before its inputs are ready).
3. **Compare against specification**: Check each output against the truth table or expected function from Step 1. Don't-care outputs may be either 0 or 1.
4. **Record results**: Log any mismatches with the failing input combination and the expected versus actual output.
5. **Timing analysis** (optional): Count the gate levels on the longest path from any input to any output. Multiply by the per-gate delay to estimate worst-case propagation delay.

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

**Expected:** All test vectors pass. The circuit is functionally correct and the critical path depth is documented.

**On failure:** If any vector fails, trace the signal path for that input combination gate by gate to find the first gate producing an incorrect output. Common causes: a wire connected to the wrong gate input, a missing inversion, or an error in the NAND/NOR conversion.

## Validation

- [ ] All inputs and outputs are named and their bit widths are specified
- [ ] The truth table or minterm list covers all legal input combinations
- [ ] Boolean expressions are minimal (verified via K-map or Quine-McCluskey)
- [ ] Every gate in the netlist has all inputs connected and exactly one output
- [ ] No combinational feedback loops exist in the circuit
- [ ] Fan-in constraints are respected (all gates within the maximum fan-in)
- [ ] NAND/NOR conversion (if performed) preserves functional equivalence
- [ ] Bubble pushing has been applied to eliminate redundant inversions
- [ ] Exhaustive simulation passes for all non-don't-care input combinations
- [ ] Critical path depth is documented

## Common Pitfalls

- **Combinational feedback loops**: Accidentally connecting a gate's output back to its own input chain creates a sequential element (latch), not a combinational circuit. If state is needed, use the build-sequential-circuit skill instead.
- **Forgetting inversions in NAND/NOR conversion**: The most common conversion error is dropping a NOT gate during the De Morgan transformation. Always apply bubble pushing systematically from outputs to inputs, not ad hoc.
- **Exceeding fan-in without decomposition**: A 5-input AND gate is not available in a 2-input library. Decompose into a balanced tree to minimize propagation delay, not a linear chain.
- **Ignoring don't-cares**: Failing to exploit don't-care conditions during minimization leaves the circuit larger than necessary. Always include don't-cares when available.
- **Confusing gate delay with wire delay**: In introductory design, gate delay dominates. In real VLSI, wire delay (interconnect capacitance) can exceed gate delay. Note this limitation when estimating timing.
- **Multi-output hazards**: When multiple outputs share gates, changing one output's logic can inadvertently affect a shared sub-expression. Verify all outputs after any modification, not just the one being changed.

## Related Skills

- `evaluate-boolean-expression` -- derive the minimal Boolean expression used as input to this skill
- `build-sequential-circuit` -- add state elements (flip-flops) to create sequential circuits
- `simulate-cpu-architecture` -- use combinational blocks (ALU, mux, decoder) as datapath components
