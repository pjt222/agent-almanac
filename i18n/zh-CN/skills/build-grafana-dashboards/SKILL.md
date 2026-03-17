---
name: build-grafana-dashboards
description: >
  创建生产级 Grafana 仪表板，包含可复用面板、模板变量、注解及版本控制部署的预置配置。
  适用于为 Prometheus、Loki 等数据源创建可视化图表、为 SRE 团队构建运营仪表板、
  将手动创建的仪表板迁移到版本控制的预置方案，或建立面向管理层的 SLO 合规报告。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: grafana, dashboards, visualization, panels, provisioning
---

# Build Grafana Dashboards

按照可维护性、可复用性和版本控制最佳实践，设计并部署 Grafana 仪表板。

## 适用场景

- 为 Prometheus、Loki 或其他数据源的指标创建可视化图表
- 为 SRE 团队和事故响应人员构建运营仪表板
- 为管理层建立 SLO 合规报告仪表板
- 将仪表板从手动创建迁移到版本控制的预置方案
- 使用模板变量跨团队标准化仪表板布局
- 创建从高层概览到详细指标的下钻体验

## 输入

- **必填**：数据源配置（Prometheus、Loki、Tempo 等）
- **必填**：待可视化的指标或日志及其查询模式
- **可选**：用于多服务或多环境视图的模板变量
- **可选**：用于迁移或修改的现有仪表板 JSON
- **可选**：用于事件关联的注解查询（部署、事故）

## 步骤

> 完整配置文件和模板请参阅 [Extended Examples](references/EXAMPLES.md)。

### 第 1 步：设计仪表板结构

在构建面板之前，规划仪表板布局和组织方式。

创建仪表板规格文档：

```markdown
# Service Overview Dashboard

## Purpose
Real-time operational view for on-call engineers monitoring the API service.

## Rows
1. High-Level Metrics (collapsed by default)
   - Request rate, error rate, latency (RED metrics)
   - Service uptime, instance count
2. Detailed Metrics (expanded by default)
   - Per-endpoint latency breakdown
   - Error rate by status code
   - Database connection pool status
3. Resource Utilization
   - CPU, memory, disk usage per instance
   - Network I/O rates
4. Logs (collapsed by default)
   - Recent errors from Loki
   - Alert firing history

## Variables
- `environment`: production, staging, development
- `instance`: all instances or specific instance selection
- `interval`: aggregation window (5m, 15m, 1h)

## Annotations
- Deployment events from CI/CD system
- Alert firing/resolving events
```

关键设计原则：
- **最重要的指标优先**：关键指标置顶，详细信息居后
- **一致的时间范围**：所有面板时间同步
- **下钻路径**：从高层仪表板链接到详细仪表板
- **响应式布局**：使用适应不同屏幕的行和面板宽度

**预期结果：** 仪表板结构文档清晰，利益相关方就指标和布局优先级达成一致。

**失败处理：**
- 与最终用户（SRE、开发人员）开展仪表板设计评审
- 对照行业标准进行基准测试（USE 方法、RED 方法、Four Golden Signals）
- 查看团队现有仪表板的一致性模式

### 第 2 步：创建带模板变量的仪表板

以可复用变量为基础构建仪表板，用于过滤。

创建仪表板 JSON 结构（或使用 UI 后导出）：

```json
{
  "dashboard": {
    "title": "API Service Overview",
    "uid": "api-service-overview",
    "version": 1,
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\"}, environment)",
          "multi": false,
          "includeAll": false,
          "refresh": 1,
          "sort": 1,
          "current": {
            "selected": false,
            "text": "production",
            "value": "production"
          }
        },
        {
          "name": "instance",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\",environment=\"$environment\"}, instance)",
          "multi": true,
          "includeAll": true,
          "refresh": 1,
          "allValue": ".*",
          "current": {
            "selected": true,
            "text": "All",
            "value": "$__all"
          }
        },
        {
          "name": "interval",
          "type": "interval",
          "options": [
            {"text": "1m", "value": "1m"},
            {"text": "5m", "value": "5m"},
            {"text": "15m", "value": "15m"},
            {"text": "1h", "value": "1h"}
          ],
          "current": {
            "text": "5m",
            "value": "5m"
          },
          "auto": false
        }
      ]
    },
    "annotations": {
      "list": [
        {
          "name": "Deployments",
          "datasource": "Prometheus",
          "enable": true,
          "expr": "changes(app_version{job=\"api-service\",environment=\"$environment\"}[5m]) > 0",
          "step": "60s",
          "iconColor": "rgba(0, 211, 255, 1)",
          "tagKeys": "version"
        }
      ]
    }
  }
}
```

