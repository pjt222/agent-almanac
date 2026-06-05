---
name: physical-computing
description: Cross-disciplinary team for projects spanning digital logic design and physical implementation — from Boolean gates through electromagnetic switching to complete computing systems
lead: logician
version: "1.0.0"
author: Philipp Thoss
created: 2026-03-11
updated: 2026-03-11
tags: [digital-logic, electromagnetism, cpu, computer-architecture, cross-disciplinary, physics]
coordination: sequential
members:
  - id: logician
    role: Lead
    responsibilities: Designs the logical architecture (ISA, datapath, control unit, gate-level implementation), distributes tasks, and synthesizes all findings into the final design
  - id: physicist
    role: Physical Realization Specialist
    responsibilities: Analyzes physical feasibility of the logical design (electromagnetic switching, signal propagation, power dissipation, levitation-based concepts)
  - id: theoretical-researcher
    role: Mathematical Foundation Advisor
    responsibilities: Provides formal underpinning (Boolean algebra proofs, information-theoretic bounds, computational completeness, quantum computing connections)
---

# Physical Computing Team

A three-agent team that spans from abstract logic to physical realization, combining digital logic design, electromagnetic physics, and theoretical mathematics. The lead (logician) architects the computing system, the physicist analyzes its physical implementation, and the theoretical researcher verifies the mathematical foundations. Together they can take a project from "here is a NAND gate" to "here is a working, physically grounded computer."

## Purpose

Building a computer from first principles is inherently cross-disciplinary. The logical design (gates, circuits, CPU architecture) requires one kind of expertise, the physical realization (how transistors switch, how signals propagate, how heat dissipates) requires another, and the mathematical verification (Boolean algebra completeness, Turing equivalence, information-theoretic bounds) requires a third. No single agent covers this full scope.

This team ensures that every physical computing project considers three dimensions:

- **Logical architecture**: gate-level design, circuit optimization, instruction set completeness
- **Physical feasibility**: electromagnetic switching speeds, power consumption, signal integrity, and alternative computing substrates (magnetic, optical, levitation-based)
- **Mathematical rigor**: formal proofs of functional correctness, computational completeness, and performance bounds

## Team Composition

| Member | Agent | Role | Focus Areas |
|--------|-------|------|-------------|
| Lead | `logician` | Lead | ISA design, datapath, control unit, gate-level implementation, simulation |
| Physics | `physicist` | Physical Realization Specialist | EM switching, signal propagation, power analysis, levitation concepts |
| Theory | `theoretical-researcher` | Mathematical Foundation Advisor | Boolean algebra proofs, Turing completeness, information theory, quantum connections |

## Coordination Pattern

Sequential: the logician designs first, the physicist analyzes physical constraints, the theoretical researcher verifies foundations, and the logician synthesizes.

```
logician (Lead)  -->  physicist  -->  theoretical-researcher  -->  logician (Synthesis)
   [design]         [physical]       [mathematical]               [final]
```

**Flow:**

1. **Logician** receives the request and designs the logical architecture (gates, circuits, ISA, datapath, control unit)
2. **Physicist** analyzes the physical realization: switching speeds, electromagnetic interference, power dissipation, thermal constraints, signal integrity, and any levitation-based computing concepts
3. **Theoretical researcher** verifies the mathematical foundations: proves the gate set is functionally complete, verifies the ISA is Turing-complete (if applicable), establishes information-theoretic bounds on performance
4. **Logician** synthesizes all findings, adjusts the design if physical or theoretical constraints require it, and delivers the final result

## Task Decomposition

### Phase 1: Logical Design (Logician)
The logician examines the request and produces the core design:

- Determine scope: Boolean simplification, circuit design, FSM, or full CPU
- Design the logical architecture at the appropriate abstraction level
- Identify components that need physical feasibility analysis
- Flag any claims that need formal mathematical proof

### Phase 2: Physical Analysis (Physicist)
The physicist evaluates the logical design against physical reality:

- Analyze switching characteristics of the chosen technology (CMOS, relay, magnetic, optical)
- Calculate power consumption and heat dissipation
- Evaluate signal propagation delays and maximum clock frequency
- Assess alternative physical substrates if the design pushes conventional limits
- Report physical constraints that may require design modifications

### Phase 3: Mathematical Verification (Theoretical Researcher)
The theoretical researcher provides formal foundations:

- Prove functional completeness of the gate set (if the design uses a restricted set like NAND-only)
- Verify computational completeness of the instruction set (Turing equivalence)
- Establish performance bounds (circuit depth, gate count lower bounds)
- Connect to broader theoretical context (Shannon's switching theory, Landauer's principle, quantum computing parallels)

### Phase 4: Synthesis (Logician)
The logician integrates all findings:

