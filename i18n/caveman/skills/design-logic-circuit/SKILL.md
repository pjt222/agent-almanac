---
name: design-logic-circuit
locale: caveman
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

Translate functional specification into combinational logic circuit by defining inputs and outputs, deriving minimal Boolean expression, mapping to gate-level schematic, optionally converting to universal gate basis (NAND-only or NOR-only), verifying correctness through exhaustive simulation against original truth table.

## When Use

- Do Boolean function as physical or simulated gate network
- Design standard combinational building blocks (adders, multiplexers, decoders, comparators)
- Convert arbitrary gate network to NAND-only or NOR-only form for manufacturing constraints
- Teach or review digital logic design from specification to schematic
- Prep combinational datapath components needed by build-sequential-circuit or simulate-cpu-architecture

## Inputs

- **Required**: Functional specification -- one of: truth table, Boolean expression, verbal description of input/output behavior, or standard block name (e.g., "4-bit ripple-carry adder")
- **Required**: Target gate library -- unrestricted (AND/OR/NOT), NAND-only, NOR-only, or specific standard cell library
- **Optional**: Optimization goal -- minimize gate count, minimize propagation delay (critical path), or minimize fan-out
- **Optional**: Maximum fan-in constraint (e.g., 2-input gates only)
- **Optional**: Don't-care conditions for inputs that will never occur

## Steps

### Step 1: Specify Circuit Function

Define circuit's interface and behavior completely before any synthesis:

1. **Input signals**: List all input signals with names, bit widths, valid ranges. For multi-bit inputs, specify bit ordering (MSB-first or LSB-first).
2. **Output signals**: List all output signals with names and bit widths.
3. **Truth table**: Write complete truth table mapping every input combination to corresponding outputs. For circuits with many inputs, express function algebraically or as set of minterms/maxterms instead.
4. **Don't-care conditions**: Identify input combinations that cannot occur in practice (e.g., BCD inputs 1010-1111) and mark as don't-cares.
5. **Timing requirements**: Note any propagation delay constraints. Combinational circuits have no clock -- timing here refers to worst-case gate delay through critical path.

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

**Got:** Complete, unambiguous specification where every legal input combination maps to exactly one output value.

**If fail:** If specification ambiguous (e.g., missing cases, conflicting outputs for same input), request clarification. Do not assume don't-care for unspecified inputs unless explicitly told to.

### Step 2: Derive Minimal Boolean Expression

Obtain simplest expression for each output using evaluate-boolean-expression skill:

1. **Single-output functions**: For each output bit, apply evaluate-boolean-expression to get minimal SOP (or POS, depending on which yields fewer gates).
2. **Multi-output optimization**: If multiple outputs share common sub-expressions, identify shared product terms that can be factored out. Reduces total gate count at expense of slightly more complex routing.
3. **XOR detection**: Scan for XOR/XNOR patterns in truth table (checkerboard patterns in K-map). XOR gates expensive in NAND/NOR-only implementations but efficient in standard libraries.
4. **Record expressions**: Document minimal expression for each output. Note literal count and number of product/sum terms.

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

**Got:** Minimal Boolean expression for each output. Shared sub-expressions identified for multi-output circuits.

