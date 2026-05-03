---
name: simulate-cpu-architecture
locale: wenyan-lite
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

# 模擬 CPU 架構

從零設計一最小但完整之 CPU：定義指令集架構、組合 ALU 與暫存器檔為資料路徑、設計控制單元為每一指令階段產生正確訊號、實現取指-解碼-執行循環、模擬一小程式至完成、並逐時鐘週期驗證每一暫存器與記憶體狀態。

## 適用時機

- 從第一原理學習或教授計算機架構
- 為 FPGA 或教學模擬器設計自訂處理器
- 驗證對指令於閘級與暫存器傳輸層執行之理解
- 建構 CPU 之軟體模擬（Python、JavaScript 或結構化逐步說明）
- 將 design-logic-circuit 之組合塊與 build-sequential-circuit 之時序塊組合為可運作之系統

## 輸入

- **必要**：處理器複雜度目標——4 位元、8 位元或 16 位元資料寬度；通用暫存器數（2-16）
- **必要**：最小指令集——至少：load、store、add、subtract、bitwise AND/OR、branch、halt
- **選擇性**：直接定址以外之定址模式（立即、暫存器間接、索引）
- **選擇性**：附加指令（multiply、shift、compare、用於子程式之 jump-and-link）
- **選擇性**：記憶體大小與字寬
- **選擇性**：管線階段（單週期、多週期或管線化）——預設為多週期
- **選擇性**：實現媒介——軟體模擬（Python/JS）、HDL（Verilog/VHDL）或紙上演練

## 步驟

### 步驟一：定義指令集架構

指明程式設計師為此 CPU 寫機器碼所需知之一切：

1. **資料寬度**：選擇資料（ALU 運算元大小）與位址之位元寬度。常見選擇：8 位元資料／8 位元位址（256 位元組可定址）、16 位元資料／16 位元位址。
2. **暫存器檔**：定義通用暫存器之數及任何特殊用途暫存器。
   - **通用**：R0-R(N-1)。決定 R0 是否硬接至零（簡化指令編碼）。
   - **特殊用途**：程式計數器（PC）、指令暫存器（IR）、狀態／旗標暫存器（Zero、Carry、Negative、Overflow）。
3. **指令格式**：設計固定寬度之指令字。將位元分為欄位：
   - **Opcode**：識別運算。以 K 位元，可支援至 2^K 條指令。
   - **暫存器欄位**：源與目的暫存器位址。N 個暫存器時，每欄位需 ceil(log2(N)) 位元。
   - **立即／偏移欄位**：用於常數或分支偏移。用剩餘位元。
4. **指令目錄**：定義每條指令之助記符、opcode 編碼、運算元欄位、運算（以 RTL 表示法）及受影響旗標。
5. **定址模式**：定義運算元如何定位。
   - **暫存器**：運算元在暫存器中。
   - **立即**：運算元嵌入指令中。
   - **直接**：運算元位址在指令中。
   - **暫存器間接**：運算元位址在暫存器中。

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

**預期：** 完整之 ISA 規格，每條指令具獨一 opcode、明確之運算元欄位、無歧義之 RTL 描述及記錄之旗標效應。指令編碼須可無歧義解碼。

**失敗時：** 若指令字過窄無法編碼所有需要欄位，要麼加寬指令、減少暫存器數、用變長指令（解碼較複雜），要麼將指令拆為次運算。若 opcode 衝突，重新分配編碼。

### 步驟二：設計資料路徑

建構移動與變換資料之暫存器傳輸層硬體：

1. **ALU**：以 design-logic-circuit 技能設計。ALU 取二 N 位元運算元與一運算選擇訊號，產生 N 位元結果及旗標輸出（Zero、Carry、Negative、Overflow）。
   - 運算：ADD、SUB（透過二補數加）、AND、OR、XOR、NOT、SHIFT LEFT、SHIFT RIGHT、PASS-THROUGH（用於搬移與載入）。
   - ALU 選擇寬度須容納所有所需運算。
2. **暫存器檔**：以 build-sequential-circuit 設計。一組暫存器具：
   - 二讀埠（源 A、源 B）——以暫存器位址為輸入之組合讀。
   - 一寫埠（目的）——由 RegWrite 控制訊號啟用之時鐘寫。
   - 若 R0 硬接至零，覆蓋對 R0 之寫。
3. **程式計數器（PC）**：N 位元暫存器具：
   - 遞增邏輯（為下一順序指令之 PC + instruction_width/8）。
   - 分支／跳轉目標之載入輸入。
   - 由 PCsrc 訊號控制、於遞增與分支目標間選擇之多工器。
4. **記憶體介面**：分離或統一之指令與資料記憶體。
   - **哈佛架構**：分離之指令記憶體（執行期間僅讀）與資料記憶體（讀寫）。較簡，允許同時取指與資料存取。
   - **馮諾依曼架構**：指令與資料共用單一記憶體。需於不同週期排序取指與資料存取。