变量类型及使用场景：
- **查询变量**：来自数据源的动态列表（`label_values()`、`query_result()`）
- **区间变量**：查询的聚合窗口
- **自定义变量**：非指标选项的静态列表
- **常量变量**：面板间共享值（数据源名称、阈值）
- **文本框变量**：自由格式输入过滤条件

**预期结果：** 变量从数据源正确填充，级联过滤有效（环境过滤实例），默认选项合适。

**失败处理：**
- 在 Prometheus UI 中独立测试变量查询
- 检查循环依赖（变量 A 依赖 B，B 又依赖 A）
- 验证多选变量 `allValue` 字段的正则表达式
- 检查变量刷新设置（仪表板加载时 vs 时间范围变更时）

### 第 3 步：构建可视化面板

为各指标创建采用合适可视化类型的面板。

**时间序列面板**（请求速率）：

```json
{
  "type": "timeseries",
  "title": "Request Rate",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{job=\"api-service\",environment=\"$environment\",instance=~\"$instance\"}[$interval])) by (method)",
      "legendFormat": "{{method}}",
      "refId": "A"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth",
        "fillOpacity": 10,
        "spanNulls": true
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1000, "color": "yellow"},
          {"value": 5000, "color": "red"}
        ]
      }
    }
  },
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "desc"
    },
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "calcs": ["mean", "max", "last"]
    }
  }
}
```

**统计面板**（错误率）：

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**热力图面板**（延迟分布）：

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

面板选择指南：
- **时间序列**：随时间变化的趋势（速率、计数、持续时间）
- **统计**：带阈值着色的单个当前值
- **仪表盘**：百分比值（CPU、内存、磁盘使用率）
- **条形仪表盘**：在某一时间点比较多个值
- **热力图**：随时间变化的值分布（延迟百分位数）
- **表格**：多个指标的详细分解
- **日志**：来自 Loki 的原始日志行（带过滤）

**预期结果：** 面板正确渲染数据，可视化类型匹配指标类型，图例描述清晰，阈值高亮显示问题。

**失败处理：**
- 在 Explore 视图中使用相同时间范围和变量测试查询
- 检查指标名称拼写错误或标签过滤器不正确
- 验证聚合函数与指标类型匹配（计数器用 rate，仪表盘用 avg）
- 检查单位配置（字节、秒、每秒请求数）
- 启用"Show query inspector"调试空结果

### 第 4 步：配置行和布局

将面板组织成可折叠的行，便于逻辑分组。

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

布局最佳实践：
- 网格宽度为 24 个单位，每个面板指定 `w`（宽度）和 `h`（高度）
- 使用行对相关面板分组，默认折叠不太关键的部分
- 将最关键的指标放在首个可见区域（y=0-8）
- 保持行内面板高度一致（通常为 4、8 或 12 个单位）
- 时间序列使用全宽（24），对比使用半宽（12）

**预期结果：** 仪表板布局逻辑清晰，行可正确折叠/展开，面板视觉对齐无间隙。

**失败处理：**
- 验证 gridPos 坐标不重叠
- 检查行面板数组包含面板（非 null）
- 验证 y 坐标沿页面方向递增
- 使用 Grafana UI 的"Edit JSON"检查网格位置

### 第 5 步：添加链接和下钻

在相关仪表板之间创建导航路径。

JSON 中的仪表板级链接：

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

面板级数据链接：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

