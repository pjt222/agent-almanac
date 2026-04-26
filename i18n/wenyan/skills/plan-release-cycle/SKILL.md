---
name: plan-release-cycle
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  謀軟體發布週期，含里程碑、功能凍結、候選版、發否之準。
  含曆基與功能基之發布策。始謀大版或小版之發、自隨機發轉結構化、
  跨組件多隊協發、為合規項定質閘、或謀項目首公發（v1.0.0）時用之。
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

# 謀發布週期

謀結構化軟體發布週期：定策（曆基或功能基）、立里程碑與目標日、設功能凍結之準、管候選版、定發否清單、記回滾謀。生 `RELEASE-PLAN.md` 為文，導隊由開發至發布。

## 用時

- 始謀大版或小版之發
- 自隨機發轉結構化發布節奏
- 跨組件多隊協發
- 為合規項定質閘與發布之準
- 謀項目首公發（v1.0.0）

## 入

- **必要**：目標版號（如 v2.0.0）
- **必要**：所欲發布日或發布窗
- **必要**：所謀功能或範圍列（待辦、路線圖、述）
- **可選**：隊大小與可用
- **可選**：發布策之偏（曆基或功能基）
- **可選**：影響發布之合規所需
- **可選**：往發布之速或週期長之數據

## 法

### 第一步：定發布策

於二主策間擇之：

**曆基**（時箱）：
- 依固定時程發（如每 4 週、季）
- 未備之功能延至下發
- 對用者與下游項可預
- 宜：庫、框、含外消費者之具

**功能基**（範圍驅）：
- 待定功能集畢而發
- 日依範圍而調
- 範圍蔓延與無限延誤之險
- 宜：內部具、首發、大重寫

多項宜混：定目標日與範圍，然許 1-2 週緩衝。若至緩衝期未滿範圍，延餘功能。

記策之擇與其因。

得：發布策已記，附與項脈絡相符之因。

敗則：若隊不能合於策，默擇曆基附功能優先列。時箱迫優先之決。

### 第二步：定里程碑

將發布週期分諸相，附目標日：

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

典型相之長：
- **開發**：總週之 50-70%
- **穩定**：總週之 15-25%
- **RC 試**：總週之 10-20%

得：里程碑表，附諸相之日、長、述。

敗則：若時程過密（穩定 < 1 週），延發布日或減範圍。穩定不可略。

### 第三步：設功能凍結之準

定本發布之「功能凍結」何義：

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

P0 功能阻發。P1 功能備則含。P2 功能延而不誤。

得：功能凍結之規記之，附例外程序與分優之功能列。

敗則：若 P0 功能恐誤凍結日，立報之。選：延開發相、分功能為較小可交付者、或延至點發布（v2.0.1）。

### 第四步：謀候選版程序

定候選版如何生與試：

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

得：RC 程序記之，附標籤慣、分發法、試清單、升報之準。

敗則：若 RC 程序被略（發布壓），記其險。未試之發布有較高之回滾機率。

### 第五步：定發否清單

立發布許可前必達之準：

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

得：發否清單，附明確過敗之準與決規。

敗則：若發否會議致 No-Go，識阻項、指主、設新目標日（常 1-2 週後），並更新發布謀。

### 第六步：記回滾謀

定若發布致生產之關鍵問題如何回滾：

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

完整發布謀書於 `RELEASE-PLAN.md` 或 `RELEASE-PLAN-v2.0.0.md`。

得：回滾謀記之，附觸發、程序、通信模板、點發布之策。完整 RELEASE-PLAN.md 已書。

敗則：若回滾不可行（如資料庫遷移已施），記前進修正之程序。每發布皆當有恢復之徑。

## 驗

- [ ] 發布策（曆/功能/混）已記附因
- [ ] 里程碑表含諸相附日：開發、凍結、穩定、RC、發布
- [ ] 功能凍結之準已定，附許/禁變之型
- [ ] 功能優先列已分類（P0 must / P1 should / P2 nice）
- [ ] RC 程序已記：標籤慣、分發、試期、升報
- [ ] 發否清單分「必過」「當過」二節
- [ ] 回滾謀含觸發、程序、通信模板
- [ ] RELEASE-PLAN.md（或等）文已立並存
- [ ] 時程實際（穩定至少佔總週之 15%）

## 陷

- **無穩定相**：自開發直發。即三日穩定亦能捕活躍開發掩之問題。
- **凍結後範圍蔓延**：凍結後許「再一功能」。每凍結後加入皆重置試並引退之險。
- **忽 P0 之險**：P0 功能恐誤時不早報。範圍越早調，時程之擾越少。
- **「小」發布略 RC**：即小發亦受益於至少一 RC。一日 RC 試廉於發後熱修。
- **無回滾謀**：假發布必成。每發布謀當答「若敗如何」於發前。
- **曆壓越質**：因諾於日而發，雖未過發否之準。延發布為小不便；壞發布為信之違。

## 參

- `apply-semantic-versioning` — 定所謀發布之版號
- `manage-changelog` — 維與發布筆記相連之變更記
- `plan-sprint` — 發布週期之開發相內行衝刺謀
- `draft-project-charter` — 項目章可定發布路線圖與成功之準
- `generate-status-report` — 對里程碑追進度