5. **互連**：連接組件之多工器與匯流排：
   - ALU 輸入 A 多工器：暫存器讀埠 A 或 PC（用於 PC 相對定址）。
   - ALU 輸入 B 多工器：暫存器讀埠 B 或符號擴展之立即值。
   - 暫存器寫資料多工器：ALU 結果或記憶體讀資料（用於 load）。
   - 記憶體位址多工器：PC（用於指令取指）或 ALU 結果（用於 load/store）。

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

**預期：** 完整之資料路徑圖（以組件表與多工器表呈現），其中 ISA 中每條指令皆有可行路徑，使其資料能由源經 ALU、暫存器檔與記憶體流至目的。

**失敗時：** 若某指令無法以當前資料路徑執行（如 LOAD 無自記憶體至暫存器之路徑），加入缺少之多工器或資料路徑。逐條走過每指令之 RTL 運算，並追蹤所需訊號流經資料路徑。

### 步驟三：設計控制單元

建構為每條指令編排資料路徑之邏輯：

1. **識別控制訊號**：列出資料路徑中之每一多工器選擇、暫存器寫使能、記憶體讀／寫使能與 ALU 運算選擇訊號。
2. **單週期控制**（最簡）：純組合控制單元，於一時鐘週期內由當前指令之 opcode 欄位導出所有控制訊號。
3. **多週期控制**（學習推薦）：以 build-sequential-circuit 設計之有限狀態機，將每指令拆為階段：
   - **Fetch**：自 PC 位址讀取指令；存入 IR；遞增 PC。
   - **Decode**：以 IR 欄位讀暫存器檔；符號擴展立即欄位。
   - **Execute**：執行 ALU 運算或計算記憶體位址。
   - **Memory access**（僅 load/store）：自資料記憶體讀或寫之。
   - **Write-back**：將結果寫至目的暫存器。
4. **控制訊號表**：對每條指令與每一階段，指明每控制訊號之值。
5. **硬接式 vs. 微程式式**：
   - **硬接式**：控制 FSM 由閘與正反器構成。較快，較不靈活。
   - **微程式式**：微指令 ROM 存每狀態之控制訊號。每微指令含控制訊號值與下一狀態欄位。較慢，但易修改。

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

**預期：** 控制單元（組合或 FSM）為每條指令之每階段產生正確之控制訊號值，無相衝訊號（如同一記憶體上同時 MemRead 與 MemWrite）。

**失敗時：** 若有控制訊號衝突，階段未妥善分離。確保 load 與 store 於不同階段存取記憶體，或記憶體介面支援於分離埠之同時讀寫。若 FSM 狀態過多，檢查某些指令是否共享階段而可合併。

### 步驟四：實現取指-解碼-執行循環

連接資料路徑與控制單元為可運作處理器：

1. **時鐘分配**：將系統時鐘連至所有正反器（PC、IR、暫存器檔、控制 FSM 狀態暫存器）。所有狀態更新於同一時鐘邊緣發生。
2. **階段排序**：將控制 FSM 輸出接至資料路徑控制訊號。FSM 每時鐘週期前進一狀態，驅動資料路徑經 Fetch -> Decode -> Execute -> Memory -> Write-back。
3. **指令取指**：於 FETCH 階段，PC 驅動指令記憶體位址匯流排。所取指令載入 IR。PC 遞增一指令寬度。
4. **指令解碼**：於 DECODE 階段，IR 之 opcode 欄位驅動控制單元以判定指令類型。IR 之暫存器位址驅動暫存器檔讀埠。
5. **執行及之後**：餘下階段視指令類型而定：
   - **ALU 指令**：Execute（ALU 計算）、Write-back（結果至暫存器）。
   - **Load**：Execute（ALU 計算位址）、Memory（讀資料記憶體）、Write-back（資料至暫存器）。
   - **Store**：Execute（ALU 計算位址）、Memory（寫資料記憶體）。
   - **Branch**：Execute（ALU 比較或檢查旗標）、條件性更新 PC。
   - **Halt**：FSM 進終止狀態並停前進。
6. **中斷與例外處理**（選擇性）：加入機制以保存 PC 並跳至處理器位址。需附加控制狀態與原因暫存器。

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

**預期：** 全連通之處理器，控制 FSM 為每指令類型驅動資料路徑經正確階段序列，所有狀態轉換於時鐘邊緣同步發生。

**失敗時：** 若處理器卡死（永不達 HALT）或產生錯誤結果，最可能因為某特定階段之控制訊號錯誤。用步驟五之逐週期追蹤隔離失敗週期。若 PC 不正確遞增，檢查 FETCH 階段佈線。若寫至錯誤暫存器，檢查 IR 之暫存器位址欄位提取。

