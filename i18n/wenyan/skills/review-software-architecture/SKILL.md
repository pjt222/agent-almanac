---
name: review-software-architecture
locale: wenyan
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

於系等評軟構之質屬、設則之循、長之可守。

## 用時

- 施前評議構乃用
- 為擴、守、安察現系乃用
- 審項目之 ADR 乃用
- 行技債察乃用
- 評系備大擴或功廣乎乃用
- 與行等碼審分（其專於 PR 等變）乃用

## 入

- **必要**：系碼庫或構文（圖、ADR、README）
- **必要**：系之用、尺、限之境
- **可選**：非功需（延、量、可達之的）
- **可選**：團之大與技組
- **可選**：技限或喜
- **可選**：知痛點或憂區

## 法

### 第一步：解系境

圖系界與介：

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

**得：** 系行何與依何之明像
**敗則：** 若構文缺，自碼構、配、部署文導其境

### 第二步：評構之質

#### 耦合之察

審諸模相依之緊：

- [ ] **依向**：依一向流（層）或環？
- [ ] **介界**：諸模由所定介/契連，或由直施引？
- [ ] **共態**：諸模間共可變態？
- [ ] **庫耦**：諸服直讀寫同表？
- [ ] **時耦**：諸操必依特序而無明調？

```bash
# Detect circular dependencies (JavaScript/TypeScript)
npx madge --circular src/

# Detect import patterns (Python)
# Look for deep cross-package imports
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### 凝聚之察

評各模有單明責乎：

- [ ] **模名**：名準述模行何乎？
- [ ] **文大**：文或類過大乎（>500 行示多責）？
- [ ] **變頻**：無關功需變同模乎？
- [ ] **神物**：諸物所依之類/模存乎？

| 耦合等 | 述 | 例 |
|---------------|-------------|---------|
| 低（善） | 諸模由介通 | 服 A 呼服 B 之 API |
| 中 | 諸模共數構 | 共 DTO/模庫 |
| 高（憂） | 諸模引他內 | 諸模間直庫訪 |
| 病 | 諸模改他內態 | 全可變態 |

**得：** 耦合與凝聚已察附碼之具例
**敗則：** 若碼庫過大不能手審，取 3-5 要模與最常變之文

### 第三步：察 SOLID 諸則

| 則 | 問 | 紅旗 |
|-----------|----------|-----------|
| **S**ingle Responsibility | 各類/模有單變因乎？ | 有 >5 公法於無關憂之類 |
| **O**pen/Closed | 行可擴而不改現碼乎？ | 為各新功常改核類 |
| **L**iskov Substitution | 子類可代基類而不破行乎？ | 類察（`instanceof`）散於用碼 |
| **I**nterface Segregation | 諸介專且少乎？ | 「肥」介使用者施未用法 |
| **D**ependency Inversion | 高層依抽象，非依細乎？ | 業邏中直立基設類 |

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

**得：** 各則以至少一具例察
**敗則：** 非凡則皆等施於諸構式。記則於少要時（如 ISP 於函碼庫較少要）

### 第四步：審 API 設

為示 API 之系（REST、GraphQL、gRPC）：

- [ ] **恆**：命規、誤式、頁形齊
- [ ] **版**：策存且施（URL、首、內議）
- [ ] **誤處**：誤應構、恆、不露內
- [ ] **認/授**：於 API 層正執
- [ ] **限速**：防濫用之護
- [ ] **文檔**：OpenAPI/Swagger、GraphQL schema、protobuf 定守
- [ ] **冪等**：變操（POST/PUT）安處重試

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

**得：** API 設對常標審附具得
**敗則：** 若無 API 示，略此步而專注內模介

### 第五步：察擴與信

- [ ] **無態**：應用可平擴乎（無局態）？
- [ ] **庫擴**：諸詢索引乎？schema 合數量乎？
- [ ] **緩策**：緩於宜層（庫、應、CDN）施乎？
- [ ] **敗處**：依不可時何發（斷路、重、退）？
- [ ] **可察**：諸日、指、跡施乎？
- [ ] **數合**：終合可受或需強合？

**得：** 擴與信對述非功需察
**敗則：** 若非功需未書，議為首步定之

### 第六步：察技債

```markdown
## Technical Debt Inventory
| Item | Severity | Impact | Estimated Effort | Recommendation |
|------|----------|--------|-----------------|----------------|
| No database migrations | High | Schema changes are manual and error-prone | 1 sprint | Adopt Alembic/Flyway |
| Monolithic test suite | Medium | Tests take 45 min, developers skip them | 2 sprints | Split into unit/integration/e2e |
| Hardcoded config values | Medium | Environment-specific values in source code | 1 sprint | Extract to env vars/config service |
| No CI/CD pipeline | High | Manual deployment prone to errors | 1 sprint | Set up GitHub Actions |
```

**得：** 技債已錄附重、影、估力
**敗則：** 若債錄過大，依影/力比排前 5 入

### 第七步：審 Architecture Decision Records（ADR）

若 ADR 存，評：

- [ ] 諸決有明境（解何患）
- [ ] 諸替已慮且書
- [ ] 衡明
- [ ] 諸決仍當（非無書代）
- [ ] 諸新要決有 ADR

若 ADR 不存，議為要決立之。

### 第八步：書構審報

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

**得：** 審報可行附排序之議
**敗則：** 若審時限，明述所覆與所未察

## 驗

- [ ] 系境已書（用、尺、依、團）
- [ ] 耦合與凝聚已察附碼具例
- [ ] SOLID 諸則於可施處察
- [ ] API 設已審（若可）
- [ ] 擴與信對需察
- [ ] 技債已錄且排
- [ ] ADR 已審或記其闕
- [ ] 諸議具、排、可行

## 陷

- **審碼非審構**：本技為系等設，非行等碼質。用 `code-reviewer` 行 PR 等反
- **指特技**：構審宜識患，非令具具，除非有明技由
- **忽團境**：3 人團之「最善」構異於 30 人團。慮組之限
- **求全**：凡系皆有技債。專於致實痛或阻來勞之債
- **假尺**：勿為 100 用戶之應議分系。匹構於實需

## 參

- `security-audit-codebase` — 安專之碼與配審
- `configure-git-repository` — 庫構與規
- `design-serialization-schema` — 數 schema 之設與化
- `review-data-analysis` — 析正之審（補視）
