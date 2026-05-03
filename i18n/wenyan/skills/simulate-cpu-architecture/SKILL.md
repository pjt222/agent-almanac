---
name: simulate-cpu-architecture
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design and simulate a minimal CPU from scratch: define an instruction set
  architecture (ISA), build the datapath (ALU, register file, program counter,
  memory interface), design the control unit (hardwired or microprogrammed),
  implement the fetch-decode-execute cycle, and verify by tracing a small
  program clock cycle by clock cycle. The capstone "computer inside a computer"
  exercise that composes combinational and sequential building blocks into a
  complete processor.
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

# 仿 CPU 之構

自始設一極簡之 CPU：定指令集（ISA）、建資路（ALU、寄器、程計、憶介）、設控部（硬連或微程）、行取-解-執之循、以小程逐拍而驗。乃合組合與序列之諸件以成完備處理器之巔之練。

## 用時

- 由初本學或教計算機構乃用
- 為 FPGA 或教學仿器設定制處理器乃用
- 驗對指令於門與寄轉層執行之解乃用
- 立 CPU 之軟仿（Python、JavaScript、結構步走）乃用
- 合 design-logic-circuit 之組合塊與 build-sequential-circuit 之序列塊以成可行之系乃用

## 入

- **必要**：處理器之繁度——4 位、8 位、16 位資寬；通用寄器數（2-16）
- **必要**：最少之指令集——至少 load、store、add、subtract、AND/OR、branch、halt
- **可選**：直址外之尋址法（即時、寄間接、變址）
- **可選**：他指令（multiply、shift、compare、jal 為子程）
- **可選**：憶之大與字之寬
- **可選**：管階（單拍、多拍、流水）——默為多拍
- **可選**：實之媒——軟仿（Python/JS）、HDL（Verilog/VHDL）、紙上步走

## 法

### 第一步：定指令集架構

書凡為此 CPU 寫機碼者所須知者：

1. **資寬**：擇資（ALU 操作數之寬）與址之位寬。常選：8 位資／8 位址（256 位元組可址）、16 位資／16 位址。
2. **寄器組**：定通用寄器之數與特用寄器。
   - **通用**：R0-R(N-1)。決 R0 是否硬連於零（簡指令編碼）。
   - **特用**：程計（PC）、指令寄器（IR）、狀／旗寄器（Zero、Carry、Negative、Overflow）。
3. **指令格**：設固寬指令字。分位為域：
   - **操作碼**：定動之類。K 位則支 2^K 之指令。
   - **寄器域**：源與目寄器之址。N 寄則各域須 ceil(log2(N)) 位。
   - **即時／偏移域**：常數或分支偏。用餘位。
4. **指令目錄**：定各指令之名、操作碼編、操作數域、操作（以 RTL 標）、所影之旗。
5. **尋址法**：定操作數之所。
   - **寄器**：操作數於寄器中。
   - **即時**：操作數嵌於指令中。
   - **直址**：操作數址於指令中。
   - **寄間接**：操作數址於寄器中。

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

得：完之 ISA 規格——各指令有獨之操作碼、明之操作數域、不歧之 RTL 述、書旗之效。指令編可解而無歧。

敗則：若指令字太窄而不能容諸域，或寬之、或減寄器、或用變寬指令（解碼更繁）、或拆指令為子操作。若操作碼撞，重編之。

### 第二步：設資路

建寄器轉層之硬以動而變資：

1. **ALU**：以 design-logic-circuit 之技設之。ALU 受兩 N 位操作數與一操作選信，生 N 位之果並旗出（Zero、Carry、Negative、Overflow）。
   - 操作：ADD、SUB（以 2 之補加）、AND、OR、XOR、NOT、左移、右移、PASS-THROUGH（為 mov 與 load）。
   - ALU 選之寬須容諸操作。
2. **寄器組**：以 build-sequential-circuit 設之。寄器之庫，有：
   - 兩讀口（源 A、源 B）——以寄址為入之組合讀。
   - 一寫口（目）——由 RegWrite 控之拍寫。
   - 若 R0 硬連零，蓋 R0 之寫。
