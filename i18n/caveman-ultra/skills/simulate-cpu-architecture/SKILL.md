---
name: simulate-cpu-architecture
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design + simulate min CPU from scratch: define ISA, build datapath
  (ALU, reg file, PC, mem interface), design control unit (hardwired |
  microprogrammed), impl fetch-decode-exec cycle, verify by tracing small
  prog clock cycle by cycle. Capstone "computer inside computer" exercise
  composing combinational + sequential blocks → complete processor.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: advanced
  language: multi
  tags: digital-logic, cpu-architecture, instruction-set, datapath, fetch-decode-execute
---

# Simulate CPU Architecture

Design min but complete CPU: ISA → ALU+regfile → datapath → control unit → fetch-decode-exec cycle → simulate small prog → verify each cycle vs expected reg+mem.

## Use When

- Learn/teach computer arch from first principles
- Design custom CPU → FPGA | educational sim
- Verify understanding of inst exec at gate + RTL level
- Build sw sim (Python, JS, walkthrough) of CPU
- Compose combinational (design-logic-circuit) + sequential (build-sequential-circuit) blocks → working system

## In

- **Required**: Complexity target — 4/8/16-bit data; reg count (2-16)
- **Required**: Min ISA — load, store, add, sub, AND/OR, branch, halt
- **Optional**: Addressing modes beyond direct (immediate, reg-indirect, indexed)
- **Optional**: Extra instr (mul, shift, cmp, jump-and-link)
- **Optional**: Mem size, word size
- **Optional**: Pipeline stages (single, multi, pipelined) — default multi
- **Optional**: Medium — sw sim (Py/JS), HDL (Verilog/VHDL), paper

## Do

### Step 1: Define ISA

Spec everything programmer needs for machine code.

1. **Data width**: bit width data (ALU operand) + addr. Common: 8/8 (256B), 16/16.
2. **Reg file**: count GP + special-purpose.
   - **GP**: R0-R(N-1). R0 hardwired zero? (simplifies encoding)
   - **Special**: PC, IR, Status/Flags (Z, C, N, V).
3. **Inst format**: fixed-width word. Bit fields:
   - **Opcode**: K bits → 2^K instr
   - **Reg fields**: src + dst. N regs → ceil(log2(N)) bits each
   - **Imm/offset**: constants | branch offsets. Remaining bits.
4. **Inst catalog**: each w/ mnemonic, opcode, operand fields, RTL op, flags affected.
5. **Addressing**:
   - **Reg**: in reg
   - **Immediate**: embedded in inst
   - **Direct**: addr in inst
   - **Reg-indirect**: addr in reg

```markdown
## ISA Specification
- **Data width**: [N] bits
- **Address width**: [M] bits
- **Registers**: [count] general-purpose + [list of special-purpose]
- **Instruction width**: [W] bits

### Instruction Format
| Field    | Bits      | Width |
|----------|-----------|-------|
| Opcode   | [W-1:X]  | [n]   |
| Rd       | [X-1:Y]  | [n]   |
| Rs       | [Y-1:Z]  | [n]   |
| Imm      | [Z-1:0]  | [n]   |

### Instruction Catalog
| Mnemonic | Opcode | Format    | RTL Operation          | Flags |
|----------|--------|-----------|------------------------|-------|
| LOAD     | 0000   | Rd, [addr]| Rd <- MEM[addr]       | -     |
| STORE    | 0001   | Rs, [addr]| MEM[addr] <- Rs       | -     |
| ADD      | 0010   | Rd, Rs    | Rd <- Rd + Rs         | Z,C,N |
| ...      | ...    | ...       | ...                    | ...   |
| HALT     | 1111   | -         | Stop execution         | -     |
```

**Got:** Complete ISA. Each instr = unique opcode, well-defined operand fields, unambiguous RTL, doc'd flag effects. Decodable w/o ambiguity.

**If err:** Inst word too narrow → widen | reduce regs | var-length (more complex decode) | split into sub-ops. Opcode collisions → reassign.

### Step 2: Design Datapath

Build RTL hardware moving + transforming data.

