---
name: conduct-post-mortem
description: >
  インシデント後にブレームレスなポストモーテム分析を実施する。タイムラインの再構築、
  寄与要因の特定、アクション可能な改善策の生成を行う。個人への責任追及ではなく
  システム上の問題に焦点を当てる。本番インシデントやサービス劣化の後、ニアミスの後、
  繰り返し発生する問題を調査するとき、またはチーム間でシステム上の学びを共有する
  ときに使用する。
locale: ja
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
  complexity: basic
  language: multi
  tags: post-mortem, incident-review, blameless, timeline, action-items
---

# ポストモーテムの実施

インシデントから学び、システムの回復力を向上させるためにブレームレスなポストモーテムを主導する。

## 使用タイミング

- 本番インシデントやサービス劣化の後
- ニアミスや危機的な状況の後
- 繰り返し発生する問題を調査するとき
- チーム間で学びを共有するとき

## 入力

- **必須**: インシデントの詳細（開始/終了時刻、影響を受けたサービス、重大度）
- **必須**: インシデントウィンドウ中のログ、メトリクス、アラートへのアクセス
- **任意**: インシデント対応中に使用したランブック
- **任意**: コミュニケーションログ（Slack、PagerDuty）

## 手順

### ステップ1: 生データを収集する

インシデントからすべてのアーティファクトを収集する：

```bash
# Export relevant logs (adjust timerange)
kubectl logs deployment/api-service \
  --since-time="2025-02-09T10:00:00Z" \
  --until-time="2025-02-09T11:30:00Z" > incident-logs.txt

# Export Prometheus metrics snapshot
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=rate(http_requests_total{job="api"}[5m])' \
  --data-urlencode 'start=2025-02-09T10:00:00Z' \
  --data-urlencode 'end=2025-02-09T11:30:00Z' \
  --data-urlencode 'step=15s' > metrics.json

# Export alert history
amtool alert query --within=2h alertname="HighErrorRate" --output json > alerts.json
```

**期待結果：** 完全なインシデントタイムラインをカバーするログ、メトリクス、アラート。

**失敗時：** データが不完全な場合は、レポートにギャップを記録する。次回のために長い保持期間を設定する。

### ステップ2: タイムラインを構築する

時系列の再構築を作成する：

```markdown
## Timeline (all times UTC)

| Time     | Event | Source | Actor |
|----------|-------|--------|-------|
| 10:05:23 | First 5xx errors appear | nginx access logs | - |
| 10:06:45 | High error rate alert fires | Prometheus | - |
| 10:08:12 | On-call engineer paged | PagerDuty | System |
| 10:12:00 | Engineer acknowledges alert | PagerDuty | @alice |
| 10:15:30 | Database connection pool exhausted | app logs | - |
| 10:18:45 | Database queries identified as slow | pganalyze | @alice |
| 10:22:10 | Cache layer deployed as mitigation | kubectl | @alice |
| 10:35:00 | Error rate returns to normal | Prometheus | - |
| 10:40:00 | Incident marked resolved | PagerDuty | @alice |
```

**期待結果：** 何がいつ起きたかを示す明確な分単位のシーケンス。

**失敗時：** タイムスタンプの不一致。すべてのシステムがNTPを使用し、UTCでログを記録していることを確認する。

### ステップ3: 寄与要因を特定する

Five WhysまたはFishbone分析を使用する：

```markdown
## Contributing Factors

### Immediate Cause
- Database connection pool exhausted (max 20 connections)
- Query introduced in v2.3.0 deployment lacked index

### Contributing Factors
1. **Monitoring Gap**: Connection pool utilization not monitored
2. **Testing Gap**: Load testing didn't include new query pattern
3. **Runbook Gap**: No documented procedure for DB connection issues
4. **Capacity Planning**: Pool size unchanged despite 3x traffic growth

### Systemic Issues
- No pre-deployment query plan review
- Database alerts only fire on total failure, not degradation
```

**期待結果：** 複数の層の因果関係が特定され、責任追及が回避される。

**失敗時：** 分析が「エンジニアがミスをした」で止まる場合は、さらに深く掘り下げる。そのミスを可能にしたのは何か？

### ステップ4: アクションアイテムを生成する