3. **程計（PC）**：N 位寄器，有：
   - 增邏（PC + instruction_width/8 為下序指令）。
   - 載入為分支／跳目。
   - 多選擇增與分支目，由 PCsrc 控之。
4. **憶介**：分或合指令與資憶。
   - **Harvard**：分指令憶（執行中只讀）與資憶（讀寫）。簡，可同時取與訪。
   - **Von Neumann**：單共憶為指令與資。須序取與訪於異拍。
5. **互連**：多選與匯連諸件：
   - ALU 入 A 多選：寄讀 A 或 PC（為 PC 相對址）。
   - ALU 入 B 多選：寄讀 B 或符號擴之即時。
   - 寄寫資多選：ALU 之果或憶讀資（為 load）。
   - 憶址多選：PC（為取指）或 ALU 之果（為 load/store）。

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

得：完之資路圖（為件表與多選表）——ISA 中各指令之資皆有可行之路自源達目，過 ALU、寄器、憶。

敗則：若一指令當前資路不能執（如 LOAD 自憶至寄無路），加缺之多選或路。逐指令之 RTL 操作而追所須信流於資路。

### 第三步：設控部

建邏輯以為各指令編資路之動：

1. **識諸控信**：列資路中各多選擇、寄寫啟、憶讀寫啟、ALU 操作選之信。
2. **單拍控**（最簡）：純組合之控部，於一拍內由當前指令之操作碼域導所有控信。
3. **多拍控**（學者所宜）：有限狀態機（以 build-sequential-circuit 設之），分各指令為階：
   - **Fetch**：以 PC 址自憶讀指令；存於 IR；增 PC。
   - **Decode**：以 IR 之域讀寄器；符號擴即時域。
   - **Execute**：行 ALU 操作或計憶址。
   - **Memory access**（唯 load/store）：自資憶讀或寫。
   - **Write-back**：書果於目寄。
4. **控信表**：各指令各階，定各控信之值。
5. **硬連 vs 微程**：
   - **硬連**：控 FSM 由門與觸發器建。速而不柔。
   - **微程**：微指令 ROM 存各狀之控信。各微指令含控信值與下態之域。緩，然易改。

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

得：控部（組合或 FSM）為各指令各階生正之控信值，無撞之信（如 MemRead 與 MemWrite 同時於同憶活）。

敗則：若有控信之撞，諸階未正分。確 load 與 store 訪憶於異階，或憶介支同時讀寫於分口。若 FSM 太多態，察某指令是否共階可合。

### 第四步：行 fetch-decode-execute 之循

連資路與控部以成可行之處理器：

1. **拍之分**：連系拍於諸觸發器（PC、IR、寄器組、控 FSM 之態）。所有態之新皆於同拍緣。
2. **階序**：接控 FSM 之出於資路之控信。FSM 每拍進一態，驅資路過 Fetch -> Decode -> Execute -> Memory -> Write-back。
3. **取指**：FETCH 階中，PC 驅指令憶址匯。所取指令載入 IR。PC 增一指令之寬。
4. **解指**：DECODE 階中，IR 之操作碼域驅控部以定指令之類。IR 之寄址驅寄器組讀口。
5. **執行及後**：餘階依指令之類：
   - **ALU 指令**：Execute（ALU 算）、Write-back（果至寄）。
   - **Load**：Execute（ALU 算址）、Memory（讀資憶）、Write-back（資至寄）。
   - **Store**：Execute（ALU 算址）、Memory（寫資憶）。
   - **Branch**：Execute（ALU 比或察旗），條件更 PC。
   - **Halt**：FSM 入終態而不再進。
6. **中斷與異常之治**（可選）：加機制存 PC 而跳於處理址。須加控態與因寄。

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

得：全連之處理器——控 FSM 驅資路過各指令之正階序，諸態轉同步於拍緣。

敗則：若處理器掛（不至 HALT）或生誤果，最常之因為一階之控信誤。用第五步之逐拍追以孤敗拍。若 PC 不正增，察 FETCH 階之連。若寫誤寄，察 IR 之寄址域之提。

### 第五步：仿小程而驗

執行具程而逐拍驗其態：