1. **ALU** (via design-logic-circuit). Two N-bit operands + op select → N-bit result + flags (Z, C, N, V).
   - Ops: ADD, SUB (2's comp), AND, OR, XOR, NOT, SHL, SHR, PASS-THROUGH (moves, loads).
   - Select width fits all ops.
2. **Reg file** (via build-sequential-circuit). Bank w/:
   - 2 read ports (combinational, addr in)
   - 1 write port (clocked, RegWrite enable)
   - R0 hardwired zero → override writes
3. **PC**: N-bit reg w/:
   - Increment logic (PC + width/8 → next sequential)
   - Load input → branch/jump targets
   - Mux select increment | branch (PCsrc)
4. **Mem interface**: separate | unified inst+data.
   - **Harvard**: separate inst (RO) + data (RW). Simpler, simultaneous fetch + data.
   - **Von Neumann**: shared. Sequence fetch + data in diff cycles.
5. **Interconnect**: muxes + buses:
   - ALU A mux: regA | PC (PC-relative)
   - ALU B mux: regB | sign-extended imm
   - RegWrite mux: ALU result | mem read (loads)
   - Mem addr mux: PC (fetch) | ALU result (load/store)

```markdown
## Datapath Components
| Component       | Width  | Ports / Signals                    |
|----------------|--------|------------------------------------|
| ALU            | [N]-bit| OpA, OpB, ALUop -> Result, Flags  |
| Register File  | [N]-bit| RdAddrA, RdAddrB, WrAddr, WrData, RegWrite -> RdDataA, RdDataB |
| PC             | [M]-bit| PCnext, PCwrite -> PCout           |
| Instruction Mem| [W]-bit| Addr -> Instruction                |
| Data Memory    | [N]-bit| Addr, WrData, MemRead, MemWrite -> RdData |

## Datapath Multiplexers
| Mux Name     | Inputs               | Select Signal | Output      |
|-------------|----------------------|---------------|-------------|
| ALU_B_mux   | RegDataB, Immediate  | ALUsrc        | ALU OpB     |
| WrData_mux  | ALU Result, MemData  | MemToReg      | Reg WrData  |
| PC_mux      | PC+1, BranchTarget   | PCsrc         | PC next     |
```

**Got:** Complete datapath (component + mux table). Every ISA instr has viable path src → dst through ALU, regfile, mem.

**If err:** Inst can't exec on datapath (e.g. no path mem→reg for LOAD) → add missing mux/path. Walk each instr RTL, trace signal flow.

### Step 3: Design Control Unit

Logic orchestrating datapath per instr.

1. **ID control signals**: every mux select, RegWrite, MemRead/Write, ALU op select.
2. **Single-cycle** (simplest): combinational. All signals from opcode in 1 clock.
3. **Multi-cycle** (recommended for learning): FSM (build-sequential-circuit) phases:
   - **Fetch**: read inst from mem at PC; → IR; PC++.
   - **Decode**: read regfile (IR fields); sign-extend imm.
   - **Execute**: ALU op | compute mem addr.
   - **Mem access** (load/store only): read | write data mem.
   - **Write-back**: result → dst reg.
4. **Control signal table**: per instr, per phase, each signal value.
5. **Hardwired vs microprogrammed**:
   - **Hardwired**: gates + flip-flops. Faster, less flexible.
   - **Microprogrammed**: ROM stores signals per state. Each microinst = signals + next-state. Slower, easy to modify.

```markdown
## Control Signals
| Signal     | Width | Function                              |
|-----------|-------|---------------------------------------|
| ALUop     | [k]   | Selects ALU operation                 |
| ALUsrc    | 1     | 0=register, 1=immediate for ALU B    |
| RegWrite  | 1     | Enable register file write            |
| MemRead   | 1     | Enable data memory read               |
| MemWrite  | 1     | Enable data memory write              |
| MemToReg  | 1     | 0=ALU result, 1=memory data to register |
| PCsrc     | 1     | 0=PC+1, 1=branch target              |
| IRwrite   | 1     | Enable instruction register load      |

## Multi-Cycle Control FSM
| State   | Active Signals                          | Next State         |
|---------|----------------------------------------|-------------------|
| FETCH   | MemRead, IRwrite, PC <- PC+1           | DECODE             |
| DECODE  | Read registers, sign-extend immediate   | EXECUTE            |
| EXECUTE | ALUop=[per instruction], ALUsrc=[...]  | MEM_ACCESS or WB   |
| MEM_ACC | MemRead or MemWrite                    | WRITE_BACK         |
| WB      | RegWrite, MemToReg=[...]               | FETCH              |
```

**Got:** Control unit (combinational | FSM) generates correct signals per instr per phase. No conflicts (e.g. MemRead+MemWrite simultaneous on same mem).

**If err:** Signal conflict → phases not separated. Load + store access mem in diff phases | mem supports separate r/w ports. Too many states → check shared phases, merge.

### Step 4: Implement Fetch-Decode-Execute Cycle

Connect datapath + control → working CPU.

1. **Clock**: → all flip-flops (PC, IR, regfile, FSM state). All updates same edge.
2. **Phase sequencing**: FSM outs → datapath signals. FSM advances 1 state/clock → Fetch → Decode → Exec → Mem → WB.
3. **Inst fetch**: FETCH → PC drives instMem addr. Fetched → IR. PC += 1 instr width.
4. **Inst decode**: DECODE → opcode field of IR → control unit → instr type. Reg addrs from IR → regfile read ports.
5. **Exec + beyond**: per instr type:
   - **ALU**: Exec (ALU computes), WB (→ reg).
   - **Load**: Exec (addr), Mem (read), WB (→ reg).
   - **Store**: Exec (addr), Mem (write).
   - **Branch**: Exec (cmp | flags), conditional PC update.
   - **Halt**: FSM → terminal state, stops.
6. **Interrupts/exceptions** (optional): save PC + jump to handler. Needs extra states + cause reg.

```markdown
## Cycle Execution Summary
| Instruction Type | Phases                          | Cycles |
|-----------------|--------------------------------|--------|
| ALU (reg-reg)   | Fetch, Decode, Execute, WB     | 4      |
| Load            | Fetch, Decode, Execute, Mem, WB| 5      |
| Store           | Fetch, Decode, Execute, Mem    | 4      |
| Branch (taken)  | Fetch, Decode, Execute         | 3      |
| Branch (not taken)| Fetch, Decode, Execute       | 3      |
| Halt            | Fetch, Decode                  | 2      |
```

**Got:** Fully connected CPU. FSM drives datapath through correct sequence. State transitions sync on clock edge.

**If err:** Hangs (no HALT) | wrong results → likely control signal err in 1 specific phase. Use Step 5 trace → isolate failing cycle. PC not incrementing → check FETCH wiring. Wrong reg written → check addr field extraction from IR.

### Step 5: Simulate Small Program + Verify

Exec concrete prog, verify each cycle vs expected.

1. **Test prog**: small enough to trace fully (5-15 instr), complex enough to exercise multiple types. Fibonacci ideal: load-imm, add, branch, halt.
2. **Init**: regs = 0. Prog → instMem at addr 0. PC = 0. FSM = FETCH.
3. **Cycle trace**: per cycle record:
   - FSM state + phase
   - PC + inst fetched/exec'd
   - ALU ins, op, result
   - Reg reads + writes
   - Mem reads + writes
   - Flag values
   - All control signal values
4. **Verify vs hand computation**: independently compute expected reg+mem state after each instr (not each cycle — instr = multiple cycles). Compare.
5. **Edge cases**:
   - Branch not taken (PC++)
   - Branch taken (PC = target)
   - Load → immediate use (WB completes before next decode reads?)
   - Write to R0 if hardwired (no effect)
   - HALT (clean stop)

```markdown
## Test Program: Fibonacci (first 8 terms)
| Addr | Instruction    | Mnemonic         | Comment              |
|------|---------------|------------------|----------------------|
| 0x00 | [encoding]    | LOAD R1, #1      | R1 = 1 (F1)         |
| 0x01 | [encoding]    | LOAD R2, #1      | R2 = 1 (F2)         |
| 0x02 | [encoding]    | LOAD R3, #6      | R3 = 6 (loop count) |
| 0x03 | [encoding]    | ADD R4, R1, R2   | R4 = R1 + R2        |
| 0x04 | [encoding]    | MOV R1, R2       | R1 = R2              |
| 0x05 | [encoding]    | MOV R2, R4       | R2 = R4              |
| 0x06 | [encoding]    | SUB R3, R3, #1   | R3 = R3 - 1         |
| 0x07 | [encoding]    | BNZ 0x03         | Branch if R3 != 0   |
| 0x08 | [encoding]    | HALT             | Stop                 |

## Cycle-by-Cycle Trace (excerpt)
| Cycle | Phase   | PC  | IR       | ALU Op   | Result | RegWrite | Flags |
|-------|---------|-----|----------|----------|--------|----------|-------|
| 1     | FETCH   | 0x00| LOAD R1,1| -        | -      | No       | -     |
| 2     | DECODE  | 0x01| LOAD R1,1| -        | -      | No       | -     |
| 3     | EXECUTE | 0x01| LOAD R1,1| PASS #1  | 1      | No       | -     |
| 4     | WB      | 0x01| LOAD R1,1| -        | -      | R1 <- 1  | -     |
| ...   | ...     | ... | ...      | ...      | ...    | ...      | ...   |

## Expected Final State
| Register | Value | Description         |
|----------|-------|---------------------|
| R1       | [val] | Second-to-last Fib  |
| R2       | [val] | Last computed Fib   |
| R3       | 0     | Loop counter done   |
| R4       | [val] | Same as R2          |
| PC       | 0x09  | One past HALT       |
```

**Got:** Trace matches expected final state. Every instr → correct reg+mem updates. Prog terminates at HALT w/ correct Fib values.

**If err:** Compare first divergence expected vs actual. Common: (1) ALU op select wrong for instr type → check control table. (2) Branch offset off-by-one → verify PC-relative from current | next instr. (3) WB writes wrong reg → check reg addr extraction. (4) Flags not updated → trace ALU flag logic for operands causing mismatch.

## Check

- [ ] ISA has load, store, add, sub, AND, OR, branch, halt min
- [ ] Each instr unique opcode + unambiguous encoding
- [ ] Datapath valid signal path for every instr RTL
- [ ] ALU supports all req ops + correct flag gen
- [ ] Regfile sufficient r/w ports for inst format
- [ ] Control unit correct signals per instr per phase
- [ ] No signal conflicts (simultaneous r/w same mem port)
- [ ] Fetch-decode-exec fully connected + clocked
- [ ] Test prog runs to completion w/ correct final state
- [ ] Cycle trace verified vs hand computation
- [ ] Branch taken + not-taken both verified
- [ ] HALT stops cleanly

## Traps

- **Branch offset off-by-one**: Branches relative to current PC | PC+1 | inst after. Define convention in ISA + impl consistent. #1 most common CPU design bug.
- **WB/decode hazard in multi-cycle**: Inst I writes reg in WB while I+1 reads in decode → may get old value. Multi-cycle (one at a time) = fine. Pipelined → forwarding | stalling.
- **Forget PC++ in fetch**: PC not incremented in FETCH → executes same inst forever. Trivially common wiring err.
- **ALU flags latching**: Update only on ALU instr, not loads/stores/branches. Unconditional → load between cmp + branch corrupts comparison.
- **Unsigned vs signed**: Decide at ISA time → 2's comp signed | unsigned. Carry flag = diff semantics.
- **Mem alignment**: Data + inst widths differ | multi-byte instr → align rules. 16-bit instr in byte-addressable → 2 addrs; PC += 2 not 1.
- **Overcomplicate first design**: Start simplest (8-bit, 4 regs, 8 instr, single | multi-cycle, no pipeline). Working simple > broken complex.

## →

- `design-logic-circuit` — ALU, muxes, decoders, combinational
- `build-sequential-circuit` — regfile, PC, control FSM, sequential
- `evaluate-boolean-expression` — simplify control logic for hardwired
- `derive-theoretical-result` — perf analysis (CPI, throughput, Amdahl)
