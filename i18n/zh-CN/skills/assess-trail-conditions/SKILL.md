---
name: assess-trail-conditions
description: >
  评估当前步道状况，包括天气、雪线、过河点、暴露段和步道维护状态，用于安全
  决策。生成 GREEN/YELLOW/RED 安全评级和可操作的行/不行建议。适用于计划
  徒步前一天或当天早晨、旅行规划中评估季节可行性、多日旅行中天气突变后、
  报告显示步道损坏或关闭时，或承诺走一条高山或暴露路线之前。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, hiking, safety, weather, terrain, conditions
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 评估步道状况

在计划的徒步旅行之前或旅行规划中，评估当前步道状况以进行安全决策。

## 适用场景

- 计划徒步的前一天或当天早晨，用于做出行/不行决定
- 旅行规划中评估路线的季节可行性
- 多日旅行中天气突然变化后
- 报告显示步道损坏、关闭或异常危险时
- 承诺走一条高山或暴露路线之前

## 输入

- **必需**：步道名称、区域和大致坐标或航点
- **必需**：计划的徒步日期
- **可选**：步道难度等级（SAC T1-T6）
- **可选**：路线最高海拔
- **可选**：已知危险点（过河点、暴露山脊、冰川）
- **可选**：团队经验水平（影响风险容忍阈值）

## 步骤

### 第 1 步：收集天气数据

从多个来源收集步道海拔范围的天气预报。

```
Weather Data Sources (in preference order):
┌────────────────────────┬──────────────────────────────────────┐
│ Source                 │ Best for                             │
├────────────────────────┼──────────────────────────────────────┤
│ National weather svc   │ Official forecasts with warnings     │
│ (MeteoSwiss, ZAMG,    │                                      │
│ DWD, Meteo-France)    │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Mountain-specific      │ Altitude-stratified forecasts        │
│ forecasts (e.g.,      │ (valley vs. summit conditions)       │
│ bergfex, meteoblue)   │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Avalanche bulletins    │ Snow stability (winter/spring)       │
│ (SLF, EAWS members)  │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Local webcams          │ Real-time visual conditions          │
├────────────────────────┼──────────────────────────────────────┤
│ Recent trip reports    │ On-the-ground observations           │
└────────────────────────┴──────────────────────────────────────┘
```

收集以下数据点：

```
Weather Assessment:
┌─────────────────────┬───────────────┬───────────────────────────┐
│ Parameter           │ Valley        │ Summit/Ridge              │
├─────────────────────┼───────────────┼───────────────────────────┤
│ Temperature (C)     │               │                           │
│ Wind speed (km/h)   │               │                           │
│ Wind gusts (km/h)   │               │                           │
│ Precipitation (mm)  │               │                           │
│ Precipitation type  │               │                           │
│ Visibility (km)     │               │                           │
│ Cloud base (m)      │               │                           │
│ Freezing level (m)  │               │                           │
│ Snow line (m)       │               │                           │
│ Thunderstorm risk   │               │                           │
│ UV index            │               │                           │
└─────────────────────┴───────────────┴───────────────────────────┘
```

**预期结果：** 来自至少 2 个独立来源的天气数据，包含路线最低点和最高点的海拔特定信息。

**失败处理：** 如果特定区域没有详细的山地预报，使用一般预报配合海拔调整：温度每升高 1000 米大约下降 6.5°C，风速随海拔和暴露程度增加。如果预报相互矛盾，按最差预测规划。

### 第 2 步：评估地形状况

评估步道路面、积雪、水文和暴露危险的当前状态。

```
Terrain Condition Factors:
┌──────────────────────┬─────────────────────────────────────────┐
│ Factor               │ Assessment Method                       │
├──────────────────────┼─────────────────────────────────────────┤
│ Snow cover           │ Compare current snow line to route's    │
│                      │ highest point. If route goes above snow │
│                      │ line, assess whether snow gear is       │
│                      │ needed and if the group has it.         │
├──────────────────────┼─────────────────────────────────────────┤
│ Ice                  │ North-facing slopes above freezing      │
│                      │ level may retain ice even in summer.    │
│                      │ Check recent overnight temps.           │
├──────────────────────┼─────────────────────────────────────────┤
│ River/stream         │ Check recent rainfall totals. Rivers    │
│ crossings            │ can be impassable 24-48 hrs after       │
│                      │ heavy rain or during snowmelt peak.     │
├──────────────────────┼─────────────────────────────────────────┤
│ Rockfall zones       │ More active after freeze-thaw cycles    │
│                      │ and rain. Early morning passage is      │
│                      │ safer (frozen in place overnight).      │
├──────────────────────┼─────────────────────────────────────────┤
│ Mud/erosion          │ Recent rain makes steep trails          │
│                      │ slippery and increases fall risk.       │
│                      │ Poles recommended.                      │
├──────────────────────┼─────────────────────────────────────────┤
│ Exposure (ridges,    │ Wind speed determines whether exposed   │
│ cliff paths)         │ sections are safe. Gusts >60 km/h make │
│                      │ exposed ridges dangerous.               │
└──────────────────────┴─────────────────────────────────────────┘
```