链接变量：
- `$service`、`$environment`：仪表板模板变量
- `${__field.labels.instance}`：点击数据点的标签值
- `${__from}`、`${__to}`：当前仪表板时间范围
- `$__url_time_range`：URL 编码的时间范围

**预期结果：** 点击面板元素或仪表板链接后，导航到相关视图并保留上下文（时间范围、变量）。

**失败处理：**
- 对查询参数中的特殊字符进行 URL 编码
- 测试各种变量选择下的链接（All vs 特定值）
- 验证目标仪表板 UID 存在且可访问
- 检查 `includeVars` 和 `keepTime` 标志是否按预期工作

### 第 6 步：设置仪表板预置

将仪表板版本控制为代码，实现可重现部署。

创建预置目录结构：

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

数据源预置（`/etc/grafana/provisioning/datasources/prometheus.yml`）：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

仪表板预置（`/etc/grafana/provisioning/dashboards/default.yml`）：

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Services'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

将仪表板 JSON 文件存储在 `/var/lib/grafana/dashboards/` 中：

```bash
/var/lib/grafana/dashboards/
├── api-service/
│   ├── overview.json
│   └── details.json
├── database/
│   └── postgres.json
└── infrastructure/
    ├── nodes.json
    └── kubernetes.json
```

使用 Docker Compose：

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

**预期结果：** Grafana 启动时自动加载仪表板，JSON 文件更改在更新间隔后反映，版本控制追踪仪表板变更。

**失败处理：**
- 检查 Grafana 日志：`docker logs grafana | grep -i provisioning`
- 验证 JSON 语法：`python -m json.tool dashboard.json`
- 确保 Grafana 有读取权限：`chmod 644 *.json`
- 使用 `allowUiUpdates: false` 测试以防止 UI 修改
- 验证预置配置：`curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## 验证清单

- [ ] 仪表板在 Grafana UI 中无错误加载
- [ ] 所有模板变量填充了预期值
- [ ] 变量级联有效（选择环境过滤实例）
- [ ] 面板显示配置时间范围内的数据
- [ ] 面板查询正确使用变量（无硬编码值）
- [ ] 阈值适当高亮显示问题状态
- [ ] 图例格式描述清晰，不杂乱
- [ ] 注解在相关事件时显示
- [ ] 链接导航到正确的仪表板并保留上下文
- [ ] 仪表板从 JSON 文件预置（版本控制）
- [ ] 响应式布局在不同屏幕尺寸下有效
- [ ] 工具提示和悬停交互提供有用上下文

## 常见问题

- **变量不更新面板**：确保查询使用 `$variable` 语法，不含硬编码值。检查变量刷新设置。
- **查询正确但面板为空**：验证时间范围包含数据点。检查抓取间隔与聚合窗口（5m rate 需要超过 5m 的数据）。
- **图例过于冗长**：使用 `legendFormat` 只显示相关标签，而非完整指标名称。示例：`{{method}} - {{status}}` 而非默认值。
- **时间范围不一致**：设置仪表板时间同步，使所有面板共享同一时间窗口。使用"Sync cursor"进行关联调查。
- **性能问题**：避免返回高基数序列（>1000）的查询。使用记录规则或预聚合。限制高代价查询的时间范围。
- **仪表板漂移**：不使用预置时，手动 UI 更改会产生版本控制冲突。在生产环境中使用 `allowUiUpdates: false`。
- **缺少数据链接**：数据链接需要精确的标签名称。谨慎使用 `${__field.labels.labelname}`，验证标签存在于查询结果中。
- **注解过多**：过多注解会使视图杂乱。按重要性过滤注解或使用单独的注解轨道。

## 相关技能

- `setup-prometheus-monitoring` - 配置为 Grafana 仪表板提供数据的 Prometheus 数据源
- `configure-log-aggregation` - 设置 Loki 用于日志面板查询和基于日志的注解
- `define-slo-sli-sla` - 使用 Grafana 统计和仪表盘面板可视化 SLO 合规性和错误预算
- `instrument-distributed-tracing` - 从指标面板添加追踪 ID 链接到 Tempo 追踪视图
