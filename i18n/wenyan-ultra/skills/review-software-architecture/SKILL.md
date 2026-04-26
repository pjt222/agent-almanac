---
name: review-software-architecture
locale: wenyan-ultra
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

# 審軟構

於系級評構於質屬、設律守、長維。

## 用

- 估擬構於實前
- 估現系於擴、維、安
- 審項 ADR
- 行技債估
- 估系備大擴或功擴乎
- 異於行級碼審（注 PR 級變）

## 入

- **必**：系庫或構文（圖、ADR、README）
- **必**：系旨、模、限脈
- **可**：非功需（延、流、可用標）
- **可**：隊大與技組
- **可**：技限或偏
- **可**：知痛點或顧域

## 行

### 一：解系脈

圖系界與接：

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

得：明系所為與所依。
敗：構文缺→自碼構、配、發檔導脈。

### 二：估構質

#### 耦估
察模間依密：

- [ ] **依向**：依一向流（層）抑環？
- [ ] **接界**：模經定接/契連抑直實引？
- [ ] **共態**：可變態跨模共乎？
- [ ] **庫耦**：多服直讀寫同表乎？
- [ ] **時耦**：業必特序而無明調乎？

```bash
# Detect circular dependencies (JavaScript/TypeScript)
npx madge --circular src/

# Detect import patterns (Python)
# Look for deep cross-package imports
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### 聚估
評各模有單明責乎：

- [ ] **模命**：名準述模所為乎？
- [ ] **檔大**：檔或類過大（>500 行示多責）？
- [ ] **變頻**：無關功需改同模乎？
- [ ] **神物**：類/模諸皆依乎？

| Coupling Level | Description | Example |
|---------------|-------------|---------|
| Low (good) | Modules communicate through interfaces | Service A calls Service B's API |
| Medium | Modules share data structures | Shared DTO/model library |
| High (concern) | Modules reference each other's internals | Direct database access across modules |
| Pathological | Modules modify each other's internal state | Global mutable state |

得：耦與聚估含庫特例。
敗：庫過大不能手審→抽 3-5 關模與最改檔。

### 三：估 SOLID 律

| Principle | Question | Red Flags |
|-----------|----------|-----------|
| **S**ingle Responsibility | Does each class/module have one reason to change? | Classes with >5 public methods on unrelated concerns |
| **O**pen/Closed | Can behavior be extended without modifying existing code? | Frequent modifications to core classes for each new feature |
| **L**iskov Substitution | Can subtypes replace their base types without breaking behavior? | Type checks (`instanceof`) scattered through consumer code |
| **I**nterface Segregation | Are interfaces focused and minimal? | "Fat" interfaces where consumers implement unused methods |
| **D**ependency Inversion | Do high-level modules depend on abstractions, not details? | Direct instantiation of infrastructure classes in business logic |

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

得：各律估含至少一特例。
敗：非諸律於各構式皆等。律少相時記之（如 ISP 於函碼少要）。

### 四：審 API 設

為露 API 之系（REST、GraphQL、gRPC）：

- [ ] **恆**：命約、錯格、頁模一
- [ ] **版**：策存且施（URL、頭、容議）
- [ ] **錯處**：錯應結構、恆、不漏內
- [ ] **認/授**：於 API 層正執
- [ ] **限率**：護防濫
- [ ] **文**：OpenAPI/Swagger、GraphQL 模、protobuf 定維
- [ ] **冪**：變業（POST/PUT）安處重試

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

得：API 設對常準審含特發見。
敗：無 API 露→略此步、注內模接。

### 五：估擴與信

- [ ] **無態**：應可橫擴乎（無局態）？
- [ ] **庫擴**：問索乎？模合數量乎？
- [ ] **快策**：快施於應層乎（庫、應、CDN）？
- [ ] **敗處**：依不可達時何發（路斷、重試、退）？
- [ ] **可察**：誌、指、跡實乎？
- [ ] **數恆**：終恆受乎抑強恆需？

得：擴與信對所述非功需估。
敗：非功需未書→薦定為首步。

### 六：估技債

```markdown
## Technical Debt Inventory
| Item | Severity | Impact | Estimated Effort | Recommendation |
|------|----------|--------|-----------------|----------------|
| No database migrations | High | Schema changes are manual and error-prone | 1 sprint | Adopt Alembic/Flyway |
| Monolithic test suite | Medium | Tests take 45 min, developers skip them | 2 sprints | Split into unit/integration/e2e |
| Hardcoded config values | Medium | Environment-specific values in source code | 1 sprint | Extract to env vars/config service |
| No CI/CD pipeline | High | Manual deployment prone to errors | 1 sprint | Set up GitHub Actions |
```

得：技債錄含重、影、力估。
敗：債錄淹→序首五於影/力比。

### 七：審 ADR

ADR 存→估：
- [ ] 決有明脈（解何問）
- [ ] 替考且書
- [ ] 衡明
- [ ] 決仍當（未代而無書）
- [ ] 新顯決有 ADR

ADR 無→薦立之為關決。

### 八：書構審

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

得：審報可動含序薦。
敗：審時限→明述何覆何餘。

## 驗

- [ ] 系脈書（旨、模、依、隊）
- [ ] 耦與聚估含特碼例
- [ ] SOLID 適用處估
- [ ] API 設審（適用）
- [ ] 擴與信對需估
- [ ] 技債錄序
- [ ] ADR 審或其缺記
- [ ] 薦特、序、可動

## 忌

- **審碼非構**：此技為系級設、非行級碼質。PR 級饋用 `code-reviewer`
- **令特技**：構審宜識問、勿命特具除非有明技由
- **忽隊脈**：3 人隊「最佳」構異 30 人。顧組限
- **完美**：諸系皆有技債。注於實致痛或阻後工之債
- **設模**：勿薦分系於 100 用之應。構合實需

## 參

- `security-audit-codebase` — 安注碼與配審
- `configure-git-repository` — 庫構與約
- `design-serialization-schema` — 數模設與化
- `review-data-analysis` — 析正審（補角）
