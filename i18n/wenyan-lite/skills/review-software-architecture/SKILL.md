---
name: review-software-architecture
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review software architecture for coupling, cohesion, SOLID principles, API
  design, scalability, and technical debt. Covers system-level evaluation,
  architecture decision record review, and improvement recommendations. Use
  when evaluating a proposed architecture before implementation, assessing an
  existing system for scalability or security, reviewing ADRs, performing a
  technical debt assessment, or evaluating readiness for significant scale-up.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: architecture, solid, coupling, cohesion, api-design, scalability, tech-debt, adr
---

# 評軟體架構

於系統層評軟體架構之品質屬性、設計原則遵循與長期可維護性。

## 適用時機

- 實作開始前評提議之架構
- 評既有系統之可擴展性、可維護性或安全
- 評項目之架構決策記錄（ADR）
- 作技術債評估
- 評系統是否備重大擴展或功能擴張
- 別於行層代碼評（其聚焦於 PR 層變更）

## 輸入

- **必要**：系統代碼庫或架構文件（圖表、ADR、README）
- **必要**：關於系統目的、規模與限制之上下文
- **選擇性**：非功能需求（延遲、吞吐、可用性目標）
- **選擇性**：團隊大小與技能組成
- **選擇性**：技術限制或偏好
- **選擇性**：已知痛點或關注區

## 步驟

### 步驟一：解系統上下文

繪系統邊界與介面：

```markdown
## System Context
- **Name**: [System name]
- **Purpose**: [One-line description]
- **Users**: [Who uses it and how]
- **Scale**: [Requests/sec, data volume, user count]
- **Age**: [Years in production, major versions]
- **Team**: [Size, composition]

## External Dependencies
| Dependency | Type | Criticality | Notes |
|-----------|------|-------------|-------|
| PostgreSQL | Database | Critical | Primary data store |
| Redis | Cache | High | Session store + caching |
| Stripe | External API | Critical | Payment processing |
| S3 | Object storage | High | File uploads |
```

**預期：** 對系統何作及其依賴有清晰圖。
**失敗時：** 若架構文件缺，自代碼結構、配置與部署文件推導上下文。

### 步驟二：評結構品質

#### 耦合評估
察模組相依之緊：

- [ ] **依賴方向**：依賴單向流（分層）抑或循環？
- [ ] **介面邊界**：模組以定義之介面／契約相連抑或直接實作引用？
- [ ] **共享狀態**：模組間是否共享可變狀態？
- [ ] **資料庫耦合**：多服務直接讀／寫同表？
- [ ] **時間耦合**：操作須以特定順序發生而無明顯協調？