地形状况数据来源：
- 近期行程报告（徒步论坛、登山俱乐部网站）
- 小屋管理员报告（致电最近的山间小屋）
- 步道上或附近的摄像头
- 雪崩公报（即使在夏季也包含积雪和地形信息）
- 步道维护部门（国家公园办公室、阿尔卑斯山协会分部）

**预期结果：** 对路线上每个重要危险点的地形评估，基于不超过 48 小时的当前数据。

**失败处理：** 如果当前状况数据不可用（偏远地区、无近期报告），假设状况比该季节的平均水平更差。联系最近的有人值守小屋或山地救援站获取当地知识。

### 第 3 步：评估步道状态

检查计划路线上的关闭、改道和维护问题。

```
Trail Status Sources:
┌────────────────────────┬──────────────────────────────────────┐
│ Source                 │ Information type                     │
├────────────────────────┼──────────────────────────────────────┤
│ Official trail portals │ Closures, diversions, damage reports │
│ (regional/national)   │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ National park websites │ Seasonal closures (wildlife, snow)   │
├────────────────────────┼──────────────────────────────────────┤
│ Hut websites/phones   │ Hut opening dates, path conditions   │
├────────────────────────┼──────────────────────────────────────┤
│ Local tourism offices  │ Recent trail work, event closures    │
├────────────────────────┼──────────────────────────────────────┤
│ Hiking community       │ Unofficial reports, photos, GPX      │
│ (forums, apps)        │ tracks showing actual paths taken     │
└────────────────────────┴──────────────────────────────────────┘
```

检查以下事项：
1. **完全关闭**：步道不可通行或被法律关闭（野生动物保护、施工）
2. **部分关闭**：路段关闭并有官方改道
3. **季节性关闭**：步道尚未为该季节开放（积雪、小屋未配备人员）
4. **损坏报告**：山体滑坡、桥梁冲毁、步道侵蚀
5. **活动影响**：比赛、军事演习、狩猎季节

**预期结果：** 已确认的步道状态（开放、部分关闭、关闭），任何改道已映射并估算了时间影响。

**失败处理：** 如果步道状态无法确认，为潜在改道做计划。携带详细地图（不仅仅是步道应用路线），以便在现场导航替代路线。如果步道被标记为关闭，即使看起来可以通行也要遵守关闭规定。

### 第 4 步：评定安全等级

将所有评估数据合并为一个总体安全评级。

```
Safety Rating Criteria:
┌─────────┬────────────────────────────────────────────────────┐
│ Rating  │ Criteria                                           │
├─────────┼────────────────────────────────────────────────────┤
│ GREEN   │ All of:                                            │
│         │ - Weather forecast stable, no severe warnings      │
│         │ - Trail open with no significant hazards           │
│         │ - Terrain conditions normal for the season         │
│         │ - Route within group's capability                  │
│         │ - Visibility good (>5 km at altitude)              │
├─────────┼────────────────────────────────────────────────────┤
│ YELLOW  │ One or more of:                                    │
│         │ - Afternoon thunderstorm risk (>30%)               │
│         │ - Wind gusts 40-60 km/h on exposed sections        │
│         │ - Trail partially closed (diversion available)     │
│         │ - Snow patches requiring care but no special gear  │
│         │ - Recent rain making terrain slippery              │
│         │ - Route near the group's capability limit          │
│         │ Decision: Proceed with extra caution and backup    │
├─────────┼────────────────────────────────────────────────────┤
│ RED     │ Any of:                                            │
│         │ - Severe weather warning (storm, heavy snow)       │
│         │ - Wind gusts >60 km/h on exposed terrain           │
│         │ - Trail closed (no safe diversion)                 │
│         │ - Snow/ice requiring gear the group lacks          │
│         │ - Visibility <1 km on unmarked/exposed terrain     │
│         │ - River crossings at dangerous water levels        │
│         │ - Avalanche danger level 3+ on route               │
│         │ - Route clearly exceeds group's capability         │
│         │ Decision: Do not proceed. Choose alternative or    │
│         │ postpone.                                          │
└─────────┴────────────────────────────────────────────────────┘
```

