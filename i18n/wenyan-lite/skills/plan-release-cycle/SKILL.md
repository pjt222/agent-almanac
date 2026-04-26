---
name: plan-release-cycle
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a software release cycle with milestones, feature freezes,
  release candidates, and go/no-go criteria. Covers calendar-based
  and feature-based release strategies. Use when starting planning for a
  major or minor version release, transitioning from ad-hoc to structured
  release cadence, coordinating a release across multiple teams or components,
  defining quality gates for a regulated project, or planning the first
  public release (v1.0.0) of a project.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, release-planning, milestones, release-cycle
---

# 規劃發布週期

為軟體發布規劃結構化週期：定策略（依曆或依功能）、設里程碑與目標日、立功能凍結準則、管理候選版本、定 go/no-go 查核表、並記錄回滾計畫。產出 `RELEASE-PLAN.md` 工件，引導團隊自開發至發布。

## 適用時機

- 為主版本或次版本之發布開始規劃
- 自臨時式發布過渡至有結構之節奏
- 跨多團隊或多元件協調發布
- 為受監管專案定品質閘門與發布準則
- 規劃專案首次公開發布（v1.0.0）

## 輸入

- **必要**：目標版本號（如 v2.0.0）
- **必要**：期望之發布日或發布視窗
- **必要**：擬納入之功能或範圍（待辦清單、路線圖或描述）
- **選擇性**：團隊規模與可用度
- **選擇性**：發布策略偏好（依曆或依功能）
- **選擇性**：影響發布之法規或合規要求
- **選擇性**：過往發布速度或週期長度資料

## 步驟

### 步驟一：判定發布策略

於兩種主要策略之間擇定：

**依曆**（時程箱）：
- 依固定週期發布（如每 4 週、每季）
- 未就緒之功能延至下次發布
- 對使用者與下游專案而言可預測
- 適用於：函式庫、框架、有外部使用者之工具

**依功能**（依範圍）：
- 一組功能完成方發布
- 日期視範圍而調整
- 有範圍蔓延與無限期延宕之風險
- 適用於：內部工具、首發、大型重寫

多數專案採混合法為佳：訂目標日並界定範圍，但留 1-2 週之緩衝。若緩衝期截止仍未達範圍，餘下功能延後。

記錄策略選擇及其理由。

**預期：** 已記錄發布策略，理由與專案脈絡相符。

**失敗時：** 若團隊無法達成共識，預設採依曆並備功能優先清單。時程箱迫使優先序之決定。

### 步驟二：定義里程碑

將發布週期切為含目標日之階段：

```markdown
## Release Plan: v2.0.0

### Timeline

| Phase | Start | End | Duration | Description |
|---|---|---|---|---|
| Development | 2026-02-17 | 2026-03-14 | 4 weeks | Active feature development |
| Feature Freeze | 2026-03-15 | 2026-03-15 | 1 day | No new features merged after this date |
| Stabilization | 2026-03-15 | 2026-03-21 | 1 week | Bug fixes, documentation, testing only |
| RC1 | 2026-03-22 | 2026-03-22 | 1 day | First release candidate tagged |
| RC Testing | 2026-03-22 | 2026-03-28 | 1 week | Community/team testing of RC |
| RC2 (if needed) | 2026-03-29 | 2026-03-29 | 1 day | Second RC if critical issues found |
| Go/No-Go | 2026-03-31 | 2026-03-31 | 1 day | Final decision meeting |
| Release | 2026-04-01 | 2026-04-01 | 1 day | Tag, publish, announce |
```

各階段一般時長：
- **開發**：總週期之 50-70%
- **穩定**：總週期之 15-25%
- **RC 測試**：總週期之 10-20%

**預期：** 一張里程碑表，含日期、時長與各階段描述。

**失敗時：** 若時程過於壓縮（穩定期 < 1 週），延後發布日或縮減範圍。永不省略穩定期。

### 步驟三：訂功能凍結準則

界定本次發布之「功能凍結」涵義：

```markdown
### Feature Freeze Criteria

After feature freeze (2026-03-15):
- **Allowed**: Bug fixes, test additions, documentation updates, dependency security patches
- **Not allowed**: New features, API changes, refactoring, dependency upgrades (non-security)
- **Exception process**: Feature freeze exceptions require written justification and approval from [release owner]

### Feature Priority List
| Priority | Feature | Status | Owner | Notes |
|---|---|---|---|---|
| P0 (must) | New export format | In progress | [Name] | Blocks release |
| P0 (must) | Security audit fixes | Not started | [Name] | Compliance requirement |
| P1 (should) | Performance optimization | In progress | [Name] | Defer if not ready |
| P2 (nice) | Dark mode support | Not started | [Name] | Defer to v2.1.0 if needed |
```

P0 功能阻擋發布；P1 功能就緒則納入；P2 功能延後而不延期。

**預期：** 已記錄凍結規則，含例外流程與優先排序之功能清單。

**失敗時：** 若 P0 功能可能錯過凍結日，立即升級處理。可選：延長開發階段、將該功能切為較小可交付物，或延至點版本（v2.0.1）。

### 步驟四：規劃候選版本流程

界定候選版本之產生與測試方式：

