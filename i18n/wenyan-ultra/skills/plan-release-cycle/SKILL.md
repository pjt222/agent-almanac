---
name: plan-release-cycle
locale: wenyan-ultra
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

# 計發週

立發週含碑、凍、候、行否則。產 `RELEASE-PLAN.md` 引團自開至發。

## 用

- 主或次版發起劃→用
- 自隨發轉構發節→用
- 多團或組件發協→用
- 定規制案之質閘與發則→用
- 計首公發 (v1.0.0)→用

## 入

- **必**：標版號（如 v2.0.0）
- **必**：欲發日或窗
- **必**：計功列或範（積、圖、述）
- **可**：團大與餘
- **可**：發策偏（曆基或功基）
- **可**：影發之規或循需
- **可**：前發速或週時資

## 行

### 一：定發策

擇二主策：

**曆基**（時箱）：
- 定期發（如每 4 週、季）
- 未備之功延次發
- 為用者與下游可料
- 宜：庫、框、有外消之具

**功基**（範驅）：
- 定功備乃發
- 日按範調
- 險：範蔓、無期延
- 宜：內具、首發、大重寫

多計合混：定標日含定範、留 1-2 週緩。緩限未達→延餘功。

記策擇與由。

得：發策有由合案況。

敗：團不能合策→默為曆基含功序列。時箱迫序決。

### 二：定碑

分週為段含標日：

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

常段時：
- **Development**：總 50-70%
- **Stabilization**：總 15-25%
- **RC testing**：總 10-20%

得：碑表含日、時、各段述。

敗：時過迫（穩 < 1 週）→延發或減範。永勿略穩。

### 三：定凍則

定此發之「凍」義：

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

P0 阻發。P1 備則含。P2 延而不延期。

得：凍則記含例程與序功列。

敗：P0 險誤凍→即升。選：延開段、分功為小品、延至點發 (v2.0.1)。

### 四：計候程

定候如何產與試：

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

得：候程記含標規、布法、試清單、升則。

敗：候程略（壓發）→記險。未試發回滾率高。

### 五：定行否清單

立發批前必達之則：

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

得：行否清單明過敗則與決。

敗：會果為否→識阻項、派主、設新標日（常 1-2 週後）、更發計。

### 六：記回滾

定發致產要事時如何回：

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

書全發計於 `RELEASE-PLAN.md` 或 `RELEASE-PLAN-v2.0.0.md`。

得：回滾計記含觸、程、訊版、點發策。完 RELEASE-PLAN.md 已書。

敗：回滾不可（如庫遷已施）→記前修程。每發當有復路。

## 驗

- [ ] 發策（曆/功/混）有由
- [ ] 碑表含諸段日：開、凍、穩、候、發
- [ ] 凍則含許/禁變型
- [ ] 功序列分（P0 必/P1 宜/P2 佳）
- [ ] 候程記：標、布、試、升
- [ ] 行否含明「必過」與「宜過」段
- [ ] 回滾含觸、程、訊版
- [ ] RELEASE-PLAN.md（或等）文已立
- [ ] 時實（穩 ≥ 總 15%）

## 忌

- **無穩段**：直自開至發。即 3 日穩亦捉開時掩之事
- **凍後範蔓**：凍後許「只多一」。凍後加皆重試、引退險
- **忽 P0 險**：P0 險不早升。範早調則時擾少
- **「小」發略候**：即次發益於至少一候。一日候試廉於發後熱修
- **無回滾**：假發必成。每計當答「若敗則何」於發前
- **曆壓越質**：因諾日而發、即敗行否亦發。延發小擾；破發為信失

## 參

- `apply-semantic-versioning` -- 定發版號
- `manage-changelog` -- 養變誌入發注
- `plan-sprint` -- 開段內衝刺計
- `draft-project-charter` -- 案章定發圖與成則
- `generate-status-report` -- 追進對碑