**If fail:** If expressions appear non-minimal (more literals than expected for function's complexity), re-run K-map or Quine-McCluskey step from evaluate-boolean-expression. For functions with more than 6 variables, use Espresso or similar heuristic minimizer.

### Step 3: Map to Gate-Level Schematic

Convert Boolean expressions into network of logic gates:

1. **Direct mapping (SOP)**: Each product term becomes multi-input AND gate. Sum of products becomes OR gate fed by AND gates. Each complemented variable requires NOT gate (or use NAND/NOR to absorb inversions).
2. **Gate assignment**: For each gate, record:
   - Gate type (AND, OR, NOT, XOR, NAND, NOR)
   - Input signals (by name or from output of another gate)
   - Output signal name
   - Fan-in (number of inputs)
3. **Fan-in decomposition**: If gate exceeds maximum fan-in constraint, decompose into tree of smaller gates. For example, 4-input AND with 2-input constraint becomes two 2-input ANDs feeding third 2-input AND.
4. **Schematic notation**: Draw circuit using text-based notation or describe netlist in structured format.

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

**Got:** Complete gate-level netlist where every output can be traced back to primary inputs through chain of gates. No floating (unconnected) inputs or outputs.

**If fail:** If netlist has dangling wires or feedback loops (invalid in combinational circuits), recheck mapping. Every signal must have exactly one driver. Every gate input must connect to either primary input or another gate's output.

### Step 4: Convert to Universal Gate Basis (Optional)

Transform circuit to use only NAND gates or only NOR gates:

1. **NAND-only conversion**:
   - Replace each AND gate with NAND followed by NOT (NAND with tied inputs).
   - Replace each OR gate using De Morgan: `A + B = ((A')*(B'))' = NAND(A', B')`, so use NOTs on inputs then NAND.
   - Replace each NOT gate with NAND gate with both inputs tied together: `A' = NAND(A, A)`.
   - **Bubble pushing**: Simplify by canceling adjacent inversions. Two NOTs in series cancel. NAND feeding NOT is equivalent to AND.
2. **NOR-only conversion**:
   - Replace each OR gate with NOR followed by NOT.
   - Replace each AND gate using De Morgan: `A * B = ((A')+(B'))' = NOR(A', B')`.
   - Replace each NOT gate with `NOR(A, A)`.
   - Apply bubble pushing to cancel inversions.
3. **Gate count comparison**: Record gate count before and after conversion. NAND-only and NOR-only implementations typically use more gates but simplify manufacturing (single gate type on chip).

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

**Got:** Functionally equivalent circuit using only target gate type. Redundant inversions eliminated via bubble pushing.

**If fail:** If converted circuit has more inversions than expected, re-examine bubble-pushing step. Common mistake: forgetting NAND and NOR are self-dual under complementation -- applying De Morgan consistently from outputs back to inputs avoids this.

### Step 5: Verify via Exhaustive Simulation

Confirm circuit produces correct outputs for every possible input:

1. **Simulation approach**: For circuits with up to 16 inputs (65,536 combinations), simulate every input exhaustively. For larger circuits, use targeted test vectors covering corner cases, boundary conditions, random samples.
2. **Propagate values**: For each input combination, propagate signal values gate by gate from inputs to outputs, respecting topological order (no gate evaluated before its inputs are ready).
3. **Compare against specification**: Check each output against truth table or expected function from Step 1. Don't-care outputs may be either 0 or 1.
4. **Record results**: Log any mismatches with failing input combination and expected versus actual output.
5. **Timing analysis** (optional): Count gate levels on longest path from any input to any output. Multiply by per-gate delay to estimate worst-case propagation delay.

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

**Got:** All test vectors pass. Circuit functionally correct. Critical path depth documented.

**If fail:** If any vector fails, trace signal path for that input combination gate by gate to find first gate producing incorrect output. Common causes: wire connected to wrong gate input, missing inversion, or error in NAND/NOR conversion.

## Checks

- [ ] All inputs and outputs named and bit widths specified
- [ ] Truth table or minterm list covers all legal input combinations
- [ ] Boolean expressions minimal (verified via K-map or Quine-McCluskey)
- [ ] Every gate in netlist has all inputs connected and exactly one output
- [ ] No combinational feedback loops in circuit
- [ ] Fan-in constraints respected (all gates within maximum fan-in)
- [ ] NAND/NOR conversion (if performed) preserves functional equivalence
- [ ] Bubble pushing applied to eliminate redundant inversions
- [ ] Exhaustive simulation passes for all non-don't-care input combinations
- [ ] Critical path depth documented

## Pitfalls

- **Combinational feedback loops**: Accidentally connecting gate's output back to own input chain creates sequential element (latch), not combinational circuit. If state needed, use build-sequential-circuit skill instead.
- **Forgetting inversions in NAND/NOR conversion**: Most common conversion error: dropping NOT gate during De Morgan transformation. Always apply bubble pushing systematically from outputs to inputs, not ad hoc.
- **Exceeding fan-in without decomposition**: 5-input AND gate not available in 2-input library. Decompose into balanced tree to minimize propagation delay, not linear chain.
- **Ignoring don't-cares**: Failing to exploit don't-care conditions during minimization leaves circuit larger than necessary. Always include don't-cares when available.
- **Confusing gate delay with wire delay**: In introductory design, gate delay dominates. In real VLSI, wire delay (interconnect capacitance) can exceed gate delay. Note this limitation when estimating timing.
- **Multi-output hazards**: When multiple outputs share gates, changing one output's logic can inadvertently affect shared sub-expression. Verify all outputs after any modification, not just one being changed.

## See Also

- `evaluate-boolean-expression` -- derive minimal Boolean expression used as input to this skill
- `build-sequential-circuit` -- add state elements (flip-flops) to create sequential circuits
- `simulate-cpu-architecture` -- use combinational blocks (ALU, mux, decoder) as datapath components
