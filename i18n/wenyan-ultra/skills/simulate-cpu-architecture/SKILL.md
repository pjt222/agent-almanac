---
name: simulate-cpu-architecture
locale: wenyan-ultra
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

# 擬 CPU 構

設最小而全 CPU：定指集（ISA）、建資路（ALU、籍、程計、憶介）、設控（硬或微）、行取-解-執環、以小程逐拍驗。

## 用

- 自原學或教計構→用
- 為 FPGA 或教擬器設定制處理→用
- 驗指於門與籍轉層執之識→用
- 建 CPU 軟擬（Python、JS、構走）→用
- 合 design-logic-circuit 之組合塊與 build-sequential-circuit 之序塊為行系→用

## 入

- **必**：處理繁標——4、8、16 位資寬；通用籍數（2-16）
- **必**：最小指集——至少：load、store、add、sub、AND/OR、branch、halt
- **可**：模式越直（即、籍間、索）
- **可**：餘指（mul、shift、cmp、jal 為子程）
- **可**：憶大與字大
- **可**：管階（單拍、多拍、管）——默多拍
- **可**：實媒——軟擬（Python/JS）、HDL（Verilog/VHDL）、紙走

## 行

### 一：定指集構

述程者寫機碼所需知：

1. **資寬**：擇資（ALU 元）與址之位寬。常：8/8（256 位元組）、16/16
2. **籍**：定通用與特殊籍數
   - **通用**：R0-R(N-1)。R0 是否硬接零（簡編）
   - **特殊**：PC、IR、狀/旗（Z、C、N、V）
3. **指式**：設定寬指字。位分為域：
   - **碼**：定操。K 位支 2^K 指
   - **籍域**：源、目籍址。N 籍各域需 ceil(log2(N)) 位
   - **即/偏域**：常或分支偏。用餘位
4. **指錄**：各指定其名、碼編、元域、操（RTL 記）、影旗
5. **址模**：定元位
   - **籍**：元在籍
   - **即**：元嵌指
   - **直**：元址在指
   - **籍間**：元址在籍

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

得：全 ISA 述，各指碼獨、域明、RTL 無歧、旗效有文。指編可解無歧。

敗：指字過窄→寬指、減籍、變長指（解繁）、或分指為子操。碼撞→重編。

### 二：設資路

建移轉資之籍轉層硬：

1. **ALU**：以 design-logic-circuit 設。受兩 N 位元、操擇號，出 N 位果與旗（Z、C、N、V）
   - 操：ADD、SUB（二補加）、AND、OR、XOR、NOT、SHL、SHR、PASS（為移與載）
   - ALU 擇寬足含諸操
2. **籍**：以 build-sequential-circuit 設。籍叢含：
   - 二讀口（源 A、源 B）——組合讀，址為入
   - 一寫口（目）——拍寫，RegWrite 控啟
   - R0 硬接零→蓋寫 R0
3. **PC**：N 位籍含：
   - 增（PC+指寬/8 為次）
   - 載入分支/跳目
   - 多工擇增與分支目，PCsrc 控
4. **憶介**：分或合指與資憶
   - **Harvard**：分指憶（執中唯讀）與資憶（讀寫）。較簡，可同取與資訪
   - **Von Neumann**：單共憶含指與資。需異拍序取與資訪
5. **互連**：多工與匯連件：
   - ALU A 工：籍讀 A 或 PC（PC 相址）
   - ALU B 工：籍讀 B 或符擴即
   - 籍寫資工：ALU 果或憶讀資（為載）
   - 憶址工：PC（為取指）或 ALU 果（為載/存）

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

得：全資路圖（件表與工表），ISA 諸指皆有可行資路自源達目。

敗：某指當路無路（如載無憶至籍路）→加缺工或路。逐指 RTL 操、追路訊。

### 三：設控

建為各指協調資路之邏：

1. **識控訊**：列諸工擇、籍寫啟、憶讀寫啟、ALU 操擇
2. **單拍控**（最簡）：純組合控，自當指碼一拍生諸控訊
3. **多拍控**（學者宜）：FSM（用 build-sequential-circuit 設）分指為相：
   - **取**：自 PC 址讀指至 IR；增 PC
   - **解**：用 IR 域讀籍；符擴即域
   - **執**：行 ALU 操或計憶址
   - **憶訪**（唯載/存）：讀寫資憶
   - **回寫**：果寫目籍
4. **控訊表**：各指各相、定諸控訊值
5. **硬 vs 微**：
   - **硬**：FSM 由門與翻翻組。速、不靈
   - **微**：微指 ROM 存各態之控訊。各微指含控值與次態域。緩、易改

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