1. **書試程**：擇程小可全追（5-15 指令）而繁可試多類指令。費波那契序列宜：用 load-immediate、add、branch、halt。
2. **初設**：諸寄為 0。載程於指令憶自址 0 始。設 PC = 0。設控 FSM 於 FETCH 態。
3. **逐拍追**：各拍記：
   - 控 FSM 態與階名
   - PC 值與所取／執行指令
   - ALU 入、操作、果
   - 寄器組讀寫
   - 憶讀寫
   - 旗寄之值
   - 諸控信值
4. **與手算對**：獨自算各指令完後預期之寄與憶之態（非各拍——各指令多拍）。比仿之追與此預期之快照。
5. **邊例**：驗：
   - 分支不取（PC 正增）
   - 分支取（PC 載分支目）
   - Load 後即用所載寄（驗寫回是否完於下解之讀）
   - 寫 R0（若硬連零，寫無效）
   - HALT 指令（處理器淨止）

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
| ...   | ...     | ... | ...      | ...      | ...    | ...      | -     |

## Expected Final State
| Register | Value | Description         |
|----------|-------|---------------------|
| R1       | [val] | Second-to-last Fib  |
| R2       | [val] | Last computed Fib   |
| R3       | 0     | Loop counter done   |
| R4       | [val] | Same as R2          |
| PC       | 0x09  | One past HALT       |
```

得：逐拍之追合預期終態。各指令生正之寄與憶之新。程止於 HALT 而寄中有正之費波那契值。

敗則：比預期與實之首異。常因：（1）某指令類之 ALU 操作選誤——察控信表。（2）分支偏算差一——驗分支是否 PC 相對於當前或下指令址。（3）寫回於誤寄——察寄址域之提。（4）旗未正新——追 ALU 旗邏於致差之操作數。

## 驗

- [ ] ISA 至少有 load、store、add、subtract、AND、OR、branch、halt 諸指令
- [ ] 各指令有獨之操作碼與不歧之編
- [ ] 資路為各指令之 RTL 操作供有效之信路
- [ ] ALU 支諸所須操作而正生旗
- [ ] 寄器組有足之讀寫口為指令格
- [ ] 控部為各指令各階生正之信
- [ ] 無控信之撞（如同憶口同時讀寫）
- [ ] fetch-decode-execute 之循全連而拍動
- [ ] 試程行至完而正之終態
- [ ] 逐拍之追與手算對驗
- [ ] 分支取與不取兩例皆驗
- [ ] HALT 指令淨止執行

## 陷

- **分支偏差一**：分支或相對於當前 PC、PC+1、或分支後之指令。於 ISA 定其規而恆行之。分支目之差一誤乃 CPU 設最常之 bug。
- **多拍中寫回／解之患**：若指令 I 於寫回階寫寄器，同時 I+1 於解階讀同寄，讀或得舊值。多拍 CPU（一時一指令）無此患。流水 CPU 須轉發或停。
- **忘 fetch 中增 PC**：若 FETCH 中 PC 不增，CPU 永執行同指令。此乃易而常之線誤。
- **ALU 旗鎖**：旗宜唯於 ALU 指令更，非於 load、store、branch。若旗無條件更，比與分支間之 load 將壞比之果。
- **無號 vs 有號之惑**：定 ISA 時定算術為有號（2 之補）或無號，並依之行 ALU 與旗邏。Carry 旗於有號與無號操作之義異。
- **憶之對齊**：若資寬與指令寬異，或指令多位元組，定對齊之則。8 位元組可址之憶中之 16 位指令佔二址；PC 須增 2，非 1。
- **首設過繁**：始於最簡之 CPU（8 位、4 寄、8 指令、單拍或多拍、無流水）。繁可後加；可行之簡設教多於敗之繁設。

## 參

- `design-logic-circuit` — 設 ALU、多選、解碼及他組合塊
- `build-sequential-circuit` — 設寄器組、程計、控 FSM 及他序列塊
- `evaluate-boolean-expression` — 簡硬連控部之控邏方程
- `derive-theoretical-result` — 形式化性能析（CPI、吞吐、Amdahl 律）