### 步驟五：模擬一小程式並驗證

執行具體程式並逐時鐘週期驗證預期狀態：

1. **寫測試程式**：選一程式小至可完整追蹤（5-15 條指令）但複雜至能演練多種指令類型。費氏數列計算為理想：用 load-immediate、add、branch 與 halt。
2. **初始化狀態**：所有暫存器置零。將程式自位址 0 開始載入指令記憶體。設 PC = 0。將控制 FSM 置 FETCH 狀態。
3. **逐週期追蹤**：對每時鐘週期記錄：
   - 控制 FSM 狀態與階段名
   - PC 值與正取指／執行之指令
   - ALU 輸入、運算與結果
   - 暫存器檔讀寫
   - 記憶體讀寫
   - 旗標暫存器值
   - 所有控制訊號值
4. **與手算驗證**：獨立計算每指令完成後（非每週期——每指令需多週期）之預期暫存器與記憶體狀態。將模擬追蹤與此預期快照比對。
5. **邊界情況**：驗證以下行為：
   - 分支不採（PC 正常遞增）
   - 分支採（PC 載入分支目標）
   - load 後立即使用所載暫存器（檢查寫回是否於下次解碼讀之前完成）
   - 寫至 R0（若硬接零，寫應無效）
   - HALT 指令（處理器乾淨停止）

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

**預期：** 逐週期追蹤與預期最終狀態相符。每指令產生正確之暫存器與記憶體更新。程式於 HALT 終止，暫存器中含正確費氏值。

**失敗時：** 比對預期與實際狀態之首次分歧。常見因：(1) 某指令類型之 ALU 運算選擇錯誤——檢查控制訊號表。(2) 分支偏移計算差一——驗證分支是 PC 相對於當前還是下一指令位址。(3) 寫回寫至錯誤暫存器——檢查暫存器位址欄位提取。(4) 旗標未正確更新——對致差錯之具體運算元追蹤 ALU 旗標邏輯。

## 驗證

- [ ] ISA 至少含 load、store、add、subtract、AND、OR、branch 與 halt 指令
- [ ] 每指令具獨一 opcode 與無歧義編碼
- [ ] 資料路徑為每指令之 RTL 運算提供有效訊號路徑
- [ ] ALU 支援所有所需運算且旗標生成正確
- [ ] 暫存器檔有足夠讀寫埠以滿足指令格式
- [ ] 控制單元為每指令之每階段產生正確訊號
- [ ] 無控制訊號衝突（如同一記憶體埠之同時讀寫）
- [ ] 取指-解碼-執行循環完全連通且時鐘化
- [ ] 測試程式執行至完成且最終狀態正確
- [ ] 逐週期追蹤已與手算驗證
- [ ] 分支採與不採案例皆已驗證
- [ ] HALT 指令乾淨停止執行

## 常見陷阱

- **分支偏移差一**：分支可能相對當前 PC、PC+1 或分支後之指令。於 ISA 中定義慣例並一致實現。分支目標之差一錯誤為 CPU 設計最單一常見之臭蟲。
- **多週期中之寫回／解碼相依**：若指令 I 於寫回階段寫某暫存器，同時指令 I+1 於解碼階段讀該暫存器，讀可能取舊值。多週期 CPU（一次一指令）不為問題。管線化 CPU 則需轉送或暫停。
- **取指時忘記遞增 PC**：若 FETCH 階段未遞增 PC，CPU 將永遠執行同一指令。為極常見之佈線錯誤。
- **ALU 旗標鎖存**：旗標應僅於 ALU 指令時更新，非於 load、store 或 branch。若旗標無條件更新，比較與分支間之 load 將破壞比較結果。
- **無號 vs. 有號混淆**：於 ISA 定義時決定算術為有號（二補數）或無號，並依此實現 ALU 與旗標邏輯。Carry 旗標於有號 vs. 無號運算中語義不同。
- **記憶體對齊**：若資料寬度與指令寬度不同，或指令多位元組，定義對齊規則。位元組可定址記憶體中之 16 位元指令佔兩位址；PC 須遞增 2 而非 1。
- **首次設計過於複雜**：自最簡可能 CPU 起（8 位元、4 暫存器、8 指令、單週期或多週期、無管線）。複雜可後加；可運作之簡單設計教益勝於損壞之複雜者。

## 相關技能

- `design-logic-circuit` — 設計 ALU、多工器、解碼器與其他組合塊
- `build-sequential-circuit` — 設計暫存器檔、程式計數器、控制 FSM 與其他時序塊
- `evaluate-boolean-expression` — 簡化硬接控制單元之控制邏輯方程
- `derive-theoretical-result` — 形式化效能分析（CPI、吞吐、Amdahl 定律）