```markdown
### Release Candidate Process

1. **RC1 Tag**: Tag from the stabilization branch after all P0 features merged and CI green
   ```bash
   git tag -a v2.0.0-rc.1 -m "Release candidate 1 for v2.0.0"
   ```

2. **RC Distribution**: Publish RC to staging/testing channel
   - R: `install.packages("pkg", repos = "https://staging.r-universe.dev/user")`
   - Node.js: `npm install pkg@next`
   - Internal: Deploy to staging environment

3. **RC Testing Period**: 5-7 business days
   - Run full test suite including integration tests
   - Verify all P0 features work as documented
   - Test upgrade path from previous version
   - Check for regressions in existing functionality

4. **RC Evaluation**:
   - **No critical/high bugs**: Proceed to release
   - **Critical bugs found**: Fix, tag RC2, restart testing period
   - **More than 2 RCs needed**: Revisit scope and timeline

5. **RC2+ Tags**: Only if critical issues found in previous RC
   ```bash
   git tag -a v2.0.0-rc.2 -m "Release candidate 2 for v2.0.0"
   ```
```

**預期：** 已記錄 RC 流程，含標記慣例、發行管道、測試查核表與升級準則。

**失敗時：** 若因壓力而省略 RC 流程，記錄該風險。未經測試之發布回滾機率較高。

### 步驟五：訂 go/no-go 查核表

立發布核准前必達之準則：

```markdown
### Go/No-Go Checklist

#### Must Pass (release blocked if any fail)
- [ ] All CI checks passing on release branch
- [ ] Zero critical bugs open against this version
- [ ] Zero high-severity security vulnerabilities
- [ ] All P0 features verified and documented
- [ ] Changelog complete and reviewed
- [ ] Upgrade path tested from previous version (v1.x -> v2.0.0)
- [ ] License and attribution files up to date

#### Should Pass (release proceeds with documented risk)
- [ ] Zero high bugs open (non-critical)
- [ ] All P1 features included
- [ ] Performance benchmarks within acceptable range
- [ ] Documentation reviewed and spell-checked
- [ ] External dependencies at latest stable versions

#### Decision
- **Go**: All "Must Pass" items checked, majority of "Should Pass" items checked
- **No-Go**: Any "Must Pass" item unchecked
- **Conditional Go**: All "Must Pass" checked, significant "Should Pass" items unchecked — document accepted risks
```

**預期：** go/no-go 查核表，附明確之合格／不合格準則與決策規則。

**失敗時：** 若 go/no-go 會議結果為 no-go，辨明阻擋項、指派負責人、訂新目標日（通常 1-2 週後），並更新發布計畫。

### 步驟六：擬訂回滾計畫

界定發布若於正式環境造成關鍵問題時之回滾方式：

```markdown
### Rollback Plan

#### Rollback Triggers
- Critical bug affecting >10% of users
- Data corruption or loss
- Security vulnerability introduced by the release
- Breaking change not documented in changelog

#### Rollback Procedure
1. **Revert package registry**: Unpublish or yank the release
   - R/CRAN: Contact CRAN maintainers (cannot self-unpublish)
   - npm: `npm unpublish pkg@2.0.0` (within 72 hours)
   - GitHub: Mark release as pre-release, publish point fix

2. **Communicate**: Notify users via GitHub issue, mailing list, or social channels
   - Template: "v2.0.0 has been rolled back due to [issue]. Please use v1.x.y until a fix is released."

3. **Fix forward**: Prefer a v2.0.1 patch release over a full rollback when possible

4. **Post-mortem**: Conduct a post-mortem within 48 hours of rollback to identify process gaps

#### Point Release Policy
- v2.0.1 for critical bug fixes within 1 week of release
- v2.0.2 for additional fixes within 2 weeks
- Patch releases do not require full RC cycle but must pass CI and critical test suite
```

將完整發布計畫寫入 `RELEASE-PLAN.md` 或 `RELEASE-PLAN-v2.0.0.md`。

**預期：** 已記錄回滾計畫，含觸發、程序、溝通模板與點版本政策。已寫成完整之 RELEASE-PLAN.md。

**失敗時：** 若回滾不可行（如資料庫遷移已套用），改記錄向前修補之程序。每次發布皆應有恢復路徑。

## 驗證

- [ ] 發布策略（依曆／依功能／混合）已記錄並附理由
- [ ] 里程碑表含全部階段與日期：開發、凍結、穩定、RC、發布
- [ ] 已界定凍結準則，含允許／不允許之變更類別
- [ ] 功能優先清單已分類（P0 必含／P1 應含／P2 可含）
- [ ] 已記錄 RC 流程：標記、發行、測試期、升級
- [ ] go/no-go 查核表分「必達」與「應達」兩節
- [ ] 回滾計畫含觸發、程序與溝通模板
- [ ] RELEASE-PLAN.md（或同等）檔案已建立並儲存
- [ ] 時程合理（穩定期至少占總週期 15%）

## 常見陷阱

- **無穩定期**：自開發直入發布。即便三日穩定期亦可揭出開發中被掩蓋之問題。
- **凍結後範圍蔓延**：凍結後再加「就一個」。每次後加皆重置測試並引入回歸風險。
- **忽略 P0 風險**：當 P0 功能告急時未及早升級。範圍越早調整，對時程之衝擊越小。
- **「小發布」省略 RC**：即便次要發布亦受惠於至少一次 RC。一日 RC 測試遠比發布後熱修廉價。
- **無回滾計畫**：假定發布必成。每份發布計畫於發布前都應回答「若出錯怎麼辦？」。
- **曆書壓力凌駕品質**：因「答應了」而強行於某日發布，無視 go/no-go 之失敗。延期不過小擾，破損發布卻是信譽之失。

## 相關技能

- `apply-semantic-versioning` —— 為所規劃之發布判定版本號
- `manage-changelog` —— 維護匯入發布說明之變更日誌
- `plan-sprint` —— 發布週期之開發階段內的衝刺規劃
- `draft-project-charter` —— 專案章程可定義發布路線圖與成功準則
- `generate-status-report` —— 追蹤對應發布里程碑之進度