得：控（組合或 FSM），各指各相生正控訊值，無衝（如同憶 MemRead 與 MemWrite 並啟）。

敗：控訊衝→相未正分。確載與存於異相訪憶、或憶介支分口同讀寫。FSM 態過多→察某指可合相。

### 四：行取-解-執環

連資路與控為行處理：

1. **拍布**：系拍接諸翻翻（PC、IR、籍、控 FSM 態籍）。諸態同拍邊更
2. **相序**：FSM 出接資路控訊。FSM 一拍進一態，驅資路經 取→解→執→憶→回
3. **取指**：FETCH 中、PC 驅指憶址匯。所取入 IR。PC 增一指寬
4. **解指**：DECODE 中、IR 之碼驅控以定指類。IR 中籍址驅籍讀口
5. **執及後**：餘相依指類：
   - **ALU 指**：執（ALU 計）、回（果至籍）
   - **載**：執（ALU 計址）、憶（讀資憶）、回（資至籍）
   - **存**：執（ALU 計址）、憶（寫資憶）
   - **分支**：執（ALU 比或察旗）、條件更 PC
   - **停**：FSM 入末態而止
6. **中斷與例外**（可）：機制存 PC 跳處理者址。需加控態與因籍

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

得：全連處理，控 FSM 驅資路經各指類正相序、諸態變於拍邊同生。

敗：處理掛（不達 HALT）或誤果→最常因為某相控訊誤。用步五逐拍追隔離敗拍。PC 不正增→察 FETCH 線。誤籍寫→察籍址域取。

### 五：擬小程而驗

執具程逐拍驗於期態：

1. **書測程**：擇可全追之程（5-15 指）而繁足試多指類。Fibonacci 序為宜：用載即、加、分支、停
2. **初態**：諸籍歸零。程入指憶始於址 0。PC=0。控 FSM 為 FETCH
3. **逐拍追**：各拍記：
   - 控 FSM 態與相名
   - PC 值與所取/執之指
   - ALU 入、操、果
   - 籍讀寫
   - 憶讀寫
   - 旗值
   - 諸控訊值
4. **驗於手算**：獨計各指後期籍與憶態（非各拍——各指多拍）。比擬追於此期影
5. **邊例**：驗：
   - 不分（PC 正增）
   - 分（PC 載目）
   - 載後即用（察回寫畢於次解前）
   - R0 硬零之寫（無效）
   - HALT（處理清止）

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

得：逐拍追配期末態。各指生正籍與憶更。程於 HALT 止、Fib 值正於籍。

敗：比期與實首歧。常因：（1）某指類 ALU 操擇誤——察控訊表；（2）分支偏差一——驗分支自當或次指址相對；（3）回寫至誤籍——察籍址域取；（4）旗未正更——追 ALU 旗邏於致誤之元。

## 驗

- [ ] ISA 至少含 load、store、add、sub、AND、OR、branch、halt
- [ ] 各指碼獨而編無歧
- [ ] 資路為各指 RTL 操予可行訊路
- [ ] ALU 支諸需操與正旗生
- [ ] 籍讀寫口足含指式
- [ ] 控於各指各相生正訊
- [ ] 無控訊衝（如同憶口同讀寫）
- [ ] 取-解-執環全連而拍
- [ ] 測程執畢、末態正
- [ ] 逐拍追驗於手算
- [ ] 分與不分二例皆驗
- [ ] HALT 清止執

## 忌

- **分支偏差一**：分支或相對於當 PC、PC+1、分支後指。於 ISA 定法、恆行之。差一為 CPU 設最常患
- **多拍中回-解險**：指 I 於回相寫籍與指 I+1 於解相讀同籍同時——讀或得舊值。於多拍 CPU（一指一時）非患。於管 CPU 需轉送或停
- **取中忘增 PC**：FETCH 中 PC 不增→CPU 永執同指。瑣常線誤
- **ALU 旗鎖**：旗應唯於 ALU 指更、非載、存、分支。若無條件更→比與分支間之載污比果
- **符無符混**：於 ISA 定算為符（二補）或無符、ALU 與旗邏依之。Carry 旗於符無符異義
- **憶對齊**：若資寬與指寬異、或指多元組→定齊則。位元組址憶中 16 位指占二址；PC 增二非一
- **首設過繁**：始於最簡 CPU（8 位、4 籍、8 指、單或多拍、無管）。後可加繁；行簡設教勝壞繁

## 參

- `design-logic-circuit` — 設 ALU、工、解、餘組合塊
- `build-sequential-circuit` — 設籍、PC、控 FSM、餘序塊
- `evaluate-boolean-expression` — 簡硬控之控邏式
- `derive-theoretical-result` — 形析效（CPI、量、Amdahl 律）
