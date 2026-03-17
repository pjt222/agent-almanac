---
name: setup-prometheus-monitoring
description: >
  配置 Prometheus 进行时间序列指标收集，包括抓取配置、服务发现、
  记录规则以及多集群部署的联邦模式。适用于为微服务搭建集中式指标收集、
  对应用和基础设施实施时序监控、建立 SLO/SLI 追踪与告警基础，
  或将遗留监控方案迁移至现代可观测性栈。
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
  tags: prometheus, monitoring, metrics, scrape, recording-rules
---

# Setup Prometheus Monitoring

配置生产就绪的 Prometheus 部署，包含抓取目标、记录规则和联邦配置。

## 适用场景

- 为微服务或分布式系统搭建集中式指标收集
- 对应用和基础设施指标实施时序监控
- 建立 SLO/SLI 追踪与告警基础
- 通过联邦汇聚多个 Prometheus 实例的指标
- 将遗留监控方案迁移到现代可观测性栈

## 输入

- **必填**：抓取目标列表（服务、导出器、端点）
- **必填**：保留期限和存储需求
- **可选**：现有服务发现机制（Kubernetes、Consul、EC2）
- **可选**：用于预聚合指标的记录规则
- **可选**：多集群环境的联邦层级

## 步骤

### 第 1 步：安装和配置 Prometheus

使用全局设置和抓取间隔创建 Prometheus 基础配置。

```bash
# 创建 Prometheus 目录结构
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

# 下载 Prometheus（按需调整版本）
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

创建 `/etc/prometheus/prometheus.yml`：

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanager 配置
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# 加载记录规则和告警规则
rule_files:
  - "rules/*.yml"

# 抓取配置
scrape_configs:
  # Prometheus 自监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  # 主机指标的 Node exporter
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

  # 基于文件的服务发现的应用指标
  - job_name: 'app-services'
    file_sd_configs:
      - files:
          - '/etc/prometheus/file_sd/services.json'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [env]
        target_label: environment
```

**预期结果：** Prometheus 成功启动，Web UI 可在 `http://localhost:9090` 访问，目标列表在"状态 > 目标"下显示。

**失败处理：**
- 使用 `promtool check config /etc/prometheus/prometheus.yml` 检查语法
- 验证文件权限：`sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- 查看日志：`journalctl -u prometheus -f`

### 第 2 步：配置服务发现

设置动态目标发现，避免手动管理目标。

对于 **Kubernetes** 环境，在 `scrape_configs` 中添加：

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # 仅抓取带有 prometheus.io/scrape 注解的 Pod
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # 如果指定了自定义端口，则使用该端口
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      # 将命名空间添加为标签
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      # 将 Pod 名称添加为标签
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

对于**基于文件**的服务发现，创建 `/etc/prometheus/file_sd/services.json`：

```json
[
  {
    "targets": ["web-app-1:8080", "web-app-2:8080"],
    "labels": {
      "job": "web-app",
      "env": "production",
      "team": "platform"
    }
  },
  {
    "targets": ["api-service-1:9090", "api-service-2:9090"],
    "labels": {
      "job": "api-service",
      "env": "production",
      "team": "backend"
    }
  }
]
```

对于 **Consul** 服务发现：

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []  # 空列表表示发现所有服务
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

**预期结果：** Prometheus UI 中出现动态目标，服务扩缩或变更时自动更新。

**失败处理：**
- Kubernetes：使用 `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus` 验证 RBAC 权限
- 文件服务发现：使用 `python -m json.tool /etc/prometheus/file_sd/services.json` 验证 JSON 语法
- Consul：使用 `curl http://consul.example.com:8500/v1/catalog/services` 测试连通性

### 第 3 步：创建记录规则

预聚合耗时查询，提升仪表板性能和告警效率。