具体的で追跡可能な改善策を作成する：

```markdown
## Action Items

| ID | Action | Owner | Deadline | Priority |
|----|--------|-------|----------|----------|
| AI-001 | Add connection pool metrics to Grafana | @bob | 2025-02-16 | High |
| AI-002 | Create runbook: DB connection saturation | @alice | 2025-02-20 | High |
| AI-003 | Add DB query plan check to CI/CD | @charlie | 2025-03-01 | Medium |
| AI-004 | Review and adjust connection pool size | @dan | 2025-02-14 | High |
| AI-005 | Implement DB slow query alerts (<100ms) | @bob | 2025-02-23 | Medium |
| AI-006 | Add load testing for new query patterns | @charlie | 2025-03-15 | Low |
```

**期待結果：** 各アクションに担当者、期限、明確な成果物がある。

**失敗時：** 「テストを改善する」のような曖昧なアクションは実行されない。具体的にする。

### ステップ5: レポートを作成して配布する

このテンプレート構造を使用する：

```markdown
# Post-Mortem: API Service Degradation (2025-02-09)

**Date**: 2025-02-09
**Duration**: 1h 35min (10:05 - 11:40 UTC)
**Severity**: P1 (Critical service degraded)
**Authors**: @alice, @bob
**Reviewed**: 2025-02-10

## Summary
The API service experienced elevated error rates (40% of requests) due to
database connection pool exhaustion. Service was restored by deploying a
cache layer. No data loss occurred.

## Impact
- 40,000 failed requests over 1.5 hours
- 2,000 customers affected
- Revenue impact: ~$5,000 (estimated)

## Root Cause
Query introduced in v2.3.0 deployment performed a full table scan due to
missing index. Under increased load, this saturated the connection pool.

[... timeline, contributing factors, action items as above ...]

## What Went Well
- Alert fired within 90 seconds of first errors
- Mitigation deployed quickly (10 minutes from page to fix)
- Communication to customers was clear and timely

## Lessons Learned
- Database monitoring is insufficient; need connection-level metrics
- Load testing must cover new query patterns, not just volume
- Connection pool sizing hasn't kept pace with traffic growth

## Prevention
See Action Items above.
```

**期待結果：** インシデントから48時間以内にチームとステークホルダーにレポートが共有される。

**失敗時：** レポートの遅れが1週間を超える場合、洞察が古くなる。ポストモーテムを優先する。

### ステップ6: スタンドアップ/レトロでアクションアイテムをレビューする

アクションアイテムの進捗を追跡する：

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**期待結果：** アクションアイテムがプロジェクト管理ツールで追跡され、週次でレビューされる。

**失敗時：** アクションアイテムが放置されると、インシデントが再発する。優先度の高いアイテムにはエグゼクティブスポンサーを割り当てる。

## バリデーション

- [ ] タイムラインが完全で時系列的に正確
- [ ] 複数の寄与要因が特定されている（1つだけでない）
- [ ] アクションアイテムに担当者、期限、優先度がある
- [ ] レポートがブレームレスな言語を使用している（「Xが問題を引き起こした」という表現がない）
- [ ] レポートが48時間以内にすべてのステークホルダーに配布された
- [ ] アクションアイテムがチケットシステムで追跡されている
- [ ] 4週間後のフォローアップレビューがスケジュールされている

## よくある落とし穴

- **責任追及文化**: 「誰が」という言語を「何が/なぜ」の代わりに使用する。人ではなくシステムに焦点を当てる。
- **浅い分析**: 最初の原因で止まる。常に少なくとも5回「なぜ」を問う。
- **曖昧なアクションアイテム**: 「モニタリングを改善する」はアクション可能でない。「Z日までにダッシュボードYにメトリクスXを追加する」はアクション可能。
- **フォローアップなし**: アクションアイテムが作成されたがレビューされない。カレンダーのリマインダーを設定する。
- **透明性の欠如**: インシデントを隠すと学習が減る。（適切なセキュリティ境界内で）広く共有する。

## 関連スキル

- `write-incident-runbook` - インシデント中に参照されるランブックを作成する
- `configure-alerting-rules` - ポストモーテムの知見に基づいてアラートを改善する