- Incorporate physical constraints into the design (adjust clock frequency, add pipeline stages, modify power budget)
- Annotate the design with theoretical guarantees (completeness proofs, performance bounds)
- Produce the final deliverable: a complete, physically grounded, mathematically verified computing system design

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: physical-computing
  lead: logician
  coordination: sequential
  members:
    - agent: logician
      role: Lead
      subagent_type: logician
    - agent: physicist
      role: Physical Realization Specialist
      subagent_type: physicist
    - agent: theoretical-researcher
      role: Mathematical Foundation Advisor
      subagent_type: theoretical-researcher
  tasks:
    - name: design-logical-architecture
      assignee: logician
      description: Design the gate-level, circuit-level, or CPU-level logical architecture
    - name: analyze-physical-realization
      assignee: physicist
      description: Evaluate physical feasibility including switching, power, signal integrity, and alternative substrates
      blocked_by: [design-logical-architecture]
    - name: verify-mathematical-foundations
      assignee: theoretical-researcher
      description: Prove functional completeness, computational completeness, and establish performance bounds
      blocked_by: [design-logical-architecture]
    - name: synthesize-final-design
      assignee: logician
      description: Integrate physical constraints and theoretical guarantees into the final design
      blocked_by: [analyze-physical-realization, verify-mathematical-foundations]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Computer Inside a Computer
Build a complete CPU from NAND gates.

```
User: Use the physical-computing team to build a working 8-bit CPU from nothing but NAND gates
```

The logician designs a minimal 8-bit ISA (LOAD, STORE, ADD, SUB, AND, JMP, JZ, HALT), constructs the datapath entirely from NAND gates (ALU, register file, program counter), and designs a hardwired control unit. The physicist analyzes CMOS NAND gate switching characteristics, estimates the maximum clock frequency (~100 MHz in 180nm CMOS), and calculates power consumption. The theoretical researcher proves NAND is functionally complete (can express all 16 binary Boolean functions), proves the ISA is Turing-complete (by simulating a 2-counter machine), and notes Landauer's bound on minimum energy per gate operation. The logician synthesizes a final design with clock frequency, power budget, and gate count, plus a Python simulation running Fibonacci.

### Scenario 2: Alternative Computing Substrate
Analyze a magnetically-levitated computing element.

```
User: Have the physical-computing team analyze whether you could build logic gates using magnetically levitated elements
```

The logician proposes a scheme where the position of a levitated magnetic bead (left or right of a potential well) represents 0 or 1, and interaction between adjacent beads implements logic. The physicist analyzes the electromagnetic forces involved, calculates switching speeds (limited by mechanical oscillation frequency, ~kHz range), evaluates the feasibility of diamagnetic or active-feedback levitation for the beads, and identifies thermal noise as the fundamental limit on reliability. The theoretical researcher proves the proposed gate set is functionally complete and estimates the entropy cost per operation via Landauer's principle. The logician concludes that while physically possible, the approach is ~10^6 times slower than CMOS — suitable only as a demonstration or educational tool.

### Scenario 3: Proving an ISA is Turing-Complete
Verify that a minimal instruction set can compute anything.

```
User: I designed a processor with only MOV and SUBLEQ. Is it Turing-complete?
```

The logician analyzes the instruction semantics and constructs implementations of basic operations (addition, conditional branching, memory access) from MOV and SUBLEQ. The physicist notes that SUBLEQ-based processors have minimal hardware requirements (single ALU operation, one branch type). The theoretical researcher provides the formal proof: SUBLEQ alone is Turing-complete (by reduction to a universal Turing machine via the Minsky construction), so MOV+SUBLEQ is Turing-complete a fortiori. The logician delivers the completeness certificate with example programs.

## Limitations

- Does not replace electronic design automation (EDA) tools — provides conceptual designs, not manufacturable layouts
- Physical analysis is analytical, not simulation-based (no SPICE, no FEA)
- CPU designs are pedagogical (4-16 bit) rather than production-grade
- Sequential coordination means the full pipeline takes longer than a single-agent task; use individual agents for domain-specific questions that do not need cross-disciplinary analysis
- Does not cover quantum computing architectures (pair with theoretical-researcher separately for that)

## See Also

- [logician](../agents/logician.md) — Lead agent for digital logic and CPU architecture
- [physicist](../agents/physicist.md) — Classical physics and electromagnetic device specialist
- [theoretical-researcher](../agents/theoretical-researcher.md) — Theoretical science research agent
- [evaluate-boolean-expression](../skills/evaluate-boolean-expression/SKILL.md) — Boolean algebra skill
- [simulate-cpu-architecture](../skills/simulate-cpu-architecture/SKILL.md) — CPU simulation skill
- [formulate-maxwell-equations](../skills/formulate-maxwell-equations/SKILL.md) — Maxwell's equations skill
- [analyze-magnetic-levitation](../skills/analyze-magnetic-levitation/SKILL.md) — Magnetic levitation analysis

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-03-11