创建 `/etc/prometheus/rules/recording_rules.yml`：

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      # 计算每个端点的请求速率（5 分钟窗口）
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      # 计算错误率百分比
      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

      # 按端点统计 P95 延迟
      - record: job:http_request_duration_seconds:p95
        expr: |
          histogram_quantile(0.95,
            sum by (job, endpoint, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )

  - name: resource_aggregations
    interval: 1m
    rules:
      # 按实例统计 CPU 使用率
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # 内存使用率百分比
      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      # 按挂载点统计磁盘使用率
      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

验证并重新加载：

```bash
# 验证规则语法
promtool check rules /etc/prometheus/rules/recording_rules.yml

# 重新加载 Prometheus 配置（无需重启）
curl -X POST http://localhost:9090/-/reload

# 或发送 SIGHUP 信号
sudo killall -HUP prometheus
```

**预期结果：** 记录规则成功评估，带 `job:` 前缀的新指标在 Prometheus 中可见，仪表板查询性能提升。

**失败处理：**
- 使用 `promtool check rules` 检查规则语法
- 验证评估间隔与数据可用性是否匹配
- 检查缺失的源指标：`curl http://localhost:9090/api/v1/targets`
- 查看评估错误日志：`journalctl -u prometheus | grep -i error`

### 第 4 步：配置存储和保留

针对保留需求和查询性能优化存储。

编辑 `/etc/systemd/system/prometheus.service`：

```ini
[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --storage.tsdb.retention.time=30d \
  --storage.tsdb.retention.size=50GB \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=:9090 \
  --web.enable-lifecycle \
  --web.enable-admin-api

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

关键存储标志：
- `--storage.tsdb.retention.time=30d`：保留 30 天数据
- `--storage.tsdb.retention.size=50GB`：将存储限制在 50GB（以先触发的限制为准）
- `--storage.tsdb.wal-compression`：启用 WAL 压缩（减少磁盘 I/O）
- `--web.enable-lifecycle`：允许通过 HTTP POST 重新加载配置
- `--web.enable-admin-api`：启用快照和删除 API

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**预期结果：** Prometheus 按策略保留指标，磁盘使用在限制范围内，旧数据自动清理。

**失败处理：**
- 监控磁盘使用：`du -sh /var/lib/prometheus`
- 查看 TSDB 统计：`curl http://localhost:9090/api/v1/status/tsdb`
- 验证保留设置：`curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- 强制清理：`curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### 第 5 步：设置联邦（多集群）

配置层级化 Prometheus 以聚合多集群指标。

在**边缘 Prometheus** 实例（每个集群中）确保设置外部标签：

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

在**中央 Prometheus** 实例中添加联邦抓取配置：

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        # 仅聚合预计算的记录规则
        - '{__name__=~"job:.*"}'
        # 包含告警状态
        - '{__name__=~"ALERTS.*"}'
        # 包含关键基础设施指标
        - 'up{job=~".*"}'
    static_configs:
      - targets:
          - 'prometheus-east.example.com:9090'
          - 'prometheus-west.example.com:9090'
        labels:
          env: 'production'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [__address__]
        regex: 'prometheus-(.*).example.com.*'
        target_label: cluster
        replacement: '$1'
```

联邦最佳实践：
- 使用 `honor_labels: true` 保留原始标签
- 仅联邦记录规则和聚合（不联邦原始指标）
- 设置合适的抓取间隔（长于边缘 Prometheus 的评估间隔）
- 使用 `match[]` 过滤指标（避免联邦所有内容）

**预期结果：** 中央 Prometheus 显示来自所有集群的联邦指标，查询可跨越多个区域，数据重复最小化。

**失败处理：**
- 验证联邦端点可访问性：`curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- 检查标签冲突（中央与边缘外部标签）
- 监控联邦延迟：比较时间戳差异
- 检查匹配模式：`curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### 第 6 步：实现高可用（可选）

部署具有相同配置的冗余 Prometheus 实例以实现故障转移。

使用 **Thanos** 或 **Cortex** 实现真正的高可用，或使用简单的负载均衡设置：

```yaml
# prometheus-1.yml 和 prometheus-2.yml（配置相同）
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'  # 每个实例不同
    replica: 'A'

# 每个实例使用 --web.external-url 标志
# prometheus-1: --web.external-url=http://prometheus-1.example.com:9090
# prometheus-2: --web.external-url=http://prometheus-2.example.com:9090
```

配置 Grafana 以查询两个实例：

```json
{
  "name": "Prometheus-HA",
  "type": "prometheus",
  "url": "http://prometheus-lb.example.com",
  "jsonData": {
    "httpMethod": "POST",
    "timeInterval": "15s"
  }
}
```

使用 HAProxy 或 nginx 进行负载均衡：

```nginx
upstream prometheus_backend {
    server prometheus-1.example.com:9090 max_fails=3 fail_timeout=30s;
    server prometheus-2.example.com:9090 max_fails=3 fail_timeout=30s;
}

server {
    listen 9090;
    location / {
        proxy_pass http://prometheus_backend;
        proxy_set_header Host $host;
    }
}
```

**预期结果：** 请求在实例间均衡分发，某个实例宕机时自动故障转移，单实例故障时无数据丢失。

**失败处理：**
- 验证两个实例是否抓取相同目标（轻微时间偏差可接受）
- 检查实例间的配置漂移
- 监控查询中的重复（Grafana 显示重复序列）
- 检查负载均衡器健康检查

## 验证清单

- [ ] Prometheus Web UI 可在预期端点访问
- [ ] 所有配置的抓取目标在"状态 > 目标"中显示为 UP
- [ ] 服务发现按预期动态添加/移除目标
- [ ] 记录规则成功评估（日志中无错误）
- [ ] 指标保留符合配置的时间/大小限制
- [ ] 联邦（如已配置）从边缘实例拉取指标
- [ ] 查询返回预期的指标基数（无过高基数）
- [ ] 磁盘使用稳定且在分配的存储预算内
- [ ] 配置重新加载可通过 HTTP 端点或 SIGHUP 正常工作
- [ ] Prometheus 自监控指标可用（up、scrape duration 等）

## 常见问题

- **高基数指标**：避免使用无界值（用户 ID、时间戳、UUID）作为标签。存储前使用记录规则聚合。
- **抓取间隔不匹配**：记录规则的评估间隔应等于或大于抓取间隔，以避免数据缺口。
- **联邦过载**：联邦所有指标会产生大量数据重复。仅联邦聚合后的记录规则。
- **缺少重新标记配置**：没有适当的重新标记，服务发现可能产生混乱或重复的标签。
- **保留期过短**：保留期设置要长于仪表板中最长的时间窗口，以避免出现"无数据"缺口。
- **无资源限制**：高基数情况下 Prometheus 可能消耗过多内存。设置 `--storage.tsdb.max-block-duration` 并监控堆使用情况。
- **禁用生命周期端点**：没有 `--web.enable-lifecycle`，配置重新加载需要完全重启，导致抓取缺口。

## 相关技能

- `configure-alerting-rules` — 基于 Prometheus 指标定义告警规则并路由到 Alertmanager
- `build-grafana-dashboards` — 使用 Grafana 仪表板和面板可视化 Prometheus 指标
- `define-slo-sli-sla` — 使用 Prometheus 记录规则和错误预算追踪建立 SLO/SLI 目标
- `instrument-distributed-tracing` — 通过分布式追踪补充指标，实现更深层的可观测性