```bash
# Detect circular dependencies (JavaScript/TypeScript)
npx madge --circular src/

# Detect import patterns (Python)
# Look for deep cross-package imports
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### 內聚評估
評每模組是否有單一明確之職責：

- [ ] **模組命名**：名稱是否準描述模組所為？
- [ ] **文件大小**：文件或類過大（>500 行暗示多職責）？
- [ ] **變更頻率**：無關功能是否要求改同模組？
- [ ] **上帝物件**：是否有所有物皆依之類／模組？

| 耦合度 | 描述 | 例 |
|---------------|-------------|---------|
| 低（佳） | 模組以介面通信 | Service A 呼 Service B 之 API |
| 中 | 模組共享資料結構 | 共用 DTO／模型庫 |
| 高（憂） | 模組引彼此內部 | 跨模組之直接資料庫存取 |
| 病態 | 模組改彼此內部狀態 | 全域可變狀態 |

**預期：** 已評耦合與內聚，附代碼庫之具體例。
**失敗時：** 若代碼庫過大不宜手評，採樣 3-5 主要模組與最常變之文件。

### 步驟三：評 SOLID 原則

| 原則 | 問題 | 紅旗 |
|-----------|----------|-----------|
| **S**ingle Responsibility | 每類／模組是否有一變因？ | 含 >5 公方法處理無關關注之類 |
| **O**pen/Closed | 行為可不修現代碼而擴否？ | 每新功能皆頻改核心類 |
| **L**iskov Substitution | 子型可替基型而不破行為否？ | 消費者代碼中散布類型檢查（`instanceof`） |
| **I**nterface Segregation | 介面是否聚焦且最小？ | 「胖」介面，消費者實作未用之方法 |
| **D**ependency Inversion | 高層模組依抽象而非細節否？ | 業務邏輯中直接實例化基礎建置類 |

```markdown
## SOLID Assessment
| Principle | Status | Evidence | Impact |
|-----------|--------|----------|--------|
| SRP | Concern | UserService handles auth, profile, notifications, and billing | High — changes to billing risk breaking auth |
| OCP | Good | Plugin system for payment providers | Low |
| LSP | Good | No type-checking anti-patterns found | Low |
| ISP | Concern | IRepository has 15 methods, most implementors use 3-4 | Medium |
| DIP | Concern | Controllers directly instantiate database repositories | Medium |
```

**預期：** 每原則皆評，附至少一具體例。
**失敗時：** 非所有原則對所有架構風格皆等適。註某原則較不相關時（如 ISP 於函數式代碼庫中較不重要）。

### 步驟四：評 API 設計

對暴露 API（REST、GraphQL、gRPC）之系統：

- [ ] **一致性**：命名慣例、錯誤格式、分頁模式統一
- [ ] **版本化**：策略存在且已施（URL、標頭、內容協商）
- [ ] **錯誤處理**：錯回應結構化、一致、不洩內部
- [ ] **認證／授權**：於 API 層適當執行
- [ ] **速率限制**：防濫用之保護
- [ ] **文件**：OpenAPI／Swagger、GraphQL 結構或 protobuf 定義已維護
- [ ] **冪等**：變更操作（POST／PUT）安全處理重試

```markdown
## API Design Review
| Aspect | Status | Notes |
|--------|--------|-------|
| Naming consistency | Good | RESTful resource naming throughout |
| Versioning | Concern | No versioning strategy — breaking changes affect all clients |
| Error format | Good | RFC 7807 Problem Details used consistently |
| Auth | Good | JWT with role-based scopes |
| Rate limiting | Missing | No rate limiting on any endpoint |
| Documentation | Concern | OpenAPI spec exists but 6 months out of date |
```

**預期：** 已對常見標準評 API 設計，附具體發現。
**失敗時：** 若無 API 暴露，略此步並聚焦內部模組介面。

### 步驟五：評可擴展性與可靠性

- [ ] **無狀態**：應用可水平擴展否（無本地狀態）？
- [ ] **資料庫可擴展**：查詢有索引否？結構合資料量否？
- [ ] **快取策略**：快取施於適當層（資料庫、應用、CDN）否？
- [ ] **失敗處理**：依賴不可用時生何事（斷路器、重試、回退）？
- [ ] **可觀測性**：日誌、指標、追蹤已實作否？
- [ ] **資料一致性**：最終一致性可受抑或須強一致性？

**預期：** 對所陳之非功能需求已評可擴展性與可靠性。
**失敗時：** 若非功能需求未記，建議將其定義為首步。

### 步驟六：評技術債

```markdown
## Technical Debt Inventory
| Item | Severity | Impact | Estimated Effort | Recommendation |
|------|----------|--------|-----------------|----------------|
| No database migrations | High | Schema changes are manual and error-prone | 1 sprint | Adopt Alembic/Flyway |
| Monolithic test suite | Medium | Tests take 45 min, developers skip them | 2 sprints | Split into unit/integration/e2e |
| Hardcoded config values | Medium | Environment-specific values in source code | 1 sprint | Extract to env vars/config service |
| No CI/CD pipeline | High | Manual deployment prone to errors | 1 sprint | Set up GitHub Actions |
```

**預期：** 技術債已編目，附嚴重度、影響與工作量估。
**失敗時：** 若債清冊壓人，按影響／工作量比優先排前 5 項。

### 步驟七：評架構決策記錄（ADR）

若 ADR 存在，評：
- [ ] 決策有清上下文（解何問題）
- [ ] 已考慮並記錄替代方案
- [ ] 取捨明顯
- [ ] 決策仍當前（未經文件而被取代）
- [ ] 新重大決策有 ADR

若 ADR 不存在，建議為主要決策確立之。

### 步驟八：撰架構評論

```markdown
## Architecture Review Report

### Executive Summary
[2-3 sentences: overall health, key concerns, recommended actions]

### Strengths
1. [Specific architectural strength with evidence]
2. ...

### Concerns (by severity)

#### Critical
1. **[Title]**: [Description, impact, recommendation]

#### Major
1. **[Title]**: [Description, impact, recommendation]

#### Minor
1. **[Title]**: [Description, recommendation]

### Technical Debt Summary
[Top 5 debt items with prioritized recommendations]

### Recommended Next Steps
1. [Actionable recommendation with clear scope]
2. ...
```

**預期：** 評論報告可行，附按優先排之建議。
**失敗時：** 若評時受限，清陳何已涵與何未評。

## 驗證

- [ ] 系統上下文已記（目的、規模、依賴、團隊）
- [ ] 已評耦合與內聚，附具體代碼例
- [ ] 已評 SOLID 原則（適用時）
- [ ] 已評 API 設計（適用時）
- [ ] 已對需求評可擴展性與可靠性
- [ ] 技術債已編目並按優先排
- [ ] 已評 ADR 或註其無
- [ ] 建議具體、按優先排、可行

## 常見陷阱

- **評代碼非評架構**：本技能關於系統層設計，非行層代碼品質。PR 層回饋用 `code-reviewer`
- **指定特定技術**：架構評論宜識問題，非命特定工具，除非有明技術因
- **忽團隊上下文**：3 人團隊之「最佳」架構異於 30 人團隊。考量組織限制
- **完美主義**：每系統皆有技術債。聚焦於正致痛或阻將來工作之債
- **假設規模**：勿為服 100 用戶之應用建議分散系統。架構合實需

## 相關技能

- `security-audit-codebase` — 安全聚焦之代碼與配置評
- `configure-git-repository` — 倉庫結構與慣例
- `design-serialization-schema` — 資料結構設計與演化
- `review-data-analysis` — 分析正確性之評（補性視角）