对于 YELLOW 评级，定义具体的缓解措施：
- 早出发以赶在下午天气之前
- 如果状况恶化的折返时间
- 需要密切监控的具体路段
- 团队分散时的通信计划

**预期结果：** 一个清晰的 GREEN、YELLOW 或 RED 评级，附有具体理由。YELLOW 评级包含可操作的缓解步骤和定义的中止触发点。

**失败处理：** 如果评估不确定（数据不足无法自信评级），最低按 YELLOW 对待。不确定性应增加谨慎，而非减少谨慎。如果任何单一因素为 RED，无论其他因素如何，总体评级即为 RED。

### 第 5 步：生成状况报告

将评估汇编成一份简洁、可操作的报告。

```
Conditions Report Template:
═══════════════════════════════════════════════
TRAIL CONDITIONS REPORT
───────────────────────────────────────────────
Trail:    [Name / Route Number]
Date:     [Assessment date and time]
Hike date:[Planned date]
Rating:   [GREEN / YELLOW / RED]
───────────────────────────────────────────────

WEATHER SUMMARY
  Valley:  [temp]C, [wind] km/h, [precipitation]
  Summit:  [temp]C, [wind] km/h, [precipitation]
  Outlook: [trend: improving / stable / deteriorating]
  Alerts:  [any active warnings]

TERRAIN CONDITIONS
  Snow line:     [elevation] m ([above/below] route max)
  Trail surface: [dry / wet / muddy / icy / snow-covered]
  Water levels:  [normal / elevated / dangerous]
  Rockfall risk: [low / moderate / high]

TRAIL STATUS
  Status:     [open / partially closed / closed]
  Diversions: [none / details]
  Known issues:[list any damage or hazards]

RECOMMENDATIONS
  [Specific actions based on rating:]
  - [e.g., Start by 06:00 to clear ridge before noon]
  - [e.g., Carry microspikes for north-facing traverse]
  - [e.g., Turnaround by 13:00 if clouds build]

DECISION
  [GO / GO WITH CAUTION / NO-GO]
  [Reasoning in 1-2 sentences]
═══════════════════════════════════════════════
```

**预期结果：** 一份完整的、标注日期的状况报告，使知情的行/不行决定成为可能。报告应可与所有团队成员共享，且无需额外上下文即可理解。

**失败处理：** 如果报告无法完成（例如关键数据不可用），说明什么是未知的以及它如何影响决定。一份承认有缺口的不完整评估比虚假的确定感更安全。

## 验证清单

- [ ] 从至少 2 个独立来源收集了天气数据
- [ ] 获取了海拔特定的预报（不仅仅是山谷天气）
- [ ] 评估了路线上所有关键危险点的地形状况
- [ ] 验证了步道状态（开放/关闭/改道）
- [ ] 分配了安全评级并附有明确理由
- [ ] 为 YELLOW 评级定义了缓解措施
- [ ] 状况报告完整且标注了日期
- [ ] 报告已与所有团队成员共享
- [ ] 出发时评估不超过 24 小时

## 常见问题

- **山谷天气偏差**：山谷晴空对海拔处毫无意义。始终检查山顶级预报；1000 米以上的条件可能截然不同
- **过时数据**：3 天前的报告不可靠。山地条件变化迅速。在徒步当天早晨重新评估
- **乐观偏差**：想要走计划路线的愿望使人合理化边际条件。如果你必须为出发辩护，条件可能不够好
- **单源依赖**：一个预报可能是错误的。至少交叉检查两个来源，并将本地/山地特定来源的权重高于一般来源
- **忽视趋势**：当前条件可能可接受但在恶化。恶化趋势需要比快照暗示的更多谨慎
- **社交压力压倒判断**：永远不要因为团队热情高涨或因为你开了很远的车而继续前进。山下周还在那里；你可能不在了
- **雪线误算**：报告的雪线是平均值。朝北的斜面可以在报告线以下 200-500 米保持积雪

## 相关技能

- `plan-hiking-tour` — 使用本评估作为安全评估步骤的输入
- `check-hiking-gear` — 基于评估的状况调整装备（添加冰爪、额外保暖层）
- `plan-tour-route` — 更广泛旅行规划中的步道状况意识
- `create-spatial-visualization` — 在地图叠加层上可视化危险区域
